// ============================================================
// Study tools / content studio gateway contract (src/lib/ai.js)
// ------------------------------------------------------------
// Same guarantee as the chat tutor: when VITE_AI_ENDPOINT is set, requests go
// to the operator's gateway with the student's Supabase bearer token attached
// and the { kind, input, options } shape; when it is unset, deterministic
// on-device templates answer — and they are labelled as such.
// ============================================================
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const authHeaders = vi.hoisted(() => ({ current: {} }));
vi.mock('../lib/supabase', () => ({
  aiAuthHeaders: async () => authHeaders.current,
  isSupabaseConfigured: () => false,
}));

const EP = 'http://mock.test/api/ai/generate';

async function loadAi(withEndpoint = true) {
  vi.resetModules();
  vi.stubEnv('VITE_AI_ENDPOINT', withEndpoint ? EP : '');
  return import('../lib/ai');
}

function reply({ status = 200, json, headers = {} } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k) => headers[String(k).toLowerCase()] ?? null },
    json: async () => {
      if (json === undefined) throw new Error('body is not json');
      return json;
    },
  };
}

let fetchCalls = [];
beforeEach(() => {
  fetchCalls = [];
  authHeaders.current = {};
  vi.stubGlobal('fetch', async (url, init) => {
    fetchCalls.push({ url, init });
    return reply({ json: { output: { title: 'Cloud flashcards', topic: 'Flexbox', cards: [{ front: 'f', back: 'b' }] } } });
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('VITE_AI_ENDPOINT set — secure backend provider', () => {
  it('posts { kind, input, options } with the student bearer token', async () => {
    authHeaders.current = { Authorization: 'Bearer jwt-from-supabase' };
    const ai = await loadAi();
    expect(ai.isCloudAIEnabled()).toBe(true);
    const out = await ai.generate('flashcards', { topic: 'CSS Flexbox' }, { numQuestions: 6 });
    const call = fetchCalls[0];
    expect(call.url).toBe(EP);
    const body = JSON.parse(call.init.body);
    expect(body.kind).toBe('flashcards');
    expect(body.input).toEqual({ topic: 'CSS Flexbox' });
    expect(body.options).toMatchObject({ numQuestions: 6 });
    expect(call.init.headers.Authorization).toBe('Bearer jwt-from-supabase');
    expect(call.init.headers['Content-Type']).toBe('application/json');
    expect(out.provider).toBe('secure-backend');
    expect(out.data.cards).toHaveLength(1);
  });

  it('falls back to MARKED on-device templates when the gateway fails', async () => {
    vi.stubGlobal('fetch', async () => reply({ status: 503, json: { error: 'down' } }));
    const ai = await loadAi();
    const out = await ai.generate('summary', { topic: 'SEO' });
    expect(out.provider).toBe('local-template');
    expect(out.degraded).toBe(true);
    expect(out.gatewayError.message).toMatch(/error/i);
    expect(out.data.markdown).toMatch(/SEO/);
  });

  it('refusals get student-friendly copy, never a raw status line', async () => {
    vi.stubGlobal('fetch', async () => reply({ status: 401, json: { error: 'nope' } }));
    const ai = await loadAi();
    // 401/403 from the studio fall back to templates with honest labelling.
    const out = await ai.generate('notes', { topic: 'Grid' });
    expect(out.provider).toBe('local-template');
    expect(out.degraded).toBe(true);
    expect(out.gatewayError.message).toMatch(/administrator|refused|sign in/i);
  });
});

describe('VITE_AI_ENDPOINT unset — on-device only', () => {
  it('answers from local templates and never calls the network', async () => {
    const ai = await loadAi(false);
    expect(ai.isCloudAIEnabled()).toBe(false);
    expect(ai.getActiveProviderName()).toBe('local-template');
    const out = await ai.generate('flashcards', { topic: 'Canva' });
    expect(fetchCalls).toHaveLength(0);
    expect(out.provider).toBe('local-template');
    expect(out.degraded).toBeFalsy();
    expect(out.data.cards.length).toBeGreaterThanOrEqual(3);
  });
});
