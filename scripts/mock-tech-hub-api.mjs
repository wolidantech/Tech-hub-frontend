#!/usr/bin/env node
// ============================================================
// Local stand-in for the Tech-hub-backend course API — for verifying the
// frontend contract without deploying the backend or a Supabase project.
// ------------------------------------------------------------
// The catalogue, the public course outline and the gated classroom are all
// fetched by the frontend over REST. This script speaks that exact protocol so
// you can watch the storefront, the outline and the "exam service not
// connected" state on a phone:
//
//   node scripts/mock-tech-hub-api.mjs          (or: npm run mock:api)
//
// Then, in a second terminal:
//
//   npm run dev        # the vite dev server proxies /api → this port
//
// Endpoints implemented (same shapes as Tech-hub-backend):
//   GET /health
//   GET /api/course-categories
//   GET /api/courses?category_id=&category=&search=&difficulty=&page=&limit=
//   GET /api/classroom/:idOrSlug/outline        public outline (titles only)
//   GET /api/classroom/:idOrSlug                gated classroom (needs a bearer)
//   GET /api/exams/jamb/*                       404 — deliberately NOT served:
//                                               the JAMB area must show its
//                                               honest "not connected" state.
//
// Nothing here is shipped to the browser bundle; the storefront never imports
// this file. Set EXAMS=1 to also serve a fake exam service (paper WITHOUT
// answer keys + server-side grading) for CBT interface work.
// ============================================================
import http from 'node:http';

const PORT = Number(process.env.PORT || 8789);
const EXAMS = process.env.EXAMS === '1';

const c = { dim: '\x1b[2m', cy: '\x1b[36m', gr: '\x1b[32m', am: '\x1b[33m', rd: '\x1b[31m', off: '\x1b[0m' };

// --------------------------------------------------------------- mock data
const CATEGORIES = [
  { id: 'cat-science', name: 'Science & Laboratory', description: 'Laboratory technique, instrumentation and scientific method.' },
  { id: 'cat-art', name: 'Art & Industrial Design', description: 'Drawing, product design, fabrication and visual composition.' },
  { id: 'cat-web', name: 'Web Development', description: 'Frontend and backend engineering for the modern web.' },
  { id: 'cat-ai', name: 'AI & Artificial Intelligence', description: 'Applied AI, prompt engineering and automation.' },
  { id: 'cat-design', name: 'Graphic Design', description: 'Brand, layout and digital graphics.' },
  { id: 'cat-business', name: 'Business Technology', description: 'Spreadsheets, analytics and business systems.' },
];

const COURSES = [
  { id: 'crs-lab-1', slug: 'laboratory-techniques', title: 'Laboratory Techniques & Safety', category: 'cat-science', difficulty: 'BEGINNER', price: 8000, duration: '6 hours' },
  { id: 'crs-lab-2', slug: 'applied-chemistry-lab', title: 'Applied Chemistry in the Laboratory', category: 'cat-science', difficulty: 'INTERMEDIATE', price: 12000, duration: '9 hours' },
  { id: 'crs-lab-3', slug: 'biology-field-methods', title: 'Biology Field & Lab Methods', category: 'cat-science', difficulty: 'ADVANCED', price: 15000, duration: '10 hours' },
  { id: 'crs-art-1', slug: 'industrial-product-design', title: 'Industrial Product Design Foundations', category: 'cat-art', difficulty: 'BEGINNER', price: 9000, duration: '7 hours' },
  { id: 'crs-art-2', slug: 'technical-drawing-cad', title: 'Technical Drawing & CAD for Designers', category: 'cat-art', difficulty: 'INTERMEDIATE', price: 11000, duration: '8 hours' },
  { id: 'crs-art-3', slug: 'studio-practice', title: 'Studio Practice: Materials & Making', category: 'cat-art', difficulty: 'ADVANCED', price: 14000, duration: '9 hours' },
  { id: 'crs-web-1', slug: 'frontend-web-development', title: 'Frontend Web Development', category: 'cat-web', difficulty: 'BEGINNER', price: 5000, duration: '12 hours' },
  { id: 'crs-web-2', slug: 'backend-apis', title: 'Backend APIs with Node.js', category: 'cat-web', difficulty: 'INTERMEDIATE', price: 8000, duration: '10 hours' },
  { id: 'crs-ai-1', slug: 'ai-video-content-creation', title: 'AI Video & Content Creation', category: 'cat-ai', difficulty: 'BEGINNER', price: 5000, duration: '5 hours' },
  { id: 'crs-design-1', slug: 'graphic-design-with-canva', title: 'Graphic Design with Canva', category: 'cat-design', difficulty: 'BEGINNER', price: 5000, duration: '6 hours' },
  { id: 'crs-business-1', slug: 'microsoft-excel', title: 'Microsoft Excel for Business', category: 'cat-business', difficulty: 'BEGINNER', price: 5000, duration: '8 hours' },
];

