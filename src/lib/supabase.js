// Supabase client + storage + error surface.
// The database is the ONLY source of truth. There is no localStorage fallback
// for domain data: if Supabase is not configured, SetupGate blocks the app
// with setup instructions instead of running on mock data.
import { createClient } from '@supabase/supabase-js';
import { ALLOWED_SUBMISSION_TYPES, MAX_SUBMISSION_BYTES } from './lms';

// Env values are pasted by hand into .env or a hosting dashboard, where a stray
// trailing newline, space or wrapping quote is easy to introduce. Any of them
// makes every fetch throw "TypeError: Failed to fetch" — which surfaces as a
// generic "Network error" — while isSupabaseConfigured() still reports true, so
// SetupGate waves the app through and the whole site silently fails. Normalize.
const cleanEnv = (v) => String(v ?? '').trim().replace(/^["']|["']$/g, '').trim();

// Exported so backendHealth.js normalizes identically — diagnostics that probed
// a different URL than the client uses would be actively misleading.
export { cleanEnv };

const SUPABASE_URL = cleanEnv(import.meta.env?.VITE_SUPABASE_URL);
const SUPABASE_ANON_KEY = cleanEnv(import.meta.env?.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Shared client (null when unconfigured — SetupGate prevents reaching here). */
export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export function requireSb() {
  if (!supabase) throw new Error('Backend not configured. The administrator must set up Supabase first.');
  return supabase;
}

// ---------- User-safe errors (never leak DB internals/keys) ----------
export function friendlyError(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return fallback;
  const msg = String(err.message || '');
  const code = String(err.code || '');
  if (import.meta.env?.DEV) console.error('[store]', code, msg, err.details || '', err.hint || '');
  // SQL RAISE EXCEPTION messages are author-written and safe to display.
  if (code === 'P0001') return msg || fallback;
  if (code === 'PGRST116') return 'Not found';
  if (code === '23505') {
    if (/review/i.test(msg)) return 'You already reviewed this course';
    if (/coupon/i.test(msg)) return 'That coupon code already exists';
    if (/enrollment/i.test(msg)) return 'Already enrolled in this course';
    return 'This already exists';
  }
  if (code === '23503') return 'Related record not found. Please refresh and retry.';
  if (code === '23514') return 'Invalid value. Please check your input.';
  if (code === '22P02') return 'Invalid ID. Please refresh and retry.';
  if (code === '42501' || /permission denied/i.test(msg) || /violates row-level security/i.test(msg)) {
    return 'You do not have permission to do that.';
  }
  if (/jwt expired|invalid jwt|token expired/i.test(msg)) return 'Session expired. Please log in again.';
  if (/Failed to fetch|NetworkError|network request failed/i.test(msg)) {
    // This fires for a paused project, a mistyped URL, a CORS block or a dead
    // network — all indistinguishable to the browser. Point at the page that
    // tells them apart instead of blaming the visitor's connection.
    return 'Cannot reach the database. Check your connection — if it persists, open /backend-status for diagnostics.';
  }
  // Storage-specific failures (receipt uploads, thumbnails, submissions).
  if (/the resource already exists|duplicate key/i.test(msg)) return 'That file already exists. Rename it and try again.';
  if (/payload too large|entity too large|exceeded the maximum allowed size/i.test(msg)) return 'The file is too large to upload. Use a smaller file.';
  if (/bucket not found/i.test(msg)) return 'File storage is not set up yet. Please contact support.';
  if (/object not found|not found in storage/i.test(msg)) return 'The file could not be found. It may have been removed.';
  if (/unauthorized|invalid api key|missing authorization/i.test(msg)) return 'You are not authorized for that action. Please log in again.';
  if (/Invalid login credentials/i.test(msg)) return 'Invalid email or password';
  if (/User already registered/i.test(msg)) return 'Email already registered. Try logging in instead.';
  if (/rate limit|too many requests|over_request_rate_limit/i.test(msg + code)) return 'Too many attempts. Please wait a moment and retry.';
  if (/password/i.test(msg) && /weak|short|least/i.test(msg)) return 'Password is too weak. Use at least 6 characters.';
  return fallback;
}

// ---------- Validated uploads (buckets must exist per migrations 001-003) ----------
const MB = 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const BUCKET_RULES = {
  receipts: { maxBytes: 5 * MB, types: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'], label: 'JPG, PNG or PDF up to 5MB' },
  submissions: { maxBytes: MAX_SUBMISSION_BYTES, types: ALLOWED_SUBMISSION_TYPES, label: 'JPG, PNG, PDF, MP4, ZIP, DOCX, PPTX, XLSX up to 25MB' },
  avatars: { maxBytes: 2 * MB, types: IMAGE_TYPES, label: 'Image up to 2MB' },
  thumbnails: { maxBytes: 5 * MB, types: IMAGE_TYPES, label: 'Image up to 5MB' },
  resources: { maxBytes: 25 * MB, types: null, label: 'File up to 25MB' },
  'lesson-videos': { maxBytes: 500 * MB, types: ['video/mp4', 'video/webm', 'video/quicktime'], label: 'MP4/WEBM video up to 500MB' },
  certificates: { maxBytes: 5 * MB, types: ['application/pdf', ...IMAGE_TYPES], label: 'PDF or image up to 5MB' },
};

const safeName = (name) => String(name || 'file').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);

export function validateUpload(bucket, file) {
  const rules = BUCKET_RULES[bucket];
  if (!rules) return { ok: false, error: 'Unknown upload target' };
  if (!file) return { ok: false, error: 'No file selected' };
  if (rules.types && !rules.types.includes(file.type)) return { ok: false, error: `Unsupported file. Allowed: ${rules.label}` };
  if (file.size > rules.maxBytes) return { ok: false, error: `File too large. Max: ${rules.label.split('up to ').pop()}` };
  return { ok: true };
}

/**
 * Direct XHR upload to the Storage REST endpoint. The SDK's upload() uses
 * fetch, which cannot report byte-level progress; XHR can. Same endpoint,
 * same headers, same RLS policies — the only difference is the transport.
 */
function uploadViaXhr(bucket, path, file, onProgress) {
  return new Promise(async (resolve, reject) => {
    try {
      const sb = requireSb();
      const { data } = await sb.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) { reject(new Error('Session expired. Please log in again.')); return; }
      const encodedPath = path.split('/').map(encodeURIComponent).join('/');
      const url = `${SUPABASE_URL.replace(/\/+$/, '')}/storage/v1/object/${bucket}/${encodedPath}`;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
      xhr.setRequestHeader('x-upsert', 'false');
      if (file.type) xhr.setRequestHeader('Content-Type', file.type);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && typeof onProgress === 'function') {
          onProgress(Math.max(1, Math.round((e.loaded / e.total) * 100)));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) { resolve(); return; }
        let msg = '';
        try {
          const body = JSON.parse(xhr.responseText || '{}');
          msg = body.message || body.error || body.msg || '';
        } catch { /* non-JSON error body */ }
        reject(new Error(friendlyError(
          { message: msg || `Upload failed (HTTP ${xhr.status})` },
          'Upload failed. Please try again.',
        )));
      };
      xhr.onerror = () => reject(new Error('Network error while uploading the file. Check your connection and try again.'));
      xhr.ontimeout = () => reject(new Error('The upload timed out. Please try again.'));
      xhr.send(file);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Upload a file to private storage. Returns the storage path.
 * When `onProgress` is provided (and XHR is available) real byte-level
 * progress is reported (1-100); otherwise the SDK transport is used.
 */
export async function uploadFile(bucket, folder, file, onProgress = null) {
  const check = validateUpload(bucket, file);
  if (!check.ok) throw new Error(check.error);
  const sb = requireSb();
  const path = `${folder}/${Date.now()}_${safeName(file.name)}`;
  if (typeof onProgress === 'function' && typeof XMLHttpRequest !== 'undefined') {
    try {
      await uploadViaXhr(bucket, path, file, onProgress);
      return path;
    } catch (err) {
      // Auth/validation errors must surface verbatim; transport glitches
      // fall through to the SDK upload as a second attempt.
      if (/session expired|log in again|permission|denied|already exists|too large|not set up/i.test(err.message)) throw err;
    }
  }
  const { error } = await sb.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw new Error(friendlyError(error, 'Upload failed. Please try again.'));
  return path;
}

/** Signed URL for private buckets. Returns null (never throws) on failure. */
export async function signedUrl(bucket, path, expiresIn = 3600) {
  if (!path) return null;
  try {
    const sb = requireSb();
    const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

/**
 * The two schema lineages use different private buckets for the same kinds of
 * files (this repo: resources / lesson-videos; backend repo: course-resources
 * / course-videos). Try each candidate and return the first signed URL that
 * exists — so a file uploaded by EITHER pipeline always opens, and a missing
 * file yields null instead of a fake or broken URL.
 */
export async function signedUrlAny(buckets, path, expiresIn = 3600) {
  if (!path) return null;
  for (const bucket of (Array.isArray(buckets) ? buckets : [buckets])) {
    const url = await signedUrl(bucket, path, expiresIn);
    if (url) return url;
  }
  return null;
}

/** Bucket aliases for uploads: primary first, fallback used only if missing. */
export async function ensureBucket(bucket) {
  try {
    const sb = requireSb();
    const { data } = await sb.storage.getBucket(bucket);
    if (data) return bucket;
    await sb.storage.createBucket(bucket, { public: false });
    return bucket;
  } catch {
    return bucket; // the upload itself will produce a friendly error if not
  }
}

export function publicUrl(bucket, path) {
  if (!path) return null;
  try {
    return requireSb().storage.from(bucket).getPublicUrl(path).data.publicUrl;
  } catch {
    return null;
  }
}

// ---------- Realtime (payments, notifications, reviews, announcements) ----------
export function subscribeChanges({ channel, table, schema = 'public', event = '*', filter = null, callback }) {
  const sb = requireSb();
  const ch = sb.channel(channel);
  const opts = { event, schema, table };
  if (filter) opts.filter = filter;
  ch.on('postgres_changes', opts, callback).subscribe();
  return () => { sb.removeChannel(ch); };
}
