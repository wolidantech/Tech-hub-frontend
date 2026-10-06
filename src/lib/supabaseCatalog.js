// ============================================================
// Supabase-backed catalogue source — the storefront's fallback.
//
// The grid, chips, homepage strip and search hits prefer the course API
// (GET /api/courses …), but when the API is unreachable, serves the SPA
// fallback page, or returns nothing, the storefront falls back to THESE
// queries instead of rendering an empty catalogue. The data contract is the
// frontend one: public.categories(id, name, sort_order) and
// public.courses(*, category TEXT, published BOOL, archived BOOL), with the
// storefront rule `published = true AND archived IS NOT TRUE` applied in the
// query itself — mirroring the RLS policy, so admins (who can see drafts via
// RLS) still get a clean public grid.
//
// Every function returns the SAME shapes as src/lib/catalogApi.js, so
// CatalogContext consumers never know which source served them. The `source`
// field ('supabase') plus the [catalog] console messages exist for operators;
// /backend-status reports each layer independently.
// ============================================================
import { requireSb, friendlyError } from './supabase';
import { fetchCourseDetail } from './store';

const num = (v, fallback = null) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

async function one(query) {
  const { data, error } = await query;
  if (error) throw new Error(friendlyError(error));
  return data;
}

/** Free-text `level` ("Beginner to Intermediate") → catalogue difficulty enum. */
export const difficultyFromLevel = (level) => {
  const text = String(level || '').toUpperCase();
  if (/\bADVANCED\b/.test(text)) return 'ADVANCED';
  if (/\bINTERMEDIATE\b/.test(text)) return 'INTERMEDIATE';
  if (/\bBEGINNER\b/.test(text)) return 'BEGINNER';
  return null;
};

/** A course matches a difficulty filter when its level text names that word. */
export const matchesDifficulty = (level, difficulty) => {
  if (!difficulty) return true;
  return String(level || '').toUpperCase().includes(String(difficulty).toUpperCase());
};

/**
 * Supabase course row → the card shape the storefront renders.
 * `categoriesByName` (lowercase name → id) is only populated when the caller
 * already fetched categories for a category_id filter; cards otherwise carry
 * categoryId: null and match chips by name, which Courses.jsx supports.
 */
export const mapSupaCourse = (c, categoriesByName = new Map()) => c && ({
  id: c.id,
  slug: c.slug,
  title: c.title,
  description: c.description || '',
  shortDescription: c.short_description || c.description || '',
  longDescription: c.long_description || c.description || '',
  category: c.category || 'General',
  categoryId: categoriesByName.get(String(c.category || '').toLowerCase()) || null,
  instructor: c.instructor || null,
  instructorId: null,
  instructorRole: c.instructor_role || null,
  duration: c.duration || '',
  level: c.level || 'All levels',
  difficulty: difficultyFromLevel(c.level),
  price: num(c.price, 0),
  originalPrice: num(c.original_price, null),
  thumbnailUrl: c.thumbnail_url || null,
  thumbnail: c.thumbnail_key || 'default',
  rating: num(c.rating, null),
  students: num(c.students_count, null),
  lessonsCount: num(c.lessons_count, null),
  published: c.published !== false,
  featured: !!c.featured,
  createdAt: c.created_at,
  source: 'supabase',
});

const mapSupaCategory = (c) => c && ({
  id: c.id || null,
  name: c.name,
  description: '',
  createdAt: c.created_at || null,
});

/** Distinct course.category values → chips, when the categories table is empty. */
export const deriveCategoriesFromCourses = (courses = []) => {
  const seen = new Map();
  courses.forEach((c) => {
    const name = String(c.category || 'General').trim() || 'General';
    if (!seen.has(name.toLowerCase())) {
      seen.set(name.toLowerCase(), { id: null, name, description: '', createdAt: null });
    }
  });
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
};

