// MICROSOFT WORD — full professional curriculum
const V1 = 'https://www.youtube.com/watch?v=C4sYQffoxAU'; // Word full course beginners
const V2 = 'https://www.youtube.com/watch?v=965N2_vtBUc'; // Word advanced

const R = {
  msWord: { title: 'Microsoft Word official training', url: 'https://support.microsoft.com/en-us/word', type: 'docs' },
  msLearn: { title: 'Microsoft Learn — Word learning paths (free)', url: 'https://learn.microsoft.com/en-us/training/browse/?products=word', type: 'course' },
  templates: { title: 'Free official Word templates (CVs, letters, reports)', url: 'https://templates.office.com/en-us/templates-for-word', type: 'resource' },
};

export default {
  slug: 'microsoft-word',
  curriculum: [
    {
      title: 'Module 1: Word Fundamentals',
      lessons: [
        {
          title: 'Interface, Documents & Typing Like a Pro',
          duration: '14 min',
          videoUrl: V1,
          resources: [R.msWord],
          content: `## 🎯 What you will learn
- The Word window: ribbon, ruler, views
- Creating, saving (docx vs PDF) and autosave
- Selection & editing shortcuts that save hours

## 📖 Lesson
Word's window: the **ribbon** (Home/Insert/Layout/References), the **ruler** (margins & indents), and views at bottom-right (**Print Layout** is your daily view).

Save discipline: Ctrl+S early and often; OneDrive autosave protects against crashes. Know your formats: **.docx** for working/editing, **PDF** for final delivery (File → Export → PDF) so nobody can change it and it looks identical everywhere.

**Selection skills (the #1 speed lever):**
- Double-click = select word; triple-click = select paragraph
- Ctrl+A = everything; Ctrl+Shift+arrows = precise selection
- Ctrl+X cut / Ctrl+C copy / Ctrl+V paste / **Ctrl+Shift+V paste without formatting** (kills messy web text)
- Ctrl+Z undo — experiment fearlessly

Formatting basics: bold/italic/underline, font size 11–12 for body, 1.15–1.5 line spacing for readability. Never press Enter repeatedly to create space — you'll learn the proper way (paragraph spacing) in Module 2.

## 💡 Real-world example
A job applicant pasted web content into her cover letter — it arrived with 5 different fonts. The recruiter noticed before the words. Paste clean, format intentionally.

## ✍️ Practical
1. Create a document; type 3 paragraphs.
2. Practice word/paragraph selection until automatic.
3. Save as .docx, then export a PDF copy.

## ✅ Checklist
- [ ] docx vs PDF understood
- [ ] Selection shortcuts automatic
- [ ] Paste-clean habit formed`,
        },
        {
          title: 'Paragraph Formatting & Spacing Done Right',
          duration: '15 min',
          videoUrl: V1,
          resources: [R.msWord],
          content: `## 🎯 What you will learn
- Alignment, line spacing & paragraph spacing
- Indents vs tabs; bullets vs numbering
- Show/hide ¶ to see what's really there

## 📖 Lesson
Professional spacing comes from **paragraph settings**, not Enter keys:
- **Space Before/After** (Layout tab or Home → Line Spacing) separates paragraphs — set 6–12pt after paragraphs
- **Line spacing** 1.15–1.5 for reading comfort
- **Alignment:** justify looks formal but creates "rivers" of space; left-aligned is safer and more readable

**Lists:** bullets for unordered items, numbering (Home → Numbering) for steps. Never type "1." manually — real numbering restarts/continues correctly and indents uniformly.

**Indents:** use the ruler or Layout indents; use Tab once at line starts, never spaces.

**The ¶ button** (Home) reveals hidden marks: ¶ = paragraph break (you pressed Enter), • = space, → = tab. Turn it on whenever formatting behaves strangely — you'll SEE the cause instantly.

## 💡 Real-world example
A report "kept breaking" across pages — ¶ revealed 14 empty paragraph marks the author used as spacing. Deleted and replaced with proper spacing: same look, no broken pages.

## ✍️ Practical
1. Format a page with proper paragraph spacing (no Enter-stacking).
2. Create one bulleted and one numbered list.
3. Turn on ¶ and inspect your document's hidden marks.

## ✅ Checklist
- [ ] Spacing via settings, not Enter
- [ ] Both list types correct
- [ ] ¶ diagnostic habit built`,
        },
        {
          title: 'Styles: The Single Most Important Word Skill',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.msWord, R.msLearn],
          content: `## 🎯 What you will learn
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
A student's 60-page project needed every heading changed from blue to black at 11pm before submission. Hand-formatted, that's an all-nighter; with styles, one Modify click — done in 30 seconds.

## ✍️ Practical
1. Apply Heading 1/2/3 + Normal to a document.
2. Modify Heading 1 and watch everything update.
3. Insert an automatic Table of Contents.

## ✅ Checklist
- [ ] All titles use real Styles
- [ ] One-click retheme works
- [ ] Auto TOC inserted`,
        },
        {
          title: 'Tables, Images & Smart Layouts',
          duration: '16 min',
          videoUrl: V1,
          resources: [R.msWord],
          content: `## 🎯 What you will learn
- Building and styling tables properly
- Inserting images with correct text wrapping
- Columns, borders and page breaks

## 📖 Lesson
**Tables** (Insert → Table):
- Choose rows × columns; drag borders to resize; use Table Design styles for instant professional look
- Add/remove rows and columns via right-click
- Repeat header row on every page (Layout → Repeat Header Rows) for long tables
- Tables are for DATA; if you're using a table just to position text, use columns or alignment instead

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
- [ ] Page breaks (not Enters) used`,
        },
      ],
    },
    {
      title: 'Module 2: Professional Documents',
      lessons: [
        {
          title: 'Letters, Memos & Business Correspondence',
          duration: '15 min',
          videoUrl: V1,
          resources: [R.templates, R.msWord],
          content: `## 🎯 What you will learn
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
- [ ] PDF exported`,
        },
        {
          title: 'Reports & Long Documents: TOC, Captions, References',
          duration: '17 min',
          videoUrl: V2,
          resources: [R.msWord, R.msLearn],
          content: `## 🎯 What you will learn
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
- [ ] Footnote/citation added`,
        },
        {
          title: 'Headers, Footers, Page Numbers & Cover Pages',
          duration: '14 min',
          videoUrl: V1,
          resources: [R.templates],
          content: `## 🎯 What you will learn
- Different first page & odd/even pages
- Page numbering from page N
- Cover pages that set the tone

## 📖 Lesson
Double-click the top/bottom margin to edit headers/footers. Key options (Header & Footer tab):
- **Different First Page** — cover stays clean; numbering starts on page 2
- **Page Number → Format** — choose "Start at 0" so the second physical page shows "1" (classic for documents with covers)
- Odd/Even different — for printed, bound documents

**Cover pages** (Insert → Cover Page): built-in designs, or build your own: institution/logo top, big title centered, author + date at bottom. One page, high impact — it's the first thing an examiner or client sees.

Combine with section breaks for full control: cover (no number) → TOC (roman i, ii) → body (arabic 1, 2) is the standard academic/corporate pattern.

## 💡 Real-world example
A consultant delivered a proposal with cover + TOC where body pages still showed "page 3 of 47". The client's admin returned it: "pages should start at the introduction." The fix is exactly the start-at/section technique above.

## ✍️ Practical
1. Build a cover page + different first page setting.
2. Number the body starting at 1 after cover+TOC.
3. Use roman numerals for the TOC pages.

## ✅ Checklist
- [ ] Cover page clean (no number)
- [ ] Body starts at page 1
- [ ] TOC uses roman numerals`,
        },
        {
          title: 'Review Tools: Track Changes, Comments & Compare',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.msWord],
          content: `## 🎯 What you will learn
- Track Changes workflow for teams
- Comments vs edits (when to use each)
- Accepting/rejecting and comparing documents

## 📖 Lesson
**Track Changes** (Review tab) records every insertion, deletion and format change — the professional way to review:
- Reviewer edits with tracking ON; changes appear colored per author
- Owner: Accept/Reject each change (or Accept All) via Review → Changes
- **Comments** (Ctrl+Alt+M) for questions/feedback that shouldn't alter text — always resolve/delete before final delivery

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
- [ ] Inspector run before "final"`,
        },
      ],
    },
    {
      title: 'Module 3: Mail Merge & Productivity',
      lessons: [
        {
          title: 'Mail Merge: 500 Personalized Letters in 10 Minutes',
          duration: '18 min',
          videoUrl: V2,
          resources: [R.msWord, R.msLearn],
          content: `## 🎯 What you will learn
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
- [ ] Merge finished cleanly`,
        },
        {
          title: 'Templates: Build Once, Reuse Forever',
          duration: '14 min',
          videoUrl: V2,
          resources: [R.templates, R.msWord],
          content: `## 🎯 What you will learn
- Creating .dotx templates for repeated documents
- Protecting structure while allowing edits
- Team-wide document standards

## 📖 Lesson
If you produce the same document type repeatedly (invoices, letters, reports, forms), make it a **template**: design once → File → Save As → Word Template (.dotx). Opening a template creates a fresh copy — the original can never be overwritten by accident.

Template best practices:
- Bake in: styles, logo/header, margins, boilerplate text, placeholders like [CLIENT NAME]
- **Restrict Editing** (Review → Restrict Editing): allow only form filling or specific regions — users can't break the layout
- Use **content controls** (Developer tab: text boxes, date pickers, dropdowns) for fill-in fields

Businesses pay for this: a set of branded templates (letter, memo, report, quote) is a sellable deliverable, and consistency across a company's documents reads as professionalism.

## 💡 Real-world example
An HR team's offer letters had 4 slightly different formats. One consultant delivered a restricted .dotx with dropdowns for role/level — every offer since looks identical, and mistakes dropped to zero.

## ✍️ Practical
1. Convert your letter/report into a .dotx template.
2. Add Restrict Editing with form-fill exceptions.
3. Open the template twice — verify originals stay intact.

## ✅ Checklist
- [ ] .dotx saves fresh copies
- [ ] Editing restricted sensibly
- [ ] Placeholders clearly marked`,
        },
        {
          title: 'Forms & Fillable Documents',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.msWord, R.msLearn],
          content: `## 🎯 What you will learn
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
- [ ] Filled copy received cleanly`,
        },
        {
          title: 'Speed Word: Shortcuts, Find/Replace & Macros',
          duration: '14 min',
          videoUrl: V2,
          resources: [R.msWord],
          content: `## 🎯 What you will learn
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
An editor received a 200-page manuscript double-spaced with Enter keys. Find ^p^p → ^p, one Replace All, 20 seconds — then styles cleaned the rest. Client saw "magic"; you'll know it's Find & Replace.

## ✍️ Practical
1. Memorize + drill the Alt+Ctrl+1/2/3 heading shortcuts.
2. Use Replace All to fix a repeated mistake document-wide.
3. Save one Quick Part and insert it twice.

## ✅ Checklist
- [ ] Heading shortcuts automatic
- [ ] Replace with formats used
- [ ] One Quick Part in service`,
        },
      ],
    },
    {
      title: 'Module 4: Real Projects & Getting Paid',
      lessons: [
        {
          title: 'Project 1: Professional CV & Cover Letter',
          duration: '18 min',
          videoUrl: V1,
          resources: [R.templates, R.msWord],
          content: `## 🎯 What you will learn
- CV structure recruiters actually read
- One-page clean design in Word (tables, styles)
- Tailoring + PDF delivery

## 📖 Lesson
Recruiters scan a CV in ~7 seconds. Structure (one page unless 10+ years):
1. **Name + contacts** (phone, email, LinkedIn/city) — no photo unless requested
2. **Professional summary** — 2 lines matching THIS job's keywords
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
- [ ] PDFs named correctly`,
        },
        {
          title: 'Project 2: Branded Report (Case Study Document)',
          duration: '18 min',
          videoUrl: V2,
          resources: [R.msWord, R.templates],
          content: `## 🎯 What you will learn
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
A student showed this exact report project to a small business owner during a pitch. The owner's response: "If you can make documents look like this, you can handle our paperwork." Hired on the spot.

## ✍️ Practical
1. Produce the full report end-to-end.
2. Self-audit against the quality bar list.
3. Export final PDF; keep the .docx as your template.

## ✅ Checklist
- [ ] Cover, TOC, captions automatic
- [ ] Table + figure styled
- [ ] Zero spelling errors`,
        },
        {
          title: 'Project 3: Mail Merge Campaign (Certificates/Letters)',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.msWord, R.msLearn],
          content: `## 🎯 What you will learn
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
- [ ] Final batch clean`,
        },
        {
          title: 'Getting Hired: Word Skills That Pay',
          duration: '15 min',
          videoUrl: V1,
          resources: [R.msLearn, R.templates],
          content: `## 🎯 What you will learn
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
A student's first paid job came from formatting a final-year project for a friend — ₦3,000. Word spread (literally); she now earns monthly from thesis formatting alone during exam season.

## ✍️ Practical
1. Compile your 3 projects into a PDF portfolio folder.
2. Format one real document for someone free (for a testimonial).
3. Post your first service offer in a local business group.

## ✅ Checklist
- [ ] Portfolio of 3 projects ready
- [ ] One testimonial earned
- [ ] First offer posted`,
        },
      ],
    },
  ],
};
