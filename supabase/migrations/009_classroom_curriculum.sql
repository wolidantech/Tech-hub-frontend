-- ============================================================
-- 009 — FULL CLASSROOM CURRICULUM: TOPICS • PRACTICALS • RESOURCES
-- ------------------------------------------------------------
-- Closes the gap between what the classroom UI needs and what 001-008
-- provided. The expected hierarchy is:
--
--   COURSE → MODULE → TOPIC → LESSON → CONTENT → RESOURCES
--          → PRACTICAL → ASSIGNMENT → QUIZ → ASSESSMENT → PROGRESS
--
-- Additive only. Safe on BOTH schema lineages:
--   * projects created from this repo (course_lessons / course_content /
--     course_videos), and
--   * projects that also ran the backend repo's content pipeline
--     (lessons / lesson_content / lesson_videos / course_resources /
--     lesson_practicals, migration 20260910000010+).
-- Every CREATE is IF NOT EXISTS / guarded; shared tables keep the BACKEND's
-- exact table+column names so neither host duplicates the schema.
-- Idempotent: safe to re-run any number of times.
--
-- Contents
--   1. Enums (only if absent) matching the backend definitions.
--   2. course_topics            — the missing TOPIC level.
--   3. course_lessons/lessons   — topic_id, estimated_minutes (+ description
--                                  from 007).
--   4. lesson_practicals        — dedicated practical/exercise store with
--                                  materials, observation, questions, safety.
--   5. course_resources         — real downloadable resources (PDF/DOCX/
--                                  PPTX/images/datasets) + external URLs,
--                                  storage-backed with signed downloads.
--   6. practical_submissions    — student upload + review flow for practicals.
--   7. courses meta             — skills (gained), estimated_hours.
--   8. Quizzes                  — numeric/calculation question type +
--                                  server-side grading upgrade.
--   9. lessons_count sync for `lessons`-based projects (if the table exists).
--  10. RLS for everything above (published/enrolled/admin gates).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Enums — identical names/values as the backend content system so both
--    migration lineages converge instead of forking. Guarded: never errors
--    when the type already exists (PG < 15 lacks CREATE TYPE IF NOT EXISTS).
-- ------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'content_status' and n.nspname = 'public') then
    create type public.content_status as enum
      ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');
  end if;
exception when duplicate_object then null; end $$;

do $$ begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'resource_type' and n.nspname = 'public') then
    create type public.resource_type as enum
      ('VIDEO', 'PDF', 'ARTICLE', 'DOCUMENTATION', 'DATASET',
       'CODE', 'TEMPLATE', 'WEBSITE', 'BOOK', 'EXERCISE');
  end if;
exception when duplicate_object then null; end $$;

do $$ begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'difficulty_level' and n.nspname = 'public') then
    create type public.difficulty_level as enum ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
  end if;
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- 2. TOPICS — COURSE → MODULE → TOPIC → LESSON
--    A lesson may skip topics (topic_id null) and still render directly
--    under its module, so this is fully backward compatible.
-- ------------------------------------------------------------
create table if not exists public.course_topics (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  module_id  uuid not null references public.course_modules(id) on delete cascade,
  title      text not null,
  description text default '',
  position   int default 0,
  created_at timestamptz default now(),
  -- matched on by the seed generator so re-runs never duplicate
  constraint uq_topic_per_module unique (module_id, title)
);
create index if not exists idx_topics_module on public.course_topics(module_id);
create index if not exists idx_topics_course on public.course_topics(course_id);

