import { useEffect, useState, useCallback } from 'react';
import {
  Activity, CheckCircle2, AlertTriangle, XCircle, MinusCircle,
  RefreshCw, Copy, Check, ArrowLeft, Server, Stethoscope,
} from 'lucide-react';
import { runDiagnostics, diagnosticsToText, isConfigured } from '../lib/backendHealth';
import { copyText } from '../lib/utils';

const ICONS = {
  pass: { Icon: CheckCircle2, cls: 'text-emerald-400', ring: 'border-emerald-500/30', bg: 'bg-emerald-500/10', label: 'OK' },
  warn: { Icon: AlertTriangle, cls: 'text-amber-400', ring: 'border-amber-500/30', bg: 'bg-amber-500/10', label: 'CHECK' },
  fail: { Icon: XCircle, cls: 'text-rose-400', ring: 'border-rose-500/30', bg: 'bg-rose-500/10', label: 'BROKEN' },
  skip: { Icon: MinusCircle, cls: 'text-white/30', ring: 'border-white/10', bg: 'bg-white/[0.03]', label: 'SKIPPED' },
};

// Public, dependency-free diagnostics screen.
//
// It deliberately sits OUTSIDE the auth/providers/SetupGate tree so it can be
// opened even when the backend is unreachable or unconfigured — which is
// exactly when it is needed. Everything it does is a read-only GET.
export default function BackendStatus() {
  const [report, setReport] = useState(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = useCallback(async () => {
    setRunning(true);
    try {
      setReport(await runDiagnostics());
    } finally {
      setRunning(false);
    }
  }, []);

  useEffect(() => { run(); }, [run]);

  const copy = async () => {
    if (await copyText(diagnosticsToText(report))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    // Clipboard blocked — the report is still readable on screen, and every
    // line of it is shown in the panels below.
  };

  const verdict = !report
    ? null
    : report.failures.length
      ? { tone: 'fail', text: `${report.failures.length} problem${report.failures.length > 1 ? 's' : ''} found` }
      : report.warnings.length
        ? { tone: 'warn', text: 'Reachable, but needs attention' }
        : { tone: 'pass', text: 'Backend is healthy' };

  return (
    <div className="mobile-safe-top min-h-screen bg-[#020a1f] text-white">
      <div className="safe-inline safe-bottom max-w-[820px] mx-auto py-10 sm:py-14 space-y-6">

        <a href="/" className="inline-flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white transition">
          <ArrowLeft className="h-3.5 w-3.5" /> BACK TO SITE
        </a>

        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] font-bold tracking-widest">
            <Stethoscope className="h-3 w-3 text-cyan-300" /> BACKEND DIAGNOSTICS
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl leading-tight">Why is the site empty?</h1>
          <p className="text-sm text-white/60 max-w-[620px] leading-relaxed">
            Courses, logins and payments all come from one Supabase database. This page tests that
            connection step by step and says exactly what is broken. Nothing here is sent anywhere —
            it runs in your browser and only performs read-only requests.
          </p>
        </header>

        {/* Connection summary */}
        <div className="glass-strong rounded-[20px] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white/50">
            <Server className="h-3.5 w-3.5" /> TARGET
          </div>
          <div className="font-mono text-[12px] break-all text-cyan-200">{report?.url || 'reading configuration…'}</div>
          <div className="font-mono text-[11px] break-all text-white/40">from origin: {report?.origin || '—'}</div>
          {!isConfigured() && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-200">
              The Supabase environment variables are not present in this build.
            </div>
          )}
        </div>

        {/* Verdict */}
        {report && (
          <div className={`rounded-[20px] border p-5 ${ICONS[verdict.tone].ring} ${ICONS[verdict.tone].bg}`}>
            <div className="flex items-center gap-3">
              <Activity className={`h-5 w-5 ${ICONS[verdict.tone].cls}`} />
              <div className="font-display font-black text-lg">{verdict.text}</div>
            </div>
            {report.failures[0] && (
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                Start here: <span className="text-white font-semibold">{report.failures[0].title}</span> — {report.failures[0].detail}
              </p>
            )}
          </div>
        )}

        {/* Checks */}
        <div className="space-y-3">
          {(report?.checks || Array.from({ length: 6 })).map((c, i) => {
            const meta = c ? ICONS[c.level] || ICONS.skip : null;
            return (
              <div
                key={c?.id || i}
                className={`rounded-[18px] border p-4 ${c ? `${meta.ring} ${meta.bg}` : 'border-white/10 bg-white/[0.02] animate-pulse'}`}
              >
                {!c ? (
                  <div className="h-5 w-40 rounded bg-white/10" />
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <meta.Icon className={`h-5 w-5 shrink-0 mt-0.5 ${meta.cls}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm">{c.title}</span>
                          <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full border ${meta.ring} ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] text-white/65 leading-relaxed break-words">{c.detail}</p>
                        {c.fix && (
                          <div className="mt-3 rounded-xl bg-black/30 border border-white/10 p-3">
                            <div className="text-[10px] font-black tracking-widest text-cyan-300 mb-1">HOW TO FIX</div>
                            <p className="text-[12.5px] text-white/75 leading-relaxed">{c.fix}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-sm disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'TESTING…' : 'RUN AGAIN'}
          </button>
          <button
            onClick={copy}
            disabled={!report}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full glass font-bold text-sm disabled:opacity-40 transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? 'COPIED' : 'COPY REPORT'}
          </button>
        </div>

        <p className="text-[11px] text-white/35 leading-relaxed max-w-[640px]">
          Copy the report and send it to whoever maintains this site — it pinpoints the failing layer
          without exposing any secret. The anon/publishable key is never printed here.
        </p>
      </div>
    </div>
  );
}
