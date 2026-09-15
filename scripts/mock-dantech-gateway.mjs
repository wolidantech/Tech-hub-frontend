#!/usr/bin/env node
// ============================================================
// Local mock of the DanTECH AI gateway — for verifying the frontend contract
// ------------------------------------------------------------
// The browser side of the AI feature has rules that are invisible in a normal
// dev run: the bearer token, the { message, mode, context, history } shape, the
// per-status copy, Retry-After, and the on-device fallback when the cloud dies.
// This script is a ~200-line stand-in for server/ai-gateway.example.mjs that
// speaks the same protocol so you can watch every case on a phone without
// paying for a model key.
//
//   node scripts/mock-dantech-gateway.mjs
//
// Then, in a second terminal (absolute endpoint…):
//
//   VITE_DANTECH_ENDPOINT=http://localhost:8788/api/dantech/chat npm run dev
//
// …or the relative one, which the vite dev server proxies to this port
// (use this for hosted/browser previews where localhost is not the browser):
//
//   VITE_DANTECH_ENDPOINT=/api/dantech/chat npm run dev
//
// Open /ai and type any of these to force a case:
//   hello                      -> 200 answer (and check the header prints)
//   !401  / !403               -> refused sign-in copy   (also: run with REQUIRE_AUTH=1 while signed out)
//   !429                       -> 429 + Retry-After: 8   (Retry button counts down)
//   !501                       -> "cloud not configured", quiet on-device fallback
//   !503                       -> temporary outage copy + on-device answer
//   !empty                     -> 200 with no text       (empty-answer guard)
//   !garbage                   -> 200 with a non-JSON body
//   !slow                      -> answers after SLOW_MS (default 31s) -> client timeout at 30s
//
// Every request is echoed to this terminal: method, path, whether an
// Authorization header arrived (the token itself is masked), the decoded protocol
// payload, and the status being returned. That echo IS the verification — you are
// watching the exact bytes the browser sent, on localhost, with no secrets.
// ============================================================
import http from 'node:http';

const PORT = Number(process.env.PORT || 8788);
const REQUIRE_AUTH = process.env.REQUIRE_AUTH === '1';
const SLOW_MS = Number(process.env.SLOW_MS || 31000);
const MODES = new Set(['GENERAL', 'STUDY', 'CODING', 'RESEARCH', 'CAREER', 'DEEP_EXPLANATION']);

const c = { dim: '\x1b[2m', cy: '\x1b[36m', gr: '\x1b[32m', am: '\x1b[33m', rd: '\x1b[31m', off: '\x1b[0m' };

function log(lines, color = '') {
  console.log(`${color}${lines.map((l) => `   ${l}`).join('\n')}${c.off}`);
}
const mask = (v) => (v ? `${String(v).slice(0, 10)}…(${String(v).length} chars)` : 'ABSENT');