-- A scheme of work is public for published courses exactly like modules
-- (titles only); full lesson content stays enrolled-only (001).
alter table public.course_topics enable row level security;
drop policy if exists "topics readable" on public.course_topics;
create policy "topics readable" on public.course_topics for select using (
  public.is_admin() or exists (
    select 1 from public.courses c where c.id = course_topics.course_id and c.published = true
  ) or exists (
    select 1 from public.enrollments e
    where e.course_id = course_topics.course_id and e.user_id = auth.uid() and e.status = 'active'
  )
);
drop policy if exists "admin write topics" on public.course_topics;
create policy "admin write topics" on public.course_topics for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- 3. Lessons ↔ topics. Both lesson tables get the column when present:
--    `course_lessons` (this repo) and `lessons` (backend lineage).
-- ------------------------------------------------------------
alter table public.course_lessons add column if not exists topic_id uuid references public.course_topics(id) on delete set null;
alter table public.course_lessons add column if not exists estimated_minutes int;
create index if not exists idx_lessons_topic on public.course_lessons(topic_id);

do $$ begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='lessons') then
    execute 'alter table public.lessons add column if not exists topic_id uuid references public.course_topics(id) on delete set null';
    execute 'alter table public.lessons add column if not exists estimated_minutes int';
    execute 'alter table public.lessons add column if not exists course_id uuid references public.courses(id) on delete cascade';
    execute 'create index if not exists idx_lessons_course on public.lessons(course_id)';
    execute 'create index if not exists idx_lessons_topic on public.lessons(topic_id)';
    -- legacy rows only know their module: backfill course_id from it
    execute 'update public.lessons l set course_id = m.course_id
             from public.course_modules m where l.course_id is null and m.id = l.module_id';
  end if;
end $$;

