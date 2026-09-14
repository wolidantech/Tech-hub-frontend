#!/usr/bin/env node
// ============================================================
// DEV-ONLY mock Supabase (PostgREST + GoTrue + Storage) backed by PGlite.
// ------------------------------------------------------------
// This is NOT production infrastructure and is never deployed. It exists so
// the real frontend code path (supabase-js queries, RLS-aware SQL functions,
// the actual schema from supabase/migrations 001-009 and the ACTUAL production
// seed setup_full_catalog.sql) can be exercised end-to-end in a browser
// without a live Supabase project. Everything the app reads/writes goes
// through real Postgres execution.
//
//   node tools/mock-supabase.mjs            # http://127.0.0.1:54321
//   DEMO_ENROLL=1 node tools/mock-supabase.mjs  # also creates a demo student
//
// Auth: any email/password works (first signup wins); demo accounts below.
// Storage: files land in /tmp/mock-storage (Range-supported video streaming).
// ============================================================
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { mkdirSync, existsSync, statSync, createReadStream } from 'node:fs';
import { join, extname } from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
const { PGlite } = await (async () => {
  try { return await import('@electric-sql/pglite'); }
  catch { return await import(new URL('../supabase/verify/node_modules/@electric-sql/pglite/dist/index.js', import.meta.url)); }
})();

const PORT = Number(process.env.MOCK_PORT || 54321);
const ROOT = new URL('..', import.meta.url).pathname;
const STORAGE_DIR = process.env.MOCK_STORAGE_DIR || '/tmp/mock-storage';
mkdirSync(STORAGE_DIR, { recursive: true });

const b64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const makeJwt = (payload) => `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url(payload)}.sig`;

// ---------- database bootstrap ----------
const db = new PGlite({ dataDir: join(ROOT, '.mockdb') });
const MIG_DIR = join(ROOT, 'supabase/migrations');
const SEED_DIR = join(ROOT, 'supabase/seed');
const read = (p) => readFileSync(p, 'utf8');

// queue: PGlite is a single connection; serialize all statement groups
let chain = Promise.resolve();
const tx = (fn) => { chain = chain.then(fn, fn); return chain; };

const alreadyMigrated = (await db.query('select to_regclass($1) as r', ['public.courses'])).rows[0].r;
await tx(async () => {
  if (!alreadyMigrated) {
    await db.exec(read(join(ROOT, 'supabase/verify/stubs.sql')));
    for (const f of ['001_lms_core.sql', '002_phase2_community.sql', '003_production_backend.sql',
      '004_notify_and_counts.sql', '005_showcase_reads.sql', '006_payment_notes.sql',
      '007_classroom_upgrade.sql', '008_cv_builder_and_study_tools.sql', '009_classroom_curriculum.sql']) {
      await db.exec(read(join(MIG_DIR, f)));
    }
  }
  await db.exec(`
    alter table auth.users add column if not exists encrypted_password text default '';
    create schema if not exists mock;
    create table if not exists mock.users_pw (email text primary key, password text, uid uuid);
  `);
});

let seeded = false;
try {
  const r = await tx(() => db.query('select count(*)::int as n from courses'));
  if (r.rows[0].n === 0) {
    await tx(() => db.exec(read(join(SEED_DIR, 'setup_full_catalog.sql'))));
    seeded = true;
  }
} catch (e) { console.log('[mock] catalog seed skipped:', String(e.message).split('\n')[0]); }

