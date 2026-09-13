-- ============================================================
-- WOLI DAN TECH HUB — Seed: curriculum (modules, lessons, text bodies)
-- GENERATED FILE — do not edit by hand.
-- Regenerate: node supabase/seed/generate_curriculum.mjs
--
-- Run AFTER 001-005 and AFTER seed_12_courses.sql, as ONE query.
-- IDEMPOTENT: rows are matched on (course slug, module title, lesson
-- title), so re-running updates text bodies but never duplicates.
--
-- No video rows are created on purpose: the offline catalog only ever
-- contained a single placeholder URL. Lessons render "Video coming soon"
-- until real videos are uploaded from Admin -> Courses.
--
-- lessons_count is maintained by a trigger (migration 004), so course
-- cards pick up the new totals automatically.
-- ============================================================

begin;

-- ---------- ai-video-content-creation ----------
with c as (select id from public.courses where slug = 'ai-video-content-creation')
insert into public.course_modules (course_id, title, position)
select c.id, 'Introduction to AI Video Creation', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Introduction to AI Video Creation'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Introduction to AI Video Creation'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'What is AI Video Creation?', 'video', '12:30', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'What is AI Video Creation?'
);
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Introduction to AI Video Creation' and le.title = 'What is AI Video Creation?'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, 'Overview of AI video landscape' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Introduction to AI Video Creation'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Tools You Need - Free & Paid', 'text', '08:45', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Tools You Need - Free & Paid'
);
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Introduction to AI Video Creation' and le.title = 'Tools You Need - Free & Paid'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, 'Complete toolkit breakdown...' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Introduction to AI Video Creation'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Setting Up Your Workspace', 'video', '15:20', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Setting Up Your Workspace'
);

with c as (select id from public.courses where slug = 'ai-video-content-creation')
insert into public.course_modules (course_id, title, position)
select c.id, 'AI Script & Voice Mastery', 1 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'AI Script & Voice Mastery'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'AI Script & Voice Mastery'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'AI Script Writing with ChatGPT', 'video', '18:10', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'AI Script Writing with ChatGPT'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'AI Script & Voice Mastery'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Voice Generation - ElevenLabs & More', 'video', '22:15', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Voice Generation - ElevenLabs & More'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'AI Script & Voice Mastery'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Practice: Create Your First Script', 'text', '10:00', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Practice: Create Your First Script'
);
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'AI Script & Voice Mastery' and le.title = 'Practice: Create Your First Script'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, 'Hands-on exercise...' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();

with c as (select id from public.courses where slug = 'ai-video-content-creation')
insert into public.course_modules (course_id, title, position)
select c.id, 'AI Video Production', 2 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'AI Video Production'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'AI Video Production'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Text-to-Video with Runway & Pika', 'video', '25:00', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Text-to-Video with Runway & Pika'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'AI Video Production'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Image-to-Video Animation', 'video', '20:30', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Image-to-Video Animation'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'AI Video Production'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Creating Ads That Convert', 'video', '19:45', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Creating Ads That Convert'
);


-- ---------- video-editing-capcut ----------
with c as (select id from public.courses where slug = 'video-editing-capcut')
insert into public.course_modules (course_id, title, position)
select c.id, 'CapCut Basics', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'CapCut Basics'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'CapCut Basics'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Getting Started with CapCut', 'video', '10:20', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Getting Started with CapCut'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'CapCut Basics'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Timeline & Cutting Techniques', 'video', '14:30', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Timeline & Cutting Techniques'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'CapCut Basics'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Your First Edit', 'text', '15:00', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Your First Edit'
);
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'CapCut Basics' and le.title = 'Your First Edit'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, 'Practice project...' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();

with c as (select id from public.courses where slug = 'video-editing-capcut')
insert into public.course_modules (course_id, title, position)
select c.id, 'Advanced Editing', 1 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Advanced Editing'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Advanced Editing'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Transitions & Effects Deep Dive', 'video', '18:45', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Transitions & Effects Deep Dive'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Advanced Editing'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Keyframes & Motion Graphics', 'video', '20:10', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Keyframes & Motion Graphics'
);


