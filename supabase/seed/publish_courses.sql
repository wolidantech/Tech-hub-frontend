-- ============================================================
-- WOLI DAN TECH HUB — Publish the catalog
-- ------------------------------------------------------------
-- WHY THIS FILE EXISTS
--   seed_12_courses.sql inserts every course with published = false, and the
--   row-level security policy "published courses public" only exposes rows
--   where published = true (or to an admin). So a freshly seeded project has
--   12 courses in the database and a completely EMPTY storefront — visitors
--   and students see nothing, while the admin dashboard shows all 12.
--   That mismatch is the "I can't see any course" report.
--
-- WHAT IT DOES
--   Publishes only courses that already have curriculum, so the storefront
--   never advertises a course a paying student would open to find nothing.
--   Courses with no modules are listed at the end as still-draft.
--
-- HOW TO USE
--   Supabase Dashboard -> SQL Editor -> paste -> Run.
--   Safe to re-run: it only flips eligible rows from false to true and never
--   changes any course from published to unpublished. Note that any draft,
--   unarchived course with a module is eligible each time this file is run.
-- ============================================================

begin;

update public.courses c
   set published = true,
       updated_at = now()
 where c.published = false
   and c.archived = false
   and exists (
         select 1 from public.course_modules m where m.course_id = c.id
       );

commit;

-- ---------- Verify: what a logged-out visitor can now see ----------
select slug, title, price, published, lessons_count
from public.courses
where published = true and archived = false
order by featured desc, created_at;

-- ---------- Still draft: no curriculum yet ----------
-- Build these in Admin -> Courses (or run seed_curriculum.sql first), then
-- re-run this file to publish them.
select c.slug, c.title,
       (select count(*) from public.course_modules m where m.course_id = c.id) as modules
from public.courses c
where c.published = false
order by c.slug;

-- ============================================================
-- OPTIONAL — publish everything regardless of curriculum.
-- Only uncomment if you intentionally want empty courses live
-- (e.g. to take pre-orders before recording lessons).
-- ============================================================
-- update public.courses
--    set published = true, updated_at = now()
--  where published = false and archived = false;
