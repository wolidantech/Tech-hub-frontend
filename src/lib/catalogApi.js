// ============================================================
// Catalogue + classroom API.
//
// The course catalogue is DATA-DRIVEN: every category and every course on the
// storefront comes from the backend. Nothing on these pages names a course in
// code — `FEATURED_CATEGORIES` below holds CATEGORY names only (filter labels
// for the three subject areas the school teaches), and the courses inside them
// are whatever `GET /api/courses` returns for that `category_id`.
//
//   GET /api/course-categories             → categories
//   GET /api/courses?category_id=&search=&difficulty=&page=&limit=
//   GET /api/classroom/:idOrSlug/outline   → public outline (titles only)
//   GET /api/classroom/:idOrSlug           → full classroom (enrolled only)
// ============================================================
import { apiFetch } from './api';

// Backend difficulty enum → display label. The API validates
// `difficulty` against these three exact values (Tech-hub-backend
// src/validation/schemas.js → listCoursesQuery).
export const DIFFICULTY_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export const difficultyLabel = (level) => {
  const key = String(level || '').toUpperCase();
  if (key === 'BEGINNER') return 'Beginner';
  if (key === 'INTERMEDIATE') return 'Intermediate';
  if (key === 'ADVANCED') return 'Advanced';
  return level ? String(level) : 'All levels';
};

/**
 * Category names that are always offered as filters, even before the backend
 * has a matching `course_categories` row. They are FILTERS, not content: the
 * courses shown under them are fetched with `category=<name>` (the API's
 * name filter) or `category_id=<id>` once the category exists in the database.
 */
// The three teaching areas get pinned chips. Names must match the backend's
// category rows exactly; unknown names still render (unpinned, id-less) rather
// than disappearing.
export const FEATURED_CATEGORIES = [
  'Science & Laboratory',
  'Art & Industrial Design',
  'Business/Commercial',
];

const num = (v, fallback = null) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const mapCategory = (c) => c && ({
  id: c.id,
  name: c.name,
  description: c.description || '',
  createdAt: c.created_at,
});

/**
 * `GET /api/courses` card → the shape the storefront components render.
 * Fields the API does not serve are left null so the UI hides them instead of
 * inventing numbers.
 */
export const mapCourse = (c) => c && ({
  id: c.id,
  slug: c.slug,
  title: c.title,
  description: c.description || '',
  shortDescription: c.description || '',
  longDescription: c.description || '',
  category: c.course_categories?.name || c.category_name || 'General',
  categoryId: c.category_id || c.course_categories?.id || null,
  instructor: c.instructor?.full_name || c.instructor_name || null,
  instructorId: c.instructor_id || null,
  instructorRole: c.instructor?.role || null,
  duration: c.duration || '',
  level: difficultyLabel(c.difficulty_level),
  difficulty: c.difficulty_level || null,
  price: num(c.price, 0),
  originalPrice: num(c.original_price, null),
  thumbnailUrl: c.thumbnail_url || null,
  thumbnail: 'default',
  rating: num(c.rating, null),
  students: num(c.students_count, null),
  lessonsCount: num(c.lessons_count ?? c.total_lessons, null),
  published: c.is_published !== false,
  featured: !!c.featured,
  createdAt: c.created_at,
  source: 'api',
});

export const mapPagination = (p) => ({
  page: num(p?.page, 1),
  limit: num(p?.limit, 20),
  total: num(p?.total, 0),
  totalPages: num(p?.total_pages, 0),
});

// ---------- Categories ----------
export async function fetchCategories() {
  const data = await apiFetch('/course-categories', { auth: false });
  const list = Array.isArray(data?.categories) ? data.categories : (Array.isArray(data) ? data : []);
  return list.map(mapCategory).filter(Boolean);
}

// ---------- Catalogue ----------
/**
 * @param {object} filters
 * @param {string} [filters.categoryId]  exact `category_id` filter (preferred)
 * @param {string} [filters.category]    category NAME filter (server ilike) —
 *   used for the two featured filters when the backend has no id for them yet
 * @param {string} [filters.search]      free-text title search
 * @param {string} [filters.difficulty]  BEGINNER | INTERMEDIATE | ADVANCED
 * @param {number} [filters.page] @param {number} [filters.limit]
 */
export async function fetchCourses(filters = {}, { signal } = {}) {
  const data = await apiFetch('/courses', {
    auth: false,
    signal,
    query: {
      category_id: filters.categoryId,
      category: filters.category,
      search: filters.search,
      difficulty: filters.difficulty,
      page: filters.page,
      limit: filters.limit,
    },
  });
  return {
    courses: (Array.isArray(data?.courses) ? data.courses : []).map(mapCourse),
    pagination: mapPagination(data?.pagination),
  };
}

// ---------- Curriculum shapes ----------
const LESSON_TYPE = {
  VIDEO: 'video', TEXT: 'text', PDF: 'resource', RESOURCE: 'resource',
  PRACTICAL: 'practical', QUIZ: 'quiz', ASSIGNMENT: 'assignment', PROJECT: 'project',
};
const lessonType = (value) => LESSON_TYPE[String(value || '').toUpperCase()] || 'text';

// lesson_contents rows → one markdown document the lesson reader understands.
function contentsToMarkdown(contents = []) {
  return contents
    .filter((c) => c && (c.body || c.title))
    .map((c) => {
      const heading = c.title ? (String(c.title).startsWith('#') ? c.title : `## ${c.title}`) : '';
      return [heading, c.body || '', c.url ? `[Open resource](${c.url})` : ''].filter(Boolean).join('\n\n');
    })
    .join('\n\n')
    .trim();
}

