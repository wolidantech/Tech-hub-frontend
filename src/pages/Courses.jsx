import { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { categories } from '../data/courses';
import CourseCard from '../components/course/CourseCard';
import { useNavigate } from 'react-router-dom';

export default function Courses() {
  const { courses } = useCourses();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [sort, setSort] = useState('popular');

  const filtered = useMemo(() => {
    let list = [...courses];
    if (activeCat !== 'All') list = list.filter(c => c.category === activeCat);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.shortDescription.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }
    if (sort === 'price-low') list.sort((a,b) => a.price - b.price);
    if (sort === 'price-high') list.sort((a,b) => b.price - a.price);
    if (sort === 'popular') list.sort((a,b) => b.students - a.students);
    return list;
  }, [courses, activeCat, search, sort]);

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/[0.06] bg-gradient-to-br from-[#061236] to-[#020a1f]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display font-black text-[36px] md:text-[52px] leading-none">COURSES</h1>
              <p className="mt-3 text-white/60 max-w-[560px]">Practical, project-based courses designed for Nigerians. Learn skills that pay, build your portfolio, and start earning.</p>
              <div className="mt-4 flex items-center gap-2 text-[13px]">
                <span className="px-3 py-1 rounded-full glass font-bold">{filtered.length} COURSES</span>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-black">FROM ₦5,000</span>
              </div>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses, skills..." className="h-12 w-full md:w-[320px] rounded-full glass pl-11 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition" />
              </div>
              <div className="relative">
                <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <select value={sort} onChange={e => setSort(e.target.value)} className="h-12 rounded-full glass pl-11 pr-10 text-sm bg-transparent appearance-none focus:outline-none">
                  <option className="bg-[#061236]" value="popular">Most Popular</option>
                  <option className="bg-[#061236]" value="price-low">Price: Low to High</option>
                  <option className="bg-[#061236]" value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)} className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[13px] font-bold tracking-wide transition-all ${activeCat === cat ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.4)]' : 'glass text-white/60 hover:text-white hover:bg-white/[0.08]'}`}>
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 glass rounded-[24px]">
            <Filter className="h-10 w-10 mx-auto text-white/20 mb-4" />
            <div className="font-bold text-lg">No courses found</div>
            <div className="text-sm text-white/50 mt-1">Try adjusting search or category</div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => (
              <CourseCard key={c.id} course={c} onEnroll={(course) => navigate(`/course/${course.slug}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
