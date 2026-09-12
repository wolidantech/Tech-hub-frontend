import { useParams, Link } from 'react-router-dom';
import { Award, BadgeCheck, MapPin, Share2, ArrowLeft, Star } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import { getUsers } from '../lib/storage';
import { BADGES, computeGamification } from '../lib/gamify';
import { formatDate } from '../lib/utils';

export default function StudentPortfolio() {
  const { id } = useParams();
  const { getUserCertificates, getUserEnrollments, getCourseById, getProgress, progressMap, enrollments, courses } = useCourses();
  const { getUserSubmissions, quizAttempts, submissions, learningEvents } = useLMS();

  const student = getUsers().find((u) => u.id === id && u.role !== 'admin');
  if (!student) return <div className="p-20 text-center">Portfolio not found</div>;
  if (student.portfolioPublic === false) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="glass rounded-[24px] p-12 text-center max-w-[480px]">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="font-bold text-xl">Private Portfolio</h1>
          <p className="text-sm text-white/50 mt-2">This student has set their portfolio to private.</p>
          <Link to="/" className="inline-flex mt-6 btn-primary">GO HOME</Link>
        </div>
      </div>
    );
  }

  const certs = getUserCertificates(id).filter((c) => c.status !== 'revoked');
  const completed = getUserEnrollments(id)
    .map((e) => ({ e, course: getCourseById(e.courseId), p: getProgress(id, e.courseId) }))
    .filter((x) => x.course && x.p.progress === 100);
  const projects = getUserSubmissions(id).filter((s) => s.status === 'approved');
  const g = computeGamification({ userId: id, enrollments, progressMap, courses, quizAttempts, submissions, learningEvents });
  const myBadges = BADGES.filter((b) => g.badges.includes(b.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f]">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4" /> Home</Link>
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="px-4 py-2 rounded-full glass text-xs font-bold flex items-center gap-2"><Share2 className="h-3.5 w-3.5" /> SHARE PORTFOLIO</button>
        </div>

        <div className="glass-strong rounded-[28px] p-8 md:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />
          <div className="relative">
            {student.avatar ? (
              <img src={student.avatar} alt={student.fullName} className="h-28 w-28 rounded-full object-cover mx-auto border-4 border-cyan-400/40" />
            ) : (
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-4xl mx-auto">{student.fullName.charAt(0)}</div>
            )}
            <h1 className="font-display font-black text-[32px] mt-4 flex items-center justify-center gap-2">{student.fullName} <BadgeCheck className="h-6 w-6 text-cyan-300" /></h1>
            <div className="text-cyan-300 font-bold text-sm mt-1">WOLI DAN TECH HUB Certified Student • Level {g.level} • {g.xp} XP</div>
            {student.bio && <p className="text-white/60 mt-3 max-w-[560px] mx-auto leading-relaxed">{student.bio}</p>}
            {(student.skills || []).length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {student.skills.map((s) => <span key={s} className="px-3 py-1.5 rounded-full glass text-xs font-bold">{s}</span>)}
              </div>
            )}
            <div className="flex justify-center gap-6 mt-6 text-center">
              <div><div className="font-black text-2xl">{completed.length}</div><div className="text-[11px] text-white/40 font-bold">COURSES</div></div>
              <div><div className="font-black text-2xl">{certs.length}</div><div className="text-[11px] text-white/40 font-bold">CERTIFICATES</div></div>
              <div><div className="font-black text-2xl">{projects.length}</div><div className="text-[11px] text-white/40 font-bold">PROJECTS</div></div>
              <div><div className="font-black text-2xl">{myBadges.length}</div><div className="text-[11px] text-white/40 font-bold">BADGES</div></div>
            </div>
          </div>
        </div>

        {myBadges.length > 0 && (
          <div className="mt-8">
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><Star className="h-5 w-5 text-amber-300" /> Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {myBadges.map((b) => (
                <div key={b.id} className="glass rounded-2xl p-4 text-center">
                  <div className="text-4xl">{b.icon}</div>
                  <div className="font-bold text-sm mt-2">{b.name}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div className="mt-8">
            <h2 className="font-bold text-xl mb-4">Completed Courses</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {completed.map(({ course }) => (
                <Link key={course.id} to={`/course/${course.slug}`} className="glass rounded-2xl p-4 hover:border-cyan-400/40 transition">
                  <div className="font-bold text-sm">{course.title}</div>
                  <div className="text-xs text-white/40 mt-1">{course.category} • {course.level}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {student.showCertificates !== false && certs.length > 0 && (
          <div className="mt-8">
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-yellow-400" /> Certificates</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {certs.map((c) => (
                <Link key={c.id} to={`/certificate/${c.certificateId}`} className="glass rounded-2xl p-4 hover:border-yellow-400/40 transition">
                  <div className="font-bold text-sm">{c.courseName}</div>
                  <div className="text-xs text-white/40 mt-1 font-mono">{c.certificateId} • {formatDate(c.issueDate)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {student.showProjects !== false && projects.length > 0 && (
          <div className="mt-8">
            <h2 className="font-bold text-xl mb-4">Projects</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((s) => (
                <div key={s.id} className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
                  {s.fileType?.startsWith('image/') && <img src={s.fileData} alt={s.fileName} loading="lazy" className="h-40 w-full object-cover" />}
                  <div className="p-4">
                    <div className="font-bold text-sm truncate">{s.fileName}</div>
                    {s.score != null && <div className="text-xs text-amber-300 font-bold mt-1">⭐ Score: {s.score}</div>}
                    {s.feedback && <div className="text-xs text-white/50 mt-1 line-clamp-2">"{s.feedback}"</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 text-center text-xs text-white/30 flex items-center justify-center gap-1">
          <MapPin className="h-3 w-3" /> Verified student work • WOLI DAN TECH HUB • Learn • Build • Grow
        </div>
      </div>
    </div>
  );
}
