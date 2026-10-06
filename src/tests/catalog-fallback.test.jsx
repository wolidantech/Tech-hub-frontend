// @vitest-environment jsdom
// Storefront catalogue fallback: when the course API is unreachable, serves the
// SPA shell, or returns nothing, the SAME filters run against Supabase so
// students still see the live catalogue. These tests run the REAL CatalogContext
// + supabaseCatalog code against a fake Supabase client and a stubbed fetch.
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mocks = vi.hoisted(() => {
  const supaCategories = [
    { id: 'supa-cat-design', name: 'Design' },
    { id: 'supa-cat-office', name: 'Microsoft Office' },
  ];
  const live = (over) => ({
    short_description: '', description: '', long_description: '',
    instructor: 'DANQEL Faculty', instructor_role: '', duration: '',
    lessons_count: 0, level: 'Beginner', price: 5000, original_price: null,
    rating: null, students_count: null, thumbnail_key: 'default', thumbnail_url: null,
    published: true, featured: false, archived: false, created_at: '2026-01-01T00:00:00Z',
    ...over,
  });
  const supaCourses = [
    live({ id: 'supa-1', slug: 'graphic-design-with-canva', title: 'GRAPHIC DESIGN WITH CANVA', category: 'Design', featured: true, created_at: '2026-01-01T00:00:00Z' }),
    live({ id: 'supa-2', slug: 'microsoft-excel', title: 'MICROSOFT EXCEL', category: 'Microsoft Office', level: 'Beginner to Advanced', created_at: '2026-01-02T00:00:00Z' }),
    live({ id: 'supa-3', slug: 'draft-course', title: 'DRAFT COURSE', category: 'Design', published: false }),
    live({ id: 'supa-4', slug: 'archived-course', title: 'ARCHIVED COURSE', category: 'Design', archived: true }),
  ];
  const supaModules = [{ id: 'mod-1', course_id: 'supa-1', title: 'Getting Started', position: 0 }];
  const supaLessons = [{
    id: 'les-1', course_id: 'supa-1', module_id: 'mod-1', title: 'Welcome',
    type: 'video', duration: '5:00', position: 0, resources: [], sub_lessons: [],
  }];

  // Minimal thenable Supabase query builder over in-memory tables.
  class Query {
    constructor(rows) {
      this._rows = rows;
      this._filters = [];
      this._orders = [];
      this._limit = null;
    }

    select() { return this; }

    eq(col, val) { this._filters.push((r) => r[col] === val); return this; }

    in(col, vals) { this._filters.push((r) => vals.includes(r[col])); return this; }

    or(expr) {
      const alts = String(expr).split(',');
      this._filters.push((r) => alts.some((alt) => {
        const [col, op, val] = alt.split('.');
        if (op === 'is' && val === 'null') return r[col] === null || r[col] === undefined;
        if (op === 'eq') return String(r[col]) === val;
        return false;
      }));
      return this;
    }

    order(col, { ascending = true } = {}) { this._orders.push({ col, ascending }); return this; }

    limit(n) { this._limit = n; return this; }

    _run() {
      let rows = this._rows.filter((r) => this._filters.every((f) => f(r)));
      this._orders.forEach(({ col, ascending }) => {
        rows = [...rows].sort((a, b) => {
          const av = a[col];
          const bv = b[col];
          if (av === bv) return 0;
          if (av === null || av === undefined) return 1;
          if (bv === null || bv === undefined) return -1;
          return (av > bv ? 1 : -1) * (ascending ? 1 : -1);
        });
      });
      if (this._limit !== null) rows = rows.slice(0, this._limit);
      return rows;
    }

    single() {
      const rows = this._run();
      return Promise.resolve(rows[0]
        ? { data: rows[0], error: null }
        : { data: null, error: { code: 'PGRST116', message: 'Not found' } });
    }

    maybeSingle() {
      return Promise.resolve({ data: this._run()[0] || null, error: null });
    }

    then(resolve, reject) {
      return Promise.resolve({ data: this._run(), error: null }).then(resolve, reject);
    }
  }

  return {
    lms: {
      bundles: [], siteSettings: {}, learningPaths: [], posts: [], categories: [],
      getCourseQuizzes: () => [], getCourseAssignments: () => [], getCourseReviews: () => [],
      getCourseRating: (id, fallback = 4.8) => fallback, ensureCourseReviews: async () => [],
      addReview: async () => ({}), trackView: () => {},
    },
    courses: {
      courses: [], coursesLoading: false, isEnrolled: () => false,
      getManualPaymentByCourse: () => null, getUserEnrollments: () => [],
      getProgress: () => ({ progress: 0, completedLessons: [] }),
      ensureCourseDetail: async () => null,
    },
    user: null,
    supaCategories, supaCourses, supaModules, supaLessons, Query,
    sbFromCalls: [],
    apiCalls: [],
  };
});

