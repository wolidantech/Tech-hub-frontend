import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, Loader2, RefreshCw, Send, XCircle } from 'lucide-react';
import {
  adminPublishContent, adminReleaseGrade, adminReviewContent, adminReviewGrade, fetchReviewEvents, fetchReviewQueue,
} from '../../lib/lecturer';
import { prettyStatus } from '../LecturerDashboard';
import { toast } from 'sonner';

const Chip = ({ status }) => <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide">{prettyStatus(status)}</span>;

export default function ReviewQueue() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [reasons, setReasons] = useState({});
  const [events, setEvents] = useState({});
  const [filter, setFilter] = useState('pending_review');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setItems(await fetchReviewQueue()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (key, fn, msg) => {
    if (busy) return; setBusy(key);
    try { await fn(); toast.success(msg); await load(); }
    catch (err) { setError(err.message); toast.error(err.message); }
    finally { setBusy(''); }
  };
  const visible = items.filter((i) => filter === 'all' || i.status === filter);
  const titleOf = (i) => i.title || i.payload?.title || (i.kind === 'grading' ? 'Assignment marking' : i.item_type);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-bold text-xl">Review Queue</h2><p className="text-sm text-white/50">Approve the exact submitted version, then publish content or release marks as a separate step.</p></div>
        <button onClick={load} disabled={loading} className="min-h-11 rounded-full glass px-4 text-xs font-bold inline-flex items-center gap-2 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> REFRESH</button>
      </div>
      {error && <div role="alert" className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100 flex gap-2"><AlertTriangle className="h-5 w-5 shrink-0" /><span className="break-words min-w-0">{error}</span></div>}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[['pending_review', 'Pending Review'], ['approved', 'Approved — ready to publish/release'], ['published', 'Published'], ['released', 'Released'], ['changes_requested', 'Changes Requested'], ['rejected', 'Rejected'], ['all', 'All']].map(([id, text]) => (
          <button key={id} onClick={() => setFilter(id)} className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-bold ${filter === id ? 'bg-white text-black' : 'glass text-white/65'}`}>{text}</button>
        ))}
      </div>

      {loading ? <div className="glass rounded-3xl p-6 text-sm text-white/55 flex gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading review queue…</div> : (
        <div className="space-y-4">
          {visible.map((item) => {
            const key = `${item.kind}-${item.id}`;
            const reason = reasons[key] || '';
            const lecturer = item.profiles?.full_name || 'Lecturer';
            const courseTitle = item.courses?.title || '';
            return (
              <article key={key} className="glass rounded-3xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold break-words">{titleOf(item)}</h3>
                    <p className="mt-1 text-xs text-white/50 break-words">{lecturer} • {courseTitle} • {item.kind === 'grading' ? 'Marking' : item.item_type} • Submitted {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : 'not submitted'} </p>
                  </div><Chip status={item.status} />
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <section className="rounded-2xl bg-black/25 p-4">
                    <h4 className="text-[11px] font-black tracking-widest text-white/45 flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> SUBMITTED VERSION (v{item.submitted_version || item.revision_version})</h4>
                    {item.kind === 'content' ? <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-white/70">{JSON.stringify(item.payload, null, 2)}</pre>
                      : <div className="mt-2 text-sm text-white/75 space-y-2"><p>Proposed score: <b className="text-white">{item.proposed_score}</b></p><p className="whitespace-pre-wrap break-words">Feedback: {item.proposed_feedback || '—'}</p><p className="text-xs text-white/45">Submission ID: {item.submission_id}</p></div>}
                  </section>
                  <section className="rounded-2xl bg-white/[0.04] p-4">
                    <h4 className="text-[11px] font-black tracking-widest text-white/45">EXISTING LIVE VERSION / COMPARISON</h4>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                      {item.kind === 'grading'
                        ? 'The student’s official score and feedback remain unchanged until you approve and then release this marking.'
                        : item.operation === 'create' ? 'This is a new item. Nothing is live for students yet.'
                        : item.operation === 'delete' ? `Deletion requested for live item ${item.target_id}. The live item stays available until you publish this approved deletion.`
                        : `Revision of live item ${item.target_id}. Students keep seeing the current live version; publishing replaces it with the exact approved payload shown here.`}
                    </p>
                    {item.review_reason && <p className="mt-3 text-sm text-orange-200">Previous reviewer note: {item.review_reason}</p>}
                    <button className="mt-4 min-h-10 rounded-full glass px-3 text-[11px] font-bold" onClick={async () => { try { setEvents({ ...events, [key]: await fetchReviewEvents(item.id) }); } catch (e) { setError(e.message); } }}>VIEW ACTIVITY HISTORY</button>
                    {(events[key] || []).map((ev) => <p key={ev.id} className="mt-2 text-[11px] text-white/50">{new Date(ev.created_at).toLocaleString()} — {ev.action}: {prettyStatus(ev.from_status || '')} → {prettyStatus(ev.to_status || '')}{ev.comment ? ` — “${ev.comment}”` : ''}</p>)}
                  </section>
                </div>

                {item.status === 'pending_review' && (
                  <div className="mt-4 space-y-3">
                    <textarea aria-label="Review reason" rows={3} className="w-full rounded-xl glass px-3.5 py-3 text-sm min-w-0" value={reason} onChange={(e) => setReasons({ ...reasons, [key]: e.target.value })} placeholder="Reason / requested changes (required unless approving)" />
                    <div className="flex flex-col min-[560px]:flex-row gap-2">
                      <button disabled={!!busy} onClick={() => act(`${key}-approve`, () => item.kind === 'content' ? adminReviewContent(item.id, 'approved', reason) : adminReviewGrade(item.id, 'approved', reason), 'Approved. Now publish/release it as the final step.')} className="min-h-11 flex-1 rounded-full bg-emerald-400 px-4 text-xs font-black text-black disabled:opacity-60 inline-flex justify-center items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> APPROVE</button>
                      <button disabled={!!busy} onClick={() => act(`${key}-changes`, () => item.kind === 'content' ? adminReviewContent(item.id, 'changes_requested', reason) : adminReviewGrade(item.id, 'changes_requested', reason), 'Changes requested from lecturer.')} className="min-h-11 flex-1 rounded-full glass px-4 text-xs font-black disabled:opacity-60">REQUEST CHANGES</button>
                      <button disabled={!!busy} onClick={() => act(`${key}-reject`, () => item.kind === 'content' ? adminReviewContent(item.id, 'rejected', reason) : adminReviewGrade(item.id, 'rejected', reason), 'Submission rejected.')} className="min-h-11 flex-1 rounded-full glass px-4 text-xs font-black text-rose-200 disabled:opacity-60 inline-flex justify-center items-center gap-1.5"><XCircle className="h-4 w-4" /> REJECT</button>
                    </div>
                  </div>
                )}
                {item.status === 'approved' && (
                  <button disabled={!!busy} onClick={() => act(`${key}-publish`, () => item.kind === 'content' ? adminPublishContent(item.id) : adminReleaseGrade(item.id), item.kind === 'content' ? 'Published to students.' : 'Marks released to the student.')} className="mt-4 min-h-11 w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-4 text-xs font-black text-[#020617] disabled:opacity-60 inline-flex justify-center items-center gap-2"><Send className="h-4 w-4" /> {item.kind === 'content' ? 'PUBLISH APPROVED VERSION' : 'RELEASE APPROVED MARKS'}</button>
                )}
              </article>
            );
          })}
          {!visible.length && <div className="glass rounded-3xl p-6 text-sm text-white/55">Nothing here for this filter. New lecturer submissions appear automatically and also create an admin notification.</div>}
        </div>
      )}
    </div>
  );
}
