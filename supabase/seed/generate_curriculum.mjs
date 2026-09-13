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
// ============================================================
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { coursesData } from '../../src/data/courses.js';

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
let bodies = 0;
let videos = 0;
let resources = 0;

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
      const type = lesson.videoUrl ? 'video' : (lesson.type === 'text' ? 'text' : 'video');
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
  lines.push('');
}

lines.push('commit;');
lines.push('');
lines.push('-- ---------- Verify ----------');
lines.push('select c.slug, c.lessons_count,');
lines.push('       (select count(*) from public.course_modules m where m.course_id = c.id) as modules,');
lines.push('       (select count(*) from public.course_videos v');
lines.push('          join public.course_lessons l on l.id = v.lesson_id');
lines.push('         where l.course_id = c.id) as videos');
lines.push('from public.courses c order by c.slug;');
lines.push('');

writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`wrote ${out}`);
console.log(`  courses with curriculum: ${coursesData.filter((c) => (c.curriculum || []).length).length}`);
console.log(`  modules: ${modules}, lessons: ${lessons}, bodies: ${bodies}, resources: ${resources}, videos: ${videos}`);