// ---------- classroom demo fixtures (test data for the E2E walkthrough) ----------
await tx(async () => {
 try {
  const c = (await db.query(`select id from courses where published = true order by created_at limit 1`)).rows[0];
  if (!c) return;
  const cid = c.id;
  // Topic layer + practical + downloadable resource on the first lesson, so the
  // full COURSE→MODULE→TOPIC→LESSON→CONTENT→RESOURCES→PRACTICAL chain is live.
  const less = (await db.query(`
    select le.id, le.module_id from course_lessons le
    where le.course_id = $1 order by le.position limit 1`, [cid])).rows[0];
  if (!less) return;
  const topicName = 'Getting oriented (demo topic)';
  await db.query(`insert into course_topics (course_id, module_id, title, position)
    select $1, $2, $3, 0
    where not exists (select 1 from course_topics t where t.module_id = $2 and t.title = $3)`,
  [cid, less.module_id, topicName]);
  await db.query(`update course_lessons le set topic_id = (select t.id from course_topics t where t.module_id = le.module_id and t.title = $2)
    where le.id = $1`, [less.id, topicName]);
  await db.query(`insert into lesson_practicals
    (lesson_id, course_id, module_id, title, objective, scenario, instructions, expected_output, materials, observation, questions, safety, estimated_time, status)
    select $1,$2,$3,'Hands-on setup check (demo)','Verify your tools are ready','You just joined the course and must check your setup.',
      '1. Install the required tool
2. Open the sample file
3. Record what you see','The sample file opens and you can describe one change you made',
      '["Computer or phone","Free account on the course tool"]'::jsonb,
      'Note in a few sentences what the sample file contains.',
      '["What shortcut surprised you?","What will you build first?"]'::jsonb,
      'Follow the tool''s official safety and privacy guidance.', 15, 'PUBLISHED'
    where not exists (select 1 from lesson_practicals p where p.lesson_id = $1)`,
  [less.id, cid, less.module_id]);
  await db.query(`insert into course_resources (course_id, lesson_id, title, description, resource_type, is_external, url, is_approved)
    select $1,$2,'Official documentation (demo)','Canonical docs for this lesson.','DOCUMENTATION',true,'https://supabase.com/docs',true
    where not exists (select 1 from course_resources r where r.lesson_id = $2 and r.title = 'Official documentation (demo)')`,
  [cid, less.id]);
 } catch (e) { console.log('[mock] fixture skipped:', String(e.message).split('\n')[0]); }
});

// demo accounts (dev only)
async function ensureUserRaw(email, password, fullName, role) {
  const existing = (await db.query('select uid as id from mock.users_pw where email=$1', [email])).rows[0];
  if (existing) return existing.id;
  const uid = randomUUID();
  await db.query(`insert into auth.users (id, email, raw_user_meta_data, encrypted_password)
    values ($1,$2,$3,'mock')`, [uid, email, JSON.stringify({ full_name: fullName })]);
  if (role === 'admin') await db.query(`update profiles set role='admin' where id=$1`, [uid]);
  await db.query(`insert into mock.users_pw (email,password,uid) values ($1,$2,$3)`, [email, password, uid]);
  return uid;
}
const ensureUser = (email, password, fullName, role) => tx(() => ensureUserRaw(email, password, fullName, role));
const DEMO_STU = await ensureUser('ada@example.com', 'demo1234', 'Ada Lovelace', 'student');
const DEMO_ADM = await ensureUser('admin@wolidantech.com', 'demo1234', 'Site Admin', 'admin');
await tx(async () => {
  const c = (await db.query('select id from courses where published = true order by created_at limit 1')).rows[0];
  if (c) {
    await db.query(`insert into enrollments (user_id, course_id, status, method)
      values ($1,$2,'active','admin_grant') on conflict do nothing`, [DEMO_STU, c.id]);
  }
});
console.log(`[mock] catalog ${seeded ? 'seeded from setup_full_catalog.sql' : 'already present'}; demo login ada@example.com / demo1234 (student, enrolled), admin@wolidantech.com / demo1234`);

// ---------- PostgREST subset ----------
const IDENT = /^[a-z_][a-z0-9_]*$/i;
const VAL = (v) => (v === undefined || v === null ? null : typeof v === 'object' ? JSON.stringify(v) : v);

function parseSelect(sel) {
  if (!sel || sel === '*') return { cols: ['*'], embeds: [] };
  const cols = []; const embeds = [];
  sel.split(/,(?![^(]*\))/).map((t) => t.trim()).forEach((t) => {
    const m = t.match(/^([a-zA-Z_][\w]*)(?::([a-zA-Z_][\w]*))?\((.+)\)$/);
    if (m) embeds.push({ alias: m[1], table: m[2] || m[1], cols: m[3] });
    else if (IDENT.test(t)) cols.push(t);
  });
  return { cols: cols.length ? cols : ['*'], embeds };
}

