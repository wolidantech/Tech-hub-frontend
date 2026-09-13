import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Award, RotateCcw, HelpCircle, History } from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { toast } from 'sonner';

// Secure quiz flow: questions load WITHOUT answer keys (taker RPC); grading
// happens server-side; answer keys load only AFTER an attempt (review RPC).
export default function QuizTaker({ quiz, userId, onComplete }) {
  const { fetchQuizForTaker, fetchQuizReview, submitQuizAttempt, getUserAttempts } = useLMS();
  const attempts = getUserAttempts(userId, quiz.id);
  const [questions, setQuestions] = useState(null); // taker view (no keys)
  const [reviewQs, setReviewQs] = useState(null); // with keys (after attempt)
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(() => attempts[0] || null);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError('');
    fetchQuizForTaker(quiz.id)
      .then((rows) => { if (alive) setQuestions(rows); })
      .catch((err) => { if (alive) setLoadError(err.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [quiz.id, fetchQuizForTaker]);

  // Load answer keys when a result is shown (server allows only after attempting).
  useEffect(() => {
    if (!result || started) return;
    let alive = true;
    fetchQuizReview(quiz.id)
      .then((rows) => { if (alive) setReviewQs(rows); })
      .catch(() => { if (alive) setReviewQs([]); });
    return () => { alive = false; };
  }, [result, started, quiz.id, fetchQuizReview]);

  if (loading) return <div className="text-sm text-white/40 py-6 text-center">Loading quiz…</div>;
  if (loadError) return <div className="text-sm text-red-300 py-6 text-center">{loadError}</div>;
  if (!questions || !questions.length) return <div className="text-sm text-white/40">Quiz questions coming soon.</div>;

  const limitReached = quiz.attemptLimit && attempts.length >= quiz.attemptLimit;
  const canAttempt = !limitReached && (attempts.length === 0 || quiz.allowRetake);

  const toggleMulti = (qId, idx) => {
    const cur = answers[qId] || [];
    setAnswers({ ...answers, [qId]: cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx] });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      if (!confirm('Some questions are unanswered. Submit anyway?')) return;
    }
    setSubmitting(true);
    try {
      const attempt = await submitQuizAttempt({ quizId: quiz.id, userId, answers });
      setResult(attempt);
      setStarted(false);
      setReviewQs(null);
      toast.success(attempt.passed ? `Passed! 🎉 Score: ${attempt.score}%` : `Score: ${attempt.score}% — keep practicing!`);
      onComplete?.(attempt);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const historyBlock = attempts.length > 1 && (
    <div className="rounded-2xl glass p-4">
      <div className="text-[11px] font-bold tracking-widest text-white/40 flex items-center gap-1.5 mb-2"><History className="h-3.5 w-3.5" /> ATTEMPT HISTORY ({attempts.length})</div>
      <div className="flex flex-wrap gap-2">
        {attempts.map((a) => (
          <span key={a.id} className={`px-3 py-1.5 rounded-full text-xs font-bold ${a.passed ? 'bg-green-500/20 text-green-300' : 'bg-white/[0.06] text-white/60'}`}>
            #{a.attemptNo}: {a.score}% {a.passed ? '✓' : ''}
          </span>
        ))}
      </div>
    </div>
  );

  const limitNote = quiz.attemptLimit ? `Attempts: ${attempts.length}/${quiz.attemptLimit}` : (quiz.allowRetake ? 'Retakes allowed' : 'Single attempt');

  // Per-question review: prefer fresh server details; otherwise derive the
  // given-vs-key display from the recorded answers + review keys.
  const detailFor = (q) => {
    const fresh = result?.details?.find((d) => d.questionId === q.id);
    if (fresh) {
      return {
        correct: fresh.correct,
        given: fresh.given,
        correctAnswer: fresh.correctIndex,
        correctAnswers: fresh.correctIndexes || [],
        acceptedAnswers: fresh.acceptedText ? [fresh.acceptedText] : [],
      };
    }
    const given = result?.answers?.[q.id];
    const key = (reviewQs || []).find((r) => r.id === q.id) || {};
    let correct = false;
    if (q.type === 'multiple_answer') {
      const g = [...(given || [])].sort().join(',');
      const k = [...(key.correctAnswers || [])].sort().join(',');
      correct = g !== '' && g === k;
    } else if (q.type === 'short_answer') {
      correct = (key.acceptedAnswers || []).some((a) => String(a).trim().toLowerCase() === String(given || '').trim().toLowerCase());
    } else {
      correct = Number(given) === key.correctAnswer;
    }
    return { correct, given, correctAnswer: key.correctAnswer, correctAnswers: key.correctAnswers || [], acceptedAnswers: key.acceptedAnswers || [] };
  };

  // Result view
  if (result && !started) {
    const reviewQuestions = (reviewQs && reviewQs.length ? reviewQs : questions);
    return (
      <div className="space-y-4">
        <div className={`rounded-2xl p-5 border ${result.passed ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
          <div className="flex items-center gap-3">
            {result.passed ? <CheckCircle2 className="h-8 w-8 text-green-400" /> : <XCircle className="h-8 w-8 text-amber-400" />}
            <div>
              <div className="font-black text-xl">{result.passed ? 'PASSED 🎉' : 'NOT PASSED YET'}</div>
              <div className="text-sm text-white/60">Score: <span className="font-bold text-white">{result.score}%</span> ({result.earned}/{result.total}) • Passing: {quiz.passingScore}% • Attempt #{result.attemptNo}</div>
            </div>
          </div>
        </div>
        {historyBlock}
        <div className="space-y-3">
          {reviewQuestions.map((q, i) => {
            const detail = detailFor(q);
            return (
              <div key={q.id} className={`rounded-2xl p-4 border ${detail?.correct ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <div className="flex gap-2 text-sm">
                  {detail?.correct ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
                  <div className="font-bold">Q{i + 1}. {q.question}</div>
                </div>
                <div className="mt-2 ml-6 space-y-1 text-xs">
                  {q.type === 'short_answer' ? (
                    <>
                      <div className="text-white/60">Your answer: <span className={detail?.correct ? 'text-green-300 font-bold' : 'text-red-300'}>{String(detail?.given ?? '(blank)')}</span></div>
                      {!detail?.correct && detail.acceptedAnswers.length > 0 && <div className="text-green-300">Accepted: {detail.acceptedAnswers.join(' / ')}</div>}
                    </>
                  ) : (q.options || []).map((opt, oi) => {
                    const isCorrect = q.type === 'multiple_answer' ? detail.correctAnswers?.includes(oi) : detail.correctAnswer === oi;
                    const wasGiven = q.type === 'multiple_answer' ? (detail?.given || []).includes(oi) : Number(detail?.given) === oi;
                    return (
                      <div key={oi} className={`px-2 py-1 rounded ${isCorrect ? 'text-green-300 font-bold' : wasGiven ? 'text-red-300 line-through' : 'text-white/50'}`}>
                        {isCorrect ? '✓ ' : wasGiven ? '✗ ' : '• '}{opt}
                      </div>
                    );
                  })}
                  {q.explanation && <div className="pt-2 text-white/60"><span className="font-bold text-cyan-300">Explanation: </span>{q.explanation}</div>}
                </div>
              </div>
            );
          })}
        </div>
        {canAttempt && attempts.length > 0 && (
          <button onClick={() => { setResult(null); setAnswers({}); setReviewQs(null); setStarted(true); }} className="w-full h-11 rounded-full glass font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10">
            <RotateCcw className="h-4 w-4" /> RETAKE QUIZ {quiz.attemptLimit ? `(${quiz.attemptLimit - attempts.length} LEFT)` : ''}
          </button>
        )}
        {limitReached && <div className="text-center text-sm text-amber-300">Attempt limit reached ({quiz.attemptLimit}). Contact your instructor if you need another chance.</div>}
      </div>
    );
  }

  if (!started && attempts.length > 0 && !canAttempt) {
    return <div className="text-sm text-white/40">{limitReached ? `Attempt limit reached (${quiz.attemptLimit}/${quiz.attemptLimit}).` : 'You have completed this quiz. Retakes are not allowed.'}</div>;
  }

  if (!started) {
    return (
      <div className="text-center py-6 space-y-4">
        <HelpCircle className="h-12 w-12 mx-auto text-cyan-300" />
        <div>
          <div className="font-bold text-lg">{quiz.title}</div>
          <div className="text-sm text-white/50 mt-1">{questions.length} questions • Passing score {quiz.passingScore}% • {limitNote}</div>
          {attempts.length > 0 && <div className="text-xs text-white/40 mt-1">Previous attempts: {attempts.length} • Best: {Math.max(...attempts.map((a) => a.score))}%</div>}
        </div>
        {historyBlock}
        <button onClick={() => setStarted(true)} className="btn-primary">START QUIZ</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={q.id} className="glass rounded-2xl p-5">
          <div className="font-bold text-sm">Q{i + 1}. {q.question}</div>
          <div className="text-[11px] text-white/40 mt-1 uppercase tracking-wider">{q.type.replace(/_/g, ' ')} {q.type === 'multiple_answer' && '• select all that apply'}</div>
          {q.type === 'short_answer' ? (
            <input
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              placeholder="Type your answer..."
              className="mt-3 w-full h-12 rounded-xl glass px-4 text-sm focus:outline-none focus:border-cyan-400/50"
            />
          ) : (
            <div className="mt-3 space-y-2">
              {(q.options || []).map((opt, oi) => {
                const selected = q.type === 'multiple_answer' ? (answers[q.id] || []).includes(oi) : answers[q.id] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => (q.type === 'multiple_answer' ? toggleMulti(q.id, oi) : setAnswers({ ...answers, [q.id]: oi }))}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition ${selected ? 'border-cyan-400 bg-cyan-500/15 font-bold' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'}`}
                  >
                    <span className="inline-flex h-6 w-6 rounded-full glass items-center justify-center text-xs font-bold mr-2">{String.fromCharCode(65 + oi)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
      <button onClick={handleSubmit} disabled={submitting} className="w-full btn-primary !py-4 disabled:opacity-50"><Award className="h-4 w-4 mr-2" /> {submitting ? 'SUBMITTING…' : 'SUBMIT QUIZ'}</button>
    </div>
  );
}
