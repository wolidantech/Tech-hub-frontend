// AI VIDEO CONTENT CREATION — full professional curriculum
// Teaching standard: every lesson = objectives → plain-English lesson →
// real-world example → practical exercise → checklist. Videos are verified
// public educational tutorials; resources are curated global free sources.

const V_RUNWAY_START = 'https://www.youtube.com/watch?v=FqYRkl12ON8'; // Runway beginner full guide
const V_RUNWAY_FULL = 'https://www.youtube.com/watch?v=-og75MUlnFk'; // Runway cinematic full guide
const V_RUNWAY_STEP = 'https://www.youtube.com/watch?v=5DUHRr8x88U'; // Runway step-by-step project
const V_PROMPTS = 'https://www.youtube.com/watch?v=IMHBwskJqRo'; // prompt engineering for AI video tools
const V_PROMPTS2 = 'https://www.youtube.com/watch?v=T_-2M_1pgoE'; // writing better AI prompts

const R = {
  runway: { title: 'Runway Academy — official tool guides', url: 'https://help.runwayml.com/hc/en-us', type: 'docs' },
  runwaySite: { title: 'Runway — AI video generation suite', url: 'https://runwayml.com/', type: 'tool' },
  openai: { title: 'OpenAI documentation & prompting guide', url: 'https://platform.openai.com/docs', type: 'docs' },
  eleven: { title: 'ElevenLabs — AI voice generation', url: 'https://elevenlabs.io/', type: 'tool' },
  pika: { title: 'Pika — text-to-video tool', url: 'https://pika.art/', type: 'tool' },
  capcut: { title: 'CapCut editor (free) — assemble your AI clips', url: 'https://www.capcut.com/', type: 'tool' },
  canvaMagic: { title: 'Canva Magic Studio — AI design + video', url: 'https://www.canva.com/magic-studio/', type: 'tool' },
};

