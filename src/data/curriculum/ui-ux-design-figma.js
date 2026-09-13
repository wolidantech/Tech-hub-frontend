// UI/UX DESIGN WITH FIGMA — full professional curriculum
const V1 = 'https://www.youtube.com/watch?v=xWSCAD7xcpw'; // Introduction to Figma course
const V2 = 'https://www.youtube.com/watch?v=ZWYyiPwCi54'; // Figma full course 2025
const V3 = 'https://www.youtube.com/watch?v=3qLX9IaGZO0'; // Figma UI design tutorial - complete guide

const R = {
  figmaLearn: { title: 'Figma Learn — official free training', url: 'https://help.figma.com/hc/en-us', type: 'course' },
  figma: { title: 'Figma — free design tool', url: 'https://www.figma.com/', type: 'tool' },
  lawsOfUx: { title: 'Laws of UX — psychology of design (free book)', url: 'https://lawsofux.com/', type: 'pdf' },
  dribbble: { title: 'Dribbble — design inspiration', url: 'https://dribbble.com/', type: 'resource' },
  behance: { title: 'Behance — global design portfolios', url: 'https://www.behance.net/', type: 'resource' },
  material: { title: 'Material Design guidelines (Google)', url: 'https://m3.material.io/', type: 'docs' },
  hcd: { title: 'IDEO — design thinking resources', url: 'https://designthinkingforinnovation.com/', type: 'course' },
};

