// VIDEO EDITING WITH CAPCUT — full professional curriculum
const V_FULL = 'https://www.youtube.com/watch?v=qfHX2cNA4MY'; // CapCut PC full course (chapters)
const V_QUICK = 'https://www.youtube.com/watch?v=JsulvGcoEWU'; // CapCut beginner crash course

const R = {
  capcut: { title: 'CapCut — official app & web editor', url: 'https://www.capcut.com/', type: 'tool' },
  pexels: { title: 'Pexels — free stock video & photos', url: 'https://www.pexels.com/', type: 'resource' },
  pixabay: { title: 'Pixabay — free footage & music', url: 'https://pixabay.com/', type: 'resource' },
  mixkit: { title: 'Mixkit — free music & sound effects', url: 'https://mixkit.co/', type: 'resource' },
};

export default {
  slug: 'video-editing-with-capcut',
  curriculum: [
    {
      title: 'Module 1: CapCut Fundamentals',
      lessons: [
        {
          title: 'Installing CapCut & Mastering the Interface',
          duration: '13 min',
          videoUrl: V_QUICK,
          resources: [R.capcut, R.pexels],
          content: `## 🎯 What you will learn
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
- [ ] I can name all 4 interface zones`,
        },
        {
          title: 'Your First Edit: Import, Arrange, Trim',
          duration: '15 min',
          videoUrl: V_QUICK,
          resources: [R.capcut, R.pexels],
          content: `## 🎯 What you will learn
- The import → arrange → trim loop
- Cutting out mistakes and dead moments
- Thinking in "selects": keeping only the best moments

## 📖 Lesson
Every edit starts the same way:
1. **Import** your clips.
2. **Arrange** them on the timeline in story order — just drag.
3. **Trim** each clip: drag the edges to keep only the strongest seconds.

The professional mindset is **selects**: film 30 seconds, keep 3. Viewers forgive short; they never forgive boring. Cut every moment where nothing happens: breaths, camera shakes, "umm"s.

Use the **split** tool (scissors) to cut a clip in two at the playhead, then delete the weak half. This is the single most-used action in editing — practise it until it's automatic.

## 💡 Real-world example
A vlogger films 20 minutes of a market visit. Her final video is 45 seconds — 15 two-to-three-second highlights. That selection is why people watch till the end.

## ✍️ Practical
1. Import 5 clips and arrange them in a story order.
2. Trim each to its best 2–4 seconds.
3. Use split+delete to remove one mistake cleanly.

## ✅ Checklist
- [ ] Clips arranged in story order
- [ ] Every clip trimmed to its best part
- [ ] I used split + delete confidently`,
        },
        {
          title: 'Cuts, Transitions & the Art of Timing',
          duration: '16 min',
          videoUrl: V_FULL,
          resources: [R.capcut, { title: 'This page is a great read on cut types', url: 'https://www.studiobinder.com/blog/different-film-cuts/', type: 'article' }],
          content: `## 🎯 What you will learn
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
- [ ] Max one transition style per video`,
        },
        {
          title: 'Aspect Ratios & Platform-Perfect Exports',
          duration: '12 min',
          videoUrl: V_QUICK,
          resources: [R.capcut],
          content: `## 🎯 What you will learn
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
A creator's captions kept getting hidden by TikTok's buttons. Moving all text up one "thumb zone" doubled average watch time — viewers finally read the message.

## ✍️ Practical
1. Set your project to 9:16 and reposition key content into the safe zone.
2. Export at 1080p/30fps.
3. Open the export on your phone and check nothing is covered.

## ✅ Checklist
- [ ] Correct ratio per platform
- [ ] Content sits in the safe zone
- [ ] Exported 1080p 30fps`,
        },
      ],
    },
    {
      title: 'Module 2: Motion, Effects & Keyframes',
      lessons: [
        {
          title: 'Keyframes: The Skill That Separates Pros',
          duration: '17 min',
          videoUrl: V_FULL,
          resources: [R.capcut],
          content: `## 🎯 What you will learn
- What a keyframe actually is (in plain English)
- Zoom-ins, pans and follows built with 2 keyframes
- The slow-zoom trick that keeps static shots alive

## 📖 Lesson
A **keyframe** tells CapCut: "at THIS moment, be HERE". Give it two keyframes and it animates between them automatically.

The big three:
- **Slow zoom-in**: keyframe 1 scale 100% at the start, keyframe 2 scale 110% at the end. Static talking shots suddenly feel alive.
- **Pan across**: animate position X from left to right — great for photos and wide shots.
- **Follow/punch-in**: zoom to 130% on an important sentence, back to 100% after. Emphasis without words.

Rule: keyframes should be slow and subtle (5–15% change). If viewers notice the zoom, it's too much.

## 💡 Real-world example
Top talking-head creators never show a static frame: every 3–5 seconds there's a tiny zoom or punch-in. That invisible motion is why you keep watching.

## ✍️ Practical
1. Add a slow zoom-in (100→108%) to a 5-second clip.
2. Add a punch-in to one key moment.
3. Watch both at normal speed — invisible but alive?

## ✅ Checklist
- [ ] I can explain keyframes simply
- [ ] I built a slow zoom + a punch-in
- [ ] My motion is subtle`,
        },
        {
          title: 'Speed Ramps, Overlays & Picture-in-Picture',
          duration: '16 min',
          videoUrl: V_FULL,
          resources: [R.capcut, R.pexels],
          content: `## 🎯 What you will learn
- Speed ramps (slow-mo → fast) the right way
- Overlays: layering video on video
- Clean picture-in-picture and reaction layouts

## 📖 Lesson
**Speed:** CapCut's speed tools: normal (constant %) and curve (speed ramp). The classic ramp: slow motion at the beauty moment → fast through the boring travel between moments. For smooth slow-mo, film in 60fps, then slow to 50%.

**Overlay track** = a second video layer on top of the first. Uses:
- **Picture-in-picture** — your face reacting in a corner while footage plays.
- **B-roll over voice** — narration continues while visuals change.
- **Green screen / cutout** — CapCut's "Remove BG" isolates people without a green screen.

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
- [ ] Main action never blocked`,
        },
        {
          title: 'Effects, Filters & Motion Tracking',
          duration: '15 min',
          videoUrl: V_FULL,
          resources: [R.capcut],
          content: `## 🎯 What you will learn
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

**Motion tracking:** select a clip → Tracking → attach text/sticker to a moving object (a product, a person's head). Instantly looks like big-budget editing.

## 💡 Real-world example
A sneaker video tracks a price tag sticker to the shoe as it rotates. Ten seconds of work, hundreds of comments asking "how did you do that?".

## ✍️ Practical
1. Apply one filter to all clips in your project.
2. Add one effect on an intro, and only there.
3. Motion-track one text label to a moving object.

## ✅ Checklist
- [ ] One consistent filter everywhere
- [ ] Effects used on ≤20% of runtime
- [ ] One tracked element works`,
        },
        {
          title: 'Removing Backgrounds, Masks & Creative Tricks',
          duration: '15 min',
          videoUrl: V_FULL,
          resources: [R.capcut, R.pixabay],
          content: `## 🎯 What you will learn
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
A fashion creator's "snap" transitions between 3 outfits got her first 100k-view video. The whole trick is one well-timed cut per snap.

## ✍️ Practical
1. Use auto-cutout to place yourself on a new background.
2. Build a text-behind-person shot.
3. Film and cut one snap transition.

## ✅ Checklist
- [ ] Cutout edges look clean
- [ ] Text-behind-person works
- [ ] One snap transition lands on the beat`,
        },
      ],
    },
    {
      title: 'Module 3: Audio & Text',
      lessons: [
        {
          title: 'Music, Beats & Sound Design',
          duration: '16 min',
          videoUrl: V_FULL,
          resources: [R.mixkit, R.pixabay],
          content: `## 🎯 What you will learn
- Finding safe, free music
- Beat marking: cutting visuals to the rhythm
- Layering sound effects like a pro

## 📖 Lesson
**Music sources:** CapCut's library (safe for TikTok), Pixabay and Mixkit (free, check each license). Never use popular songs for client/commercial work — copyright claims can mute or demonetize videos.

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
- [ ] Voice stays loudest`,
        },
        {
          title: 'Auto-Captions & Text Animation',
          duration: '15 min',
          videoUrl: V_FULL,
          resources: [R.capcut],
          content: `## 🎯 What you will learn
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
- [ ] Keywords highlighted`,
        },
        {
          title: 'Voiceovers, TTS & Audio Cleanup',
          duration: '14 min',
          videoUrl: V_QUICK,
          resources: [R.capcut],
          content: `## 🎯 What you will learn
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
- [ ] Music fades in/out smoothly`,
        },
        {
          title: 'Stickers, Emojis & Engagement Layers',
          duration: '12 min',
          videoUrl: V_QUICK,
          resources: [R.capcut],
          content: `## 🎯 What you will learn
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

The taste rule: stickers must match the video's tone. Business video → minimal arrows & clean highlights. Comedy/lifestyle → emoji energy welcome. Never place a sticker over a face or key product.

## 💡 Real-world example
A tech tutorial added a red circle + arrow every time a setting appeared on screen. Comments shifted from "where is that?" to "so clear, thank you!"

## ✍️ Practical
1. Add 3 engagement stickers where attention might drop.
2. Add one arrow highlighting a key detail.
3. Watch muted: does anything important get covered?

## ✅ Checklist
- [ ] Stickers match the tone
- [ ] Nothing important is covered
- [ ] Attention anchors every few seconds`,
        },
      ],
    },
    {
      title: 'Module 4: Color, Viral Styles & Real Projects',
      lessons: [
        {
          title: 'Color Grading & Filters for a Cinematic Look',
          duration: '15 min',
          videoUrl: V_FULL,
          resources: [R.capcut],
          content: `## 🎯 What you will learn
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
- [ ] Footage looks sharper and warmer`,
        },
        {
          title: 'Trending Edit Styles: Reels, TikTok & Transitions',
          duration: '16 min',
          videoUrl: V_QUICK,
          resources: [R.capcut],
          content: `## 🎯 What you will learn
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
- [ ] Template saved for reuse`,
        },
        {
          title: 'Export Settings, Codecs & Quality Control',
          duration: '12 min',
          videoUrl: V_QUICK,
          resources: [R.capcut],
          content: `## 🎯 What you will learn
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
6. Re-watch the first 3 seconds — that's your hook.

## 💡 Real-world example
An editor found a 1-frame black flash at the start of a client ad during QC. The client's ads platform had rejected it twice before — QC caught what uploads couldn't.

## ✍️ Practical
1. Run the full QC checklist on your project.
2. Fix everything found.
3. Export with the right preset for your target platform.

## ✅ Checklist
- [ ] Full watch-through done
- [ ] Audio balanced
- [ ] Exported with platform preset`,
        },
        {
          title: 'Capstone: Produce a Complete 30-Second Viral Edit',
          duration: '22 min',
          videoUrl: V_FULL,
          resources: [R.pexels, R.mixkit, R.capcut],
          content: `## 🎯 What you will learn
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
- [ ] 30s video planned, edited, QC'd, exported
- [ ] Rubric scored 4+/5 in every area
- [ ] Published and saved to portfolio`,
        },
      ],
    },
  ],
};
