import { Link } from 'react-router-dom';
import { Briefcase, FileText, Rocket, Star, Users, ArrowRight, BadgeCheck } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import { getUsers } from '../lib/storage';

export default function CareerHub() {
  const { courses } = useCourses();
  const { submissions, assignments } = useLMS();
  const users = getUsers().filter((u) => u.role !== 'admin');

  // Public project showcase: approved submissions from students with public portfolios
  const showcase = submissions
    .filter((s) => s.status === 'approved')
    .filter((s) => users.find((u) => u.id === s.userId)?.portfolioPublic !== false)
    .slice(0, 6);

  const guides = [
    { icon: FileText, title: 'CV & Resume Guide', desc: 'Tech CV templates, what recruiters scan for, and how to present certificates + projects.', tag: 'Free Guide' },
    { icon: Star, title: 'Portfolio Advice', desc: 'Turn assignments into portfolio pieces. What to show, how to describe it, where to host.', tag: 'Free Guide' },
    { icon: Rocket, title: 'Freelancing Playbook', desc: 'Upwork, Fiverr & WhatsApp clients: pricing, proposals, delivery and getting paid.', tag: 'Free Guide' },
    { icon: Users, title: 'Personal Branding', desc: 'LinkedIn + X + WhatsApp: post your learning journey and attract opportunities.', tag: 'Free Guide' },
  ];

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/[0.06] bg-gradient-to-br from-[#061236] to-[#020a1f]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[11px] font-bold tracking-widest"><Briefcase className="h-4 w-4 text-cyan-300" /> FROM LEARNING → EARNING</div>
          <h1 className="font-display font-black text-[36px] md:text-[52px] leading-none mt-4">WOLI DAN CAREER HUB</h1>
          <p className="mt-3 text-white/60 max-w-[620px] mx-auto">Skills pay the bills only when the world can see them. Build your portfolio, brand, and income systems here.</p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <Link to="/courses" className="btn-primary !py-3">BUILD SKILLS FIRST</Link>
            <Link to="/learning-paths" className="btn-secondary !py-3">VIEW LEARNING PATHS</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {guides.map((g) => (
            <div key={g.title} className="glass rounded-[24px] p-6 hover:border-cyan-400/30 transition">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-4"><g.icon className="h-6 w-6" /></div>
              <div className="text-[10px] font-black tracking-widest text-cyan-300">{g.tag.toUpperCase()}</div>
              <h3 className="font-bold text-lg mt-1">{g.title}</h3>
              <p className="text-sm text-white/60 mt-2 leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-[24px] p-6 md:p-8">
          <h2 className="font-bold text-xl flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-green-400" /> Student Project Showcase</h2>
          <p className="text-sm text-white/50 mt-1">Real work by WOLI DAN TECH HUB students. Your approved projects can appear here too.</p>
          {showcase.length === 0 ? (
            <div className="mt-6 text-center py-10 text-white/40 text-sm">
              No public projects yet — complete assignments and enable your public portfolio in Profile Settings.
              <div className="mt-4"><Link to="/courses" className="inline-flex btn-primary !py-2.5">START A COURSE</Link></div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {showcase.map((s) => {
                const owner = users.find((u) => u.id === s.userId);
                const asg = assignments.find((a) => a.id === s.assignmentId);
                const course = courses.find((c) => c.id === s.courseId);
                return (
                  <div key={s.id} className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
                    {s.fileType?.startsWith('image/') && <img src={s.fileData} alt={s.fileName} loading="lazy" className="h-40 w-full object-cover" />}
                    <div className="p-4">
                      <div className="font-bold text-sm">{asg?.title || s.fileName}</div>
                      <div className="text-xs text-white/50 mt-1">by {owner?.fullName} • {course?.title}</div>
                      {s.score != null && <div className="text-xs text-amber-300 font-bold mt-1">⭐ Score: {s.score}</div>}
                      <Link to={`/student/${s.userId}`} className="inline-flex mt-2 text-xs font-bold text-cyan-300">View portfolio <ArrowRight className="h-3 w-3 ml-1" /></Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[24px] bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border border-cyan-500/25 p-8 text-center">
          <h2 className="font-black text-2xl">Your Career Path</h2>
          <p className="text-white/60 mt-2">LEARNING → PRACTICING → BUILDING → CERTIFICATION → PORTFOLIO → CAREER</p>
          <div className="mt-5 flex gap-3 justify-center flex-wrap">
            <Link to="/register" className="btn-primary !py-3">START LEARNING TODAY</Link>
            <a href="https://wa.me/2348159610509" target="_blank" className="btn-secondary !py-3">TALK TO A MENTOR</a>
          </div>
        </div>
      </div>
    </div>
  );
}
