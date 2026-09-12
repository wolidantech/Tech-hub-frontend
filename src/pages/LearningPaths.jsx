import { Link } from 'react-router-dom';
import { Map, CheckCircle2, ArrowRight, Play } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import { useAuth } from '../context/AuthContext';
import CourseArt from '../components/course/CourseArt';

export default function LearningPaths() {
  const { courses, getCourseBySlug, isEnrolled, getProgress } = useCourses();
  const { learningPaths } = useLMS();
  const { user } = useAuth();

  const pathProgress = (path) => {
    if (!user) return null;
    const items = path.courseSlugs.map((s) => getCourseBySlug(s)).filter(Boolean);
    if (!items.length) return 0;
    const total = items.reduce((s, c) => s + getProgress(user.id, c.id).progress, 0);
    return Math.round(total / items.length);
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/[0.06] bg-gradient-to-br from-[#061236] to-[#020a1f]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[11px] font-bold tracking-widest"><Map className="h-4 w-4 text-cyan-300" /> CAREER ROADMAPS</div>
          <h1 className="font-display font-black text-[36px] md:text-[52px] leading-none mt-4">LEARNING PATHS</h1>
          <p className="mt-3 text-white/60 max-w-[620px] mx-auto">Don't learn randomly — follow a structured path from <span className="text-white font-bold">Beginner → Intermediate → Advanced</span> and build a career.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {learningPaths.map((path) => {
          const items = path.courseSlugs.map((s) => getCourseBySlug(s)).filter(Boolean);
          const pct = pathProgress(path);
          return (
            <div key={path.id} className="glass rounded-[24px] p-6 md:p-8">
              <div className="flex flex-wrap justify-between gap-4 mb-6">
                <div className="flex gap-4 items-center">
                  <div className="text-5xl">{path.icon}</div>
                  <div>
                    <h2 className="font-black text-xl md:text-2xl">{path.title}</h2>
                    <p className="text-sm text-white/60 mt-1 max-w-[520px]">{path.desc}</p>
                    <div className="text-xs text-cyan-300 font-bold mt-1">{path.level} • {items.length} courses</div>
                  </div>
                </div>
                {pct != null && (
                  <div className="text-right">
                    <div className="font-black text-2xl text-cyan-300">{pct}%</div>
                    <div className="text-[11px] text-white/40 font-bold">PATH PROGRESS</div>
                    <div className="w-40 h-2 rounded-full bg-white/10 mt-2 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600" style={{ width: `${pct}%` }} /></div>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {items.map((c, i) => {
                  const enrolled = user ? isEnrolled(user.id, c.id) : false;
                  const p = user ? getProgress(user.id, c.id).progress : 0;
                  return (
                    <div key={c.id} className="relative">
                      {i < items.length - 1 && <div className="hidden xl:flex absolute top-1/2 -right-3 z-10 h-6 w-6 rounded-full bg-cyan-500 items-center justify-center"><ArrowRight className="h-3.5 w-3.5 text-black" /></div>}
                      <Link to={enrolled ? `/learn/${c.slug}` : `/course/${c.slug}`} className="block rounded-2xl overflow-hidden glass hover:border-cyan-400/40 transition group">
                        <div className="relative">
                          <CourseArt course={c} className="h-28" />
                          <div className="absolute top-2 left-2 h-7 w-7 rounded-full bg-black/60 backdrop-blur font-black text-xs flex items-center justify-center">STEP {i + 1}</div>
                          {p === 100 && <div className="absolute top-2 right-2"><CheckCircle2 className="h-6 w-6 text-green-400" /></div>}
                        </div>
                        <div className="p-3">
                          <div className="font-bold text-xs leading-tight line-clamp-2 group-hover:text-cyan-300">{c.title}</div>
                          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600" style={{ width: `${p}%` }} /></div>
                          <div className="mt-1.5 text-[11px] font-bold text-white/50 flex items-center gap-1"><Play className="h-3 w-3" /> {enrolled ? (p === 100 ? 'REVIEW' : `CONTINUE ${p}%`) : 'VIEW COURSE'}</div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
