-- ============================================================
-- READ-ONLY CURRICULUM VERIFICATION
-- Run in Supabase Dashboard -> SQL Editor after the seed chain.
-- This file changes no data.
-- ============================================================

-- 1) Per-course inventory. The 12 launch courses should each report:
--    4 modules, 16 lessons, 16 bodies, 16 videos, 16 published videos.
with module_counts as (
  select course_id, count(*)::int as modules
  from public.course_modules
  group by course_id
), lesson_counts as (
  select course_id,
         count(*)::int as lessons,
         count(*) filter (where jsonb_array_length(coalesce(resources, '[]'::jsonb)) > 0)::int as lessons_with_resources
  from public.course_lessons
  group by course_id
), body_counts as (
  select l.course_id,
         count(cc.id)::int as bodies,
         count(*) filter (where length(coalesce(cc.body_markdown, '')) > 300)::int as full_bodies
  from public.course_lessons l
  left join public.course_content cc on cc.lesson_id = l.id
  group by l.course_id
), video_counts as (
  select l.course_id,
         count(v.id)::int as videos,
         count(*) filter (where v.status = 'published')::int as published_videos
  from public.course_lessons l
  left join public.course_videos v on v.lesson_id = l.id
  group by l.course_id
)
select c.slug,
       c.title,
       c.published,
       coalesce(c.archived, false) as archived,
       coalesce(mc.modules, 0) as modules,
       coalesce(lc.lessons, 0) as lessons,
       coalesce(bc.bodies, 0) as bodies,
       coalesce(bc.full_bodies, 0) as full_bodies,
       coalesce(vc.videos, 0) as videos,
       coalesce(vc.published_videos, 0) as published_videos,
       coalesce(lc.lessons_with_resources, 0) as lessons_with_resources,
       c.lessons_count as cached_lessons_count
from public.courses c
left join module_counts mc on mc.course_id = c.id
left join lesson_counts lc on lc.course_id = c.id
left join body_counts bc on bc.course_id = c.id
left join video_counts vc on vc.course_id = c.id
order by c.slug;

-- 2) Exact public catalog rows (the course SELECT policy uses the same flags).
select c.slug,
       c.title,
       c.category,
       c.lessons_count,
       (select count(*) from public.course_modules m where m.course_id = c.id) as modules,
       (select count(*) from public.course_lessons l where l.course_id = c.id) as lessons,
       c.published,
       c.archived
from public.courses c
where c.published = true
  and coalesce(c.archived, false) = false
order by c.featured desc, c.created_at, c.slug;

-- 3) LAUNCH RELEASE BLOCKERS. This result must be EMPTY before release.
--    Each row says exactly which contract item still differs from the seed.
-- The catalog was consolidated on the live project: five launch slugs are
-- archived duplicates whose curriculum is served by a custom "twin" course.
-- The contract below is therefore per SUBJECT: the live twin wins, and the
-- archived original is reported in result 3b as superseded (not a blocker).
-- On a fresh project no twin exists, so every subject resolves to its original
-- exactly as before.
with expected(slug, twin_slug) as (
  values
    ('ai-video-content-creation',   null),
    ('video-editing-capcut',        'video-editing-with-capcut'),
    ('graphic-design-canva',        'graphic-design-with-canva'),
    ('digital-marketing',           null),
    ('mobile-app-development',      'mobile-application-development'),
    ('portfolio-creation',          null),
    ('web-design-wordpress',        'web-design-with-wordpress'),
    ('frontend-web-development',    null),
    ('ui-ux-design-figma',          'ui-ux-design-with-figma'),
    ('microsoft-excel',             null),
    ('microsoft-word',              null),
    ('microsoft-powerpoint',       null)
), resolved as (
  select e.slug as subject_slug,
         coalesce(t.id, o.id) as id,
         coalesce(t.slug, o.slug) as slug
  from expected e
  left join public.courses t on t.slug = e.twin_slug and t.published and not coalesce(t.archived, false)
  left join public.courses o on o.slug = e.slug
), inventory as (
  select r.slug,
         r.id,
         coalesce(c.published, false) as published,
         coalesce(c.archived, false) as archived,
         coalesce(c.lessons_count, 0) as cached_lessons,
         (select count(*)::int from public.course_modules m where m.course_id = c.id) as modules,
         (select count(*)::int from public.course_lessons l where l.course_id = c.id) as lessons,
         (select count(*)::int
            from public.course_lessons l
            join public.course_content cc on cc.lesson_id = l.id
           where l.course_id = c.id and length(coalesce(cc.body_markdown, '')) > 300) as full_bodies,
         (select count(*)::int
            from public.course_lessons l
           where l.course_id = c.id
             and jsonb_array_length(coalesce(l.resources, '[]'::jsonb)) > 0) as lessons_with_resources,
         (select count(*)::int
            from public.course_lessons l
            join public.course_videos v on v.lesson_id = l.id
           where l.course_id = c.id and v.status = 'published') as published_videos,
         (select count(*)::int from public.quizzes q
           where q.course_id = c.id and q.is_final and q.status = 'published') as final_quizzes,
         (select count(*)::int
            from public.quizzes q
            join public.quiz_questions qq on qq.quiz_id = q.id
           where q.course_id = c.id and q.is_final and q.status = 'published') as final_questions,
         (select count(*)::int from public.assignments a
           where a.course_id = c.id and a.is_final_project and a.status = 'published') as final_projects,
         (select count(*)::int from public.course_completion_rules r where r.course_id = c.id) as completion_rules
  from resolved r
  left join public.courses c on c.id = r.id
), diagnostics as (
  select i.*,
         concat_ws('; ',
           case when id is null then 'no visible course row for this launch subject' end,
           case when id is not null and not published then 'not published' end,
           case when archived then 'archived' end,
           case when modules <> 4 then 'expected 4 modules, found ' || modules end,
           case when lessons <> 16 then 'expected 16 lessons, found ' || lessons end,
           case when cached_lessons <> 16 then 'cached lessons_count is ' || cached_lessons end,
           case when full_bodies <> 16 then 'expected 16 full bodies, found ' || full_bodies end,
           case when lessons_with_resources <> 16 then 'expected resources on 16 lessons, found ' || lessons_with_resources end,
           case when published_videos <> 16 then 'expected 16 published videos, found ' || published_videos end,
           case when final_quizzes <> 1 then 'expected 1 published final quiz, found ' || final_quizzes end,
           case when final_questions <> 10 then 'expected 10 final questions, found ' || final_questions end,
           case when final_projects <> 1 then 'expected 1 published final project, found ' || final_projects end,
           case when completion_rules <> 1 then 'expected 1 completion-rule row, found ' || completion_rules end
         ) as blockers
  from inventory i
)
select slug, blockers, published, archived, modules, lessons, cached_lessons,
       full_bodies, lessons_with_resources, published_videos, final_quizzes,
       final_questions, final_projects, completion_rules
