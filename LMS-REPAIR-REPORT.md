# LMS repair report — 2026-09-14

## Status
Frontend repair implemented and locally verified. **Not production-complete.** No production Supabase URL or public key is configured in this checkout/environment. Live responses, real science course contents, deployment, and authenticated device flows could not be verified. No database migrations, seed content, duplicate APIs, or production records were created/changed. Existing seed verification runs only inside throwaway PGlite.

## 1. Confirmed code-level causes
- `ensureCourseDetail` cached any curriculum, including public preview responses where RLS correctly returns no lesson bodies/videos. The cache survived login/enrollment and catalog refresh. It also attempted to synchronously read React state from a state setter callback.
- Learn redirected students before their enrollment request finished, and reported a missing course before the catalog finished.
- Learn called a `useMemo` after conditional returns, violating hook ordering when loading transitioned to available course data.
- Active lesson state kept the preview lesson object instead of being reselected after access/content changes.
- LMS quizzes/assignments loaded on user change only, not newly approved enrollment. Errors were swallowed as empty arrays.
- Written-only lessons initially opened the video view. Public YouTube watch URLs were passed directly to an iframe.
- Certificate availability was asserted from a client-side checklist, without a certificate record.

These defects are proven from code. Their contribution to the live Biology incident cannot be proven without production responses.

## 2. Files changed
- `src/context/CourseContext.jsx`: remove preview cache shortcut, reject outdated-access responses, invalidate curriculum on identity/enrollment changes, expose enrollment readiness/errors, remove full enrolled-course curriculum preloads; active enrollment matches checked-in RLS.
- `src/context/LMSContext.jsx`: explicit course-scoped assessment refresh.
- `src/pages/Learn.jsx`: stable hook ordering; loading/error/empty/retry; delayed enrollment redirect; reload curriculum and assessments on access changes; reset lesson selection; written-first rendering when no video; video error/retry and native direct-file playback; normalize YouTube embeds; safe resource URL handling; backend-record-gated certificate CTA.
- `src/pages/CourseDetails.jsx`: catalog loading/error, access-aware curriculum refresh, retry/empty curriculum, null-safe instructor.
- `src/pages/Enroll.jsx`: wait for course/enrollment data.
- `src/components/learn/QuizTaker.jsx`: retry failed question queries.
- `src/components/layout/Navbar.jsx`: more conservative desktop breakpoint, scrollable mobile navigation, accessible toggle, Escape and route-change close, shared SVG brand.
- `src/index.css`: lesson intrinsic sizing, bounded code/tables/media, mobile input sizing and focus visibility.
- `public/logo.svg`, `public/favicon.svg`: original matching full and icon branding.
- `public/sw.js`: new cache version and cache only static assets, not arbitrary same-origin GET APIs/files/dev modules.
- `src/tests/classroom.test.jsx`, `package.json`, `package-lock.json`: repeatable frontend regression suite.
- This report.

## 3. Database queries and schema contract
Existing DAL `src/lib/store.js` remains authoritative:
- Catalog: `courses` read, RLS-scoped.
- Detail: `courses.select('*').eq('id', courseId).single()`.
- Modules: `course_modules.select('*').eq('course_id', courseId).order('position')`.
- Lessons: `course_lessons.select('*').eq('course_id', courseId).order('position')`.
- Theory: `course_content.select('*').in('lesson_id', ids)`; `body_markdown` mapped by real lesson ID. One row per lesson is enforced by the checked-in schema.
- Videos: `course_videos.select('*').in('lesson_id', ids)`, mapped by lesson ID; uploaded video uses existing signed Storage URL helper.
- Resources/sub-lessons: `course_lessons.resources` and `sub_lessons` JSON fields (migration 007), not a separate topic hierarchy.
- Newly explicit classroom assessment reads: `quizzes` and `assignments`, each filtered by `course_id`.
- Enrollment: existing user-scoped `enrollments` query and payment-approval/coupon RPCs retained.
- Lesson completion/activity, quiz submission/review RPCs, assignment Storage/submission writes, certificate reads/realtime remain on existing Supabase implementations.

