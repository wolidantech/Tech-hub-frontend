-- ============================================================
-- 012 — LECTURERS, ASSIGNMENTS OF COURSES, AND ADMIN REVIEW
-- ============================================================
-- NON-DESTRUCTIVE: this migration never deletes or rewrites student
-- accounts, courses, enrolments, payments, certificates or issued
-- student_id_cards. It only ADDs lecturer access, revision tables and
-- server-side workflow functions.
--
-- Exact workflow values (agreed contract with the frontend):
--   Content revisions: draft -> pending_review -> approved -> published
--                      pending_review -> changes_requested -> draft -> ...
--                      pending_review -> rejected -> draft -> ...
--   Grading revisions: draft -> pending_review -> approved -> released
--                      pending_review -> changes_requested/rejected -> draft
-- Students only ever read LIVE tables. Lecturer work lives in revision
-- tables until an admin publishes/releases the exact approved version.
-- ============================================================

-- ---------- Roles ----------
alter table public.profiles add column if not exists lecturer_enabled boolean not null default true;
-- Widen the role check without touching existing rows.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('student','admin','instructor','lecturer'));

create or replace function public.is_lecturer()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('lecturer','instructor')
      and coalesce(p.lecturer_enabled, true) = true and coalesce(p.banned, false) = false);
$$;

-- ---------- Course assignment ----------
create table if not exists public.lecturer_course_assignments (
  id uuid primary key default gen_random_uuid(),
  lecturer_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lecturer_id, course_id)
);
create index if not exists idx_lca_lecturer on public.lecturer_course_assignments(lecturer_id) where active;
create index if not exists idx_lca_course on public.lecturer_course_assignments(course_id) where active;
alter table public.lecturer_course_assignments enable row level security;

create or replace function public.is_assigned_lecturer(p_course_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_lecturer() and exists (
    select 1 from public.lecturer_course_assignments a
    where a.lecturer_id = auth.uid() and a.course_id = p_course_id and a.active);
$$;

drop policy if exists "lecturer assignments self read" on public.lecturer_course_assignments;
create policy "lecturer assignments self read" on public.lecturer_course_assignments
  for select using (auth.uid() = lecturer_id or public.is_admin());
-- No client writes: assignment changes go through admin RPCs below.

-- ---------- Invitations (account creation is server-side only) ----------
create table if not exists public.lecturer_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  token_hash text,
  status text not null default 'pending' check (status in ('pending','accepted','expired','revoked')),
  invited_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index if not exists idx_lecturer_invites_pending_email
  on public.lecturer_invitations (lower(email)) where status = 'pending';
alter table public.lecturer_invitations enable row level security;
drop policy if exists "lecturer invitations admin" on public.lecturer_invitations;
create policy "lecturer invitations admin" on public.lecturer_invitations
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Content revisions ----------
alter table public.quiz_questions add column if not exists marks int not null default 1 check (marks > 0);

create table if not exists public.lecturer_content_revisions (
  id uuid primary key default gen_random_uuid(),
  lecturer_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  item_type text not null check (item_type in ('module','lesson','quiz','assignment','material')),
  operation text not null check (operation in ('create','update','delete')),
  target_id uuid,
  title text not null default '',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in
    ('draft','pending_review','approved','published','changes_requested','rejected')),
  revision_version int not null default 1,
  submitted_version int,
  submitted_hash text,
  approved_version int,
  submitted_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_reason text,
  published_at timestamptz,
  published_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_lcr_queue on public.lecturer_content_revisions(status, submitted_at);
create index if not exists idx_lcr_lecturer on public.lecturer_content_revisions(lecturer_id, status);
alter table public.lecturer_content_revisions enable row level security;
drop policy if exists "content revisions lecturer own" on public.lecturer_content_revisions;
create policy "content revisions lecturer own" on public.lecturer_content_revisions
  for select using (auth.uid() = lecturer_id or public.is_admin());
-- No direct client INSERT/UPDATE/DELETE policies: RPCs enforce state machine.

-- ---------- Grading revisions ----------
create table if not exists public.lecturer_grading_revisions (
  id uuid primary key default gen_random_uuid(),
  lecturer_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  submission_id uuid not null references public.assignment_submissions(id) on delete cascade,
  proposed_score int not null check (proposed_score >= 0),
  proposed_feedback text not null default '',
  status text not null default 'draft' check (status in
    ('draft','pending_review','approved','released','changes_requested','rejected')),
  revision_version int not null default 1,
  submitted_version int,
  submitted_hash text,
  approved_version int,
  submitted_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_reason text,
  released_at timestamptz,
  released_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lecturer_id, submission_id)
);
create index if not exists idx_lgr_queue on public.lecturer_grading_revisions(status, submitted_at);
alter table public.lecturer_grading_revisions enable row level security;
drop policy if exists "grading revisions lecturer own" on public.lecturer_grading_revisions;
create policy "grading revisions lecturer own" on public.lecturer_grading_revisions
  for select using (auth.uid() = lecturer_id or public.is_admin());

