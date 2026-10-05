// ============================================================
// Catalogue state — fed entirely by the backend API.
//
// Categories come from GET /api/course-categories and courses from
// GET /api/courses with `category_id` / `search` / `difficulty` filters, so
// the storefront never carries a hard-coded course list. Changing a course,
// its category or its price in the backend changes this page on the next
// fetch — no deploy required.
// ============================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildCategoryFilters, fetchCategories, fetchCourses, DIFFICULTY_LEVELS,
} from '../lib/catalogApi';

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

  const [filters, setFilters] = useState(emptyFilters);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [reloadKey, setReloadKey] = useState(0);
  const requestRef = useRef(0);

  const refreshCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const list = await fetchCategories();
      setCategories(list);
      setCategoriesError('');
    } catch (err) {
      // The two featured filters are always offered, so a category failure
      // narrows the chips instead of emptying the page.
      setCategoriesError(err?.message || 'Could not load course categories.');
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
    try {
      const { courses: list, pagination: page } = await fetchCourses({
        categoryId: filters.categoryId,
        category: filters.category,
        search: debouncedSearch,
        difficulty: filters.difficulty,
        page: filters.page,
        limit: PAGE_SIZE,
      });
      // Ignore anything that resolves after a newer request started.
      if (requestRef.current !== requestId) return;
      setCourses(list);
      setPagination(page);
      setCoursesError('');
    } catch (err) {
      if (requestRef.current !== requestId) return;
      setCoursesError(err?.message || 'Could not load the course catalogue.');
    } finally {
      if (requestRef.current === requestId) setCoursesLoading(false);
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

  const categoryFilters = useMemo(() => buildCategoryFilters(categories), [categories]);
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
    // courses
    courses, coursesLoading, coursesError, pagination, refreshCourses,
    // filters
    filters, setFilter, selectCategory, difficultyLevels: DIFFICULTY_LEVELS, filtering,
  }), [
    categories, categoryFilters, activeCategory, categoriesLoading, categoriesError, refreshCategories,
    courses, coursesLoading, coursesError, pagination, refreshCourses,
    filters, setFilter, selectCategory, filtering,
  ]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
