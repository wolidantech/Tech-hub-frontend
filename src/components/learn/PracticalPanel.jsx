// PRACTICAL ACTIVITY panel — spec 8. Shows objective, materials, procedure,
// observation prompt, expected result, follow-up questions and safety notes,
// then accepts a student submission (observation text + optional file,
// device file picker → works on Android/iPhone/desktop) with upload
// progress, success, failure + retry. Statuses follow the same flow as
// assignments: Pending → Submitted → Under Review → Graded/Approved →
// Revision Required.
import { useState } from 'react';
import { Wrench, Upload, CheckCircle2, Clock, AlertTriangle, Award, RotateCcw, ShieldAlert, NotebookPen, ListChecks } from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { validateSubmissionFile, submissionStatus } from '../../lib/lms';
import { toast } from 'sonner';
import { EmptyState } from '../common/StateUI';

const STATUS_CLS = {
  green: 'bg-green-500/20 border-green-500/30 text-green-300',
  blue: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  amber: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
  red: 'bg-red-500/20 border-red-500/30 text-red-300',
  white: 'bg-white/[0.06] border-white/15 text-white/60',
};

export default function PracticalPanel({ practical, user, courseId, lessonId, onSubmitted }) {
  const { submitPractical, getMyPracticalSubmissions } = useLMS();
  const [observation, setObservation] = useState('');
  const [answers, setAnswers] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null); // 1..100 during upload
  const [error, setError] = useState('');
  const subs = getMyPracticalSubmissions(user.id, practical.id);
  const latest = subs[0];
  const done = latest && (latest.status === 'approved' || latest.status === 'under_review');

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) { setFile(null); return; }
    const check = validateSubmissionFile(f);
    if (!check.ok) { toast.error(check.error); e.target.value = ''; return; }
    setFile(f);
  };

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      await submitPractical({
        practical, userId: user.id, studentName: user.fullName,
        courseId, lessonId, file, onProgress: (p) => setProgress(p),
        observation: [observation, answers && `Answers:\n${answers}`].filter(Boolean).join('\n\n'),
      });
      setObservation(''); setAnswers(''); setFile(null);
      toast.success('Practical submitted! 🧪 Awaiting review.');
      onSubmitted?.();
    } catch (err) {
      setError(err.message || 'Submission failed — tap RETRY to try again.');
      toast.error(err.message || 'Submission failed');
    } finally {
      setBusy(false); setProgress(null);
    }
  };

  const st = submissionStatus(latest);
  const materials = (practical.materials || []).filter(Boolean);
  const questions = (practical.questions || []).filter(Boolean);
  const procedureLines = String(practical.procedure || '').split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <div id={`practical-${practical.id}`} className="glass rounded-2xl p-5 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold flex items-center gap-2 text-lg"><Wrench className="h-5 w-5 text-orange-300" /> PRACTICAL ACTIVITY</h3>
        <div className="flex items-center gap-2">
          {practical.estimatedMinutes ? <span className="text-[11px] font-bold px-2.5 py-1 rounded-full glass text-white/70">⏱ {practical.estimatedMinutes} min</span> : null}
          {latest && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${STATUS_CLS[st.tone] || STATUS_CLS.white}`}>
              {st.key === 'approved' || st.key === 'graded' ? <CheckCircle2 className="h-3 w-3" /> : st.key === 'needs_revision' ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {st.label}
            </span>
          )}
          {!latest && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold bg-white/[0.06] border-white/15 text-white/60">PENDING</span>}
        </div>
      </div>
      <div className="font-bold">{practical.title}</div>
      {practical.scenario && <p className="text-sm text-white/65 italic">{practical.scenario}</p>}

      <div className="grid md:grid-cols-2 gap-3">
        {practical.objective && (
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <div className="text-[11px] font-bold tracking-widest text-cyan-300 mb-2 flex items-center gap-1.5"><Award className="h-3.5 w-3.5" /> OBJECTIVE</div>
            <div className="text-sm text-white/75 leading-relaxed whitespace-pre-line">{practical.objective}</div>
          </div>
        )}
        {materials.length > 0 && (
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <div className="text-[11px] font-bold tracking-widest text-amber-300 mb-2 flex items-center gap-1.5"><NotebookPen className="h-3.5 w-3.5" /> MATERIALS</div>
            <ul className="text-sm text-white/75 space-y-1 list-disc pl-5">
              {materials.map((m, i) => <li key={i}>{typeof m === 'string' ? m : m.name || m.title}</li>)}
            </ul>
          </div>
        )}
      </div>

      {procedureLines.length > 0 && (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <div className="text-[11px] font-bold tracking-widest text-green-300 mb-2 flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5" /> PROCEDURE</div>
          <ol className="text-sm text-white/75 space-y-1.5 list-decimal pl-5">
            {procedureLines.map((line, i) => <li key={i} className="leading-relaxed">{line.replace(/^\d+[.)]\s*/, '')}</li>)}
          </ol>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {practical.observation && (
          <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/20 p-4">
            <div className="text-[11px] font-bold tracking-widest text-cyan-300/80 mb-2">WHAT TO OBSERVE</div>
            <div className="text-sm text-white/75 leading-relaxed whitespace-pre-line">{practical.observation}</div>
          </div>
        )}
        {practical.expected && (
          <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-4">
            <div className="text-[11px] font-bold tracking-widest text-green-300/80 mb-2">EXPECTED RESULT</div>
            <div className="text-sm text-white/75 leading-relaxed whitespace-pre-line">{practical.expected}</div>
          </div>
        )}
      </div>

      {questions.length > 0 && (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <div className="text-[11px] font-bold tracking-widest text-purple-300 mb-2">QUESTIONS TO ANSWER</div>
          <ol className="text-sm text-white/75 space-y-1.5 list-decimal pl-5">
            {questions.map((ql, i) => <li key={i}>{typeof ql === 'string' ? ql : ql.question || ql.text}</li>)}
          </ol>
        </div>
      )}

      {practical.safety && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-4 flex gap-3">
          <ShieldAlert className="h-5 w-5 text-red-300 shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-bold tracking-widest text-red-300 mb-1">SAFETY</div>
            <div className="text-sm text-red-100/90 leading-relaxed whitespace-pre-line">{practical.safety}</div>
          </div>
        </div>
      )}

      {/* Student work area */}
      {done ? (
        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-200 space-y-2">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Submitted {new Date(latest.submittedAt).toLocaleString()}{latest.fileName ? ` — ${latest.fileName}` : ''}</div>
          {latest.score != null && <div className="flex items-center gap-2"><Award className="h-4 w-4 text-amber-300" /> Score: <span className="font-black">{latest.score}/100</span></div>}
          {latest.feedback && <div className="rounded-lg bg-white/[0.04] p-3 text-white/75"><span className="font-bold text-[11px] tracking-widest text-white/40 block mb-1">REVIEWER FEEDBACK</span>{latest.feedback}</div>}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
          <div className="text-[11px] font-bold tracking-widest text-white/40">YOUR SUBMISSION</div>
          <textarea
            value={observation} onChange={(e) => setObservation(e.target.value)}
            placeholder="Write down what you observed / your results…"
            className="w-full rounded-xl glass p-3.5 text-sm min-h-[110px] focus:outline-none focus:border-cyan-400/50"
          />
          {questions.length > 0 && (
            <textarea
              value={answers} onChange={(e) => setAnswers(e.target.value)}
              placeholder="Answer the questions above (number them 1, 2, 3…)"
              className="w-full rounded-xl glass p-3.5 text-sm min-h-[90px] focus:outline-none focus:border-cyan-400/50"
            />
          )}
          <label className="block">
            <span className="text-xs text-white/50">Attach a photo, PDF or document (optional):</span>
            <input
              type="file" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
              onChange={pickFile}
              className="mt-1.5 w-full rounded-xl glass px-3 py-3 text-sm file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-black file:font-bold file:text-xs"
            />
          </label>
          {file && <div className="text-xs text-green-300 flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5" /> {file.name} ({(file.size / 1024).toFixed(0)} KB)</div>}
          {progress != null && (
            <div>
              <div className="flex justify-between text-[11px] text-white/60 mb-1"><span>Uploading…</span><span>{progress}%</span></div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: `${progress}%` }} /></div>
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/25 p-3 text-sm text-red-200 flex flex-wrap items-center justify-between gap-2">
              <span>{error}</span>
              <button onClick={submit} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold"><RotateCcw className="h-3 w-3" /> RETRY</button>
            </div>
          )}
          <button onClick={submit} disabled={busy} className="w-full btn-primary !py-3 disabled:opacity-60">
            <Upload className="h-4 w-4 mr-2" /> {busy ? 'SUBMITTING…' : latest ? 'RESUBMIT PRACTICAL' : 'SUBMIT PRACTICAL'}
          </button>
          {subs.length > 1 && subs.slice(1).map((s) => (
            <div key={s.id} className="text-[11px] text-white/35">Previous attempt {new Date(s.submittedAt).toLocaleString()} — {submissionStatus(s).label}{s.feedback ? ` — ${s.feedback}` : ''}</div>
          ))}
          {latest && subs.length === 1 && (
            <div className="text-[11px] text-white/35">Your submission {new Date(latest.submittedAt).toLocaleString()} — {submissionStatus(latest).label}{latest.feedback ? ` — ${latest.feedback}` : ''}</div>
          )}
        </div>
      )}
      {!user && (
        <EmptyState title="Log in to submit this practical" hint="Your observation and files are saved to your account for review." className="border-white/10" />
      )}
    </div>
  );
}
