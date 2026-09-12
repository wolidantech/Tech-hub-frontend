# Migration verification (PGlite)

Behaviorally verifies `supabase/migrations/001-003` in throwaway Postgres (PGlite):

```
cd supabase/verify && npm install && npm run verify
```

Expected: `39 passed, 0 failed`.

Caveat: PGlite runs as superuser so RLS *enforcement* cannot be tested here.
RLS is verified at policy-definition level (`pg_policies` assertions) and all
`SECURITY DEFINER` auth checks (`auth.uid()` / `is_admin()`) execute for real.
Full enforcement is covered by `scripts/smoke-supabase.mjs` against a live project.
