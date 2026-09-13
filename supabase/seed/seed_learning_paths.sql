-- ============================================================
-- WOLI DAN TECH HUB — LEARNING PATHS SEED
-- ============================================================
-- Guided step-by-step routes through the REAL published catalog.
-- Every course_ids entry is resolved from a live slug via subselect —
-- if a course does not exist, this file errors loudly instead of
-- silently seeding a broken path (no fake paths, ever).
--
-- IDEMPOTENT: keyed on exact title — re-running never duplicates and
-- never overwrites paths an admin has deliberately edited.
--
-- Run AFTER seed_12_courses.sql + seed_curriculum.sql + publish_courses.sql
-- (i.e. via setup_full_catalog.sql). Requires migration 002+ (learning_paths).
-- ============================================================

insert into public.learning_paths (title, description, icon, level_range, course_ids, is_published)
select
  $$Web & Mobile Developer$$,
  $$The complete builder track: code real websites, design clean interfaces, ship WordPress sites, then go mobile with Flutter — and finish by packaging everything into a job-ready portfolio.$$ ,
  $$🚀$$,
  $$Beginner → Advanced$$,
  array[
    (select id from public.courses where slug = $$frontend-web-development$$),
    (select id from public.courses where slug = $$web-design-wordpress$$),
    (select id from public.courses where slug = $$ui-ux-design-figma$$),
    (select id from public.courses where slug = $$mobile-app-development$$),
    (select id from public.courses where slug = $$portfolio-creation$$)
  ],
  true
where not exists (select 1 from public.learning_paths where title = $$Web & Mobile Developer$$);

insert into public.learning_paths (title, description, icon, level_range, course_ids, is_published)
select
  $$Digital Creator$$,
  $$Create content that gets seen: AI-powered video, sharp CapCut edits, Canva graphics and the marketing to grow an audience — ending with your creator portfolio.$$ ,
  $$🎬$$,
  $$Beginner → Intermediate$$,
  array[
    (select id from public.courses where slug = $$ai-video-content-creation$$),
    (select id from public.courses where slug = $$video-editing-capcut$$),
    (select id from public.courses where slug = $$graphic-design-canva$$),
    (select id from public.courses where slug = $$digital-marketing$$),
    (select id from public.courses where slug = $$portfolio-creation$$)
  ],
  true
where not exists (select 1 from public.learning_paths where title = $$Digital Creator$$);

insert into public.learning_paths (title, description, icon, level_range, course_ids, is_published)
select
  $$Office Productivity Pro$$,
  $$Master the three tools every serious job expects: Word for documents, Excel for data and PowerPoint for presentations. Short, practical, certificate-ready.$$ ,
  $$📊$$,
  $$Beginner → Intermediate$$,
  array[
    (select id from public.courses where slug = $$microsoft-word$$),
    (select id from public.courses where slug = $$microsoft-excel$$),
    (select id from public.courses where slug = $$microsoft-powerpoint$$)
  ],
  true
where not exists (select 1 from public.learning_paths where title = $$Office Productivity Pro$$);

insert into public.learning_paths (title, description, icon, level_range, course_ids, is_published)
select
  $$Digital Business Growth$$,
  $$For founders and freelancers who need clients: digital marketing fundamentals, branded graphics with Canva, AI video ads — capped with a portfolio that sells your services.$$ ,
  $$📈$$,
  $$Beginner → Intermediate$$,
  array[
    (select id from public.courses where slug = $$digital-marketing$$),
    (select id from public.courses where slug = $$graphic-design-canva$$),
    (select id from public.courses where slug = $$ai-video-content-creation$$),
    (select id from public.courses where slug = $$portfolio-creation$$)
  ],
  true
where not exists (select 1 from public.learning_paths where title = $$Digital Business Growth$$);

-- Guard: every seeded path must point at real, existing courses only.
do $$
declare
  bad bigint;
begin
  select count(*) into bad
  from public.learning_paths lp
  cross join lateral unnest(lp.course_ids) as cid
  where not exists (select 1 from public.courses c where c.id = cid);
  if bad > 0 then
    raise exception 'seed_learning_paths: % path course references do not resolve to real courses', bad;
  end if;
end $$;
