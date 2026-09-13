// FRONTEND WEB DEVELOPMENT — full professional curriculum
const V_HTML = 'https://www.youtube.com/watch?v=916GWv2Qs08'; // freeCodeCamp HTML crash course
const V_CSS = 'https://www.youtube.com/watch?v=1Rs2ND1ryYc'; // freeCodeCamp CSS zero to hero
const V_CSS2 = 'https://www.youtube.com/watch?v=2rDXik56cxo'; // CSS full course beginner→pro
const V_JS = 'https://www.youtube.com/watch?v=n8mNX2YqkUs'; // freeCodeCamp JS curriculum intro
const V_REACT = 'https://www.youtube.com/watch?v=4UZrsTqkcW4'; // freeCodeCamp full React course
const V_REACT2 = 'https://www.youtube.com/watch?v=CgkZ7MvWUAA'; // React full course free

const R = {
  mdn: { title: 'MDN Web Docs — Learn web development (global standard)', url: 'https://developer.mozilla.org/en-US/docs/Learn', type: 'docs' },
  fcc: { title: 'freeCodeCamp — free interactive certifications', url: 'https://www.freecodecamp.org/learn/', type: 'course' },
  w3html: { title: 'W3Schools HTML reference & exercises', url: 'https://www.w3schools.com/html/', type: 'docs' },
  w3css: { title: 'W3Schools CSS reference & exercises', url: 'https://www.w3schools.com/css/', type: 'docs' },
  jsinfo: { title: 'The Modern JavaScript Tutorial (javascript.info)', url: 'https://javascript.info/', type: 'docs' },
  csstricks: { title: 'CSS-Tricks — flexbox, grid & layout guides', url: 'https://css-tricks.com/', type: 'article' },
  webdev: { title: 'web.dev by Google — modern web courses', url: 'https://web.dev/learn', type: 'course' },
  gkjs: { title: 'JavaScript Notes for Professionals — free 400+ page PDF', url: 'https://goalkicker.com/JavaScriptBook/', type: 'pdf' },
  gkhtml: { title: 'HTML5 Notes for Professionals — free PDF', url: 'https://goalkicker.com/HTML5Book/', type: 'pdf' },
  gkcss: { title: 'CSS Notes for Professionals — free PDF', url: 'https://goalkicker.com/CSSBook/', type: 'pdf' },
  gkreact: { title: 'React Notes for Professionals — free PDF', url: 'https://goalkicker.com/ReactBook/', type: 'pdf' },
};

