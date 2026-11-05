import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ImageDown, Loader2, Printer, Share2, BadgeCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { captureCertificatePng, certificateFileName, saveOrShareImage } from '../lib/certImage';
import { copyText, formatDate } from '../lib/utils';
import { INSTITUTE_NAME } from '../lib/brand';

/* --------------------------------------------------------------------------
 * The sheet is a fixed A4-landscape canvas (96dpi) that the page scales to fit
 * its container, so proportions never break from 360px phones to desktop and
 * the print output is always exactly one full-bleed landscape page.
 *
 * Layout note: every element on the sheet is absolutely positioned on purpose.
 * A flex/grid flow would let one long student name or a long course title push
 * the signature block off the page during PNG export; fixed coordinates mean the
 * worst case is a shorter line, never a broken sheet.
 * ------------------------------------------------------------------------ */
const CERT_W = 1120;
const CERT_H = 792;
const BAND_TOP = 660;   // top of the navy verification band
const PAD = 56;         // content gutter, left and right

const INK = '#0b1130';
const NAVY = '#0a1a4a';
const GOLD = '#c9a227';
const GOLD_DEEP = '#9a7b20';
const GOLD_LIGHT = '#e9cf8b';
const GOLD_PALE = '#f5e2a2';
const MUTED = '#6b7280';
const BODY = '#3f4657';
const BRAND_BLUE = '#2b47d4';

// Button copy for the PNG action. "Failed, try Print" deliberately points at the
// flow that always works, so the button never leaves a student at a dead end.
const IMAGE_LABELS = {
  idle: 'Download Image (PNG)',
  working: 'Downloading…',
  saved: 'Saved ✓',
  failed: 'Failed, try Print',
};

/* ---------------------------------------------------------------- ornaments
   All artwork is inline SVG (or the repo's own logo asset) — nothing hotlinked,
   so the sheet renders identically on screen, in the PNG and in print. */

/** The gold bookmark ribbon that hangs over the top-right of the frame. */
function Ribbon() {
  return (
    <svg viewBox="0 0 40 180" width="40" height="180" aria-hidden="true"
      style={{ position: 'absolute', top: 0, left: CERT_W - 104, filter: 'drop-shadow(0 6px 10px rgba(11,17,48,0.18))' }}>
      <defs>
        <linearGradient id="cert-ribbon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GOLD_PALE} />
          <stop offset="42%" stopColor={GOLD} />
          <stop offset="100%" stopColor="#8a6d1d" />
        </linearGradient>
      </defs>
      <path d="M0 0h40v180l-20-26-20 26z" fill="url(#cert-ribbon)" />
      <path d="M0 0h40v180l-20-26-20 26z" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
      <path d="M6 0v150" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
    </svg>
  );
}

/** The institutional crest: double gold ring around the official D mark. */
function Crest({ className = '', style }) {
  return (
    <svg viewBox="0 0 160 160" width="160" height="160" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id="crest-ring" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD_PALE} />
          <stop offset="55%" stopColor={GOLD} />
          <stop offset="100%" stopColor="#8a6d1d" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="76" fill="none" stroke="url(#crest-ring)" strokeWidth="3" />
      <circle cx="80" cy="80" r="70" fill={NAVY} />
      <circle cx="80" cy="80" r="64" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.7" />
      <circle cx="80" cy="80" r="58" fill="none" stroke="rgba(233,207,139,0.35)" strokeWidth="6" strokeDasharray="1.5 5" />
      <image href="/mark.png" x="34" y="46" width="92" height="73" preserveAspectRatio="xMidYMid meet" />
      <text x="80" y="132" textAnchor="middle" fill={GOLD_LIGHT} fontSize="8.5" letterSpacing="2.4"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="700">DANQEL</text>
    </svg>
  );
}

