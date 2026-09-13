# WOLI DAN TECH HUB — AI-Powered LMS

Complete online learning management system: courses, manual bank-transfer
payments, coupons, quizzes, practical assignments, AI content studio, analytics,
and verifiable certificates.

## Run

```bash
npm install
npm run dev     # http://localhost:5173
npm run build
```

No backend required — runs fully on a local store with offline AI templates.
Optional integrations via `.env` (see `.env.example`):

- **Supabase** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) — schema + RLS in
  `supabase/migrations/001_lms_core.sql`
- **Secure AI backend** (`VITE_AI_ENDPOINT`) — reference gateway in
  `server/ai-gateway.example.mjs` (API keys stay server-side only)

## Key routes

| Route | Who |
|---|---|
| `/` `/courses` `/course/:slug` | Public |
| `/register` `/login` | Students |
| `/dashboard` `/my-courses` `/my-payments` `/learn/:slug` `/certificates` `/profile` | Students (auth) |
| `/enroll/:slug` (bank transfer + coupons) | Students (auth) |
| `/verify-certificate` `/certificate/:id` | Public |
| `/admin/login` `/admin/dashboard` | Admin |

Admin tabs: Overview (analytics) • Courses (curriculum builder, thumbnails,
publish, completion rules) • Students (360° control) • Quizzes • Assignments
(review) • Coupons • AI Studio • Payments • Certificates • Notify • Audit • Settings.

## Architecture notes

- `src/context/CourseContext.jsx` — courses, enrollments, payments, progress, certificates
- `src/context/LMSContext.jsx` — quizzes, assignments, coupons, AI drafts, audit, announcements
- `src/lib/lms.js` — shared validation/scoring logic (mirror server-side in prod)
- `src/lib/ai.js` — provider-independent AI service (secure-backend → offline fallback)
- `src/lib/supabase.js` — optional Supabase adapter + signed URLs
- All AI output enters as **DRAFT** and requires admin review before publishing.
