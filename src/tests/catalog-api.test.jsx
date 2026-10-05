// @vitest-environment jsdom
// Catalogue + classroom API contract: the storefront must be data-driven.
// These tests stub `fetch` at the network boundary, so the real api.js →
// catalogApi.js → context → page chain runs against backend-shaped payloads.
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  lms: {
    bundles: [], siteSettings: {}, getCourseQuizzes: () => [], getCourseAssignments: () => [],
    getCourseReviews: () => [], getCourseRating: (id, fallback = 4.8) => fallback,
    ensureCourseReviews: async () => [], addReview: async () => ({}), trackView: () => {},
  },
  courses: { isEnrolled: () => false, getManualPaymentByCourse: () => null, getUserEnrollments: () => [], getProgress: () => ({ progress: 0, completedLessons: [] }) },
  user: { id: 'student-1', role: 'student', fullName: 'Test Student' },
}));
vi.mock('../context/LMSContext', () => ({ useLMS: () => mocks.lms }));
vi.mock('../context/CourseContext', () => ({ useCourses: () => mocks.courses }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock('../components/learn/Discussions', () => ({ default: () => null }));

import { CatalogProvider } from '../context/CatalogContext';
import { fetchCourseOutline, fetchCourses, FEATURED_CATEGORIES } from '../lib/catalogApi';
import { apiUrl } from '../lib/api';
import Courses from '../pages/Courses';
import CourseDetails from '../pages/CourseDetails';

// --------------------------------------------------------------- fixtures
const CATEGORIES = [
  { id: 'cat-science', name: 'Science & Laboratory', description: 'Lab technique' },
  { id: 'cat-art', name: 'Art & Industrial Design', description: 'Design & making' },
  { id: 'cat-web', name: 'Web Development', description: 'Web engineering' },
];

const COURSES = [
  {
    id: 'crs-1', slug: 'lab-safety', title: 'Laboratory Safety Basics',
    description: 'Work safely in a teaching laboratory.', thumbnail_url: null, price: '8000.00',
    duration: '6 hours', difficulty_level: 'BEGINNER', instructor_id: 'inst-1', is_published: true,
    created_at: '2026-01-01T00:00:00.000Z',
    course_categories: { id: 'cat-science', name: 'Science & Laboratory' },
    instructor: { id: 'inst-1', full_name: 'Dr. Ada', profile_photo_url: null },
  },
  {
    id: 'crs-2', slug: 'product-design', title: 'Industrial Product Design',
    description: 'Design objects people can manufacture.', thumbnail_url: null, price: 9000,
    duration: '7 hours', difficulty_level: 'INTERMEDIATE', instructor_id: 'inst-2', is_published: true,
    created_at: '2026-02-01T00:00:00.000Z',
    course_categories: { id: 'cat-art', name: 'Art & Industrial Design' },
    instructor: { id: 'inst-2', full_name: 'Tunde', profile_photo_url: null },
  },
];

const OUTLINE = {
  course: { id: 'crs-1', slug: 'lab-safety', title: 'Laboratory Safety Basics', description: 'Work safely.', price: 8000, duration: '6 hours', difficulty_level: 'BEGINNER', is_published: true, course_categories: { id: 'cat-science', name: 'Science & Laboratory' } },
  modules: [{
    id: 'm1', title: 'Foundations', description: 'Start here', order_number: 1,
    topics: [{ id: 't1', title: 'Safety rules', lessons_count: 2 }],
    lessons: [
      { id: 'l1', module_id: 'm1', topic_id: 't1', title: 'PPE and glassware', lesson_type: 'VIDEO', duration: '12:00', order_number: 1, is_free_preview: true },
      { id: 'l2', module_id: 'm1', topic_id: 't1', title: 'Chemical handling', lesson_type: 'TEXT', duration: '09:00', order_number: 2, is_free_preview: false },
    ],
    topics_count: 1, lessons_count: 2,
  }],
  total_lessons: 2,
  counts: { modules: 1, topics: 1, lessons: 2, quizzes: 1, assignments: 1, assessments: 1 },
  curriculum_complete: true,
  curriculum_status: { complete: true, message: 'Curriculum ready — 1 module(s), 2 published lesson(s)' },
  enrollment: null,
  progress: null,
  has_access: false,
};

const CLASSROOM = {
  ...OUTLINE,
  modules: [{
    id: 'm1', title: 'Foundations', description: null, order_number: 1, topics: [],
    lessons: [{
      id: 'l1', module_id: 'm1', topic_id: null, title: 'PPE and glassware', description: null,
      lesson_type: 'VIDEO', video_url: null, content: null, duration: '12:00', order_number: 1,
      is_published: true, is_free_preview: false,
      contents: [{ id: 'c1', lesson_id: 'l1', block_type: 'THEORY', title: 'PPE', body: '# PPE\n\nWear goggles.', order_number: 1, is_published: true }],
      videos: [{ id: 'v1', lesson_id: 'l1', video_url: 'https://example.org/v.mp4', status: 'COMPLETED', signed_url: 'https://signed.example.org/v.mp4' }],
      resources: [{ id: 'r1', title: 'Worksheet', url: null, storage_path: 'x.pdf', is_external: false, signed_url: 'https://signed.example.org/x.pdf', resource_type: 'pdf' }],
      practicals: [],
      assignments: [],
      quizzes: [{
        id: 'q1', title: 'Safety check', passing_score: 70, time_limit: 10, course_id: 'crs-1', lesson_id: 'l1',
        questions: [{ id: 'qq1', question: 'What first?', question_type: 'MULTIPLE_CHOICE', options: [{ id: 'a', text: 'Goggles' }, { id: 'b', text: 'Nothing' }] }],
        my_attempts: 0, my_best_score: null, passed: false,
      }],
    }],
    lessons_count: 1, topics_count: 0,
  }],
  enrollment: { id: 'enr-1', course_id: 'crs-1', status: 'ACTIVE' },
  progress: { completed: 0, total: 2, percentage: 0 },
  certificate: null,
};

let calls = [];
function mockServer({ enrollment = null } = {}) {
  calls = [];
  global.fetch = vi.fn(async (url) => {
    const full = String(url);
    calls.push(full);
    const path = full.split('?')[0];
    const query = new URL(full, 'http://test.local').searchParams;

    if (path.endsWith('/api/course-categories')) {
      return json({ success: true, data: { categories: CATEGORIES } });
    }
    if (path.endsWith('/api/courses')) {
      let list = COURSES;
      if (query.get('category_id')) list = list.filter((x) => x.course_categories.id === query.get('category_id'));
      if (query.get('search')) list = list.filter((x) => x.title.toLowerCase().includes(query.get('search').toLowerCase()));
      if (query.get('difficulty')) list = list.filter((x) => x.difficulty_level === query.get('difficulty'));
      return json({ success: true, data: { courses: list, pagination: { page: 1, limit: 24, total: list.length, total_pages: 1 } } });
    }
    if (/\/api\/classroom\/[^/]+\/outline$/.test(path)) {
      return json({ success: true, data: { ...OUTLINE, enrollment } });
    }
    if (/\/api\/classroom\/[^/]+$/.test(path)) {
      return json({ success: true, data: CLASSROOM });
    }
    return json({ success: false, error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found' } }, 404);
  });
}

// Minimal fetch Response stand-in: api.js only reads ok/status/json().
const json = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

beforeEach(() => {
  cleanup();
  mocks.user = { id: 'student-1', role: 'student', fullName: 'Test Student' };
  mocks.courses.isEnrolled = () => false;
  mockServer();
});
afterEach(() => { vi.restoreAllMocks(); });

// =============================================================== URL building
describe('catalogue query contract', () => {
  it('builds category_id and search query strings for GET /api/courses', () => {
    expect(apiUrl('/courses', { category_id: 'cat-science', search: 'lab', page: 2 }))
      .toBe('/api/courses?category_id=cat-science&search=lab&page=2');
    // empty values are dropped, never sent as empty params
    expect(apiUrl('/courses', { category_id: null, search: '', difficulty: undefined }))
      .toBe('/api/courses');
  });

  it('maps API course cards into the storefront shape', async () => {
    const { courses } = await fetchCourses({ categoryId: 'cat-art' });
    expect(calls[0]).toContain('/api/courses?category_id=cat-art');
    expect(courses[0]).toMatchObject({
      id: 'crs-2', slug: 'product-design', title: 'Industrial Product Design',
      category: 'Art & Industrial Design', categoryId: 'cat-art',
      level: 'Intermediate', price: 9000, instructor: 'Tunde',
    });
    // fields the API does not serve stay null instead of being invented
    expect(courses[0].rating).toBeNull();
    expect(courses[0].students).toBeNull();
  });

  it('maps the public outline (titles only, no lesson content)', async () => {
    const outline = await fetchCourseOutline('lab-safety');
    expect(calls[0]).toMatch(/\/api\/classroom\/lab-safety\/outline$/);
    expect(outline.totalLessons).toBe(2);
    expect(outline.modules[0].lessons.map((l) => l.title)).toEqual(['PPE and glassware', 'Chemical handling']);
    expect(outline.modules[0].topics[0].title).toBe('Safety rules');
    expect(outline.modules[0].lessons[0]).not.toHaveProperty('textContent');
    expect(outline.modules[0].lessons[0]).not.toHaveProperty('videoUrl');
    expect(outline.modules[0].lessons[1].locked).toBe(true);
  });
});

// =================================================================== Courses
describe('Courses page — data-driven catalogue', () => {
  const page = () => render(
    <MemoryRouter>
      <CatalogProvider><Courses /></CatalogProvider>
    </MemoryRouter>,
  );

  it('renders the courses and categories returned by the API', async () => {
    page();
    expect(await screen.findByText('Laboratory Safety Basics')).toBeTruthy();
    expect(screen.getByText('Industrial Product Design')).toBeTruthy();
    expect(screen.getByText('Web Development')).toBeTruthy();
    expect(screen.getByText('2 COURSES')).toBeTruthy();
  });

  it('always offers the Science & Laboratory and Art & Industrial Design filters', async () => {
    page();
    await screen.findByText('Laboratory Safety Basics');
    FEATURED_CATEGORIES.forEach((name) => {
      expect(screen.getByRole('button', { name: name.toUpperCase() })).toBeTruthy();
    });
  });

  it('re-fetches the catalogue with category_id when a category chip is used', async () => {
    page();
    await screen.findByText('Laboratory Safety Basics');
    fireEvent.click(screen.getByRole('button', { name: 'ART & INDUSTRIAL DESIGN' }));
    await waitFor(() => expect(calls.some((c) => c.includes('/api/courses?category_id=cat-art'))).toBe(true));
    await waitFor(() => expect(screen.queryByText('Laboratory Safety Basics')).toBeNull());
    expect(screen.getByText('Industrial Product Design')).toBeTruthy();
  });

  it('re-fetches with the search filter (debounced)', async () => {
    page();
    await screen.findByText('Laboratory Safety Basics');
    fireEvent.change(screen.getByLabelText('Search courses'), { target: { value: 'product' } });
    await waitFor(() => expect(calls.some((c) => c.includes('search=product'))).toBe(true), { timeout: 2000 });
    await waitFor(() => expect(screen.queryByText('Laboratory Safety Basics')).toBeNull());
  });

  it('filters by difficulty through the API enum', async () => {
    page();
    await screen.findByText('Laboratory Safety Basics');
    fireEvent.click(screen.getByRole('button', { name: 'BEGINNER' }));
    await waitFor(() => expect(calls.some((c) => c.includes('difficulty=BEGINNER'))).toBe(true));
  });

  it('shows the backend error with a retry instead of a fake catalogue', async () => {
    global.fetch = vi.fn(async () => json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Unable to load courses' } }, 500));
    page();
    // The failure is reported (category banner + catalogue panel) and no
    // course cards are invented in its place.
    const reported = await screen.findAllByText('Unable to load courses');
    expect(reported.length).toBeGreaterThan(0);
    expect(screen.getByText(/The catalog isn’t loaded/)).toBeTruthy();
    expect(screen.queryByText('Laboratory Safety Basics')).toBeNull();
    expect(screen.getByRole('button', { name: 'TRY AGAIN' })).toBeTruthy();
  });
});

// ============================================================= CourseDetails
describe('CourseDetails — public outline vs authenticated classroom', () => {
  const page = () => render(
    <MemoryRouter initialEntries={['/course/lab-safety']}>
      <Routes>
        <Route path="/course/:slug" element={<CatalogProvider><CourseDetails /></CatalogProvider>} />
        <Route path="/learn/:slug" element={<p>Classroom</p>} />
      </Routes>
    </MemoryRouter>,
  );

  it('loads the public outline endpoint and lists lesson titles as locked', async () => {
    page();
    expect(await screen.findByText('Laboratory Safety Basics')).toBeTruthy();
    expect(calls.some((c) => /\/api\/classroom\/lab-safety\/outline/.test(c))).toBe(true);
    // outline only: the gated classroom must not be requested for a visitor
    expect(calls.some((c) => /\/api\/classroom\/lab-safety$/.test(c))).toBe(false);
    expect(screen.getByText('Chemical handling')).toBeTruthy();
    expect(screen.getByLabelText('Locked until enrolled')).toBeTruthy();
    expect(screen.queryByText('Wear goggles.')).toBeNull();
  });

  it('uses the authenticated classroom endpoint for an enrolled student', async () => {
    mockServer({ enrollment: { id: 'enr-1', course_id: 'crs-1', status: 'ACTIVE' } });
    page();
    expect(await screen.findByText('Laboratory Safety Basics')).toBeTruthy();
    await waitFor(() => expect(calls.some((c) => /\/api\/classroom\/lab-safety$/.test(c))).toBe(true));
    expect(await screen.findByText('ENROLLED')).toBeTruthy();
    expect(screen.getByRole('link', { name: /OPEN CLASSROOM/i })).toBeTruthy();
  });
});
