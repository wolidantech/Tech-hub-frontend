-- ============================================================
-- WOLI DAN TECH HUB — ONE-STEP CATALOG SETUP
-- GENERATED FILE — do not edit by hand.
-- Regenerate: node supabase/seed/generate_setup.mjs
--
-- Paste this ENTIRE file into Supabase Dashboard -> SQL Editor -> Run.
-- It is the concatenation, in order, of:
--   1. seed_12_courses.sql   — the 12 launch courses (as drafts)
--   2. seed_curriculum.sql   — their modules, lessons and text bodies
--   3. publish_courses.sql   — flips published = true on courses with lessons
--
-- Run AFTER migrations 001-005. Idempotent: safe to re-run; never duplicates
-- rows and never unpublishes a course you deliberately hid.
--
-- Expected end state: 12 published courses with real lesson counts.
-- Verify with:
--   select count(*) filter (where published) as published,
--          count(*) as total from public.courses;
-- ============================================================

-- ============================================================
-- FROM seed_12_courses.sql
-- ============================================================

-- ============================================================
-- WOLI DAN TECH HUB — Seed: 12 launch courses + categories
-- Run AFTER migrations 001-005, in Supabase SQL Editor, as ONE query.
-- IDEMPOTENT: keyed on slug/name — safe to re-run, never duplicates.
-- Re-runs update catalog copy/prices but NEVER touch published/featured
-- (so re-running cannot unpublish a live course).
-- NOTE: courses seed as UNPUBLISHED with no curriculum. Build real
-- lessons via Admin → Courses, then publish. Placeholder demo videos
-- from the offline catalog are intentionally NOT seeded.
-- ============================================================

-- ---------- Categories ----------
insert into public.categories (name) values ($$AI & Technology$$) on conflict (name) do nothing;
insert into public.categories (name) values ($$Design$$) on conflict (name) do nothing;
insert into public.categories (name) values ($$Video & Media$$) on conflict (name) do nothing;
insert into public.categories (name) values ($$Marketing$$) on conflict (name) do nothing;
insert into public.categories (name) values ($$Web Development$$) on conflict (name) do nothing;
insert into public.categories (name) values ($$Mobile Development$$) on conflict (name) do nothing;
insert into public.categories (name) values ($$Microsoft Office$$) on conflict (name) do nothing;

-- ---------- 12 launch courses (unpublished) ----------
insert into public.courses (slug, title, short_description, description, long_description, category, instructor, instructor_role, duration, level, price, original_price, thumbnail_key, color, what_you_will_learn, published, featured) values (
  $$ai-video-content-creation$$, $$AI VIDEO CONTENT CREATION$$, $$Master AI tools to create viral videos, ads & social content in minutes$$, $$Learn how to leverage cutting-edge AI tools for video generation, scripting, voiceovers, and editing. Create professional advertisements and social media content without expensive equipment.$$, $$This comprehensive course takes you from zero to hero in AI video creation. You'll learn to use the latest AI tools for script writing, image generation, voice cloning, video synthesis, and editing. Perfect for content creators, marketers, and entrepreneurs who want to produce high-quality video content at scale.$$,
  $$AI & Technology$$, $$Woli Dan$$, $$AI Content Strategist$$, $$8 hours$$, $$Beginner$$,
  5000, 15000, $$ai$$, $$from-violet-600 to-indigo-600$$,
  $JSON$["AI video generation with top tools","AI script writing & storytelling","AI voice generation & cloning","AI image generation for videos","AI video editing automation","Creating advertisements with AI","Creating viral social media content with AI","Monetizing AI video content"]$JSON$::jsonb, false, false
)
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  description = excluded.description, long_description = excluded.long_description,
  category = excluded.category, instructor = excluded.instructor,
  instructor_role = excluded.instructor_role, duration = excluded.duration,
  level = excluded.level, price = excluded.price,
  original_price = excluded.original_price, thumbnail_key = excluded.thumbnail_key,
  color = excluded.color, what_you_will_learn = excluded.what_you_will_learn,
  updated_at = now();
