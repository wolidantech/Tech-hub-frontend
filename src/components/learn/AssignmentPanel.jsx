import LessonBody from './LessonBody';
import { useState } from 'react';
import { Upload, FileText, CheckCircle2, Clock, AlertTriangle, Award, Link2, Type } from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { validateSubmissionFile } from '../../lib/lms';
import SignedFile from '../common/SignedFile';
import { toast } from 'sonner';

const STATUS_META = {
  submitted: { label: 'SUBMITTED', cls: 'bg-blue-500/20 border-blue-500/30 text-blue-300', icon: Clock },
  under_review: { label: 'UNDER REVIEW', cls: 'bg-amber-500/20 border-amber-500/30 text-amber-300', icon: Clock },
  approved: { label: 'APPROVED', cls: 'bg-green-500/20 border-green-500/30 text-green-300', icon: CheckCircle2 },
  needs_revision: { label: 'NEEDS REVISION', cls: 'bg-red-500/20 border-red-500/30 text-red-300', icon: AlertTriangle },
};

const KIND_META = {
  file: { label: 'FILE', icon: Upload },
  text: { label: 'TEXT', icon: Type },
  link: { label: 'LINK', icon: Link2 },
};

export default function AssignmentPanel({ assignment, user, onSubmitted }) {
  const { submitAssignment, getUserSubmissions } = useLMS();
  const allowed = assignment.submissionType && assignment.submissionType !== 'any' ? [assignment.submissionType] : ['file', 'text', 'link'];
  const [kind, setKind] = useState(allowed[0]);
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [succeeded, setSucceeded] = useState(false);
  const subs = getUserSubmissions(user.id).filter((s) => s.assignmentId === assignment.id);
  const latest = subs[0];

  const overdue = assignment.deadline && new Date() > new Date(assignment.deadline);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const check = validateSubmissionFile(f);
    if (!check.ok) {
      toast.error(check.error);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (uploading) return;
    setSubmitError(''); setSucceeded(false); setUploadProgress(0);
    if (kind === 'file' && !file) { toast.error('Please select a file to upload'); return; }
    setUploading(true);
    try {
      await submitAssignment({
        assignmentId: assignment.id, userId: user.id, studentName: user.fullName,
        kind, file, textContent, linkUrl, note, onUploadProgress: setUploadProgress,
      });
      setFile(null); setTextContent(''); setLinkUrl(''); setNote('');
      setSucceeded(true);
      ev.target.reset();
      toast.success(overdue ? 'Submitted late ⚠️ — instructor will review.' : 'Assignment submitted! 🎉 Awaiting review.');
      onSubmitted?.();
    } catch (err) {
      setSubmitError(err.message);
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-bold flex items-center gap-2"><FileText className="h-4 w-4 text-cyan-300" /> {assignment.isFinalProject ? 'FINAL PRACTICAL / PROJECT' : 'ASSIGNMENT'}</h4>
          <div className="flex gap-2">
            {assignment.isFinalProject && <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold">FINAL PROJECT</span>}
            {assignment.deadline && (
              <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${overdue ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
                📅 Due {new Date(assignment.deadline).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="text-sm font-bold">{assignment.title}</div>
        <p className="text-sm text-white/60 leading-relaxed">{assignment.description}</p>
        {assignment.instructions && (
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <div className="text-[11px] font-bold tracking-widest text-white/40 mb-2">INSTRUCTIONS</div>
            <LessonBody markdown={assignment.instructions} />
          </div>
        )}
        {assignment.requiredOutput && (
          <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/20 p-4">
            <div className="text-[11px] font-bold tracking-widest text-cyan-300/70 mb-1">REQUIRED OUTPUT</div>
            <div className="text-sm text-white/80">{assignment.requiredOutput}</div>
          </div>
        )}
        <div className="text-[11px] text-white/40">
          {allowed.includes('file') && 'Files: JPG, PNG, PDF, MP4, ZIP, DOCX, PPTX, XLSX • Max 25MB • '}
          Accepts: {allowed.join(', ').toUpperCase()} • Max score: {assignment.maxScore}
        </div>
      </div>

      {succeeded && <p role="status" className="text-green-200">Submission saved. Awaiting instructor review.</p>}
      {!latest && <p className="text-sm text-white/60">Status: Pending — not submitted</p>}
      {/* Submission history + feedback */}
      {subs.length > 0 && (
        <div className="space-y-2">
          {subs.map((s, idx) => {
            const meta = STATUS_META[s.status] || STATUS_META.submitted;
            const Icon = meta.icon;
            const sk = s.kind || 'file';
            const KIcon = KIND_META[sk]?.icon || Upload;
            return (
              <div key={s.id} className="glass rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm flex flex-wrap items-center gap-2 min-w-0 break-words">
                    <KIcon className="h-3.5 w-3.5 text-cyan-300" />
                    <span className="font-bold">
                      {sk === 'file' ? s.fileName : sk === 'link' ? <a href={s.linkUrl} target="_blank" rel="noreferrer" className="min-h-11 inline-flex items-center text-cyan-300 underline break-all">{s.linkUrl}</a> : `Text submission #${subs.length - idx}`}
                    </span>
                    <span className="text-white/40 text-xs ml-1">
                      {sk === 'file' && s.fileSize ? `${(s.fileSize / 1024).toFixed(0)} KB • ` : ''}{new Date(s.submittedAt).toLocaleString()}
                    </span>
                    {s.late && <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold">LATE</span>}
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${meta.cls}`}><Icon className="h-3 w-3" /> {meta.label}</span>
                </div>
                {sk === 'text' && s.textContent && (
                  <div className="mt-2 rounded-xl bg-white/[0.03] border border-white/10 p-3 text-sm whitespace-pre-line max-h-40 overflow-auto">{s.textContent}</div>
                )}
                {sk === 'file' && s.storagePath && (
                  <SignedFile bucket="submissions" path={s.storagePath} fileType={s.fileType} fileName={s.fileName} className="mt-2" />
                )}
                {s.note && <div className="mt-2 text-xs text-white/50 italic">Note: {s.note}</div>}
                {s.score != null && <div className="mt-2 text-sm flex items-center gap-2"><Award className="h-4 w-4 text-amber-300" /> Score: <span className="font-black text-lg">{s.score}/{assignment.maxScore}</span></div>}
                {s.feedback && (
                  <div className="mt-2 rounded-xl bg-white/[0.03] border border-white/10 p-3 text-sm">
                    <div className="text-[11px] font-bold tracking-widest text-white/40 mb-1">INSTRUCTOR FEEDBACK</div>
                    <div className="text-white/75 leading-relaxed">{s.feedback}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit new (allowed unless latest approved) */}
      {(!latest || latest.status !== 'approved') && (
        <form aria-busy={uploading} onSubmit={handleSubmit} className="glass rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="font-bold text-sm">SUBMISSION AREA</div>
            {allowed.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {allowed.map((k) => {
                  const KIcon = KIND_META[k].icon;
                  return (
                    <button key={k} type="button" onClick={() => setKind(k)} className={`min-h-11 px-3 rounded-full text-[11px] font-bold flex items-center gap-1 ${kind === k ? 'bg-white text-black' : 'glass text-white/60'}`}>
                      <KIcon className="h-3 w-3" /> {KIND_META[k].label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {kind === 'file' && (
            <>
              <input type="file" accept=".jpg,.jpeg,.png,.pdf,.mp4,.zip,.docx,.pptx,.xlsx" onChange={handleFile} className="w-full h-[52px] rounded-2xl glass px-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-black file:font-bold file:text-xs" />
              {file && <div className="text-xs text-green-300 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</div>}
            </>
          )}
          {kind === 'text' && (
            <textarea value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="Write your answer / essay here..." className="w-full rounded-2xl glass p-4 text-sm h-40 focus:outline-none focus:border-cyan-400/50" />
          )}
          {kind === 'link' && (
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://your-work-link... (Google Drive, YouTube, GitHub, Behance...)" className="w-full h-[52px] rounded-2xl glass px-4 text-sm focus:outline-none focus:border-cyan-400/50" />
          )}
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note about your work (optional)..." className="w-full rounded-2xl glass p-4 text-sm h-20 focus:outline-none focus:border-cyan-400/50" />
          {uploading && <div role="status" className="text-sm text-cyan-200">{kind === 'file' ? uploadProgress >= 100 ? 'Upload sent. Saving submission…' : `Uploading file: ${uploadProgress}%` : 'Saving submission…'}{kind === 'file' && <progress aria-label="File upload progress" value={uploadProgress} max="100" className="w-full" />}</div>}
          {submitError && <p role="alert" className="text-sm text-red-300">{submitError} Your answer is retained; submit again to retry.</p>}
          <button disabled={uploading} className="w-full btn-primary !py-3 disabled:opacity-50">
            <Upload className="h-4 w-4 mr-2" /> {uploading ? 'SUBMITTING...' : latest ? 'RESUBMIT ASSIGNMENT' : 'SUBMIT ASSIGNMENT'}
          </button>
        </form>
      )}
      {latest?.status === 'approved' && (
        <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-200 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" /> Approved! Great work — this counts toward your course completion.
        </div>
      )}
    </div>
  );
}
