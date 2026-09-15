// ============================================================
// Curriculum seed benchmark (PGlite)
// ------------------------------------------------------------
//   cd supabase/verify && npm run bench:seed        # times ./seed_curriculum.sql
//   node bench-seed.mjs <file.sql> ...              # compare several shapes
//
// Measures what an operator actually feels in the Supabase SQL Editor:
//   * bytes + statements the browser has to send/highlight
//   * wall time to execute the script end to end
// Every script is applied to a fresh database migrated 001-009 + the 12-course
// catalog, so the numbers are comparable run to run.
// ============================================================
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(p, 'utf8');
const MIGRATIONS = [
  '001_lms_core.sql', '002_phase2_community.sql', '003_production_backend.sql',
  '004_notify_and_counts.sql', '005_showcase_reads.sql', '006_payment_notes.sql',
  '007_classroom_upgrade.sql', '008_cv_builder_and_study_tools.sql',
  '009_fix_is_admin_recursion.sql',
];

/** Statement count the way the dashboard counts them: top-level `;` terminators. */
const stats = (sql) => ({
  bytes: Buffer.byteLength(sql, 'utf8'),
  lines: sql.split('\n').length,
  statements: (sql.match(/;/g) || []).length,
});

async function migrate(db) {
  await db.exec(read(join(here, 'stubs.sql')));
  for (const f of MIGRATIONS) await db.exec(read(join(here, '../migrations', f)));
  await db.exec(read(join(here, '../seed/seed_12_courses.sql')));
}

const files = process.argv.slice(2);
if (!files.length) files.push(join(here, '../seed/seed_curriculum.sql'));

for (const file of files) {
  const path = resolve(file);
  const sql = read(path);
  const s = stats(sql);
  const db = new PGlite();
  await migrate(db);

  const t0 = performance.now();
  await db.exec(sql);
  const cold = performance.now() - t0;

  const t1 = performance.now();
  await db.exec(sql);
  const rerun = performance.now() - t1;

  const one = async (q) => Number((await db.query(q)).rows[0].n);
  const out = {
    file: path.split('/').pop(),
    lines: s.lines,
    kb: Math.round(s.bytes / 1024),
    statements: s.statements,
    coldRunMs: Math.round(cold),
    idempotentRerunMs: Math.round(rerun),
    modules: await one('select count(*)::int as n from course_modules'),
    lessons: await one('select count(*)::int as n from course_lessons'),
    bodies: await one('select count(*)::int as n from course_content'),
    videos: await one('select count(*)::int as n from course_videos'),
    resources: await one('select count(*)::int as n from course_lessons where jsonb_array_length(resources) >= 1'),
    quizzes: await one('select count(*)::int as n from quizzes'),
    questions: await one('select count(*)::int as n from quiz_questions'),
    projects: await one('select count(*)::int as n from assignments'),
  };
  console.table([out]);
  await db.exec('select 1');
  await (await db.waitClosed?.()) ?? Promise.resolve();
}
console.log('\nExpected row counts (either shape): 48 modules / 192 lessons / 192 bodies / 192 videos / 12 quizzes / 120 questions / 12 projects');
