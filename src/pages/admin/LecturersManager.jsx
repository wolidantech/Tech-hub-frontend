import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Ban, CheckCircle2, Loader2, MailPlus, RefreshCw, UserPlus } from 'lucide-react';
import { fetchCourses } from '../../lib/store';
import { fetchProfiles } from '../../lib/store';
import {
  adminAssignCourse, adminPromoteLecturer, adminSetLecturerEnabled, adminUnassignCourse,
  fetchAssignmentMap, fetchLecturers, inviteLecturer,
} from '../../lib/lecturer';
import { toast } from 'sonner';

const input = 'w-full min-h-11 rounded-xl glass px-3.5 text-sm min-w-0 focus:outline-none focus:border-cyan-400/50';

export default function LecturersManager() {
  const [lecturers, setLecturers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [invite, setInvite] = useState({ fullName: '', email: '' });
  const [promoteId, setPromoteId] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [ls, ps, cs, as] = await Promise.all([fetchLecturers(), fetchProfiles(), fetchCourses(), fetchAssignmentMap()]);
      setLecturers(ls); setProfiles(ps); setCourses(cs); setAssignments(as);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (key, fn, msg) => {
    if (busy) return; setBusy(key);
    try { await fn(); toast.success(msg); await load(); }
    catch (err) { setError(err.message); toast.error(err.message); }
    finally { setBusy(''); }
  };
  const assignedIds = (id) => new Set(assignments.filter((a) => a.lecturer_id === id && a.active).map((a) => a.course_id));
  const candidates = profiles.filter((p) => p.role === 'student');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-bold text-xl">Lecturers</h2><p className="text-sm text-white/50">Lecturers get a separate dashboard, never administrator access.</p></div>
        <button onClick={load} disabled={loading} className="min-h-11 rounded-full glass px-4 text-xs font-bold inline-flex items-center gap-2 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> REFRESH</button>
      </div>
      {error && <div role="alert" className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100 flex gap-2"><AlertTriangle className="h-5 w-5 shrink-0" /><span className="break-words min-w-0">{error}</span></div>}

      <section className="glass rounded-3xl p-5 sm:p-6">
        <h3 className="font-bold flex items-center gap-2"><MailPlus className="h-5 w-5 text-cyan-300" /> Invite a new lecturer</h3>
        <p className="mt-1 text-xs leading-relaxed text-white/50">This sends a secure Supabase invitation through the server-side <code>invite-lecturer</code> Edge Function. If that function is not deployed, you will see a clear error — use “Promote existing account” instead. No service-role key is used in this browser app.</p>
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); act('invite', () => inviteLecturer(invite), 'Lecturer invitation sent.'); setInvite({ fullName: '', email: '' }); }}>
          <input aria-label="Lecturer full name" autoComplete="name" className={input} required value={invite.fullName} onChange={(e) => setInvite({ ...invite, fullName: e.target.value })} placeholder="Lecturer full name" />
          <input aria-label="Lecturer email" autoComplete="email" autoCapitalize="none" spellCheck={false} type="email" className={input} required value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} placeholder="lecturer@example.com" />
          <button disabled={!!busy} className="min-h-11 rounded-full bg-white px-5 text-xs font-black text-black disabled:opacity-60">{busy === 'invite' ? 'SENDING…' : 'SEND INVITE'}</button>
        </form>
        <div className="mt-5 border-t border-white/10 pt-5">
          <h4 className="text-sm font-bold flex items-center gap-2"><UserPlus className="h-4 w-4 text-cyan-300" /> Promote an existing registered account</h4>
          <div className="mt-3 flex flex-col min-[560px]:flex-row gap-2">
            <select aria-label="Existing account to promote" className={input} value={promoteId} onChange={(e) => setPromoteId(e.target.value)}>
              <option value="">Select an existing student account…</option>
              {candidates.map((p) => <option key={p.id} value={p.id}>{p.fullName} — {p.email}</option>)}
            </select>
            <button disabled={!promoteId || !!busy} onClick={() => act('promote', () => adminPromoteLecturer(promoteId), 'Account promoted to lecturer. Their student records were not changed.')} className="min-h-11 shrink-0 rounded-full glass px-5 text-xs font-black disabled:opacity-60">PROMOTE</button>
          </div>
        </div>
      </section>

      {loading ? <div className="glass rounded-3xl p-6 text-sm text-white/55 flex gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading lecturers…</div> : (
        <div className="space-y-4">
          {lecturers.map((lec) => {
            const ids = assignedIds(lec.id);
            const enabled = lec.lecturer_enabled !== false && !lec.banned;
            return (
              <article key={lec.id} className="glass rounded-3xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0"><h3 className="font-bold break-words">{lec.full_name}</h3><p className="text-xs text-white/50 break-all">{lec.email}</p></div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${enabled ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}`}>{enabled ? 'ACCESS ENABLED' : 'ACCESS DISABLED'}</span>
                </div>
                <h4 className="mt-5 text-[11px] font-bold tracking-widest text-white/45">ASSIGNED COURSES ({ids.size})</h4>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((c) => {
                    const on = ids.has(c.id);
                    return <button key={c.id} disabled={!!busy} onClick={() => act(`${lec.id}-${c.id}`, () => on ? adminUnassignCourse(lec.id, c.id) : adminAssignCourse(lec.id, c.id), on ? 'Course removed from lecturer.' : 'Course assigned to lecturer.')} className={`min-h-11 rounded-xl border px-3 text-left text-xs font-bold disabled:opacity-60 ${on ? 'border-cyan-300/50 bg-cyan-400/10 text-cyan-100' : 'border-white/10 bg-white/[0.03] text-white/60'}`}>{on ? '✓ ' : ''}{c.title}</button>;
                  })}
                </div>
                <button disabled={!!busy} onClick={() => act(`enable-${lec.id}`, () => adminSetLecturerEnabled(lec.id, !enabled), enabled ? 'Lecturer access disabled.' : 'Lecturer access enabled.')} className="mt-5 min-h-11 rounded-full glass px-4 text-xs font-black inline-flex items-center gap-2 disabled:opacity-60">
                  {enabled ? <><Ban className="h-4 w-4" /> DISABLE LECTURER ACCESS</> : <><CheckCircle2 className="h-4 w-4" /> ENABLE LECTURER ACCESS</>}
                </button>
              </article>
            );
          })}
          {!lecturers.length && <div className="glass rounded-3xl p-6 text-sm text-white/55">No lecturer accounts yet. Invite one above, or promote an existing account.</div>}
        </div>
      )}
    </div>
  );
}
