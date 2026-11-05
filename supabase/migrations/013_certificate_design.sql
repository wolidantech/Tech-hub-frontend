-- ============================================================
-- 013 — CERTIFICATE DESIGN: programme wording, completion date,
--       validity period and schedule reference
-- ------------------------------------------------------------
-- The certificate sheet is being redesigned to the institutional layout the
-- owner supplied: masthead + crest, programme description sentence, issue date,
-- program completion date, two signatures, a red/gold seal and a verification
-- strip carrying the schedule ID and QR code.
--
-- Everything on that sheet has to be REAL data. Three of those fields did not
-- exist anywhere in the database, so this migration adds them:
--
--   * program completion date  — when the student actually finished, which is
--                                not the same day the certificate was issued.
--                                Derived from lesson progress / approved
--                                submissions / quiz attempts, and snapshotted
--                                onto the certificate at issue time.
--   * programme wording        — the description sentence and programme label,
--                                editable per course by an administrator.
--   * validity period + schedule ID — printed on the sheet and encoded in the
--                                public verifier's response.
--
-- NON-DESTRUCTIVE. No certificate_id, verification_code, student_name,
-- course_name, issue_date or status is ever rewritten. The backfill only fills
-- the NEW columns, and is idempotent: a second run changes nothing because every
-- assignment is coalesce(existing, derived).
--
-- Issued identities and links therefore keep working exactly as before; the
-- sheet simply has more of the truth on it.
--
-- Idempotent: safe on a fresh project and safe to re-run.
-- ============================================================

-- ---------- 1. Per-course programme wording (admin editable) ----------
alter table public.courses
  add column if not exists program_label       text,  -- e.g. 'Digital Skills Programme'
  add column if not exists program_description text,  -- the sentence printed on the sheet
  add column if not exists validity_months     int,   -- null = valid with no expiry
  add column if not exists schedule_id         text;  -- e.g. 'DH-2026-AI-01'

comment on column public.courses.program_description is
  'Certificate wording: the programme description sentence. Null falls back to a generated default on the sheet.';
comment on column public.courses.validity_months is
  'Certificate validity in months from the issue date. Null means the certificate does not expire.';
comment on column public.courses.schedule_id is
  'Optional cohort/schedule reference printed on the certificate and its verification strip.';

-- 1..120 months, or no expiry at all.
do $cert_validity_check$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'courses_validity_months_check'
      and conrelid = 'public.courses'::regclass
  ) then
    alter table public.courses
      add constraint courses_validity_months_check
      check (validity_months is null or (validity_months > 0 and validity_months <= 120));
  end if;
end $cert_validity_check$;

-- ---------- 2. Snapshot columns on the issued certificate ----------
-- Deliberately separate columns rather than reads of public.courses at render
-- time: a re-issue, a course rename or a wording change must never silently
-- rewrite a certificate that was already awarded.
alter table public.certificate_issues
  add column if not exists completion_date     timestamptz,
  add column if not exists program_label       text,
  add column if not exists program_description text,
  add column if not exists program_duration    text,
  add column if not exists validity_months     int,
  add column if not exists schedule_id         text;

comment on column public.certificate_issues.completion_date is
  'When the student actually completed the programme. Printed as "Program Completion Date".';
comment on column public.certificate_issues.program_duration is
  'Programme length snapshot (e.g. "15-week Bootcamp"), copied from the course at issue time.';

-- ---------- 3. Derive the real completion date ----------
-- Latest of: last completed lesson, last approved submission review, last quiz
-- attempt. Falls back to now() so a manually issued certificate still has a
-- sensible value instead of NULL.
create or replace function public.certificate_completion_date(p_user_id uuid, p_course_id uuid)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select max(lp.completed_at) from public.lesson_progress lp
      where lp.user_id = p_user_id and lp.course_id = p_course_id),
    (select max(coalesce(s.reviewed_at, s.submitted_at)) from public.assignment_submissions s
      where s.user_id = p_user_id and s.course_id = p_course_id and s.status = 'approved'),
    (select max(qa.created_at) from public.quiz_attempts qa
      where qa.user_id = p_user_id and qa.course_id = p_course_id),
    now()
  );
$$;

comment on function public.certificate_completion_date(uuid, uuid) is
  'Best available evidence of when a student finished a course, for the certificate program completion date.';

-- ---------- 4. Stamp the snapshot on every new certificate ----------
-- A BEFORE INSERT trigger rather than edits to maybe_issue_certificate() and
-- issue_certificate_manual(): every issue path (existing trigger, manual admin
-- issue, any future path) goes through an INSERT on this table, so this is the
-- one place that guarantees the snapshot is filled and can never drift.
create or replace function public.snapshot_certificate_programme()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare c record;
begin
  select title, duration, program_label, program_description, validity_months, schedule_id
    into c
    from public.courses where id = new.course_id;

  if new.completion_date is null then
    new.completion_date := public.certificate_completion_date(new.user_id, new.course_id);
  end if;
  if new.course_name is null or btrim(new.course_name) = '' then
    new.course_name := c.title;
  end if;

  -- Explicitly supplied values win; the course's wording fills the blanks.
  new.program_label       := coalesce(nullif(btrim(coalesce(new.program_label, '')), ''), c.program_label);
  new.program_description := coalesce(nullif(btrim(coalesce(new.program_description, '')), ''), c.program_description);
  new.program_duration    := coalesce(nullif(btrim(coalesce(new.program_duration, '')), ''), nullif(btrim(coalesce(c.duration, '')), ''));
  new.validity_months     := coalesce(new.validity_months, c.validity_months);
  new.schedule_id         := coalesce(nullif(btrim(coalesce(new.schedule_id, '')), ''), c.schedule_id);

  return new;
