import { Link } from 'react-router-dom';
import { Database, AlertTriangle, Stethoscope } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

// Blocks the entire app when the Supabase backend is not configured.
// The app NEVER runs on localStorage/mock data — the database is the only
// source of truth, so without it we show setup instructions instead.
//
// /backend-status is routed OUTSIDE this gate (see App.jsx) so diagnostics stay
// reachable when the backend is broken; the link below is for the unconfigured
// case, where the checklist itself is the answer.
export default function SetupGate({ children }) {
  if (isSupabaseConfigured()) return children;
  return (
    <div className="mobile-safe-top safe-inline safe-bottom min-h-screen flex items-center justify-center bg-[#020a1f]">
      <div className="w-full max-w-[600px] glass-strong rounded-[24px] p-5 sm:p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mx-auto">
            <Database className="h-8 w-8" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl">Backend Setup Required</h1>
            <p className="mt-2 text-sm text-white/60 leading-relaxed">
              WOLI DAN TECH HUB runs on a secure Supabase database. Logins, courses and
              payments all come from it, so the administrator must connect it before the
              app can start.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-left">
          <div className="font-bold text-amber-300 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Administrator checklist — in this order
          </div>
          <ol className="mt-3 text-xs text-white/65 space-y-2 list-decimal pl-5">
            <li>
              Create a Supabase project and run <span className="font-mono text-white/80">supabase/migrations/001…009</span> in the
              SQL Editor, <span className="text-white/85 font-semibold">in numeric order</span>. Migration 003 creates the signup
              trigger — skip it and <span className="text-white/85">every login fails</span>.
            </li>
            <li>
              Run <span className="font-mono text-white/80">seed/seed_12_courses.sql</span>, then{' '}
              <span className="font-mono text-white/80">seed/seed_curriculum.sql</span>.
            </li>
            <li>
              Run <span className="font-mono text-white/80">seed/publish_courses.sql</span>.{' '}
              <span className="text-amber-200/90">Seeded courses are drafts, and row-level security hides drafts from
              visitors</span> — without this step the storefront is empty even though the data is there.
            </li>
            <li>
              Register on the site, then run <span className="font-mono text-white/80">seed/make_admin.sql</span> with your email.
              New accounts are always students, so <span className="text-amber-200/90">this is the only way to reach /admin/login</span>.
            </li>
            <li>
              Set <span className="font-mono text-white/80">VITE_SUPABASE_URL</span> and{' '}
              <span className="font-mono text-white/80">VITE_SUPABASE_ANON_KEY</span> (the <span className="font-semibold">anon/publishable</span> key,
              never the secret one) in <span className="font-mono text-white/80">.env</span>, or in your host’s environment variables.
            </li>
            <li>
              <span className="text-white/85 font-semibold">Rebuild and redeploy.</span> Vite inlines these at build time, so a
              restart alone is not enough on a hosted deploy.
            </li>
          </ol>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <Link
            to="/backend-status"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-xs transition hover:brightness-110"
          >
            <Stethoscope className="h-3.5 w-3.5" /> RUN BACKEND DIAGNOSTICS
          </Link>
          <p className="text-[11px] text-white/30 max-w-[280px]">
            Already configured but still broken? Diagnostics tests the connection and names the failing layer.
          </p>
        </div>

        <p className="text-[11px] text-white/30 text-center">
          No demo data is shown — all accounts, courses and payments live in the database.
        </p>
      </div>
    </div>
  );
}
