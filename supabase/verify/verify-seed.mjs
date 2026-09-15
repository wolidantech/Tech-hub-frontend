// ============================================================
// Seed-chain verification (PGlite)
// ------------------------------------------------------------
//   cd supabase/verify && npm install && npm run verify:seed
//
// Proves the sequence an administrator is told to run actually produces a
// working, non-empty storefront — migrations 001-010, then the catalog,
// curriculum, publish and learning-path seeds. This is the chain that previously ended in "no courses visible"
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
const EXPECTED_SLUGS = [
  'ai-video-content-creation',
  'video-editing-with-capcut',
  'graphic-design-with-canva',
  'digital-marketing',
  'mobile-application-development',
  'portfolio-creation',
  'frontend-web-development',
  'web-design-with-wordpress',
  'ui-ux-design-with-figma',
  'microsoft-excel',
  'microsoft-word',
  'microsoft-powerpoint',
].sort();
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
const MIGRATIONS = [
  '001_lms_core.sql', '002_phase2_community.sql', '003_production_backend.sql',
  '004_notify_and_counts.sql', '005_showcase_reads.sql', '006_payment_notes.sql',
  '007_classroom_upgrade.sql', '008_cv_builder_and_study_tools.sql',
  '009_fix_is_admin_recursion.sql',
  '010_certificate_fullname.sql',
];
for (const f of MIGRATIONS) {
  await db.exec(read(join(here, '../migrations', f)));
}
console.log('migrations 001-010 applied clean');

// ---------- 2. catalog seed ----------
await db.exec(read(join(here, '../seed/seed_12_courses.sql')));

