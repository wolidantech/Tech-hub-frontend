# Supabase setup — WOLI DAN TECH HUB

The frontend has **no** offline mode. Supabase is the only source of truth for
accounts, courses, payments and certificates, and `SetupGate` blocks every route
until it is connected. Follow the steps **in order** — each one depends on the
previous.

If you are here because the site is broken rather than new, jump to
[Diagnosing a broken site](#diagnosing-a-broken-site).

---

## 1. Create the project

1. [supabase.com](https://supabase.com) → **New project**. Pick a strong database
   password and a region near your users (e.g. London or Frankfurt for Nigeria).
2. Wait for provisioning to finish.

> **Free-tier projects pause automatically** after roughly a week of inactivity.
> A paused project answers every request with an error, which the app reports as
> "Cannot reach the database". Restore it from the dashboard, or use the Pro plan.

## 2. Run the migrations — in numeric order

Dashboard → **SQL Editor** → paste each file → **Run**. One file at a time,
in this order:

| # | File | What it gives you |
|---|---|---|
| 1 | `migrations/001_lms_core.sql` | profiles, courses, curriculum, enrollments, payments, certificates, quizzes, assignments, coupons + row-level security |
| 2 | `migrations/002_phase2_community.sql` | discussions, reviews, bundles, learning paths, site settings |
| 3 | `migrations/003_production_backend.sql` | **the signup trigger**, scoring/approval RPCs, XP, storage buckets, RLS hardening |
| 4 | `migrations/004_notify_and_counts.sql` | notification fan-out, server-maintained counters |
| 5 | `migrations/005_showcase_reads.sql` | public showcase reads |
| 6 | `migrations/006_payment_notes.sql` | payer notes for manual payment review |
| 7 | `migrations/007_classroom_upgrade.sql` | expanded lesson types and lesson activity |
| 8 | `migrations/008_cv_builder_and_study_tools.sql` | saved CVs, notes and bookmarks |
| 9 | `migrations/009_fix_is_admin_recursion.sql` | recursion-safe admin helper and archived-course RLS scope |

> **Do not skip 003 or 009.** 003 owns `on_auth_user_created`, the trigger that
> creates a `profiles` row when someone registers. Without it, authentication succeeds but
> the app immediately signs the user back out with *"Account setup is incomplete"*
> — which looks exactly like "users are unable to login". Without 009, guarded
> queries can fail with `stack depth limit exceeded` because `is_admin()` reads
> the same RLS-protected `profiles` table whose policies call it. Migration 009
> also pins the two legacy `SECURITY DEFINER` functions that lacked a fixed
> search path; the verifier checks that no elevated `public` function is left
> unpinned.

## 3. Seed the catalog

Same place, one file at a time:

| File | Effect |
|---|---|
| `seed/seed_12_courses.sql` | 12 courses + categories, **as drafts** |
| `seed/seed_curriculum.sql` | 48 modules, 192 lessons, bodies, resources, YouTube videos, quizzes and projects |
| `seed/publish_courses.sql` | flips `published = true` on eligible courses that have modules |
| `seed/seed_learning_paths.sql` | four published paths over the launch catalog |

For production restoration and large-file SQL Editor instructions, follow
[`seed/README_RUNBOOK.md`](seed/README_RUNBOOK.md).

> **This is the step people miss.** Seeded courses are drafts, and the policy
> `published courses public` only exposes `published = true` to anyone who is not
> an admin. So after seeding you have 12 rows in the database and a **completely
> empty storefront** — while the admin dashboard shows all 12. Run
> `publish_courses.sql` (or publish them from Admin → Courses).
>
> The seed chain is idempotent: re-running does not duplicate canonical seed rows,
> and `publish_courses.sql` never changes a published course to unpublished. Any
> draft, unarchived course with a module is eligible for publishing on each run.
>
> `seed_curriculum.sql` is generated from `src/data/courses.js` by
> `node seed/generate_curriculum.mjs`. It includes one curated YouTube video,
> written body, and resource list for every one of the 192 launch lessons.

## 4. Create the first administrator

New accounts are always created with `role = 'student'`, and `/admin/login`
rejects everyone else. Nothing in the UI can promote you, so:

1. Register on the site normally with the email you want as the admin.
2. Run `seed/make_admin.sql` in the SQL Editor, editing the `TARGET EMAIL` line
   first. It refuses to run with the placeholder still in place.
3. Log in at `/admin/login`.

## 5. Connect the frontend

Dashboard → **Project Settings** → **API**. Copy:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon / publishable** key → `VITE_SUPABASE_ANON_KEY`

```bash
cp .env.example .env
# edit .env with the two values
npm run dev
```

> **Never put the `service_role` / secret key in a `VITE_` variable.** Vite inlines
> it into the public bundle, and that key bypasses every row-level security
> policy — anyone could read and write the whole database. If it was ever
> committed or deployed, rotate it immediately. `/backend-status` detects a secret
> key and says so.

For a hosted deploy (Vercel / Netlify / Railway), add the same two variables in
the host's environment settings **and redeploy**. Vite bakes `import.meta.env` at
build time, so a restart without a rebuild changes nothing.

## 6. Configure auth URLs

Dashboard → **Authentication** → **URL Configuration**:

- **Site URL** — your production origin (e.g. `https://yourdomain.com`)
- **Redirect URLs** — add every origin the app runs on, including
  `http://localhost:5173` for development

Password-reset links (`/update-password`) and email confirmations break without
this. Also check **Authentication → Providers → Email**: if **Confirm email** is
on, a new user cannot log in until they click the link in their inbox, and if
**Disable signups** is on, `/register` fails for everyone. `/backend-status`
reports both.

---

## Diagnosing a broken site

### Quick triage — no deploy needed

Run these first; they take a minute and isolate the layer.

**Is the project reachable?** From a terminal (use your real URL):

```bash
curl -i "https://YOUR-PROJECT.supabase.co/auth/v1/health"
```

| Result | Meaning |
|---|---|
| `200` | Reachable — the problem is the schema, the seed, or the frontend build |
| `540` / mentions pausing | **Project paused.** Restore it in the dashboard |
| `401` | API key wrong or rotated |
| `404` | URL wrong, or the project was deleted |
| connection fails / hangs | DNS, firewall, ad-blocker, or the project is gone |

**Is the catalog actually visible?** In the SQL Editor:

```sql
-- If published = 0 while total > 0, the storefront is empty by design: run publish_courses.sql
select count(*) as total,
       count(*) filter (where published and not archived) as published
from public.courses;

-- No rows here means nobody can reach /admin/login: run make_admin.sql
select email, role from public.profiles where role = 'admin';

-- No rows here means migration 003 is missing, so every login fails
select trigger_name from information_schema.triggers
where trigger_name = 'on_auth_user_created';
```

**Is the frontend build actually carrying the variables?** In the browser console
on the deployed site:

```js
performance.getEntriesByType('resource')
  .map(r => r.name).filter(n => n.includes('supabase'))
```

No `supabase` requests at all means the env vars were never inlined — they were
added to the host without a rebuild, or the names are missing the `VITE_` prefix.

### In-app diagnostics

Open **`/backend-status`** in the running app. It is deliberately *outside*
`SetupGate`, so it works even when the rest of the site is blocked. It probes
config → URL format → key type/expiry → reachability → auth settings → schema →
catalog, and prints the cause plus the fix for each layer. **Copy report** gives
you a plain-text version to paste into an issue.

Everything it does is a read-only GET against public endpoints, and it never
prints the key.

### Symptom → cause

| Symptom | Cause | Fix |
|---|---|---|
| "Backend Setup Required" everywhere | env vars absent from the build | Step 5, then rebuild/redeploy |
| "Cannot reach the database" | project paused, URL mistyped, or CORS/origin blocked | The diagnostics page separates these three; check the dashboard first |
| Site loads, zero courses | drafts hidden by RLS | Step 3 — `publish_courses.sql` |
| Courses visible to you but not to visitors | you are an admin; admins bypass the published filter | Log out and re-check in a private window |
| `/admin/login` → "administrators only" | no admin profile exists | Step 4 |
| Register OK, login fails | email confirmation pending | Confirm the email, or turn the setting off |
| Login → "Account setup is incomplete" | migration 003 missing | Re-run 003, then re-register |
| Login → "Invalid email or password" for everyone | users registered before the trigger existed, so they have no profile row | Re-run 003; affected users must reset their password or re-register |

### Verifying changes before you deploy them

```bash
npm ci
npm --prefix supabase/verify ci
npm run verify        # migrations 001-009 + backend and non-owner RLS checks
npm run verify:seed   # seed chain → full curriculum + published catalog
```

Both run in throwaway Postgres (PGlite) — no project, no network, no cleanup.

> Most behavioral fixtures run as the PGlite owner. The dedicated authorization
> checks switch to non-owner `anon`/`authenticated` roles so PostgreSQL enforces
> course, curriculum, body and video RLS. Production should still be smoke-tested
> logged out and with an approved test enrollment before release.
