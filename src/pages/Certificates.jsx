import { Link } from 'react-router-dom';
import { Award, Download, Eye, Calendar, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { formatDate } from '../lib/utils';
import { useState } from 'react';

export default function Certificates() {
  const { user } = useAuth();
  const { getUserCertificates, getCourseById } = useCourses();
  const [search, setSearch] = useState('');

  if (!user) return null;
  const certs = getUserCertificates(user.id).filter(c => !search || c.courseName.toLowerCase().includes(search.toLowerCase()) || c.certificateId.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-10">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display font-black text-[32px] leading-none flex items-center gap-3"><Award className="h-8 w-8 text-yellow-400" /> My Certificates</h1>
            <p className="mt-2 text-white/60">Your achievements and completed courses</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search certificates..." type="search" autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search" className="h-11 w-full sm:w-[280px] rounded-full glass pl-11 pr-4 text-base sm:text-sm placeholder:text-white/40 focus:outline-none" />
          </div>
        </div>

        {certs.length === 0 ? (
          <div className="glass rounded-[24px] p-16 text-center">
            <Award className="h-16 w-16 mx-auto text-white/10 mb-6" />
            <h3 className="font-bold text-xl">No certificates yet</h3>
            <p className="text-sm text-white/50 mt-2 max-w-[400px] mx-auto">Complete a course 100% to earn your professional certificate. Certificates are verifiable and shareable.</p>
            <Link to="/dashboard" className="inline-flex mt-6 btn-primary">GO TO DASHBOARD</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {certs.map(cert => {
              const course = getCourseById(cert.courseId);
              return (
                <div key={cert.id} className="group relative rounded-[24px] glass-strong p-[1px] hover:shadow-[0_0_40px_rgba(201,162,39,0.25)] transition-all">
                  <div className="rounded-[23px] bg-gradient-to-br from-[#0a1a4a] to-[#020a1f] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-[#c9a227]/15 to-transparent blur-[40px] rounded-full" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"><Award className="h-6 w-6 text-black" /></div>
                        <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-[11px] font-bold">VERIFIED</span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[11px] tracking-[0.2em] text-[#e9cf8b]/70 font-bold">WOLI DAN TECH HUB</div>
                        <div className="font-display font-black text-xl leading-tight">{cert.courseName}</div>
                        <div className="text-sm text-white/60">Certificate of Achievement</div>
                      </div>

                      <div className="mt-6 space-y-3 text-sm">
                        <div className="flex justify-between gap-3"><span className="text-white/40 shrink-0">Student</span><span className="font-bold text-right">{user.fullName}</span></div>
                        <div className="flex justify-between gap-3"><span className="text-white/40 shrink-0">Certificate ID</span><span className="font-mono font-bold text-cyan-300 text-right break-all">{cert.certificateId}</span></div>
                        {cert.verificationCode && (
                          <div className="flex justify-between gap-3"><span className="text-white/40 shrink-0">Verification Code</span><span className="font-mono font-bold text-[#e9cf8b] text-right break-all">{cert.verificationCode}</span></div>
                        )}
                        <div className="flex justify-between gap-3"><span className="text-white/40 shrink-0">Date</span><span className="font-bold flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(cert.issueDate)}</span></div>
                      </div>
                      <div className="mt-3 text-[11px] text-white/40">Signed by Olowoake Daniel Ayomide — Director, Woli Dan Tech Hub</div>

                      <div className="mt-6 grid grid-cols-2 gap-2">
                        <Link to={`/certificate/${cert.certificateId}`} className="h-11 rounded-full glass flex items-center justify-center gap-2 font-bold text-xs hover:bg-white/10 transition"><Eye className="h-4 w-4" /> VIEW</Link>
                        <Link to={`/certificate/${cert.certificateId}`} className="h-11 rounded-full bg-white text-black flex items-center justify-center gap-2 font-bold text-xs hover:bg-white/90 transition"><Download className="h-4 w-4" /> DOWNLOAD</Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
