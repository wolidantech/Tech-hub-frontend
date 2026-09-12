import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, BookOpen, Map as MapIcon, MessagesSquare, Layers } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';

export default function Search() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').toLowerCase().trim();
  const { courses } = useCourses();
  const { learningPaths, posts, categories } = useLMS();

  const results = useMemo(() => {
    if (!q) return null;
    const matchCourses = courses.filter((c) => c.published !== false && !c.archived && `${c.title} ${c.shortDescription} ${c.category}`.toLowerCase().includes(q));
    const lessons = [];
    courses.filter((c) => c.published !== false && !c.archived).forEach((c) => {
      (c.curriculum || []).forEach((m) => {
        (m.lessons || []).forEach((l) => {
          if (`${l.title} ${l.textContent || ''}`.toLowerCase().includes(q)) lessons.push({ course: c, module: m, lesson: l });
        });
      });
    });
    const matchCats = categories.filter((c) => c.toLowerCase().includes(q));
    const matchPaths = learningPaths.filter((p) => `${p.title} ${p.desc}`.toLowerCase().includes(q));
    const matchPosts = posts.filter((p) => `${p.title} ${p.body}`.toLowerCase().includes(q)).slice(0, 10);
    return { matchCourses, lessons: lessons.slice(0, 12), matchCats, matchPaths, matchPosts };
  }, [q, courses, learningPaths, posts, categories]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display font-black text-[32px] flex items-center gap-3"><SearchIcon className="h-8 w-8 text-cyan-300" /> Search</h1>
        <p className="text-white/60 mt-1">{q ? <>Results for "<span className="text-white font-bold">{q}</span>"</> : 'Type in the search box above to find courses, lessons, paths and discussions.'}</p>

        {results && (
          <div className="mt-8 space-y-8">
            <section>
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2"><BookOpen className="h-5 w-5 text-cyan-300" /> Courses ({results.matchCourses.length})</h2>
              {results.matchCourses.length === 0 ? <div className="text-sm text-white/40">No courses found.</div> : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {results.matchCourses.map((c) => (
                    <Link key={c.id} to={`/course/${c.slug}`} className="glass rounded-2xl p-4 hover:border-cyan-400/40">
                      <div className="font-bold text-sm">{c.title}</div>
                      <div className="text-xs text-white/40 mt-1">{c.category} • {c.level}</div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2"><Layers className="h-5 w-5 text-purple-300" /> Lessons ({results.lessons.length})</h2>
              {results.lessons.length === 0 ? <div className="text-sm text-white/40">No lessons found.</div> : (
                <div className="space-y-2">
                  {results.lessons.map(({ course, module, lesson }) => (
                    <Link key={lesson.id} to={`/course/${course.slug}`} className="block glass rounded-2xl p-3.5 hover:border-purple-400/40 text-sm">
                      <span className="font-bold">{lesson.title}</span>
                      <span className="text-white/40"> — {module.title} • {course.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2"><MapIcon className="h-5 w-5 text-green-300" /> Learning Paths ({results.matchPaths.length})</h2>
              <div className="flex flex-wrap gap-2">
                {results.matchPaths.map((p) => <Link key={p.id} to="/learning-paths" className="px-4 py-2 rounded-full glass text-sm font-bold">{p.icon} {p.title}</Link>)}
                {results.matchPaths.length === 0 && <div className="text-sm text-white/40">No paths found.</div>}
              </div>
            </section>

            {results.matchCats.length > 0 && (
              <section>
                <h2 className="font-bold text-lg mb-3">Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {results.matchCats.map((c) => <Link key={c} to="/courses" className="px-4 py-2 rounded-full glass text-sm font-bold">{c}</Link>)}
                </div>
              </section>
            )}

            <section>
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2"><MessagesSquare className="h-5 w-5 text-amber-300" /> Discussions ({results.matchPosts.length})</h2>
              {results.matchPosts.length === 0 ? <div className="text-sm text-white/40">No discussions found.</div> : (
                <div className="space-y-2">
                  {results.matchPosts.map((p) => (
                    <div key={p.id} className="glass rounded-2xl p-3.5 text-sm">
                      <span className="font-bold">{p.title}</span>
                      <span className="text-white/40"> — by {p.authorName}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
