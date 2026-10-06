/**
 * Brand identity for DANQEL DIGITAL INSTITUTE.
 *
 * One source of truth so no component hard-codes the name and a future rename is
 * a one-line change. Use the FULL name in formal/institutional contexts
 * (certificates, the student ID card, the footer, legal lines, page metadata)
 * and the SHORT brand where space is tight (navigation, mobile, buttons).
 * The AI assistant is always DANQEL AI.
 *
 * PLACEHOLDER ARTWORK: `public/logo.svg`, `public/favicon.svg` and the generated
 * PNG icons are a typographic placeholder, not the final logo. See
 * `docs/REBRAND_AUDIT.md` §4.
 */

/** Formal institutional name — certificates, ID card, footer, metadata. */
export const INSTITUTE_NAME = 'DANQEL DIGITAL INSTITUTE';

/** Compact brand — navigation, mobile header, manifest `short_name`. */
export const BRAND_SHORT = 'DANQEL';

/** The AI tutor/assistant, everywhere it is named. */
export const AI_ASSISTANT_NAME = 'DANQEL AI';

export const BRAND_TAGLINE = 'Learn • Build • Grow';

/** Instructor credit used when a course record has no instructor of its own. */
export const FACULTY_LABEL = 'DANQEL Faculty';

/** `<title>` / og:title for the marketing shell. */
export const BRAND_TITLE = `${INSTITUTE_NAME} | ${BRAND_TAGLINE} — Digital Skills Training`;

/** Meta description used by the shell and as the site-settings default. */
export const BRAND_DESCRIPTION =
  `${INSTITUTE_NAME} — Learn Digital Skills. Build Real Projects. Grow Your Future. ` +
  'Affordable courses in AI, video editing, design, coding, marketing & more, with certificates and AI tutoring.';

export const COPYRIGHT_LINE = `© ${new Date().getFullYear()} ${INSTITUTE_NAME}. All Rights Reserved.`;

/* --------------------------------------------------------------------------
 * PRESERVED INTEGRATION DETAILS — deliberately NOT rebranded.
 *
 * These strings are not brand copy: they are the exact values an external system
 * (a bank, a mail server) expects. Changing them in the UI while the underlying
 * account is unchanged breaks payments and support mail. Update them here only
 * once the real-world account has actually changed. See docs/REBRAND_AUDIT.md §2.
 * ------------------------------------------------------------------------ */

/** Must match the name registered with the bank, character for character. */
export const BANK_ACCOUNT_NAME = 'LUNA ENTRY SERVICES- WOLI DAN TECH HUB';

/** Live mailboxes — renaming them here would send mail to a dead address. */
export const SUPPORT_EMAIL = 'wolidantech@gmail.com';
export const CONTACT_EMAIL = 'info@wolidantech.com';

/**
 * Some historical database rows store the previous institution name in
 * `issued_by`. Those rows are data, not code, and are not rewritten here; but the
 * UI must never surface the retired brand, so legacy values are displayed as the
 * current institute name. Unknown non-empty values pass through untouched.
 */
const LEGACY_ISSUERS = ['WOLI DAN TECH HUB', 'WOLI DAN', 'WOLIDAN TECH HUB', 'WOLIDAN'];
export const normalizeIssuer = (value) => {
  const v = String(value || '').trim();
  if (!v || LEGACY_ISSUERS.includes(v.toUpperCase())) return INSTITUTE_NAME;
  return v;
};

