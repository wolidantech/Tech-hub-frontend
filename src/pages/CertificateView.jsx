import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ImageDown, Loader2, Printer, Share2, BadgeCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { captureCertificatePng, certificateFileName, saveOrShareImage } from '../lib/certImage';
import { copyText, formatDate } from '../lib/utils';

// The sheet is designed as a fixed A4-landscape canvas (96dpi) and scaled to
// fit its container, so proportions never break from 360px phones to desktop
// and print output is always exactly one full-bleed landscape page.
const CERT_W = 1120;
const CERT_H = 792;

const GOLD = '#c9a227';
const GOLD_LIGHT = '#e9cf8b';
const GOLD_PALE = '#f5e2a2';

// Button copy for the PNG action. "Failed, try Print" deliberately points at the
// flow that always works, so the button never leaves a student at a dead end.
const IMAGE_LABELS = {
  idle: 'Download Image (PNG)',
  working: 'Downloading…',
  saved: 'Saved ✓',
  failed: 'Failed, try Print',
};

/* ---------------------------------------------------------------- ornaments
   All artwork is inline SVG — no external images, nothing hotlinked. */

// Corner flourish for the double ornamental frame (drawn top-left, rotated).
function CornerFlourish({ className = '', style }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={className} style={style}>
      <path d="M6 6H70M6 6V70" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 16H60M16 16V60" stroke={GOLD} strokeWidth="1" opacity=".65" />
      <path d="M70 6C48 12 12 48 6 70" stroke={GOLD} strokeWidth="1" opacity=".4" />
      <circle cx="16" cy="16" r="3.2" fill={GOLD} />
      <path d="M6 96V104M2 100H10" stroke={GOLD_LIGHT} strokeWidth="1" opacity=".5" />
    </svg>
  );
}

// Gold ribbon/award seal with star.
function AwardSeal({ className = '' }) {
  return (
    <svg viewBox="0 0 150 185" fill="none" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id="seal-gold" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={GOLD_PALE} />
          <stop offset="55%" stopColor={GOLD} />
          <stop offset="100%" stopColor="#8a6d1d" />
        </radialGradient>
        <linearGradient id="ribbon-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD} />
          <stop offset="100%" stopColor="#8a6d1d" />
        </linearGradient>
      </defs>
      {/* ribbon tails */}
      <path d="M52 118 L34 176 L58 158 L70 180 L78 126 Z" fill="url(#ribbon-gold)" />
      <path d="M98 118 L116 176 L92 158 L80 180 L72 126 Z" fill="url(#ribbon-gold)" opacity=".92" />
      {/* scalloped edge */}
      <circle cx="75" cy="75" r="63" fill="none" stroke={GOLD} strokeWidth="8" strokeDasharray="4.4 6" />
      <circle cx="75" cy="75" r="58" fill="url(#seal-gold)" />
      <circle cx="75" cy="75" r="46" fill="#0a1a4a" />
      <circle cx="75" cy="75" r="42" fill="none" stroke={GOLD_LIGHT} strokeWidth="1" opacity=".8" />
      <circle cx="75" cy="75" r="38.5" fill="none" stroke={GOLD} strokeWidth="0.75" opacity=".5" />
      <path transform="translate(57 52) scale(1.5)" fill={GOLD_PALE}
        d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z" />
      <text x="75" y="105" textAnchor="middle" fill={GOLD_LIGHT} fontSize="8" letterSpacing="2.5" fontFamily="Georgia, serif">WOLI DAN</text>
    </svg>
  );
}

