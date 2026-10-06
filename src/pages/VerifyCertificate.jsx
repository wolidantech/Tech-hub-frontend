import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BadgeCheck, Search, ShieldAlert } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { formatDate } from '../lib/utils';

// Public certificate verifier. The holder's FULL name is returned by design
// (owner-requested): certificate IDs carry a random suffix and verification
// codes are separate random values, so they are safe public references.
export default function VerifyCertificate() {
  const { verifyCertificate } = useCourses();
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(searchParams.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const check = async (value) => {
    const code = String(value ?? '').trim();
    if (!code) return;
    setLoading(true); setResult(null); setSearched(true);
    try { setResult(await verifyCertificate(code)); }
    catch { setResult({ found: false }); }
    finally { setLoading(false); }
  };

  // Support deep-link: /verify-certificate?code=WDTH-XXXX (QR codes use this)
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) check(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revoked = result?.found && result.status === 'revoked';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-10 sm:py-14 px-4">
      <div className="mx-auto max-w-[680px]">
        <div className="text-center mb-8">
          <div className="h-16 w-16 mx-auto rounded-full border-2 border-[#c9a227] bg-[#061236] flex items-center justify-center mb-4">
            <BadgeCheck className="h-8 w-8 text-[#e9cf8b]" />
          </div>
          <h1 className="font-display font-black text-[28px] sm:text-[34px] leading-tight">Verify a Certificate</h1>
          <p className="mt-2 text-white/60 text-sm sm:text-base">Enter a certificate ID or verification code to confirm its authenticity.</p>
        </div>

        <form className="flex flex-col sm:flex-row gap-3 mb-8" onSubmit={e => { e.preventDefault(); check(input); if (input.trim()) setSearchParams({ code: input.trim() }); }}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. WDTH-2026-ABC123 or WDTH-ABCD-1234" type="search" autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search" className="h-12 w-full rounded-full glass pl-11 pr-4 text-base sm:text-sm placeholder:text-white/40 focus:outline-none focus:border-[#c9a227]/60" />
          </div>
          <button type="submit" disabled={loading || !input.trim()} className="h-12 px-6 rounded-full bg-[#c9a227] text-[#0a1a4a] font-bold text-sm disabled:opacity-50 hover:bg-[#e9cf8b] transition">
            {loading ? 'Checking…' : 'Verify Certificate'}
          </button>
        </form>

        {loading && (
          <div className="glass rounded-[24px] p-10 text-center">
            <div className="h-10 w-10 mx-auto rounded-full border-2 border-white/10 border-t-[#c9a227] animate-spin mb-3" />
            <p className="text-sm text-white/60">Checking certificate…</p>
          </div>
        )}

        {!loading && searched && result && (
          <div className={`glass rounded-[24px] border-2 p-8 ${revoked ? 'border-red-500/40' : result.found ? 'border-[#c9a227]/50' : 'border-red-500/30'}`}>
            {!result.found ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">❌</div>
                <h2 className="font-display font-bold text-xl text-red-400 mb-2">Certificate Not Found</h2>
                <p className="text-sm text-white/60">No certificate matches that ID or code. Check for typos and try again.</p>
              </div>
            ) : revoked ? (
              <div className="text-center py-4">
                <ShieldAlert className="h-12 w-12 mx-auto text-red-400 mb-4" />
                <h2 className="font-display font-bold text-xl text-red-400 mb-2">Certificate Revoked</h2>
                <p className="text-sm text-white/60 mb-6">This certificate has been revoked by Woli Dan Tech Hub and is no longer valid.</p>
                <div className="text-left glass rounded-2xl p-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-white/40 shrink-0">Certificate ID</span><span className="font-mono font-bold text-right">{result.certificateId}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-white/40 shrink-0">Course</span><span className="font-bold text-right">{result.courseName}</span></div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <div className="h-16 w-16 mx-auto rounded-full bg-[#c9a227] flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(201,162,39,0.4)]">
                    <BadgeCheck className="h-9 w-9 text-[#0a1a4a]" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-[#e9cf8b]">Valid Certificate</h2>
                  <p className="text-xs text-white/50 mt-1">Authentic WOLI DAN TECH HUB certificate</p>
                </div>
                <div className="divide-y divide-white/[0.08] rounded-2xl border border-white/[0.08] px-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-3 text-sm"><span className="text-white/40 shrink-0">Awarded To</span><span className="cert-serif font-bold text-base text-right">{result.studentName}</span></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-3 text-sm"><span className="text-white/40 shrink-0">Course</span><span className="font-bold text-right">{result.courseName}</span></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-3 text-sm"><span className="text-white/40 shrink-0">Date of Issue</span><span className="font-bold text-right">{formatDate(result.issueDate)}</span></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-3 text-sm"><span className="text-white/40 shrink-0">Certificate ID</span><span className="font-mono text-[13px] font-bold text-cyan-300 text-right break-all">{result.certificateId}</span></div>
                  {result.verificationCode && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-3 text-sm"><span className="text-white/40 shrink-0">Verification Code</span><span className="font-mono text-[13px] font-bold text-[#e9cf8b] text-right break-all">{result.verificationCode}</span></div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-3 text-sm"><span className="text-white/40 shrink-0">Issued By</span><span className="font-bold text-right">{result.issuedBy || 'WOLI DAN TECH HUB'}</span></div>
                </div>
                <p className="mt-5 text-center text-xs text-white/40">
                  Signed by Olowoake Daniel Ayomide, Director, Woli Dan Tech Hub.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 glass rounded-[20px] p-5 text-center">
          <p className="text-xs text-white/50">Looking for your own certificates? Find them anytime under <span className="text-[#e9cf8b] font-semibold">My Certificates</span> in your dashboard.</p>
        </div>
      </div>
    </div>
  );
}
