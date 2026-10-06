// ============================================================
// Backend diagnostics
// ------------------------------------------------------------
// The app talks to Supabase for everything (auth, courses, payments).
// When a request fails the browser only sees "TypeError: Failed to fetch",
// which the UI used to flatten into one generic "Network error. Check your
// connection and retry." That hides the real cause — a paused project, a
// mistyped URL, a CORS block, an expired/service-role key, migrations that
// were never run, or a seed where every course is unpublished.
//
// This module probes the backend layer by layer from the visitor's own
// browser and returns a specific cause + a specific fix for each layer.
// It is read-only: every request is a GET against public endpoints.
// ============================================================

// Shares the app's own normalization so these probes always target exactly the
// URL the Supabase client uses. Diverging here would make the diagnostics
// report on a different backend than the one actually failing.
import { cleanEnv } from './supabase';
// Same-origin /api vs VITE_API_URL resolution, shared with the REST client so
// the course-API probe tests the exact base the catalogue grid fetches from.
import { apiBase } from './api';

const RAW_URL = cleanEnv(import.meta.env?.VITE_SUPABASE_URL);
const RAW_KEY = cleanEnv(import.meta.env?.VITE_SUPABASE_ANON_KEY);

// Kept untrimmed so we can tell the admin their env value is contaminated.
// src/lib/supabase.js now normalizes these before building the client, but the
// value in the host's dashboard should still be cleaned up.
const UNTRIMMED_URL = String(import.meta.env?.VITE_SUPABASE_URL ?? '');
const UNTRIMMED_KEY = String(import.meta.env?.VITE_SUPABASE_ANON_KEY ?? '');

export const backendUrl = RAW_URL;
export const backendKey = RAW_KEY;
export const isConfigured = () => Boolean(RAW_URL && RAW_KEY);

/**
 * Tables the frontend queries. Missing ones mean migrations were not run.
 * Names must match supabase/migrations exactly — the per-table fallback probes
 * each of these paths, so a stale name here would misreport a healthy project
 * as missing tables (there are no `certificates` / `notifications` tables; the
 * real names are `certificate_issues` / `student_notifications`).
 */
const REQUIRED_TABLES = [
  'profiles', 'categories', 'courses', 'course_modules', 'course_lessons',
  'enrollments', 'manual_payments', 'certificate_issues', 'student_notifications',
  'quiz_questions', 'quizzes', 'assignments', 'coupons', 'site_settings',
];

const PROBE_TIMEOUT = 9000;

// ---------- tiny helpers ----------

const strip = (u) => String(u || '').replace(/\/+$/, '');

/** The origin the browser would send — used to tell the admin what to allowlist. */
const currentOrigin = () =>
  typeof window === 'undefined' || !window.location ? '(this site’s origin)' : window.location.origin;

/** Decode a Supabase JWT without any network call. Returns null if not a JWT. */
function decodeJwt(token) {
  try {
    const parts = String(token).split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(payload + '='.repeat((4 - (payload.length % 4)) % 4)));
    return json || null;
  } catch {
    return null;
  }
}