await t('seed creates exactly the 12 expected launch slugs', async () => {
  const rows = (await db.query(`select slug from courses order by slug`)).rows.map(r => r.slug).sort();
  assert(rows.length === 12, `expected 12 courses, got ${rows.length}`);
  assert(JSON.stringify(rows) === JSON.stringify(EXPECTED_SLUGS),
    `slug mismatch: ${JSON.stringify(rows)}`);
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

await t('curriculum SQL matches the migrated module/lesson/content/video schema', async () => {
  const required = {
    course_modules: ['course_id', 'title', 'position'],
    course_lessons: ['module_id', 'course_id', 'title', 'type', 'duration', 'position', 'resources'],
    course_content: ['lesson_id', 'body_markdown'],
    course_videos: ['lesson_id', 'provider', 'url', 'status'],
  };
  for (const [table, columns] of Object.entries(required)) {
    const rows = (await db.query(`
      select column_name from information_schema.columns
      where table_schema = 'public' and table_name = $1
    `, [table])).rows.map(r => r.column_name);
    const missing = columns.filter(column => !rows.includes(column));
    assert(missing.length === 0, `${table} missing columns: ${missing.join(', ')}`);
  }
});

await t('each launch slug has 4 modules and 16 lessons', async () => {
  const rows = (await db.query(`
    select c.slug,
      (select count(*)::int from course_modules m where m.course_id = c.id) as modules,
      (select count(*)::int from course_lessons l where l.course_id = c.id) as lessons
    from courses c order by c.slug
  `)).rows;
  assert(rows.length === 12, `expected 12 inventory rows, got ${rows.length}`);
  for (const row of rows) {
    assert(Number(row.modules) === 4 && Number(row.lessons) === 16,
      `${row.slug}: expected 4 modules/16 lessons, got ${row.modules}/${row.lessons}`);
  }
});

await t('every lesson is attached to a module of its own course', async () => {
  const bad = await count(`
    select count(*)::int as n from course_lessons l
    join course_modules m on m.id = l.module_id
    where m.course_id <> l.course_id`);
  assert(bad === 0, `${bad} lessons point at the wrong course`);
});

await t('lesson types satisfy the classroom type constraint', async () => {
  const bad = await count(`select count(*)::int as n from course_lessons
    where type not in ('video','text','practical','quiz','assignment','project','resource')`);
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

await t('every capstone lesson is typed as a project', async () => {
  const n = await count(`select count(*)::int as n from course_lessons where type = 'project'`);
  assert(n === 12, `expected 12 project (capstone) lessons, got ${n}`);
});

await t('every course ships a final quiz with 10 answerable questions', async () => {
  const qz = await count(`select count(*)::int as n from quizzes where is_final and status = 'published'`);
  assert(qz === 12, `expected 12 published final quizzes, got ${qz}`);
  const total = await count(`select count(*)::int as n from quiz_questions`);
  assert(total === 120, `expected 120 questions, got ${total}`);
  const short = await count(`
    select count(*)::int as n from quizzes z
    where z.is_final and (select count(*) from quiz_questions qq where qq.quiz_id = z.id) <> 10`);
  assert(short === 0, `${short} quizzes do not have exactly 10 questions`);
  const unanswerable = await count(`
    select count(*)::int as n from quiz_questions qq
    where (qq.type = 'multiple_answer' and jsonb_array_length(qq.correct_answers) = 0)
       or (qq.type <> 'multiple_answer' and (qq.correct_answer is null or qq.correct_answer < 0))`);
  assert(unanswerable === 0, `${unanswerable} questions have no correct answer key`);
  const linked = await count(`select count(*)::int as n from quizzes where is_final and lesson_id is not null`);
  assert(linked === 12, `expected all final quizzes linked to their capstone lesson, got ${linked}`);
});

await t('every course ships a real final project assignment', async () => {
  const n = await count(`select count(*)::int as n from assignments where is_final_project and status = 'published'`);
  assert(n === 12, `expected 12 published final projects, got ${n}`);
  const thin = await count(`
    select count(*)::int as n from assignments
    where is_final_project and (coalesce(length(instructions), 0) < 100 or coalesce(length(required_output), 0) < 40)`);
  assert(thin === 0, `${thin} final projects lack real instructions/requirements`);
  const linked = await count(`select count(*)::int as n from assignments where is_final_project and lesson_id is not null`);
  assert(linked === 12, `expected final projects linked to capstone lessons, got ${linked}`);
});

await t('completion rules require lessons + quiz average + final project', async () => {
  const n = await count(`
    select count(*)::int as n from course_completion_rules
    where require_lessons_pct = 100 and require_quiz_avg = 70 and require_final_project`);
  assert(n === 12, `expected complete rules on all 12 courses, got ${n}`);
});

await t('lesson_activity (start/video tracking) exists with own-rows RLS', async () => {
  const t1 = await count(`select count(*)::int as n from information_schema.tables where table_name = 'lesson_activity'`);
  assert(t1 === 1, 'lesson_activity table missing (migration 007)');
  const pol = await count(`select count(*)::int as n from pg_policies where tablename = 'lesson_activity'`);
  assert(pol >= 1, 'lesson_activity has no RLS policy');
  const cols = await count(`select count(*)::int as n from information_schema.columns where table_name = 'lesson_activity' and column_name in ('started_at','video_seconds')`);
  assert(cols === 2, 'lesson_activity missing started_at/video_seconds');
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
// Model the live project's extra custom course: one empty draft must not be
// newly published, while an already-published row must never be unpublished.
await db.exec(`
  insert into courses (slug, title, published, archived) values
    ('empty-custom-draft', 'Empty custom draft', false, false),
    ('empty-custom-live', 'Empty custom live', true, false)
`);
await db.exec(read(join(here, '../seed/publish_courses.sql')));

await t('publish_courses makes the storefront non-empty', async () => {
  const n = await count(`select count(*)::int as n from courses where published`);
  assert(n > 0, 'still zero published courses — visitors would see an empty catalog');
});

await t('publish_courses newly publishes only draft courses that have modules', async () => {
  const launchPublished = await count(`
    select count(*)::int as n from courses c
    where c.slug = any($1::text[]) and c.published
      and exists (select 1 from course_modules m where m.course_id = c.id)
  `, [EXPECTED_SLUGS]);
  const emptyDraft = await one(`select published from courses where slug = 'empty-custom-draft'`);
  assert(launchPublished === 12, `expected 12 curriculum-backed launch courses, got ${launchPublished}`);
  assert(emptyDraft.published === false, 'empty custom draft was published');
});

await t('publish_courses never unpublishes an existing course', async () => {
  const row = await one(`select published from courses where slug = 'empty-custom-live'`);
  assert(row.published === true, 'existing published custom course was unpublished');
});

await t('re-running publish_courses is stable', async () => {
  const before = await count(`select count(*)::int as n from courses where published`);
  await db.exec(read(join(here, '../seed/publish_courses.sql')));
  const after = await count(`select count(*)::int as n from courses where published`);
  assert(before === after, `published count moved from ${before} to ${after}`);
});

// ---------- 5b. learning paths ----------
await db.exec(read(join(here, '../seed/seed_learning_paths.sql')));

await t('learning paths seed ships 4 published, multi-step paths', async () => {
  const n = await count(`select count(*)::int as n from learning_paths where is_published`);
  assert(n === 4, `expected 4 published learning paths, got ${n}`);
  const titles = ['Web & Mobile Developer', 'Digital Creator', 'Office Productivity Pro', 'Digital Business Growth'];
  for (const t of titles) {
    const c = await count(`select count(*)::int as n from learning_paths where title = $1`, [t]);
    assert(c === 1, `learning path "${t}" missing or duplicated`);
  }
});

await t('every learning path step resolves to a real course', async () => {
  const bad = await count(`
    select count(*)::int as n from learning_paths lp
    cross join lateral unnest(lp.course_ids) as cid
    where not exists (select 1 from courses c where c.id = cid)`);
  assert(bad === 0, `${bad} path steps point at courses that do not exist`);
  const short = await count(`select count(*)::int as n from learning_paths where array_length(course_ids, 1) < 3`);
  assert(short === 0, `${short} paths have fewer than 3 steps`);
});

await t('re-running the learning paths seed never duplicates', async () => {
  await db.exec(read(join(here, '../seed/seed_learning_paths.sql')));
  const n = await count(`select count(*)::int as n from learning_paths`);
  assert(n === 4, `expected 4 paths after re-run, got ${n}`);
});

await t('operational verification SQL executes read-only against the complete seed chain', async () => {
  await db.exec(read(join(here, 'verify_curriculum.sql')));
});

await t('CV builder + study tools tables exist for the seeded storefront', async () => {
  for (const tbl of ['cv_documents', 'study_notes', 'study_bookmarks']) {
    const c = await count(`select count(*)::int as n from information_schema.tables where table_name = $1`, [tbl]);
    assert(c === 1, `${tbl} missing (migration 008)`);
  }
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
for (const f of MIGRATIONS) await fresh.exec(read(join(here, '../migrations', f)));
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

await t('one-step setup seeds bodies, resources, videos, quizzes and projects', async () => {
  const bodies = await fcount(`select count(*)::int as n from course_content where length(body_markdown) > 300`);
  const videos = await fcount(`select count(*)::int as n from course_videos where url like 'https://www.youtube.com/watch?v=%'`);
  const resources = await fcount(`select count(*)::int as n from course_lessons where jsonb_array_length(resources) >= 1`);
  const quizzes = await fcount(`select count(*)::int as n from quizzes where is_final`);
  const questions = await fcount(`select count(*)::int as n from quiz_questions`);
  const projects = await fcount(`select count(*)::int as n from assignments where is_final_project`);
  assert(bodies === 192, `expected 192 bodies, got ${bodies}`);
  assert(videos === 192, `expected 192 real videos, got ${videos}`);
  assert(resources === 192, `expected 192 lessons with resources, got ${resources}`);
  assert(quizzes === 12 && questions === 120, `expected 12 quizzes / 120 questions, got ${quizzes} / ${questions}`);
  assert(projects === 12, `expected 12 final projects, got ${projects}`);
});

await t('one-step setup is idempotent on re-run', async () => {
  await fresh.exec(read(join(here, '../seed/setup_full_catalog.sql')));
  const total = await fcount(`select count(*)::int as n from courses`);
  const lessons = await fcount(`select count(*)::int as n from course_lessons`);
  const videos = await fcount(`select count(*)::int as n from course_videos`);
  const paths = await fcount(`select count(*)::int as n from learning_paths`);
  assert(total === 12 && lessons === 192 && videos === 192,
    `got ${total} courses / ${lessons} lessons / ${videos} videos`);
  assert(paths === 4, `expected 4 learning paths after re-run, got ${paths}`);
});

await t('one-step setup ships 4 learning paths wired to real courses', async () => {
  const paths = await fcount(`select count(*)::int as n from learning_paths where is_published`);
  assert(paths === 4, `expected 4 published paths, got ${paths}`);
  const broken = await fcount(`
    select count(*)::int as n from learning_paths lp
    cross join lateral unnest(lp.course_ids) as cid
    where not exists (select 1 from courses c where c.id = cid)`);
  assert(broken === 0, `${broken} path steps reference nonexistent courses`);
});

// ---------- 8. consolidated catalog (the live project's topology) ----------
// The seed chain seeds the five custom courses under their LIVE twin slugs.
// On the live project the five original launch slugs also exist — as ARCHIVED
// duplicates that must never surface. Simulate that exact topology: run the
// full chain, drop the archived originals in beside the seeded twins, then
// prove the learning paths point ONLY at the visible twins.
const CONSOLIDATED = {
  'graphic-design-canva': 'graphic-design-with-canva',
  'mobile-app-development': 'mobile-application-development',
  'ui-ux-design-figma': 'ui-ux-design-with-figma',
  'video-editing-capcut': 'video-editing-with-capcut',
  'web-design-wordpress': 'web-design-with-wordpress',
};
const live = new PGlite();
await live.exec(read(join(here, 'stubs.sql')));
for (const f of MIGRATIONS) await live.exec(read(join(here, '../migrations', f)));
await live.exec(read(join(here, '../seed/setup_full_catalog.sql')));
// The legacy duplicates as they exist on live: archived, unpublished, and
// never referenced by anything the seed chain writes.
await live.exec(`
  insert into courses (slug, title, published, archived)
  select t.orig, 'Archived duplicate', false, true
    from (values ${Object.keys(CONSOLIDATED).map((o) => `('${o}')`).join(', ')}) as t(orig)`);

const lcount = async (sql, p = []) => Number((await live.query(sql, p)).rows[0].n);

await t('consolidated catalog keeps exactly the 12 live courses visible', async () => {
  const visible = await lcount(`select count(*)::int as n from courses where published and not archived`);
  assert(visible === 12, `expected 12 visible courses, got ${visible}`);
  const total = await lcount(`select count(*)::int as n from courses`);
  assert(total === 17, `expected 17 rows incl. 5 archived duplicates, got ${total}`);
});

await t('learning paths resolve every step to the live twin, not the archived original', async () => {
  const rows = (await live.query(`
    select lp.title, cid.i, c.slug from learning_paths lp
    cross join lateral unnest(lp.course_ids) with ordinality as cid(id, i)
    join courses c on c.id = cid.id order by lp.title, cid.i`)).rows;
  assert(rows.length === 17, `expected 17 steps across 4 paths, got ${rows.length}`);
  for (const [orig, twin] of Object.entries(CONSOLIDATED)) {
    const onTwin = rows.filter((r) => r.slug === twin).length;
    const onOrig = rows.filter((r) => r.slug === orig).length;
    assert(onOrig === 0, `a step still points at the archived ${orig}`);
    assert(onTwin >= 1, `no path step resolved to the live twin ${twin}`);
  }
  const webMobile = rows.filter((r) => r.title === 'Web & Mobile Developer').map((r) => r.slug);
  assert(JSON.stringify(webMobile) === JSON.stringify([
    'frontend-web-development', 'web-design-with-wordpress', 'ui-ux-design-with-figma',
    'mobile-application-development', 'portfolio-creation',
  ]), `unexpected builder track: ${webMobile.join(' -> ')}`);
});

await t('no path step points at an archived or unpublished course', async () => {
  const bad = await lcount(`
    select count(*)::int as n from learning_paths lp
    cross join lateral unnest(lp.course_ids) as cid
    join courses c on c.id = cid
    where c.archived or not c.published`);
  assert(bad === 0, `${bad} path step(s) point at courses students cannot open`);
});

await t('re-running the paths seed on the consolidated catalog stays at 4 paths', async () => {
  await live.exec(read(join(here, '../seed/seed_learning_paths.sql')));
  const n = await lcount(`select count(*)::int as n from learning_paths`);
  assert(n === 4, `expected 4 paths after re-run, got ${n}`);
});

await t('paths seed aborts loudly when a step matches no visible course', async () => {
  const stranded = new PGlite();
  await stranded.exec(read(join(here, 'stubs.sql')));
  for (const f of MIGRATIONS) await stranded.exec(read(join(here, '../migrations', f)));
  await stranded.exec(read(join(here, '../seed/seed_12_courses.sql')));
  await stranded.exec(read(join(here, '../seed/publish_courses.sql')));
  await stranded.exec(`update courses set archived = true where slug = 'video-editing-with-capcut'`);
  let message = '';
  try {
    await stranded.exec(read(join(here, '../seed/seed_learning_paths.sql')));
  } catch (e) {
    message = String(e.message || e);
  }
  assert(message.includes('matches no published, unarchived course'),
    `expected a loud abort naming the unresolvable step, got: ${message.split('\n')[0]}`);
  const seeded = Number((await stranded.query(`select count(*)::int as n from learning_paths`)).rows[0].n);
  assert(seeded === 0, `a broken path was written before the abort (${seeded} rows)`);
});

// ---------- summary ----------
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
