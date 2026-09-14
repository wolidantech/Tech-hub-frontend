import { useState } from 'react';
import { Plus, X, Trash2, PenLine, Eye, Download, FileText, CheckCircle2 } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useLMS } from '../../context/LMSContext';
import { useAuth } from '../../context/AuthContext';
import SignedFile from '../../components/common/SignedFile';
import { toast } from 'sonner';

export default function AssignmentReview() {
  const { user, students: roster } = useAuth();
  const { courses, sendNotificationToUser } = useCourses();
  const { assignments, submissions, createAssignment, updateAssignment, deleteAssignment, reviewSubmission, audit, practicalSubs, reviewPractical } = useLMS();
  const [tab, setTab] = useState('review');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ courseId: '', title: '', description: '', instructions: '', requiredOutput: '', maxScore: 100, isFinalProject: false, deadline: '', submissionType: 'any' });
  const [reviewing, setReviewing] = useState(null);
  const [review, setReview] = useState({ status: 'approved', score: '', feedback: '' });
  const [viewing, setViewing] = useState(null);
  const [pReviewing, setPReviewing] = useState(null);
  const [pReview, setPReview] = useState({ status: 'approved', score: '', feedback: '' });

  const nameOf = (id) => roster.find((u) => u.id === id)?.fullName || String(id || '').slice(0, 8);

  const filteredSubs = submissions.filter((s) => statusFilter === 'all' || s.status === statusFilter);

  const handleCreate = async () => {
    if (!form.courseId || !form.title.trim()) { toast.error('Course and title required'); return; }
    try {
      const a = await createAssignment({ ...form });
    audit(user, 'assignment.create', 'assignment', a.id, { title: form.title });
    setShowAdd(false);
      setForm({ courseId: '', title: '', description: '', instructions: '', requiredOutput: '', maxScore: 100, isFinalProject: false, deadline: '', submissionType: 'any' });
      toast.success('Assignment created & published');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openReview = (s) => {
    setReviewing(s);
    setReview({ status: s.status === 'submitted' ? 'under_review' : s.status, score: s.score ?? '', feedback: s.feedback || '' });
  };

  const submitReview = async () => {
    if (!review.feedback.trim() && review.status === 'needs_revision') { toast.error('Feedback is required when requesting revision'); return; }
    try {
      await reviewSubmission({ submissionId: reviewing.id, status: review.status, score: review.score === '' ? null : Number(review.score), feedback: review.feedback, actor: user });
    const asg = assignments.find((a) => a.id === reviewing.assignmentId);
      await sendNotificationToUser(reviewing.userId, {
      title: review.status === 'approved' ? 'Assignment Approved! ✅' : review.status === 'needs_revision' ? 'Assignment Needs Revision 📝' : 'Assignment Under Review 👀',
      message: review.status === 'approved'
        ? `Great work! Your submission for "${asg?.title}" was approved${review.score !== '' ? ` with a score of ${review.score}` : ''}. ${review.feedback}`
        : `Your submission for "${asg?.title}" was marked ${review.status.replace('_', ' ')}. Feedback: ${review.feedback}`,
        type: 'assignment_reviewed', courseId: reviewing.courseId,
      });
      setReviewing(null);
      toast.success('Review submitted — student notified');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex gap-2">
          <button onClick={() => setTab('review')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${tab === 'review' ? 'bg-white text-black' : 'glass text-white/60'}`}>REVIEWS ({submissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length} pending)</button>
          <button onClick={() => setTab('manage')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${tab === 'manage' ? 'bg-white text-black' : 'glass text-white/60'}`}>ASSIGNMENTS ({assignments.length})</button>
          <button onClick={() => setTab('practicals')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${tab === 'practicals' ? 'bg-white text-black' : 'glass text-white/60'}`}>🧪 PRACTICALS ({practicalSubs.filter((p) => p.status === 'submitted' || p.status === 'under_review' || p.status === 'needs_revision').length} pending)</button>
        </div>
        {tab === 'manage' && <button onClick={() => setShowAdd(true)} className="btn-primary !py-2.5 !px-5 text-xs gap-2"><Plus className="h-4 w-4" /> CREATE ASSIGNMENT</button>}
      </div>

      {tab === 'review' && (
        <>
          <div className="flex gap-2 flex-wrap">
            {['all', 'submitted', 'under_review', 'approved', 'needs_revision'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-full text-xs font-bold ${statusFilter === s ? 'bg-white text-black' : 'glass text-white/60'}`}>
                {s.replace('_', ' ').toUpperCase()} ({s === 'all' ? submissions.length : submissions.filter((x) => x.status === s).length})
              </button>
            ))}
          </div>
          <div className="grid gap-3">
            {filteredSubs.map((s) => {
              const course = courses.find((c) => c.id === s.courseId);
              const asg = assignments.find((a) => a.id === s.assignmentId);
              return (
                <div key={s.id} className="glass rounded-[20px] p-4 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[240px]">
                    <div className="font-bold text-sm">{nameOf(s.userId)} <span className="text-white/40 font-normal">• {asg?.title || 'Assignment'} {asg?.isFinalProject ? '(FINAL PROJECT)' : ''}</span></div>
                    <div className="text-xs text-white/40 mt-1">{course?.title} • {(s.kind || 'file') === 'file' ? `📎 ${s.fileName} (${s.fileSize ? (s.fileSize / 1024).toFixed(0) : 0} KB)` : (s.kind === 'link' ? `🔗 ${String(s.linkUrl).slice(0, 40)}` : '📝 text answer')} • {new Date(s.submittedAt).toLocaleString()} {s.late && '• LATE'}</div>
                    {s.score != null && <div className="text-xs text-amber-300 font-bold mt-1">Score: {s.score}</div>}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${s.status === 'approved' ? 'bg-green-500/20 text-green-300' : s.status === 'needs_revision' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>{s.status.replace('_', ' ').toUpperCase()}</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => setViewing(s)} className="h-9 px-3 rounded-full glass text-xs font-bold flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> VIEW</button>
                    <button onClick={() => openReview(s)} className="h-9 px-4 rounded-full bg-white text-black text-xs font-bold">REVIEW</button>
                  </div>
                </div>
              );
            })}
            {filteredSubs.length === 0 && <div className="glass rounded-2xl p-10 text-center text-white/40 text-sm">No submissions found.</div>}
          </div>
        </>
      )}

      {tab === 'practicals' && (
        <>
          <div className="grid gap-3">
            {practicalSubs.map((ps) => {
              const course = courses.find((c) => c.id === ps.courseId);
              return (
                <div key={ps.id} className="glass rounded-[20px] p-4 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[240px]">
                    <div className="font-bold text-sm">{nameOf(ps.userId)} <span className="text-white/40 font-normal">• practical submission</span></div>
                    <div className="text-xs text-white/40 mt-1">{course?.title || 'Course'} • {ps.fileName ? `📎 ${ps.fileName} (${ps.fileSize ? (ps.fileSize / 1024).toFixed(0) : 0} KB)` : '📝 text only'} • {new Date(ps.submittedAt).toLocaleString()}</div>
                    {ps.observation && <div className="mt-2 text-xs text-white/60 bg-white/[0.03] border border-white/10 rounded-xl p-2.5 max-h-28 overflow-auto whitespace-pre-line">{ps.observation}</div>}
                    {ps.score != null && <div className="text-xs text-amber-300 font-bold mt-1">Score: {ps.score}/100</div>}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${ps.status === 'approved' ? 'bg-green-500/20 text-green-300' : ps.status === 'needs_revision' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>{ps.status.replace('_', ' ').toUpperCase()}</span>
                  {ps.storagePath && <SignedFile bucket="submissions" path={ps.storagePath} fileName={ps.fileName} fileType={ps.fileType} className="w-full" />}
                  <div className="flex gap-1.5">
                    <button onClick={() => { setPReviewing(ps); setPReview({ status: ps.status === 'submitted' ? 'under_review' : ps.status, score: ps.score ?? '', feedback: ps.feedback || '' }); }} className="h-9 px-4 rounded-full bg-white text-black text-xs font-bold">REVIEW</button>
                  </div>
                </div>
              );
            })}
            {practicalSubs.length === 0 && <div className="glass rounded-2xl p-10 text-center text-white/40 text-sm">No practical submissions yet — they appear here when students submit lesson practicals.</div>}
          </div>
          {pReviewing && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xl p-0 sm:p-6">
              <div className="w-full max-w-[560px] max-h-[92dvh] overflow-auto glass-strong rounded-t-[24px] sm:rounded-[24px] p-6 space-y-4">
                <div className="flex justify-between"><h3 className="font-bold">Review practical — {nameOf(pReviewing.userId)}</h3><button onClick={() => setPReviewing(null)}><X className="h-5 w-5" /></button></div>
                {pReviewing.observation && <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-sm whitespace-pre-line max-h-56 overflow-auto">{pReviewing.observation}</div>}
                <select value={pReview.status} onChange={(e) => setPReview({ ...pReview, status: e.target.value })} className="w-full h-11 rounded-full glass px-4 text-sm">
                  <option className="bg-[#061236]" value="under_review">Under Review</option>
                  <option className="bg-[#061236]" value="approved">Approved ✓</option>
                  <option className="bg-[#061236]" value="needs_revision">Revision Required</option>
                </select>
                <input type="number" min="0" max="100" value={pReview.score} onChange={(e) => setPReview({ ...pReview, score: e.target.value })} placeholder="Score / 100 (optional)" className="w-full h-11 rounded-full glass px-4 text-sm" />
                <textarea value={pReview.feedback} onChange={(e) => setPReview({ ...pReview, feedback: e.target.value })} placeholder="Feedback for the student" className="w-full rounded-2xl glass p-4 text-sm h-24" />
                <button
                  onClick={async () => {
                    if (!pReview.feedback.trim() && pReview.status === 'needs_revision') { toast.error('Feedback is required when requesting revision'); return; }
                    try {
                      await reviewPractical({ submissionId: pReviewing.id, status: pReview.status, score: pReview.score === '' ? null : Number(pReview.score), feedback: pReview.feedback, actor: user });
                      await sendNotificationToUser(pReviewing.userId, {
                        title: pReview.status === 'approved' ? 'Practical Approved! 🧪✅' : pReview.status === 'needs_revision' ? 'Practical Needs Revision 🧪' : 'Practical Under Review 👀',
                        message: `${pReview.status === 'approved' ? `Great lab work! Your practical was approved${pReview.score !== '' ? ` with a score of ${pReview.score}/100` : ''}.` : pReview.status === 'needs_revision' ? `Your practical needs another pass. Feedback: ${pReview.feedback}` : 'Your practical is being reviewed.'}`,
                        type: 'assignment_reviewed', courseId: pReviewing.courseId,
                      });
                      setPReviewing(null);
                      toast.success('Practical review saved — student notified');
                    } catch (err) { toast.error(err.message); }
                  }}
                  className="w-full btn-primary !py-3"
                >SAVE REVIEW</button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'manage' && (
        <>
          {showAdd && (
            <div className="glass-strong rounded-[20px] p-6 space-y-4">
              <div className="flex justify-between"><h3 className="font-bold">Create Assignment</h3><button onClick={() => setShowAdd(false)}><X className="h-5 w-5" /></button></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="h-11 rounded-full glass px-4 text-sm sm:col-span-2">
                  <option className="bg-[#061236]" value="">Select course</option>
                  {courses.map((c) => <option className="bg-[#061236]" key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" className="h-11 rounded-full glass px-4 text-sm sm:col-span-2" />
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" className="h-11 rounded-full glass px-4 text-sm sm:col-span-2" />
                <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Instructions (step by step)" className="rounded-2xl glass p-4 text-sm h-24 sm:col-span-2" />
                <input value={form.requiredOutput} onChange={(e) => setForm({ ...form, requiredOutput: e.target.value })} placeholder="Required output" className="h-11 rounded-full glass px-4 text-sm" />
                <input type="number" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })} placeholder="Max score" className="h-11 rounded-full glass px-4 text-sm" />
                <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} title="Deadline (optional)" className="h-11 rounded-full glass px-4 text-sm" />
                <select value={form.submissionType} onChange={(e) => setForm({ ...form, submissionType: e.target.value })} className="h-11 rounded-full glass px-4 text-sm">
                  <option className="bg-[#061236]" value="any">Accept: File + Text + Link</option>
                  <option className="bg-[#061236]" value="file">File only</option>
                  <option className="bg-[#061236]" value="text">Text only</option>
                  <option className="bg-[#061236]" value="link">Link only</option>
                </select>
                <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.isFinalProject} onChange={(e) => setForm({ ...form, isFinalProject: e.target.checked })} className="h-4 w-4" /> This is the FINAL PROJECT for the course</label>
              </div>
              <button onClick={handleCreate} className="btn-primary w-full">CREATE ASSIGNMENT</button>
            </div>
          )}
          <div className="grid gap-3">
            {assignments.map((a) => {
              const course = courses.find((c) => c.id === a.courseId);
              const n = submissions.filter((s) => s.assignmentId === a.id).length;
              return (
                <div key={a.id} className="glass rounded-[20px] p-4 flex flex-wrap items-center gap-4">
                  <PenLine className="h-5 w-5 text-amber-300" />
                  <div className="flex-1 min-w-[220px]">
                    <div className="font-bold text-sm">{a.title} {a.isFinalProject && <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">FINAL PROJECT</span>}</div>
                    <div className="text-xs text-white/40 mt-1">{course?.title} • {n} submissions • Max {a.maxScore}</div>
                  </div>
                  <button onClick={async () => { try { await updateAssignment(a.id, { status: a.status === 'published' ? 'draft' : 'published' }); } catch (err) { toast.error(err.message); } }} className="h-9 px-3 rounded-full glass text-xs font-bold">{a.status === 'published' ? 'UNPUBLISH' : 'PUBLISH'}</button>
                  <button onClick={async () => { if (confirm('Delete assignment?')) { try { await deleteAssignment(a.id); audit(user, 'assignment.delete', 'assignment', a.id, {}); toast.success('Deleted'); } catch (err) { toast.error(err.message); } } }} className="h-9 w-9 rounded-full glass flex items-center justify-center text-red-300"><Trash2 className="h-4 w-4" /></button>
                </div>
              );
            })}
            {assignments.length === 0 && <div className="glass rounded-2xl p-10 text-center text-white/40 text-sm">No assignments yet. Create one — or generate with AI Studio.</div>}
          </div>
        </>
      )}

      {/* File viewer */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-[700px] max-h-[90vh] overflow-auto glass-strong rounded-[24px] p-6 space-y-4">
            <div className="flex justify-between items-center"><h3 className="font-bold">{(viewing.kind || 'file') === 'file' ? viewing.fileName : (viewing.kind === 'link' ? 'Link submission' : 'Text submission')} {(viewing.late) && <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px]">LATE</span>}</h3><button onClick={() => setViewing(null)}><X className="h-5 w-5" /></button></div>
            <div className="text-xs text-white/50">{nameOf(viewing.userId)} • {(viewing.kind || 'file').toUpperCase()} • {viewing.fileSize ? `${(viewing.fileSize / 1024).toFixed(0)} KB • ` : ''}{new Date(viewing.submittedAt).toLocaleString()}</div>
            {viewing.note && <div className="rounded-xl bg-white/[0.04] p-3 text-sm">"{viewing.note}"</div>}
            {viewing.kind === 'text' && <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm whitespace-pre-line max-h-[400px] overflow-auto">{viewing.textContent}</div>}
            {viewing.kind === 'link' && <a href={viewing.linkUrl} target="_blank" rel="noreferrer" className="block rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4 text-cyan-300 text-sm break-all underline">{viewing.linkUrl}</a>}
            {(viewing.kind || 'file') === 'file' && (
              viewing.storagePath ? (
                <SignedFile bucket="submissions" path={viewing.storagePath} fileType={viewing.fileType} fileName={viewing.fileName} />
              ) : (
                <div className="p-6 text-center text-sm text-white/40">File unavailable.</div>
              )
            )}
            <div className="flex gap-2">
              <button onClick={() => setViewing(null)} className="flex-1 h-11 rounded-full glass font-bold text-sm">CLOSE</button>
              <button onClick={() => { openReview(viewing); setViewing(null); }} className="flex-1 h-11 rounded-full bg-white text-black font-bold text-sm">REVIEW NOW</button>
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-[520px] glass-strong rounded-[24px] p-6 space-y-4">
            <div className="flex justify-between items-center"><h3 className="font-bold text-lg">Review Submission</h3><button onClick={() => setReviewing(null)}><X className="h-5 w-5" /></button></div>
            <div className="text-sm text-white/50">{nameOf(reviewing.userId)} • {reviewing.fileName}</div>
            <div>
              <label className="text-xs font-bold text-white/40">STATUS</label>
              <div className="flex gap-2 mt-1">
                {[{ id: 'under_review', label: 'Under Review' }, { id: 'approved', label: 'Approved' }, { id: 'needs_revision', label: 'Needs Revision' }].map((s) => (
                  <button key={s.id} onClick={() => setReview({ ...review, status: s.id })} className={`flex-1 h-10 rounded-full text-xs font-bold ${review.status === s.id ? 'bg-white text-black' : 'glass text-white/60'}`}>{s.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-white/40">SCORE</label>
              <input type="number" value={review.score} onChange={(e) => setReview({ ...review, score: e.target.value })} placeholder="e.g. 85" className="mt-1 w-full h-11 rounded-full glass px-4 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-white/40">FEEDBACK / COMMENTS</label>
              <textarea value={review.feedback} onChange={(e) => setReview({ ...review, feedback: e.target.value })} placeholder="What did they do well? What should improve?" className="mt-1 w-full rounded-2xl glass p-4 text-sm h-28" />
            </div>
            <button onClick={submitReview} className="w-full btn-primary !py-3"><CheckCircle2 className="h-4 w-4 mr-2" /> SUBMIT REVIEW</button>
          </div>
        </div>
      )}
    </div>
  );
}