/** The embossed award seal — the certificate's "official" mark. */
function AwardSeal({ style }) {
  return (
    <svg viewBox="0 0 150 150" width="150" height="150" style={style} aria-hidden="true">
      <defs>
        <radialGradient id="seal-face" cx="35%" cy="28%" r="82%">
          <stop offset="0%" stopColor={GOLD_PALE} />
          <stop offset="52%" stopColor={GOLD} />
          <stop offset="100%" stopColor="#856a1c" />
        </radialGradient>
        <path id="seal-arc-top" d="M75,75 m-56,0 a56,56 0 1,1 112,0" fill="none" />
        <path id="seal-arc-bottom" d="M75,75 m-49,0 a49,49 0 1,0 98,0" fill="none" />
      </defs>
      <circle cx="75" cy="75" r="73" fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.55" />
      <circle cx="75" cy="75" r="66" fill="url(#seal-face)" />
      <circle cx="75" cy="75" r="66" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      <circle cx="75" cy="75" r="56" fill="none" stroke={NAVY} strokeWidth="1" opacity="0.55" />
      <circle cx="75" cy="75" r="40" fill={NAVY} />
      <circle cx="75" cy="75" r="40" fill="none" stroke={GOLD_LIGHT} strokeWidth="1.2" />
      <text fontSize="7.2" fill={NAVY} fontWeight="700" letterSpacing="1.1"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">
        <textPath href="#seal-arc-top" startOffset="50%" textAnchor="middle">OFFICIAL · CERTIFIED</textPath>
      </text>
      <text fontSize="6.6" fill={NAVY} fontWeight="700" letterSpacing="1"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif">
        <textPath href="#seal-arc-bottom" startOffset="50%" textAnchor="middle">DANQEL DIGITAL INSTITUTE</textPath>
      </text>
      <text x="75" y="86" textAnchor="middle" fill={GOLD_PALE} fontSize="26" fontWeight="700" letterSpacing="1"
        fontFamily="'Space Grotesk', system-ui, sans-serif">D</text>
      <path d="M60 96h30" stroke={GOLD} strokeWidth="1" />
    </svg>
  );
}

/* ------------------------------------------------------------- signatures
   Deliberately NOT a printed name: the sheet carries a handwritten signature
   mark over the title line, exactly as the reference artwork does. The names
   are gone from the sheet entirely (a long name clipped in an exported PNG and
   read as unfinished), so the signatory is identified by role, not by text.

   The strokes are authored as pen points and smoothed with Catmull-Rom into
   cubic Béziers — a real drawn signature rather than a font, so it renders
   identically on every device and inside the exported PNG. */

// Pen points for the Head of Learning & Programs mark; `null` segments lift the
// pen. Kept as data so the flourish can be edited without touching SVG maths.
const HEAD_SIGNATURE = [
  [[26, 92], [32, 62], [44, 34], [58, 24], [70, 28], [70, 44], [58, 60], [44, 74], [56, 70], [80, 62], [104, 58], [128, 58]],
  [[122, 64], [114, 78], [124, 84], [140, 78], [152, 64], [160, 46], [168, 28], [176, 22], [172, 44], [160, 74], [150, 94], [152, 106], [166, 110], [182, 100]],
  [[196, 84], [204, 66], [212, 50], [222, 44], [228, 54], [230, 68], [240, 80]],
  [[258, 68], [280, 50], [304, 34], [330, 24], [352, 20], [366, 28]],
  [[150, 62], [182, 58]], // the cross-stroke through the tall letter
  [[48, 106], [112, 104], [182, 106], [252, 100], [318, 90], [370, 76], [396, 60]], // underline sweep
];

// A different hand for the Director: initials plus a shorter flourish, so the
// two lines are visibly two signatures rather than the same mark twice.
const DIRECTOR_SIGNATURE = [
  [[150, 96], [150, 70], [162, 44], [182, 32], [200, 36], [206, 58], [196, 82], [178, 96], [166, 100], [186, 92], [212, 78], [238, 68], [258, 64]],
  [[252, 96], [268, 60], [278, 36], [292, 40], [300, 72], [304, 96]],
  [[262, 78], [286, 74], [306, 74]], // crossbar
  [[168, 110], [224, 106], [286, 104], [330, 96], [356, 88]],
];

