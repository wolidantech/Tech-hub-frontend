# Migration & seed verification (PGlite)

Runs the real SQL in throwaway Postgres — no Supabase project, no network, no
cleanup.

```bash
cd supabase/verify
npm install
npm run verify        # migrations 001-006, behaviorally
npm run verify:seed   # the seed chain an administrator is told to run
```

Expected:

- `npm run verify` → `42 passed, 0 failed`
- `npm run verify:seed` → `24 passed, 0 failed`

## What each covers

`run.mjs` applies `migrations/001`–`006` on top of `stubs.sql` (which emulates
the Supabase-managed bits: `auth.users`, `auth.uid()`, `storage.buckets`) and
then exercises scoring, coupon redemption, payment approval, certificate
issuance, bundles, portfolios and the RLS hardening in 003.

`verify-seed.mjs` proves the setup sequence actually produces a working site:
the 12 seeded courses, the generated curriculum, idempotent re-runs, and the two
failure modes that are invisible until launch —

- `publish_courses.sql` leaves the storefront **non-empty**, and only publishes
  courses that have curriculum (no empty shells sold to paying students);
- `make_admin.sql` breaks the bootstrap deadlock (signup always creates a
  `student`, and `/admin/login` rejects non-admins) and refuses to run with the
  placeholder email still in place.

## Caveat

PGlite runs as superuser, so RLS **enforcement** cannot be tested here. Policies
are asserted at definition level (`pg_policies`) and every `SECURITY DEFINER`
auth check (`auth.uid()`, `is_admin()`) executes for real. Confirm enforcement
against a live project by logging out and loading `/courses` in a private window
— or open `/backend-status`, which probes the deployed backend directly.
