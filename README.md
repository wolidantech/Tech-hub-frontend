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
| `/security` (passkeys + Google Authenticator) | Students (auth) |
| `/enroll/:slug` `/enroll/bundle/:id` (bank transfer + coupons) | Students (auth) |
| `/verify-certificate` `/certificate/:id` | Public |
| `/admin/login` `/admin/dashboard` | Admin |
| `/jamb-cbt` `/jamb-cbt/exam` | **Paid** JAMB CBT pass — separate exam area |
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
- `Science & Laboratory`, `Art & Industrial Design` and `Business/Commercial`
  are pinned as category filters (the school's three teaching areas). They are
  *category names* only: the courses shown under them are whatever `category_id`
  (or the API's `category` name filter) returns. A pinned name that the backend
  has not created yet still renders as a chip instead of vanishing.
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

`/jamb-cbt` is a **separate, paid** product surface from the course LMS:

- **Paid pass.** Access needs an approved payment on a published
  `exam_access` bundle (`bundles.kind`, migration 011) — the same bank-transfer +
  admin-approval flow as everything else, so there is one payment path and no
  second entitlement table. `src/lib/useJambAccess.js` resolves
  granted / awaiting-approval / locked, and the page shows the price and the
  existing `/enroll/bundle/:id` checkout when it is locked.
- Subject selection, practice vs full mock mode, question navigator, timer,
  answers saved as you go (survives a reload), server-graded results and attempt
  history.
- **The exam contract, as agreed with the backend**
  (`wolidantech/Tech-hub-backend` @ `46025db`). `src/lib/jambApi.js` calls exactly
  these paths, relative to `/api`:

  | Path | Purpose |
  |---|---|
  | `GET /jamb/subjects` | public subject list; `code` is stable and drives mode rules |
  | `POST /jamb/attempts` | `{ subject_ids, mode, question_count }` → paper + `expires_at` |
  | `PUT /jamb/attempts/:attemptId/answers` | debounced autosave `{ answers: [{ attempt_item_id, option_id }] }` |
  | `POST /jamb/attempts/:attemptId/submit` | `{ answers: [{ question_id, option_id }] }` → verdicts + score |
  | `GET /jamb/attempts` | attempt history, merged with device-only runs |

  They stay **configuration**, never guesses: the four required paths come from
  `VITE_EXAM_API_SUBJECTS_PATH`, `VITE_EXAM_API_ATTEMPTS_PATH`,
  `VITE_EXAM_API_SUBMIT_PATH`, `VITE_EXAM_API_HISTORY_PATH`
  (`VITE_EXAM_API_ANSWERS_PATH` is optional). If one is missing the page reports
  "Exam service not connected yet", keeps the attempt on device and calls nothing.
  `npm run mock:api` with `EXAMS=1` implements the whole contract for UI work.
- **Selection rules are mirrored client-side** so a student learns them before a
  request goes out: practice takes **exactly one subject**, and a mock must include
  **Use of English**. The server re-checks both
  (`JAMB_SUBJECT_SELECTION_INVALID`, `JAMB_REQUIRED_SUBJECT_MISSING`).
- **Server states are shown as states, not bugs.**
  `409 JAMB_PAPER_TEMPLATE_UNAVAILABLE` renders as *"That paper is not published
  yet"* — no paper is invented and nothing is charged;
  `403 JAMB_ACCESS_REQUIRED` re-checks the paid gate. **Frontend gating is UX only:
  the server decides**, via `JAMB_ACCESS_MODE=bundle` +
  `JAMB_ACCESS_BUNDLE_TITLE="JAMB CBT pass"` (its defaults) against approved
  `manual_payments` rows on that bundle.
- **Saved answers mean what they say.** With the answers path configured the page
  autosaves (debounced 1.2s) and reports "Saved to your account"; without it the
  copy says "Answers saved on this device only" and no request is sent.
- **The timer belongs to the server.** If the issued paper carries an absolute
  `expires_at`, the countdown is server-owned and survives a refresh
  (`timerSource: 'server'`). Without one the clock is a *display* timer and the UI
  labels it as such — the exam server still decides whether an attempt was in time.
- **Not wired to Supabase's quiz tables.** Course quizzes (`quizzes`,
  `quiz_questions`, `quiz_attempts`) belong to the classroom; a test enforces that
  the JAMB files never import them.
- **Answer keys never reach the browser.** A paper carries
  `{ id, text, options: [{ id, text }] }`; `sanitizeQuestion()` strips any
  key-like field defensively, grading is server-side, and the client only ever
  sends the option ids the student chose. Attempt history stores metadata
  (score, mode, date) — no questions, no keys.

## Sign-in: passkeys and Google Authenticator

Both factors run on Supabase Auth — the frontend holds only the anon key
(`src/lib/supabase.js`; a test fails the build if a service-role key ever appears
in `src/`).

| | Where | What happens |
|---|---|---|
| Passkey (Face ID / fingerprint / device PIN / security key) | `/login`, managed at `/security` | `auth.signInWithPasskey()` runs the WebAuthn ceremony in the browser; `auth.registerPasskey()` + `auth.passkey.*` manage credentials |
| Google Authenticator (TOTP, optional) | `/security`, prompted at `/login` | `auth.mfa.enroll()` → QR + setup key, `auth.mfa.challengeAndVerify()` steps the session from `aal1` to `aal2` |

- **No biometric data is collected.** The fingerprint or face never leaves the
  device; Supabase stores a credential id and a public key. The client labels a
  passkey from the browser string (`deviceLabel()`), not a fingerprinting script.
- Passkeys need the client option `auth.experimental.passkey: true` (set in
  `src/lib/supabase.js`) **and** the Supabase project toggle
  (Authentication → Providers → Passkeys). Without WebAuthn the login page hides
  the passkey panel instead of failing on click.
- After a password sign-in, `auth.mfa.getAuthenticatorAssuranceLevel()` decides
  whether the code step is shown; a password alone never reaches `/dashboard` for
  an account that has a verified factor.

## Student ID cards

The card is **issued by the database**, never fabricated in the browser
(migration 011):

```sql
issue_student_id_card()   -- requires profiles.avatar_url, allocates WDTH-YYYY-NNNNNN,
                          -- idempotent, audited, SECURITY DEFINER
revoke_student_id_card(p_user_id uuid)  -- admin only
```

`student_id_cards` has a single `SELECT` RLS policy (own row, or admin) and **no**
insert/update/delete policy, so a student cannot mint or edit an identity document
— the PGlite harness proves it with real non-owner roles.

On the frontend: registration leads into the onboarding photo step
(`/onboarding`, step 4). Saving that photo stores it on the profile **and then
calls `issue_student_id_card()` automatically** — one action, no extra click —
so the new student's card appears immediately. `src/lib/useStudentIdCard.js`
drives the states (and keeps an issued card when the profile reload races the
insert), and `src/components/student/StudentIdCard.jsx` renders either the issued
card or the honest pending state — **"Upload a photo to generate your ID"** when
the profile has no photo, "Generate my student ID" when it does. The same panel
is on `/profile`.

The card is only minted **after** the authenticated photo is saved, and after
email confirmation when the project requires it — a student who has not
confirmed simply sees the pending state until they do.

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
npm run verify        # migrations 001-011 + backend/RLS behavior (53 assertions)
npm run verify:seed   # exact 12-course curriculum seed chain (43 assertions)
```

Both run in throwaway Postgres (PGlite), so they need no Supabase project.
