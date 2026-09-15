// ============================================================
// The AI gateway contract (unit)
// ------------------------------------------------------------
// What these tests protect is the part of the AI feature you cannot see by
// clicking around: the request shape a student's phone sends, the bearer token,
// and — most of all — what the UI says when the cloud is NOT there. A silent
// on-device fallback dressed up as a cloud answer is the failure mode here, so
// the fallback is asserted to be loud (degraded + a code + friendly copy).
//
// Run: npm test
// Manual end-to-end version: node scripts/mock-dantech-gateway.mjs
// ============================================================
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The gateway client pulls its auth header from supabase.js; stub it so these
// tests exercise the header WITHOUT a Supabase project (and stay deterministic).
const authHeaders = vi.hoisted(() => ({ current: {} }));
vi.mock('../lib/supabase', () => ({
  aiAuthHeaders: async () => authHeaders.current,
  isSupabaseConfigured: () => false,
}));

const EP = 'http://mock.test/api/dantech/chat';

async function loadDantech(withEndpoint = true) {
  vi.resetModules();
  vi.stubEnv('VITE_DANTECH_ENDPOINT', withEndpoint ? EP : '');
  return import('../lib/dantech');
}

function reply({ status = 200, json, text, headers = {} } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k) => headers[String(k).toLowerCase()] ?? null },
    json: async () => {
      if (json === undefined) throw new Error('body is not json');
      return json;
    },
    text: async () => text ?? '',
  };
}

