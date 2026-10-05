import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Timer, Flag, ChevronLeft, ChevronRight, Send, RotateCcw, CheckCircle2, XCircle, AlertTriangle, Loader2,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { submitJambAttempt } from '../../lib/jambApi';
import {
  buildSubmission, clearActiveAttempt, currentQuestion, formatClock, goTo, loadActiveAttempt,
  loadHistory, nextQuestion, normalizeResult, prevQuestion, recordHistory, saveActiveAttempt, saveAnswer,
  secondsLeft, toHistoryEntry, toggleFlag, unansweredIds, answeredCount, JAMB_MODES,
} from '../../lib/jambEngine';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function JambExam() {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(() => loadActiveAttempt());
  const [seconds, setSeconds] = useState(() => (attempt ? secondsLeft(attempt) : 0));
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [history, setHistory] = useState([]);
  const submittedRef = useRef(false);

  // Persist every answer as it is chosen, so a refresh, a phone call or a
  // browser crash never loses work.
  useEffect(() => {
    if (attempt && !result) saveActiveAttempt(attempt);
  }, [attempt, result]);

  useEffect(() => {
    if (!attempt || result) return undefined;
    const tick = () => {
      const left = secondsLeft(attempt);
      setSeconds(left);
      if (left <= 0 && !submittedRef.current) {
        submittedRef.current = true;
        toast.info('Time is up — submitting your paper.');
        submit(true);
      }
    };
    tick();
    const handle = setInterval(tick, 1000);
    return () => clearInterval(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, result]);

  const question = attempt ? currentQuestion(attempt) : null;
  const answered = attempt ? answeredCount(attempt) : 0;
  const missing = useMemo(() => (attempt ? unansweredIds(attempt) : []), [attempt]);
  const mode = attempt ? (JAMB_MODES[attempt.mode] || JAMB_MODES.practice) : JAMB_MODES.practice;

  const patch = useCallback((fn) => setAttempt((prev) => (prev ? fn(prev) : prev)), []);

  const submit = useCallback(async (auto = false) => {
    if (!attempt || submitting || submittedRef.current && !auto) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError('');
    try {
      // Only the chosen option ids travel to the server; grading is remote.
      const graded = await submitJambAttempt(attempt.attemptId, buildSubmission(attempt));
      const normalized = normalizeResult(graded, attempt);
      setResult(normalized);
      const entry = toHistoryEntry(normalized, attempt);
      setHistory(recordHistory(entry));
      clearActiveAttempt();
      toast.success(auto ? 'Paper submitted automatically.' : 'Paper submitted — results are in.');
    } catch (err) {
      submittedRef.current = false;
      setError(err?.message || 'Could not submit your paper.');
    } finally {
      setSubmitting(false);
    }
  }, [attempt, submitting]);

  const requestSubmit = () => {
    if (missing.length > 0) { setConfirming(true); return; }
    submit();
  };

  const restart = () => {
    clearActiveAttempt();
    setHistory(loadHistory());
    navigate('/jamb-cbt');
  };

  if (!attempt) return <Navigate to="/jamb-cbt" replace />;

  // ---------------- RESULTS ----------------
  if (result) {
    return (
      <div className="min-h-screen max-w-full overflow-x-clip">
        <Toaster richColors />
        <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-10 space-y-6">
          <div className={`rounded-[24px] p-6 sm:p-8 border ${result.passed ? 'border-green-500/30 bg-green-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}>
            <div className="text-[11px] font-black tracking-widest text-white/45">
              {result.mode === 'mock' ? 'MOCK EXAM RESULT' : 'PRACTICE RESULT'}
            </div>
            <div className="mt-2 flex flex-wrap items-end gap-4">
              <div className="font-black text-[54px] leading-none">{result.percentage}%</div>
              <div className="text-sm text-white/60 pb-2">{result.score} of {result.total} correct • pass mark {result.passMark}%</div>
            </div>
            <div className={`mt-2 font-bold ${result.passed ? 'text-green-300' : 'text-amber-300'}`}>
              {result.passed ? '🎉 Passed — well done!' : 'Not a pass this time. Review and try another paper.'}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={restart} className="min-h-11 px-5 rounded-full bg-white text-black text-xs font-bold">NEW PAPER</button>
              <Link to="/jamb-cbt" className="min-h-11 inline-flex items-center px-5 rounded-full glass text-xs font-bold">Attempt history</Link>
            </div>
          </div>

          {result.bySubject.length > 0 && (
            <section className="rounded-[24px] glass p-6">
              <h2 className="font-bold mb-4">By subject</h2>
              <div className="space-y-3">
                {result.bySubject.map((row) => (
                  <div key={row.subject}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold">{row.subject}</span>
                      <span className="text-white/50">{row.score}/{row.total}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600" style={{ width: `${row.total ? (row.score / row.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {mode.review && result.perQuestion.length > 0 && (
            <section className="rounded-[24px] glass p-6">
              <h2 className="font-bold mb-4">Review</h2>
              <ul className="space-y-2">
                {result.perQuestion.map((row, i) => (
                  <li key={`${row.questionId}-${i}`} className="rounded-2xl bg-white/[0.03] border border-white/10 p-3 flex gap-3">
                    {row.correct
                      ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                      : <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
                    <div className="text-xs">
                      <span className="font-bold">Question {i + 1}</span>
                      {row.subject ? <span className="text-white/40"> • {row.subject}</span> : null}
                      <span className={row.correct ? 'text-green-300' : 'text-red-300'}> — {row.correct ? 'correct' : 'incorrect'}</span>
                      {row.explanation && <p className="mt-1 text-white/60">{row.explanation}</p>}
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-white/35">Correctness comes from the exam service; answer keys are never sent to your browser.</p>
            </section>
          )}

          {history.length > 0 && (
            <section className="rounded-[24px] glass p-6">
              <h2 className="font-bold mb-3">Recent attempts</h2>
              <ul className="space-y-2">
                {history.slice(0, 5).map((entry) => (
                  <li key={entry.attemptId} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] border border-white/10 p-3 text-xs">
                    <span className="truncate">{entry.title}</span>
                    <span className="text-white/50 shrink-0">{entry.score}/{entry.total} • {entry.percentage}%</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ---------------- PAPER ----------------
  const chosen = question ? attempt.answers[String(question.id)] : null;
  const flagged = question ? attempt.flagged.includes(String(question.id)) : false;
  const low = seconds <= 60;

  return (
    <div className="min-h-screen max-w-full overflow-x-clip bg-[#020a1f]">
      <Toaster richColors />
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#020a1f]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            <div className="font-bold truncate">{attempt.title}</div>
            <div className="text-[11px] text-white/45">
              {attempt.mode === 'mock' ? 'Mock exam' : 'Practice'} • {answered}/{attempt.questions.length} answered
              {attempt.subjects?.length > 0 ? ` • ${attempt.subjects.join(', ')}` : ''}
              {attempt.timerSource === 'server' ? ' • server-timed' : ' • display timer'}
            </div>
          </div>
          {/* The clock is only the referee when the exam server issued a deadline.
              Otherwise it is a display timer and the server still decides. */}
          <div
            className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm ${low ? 'bg-red-500/20 text-red-300' : 'glass'}`}
            role="timer" aria-live="off"
            title={attempt.timerSource === 'server' ? 'Deadline set by the exam server' : 'Display timer — the exam server decides if your attempt was in time'}
          >
            <Timer className="h-4 w-4" /> {formatClock(seconds)}
          </div>
          <button onClick={requestSubmit} disabled={submitting} className="min-h-11 inline-flex items-center gap-2 px-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-black text-xs font-black disabled:opacity-50">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} SUBMIT
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 py-6 grid lg:grid-cols-[1.4fr_0.6fr] gap-6">
        <section className="rounded-[24px] glass p-6">
          {error && (
            <div role="alert" className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/25 p-4 flex flex-wrap items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-300" />
              <span className="text-xs text-white/75 flex-1 min-w-[200px]">{error}</span>
              <button onClick={() => submit()} className="min-h-11 px-4 rounded-full glass text-xs font-bold">Retry submission</button>
            </div>
          )}

          {question ? (
            <>
              <div className="flex items-center justify-between gap-3 text-[11px] font-black tracking-widest text-white/40">
                <span>QUESTION {attempt.index + 1} OF {attempt.questions.length}</span>
                {question.subject && <span className="text-cyan-300">{String(question.subject).toUpperCase()}</span>}
              </div>
              <p className="mt-3 text-base sm:text-lg leading-relaxed break-words">{question.text}</p>

              <div className="mt-5 space-y-2">
                {question.options.map((option, i) => {
                  const on = chosen != null && String(chosen) === String(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => patch((a) => saveAnswer(a, question.id, on ? null : option.id))}
                      aria-pressed={on}
                      className={`w-full min-h-12 text-left rounded-2xl border p-4 flex items-start gap-3 transition ${on ? 'border-cyan-400/70 bg-cyan-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}
                    >
                      <span className={`h-7 w-7 shrink-0 rounded-full grid place-content-center text-xs font-black ${on ? 'bg-cyan-400 text-black' : 'bg-white/10'}`}>
                        {OPTION_LETTERS[i] || i + 1}
                      </span>
                      <span className="text-sm break-words">{option.text}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <button onClick={() => patch(prevQuestion)} disabled={attempt.index === 0} className="min-h-11 inline-flex items-center gap-1.5 px-4 rounded-full glass text-xs font-bold disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <button
                  onClick={() => patch((a) => toggleFlag(a, question.id))}
                  aria-pressed={flagged}
                  className={`min-h-11 inline-flex items-center gap-1.5 px-4 rounded-full text-xs font-bold ${flagged ? 'bg-amber-500 text-black' : 'glass'}`}
                >
                  <Flag className="h-4 w-4" /> {flagged ? 'Flagged' : 'Flag for review'}
                </button>
                <button
                  onClick={() => patch((a) => saveAnswer(a, question.id, null))}
                  disabled={chosen == null}
                  className="min-h-11 inline-flex items-center gap-1.5 px-4 rounded-full glass text-xs font-bold disabled:opacity-40"
                >
                  <RotateCcw className="h-4 w-4" /> Clear answer
                </button>
                <button
                  onClick={() => patch(nextQuestion)}
                  disabled={attempt.index >= attempt.questions.length - 1}
                  className="min-h-11 ml-auto inline-flex items-center gap-1.5 px-4 rounded-full bg-white text-black text-xs font-black disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-[11px] text-white/35">Answers are saved on this device as you pick them, and restored if you reload.</p>
            </>
          ) : (
            <p className="text-sm text-white/50">This paper has no questions.</p>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-[24px] glass p-5">
            <h2 className="font-bold text-sm mb-3">Question navigator</h2>
            <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-6 gap-2">
              {attempt.questions.map((q, i) => {
                const done = attempt.answers[String(q.id)] != null;
                const isFlagged = attempt.flagged.includes(String(q.id));
                const isCurrent = i === attempt.index;
                return (
                  <button
                    key={q.id}
                    onClick={() => patch((a) => goTo(a, i))}
                    aria-label={`Go to question ${i + 1}${done ? ', answered' : ', not answered'}${isFlagged ? ', flagged' : ''}`}
                    aria-current={isCurrent}
                    className={`min-h-11 rounded-xl text-xs font-black border transition ${isCurrent ? 'border-cyan-400 bg-cyan-400/20 text-white' : done ? 'border-green-500/40 bg-green-500/15 text-green-200' : 'border-white/10 bg-white/[0.03] text-white/50'} ${isFlagged ? 'ring-2 ring-amber-400/60' : ''}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-white/45">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-green-500/40" /> answered</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-white/10" /> blank</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded ring-2 ring-amber-400/60" /> flagged</span>
            </div>
          </section>

          <section className="rounded-[24px] glass p-5">
            <h2 className="font-bold text-sm mb-2">Progress</h2>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all" style={{ width: `${attempt.questions.length ? (answered / attempt.questions.length) * 100 : 0}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/50">{answered} answered • {missing.length} blank • {attempt.flagged.length} flagged</p>
            <p className="mt-2 text-[11px] text-white/35">The paper submits automatically when the timer reaches zero.</p>
          </section>
        </aside>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 grid place-content-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Confirm submission">
          <div className="dialog-panel w-full max-w-[420px] rounded-[24px] glass-strong p-6">
            <h2 className="font-bold text-lg">Submit with blanks?</h2>
            <p className="mt-2 text-sm text-white/60">
              You have {missing.length} unanswered question{missing.length === 1 ? '' : 's'}. You can keep working or submit now.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => setConfirming(false)} className="min-h-11 flex-1 px-4 rounded-full glass text-xs font-bold">KEEP WORKING</button>
              <button onClick={() => { setConfirming(false); submit(); }} className="min-h-11 flex-1 px-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-black text-xs font-black">SUBMIT NOW</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
