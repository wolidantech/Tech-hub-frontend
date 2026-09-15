#!/usr/bin/env node
// ============================================================
// Generates supabase/seed/seed_curriculum.sql from src/data/courses.js
// ------------------------------------------------------------
// src/data/courses.js carries the complete 12-course catalog — for every
// course: 4 modules × 4 lessons of professional lesson bodies (objectives,
// plain-English teaching, real-world example, practical exercise, checklist),
// one curated REAL YouTube video per lesson, and curated resources per
// lesson. The catalog itself lives in src/data/curriculum/<slug>.js. The app
// reads curriculum from the database (source of truth); this script turns
// the catalog into idempotent SQL for the Supabase SQL Editor.
//
//   node supabase/seed/generate_curriculum.mjs
//
// FAST BY DESIGN. The previous shape emitted one statement per lesson per
// table (~1,570 statements for 12×4×4 lessons). The SQL Editor has to parse,
// highlight and render a result grid for every one of those, so a 900 KB paste
// could sit on "Running query…" for minutes. This generator emits instead:
//
//   * 3 temp payload tables, each filled by ONE multi-row VALUES insert, and
//   * ~15 set-based statements that fan that payload out over the real tables.
//
// Same rows, same matching keys, same idempotency — ~60× fewer statements.
//
// What gets seeded per lesson:
//   * course_modules / course_lessons rows (matched by titles → idempotent)
//   * course_content body_markdown (upsert on lesson_id)
//   * course_lessons.resources jsonb (updated to the canonical list)
//   * course_videos row — provider 'youtube', status 'published', matched on
//     (lesson_id, url) so re-runs never duplicate
//
// Every video URL in the curriculum is a verified, real YouTube watch URL
// for the lesson's topic. Placeholder videos are banned by policy and by
// supabase/verify/verify-seed.mjs.
//
// Assessments (from src/data/assessments.js) are also seeded per course:
//   * one FINAL quiz (10 real questions, passing score 70, linked to the
//     capstone lesson), questions matched by text so re-runs never duplicate
//   * one FINAL PROJECT assignment (real brief, linked to the capstone lesson)
//   * course_completion_rules: 100% lessons + quiz avg >= 70 + final project
//     approved -> the server-side certificate trigger then issues the cert.
// The last lesson of every course is typed 'project' (capstone).
// ============================================================
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'path';
import { coursesData } from '../../src/data/courses.js';
import { finalQuizzes, finalProjects } from '../../src/data/assessments.js';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'seed_curriculum.sql');

/** SQL string literal — single quotes doubled, safe for arbitrary markdown. */
const q = (v) => `'${String(v ?? '').replace(/'/g, "''")}'`;

/** SQL jsonb literal (jsonb cast baked in). */
const jsonb = (v) => `${q(JSON.stringify(v))}::jsonb`;

/** Curated {title,url,type} resources, canonically filtered. */
const canonicalResources = (resources) =>
  (resources || []).filter((r) => r && r.url).map((r) => ({
    title: r.title || 'Resource',
    url: r.url,
    type: r.type || 'link',
  }));

const launchSlugs = coursesData
  .filter((course) => (course.curriculum || []).length)
  .map((course) => course.slug);

/** True for the capstone lesson: last module, last lesson of a course. */
const isCapstone = (curriculum, mi, li) =>
  mi === curriculum.length - 1 && li === (curriculum[mi].lessons || []).length - 1;

// ============================================================ payload
const lessons = [];
const quizzes = [];
const projects = [];
const stats = { courses: 0, modules: 0, bodies: 0, resources: 0, videos: 0, questions: 0 };