// Brand monogram — the W mark from public/logo.svg redrawn in gold; used as
// the fallback when the real logo asset cannot load.
function Monogram({ className = '' }) {
  return (
    <svg viewBox="0 0 72 72" fill="none" aria-hidden="true" className={className}>
      <circle cx="36" cy="36" r="33" fill="#061236" stroke={GOLD} strokeWidth="2.5" />
      <circle cx="36" cy="36" r="28.5" fill="none" stroke={GOLD_LIGHT} strokeWidth="1" opacity=".55" />
      <g transform="translate(4 4)">
        <path d="m14 23 8 28 12-19 12 19 8-28" fill="none" stroke={GOLD_PALE} strokeWidth="6" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function GoldDivider({ className = '' }) {
  return (
    <svg viewBox="0 0 400 20" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="div-gold-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0" />
          <stop offset="100%" stopColor={GOLD} />
        </linearGradient>
        <linearGradient id="div-gold-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={GOLD} />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M10 10H178" stroke="url(#div-gold-l)" strokeWidth="1.5" />
      <path d="M222 10H390" stroke="url(#div-gold-r)" strokeWidth="1.5" />
      <path d="M200 2.5 208 10l-8 7.5L192 10Z" fill={GOLD} />
      <path d="M200 6 204.5 10 200 14 195.5 10Z" fill="#0a1a4a" />
    </svg>
  );
}

/* ------------------------------------------------------------------ sheet */

// `ref` points at the exact node the PNG is rendered from — the card itself, so
// no nav, action bar, Ask-AI widget or page background can ever bleed into it.
const CertificateSheet = forwardRef(function CertificateSheet({ cert, name, qrUrl }, ref) {
  const [logoBroken, setLogoBroken] = useState(false);
  const revoked = cert?.status === 'revoked';
  const longName = name.length > 24;
  const longCourse = (cert?.courseName || '').length > 40;
  return (
    <div
      ref={ref}
      className="cert-sheet relative overflow-hidden"
      style={{
        width: CERT_W, height: CERT_H,
        background: 'radial-gradient(120% 140% at 50% 0%, #10205e 0%, #0a1a4a 45%, #061236 100%)',
        boxShadow: '0 30px 80px rgba(2,10,31,0.65)',
        color: '#fff',
      }}
    >
      {/* subtle metallic sheen */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(115deg, transparent 25%, rgba(201,162,39,0.08) 45%, transparent 65%)' }} />

      {/* ornamental double frame + corner flourishes */}
      <div aria-hidden="true" className="absolute inset-[18px] border-2" style={{ borderColor: GOLD }} />
      <div aria-hidden="true" className="absolute inset-[27px] border" style={{ borderColor: 'rgba(201,162,39,0.55)' }} />
      <CornerFlourish className="absolute left-[10px] top-[10px] h-[110px] w-[110px]" />
      <CornerFlourish className="absolute right-[10px] top-[10px] h-[110px] w-[110px] rotate-90" />
      <CornerFlourish className="absolute right-[10px] bottom-[10px] h-[110px] w-[110px] rotate-180" />
      <CornerFlourish className="absolute left-[10px] bottom-[10px] h-[110px] w-[110px] -rotate-90" />

      {revoked && (
        <div className="cert-serif absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-red-400/80 px-10 py-2 text-6xl font-bold tracking-[0.35em] text-red-400/80">
          REVOKED
        </div>
      )}

      <div className="relative flex h-full flex-col items-center px-[88px] pb-[38px] pt-[44px] text-center">
        {/* masthead — the real brand asset from the repo (public/logo.svg),
            falling back to the gold-framed W monogram if it cannot load */}
        {logoBroken
          ? <Monogram className="h-[64px] w-[64px]" />
          : <img src="/logo.svg" alt="WOLI DAN TECH HUB" className="h-[54px] w-auto" onError={() => setLogoBroken(true)} />}
        <div className="mt-2 text-[9px] font-semibold tracking-[0.32em] text-white/40">LEARN • BUILD • GROW</div>

        <h1 className="cert-serif cert-gold-text mt-5 text-[58px] font-bold leading-none">Certificate</h1>
        <div className="mt-2 text-[13px] font-semibold tracking-[0.5em] text-white/75">OF ACHIEVEMENT</div>

        <div className="cert-serif mt-6 text-[14px] italic text-white/60">This certificate is proudly awarded to</div>
        <div className={`cert-serif mt-1 font-bold leading-[1.15] ${longName ? 'text-[40px]' : 'text-[52px]'}`}>{name}</div>
        <GoldDivider className="mt-2 h-[18px] w-[340px]" />

        <div className="mt-4 text-[11px] font-semibold tracking-[0.22em] text-white/50">
          IN RECOGNITION OF THE SUCCESSFUL COMPLETION OF
        </div>
        <div className={`font-display mt-1.5 font-bold leading-tight ${longCourse ? 'text-[24px]' : 'text-[30px]'}`}>
          <span className="cert-gold-text">{cert?.courseName || '—'}</span>
        </div>

        {/* date • seal • signature */}
        <div className="mt-auto grid w-full grid-cols-3 items-end pt-4">
          <div className="pb-2">
            <div className="text-[9px] font-bold tracking-[0.3em] text-white/45">DATE OF ISSUE</div>
            <div className="cert-serif mt-2 text-[19px] font-semibold">{formatDate(cert?.issueDate)}</div>
          </div>
          <div className="flex justify-center"><AwardSeal className="h-[128px] w-[104px]" /></div>
          <div className="pb-2">
            <div className="cert-script text-[24px] leading-none" style={{ color: GOLD_PALE }}>Olowoake Daniel Ayomide</div>
            <div className="mx-auto mt-2 h-px w-[220px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
            <div className="mt-2 text-[9px] font-bold tracking-[0.3em] text-white/45">DIRECTOR, WOLI DAN TECH HUB</div>
          </div>
        </div>

        {/* verification strip */}
        <div className="mt-6 flex w-full items-center justify-between gap-6 border px-6 py-3"
          style={{ borderColor: 'rgba(201,162,39,0.45)', background: 'rgba(6,18,54,0.72)' }}>
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.28em]" style={{ color: GOLD_LIGHT }}>
              <BadgeCheck className="h-3.5 w-3.5" /> VERIFIED CERTIFICATE
            </div>
            <div className="mt-2 space-y-1 font-mono text-[11px] text-white/75">
              <div><span className="text-white/40">CERTIFICATE ID&nbsp;&nbsp;</span>{cert?.certificateId}</div>
              <div><span className="text-white/40">VERIFICATION CODE&nbsp;&nbsp;</span><span style={{ color: GOLD_LIGHT }}>{cert?.verificationCode || cert?.certificateId}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Scan to verify<br />authenticity
            </div>
            <div className="rounded-md bg-white p-1.5">
              {qrUrl ? <img src={qrUrl} alt="Certificate verification QR code" className="h-[76px] w-[76px]" /> : <div className="h-[76px] w-[76px]" />}
            </div>
          </div>
        </div>

        <div className="mt-3 text-[9px] font-bold tracking-[0.3em]" style={{ color: 'rgba(201,162,39,0.85)' }}>
          DIGITAL SKILLS • BETTER OPPORTUNITIES • REAL INCOME
        </div>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------- page */

export default function CertificateView() {
  const { id: certificateId } = useParams();
  const { user } = useAuth();
  const { verifyCertificate } = useCourses();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const fitRef = useRef(null);
  const [scale, setScale] = useState(1);
  // PNG export: the sheet node is the only thing handed to the renderer.
  const certRef = useRef(null);
  const [imageState, setImageState] = useState('idle'); // idle | working | saved | failed
  const imageHintTimer = useRef(null);

  useEffect(() => () => clearTimeout(imageHintTimer.current), []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    (async () => {
      setLoading(true); setError('');
      try {
        const res = await verifyCertificate(certificateId);
        if (!res?.found) { setError('Certificate not found. Check the certificate ID or verification code and try again.'); }
        else setCert(res);
      } catch (e) { setError(e?.message || 'Failed to load certificate. Please try again.'); }
      finally { setLoading(false); }
    })();
  }, [certificateId, verifyCertificate]);

  // The verification code is always present after migration 010; legacy rows
  // fall back to the certificate ID, which the verifier also accepts.
  const verifyCode = cert?.verificationCode || cert?.certificateId || '';
  const verifyUrl = useMemo(
    () => (typeof window === 'undefined' || !verifyCode) ? '' : `${window.location.origin}/verify-certificate?code=${encodeURIComponent(verifyCode)}`,
    [verifyCode],
  );

  useEffect(() => {
    let active = true;
    if (!verifyUrl) return;
    QRCode.toDataURL(verifyUrl, { width: 304, margin: 1, color: { dark: '#0a1a4a', light: '#ffffff' } })
      .then(u => { if (active) setQrUrl(u); })
      .catch(() => {});
    return () => { active = false; };
  }, [verifyUrl]);

  // Fit the fixed-size sheet into its container without ever overflowing.
  useEffect(() => {
    const el = fitRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / CERT_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [loading]);

  const name = cert?.studentName || user?.fullName || 'Student';
  const revoked = cert?.status === 'revoked';

  const share = async () => {
    const text = `My WOLI DAN TECH HUB Certificate — ${cert?.courseName || ''} — verify: ${verifyUrl}`;
    try {
      if (navigator.share) await navigator.share({ title: 'My WOLI DAN TECH HUB Certificate', text, url: verifyUrl });
      else if (await copyText(`${text}\n${window.location.href}`)) { setCopied(true); setTimeout(() => setCopied(false), 2200); }
    } catch { /* user dismissed share sheet */ }
  };

  // Save the certificate as a PNG. Phones get the share sheet, which is where
  // "Save to Photos" / WhatsApp live; everywhere else falls back to a download.
  // Print / Download PDF stays untouched as the fallback if a browser refuses
  // to rasterise the card at all.
  const downloadImage = async () => {
    if (imageState === 'working') return;
    clearTimeout(imageHintTimer.current);
    setImageState('working');
    let next = 'failed';
    try {
      const shot = await captureCertificatePng(certRef.current);
      const saved = await saveOrShareImage({
        ...shot,
        fileName: certificateFileName(cert?.certificateId),
        title: 'My WOLI DAN TECH HUB Certificate',
        text: `My WOLI DAN TECH HUB Certificate — ${cert?.courseName || ''} — verify: ${verifyUrl}`,
      });
      if (saved === 'dismissed') { setImageState('idle'); return; } // sheet was closed, not an error
      next = saved === 'failed' ? 'failed' : 'saved';
    } catch { next = 'failed'; }
    setImageState(next);
    if (next === 'saved') imageHintTimer.current = setTimeout(() => setImageState('idle'), 2400);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] flex items-center justify-center py-16">
      <div className="glass rounded-[24px] px-10 py-8 text-center">
        <div className="h-12 w-12 mx-auto rounded-full border-2 border-white/10 border-t-[#c9a227] animate-spin mb-4" />
        <p className="text-sm text-white/60">Loading certificate…</p>
      </div>
    </div>
  );

  if (error || !cert) return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] flex items-center justify-center py-16 px-4">
      <div className="glass rounded-[24px] p-10 text-center max-w-md w-full">
        <div className="text-4xl mb-4">🎓</div>
        <h1 className="font-display font-bold text-xl mb-2">Certificate not found</h1>
        <p className="text-sm text-white/60">{error}</p>
        <Link to="/verify-certificate" className="btn-primary mt-6">Try Again</Link>
      </div>
    </div>
  );

  return (
    <div className="cert-page min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-8 sm:py-10">
      <div className="mx-auto max-w-[1200px] px-3 sm:px-6">

        {/* screen-only action bar */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => window.history.back()} className="h-11 px-4 rounded-full glass flex items-center gap-2 text-sm font-bold hover:bg-white/10 transition">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="h-11 px-5 rounded-full glass flex items-center gap-2 text-sm font-bold hover:bg-white/10 transition">
              <Printer className="h-4 w-4" /> Print / Download PDF
            </button>
            <button
              onClick={downloadImage}
              disabled={imageState === 'working'}
              title="Save a PNG picture of the certificate — phones offer “Save to Photos”"
              className="h-11 px-5 rounded-full glass flex items-center gap-2 text-sm font-bold hover:bg-white/10 transition disabled:opacity-60"
            >
              {imageState === 'working'
                ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                : <ImageDown className="h-4 w-4" aria-hidden="true" />}
              <span role="status" aria-live="polite">{IMAGE_LABELS[imageState]}</span>
            </button>
            <button onClick={share} className="h-11 px-5 rounded-full bg-[#c9a227] text-[#0a1a4a] flex items-center gap-2 text-sm font-bold hover:bg-[#e9cf8b] transition">
              <Share2 className="h-4 w-4" /> {copied ? 'Link Copied ✓' : 'Share'}
            </button>
          </div>
        </div>

        {revoked && (
          <div className="no-print mb-6 rounded-[20px] border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-300">
            This certificate has been revoked and is no longer valid.
          </div>
        )}

        {/* scaled certificate sheet */}
        <div ref={fitRef} className="cert-fit-wrap w-full" style={{ height: CERT_H * scale }}>
          <div className="cert-scaler" style={{ width: CERT_W, height: CERT_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <CertificateSheet ref={certRef} cert={cert} name={name} qrUrl={qrUrl} />
          </div>
        </div>

        {/* small-screen detail card so every field stays readable at 360px */}
        <div className="no-print mt-6 lg:hidden glass rounded-[20px] p-5 text-sm">
          <h2 className="font-display font-bold text-base mb-3">Certificate Details</h2>
          <dl className="space-y-2">
            <div className="flex justify-between gap-4"><dt className="text-white/40 shrink-0">Awarded to</dt><dd className="font-bold text-right">{name}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/40 shrink-0">Course</dt><dd className="font-bold text-right">{cert.courseName}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/40 shrink-0">Date of issue</dt><dd className="font-bold text-right">{formatDate(cert.issueDate)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/40 shrink-0">Certificate ID</dt><dd className="font-mono text-[13px] text-cyan-300 text-right break-all">{cert.certificateId}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/40 shrink-0">Verification code</dt><dd className="font-mono text-[13px] text-[#e9cf8b] text-right break-all">{verifyCode}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-white/50">Signed by Olowoake Daniel Ayomide, Director, Woli Dan Tech Hub.</p>
        </div>

        <p className="no-print mt-6 text-center text-xs text-white/40">
          Anyone can verify this certificate with the ID or verification code on the{' '}
          <Link to="/verify-certificate" className="text-[#e9cf8b] underline underline-offset-2">public verifier</Link>.
        </p>
      </div>
    </div>
  );
}