/** Public outline lesson (titles + metadata only — never content or URLs). */
const mapOutlineLesson = (l, moduleId) => ({
  id: l.id,
  moduleId,
  topicId: l.topic_id || null,
  title: l.title,
  description: l.description || '',
  type: lessonType(l.lesson_type),
  duration: l.duration || '',
  freePreview: !!l.is_free_preview,
  locked: true,
});

/** Outline module → `{ id, title, description, topics[], lessons[] }`. */
const mapOutlineModule = (m) => ({
  id: m.id,
  title: m.title,
  description: m.description || '',
  topics: (m.topics || []).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description || '',
    lessonsCount: num(t.lessons_count, 0),
  })),
  lessons: (m.lessons || []).map((l) => mapOutlineLesson(l, m.id)),
  lessonsCount: num(m.lessons_count, (m.lessons || []).length),
});

/**
 * `GET /api/classroom/:idOrSlug/outline` → public course outline.
 * Titles/counts only: the endpoint never returns lesson bodies, video URLs or
 * quiz answers, so a visitor browsing `/course/:slug` cannot unlock anything.
 */
export async function fetchCourseOutline(idOrSlug, { signal } = {}) {
  const data = await apiFetch(`/classroom/${encodeURIComponent(idOrSlug)}/outline`, { signal });
  const modules = (data?.modules || []).map(mapOutlineModule);
  return {
    course: mapCourse(data?.course),
    modules,
    curriculum: modules,
    totalLessons: num(data?.total_lessons, 0),
    counts: data?.counts || null,
    curriculumComplete: !!data?.curriculum_complete,
    curriculumStatus: data?.curriculum_status || null,
    enrollment: data?.enrollment || null,
    progress: data?.progress || null,
    hasAccess: !!data?.has_access,
  };
}

/**
 * Full (gated) lesson from `GET /api/classroom/:idOrSlug`.
 * Quiz questions arrive WITHOUT answer keys — the backend strips them and
 * grades server-side, and this mapper never adds them back.
 */
const mapClassroomLesson = (l, moduleId) => {
  const videos = (l.videos || []).filter(Boolean);
  const primary = videos[0] || null;
  const contents = (l.contents || []).filter(Boolean);
  const body = contentsToMarkdown(contents);
  return {
    id: l.id,
    moduleId,
    topicId: l.topic_id || null,
    title: l.title,
    description: l.description || '',
    type: lessonType(l.lesson_type),
    duration: l.duration || '',
    freePreview: !!l.is_free_preview,
    locked: false,
    videoUrl: primary?.signed_url || primary?.video_url || l.video_url || '',
    textContent: body || l.content || '',
    content: body || l.content || '',
    resources: (l.resources || []).map((r) => ({
      id: r.id,
      title: r.title || 'Resource',
      description: r.description || '',
      type: r.resource_type || 'docs',
      url: r.signed_url || r.url || '',
    })),
    practicals: l.practicals || [],
    assignments: (l.assignments || []).map((a) => ({
      id: a.id, title: a.title, description: a.description || '',
      dueDate: a.due_date, status: a.status, lessonId: l.id, courseId: a.course_id,
    })),
    // NOTE: `questions[].options` carry {id, text} only. No correct answer.
    quizzes: (l.quizzes || []).map((q) => ({
      id: q.id, title: q.title, description: q.description || '',
      passingScore: num(q.passing_score, 70), timeLimit: num(q.time_limit, null),
      lessonId: l.id, courseId: q.course_id,
      questions: (q.questions || []).map((question) => ({
        id: question.id,
        type: String(question.question_type || 'MULTIPLE_CHOICE').toLowerCase(),
        question: question.question,
        options: (question.options || []).map((o) => ({ id: o.id, text: o.text })),
      })),
      myAttempts: num(q.my_attempts, 0),
      myBestScore: num(q.my_best_score, null),
      passed: !!q.passed,
    })),
  };
};

/**
 * `GET /api/classroom/:idOrSlug` → the enrolled student's classroom.
 * Requires the student's bearer token; the API returns 403 for anyone without
 * an ACTIVE/COMPLETED enrollment (or admin/instructor role).
 */
export async function fetchClassroom(idOrSlug, { signal } = {}) {
  const data = await apiFetch(`/classroom/${encodeURIComponent(idOrSlug)}`, { signal });
  const curriculum = (data?.modules || []).map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description || '',
    topics: (m.topics || []).map((t) => ({ id: t.id, title: t.title, lessonsCount: num(t.lessons_count, 0) })),
    lessons: (m.lessons || []).map((l) => mapClassroomLesson(l, m.id)),
  }));
  return {
    course: mapCourse({ ...(data?.course || {}), ...data?.course }),
    curriculum,
    enrollment: data?.enrollment || null,
    progress: data?.progress || null,
    continueLearning: data?.continue_learning || null,
    certificate: data?.certificate || null,
    completionRules: data?.completion_rules || null,
    assessments: data?.assessments || [],
    curriculumComplete: !!data?.curriculum_complete,
    curriculumStatus: data?.curriculum_status || null,
  };
}

/**
 * Category filter chip list: whatever the API returned, with the two featured
 * filters pinned first. Chips keep their backend `id` when one exists so the
 * catalogue can be re-fetched with `category_id` (an exact filter) rather than
 * a name match.
 */
export function buildCategoryFilters(categories = []) {
  const byName = new Map(categories.map((c) => [String(c.name || '').toLowerCase(), c]));
  const featured = FEATURED_CATEGORIES.map((name) => byName.get(name.toLowerCase()) || { id: null, name });
  const rest = categories.filter((c) => !FEATURED_CATEGORIES.includes(c.name));
  return [...featured, ...rest];
}