const MODULES = {
  default: [
    { title: 'Foundations', lessons: ['Orientation & tools', 'Core concepts', 'Guided walkthrough'] },
    { title: 'Practice', lessons: ['Worked exercise', 'Practical task', 'Common mistakes'] },
    { title: 'Assessment', lessons: ['Knowledge check', 'Final project brief'] },
  ],
};

const byId = (id) => COURSES.find((x) => x.id === id || x.slug === id);
const categoryName = (id) => CATEGORIES.find((x) => x.id === id)?.name || 'General';

const card = (course, index) => ({
  id: course.id,
  title: course.title,
  slug: course.slug,
  description: `Practical, project-based training in ${categoryName(course.category).toLowerCase()} — ${course.duration} of lessons, exercises and a certificate.`,
  thumbnail_url: null,
  price: course.price,
  duration: course.duration,
  difficulty_level: course.difficulty,
  instructor_id: 'inst-1',
  is_published: true,
  created_at: new Date(Date.now() - index * 86400000).toISOString(),
  course_categories: { id: course.category, name: categoryName(course.category) },
  instructor: { id: 'inst-1', full_name: 'Woli Dan', profile_photo_url: null },
});

function outline(course) {
  const modules = MODULES.default.map((m, mi) => ({
    id: `${course.id}-m${mi + 1}`,
    title: m.title,
    description: `${m.title} for ${course.title}`,
    order_number: mi + 1,
    topics: [],
    lessons: m.lessons.map((title, li) => ({
      id: `${course.id}-m${mi + 1}-l${li + 1}`,
      module_id: `${course.id}-m${mi + 1}`,
      topic_id: null,
      title,
      description: null,
      lesson_type: li % 3 === 2 ? 'TEXT' : 'VIDEO',
      duration: `${10 + li * 2}:00`,
      order_number: li + 1,
      is_free_preview: mi === 0 && li === 0,
    })),
    topics_count: 0,
    lessons_count: m.lessons.length,
  }));
  const total = modules.reduce((n, m) => n + m.lessons_count, 0);
  return {
    course: card(course, 0),
    modules,
    total_lessons: total,
    counts: { modules: modules.length, topics: 0, lessons: total, quizzes: 2, assignments: 1, assessments: 1 },
    curriculum_complete: true,
    curriculum_status: {
      complete: true,
      modules_count: modules.length,
      topics_count: 0,
      lessons_count: total,
      published_lessons_count: total,
      quizzes_count: 2,
      live_quizzes_count: 2,
      assignments_count: 1,
      live_assignments_count: 1,
      assessments_count: 1,
      live_assessments_count: 1,
      message: `Curriculum ready — ${modules.length} module(s), ${total} published lesson(s)`,
    },
  };
}