-- ------------------------------------------------------------
-- 4. PRACTICALS — one per lesson (science courses lean on these).
--    Table name + core columns match the backend repo (20260910000010) so
--    content generated by the AI pipeline lands here directly; the extra
--    fields below cover the required classroom sections (materials,
--    observation, questions, safety).
-- ------------------------------------------------------------
create table if not exists public.lesson_practicals (
  id                 uuid primary key default gen_random_uuid(),
  lesson_id          uuid not null,
  course_id          uuid references public.courses(id) on delete cascade,
  module_id          uuid references public.course_modules(id) on delete cascade,
  title              text not null,
  objective          text not null default '',
  scenario           text,
  instructions       text not null default '',
  requirements       text,
  expected_output    text,
  difficulty         public.difficulty_level not null default 'BEGINNER',
  estimated_time     integer check (estimated_time is null or estimated_time > 0),
  submission_type    text,
  evaluation_criteria jsonb default '[]'::jsonb,
  status             public.content_status not null default 'PUBLISHED',
  created_by         uuid references public.profiles(id) on delete set null,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
-- classroom-spec sections (added whether the table is ours or the backend's)
alter table public.lesson_practicals add column if not exists materials   jsonb default '[]'::jsonb;  -- ["Microscope", "Slide of …"]
alter table public.lesson_practicals add column if not exists observation text;                        -- what students record
alter table public.lesson_practicals add column if not exists questions   jsonb default '[]'::jsonb;  -- follow-up questions
alter table public.lesson_practicals add column if not exists safety      text;                        -- safety notes
alter table public.lesson_practicals add column if not exists position    int default 0;
create index if not exists idx_practicals_lesson on public.lesson_practicals (lesson_id);
create index if not exists idx_practicals_course on public.lesson_practicals (course_id);

alter table public.lesson_practicals enable row level security;
drop policy if exists "practicals enrolled read" on public.lesson_practicals;
create policy "practicals enrolled read" on public.lesson_practicals for select using (
  public.is_admin()
  or (status in ('APPROVED','PUBLISHED') and exists (
       select 1 from public.enrollments e
       where e.course_id = lesson_practicals.course_id and e.user_id = auth.uid() and e.status = 'active'))
);
drop policy if exists "admin write practicals" on public.lesson_practicals;
create policy "admin write practicals" on public.lesson_practicals for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- 5. RESOURCES — real files (PDF/DOCX/PPTX/images/datasets) stored in
--    Supabase Storage and served with signed URLs, plus curated external
--    links. Never synthesized client-side. Table name/columns match the
--    backend repo; the three extra columns serve the classroom UI.
-- ------------------------------------------------------------
create table if not exists public.course_resources (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid references public.courses(id) on delete cascade,
  module_id     uuid references public.course_modules(id) on delete cascade,
  lesson_id     uuid,
  title         text not null,
  description   text,
  url           text,
  storage_path  text,
  source        text,
  license       text,
  resource_type public.resource_type not null default 'ARTICLE',
  is_external   boolean not null default true,
  access_date   date default current_date,
  attribution   text,
  quality_score numeric(3,2),
  is_approved   boolean not null default true,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- new: classroom display + downloads
  file_size     bigint,
  mime_type     text,
  position      int default 0
);
create index if not exists idx_course_resources_course on public.course_resources (course_id);
create index if not exists idx_course_resources_lesson on public.course_resources (lesson_id);
create index if not exists idx_course_resources_module on public.course_resources (module_id);

alter table public.course_resources enable row level security;
drop policy if exists "resources enrolled read" on public.course_resources;
create policy "resources enrolled read" on public.course_resources for select using (
  public.is_admin()
  or (is_approved and exists (
       select 1 from public.enrollments e
       where e.course_id = course_resources.course_id and e.user_id = auth.uid() and e.status = 'active'))
  -- curated external links are safe to show on the public curriculum preview
  or (is_external and url is not null and exists (
       select 1 from public.courses c
       where c.id = course_resources.course_id and c.published = true and c.archived = false))
);
drop policy if exists "admin write resources" on public.course_resources;
create policy "admin write resources" on public.course_resources for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- 6. PRACTICAL SUBMISSIONS — student answer for a practical activity
--    (file upload and/or observation text + answers), reviewed by admin.
-- ------------------------------------------------------------
create table if not exists public.practical_submissions (
  id            uuid primary key default gen_random_uuid(),
  practical_id  uuid not null references public.lesson_practicals(id) on delete cascade,
  course_id     uuid not null references public.courses(id) on delete cascade,
  lesson_id     uuid,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  student_name  text default '',
  storage_path  text,
  file_name     text,
  file_type     text,
  file_size     bigint,
  text_content  text default '',
  observation   text default '',
  note          text default '',
  status        text not null default 'submitted'
                check (status in ('submitted','under_review','approved','needs_revision')),
  score         int,
  feedback      text default '',
  reviewed_by   text,
  reviewed_at   timestamptz,
  submitted_at  timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists idx_prsub_user on public.practical_submissions(user_id);
create index if not exists idx_prsub_practical on public.practical_submissions(practical_id);
create index if not exists idx_prsub_course on public.practical_submissions(course_id);

alter table public.practical_submissions enable row level security;
drop policy if exists "own practical submissions" on public.practical_submissions;
create policy "own practical submissions" on public.practical_submissions
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "students submit practicals" on public.practical_submissions;
create policy "students submit practicals" on public.practical_submissions for insert with check (
  auth.uid() = user_id and exists (
    select 1 from public.enrollments e
    join public.lesson_practicals p on p.id = practical_submissions.practical_id
    where e.user_id = auth.uid() and e.status = 'active' and e.course_id = p.course_id)
);
-- students may resubmit (revisions) their own not-yet-approved rows only
drop policy if exists "students update own practical submissions" on public.practical_submissions;
create policy "students update own practical submissions" on public.practical_submissions
  for update using (auth.uid() = user_id and status in ('submitted','needs_revision'));
drop policy if exists "admin review practical submissions" on public.practical_submissions;
create policy "admin review practical submissions" on public.practical_submissions
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_touch_prsub on public.practical_submissions;
create trigger trg_touch_prsub before update on public.practical_submissions
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_touch_practicals on public.lesson_practicals;
create trigger trg_touch_practicals before update on public.lesson_practicals
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- 7. Courses metadata for the details page
-- ------------------------------------------------------------
alter table public.courses add column if not exists skills jsonb default '[]';          -- "skills gained"
alter table public.courses add column if not exists estimated_hours numeric;            -- overrides parsed durations when set

-- ------------------------------------------------------------
-- 8. Quizzes: numeric / calculation questions.
--    Answers graded server-side with a tolerance, e.g. 42 or 42.0 or "42".
-- ------------------------------------------------------------
alter table public.quiz_questions add column if not exists answer_number numeric;
alter table public.quiz_questions add column if not exists answer_tolerance numeric default 0.0001;
alter table public.quiz_questions add column if not exists answer_unit text;

alter table public.quiz_questions drop constraint if exists quiz_questions_type_check;
alter table public.quiz_questions
  add constraint quiz_questions_type_check
  check (type in ('multiple_choice','true_false','multiple_answer','short_answer','numeric'));

-- taker view: expose units (never the answer itself)
create or replace function public.get_quiz_questions(p_quiz_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); q record;
begin
  if me is null then raise exception 'Not authenticated'; end if;
  select * into q from public.quizzes where id = p_quiz_id;
  if not found then raise exception 'Quiz not found'; end if;
  if q.status != 'published' and not public.is_admin() then raise exception 'Quiz is not available'; end if;
  if not public.is_admin() and not exists (
    select 1 from public.enrollments e
    where e.user_id = me and e.course_id = q.course_id and e.status = 'active'
  ) then raise exception 'Course access has not yet been approved'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', qq.id, 'type', qq.type, 'question', qq.question, 'options', qq.options,
      'unit', case when qq.type = 'numeric' then nullif(qq.answer_unit, '') else null end
    ) order by qq.created_at, qq.id)
    from public.quiz_questions qq where qq.quiz_id = p_quiz_id
  ), '[]'::jsonb);
