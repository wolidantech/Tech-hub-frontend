# WOLI DAN TECH HUB — Server Reference

The frontend (`/src`) is **not** standalone: it requires a Supabase backend for
all accounts, courses, payments and certificates, and `SetupGate` blocks every
route until `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are present. See
[`../supabase/README.md`](../supabase/README.md) for the setup runbook.

The only part of the frontend that degrades gracefully without a server is AI
generation, which falls back to offline templates. This folder contains the
**reference implementation** for running AI properly in production. Nothing here
is bundled into the Vite build.

## Files

- `ai-gateway.example.mjs` — Secure AI gateway (Express). Holds all AI API
  keys server-side. Frontend calls it via `VITE_AI_ENDPOINT`. Swap providers
  by replacing `callLLM()`. Includes provider-independent video-job stubs.

## Production checklist

1. Create Supabase project → run `supabase/migrations/001`…`005` **in order**,
   then the seed files and `make_admin.sql`. Storage buckets are created by the
   migrations; the full sequence is in [`../supabase/README.md`](../supabase/README.md).
2. `@supabase/supabase-js` is already a dependency. Set `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` (the **anon/publishable** key — never `service_role`)
   and rebuild.
3. Deploy the AI gateway on your server with secrets (never in frontend):
   `OPENAI_API_KEY` (or Anthropic/Gemini), `ADMIN_TOKEN`, `ALLOWED_ORIGINS`.
4. Set `VITE_AI_ENDPOINT` to `https://your-api/api/ai/generate`.
5. Enforce server-side: coupon redemption via `redeem_coupon()` RPC (already
   atomic in SQL), quiz scoring without exposing answers, certificate issuance
   only when `course_completion_rules` are met, and audit logging.
6. Uploaded videos/submissions go to private buckets; serve via signed URLs
   (`getSignedUrl()` in `src/lib/supabase.js`).
