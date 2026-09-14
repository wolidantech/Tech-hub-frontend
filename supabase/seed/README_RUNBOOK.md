# Curriculum restore runbook

Use this runbook for the WOLI DAN TECH HUB Supabase project. It is intentionally
credential-free: all production actions are performed by an authorized operator
in the Supabase Dashboard SQL Editor.

## Safety rules

- Confirm the Dashboard header shows project ref **`vlfgnuxacprjeauqyvig`**
  (West EU / Ireland) before running production SQL.
- Take a database backup/snapshot first.
- Do not put a database password, service-role key, access token, or SQL Editor
  connection string in this repository.
- The checked-in seeds are idempotent, but they are not a substitute for a
  backup. Run one complete file at a time and inspect its result before moving
  on.
- Do **not** delete or merge the custom `video-editing-with-capcut` course during
  this restore. Its decision plan is below.

## Exact order

### Fresh project

Run each migration as a separate SQL Editor query, in numeric order:

1. `supabase/migrations/001_lms_core.sql`
2. `supabase/migrations/002_phase2_community.sql`
3. `supabase/migrations/003_production_backend.sql`
4. `supabase/migrations/004_notify_and_counts.sql`
5. `supabase/migrations/005_showcase_reads.sql`
6. `supabase/migrations/006_payment_notes.sql`
7. `supabase/migrations/007_classroom_upgrade.sql`
8. `supabase/migrations/008_cv_builder_and_study_tools.sql`
9. `supabase/migrations/009_fix_is_admin_recursion.sql`

Then run these files, one at a time, in this exact order:

1. `supabase/seed/seed_12_courses.sql`
2. `supabase/seed/seed_curriculum.sql`
3. `supabase/seed/publish_courses.sql`
4. `supabase/seed/seed_learning_paths.sql`
5. `supabase/verify/verify_curriculum.sql` (read-only verification)

In short: **migrations 001–008 → migration 009 → 12-course catalog → curriculum
→ publish eligible courses → four learning paths → verify**.

`setup_full_catalog.sql` is the generated combination of the four seed files and
is useful for a brand-new project. For a production repair, the separate files
above provide clearer per-step results and are preferred.

### Existing live project

Migrations 001–008 already exist in the live project and the `is_admin()` hotfix
was applied there manually. Do not paste old migrations over the live schema.
Apply the checked-in sequence below so migration history and data are repaired:

1. Run `009_fix_is_admin_recursion.sql`. It safely recreates `is_admin()` and is
   idempotent, even when the equivalent hotfix is already present.
2. Run `seed_12_courses.sql`. Existing slug rows are updated without changing
   their `published`/`featured` flags; missing launch rows are inserted as drafts.
3. Run `seed_curriculum.sql` in one execution.
4. Run `publish_courses.sql`. It only changes `published = false` to `true` for
   unarchived courses that have at least one module. It never sets any course to
   unpublished. A previously published empty custom course therefore remains a
   separate cleanup decision and will be exposed by verification.
5. Run `seed_learning_paths.sql`.
6. Run `verify_curriculum.sql` and save/export the result for the release record.

## Pasting the ~1 MB curriculum in SQL Editor

`seed_curriculum.sql` is approximately 0.92 MB and 16,800 lines. Do not copy it
from a rendered GitHub preview, which can truncate large files.

1. Open the raw local file in a code editor.
2. Select all and copy. Confirm the copied text starts with the generated-file
   header and contains `begin;`, and that the end contains `commit;` followed by
   the verification `select`.
3. In Supabase Dashboard, open **SQL Editor → New query**. Give it a name such as
   `2026-09-14 restore launch curriculum`.
4. Click inside the empty editor and paste once. Wait for syntax highlighting to
   settle; do not run a selected fragment.
5. Click **Run** once. Keep the tab open until the result grid appears. The script
   is transactional: a SQL error before `commit` rolls back that execution.
6. Check the result grid before continuing. Every launch slug should show 16
   cached lessons, four modules, and 16 videos.
7. If the browser/editor cannot submit the full paste, stop rather than running
   arbitrary chunks. Use the Dashboard's direct database connection with `psql`
   from a trusted operator machine and the same complete file, or ask a Supabase
   project administrator to run the saved query. Never paste that connection
   password into source control or chat.

The curriculum seed begins with a guard that lists any missing launch slug and
aborts before writing. Re-running the same complete file matches modules and
lessons by their course/module/title keys, upserts bodies, updates resources,
and does not duplicate the canonical video URL.

## Expected end state

For each of these 12 launch slugs:

- `published = true` and `archived = false`
- 4 modules
- 16 lessons (`courses.lessons_count = 16`)
- 16 full written bodies
- 16 published YouTube video rows
- resources on all 16 lessons

Launch slugs:

- `ai-video-content-creation`
- `video-editing-capcut`
- `graphic-design-canva`
- `digital-marketing`
- `mobile-app-development`
- `portfolio-creation`
- `frontend-web-development`
- `web-design-wordpress`
- `ui-ux-design-figma`
- `microsoft-excel`
- `microsoft-word`
- `microsoft-powerpoint`