`course_content` and videos are RLS-protected. Public preview responses can legitimately contain no bodies; fetching those again after active enrollment is essential. Checked-in RLS allows active enrollments, not `completed`; backend must clarify whether completed enrollment status should retain access.

## 4. Routes repaired
`/course/:slug`, `/enroll/:slug`, `/learn/:slug` and shared navbar. No routes removed. Catalog links continue to use database slugs and classroom relations use database IDs.

Existing subsystems located: Auth/Course/LMS contexts; Courses, CourseDetails, Enroll, Learn, Dashboard, MyCourses; QuizTaker, AssignmentPanel, SignedFile, Discussions; Certificates/CertificateView/VerifyCertificate; admin CourseManager, AssignmentReview, QuizManager, PaymentsManager, StudentControl, AIStudio; DanTechAI, AIPage, CVBuilder, CareerHub. This is not a claim of exhaustive behavioral verification of those subsystems.

## 5. Mobile changes
Navigation falls back to its full mobile menu below 1600px so the many desktop controls do not compete at tablet/laptop widths. Menu has viewport-bounded scrolling. Existing curriculum drawer retained. Lesson media, long text, code and tables are constrained. Inputs avoid iOS small-font zoom. Native file-video player uses controls, playsInline, metadata preload and retryable errors. Previous/next row can wrap.

**Not performed:** browser layout tests at the requested 13 widths, physical Android/iPhone/iPad tests, mobile upload/keyboard/fullscreen checks, all admin table transformations. CSS changes are not a substitute for those tests.

## 6. Branding
Added an original full brand SVG and matching vector W icon, with Learn • Build • Grow tagline in the full mark. Navbar uses the full mark; existing favicon/PWA SVG references pick up the new icon. No official source artwork was supplied; this is not represented as approved official artwork. Universal replacement in login/PDF/certificates/CV/admin and raster Apple/PWA icons remain pending.

## 7. Tests
- `npm test`: **5 passed**. Classroom loading-to-content hook transition, enrollment wait, backend-shaped theory rendering, no false certificate availability, empty curriculum, retry recovery, unenrolled redirect (some covered together).
- Fixtures are strictly test-only and do not prove live course content exists.
- `npm run verify`: **45 passed**, migrations 001–008 and backend behavior in disposable PGlite.
- `npm run verify:seed`: **34 passed**, existing repository seed chain in disposable PGlite, not production science data.
- `git diff --check`: passed.

## 8. Build
`npm run build`: passed. Vite still warns about the shared main chunk exceeding 500 kB (approximately 754 kB uncompressed). Existing heavy-route lazy loading retained; broader bundle optimization remains.

## 9. Deployment
Not deployed, pushed, or committed. No deployment target or production frontend environment was supplied. Changes remain on the existing Arena session branch. No live preview was started because SetupGate would only show missing Supabase configuration.

## 10. Backend handoff / remaining blockers
1. Configure the existing production `VITE_SUPABASE_URL` and frontend-safe anon/publishable key in the environment; never supply service-role or AI secrets to frontend variables.
2. Supply a permitted test student/admin session through the normal app, not credentials in chat, and identify a published Biology course slug/ID.
3. Backend host should confirm deployed schema/migration versions and provide sanitized response shapes for that course's modules, lessons, content, resources, quizzes, assignments, and enrollment under public versus enrolled roles.
4. There is no separate `course_topics` table or dedicated practical submissions contract in checked-in migrations. Agree real topic/practical/assessment foreign keys and fields before implementation; do not duplicate existing backend structures. Current practical lesson types can display their database markdown and existing linked assignments, but this is not a dedicated structured practical submission UI.
5. Study hours, prerequisites, skills, structured practical fields and numerical quiz grading need confirmed fields/contracts. Missing metadata must not be fabricated.
6. Remaining requested work includes full structured practical UI; complete resource open/download/share including private resource paths; detailed topic/module progress and upcoming tasks; scoped/paginated loading across all LMS pages; end-to-end error handling; AI streaming/keyboard behavior verification; complete mobile admin and branding rollout.
7. Existing DanTECH lesson ID context and server endpoint integration are preserved. AI streaming/retry and no-key exposure have not been exhaustively audited. No new AI credentials were added.
8. Run the entire real register → login → science → enroll → classroom → resource/practical/assignment/quiz → progress → assessment → backend-issued certificate journey at all requested viewports and on real devices, then deploy and repeat against the deployed URL.

