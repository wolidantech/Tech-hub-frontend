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


## AI gateway contract

The site talks to two routes on this server. Both authenticate with the student's
(or admin's) Supabase access token — `Authorization: Bearer <token>`, added for you by
`aiAuthHeaders()` in `src/lib/supabase.js`. No model key ever sits in the browser.

| | Student chat | Content Studio |
|---|---|---|
| Route | `POST /api/dantech/chat` | `POST /api/ai/generate` |
| Body | `{ message, mode, modeId, context, history }` | `{ kind, input, options }` |
| `mode` | `GENERAL`, `STUDY`, `CODING`, `RESEARCH`, `CAREER`, `DEEP_EXPLANATION` | — |
| `context` | `{ courseId, lessonId, moduleId, level }` (+ optional `courseTitle`, `lessonTitle`, `lessonText`) | — |
| `history` | `[{ role: 'user'\|'assistant', text }]`, oldest first, max 12, 1500 chars each | — |
| 200 shape | `{ text, sources?: [{title,url}], mode }` | `{ kind, output }` |
| Refused | 400 shape, 401 token, 403 not enrolled, 413 too long, 429 + `Retry-After` | same, 501 = no provider key |

Statuses matter to the UI, not just the logs: `429` must carry `Retry-After` (the site
shows a countdown on its Retry button), `501` means "route live, key missing" and is
reported as *not configured* rather than an outage, and any failure at all makes the
reply say **ON-DEVICE** instead of pretending to be a cloud answer.

Environment for the reference gateway:

```bash
SUPABASE_URL=https://xxxx.supabase.co            # verifies student tokens + enrolment
SUPABASE_ANON_KEY=...                            # or SUPABASE_SERVICE_ROLE_KEY
ADMIN_TOKEN=...                                   # for /api/ai/generate (admin only)
AI_PROVIDER=openai OPENAI_API_KEY=sk-...           # omit -> 501, site degrades on purpose
CHAT_RATE_PER_MIN=30 ALLOWED_ORIGINS=https://your.site
```

### Simulate it locally (no keys, no deploy)

```bash
node scripts/mock-dantech-gateway.mjs                     # terminal 1  (:8788)
VITE_DANTECH_ENDPOINT=http://localhost:8788/api/dantech/chat npm run dev   # terminal 2
```

Then open `/ai` and send: `hello` (200), `!401`, `!429` (watch the countdown),
`!501`, `!503`, `!empty`, `!garbage`, `!slow` (30s client timeout). Add
`REQUIRE_AUTH=1` to the mock and visit signed-out to see the 401 copy. The mock prints
every request it receives with the bearer token masked and rejects any payload that
breaks the table above — that printout is the verification.