export default {
  slug: 'ai-video-content-creation',
  curriculum: [
    {
      title: 'Module 1: Foundations of AI Video',
      lessons: [
        {
          title: 'What Is AI Video Creation & Why It Matters',
          duration: '14 min',
          videoUrl: V_RUNWAY_START,
          resources: [R.runwaySite, R.runway, R.pika],
          content: `## 🎯 What you will learn
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
- [ ] I have a free account on at least one AI video tool`,
        },
        {
          title: 'How AI Video Generators Think: Prompts → Clips',
          duration: '16 min',
          videoUrl: V_PROMPTS2,
          resources: [R.openai, R.runway],
          content: `## 🎯 What you will learn
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
- [ ] I generated my first AI clips`,
        },
        {
          title: 'Choosing Your AI Tool Stack (Runway, Pika & Friends)',
          duration: '15 min',
          videoUrl: V_RUNWAY_START,
          resources: [R.runwaySite, R.pika, R.canvaMagic],
          content: `## 🎯 What you will learn
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
- [ ] I wrote down my personal tool stack`,
        },
        {
          title: 'Setting Up Your AI Video Studio (Folder System & Workflow)',
          duration: '12 min',
          videoUrl: V_RUNWAY_STEP,
          resources: [R.capcut, R.runway],
          content: `## 🎯 What you will learn
- A professional folder structure for video projects
- The 5-stage AI video workflow you will repeat forever
- Naming files so you never lose work

## 📖 Lesson
Amateurs lose hours searching for files. Professionals use one structure for every project:

\`\`\`
ProjectName/
  01_Script/       → scripts, hooks, captions
  02_Assets/       → images, logos, brand colors
  03_AI_Clips/     → generated video clips (keep prompts in a text file!)
  04_Audio/        → voiceovers, music
  05_Exports/      → final videos per platform
\`\`\`

Your repeatable workflow: **Idea → Script → Generate clips → Voice → Edit & export**. Save the exact prompt that produced every good clip in a \`prompts.txt\` file — prompts are your recipe book, and reusing great prompts is a professional superpower.

## 💡 Real-world example
An agency editing 20 client videos a month keeps every clip's prompt in one document. When a style works, they reuse the prompt with small changes — cutting production time in half.

## ✍️ Practical
1. Create the 5-folder structure on your phone/PC for a test project called "MyFirstVideo".
2. Create \`prompts.txt\` inside 03_AI_Clips.
3. Copy your best 2 prompts from Module 1 into it.

## ✅ Checklist
- [ ] My 5-folder structure exists
- [ ] prompts.txt has at least 2 saved prompts
- [ ] I can recite the 5-stage workflow`,
        },
      ],
    },
    {
      title: 'Module 2: Scripting & Storytelling with AI',
      lessons: [
        {
          title: 'From Idea to Hook: Script Writing with ChatGPT',
          duration: '17 min',
          videoUrl: V_PROMPTS,
          resources: [R.openai, { title: 'HubSpot — how to write video scripts', url: 'https://blog.hubspot.com/marketing/video-script', type: 'article' }],
          content: `## 🎯 What you will learn
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
- [ ] My script reads aloud in under 35 seconds`,
        },
        {
          title: 'Writing Video Prompts That Actually Work (Shot Language)',
          duration: '16 min',
          videoUrl: V_PROMPTS,
          resources: [R.runway, { title: 'StudioBinder — shot types cheat sheet', url: 'https://www.studiobinder.com/blog/ultimate-guide-to-camera-shots/', type: 'article' }],
          content: `## 🎯 What you will learn
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
- [ ] I generated 2 shots from my prompts`,
        },
        {
          title: 'Storyboarding with AI Image Frames',
          duration: '14 min',
          videoUrl: V_RUNWAY_STEP,
          resources: [R.canvaMagic, { title: 'Canva Design School — storyboarding', url: 'https://www.canva.com/learn/', type: 'course' }],
          content: `## 🎯 What you will learn
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
- [ ] I reuse identical style keywords`,
        },
        {
          title: 'Voice & Narration: Scripts That Sound Human',
          duration: '15 min',
          videoUrl: V_PROMPTS2,
          resources: [R.eleven, { title: 'ElevenLabs guides — voice design basics', url: 'https://elevenlabs.io/blog', type: 'article' }],
          content: `## 🎯 What you will learn
- Writing for the ear, not the eye
- Generating natural AI voiceovers
- Pacing, pauses and emphasis that keep viewers

## 📖 Lesson
People *listen* differently than they read. Write for voice:
- Short sentences. One idea each.
- Speak numbers simply ("nineteen ninety-nine" not "₦1,999.00").
- Use contractions ("you'll", "don't") — they sound human.
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
- [ ] I fixed pacing/pronunciation issues`,
        },
      ],
    },
    {
      title: 'Module 3: Production — Generate, Voice, Edit',
      lessons: [
        {
          title: 'Generating Clips: Text-to-Video & Image-to-Video',
          duration: '18 min',
          videoUrl: V_RUNWAY_FULL,
          resources: [R.runway, R.runwaySite],
          content: `## 🎯 What you will learn
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

**Save credits:** get the image perfect first (cheap), then animate it (expensive). Generate short 3–5s clips; you'll cut them together anyway. Keep every successful prompt.

## 💡 Real-world example
For a shoe ad, a creator generated 30 images, kept the best 4, and animated only those 4. Result: pro-looking ad, one-third of the credit cost of animating everything.

## ✍️ Practical
1. Generate 4 clips for your storyboard using camera keywords.
2. Try one image-to-video clip with your own photo.
3. Save all working prompts to prompts.txt.

## ✅ Checklist
- [ ] I used both text-to-video and image-to-video
- [ ] I used at least 3 camera keywords
- [ ] My prompts.txt grew`,
        },
        {
          title: 'AI Voiceover Production & Lip-Sync Basics',
          duration: '15 min',
          videoUrl: V_RUNWAY_STEP,
          resources: [R.eleven, R.capcut],
          content: `## 🎯 What you will learn
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
- [ ] I know when avatars help vs hurt`,
        },
        {
          title: 'Assembling in CapCut: Cuts, Captions & Music',
          duration: '19 min',
          videoUrl: 'https://www.youtube.com/watch?v=qfHX2cNA4MY',
          resources: [R.capcut, { title: 'CapCut — official learning hub', url: 'https://www.capcut.com/', type: 'docs' }],
          content: `## 🎯 What you will learn
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
- [ ] Music at 10–15% under the voice`,
        },
        {
          title: 'Fixing AI Mistakes: Artifacts, Upscaling & Consistency',
          duration: '14 min',
          videoUrl: V_RUNWAY_FULL,
          resources: [R.runway, R.canvaMagic],
          content: `## 🎯 What you will learn
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
- [ ] No visibly warped frames remain`,
        },
      ],
    },
    {
      title: 'Module 4: Publishing, Ads & Monetization',
      lessons: [
        {
          title: 'Platform Formats: TikTok, Reels, YouTube & WhatsApp',
          duration: '15 min',
          videoUrl: V_RUNWAY_STEP,
          resources: [R.capcut, { title: 'Social Media Examiner — platform size guide', url: 'https://www.socialmediaexaminer.com/', type: 'article' }],
          content: `## 🎯 What you will learn
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

Workflow: edit once in 9:16 in CapCut, then use CapCut's format switch to export 1:1 and 16:9 versions. Move captions so they're not covered by platform buttons (keep text in the middle 70%).

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
- [ ] I posted something real`,
        },
        {
          title: 'Making Ads & Promo Videos with AI',
          duration: '17 min',
          videoUrl: V_RUNWAY_FULL,
          resources: [R.runwaySite, { title: 'Meta — ad creative best practices', url: 'https://www.facebook.com/business/ads-guide', type: 'docs' }],
          content: `## 🎯 What you will learn
- The anatomy of a converting video ad
- A repeatable 4-scene ad template
- Testing variations without re-shooting

## 📖 Lesson
Ads have one job: make someone act. The proven 4-scene template:
1. **Hook scene (0–3s)** — the problem or a bold visual. "Still queuing for bank transfers?"
2. **Product scene (3–12s)** — show the product solving it. Close-ups + benefits as on-screen text.
3. **Proof scene (12–20s)** — testimonial style, numbers, before/after.
4. **CTA scene (20–30s)** — offer + action. "Order on WhatsApp — link in bio."

Because it's all AI-generated, **testing is cheap**: change only the hook scene and you have a new ad variant. Test 3 hooks, keep the winner.

## 💡 Real-world example
A fashion brand made 3 AI ad variants with different hooks for ₦0 in production. Hook #2 ("POV: your outfit arrives looking exactly like the picture") got 4× more clicks. They scaled it the same week.

## ✍️ Practical
1. Build a 4-scene ad for a real product using your existing clips.
2. Create 2 alternative hooks.
3. Show all 3 to a friend and note which one they remember.

## ✅ Checklist
- [ ] My ad follows Hook→Product→Proof→CTA
- [ ] I have 3 hook variants
- [ ] CTA is one clear action`,
        },
        {
          title: 'Faceless Channels & Content Systems',
          duration: '16 min',
          videoUrl: V_PROMPTS,
          resources: [R.openai, R.eleven],
          content: `## 🎯 What you will learn
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
3. Define your channel's one style rule (fonts, colors, music).

## ✅ Checklist
- [ ] I chose a sustainable niche
- [ ] I have 3 batched scripts
- [ ] My style rule is written down`,
        },
        {
          title: 'Monetization: Clients, Rates & Getting Paid',
          duration: '18 min',
          videoUrl: V_PROMPTS2,
          resources: [{ title: 'Fiverr — sell video services', url: 'https://www.fiverr.com/', type: 'tool' }, { title: 'Upwork — freelance marketplace', url: 'https://www.upwork.com/', type: 'tool' }, R.eleven],
          content: `## 🎯 What you will learn
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
- [ ] I contacted 5 potential clients`,
        },
      ],
    },
  ],
};
