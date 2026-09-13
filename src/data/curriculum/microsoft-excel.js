// MICROSOFT EXCEL — full professional curriculum
const V1 = 'https://www.youtube.com/watch?v=Vl0H-qTclOg'; // freeCodeCamp Excel full course (6 projects)
const V2 = 'https://www.youtube.com/watch?v=qY95fNIBhJE'; // Excel beginner's guide full course

const R = {
  msExcel: { title: 'Microsoft Excel official training', url: 'https://support.microsoft.com/en-us/excel', type: 'docs' },
  msLearn: { title: 'Microsoft Learn — Excel learning paths (free)', url: 'https://learn.microsoft.com/en-us/training/browse/?products=excel', type: 'course' },
  templates: { title: 'Free official Excel templates', url: 'https://templates.office.com/en-us/templates-for-excel', type: 'resource' },
};

export default {
  slug: 'microsoft-excel',
  curriculum: [
    {
      title: 'Module 1: Excel Foundations',
      lessons: [
        {
          title: 'The Excel Interface: Ribbons, Sheets & Cells',
          duration: '14 min',
          videoUrl: V1,
          resources: [R.msExcel],
          content: `## 🎯 What you will learn
- Workbook vs worksheet vs cell: the core mental model
- The ribbon and the tools you'll use daily
- Moving fast: selection, navigation, shortcuts

## 📖 Lesson
Excel stores data in **workbooks** (files) containing **worksheets** (tabs) made of **cells** (the boxes). Every cell has an address — column letter + row number: \`B4\` means column B, row 4. Ranges use a colon: \`A1:A10\` = ten cells.

The **ribbon** groups commands: Home (formatting), Insert (charts/tables), Formulas, Data (sort/filter), View. 90% of your time is Home + Data.

Speed habits from day one:
- **Ctrl + arrow keys** — jump to data edges
- **Ctrl + Shift + arrows** — select while jumping
- **Ctrl + Z / Y** — undo/redo without fear
- **Double-click a cell** to edit; **F2** also edits
- Sheet tabs at the bottom: right-click to rename, recolor, move

Treat Excel as a grid you can always find your way around: know WHERE you are (Name Box, top-left shows current cell) before doing anything.

## 💡 Real-world example
Two assistants get the same data task. One scrolls painfully with the mouse; the other uses Ctrl+arrows and finishes in a third of the time. Navigation speed is the first visible Excel skill.

## ✍️ Practical
1. Create a workbook; rename Sheet1 to "Practice".
2. Fill A1:A10 with numbers; jump around with Ctrl+arrows.
3. Select ranges with keyboard only.

## ✅ Checklist
- [ ] Cell addressing (B4, A1:A10) fluent
- [ ] Ctrl+arrow navigation mastered
- [ ] Sheets renamed & organized`,
        },
        {
          title: 'Data Entry, Formatting & Making Data Readable',
          duration: '15 min',
          videoUrl: V1,
          resources: [R.msExcel, R.templates],
          content: `## 🎯 What you will learn
- Entering and editing data correctly
- Number formats: currency, dates, percentages
- Formatting that makes reports look professional

## 📖 Lesson
**Entry rules:** dates with consistent format; one fact per cell (never "John, 25, Lagos" in one cell); numbers as numbers (don't type ₦ — use currency format so math works later).

**Formats** (Home → Number group or Ctrl+1): General, Number, Currency/Accounting, Percentage, Date, Text. Formatting changes how a value DISPLAYS, not what it is — ₦5,000 formatted stays the number 5000 for formulas.

**Professional look checklist:**
- Bold headers with fill color and borders
- Freeze top row (View → Freeze Panes) so headers stay visible while scrolling
- Adjust column widths (double-click the divider to auto-fit)
- Alignment: text left, numbers right, headers centered
- One decimal max unless precision matters

Flash Fill (Ctrl+E) is magic: type one example of a transformation (e.g. first names from full names), and Excel completes the rest.

## 💡 Real-world example
A manager's report came back "confusing" — plain text columns of numbers. The same data with frozen headers, currency formats and borders got approved the next morning.

## ✍️ Practical
1. Build a 10-row staff list (name, salary, start date, % bonus).
2. Apply currency, date and percent formats correctly.
3. Freeze the header row and style it.

## ✅ Checklist
- [ ] Formats applied by type
- [ ] Header row frozen & styled
- [ ] Flash Fill tried`,
        },
        {
          title: 'Sorting, Filtering & Data Organization',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.msExcel],
          content: `## 🎯 What you will learn
- Sorting by one and multiple levels
- Filters: finding needles in data haystacks
- Keeping data clean for everything that follows

## 📖 Lesson
**Sort:** Data → Sort. Simple: click a column, A→Z. Multi-level: "Sort by Department, then by Salary descending" — Excel supports stacked sort levels.

**Filter:** Ctrl+Shift+L (or Data → Filter) adds dropdown arrows to headers: tick/un-tick values, filter by color, number conditions ("greater than 100,000"), text contains ("lagos"). Filters hide rows — the data stays safe.

**Clean data rules (golden for every later skill):**
- No blank rows inside your data range
- One header row, unique column names
- Consistent values (not "Lagos" vs "LAGOS" vs "lagos")
- No merged cells inside data ranges

Dirty data breaks formulas and charts later; 5 minutes of cleaning now saves hours later.

## 💡 Real-world example
"Show me all Abuja customers who bought last month" — with filters: 20 seconds. Without organized data: impossible.

## ✍️ Practical
1. Apply multi-level sort (two levels) to your staff list.
2. Turn on filters; answer 3 questions using them.
3. Audit: remove any blank rows/merged cells.

## ✅ Checklist
- [ ] Multi-level sorting works
- [ ] Filters answer real questions
- [ ] Data passes clean-data rules`,
        },
        {
          title: "Tables: Excel's Most Underrated Feature",
          duration: '13 min',
          videoUrl: V1,
          resources: [R.msExcel],
          content: `## 🎯 What you will learn
- Converting ranges to Tables (Ctrl+T)
- Auto-expansion: new rows join automatically
- Structured references and total rows

## 📖 Lesson
**Tables** (select data → Ctrl+T) upgrade a plain range into a smart object:
- New rows/columns are automatically included — formulas and charts update themselves
- Filters and banded rows come free
- Freeze headers automatically while scrolling
- **Total Row** toggle (Table Design) sums/averages/count any column with one dropdown

Formulas inside tables use readable **structured references**: \`=SUM(Table1[Salary])\` instead of \`=SUM(C2:C500)\`. Add 100 rows? Still correct.

Table style stays professional by default. Name your tables meaningfully (Table Design → Table Name: "Sales").

Rule: if data grows over time (sales, inventory, students), make it a Table on day one.

## 💡 Real-world example
A shop owner's monthly sales formula covered C2:C60. Month by month he extended it manually — until he forgot once, and reported a month missing a week of sales. Tables make that mistake impossible.

## ✍️ Practical
1. Convert your staff list to a Table (Ctrl+T).
2. Add 3 rows — watch the Table absorb them.
3. Turn on the Total Row; sum one column.

## ✅ Checklist
- [ ] Ctrl+T reflex built
- [ ] New rows auto-join
- [ ] Total Row in use`,
        },
      ],
    },
    {
      title: 'Module 2: Formulas & Functions',
      lessons: [
        {
          title: 'Formula Basics & the Big 5 Functions',
          duration: '17 min',
          videoUrl: V1,
          resources: [R.msExcel, R.msLearn],
          content: `## 🎯 What you will learn
- How every formula works (=, operators, cell refs)
- SUM, AVERAGE, COUNT, MIN, MAX
- Relative vs absolute references ($ signs)

## 📖 Lesson
Every formula starts with \`=\`. Operators: + − * / and ^(power). But functions do the heavy lifting:
- \`=SUM(B2:B20)\` — total
- \`=AVERAGE(B2:B20)\` — mean
- \`=COUNT(B2:B20)\` — how many numbers
- \`=MIN(...)\` / \`=MAX(...)\` — extremes

**References — the key concept:**
- \`B2\` is **relative**: copy the formula down and it shifts (B3, B4…). Usually what you want.
- \`$B$2\` is **absolute** (press F4 to toggle): stays fixed when copied. Use it for constants like a tax rate cell.

If a formula errors: **#REF!** = broken reference (deleted cells), **#DIV/0!** = dividing by zero, **#VALUE!** = wrong data type. Read errors as clues, not failures.

## 💡 Real-world example
A payroll sheet: salary × tax rate in $D$1. Everyone typed D1 without $ — copying dragged the reference down the column, producing nonsense. One F4 keystroke per formula fixed the whole sheet.

## ✍️ Practical
1. Build a sales sheet; compute totals with the Big 5.
2. Calculate commission = sales × rate (rate in one absolute cell).
3. Copy down and verify the absolute ref stays fixed.

## ✅ Checklist
- [ ] Big 5 functions fluent
- [ ] F4 / $ references understood
- [ ] Errors read as clues`,
        },
        {
          title: 'IF, COUNTIF & SUMIF: Decisions in Cells',
          duration: '17 min',
          videoUrl: V1,
          resources: [R.msExcel],
          content: `## 🎯 What you will learn
- IF: making cells decide
- COUNTIF/SUMIF: counting & totaling by condition
- Nesting logic for real rules

## 📖 Lesson
**IF** returns one thing if true, another if false:
\`\`\`
=IF(Score>=70, "Pass", "Fail")
\`\`\`
Conditions use: =, <>, >, <, >=, <=. Text results go in quotes.

**COUNTIF / SUMIF** apply conditions across ranges:
\`\`\`
=COUNTIF(City, "Lagos")           → how many in Lagos?
=SUMIF(Region, "South", Amount)   → total for South only
\`\`\`
**Nested IF** for bands:
\`\`\`
=IF(Score>=90,"A", IF(Score>=70,"B", IF(Score>=50,"C","F")))
\`\`\`
(For many bands, newer Excel offers IFS — cleaner.)

These three turn spreadsheets from calculators into decision systems: bonuses, grading, inventory alerts ("IF stock < 10, 'REORDER'").

## 💡 Real-world example
A teacher graded 300 scripts in minutes: nested IF turned raw scores into A–F, then COUNTIF showed how many of each. What took a colleague a weekend took her one coffee.

## ✍️ Practical
1. Add Pass/Fail IF to your scores.
2. COUNTIF by category; SUMIF by region.
3. Build a 4-band grading formula.

## ✅ Checklist
- [ ] IF with text outcomes works
- [ ] COUNTIF/SUMIF with conditions
- [ ] Nested IF (or IFS) built`,
        },
        {
          title: 'VLOOKUP & XLOOKUP: Joining Data Like a Pro',
          duration: '17 min',
          videoUrl: V2,
          resources: [R.msExcel],
          content: `## 🎯 What you will learn
- Looking up values across tables
- VLOOKUP syntax and its traps
- XLOOKUP: the modern replacement

## 📖 Lesson
You have product IDs in one table and prices in another. Lookup functions pull the price across:

**VLOOKUP** (classic):
\`\`\`
=VLOOKUP(lookup_value, table_range, column_number, FALSE)
\`\`\`
FALSE = exact match (almost always what you want). Traps: looks RIGHT only; column numbers break if columns move; slow on huge sheets.

**XLOOKUP** (modern, preferred when available):
\`\`\`
=XLOOKUP(lookup_value, lookup_column, return_column, "Not found")
\`\`\`
Looks in any direction, has built-in "not found" handling, and won't break when columns shift.

**Golden rule:** the lookup column must share EXACT values (same IDs, no extra spaces — TRIM() cleans text). This one function family powers invoices, price lists, HR records, inventory matching.

## 💡 Real-world example
An accountant matched 5,000 bank transactions to invoices by reference number with one XLOOKUP column — a two-day manual job done in seconds.

## ✍️ Practical
1. Build two mini tables (IDs ↔ prices).
2. Pull prices across with VLOOKUP.
3. Redo with XLOOKUP including "Not found".

## ✅ Checklist
- [ ] VLOOKUP exact-match working
- [ ] XLOOKUP with fallback
- [ ] Clean lookup values (TRIM)`,
        },
        {
          title: 'Text & Date Functions: Cleaning Real-World Data',
          duration: '15 min',
          videoUrl: V2,
          resources: [R.msExcel],
          content: `## 🎯 What you will learn
- Text surgery: LEFT, RIGHT, MID, LEN, TRIM, CONCAT
- Date math: days between, DATEDIF, TODAY/NOW
- Fixing messy data in bulk

## 📖 Lesson
**Text functions:**
- \`=LEFT(A2,3)\` / \`=RIGHT(A2,4)\` / \`=MID(A2,5,3)\` — slice text
- \`=LEN(A2)\` — character count
- \`=TRIM(A2)\` — remove stray spaces (fixes broken lookups!)
- \`=UPPER/LOWER/PROPER\` — case control
- \`=CONCAT\` or \`&\` — join: \`=A2 & " " & B2\` builds full names

**Date functions:** dates are numbers in Excel, so math works:
- \`=End - Start\` → days between
- \`=TODAY()\`, \`=NOW()\` — live date/time
- \`=DATEDIF(start, end, "y")\` → age in years
- \`=DAY/MONTH/YEAR()\`, \`=TEXT(date,"mmm yyyy")\` for labels

The real world sends messy exports — phone numbers as text, names in one column, dates as strings. These functions are your cleaning toolkit.

## 💡 Real-world example
HR received "surname, firstname" in one column for 800 staff. MID/FIND/& split and re-ordered them into clean columns in five minutes — by hand it would take days.

## ✍️ Practical
1. Split "Lastname, Firstname" into two columns with formulas.
2. Calculate days between two dates and someone's age.
3. TRIM a dirty column and count length before/after.

## ✅ Checklist
- [ ] Text slicing & joining fluent
- [ ] Date differences computed
- [ ] Dirty data cleaned`,
        },
      ],
    },
    {
      title: 'Module 3: Analysis & Visualization',
      lessons: [
        {
          title: 'Charts That Tell the Story',
          duration: '16 min',
          videoUrl: V1,
          resources: [R.msExcel],
          content: `## 🎯 What you will learn
- Choosing the right chart for the question
- Building and formatting professional charts
- Chart discipline: less ink, more insight

## 📖 Lesson
Match chart to question:
- **Trend over time** → Line
- **Comparison between items** → Column/Bar
- **Part of a whole** → Pie (2–5 slices max, rarely more)
- **Relationship** → Scatter
- **Progress vs target** → Bar with target line

Build: select data → Insert → Recommended Charts. Then format:
- Clear title stating the insight ("Sales grew 40% in Q4", not "Sales")
- Remove gridlines/clutter; add data labels where they help
- One accent color for the important series, gray for the rest
- Legend off when labels can go directly on bars

A chart's job is to make one point obvious in 3 seconds. If it needs a paragraph of explanation, simplify.

## 💡 Real-world example
A monthly report had 12 pie charts. Replaced with one line chart of revenue + one bar chart of top products, the meeting went from 45 minutes of confusion to 15 minutes of decisions.

## ✍️ Practical
1. Build a line (trend), column (comparison) and pie (share).
2. Give each an insight-stating title.
3. Declutter: remove gridlines, add direct labels.

## ✅ Checklist
- [ ] Chart type matches question
- [ ] Titles state insights
- [ ] Clutter removed`,
        },
        {
          title: 'Conditional Formatting: Data That Highlights Itself',
          duration: '14 min',
          videoUrl: V2,
          resources: [R.msExcel],
          content: `## 🎯 What you will learn
- Highlight rules: top/bottom, above average, duplicates
- Data bars, color scales, icon sets
- Formula-based rules for custom alerts

## 📖 Lesson
Conditional formatting makes exceptions jump out — humans scan color faster than numbers.

Home → Conditional Formatting:
- **Highlight rules:** greater than, text contains, duplicate values (great for spotting double entries)
- **Top/bottom rules:** top 10%, above average
- **Data bars:** mini bar charts inside cells (perfect for amounts)
- **Color scales:** heatmaps (green→red) for scores/KPIs
- **Icon sets:** arrows for up/flat/down

**Custom formula rules** (the power move): "Format this row if column E < 10" → \`=E2<10\` applied to the whole table — instant reorder alerts on inventory.

Rule of taste: formatting should flag 5–10% of cells. If everything glows red, nothing does.

## 💡 Real-world example
An inventory sheet with a red rule on stock < 10 turned "we ran out of product X" surprises into "we re ordered X last week" — one formatting rule, real money saved.

## ✍️ Practical
1. Apply data bars to a sales column.
2. Highlight duplicates in a list of IDs.
3. Create one formula-based alert rule.

## ✅ Checklist
- [ ] Data bars + scales used
- [ ] Duplicates surfaced
- [ ] One custom alert rule live`,
        },
        {
          title: 'Pivot Tables: Summarize 10,000 Rows in 10 Seconds',
          duration: '18 min',
          videoUrl: V1,
          resources: [R.msExcel, R.msLearn],
          content: `## 🎯 What you will learn
- The drag-and-drop summary machine
- Rows, columns, values, filters areas
- Answering business questions instantly

## 📖 Lesson
A **Pivot Table** summarizes huge data without formulas. Select clean data → Insert → PivotTable.

The four zones:
- **Rows** — what to group BY (drag "Region" here → one row per region)
- **Values** — what to calculate (drag "Sales" here → sums automatically)
- **Columns** — optional second grouping (e.g. months across the top)
- **Filters** — slice the whole report (year, salesperson)

Click any value → "Show Values As" → % of Grand Total, running total, difference from last month. Change Sum to Count/Average via Value Field Settings.

Questions a pivot answers in seconds: total sales per region? best month? top 5 products? average order per salesperson? Refresh (right-click → Refresh) when data grows.

This single skill is named in more job ads than any other Excel feature.

## 💡 Real-world example
"What were our sales by state and by month?" — with formulas: an hour of SUMIFS and prayer. With a pivot: drag Region to rows, Month to columns, Sales to values. Nine seconds.

## ✍️ Practical
1. Build a 50-row sales dataset (or use yours).
2. Pivot: totals by region; then add months as columns.
3. Show one value as % of grand total.

## ✅ Checklist
- [ ] Pivot created from clean data
- [ ] Rows/columns/values understood
- [ ] % of total displayed`,
        },
        {
          title: 'Dashboard Basics: Pivots + Charts + Slicers',
          duration: '16 min',
          videoUrl: V1,
          resources: [R.msExcel, R.templates],
          content: `## 🎯 What you will learn
- Turning pivots into an interactive dashboard
- Slicers and timelines for click-to-filter
- Layout rules for one-screen reports

## 📖 Lesson
A **dashboard** = your key numbers on one screen, updated by clicks.

Build recipe:
1. One clean source Table
2. Several pivot tables (each answering one question) — hide them on a "Calc" sheet
3. Pivot **charts** from each pivot, moved to a "Dashboard" sheet
4. **Slicers** (Insert → Slicer): visual filter buttons — connect one slicer to all pivots (Report Connections) so one click filters everything
5. **Timeline** slicer for dates — drag to select month ranges

Layout: big KPI numbers on top, charts below, slicers in a left/right rail. No scrolling needed. Title + "as of" date.

Stakeholders love dashboards because they answer their own questions by clicking — you become the person who gave them superpowers.

## 💡 Real-world example
A student built a one-screen sales dashboard for her uncle's shop. He checks it on his phone every morning — and introduced her to three business friends who each paid for their own.

## ✍️ Practical
1. Create 2–3 pivots from your data.
2. Build charts + a connected slicer and timeline.
3. Arrange a clean one-screen dashboard.

## ✅ Checklist
- [ ] Slicer filters all pivots
- [ ] One-screen layout
- [ ] KPIs + charts together`,
        },
      ],
    },
    {
      title: 'Module 4: Real-World Projects & Automation',
      lessons: [
        {
          title: 'Project 1: Personal Budget & Expense Tracker',
          duration: '18 min',
          videoUrl: V2,
          resources: [R.templates, R.msExcel],
          content: `## 🎯 What you will learn
- Designing a practical tracker from scratch
- SUMIF category summaries & remaining budget
- Turning a sheet into a habit

## 📖 Lesson
Build a budget workbook with 3 sheets:
1. **Setup** — income sources + spending categories with monthly limits
2. **Log** — Table: Date | Category | Description | Amount (one row per expense)
3. **Summary** — SUMIF per category vs limit, remaining balance, % used with conditional formatting (green <70%, amber <90%, red ≥90%)

Key formulas:
\`\`\`
=SUMIF(Log[Category], "Food", Log[Amount])     → spent on food
=Limit - Spent                                   → remaining
=Spent / Limit                                   → % used
\`\`\`
Add a simple dashboard: data bars per category + one chart of top categories.

Design lesson: tools people enjoy using get used. Keep logging to 3 columns so entering an expense takes 10 seconds.

## 💡 Real-world example
Students who tracked one real month reported the same insight: seeing "Food: 45% of income" in red changes behaviour faster than any advice.

## ✍️ Practical
1. Build all 3 sheets with formulas wired.
2. Log 10 expenses; watch the summary update.
3. Add conditional formatting alerts at 90%.

## ✅ Checklist
- [ ] SUMIF summaries correct
- [ ] Alerts fire at thresholds
- [ ] Logging takes <15 seconds`,
        },
        {
          title: 'Project 2: Invoice & Sales System',
          duration: '18 min',
          videoUrl: V1,
          resources: [R.templates, R.msExcel],
          content: `## 🎯 What you will learn
- Building a professional invoice generator
- Product lookup, tax, totals automation
- Sales tracking with pivot summaries

## 📖 Lesson
Sheet 1 — **Products**: Table of ID, name, price (the source of truth).
Sheet 2 — **Invoice**: header with your branding; line items where typing a product ID pulls name + price via XLOOKUP; Qty × Price per line; subtotal, VAT (7.5%: \`=Subtotal*0.075\`), grand total. Invoice number + date cells; "Paid / Unpaid" status column.
Sheet 3 — **Sales Log**: every invoice appended (date, client, total, status) as a Table → pivot dashboard: revenue by month, unpaid invoices, top clients.

Polish: print area set to one page (Page Layout), your logo, clean borders, currency format throughout. Export as PDF when sending (File → Export → PDF).

## 💡 Real-world example
A freelance designer's invoices went from Word docs she re-typed (with math errors) to this workbook. Clients noticed immediately — "your invoices look like a real company's".

## ✍️ Practical
1. Build Products + Invoice with XLOOKUP lines.
2. Add VAT + grand total formulas.
3. Log 3 invoices; pivot the sales summary.

## ✅ Checklist
- [ ] XLOOKUP lines working
- [ ] VAT + totals automatic
- [ ] One-page PDF export clean`,
        },
        {
          title: 'Project 3: Data Cleaning & Reports Challenge',
          duration: '17 min',
          videoUrl: V2,
          resources: [R.msExcel],
          content: `## 🎯 What you will learn
- A repeatable cleaning pipeline
- Text-to-columns, Remove Duplicates, Paste Special
- Producing a polished monthly report

## 📖 Lesson
Real data arrives dirty. Your pipeline:
1. **TRIM + CLEAN** stray spaces/characters
2. **Text to Columns** (Data) splits "Surname, Firstname" or CSV blobs
3. **Remove Duplicates** on key columns (Data → Remove Duplicates)
4. **Fix types:** dates that arrived as text (Text-to-Columns trick or DATEVALUE), numbers stored as text (multiply by 1 via Paste Special)
5. **Standardize:** PROPER for names, one city spelling list via lookup

**Paste Special** is the hidden hero: paste values only (kill formulas before sharing), transpose (rows→columns), add/multiply values in place.

Finish: pivot summary + chart + conditional highlights → export PDF. Same pipeline every month = a service businesses pay for monthly.

## 💡 Real-world example
An ops manager received the same messy export every Monday. She built the pipeline once; Mondays went from 2 hours of fixing to 10 minutes of running.

## ✍️ Practical
1. Create (or download) a deliberately messy dataset.
2. Run the full 5-step pipeline.
3. Output a one-page summary report PDF.

## ✅ Checklist
- [ ] Pipeline steps all applied
- [ ] Paste Special values/transposed used
- [ ] Clean report exported`,
        },
        {
          title: 'Automation Basics: Macros, Shortcuts & Next Steps',
          duration: '16 min',
          videoUrl: V2,
          resources: [R.msLearn, R.msExcel],
          content: `## 🎯 What you will learn
- Recording your first macro safely
- The shortcut arsenal of power users
- Where to go next: Power Query, Power BI

## 📖 Lesson
**Macros** record your clicks so one button replays them: View → Macros → Record Macro → do the steps → Stop. Example: format a raw export (bold headers, freeze panes, borders, widths) in one click. Save as \`.xlsm\` (macro-enabled). Rules: never run macros from unknown sources; macros are for YOUR repetitive steps.

**Shortcut arsenal (memorize these ten):**
Ctrl+C/V/Z • Ctrl+Shift+L (filters) • Ctrl+T (table) • Ctrl+1 (format cells) • Ctrl+; (today's date) • F4 (repeat / absolute ref) • Ctrl+PgUp/PgDn (switch sheets) • Alt+= (autosum) • Ctrl+Shift+End (select to data end) • Ctrl+E (Flash Fill)

**Next level:** **Power Query** (Data → Get Data) automates cleaning pipelines; **Power BI** turns Excel skills into full dashboards. Both use what you already know — and both are paid skills in high demand.

## 💡 Real-world example
A records clerk recorded a macro for her daily report formatting. The 20-minute daily task became one keystroke — her manager gave her the whole department's reporting.

## ✍️ Practical
1. Record a formatting macro; replay it on new data.
2. Drill the 10 shortcuts for 10 minutes.
3. Open Power Query and import one file.

## ✅ Checklist
- [ ] First macro recorded & replayed
- [ ] 10 shortcuts memorized
- [ ] Power Query explored`,
        },
      ],
    },
  ],
};
