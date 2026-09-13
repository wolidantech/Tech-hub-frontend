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
