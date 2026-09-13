// DIGITAL MARKETING — full professional curriculum
const V1 = 'https://www.youtube.com/watch?v=G6DmDqYLWL8'; // Digital marketing full course 3h
const V2 = 'https://www.youtube.com/watch?v=BbJ604IjM5g'; // Digital marketing full course 2025

const R = {
  seoGuide: { title: 'Google SEO Starter Guide (official, free PDF-style guide)', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide', type: 'pdf' },
  hubspot: { title: 'HubSpot Academy — free marketing certifications', url: 'https://academy.hubspot.com/', type: 'course' },
  skillshop: { title: 'Google Skillshop — Ads & Analytics certifications', url: 'https://skillshop.exceedlms.com/', type: 'course' },
  metaLearn: { title: 'Meta Blueprint — free Facebook/Instagram ads training', url: 'https://www.facebook.com/business/learn', type: 'course' },
  analyticsAcademy: { title: 'Google Analytics Academy', url: 'https://analytics.google.com/analytics/academy/', type: 'course' },
  mailchimp: { title: 'Mailchimp — email marketing starter', url: 'https://mailchimp.com/resources/', type: 'resource' },
};

export default {
  slug: 'digital-marketing',
  curriculum: [
    {
      title: 'Module 1: Marketing Foundations & Funnels',
      lessons: [
        {
          title: 'Digital Marketing Landscape: Channels & Careers',
          duration: '15 min',
          videoUrl: V1,
          resources: [R.hubspot],
          content: `## 🎯 What you will learn
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
6. **Influencer/affiliate** — borrowing other people's audiences
7. **Analytics** — measuring everything (binds them all)

Businesses rarely use one channel alone. A typical Nigerian SME combo: Instagram content + WhatsApp closing + small Meta ads + Google Business Profile.

Career paths: in-house marketer, agency specialist, freelancer, or marketing your own business. Specialists (one channel deep) get paid faster than generalists — then expand.

## 💡 Real-world example
A phone accessories shop: posts reviews on Instagram (social), boosts best posts (ads), closes on WhatsApp (direct), and ranks for "iPhone repair Lekki" (local SEO). Four channels, one system.

## ✍️ Practical
1. Pick a local business; list which channels they use today.
2. Identify the ONE channel they're missing.
3. Write which channel you'll specialize in first, and why.

## ✅ Checklist
- [ ] I can name all 7 channels
- [ ] I analyzed a real business's mix
- [ ] I chose my first specialty`,
        },
        {
          title: 'Customer Personas & the Marketing Funnel',
          duration: '16 min',
          videoUrl: V1,
          resources: [R.hubspot],
          content: `## 🎯 What you will learn
- Building a customer persona that changes your content
- Awareness → Consideration → Conversion funnel
- Matching content to funnel stage

## 📖 Lesson
You can't sell to "everybody". A **persona** is a written sketch of your ideal customer: name, age, location, income, fears, dreams, where they spend time online, what they type into Google.

The **funnel** describes their journey:
- **Awareness** — they discover a problem ("my skin is dry") → content: education, tips
- **Consideration** — they compare solutions → content: reviews, comparisons, proof
- **Conversion** — they choose → content: offers, guarantees, easy contact

Most failed marketing is stage mismatch: pushing "BUY NOW" to someone who doesn't know they have a problem yet.

## 💡 Real-world example
A fitness coach wrote content for "busy mums in Surulere who want 20-minute home workouts" instead of "fitness". Her engagement tripled — specificity sells.

## ✍️ Practical
1. Write one persona for a business you know (10 lines).
2. List 1 content idea per funnel stage for them.
3. Identify where that business currently talks most (usually conversion — the mistake).

## ✅ Checklist
- [ ] Persona written (10 lines)
- [ ] 3 funnel-stage contents listed
- [ ] I can spot stage-mismatched marketing`,
        },
        {
          title: 'Positioning, Offers & the Value Ladder',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.hubspot],
          content: `## 🎯 What you will learn
- Positioning: why customers pick YOU
- Writing offers that are easy to say yes to
- The value ladder (free → cheap → premium)

## 📖 Lesson
**Positioning** = the one idea a customer remembers about you. Formula: "We help [who] get [result] through [unique method], unlike [alternative]."

**Offer design:** an offer is not a price — it's a package: product + bonus + guarantee + deadline. "₦15k website, free logo included, delivered in 5 days, 1 revision round" beats "websites available".

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
- [ ] Value ladder sketched`,
        },
        {
          title: 'Brand Voice & Messaging Basics',
          duration: '13 min',
          videoUrl: V2,
          resources: [R.hubspot],
          content: `## 🎯 What you will learn
- Defining a consistent brand voice
- Message hierarchy across channels
- The 3 questions every caption must answer

## 📖 Lesson
**Brand voice** is how you sound everywhere: friendly-expert? bold and funny? calm and premium? Pick 3 adjectives and filter every caption through them. Consistency builds recognition faster than logos do.

**Message hierarchy:** one core message per campaign ("fastest repairs in town"), supported by proofs (reviews, speed stats). Don't mix five messages in one post.

Every caption should answer, in order:
1. **What's in it for me?** (hook)
2. **Why should I believe you?** (proof)
3. **What do I do next?** (CTA)

## 💡 Real-world example
Two water vendors: one posts "Pure water available". The other: "Thirsty? Ice-cold sachets delivered to your gate in 10 minutes — 200+ orders this week. DM 'WATER' to order." Guess who gets DMs.

## ✍️ Practical
1. Choose 3 voice adjectives for a brand.
2. Rewrite one weak caption using hook→proof→CTA.
3. Read both aloud — which one sells?

## ✅ Checklist
- [ ] 3 voice adjectives chosen
- [ ] Caption rewritten (hook→proof→CTA)
- [ ] One core message per post`,
        },
      ],
    },
    {
      title: 'Module 2: SEO & Content Marketing',
      lessons: [
        {
          title: 'How Google Works: Search & Keywords',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.seoGuide],
          content: `## 🎯 What you will learn
- How Google decides what ranks
- Finding keywords real customers type
- Search intent: the ranking secret

## 📖 Lesson
Google's job: give searchers the best answer fast. It ranks pages by **relevance** (does it match the query?), **quality** (helpful, trustworthy?), and **authority** (do other sites link/refer to it?).

**Keywords** are the exact phrases people type. Find them by:
- Autocomplete: type your topic in Google, note suggestions
- "People also ask" boxes
- Free tools (Google Keyword Planner with a free Ads account)

**Search intent** — what the searcher wants:
- Informational: "how to edit videos" → give a guide
- Commercial: "best budget phone 2025" → give comparisons
- Transactional: "buy iPhone 13 Lagos" → give a product page
Match intent or Google won't rank you, however good the writing.

## 💡 Real-world example
A salon wrote "Hair treatment" (nobody searches that). Switched to "locs retouch price in Ikeja" — a phrase real customers type — and started showing up in local searches.

## ✍️ Practical
1. Use autocomplete to collect 10 keyword ideas for one business.
2. Label each: informational / commercial / transactional.
3. Pick the 2 best transactional keywords to target.

## ✅ Checklist
- [ ] 10 keywords collected
- [ ] Intent labeled for each
- [ ] Top 2 targets chosen`,
        },
        {
          title: 'On-Page SEO: Titles, Content & Local Business',
          duration: '16 min',
          videoUrl: V1,
          resources: [R.seoGuide],
          content: `## 🎯 What you will learn
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
- [ ] Local profile checklist ready`,
        },
        {
          title: 'Content Marketing & Blogging That Attracts',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.hubspot, { title: 'HubSpot blog — content marketing guides', url: 'https://blog.hubspot.com/marketing', type: 'article' }],
          content: `## 🎯 What you will learn
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
A baker posted one "how it's made" reel weekly. Month 1: 200 followers. Month 6: 11k followers and wholesale enquiries — one repeatable format, zero ad spend.

## ✍️ Practical
1. Choose 3 content pillars for a brand.
2. Write 9 hooks (3 per pillar).
3. Schedule the first week.

## ✅ Checklist
- [ ] 3 pillars chosen
- [ ] 9 hooks written
- [ ] Week 1 scheduled`,
        },
        {
          title: 'Repurposing: One Idea, Ten Pieces',
          duration: '13 min',
          videoUrl: V1,
          resources: [R.hubspot],
          content: `## 🎯 What you will learn
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
- [ ] Style stays consistent`,
        },
      ],
    },
    {
      title: 'Module 3: Social Media & Paid Ads',
      lessons: [
        {
          title: 'Instagram & TikTok Growth Systems',
          duration: '16 min',
          videoUrl: V1,
          resources: [R.metaLearn],
          content: `## 🎯 What you will learn
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

**Weekly routine:** 3–4 posts (mix formats), 15 min/day engaging in your niche's comments (real conversations, not spam), 1 experiment weekly (new hook/format), review analytics Sunday: double down on what worked.

## 💡 Real-world example
A skincare brand started answering every comment with a question ("What's your skin type?"). Comment threads doubled → algorithm pushed posts further → followers grew 3× faster.

## ✍️ Practical
1. Optimize one profile with the checklist.
2. Plan this week's 3 posts with hook-first captions.
3. Spend 15 min engaging genuinely in your niche.

## ✅ Checklist
- [ ] Profile converts (bio + link + highlights)
- [ ] 3 hook-first posts planned
- [ ] Daily engagement scheduled`,
        },
        {
          title: 'WhatsApp Marketing & Community Selling',
          duration: '14 min',
          videoUrl: V2,
          resources: [{ title: 'WhatsApp Business — official', url: 'https://business.whatsapp.com/', type: 'tool' }],
          content: `## 🎯 What you will learn
- WhatsApp Business setup for selling
- Status strategy that sells daily
- Broadcasts and lists without being spammy

## 📖 Lesson
In Nigeria, WhatsApp IS the internet for commerce. Set up **WhatsApp Business**: catalog with prices, quick replies for FAQs, labels (New lead / Paid / Delivered), away messages.

**Status strategy (your free daily billboard):**
- 3–5 statuses/day max: product → proof (review screenshot) → behind-the-scenes → offer
- Faces and videos outperform graphics
- End with a clear next step ("reply 'PRICE'")

**Broadcasts:** segment lists (customers vs prospects), send value 3× more often than offers. Rule of thumb: 3 helpful messages per 1 promotional. Never mass-add people to groups without consent — instant trust killer.

## 💡 Real-world example
A thrift seller posts daily "arrivals" statuses at 7pm when customers scroll. Regulars screenshot items to claim. Her status is her shopfront — no rent.

## ✍️ Practical
1. Set up WhatsApp Business with catalog + quick replies.
2. Plan tomorrow's 4-status sequence.
3. Label your existing contacts properly.

## ✅ Checklist
- [ ] Business app configured
- [ ] Status sequence planned
- [ ] Contacts labeled`,
        },
        {
          title: 'Meta Ads: Your First Profitable Campaign',
          duration: '18 min',
          videoUrl: V1,
          resources: [R.metaLearn, R.skillshop],
          content: `## 🎯 What you will learn
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
- [ ] Cost-per-chat target set`,
        },
        {
          title: 'Google Ads Basics & Retargeting',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.skillshop],
          content: `## 🎯 What you will learn
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
- [ ] Retargeting message drafted`,
        },
      ],
    },
    {
      title: 'Module 4: Email, Analytics & Freelancing',
      lessons: [
        {
          title: 'Email Marketing & Automation Basics',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.mailchimp, R.hubspot],
          content: `## 🎯 What you will learn
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
A course creator's welcome email (delivers free PDF + tells her story + links the course) earns more sales per month than any single post she writes.

## ✍️ Practical
1. Create one lead magnet idea for a business.
2. Write the welcome email (deliver → introduce → soft CTA).
3. Set up a free Mailchimp (or similar) account.

## ✅ Checklist
- [ ] Lead magnet defined
- [ ] Welcome email written
- [ ] Email tool account ready`,
        },
        {
          title: 'Analytics: Reading Numbers That Matter',
          duration: '16 min',
          videoUrl: V1,
          resources: [R.analyticsAcademy, R.skillshop],
          content: `## 🎯 What you will learn
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
- [ ] One data-driven decision made`,
        },
        {
          title: 'Marketing Freelance: Packages, Clients & Retainers',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.hubspot, { title: 'Upwork — marketing freelance marketplace', url: 'https://www.upwork.com/', type: 'tool' }],
          content: `## 🎯 What you will learn
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
A student managed a restaurant's page free for 2 weeks (+38% orders tracked). The case study got her 2 paying retainers the following month — one free sprint, recurring income.

## ✍️ Practical
1. Write 3 service packages with clear deliverables.
2. Pick your "free sprint" target business.
3. Create a simple case-study template (problem → actions → numbers).

## ✅ Checklist
- [ ] 3 packages written
- [ ] Sprint target chosen
- [ ] Case study template ready`,
        },
        {
          title: 'Capstone: Full Marketing Plan for a Real Business',
          duration: '22 min',
          videoUrl: V1,
          resources: [R.hubspot, R.seoGuide, R.metaLearn],
          content: `## 🎯 What you will learn
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

Next: HubSpot's free certifications add credibility to your CV/profile — finish one this month.

## 💡 Real-world example
Students presented this capstone to real businesses; several were hired on the spot for ₦50k–₦150k/month retainers — the plan itself was the proof of skill.

## ✍️ Practical
1. Write the full 7-section plan.
2. Design the 8–10 slide presentation.
3. Present it to the business (or record yourself).

## ✅ Checklist
- [ ] All 7 sections complete
- [ ] Plan presented
- [ ] One free certification started`,
        },
      ],
    },
  ],
};
