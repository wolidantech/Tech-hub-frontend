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
npm run verify        # migrations 001-009 behaviorally (53 assertions)
npm run verify:seed   # the seed chain -> non-empty storefront + first admin
```

Both run in throwaway Postgres (PGlite), so they need no Supabase project.

## Classroom curriculum runbook (empty-classroom fix)

Live classrooms read their content ONLY from Supabase. If the course page shows
a preview but the classroom is empty, the fix is data + migration order, on the
SQL Editor, exactly this sequence:

1. `supabase/migrations/001…009` in order (009 = topics, practicals,
   downloadable resources, practical submissions, numeric quizzes).
2. `supabase/seed/setup_full_catalog.sql` — one paste, idempotent: courses,
   4 modules × 4 lessons per course with full lesson bodies, real YouTube
   videos, curated resources, per-module topic rows when the data declares
   them, final quizzes, final projects and certificate completion rules.
3. `supabase/seed/publish_courses.sql` — publish any course whose curriculum
   just landed (RLS hides drafts from students by design).

Verify with (anon key, in the SQL editor or REST):

```sql
select c.slug, count(distinct m.id) as modules,
       count(l.id) as lessons,
       count(cc.id) as bodies,
       count(cv.id) as videos,
       count(r.id) as resources,
       count(p.id) as practicals
from courses c
left join course_modules m on m.course_id = c.id
left join course_lessons l on l.course_id = c.id
left join course_content cc on cc.lesson_id = l.id
left join course_videos cv on cv.lesson_id = l.id
left join course_resources r on r.course_id = c.id
left join lesson_practicals p on p.course_id = c.id
where c.published and not c.archived
group by c.slug order by c.slug;
```

Any row with `modules = 0` means the backend host has not published that
course's curriculum yet — the UI renders an honest “no curriculum yet” state
instead of fake content. The frontend probes which curriculum tables exist
(`src/lib/schema.js`) so it works on both the frontend lineage
(`course_lessons`/`course_content`/`course_videos`) and projects that also ran
the backend repo's content pipeline (`lessons`/`lesson_content`/`lesson_videos`,
`course_resources`, `lesson_practicals`).

### Local full-stack preview without a Supabase project (dev only)

```bash
node tools/mock-supabase.mjs          # real SQL: 001-009 + production seed on PGlite
echo 'VITE_SUPABASE_URL=http://127.0.0.1:54321' > .env.local
echo 'VITE_SUPABASE_ANON_KEY=eyJhbGciOiJub25lIn0.mock.dev-key' >> .env.local
npm run dev                            # log in as ada@example.com / demo1234
node tools/e2e-smoke.mjs               # 31-point end-to-end data-path check
```

Never deploy `tools/mock-supabase.mjs` or `.env.local`; the mock exists so the
classroom pipeline can be exercised where no live project is reachable.
