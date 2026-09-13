// ============================================================
// Seed-chain verification (PGlite)
// ------------------------------------------------------------
//   cd supabase/verify && npm install && npm run verify:seed
//
// Proves the sequence an administrator is told to run actually produces a
// working, non-empty storefront — migrations 001-005, then the three seed
// files. This is the chain that previously ended in "no courses visible"
// (everything seeded as an unpublished draft) and "no admin can log in"
// (nothing ever promotes a profile).
//
// Caveat, same as run.mjs: PGlite is a superuser, so RLS *enforcement* is not
// exercised here. We assert the row-level facts RLS depends on (published
// flags, curriculum existence, roles).
// ============================================================
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(p, 'utf8');

const db = new PGlite();
await db.exec(read(join(here, 'stubs.sql')));

let pass = 0;
let fail = 0;
const one = async (sql, p = []) => (await db.query(sql, p)).rows[0];
const count = async (sql, p = []) => Number((await one(sql, p)).n);
async function t(name, fn) {
  try {
    await fn();
    pass++;
    console.log('PASS', name);
  } catch (e) {
    fail++;
    console.log('FAIL', name, '-', String(e.message || e).split('\n')[0]);
  }
}
const assert = (c, msg) => { if (!c) throw new Error(msg || 'assertion failed'); };
async function tErr(name, fn, match) {
  try {
    await fn();
    fail++;
    console.log('FAIL', name, '- expected an error, got success');
  } catch (e) {
    const msg = String(e.message || e);
    if (match && !msg.includes(match)) {
      fail++;
      console.log('FAIL', name, '- wrong error:', msg.split('\n')[0]);
    } else {
      pass++;
      console.log('PASS', name);
    }
  }
}

// ---------- 1. migrations ----------
for (const f of [
  '001_lms_core.sql', '002_phase2_community.sql', '003_production_backend.sql',
  '004_notify_and_counts.sql', '005_showcase_reads.sql',
]) {
  await db.exec(read(join(here, '../migrations', f)));
}
console.log('migrations 001-005 applied clean');

// ---------- 2. catalog seed ----------
await db.exec(read(join(here, '../seed/seed_12_courses.sql')));

await t('seed creates the 12 launch courses', async () => {
  const n = await count(`select count(*)::int as n from courses`);
  assert(n === 12, `expected 12 courses, got ${n}`);
});

await t('categories are seeded', async () => {
  const n = await count(`select count(*)::int as n from categories`);
  assert(n >= 7, `expected >=7 categories, got ${n}`);
});

await t('site_settings row exists for the settings screen', async () => {
  const row = await one(`select id from site_settings where id = 1`);
  assert(row, 'site_settings row 1 missing (migration 002 inserts it)');
});

// This is the documented failure mode: seeded, but invisible to visitors.
await t('seeded catalog starts unpublished (RLS hides it from visitors)', async () => {
  const n = await count(`select count(*)::int as n from courses where published`);
  assert(n === 0, `expected 0 published before publish_courses.sql, got ${n}`);
});

// ---------- 3. curriculum seed ----------
await db.exec(read(join(here, '../seed/seed_curriculum.sql')));

await t('curriculum seed creates modules and lessons', async () => {
  const m = await count(`select count(*)::int as n from course_modules`);
  const l = await count(`select count(*)::int as n from course_lessons`);
  assert(m === 15, `expected 15 modules, got ${m}`);
  assert(l === 26, `expected 26 lessons, got ${l}`);
});

await t('every lesson is attached to a module of its own course', async () => {
  const bad = await count(`
    select count(*)::int as n from course_lessons l
    join course_modules m on m.id = l.module_id
    where m.course_id <> l.course_id`);
  assert(bad === 0, `${bad} lessons point at the wrong course`);
});

await t('lesson types satisfy the video/text check constraint', async () => {
  const bad = await count(`select count(*)::int as n from course_lessons where type not in ('video','text')`);
  assert(bad === 0, `${bad} lessons have an invalid type`);
});

