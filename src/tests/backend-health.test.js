// Regression tests for src/lib/backendHealth.js (the /backend-status probes).
// Fully mocked: no network and no Supabase project. Each scenario stubs
// import.meta.env + global fetch, then runs runDiagnostics().
import { describe, it, expect, vi, afterEach } from 'vitest';

const SUPABASE = 'https://testproj.supabase.co';
// Must stay identical to REQUIRED_TABLES in src/lib/backendHealth.js.
const REQUIRED = [
  'profiles', 'categories', 'courses', 'course_modules', 'course_lessons',
  'enrollments', 'manual_payments', 'certificate_issues', 'student_notifications',
  'quiz_questions', 'quizzes', 'assignments', 'coupons', 'site_settings',
  'student_id_cards',
];

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
const htmlShell = (status = 200) =>
  new Response('<!doctype html><html><body>app shell</body></html>', {
    status, headers: { 'content-type': 'text/html' },
  });

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function loadHealth() {
  vi.resetModules();
  vi.stubEnv('VITE_SUPABASE_URL', SUPABASE);
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_testkey');
  vi.stubEnv('VITE_API_URL', '');
  return import('../lib/backendHealth');
}

/**
 * Builds a fetch handler for the Supabase side.
 * rootMode 'not-found' reproduces hosted PostgREST: /rest/v1/ 404s without an
 * OpenAPI Accept header while every table endpoint answers fine.
 */
function supabaseHandler({
  rootMode = 'not-found', missingTables = [], categories = 7, catalog = 12,
  categoriesOrdered = 'ok',
} = {}) {
  const catRows = Array.from({ length: categories }, (_, i) => ({ name: `Cat ${i + 1}` }));
  const courseRows = Array.from({ length: catalog }, (_, i) => ({
    slug: `c${i + 1}`, published: true, archived: false,
  }));
  return (url) => {
    if (url === `${SUPABASE}/auth/v1/health`) return json({});
    if (url === `${SUPABASE}/auth/v1/settings`) {
      return json({ disable_signup: false, external: { email: true } });
    }
    if (url === `${SUPABASE}/rest/v1/`) {
      if (rootMode === 'openapi') {
        return json({ definitions: Object.fromEntries(REQUIRED.map((t) => [t, {}])) });
      }
      return json({ code: '404', message: 'Not Found' }, 404);
    }
    if (url === `${SUPABASE}/rest/v1/courses?select=slug,published,archived&limit=1000`) {
      return json(courseRows);
    }
    if (url === `${SUPABASE}/rest/v1/categories?select=name&order=sort_order.asc,name.asc&limit=1000`) {
      if (categoriesOrdered === 'bad-column') {
        return json({ code: '42703', message: 'column categories.sort_order does not exist' }, 400);
      }
      return json(catRows);
    }
    if (url === `${SUPABASE}/rest/v1/categories?select=name&limit=1000`) return json(catRows);
    const m = String(url).match(/\/rest\/v1\/([a-z_]+)\?select=\*&limit=1$/);
    if (m) {
      if (!REQUIRED.includes(m[1]) || missingTables.includes(m[1])) {
        return json({
          code: 'PGRST205',
          message: `Could not find the table 'public.${m[1]}' in the schema cache`,
        }, 404);
      }
      return json([]);
    }
    return null;
  };
}

function useFetch(handler) {
  globalThis.fetch = vi.fn(async (url, opts) => handler(String(url), opts) || json({}, 404));
}

const byId = (report, id) => report.checks.find((c) => c.id === id);

describe('runDiagnostics', () => {
  it('live-report shape: OpenAPI root 404s, but tables/catalog/categories verify per endpoint; HTML /api is named as the SPA fallback', async () => {
    const { runDiagnostics } = await loadHealth();
    const supabase = supabaseHandler({});
    useFetch((url, opts) => supabase(url, opts)
      || (url === '/api/course-categories' ? htmlShell() : null)
      || (url === '/api/courses?limit=1' ? htmlShell() : null));

    const report = await runDiagnostics();

    expect(byId(report, 'schema').level).toBe('pass');
    expect(byId(report, 'schema').detail).toMatch(/per table/);
    expect(byId(report, 'catalog').level).toBe('pass');
    expect(byId(report, 'catalog').detail).toMatch(/12 published/);
    expect(byId(report, 'categories').level).toBe('pass');
    expect(byId(report, 'categories').detail).toMatch(/7 categor/);
    expect(byId(report, 'course-api').level).toBe('fail');
    expect(byId(report, 'course-api').detail).toMatch(/HTML page/);
    expect(report.failures.map((f) => f.id)).toEqual(['course-api']);
  });

  it('names the contract shape a JSON course API speaks', async () => {
    const { runDiagnostics } = await loadHealth();
    const supabase = supabaseHandler({});
    useFetch((url, opts) => supabase(url, opts)
      || (url === '/api/course-categories'
        ? json({ success: true, data: { categories: [{ id: '1', name: 'Science & Laboratory', description: 'x' }] } })
        : null)
      || (url === '/api/courses?limit=1'
        ? json({
          success: true,
          data: {
            courses: [{
              id: 'c', slug: 's', title: 'T', is_published: true, category_id: '1',
              course_categories: { id: '1', name: 'Science & Laboratory' },
            }],
            pagination: { page: 1, limit: 1, total: 5, total_pages: 5 },
          },
        })
        : null));

    const report = await runDiagnostics();
    const api = byId(report, 'course-api');
    expect(api.level).toBe('pass');
    expect(api.detail).toMatch(/course_categories\{id,name,description\}/);
    expect(api.detail).toMatch(/is_published/);
  });

  it('fails the schema check by table name when a migration table is missing', async () => {
    const { runDiagnostics } = await loadHealth();
    const supabase = supabaseHandler({ missingTables: ['coupons'] });
    useFetch((url, opts) => supabase(url, opts) || htmlShell());

    const report = await runDiagnostics();
    const schema = byId(report, 'schema');
    expect(schema.level).toBe('fail');
    expect(schema.detail).toMatch(/coupons/);
  });

  it('isolates a rejected sort_order column from a readable categories table', async () => {
    const { runDiagnostics } = await loadHealth();
    const supabase = supabaseHandler({ categoriesOrdered: 'bad-column' });
    useFetch((url, opts) => supabase(url, opts) || htmlShell());

    const report = await runDiagnostics();
    const cats = byId(report, 'categories');
    expect(cats.level).toBe('fail');
    expect(cats.detail).toMatch(/sort_order/);
  });

  it('uses the OpenAPI table list when the root serves it', async () => {
    const { runDiagnostics } = await loadHealth();
    const supabase = supabaseHandler({ rootMode: 'openapi' });
    useFetch((url, opts) => supabase(url, opts) || htmlShell());

    const report = await runDiagnostics();
    expect(byId(report, 'schema').level).toBe('pass');
    expect(byId(report, 'schema').detail).toMatch(/migrations have been applied/);
  });
});
