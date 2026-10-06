import { useRef } from 'react';
import { Camera, IdCard, Loader2, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import { publicUrl } from '../../lib/supabase';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Displays the student ID card ISSUED BY THE BACKEND.
 *
 * It never fabricates a card: without an issued row it shows the honest state —
 * "upload a photo to generate your ID" when no photo exists, or a "generate"
 * action when the photo is there but the server has not minted the card yet.
 */
export default function StudentIdCard({ card, status, error, issuing, onIssue, onPhotoChange, photoUrl }) {
  const inputRef = useRef(null);

  const uploadRow = (label, hint) => (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <Camera className="h-5 w-5 text-cyan-300 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-sm">{label}</div>
          {hint && <p className="mt-1 text-[11px] text-white/50 leading-relaxed">{hint}</p>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhotoChange?.(f); e.target.value = ''; }} />
      <button type="button" onClick={() => inputRef.current?.click()}
        className="w-full h-11 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-[#020617] text-xs font-black hover:opacity-90 transition">
        UPLOAD A PHOTO
      </button>
    </div>
  );

  if (status === 'loading') {
    return <div className="glass rounded-2xl p-6 text-xs text-white/50 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading your ID card…</div>;
  }

  if (status === 'need-photo') {
    return (
      <div className="space-y-3">
        {uploadRow('Upload a photo to generate your ID', 'Your student ID is a photo ID, so we need a clear headshot first. It is stored in your account and used only for this card.')}
        {error && <p className="text-[11px] text-rose-300">{error}</p>}
      </div>
    );
  }

  if (status === 'unissued') {
    return (
      <div className="space-y-3">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <IdCard className="h-5 w-5 text-cyan-300 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Your photo is ready</div>
              <p className="mt-1 text-[11px] text-white/50 leading-relaxed">
                Generate your digital student ID. The card number is allocated by our records system, so it cannot be edited or forged.
              </p>
            </div>
          </div>
          <button type="button" onClick={() => onIssue?.()} disabled={issuing}
            className="mt-4 w-full h-11 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-[#020617] text-xs font-black disabled:opacity-60 hover:opacity-90 transition flex items-center justify-center gap-2">
            {issuing ? <><Loader2 className="h-4 w-4 animate-spin" /> ISSUING…</> : <><Sparkles className="h-4 w-4" /> GENERATE MY STUDENT ID</>}
          </button>
          <button type="button" onClick={() => inputRef.current?.click()} className="mt-2 w-full text-[11px] text-white/40 hover:text-white/70 font-bold">
            Use a different photo
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhotoChange?.(f); e.target.value = ''; }} />
        </div>
        {error && <p className="text-[11px] text-rose-300 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> {error}</p>}
      </div>
    );
  }

  if (status === 'error' || !card) {
    return (
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-rose-300 text-xs font-bold"><AlertTriangle className="h-4 w-4" /> ID CARD UNAVAILABLE</div>
        <p className="text-[11px] text-white/50 leading-relaxed">{error || 'We could not load your ID card. Please try again.'}</p>
        <button type="button" onClick={() => onIssue?.()} disabled={issuing}
          className="w-full h-10 rounded-full glass border border-white/15 text-xs font-bold hover:bg-white/10 disabled:opacity-60">
          {issuing ? 'TRYING…' : 'TRY AGAIN'}
        </button>
      </div>
    );
  }

  const photo = card.photoPath ? publicUrl('avatars', card.photoPath) : photoUrl;

  return (
    <div className="space-y-3">
      {/* The card itself */}
      <div className="relative overflow-hidden rounded-[22px] border border-white/15 bg-gradient-to-br from-[#0a1a4a] via-[#061236] to-[#020a1f] p-5 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.18),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black tracking-[0.25em] text-cyan-300">DANQEL DIGITAL INSTITUTE</div>
            <div className="text-[9px] font-bold tracking-widest text-white/40">STUDENT ID</div>
          </div>
          <div className="mt-4 flex gap-4">
            <div className="h-[92px] w-[76px] shrink-0 overflow-hidden rounded-xl border border-white/20 bg-white/5">
              {photo
                ? <img src={photo} alt={card.fullName} className="h-full w-full object-cover" />
                : <div className="h-full w-full grid place-items-center text-white/30"><Camera className="h-5 w-5" /></div>}
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="font-display font-black text-lg leading-tight truncate">{card.fullName}</div>
              <div className="text-[11px] text-white/60 truncate">{card.programme}</div>
              <div className="pt-1">
                <div className="text-[9px] tracking-widest text-white/40 font-bold">CARD NUMBER</div>
                <div className="font-mono text-sm text-cyan-200 tracking-wider">{card.cardNumber}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <div className="text-[9px] text-white/40">
              <span className="font-bold tracking-widest">ISSUED </span>{formatDate(card.issuedAt)}
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold tracking-widest text-emerald-300">
              <ShieldCheck className="h-3 w-3" /> VERIFIED
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-white/35 leading-relaxed">
        Digitally issued by our records system. The number is allocated server-side and cannot be edited from this app.
        Change your photo and ask us to re-issue if your details change.
      </p>
      <button type="button" onClick={() => inputRef.current?.click()} className="w-full h-10 rounded-full glass border border-white/15 text-xs font-bold hover:bg-white/10">
        CHANGE PHOTO
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhotoChange?.(f); e.target.value = ''; }} />
    </div>
  );
}
