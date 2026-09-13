// PORTFOLIO CREATION & FREELANCE SUCCESS — full professional curriculum
const V1 = 'https://www.youtube.com/watch?v=0CyhIoQlERI'; // Freelancing full guide
const V2 = 'https://www.youtube.com/watch?v=3KiMwhCuJWs'; // Portfolio building
const V3 = 'https://www.youtube.com/watch?v=UXtcoQAvs4U'; // Landing clients

const R = {
  behance: { title: 'Behance — free global portfolio platform', url: 'https://www.behance.net/', type: 'resource' },
  dribbble: { title: 'Dribbble — design showcase', url: 'https://dribbble.com/', type: 'resource' },
  github: { title: 'GitHub — developer portfolios live here', url: 'https://github.com/', type: 'resource' },
  linkedin: { title: 'LinkedIn — your professional storefront', url: 'https://www.linkedin.com/', type: 'resource' },
  fiverr: { title: 'Fiverr — freelance marketplace', url: 'https://www.fiverr.com/', type: 'resource' },
  upwork: { title: 'Upwork — freelance marketplace', url: 'https://www.upwork.com/', type: 'resource' },
  carrd: { title: 'Carrd — one-page portfolio sites (free tier)', url: 'https://carrd.co/', type: 'tool' },
};

