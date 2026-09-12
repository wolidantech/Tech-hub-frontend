import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, BadgeCheck, MapPin, Share2, ArrowLeft } from 'lucide-react';
import { fetchPublicPortfolio } from '../lib/store';
import SignedFile from '../components/common/SignedFile';
import { formatDate } from '../lib/utils';

export default function StudentPortfolio() {
  const { id } = useParams();
  const [data, setData] = useState(undefined); // undefined = loading

  useEffect(() => {
    let alive = true;
    fetchPublicPortfolio(id)
      .then((d) => { if (alive) setData(d || { found: false }); })
      .catch(() => { if (alive) setData({ found: false }); });
    return () => { alive = false; };
  }, [id]);

  if (data === undefined) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!data?.found) return <div className="p-20 text-center">Portfolio not found</div>;
  if (data.private) {
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

  const student = data.profile || {};
  const stats = data.stats || {};
  const certs = data.certificates || [];
  const projects = data.projects || [];
  const xp = stats.xp || 0;
  const level = Math.floor(xp / 200) + 1;

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
              <SignedFile bucket="avatars" path={student.avatar} fileType="image/jpeg" imgClassName="h-28 w-28 rounded-full object-cover mx-auto border-4 border-cyan-400/40" />
            ) : (
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-4xl mx-auto">{(student.fullName || '?').charAt(0)}</div>
            )}
            <h1 className="font-display font-black text-[32px] mt-4 flex items-center justify-center gap-2">{student.fullName} <BadgeCheck className="h-6 w-6 text-cyan-300" /></h1>
            <div className="text-cyan-300 font-bold text-sm mt-1">WOLI DAN TECH HUB Certified Student • Level {level} • {xp} XP</div>
            {student.bio && <p className="text-white/60 mt-3 max-w-[560px] mx-auto leading-relaxed">{student.bio}</p>}
            {(student.skills || []).length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {student.skills.map((s) => <span key={s} className="px-3 py-1.5 rounded-full glass text-xs font-bold">{s}</span>)}
              </div>
            )}
            <div className="flex justify-center gap-6 mt-6 text-center">
              <div><div className="font-black text-2xl">{stats.courses || 0}</div><div className="text-[11px] text-white/40 font-bold">COURSES</div></div>
              <div><div className="font-black text-2xl">{stats.certificates || 0}</div><div className="text-[11px] text-white/40 font-bold">CERTIFICATES</div></div>
              <div><div className="font-black text-2xl">{stats.projects || 0}</div><div className="text-[11px] text-white/40 font-bold">PROJECTS</div></div>
            </div>
          </div>
        </div>

        {certs.length > 0 && (
          <div className="mt-8">
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-yellow-400" /> Certificates</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {certs.map((c) => (
                <Link key={c.certificateId} to={`/certificate/${c.certificateId}`} className="glass rounded-2xl p-4 hover:border-yellow-400/40 transition">
                  <div className="font-bold text-sm">{c.courseName}</div>
                  <div className="text-xs text-white/40 mt-1 font-mono">{c.certificateId} • {formatDate(c.issueDate)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className="mt-8">
            <h2 className="font-bold text-xl mb-4">Projects</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((s) => (
                <div key={s.id} className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
                  {s.storagePath && String(s.fileType || '').startsWith('image/') && (
                    <SignedFile bucket="submissions" path={s.storagePath} fileType={s.fileType} fileName={s.fileName} kind="image" imgClassName="h-40 w-full object-cover" />
                  )}
                  <div className="p-4">
                    <div className="font-bold text-sm truncate">{s.assignmentTitle || s.fileName}</div>
                    <div className="text-xs text-white/40 mt-0.5">{s.courseName}</div>
                    {s.linkUrl && <a href={s.linkUrl} target="_blank" rel="noreferrer" className="text-xs text-cyan-300 font-bold mt-1 inline-block">View live ↗</a>}
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
