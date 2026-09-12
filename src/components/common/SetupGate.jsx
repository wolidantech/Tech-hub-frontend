import { Database, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

// Blocks the entire app when the Supabase backend is not configured.
// The app NEVER runs on localStorage/mock data — the database is the only
// source of truth, so without it we show setup instructions instead.
export default function SetupGate({ children }) {
  if (isSupabaseConfigured()) return children;
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020a1f]">
      <div className="w-full max-w-[560px] glass-strong rounded-[24px] p-8 space-y-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mx-auto">
          <Database className="h-8 w-8" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl">Backend Setup Required</h1>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">
            WOLI DAN TECH HUB runs on a secure Supabase database. The administrator must
            configure the backend before the app can start.
          </p>
        </div>
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-left">
          <div className="font-bold text-amber-300 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Administrator checklist
          </div>
          <ol className="mt-2 text-xs text-white/60 space-y-1.5 list-decimal pl-5">
            <li>Create a Supabase project and run <span className="font-mono">supabase/migrations/*.sql</span> in order</li>
            <li>Run the seed script: <span className="font-mono">node supabase/seed.mjs</span></li>
            <li>Set <span className="font-mono">VITE_SUPABASE_URL</span> and <span className="font-mono">VITE_SUPABASE_ANON_KEY</span> in <span className="font-mono">.env</span></li>
            <li>See <span className="font-mono">SUPABASE_SETUP.md</span> for the full guide</li>
          </ol>
        </div>
        <p className="text-[11px] text-white/30">No demo data is shown — all accounts, courses and payments live in the database.</p>
      </div>
    </div>
  );
}