end $$;

-- review view: numeric keys included after an attempt (or for admins)
create or replace function public.get_quiz_review(p_quiz_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'Not authenticated'; end if;
  if not public.is_admin() and not exists (
    select 1 from public.quiz_attempts a where a.quiz_id = p_quiz_id and a.user_id = me
  ) then raise exception 'Attempt the quiz first to see the answers'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', qq.id, 'type', qq.type, 'question', qq.question, 'options', qq.options,
      'correctAnswer', qq.correct_answer, 'correctAnswers', qq.correct_answers,
      'acceptedAnswers', qq.accepted_answers, 'explanation', qq.explanation,
      'answerNumber', qq.answer_number, 'answerTolerance', qq.answer_tolerance, 'answerUnit', qq.answer_unit
    ) order by qq.created_at, qq.id)
    from public.quiz_questions qq where qq.quiz_id = p_quiz_id
  ), '[]'::jsonb);
end $$;

-- full attempt scoring — identical to 003 plus the numeric branch
create or replace function public.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  q record; qq record;
  prior int; total int := 0; earned int := 0;
  given jsonb; ok boolean;
  details jsonb := '[]'::jsonb;
  att_id uuid; att_no int; scr int; passed boolean;
  gtext text; acc text;
  ga int[]; ca int[];
  gscalar text; gnum numeric;
