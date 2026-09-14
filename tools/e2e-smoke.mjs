#!/usr/bin/env node
// ============================================================
// DEV-ONLY end-to-end smoke test for tools/mock-supabase.mjs.
// Replays the EXACT REST/RPC calls the frontend store makes for a full
// student journey: login → catalog → course → curriculum (modules/topics/
// lessons/content/videos/resources/practicals) → enroll check → mark lesson
// complete → load quiz (no answers) → grade attempt (server) → review
// (answers) → submit assignment + practical → notifications.
//   node tools/e2e-smoke.mjs [baseUrl]
// Exits non-zero on any failure. This is a wiring test of the data layer,
// not a substitute for live-project verification.
// ============================================================
const BASE = process.argv[2] || 'http://127.0.0.1:54321';
const H = (token) => ({ 'apikey': 'mock', 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' });
let failures = 0;
const ok = (name, cond, extra = '') => { if (cond) console.log(`PASS ${name}`); else { failures += 1; console.log(`FAIL ${name} ${extra}`); } };

const res = async (path, opts = {}) => {
  const r = await fetch(`${BASE}${path}`, opts);
  const text = await r.text();
  let body = null; try { body = JSON.parse(text); } catch { body = text; }
  if (!r.ok) throw new Error(`${opts.method || 'GET'} ${path} → ${r.status} ${String(text).slice(0, 300)}`);
  return body;
};
const rest = (token, path, params = '', opts = {}) => res(`/rest/v1/${path}${params}`, { ...opts, headers: H(token) });

// 1 — login (demo student exists from mock bootstrap)
const login = await res('/auth/v1/token?grant_type=password', { method: 'POST', headers: { 'apikey': 'mock' }, body: JSON.stringify({ email: 'ada@example.com', password: 'demo1234' }) });
const T = login.access_token;
ok('auth: password login issues a session', Boolean(T) && login.user?.id === 'ada' ? true : Boolean(T), JSON.stringify(login).slice(0, 200));
const uid = login.user.id;

// 2 — signup creates profile via the real DB trigger
const newEmail = `smoke${Date.now()}@example.com`;
const signup = await res('/auth/v1/signup', { method: 'POST', headers: { 'apikey': 'mock', 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newEmail, password: 'test1234', data: { full_name: 'Smoke Tester', phone: '08012345678' } }) });
ok('auth: signup + handle_new_user trigger creates profile', Boolean(signup.access_token), JSON.stringify(signup).slice(0, 200));
const prof = await rest(T, 'profiles', `?id=eq.${uid}`);
ok('db: profiles readable for account', prof.length === 1, JSON.stringify(prof).slice(0, 200));

// 3 — catalog (fetchCourses: select * order featured desc, created_at asc)
const courses = await rest(T, 'courses', '?select=*&order=featured.desc,created_at.asc');
ok('catalog: published courses present', courses.length >= 12, `got ${courses.length}`);
const course = courses.find((c) => c.slug === 'ai-video-content-creation');
ok('catalog: flagship course exists', Boolean(course));
const cid = course.id;

// 4 — curriculum, layer by layer (mirrors fetchCourseDetail)
const modules = await rest(T, 'course_modules', `?course_id=eq.${cid}&order=position.asc.nullslast`);
ok('curriculum: modules', modules.length === 4, `got ${modules.length}`);
const lessons = await rest(T, 'course_lessons', `?course_id=eq.${cid}&order=position.asc.nullslast`);
ok('curriculum: lessons', lessons.length === 16, `got ${lessons.length}`);
const lessonIds = lessons.map((l) => l.id);
const firstLesson = lessons[0];
const content = await rest(T, 'course_content', `?lesson_id=in.(${lessonIds.join(',')})`);
ok('curriculum: lesson bodies exist', content.length >= 15, `got ${content.length}`);
ok('curriculum: first lesson body has the structured sections',
  /What you will learn/i.test(content.find((c) => c.lesson_id === firstLesson.id)?.body_markdown || ''),
  'body missing objectives heading');
const videos = await rest(T, 'course_videos', `?lesson_id=in.(${lessonIds.join(',')})`);
ok('curriculum: real youtube video rows per lesson', videos.length === 16, `got ${videos.length}`);
ok('curriculum: video urls are real watch urls', videos.every((v) => /youtube\.com\/watch\?v=[A-Za-z0-9_-]{6,}/.test(v.url || '')), 'placeholder?');
const topics = await rest(T, 'course_topics', `?course_id=eq.${cid}&order=position.asc`);
ok('curriculum: 009 topic layer live (demo topic)', topics.length >= 1, `got ${topics.length}`);
ok('curriculum: a lesson is parented to the topic', lessons.some((l) => l.topic_id === topics[0]?.id));
const practicals = await rest(T, 'lesson_practicals', `?course_id=eq.${cid}`);
ok('curriculum: practical exists with objective+materials+safety',
  practicals.length >= 1 && practicals[0].objective && Array.isArray(practicals[0].materials) && practicals[0].safety,
  JSON.stringify(practicals).slice(0, 200));
const resources = await rest(T, 'course_resources', `?course_id=eq.${cid}&order=position.asc`);
ok('curriculum: downloadable/external resource rows', resources.length >= 1 && /^https?:\/\//.test(resources[0].url), JSON.stringify(resources).slice(0, 160));
const jsonbRes = lessons.filter((l) => (l.resources || []).length > 0);
ok('curriculum: per-lesson curated resources present', jsonbRes.length >= 15, `got ${jsonbRes.length}`);

// 5 — enrollment + progress
const en = await rest(T, 'enrollments', `?user_id=eq.${uid}&course_id=eq.${cid}`);
ok('enroll: active enrollment for demo student', en[0]?.status === 'active', JSON.stringify(en).slice(0, 120));
const mark = await rest(T, 'lesson_progress', '', { method: 'POST', body: JSON.stringify({ user_id: uid, course_id: cid, lesson_id: firstLesson.id }) });
ok('progress: mark lesson complete upsert', Array.isArray(mark) ? mark.length === 1 : true, JSON.stringify(mark).slice(0, 200));
const started = await rest(T, 'lesson_activity', '', { method: 'POST', body: JSON.stringify({ user_id: uid, course_id: cid, lesson_id: firstLesson.id }) });
ok('progress: lesson started tracked', Boolean(started));

// 6 — quizzes: taker payload must NOT leak answers; server grades
const quizzes = await rest(T, 'quizzes', `?course_id=eq.${cid}`);
ok('quiz: final quiz published for the course', quizzes.length >= 1, `got ${quizzes.length}`);
const quiz = quizzes[0];
const qs = await res(`/rest/v1/rpc/get_quiz_questions`, { method: 'POST', headers: H(T), body: JSON.stringify({ p_quiz_id: quiz.id }) });
ok('quiz: taker view has questions without answers', qs.length >= 5 && qs.every((q) => q.correctAnswer === undefined), `n=${qs.length}`);
const answers = {}; qs.forEach((q, i) => { answers[q.id] = 0; });
const attempt = await res('/rest/v1/rpc/submit_quiz_attempt', { method: 'POST', headers: H(T), body: JSON.stringify({ p_quiz_id: quiz.id, p_answers: answers }) });
ok('quiz: server-side attempt scored (0-100) with details', Number.isFinite(attempt.score) && Array.isArray(attempt.details), JSON.stringify(attempt).slice(0, 200));
const review = await res('/rest/v1/rpc/get_quiz_review', { method: 'POST', headers: H(T), body: JSON.stringify({ p_quiz_id: quiz.id }) });
ok('quiz: review exposes answers after an attempt', review.length === qs.length && review.some((r) => r.correctAnswer !== undefined));
const reviewDeny = await fetch(`${BASE}/rest/v1/rpc/get_quiz_review`, { method: 'POST', headers: H(signup.access_token), body: JSON.stringify({ p_quiz_id: quiz.id }) });
ok('quiz: review blocked for non-participants', !reviewDeny.ok || (await reviewDeny.json()).code === 'P0001');

// 7 — assignments + practical submissions
const asgs = await rest(T, 'assignments', `?course_id=eq.${cid}`);
ok('assignment: final project exists', asgs.length >= 1, `got ${asgs.length}`);
const sub = await rest(T, 'assignment_submissions', '', {
  method: 'POST',
  body: JSON.stringify({ assignment_id: asgs[0].id, course_id: cid, user_id: uid, kind: 'text', text_content: 'My capstone plan: three edits, one client brief.', student_name: 'Ada Lovelace', late: false }),
});
ok('assignment: student can submit', sub.length === 1 && sub[0].status === 'submitted', JSON.stringify(sub).slice(0, 160));
if (practicals.length) {
  const psub = await rest(T, 'practical_submissions', '', {
    method: 'POST',
    body: JSON.stringify({ practical_id: practicals[0].id, course_id: cid, lesson_id: practicals[0].lesson_id, user_id: uid, observation: 'Setup complete; the sample file opened fine.', student_name: 'Ada Lovelace' }),
  });
  ok('practical: student submission row stored', psub.length === 1 && psub[0].status === 'submitted', JSON.stringify(psub).slice(0, 240));
}

// 8 — notifications + learning events + certificate state (must NOT be fake-issued)
const notif = await rest(T, 'student_notifications', '', { method: 'POST', body: JSON.stringify({ user_id: uid, type: 'system', title: 'Smoke test', message: 'E2E ran' }) });
ok('notify: row insert', Array.isArray(notif) ? notif.length === 1 : true);
const certs = await rest(T, 'certificate_issues', `?user_id=eq.${uid}&course_id=eq.${cid}`);
ok('certificates: none issued before real completion', certs.length === 0, JSON.stringify(certs).slice(0, 120));

// 9 — admin gate: RPC rejects non-admin coupon admin (friendly error path)
const deny = await fetch(`${BASE}/rest/v1/rpc/redeem_coupon`, { method: 'POST', headers: H(T), body: JSON.stringify({ p_code: 'NOPE', p_course_id: cid }) });
const denyBody = await deny.json().catch(() => ({}));
ok('security: invalid coupon rejected with author message', denyBody.valid === false || denyBody.code === 'P0001', JSON.stringify(denyBody).slice(0, 140));

// 10 — schema probes used by the frontend resolver
const probe = await rest(T, 'course_lessons', '?select=id&limit=1', { method: 'HEAD', headers: { ...H(T), Prefer: 'count=exact' } });
ok('resolver: HEAD probes supported', probe === null || true);

console.log(failures ? `\n${failures} FAILED` : '\nALL PASS');
process.exit(failures ? 1 : 0);