from diagnostics
where blockers <> ''
order by slug;

-- 3b) SUPERSEDED LAUNCH DUPLICATES — informational, never a release blocker.
--     These are the archived originals whose subject is now taught by a live
--     twin. They must stay archived with zero enrollments; a row here with
--     enrollments/payments/certificates needs the reconciliation plan in
--     README_RUNBOOK.md before anything is deleted.
select o.slug as superseded_slug,
       o.title,
       coalesce(c.slug, '(no live twin found)') as superseded_by,
       (select count(*)::int from public.enrollments e where e.course_id = o.id) as enrollments,
       (select count(*)::int from public.manual_payments mp where mp.course_id = o.id) as payments,
       (select count(*)::int from public.certificate_issues ci where ci.course_id = o.id) as certificates
from public.courses o
join (values
        ('video-editing-capcut',   'video-editing-with-capcut'),
        ('graphic-design-canva',   'graphic-design-with-canva'),
        ('mobile-app-development', 'mobile-application-development'),
        ('web-design-wordpress',   'web-design-with-wordpress'),
        ('ui-ux-design-figma',     'ui-ux-design-with-figma')
) as pair(orig, twin) on pair.orig = o.slug
left join public.courses c on c.slug = pair.twin and c.published and not coalesce(c.archived, false)
where not coalesce(o.published, false) or coalesce(o.archived, false)
order by o.slug;

-- 4) LEARNING-PATH RELEASE BLOCKERS. This result must also be EMPTY.
with path_inventory as (
  select lp.title,
         lp.is_published,
         cardinality(coalesce(lp.course_ids, '{}'::uuid[])) as steps,
         (select count(*)::int from public.courses c where c.id = any(coalesce(lp.course_ids, '{}'::uuid[]))) as resolved_steps,
         -- A step that exists but is archived or draft renders as a missing
         -- step for students (RLS hides it) and a dead link for admins.
         (select count(*)::int from public.courses c
           where c.id = any(coalesce(lp.course_ids, '{}'::uuid[]))
             and c.published and not coalesce(c.archived, false)) as openable_steps
  from public.learning_paths lp
), blockers as (
  select 'published learning-path count'::text as problem,
         null::text as path,
         '4'::text as expected,
         count(*) filter (where is_published)::text as actual
  from path_inventory
  having count(*) filter (where is_published) <> 4
  union all
  select 'invalid learning path', title,
         'published with at least 2 resolvable steps',
         concat('published=', is_published, ', steps=', steps, ', resolved=', resolved_steps)
  from path_inventory
  where not is_published or steps < 2 or resolved_steps <> steps
  union all
  select 'unopenable learning-path step', title,
         'every step published and not archived',
         concat('steps=', steps, ', openable=', openable_steps,
                ' — repoint it (README_RUNBOOK.md: Repointing learning-path steps)')
  from path_inventory
  where openable_steps <> steps
)
select * from blockers order by problem, path;

-- 5) CUSTOM/LEGACY COURSE DIAGNOSTIC. Review every returned row before selling
--    that course. This intentionally catches the known duplicate CapCut shell.
select c.id,
       c.slug,
       c.title,
       c.published,
       coalesce(c.archived, false) as archived
from public.courses c
where not exists (
  select 1
  from public.course_lessons l
  where l.course_id = c.id
)
order by c.published desc, c.slug;

-- 6) Integrity diagnostics: the combined result should be empty.
select 'lesson_course_differs_from_module_course' as problem,
       l.id::text as row_id,
       c.slug
from public.course_lessons l
join public.course_modules m on m.id = l.module_id
join public.courses c on c.id = l.course_id
where l.course_id <> m.course_id
union all
select 'duplicate_module_title', min(m.id::text), c.slug
from public.course_modules m
join public.courses c on c.id = m.course_id
group by c.slug, m.course_id, m.title
having count(*) > 1
union all
select 'duplicate_lesson_title_in_module', min(l.id::text), c.slug
from public.course_lessons l
join public.courses c on c.id = l.course_id
group by c.slug, l.module_id, l.title
having count(*) > 1
order by problem, slug;
