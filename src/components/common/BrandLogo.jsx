// WOLI DAN TECH HUB — official logo component.
// Variants: 'full' (mark + wordmark + tagline), 'lockup' (mark + wordmark),
// 'icon' (mark only). Renders the brand SVG inline so the mark inherits the
// dark theme everywhere (header, mobile header, auth, dashboard, classroom,
// certificates, CV builder, DanTECH AI, admin) without third-party assets.
import { useId } from 'react';

export const BrandMark = ({ size = 40, className = '', rounded = 0.22, withBg = true }) => {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label="WOLI DAN TECH HUB logo" focusable="false">
      <defs>
        <linearGradient id={`wg-${gid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="0.55" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      {withBg && <rect width="100" height="100" rx={100 * rounded} fill="#020a1f" />}
      <rect x={100 * 0.03} y={100 * 0.03} width={100 * 0.94} height={100 * 0.94} rx={100 * 0.94 * rounded} fill={`url(#wg-${gid})`} />
      {/* The W is also a learning path: nodes joined by the strokes */}
      <path d="M20 29 L35 71 L50 42 L65 71 L80 29" fill="none" stroke="#fff" strokeWidth="10.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="29" r="5.4" fill="#020a1f" /><circle cx="80" cy="29" r="5.4" fill="#020a1f" />
      <circle cx="20" cy="29" r="2.3" fill="#fff" /><circle cx="80" cy="29" r="2.3" fill="#fff" />
      {/* progress spark */}
      <circle cx="85.5" cy="16.5" r="8.3" fill="#020a1f" />
      <circle cx="85.5" cy="16.5" r="5.7" fill="#67e8f9" />
    </svg>
  );
};

/**
 * @param {{ variant?: 'full'|'lockup'|'icon', size?: number, className?: string, tagline?: boolean }} props
 */
export default function BrandLogo({ variant = 'lockup', size = 40, className = '', tagline = true, link = false }) {
  const mark = <BrandMark size={size} />;
  if (variant === 'icon') return <span className={`inline-flex ${className}`}>{mark}</span>;
  const text = (
    <span className="inline-flex flex-col leading-none">
      <span className="font-display font-bold tracking-tight text-white" style={{ fontSize: Math.max(13, size * 0.42) }}>WOLI DAN</span>
      <span className="font-display font-bold text-gradient tracking-[0.2em]" style={{ fontSize: Math.max(11, size * 0.33) }}>TECH HUB</span>
      {tagline && (
        <span className="mt-[3px] font-semibold tracking-[0.28em] text-white/40" style={{ fontSize: Math.max(8, size * 0.19) }}>
          LEARN • BUILD • GROW
        </span>
      )}
    </span>
  );
  if (!link) return <span className={`inline-flex items-center gap-3 ${className}`} role="img" aria-label="WOLI DAN TECH HUB">{mark}{text}</span>;
  return (
    <a href="/" className={`inline-flex items-center gap-3 ${className}`} aria-label="WOLI DAN TECH HUB — home">
      {mark}{text}
    </a>
  );
}
