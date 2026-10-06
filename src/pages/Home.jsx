import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRight, Play, CheckCircle2, GraduationCap, Users, Monitor, Award, Sparkles, Zap, Globe, BookOpen, MessageCircle, Search, Map, Bot, Star, ChevronDown, Briefcase, FileText } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import CourseCard from '../components/course/CourseCard';
import CatalogEmpty from '../components/common/CatalogEmpty';
import { useNavigate } from 'react-router-dom';
import { isCatalogCourse, resolvePathSteps } from '../lib/lms';

export default function Home() {
  const { courses, coursesLoading, coursesError } = useCourses();
  const { learningPaths } = useLMS();
  // Path steps resolve through the same visibility rule as the storefront, so a
  // consolidated catalog (archived duplicates) cannot advertise dead steps.
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const live = courses.filter(isCatalogCourse);
  const featured = [...live].sort((a, b) => (b.students || 0) - (a.students || 0)).slice(0, 6);
  const visiblePaths = learningPaths
    .map((p) => ({ ...p, ...resolvePathSteps(p, live) }))
    .filter((p) => p.steps.length > 0)
    .slice(0, 4);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#0a1a4a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(14,165,233,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.1),transparent_50%)]" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-[100px]" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[12px] font-bold tracking-widest">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                SKILLS FOR A BETTER FUTURE
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              </div>

              <div className="space-y-3">
                <h1 className="font-display font-black text-[42px] md:text-[64px] leading-[0.9] tracking-tight">
                  <span className="block">WOLI DAN</span>
                  <span className="block text-gradient">TECH HUB</span>
                </h1>
                <div className="flex items-center gap-3 text-sm font-bold tracking-[0.2em] text-white/60">
                  <span>LEARN</span><span className="h-1 w-1 rounded-full bg-cyan-400" /><span>BUILD</span><span className="h-1 w-1 rounded-full bg-cyan-400" /><span>GROW</span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-[24px] md:text-[32px] font-bold leading-tight">
                  Learn Digital Skills. <br />
                  <span className="text-white/60">Build Your Future.</span>
                </h2>
                <p className="text-[16px] md:text-[18px] text-white/60 leading-relaxed max-w-[520px]">
                  Master practical digital skills, build real projects, create your professional portfolio and prepare yourself for opportunities in the digital economy.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/courses" className="btn-primary gap-2 text-[14px] !px-8 !py-4">
                  START LEARNING <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/cv-builder" className="btn-secondary gap-2 !px-8 !py-4">
                  <FileText className="h-4 w-4" /> CREATE YOUR PROFESSIONAL CV
                </Link>
                <Link to="/learning-paths" className="btn-secondary gap-2 !px-8 !py-4">
                  <Map className="h-4 w-4" /> CAREER PATHS
                </Link>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); if (heroSearch.trim()) navigate(`/search?q=${encodeURIComponent(heroSearch.trim())}`); }} className="relative max-w-[520px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input value={heroSearch} onChange={(e) => setHeroSearch(e.target.value)} placeholder="Search courses, lessons, career paths..." className="w-full h-[56px] rounded-full glass pl-13 pr-32 text-sm focus:outline-none focus:border-cyan-400/50" style={{ paddingLeft: '3.25rem' }} />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 h-[40px] px-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 font-bold text-xs">SEARCH</button>
              </form>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                {[
                  { k: '100+', v: 'Students' },
                  { k: '12+', v: 'Digital Skills' },
                  { k: 'Online', v: 'Learning' },
                  { k: 'Practical', v: 'Projects' },
                ].map(s => (
                  <div key={s.v} className="glass rounded-2xl p-4">
                    <div className="font-display font-black text-xl text-gradient">{s.k}</div>
                    <div className="text-[12px] text-white/60 font-semibold tracking-wide">{s.v}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2 text-[13px] text-white/50">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-[#061236] bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[11px] font-bold">{String.fromCharCode(64+i)}</div>
                  ))}
                </div>
                <span>Trusted by 100+ learners across Nigeria</span>
              </div>
            </div>

            {/* Visual */}
            <div className="relative lg:h-[640px] flex items-center justify-center">
              <div className="relative w-full max-w-[560px]">
                {/* Main card */}
                <div className="relative rounded-[32px] glass-strong p-3 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                  <div className="rounded-[24px] overflow-hidden bg-gradient-to-br from-[#0a1a4a] to-[#020a1f] border border-white/10">
                    {/* Mock laptop UI */}
                    <div className="h-12 flex items-center gap-2 px-5 border-b border-white/10">
                      <div className="flex gap-1.5"><span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-yellow-400" /><span className="h-3 w-3 rounded-full bg-green-400" /></div>
                      <div className="ml-4 h-6 flex-1 max-w-[200px] rounded-full bg-white/5" />
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="h-3 w-24 rounded-full bg-white/10" />
                          <div className="h-8 w-40 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600" />
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                          <Monitor className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { icon: 'Ps', color: 'from-blue-500 to-blue-700' },
                          { icon: 'Ai', color: 'from-orange-500 to-amber-600' },
                          { icon: 'Pr', color: 'from-purple-500 to-violet-600' },
                          { icon: 'Canva', color: 'from-cyan-400 to-blue-500' },
                          { icon: 'W', color: 'from-blue-600 to-blue-800' },
                          { icon: 'X', color: 'from-green-600 to-emerald-700' },
                        ].map((app, i) => (
                          <div key={i} className={`h-20 rounded-2xl bg-gradient-to-br ${app.color} p-[1px]`}>
                            <div className="h-full w-full rounded-[15px] bg-[#0a1a4a] flex items-center justify-center font-black text-sm">{app.icon}</div>
                          </div>
                        ))}
                      </div>
                      <div className="h-24 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-4">
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600" />
                          <div className="space-y-2 flex-1">
                            <div className="h-2.5 w-full rounded-full bg-white/10" />
                            <div className="h-2.5 w-3/4 rounded-full bg-white/10" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating badges */}
                  <div className="absolute -left-6 top-20 glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl animate-[float_6s_ease-in-out_infinite]">
                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-green-400" /></div>
                    <div><div className="text-[12px] font-bold">Certificate</div><div className="text-[11px] text-white/50">Of Completion</div></div>
                  </div>

                  <div className="absolute -right-6 bottom-24 glass-strong rounded-2xl px-4 py-3 shadow-xl animate-[float_6s_ease-in-out_infinite_1s]">
                    <div className="flex items-center gap-2 text-[12px] font-bold"><div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" /> Live Class</div>
                    <div className="mt-2 flex gap-1.5">
                      <div className="h-1.5 w-12 rounded-full bg-cyan-400" />
                      <div className="h-1.5 w-8 rounded-full bg-white/20" />
                    </div>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="mt-6 mx-auto w-fit flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-[#061236] to-[#0a1a4a] border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                  <div className="h-10 w-10 rounded-full bg-[#25D366] flex items-center justify-center"><MessageCircle className="h-5 w-5 text-white" /></div>
                  <div><div className="text-[11px] tracking-widest text-white/60 font-bold">WHATSAPP</div><div className="font-black text-[18px] leading-none">08159610509</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Features */}
      <section className="relative border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: GraduationCap, title: 'Practical Training', desc: 'Learn by doing real projects' },
              { icon: Monitor, title: 'Hands-on Projects', desc: 'Build portfolio as you learn' },
              { icon: Users, title: 'Expert Guidance', desc: 'Mentorship from pros' },
              { icon: Award, title: 'Certificate', desc: 'Of Completion included' },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center"><f.icon className="h-5 w-5 text-cyan-300" /></div>
                <div><div className="font-bold text-sm">{f.title}</div><div className="text-[12px] text-white/50">{f.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="relative py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-bold tracking-widest text-cyan-300">ABOUT WOLI DAN TECH HUB</div>
              <h2 className="font-display font-bold text-[32px] md:text-[44px] leading-[0.95]">
                Empowering You With <span className="text-gradient">Digital Skills</span> That Pay
              </h2>
              <p className="text-white/60 leading-relaxed">
                WOLI DAN TECH HUB helps students, beginners, entrepreneurs, creatives and aspiring professionals develop practical digital skills that create real opportunities.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-5">
                  <div className="text-[11px] tracking-widest font-bold text-cyan-300 mb-2">OUR MISSION</div>
                  <div className="font-medium leading-relaxed">To make quality digital skills training accessible, practical and affordable.</div>
                </div>
                <div className="glass rounded-2xl p-5">
                  <div className="text-[11px] tracking-widest font-bold text-cyan-300 mb-2">OUR VISION</div>
                  <div className="font-medium leading-relaxed">To empower people with digital skills they can use to create opportunities, build careers and grow businesses.</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['DESIGN','CODE','CREATE','INNOVATE'].map(t => (
                  <span key={t} className="px-4 py-2 rounded-full glass text-[12px] font-bold tracking-wide">{t}</span>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-[32px] glass-strong p-6 space-y-4">
                {[
                  { k: 'Learn', d: 'Structured, beginner-friendly lessons' },
                  { k: 'Build', d: 'Real projects for your portfolio' },
                  { k: 'Grow', d: 'Monetize skills & get opportunities' },
                ].map((s, i) => (
                  <div key={s.k} className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black">{i+1}</div>
                    <div><div className="font-bold">{s.k}</div><div className="text-sm text-white/60">{s.d}</div></div>
                  </div>
                ))}
                <div className="pt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="glass rounded-2xl p-4"><div className="font-black text-xl">₦5k</div><div className="text-[11px] text-white/50">Per Course</div></div>
                  <div className="glass rounded-2xl p-4"><div className="font-black text-xl">{live.length}+</div><div className="text-[11px] text-white/50">Courses</div></div>
                  <div className="glass rounded-2xl p-4"><div className="font-black text-xl">24/7</div><div className="text-[11px] text-white/50">Access</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-green-300 mb-3"><Map className="h-4 w-4" /> CAREER ROADMAPS</div>
              <h2 className="font-display font-bold text-[32px] md:text-[40px] leading-none">Follow a <span className="text-gradient">Learning Path</span></h2>
              <p className="mt-3 text-white/60 max-w-[520px]">Don't learn randomly. Follow structured paths from Beginner → Advanced and build a career step by step.</p>
            </div>
            <Link to="/learning-paths" className="btn-secondary gap-2">ALL PATHS <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visiblePaths.map((p) => (
              <Link key={p.id} to="/learning-paths" className="glass rounded-[24px] p-6 hover:border-green-400/40 transition group">
                <div className="text-5xl">{p.icon}</div>
                <h3 className="font-bold text-lg mt-3 group-hover:text-green-300">{p.title}</h3>
                <p className="text-sm text-white/50 mt-1.5 leading-relaxed line-clamp-2">{p.desc}</p>
                <div className="text-xs text-green-300 font-bold mt-3">
                  {p.steps.length} course{p.steps.length === 1 ? '' : 's'} • {p.level}
                  {p.hidden > 0 && <span className="text-white/30 ml-1">({p.hidden} unavailable)</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DanTECH AI */}
      <section className="py-10">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-violet-600/20 via-purple-600/15 to-indigo-600/20 border border-purple-500/25 p-8 md:p-12">
            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-purple-500/25 blur-[100px]" />
            <div className="relative grid md:grid-cols-[1fr_1fr] gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-[11px] font-bold text-purple-200 tracking-widest"><Bot className="h-4 w-4" /> AI LEARNING ASSISTANT</div>
                <h2 className="font-display font-bold text-[32px] md:text-[40px] leading-tight">Meet <span className="text-gradient">DanTECH AI</span> 🤖</h2>
                <p className="text-white/60 leading-relaxed">Your personal AI tutor built into every lesson. Ask questions, get examples, test yourself with quizzes and flashcards — 24/7, in simple language.</p>
                <div className="flex flex-wrap gap-2">
                  {['Explains lessons', 'Gives examples', 'Quizzes you', 'Code help', 'Study plans'].map((f) => (
                    <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-bold"><CheckCircle2 className="h-3.5 w-3.5 text-purple-300" /> {f}</span>
                  ))}
                </div>
                <Link to="/register" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 font-bold shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:scale-105 transition">TRY DANTECH AI FREE <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="glass-strong rounded-[24px] p-5 space-y-3 max-w-[420px] mx-auto w-full">
                <div className="flex justify-end"><div className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-sm">Explain video editing like I'm 10 🎬</div></div>
                <div className="flex justify-start"><div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-2.5 bg-white/[0.06] border border-white/10 text-sm"><span className="text-[10px] font-black text-purple-300">✨ DANTECH AI</span><br />Video editing is like arranging your favorite photos in a storybook — you cut the boring parts, keep the fun parts, and add music! 🎥</div></div>
                <div className="flex justify-end"><div className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-sm">Test me on this 📝</div></div>
                <div className="text-center text-[11px] text-white/30 pt-1">Available inside every lesson for enrolled students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-20 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-cyan-300 mb-3"><BookOpen className="h-4 w-4" /> POPULAR COURSES</div>
              <h2 className="font-display font-bold text-[32px] md:text-[40px] leading-none">Learn Skills That <span className="text-gradient">Make Money</span></h2>
              <p className="mt-3 text-white/60 max-w-[520px]">All courses are practical, project-based, and designed for the Nigerian market. Pay once, access forever.</p>
            </div>
            <Link to="/courses" className="btn-secondary gap-2">VIEW ALL COURSES <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {coursesLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
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
          ) : featured.length === 0 ? (
            <CatalogEmpty error={coursesError} />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(c => (
                <CourseCard key={c.id} course={c} onEnroll={(course) => navigate(`/course/${course.slug}`)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Career + Testimonials + FAQ */}
      <section className="py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8">
          <Link to="/career-hub" className="rounded-[32px] bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border border-cyan-500/25 p-8 md:p-10 hover:border-cyan-400/50 transition group">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-cyan-300 mb-3"><Briefcase className="h-4 w-4" /> WOLI DAN CAREER HUB</div>
            <h3 className="font-display font-bold text-[28px] leading-tight">From Learning → <span className="text-gradient">Earning</span></h3>
            <p className="text-white/60 mt-3 leading-relaxed">CV guides, portfolio advice, freelancing playbook and a showcase of real student projects. Skills pay when the world can see them.</p>
            <span className="inline-flex items-center gap-2 mt-5 font-bold text-cyan-300 group-hover:gap-3 transition-all">EXPLORE CAREER HUB <ArrowRight className="h-4 w-4" /></span>
          </Link>
          <div className="glass rounded-[32px] p-8 md:p-10">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-amber-300 mb-4"><Star className="h-4 w-4" /> STUDENT STORIES</div>
            <div className="space-y-4">
              {[
                { n: 'Adaeze O.', t: 'I went from zero to editing videos for clients in 6 weeks. The practical tasks made all the difference!', c: 'Video Editing' },
                { n: 'Ibrahim M.', t: 'DanTECH AI explains things better than most humans 😅. I ask questions anytime I get stuck.', c: 'AI & Python' },
                { n: 'Chioma E.', t: 'My certificate verified instantly and my portfolio got me my first design gig. Worth every naira!', c: 'Graphic Design' },
              ].map((t) => (
                <div key={t.n} className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                  <div className="text-amber-300 text-sm">★★★★★</div>
                  <p className="text-sm text-white/75 mt-1 leading-relaxed">"{t.t}"</p>
                  <div className="text-xs text-white/40 mt-2 font-bold">{t.n} • {t.c}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-16">
        <div className="mx-auto max-w-[860px] px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-[28px] md:text-[36px] text-center">Frequently Asked <span className="text-gradient">Questions</span></h2>
          <div className="mt-8 space-y-3">
            {[
              { q: 'How do I pay for a course?', a: 'Transfer the exact amount to our Moniepoint account (69852663361), upload your receipt on the enroll page, and get access once admin approves — usually within hours.' },
              { q: 'Do I get a certificate?', a: 'Yes! Complete all lessons, pass the quizzes and get your assignments approved to earn a verifiable certificate with a unique ID and QR code.' },
              { q: 'What is DanTECH AI?', a: 'DanTECH AI is your built-in AI learning assistant. It explains lessons, gives examples, quizzes you, and helps with code — available 24/7 inside every lesson.' },
              { q: 'I\'m a complete beginner. Can I cope?', a: 'Absolutely. Most courses start from zero, and learning paths guide you step by step from Beginner to Advanced.' },
              { q: 'Do courses expire?', a: 'No. You get lifetime access to every course you enroll in, including all future updates.' },
            ].map((f, i) => (
              <details key={i} className="glass rounded-2xl overflow-hidden group">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-bold text-sm list-none">{f.q}<ChevronDown className="h-4 w-4 text-cyan-300 group-open:rotate-180 transition shrink-0" /></summary>
                <p className="px-5 pb-5 text-sm text-white/60 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Community */}
      <section className="py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[32px] overflow-hidden glass-strong p-[1px]">
            <div className="rounded-[31px] bg-gradient-to-br from-[#0a1a4a] via-[#061236] to-[#020a1f] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-[400px] w-[400px] bg-gradient-to-br from-green-500/10 to-cyan-500/10 blur-[80px] rounded-full" />
              <div className="relative grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[11px] font-bold text-green-300 tracking-widest">COMMUNITY</div>
                  <h3 className="font-display font-bold text-[28px] md:text-[36px] leading-tight">Join Our <span className="text-gradient">WhatsApp Community</span></h3>
                  <p className="text-white/60 leading-relaxed max-w-[520px]">Connect with other learners, receive updates, learning resources and important announcements. Get support directly from Woli Dan Tech Hub.</p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a href="https://chat.whatsapp.com/Hj9hsrcYSXHDIPW6DnW73z" target="_blank" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#25D366] text-white font-bold shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:bg-[#20bd5a] transition">
                      <MessageCircle className="h-5 w-5" /> JOIN WHATSAPP GROUP
                    </a>
                    <a href="https://wa.me/2348159610509" target="_blank" className="btn-secondary">CHAT ON WHATSAPP</a>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { n: '100+', l: 'Members' },
                    { n: 'Daily', l: 'Tips' },
                    { n: '24/7', l: 'Support' },
                    { n: 'Free', l: 'Resources' },
                    { n: 'Live', l: 'Sessions' },
                    { n: 'Jobs', l: 'Updates' },
                  ].map(i => (
                    <div key={i.l} className="glass rounded-2xl p-4 text-center">
                      <div className="font-black text-lg">{i.n}</div>
                      <div className="text-[11px] text-white/50">{i.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 p-[1px]">
            <div className="rounded-[31px] bg-[#020a1f] p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-700/10" />
              <div className="relative space-y-6 max-w-[720px] mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[11px] font-bold tracking-widest"><Zap className="h-4 w-4 text-cyan-300" /> START TODAY</div>
                <h2 className="font-display font-black text-[32px] md:text-[48px] leading-[0.9]">Ready to Build <br /><span className="text-gradient">Your Digital Future?</span></h2>
                <p className="text-white/60 text-[18px]">Join 100+ students learning practical skills that create real income. No theory, just results.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/register" className="btn-primary !px-10 !py-4 text-[15px]">START LEARNING NOW</Link>
                  <Link to="/courses" className="btn-secondary !px-10 !py-4">BROWSE COURSES</Link>
                </div>
                <div className="flex items-center justify-center gap-6 pt-4 text-[13px] text-white/50">
                  <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> Online Learning</span>
                  <span className="flex items-center gap-1.5"><Award className="h-4 w-4" /> Certificate Included</span>
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> Community Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