function classroom(course) {
  const base = outline(course);
  return {
    ...base,
    modules: base.modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l, li) => ({
        ...l,
        content: null,
        resource_url: null,
        contents: [{
          id: `${l.id}-c1`, lesson_id: l.id, block_type: 'THEORY',
          title: l.title, body: `# ${l.title}\n\nMock lesson body served by the local API stand-in.\n\n## What you will learn\n- Step one\n- Step two`,
          url: null, storage_path: null, order_number: 1, is_published: true, signed_url: null,
        }],
        videos: li === 0 ? [{ id: `${l.id}-v1`, lesson_id: l.id, title: l.title, video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', storage_path: null, status: 'COMPLETED', signed_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }] : [],
        resources: [{ id: `${l.id}-r1`, title: 'Lesson worksheet', description: null, url: 'https://example.org/worksheet.pdf', storage_path: null, resource_type: 'pdf', is_external: true, signed_url: 'https://example.org/worksheet.pdf' }],
        practicals: [],
        assignments: [],
        // NOTE: no correct answers — mirrors the real API, which strips keys.
        quizzes: li === 0 ? [{
          id: `${l.id}-q1`, title: `${l.title} check`, description: null, scope: 'LESSON',
          passing_score: 70, time_limit: 10, course_id: course.id, lesson_id: l.id,
          questions: [{
            id: `${l.id}-q1-1`, question: `Which step comes first in "${l.title}"?`, question_type: 'MULTIPLE_CHOICE',
            options: [{ id: 'a', text: 'Prepare the workspace' }, { id: 'b', text: 'Publish the result' }],
          }],
          my_attempts: 0, my_best_score: null, passed: false,
        }] : [],
        progress: null,
      })),
    })),
    enrollment: { id: 'enr-1', course_id: course.id, status: 'ACTIVE' },
    progress: { completed: 1, total: base.total_lessons, percentage: Math.round((1 / base.total_lessons) * 100) },
    continue_learning: null,
    certificate: null,
    completion_rules: null,
    assessments: [],
  };
}

// --------------------------------------------------------------- plumbing
function send(res, status, body) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(text);
}

const log = (line, color = '') => console.log(`${color}   ${line}${c.off}`);

