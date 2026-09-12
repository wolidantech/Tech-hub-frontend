import { memo } from 'react';
import { publicUrl } from '../../lib/supabase';

// Premium 3D-style course visuals: layered glassmorphism scenes with depth,
// floating elements, realistic lighting gradients and brand accents.
// Each thumbnail key maps to a themed scene. Admin-uploaded images override this art.

const SCENES = {
  ai: { emoji: '🤖', orbit: ['🎬', '✨', '🎙️'], glow: 'rgba(139,92,246,0.55)' },
  prompt: { emoji: '💬', orbit: ['🧠', '⚡', '✨'], glow: 'rgba(168,85,247,0.55)' },
  video: { emoji: '🎬', orbit: ['📱', '✂️', '🔊'], glow: 'rgba(34,211,238,0.55)' },
  design: { emoji: '🎨', orbit: ['🖌️', '🔤', '🖼️'], glow: 'rgba(232,121,249,0.55)' },
  marketing: { emoji: '📣', orbit: ['📊', '❤️', '🚀'], glow: 'rgba(251,113,133,0.55)' },
  mobile: { emoji: '📱', orbit: ['⚙️', '💻', '🚀'], glow: 'rgba(52,211,153,0.55)' },
  portfolio: { emoji: '💼', orbit: ['🌟', '🔗', '🏆'], glow: 'rgba(148,163,184,0.5)' },
  freelance: { emoji: '💰', orbit: ['🌍', '🤝', '📈'], glow: 'rgba(251,191,36,0.55)' },
  frontend: { emoji: '💻', orbit: ['⚛️', '🎯', '🌐'], glow: 'rgba(56,189,248,0.55)' },
  python: { emoji: '🐍', orbit: ['⚙️', '📊', '🤖'], glow: 'rgba(250,204,21,0.5)' },
  wordpress: { emoji: '🌐', orbit: ['🧩', '🛒', '🔍'], glow: 'rgba(14,165,233,0.55)' },
  figma: { emoji: '✏️', orbit: ['📐', '📱', '🎯'], glow: 'rgba(192,132,252,0.55)' },
  excel: { emoji: '📊', orbit: ['🧮', '📈', '🗂️'], glow: 'rgba(34,197,94,0.55)' },
  word: { emoji: '📝', orbit: ['📄', '✒️', '📑'], glow: 'rgba(96,165,250,0.55)' },
  powerpoint: { emoji: '📑', orbit: ['🎤', '📽️', '🏆'], glow: 'rgba(249,115,22,0.55)' },
  default: { emoji: '🎓', orbit: ['📚', '✨', '🚀'], glow: 'rgba(34,211,238,0.5)' },
};

function CourseArt({ course, className = 'h-[200px]' }) {
  const theme = SCENES[course.artTheme] || SCENES[course.thumbnail] || SCENES.default;

  // Admin-uploaded custom thumbnail takes precedence (storage path or direct URL)
  if (course.thumbnailUrl) {
    const src = /^(https?:|data:|blob:)/.test(course.thumbnailUrl) ? course.thumbnailUrl : publicUrl('thumbnails', course.thumbnailUrl);
    return (
      <div className={`relative ${className} overflow-hidden bg-[#0a1a4a]`}>
        <img src={src} alt={course.title} loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020a1f]/70 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className={`relative ${className} overflow-hidden`} style={{ perspective: '800px' }}>
      {/* Base gradient + lighting */}
      <div className={`absolute inset-0 bg-gradient-to-br ${course.color || 'from-cyan-500 to-blue-600'}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.35),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(0,0,0,0.45),transparent_55%)]" />
      {/* Grid floor for depth */}
      <div
        className="absolute inset-x-[-20%] bottom-[-30%] h-[70%] opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          transform: 'rotateX(62deg)',
          maskImage: 'linear-gradient(to top, black 40%, transparent)',
          WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent)',
        }}
      />
      {/* Glow orb */}
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: theme.glow }} />

      {/* 3D stage */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
        {/* Glass pedestal */}
        <div className="absolute bottom-6 h-10 w-44 rounded-[50%] bg-black/40 blur-md" />
        <div
          className="relative flex h-28 w-28 items-center justify-center rounded-[28px] border border-white/40 bg-white/15 shadow-[0_25px_50px_rgba(0,0,0,0.45),inset_0_2px_12px_rgba(255,255,255,0.35)] backdrop-blur-xl"
          style={{ transform: 'rotateX(8deg) rotateY(-12deg)', animation: 'art-float 5s ease-in-out infinite' }}
        >
          <span className="text-6xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" role="img" aria-label="course art">{theme.emoji}</span>
          <div className="absolute inset-x-3 top-2 h-6 rounded-full bg-gradient-to-b from-white/40 to-transparent" />
        </div>
        {/* Orbiting chips */}
        {theme.orbit.map((e, i) => (
          <div
            key={i}
            className="absolute flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-xl shadow-lg backdrop-blur-lg"
            style={{
              left: `${[14, 68, 40][i]}%`,
              top: `${[16, 12, 62][i]}%`,
              transform: `rotate(${(i - 1) * 10}deg)`,
              animation: `art-float ${4 + i}s ease-in-out ${i * 0.7}s infinite`,
              boxShadow: '0 12px 28px rgba(0,0,0,0.4), inset 0 1px 6px rgba(255,255,255,0.3)',
            }}
          >
            {e}
          </div>
        ))}
        {/* Code shimmer for dev courses */}
        {(course.thumbnail === 'frontend' || course.artTheme === 'python') && (
          <div className="absolute bottom-3 left-4 rounded-lg bg-black/50 px-2 py-1 font-mono text-[10px] text-cyan-300 backdrop-blur">
            {'<code />'} • {'{ }'} • ( )
          </div>
        )}
      </div>

      {/* Brand sheen sweep */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent" style={{ animation: 'art-sheen 7s ease-in-out infinite' }} />
      </div>
      <div className="absolute inset-0 rounded-none ring-1 ring-inset ring-white/20" />
      <style>{`
        @keyframes art-float { 0%,100% { translate: 0 0; } 50% { translate: 0 -10px; } }
        @keyframes art-sheen { 0%,60% { left: -40%; } 100% { left: 130%; } }
      `}</style>
    </div>
  );
}

export default memo(CourseArt);