export default {
  slug: 'frontend-web-development',
  curriculum: [
    {
      title: 'Module 1: HTML — The Structure of the Web',
      lessons: [
        {
          title: 'How the Web Works & Your First HTML Page',
          duration: '16 min',
          videoUrl: V_HTML,
          resources: [R.mdn, R.w3html, R.gkhtml],
          content: `## 🎯 What you will learn
- What happens when you open a website
- HTML tags, elements and attributes
- Writing and opening your first page

## 📖 Lesson
When you visit a site: your browser asks a **server** for files → the server sends **HTML** (structure), **CSS** (style), **JavaScript** (behavior) → the browser paints the page. As a frontend developer you write those three files.

HTML = HyperText Markup Language. You describe content with **tags**:
\`\`\`html
<h1>My First Page</h1>      <!-- heading -->
<p>Hello, world!</p>        <!-- paragraph -->
<a href="https://example.com">A link</a>
<img src="photo.jpg" alt="description">
\`\`\`
An **element** = opening tag + content + closing tag. **Attributes** (like \`href\`, \`src\`, \`alt\`) add extra info inside the opening tag.

Setup: install VS Code (free), create \`index.html\`, type your code, double-click to open in a browser. This edit → refresh loop is your life now — make it fast.

## 💡 Real-world example
Every website you have ever used — banks, WhatsApp Web, Google — is ultimately HTML, CSS and JS files arriving at a browser. You're learning the exact same ingredients.

## ✍️ Practical
1. Install VS Code + Chrome.
2. Create index.html with a heading, paragraph, link and image.
3. Open it in the browser and change the text — refresh to see it update.

## ✅ Checklist
- [ ] I can explain browser ↔ server
- [ ] First page shows heading/paragraph/link/image
- [ ] Edit → refresh loop working`,
        },
        {
          title: 'Text, Links, Images & Lists',
          duration: '15 min',
          videoUrl: V_HTML,
          resources: [R.mdn, R.w3html],
          content: `## 🎯 What you will learn
- Headings h1–h6 and when to use each
- Links: absolute, relative, and anchors
- Ordered/unordered lists and image best practices

## 📖 Lesson
**Headings** create a document outline: one \`h1\` per page (the main title), \`h2\` for sections, \`h3\` inside sections. Screen readers and Google both read this outline — never choose headings for size (CSS handles size).

**Links:** \`<a href="...">\`
- Absolute: full URL \`https://site.com/page\`
- Relative: from the current folder \`about.html\`, \`images/logo.png\`
- Anchors: link to a section on the same page with \`href="#section-id"\`

**Images:** always include \`alt\` text (accessibility + SEO), and size large images down before uploading — slow pages lose visitors.

**Lists:** \`<ul>\` bullets, \`<ol>\` numbered, each item \`<li>\`. Nav menus, features, steps — lists are everywhere.

## 💡 Real-world example
A portfolio with a broken relative link (\`/images/me.jpg\` instead of \`images/me.jpg\`) shows a missing photo to every visitor. One slash, real damage.

## ✍️ Practical
1. Build a mini "about me" page: h1, 2 sections with h2, a list of hobbies.
2. Add a nav with anchor links jumping to each section.
3. Add your photo with proper alt text.

## ✅ Checklist
- [ ] One h1, logical h2/h3 outline
- [ ] Anchor navigation works
- [ ] Images have alt text`,
        },
        {
          title: 'Semantic HTML: Professional Page Structure',
          duration: '15 min',
          videoUrl: V_HTML,
          resources: [R.mdn],
          content: `## 🎯 What you will learn
- Why <div> soup fails interviews
- header, nav, main, section, article, footer
- Accessibility wins for free

## 📖 Lesson
Semantic tags describe **meaning**, not just boxes:
\`\`\`html
<header>…site/logo/nav…</header>
<nav>…links…</nav>
<main>…the ONE main content…</main>
  <section>…a theme…</section>
  <article>…self-contained content…</article>
<footer>…copyright/contact…</footer>
\`\`\`
Benefits: screen readers can jump between regions (accessibility), Google understands your content (SEO), and other developers read your code instantly.

Hiring managers spot \`<div><div><div>\` code immediately — semantics are the first sign of a trained developer. Use \`<div>\` only when no semantic tag fits.

Also learn: \`<button>\` for actions (never a clickable div), \`<form>\` for inputs, \`<figure>/<figcaption>\` for media with captions.

## 💡 Real-world example
Two candidates build the same layout. One uses all divs; one uses semantic regions. The semantic code gets the interview callback — it reads like a document outline.

## ✍️ Practical
1. Sketch a page layout on paper (header/nav/main/3 sections/footer).
2. Build it with only semantic tags.
3. Validate: right-click → Inspect and read your own outline.

## ✅ Checklist
- [ ] No unnecessary divs
- [ ] One <main> per page
- [ ] Buttons for actions, links for navigation`,
        },
        {
          title: 'Tables, Forms & HTML Project: Profile Page',
          duration: '17 min',
          videoUrl: V_HTML,
          resources: [R.mdn, R.w3html, R.gkhtml],
          content: `## 🎯 What you will learn
- Tables for real tabular data
- Forms: inputs, labels, validation attributes
- Capstone: a complete semantic profile page

## 📖 Lesson
**Tables:** \`<table>\` → \`<thead>\` (column titles) + \`<tbody>\` (rows \`<tr>\`, cells \`<td>\`, header cells \`<th>\`). Use for data only — never for layout.

**Forms** collect user input:
\`\`\`html
<form>
  <label for="email">Email</label>
  <input id="email" type="email" required>
  <textarea name="message"></textarea>
  <button type="submit">Send</button>
</form>
\`\`\`
Key attributes: \`type\` (email, number, date, password…), \`required\`, \`min/max\`, \`placeholder\`. Always pair \`<label for="id">\` with inputs — accessibility and bigger tap targets.

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
- [ ] Form fields all labeled`,
        },
      ],
    },
    {
      title: 'Module 2: CSS — Styling & Layout',
      lessons: [
        {
          title: 'CSS Basics: Selectors, Colors & the Cascade',
          duration: '16 min',
          videoUrl: V_CSS,
          resources: [R.w3css, R.gkcss, R.mdn],
          content: `## 🎯 What you will learn
- Linking CSS and writing rules
- Selectors: element, class, id, and combining
- How the cascade decides which style wins

## 📖 Lesson
CSS rules = **selector** + **declarations**:
\`\`\`css
.card {                /* selector */
  color: #0ea5e9;      /* property: value */
  background: #0f172a;
}
\`\`\`
Selectors: \`p\` (all paragraphs), \`.card\` (class — reusable, your workhorse), \`#hero\` (id — one per page), and combos like \`.card h2\` (h2 inside .card) or \`a:hover\` (state).

**The cascade** resolves conflicts by: (1) importance, (2) **specificity** (id > class > element), (3) source order (later wins). 90% of "why isn't my style applying?" is specificity or order.

Best practices: style mostly with classes; one stylesheet linked in \`<head>\`; consistent naming (lowercase, hyphens).

## 💡 Real-world example
A developer spent an hour on a "broken" style — an id rule elsewhere had higher specificity. Understanding the cascade turns hours into seconds.

## ✍️ Practical
1. Style your profile page: colors, fonts, hover effects.
2. Use only classes (no ids for styling).
3. Deliberately create and resolve one specificity conflict.

## ✅ Checklist
- [ ] CSS linked in <head>
- [ ] Classes drive styling
- [ ] I can explain cascade order`,
        },
        {
          title: 'The Box Model: How Every Element Is Sized',
          duration: '15 min',
          videoUrl: V_CSS,
          resources: [R.mdn, R.csstricks],
          content: `## 🎯 What you will learn
- Content → padding → border → margin
- box-sizing: border-box (the professional default)
- Debugging layout with DevTools

## 📖 Lesson
Every element is a box with 4 layers:
1. **Content** — the text/image itself
2. **Padding** — space INSIDE the border (background shows here)
3. **Border** — the edge line
4. **Margin** — space OUTSIDE, between elements

Default CSS sizes only the content, so \`width: 200px\` + padding makes the box *bigger* than 200px. Professionals fix this globally:
\`\`\`css
*, *::before, *::after { box-sizing: border-box; }
\`\`\`
Now width includes padding + border — layouts become predictable.

**Margin collapse:** vertical margins between stacked elements merge (the bigger one wins) — a classic surprise.

Open DevTools (F12) → Elements → select any element to see its live box-model diagram. Use this daily.

## 💡 Real-world example
A student's cards kept overflowing their grid — 20px hidden padding each. The DevTools box diagram revealed it in ten seconds.

## ✍️ Practical
1. Build 3 boxes with different padding/border/margin.
2. Add the border-box reset to your page.
3. Inspect each box in DevTools and read the diagram.

## ✅ Checklist
- [ ] I can name the 4 layers in order
- [ ] border-box reset applied
- [ ] DevTools box diagram is familiar`,
        },
        {
          title: 'Flexbox: One-Dimensional Layout Mastery',
          duration: '17 min',
          videoUrl: V_CSS,
          resources: [R.csstricks, { title: 'Flexbox Froggy — learn flexbox by game', url: 'https://flexboxfroggy.com/', type: 'tool' }],
          content: `## 🎯 What you will learn
- Flex container vs flex items
- Alignment: justify-content, align-items, gap
- Real patterns: navbar, card row, centering

## 📖 Lesson
Flexbox lays out items in **one direction** (row or column). Turn it on at the parent:
\`\`\`css
.row {
  display: flex;
  justify-content: space-between; /* main axis */
  align-items: center;            /* cross axis */
  gap: 16px;
}
\`\`\`
- \`justify-content\` = distribute along the direction (flex-start / center / space-between)
- \`align-items\` = align across it (stretch / center / flex-end)
- \`gap\` = spacing without margin hacks
- Items: \`flex: 1\` grows to fill space equally

Patterns you'll use forever: **navbar** (logo left, links right → space-between), **card row** (equal cards → flex:1), **perfect centering** (justify-content:center + align-items:center).

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
- [ ] Equal cards with flex:1`,
        },
        {
          title: 'Grid & Responsive Design (Media Queries)',
          duration: '18 min',
          videoUrl: V_CSS2,
          resources: [R.csstricks, { title: 'Grid Garden — learn grid by game', url: 'https://cssgridgarden.com/', type: 'tool' }, R.webdev],
          content: `## 🎯 What you will learn
- CSS Grid for two-dimensional layouts
- Media queries: mobile-first workflow
- Building your first responsive page

## 📖 Lesson
**Grid** handles rows AND columns at once:
\`\`\`css
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 equal columns */
  gap: 20px;
}
\`\`\`
The magic responsive line: \`grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\` — columns that adapt automatically.

**Responsive design** = one site, every screen. **Mobile-first:** write base styles for phones, then enhance upward:
\`\`\`css
.cards { display: grid; gap: 16px; }                 /* phones: 1 col */
@media (min-width: 768px) { .cards { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1100px) { .cards { grid-template-columns: repeat(3, 1fr); } }
\`\`\`
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
- [ ] Page looks right at 3 widths`,
        },
      ],
    },
    {
      title: 'Module 3: JavaScript — Making Pages Think',
      lessons: [
        {
          title: 'Variables, Types & Operators',
          duration: '16 min',
          videoUrl: V_JS,
          resources: [R.jsinfo, R.gkjs, R.fcc],
          content: `## 🎯 What you will learn
- let, const (and why var retired)
- Strings, numbers, booleans, arrays, objects
- Template literals and basic math

## 📖 Lesson
JavaScript makes pages react. Connect it with \`<script src="app.js"></script>\` before \`</body>\` (or \`defer\` in head).

**Variables** store values:
\`\`\`js
const price = 5000;      // const: never reassign
let count = 0;           // let: can change
count = count + 1;
\`\`\`
**Types:** strings ('hello'), numbers (42, 3.5), booleans (true/false), arrays (ordered lists), objects (labeled data):
\`\`\`js
const course = { title: 'Frontend', price: 5000, lessons: 16 };
console.log(course.title);        // dot access
console.log(\`₦\${course.price}\`); // template literal
\`\`\`
**Operators:** + − * / % (remainder), comparisons (===, !==, >, <) and logical (&&, ||, !). Always use \`===\` (strict) — \`==\` has surprising conversions.

Console (F12 → Console) is your laboratory: test every idea there first.

## 💡 Real-world example
A cart total that updates as quantities change = a number variable + arithmetic + display. Every interactive feature starts this small.

## ✍️ Practical
1. In the console: create const/let variables of each type.
2. Build a \`course\` object and log 3 properties.
3. Write 3 expressions with arithmetic + comparisons.

## ✅ Checklist
- [ ] const vs let is clear
- [ ] I can build arrays & objects
- [ ] Template literals working`,
        },
        {
          title: 'Functions, Conditions & Loops',
          duration: '17 min',
          videoUrl: V_JS,
          resources: [R.jsinfo, R.gkjs],
          content: `## 🎯 What you will learn
- Declaring and calling functions
- if/else decision logic
- for loops and array methods

## 📖 Lesson
**Functions** are reusable recipes:
\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
greet('Ada'); // "Hello, Ada!"
\`\`\`
Arrow syntax you'll see everywhere: \`const double = (n) => n * 2;\`

**Conditions** branch your code:
\`\`\`js
if (score >= 70) { console.log('Pass'); }
else { console.log('Try again'); }
\`\`\`
**Loops** repeat work:
\`\`\`js
const prices = [1000, 2500, 800];
let total = 0;
for (const p of prices) total += p;
\`\`\`
And the modern array methods (learn these well): \`.forEach()\`, \`.map()\` (transform each item), \`.filter()\` (keep some), \`.reduce()\` (combine into one value). They replace most manual loops in real code.

## 💡 Real-world example
"Show only courses under ₦6,000" = \`courses.filter(c => c.price < 6000)\`. One line of filter powers half the UIs you use.

## ✍️ Practical
1. Write functions: greeting, price-with-VAT, pass/fail checker.
2. Loop over an array with for..of, then with map/filter.
3. Use reduce to sum a price array.

## ✅ Checklist
- [ ] Functions return values correctly
- [ ] if/else logic working
- [ ] map + filter + reduce each used`,
        },
        {
          title: 'The DOM: Reading & Changing the Page',
          duration: '18 min',
          videoUrl: V_JS,
          resources: [R.jsinfo, R.mdn],
          content: `## 🎯 What you will learn
- Selecting elements (querySelector)
- Changing text, styles, classes
- Creating and inserting elements

## 📖 Lesson
The **DOM** is the browser's live model of your HTML — JavaScript can read and rewrite it.

\`\`\`js
const title = document.querySelector('h1');      // first match
const cards = document.querySelectorAll('.card'); // all matches
title.textContent = 'New title';
title.classList.add('highlight');                // toggle CSS classes
title.style.color = '#0ea5e9';                   // direct style (prefer classes)
\`\`\`
Create content:
\`\`\`js
const li = document.createElement('li');
li.textContent = 'New item';
document.querySelector('ul').append(li);
\`\`\`
Prefer adding/removing **classes** over inline styles — keep design in CSS, behavior in JS.

This is how every dynamic UI works: data changes → JS updates DOM → user sees it.

## 💡 Real-world example
A "show more" button revealing hidden testimonials: a click listener toggling one class on a container. Small DOM skills, visible magic.

## ✍️ Practical
1. Change a heading's text and class from JS.
2. Build a list of 3 items dynamically with createElement.
3. Toggle a dark-mode class on the body from the console.

## ✅ Checklist
- [ ] querySelector(All) fluent
- [ ] classList toggling works
- [ ] Dynamic elements render`,
        },
        {
          title: 'Events & Mini Project: Interactive To-Do List',
          duration: '19 min',
          videoUrl: V_JS,
          resources: [R.jsinfo, R.fcc],
          content: `## 🎯 What you will learn
- addEventListener and the event object
- Reading form input live
- Capstone: a working to-do list

## 📖 Lesson
Events connect user actions to your code:
\`\`\`js
button.addEventListener('click', (event) => {
  console.log('clicked!', event.target);
});
input.addEventListener('input', () => {
  console.log(input.value); // live typing
});
\`\`\`
Common events: click, input, submit (call \`event.preventDefault()\` to stop page reload), mouseover, keydown.

**Project — To-Do list:**
1. HTML: input + "Add" button + empty \`<ul>\`
2. On click: read input.value, skip if empty
3. Create \`<li>\` with the text + a ✕ delete button
4. Append to the list; clear the input
5. Click ✕ → remove that \`<li>\`

Bonus: save with \`localStorage\` so todos survive refresh.

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
- [ ] Code understood line by line`,
        },
      ],
    },
    {
      title: 'Module 4: React & Going Professional',
      lessons: [
        {
          title: 'Why React & Your First Component',
          duration: '16 min',
          videoUrl: V_REACT,
          resources: [R.gkreact, { title: 'React official docs (react.dev)', url: 'https://react.dev/', type: 'docs' }],
          content: `## 🎯 What you will learn
- What problem React solves
- Components: UI as reusable functions
- JSX and rendering to the page

## 📖 Lesson
As apps grow, updating the DOM manually becomes chaos. **React** flips the model: you describe what the UI *should* look like for any state, and React updates the DOM for you.

A **component** is a function returning JSX (HTML-like syntax inside JS):
\`\`\`jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
\`\`\`
Components compose like LEGO: \`<Header /> <CourseList /> <Footer />\`. Start a project with Vite: \`npm create vite@latest my-app -- --template react\`, then \`npm install && npm run dev\`.

Mental shift: UI = f(state). Change the state → React re-renders. You stop micromanaging elements and start describing outcomes.

## 💡 Real-world example
This very learning platform, plus Netflix, Instagram web, and most modern dashboards are React. It's the most job-demanded frontend library on earth.

## ✍️ Practical
1. Create a Vite React app and run the dev server.
2. Write a Welcome component with a name prop.
3. Render it 3× with different names.

## ✅ Checklist
- [ ] Vite app running
- [ ] Component with props works
- [ ] I can say "UI = f(state)"`,
        },
        {
          title: 'Props, State & Handling Events in React',
          duration: '18 min',
          videoUrl: V_REACT,
          resources: [{ title: 'React docs — thinking in React', url: 'https://react.dev/learn/thinking-in-react', type: 'docs' }, R.gkreact],
          content: `## 🎯 What you will learn
- Props: passing data down
- useState: the state hook
- Controlled inputs & click handlers

## 📖 Lesson
**Props** flow data parent → child, read-only:
\`\`\`jsx
<CourseCard title="Frontend" price={5000} />
\`\`\`
**State** is data the component owns and can change — via the \`useState\` hook:
\`\`\`jsx
const [count, setCount] = useState(0);
// later:
<button onClick={() => setCount(count + 1)}>+1</button>
\`\`\`
When state changes, React re-renders automatically. Never mutate state directly; always use the setter.

**Controlled inputs:** the input's value lives in state:
\`\`\`jsx
const [name, setName] = useState('');
<input value={name} onChange={(e) => setName(e.target.value)} />
\`\`\`
This pattern (state + event handlers + re-render) powers every React form, cart and filter.

## 💡 Real-world example
A filter box on a course list: input state → filtered array → list re-renders on every keystroke. No DOM queries anywhere.

## ✍️ Practical
1. Build a counter with + / − / reset buttons.
2. Build a controlled input that live-greets the typed name.
3. Explain out loud why you never write \`count = count + 1\`.

## ✅ Checklist
- [ ] useState pattern fluent
- [ ] Controlled input working
- [ ] Props vs state difference clear`,
        },
        {
          title: 'Lists, Fetching Data & Showing Real Content',
          duration: '18 min',
          videoUrl: V_REACT2,
          resources: [{ title: 'React docs — data fetching', url: 'https://react.dev/learn', type: 'docs' }, R.gkreact],
          content: `## 🎯 What you will learn
- Rendering lists with .map() and keys
- useEffect + fetch for real data
- Loading & error states (the pro touch)

## 📖 Lesson
**Lists:** map an array to components — every item needs a stable \`key\`:
\`\`\`jsx
{courses.map((c) => <CourseCard key={c.id} title={c.title} />)}
\`\`\`
**Fetching:** \`useEffect\` runs side effects (like API calls):
\`\`\`jsx
const [courses, setCourses] = useState([]);
useEffect(() => {
  fetch('https://api.example.com/courses')
    .then((res) => res.json())
    .then(setCourses)
    .catch(console.error);
}, []);
\`\`\`
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
- [ ] Cards display real data`,
        },
        {
          title: 'Capstone: Deploy a Portfolio Site & Get Hired',
          duration: '22 min',
          videoUrl: V_REACT2,
          resources: [{ title: 'Netlify — free frontend hosting', url: 'https://www.netlify.com/', type: 'tool' }, { title: 'GitHub — host your code', url: 'https://github.com/', type: 'tool' }, R.fcc],
          content: `## 🎯 What you will learn
- Building your developer portfolio site
- Git/GitHub basics + free deployment
- The first-jobs roadmap

## 📖 Lesson
**Portfolio site checklist:** hero (name + what you do + CTA), projects (3 best, each with screenshot + link + 2-line story), about + skills, contact. Build it in React or plain HTML/CSS — polish beats framework.

**Git basics:** \`git init\`, \`git add .\`, \`git commit -m "message"\`, push to a GitHub repository. Every project on GitHub = public proof of skill.

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
- [ ] Certification roadmap started`,
        },
      ],
    },
  ],
};
