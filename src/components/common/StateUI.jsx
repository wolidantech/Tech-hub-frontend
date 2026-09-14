// Shared loading / empty / error states for every data-driven section.
// Rule: no section may render a broken blank page — it shows what happened
// and (for errors) a way to retry.
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

export const Skeleton = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2.5 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-3.5 rounded-full bg-white/[0.07] animate-pulse" style={{ width: `${88 - (i * 13) % 40}%` }} />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`glass rounded-2xl p-5 space-y-3 ${className}`}>
    <div className="h-4 w-1/2 rounded-full bg-white/[0.08] animate-pulse" />
    <Skeleton lines={3} />
  </div>
);

export const EmptyState = ({ icon: Icon = Inbox, title, hint, children, className = '' }) => (
  <div className={`rounded-2xl border border-dashed border-white/15 p-8 text-center ${className}`}>
    <Icon className="h-9 w-9 mx-auto text-white/25 mb-3" />
    <div className="font-bold text-white/80">{title}</div>
    {hint && <div className="text-sm text-white/45 mt-1.5 max-w-[460px] mx-auto leading-relaxed">{hint}</div>}
    {children && <div className="mt-4">{children}</div>}
  </div>
);

export const ErrorState = ({ title = 'Something went wrong loading this section', message = '', onRetry, className = '' }) => (
  <div className={`rounded-2xl bg-red-500/10 border border-red-500/25 p-6 text-center ${className}`}>
    <AlertTriangle className="h-8 w-8 mx-auto text-red-300 mb-2" />
    <div className="font-bold text-red-200">{title}</div>
    {message && <div className="text-sm text-white/60 mt-1.5 max-w-[520px] mx-auto break-words">{message}</div>}
    {onRetry && (
      <button onClick={onRetry} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass font-bold text-sm hover:bg-white/10 transition">
        <RefreshCw className="h-4 w-4" /> RETRY
      </button>
    )}
  </div>
);
