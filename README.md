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
> Full setup, in the correct order: **[`supabase/README.md`](supabase/README.md)**.
> Something is configured but still broken: open **`/backend-status`** in the app.

Optional integrations via `.env` (see `.env.example`):

- **Secure AI backend** (`VITE_AI_ENDPOINT`, `VITE_DANTECH_ENDPOINT`) — reference
  gateway in `server/ai-gateway.example.mjs` (AI keys stay server-side only).
  Without these the app falls back to offline AI templates.

## Key routes

| Route | Who |
|---|---|
| `/` `/courses` `/course/:slug` | Public |
| `/register` `/login` | Students |
| `/dashboard` `/my-courses` `/my-payments` `/learn/:slug` `/certificates` `/profile` | Students (auth) |
| `/enroll/:slug` (bank transfer + coupons) | Students (auth) |
| `/verify-certificate` `/certificate/:id` | Public |
| `/admin/login` `/admin/dashboard` | Admin |
| `/backend-status` | Public — **not** gated; diagnoses the backend connection |

Admin tabs: Overview (analytics) • Courses (curriculum builder, thumbnails,
publish, completion rules) • Students (360° control) • Quizzes • Assignments
(review) • Coupons • AI Studio • Payments • Certificates • Notify • Audit • Settings.

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
npm run verify        # migrations 001-005 behaviorally (41 assertions)
npm run verify:seed   # the seed chain -> non-empty storefront + first admin
```

Both run in throwaway Postgres (PGlite), so they need no Supabase project.
