# Edge Functions

## invite-lecturer
Creates/invites a lecturer via Supabase Auth using the platform-provided
service-role key **on the server only**. Never put that key in Vite/browser code.

Deploy after migration 012:
```bash
supabase functions deploy invite-lecturer
```
The function rejects non-admin callers by checking `public.profiles.role`.
If it is not deployed, Admin → Lecturers shows a clear error and administrators
can instead register/promote an existing account from the same screen.
