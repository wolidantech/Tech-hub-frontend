import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles, Package } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/course/CourseCard';
import CatalogEmpty from '../components/common/CatalogEmpty';
import { recommendCourses } from '../lib/lms';
import { formatNaira } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';

export default function Courses() {
  const { courses, coursesLoading, coursesError, getUserEnrollments, getProgress } = useCourses();
  const { categories, courseViews, bundles } = useLMS();
  const liveBundles = bundles.filter((b) => b.published !== false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [sort, setSort] = useState('popular');

  const visible = useMemo(() => courses.filter((c) => c.published !== false && !c.archived), [courses]);

  const filtered = useMemo(() => {
    let list = [...visible];
    if (activeCat !== 'All') list = list.filter((c) => c.category === activeCat);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        (c.shortDescription || '').toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    if (sort === 'price-low') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') list.sort((a, b) => b.price - a.price);
    if (sort === 'popular') list.sort((a, b) => b.students - a.students);
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [visible, activeCat, search, sort]);

  // Did the visitor narrow the list themselves? Only then is an empty grid a
  // search problem rather than a backend problem.
  const filtering = Boolean(search.trim()) || activeCat !== 'All';

  const recommended = useMemo(() => {
    if (!user) return [];
    const enrolled = getUserEnrollments(user.id);
    const enrolledIds = enrolled.map((e) => e.courseId);
    const completedIds = enrolledIds.filter((id) => getProgress(user.id, id).progress === 100);
    const viewedIds = courseViews.filter((v) => v.userId === user.id).map((v) => v.courseId);
    return recommendCourses({ courses: visible, enrolledIds, completedIds, viewedIds, limit: 3 });
  }, [user, visible, getUserEnrollments, getProgress, courseViews]);

  const cats = ['All', ...categories];

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/[0.06] bg-gradient-to-br from-[#061236] to-[#020a1f]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display font-black text-[36px] md:text-[52px] leading-none">COURSES</h1>
              <p className="mt-3 text-white/60 max-w-[560px]">A growing digital-skills library — AI, coding, design, video, marketing, business & more. Practical, project-based, made for real careers.</p>
              <div className="mt-4 flex items-center gap-2 text-[13px] flex-wrap">
                <span className="px-3 py-1 rounded-full glass font-bold">{filtered.length} COURSES</span>
                <span className="px-3 py-1 rounded-full glass font-bold">{categories.length} CATEGORIES</span>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-black">FROM ₦5,000</span>
              </div>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses, skills..." className="h-12 w-full md:w-[320px] rounded-full glass pl-11 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition" />
              </div>
              <div className="relative">
                <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-12 rounded-full glass pl-11 pr-10 text-sm bg-transparent appearance-none focus:outline-none">
                  <option className="bg-[#061236]" value="popular">Most Popular</option>
                  <option className="bg-[#061236]" value="rating">Top Rated</option>
                  <option className="bg-[#061236]" value="price-low">Price: Low to High</option>
                  <option className="bg-[#061236]" value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {cats.map((cat) => (
              <button key={cat} onClick={() => setActiveCat(cat)} className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[13px] font-bold tracking-wide transition-all ${activeCat === cat ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.4)]' : 'glass text-white/60 hover:text-white hover:bg-white/[0.08]'}`}>
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {recommended.length > 0 && !search && activeCat === 'All' && (
          <div>
            <h2 className="font-bold text-xl flex items-center gap-2 mb-4"><Sparkles className="h-5 w-5 text-amber-300" /> Recommended For You</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommended.map((c) => (
                <CourseCard key={c.id} course={c} onEnroll={(course) => navigate(`/course/${course.slug}`)} />
              ))}
            </div>
          </div>
        )}

        {liveBundles.length > 0 && activeCat === 'All' && !search && (
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
          {activeCat !== 'All' && <h2 className="font-bold text-xl mb-4">{activeCat}</h2>}
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
          ) : filtered.length === 0 ? (
            <CatalogEmpty filtering={filtering} error={coursesError} />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c) => (
                <CourseCard key={c.id} course={c} onEnroll={(course) => navigate(`/course/${course.slug}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
