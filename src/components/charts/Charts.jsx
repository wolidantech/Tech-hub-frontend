// Lightweight dependency-free SVG charts (mobile-optimized, lazy-friendly).

export function ProgressRing({ value = 0, size = 84, stroke = 8, color = 'url(#ringGrad)' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" className="transition-all duration-700" />
    </svg>
  );
}

export function BarChart({ data = [], height = 120, barClass = 'fill-cyan-400' }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 320, h = height;
  const bw = data.length ? (w / data.length) * 0.55 : 10;
  return (
    <svg viewBox={`0 0 ${w} ${h + 22}`} className="w-full" role="img">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const bh = Math.max(3, (d.value / max) * h);
        const x = (w / data.length) * i + (w / data.length - bw) / 2;
        return (
          <g key={i}>
            <rect x={x} y={h - bh} width={bw} height={bh} rx={4} fill="url(#barGrad)" opacity={0.85} className={barClass.includes('fill-') ? undefined : barClass}>
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
            {data.length <= 14 && (
              <text x={x + bw / 2} y={h + 14} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)">{String(d.label).slice(0, 6)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ segments = [], size = 140 }) {
  // segments: [{ value, color, label }]
  const total = Math.max(1, segments.reduce((s, x) => s + x.value, 0));
  const r = 54, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="18" fill="none" />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} stroke={s.color} strokeWidth="18" fill="none"
              strokeDasharray={`${frac * c} ${c}`} strokeDashoffset={-acc * c} strokeLinecap="butt">
              <title>{`${s.label}: ${s.value}`}</title>
            </circle>
          );
          acc += frac;
          return el;
        })}
      </svg>
      <div className="space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-white/60">{s.label}</span>
            <span className="font-bold">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Sparkline({ data = [], width = 200, height = 48, stroke = '#22d3ee' }) {
  if (!data.length) return <div style={{ width, height }} />;
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const pts = data.map((v, i) => `${(i / Math.max(1, data.length - 1)) * width},${height - 4 - ((v - min) / Math.max(1, max - min)) * (height - 8)}`).join(' ');
  return (
    <svg width={width} height={height} className="w-full">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
