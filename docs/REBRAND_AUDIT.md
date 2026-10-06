# Brand audit — DANQEL DIGITAL INSTITUTE rebrand

Date: 2026-10-06 · Branch: `arena/01a10cb6-tech-hub-frontend` · Baseline: `16b602e`

Method: case-insensitive `git grep` over every tracked file for
`woli[ _-]?dan`, `wolidan`, `WOLI DAN`, `WoliDan`, plus `dantech` (the assistant
name) and a review of binary assets in `public/`. **175 occurrences in 57 files.**
Nothing was replaced blindly; each group below was classified first.

## Brand identity being applied

| Context | Value |
|---|---|
| Full institutional name (formal: certificates, ID card, footer, legal, metadata) | `DANQEL DIGITAL INSTITUTE` |
| Short brand (nav, mobile, compact UI, `short_name`) | `DANQEL` |
| AI assistant | `DANQEL AI` |

Forbidden anywhere user-facing: `WOLI DAN TECH HUB`, `Woli Dan Tech Hub`,
`WOLIDAN TECH HUB`, `WoliDan`, `WOLI DAN`, `DANQEL ACADEMY`, `DANQEL SCHOOL`,
`DANQEL DIGITAL SCHOOL` and any other variation.

---

## 1. User-facing branding — CHANGED

