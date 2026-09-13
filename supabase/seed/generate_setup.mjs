#!/usr/bin/env node
// ============================================================
// Generates supabase/seed/setup_full_catalog.sql — the ONE paste that takes a
// freshly migrated project from an empty catalog to a live storefront.
//
//   node supabase/seed/generate_setup.mjs
//
// Concatenates, in order: seed_12_courses.sql, seed_curriculum.sql,
// publish_courses.sql. Generated rather than hand-maintained so it can never
// drift from its three sources. All three are idempotent, so the combined
// script is too.
// ============================================================
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (f) => readFileSync(join(here, f), 'utf8').trim();

const parts = ['seed_12_courses.sql', 'seed_curriculum.sql', 'publish_courses.sql', 'seed_learning_paths.sql'];

const header = `-- ============================================================
-- WOLI DAN TECH HUB — ONE-STEP CATALOG SETUP
-- GENERATED FILE — do not edit by hand.
-- Regenerate: node supabase/seed/generate_setup.mjs
--
-- Paste this ENTIRE file into Supabase Dashboard -> SQL Editor -> Run.
-- It is the concatenation, in order, of:
--   1. seed_12_courses.sql       — the 12 launch courses (as drafts)
--   2. seed_curriculum.sql       — their modules, lessons and text bodies
--   3. publish_courses.sql       — flips published = true on courses with lessons
--   4. seed_learning_paths.sql   — 4 guided learning paths over the live catalog
--
-- Run AFTER migrations 001-008. Idempotent: safe to re-run; never duplicates
-- rows and never unpublishes a course you deliberately hid.
--
-- Expected end state: 12 published courses with real lesson counts and
-- 4 published learning paths that reference real course ids.
-- Verify with:
--   select count(*) filter (where published) as published,
--          count(*) as total from public.courses;
-- ============================================================

`;

const body = parts.map((f) => `-- ${'='.repeat(60)}\n-- FROM ${f}\n-- ${'='.repeat(60)}\n\n${read(f)}`).join('\n\n');

writeFileSync(join(here, 'setup_full_catalog.sql'), header + body + '\n', 'utf8');
console.log(`wrote ${join(here, 'setup_full_catalog.sql')}`);
console.log(`lines: ${(header + body).split('\n').length}`);