insert into public.courses (slug, title, short_description, description, long_description, category, instructor, instructor_role, duration, level, price, original_price, thumbnail_key, color, what_you_will_learn, published, featured) values (
  $$video-editing-capcut$$, $$VIDEO EDITING WITH CAPCUT$$, $$Edit like a pro on your phone & PC - transitions, effects, captions$$, $$Master CapCut for mobile and desktop. Learn cutting, transitions, effects, auto-captions, and trending editing styles used by top creators.$$, $$CapCut is the #1 editing tool for creators. This course teaches you everything from basic cuts to advanced effects, keyframes, color grading, and viral TikTok/Reels editing techniques. No laptop needed - start on your phone!$$,
  $$Video & Media$$, $$Woli Dan$$, $$Video Editor$$, $$6 hours$$, $$Beginner$$,
  5000, 12000, $$video$$, $$from-cyan-500 to-blue-600$$,
  $JSON$["CapCut interface mastery","Cutting & trimming like a pro","Transitions & effects","Auto captions & text animations","Color grading & filters","Sound design & music","Export settings for all platforms","Creating viral short-form content"]$JSON$::jsonb, false, false
)
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  description = excluded.description, long_description = excluded.long_description,
  category = excluded.category, instructor = excluded.instructor,
  instructor_role = excluded.instructor_role, duration = excluded.duration,
  level = excluded.level, price = excluded.price,
  original_price = excluded.original_price, thumbnail_key = excluded.thumbnail_key,
  color = excluded.color, what_you_will_learn = excluded.what_you_will_learn,
  updated_at = now();
insert into public.courses (slug, title, short_description, description, long_description, category, instructor, instructor_role, duration, level, price, original_price, thumbnail_key, color, what_you_will_learn, published, featured) values (
  $$graphic-design-canva$$, $$GRAPHIC DESIGN WITH CANVA$$, $$Design stunning graphics, flyers, logos & social posts without Photoshop$$, $$Learn professional graphic design using Canva. Create flyers, social media designs, logos, presentations, and brand kits that clients will pay for.$$, $$Canva has democratized design. This course shows you how to create professional-grade designs for businesses, even if you've never designed before. Includes client work templates and monetization strategies.$$,
  $$Design$$, $$Woli Dan$$, $$Brand Designer$$, $$5 hours$$, $$Beginner$$,
  5000, 10000, $$design$$, $$from-fuchsia-500 to-purple-600$$,
  $JSON$["Canva mastery from scratch","Design principles & typography","Social media design pack","Flyer & poster design","Logo & brand kit creation","Presentation design","Client project workflow","Selling designs online"]$JSON$::jsonb, false, false
)
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  description = excluded.description, long_description = excluded.long_description,
  category = excluded.category, instructor = excluded.instructor,
  instructor_role = excluded.instructor_role, duration = excluded.duration,
  level = excluded.level, price = excluded.price,
  original_price = excluded.original_price, thumbnail_key = excluded.thumbnail_key,
  color = excluded.color, what_you_will_learn = excluded.what_you_will_learn,
  updated_at = now();
insert into public.courses (slug, title, short_description, description, long_description, category, instructor, instructor_role, duration, level, price, original_price, thumbnail_key, color, what_you_will_learn, published, featured) values (
  $$digital-marketing$$, $$DIGITAL MARKETING$$, $$Grow any business online - social media, ads, content & sales funnels$$, $$Complete digital marketing blueprint for Nigerian businesses. Learn social media marketing, content strategy, paid ads, and lead generation.$$, $$Stop boosting posts randomly. Learn a proven system to get clients online, build a brand, run ads that convert, and turn followers into paying customers. Includes real Nigerian case studies.$$,
  $$Marketing$$, $$Woli Dan$$, $$Marketing Lead$$, $$10 hours$$, $$Beginner to Intermediate$$,
  5000, 20000, $$marketing$$, $$from-orange-500 to-pink-600$$,
  $JSON$["Digital marketing fundamentals","Social media growth strategy","Content creation & calendar","Facebook & Instagram Ads","Lead generation & funnels","Copywriting that sells","Analytics & optimization","Monetizing your skills"]$JSON$::jsonb, false, false
)
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  description = excluded.description, long_description = excluded.long_description,
  category = excluded.category, instructor = excluded.instructor,
  instructor_role = excluded.instructor_role, duration = excluded.duration,
  level = excluded.level, price = excluded.price,
  original_price = excluded.original_price, thumbnail_key = excluded.thumbnail_key,
  color = excluded.color, what_you_will_learn = excluded.what_you_will_learn,
  updated_at = now();