### Metadata, manifest and shell
| File | What was there | Now |
|---|---|---|
| `index.html` | `<title>`, `meta description`, `keywords`, `author`, `apple-mobile-web-app-title`, `og:site_name`, `og:title`, `twitter:title` all said `WOLI DAN TECH HUB` | `DANQEL DIGITAL INSTITUTE`; compact `DANQEL` for the Apple home-screen title; added `og:locale`, `twitter:site`-free card copy and `application/ld+json` (`EducationalOrganization`, `alternateName: DANQEL`) |
| `public/manifest.webmanifest` | `name`/`short_name` = old brand | `name: "DANQEL DIGITAL INSTITUTE — Learn • Build • Grow"`, `short_name: "DANQEL"` |
| `public/favicon.svg`, `public/logo.svg` | Old "W" mark + `WOLI DAN / TECH HUB` wordmark in the SVG `<title>` and `<text>` | Typographic **DANQEL** monogram/lockup (placeholder — see §4) |
| `public/favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Rasterised old mark | Regenerated from the same monogram by `scripts/make-brand-icons.mjs` |
| `public/sw.js` | Header comment | New brand |
| `public/sitemap.xml`, `public/robots.txt`, `public/_redirects` | No brand strings (paths only) | No change needed — verified |

### Components and pages
`src/components/layout/Navbar.jsx` (logo `alt`), `Footer.jsx` (wordmark, mail
`aria-label`, copyright line), `src/components/common/SetupGate.jsx`,
`src/components/student/StudentIdCard.jsx` (institution strip on the printed card),
`src/pages/Home.jsx` (hero, about, career-hub, community), `About.jsx`,
`Contact.jsx`, `Register.jsx`, `AdminLogin.jsx`, `Enroll.jsx` (pending-payment
copy), `Learn.jsx` (certificate-ready notice), `CareerHub.jsx`,
`StudentPortfolio.jsx`, `Certificates.jsx`, `CertificateView.jsx` (seal text,
director line, share text/title), `VerifyCertificate.jsx` (issuer + revoked copy),
`src/pages/admin/{CourseManager,AIStudio,StudentControl,PaymentsManager}.jsx`
(default instructor, notification body, receipt note).

### Library strings that reach the screen
| File | Change |
|---|---|
| `src/lib/store.js` | `DEFAULT_SITE_SETTINGS.siteName`, `.metaDescription` |
| `src/lib/mfa.js` | TOTP issuer label passed to `auth.mfa.enroll()` → shown inside Google Authenticator |
| `src/lib/certImage.js` | Certificate seal text and downloaded file name |
| `src/lib/backendHealth.js` | Share/report title |
| `src/lib/ai.js`, `src/lib/dantech.js`, `src/components/dantech/DanTechAI.jsx`, `src/pages/AIPage.jsx`, `src/pages/{Home,Learn,CVBuilder}.jsx`, `src/pages/admin/SiteSettingsPanel.jsx`, `src/index.css` | Assistant copy → **DANQEL AI** |
| `src/lib/api.js` | Header comment |
| `server/ai-gateway.example.mjs` | System prompts ("You are DANQEL AI …") |
| `scripts/mock-tech-hub-api.mjs` | Mock instructor name |

### Content, docs and seed data
`README.md`, `server/README.md`, `supabase/README.md`,
`supabase/seed/{seed_12_courses,setup_full_catalog,seed_curriculum,
seed_learning_paths,publish_courses,make_admin}.sql`,
`supabase/seed/{HOST_PROMPTS,README_RUNBOOK}.md`,
`supabase/seed/generate_{setup,curriculum}.mjs` — brand mentions in comments,
prompt text and seeded `instructor` values.

### Legacy data files (not rendered)
`src/data/courses.js` and `src/data/catalog.js` are no longer imported for
courses — the catalogue is API-driven (`src/lib/catalogApi.js`); only
`CATEGORY_RECOMMENDATIONS` from `catalog.js` is still used. Their
`instructor: 'Woli Dan'` values were updated anyway so no stale brand survives in
the repository, and `src/tests/certificate.test.jsx` (which asserted the old
string) was updated with it.

## 2. Integration details — PRESERVED (deliberately not renamed)

| Item | Where | Why it stays |
|---|---|---|
| Bank account name `LUNA ENTRY SERVICES- WOLI DAN TECH HUB` | `src/lib/store.js` `DEFAULT_SITE_SETTINGS.accountName`, `src/pages/Enroll.jsx`, `src/pages/admin/PaymentsManager.jsx` | This must match the name **registered with the bank**. Changing the string in the UI while the account is unchanged would make transfers fail reconciliation. Both call sites now carry a comment saying so, and the value is exported from `src/lib/brand.js` as `BANK_ACCOUNT_NAME` so it is one obvious place to change *after* the bank is updated. |
| Mailboxes `info@wolidantech.com`, `wolidantech@gmail.com`, `owner@wolidantech.com` | `Footer.jsx`, `Contact.jsx`, `store.js`, `supabase/verify/verify-seed.mjs` | Live addresses. Renaming them in the UI would send mail to a dead box. Only the surrounding *label* text was rebranded (`aria-label="Email DANQEL DIGITAL INSTITUTE"`). |
| GitHub org path `wolidantech/Tech-hub-backend` | `README.md` | A factual repository reference, not brand copy. |
| `/api/dantech` gateway path, `VITE_DANTECH_ENDPOINT`, `src/lib/dantech.js`, `src/components/dantech/DanTechAI.jsx` | `vite.config.js` proxy, `src/lib/*` | The proxy prefix and module names are a contract with the backend AI gateway. Renaming them would break the integration for zero user-visible gain. Only the **displayed** assistant name became `DANQEL AI`. |
| npm package name `woli-dan-tech-hub` | `package.json`, `package-lock.json` | Internal identifier, never rendered. Renaming would churn the lockfile and any deploy tooling that keys on it. |
| Student-ID prefix `WDTH-` | `supabase/migrations/011_…sql`, `supabase/verify/run.mjs` | Already-issued identity documents carry this prefix; the number is allocated by the DB and verified against it. Changing it would orphan real cards and break 53 DB assertions. The card shows `DANQEL DIGITAL INSTITUTE` above an unchanged number. |
| `localStorage` keys `wdth.jamb.active`, `wdth.jamb.history` | `src/lib/jambEngine.js` | Renaming would silently discard every student's in-progress paper and saved results on the next deploy. |
| Applied migrations `001`–`011` | `supabase/migrations/` | Immutable history — a rebrand never rewrites an applied migration. |

## 3. Historical data / compatibility strategy

| Concern | Strategy |
|---|---|
| `site_settings` row in a live database still holds the old `siteName` / `metaDescription` | The row overrides `DEFAULT_SITE_SETTINGS`, so the owner must update it (Admin → Site settings) or run a one-row update. Flagged, not silently rewritten — this is data, not code. |
| Certificates already downloaded as `WOLI-DAN-TECH-HUB-certificate-*.png` | Old files keep their names; new downloads are `DANQEL-certificate-*.png`. Certificate *validity* is keyed on the certificate id, not the file name, so verification is unaffected. |
| TOTP factors already enrolled with issuer `Woli Dan Tech Hub` | The issuer is a label fixed at enrollment; existing entries in a student's authenticator app keep it. Verification uses the secret, so nothing breaks; new enrollments show `DANQEL DIGITAL INSTITUTE`. |
| Course rows in a live DB with `instructor = 'Woli Dan'` | Displayed verbatim from the API. Seeds now use the new faculty label; existing rows are a data update for the owner, listed as a follow-up. |
| Director signature "Olowoake Daniel Ayomide" | A real person's name on a legal document — preserved everywhere; only the institution after it changed. |

## 4. Logo placeholder — honest and accessible

No final DANQEL artwork was supplied, so the mark is a **typographic placeholder**:
a "D" monogram tile plus the wordmark `DANQEL` / `DIGITAL INSTITUTE`, generated by
`scripts/make-brand-icons.mjs` (dependency-free PNG encoder) and hand-written SVG
for `favicon.svg` / `logo.svg`. It is described as a placeholder in this file, in
the README and in code comments, is `role="img"` with a real accessible name, and
is never presented as the final logo. Swapping in final artwork means replacing
`public/logo.svg`, `public/favicon.svg` and re-running the icon script.

## 5. Responsive typography

`DANQEL DIGITAL INSTITUTE` is 24 characters, so it is never set as one long
line in a constrained container:

- Nav/mobile: compact `DANQEL` wordmark; the full name is exposed to assistive
  tech (`aria-label` + visually-hidden text) and appears from `sm:` up as a
  stacked subtitle.
- Institutional surfaces (footer, login/register heroes, ID card, certificates,
  about/contact headings) use the full name with `clamp()`-style responsive
  sizes, `leading-tight`, `tracking` tuned per breakpoint, `min-w-0` and
  `break-words` so it wraps instead of overflowing or overlapping controls.

## 6. Not touched by this task

The JAMB exam seam (`src/lib/jambApi.js`, `jambEngine.js`, `useJambAccess.js`,
`src/pages/jamb/*`) and the student-ID flow keep their logic, contract paths
(`/jamb/subjects`, `/jamb/attempts`, `/jamb/attempts/:attemptId/answers`,
`/jamb/attempts/:attemptId/submit`), typed errors, server timer, paid-access UX,
server history and device-local fallback. A regression test in
`src/tests/brand.test.jsx` asserts the required `VITE_EXAM_API_*` paths and the
typed error names survive the rebrand.
