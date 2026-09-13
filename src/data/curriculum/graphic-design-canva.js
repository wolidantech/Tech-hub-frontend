// GRAPHIC DESIGN WITH CANVA — full professional curriculum
const V1 = 'https://www.youtube.com/watch?v=yWJp7gQqCQ8'; // Canva full course (pro, free)
const V2 = 'https://www.youtube.com/watch?v=rXLvN1FEkOE'; // Canva full course 2024
const V3 = 'https://www.youtube.com/watch?v=UkzVLHeSf7c'; // Full Canva tutorial 2024

const R = {
  canvaLearn: { title: 'Canva Design School — free official lessons', url: 'https://www.canva.com/learn/', type: 'course' },
  canva: { title: 'Canva — free design tool', url: 'https://www.canva.com/', type: 'tool' },
  fonts: { title: 'Google Fonts — free commercial fonts', url: 'https://fonts.google.com/', type: 'resource' },
  pexels: { title: 'Pexels — free stock photos', url: 'https://www.pexels.com/', type: 'resource' },
  unsplash: { title: 'Unsplash — free high-quality photos', url: 'https://unsplash.com/', type: 'resource' },
  colors: { title: 'Coolors — color palette generator', url: 'https://coolors.co/', type: 'tool' },
};

export default {
  slug: 'graphic-design-canva',
  curriculum: [
    {
      title: 'Module 1: Design Foundations & Canva Mastery',
      lessons: [
        {
          title: 'How Designers Think: Hierarchy, Balance, Space',
          duration: '14 min',
          videoUrl: V1,
          resources: [R.canvaLearn, { title: 'Canva — graphic design basics hub', url: 'https://www.canva.com/learn/graphic-design-tips/', type: 'article' }],
          content: `## 🎯 What you will learn
- The 4 invisible rules behind every good design
- Why "simple" beats "busy" every time
- How to train your design eye in 10 minutes a day

## 📖 Lesson
Good design is not decoration — it's **communication**. Four rules:

1. **Hierarchy** — the eye must know what to read 1st, 2nd, 3rd. Biggest/boldest = most important. One hero element per design.
2. **Alignment** — every element should line up with something. Invisible lines make designs feel tidy and professional.
3. **Contrast** — dark vs light, big vs small. Contrast creates attention; low contrast creates confusion.
4. **White space** — empty space is not wasted space. It gives the eye room to breathe and makes content feel premium.

**Train your eye:** daily, screenshot 3 designs you like (posters, ads, app screens) and ask: what do I see first? Why? You'll absorb the rules faster than any textbook.

## 💡 Real-world example
Two flyers for the same event: one crams in 6 fonts and 9 colors; the other uses 2 fonts, 3 colors, and lots of space. People assume the second one is the "expensive" event.

## ✍️ Practical
1. Screenshot 3 designs you admire.
2. Label each: hero element, alignment lines, white space.
3. Write your own one-line definition of hierarchy.

## ✅ Checklist
- [ ] I can name the 4 rules
- [ ] I analyzed 3 real designs
- [ ] I know why white space matters`,
        },
        {
          title: 'Canva Interface, Templates & Smart Tools',
          duration: '15 min',
          videoUrl: V1,
          resources: [R.canva, R.canvaLearn],
          content: `## 🎯 What you will learn
- Navigating Canva like a pro (web & mobile)
- Using templates without looking like a template
- Magic tools: resize, background remover, Magic Write

## 📖 Lesson
Canva's workspace: left panel = **Elements, Text, Uploads, Templates**; center = canvas; top bar = undo, resize, share/export.

**Templates are starting points, not finished designs.** Customize all 4: colors → your palette, fonts → your 2 fonts, images → relevant ones, text → your words. Change at least 60% of a template before calling it yours.

Magic tools worth learning first:
- **Magic Resize** — one design → Instagram post + story + flyer sizes instantly (Pro, but worth it)
- **Background Remover** — clean product/portrait cutouts in one click
- **Magic Write** — generate and fix copy inside the design

Free account + free elements cover 90% of client work. Filter by "Free" to avoid surprise paywalls at export.

## 💡 Real-world example
A student used a template unchanged — viewers recognized it instantly from Canva's homepage. The same template with new colors, fonts and photos looked completely original.

## ✍️ Practical
1. Open a free template and change colors, fonts, images and text.
2. Try Background Remover on a portrait.
3. Export as PNG.

## ✅ Checklist
- [ ] I know the workspace panels
- [ ] I customized a template ≥60%
- [ ] I used one Magic tool`,
        },
        {
          title: 'Typography & Color: The Two Fastest Upgrades',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.fonts, R.colors],
          content: `## 🎯 What you will learn
- Pairing fonts that look expensive
- Choosing a palette in 60 seconds
- The 60-30-10 color rule

## 📖 Lesson
**Fonts:** use max 2 per design — one **display** font (bold, characterful) for headlines, one clean **body** font for everything else. Classic pairings: bold sans-serif headline + light sans body; elegant serif headline + simple sans body. Never stretch, warp or outline-shadow text.

**Color:** build palettes with Coolors or steal from great brands. Then apply **60-30-10**:
- 60% dominant (usually background)
- 30% secondary (shapes, blocks)
- 10% accent (buttons, keywords — your loudest color)

Check contrast: light text on dark backgrounds (or reverse). If you squint and can't read it, fix it.

## 💡 Real-world example
A brand kit redesign changed nothing but fonts (2 fonts) and palette (60-30-10). Their Instagram suddenly looked like one brand instead of a random feed — followers asked who their designer was.

## ✍️ Practical
1. Pick 2 fonts (display + body) and use them in a test design.
2. Generate a palette on Coolors; apply it 60-30-10.
3. Squint-test readability.

## ✅ Checklist
- [ ] Max 2 fonts per design
- [ ] Palette follows 60-30-10
- [ ] Text passes the squint test`,
        },
        {
          title: 'Working with Images, Icons & Brand Assets',
          duration: '14 min',
          videoUrl: V3,
          resources: [R.pexels, R.unsplash],
          content: `## 🎯 What you will learn
- Where to get free, legal, high-quality images
- Frames, grids and photo composition tricks
- Building a reusable brand kit

## 📖 Lesson
**Sources:** Pexels, Unsplash (free, commercial-safe), Canva's free library. Avoid random Google Images — copyright claims are real and clients get burned.

**Using photos well:**
- Pick images with **empty space** where text will sit
- Use **frames/grids** (Elements → Frames) for clean shapes
- Darken busy photos with a transparent black overlay before adding text
- Keep image style consistent (same lighting/mood) across one project

**Brand kit** (even on free Canva): save your 2 fonts + 5 colors as a style page, and keep logos in your Uploads folder. Every new design starts on-brand in 30 seconds.

## 💡 Real-world example
A small restaurant's posts used random clip-art for months. Switching to consistent Pexels food photography + one overlay style doubled post saves.

## ✍️ Practical
1. Download 3 on-theme photos from Pexels.
2. Place one in a frame, add a dark overlay + readable text.
3. Save your fonts & colors as your brand style reference.

## ✅ Checklist
- [ ] All images legally sourced
- [ ] Text readable over photos
- [ ] Brand fonts/colors saved`,
        },
      ],
    },
    {
      title: 'Module 2: Social Media Design Pack',
      lessons: [
        {
          title: 'Instagram Post & Carousel Design',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.canva, { title: 'HubSpot — social media image sizes', url: 'https://blog.hubspot.com/marketing/social-media-image-dimensions', type: 'article' }],
          content: `## 🎯 What you will learn
- Designing scroll-stopping single posts
- Carousels that get swiped to the end
- Sizes and safe zones that never crop badly

## 📖 Lesson
**Single post anatomy:** one hook line (big), one supporting line (small), one visual hero, your handle small in a corner. That's it — posts with one message win.

**Carousels** (multi-slide posts) get the highest engagement because each swipe counts as interaction:
- Slide 1: bold hook/question
- Slides 2–6: ONE idea per slide, big text, same layout rhythm
- Last slide: CTA ("Save this", "Follow for more")
- Design trick: run one element (line/arrow/shape) across slide edges to pull swipes

Sizes: post 1080×1080 or 1080×1350 (portrait shows bigger on phones), story/reel cover 1080×1920.

## 💡 Real-world example
A creator's carousel "5 Canva shortcuts" kept one yellow arrow continuing across every slide edge. Completion rate (people reaching slide 7) doubled vs their normal posts.

## ✍️ Practical
1. Design one hook post with the anatomy above.
2. Build a 5-slide carousel, one idea per slide.
3. Add a cross-slide element on at least two edges.

## ✅ Checklist
- [ ] Single post = one message
- [ ] Carousel: hook → 1 idea/slide → CTA
- [ ] Correct sizes used`,
        },
        {
          title: 'Story, Reel Cover & Status Graphics',
          duration: '13 min',
          videoUrl: V3,
          resources: [R.canva],
          content: `## 🎯 What you will learn
- Designing for 9:16 safely
- Reel covers that make profiles look premium
- WhatsApp status graphics for business

## 📖 Lesson
**9:16 safe zones:** platforms cover the top ~15% (username) and bottom ~25% (buttons/captions). Keep all key content in the middle band. Design at 1080×1920.

**Reel covers** are your profile's first impression: one consistent cover style (same font + color strip) makes a messy grid look like a brand. Template it once, reuse forever.

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
- [ ] WhatsApp card readable at a glance`,
        },
        {
          title: 'YouTube Thumbnails & Banners',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.canva, { title: 'YouTube — thumbnail best practices', url: 'https://support.google.com/youtube/answer/141805', type: 'docs' }],
          content: `## 🎯 What you will learn
- Thumbnail formulas that earn clicks
- Faces, contrast and the 3-word rule
- Channel banner sizing done right

## 📖 Lesson
Thumbnails decide 80% of whether a video gets clicked. Winning formula:
1. **Big emotion face** (surprise/joy) or **one bold object**
2. **Max 3–4 words** — huge, thick font, high contrast (outline helps)
3. **Bright, separated colors** — subject pops from background
4. Curiosity gap: image + words ask a question the title answers

Design at 1280×720. Test tiny: shrink the design to phone-list size — if you can't read it, make text bigger.

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
- [ ] Banner safe center used`,
        },
        {
          title: 'Ad Creative That Converts',
          duration: '15 min',
          videoUrl: V3,
          resources: [R.canva, { title: 'Meta — ad design guides', url: 'https://www.facebook.com/business/ads-guide', type: 'docs' }],
          content: `## 🎯 What you will learn
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
- [ ] 3 variants ready`,
        },
      ],
    },
    {
      title: 'Module 3: Flyers, Logos & Brand Kits',
      lessons: [
        {
          title: 'Flyer & Poster Design (Events, Churches, Business)',
          duration: '16 min',
          videoUrl: V1,
          resources: [R.canva, R.pexels],
          content: `## 🎯 What you will learn
- The flyer layout that always works
- Typography for events: drama without mess
- Print vs digital export settings

## 📖 Lesson
Flyer layout (Z-pattern — how eyes scan):
1. **Top:** event title, BIGGEST text, most dramatic font
2. **Middle:** hero image/visual + key details (date • time • venue)
3. **Bottom:** contact/CTA + socials/logos

Rules: one dramatic display font for the title, one clean font for details. Make DATE & VENUE easy to find — flyers fail when people can't find *when/where*. High contrast background or overlay. Sizes: A4/A5 for print, 1080×1350 for sharing online.

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
- [ ] Both exports correct`,
        },
        {
          title: 'Logo Design & Brand Identity Basics',
          duration: '17 min',
          videoUrl: V2,
          resources: [R.canvaLearn, R.fonts],
          content: `## 🎯 What you will learn
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
- [ ] Mini brand kit assembled`,
        },
        {
          title: 'Business Cards, Letterheads & Stationery',
          duration: '13 min',
          videoUrl: V3,
          resources: [R.canva],
          content: `## 🎯 What you will learn
- Clean stationery layouts
- What belongs on a business card in 2025
- Matching everything to the brand kit

## 📖 Lesson
**Business card (3.5×2in):** front = logo + name + role; back = phone/WhatsApp, email, one-line value, QR code (Canva can generate QR codes) linking to your portfolio or WhatsApp. Max 3 fonts sizes hierarchy; keep ≥5mm margins — printers cut imprecisely.

**Letterhead:** logo top-left or center, contact strip at bottom, generous white space in the middle (it's for *their* content). **Invoice templates** use the same header — consistency makes small businesses look established.

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
- [ ] Print margins respected`,
        },
        {
          title: 'Menus, Price Lists & Product Catalogs',
          duration: '14 min',
          videoUrl: V1,
          resources: [R.canva, R.pexels],
          content: `## 🎯 What you will learn
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
- [ ] Template reusable for updates`,
        },
      ],
    },
    {
      title: 'Module 4: Presentations, Clients & Income',
      lessons: [
        {
          title: 'Presentation Design (Slides People Remember)',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.canva, { title: 'Canva presentations hub', url: 'https://www.canva.com/presentations/', type: 'tool' }],
          content: `## 🎯 What you will learn
- The 1-idea-per-slide rule
- Visual slides vs text walls
- Presenting straight from Canva

## 📖 Lesson
Death by PowerPoint is death by *text*. Fix it with:
1. **One idea per slide** — if you need "and", make a new slide
2. **Headline states the takeaway** ("Sales grew 40%" not "Q3 Results")
3. **Visuals carry the slide**: chart, icon, photo — text max ~20 words
4. **Consistent rhythm**: same font sizes and margins across slides

Charts: simplify — remove gridlines, label the important number directly. Canva's built-in charts connect to your data.

Use Canva's **present mode** (record yourself too) — no need for other software.

## 💡 Real-world example
A student pitch changed headlines from labels ("Marketing") to claims ("Instagram will double our leads"). The panel remembered every claim — claims stick, labels don't.

## ✍️ Practical
1. Build a 6-slide deck: hook slide + 4 idea slides + CTA.
2. Apply claim-style headlines.
3. Present it in Canva's present mode once.

## ✅ Checklist
- [ ] One idea per slide
- [ ] Headlines are claims
- [ ] ≤20 words per slide`,
        },
        {
          title: 'Client Workflow: Brief → Draft → Delivery',
          duration: '15 min',
          videoUrl: V3,
          resources: [R.canva],
          content: `## 🎯 What you will learn
- Running a professional design project A to Z
- The brief questions that prevent rework
- Delivering files clients can actually use

## 📖 Lesson
**1. Brief (before any design):** ask — What is this for? Who is the audience? What ONE action should it trigger? Preferred colors/brands to avoid? Deadline? Examples you like? Get answers in writing (WhatsApp is fine).

**2. Draft:** show 1–2 directions as rough previews, not full finals. Agree on direction first — it halves revisions.

**3. Revisions:** define rounds (2 included). Log every change request in one message list.

**4. Delivery package:** PNG (social), PDF (print), editable Canva template link if agreed, plus fonts/colors used. Name files clearly: \`BrandName_Flyer_v2_Final.png\`.

**Invoice habit:** 50% deposit before work starts. Professionals don't design on promises.

## 💡 Real-world example
A designer skipped the brief once: the client "hated blue" — revealed after the final. Every project since starts with the written brief. Zero surprise rework.

## ✍️ Practical
1. Write your 6-question brief template.
2. Run it on a practice client (friend/business).
3. Deliver a full package with named files.

## ✅ Checklist
- [ ] Brief template ready
- [ ] Direction approved before finals
- [ ] Files delivered, named professionally`,
        },
        {
          title: 'Selling Design Services Online',
          duration: '16 min',
          videoUrl: V1,
          resources: [{ title: 'Fiverr — sell design gigs', url: 'https://www.fiverr.com/', type: 'tool' }, { title: 'Behance — free design portfolio', url: 'https://www.behance.net/', type: 'tool' }, { title: 'Upwork — freelance marketplace', url: 'https://www.upwork.com/', type: 'tool' }],
          content: `## 🎯 What you will learn
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
A Canva designer made 3 mock restaurant menus, posted them, and tagged local restaurants. Two DM'd within a week. Proof beats promises.

## ✍️ Practical
1. Write 3 productized offers with clear deliverables.
2. Set up Behance or a portfolio folder with 3 samples.
3. Announce your services on WhatsApp status today.

## ✅ Checklist
- [ ] 3 clear offers written
- [ ] Portfolio live somewhere
- [ ] First announcement posted`,
        },
        {
          title: 'Capstone: Complete Brand Package for a Real Business',
          duration: '22 min',
          videoUrl: V2,
          resources: [R.canva, R.fonts, R.colors],
          content: `## 🎯 What you will learn
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
- [ ] Testimonial requested`,
        },
      ],
    },
  ],
};
