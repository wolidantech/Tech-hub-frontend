import { useState } from 'react';
import { Upload, FileText, CheckCircle2, Clock, AlertTriangle, Award } from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { validateSubmissionFile } from '../../lib/lms';
import { toast } from 'sonner';

const STATUS_META = {
  submitted: { label: 'SUBMITTED', cls: 'bg-blue-500/20 border-blue-500/30 text-blue-300', icon: Clock },
  under_review: { label: 'UNDER REVIEW', cls: 'bg-amber-500/20 border-amber-500/30 text-amber-300', icon: Clock },
  approved: { label: 'APPROVED', cls: 'bg-green-500/20 border-green-500/30 text-green-300', icon: CheckCircle2 },
  needs_revision: { label: 'NEEDS REVISION', cls: 'bg-red-500/20 border-red-500/30 text-red-300', icon: AlertTriangle },
};

export default function AssignmentPanel({ assignment, user, onSubmitted }) {
  const { submitAssignment, getUserSubmissions } = useLMS();
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const subs = getUserSubmissions(user.id).filter((s) => s.assignmentId === assignment.id);
  const latest = subs[0];

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
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    setUploading(true);
    try {
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      submitAssignment({
        assignmentId: assignment.id, userId: user.id, studentName: user.fullName,
        fileData, fileName: file.name, fileType: file.type, fileSize: file.size, note,
      });
      setFile(null);
      setNote('');
      toast.success('Assignment submitted! 🎉 Awaiting review.');
      onSubmitted?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold flex items-center gap-2"><FileText className="h-4 w-4 text-cyan-300" /> PRACTICAL TASK</h4>
          {assignment.isFinalProject && <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold">FINAL PROJECT</span>}
        </div>
        <div className="text-sm font-bold">{assignment.title}</div>
        <p className="text-sm text-white/60 leading-relaxed">{assignment.description}</p>
        {assignment.instructions && (
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <div className="text-[11px] font-bold tracking-widest text-white/40 mb-2">INSTRUCTIONS</div>
            <div className="text-sm text-white/70 whitespace-pre-line leading-relaxed">{assignment.instructions}</div>
          </div>
        )}
        {assignment.requiredOutput && (
          <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/20 p-4">
            <div className="text-[11px] font-bold tracking-widest text-cyan-300/70 mb-1">REQUIRED OUTPUT</div>
            <div className="text-sm text-white/80">{assignment.requiredOutput}</div>
          </div>
        )}
        <div className="text-[11px] text-white/40">Accepted: JPG, PNG, PDF, MP4, ZIP, DOCX, PPTX, XLSX • Max 25MB • Max score: {assignment.maxScore}</div>
      </div>

      {/* Submission history + feedback */}
      {subs.length > 0 && (
        <div className="space-y-2">
          {subs.map((s) => {
            const meta = STATUS_META[s.status] || STATUS_META.submitted;
            const Icon = meta.icon;
            return (
              <div key={s.id} className="glass rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm">
                    <span className="font-bold">{s.fileName}</span>
                    <span className="text-white/40 text-xs ml-2">{(s.fileSize / 1024).toFixed(0)} KB • {new Date(s.submittedAt).toLocaleString()}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${meta.cls}`}><Icon className="h-3 w-3" /> {meta.label}</span>
                </div>
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

      {/* Upload new (allowed unless latest approved and no revision needed... always allow resubmission for revision) */}
      {(!latest || latest.status !== 'approved') && (
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-5 space-y-4">
          <div className="font-bold text-sm">SUBMISSION AREA</div>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf,.mp4,.zip,.docx,.pptx,.xlsx" onChange={handleFile} className="w-full h-[52px] rounded-2xl glass px-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-black file:font-bold file:text-xs" />
          {file && <div className="text-xs text-green-300 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</div>}
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note about your work (optional)..." className="w-full rounded-2xl glass p-4 text-sm h-20 focus:outline-none focus:border-cyan-400/50" />
          <button disabled={uploading} className="w-full btn-primary !py-3 disabled:opacity-50">
            <Upload className="h-4 w-4 mr-2" /> {uploading ? 'UPLOADING...' : latest ? 'RESUBMIT ASSIGNMENT' : 'SUBMIT ASSIGNMENT'}
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
