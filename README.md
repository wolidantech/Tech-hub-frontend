# WOLI DAN TECH HUB — AI-Powered LMS

Complete online learning management system: courses, manual bank-transfer
payments, coupons, quizzes, practical assignments, AI content studio, analytics,
and verifiable certificates.

## Run

```bash
npm install
cp .env.example .env    # then fill in the two VITE_SUPABASE_* values
npm run dev             # http://localhost:5173
npm run build
```

> **A Supabase backend is REQUIRED.** There is no local-store or mock-data mode.
> Every account, course, payment and certificate lives in Postgres. If
> `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing, `SetupGate` blocks
> **every** route — including `/login` and `/courses` — and shows a setup
> checklist instead. That is why an unconfigured deploy looks like "login is
> broken and there are no courses".
>
> Full setup: **[`supabase/README.md`](supabase/README.md)**. Production curriculum
> restore: **[`supabase/seed/README_RUNBOOK.md`](supabase/seed/README_RUNBOOK.md)**.
> Something is configured but still broken: open **`/backend-status`** in the app.

Optional integrations via `.env` (see `.env.example`):

- **Secure AI backend** (`VITE_AI_ENDPOINT`, `VITE_DANTECH_ENDPOINT`) — reference
  gateway in `server/ai-gateway.example.mjs` (AI keys stay server-side only).
  Without these the app falls back to offline AI templates. The site attaches the
  signed-in student's Supabase token to both endpoints, and the chat badge always
  says which engine answered (**ONLINE** vs **ON-DEVICE**). Contract, request body,
  status meanings, and a keyless local simulator: **[`server/README.md`](server/README.md)**.

## Key routes

| Route | Who |
|---|---|
| `/` `/courses` `/course/:slug` | Public |
| `/register` `/login` | Students |
| `/dashboard` `/my-courses` `/my-payments` `/learn/:slug` `/certificates` `/profile` | Students (auth) |
| `/enroll/:slug` (bank transfer + coupons) | Students (auth) |
| `/verify-certificate` `/certificate/:id` | Public |
| `/admin/login` `/admin/dashboard` | Admin |
| `/jamb-cbt` `/jamb-cbt/exam` | Public — JAMB CBT practice (separate exam area) |
| `/backend-status` | Public — **not** gated; diagnoses the backend connection |

Admin tabs: Overview (analytics) • Courses (curriculum builder, thumbnails,
publish, completion rules) • Students (360° control) • Quizzes • Assignments
(review) • Coupons • AI Studio • Payments • Certificates • Notify • Audit • Settings.

## Course catalogue & classroom API

The storefront is **data-driven** — no course is named in frontend code. Categories
come from the API and every filter round-trips to it:

| Endpoint | Used for |
|---|---|
| `GET /api/course-categories` | Category filter chips on `/courses` |
| `GET /api/courses?category_id=&search=&difficulty=&page=&limit=` | Catalogue grid, server-side filtering + pagination |
| `GET /api/classroom/:idOrSlug/outline` | Public course outline on `/course/:slug` (titles + counts only) |
| `GET /api/classroom/:idOrSlug` | Enrolled student's full classroom on `/learn/:slug` (bearer token; 403 without an ACTIVE/COMPLETED enrollment) |

Rules that follow from this:

- Publishing, renaming, re-categorising or archiving a course in the backend
  changes the site on the next fetch — no frontend deploy, no seed file.
- `Science & Laboratory` and `Art & Industrial Design` are pinned as category
  filters. They are *category names* only: the courses shown under them are
  whatever `category_id` (or the API's `category` name filter) returns.
- Difficulty filters send the API's enum (`BEGINNER` / `INTERMEDIATE` / `ADVANCED`).
- The public outline never carries lesson bodies, video URLs or quiz answers;
  those only exist behind the authenticated classroom endpoint.
- Requests carry the signed-in student's Supabase token as `Authorization: Bearer …`
  (same credential the AI gateway uses), so the API enforces access per request.
- If the classroom endpoint is unreachable, `/learn/:slug` falls back to the
  RLS-gated Supabase read so an existing deployment keeps working.

Set `VITE_API_URL` only when the API lives on a different origin; otherwise the
app calls same-origin `/api` and `vite.config.js` proxies it in development.

```bash
npm run mock:api   # stand-in API on :8789 (catalogue + outline + gated classroom)
npm run dev        # proxies /api → :8789, so the storefront works with no backend
```

## JAMB CBT area

`/jamb-cbt` is a **separate** product surface from the course LMS:

- Subject selection, practice vs full mock mode, question navigator, live timer
  with auto-submit, answers saved as you go (survives a reload), server-graded
  results and attempt history.
- **Not wired to Supabase's quiz tables.** Course quizzes (`quizzes`,
  `quiz_questions`, `quiz_attempts`) belong to the classroom; the JAMB area talks
  only to a standalone exam API, which the backend does **not** expose yet
  (`src/lib/jambApi.js` documents the expected contract). Until it lands the page
  says "Exam service not connected yet" and refuses to start a paper rather than
  inventing questions. `npm run mock:api` with `EXAMS=1` fakes it for UI work.
- **Answer keys never reach the browser.** A paper carries
  `{ id, text, options: [{ id, text }] }`; `sanitizeQuestion()` strips any
  key-like field defensively, grading is server-side, and the client only ever
  sends the option ids the student chose. Attempt history stores metadata
  (score, mode, date) — no questions, no keys.

## Mobile (Android + iOS)

The UI is built for phones on both platforms, and `src/tests/mobile.test.jsx`
guards the parts that are easy to lose again:

- `viewport-fit=cover` plus the `env(safe-area-inset-*)` helper classes
  (`mobile-safe-top`, `safe-inline`, `safe-bottom`, `safe-floating-bottom`), so
  nothing hides behind a notch, the Dynamic Island or the Android gesture bar.
- Dialogs/sheets cap their height with `.dialog-panel` (`88dvh` where supported,
  `88vh` as the fallback) instead of `max-h-[90vh]`. `vh` is measured with the
  browser UI hidden, so a `90vh` modal buries its footer behind the URL bar or an
  open keyboard on a phone.
- Fixed full-height panels (classroom sidebar, mobile nav sheet) use `dvh`.
- Form controls are 16px on coarse pointers (iOS auto-zooms below that), carry
  44px minimum tap targets, and declare `autoComplete` / `inputMode` /
  `enterKeyHint` / `autoCapitalize` so password managers and Android autofill
  work and emails, coupon codes, bank references and certificate IDs are never
  autocorrected.
- Clipboard writes go through `copyText()` (`src/lib/utils.js`), which falls back
  to `execCommand` for Android WebViews and in-app browsers (WhatsApp/Instagram
  links); share buttons use `shareOrCopy()` so phones get the native share sheet.
- Hover-only transforms are neutralised on touch devices (a stuck `:hover` makes
  a card's tap area shift), and `prefers-reduced-motion` is honoured.
- Home-screen install ships PNG icons (`public/icon-192.png`, `icon-512.png`,
  `icon-maskable-512.png`, `apple-touch-icon.png`) because iOS ignores an SVG
  `apple-touch-icon`. Regenerate with `node scripts/generate-icons.mjs`.

## Troubleshooting

| Symptom | Almost always means |
|---|---|
| "Backend Setup Required" on every page | `.env` missing, or env vars added to the host without a rebuild |
| "Cannot reach the database" on login | Project paused (free tier pauses after ~1 week idle), URL mistyped, or CORS/origin block |
| Site loads, no courses anywhere | Seed never run, or courses still drafts — RLS hides `published = false` from visitors. Run `supabase/seed/publish_courses.sql` |
| `/admin/login` says "administrators only" | No profile has `role = 'admin'` yet. Run `supabase/seed/make_admin.sql` |
| Register works, then login fails | "Confirm email" is on in Supabase Auth and the user never clicked the link |
| Login fails with "Account setup is incomplete" | Migration 003 was skipped, so the signup trigger never created the profile row |

`/backend-status` runs read-only probes from the visitor's own browser and names
the failing layer (config → URL → key → reachability → auth settings → schema →
catalog) with the fix for each. It also has a **Copy report** button.

## Architecture notes

- `src/context/AuthContext.jsx` — Supabase Auth session, profile load, roles, bans
- `src/lib/api.js` — REST client for the course API (envelope unwrap, bearer auth, honest errors)
- `src/lib/catalogApi.js` — categories, catalogue filters, public outline, gated classroom mappers
- `src/context/CatalogContext.jsx` — catalogue state: categories + courses straight from the API
- `src/lib/jambApi.js` / `src/lib/jambEngine.js` — JAMB CBT exam seam + key-free session logic
- `src/context/CourseContext.jsx` — courses, enrollments, payments, progress, certificates
- `src/context/LMSContext.jsx` — quizzes, assignments, coupons, AI drafts, audit, announcements
- `src/lib/store.js` — the data-access layer; maps Postgres rows to camelCase at the boundary
- `src/lib/supabase.js` — client, error translation (`friendlyError`), uploads, signed URLs, realtime
- `src/lib/backendHealth.js` — read-only backend diagnostics behind `/backend-status`
- `src/lib/lms.js` — shared validation/scoring logic (mirror server-side in prod)
- `src/lib/ai.js` — provider-independent AI service (secure backend → offline fallback)
- All AI output enters as **DRAFT** and requires admin review before publishing.
- Row-level security is the authorization layer: `public.is_admin()` reads
  `profiles.role`, never the JWT, so roles can be revoked without re-issuing tokens.

## Verifying database changes

```bash
cd supabase/verify
npm install
npm run verify        # migrations 001-010 + backend/RLS behavior (47 assertions)
npm run verify:seed   # exact 12-course curriculum seed chain (43 assertions)
```

Both run in throwaway Postgres (PGlite), so they need no Supabase project.
