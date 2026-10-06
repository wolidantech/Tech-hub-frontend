import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Sparkles, Package, LayoutGrid, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useLMS } from '../context/LMSContext';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/course/CourseCard';
import CatalogEmpty from '../components/common/CatalogEmpty';
import { formatNaira } from '../lib/utils';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

// Sorting is applied to the page the API returned; the server decides WHICH
// courses exist (GET /api/courses), so nothing here names a course.
const SORTS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'az', label: 'Title: A → Z' },
];

export default function Courses() {
  const {
    categories, categoryFilters, activeCategory, categoriesLoading, categoriesError,
    courses, coursesLoading, coursesError, pagination, refreshCourses, refreshCategories,
    filters, setFilter, selectCategory, difficultyLevels, filtering,
  } = useCatalog();
  const { bundles } = useLMS();
  const { getUserEnrollments, getProgress } = useCourses();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const [sort, setSort] = useState('newest');
  const liveBundles = bundles.filter((b) => b.published !== false);

  // Deep links (?cat=..., ?q=...) select a category / prefill the search box,
  // then the catalogue is fetched from the API with those filters.
  useEffect(() => {
    const cat = sp.get('cat');
    const q = sp.get('q');
    const patch = {};
    if (q !== null) patch.search = q;
    if (cat) {
      const match = categoryFilters.find((c) => c.name.toLowerCase() === cat.toLowerCase());
      patch.categoryId = match?.id || null;
      patch.category = match?.id ? null : cat;
    }
    if (Object.keys(patch).length) setFilter(patch);
    // Runs once the chips exist so ?cat= can resolve to a real category_id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilters.length]);

  const shown = useMemo(() => {
    const list = [...courses];
    if (sort === 'price-low') list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === 'price-high') list.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === 'az') list.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    return list;
  }, [courses, sort]);

  // Recommendations come from the live catalogue too: courses in categories the
  // student already studies, minus the ones they are enrolled in.
  const recommended = useMemo(() => {
    if (!user || !courses.length) return [];
    const enrolled = getUserEnrollments(user.id);
    const enrolledIds = new Set(enrolled.map((e) => e.courseId));
    const doneIds = new Set(enrolled.filter((e) => getProgress(user.id, e.courseId).progress === 100).map((e) => e.courseId));
    const studied = new Set([
      ...[...enrolledIds, ...doneIds].map((id) => courses.find((c) => c.id === id)?.category).filter(Boolean),
    ]);
    if (!studied.size) return [];
    return courses.filter((c) => studied.has(c.category) && !enrolledIds.has(c.id)).slice(0, 3);
  }, [user, courses, getUserEnrollments, getProgress]);

  const pickCategory = (cat) => {
    selectCategory(cat);
    const next = new URLSearchParams(sp);
    if (cat) next.set('cat', cat.name); else next.delete('cat');
    setSp(next, { replace: true });
  };

  const changePage = (page) => {
    setFilter({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-clip">
      <div className="border-b border-white/[0.06] bg-gradient-to-br from-[#061236] to-[#020a1f]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="max-w-full inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl glass text-[9px] sm:text-[10px] font-black tracking-[0.12em] sm:tracking-[0.2em] mb-3"><Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-300" /> <span>LIVE CATALOGUE • SERVED FROM THE COURSE API</span></div>
              <h1 className="font-display font-black text-[30px] sm:text-[36px] md:text-[48px] leading-none break-words">GLOBAL SKILLS LIBRARY</h1>
              <p className="mt-3 text-white/60 max-w-[560px]">Every course below is fetched from the course catalogue as it exists right now — filter by category, subject or level. New courses appear the moment they are published.</p>
              <div className="mt-4 flex items-center gap-2 text-[13px] flex-wrap">
                <span className="px-3 py-1 rounded-full glass font-bold">{pagination.total} COURSES</span>
                <span className="px-3 py-1 rounded-full glass font-bold">{categories.length} CATEGORIES</span>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-black">FROM ₦5,000</span>
              </div>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <label htmlFor="catalog-search" className="sr-only">Search courses</label>
                <input
                  id="catalog-search"
                  value={filters.search}
                  onChange={(e) => setFilter({ search: e.target.value })}
                  placeholder="Search courses by title..."
                  type="search" autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search"
                  className="h-12 w-full md:w-[320px] rounded-full glass pl-11 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition"
                />
              </div>
              <div className="relative">
                <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <label htmlFor="catalog-sort" className="sr-only">Sort courses</label>
                <select id="catalog-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="h-12 w-full rounded-full glass pl-11 pr-10 text-sm bg-transparent appearance-none focus:outline-none">
                  {SORTS.map((s) => <option key={s.id} className="bg-[#061236]" value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Category filters — served by GET /api/course-categories, with the
              two flagship filters pinned first. */}
          <div className="mt-8 flex flex-wrap gap-2" aria-label="Course categories">
            <button
              onClick={() => pickCategory(null)}
              aria-pressed={!activeCategory}
              className={`min-h-11 inline-flex items-center gap-2 px-4 sm:px-5 rounded-full text-[12px] sm:text-[13px] font-bold tracking-wide transition-all ${!activeCategory ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.4)]' : 'glass text-white/60 hover:text-white hover:bg-white/[0.08]'}`}
            >
              ALL COURSES
            </button>
            {categoryFilters.map((cat) => {
              const isActive = !!activeCategory
                && ((activeCategory.id && cat.id && activeCategory.id === cat.id)
                  || String(activeCategory.name).toLowerCase() === String(cat.name).toLowerCase());
              return (
                <button
                  key={`${cat.id || cat.name}`}
                  onClick={() => pickCategory(cat)}
                  aria-pressed={isActive}
                  title={cat.description || cat.name}
                  className={`min-h-11 inline-flex items-center gap-2 px-4 sm:px-5 rounded-full text-[12px] sm:text-[13px] font-bold tracking-wide transition-all ${isActive ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.4)]' : 'glass text-white/60 hover:text-white hover:bg-white/[0.08]'}`}
                >
                  {cat.name.toUpperCase()}
                </button>
              );
            })}
            {categoriesLoading && <span className="min-h-11 inline-flex items-center px-4 text-[11px] text-white/40">Loading categories…</span>}
          </div>
          {categoriesError && (
            <p className="mt-2 text-xs text-amber-300 flex flex-wrap items-center gap-2">
              {categoriesError}
              <button onClick={refreshCategories} className="min-h-11 px-3 rounded-full glass font-bold hover:bg-white/10">Retry categories</button>
            </p>
          )}

          {/* Difficulty filter — validated by the API (BEGINNER/INTERMEDIATE/ADVANCED) */}
          <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Filter by difficulty level">
            <span className="w-full sm:w-auto text-[10px] font-black tracking-widest text-white/35">LEVEL:</span>
            <button onClick={() => setFilter({ difficulty: null })} className={`min-h-11 px-3.5 rounded-full text-[11px] font-bold transition-all ${!filters.difficulty ? 'bg-purple-500 text-white' : 'glass text-white/50 hover:text-white'}`}>ALL LEVELS</button>
            {difficultyLevels.map((lv) => (
              <button key={lv} onClick={() => setFilter({ difficulty: lv })} className={`min-h-11 px-3.5 rounded-full text-[11px] font-bold transition-all ${filters.difficulty === lv ? 'bg-purple-500 text-white' : 'glass text-white/50 hover:text-white'}`}>
                {lv}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Category explorer — built from the API's own categories */}
        {!filtering && (
          <div>
            <h2 className="font-bold text-xl flex items-center gap-2 mb-1"><LayoutGrid className="h-5 w-5 text-cyan-300" /> Browse By Category</h2>
            <p className="text-sm text-white/50 mb-4">Categories come from the course catalogue — tap one to filter the library.</p>
            {categoriesLoading && !categories.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-white/[0.05] animate-pulse" />)}
              </div>
            ) : categories.length === 0 ? (
              <div className="glass rounded-[24px] p-6 text-sm text-white/60">
                No categories have been created yet.{" "}
                <button onClick={refreshCategories} className="min-h-11 px-3 rounded-full glass font-bold">Reload categories</button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => pickCategory(cat)} className="glass rounded-[24px] p-5 text-left hover:border-cyan-400/40 transition min-h-11">
                    <div className="font-bold text-sm">{cat.name}</div>
                    {cat.description && <p className="mt-1.5 text-xs text-white/50 line-clamp-2">{cat.description}</p>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {recommended.length > 0 && !filtering && (
          <div>
            <h2 className="font-bold text-xl flex items-center gap-2 mb-4"><Sparkles className="h-5 w-5 text-amber-300" /> Recommended For You</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommended.map((c) => (
                <CourseCard key={c.id} course={c} onEnroll={(course) => navigate(`/course/${course.slug}`)} />
              ))}
            </div>
          </div>
        )}

        {liveBundles.length > 0 && !filtering && (
          <div>
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><Package className="h-5 w-5 text-amber-300" /> Course Bundles — Save Big 🎁</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveBundles.map((b) => (
                <div key={b.id} className="rounded-[24px] glass overflow-hidden hover:border-amber-400/40 transition">
                  <div className="bg-gradient-to-br from-amber-500/30 to-orange-600/30 p-6 text-center relative">
                    {b.badge && <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-black">{b.badge}</span>}
                    <div className="text-5xl">🎁</div>
                    <h3 className="font-black text-lg mt-2">{b.title}</h3>
                    <div className="text-xs text-white/60 mt-1">{(b.courseIds || []).length} courses included</div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-white/50 leading-relaxed line-clamp-2 min-h-[32px]">{b.description}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-black text-2xl">{formatNaira(b.price)}</span>
                      <span className="text-sm line-through text-white/40">{formatNaira(b.originalPrice || b.price)}</span>
                    </div>
                    <Link to={`/enroll/bundle/${b.id}`} className="mt-4 block text-center h-11 rounded-full bg-gradient-to-r from-amber-400 to-orange-600 text-white font-bold text-sm leading-[44px]">GET THIS BUNDLE</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-bold text-xl">
              {activeCategory ? activeCategory.name : (filters.search ? `Results for “${filters.search}”` : 'All Courses')}
            </h2>
            <button onClick={refreshCourses} className="min-h-11 inline-flex items-center gap-2 px-4 rounded-full glass text-xs font-bold hover:bg-white/10">
              <RefreshCw className={`h-3.5 w-3.5 ${coursesLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {coursesLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass rounded-[24px] overflow-hidden animate-pulse">
                  <div className="aspect-video bg-white/[0.06]" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-24 rounded bg-white/10" />
                    <div className="h-4 w-full rounded bg-white/10" />
                    <div className="h-4 w-2/3 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : shown.length === 0 ? (
            <CatalogEmpty
              filtering={filtering && !coursesError}
              error={coursesError}
              onRetry={refreshCourses}
              emptyCategory={activeCategory && !coursesError ? activeCategory.name : null}
              onClearCategory={() => pickCategory(null)}
            />
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {shown.map((c) => (
                  <CourseCard key={c.id} course={c} onEnroll={(course) => navigate(`/course/${course.slug}`)} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => changePage(pagination.page - 1)}
                    className="min-h-11 inline-flex items-center gap-2 px-4 rounded-full glass text-xs font-bold disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <span className="text-xs text-white/50">Page {pagination.page} of {pagination.totalPages} • {pagination.total} courses</span>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => changePage(pagination.page + 1)}
                    className="min-h-11 inline-flex items-center gap-2 px-4 rounded-full glass text-xs font-bold disabled:opacity-40"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