let fetchCalls = [];
beforeEach(() => {
  fetchCalls = [];
  authHeaders.current = {};
  vi.stubGlobal('fetch', async (url, init) => {
    fetchCalls.push({ url, init });
    return reply({ json: { text: 'cloud answer', sources: [{ title: 'Lesson 1' }] } });
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('protocol mode map', () => {
  it('gives every UI mode a gateway mode, and nothing falls through', async () => {
    const d = await loadDantech();
    expect(d.AI_MODES.length).toBeGreaterThan(3);
    for (const m of d.AI_MODES) {
      const mapped = d.toProtocolMode(m.id);
      expect(d.GATEWAY_MODES).toContain(mapped);
      expect(mapped).not.toBe('undefined');
    }
    // A mode added to the UI without a protocol entry must not reach the gateway
    // as undefined — it degrades to GENERAL (the least-assuming instruction).
    expect(d.toProtocolMode('brand-new-mode')).toBe('GENERAL');
    expect(d.toProtocolMode(undefined)).toBe('GENERAL');
    expect(d.PROTOCOL_MODE_MAP.deep).toBe('DEEP_EXPLANATION');
    expect(d.PROTOCOL_MODE_MAP.quick).toBe('GENERAL');
  });
});

describe('request body', () => {
  it('sends message + mode + allowlisted context + {role,text} history', async () => {
    const d = await loadDantech();
    await d.askCloudDanTech('Explain flexbox', {
      mode: 'study',
      context: {
        courseId: 'c1', lessonId: 'l2', moduleId: 'm3', level: 'Beginner',
        // PII the browser knows but the gateway must not receive:
        studentName: 'Aisha Bello', email: 'a@b.com', notes: 'my private notes',
        lessonText: 'x'.repeat(5000),
      },
      history: [
        { role: 'user', content: 'older shape still works' },
        { role: 'ai', text: 'newer shape' },
        { role: 'user', text: '   ' },
      ],
    });
    const body = JSON.parse(fetchCalls[0].init.body);
    expect(body.message).toBe('Explain flexbox');
    expect(body.mode).toBe('STUDY');
    expect(body.modeId).toBe('study');
    expect(body.context).toMatchObject({ courseId: 'c1', lessonId: 'l2', moduleId: 'm3', level: 'Beginner' });
    expect(body.context.studentName).toBeUndefined();
    expect(body.context.email).toBeUndefined();
    expect(body.context.notes).toBeUndefined();
    expect(body.context.lessonText.length).toBe(3000);
    expect(body.history).toEqual([
      { role: 'user', text: 'older shape still works' },
      { role: 'assistant', text: 'newer shape' },
    ]);
  });

  it('keeps history to the last 12 turns and clamps each to 1500 chars', async () => {
    const d = await loadDantech();
    const long = 'y'.repeat(4000);
    const h = Array.from({ length: 30 }, (_, i) => ({ role: i % 2 ? 'ai' : 'user', text: `${i}${long}` }));
    const out = d.normalizeHistory(h);
    expect(out.length).toBe(12);
    expect(out[0].text.startsWith('18')).toBe(true);
    expect(out.every((x) => x.text.length === 1500)).toBe(true);
  });

  it('attaches the student bearer token when one exists', async () => {
    authHeaders.current = { Authorization: 'Bearer jwt-from-supabase' };
    const d = await loadDantech();
    await d.askCloudDanTech('hi', {});
    const headers = fetchCalls[0].init.headers;
    expect(headers.Authorization).toBe('Bearer jwt-from-supabase');
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers.Accept).toBe('application/json');
  });

  it('sends no Authorization header when signed out or unconfigured', async () => {
    const d = await loadDantech();
    await d.askCloudDanTech('hi', {});
    expect(fetchCalls[0].init.headers.Authorization).toBeUndefined();
  });

  it('posts to the configured endpoint', async () => {
    const d = await loadDantech();
    await d.askCloudDanTech('hi', {});
    expect(fetchCalls[0].url).toBe(EP);
    expect(fetchCalls[0].init.method).toBe('POST');
  });
});

describe('status → student-facing copy', () => {
  it('parses Retry-After as seconds or an HTTP date, and never NaN', async () => {
    const d = await loadDantech();
    expect(d.parseRetryAfter('8')).toBe(8);
    expect(d.parseRetryAfter(' 12 ')).toBe(12);
    expect(d.parseRetryAfter(null)).toBe(0);
    expect(d.parseRetryAfter('soon')).toBe(0);
    expect(d.parseRetryAfter('99999')).toBe(600);
    const in20s = new Date(Date.now() + 20000).toUTCString();
    const parsed = d.parseRetryAfter(in20s);
    expect(parsed).toBeGreaterThanOrEqual(15);
    expect(parsed).toBeLessThanOrEqual(25);
  });

  it('names each failure in words a student can act on', async () => {
    const d = await loadDantech();
    const copy = (s, ra = 0) => d.friendlyGatewayMessage(s, ra);
    expect(copy(0)).toMatch(/offline|unreachable/i);
    expect(copy(401)).toMatch(/sign in/i);
    expect(copy(403)).toMatch(/sign in/i);
    expect(copy(408)).toMatch(/too long/i);
    expect(copy(429, 8)).toMatch(/wait 8 seconds/i);
    expect(copy(429)).toMatch(/slow down/i);
    expect(copy(501)).toMatch(/not configured/i);
    expect(copy(503)).toMatch(/trouble right now|temporarily/i);
    expect(copy(404)).toMatch(/VITE_DANTECH_ENDPOINT/);
    for (const s of [0, 400, 401, 404, 408, 429, 500, 501, 503]) {
      const t = copy(s);
      expect(t.length).toBeGreaterThan(25);
      expect(t).not.toMatch(/undefined|NaN|\[object/);
    }
    // The two different kinds of "no answer" must not read the same: a dead server
    // is not an offline phone.
    expect(copy(0)).not.toBe(copy(503));
  });

  it('turns a 429 into code + wait time, not a generic error', async () => {
    vi.stubGlobal('fetch', async () => reply({ status: 429, text: 'slow down', headers: { 'retry-after': '8' } }));
    const d = await loadDantech();
    const err = await d.askCloudDanTech('hi', {}).catch((e) => e);
    expect(err.name).toBe('DanTechGatewayError');
    expect(err.code).toBe('rate_limited');
    expect(err.status).toBe(429);
    expect(err.retryAfterMs).toBe(8000);
    expect(err.message).toMatch(/wait 8 seconds/i);
  });

  it('reports an unreachable gateway as offline, not as a server error', async () => {
    vi.stubGlobal('fetch', async () => { throw new TypeError('Failed to fetch'); });
    const d = await loadDantech();
    const err = await d.askCloudDanTech('hi', {}).catch((e) => e);
    expect(err.code).toBe('offline');
    expect(err.status).toBe(0);
    expect(err.retryAfterMs).toBe(4000);
    expect(err.message).toMatch(/offline/i);
  });

  it('does not invent an answer when the gateway replies with nothing readable', async () => {
    vi.stubGlobal('fetch', async () => reply({ status: 200, text: '<html>proxy</html>' }));
    const d = await loadDantech();
    const err = await d.askCloudDanTech('hi', {}).catch((e) => e);
    expect(err.code).toBe('bad_json');
    expect(err.message).toMatch(/not a valid answer/i);
  });

  it('treats a blank 200 as a failure (no empty bubbles in the transcript)', async () => {
    vi.stubGlobal('fetch', async () => reply({ status: 200, json: { text: '  ' } }));
    const d = await loadDantech();
    const err = await d.askCloudDanTech('hi', {}).catch((e) => e);
    expect(err.code).toBe('empty');
  });

  it('still throws AbortError when the student presses Stop', async () => {
    vi.stubGlobal('fetch', (url, init) => new Promise((_res, rej) => {
      init.signal.addEventListener('abort', () => {
        const e = new Error('The user aborted a request.');
        e.name = 'AbortError';
        rej(e);
      });
    }));
    const d = await loadDantech();
    const ctrl = new AbortController();
    const pr = d.askCloudDanTech('hi', { signal: ctrl.signal });
    setTimeout(() => ctrl.abort(), 5);
    const err = await pr.catch((e) => e);
    expect(err.name).toBe('AbortError');
  });

  it('gives up at the client timeout instead of hanging forever', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', (url, init) => new Promise((_res, rej) => {
      init.signal.addEventListener('abort', () => {
        const e = new Error('aborted');
        e.name = 'AbortError';
        rej(e);
      });
    }));
    const d = await loadDantech();
    const pr = d.askCloudDanTech('hi', {}).catch((e) => e);
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(30100);
    const err = await pr;
    expect(err.code).toBe('timeout');
    expect(err.message).toMatch(/too long/i);
  });
});