for (const course of coursesData) {
  const curriculum = course.curriculum || [];
  if (!curriculum.length) continue;
  stats.courses += 1;
  const capstoneTitle = (curriculum[curriculum.length - 1]?.lessons || []).slice(-1)[0]?.title || null;

  curriculum.forEach((mod, mi) => {
    stats.modules += 1;
    (mod.lessons || []).forEach((lesson, li) => {
      const capstone = isCapstone(curriculum, mi, li);
      const type = lesson.type === 'text' ? 'text' : capstone ? 'project' : 'video';
      const body = (lesson.content || lesson.textContent || '').trim();
      const res = canonicalResources(lesson.resources);
      if (body) stats.bodies += 1;
      if (res.length) stats.resources += 1;
      if (lesson.videoUrl) stats.videos += 1;
      lessons.push({
        course_slug: course.slug,
        module_title: mod.title,
        module_position: mi,
        lesson_title: lesson.title,
        lesson_position: li,
        lesson_type: type,
        duration: lesson.duration || '',
        resources: res.length ? res : null,
        video_url: lesson.videoUrl || null,
        body: body || null,
      });
    });
  });

  const quiz = finalQuizzes[course.slug];
  if (quiz) {
    const questions = (quiz.questions || []).map((question) => {
      const isMA = question.type === 'multiple_answer';
      const options = question.type === 'true_false' ? ['True', 'False'] : question.options;
      return {
        type: question.type,
        question: question.q,
        options: options || [],
        ...(isMA ? { answers: question.answers || [] } : { answer: Number(question.answer) }),
        why: question.why || '',
      };
    });
    stats.questions += questions.length;
    quizzes.push({
      course_slug: course.slug,
      title: quiz.title,
      description: quiz.description || 'Final assessment — pass to move toward your certificate.',
      passing_score: quiz.passingScore || 70,
      lesson_title: capstoneTitle,
      questions,
    });
  }

  const project = finalProjects[course.slug];
  if (project) {
    projects.push({
      course_slug: course.slug,
      title: project.title,
      description: project.description,
      instructions: project.instructions,
      required_output: project.requiredOutput,
      lesson_title: capstoneTitle,
    });
  }
}

// ============================================================ SQL
const L = [];
const push = (...rows) => L.push(...rows);

// Payload row -> (course, module, lesson) ids. Shared fragment so every fan-out
// statement resolves rows exactly like the old per-lesson script did: through
// the module title, never by lesson title alone.
const RESOLVE = [
  '  from _seed_curriculum s',
  '  join public.courses c on c.slug = s.course_slug',
  '  join public.course_modules mo on mo.course_id = c.id and mo.title = s.module_title',
  '  join public.course_lessons le on le.module_id = mo.id and le.title = s.lesson_title',
].join('\n');

const tuple = (parts) => `  (${parts.join(', ')})`;
const sqlText = (v) => (v === null || v === undefined ? 'null' : q(v));

