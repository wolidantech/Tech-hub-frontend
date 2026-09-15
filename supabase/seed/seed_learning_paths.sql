-- ============================================================
-- WOLI DAN TECH HUB — LEARNING PATHS SEED
-- ============================================================
-- Guided step-by-step routes through the REAL published catalog.
--
-- EVERY STEP REFERENCES THE LIVE TWIN SLUGS. The catalog was consolidated on
-- the live project: five launch courses are archived duplicates whose
-- curriculum lives on under custom twin slugs. Every step in this file names
-- the twin a student can actually open (e.g. web-design-with-wordpress,
-- ui-ux-design-with-figma, mobile-application-development,
-- video-editing-with-capcut, graphic-design-with-canva) and never the
-- archived launch slug it replaced. seed_12_courses.sql seeds those same twin
-- slugs, so the paths resolve on a fresh project AND on the live one.
--
-- If ANY step resolves to no published, unarchived course, this file aborts
-- loudly instead of silently seeding a path with a missing step (no fake
-- paths, ever).
--
-- IDEMPOTENT: keyed on exact title — re-running never duplicates and
-- never overwrites paths an admin has deliberately edited. Repointing paths
-- that already exist with stale steps is a separate, operator-reviewed repair:
-- see README_RUNBOOK.md ("Repointing learning-path steps"). It is deliberately
-- NOT part of this seed, so a re-run cannot clobber a curated path.
--
-- Run AFTER seed_12_courses.sql + seed_curriculum.sql + publish_courses.sql
-- (i.e. via setup_full_catalog.sql). Requires migration 002+ (learning_paths).
-- ============================================================

do $learning_paths$
declare
  -- Each path: title, description, icon, level_range, and steps as the exact
  -- course slugs a student should take, in order.
  defs jsonb := $paths$[
    {
      "title": "Web & Mobile Developer",
      "description": "The complete builder track: code real websites, design clean interfaces, ship WordPress sites, then go mobile with Flutter — and finish by packaging everything into a job-ready portfolio.",
      "icon": "🚀",
      "level_range": "Beginner → Advanced",
      "steps": [
        "frontend-web-development",
        "web-design-with-wordpress",
        "ui-ux-design-with-figma",
        "mobile-application-development",
        "portfolio-creation"
      ]
    },
    {
      "title": "Digital Creator",
      "description": "Create content that gets seen: AI-powered video, sharp CapCut edits, Canva graphics and the marketing to grow an audience — ending with your creator portfolio.",
      "icon": "🎬",
      "level_range": "Beginner → Intermediate",
      "steps": [
        "ai-video-content-creation",
        "video-editing-with-capcut",
        "graphic-design-with-canva",
        "digital-marketing",
        "portfolio-creation"
      ]
    },
    {
      "title": "Office Productivity Pro",
      "description": "Master the three tools every serious job expects: Word for documents, Excel for data and PowerPoint for presentations. Short, practical, certificate-ready.",
      "icon": "📊",
      "level_range": "Beginner → Intermediate",
      "steps": [
        "microsoft-word",
        "microsoft-excel",
        "microsoft-powerpoint"
      ]
    },
    {
      "title": "Digital Business Growth",
      "description": "For founders and freelancers who need clients: digital marketing fundamentals, branded graphics with Canva, AI video ads — capped with a portfolio that sells your services.",
      "icon": "📈",
      "level_range": "Beginner → Intermediate",
      "steps": [
        "digital-marketing",
        "graphic-design-with-canva",
        "ai-video-content-creation",
        "portfolio-creation"
      ]
    }
  ]$paths$;

  lp         jsonb;
  lp_title   text;
  lp_steps   uuid[];
  lp_picked  uuid;
  lp_slug    text;
  step_no    int;
begin
  for lp in select d from jsonb_array_elements(defs) as d loop
    lp_title := lp->>'title';

    -- Never touch an existing path, even when its steps are stale: an admin may
    -- have curated it on purpose (see the header for the separate repair).
    if exists (select 1 from public.learning_paths where title = lp_title) then
      continue;
    end if;

    lp_steps := '{}'::uuid[];
    step_no  := 0;

    for lp_slug in select s from jsonb_array_elements_text(lp->'steps') as s loop
      step_no := step_no + 1;

      select c.id into lp_picked
        from public.courses c
       where c.slug = lp_slug and c.published and not c.archived;

      if lp_picked is null then
        raise exception 'seed_learning_paths: path "%" step % matches no published, unarchived course [%]',
          lp_title, step_no, lp_slug;
      end if;
      lp_steps := lp_steps || lp_picked;
    end loop;

    insert into public.learning_paths (title, description, icon, level_range, course_ids, is_published)
    values (lp_title, lp->>'description', lp->>'icon', lp->>'level_range', lp_steps, true);
  end loop;
end
$learning_paths$;

-- ---------- Guard: the launch paths students see must be walkable ----------
-- A step pointing at an archived or draft course is exactly what makes
-- /learning-paths render short paths (RLS hides the row) or dead links for an
-- admin. Checked only for the four titles this file owns, so a custom path an
-- admin is still shaping cannot break the seed.
do $learning_paths_guard$
declare
  stale   int;
  detail  text;
  missing int;
begin
  select count(*), left(string_agg(x.msg, ' | '), 500)
    into stale, detail
    from (
      select format('"%s" step %s -> %s (%s)', lp.title, cid.i, c.slug,
                    case when c.archived then 'archived' else 'unpublished' end) as msg
        from public.learning_paths lp
        cross join lateral unnest(lp.course_ids) with ordinality as cid(id, i)
        join public.courses c on c.id = cid.id
       where lp.title = any (array['Web & Mobile Developer', 'Digital Creator',
                                   'Office Productivity Pro', 'Digital Business Growth'])
         and (c.archived or not c.published)
    ) x;

  if stale > 0 then
    raise exception 'seed_learning_paths: % launch-path step(s) point at courses students cannot open [%] — see README_RUNBOOK.md "Repointing learning-path steps"',
      stale, detail;
  end if;

  select count(*) into missing
    from public.learning_paths lp
    cross join lateral unnest(lp.course_ids) as cid
   where lp.title = any (array['Web & Mobile Developer', 'Digital Creator',
                               'Office Productivity Pro', 'Digital Business Growth'])
     and not exists (select 1 from public.courses c where c.id = cid);

  if missing > 0 then
    raise exception 'seed_learning_paths: % launch-path course reference(s) do not resolve to real courses', missing;
  end if;
end
$learning_paths_guard$;

-- ---------- Verify ----------
-- Every step of the four launch paths, with its course's visibility flags.
-- Every row must be published = true / archived = false; the five remapped
-- steps appear under their live twin slugs.
select lp.title, cid.i as step, c.slug, c.published, c.archived
from public.learning_paths lp
cross join lateral unnest(lp.course_ids) with ordinality as cid(id, i)
join public.courses c on c.id = cid.id
where lp.title = any (array['Web & Mobile Developer', 'Digital Creator',
                            'Office Productivity Pro', 'Digital Business Growth'])
order by lp.title, cid.i;
