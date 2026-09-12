// Supabase adapter (optional, progressive enhancement).
// If VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set, the app can sync with
// Supabase; otherwise it runs fully on the local store (existing behavior).
// This keeps the repo deployable with zero config while being backend-ready.
//
// Tables/RLS: see supabase/migrations/001_lms_core.sql

let client = null;

export function isSupabaseEnabled() {
  return Boolean(import.meta.env?.VITE_SUPABASE_URL && import.meta.env?.VITE_SUPABASE_ANON_KEY);
}

export async function getSupabase() {
  if (client) return client;
  if (!isSupabaseEnabled()) return null;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
    return client;
  } catch (e) {
    console.warn('[supabase] @supabase/supabase-js not installed. Run: npm i @supabase/supabase-js');
    return null;
  }
}

// Signed URL helper for private storage buckets (receipts, submissions, videos).
// Falls back to the local data-URL value when Supabase is not configured.
export async function getSignedUrl(bucket, path, localFallback = null, expiresIn = 3600) {
  const sb = await getSupabase();
  if (!sb) return localFallback;
  const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return localFallback;
  return data.signedUrl;
}