begin
  if me is null then raise exception 'Not authenticated'; end if;
  select * into q from public.quizzes where id = p_quiz_id;
  if not found then raise exception 'Quiz not found'; end if;
  if q.status != 'published' then raise exception 'Quiz is not available'; end if;
  if not exists (
    select 1 from public.enrollments e
    where e.user_id = me and e.course_id = q.course_id and e.status = 'active'
  ) then raise exception 'Course access has not yet been approved'; end if;

  select count(*) into prior from public.quiz_attempts a where a.quiz_id = p_quiz_id and a.user_id = me;
  if prior > 0 and not coalesce(q.allow_retake, true) then raise exception 'Retakes are not allowed for this quiz'; end if;
  if q.attempt_limit is not null and prior >= q.attempt_limit then
    raise exception 'Attempt limit reached (%)', q.attempt_limit;
  end if;

  for qq in select * from public.quiz_questions where quiz_id = p_quiz_id order by created_at, id loop
    total := total + 1;
    given := p_answers -> qq.id::text;
    ok := false;
    if qq.type = 'multiple_answer' then
      select coalesce(array_agg(v::int order by v::int), '{}') into ga
      from jsonb_array_elements_text(case when jsonb_typeof(given) = 'array' then given else '[]'::jsonb end) v
      where v ~ '^-?\d+$';
      select coalesce(array_agg(v::int order by v::int), '{}') into ca
      from jsonb_array_elements_text(coalesce(qq.correct_answers, '[]'::jsonb)) v
      where v ~ '^-?\d+$';
      ok := (ga = ca) and (coalesce(array_length(ga, 1), 0) > 0);
    elsif qq.type = 'short_answer' then
      gtext := lower(trim(coalesce(given #>> '{}', '')));
      if gtext <> '' then
        foreach acc slice 0 in array coalesce(qq.accepted_answers, '{}') loop
          acc := lower(trim(acc));
          if acc <> '' and (gtext = acc or position(acc in gtext) > 0) then ok := true; exit; end if;
        end loop;
      end if;
    elsif qq.type = 'numeric' then
      -- strip thousands separators + units, then take the first decimal number:
      -- "1,200.5 naira" -> 1200.5 ; "42 x" -> 42 ; "abc" -> NULL (wrong)
      -- backslash-free pattern (POSIX classes) so escaping differences between
      -- servers can never change grading semantics: strip whitespace + commas,
      -- then take the first decimal number. "1,200.5 naira" -> 1200.5
      gtext := replace(translate(coalesce(given #>> '{}', ''), E'\t \n', ''), ',', '');
      gnum := (regexp_match(gtext, '^[^0-9-]*(-?[0-9]+([.][0-9]+)?)'))[1]::numeric;
      ok := qq.answer_number is not null and gnum is not null
        and abs(gnum - qq.answer_number) <= coalesce(abs(qq.answer_tolerance), 0.0001);
    else
      gscalar := given #>> '{}';
      if gscalar ~ '^-?\d+$' and gscalar::int = coalesce(qq.correct_answer, -1) then ok := true; end if;
    end if;
    if ok then earned := earned + 1; end if;
    details := details || jsonb_build_object('questionId', qq.id, 'correct', ok, 'given', given);
  end loop;

  scr := case when total > 0 then round(earned * 100.0 / total)::int else 0 end;
  passed := scr >= coalesce(q.passing_score, 70);
  att_no := prior + 1;

  insert into public.quiz_attempts (quiz_id, course_id, user_id, answers, score, earned, total, passed, attempt_no)
  values (p_quiz_id, q.course_id, me, coalesce(p_answers, '{}'::jsonb), scr, earned, total, passed, att_no)
  returning id into att_id;

  -- XP: first passed attempt per quiz earns 20 XP (mirrors client rules)
  if passed and prior = 0 then
    insert into public.xp_events (user_id, rule, xp, ref_table, ref_id)
    values (me, 'quiz_passed', 20, 'quiz_attempts', att_id);
  elsif passed and not exists (
    select 1 from public.quiz_attempts a
    where a.quiz_id = p_quiz_id and a.user_id = me and a.passed = true and a.id != att_id
  ) then
    insert into public.xp_events (user_id, rule, xp, ref_table, ref_id)
    values (me, 'quiz_passed', 20, 'quiz_attempts', att_id);
  end if;

  insert into public.learning_events (user_id, course_id, kind, ref_id)
  values (me, q.course_id, 'quiz_attempt', att_id::text);

  return jsonb_build_object(
    'id', att_id, 'quizId', p_quiz_id, 'courseId', q.course_id,
    'score', scr, 'earned', earned, 'total', total, 'passed', passed,
    'attemptNo', att_no, 'details', details, 'answers', coalesce(p_answers, '{}'::jsonb)
  );
end $$;

-- ------------------------------------------------------------
-- 9. lessons_count sync — for projects whose curriculum lives in `lessons`
--    (backend lineage) the 004 trigger never fires, which left cards saying
--    "0 lessons" on the storefront. Same effect, guarded: only wired when a
--    `lessons` table actually exists.
-- ------------------------------------------------------------
create or replace function public.sync_lessons_count_from_lessons()
returns trigger language plpgsql security definer set search_path = public as $$
declare cid uuid; mid uuid;
begin
  if TG_OP = 'DELETE' then
    cid := old.course_id; mid := old.module_id;
  else
    cid := new.course_id; mid := new.module_id;
  end if;
  if cid is null and mid is not null then
    select course_id into cid from public.course_modules where id = mid;
  end if;
  if cid is not null then
    update public.courses c set lessons_count = (
      select count(*) from public.lessons l where l.course_id = c.id
    ) where c.id = cid;
  end if;
  if TG_OP = 'DELETE' then return old; else return new; end if;
end $$;

do $$ begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='lessons') then
    execute 'drop trigger if exists trg_lessons_count_legacy on public.lessons';
    execute 'create trigger trg_lessons_count_legacy after insert or delete on public.lessons
             for each row execute function public.sync_lessons_count_from_lessons()';
    execute 'update public.lessons l set course_id = m.course_id
             from public.course_modules m where l.course_id is null and m.id = l.module_id';
    execute 'update public.courses c set lessons_count = (
               select count(*) from public.lessons l where l.course_id = c.id)';
  end if;
end $$;

-- Backfill estimated_hours from lesson durations once (parse "14 min"/"2 h").
-- Kept tiny and fully guarded so it is a no-op on either schema lineage.
do $$ begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='course_lessons' and column_name='duration') then
    execute $inner$
      update public.courses c
         set estimated_hours = g.h
        from (
          select course_id,
                 round(sum(case
                     when d ~* 'hour' then (substring(d from '(\d+(\.\d+)?)'))::numeric
                     when d ~* 'min'  then (substring(d from '(\d+(\.\d+)?)'))::numeric / 60.0
                     else 0 end))::numeric as h
            from (select course_id, coalesce(nullif(duration, ''), '0 min') as d
                    from public.course_lessons) x
           where d ~* '\d+(\.\d+)?\s*(min|hour|h)\b'
           group by course_id
        ) g
       where g.course_id = c.id and c.estimated_hours is null;
    $inner$;
  end if;
end $$;

-- ------------------------------------------------------------
-- 10. Resource storage: enroll gate for the private `resources` bucket
--     (upload + read for students of the owning course via folder=courseId).
--     Buckets themselves are created in 003; this only adds policies.
-- ------------------------------------------------------------
drop policy if exists "resources enrolled read obj" on storage.objects;
create policy "resources enrolled read obj" on storage.objects
  for select using (bucket_id = 'resources' and (
    public.is_admin() or exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid() and e.status = 'active' and (storage.foldername(name))[1] = e.course_id::text
    )));
drop policy if exists "resources admin write obj" on storage.objects;
create policy "resources admin write obj" on storage.objects
  for insert with check (bucket_id = 'resources' and public.is_admin());
drop policy if exists "resources enrolled read course-videos" on storage.objects;
create policy "resources enrolled read course-videos" on storage.objects
  for select using (bucket_id = 'course-videos' and (
    public.is_admin() or exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid() and e.status = 'active' and (storage.foldername(name))[1] = e.course_id::text
    )));
drop policy if exists "resources enrolled read course-resources" on storage.objects;
create policy "resources enrolled read course-resources" on storage.objects
  for select using (bucket_id = 'course-resources' and (
    public.is_admin() or exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid() and e.status = 'active' and (storage.foldername(name))[1] = e.course_id::text
    )));

-- ------------------------------------------------------------
-- Verify block (SQL editor prints these; harmless elsewhere)
-- ------------------------------------------------------------
select
  (select count(*) from information_schema.tables where table_schema='public' and table_name='course_topics')        as topics_table,
  (select count(*) from information_schema.tables where table_schema='public' and table_name='lesson_practicals')   as practicals_table,
  (select count(*) from information_schema.tables where table_schema='public' and table_name='course_resources')   as resources_table,
  (select count(*) from information_schema.tables where table_schema='public' and table_name='practical_submissions') as practical_subs_table;
