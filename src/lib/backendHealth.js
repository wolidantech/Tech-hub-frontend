// ============================================================
// Backend diagnostics
// ------------------------------------------------------------
// The app talks to Supabase for everything (auth, courses, payments).
// When a request fails the browser only sees "TypeError: Failed to fetch",
// which the UI used to flatten into one generic "Network error. Check your
// connection and retry." That hides the real cause — a paused project, a
// mistyped URL, a CORS block, an expired/service-role key, migrations that
// were never run, or a seed where every course is unpublished.
//
// This module probes the backend layer by layer from the visitor's own
// browser and returns a specific cause + a specific fix for each layer.
// It is read-only: every request is a GET against public endpoints.
// ============================================================

const RAW_URL = String(import.meta.env?.VITE_SUPABASE_URL || '').trim();
const RAW_KEY = String(import.meta.env?.VITE_SUPABASE_ANON_KEY || '').trim();

export const backendUrl = RAW_URL;
export const backendKey = RAW_KEY;
export const isConfigured = () => Boolean(RAW_URL && RAW_KEY);

/** Tables the frontend queries. Missing ones mean migrations were not run. */
const REQUIRED_TABLES = [
  'profiles', 'categories', 'courses', 'course_modules', 'course_lessons',
  'enrollments', 'manual_payments', 'certificates', 'notifications',
  'quiz_questions', 'quizzes', 'assignments', 'coupons', 'site_settings',
];

const PROBE_TIMEOUT = 9000;

// ---------- tiny helpers ----------

const strip = (u) => String(u || '').replace(/\/+$/, '');

/** The origin the browser would send — used to tell the admin what to allowlist. */
const currentOrigin = () =>
  typeof window === 'undefined' || !window.location ? '(this site’s origin)' : window.location.origin;

/** Decode a Supabase JWT without any network call. Returns null if not a JWT. */
function decodeJwt(token) {
  try {
    const parts = String(token).split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(payload + '='.repeat((4 - (payload.length % 4)) % 4)));
    return json || null;
  } catch {
    return null;
  }
}

/** GET with a timeout. Never throws for HTTP errors — only for network failure. */
async function probe(path, { mode = 'cors', key = RAW_KEY } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT);
  const started = Date.now();
  try {
    const res = await fetch(`${strip(RAW_URL)}${path}`, {
      method: 'GET',
      mode,
      signal: controller.signal,
      headers: mode === 'cors' && key ? { apikey: key, Authorization: `Bearer ${key}` } : undefined,
    });
    const ms = Date.now() - started;
    let body = null;
    let text = '';
    if (mode === 'cors') {
      try {
        text = await res.text();
        const ctype = res.headers.get('content-type') || '';
        body = ctype.includes('json') ? JSON.parse(text) : null;
      } catch { /* body unreadable — keep raw text */ }
    }
    return {
      ok: res.ok, status: res.status, ms, body, text,
      contentType: mode === 'cors' ? (res.headers.get('content-type') || '') : '',
      type: res.type || 'basic',
    };
  } catch (err) {
    return {
      ok: false, status: 0, ms: Date.now() - started, body: null, text: '',
      contentType: '', type: 'error',
      error: String(err?.name === 'AbortError' ? 'timeout' : err?.message || err),
    };
  } finally {
    clearTimeout(timer);
  }
}

// ---------- check 1: environment variables ----------

function checkEnv() {
  const problems = [];
  if (!RAW_URL) problems.push('VITE_SUPABASE_URL is empty');
  if (!RAW_KEY) problems.push('VITE_SUPABASE_ANON_KEY is empty');

  if (problems.length) {
    return {
      id: 'env', title: 'Environment variables', level: 'fail',
      detail: `${problems.join(' and ')}. Vite inlines these at BUILD time, so the app cannot start.`,
      fix: 'Put both values in a .env file at the project root (copy .env.example), then restart the dev server. On Vercel/Netlify add them under Environment Variables and REDEPLOY — a rebuild is required, variables are baked into the bundle.',
    };
  }
  return {
    id: 'env', title: 'Environment variables', level: 'pass',
    detail: `Both variables are present. URL = ${RAW_URL}`,
    fix: null,
  };
}

// ---------- check 2: URL shape (catches the most common paste mistakes) ----------