end $$;

drop trigger if exists trg_certificate_programme_snapshot on public.certificate_issues;
create trigger trg_certificate_programme_snapshot
  before insert on public.certificate_issues
  for each row execute function public.snapshot_certificate_programme();

-- ---------- 5. Backfill certificates that were already issued ----------
-- Only the new columns are touched, and only where they are still empty, so a
-- re-run is a no-op and no awarded certificate changes.
update public.certificate_issues ci
   set completion_date     = coalesce(ci.completion_date, public.certificate_completion_date(ci.user_id, ci.course_id)),
       program_label       = coalesce(ci.program_label, c.program_label),
       program_description = coalesce(ci.program_description, c.program_description),
       program_duration    = coalesce(ci.program_duration, nullif(btrim(coalesce(c.duration, '')), '')),
       validity_months     = coalesce(ci.validity_months, c.validity_months),
       schedule_id         = coalesce(ci.schedule_id, c.schedule_id)
  from public.courses c
 where c.id = ci.course_id
   and (ci.completion_date is null
        or ci.program_duration is null
        or ci.validity_months is null
        or ci.schedule_id is null
        or ci.program_description is null
        or ci.program_label is null);

-- ---------- 6. Public verifier returns the fields the sheet prints ----------
-- Same shape as migration 010, plus the new fields. Lookup by certificate ID or
-- verification code is unchanged, so every existing QR code and printed link
-- keeps resolving. Falls back to the live course row when a snapshot is empty
-- (rows issued before this migration).
create or replace function public.verify_certificate(p_code text)
returns jsonb language plpgsql security definer
set search_path = public
as $$
declare
  r record;
  c record;
  v_label     text;
  v_desc      text;
  v_duration  text;
  v_validity  int;
  v_schedule  text;
  v_completed timestamptz;
  v_until     timestamptz;
begin
  select * into r from public.certificate_issues
   where certificate_id = trim(p_code) or verification_code = trim(p_code);
  if not found then return jsonb_build_object('found', false); end if;

  -- When the course row is gone, SELECT INTO leaves every field NULL, and the
  -- coalesce() chain below falls back to whatever the certificate snapshot has.
  select title, duration, program_label, program_description, validity_months, schedule_id
    into c from public.courses where id = r.course_id;

  v_label     := coalesce(nullif(btrim(coalesce(r.program_label, '')), ''), c.program_label);
  v_desc      := coalesce(nullif(btrim(coalesce(r.program_description, '')), ''), c.program_description);
  v_duration  := coalesce(nullif(btrim(coalesce(r.program_duration, '')), ''), nullif(btrim(coalesce(c.duration, '')), ''));
  v_validity  := coalesce(r.validity_months, c.validity_months);
  v_schedule  := coalesce(nullif(btrim(coalesce(r.schedule_id, '')), ''), c.schedule_id);
  v_completed := coalesce(r.completion_date, public.certificate_completion_date(r.user_id, r.course_id));
  v_until     := case when v_validity is null then null
                      else r.issue_date + make_interval(months => v_validity) end;

  return jsonb_build_object(
    'found', true,
    'status', r.status,
    'studentName', coalesce(nullif(btrim(coalesce(r.student_name, '')), ''), 'Student'),
    'courseName', coalesce(nullif(btrim(coalesce(r.course_name, '')), ''), c.title),
    'issueDate', r.issue_date,
    'certificateId', r.certificate_id,
    'verificationCode', r.verification_code,
    'issuedBy', 'WOLI DAN TECH HUB',
    'completionDate', v_completed,
    'programLabel', v_label,
    'programDescription', v_desc,
    'programDuration', v_duration,
    'validityMonths', v_validity,
    'validUntil', v_until,
    'scheduleId', v_schedule
  );
end $$;

comment on function public.verify_certificate(text) is
  'Looks a certificate up by ID or verification code. Returns the full holder name, verification code and the programme details the certificate sheet prints.';

-- ---------- 7. Admin: edit the certificate wording for a course ----------
create or replace function public.admin_set_course_certificate_wording(
  p_course_id uuid,
  p_program_label text default null,
  p_program_description text default null,
  p_validity_months int default null,
  p_schedule_id text default null
)
returns jsonb language plpgsql security definer
set search_path = public
as $$
declare admin_email text; updated int;
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if p_validity_months is not null and (p_validity_months < 1 or p_validity_months > 120) then
    raise exception 'validity_months must be between 1 and 120, or null for no expiry';
  end if;

  update public.courses
     set program_label       = nullif(btrim(coalesce(p_program_label, '')), ''),
         program_description = nullif(btrim(coalesce(p_program_description, '')), ''),
         validity_months     = p_validity_months,
         schedule_id         = nullif(btrim(coalesce(p_schedule_id, '')), '')
   where id = p_course_id;
  get diagnostics updated = row_count;
  if updated = 0 then raise exception 'Course not found'; end if;

  select email into admin_email from public.profiles where id = auth.uid();
  insert into public.audit_logs (actor_email, actor_name, action, entity_type, entity_id, details)
  values (admin_email, admin_email, 'course.certificate_wording', 'course', p_course_id::text,
    jsonb_build_object('validityMonths', p_validity_months, 'scheduleId', p_schedule_id));

  return jsonb_build_object('ok', true);
end $$;

comment on function public.admin_set_course_certificate_wording(uuid, text, text, int, text) is
  'Admin only. Sets the programme label/description, validity period and schedule ID printed on certificates for a course. Already-issued certificates keep their snapshot.';

grant execute on function public.admin_set_course_certificate_wording(uuid, text, text, int, text) to authenticated;
