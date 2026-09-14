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
//   * course_completion_rules: 100% lessons + quiz avg ≥ 70 + final project
//     approved → the server-side certificate trigger then issues the cert.
// The last lesson of every course is typed 'project' (capstone).
// ============================================================
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { coursesData } from '../../src/data/courses.js';
import { finalQuizzes, finalProjects } from '../../src/data/assessments.js';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'seed_curriculum.sql');

/** SQL string literal — single quotes doubled, safe for arbitrary markdown. */
const q = (v) => `'${String(v ?? '').replace(/'/g, "''")}'`;

/** SQL jsonb literal for a resources array of {title,url,type}. */
const resourcesJson = (resources) =>
  q(JSON.stringify(
    (resources || []).filter((r) => r && r.url).map((r) => ({
      title: r.title || 'Resource',
      url: r.url,
      type: r.type || 'link',
    }))
  ));

const lines = [];
lines.push('-- ============================================================');
lines.push('-- WOLI DAN TECH HUB — Seed: full curriculum (modules, lessons,');
lines.push('-- bodies, resources and lesson videos)');
lines.push('-- GENERATED FILE — do not edit by hand.');
lines.push('-- Regenerate: node supabase/seed/generate_curriculum.mjs');
lines.push('--');
lines.push('-- Run AFTER 001-006 and AFTER seed_12_courses.sql, as ONE query.');
lines.push('-- IDEMPOTENT: modules/lessons matched by (course slug, module title,');
lines.push('-- lesson title); content upserts; videos matched on (lesson_id, url).');
lines.push('-- Re-running updates bodies/resources and never duplicates rows.');
lines.push('--');
lines.push('-- Every lesson ships:');
lines.push('--   * a full professional lesson body (course_content),');
lines.push('--   * curated resources (course_lessons.resources jsonb),');
lines.push('--   * one real, verified YouTube video (course_videos, published).');
lines.push('--');
lines.push('-- lessons_count is maintained by a trigger (migration 004), so course');
lines.push('-- cards pick up the new totals automatically.');
lines.push('-- ============================================================');
lines.push('');
lines.push('begin;');
lines.push('');

let modules = 0;
let lessons = 0;
let topics = 0;
let practicals = 0;
let bodies = 0;
let videos = 0;
let resources = 0;
let quizzes = 0;
let questions = 0;
let projects = 0;
let rules = 0;

/** True for the capstone lesson: last module, last lesson of a course. */
const isCapstone = (curriculum, mi, li) =>
  mi === curriculum.length - 1 && li === (curriculum[mi].lessons || []).length - 1;

