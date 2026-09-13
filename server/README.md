# WOLI DAN TECH HUB — Server Reference

The frontend (`/src`) is fully functional standalone (local store + offline AI
templates). This folder contains **reference implementations** for going to
production with a real backend. Nothing here is bundled into the Vite build.

## Files

- `ai-gateway.example.mjs` — Secure AI gateway (Express). Holds all AI API
  keys server-side. Frontend calls it via `VITE_AI_ENDPOINT`. Swap providers
  by replacing `callLLM()`. Includes provider-independent video-job stubs.

## Production checklist

1. Create Supabase project → run `supabase/migrations/001_lms_core.sql`.
2. `npm i @supabase/supabase-js` in frontend; set `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY`. Storage buckets are created by the migration.
3. Deploy the AI gateway on your server with secrets (never in frontend):
   `OPENAI_API_KEY` (or Anthropic/Gemini), `ADMIN_TOKEN`, `ALLOWED_ORIGINS`.
4. Set `VITE_AI_ENDPOINT` to `https://your-api/api/ai/generate`.
5. Enforce server-side: coupon redemption via `redeem_coupon()` RPC (already
   atomic in SQL), quiz scoring without exposing answers, certificate issuance
   only when `course_completion_rules` are met, and audit logging.
6. Uploaded videos/submissions go to private buckets; serve via signed URLs
   (`getSignedUrl()` in `src/lib/supabase.js`).
