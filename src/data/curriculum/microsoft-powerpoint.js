// MICROSOFT POWERPOINT — full professional curriculum
const V1 = 'https://www.youtube.com/watch?v=0T2lfVwXJLQ'; // PPT beginner to advanced full course
const V2 = 'https://www.youtube.com/watch?v=QxkXikn-cr0'; // PPT masterclass

const R = {
  msPpt: { title: 'Microsoft PowerPoint official training', url: 'https://support.microsoft.com/en-us/powerpoint', type: 'docs' },
  msLearn: { title: 'Microsoft Learn — PowerPoint paths (free)', url: 'https://learn.microsoft.com/en-us/training/browse/?products=powerpoint', type: 'course' },
  templates: { title: 'Free official PowerPoint templates', url: 'https://templates.office.com/en-us/templates-for-powerpoint', type: 'resource' },
  undraw: { title: 'unDraw — free illustrations', url: 'https://undraw.co/', type: 'resource' },
  unsplash: { title: 'Unsplash — free high-quality photos', url: 'https://unsplash.com/', type: 'resource' },
};

export default {
  slug: 'microsoft-powerpoint',
  curriculum: [
    {
      title: 'Module 1: PowerPoint Foundations',
      lessons: [
        {
          title: 'Interface, Slides & the Golden Rule of Decks',
          duration: '14 min',
          videoUrl: V1,
          resources: [R.msPpt],
          content: `## 🎯 What you will learn
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
- [ ] Text budget respected`,
        },
        {
          title: 'Layouts, Placeholders & Consistent Structure',
          duration: '15 min',
          videoUrl: V1,
          resources: [R.msPpt],
          content: `## 🎯 What you will learn
- Built-in layouts vs blank slides
- Why placeholders beat manual text boxes
- Choosing the right layout per message

## 📖 Lesson
Every New Slide comes from a **layout**: Title Slide, Title and Content, Two Content, Comparison, Section Header, Title Only. Layouts carry pre-positioned, consistently-styled **placeholders**.

Why placeholders matter: text typed into them inherits the theme's fonts, sizes and positions — every slide aligns automatically. Manual text boxes placed by hand drift slide to slide, creating the messy "something's off" look.

Layout picker:
- Announcing a topic → **Section Header**
- Point + evidence → **Title and Content**
- Before/after, option A/B → **Comparison** or **Two Content**
- Letting an image speak → **Title Only** + full-bleed image

If your content doesn't fit any layout, pick the closest and adjust — don't fight the grid.

## 💡 Real-world example
Two school presentations, same topic. One used layouts throughout: aligned, uniform, professional. The other: floating text boxes everywhere, titles at four different heights. The difference is entirely layouts.

## ✍️ Practical
1. Rebuild a 6-slide deck using intentional layouts only.
2. Replace any manual text boxes with placeholders.
3. Check title positions in Slide Sorter — identical?

## ✅ Checklist
- [ ] Layout chosen per slide's job
- [ ] No floating text boxes
- [ ] Titles aligned across slides`,
        },
        {
          title: 'Slide Master: Style Once, Apply Everywhere',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.msPpt, R.msLearn],
          content: `## 🎯 What you will learn
- The Slide Master: the template behind every slide
- Setting fonts, colors, logos once
- Building reusable branded templates

## 📖 Lesson
**Slide Master** (View → Slide Master) is the blueprint: the top master controls the theme for ALL layouts below it. Change the master's font or logo position once → the whole deck updates.

Setup ritual for every branded deck:
1. Open Slide Master; set the master's fonts (one display + one body) and color theme
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
- [ ] .potx template saved`,
        },
        {
          title: 'Working with Text: Hierarchy & Readability',
          duration: '14 min',
          videoUrl: V1,
          resources: [R.msPpt],
          content: `## 🎯 What you will learn
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
1. Restyle one deck's typography with the rules above.
2. Apply one accent color to key phrases only.
3. Read it at 50% zoom — still clear?

## ✅ Checklist
- [ ] ≥18pt body everywhere
- [ ] Max 2 fonts
- [ ] Accent color used sparingly`,
        },
      ],
    },
    {
      title: 'Module 2: Visual Design',
      lessons: [
        {
          title: 'Images, Icons & Removing Backgrounds',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.unsplash, { title: 'Flaticon — free icons', url: 'https://www.flaticon.com/', type: 'resource' }],
          content: `## 🎯 What you will learn
- Sourcing free, legal images & icons
- Full-bleed images and image-text overlays
- PowerPoint's Remove Background tool

## 📖 Lesson
**Sources (free & commercial-safe):** Unsplash/Pexels for photos; Flaticon/Lucide-style sets for icons (one style per deck); unDraw for flat illustrations. Never use watermarked Google Images — clients notice, and it's legally risky.

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
- [ ] Icons in one style`,
        },
        {
          title: 'Shapes, SmartArt & Data Slides',
          duration: '16 min',
          videoUrl: V1,
          resources: [R.msPpt],
          content: `## 🎯 What you will learn
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

Numbers on slides aren't data dumps — they're evidence for your one point.

## 💡 Real-world example
A strategy deck's 9-row data table was replaced with one bar chart, the best bar in brand color, title: "Online channel wins by 3×". The CEO made the decision on that slide alone.

## ✍️ Practical
1. Convert a text list to SmartArt; restyle it.
2. Build a 4-step process from shapes.
3. Create one chart with a single highlighted bar.

## ✅ Checklist
- [ ] SmartArt themed correctly
- [ ] Shapes consistent & aligned
- [ ] One insight highlighted per chart`,
        },
        {
          title: 'Alignment, Whitespace & the Design Eye',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.msPpt],
          content: `## 🎯 What you will learn
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
1. What's the ONE thing here? (if unclear, cut)
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
- [ ] Audit run on all slides`,
        },
        {
          title: 'Transitions & Animations: Motion With Purpose',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.msPpt],
          content: `## 🎯 What you will learn
- When motion helps (and when it hurts)
- Morph: PowerPoint's signature transition
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
- [ ] Animation Pane order checked`,
        },
      ],
    },
    {
      title: 'Module 3: Presenting & Delivering',
      lessons: [
        {
          title: 'Presenter View, Notes & Rehearsal',
          duration: '14 min',
          videoUrl: V1,
          resources: [R.msPpt, R.msLearn],
          content: `## 🎯 What you will learn
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

Confidence comes from structure you've rehearsed, not from memorizing words.

## 💡 Real-world example
A conference speaker hit "B" mid-talk during a rambling tangent — 300 people looked up from phones. The silence itself re-focused the room. It's the cheapest attention tool ever shipped.

## ✍️ Practical
1. Add speaker notes to every slide of your deck.
2. Run Rehearse with Coach once; note timings.
3. Practice the pen, laser and B-key in slideshow.

## ✅ Checklist
- [ ] Notes on all slides
- [ ] One timed rehearsal done
- [ ] Live tools practiced`,
        },
        {
          title: 'Storytelling: Structure That Persuades',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.msPpt],
          content: `## 🎯 What you will learn
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
A nonprofit's funding deck listed 40 activities nobody remembered. Rebuilt around one line — "₦500 keeps one child in school for a week" — and the ask tripled its target.

## ✍️ Practical
1. Outline your deck using one narrative pattern.
2. Write the one sentence you want remembered.
3. Cut any slide that doesn't serve that sentence.

## ✅ Checklist
- [ ] One narrative pattern chosen
- [ ] Hook + explicit ask present
- [ ] Ruthless cuts made`,
        },
        {
          title: 'Exporting, Sharing & File Hygiene',
          duration: '13 min',
          videoUrl: V1,
          resources: [R.msPpt],
          content: `## 🎯 What you will learn
- PDF, video and image exports
- Embedding fonts & compressing media
- Versioning and handover conventions

## 📖 Lesson
**Exports by purpose:**
- **PDF** — review/share; layout can't shift (File → Export)
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
- [ ] Clean naming convention`,
        },
        {
          title: 'Slide Makeover: From Wall of Text to Wow',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.templates, R.unsplash],
          content: `## 🎯 What you will learn
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
A student redid her company's weekly report slides using this method. Her manager started forwarding them as "how our slides should look". Makeovers build reputations.

## ✍️ Practical
1. Find 3 text-heavy slides (real or invented).
2. Diagnose each with the 4 failure reasons.
3. Rebuild all 3 with the method.

## ✅ Checklist
- [ ] Diagnosis identified per slide
- [ ] Each rebuild has one anchor
- [ ] Polished & aligned`,
        },
      ],
    },
    {
      title: 'Module 4: Capstone & Freelance',
      lessons: [
        {
          title: 'Capstone: Build a Complete Pitch Deck',
          duration: '20 min',
          videoUrl: V2,
          resources: [R.msPpt, R.templates],
          content: `## 🎯 What you will learn
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
Capstone decks have become students' strongest portfolio pieces — one was literally adopted by the founder it was written about, becoming the pitch that raised their first funding.

## ✍️ Practical
1. Outline the 12 slides in text first.
2. Build the deck; pass the audit on every slide.
3. Rehearse and export PDF + presenter version.

## ✅ Checklist
- [ ] 12 slides, story arc complete
- [ ] All design rules satisfied
- [ ] Rehearsed once, PDF exported`,
        },
        {
          title: 'Teaching Decks & Training Materials',
          duration: '15 min',
          videoUrl: V1,
          resources: [R.msLearn, R.msPpt],
          content: `## 🎯 What you will learn
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
A trainer's "Excel for Beginners" deck + worksheet pack was bought by three training centers. Each buyer paid for a thing she built once — content compounds.

## ✍️ Practical
1. Build a 15-slide lesson on any topic you know.
2. Add recap + interaction slides.
3. Create the matching worksheet and handout.

## ✅ Checklist
- [ ] Chunking with recaps
- [ ] Interaction slides included
- [ ] Handout + worksheet packaged`,
        },
        {
          title: 'Selling Presentation Services',
          duration: '15 min',
          videoUrl: V1,
          resources: [{ title: 'Fiverr — presentation design marketplace', url: 'https://www.fiverr.com/', type: 'resource' }, { title: 'Upwork', url: 'https://www.upwork.com/', type: 'resource' }],
          content: `## 🎯 What you will learn
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
One before/after makeover posted in a Lagos founders' WhatsApp group brought 4 enquiries in a week. Before/after is the most persuasive ad format in design — show it everywhere.

## ✍️ Practical
1. Create a before/after makeover sample.
2. Write your 2-offer service page (makeover + templates).
3. Pitch 5 local organizations this week.

## ✅ Checklist
- [ ] Before/after sample ready
- [ ] Offers priced clearly
- [ ] 5 pitches sent`,
        },
        {
          title: 'The Full Office Pro: Word + Excel + PowerPoint Careers',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.msLearn, { title: 'Microsoft Office Specialist certification info', url: 'https://learn.microsoft.com/en-us/credentials/certifications/office-specialist/', type: 'course' }],
          content: `## 🎯 What you will learn
- Roles that need the Office trio
- Certification vs portfolio: what matters
- Your 30-day income plan

## 📖 Lesson
The Office trio (Word + Excel + PowerPoint) is the most requested skill stack in Nigerian and remote admin jobs: executive assistant, office manager, operations associate, data entry lead, virtual assistant. Combined, they're also a complete freelance product: documents + data + presentations.

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
- [ ] 30-day plan started`,
        },
      ],
    },
  ],
};