push(
  '-- ============================================================',
  '-- WOLI DAN TECH HUB — Seed: full curriculum (modules, lessons,',
  '-- bodies, resources and lesson videos)',
  '-- GENERATED FILE — do not edit by hand.',
  '-- Regenerate: node supabase/seed/generate_curriculum.mjs',
  '--',
  '-- Run AFTER migrations 001-009 and AFTER seed_12_courses.sql, as ONE query.',
  '-- Requires lesson resources (003) and expanded lesson types (007).',
  '-- IDEMPOTENT: modules/lessons matched by (course slug, module title,',
  '-- lesson title); content upserts; videos matched on (lesson_id, url).',
  '-- Re-running updates bodies/resources and never duplicates rows.',
  '--',
  '-- FAST: all curriculum text is loaded into 3 temp payload tables (one VALUES',
  '-- statement each) and fanned out with a handful of set-based statements.',
  '-- ~60x fewer statements than one-statement-per-lesson, which is what lets a',
  '-- 900 KB paste finish in the Supabase SQL Editor instead of hanging while it',
  '-- parses and renders a result grid per statement. One transaction: any error',
  '-- rolls the whole run back, so re-running the same file is always safe.',
  '--',
  '-- Every lesson ships:',
  '--   * a full professional lesson body (course_content),',
  '--   * curated resources (course_lessons.resources jsonb),',
  '--   * one real, verified YouTube video (course_videos, published).',
  '--',
  '-- lessons_count is maintained by a trigger (migration 004), so course',
  '-- cards pick up the new totals automatically.',
  '-- ============================================================',
  '',
  'begin;',
  '',
  '-- Do not let an editor timeout kill a valid run, and do not fsync per',
  '-- statement. Both settings are local to this transaction only.',
  'set local statement_timeout = 0;',
  'set local lock_timeout = 0;',
  'set local synchronous_commit = off;',
  '',
  '-- Fail before writing anything if the catalog seed was skipped or drifted.',
  'do $seed_guard$',
  'declare missing_slugs text;',
  'begin',
  "  select string_agg(required.slug, ', ' order by required.slug)",
  '    into missing_slugs',
  `    from unnest(array[${launchSlugs.map(q).join(', ')}]::text[]) as required(slug)`,
  '   where not exists (select 1 from public.courses c where c.slug = required.slug);',
  '  if missing_slugs is not null then',
  "    raise exception 'seed_curriculum: required course slugs are missing: %', missing_slugs;",
  '  end if;',
  'end',
  '$seed_guard$;',
  '',
  '-- ---------- payload ----------',
  '-- Temp tables, dropped by `on commit drop` at the commit below, so a re-run',
  '-- always starts from a clean slate even if a previous run was cancelled.',
  'drop table if exists _seed_curriculum;',
  'create temp table _seed_curriculum (',
  '  course_slug text not null,',
  '  module_title text not null,',
  '  module_position int not null,',
  '  lesson_title text not null,',
  '  lesson_position int not null,',
  '  lesson_type text not null,',
  '  duration text,',
  '  resources jsonb,',
  '  video_url text,',
  '  body text',
  ') on commit drop;',
  '',
  `-- ${lessons.length} lessons in ONE statement (${stats.courses} courses x 4 modules x 4 lessons).`,
  'insert into _seed_curriculum',
  '  (course_slug, module_title, module_position, lesson_title, lesson_position,',
  '   lesson_type, duration, resources, video_url, body)',
  'values'
);

push(lessons.map((r) => tuple([
  q(r.course_slug), q(r.module_title), r.module_position, q(r.lesson_title), r.lesson_position,
  q(r.lesson_type), q(r.duration),
  r.resources === null ? 'null' : jsonb(r.resources),
  sqlText(r.video_url), sqlText(r.body),
])).join(',\n'));

push(
  ';',
  '',
  'drop table if exists _seed_quiz;',
  "create temp table _seed_quiz (",
  '  course_slug text not null,',
  '  title text not null,',
  '  description text,',
  '  passing_score int not null default 70,',
  '  lesson_title text,',
  "  questions jsonb not null default '[]'::jsonb",
  ') on commit drop;',
  '',
  'insert into _seed_quiz (course_slug, title, description, passing_score, lesson_title, questions) values'
);

push(quizzes.map((r) => tuple([
  q(r.course_slug), q(r.title), q(r.description), r.passing_score,
  sqlText(r.lesson_title), jsonb(r.questions),
])).join(',\n'), ';', '');

push(
  'drop table if exists _seed_project;',
  'create temp table _seed_project (',
  '  course_slug text not null,',
  '  title text not null,',
  '  description text,',
  '  instructions text,',
  '  required_output text,',
  '  lesson_title text',
  ') on commit drop;',
  '',
  'insert into _seed_project (course_slug, title, description, instructions, required_output, lesson_title) values'
);

push(projects.map((r) => tuple([
  q(r.course_slug), q(r.title), q(r.description), q(r.instructions), q(r.required_output),
  sqlText(r.lesson_title),
])).join(',\n'), ';', '');

