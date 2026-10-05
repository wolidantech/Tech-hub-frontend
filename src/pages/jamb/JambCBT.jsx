import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Timer, ListChecks, History, AlertTriangle, RefreshCw, PlayCircle,
  CheckCircle2, Trash2, ChevronRight, ServerCog,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  fetchJambSubjects, getJambApiStatus, startJambAttempt,
} from '../../lib/jambApi';
import {
  JAMB_MODES, QUESTION_COUNTS, createAttempt, loadHistory, clearHistory, saveActiveAttempt,
} from '../../lib/jambEngine';

export default function JambCBT() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectError, setSubjectError] = useState('');
  const [selected, setSelected] = useState([]);
  const [mode, setMode] = useState('practice');
  const [questionCount, setQuestionCount] = useState(JAMB_MODES.practice.defaultQuestions);
  const [history, setHistory] = useState([]);
  const [starting, setStarting] = useState(false);
  const [checking, setChecking] = useState(false);

  const load = useCallback(async () => {
    setChecking(true);
    setSubjectError('');
    const probe = await getJambApiStatus({ force: true });
    setStatus(probe);
    if (probe.available) {
      try {
        setSubjects(await fetchJambSubjects());
      } catch (err) {
        setSubjectError(err?.message || 'Could not load the JAMB subject list.');
      }
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    load();
    setHistory(loadHistory());
  }, [load]);

  const config = JAMB_MODES[mode];

  useEffect(() => {
    // Keep the question count sane for the chosen mode.
    if (!QUESTION_COUNTS.includes(questionCount)) setQuestionCount(config.defaultQuestions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const toggleSubject = (id) => setSelected((prev) =>
    (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const canStart = Boolean(status?.available) && selected.length > 0 && !starting;

  const start = async () => {
    if (!canStart) return;
    setStarting(true);
    try {
      // The paper comes from the exam service — questions and options only,
      // never answer keys.
      const paper = await startJambAttempt({ subjectIds: selected, mode, questionCount });
      const attempt = createAttempt({ paper, mode });
      if (!attempt.questions.length) throw new Error('The exam service returned an empty paper.');
      saveActiveAttempt(attempt);
      navigate('/jamb-cbt/exam');
    } catch (err) {
      toast.error(err?.message || 'Could not start the paper.');
    } finally {
      setStarting(false);
    }
  };

  const best = useMemo(() => {
    const scored = history.filter((h) => typeof h.percentage === 'number');
    if (!scored.length) return null;
    return scored.reduce((a, b) => (b.percentage > a.percentage ? b : a));
  }, [history]);

  return (
    <div className="min-h-screen max-w-full overflow-x-clip">
      <Toaster richColors />
      <div className="border-b border-white/[0.06] bg-gradient-to-br from-[#061236] to-[#020a1f]">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl glass text-[10px] font-black tracking-[0.18em] mb-3">
            <GraduationCap className="h-3.5 w-3.5 text-emerald-300" /> SEPARATE FROM THE COURSE CLASSROOM
          </div>
          <h1 className="font-display font-black text-[30px] sm:text-[40px] leading-none">JAMB CBT PRACTICE</h1>
          <p className="mt-3 text-white/60 max-w-[620px]">
            Computer-based test practice in exam conditions: pick your subjects, choose practice or full mock mode,
            work through the paper with a live timer, and get a server-graded result with attempt history.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
            <span className="px-3 py-1 rounded-full glass font-bold flex items-center gap-1.5"><Timer className="h-3.5 w-3.5" /> Timed papers</span>
            <span className="px-3 py-1 rounded-full glass font-bold flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5" /> Question navigator</span>
            <span className="px-3 py-1 rounded-full glass font-bold flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Answers saved as you go</span>
            <span className="px-3 py-1 rounded-full glass font-bold flex items-center gap-1.5"><History className="h-3.5 w-3.5" /> Attempt history</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Service status — this area only runs on the standalone exam API. */}
        {status && !status.available && (
          <div role="status" className="rounded-[24px] border border-amber-500/25 bg-amber-500/10 p-6">
            <div className="flex flex-wrap items-start gap-4">
              <ServerCog className="h-6 w-6 text-amber-300 shrink-0" />
              <div className="flex-1 min-w-[240px]">
                <h2 className="font-bold text-amber-200">Exam service not connected yet</h2>
                <p className="mt-2 text-sm text-white/70">{status.reason}</p>
                <ul className="mt-3 space-y-1.5 text-xs text-white/60 list-disc pl-5">
                  <li>Papers, grading and attempt history will come from the backend's standalone JAMB exam endpoints.</li>
                  <li>The CBT interface below (subject selection, practice/mock modes, question navigator, timer, saved answers, results and history) is ready and waiting.</li>
                  <li>Course quizzes are a different system — this area is deliberately not wired to them, and answer keys are never sent to your browser.</li>
                </ul>
                <button onClick={load} disabled={checking} className="mt-4 min-h-11 inline-flex items-center gap-2 px-4 rounded-full glass text-xs font-bold hover:bg-white/10 disabled:opacity-50">
                  <RefreshCw className={`h-3.5 w-3.5 ${checking ? 'animate-spin' : ''}`} /> Re-check the exam service
                </button>
                {status.checkedAt && <p className="mt-2 text-[11px] text-white/35">Last checked {new Date(status.checkedAt).toLocaleTimeString()}</p>}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <div className="space-y-6">
            {/* 1 — Subjects */}
            <section className="rounded-[24px] glass p-6">
              <h2 className="font-bold text-lg flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-cyan-400 text-black text-xs font-black grid place-content-center">1</span> Choose subjects</h2>
              {subjectError && <p role="alert" className="mt-3 text-xs text-amber-300">{subjectError}</p>}
              {status?.available ? (
                subjects.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {subjects.map((subject) => {
                      const on = selected.includes(subject.id);
                      return (
                        <button
                          key={subject.id}
                          onClick={() => toggleSubject(subject.id)}
                          aria-pressed={on}
                          title={subject.description || undefined}
                          className={`min-h-11 px-4 rounded-full text-[13px] font-bold transition ${on ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white' : 'glass text-white/60 hover:text-white'}`}
                        >
                          {subject.name}
                          {subject.questionCount ? <span className="ml-2 text-[10px] opacity-70">{subject.questionCount} Q</span> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-white/50">The exam service returned no subjects yet.</p>
                )
              ) : (
                <p className="mt-4 text-sm text-white/50">
                  Subjects are issued by the exam service, so no subject list is shown until it is connected.
                </p>
              )}
            </section>

            {/* 2 — Mode */}
            <section className="rounded-[24px] glass p-6">
              <h2 className="font-bold text-lg flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-cyan-400 text-black text-xs font-black grid place-content-center">2</span> Choose mode</h2>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {Object.values(JAMB_MODES).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); setQuestionCount(m.defaultQuestions); }}
                    aria-pressed={mode === m.id}
                    className={`rounded-2xl p-4 text-left border transition ${mode === m.id ? 'border-cyan-400/60 bg-cyan-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}
                  >
                    <div className="font-bold text-sm flex items-center gap-2">
                      {m.id === 'mock' ? <Timer className="h-4 w-4 text-amber-300" /> : <PlayCircle className="h-4 w-4 text-cyan-300" />} {m.label}
                    </div>
                    <p className="mt-2 text-xs text-white/55">{m.blurb}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* 3 — Paper length + start */}
            <section className="rounded-[24px] glass p-6">
              <h2 className="font-bold text-lg flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-cyan-400 text-black text-xs font-black grid place-content-center">3</span> Paper length</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {QUESTION_COUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    aria-pressed={questionCount === n}
                    className={`min-h-11 px-4 rounded-full text-[13px] font-bold transition ${questionCount === n ? 'bg-purple-500 text-white' : 'glass text-white/60 hover:text-white'}`}
                  >
                    {n} questions
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-white/45">
                Time allowed: about {Math.round((config.secondsPerQuestion * questionCount) / 60)} minutes, or whatever the exam service sets on the paper.
              </p>
              <button
                onClick={start}
                disabled={!canStart}
                className="mt-5 w-full sm:w-auto min-h-12 inline-flex items-center justify-center gap-2 px-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 font-black text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {starting ? 'REQUESTING PAPER…' : 'START PAPER'} <ChevronRight className="h-4 w-4" />
              </button>
              {!status?.available && <p className="mt-2 text-[11px] text-white/40">Disabled until the exam service is connected.</p>}
            </section>
          </div>

          {/* Attempt history */}
          <aside className="space-y-6">
            <section className="rounded-[24px] glass p-6">
              <h3 className="font-bold flex items-center gap-2"><History className="h-4 w-4 text-cyan-300" /> Attempt history</h3>
              {best && (
                <div className="mt-3 rounded-2xl bg-white/[0.04] border border-white/10 p-4">
                  <div className="text-[11px] font-black tracking-widest text-white/40">BEST SCORE</div>
                  <div className="font-black text-2xl">{best.percentage}%</div>
                  <div className="text-xs text-white/50">{best.score}/{best.total} • {best.title}</div>
                </div>
              )}
              {history.length === 0 ? (
                <p className="mt-3 text-sm text-white/50">No attempts on this device yet.</p>
              ) : (
                <>
                  <ul className="mt-3 space-y-2 max-h-[320px] overflow-auto">
                    {history.map((entry) => (
                      <li key={entry.attemptId} className="rounded-2xl bg-white/[0.03] border border-white/10 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold truncate">{entry.title}</span>
                          <span className={`text-xs font-black ${entry.passed ? 'text-green-300' : 'text-amber-300'}`}>{entry.percentage}%</span>
                        </div>
                        <div className="text-[11px] text-white/45 mt-1">
                          {entry.score}/{entry.total} • {entry.mode === 'mock' ? 'Mock exam' : 'Practice'} • {new Date(entry.completedAt).toLocaleString()}
                        </div>
                        {entry.subjects?.length > 0 && <div className="text-[11px] text-white/35 mt-0.5">{entry.subjects.join(', ')}</div>}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setHistory(clearHistory())} className="mt-3 min-h-11 inline-flex items-center gap-2 px-3 rounded-full glass text-[11px] font-bold hover:bg-white/10">
                    <Trash2 className="h-3.5 w-3.5" /> Clear history
                  </button>
                </>
              )}
              <p className="mt-3 text-[11px] text-white/35">
                Stored on this device. Once the exam service is live it becomes the authoritative history for your account.
              </p>
            </section>

            <section className="rounded-[24px] glass p-6">
              <h3 className="font-bold">How grading works</h3>
              <div className="mt-3 space-y-2 text-xs text-white/60">
                <p className="flex gap-2"><AlertTriangle className="h-4 w-4 text-amber-300 shrink-0" /> Your answers are sent to the exam service, which grades them server-side.</p>
                <p className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-300 shrink-0" /> Answer keys are never delivered to your browser — not before, during or after a paper.</p>
                <p className="flex gap-2"><ListChecks className="h-4 w-4 text-cyan-300 shrink-0" /> Practice mode reviews each question after submission; mock mode only shows the score.</p>
              </div>
              <Link to="/courses" className="mt-4 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-white/60 hover:text-white">← Back to the course catalogue</Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
