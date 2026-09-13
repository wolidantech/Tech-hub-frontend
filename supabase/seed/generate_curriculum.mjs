#!/usr/bin/env node
// ============================================================
// Generates supabase/seed/seed_curriculum.sql from src/data/courses.js
// ------------------------------------------------------------
// src/data/courses.js holds the full 12-course curriculum but is no longer
// imported by the app (the database is the source of truth), so the outlines
// were effectively stranded. This script turns them into idempotent SQL that
// can be run in the Supabase SQL Editor.
//
//   node supabase/seed/generate_curriculum.mjs
//
// Deliberate exclusions:
//   * videoUrl  — every URL in the offline catalog is the same placeholder
//                 (dQw4w9WgXcQ). Shipping it would put a rickroll in front of
//                 paying students, so lessons are seeded WITHOUT a video row.
//                 The player renders "Video coming soon" until an admin
//                 uploads the real file (Admin -> Courses -> lesson).
//   * id fields — the app used stable string ids ("m1", "l4"); Postgres uses
//                 uuids, so rows are matched on (course slug, module title,
//                 lesson title) instead, which keeps re-runs idempotent.
// ============================================================
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { coursesData } from '../../src/data/courses.js';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'seed_curriculum.sql');

/** SQL string literal — single quotes doubled, safe for arbitrary markdown. */
const q = (v) => `'${String(v ?? '').replace(/'/g, "''")}'`;

const lines = [];
lines.push('-- ============================================================');
lines.push('-- WOLI DAN TECH HUB — Seed: curriculum (modules, lessons, text bodies)');
lines.push('-- GENERATED FILE — do not edit by hand.');
lines.push('-- Regenerate: node supabase/seed/generate_curriculum.mjs');
lines.push('--');
lines.push('-- Run AFTER 001-005 and AFTER seed_12_courses.sql, as ONE query.');
lines.push('-- IDEMPOTENT: rows are matched on (course slug, module title, lesson');
lines.push('-- title), so re-running updates text bodies but never duplicates.');
lines.push('--');
lines.push('-- No video rows are created on purpose: the offline catalog only ever');
lines.push('-- contained a single placeholder URL. Lessons render "Video coming soon"');
lines.push('-- until real videos are uploaded from Admin -> Courses.');
lines.push('--');
lines.push('-- lessons_count is maintained by a trigger (migration 004), so course');
lines.push('-- cards pick up the new totals automatically.');
lines.push('-- ============================================================');
lines.push('');
lines.push('begin;');
lines.push('');

let modules = 0;
let lessons = 0;
let bodies = 0;

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

    (mod.lessons || []).forEach((lesson, li) => {
      lessons += 1;
      const type = lesson.type === 'text' ? 'text' : 'video';
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
      lines.push('');
    });
  });
  lines.push('');
}

lines.push('commit;');
lines.push('');
lines.push('-- ---------- Verify ----------');
lines.push('select c.slug, c.lessons_count,');
lines.push('       (select count(*) from public.course_modules m where m.course_id = c.id) as modules');
lines.push('from public.courses c order by c.slug;');
lines.push('');

writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`wrote ${out}`);
console.log(`  courses with curriculum: ${coursesData.filter((c) => (c.curriculum || []).length).length}`);
console.log(`  modules: ${modules}, lessons: ${lessons}, text bodies: ${bodies}`);