// Planner stats for the payload — one cheap statement that keeps the fan-out on
// hash joins instead of nested loops once the real tables have live data.
push(
  'analyze _seed_curriculum;',
  'analyze _seed_quiz;',
  'analyze _seed_project;',
  '',
  '-- ---------- 1. modules ----------',
  'with want as (',
  '  select distinct c.id as course_id, s.module_title as title, s.module_position as position',
  '  from _seed_curriculum s',
  '  join public.courses c on c.slug = s.course_slug',
  ')',
  'insert into public.course_modules (course_id, title, position)',
  'select w.course_id, w.title, w.position from want w',
  'where not exists (',
  '  select 1 from public.course_modules m where m.course_id = w.course_id and m.title = w.title',
  ');',
  '',
  '-- ---------- 2. lessons ----------',
  'with want as (',
  '  select mo.id as module_id, c.id as course_id, s.lesson_title as title,',
  '         s.lesson_type as type, s.duration, s.lesson_position as position',
  '  from _seed_curriculum s',
  '  join public.courses c on c.slug = s.course_slug',
  '  join public.course_modules mo on mo.course_id = c.id and mo.title = s.module_title',
  ')',
  'insert into public.course_lessons (module_id, course_id, title, type, duration, position)',
  'select w.module_id, w.course_id, w.title, w.type, w.duration, w.position from want w',
  'where not exists (',
  '  select 1 from public.course_lessons l where l.module_id = w.module_id and l.title = w.title',
  ');',
  '',
  '-- Keep the declared type in sync for rows that already exist. An admin may',
  '-- have retimed or reordered a lesson, so only `type` is re-asserted.',
  'with want as (',
  '  select le.id as lesson_id, s.lesson_type as type',
  RESOLVE,
  ')',
  'update public.course_lessons le set type = w.type',
  '  from want w where le.id = w.lesson_id and le.type is distinct from w.type;',
  '',
  '-- ---------- 3. lesson bodies ----------',
  'with want as (',
  "  select le.id as lesson_id, s.body as body_markdown",
  RESOLVE,
  "  where coalesce(s.body, '') <> ''",
  ')',
  'insert into public.course_content (lesson_id, body_markdown)',
  'select w.lesson_id, w.body_markdown from want w',
  'on conflict (lesson_id) do update',
  '  set body_markdown = excluded.body_markdown, updated_at = now();',
  '',
  '-- ---------- 4. lesson resources ----------',
  'with want as (',
  '  select le.id as lesson_id, s.resources',
  RESOLVE,
  '  where s.resources is not null and jsonb_array_length(s.resources) > 0',
  ')',
  'update public.course_lessons le set resources = w.resources',
  '  from want w where le.id = w.lesson_id;',
  '',
  '-- ---------- 5. lesson videos ----------',
  'with want as (',
  '  select le.id as lesson_id, s.video_url as url',
  RESOLVE,
  "  where coalesce(s.video_url, '') <> ''",
  ')',
  'insert into public.course_videos (lesson_id, provider, url, status)',
  "select w.lesson_id, 'youtube', w.url, 'published' from want w",
  'where not exists (',
  '  select 1 from public.course_videos v where v.lesson_id = w.lesson_id and v.url = w.url',
  ');',
  '',
  '-- ---------- 6. final quizzes ----------',
  'with want as (',
  '  select c.id as course_id, s.title, s.description, s.passing_score',
  '  from _seed_quiz s join public.courses c on c.slug = s.course_slug',
  ')',
  'insert into public.quizzes',
  '  (course_id, title, description, passing_score, allow_retake, is_final, status, attempt_limit)',
  "select w.course_id, w.title, w.description, w.passing_score, true, true, 'published', null from want w",
  'where not exists (',
  '  select 1 from public.quizzes z where z.course_id = w.course_id and z.title = w.title',
  ');',
  '',
  '-- Link every final quiz to its capstone lesson so it renders inside that lesson.',
  'with want as (',
  '  select z.id as quiz_id, le.id as lesson_id',
  '  from _seed_quiz s',
  '  join public.courses c on c.slug = s.course_slug',
  '  join public.quizzes z on z.course_id = c.id and z.title = s.title',
  '  join public.course_lessons le on le.course_id = c.id and le.title = s.lesson_title',
  "  where coalesce(s.lesson_title, '') <> ''",
  ')',
  'update public.quizzes z set lesson_id = w.lesson_id',
  '  from want w where z.id = w.quiz_id;',
  '',
  '-- ---------- 7. quiz questions ----------',
  "-- jsonb_array_elements expands each quiz's authored question array inside a",
  '-- single statement, keeping the order students answer them in.',
  'insert into public.quiz_questions',
  '  (quiz_id, type, question, options, correct_answer, correct_answers, explanation)',
  "select z.id, item->>'type', item->>'question', coalesce(item->'options', '[]'::jsonb),",
  "  case when item->>'type' = 'multiple_answer' then null",
  "       else nullif(item->>'answer', '')::int end,",
  "  case when item->>'type' = 'multiple_answer'",
  "       then coalesce(item->'answers', '[]'::jsonb) else '[]'::jsonb end,",
  "  coalesce(item->>'why', '')",
  'from _seed_quiz s',
  'join public.courses c on c.slug = s.course_slug',
  'join public.quizzes z on z.course_id = c.id and z.title = s.title',
  'cross join lateral jsonb_array_elements(s.questions) as item',
  'where not exists (',
  "  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = item->>'question'",
  ');',
  '',
  '-- ---------- 8. final projects ----------',
  'with want as (',
  '  select c.id as course_id, s.title, s.description, s.instructions, s.required_output',
  '  from _seed_project s join public.courses c on c.slug = s.course_slug',
  ')',
  'insert into public.assignments',
  '  (course_id, title, description, instructions, required_output, max_score, is_final_project, status)',
  "select w.course_id, w.title, w.description, w.instructions, w.required_output, 100, true, 'published' from want w",
  'where not exists (',
  '  select 1 from public.assignments a where a.course_id = w.course_id and a.title = w.title',
  ');',
  '',
  'with want as (',
  '  select a.id as assignment_id, le.id as lesson_id',
  '  from _seed_project s',
  '  join public.courses c on c.slug = s.course_slug',
  '  join public.assignments a on a.course_id = c.id and a.title = s.title',
  '  join public.course_lessons le on le.course_id = c.id and le.title = s.lesson_title',
  "  where coalesce(s.lesson_title, '') <> ''",
  ')',
  'update public.assignments a set lesson_id = w.lesson_id',
  '  from want w where a.id = w.assignment_id;',
  '',
  '-- ---------- 9. completion rules (the certificate gate) ----------',
  'with want as (',
  '  select c.id as course_id from public.courses c',
  `  where c.slug = any (array[${launchSlugs.map(q).join(', ')}]::text[])`,
  ')',
  'insert into public.course_completion_rules',
  '  (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project)',
  'select w.course_id, 100, 70, 0, true from want w',
  'on conflict (course_id) do update',
  '  set require_lessons_pct = excluded.require_lessons_pct,',
  '      require_quiz_avg = excluded.require_quiz_avg,',
  '      require_assignments_approved = excluded.require_assignments_approved,',
  '      require_final_project = excluded.require_final_project,',
  '      updated_at = now();',
  '',
  'commit;',
  '',
  '-- ---------- Verify ----------',
  'select c.slug, c.lessons_count,',
  '       (select count(*) from public.course_modules m where m.course_id = c.id) as modules,',
  '       (select count(*) from public.course_videos v',
  '          join public.course_lessons l on l.id = v.lesson_id',
  '         where l.course_id = c.id) as videos,',
  '       (select count(*) from public.quizzes z where z.course_id = c.id) as quizzes,',
  '       (select count(*) from public.assignments a where a.course_id = c.id) as assignments',
  'from public.courses c order by c.slug;',
  ''
);

const sql = L.join('\n');
writeFileSync(out, sql, 'utf8');

console.log(`wrote ${out}`);
console.log(`  courses with curriculum: ${stats.courses}`);
console.log(`  modules: ${stats.modules}, lessons: ${lessons.length}, bodies: ${stats.bodies}, resources: ${stats.resources}, videos: ${stats.videos}`);
console.log(`  final quizzes: ${quizzes.length}, questions: ${stats.questions}, final projects: ${projects.length}, completion rules: ${launchSlugs.length}`);
console.log(`  statements: ${(sql.match(/;/g) || []).length}, lines: ${sql.split('\n').length}, size: ${Math.round(Buffer.byteLength(sql, 'utf8') / 1024)} KB`);