function buildWhere(sp, params) {
  const conds = [];
  let i = 1;
  for (const [key, raw] of sp.entries()) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict'].includes(key)) continue;
    if (!IDENT.test(key)) throw { status: 400, code: 'PGRST400', message: `bad column ${key}` };
    for (const value of String(raw).includes('in.(') ? [String(raw)] : String(raw).split(',')) {
      const m = value.match(/^(eq|neq|gt|gte|lt|lte|like|ilike|in|is)\.(.*)$/s);
      if (!m) throw { status: 400, code: 'PGRST400', message: `bad filter on ${key}` };
      const [, op, v] = m;
      if (op === 'in') {
        const items = v.replace(/^\(|\)$/g, '').split(',').map((s) => s.replace(/^"|"$/g, ''));
        conds.push(`"${key}" in (${items.map(() => `$${i++}`).join(',')})`);
        items.forEach((x) => params.push(VAL(x)));
      } else if (op === 'is') {
        conds.push(v === 'null' ? `"${key}" is null` : `"${key}" is not null`);
      } else {
        const sqlOp = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=', like: 'like', ilike: 'ilike' }[op];
        conds.push(`"${key}" ${sqlOp} $${i++}`);
        params.push(VAL(v.replace(/^"|"$/g, '')));
      }
    }
  }
  return conds.length ? ` where ${conds.join(' and ')}` : '';
}