insert into public.courses (slug, title, short_description, description, long_description, category, instructor, instructor_role, duration, level, price, original_price, thumbnail_key, color, what_you_will_learn, published, featured) values (
  $$mobile-app-development$$, $$MOBILE APPLICATION DEVELOPMENT$$, $$Build real mobile apps with no-code & Flutterflow basics$$, $$Learn to build functional mobile apps without complex coding. From idea to Play Store.$$, $$Build your first mobile app in 2 weeks. This beginner-friendly course covers app ideation, UI design, no-code development, and publishing. Perfect for entrepreneurs with app ideas.$$,
  $$Mobile Development$$, $$Woli Dan Tech Team$$, $$Mobile Developer$$, $$15 hours$$, $$Beginner$$,
  5000, 25000, $$mobile$$, $$from-emerald-500 to-teal-600$$,
  $JSON$["Mobile app fundamentals","UI/UX for mobile apps","No-code app development","Database & authentication","APIs & integrations","Testing & deployment","Publishing to Play Store","App monetization"]$JSON$::jsonb, false, false
)
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  description = excluded.description, long_description = excluded.long_description,
  category = excluded.category, instructor = excluded.instructor,
  instructor_role = excluded.instructor_role, duration = excluded.duration,
  level = excluded.level, price = excluded.price,
  original_price = excluded.original_price, thumbnail_key = excluded.thumbnail_key,
  color = excluded.color, what_you_will_learn = excluded.what_you_will_learn,
  updated_at = now();
insert into public.courses (slug, title, short_description, description, long_description, category, instructor, instructor_role, duration, level, price, original_price, thumbnail_key, color, what_you_will_learn, published, featured) values (
  $$portfolio-creation$$, $$PORTFOLIO CREATION$$, $$Build a portfolio that gets you hired - showcase your work like a pro$$, $$Create a stunning professional portfolio website that attracts clients and employers. No coding needed.$$, $$Your portfolio is your CV in the digital age. Learn to curate your best work, write compelling case studies, and build a portfolio site that converts visitors into clients.$$,
  $$Design$$, $$Woli Dan$$, $$Career Coach$$, $$4 hours$$, $$Beginner$$,
  5000, 8000, $$portfolio$$, $$from-slate-600 to-slate-800$$,
  $JSON$["Portfolio strategy & structure","Selecting your best work","Case study writing","Building portfolio site","Personal branding","Client attraction","Resume & LinkedIn optimization","Interview preparation"]$JSON$::jsonb, false, false
)
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  description = excluded.description, long_description = excluded.long_description,
  category = excluded.category, instructor = excluded.instructor,
  instructor_role = excluded.instructor_role, duration = excluded.duration,
  level = excluded.level, price = excluded.price,
  original_price = excluded.original_price, thumbnail_key = excluded.thumbnail_key,
  color = excluded.color, what_you_will_learn = excluded.what_you_will_learn,
  updated_at = now();
insert into public.courses (slug, title, short_description, description, long_description, category, instructor, instructor_role, duration, level, price, original_price, thumbnail_key, color, what_you_will_learn, published, featured) values (
  $$frontend-web-development$$, $$FRONTEND WEB DEVELOPMENT$$, $$Learn HTML, CSS, JavaScript & React - build real websites$$, $$Become a frontend developer. Learn HTML, CSS, JavaScript, and modern frameworks by building real projects.$$, $$From zero to job-ready. This course takes you through the fundamentals of web development to building responsive, interactive websites with modern tools. Includes 5 portfolio projects.$$,
  $$Web Development$$, $$Woli Dan Tech Team$$, $$Senior Frontend Engineer$$, $$20 hours$$, $$Beginner to Intermediate$$,
  5000, 30000, $$frontend$$, $$from-blue-600 to-cyan-500$$,
  $JSON$["HTML5 & semantic markup","CSS3, Flexbox & Grid","Responsive design","JavaScript fundamentals","DOM manipulation","React basics","Git & deployment","Building 5 real projects"]$JSON$::jsonb, false, false
)
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  description = excluded.description, long_description = excluded.long_description,
  category = excluded.category, instructor = excluded.instructor,
  instructor_role = excluded.instructor_role, duration = excluded.duration,
  level = excluded.level, price = excluded.price,
  original_price = excluded.original_price, thumbnail_key = excluded.thumbnail_key,
  color = excluded.color, what_you_will_learn = excluded.what_you_will_learn,
  updated_at = now();