// In-memory issued papers. Keys live ONLY here (server-side), never in a
// response body.
const papers = new Map();

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
    });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const { pathname } = url;
  if (req.method === 'OPTIONS') return send(res, 204, '');

  log(`${req.method} ${pathname}${url.search || ''} ${req.headers.authorization ? `${c.gr}[bearer]${c.off}` : `${c.dim}[anon]${c.off}`}`);

  if (pathname === '/health') return send(res, 200, { status: 'ok', service: 'mock-tech-hub-api' });

  if (pathname === '/api/course-categories') {
    return send(res, 200, { success: true, data: { categories: CATEGORIES } });
  }

  if (pathname === '/api/courses') {
    const categoryId = url.searchParams.get('category_id');
    const categoryNameFilter = url.searchParams.get('category');
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const difficulty = url.searchParams.get('difficulty');
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.min(100, Number(url.searchParams.get('limit')) || 20);

    let list = [...COURSES];
    if (categoryId) list = list.filter((x) => x.category === categoryId);
    if (categoryNameFilter) {
      const needle = categoryNameFilter.toLowerCase();
      list = list.filter((x) => categoryName(x.category).toLowerCase().includes(needle));
    }
    if (difficulty) list = list.filter((x) => x.difficulty === difficulty);
    if (search) list = list.filter((x) => x.title.toLowerCase().includes(search));

    const total = list.length;
    const slice = list.slice((page - 1) * limit, page * limit);
    return send(res, 200, {
      success: true,
      data: {
        courses: slice.map(card),
        pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
      },
    });
  }

  const outlineMatch = pathname.match(/^\/api\/classroom\/([^/]+)\/outline$/);
  if (outlineMatch) {
    const course = byId(decodeURIComponent(outlineMatch[1]));
    if (!course) return send(res, 404, { success: false, error: { code: 'NOT_FOUND', message: 'Course not found' } });
    const data = outline(course);
    if (req.headers.authorization) data.enrollment = { id: 'enr-1', course_id: course.id, status: 'ACTIVE' };
    return send(res, 200, { success: true, data });
  }

  const classroomMatch = pathname.match(/^\/api\/classroom\/([^/]+)$/);
  if (classroomMatch) {
    if (!req.headers.authorization) {
      return send(res, 401, { success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } });
    }
    const course = byId(decodeURIComponent(classroomMatch[1]));
    if (!course) return send(res, 404, { success: false, error: { code: 'NOT_FOUND', message: 'Course not found' } });
    return send(res, 200, { success: true, data: classroom(course) });
  }

  // ---- Standalone JAMB exam API ----
  // Off by default: the real backend does not serve these yet, and the
  // frontend must show its "exam service not connected" state.
  if (pathname.startsWith('/api/exams/jamb')) {
    if (!EXAMS) {
      log('exam endpoints are not served (run with EXAMS=1 to fake them)', c.am);
      return send(res, 404, { success: false, error: { code: 'ROUTE_NOT_FOUND', message: `Route not found: ${req.method} ${pathname}` } });
    }
    if (pathname === '/api/exams/jamb/subjects' && req.method === 'GET') {
      return send(res, 200, {
        success: true,
        data: {
          subjects: [
            { id: 'sub-maths', name: 'Mathematics', question_count: 40 },
            { id: 'sub-english', name: 'Use of English', question_count: 40 },
            { id: 'sub-physics', name: 'Physics', question_count: 30 },
            { id: 'sub-chemistry', name: 'Chemistry', question_count: 30 },
            { id: 'sub-biology', name: 'Biology', question_count: 30 },
          ],
        },
      });
    }
    if (pathname === '/api/exams/jamb/attempts' && req.method === 'POST') {
      return readBody(req).then((body) => {
        const count = Math.min(60, Number(body?.question_count) || 20);
        // The KEY is kept server-side only and is never part of the response.
        const questions = Array.from({ length: count }, (_, i) => ({
          id: `q-${i + 1}`,
          subject: (body?.subject_ids || ['sub-maths'])[i % (body?.subject_ids || ['sub-maths']).length],
          text: `Mock question ${i + 1} — which option is correct?`,
          options: [
            { id: 'a', text: 'Option A' }, { id: 'b', text: 'Option B' },
            { id: 'c', text: 'Option C' }, { id: 'd', text: 'Option D' },
          ],
        }));
        const keys = Object.fromEntries(questions.map((q, i) => [q.id, ['a', 'b', 'c', 'd'][i % 4]]));
        papers.set('attempt-1', { keys, mode: body?.mode || 'practice' });
        return send(res, 201, {
          success: true,
          data: { attempt_id: 'attempt-1', duration_minutes: 20, subjects: body?.subject_ids || [], questions },
        });
      });
    }
    const submitMatch = pathname.match(/^\/api\/exams\/jamb\/attempts\/([^/]+)\/submit$/);
    if (submitMatch && req.method === 'POST') {
      return readBody(req).then((body) => {
        const paper = papers.get(submitMatch[1]);
        if (!paper) return send(res, 404, { success: false, error: { code: 'NOT_FOUND', message: 'Attempt not found' } });
        const answers = body?.answers || [];
        const perQuestion = answers.map((a) => ({
          question_id: a.question_id,
          correct: paper.keys[a.question_id] === a.option_id,
          explanation: paper.mode === 'practice' ? 'Server-side explanation.' : undefined,
        }));
        const score = perQuestion.filter((q) => q.correct).length;
        const total = Object.keys(paper.keys).length;
        return send(res, 200, {
          success: true,
          data: { attempt_id: submitMatch[1], score, total, pass_mark: 50, passed: (score / total) * 100 >= 50, per_question: perQuestion },
        });
      });
    }
  }

  log(`404 ${pathname}`, c.rd);
  return send(res, 404, { success: false, error: { code: 'ROUTE_NOT_FOUND', message: `Route not found: ${req.method} ${pathname}` } });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`${c.cy}[mock-tech-hub-api]${c.off} http://localhost:${PORT}/api/courses`);
  console.log(`${c.dim}  next: npm run dev  (the vite dev server proxies /api to this port)${c.off}`);
  const examLine = EXAMS ? 'faked (EXAMS=1) — paper + server-side grading' : '404 — the frontend shows "exam service not connected"';
  console.log(`${c.dim}  JAMB exam endpoints: ${examLine}${c.off}`);
});