-- ---------- Review activity / audit ----------
create table if not exists public.review_events (
  id uuid primary key default gen_random_uuid(),
  review_kind text not null check (review_kind in ('content','grading')),
  review_id uuid not null,
  course_id uuid references public.courses(id) on delete set null,
  lecturer_id uuid references public.profiles(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  from_status text,
  to_status text,
  comment text,
  created_at timestamptz not null default now()
);
create index if not exists idx_review_events_review on public.review_events(review_kind, review_id, created_at);
alter table public.review_events enable row level security;
drop policy if exists "review events participants" on public.review_events;
create policy "review events participants" on public.review_events
  for select using (public.is_admin() or auth.uid() = lecturer_id);

-- ---------- Private lecturer files ----------
insert into storage.buckets (id, name, public) values ('lecturer-files','lecturer-files', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "lecturer files owner read" on storage.objects;
create policy "lecturer files owner read" on storage.objects for select using (
  bucket_id = 'lecturer-files' and (
    public.is_admin()
    or auth.uid()::text = (storage.foldername(name))[1]
    or exists (select 1 from public.lecturer_content_revisions r
        where r.status = 'published' and r.payload->>'storagePath' = name
          and exists (select 1 from public.enrollments e
            where e.course_id = r.course_id and e.user_id = auth.uid() and e.status = 'active'))
  ));
drop policy if exists "lecturer files owner write" on storage.objects;
create policy "lecturer files owner write" on storage.objects for insert with check (
  bucket_id = 'lecturer-files' and public.is_lecturer()
  and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "lecturer files owner update" on storage.objects;
create policy "lecturer files owner update" on storage.objects for update using (
  bucket_id = 'lecturer-files' and (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1]));
drop policy if exists "lecturer files owner delete" on storage.objects;
create policy "lecturer files owner delete" on storage.objects for delete using (
  bucket_id = 'lecturer-files' and (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1]));

-- ---------- Lecturer read access (assigned courses only) ----------
drop policy if exists "lecturer assigned courses read" on public.courses;
create policy "lecturer assigned courses read" on public.courses
  for select using (public.is_assigned_lecturer(id));
drop policy if exists "lecturer assigned modules read" on public.course_modules;
create policy "lecturer assigned modules read" on public.course_modules
  for select using (public.is_assigned_lecturer(course_id));
drop policy if exists "lecturer assigned lessons read" on public.course_lessons;
create policy "lecturer assigned lessons read" on public.course_lessons
  for select using (public.is_assigned_lecturer(course_id));
drop policy if exists "lecturer assigned content read" on public.course_content;
create policy "lecturer assigned content read" on public.course_content
  for select using (exists (select 1 from public.course_lessons l
    where l.id = lesson_id and public.is_assigned_lecturer(l.course_id)));
drop policy if exists "lecturer assigned videos read" on public.course_videos;
create policy "lecturer assigned videos read" on public.course_videos
  for select using (exists (select 1 from public.course_lessons l
    where l.id = lesson_id and public.is_assigned_lecturer(l.course_id)));
drop policy if exists "lecturer assigned quizzes read" on public.quizzes;
create policy "lecturer assigned quizzes read" on public.quizzes
  for select using (public.is_assigned_lecturer(course_id));
drop policy if exists "lecturer assigned questions read" on public.quiz_questions;
create policy "lecturer assigned questions read" on public.quiz_questions
  for select using (exists (select 1 from public.quizzes q
    where q.id = quiz_id and public.is_assigned_lecturer(q.course_id)));
drop policy if exists "lecturer assigned assessments read" on public.assignments;
create policy "lecturer assigned assessments read" on public.assignments
  for select using (public.is_assigned_lecturer(course_id));
drop policy if exists "lecturer assigned submissions read" on public.assignment_submissions;
create policy "lecturer assigned submissions read" on public.assignment_submissions
  for select using (public.is_assigned_lecturer(course_id));
drop policy if exists "lecturer assigned enrollments read" on public.enrollments;
create policy "lecturer assigned enrollments read" on public.enrollments
  for select using (public.is_assigned_lecturer(course_id));

create or replace function public.lecturer_can_view_student(p_student uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_lecturer() and exists (
    select 1 from public.assignment_submissions s
    where s.user_id = p_student and public.is_assigned_lecturer(s.course_id));
$$;

drop policy if exists "lecturer submitter profiles read" on public.profiles;
create policy "lecturer submitter profiles read" on public.profiles
  for select using (public.lecturer_can_view_student(id));
-- NOTE: lecturers get NO insert/update/delete policies on live course,
-- quiz, assignment or submission tables. All changes flow via RPCs below.

-- ---------- Notification helpers ----------
create or replace function public.notify_user_internal(p_user uuid, p_type text, p_title text, p_message text, p_course uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_user is null then return; end if;
  insert into public.student_notifications (user_id, type, title, message, course_id)
  values (p_user, p_type, p_title, p_message, p_course);
end $$;

create or replace function public.notify_admins_internal(p_type text, p_title text, p_message text, p_course uuid default null)
returns void language plpgsql security definer set search_path = public as $$
declare a record;
begin
  for a in select id from public.profiles where role = 'admin' loop
    perform public.notify_user_internal(a.id, p_type, p_title, p_message, p_course);
  end loop;
end $$;

create or replace function public.review_hash(p_payload jsonb, p_operation text, p_type text)
returns text language sql immutable as $$
  select md5(coalesce(p_payload,'{}'::jsonb)::text || '|' || p_operation || '|' || p_type);
$$;

-- ---------- Admin: lecturer management ----------
create or replace function public.admin_promote_lecturer(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  update public.profiles set role = 'lecturer', lecturer_enabled = true
    where id = p_user_id and role <> 'admin';
  if not found then raise exception 'Account not found or is an administrator'; end if;
  insert into public.audit_logs (actor_email, actor_name, action, entity_type, entity_id, details)
  select email, full_name, 'lecturer.promote','profile',p_user_id::text,'{}'::jsonb from public.profiles where id = auth.uid();
  return jsonb_build_object('ok', true, 'userId', p_user_id, 'role', 'lecturer');
end $$;

create or replace function public.admin_set_lecturer_enabled(p_user_id uuid, p_enabled boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  update public.profiles set lecturer_enabled = p_enabled
    where id = p_user_id and role in ('lecturer','instructor');
  if not found then raise exception 'Lecturer not found'; end if;
  insert into public.audit_logs (actor_email, actor_name, action, entity_type, entity_id, details)
  select email, full_name, case when p_enabled then 'lecturer.enable' else 'lecturer.disable' end,
    'profile',p_user_id::text, jsonb_build_object('enabled', p_enabled) from public.profiles where id = auth.uid();
  return jsonb_build_object('ok', true, 'enabled', p_enabled);
end $$;

create or replace function public.admin_assign_lecturer_course(p_lecturer uuid, p_course uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if not exists (select 1 from public.profiles where id = p_lecturer and role in ('lecturer','instructor')) then
    raise exception 'That account is not a lecturer'; end if;
  insert into public.lecturer_course_assignments (lecturer_id, course_id, assigned_by, active)
  values (p_lecturer, p_course, auth.uid(), true)
  on conflict (lecturer_id, course_id) do update set active = true, assigned_by = auth.uid(), updated_at = now();
  perform public.notify_user_internal(p_lecturer,'lecturer_assigned','Course assigned',
    'An administrator assigned you a course. Open your lecturer dashboard to view it.', p_course);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.admin_unassign_lecturer_course(p_lecturer uuid, p_course uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  update public.lecturer_course_assignments set active = false, updated_at = now()
    where lecturer_id = p_lecturer and course_id = p_course;
  perform public.notify_user_internal(p_lecturer,'lecturer_unassigned','Course removed',
    'An administrator removed a course from your lecturer assignments.', p_course);
  return jsonb_build_object('ok', true);
end $$;

-- ---------- Lecturer: content drafts ----------
create or replace function public.lecturer_save_content_draft(
  p_course uuid, p_item_type text, p_operation text, p_target_id uuid,
  p_payload jsonb, p_revision_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r lecturer_content_revisions%rowtype; v_title text;
begin
  if not public.is_assigned_lecturer(p_course) then
    raise exception 'You are not assigned to this course'; end if;
  if p_operation in ('update','delete') and p_target_id is null then
    raise exception 'Choose the live item this revision changes'; end if;
  v_title := coalesce(nullif(p_payload->>'title',''), p_item_type);
  if p_revision_id is not null then
    update public.lecturer_content_revisions
      set payload = p_payload, title = v_title, item_type = p_item_type,
          operation = p_operation, target_id = p_target_id, updated_at = now()
      where id = p_revision_id and lecturer_id = auth.uid() and course_id = p_course
        and status in ('draft','changes_requested','rejected')
      returning * into r;
    if not found then raise exception 'This revision can no longer be edited — it is awaiting review, approved or published. Further edits need a new revision.'; end if;
  else
    insert into public.lecturer_content_revisions
      (lecturer_id, course_id, item_type, operation, target_id, title, payload)
    values (auth.uid(), p_course, p_item_type, p_operation, p_target_id, v_title, p_payload)
    returning * into r;
  end if;
  insert into public.review_events (review_kind, review_id, course_id, lecturer_id, actor_id, action, from_status, to_status)
  values ('content', r.id, p_course, auth.uid(), auth.uid(), 'save_draft', r.status, r.status);
  return jsonb_build_object('id', r.id, 'status', r.status, 'version', r.revision_version);
end $$;

create or replace function public.lecturer_delete_content_draft(p_revision_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  delete from public.lecturer_content_revisions
    where id = p_revision_id and lecturer_id = auth.uid()
      and status in ('draft','changes_requested','rejected');
  if not found then raise exception 'Only an editable draft can be discarded'; end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.lecturer_submit_content(p_revision_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r lecturer_content_revisions%rowtype;
begin
  update public.lecturer_content_revisions
    set status = 'pending_review', revision_version = revision_version + 1,
        submitted_version = revision_version + 1,
        submitted_hash = public.review_hash(payload, operation, item_type),
        submitted_at = now(), review_reason = null, updated_at = now()
    where id = p_revision_id and lecturer_id = auth.uid()
      and public.is_assigned_lecturer(course_id)
      and status in ('draft','changes_requested','rejected')
    returning * into r;
  if not found then raise exception 'Only your editable draft can be submitted for review'; end if;
  insert into public.review_events (review_kind, review_id, course_id, lecturer_id, actor_id, action, from_status, to_status)
  values ('content', r.id, r.course_id, auth.uid(), auth.uid(), 'submit', 'draft', 'pending_review');
  perform public.notify_admins_internal('review_pending','Lecturer work awaiting review',
    'A lecturer submitted ' || r.item_type || ' work for review: ' || r.title, r.course_id);
  return jsonb_build_object('id', r.id, 'status', r.status, 'version', r.submitted_version);
end $$;

-- Apply an APPROVED revision to live tables. Internal: called by publish RPC.
create or replace function public.apply_content_revision_internal(r record)
returns void language plpgsql security definer set search_path = public as $$
declare p jsonb := r.payload; v_module uuid; v_lesson uuid; v_quiz uuid; qq jsonb;
begin
  if r.operation = 'delete' then
    if r.item_type = 'module' then delete from public.course_modules where id = r.target_id;
    elsif r.item_type = 'lesson' then delete from public.course_lessons where id = r.target_id;
    elsif r.item_type = 'quiz' then delete from public.quizzes where id = r.target_id;
    elsif r.item_type = 'assignment' then delete from public.assignments where id = r.target_id;
    elsif r.item_type = 'material' then delete from public.course_videos where id = r.target_id;
    end if;
    return;
  end if;

  if r.item_type = 'module' then
    if r.operation = 'update' then
      update public.course_modules set title = p->>'title', position = coalesce((p->>'position')::int, position)
        where id = r.target_id;
    else
      insert into public.course_modules (course_id, title, position)
      values (r.course_id, p->>'title', coalesce((p->>'position')::int,0));
    end if;

  elsif r.item_type in ('lesson','material') then
    v_module := nullif(p->>'moduleId','')::uuid;
    if v_module is null and nullif(p->>'moduleTitle','') is not null then
      select id into v_module from public.course_modules
        where course_id = r.course_id and title = p->>'moduleTitle' order by position limit 1;
    end if;
    if r.operation = 'update' then
      update public.course_lessons set
        module_id = coalesce(v_module, module_id), title = coalesce(nullif(p->>'title',''), title),
        type = coalesce(nullif(p->>'type',''), type), duration = coalesce(p->>'duration', duration),
        position = coalesce((p->>'position')::int, position),
        resources = coalesce(p->'resources', resources)
        where id = r.target_id returning id into v_lesson;
    else
      if v_module is null then raise exception 'A module is required before publishing a lesson'; end if;
      insert into public.course_lessons (course_id, module_id, title, type, duration, position, resources)
      values (r.course_id, v_module, p->>'title', coalesce(nullif(p->>'type',''),'text'),
        coalesce(p->>'duration',''), coalesce((p->>'position')::int,0), coalesce(p->'resources','[]'::jsonb))
      returning id into v_lesson;
    end if;
    if nullif(p->>'bodyMarkdown','') is not null then
      insert into public.course_content (lesson_id, body_markdown) values (v_lesson, p->>'bodyMarkdown')
      on conflict (lesson_id) do update set body_markdown = excluded.body_markdown, updated_at = now();
    end if;
    if nullif(p->>'storagePath','') is not null or nullif(p->>'videoUrl','') is not null then
      insert into public.course_videos (lesson_id, provider, url, storage_path, status)
      values (v_lesson,
        case when nullif(p->>'storagePath','') is not null then 'upload' else 'external' end,
        nullif(p->>'videoUrl',''), nullif(p->>'storagePath',''), 'published');
    end if;

  elsif r.item_type = 'quiz' then
    if r.operation = 'update' then
      update public.quizzes set title = p->>'title', description = p->>'description',
        module_id = nullif(p->>'moduleId','')::uuid, lesson_id = nullif(p->>'lessonId','')::uuid,
        passing_score = coalesce((p->>'passingScore')::int, passing_score),
        allow_retake = coalesce((p->>'allowRetake')::boolean, allow_retake),
        attempt_limit = nullif(p->>'attemptLimit','')::int,
        is_final = coalesce((p->>'isFinal')::boolean, is_final), status = 'published'
        where id = r.target_id returning id into v_quiz;
      delete from public.quiz_questions where quiz_id = v_quiz;
    else
      insert into public.quizzes (course_id, module_id, lesson_id, title, description, passing_score,
          allow_retake, attempt_limit, is_final, status)
      values (r.course_id, nullif(p->>'moduleId','')::uuid, nullif(p->>'lessonId','')::uuid,
        p->>'title', p->>'description', coalesce((p->>'passingScore')::int,70),
        coalesce((p->>'allowRetake')::boolean,true), nullif(p->>'attemptLimit','')::int,
        coalesce((p->>'isFinal')::boolean,false), 'published')
      returning id into v_quiz;
    end if;
    for qq in select * from jsonb_array_elements(coalesce(p->'questions','[]'::jsonb)) loop
      insert into public.quiz_questions
        (quiz_id, type, question, options, correct_answer, correct_answers, accepted_answers, explanation, marks)
      values (v_quiz, coalesce(nullif(qq->>'type',''),'multiple_choice'), qq->>'question',
        coalesce(qq->'options','[]'::jsonb), nullif(qq->>'correctAnswer','')::int,
        coalesce(qq->'correctAnswers','[]'::jsonb),
        coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(qq->'acceptedAnswers','[]'::jsonb)) x), '{}'::text[]),
        qq->>'explanation', coalesce((qq->>'marks')::int,1));
    end loop;

  elsif r.item_type = 'assignment' then
    if r.operation = 'update' then
      update public.assignments set title = p->>'title', description = p->>'description',
        instructions = p->>'instructions', required_output = p->>'requiredOutput',
        max_score = coalesce((p->>'maxScore')::int, max_score),
        is_final_project = coalesce((p->>'isFinalProject')::boolean, is_final_project),
        deadline = nullif(p->>'deadline','')::timestamptz,
        submission_type = coalesce(nullif(p->>'submissionType',''), submission_type), status = 'published'
        where id = r.target_id;
    else
      insert into public.assignments (course_id, module_id, lesson_id, title, description, instructions,
          required_output, max_score, is_final_project, deadline, submission_type, status)
      values (r.course_id, nullif(p->>'moduleId','')::uuid, nullif(p->>'lessonId','')::uuid,
        p->>'title', p->>'description', p->>'instructions', p->>'requiredOutput',
        coalesce((p->>'maxScore')::int,100), coalesce((p->>'isFinalProject')::boolean,false),
        nullif(p->>'deadline','')::timestamptz, coalesce(nullif(p->>'submissionType',''),'any'), 'published');
    end if;
  end if;
end $$;

create or replace function public.admin_review_content(p_revision_id uuid, p_decision text, p_reason text default '')
returns jsonb language plpgsql security definer set search_path = public as $$
declare r lecturer_content_revisions%rowtype; v_to text;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if p_decision not in ('approved','changes_requested','rejected') then raise exception 'Invalid review decision'; end if;
  if p_decision <> 'approved' and coalesce(trim(p_reason),'') = '' then
    raise exception 'A reason is required when requesting changes or rejecting work'; end if;
  v_to := p_decision;
  update public.lecturer_content_revisions set status = v_to,
      approved_version = case when v_to='approved' then submitted_version else approved_version end,
      reviewed_by = auth.uid(), reviewed_at = now(), review_reason = nullif(trim(p_reason),''), updated_at = now()
    where id = p_revision_id and status = 'pending_review'
      and submitted_hash = public.review_hash(payload, operation, item_type)
    returning * into r;
  if not found then raise exception 'This submission is not awaiting review, or it changed after submission. Ask the lecturer to resubmit.'; end if;
  insert into public.review_events (review_kind, review_id, course_id, lecturer_id, actor_id, action, from_status, to_status, comment)
  values ('content', r.id, r.course_id, r.lecturer_id, auth.uid(), 'review', 'pending_review', v_to, nullif(trim(p_reason),''));
  perform public.notify_user_internal(r.lecturer_id,'review_decision',
    case when v_to='approved' then 'Work approved' else 'Review decision: ' || replace(v_to,'_',' ') end,
    coalesce(nullif(trim(p_reason),''), 'Your submitted ' || r.item_type || ' was ' || v_to || '.'), r.course_id);
  return jsonb_build_object('id', r.id, 'status', r.status);
end $$;

create or replace function public.admin_publish_content(p_revision_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r lecturer_content_revisions%rowtype;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  select * into r from public.lecturer_content_revisions where id = p_revision_id for update;
  if not found or r.status <> 'approved' then raise exception 'Only approved work can be published'; end if;
  if r.approved_version <> r.submitted_version
     or r.submitted_hash <> public.review_hash(r.payload, r.operation, r.item_type) then
    raise exception 'This approved version changed after approval. It must be reviewed again.'; end if;
  perform public.apply_content_revision_internal(r);
  update public.lecturer_content_revisions set status='published', published_at=now(),
    published_by=auth.uid(), updated_at=now() where id=r.id returning * into r;
  insert into public.review_events (review_kind, review_id, course_id, lecturer_id, actor_id, action, from_status, to_status)
  values ('content', r.id, r.course_id, r.lecturer_id, auth.uid(), 'publish', 'approved', 'published');
  perform public.notify_user_internal(r.lecturer_id,'review_published','Work published',
    'Your approved ' || r.item_type || ' is now live for students: ' || r.title, r.course_id);
  return jsonb_build_object('id', r.id, 'status', r.status);
end $$;

-- ---------- Lecturer: grading ----------
create or replace function public.lecturer_save_grade(p_submission uuid, p_score int, p_feedback text, p_grading_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s assignment_submissions%rowtype; g lecturer_grading_revisions%rowtype; a_max int;
begin
  select * into s from public.assignment_submissions where id = p_submission;
  if not found then raise exception 'Submission not found'; end if;
  if not public.is_assigned_lecturer(s.course_id) then raise exception 'You are not assigned to this course'; end if;
  select max_score into a_max from public.assignments where id = s.assignment_id;
  if p_score < 0 or p_score > coalesce(a_max,100) then
    raise exception 'Score must be between 0 and the assignment maximum mark'; end if;
  if p_grading_id is not null then
    update public.lecturer_grading_revisions set proposed_score=p_score, proposed_feedback=coalesce(p_feedback,''), updated_at=now()
      where id=p_grading_id and lecturer_id=auth.uid() and status in ('draft','changes_requested','rejected')
      returning * into g;
    if not found then raise exception 'This marking draft can no longer be edited'; end if;
  else
    insert into public.lecturer_grading_revisions (lecturer_id, course_id, submission_id, proposed_score, proposed_feedback)
    values (auth.uid(), s.course_id, p_submission, p_score, coalesce(p_feedback,''))
    on conflict (lecturer_id, submission_id) do update
      set proposed_score=excluded.proposed_score, proposed_feedback=excluded.proposed_feedback, updated_at=now()
      where public.lecturer_grading_revisions.status in ('draft','changes_requested','rejected')
    returning * into g;
    if g.id is null then raise exception 'This marking is awaiting review or already released'; end if;
  end if;
  return jsonb_build_object('id', g.id, 'status', g.status);
end $$;

create or replace function public.lecturer_submit_grade(p_grading_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare g lecturer_grading_revisions%rowtype;
begin
  update public.lecturer_grading_revisions set status='pending_review',
      revision_version=revision_version+1, submitted_version=revision_version+1,
      submitted_hash=md5(proposed_score::text || '|' || proposed_feedback), submitted_at=now(),
      review_reason=null, updated_at=now()
    where id=p_grading_id and lecturer_id=auth.uid() and public.is_assigned_lecturer(course_id)
      and status in ('draft','changes_requested','rejected') returning * into g;
  if not found then raise exception 'Only your editable marking draft can be submitted'; end if;
  insert into public.review_events (review_kind, review_id, course_id, lecturer_id, actor_id, action, from_status, to_status)
  values ('grading', g.id, g.course_id, auth.uid(), auth.uid(), 'submit', 'draft', 'pending_review');
  perform public.notify_admins_internal('grading_pending','Marking awaiting review',
    'A lecturer submitted marks and feedback for administrator review.', g.course_id);
  return jsonb_build_object('id', g.id, 'status', g.status);
end $$;

create or replace function public.admin_review_grade(p_grading_id uuid, p_decision text, p_reason text default '')
returns jsonb language plpgsql security definer set search_path = public as $$
declare g lecturer_grading_revisions%rowtype;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if p_decision not in ('approved','changes_requested','rejected') then raise exception 'Invalid review decision'; end if;
  if p_decision <> 'approved' and coalesce(trim(p_reason),'')='' then
    raise exception 'A reason is required when requesting changes or rejecting marking'; end if;
  update public.lecturer_grading_revisions set status=p_decision,
      approved_version=case when p_decision='approved' then submitted_version else approved_version end,
      reviewed_by=auth.uid(), reviewed_at=now(), review_reason=nullif(trim(p_reason),''), updated_at=now()
    where id=p_grading_id and status='pending_review'
      and submitted_hash=md5(proposed_score::text || '|' || proposed_feedback) returning * into g;
  if not found then raise exception 'This marking is not awaiting review, or changed after submission'; end if;
  insert into public.review_events (review_kind, review_id, course_id, lecturer_id, actor_id, action, from_status, to_status, comment)
  values ('grading', g.id, g.course_id, g.lecturer_id, auth.uid(), 'review', 'pending_review', p_decision, nullif(trim(p_reason),''));
  perform public.notify_user_internal(g.lecturer_id,'grading_decision','Marking review decision',
    coalesce(nullif(trim(p_reason),''), 'Your marking submission was ' || p_decision || '.'), g.course_id);
  return jsonb_build_object('id', g.id, 'status', g.status);
end $$;

create or replace function public.admin_release_grade(p_grading_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare g lecturer_grading_revisions%rowtype; lec text;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  select * into g from public.lecturer_grading_revisions where id=p_grading_id for update;
  if not found or g.status <> 'approved' then raise exception 'Only approved marking can be released'; end if;
  if g.approved_version <> g.submitted_version
     or g.submitted_hash <> md5(g.proposed_score::text || '|' || g.proposed_feedback) then
    raise exception 'This marking changed after approval and must be reviewed again'; end if;
  select full_name into lec from public.profiles where id=g.lecturer_id;
  -- This is the ONLY lecturer-originated write to a student's official record.
  update public.assignment_submissions set score=g.proposed_score, feedback=g.proposed_feedback,
      status='approved', reviewed_by=coalesce(lec,'Lecturer'), reviewed_at=now()
    where id=g.submission_id;
  update public.lecturer_grading_revisions set status='released', released_at=now(),
    released_by=auth.uid(), updated_at=now() where id=g.id returning * into g;
  insert into public.review_events (review_kind, review_id, course_id, lecturer_id, actor_id, action, from_status, to_status)
  values ('grading', g.id, g.course_id, g.lecturer_id, auth.uid(), 'release', 'approved', 'released');
  perform public.notify_user_internal(g.lecturer_id,'grading_released','Marks released',
    'An administrator released your approved marks to the student.', g.course_id);
  return jsonb_build_object('id', g.id, 'status', g.status);
end $$;

-- ---------- Unified admin queue ----------
create or replace view public.lecturer_review_queue as
  select 'content'::text as kind, r.id, r.lecturer_id, p.full_name as lecturer_name,
    r.course_id, c.title as course_title, r.item_type, r.title, r.status,
    r.submitted_at, r.created_at, r.review_reason
  from public.lecturer_content_revisions r
  left join public.profiles p on p.id = r.lecturer_id
  left join public.courses c on c.id = r.course_id
  union all
  select 'grading', g.id, g.lecturer_id, p.full_name, g.course_id, c.title,
    'marking', coalesce(a.title,'Assignment marking'), g.status,
    g.submitted_at, g.created_at, g.review_reason
  from public.lecturer_grading_revisions g
  left join public.profiles p on p.id = g.lecturer_id
  left join public.courses c on c.id = g.course_id
  left join public.assignment_submissions s on s.id = g.submission_id
  left join public.assignments a on a.id = s.assignment_id;

-- RPC execution: authenticated only (RLS inside functions re-checks role).
revoke all on function public.lecturer_save_content_draft(uuid,text,text,uuid,jsonb,uuid) from public;
revoke all on function public.lecturer_submit_content(uuid) from public;
revoke all on function public.admin_review_content(uuid,text,text) from public;
revoke all on function public.admin_publish_content(uuid) from public;
revoke all on function public.lecturer_save_grade(uuid,int,text,uuid) from public;
revoke all on function public.lecturer_submit_grade(uuid) from public;
revoke all on function public.admin_review_grade(uuid,text,text) from public;
revoke all on function public.admin_release_grade(uuid) from public;
grant execute on function public.lecturer_save_content_draft(uuid,text,text,uuid,jsonb,uuid),
  public.lecturer_submit_content(uuid), public.lecturer_delete_content_draft(uuid),
  public.admin_review_content(uuid,text,text), public.admin_publish_content(uuid),
  public.admin_promote_lecturer(uuid), public.admin_set_lecturer_enabled(uuid,boolean),
  public.admin_assign_lecturer_course(uuid,uuid), public.admin_unassign_lecturer_course(uuid,uuid),
  public.lecturer_save_grade(uuid,int,text,uuid), public.lecturer_submit_grade(uuid),
  public.admin_review_grade(uuid,text,text), public.admin_release_grade(uuid)
  to authenticated;

select pg_notify('pgrst', 'reload schema');