export default {
  slug: 'portfolio-creation',
  curriculum: [
    {
      title: 'Module 1: Portfolio Foundations',
      lessons: [
        {
          title: 'Your Portfolio Is Your CV: The Mindset Shift',
          duration: '13 min',
          videoUrl: V2,
          resources: [R.behance, R.linkedin],
          content: `## 🎯 What you will learn
- Why proof beats claims in the skills economy
- What buyers actually look for in 30 seconds
- Choosing your portfolio's one promise

## 📖 Lesson
In the digital skills economy, nobody hires claims ("I am good at design"). Buyers hire **evidence**: work they can see, results they can verify, a person who feels safe to pay.

**The 30-second scan** — when a client opens your portfolio, they ask:
1. What does this person DO? (one clear skill, not ten)
2. Have they done it for someone real? (case studies > random samples)
3. Can I reach them easily? (WhatsApp/email visible)

**Your one promise:** pick the lane you sell FIRST — "I design brands for food businesses", not "I do everything digital". Specialists get paid more and remembered; generalists compete on price forever. You can expand later; start sharp.

**Portfolio ≠ gallery.** A gallery shows everything you've ever made. A portfolio is a curated argument: "here are 3–5 proofs I solve YOUR problem."

## 💡 Real-world example
Two designers applied for the same logo job. One had 40 random samples; the other showed 4 brand projects with results described ("helped a salon double bookings"). The 4-piece portfolio won — and charged double.

## ✍️ Practical
1. Write your one-promise sentence.
2. List every project/skill you have; mark the 3–5 that fit the promise.
3. Find 3 portfolios you admire; note what they show first.

## ✅ Checklist
- [ ] One promise written
- [ ] 3–5 proof projects selected
- [ ] Curation mindset adopted`,
        },
        {
          title: 'Choosing Your Platform: Where Your Work Lives',
          duration: '14 min',
          videoUrl: V2,
          resources: [R.behance, R.github, R.carrd],
          content: `## 🎯 What you will learn
- Free platforms by skill type
- The 3-layer presence (marketplace, showcase, home base)
- Setting up your primary home today

## 📖 Lesson
You don't need a website to start — platforms do the hosting:
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
A video editor's entire client flow: Instagram bio → Carrd link (showreel + 3 case studies + WhatsApp) → booking. One free page, constantly producing.

## ✍️ Practical
1. Create your primary showcase account (right platform for your skill).
2. Set up a Carrd (or Linktree) home base with your promise.
3. Add your WhatsApp contact — non-negotiable for Nigerian clients.

## ✅ Checklist
- [ ] Primary platform chosen & live
- [ ] Home base link created
- [ ] WhatsApp reachable from it`,
        },
        {
          title: 'Anatomy of a Winning Case Study',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.behance],
          content: `## 🎯 What you will learn
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

**No numbers yet?** Outcomes can be qualitative: client satisfaction, time saved, repeat hires. And NO client work? Do Module 1's exercise: self-initiated projects count when framed as case studies.

Screenshots say "I made things." Case studies say "I solve business problems." That's the difference between ₦5k and ₦50k jobs.

## 💡 Real-world example
A designer's Behance showed 12 logo images — zero enquiries. She rewrote her best 3 as case studies with problem→outcome stories. First enquiry in nine days.

## ✍️ Practical
1. Write your first full case study using the 6 parts.
2. Publish it on your showcase platform.
3. Send the link to one friend for honest feedback.

## ✅ Checklist
- [ ] 6-part structure followed
- [ ] Outcome stated honestly
- [ ] Published & shareable`,
        },
        {
          title: 'Before/After, Mockups & Presentation Magic',
          duration: '15 min',
          videoUrl: V2,
          resources: [{ title: 'Smartmockups — free device/brand mockups', url: 'https://smartmockups.com/', type: 'tool' }, { title: 'Canva — free design & mockups', url: 'https://www.canva.com/', type: 'tool' }, R.behance],
          content: `## 🎯 What you will learn
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

Presentation IS part of the work: clients can't judge skill they can't see clearly.

## 💡 Real-world example
An AI video creator's reel of 6 generated clips with a 3-second intro ("I turn scripts into scenes") landed 3 agency gigs in a month — agencies buy reels, not descriptions.

## ✍️ Practical
1. Put your 3 best works into mockups.
2. Create one before/after comparison image.
3. (Video folks) cut a 45-second showreel and upload.

## ✅ Checklist
- [ ] Works shown in context
- [ ] One before/after made
- [ ] Reel or visual hero ready`,
        },
      ],
    },
    {
      title: 'Module 2: Personal Brand & Online Presence',
      lessons: [
        {
          title: 'LinkedIn: Your 24/7 Salesperson',
          duration: '15 min',
          videoUrl: V3,
          resources: [R.linkedin],
          content: `## 🎯 What you will learn
- Profile sections that convert visitors
- Content rhythm that attracts clients
- Reaching decision-makers directly

## 📖 Lesson
LinkedIn is where business owners and managers look for talent. Optimize once:
- **Headline** = promise, not title: "Brand designer for food businesses" beats "Graphic Designer"
- **Banner** = mini billboard: your work + one line + contact
- **About** = who you help, how, proof, and a CTA ("DM me 'BRAND'")
- **Featured** = pin your 3 best case studies
- **Photo** = clear face, good light, you smiling

**Content rhythm (2–3× weekly):**
- Show process (timelapses, screenshots, decisions)
- Share lessons ("3 mistakes restaurants make on menus")
- Post case studies when published
Every post ends with what you do + how to reach you.

**Outreach:** connect with 5 ideal clients daily with a one-line note (no pitch in message 1). Comment genuinely on their posts — visibility before asking.

## 💡 Real-world example
A virtual assistant posted daily "what I organized today" stories for a month. Three business owners DM'd her — she'd never applied to any of them. Content pulls; applications beg.

## ✍️ Practical
1. Rewrite headline + About with the formulas above.
2. Pin 3 featured items.
3. Post 2× this week + connect with 10 local business owners.

## ✅ Checklist
- [ ] Headline states promise
- [ ] Featured section live
- [ ] Content rhythm started`,
        },
        {
          title: 'Instagram, X & TikTok for Creators',
          duration: '14 min',
          videoUrl: V3,
          resources: [R.dribbble],
          content: `## 🎯 What you will learn
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

Bio formula: WHAT you do | WHO it's for | PORTFOLIO link | WhatsApp. Pin your 3 best posts. Stories keep you human; posts do the selling.

Followers ≠ clients. Conversion comes from clear CTAs: "DM 'DESIGN' for packages". Ten engaged local followers who buy beat 10,000 strangers who scroll.

## 💡 Real-world example
A CapCut editor posted one 20-second edit-timelapse daily. Follower count: modest. Enquiries: constant — because every local business owner who followed knew exactly what to DM for.

## ✍️ Practical
1. Optimize your bio with the formula.
2. Publish 3 pieces this week (2 formats).
3. Add a CTA + portfolio link to your profile.

## ✅ Checklist
- [ ] Platform chosen per skill
- [ ] 3 posts published
- [ ] CTA in bio working`,
        },
        {
          title: 'Personal Brand Basics: Name, Story & Consistency',
          duration: '13 min',
          videoUrl: V1,
          resources: [R.linkedin, R.behance],
          content: `## 🎯 What you will learn
- Professional identity decisions (name, handle, photo)
- Your story: the "why you" narrative
- Consistency systems that compound

## 📖 Lesson
A brand is what people say about you when you're not there. Build it deliberately:

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
- [ ] Weekly slot protected`,
        },
        {
          title: 'Networking: The Hidden Job Market',
          duration: '14 min',
          videoUrl: V1,
          resources: [R.linkedin],
          content: `## 🎯 What you will learn
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
- [ ] 3 peer referrals built`,
        },
      ],
    },
    {
      title: 'Module 3: Getting Paid Work',
      lessons: [
        {
          title: 'Freelance Platforms: Fiverr & Upwork Done Right',
          duration: '17 min',
          videoUrl: V1,
          resources: [R.fiverr, R.upwork],
          content: `## 🎯 What you will learn
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

**The cold truth:** platforms reward momentum — your first 3–5 reviews are bought with low prices and overdelivery. That's the fee for entering a global market with real currency income (USD!).

## 💡 Real-world example
A designer's first 5 Fiverr gigs were priced at $10 each. After 5-star reviews, the same gig repriced to $80 — and still converts. Reviews are the asset; early prices are the investment.

## ✍️ Practical
1. Create a Fiverr gig with 3 packages + visuals.
2. Write an Upwork profile + one template proposal.
3. Send 5 tailored proposals this week.

## ✅ Checklist
- [ ] Gig live with packages
- [ ] Proposals client-first
- [ ] 5 applications sent`,
        },
        {
          title: 'Pricing Your Skills in Naira & Dollars',
          duration: '15 min',
          videoUrl: V1,
          resources: [R.fiverr, R.upwork],
          content: `## 🎯 What you will learn
- Value-based vs hourly vs project pricing
- Starter rate bands for common services
- Handling "it's too expensive"

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

**"Too expensive":** don't defend — reframe: offer a smaller package ("we can start with just the homepage") or clarify the value. Never discount silently; change scope instead.

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
- [ ] Deposit policy set`,
        },
        {
          title: 'Proposals, Contracts & Professional Delivery',
          duration: '16 min',
          videoUrl: V3,
          resources: [R.fiverr, R.upwork],
          content: `## 🎯 What you will learn
- The 5-part proposal structure
- Simple contracts that protect both sides
- Delivery habits that earn repeat business

## 📖 Lesson
**Proposal structure (one page):**
1. Their problem (in their words — proves you listened)
2. Your solution (what you'll deliver, concretely)
3. Proof (1–2 relevant case study links)
4. Timeline + price + payment schedule
5. Next step ("Shall I start Monday?")

**Contract essentials** (even a WhatsApp-confirmed document): scope (exact deliverables), revision count (2 rounds standard), timeline, payment schedule (deposit → final before delivery), kill fee if they cancel mid-way, ownership transfers at final payment.

**Delivery habits that compound:**
- Set expectations day one; update BEFORE being asked
- Deliver a day early when possible
- Present the work (voice note/Loom walkthrough), don't just attach files
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
- [ ] Presentation habit built`,
        },
        {
          title: 'Getting Your First Client Without Experience',
          duration: '15 min',
          videoUrl: V3,
          resources: [R.fiverr, R.linkedin],
          content: `## 🎯 What you will learn
- The experience paradox and its exits
- Self-initiated projects as proof
- The 10-outreach sprint

## 📖 Lesson
"Need experience to get work, need work to get experience" — four exits:

1. **Self-initiated projects:** redesign a famous app's screen, rebrand a local shop, rebuild a website concept. Frame as case studies; no client needed, full proof earned.
2. **Volunteer strategically:** one NGO/church/school project, done excellently, WITH a testimonial and permission to showcase.
3. **The low-price first 3:** your first three paid gigs are tuition — price to win, overdeliver, collect reviews. Raise after.
4. **Skills challenges & communities:** design/dev challenges (and this platform's certificates) add verifiable activity.

**The 10-outreach sprint:** list 10 people/businesses who could use your skill. Send each a SHORT personalized message: one specific observation about their current site/design + what you'd improve + your portfolio link. Expect 1–3 replies — that math works.

## 💡 Real-world example
A student with zero clients redesigned a popular local restaurant's menu, posted it tagged to them with "made this for fun". The restaurant shared it — and hired her for the full rebrand.

## ✍️ Practical
1. Complete one self-initiated project as a case study.
2. Get one testimonial (volunteer or beta client).
3. Run the 10-outreach sprint this week.

## ✅ Checklist
- [ ] Self-initiated proof built
- [ ] One testimonial secured
- [ ] 10 outreach messages sent`,
        },
      ],
    },
    {
      title: 'Module 4: Growth & Systems',
      lessons: [
        {
          title: 'Client Management: From First Call to Repeat Business',
          duration: '15 min',
          videoUrl: V3,
          resources: [R.linkedin],
          content: `## 🎯 What you will learn
- Discovery calls that close deals
- Managing revisions without scope creep
- Turning one project into a retainer

## 📖 Lesson
**Discovery call agenda (20 min):** their business → the problem → what success looks like → timeline/budget → your proposal date. Listen 70%. End by stating the next step clearly.

**Revision management:** agree rounds in writing (2 included); batch feedback ("send everything by Friday"); changes beyond scope get quoted kindly ("That's a new feature — ₦X, want it added?"). Scope creep dies in writing.

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
- [ ] Retainer offer defined`,
        },
        {
          title: 'Tools & Systems: Running Your Hustle Like a Business',
          duration: '14 min',
          videoUrl: V1,
          resources: [R.carrd, R.linkedin],
          content: `## 🎯 What you will learn
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
- [ ] Invoice template ready`,
        },
        {
          title: 'Building an Income Ladder: One-offs → Products → Agency',
          duration: '15 min',
          videoUrl: V1,
          resources: [R.fiverr, R.upwork],
          content: `## 🎯 What you will learn
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
- [ ] Listed for sale`,
        },
        {
          title: 'Capstone: Launch Your Portfolio & 30-Day Client Plan',
          duration: '20 min',
          videoUrl: V2,
          resources: [R.behance, R.github, R.fiverr, R.upwork, R.linkedin],
          content: `## 🎯 What you will learn
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

The portfolio doesn't finish — it grows with every project. What you've built in this course series is real. Now distribution does the work.

## 💡 Real-world example
Graduates who ran the 30-day plan without skipping days: nearly all reported first income or first paying conversation within the month. Plan adherence, not talent, predicted it.

## ✍️ Practical
1. Complete every launch checklist item.
2. Start week 1 of the plan today.
3. Book your weekly 30-minute review slot.

## ✅ Checklist
- [ ] Portfolio fully live
- [ ] 30-day plan scheduled
- [ ] Weekly review committed`,
        },
      ],
    },
  ],
};
