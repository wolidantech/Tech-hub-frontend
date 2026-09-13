import { Check, ChevronRight, X, Loader2 } from 'lucide-react';

/**
 * Visual status flow for the manual bank-transfer payment workflow.
 *
 * Happy path:   PAYMENT REQUIRED → PAYMENT SUBMITTED → PENDING VERIFICATION
 *               → APPROVED → COURSE ACCESS ACTIVE
 * Reject path:  PAYMENT SUBMITTED → REJECTED → REASON SHOWN → RESUBMIT
 *
 * `status`: 'required' | 'pending' | 'approved' | 'rejected'
 * `accessActive`: backend-confirmed active enrollment (drives the final step;
 *                 never assume it from frontend state alone).
 */

const TONES = {
  done: 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200',
  current: 'bg-amber-500/15 border-amber-400/50 text-amber-200',
  next: 'bg-white/[0.03] border-white/10 text-white/35',
  bad: 'bg-red-500/15 border-red-400/40 text-red-200',
  badCurrent: 'bg-red-500/20 border-red-400/60 text-red-100',
  win: 'bg-green-500/15 border-green-400/50 text-green-200',
};

function Step({ label, tone, state, pulse = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] sm:text-[11px] font-bold tracking-wide whitespace-nowrap ${TONES[tone] || TONES.next}`}
    >
      {state === 'done' && <Check className="h-3 w-3 shrink-0" />}
      {state === 'current' && (pulse
        ? <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
        : <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shrink-0" />)}
      {state === 'bad' && <X className="h-3 w-3 shrink-0" />}
      {label}
    </span>
  );
}

const Arrow = () => <ChevronRight className="h-3.5 w-3.5 text-white/25 shrink-0" />;

export default function PaymentFlow({ status, accessActive = false, className = '' }) {
  // ---------- Rejected flow ----------
  if (status === 'rejected') {
    return (
      <div className={`flex items-center gap-1.5 flex-wrap ${className}`} aria-label="Payment status flow">
        <Step label="PAYMENT SUBMITTED" tone="done" state="done" />
        <Arrow />
        <Step label="REJECTED" tone="bad" state="bad" />
        <Arrow />
        <Step label="REASON SHOWN" tone="badCurrent" state="current" />
        <Arrow />
        <Step label="RESUBMIT" tone="current" state="current" pulse />
      </div>
    );
  }

  // ---------- Approved flow ----------
  if (status === 'approved') {
    return (
      <div className={`flex items-center gap-1.5 flex-wrap ${className}`} aria-label="Payment status flow">
        <Step label="PAYMENT REQUIRED" tone="done" state="done" />
        <Arrow />
        <Step label="PAYMENT SUBMITTED" tone="done" state="done" />
        <Arrow />
        <Step label="PENDING VERIFICATION" tone="done" state="done" />
        <Arrow />
        <Step label="APPROVED" tone="win" state="done" />
        <Arrow />
        {accessActive
          ? <Step label="COURSE ACCESS ACTIVE" tone="win" state="current" />
          : <Step label="ACTIVATING ACCESS…" tone="current" state="current" pulse />}
      </div>
    );
  }

  // ---------- Pending flow ----------
  if (status === 'pending') {
    return (
      <div className={`flex items-center gap-1.5 flex-wrap ${className}`} aria-label="Payment status flow">
        <Step label="PAYMENT REQUIRED" tone="done" state="done" />
        <Arrow />
        <Step label="PAYMENT SUBMITTED" tone="done" state="done" />
        <Arrow />
        <Step label="PENDING VERIFICATION" tone="current" state="current" pulse />
        <Arrow />
        <Step label="APPROVED" tone="next" state="next" />
        <Arrow />
        <Step label="COURSE ACCESS ACTIVE" tone="next" state="next" />
      </div>
    );
  }

  // ---------- Payment required (nothing submitted yet) ----------
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`} aria-label="Payment status flow">
      <Step label="PAYMENT REQUIRED" tone="current" state="current" />
      <Arrow />
      <Step label="PAYMENT SUBMITTED" tone="next" state="next" />
      <Arrow />
      <Step label="PENDING VERIFICATION" tone="next" state="next" />
      <Arrow />
      <Step label="APPROVED" tone="next" state="next" />
      <Arrow />
      <Step label="COURSE ACCESS ACTIVE" tone="next" state="next" />
    </div>
  );
}
