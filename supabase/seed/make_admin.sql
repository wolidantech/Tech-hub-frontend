-- ============================================================
-- WOLI DAN TECH HUB — Make the first administrator
-- ------------------------------------------------------------
-- WHY THIS FILE EXISTS
--   The signup trigger (migration 003, handle_new_user) always creates
--   profiles with role = 'student'. Nothing in the migrations, the seed or the
--   UI ever promotes anyone, and /admin/login rejects every non-admin. That is
--   a deadlock: only an admin can publish courses, approve payments or issue
--   certificates, but nobody can become one.
--
-- HOW TO USE
--   1. Register on the site normally (this creates the profiles row).
--   2. Open Supabase Dashboard -> SQL Editor, paste this file.
--   3. Change the email on the TARGET EMAIL line to yours.
--   4. Run. Then log in at /admin/login.
--
--   Idempotent and narrow: it only touches the profiles row for that one email.
--   Run it as the SQL Editor (superuser) — RLS does not apply there.
-- ============================================================

do $$
declare
  target_email text := 'you@example.com';   -- <<< TARGET EMAIL: edit this line
  target_id uuid;
begin
  if target_email = 'you@example.com' then
    raise exception 'Edit the TARGET EMAIL line first — it still holds the placeholder.';
  end if;

  select id into target_id
  from public.profiles
  where lower(email) = lower(target_email);

  if target_id is null then
    raise exception
      'No profile row for %. Register on the site first so the signup trigger creates it, then re-run. If it still fails, migration 003 was never applied (it owns the on_auth_user_created trigger).',
      target_email;
  end if;

  update public.profiles
     set role = 'admin',
         banned = false
   where id = target_id;

  raise notice 'Promoted % to admin (profile %)', target_email, target_id;
end $$;

-- ---------- Verify ----------
-- Expect exactly one row per administrator, role = admin, banned = false.
select email, role, banned, created_at
from public.profiles
where role = 'admin'
order by created_at;