insert into public.courses (slug, title, short_description, description, long_description, category, instructor, instructor_role, duration, level, price, original_price, thumbnail_key, color, what_you_will_learn, published, featured) values (
  $$web-design-wordpress$$, $$WEB DESIGN WITH WORDPRESS$$, $$Build professional business websites with WordPress - no coding$$, $$Learn to build stunning WordPress websites for businesses. Domain, hosting, Elementor, and client delivery.$$, $$WordPress powers 40% of the web. Learn to build professional websites for clients, charge premium prices, and deliver in days not months. Includes hosting setup and client handover.$$,
  $$Web Development$$, $$Woli Dan$$, $$WordPress Expert$$, $$8 hours$$, $$Beginner$$,
  5000, 15000, $$wordpress$$, $$from-sky-600 to-blue-700$$,
  $JSON$["WordPress fundamentals","Domain & hosting setup","Elementor page builder","Theme customization","E-commerce with WooCommerce","SEO basics","Security & maintenance","Charging clients & delivery"]$JSON$::jsonb, false, false
)
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  description = excluded.description, long_description = excluded.long_description,
  category = excluded.category, instructor = excluded.instructor,
  instructor_role = excluded.instructor_role, duration = excluded.duration,
  level = excluded.level, price = excluded.price,
  original_price = excluded.original_price, thumbnail_key = excluded.thumbnail_key,
  color = excluded.color, what_you_will_learn = excluded.what_you_will_learn,
  updated_at = now();
insert into public.courses (slug, title, short_description, description, long_description, category, instructor, instructor_role, duration, level, price, original_price, thumbnail_key, color, what_you_will_learn, published, featured) values (
  $$ui-ux-design-figma$$, $$UI/UX DESIGN WITH FIGMA$$, $$Design beautiful apps & websites in Figma - from wireframe to prototype$$, $$Master UI/UX design with Figma. Learn user research, wireframing, design systems, and prototyping.$$, $$UI/UX is one of the highest-paying tech skills. This course teaches you to design user-centered digital products, create design systems, and build interactive prototypes that developers love.$$,
  $$Design$$, $$Woli Dan Tech Team$$, $$Product Designer$$, $$12 hours$$, $$Beginner$$,
  5000, 18000, $$figma$$, $$from-purple-600 to-pink-600$$,
  $JSON$["UI/UX fundamentals","User research & personas","Wireframing & user flows","Figma mastery","Design systems & components","Prototyping & animations","Usability testing","Portfolio & job prep"]$JSON$::jsonb, false, false
)
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  description = excluded.description, long_description = excluded.long_description,
  category = excluded.category, instructor = excluded.instructor,
  instructor_role = excluded.instructor_role, duration = excluded.duration,
  level = excluded.level, price = excluded.price,
  original_price = excluded.original_price, thumbnail_key = excluded.thumbnail_key,
  color = excluded.color, what_you_will_learn = excluded.what_you_will_learn,
  updated_at = now();