async function runSelect(table, sp, { single } = {}) {
  const { cols, embeds } = parseSelect(sp.get('select'));
  const params = [];
  const where = buildWhere(sp, params);
  let order = '';
  const ord = sp.get('order');
  if (ord) order = ' order by ' + ord.split(',').map((o) => {
    const [c, d, n] = o.split('.');
    return IDENT.test(c) ? `"${c}" ${d === 'desc' ? 'desc' : 'asc'}${n === 'nullslast' ? ' nulls last' : ''}` : '1';
  }).join(',');
  const limit = sp.get('limit') ? ` limit ${Number(sp.get('limit'))}` : '';
  const offset = sp.get('offset') ? ` offset ${Number(sp.get('offset'))}` : '';
  const selCols = cols.includes('*') ? '*'
    : cols.map((c) => `"${c}"`).concat(embeds.map((e) => `"${e.alias}_id"`)).join(',');
  const sql = `select ${selCols === '*' ? '*' : selCols} from "${table}"${where}${order}${limit}${offset}`;
  const { rows } = await db.query(sql, params);
  if (embeds.length) {
    for (const e of embeds) {
      const fk = rows[0] ? (IDENT.test(`${e.alias}_id`) && `${e.alias}_id` in rows[0] ? `${e.alias}_id` : `${e.table}_id`) : null;
      const ids = [...new Set(rows.map((r) => r[fk]).filter(Boolean))];
      let byId = new Map();
      if (ids.length) {
        const ph = ids.map((_, k) => `$${k + 1}`).join(',');
        const { rows: rel } = await db.query(`select ${e.cols.split(',').map((c) => `"${c.trim()}"`).join(',')} as data, id from "${e.table}" where id in (${ph})`, ids);
        byId = new Map(rel.map((r) => [r.id, r.data]));
      }
      rows.forEach((r) => { r[e.alias] = byId.get(r[fk]) || null; });
    }
  }
  if (single) {
    if (!rows.length) throw { status: 406, code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' };
    return rows[0];
  }
  return rows;
}

const pkCache = new Map();
async function pkCols(table) {
  if (pkCache.has(table)) return pkCache.get(table);
  const { rows } = await db.query(`select a.attname from pg_index i
    join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
    join pg_class c on c.oid = i.indrelid join pg_namespace n on n.oid = c.relnamespace
    where n.nspname='public' and c.relname=$1 and i.indisprimary`, [table]);
  const r = rows.map((x) => x.attname);
  pkCache.set(table, r);
  return r;
}

const server = createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const p = u.pathname;
  const json = (code, obj, headers = {}) => {
    const body = obj === undefined ? '' : JSON.stringify(obj);
    res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS,HEAD', ...headers });
    res.end(body);
  };
  if (req.method === 'OPTIONS') return json(204);
  const authHeader = req.headers.authorization || '';
  const claims = (() => { try { return JSON.parse(Buffer.from(authHeader.split(' ')[1].split('.')[1], 'base64').toString()); } catch { return null; } })();
  const uid = claims?.sub && claims?.role !== 'anon' ? claims.sub : '';
  await tx(async () => {
    try {
      await db.query('select set_config($1,$2,false)', ['app.session_uid', uid || '']);

      // ---------- auth ----------
      if (p === '/auth/v1/health') return json(200, { name: 'GoTrue', description: 'Mock' });
      if (p === '/auth/v1/settings') return json(200, { external: {}, disabled: false, mailer_autoconfirm: true });
      if (p === '/auth/v1/signup' && req.method === 'POST') {
        const body = await readBody(req);
        const email = String(body.email || '').toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(400, { error_description: 'Invalid email address' });
        let userRow = (await db.query('select uid from mock.users_pw where email=$1', [email])).rows[0];
        if (!userRow) {
          const id = await ensureUserRaw(email, String(body.password || ''), body.data?.full_name || email.split('@')[0], 'student');
          userRow = { uid: id };
        }
        const prof = (await db.query('select full_name, phone, role from profiles where id=$1', [userRow.uid])).rows[0] || {};
        const user = { id: userRow.uid, aud: 'authenticated', role: 'authenticated', email, email_confirmed_at: new Date().toISOString(), user_metadata: { full_name: prof.full_name, phone: prof.phone } };
        return json(200, { access_token: makeJwt({ sub: userRow.uid, email, role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 86400 }), token_type: 'bearer', expires_in: 86400, refresh_token: 'mock-refresh', user });
      }
      if (p.startsWith('/auth/v1/token') && req.method === 'POST') {
        const body = await readBody(req);
        const email = String(body.email || '').toLowerCase();
        const row = (await db.query('select uid, password from mock.users_pw where email=$1', [email])).rows[0];
        if (!row || row.password !== String(body.password || '')) return json(400, { error_description: 'Invalid login credentials' });
        const prof = (await db.query('select full_name, phone, role from profiles where id=$1', [row.uid])).rows[0] || {};
        const user = { id: row.uid, aud: 'authenticated', role: 'authenticated', email, user_metadata: { full_name: prof.full_name, phone: prof.phone }, app_metadata: { role: prof.role } };
        return json(200, { access_token: makeJwt({ sub: row.uid, email, role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 86400 }), token_type: 'bearer', expires_in: 86400, refresh_token: 'mock-refresh', user });
      }
      if (p === '/auth/v1/user') {
        if (!uid) return json(401, { error_description: 'Auth token not found' });
        const row = (await db.query('select id, email, full_name, phone from profiles where id=$1', [uid])).rows[0];
        if (!row) return json(401, { error_description: 'Session expired' });
        return json(200, { id: row.id, aud: 'authenticated', role: 'authenticated', email: row.email, user_metadata: { full_name: row.full_name, phone: row.phone } });
      }
      if (p === '/auth/v1/logout') return json(204);

      // ---------- storage ----------
      if (p.startsWith('/storage/v1/bucket')) {
        const id = p.split('/').pop();
        if (req.method === 'GET') return json(200, { id, name: id, public: id === 'avatars' || id === 'thumbnails' });
        if (req.method === 'POST') { mkdirSync(join(STORAGE_DIR, id), { recursive: true }); return json(200, { name: id }); }
      }
      let m = p.match(/^\/storage\/v1\/object\/sign\/([\w-]+)\/?(.*)$/);
      if (m) {
        const [, bucket, path] = m;
        if (req.method === 'POST' || req.method === 'GET') {
          if (req.method === 'POST') {
            const body = await readBody(req);
            const bpath = `${bucket}/${body.path || ''}`;
            tokens.set(`t-${bpath.replace(/\//g, '-')}`, bpath);
            const base = `${publicBase(req)}`;
            return json(200, { signedUrl: `${base}/storage/v1/object/sign/${bpath}?token=t-${bpath.replace(/\//g, '-')}`, token: 'mock', path: body.path });
          }
          const file = join(STORAGE_DIR, decodeURIComponent(path));
          return streamFile(req, res, file);
        }
      }
      m = p.match(/^\/storage\/v1\/object\/(public|auth)\/([\w-]+)\/(.+)$/);
      if (m && req.method === 'GET') return streamFile(req, res, join(STORAGE_DIR, m[2], decodeURIComponent(m[3])));
      m = p.match(/^\/storage\/v1\/object\/([\w-]+)\/(.+)$/);
      if (m && (req.method === 'POST' || req.method === 'PUT')) {
        const [, bucket, ...rest] = m;
        const path = decodeURIComponent(rest.join('/'));
        const buf = await readRaw(req);
        const dir = join(STORAGE_DIR, bucket, path.split('/').slice(0, -1).join('/'));
        mkdirSync(dir, { recursive: true });
        await writeFile(join(STORAGE_DIR, bucket, path), buf);
        return json(200, { Key: `${bucket}/${path}`, Id: randomUUID(), Path: `${bucket}/${path}` });
      }

      // ---------- rest ----------
      if (p === '/rest/v1/' || p === '/rest/v1') return json(200, { openapi: '3.0.1-mock', info: { title: 'Mock PostgREST' } });
      m = p.match(/^\/rest\/v1\/([a-z_][a-z0-9_]*)$/i);
      if (m) {
        const table = m[1];
        const { rows: t } = await db.query('select 1 from information_schema.tables where table_schema=$1 and table_name=$2', ['public', table]);
        if (!t.length) return json(404, { code: '42P01', message: `relation "public.${table}" does not exist`, hint: `Perhaps you meant the table 'public.${table}'` });
        const prefer = String(req.headers.prefer || '');
        const single = /vnd\.pgrst\.object/.test(String(req.headers.accept || ''));
        const wantCount = /count=exact/.test(prefer);
        if (req.method === 'GET' || req.method === 'HEAD') {
          const rows = await runSelect(table, u.searchParams, { single });
          const headers = wantCount ? { 'content-range': `0-${Math.max(0, rows.length - 1)}/${rows.length}`, 'content-profile': `public.${table}` } : {};
          return single ? json(200, rows, headers) : json(200, rows, headers);
        }
        if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT' || req.method === 'DELETE') {
          let body;
          if (req.method !== 'DELETE') body = await readBody(req);
          const rows0 = Array.isArray(body) ? body : body ? [body] : [];
          const params = [];
          const where = buildWhere(u.searchParams, params);
          let out;
          if (req.method === 'POST' || req.method === 'PUT') {
            let conflicts = u.searchParams.get('on_conflict') ? u.searchParams.get('on_conflict').split(',').map((c) => c.trim()) : null;
            if (!conflicts && prefer.includes('duplicates')) conflicts = (await pkCols(table));
            const merged = [];
            for (const r of rows0) {
              const cols = Object.keys(r).filter((c) => IDENT.test(c));
              const vals = cols.map((c) => `$${params.push(VAL(r[c]))}`).join(',');
              let sql = `insert into "${table}" (${cols.map((c) => `"${c}"`).join(',')}) values (${vals})`;
              if (prefer.includes('merge-duplicates')) {
                const pk = conflicts && conflicts.length ? conflicts : null;
                if (!pk) throw { status: 400, code: 'PGRST400', message: 'no conflict target' };
                const target = `(${pk.map((c) => `"${c}"`).join(',')})`;
                const upds = cols.filter((c) => !pk.includes(c)).map((c) => `"${c}"=excluded."${c}"`).join(',');
                sql += ` on conflict ${upds ? `${target} do update set ${upds}` : `${target} do nothing`}`;
              } else if (prefer.includes('ignore-duplicates')) {
                if (conflicts?.length) sql += ` on conflict (${conflicts.map((c) => `"${c}"`).join(',')}) do nothing`;
                else sql += ' on conflict do nothing';
              }
              sql += ' returning *';
              const rr = await db.query(sql, params.slice());
              if (rr.rows.length) merged.push(rr.rows[0]);
            }
            out = merged;
          } else if (req.method === 'PATCH') {
            const sets = [];
            for (const [k, v] of Object.entries(rows0[0] || {})) { if (IDENT.test(k)) sets.push(`"${k}"=$${params.push(VAL(v))}`); }
            if (!sets.length) return json(400, { message: 'no columns' });
            const rr = await db.query(`update "${table}" set ${sets.join(', ')}${where} returning *`, params);
            out = rr.rows;
          } else {
            const rr = await db.query(`delete from "${table}"${where} returning *`, params);
            out = rr.rows;
          }
          if (!prefer.includes('return=representation')) { res.writeHead(req.method === 'POST' ? 201 : 204, { 'access-control-allow-origin': '*' }); return res.end(); }
          if (single) {
            if (!out.length) return json(406, { code: 'PGRST116', message: '0 rows returned', details: '', hints: '' });
            return json(req.method === 'POST' ? 201 : 200, out[0]);
          }
          return json(req.method === 'POST' ? 201 : 200, out);
        }
      }
      m = p.match(/^\/rest\/v1\/rpc\/([a-z_][a-z0-9_]*)$/i);
      if (m && req.method === 'POST') {
        const fn = m[1];
        const body = await readBody(req);
        const keys = Object.keys(body || {});
        const params = keys.map((k) => { const v = body[k]; return v !== null && typeof v === 'object' ? JSON.stringify(v) : v; });
        const named = keys.map((k, i) => `${k} := $${i + 1}`).join(', ');
        const { rows: f } = await db.query('select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname=$1 and p.proname=$2', ['public', fn]);
        if (!f.length) return json(404, { code: 'PGRST202', message: `Could not find the function public.${fn}`, hint: `Perhaps try the function public.${fn}(1)` });
        try {
          const rr = await db.query(`select "${fn}"(${named}) as v`, params);
          let v = rr.rows[0]?.v;
          if (typeof v === 'string' && /^[[{]/.test(v)) { try { v = JSON.parse(v); } catch { /* keep text */ } }
          return json(200, v === undefined ? null : v);
        } catch (e) {
          const msg = String(e.message || '').replace(/^.*?: /, '');
          const code = /does not exist/.test(msg) ? 'PGRST202' : 'P0001';
          return json(400, { code, message: msg || 'function failed' });
        }
      }
      return json(404, { message: `mock: unhandled ${req.method} ${p}` });
    } catch (e) {
      if (e && e.code) return json(e.status || 400, { code: e.code, message: e.message });
      const msg = String(e?.message || e);
      // Postgres errors pass through with the code PostgREST would forward
      const code = e?.code || (/\bis not unique\b/.test(msg) ? '23505' : 'P0001');
      return json(400, { code, message: msg.replace(/^.*error: /, '') });
    }
  });
});

