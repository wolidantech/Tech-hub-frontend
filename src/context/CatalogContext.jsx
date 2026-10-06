// ============================================================
// Catalogue state — fed by the backend API, with a Supabase fallback.
//
// Categories come from GET /api/course-categories and courses from
// GET /api/courses with `category_id` / `search` / `difficulty` filters, so
// the storefront never carries a hard-coded course list. When the API is
// unreachable, serves the SPA fallback page, or returns nothing, the SAME
// filters run against Supabase (public.categories + public.courses with the
// published/archived storefront rule) so students still see the live
// catalogue. `source` / `categoriesSource` report which layer served each
// list ('api' | 'supabase'); /backend-status explains each layer's health.
// ============================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildCategoryFilters, fetchCategories, fetchCourses, DIFFICULTY_LEVELS,
} from '../lib/catalogApi';
import { fetchSupaCategories, fetchSupaCourses } from '../lib/supabaseCatalog';

const CatalogContext = createContext(null);

export const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
};

const PAGE_SIZE = 24;
// Typed search is chatty; wait for a pause before hitting the API.
const SEARCH_DEBOUNCE_MS = 350;

export const emptyFilters = { categoryId: null, category: null, search: '', difficulty: null, page: 1 };

export function CatalogProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [categoriesSource, setCategoriesSource] = useState('api');

  const [filters, setFilters] = useState(emptyFilters);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState('');
  const [source, setSource] = useState('api');
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [reloadKey, setReloadKey] = useState(0);
  const requestRef = useRef(0);

  const refreshCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const list = await fetchCategories();
      if (list.length) {
        setCategories(list);
        setCategoriesSource('api');
        setCategoriesError('');
        return;
      }
      // The API answered but serves no categories — Supabase may still hold
      // the live set (an empty answer here is never a successful filter; chips
      // are unfiltered, so falling back cannot mislead).
      const supa = await fetchSupaCategories().catch(() => []);
      if (supa.length) {
        console.info('[catalog] course API served no categories; showing Supabase categories instead.');
        setCategories(supa);
        setCategoriesSource('supabase');
      } else {
        setCategories([]);
        setCategoriesSource('api');
      }
      setCategoriesError('');
    } catch (err) {
      let supa = [];
      try {
        supa = await fetchSupaCategories();
      } catch { supa = []; }
      if (supa.length) {
        console.info('[catalog] course API unavailable (%s); showing Supabase categories instead.', err?.message || 'request failed');
        setCategories(supa);
        setCategoriesSource('supabase');
        setCategoriesError('');
      } else {
        // The featured filters are always offered, so a category failure
        // narrows the chips instead of emptying the page.
        setCategoriesError(err?.message || 'Could not load course categories.');
      }
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => { refreshCategories(); }, [refreshCategories]);

  // Debounce only the free-text search; chips/levels/pages fetch immediately.
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(filters.search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [filters.search]);

  const loadCourses = useCallback(async () => {
    const requestId = ++requestRef.current;
    setCoursesLoading(true);
    const args = {
      categoryId: filters.categoryId,
      category: filters.category,
      search: debouncedSearch,
      difficulty: filters.difficulty,
      page: filters.page,
      limit: PAGE_SIZE,
    };
    // Ignore anything that resolves after a newer request started.
    const alive = () => requestRef.current === requestId;
    const useResult = (list, page, src) => {
      if (!alive()) return;
      setCourses(list);
      setPagination(page);
      setSource(src);
      setCoursesError('');
    };
    try {
      const { courses: list, pagination: page } = await fetchCourses(args);
      if (!alive()) return;
      if (list.length) {
        useResult(list, page, 'api');
        return;
      }
      // The API answered but serves nothing for these filters. Re-run the
      // SAME filters against Supabase: a genuine no-match stays empty, while
      // an API/contract outage still shows the live catalogue.
      try {
        const supa = await fetchSupaCourses(args);
        if (!alive()) return;
        if (supa.courses.length) {
          console.info('[catalog] course API served no courses; showing the Supabase catalogue instead.');
          useResult(supa.courses, supa.pagination, 'supabase');
        } else {
          useResult(list, page, 'api');
        }
      } catch {
        if (!alive()) return;
        useResult(list, page, 'api');
      }
    } catch (err) {
      if (!alive()) return;
      // API unreachable or broken — same filters against Supabase.
      try {
        const supa = await fetchSupaCourses(args);
        if (!alive()) return;
        console.info('[catalog] course API unavailable (%s); showing the Supabase catalogue instead.', err?.message || 'request failed');
        useResult(supa.courses, supa.pagination, 'supabase');
      } catch {
        if (!alive()) return;
        setCoursesError(err?.message || 'Could not load the course catalogue.');
      }
    } finally {
      if (alive()) setCoursesLoading(false);
    }
  }, [filters.categoryId, filters.category, filters.difficulty, filters.page, debouncedSearch]);

  useEffect(() => { loadCourses(); }, [loadCourses, reloadKey]);

  const refreshCourses = useCallback(() => setReloadKey((n) => n + 1), []);

  /** Patch filters; any filter change resets to page 1. */
  const setFilter = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, page: 1, ...patch }));
  }, []);

  /**
   * Select a category chip. Chips that carry a backend id filter with
   * `category_id` (exact); the featured chips filter by name until the backend
   * has a matching category row. `null` clears the filter.
   */
  const selectCategory = useCallback((category) => {
    if (!category) { setFilter({ categoryId: null, category: null }); return; }
    setFilter({ categoryId: category.id || null, category: category.id ? null : category.name });
  }, [setFilter]);

  // Legacy pin names only exist in the API contract; the Supabase category set
  // is complete on its own, so pinning them there would render dead chips.
  const categoryFilters = useMemo(
    () => buildCategoryFilters(categories, categoriesSource === 'supabase' ? [] : undefined),
    [categories, categoriesSource],
  );
  const activeCategory = useMemo(() => {
    if (!filters.categoryId && !filters.category) return null;
    return categoryFilters.find((c) =>
      (filters.categoryId && c.id === filters.categoryId)
      || (filters.category && String(c.name).toLowerCase() === String(filters.category).toLowerCase()))
      || { id: filters.categoryId, name: filters.category };
  }, [categoryFilters, filters.categoryId, filters.category]);

  const filtering = Boolean(debouncedSearch) || Boolean(filters.categoryId) || Boolean(filters.category)
    || Boolean(filters.difficulty);

  const value = useMemo(() => ({
    // categories
    categories, categoryFilters, activeCategory, categoriesLoading, categoriesError, refreshCategories,
    categoriesSource,
    // courses
    courses, coursesLoading, coursesError, pagination, refreshCourses, source,
    // filters
    filters, setFilter, selectCategory, difficultyLevels: DIFFICULTY_LEVELS, filtering,
  }), [
    categories, categoryFilters, activeCategory, categoriesLoading, categoriesError, refreshCategories,
    categoriesSource,
    courses, coursesLoading, coursesError, pagination, refreshCourses, source,
    filters, setFilter, selectCategory, filtering,
  ]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
