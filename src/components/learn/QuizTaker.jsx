import { useState } from 'react';
import { CheckCircle2, XCircle, Award, RotateCcw, HelpCircle, History } from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { toast } from 'sonner';

export default function QuizTaker({ quiz, userId, onComplete }) {
  const { getQuizWithQuestions, submitQuizAttempt, getUserAttempts } = useLMS();
  const full = getQuizWithQuestions(quiz.id);
  const questions = full.questions || [];
  const attempts = getUserAttempts(userId, quiz.id);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(() => attempts[0] || null);
  const [started, setStarted] = useState(false);

  if (!questions.length) return <div className="text-sm text-white/40">Quiz questions coming soon.</div>;

  const limitReached = quiz.attemptLimit && attempts.length >= quiz.attemptLimit;
  const canAttempt = !limitReached && (attempts.length === 0 || quiz.allowRetake);

  const toggleMulti = (qId, idx) => {
    const cur = answers[qId] || [];
    setAnswers({ ...answers, [qId]: cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx] });
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      if (!confirm('Some questions are unanswered. Submit anyway?')) return;
    }
    try {
      const attempt = submitQuizAttempt({ quizId: quiz.id, userId, answers });
      setResult(attempt);
      setStarted(false);
      toast.success(attempt.passed ? `Passed! 🎉 Score: ${attempt.score}%` : `Score: ${attempt.score}% — keep practicing!`);
      onComplete?.(attempt);
    } catch (err) {
      toast.error(err.message);
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

  // Result view
  if (result && !started) {
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
          {questions.map((q, i) => {
            const detail = result.details?.find((d) => d.questionId === q.id);
            return (
              <div key={q.id} className={`rounded-2xl p-4 border ${detail?.correct ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <div className="flex gap-2 text-sm">
                  {detail?.correct ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
                  <div className="font-bold">Q{i + 1}. {q.question}</div>
                </div>
                <div className="mt-2 ml-6 space-y-1 text-xs">
                  {q.type === 'short_answer' ? (
                    <>
                      <div className="text-white/60">Your answer: <span className={detail?.correct ? 'text-green-300 font-bold' : 'text-red-300'}>{String(detail?.given || '(blank)')}</span></div>
                      {!detail?.correct && <div className="text-green-300">Accepted: {(q.acceptedAnswers || []).join(' / ')}</div>}
                    </>
                  ) : (q.options || []).map((opt, oi) => {
                    const isCorrect = q.type === 'multiple_answer' ? q.correctAnswers?.includes(oi) : q.correctAnswer === oi;
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
          <button onClick={() => { setResult(null); setAnswers({}); setStarted(true); }} className="w-full h-11 rounded-full glass font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10">
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
      <button onClick={handleSubmit} className="w-full btn-primary !py-4"><Award className="h-4 w-4 mr-2" /> SUBMIT QUIZ</button>
    </div>
  );
}
