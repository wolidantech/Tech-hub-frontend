import { useState } from 'react';
import { Search, CheckCircle2, XCircle, Award, Calendar, User, BookOpen, ShieldAlert } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function VerifyCertificate() {
  const [id, setId] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const { verifyCertificate } = useCourses();

  const handleVerify = (e) => {
    e.preventDefault();
    const found = verifyCertificate(id.trim());
    setResult(found || null);
    setSearched(true);
  };

  // Privacy: show first name + last initial only on public verification
  const maskedName = (name = '') => {
    const parts = name.trim().split(/\s+/);
    if (!parts[0]) return 'Student';
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-16">
      <div className="mx-auto max-w-[640px] px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[11px] font-bold tracking-widest"><Award className="h-4 w-4 text-cyan-300" /> CERTIFICATE VERIFICATION</div>
          <h1 className="font-display font-black text-[36px] leading-none">Verify Certificate</h1>
          <p className="text-white/60">Enter a Certificate ID or Verification Code to verify authenticity. Employers and institutions can use this tool.</p>
        </div>

        <div className="glass-strong rounded-[24px] p-8 space-y-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Certificate ID or Verification Code (e.g. WDTH-2026-ABC123)" className="w-full h-[56px] rounded-full glass pl-12 pr-4 font-mono text-sm placeholder:font-sans placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition" required />
            </div>
            <button type="submit" className="w-full btn-primary !py-4">VERIFY CERTIFICATE</button>
          </form>

          {searched && (
            <div className="pt-6 border-t border-white/10">
              {result ? (
                result.status === 'revoked' ? (
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto"><ShieldAlert className="h-8 w-8 text-red-400" /></div>
                    <div><div className="font-bold text-lg text-red-300">Certificate Revoked 🚫</div><div className="text-sm text-white/50 mt-1">This certificate is no longer valid.</div></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-green-300 font-bold"><CheckCircle2 className="h-6 w-6" /> VALID CERTIFICATE ✅</div>
                    <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-6 space-y-4">
                      <div className="flex justify-between text-sm"><span className="text-white/50">Student Name</span><span className="font-bold flex items-center gap-1"><User className="h-4 w-4" /> {maskedName(result.studentName)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-white/50">Course</span><span className="font-bold flex items-center gap-1"><BookOpen className="h-4 w-4" /> {result.courseName}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-white/50">Date Completed</span><span className="font-bold flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(result.issueDate)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-white/50">Certificate ID</span><span className="font-mono font-bold text-cyan-300">{result.certificateId}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-white/50">Issued By</span><span className="font-bold">WOLI DAN TECH HUB</span></div>
                    </div>
                    <div className="text-center">
                      <Link to={`/certificate/${result.certificateId}`} className="inline-flex px-6 py-3 rounded-full bg-white text-black font-bold text-sm">VIEW FULL CERTIFICATE</Link>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto"><XCircle className="h-8 w-8 text-red-400" /></div>
                  <div><div className="font-bold text-lg">Certificate Not Found ❌</div><div className="text-sm text-white/50 mt-1">No certificate matches: <span className="font-mono text-white">{id}</span></div></div>
                  <div className="text-xs text-white/30">Please check the ID and try again. Contact support if issue persists.</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 glass rounded-2xl p-6 text-sm text-white/50 leading-relaxed">
          <div className="font-bold text-white mb-2">How verification works:</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Every certificate has a unique Certificate ID and Verification Code</li>
            <li>Enter either one above to confirm authenticity</li>
            <li>Valid certificates show student name, course, and completion date</li>
            <li>Only limited public details are shown to protect student privacy</li>
            <li>Contact us on WhatsApp 08159610509 for manual verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