await t('no placeholder video rows are seeded', async () => {
  const n = await count(`select count(*)::int as n from course_videos`);
  assert(n === 0, `expected 0 course_videos, got ${n} (placeholder URLs must not ship)`);
});

await t('lessons_count trigger keeps the card totals in sync', async () => {
  const row = await one(`select lessons_count from courses where slug = 'ai-video-content-creation'`);
  assert(Number(row.lessons_count) === 9, `expected 9 lessons on ai-video-content-creation, got ${row.lessons_count}`);
});

await t('text bodies are stored for enrolled-only reading', async () => {
  const n = await count(`select count(*)::int as n from course_content where body_markdown <> ''`);
  assert(n >= 1, `expected at least one lesson body, got ${n}`);
});

// ---------- 4. idempotency ----------
await db.exec(read(join(here, '../seed/seed_curriculum.sql')));
await db.exec(read(join(here, '../seed/seed_12_courses.sql')));

await t('re-running the seeds does not duplicate curriculum', async () => {
  const m = await count(`select count(*)::int as n from course_modules`);
  const l = await count(`select count(*)::int as n from course_lessons`);
  const c = await count(`select count(*)::int as n from courses`);
  assert(m === 15 && l === 26 && c === 12, `got ${c} courses / ${m} modules / ${l} lessons`);
});

// ---------- 5. publish ----------
await db.exec(read(join(here, '../seed/publish_courses.sql')));

await t('publish_courses makes the storefront non-empty', async () => {
  const n = await count(`select count(*)::int as n from courses where published`);
  assert(n > 0, 'still zero published courses — visitors would see an empty catalog');
});

await t('only courses that have curriculum get published', async () => {
  const bad = await count(`
    select count(*)::int as n from courses c
    where c.published
      and not exists (select 1 from course_modules m where m.course_id = c.id)`);
  assert(bad === 0, `${bad} published courses have no modules (empty shells)`);
});

await t('re-running publish_courses is stable', async () => {
  const before = await count(`select count(*)::int as n from courses where published`);
  await db.exec(read(join(here, '../seed/publish_courses.sql')));
  const after = await count(`select count(*)::int as n from courses where published`);
  assert(before === after, `published count moved from ${before} to ${after}`);
});

// ---------- 6. admin bootstrap ----------
const ADMIN_EMAIL = 'owner@wolidantech.com';
await db.exec(`insert into auth.users (id, email, raw_user_meta_data)
  values ('99999999-9999-9999-9999-999999999999', '${ADMIN_EMAIL}', '{"full_name":"Site Owner"}')`);

await t('signup trigger creates the profile as a student', async () => {
  const row = await one(`select role, full_name from profiles where email = $1`, [ADMIN_EMAIL]);
  assert(row, 'no profile row — migration 003 trigger did not fire');
  assert(row.role === 'student', `expected student, got ${row.role}`);
  assert(row.full_name === 'Site Owner', `full_name not carried over: ${row.full_name}`);
});

const makeAdmin = read(join(here, '../seed/make_admin.sql'))
  .replace('you@example.com', ADMIN_EMAIL);

await t('make_admin promotes that profile to admin', async () => {
  await db.exec(makeAdmin);
  const row = await one(`select role, banned from profiles where email = $1`, [ADMIN_EMAIL]);
  assert(row.role === 'admin', `expected admin, got ${row.role}`);
  assert(row.banned === false, 'admin left banned');
});

await t('promoted admin satisfies is_admin() used by every write policy', async () => {
  await db.exec(`SET app.session_uid = '99999999-9999-9999-9999-999999999999'`);
  const row = await one(`select public.is_admin() as admin`);
  assert(row.admin === true, 'is_admin() returned false for the promoted profile');
  await db.exec(`SET app.session_uid = ''`);
});

await tErr('make_admin refuses to run with the placeholder email', async () => {
  await db.exec(read(join(here, '../seed/make_admin.sql')));
}, 'Edit the TARGET EMAIL line first');

await tErr('make_admin reports a missing profile clearly', async () => {
  await db.exec(makeAdmin.replace(ADMIN_EMAIL, 'nobody@nowhere.test'));
}, 'No profile row for');

// ---------- summary ----------
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