vi.mock('../context/LMSContext', () => ({ useLMS: () => mocks.lms }));
vi.mock('../context/CourseContext', () => ({ useCourses: () => mocks.courses }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock('../components/learn/Discussions', () => ({ default: () => null }));
// Fake Supabase client (in-memory tables). Every named export the real module
// has that someone under test imports must exist here.
vi.mock('../lib/supabase', () => ({
  requireSb: () => ({
    from: (table) => {
      mocks.sbFromCalls.push(table);
      const map = {
        categories: mocks.supaCategories,
        courses: mocks.supaCourses,
        course_modules: mocks.supaModules,
        course_lessons: mocks.supaLessons,
        course_content: [],
        course_videos: [],
      };
      return new mocks.Query(map[table] || []);
    },
  }),
  friendlyError: (err) => err?.message || 'Something went wrong.',
  uploadFile: async () => { throw new Error('no uploads in tests'); },
  aiAuthHeaders: async () => ({}),
  cleanEnv: (v) => String(v ?? '').trim(),
}));

import { CatalogProvider, useCatalog } from '../context/CatalogContext';
import Courses from '../pages/Courses';
import CourseDetails from '../pages/CourseDetails';
import Search from '../pages/Search';
import { buildCategoryFilters } from '../lib/catalogApi';
import {
  mapSupaCourse, difficultyFromLevel, matchesDifficulty, deriveCategoriesFromCourses,
  fetchSupaCourses, fetchSupaCategories,
} from '../lib/supabaseCatalog';

// --------------------------------------------------------------- helpers
const realFetch = globalThis.fetch;

function stubFetch(handler) {
  globalThis.fetch = vi.fn(async (url, opts) => {
    mocks.apiCalls.push(String(url));
    return handler(String(url), opts);
  });
}

const jsonEnvelope = (data) => new Response(JSON.stringify({ success: true, data }), {
  status: 200, headers: { 'content-type': 'application/json' },
});

const API_CATEGORIES = [{ id: 'cat-science', name: 'Science & Laboratory', description: 'Lab' }];
const apiCourseCard = () => ({
  id: 'api-1', slug: 'laboratory-techniques', title: 'Laboratory Techniques & Safety',
  description: 'API desc', thumbnail_url: null, price: 8000, duration: '6 hours',
  difficulty_level: 'BEGINNER', instructor_id: 'inst-1', is_published: true,
  created_at: '2026-01-01T00:00:00Z',
  course_categories: { id: 'cat-science', name: 'Science & Laboratory' },
  instructor: { id: 'inst-1', full_name: 'DANQEL Faculty', profile_photo_url: null },
});

function SourceProbe() {
  const { source, categoriesSource } = useCatalog();
  return <div data-testid="catalog-source">{`${source}/${categoriesSource}`}</div>;
}

const renderCourses = (entry = '/courses') => render(
  <MemoryRouter initialEntries={[entry]}>
    <CatalogProvider>
      <SourceProbe />
      <Routes><Route path="/courses" element={<Courses />} /></Routes>
    </CatalogProvider>
  </MemoryRouter>,
);

beforeEach(() => {
  mocks.sbFromCalls = [];
  mocks.apiCalls = [];
  mocks.user = null;
  mocks.courses.isEnrolled = () => false;
  mocks.courses.courses = [];
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  globalThis.fetch = realFetch;
  cleanup();
  vi.restoreAllMocks();
});

// --------------------------------------------------------------- grid fallback
describe('catalogue Supabase fallback', () => {
  it('serves the Supabase catalogue when the course API is unreachable', async () => {
    stubFetch(async () => { throw new TypeError('Failed to fetch'); });
    renderCourses();

    expect(await screen.findByText('GRAPHIC DESIGN WITH CANVA')).toBeTruthy();
    expect(screen.getByText('MICROSOFT EXCEL')).toBeTruthy();
    // Storefront rule: drafts and archived rows are never a catalogue.
    expect(screen.queryByText('DRAFT COURSE')).toBeNull();
    expect(screen.queryByText('ARCHIVED COURSE')).toBeNull();
    // Chips come from Supabase; legacy API pin names must not render as dead chips.
    // (Chips are buttons; the same words also appear in card badges, which are spans.)
    expect(screen.getByRole('button', { name: 'DESIGN' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'SCIENCE & LABORATORY' })).toBeNull();
    expect(await screen.findByText('2 COURSES')).toBeTruthy();
    expect(screen.getByTestId('catalog-source').textContent).toBe('supabase/supabase');
    expect(mocks.sbFromCalls).toContain('categories');
    expect(mocks.sbFromCalls).toContain('courses');
  });

  it('serves the Supabase catalogue when the API answers 200 with nothing', async () => {
    stubFetch(async (url) => {
      if (url.includes('/api/course-categories')) return jsonEnvelope({ categories: [] });
      if (url.includes('/api/courses')) {
        return jsonEnvelope({ courses: [], pagination: { page: 1, limit: 24, total: 0, total_pages: 0 } });
      }
      return jsonEnvelope({});
    });
    renderCourses();

    expect(await screen.findByText('GRAPHIC DESIGN WITH CANVA')).toBeTruthy();
    expect(screen.getByTestId('catalog-source').textContent).toBe('supabase/supabase');
  });

  it('prefers the API and never touches Supabase when the API is healthy', async () => {
    stubFetch(async (url) => {
      if (url.includes('/api/course-categories')) return jsonEnvelope({ categories: API_CATEGORIES });
      if (url.includes('/api/courses')) {
        return jsonEnvelope({
          courses: [apiCourseCard()],
          pagination: { page: 1, limit: 24, total: 1, total_pages: 1 },
        });
      }
      return jsonEnvelope({});
    });
    renderCourses();

    expect(await screen.findByText('Laboratory Techniques & Safety')).toBeTruthy();
    expect(screen.queryByText('GRAPHIC DESIGN WITH CANVA')).toBeNull();
    expect(screen.getByRole('button', { name: 'SCIENCE & LABORATORY' })).toBeTruthy();
    expect(screen.getByTestId('catalog-source').textContent).toBe('api/api');
    expect(mocks.sbFromCalls).toEqual([]);
  });

  it('applies the active category filter to the fallback query (?cat= deep link)', async () => {
    stubFetch(async () => { throw new TypeError('Failed to fetch'); });
    renderCourses('/courses?cat=Design');

    expect(await screen.findByText('GRAPHIC DESIGN WITH CANVA')).toBeTruthy();
    await waitFor(() => expect(screen.queryByText('MICROSOFT EXCEL')).toBeNull());
    expect(screen.getByTestId('catalog-source').textContent).toBe('supabase/supabase');
  });
});

// --------------------------------------------------------------- query layer
describe('supabaseCatalog queries', () => {
  it('lists only live courses, featured first, with honest pagination', async () => {
    const { courses, pagination } = await fetchSupaCourses({});
    expect(courses.map((c) => c.slug)).toEqual(['graphic-design-with-canva', 'microsoft-excel']);
    expect(pagination).toEqual({ page: 1, limit: 24, total: 2, totalPages: 1 });
    expect(courses[0].source).toBe('supabase');
  });

  it('filters by search, category, category_id and difficulty', async () => {
    expect((await fetchSupaCourses({ search: 'excel' })).courses.map((c) => c.slug))
      .toEqual(['microsoft-excel']);
    expect((await fetchSupaCourses({ category: 'design' })).courses.map((c) => c.slug))
      .toEqual(['graphic-design-with-canva']);
    expect((await fetchSupaCourses({ categoryId: 'supa-cat-office' })).courses.map((c) => c.slug))
      .toEqual(['microsoft-excel']);
    expect((await fetchSupaCourses({ categoryId: 'no-such-id' })).courses).toEqual([]);
    expect((await fetchSupaCourses({ difficulty: 'ADVANCED' })).courses.map((c) => c.slug))
      .toEqual(['microsoft-excel']);
    expect((await fetchSupaCourses({ difficulty: 'BEGINNER' })).courses).toHaveLength(2);
  });

  it('paginates client-side', async () => {
    const { courses, pagination } = await fetchSupaCourses({ page: 2, limit: 1 });
    expect(courses.map((c) => c.slug)).toEqual(['microsoft-excel']);
    expect(pagination).toEqual({ page: 2, limit: 1, total: 2, totalPages: 2 });
  });

  it('reads categories, deriving chips from courses when the table is empty', async () => {
    expect(await fetchSupaCategories()).toEqual([
      { id: 'supa-cat-design', name: 'Design', description: '', createdAt: null },
      { id: 'supa-cat-office', name: 'Microsoft Office', description: '', createdAt: null },
    ]);
    const saved = mocks.supaCategories;
    mocks.supaCategories = [];
    try {
      expect(await fetchSupaCategories()).toEqual([
        { id: null, name: 'Design', description: '', createdAt: null },
        { id: null, name: 'Microsoft Office', description: '', createdAt: null },
      ]);
    } finally {
      mocks.supaCategories = saved;
    }
  });
});

// --------------------------------------------------------------- pure mappers
describe('catalogue mappers', () => {
  it('buildCategoryFilters honours a featured override ( Supabase sources pin nothing )', () => {
    const cats = [{ id: 'a', name: 'Design' }, { id: 'b', name: 'Marketing' }];
    expect(buildCategoryFilters(cats, []).map((c) => c.name)).toEqual(['Design', 'Marketing']);
    expect(buildCategoryFilters(cats).length).toBeGreaterThan(cats.length);
  });

  it('maps levels to difficulty filters', () => {
    expect(difficultyFromLevel('Beginner')).toBe('BEGINNER');
    expect(difficultyFromLevel('Beginner to Advanced')).toBe('ADVANCED');
    expect(difficultyFromLevel('Something else')).toBeNull();
    expect(matchesDifficulty('Beginner to Intermediate', 'INTERMEDIATE')).toBe(true);
    expect(matchesDifficulty('Beginner', 'ADVANCED')).toBe(false);
    expect(matchesDifficulty('Beginner', null)).toBe(true);
  });

  it('derives distinct sorted chips from course rows', () => {
    expect(deriveCategoriesFromCourses([
      { category: 'Design' }, { category: 'design' }, { category: null },
    ])).toEqual([
      { id: null, name: 'Design', description: '', createdAt: null },
      { id: null, name: 'General', description: '', createdAt: null },
    ]);
  });

  it('maps a Supabase row to the storefront card shape', () => {
    const card = mapSupaCourse(mocks.supaCourses[0], new Map([['design', 'supa-cat-design']]));
    expect(card).toMatchObject({
      slug: 'graphic-design-with-canva', category: 'Design', categoryId: 'supa-cat-design',
      level: 'Beginner', difficulty: 'BEGINNER', price: 5000, published: true,
      featured: true, source: 'supabase',
    });
    expect(mapSupaCourse({ ...mocks.supaCourses[0], category: null }).category).toBe('General');
  });
});

// --------------------------------------------------------------- details + search
describe('details and search fallbacks', () => {
  it('serves the course outline from Supabase and skips the classroom endpoint', async () => {
    mocks.user = { id: 'student-1', role: 'student', fullName: 'Test Student' };
    mocks.courses.isEnrolled = () => true;
    stubFetch(async () => { throw new TypeError('Failed to fetch'); });
    render(
      <MemoryRouter initialEntries={['/course/graphic-design-with-canva']}>
        <Routes><Route path="/course/:slug" element={<CourseDetails />} /></Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('GRAPHIC DESIGN WITH CANVA')).toBeTruthy();
    expect(screen.getByText('Getting Started')).toBeTruthy();
    expect(screen.getByText('Welcome')).toBeTruthy();
    // The outline endpoint was attempted; the gated classroom endpoint must not
    // be — Learn.jsx reads the enrolled curriculum from Supabase directly.
    expect(mocks.apiCalls.some((u) => u.includes('/api/classroom/'))).toBe(true);
    expect(mocks.apiCalls.some((u) => /\/api\/classroom\/[^/]+$/.test(u))).toBe(false);
  });

  it('falls back to Supabase rows for search course hits', async () => {
    mocks.courses.courses = mocks.supaCourses.map((c) => ({
      id: c.id, slug: c.slug, title: c.title, shortDescription: c.short_description,
      category: c.category, published: c.published, archived: c.archived, curriculum: [],
    }));
    stubFetch(async () => { throw new TypeError('Failed to fetch'); });
    render(
      <MemoryRouter initialEntries={['/search?q=excel']}>
        <Routes><Route path="/search" element={<Search />} /></Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('MICROSOFT EXCEL')).toBeTruthy();
  });
});
