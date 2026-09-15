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

### Fast path (any project that already has migrations 001–009)

One paste, one Run:

1. `supabase/seed/setup_full_catalog.sql` — the 12 courses, the full curriculum,
   publishing and the 4 learning paths, in the correct order, in one file.
2. `supabase/verify/verify_curriculum.sql` (read-only verification).

`setup_full_catalog.sql` is generated from the four files below by
`node supabase/seed/generate_setup.mjs`, so it can never drift from them. Use the
step-by-step order below when you want a per-step result grid (a production repair
where you want to see each stage land), or when a step has to be repeated alone.

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

## Pasting the curriculum in SQL Editor (fast path)

`seed_curriculum.sql` is approximately 0.39 MB and 6,200 lines, and it runs as
about **25 statements**. That is the whole point of its shape: the curriculum is
loaded into three temp payload tables with one multi-row `values` insert each and
then fanned out with set-based statements, instead of one statement per lesson per
table.

Measured on a throwaway Postgres (PGlite) with the same 12×4×4 curriculum —
`cd supabase/verify && npm run bench:seed`:

| Shape | Lines | Size | Semicolons | Cold run | Idempotent re-run |
|---|---|---|---|---|---|
| one statement per lesson (old) | 16,874 | 894 KB | 1,571 | 705 ms | 527 ms |
| set-based payload fan-out (this file) | 6,169 | 385 KB | 410 | 105 ms | 54 ms |

The wall-clock gap is far bigger in the dashboard than in these numbers, because
the SQL Editor tokenizes the paste and renders a result grid per statement: a
~1,570-statement script is what made the editor sit on "Running query…" or crash
the tab. Fewer, larger statements is also why the file starts with
`set local statement_timeout = 0;` and `set local synchronous_commit = off;`
(both local to this transaction only — the rollback guarantees are unchanged).

Do not copy the file from a rendered GitHub preview, which can truncate large
files. To get the exact bytes onto the clipboard fast:

```bash
# macOS
pbcopy < supabase/seed/seed_curriculum.sql
# Windows PowerShell
Get-Content -Raw supabase/seed/seed_curriculum.sql | Set-Clipboard
# Linux (X11 / Wayland)
xclip -selection clipboard -in supabase/seed/seed_curriculum.sql
wl-copy < supabase/seed/seed_curriculum.sql
```

1. Open the raw local file in a code editor (or use the clipboard command above).
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