function checkUrlShape() {
  const u = RAW_URL;
  const mistakes = [];
  const host = u.replace(/^https?:\/\//, '').split('/')[0];

  // The Supabase CLI runs a full local stack at http://127.0.0.1:54321, so
  // plain HTTP and a port are correct there and must not be flagged.
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host);

  if (/^postgres(ql)?:\/\//i.test(u)) mistakes.push('this is a Postgres connection string, not the API URL');
  else if (/^db\./i.test(u.replace(/^https?:\/\//, ''))) mistakes.push('this is the database host (db.…), not the API URL');
  else if (!isLocal && !/^https:\/\//i.test(u)) mistakes.push('it must start with https://');
  else if (!isLocal && /[:]\d{4,5}/.test(host)) mistakes.push('it must not contain a port');
  if (/\s/.test(u)) mistakes.push('it contains a space or newline (common when copy-pasting)');
  if (/your-project|example\.com|placeholder/i.test(u)) mistakes.push('it still holds the placeholder from .env.example');
  if (/supabase\.com/i.test(u)) mistakes.push('the domain is supabase.com — the API host is supabase.co');

  const looksManaged = isLocal || /\.(supabase\.co|supabase\.in|supabase\.red)$/i.test(host);

  if (mistakes.length) {
    return {
      id: 'url', title: 'Project URL format', level: 'fail',
      detail: `${mistakes[0]}. Value: ${u}`,
      fix: 'Supabase Dashboard → Project Settings → API → "Project URL". It looks like https://abcdefghijklmnop.supabase.co with no path, no port and no trailing slash.',
    };
  }
  return {
    id: 'url', title: 'Project URL format', level: looksManaged ? 'pass' : 'warn',
    detail: isLocal
      ? `Local Supabase stack: ${host} (the CLI serves the API over plain HTTP with a port — that is expected).`
      : looksManaged
        ? `Well-formed Supabase host: ${host}`
        : `${host} is not a standard *.supabase.co host. That is fine for a custom domain, but double-check it is the API URL.`,
    fix: looksManaged ? null : 'If this is not a custom domain you configured, replace it with the Project URL from Supabase Dashboard → Project Settings → API.',
  };
}

// ---------- check 3: key shape (security + expiry, no network needed) ----------

function checkKeyShape() {
  const k = RAW_KEY;
  if (!k) return { id: 'key', title: 'API key', level: 'skip', detail: 'No key set.', fix: 'Set VITE_SUPABASE_ANON_KEY.' };

  // New-style publishable/secret keys (Supabase 2025+)
  if (/^sb_secret_/i.test(k)) {
    return {
      id: 'key', title: 'API key type', level: 'fail',
      detail: 'This is a SECRET key. It must never be shipped in frontend code — anyone can read it and take over the database.',
      fix: 'Use the publishable/anon key in VITE_SUPABASE_ANON_KEY (Supabase Dashboard → Project Settings → API Keys). Keep the secret key on the server only. Rotate the exposed secret key immediately.',
    };
  }
  if (/^sb_publishable_/i.test(k)) {
    return {
      id: 'key', title: 'API key type', level: 'pass',
      detail: 'New-style publishable key — correct for the frontend.',
      fix: null,
    };
  }

  const claims = decodeJwt(k);
  if (!claims) {
    return {
      id: 'key', title: 'API key type', level: 'warn',
      detail: 'The key is not a recognisable JWT or sb_publishable_ key. It may be truncated or have stray characters.',
      fix: 'Re-copy the anon/publishable key in full from Supabase Dashboard → Project Settings → API.',
    };
  }

  const problems = [];
  if (claims.role && claims.role !== 'anon') {
    problems.push(`role is "${claims.role}", not "anon"`);
  }
  const expDate = claims.exp ? new Date(claims.exp * 1000) : null;
  if (expDate && expDate.getTime() < Date.now()) {
    problems.push(`it expired on ${expDate.toISOString().slice(0, 10)}`);
  }

  if (problems.length) {
    const isService = /service_role/.test(problems.join(' '));
    return {
      id: 'key', title: 'API key type', level: 'fail',
      detail: `Wrong key for the frontend: ${problems.join(' and ')}.`,
      fix: isService
        ? 'This is the service_role key — it bypasses all row-level security and must NEVER be in a frontend bundle. Replace it with the anon/publishable key, then rotate the service_role key in Supabase because it has been exposed.'
        : 'Replace VITE_SUPABASE_ANON_KEY with a fresh anon/publishable key from Supabase Dashboard → Project Settings → API, then rebuild and redeploy.',
    };
  }
  return {
    id: 'key', title: 'API key type', level: 'pass',
    detail: `anon key, valid JWT${expDate ? `, expires ${expDate.toISOString().slice(0, 10)}` : ''}.`,
    fix: null,
  };
}

// ---------- check 4: reachability (separates CORS from a dead/paused project) ----------

async function checkReachability() {
  const cors = await probe('/auth/v1/health');

  if (cors.type !== 'error') {
    if (cors.status === 200) {
      return {
        id: 'reach', title: 'Backend reachable', level: 'pass',
        detail: `GET /auth/v1/health → 200 in ${cors.ms}ms. The project is live and accepts this origin.`,
        fix: null,
      };
    }
    if (cors.status === 540 || /paused|hibernat/i.test(cors.text || '')) {
      return {
        id: 'reach', title: 'Backend reachable', level: 'fail',
        detail: `HTTP ${cors.status || 540} — the Supabase project is PAUSED. Free-tier projects pause automatically after about a week of inactivity, and every request then fails.`,
        fix: 'Open the Supabase Dashboard, select the project and click "Restore project" (it takes a few minutes). To stop it recurring, upgrade to the Pro plan or schedule a weekly ping.',
      };
    }
    if (cors.status === 401 || cors.status === 403) {
      const msg = cors.body?.message || cors.body?.error || cors.text || '';
      return {
        id: 'reach', title: 'Backend reachable', level: 'fail',
        detail: `The project responded (HTTP ${cors.status}) but REJECTED the API key: ${String(msg).slice(0, 160)}`,
        fix: 'The key does not belong to this project, or it was rotated. Copy the current anon/publishable key from Supabase Dashboard → Project Settings → API and redeploy.',
      };
    }
    if (cors.status === 404) {
      return {
        id: 'reach', title: 'Backend reachable', level: 'fail',
        detail: `HTTP 404 from ${RAW_URL} — something answers at this address but it is not a Supabase Auth endpoint.`,
        fix: 'The URL is wrong or points at a deleted project. Use the Project URL from Supabase Dashboard → Project Settings → API.',
      };
    }
    return {
      id: 'reach', title: 'Backend reachable', level: 'warn',
      detail: `Unexpected HTTP ${cors.status} from /auth/v1/health: ${String(cors.text || '').slice(0, 160)}`,
      fix: 'Check Supabase Dashboard → Logs → Auth for the matching error.',
    };
  }

  // Network-level failure: distinguish "host unreachable" from "CORS block".
  // A no-cors request skips the CORS check, so if IT succeeds the host is up
  // and the failure is the browser refusing the cross-origin read.
  const opaque = await probe('/auth/v1/health', { mode: 'no-cors' });
  const dnsResolves = opaque.type !== 'error';

  if (dnsResolves) {
    return {
      id: 'reach', title: 'Backend reachable', level: 'fail',
      detail: `The host ${strip(RAW_URL).replace(/^https?:\/\//, '')} IS online, but the browser blocked the cross-origin request (CORS). Supabase normally allows every origin, so this points at a restricted origin list, a proxy/extension, or a paused project returning an HTML page.`,
      fix: `In Supabase Dashboard → Authentication → URL Configuration add this exact origin to the allowed list: ${currentOrigin()}. Also disable ad-blockers/privacy extensions for this site and retry. If the project is on a free plan, confirm it is not paused.`,
    };
  }

  const why = /timeout/i.test(cors.error || '')
    ? `the request timed out after ${PROBE_TIMEOUT / 1000}s`
    : `the request could not be completed (${cors.error})`;
  return {
    id: 'reach', title: 'Backend reachable', level: 'fail',
    detail: `Cannot reach the backend at all — ${why}. The host did not resolve or refused the connection, so this is not a code bug in the app.`,
    fix: 'Most likely causes, in order: (1) the project is paused or deleted — check the Supabase Dashboard; (2) the URL is mistyped — re-copy it from Project Settings → API; (3) the device/network/DNS is blocking supabase.co — test by opening the URL directly in a new tab; (4) an ad-blocker or corporate proxy is blocking it.',
  };
}

// ---------- check 5: auth configuration (signup, email confirmation) ----------

async function checkAuthSettings() {
  const res = await probe('/auth/v1/settings');
  if (res.type === 'error' || !res.ok) {
    return {
      id: 'auth', title: 'Auth configuration', level: 'skip',
      detail: 'Skipped — the backend did not answer (see the reachability check above).',
      fix: null,
    };
  }
  const s = res.body || {};
  const notes = [];
  if (s.disable_signup) notes.push('signups are DISABLED, so /register will always fail');
  const providers = Object.keys(s.external || {}).filter((p) => s.external?.[p]);
  notes.push(providers.length ? `social providers enabled: ${providers.join(', ')}` : 'email/password only');

  return {
    id: 'auth', title: 'Auth configuration', level: s.disable_signup ? 'warn' : 'pass',
    detail: notes.join('; ') + '.',
    fix: s.disable_signup
      ? 'Supabase Dashboard → Authentication → Providers → Email: turn off "Disable signups".'
      : 'If registered users cannot log in until they click an email link, that is "Confirm email" being ON (Authentication → Providers → Email). Either turn it off, or make sure the Site URL and Redirect URLs include this origin so the confirmation link works.',
  };
}

// ---------- check 6: schema — were the migrations actually run? ----------

async function checkSchema() {
  const res = await probe('/rest/v1/');
  if (res.type === 'error' || !res.ok) {
    return {
      id: 'schema', title: 'Database schema', level: 'skip',
      detail: 'Skipped — the REST API did not answer.',
      fix: null,
    };
  }

  // The PostgREST root returns the OpenAPI document; its "definitions" keys
  // are the tables and views the anon key can see.
  const found = new Set(Object.keys(res.body?.definitions || {}));
  if (!found.size) {
    return {
      id: 'schema', title: 'Database schema', level: 'warn',
      detail: 'The REST API answered but exposed no tables. Either the schema is empty or the response shape changed.',
      fix: 'Run supabase/migrations/001–005 in order in the Supabase SQL Editor.',
    };
  }

  const missing = REQUIRED_TABLES.filter((t) => !found.has(t));
  if (missing.length) {
    return {
      id: 'schema', title: 'Database schema', level: 'fail',
      detail: `The database is reachable but ${missing.length} required table(s) are missing: ${missing.join(', ')}. The migrations were not run (or only partly run).`,
      fix: 'In the Supabase SQL Editor run supabase/migrations/001_lms_core.sql, then 002, 003, 004, 005 IN THAT ORDER, then supabase/seed/seed_12_courses.sql. Migration 003 is the one that creates the signup trigger, so skipping it breaks every login.',
    };
  }
  return {
    id: 'schema', title: 'Database schema', level: 'pass',
    detail: `All ${REQUIRED_TABLES.length} required tables exist — migrations have been applied.`,
    fix: null,
  };
}

// ---------- check 7: catalog — is there anything a visitor is ALLOWED to see? ----------

async function checkCatalog() {
  const res = await probe('/rest/v1/courses?select=slug,published,archived&limit=1000');
  if (res.type === 'error' || !res.ok) {
    const detail = res.body?.message || res.text || res.error || 'no response';
    return {
      id: 'catalog', title: 'Course catalog', level: 'skip',
      detail: `Could not read the courses table: ${String(detail).slice(0, 180)}`,
      fix: 'Run the migrations first (see the schema check), then the seed file.',
    };
  }

  const rows = Array.isArray(res.body) ? res.body : [];
  const visible = rows.filter((r) => r.published && !r.archived);

  if (!rows.length) {
    return {
      id: 'catalog', title: 'Course catalog', level: 'fail',
      detail: 'The courses table is EMPTY, or every row is hidden from this key. Row-level security only exposes courses where published = true, so a visitor sees nothing.',
      fix: 'Run supabase/seed/seed_12_courses.sql in the SQL Editor, then supabase/seed/publish_courses.sql. The seed deliberately inserts courses as drafts; without the publish step the storefront stays empty even though the data is there.',
    };
  }
  if (!visible.length) {
    return {
      id: 'catalog', title: 'Course catalog', level: 'fail',
      detail: `This key can see ${rows.length} course(s) but NONE are published. The storefront hides unpublished courses, which is exactly the "no courses here" symptom.`,
      fix: 'Run supabase/seed/publish_courses.sql in the SQL Editor (it flips published = true for the seeded catalog), or sign in as an admin and publish them from Admin → Courses.',
    };
  }
  return {
    id: 'catalog', title: 'Course catalog', level: 'pass',
    detail: `${visible.length} published course(s) visible to a logged-out visitor.`,
    fix: null,
  };
}

// ---------- check 8: admin bootstrap ----------

function checkAdminPath() {
  return {
    id: 'admin', title: 'Admin account', level: 'warn',
    detail: 'The signup trigger always creates accounts with role = student, so no one can reach /admin/login until a row is promoted by hand. Without an admin you cannot publish courses, approve payments or issue certificates.',
    fix: 'Register normally on the site first, then run supabase/seed/make_admin.sql in the SQL Editor with your email. It is idempotent and only touches the profiles row for that email.',
  };
}

// ---------- runner ----------

/**
 * Run every probe. Returns { origin, url, checks, failures, warnings, healthy }.
 * Safe to call repeatedly; never throws.
 */
export async function runDiagnostics() {
  const checks = [];
  const env = checkEnv();
  const url = checkUrlShape();
  const key = checkKeyShape();
  checks.push(env, url, key);

  // No point hammering the network when the config itself is broken.
  if (env.level === 'fail' || url.level === 'fail') {
    checks.push(
      { id: 'reach', title: 'Backend reachable', level: 'skip', detail: 'Skipped — fix the configuration above first.', fix: null },
      { id: 'auth', title: 'Auth configuration', level: 'skip', detail: 'Skipped.', fix: null },
      { id: 'schema', title: 'Database schema', level: 'skip', detail: 'Skipped.', fix: null },
      { id: 'catalog', title: 'Course catalog', level: 'skip', detail: 'Skipped.', fix: null },
    );
  } else {
    checks.push(await checkReachability());
    // Only continue if the backend actually answered.
    const reachable = checks.find((c) => c.id === 'reach');
    if (reachable.level === 'pass' || reachable.level === 'warn') {
      checks.push(await checkAuthSettings());
      checks.push(await checkSchema());
      checks.push(await checkCatalog());
    } else {
      checks.push(
        { id: 'auth', title: 'Auth configuration', level: 'skip', detail: 'Skipped — backend unreachable.', fix: null },
        { id: 'schema', title: 'Database schema', level: 'skip', detail: 'Skipped — backend unreachable.', fix: null },
        { id: 'catalog', title: 'Course catalog', level: 'skip', detail: 'Skipped — backend unreachable.', fix: null },
      );
    }
  }
  checks.push(checkAdminPath());

  return {
    origin: typeof window === 'undefined' ? '' : window.location.origin,
    url: RAW_URL || '(not set)',
    checkedAt: new Date().toISOString(),
    checks,
    failures: checks.filter((c) => c.level === 'fail'),
    warnings: checks.filter((c) => c.level === 'warn'),
    healthy: !checks.some((c) => c.level === 'fail'),
  };
}

/** Plain-text report, for pasting into a bug report or chat. */
export function diagnosticsToText(report) {
  if (!report) return '';
  const icon = { pass: 'PASS', warn: 'WARN', fail: 'FAIL', skip: 'SKIP' };
  const lines = [
    'WOLI DAN TECH HUB — backend diagnostics',
    `origin:   ${report.origin}`,
    `backend:  ${report.url}`,
    `checked:  ${report.checkedAt}`,
    '',
  ];
  report.checks.forEach((c) => {
    lines.push(`[${icon[c.level] || c.level}] ${c.title}`);
    lines.push(`       ${c.detail}`);
    if (c.fix) lines.push(`       fix: ${c.fix}`);
  });
  return lines.join('\n');
}

/**
 * The single most likely cause, used by the UI to replace the generic
 * "Network error" toast with something a person can act on.
 */
export function primaryCause(report) {
  if (!report) return null;
  return report.failures[0] || report.warnings[0] || null;
}