function send(res, status, body, headers = {}) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': typeof body === 'string' && !body.startsWith('{') ? 'text/plain' : 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    ...headers,
  });
  res.end(text);
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, '');
  if (req.url === '/healthz') return send(res, 200, { ok: true, requireAuth: REQUIRE_AUTH });

  if (req.url !== '/api/dantech/chat' || req.method !== 'POST') {
    log([`${c.rd}${req.method} ${req.url} -> 404 no route${c.off}`]);
    return send(res, 404, { error: 'unknown route' });
  }

  const chunks = [];
  req.on('data', (d) => chunks.push(d));
  req.on('end', () => {
    const raw = Buffer.concat(chunks).toString('utf8');
    let body;
    try { body = JSON.parse(raw || '{}'); } catch { body = null; }

    const auth = req.headers.authorization || '';
    const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const seen = {
      'content-length': `${raw.length} bytes`,
      authorization: mask(bearer),
    };
    if (!body) {
      log([`${c.rd}${req.method} ${req.url}${c.off}`, ...Object.entries(seen).map(([k, v]) => `${c.dim}${k}${c.off}=${v}`), `${c.rd}-> 400 body was not JSON${c.off}`]);
      return send(res, 400, { error: 'invalid json' });
    }
    const problems = [];
    if (typeof body.message !== 'string' || !body.message.trim()) problems.push('message must be a non-empty string');
    if (!MODES.has(body.mode)) problems.push(`mode must be one of ${[...MODES].join('|')} (got ${JSON.stringify(body.mode)})`);
    if (!body.context || typeof body.context !== 'object') problems.push('context object required');
    if (!Array.isArray(body.history)) problems.push('history must be an array');
    else if (body.history.some((h) => typeof h?.text !== 'string' || typeof h?.role !== 'string')) {
      problems.push('every history item needs { role, text } — content: is the old shape');
    }
    const denied = REQUIRE_AUTH && !bearer;
    if (denied) problems.length = 0;

    log([
      `${c.cy}${req.method} ${req.url}${c.off}`,
      ...Object.entries(seen).map(([k, v]) => `${c.dim}${k}${c.off}=${v}`),
      `${c.dim}body${c.off}=${JSON.stringify({ ...body, context: body.context, history: `${(body.history || []).length} items` })}`,
    ]);

    if (denied) {
      log([`${c.am}-> 401 Authorization: Bearer <token> required (REQUIRE_AUTH=1)${c.off}`]);
      return send(res, 401, { error: 'sign in required' });
    }
    if (problems.length) {
      log([`${c.rd}-> 400 protocol violation${c.off}`, ...problems.map((x) => `   ${c.rd}• ${x}${c.off}`)]);
      return send(res, 400, { error: 'protocol violation', problems });
    }

    const msg = body.message;
    const force = (msg.match(/^!(\w+)/) || [])[1];
    const note = `mode=${body.mode} courseId=${body.context.courseId ?? '—'} level=${body.context.level ?? '—'}`;

    if (force === 'empty') return log([`${c.am}-> 200 with an empty reply (client must not render a blank bubble)${c.off}`]) || send(res, 200, { text: '   ' });
    if (force === 'garbage') return log([`${c.am}-> 200 with a non-JSON body${c.off}`]) || send(res, 200, '<html>proxy ate the response</html>');
    if (force === '429') {
      log([`${c.am}-> 429 with Retry-After: 8 (client should count down, not spam)${c.off}`]);
      return send(res, 429, { error: 'slow down' }, { 'Retry-After': '8' });
    }
    if (force === '501') {
      log([`${c.am}-> 501 not configured (client degrades quietly, badge says ON-DEVICE)${c.off}`]);
      return send(res, 501, { error: 'cloud tutor not configured — client uses on-device mode' });
    }
    if (force === '503') {
      log([`${c.rd}-> 503 unavailable${c.off}`]);
      return send(res, 503, { error: 'upstream provider is down' });
    }
    if (force === '401' || force === '403') {
      log([`${c.rd}-> ${force} refused${c.off}`]);
      return send(res, Number(force), { error: 'token rejected' });
    }
    if (force === 'slow') {
      log([`${c.dim}sleeping ${SLOW_MS}ms so the 30s client timeout fires…${c.off}`]);
      return setTimeout(() => {
        log([`${c.am}-> too late: the browser already gave up${c.off}`]);
        send(res, 200, { text: 'You should never see this — the client timed out first.', mode: body.mode });
      }, SLOW_MS);
    }

    log([`${c.gr}-> 200 answer${c.off} ${c.dim}${note}${c.off}`]);
    return send(res, 200, {
      text: [
        `**Mock gateway reply** (${note})`,
        '',
        `- Received ${msg.length} characters in \`message\`.`,
        `- Mode: \`${body.mode}\``,
        `- History: ${(body.history || []).length} earlier turn(s)${body.history?.length ? `, first was \`${body.history[0].role}\`` : ''}.`,
        '- Your bearer token: ' + (bearer ? 'received ✓' : 'not sent (visitor is signed out or Supabase is unconfigured)'),
        '',
        'Point `VITE_DANTECH_ENDPOINT` at the real gateway in `server/ai-gateway.example.mjs` to answer with a model instead.',
      ].join('\n'),
      sources: [{ title: 'mock://lesson-1', url: 'https://example.org/mock' }],
      mode: body.mode,
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`${c.cy}[mock-dantech-gateway]${c.off} http://localhost:${PORT}/api/dantech/chat`);
  console.log(`${c.dim}  requireAuth=${REQUIRE_AUTH ? 'yes (401 for anonymous)' : 'no'}  slowDelay=${SLOW_MS}ms${c.off}`);
  console.log(`${c.dim}  next: VITE_DANTECH_ENDPOINT=http://localhost:${PORT}/api/dantech/chat npm run dev${c.off}`);
});