-- ---------- graphic-design-canva ----------
with c as (select id from public.courses where slug = 'graphic-design-canva')
insert into public.course_modules (course_id, title, position)
select c.id, 'Design Fundamentals', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Design Fundamentals'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Design Fundamentals'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Design Thinking & Canva Tour', 'video', '12:00', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Design Thinking & Canva Tour'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Design Fundamentals'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Colors, Fonts & Layout', 'video', '16:20', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Colors, Fonts & Layout'
);


-- ---------- digital-marketing ----------
with c as (select id from public.courses where slug = 'digital-marketing')
insert into public.course_modules (course_id, title, position)
select c.id, 'Marketing Foundations', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Marketing Foundations'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Marketing Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'The Digital Marketing Ecosystem', 'video', '14:00', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'The Digital Marketing Ecosystem'
);


-- ---------- mobile-app-development ----------
with c as (select id from public.courses where slug = 'mobile-app-development')
insert into public.course_modules (course_id, title, position)
select c.id, 'App Foundations', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'App Foundations'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'App Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'How Mobile Apps Work', 'video', '13:00', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'How Mobile Apps Work'
);


-- ---------- portfolio-creation ----------
with c as (select id from public.courses where slug = 'portfolio-creation')
insert into public.course_modules (course_id, title, position)
select c.id, 'Portfolio Strategy', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Portfolio Strategy'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Portfolio Strategy'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'What Makes a Great Portfolio', 'video', '11:00', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'What Makes a Great Portfolio'
);


-- ---------- frontend-web-development ----------
with c as (select id from public.courses where slug = 'frontend-web-development')
insert into public.course_modules (course_id, title, position)
select c.id, 'Web Foundations', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Web Foundations'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Web Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'How the Web Works', 'video', '10:00', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'How the Web Works'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Web Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'HTML Crash Course', 'video', '45:00', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'HTML Crash Course'
);


-- ---------- web-design-wordpress ----------
with c as (select id from public.courses where slug = 'web-design-wordpress')
insert into public.course_modules (course_id, title, position)
select c.id, 'WordPress Setup', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'WordPress Setup'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'WordPress Setup'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Domain, Hosting & Installation', 'video', '20:00', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Domain, Hosting & Installation'
);


-- ---------- ui-ux-design-figma ----------
with c as (select id from public.courses where slug = 'ui-ux-design-figma')
insert into public.course_modules (course_id, title, position)
select c.id, 'UX Foundations', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'UX Foundations'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'UX Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'What is UI/UX?', 'video', '12:00', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'What is UI/UX?'
);


-- ---------- microsoft-excel ----------
with c as (select id from public.courses where slug = 'microsoft-excel')
insert into public.course_modules (course_id, title, position)
select c.id, 'Excel Basics', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Excel Basics'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Excel Basics'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Excel Interface & Navigation', 'video', '10:00', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Excel Interface & Navigation'
);


-- ---------- microsoft-word ----------
with c as (select id from public.courses where slug = 'microsoft-word')
insert into public.course_modules (course_id, title, position)
select c.id, 'Word Essentials', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Word Essentials'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Word Essentials'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Word Interface & First Document', 'video', '08:00', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Word Interface & First Document'
);


-- ---------- microsoft-powerpoint ----------
with c as (select id from public.courses where slug = 'microsoft-powerpoint')
insert into public.course_modules (course_id, title, position)
select c.id, 'Presentation Design', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Presentation Design'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Presentation Design'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'The Art of Presentations', 'video', '09:00', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'The Art of Presentations'
);


commit;

-- ---------- Verify ----------
select c.slug, c.lessons_count,
       (select count(*) from public.course_modules m where m.course_id = c.id) as modules
from public.courses c order by c.slug;