/** GET with a timeout. Never throws for HTTP errors — only for network failure. */
async function probe(path, { mode = 'cors', key = RAW_KEY, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT);
  const started = Date.now();
  try {
    const res = await fetch(`${strip(RAW_URL)}${path}`, {
      method: 'GET',
      mode,
      signal: controller.signal,
      headers: mode === 'cors'
        ? { ...(key ? { apikey: key, Authorization: `Bearer ${key}` } : {}), ...headers }
        : undefined,
    });
    const ms = Date.now() - started;
    let body = null;
    let text = '';
    if (mode === 'cors') {
      try {
        text = await res.text();
        const ctype = res.headers.get('content-type') || '';
        body = ctype.includes('json') ? JSON.parse(text) : null;
      } catch { /* body unreadable — keep raw text */ }
    }
    return {
      ok: res.ok, status: res.status, ms, body, text,
      contentType: mode === 'cors' ? (res.headers.get('content-type') || '') : '',
      type: res.type || 'basic',
    };
  } catch (err) {
    return {
      ok: false, status: 0, ms: Date.now() - started, body: null, text: '',
      contentType: '', type: 'error',
      error: String(err?.name === 'AbortError' ? 'timeout' : err?.message || err),
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * GET against the course API base the catalogue grid fetches from
 * (same-origin /api or VITE_API_URL — see src/lib/api.js). No Supabase
 * headers: this is a different service. Read-only public endpoints only.
 */
async function probeApi(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT);
  const started = Date.now();
  const url = `${apiBase().replace(/\/+$/, '')}${path}`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    const ms = Date.now() - started;
    let text = '';
    try {
      text = await res.text();
    } catch { /* body unreadable — status code below still decides */ }
    const contentType = res.headers.get('content-type') || '';
    let body = null;
    try {
      body = contentType.includes('json') ? JSON.parse(text) : null;
    } catch { /* HTML fallback or empty body — detected below, not an error here */ }
    return {
      ok: res.ok, status: res.status, ms, body, text, contentType, url,
      type: res.type || 'basic',
    };
  } catch (err) {
    return {
      ok: false, status: 0, ms: Date.now() - started, body: null, text: '',
      contentType: '', type: 'error', url,
      error: String(err?.name === 'AbortError' ? 'timeout' : err?.message || err),
    };
  } finally {
    clearTimeout(timer);
  }
}

/** True when the API answered with the app shell instead of JSON. */
const isHtmlFallback = (res) =>
  /text\/html/i.test(res.contentType || '') || /^\s*(<!doctype html|<html)/i.test(res.text || '');

// ---------- check 1: environment variables ----------

function checkEnv() {
  const problems = [];
  if (!RAW_URL) problems.push('VITE_SUPABASE_URL is empty');
  if (!RAW_KEY) problems.push('VITE_SUPABASE_ANON_KEY is empty');

  if (problems.length) {
    return {
      id: 'env', title: 'Environment variables', level: 'fail',
      detail: `${problems.join(' and ')}. Vite inlines these at BUILD time, so the app cannot start.`,
      fix: 'Put both values in a .env file at the project root (copy .env.example), then restart the dev server. On Vercel/Netlify add them under Environment Variables and REDEPLOY — a rebuild is required, variables are baked into the bundle.',
    };
  }
  return {
    id: 'env', title: 'Environment variables', level: 'pass',
    detail: `Both variables are present. URL = ${RAW_URL}`,
    fix: null,
  };
}

// ---------- check 1b: whitespace / quote contamination ----------
// The classic "healthy project, broken site" cause. A trailing newline or a
// wrapping quote in the env value makes fetch() throw before any request is
// sent, so the browser reports a network failure and the app says "Network
// error. Check your connection and retry." — pointing at the visitor's
// connection when the real fault is a malformed URL string.
function checkEnvHygiene() {
  const issues = [];
  const edge = (label, raw) => {
    const trimmed = raw.trim();
    if (raw !== trimmed) issues.push(`${label} has leading/trailing whitespace or a newline`);
    if (/^["'].*["']$/s.test(trimmed)) issues.push(`${label} is wrapped in quote characters`);
    return trimmed;
  };
  edge('VITE_SUPABASE_URL', UNTRIMMED_URL);
  const key = edge('VITE_SUPABASE_ANON_KEY', UNTRIMMED_KEY);
  if (/\s/.test(key)) issues.push('VITE_SUPABASE_ANON_KEY contains a space inside the value');

  if (!issues.length) {
    return {
      id: 'hygiene', title: 'Env value hygiene', level: 'pass',
      detail: 'No stray whitespace or quote characters in either variable.',
      fix: null,
    };
  }
  return {
    id: 'hygiene', title: 'Env value hygiene', level: 'warn',
    detail: `${issues.join('; ')}. Against a perfectly healthy project this produces exactly the reported symptom: the browser tries to fetch a malformed URL and throws before the request is sent, so login fails with a network error and the catalog silently stays empty.`,
    fix: 'The app now trims and unwraps these values automatically, so it should already work after this deploy. Still, clean them up in your host’s environment variables — no surrounding quotes, no trailing newline — and redeploy, or any other tool reading them will break the same way.',
  };
}

// ---------- check 2: URL shape (catches the most common paste mistakes) ----------

function checkUrlShape() {
  const u = RAW_URL;
  const mistakes = [];
  const host = u.replace(/^https?:\/\//, '').split('/')[0];

  // The Supabase CLI runs a full local stack at http://127.0.0.1:54321, so
  // plain HTTP and a port are correct there and must not be flagged.
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host);

  if (/^postgres(ql)?:\/\//i.test(u)) mistakes.push('this is a Postgres connection string, not the API URL');
  else if (/^db\./i.test(u.replace(/^https?:\/\//, ''))) mistakes.push('this is the database host (db.…), not the API URL');
  else if (!isLocal && !/^https:\/\//i.test(u)) mistakes.push('it must start with https://');
  else if (!isLocal && /[:]\d{4,5}/.test(host)) mistakes.push('it must not contain a port');
  if (/\s/.test(u)) mistakes.push('it contains a space or newline (common when copy-pasting)');
  if (/your-project|example\.com|placeholder/i.test(u)) mistakes.push('it still holds the placeholder from .env.example');
  if (/supabase\.com/i.test(u)) mistakes.push('the domain is supabase.com — the API host is supabase.co');

  const looksManaged = isLocal || /\.(supabase\.co|supabase\.in|supabase\.red)$/i.test(host);

  if (mistakes.length) {
    return {
      id: 'url', title: 'Project URL format', level: 'fail',
      detail: `${mistakes[0]}. Value: ${u}`,
      fix: 'Supabase Dashboard → Project Settings → API → "Project URL". It looks like https://abcdefghijklmnop.supabase.co with no path, no port and no trailing slash.',
    };
  }
  return {
    id: 'url', title: 'Project URL format', level: looksManaged ? 'pass' : 'warn',
    detail: isLocal
      ? `Local Supabase stack: ${host} (the CLI serves the API over plain HTTP with a port — that is expected).`
      : looksManaged
        ? `Well-formed Supabase host: ${host}`
        : `${host} is not a standard *.supabase.co host. That is fine for a custom domain, but double-check it is the API URL.`,
    fix: looksManaged ? null : 'If this is not a custom domain you configured, replace it with the Project URL from Supabase Dashboard → Project Settings → API.',
  };
}

// ---------- check 3: key shape (security + expiry, no network needed) ----------

function checkKeyShape() {
  const k = RAW_KEY;
  if (!k) return { id: 'key', title: 'API key', level: 'skip', detail: 'No key set.', fix: 'Set VITE_SUPABASE_ANON_KEY.' };

  // New-style publishable/secret keys (Supabase 2025+)
  if (/^sb_secret_/i.test(k)) {
    return {
      id: 'key', title: 'API key type', level: 'fail',
      detail: 'This is a SECRET key. It must never be shipped in frontend code — anyone can read it and take over the database.',
      fix: 'Use the publishable/anon key in VITE_SUPABASE_ANON_KEY (Supabase Dashboard → Project Settings → API Keys). Keep the secret key on the server only. Rotate the exposed secret key immediately.',
    };
  }
  if (/^sb_publishable_/i.test(k)) {
    return {
      id: 'key', title: 'API key type', level: 'pass',
      detail: 'New-style publishable key — correct for the frontend.',
      fix: null,
    };
  }

  const claims = decodeJwt(k);
  if (!claims) {
    return {
      id: 'key', title: 'API key type', level: 'warn',
      detail: 'The key is not a recognisable JWT or sb_publishable_ key. It may be truncated or have stray characters.',
      fix: 'Re-copy the anon/publishable key in full from Supabase Dashboard → Project Settings → API.',
    };
  }

  const problems = [];
  if (claims.role && claims.role !== 'anon') {
    problems.push(`role is "${claims.role}", not "anon"`);
  }
  const expDate = claims.exp ? new Date(claims.exp * 1000) : null;
  if (expDate && expDate.getTime() < Date.now()) {
    problems.push(`it expired on ${expDate.toISOString().slice(0, 10)}`);
  }

  if (problems.length) {
    const isService = /service_role/.test(problems.join(' '));
    return {
      id: 'key', title: 'API key type', level: 'fail',
      detail: `Wrong key for the frontend: ${problems.join(' and ')}.`,
      fix: isService
        ? 'This is the service_role key — it bypasses all row-level security and must NEVER be in a frontend bundle. Replace it with the anon/publishable key, then rotate the service_role key in Supabase because it has been exposed.'
        : 'Replace VITE_SUPABASE_ANON_KEY with a fresh anon/publishable key from Supabase Dashboard → Project Settings → API, then rebuild and redeploy.',
    };
  }
  return {
    id: 'key', title: 'API key type', level: 'pass',
    detail: `anon key, valid JWT${expDate ? `, expires ${expDate.toISOString().slice(0, 10)}` : ''}.`,
    fix: null,
  };
}

// ---------- check 4: reachability (separates CORS from a dead/paused project) ----------

async function checkReachability() {
  const cors = await probe('/auth/v1/health');

  if (cors.type !== 'error') {
    if (cors.status === 200) {
      return {
        id: 'reach', title: 'Backend reachable', level: 'pass',
        detail: `GET /auth/v1/health → 200 in ${cors.ms}ms. The project is live and accepts this origin.`,
        fix: null,
      };
    }
    if (cors.status === 540 || /paused|hibernat/i.test(cors.text || '')) {
      return {
        id: 'reach', title: 'Backend reachable', level: 'fail',
        detail: `HTTP ${cors.status || 540} — the Supabase project is PAUSED. Free-tier projects pause automatically after about a week of inactivity, and every request then fails.`,
        fix: 'Open the Supabase Dashboard, select the project and click "Restore project" (it takes a few minutes). To stop it recurring, upgrade to the Pro plan or schedule a weekly ping.',
      };
    }
    if (cors.status === 401 || cors.status === 403) {
      const msg = cors.body?.message || cors.body?.error || cors.text || '';
      return {
        id: 'reach', title: 'Backend reachable', level: 'fail',
        detail: `The project responded (HTTP ${cors.status}) but REJECTED the API key: ${String(msg).slice(0, 160)}`,
        fix: 'The key does not belong to this project, or it was rotated. Copy the current anon/publishable key from Supabase Dashboard → Project Settings → API and redeploy.',
      };
    }
    if (cors.status === 404) {
      return {
        id: 'reach', title: 'Backend reachable', level: 'fail',
        detail: `HTTP 404 from ${RAW_URL} — something answers at this address but it is not a Supabase Auth endpoint.`,
        fix: 'The URL is wrong or points at a deleted project. Use the Project URL from Supabase Dashboard → Project Settings → API.',
      };
    }
    return {
      id: 'reach', title: 'Backend reachable', level: 'warn',
      detail: `Unexpected HTTP ${cors.status} from /auth/v1/health: ${String(cors.text || '').slice(0, 160)}`,
      fix: 'Check Supabase Dashboard → Logs → Auth for the matching error.',
    };
  }

  // Network-level failure: distinguish "host unreachable" from "CORS block".
  // A no-cors request skips the CORS check, so if IT succeeds the host is up
  // and the failure is the browser refusing the cross-origin read.
  const opaque = await probe('/auth/v1/health', { mode: 'no-cors' });
  const dnsResolves = opaque.type !== 'error';

  if (dnsResolves) {
    return {
      id: 'reach', title: 'Backend reachable', level: 'fail',
      detail: `The host ${strip(RAW_URL).replace(/^https?:\/\//, '')} IS online, but the browser blocked the cross-origin request (CORS). Supabase normally allows every origin, so this points at a restricted origin list, a proxy/extension, or a paused project returning an HTML page.`,
      fix: `In Supabase Dashboard → Authentication → URL Configuration add this exact origin to the allowed list: ${currentOrigin()}. Also disable ad-blockers/privacy extensions for this site and retry. If the project is on a free plan, confirm it is not paused.`,
    };
  }

  const why = /timeout/i.test(cors.error || '')
    ? `the request timed out after ${PROBE_TIMEOUT / 1000}s`
    : `the request could not be completed (${cors.error})`;
  return {
    id: 'reach', title: 'Backend reachable', level: 'fail',
    detail: `Cannot reach the backend at all — ${why}. The host did not resolve or refused the connection, so this is not a code bug in the app.`,
    fix: 'Most likely causes, in order: (1) the project is paused or deleted — check the Supabase Dashboard; (2) the URL is mistyped — re-copy it from Project Settings → API; (3) the device/network/DNS is blocking supabase.co — test by opening the URL directly in a new tab; (4) an ad-blocker or corporate proxy is blocking it.',
  };
}

// ---------- check 5: auth configuration (signup, email confirmation) ----------

async function checkAuthSettings() {
  const res = await probe('/auth/v1/settings');
  if (res.type === 'error' || !res.ok) {
    return {
      id: 'auth', title: 'Auth configuration', level: 'skip',
      detail: 'Skipped — the backend did not answer (see the reachability check above).',
      fix: null,
    };
  }
  const s = res.body || {};
  const notes = [];
  if (s.disable_signup) notes.push('signups are DISABLED, so /register will always fail');
  const providers = Object.keys(s.external || {}).filter((p) => s.external?.[p]);
  notes.push(providers.length ? `social providers enabled: ${providers.join(', ')}` : 'email/password only');

  return {
    id: 'auth', title: 'Auth configuration', level: s.disable_signup ? 'warn' : 'pass',
    detail: notes.join('; ') + '.',
    fix: s.disable_signup
      ? 'Supabase Dashboard → Authentication → Providers → Email: turn off "Disable signups".'
      : 'If registered users cannot log in until they click an email link, that is "Confirm email" being ON (Authentication → Providers → Email). Either turn it off, or make sure the Site URL and Redirect URLs include this origin so the confirmation link works.',
  };
}

// ---------- check 6: schema — were the migrations actually run? ----------

async function checkSchema() {
  // Attempt 1: the OpenAPI document. Hosted PostgREST only serves it from the
  // root when the request asks for it explicitly — without
  // `Accept: application/openapi+json` the root answers 404 while every table
  // endpoint works fine, which used to misreport a healthy backend as
  // "the REST API did not answer".
  const root = await probe('/rest/v1/', { headers: { Accept: 'application/openapi+json' } });
  if (root.ok) {
    // The document's "definitions" keys are the tables and views the anon key
    // can see.
    const found = new Set(Object.keys(root.body?.definitions || {}));
    if (found.size) {
      const missing = REQUIRED_TABLES.filter((t) => !found.has(t));
      if (missing.length) {
        return {
          id: 'schema', title: 'Database schema', level: 'fail',
          detail: `The database is reachable but ${missing.length} required table(s) are missing: ${missing.join(', ')}. The migrations were not run (or only partly run).`,
          fix: 'In the Supabase SQL Editor run supabase/migrations/001_lms_core.sql, then 002, 003, 004, 005 IN THAT ORDER, then supabase/seed/seed_12_courses.sql. Migration 003 is the one that creates the signup trigger, so skipping it breaks every login.',
        };
      }
      return {
        id: 'schema', title: 'Database schema', level: 'pass',
        detail: `All ${REQUIRED_TABLES.length} required tables exist — migrations have been applied.`,
        fix: null,
      };
    }
    // 2xx but no definitions: response shape changed — fall through to the
    // per-table probes below instead of guessing.
  }

  // Attempt 2: ask every required table directly (one row each, read-only).
  // RLS filters rows but never turns a SELECT into an error, so any 2xx —
  // even an empty array — proves the table exists. A 404 means PostgREST has
  // no such table in its schema cache, i.e. the migration was not run.
  const results = await Promise.all(REQUIRED_TABLES.map(async (table) => ({
    table,
    res: await probe(`/rest/v1/${table}?select=*&limit=1`),
  })));
  if (results.every(({ res }) => res.type === 'error')) {
    return {
      id: 'schema', title: 'Database schema', level: 'skip',
      detail: 'Skipped — the REST API did not answer.',
      fix: null,
    };
  }
  const missing = results.filter(({ res }) => res.status === 404).map(({ table }) => table);
  const rejected = results.filter(({ res }) => res.status === 401 || res.status === 403);
  const unverifiable = results.filter(({ res }) => !res.ok && res.status !== 404 && res.status !== 401 && res.status !== 403);
  if (rejected.length && !missing.length && !unverifiable.length) {
    return {
      id: 'schema', title: 'Database schema', level: 'fail',
      detail: `The REST API rejected the key (HTTP ${rejected[0].res.status}) on ${rejected.length} table(s).`,
      fix: 'The key does not belong to this project, or it was rotated. Copy the current anon/publishable key from Supabase Dashboard → Project Settings → API and redeploy.',
    };
  }
  if (missing.length) {
    return {
      id: 'schema', title: 'Database schema', level: 'fail',
      detail: `The database is reachable but ${missing.length} required table(s) are missing: ${missing.join(', ')}. The migrations were not run (or only partly run).`,
      fix: 'In the Supabase SQL Editor run supabase/migrations/001_lms_core.sql, then 002, 003, 004, 005 IN THAT ORDER, then supabase/seed/seed_12_courses.sql. Migration 003 is the one that creates the signup trigger, so skipping it breaks every login.',
    };
  }
  if (unverifiable.length) {
    const first = unverifiable[0];
    return {
      id: 'schema', title: 'Database schema', level: 'warn',
      detail: `${unverifiable.length} table(s) could not be verified (${first.table}: HTTP ${first.res.status}). The rest exist.`,
      fix: 'Open the failing table path directly in a new tab with the apikey header — a 400 names the exact problem in its PostgREST error payload.',
    };
  }
  return {
    id: 'schema', title: 'Database schema', level: 'pass',
    detail: `All ${REQUIRED_TABLES.length} required tables exist — migrations have been applied (verified per table; the OpenAPI root did not serve a table list).`,
    fix: null,
  };
}

// ---------- check 7: catalog — is there anything a visitor is ALLOWED to see? ----------

async function checkCatalog() {
  const res = await probe('/rest/v1/courses?select=slug,published,archived&limit=1000');
  if (res.type === 'error' || !res.ok) {
    const detail = res.body?.message || res.text || res.error || 'no response';
    return {
      id: 'catalog', title: 'Course catalog', level: 'skip',
      detail: `Could not read the courses table: ${String(detail).slice(0, 180)}`,
      fix: 'Run the migrations first (see the schema check), then the seed file.',
    };
  }

  const rows = Array.isArray(res.body) ? res.body : [];
  const visible = rows.filter((r) => r.published && !r.archived);

  if (!rows.length) {
    return {
      id: 'catalog', title: 'Course catalog', level: 'fail',
      detail: 'The courses table is EMPTY, or every row is hidden from this key. Row-level security only exposes courses where published = true, so a visitor sees nothing.',
      fix: 'Run supabase/seed/seed_12_courses.sql in the SQL Editor, then supabase/seed/publish_courses.sql. The seed deliberately inserts courses as drafts; without the publish step the storefront stays empty even though the data is there.',
    };
  }
  if (!visible.length) {
    return {
      id: 'catalog', title: 'Course catalog', level: 'fail',
      detail: `This key can see ${rows.length} course(s) but NONE are published. The storefront hides unpublished courses, which is exactly the "no courses here" symptom.`,
      fix: 'Run supabase/seed/publish_courses.sql in the SQL Editor (it flips published = true for the seeded catalog), or sign in as an admin and publish them from Admin → Courses.',
    };
  }
  return {
    id: 'catalog', title: 'Course catalog', level: 'pass',
    detail: `${visible.length} published course(s) visible to a logged-out visitor.`,
    fix: null,
  };
}

// ---------- check 8: categories — the exact query the frontend runs ----------

async function checkCategories() {
  // Mirrors src/lib/store.js fetchCategories(): select name, ordered by
  // sort_order then name. A 400 here names an invalid column (e.g. a missing
  // sort_order) in its PostgREST payload instead of failing silently.
  const res = await probe('/rest/v1/categories?select=name&order=sort_order.asc,name.asc&limit=1000');
  if (res.ok) {
    const rows = Array.isArray(res.body) ? res.body : [];
    if (!rows.length) {
      return {
        id: 'categories', title: 'Course categories', level: 'warn',
        detail: 'The categories table is readable but contains no rows.',
        fix: 'Insert the category rows (supabase/seed/seed_12_courses.sql contains the launch set) — but first confirm the catalogue grid reads them: the /courses chips come from the course API, not this table (see the next check).',
      };
    }
    return {
      id: 'categories', title: 'Course categories', level: 'pass',
      detail: `${rows.length} categor(ies) readable as a logged-out visitor: ${rows.slice(0, 12).map((r) => r.name).join(', ')}${rows.length > 12 ? '…' : ''}.`,
      fix: null,
    };
  }
  if (res.type === 'error') {
    return {
      id: 'categories', title: 'Course categories', level: 'skip',
      detail: 'Skipped — the REST API did not answer for this probe.',
      fix: null,
    };
  }
  // HTTP error with a working network is a precise signal. If the ORDER BY is
  // the problem, the same query without it succeeds — that split isolates an
  // invalid-column failure from a missing-table/policy failure.
  if (res.status === 400) {
    const retry = await probe('/rest/v1/categories?select=name&limit=1000');
    if (retry.ok) {
      return {
        id: 'categories', title: 'Course categories', level: 'fail',
        detail: `Ordering by sort_order was rejected (HTTP 400): ${String(res.body?.message || res.text || '').slice(0, 160)} — the column the frontend sorts by is missing or misnamed, while the table itself reads fine.`,
        fix: 'Compare the live public.categories columns against supabase/migrations/001_lms_core.sql (id, name, sort_order). Add/rename the column — do not change the frontend sort until the canonical schema is confirmed.',
      };
    }
  }
  const detail = res.body?.message || res.text || `HTTP ${res.status}`;
  return {
    id: 'categories', title: 'Course categories', level: 'fail',
    detail: `Could not read the categories table: ${String(detail).slice(0, 180)}`,
    fix: res.status === 404
      ? 'The table is missing from the PostgREST schema cache — run the migrations, then reload the schema (Supabase Dashboard → Project Settings → API → Reload schema).'
      : 'Open the same path in a new tab with the apikey header to see the full PostgREST error payload.',
  };
}

// ---------- check 9: course API — the service the /courses grid reads ----------
// The catalogue grid, category chips and homepage strip prefer the course API
// and fall back to Supabase automatically when this layer is down, serves the
// SPA fallback page, or returns nothing. A failure here therefore means the
// storefront is on its backup source — students still see courses, but
// server-side filtering, pagination and outlines need this layer fixed.

async function checkCourseApi() {
  const base = apiBase();
  const [cats, courses] = await Promise.all([
    probeApi('/course-categories'),
    probeApi('/courses?limit=1'),
  ]);

  // Network failure on both is the "no backend on this host" case.
  if (cats.type === 'error' && courses.type === 'error') {
    const sameOrigin = base.startsWith('/');
    return {
      id: 'course-api', title: 'Course API (/api)', level: 'fail',
      detail: `The course API (${base}) is unreachable from this browser (${cats.error || 'network failure'}). The /courses grid falls back to the Supabase catalogue automatically (see the catalogue checks above for whether that backup is healthy), so students still see courses — but the primary API path needs attention.`,
      fix: sameOrigin
        ? 'Same-origin /api answered nothing: either deploy Tech-hub-backend behind this domain (or add a host rewrite/proxy for /api/*), or set VITE_API_URL to the API origin and redeploy — Vite bakes it in at build time, so the value must be present when the site is built.'
        : `The configured API origin (${base}) did not answer: confirm the backend is deployed and reachable, that VITE_API_URL has no typo, and that the backend allows this origin (${currentOrigin()}).`,
    };
  }

  // A static host without an /api rewrite serves index.html (HTTP 200!) for
  // /api/* — the catalogue client then parses HTML as JSON, gets null, and
  // renders the empty state with NO error. Detect the shell explicitly.
  const htmlHit = [cats, courses].find((r) => r.ok && isHtmlFallback(r));
  if (htmlHit) {
    return {
      id: 'course-api', title: 'Course API (/api)', level: 'fail',
      detail: `${htmlHit.url} returned the app's HTML page (HTTP ${htmlHit.status}, ${htmlHit.contentType || 'no content-type'}) instead of JSON. That is the single-page-app fallback, not the course API. The grid detects the outage and falls back to the Supabase catalogue automatically — but the /api route itself still needs a backend or rewrite (see fix).`,
      fix: 'This host has no /api route: deploy Tech-hub-backend behind this domain with a rewrite/proxy for /api/* ahead of the SPA fallback (public/_redirects currently rewrites EVERYTHING to /index.html), or set VITE_API_URL to the API origin and redeploy.',
    };
  }

  const errHit = [cats, courses].find((r) => !r.ok && r.type !== 'error');
  if (errHit) {
    const envelope = errHit.body?.error || {};
    return {
      id: 'course-api', title: 'Course API (/api)', level: 'fail',
      detail: `${errHit.url} → HTTP ${errHit.status}${envelope.code ? ` (${envelope.code})` : ''}: ${String(envelope.message || errHit.text || '').slice(0, 180)}`,
      fix: 'The API host answers but the catalogue route failed. Check the backend logs for this path and status — a 404 here usually means the route was never deployed on that host.',
    };
  }

  // Both answered with JSON. Unwrap the { success, data } envelope the same
  // way the catalogue client does, then report WHAT the API serves — including
  // which of the two contracts it speaks.
  const unwrap = (res) => {
    const payload = res.body;
    return payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
  };
  const catData = unwrap(cats);
  const courseData = unwrap(courses);
  const catList = Array.isArray(catData?.categories) ? catData.categories : (Array.isArray(catData) ? catData : []);
  const courseList = Array.isArray(courseData?.courses) ? courseData.courses : [];
  const total = courseData?.pagination?.total ?? courseList.length;

  const shape = [];
  if (catList.length) {
    const c0 = catList[0] || {};
    shape.push('sort_order' in c0 ? 'categories{id,name,sort_order}' : 'course_categories{id,name,description}');
  }
  if (courseList.length) {
    const c0 = courseList[0] || {};
    shape.push(('is_published' in c0 || 'course_categories' in c0 || 'category_id' in c0)
      ? 'courses{is_published,category_id→course_categories}'
      : 'courses{published,category text}');
  }
  const contract = shape.length ? ` Contract shape: ${shape.join(' + ')}.` : '';

  if (!catList.length && !courseList.length && !total) {
    return {
      id: 'course-api', title: 'Course API (/api)', level: 'warn',
      detail: `The API answered (HTTP 200) but serves zero categories and zero courses.${contract} The grid falls back to the Supabase catalogue instead of rendering this emptiness — the question is why the primary API filters everything out.`,
      fix: 'Do NOT seed or bulk-publish yet. Compare this response against the read-only SQL: if the API filters is_published while the canonical flag is published (or reads course_categories while the canonical table is categories), the backend contract — not the data — is the mismatch. Confirm the canonical rows first.',
    };
  }
  return {
    id: 'course-api', title: 'Course API (/api)', level: 'pass',
    detail: `Serving ${catList.length} categor(ies) and ${total} course(s) (first page: ${courseList.length}).${contract}`,
    fix: null,
  };
}

// ---------- check 10: admin bootstrap ----------

function checkAdminPath() {
  return {
    id: 'admin', title: 'Admin account', level: 'warn',
    detail: 'The signup trigger always creates accounts with role = student, so no one can reach /admin/login until a row is promoted by hand. Without an admin you cannot publish courses, approve payments or issue certificates.',
    fix: 'Register normally on the site first, then run supabase/seed/make_admin.sql in the SQL Editor with your email. It is idempotent and only touches the profiles row for that email.',
  };
}

// ---------- runner ----------

/**
 * Run every probe. Returns { origin, url, checks, failures, warnings, healthy }.
 * Safe to call repeatedly; never throws.
 */
export async function runDiagnostics() {
  const checks = [];
  const env = checkEnv();
  const hygiene = checkEnvHygiene();
  const url = checkUrlShape();
  const key = checkKeyShape();
  checks.push(env, hygiene, url, key);

  // No point hammering the network when the config itself is broken.
  if (env.level === 'fail' || url.level === 'fail') {
    checks.push(
      { id: 'reach', title: 'Backend reachable', level: 'skip', detail: 'Skipped — fix the configuration above first.', fix: null },
      { id: 'auth', title: 'Auth configuration', level: 'skip', detail: 'Skipped.', fix: null },
      { id: 'schema', title: 'Database schema', level: 'skip', detail: 'Skipped.', fix: null },
      { id: 'catalog', title: 'Course catalog', level: 'skip', detail: 'Skipped.', fix: null },
      { id: 'categories', title: 'Course categories', level: 'skip', detail: 'Skipped.', fix: null },
    );
  } else {
    checks.push(await checkReachability());
    // Only continue if the backend actually answered.
    const reachable = checks.find((c) => c.id === 'reach');
    if (reachable.level === 'pass' || reachable.level === 'warn') {
      checks.push(await checkAuthSettings());
      checks.push(await checkSchema());
      checks.push(await checkCatalog());
      checks.push(await checkCategories());
    } else {
      checks.push(
        { id: 'auth', title: 'Auth configuration', level: 'skip', detail: 'Skipped — backend unreachable.', fix: null },
        { id: 'schema', title: 'Database schema', level: 'skip', detail: 'Skipped — backend unreachable.', fix: null },
        { id: 'catalog', title: 'Course catalog', level: 'skip', detail: 'Skipped — backend unreachable.', fix: null },
        { id: 'categories', title: 'Course categories', level: 'skip', detail: 'Skipped — backend unreachable.', fix: null },
      );
    }
  }
  // Independent of Supabase: the grid's own data source. Runs even when the
  // database is unreachable, because a separate API origin may still be up
  // (or its absence may be the entire explanation for the empty catalogue).
  try {
    checks.push(await checkCourseApi());
  } catch (err) {
    checks.push({
      id: 'course-api', title: 'Course API (/api)', level: 'skip',
      detail: `The course-API probe itself failed: ${String(err?.message || err).slice(0, 160)}`,
      fix: null,
    });
  }
  checks.push(checkAdminPath());

  return {
    origin: typeof window === 'undefined' ? '' : window.location.origin,
    url: RAW_URL || '(not set)',
    checkedAt: new Date().toISOString(),
    checks,
    failures: checks.filter((c) => c.level === 'fail'),
    warnings: checks.filter((c) => c.level === 'warn'),
    healthy: !checks.some((c) => c.level === 'fail'),
  };
}

/** Plain-text report, for pasting into a bug report or chat. */
export function diagnosticsToText(report) {
  if (!report) return '';
  const icon = { pass: 'PASS', warn: 'WARN', fail: 'FAIL', skip: 'SKIP' };
  const lines = [
    'DANQEL DIGITAL INSTITUTE — backend diagnostics',
    `origin:   ${report.origin}`,
    `backend:  ${report.url}`,
    `checked:  ${report.checkedAt}`,
    '',
  ];
  report.checks.forEach((c) => {
    lines.push(`[${icon[c.level] || c.level}] ${c.title}`);
    lines.push(`       ${c.detail}`);
    if (c.fix) lines.push(`       fix: ${c.fix}`);
  });
  return lines.join('\n');
}

/**
 * The single most likely cause, used by the UI to replace the generic
 * "Network error" toast with something a person can act on.
 */
export function primaryCause(report) {
  if (!report) return null;
  return report.failures[0] || report.warnings[0] || null;
}
