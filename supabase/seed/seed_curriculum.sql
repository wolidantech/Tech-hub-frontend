-- ============================================================
-- WOLI DAN TECH HUB — Seed: full curriculum (modules, lessons,
-- bodies, resources and lesson videos)
-- GENERATED FILE — do not edit by hand.
-- Regenerate: node supabase/seed/generate_curriculum.mjs
--
-- Run AFTER 001-006 and AFTER seed_12_courses.sql, as ONE query.
-- IDEMPOTENT: modules/lessons matched by (course slug, module title,
-- lesson title); content upserts; videos matched on (lesson_id, url).
-- Re-running updates bodies/resources and never duplicates rows.
--
-- Every lesson ships:
--   * a full professional lesson body (course_content),
--   * curated resources (course_lessons.resources jsonb),
--   * one real, verified YouTube video (course_videos, published).
--
-- lessons_count is maintained by a trigger (migration 004), so course
-- cards pick up the new totals automatically.
-- ============================================================

begin;

-- ---------- ai-video-content-creation ----------
with c as (select id from public.courses where slug = 'ai-video-content-creation')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 1: Foundations of AI Video', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 1: Foundations of AI Video'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'What Is AI Video Creation & Why It Matters', 'video', '14 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'What Is AI Video Creation & Why It Matters'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'What Is AI Video Creation & Why It Matters';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video' and le.title = 'What Is AI Video Creation & Why It Matters'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- What "AI video" actually means in 2025+
- The five content types AI can produce for you
- Who is using it and how money is made with it

## 📖 Lesson
AI video creation means using artificial intelligence to do the expensive parts of video production: scripting, generating visuals, creating voiceovers, and editing. Instead of cameras, actors and studios, you describe what you want in plain English (a **prompt**) and the AI generates it.

There are five things AI can make for you today:
1. **Text-to-video clips** — type a scene, get moving footage (Runway, Pika, Sora-style tools).
2. **Image-to-video** — animate a still picture or product photo.
3. **AI voiceovers** — realistic human voices in many languages and accents.
4. **AI scripts** — ChatGPT-style tools write hooks, scripts and captions.
5. **AI editing helpers** — auto-captions, silence removal, background cleanup.

## 💡 Real-world example
A small Lagos boutique used AI to make a 20-second product video: AI wrote the script, AI generated lifestyle shots of the clothing, an AI voice read the narration, and CapCut assembled it. Cost: almost zero. Time: one evening.

## ✍️ Practical
1. Write down 3 businesses near you that post weak videos.
2. For one of them, list 3 video ideas AI could produce (e.g. product showcase, customer testimonial style, promo).
3. Create a free account on Runway or Pika so you are ready for the next lesson.

## ✅ Checklist
- [ ] I can explain AI video in one sentence
- [ ] I know the 5 content types AI can produce
- [ ] I have a free account on at least one AI video tool' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video' and le.title = 'What Is AI Video Creation & Why It Matters'
)
update public.course_lessons le
   set resources = '[{"title":"Runway — AI video generation suite","url":"https://runwayml.com/","type":"tool"},{"title":"Runway Academy — official tool guides","url":"https://help.runwayml.com/hc/en-us","type":"docs"},{"title":"Pika — text-to-video tool","url":"https://pika.art/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video' and le.title = 'What Is AI Video Creation & Why It Matters'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=FqYRkl12ON8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=FqYRkl12ON8'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'How AI Video Generators Think: Prompts → Clips', 'video', '16 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'How AI Video Generators Think: Prompts → Clips'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'How AI Video Generators Think: Prompts → Clips';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video' and le.title = 'How AI Video Generators Think: Prompts → Clips'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- How a text prompt becomes a moving video
- The 6 ingredients of a strong video prompt
- Why vague prompts give weak results

## 📖 Lesson
AI video models are trained on millions of videos. When you type a prompt, the model predicts what that scene should look like, frame by frame. Your job is to give it a **clear picture in words**.

A strong video prompt has 6 ingredients:
1. **Subject** — who or what (a chef, a sneaker, a city street)
2. **Action** — what is happening (walking, pouring, glowing)
3. **Setting** — where (kitchen, beach at sunset, studio)
4. **Camera** — shot type (close-up, drone shot, slow zoom-in)
5. **Style** — look (cinematic, realistic, cartoon, 90s VHS)
6. **Mood/lighting** — dramatic, soft morning light, neon

Compare: ❌ "a dog" → random. ✅ "Close-up of a happy brown dog running through shallow ocean waves at sunset, cinematic, slow motion, golden light" → usable clip.

## 💡 Real-world example
Two creators prompt the same tool. One types "car advert". The other types "Low-angle tracking shot of a black SUV driving through rain-soaked city streets at night, neon reflections, cinematic, dramatic". Only the second gets a result that looks like an advert.

## ✍️ Practical
1. Write 5 prompts using all 6 ingredients for a drink brand.
2. Generate at least 2 clips in your free tool account.
3. Note which ingredient changed the result the most.

## ✅ Checklist
- [ ] I know the 6 prompt ingredients
- [ ] I wrote 5 complete prompts
- [ ] I generated my first AI clips' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video' and le.title = 'How AI Video Generators Think: Prompts → Clips'
)
update public.course_lessons le
   set resources = '[{"title":"OpenAI documentation & prompting guide","url":"https://platform.openai.com/docs","type":"docs"},{"title":"Runway Academy — official tool guides","url":"https://help.runwayml.com/hc/en-us","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video' and le.title = 'How AI Video Generators Think: Prompts → Clips'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=T_-2M_1pgoE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=T_-2M_1pgoE'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Choosing Your AI Tool Stack (Runway, Pika & Friends)', 'video', '15 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Choosing Your AI Tool Stack (Runway, Pika & Friends)'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Choosing Your AI Tool Stack (Runway, Pika & Friends)';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video' and le.title = 'Choosing Your AI Tool Stack (Runway, Pika & Friends)'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The major AI video tools and what each is best at
- Free vs paid: what you can do with ₦0
- How to pick a stack for your goals

## 📖 Lesson
No single tool does everything. Professionals combine a **stack**:

| Job | Popular tools |
|---|---|
| Text/image-to-video clips | Runway, Pika, Luma, Kling, Sora-style tools |
| Talking avatar videos | HeyGen, D-ID, Synthesia |
| AI voiceover | ElevenLabs, CapCut TTS, Play.ht |
| Script writing | ChatGPT, Claude, Gemini |
| Editing + captions | CapCut, Canva Magic Studio |

Start free: nearly all give trial credits. Learn one clip generator + CapCut first — that combination alone can produce complete videos. Upgrade only when clients or audience demand more exports.

## 💡 Real-world example
A faceless YouTube channel uses: ChatGPT (script) → ElevenLabs (voice) → Runway (B-roll clips) → CapCut (assembly + captions). Total monthly tool cost stays low while the channel uploads 3 videos weekly.

## ✍️ Practical
1. Pick ONE clip generator and create your account.
2. Pick CapCut as your editor (phone or PC).
3. Write your personal "stack" in one line, e.g. "Script: ChatGPT • Clips: Runway • Voice: CapCut • Edit: CapCut".

## ✅ Checklist
- [ ] I know what each tool category does
- [ ] I chose my clip generator
- [ ] I wrote down my personal tool stack' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video' and le.title = 'Choosing Your AI Tool Stack (Runway, Pika & Friends)'
)
update public.course_lessons le
   set resources = '[{"title":"Runway — AI video generation suite","url":"https://runwayml.com/","type":"tool"},{"title":"Pika — text-to-video tool","url":"https://pika.art/","type":"tool"},{"title":"Canva Magic Studio — AI design + video","url":"https://www.canva.com/magic-studio/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video' and le.title = 'Choosing Your AI Tool Stack (Runway, Pika & Friends)'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=FqYRkl12ON8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=FqYRkl12ON8'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Setting Up Your AI Video Studio (Folder System & Workflow)', 'video', '12 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Setting Up Your AI Video Studio (Folder System & Workflow)'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Setting Up Your AI Video Studio (Folder System & Workflow)';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video' and le.title = 'Setting Up Your AI Video Studio (Folder System & Workflow)'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- A professional folder structure for video projects
- The 5-stage AI video workflow you will repeat forever
- Naming files so you never lose work

## 📖 Lesson
Amateurs lose hours searching for files. Professionals use one structure for every project:

```
ProjectName/
  01_Script/       → scripts, hooks, captions
  02_Assets/       → images, logos, brand colors
  03_AI_Clips/     → generated video clips (keep prompts in a text file!)
  04_Audio/        → voiceovers, music
  05_Exports/      → final videos per platform
```

Your repeatable workflow: **Idea → Script → Generate clips → Voice → Edit & export**. Save the exact prompt that produced every good clip in a `prompts.txt` file — prompts are your recipe book, and reusing great prompts is a professional superpower.

## 💡 Real-world example
An agency editing 20 client videos a month keeps every clip''s prompt in one document. When a style works, they reuse the prompt with small changes — cutting production time in half.

## ✍️ Practical
1. Create the 5-folder structure on your phone/PC for a test project called "MyFirstVideo".
2. Create `prompts.txt` inside 03_AI_Clips.
3. Copy your best 2 prompts from Module 1 into it.

## ✅ Checklist
- [ ] My 5-folder structure exists
- [ ] prompts.txt has at least 2 saved prompts
- [ ] I can recite the 5-stage workflow' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video' and le.title = 'Setting Up Your AI Video Studio (Folder System & Workflow)'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut editor (free) — assemble your AI clips","url":"https://www.capcut.com/","type":"tool"},{"title":"Runway Academy — official tool guides","url":"https://help.runwayml.com/hc/en-us","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 1: Foundations of AI Video' and le.title = 'Setting Up Your AI Video Studio (Folder System & Workflow)'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=5DUHRr8x88U', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=5DUHRr8x88U'
);

with c as (select id from public.courses where slug = 'ai-video-content-creation')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 2: Scripting & Storytelling with AI', 1 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 2: Scripting & Storytelling with AI'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'From Idea to Hook: Script Writing with ChatGPT', 'video', '17 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'From Idea to Hook: Script Writing with ChatGPT'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'From Idea to Hook: Script Writing with ChatGPT';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI' and le.title = 'From Idea to Hook: Script Writing with ChatGPT'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 4-part structure of every effective short video
- How to make ChatGPT write scripts you can actually use
- Hooks that stop the scroll in 2 seconds

## 📖 Lesson
Short videos live or die in the first 2 seconds. Use this structure:

1. **Hook (0–2s)** — bold claim, question, or surprising visual. "Stop paying for video ads."
2. **Problem (2–7s)** — the pain your viewer feels.
3. **Solution (7–25s)** — your product/idea shown simply.
4. **CTA (25–30s)** — one clear next step: follow, buy, comment.

To get great scripts from ChatGPT, give it a **role, audience and format**:
"Act as a short-form video writer. Write a 30-second TikTok script for [product] targeting [audience]. Give me 3 hook options, short punchy sentences, and end with a CTA to [action]."

Always ask for **3 hook options** — the hook is 80% of the result.

## 💡 Real-world example
A skincare seller tested two hooks for the same video: "My face was burning…" outperformed "Introducing our new cream…" by 6× in views. Same product, same offer — only the first 2 seconds differed.

## ✍️ Practical
1. Choose a product/service. Generate a script with the prompt template above.
2. Ask the AI for 5 alternative hooks. Pick your best one.
3. Read the script aloud and time it — it must be under 35 seconds.

## ✅ Checklist
- [ ] I know Hook→Problem→Solution→CTA
- [ ] I generated a script with 3+ hook options
- [ ] My script reads aloud in under 35 seconds' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI' and le.title = 'From Idea to Hook: Script Writing with ChatGPT'
)
update public.course_lessons le
   set resources = '[{"title":"OpenAI documentation & prompting guide","url":"https://platform.openai.com/docs","type":"docs"},{"title":"HubSpot — how to write video scripts","url":"https://blog.hubspot.com/marketing/video-script","type":"article"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI' and le.title = 'From Idea to Hook: Script Writing with ChatGPT'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=IMHBwskJqRo', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=IMHBwskJqRo'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Writing Video Prompts That Actually Work (Shot Language)', 'video', '16 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Writing Video Prompts That Actually Work (Shot Language)'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Writing Video Prompts That Actually Work (Shot Language)';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI' and le.title = 'Writing Video Prompts That Actually Work (Shot Language)'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 8 camera shots every video uses
- How to turn a script line into a shot list
- Prompt templates for product, people and scenery shots

## 📖 Lesson
Directors think in **shots**. Learn these 8:
- **Wide shot** — shows the whole scene/setting
- **Medium shot** — person from waist up (great for talking)
- **Close-up** — face or product detail, full of emotion
- **Extreme close-up** — texture: eyes, fabric, bubbles
- **Overhead/top-down** — food, desks, unboxing
- **POV** — camera sees what a person sees
- **Drone/aerial** — big scale, locations
- **Tracking shot** — camera follows the subject

Turn your script into a **shot list**: one line of narration = one clip. Example script line "Fresh coffee every morning" → prompt: "Overhead shot of hot coffee being poured into a white ceramic cup, steam rising, soft morning window light, cinematic".

## 💡 Real-world example
An advert for a backpack: wide shot (city commute) → medium (person wearing it) → close-up (zippers and fabric) → POV (opening the laptop compartment). Four simple shots, one professional-feeling ad.

## ✍️ Practical
1. Take your Module 2 script and split it into 4–6 lines.
2. Write one shot prompt per line, each with a different shot type.
3. Generate your two favourite shots.

## ✅ Checklist
- [ ] I can name 8 shot types
- [ ] My script has a matching shot list
- [ ] I generated 2 shots from my prompts' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI' and le.title = 'Writing Video Prompts That Actually Work (Shot Language)'
)
update public.course_lessons le
   set resources = '[{"title":"Runway Academy — official tool guides","url":"https://help.runwayml.com/hc/en-us","type":"docs"},{"title":"StudioBinder — shot types cheat sheet","url":"https://www.studiobinder.com/blog/ultimate-guide-to-camera-shots/","type":"article"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI' and le.title = 'Writing Video Prompts That Actually Work (Shot Language)'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=IMHBwskJqRo', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=IMHBwskJqRo'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Storyboarding with AI Image Frames', 'video', '14 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Storyboarding with AI Image Frames'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Storyboarding with AI Image Frames';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI' and le.title = 'Storyboarding with AI Image Frames'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- What a storyboard is and why it saves money
- Generating storyboard frames with AI images
- Keeping one consistent style across all frames

## 📖 Lesson
A **storyboard** is your video as a comic strip: one image per shot, with notes. It lets you fix problems *before* spending video credits.

Build one with AI in 3 steps:
1. Generate one **style frame** first: your main look ("flat illustration, warm orange palette, soft shadows").
2. Reuse the exact style words in every next prompt so all frames match.
3. Put frames in order in Canva with the narration line under each.

**Consistency trick:** repeat the same style keywords and subject description word-for-word in every prompt. Changing even small words changes the look.

## 💡 Real-world example
A creator pitching a client made a 6-frame AI storyboard in 20 minutes. The client approved the story before a single video clip was generated — zero wasted credits, faster approval, happy client.

## ✍️ Practical
1. Pick your script and generate 4–6 storyboard images with one shared style phrase.
2. Arrange them in Canva in order with one narration line under each.
3. Show it to a friend — can they understand the story without explanation?

## ✅ Checklist
- [ ] I generated 4+ style-consistent frames
- [ ] My storyboard reads clearly in order
- [ ] I reuse identical style keywords' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI' and le.title = 'Storyboarding with AI Image Frames'
)
update public.course_lessons le
   set resources = '[{"title":"Canva Magic Studio — AI design + video","url":"https://www.canva.com/magic-studio/","type":"tool"},{"title":"Canva Design School — storyboarding","url":"https://www.canva.com/learn/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI' and le.title = 'Storyboarding with AI Image Frames'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=5DUHRr8x88U', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=5DUHRr8x88U'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Voice & Narration: Scripts That Sound Human', 'video', '15 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Voice & Narration: Scripts That Sound Human'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Voice & Narration: Scripts That Sound Human';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI' and le.title = 'Voice & Narration: Scripts That Sound Human'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Writing for the ear, not the eye
- Generating natural AI voiceovers
- Pacing, pauses and emphasis that keep viewers

## 📖 Lesson
People *listen* differently than they read. Write for voice:
- Short sentences. One idea each.
- Speak numbers simply ("nineteen ninety-nine" not "₦1,999.00").
- Use contractions ("you''ll", "don''t") — they sound human.
- Mark pauses with "…" or line breaks; mark emphasis with CAPS in your notes.

When generating AI voice: choose a voice that matches your audience (warm and friendly for lifestyle, confident for business), set speed slightly slower than default for clarity, and always listen twice before exporting — mispronounced brand names are the #1 mistake.

## 💡 Real-world example
A tutorial channel switched from robotic TTS to a warm AI voice and added 0.5s pauses after key points. Average watch time rose 18% — same content, better delivery.

## ✍️ Practical
1. Rewrite your script in spoken style (short sentences, contractions).
2. Generate the voiceover in ElevenLabs or CapCut TTS.
3. Listen and fix 2 pronunciation or pacing issues.

## ✅ Checklist
- [ ] My script is written for the ear
- [ ] I generated an AI voiceover
- [ ] I fixed pacing/pronunciation issues' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI' and le.title = 'Voice & Narration: Scripts That Sound Human'
)
update public.course_lessons le
   set resources = '[{"title":"ElevenLabs — AI voice generation","url":"https://elevenlabs.io/","type":"tool"},{"title":"ElevenLabs guides — voice design basics","url":"https://elevenlabs.io/blog","type":"article"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 2: Scripting & Storytelling with AI' and le.title = 'Voice & Narration: Scripts That Sound Human'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=T_-2M_1pgoE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=T_-2M_1pgoE'
);

with c as (select id from public.courses where slug = 'ai-video-content-creation')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 3: Production — Generate, Voice, Edit', 2 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 3: Production — Generate, Voice, Edit'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Generating Clips: Text-to-Video & Image-to-Video', 'video', '18 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Generating Clips: Text-to-Video & Image-to-Video'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Generating Clips: Text-to-Video & Image-to-Video';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit' and le.title = 'Generating Clips: Text-to-Video & Image-to-Video'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Text-to-video vs image-to-video — when to use each
- Camera motion keywords (zoom, pan, orbit)
- How to iterate without burning credits

## 📖 Lesson
**Text-to-video**: best for scenes, moods, B-roll. **Image-to-video**: best when you need a *specific* thing (your product, your logo, a real place) — upload the image, then describe the motion.

Add motion with camera keywords:
- "slow zoom in" — builds focus/tension
- "pan left/right" — reveals a scene
- "orbit around" — product showcase hero shot
- "handheld" — realistic, documentary feel
- "static shot" — calm, stable, professional

**Save credits:** get the image perfect first (cheap), then animate it (expensive). Generate short 3–5s clips; you''ll cut them together anyway. Keep every successful prompt.

## 💡 Real-world example
For a shoe ad, a creator generated 30 images, kept the best 4, and animated only those 4. Result: pro-looking ad, one-third of the credit cost of animating everything.

## ✍️ Practical
1. Generate 4 clips for your storyboard using camera keywords.
2. Try one image-to-video clip with your own photo.
3. Save all working prompts to prompts.txt.

## ✅ Checklist
- [ ] I used both text-to-video and image-to-video
- [ ] I used at least 3 camera keywords
- [ ] My prompts.txt grew' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit' and le.title = 'Generating Clips: Text-to-Video & Image-to-Video'
)
update public.course_lessons le
   set resources = '[{"title":"Runway Academy — official tool guides","url":"https://help.runwayml.com/hc/en-us","type":"docs"},{"title":"Runway — AI video generation suite","url":"https://runwayml.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit' and le.title = 'Generating Clips: Text-to-Video & Image-to-Video'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=-og75MUlnFk', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=-og75MUlnFk'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'AI Voiceover Production & Lip-Sync Basics', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'AI Voiceover Production & Lip-Sync Basics'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'AI Voiceover Production & Lip-Sync Basics';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit' and le.title = 'AI Voiceover Production & Lip-Sync Basics'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Producing a clean, consistent voiceover track
- Matching clip length to narration
- When talking avatars (lip-sync) are worth it

## 📖 Lesson
Your voiceover is the **spine** of the video — visuals are cut to match it, never the reverse.

Production order:
1. Generate the full narration first.
2. Listen and fix pronunciation (spell brand names phonetically, e.g. "Woli Dan" → "Woh-lee Dahn").
3. Drop it into CapCut on the audio track.
4. Place clips over it, cutting each clip where the sentence breathes.

**Talking avatars** (HeyGen-style tools) lip-sync AI video of a person speaking your script. Use them for: explainer content, courses, announcements. Skip them for: product ads and B-roll-heavy content, where voiceover + visuals feels more premium.

## 💡 Real-world example
A training business uses an AI avatar to present weekly updates in English, Yoruba and French from one script — three audiences, one recording session.

## ✍️ Practical
1. Put your final voiceover into CapCut.
2. Lay your 4 clips over it and trim to the narration beats.
3. Watch once without sound: does the story still flow?

## ✅ Checklist
- [ ] Voiceover is final before visuals
- [ ] Clips cut on sentence beats
- [ ] I know when avatars help vs hurt' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit' and le.title = 'AI Voiceover Production & Lip-Sync Basics'
)
update public.course_lessons le
   set resources = '[{"title":"ElevenLabs — AI voice generation","url":"https://elevenlabs.io/","type":"tool"},{"title":"CapCut editor (free) — assemble your AI clips","url":"https://www.capcut.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit' and le.title = 'AI Voiceover Production & Lip-Sync Basics'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=5DUHRr8x88U', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=5DUHRr8x88U'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Assembling in CapCut: Cuts, Captions & Music', 'video', '19 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Assembling in CapCut: Cuts, Captions & Music'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Assembling in CapCut: Cuts, Captions & Music';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit' and le.title = 'Assembling in CapCut: Cuts, Captions & Music'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 60-second assembly workflow in CapCut
- Auto-captions that keep viewers watching
- Choosing music that matches the mood

## 📖 Lesson
Assembly workflow in CapCut:
1. **Import** voiceover + clips into one project.
2. **Cut dead air** — remove any silence over 0.3s. Tight videos feel expensive.
3. **Auto-captions** (Text → Auto captions). 80%+ of short videos are watched muted — captions are not optional. Style them: bold, centered, 2–4 words highlighted at a time.
4. **Music** low under the voice (about 10–15% volume). Match tempo: fast beat for promos, calm piano for tutorials.
5. **Sound effects** sparingly: whoosh on transitions, pop on text appears.

Rule of thumb: something should change on screen every 2–3 seconds (cut, zoom, caption, or motion).

## 💡 Real-world example
Two identical AI videos — one without captions got 400 views, the same video with bold animated captions got 12,000. Captions are the cheapest growth lever in short-form.

## ✍️ Practical
1. Assemble your full video: voiceover → clips → auto-captions → music.
2. Add one transition and one text animation.
3. Watch on your phone at low brightness — is it still clear?

## ✅ Checklist
- [ ] No silence longer than 0.3s
- [ ] Auto-captions styled and on screen
- [ ] Music at 10–15% under the voice' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit' and le.title = 'Assembling in CapCut: Cuts, Captions & Music'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut editor (free) — assemble your AI clips","url":"https://www.capcut.com/","type":"tool"},{"title":"CapCut — official learning hub","url":"https://www.capcut.com/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit' and le.title = 'Assembling in CapCut: Cuts, Captions & Music'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qfHX2cNA4MY', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qfHX2cNA4MY'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Fixing AI Mistakes: Artifacts, Upscaling & Consistency', 'video', '14 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Fixing AI Mistakes: Artifacts, Upscaling & Consistency'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Fixing AI Mistakes: Artifacts, Upscaling & Consistency';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit' and le.title = 'Fixing AI Mistakes: Artifacts, Upscaling & Consistency'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 5 most common AI video artifacts and fixes
- Upscaling blurry clips
- Tricks for character/brand consistency

## 📖 Lesson
AI clips fail in predictable ways. Learn the fixes:

| Problem | Fix |
|---|---|
| Warped hands/faces | Crop tighter or use the clip shorter (0.5–1s) |
| Morphing background | Use image-to-video with a clean source image |
| Blurry output | Upscale in CapCut/Runway; avoid zooming past 120% |
| Wrong colors/logo | Regenerate with explicit color words; add logo in CapCut, not in the AI clip |
| Style jumps between clips | Reuse the exact same style keywords everywhere |

Pros **add branding in the editor**, not in generation: logos, end cards and product close-ups are overlays — sharp and always on-brand.

## 💡 Real-world example
A beverage brand kept getting wrong bottle colors from AI. Fix: generate neutral scenes, then composite the real product photo on top in CapCut. Perfect brand color every time.

## ✍️ Practical
1. Find one artifact in your current clips and fix it using a method above.
2. Add your name/logo as a CapCut overlay.
3. Upscale your blurriest clip.

## ✅ Checklist
- [ ] I can name 5 artifact fixes
- [ ] My branding is an editor overlay
- [ ] No visibly warped frames remain' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit' and le.title = 'Fixing AI Mistakes: Artifacts, Upscaling & Consistency'
)
update public.course_lessons le
   set resources = '[{"title":"Runway Academy — official tool guides","url":"https://help.runwayml.com/hc/en-us","type":"docs"},{"title":"Canva Magic Studio — AI design + video","url":"https://www.canva.com/magic-studio/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 3: Production — Generate, Voice, Edit' and le.title = 'Fixing AI Mistakes: Artifacts, Upscaling & Consistency'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=-og75MUlnFk', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=-og75MUlnFk'
);

with c as (select id from public.courses where slug = 'ai-video-content-creation')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 4: Publishing, Ads & Monetization', 3 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 4: Publishing, Ads & Monetization'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Platform Formats: TikTok, Reels, YouTube & WhatsApp', 'video', '15 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Platform Formats: TikTok, Reels, YouTube & WhatsApp'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Platform Formats: TikTok, Reels, YouTube & WhatsApp';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization' and le.title = 'Platform Formats: TikTok, Reels, YouTube & WhatsApp'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The exact format each platform wants
- One video, five platforms: the resizing workflow
- Posting habits that grow accounts

## 📖 Lesson
| Platform | Ratio | Best length | Note |
|---|---|---|---|
| TikTok / Reels / Shorts | 9:16 vertical | 15–45s | Hook in 1–2s |
| YouTube main | 16:9 horizontal | 3–10 min | Thumbnail matters most |
| WhatsApp Status | 9:16 | ≤30s | Huge in Nigeria for business |
| LinkedIn | 1:1 or 16:9 | 30–90s | Professional tone |

Workflow: edit once in 9:16 in CapCut, then use CapCut''s format switch to export 1:1 and 16:9 versions. Move captions so they''re not covered by platform buttons (keep text in the middle 70%).

Consistency beats perfection: 3 good posts weekly grow faster than 1 perfect post monthly.

## 💡 Real-world example
A caterer posts one dish video: Reels for discovery, WhatsApp Status for repeat customers, TikTok for new followers — one edit, three audiences, orders every week.

## ✍️ Practical
1. Export your project video in 9:16, 1:1 and 16:9.
2. Check caption placement on each version.
3. Post one version to any platform today.

## ✅ Checklist
- [ ] I know the formats for 4 platforms
- [ ] I exported 3 ratios of one video
- [ ] I posted something real' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization' and le.title = 'Platform Formats: TikTok, Reels, YouTube & WhatsApp'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut editor (free) — assemble your AI clips","url":"https://www.capcut.com/","type":"tool"},{"title":"Social Media Examiner — platform size guide","url":"https://www.socialmediaexaminer.com/","type":"article"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization' and le.title = 'Platform Formats: TikTok, Reels, YouTube & WhatsApp'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=5DUHRr8x88U', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=5DUHRr8x88U'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Making Ads & Promo Videos with AI', 'video', '17 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Making Ads & Promo Videos with AI'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Making Ads & Promo Videos with AI';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization' and le.title = 'Making Ads & Promo Videos with AI'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The anatomy of a converting video ad
- A repeatable 4-scene ad template
- Testing variations without re-shooting

## 📖 Lesson
Ads have one job: make someone act. The proven 4-scene template:
1. **Hook scene (0–3s)** — the problem or a bold visual. "Still queuing for bank transfers?"
2. **Product scene (3–12s)** — show the product solving it. Close-ups + benefits as on-screen text.
3. **Proof scene (12–20s)** — testimonial style, numbers, before/after.
4. **CTA scene (20–30s)** — offer + action. "Order on WhatsApp — link in bio."

Because it''s all AI-generated, **testing is cheap**: change only the hook scene and you have a new ad variant. Test 3 hooks, keep the winner.

## 💡 Real-world example
A fashion brand made 3 AI ad variants with different hooks for ₦0 in production. Hook #2 ("POV: your outfit arrives looking exactly like the picture") got 4× more clicks. They scaled it the same week.

## ✍️ Practical
1. Build a 4-scene ad for a real product using your existing clips.
2. Create 2 alternative hooks.
3. Show all 3 to a friend and note which one they remember.

## ✅ Checklist
- [ ] My ad follows Hook→Product→Proof→CTA
- [ ] I have 3 hook variants
- [ ] CTA is one clear action' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization' and le.title = 'Making Ads & Promo Videos with AI'
)
update public.course_lessons le
   set resources = '[{"title":"Runway — AI video generation suite","url":"https://runwayml.com/","type":"tool"},{"title":"Meta — ad creative best practices","url":"https://www.facebook.com/business/ads-guide","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization' and le.title = 'Making Ads & Promo Videos with AI'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=-og75MUlnFk', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=-og75MUlnFk'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Faceless Channels & Content Systems', 'video', '16 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Faceless Channels & Content Systems'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Faceless Channels & Content Systems';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization' and le.title = 'Faceless Channels & Content Systems'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- What faceless channels are and which niches work
- Building a weekly content system with AI
- Keeping quality high at volume

## 📖 Lesson
A **faceless channel** grows without showing your face: AI voice + AI/generated visuals + strong scripts. Niches that work: motivation, scary stories, history facts, finance tips, tech explainers, quiz channels, sports stories.

The weekly system (one afternoon per week):
1. **Monday** — batch 5 scripts in ChatGPT from one theme.
2. **Tuesday** — batch voiceovers for all 5.
3. **Wednesday** — generate/select clips for all 5.
4. **Thursday** — edit all 5 in CapCut with one caption style.
5. **Fri–Sun** — schedule 1 per day.

Reuse one caption style, one music mood, one intro pattern — viewers recognize you by *style*, not face.

## 💡 Real-world example
A history facts channel batches 7 videos every Sunday using the same template. 400k followers in 8 months, monetized through the platform partner program + sponsors.

## ✍️ Practical
1. Pick a niche you can sustain for 30 videos.
2. Batch-generate 3 scripts now.
3. Define your channel''s one style rule (fonts, colors, music).

## ✅ Checklist
- [ ] I chose a sustainable niche
- [ ] I have 3 batched scripts
- [ ] My style rule is written down' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization' and le.title = 'Faceless Channels & Content Systems'
)
update public.course_lessons le
   set resources = '[{"title":"OpenAI documentation & prompting guide","url":"https://platform.openai.com/docs","type":"docs"},{"title":"ElevenLabs — AI voice generation","url":"https://elevenlabs.io/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization' and le.title = 'Faceless Channels & Content Systems'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=IMHBwskJqRo', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=IMHBwskJqRo'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Monetization: Clients, Rates & Getting Paid', 'project', '18 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Monetization: Clients, Rates & Getting Paid'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization'
)
update public.course_lessons le set type = 'project'
  from m where le.module_id = m.module_id and le.title = 'Monetization: Clients, Rates & Getting Paid';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization' and le.title = 'Monetization: Clients, Rates & Getting Paid'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 5 ways AI video skills make money
- How to price your first projects
- Getting your first 3 clients

## 📖 Lesson
Five income paths (start with 1–2):
1. **Freelance video creation** — ads, product videos for businesses (₦25k–₦150k+ per short video as you improve).
2. **Faceless channels** — platform ad revenue + sponsorships (slower, compounds).
3. **Content retainers** — monthly package: e.g. 12 videos/month for one business.
4. **Template/prompt packs** — sell your proven prompts & CapCut templates.
5. **Teaching** — teach what you learn.

Pricing rule for beginners: charge slightly below market to get 3 testimonials fast, then raise prices. Always collect: payment terms (50% upfront), revision limit (2 rounds), delivery date.

First 3 clients: (a) businesses you already buy from, (b) WhatsApp status announcement with a sample video, (c) free platform profiles (Fiverr/Upwork) with your best 2 samples.

## 💡 Real-world example
A student made 2 free sample ads for a local gym, posted them on WhatsApp, and a restaurant and a salon messaged the same day. Two paid clients from one afternoon of samples.

## ✍️ Practical
1. Write your one-line service offer ("I make AI promo videos for small businesses").
2. Set a starter price + 2-round revision policy.
3. Send your showreel to 5 potential clients today.

## ✅ Checklist
- [ ] I chose 1–2 income paths
- [ ] My pricing & revision policy is written
- [ ] I contacted 5 potential clients' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization' and le.title = 'Monetization: Clients, Rates & Getting Paid'
)
update public.course_lessons le
   set resources = '[{"title":"Fiverr — sell video services","url":"https://www.fiverr.com/","type":"tool"},{"title":"Upwork — freelance marketplace","url":"https://www.upwork.com/","type":"tool"},{"title":"ElevenLabs — AI voice generation","url":"https://elevenlabs.io/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ai-video-content-creation' and mo.title = 'Module 4: Publishing, Ads & Monetization' and le.title = 'Monetization: Clients, Rates & Getting Paid'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=T_-2M_1pgoE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=T_-2M_1pgoE'
);

with c as (select id from public.courses where slug = 'ai-video-content-creation')
insert into public.quizzes (course_id, title, description, passing_score, allow_retake, is_final, status, attempt_limit)
select c.id, 'Final Assessment — AI Video Content Creation', 'Final assessment — pass to move toward your certificate.', 70, true, true, 'published', null from c
where not exists (
  select 1 from public.quizzes z where z.course_id = c.id and z.title = 'Final Assessment — AI Video Content Creation'
);
update public.quizzes z set lesson_id = le.id
  from public.course_lessons le
 where z.course_id = le.course_id and le.title = 'Monetization: Clients, Rates & Getting Paid'
   and z.title = 'Final Assessment — AI Video Content Creation' and exists (select 1 from public.courses c where c.id = z.course_id and c.slug = 'ai-video-content-creation');
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ai-video-content-creation' and z.title = 'Final Assessment — AI Video Content Creation')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'What is the FIRST step of a professional AI video workflow?', '["Generate the video immediately","Write a clear script and shot plan","Pick background music","Add captions"]'::jsonb,
1, '[]'::jsonb,
'AI tools follow your instructions — a clear script and shot list is what makes the output usable.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'What is the FIRST step of a professional AI video workflow?'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ai-video-content-creation' and z.title = 'Final Assessment — AI Video Content Creation')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Which prompt element most improves AI video output quality?', '["All-caps text","Specific subject, style, camera and lighting details","Asking for 10 variations at once","Using only one-word prompts"]'::jsonb,
1, '[]'::jsonb,
'Specificity (subject, style, camera angle, lighting, mood) is the core prompting skill.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which prompt element most improves AI video output quality?'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ai-video-content-creation' and z.title = 'Final Assessment — AI Video Content Creation')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'You should always review AI-generated content for errors before publishing.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'AI output can contain mistakes and odd artifacts — human review is mandatory for professional work.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'You should always review AI-generated content for errors before publishing.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ai-video-content-creation' and z.title = 'Final Assessment — AI Video Content Creation')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'ElevenLabs is primarily used for…', '["Video upscaling","AI voice generation","Color grading","Thumbnail design"]'::jsonb,
1, '[]'::jsonb,
'ElevenLabs is a leading AI voice/text-to-speech platform used for narration and voiceovers.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'ElevenLabs is primarily used for…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ai-video-content-creation' and z.title = 'Final Assessment — AI Video Content Creation')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_answer', 'Which of these are legitimate ways to monetize AI video skills? (Select all that apply)', '["Creating ads for local businesses","Faceless content channels","Selling social media content packages","Publishing unedited AI output as your own original film"]'::jsonb,
null, '[0,1,2]'::jsonb,
'Client ads, content channels and packages are real income streams; misrepresenting raw AI output is not a sustainable business.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which of these are legitimate ways to monetize AI video skills? (Select all that apply)'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ai-video-content-creation' and z.title = 'Final Assessment — AI Video Content Creation')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'What does "image-to-video" mean in AI tools like Runway?', '["Printing video frames","Animating a still image into motion","Converting file formats","Compressing video size"]'::jsonb,
1, '[]'::jsonb,
'Image-to-video models take a still frame and generate believable motion from it.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'What does "image-to-video" mean in AI tools like Runway?'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ai-video-content-creation' and z.title = 'Final Assessment — AI Video Content Creation')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'The best hook for a short-form video appears…', '["After 30 seconds","In the first 1–3 seconds","Only in the caption","At the end"]'::jsonb,
1, '[]'::jsonb,
'Viewers decide in seconds — the hook must land immediately.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'The best hook for a short-form video appears…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ai-video-content-creation' and z.title = 'Final Assessment — AI Video Content Creation')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Captions/subtitles improve watch time on social video, especially for sound-off viewing.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'A large share of social video is watched muted; captions keep those viewers.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Captions/subtitles improve watch time on social video, especially for sound-off viewing.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ai-video-content-creation' and z.title = 'Final Assessment — AI Video Content Creation')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Before using AI-generated voices or faces commercially, you should…', '["Assume everything is allowed","Check the tool’s license and any likeness/consent rules","Credit the AI in the video title","Nothing — AI content has no rules"]'::jsonb,
1, '[]'::jsonb,
'Commercial use, likeness and consent rules vary by tool and jurisdiction — check before publishing.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Before using AI-generated voices or faces commercially, you should…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ai-video-content-creation' and z.title = 'Final Assessment — AI Video Content Creation')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A content calendar helps creators mainly by…', '["Replacing creativity","Keeping publishing consistent and planned","Increasing video file size","Automating client payments"]'::jsonb,
1, '[]'::jsonb,
'Consistency wins on every platform; a calendar turns ideas into a reliable pipeline.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A content calendar helps creators mainly by…'
);
with c as (select id from public.courses where slug = 'ai-video-content-creation')
insert into public.assignments (course_id, title, description, instructions, required_output, max_score, is_final_project, status)
select c.id, 'Final Project: AI Video Campaign for a Real Brand', 'Produce a complete short AI-video campaign for a real business or brand (yours or a volunteer client’s).', '1) Write a 30–60 second script using the hook → value → CTA structure.
2) Generate all visuals/video clips with AI tools (text-to-video and/or image-to-video).
3) Add an AI voiceover, captions and music.
4) Edit everything into a finished vertical (9:16) video.
5) Write a short reflection: what prompts worked, what you would improve.', 'One exported vertical video (MP4 or link), the script document, and your 1-page reflection. Submit the video file or a hosted link with a note describing your tools and process.', 100, true, 'published' from c
where not exists (
  select 1 from public.assignments a where a.course_id = c.id and a.title = 'Final Project: AI Video Campaign for a Real Brand'
);
update public.assignments a set lesson_id = le.id
  from public.course_lessons le
 where a.course_id = le.course_id and le.title = 'Monetization: Clients, Rates & Getting Paid'
   and a.title = 'Final Project: AI Video Campaign for a Real Brand' and exists (select 1 from public.courses c where c.id = a.course_id and c.slug = 'ai-video-content-creation');
with c as (select id from public.courses where slug = 'ai-video-content-creation')
insert into public.course_completion_rules (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project)
select c.id, 100, 70, 0, true from c
on conflict (course_id) do update
  set require_lessons_pct = excluded.require_lessons_pct,
      require_quiz_avg = excluded.require_quiz_avg,
      require_assignments_approved = excluded.require_assignments_approved,
      require_final_project = excluded.require_final_project,
      updated_at = now();

-- ---------- video-editing-capcut ----------
with c as (select id from public.courses where slug = 'video-editing-capcut')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 1: CapCut Fundamentals', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 1: CapCut Fundamentals'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Installing CapCut & Mastering the Interface', 'video', '13 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Installing CapCut & Mastering the Interface'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Installing CapCut & Mastering the Interface';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals' and le.title = 'Installing CapCut & Mastering the Interface'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- CapCut Mobile vs PC vs Web — which to use when
- Every main panel explained in plain English
- Setting up your first project correctly

## 📖 Lesson
CapCut is free and runs on phone, PC and browser. **Phone** is fastest for social edits; **PC** is better for long/precise work.

The interface has 4 zones:
1. **Media panel (top-left)** — your imported clips, audio, text.
2. **Preview window (top-right)** — what your video looks like right now.
3. **Timeline (bottom)** — the heart of editing: clips sit left→right in time. Multiple tracks stack: video, overlay, text, audio.
4. **Inspector (right)** — settings for whatever clip you selected.

Project setup habits that save you: set your **ratio first** (9:16 for TikTok/Reels, 16:9 for YouTube), name the project properly, and import footage into one folder before starting.

## 💡 Real-world example
Editors who set the ratio *after* editing spend an hour re-positioning every clip. One setting, chosen first, avoids it entirely.

## ✍️ Practical
1. Install CapCut on your phone and (if you have one) PC.
2. Create a project, set 9:16, import 3 clips.
3. Identify out loud: media panel, preview, timeline, inspector.

## ✅ Checklist
- [ ] CapCut installed
- [ ] I set the ratio before editing
- [ ] I can name all 4 interface zones' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals' and le.title = 'Installing CapCut & Mastering the Interface'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"},{"title":"Pexels — free stock video & photos","url":"https://www.pexels.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals' and le.title = 'Installing CapCut & Mastering the Interface'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=JsulvGcoEWU', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=JsulvGcoEWU'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Your First Edit: Import, Arrange, Trim', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Your First Edit: Import, Arrange, Trim'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Your First Edit: Import, Arrange, Trim';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals' and le.title = 'Your First Edit: Import, Arrange, Trim'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The import → arrange → trim loop
- Cutting out mistakes and dead moments
- Thinking in "selects": keeping only the best moments

## 📖 Lesson
Every edit starts the same way:
1. **Import** your clips.
2. **Arrange** them on the timeline in story order — just drag.
3. **Trim** each clip: drag the edges to keep only the strongest seconds.

The professional mindset is **selects**: film 30 seconds, keep 3. Viewers forgive short; they never forgive boring. Cut every moment where nothing happens: breaths, camera shakes, "umm"s.

Use the **split** tool (scissors) to cut a clip in two at the playhead, then delete the weak half. This is the single most-used action in editing — practise it until it''s automatic.

## 💡 Real-world example
A vlogger films 20 minutes of a market visit. Her final video is 45 seconds — 15 two-to-three-second highlights. That selection is why people watch till the end.

## ✍️ Practical
1. Import 5 clips and arrange them in a story order.
2. Trim each to its best 2–4 seconds.
3. Use split+delete to remove one mistake cleanly.

## ✅ Checklist
- [ ] Clips arranged in story order
- [ ] Every clip trimmed to its best part
- [ ] I used split + delete confidently' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals' and le.title = 'Your First Edit: Import, Arrange, Trim'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"},{"title":"Pexels — free stock video & photos","url":"https://www.pexels.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals' and le.title = 'Your First Edit: Import, Arrange, Trim'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=JsulvGcoEWU', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=JsulvGcoEWU'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Cuts, Transitions & the Art of Timing', 'video', '16 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Cuts, Transitions & the Art of Timing'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Cuts, Transitions & the Art of Timing';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals' and le.title = 'Cuts, Transitions & the Art of Timing'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Jump cut vs J/L cut vs cutaway
- When transitions help vs hurt
- Cutting on motion and on the beat

## 📖 Lesson
**Cuts** (invisible edits):
- **Jump cut** — same angle, time skips forward. Perfect for talking videos; removes pauses.
- **Cutaway** — cut to something else (hands, product), then back. Hides mistakes smoothly.
- **Cut on motion** — change clips *while* something moves; the eye follows motion and never notices the cut.

**Transitions** (visible effects): use sparingly. One clean style per video looks professional; five different ones look amateur. Favourites that stay classy: whip pan, zoom blur, simple dissolve.

**Timing rule:** cut on the beat of the music, or on a spoken emphasis. Your video instantly feels "edited by a pro".

## 💡 Real-world example
Two creators use the same clips. One cuts randomly; the other cuts exactly when the drum hits. The second video feels 10× more energetic — same footage, only timing differs.

## ✍️ Practical
1. Add background music to your project.
2. Make 5 cuts that land exactly on drum beats.
3. Add ONE transition style only, used twice.

## ✅ Checklist
- [ ] I know jump cut / cutaway / cut-on-motion
- [ ] My cuts land on beats or emphasis
- [ ] Max one transition style per video' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals' and le.title = 'Cuts, Transitions & the Art of Timing'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"},{"title":"This page is a great read on cut types","url":"https://www.studiobinder.com/blog/different-film-cuts/","type":"article"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals' and le.title = 'Cuts, Transitions & the Art of Timing'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qfHX2cNA4MY', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qfHX2cNA4MY'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Aspect Ratios & Platform-Perfect Exports', 'video', '12 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Aspect Ratios & Platform-Perfect Exports'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Aspect Ratios & Platform-Perfect Exports';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals' and le.title = 'Aspect Ratios & Platform-Perfect Exports'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The ratios every platform expects
- Framing safely so buttons never cover your content
- Export settings that keep quality high

## 📖 Lesson
| Use | Ratio | Resolution |
|---|---|---|
| TikTok / Reels / Shorts / WhatsApp | 9:16 | 1080×1920 |
| YouTube | 16:9 | 1920×1080 |
| Instagram feed / LinkedIn | 1:1 or 4:5 | 1080×1080 |

**Safe zone:** platforms cover the bottom ~20% and right edge with buttons. Keep faces and captions in the middle 70% of the frame.

Export settings for social: 1080p, 30fps (60fps only for gaming/sports), high bitrate. 4K uploads often get *compressed harder* by platforms — 1080p is the sweet spot.

## 💡 Real-world example
A creator''s captions kept getting hidden by TikTok''s buttons. Moving all text up one "thumb zone" doubled average watch time — viewers finally read the message.

## ✍️ Practical
1. Set your project to 9:16 and reposition key content into the safe zone.
2. Export at 1080p/30fps.
3. Open the export on your phone and check nothing is covered.

## ✅ Checklist
- [ ] Correct ratio per platform
- [ ] Content sits in the safe zone
- [ ] Exported 1080p 30fps' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals' and le.title = 'Aspect Ratios & Platform-Perfect Exports'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 1: CapCut Fundamentals' and le.title = 'Aspect Ratios & Platform-Perfect Exports'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=JsulvGcoEWU', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=JsulvGcoEWU'
);

with c as (select id from public.courses where slug = 'video-editing-capcut')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 2: Motion, Effects & Keyframes', 1 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 2: Motion, Effects & Keyframes'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Keyframes: The Skill That Separates Pros', 'video', '17 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Keyframes: The Skill That Separates Pros'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Keyframes: The Skill That Separates Pros';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes' and le.title = 'Keyframes: The Skill That Separates Pros'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- What a keyframe actually is (in plain English)
- Zoom-ins, pans and follows built with 2 keyframes
- The slow-zoom trick that keeps static shots alive

## 📖 Lesson
A **keyframe** tells CapCut: "at THIS moment, be HERE". Give it two keyframes and it animates between them automatically.

The big three:
- **Slow zoom-in**: keyframe 1 scale 100% at the start, keyframe 2 scale 110% at the end. Static talking shots suddenly feel alive.
- **Pan across**: animate position X from left to right — great for photos and wide shots.
- **Follow/punch-in**: zoom to 130% on an important sentence, back to 100% after. Emphasis without words.

Rule: keyframes should be slow and subtle (5–15% change). If viewers notice the zoom, it''s too much.

## 💡 Real-world example
Top talking-head creators never show a static frame: every 3–5 seconds there''s a tiny zoom or punch-in. That invisible motion is why you keep watching.

## ✍️ Practical
1. Add a slow zoom-in (100→108%) to a 5-second clip.
2. Add a punch-in to one key moment.
3. Watch both at normal speed — invisible but alive?

## ✅ Checklist
- [ ] I can explain keyframes simply
- [ ] I built a slow zoom + a punch-in
- [ ] My motion is subtle' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes' and le.title = 'Keyframes: The Skill That Separates Pros'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes' and le.title = 'Keyframes: The Skill That Separates Pros'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qfHX2cNA4MY', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qfHX2cNA4MY'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Speed Ramps, Overlays & Picture-in-Picture', 'video', '16 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Speed Ramps, Overlays & Picture-in-Picture'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Speed Ramps, Overlays & Picture-in-Picture';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes' and le.title = 'Speed Ramps, Overlays & Picture-in-Picture'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Speed ramps (slow-mo → fast) the right way
- Overlays: layering video on video
- Clean picture-in-picture and reaction layouts

## 📖 Lesson
**Speed:** CapCut''s speed tools: normal (constant %) and curve (speed ramp). The classic ramp: slow motion at the beauty moment → fast through the boring travel between moments. For smooth slow-mo, film in 60fps, then slow to 50%.

**Overlay track** = a second video layer on top of the first. Uses:
- **Picture-in-picture** — your face reacting in a corner while footage plays.
- **B-roll over voice** — narration continues while visuals change.
- **Green screen / cutout** — CapCut''s "Remove BG" isolates people without a green screen.

Keep overlays in a consistent corner with a small border or shadow so they look intentional.

## 💡 Real-world example
A food creator films cooking hands (main track) and her reactions (overlay, bottom-right). One camera, two angles, twice the energy.

## ✍️ Practical
1. Build one speed ramp: slow→fast on a walking/running clip.
2. Add a face-cam overlay in a corner with the cutout tool.
3. Make sure the overlay never covers the main action.

## ✅ Checklist
- [ ] Speed ramp flows smoothly
- [ ] Overlay placed consistently
- [ ] Main action never blocked' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes' and le.title = 'Speed Ramps, Overlays & Picture-in-Picture'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"},{"title":"Pexels — free stock video & photos","url":"https://www.pexels.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes' and le.title = 'Speed Ramps, Overlays & Picture-in-Picture'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qfHX2cNA4MY', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qfHX2cNA4MY'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Effects, Filters & Motion Tracking', 'video', '15 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Effects, Filters & Motion Tracking'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Effects, Filters & Motion Tracking';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes' and le.title = 'Effects, Filters & Motion Tracking'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Using effects with taste (the 20% rule)
- Filters & adjustments for a consistent look
- Motion tracking text/emojis to moving objects

## 📖 Lesson
**The 20% rule:** effects should serve the video, not decorate it. Max ~20% of your runtime should carry visible effects; the rest stays clean.

Effect categories that earn their place:
- **Glow/light leaks** — warmth on intros
- **Shake** — energy on beat drops
- **Blur transitions** — hiding jump cuts
- **Retros/VHS** — nostalgia styles

**Filters/Adjustments:** apply ONE filter across all clips for a consistent "grade". Then fine-tune: brightness +5, contrast +10, saturation +5 is a safe starting recipe.

**Motion tracking:** select a clip → Tracking → attach text/sticker to a moving object (a product, a person''s head). Instantly looks like big-budget editing.

## 💡 Real-world example
A sneaker video tracks a price tag sticker to the shoe as it rotates. Ten seconds of work, hundreds of comments asking "how did you do that?".

## ✍️ Practical
1. Apply one filter to all clips in your project.
2. Add one effect on an intro, and only there.
3. Motion-track one text label to a moving object.

## ✅ Checklist
- [ ] One consistent filter everywhere
- [ ] Effects used on ≤20% of runtime
- [ ] One tracked element works' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes' and le.title = 'Effects, Filters & Motion Tracking'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes' and le.title = 'Effects, Filters & Motion Tracking'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qfHX2cNA4MY', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qfHX2cNA4MY'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Removing Backgrounds, Masks & Creative Tricks', 'video', '15 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Removing Backgrounds, Masks & Creative Tricks'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Removing Backgrounds, Masks & Creative Tricks';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes' and le.title = 'Removing Backgrounds, Masks & Creative Tricks'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Cutout: removing backgrounds without green screen
- Masks: revealing and shaping footage
- Three creative tricks that look expensive

## 📖 Lesson
**Cutout (Auto removal):** isolates a person from any background. Perfect for placing yourself over new scenes, product-style intros, and text-behind-person effects.

**Masks** hide parts of a clip. Uses:
- **Reveal** — a split line wipes across showing the next scene
- **Text behind person** — duplicate clip, cutout the person to the top layer, text in between
- **Clone effect** — mask half the frame and film yourself twice

Three tricks that look expensive:
1. **Text behind subject** (cutout + layers).
2. **Snap transition** — finger snap, cut on the snap to a new outfit/location.
3. **Zoom-through** — fast zoom into black, cut, zoom out of black in the new scene.

## 💡 Real-world example
A fashion creator''s "snap" transitions between 3 outfits got her first 100k-view video. The whole trick is one well-timed cut per snap.

## ✍️ Practical
1. Use auto-cutout to place yourself on a new background.
2. Build a text-behind-person shot.
3. Film and cut one snap transition.

## ✅ Checklist
- [ ] Cutout edges look clean
- [ ] Text-behind-person works
- [ ] One snap transition lands on the beat' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes' and le.title = 'Removing Backgrounds, Masks & Creative Tricks'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"},{"title":"Pixabay — free footage & music","url":"https://pixabay.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 2: Motion, Effects & Keyframes' and le.title = 'Removing Backgrounds, Masks & Creative Tricks'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qfHX2cNA4MY', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qfHX2cNA4MY'
);

with c as (select id from public.courses where slug = 'video-editing-capcut')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 3: Audio & Text', 2 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 3: Audio & Text'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Music, Beats & Sound Design', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Music, Beats & Sound Design'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Music, Beats & Sound Design';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text' and le.title = 'Music, Beats & Sound Design'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Finding safe, free music
- Beat marking: cutting visuals to the rhythm
- Layering sound effects like a pro

## 📖 Lesson
**Music sources:** CapCut''s library (safe for TikTok), Pixabay and Mixkit (free, check each license). Never use popular songs for client/commercial work — copyright claims can mute or demonetize videos.

**Beat marking:** CapCut can auto-detect beats (or tap "Add beat" while listening). Put your cuts exactly on beat markers — this one habit is the difference between amateur and pro feel.

**Sound design layers** (volume guide):
- Music: 10–15% under voice, 60–80% in music-only moments
- Voice: 100%, always loudest
- SFX: whoosh on transitions, pop on text, riser before reveals — each ≤1s

Silence is also a tool: a sudden 0.5s of silence before a big moment creates tension.

## 💡 Real-world example
The same travel montage with random cuts: 900 views. Re-cut to the beat with whoosh transitions: 47k views. Zero footage changes.

## ✍️ Practical
1. Add a track and mark its beats.
2. Re-cut your timeline so every cut lands on a beat.
3. Add whoosh + pop SFX at 3 moments, volumes balanced.

## ✅ Checklist
- [ ] Music is licensed/free
- [ ] Cuts land on beats
- [ ] Voice stays loudest' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text' and le.title = 'Music, Beats & Sound Design'
)
update public.course_lessons le
   set resources = '[{"title":"Mixkit — free music & sound effects","url":"https://mixkit.co/","type":"resource"},{"title":"Pixabay — free footage & music","url":"https://pixabay.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text' and le.title = 'Music, Beats & Sound Design'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qfHX2cNA4MY', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qfHX2cNA4MY'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Auto-Captions & Text Animation', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Auto-Captions & Text Animation'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Auto-Captions & Text Animation';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text' and le.title = 'Auto-Captions & Text Animation'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Generating and cleaning auto-captions
- The caption style used by viral creators
- Text animations that add energy, not noise

## 📖 Lesson
80%+ of short videos play muted. **Captions are content.**

CapCut auto-captions workflow: Text → Auto captions → generate → then *proofread*. Names, brands and local words always need manual fixing.

Viral caption style:
- Big, bold font, high contrast (white + black outline)
- 2–4 words on screen at a time
- Highlight the spoken keyword in a brand colour
- Positioned in the safe zone (middle 70%)

Text animation favourites: **spring** for pops, **typewriter** for storytelling, **karaoke word-highlight** for music-style energy. One animation style per video keeps it classy.

## 💡 Real-world example
A finance creator switched from paragraphs of small text to 3-word bold captions with yellow keywords. Retention went up 22% — people finally *read* while scrolling muted.

## ✍️ Practical
1. Generate auto-captions and fix every error.
2. Restyle: bold, outlined, 2–4 words per line.
3. Highlight one keyword per sentence in colour.

## ✅ Checklist
- [ ] Captions proofread
- [ ] 2–4 words per line
- [ ] Keywords highlighted' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text' and le.title = 'Auto-Captions & Text Animation'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text' and le.title = 'Auto-Captions & Text Animation'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qfHX2cNA4MY', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qfHX2cNA4MY'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Voiceovers, TTS & Audio Cleanup', 'video', '14 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Voiceovers, TTS & Audio Cleanup'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Voiceovers, TTS & Audio Cleanup';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text' and le.title = 'Voiceovers, TTS & Audio Cleanup'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Recording clean voiceovers on a phone
- Using CapCut text-to-speech well
- Noise reduction, fades and voice clarity tools

## 📖 Lesson
**Recording:** quiet room (closets are great), phone 15–20cm from your mouth, record in short takes. CapCut has built-in **noise reduction** and **enhance voice** — turn them on for instant cleanup.

**TTS (text-to-speech):** type text → Text-to-speech → pick a voice. Great for faceless content and consistent narration. Always slow the speed 5–10% for natural feel, and spell names phonetically.

**Audio polish checklist:**
- Fade-in/out on music (0.3–0.5s) — no harsh starts/stops
- Voice normalized louder than music
- No clip longer than 0.3s of dead silence
- Loudness roughly equal across takes

## 💡 Real-world example
A tutorial creator recorded voiceovers under a blanket with a ₦5k earpiece mic. After noise reduction, viewers assumed a studio setup — clarity beats gear.

## ✍️ Practical
1. Record a 20-second voiceover on your phone in a quiet space.
2. Apply noise reduction + enhance voice.
3. Create one TTS line and adjust its speed.

## ✅ Checklist
- [ ] Voiceover recorded cleanly
- [ ] Cleanup tools applied
- [ ] Music fades in/out smoothly' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text' and le.title = 'Voiceovers, TTS & Audio Cleanup'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text' and le.title = 'Voiceovers, TTS & Audio Cleanup'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=JsulvGcoEWU', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=JsulvGcoEWU'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Stickers, Emojis & Engagement Layers', 'video', '12 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Stickers, Emojis & Engagement Layers'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Stickers, Emojis & Engagement Layers';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text' and le.title = 'Stickers, Emojis & Engagement Layers'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Using stickers/emojis to hold attention
- Engagement overlays (polls, arrows, highlights)
- Keeping decoration from killing professionalism

## 📖 Lesson
Stickers are **attention anchors** — small visual surprises that re-engage a wandering eye every few seconds.

Good uses:
- Arrow pointing to the important detail
- Emoji reacting at the punchline
- Circles/highlights on screenshots and tutorials
- Progress bars for multi-step content

The taste rule: stickers must match the video''s tone. Business video → minimal arrows & clean highlights. Comedy/lifestyle → emoji energy welcome. Never place a sticker over a face or key product.

## 💡 Real-world example
A tech tutorial added a red circle + arrow every time a setting appeared on screen. Comments shifted from "where is that?" to "so clear, thank you!"

## ✍️ Practical
1. Add 3 engagement stickers where attention might drop.
2. Add one arrow highlighting a key detail.
3. Watch muted: does anything important get covered?

## ✅ Checklist
- [ ] Stickers match the tone
- [ ] Nothing important is covered
- [ ] Attention anchors every few seconds' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text' and le.title = 'Stickers, Emojis & Engagement Layers'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 3: Audio & Text' and le.title = 'Stickers, Emojis & Engagement Layers'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=JsulvGcoEWU', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=JsulvGcoEWU'
);

with c as (select id from public.courses where slug = 'video-editing-capcut')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 4: Color, Viral Styles & Real Projects', 3 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 4: Color, Viral Styles & Real Projects'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Color Grading & Filters for a Cinematic Look', 'video', '15 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Color Grading & Filters for a Cinematic Look'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Color Grading & Filters for a Cinematic Look';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects' and le.title = 'Color Grading & Filters for a Cinematic Look'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Adjustments: brightness, contrast, saturation, sharpen
- The 5-slider recipe for a clean look
- Keeping skin tones natural

## 📖 Lesson
Color grading is makeup for footage. Start with the **5-slider recipe**:
1. Brightness: +5 to +10
2. Contrast: +10 to +15
3. Saturation: +5 to +10
4. Sharpen: +10 to +20 (makes phone footage crisp)
5. Temperature: slightly warm (+5) for friendly, cool (-5) for techy

Then apply the same adjustment values to **every clip** — consistency is what makes separate clips feel like one film. Check skin tones after every change: if faces look orange or grey, reduce saturation/temperature.

For styles: filters are shortcuts, adjustments are control. Pros use filters at 40–60% strength, then fine-tune.

## 💡 Real-world example
Two creators film the same café. Raw footage looks flat; the graded version (recipe above + warm temp) looks like an ad. Same phone, same light — 5 sliders.

## ✍️ Practical
1. Apply the 5-slider recipe to one clip.
2. Copy those exact values to all clips.
3. Compare before/after — keep skin natural.

## ✅ Checklist
- [ ] Recipe applied consistently
- [ ] Skin tones still natural
- [ ] Footage looks sharper and warmer' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects' and le.title = 'Color Grading & Filters for a Cinematic Look'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects' and le.title = 'Color Grading & Filters for a Cinematic Look'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qfHX2cNA4MY', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qfHX2cNA4MY'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Trending Edit Styles: Reels, TikTok & Transitions', 'video', '16 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Trending Edit Styles: Reels, TikTok & Transitions'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Trending Edit Styles: Reels, TikTok & Transitions';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects' and le.title = 'Trending Edit Styles: Reels, TikTok & Transitions'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 5 edit styles that keep going viral
- How to reverse-engineer any trend
- Building your own template from a trend

## 📖 Lesson
Five evergreen viral styles:
1. **Velocity edits** — speed ramps synced hard to beat drops.
2. **Photo dump slideshows** — 0.5s per photo, on beat, with one filter.
3. **Before/after reveals** — hard cut exactly on the musical hit.
4. **Talking head + B-roll** — narration with cutaway visuals every 3s.
5. **POV storytelling** — first-person view + big captions.

**Reverse-engineer any trend:** watch it 3 times — once for structure (how many scenes?), once for timing (seconds per scene?), once for tricks (which effects?). Write it down, then rebuild with your footage.

Save your best project as a **template** (CapCut templates) — next trend, 10-minute turnaround.

## 💡 Real-world example
A creator saw a 5-scene "outfit glow-up" trend, wrote its structure down (0.8s setup → beat drop → 4× 0.4s looks), rebuilt it the same day, and rode the trend before it peaked.

## ✍️ Practical
1. Pick one trending video and reverse-engineer it on paper.
2. Recreate its structure with your own clips.
3. Save it as a template.

## ✅ Checklist
- [ ] I can break down any trend
- [ ] I recreated one trend structure
- [ ] Template saved for reuse' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects' and le.title = 'Trending Edit Styles: Reels, TikTok & Transitions'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects' and le.title = 'Trending Edit Styles: Reels, TikTok & Transitions'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=JsulvGcoEWU', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=JsulvGcoEWU'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Export Settings, Codecs & Quality Control', 'video', '12 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Export Settings, Codecs & Quality Control'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Export Settings, Codecs & Quality Control';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects' and le.title = 'Export Settings, Codecs & Quality Control'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Resolution, frame rate, bitrate — what actually matters
- Export presets per platform
- A 60-second QC checklist before publishing

## 📖 Lesson
**Resolution:** 1080p for social. **Frame rate:** match your footage (usually 30fps). **Bitrate:** "Recommended/High" in CapCut — too low = blocky gradients.

Platform presets:
- TikTok/Reels/Shorts: 1080×1920, 30fps, high bitrate
- YouTube: 1920×1080 (or 4K if you edited in 4K), 30/60fps
- WhatsApp: keep ≤ 60–100MB for easy sharing

**QC checklist before export:**
1. Watch start-to-end once, no stopping.
2. Audio: voice clear, music never louder.
3. Captions: readable, no typos.
4. Safe zone: nothing covered by buttons.
5. First & last frames: no black flashes.
6. Re-watch the first 3 seconds — that''s your hook.

## 💡 Real-world example
An editor found a 1-frame black flash at the start of a client ad during QC. The client''s ads platform had rejected it twice before — QC caught what uploads couldn''t.

## ✍️ Practical
1. Run the full QC checklist on your project.
2. Fix everything found.
3. Export with the right preset for your target platform.

## ✅ Checklist
- [ ] Full watch-through done
- [ ] Audio balanced
- [ ] Exported with platform preset' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects' and le.title = 'Export Settings, Codecs & Quality Control'
)
update public.course_lessons le
   set resources = '[{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects' and le.title = 'Export Settings, Codecs & Quality Control'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=JsulvGcoEWU', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=JsulvGcoEWU'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Capstone: Produce a Complete 30-Second Viral Edit', 'project', '22 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Capstone: Produce a Complete 30-Second Viral Edit'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects'
)
update public.course_lessons le set type = 'project'
  from m where le.module_id = m.module_id and le.title = 'Capstone: Produce a Complete 30-Second Viral Edit';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects' and le.title = 'Capstone: Produce a Complete 30-Second Viral Edit'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Running a full professional workflow end-to-end
- Delivering a portfolio-ready video
- What to learn next as an editor

## 📖 Lesson
Your capstone: one complete 30-second video using everything:
1. **Plan** — pick a subject (you, a product, your city). Write a 5-scene shot list.
2. **Gather** — film your own clips and/or download free stock from Pexels.
3. **Assemble** — arrange, trim, cut on the beat.
4. **Elevate** — keyframe zooms, ONE transition style, color recipe, captions, SFX.
5. **QC & export** — full checklist, platform preset.

Grading rubric (aim for 4+/5 on each): pacing (something changes every 2–3s), audio clarity, caption quality, color consistency, hook strength (first 2 seconds).

Next steps after this course: learn DaVinci Resolve (free, pro-grade), study motion graphics, and build a portfolio of 5 edits in different styles.

## 💡 Real-world example
Past students posted their capstone on WhatsApp status first. Three got freelance editing inquiries the same week — proof that one great sample opens doors.

## ✍️ Practical
1. Produce the complete 30-second video end-to-end.
2. Grade yourself honestly against the rubric.
3. Post it publicly and add it to your portfolio folder.

## ✅ Checklist
- [ ] 30s video planned, edited, QC''d, exported
- [ ] Rubric scored 4+/5 in every area
- [ ] Published and saved to portfolio' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects' and le.title = 'Capstone: Produce a Complete 30-Second Viral Edit'
)
update public.course_lessons le
   set resources = '[{"title":"Pexels — free stock video & photos","url":"https://www.pexels.com/","type":"resource"},{"title":"Mixkit — free music & sound effects","url":"https://mixkit.co/","type":"resource"},{"title":"CapCut — official app & web editor","url":"https://www.capcut.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'video-editing-capcut' and mo.title = 'Module 4: Color, Viral Styles & Real Projects' and le.title = 'Capstone: Produce a Complete 30-Second Viral Edit'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qfHX2cNA4MY', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qfHX2cNA4MY'
);

with c as (select id from public.courses where slug = 'video-editing-capcut')
insert into public.quizzes (course_id, title, description, passing_score, allow_retake, is_final, status, attempt_limit)
select c.id, 'Final Assessment — Video Editing with CapCut', 'Final assessment — pass to move toward your certificate.', 70, true, true, 'published', null from c
where not exists (
  select 1 from public.quizzes z where z.course_id = c.id and z.title = 'Final Assessment — Video Editing with CapCut'
);
update public.quizzes z set lesson_id = le.id
  from public.course_lessons le
 where z.course_id = le.course_id and le.title = 'Capstone: Produce a Complete 30-Second Viral Edit'
   and z.title = 'Final Assessment — Video Editing with CapCut' and exists (select 1 from public.courses c where c.id = z.course_id and c.slug = 'video-editing-capcut');
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'video-editing-capcut' and z.title = 'Final Assessment — Video Editing with CapCut')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'What is a "cut" in video editing?', '["A color filter","The point where one clip changes to the next","A music track","A caption style"]'::jsonb,
1, '[]'::jsonb,
'Cuts are the fundamental building blocks of every edit.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'What is a "cut" in video editing?'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'video-editing-capcut' and z.title = 'Final Assessment — Video Editing with CapCut')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Why do editors trim clip beginnings and endings?', '["To add effects","To remove dead space and keep pacing tight","To reduce file names","To change aspect ratio"]'::jsonb,
1, '[]'::jsonb,
'Tight trims remove hesitations and keep viewer attention.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Why do editors trim clip beginnings and endings?'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'video-editing-capcut' and z.title = 'Final Assessment — Video Editing with CapCut')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'J-cuts and L-cuts let audio and video transition at different moments for smoother edits.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'J/L cuts overlap audio across edits — a core professional technique.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'J-cuts and L-cuts let audio and video transition at different moments for smoother edits.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'video-editing-capcut' and z.title = 'Final Assessment — Video Editing with CapCut')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Auto-captions in CapCut should always be…', '["Left exactly as generated","Proofread and corrected","Deleted before export","Set to the largest font"]'::jsonb,
1, '[]'::jsonb,
'Auto-caption engines make mistakes; wrong words look unprofessional.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Auto-captions in CapCut should always be…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'video-editing-capcut' and z.title = 'Final Assessment — Video Editing with CapCut')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_answer', 'Which export settings matter for platform delivery? (Select all that apply)', '["Resolution (e.g. 1080p)","Frame rate","Aspect ratio (9:16 vs 16:9)","The camera brand used to film"]'::jsonb,
null, '[0,1,2]'::jsonb,
'Resolution, frame rate and aspect ratio must match the target platform; camera brand is irrelevant to export.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which export settings matter for platform delivery? (Select all that apply)'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'video-editing-capcut' and z.title = 'Final Assessment — Video Editing with CapCut')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Keyframes are used to…', '["Lock the timeline","Animate properties (position, scale, opacity) over time","Save project backups","Sync audio"]'::jsonb,
1, '[]'::jsonb,
'Keyframes record values at moments so the software interpolates motion between them.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Keyframes are used to…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'video-editing-capcut' and z.title = 'Final Assessment — Video Editing with CapCut')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'The safest place for important on-screen text is…', '["Touching the very edge","Inside the platform-safe center area","Behind the subject","At 5% opacity"]'::jsonb,
1, '[]'::jsonb,
'Platforms crop edges and overlay UI; safe areas keep text visible.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'The safest place for important on-screen text is…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'video-editing-capcut' and z.title = 'Final Assessment — Video Editing with CapCut')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Sound design (SFX + music) mainly improves…', '["File compression","Emotional impact and perceived quality","Storage space","Upload speed"]'::jsonb,
1, '[]'::jsonb,
'Audio is half the experience — well-chosen sound sells the edit.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Sound design (SFX + music) mainly improves…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'video-editing-capcut' and z.title = 'Final Assessment — Video Editing with CapCut')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'You should organize footage into folders/bins before starting a big edit.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Organization saves hours on any project with many clips.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'You should organize footage into folders/bins before starting a big edit.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'video-editing-capcut' and z.title = 'Final Assessment — Video Editing with CapCut')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A viral short-form edit typically changes something visually every…', '["30 seconds","1–3 seconds","2 minutes","It never changes"]'::jsonb,
1, '[]'::jsonb,
'Frequent visual changes (cuts, zooms, text) hold attention in short-form.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A viral short-form edit typically changes something visually every…'
);
with c as (select id from public.courses where slug = 'video-editing-capcut')
insert into public.assignments (course_id, title, description, instructions, required_output, max_score, is_final_project, status)
select c.id, 'Final Project: 60-Second Client-Style Edit', 'Edit a 45–60 second video for a real or realistic client brief (product promo, event recap, or creator reel).', '1) Gather or shoot 8–15 clips (phone footage is fine).
2) Edit with tight cuts, at least 2 transitions used intentionally, background music and sound effects.
3) Add auto-captions and CORRECT every mistake.
4) Apply one consistent color style.
5) Export twice: 9:16 for TikTok/Reels and 16:9 for YouTube, both 1080p.', 'Both exported files (or links), plus a short note listing the techniques used (J/L cuts, keyframes, captions, sound design).', 100, true, 'published' from c
where not exists (
  select 1 from public.assignments a where a.course_id = c.id and a.title = 'Final Project: 60-Second Client-Style Edit'
);
update public.assignments a set lesson_id = le.id
  from public.course_lessons le
 where a.course_id = le.course_id and le.title = 'Capstone: Produce a Complete 30-Second Viral Edit'
   and a.title = 'Final Project: 60-Second Client-Style Edit' and exists (select 1 from public.courses c where c.id = a.course_id and c.slug = 'video-editing-capcut');
with c as (select id from public.courses where slug = 'video-editing-capcut')
insert into public.course_completion_rules (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project)
select c.id, 100, 70, 0, true from c
on conflict (course_id) do update
  set require_lessons_pct = excluded.require_lessons_pct,
      require_quiz_avg = excluded.require_quiz_avg,
      require_assignments_approved = excluded.require_assignments_approved,
      require_final_project = excluded.require_final_project,
      updated_at = now();

-- ---------- graphic-design-canva ----------
with c as (select id from public.courses where slug = 'graphic-design-canva')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 1: Design Foundations & Canva Mastery', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 1: Design Foundations & Canva Mastery'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'How Designers Think: Hierarchy, Balance, Space', 'video', '14 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'How Designers Think: Hierarchy, Balance, Space'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'How Designers Think: Hierarchy, Balance, Space';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery' and le.title = 'How Designers Think: Hierarchy, Balance, Space'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 4 invisible rules behind every good design
- Why "simple" beats "busy" every time
- How to train your design eye in 10 minutes a day

## 📖 Lesson
Good design is not decoration — it''s **communication**. Four rules:

1. **Hierarchy** — the eye must know what to read 1st, 2nd, 3rd. Biggest/boldest = most important. One hero element per design.
2. **Alignment** — every element should line up with something. Invisible lines make designs feel tidy and professional.
3. **Contrast** — dark vs light, big vs small. Contrast creates attention; low contrast creates confusion.
4. **White space** — empty space is not wasted space. It gives the eye room to breathe and makes content feel premium.

**Train your eye:** daily, screenshot 3 designs you like (posters, ads, app screens) and ask: what do I see first? Why? You''ll absorb the rules faster than any textbook.

## 💡 Real-world example
Two flyers for the same event: one crams in 6 fonts and 9 colors; the other uses 2 fonts, 3 colors, and lots of space. People assume the second one is the "expensive" event.

## ✍️ Practical
1. Screenshot 3 designs you admire.
2. Label each: hero element, alignment lines, white space.
3. Write your own one-line definition of hierarchy.

## ✅ Checklist
- [ ] I can name the 4 rules
- [ ] I analyzed 3 real designs
- [ ] I know why white space matters' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery' and le.title = 'How Designers Think: Hierarchy, Balance, Space'
)
update public.course_lessons le
   set resources = '[{"title":"Canva Design School — free official lessons","url":"https://www.canva.com/learn/","type":"course"},{"title":"Canva — graphic design basics hub","url":"https://www.canva.com/learn/graphic-design-tips/","type":"article"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery' and le.title = 'How Designers Think: Hierarchy, Balance, Space'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=yWJp7gQqCQ8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=yWJp7gQqCQ8'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Canva Interface, Templates & Smart Tools', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Canva Interface, Templates & Smart Tools'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Canva Interface, Templates & Smart Tools';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery' and le.title = 'Canva Interface, Templates & Smart Tools'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Navigating Canva like a pro (web & mobile)
- Using templates without looking like a template
- Magic tools: resize, background remover, Magic Write

## 📖 Lesson
Canva''s workspace: left panel = **Elements, Text, Uploads, Templates**; center = canvas; top bar = undo, resize, share/export.

**Templates are starting points, not finished designs.** Customize all 4: colors → your palette, fonts → your 2 fonts, images → relevant ones, text → your words. Change at least 60% of a template before calling it yours.

Magic tools worth learning first:
- **Magic Resize** — one design → Instagram post + story + flyer sizes instantly (Pro, but worth it)
- **Background Remover** — clean product/portrait cutouts in one click
- **Magic Write** — generate and fix copy inside the design

Free account + free elements cover 90% of client work. Filter by "Free" to avoid surprise paywalls at export.

## 💡 Real-world example
A student used a template unchanged — viewers recognized it instantly from Canva''s homepage. The same template with new colors, fonts and photos looked completely original.

## ✍️ Practical
1. Open a free template and change colors, fonts, images and text.
2. Try Background Remover on a portrait.
3. Export as PNG.

## ✅ Checklist
- [ ] I know the workspace panels
- [ ] I customized a template ≥60%
- [ ] I used one Magic tool' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery' and le.title = 'Canva Interface, Templates & Smart Tools'
)
update public.course_lessons le
   set resources = '[{"title":"Canva — free design tool","url":"https://www.canva.com/","type":"tool"},{"title":"Canva Design School — free official lessons","url":"https://www.canva.com/learn/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery' and le.title = 'Canva Interface, Templates & Smart Tools'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=yWJp7gQqCQ8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=yWJp7gQqCQ8'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Typography & Color: The Two Fastest Upgrades', 'video', '16 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Typography & Color: The Two Fastest Upgrades'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Typography & Color: The Two Fastest Upgrades';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery' and le.title = 'Typography & Color: The Two Fastest Upgrades'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Pairing fonts that look expensive
- Choosing a palette in 60 seconds
- The 60-30-10 color rule

## 📖 Lesson
**Fonts:** use max 2 per design — one **display** font (bold, characterful) for headlines, one clean **body** font for everything else. Classic pairings: bold sans-serif headline + light sans body; elegant serif headline + simple sans body. Never stretch, warp or outline-shadow text.

**Color:** build palettes with Coolors or steal from great brands. Then apply **60-30-10**:
- 60% dominant (usually background)
- 30% secondary (shapes, blocks)
- 10% accent (buttons, keywords — your loudest color)

Check contrast: light text on dark backgrounds (or reverse). If you squint and can''t read it, fix it.

## 💡 Real-world example
A brand kit redesign changed nothing but fonts (2 fonts) and palette (60-30-10). Their Instagram suddenly looked like one brand instead of a random feed — followers asked who their designer was.

## ✍️ Practical
1. Pick 2 fonts (display + body) and use them in a test design.
2. Generate a palette on Coolors; apply it 60-30-10.
3. Squint-test readability.

## ✅ Checklist
- [ ] Max 2 fonts per design
- [ ] Palette follows 60-30-10
- [ ] Text passes the squint test' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery' and le.title = 'Typography & Color: The Two Fastest Upgrades'
)
update public.course_lessons le
   set resources = '[{"title":"Google Fonts — free commercial fonts","url":"https://fonts.google.com/","type":"resource"},{"title":"Coolors — color palette generator","url":"https://coolors.co/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery' and le.title = 'Typography & Color: The Two Fastest Upgrades'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=rXLvN1FEkOE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=rXLvN1FEkOE'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Working with Images, Icons & Brand Assets', 'video', '14 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Working with Images, Icons & Brand Assets'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Working with Images, Icons & Brand Assets';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery' and le.title = 'Working with Images, Icons & Brand Assets'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Where to get free, legal, high-quality images
- Frames, grids and photo composition tricks
- Building a reusable brand kit

## 📖 Lesson
**Sources:** Pexels, Unsplash (free, commercial-safe), Canva''s free library. Avoid random Google Images — copyright claims are real and clients get burned.

**Using photos well:**
- Pick images with **empty space** where text will sit
- Use **frames/grids** (Elements → Frames) for clean shapes
- Darken busy photos with a transparent black overlay before adding text
- Keep image style consistent (same lighting/mood) across one project

**Brand kit** (even on free Canva): save your 2 fonts + 5 colors as a style page, and keep logos in your Uploads folder. Every new design starts on-brand in 30 seconds.

## 💡 Real-world example
A small restaurant''s posts used random clip-art for months. Switching to consistent Pexels food photography + one overlay style doubled post saves.

## ✍️ Practical
1. Download 3 on-theme photos from Pexels.
2. Place one in a frame, add a dark overlay + readable text.
3. Save your fonts & colors as your brand style reference.

## ✅ Checklist
- [ ] All images legally sourced
- [ ] Text readable over photos
- [ ] Brand fonts/colors saved' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery' and le.title = 'Working with Images, Icons & Brand Assets'
)
update public.course_lessons le
   set resources = '[{"title":"Pexels — free stock photos","url":"https://www.pexels.com/","type":"resource"},{"title":"Unsplash — free high-quality photos","url":"https://unsplash.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 1: Design Foundations & Canva Mastery' and le.title = 'Working with Images, Icons & Brand Assets'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=UkzVLHeSf7c', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=UkzVLHeSf7c'
);

with c as (select id from public.courses where slug = 'graphic-design-canva')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 2: Social Media Design Pack', 1 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 2: Social Media Design Pack'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Instagram Post & Carousel Design', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Instagram Post & Carousel Design'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Instagram Post & Carousel Design';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack' and le.title = 'Instagram Post & Carousel Design'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Designing scroll-stopping single posts
- Carousels that get swiped to the end
- Sizes and safe zones that never crop badly

## 📖 Lesson
**Single post anatomy:** one hook line (big), one supporting line (small), one visual hero, your handle small in a corner. That''s it — posts with one message win.

**Carousels** (multi-slide posts) get the highest engagement because each swipe counts as interaction:
- Slide 1: bold hook/question
- Slides 2–6: ONE idea per slide, big text, same layout rhythm
- Last slide: CTA ("Save this", "Follow for more")
- Design trick: run one element (line/arrow/shape) across slide edges to pull swipes

Sizes: post 1080×1080 or 1080×1350 (portrait shows bigger on phones), story/reel cover 1080×1920.

## 💡 Real-world example
A creator''s carousel "5 Canva shortcuts" kept one yellow arrow continuing across every slide edge. Completion rate (people reaching slide 7) doubled vs their normal posts.

## ✍️ Practical
1. Design one hook post with the anatomy above.
2. Build a 5-slide carousel, one idea per slide.
3. Add a cross-slide element on at least two edges.

## ✅ Checklist
- [ ] Single post = one message
- [ ] Carousel: hook → 1 idea/slide → CTA
- [ ] Correct sizes used' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack' and le.title = 'Instagram Post & Carousel Design'
)
update public.course_lessons le
   set resources = '[{"title":"Canva — free design tool","url":"https://www.canva.com/","type":"tool"},{"title":"HubSpot — social media image sizes","url":"https://blog.hubspot.com/marketing/social-media-image-dimensions","type":"article"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack' and le.title = 'Instagram Post & Carousel Design'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=rXLvN1FEkOE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=rXLvN1FEkOE'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Story, Reel Cover & Status Graphics', 'video', '13 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Story, Reel Cover & Status Graphics'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Story, Reel Cover & Status Graphics';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack' and le.title = 'Story, Reel Cover & Status Graphics'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Designing for 9:16 safely
- Reel covers that make profiles look premium
- WhatsApp status graphics for business

## 📖 Lesson
**9:16 safe zones:** platforms cover the top ~15% (username) and bottom ~25% (buttons/captions). Keep all key content in the middle band. Design at 1080×1920.

**Reel covers** are your profile''s first impression: one consistent cover style (same font + color strip) makes a messy grid look like a brand. Template it once, reuse forever.

**WhatsApp status graphics** are an underrated business tool in Nigeria: daily/weekly promo cards, price lists, "just arrived" posts. Rules: huge text (status is viewed fast), one offer per graphic, your number always visible.

## 💡 Real-world example
A hair vendor posts one clean WhatsApp status card daily: product photo + price + "DM to order". Regular customers screenshot and share it — free distribution.

## ✍️ Practical
1. Design a Reel cover template (title + consistent style strip).
2. Design a WhatsApp promo card with huge text.
3. Check both in a phone-sized preview — readable at a glance?

## ✅ Checklist
- [ ] Key content in 9:16 safe band
- [ ] Reel cover template created
- [ ] WhatsApp card readable at a glance' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack' and le.title = 'Story, Reel Cover & Status Graphics'
)
update public.course_lessons le
   set resources = '[{"title":"Canva — free design tool","url":"https://www.canva.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack' and le.title = 'Story, Reel Cover & Status Graphics'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=UkzVLHeSf7c', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=UkzVLHeSf7c'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'YouTube Thumbnails & Banners', 'video', '15 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'YouTube Thumbnails & Banners'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'YouTube Thumbnails & Banners';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack' and le.title = 'YouTube Thumbnails & Banners'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Thumbnail formulas that earn clicks
- Faces, contrast and the 3-word rule
- Channel banner sizing done right

## 📖 Lesson
Thumbnails decide 80% of whether a video gets clicked. Winning formula:
1. **Big emotion face** (surprise/joy) or **one bold object**
2. **Max 3–4 words** — huge, thick font, high contrast (outline helps)
3. **Bright, separated colors** — subject pops from background
4. Curiosity gap: image + words ask a question the title answers

Design at 1280×720. Test tiny: shrink the design to phone-list size — if you can''t read it, make text bigger.

**Banner:** 2560×1440, but only the center 1546×423 shows on all devices. Put name + value line + schedule there; edges are decorative only.

## 💡 Real-world example
A channel swapped busy screenshots for face + 3-word thumbnails ("STOP Doing This"). Click-through rate went from 2.1% to 6.8% — same videos, better packaging.

## ✍️ Practical
1. Design a thumbnail with face + 3 words for any topic.
2. Shrink-test it to phone size.
3. Design a banner with the safe center filled.

## ✅ Checklist
- [ ] Thumbnail readable at phone size
- [ ] Max 4 words, huge contrast
- [ ] Banner safe center used' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack' and le.title = 'YouTube Thumbnails & Banners'
)
update public.course_lessons le
   set resources = '[{"title":"Canva — free design tool","url":"https://www.canva.com/","type":"tool"},{"title":"YouTube — thumbnail best practices","url":"https://support.google.com/youtube/answer/141805","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack' and le.title = 'YouTube Thumbnails & Banners'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=rXLvN1FEkOE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=rXLvN1FEkOE'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Ad Creative That Converts', 'video', '15 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Ad Creative That Converts'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Ad Creative That Converts';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack' and le.title = 'Ad Creative That Converts'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The layout of a converting static ad
- Designing offers people act on
- Making 3 ad variants fast

## 📖 Lesson
Static ad anatomy (top → bottom):
1. **Pattern interrupt** — bold visual or question that stops the scroll
2. **Offer** — what they get, in 5–8 words
3. **Proof/price** — discount, review stars, "500+ sold"
4. **CTA button-look** — "Order on WhatsApp", "Book Now" (even on statics, a button shape lifts action)

Design for emotion first, details second: one dominant visual, max 2 fonts, brand accent color only on the CTA.

**Variant workflow:** duplicate the design 3×, change ONE element per variant (headline / image / CTA color). Then let the ad platform decide the winner.

## 💡 Real-world example
A skincare seller ran 3 variants changing only the headline. "Glow in 7 days" beat "New cream available" by 3× on orders — same product, same price.

## ✍️ Practical
1. Build one static ad with the 4-part anatomy.
2. Duplicate into 3 variants, one change each.
3. Export all three at 1080×1080.

## ✅ Checklist
- [ ] Anatomy complete (interrupt→offer→proof→CTA)
- [ ] Accent color only on CTA
- [ ] 3 variants ready' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack' and le.title = 'Ad Creative That Converts'
)
update public.course_lessons le
   set resources = '[{"title":"Canva — free design tool","url":"https://www.canva.com/","type":"tool"},{"title":"Meta — ad design guides","url":"https://www.facebook.com/business/ads-guide","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 2: Social Media Design Pack' and le.title = 'Ad Creative That Converts'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=UkzVLHeSf7c', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=UkzVLHeSf7c'
);

with c as (select id from public.courses where slug = 'graphic-design-canva')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 3: Flyers, Logos & Brand Kits', 2 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 3: Flyers, Logos & Brand Kits'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Flyer & Poster Design (Events, Churches, Business)', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Flyer & Poster Design (Events, Churches, Business)'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Flyer & Poster Design (Events, Churches, Business)';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits' and le.title = 'Flyer & Poster Design (Events, Churches, Business)'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The flyer layout that always works
- Typography for events: drama without mess
- Print vs digital export settings

## 📖 Lesson
Flyer layout (Z-pattern — how eyes scan):
1. **Top:** event title, BIGGEST text, most dramatic font
2. **Middle:** hero image/visual + key details (date • time • venue)
3. **Bottom:** contact/CTA + socials/logos

Rules: one dramatic display font for the title, one clean font for details. Make DATE & VENUE easy to find — flyers fail when people can''t find *when/where*. High contrast background or overlay. Sizes: A4/A5 for print, 1080×1350 for sharing online.

Export: **PDF Print** for printers (choose CMYK if available), **PNG** for WhatsApp/social.

## 💡 Real-world example
A church flyer redesign kept the same photo but moved the date 3× bigger under the title. "When is it?" calls stopped completely.

## ✍️ Practical
1. Design an event flyer using the Z-layout.
2. Show it for 3 seconds, hide it — can your friend recall date & venue?
3. Export PDF Print + PNG versions.

## ✅ Checklist
- [ ] Title biggest, details findable
- [ ] Two fonts max
- [ ] Both exports correct' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits' and le.title = 'Flyer & Poster Design (Events, Churches, Business)'
)
update public.course_lessons le
   set resources = '[{"title":"Canva — free design tool","url":"https://www.canva.com/","type":"tool"},{"title":"Pexels — free stock photos","url":"https://www.pexels.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits' and le.title = 'Flyer & Poster Design (Events, Churches, Business)'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=yWJp7gQqCQ8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=yWJp7gQqCQ8'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Logo Design & Brand Identity Basics', 'video', '17 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Logo Design & Brand Identity Basics'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Logo Design & Brand Identity Basics';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits' and le.title = 'Logo Design & Brand Identity Basics'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- What makes a logo work (and what kills it)
- Designing a simple, ownable logo in Canva
- Delivering a mini brand kit to clients

## 📖 Lesson
Great logos are **simple, memorable, scalable** (readable at favicon size AND on a billboard). Avoid: gradients that break in print, 5+ colors, thin script fonts at small sizes, stock icons unchanged (other businesses will have the same mark).

Canva logo workflow:
1. Sketch 5 concept directions on paper first (icon + wordmark combos)
2. Build the strongest one: geometric icon + bold wordmark
3. Test: shrink to 32px — still recognizable?
4. Make 3 versions: full color, all-black, all-white

**Mini brand kit deliverable:** logo set + 2 fonts + 5 colors + 3 post templates. This is a real paid package businesses need.

## 💡 Real-world example
A student designed a simple lettermark (single letter in a bold shape) for a barbershop. The owner printed it on shirts and signage the same week — simple logos travel everywhere.

## ✍️ Practical
1. Sketch 5 logo concepts for an imaginary brand.
2. Build the best one in Canva; test at tiny size.
3. Assemble the mini brand kit page.

## ✅ Checklist
- [ ] Logo readable at 32px
- [ ] 3 color versions made
- [ ] Mini brand kit assembled' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits' and le.title = 'Logo Design & Brand Identity Basics'
)
update public.course_lessons le
   set resources = '[{"title":"Canva Design School — free official lessons","url":"https://www.canva.com/learn/","type":"course"},{"title":"Google Fonts — free commercial fonts","url":"https://fonts.google.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits' and le.title = 'Logo Design & Brand Identity Basics'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=rXLvN1FEkOE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=rXLvN1FEkOE'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Business Cards, Letterheads & Stationery', 'video', '13 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Business Cards, Letterheads & Stationery'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Business Cards, Letterheads & Stationery';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits' and le.title = 'Business Cards, Letterheads & Stationery'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Clean stationery layouts
- What belongs on a business card in 2025
- Matching everything to the brand kit

## 📖 Lesson
**Business card (3.5×2in):** front = logo + name + role; back = phone/WhatsApp, email, one-line value, QR code (Canva can generate QR codes) linking to your portfolio or WhatsApp. Max 3 fonts sizes hierarchy; keep ≥5mm margins — printers cut imprecisely.

**Letterhead:** logo top-left or center, contact strip at bottom, generous white space in the middle (it''s for *their* content). **Invoice templates** use the same header — consistency makes small businesses look established.

Everything pulls from the brand kit: same 2 fonts, same palette. Ten matching touchpoints = instant trust.

## 💡 Real-world example
A caterer sent proposals on branded letterhead with matching invoice templates. Clients assumed a bigger company — and paid bigger-company prices.

## ✍️ Practical
1. Design a two-sided business card with a QR code.
2. Design a matching letterhead.
3. Check margins and font hierarchy on both.

## ✅ Checklist
- [ ] Card: front identity, back contact + QR
- [ ] Letterhead matches brand kit
- [ ] Print margins respected' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits' and le.title = 'Business Cards, Letterheads & Stationery'
)
update public.course_lessons le
   set resources = '[{"title":"Canva — free design tool","url":"https://www.canva.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits' and le.title = 'Business Cards, Letterheads & Stationery'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=UkzVLHeSf7c', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=UkzVLHeSf7c'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Menus, Price Lists & Product Catalogs', 'video', '14 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Menus, Price Lists & Product Catalogs'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Menus, Price Lists & Product Catalogs';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits' and le.title = 'Menus, Price Lists & Product Catalogs'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Layouts that make prices easy to scan
- Product catalog pages that sell
- Updating designs fast when prices change

## 📖 Lesson
Food vendors, salons and shops need these weekly — a reliable income niche for designers.

**Menu/price list layout:** group items into sections with headers; align prices in one vertical column (dotted leaders optional); photos only for hero items — too many photos look cheap. One accent color for "best sellers".

**Catalog page:** product photo (same background on all products!), name, one-line benefit, price, "Order via WhatsApp" footer on every page.

**Speed tip:** build ONE master template with styles locked. When prices change, the client only edits numbers — you keep the design retainer.

## 💡 Real-world example
A designer charges a salon a small monthly fee to update their price list and post it as a WhatsApp graphic. Ten minutes of work, recurring income.

## ✍️ Practical
1. Design a 2-section menu with aligned price column.
2. Design a catalog page with 3 products on identical backgrounds.
3. Add the WhatsApp order footer.

## ✅ Checklist
- [ ] Prices aligned and scannable
- [ ] Product photos consistent
- [ ] Template reusable for updates' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits' and le.title = 'Menus, Price Lists & Product Catalogs'
)
update public.course_lessons le
   set resources = '[{"title":"Canva — free design tool","url":"https://www.canva.com/","type":"tool"},{"title":"Pexels — free stock photos","url":"https://www.pexels.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 3: Flyers, Logos & Brand Kits' and le.title = 'Menus, Price Lists & Product Catalogs'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=yWJp7gQqCQ8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=yWJp7gQqCQ8'
);

with c as (select id from public.courses where slug = 'graphic-design-canva')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 4: Presentations, Clients & Income', 3 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 4: Presentations, Clients & Income'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Presentation Design (Slides People Remember)', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Presentation Design (Slides People Remember)'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Presentation Design (Slides People Remember)';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income' and le.title = 'Presentation Design (Slides People Remember)'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 1-idea-per-slide rule
- Visual slides vs text walls
- Presenting straight from Canva

## 📖 Lesson
Death by PowerPoint is death by *text*. Fix it with:
1. **One idea per slide** — if you need "and", make a new slide
2. **Headline states the takeaway** ("Sales grew 40%" not "Q3 Results")
3. **Visuals carry the slide**: chart, icon, photo — text max ~20 words
4. **Consistent rhythm**: same font sizes and margins across slides

Charts: simplify — remove gridlines, label the important number directly. Canva''s built-in charts connect to your data.

Use Canva''s **present mode** (record yourself too) — no need for other software.

## 💡 Real-world example
A student pitch changed headlines from labels ("Marketing") to claims ("Instagram will double our leads"). The panel remembered every claim — claims stick, labels don''t.

## ✍️ Practical
1. Build a 6-slide deck: hook slide + 4 idea slides + CTA.
2. Apply claim-style headlines.
3. Present it in Canva''s present mode once.

## ✅ Checklist
- [ ] One idea per slide
- [ ] Headlines are claims
- [ ] ≤20 words per slide' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income' and le.title = 'Presentation Design (Slides People Remember)'
)
update public.course_lessons le
   set resources = '[{"title":"Canva — free design tool","url":"https://www.canva.com/","type":"tool"},{"title":"Canva presentations hub","url":"https://www.canva.com/presentations/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income' and le.title = 'Presentation Design (Slides People Remember)'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=rXLvN1FEkOE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=rXLvN1FEkOE'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Client Workflow: Brief → Draft → Delivery', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Client Workflow: Brief → Draft → Delivery'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Client Workflow: Brief → Draft → Delivery';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income' and le.title = 'Client Workflow: Brief → Draft → Delivery'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Running a professional design project A to Z
- The brief questions that prevent rework
- Delivering files clients can actually use

## 📖 Lesson
**1. Brief (before any design):** ask — What is this for? Who is the audience? What ONE action should it trigger? Preferred colors/brands to avoid? Deadline? Examples you like? Get answers in writing (WhatsApp is fine).

**2. Draft:** show 1–2 directions as rough previews, not full finals. Agree on direction first — it halves revisions.

**3. Revisions:** define rounds (2 included). Log every change request in one message list.

**4. Delivery package:** PNG (social), PDF (print), editable Canva template link if agreed, plus fonts/colors used. Name files clearly: `BrandName_Flyer_v2_Final.png`.

**Invoice habit:** 50% deposit before work starts. Professionals don''t design on promises.

## 💡 Real-world example
A designer skipped the brief once: the client "hated blue" — revealed after the final. Every project since starts with the written brief. Zero surprise rework.

## ✍️ Practical
1. Write your 6-question brief template.
2. Run it on a practice client (friend/business).
3. Deliver a full package with named files.

## ✅ Checklist
- [ ] Brief template ready
- [ ] Direction approved before finals
- [ ] Files delivered, named professionally' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income' and le.title = 'Client Workflow: Brief → Draft → Delivery'
)
update public.course_lessons le
   set resources = '[{"title":"Canva — free design tool","url":"https://www.canva.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income' and le.title = 'Client Workflow: Brief → Draft → Delivery'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=UkzVLHeSf7c', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=UkzVLHeSf7c'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Selling Design Services Online', 'video', '16 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Selling Design Services Online'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Selling Design Services Online';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income' and le.title = 'Selling Design Services Online'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Packaging skills into sellable offers
- Where to find clients (locally & globally)
- Pricing that grows with your skill

## 📖 Lesson
Turn "I use Canva" into offers:
- **Productized gigs:** "Instagram pack — 10 branded posts" / "Event flyer in 24h" / "Logo + brand kit"
- **Retainers:** monthly content design for businesses (predictable income)
- **Digital products:** editable Canva template packs (sell repeatedly)

Channels: WhatsApp status + local businesses first (fastest money), then Behance portfolio + Fiverr/Upwork profiles (global reach). Post 3 samples per niche you want: restaurants see food designs, salons see beauty designs.

**Pricing ladder:** beginner = affordable + fast + testimonials. After 5 happy clients, raise 30–50%. Never compete only on price — compete on reliability and speed.

## 💡 Real-world example
A Canva designer made 3 mock restaurant menus, posted them, and tagged local restaurants. Two DM''d within a week. Proof beats promises.

## ✍️ Practical
1. Write 3 productized offers with clear deliverables.
2. Set up Behance or a portfolio folder with 3 samples.
3. Announce your services on WhatsApp status today.

## ✅ Checklist
- [ ] 3 clear offers written
- [ ] Portfolio live somewhere
- [ ] First announcement posted' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income' and le.title = 'Selling Design Services Online'
)
update public.course_lessons le
   set resources = '[{"title":"Fiverr — sell design gigs","url":"https://www.fiverr.com/","type":"tool"},{"title":"Behance — free design portfolio","url":"https://www.behance.net/","type":"tool"},{"title":"Upwork — freelance marketplace","url":"https://www.upwork.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income' and le.title = 'Selling Design Services Online'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=yWJp7gQqCQ8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=yWJp7gQqCQ8'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Capstone: Complete Brand Package for a Real Business', 'project', '22 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Capstone: Complete Brand Package for a Real Business'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income'
)
update public.course_lessons le set type = 'project'
  from m where le.module_id = m.module_id and le.title = 'Capstone: Complete Brand Package for a Real Business';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income' and le.title = 'Capstone: Complete Brand Package for a Real Business'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Delivering a full professional brand package
- Presenting work so clients say yes
- Adding a flagship piece to your portfolio

## 📖 Lesson
Your capstone — a complete package for one (real or practice) business:
1. **Brief** — run your 6 questions.
2. **Logo** — 3 versions (color/black/white), tested at small size.
3. **Brand board** — fonts, palette (60-30-10), logo usage.
4. **Social pack** — 3 posts + 1 story + 1 reel cover, all on-brand.
5. **Print piece** — flyer OR business card, PDF Print export.
6. **Presentation** — 6 slides showing the work beautifully (mockups help).

Present it like an agency: explain the *thinking* behind each choice. Clients pay for decisions, not decorations.

Next steps: collect a testimonial, add this package to Behance/your portfolio, and pitch 3 similar businesses this week.

## 💡 Real-world example
Students who finished this capstone with a real local business converted 1 in 3 pitches into paid follow-up work within a month.

## ✍️ Practical
1. Complete all 6 deliverables for one business.
2. Build the 6-slide presentation of your work.
3. Send/present it and ask for a testimonial.

## ✅ Checklist
- [ ] Full package delivered (logo→print)
- [ ] Work presented with reasoning
- [ ] Testimonial requested' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income' and le.title = 'Capstone: Complete Brand Package for a Real Business'
)
update public.course_lessons le
   set resources = '[{"title":"Canva — free design tool","url":"https://www.canva.com/","type":"tool"},{"title":"Google Fonts — free commercial fonts","url":"https://fonts.google.com/","type":"resource"},{"title":"Coolors — color palette generator","url":"https://coolors.co/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'graphic-design-canva' and mo.title = 'Module 4: Presentations, Clients & Income' and le.title = 'Capstone: Complete Brand Package for a Real Business'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=rXLvN1FEkOE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=rXLvN1FEkOE'
);

with c as (select id from public.courses where slug = 'graphic-design-canva')
insert into public.quizzes (course_id, title, description, passing_score, allow_retake, is_final, status, attempt_limit)
select c.id, 'Final Assessment — Graphic Design with Canva', 'Final assessment — pass to move toward your certificate.', 70, true, true, 'published', null from c
where not exists (
  select 1 from public.quizzes z where z.course_id = c.id and z.title = 'Final Assessment — Graphic Design with Canva'
);
update public.quizzes z set lesson_id = le.id
  from public.course_lessons le
 where z.course_id = le.course_id and le.title = 'Capstone: Complete Brand Package for a Real Business'
   and z.title = 'Final Assessment — Graphic Design with Canva' and exists (select 1 from public.courses c where c.id = z.course_id and c.slug = 'graphic-design-canva');
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'graphic-design-canva' and z.title = 'Final Assessment — Graphic Design with Canva')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Visual hierarchy means…', '["Using as many fonts as possible","Guiding the viewer’s eye to what matters first","Centering everything","Using only photos"]'::jsonb,
1, '[]'::jsonb,
'Hierarchy (size, weight, color, position) controls what the viewer sees first.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Visual hierarchy means…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'graphic-design-canva' and z.title = 'Final Assessment — Graphic Design with Canva')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A professional design should usually use at most…', '["1–2 font families","5–6 fonts","Any number","Only images, never text"]'::jsonb,
0, '[]'::jsonb,
'One or two consistent font families keep designs clean and professional.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A professional design should usually use at most…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'graphic-design-canva' and z.title = 'Final Assessment — Graphic Design with Canva')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Contrast between text and background is both a design and an accessibility requirement.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Low contrast text is unreadable for many people and looks unprofessional to everyone.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Contrast between text and background is both a design and an accessibility requirement.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'graphic-design-canva' and z.title = 'Final Assessment — Graphic Design with Canva')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Which file format is best for a logo that must scale without quality loss?', '["JPG","SVG","TXT","MP4"]'::jsonb,
1, '[]'::jsonb,
'SVG is vector — it scales infinitely without pixelation.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which file format is best for a logo that must scale without quality loss?'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'graphic-design-canva' and z.title = 'Final Assessment — Graphic Design with Canva')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_answer', 'Which elements make a business flyer effective? (Select all that apply)', '["One clear call to action","Readable contact details","Strong visual focus","Ten different messages competing for attention"]'::jsonb,
null, '[0,1,2]'::jsonb,
'Focus, readability and a single CTA convert; competing messages confuse.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which elements make a business flyer effective? (Select all that apply)'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'graphic-design-canva' and z.title = 'Final Assessment — Graphic Design with Canva')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'White space (empty space) in a design is…', '["Wasted space","A tool that improves focus and elegance","A printing error","Only for luxury brands"]'::jsonb,
1, '[]'::jsonb,
'White space lets content breathe and directs attention.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'White space (empty space) in a design is…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'graphic-design-canva' and z.title = 'Final Assessment — Graphic Design with Canva')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A brand kit typically contains…', '["Server passwords","Colors, fonts and logo variations","Client invoices","Stock subscriptions"]'::jsonb,
1, '[]'::jsonb,
'Brand kits enforce visual consistency across every design.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A brand kit typically contains…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'graphic-design-canva' and z.title = 'Final Assessment — Graphic Design with Canva')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Before delivering client designs you should…', '["Export in the formats the client needs","Watermark them permanently","Keep the source hidden forever","Only send screenshots"]'::jsonb,
0, '[]'::jsonb,
'Professional delivery means the right formats (print PDF, PNG, SVG…) for the use case.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Before delivering client designs you should…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'graphic-design-canva' and z.title = 'Final Assessment — Graphic Design with Canva')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Alignment of elements is one of the fastest ways to make a design look professional.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Misalignment is the most common amateur tell; alignment instantly adds polish.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Alignment of elements is one of the fastest ways to make a design look professional.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'graphic-design-canva' and z.title = 'Final Assessment — Graphic Design with Canva')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Color psychology in branding means…', '["Picking your favorite color","Choosing colors that support the brand’s message and feelings","Using rainbow gradients always","Avoiding color entirely"]'::jsonb,
1, '[]'::jsonb,
'Colors carry associations (trust, energy, luxury) that support brand messaging.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Color psychology in branding means…'
);
with c as (select id from public.courses where slug = 'graphic-design-canva')
insert into public.assignments (course_id, title, description, instructions, required_output, max_score, is_final_project, status)
select c.id, 'Final Project: Complete Brand Mini-Kit', 'Design a brand mini-kit for a real or invented business: logo, social media set and one flyer.', '1) Define the brand: name, audience, 2 fonts, 3–4 colors (document why).
2) Design a primary logo + one variation (e.g. icon-only).
3) Create a social pack: 1 profile frame, 2 post templates, 1 story template.
4) Design one A5 flyer with a clear single CTA.
5) Apply hierarchy, alignment and white-space rules throughout.', 'A presentation (PDF) showing all pieces with your design rationale, plus the flyer exported as print-ready PDF.', 100, true, 'published' from c
where not exists (
  select 1 from public.assignments a where a.course_id = c.id and a.title = 'Final Project: Complete Brand Mini-Kit'
);
update public.assignments a set lesson_id = le.id
  from public.course_lessons le
 where a.course_id = le.course_id and le.title = 'Capstone: Complete Brand Package for a Real Business'
   and a.title = 'Final Project: Complete Brand Mini-Kit' and exists (select 1 from public.courses c where c.id = a.course_id and c.slug = 'graphic-design-canva');
with c as (select id from public.courses where slug = 'graphic-design-canva')
insert into public.course_completion_rules (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project)
select c.id, 100, 70, 0, true from c
on conflict (course_id) do update
  set require_lessons_pct = excluded.require_lessons_pct,
      require_quiz_avg = excluded.require_quiz_avg,
      require_assignments_approved = excluded.require_assignments_approved,
      require_final_project = excluded.require_final_project,
      updated_at = now();

-- ---------- digital-marketing ----------
with c as (select id from public.courses where slug = 'digital-marketing')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 1: Marketing Foundations & Funnels', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 1: Marketing Foundations & Funnels'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Digital Marketing Landscape: Channels & Careers', 'video', '15 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Digital Marketing Landscape: Channels & Careers'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Digital Marketing Landscape: Channels & Careers';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels' and le.title = 'Digital Marketing Landscape: Channels & Careers'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 7 main digital channels and what each does
- How businesses combine them
- Where marketers make money (jobs, freelance, own brand)

## 📖 Lesson
The 7 channels:
1. **Search (SEO)** — free rankings on Google
2. **Paid ads** — Google/Meta/TikTok ads for instant traffic
3. **Social media** — organic content & community
4. **Email/WhatsApp** — direct, owned, highest conversion
5. **Content** — blogs, videos that attract & educate
6. **Influencer/affiliate** — borrowing other people''s audiences
7. **Analytics** — measuring everything (binds them all)

Businesses rarely use one channel alone. A typical Nigerian SME combo: Instagram content + WhatsApp closing + small Meta ads + Google Business Profile.

Career paths: in-house marketer, agency specialist, freelancer, or marketing your own business. Specialists (one channel deep) get paid faster than generalists — then expand.

## 💡 Real-world example
A phone accessories shop: posts reviews on Instagram (social), boosts best posts (ads), closes on WhatsApp (direct), and ranks for "iPhone repair Lekki" (local SEO). Four channels, one system.

## ✍️ Practical
1. Pick a local business; list which channels they use today.
2. Identify the ONE channel they''re missing.
3. Write which channel you''ll specialize in first, and why.

## ✅ Checklist
- [ ] I can name all 7 channels
- [ ] I analyzed a real business''s mix
- [ ] I chose my first specialty' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels' and le.title = 'Digital Marketing Landscape: Channels & Careers'
)
update public.course_lessons le
   set resources = '[{"title":"HubSpot Academy — free marketing certifications","url":"https://academy.hubspot.com/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels' and le.title = 'Digital Marketing Landscape: Channels & Careers'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=G6DmDqYLWL8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=G6DmDqYLWL8'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Customer Personas & the Marketing Funnel', 'video', '16 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Customer Personas & the Marketing Funnel'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Customer Personas & the Marketing Funnel';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels' and le.title = 'Customer Personas & the Marketing Funnel'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Building a customer persona that changes your content
- Awareness → Consideration → Conversion funnel
- Matching content to funnel stage

## 📖 Lesson
You can''t sell to "everybody". A **persona** is a written sketch of your ideal customer: name, age, location, income, fears, dreams, where they spend time online, what they type into Google.

The **funnel** describes their journey:
- **Awareness** — they discover a problem ("my skin is dry") → content: education, tips
- **Consideration** — they compare solutions → content: reviews, comparisons, proof
- **Conversion** — they choose → content: offers, guarantees, easy contact

Most failed marketing is stage mismatch: pushing "BUY NOW" to someone who doesn''t know they have a problem yet.

## 💡 Real-world example
A fitness coach wrote content for "busy mums in Surulere who want 20-minute home workouts" instead of "fitness". Her engagement tripled — specificity sells.

## ✍️ Practical
1. Write one persona for a business you know (10 lines).
2. List 1 content idea per funnel stage for them.
3. Identify where that business currently talks most (usually conversion — the mistake).

## ✅ Checklist
- [ ] Persona written (10 lines)
- [ ] 3 funnel-stage contents listed
- [ ] I can spot stage-mismatched marketing' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels' and le.title = 'Customer Personas & the Marketing Funnel'
)
update public.course_lessons le
   set resources = '[{"title":"HubSpot Academy — free marketing certifications","url":"https://academy.hubspot.com/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels' and le.title = 'Customer Personas & the Marketing Funnel'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=G6DmDqYLWL8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=G6DmDqYLWL8'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Positioning, Offers & the Value Ladder', 'video', '15 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Positioning, Offers & the Value Ladder'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Positioning, Offers & the Value Ladder';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels' and le.title = 'Positioning, Offers & the Value Ladder'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Positioning: why customers pick YOU
- Writing offers that are easy to say yes to
- The value ladder (free → cheap → premium)

## 📖 Lesson
**Positioning** = the one idea a customer remembers about you. Formula: "We help [who] get [result] through [unique method], unlike [alternative]."

**Offer design:** an offer is not a price — it''s a package: product + bonus + guarantee + deadline. "₦15k website, free logo included, delivered in 5 days, 1 revision round" beats "websites available".

**Value ladder:**
1. Free value (tips, lead magnet) → builds trust
2. Low-ticket (₦2k–₦10k product/service) → proves quality
3. Core offer → your main income
4. Premium/retainer → best margins
People climb the ladder over time; never ask a stranger to start at step 3.

## 💡 Real-world example
A makeup artist gives free skin tips (1), sells a ₦5k mini-session (2), books full packages (3), and offers monthly retainer shoots for brands (4). Each step feeds the next.

## ✍️ Practical
1. Write a positioning sentence for a business.
2. Rewrite their weakest offer using package + bonus + deadline.
3. Sketch a 4-step value ladder for them.

## ✅ Checklist
- [ ] Positioning sentence done
- [ ] Offer packaged with bonus/deadline
- [ ] Value ladder sketched' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels' and le.title = 'Positioning, Offers & the Value Ladder'
)
update public.course_lessons le
   set resources = '[{"title":"HubSpot Academy — free marketing certifications","url":"https://academy.hubspot.com/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels' and le.title = 'Positioning, Offers & the Value Ladder'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=BbJ604IjM5g', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=BbJ604IjM5g'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Brand Voice & Messaging Basics', 'video', '13 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Brand Voice & Messaging Basics'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Brand Voice & Messaging Basics';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels' and le.title = 'Brand Voice & Messaging Basics'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Defining a consistent brand voice
- Message hierarchy across channels
- The 3 questions every caption must answer

## 📖 Lesson
**Brand voice** is how you sound everywhere: friendly-expert? bold and funny? calm and premium? Pick 3 adjectives and filter every caption through them. Consistency builds recognition faster than logos do.

**Message hierarchy:** one core message per campaign ("fastest repairs in town"), supported by proofs (reviews, speed stats). Don''t mix five messages in one post.

Every caption should answer, in order:
1. **What''s in it for me?** (hook)
2. **Why should I believe you?** (proof)
3. **What do I do next?** (CTA)

## 💡 Real-world example
Two water vendors: one posts "Pure water available". The other: "Thirsty? Ice-cold sachets delivered to your gate in 10 minutes — 200+ orders this week. DM ''WATER'' to order." Guess who gets DMs.

## ✍️ Practical
1. Choose 3 voice adjectives for a brand.
2. Rewrite one weak caption using hook→proof→CTA.
3. Read both aloud — which one sells?

## ✅ Checklist
- [ ] 3 voice adjectives chosen
- [ ] Caption rewritten (hook→proof→CTA)
- [ ] One core message per post' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels' and le.title = 'Brand Voice & Messaging Basics'
)
update public.course_lessons le
   set resources = '[{"title":"HubSpot Academy — free marketing certifications","url":"https://academy.hubspot.com/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 1: Marketing Foundations & Funnels' and le.title = 'Brand Voice & Messaging Basics'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=BbJ604IjM5g', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=BbJ604IjM5g'
);

with c as (select id from public.courses where slug = 'digital-marketing')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 2: SEO & Content Marketing', 1 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 2: SEO & Content Marketing'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'How Google Works: Search & Keywords', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'How Google Works: Search & Keywords'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'How Google Works: Search & Keywords';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing' and le.title = 'How Google Works: Search & Keywords'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- How Google decides what ranks
- Finding keywords real customers type
- Search intent: the ranking secret

## 📖 Lesson
Google''s job: give searchers the best answer fast. It ranks pages by **relevance** (does it match the query?), **quality** (helpful, trustworthy?), and **authority** (do other sites link/refer to it?).

**Keywords** are the exact phrases people type. Find them by:
- Autocomplete: type your topic in Google, note suggestions
- "People also ask" boxes
- Free tools (Google Keyword Planner with a free Ads account)

**Search intent** — what the searcher wants:
- Informational: "how to edit videos" → give a guide
- Commercial: "best budget phone 2025" → give comparisons
- Transactional: "buy iPhone 13 Lagos" → give a product page
Match intent or Google won''t rank you, however good the writing.

## 💡 Real-world example
A salon wrote "Hair treatment" (nobody searches that). Switched to "locs retouch price in Ikeja" — a phrase real customers type — and started showing up in local searches.

## ✍️ Practical
1. Use autocomplete to collect 10 keyword ideas for one business.
2. Label each: informational / commercial / transactional.
3. Pick the 2 best transactional keywords to target.

## ✅ Checklist
- [ ] 10 keywords collected
- [ ] Intent labeled for each
- [ ] Top 2 targets chosen' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing' and le.title = 'How Google Works: Search & Keywords'
)
update public.course_lessons le
   set resources = '[{"title":"Google SEO Starter Guide (official, free PDF-style guide)","url":"https://developers.google.com/search/docs/fundamentals/seo-starter-guide","type":"pdf"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing' and le.title = 'How Google Works: Search & Keywords'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=BbJ604IjM5g', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=BbJ604IjM5g'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'On-Page SEO: Titles, Content & Local Business', 'video', '16 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'On-Page SEO: Titles, Content & Local Business'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'On-Page SEO: Titles, Content & Local Business';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing' and le.title = 'On-Page SEO: Titles, Content & Local Business'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 5 on-page elements that move rankings
- Writing content that satisfies searchers
- Google Business Profile: free local visibility

## 📖 Lesson
On-page checklist (per page/post):
1. **Title** — keyword near the front, under ~60 chars
2. **Headings** — H1 once, H2s for sections, keyword naturally included
3. **Content** — answers the query completely; 300+ words minimum for articles
4. **Images** — descriptive file names + alt text
5. **Links** — link to your own related pages

For local businesses, **Google Business Profile** is the highest-ROI free marketing in Nigeria: name, address, hours, photos, and *reviews*. More positive reviews = higher local map rankings = calls.

Write for humans first: short paragraphs, lists, bold key lines. Google measures if people stay — helpful content keeps them.

## 💡 Real-world example
A barber added a Google Business Profile and asked every happy client for a review. Within 6 weeks he appeared in the map pack for "barber near me" — bookings rose 40%.

## ✍️ Practical
1. Write title + H2 outline for an article targeting your keyword.
2. Draft the first 300 words answering the query directly.
3. List 5 details a Google Business Profile needs.

## ✅ Checklist
- [ ] 5 on-page elements covered
- [ ] Content answers the query
- [ ] Local profile checklist ready' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing' and le.title = 'On-Page SEO: Titles, Content & Local Business'
)
update public.course_lessons le
   set resources = '[{"title":"Google SEO Starter Guide (official, free PDF-style guide)","url":"https://developers.google.com/search/docs/fundamentals/seo-starter-guide","type":"pdf"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing' and le.title = 'On-Page SEO: Titles, Content & Local Business'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=G6DmDqYLWL8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=G6DmDqYLWL8'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Content Marketing & Blogging That Attracts', 'video', '15 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Content Marketing & Blogging That Attracts'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Content Marketing & Blogging That Attracts';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing' and le.title = 'Content Marketing & Blogging That Attracts'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The content flywheel: attract → help → convert
- Content formats ranked by effort vs reward
- Building a 30-day content plan

## 📖 Lesson
Content marketing = giving useful content free so the right people find, trust and buy from you. It compounds: a good post keeps attracting for years (unlike ads, which stop when you stop paying).

Formats by effort → reward:
- **Short posts/graphics** — low effort, builds presence
- **Carousels & listicles** — medium effort, high saves/shares
- **Video tutorials** — higher effort, best trust builder
- **Evergreen guides** — highest compounding value

**30-day plan formula:** 3 pillars (topics you own) × 3 posts/week × 4 weeks = 36 posts. Batch: write all hooks Monday, create in batches, schedule.

## 💡 Real-world example
A baker posted one "how it''s made" reel weekly. Month 1: 200 followers. Month 6: 11k followers and wholesale enquiries — one repeatable format, zero ad spend.

## ✍️ Practical
1. Choose 3 content pillars for a brand.
2. Write 9 hooks (3 per pillar).
3. Schedule the first week.

## ✅ Checklist
- [ ] 3 pillars chosen
- [ ] 9 hooks written
- [ ] Week 1 scheduled' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing' and le.title = 'Content Marketing & Blogging That Attracts'
)
update public.course_lessons le
   set resources = '[{"title":"HubSpot Academy — free marketing certifications","url":"https://academy.hubspot.com/","type":"course"},{"title":"HubSpot blog — content marketing guides","url":"https://blog.hubspot.com/marketing","type":"article"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing' and le.title = 'Content Marketing & Blogging That Attracts'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=BbJ604IjM5g', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=BbJ604IjM5g'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Repurposing: One Idea, Ten Pieces', 'video', '13 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Repurposing: One Idea, Ten Pieces'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Repurposing: One Idea, Ten Pieces';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing' and le.title = 'Repurposing: One Idea, Ten Pieces'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The repurposing map that multiplies output
- Keeping quality while posting daily
- Tools that speed the process

## 📖 Lesson
Create once, publish everywhere. One long-form piece (video or article) becomes:
1. 3–5 short clips (Reels/TikTok/Shorts)
2. A carousel summarizing key points
3. 2–3 single quote/stat graphics
4. A WhatsApp broadcast version
5. An email/newsletter section
6. A thread or caption series

Same core idea, different packaging per platform. This is how small teams post daily without burnout.

Rules: change the hook per platform (audiences differ), keep one visual style, always re-check text sizes.

## 💡 Real-world example
A business coach records one 10-minute YouTube video weekly. From it: 4 Shorts, 2 carousels, 1 newsletter. Twelve pieces from one recording session.

## ✍️ Practical
1. Take one existing idea/video.
2. Split it into the 6 formats above (at least 3 today).
3. Post or schedule them across platforms.

## ✅ Checklist
- [ ] 1 idea → 3+ pieces done
- [ ] Hooks adapted per platform
- [ ] Style stays consistent' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing' and le.title = 'Repurposing: One Idea, Ten Pieces'
)
update public.course_lessons le
   set resources = '[{"title":"HubSpot Academy — free marketing certifications","url":"https://academy.hubspot.com/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 2: SEO & Content Marketing' and le.title = 'Repurposing: One Idea, Ten Pieces'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=G6DmDqYLWL8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=G6DmDqYLWL8'
);

with c as (select id from public.courses where slug = 'digital-marketing')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 3: Social Media & Paid Ads', 2 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 3: Social Media & Paid Ads'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Instagram & TikTok Growth Systems', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Instagram & TikTok Growth Systems'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Instagram & TikTok Growth Systems';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads' and le.title = 'Instagram & TikTok Growth Systems'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- What the algorithms actually reward
- Profile optimization that converts visits to follows
- A weekly growth routine

## 📖 Lesson
Algorithms reward one thing: **people staying**. Signals: watch time, replays, saves, shares, comments. Optimize for those, not vanity likes.

Profile conversion checklist:
- Name field includes your keyword ("Ada | Lagos Makeup Artist")
- Bio = who you help + result + CTA in one line
- Link (WhatsApp or portfolio) always working
- Highlights: prices, reviews, results

**Weekly routine:** 3–4 posts (mix formats), 15 min/day engaging in your niche''s comments (real conversations, not spam), 1 experiment weekly (new hook/format), review analytics Sunday: double down on what worked.

## 💡 Real-world example
A skincare brand started answering every comment with a question ("What''s your skin type?"). Comment threads doubled → algorithm pushed posts further → followers grew 3× faster.

## ✍️ Practical
1. Optimize one profile with the checklist.
2. Plan this week''s 3 posts with hook-first captions.
3. Spend 15 min engaging genuinely in your niche.

## ✅ Checklist
- [ ] Profile converts (bio + link + highlights)
- [ ] 3 hook-first posts planned
- [ ] Daily engagement scheduled' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads' and le.title = 'Instagram & TikTok Growth Systems'
)
update public.course_lessons le
   set resources = '[{"title":"Meta Blueprint — free Facebook/Instagram ads training","url":"https://www.facebook.com/business/learn","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads' and le.title = 'Instagram & TikTok Growth Systems'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=G6DmDqYLWL8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=G6DmDqYLWL8'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'WhatsApp Marketing & Community Selling', 'video', '14 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'WhatsApp Marketing & Community Selling'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'WhatsApp Marketing & Community Selling';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads' and le.title = 'WhatsApp Marketing & Community Selling'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- WhatsApp Business setup for selling
- Status strategy that sells daily
- Broadcasts and lists without being spammy

## 📖 Lesson
In Nigeria, WhatsApp IS the internet for commerce. Set up **WhatsApp Business**: catalog with prices, quick replies for FAQs, labels (New lead / Paid / Delivered), away messages.

**Status strategy (your free daily billboard):**
- 3–5 statuses/day max: product → proof (review screenshot) → behind-the-scenes → offer
- Faces and videos outperform graphics
- End with a clear next step ("reply ''PRICE''")

**Broadcasts:** segment lists (customers vs prospects), send value 3× more often than offers. Rule of thumb: 3 helpful messages per 1 promotional. Never mass-add people to groups without consent — instant trust killer.

## 💡 Real-world example
A thrift seller posts daily "arrivals" statuses at 7pm when customers scroll. Regulars screenshot items to claim. Her status is her shopfront — no rent.

## ✍️ Practical
1. Set up WhatsApp Business with catalog + quick replies.
2. Plan tomorrow''s 4-status sequence.
3. Label your existing contacts properly.

## ✅ Checklist
- [ ] Business app configured
- [ ] Status sequence planned
- [ ] Contacts labeled' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads' and le.title = 'WhatsApp Marketing & Community Selling'
)
update public.course_lessons le
   set resources = '[{"title":"WhatsApp Business — official","url":"https://business.whatsapp.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads' and le.title = 'WhatsApp Marketing & Community Selling'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=BbJ604IjM5g', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=BbJ604IjM5g'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Meta Ads: Your First Profitable Campaign', 'video', '18 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Meta Ads: Your First Profitable Campaign'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Meta Ads: Your First Profitable Campaign';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads' and le.title = 'Meta Ads: Your First Profitable Campaign'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Campaign structure: campaign → ad set → ad
- Targeting that finds buyers, not strangers
- Budget rules & reading the numbers

## 📖 Lesson
**Structure:** Campaign (objective) → Ad set (audience, budget, placement) → Ad (creative + text).

Objectives that matter for small businesses: **Engagement** (messages/WhatsApp), **Leads**, **Sales**. Choose by your goal — "boost post" defaults are usually wrong for selling.

**Targeting:** start broad-ish (location + age + 1–2 interests). The creative does the targeting: an ad calling "Lagos brides" finds Lagos brides. Test 2–3 creatives; the market decides.

**Budget math:** start small (e.g. ₦3k–₦5k/day) for 3–5 days, then judge:
- CPM = cost to reach 1,000 people
- CTR > 1% = creative is interesting
- Cost per WhatsApp message/conversation = your real metric
Kill losers, scale winners slowly (+20–30% budget).

## 💡 Real-world example
A shoe seller spent ₦20k testing 3 ads. One ad brought 34 WhatsApp chats and 9 sales (₦85k revenue). She moved the whole budget to that ad.

## ✍️ Practical
1. Set up Meta Business Manager + payment.
2. Create a WhatsApp-messages campaign with 2 creatives.
3. Write down your target cost-per-chat before launch.

## ✅ Checklist
- [ ] Correct objective chosen
- [ ] 2+ creatives testing
- [ ] Cost-per-chat target set' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads' and le.title = 'Meta Ads: Your First Profitable Campaign'
)
update public.course_lessons le
   set resources = '[{"title":"Meta Blueprint — free Facebook/Instagram ads training","url":"https://www.facebook.com/business/learn","type":"course"},{"title":"Google Skillshop — Ads & Analytics certifications","url":"https://skillshop.exceedlms.com/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads' and le.title = 'Meta Ads: Your First Profitable Campaign'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=G6DmDqYLWL8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=G6DmDqYLWL8'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Google Ads Basics & Retargeting', 'video', '16 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Google Ads Basics & Retargeting'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Google Ads Basics & Retargeting';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads' and le.title = 'Google Ads Basics & Retargeting'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Search ads: being there at the moment of intent
- Quality Score: why relevance saves money
- Retargeting: following warm visitors

## 📖 Lesson
Google Ads shows you when people are *already looking* — the highest-intent traffic available.

**Search campaign basics:**
- Keywords: match what buyers type ("buy laptop Lekki", not "computers")
- Ad text: repeat their words + benefit + CTA
- Landing page must deliver exactly what the ad promised

**Quality Score:** Google charges less per click when your ad + page are relevant. Relevance literally saves money.

**Retargeting:** pixel/tag tracks visitors; ads follow them elsewhere ("still thinking about those shoes?"). Warm audiences convert 3–10× better than cold. Start retargeting once you have traffic.

## 💡 Real-world example
A hotel only bids on "[city] hotel price" keywords. Every click is someone comparing hotels *tonight*. Small budget, high bookings — intent beats volume.

## ✍️ Practical
1. List 5 buyer-intent keywords for a business.
2. Write one search ad (headline with keyword + benefit + CTA).
3. Sketch a retargeting message for past visitors.

## ✅ Checklist
- [ ] Buyer-intent keywords listed
- [ ] Ad matches the keyword
- [ ] Retargeting message drafted' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads' and le.title = 'Google Ads Basics & Retargeting'
)
update public.course_lessons le
   set resources = '[{"title":"Google Skillshop — Ads & Analytics certifications","url":"https://skillshop.exceedlms.com/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 3: Social Media & Paid Ads' and le.title = 'Google Ads Basics & Retargeting'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=BbJ604IjM5g', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=BbJ604IjM5g'
);

with c as (select id from public.courses where slug = 'digital-marketing')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 4: Email, Analytics & Freelancing', 3 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 4: Email, Analytics & Freelancing'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Email Marketing & Automation Basics', 'video', '15 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Email Marketing & Automation Basics'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Email Marketing & Automation Basics';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing' and le.title = 'Email Marketing & Automation Basics'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Building a list people actually want to join
- The 3 emails every business must send
- Simple automations that sell while you sleep

## 📖 Lesson
Email/owned lists survive algorithm changes — you own the audience.

**Growing a list:** offer a **lead magnet** (free valuable thing: checklist, discount, mini-guide) in exchange for the address. Place the signup everywhere: bio, captions, website, WhatsApp auto-message.

**The 3 must-send emails:**
1. **Welcome** — instantly after signup: deliver the magnet, introduce the brand, one soft CTA
2. **Nurture** — weekly value (tips, stories, proof), 80% helpful / 20% offer
3. **Offer/campaign** — clear deal, deadline, single CTA

**Automation starter:** welcome sequence (3 emails over 5 days) + abandoned-cart or follow-up reminder. Set once, earns forever.

## 💡 Real-world example
A course creator''s welcome email (delivers free PDF + tells her story + links the course) earns more sales per month than any single post she writes.

## ✍️ Practical
1. Create one lead magnet idea for a business.
2. Write the welcome email (deliver → introduce → soft CTA).
3. Set up a free Mailchimp (or similar) account.

## ✅ Checklist
- [ ] Lead magnet defined
- [ ] Welcome email written
- [ ] Email tool account ready' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing' and le.title = 'Email Marketing & Automation Basics'
)
update public.course_lessons le
   set resources = '[{"title":"Mailchimp — email marketing starter","url":"https://mailchimp.com/resources/","type":"resource"},{"title":"HubSpot Academy — free marketing certifications","url":"https://academy.hubspot.com/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing' and le.title = 'Email Marketing & Automation Basics'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=BbJ604IjM5g', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=BbJ604IjM5g'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Analytics: Reading Numbers That Matter', 'video', '16 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Analytics: Reading Numbers That Matter'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Analytics: Reading Numbers That Matter';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing' and le.title = 'Analytics: Reading Numbers That Matter'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 8 metrics that actually decide success
- Building a simple weekly report
- Making decisions from data, not feelings

## 📖 Lesson
Metric → question it answers:
- **Reach/impressions** → are we being seen?
- **CTR (clicks ÷ impressions)** → is the creative interesting?
- **Engagement rate** → do people care?
- **Watch time/retention** → does content hold?
- **Followers/week** → is the profile converting?
- **Cost per result (chat/lead/sale)** → are ads profitable?
- **Conversion rate** → does the page/close work?
- **Revenue per channel** → where should money/time go?

**Weekly report (10 minutes):** one table, this week vs last week, one decision per red number. Example: CTR dropped → test new hooks. Cost per chat rose → narrow audience or refresh creative.

Beware vanity metrics: 100k views with zero DMs is a failed ad for a seller.

## 💡 Real-world example
A student noticed Reels brought followers but WhatsApp brought sales. She kept Reels for reach but moved 70% of effort to status + broadcasts. Revenue doubled.

## ✍️ Practical
1. Build the 8-row metrics table for one account.
2. Fill it with real numbers from insights.
3. Write one decision based on the weakest number.

## ✅ Checklist
- [ ] Metrics table built & filled
- [ ] Compared week vs week
- [ ] One data-driven decision made' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing' and le.title = 'Analytics: Reading Numbers That Matter'
)
update public.course_lessons le
   set resources = '[{"title":"Google Analytics Academy","url":"https://analytics.google.com/analytics/academy/","type":"course"},{"title":"Google Skillshop — Ads & Analytics certifications","url":"https://skillshop.exceedlms.com/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing' and le.title = 'Analytics: Reading Numbers That Matter'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=G6DmDqYLWL8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=G6DmDqYLWL8'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Marketing Freelance: Packages, Clients & Retainers', 'video', '16 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Marketing Freelance: Packages, Clients & Retainers'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Marketing Freelance: Packages, Clients & Retainers';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing' and le.title = 'Marketing Freelance: Packages, Clients & Retainers'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Packaging marketing skills into sellable services
- Getting your first 3 clients (no experience needed)
- Moving from gigs to monthly retainers

## 📖 Lesson
**Packages that sell:**
- Social media management (X posts/week + engagement)
- Ads management (% of spend or flat monthly)
- Content + WhatsApp funnel setup
- Full "growth" retainer (all above)

**First 3 clients playbook:**
1. Do one free/cheap 2-week project for a visible local business → collect results + testimonial
2. Document the results as a case study (numbers!)
3. Announce the case study everywhere; pitch 5 similar businesses/week

**Retainers beat gigs:** monthly recurring income, deeper results, better relationships. Deliver reports monthly — clients keep paying for visible progress.

Raise prices after every 3 successes. Confidence comes from documented results, so document everything from day one.

## 💡 Real-world example
A student managed a restaurant''s page free for 2 weeks (+38% orders tracked). The case study got her 2 paying retainers the following month — one free sprint, recurring income.

## ✍️ Practical
1. Write 3 service packages with clear deliverables.
2. Pick your "free sprint" target business.
3. Create a simple case-study template (problem → actions → numbers).

## ✅ Checklist
- [ ] 3 packages written
- [ ] Sprint target chosen
- [ ] Case study template ready' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing' and le.title = 'Marketing Freelance: Packages, Clients & Retainers'
)
update public.course_lessons le
   set resources = '[{"title":"HubSpot Academy — free marketing certifications","url":"https://academy.hubspot.com/","type":"course"},{"title":"Upwork — marketing freelance marketplace","url":"https://www.upwork.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing' and le.title = 'Marketing Freelance: Packages, Clients & Retainers'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=BbJ604IjM5g', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=BbJ604IjM5g'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Capstone: Full Marketing Plan for a Real Business', 'project', '22 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Capstone: Full Marketing Plan for a Real Business'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing'
)
update public.course_lessons le set type = 'project'
  from m where le.module_id = m.module_id and le.title = 'Capstone: Full Marketing Plan for a Real Business';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing' and le.title = 'Capstone: Full Marketing Plan for a Real Business'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Assembling every module into one professional plan
- Presenting strategy like a consultant
- Turning the plan into income

## 📖 Lesson
Build a complete plan for one (real or practice) business:
1. **Situation** — what they sell, to whom, current channels
2. **Persona** — ideal customer, 10 lines
3. **Positioning & offer** — sentence + packaged offer + value ladder
4. **Channel strategy** — 2 primary channels with weekly routines
5. **Content plan** — 3 pillars, 2 weeks of hooks
6. **Paid plan** — one campaign, budget, target cost-per-result
7. **Measurement** — 8-metric table + weekly review ritual

Present it in 8–10 slides. This single document is: your portfolio piece, your freelance sales tool, and (for your own business) your actual plan.

Next: HubSpot''s free certifications add credibility to your CV/profile — finish one this month.

## 💡 Real-world example
Students presented this capstone to real businesses; several were hired on the spot for ₦50k–₦150k/month retainers — the plan itself was the proof of skill.

## ✍️ Practical
1. Write the full 7-section plan.
2. Design the 8–10 slide presentation.
3. Present it to the business (or record yourself).

## ✅ Checklist
- [ ] All 7 sections complete
- [ ] Plan presented
- [ ] One free certification started' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing' and le.title = 'Capstone: Full Marketing Plan for a Real Business'
)
update public.course_lessons le
   set resources = '[{"title":"HubSpot Academy — free marketing certifications","url":"https://academy.hubspot.com/","type":"course"},{"title":"Google SEO Starter Guide (official, free PDF-style guide)","url":"https://developers.google.com/search/docs/fundamentals/seo-starter-guide","type":"pdf"},{"title":"Meta Blueprint — free Facebook/Instagram ads training","url":"https://www.facebook.com/business/learn","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'digital-marketing' and mo.title = 'Module 4: Email, Analytics & Freelancing' and le.title = 'Capstone: Full Marketing Plan for a Real Business'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=G6DmDqYLWL8', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=G6DmDqYLWL8'
);

with c as (select id from public.courses where slug = 'digital-marketing')
insert into public.quizzes (course_id, title, description, passing_score, allow_retake, is_final, status, attempt_limit)
select c.id, 'Final Assessment — Digital Marketing', 'Final assessment — pass to move toward your certificate.', 70, true, true, 'published', null from c
where not exists (
  select 1 from public.quizzes z where z.course_id = c.id and z.title = 'Final Assessment — Digital Marketing'
);
update public.quizzes z set lesson_id = le.id
  from public.course_lessons le
 where z.course_id = le.course_id and le.title = 'Capstone: Full Marketing Plan for a Real Business'
   and z.title = 'Final Assessment — Digital Marketing' and exists (select 1 from public.courses c where c.id = z.course_id and c.slug = 'digital-marketing');
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'digital-marketing' and z.title = 'Final Assessment — Digital Marketing')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'SEO stands for…', '["Social Engagement Optimization","Search Engine Optimization","Sales Email Operations","Site Editing Online"]'::jsonb,
1, '[]'::jsonb,
'SEO = optimizing content so search engines rank it for relevant queries.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'SEO stands for…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'digital-marketing' and z.title = 'Final Assessment — Digital Marketing')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A marketing funnel describes…', '["The journey from stranger to customer","A type of advertisement","A pricing table","Email software"]'::jsonb,
0, '[]'::jsonb,
'Funnels model awareness → interest → decision → purchase.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A marketing funnel describes…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'digital-marketing' and z.title = 'Final Assessment — Digital Marketing')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Organic reach means getting visibility without paying for ads.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Organic = earned through content and engagement; paid = ads.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Organic reach means getting visibility without paying for ads.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'digital-marketing' and z.title = 'Final Assessment — Digital Marketing')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Which metric best measures ad profitability?', '["Likes","ROAS (return on ad spend)","Follower count","Impressions alone"]'::jsonb,
1, '[]'::jsonb,
'ROAS compares revenue generated to money spent — the business metric that matters.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which metric best measures ad profitability?'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'digital-marketing' and z.title = 'Final Assessment — Digital Marketing')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_answer', 'Which are valid lead-generation methods? (Select all that apply)', '["Lead magnet downloads","WhatsApp click-to-chat","Landing page forms","Deleting negative reviews"]'::jsonb,
null, '[0,1,2]'::jsonb,
'Magnets, chat and forms capture leads; deleting reviews is neither lead-gen nor wise.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which are valid lead-generation methods? (Select all that apply)'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'digital-marketing' and z.title = 'Final Assessment — Digital Marketing')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A content calendar primarily helps with…', '["Consistency and planning","Increasing ad budgets","Designing logos","Accounting"]'::jsonb,
0, '[]'::jsonb,
'Calendars turn strategy into a sustainable publishing habit.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A content calendar primarily helps with…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'digital-marketing' and z.title = 'Final Assessment — Digital Marketing')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'CTR measures…', '["Clicks divided by impressions","Total followers","Video length","Bounce time"]'::jsonb,
0, '[]'::jsonb,
'Click-through rate = clicks ÷ impressions; it signals how compelling your message is.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'CTR measures…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'digital-marketing' and z.title = 'Final Assessment — Digital Marketing')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'The best first audience for a local business’s ads is usually…', '["Everyone on earth","A defined local audience matching the ideal customer","Competitors’ employees","Random users"]'::jsonb,
1, '[]'::jsonb,
'Targeting the real ideal customer in the real service area maximizes limited budgets.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'The best first audience for a local business’s ads is usually…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'digital-marketing' and z.title = 'Final Assessment — Digital Marketing')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Email marketing remains one of the highest-ROI digital channels.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Owned audiences (email/WhatsApp lists) convert without paying per reach.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Email marketing remains one of the highest-ROI digital channels.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'digital-marketing' and z.title = 'Final Assessment — Digital Marketing')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A/B testing means…', '["Comparing two versions to see which performs better","Running two businesses","Testing website speed","Grading customers"]'::jsonb,
0, '[]'::jsonb,
'A/B tests replace opinions with evidence — one variable at a time.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A/B testing means…'
);
with c as (select id from public.courses where slug = 'digital-marketing')
insert into public.assignments (course_id, title, description, instructions, required_output, max_score, is_final_project, status)
select c.id, 'Final Project: Growth Plan for a Nigerian Business', 'Build a complete 30-day digital marketing plan for a real local business (yours, a friend’s, or a volunteer client).', '1) Audit their current online presence (profile, posts, reviews).
2) Define the ideal customer and one primary goal (leads/sales/bookings).
3) Create a 30-day content calendar (platforms, pillars, post types).
4) Design one lead magnet or offer + landing message.
5) Draft one paid ad (audience, budget, creative, expected result) and list the KPIs you will track.', 'Submit the plan as a PDF or slide deck: audit, customer definition, calendar, lead magnet, ad draft, KPI table.', 100, true, 'published' from c
where not exists (
  select 1 from public.assignments a where a.course_id = c.id and a.title = 'Final Project: Growth Plan for a Nigerian Business'
);
update public.assignments a set lesson_id = le.id
  from public.course_lessons le
 where a.course_id = le.course_id and le.title = 'Capstone: Full Marketing Plan for a Real Business'
   and a.title = 'Final Project: Growth Plan for a Nigerian Business' and exists (select 1 from public.courses c where c.id = a.course_id and c.slug = 'digital-marketing');
with c as (select id from public.courses where slug = 'digital-marketing')
insert into public.course_completion_rules (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project)
select c.id, 100, 70, 0, true from c
on conflict (course_id) do update
  set require_lessons_pct = excluded.require_lessons_pct,
      require_quiz_avg = excluded.require_quiz_avg,
      require_assignments_approved = excluded.require_assignments_approved,
      require_final_project = excluded.require_final_project,
      updated_at = now();

-- ---------- mobile-app-development ----------
with c as (select id from public.courses where slug = 'mobile-app-development')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 1: Dart & Environment Setup', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 1: Dart & Environment Setup'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'The Mobile Landscape & Why Flutter', 'video', '14 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'The Mobile Landscape & Why Flutter'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'The Mobile Landscape & Why Flutter';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup' and le.title = 'The Mobile Landscape & Why Flutter'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Native vs cross-platform development
- What Flutter is and who uses it
- Setting career goals for this course

## 📖 Lesson
Building apps traditionally meant two codebases: Swift for iOS, Kotlin for Android — double the work, double the cost. **Cross-platform** frameworks let one codebase run everywhere.

**Flutter** (by Google) is today''s leading choice:
- One **Dart** codebase → Android, iOS, web, desktop
- Compiles to native performance — not a website in a wrapper
- Beautiful UI out of the box (Material & Cupertino widgets)
- **Hot reload** — change code, see it instantly in the running app

Who uses it: Google (Google Pay, Google Earth), Alibaba, BMW, and thousands of startups — because small teams ship fast. In Nigeria, Flutter dominates freelance and startup hiring because one developer can serve both Android and iOS users (Android dominates locally).

**Your path in this course:** Dart basics → Flutter UI → real apps with data → state management → publishing. Ship something real by the capstone.

## 💡 Real-world example
A two-person team in Lagos built a dispatch-tracking app in Flutter in 3 months. The same scope natively would need two teams — Flutter didn''t just save time, it made the startup possible.

## ✍️ Practical
1. Install Flutter SDK + Android Studio (or VS Code + emulator).
2. Run `flutter doctor` until all checks pass.
3. Run the starter counter app on an emulator/device.

## ✅ Checklist
- [ ] Flutter SDK installed, doctor green
- [ ] First app running on emulator
- [ ] Hot reload witnessed' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup' and le.title = 'The Mobile Landscape & Why Flutter'
)
update public.course_lessons le
   set resources = '[{"title":"Flutter official docs","url":"https://docs.flutter.dev/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup' and le.title = 'The Mobile Landscape & Why Flutter'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=92h2XcvZ-vM', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=92h2XcvZ-vM'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Dart 1: Variables, Types & Control Flow', 'video', '18 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Dart 1: Variables, Types & Control Flow'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Dart 1: Variables, Types & Control Flow';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup' and le.title = 'Dart 1: Variables, Types & Control Flow'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Variables: var, final, const
- Types: String, int, double, bool, List, Map
- if/else, loops and switch

## 📖 Lesson
Dart is modern, readable and safe. Try everything on **dartpad.dev** (no install needed).

**Variables & types:**
```dart
var name = ''Ada'';        // type inferred: String
int age = 25;
double price = 99.5;
bool active = true;
final city = ''Lagos'';    // assigned ONCE
const pi = 3.14159;      // compile-time constant
```
Use `final` by default; reassign only when needed.

**Strings:** interpolation is everywhere: `''Hello, $name!''` — cleaner than concatenation.

**Collections:** `List<String> items = [''rice'', ''beans''];` (ordered) and `Map<String, int> prices = {''rice'': 5000};` (key → value). These two carry most app data.

**Control flow:**
```dart
if (age >= 18) { ... } else { ... }
for (var item in items) { print(item); }
switch (role) { case ''admin'': ... }
```
Everything you''ll write in Flutter is these bricks combined. Master them here.

## 💡 Real-world example
Most early app bugs are logic bugs, not Flutter bugs: an if-condition that never fires, a list indexed wrong. Students who drill Dart basics for a week debug their apps in minutes, not hours.

## ✍️ Practical
1. Solve 10 small challenges in DartPad (calculations, string building, list filters).
2. Write a loop that prints a shopping list with prices from a Map.
3. Explain out loud why `final` differs from `const`.

## ✅ Checklist
- [ ] Variables/final/const fluent
- [ ] List + Map operations done
- [ ] if/for/switch solved exercises' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup' and le.title = 'Dart 1: Variables, Types & Control Flow'
)
update public.course_lessons le
   set resources = '[{"title":"Dart language tour (official)","url":"https://dart.dev/language","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup' and le.title = 'Dart 1: Variables, Types & Control Flow'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=CzRQ9mnmh44', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=CzRQ9mnmh44'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Dart 2: Functions, Classes & Null Safety', 'video', '19 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Dart 2: Functions, Classes & Null Safety'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Dart 2: Functions, Classes & Null Safety';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup' and le.title = 'Dart 2: Functions, Classes & Null Safety'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Functions, arrow syntax & named parameters
- Classes: fields, constructors, methods
- Null safety — Dart''s superpower

## 📖 Lesson
**Functions:**
```dart
int add(int a, int b) => a + b;                    // arrow form
void greet({required String name, int? age}) {}    // named params
```
Flutter''s widgets use named parameters constantly — get comfortable with `{required}` and `?`.

**Classes** model your app''s things:
```dart
class Product {
  final String name;
  final double price;
  Product({required this.name, required this.price});
}
```
Constructors with `this.field` shorthand are everywhere in Flutter code.

**Null safety:** a variable `String name` can NEVER be null — the compiler stops you before runtime crashes. `String?` means "may be null" and forces you to handle it:
- `name?.length` — only if not null
- `name ?? ''Guest''` — fallback
- `name!` — you promise (avoid)

This eliminates the #1 crash category in app development. The compiler is your friend.

## 💡 Real-world example
An e-commerce app crashed for every user whose address was empty — null reaching a string method. Null-safe code with `?? ''No address''` would have compiled the fix into the design itself.

## ✍️ Practical
1. Write 5 functions (arrow + named params).
2. Model a Product and a User class with constructors.
3. Write 5 expressions using ?. and ??.

## ✅ Checklist
- [ ] Named parameters fluent
- [ ] Two classes built
- [ ] Null-safety operators automatic' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup' and le.title = 'Dart 2: Functions, Classes & Null Safety'
)
update public.course_lessons le
   set resources = '[{"title":"Dart language tour (official)","url":"https://dart.dev/language","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup' and le.title = 'Dart 2: Functions, Classes & Null Safety'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=CzRQ9mnmh44', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=CzRQ9mnmh44'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Flutter Setup & Your First Widget Tree', 'video', '17 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Flutter Setup & Your First Widget Tree'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Flutter Setup & Your First Widget Tree';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup' and le.title = 'Flutter Setup & Your First Widget Tree'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Anatomy of a Flutter project
- StatelessWidget: UI as code
- Reading the widget tree without fear

## 📖 Lesson
**In Flutter, everything is a widget** — every button, screen, spacing and scroll area is a widget, and widgets nest into a **tree**.

Minimal app:
```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: Text(''My Shop'')),
        body: Center(child: Text(''Hello Flutter!'')),
      ),
    );
  }
}
```
Decode the tree: MaterialApp (app config) → Scaffold (page skeleton: appbar/body/floating button) → content widgets.

Project anatomy: `lib/` holds your Dart code (you live in **main.dart**); `pubspec.yaml` lists dependencies and assets (images/fonts); `android/`, `ios/` are platform shells you rarely touch early.

**Hot reload** (press r in terminal / save in VS Code) rebuilds in <1 second — experiment fearlessly; bad edits can be undone with u (hot restart) or git.

## 💡 Real-world example
New developers stare at nested parentheses, scared. After one week of tracing trees top-down — "what wraps what?" — the fear evaporates. It''s just nesting, all the way down.

## ✍️ Practical
1. Run the starter app; change the AppBar title and text.
2. Add a FloatingActionButton with a placeholder action.
3. Trace the tree aloud: MaterialApp → Scaffold → …

## ✅ Checklist
- [ ] Project anatomy known
- [ ] First widget edits live
- [ ] Tree-tracing habit formed' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup' and le.title = 'Flutter Setup & Your First Widget Tree'
)
update public.course_lessons le
   set resources = '[{"title":"Flutter official docs","url":"https://docs.flutter.dev/","type":"docs"},{"title":"Flutter codelabs — guided practice (official)","url":"https://docs.flutter.dev/codelabs","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 1: Dart & Environment Setup' and le.title = 'Flutter Setup & Your First Widget Tree'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=92h2XcvZ-vM', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=92h2XcvZ-vM'
);

with c as (select id from public.courses where slug = 'mobile-app-development')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 2: Building Real UIs', 1 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 2: Building Real UIs'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Layout: Row, Column & Stack', 'video', '18 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Layout: Row, Column & Stack'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Layout: Row, Column & Stack';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs' and le.title = 'Layout: Row, Column & Stack'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The three layout widgets that build everything
- mainAxisAlignment vs crossAxisAlignment
- Composing complex screens from simple rows/columns

## 📖 Lesson
All Flutter layouts come from three containers:
- **Column** — stack children vertically
- **Row** — arrange children horizontally
- **Stack** — layer children on top of each other (badges over images, overlays)

Alignment control (on Row & Column):
- `mainAxisAlignment` — along the direction (start/center/spaceBetween…)
- `crossAxisAlignment` — across it
- `Expanded` makes a child fill remaining space; `SizedBox(height: 16)` is your spacer

**The composition mindset:** any screen = columns containing rows containing more columns. Before coding, sketch boxes around your design: "the screen is a Column; this card is a Row (image Column + text Column)".

Also meet **Padding** and **Container** (padding/margin/decoration/cornerRadius) — the polish tools.

## 💡 Real-world example
A student asked why her product card looked wrong — image above text instead of beside it. The sketch step revealed: she''d used Column where Row belonged. Sketch boxes first; code writes itself.

## ✍️ Practical
1. Build a profile card: avatar Row + details Column.
2. Reproduce a screenshot of any app screen with boxes-and-nesting.
3. Use Expanded, SizedBox and all three layouts.

## ✅ Checklist
- [ ] Row/Column/Stack purposes clear
- [ ] Both axis alignments used
- [ ] One real screen reproduced' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs' and le.title = 'Layout: Row, Column & Stack'
)
update public.course_lessons le
   set resources = '[{"title":"Flutter official docs","url":"https://docs.flutter.dev/","type":"docs"},{"title":"Flutter codelabs — guided practice (official)","url":"https://docs.flutter.dev/codelabs","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs' and le.title = 'Layout: Row, Column & Stack'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=92h2XcvZ-vM', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=92h2XcvZ-vM'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Styling: Text, Containers, Colors & Themes', 'video', '17 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Styling: Text, Containers, Colors & Themes'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Styling: Text, Containers, Colors & Themes';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs' and le.title = 'Styling: Text, Containers, Colors & Themes'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- TextStyle, colors, fonts & spacing scale
- Theme: styling the whole app at once
- Using ThemeData for consistency

## 📖 Lesson
**TextStyle** controls typography:
```dart
Text(''₦5,000'', style: TextStyle(
  fontSize: 24, fontWeight: FontWeight.bold, color: Colors.teal))
```
Build a spacing scale (8/16/24/32) with SizedBox — consistency again is what separates professional UIs.

**Theme** is the app-wide style system — set once in MaterialApp:
```dart
theme: ThemeData(
  colorScheme: ColorScheme.fromSeed(seedColor: Color(0xFF0B7A55)),
  useMaterial3: true,
  textTheme: TextTheme(titleLarge: TextStyle(fontSize: 22)),
)
```
Then widgets pull from theme: `Theme.of(context).colorScheme.primary` — change the seed color once, restyle the entire app.

Material 3 (Material Design''s current version) gives modern defaults: tonal buttons, rounded cards, dynamic-looking surfaces. Follow m3.material.io for patterns users expect.

## 💡 Real-world example
An app with 7 different greens and 4 button styles got a 60-line ThemeData refactor — instantly unified. Theming is the highest-leverage styling skill in Flutter.

## ✍️ Practical
1. Define ThemeData with a brand color + 3 text styles.
2. Style a card using only theme values (no hardcoded colors).
3. Swap the seed color and watch the app restyle.

## ✅ Checklist
- [ ] ThemeData defined
- [ ] Widgets read from theme
- [ ] One-swap restyle proven' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs' and le.title = 'Styling: Text, Containers, Colors & Themes'
)
update public.course_lessons le
   set resources = '[{"title":"Material Design components (Google)","url":"https://m3.material.io/","type":"docs"},{"title":"Flutter official docs","url":"https://docs.flutter.dev/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs' and le.title = 'Styling: Text, Containers, Colors & Themes'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=1bQwDO88Gyw', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=1bQwDO88Gyw'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'ScrollView, Lists & Images', 'video', '18 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'ScrollView, Lists & Images'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'ScrollView, Lists & Images';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs' and le.title = 'ScrollView, Lists & Images'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- SingleScrollView vs ListView.builder (performance)
- Displaying network & asset images
- Building scrollable feeds like real apps

## 📖 Lesson
Apps scroll. Choose wisely:
- **SingleChildScrollView** — one long widget (short content)
- **ListView** — multiple children
- **ListView.builder** — builds items **on demand** as they scroll into view. 10,000 items? Only ~15 exist in memory. This is the right choice for any real list.

```dart
ListView.builder(
  itemCount: products.length,
  itemBuilder: (context, i) => ProductCard(product: products[i]),
)
```

**Images:**
- Network: `Image.network(url)` — add `loadingBuilder` for spinners, `errorBuilder` for failures (real networks fail!)
- Assets: declare in pubspec.yaml (`assets: - images/`) → `Image.asset(''images/logo.png'')`

Combine: ListView.builder + Image.network + your card widget = a real product feed. Add `CircleAvatar` and `ClipRRect` (rounded corners) for polish.

## 💡 Real-world example
An early version of a news app built all 2,000 articles with a plain ListView — it froze for 6 seconds on open. Switching to ListView.builder made it instant. Builder is not optional in production.

## ✍️ Practical
1. Build a feed of 20 items with ListView.builder.
2. Show network images with loading + error builders.
3. Add one asset image from your own images folder.

## ✅ Checklist
- [ ] ListView.builder used
- [ ] Loading/error states on images
- [ ] Asset pipeline working' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs' and le.title = 'ScrollView, Lists & Images'
)
update public.course_lessons le
   set resources = '[{"title":"Flutter official docs","url":"https://docs.flutter.dev/","type":"docs"},{"title":"Pexels — free images for testing","url":"https://www.pexels.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs' and le.title = 'ScrollView, Lists & Images'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=1bQwDO88Gyw', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=1bQwDO88Gyw'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Navigation: Moving Between Screens', 'video', '17 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Navigation: Moving Between Screens'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Navigation: Moving Between Screens';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs' and le.title = 'Navigation: Moving Between Screens'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Navigator.push / pop and the route stack
- Passing data between screens
- Named routes for real apps

## 📖 Lesson
Flutter screens are a **stack**: push a screen on top, pop to go back.

```dart
Navigator.push(context,
  MaterialPageRoute(builder: (_) => DetailScreen(product: p)));
```
Back button = `Navigator.pop(context)` (Android back does it automatically).

**Passing data:** constructor parameters — tap a product card, push DetailScreen(product: thatProduct). **Returning data:** `final result = await Navigator.push(...)` — the detail screen can pop with a value (e.g. "added to cart").

**Named routes** scale better:
```dart
MaterialApp(routes: {
  ''/'': (_) => HomeScreen(),
  ''/detail'': (_) => DetailScreen(),
})
// Navigator.pushNamed(context, ''/detail'', arguments: p)
```
One map, every screen addressable — deep links and tests get easier later.

## 💡 Real-world example
A shopping app''s "back from detail to list" kept losing scroll position — they were rebuilding HomeScreen every pop. Keeping screens on the stack (push/pop, not replacement) preserved state for free. Understand the stack.

## ✍️ Practical
1. Wire Home → Detail with a passed object.
2. Return a value from Detail to Home via pop.
3. Convert both to named routes.

## ✅ Checklist
- [ ] push/pop with data working
- [ ] Return value received
- [ ] Named routes map in place' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs' and le.title = 'Navigation: Moving Between Screens'
)
update public.course_lessons le
   set resources = '[{"title":"Flutter official docs","url":"https://docs.flutter.dev/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 2: Building Real UIs' and le.title = 'Navigation: Moving Between Screens'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=1bQwDO88Gyw', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=1bQwDO88Gyw'
);

with c as (select id from public.courses where slug = 'mobile-app-development')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 3: State, Data & Real Apps', 2 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 3: State, Data & Real Apps'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'StatefulWidget: Making UI Respond', 'video', '18 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'StatefulWidget: Making UI Respond'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'StatefulWidget: Making UI Respond';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps' and le.title = 'StatefulWidget: Making UI Respond'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Stateless vs Stateful widgets
- setState and the rebuild cycle
- Building a working counter, toggle & cart

## 📖 Lesson
So far widgets were static (**StatelessWidget** — build once). When data CHANGES (count, toggle, cart), you need **StatefulWidget**: it holds a State object that survives rebuilds.

```dart
class CartCounter extends StatefulWidget { ... }
class _CartCounterState extends State<CartCounter> {
  int count = 0;
  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Text(''$count''),
      onPressed: () => setState(() { count++; }),  // THE key line
    );
  }
}
```
**setState** tells Flutter: data changed → rebuild this subtree. Everything interactive starts here.

Rules: keep state as LOW and SMALL as possible (a toggle''s state lives in the toggle); never mutate without setState (UI won''t know). This mental model — UI = f(state) — underpins every framework, including the advanced ones you''ll meet next module.

## 💡 Real-world example
The classic bug: a list updates but the screen doesn''t — the developer changed the list without setState. Debugging rule #1: if UI is stale, check whether a rebuild was requested.

## ✍️ Practical
1. Build a working cart counter (+/−).
2. Build a theme/dark-mode toggle.
3. Build a to-do list that adds items via a TextField.

## ✅ Checklist
- [ ] setState reflex built
- [ ] Counter + toggle working
- [ ] List grows from TextField' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps' and le.title = 'StatefulWidget: Making UI Respond'
)
update public.course_lessons le
   set resources = '[{"title":"Flutter official docs","url":"https://docs.flutter.dev/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps' and le.title = 'StatefulWidget: Making UI Respond'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=1bQwDO88Gyw', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=1bQwDO88Gyw'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Forms & Validation: Collecting User Input', 'video', '17 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Forms & Validation: Collecting User Input'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Forms & Validation: Collecting User Input';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps' and le.title = 'Forms & Validation: Collecting User Input'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- TextField, controllers & Form validation
- Keyboard types, decoration & error messages
- Building a real registration form

## 📖 Lesson
Forms are where apps collect input — logins, signups, checkout.

```dart
final emailController = TextEditingController();
Form(
  key: _formKey,
  child: TextFormField(
    controller: emailController,
    keyboardType: TextInputType.emailAddress,
    decoration: InputDecoration(labelText: ''Email'', border: OutlineInputBorder()),
    validator: (v) => (v == null || !v.contains(''@'')) ? ''Enter a valid email'' : null,
  ),
)
// submit: if (_formKey.currentState!.validate()) { ... }
```
The **validator** returns an error string or null; `validate()` runs them all and shows errors under fields — the UX pattern users expect.

Also: obscureText for passwords; dropdowns (DropdownButtonFormField) for fixed choices; dismiss keyboard on submit (FocusScope). On success: clear fields or navigate.

## 💡 Real-world example
A fintech signup had no validation — users typed phone numbers into the email field and support drowned in login complaints. Inline validation ("Enter a valid email") cut those tickets by 80%.

## ✍️ Practical
1. Build a signup form: name, email, phone, password.
2. Add validators for each (including phone format).
3. On valid submit, show a success SnackBar.

## ✅ Checklist
- [ ] Controllers wired
- [ ] Validators firing inline
- [ ] Success path handled' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps' and le.title = 'Forms & Validation: Collecting User Input'
)
update public.course_lessons le
   set resources = '[{"title":"Material Design components (Google)","url":"https://m3.material.io/","type":"docs"},{"title":"Flutter official docs","url":"https://docs.flutter.dev/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps' and le.title = 'Forms & Validation: Collecting User Input'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=CzRQ9mnmh44', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=CzRQ9mnmh44'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'APIs & JSON: Your App Talks to the World', 'video', '20 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'APIs & JSON: Your App Talks to the World'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'APIs & JSON: Your App Talks to the World';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps' and le.title = 'APIs & JSON: Your App Talks to the World'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- HTTP GET with the http package
- Parsing JSON into Dart models
- Loading/error states for real-world data

## 📖 Lesson
Real apps fetch data from APIs. With the `http` package:

```dart
final res = await http.get(Uri.parse(''https://api.example.com/products''));
if (res.statusCode == 200) {
  final list = jsonDecode(res.body) as List;
  products = list.map((j) => Product.fromJson(j)).toList();
}
```
**Model pattern:** every JSON object gets a Dart class with `fromJson` — typed data everywhere, autocompleted fields, compile-time safety.

**async/await:** network calls take time — mark functions `async`, `await` the future, and keep UI responsive during the wait.

**FutureBuilder** renders the three states every data screen needs:
```dart
FutureBuilder(future: loadProducts(), builder: (context, snap) {
  if (snap.connectionState == ConnectionState.waiting) return spinner;
  if (snap.hasError) return retryWidget;
  return ListView.builder(...);
})
```
Practice on free APIs: JSONPlaceholder, public weather/movie APIs.

## 💡 Real-world example
A weather app crashed whenever the API was slow — it assumed instant success. Adding the loading spinner and an error screen with "Retry" turned crashes into a professional experience.

## ✍️ Practical
1. Fetch posts from JSONPlaceholder; model with fromJson.
2. Show them in a ListView.builder via FutureBuilder.
3. Handle waiting + error + retry states.

## ✅ Checklist
- [ ] GET + jsonDecode working
- [ ] fromJson model pattern used
- [ ] Loading/error/retry complete' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps' and le.title = 'APIs & JSON: Your App Talks to the World'
)
update public.course_lessons le
   set resources = '[{"title":"Flutter official docs","url":"https://docs.flutter.dev/","type":"docs"},{"title":"pub.dev — Flutter package registry","url":"https://pub.dev/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps' and le.title = 'APIs & JSON: Your App Talks to the World'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=CzRQ9mnmh44', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=CzRQ9mnmh44'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Local Storage: Saving Data on the Device', 'video', '17 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Local Storage: Saving Data on the Device'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Local Storage: Saving Data on the Device';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps' and le.title = 'Local Storage: Saving Data on the Device'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- shared_preferences for small data
- Persisting lists as JSON
- Designing offline-first habits

## 📖 Lesson
Users expect apps to remember: logged-in state, drafts, settings, carts.

**shared_preferences** — key/value store for small data:
```dart
final prefs = await SharedPreferences.getInstance();
await prefs.setString(''token'', userToken);
await prefs.setBool(''darkMode'', true);
final dark = prefs.getBool(''darkMode'') ?? false;
```

**Storing lists:** encode to JSON string: `prefs.setString(''todos'', jsonEncode(todos))`; decode on load. Perfect for to-do lists, recent searches, offline drafts.

**Offline-first thinking:** Nigerian networks fluctuate — apps that cache last-fetched data and sync when connected feel premium. Pattern: load cache → show instantly → fetch fresh → update UI + cache.

For heavier data (thousands of records, queries) graduate to SQLite/Drift or Firebase Firestore later — but shared_preferences covers most early needs.

## 💡 Real-world example
A market-prices app showed blank screens without network. After caching the last fetch: it opens instantly with yesterday''s prices labeled "updated 18h ago" — users rated it 5 stars for "working offline".

## ✍️ Practical
1. Persist dark-mode toggle + username with prefs.
2. Save a to-do list as JSON; restore on app launch.
3. Show a "last updated" timestamp from cache.

## ✅ Checklist
- [ ] Prefs read/write fluent
- [ ] List persisted & restored
- [ ] Cache-first pattern applied' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps' and le.title = 'Local Storage: Saving Data on the Device'
)
update public.course_lessons le
   set resources = '[{"title":"pub.dev — Flutter package registry","url":"https://pub.dev/","type":"docs"},{"title":"Flutter official docs","url":"https://docs.flutter.dev/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 3: State, Data & Real Apps' and le.title = 'Local Storage: Saving Data on the Device'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=CzRQ9mnmh44', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=CzRQ9mnmh44'
);

with c as (select id from public.courses where slug = 'mobile-app-development')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 4: Advanced State & Publishing', 3 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 4: Advanced State & Publishing'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Provider: State Management That Scales', 'video', '19 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Provider: State Management That Scales'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Provider: State Management That Scales';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing' and le.title = 'Provider: State Management That Scales'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Why setState alone doesn''t scale
- ChangeNotifier + Provider pattern
- Sharing cart/auth state across screens

## 📖 Lesson
When state is needed across many screens (cart, user session), passing it through constructors collapses. **Provider** solves it: put state at the top, read it anywhere.

```dart
class CartModel extends ChangeNotifier {
  final List<Product> items = [];
  void add(Product p) { items.add(p); notifyListeners(); }
}
// app root:
ChangeNotifierProvider(create: (_) => CartModel(), child: MyApp())
// anywhere:
final cart = context.watch<CartModel>();   // rebuilds on change
context.read<CartModel>().add(product);     // one-off action
```
`watch` = rebuild me when it changes; `read` = just do something. This separation keeps widgets lean.

Provider is the recommended first state-management step (official Flutter guidance) — learn it before Riverpod/Bloc; the concepts transfer.

## 💡 Real-world example
A shopping app''s cart badge (app bar) only updated when the cart screen was open — the cart lived inside one widget. Lifting it into a provided model made every badge, button and screen consistent instantly.

## ✍️ Practical
1. Create a CartModel; provide it at app root.
2. Add items from product cards; show count in AppBar badge.
3. Refactor your theme toggle into a provided model too.

## ✅ Checklist
- [ ] ChangeNotifier model working
- [ ] watch vs read distinguished
- [ ] Cross-screen state live' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing' and le.title = 'Provider: State Management That Scales'
)
update public.course_lessons le
   set resources = '[{"title":"pub.dev — Flutter package registry","url":"https://pub.dev/","type":"docs"},{"title":"Flutter official docs","url":"https://docs.flutter.dev/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing' and le.title = 'Provider: State Management That Scales'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=1bQwDO88Gyw', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=1bQwDO88Gyw'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Firebase: Auth, Firestore & Real Backends', 'video', '21 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Firebase: Auth, Firestore & Real Backends'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Firebase: Auth, Firestore & Real Backends';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing' and le.title = 'Firebase: Auth, Firestore & Real Backends'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Firebase Authentication (email + Google)
- Firestore: cloud database in minutes
- Real-time reads for live features

## 📖 Lesson
**Firebase** is the fastest path from app to real backend — no server code to start:

**Auth:** `firebase_auth` — email/password + Google sign-in:
```dart
await FirebaseAuth.instance.createUserWithEmailAndPassword(email: e, password: p);
final user = FirebaseAuth.instance.currentUser;
```
Gate screens on auth state; store the uid.

**Firestore** (cloud database): documents in collections, realtime by default:
```dart
await FirebaseFirestore.instance.collection(''orders'')
  .add({''userId'': uid, ''total'': 15000, ''createdAt'': FieldValue.serverTimestamp()});

Stream<QuerySnapshot> orders = FirebaseFirestore.instance
  .collection(''orders'').where(''userId'', isEqualTo: uid).snapshots();
```
Pair `snapshots()` with **StreamBuilder** → orders appear live as they''re created, no refresh button.

Security: enable Firebase security rules so users read/write ONLY their own data (never leave Firestore open — real apps get abused within hours).

## 💡 Real-world example
A student''s food-ordering MVP: Flutter + Firebase Auth + Firestore, live in 3 weeks, handling real orders for a campus kitchen — no backend developer hired.

## ✍️ Practical
1. Add email signup/login with firebase_auth.
2. Write a user profile doc to Firestore on signup.
3. Stream a per-user list with StreamBuilder.

## ✅ Checklist
- [ ] Auth flow working
- [ ] Firestore read + write
- [ ] Security rules scoped per user' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing' and le.title = 'Firebase: Auth, Firestore & Real Backends'
)
update public.course_lessons le
   set resources = '[{"title":"Firebase docs (Google)","url":"https://firebase.google.com/docs","type":"docs"},{"title":"pub.dev — Flutter package registry","url":"https://pub.dev/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing' and le.title = 'Firebase: Auth, Firestore & Real Backends'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=1bQwDO88Gyw', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=1bQwDO88Gyw'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Polish: Themes, Icons, Splash & App Identity', 'video', '16 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Polish: Themes, Icons, Splash & App Identity'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Polish: Themes, Icons, Splash & App Identity';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing' and le.title = 'Polish: Themes, Icons, Splash & App Identity'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Complete theme + custom fonts
- Launch (splash) screens and app icons
- The polish checklist before showing anyone

## 📖 Lesson
Users judge apps in 3 seconds. Polish list:

**Identity:** design an icon (even simple bold letterform) and set it with a launcher-icon package; build a splash screen (brand color + logo) — default Flutter splash screams "template".

**Theme completion:** colorScheme from your brand seed; custom fonts via GoogleFonts package or bundled assets; consistent corner radii and elevation.

**Feel:**
- Loading states everywhere data loads (no blank screens)
- Empty states with friendly message + action ("No orders yet — browse")
- Snackbars/dialogs for actions, not silent failures
- Platform conventions: Android back button behavior, overscroll glow

**Design first:** even 30 minutes in Figma before coding saves days of UI rework — decide colors, screens and flow visually.

## 💡 Real-world example
Two identical apps functionally: one had the default Flutter icon and grey splash, the other branded launch + theme. Test users called the second "more trustworthy" — polish is perceived quality.

## ✍️ Practical
1. Set a custom launcher icon + branded splash.
2. Apply GoogleFonts typography app-wide via theme.
3. Add empty + loading states to your main screens.

## ✅ Checklist
- [ ] Icon + splash branded
- [ ] Fonts + theme consistent
- [ ] Empty/loading states everywhere' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing' and le.title = 'Polish: Themes, Icons, Splash & App Identity'
)
update public.course_lessons le
   set resources = '[{"title":"Material Design components (Google)","url":"https://m3.material.io/","type":"docs"},{"title":"Figma — design the app before coding","url":"https://www.figma.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing' and le.title = 'Polish: Themes, Icons, Splash & App Identity'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=92h2XcvZ-vM', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=92h2XcvZ-vM'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Capstone: Build & Publish Your App', 'project', '26 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Capstone: Build & Publish Your App'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing'
)
update public.course_lessons le set type = 'project'
  from m where le.module_id = m.module_id and le.title = 'Capstone: Build & Publish Your App';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing' and le.title = 'Capstone: Build & Publish Your App'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Building a complete app end-to-end
- Release builds and APK/AAB generation
- Publishing to Play Store & distributing

## 📖 Lesson
**Capstone brief** (choose one, build fully):
- Marketplace app: product feed, detail, cart, checkout form
- Learning app: course list, lesson reader, progress tracking
- Business app for a real local client (best option — real users!)

Architecture: screens (UI) + models + provider state + Firebase auth/data + shared prefs for caching. Apply every module: builder lists, themes, navigation, forms, validation, loading/empty/error states.

**Release build:**
```
flutter build appbundle --release    # Android App Bundle for Play Store
flutter build apk --release          # direct-install APK (great for Nigerian users)
```
Sign with a keystore (keep it safe — losing it means losing app updates forever).

**Publishing:** Google Play Console ($25 one-time) → upload AAB, store listing (icon, screenshots, description) → internal testing first → production. APK sharing (WhatsApp/Drive) is a valid, common distribution path locally too.

## 💡 Real-world example
A graduate built his capstone for his mother''s tailoring business — booking + gallery + WhatsApp contact. It''s on Play Store, and it became the portfolio piece that landed his first two freelance contracts.

## ✍️ Practical
1. Build the capstone app completely.
2. Generate signed release APK + AAB.
3. Publish (Play Store or direct APK) and get 10 real installs.

## ✅ Checklist
- [ ] Capstone feature-complete
- [ ] Signed release builds made
- [ ] App distributed to real users' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing' and le.title = 'Capstone: Build & Publish Your App'
)
update public.course_lessons le
   set resources = '[{"title":"Flutter official docs","url":"https://docs.flutter.dev/","type":"docs"},{"title":"Google Play Console","url":"https://play.google.com/console/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'mobile-app-development' and mo.title = 'Module 4: Advanced State & Publishing' and le.title = 'Capstone: Build & Publish Your App'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=1bQwDO88Gyw', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=1bQwDO88Gyw'
);

with c as (select id from public.courses where slug = 'mobile-app-development')
insert into public.quizzes (course_id, title, description, passing_score, allow_retake, is_final, status, attempt_limit)
select c.id, 'Final Assessment — Mobile App Development', 'Final assessment — pass to move toward your certificate.', 70, true, true, 'published', null from c
where not exists (
  select 1 from public.quizzes z where z.course_id = c.id and z.title = 'Final Assessment — Mobile App Development'
);
update public.quizzes z set lesson_id = le.id
  from public.course_lessons le
 where z.course_id = le.course_id and le.title = 'Capstone: Build & Publish Your App'
   and z.title = 'Final Assessment — Mobile App Development' and exists (select 1 from public.courses c where c.id = z.course_id and c.slug = 'mobile-app-development');
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'mobile-app-development' and z.title = 'Final Assessment — Mobile App Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Flutter’s main advantage is…', '["One codebase for Android and iOS","It only runs on the web","It requires two codebases","It cannot use APIs"]'::jsonb,
0, '[]'::jsonb,
'Cross-platform from one Dart codebase is Flutter’s core value.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Flutter’s main advantage is…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'mobile-app-development' and z.title = 'Final Assessment — Mobile App Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'In Flutter, user interfaces are built from…', '["Widgets","Spreadsheets","SQL tables","PDFs"]'::jsonb,
0, '[]'::jsonb,
'Everything on screen is a widget, nested into a tree.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'In Flutter, user interfaces are built from…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'mobile-app-development' and z.title = 'Final Assessment — Mobile App Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'setState tells Flutter to rebuild the widget with new data.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'State changes + setState = rebuild — the foundation of interactive UI.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'setState tells Flutter to rebuild the widget with new data.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'mobile-app-development' and z.title = 'Final Assessment — Mobile App Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'ListView.builder differs from a plain ListView because it…', '["Builds items on demand as they scroll into view","Only shows 5 items","Cannot scroll","Loads everything into memory at once"]'::jsonb,
0, '[]'::jsonb,
'On-demand building keeps huge lists fast and memory-light.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'ListView.builder differs from a plain ListView because it…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'mobile-app-development' and z.title = 'Final Assessment — Mobile App Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'In Dart, a String? type means…', '["The value may be null and must be handled","It is always empty","It is a number","It cannot be printed"]'::jsonb,
0, '[]'::jsonb,
'Null safety forces you to handle missing values — preventing a whole class of crashes.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'In Dart, a String? type means…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'mobile-app-development' and z.title = 'Final Assessment — Mobile App Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_answer', 'Which are valid ways to share state across screens? (Select all that apply)', '["Provider","Constructor parameters + navigation arguments","Riverpod/Bloc","Printing to console"]'::jsonb,
null, '[0,1,2]'::jsonb,
'State management patterns and navigation arguments carry data; console printing does not.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which are valid ways to share state across screens? (Select all that apply)'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'mobile-app-development' and z.title = 'Final Assessment — Mobile App Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'FutureBuilder is used to…', '["Render loading/error/data states of async work","Compile the app","Style buttons","Create databases"]'::jsonb,
0, '[]'::jsonb,
'It watches a Future and rebuilds the UI through its states.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'FutureBuilder is used to…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'mobile-app-development' and z.title = 'Final Assessment — Mobile App Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A release build for the Play Store is distributed as…', '["An Android App Bundle (.aab)","A .docx file","A website zip","An .apk.exe"]'::jsonb,
0, '[]'::jsonb,
'The Play Store expects .aab; direct installs can use .apk.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A release build for the Play Store is distributed as…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'mobile-app-development' and z.title = 'Final Assessment — Mobile App Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Hot reload shows code changes in a running app within about a second.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Hot reload is Flutter’s famous speed feature — state is preserved.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Hot reload shows code changes in a running app within about a second.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'mobile-app-development' and z.title = 'Final Assessment — Mobile App Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Firebase Firestore’s snapshots() method gives you…', '["A realtime stream that updates when data changes","A one-time screenshot","A PDF export","A compiled binary"]'::jsonb,
0, '[]'::jsonb,
'Streams power live UIs — pair them with StreamBuilder.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Firebase Firestore’s snapshots() method gives you…'
);
with c as (select id from public.courses where slug = 'mobile-app-development')
insert into public.assignments (course_id, title, description, instructions, required_output, max_score, is_final_project, status)
select c.id, 'Final Project: Ship a Real Flutter App', 'Build, polish and distribute a complete Flutter application solving a real need.', '1) Choose a brief: marketplace, learning app, or an app for a real local business.
2) Implement: 4+ screens with navigation, a list built with ListView.builder, forms with validation, state via Provider, and data from an API or Firebase.
3) Polish: branded icon + splash, themed fonts/colors, loading/empty/error states everywhere.
4) Build a signed release (APK and/or App Bundle).
5) Distribute to at least 10 real users (Play Store, APK share, or TestFlight) and collect their feedback.', 'Repository link + release APK/AAB (or store listing) + a short report: features, architecture, user feedback, next improvements.', 100, true, 'published' from c
where not exists (
  select 1 from public.assignments a where a.course_id = c.id and a.title = 'Final Project: Ship a Real Flutter App'
);
update public.assignments a set lesson_id = le.id
  from public.course_lessons le
 where a.course_id = le.course_id and le.title = 'Capstone: Build & Publish Your App'
   and a.title = 'Final Project: Ship a Real Flutter App' and exists (select 1 from public.courses c where c.id = a.course_id and c.slug = 'mobile-app-development');
with c as (select id from public.courses where slug = 'mobile-app-development')
insert into public.course_completion_rules (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project)
select c.id, 100, 70, 0, true from c
on conflict (course_id) do update
  set require_lessons_pct = excluded.require_lessons_pct,
      require_quiz_avg = excluded.require_quiz_avg,
      require_assignments_approved = excluded.require_assignments_approved,
      require_final_project = excluded.require_final_project,
      updated_at = now();

-- ---------- portfolio-creation ----------
with c as (select id from public.courses where slug = 'portfolio-creation')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 1: Portfolio Foundations', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 1: Portfolio Foundations'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Your Portfolio Is Your CV: The Mindset Shift', 'video', '13 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Your Portfolio Is Your CV: The Mindset Shift'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Your Portfolio Is Your CV: The Mindset Shift';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations' and le.title = 'Your Portfolio Is Your CV: The Mindset Shift'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Why proof beats claims in the skills economy
- What buyers actually look for in 30 seconds
- Choosing your portfolio''s one promise

## 📖 Lesson
In the digital skills economy, nobody hires claims ("I am good at design"). Buyers hire **evidence**: work they can see, results they can verify, a person who feels safe to pay.

**The 30-second scan** — when a client opens your portfolio, they ask:
1. What does this person DO? (one clear skill, not ten)
2. Have they done it for someone real? (case studies > random samples)
3. Can I reach them easily? (WhatsApp/email visible)

**Your one promise:** pick the lane you sell FIRST — "I design brands for food businesses", not "I do everything digital". Specialists get paid more and remembered; generalists compete on price forever. You can expand later; start sharp.

**Portfolio ≠ gallery.** A gallery shows everything you''ve ever made. A portfolio is a curated argument: "here are 3–5 proofs I solve YOUR problem."

## 💡 Real-world example
Two designers applied for the same logo job. One had 40 random samples; the other showed 4 brand projects with results described ("helped a salon double bookings"). The 4-piece portfolio won — and charged double.

## ✍️ Practical
1. Write your one-promise sentence.
2. List every project/skill you have; mark the 3–5 that fit the promise.
3. Find 3 portfolios you admire; note what they show first.

## ✅ Checklist
- [ ] One promise written
- [ ] 3–5 proof projects selected
- [ ] Curation mindset adopted' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations' and le.title = 'Your Portfolio Is Your CV: The Mindset Shift'
)
update public.course_lessons le
   set resources = '[{"title":"Behance — free global portfolio platform","url":"https://www.behance.net/","type":"resource"},{"title":"LinkedIn — your professional storefront","url":"https://www.linkedin.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations' and le.title = 'Your Portfolio Is Your CV: The Mindset Shift'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=3KiMwhCuJWs', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=3KiMwhCuJWs'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Choosing Your Platform: Where Your Work Lives', 'video', '14 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Choosing Your Platform: Where Your Work Lives'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Choosing Your Platform: Where Your Work Lives';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations' and le.title = 'Choosing Your Platform: Where Your Work Lives'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Free platforms by skill type
- The 3-layer presence (marketplace, showcase, home base)
- Setting up your primary home today

## 📖 Lesson
You don''t need a website to start — platforms do the hosting:
- **Designers:** Behance (free, global, clients search it) + Dribbble shots
- **Developers:** GitHub (live code + GitHub Pages for demos) + deployed sites
- **Video/AI creators:** YouTube channel + Drive showreel link
- **Marketers:** LinkedIn articles + case study PDFs
- **Office-suite pros:** Google Drive folder of branded PDFs (report, dashboard, deck)

**The 3-layer presence:**
1. **Marketplace** — where buyers transact (Fiverr/Upwork/PeoplePerHour)
2. **Showcase** — where work shines (Behance/GitHub/YouTube)
3. **Home base** — one link that collects everything (Carrd one-pager or Linktree): name, promise, best 3 works, WhatsApp

Start with layers 2+3 this week; add marketplaces in Module 3. One polished home base beats five half-built presences.

## 💡 Real-world example
A video editor''s entire client flow: Instagram bio → Carrd link (showreel + 3 case studies + WhatsApp) → booking. One free page, constantly producing.

## ✍️ Practical
1. Create your primary showcase account (right platform for your skill).
2. Set up a Carrd (or Linktree) home base with your promise.
3. Add your WhatsApp contact — non-negotiable for Nigerian clients.

## ✅ Checklist
- [ ] Primary platform chosen & live
- [ ] Home base link created
- [ ] WhatsApp reachable from it' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations' and le.title = 'Choosing Your Platform: Where Your Work Lives'
)
update public.course_lessons le
   set resources = '[{"title":"Behance — free global portfolio platform","url":"https://www.behance.net/","type":"resource"},{"title":"GitHub — developer portfolios live here","url":"https://github.com/","type":"resource"},{"title":"Carrd — one-page portfolio sites (free tier)","url":"https://carrd.co/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations' and le.title = 'Choosing Your Platform: Where Your Work Lives'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=3KiMwhCuJWs', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=3KiMwhCuJWs'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Anatomy of a Winning Case Study', 'video', '16 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Anatomy of a Winning Case Study'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Anatomy of a Winning Case Study';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations' and le.title = 'Anatomy of a Winning Case Study'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 6-part case study structure
- Writing outcomes when you have no metrics
- Case studies vs screenshots

## 📖 Lesson
A **case study** is a story about a problem you solved. Structure (6 parts, 1–2 pages or one Behance project):
1. **Client & context** — who, what business, their situation
2. **Problem** — the pain in their words ("the old site looked 10 years old")
3. **Your role & approach** — what you did and why
4. **The work** — visuals/deliverables, presented beautifully
5. **Outcome** — results: "bookings doubled", "reports now take 10 minutes", or honest qualitative wins ("client relaunched with full brand kit")
6. **CTA** — "Want this for your business? WhatsApp me"

**No numbers yet?** Outcomes can be qualitative: client satisfaction, time saved, repeat hires. And NO client work? Do Module 1''s exercise: self-initiated projects count when framed as case studies.

Screenshots say "I made things." Case studies say "I solve business problems." That''s the difference between ₦5k and ₦50k jobs.

## 💡 Real-world example
A designer''s Behance showed 12 logo images — zero enquiries. She rewrote her best 3 as case studies with problem→outcome stories. First enquiry in nine days.

## ✍️ Practical
1. Write your first full case study using the 6 parts.
2. Publish it on your showcase platform.
3. Send the link to one friend for honest feedback.

## ✅ Checklist
- [ ] 6-part structure followed
- [ ] Outcome stated honestly
- [ ] Published & shareable' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations' and le.title = 'Anatomy of a Winning Case Study'
)
update public.course_lessons le
   set resources = '[{"title":"Behance — free global portfolio platform","url":"https://www.behance.net/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations' and le.title = 'Anatomy of a Winning Case Study'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=3KiMwhCuJWs', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=3KiMwhCuJWs'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Before/After, Mockups & Presentation Magic', 'video', '15 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Before/After, Mockups & Presentation Magic'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Before/After, Mockups & Presentation Magic';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations' and le.title = 'Before/After, Mockups & Presentation Magic'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Showing work in context (mockups)
- The before/after format that sells itself
- Building a showreel for video & AI creators

## 📖 Lesson
Raw exports die in feeds. Work shown IN CONTEXT comes alive:
- Logos on business cards/shopfronts (Smartmockups, Canva mockups — free)
- Websites on laptop/phone screens
- Flyers held in hands, decks projected in rooms
- Dashboards viewed "by a manager" on an office monitor

**Before/after** is the most persuasive format in creative work: the ugly original beside your solution. One image explains your entire value. Always get client permission, or recreate the "before" yourself.

**Showreels (video/AI creators):** 30–60 seconds, best 5–8 clips, your name + contact on screen, music with energy, cuts on the beat. Host on YouTube (unlisted is fine) and pin the link everywhere.

Presentation IS part of the work: clients can''t judge skill they can''t see clearly.

## 💡 Real-world example
An AI video creator''s reel of 6 generated clips with a 3-second intro ("I turn scripts into scenes") landed 3 agency gigs in a month — agencies buy reels, not descriptions.

## ✍️ Practical
1. Put your 3 best works into mockups.
2. Create one before/after comparison image.
3. (Video folks) cut a 45-second showreel and upload.

## ✅ Checklist
- [ ] Works shown in context
- [ ] One before/after made
- [ ] Reel or visual hero ready' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations' and le.title = 'Before/After, Mockups & Presentation Magic'
)
update public.course_lessons le
   set resources = '[{"title":"Smartmockups — free device/brand mockups","url":"https://smartmockups.com/","type":"tool"},{"title":"Canva — free design & mockups","url":"https://www.canva.com/","type":"tool"},{"title":"Behance — free global portfolio platform","url":"https://www.behance.net/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 1: Portfolio Foundations' and le.title = 'Before/After, Mockups & Presentation Magic'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=3KiMwhCuJWs', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=3KiMwhCuJWs'
);

with c as (select id from public.courses where slug = 'portfolio-creation')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 2: Personal Brand & Online Presence', 1 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 2: Personal Brand & Online Presence'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'LinkedIn: Your 24/7 Salesperson', 'video', '15 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'LinkedIn: Your 24/7 Salesperson'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'LinkedIn: Your 24/7 Salesperson';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence' and le.title = 'LinkedIn: Your 24/7 Salesperson'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Profile sections that convert visitors
- Content rhythm that attracts clients
- Reaching decision-makers directly

## 📖 Lesson
LinkedIn is where business owners and managers look for talent. Optimize once:
- **Headline** = promise, not title: "Brand designer for food businesses" beats "Graphic Designer"
- **Banner** = mini billboard: your work + one line + contact
- **About** = who you help, how, proof, and a CTA ("DM me ''BRAND''")
- **Featured** = pin your 3 best case studies
- **Photo** = clear face, good light, you smiling

**Content rhythm (2–3× weekly):**
- Show process (timelapses, screenshots, decisions)
- Share lessons ("3 mistakes restaurants make on menus")
- Post case studies when published
Every post ends with what you do + how to reach you.

**Outreach:** connect with 5 ideal clients daily with a one-line note (no pitch in message 1). Comment genuinely on their posts — visibility before asking.

## 💡 Real-world example
A virtual assistant posted daily "what I organized today" stories for a month. Three business owners DM''d her — she''d never applied to any of them. Content pulls; applications beg.

## ✍️ Practical
1. Rewrite headline + About with the formulas above.
2. Pin 3 featured items.
3. Post 2× this week + connect with 10 local business owners.

## ✅ Checklist
- [ ] Headline states promise
- [ ] Featured section live
- [ ] Content rhythm started' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence' and le.title = 'LinkedIn: Your 24/7 Salesperson'
)
update public.course_lessons le
   set resources = '[{"title":"LinkedIn — your professional storefront","url":"https://www.linkedin.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence' and le.title = 'LinkedIn: Your 24/7 Salesperson'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=UXtcoQAvs4U', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=UXtcoQAvs4U'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Instagram, X & TikTok for Creators', 'video', '14 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Instagram, X & TikTok for Creators'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Instagram, X & TikTok for Creators';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence' and le.title = 'Instagram, X & TikTok for Creators'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Which platform fits which skill
- Content formats that grow skill accounts
- Turning followers into clients

## 📖 Lesson
Platform fit:
- **Instagram** — visual skills (design, video, AI art): Reels + carousel posts
- **X (Twitter)** — tech, marketing, writing: threads, build-in-public
- **TikTok** — tutorials & transformations: before/after gold

Winning formats for skill accounts:
1. **Process reels** — 15–30s timelapses with captions
2. **Carousels** — "5 Canva tricks" style educational swipes
3. **Before/after** — instant proof
4. **Client results** — story + numbers

Bio formula: WHAT you do | WHO it''s for | PORTFOLIO link | WhatsApp. Pin your 3 best posts. Stories keep you human; posts do the selling.

Followers ≠ clients. Conversion comes from clear CTAs: "DM ''DESIGN'' for packages". Ten engaged local followers who buy beat 10,000 strangers who scroll.

## 💡 Real-world example
A CapCut editor posted one 20-second edit-timelapse daily. Follower count: modest. Enquiries: constant — because every local business owner who followed knew exactly what to DM for.

## ✍️ Practical
1. Optimize your bio with the formula.
2. Publish 3 pieces this week (2 formats).
3. Add a CTA + portfolio link to your profile.

## ✅ Checklist
- [ ] Platform chosen per skill
- [ ] 3 posts published
- [ ] CTA in bio working' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence' and le.title = 'Instagram, X & TikTok for Creators'
)
update public.course_lessons le
   set resources = '[{"title":"Dribbble — design showcase","url":"https://dribbble.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence' and le.title = 'Instagram, X & TikTok for Creators'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=UXtcoQAvs4U', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=UXtcoQAvs4U'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Personal Brand Basics: Name, Story & Consistency', 'video', '13 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Personal Brand Basics: Name, Story & Consistency'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Personal Brand Basics: Name, Story & Consistency';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence' and le.title = 'Personal Brand Basics: Name, Story & Consistency'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Professional identity decisions (name, handle, photo)
- Your story: the "why you" narrative
- Consistency systems that compound

## 📖 Lesson
A brand is what people say about you when you''re not there. Build it deliberately:

**Identity kit:** one professional name (real name is usually best), same handle everywhere, same profile photo everywhere, same promise sentence. Recognition compounds when everything matches.

**Your story (30 seconds):** origin → turning point → what you do now → who it helps. Example: "I studied mass communication, discovered CapCut during NYSC, edited for 3 campus brands, and now I help SMEs turn raw footage into sales videos." People buy from people with trajectories.

**Consistency system:** batch content one day a week; reuse everything (case study → carousel → reel → tweet); show up weekly for 6 months. Compounding is boring and unbeatable.

## 💡 Real-world example
Two equally skilled editors: one posted weekly for 6 months with the same name/photo/promise; the other posted brilliantly but randomly under changing handles. Guess who gets the DMs.

## ✍️ Practical
1. Fix your identity kit (name, handle, photo — everywhere).
2. Write your 30-second story; test it on a friend.
3. Schedule a weekly content hour in your calendar.

## ✅ Checklist
- [ ] Identity unified across platforms
- [ ] Story written & spoken
- [ ] Weekly slot protected' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence' and le.title = 'Personal Brand Basics: Name, Story & Consistency'
)
update public.course_lessons le
   set resources = '[{"title":"LinkedIn — your professional storefront","url":"https://www.linkedin.com/","type":"resource"},{"title":"Behance — free global portfolio platform","url":"https://www.behance.net/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence' and le.title = 'Personal Brand Basics: Name, Story & Consistency'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=0CyhIoQlERI', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=0CyhIoQlERI'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Networking: The Hidden Job Market', 'video', '14 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Networking: The Hidden Job Market'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Networking: The Hidden Job Market';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence' and le.title = 'Networking: The Hidden Job Market'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Why most gigs never get advertised
- Giving value before asking
- Building a referral engine locally

## 📖 Lesson
Most work in Nigeria (and everywhere) is filled through relationships, never job boards: someone recommends you in a WhatsApp group, a past client mentions you, a friend forwards your link.

**Build the engine:**
1. **Tell everyone what you do** — family, church, alumni groups, NYSC friends: "I build WordPress sites for businesses" said clearly gets remembered when need arises
2. **Give first:** free audit, quick fix, honest feedback — goodwill converts later
3. **Partner laterally:** a designer refers the developer, the developer refers the marketer — find your peers, agree to refer
4. **Follow up kindly:** "Still doing websites if anyone needs one" every few months is allowed

Reputation rules: deliver on time, communicate early when things slip, be pleasant. One bad experience travels farther than ten good ones.

## 💡 Real-world example
An Excel freelancer mentioned her dashboard service in her alumni WhatsApp group — casually, once. Two months later an alum became her biggest retainer client. The group chat never advertised a job; it recommended a person.

## ✍️ Practical
1. Tell 5 groups/people your one-promise this week.
2. Offer free value to 2 people (audit/fix/advice).
3. Connect with 3 lateral peers for referrals.

## ✅ Checklist
- [ ] 5 circles informed
- [ ] 2 value-first acts done
- [ ] 3 peer referrals built' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence' and le.title = 'Networking: The Hidden Job Market'
)
update public.course_lessons le
   set resources = '[{"title":"LinkedIn — your professional storefront","url":"https://www.linkedin.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 2: Personal Brand & Online Presence' and le.title = 'Networking: The Hidden Job Market'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=0CyhIoQlERI', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=0CyhIoQlERI'
);

with c as (select id from public.courses where slug = 'portfolio-creation')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 3: Getting Paid Work', 2 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 3: Getting Paid Work'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Freelance Platforms: Fiverr & Upwork Done Right', 'video', '17 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Freelance Platforms: Fiverr & Upwork Done Right'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Freelance Platforms: Fiverr & Upwork Done Right';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work' and le.title = 'Freelance Platforms: Fiverr & Upwork Done Right'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Setting up profiles that pass the first filter
- Gig/package engineering on Fiverr
- Proposals that win on Upwork

## 📖 Lesson
**Fiverr (gig model):** you package services; buyers come to you.
- Title: outcome-focused ("I will design a modern menu for your restaurant")
- 3 packages (Basic/Standard/Premium) — anchor high, sell middle
- Gig video + portfolio images; answer FAQs; fast replies raise your ranking
- Start priced to win reviews, raise after 5–10 sales

**Upwork (proposal model):** clients post jobs; you pitch.
- First 2 lines decide everything: address THEIR problem, not your biography
- Quote slightly below mid-range early for review velocity
- Attach the 2–3 most relevant samples only
- Filter: payment verified, reasonable budget, clear brief

**The cold truth:** platforms reward momentum — your first 3–5 reviews are bought with low prices and overdelivery. That''s the fee for entering a global market with real currency income (USD!).

## 💡 Real-world example
A designer''s first 5 Fiverr gigs were priced at $10 each. After 5-star reviews, the same gig repriced to $80 — and still converts. Reviews are the asset; early prices are the investment.

## ✍️ Practical
1. Create a Fiverr gig with 3 packages + visuals.
2. Write an Upwork profile + one template proposal.
3. Send 5 tailored proposals this week.

## ✅ Checklist
- [ ] Gig live with packages
- [ ] Proposals client-first
- [ ] 5 applications sent' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work' and le.title = 'Freelance Platforms: Fiverr & Upwork Done Right'
)
update public.course_lessons le
   set resources = '[{"title":"Fiverr — freelance marketplace","url":"https://www.fiverr.com/","type":"resource"},{"title":"Upwork — freelance marketplace","url":"https://www.upwork.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work' and le.title = 'Freelance Platforms: Fiverr & Upwork Done Right'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=0CyhIoQlERI', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=0CyhIoQlERI'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Pricing Your Skills in Naira & Dollars', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Pricing Your Skills in Naira & Dollars'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Pricing Your Skills in Naira & Dollars';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work' and le.title = 'Pricing Your Skills in Naira & Dollars'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Value-based vs hourly vs project pricing
- Starter rate bands for common services
- Handling "it''s too expensive"

## 📖 Lesson
**Three pricing models:**
- **Hourly** — punishes speed; fine for undefined support work
- **Project** — fixed scope, fixed price; the workhorse model
- **Value-based** — priced to the result ("this site brings ~₦200k monthly orders; ₦60k build is cheap"); advanced, most profitable

**Starter bands (Nigerian market, raise with proof):**
- Logo/brand mini-kit: ₦15k–₦50k
- 5-page website: ₦80k–₦250k
- Social video edit: ₦5k–₦25k per video
- CV rewrite: ₦5k–₦20k
- Dashboard/report pack: ₦20k–₦60k
International platforms: divide your ambition by nothing — $ is $; global beginners start $10–$30/hr-equivalent and climb.

**"Too expensive":** don''t defend — reframe: offer a smaller package ("we can start with just the homepage") or clarify the value. Never discount silently; change scope instead.

**Rule:** agree price BEFORE work, collect deposit (30–60%) before starting, final payment before file delivery.

## 💡 Real-world example
A web developer quoted ₦150k; the client said too much. He offered ₦80k for the homepage + 2 pages first, expand later. Client paid, loved it, and expanded at full rates. Same project, staged.

## ✍️ Practical
1. Write your price list (3 services, 2–3 tiers).
2. Practice the smaller-package reframe out loud.
3. Define your deposit rule and put it in your proposals.

## ✅ Checklist
- [ ] Price list written
- [ ] Reframe rehearsed
- [ ] Deposit policy set' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work' and le.title = 'Pricing Your Skills in Naira & Dollars'
)
update public.course_lessons le
   set resources = '[{"title":"Fiverr — freelance marketplace","url":"https://www.fiverr.com/","type":"resource"},{"title":"Upwork — freelance marketplace","url":"https://www.upwork.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work' and le.title = 'Pricing Your Skills in Naira & Dollars'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=0CyhIoQlERI', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=0CyhIoQlERI'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Proposals, Contracts & Professional Delivery', 'video', '16 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Proposals, Contracts & Professional Delivery'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Proposals, Contracts & Professional Delivery';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work' and le.title = 'Proposals, Contracts & Professional Delivery'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 5-part proposal structure
- Simple contracts that protect both sides
- Delivery habits that earn repeat business

## 📖 Lesson
**Proposal structure (one page):**
1. Their problem (in their words — proves you listened)
2. Your solution (what you''ll deliver, concretely)
3. Proof (1–2 relevant case study links)
4. Timeline + price + payment schedule
5. Next step ("Shall I start Monday?")

**Contract essentials** (even a WhatsApp-confirmed document): scope (exact deliverables), revision count (2 rounds standard), timeline, payment schedule (deposit → final before delivery), kill fee if they cancel mid-way, ownership transfers at final payment.

**Delivery habits that compound:**
- Set expectations day one; update BEFORE being asked
- Deliver a day early when possible
- Present the work (voice note/Loom walkthrough), don''t just attach files
- Ask for a review/testimonial immediately after delivery joy peaks

Repeat clients and referrals come from delivery, not promises.

## 💡 Real-world example
An editor sends every delivery with a 60-second voice note walking through her choices. Clients feel guided, not dumped on — and rehire rate is over 70%.

## ✍️ Practical
1. Write your proposal template with the 5 parts.
2. Draft a one-page agreement covering the essentials.
3. Practice presenting work with a recorded voice note.

## ✅ Checklist
- [ ] Proposal template ready
- [ ] Contract essentials covered
- [ ] Presentation habit built' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work' and le.title = 'Proposals, Contracts & Professional Delivery'
)
update public.course_lessons le
   set resources = '[{"title":"Fiverr — freelance marketplace","url":"https://www.fiverr.com/","type":"resource"},{"title":"Upwork — freelance marketplace","url":"https://www.upwork.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work' and le.title = 'Proposals, Contracts & Professional Delivery'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=UXtcoQAvs4U', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=UXtcoQAvs4U'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Getting Your First Client Without Experience', 'video', '15 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Getting Your First Client Without Experience'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Getting Your First Client Without Experience';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work' and le.title = 'Getting Your First Client Without Experience'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The experience paradox and its exits
- Self-initiated projects as proof
- The 10-outreach sprint

## 📖 Lesson
"Need experience to get work, need work to get experience" — four exits:

1. **Self-initiated projects:** redesign a famous app''s screen, rebrand a local shop, rebuild a website concept. Frame as case studies; no client needed, full proof earned.
2. **Volunteer strategically:** one NGO/church/school project, done excellently, WITH a testimonial and permission to showcase.
3. **The low-price first 3:** your first three paid gigs are tuition — price to win, overdeliver, collect reviews. Raise after.
4. **Skills challenges & communities:** design/dev challenges (and this platform''s certificates) add verifiable activity.

**The 10-outreach sprint:** list 10 people/businesses who could use your skill. Send each a SHORT personalized message: one specific observation about their current site/design + what you''d improve + your portfolio link. Expect 1–3 replies — that math works.

## 💡 Real-world example
A student with zero clients redesigned a popular local restaurant''s menu, posted it tagged to them with "made this for fun". The restaurant shared it — and hired her for the full rebrand.

## ✍️ Practical
1. Complete one self-initiated project as a case study.
2. Get one testimonial (volunteer or beta client).
3. Run the 10-outreach sprint this week.

## ✅ Checklist
- [ ] Self-initiated proof built
- [ ] One testimonial secured
- [ ] 10 outreach messages sent' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work' and le.title = 'Getting Your First Client Without Experience'
)
update public.course_lessons le
   set resources = '[{"title":"Fiverr — freelance marketplace","url":"https://www.fiverr.com/","type":"resource"},{"title":"LinkedIn — your professional storefront","url":"https://www.linkedin.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 3: Getting Paid Work' and le.title = 'Getting Your First Client Without Experience'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=UXtcoQAvs4U', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=UXtcoQAvs4U'
);

with c as (select id from public.courses where slug = 'portfolio-creation')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 4: Growth & Systems', 3 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 4: Growth & Systems'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Client Management: From First Call to Repeat Business', 'video', '15 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Client Management: From First Call to Repeat Business'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Client Management: From First Call to Repeat Business';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems' and le.title = 'Client Management: From First Call to Repeat Business'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Discovery calls that close deals
- Managing revisions without scope creep
- Turning one project into a retainer

## 📖 Lesson
**Discovery call agenda (20 min):** their business → the problem → what success looks like → timeline/budget → your proposal date. Listen 70%. End by stating the next step clearly.

**Revision management:** agree rounds in writing (2 included); batch feedback ("send everything by Friday"); changes beyond scope get quoted kindly ("That''s a new feature — ₦X, want it added?"). Scope creep dies in writing.

**The retainership:** after great delivery, offer ongoing value: monthly maintenance (sites), 4 videos/month (editors), weekly posts (marketers), monthly reports (Excel pros). Recurring income smooths the freelance rollercoaster — one ₦40k/month retainer beats ten one-off scrambles.

**End-of-project ritual:** testimonial request + referral ask ("who else needs this?") + stay visible (follow, engage, congratulate).

## 💡 Real-world example
A WordPress developer finishes every build with: "I also offer a ₦25k/month care plan — updates, backups, small changes." Six of her last ten clients said yes. Half her income now arrives automatically.

## ✍️ Practical
1. Write your discovery call agenda.
2. Draft your revision policy paragraph.
3. Design one retainer offer for your skill.

## ✅ Checklist
- [ ] Call agenda ready
- [ ] Revision policy written
- [ ] Retainer offer defined' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems' and le.title = 'Client Management: From First Call to Repeat Business'
)
update public.course_lessons le
   set resources = '[{"title":"LinkedIn — your professional storefront","url":"https://www.linkedin.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems' and le.title = 'Client Management: From First Call to Repeat Business'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=UXtcoQAvs4U', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=UXtcoQAvs4U'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Tools & Systems: Running Your Hustle Like a Business', 'video', '14 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Tools & Systems: Running Your Hustle Like a Business'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Tools & Systems: Running Your Hustle Like a Business';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems' and le.title = 'Tools & Systems: Running Your Hustle Like a Business'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The minimal business stack (mostly free)
- Tracking leads, projects & money
- Protecting your time and files

## 📖 Lesson
**The stack (free tiers suffice):**
- **Communication:** WhatsApp Business (labels, quick replies, catalog!) + email for contracts
- **Files:** Google Drive, organized: /Clients/ClientName/Project — backups save careers
- **Portfolio:** your showcase platform + home base link
- **Invoicing:** Wave, Zoho Invoice, or a clean Word/Excel invoice template; receipts for every payment
- **Money:** separate bank account for business income — clarity beats size

**Tracking (one sheet or Notion):** lead name, source, status (contacted/proposal/won/lost), project deadlines, amounts. Follow-ups live here — fortune is in the follow-up list.

**Time:** time-block deep work; batch shallow tasks; one "business hour" weekly for marketing even during busy delivery periods (pipeline emptying is the silent business killer).

## 💡 Real-world example
A designer lost a phone with two months of client files — no Drive backup. Three weeks of rework, two lost clients. After that: everything lives in two places, always.

## ✍️ Practical
1. Set up WhatsApp Business with labels + catalog.
2. Create your Drive structure + leads tracker.
3. Build one reusable invoice template.

## ✅ Checklist
- [ ] WhatsApp Business configured
- [ ] Leads + files organized
- [ ] Invoice template ready' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems' and le.title = 'Tools & Systems: Running Your Hustle Like a Business'
)
update public.course_lessons le
   set resources = '[{"title":"Carrd — one-page portfolio sites (free tier)","url":"https://carrd.co/","type":"tool"},{"title":"LinkedIn — your professional storefront","url":"https://www.linkedin.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems' and le.title = 'Tools & Systems: Running Your Hustle Like a Business'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=0CyhIoQlERI', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=0CyhIoQlERI'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Building an Income Ladder: One-offs → Products → Agency', 'video', '15 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Building an Income Ladder: One-offs → Products → Agency'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Building an Income Ladder: One-offs → Products → Agency';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems' and le.title = 'Building an Income Ladder: One-offs → Products → Agency'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 4 rungs of skills income
- Digital products: sell what you already make
- Knowing when (and if) to scale

## 📖 Lesson
Skills income climbs a ladder:
1. **Time for money** — freelance projects (everyone starts here; perfectly fine)
2. **Retainers** — recurring monthly work (stability)
3. **Products** — templates, presets, courses, Notion kits, LUTs: build once, sell repeatedly while you sleep
4. **Agency/team** — you sell, trusted collaborators deliver; margin on coordination

Product ideas by skill: designers → brand kits & social templates; editors → transition packs; Excel pros → budget/dashboard templates; marketers → content calendars. Sell on Selar, Gumroad, Paystack store pages, or your own site.

Scale only when demand outpaces you — growth before demand kills quality and reputation. And remember: rung 1 done excellently already beats rungs 2–4 done poorly.

## 💡 Real-world example
A video editor kept recreating the same caption style pack per client — so he packaged it and sold it for ₦3,000 on Selar. It now earns monthly while he sleeps: the same work, unbottled from his hours.

## ✍️ Practical
1. Identify one thing you already recreate repeatedly.
2. Package it as a product with a price.
3. List it on one store platform this month.

## ✅ Checklist
- [ ] Income ladder understood
- [ ] One product identified
- [ ] Listed for sale' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems' and le.title = 'Building an Income Ladder: One-offs → Products → Agency'
)
update public.course_lessons le
   set resources = '[{"title":"Fiverr — freelance marketplace","url":"https://www.fiverr.com/","type":"resource"},{"title":"Upwork — freelance marketplace","url":"https://www.upwork.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems' and le.title = 'Building an Income Ladder: One-offs → Products → Agency'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=0CyhIoQlERI', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=0CyhIoQlERI'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Capstone: Launch Your Portfolio & 30-Day Client Plan', 'project', '20 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Capstone: Launch Your Portfolio & 30-Day Client Plan'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems'
)
update public.course_lessons le set type = 'project'
  from m where le.module_id = m.module_id and le.title = 'Capstone: Launch Your Portfolio & 30-Day Client Plan';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems' and le.title = 'Capstone: Launch Your Portfolio & 30-Day Client Plan'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Assembling the complete portfolio launch
- The 30-day action plan, day by day
- Measuring what works and doubling down

## 📖 Lesson
**Launch checklist (this week):**
1. ✅ 3–5 case studies published on your showcase platform
2. ✅ Home base live (promise + top work + WhatsApp)
3. ✅ LinkedIn + one social profile optimized, promise-aligned
4. ✅ Marketplace gig/profile created
5. ✅ Price list + proposal template ready

**30-day plan:**
- Week 1: complete the launch checklist
- Week 2: 10-outreach sprint + 2 value posts
- Week 3: follow up everyone; 2 more posts; join 2 communities
- Week 4: pitch 10 more; publish 1 new case study; review numbers

**Measure weekly:** outreach sent, replies, proposals sent, calls, money. After 30 days, double down on what produced replies — usually one channel clearly wins.

The portfolio doesn''t finish — it grows with every project. What you''ve built in this course series is real. Now distribution does the work.

## 💡 Real-world example
Graduates who ran the 30-day plan without skipping days: nearly all reported first income or first paying conversation within the month. Plan adherence, not talent, predicted it.

## ✍️ Practical
1. Complete every launch checklist item.
2. Start week 1 of the plan today.
3. Book your weekly 30-minute review slot.

## ✅ Checklist
- [ ] Portfolio fully live
- [ ] 30-day plan scheduled
- [ ] Weekly review committed' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems' and le.title = 'Capstone: Launch Your Portfolio & 30-Day Client Plan'
)
update public.course_lessons le
   set resources = '[{"title":"Behance — free global portfolio platform","url":"https://www.behance.net/","type":"resource"},{"title":"GitHub — developer portfolios live here","url":"https://github.com/","type":"resource"},{"title":"Fiverr — freelance marketplace","url":"https://www.fiverr.com/","type":"resource"},{"title":"Upwork — freelance marketplace","url":"https://www.upwork.com/","type":"resource"},{"title":"LinkedIn — your professional storefront","url":"https://www.linkedin.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'portfolio-creation' and mo.title = 'Module 4: Growth & Systems' and le.title = 'Capstone: Launch Your Portfolio & 30-Day Client Plan'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=3KiMwhCuJWs', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=3KiMwhCuJWs'
);

with c as (select id from public.courses where slug = 'portfolio-creation')
insert into public.quizzes (course_id, title, description, passing_score, allow_retake, is_final, status, attempt_limit)
select c.id, 'Final Assessment — Portfolio Creation & Freelance Success', 'Final assessment — pass to move toward your certificate.', 70, true, true, 'published', null from c
where not exists (
  select 1 from public.quizzes z where z.course_id = c.id and z.title = 'Final Assessment — Portfolio Creation & Freelance Success'
);
update public.quizzes z set lesson_id = le.id
  from public.course_lessons le
 where z.course_id = le.course_id and le.title = 'Capstone: Launch Your Portfolio & 30-Day Client Plan'
   and z.title = 'Final Assessment — Portfolio Creation & Freelance Success' and exists (select 1 from public.courses c where c.id = z.course_id and c.slug = 'portfolio-creation');
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'portfolio-creation' and z.title = 'Final Assessment — Portfolio Creation & Freelance Success')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A portfolio’s primary job is to…', '["Prove you can solve real problems","List every project ever made","Show your hobbies","Replace contracts"]'::jsonb,
0, '[]'::jsonb,
'Buyers hire evidence — curated proof beats volume.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A portfolio’s primary job is to…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'portfolio-creation' and z.title = 'Final Assessment — Portfolio Creation & Freelance Success')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A strong case study follows which structure?', '["Problem → approach → work → outcome","Only final screenshots","Only pricing tables","Random image dumps"]'::jsonb,
0, '[]'::jsonb,
'The story of a solved problem is what convinces clients.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A strong case study follows which structure?'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'portfolio-creation' and z.title = 'Final Assessment — Portfolio Creation & Freelance Success')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Specializing in one clear offer usually beats listing ten unrelated skills.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Specialists are remembered and paid more; generalists compete on price.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Specializing in one clear offer usually beats listing ten unrelated skills.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'portfolio-creation' and z.title = 'Final Assessment — Portfolio Creation & Freelance Success')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'On Fiverr, the first reviews are typically earned by…', '["Low introductory pricing with overdelivery","Charging the highest rate immediately","Buying fake reviews","Waiting passively"]'::jsonb,
0, '[]'::jsonb,
'Early reviews are the asset — price to win them, then raise rates.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'On Fiverr, the first reviews are typically earned by…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'portfolio-creation' and z.title = 'Final Assessment — Portfolio Creation & Freelance Success')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_answer', 'Which belong in a freelance proposal? (Select all that apply)', '["The client’s problem in their words","Deliverables, timeline and price","Relevant proof links","Your entire life story"]'::jsonb,
null, '[0,1,2]'::jsonb,
'Proposals answer: what, for whom, when, how much, why you.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which belong in a freelance proposal? (Select all that apply)'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'portfolio-creation' and z.title = 'Final Assessment — Portfolio Creation & Freelance Success')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A deposit before starting work protects you by…', '["Confirming commitment and covering initial effort","Replacing contracts entirely","Guaranteeing 5-star reviews","Avoiding all communication"]'::jsonb,
0, '[]'::jsonb,
'Deposits (30–60%) filter serious clients and de-risk your time.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A deposit before starting work protects you by…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'portfolio-creation' and z.title = 'Final Assessment — Portfolio Creation & Freelance Success')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'The fastest way to make a designer’s portfolio convincing is…', '["Before/after comparisons","Long biographies","Stock photos","Unfinished projects"]'::jsonb,
0, '[]'::jsonb,
'Before/after demonstrates value in one glance.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'The fastest way to make a designer’s portfolio convincing is…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'portfolio-creation' and z.title = 'Final Assessment — Portfolio Creation & Freelance Success')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A retainer is best described as…', '["Recurring monthly work for a fixed fee","A one-time gig","A type of invoice","A legal penalty"]'::jsonb,
0, '[]'::jsonb,
'Retainers turn freelance chaos into predictable income.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A retainer is best described as…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'portfolio-creation' and z.title = 'Final Assessment — Portfolio Creation & Freelance Success')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Most work in many markets is filled through relationships and referrals rather than public job ads.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Tell your circles what you do — the hidden market runs on trust.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Most work in many markets is filled through relationships and referrals rather than public job ads.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'portfolio-creation' and z.title = 'Final Assessment — Portfolio Creation & Freelance Success')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'When a client says "too expensive", the professional response is to…', '["Offer a smaller scope or clarify value","Disappear","Work for free","Argue aggressively"]'::jsonb,
0, '[]'::jsonb,
'Reframing scope preserves the relationship and your rates.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'When a client says "too expensive", the professional response is to…'
);
with c as (select id from public.courses where slug = 'portfolio-creation')
insert into public.assignments (course_id, title, description, instructions, required_output, max_score, is_final_project, status)
select c.id, 'Final Project: Your Live Portfolio + First Outreach Sprint', 'Launch your complete professional presence and run your first client outreach.', '1) Publish 3 case studies on your showcase platform (Behance/GitHub/YouTube/Drive as fits your skill).
2) Launch your one-page home base: promise, top 3 works, WhatsApp/contact, portfolio link.
3) Optimize LinkedIn (headline, About, Featured) and one social profile.
4) Write your price list and proposal template.
5) Run the outreach sprint: 10 personalized messages to potential clients/employers, logging every response.', 'Links to your published portfolio + home base + the outreach log (who, what you sent, replies) + a 1-page reflection on what you’ll improve next month.', 100, true, 'published' from c
where not exists (
  select 1 from public.assignments a where a.course_id = c.id and a.title = 'Final Project: Your Live Portfolio + First Outreach Sprint'
);
update public.assignments a set lesson_id = le.id
  from public.course_lessons le
 where a.course_id = le.course_id and le.title = 'Capstone: Launch Your Portfolio & 30-Day Client Plan'
   and a.title = 'Final Project: Your Live Portfolio + First Outreach Sprint' and exists (select 1 from public.courses c where c.id = a.course_id and c.slug = 'portfolio-creation');
with c as (select id from public.courses where slug = 'portfolio-creation')
insert into public.course_completion_rules (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project)
select c.id, 100, 70, 0, true from c
on conflict (course_id) do update
  set require_lessons_pct = excluded.require_lessons_pct,
      require_quiz_avg = excluded.require_quiz_avg,
      require_assignments_approved = excluded.require_assignments_approved,
      require_final_project = excluded.require_final_project,
      updated_at = now();

-- ---------- frontend-web-development ----------
with c as (select id from public.courses where slug = 'frontend-web-development')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 1: HTML — The Structure of the Web', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 1: HTML — The Structure of the Web'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'How the Web Works & Your First HTML Page', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'How the Web Works & Your First HTML Page'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'How the Web Works & Your First HTML Page';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web' and le.title = 'How the Web Works & Your First HTML Page'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- What happens when you open a website
- HTML tags, elements and attributes
- Writing and opening your first page

## 📖 Lesson
When you visit a site: your browser asks a **server** for files → the server sends **HTML** (structure), **CSS** (style), **JavaScript** (behavior) → the browser paints the page. As a frontend developer you write those three files.

HTML = HyperText Markup Language. You describe content with **tags**:
```html
<h1>My First Page</h1>      <!-- heading -->
<p>Hello, world!</p>        <!-- paragraph -->
<a href="https://example.com">A link</a>
<img src="photo.jpg" alt="description">
```
An **element** = opening tag + content + closing tag. **Attributes** (like `href`, `src`, `alt`) add extra info inside the opening tag.

Setup: install VS Code (free), create `index.html`, type your code, double-click to open in a browser. This edit → refresh loop is your life now — make it fast.

## 💡 Real-world example
Every website you have ever used — banks, WhatsApp Web, Google — is ultimately HTML, CSS and JS files arriving at a browser. You''re learning the exact same ingredients.

## ✍️ Practical
1. Install VS Code + Chrome.
2. Create index.html with a heading, paragraph, link and image.
3. Open it in the browser and change the text — refresh to see it update.

## ✅ Checklist
- [ ] I can explain browser ↔ server
- [ ] First page shows heading/paragraph/link/image
- [ ] Edit → refresh loop working' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web' and le.title = 'How the Web Works & Your First HTML Page'
)
update public.course_lessons le
   set resources = '[{"title":"MDN Web Docs — Learn web development (global standard)","url":"https://developer.mozilla.org/en-US/docs/Learn","type":"docs"},{"title":"W3Schools HTML reference & exercises","url":"https://www.w3schools.com/html/","type":"docs"},{"title":"HTML5 Notes for Professionals — free PDF","url":"https://goalkicker.com/HTML5Book/","type":"pdf"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web' and le.title = 'How the Web Works & Your First HTML Page'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=916GWv2Qs08', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=916GWv2Qs08'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Text, Links, Images & Lists', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Text, Links, Images & Lists'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Text, Links, Images & Lists';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web' and le.title = 'Text, Links, Images & Lists'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Headings h1–h6 and when to use each
- Links: absolute, relative, and anchors
- Ordered/unordered lists and image best practices

## 📖 Lesson
**Headings** create a document outline: one `h1` per page (the main title), `h2` for sections, `h3` inside sections. Screen readers and Google both read this outline — never choose headings for size (CSS handles size).

**Links:** `<a href="...">`
- Absolute: full URL `https://site.com/page`
- Relative: from the current folder `about.html`, `images/logo.png`
- Anchors: link to a section on the same page with `href="#section-id"`

**Images:** always include `alt` text (accessibility + SEO), and size large images down before uploading — slow pages lose visitors.

**Lists:** `<ul>` bullets, `<ol>` numbered, each item `<li>`. Nav menus, features, steps — lists are everywhere.

## 💡 Real-world example
A portfolio with a broken relative link (`/images/me.jpg` instead of `images/me.jpg`) shows a missing photo to every visitor. One slash, real damage.

## ✍️ Practical
1. Build a mini "about me" page: h1, 2 sections with h2, a list of hobbies.
2. Add a nav with anchor links jumping to each section.
3. Add your photo with proper alt text.

## ✅ Checklist
- [ ] One h1, logical h2/h3 outline
- [ ] Anchor navigation works
- [ ] Images have alt text' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web' and le.title = 'Text, Links, Images & Lists'
)
update public.course_lessons le
   set resources = '[{"title":"MDN Web Docs — Learn web development (global standard)","url":"https://developer.mozilla.org/en-US/docs/Learn","type":"docs"},{"title":"W3Schools HTML reference & exercises","url":"https://www.w3schools.com/html/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web' and le.title = 'Text, Links, Images & Lists'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=916GWv2Qs08', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=916GWv2Qs08'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Semantic HTML: Professional Page Structure', 'video', '15 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Semantic HTML: Professional Page Structure'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Semantic HTML: Professional Page Structure';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web' and le.title = 'Semantic HTML: Professional Page Structure'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Why <div> soup fails interviews
- header, nav, main, section, article, footer
- Accessibility wins for free

## 📖 Lesson
Semantic tags describe **meaning**, not just boxes:
```html
<header>…site/logo/nav…</header>
<nav>…links…</nav>
<main>…the ONE main content…</main>
  <section>…a theme…</section>
  <article>…self-contained content…</article>
<footer>…copyright/contact…</footer>
```
Benefits: screen readers can jump between regions (accessibility), Google understands your content (SEO), and other developers read your code instantly.

Hiring managers spot `<div><div><div>` code immediately — semantics are the first sign of a trained developer. Use `<div>` only when no semantic tag fits.

Also learn: `<button>` for actions (never a clickable div), `<form>` for inputs, `<figure>/<figcaption>` for media with captions.

## 💡 Real-world example
Two candidates build the same layout. One uses all divs; one uses semantic regions. The semantic code gets the interview callback — it reads like a document outline.

## ✍️ Practical
1. Sketch a page layout on paper (header/nav/main/3 sections/footer).
2. Build it with only semantic tags.
3. Validate: right-click → Inspect and read your own outline.

## ✅ Checklist
- [ ] No unnecessary divs
- [ ] One <main> per page
- [ ] Buttons for actions, links for navigation' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web' and le.title = 'Semantic HTML: Professional Page Structure'
)
update public.course_lessons le
   set resources = '[{"title":"MDN Web Docs — Learn web development (global standard)","url":"https://developer.mozilla.org/en-US/docs/Learn","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web' and le.title = 'Semantic HTML: Professional Page Structure'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=916GWv2Qs08', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=916GWv2Qs08'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Tables, Forms & HTML Project: Profile Page', 'video', '17 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Tables, Forms & HTML Project: Profile Page'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Tables, Forms & HTML Project: Profile Page';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web' and le.title = 'Tables, Forms & HTML Project: Profile Page'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Tables for real tabular data
- Forms: inputs, labels, validation attributes
- Capstone: a complete semantic profile page

## 📖 Lesson
**Tables:** `<table>` → `<thead>` (column titles) + `<tbody>` (rows `<tr>`, cells `<td>`, header cells `<th>`). Use for data only — never for layout.

**Forms** collect user input:
```html
<form>
  <label for="email">Email</label>
  <input id="email" type="email" required>
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>
```
Key attributes: `type` (email, number, date, password…), `required`, `min/max`, `placeholder`. Always pair `<label for="id">` with inputs — accessibility and bigger tap targets.

**Project:** build a profile page: header with name/title, about section, skills table, contact form, footer — fully semantic. This is portfolio piece #1.

## 💡 Real-world example
A form without labels confuses screen readers AND looks broken when fields resize. Labels solve both — free quality.

## ✍️ Practical
1. Build the full profile page project.
2. Add a skills table (3 rows) and a contact form (3 fields).
3. Test every input type in the browser.

## ✅ Checklist
- [ ] Profile page complete & semantic
- [ ] Table used for data
- [ ] Form fields all labeled' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web' and le.title = 'Tables, Forms & HTML Project: Profile Page'
)
update public.course_lessons le
   set resources = '[{"title":"MDN Web Docs — Learn web development (global standard)","url":"https://developer.mozilla.org/en-US/docs/Learn","type":"docs"},{"title":"W3Schools HTML reference & exercises","url":"https://www.w3schools.com/html/","type":"docs"},{"title":"HTML5 Notes for Professionals — free PDF","url":"https://goalkicker.com/HTML5Book/","type":"pdf"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 1: HTML — The Structure of the Web' and le.title = 'Tables, Forms & HTML Project: Profile Page'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=916GWv2Qs08', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=916GWv2Qs08'
);

with c as (select id from public.courses where slug = 'frontend-web-development')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 2: CSS — Styling & Layout', 1 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 2: CSS — Styling & Layout'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'CSS Basics: Selectors, Colors & the Cascade', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'CSS Basics: Selectors, Colors & the Cascade'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'CSS Basics: Selectors, Colors & the Cascade';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout' and le.title = 'CSS Basics: Selectors, Colors & the Cascade'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Linking CSS and writing rules
- Selectors: element, class, id, and combining
- How the cascade decides which style wins

## 📖 Lesson
CSS rules = **selector** + **declarations**:
```css
.card {                /* selector */
  color: #0ea5e9;      /* property: value */
  background: #0f172a;
}
```
Selectors: `p` (all paragraphs), `.card` (class — reusable, your workhorse), `#hero` (id — one per page), and combos like `.card h2` (h2 inside .card) or `a:hover` (state).

**The cascade** resolves conflicts by: (1) importance, (2) **specificity** (id > class > element), (3) source order (later wins). 90% of "why isn''t my style applying?" is specificity or order.

Best practices: style mostly with classes; one stylesheet linked in `<head>`; consistent naming (lowercase, hyphens).

## 💡 Real-world example
A developer spent an hour on a "broken" style — an id rule elsewhere had higher specificity. Understanding the cascade turns hours into seconds.

## ✍️ Practical
1. Style your profile page: colors, fonts, hover effects.
2. Use only classes (no ids for styling).
3. Deliberately create and resolve one specificity conflict.

## ✅ Checklist
- [ ] CSS linked in <head>
- [ ] Classes drive styling
- [ ] I can explain cascade order' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout' and le.title = 'CSS Basics: Selectors, Colors & the Cascade'
)
update public.course_lessons le
   set resources = '[{"title":"W3Schools CSS reference & exercises","url":"https://www.w3schools.com/css/","type":"docs"},{"title":"CSS Notes for Professionals — free PDF","url":"https://goalkicker.com/CSSBook/","type":"pdf"},{"title":"MDN Web Docs — Learn web development (global standard)","url":"https://developer.mozilla.org/en-US/docs/Learn","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout' and le.title = 'CSS Basics: Selectors, Colors & the Cascade'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=1Rs2ND1ryYc', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=1Rs2ND1ryYc'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'The Box Model: How Every Element Is Sized', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'The Box Model: How Every Element Is Sized'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'The Box Model: How Every Element Is Sized';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout' and le.title = 'The Box Model: How Every Element Is Sized'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Content → padding → border → margin
- box-sizing: border-box (the professional default)
- Debugging layout with DevTools

## 📖 Lesson
Every element is a box with 4 layers:
1. **Content** — the text/image itself
2. **Padding** — space INSIDE the border (background shows here)
3. **Border** — the edge line
4. **Margin** — space OUTSIDE, between elements

Default CSS sizes only the content, so `width: 200px` + padding makes the box *bigger* than 200px. Professionals fix this globally:
```css
*, *::before, *::after { box-sizing: border-box; }
```
Now width includes padding + border — layouts become predictable.

**Margin collapse:** vertical margins between stacked elements merge (the bigger one wins) — a classic surprise.

Open DevTools (F12) → Elements → select any element to see its live box-model diagram. Use this daily.

## 💡 Real-world example
A student''s cards kept overflowing their grid — 20px hidden padding each. The DevTools box diagram revealed it in ten seconds.

## ✍️ Practical
1. Build 3 boxes with different padding/border/margin.
2. Add the border-box reset to your page.
3. Inspect each box in DevTools and read the diagram.

## ✅ Checklist
- [ ] I can name the 4 layers in order
- [ ] border-box reset applied
- [ ] DevTools box diagram is familiar' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout' and le.title = 'The Box Model: How Every Element Is Sized'
)
update public.course_lessons le
   set resources = '[{"title":"MDN Web Docs — Learn web development (global standard)","url":"https://developer.mozilla.org/en-US/docs/Learn","type":"docs"},{"title":"CSS-Tricks — flexbox, grid & layout guides","url":"https://css-tricks.com/","type":"article"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout' and le.title = 'The Box Model: How Every Element Is Sized'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=1Rs2ND1ryYc', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=1Rs2ND1ryYc'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Flexbox: One-Dimensional Layout Mastery', 'video', '17 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Flexbox: One-Dimensional Layout Mastery'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Flexbox: One-Dimensional Layout Mastery';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout' and le.title = 'Flexbox: One-Dimensional Layout Mastery'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Flex container vs flex items
- Alignment: justify-content, align-items, gap
- Real patterns: navbar, card row, centering

## 📖 Lesson
Flexbox lays out items in **one direction** (row or column). Turn it on at the parent:
```css
.row {
  display: flex;
  justify-content: space-between; /* main axis */
  align-items: center;            /* cross axis */
  gap: 16px;
}
```
- `justify-content` = distribute along the direction (flex-start / center / space-between)
- `align-items` = align across it (stretch / center / flex-end)
- `gap` = spacing without margin hacks
- Items: `flex: 1` grows to fill space equally

Patterns you''ll use forever: **navbar** (logo left, links right → space-between), **card row** (equal cards → flex:1), **perfect centering** (justify-content:center + align-items:center).

Play Flexbox Froggy until level 15+ — 20 minutes of play that pays for years.

## 💡 Real-world example
Navbars, pricing rows, footer columns, form layouts — a working developer uses flexbox dozens of times a day. It is the highest-ROI CSS skill.

## ✍️ Practical
1. Complete Flexbox Froggy levels 1–15.
2. Build a navbar (logo + 4 links, space-between).
3. Build a row of 3 equal cards with gap.

## ✅ Checklist
- [ ] Froggy 15+ done
- [ ] Navbar uses space-between
- [ ] Equal cards with flex:1' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout' and le.title = 'Flexbox: One-Dimensional Layout Mastery'
)
update public.course_lessons le
   set resources = '[{"title":"CSS-Tricks — flexbox, grid & layout guides","url":"https://css-tricks.com/","type":"article"},{"title":"Flexbox Froggy — learn flexbox by game","url":"https://flexboxfroggy.com/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout' and le.title = 'Flexbox: One-Dimensional Layout Mastery'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=1Rs2ND1ryYc', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=1Rs2ND1ryYc'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Grid & Responsive Design (Media Queries)', 'video', '18 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Grid & Responsive Design (Media Queries)'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Grid & Responsive Design (Media Queries)';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout' and le.title = 'Grid & Responsive Design (Media Queries)'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- CSS Grid for two-dimensional layouts
- Media queries: mobile-first workflow
- Building your first responsive page

## 📖 Lesson
**Grid** handles rows AND columns at once:
```css
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 equal columns */
  gap: 20px;
}
```
The magic responsive line: `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));` — columns that adapt automatically.

**Responsive design** = one site, every screen. **Mobile-first:** write base styles for phones, then enhance upward:
```css
.cards { display: grid; gap: 16px; }                 /* phones: 1 col */
@media (min-width: 768px) { .cards { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1100px) { .cards { grid-template-columns: repeat(3, 1fr); } }
```
Test in DevTools device mode at 375px, 768px, 1440px.

Rule of thumb: Flexbox for components (navbars, cards), Grid for page skeletons and galleries.

## 💡 Real-world example
Over 70% of Nigerian web traffic is mobile. A desktop-only layout literally hides your site from most visitors — responsive is not optional.

## ✍️ Practical
1. Play Grid Garden levels 1–14.
2. Convert your profile page to mobile-first with 2 breakpoints.
3. Test at phone/tablet/desktop widths.

## ✅ Checklist
- [ ] Grid Garden 14+ done
- [ ] Mobile-first breakpoints working
- [ ] Page looks right at 3 widths' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout' and le.title = 'Grid & Responsive Design (Media Queries)'
)
update public.course_lessons le
   set resources = '[{"title":"CSS-Tricks — flexbox, grid & layout guides","url":"https://css-tricks.com/","type":"article"},{"title":"Grid Garden — learn grid by game","url":"https://cssgridgarden.com/","type":"tool"},{"title":"web.dev by Google — modern web courses","url":"https://web.dev/learn","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 2: CSS — Styling & Layout' and le.title = 'Grid & Responsive Design (Media Queries)'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=2rDXik56cxo', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=2rDXik56cxo'
);

with c as (select id from public.courses where slug = 'frontend-web-development')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 3: JavaScript — Making Pages Think', 2 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 3: JavaScript — Making Pages Think'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Variables, Types & Operators', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Variables, Types & Operators'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Variables, Types & Operators';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think' and le.title = 'Variables, Types & Operators'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- let, const (and why var retired)
- Strings, numbers, booleans, arrays, objects
- Template literals and basic math

## 📖 Lesson
JavaScript makes pages react. Connect it with `<script src="app.js"></script>` before `</body>` (or `defer` in head).

**Variables** store values:
```js
const price = 5000;      // const: never reassign
let count = 0;           // let: can change
count = count + 1;
```
**Types:** strings (''hello''), numbers (42, 3.5), booleans (true/false), arrays (ordered lists), objects (labeled data):
```js
const course = { title: ''Frontend'', price: 5000, lessons: 16 };
console.log(course.title);        // dot access
console.log(`₦${course.price}`); // template literal
```
**Operators:** + − * / % (remainder), comparisons (===, !==, >, <) and logical (&&, ||, !). Always use `===` (strict) — `==` has surprising conversions.

Console (F12 → Console) is your laboratory: test every idea there first.

## 💡 Real-world example
A cart total that updates as quantities change = a number variable + arithmetic + display. Every interactive feature starts this small.

## ✍️ Practical
1. In the console: create const/let variables of each type.
2. Build a `course` object and log 3 properties.
3. Write 3 expressions with arithmetic + comparisons.

## ✅ Checklist
- [ ] const vs let is clear
- [ ] I can build arrays & objects
- [ ] Template literals working' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think' and le.title = 'Variables, Types & Operators'
)
update public.course_lessons le
   set resources = '[{"title":"The Modern JavaScript Tutorial (javascript.info)","url":"https://javascript.info/","type":"docs"},{"title":"JavaScript Notes for Professionals — free 400+ page PDF","url":"https://goalkicker.com/JavaScriptBook/","type":"pdf"},{"title":"freeCodeCamp — free interactive certifications","url":"https://www.freecodecamp.org/learn/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think' and le.title = 'Variables, Types & Operators'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=n8mNX2YqkUs', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=n8mNX2YqkUs'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Functions, Conditions & Loops', 'video', '17 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Functions, Conditions & Loops'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Functions, Conditions & Loops';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think' and le.title = 'Functions, Conditions & Loops'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Declaring and calling functions
- if/else decision logic
- for loops and array methods

## 📖 Lesson
**Functions** are reusable recipes:
```js
function greet(name) {
  return `Hello, ${name}!`;
}
greet(''Ada''); // "Hello, Ada!"
```
Arrow syntax you''ll see everywhere: `const double = (n) => n * 2;`

**Conditions** branch your code:
```js
if (score >= 70) { console.log(''Pass''); }
else { console.log(''Try again''); }
```
**Loops** repeat work:
```js
const prices = [1000, 2500, 800];
let total = 0;
for (const p of prices) total += p;
```
And the modern array methods (learn these well): `.forEach()`, `.map()` (transform each item), `.filter()` (keep some), `.reduce()` (combine into one value). They replace most manual loops in real code.

## 💡 Real-world example
"Show only courses under ₦6,000" = `courses.filter(c => c.price < 6000)`. One line of filter powers half the UIs you use.

## ✍️ Practical
1. Write functions: greeting, price-with-VAT, pass/fail checker.
2. Loop over an array with for..of, then with map/filter.
3. Use reduce to sum a price array.

## ✅ Checklist
- [ ] Functions return values correctly
- [ ] if/else logic working
- [ ] map + filter + reduce each used' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think' and le.title = 'Functions, Conditions & Loops'
)
update public.course_lessons le
   set resources = '[{"title":"The Modern JavaScript Tutorial (javascript.info)","url":"https://javascript.info/","type":"docs"},{"title":"JavaScript Notes for Professionals — free 400+ page PDF","url":"https://goalkicker.com/JavaScriptBook/","type":"pdf"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think' and le.title = 'Functions, Conditions & Loops'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=n8mNX2YqkUs', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=n8mNX2YqkUs'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'The DOM: Reading & Changing the Page', 'video', '18 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'The DOM: Reading & Changing the Page'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'The DOM: Reading & Changing the Page';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think' and le.title = 'The DOM: Reading & Changing the Page'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Selecting elements (querySelector)
- Changing text, styles, classes
- Creating and inserting elements

## 📖 Lesson
The **DOM** is the browser''s live model of your HTML — JavaScript can read and rewrite it.

```js
const title = document.querySelector(''h1'');      // first match
const cards = document.querySelectorAll(''.card''); // all matches
title.textContent = ''New title'';
title.classList.add(''highlight'');                // toggle CSS classes
title.style.color = ''#0ea5e9'';                   // direct style (prefer classes)
```
Create content:
```js
const li = document.createElement(''li'');
li.textContent = ''New item'';
document.querySelector(''ul'').append(li);
```
Prefer adding/removing **classes** over inline styles — keep design in CSS, behavior in JS.

This is how every dynamic UI works: data changes → JS updates DOM → user sees it.

## 💡 Real-world example
A "show more" button revealing hidden testimonials: a click listener toggling one class on a container. Small DOM skills, visible magic.

## ✍️ Practical
1. Change a heading''s text and class from JS.
2. Build a list of 3 items dynamically with createElement.
3. Toggle a dark-mode class on the body from the console.

## ✅ Checklist
- [ ] querySelector(All) fluent
- [ ] classList toggling works
- [ ] Dynamic elements render' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think' and le.title = 'The DOM: Reading & Changing the Page'
)
update public.course_lessons le
   set resources = '[{"title":"The Modern JavaScript Tutorial (javascript.info)","url":"https://javascript.info/","type":"docs"},{"title":"MDN Web Docs — Learn web development (global standard)","url":"https://developer.mozilla.org/en-US/docs/Learn","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think' and le.title = 'The DOM: Reading & Changing the Page'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=n8mNX2YqkUs', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=n8mNX2YqkUs'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Events & Mini Project: Interactive To-Do List', 'video', '19 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Events & Mini Project: Interactive To-Do List'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Events & Mini Project: Interactive To-Do List';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think' and le.title = 'Events & Mini Project: Interactive To-Do List'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- addEventListener and the event object
- Reading form input live
- Capstone: a working to-do list

## 📖 Lesson
Events connect user actions to your code:
```js
button.addEventListener(''click'', (event) => {
  console.log(''clicked!'', event.target);
});
input.addEventListener(''input'', () => {
  console.log(input.value); // live typing
});
```
Common events: click, input, submit (call `event.preventDefault()` to stop page reload), mouseover, keydown.

**Project — To-Do list:**
1. HTML: input + "Add" button + empty `<ul>`
2. On click: read input.value, skip if empty
3. Create `<li>` with the text + a ✕ delete button
4. Append to the list; clear the input
5. Click ✕ → remove that `<li>`

Bonus: save with `localStorage` so todos survive refresh.

This tiny app uses EVERYTHING: DOM, events, functions, arrays. Finish it before moving on.

## 💡 Real-world example
Every "add to cart", every comment box, every like button is this exact pattern: listen → read → update DOM. Master one, understand thousands.

## ✍️ Practical
1. Build the complete to-do list.
2. Add delete + empty-input guard.
3. Bonus: localStorage persistence.

## ✅ Checklist
- [ ] Add & delete working
- [ ] Empty input guarded
- [ ] Code understood line by line' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think' and le.title = 'Events & Mini Project: Interactive To-Do List'
)
update public.course_lessons le
   set resources = '[{"title":"The Modern JavaScript Tutorial (javascript.info)","url":"https://javascript.info/","type":"docs"},{"title":"freeCodeCamp — free interactive certifications","url":"https://www.freecodecamp.org/learn/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 3: JavaScript — Making Pages Think' and le.title = 'Events & Mini Project: Interactive To-Do List'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=n8mNX2YqkUs', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=n8mNX2YqkUs'
);

with c as (select id from public.courses where slug = 'frontend-web-development')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 4: React & Going Professional', 3 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 4: React & Going Professional'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Why React & Your First Component', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Why React & Your First Component'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Why React & Your First Component';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional' and le.title = 'Why React & Your First Component'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- What problem React solves
- Components: UI as reusable functions
- JSX and rendering to the page

## 📖 Lesson
As apps grow, updating the DOM manually becomes chaos. **React** flips the model: you describe what the UI *should* look like for any state, and React updates the DOM for you.

A **component** is a function returning JSX (HTML-like syntax inside JS):
```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```
Components compose like LEGO: `<Header /> <CourseList /> <Footer />`. Start a project with Vite: `npm create vite@latest my-app -- --template react`, then `npm install && npm run dev`.

Mental shift: UI = f(state). Change the state → React re-renders. You stop micromanaging elements and start describing outcomes.

## 💡 Real-world example
This very learning platform, plus Netflix, Instagram web, and most modern dashboards are React. It''s the most job-demanded frontend library on earth.

## ✍️ Practical
1. Create a Vite React app and run the dev server.
2. Write a Welcome component with a name prop.
3. Render it 3× with different names.

## ✅ Checklist
- [ ] Vite app running
- [ ] Component with props works
- [ ] I can say "UI = f(state)"' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional' and le.title = 'Why React & Your First Component'
)
update public.course_lessons le
   set resources = '[{"title":"React Notes for Professionals — free PDF","url":"https://goalkicker.com/ReactBook/","type":"pdf"},{"title":"React official docs (react.dev)","url":"https://react.dev/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional' and le.title = 'Why React & Your First Component'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=4UZrsTqkcW4', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=4UZrsTqkcW4'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Props, State & Handling Events in React', 'video', '18 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Props, State & Handling Events in React'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Props, State & Handling Events in React';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional' and le.title = 'Props, State & Handling Events in React'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Props: passing data down
- useState: the state hook
- Controlled inputs & click handlers

## 📖 Lesson
**Props** flow data parent → child, read-only:
```jsx
<CourseCard title="Frontend" price={5000} />
```
**State** is data the component owns and can change — via the `useState` hook:
```jsx
const [count, setCount] = useState(0);
// later:
<button onClick={() => setCount(count + 1)}>+1</button>
```
When state changes, React re-renders automatically. Never mutate state directly; always use the setter.

**Controlled inputs:** the input''s value lives in state:
```jsx
const [name, setName] = useState('''');
<input value={name} onChange={(e) => setName(e.target.value)} />
```
This pattern (state + event handlers + re-render) powers every React form, cart and filter.

## 💡 Real-world example
A filter box on a course list: input state → filtered array → list re-renders on every keystroke. No DOM queries anywhere.

## ✍️ Practical
1. Build a counter with + / − / reset buttons.
2. Build a controlled input that live-greets the typed name.
3. Explain out loud why you never write `count = count + 1`.

## ✅ Checklist
- [ ] useState pattern fluent
- [ ] Controlled input working
- [ ] Props vs state difference clear' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional' and le.title = 'Props, State & Handling Events in React'
)
update public.course_lessons le
   set resources = '[{"title":"React docs — thinking in React","url":"https://react.dev/learn/thinking-in-react","type":"docs"},{"title":"React Notes for Professionals — free PDF","url":"https://goalkicker.com/ReactBook/","type":"pdf"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional' and le.title = 'Props, State & Handling Events in React'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=4UZrsTqkcW4', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=4UZrsTqkcW4'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Lists, Fetching Data & Showing Real Content', 'video', '18 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Lists, Fetching Data & Showing Real Content'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Lists, Fetching Data & Showing Real Content';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional' and le.title = 'Lists, Fetching Data & Showing Real Content'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Rendering lists with .map() and keys
- useEffect + fetch for real data
- Loading & error states (the pro touch)

## 📖 Lesson
**Lists:** map an array to components — every item needs a stable `key`:
```jsx
{courses.map((c) => <CourseCard key={c.id} title={c.title} />)}
```
**Fetching:** `useEffect` runs side effects (like API calls):
```jsx
const [courses, setCourses] = useState([]);
useEffect(() => {
  fetch(''https://api.example.com/courses'')
    .then((res) => res.json())
    .then(setCourses)
    .catch(console.error);
}, []);
```
Always handle the 3 UI states: **loading** (spinner/skeleton), **error** (friendly message + retry), **data** (the list). Apps without these feel broken even when the code works.

## 💡 Real-world example
Users forgive a 2-second load with a skeleton screen; they rage-quit a frozen blank page. Loading states are UX, not decoration.

## ✍️ Practical
1. Render a list of 5 courses from an array with map + key.
2. Fetch data from any free API (e.g. dummyjson.com/products) with loading & error states.
3. Display results as cards.

## ✅ Checklist
- [ ] Lists render with keys
- [ ] Fetch with loading + error handled
- [ ] Cards display real data' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional' and le.title = 'Lists, Fetching Data & Showing Real Content'
)
update public.course_lessons le
   set resources = '[{"title":"React docs — data fetching","url":"https://react.dev/learn","type":"docs"},{"title":"React Notes for Professionals — free PDF","url":"https://goalkicker.com/ReactBook/","type":"pdf"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional' and le.title = 'Lists, Fetching Data & Showing Real Content'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=CgkZ7MvWUAA', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=CgkZ7MvWUAA'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Capstone: Deploy a Portfolio Site & Get Hired', 'project', '22 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Capstone: Deploy a Portfolio Site & Get Hired'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional'
)
update public.course_lessons le set type = 'project'
  from m where le.module_id = m.module_id and le.title = 'Capstone: Deploy a Portfolio Site & Get Hired';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional' and le.title = 'Capstone: Deploy a Portfolio Site & Get Hired'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Building your developer portfolio site
- Git/GitHub basics + free deployment
- The first-jobs roadmap

## 📖 Lesson
**Portfolio site checklist:** hero (name + what you do + CTA), projects (3 best, each with screenshot + link + 2-line story), about + skills, contact. Build it in React or plain HTML/CSS — polish beats framework.

**Git basics:** `git init`, `git add .`, `git commit -m "message"`, push to a GitHub repository. Every project on GitHub = public proof of skill.

**Deploy free:** connect the GitHub repo to Netlify/Vercel — every push goes live automatically. You now have a URL to put on every application and WhatsApp bio.

**First-jobs roadmap:**
1. Finish freeCodeCamp Responsive Web Design + JS certifications (free, respected)
2. Build 3 real projects (business sites for real people beat todo-lists)
3. Apply: local agencies, remote junior listings, freelance platforms
4. Keep shipping weekly — consistency beats talent

## 💡 Real-world example
A graduate built free websites for two local businesses, documented them on GitHub, and was hired by an agency that found the repos. Proof > certificates.

## ✍️ Practical
1. Sketch and build your portfolio (hero + 3 project slots).
2. Push it to GitHub and deploy on Netlify.
3. Share the live URL with 3 people for feedback.

## ✅ Checklist
- [ ] Portfolio live at a real URL
- [ ] Code on GitHub
- [ ] Certification roadmap started' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional' and le.title = 'Capstone: Deploy a Portfolio Site & Get Hired'
)
update public.course_lessons le
   set resources = '[{"title":"Netlify — free frontend hosting","url":"https://www.netlify.com/","type":"tool"},{"title":"GitHub — host your code","url":"https://github.com/","type":"tool"},{"title":"freeCodeCamp — free interactive certifications","url":"https://www.freecodecamp.org/learn/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'frontend-web-development' and mo.title = 'Module 4: React & Going Professional' and le.title = 'Capstone: Deploy a Portfolio Site & Get Hired'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=CgkZ7MvWUAA', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=CgkZ7MvWUAA'
);

with c as (select id from public.courses where slug = 'frontend-web-development')
insert into public.quizzes (course_id, title, description, passing_score, allow_retake, is_final, status, attempt_limit)
select c.id, 'Final Assessment — Frontend Web Development', 'Final assessment — pass to move toward your certificate.', 70, true, true, 'published', null from c
where not exists (
  select 1 from public.quizzes z where z.course_id = c.id and z.title = 'Final Assessment — Frontend Web Development'
);
update public.quizzes z set lesson_id = le.id
  from public.course_lessons le
 where z.course_id = le.course_id and le.title = 'Capstone: Deploy a Portfolio Site & Get Hired'
   and z.title = 'Final Assessment — Frontend Web Development' and exists (select 1 from public.courses c where c.id = z.course_id and c.slug = 'frontend-web-development');
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'frontend-web-development' and z.title = 'Final Assessment — Frontend Web Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'HTML is responsible for…', '["Page structure and meaning","Styling","Server databases","Animations only"]'::jsonb,
0, '[]'::jsonb,
'HTML provides the semantic structure; CSS styles; JavaScript adds behavior.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'HTML is responsible for…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'frontend-web-development' and z.title = 'Final Assessment — Frontend Web Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Which CSS property creates space INSIDE an element’s border?', '["margin","padding","gap","outline"]'::jsonb,
1, '[]'::jsonb,
'Padding is inner space; margin is outer space.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which CSS property creates space INSIDE an element’s border?'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'frontend-web-development' and z.title = 'Final Assessment — Frontend Web Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'display: flex primarily helps with…', '["One-dimensional layout along a row or column","Databases","HTTP requests","Fonts"]'::jsonb,
0, '[]'::jsonb,
'Flexbox distributes items along one axis — the workhorse of UI layout.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'display: flex primarily helps with…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'frontend-web-development' and z.title = 'Final Assessment — Frontend Web Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'JavaScript can change page content without reloading the page.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'DOM manipulation is the core of interactive frontends.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'JavaScript can change page content without reloading the page.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'frontend-web-development' and z.title = 'Final Assessment — Frontend Web Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_answer', 'Which are semantic HTML elements? (Select all that apply)', '["<nav>","<article>","<div>","<footer>"]'::jsonb,
null, '[0,1,3]'::jsonb,
'nav/article/footer describe meaning; div is a generic container.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which are semantic HTML elements? (Select all that apply)'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'frontend-web-development' and z.title = 'Final Assessment — Frontend Web Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'In React, useState is used to…', '["Store and update component state","Fetch images","Style components","Define routes"]'::jsonb,
0, '[]'::jsonb,
'useState gives a component memory that triggers re-renders when it changes.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'In React, useState is used to…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'frontend-web-development' and z.title = 'Final Assessment — Frontend Web Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A responsive website is one that…', '["Loads fast only on desktop","Adapts its layout to different screen sizes","Uses only images","Has no CSS"]'::jsonb,
1, '[]'::jsonb,
'Media queries, fluid layouts and flexible images adapt design to any device.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A responsive website is one that…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'frontend-web-development' and z.title = 'Final Assessment — Frontend Web Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Which HTTP status code means "Not Found"?', '["200","404","500","301"]'::jsonb,
1, '[]'::jsonb,
'404 = resource not found; 200 = OK; 500 = server error; 301 = redirect.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which HTTP status code means "Not Found"?'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'frontend-web-development' and z.title = 'Final Assessment — Frontend Web Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Git is used by developers mainly for…', '["Version control and collaboration","Designing logos","Email","Compiling images"]'::jsonb,
0, '[]'::jsonb,
'Git tracks history and enables team collaboration on code.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Git is used by developers mainly for…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'frontend-web-development' and z.title = 'Final Assessment — Frontend Web Development')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Alt text on images improves accessibility and SEO.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Alt text serves screen readers and search engines — always include it.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Alt text on images improves accessibility and SEO.'
);
with c as (select id from public.courses where slug = 'frontend-web-development')
insert into public.assignments (course_id, title, description, instructions, required_output, max_score, is_final_project, status)
select c.id, 'Final Project: Responsive Business Website', 'Build and deploy a responsive multi-section website for a business using HTML, CSS and JavaScript.', '1) Requirements: semantic HTML, responsive layout (mobile-first), at least one interactive feature built with JavaScript (menu toggle, form validation, gallery, or dark-mode switch).
2) Include: header/nav, hero, services/features section, about, contact form (validated with JS), footer.
3) Use Flexbox or Grid deliberately; test at 3 screen widths.
4) Deploy the site (GitHub Pages, Netlify or similar).', 'Deployed site URL + repository link + a short README explaining your structure and the interactive feature.', 100, true, 'published' from c
where not exists (
  select 1 from public.assignments a where a.course_id = c.id and a.title = 'Final Project: Responsive Business Website'
);
update public.assignments a set lesson_id = le.id
  from public.course_lessons le
 where a.course_id = le.course_id and le.title = 'Capstone: Deploy a Portfolio Site & Get Hired'
   and a.title = 'Final Project: Responsive Business Website' and exists (select 1 from public.courses c where c.id = a.course_id and c.slug = 'frontend-web-development');
with c as (select id from public.courses where slug = 'frontend-web-development')
insert into public.course_completion_rules (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project)
select c.id, 100, 70, 0, true from c
on conflict (course_id) do update
  set require_lessons_pct = excluded.require_lessons_pct,
      require_quiz_avg = excluded.require_quiz_avg,
      require_assignments_approved = excluded.require_assignments_approved,
      require_final_project = excluded.require_final_project,
      updated_at = now();

-- ---------- web-design-wordpress ----------
with c as (select id from public.courses where slug = 'web-design-wordpress')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 1: WordPress Foundations', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 1: WordPress Foundations'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Why WordPress Powers 40%+ of the Web', 'video', '13 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Why WordPress Powers 40%+ of the Web'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Why WordPress Powers 40%+ of the Web';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations' and le.title = 'Why WordPress Powers 40%+ of the Web'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- What WordPress is and why businesses choose it
- WordPress.org vs WordPress.com
- The skills that make you money with it

## 📖 Lesson
WordPress is a free, open-source website builder that powers over 40% of all websites — from blogs to newspapers to online stores. Businesses choose it because: they own it (no platform lock-in), thousands of free themes/plugins extend it, and any developer can maintain it.

**Key distinction:**
- **WordPress.org** = the free software you install on your own hosting (full control — this is what professionals use)
- **WordPress.com** = a hosted service (limited on free tiers)

Money skills in order: build business sites → customize themes → maintain/update sites monthly (retainers!) → add stores (WooCommerce) → speed & SEO services.

The dashboard (your control room) lives at `yoursite.com/wp-admin` — everything in this course happens there.

## 💡 Real-world example
Most Nigerian SME websites you''ve visited — schools, churches, event brands — run on WordPress. Every one of them needed (and paid) someone to build it.

## ✍️ Practical
1. Visit 5 local business websites; check if they run WordPress (view source, search "wp-content").
2. Count how many of 5 do — note the opportunity.
3. Read one lesson on learn.wordpress.org.

## ✅ Checklist
- [ ] I know .org vs .com difference
- [ ] I checked 5 real sites
- [ ] I can name 5 WordPress money skills' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations' and le.title = 'Why WordPress Powers 40%+ of the Web'
)
update public.course_lessons le
   set resources = '[{"title":"Learn WordPress — official free courses","url":"https://learn.wordpress.org/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations' and le.title = 'Why WordPress Powers 40%+ of the Web'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=jhu0c6BdmjI', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=jhu0c6BdmjI'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Domains, Hosting & Installing WordPress', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Domains, Hosting & Installing WordPress'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Domains, Hosting & Installing WordPress';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations' and le.title = 'Domains, Hosting & Installing WordPress'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Choosing a domain name clients keep
- Hosting options and what matters
- One-click install + first settings

## 📖 Lesson
**Domain** (the name): short, spellable, no hyphens/numbers, prefer .com or .ng for local trust. Check availability before falling in love with a name.

**Hosting** (the home): for starters, shared hosting with one-click WordPress install works. What matters: SSL included (https padlock), decent uptime, responsive support. WordPress itself is free — hosting + domain are the only unavoidable costs.

**Installation:** most hosts offer "Install WordPress" in the control panel. After install, log into wp-admin and immediately:
1. Settings → General: site title + tagline
2. Settings → Permalinks → "Post name" (clean URLs: /about not /?p=123)
3. Users → change the default "admin" username, strong password
4. Delete the sample post/page/comment

## 💡 Real-world example
A client''s site ranked poorly with URLs like /?p=413. Switching permalinks to /services made links readable and shareable — a 30-second setting with lasting benefit.

## ✍️ Practical
1. Brainstorm 5 domain names for a practice business.
2. Walk through a host''s WordPress installer (even a free trial/local setup).
3. Apply the 4 first-settings steps.

## ✅ Checklist
- [ ] Domain naming rules known
- [ ] Install flow understood
- [ ] First 4 settings applied' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations' and le.title = 'Domains, Hosting & Installing WordPress'
)
update public.course_lessons le
   set resources = '[{"title":"WordPress official documentation","url":"https://wordpress.org/support/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations' and le.title = 'Domains, Hosting & Installing WordPress'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=jhu0c6BdmjI', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=jhu0c6BdmjI'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'The Dashboard Deep Tour', 'video', '14 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'The Dashboard Deep Tour'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'The Dashboard Deep Tour';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations' and le.title = 'The Dashboard Deep Tour'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Every main dashboard area and its job
- Posts vs Pages (the #1 beginner confusion)
- Media library habits that scale

## 📖 Lesson
Dashboard map:
- **Posts** → blog/news items, dated, grouped by categories/tags
- **Pages** → timeless content: Home, About, Services, Contact
- **Media** → all uploaded files
- **Appearance** → themes, menus, widgets, editor
- **Plugins** → add features (forms, stores, SEO)
- **Users** → roles: Administrator (all), Editor (content), Author/Contributor (own posts), Subscriber (read)

**Rule:** pages for structure, posts for streams. "Services" = page; "5 tips for healthy skin" = post.

**Media habits:** name files descriptically BEFORE upload (blue-sneakers.jpg not IMG_2213.jpg), compress images to under ~200KB (speed!), organize with folders/months.

## 💡 Real-world example
A blogger uploaded 4MB phone photos for months — the site crawled. One afternoon of compression made it load 4× faster. Name and shrink before you upload.

## ✍️ Practical
1. Create 3 pages (Home, About, Contact) and 2 posts.
2. Set one page as the static homepage (Settings → Reading).
3. Upload a compressed, well-named image.

## ✅ Checklist
- [ ] Posts vs pages clear
- [ ] Static homepage set
- [ ] Images compressed & named' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations' and le.title = 'The Dashboard Deep Tour'
)
update public.course_lessons le
   set resources = '[{"title":"WordPress official documentation","url":"https://wordpress.org/support/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations' and le.title = 'The Dashboard Deep Tour'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=jhu0c6BdmjI', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=jhu0c6BdmjI'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Gutenberg Editor: Building Content Beautifully', 'video', '15 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Gutenberg Editor: Building Content Beautifully'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Gutenberg Editor: Building Content Beautifully';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations' and le.title = 'Gutenberg Editor: Building Content Beautifully'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Block-based editing mastery
- Columns, buttons, covers & reusable blocks
- Layouts that read well on every screen

## 📖 Lesson
Gutenberg builds pages from **blocks**: paragraphs, headings, images, buttons, columns, galleries, covers. Click "+" → pick a block → fill it. Every design is blocks stacked and nested.

Power moves:
- **Columns block** → side-by-side content (features, team)
- **Cover block** → hero sections with background image + text
- **Buttons block** → clear CTAs
- **Reusable blocks** → build once (e.g. your CTA banner), insert everywhere; edit once, updates everywhere

Layout discipline: one idea per section, generous spacing (blocks have spacing controls), max 2 fonts, mobile check before publish (the editor''s preview button has a mobile view — use it).

## 💡 Real-world example
A consultant built her signature "Book a call" banner as a reusable block. When her calendar link changed, she edited ONE block — updated on 14 pages instantly.

## ✍️ Practical
1. Build a homepage: Cover hero → 3-column features → CTA button.
2. Create one reusable block and insert it on 2 pages.
3. Preview on mobile before saving.

## ✅ Checklist
- [ ] Hero + columns + CTA built
- [ ] Reusable block working
- [ ] Mobile preview checked' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations' and le.title = 'Gutenberg Editor: Building Content Beautifully'
)
update public.course_lessons le
   set resources = '[{"title":"Learn WordPress — official free courses","url":"https://learn.wordpress.org/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 1: WordPress Foundations' and le.title = 'Gutenberg Editor: Building Content Beautifully'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=09gj5gM4V98', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=09gj5gM4V98'
);

with c as (select id from public.courses where slug = 'web-design-wordpress')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 2: Themes & Page Builders', 1 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 2: Themes & Page Builders'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Choosing & Customizing Themes', 'video', '15 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Choosing & Customizing Themes'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Choosing & Customizing Themes';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders' and le.title = 'Choosing & Customizing Themes'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- What a theme really controls
- Evaluating themes like a professional
- The Customizer + child theme concept

## 📖 Lesson
A **theme** controls your site''s entire look. Choosing well:
- **Lightweight first** (Astra, GeneratePress, Kadence, Blocksy) — fast sites rank better
- Regularly updated + good reviews + active installs
- Works with Gutenberg (the native editor)
- Free version is enough to start; Pro adds headers/footers control

Customize via **Appearance → Customize** or the Site Editor: logo, colors, fonts, header/footer layout. Keep it minimal — a clean default theme with good content beats a flashy cluttered one.

**Child themes:** a separate tiny theme that inherits from the parent. Custom code goes in the child so theme updates never erase your changes. Learn to make one before doing client work.

## 💡 Real-world example
A designer customized a theme''s code directly. The next update wiped every change. Since then: child theme for every client — updates stay safe.

## ✍️ Practical
1. Install and activate a lightweight free theme.
2. Customize logo, colors, fonts via the Customizer.
3. Read one guide on child themes and note when to use one.

## ✅ Checklist
- [ ] Lightweight theme active
- [ ] Branding customized
- [ ] Child theme purpose understood' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders' and le.title = 'Choosing & Customizing Themes'
)
update public.course_lessons le
   set resources = '[{"title":"Learn WordPress — official free courses","url":"https://learn.wordpress.org/","type":"course"},{"title":"WordPress official documentation","url":"https://wordpress.org/support/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders' and le.title = 'Choosing & Customizing Themes'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=09gj5gM4V98', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=09gj5gM4V98'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Page Builders: Elementor Essentials', 'video', '17 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Page Builders: Elementor Essentials'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Page Builders: Elementor Essentials';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders' and le.title = 'Page Builders: Elementor Essentials'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- When a page builder beats the default editor
- Elementor sections, columns & widgets
- Designing without creating slow pages

## 📖 Lesson
Page builders (Elementor being the most popular) offer drag-and-drop visual design with pro widgets — headings, icons, sliders, forms, testimonials — no code.

Elementor structure: **Section → Column → Widget**. Workflow: add section (choose column layout) → drag widgets in → style each (Content / Style / Advanced tabs) → set responsive tweaks per device (mobile icon in the panel).

Speed discipline (builders can bloat):
- One builder plugin only, no overlapping addons
- Compress images before upload
- Keep animations subtle and few
- Test speed after building (PageSpeed Insights)

Free Elementor covers most client needs; Pro adds forms, popups, theme building.

## 💡 Real-world example
An agency delivers all brochure sites in Elementor: clients edit text themselves visually, cutting "please change this word" support requests by 90%.

## ✍️ Practical
1. Install Elementor; build a 3-section landing page.
2. Add an icon-box row and a testimonial section.
3. Check mobile view and fix any overflow.

## ✅ Checklist
- [ ] Section→column→widget fluent
- [ ] 3-section page built
- [ ] Mobile view clean' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders' and le.title = 'Page Builders: Elementor Essentials'
)
update public.course_lessons le
   set resources = '[{"title":"Elementor — page builder academy","url":"https://elementor.com/academy/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders' and le.title = 'Page Builders: Elementor Essentials'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=JNwTkewgRls', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=JNwTkewgRls'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Menus, Navigation & Site Structure', 'video', '13 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Menus, Navigation & Site Structure'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Menus, Navigation & Site Structure';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders' and le.title = 'Menus, Navigation & Site Structure'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Designing navigation visitors actually use
- Building menus and dropdowns
- Footers that convert

## 📖 Lesson
Navigation is a map — if visitors get lost, they leave. Best practices:
- Max 5–7 top-level items
- Order: Home • Services/Products • About • Contact (+ Blog if active)
- Dropdowns one level deep only
- Clear CTA button in the menu ("Book Now", "Get Quote")

Build in Appearance → Menus: create menu → add pages → drag to nest dropdowns → assign to "Primary" location. Mobile menus collapse automatically — test them.

**Footer:** repeat key links + contact info + one CTA. Visitors who scroll to the bottom are interested — give them an easy next step.

## 💡 Real-world example
A law firm reduced menu items from 11 to 5 and added a "Free Consultation" button. Consultation clicks tripled — clarity converts.

## ✍️ Practical
1. Build a primary menu with one dropdown + CTA button.
2. Design a footer with links, contacts, CTA.
3. Test navigation on mobile.

## ✅ Checklist
- [ ] ≤7 menu items
- [ ] One-level dropdown max
- [ ] Footer CTA added' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders' and le.title = 'Menus, Navigation & Site Structure'
)
update public.course_lessons le
   set resources = '[{"title":"WordPress official documentation","url":"https://wordpress.org/support/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders' and le.title = 'Menus, Navigation & Site Structure'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=jhu0c6BdmjI', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=jhu0c6BdmjI'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Essential Plugins (and What NOT to Install)', 'video', '15 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Essential Plugins (and What NOT to Install)'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Essential Plugins (and What NOT to Install)';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders' and le.title = 'Essential Plugins (and What NOT to Install)'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 6 plugins every site needs
- Plugin safety rules
- Keeping the site lean and fast

## 📖 Lesson
Plugins add features — and risk. Every plugin is code that must be maintained. **The best plugin count is the lowest one that works.**

The essential 6:
1. **SEO** — Rank Math or Yoast (guides your optimization)
2. **Security** — Wordfence or Solid Security (firewall + login protection)
3. **Backups** — UpdraftPlus (scheduled, stored off-site like Google Drive)
4. **Caching/speed** — WP Super Cache or host-provided caching
5. **Forms** — WPForms Lite or Contact Form 7
6. **Analytics** — Site Kit by Google (connects Search Console + Analytics)

Safety rules: install from the official directory, check last-updated date + reviews, never run 2 plugins doing the same job, update regularly, backup BEFORE every update.

## 💡 Real-world example
A site with 42 plugins crawled and crashed monthly. Slimmed to 9, it loads in under 2 seconds and hasn''t broken since.

## ✍️ Practical
1. Install the essential 6 (SEO, security, backup, cache, form, analytics).
2. Configure a daily backup to cloud storage.
3. Create a contact form and place it on the Contact page.

## ✅ Checklist
- [ ] 6 essentials installed
- [ ] Backups scheduled off-site
- [ ] Contact form live' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders' and le.title = 'Essential Plugins (and What NOT to Install)'
)
update public.course_lessons le
   set resources = '[{"title":"WordPress official documentation","url":"https://wordpress.org/support/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 2: Themes & Page Builders' and le.title = 'Essential Plugins (and What NOT to Install)'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=09gj5gM4V98', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=09gj5gM4V98'
);

with c as (select id from public.courses where slug = 'web-design-wordpress')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 3: Content, Commerce & Forms', 2 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 3: Content, Commerce & Forms'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Blogging for Business: Categories, Tags & SEO Posts', 'video', '15 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Blogging for Business: Categories, Tags & SEO Posts'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Blogging for Business: Categories, Tags & SEO Posts';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms' and le.title = 'Blogging for Business: Categories, Tags & SEO Posts'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Structuring a blog that attracts customers
- Categories vs tags done right
- Writing one SEO-friendly post end-to-end

## 📖 Lesson
A business blog answers the questions customers Google. Structure:
- **Categories** = 3–5 big topics (the site''s shelves), e.g. "Hair Care • Styles • Products"
- **Tags** = specific details, used sparingly ("braids", "locs")
- Post formula: question as title → direct answer early → sections with H2s → images with alt text → internal links to service pages → CTA

With an SEO plugin: set your focus keyphrase, follow its checklist (keyphrase in title, first paragraph, one H2, meta description). Aim for genuinely helpful 600+ words.

Consistency: one solid post weekly beats five rushed ones.

## 💡 Real-world example
A plumber published "How much does bathroom plumbing cost in Lagos?" — a real question with real numbers. It ranks and brings calls monthly, two years later.

## ✍️ Practical
1. Define 3 categories for a business blog.
2. Write one complete post using the formula.
3. Run the SEO plugin checklist to green.

## ✅ Checklist
- [ ] 3–5 categories set
- [ ] Post follows the formula
- [ ] SEO checklist green' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms' and le.title = 'Blogging for Business: Categories, Tags & SEO Posts'
)
update public.course_lessons le
   set resources = '[{"title":"Learn WordPress — official free courses","url":"https://learn.wordpress.org/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms' and le.title = 'Blogging for Business: Categories, Tags & SEO Posts'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=09gj5gM4V98', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=09gj5gM4V98'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Forms, Bookings & Lead Capture', 'video', '14 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Forms, Bookings & Lead Capture'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Forms, Bookings & Lead Capture';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms' and le.title = 'Forms, Bookings & Lead Capture'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Building forms that get completed
- Anti-spam protection
- Where leads actually go (email/WhatsApp)

## 📖 Lesson
Every business site needs a lead path. Form best practices:
- Fewer fields = more submissions (name + phone/email + message is enough)
- Clear button text: "Get My Quote" beats "Submit"
- Confirmation message tells what happens next ("We reply within 24h")
- Add **honeypot/reCAPTCHA** anti-spam (built into most form plugins)

Delivery matters more than design: route submissions to an email you actually check, and consider a WhatsApp click-to-chat button for instant leads (huge in Nigeria).

Also learn: booking plugins for appointments (calendars, time slots) — barbers, consultants and clinics pay well for this.

## 💡 Real-world example
A studio cut its form from 9 fields to 3 and added "We reply within 24 hours". Enquiries doubled in a month.

## ✍️ Practical
1. Build a 3-field lead form with a strong button label.
2. Enable anti-spam protection.
3. Add a WhatsApp click-to-chat button site-wide.

## ✅ Checklist
- [ ] ≤3–4 fields
- [ ] Anti-spam active
- [ ] WhatsApp path added' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms' and le.title = 'Forms, Bookings & Lead Capture'
)
update public.course_lessons le
   set resources = '[{"title":"WordPress official documentation","url":"https://wordpress.org/support/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms' and le.title = 'Forms, Bookings & Lead Capture'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=JNwTkewgRls', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=JNwTkewgRls'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'WooCommerce: Turning WordPress into a Store', 'video', '18 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'WooCommerce: Turning WordPress into a Store'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'WooCommerce: Turning WordPress into a Store';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms' and le.title = 'WooCommerce: Turning WordPress into a Store'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Store setup: products, payments, shipping
- Product pages that sell
- Nigerian payment options

## 📖 Lesson
**WooCommerce** (free plugin) makes WordPress a full online store.

Setup flow:
1. Install WooCommerce → run the setup wizard
2. Set currency, location, tax basics
3. Add products: title, price, great photos, short benefit-driven description, categories
4. **Payments:** enable bank transfer out of the box; for cards, use a Paystack/Flutterwave WooCommerce plugin (both Nigerian, both reliable)
5. Shipping: flat rate or free-over-threshold to start

Product page rules: multiple photos (real, well-lit), price always visible, "Add to cart" above the fold, trust signals (reviews, delivery info) near the button.

Start with 5–10 great products rather than 100 poor ones.

## 💡 Real-world example
A fashion brand moved from Instagram-only sales to WooCommerce + Paystack: customers pay themselves, orders arrive formatted — she stopped manually confirming transfers.

## ✍️ Practical
1. Install WooCommerce and run the wizard.
2. Add 3 products with real-looking photos and prices.
3. Enable bank transfer + one card gateway (test mode).

## ✅ Checklist
- [ ] Wizard completed
- [ ] 3 products live
- [ ] Payment methods configured' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms' and le.title = 'WooCommerce: Turning WordPress into a Store'
)
update public.course_lessons le
   set resources = '[{"title":"WooCommerce docs","url":"https://woocommerce.com/documentation/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms' and le.title = 'WooCommerce: Turning WordPress into a Store'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=09gj5gM4V98', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=09gj5gM4V98'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Users, Roles & Content Updates Workflow', 'video', '13 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Users, Roles & Content Updates Workflow'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Users, Roles & Content Updates Workflow';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms' and le.title = 'Users, Roles & Content Updates Workflow'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Roles and least-privilege security
- Handing a site to a client safely
- Update routines that never break sites

## 📖 Lesson
Give everyone the **least** access that works:
- Client staff who write posts → **Editor** or **Author**
- Someone managing products → WooCommerce-specific roles
- Full **Administrator** only for people who install plugins/themes

Handover checklist: create the client''s account at the right role, remove your admin when done (or keep one named account for support), document passwords in a manager, never share one login.

**Update routine (weekly, 10 minutes):**
1. Backup now
2. Update plugins → theme → WordPress core, one at a time
3. Check key pages + forms after each
Updates prevent hacks (most breaches exploit outdated plugins) — maintenance is a paid service, not a chore.

## 💡 Real-world example
A site went 2 years without updates and was defaced. The cleanup cost 10× what a maintenance plan would have. Sell the routine, don''t dread it.

## ✍️ Practical
1. Create an Editor user and test what they can/can''t do.
2. Write a 5-step weekly update checklist.
3. Define a maintenance package you could sell.

## ✅ Checklist
- [ ] Roles understood & applied
- [ ] Update checklist written
- [ ] Maintenance offer drafted' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms' and le.title = 'Users, Roles & Content Updates Workflow'
)
update public.course_lessons le
   set resources = '[{"title":"WordPress official documentation","url":"https://wordpress.org/support/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 3: Content, Commerce & Forms' and le.title = 'Users, Roles & Content Updates Workflow'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=jhu0c6BdmjI', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=jhu0c6BdmjI'
);

with c as (select id from public.courses where slug = 'web-design-wordpress')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 4: Launch, SEO & Client Websites', 3 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 4: Launch, SEO & Client Websites'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Speed, Security & Launch Checklist', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Speed, Security & Launch Checklist'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Speed, Security & Launch Checklist';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites' and le.title = 'Speed, Security & Launch Checklist'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Making sites load in under 3 seconds
- Security hardening basics
- The complete pre-launch checklist

## 📖 Lesson
**Speed** (visitors leave after ~3s; Google ranks slower sites lower):
- Compress images before upload; use modern formats (WebP)
- Caching plugin ON
- Remove unused plugins/themes
- Test on PageSpeed Insights; aim green on mobile

**Security:**
- Strong unique passwords; change the default login URL if needed
- Security plugin firewall active
- Off-site backups scheduled
- HTTPS everywhere (SSL from host)

**Launch checklist:** favicon + site title set • contact form tested end-to-end • links checked • no "lorem ipsum" anywhere • analytics installed • mobile pass • one real test order (if store) • backup taken.

## 💡 Real-world example
A launched store got its first real order — to a broken email address. The contact-form test step now sits at the top of every checklist.

## ✍️ Practical
1. Run PageSpeed Insights on your practice site; fix the top 2 issues.
2. Complete the full launch checklist item by item.
3. Send yourself a test form submission.

## ✅ Checklist
- [ ] Speed: green targets
- [ ] Security: 4 hardening steps done
- [ ] Launch checklist complete' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites' and le.title = 'Speed, Security & Launch Checklist'
)
update public.course_lessons le
   set resources = '[{"title":"Google PageSpeed Insights","url":"https://pagespeed.web.dev/","type":"tool"},{"title":"WordPress official documentation","url":"https://wordpress.org/support/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites' and le.title = 'Speed, Security & Launch Checklist'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=JNwTkewgRls', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=JNwTkewgRls'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'WordPress SEO: Rank Math/Yoast in Practice', 'video', '16 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'WordPress SEO: Rank Math/Yoast in Practice'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'WordPress SEO: Rank Math/Yoast in Practice';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites' and le.title = 'WordPress SEO: Rank Math/Yoast in Practice'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- On-page SEO inside WordPress
- Search Console: your free ranking dashboard
- Local SEO for Nigerian businesses

## 📖 Lesson
With an SEO plugin, each page gets a checklist box:
1. **Focus keyphrase** — what someone would type ("wedding photographer abuja")
2. Title contains it, near the front
3. Keyphrase in first paragraph + one H2
4. Meta description written (your ad in search results)
5. Image alt texts + internal links

**Google Search Console** (free): verify the site (the plugin helps), submit your sitemap, and watch which queries you appear for. Optimize pages already on position 5–15 first — easiest wins.

**Local SEO:** Google Business Profile + consistent Name/Address/Phone everywhere + reviews. Local searches ("near me") convert the best for SMEs.

## 💡 Real-world example
A photographer ranked #3 for "wedding photographer abuja" after 3 months of focused pages — booked out the season from one search phrase.

## ✍️ Practical
1. Optimize 2 pages to green with the SEO plugin.
2. Verify the site in Search Console + submit sitemap.
3. Set up a Google Business Profile entry.

## ✅ Checklist
- [ ] 2 pages optimized green
- [ ] Search Console verified
- [ ] Local profile created' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites' and le.title = 'WordPress SEO: Rank Math/Yoast in Practice'
)
update public.course_lessons le
   set resources = '[{"title":"Google SEO Starter Guide","url":"https://developers.google.com/search/docs/fundamentals/seo-starter-guide","type":"pdf"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites' and le.title = 'WordPress SEO: Rank Math/Yoast in Practice'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=09gj5gM4V98', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=09gj5gM4V98'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Client Projects: Brief to Handover', 'video', '17 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Client Projects: Brief to Handover'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Client Projects: Brief to Handover';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites' and le.title = 'Client Projects: Brief to Handover'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Running WordPress client projects professionally
- Pricing website projects in Nigeria
- Contracts, deposits and handover packs

## 📖 Lesson
**Process:** Discovery call (goals, pages, content who-provides-what) → written quote + timeline → 60–70% deposit → build on a staging/dev link → 2 revision rounds → final payment → launch → handover training.

**Pricing guide (starter market):** 5-page brochure site ₦80k–₦250k; with WooCommerce ₦150k–₦400k; maintenance retainers ₦15k–₦50k/month. Price by value delivered, not hours spent.

**Contract essentials:** scope (exact page list), revision count, content responsibility, timeline, payment schedule, what''s NOT included (e.g. logo design, content writing).

**Handover pack:** 1-hour training recording (how to post/edit), credentials in a password manager share, support terms. Handover quality is what earns referrals.

## 💡 Real-world example
A designer who records a handover video for every client gets referred constantly — clients feel empowered, not abandoned.

## ✍️ Practical
1. Write your quote template with scope + payment schedule.
2. Define your 3 website packages (brochure / store / retainer).
3. Draft a handover checklist.

## ✅ Checklist
- [ ] Quote template ready
- [ ] 3 packages priced
- [ ] Handover checklist drafted' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites' and le.title = 'Client Projects: Brief to Handover'
)
update public.course_lessons le
   set resources = '[{"title":"Learn WordPress — official free courses","url":"https://learn.wordpress.org/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites' and le.title = 'Client Projects: Brief to Handover'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=JNwTkewgRls', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=JNwTkewgRls'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Capstone: Build & Launch a Complete Business Website', 'project', '24 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Capstone: Build & Launch a Complete Business Website'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites'
)
update public.course_lessons le set type = 'project'
  from m where le.module_id = m.module_id and le.title = 'Capstone: Build & Launch a Complete Business Website';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites' and le.title = 'Capstone: Build & Launch a Complete Business Website'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Delivering a full professional website
- Quality standards that separate pros
- Turning the capstone into paid work

## 📖 Lesson
Build a complete 5+ page site for a real or practice business:
1. **Home** — hero with CTA, services summary, proof, contact strip
2. **Services** (or Products) — clear offers
3. **About** — story + team + trust photos
4. **Blog** — 2 posts with categories
5. **Contact** — form + WhatsApp + map/address

Quality bar for each page: mobile-first, fast (compressed images + cache), one clear CTA, no placeholder text, menus ≤7 items, SEO checklist green on every page.

Finish with the full launch checklist, then: screenshot every page for your portfolio, write a 5-line case study (problem → solution → result), and pitch it to 3 similar businesses.

Next steps: WooCommerce deep-dive, speed optimization services, and building your own agency site — in WordPress, of course.

## 💡 Real-world example
Capstone sites built for real businesses became students'' first portfolio AND first paid maintenance retainers — one project, three income streams.

## ✍️ Practical
1. Build all 5 pages to the quality bar.
2. Pass the launch checklist completely.
3. Publish case study + pitch 3 businesses.

## ✅ Checklist
- [ ] 5+ pages live and fast
- [ ] Launch checklist passed
- [ ] Case study + pitches sent' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites' and le.title = 'Capstone: Build & Launch a Complete Business Website'
)
update public.course_lessons le
   set resources = '[{"title":"Learn WordPress — official free courses","url":"https://learn.wordpress.org/","type":"course"},{"title":"Elementor — page builder academy","url":"https://elementor.com/academy/","type":"course"},{"title":"WordPress official documentation","url":"https://wordpress.org/support/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'web-design-wordpress' and mo.title = 'Module 4: Launch, SEO & Client Websites' and le.title = 'Capstone: Build & Launch a Complete Business Website'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=JNwTkewgRls', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=JNwTkewgRls'
);

with c as (select id from public.courses where slug = 'web-design-wordpress')
insert into public.quizzes (course_id, title, description, passing_score, allow_retake, is_final, status, attempt_limit)
select c.id, 'Final Assessment — Web Design with WordPress', 'Final assessment — pass to move toward your certificate.', 70, true, true, 'published', null from c
where not exists (
  select 1 from public.quizzes z where z.course_id = c.id and z.title = 'Final Assessment — Web Design with WordPress'
);
update public.quizzes z set lesson_id = le.id
  from public.course_lessons le
 where z.course_id = le.course_id and le.title = 'Capstone: Build & Launch a Complete Business Website'
   and z.title = 'Final Assessment — Web Design with WordPress' and exists (select 1 from public.courses c where c.id = z.course_id and c.slug = 'web-design-wordpress');
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'web-design-wordpress' and z.title = 'Final Assessment — Web Design with WordPress')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'WordPress.org differs from WordPress.com because WordPress.org…', '["Is the free software you host yourself","Only works on phones","Is a paid-only service","Cannot use plugins"]'::jsonb,
0, '[]'::jsonb,
'WordPress.org = self-hosted software with full control; WordPress.com is a hosted service.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'WordPress.org differs from WordPress.com because WordPress.org…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'web-design-wordpress' and z.title = 'Final Assessment — Web Design with WordPress')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'In WordPress, "pages" are best for…', '["Timeless content like About and Contact","Daily news posts","Photos only","Plugins"]'::jsonb,
0, '[]'::jsonb,
'Pages are structural/timeless; posts are dated stream content.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'In WordPress, "pages" are best for…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'web-design-wordpress' and z.title = 'Final Assessment — Web Design with WordPress')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'You should back up a WordPress site before updating plugins.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Updates occasionally break things — a backup makes recovery trivial.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'You should back up a WordPress site before updating plugins.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'web-design-wordpress' and z.title = 'Final Assessment — Web Design with WordPress')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A child theme is used to…', '["Customize safely without losing changes on parent updates","Make the site load slower","Replace hosting","Add a blog"]'::jsonb,
0, '[]'::jsonb,
'Child themes inherit the parent but keep your custom code safe from updates.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A child theme is used to…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'web-design-wordpress' and z.title = 'Final Assessment — Web Design with WordPress')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Which plugin type adds an online store to WordPress?', '["WooCommerce","SEO plugin","Backup plugin","Form plugin"]'::jsonb,
0, '[]'::jsonb,
'WooCommerce is the standard WordPress e-commerce plugin.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which plugin type adds an online store to WordPress?'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'web-design-wordpress' and z.title = 'Final Assessment — Web Design with WordPress')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_answer', 'Which practices improve WordPress speed? (Select all that apply)', '["Compressing images","Using caching","Removing unused plugins","Installing 40 plugins"]'::jsonb,
null, '[0,1,2]'::jsonb,
'Lighter sites load faster; plugin bloat slows everything down.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which practices improve WordPress speed? (Select all that apply)'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'web-design-wordpress' and z.title = 'Final Assessment — Web Design with WordPress')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Permalinks set to "Post name" give URLs like…', '["/?p=123","/about-us","wp-admin","index.php?id=9"]'::jsonb,
1, '[]'::jsonb,
'Readable URLs help humans and search engines.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Permalinks set to "Post name" give URLs like…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'web-design-wordpress' and z.title = 'Final Assessment — Web Design with WordPress')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'The safest source for plugins is…', '["The official WordPress plugin directory","Random file-sharing sites","Email attachments","Social media links"]'::jsonb,
0, '[]'::jsonb,
'The official directory vets plugins; unknown sources risk malware.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'The safest source for plugins is…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'web-design-wordpress' and z.title = 'Final Assessment — Web Design with WordPress')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'An SSL certificate enables https and is expected by browsers and Google.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'https protects visitors and is a ranking/trust signal.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'An SSL certificate enables https and is expected by browsers and Google.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'web-design-wordpress' and z.title = 'Final Assessment — Web Design with WordPress')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Before handing a site to a client you should…', '["Test forms, links and mobile view","Delete the admin account permanently","Disable all plugins","Remove the theme"]'::jsonb,
0, '[]'::jsonb,
'A launch checklist (forms, links, mobile, analytics) prevents embarrassing handovers.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Before handing a site to a client you should…'
);
with c as (select id from public.courses where slug = 'web-design-wordpress')
insert into public.assignments (course_id, title, description, instructions, required_output, max_score, is_final_project, status)
select c.id, 'Final Project: Complete Business Website on WordPress', 'Build a complete 5+ page WordPress website for a real or practice business and pass a professional launch checklist.', '1) Pages: Home, Services (or Products), About, Blog (2 posts with categories), Contact.
2) Use a lightweight theme; customize branding via the Customizer or a page builder.
3) Add a working contact form, WhatsApp button, menu (≤7 items) and footer CTA.
4) Apply speed (compressed images, caching) and SEO basics (titles, meta, alt text).
5) Complete the launch checklist: mobile pass, links tested, form tested, analytics installed.', 'The live site URL (or staging URL) + screenshots of each page + your completed launch checklist.', 100, true, 'published' from c
where not exists (
  select 1 from public.assignments a where a.course_id = c.id and a.title = 'Final Project: Complete Business Website on WordPress'
);
update public.assignments a set lesson_id = le.id
  from public.course_lessons le
 where a.course_id = le.course_id and le.title = 'Capstone: Build & Launch a Complete Business Website'
   and a.title = 'Final Project: Complete Business Website on WordPress' and exists (select 1 from public.courses c where c.id = a.course_id and c.slug = 'web-design-wordpress');
with c as (select id from public.courses where slug = 'web-design-wordpress')
insert into public.course_completion_rules (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project)
select c.id, 100, 70, 0, true from c
on conflict (course_id) do update
  set require_lessons_pct = excluded.require_lessons_pct,
      require_quiz_avg = excluded.require_quiz_avg,
      require_assignments_approved = excluded.require_assignments_approved,
      require_final_project = excluded.require_final_project,
      updated_at = now();

-- ---------- ui-ux-design-figma ----------
with c as (select id from public.courses where slug = 'ui-ux-design-figma')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 1: UX Thinking & Figma Foundations', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 1: UX Thinking & Figma Foundations'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'UX vs UI: The Difference That Pays', 'video', '14 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'UX vs UI: The Difference That Pays'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'UX vs UI: The Difference That Pays';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations' and le.title = 'UX vs UI: The Difference That Pays'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- What UX and UI actually mean (with examples)
- The design process professionals follow
- Why research beats decoration

## 📖 Lesson
**UX (User Experience)** = how it *works*: Does the user achieve their goal easily? It covers research, flows, structure, and usability.
**UI (User Interface)** = how it *looks*: colors, typography, spacing, components.

Analogy: UX is the architecture of a house (rooms flow, doors where you expect); UI is the interior finish (paint, fixtures). Pretty-but-confusing apps fail; clear-but-ugly apps feel cheap. Great products need both.

The professional process (called design thinking):
1. **Empathize** — understand users & their pain
2. **Define** — state the core problem in one sentence
3. **Ideate** — sketch many solutions fast
4. **Prototype** — build the best idea in Figma
5. **Test** — watch real people use it, fix, repeat

## 💡 Real-world example
A bank app redesigned buttons with gradients (UI) but kept the transfer flow at 9 screens (UX). Complaints didn''t change. The next release cut steps to 4 — satisfaction soared.

## ✍️ Practical
1. Pick an app you use daily; note one UX frustration.
2. Write the problem as one sentence.
3. Sketch 3 rough solutions on paper.

## ✅ Checklist
- [ ] UX vs UI difference clear
- [ ] 5-step process memorized
- [ ] First problem defined' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations' and le.title = 'UX vs UI: The Difference That Pays'
)
update public.course_lessons le
   set resources = '[{"title":"Laws of UX — psychology of design (free book)","url":"https://lawsofux.com/","type":"pdf"},{"title":"Figma Learn — official free training","url":"https://help.figma.com/hc/en-us","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations' and le.title = 'UX vs UI: The Difference That Pays'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=xWSCAD7xcpw', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=xWSCAD7xcpw'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'User Research: Asking Questions That Reveal Truth', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'User Research: Asking Questions That Reveal Truth'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'User Research: Asking Questions That Reveal Truth';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations' and le.title = 'User Research: Asking Questions That Reveal Truth'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Lightweight research without a budget
- Interview questions that don''t mislead
- Turning complaints into design requirements

## 📖 Lesson
You are not the user. Five people''s frustrations reveal 80% of problems — no lab required.

**Interview rules:**
- Ask about the PAST, not hypotheticals: "Tell me about the last time you…" beats "Would you use…?"
- Ask "why" gently, 2–3 levels deep
- Listen 80%, talk 20%
- Ask 5 users; patterns appear fast

Turn findings into **requirements**:
- Complaint: "I can never find my order status" → Requirement: order status visible within one tap of opening the app.

Also use free desk research: app store reviews of competitors are goldmines of unmet needs (sort by 1–3 stars).

## 💡 Real-world example
Reading 1-star reviews of food delivery apps, a student found the top complaint: riders calling instead of texting at night. Her redesign defaulted to in-app chat — her strongest portfolio case study.

## ✍️ Practical
1. Interview 3 people about one app/process they use.
2. List their top 5 frustrations.
3. Convert 3 frustrations into design requirements.

## ✅ Checklist
- [ ] 3 interviews done
- [ ] 5 frustrations captured
- [ ] 3 requirements written' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations' and le.title = 'User Research: Asking Questions That Reveal Truth'
)
update public.course_lessons le
   set resources = '[{"title":"Laws of UX — psychology of design (free book)","url":"https://lawsofux.com/","type":"pdf"},{"title":"IDEO — design thinking resources","url":"https://designthinkingforinnovation.com/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations' and le.title = 'User Research: Asking Questions That Reveal Truth'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=xWSCAD7xcpw', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=xWSCAD7xcpw'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Figma Basics: Frames, Shapes & Text', 'video', '16 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Figma Basics: Frames, Shapes & Text'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Figma Basics: Frames, Shapes & Text';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations' and le.title = 'Figma Basics: Frames, Shapes & Text'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The Figma workspace in 10 minutes
- Frames vs groups (the core concept)
- Device frames and precise alignment

## 📖 Lesson
Figma is free, browser-based, and the global industry standard — no install needed.

Workspace: left = layers panel; center = canvas; right = properties (fill, stroke, text, effects).

**Frames** are your artboards — always design inside frames (never floating on the canvas). Press F and pick a device preset: iPhone, Android, Desktop. Frames can nest (a card frame inside a screen frame) — this nesting is the secret to organized files.

Core tools: **R** rectangle, **O** ellipse, **T** text, **V** move. Align everything with the alignment buttons (top of right panel). Hold Alt/Option to see distances between elements — pixel precision is a habit, not a talent.

Shortcuts worth day one: V (move), F (frame), R (rectangle), T (text), Cmd/Ctrl+D (duplicate).

## 💡 Real-world example
Hiring managers open a candidate''s Figma file first. Neat named frames and tidy layers communicate professionalism before they ever see the visuals.

## ✍️ Practical
1. Create a Figma account; start a design file.
2. Add an iPhone frame; place 5 aligned rectangles + text inside.
3. Practice Alt-distance measurement and alignment tools.

## ✅ Checklist
- [ ] Frames (not groups) understood
- [ ] Device frame created
- [ ] Basic shortcuts working' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations' and le.title = 'Figma Basics: Frames, Shapes & Text'
)
update public.course_lessons le
   set resources = '[{"title":"Figma — free design tool","url":"https://www.figma.com/","type":"tool"},{"title":"Figma Learn — official free training","url":"https://help.figma.com/hc/en-us","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations' and le.title = 'Figma Basics: Frames, Shapes & Text'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=xWSCAD7xcpw', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=xWSCAD7xcpw'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Auto Layout: The Skill Employers Test For', 'video', '17 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Auto Layout: The Skill Employers Test For'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Auto Layout: The Skill Employers Test For';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations' and le.title = 'Auto Layout: The Skill Employers Test For'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Auto layout: frames that resize themselves
- Padding, gaps and alignment inside auto layout
- Building responsive buttons and cards

## 📖 Lesson
**Auto layout** makes frames behave like real code (flexbox): content sizes the container, spacing stays consistent.

Select elements → right-click "Add auto layout" (Shift+A). Then control:
- **Direction** — horizontal or vertical stack
- **Gap** — space between children
- **Padding** — space inside the frame
- **Alignment** — 9-position grid
- **Sizing** — fixed, hug contents, or fill container

Examples to build: a **button** (text inside auto-layout frame with padding → type longer text, button grows), a **card** (vertical auto layout: image + title + price), a **list** (cards in a vertical frame with gap).

Why it matters: real products change constantly. Auto-layout designs update in seconds; manual spacing takes hours and breaks. Interview tasks almost always include it.

## 💡 Real-world example
A junior designer''s button "broke" when the text changed from "Log in" to "Sign in with Google". Auto layout would have stretched it automatically — the interviewer noticed.

## ✍️ Practical
1. Build 3 auto-layout buttons that hug their text.
2. Build a product card (image, title, price) in auto layout.
3. Stack 3 cards in a list frame with consistent gap.

## ✅ Checklist
- [ ] Buttons grow with text
- [ ] Card uses nested auto layout
- [ ] List spacing consistent' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations' and le.title = 'Auto Layout: The Skill Employers Test For'
)
update public.course_lessons le
   set resources = '[{"title":"Figma Learn — official free training","url":"https://help.figma.com/hc/en-us","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 1: UX Thinking & Figma Foundations' and le.title = 'Auto Layout: The Skill Employers Test For'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=ZWYyiPwCi54', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=ZWYyiPwCi54'
);

with c as (select id from public.courses where slug = 'ui-ux-design-figma')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 2: Design Systems & Components', 1 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 2: Design Systems & Components'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Colors, Typography & Spacing Systems', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Colors, Typography & Spacing Systems'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Colors, Typography & Spacing Systems';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components' and le.title = 'Colors, Typography & Spacing Systems'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Building a palette with purpose
- Type scales that create hierarchy
- The 8pt spacing grid professionals use

## 📖 Lesson
**Color system:** 1 primary (brand), 1 neutral scale (grays for text/backgrounds), semantic colors (green success, red error, amber warning). Use opacity for emphasis instead of new colors. Check contrast: text needs 4.5:1 minimum against its background.

**Type scale:** define sizes once and reuse: e.g. Display 32 / Title 24 / Heading 20 / Body 16 / Caption 12. Two font families maximum. Line height ~1.4 for body text.

**8pt grid:** all spacing, sizes and gaps in multiples of 4 or 8 (8, 16, 24, 32…). The result: everything feels consistent without thinking. Every major product (Material Design, Apple''s HIG) works this way.

In Figma: save colors and text styles in the right panel (four-dots icon → "Create style"). Styles = instant consistency across screens.

## 💡 Real-world example
Two portfolios with equal visual talent: the one with documented color/type/spacing systems got the offer — systems signal you can work on real products, not just pretty screens.

## ✍️ Practical
1. Define a mini system: 5 colors, 5 text styles, spacing scale.
2. Save them all as Figma styles.
3. Check 3 text/background pairs for contrast.

## ✅ Checklist
- [ ] Palette with semantics saved
- [ ] 5 text styles created
- [ ] 8pt grid applied' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components' and le.title = 'Colors, Typography & Spacing Systems'
)
update public.course_lessons le
   set resources = '[{"title":"Material Design guidelines (Google)","url":"https://m3.material.io/","type":"docs"},{"title":"Contrast checker (WCAG)","url":"https://webaim.org/resources/contrastchecker/","type":"tool"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components' and le.title = 'Colors, Typography & Spacing Systems'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=ZWYyiPwCi54', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=ZWYyiPwCi54'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Components & Variants: Build Once, Use Everywhere', 'video', '17 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Components & Variants: Build Once, Use Everywhere'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Components & Variants: Build Once, Use Everywhere';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components' and le.title = 'Components & Variants: Build Once, Use Everywhere'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Components: master + instances
- Variants for states (default/hover/pressed)
- Publishing and using component libraries

## 📖 Lesson
A **component** is a master element; every copy is an **instance**. Edit the master → all instances update. Buttons, inputs, nav bars, cards — all should be components.

Create: select frame → right-click "Create component" (Cmd/Ctrl+Alt+K). Instances show a hollow diamond icon; the master is filled.

**Variants** bundle states into one switchable component: a Button component with variants State = Default/Hover/Disabled, Style = Primary/Secondary. Designers toggle variants instead of duplicating messily.

Team workflow: publish components to a **library** (team feature); every file pulls from it — one source of truth, like code imports.

## 💡 Real-world example
A team changed their primary brand blue once — in the master component. 300+ screens across 12 files updated instantly. That''s why products hire component-minded designers.

## ✍️ Practical
1. Convert your buttons/inputs/cards to components.
2. Add variants: primary/secondary × default/disabled.
3. Build one screen using only instances.

## ✅ Checklist
- [ ] Master + instances working
- [ ] Variants switchable
- [ ] Screen built from instances only' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components' and le.title = 'Components & Variants: Build Once, Use Everywhere'
)
update public.course_lessons le
   set resources = '[{"title":"Figma Learn — official free training","url":"https://help.figma.com/hc/en-us","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components' and le.title = 'Components & Variants: Build Once, Use Everywhere'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=ZWYyiPwCi54', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=ZWYyiPwCi54'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Navigation Patterns & Information Architecture', 'video', '15 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Navigation Patterns & Information Architecture'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Navigation Patterns & Information Architecture';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components' and le.title = 'Navigation Patterns & Information Architecture'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Tabs, stacks, drawers: when to use each
- Structuring screens so users never get lost
- Common UX laws worth memorizing

## 📖 Lesson
**Navigation patterns:**
- **Bottom tab bar** — 3–5 top-level areas (Home, Search, Cart, Profile). Best default for apps.
- **Stack navigation** — drill deeper, back arrow returns (details inside lists).
- **Drawer/hamburger** — for rarely used items; hiding core features here kills discovery.

**Information architecture:** group by user goals, not company departments. Card sorting (write features on cards, ask users to group them) reveals natural structure.

**Laws to internalize:**
- **Hick''s law** — more choices = slower decisions; reduce options
- **Jakob''s law** — users expect your site to work like others; innovate carefully
- **Fitts''s law** — important targets big and close
- **Miller''s law** — chunk info into 5–9 items

## 💡 Real-world example
An e-commerce app moved "Orders" from a buried drawer to the tab bar after card sorting showed users searched for it constantly. Support tickets about "where''s my order" dropped by half.

## ✍️ Practical
1. Sketch the tab bar + stack flow for your app concept.
2. Label which UX law each decision follows.
3. Simplify: cut one unnecessary menu item.

## ✅ Checklist
- [ ] Navigation pattern chosen with reason
- [ ] 4 UX laws applied
- [ ] Menu simplified' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components' and le.title = 'Navigation Patterns & Information Architecture'
)
update public.course_lessons le
   set resources = '[{"title":"Laws of UX — psychology of design (free book)","url":"https://lawsofux.com/","type":"pdf"},{"title":"Material Design guidelines (Google)","url":"https://m3.material.io/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components' and le.title = 'Navigation Patterns & Information Architecture'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=3qLX9IaGZO0', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=3qLX9IaGZO0'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Wireframes First: Speed Beats Polish', 'video', '14 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Wireframes First: Speed Beats Polish'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Wireframes First: Speed Beats Polish';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components' and le.title = 'Wireframes First: Speed Beats Polish'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Low-fi vs hi-fi: when each is right
- Wireframing fast in Figma
- Getting feedback before you fall in love

## 📖 Lesson
**Wireframes** = grayscale skeletons of screens. No colors, no images — only structure and hierarchy. Why first? Changes are cheap: moving a gray box takes seconds; re-polishing a beautiful screen takes hours.

Professional order: research → user flow → **wireframes** → feedback → visual design → prototype → test.

Figma wireframe tips: use a gray palette (3 grays max), rectangles for images, lines for text, and componentize repeated blocks. One screen should take 10–15 minutes, not 2 hours.

Share wireframes early (Figma share link, view-only) and ask: "Can you tell me what you''d do on this screen?" — confusion now saves rework later.

## 💡 Real-world example
A designer presented polished screens to a client, who asked to move the entire checkout flow. Had wireframes been reviewed first, the change would have cost minutes, not days.

## ✍️ Practical
1. Draw the user flow (screens as a map) for your app.
2. Wireframe 4 key screens in grayscale.
3. Show someone: can they explain each screen back to you?

## ✅ Checklist
- [ ] Flow mapped before screens
- [ ] 4 grayscale wireframes done
- [ ] Outsider understood them' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components' and le.title = 'Wireframes First: Speed Beats Polish'
)
update public.course_lessons le
   set resources = '[{"title":"Figma Learn — official free training","url":"https://help.figma.com/hc/en-us","type":"course"},{"title":"Laws of UX — psychology of design (free book)","url":"https://lawsofux.com/","type":"pdf"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 2: Design Systems & Components' and le.title = 'Wireframes First: Speed Beats Polish'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=3qLX9IaGZO0', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=3qLX9IaGZO0'
);

with c as (select id from public.courses where slug = 'ui-ux-design-figma')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 3: Designing a Mobile App UI', 2 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 3: Designing a Mobile App UI'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Designing Onboarding & Auth Screens', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Designing Onboarding & Auth Screens'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Designing Onboarding & Auth Screens';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI' and le.title = 'Designing Onboarding & Auth Screens'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Onboarding that earns the signup
- Login/register UX best practices
- Error and empty states (the pro differentiator)

## 📖 Lesson
**Onboarding:** max 3 slides, each = one benefit + one visual, always skippable. Better still: let users experience value before asking to register.

**Auth screens:**
- One field per line, clear labels, big tap targets (48px+ high)
- Show/hide password toggle
- Social logins reduce friction
- Inline validation: errors under the field, in plain language ("Use at least 8 characters"), red + icon, never just a red border

**States beginners forget (and pros always design):**
- **Empty state** — no data yet: friendly message + action ("Add your first item")
- **Loading** — skeletons over spinners
- **Error** — what went wrong + how to fix it

Design all states and your work instantly reads senior.

## 💡 Real-world example
An app redesigned its empty cart from a blank white screen to "Your cart misses you — browse deals" with a button. Cart abandonment recovered measurably.

## ✍️ Practical
1. Design onboarding (3 slides, skippable) + login + signup.
2. Add one error state and one empty state.
3. Check every tap target ≥48px.

## ✅ Checklist
- [ ] Onboarding ≤3 slides
- [ ] Inline validation designed
- [ ] Empty/loading/error states exist' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI' and le.title = 'Designing Onboarding & Auth Screens'
)
update public.course_lessons le
   set resources = '[{"title":"Material Design guidelines (Google)","url":"https://m3.material.io/","type":"docs"},{"title":"Figma Learn — official free training","url":"https://help.figma.com/hc/en-us","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI' and le.title = 'Designing Onboarding & Auth Screens'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=3qLX9IaGZO0', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=3qLX9IaGZO0'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Home Feeds, Lists & Cards That Scan', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Home Feeds, Lists & Cards That Scan'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Home Feeds, Lists & Cards That Scan';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI' and le.title = 'Home Feeds, Lists & Cards That Scan'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Card anatomy for scannable feeds
- Visual hierarchy inside lists
- Search, filters and sorting UX

## 📖 Lesson
**Card anatomy (top→bottom):** media (biggest attention) → title (one line if possible) → supporting line → metadata (price/rating) → action. One decision per card.

**Hierarchy tools:** size contrast (title 16–18px, meta 12px), weight contrast, muted colors for secondary info, consistent iconography.

**Lists:** sticky headers for long lists; group with section titles; show 5–8 items per screen on mobile. Infinite scroll with skeletons, or "Load more" — never dead ends.

**Search & filters:** search bar visible (not hidden behind icons), recent searches, filters as chips, result count after filtering ("23 results").

**Thumb zone:** primary actions bottom-half of the screen (thumb reach); destructive actions away from thumb-rest areas.

## 💡 Real-world example
Two listing apps, same data. One crams 6 fields per row; the other: image, title, price, heart icon. The simpler one feels faster — scannability is speed.

## ✍️ Practical
1. Design a feed: 6 cards from one component.
2. Add a search bar + 3 filter chips with result count.
3. Place the primary action in the thumb zone.

## ✅ Checklist
- [ ] Cards use consistent anatomy
- [ ] Filters show result counts
- [ ] Primary actions thumb-reachable' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI' and le.title = 'Home Feeds, Lists & Cards That Scan'
)
update public.course_lessons le
   set resources = '[{"title":"Material Design guidelines (Google)","url":"https://m3.material.io/","type":"docs"},{"title":"Dribbble — design inspiration","url":"https://dribbble.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI' and le.title = 'Home Feeds, Lists & Cards That Scan'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=ZWYyiPwCi54', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=ZWYyiPwCi54'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Forms, Checkouts & Critical Flows', 'video', '17 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Forms, Checkouts & Critical Flows'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Forms, Checkouts & Critical Flows';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI' and le.title = 'Forms, Checkouts & Critical Flows'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Forms users actually finish
- Checkout: the highest-stakes screens
- Trust signals that lift conversion

## 📖 Lesson
**Forms:** fewer fields always win. One column (not two), labels above fields, group related fields with section titles, progress indicators for long flows ("Step 2 of 4"), input types matched to content (numeric keypad for phone/card), and save-as-you-go where possible.

**Checkout flow standard:** cart → address → payment → review → confirmation. Each step: clear title, one action, back visible. Confirmation screen: order summary + what happens next (delivery time, contact).

**Trust signals:** security icons, payment method logos, return policy line, order summary always visible, no surprise fees at the end (the #1 abandonment cause globally).

Design the **unhappy paths** too: declined card, out-of-stock item, expired session — with clear recovery actions.

## 💡 Real-world example
A store cut checkout from 6 screens to 3 and added a visible "Free returns" line. Completion rate rose 19% — flow design is revenue design.

## ✍️ Practical
1. Design a 3-step checkout with progress indicator.
2. Add one trust signal per step.
3. Design the declined-card error state with recovery.

## ✅ Checklist
- [ ] One-column form, minimal fields
- [ ] Progress indicator present
- [ ] Error path designed' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI' and le.title = 'Forms, Checkouts & Critical Flows'
)
update public.course_lessons le
   set resources = '[{"title":"Laws of UX — psychology of design (free book)","url":"https://lawsofux.com/","type":"pdf"},{"title":"Material Design guidelines (Google)","url":"https://m3.material.io/","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI' and le.title = 'Forms, Checkouts & Critical Flows'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=3qLX9IaGZO0', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=3qLX9IaGZO0'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Polish: Icons, Illustrations & Dark Mode', 'video', '15 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Polish: Icons, Illustrations & Dark Mode'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Polish: Icons, Illustrations & Dark Mode';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI' and le.title = 'Polish: Icons, Illustrations & Dark Mode'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Icon systems: consistent, not collected
- Illustration & empty-state art
- Designing dark mode properly

## 📖 Lesson
**Icons:** use ONE icon set (same stroke width and style) — mixing sets screams amateur. Lucide, Material Symbols and Feather are free and consistent. Size on an 8pt grid (16/24/32). Icon + label beats icon alone for important actions.

**Illustrations:** one style throughout (unDraw provides free customizable SVGs). Best uses: empty states, onboarding, errors — they turn dead moments into brand moments.

**Dark mode:** it''s not "make everything black":
- Backgrounds: dark gray (#121212-ish), never pure black on pure white text (halation)
- Desaturate brand colors slightly; they glow on dark
- Use elevation (lighter surfaces = higher) instead of heavy shadows
- Check every screen; images and colored chips often need tweaks

## 💡 Real-world example
An app shipped dark mode by simply inverting colors — text glowed, logos vibrated. The redesigned dark theme (layered grays, desaturated accents) became its most-praised feature.

## ✍️ Practical
1. Replace all icons with one consistent set.
2. Add an unDraw illustration to your empty state.
3. Build dark variants of 3 key screens.

## ✅ Checklist
- [ ] Single icon system used
- [ ] Illustration style consistent
- [ ] Dark mode on 3 screens' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI' and le.title = 'Polish: Icons, Illustrations & Dark Mode'
)
update public.course_lessons le
   set resources = '[{"title":"Lucide — free consistent icons","url":"https://lucide.dev/","type":"resource"},{"title":"unDraw — free illustrations","url":"https://undraw.co/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 3: Designing a Mobile App UI' and le.title = 'Polish: Icons, Illustrations & Dark Mode'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=ZWYyiPwCi54', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=ZWYyiPwCi54'
);

with c as (select id from public.courses where slug = 'ui-ux-design-figma')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 4: Prototype, Test & Get Hired', 3 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 4: Prototype, Test & Get Hired'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Interactive Prototypes in Figma', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Interactive Prototypes in Figma'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Interactive Prototypes in Figma';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired' and le.title = 'Interactive Prototypes in Figma'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Connecting screens: flows and triggers
- Smart animate for magic transitions
- Presenting prototypes on a real phone

## 📖 Lesson
Prototypes turn static screens into testable experiences. Select an element → Prototype tab → drag a connection to the target screen. Set:
- **Trigger:** On tap / On drag / While hovering
- **Action:** Navigate to / Open overlay / Scroll to
- **Animation:** Instant / Dissolve / Smart animate / Push

**Smart animate** matches layers by name between frames — buttons morph, cards expand. Same layer names = smooth magic; mismatched names = jumps.

Overlays power modals, menus and bottom sheets. Set starting points per flow so stakeholders open the right demo.

Present on a real device: **Figma Mirror app** — designs appear live on your phone as you edit. Clients and testers react completely differently to a phone-held prototype.

## 💡 Real-world example
A student showed a static portfolio for months: few replies. After making every case study a clickable prototype with a QR code, interview requests tripled — people remember what they touched.

## ✍️ Practical
1. Connect your 4+ screens into a full flow.
2. Add one smart-animate transition and one overlay.
3. Open it on your phone via Figma Mirror.

## ✅ Checklist
- [ ] Full flow navigable
- [ ] Smart animate + overlay used
- [ ] Prototype runs on phone' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired' and le.title = 'Interactive Prototypes in Figma'
)
update public.course_lessons le
   set resources = '[{"title":"Figma Learn — official free training","url":"https://help.figma.com/hc/en-us","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired' and le.title = 'Interactive Prototypes in Figma'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=ZWYyiPwCi54', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=ZWYyiPwCi54'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Usability Testing: Watch, Learn, Fix', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Usability Testing: Watch, Learn, Fix'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Usability Testing: Watch, Learn, Fix';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired' and le.title = 'Usability Testing: Watch, Learn, Fix'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Running a 20-minute usability test
- What to say (and never say) while testing
- Prioritizing fixes by severity

## 📖 Lesson
Testing with 3–5 users finds most problems. Script:
1. Give a **task**, not instructions: "You want to send money to a friend. Show me how you''d do it."
2. Stay silent; encourage thinking aloud ("What are you looking for?")
3. Never defend the design; never help except when fully stuck
4. Note: hesitations, wrong taps, confused faces, and their words

**Never ask** "Do you like it?" (politeness bias). Watch what they DO.

Log issues with severity:
- **Critical** — task fails
- **Major** — task completes with struggle
- **Minor** — cosmetic confusion
Fix criticals first; majors next; batch minors.

One test round usually reveals 5–10 fixes. Iterate and re-test only the fixed flows.

## 💡 Real-world example
During a test, a user tapped the logo expecting to go home — it didn''t. Three users did the same. One afternoon of testing saved months of confused users.

## ✍️ Practical
1. Write 3 tasks for your prototype.
2. Test with 3 people; record hesitations.
3. Fix all critical issues and re-test once.

## ✅ Checklist
- [ ] 3 tasks written
- [ ] 3 tests conducted
- [ ] Criticals fixed & re-tested' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired' and le.title = 'Usability Testing: Watch, Learn, Fix'
)
update public.course_lessons le
   set resources = '[{"title":"Laws of UX — psychology of design (free book)","url":"https://lawsofux.com/","type":"pdf"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired' and le.title = 'Usability Testing: Watch, Learn, Fix'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=3qLX9IaGZO0', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=3qLX9IaGZO0'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Handoff to Developers & Design Tokens', 'video', '14 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Handoff to Developers & Design Tokens'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Handoff to Developers & Design Tokens';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired' and le.title = 'Handoff to Developers & Design Tokens'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Dev Mode: specs developers actually use
- Naming and organizing files for handoff
- Speaking developer language

## 📖 Lesson
**Dev Mode** (Figma): developers inspect any element — exact sizes, colors, spacing, code snippets for CSS/iOS/Android. Your job: give them clean inputs.

Handoff hygiene:
- **Name layers** ("Primary Button", not "Rectangle 47")
- Mark sections: "READY FOR DEV" frame vs explorations
- Attach behavior notes ("button shows loading state 2s")
- Provide all states: default/hover/pressed/disabled/error
- Assets: export icons/SVGs at 1×/2×/3× where needed

**Speak their language:** padding not "space around", border-radius values, hex codes, interaction specs ("tap → push animation, 300ms"). Designers who hand off cleanly get invited back to every project.

## 💡 Real-world example
A developer said of one designer: "Her files take me zero questions." She got every contract that team offered. Handoff quality is career capital.

## ✍️ Practical
1. Rename all layers in your project properly.
2. Add behavior notes to 3 interactions.
3. Inspect one screen in Dev Mode and read the specs.

## ✅ Checklist
- [ ] Layers named meaningfully
- [ ] States + notes attached
- [ ] Dev Mode inspected' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired' and le.title = 'Handoff to Developers & Design Tokens'
)
update public.course_lessons le
   set resources = '[{"title":"Figma Learn — official free training","url":"https://help.figma.com/hc/en-us","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired' and le.title = 'Handoff to Developers & Design Tokens'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=ZWYyiPwCi54', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=ZWYyiPwCi54'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Capstone: Case Study Portfolio & First Design Job', 'project', '22 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Capstone: Case Study Portfolio & First Design Job'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired'
)
update public.course_lessons le set type = 'project'
  from m where le.module_id = m.module_id and le.title = 'Capstone: Case Study Portfolio & First Design Job';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired' and le.title = 'Capstone: Case Study Portfolio & First Design Job'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Structuring a UX case study that gets interviews
- Portfolio presentation standards
- Landing your first UI/UX role or client

## 📖 Lesson
A **case study** tells a story (4–6 sections):
1. **Context** — the problem, your role, timeline
2. **Research** — who you talked to, key findings
3. **Ideation** — wireframes, alternatives considered
4. **Design** — final UI with reasoning (systems, states)
5. **Validation** — test results, what changed
6. **Outcome** — metrics or learnings + next steps

Show process, not just pretty finals — "why" gets you hired. Publish on Behance (free) + your own site; keep Dribbble shots for visibility.

**Getting hired:** junior product designer roles, internships, design communities (Twitter/X, LinkedIn), and freelance platforms. Apply with a tailored 3-line message per company. Redesign one screen of their product as a bonus — it stands out instantly.

## 💡 Real-world example
A career-switcher sent 10 applications with a 1-screen redesign of each company''s product attached. 4 interviews. Effort targeted beats volume sprayed.

## ✍️ Practical
1. Write your full app case study (6 sections).
2. Publish it on Behance + share the link.
3. Apply to 5 roles/clients with tailored messages.

## ✅ Checklist
- [ ] Case study published
- [ ] Portfolio link live
- [ ] 5 applications sent' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired' and le.title = 'Capstone: Case Study Portfolio & First Design Job'
)
update public.course_lessons le
   set resources = '[{"title":"Behance — global design portfolios","url":"https://www.behance.net/","type":"resource"},{"title":"Dribbble — design inspiration","url":"https://dribbble.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'ui-ux-design-figma' and mo.title = 'Module 4: Prototype, Test & Get Hired' and le.title = 'Capstone: Case Study Portfolio & First Design Job'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=ZWYyiPwCi54', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=ZWYyiPwCi54'
);

with c as (select id from public.courses where slug = 'ui-ux-design-figma')
insert into public.quizzes (course_id, title, description, passing_score, allow_retake, is_final, status, attempt_limit)
select c.id, 'Final Assessment — UI/UX Design with Figma', 'Final assessment — pass to move toward your certificate.', 70, true, true, 'published', null from c
where not exists (
  select 1 from public.quizzes z where z.course_id = c.id and z.title = 'Final Assessment — UI/UX Design with Figma'
);
update public.quizzes z set lesson_id = le.id
  from public.course_lessons le
 where z.course_id = le.course_id and le.title = 'Capstone: Case Study Portfolio & First Design Job'
   and z.title = 'Final Assessment — UI/UX Design with Figma' and exists (select 1 from public.courses c where c.id = z.course_id and c.slug = 'ui-ux-design-figma');
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ui-ux-design-figma' and z.title = 'Final Assessment — UI/UX Design with Figma')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'UX design is primarily concerned with…', '["How a product works and feels to use","Only colors","Logo animation","Printing"]'::jsonb,
0, '[]'::jsonb,
'UX = the full experience of achieving goals; UI is the visual layer.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'UX design is primarily concerned with…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ui-ux-design-figma' and z.title = 'Final Assessment — UI/UX Design with Figma')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Auto layout in Figma is best described as…', '["Frames that resize and space their content automatically","Automatic color picking","Auto-export","A plugin store"]'::jsonb,
0, '[]'::jsonb,
'Auto layout behaves like flexbox — content-driven, consistent spacing.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Auto layout in Figma is best described as…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ui-ux-design-figma' and z.title = 'Final Assessment — UI/UX Design with Figma')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Testing with about 5 users uncovers most usability problems.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Small, frequent tests reveal the majority of issues cheaply.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Testing with about 5 users uncovers most usability problems.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ui-ux-design-figma' and z.title = 'Final Assessment — UI/UX Design with Figma')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A component in Figma allows…', '["One master design reused as instances everywhere","Only text editing","Video playback","Database access"]'::jsonb,
0, '[]'::jsonb,
'Edit the master, update every instance — the foundation of design systems.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A component in Figma allows…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ui-ux-design-figma' and z.title = 'Final Assessment — UI/UX Design with Figma')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_answer', 'Which are established UX principles? (Select all that apply)', '["Hick’s law — more choices slow decisions","Jakob’s law — users expect familiar patterns","Fitts’s law — bigger/closer targets are faster to hit","The rule of more menus"]'::jsonb,
null, '[0,1,2]'::jsonb,
'These classic laws guide real design decisions; more menus is not a principle.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which are established UX principles? (Select all that apply)'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ui-ux-design-figma' and z.title = 'Final Assessment — UI/UX Design with Figma')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Wireframes are used early because…', '["Structure changes are cheap before visual polish","They are the final deliverable","Clients prefer gray screens","They replace research"]'::jsonb,
0, '[]'::jsonb,
'Fixing structure in grayscale costs minutes; fixing polished screens costs days.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Wireframes are used early because…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ui-ux-design-figma' and z.title = 'Final Assessment — UI/UX Design with Figma')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A design token/system helps teams by…', '["Centralizing colors, type and spacing decisions","Replacing designers","Increasing file sizes","Hiding components"]'::jsonb,
0, '[]'::jsonb,
'Systems keep many screens and many designers consistent.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A design token/system helps teams by…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ui-ux-design-figma' and z.title = 'Final Assessment — UI/UX Design with Figma')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'The minimum comfortable touch target size on mobile is about…', '["12px","48px","100px","2px"]'::jsonb,
1, '[]'::jsonb,
'Fingers need roughly 48px targets to tap reliably.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'The minimum comfortable touch target size on mobile is about…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ui-ux-design-figma' and z.title = 'Final Assessment — UI/UX Design with Figma')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Dark mode should simply invert all colors of the light design.', '["True","False"]'::jsonb,
1, '[]'::jsonb,
'Naive inversion causes glare and broken contrast — dark themes need desaturated colors and layered surfaces.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Dark mode should simply invert all colors of the light design.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'ui-ux-design-figma' and z.title = 'Final Assessment — UI/UX Design with Figma')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'The best artifact to hand developers is…', '["Named layers, states and behavior notes in Dev Mode","A screenshot","A verbal description","A printed page"]'::jsonb,
0, '[]'::jsonb,
'Clean files with specs prevent questions and rework.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'The best artifact to hand developers is…'
);
with c as (select id from public.courses where slug = 'ui-ux-design-figma')
insert into public.assignments (course_id, title, description, instructions, required_output, max_score, is_final_project, status)
select c.id, 'Final Project: Mobile App Case Study', 'Design a complete mobile app experience in Figma and publish it as a professional case study.', '1) Research: interview 2–3 users or analyze reviews of a similar app; write the core problem statement.
2) Map the user flow, then wireframe 4+ key screens in grayscale.
3) Build a mini design system (colors, type scale, 2–3 components with variants).
4) Produce the final UI for all screens including one empty state and one error state.
5) Prototype the full flow (smart animate + at least one overlay) and test it with 2 people; note fixes.
6) Publish the case study (problem → research → design → validation) on Behance.', 'Behance case study link + clickable Figma prototype link + summary of test findings and fixes.', 100, true, 'published' from c
where not exists (
  select 1 from public.assignments a where a.course_id = c.id and a.title = 'Final Project: Mobile App Case Study'
);
update public.assignments a set lesson_id = le.id
  from public.course_lessons le
 where a.course_id = le.course_id and le.title = 'Capstone: Case Study Portfolio & First Design Job'
   and a.title = 'Final Project: Mobile App Case Study' and exists (select 1 from public.courses c where c.id = a.course_id and c.slug = 'ui-ux-design-figma');
with c as (select id from public.courses where slug = 'ui-ux-design-figma')
insert into public.course_completion_rules (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project)
select c.id, 100, 70, 0, true from c
on conflict (course_id) do update
  set require_lessons_pct = excluded.require_lessons_pct,
      require_quiz_avg = excluded.require_quiz_avg,
      require_assignments_approved = excluded.require_assignments_approved,
      require_final_project = excluded.require_final_project,
      updated_at = now();

-- ---------- microsoft-excel ----------
with c as (select id from public.courses where slug = 'microsoft-excel')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 1: Excel Foundations', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 1: Excel Foundations'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'The Excel Interface: Ribbons, Sheets & Cells', 'video', '14 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'The Excel Interface: Ribbons, Sheets & Cells'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'The Excel Interface: Ribbons, Sheets & Cells';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations' and le.title = 'The Excel Interface: Ribbons, Sheets & Cells'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Workbook vs worksheet vs cell: the core mental model
- The ribbon and the tools you''ll use daily
- Moving fast: selection, navigation, shortcuts

## 📖 Lesson
Excel stores data in **workbooks** (files) containing **worksheets** (tabs) made of **cells** (the boxes). Every cell has an address — column letter + row number: `B4` means column B, row 4. Ranges use a colon: `A1:A10` = ten cells.

The **ribbon** groups commands: Home (formatting), Insert (charts/tables), Formulas, Data (sort/filter), View. 90% of your time is Home + Data.

Speed habits from day one:
- **Ctrl + arrow keys** — jump to data edges
- **Ctrl + Shift + arrows** — select while jumping
- **Ctrl + Z / Y** — undo/redo without fear
- **Double-click a cell** to edit; **F2** also edits
- Sheet tabs at the bottom: right-click to rename, recolor, move

Treat Excel as a grid you can always find your way around: know WHERE you are (Name Box, top-left shows current cell) before doing anything.

## 💡 Real-world example
Two assistants get the same data task. One scrolls painfully with the mouse; the other uses Ctrl+arrows and finishes in a third of the time. Navigation speed is the first visible Excel skill.

## ✍️ Practical
1. Create a workbook; rename Sheet1 to "Practice".
2. Fill A1:A10 with numbers; jump around with Ctrl+arrows.
3. Select ranges with keyboard only.

## ✅ Checklist
- [ ] Cell addressing (B4, A1:A10) fluent
- [ ] Ctrl+arrow navigation mastered
- [ ] Sheets renamed & organized' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations' and le.title = 'The Excel Interface: Ribbons, Sheets & Cells'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations' and le.title = 'The Excel Interface: Ribbons, Sheets & Cells'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=Vl0H-qTclOg', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=Vl0H-qTclOg'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Data Entry, Formatting & Making Data Readable', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Data Entry, Formatting & Making Data Readable'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Data Entry, Formatting & Making Data Readable';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations' and le.title = 'Data Entry, Formatting & Making Data Readable'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Entering and editing data correctly
- Number formats: currency, dates, percentages
- Formatting that makes reports look professional

## 📖 Lesson
**Entry rules:** dates with consistent format; one fact per cell (never "John, 25, Lagos" in one cell); numbers as numbers (don''t type ₦ — use currency format so math works later).

**Formats** (Home → Number group or Ctrl+1): General, Number, Currency/Accounting, Percentage, Date, Text. Formatting changes how a value DISPLAYS, not what it is — ₦5,000 formatted stays the number 5000 for formulas.

**Professional look checklist:**
- Bold headers with fill color and borders
- Freeze top row (View → Freeze Panes) so headers stay visible while scrolling
- Adjust column widths (double-click the divider to auto-fit)
- Alignment: text left, numbers right, headers centered
- One decimal max unless precision matters

Flash Fill (Ctrl+E) is magic: type one example of a transformation (e.g. first names from full names), and Excel completes the rest.

## 💡 Real-world example
A manager''s report came back "confusing" — plain text columns of numbers. The same data with frozen headers, currency formats and borders got approved the next morning.

## ✍️ Practical
1. Build a 10-row staff list (name, salary, start date, % bonus).
2. Apply currency, date and percent formats correctly.
3. Freeze the header row and style it.

## ✅ Checklist
- [ ] Formats applied by type
- [ ] Header row frozen & styled
- [ ] Flash Fill tried' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations' and le.title = 'Data Entry, Formatting & Making Data Readable'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"},{"title":"Free official Excel templates","url":"https://templates.office.com/en-us/templates-for-excel","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations' and le.title = 'Data Entry, Formatting & Making Data Readable'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=Vl0H-qTclOg', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=Vl0H-qTclOg'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Sorting, Filtering & Data Organization', 'video', '15 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Sorting, Filtering & Data Organization'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Sorting, Filtering & Data Organization';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations' and le.title = 'Sorting, Filtering & Data Organization'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Sorting by one and multiple levels
- Filters: finding needles in data haystacks
- Keeping data clean for everything that follows

## 📖 Lesson
**Sort:** Data → Sort. Simple: click a column, A→Z. Multi-level: "Sort by Department, then by Salary descending" — Excel supports stacked sort levels.

**Filter:** Ctrl+Shift+L (or Data → Filter) adds dropdown arrows to headers: tick/un-tick values, filter by color, number conditions ("greater than 100,000"), text contains ("lagos"). Filters hide rows — the data stays safe.

**Clean data rules (golden for every later skill):**
- No blank rows inside your data range
- One header row, unique column names
- Consistent values (not "Lagos" vs "LAGOS" vs "lagos")
- No merged cells inside data ranges

Dirty data breaks formulas and charts later; 5 minutes of cleaning now saves hours later.

## 💡 Real-world example
"Show me all Abuja customers who bought last month" — with filters: 20 seconds. Without organized data: impossible.

## ✍️ Practical
1. Apply multi-level sort (two levels) to your staff list.
2. Turn on filters; answer 3 questions using them.
3. Audit: remove any blank rows/merged cells.

## ✅ Checklist
- [ ] Multi-level sorting works
- [ ] Filters answer real questions
- [ ] Data passes clean-data rules' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations' and le.title = 'Sorting, Filtering & Data Organization'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations' and le.title = 'Sorting, Filtering & Data Organization'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qY95fNIBhJE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qY95fNIBhJE'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Tables: Excel''s Most Underrated Feature', 'video', '13 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Tables: Excel''s Most Underrated Feature'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Tables: Excel''s Most Underrated Feature';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations' and le.title = 'Tables: Excel''s Most Underrated Feature'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Converting ranges to Tables (Ctrl+T)
- Auto-expansion: new rows join automatically
- Structured references and total rows

## 📖 Lesson
**Tables** (select data → Ctrl+T) upgrade a plain range into a smart object:
- New rows/columns are automatically included — formulas and charts update themselves
- Filters and banded rows come free
- Freeze headers automatically while scrolling
- **Total Row** toggle (Table Design) sums/averages/count any column with one dropdown

Formulas inside tables use readable **structured references**: `=SUM(Table1[Salary])` instead of `=SUM(C2:C500)`. Add 100 rows? Still correct.

Table style stays professional by default. Name your tables meaningfully (Table Design → Table Name: "Sales").

Rule: if data grows over time (sales, inventory, students), make it a Table on day one.

## 💡 Real-world example
A shop owner''s monthly sales formula covered C2:C60. Month by month he extended it manually — until he forgot once, and reported a month missing a week of sales. Tables make that mistake impossible.

## ✍️ Practical
1. Convert your staff list to a Table (Ctrl+T).
2. Add 3 rows — watch the Table absorb them.
3. Turn on the Total Row; sum one column.

## ✅ Checklist
- [ ] Ctrl+T reflex built
- [ ] New rows auto-join
- [ ] Total Row in use' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations' and le.title = 'Tables: Excel''s Most Underrated Feature'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 1: Excel Foundations' and le.title = 'Tables: Excel''s Most Underrated Feature'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=Vl0H-qTclOg', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=Vl0H-qTclOg'
);

with c as (select id from public.courses where slug = 'microsoft-excel')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 2: Formulas & Functions', 1 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 2: Formulas & Functions'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Formula Basics & the Big 5 Functions', 'video', '17 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Formula Basics & the Big 5 Functions'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Formula Basics & the Big 5 Functions';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions' and le.title = 'Formula Basics & the Big 5 Functions'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- How every formula works (=, operators, cell refs)
- SUM, AVERAGE, COUNT, MIN, MAX
- Relative vs absolute references ($ signs)

## 📖 Lesson
Every formula starts with `=`. Operators: + − * / and ^(power). But functions do the heavy lifting:
- `=SUM(B2:B20)` — total
- `=AVERAGE(B2:B20)` — mean
- `=COUNT(B2:B20)` — how many numbers
- `=MIN(...)` / `=MAX(...)` — extremes

**References — the key concept:**
- `B2` is **relative**: copy the formula down and it shifts (B3, B4…). Usually what you want.
- `$B$2` is **absolute** (press F4 to toggle): stays fixed when copied. Use it for constants like a tax rate cell.

If a formula errors: **#REF!** = broken reference (deleted cells), **#DIV/0!** = dividing by zero, **#VALUE!** = wrong data type. Read errors as clues, not failures.

## 💡 Real-world example
A payroll sheet: salary × tax rate in $D$1. Everyone typed D1 without $ — copying dragged the reference down the column, producing nonsense. One F4 keystroke per formula fixed the whole sheet.

## ✍️ Practical
1. Build a sales sheet; compute totals with the Big 5.
2. Calculate commission = sales × rate (rate in one absolute cell).
3. Copy down and verify the absolute ref stays fixed.

## ✅ Checklist
- [ ] Big 5 functions fluent
- [ ] F4 / $ references understood
- [ ] Errors read as clues' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions' and le.title = 'Formula Basics & the Big 5 Functions'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"},{"title":"Microsoft Learn — Excel learning paths (free)","url":"https://learn.microsoft.com/en-us/training/browse/?products=excel","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions' and le.title = 'Formula Basics & the Big 5 Functions'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=Vl0H-qTclOg', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=Vl0H-qTclOg'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'IF, COUNTIF & SUMIF: Decisions in Cells', 'video', '17 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'IF, COUNTIF & SUMIF: Decisions in Cells'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'IF, COUNTIF & SUMIF: Decisions in Cells';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions' and le.title = 'IF, COUNTIF & SUMIF: Decisions in Cells'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- IF: making cells decide
- COUNTIF/SUMIF: counting & totaling by condition
- Nesting logic for real rules

## 📖 Lesson
**IF** returns one thing if true, another if false:
```
=IF(Score>=70, "Pass", "Fail")
```
Conditions use: =, <>, >, <, >=, <=. Text results go in quotes.

**COUNTIF / SUMIF** apply conditions across ranges:
```
=COUNTIF(City, "Lagos")           → how many in Lagos?
=SUMIF(Region, "South", Amount)   → total for South only
```
**Nested IF** for bands:
```
=IF(Score>=90,"A", IF(Score>=70,"B", IF(Score>=50,"C","F")))
```
(For many bands, newer Excel offers IFS — cleaner.)

These three turn spreadsheets from calculators into decision systems: bonuses, grading, inventory alerts ("IF stock < 10, ''REORDER''").

## 💡 Real-world example
A teacher graded 300 scripts in minutes: nested IF turned raw scores into A–F, then COUNTIF showed how many of each. What took a colleague a weekend took her one coffee.

## ✍️ Practical
1. Add Pass/Fail IF to your scores.
2. COUNTIF by category; SUMIF by region.
3. Build a 4-band grading formula.

## ✅ Checklist
- [ ] IF with text outcomes works
- [ ] COUNTIF/SUMIF with conditions
- [ ] Nested IF (or IFS) built' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions' and le.title = 'IF, COUNTIF & SUMIF: Decisions in Cells'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions' and le.title = 'IF, COUNTIF & SUMIF: Decisions in Cells'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=Vl0H-qTclOg', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=Vl0H-qTclOg'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'VLOOKUP & XLOOKUP: Joining Data Like a Pro', 'video', '17 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'VLOOKUP & XLOOKUP: Joining Data Like a Pro'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'VLOOKUP & XLOOKUP: Joining Data Like a Pro';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions' and le.title = 'VLOOKUP & XLOOKUP: Joining Data Like a Pro'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Looking up values across tables
- VLOOKUP syntax and its traps
- XLOOKUP: the modern replacement

## 📖 Lesson
You have product IDs in one table and prices in another. Lookup functions pull the price across:

**VLOOKUP** (classic):
```
=VLOOKUP(lookup_value, table_range, column_number, FALSE)
```
FALSE = exact match (almost always what you want). Traps: looks RIGHT only; column numbers break if columns move; slow on huge sheets.

**XLOOKUP** (modern, preferred when available):
```
=XLOOKUP(lookup_value, lookup_column, return_column, "Not found")
```
Looks in any direction, has built-in "not found" handling, and won''t break when columns shift.

**Golden rule:** the lookup column must share EXACT values (same IDs, no extra spaces — TRIM() cleans text). This one function family powers invoices, price lists, HR records, inventory matching.

## 💡 Real-world example
An accountant matched 5,000 bank transactions to invoices by reference number with one XLOOKUP column — a two-day manual job done in seconds.

## ✍️ Practical
1. Build two mini tables (IDs ↔ prices).
2. Pull prices across with VLOOKUP.
3. Redo with XLOOKUP including "Not found".

## ✅ Checklist
- [ ] VLOOKUP exact-match working
- [ ] XLOOKUP with fallback
- [ ] Clean lookup values (TRIM)' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions' and le.title = 'VLOOKUP & XLOOKUP: Joining Data Like a Pro'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions' and le.title = 'VLOOKUP & XLOOKUP: Joining Data Like a Pro'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qY95fNIBhJE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qY95fNIBhJE'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Text & Date Functions: Cleaning Real-World Data', 'video', '15 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Text & Date Functions: Cleaning Real-World Data'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Text & Date Functions: Cleaning Real-World Data';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions' and le.title = 'Text & Date Functions: Cleaning Real-World Data'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Text surgery: LEFT, RIGHT, MID, LEN, TRIM, CONCAT
- Date math: days between, DATEDIF, TODAY/NOW
- Fixing messy data in bulk

## 📖 Lesson
**Text functions:**
- `=LEFT(A2,3)` / `=RIGHT(A2,4)` / `=MID(A2,5,3)` — slice text
- `=LEN(A2)` — character count
- `=TRIM(A2)` — remove stray spaces (fixes broken lookups!)
- `=UPPER/LOWER/PROPER` — case control
- `=CONCAT` or `&` — join: `=A2 & " " & B2` builds full names

**Date functions:** dates are numbers in Excel, so math works:
- `=End - Start` → days between
- `=TODAY()`, `=NOW()` — live date/time
- `=DATEDIF(start, end, "y")` → age in years
- `=DAY/MONTH/YEAR()`, `=TEXT(date,"mmm yyyy")` for labels

The real world sends messy exports — phone numbers as text, names in one column, dates as strings. These functions are your cleaning toolkit.

## 💡 Real-world example
HR received "surname, firstname" in one column for 800 staff. MID/FIND/& split and re-ordered them into clean columns in five minutes — by hand it would take days.

## ✍️ Practical
1. Split "Lastname, Firstname" into two columns with formulas.
2. Calculate days between two dates and someone''s age.
3. TRIM a dirty column and count length before/after.

## ✅ Checklist
- [ ] Text slicing & joining fluent
- [ ] Date differences computed
- [ ] Dirty data cleaned' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions' and le.title = 'Text & Date Functions: Cleaning Real-World Data'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 2: Formulas & Functions' and le.title = 'Text & Date Functions: Cleaning Real-World Data'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qY95fNIBhJE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qY95fNIBhJE'
);

with c as (select id from public.courses where slug = 'microsoft-excel')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 3: Analysis & Visualization', 2 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 3: Analysis & Visualization'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Charts That Tell the Story', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Charts That Tell the Story'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Charts That Tell the Story';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization' and le.title = 'Charts That Tell the Story'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Choosing the right chart for the question
- Building and formatting professional charts
- Chart discipline: less ink, more insight

## 📖 Lesson
Match chart to question:
- **Trend over time** → Line
- **Comparison between items** → Column/Bar
- **Part of a whole** → Pie (2–5 slices max, rarely more)
- **Relationship** → Scatter
- **Progress vs target** → Bar with target line

Build: select data → Insert → Recommended Charts. Then format:
- Clear title stating the insight ("Sales grew 40% in Q4", not "Sales")
- Remove gridlines/clutter; add data labels where they help
- One accent color for the important series, gray for the rest
- Legend off when labels can go directly on bars

A chart''s job is to make one point obvious in 3 seconds. If it needs a paragraph of explanation, simplify.

## 💡 Real-world example
A monthly report had 12 pie charts. Replaced with one line chart of revenue + one bar chart of top products, the meeting went from 45 minutes of confusion to 15 minutes of decisions.

## ✍️ Practical
1. Build a line (trend), column (comparison) and pie (share).
2. Give each an insight-stating title.
3. Declutter: remove gridlines, add direct labels.

## ✅ Checklist
- [ ] Chart type matches question
- [ ] Titles state insights
- [ ] Clutter removed' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization' and le.title = 'Charts That Tell the Story'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization' and le.title = 'Charts That Tell the Story'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=Vl0H-qTclOg', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=Vl0H-qTclOg'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Conditional Formatting: Data That Highlights Itself', 'video', '14 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Conditional Formatting: Data That Highlights Itself'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Conditional Formatting: Data That Highlights Itself';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization' and le.title = 'Conditional Formatting: Data That Highlights Itself'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Highlight rules: top/bottom, above average, duplicates
- Data bars, color scales, icon sets
- Formula-based rules for custom alerts

## 📖 Lesson
Conditional formatting makes exceptions jump out — humans scan color faster than numbers.

Home → Conditional Formatting:
- **Highlight rules:** greater than, text contains, duplicate values (great for spotting double entries)
- **Top/bottom rules:** top 10%, above average
- **Data bars:** mini bar charts inside cells (perfect for amounts)
- **Color scales:** heatmaps (green→red) for scores/KPIs
- **Icon sets:** arrows for up/flat/down

**Custom formula rules** (the power move): "Format this row if column E < 10" → `=E2<10` applied to the whole table — instant reorder alerts on inventory.

Rule of taste: formatting should flag 5–10% of cells. If everything glows red, nothing does.

## 💡 Real-world example
An inventory sheet with a red rule on stock < 10 turned "we ran out of product X" surprises into "we re ordered X last week" — one formatting rule, real money saved.

## ✍️ Practical
1. Apply data bars to a sales column.
2. Highlight duplicates in a list of IDs.
3. Create one formula-based alert rule.

## ✅ Checklist
- [ ] Data bars + scales used
- [ ] Duplicates surfaced
- [ ] One custom alert rule live' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization' and le.title = 'Conditional Formatting: Data That Highlights Itself'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization' and le.title = 'Conditional Formatting: Data That Highlights Itself'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qY95fNIBhJE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qY95fNIBhJE'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Pivot Tables: Summarize 10,000 Rows in 10 Seconds', 'video', '18 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Pivot Tables: Summarize 10,000 Rows in 10 Seconds'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Pivot Tables: Summarize 10,000 Rows in 10 Seconds';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization' and le.title = 'Pivot Tables: Summarize 10,000 Rows in 10 Seconds'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The drag-and-drop summary machine
- Rows, columns, values, filters areas
- Answering business questions instantly

## 📖 Lesson
A **Pivot Table** summarizes huge data without formulas. Select clean data → Insert → PivotTable.

The four zones:
- **Rows** — what to group BY (drag "Region" here → one row per region)
- **Values** — what to calculate (drag "Sales" here → sums automatically)
- **Columns** — optional second grouping (e.g. months across the top)
- **Filters** — slice the whole report (year, salesperson)

Click any value → "Show Values As" → % of Grand Total, running total, difference from last month. Change Sum to Count/Average via Value Field Settings.

Questions a pivot answers in seconds: total sales per region? best month? top 5 products? average order per salesperson? Refresh (right-click → Refresh) when data grows.

This single skill is named in more job ads than any other Excel feature.

## 💡 Real-world example
"What were our sales by state and by month?" — with formulas: an hour of SUMIFS and prayer. With a pivot: drag Region to rows, Month to columns, Sales to values. Nine seconds.

## ✍️ Practical
1. Build a 50-row sales dataset (or use yours).
2. Pivot: totals by region; then add months as columns.
3. Show one value as % of grand total.

## ✅ Checklist
- [ ] Pivot created from clean data
- [ ] Rows/columns/values understood
- [ ] % of total displayed' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization' and le.title = 'Pivot Tables: Summarize 10,000 Rows in 10 Seconds'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"},{"title":"Microsoft Learn — Excel learning paths (free)","url":"https://learn.microsoft.com/en-us/training/browse/?products=excel","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization' and le.title = 'Pivot Tables: Summarize 10,000 Rows in 10 Seconds'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=Vl0H-qTclOg', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=Vl0H-qTclOg'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Dashboard Basics: Pivots + Charts + Slicers', 'video', '16 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Dashboard Basics: Pivots + Charts + Slicers'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Dashboard Basics: Pivots + Charts + Slicers';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization' and le.title = 'Dashboard Basics: Pivots + Charts + Slicers'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Turning pivots into an interactive dashboard
- Slicers and timelines for click-to-filter
- Layout rules for one-screen reports

## 📖 Lesson
A **dashboard** = your key numbers on one screen, updated by clicks.

Build recipe:
1. One clean source Table
2. Several pivot tables (each answering one question) — hide them on a "Calc" sheet
3. Pivot **charts** from each pivot, moved to a "Dashboard" sheet
4. **Slicers** (Insert → Slicer): visual filter buttons — connect one slicer to all pivots (Report Connections) so one click filters everything
5. **Timeline** slicer for dates — drag to select month ranges

Layout: big KPI numbers on top, charts below, slicers in a left/right rail. No scrolling needed. Title + "as of" date.

Stakeholders love dashboards because they answer their own questions by clicking — you become the person who gave them superpowers.

## 💡 Real-world example
A student built a one-screen sales dashboard for her uncle''s shop. He checks it on his phone every morning — and introduced her to three business friends who each paid for their own.

## ✍️ Practical
1. Create 2–3 pivots from your data.
2. Build charts + a connected slicer and timeline.
3. Arrange a clean one-screen dashboard.

## ✅ Checklist
- [ ] Slicer filters all pivots
- [ ] One-screen layout
- [ ] KPIs + charts together' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization' and le.title = 'Dashboard Basics: Pivots + Charts + Slicers'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"},{"title":"Free official Excel templates","url":"https://templates.office.com/en-us/templates-for-excel","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 3: Analysis & Visualization' and le.title = 'Dashboard Basics: Pivots + Charts + Slicers'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=Vl0H-qTclOg', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=Vl0H-qTclOg'
);

with c as (select id from public.courses where slug = 'microsoft-excel')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 4: Real-World Projects & Automation', 3 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 4: Real-World Projects & Automation'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Project 1: Personal Budget & Expense Tracker', 'video', '18 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Project 1: Personal Budget & Expense Tracker'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Project 1: Personal Budget & Expense Tracker';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation' and le.title = 'Project 1: Personal Budget & Expense Tracker'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Designing a practical tracker from scratch
- SUMIF category summaries & remaining budget
- Turning a sheet into a habit

## 📖 Lesson
Build a budget workbook with 3 sheets:
1. **Setup** — income sources + spending categories with monthly limits
2. **Log** — Table: Date | Category | Description | Amount (one row per expense)
3. **Summary** — SUMIF per category vs limit, remaining balance, % used with conditional formatting (green <70%, amber <90%, red ≥90%)

Key formulas:
```
=SUMIF(Log[Category], "Food", Log[Amount])     → spent on food
=Limit - Spent                                   → remaining
=Spent / Limit                                   → % used
```
Add a simple dashboard: data bars per category + one chart of top categories.

Design lesson: tools people enjoy using get used. Keep logging to 3 columns so entering an expense takes 10 seconds.

## 💡 Real-world example
Students who tracked one real month reported the same insight: seeing "Food: 45% of income" in red changes behaviour faster than any advice.

## ✍️ Practical
1. Build all 3 sheets with formulas wired.
2. Log 10 expenses; watch the summary update.
3. Add conditional formatting alerts at 90%.

## ✅ Checklist
- [ ] SUMIF summaries correct
- [ ] Alerts fire at thresholds
- [ ] Logging takes <15 seconds' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation' and le.title = 'Project 1: Personal Budget & Expense Tracker'
)
update public.course_lessons le
   set resources = '[{"title":"Free official Excel templates","url":"https://templates.office.com/en-us/templates-for-excel","type":"resource"},{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation' and le.title = 'Project 1: Personal Budget & Expense Tracker'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qY95fNIBhJE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qY95fNIBhJE'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Project 2: Invoice & Sales System', 'video', '18 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Project 2: Invoice & Sales System'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Project 2: Invoice & Sales System';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation' and le.title = 'Project 2: Invoice & Sales System'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Building a professional invoice generator
- Product lookup, tax, totals automation
- Sales tracking with pivot summaries

## 📖 Lesson
Sheet 1 — **Products**: Table of ID, name, price (the source of truth).
Sheet 2 — **Invoice**: header with your branding; line items where typing a product ID pulls name + price via XLOOKUP; Qty × Price per line; subtotal, VAT (7.5%: `=Subtotal*0.075`), grand total. Invoice number + date cells; "Paid / Unpaid" status column.
Sheet 3 — **Sales Log**: every invoice appended (date, client, total, status) as a Table → pivot dashboard: revenue by month, unpaid invoices, top clients.

Polish: print area set to one page (Page Layout), your logo, clean borders, currency format throughout. Export as PDF when sending (File → Export → PDF).

## 💡 Real-world example
A freelance designer''s invoices went from Word docs she re-typed (with math errors) to this workbook. Clients noticed immediately — "your invoices look like a real company''s".

## ✍️ Practical
1. Build Products + Invoice with XLOOKUP lines.
2. Add VAT + grand total formulas.
3. Log 3 invoices; pivot the sales summary.

## ✅ Checklist
- [ ] XLOOKUP lines working
- [ ] VAT + totals automatic
- [ ] One-page PDF export clean' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation' and le.title = 'Project 2: Invoice & Sales System'
)
update public.course_lessons le
   set resources = '[{"title":"Free official Excel templates","url":"https://templates.office.com/en-us/templates-for-excel","type":"resource"},{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation' and le.title = 'Project 2: Invoice & Sales System'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=Vl0H-qTclOg', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=Vl0H-qTclOg'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Project 3: Data Cleaning & Reports Challenge', 'video', '17 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Project 3: Data Cleaning & Reports Challenge'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Project 3: Data Cleaning & Reports Challenge';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation' and le.title = 'Project 3: Data Cleaning & Reports Challenge'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- A repeatable cleaning pipeline
- Text-to-columns, Remove Duplicates, Paste Special
- Producing a polished monthly report

## 📖 Lesson
Real data arrives dirty. Your pipeline:
1. **TRIM + CLEAN** stray spaces/characters
2. **Text to Columns** (Data) splits "Surname, Firstname" or CSV blobs
3. **Remove Duplicates** on key columns (Data → Remove Duplicates)
4. **Fix types:** dates that arrived as text (Text-to-Columns trick or DATEVALUE), numbers stored as text (multiply by 1 via Paste Special)
5. **Standardize:** PROPER for names, one city spelling list via lookup

**Paste Special** is the hidden hero: paste values only (kill formulas before sharing), transpose (rows→columns), add/multiply values in place.

Finish: pivot summary + chart + conditional highlights → export PDF. Same pipeline every month = a service businesses pay for monthly.

## 💡 Real-world example
An ops manager received the same messy export every Monday. She built the pipeline once; Mondays went from 2 hours of fixing to 10 minutes of running.

## ✍️ Practical
1. Create (or download) a deliberately messy dataset.
2. Run the full 5-step pipeline.
3. Output a one-page summary report PDF.

## ✅ Checklist
- [ ] Pipeline steps all applied
- [ ] Paste Special values/transposed used
- [ ] Clean report exported' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation' and le.title = 'Project 3: Data Cleaning & Reports Challenge'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation' and le.title = 'Project 3: Data Cleaning & Reports Challenge'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qY95fNIBhJE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qY95fNIBhJE'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Automation Basics: Macros, Shortcuts & Next Steps', 'project', '16 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Automation Basics: Macros, Shortcuts & Next Steps'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation'
)
update public.course_lessons le set type = 'project'
  from m where le.module_id = m.module_id and le.title = 'Automation Basics: Macros, Shortcuts & Next Steps';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation' and le.title = 'Automation Basics: Macros, Shortcuts & Next Steps'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Recording your first macro safely
- The shortcut arsenal of power users
- Where to go next: Power Query, Power BI

## 📖 Lesson
**Macros** record your clicks so one button replays them: View → Macros → Record Macro → do the steps → Stop. Example: format a raw export (bold headers, freeze panes, borders, widths) in one click. Save as `.xlsm` (macro-enabled). Rules: never run macros from unknown sources; macros are for YOUR repetitive steps.

**Shortcut arsenal (memorize these ten):**
Ctrl+C/V/Z • Ctrl+Shift+L (filters) • Ctrl+T (table) • Ctrl+1 (format cells) • Ctrl+; (today''s date) • F4 (repeat / absolute ref) • Ctrl+PgUp/PgDn (switch sheets) • Alt+= (autosum) • Ctrl+Shift+End (select to data end) • Ctrl+E (Flash Fill)

**Next level:** **Power Query** (Data → Get Data) automates cleaning pipelines; **Power BI** turns Excel skills into full dashboards. Both use what you already know — and both are paid skills in high demand.

## 💡 Real-world example
A records clerk recorded a macro for her daily report formatting. The 20-minute daily task became one keystroke — her manager gave her the whole department''s reporting.

## ✍️ Practical
1. Record a formatting macro; replay it on new data.
2. Drill the 10 shortcuts for 10 minutes.
3. Open Power Query and import one file.

## ✅ Checklist
- [ ] First macro recorded & replayed
- [ ] 10 shortcuts memorized
- [ ] Power Query explored' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation' and le.title = 'Automation Basics: Macros, Shortcuts & Next Steps'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Learn — Excel learning paths (free)","url":"https://learn.microsoft.com/en-us/training/browse/?products=excel","type":"course"},{"title":"Microsoft Excel official training","url":"https://support.microsoft.com/en-us/excel","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-excel' and mo.title = 'Module 4: Real-World Projects & Automation' and le.title = 'Automation Basics: Macros, Shortcuts & Next Steps'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=qY95fNIBhJE', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=qY95fNIBhJE'
);

with c as (select id from public.courses where slug = 'microsoft-excel')
insert into public.quizzes (course_id, title, description, passing_score, allow_retake, is_final, status, attempt_limit)
select c.id, 'Final Assessment — Microsoft Excel', 'Final assessment — pass to move toward your certificate.', 70, true, true, 'published', null from c
where not exists (
  select 1 from public.quizzes z where z.course_id = c.id and z.title = 'Final Assessment — Microsoft Excel'
);
update public.quizzes z set lesson_id = le.id
  from public.course_lessons le
 where z.course_id = le.course_id and le.title = 'Automation Basics: Macros, Shortcuts & Next Steps'
   and z.title = 'Final Assessment — Microsoft Excel' and exists (select 1 from public.courses c where c.id = z.course_id and c.slug = 'microsoft-excel');
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-excel' and z.title = 'Final Assessment — Microsoft Excel')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Every Excel formula starts with which character?', '["=","#","@","$"]'::jsonb,
0, '[]'::jsonb,
'= tells Excel you are entering a formula, not text.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Every Excel formula starts with which character?'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-excel' and z.title = 'Final Assessment — Microsoft Excel')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Pressing F4 on a cell reference toggles…', '["Absolute/relative reference ($ signs)","Spell check","Print preview","Font color"]'::jsonb,
0, '[]'::jsonb,
'F4 cycles $A$1 → A$1 → $A1 → A1 — essential for copied formulas.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Pressing F4 on a cell reference toggles…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-excel' and z.title = 'Final Assessment — Microsoft Excel')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'VLOOKUP’s final argument FALSE means…', '["Require an exact match","Allow approximate match","Hide errors","Sort the data"]'::jsonb,
0, '[]'::jsonb,
'FALSE = exact match — almost always what lookups need.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'VLOOKUP’s final argument FALSE means…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-excel' and z.title = 'Final Assessment — Microsoft Excel')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Ctrl+T converts a data range into a Table that auto-expands with new rows.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Tables absorb new rows automatically, keeping formulas and charts correct.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Ctrl+T converts a data range into a Table that auto-expands with new rows.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-excel' and z.title = 'Final Assessment — Microsoft Excel')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_answer', 'Which functions summarize data by condition? (Select all that apply)', '["SUMIF","COUNTIF","IF","TRIM"]'::jsonb,
null, '[0,1]'::jsonb,
'SUMIF/COUNTIF aggregate by condition; IF decides per cell, TRIM cleans text.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which functions summarize data by condition? (Select all that apply)'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-excel' and z.title = 'Final Assessment — Microsoft Excel')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A Pivot Table is the fastest tool for…', '["Summarizing large datasets by categories","Drawing pictures","Writing emails","Formatting fonts"]'::jsonb,
0, '[]'::jsonb,
'Drag fields into rows/columns/values and huge data summarizes instantly.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A Pivot Table is the fastest tool for…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-excel' and z.title = 'Final Assessment — Microsoft Excel')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'The error #REF! usually means…', '["A formula refers to deleted/invalid cells","Division by zero","The file is saved","The cell is text"]'::jsonb,
0, '[]'::jsonb,
'#REF! = broken reference; #DIV/0! and #VALUE! are different errors.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'The error #REF! usually means…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-excel' and z.title = 'Final Assessment — Microsoft Excel')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Conditional formatting is ideal for…', '["Making exceptions and patterns visible instantly","Renaming sheets","Protecting passwords","Sending emails"]'::jsonb,
0, '[]'::jsonb,
'Color rules flag outliers (low stock, high spend) at a glance.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Conditional formatting is ideal for…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-excel' and z.title = 'Final Assessment — Microsoft Excel')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Formatting a cell as Currency changes how the number displays, not its value.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Formats are display-only — formulas still see the raw number.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Formatting a cell as Currency changes how the number displays, not its value.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-excel' and z.title = 'Final Assessment — Microsoft Excel')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Which shortcut turns filters on/off for a data range?', '["Ctrl+Shift+L","Ctrl+P","Alt+F4","Ctrl+K"]'::jsonb,
0, '[]'::jsonb,
'Ctrl+Shift+L toggles AutoFilter dropdowns on the header row.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which shortcut turns filters on/off for a data range?'
);
with c as (select id from public.courses where slug = 'microsoft-excel')
insert into public.assignments (course_id, title, description, instructions, required_output, max_score, is_final_project, status)
select c.id, 'Final Project: Business Dashboard Workbook', 'Build an Excel workbook that manages and reports on a realistic business dataset (sales, inventory or expenses).', '1) Create a clean data table (50+ rows) with proper headers, no merged cells — convert it to a Table (Ctrl+T).
2) Use formulas: at least SUMIF/COUNTIF summaries, one IF-based alert, one lookup (XLOOKUP or VLOOKUP).
3) Apply conditional formatting rules that flag exceptions.
4) Build a Pivot Table answering 3 business questions (e.g. totals by category, by month, top items).
5) Assemble a one-screen dashboard: KPIs, 2 charts from the pivot, a slicer, and a clear title.', 'Submit the .xlsx workbook plus a one-page PDF explaining what each sheet does and the 3 questions your dashboard answers.', 100, true, 'published' from c
where not exists (
  select 1 from public.assignments a where a.course_id = c.id and a.title = 'Final Project: Business Dashboard Workbook'
);
update public.assignments a set lesson_id = le.id
  from public.course_lessons le
 where a.course_id = le.course_id and le.title = 'Automation Basics: Macros, Shortcuts & Next Steps'
   and a.title = 'Final Project: Business Dashboard Workbook' and exists (select 1 from public.courses c where c.id = a.course_id and c.slug = 'microsoft-excel');
with c as (select id from public.courses where slug = 'microsoft-excel')
insert into public.course_completion_rules (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project)
select c.id, 100, 70, 0, true from c
on conflict (course_id) do update
  set require_lessons_pct = excluded.require_lessons_pct,
      require_quiz_avg = excluded.require_quiz_avg,
      require_assignments_approved = excluded.require_assignments_approved,
      require_final_project = excluded.require_final_project,
      updated_at = now();

-- ---------- microsoft-word ----------
with c as (select id from public.courses where slug = 'microsoft-word')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 1: Word Fundamentals', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 1: Word Fundamentals'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Interface, Documents & Typing Like a Pro', 'video', '14 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Interface, Documents & Typing Like a Pro'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Interface, Documents & Typing Like a Pro';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals' and le.title = 'Interface, Documents & Typing Like a Pro'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The Word window: ribbon, ruler, views
- Creating, saving (docx vs PDF) and autosave
- Selection & editing shortcuts that save hours

## 📖 Lesson
Word''s window: the **ribbon** (Home/Insert/Layout/References), the **ruler** (margins & indents), and views at bottom-right (**Print Layout** is your daily view).

Save discipline: Ctrl+S early and often; OneDrive autosave protects against crashes. Know your formats: **.docx** for working/editing, **PDF** for final delivery (File → Export → PDF) so nobody can change it and it looks identical everywhere.

**Selection skills (the #1 speed lever):**
- Double-click = select word; triple-click = select paragraph
- Ctrl+A = everything; Ctrl+Shift+arrows = precise selection
- Ctrl+X cut / Ctrl+C copy / Ctrl+V paste / **Ctrl+Shift+V paste without formatting** (kills messy web text)
- Ctrl+Z undo — experiment fearlessly

Formatting basics: bold/italic/underline, font size 11–12 for body, 1.15–1.5 line spacing for readability. Never press Enter repeatedly to create space — you''ll learn the proper way (paragraph spacing) in Module 2.

## 💡 Real-world example
A job applicant pasted web content into her cover letter — it arrived with 5 different fonts. The recruiter noticed before the words. Paste clean, format intentionally.

## ✍️ Practical
1. Create a document; type 3 paragraphs.
2. Practice word/paragraph selection until automatic.
3. Save as .docx, then export a PDF copy.

## ✅ Checklist
- [ ] docx vs PDF understood
- [ ] Selection shortcuts automatic
- [ ] Paste-clean habit formed' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals' and le.title = 'Interface, Documents & Typing Like a Pro'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Word official training","url":"https://support.microsoft.com/en-us/word","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals' and le.title = 'Interface, Documents & Typing Like a Pro'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=C4sYQffoxAU', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=C4sYQffoxAU'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Paragraph Formatting & Spacing Done Right', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Paragraph Formatting & Spacing Done Right'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Paragraph Formatting & Spacing Done Right';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals' and le.title = 'Paragraph Formatting & Spacing Done Right'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Alignment, line spacing & paragraph spacing
- Indents vs tabs; bullets vs numbering
- Show/hide ¶ to see what''s really there

## 📖 Lesson
Professional spacing comes from **paragraph settings**, not Enter keys:
- **Space Before/After** (Layout tab or Home → Line Spacing) separates paragraphs — set 6–12pt after paragraphs
- **Line spacing** 1.15–1.5 for reading comfort
- **Alignment:** justify looks formal but creates "rivers" of space; left-aligned is safer and more readable

**Lists:** bullets for unordered items, numbering (Home → Numbering) for steps. Never type "1." manually — real numbering restarts/continues correctly and indents uniformly.

**Indents:** use the ruler or Layout indents; use Tab once at line starts, never spaces.

**The ¶ button** (Home) reveals hidden marks: ¶ = paragraph break (you pressed Enter), • = space, → = tab. Turn it on whenever formatting behaves strangely — you''ll SEE the cause instantly.

## 💡 Real-world example
A report "kept breaking" across pages — ¶ revealed 14 empty paragraph marks the author used as spacing. Deleted and replaced with proper spacing: same look, no broken pages.

## ✍️ Practical
1. Format a page with proper paragraph spacing (no Enter-stacking).
2. Create one bulleted and one numbered list.
3. Turn on ¶ and inspect your document''s hidden marks.

## ✅ Checklist
- [ ] Spacing via settings, not Enter
- [ ] Both list types correct
- [ ] ¶ diagnostic habit built' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals' and le.title = 'Paragraph Formatting & Spacing Done Right'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Word official training","url":"https://support.microsoft.com/en-us/word","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals' and le.title = 'Paragraph Formatting & Spacing Done Right'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=C4sYQffoxAU', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=C4sYQffoxAU'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Styles: The Single Most Important Word Skill', 'video', '16 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Styles: The Single Most Important Word Skill'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Styles: The Single Most Important Word Skill';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals' and le.title = 'Styles: The Single Most Important Word Skill'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Heading 1/2/3 + Normal styles vs manual bold
- Instant reformatting & automatic tables of contents
- Style sets and modifying styles

## 📖 Lesson
Amateurs make titles bold and big by hand. Professionals use **Styles** (Home → Styles gallery):
- Apply **Heading 1** to chapter titles, **Heading 2** to sections, **Heading 3** to subsections, **Normal** to body text
- **Magic 1 — instant retheming:** modify Heading 1 once (right-click → Modify: color, font, size) and EVERY heading in a 100-page document updates
- **Magic 2 — automatic Table of Contents:** References → Table of Contents reads your headings and builds page-numbered contents that UPDATE when the document changes
- **Magic 3 — navigation:** View → Navigation Pane shows your document as an outline; click to jump between sections

Styles also make documents accessible (screen readers use them) — required for many corporate/government submissions.

## 💡 Real-world example
A student''s 60-page project needed every heading changed from blue to black at 11pm before submission. Hand-formatted, that''s an all-nighter; with styles, one Modify click — done in 30 seconds.

## ✍️ Practical
1. Apply Heading 1/2/3 + Normal to a document.
2. Modify Heading 1 and watch everything update.
3. Insert an automatic Table of Contents.

## ✅ Checklist
- [ ] All titles use real Styles
- [ ] One-click retheme works
- [ ] Auto TOC inserted' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals' and le.title = 'Styles: The Single Most Important Word Skill'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Word official training","url":"https://support.microsoft.com/en-us/word","type":"docs"},{"title":"Microsoft Learn — Word learning paths (free)","url":"https://learn.microsoft.com/en-us/training/browse/?products=word","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals' and le.title = 'Styles: The Single Most Important Word Skill'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=965N2_vtBUc', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=965N2_vtBUc'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Tables, Images & Smart Layouts', 'video', '16 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Tables, Images & Smart Layouts'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Tables, Images & Smart Layouts';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals' and le.title = 'Tables, Images & Smart Layouts'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Building and styling tables properly
- Inserting images with correct text wrapping
- Columns, borders and page breaks

## 📖 Lesson
**Tables** (Insert → Table):
- Choose rows × columns; drag borders to resize; use Table Design styles for instant professional look
- Add/remove rows and columns via right-click
- Repeat header row on every page (Layout → Repeat Header Rows) for long tables
- Tables are for DATA; if you''re using a table just to position text, use columns or alignment instead

**Images** (Insert → Pictures):
- The #1 beginner fight is text wrapping: select image → **Wrap Text → Square/Tight** to place images beside text; **In Line** keeps images in the text flow
- Resize by dragging CORNER handles only (sides distort)

**Layout tools:** Layout → Columns (newsletter style), Page Break (Ctrl+Enter — NEVER multiple Enters to reach a new page).

## 💡 Real-world example
An image that "jumped around" every time text was edited was set to In Line wrapping by accident. Switching to Square + fixed position ended the fight instantly — wrapping mode is the answer 90% of the time.

## ✍️ Practical
1. Build a 5×4 table with styled header row.
2. Insert an image with Square wrapping beside text.
3. Force a clean page break with Ctrl+Enter.

## ✅ Checklist
- [ ] Table styled with repeating header
- [ ] Image wrapping controlled
- [ ] Page breaks (not Enters) used' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals' and le.title = 'Tables, Images & Smart Layouts'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Word official training","url":"https://support.microsoft.com/en-us/word","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 1: Word Fundamentals' and le.title = 'Tables, Images & Smart Layouts'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=C4sYQffoxAU', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=C4sYQffoxAU'
);

with c as (select id from public.courses where slug = 'microsoft-word')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 2: Professional Documents', 1 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 2: Professional Documents'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Letters, Memos & Business Correspondence', 'video', '15 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Letters, Memos & Business Correspondence'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Letters, Memos & Business Correspondence';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents' and le.title = 'Letters, Memos & Business Correspondence'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Standard business letter structure
- Letterheads, headers/footers & page numbers
- Tone and formatting conventions that look professional

## 📖 Lesson
Business letter anatomy (top to bottom): your letterhead/contact → date → recipient address → salutation ("Dear Mr. Adeyemi,") → body (3 short paragraphs: purpose, details, requested action) → closing ("Yours sincerely") → signature → name/title.

**Headers & footers** (double-click page top/bottom): logo, company contacts, page numbers (Insert → Page Number). "Different First Page" lets page 1 carry the full letterhead while later pages get a slim header.

**Formatting conventions:** font size 11–12, left-aligned, single spacing within paragraphs, blank line between paragraphs, 2.5cm margins default. Print to PDF for sending.

Memos are simpler: a To/From/Date/Subject block then straight to the point.

## 💡 Real-world example
Two companies bid for the same contract with similar prices. The one with the proper letterhead, clean spacing and numbered pages was described as "more established" — format spoke before content.

## ✍️ Practical
1. Create a letterhead (logo + contacts in header).
2. Write a full formal letter with all parts.
3. Add page numbers and export to PDF.

## ✅ Checklist
- [ ] Letter anatomy complete
- [ ] Header/footer with branding
- [ ] PDF exported' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents' and le.title = 'Letters, Memos & Business Correspondence'
)
update public.course_lessons le
   set resources = '[{"title":"Free official Word templates (CVs, letters, reports)","url":"https://templates.office.com/en-us/templates-for-word","type":"resource"},{"title":"Microsoft Word official training","url":"https://support.microsoft.com/en-us/word","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents' and le.title = 'Letters, Memos & Business Correspondence'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=C4sYQffoxAU', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=C4sYQffoxAU'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Reports & Long Documents: TOC, Captions, References', 'video', '17 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Reports & Long Documents: TOC, Captions, References'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Reports & Long Documents: TOC, Captions, References';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents' and le.title = 'Reports & Long Documents: TOC, Captions, References'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Section breaks: independent headers & orientations
- Figure captions and automatic lists of figures
- Footnotes, citations and bibliography basics

## 📖 Lesson
**Section breaks** (Layout → Breaks) split a document into zones with independent formatting — the tool for: portrait chapters with one landscape table page, or a cover page with no header/page number ("Different First Page" per section, unlink from previous).

**Captions:** right-click any image/table → Insert Caption ("Figure 1", "Table 2") — auto-numbered, and References → Insert Table of Figures builds an automatic list of all figures with pages.

**References tab:**
- Footnotes (Alt+Ctrl+F) for asides/sources at page bottom
- Insert Citation + Bibliography for academic work — Word manages the list; choose style (APA is common in Nigeria)

Structure template for reports: Cover → TOC → Executive Summary → Sections (Heading 1/2) → Conclusion → References. Every heading is a real Style — the TOC depends on it.

## 💡 Real-world example
A final-year student formatted figure numbers by hand; adding one figure mid-document meant renumbering 30 captions. With Insert Caption, everything renumbered itself — professors also trust auto-numbering.

## ✍️ Practical
1. Add a section break; make one page landscape.
2. Caption 3 figures; insert a Table of Figures.
3. Add one footnote and one APA citation.

## ✅ Checklist
- [ ] Section break controls orientation
- [ ] Auto captions + figure list
- [ ] Footnote/citation added' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents' and le.title = 'Reports & Long Documents: TOC, Captions, References'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Word official training","url":"https://support.microsoft.com/en-us/word","type":"docs"},{"title":"Microsoft Learn — Word learning paths (free)","url":"https://learn.microsoft.com/en-us/training/browse/?products=word","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents' and le.title = 'Reports & Long Documents: TOC, Captions, References'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=965N2_vtBUc', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=965N2_vtBUc'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Headers, Footers, Page Numbers & Cover Pages', 'video', '14 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Headers, Footers, Page Numbers & Cover Pages'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Headers, Footers, Page Numbers & Cover Pages';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents' and le.title = 'Headers, Footers, Page Numbers & Cover Pages'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Different first page & odd/even pages
- Page numbering from page N
- Cover pages that set the tone

## 📖 Lesson
Double-click the top/bottom margin to edit headers/footers. Key options (Header & Footer tab):
- **Different First Page** — cover stays clean; numbering starts on page 2
- **Page Number → Format** — choose "Start at 0" so the second physical page shows "1" (classic for documents with covers)
- Odd/Even different — for printed, bound documents

**Cover pages** (Insert → Cover Page): built-in designs, or build your own: institution/logo top, big title centered, author + date at bottom. One page, high impact — it''s the first thing an examiner or client sees.

Combine with section breaks for full control: cover (no number) → TOC (roman i, ii) → body (arabic 1, 2) is the standard academic/corporate pattern.

## 💡 Real-world example
A consultant delivered a proposal with cover + TOC where body pages still showed "page 3 of 47". The client''s admin returned it: "pages should start at the introduction." The fix is exactly the start-at/section technique above.

## ✍️ Practical
1. Build a cover page + different first page setting.
2. Number the body starting at 1 after cover+TOC.
3. Use roman numerals for the TOC pages.

## ✅ Checklist
- [ ] Cover page clean (no number)
- [ ] Body starts at page 1
- [ ] TOC uses roman numerals' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents' and le.title = 'Headers, Footers, Page Numbers & Cover Pages'
)
update public.course_lessons le
   set resources = '[{"title":"Free official Word templates (CVs, letters, reports)","url":"https://templates.office.com/en-us/templates-for-word","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents' and le.title = 'Headers, Footers, Page Numbers & Cover Pages'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=C4sYQffoxAU', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=C4sYQffoxAU'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Review Tools: Track Changes, Comments & Compare', 'video', '15 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Review Tools: Track Changes, Comments & Compare'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Review Tools: Track Changes, Comments & Compare';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents' and le.title = 'Review Tools: Track Changes, Comments & Compare'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Track Changes workflow for teams
- Comments vs edits (when to use each)
- Accepting/rejecting and comparing documents

## 📖 Lesson
**Track Changes** (Review tab) records every insertion, deletion and format change — the professional way to review:
- Reviewer edits with tracking ON; changes appear colored per author
- Owner: Accept/Reject each change (or Accept All) via Review → Changes
- **Comments** (Ctrl+Alt+M) for questions/feedback that shouldn''t alter text — always resolve/delete before final delivery

**Etiquette:** edits for fixes, comments for opinions. Never send a client document with unresolved tracked changes or internal comments — check Document Inspector (File → Info → Check for Issues) before publishing.

**Compare** (Review → Compare) shows differences between two file versions — useful when someone ignored track changes and sent you "final_v2_REAL.docx".

## 💡 Real-world example
A law firm intern once delivered a contract still containing the comment "we can bluff them on clause 4"… Learn Document Inspector before, not after, an incident.

## ✍️ Practical
1. Turn on Track Changes; make 3 edits + 2 comments.
2. Accept one change, reject one, answer a comment.
3. Run Document Inspector and clean hidden data.

## ✅ Checklist
- [ ] Track changes used correctly
- [ ] Comments vs edits distinguished
- [ ] Inspector run before "final"' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents' and le.title = 'Review Tools: Track Changes, Comments & Compare'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Word official training","url":"https://support.microsoft.com/en-us/word","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 2: Professional Documents' and le.title = 'Review Tools: Track Changes, Comments & Compare'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=965N2_vtBUc', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=965N2_vtBUc'
);

with c as (select id from public.courses where slug = 'microsoft-word')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 3: Mail Merge & Productivity', 2 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 3: Mail Merge & Productivity'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Mail Merge: 500 Personalized Letters in 10 Minutes', 'video', '18 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Mail Merge: 500 Personalized Letters in 10 Minutes'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Mail Merge: 500 Personalized Letters in 10 Minutes';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity' and le.title = 'Mail Merge: 500 Personalized Letters in 10 Minutes'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Mailings tab: letters, labels & emails at scale
- Connecting an Excel recipient list
- Preview, finish & merge safely

## 📖 Lesson
**Mail Merge** creates personalized documents in bulk — same letter, 500 different names.

Steps (Mailings tab):
1. **Start Mail Merge → Letters** (or Labels/Emails)
2. **Select Recipients → Use an Existing List** — point to your Excel/CSV (one row per person: Name, Address, Amount…)
3. **Insert Merge Fields** where personalization goes: «FirstName», «Amount»
4. **Preview Results** — flip through records checking for blanks/errors
5. **Finish & Merge** → to printer, individual files, or email

Rules that save you: clean the recipient list FIRST (no blanks, consistent titles); test-merge one record before printing 500; keep the source Excel as your database of truth.

Beyond letters: certificates, payslips, ID labels, result letters — every batch document in schools, HR and churches is a mail merge.

## 💡 Real-world example
A school typed 600 result letters manually one year — two weeks of work. The next term they mail-merged from their Excel register: done before lunch.

## ✍️ Practical
1. Build a 10-person Excel list (name, company, amount).
2. Merge into a personalized letter template.
3. Preview all records; finish to a new document.

## ✅ Checklist
- [ ] Excel list connected
- [ ] Fields placed & previewed
- [ ] Merge finished cleanly' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity' and le.title = 'Mail Merge: 500 Personalized Letters in 10 Minutes'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Word official training","url":"https://support.microsoft.com/en-us/word","type":"docs"},{"title":"Microsoft Learn — Word learning paths (free)","url":"https://learn.microsoft.com/en-us/training/browse/?products=word","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity' and le.title = 'Mail Merge: 500 Personalized Letters in 10 Minutes'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=965N2_vtBUc', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=965N2_vtBUc'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Templates: Build Once, Reuse Forever', 'video', '14 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Templates: Build Once, Reuse Forever'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Templates: Build Once, Reuse Forever';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity' and le.title = 'Templates: Build Once, Reuse Forever'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Creating .dotx templates for repeated documents
- Protecting structure while allowing edits
- Team-wide document standards

## 📖 Lesson
If you produce the same document type repeatedly (invoices, letters, reports, forms), make it a **template**: design once → File → Save As → Word Template (.dotx). Opening a template creates a fresh copy — the original can never be overwritten by accident.

Template best practices:
- Bake in: styles, logo/header, margins, boilerplate text, placeholders like [CLIENT NAME]
- **Restrict Editing** (Review → Restrict Editing): allow only form filling or specific regions — users can''t break the layout
- Use **content controls** (Developer tab: text boxes, date pickers, dropdowns) for fill-in fields

Businesses pay for this: a set of branded templates (letter, memo, report, quote) is a sellable deliverable, and consistency across a company''s documents reads as professionalism.

## 💡 Real-world example
An HR team''s offer letters had 4 slightly different formats. One consultant delivered a restricted .dotx with dropdowns for role/level — every offer since looks identical, and mistakes dropped to zero.

## ✍️ Practical
1. Convert your letter/report into a .dotx template.
2. Add Restrict Editing with form-fill exceptions.
3. Open the template twice — verify originals stay intact.

## ✅ Checklist
- [ ] .dotx saves fresh copies
- [ ] Editing restricted sensibly
- [ ] Placeholders clearly marked' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity' and le.title = 'Templates: Build Once, Reuse Forever'
)
update public.course_lessons le
   set resources = '[{"title":"Free official Word templates (CVs, letters, reports)","url":"https://templates.office.com/en-us/templates-for-word","type":"resource"},{"title":"Microsoft Word official training","url":"https://support.microsoft.com/en-us/word","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity' and le.title = 'Templates: Build Once, Reuse Forever'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=965N2_vtBUc', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=965N2_vtBUc'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Forms & Fillable Documents', 'video', '15 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Forms & Fillable Documents'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Forms & Fillable Documents';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity' and le.title = 'Forms & Fillable Documents'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Developer tab & content controls
- Text, date, dropdown & checkbox fields
- Locking forms for clean data collection

## 📖 Lesson
Turn any document into a form people fill without breaking (enable Developer tab: File → Options → Customize Ribbon → check Developer):

**Content controls:**
- **Rich Text / Plain Text** — name, address fields
- **Date Picker** — calendar popup, no format arguments
- **Drop-Down List** — fixed choices (state, department)
- **Check Box** — yes/no options

Design rules: label clearly above or beside each field; give fields room (underscores look tidy but fight with typing — use bordered text controls instead); group sections with headings.

Finish with **Restrict Editing → Filling in forms** — recipients can ONLY fill the controls. Distribute as .docx (or .dotx) and collect responses by email. For anything needing many responses, pair with Microsoft Forms — but for contracts, HR documents and official records, Word forms are the standard.

## 💡 Real-world example
A clinic replaced its photocopied intake sheet with a Word form: dropdowns for visit type, date pickers for DOB. Data entry errors into their system dropped immediately — clean collection beats cleanup.

## ✍️ Practical
1. Build an intake form: 3 text fields, date picker, 2 dropdowns, checkboxes.
2. Restrict editing to form filling.
3. Send to someone to fill — verify nothing breaks.

## ✅ Checklist
- [ ] 4 control types used
- [ ] Form locked to filling
- [ ] Filled copy received cleanly' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity' and le.title = 'Forms & Fillable Documents'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Word official training","url":"https://support.microsoft.com/en-us/word","type":"docs"},{"title":"Microsoft Learn — Word learning paths (free)","url":"https://learn.microsoft.com/en-us/training/browse/?products=word","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity' and le.title = 'Forms & Fillable Documents'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=965N2_vtBUc', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=965N2_vtBUc'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Speed Word: Shortcuts, Find/Replace & Macros', 'video', '14 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Speed Word: Shortcuts, Find/Replace & Macros'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Speed Word: Shortcuts, Find/Replace & Macros';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity' and le.title = 'Speed Word: Shortcuts, Find/Replace & Macros'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The shortcut set that doubles your speed
- Advanced Find & Replace (wildcards, formats)
- Quick Parts & simple automation

## 📖 Lesson
**Essential shortcuts:** Ctrl+B/I/U • Ctrl+Enter (page break) • Ctrl+Shift+N (apply Normal style) • Alt+Ctrl+1/2/3 (Heading 1/2/3!) • Ctrl+F (find) • Ctrl+H (replace) • Shift+F3 (change case) • Ctrl+K (link) • F4 (repeat last action — criminally underrated).

**Find & Replace (Ctrl+H) superpowers:**
- Replace text everywhere ("2023" → "2024")
- More → Format: find all red text, or replace all Arial with Calibri
- Special: find extra paragraph marks (^p^p → ^p collapses double spacing)

**Quick Parts** (Insert → Quick Part): save reusable blocks — signature blocks, company boilerplate, tables — insert in two clicks anywhere.

Finish by recording your repetitive cleanup (View → Macros): e.g. a macro that applies your styles + header to any pasted document.

## 💡 Real-world example
An editor received a 200-page manuscript double-spaced with Enter keys. Find ^p^p → ^p, one Replace All, 20 seconds — then styles cleaned the rest. Client saw "magic"; you''ll know it''s Find & Replace.

## ✍️ Practical
1. Memorize + drill the Alt+Ctrl+1/2/3 heading shortcuts.
2. Use Replace All to fix a repeated mistake document-wide.
3. Save one Quick Part and insert it twice.

## ✅ Checklist
- [ ] Heading shortcuts automatic
- [ ] Replace with formats used
- [ ] One Quick Part in service' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity' and le.title = 'Speed Word: Shortcuts, Find/Replace & Macros'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Word official training","url":"https://support.microsoft.com/en-us/word","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 3: Mail Merge & Productivity' and le.title = 'Speed Word: Shortcuts, Find/Replace & Macros'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=965N2_vtBUc', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=965N2_vtBUc'
);

with c as (select id from public.courses where slug = 'microsoft-word')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 4: Real Projects & Getting Paid', 3 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 4: Real Projects & Getting Paid'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Project 1: Professional CV & Cover Letter', 'video', '18 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Project 1: Professional CV & Cover Letter'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Project 1: Professional CV & Cover Letter';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid' and le.title = 'Project 1: Professional CV & Cover Letter'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- CV structure recruiters actually read
- One-page clean design in Word (tables, styles)
- Tailoring + PDF delivery

## 📖 Lesson
Recruiters scan a CV in ~7 seconds. Structure (one page unless 10+ years):
1. **Name + contacts** (phone, email, LinkedIn/city) — no photo unless requested
2. **Professional summary** — 2 lines matching THIS job''s keywords
3. **Experience** — bullet achievements with numbers ("Grew Instagram followers 0→5,000"), newest first
4. **Education & Certifications**
5. **Skills** — tools and languages relevant to the role

Word technique: use a borderless table for clean alignment (dates right column), Styles for headings, consistent spacing, one font, size 10–12. Save as PDF named "FirstName_LastName_CV.pdf" — and the matching cover letter in the same style.

Tailor every application: mirror 5 keywords from the job post. This is also a paid service — CV writing/resume design is a real freelance niche.

## 💡 Real-world example
A graduate rewrote bullets from "responsible for social media" to "grew followers 0→5,000 and doubled engagement in 4 months" — interviews started within two weeks of the change.

## ✍️ Practical
1. Build your CV with the structure above.
2. Write one targeted cover letter (3 short paragraphs).
3. Export both as properly-named PDFs.

## ✅ Checklist
- [ ] One page, quantified bullets
- [ ] Style consistent with cover letter
- [ ] PDFs named correctly' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid' and le.title = 'Project 1: Professional CV & Cover Letter'
)
update public.course_lessons le
   set resources = '[{"title":"Free official Word templates (CVs, letters, reports)","url":"https://templates.office.com/en-us/templates-for-word","type":"resource"},{"title":"Microsoft Word official training","url":"https://support.microsoft.com/en-us/word","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid' and le.title = 'Project 1: Professional CV & Cover Letter'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=C4sYQffoxAU', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=C4sYQffoxAU'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Project 2: Branded Report (Case Study Document)', 'video', '18 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Project 2: Branded Report (Case Study Document)'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Project 2: Branded Report (Case Study Document)';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid' and le.title = 'Project 2: Branded Report (Case Study Document)'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Assembling a multi-section branded report
- Cover + TOC + sections + captions end-to-end
- The quality bar clients pay for

## 📖 Lesson
Build a 6–10 page report (topic: any case study, e.g. "Digital Marketing Plan for a Local Restaurant") using everything:

1. **Cover page** — title, author, date, logo (Insert → Cover Page)
2. **TOC** — automatic from Heading 1/2 Styles
3. **Sections** — Executive Summary, Situation, Strategy, Budget Table, Conclusion
4. **Table** — budget with styled header row, repeating across pages
5. **Figure** — one chart/image with automatic caption
6. **Headers/footers** — report title + page numbers, different first page
7. **Proofing pass** — Review → Spelling & Grammar; check ¶ for stray marks; final PDF

Quality bar: zero spelling errors, consistent heading colors (brand palette), all captions auto-numbered, page numbers starting at the body.

This single document, done well, is portfolio proof you can handle corporate work.

## 💡 Real-world example
A student showed this exact report project to a small business owner during a pitch. The owner''s response: "If you can make documents look like this, you can handle our paperwork." Hired on the spot.

## ✍️ Practical
1. Produce the full report end-to-end.
2. Self-audit against the quality bar list.
3. Export final PDF; keep the .docx as your template.

## ✅ Checklist
- [ ] Cover, TOC, captions automatic
- [ ] Table + figure styled
- [ ] Zero spelling errors' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid' and le.title = 'Project 2: Branded Report (Case Study Document)'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Word official training","url":"https://support.microsoft.com/en-us/word","type":"docs"},{"title":"Free official Word templates (CVs, letters, reports)","url":"https://templates.office.com/en-us/templates-for-word","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid' and le.title = 'Project 2: Branded Report (Case Study Document)'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=965N2_vtBUc', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=965N2_vtBUc'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Project 3: Mail Merge Campaign (Certificates/Letters)', 'video', '16 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Project 3: Mail Merge Campaign (Certificates/Letters)'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Project 3: Mail Merge Campaign (Certificates/Letters)';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid' and le.title = 'Project 3: Mail Merge Campaign (Certificates/Letters)'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- A complete real-world mail merge deliverable
- Certificates or bulk letters from Excel data
- QA checks before printing a batch

## 📖 Lesson
Choose one deliverable and execute it fully:
- **Option A — Course certificates** for a class list (name, course, date)
- **Option B — Personalized business letters** (clients: name, company, balance)

Professional merge checklist:
1. Clean Excel source: exact spellings, honorifics column, no blank rows
2. Certificate/letter template designed (landscape for certificates), fonts embedded
3. Merge fields placed with correct spacing («First_Name» not « First_Name »)
4. Preview EVERY record — blank fields and broken names show up here
5. Merge to a NEW DOCUMENT first, spot-check 10%, then print/PDF

Common gotchas: Excel numbers merging with decimals (format the Excel column), long names overflowing lines (design with generous width).

Deliverables like this are sold per-batch to schools, training centers and event companies — recurring income from one skill.

## 💡 Real-world example
A training center printed 120 certificates manually for years. A graduate offered to merge them for a fee — finished in an hour, got retained for every cohort since.

## ✍️ Practical
1. Build the 15-row Excel data source.
2. Design the template + complete the merge.
3. QA checklist pass; produce final PDF batch.

## ✅ Checklist
- [ ] Source data spotless
- [ ] All records previewed
- [ ] Final batch clean' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid' and le.title = 'Project 3: Mail Merge Campaign (Certificates/Letters)'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Word official training","url":"https://support.microsoft.com/en-us/word","type":"docs"},{"title":"Microsoft Learn — Word learning paths (free)","url":"https://learn.microsoft.com/en-us/training/browse/?products=word","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid' and le.title = 'Project 3: Mail Merge Campaign (Certificates/Letters)'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=965N2_vtBUc', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=965N2_vtBUc'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Getting Hired: Word Skills That Pay', 'project', '15 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Getting Hired: Word Skills That Pay'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid'
)
update public.course_lessons le set type = 'project'
  from m where le.module_id = m.module_id and le.title = 'Getting Hired: Word Skills That Pay';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid' and le.title = 'Getting Hired: Word Skills That Pay'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Jobs that list Word skills (and what they test)
- Building proof of skill without experience
- Pricing freelance document services

## 📖 Lesson
Word skills appear in job ads as: administrative assistant, executive assistant, data entry, records officer, HR assistant, "proficient in Microsoft Office". Interviews test: mail merge, TOC/styles, tables, track changes. You now have all of them.

**Build proof without a job:**
- The CV, report and merge projects ARE your portfolio — save as PDFs
- Volunteer: format documents for a church, school or NGO ("let me make your letters professional")
- List tools concretely on your CV: "Mail merge, styles & TOC, track changes, forms"

**Freelance rates (starter market):** CV rewrite ₦5k–₦20k; document formatting ₦2k–₦5k/page; report/thesis formatting ₦20k–₦60k; template packs ₦15k–₦50k. Platforms: Fiverr/Upwork + local WhatsApp business groups.

Next steps: add PowerPoint (next course) and Excel — the full Office trio makes you the person every office needs.

## 💡 Real-world example
A student''s first paid job came from formatting a final-year project for a friend — ₦3,000. Word spread (literally); she now earns monthly from thesis formatting alone during exam season.

## ✍️ Practical
1. Compile your 3 projects into a PDF portfolio folder.
2. Format one real document for someone free (for a testimonial).
3. Post your first service offer in a local business group.

## ✅ Checklist
- [ ] Portfolio of 3 projects ready
- [ ] One testimonial earned
- [ ] First offer posted' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid' and le.title = 'Getting Hired: Word Skills That Pay'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Learn — Word learning paths (free)","url":"https://learn.microsoft.com/en-us/training/browse/?products=word","type":"course"},{"title":"Free official Word templates (CVs, letters, reports)","url":"https://templates.office.com/en-us/templates-for-word","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-word' and mo.title = 'Module 4: Real Projects & Getting Paid' and le.title = 'Getting Hired: Word Skills That Pay'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=C4sYQffoxAU', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=C4sYQffoxAU'
);

with c as (select id from public.courses where slug = 'microsoft-word')
insert into public.quizzes (course_id, title, description, passing_score, allow_retake, is_final, status, attempt_limit)
select c.id, 'Final Assessment — Microsoft Word', 'Final assessment — pass to move toward your certificate.', 70, true, true, 'published', null from c
where not exists (
  select 1 from public.quizzes z where z.course_id = c.id and z.title = 'Final Assessment — Microsoft Word'
);
update public.quizzes z set lesson_id = le.id
  from public.course_lessons le
 where z.course_id = le.course_id and le.title = 'Getting Hired: Word Skills That Pay'
   and z.title = 'Final Assessment — Microsoft Word' and exists (select 1 from public.courses c where c.id = z.course_id and c.slug = 'microsoft-word');
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-word' and z.title = 'Final Assessment — Microsoft Word')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Styles in Word are important because they…', '["Enable instant reformatting, navigation and automatic TOCs","Only change font color","Slow down typing","Replace spell check"]'::jsonb,
0, '[]'::jsonb,
'Real styles (Heading 1/2/3, Normal) power consistency and automatic tables of contents.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Styles in Word are important because they…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-word' and z.title = 'Final Assessment — Microsoft Word')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'The ¶ button reveals…', '["Hidden formatting marks","Word count","Page numbers","Comments"]'::jsonb,
0, '[]'::jsonb,
'Showing marks exposes stray Enters, tabs and spaces that cause layout problems.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'The ¶ button reveals…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-word' and z.title = 'Final Assessment — Microsoft Word')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Mail merge can personalize hundreds of letters from one Excel list.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Merge fields pull each row into the template — bulk personalization.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Mail merge can personalize hundreds of letters from one Excel list.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-word' and z.title = 'Final Assessment — Microsoft Word')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'To move to a new page correctly you should use…', '["Ctrl+Enter (page break)","Press Enter many times","Ctrl+P","Space bar"]'::jsonb,
0, '[]'::jsonb,
'Page breaks survive edits; repeated Enters break layout later.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'To move to a new page correctly you should use…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-word' and z.title = 'Final Assessment — Microsoft Word')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Which format should you send a final, uneditable document as?', '["PDF",".txt","XML",".dotx"]'::jsonb,
0, '[]'::jsonb,
'PDF preserves layout everywhere and resists casual edits.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which format should you send a final, uneditable document as?'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-word' and z.title = 'Final Assessment — Microsoft Word')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_answer', 'Which features protect a document’s structure while others fill it? (Select all that apply)', '["Restrict Editing","Content controls (Developer tab)","Templates (.dotx)","Track Changes"]'::jsonb,
null, '[0,1,2]'::jsonb,
'Restriction, controls and templates enforce fill-only behavior; Track Changes records edits but does not restrict them.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which features protect a document’s structure while others fill it? (Select all that apply)'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-word' and z.title = 'Final Assessment — Microsoft Word')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Track Changes is the professional way to…', '["Review edits from multiple people","Compress files","Add images","Print envelopes"]'::jsonb,
0, '[]'::jsonb,
'Every insertion/deletion stays visible until accepted or rejected.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Track Changes is the professional way to…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-word' and z.title = 'Final Assessment — Microsoft Word')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A table of contents in Word is generated from…', '["Heading styles","Bold text","Underlined text","Page colors"]'::jsonb,
0, '[]'::jsonb,
'The TOC reads Heading 1/2/3 styles — another reason styles matter.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A table of contents in Word is generated from…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-word' and z.title = 'Final Assessment — Microsoft Word')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Document Inspector can remove hidden comments and metadata before sharing.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Always run it before sending files externally.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Document Inspector can remove hidden comments and metadata before sharing.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-word' and z.title = 'Final Assessment — Microsoft Word')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Professional letter spacing between paragraphs should come from…', '["Space Before/After paragraph settings","Multiple Enter keys","Blank text boxes","Manual dashes"]'::jsonb,
0, '[]'::jsonb,
'Paragraph spacing survives edits and looks identical across pages.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Professional letter spacing between paragraphs should come from…'
);
with c as (select id from public.courses where slug = 'microsoft-word')
insert into public.assignments (course_id, title, description, instructions, required_output, max_score, is_final_project, status)
select c.id, 'Final Project: Professional Document Portfolio', 'Produce three polished professional documents demonstrating full Word mastery.', '1) A one-page CV with a matching cover letter (consistent style, quantified bullets).
2) A branded report (6+ pages): cover page, automatic TOC, Heading styles throughout, one table, one captioned figure, headers/footers with page numbers starting after the TOC.
3) A reusable template (.dotx) with Restricted Editing for one of the documents.
Run spell check and Document Inspector on everything.', 'Three final PDFs + the .dotx template + a short note describing the techniques used in each.', 100, true, 'published' from c
where not exists (
  select 1 from public.assignments a where a.course_id = c.id and a.title = 'Final Project: Professional Document Portfolio'
);
update public.assignments a set lesson_id = le.id
  from public.course_lessons le
 where a.course_id = le.course_id and le.title = 'Getting Hired: Word Skills That Pay'
   and a.title = 'Final Project: Professional Document Portfolio' and exists (select 1 from public.courses c where c.id = a.course_id and c.slug = 'microsoft-word');
with c as (select id from public.courses where slug = 'microsoft-word')
insert into public.course_completion_rules (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project)
select c.id, 100, 70, 0, true from c
on conflict (course_id) do update
  set require_lessons_pct = excluded.require_lessons_pct,
      require_quiz_avg = excluded.require_quiz_avg,
      require_assignments_approved = excluded.require_assignments_approved,
      require_final_project = excluded.require_final_project,
      updated_at = now();

-- ---------- microsoft-powerpoint ----------
with c as (select id from public.courses where slug = 'microsoft-powerpoint')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 1: PowerPoint Foundations', 0 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 1: PowerPoint Foundations'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Interface, Slides & the Golden Rule of Decks', 'video', '14 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Interface, Slides & the Golden Rule of Decks'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Interface, Slides & the Golden Rule of Decks';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations' and le.title = 'Interface, Slides & the Golden Rule of Decks'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The PowerPoint workspace
- Creating, reordering and duplicating slides
- The golden rule: one idea per slide

## 📖 Lesson
Workspace: slide thumbnails on the left, canvas in the middle, ribbon on top (Home, Insert, Design, Transitions, Animations, Slide Show). Views at bottom-right: **Normal** (editing), **Slide Sorter** (rearranging the whole deck), **Notes Page** (speaker notes).

Slide operations: New Slide (Ctrl+M), duplicate (Ctrl+D), drag thumbnails to reorder, right-click for layout changes.

**The golden rule: one idea per slide.** Slides support the speaker; they are not the script. If a slide has three ideas, the audience reads instead of listening. More slides with less text beats fewer slides stuffed with paragraphs — 20 clean slides cost nothing.

Text budget: title ≤ 8 words; body bullets ≤ 6 lines of ≤ 8 words. You say the details; the slide anchors them.

## 💡 Real-world example
An investor pitch had 12 slides with 15 bullets each — the investor read ahead and asked questions out of order. Rebuilt to 30 spare slides, one idea each: the same content landed, and the meeting ran like a conversation.

## ✍️ Practical
1. Create a 10-slide deck from an outline you write first.
2. Reorder slides in Slide Sorter view.
3. Audit: does every slide contain exactly one idea?

## ✅ Checklist
- [ ] One-idea rule applied
- [ ] Slide Sorter used
- [ ] Text budget respected' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations' and le.title = 'Interface, Slides & the Golden Rule of Decks'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft PowerPoint official training","url":"https://support.microsoft.com/en-us/powerpoint","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations' and le.title = 'Interface, Slides & the Golden Rule of Decks'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=0T2lfVwXJLQ', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=0T2lfVwXJLQ'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Layouts, Placeholders & Consistent Structure', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Layouts, Placeholders & Consistent Structure'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Layouts, Placeholders & Consistent Structure';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations' and le.title = 'Layouts, Placeholders & Consistent Structure'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Built-in layouts vs blank slides
- Why placeholders beat manual text boxes
- Choosing the right layout per message

## 📖 Lesson
Every New Slide comes from a **layout**: Title Slide, Title and Content, Two Content, Comparison, Section Header, Title Only. Layouts carry pre-positioned, consistently-styled **placeholders**.

Why placeholders matter: text typed into them inherits the theme''s fonts, sizes and positions — every slide aligns automatically. Manual text boxes placed by hand drift slide to slide, creating the messy "something''s off" look.

Layout picker:
- Announcing a topic → **Section Header**
- Point + evidence → **Title and Content**
- Before/after, option A/B → **Comparison** or **Two Content**
- Letting an image speak → **Title Only** + full-bleed image

If your content doesn''t fit any layout, pick the closest and adjust — don''t fight the grid.

## 💡 Real-world example
Two school presentations, same topic. One used layouts throughout: aligned, uniform, professional. The other: floating text boxes everywhere, titles at four different heights. The difference is entirely layouts.

## ✍️ Practical
1. Rebuild a 6-slide deck using intentional layouts only.
2. Replace any manual text boxes with placeholders.
3. Check title positions in Slide Sorter — identical?

## ✅ Checklist
- [ ] Layout chosen per slide''s job
- [ ] No floating text boxes
- [ ] Titles aligned across slides' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations' and le.title = 'Layouts, Placeholders & Consistent Structure'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft PowerPoint official training","url":"https://support.microsoft.com/en-us/powerpoint","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations' and le.title = 'Layouts, Placeholders & Consistent Structure'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=0T2lfVwXJLQ', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=0T2lfVwXJLQ'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Slide Master: Style Once, Apply Everywhere', 'video', '16 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Slide Master: Style Once, Apply Everywhere'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Slide Master: Style Once, Apply Everywhere';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations' and le.title = 'Slide Master: Style Once, Apply Everywhere'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The Slide Master: the template behind every slide
- Setting fonts, colors, logos once
- Building reusable branded templates

## 📖 Lesson
**Slide Master** (View → Slide Master) is the blueprint: the top master controls the theme for ALL layouts below it. Change the master''s font or logo position once → the whole deck updates.

Setup ritual for every branded deck:
1. Open Slide Master; set the master''s fonts (one display + one body) and color theme
2. Place the logo small in a corner on the master (it appears on every layout)
3. Adjust the Title Slide layout for the cover, Section Header for dividers
4. Close Master View — now every new slide inherits your branding

Save the result: File → Save As → **PowerPoint Template (.potx)**. Client work becomes: open template, fill content — brand consistency is automatic.

Amateurs style slide by slide; professionals style the master. That difference is visible in minutes.

## 💡 Real-world example
An agency intern restyled a 60-slide client deck by editing one Slide Master instead of 60 slides — 5 minutes versus an afternoon, and perfectly consistent. She was asked to build all future templates.

## ✍️ Practical
1. Open Slide Master; set fonts + logo + colors.
2. Create 8 slides — verify branding applies automatically.
3. Save as a .potx template.

## ✅ Checklist
- [ ] Master controls all slides
- [ ] Logo consistent everywhere
- [ ] .potx template saved' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations' and le.title = 'Slide Master: Style Once, Apply Everywhere'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft PowerPoint official training","url":"https://support.microsoft.com/en-us/powerpoint","type":"docs"},{"title":"Microsoft Learn — PowerPoint paths (free)","url":"https://learn.microsoft.com/en-us/training/browse/?products=powerpoint","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations' and le.title = 'Slide Master: Style Once, Apply Everywhere'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=QxkXikn-cr0', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=QxkXikn-cr0'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Working with Text: Hierarchy & Readability', 'video', '14 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Working with Text: Hierarchy & Readability'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Working with Text: Hierarchy & Readability';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations' and le.title = 'Working with Text: Hierarchy & Readability'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Font pairing and sizing for rooms and screens
- Hierarchy: size, weight, color, spacing
- Anti-patterns to avoid forever

## 📖 Lesson
**Sizing:** titles 28–40pt, body 18–24pt. Test: can the last row read it? On video calls assume smaller screens — never below 18pt body.

**Pairing:** max 2 fonts — one with character for titles, one plain for body (e.g. a bold sans for headings + Calibri/Segoe for text). Matching the brand font in client decks is a pro courtesy.

**Hierarchy tools (in order of use):**
1. Size (big = important)
2. Weight (bold/regular)
3. Color (brand accent for key phrases only)
4. Spacing (line spacing 1.2; space between bullets)

**Anti-patterns to kill:** ALL CAPS paragraphs • underlining (reads as links) • more than one accent color per slide • centered body text paragraphs • stretched fonts.

Bullets: lead each with a strong word; parallel grammar ("Reduce costs… Increase reach… Automate reports…").

## 💡 Real-world example
A deck with 14pt grey-on-grey text was projected in a lit room: nothing readable. The presenter lost the room in slide two. Size and contrast are respect for your audience.

## ✍️ Practical
1. Restyle one deck''s typography with the rules above.
2. Apply one accent color to key phrases only.
3. Read it at 50% zoom — still clear?

## ✅ Checklist
- [ ] ≥18pt body everywhere
- [ ] Max 2 fonts
- [ ] Accent color used sparingly' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations' and le.title = 'Working with Text: Hierarchy & Readability'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft PowerPoint official training","url":"https://support.microsoft.com/en-us/powerpoint","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 1: PowerPoint Foundations' and le.title = 'Working with Text: Hierarchy & Readability'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=0T2lfVwXJLQ', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=0T2lfVwXJLQ'
);

with c as (select id from public.courses where slug = 'microsoft-powerpoint')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 2: Visual Design', 1 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 2: Visual Design'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Images, Icons & Removing Backgrounds', 'video', '16 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Images, Icons & Removing Backgrounds'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Images, Icons & Removing Backgrounds';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design' and le.title = 'Images, Icons & Removing Backgrounds'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Sourcing free, legal images & icons
- Full-bleed images and image-text overlays
- PowerPoint''s Remove Background tool

## 📖 Lesson
**Sources (free & commercial-safe):** Unsplash/Pexels for photos; Flaticon/Lucide-style sets for icons (one style per deck); unDraw for flat illustrations. Never use watermarked Google Images — clients notice, and it''s legally risky.

**Full-bleed technique:** stretch a strong photo edge-to-edge, darken it (insert black rectangle over it, ~40% transparency), white text on top = instant dramatic slide. This one trick upgrades a deck more than anything else.

**PowerPoint image tools:**
- **Remove Background** (Picture Format) — isolate products/people without Photoshop
- **Crop to Shape** — circles, rounded rectangles for portraits
- **Artistic effects & corrections** — quick polish

Icon discipline: consistent line weight and color; icon + short label beats icon alone for clarity.

## 💡 Real-world example
A product pitch used phone-camera photos on white backgrounds. Same product re-photographed simply, background removed in PowerPoint, placed on brand-color slides — buyers called it "a different product".

## ✍️ Practical
1. Build one full-bleed image slide with overlay text.
2. Remove the background from one product photo.
3. Crop one portrait to a circle.

## ✅ Checklist
- [ ] Full-bleed + overlay working
- [ ] Remove Background used
- [ ] Icons in one style' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design' and le.title = 'Images, Icons & Removing Backgrounds'
)
update public.course_lessons le
   set resources = '[{"title":"Unsplash — free high-quality photos","url":"https://unsplash.com/","type":"resource"},{"title":"Flaticon — free icons","url":"https://www.flaticon.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design' and le.title = 'Images, Icons & Removing Backgrounds'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=QxkXikn-cr0', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=QxkXikn-cr0'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Shapes, SmartArt & Data Slides', 'video', '16 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Shapes, SmartArt & Data Slides'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Shapes, SmartArt & Data Slides';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design' and le.title = 'Shapes, SmartArt & Data Slides'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Building diagrams from shapes
- SmartArt: instant processes and hierarchies
- Charts that make numbers obvious

## 📖 Lesson
**Shapes** (Insert → Shapes) build custom diagrams: chevrons for processes, rounded rectangles for steps, connectors that stick to shapes when moved. Keep fills in the theme palette; uniform corner radius and sizing signal craft.

**SmartArt** (Insert → SmartArt): converts text lists into processes, cycles, hierarchies, matrices in one click — and you can restyle colors per the theme. Great for: 3–6 step flows, org charts, pillars.

**Charts:** Insert → Chart (or paste from Excel). Rules:
- One message per chart (title = the insight: "Revenue doubled after Q2")
- Delete gridlines/legend when labels suffice
- Highlight THE data point that matters in accent color; mute the rest grey

Numbers on slides aren''t data dumps — they''re evidence for your one point.

## 💡 Real-world example
A strategy deck''s 9-row data table was replaced with one bar chart, the best bar in brand color, title: "Online channel wins by 3×". The CEO made the decision on that slide alone.

## ✍️ Practical
1. Convert a text list to SmartArt; restyle it.
2. Build a 4-step process from shapes.
3. Create one chart with a single highlighted bar.

## ✅ Checklist
- [ ] SmartArt themed correctly
- [ ] Shapes consistent & aligned
- [ ] One insight highlighted per chart' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design' and le.title = 'Shapes, SmartArt & Data Slides'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft PowerPoint official training","url":"https://support.microsoft.com/en-us/powerpoint","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design' and le.title = 'Shapes, SmartArt & Data Slides'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=0T2lfVwXJLQ', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=0T2lfVwXJLQ'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Alignment, Whitespace & the Design Eye', 'video', '15 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Alignment, Whitespace & the Design Eye'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Alignment, Whitespace & the Design Eye';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design' and le.title = 'Alignment, Whitespace & the Design Eye'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Align/distribute tools and guides
- Whitespace as a design element
- The 5-second slide audit

## 📖 Lesson
**Alignment** is the invisible skill separating amateur from pro:
- Select multiple objects → Shape Format → **Align** (left/center/top) and **Distribute** (equal spacing)
- Turn on **Guides** (View → Guides): a center cross + your own guides; objects snap to them
- Never eyeball spacing — tools exist

**Whitespace** (empty space) is not wasted space — it focuses attention. Crowding = anxiety; breathing room = confidence. When unsure, make elements bigger and push them apart.

**The 5-second audit per slide:**
1. What''s the ONE thing here? (if unclear, cut)
2. Is everything aligned to something?
3. Any element touching a slide edge by accident?
4. Could anything be deleted? (usually yes)

Run this audit on every slide and your decks will look professionally designed even before fancy techniques.

## 💡 Real-world example
A deck "that looked wrong" had no visible errors — until guides revealed titles 10px apart slide to slide and uneven icon gaps. Fifteen minutes of alignment made it look like a design agency made it.

## ✍️ Practical
1. Turn on guides; align one busy slide properly.
2. Distribute a row of icons evenly.
3. Run the 5-second audit on 5 slides.

## ✅ Checklist
- [ ] Align/Distribute automatic habits
- [ ] Guides visible & used
- [ ] Audit run on all slides' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design' and le.title = 'Alignment, Whitespace & the Design Eye'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft PowerPoint official training","url":"https://support.microsoft.com/en-us/powerpoint","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design' and le.title = 'Alignment, Whitespace & the Design Eye'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=QxkXikn-cr0', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=QxkXikn-cr0'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Transitions & Animations: Motion With Purpose', 'video', '15 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Transitions & Animations: Motion With Purpose'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Transitions & Animations: Motion With Purpose';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design' and le.title = 'Transitions & Animations: Motion With Purpose'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- When motion helps (and when it hurts)
- Morph: PowerPoint''s signature transition
- Animation order, timing & restraint

## 📖 Lesson
Motion should **guide attention**, never entertain itself.

**Transitions** (between slides): pick ONE subtle transition for the whole deck — Fade or Push. Duration 0.5s. Never mix five different transitions; it reads as chaos.

**Morph** (the star): duplicate a slide, move/resize objects on the copy, apply Morph — PowerPoint animates the movement. Perfect for: before/after, zoom-into-detail, step progression.

**Animations** (within a slide):
- Use for progressive reveal (bullets appear as you discuss them) or drawing attention to a number
- Order matters — Animation Pane controls sequence
- Subtle: Fade/Float In; duration ≤0.5s; avoid Bounce/Spin in business decks

Rule of thumb: a 20-slide deck needs at most a handful of animations. Each one must answer "what should the audience look at NOW?"

## 💡 Real-world example
A sales demo used Morph to zoom from a country map into a city, then into a store location — three slides, one seamless motion. The client replayed it. Motion earned attention; content closed the deal.

## ✍️ Practical
1. Apply one Fade transition deck-wide.
2. Build a Morph pair (object moves/resizes across slides).
3. Add one progressive bullet reveal via the Animation Pane.

## ✅ Checklist
- [ ] One transition deck-wide
- [ ] Morph effect built
- [ ] Animation Pane order checked' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design' and le.title = 'Transitions & Animations: Motion With Purpose'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft PowerPoint official training","url":"https://support.microsoft.com/en-us/powerpoint","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 2: Visual Design' and le.title = 'Transitions & Animations: Motion With Purpose'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=QxkXikn-cr0', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=QxkXikn-cr0'
);

with c as (select id from public.courses where slug = 'microsoft-powerpoint')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 3: Presenting & Delivering', 2 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 3: Presenting & Delivering'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Presenter View, Notes & Rehearsal', 'video', '14 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Presenter View, Notes & Rehearsal'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Presenter View, Notes & Rehearsal';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering' and le.title = 'Presenter View, Notes & Rehearsal'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Presenter View: notes only you see
- Timing yourself with Rehearsal
- Laser pointer, zoom & black-screen tricks

## 📖 Lesson
**Presenter View** (auto with a projector; force via Slide Show → Monitor settings): audience sees slides; you see current slide, next slide, your notes, and a timer. Write your speaker notes in Notes Page view — your script lives there, not on the slides.

**Rehearsal:** Slide Show → Rehearse with Coach (or Record Slide Show) times each slide and flags "um"s. Target: know your opening 60 seconds cold; know the time per section.

**Live tools:**
- Ctrl+P = pen / Ctrl+L = laser pointer to circle things live
- Press **B** to blank the screen (all eyes back on you), any key returns
- Right-click → See All Slides to jump anywhere when Q&A detours

Confidence comes from structure you''ve rehearsed, not from memorizing words.

## 💡 Real-world example
A conference speaker hit "B" mid-talk during a rambling tangent — 300 people looked up from phones. The silence itself re-focused the room. It''s the cheapest attention tool ever shipped.

## ✍️ Practical
1. Add speaker notes to every slide of your deck.
2. Run Rehearse with Coach once; note timings.
3. Practice the pen, laser and B-key in slideshow.

## ✅ Checklist
- [ ] Notes on all slides
- [ ] One timed rehearsal done
- [ ] Live tools practiced' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering' and le.title = 'Presenter View, Notes & Rehearsal'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft PowerPoint official training","url":"https://support.microsoft.com/en-us/powerpoint","type":"docs"},{"title":"Microsoft Learn — PowerPoint paths (free)","url":"https://learn.microsoft.com/en-us/training/browse/?products=powerpoint","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering' and le.title = 'Presenter View, Notes & Rehearsal'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=0T2lfVwXJLQ', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=0T2lfVwXJLQ'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Storytelling: Structure That Persuades', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Storytelling: Structure That Persuades'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Storytelling: Structure That Persuades';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering' and le.title = 'Storytelling: Structure That Persuades'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 3-act structure for business decks
- Classic narrative patterns (problem→solution, before→after)
- Openings and closings that stick

## 📖 Lesson
Decks are stories with data. Proven skeleton:
1. **Hook** — the pain or opportunity in one sentence ("Our riders lose 2 hours daily to paperwork")
2. **Stakes** — what it costs to ignore
3. **Solution** — your idea, simply
4. **Proof** — numbers, testimonials, demo
5. **Ask** — the exact next step you want ("Approve ₦2M pilot for 90 days")

Patterns worth memorizing:
- **Problem → Agitate → Solve** (pitches)
- **Before → After → Bridge** (case studies)
- **What → So what → Now what** (status updates)

Open with the conclusion for executives (they decide in 3 minutes); close by restating the ask, not "thank you, questions?".

The audience remembers one sentence from your talk. Decide which sentence, and build the deck to land it.

## 💡 Real-world example
A nonprofit''s funding deck listed 40 activities nobody remembered. Rebuilt around one line — "₦500 keeps one child in school for a week" — and the ask tripled its target.

## ✍️ Practical
1. Outline your deck using one narrative pattern.
2. Write the one sentence you want remembered.
3. Cut any slide that doesn''t serve that sentence.

## ✅ Checklist
- [ ] One narrative pattern chosen
- [ ] Hook + explicit ask present
- [ ] Ruthless cuts made' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering' and le.title = 'Storytelling: Structure That Persuades'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft PowerPoint official training","url":"https://support.microsoft.com/en-us/powerpoint","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering' and le.title = 'Storytelling: Structure That Persuades'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=QxkXikn-cr0', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=QxkXikn-cr0'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Exporting, Sharing & File Hygiene', 'video', '13 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Exporting, Sharing & File Hygiene'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Exporting, Sharing & File Hygiene';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering' and le.title = 'Exporting, Sharing & File Hygiene'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- PDF, video and image exports
- Embedding fonts & compressing media
- Versioning and handover conventions

## 📖 Lesson
**Exports by purpose:**
- **PDF** — review/share; layout can''t shift (File → Export)
- **Video (MP4)** — self-running decks; recorded timings and narration included
- **Images** — right-click any object → Save as Picture; or export all slides as images for social posts
- **Handout PDFs** — print multiple slides per page with notes lines

**File hygiene:**
- **Embed fonts** (File → Options → Save → Embed fonts) so your custom type travels
- **Compress media** (File → Info → Compress Media) before emailing — a 200MB deck embarrasses everyone
- Naming: ClientName_Deck_v2_YYYYMMDD — never "final_FINAL2.pptx"
- Keep a master template separate from client files

Also: PowerPoint Online is free — know it for quick edits when away from your machine.

## 💡 Real-world example
A presenter emailed a 340MB deck with embedded videos — client inbox rejected it, meeting started late. After Compress Media: 28MB, same quality. Size discipline is professionalism.

## ✍️ Practical
1. Export your deck as PDF and as a video.
2. Embed fonts; compress media; check file size.
3. Rename with a proper convention.

## ✅ Checklist
- [ ] PDF + video exported
- [ ] Fonts embedded, media compressed
- [ ] Clean naming convention' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering' and le.title = 'Exporting, Sharing & File Hygiene'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft PowerPoint official training","url":"https://support.microsoft.com/en-us/powerpoint","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering' and le.title = 'Exporting, Sharing & File Hygiene'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=0T2lfVwXJLQ', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=0T2lfVwXJLQ'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Slide Makeover: From Wall of Text to Wow', 'video', '16 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Slide Makeover: From Wall of Text to Wow'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Slide Makeover: From Wall of Text to Wow';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering' and le.title = 'Slide Makeover: From Wall of Text to Wow'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Diagnosing why a slide fails
- The 4-step makeover method
- Rebuilding real bad slides

## 📖 Lesson
Every bad slide fails for one of four reasons: too much text, no hierarchy, poor visuals, no focus. The makeover method:

1. **Extract the point** — what ONE sentence should this slide prove? Move everything else to speaker notes or delete.
2. **Choose the visual anchor** — number, image, icon set, chart, or just a big bold statement.
3. **Rebuild with hierarchy** — anchor largest, supporting line smaller, whitespace generous.
4. **Apply polish** — theme colors, alignment, one accent.

Common conversions: paragraph → 3 icon bullets; table → chart with highlighted winner; bullet list → SmartArt process; dense title → short title + subtitle.

Practice this on slides you meet in the wild (lecture slides, church announcements, work decks) — the diagnostic eye is the real professional skill.

## 💡 Real-world example
A student redid her company''s weekly report slides using this method. Her manager started forwarding them as "how our slides should look". Makeovers build reputations.

## ✍️ Practical
1. Find 3 text-heavy slides (real or invented).
2. Diagnose each with the 4 failure reasons.
3. Rebuild all 3 with the method.

## ✅ Checklist
- [ ] Diagnosis identified per slide
- [ ] Each rebuild has one anchor
- [ ] Polished & aligned' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering' and le.title = 'Slide Makeover: From Wall of Text to Wow'
)
update public.course_lessons le
   set resources = '[{"title":"Free official PowerPoint templates","url":"https://templates.office.com/en-us/templates-for-powerpoint","type":"resource"},{"title":"Unsplash — free high-quality photos","url":"https://unsplash.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 3: Presenting & Delivering' and le.title = 'Slide Makeover: From Wall of Text to Wow'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=QxkXikn-cr0', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=QxkXikn-cr0'
);

with c as (select id from public.courses where slug = 'microsoft-powerpoint')
insert into public.course_modules (course_id, title, position)
select c.id, 'Module 4: Capstone & Freelance', 3 from c
where not exists (
  select 1 from public.course_modules m where m.course_id = c.id and m.title = 'Module 4: Capstone & Freelance'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Capstone: Build a Complete Pitch Deck', 'video', '20 min', 0
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Capstone: Build a Complete Pitch Deck'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Capstone: Build a Complete Pitch Deck';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance' and le.title = 'Capstone: Build a Complete Pitch Deck'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The 12-slide pitch deck standard
- Applying every course skill in one artifact
- Self-review against professional standards

## 📖 Lesson
Build a 10–12 slide pitch (real business idea or client project):
1. Cover — brand, one-line hook
2. Problem — the pain, made vivid
3. Solution — your offer in one visual
4. Market/Opportunity — size or need evidence
5. How it works — 3-step process (shapes/SmartArt)
6. Product/Demo — hero image or mockup
7. Traction/Proof — numbers or testimonials
8. Business model — how money flows
9. Competition — your position (2×2 or table)
10. Team — photos + one-line credibility
11. Financial ask / proposal — clear numbers
12. Closing — restated ask + contact

Every rule applies: master-based branding, one idea per slide, full-bleed images, charts with highlighted insights, Morph where it earns attention, speaker notes on all slides.

Review pass: 5-second audit per slide → rehearse once → export PDF.

## 💡 Real-world example
Capstone decks have become students'' strongest portfolio pieces — one was literally adopted by the founder it was written about, becoming the pitch that raised their first funding.

## ✍️ Practical
1. Outline the 12 slides in text first.
2. Build the deck; pass the audit on every slide.
3. Rehearse and export PDF + presenter version.

## ✅ Checklist
- [ ] 12 slides, story arc complete
- [ ] All design rules satisfied
- [ ] Rehearsed once, PDF exported' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance' and le.title = 'Capstone: Build a Complete Pitch Deck'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft PowerPoint official training","url":"https://support.microsoft.com/en-us/powerpoint","type":"docs"},{"title":"Free official PowerPoint templates","url":"https://templates.office.com/en-us/templates-for-powerpoint","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance' and le.title = 'Capstone: Build a Complete Pitch Deck'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=QxkXikn-cr0', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=QxkXikn-cr0'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Teaching Decks & Training Materials', 'video', '15 min', 1
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Teaching Decks & Training Materials'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Teaching Decks & Training Materials';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance' and le.title = 'Teaching Decks & Training Materials'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Slides designed for learning (not selling)
- Worksheets, handouts and quizzes from decks
- Packaging a training kit

## 📖 Lesson
Educational decks serve different goals — retention over persuasion:
- **Chunking:** new concept every 5–7 slides, each ending with a recap slide
- **Examples before definitions** where possible; real, local examples land harder
- **Interaction slides:** questions, polls, "turn and discuss" prompts — participation doubles retention
- **Consistent visual language:** same icon = same concept throughout (e.g. 💡 always means "key idea")

Extend the deck into a kit: handout PDF (slides + note lines), worksheet for practice, quiz slide with answers on the next (revealed live). Sell the package, not the slides.

Schools, churches, training centers and corporate L&D teams all pay for this — and a well-made lesson deck gets reused for years.

## 💡 Real-world example
A trainer''s "Excel for Beginners" deck + worksheet pack was bought by three training centers. Each buyer paid for a thing she built once — content compounds.

## ✍️ Practical
1. Build a 15-slide lesson on any topic you know.
2. Add recap + interaction slides.
3. Create the matching worksheet and handout.

## ✅ Checklist
- [ ] Chunking with recaps
- [ ] Interaction slides included
- [ ] Handout + worksheet packaged' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance' and le.title = 'Teaching Decks & Training Materials'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Learn — PowerPoint paths (free)","url":"https://learn.microsoft.com/en-us/training/browse/?products=powerpoint","type":"course"},{"title":"Microsoft PowerPoint official training","url":"https://support.microsoft.com/en-us/powerpoint","type":"docs"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance' and le.title = 'Teaching Decks & Training Materials'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=0T2lfVwXJLQ', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=0T2lfVwXJLQ'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'Selling Presentation Services', 'video', '15 min', 2
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'Selling Presentation Services'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance'
)
update public.course_lessons le set type = 'video'
  from m where le.module_id = m.module_id and le.title = 'Selling Presentation Services';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance' and le.title = 'Selling Presentation Services'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- The presentation-design freelance market
- Packaging offers: makeovers, decks, templates
- Getting your first 3 clients

## 📖 Lesson
Companies pay for presentation help constantly: pitch decks, investor updates, conference talks, sales one-pagers, internal training. Two entry offers:

1. **Deck makeover** — "send your ugly deck, get it back beautiful" (fixed price per deck, e.g. ₦15k–₦50k starter; global market $50–$300)
2. **Template system** — branded master + 10 layouts they reuse forever (₦30k–₦100k; one-time build, client uses forever — great value story)

Proof beats promises: your capstone + 2–3 before/after makeovers (volunteer them for testimonials) IS the portfolio. List on Fiverr/Upwork AND pitch locally: startups, NGOs, schools, churches with upcoming events.

Delivery notes: always get the brand guide or logo upfront; include one revision round in the price; export PDF + editable pptx.

## 💡 Real-world example
One before/after makeover posted in a Lagos founders'' WhatsApp group brought 4 enquiries in a week. Before/after is the most persuasive ad format in design — show it everywhere.

## ✍️ Practical
1. Create a before/after makeover sample.
2. Write your 2-offer service page (makeover + templates).
3. Pitch 5 local organizations this week.

## ✅ Checklist
- [ ] Before/after sample ready
- [ ] Offers priced clearly
- [ ] 5 pitches sent' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance' and le.title = 'Selling Presentation Services'
)
update public.course_lessons le
   set resources = '[{"title":"Fiverr — presentation design marketplace","url":"https://www.fiverr.com/","type":"resource"},{"title":"Upwork","url":"https://www.upwork.com/","type":"resource"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance' and le.title = 'Selling Presentation Services'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=0T2lfVwXJLQ', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=0T2lfVwXJLQ'
);

with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance'
)
insert into public.course_lessons (module_id, course_id, title, type, duration, position)
select m.module_id, m.course_id, 'The Full Office Pro: Word + Excel + PowerPoint Careers', 'project', '15 min', 3
from m
where not exists (
  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = 'The Full Office Pro: Word + Excel + PowerPoint Careers'
);
with m as (
  select mo.id as module_id, mo.course_id
  from public.course_modules mo join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance'
)
update public.course_lessons le set type = 'project'
  from m where le.module_id = m.module_id and le.title = 'The Full Office Pro: Word + Excel + PowerPoint Careers';
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance' and le.title = 'The Full Office Pro: Word + Excel + PowerPoint Careers'
)
insert into public.course_content (lesson_id, body_markdown)
select l.id, '## 🎯 What you will learn
- Roles that need the Office trio
- Certification vs portfolio: what matters
- Your 30-day income plan

## 📖 Lesson
The Office trio (Word + Excel + PowerPoint) is the most requested skill stack in Nigerian and remote admin jobs: executive assistant, office manager, operations associate, data entry lead, virtual assistant. Combined, they''re also a complete freelance product: documents + data + presentations.

**Credentials:** the Microsoft Office Specialist (MOS) certification validates skills formally — worth it for corporate applications. But for freelancing and startups, a **portfolio wins faster**: 3 projects (branded report, dashboard, pitch deck) shown as PDFs + a one-page services offer.

**30-day plan:**
- Week 1: finish/polish your 3 portfolio artifacts
- Week 2: get 2 testimonials (free work for real orgs)
- Week 3: post offers in 10 channels (WhatsApp groups, LinkedIn, Fiverr)
- Week 4: pitch 10 businesses directly; follow up relentlessly

You already own the skills from this course — distribution is the remaining work.

## 💡 Real-world example
A graduate combined all three artifacts into one PDF brochure and sent it to 15 SMEs with the line: "I make your business look bigger than it is on paper." Three replied; one became a monthly retainer.

## ✍️ Practical
1. Assemble the trio portfolio (report, dashboard, deck).
2. Research MOS exam requirements; decide if it fits your path.
3. Execute week 1 of the 30-day plan.

## ✅ Checklist
- [ ] Trio portfolio assembled
- [ ] Credential path decided
- [ ] 30-day plan started' from l
on conflict (lesson_id) do update
  set body_markdown = excluded.body_markdown, updated_at = now();
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance' and le.title = 'The Full Office Pro: Word + Excel + PowerPoint Careers'
)
update public.course_lessons le
   set resources = '[{"title":"Microsoft Learn — PowerPoint paths (free)","url":"https://learn.microsoft.com/en-us/training/browse/?products=powerpoint","type":"course"},{"title":"Microsoft Office Specialist certification info","url":"https://learn.microsoft.com/en-us/credentials/certifications/office-specialist/","type":"course"}]'::jsonb
  from l where le.id = l.id;
with l as (
  select le.id from public.course_lessons le
  join public.course_modules mo on mo.id = le.module_id
  join public.courses c on c.id = mo.course_id
  where c.slug = 'microsoft-powerpoint' and mo.title = 'Module 4: Capstone & Freelance' and le.title = 'The Full Office Pro: Word + Excel + PowerPoint Careers'
)
insert into public.course_videos (lesson_id, provider, url, status)
select l.id, 'youtube', 'https://www.youtube.com/watch?v=QxkXikn-cr0', 'published' from l
where not exists (
  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = 'https://www.youtube.com/watch?v=QxkXikn-cr0'
);

with c as (select id from public.courses where slug = 'microsoft-powerpoint')
insert into public.quizzes (course_id, title, description, passing_score, allow_retake, is_final, status, attempt_limit)
select c.id, 'Final Assessment — Microsoft PowerPoint', 'Final assessment — pass to move toward your certificate.', 70, true, true, 'published', null from c
where not exists (
  select 1 from public.quizzes z where z.course_id = c.id and z.title = 'Final Assessment — Microsoft PowerPoint'
);
update public.quizzes z set lesson_id = le.id
  from public.course_lessons le
 where z.course_id = le.course_id and le.title = 'The Full Office Pro: Word + Excel + PowerPoint Careers'
   and z.title = 'Final Assessment — Microsoft PowerPoint' and exists (select 1 from public.courses c where c.id = z.course_id and c.slug = 'microsoft-powerpoint');
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-powerpoint' and z.title = 'Final Assessment — Microsoft PowerPoint')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'The golden rule of slide design is…', '["One idea per slide","As much text as possible","Ten fonts per deck","No images"]'::jsonb,
0, '[]'::jsonb,
'Slides support the speaker; one idea each keeps the audience listening.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'The golden rule of slide design is…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-powerpoint' and z.title = 'Final Assessment — Microsoft PowerPoint')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'The Slide Master controls…', '["The theme for every slide at once","Slide transitions only","Speaker notes","File saving"]'::jsonb,
0, '[]'::jsonb,
'Edit the master once — fonts, logos and colors update deck-wide.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'The Slide Master controls…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-powerpoint' and z.title = 'Final Assessment — Microsoft PowerPoint')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'The Morph transition animates objects between duplicated slides.', '["True","False"]'::jsonb,
0, '[]'::jsonb,
'Move/resize objects on the copy, apply Morph, and PowerPoint animates the change.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'The Morph transition animates objects between duplicated slides.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-powerpoint' and z.title = 'Final Assessment — Microsoft PowerPoint')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Body text on projected slides should be at least about…', '["18pt","8pt","10pt","6pt"]'::jsonb,
0, '[]'::jsonb,
'Audiences at the back need ~18pt minimum to read comfortably.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Body text on projected slides should be at least about…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-powerpoint' and z.title = 'Final Assessment — Microsoft PowerPoint')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_answer', 'Which make charts more persuasive? (Select all that apply)', '["A title stating the insight","Highlighting the key data point","Removing clutter like extra gridlines","Rainbow colors for every bar"]'::jsonb,
null, '[0,1,2]'::jsonb,
'Insight titles, focus and decluttering persuade; rainbow noise distracts.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Which make charts more persuasive? (Select all that apply)'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-powerpoint' and z.title = 'Final Assessment — Microsoft PowerPoint')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Presenter View shows the presenter…', '["Current slide, next slide, notes and timer","Only the slides","The audience’s faces","Email"]'::jsonb,
0, '[]'::jsonb,
'The audience sees slides; you see everything else.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Presenter View shows the presenter…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-powerpoint' and z.title = 'Final Assessment — Microsoft PowerPoint')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Pressing B during a slideshow…', '["Blanks the screen to refocus attention on you","Deletes a slide","Ends the show","Starts music"]'::jsonb,
0, '[]'::jsonb,
'B/W blanks the screen — a classic speaker trick.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Pressing B during a slideshow…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-powerpoint' and z.title = 'Final Assessment — Microsoft PowerPoint')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'A deck’s opening should…', '["State the pain or opportunity in one line","List the agenda for 5 minutes","Thank sponsors first","Define every term"]'::jsonb,
0, '[]'::jsonb,
'Hooks earn attention; agendas can follow.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'A deck’s opening should…'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-powerpoint' and z.title = 'Final Assessment — Microsoft PowerPoint')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'true_false', 'Multiple different transitions per deck looks more professional than one consistent transition.', '["True","False"]'::jsonb,
1, '[]'::jsonb,
'One subtle transition deck-wide looks professional; mixing many looks chaotic.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Multiple different transitions per deck looks more professional than one consistent transition.'
);
with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id
  where c.slug = 'microsoft-powerpoint' and z.title = 'Final Assessment — Microsoft PowerPoint')
insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)
select z.id, 'multiple_choice', 'Before emailing a deck with custom fonts you should…', '["Embed fonts (File → Options → Save)","Convert it to .txt","Remove all images","Increase slide count"]'::jsonb,
0, '[]'::jsonb,
'Embedded fonts keep your typography on any machine.' from z
where not exists (
  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = 'Before emailing a deck with custom fonts you should…'
);
with c as (select id from public.courses where slug = 'microsoft-powerpoint')
insert into public.assignments (course_id, title, description, instructions, required_output, max_score, is_final_project, status)
select c.id, 'Final Project: A Presentation That Wins the Room', 'Create a 10–12 slide pitch or training deck and deliver it like a professional.', '1) Choose a real topic: a business pitch, a training lesson, or a project proposal.
2) Structure with one idea per slide: hook → problem → solution → proof → ask.
3) Apply design rules: master-based branding, 2 fonts max, full-bleed images or highlighted charts, aligned elements, generous white space.
4) Use ONE transition deck-wide and at most 2 purposeful animations (include one Morph).
5) Add speaker notes to every slide, rehearse once with the timer, and export both PPTX and PDF.', 'The PPTX + PDF + a 60–90 second video (or audio) of you presenting 2–3 key slides.', 100, true, 'published' from c
where not exists (
  select 1 from public.assignments a where a.course_id = c.id and a.title = 'Final Project: A Presentation That Wins the Room'
);
update public.assignments a set lesson_id = le.id
  from public.course_lessons le
 where a.course_id = le.course_id and le.title = 'The Full Office Pro: Word + Excel + PowerPoint Careers'
   and a.title = 'Final Project: A Presentation That Wins the Room' and exists (select 1 from public.courses c where c.id = a.course_id and c.slug = 'microsoft-powerpoint');
with c as (select id from public.courses where slug = 'microsoft-powerpoint')
insert into public.course_completion_rules (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project)
select c.id, 100, 70, 0, true from c
on conflict (course_id) do update
  set require_lessons_pct = excluded.require_lessons_pct,
      require_quiz_avg = excluded.require_quiz_avg,
      require_assignments_approved = excluded.require_assignments_approved,
      require_final_project = excluded.require_final_project,
      updated_at = now();

commit;

-- ---------- Verify ----------
select c.slug, c.lessons_count,
       (select count(*) from public.course_modules m where m.course_id = c.id) as modules,
       (select count(*) from public.course_videos v
          join public.course_lessons l on l.id = v.lesson_id
         where l.course_id = c.id) as videos,
       (select count(*) from public.quizzes z where z.course_id = c.id) as quizzes,
       (select count(*) from public.assignments a where a.course_id = c.id) as assignments
from public.courses c order by c.slug;