insert into public.courses (slug, title, short_description, description, long_description, category, instructor, instructor_role, duration, level, price, original_price, thumbnail_key, color, what_you_will_learn, published, featured) values (
  $$microsoft-excel$$, $$MICROSOFT EXCEL$$, $$Excel from beginner to advanced - formulas, charts, dashboards$$, $$Master Microsoft Excel for work and business. Formulas, pivot tables, charts, and dashboards.$$, $$Excel is still the most demanded office skill. This course takes you from basic spreadsheet creation to advanced data analysis, pivot tables, and interactive dashboards. Essential for any office job.$$,
  $$Microsoft Office$$, $$Woli Dan$$, $$Data Analyst$$, $$6 hours$$, $$Beginner to Advanced$$,
  5000, 10000, $$excel$$, $$from-green-600 to-emerald-700$$,
  $JSON$["Excel interface & basics","Formulas & functions","Data formatting & validation","Charts & visualization","Pivot tables & analysis","Conditional formatting","Dashboards & reports","Shortcuts & productivity"]$JSON$::jsonb, false, false
)
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  description = excluded.description, long_description = excluded.long_description,
  category = excluded.category, instructor = excluded.instructor,
  instructor_role = excluded.instructor_role, duration = excluded.duration,
  level = excluded.level, price = excluded.price,
  original_price = excluded.original_price, thumbnail_key = excluded.thumbnail_key,
  color = excluded.color, what_you_will_learn = excluded.what_you_will_learn,
  updated_at = now();
insert into public.courses (slug, title, short_description, description, long_description, category, instructor, instructor_role, duration, level, price, original_price, thumbnail_key, color, what_you_will_learn, published, featured) values (
  $$microsoft-word$$, $$MICROSOFT WORD$$, $$Create professional documents, CVs, reports & proposals$$, $$Master Microsoft Word for professional document creation. CVs, reports, proposals, and formatting.$$, $$Learn to create polished, professional documents that stand out. From CVs that get interviews to business proposals that win clients, this course covers everything.$$,
  $$Microsoft Office$$, $$Woli Dan$$, $$Office Productivity Expert$$, $$4 hours$$, $$Beginner$$,
  5000, 8000, $$word$$, $$from-blue-700 to-indigo-800$$,
  $JSON$["Word interface mastery","Professional formatting","Styles & templates","CV & resume creation","Reports & proposals","Tables & graphics","Collaboration & review","Printing & exporting"]$JSON$::jsonb, false, false
)
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  description = excluded.description, long_description = excluded.long_description,
  category = excluded.category, instructor = excluded.instructor,
  instructor_role = excluded.instructor_role, duration = excluded.duration,
  level = excluded.level, price = excluded.price,
  original_price = excluded.original_price, thumbnail_key = excluded.thumbnail_key,
  color = excluded.color, what_you_will_learn = excluded.what_you_will_learn,
  updated_at = now();
insert into public.courses (slug, title, short_description, description, long_description, category, instructor, instructor_role, duration, level, price, original_price, thumbnail_key, color, what_you_will_learn, published, featured) values (
  $$microsoft-powerpoint$$, $$MICROSOFT POWERPOINT$$, $$Design presentations that wow - animations, storytelling & delivery$$, $$Create stunning presentations that captivate audiences. Design, animation, and delivery mastery.$$, $$Learn to create presentations that people remember. This course covers slide design principles, storytelling, animations, and delivery techniques for business, school, and pitches.$$,
  $$Microsoft Office$$, $$Woli Dan$$, $$Presentation Designer$$, $$5 hours$$, $$Beginner$$,
  5000, 8000, $$powerpoint$$, $$from-orange-600 to-red-600$$,
  $JSON$["PowerPoint interface","Slide design principles","Layouts & master slides","Animations & transitions","Charts & infographics","Storytelling structure","Presenter tools","Export & delivery"]$JSON$::jsonb, false, false
)
on conflict (slug) do update set
  title = excluded.title, short_description = excluded.short_description,
  description = excluded.description, long_description = excluded.long_description,
  category = excluded.category, instructor = excluded.instructor,
  instructor_role = excluded.instructor_role, duration = excluded.duration,
  level = excluded.level, price = excluded.price,
  original_price = excluded.original_price, thumbnail_key = excluded.thumbnail_key,
  color = excluded.color, what_you_will_learn = excluded.what_you_will_learn,
  updated_at = now();

-- ---------- Verify ----------
select slug, price, published, lessons_count from public.courses order by slug;
select name from public.categories order by name;

-- ============================================================
-- FROM seed_curriculum.sql
-- ============================================================

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

-- ============================================================
-- FROM publish_courses.sql
-- ============================================================

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
--   Safe to re-run: it only flips published from false to true and never
--   unpublishes anything, so a course you deliberately hid stays hidden.
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