describe('askDanTech — the fallback must be honest', () => {
  it('answers from the gateway when it works', async () => {
    const d = await loadDantech();
    const r = await d.askDanTech('Explain flexbox', { mode: 'coding' });
    expect(r).toMatchObject({ provider: 'secure-backend', online: true, degraded: false });
    expect(r.text).toBe('cloud answer');
    expect(r.sources).toHaveLength(1);
  });

  it('degrades to the local engine AND reports why', async () => {
    vi.stubGlobal('fetch', async () => reply({ status: 503, text: 'upstream down', headers: {} }));
    const d = await loadDantech();
    const r = await d.askDanTech('hi there', { mode: 'quick' });
    expect(r.provider).toBe('local');
    expect(r.online).toBe(false);
    expect(r.degraded).toBe(true);
    expect(r.text.length).toBeGreaterThan(20);
    expect(r.gatewayError).toMatchObject({ status: 503, code: 'unavailable' });
    expect(r.gatewayError.message).toMatch(/trouble right now/i);
  });

  it('says on-device (not degraded) when no gateway is configured at all', async () => {
    const d = await loadDantech(false);
    expect(d.isCloudDanTechEnabled()).toBe(false);
    const r = await d.askDanTech('hi', {});
    expect(r).toMatchObject({ provider: 'local', degraded: false, online: false });
    expect(fetchCalls).toHaveLength(0);
  });

  it('never sends a chat request for an answer the student asked us to write for them', async () => {
    const d = await loadDantech();
    const r = await d.askDanTech('Please do my assignment for me', { mode: 'quick' });
    expect(r.provider).toBe('guardrail');
    expect(r.text).toMatch(/can't do that one \*for\* you/i);
    expect(fetchCalls).toHaveLength(0);
  });

  it('propagates Stop rather than faking an answer', async () => {
    vi.stubGlobal('fetch', (url, init) => new Promise((_res, rej) => {
      init.signal.addEventListener('abort', () => {
        const e = new Error('aborted');
        e.name = 'AbortError';
        rej(e);
      });
    }));
    const d = await loadDantech();
    const ctrl = new AbortController();
    const pr = d.askDanTech('hi', { signal: ctrl.signal });
    setTimeout(() => ctrl.abort(), 5);
    await expect(pr).rejects.toMatchObject({ name: 'AbortError' });
  });
});