const tokens = new Map();
function publicBase(req) { return `http${req.headers['x-forwarded-proto'] === 'https' ? 's' : ''}://${req.headers.host}`; }
async function readRaw(req) { const chunks = []; for await (const c of req) chunks.push(c); return Buffer.concat(chunks); }
async function readBody(req) { const buf = await readRaw(req); if (!buf.length) return undefined; try { return JSON.parse(buf.toString()); } catch { return buf.toString(); } }
function streamFile(req, res, file) {
  if (!existsSync(file)) { res.writeHead(400, { 'access-control-allow-origin': '*' }); return res.end('{"statusCode":"404","error":"not found"}'); }
  const st = statSync(file);
  const type = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' }[extname(file)] || 'application/octet-stream';
  const range = req.headers.range;
  if (range) {
    const [, s, e] = range.match(/bytes=(\d*)-(\d*)/) || [];
    const start = Number(s || 0); const end = Math.min(e ? Number(e) : st.size - 1, st.size - 1);
    res.writeHead(206, { 'content-type': type, 'content-length': end - start + 1, 'content-range': `bytes ${start}-${end}/${st.size}`, 'accept-ranges': 'bytes', 'access-control-allow-origin': '*' });
    return createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'content-type': type, 'content-length': st.size, 'accept-ranges': 'bytes', 'access-control-allow-origin': '*' });
  return createReadStream(file).pipe(res);
}
server.listen(PORT, '0.0.0.0', () => console.log(`[mock] supabase mock on :${PORT}`));
