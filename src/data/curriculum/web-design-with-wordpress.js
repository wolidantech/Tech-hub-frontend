// WEB DESIGN WITH WORDPRESS — full professional curriculum
const V1 = 'https://www.youtube.com/watch?v=jhu0c6BdmjI'; // WordPress complete beginners 90min
const V2 = 'https://www.youtube.com/watch?v=09gj5gM4V98'; // WordPress 8h complete course
const V3 = 'https://www.youtube.com/watch?v=JNwTkewgRls'; // WordPress site design step-by-step

const R = {
  wpLearn: { title: 'Learn WordPress — official free courses', url: 'https://learn.wordpress.org/', type: 'course' },
  wpDocs: { title: 'WordPress official documentation', url: 'https://wordpress.org/support/', type: 'docs' },
  wpDev: { title: 'WordPress developer docs', url: 'https://developer.wordpress.org/', type: 'docs' },
  elementor: { title: 'Elementor — page builder academy', url: 'https://elementor.com/academy/', type: 'course' },
};

export default {
  slug: 'web-design-with-wordpress',
  curriculum: [
    {
      title: 'Module 1: WordPress Foundations',
      lessons: [
        {
          title: 'Why WordPress Powers 40%+ of the Web',
          duration: '13 min',
          videoUrl: V1,
          resources: [R.wpLearn],
          content: `## 🎯 What you will learn
- What WordPress is and why businesses choose it
- WordPress.org vs WordPress.com
- The skills that make you money with it

## 📖 Lesson
WordPress is a free, open-source website builder that powers over 40% of all websites — from blogs to newspapers to online stores. Businesses choose it because: they own it (no platform lock-in), thousands of free themes/plugins extend it, and any developer can maintain it.

**Key distinction:**
- **WordPress.org** = the free software you install on your own hosting (full control — this is what professionals use)
- **WordPress.com** = a hosted service (limited on free tiers)

Money skills in order: build business sites → customize themes → maintain/update sites monthly (retainers!) → add stores (WooCommerce) → speed & SEO services.

The dashboard (your control room) lives at \`yoursite.com/wp-admin\` — everything in this course happens there.

## 💡 Real-world example
Most Nigerian SME websites you've visited — schools, churches, event brands — run on WordPress. Every one of them needed (and paid) someone to build it.

## ✍️ Practical
1. Visit 5 local business websites; check if they run WordPress (view source, search "wp-content").
2. Count how many of 5 do — note the opportunity.
3. Read one lesson on learn.wordpress.org.

## ✅ Checklist
- [ ] I know .org vs .com difference
- [ ] I checked 5 real sites
- [ ] I can name 5 WordPress money skills`,
        },
        {
          title: 'Domains, Hosting & Installing WordPress',
          duration: '15 min',
          videoUrl: V1,
          resources: [R.wpDocs],
          content: `## 🎯 What you will learn
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
A client's site ranked poorly with URLs like /?p=413. Switching permalinks to /services made links readable and shareable — a 30-second setting with lasting benefit.

## ✍️ Practical
1. Brainstorm 5 domain names for a practice business.
2. Walk through a host's WordPress installer (even a free trial/local setup).
3. Apply the 4 first-settings steps.

## ✅ Checklist
- [ ] Domain naming rules known
- [ ] Install flow understood
- [ ] First 4 settings applied`,
        },
        {
          title: 'The Dashboard Deep Tour',
          duration: '14 min',
          videoUrl: V1,
          resources: [R.wpDocs],
          content: `## 🎯 What you will learn
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
- [ ] Images compressed & named`,
        },
        {
          title: 'Gutenberg Editor: Building Content Beautifully',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.wpLearn],
          content: `## 🎯 What you will learn
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

Layout discipline: one idea per section, generous spacing (blocks have spacing controls), max 2 fonts, mobile check before publish (the editor's preview button has a mobile view — use it).

## 💡 Real-world example
A consultant built her signature "Book a call" banner as a reusable block. When her calendar link changed, she edited ONE block — updated on 14 pages instantly.

## ✍️ Practical
1. Build a homepage: Cover hero → 3-column features → CTA button.
2. Create one reusable block and insert it on 2 pages.
3. Preview on mobile before saving.

## ✅ Checklist
- [ ] Hero + columns + CTA built
- [ ] Reusable block working
- [ ] Mobile preview checked`,
        },
      ],
    },
    {
      title: 'Module 2: Themes & Page Builders',
      lessons: [
        {
          title: 'Choosing & Customizing Themes',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.wpLearn, R.wpDocs],
          content: `## 🎯 What you will learn
- What a theme really controls
- Evaluating themes like a professional
- The Customizer + child theme concept

## 📖 Lesson
A **theme** controls your site's entire look. Choosing well:
- **Lightweight first** (Astra, GeneratePress, Kadence, Blocksy) — fast sites rank better
- Regularly updated + good reviews + active installs
- Works with Gutenberg (the native editor)
- Free version is enough to start; Pro adds headers/footers control

Customize via **Appearance → Customize** or the Site Editor: logo, colors, fonts, header/footer layout. Keep it minimal — a clean default theme with good content beats a flashy cluttered one.

**Child themes:** a separate tiny theme that inherits from the parent. Custom code goes in the child so theme updates never erase your changes. Learn to make one before doing client work.

## 💡 Real-world example
A designer customized a theme's code directly. The next update wiped every change. Since then: child theme for every client — updates stay safe.

## ✍️ Practical
1. Install and activate a lightweight free theme.
2. Customize logo, colors, fonts via the Customizer.
3. Read one guide on child themes and note when to use one.

## ✅ Checklist
- [ ] Lightweight theme active
- [ ] Branding customized
- [ ] Child theme purpose understood`,
        },
        {
          title: 'Page Builders: Elementor Essentials',
          duration: '17 min',
          videoUrl: V3,
          resources: [R.elementor],
          content: `## 🎯 What you will learn
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
- [ ] Mobile view clean`,
        },
        {
          title: 'Menus, Navigation & Site Structure',
          duration: '13 min',
          videoUrl: V1,
          resources: [R.wpDocs],
          content: `## 🎯 What you will learn
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
- [ ] Footer CTA added`,
        },
        {
          title: 'Essential Plugins (and What NOT to Install)',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.wpDocs],
          content: `## 🎯 What you will learn
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
A site with 42 plugins crawled and crashed monthly. Slimmed to 9, it loads in under 2 seconds and hasn't broken since.

## ✍️ Practical
1. Install the essential 6 (SEO, security, backup, cache, form, analytics).
2. Configure a daily backup to cloud storage.
3. Create a contact form and place it on the Contact page.

## ✅ Checklist
- [ ] 6 essentials installed
- [ ] Backups scheduled off-site
- [ ] Contact form live`,
        },
      ],
    },
    {
      title: 'Module 3: Content, Commerce & Forms',
      lessons: [
        {
          title: 'Blogging for Business: Categories, Tags & SEO Posts',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.wpLearn],
          content: `## 🎯 What you will learn
- Structuring a blog that attracts customers
- Categories vs tags done right
- Writing one SEO-friendly post end-to-end

## 📖 Lesson
A business blog answers the questions customers Google. Structure:
- **Categories** = 3–5 big topics (the site's shelves), e.g. "Hair Care • Styles • Products"
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
- [ ] SEO checklist green`,
        },
        {
          title: 'Forms, Bookings & Lead Capture',
          duration: '14 min',
          videoUrl: V3,
          resources: [R.wpDocs],
          content: `## 🎯 What you will learn
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
- [ ] WhatsApp path added`,
        },
        {
          title: 'WooCommerce: Turning WordPress into a Store',
          duration: '18 min',
          videoUrl: V2,
          resources: [{ title: 'WooCommerce docs', url: 'https://woocommerce.com/documentation/', type: 'docs' }],
          content: `## 🎯 What you will learn
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
- [ ] Payment methods configured`,
        },
        {
          title: 'Users, Roles & Content Updates Workflow',
          duration: '13 min',
          videoUrl: V1,
          resources: [R.wpDocs],
          content: `## 🎯 What you will learn
- Roles and least-privilege security
- Handing a site to a client safely
- Update routines that never break sites

## 📖 Lesson
Give everyone the **least** access that works:
- Client staff who write posts → **Editor** or **Author**
- Someone managing products → WooCommerce-specific roles
- Full **Administrator** only for people who install plugins/themes

Handover checklist: create the client's account at the right role, remove your admin when done (or keep one named account for support), document passwords in a manager, never share one login.

**Update routine (weekly, 10 minutes):**
1. Backup now
2. Update plugins → theme → WordPress core, one at a time
3. Check key pages + forms after each
Updates prevent hacks (most breaches exploit outdated plugins) — maintenance is a paid service, not a chore.

## 💡 Real-world example
A site went 2 years without updates and was defaced. The cleanup cost 10× what a maintenance plan would have. Sell the routine, don't dread it.

## ✍️ Practical
1. Create an Editor user and test what they can/can't do.
2. Write a 5-step weekly update checklist.
3. Define a maintenance package you could sell.

## ✅ Checklist
- [ ] Roles understood & applied
- [ ] Update checklist written
- [ ] Maintenance offer drafted`,
        },
      ],
    },
    {
      title: 'Module 4: Launch, SEO & Client Websites',
      lessons: [
        {
          title: 'Speed, Security & Launch Checklist',
          duration: '16 min',
          videoUrl: V3,
          resources: [{ title: 'Google PageSpeed Insights', url: 'https://pagespeed.web.dev/', type: 'tool' }, R.wpDocs],
          content: `## 🎯 What you will learn
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
- [ ] Launch checklist complete`,
        },
        {
          title: 'WordPress SEO: Rank Math/Yoast in Practice',
          duration: '16 min',
          videoUrl: V2,
          resources: [{ title: 'Google SEO Starter Guide', url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide', type: 'pdf' }],
          content: `## 🎯 What you will learn
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
- [ ] Local profile created`,
        },
        {
          title: 'Client Projects: Brief to Handover',
          duration: '17 min',
          videoUrl: V3,
          resources: [R.wpLearn],
          content: `## 🎯 What you will learn
- Running WordPress client projects professionally
- Pricing website projects in Nigeria
- Contracts, deposits and handover packs

## 📖 Lesson
**Process:** Discovery call (goals, pages, content who-provides-what) → written quote + timeline → 60–70% deposit → build on a staging/dev link → 2 revision rounds → final payment → launch → handover training.

**Pricing guide (starter market):** 5-page brochure site ₦80k–₦250k; with WooCommerce ₦150k–₦400k; maintenance retainers ₦15k–₦50k/month. Price by value delivered, not hours spent.

**Contract essentials:** scope (exact page list), revision count, content responsibility, timeline, payment schedule, what's NOT included (e.g. logo design, content writing).

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
- [ ] Handover checklist drafted`,
        },
        {
          title: 'Capstone: Build & Launch a Complete Business Website',
          duration: '24 min',
          videoUrl: V3,
          resources: [R.wpLearn, R.elementor, R.wpDocs],
          content: `## 🎯 What you will learn
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
Capstone sites built for real businesses became students' first portfolio AND first paid maintenance retainers — one project, three income streams.

## ✍️ Practical
1. Build all 5 pages to the quality bar.
2. Pass the launch checklist completely.
3. Publish case study + pitch 3 businesses.

## ✅ Checklist
- [ ] 5+ pages live and fast
- [ ] Launch checklist passed
- [ ] Case study + pitches sent`,
        },
      ],
    },
  ],
};