Each of the 12 launch **subjects** — evaluated against whichever row students can
actually open, i.e. the live custom twin where one exists (see
[Course catalog topology](#course-catalog-topology-what-correct-means-on-this-project)):

- `published = true` and `archived = false`
- 4 modules
- 16 lessons (`courses.lessons_count = 16`)
- 16 full written bodies
- 16 published YouTube video rows
- resources on all 16 lessons
- 1 published final quiz with 10 questions, 1 published final project, and 1
  completion-rule row (these three are what gate the certificate)

Launch subjects, by original slug: `ai-video-content-creation`,
`video-editing-capcut`, `graphic-design-canva`, `digital-marketing`,
`mobile-app-development`, `portfolio-creation`, `frontend-web-development`,
`web-design-wordpress`, `ui-ux-design-figma`, `microsoft-excel`, `microsoft-word`,
`microsoft-powerpoint`.

There must also be exactly four published learning paths, and every step of each
must point at a course that is published AND not archived.

On a clean database this means exactly 12 published courses. On the existing
project there are 18 rows and 12 visible: the five superseded duplicates and the
junk placeholder stay archived, and `publish_courses.sql` never touches an
archived row in either direction.

Results 3 and 4 in `verify_curriculum.sql` are launch release blockers and must
both be empty; each returned row names the exact failed count/state. Result 3b is
informational — the superseded originals with their enrollment/payment/certificate
counts (all zero today), as reconciliation evidence. Result 5 lists courses with
zero lessons; today that should be `video-eiting` only, because the five twins
hold cloned curricula. If a *launch* slug appears in result 5, its twin was never
populated and students would open an empty course.

## Course catalog topology (what "correct" means on this project)

The live catalog was consolidated after the seed chain ran, and it no longer
matches a fresh project one-to-one. Both topologies are supported by the seeds;
nothing here may be "fixed" by unarchiving:

| Group | Slugs | State |
|---|---|---|
| Launch courses taught directly | `ai-video-content-creation`, `digital-marketing`, `frontend-web-development`, `microsoft-excel`, `microsoft-word`, `microsoft-powerpoint`, `portfolio-creation` | `published = true`, `archived = false` |
| Live custom twins (the real content) | `graphic-design-with-canva`, `mobile-application-development`, `ui-ux-design-with-figma`, `video-editing-with-capcut`, `web-design-with-wordpress` | `published = true`, `archived = false`, cloned curriculum |
| Superseded seed duplicates — **never unarchive, never reference** | `graphic-design-canva`, `mobile-app-development`, `ui-ux-design-figma`, `video-editing-capcut`, `web-design-wordpress` | `archived = true` (and unpublished), 0 enrollments |
| Junk placeholder | `video-eiting` | `archived = true`, placeholder lessons, 0 enrollments |

18 rows total, **12 visible to students**. The storefront rule is
`published = true AND archived = false` — enforced by RLS for anonymous visitors
and applied identically in the app (`isCatalogCourse` in `src/lib/lms.js`) so an
admin's list can never show a duplicate next to its live twin.

Because of this, the curriculum seed still writes the 12 launch subjects (the
archived rows keep their curriculum as the source of truth for the twins and for
a future fresh project), while **learning paths, UI and analytics must only ever
reference the visible row**. `verify_curriculum.sql` reflects that: result 3
checks the contract per subject (twin preferred), and result 3b lists the
superseded originals with their enrollment/payment/certificate counts as
reconciliation evidence.

> **Check the twins actually hold the assessments.** Cloning a curriculum in the
> admin UI copies modules, lessons and bodies; a quiz or assignment that was
> created on the duplicate stays behind on it, and completion rules gate the
> certificate. Read-only check — run it and expect 1/10/1/1 per twin:
>
> ```sql
> select c.slug, c.title,
>        (select count(*) from public.quizzes q
>          where q.course_id = c.id and q.is_final and q.status = 'published') as final_quizzes,
>        (select count(*) from public.quizzes q
>          join public.quiz_questions qq on qq.quiz_id = q.id
>          where q.course_id = c.id and q.is_final and q.status = 'published') as final_questions,
>        (select count(*) from public.assignments a
>          where a.course_id = c.id and a.is_final_project and a.status = 'published') as final_projects,
>        (select count(*) from public.course_completion_rules r where r.course_id = c.id) as completion_rules
> from public.courses c
> where c.slug in ('graphic-design-with-canva', 'mobile-application-development',
>                  'ui-ux-design-with-figma', 'video-editing-with-capcut',
>                  'web-design-with-wordpress')
> order by c.slug;
> ```
>
> A twin reporting `0` final quizzes/questions/projects/rules cannot award a
> certificate even at 100% lesson progress. Copy them across with the same
> insert-select pattern the curriculum seed uses (never by deleting the source
> rows), and re-run `verify_curriculum.sql`.

## Repointing learning-path steps (only if paths already exist)

`seed_learning_paths.sql` never overwrites an existing path, so on a project
whose paths were seeded **before** the consolidation, their steps still point at
the archived duplicates. `/learning-paths` then renders short paths for students
and dead links for admins. `verify_curriculum.sql` result 4 names them
(`unopenable learning-path step`).

This repair is deliberately a separate, reviewed statement rather than part of
the seed, so a routine re-run can never clobber a path an admin curated. It only
touches the four launch titles, is idempotent, and rewrites a step only when a
strictly better (visible) course exists for it:

```sql
-- Review first: what do the launch paths point at right now?
select lp.title, cid.i as step, c.slug, c.published, coalesce(c.archived, false) as archived
from public.learning_paths lp
cross join lateral unnest(lp.course_ids) with ordinality as cid(id, i)
left join public.courses c on c.id = cid.id
where lp.title = any (array['Web & Mobile Developer', 'Digital Creator',
                            'Office Productivity Pro', 'Digital Business Growth'])
order by lp.title, cid.i;

-- Then repoint, in one transaction.
begin;
create temp table _path_fix (title text, step int, candidates text[]) on commit drop;
insert into _path_fix (title, step, candidates) values
  ('Web & Mobile Developer', 1, array['frontend-web-development']),
  ('Web & Mobile Developer', 2, array['web-design-with-wordpress','web-design-wordpress']),
  ('Web & Mobile Developer', 3, array['ui-ux-design-with-figma','ui-ux-design-figma']),
  ('Web & Mobile Developer', 4, array['mobile-application-development','mobile-app-development']),
  ('Web & Mobile Developer', 5, array['portfolio-creation']),
  ('Digital Creator',        1, array['ai-video-content-creation']),
  ('Digital Creator',        2, array['video-editing-with-capcut','video-editing-capcut']),
  ('Digital Creator',        3, array['graphic-design-with-canva','graphic-design-canva']),
  ('Digital Creator',        4, array['digital-marketing']),
  ('Digital Creator',        5, array['portfolio-creation']),
  ('Office Productivity Pro',1, array['microsoft-word']),
  ('Office Productivity Pro',2, array['microsoft-excel']),
  ('Office Productivity Pro',3, array['microsoft-powerpoint']),
  ('Digital Business Growth',1, array['digital-marketing']),
  ('Digital Business Growth',2, array['graphic-design-with-canva','graphic-design-canva']),
  ('Digital Business Growth',3, array['ai-video-content-creation']),
  ('Digital Business Growth',4, array['portfolio-creation']);

update public.learning_paths lp
   set course_ids = (
         select array_agg(
                  coalesce(
                    (select c.id from public.courses c
                      where c.slug = any(f.candidates) and c.published and not coalesce(c.archived, false)
                      order by array_position(f.candidates, c.slug) limit 1),
                    lp.course_ids[f.step])
                order by f.step)
           from _path_fix f where f.title = lp.title
       ),
       updated_at = now()
 where lp.title = any (select distinct title from _path_fix);
commit;

-- Must return zero rows (see result 4 of verify_curriculum.sql):
select lp.title, cid.i, c.slug, c.published, coalesce(c.archived, false) as archived
from public.learning_paths lp
cross join lateral unnest(lp.course_ids) with ordinality as cid(id, i)
join public.courses c on c.id = cid.id
where c.archived or not c.published;
```

Enrollments, payments, progress and certificates are keyed on course **ids**, so
repointing a path changes no student's access. Do not "fix" an archived slug by
unarchiving it — that puts a second, identical course back in the storefront.

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

## The consolidated duplicates (decision already taken)

This section used to recommend archiving the custom CapCut course. **The
decision went the other way and is settled**: all five seed duplicates were
archived and the custom twins kept, each holding a clone of its counterpart's
curriculum. Do not reopen that choice during a restore — in particular, never
unarchive a seed duplicate, and never delete a course that ever received a
payment. The remaining work is purely bookkeeping, in this order:

1. Confirm every twin is complete (assessments in particular — see the query in
   [Course catalog topology](#course-catalog-topology-what-correct-means-on-this-project)).
2. Repoint the four learning paths if their steps still name archived slugs
   (see [Repointing learning-path steps](#repointing-learning-path-steps-only-if-paths-already-exist)).
3. Keep the archived rows as audit records. Only after backup, owner sign-off and
   a reconciliation report showing zero references may any of them be deleted.

The one duplicate that carries money today is `video-editing-with-capcut`
(1 paid enrollment) — it is the **live twin**, not the archived row, so no
reconciliation is required to keep it visible; the archived
`video-editing-capcut` has 0 enrollments (result 3b proves it on every run).

### Why the UUIDs are not interchangeable

The seed course `video-editing-capcut` and the custom `video-editing-with-capcut`
look the same by title, but enrollments, payments, certificates, learning-path
steps and progress rows all point at course **ids**, never display titles. That is
exactly why a path step must be re-pointed at the twin's id rather than "fixed"
by renaming or unarchiving a slug.

### Inventory query (read-only)

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

Read it as: the **twin** (`video-editing-with-capcut`) is published and carries
the paid enrollment; the **seed duplicate** is archived with zero references and
stays that way. If a future run shows a nonzero reference count on the archived
side, that is a reconciliation task for the owner — not a reason to unarchive.

### If a duplicate ever has to be merged for real

Only if a paid enrollment is ever found stranded on an archived row. Then, and
only then: back up, inventory every foreign key referencing that course id,
repoint enrollments first (keeping the strongest access state: `active` over
`completed` over `removed`), then payments/certificates/progress/discussions/
submissions with the owner's sign-off, verify each paid student can open the
classroom, archive the empty row, and delete nothing until the reconciliation
report is closed. Payment rows are financial history and are never deleted. A
duplicate that has zero enrollments, payments, certificates and progress may be
archived now and deleted later under the same backup/sign-off process — this
runbook intentionally provides no production deletion statement.