Do not use this local build/test result as production acceptance. Actual production course content rendering remains the release gate.

## Follow-up: complete-course experience implementation

### Additional implemented behavior
- Added `CourseAssessments.jsx`: published module quizzes/assignments grouped by real `module_id`, and course-level exams/final practical projects accessible independently of the current lesson. Lesson-specific assessments remain attached to lessons. No invented assessment records. Admin preview cannot submit from these panels.
- Added classroom course guide using existing database description, learning objectives and requirements. No unsupported prerequisites column was invented.
- Added `LessonBody.jsx` using Marked + DOMPurify: sanitized GFM tables, images, links, nested lists and literal fenced code for lessons and assignment instructions. Does not execute scripts, forms or iframe markup supplied in content.
- Added `LessonResources.jsx`: validated HTTP(S) resource URLs, Open, Download, device Share when supported, and honest missing-URL/download failure/retry handling. External hosts that prohibit CORS downloads can still be opened. Private resource path metadata still needs an agreed backend contract.
- Assignment file uploads now connect the UI to the existing XHR byte-progress transport through LMSContext and store.js. UI distinguishes upload from submission saving, preserves answers on failure and confirms success only after the database save resolves.
- `SignedFile.jsx` now catches signed-URL errors and offers retry; file actions wrap on narrow screens; video previews use playsInline.
- Added a two-minute XHR timeout. SDK fallback reports 100% only after upload succeeds.
- Removed “coming soon” language for absent lesson videos and quiz questions. Missing backend content is reported as absent, not fabricated.
- Lesson completion has a saving guard and admin-preview guard. Removed delayed next-lesson transition, which could move the learner unexpectedly after navigation.
- Sub-lesson checklist items no longer show misleading green completion ticks without recorded completion.

### Follow-up checks
`npm test`: **14 passed across 3 test files**. Covers the previous classroom regressions plus sanitized content rendering, literal code, resource URL validation/download retry, module/final assessment navigation, admin-preview safeguards, and assignment failure/retry/save behavior.

`npm run build`: **passed**. Large shared-chunk warning remains. `git diff --check`: passed. These are local tests with isolated test fixtures, not production-content or physical-device verification.

### Still required for the exact requested hierarchy
The checked-in backend schema supports Course → Module → Lesson, lesson content/resources/sub-lessons, module/lesson/course quizzes and assignments, progress and certificates. It does **not** establish a separate Topic → Lesson foreign key or dedicated structured practical record/submission tables. The frontend does not rename sub-lessons as topics and pretend those contracts exist.

Backend host must provide deployed table/view/RPC names and response shapes for:
- Topics, their module FK, and the lesson topic FK / ordering / publication fields.
- Structured practical objective, materials, procedure, observation, expected result, safety and submission linkage (whether existing assignments or a dedicated API).
- Final assessment linkage if separate from the existing `quizzes.is_final` and `assignments.is_final_project` models.
- Prerequisites and any additional course metadata not in current migrations.

Once those contracts and production frontend-safe connection settings are available, wire them without duplicate schemas and run the actual full-course acceptance journey. No production deployment or live-content acceptance is claimed by this follow-up.
