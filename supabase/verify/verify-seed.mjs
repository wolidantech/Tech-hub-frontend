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

await t('curriculum seed creates the full 12×4×4 catalog', async () => {
  const m = await count(`select count(*)::int as n from course_modules`);
  const l = await count(`select count(*)::int as n from course_lessons`);
  assert(m === 48, `expected 48 modules (12 courses × 4), got ${m}`);
  assert(l === 192, `expected 192 lessons (48 modules × 4), got ${l}`);
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

await t('every lesson ships a real video (no placeholders)', async () => {
  const n = await count(`select count(*)::int as n from course_videos`);
  assert(n === 192, `expected one video per lesson (192), got ${n}`);
  const placeholders = await count(
    `select count(*)::int as n from course_videos where url ilike '%dQw4w9WgXcQ%' or url is null or url = ''`
  );
  assert(placeholders === 0, `${placeholders} placeholder/empty video URLs must never ship`);
  const bad = await count(
    `select count(*)::int as n from course_videos
     where provider <> 'youtube' or url not like 'https://www.youtube.com/watch?v=%'`
  );
  assert(bad === 0, `${bad} videos are not real YouTube watch URLs`);
  const orphans = await count(
    `select count(*)::int as n from course_lessons l
     where not exists (select 1 from course_videos v where v.lesson_id = l.id)`
  );
  assert(orphans === 0, `${orphans} lessons have no video row`);
  const dupes = await count(
    `select count(*)::int as n from (
       select lesson_id, url from course_videos group by lesson_id, url having count(*) > 1
     ) d`
  );
  assert(dupes === 0, `${dupes} duplicated (lesson, url) video rows`);
});

await t('lessons_count trigger keeps the card totals in sync', async () => {
  const row = await one(`select lessons_count from courses where slug = 'ai-video-content-creation'`);
  assert(Number(row.lessons_count) === 16, `expected 16 lessons on ai-video-content-creation, got ${row.lessons_count}`);
});

await t('every lesson has a full teaching body (enrolled-only reading)', async () => {
  const n = await count(`select count(*)::int as n from course_content where length(body_markdown) > 300`);
  assert(n === 192, `expected 192 full lesson bodies, got ${n}`);
  const missing = await count(
    `select count(*)::int as n from course_lessons l
     where not exists (select 1 from course_content c where c.lesson_id = l.id and c.body_markdown <> '')`
  );
  assert(missing === 0, `${missing} lessons have no body`);
});

await t('every lesson carries curated resources', async () => {
  const n = await count(`select count(*)::int as n from course_lessons where jsonb_array_length(resources) >= 1`);
  assert(n === 192, `expected resources on all 192 lessons, got ${n}`);
});

// ---------- 4. idempotency ----------
await db.exec(read(join(here, '../seed/seed_curriculum.sql')));
await db.exec(read(join(here, '../seed/seed_12_courses.sql')));

await t('re-running the seeds does not duplicate curriculum', async () => {
  const m = await count(`select count(*)::int as n from course_modules`);
  const l = await count(`select count(*)::int as n from course_lessons`);
  const c = await count(`select count(*)::int as n from courses`);
  const v = await count(`select count(*)::int as n from course_videos`);
  assert(m === 48 && l === 192 && c === 12 && v === 192,
    `got ${c} courses / ${m} modules / ${l} lessons / ${v} videos`);
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

// ---------- 7. the one-step setup script, on a completely fresh database ----------
// This is exactly what an administrator pastes into the SQL Editor, so prove it
// works standalone: fresh DB, migrations only, then the single combined file.
const fresh = new PGlite();
await fresh.exec(read(join(here, 'stubs.sql')));
for (const f of [
  '001_lms_core.sql', '002_phase2_community.sql', '003_production_backend.sql',
  '004_notify_and_counts.sql', '005_showcase_reads.sql',
]) {
  await fresh.exec(read(join(here, '../migrations', f)));
}
await fresh.exec(read(join(here, '../seed/setup_full_catalog.sql')));

const fcount = async (sql) => Number((await fresh.query(sql)).rows[0].n);

await t('one-step setup yields a fully published catalog from scratch', async () => {
  const published = await fcount(`select count(*)::int as n from courses where published`);
  const total = await fcount(`select count(*)::int as n from courses`);
  assert(total === 12, `expected 12 courses, got ${total}`);
  assert(published === 12, `expected 12 published, got ${published}`);
});

await t('one-step setup leaves no course as an empty shell', async () => {
  const shells = await fcount(`
    select count(*)::int as n from courses c
    where c.published
      and not exists (select 1 from course_modules m where m.course_id = c.id)`);
  const noLessons = await fcount(`
    select count(*)::int as n from courses c
    where c.published and c.lessons_count = 0`);
  assert(shells === 0, `${shells} published courses have no modules`);
  assert(noLessons === 0, `${noLessons} published courses have no lessons`);
});

await t('one-step setup seeds bodies, resources and videos for every lesson', async () => {
  const bodies = await fcount(`select count(*)::int as n from course_content where length(body_markdown) > 300`);
  const videos = await fcount(`select count(*)::int as n from course_videos where url like 'https://www.youtube.com/watch?v=%'`);
  const resources = await fcount(`select count(*)::int as n from course_lessons where jsonb_array_length(resources) >= 1`);
  assert(bodies === 192, `expected 192 bodies, got ${bodies}`);
  assert(videos === 192, `expected 192 real videos, got ${videos}`);
  assert(resources === 192, `expected 192 lessons with resources, got ${resources}`);
});

await t('one-step setup is idempotent on re-run', async () => {
  await fresh.exec(read(join(here, '../seed/setup_full_catalog.sql')));
  const total = await fcount(`select count(*)::int as n from courses`);
  const lessons = await fcount(`select count(*)::int as n from course_lessons`);
  const videos = await fcount(`select count(*)::int as n from course_videos`);
  assert(total === 12 && lessons === 192 && videos === 192,
    `got ${total} courses / ${lessons} lessons / ${videos} videos`);
});

// ---------- summary ----------
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
