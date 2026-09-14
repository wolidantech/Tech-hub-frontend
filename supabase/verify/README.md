# Migration and seed verification (PGlite)

The checks run the real SQL in throwaway PostgreSQL (PGlite): no Supabase
project, network connection, credentials, or cleanup is required.

From the repository root:

```bash
npm ci
npm --prefix supabase/verify ci
npm run verify
npm run verify:seed
```

Expected:

- `npm run verify` → `46 passed, 0 failed`
- `npm run verify:seed` → `38 passed, 0 failed`

## Coverage

`run.mjs` applies migrations 001–009 to a fresh database and behaviorally tests
auth/profile setup, scoring, coupons, payments, certificates, portfolios,
storage policy definitions, study tools, and migration 009.

The migration-009 regression creates separate non-owner `verify_anon` and
`verify_authenticated` PostgreSQL roles. After switching to them, it confirms
that RLS is actually enforced: no `is_admin()` recursion, public access only to
published/unarchived catalog titles, no anonymous body/video access, and body +
published-video access for an active enrollment. It also verifies
`is_admin()` is `SECURITY DEFINER`, every elevated `public` function has
`search_path=public`, and applying 009 a second time is clean.

`verify-seed.mjs` proves the documented setup sequence produces exactly the 12
expected launch slugs, 48 modules, 192 lessons, 192 full bodies, 192 resource
sets, 192 published YouTube videos, 12 quizzes, 120 questions, 12 final projects,
and four published learning paths. It executes the seeds twice to prove stable
row counts, verifies the migration column contract, and confirms
`publish_courses.sql`:

- newly publishes a draft only when it has a module;
- does not publish an empty custom draft;
- never unpublishes an already-published row.

It also executes `verify_curriculum.sql` against the complete migrated seed
chain, so the SQL Editor inventory and release-blocker diagnostics are
syntax-checked automatically.

Most non-authorization behavior tests run as the database owner for predictable
fixtures. The dedicated RLS regression is the enforcement test; policy metadata
checks alone are not treated as proof of authorization.