/** Live categories, oldest sort_order first — with a course-derived backup. */
export async function fetchSupaCategories() {
  const sb = requireSb();
  const rows = await one(sb.from('categories').select('id,name').order('sort_order').order('name'));
  if (rows?.length) return rows.map(mapSupaCategory).filter(Boolean);
  // Table readable but empty: chips still work from the live course rows.
  const courses = await one(
    sb.from('courses').select('category')
      .eq('published', true)
      .or('archived.is.null,archived.eq.false')
      .limit(500),
  );
  return deriveCategoriesFromCourses(courses || []);
}

/**
 * Live courses with the same filter arguments as catalogApi.fetchCourses.
 * The catalogue is small (dozens of rows), so one ordered query plus
 * client-side filtering keeps every filter exact without fragile ilike SQL.
 */
export async function fetchSupaCourses(filters = {}) {
  const sb = requireSb();
  const {
    categoryId = null, category = null, search = '',
    difficulty = null, page = 1, limit = 24,
  } = filters;
  const rows = await one(
    sb.from('courses').select('*')
      .eq('published', true)
      .or('archived.is.null,archived.eq.false')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(500),
  );

  let categoriesByName = new Map();
  let categoryName = category ? String(category).trim().toLowerCase() : null;
  if (categoryId) {
    const cats = await fetchSupaCategories();
    const hit = cats.find((c) => c.id === categoryId);
    // Unknown id: an exact filter with no match is an empty result, exactly
    // like the API behaves — never fall through to unfiltered rows.
    if (!hit) {
      return { courses: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
    }
    categoryName = hit.name.toLowerCase();
    categoriesByName = new Map(cats.filter((c) => c.id).map((c) => [c.name.toLowerCase(), c.id]));
  }

  const q = String(search || '').trim().toLowerCase();
  const list = (rows || [])
    .filter((c) => {
      if (categoryName) {
        const mine = String(c.category || '').toLowerCase();
        if (mine !== categoryName && !mine.includes(categoryName) && !categoryName.includes(mine)) return false;
      }
      if (q && !`${c.title || ''} ${c.description || ''} ${c.category || ''}`.toLowerCase().includes(q)) return false;
      if (!matchesDifficulty(c.level, difficulty)) return false;
      return true;
    })
    .map((c) => mapSupaCourse(c, categoriesByName));

  const total = list.length;
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 24));
  return {
    courses: list.slice((safePage - 1) * safeLimit, safePage * safeLimit),
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
  };
}

/**
 * Public outline for one slug, built from Supabase (titles only — never video
 * URLs or lesson bodies, so a visitor cannot unlock anything). Returns null
 * when no live course has this slug.
 */
export async function fetchSupaOutlineBySlug(slug) {
  const sb = requireSb();
  const { data, error } = await sb.from('courses').select('*')
    .eq('slug', slug)
    .eq('published', true)
    .or('archived.is.null,archived.eq.false')
    .maybeSingle();
  if (error) throw new Error(friendlyError(error));
  if (!data) return null;
  const detail = await fetchCourseDetail(data.id);
  const card = mapSupaCourse(data);
  const modules = (detail.curriculum || []).map((m) => ({
    id: m.id,
    title: m.title,
    description: '',
    topics: [],
    lessons: (m.lessons || []).map((l) => ({
      id: l.id,
      title: l.title,
      description: '',
      type: l.type === 'video' ? 'video' : 'text',
      duration: l.duration || '',
      freePreview: false,
      locked: true,
    })),
    lessonsCount: (m.lessons || []).length,
  }));
  const totalLessons = modules.reduce((n, m) => n + m.lessonsCount, 0);
  return {
    course: card,
    modules,
    curriculum: modules,
    totalLessons,
    counts: { modules: modules.length, topics: 0, lessons: totalLessons },
    curriculumComplete: totalLessons > 0,
    curriculumStatus: totalLessons > 0
      ? { complete: true, message: `Curriculum ready — ${modules.length} module(s), ${totalLessons} lesson(s)` }
      : { complete: false, message: 'No curriculum is available for this course yet.' },
    enrollment: null,
    progress: null,
    hasAccess: false,
    source: 'supabase',
  };
}
