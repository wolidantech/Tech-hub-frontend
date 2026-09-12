import { useParams, Link } from 'react-router-dom';
import { Award, Download, Verified, Calendar, User, BookOpen, ArrowLeft, Share2 } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/utils';
import { useRef } from 'react';

export default function CertificateView() {
  const { id } = useParams();
  const { verifyCertificate, getCourseById } = useCourses();
  const { user } = useAuth();
  const certRef = useRef(null);

  const cert = verifyCertificate(id);
  if (!cert) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="glass rounded-[24px] p-12 text-center max-w-[480px]">
          <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">❌</div>
          <h1 className="font-bold text-xl">Certificate Not Found</h1>
          <p className="text-sm text-white/50 mt-2">The certificate ID {id} does not exist or is invalid.</p>
          <Link to="/verify-certificate" className="inline-flex mt-6 btn-primary">VERIFY ANOTHER</Link>
        </div>
      </div>
    );
  }

  if (cert.status === 'revoked') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="glass rounded-[24px] p-12 text-center max-w-[480px] border border-red-500/30">
          <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">🚫</div>
          <h1 className="font-bold text-xl text-red-300">Certificate Revoked</h1>
          <p className="text-sm text-white/50 mt-2">This certificate ({cert.certificateId}) has been revoked by WOLI DAN TECH HUB and is no longer valid.</p>
          <Link to="/verify-certificate" className="inline-flex mt-6 btn-primary">VERIFY ANOTHER</Link>
        </div>
      </div>
    );
  }

  const course = getCourseById(cert.courseId);
  const studentName = cert.studentName || user?.fullName || 'Student';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-10">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8">
        <Link to="/certificates" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8"><ArrowLeft className="h-4 w-4" /> Back to Certificates</Link>

        <div className="flex flex-wrap gap-3 justify-end mb-6 print:hidden no-print">
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="px-5 py-2.5 rounded-full glass font-bold text-sm flex items-center gap-2"><Share2 className="h-4 w-4" /> Share</button>
          <button onClick={handlePrint} className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm flex items-center gap-2"><Download className="h-4 w-4" /> Download PDF</button>
        </div>
        <div className="text-xs text-white/40 mb-6 no-print">Tip: choose "Save as PDF" in the print dialog to download your certificate as a PDF.</div>

        <div id="certificate-print-area" ref={certRef} className="relative rounded-[32px] bg-white p-[2px] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <div className="rounded-[30px] bg-gradient-to-br from-[#020a1f] via-[#0a1a4a] to-[#020a1f] p-1">
            <div className="rounded-[28px] bg-white text-black p-8 md:p-12 relative overflow-hidden">
              {/* Decorative */}
              <div className="absolute top-0 left-0 h-40 w-40 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 blur-[40px] rounded-full" />
              <div className="absolute bottom-0 right-0 h-60 w-60 bg-gradient-to-br from-blue-600/20 to-violet-600/20 blur-[50px] rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] border border-cyan-500/10 rounded-full pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] border border-blue-500/10 rounded-full pointer-events-none" />

              <div className="relative text-center space-y-6">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-white text-2xl shadow-[0_0_30px_rgba(14,165,233,0.5)]">W</div>
                </div>

                <div>
                  <h2 className="font-display font-black text-2xl tracking-tight text-[#020a1f]">WOLI DAN TECH HUB</h2>
                  <div className="text-[11px] tracking-[0.3em] font-bold text-[#0a1a4a]/60 mt-1">LEARN • BUILD • GROW</div>
                </div>

                <div className="py-2">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0a1a4a] text-white text-[11px] font-bold tracking-widest"><Award className="h-4 w-4 text-yellow-400" /> CERTIFICATE OF COMPLETION</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-black/50 font-medium">This certificate is proudly presented to</div>
                  <div className="font-display font-black text-[32px] md:text-[42px] leading-none text-[#0a1a4a]">{studentName || cert.studentName || 'Student Name'}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-black/50">For successfully completing</div>
                  <div className="font-display font-black text-[20px] md:text-[26px] leading-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-700">{cert.courseName}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-y border-black/10 max-w-[600px] mx-auto text-left">
                  <div><div className="text-[11px] font-bold tracking-widest text-black/40">DATE COMPLETED</div><div className="font-bold flex items-center gap-1 mt-1"><Calendar className="h-4 w-4" /> {formatDate(cert.issueDate)}</div></div>
                  <div><div className="text-[11px] font-bold tracking-widest text-black/40">CERTIFICATE ID</div><div className="font-mono font-bold mt-1 text-cyan-700">{cert.certificateId}</div></div>
                  <div><div className="text-[11px] font-bold tracking-widest text-black/40">VERIFICATION CODE</div><div className="font-mono font-bold mt-1">{cert.verificationCode || '—'}</div></div>
                </div>
                <div className="text-xs text-black/50 -mt-2">Verify at <span className="font-bold">/verify-certificate</span> • Issued by {cert.issuedBy || 'WOLI DAN TECH HUB'}</div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-[600px] mx-auto pt-4">
                  <div className="text-left">
                    <div className="h-12 w-32 border-b border-black/20 flex items-end pb-1"><span className="font-display font-bold italic text-lg">Woli Dan</span></div>
                    <div className="text-[11px] font-bold tracking-widest text-black/40 mt-1">DIRECTOR, WOLI DAN TECH HUB</div>
                  </div>
                  <div className="text-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(`${window.location.origin}/verify-certificate?code=${cert.verificationCode || cert.certificateId}`)}`}
                      alt="Verification QR code"
                      width="110" height="110"
                      className="h-[110px] w-[110px] mx-auto rounded-lg border border-black/10"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="text-[10px] font-bold tracking-widest text-black/40 mt-1">SCAN TO VERIFY</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center"><Verified className="h-8 w-8 text-white" /></div>
                    <div className="text-left"><div className="font-bold text-sm flex items-center gap-1"><Verified className="h-4 w-4 text-green-600" /> Verified Certificate</div><div className="text-xs text-black/50">Verify at /verify-certificate</div></div>
                  </div>
                </div>

                <div className="pt-6 text-[11px] text-black/30">Digital Skills • Better Opportunities • Real Income • www.wolidantech.com</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 glass rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 print:hidden no-print">
          <div className="flex items-center gap-3 text-sm"><BookOpen className="h-5 w-5 text-cyan-300" /><span>Share your achievement on LinkedIn, WhatsApp, or with employers</span></div>
          <Link to="/verify-certificate" className="text-sm font-bold text-cyan-300 hover:text-cyan-200">Verify Certificate →</Link>
        </div>
      </div>
    </div>
  );
}