/** Catmull-Rom spline through `pts` as a smooth cubic-Bézier SVG path. */
function smoothPath(pts) {
  if (!pts || pts.length < 2) return '';
  const r = (n) => Math.round(n * 10) / 10;
  const p = [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < p.length - 2; i += 1) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${r(c1[0])} ${r(c1[1])}, ${r(c2[0])} ${r(c2[1])}, ${r(p2[0])} ${r(p2[1])}`;
  }
  return d;
}

/** A signature mark. Decorative only — the role beneath it identifies the signer. */
function Signature({ strokes, style, label }) {
  return (
    <svg viewBox="0 0 410 124" preserveAspectRatio="xMinYMid meet" style={style}
      role="img" aria-label={label} data-testid="certificate-signature">
      {strokes.map((stroke, i) => (
        <path
          key={i}
          d={smoothPath(stroke)}
          fill="none"
          stroke={GOLD_DEEP}
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ sheet */


/**
 * One line of label + value, as printed in the reference: the label is muted,
 * the value is bold ink, and both sit on the same baseline.
 */
function Field({ label, value, top }) {
  return (
    <div style={{ position: 'absolute', top, left: PAD, fontSize: 12.5, color: MUTED, letterSpacing: '0.01em' }}>
      {label}: <span style={{ color: INK, fontWeight: 700, letterSpacing: 0 }}>{value}</span>
    </div>
  );
}

// `ref` points at the exact node the PNG is rendered from — the card itself, so
// no nav, action bar, Ask-AI widget or page background can ever bleed into it.
const CertificateSheet = forwardRef(function CertificateSheet({ cert, name, qrUrl, verifyUrl }, ref) {
  const [logoBroken, setLogoBroken] = useState(false);
  const revoked = cert?.status === 'revoked';

  const courseName = cert?.courseName || '—';
  const duration = String(cert?.programDuration || '').trim();
  const customDescription = String(cert?.programDescription || '').trim();
  const validityMonths = Number.isFinite(Number(cert?.validityMonths)) && cert?.validityMonths !== null
    ? Number(cert.validityMonths)
    : null;

  // The description sentence always carries the course name in bold — that is
  // the only place the course appears on the sheet, so it can never be lost to
  // an administrator-written description.
  // "programme" is only appended when nothing else describes it, so the sentence
  // never reads "... programme ... the programme's requirements".
  const descriptionTail = customDescription || duration || 'programme';

  // Long names shrink rather than wrap or truncate: the holder's full name must
  // always be printed (no masking, no ellipsis) unless it is freakishly long.
  const nameSize = name.length > 42 ? 24
    : name.length > 34 ? 27
      : name.length > 26 ? 31
        : name.length > 18 ? 38 : 46;
  const nameWidth = 620;

  const verifyHost = useMemo(() => {
    const raw = String(verifyUrl || '');
    try {
      return new URL(raw).host.toLowerCase();
    } catch {
      return 'danqeldigitalinstitute.com';
    }
  }, [verifyUrl]);

  const validUntilText = validityMonths
    ? `This certificate remains valid for ${validityMonths} months from the date of issue.`
    : 'This certificate does not expire.';

  return (
    <div
      ref={ref}
      className="cert-sheet"
      style={{
        position: 'relative',
        width: CERT_W,
        height: CERT_H,
        overflow: 'hidden',
        background: 'linear-gradient(168deg, #ffffff 0%, #ffffff 58%, #fbfaf6 100%)',
        boxShadow: '0 30px 80px rgba(2,10,31,0.45)',
        color: INK,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* faint brand watermark — the sheet is never a blank white rectangle */}
      <img src="/mark.png" alt="" aria-hidden="true" style={{
        position: 'absolute', left: 648, top: 208, width: 360, height: 288,
        objectFit: 'contain', opacity: 0.028, pointerEvents: 'none',
      }} />

      {/* double frame: ink hairline outside, gold inside */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 13, left: 13, width: CERT_W - 26, height: BAND_TOP - 13,
        borderTop: '1px solid rgba(11,17,48,0.30)', borderLeft: '1px solid rgba(11,17,48,0.30)',
        borderRight: '1px solid rgba(11,17,48,0.30)',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', top: 21, left: 21, width: CERT_W - 42, height: BAND_TOP - 21,
        borderTop: '1px solid rgba(201,162,39,0.55)', borderLeft: '1px solid rgba(201,162,39,0.55)',
        borderRight: '1px solid rgba(201,162,39,0.55)',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(135deg, rgba(201,162,39,0.07) 0%, rgba(201,162,39,0) 28%)',
      }} />

      <Ribbon />

      {/* ------------------------------------------------ masthead */}
      <div style={{ position: 'absolute', top: 34, left: PAD, display: 'flex', alignItems: 'center', gap: 14 }}>
        {logoBroken ? (
          <div style={{
            width: 54, height: 54, borderRadius: 12, background: NAVY, border: `2px solid ${GOLD}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: GOLD_PALE, fontSize: 22, fontWeight: 700,
          }}>D</div>
        ) : (
          <img src="/mark.png" alt={INSTITUTE_NAME} width={54} height={54}
            style={{ width: 54, height: 54, objectFit: 'contain' }} onError={() => setLogoBroken(true)} />
        )}
        <div>
          <div style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 23, fontWeight: 700,
            letterSpacing: '0.02em', lineHeight: 1.05, color: INK,
          }}>DANQEL</div>
          <div style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.34em', lineHeight: 1.6, color: BRAND_BLUE,
          }}>DIGITAL INSTITUTE</div>
        </div>
      </div>

      {/* rule under the masthead */}
      <div aria-hidden="true" style={{ position: 'absolute', top: 104, left: PAD, right: PAD, height: 1, background: '#e6e6ea' }} />
      <div aria-hidden="true" style={{
        position: 'absolute', top: 103, left: PAD, width: 128, height: 3,
        background: `linear-gradient(90deg, ${GOLD}, rgba(201,162,39,0))`,
      }} />

      {/* ------------------------------------------------ title block */}
      <div className="cert-serif" style={{
        position: 'absolute', top: 118, left: PAD, fontSize: 13, fontStyle: 'italic', color: MUTED,
      }}>Presents this</div>

      <div style={{
        position: 'absolute', top: 130, left: PAD,
        fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 76, fontWeight: 700,
        lineHeight: 1, letterSpacing: '-0.02em', color: INK,
      }}>CERTIFICATE</div>

      <div style={{
        position: 'absolute', top: 214, left: PAD + 2,
        fontSize: 19, fontWeight: 700, letterSpacing: '0.32em', lineHeight: 1.2, color: NAVY,
      }}>OF COMPLETION</div>

      {/* ------------------------------------------------ accreditation */}
      <div style={{
        position: 'absolute', top: 242, left: PAD + 2,
        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.22em', lineHeight: 1.3,
        color: NAVY,
      }}>Accredited by the American Council of Training and Development, USA</div>

      <div aria-hidden="true" style={{
        position: 'absolute', top: 254, left: PAD, width: 92, height: 3,
        background: `linear-gradient(90deg, ${GOLD}, rgba(201,162,39,0.15))`,
      }} />

      {/* ------------------------------------------------ holder */}
      <div style={{
        position: 'absolute', top: 274, left: PAD, fontSize: 10, fontWeight: 600,
        letterSpacing: '0.26em', color: MUTED,
      }}>PROUDLY PRESENTED TO</div>

      <div style={{
        position: 'absolute', top: 292, left: PAD, maxWidth: nameWidth,
        fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: nameSize, fontWeight: 700,
        lineHeight: 1.12, letterSpacing: '-0.01em', color: INK,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{name}</div>

      <div aria-hidden="true" style={{
        position: 'absolute', top: 296 + Math.round(nameSize * 1.12), left: PAD, width: 152, height: 3,
        background: `linear-gradient(90deg, ${GOLD_DEEP}, rgba(201,162,39,0.08))`,
      }} />

      {/* ------------------------------------------------ programme sentence */}
      <div style={{
        position: 'absolute', top: 368, left: PAD, width: 596,
        fontSize: 14, lineHeight: 1.62, color: BODY,
        // Three lines is the space reserved before the date block; a runaway
        // description is clipped there rather than colliding with the dates.
        maxHeight: 74, overflow: 'hidden',
      }}>
        For successfully completing the{' '}
        <span style={{ color: NAVY, fontWeight: 700 }}>{courseName}</span>{' '}
        {descriptionTail} at {INSTITUTE_NAME.replace(/ /g, '\u00a0')}, and meeting all of the
        programme&apos;s requirements.
      </div>

      {/* ------------------------------------------------ dates */}
      <Field label="Date of issue" value={formatDate(cert?.issueDate)} top={452} />
      <Field label="Program Completion Date" value={formatDate(cert?.completionDate || cert?.issueDate)} top={478} />

      {/* ------------------------------------------------ seal + signatures */}
      <AwardSeal style={{ position: 'absolute', top: 232, left: CERT_W - PAD - 150 }} />

      <div style={{ position: 'absolute', top: 506, left: PAD, width: 280 }}>
        <Signature strokes={HEAD_SIGNATURE} label="Head of Learning & Programs signature"
          style={{ display: 'block', width: 196, height: 59, marginLeft: -4 }} />
        <div aria-hidden="true" style={{
          marginTop: 2, height: 1, background: 'linear-gradient(90deg, rgba(11,17,48,0.42), rgba(11,17,48,0.08))',
        }} />
        <div style={{ marginTop: 8, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.24em', color: MUTED }}>
          HEAD OF LEARNING &amp; PROGRAMS
        </div>
      </div>

      <div style={{ position: 'absolute', top: 506, left: CERT_W - PAD - 280, width: 280, textAlign: 'right' }}>
        <Signature strokes={DIRECTOR_SIGNATURE} label="Director signature"
          style={{ display: 'block', width: 196, height: 59, marginLeft: 'auto', marginRight: -4 }} />
        <div aria-hidden="true" style={{
          marginTop: 2, height: 1, background: 'linear-gradient(90deg, rgba(11,17,48,0.08), rgba(11,17,48,0.42))',
        }} />
        <div style={{ marginTop: 8, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.24em', color: MUTED }}>
          DIRECTOR
        </div>
      </div>

      {/* ------------------------------------------------ verification band */}
      <div style={{
        position: 'absolute', top: BAND_TOP, left: 0, right: 0, height: CERT_H - BAND_TOP,
        background: `linear-gradient(100deg, ${NAVY} 0%, #061236 62%, #071538 100%)`,
        color: '#fff',
      }}>
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${GOLD}, ${GOLD_PALE} 45%, ${GOLD_DEEP})`,
        }} />

        <div style={{ position: 'absolute', top: 26, left: PAD }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 8.5, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.55)' }}>
            <BadgeCheck size={12} color={GOLD_LIGHT} />
            VERIFY THIS CERTIFICATE ONLINE AT
          </div>
          <div style={{
            marginTop: 6, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', color: GOLD_LIGHT,
            textTransform: 'uppercase',
          }}>{verifyHost}/verify-certificate</div>
          <div style={{ marginTop: 14, display: 'flex', gap: 22, fontSize: 9.5, color: 'rgba(255,255,255,0.62)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
            <span>Certificate ID: <span style={{ color: '#fff' }}>{cert?.certificateId || '—'}</span></span>
            <span>Verification Code: <span style={{ color: GOLD_PALE }}>{cert?.verificationCode || cert?.certificateId || '—'}</span></span>
          </div>
        </div>

        <div style={{
          position: 'absolute', top: 30, right: PAD + 104, width: 330, textAlign: 'right',
          fontSize: 9.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.62)',
        }}>
          <div>{validUntilText}</div>
          <div style={{ marginTop: 6 }}>
            {cert?.scheduleId ? <>Schedule ID: <span style={{ color: GOLD_PALE }}>{cert.scheduleId}</span></> : 'Issued by DANQEL DIGITAL INSTITUTE'}
          </div>
        </div>

        <div style={{ position: 'absolute', top: 18, right: PAD - 8, width: 92, textAlign: 'center' }}>
          <div style={{ background: '#fff', padding: 5, borderRadius: 4, width: 88, height: 88, boxSizing: 'border-box' }}>
            {qrUrl
              ? <img src={qrUrl} alt="Certificate verification QR code" style={{ width: 78, height: 78, display: 'block' }} />
              : <div style={{ width: 78, height: 78 }} />}
          </div>
          <div style={{ marginTop: 5, fontSize: 7.5, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)' }}>
            SCAN TO VERIFY
          </div>
        </div>
      </div>

      {revoked && (
        <div className="cert-serif" style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-12deg)',
          border: '5px solid rgba(220,38,38,0.8)', color: 'rgba(220,38,38,0.8)',
          padding: '8px 40px', fontSize: 60, fontWeight: 700, letterSpacing: '0.3em', zIndex: 20,
          background: 'rgba(255,255,255,0.72)',
        }}>REVOKED</div>
      )}
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
    QRCode.toDataURL(verifyUrl, { width: 304, margin: 1, color: { dark: NAVY, light: '#ffffff' } })
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
    const text = `My ${INSTITUTE_NAME} Certificate — ${cert?.courseName || ''} — verify: ${verifyUrl}`;
    try {
      if (navigator.share) await navigator.share({ title: `My ${INSTITUTE_NAME} Certificate`, text, url: verifyUrl });
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
      // The sheet is white paper now, so the export backs it with white rather
      // than navy — a JPEG-ish viewer must never see a dark border.
      const shot = await captureCertificatePng(certRef.current, { backgroundColor: '#ffffff' });
      const saved = await saveOrShareImage({
        ...shot,
        fileName: certificateFileName(cert?.certificateId),
        title: `My ${INSTITUTE_NAME} Certificate`,
        text: `My ${INSTITUTE_NAME} Certificate — ${cert?.courseName || ''} — verify: ${verifyUrl}`,
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
            <CertificateSheet ref={certRef} cert={cert} name={name} qrUrl={qrUrl} verifyUrl={verifyUrl} />
          </div>
        </div>

        <p className="no-print mt-3 text-center text-xs text-white/40 lg:hidden">
          Tip: tap <strong className="text-white/70">Download Image (PNG)</strong> to save a full-size copy you can zoom into.
        </p>

        {/* small-screen detail card so every field stays readable at 360px */}
        <div className="no-print mt-6 lg:hidden glass rounded-[20px] p-5 text-sm">
          <h2 className="font-display font-bold text-base mb-3">Certificate Details</h2>
          <dl className="space-y-2">
            <div className="flex justify-between gap-4"><dt className="text-white/40 shrink-0">Awarded to</dt><dd className="font-bold text-right">{name}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/40 shrink-0">Course</dt><dd className="font-bold text-right">{cert.courseName}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/40 shrink-0">Date of issue</dt><dd className="font-bold text-right">{formatDate(cert.issueDate)}</dd></div>
            {cert.completionDate && (
              <div className="flex justify-between gap-4"><dt className="text-white/40 shrink-0">Program completion</dt><dd className="font-bold text-right">{formatDate(cert.completionDate)}</dd></div>
            )}
            <div className="flex justify-between gap-4"><dt className="text-white/40 shrink-0">Certificate ID</dt><dd className="font-mono text-[13px] text-cyan-300 text-right break-all">{cert.certificateId}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/40 shrink-0">Verification code</dt><dd className="font-mono text-[13px] text-[#e9cf8b] text-right break-all">{verifyCode}</dd></div>
            {cert.scheduleId && (
              <div className="flex justify-between gap-4"><dt className="text-white/40 shrink-0">Schedule ID</dt><dd className="font-mono text-[13px] text-white/80 text-right break-all">{cert.scheduleId}</dd></div>
            )}
          </dl>
          <p className="mt-3 text-xs text-white/50">
            Signed by the Head of Learning &amp; Programs and the Director, {INSTITUTE_NAME}.
          </p>
        </div>

        <p className="no-print mt-6 text-center text-xs text-white/40">
          Anyone can verify this certificate with the ID or verification code on the{' '}
          <Link to="/verify-certificate" className="text-[#e9cf8b] underline underline-offset-2">public verifier</Link>.
        </p>
      </div>
    </div>
  );
}