for (const course of coursesData) {
  const curriculum = course.curriculum || [];
  if (!curriculum.length) continue;
  lines.push(`-- ---------- ${course.slug} ----------`);

  curriculum.forEach((mod, mi) => {
    modules += 1;
    lines.push(
      [
        `with c as (select id from public.courses where slug = ${q(course.slug)})`,
        'insert into public.course_modules (course_id, title, position)',
        `select c.id, ${q(mod.title)}, ${mi} from c`,
        'where not exists (',
        `  select 1 from public.course_modules m where m.course_id = c.id and m.title = ${q(mod.title)}`,
        ');',
      ].join('\n')
    );

    // Optional TOPIC layer (migration 009): mod.topics = [{ title, lessons: [titles] }]
    (mod.topics || []).forEach((topic, ti) => {
      topics += 1;
      lines.push(
        [
          'with c as (select id from public.courses where slug = ' + q(course.slug) + ')',
          'insert into public.course_topics (course_id, module_id, title, position)',
          `select c.id, mo.id, ${q(topic.title)}, ${ti}`,
          'from c join public.course_modules mo on mo.course_id = c.id and mo.title = ' + q(mod.title),
          'where not exists (',
          `  select 1 from public.course_topics t where t.module_id = mo.id and t.title = ${q(topic.title)}`,
          ');',
          // re-parent this topic's lessons (match by title within the module)
          'update public.course_lessons le',
          '   set topic_id = (select t.id from public.course_topics t',
          `                   join public.course_modules mo2 on mo2.id = t.module_id`,
          `                   join public.courses c2 on c2.id = mo2.course_id`,
          `                  where mo2.id = le.module_id and c2.slug = ${q(course.slug)} and t.title = ${q(topic.title)})`,
          '  from public.course_modules mo3',
          ' where le.module_id = mo3.id',
          `   and mo3.title = ${q(mod.title)}`,
          `   and le.title in (${(topic.lessons || []).map(q).join(', ') || "''"});`,
        ].join('\n')
      );
    (topic.lessons || []).forEach((t) => { lessonToTopic[t] = topic.title; });
    });

    (mod.lessons || []).forEach((lesson, li) => {
      lessons += 1;
      const capstone = isCapstone(curriculum, mi, li);
      const type = lesson.type === 'text' ? 'text' : capstone ? 'project' : 'video';
      lines.push(
        [
          'with m as (',
          '  select mo.id as module_id, mo.course_id',
          '  from public.course_modules mo join public.courses c on c.id = mo.course_id',
          `  where c.slug = ${q(course.slug)} and mo.title = ${q(mod.title)}`,
          ')',
          'insert into public.course_lessons (module_id, course_id, title, type, duration, position)',
          `select m.module_id, m.course_id, ${q(lesson.title)}, ${q(type)}, ${q(lesson.duration || '')}, ${li}`,
          'from m',
          'where not exists (',
          `  select 1 from public.course_lessons l where l.module_id = m.module_id and l.title = ${q(lesson.title)}`,
          ');',
          // Keep the declared type in sync for rows that already exist.
          'with m as (',
          '  select mo.id as module_id, mo.course_id',
          '  from public.course_modules mo join public.courses c on c.id = mo.course_id',
          `  where c.slug = ${q(course.slug)} and mo.title = ${q(mod.title)}`,
          ')',
          'update public.course_lessons le set type = ' + q(type),
          '  from m where le.module_id = m.module_id and le.title = ' + q(lesson.title) + ';',
        ].join('\n')
      );

      const body = lesson.content || lesson.textContent || '';
      if (body.trim()) {
        bodies += 1;
        lines.push(
          [
            'with l as (',
            '  select le.id from public.course_lessons le',
            '  join public.course_modules mo on mo.id = le.module_id',
            '  join public.courses c on c.id = mo.course_id',
            `  where c.slug = ${q(course.slug)} and mo.title = ${q(mod.title)} and le.title = ${q(lesson.title)}`,
            ')',
            'insert into public.course_content (lesson_id, body_markdown)',
            `select l.id, ${q(body)} from l`,
            'on conflict (lesson_id) do update',
            '  set body_markdown = excluded.body_markdown, updated_at = now();',
          ].join('\n')
        );
      }

      const res = lesson.resources || [];
      if (res.length) {
        resources += 1;
        lines.push(
          [
            'with l as (',
            '  select le.id from public.course_lessons le',
            '  join public.course_modules mo on mo.id = le.module_id',
            '  join public.courses c on c.id = mo.course_id',
            `  where c.slug = ${q(course.slug)} and mo.title = ${q(mod.title)} and le.title = ${q(lesson.title)}`,
            ')',
            'update public.course_lessons le',
            `   set resources = ${resourcesJson(res)}::jsonb`,
            '  from l where le.id = l.id;',
          ].join('\n')
        );
      }

      // Optional PRACTICAL (migration 009): lesson.practical = {...}
      if (lesson.practical) {
        practicals += 1;
        const pr = lesson.practical;
        const ljoin = [
          '  select le.id, le.course_id, le.module_id from public.course_lessons le',
          '  join public.course_modules mo on mo.id = le.module_id',
          '  join public.courses c on c.id = mo.course_id',
          `  where c.slug = ${q(course.slug)} and mo.title = ${q(mod.title)} and le.title = ${q(lesson.title)}`,
        ].join('\n');
        const jarr = (v) => JSON.stringify(JSON.stringify(Array.isArray(v) ? v : (v ? [v] : [])));
        lines.push(
          [
            'with l as (', ljoin, ')',
            'insert into public.lesson_practicals',
            '  (lesson_id, course_id, module_id, title, objective, scenario, instructions, expected_output,',
            '   materials, observation, questions, safety, estimated_time, status)',
            `select l.id, l.course_id, l.module_id, ${q(pr.title || (lesson.title + ' — practical'))},`,
            `  ${q(pr.objective || '')}, ${q(pr.scenario || '')}, ${q(pr.procedure || pr.instructions || '')}, ${q(pr.expected || pr.expected_output || '')},`,
            `  ${jarr(pr.materials)}::jsonb, ${q(pr.observation || '')}, ${jarr(pr.questions)}::jsonb, ${q(pr.safety || '')},`,
            `  ${pr.estimatedMinutes ? Number(pr.estimatedMinutes) : 'null'}, 'PUBLISHED'`,
            'from l',
            'where not exists (',
            `  select 1 from public.lesson_practicals p where p.lesson_id = l.id and p.title = ${q(pr.title || (lesson.title + ' — practical'))}`,
            ')',
            'on conflict do nothing;',
          ].join('\n')
        );
      }

      if (lesson.videoUrl) {
        videos += 1;
        lines.push(
          [
            'with l as (',
            '  select le.id from public.course_lessons le',
            '  join public.course_modules mo on mo.id = le.module_id',
            '  join public.courses c on c.id = mo.course_id',
            `  where c.slug = ${q(course.slug)} and mo.title = ${q(mod.title)} and le.title = ${q(lesson.title)}`,
            ')',
            "insert into public.course_videos (lesson_id, provider, url, status)",
            `select l.id, 'youtube', ${q(lesson.videoUrl)}, 'published' from l`,
            'where not exists (',
            `  select 1 from public.course_videos v where v.lesson_id = l.id and v.url = ${q(lesson.videoUrl)}`,
            ');',
          ].join('\n')
        );
      }
      lines.push('');
    });
  });
  // ---------- Final quiz + final project + completion rules ----------
  const quiz = finalQuizzes[course.slug];
  if (quiz) {
    quizzes += 1;
    const lessonTitle = (curriculum[curriculum.length - 1]?.lessons || []).slice(-1)[0]?.title;
    lines.push(
      [
        `with c as (select id from public.courses where slug = ${q(course.slug)})`,
        'insert into public.quizzes (course_id, title, description, passing_score, allow_retake, is_final, status, attempt_limit)',
        `select c.id, ${q(quiz.title)}, ${q(quiz.description || 'Final assessment — pass to move toward your certificate.')}, ${quiz.passingScore || 70}, true, true, 'published', null from c`,
        'where not exists (',
        `  select 1 from public.quizzes z where z.course_id = c.id and z.title = ${q(quiz.title)}`,
        ');',
      ].join('\n')
    );
    // Keep the quiz linked to the capstone lesson (shown inside that lesson).
    if (lessonTitle) {
      lines.push(
        [
          `update public.quizzes z set lesson_id = le.id`,
          '  from public.course_lessons le',
          ` where z.course_id = le.course_id and le.title = ${q(lessonTitle)}`,
          `   and z.title = ${q(quiz.title)} and exists (select 1 from public.courses c where c.id = z.course_id and c.slug = ${q(course.slug)});`,
        ].join('\n')
      );
    }
    (quiz.questions || []).forEach((question) => {
      questions += 1;
      const isMA = question.type === 'multiple_answer';
      const options = question.type === 'true_false' ? ['True', 'False'] : question.options;
      lines.push(
        [
          `with z as (select z.id from public.quizzes z join public.courses c on c.id = z.course_id`,
          `  where c.slug = ${q(course.slug)} and z.title = ${q(quiz.title)})`,
          'insert into public.quiz_questions (quiz_id, type, question, options, correct_answer, correct_answers, explanation)',
          `select z.id, ${q(question.type)}, ${q(question.q)}, ${q(JSON.stringify(options))}::jsonb,`,
          isMA ? `null, ${q(JSON.stringify(question.answers))}::jsonb,` : `${Number(question.answer)}, '[]'::jsonb,`,
          `${q(question.why || '')} from z`,
          'where not exists (',
          `  select 1 from public.quiz_questions qq where qq.quiz_id = z.id and qq.question = ${q(question.q)}`,
          ');',
        ].join('\n')
      );
    });
  }

  const project = finalProjects[course.slug];
  if (project) {
    projects += 1;
    const lessonTitle = (curriculum[curriculum.length - 1]?.lessons || []).slice(-1)[0]?.title;
    lines.push(
      [
        `with c as (select id from public.courses where slug = ${q(course.slug)})`,
        'insert into public.assignments (course_id, title, description, instructions, required_output, max_score, is_final_project, status)',
        `select c.id, ${q(project.title)}, ${q(project.description)}, ${q(project.instructions)}, ${q(project.requiredOutput)}, 100, true, 'published' from c`,
        'where not exists (',
        `  select 1 from public.assignments a where a.course_id = c.id and a.title = ${q(project.title)}`,
        ');',
      ].join('\n')
    );
    if (lessonTitle) {
      lines.push(
        [
          `update public.assignments a set lesson_id = le.id`,
          '  from public.course_lessons le',
          ` where a.course_id = le.course_id and le.title = ${q(lessonTitle)}`,
          `   and a.title = ${q(project.title)} and exists (select 1 from public.courses c where c.id = a.course_id and c.slug = ${q(course.slug)});`,
        ].join('\n')
      );
    }
  }

  rules += 1;
  lines.push(
    [
      `with c as (select id from public.courses where slug = ${q(course.slug)})`,
      'insert into public.course_completion_rules (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project)',
      'select c.id, 100, 70, 0, true from c',
      'on conflict (course_id) do update',
      '  set require_lessons_pct = excluded.require_lessons_pct,',
      '      require_quiz_avg = excluded.require_quiz_avg,',
      '      require_assignments_approved = excluded.require_assignments_approved,',
      '      require_final_project = excluded.require_final_project,',
      '      updated_at = now();',
    ].join('\n')
  );
  lines.push('');
}

lines.push('commit;');
lines.push('');
lines.push('-- ---------- Verify ----------');
lines.push('select c.slug, c.lessons_count,');
lines.push('       (select count(*) from public.course_modules m where m.course_id = c.id) as modules,');
lines.push('       (select count(*) from public.course_videos v');
lines.push('          join public.course_lessons l on l.id = v.lesson_id');
lines.push('         where l.course_id = c.id) as videos,');
lines.push('       (select count(*) from public.quizzes z where z.course_id = c.id) as quizzes,');
lines.push('       (select count(*) from public.assignments a where a.course_id = c.id) as assignments');
lines.push('from public.courses c order by c.slug;');
lines.push('');

writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`wrote ${out}`);
console.log(`  courses with curriculum: ${coursesData.filter((c) => (c.curriculum || []).length).length}`);
console.log(`  modules: ${modules}, topics: ${topics}, lessons: ${lessons}, bodies: ${bodies}, resources: ${resources}, videos: ${videos}`);
console.log(`  practicals: ${practicals}`);
console.log(`  final quizzes: ${quizzes}, questions: ${questions}, final projects: ${projects}, completion rules: ${rules}`);