export default {
  slug: 'ui-ux-design-figma',
  curriculum: [
    {
      title: 'Module 1: UX Thinking & Figma Foundations',
      lessons: [
        {
          title: 'UX vs UI: The Difference That Pays',
          duration: '14 min',
          videoUrl: V1,
          resources: [R.lawsOfUx, R.figmaLearn],
          content: `## 🎯 What you will learn
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
A bank app redesigned buttons with gradients (UI) but kept the transfer flow at 9 screens (UX). Complaints didn't change. The next release cut steps to 4 — satisfaction soared.

## ✍️ Practical
1. Pick an app you use daily; note one UX frustration.
2. Write the problem as one sentence.
3. Sketch 3 rough solutions on paper.

## ✅ Checklist
- [ ] UX vs UI difference clear
- [ ] 5-step process memorized
- [ ] First problem defined`,
        },
        {
          title: 'User Research: Asking Questions That Reveal Truth',
          duration: '15 min',
          videoUrl: V1,
          resources: [R.lawsOfUx, R.hcd],
          content: `## 🎯 What you will learn
- Lightweight research without a budget
- Interview questions that don't mislead
- Turning complaints into design requirements

## 📖 Lesson
You are not the user. Five people's frustrations reveal 80% of problems — no lab required.

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
- [ ] 3 requirements written`,
        },
        {
          title: 'Figma Basics: Frames, Shapes & Text',
          duration: '16 min',
          videoUrl: V1,
          resources: [R.figma, R.figmaLearn],
          content: `## 🎯 What you will learn
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
Hiring managers open a candidate's Figma file first. Neat named frames and tidy layers communicate professionalism before they ever see the visuals.

## ✍️ Practical
1. Create a Figma account; start a design file.
2. Add an iPhone frame; place 5 aligned rectangles + text inside.
3. Practice Alt-distance measurement and alignment tools.

## ✅ Checklist
- [ ] Frames (not groups) understood
- [ ] Device frame created
- [ ] Basic shortcuts working`,
        },
        {
          title: 'Auto Layout: The Skill Employers Test For',
          duration: '17 min',
          videoUrl: V2,
          resources: [R.figmaLearn],
          content: `## 🎯 What you will learn
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
A junior designer's button "broke" when the text changed from "Log in" to "Sign in with Google". Auto layout would have stretched it automatically — the interviewer noticed.

## ✍️ Practical
1. Build 3 auto-layout buttons that hug their text.
2. Build a product card (image, title, price) in auto layout.
3. Stack 3 cards in a list frame with consistent gap.

## ✅ Checklist
- [ ] Buttons grow with text
- [ ] Card uses nested auto layout
- [ ] List spacing consistent`,
        },
      ],
    },
    {
      title: 'Module 2: Design Systems & Components',
      lessons: [
        {
          title: 'Colors, Typography & Spacing Systems',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.material, { title: 'Contrast checker (WCAG)', url: 'https://webaim.org/resources/contrastchecker/', type: 'tool' }],
          content: `## 🎯 What you will learn
- Building a palette with purpose
- Type scales that create hierarchy
- The 8pt spacing grid professionals use

## 📖 Lesson
**Color system:** 1 primary (brand), 1 neutral scale (grays for text/backgrounds), semantic colors (green success, red error, amber warning). Use opacity for emphasis instead of new colors. Check contrast: text needs 4.5:1 minimum against its background.

**Type scale:** define sizes once and reuse: e.g. Display 32 / Title 24 / Heading 20 / Body 16 / Caption 12. Two font families maximum. Line height ~1.4 for body text.

**8pt grid:** all spacing, sizes and gaps in multiples of 4 or 8 (8, 16, 24, 32…). The result: everything feels consistent without thinking. Every major product (Material Design, Apple's HIG) works this way.

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
- [ ] 8pt grid applied`,
        },
        {
          title: 'Components & Variants: Build Once, Use Everywhere',
          duration: '17 min',
          videoUrl: V2,
          resources: [R.figmaLearn],
          content: `## 🎯 What you will learn
- Components: master + instances
- Variants for states (default/hover/pressed)
- Publishing and using component libraries

## 📖 Lesson
A **component** is a master element; every copy is an **instance**. Edit the master → all instances update. Buttons, inputs, nav bars, cards — all should be components.

Create: select frame → right-click "Create component" (Cmd/Ctrl+Alt+K). Instances show a hollow diamond icon; the master is filled.

**Variants** bundle states into one switchable component: a Button component with variants State = Default/Hover/Disabled, Style = Primary/Secondary. Designers toggle variants instead of duplicating messily.

Team workflow: publish components to a **library** (team feature); every file pulls from it — one source of truth, like code imports.

## 💡 Real-world example
A team changed their primary brand blue once — in the master component. 300+ screens across 12 files updated instantly. That's why products hire component-minded designers.

## ✍️ Practical
1. Convert your buttons/inputs/cards to components.
2. Add variants: primary/secondary × default/disabled.
3. Build one screen using only instances.

## ✅ Checklist
- [ ] Master + instances working
- [ ] Variants switchable
- [ ] Screen built from instances only`,
        },
        {
          title: 'Navigation Patterns & Information Architecture',
          duration: '15 min',
          videoUrl: V3,
          resources: [R.lawsOfUx, R.material],
          content: `## 🎯 What you will learn
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
- **Hick's law** — more choices = slower decisions; reduce options
- **Jakob's law** — users expect your site to work like others; innovate carefully
- **Fitts's law** — important targets big and close
- **Miller's law** — chunk info into 5–9 items

## 💡 Real-world example
An e-commerce app moved "Orders" from a buried drawer to the tab bar after card sorting showed users searched for it constantly. Support tickets about "where's my order" dropped by half.

## ✍️ Practical
1. Sketch the tab bar + stack flow for your app concept.
2. Label which UX law each decision follows.
3. Simplify: cut one unnecessary menu item.

## ✅ Checklist
- [ ] Navigation pattern chosen with reason
- [ ] 4 UX laws applied
- [ ] Menu simplified`,
        },
        {
          title: 'Wireframes First: Speed Beats Polish',
          duration: '14 min',
          videoUrl: V3,
          resources: [R.figmaLearn, R.lawsOfUx],
          content: `## 🎯 What you will learn
- Low-fi vs hi-fi: when each is right
- Wireframing fast in Figma
- Getting feedback before you fall in love

## 📖 Lesson
**Wireframes** = grayscale skeletons of screens. No colors, no images — only structure and hierarchy. Why first? Changes are cheap: moving a gray box takes seconds; re-polishing a beautiful screen takes hours.

Professional order: research → user flow → **wireframes** → feedback → visual design → prototype → test.

Figma wireframe tips: use a gray palette (3 grays max), rectangles for images, lines for text, and componentize repeated blocks. One screen should take 10–15 minutes, not 2 hours.

Share wireframes early (Figma share link, view-only) and ask: "Can you tell me what you'd do on this screen?" — confusion now saves rework later.

## 💡 Real-world example
A designer presented polished screens to a client, who asked to move the entire checkout flow. Had wireframes been reviewed first, the change would have cost minutes, not days.

## ✍️ Practical
1. Draw the user flow (screens as a map) for your app.
2. Wireframe 4 key screens in grayscale.
3. Show someone: can they explain each screen back to you?

## ✅ Checklist
- [ ] Flow mapped before screens
- [ ] 4 grayscale wireframes done
- [ ] Outsider understood them`,
        },
      ],
    },
    {
      title: 'Module 3: Designing a Mobile App UI',
      lessons: [
        {
          title: 'Designing Onboarding & Auth Screens',
          duration: '16 min',
          videoUrl: V3,
          resources: [R.material, R.figmaLearn],
          content: `## 🎯 What you will learn
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
- [ ] Empty/loading/error states exist`,
        },
        {
          title: 'Home Feeds, Lists & Cards That Scan',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.material, R.dribbble],
          content: `## 🎯 What you will learn
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
- [ ] Primary actions thumb-reachable`,
        },
        {
          title: 'Forms, Checkouts & Critical Flows',
          duration: '17 min',
          videoUrl: V3,
          resources: [R.lawsOfUx, R.material],
          content: `## 🎯 What you will learn
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
- [ ] Error path designed`,
        },
        {
          title: 'Polish: Icons, Illustrations & Dark Mode',
          duration: '15 min',
          videoUrl: V2,
          resources: [{ title: 'Lucide — free consistent icons', url: 'https://lucide.dev/', type: 'resource' }, { title: 'unDraw — free illustrations', url: 'https://undraw.co/', type: 'resource' }],
          content: `## 🎯 What you will learn
- Icon systems: consistent, not collected
- Illustration & empty-state art
- Designing dark mode properly

## 📖 Lesson
**Icons:** use ONE icon set (same stroke width and style) — mixing sets screams amateur. Lucide, Material Symbols and Feather are free and consistent. Size on an 8pt grid (16/24/32). Icon + label beats icon alone for important actions.

**Illustrations:** one style throughout (unDraw provides free customizable SVGs). Best uses: empty states, onboarding, errors — they turn dead moments into brand moments.

**Dark mode:** it's not "make everything black":
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
- [ ] Dark mode on 3 screens`,
        },
      ],
    },
    {
      title: 'Module 4: Prototype, Test & Get Hired',
      lessons: [
        {
          title: 'Interactive Prototypes in Figma',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.figmaLearn],
          content: `## 🎯 What you will learn
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
- [ ] Prototype runs on phone`,
        },
        {
          title: 'Usability Testing: Watch, Learn, Fix',
          duration: '15 min',
          videoUrl: V3,
          resources: [R.lawsOfUx],
          content: `## 🎯 What you will learn
- Running a 20-minute usability test
- What to say (and never say) while testing
- Prioritizing fixes by severity

## 📖 Lesson
Testing with 3–5 users finds most problems. Script:
1. Give a **task**, not instructions: "You want to send money to a friend. Show me how you'd do it."
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
During a test, a user tapped the logo expecting to go home — it didn't. Three users did the same. One afternoon of testing saved months of confused users.

## ✍️ Practical
1. Write 3 tasks for your prototype.
2. Test with 3 people; record hesitations.
3. Fix all critical issues and re-test once.

## ✅ Checklist
- [ ] 3 tasks written
- [ ] 3 tests conducted
- [ ] Criticals fixed & re-tested`,
        },
        {
          title: 'Handoff to Developers & Design Tokens',
          duration: '14 min',
          videoUrl: V2,
          resources: [R.figmaLearn],
          content: `## 🎯 What you will learn
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
- [ ] Dev Mode inspected`,
        },
        {
          title: 'Capstone: Case Study Portfolio & First Design Job',
          duration: '22 min',
          videoUrl: V2,
          resources: [R.behance, R.dribbble],
          content: `## 🎯 What you will learn
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
A career-switcher sent 10 applications with a 1-screen redesign of each company's product attached. 4 interviews. Effort targeted beats volume sprayed.

## ✍️ Practical
1. Write your full app case study (6 sections).
2. Publish it on Behance + share the link.
3. Apply to 5 roles/clients with tailored messages.

## ✅ Checklist
- [ ] Case study published
- [ ] Portfolio link live
- [ ] 5 applications sent`,
        },
      ],
    },
  ],
};