There should also be exactly four published learning paths, all referencing real
course IDs. On a clean database this means exactly 12 published courses. On the
existing project, the total may be higher if an already-published custom course
is intentionally retained; `publish_courses.sql` never unpublishes it.

Results 3 and 4 in `verify_curriculum.sql` are launch release blockers and must
both be empty; each returned row names the exact failed count/state. Result 5
lists custom or legacy courses with zero lessons. For the known live data,
`video-editing-with-capcut` is expected there until its separate merge/archive
decision is completed. None of the 12 launch slugs may appear in result 5.

## Authorization checks

Migration 009 keeps authorization in PostgreSQL RLS:

- anonymous users can select only courses where `published = true` and
  `archived = false`;
- anonymous users can read module/lesson titles only for those public courses;
- written lesson bodies remain visible only to an active enrollment or admin;
- only published video metadata is visible to an active enrollment (admins can
  also inspect non-published rows);
- private uploaded video objects remain independently protected by Storage RLS.

The frontend's enrollment redirects are only friendly UX. They do not grant
access and do not replace these policies.

## Migration 009 test and function audit

The repository verification uses **PGlite, a fresh disposable PostgreSQL
instance**, not the live project. `npm run verify` applies migrations 001–009 in
order and checks that `public.is_admin()` is `SECURITY DEFINER` with
`search_path=public`. It then switches to non-owner `anon`/`authenticated` test
roles to verify:

- calling `is_admin()` and selecting `profiles` completes without recursion;
- anon sees a published/unarchived course but not draft or archived courses;
- anon sees no body/video rows;
- an actively enrolled student sees the body and published video;
- an admin passes the same role lookup.

A grep/audit of every migration-defined function found no second instance of
the same RLS-recursion anti-pattern. It did find two early `SECURITY DEFINER`
functions (`verify_certificate` and `enroll_bundle_courses`) without a fixed
search path; migration 009 pins both to `public`. The verifier fails if any
elevated `public` function remains unpinned. The remaining invoker-rights
helpers (`touch_updated_at` and the ID/code generators) do not query protected
tables and are not called by policies.

Run locally with:

```bash
npm ci
npm --prefix supabase/verify ci
npm run verify
npm run verify:seed
npm test
npm run build
```

## CapCut duplicate: recommendation (do not delete during restore)

### Current comparison

The canonical seed course is `video-editing-capcut`: category **Video & Media**,
4 modules, 16 lessons, written bodies, resources, videos, final quiz, and final
project. The custom `video-editing-with-capcut` row is category **General** and
currently has no lessons. The title similarity does not make their UUIDs
interchangeable: enrollments, payments, certificates, paths, and progress point
to course IDs, not display titles.

Use this read-only inventory before deciding:

```sql
select c.id, c.slug, c.title, c.category, c.price, c.published, c.archived,
       (select count(*) from public.course_modules m where m.course_id = c.id) modules,
       (select count(*) from public.course_lessons l where l.course_id = c.id) lessons,
       (select count(*) from public.enrollments e where e.course_id = c.id) enrollments,
       (select count(*) from public.manual_payments p where p.course_id = c.id) payments,
       (select count(*) from public.certificate_issues x where x.course_id = c.id) certificates,
       (select count(*) from public.lesson_progress g where g.course_id = c.id) progress_rows
from public.courses c
where c.slug in ('video-editing-capcut', 'video-editing-with-capcut')
order by c.slug;
```

### Recommended merge/archive plan

1. Make `video-editing-capcut` the canonical destination because all seeded
   curriculum and learning-path references already target it.
2. Back up the database and inventory **all** foreign keys referencing the custom
   course UUID. Reconcile approved payments and enrollment status per student.
3. In one reviewed transaction, upsert each custom-course enrollment onto the
   canonical course. If a student already has both, retain one canonical row and
   preserve the strongest access state (`active` over `completed` over `removed`)
   according to the business decision. Preserve payment IDs/approval evidence.
4. Repoint payment, certificate, notification, activity/progress, discussion,
   submission, and other auditable references only after the owner approves the
   accounting implications. Payment rows must not be deleted; their amount,
   reference, receipt, approval, and timestamps are financial history.
5. Validate that every paid/approved student can open the canonical classroom and
   that no certificate or progress row is orphaned.
6. Set the custom course to `published = false, archived = true` first. Keep it as
   an audit record through a reconciliation period. Add an application redirect
   for old shared links if those links exist.
7. Hard-delete only after backup, owner sign-off, zero remaining references, and
   a completed reconciliation report. Archiving indefinitely is safer than
   deleting a course that ever received a payment.

If the custom course has zero enrollments, payments, certificates, progress, and
other references, archive it and later delete it after the same backup/sign-off
process. This runbook intentionally provides no production deletion statement.
