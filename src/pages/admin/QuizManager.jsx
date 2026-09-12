import { useState, useEffect } from 'react';
import { Plus, X, Trash2, HelpCircle, Edit } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useLMS } from '../../context/LMSContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function QuizManager() {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { quizzes, quizQuestions, createQuiz, updateQuiz, deleteQuiz, addQuestion, updateQuestion, deleteQuestion, ensureQuizQuestions, quizAttempts, audit } = useLMS();
  const [courseFilter, setCourseFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ courseId: '', title: '', description: '', passingScore: 70, allowRetake: true, isFinal: false, attemptLimit: '' });
  const [managing, setManaging] = useState(null);
  const [qForm, setQForm] = useState({ type: 'multiple_choice', question: '', options: ['', '', '', ''], correctAnswer: 0, correctAnswers: [], acceptedAnswers: '', explanation: '' });
  const [editingQ, setEditingQ] = useState(null);

  const filtered = quizzes.filter((q) => !courseFilter || q.courseId === courseFilter);

  useEffect(() => {
    if (managing) ensureQuizQuestions(managing).catch((err) => toast.error(err.message));
  }, [managing, ensureQuizQuestions]);

  const handleCreate = async () => {
    if (!form.courseId || !form.title.trim()) { toast.error('Course and title required'); return; }
    try {
      const q = await createQuiz({ ...form });
      audit(user, 'quiz.create', 'quiz', q.id, { title: form.title });
      setShowAdd(false);
      setForm({ courseId: '', title: '', description: '', passingScore: 70, allowRetake: true, isFinal: false, attemptLimit: '' });
      setManaging(q.id);
      toast.success('Quiz created. Now add questions.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const resetQForm = () => { setQForm({ type: 'multiple_choice', question: '', options: ['', '', '', ''], correctAnswer: 0, correctAnswers: [], acceptedAnswers: '', explanation: '' }); setEditingQ(null); };

  const saveQuestion = async () => {
    if (!qForm.question.trim()) { toast.error('Question text required'); return; }
    const opts = qForm.type === 'true_false' ? ['True', 'False'] : qForm.type === 'short_answer' ? [] : qForm.options.filter((o) => o.trim());
    if (qForm.type !== 'short_answer' && opts.length < 2) { toast.error('At least 2 options required'); return; }
    if (qForm.type === 'short_answer' && !qForm.acceptedAnswers.trim()) { toast.error('Add at least one accepted answer'); return; }
    const payload = { type: qForm.type, question: qForm.question, options: opts, correctAnswer: qForm.correctAnswer, correctAnswers: qForm.correctAnswers, acceptedAnswers: qForm.acceptedAnswers.split('|').map((s) => s.trim()).filter(Boolean), explanation: qForm.explanation };
    try {
      if (editingQ) { await updateQuestion(editingQ, payload); toast.success('Question updated'); }
      else { await addQuestion(managing, payload); toast.success('Question added'); }
      resetQForm();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const startEditQ = (q) => {
    setEditingQ(q.id);
    setQForm({ type: q.type, question: q.question, options: q.type === 'true_false' ? ['True', 'False'] : [...(q.options || []), '', '', '', ''].slice(0, 4), correctAnswer: q.correctAnswer || 0, correctAnswers: q.correctAnswers || [], acceptedAnswers: (q.acceptedAnswers || []).join(' | '), explanation: q.explanation || '' });
  };

  if (managing) {
    const quiz = quizzes.find((q) => q.id === managing);
    if (!quiz) { setManaging(null); return null; }
    const course = courses.find((c) => c.id === quiz.courseId);
    const questions = quizQuestions.filter((q) => q.quizId === managing);
    const attempts = quizAttempts.filter((a) => a.quizId === managing);
    return (
      <div className="space-y-6">
        <button onClick={() => setManaging(null)} className="text-sm text-white/60 hover:text-white">← Back to quizzes</button>
        <div className="glass rounded-[20px] p-6">
          <h2 className="font-black text-xl">{quiz.title}</h2>
          <div className="text-sm text-white/50 mt-1">{course?.title} • Passing {quiz.passingScore}% • {quiz.allowRetake ? 'Retakes allowed' : 'No retakes'} {quiz.isFinal ? '• FINAL EXAM' : ''}</div>
          <div className="text-xs text-white/40 mt-1">{questions.length} questions • {attempts.length} attempts • {attempts.filter((a) => a.passed).length} passed</div>
          <div className="flex gap-2 mt-3">
            <button onClick={async () => { try { await updateQuiz(quiz.id, { allowRetake: !quiz.allowRetake }); } catch (err) { toast.error(err.message); } }} className="px-3 py-1.5 rounded-full glass text-xs font-bold">{quiz.allowRetake ? 'DISABLE RETAKES' : 'ALLOW RETAKES'}</button>
            <button onClick={async () => { try { await updateQuiz(quiz.id, { status: quiz.status === 'published' ? 'draft' : 'published' }); } catch (err) { toast.error(err.message); } }} className="px-3 py-1.5 rounded-full glass text-xs font-bold">{quiz.status === 'published' ? 'UNPUBLISH' : 'PUBLISH'}</button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold">Questions ({questions.length})</h3>
          {questions.map((q, i) => (
            <div key={q.id} className="glass rounded-2xl p-4">
              <div className="flex justify-between gap-3">
                <div className="font-bold text-sm">Q{i + 1}. {q.question} <span className="text-[10px] text-white/40 font-normal">({q.type.replace('_', ' ')})</span></div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => startEditQ(q)} className="h-7 w-7 rounded-full glass flex items-center justify-center"><Edit className="h-3 w-3" /></button>
                  <button onClick={async () => { if (confirm('Delete question?')) { try { await deleteQuestion(q.id); } catch (err) { toast.error(err.message); } } }} className="h-7 w-7 rounded-full glass flex items-center justify-center text-red-300"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="mt-2 grid sm:grid-cols-2 gap-1.5 text-xs">
                {q.options.map((o, oi) => {
                  const correct = q.type === 'multiple_answer' ? q.correctAnswers?.includes(oi) : q.correctAnswer === oi;
                  return <div key={oi} className={`px-2.5 py-1.5 rounded-lg ${correct ? 'bg-green-500/15 text-green-300 font-bold' : 'bg-white/[0.03] text-white/50'}`}>{correct ? '✓ ' : ''}{o}</div>;
                })}
              </div>
              {q.explanation && <div className="text-xs text-white/40 mt-2">💡 {q.explanation}</div>}
            </div>
          ))}
        </div>

        <div className="glass-strong rounded-[20px] p-6 space-y-4">
          <h3 className="font-bold">{editingQ ? 'Edit Question' : 'Add Question'}</h3>
          <div className="flex gap-2">
            {[{ id: 'multiple_choice', label: 'Multiple Choice' }, { id: 'true_false', label: 'True/False' }, { id: 'multiple_answer', label: 'Multiple Answer' }, { id: 'short_answer', label: 'Short Answer' }].map((t) => (
              <button key={t.id} onClick={() => setQForm({ ...qForm, type: t.id })} className={`px-4 py-2 rounded-full text-xs font-bold ${qForm.type === t.id ? 'bg-white text-black' : 'glass text-white/60'}`}>{t.label}</button>
            ))}
          </div>
          <input value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} placeholder="Question text" className="w-full h-11 rounded-full glass px-4 text-sm" />
          {qForm.type === 'short_answer' ? (
            <div className="space-y-2">
              <input value={qForm.acceptedAnswers} onChange={(e) => setQForm({ ...qForm, acceptedAnswers: e.target.value })} placeholder="Accepted answers (separate with |  e.g.  HyperText | hypertext)" className="w-full h-11 rounded-full glass px-4 text-sm" />
              <div className="text-[11px] text-white/30">Answers match case-insensitively; partial matches containing an accepted answer also pass.</div>
            </div>
          ) : qForm.type !== 'true_false' ? (
            <div className="space-y-2">
              {qForm.options.map((o, i) => (
                <div key={i} className="flex gap-2 items-center">
                  {qForm.type === 'multiple_answer' ? (
                    <input type="checkbox" checked={qForm.correctAnswers.includes(i)} onChange={(e) => setQForm({ ...qForm, correctAnswers: e.target.checked ? [...qForm.correctAnswers, i] : qForm.correctAnswers.filter((x) => x !== i) })} className="h-4 w-4" title="Correct answer" />
                  ) : (
                    <input type="radio" name="correct" checked={qForm.correctAnswer === i} onChange={() => setQForm({ ...qForm, correctAnswer: i })} className="h-4 w-4" title="Correct answer" />
                  )}
                  <input value={o} onChange={(e) => { const opts = [...qForm.options]; opts[i] = e.target.value; setQForm({ ...qForm, options: opts }); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="flex-1 h-10 rounded-full glass px-4 text-sm" />
                </div>
              ))}
              <div className="text-[11px] text-white/30">Tick the correct answer(s).</div>
            </div>
          ) : (
            <div className="flex gap-2">
              {['True', 'False'].map((t, i) => (
                <button key={t} onClick={() => setQForm({ ...qForm, correctAnswer: i })} className={`flex-1 h-11 rounded-full text-sm font-bold ${qForm.correctAnswer === i ? 'bg-green-500 text-white' : 'glass'}`}>{t} {qForm.correctAnswer === i ? '✓' : ''}</button>
              ))}
            </div>
          )}
          <input value={qForm.explanation} onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })} placeholder="Explanation shown after answering (optional but recommended)" className="w-full h-11 rounded-full glass px-4 text-sm" />
          <div className="flex gap-2">
            <button onClick={saveQuestion} className="btn-primary !py-2.5 flex-1">{editingQ ? 'UPDATE QUESTION' : 'ADD QUESTION'}</button>
            {editingQ && <button onClick={resetQForm} className="px-6 rounded-full glass font-bold text-sm">CANCEL</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="font-bold text-xl flex items-center gap-2"><HelpCircle className="h-5 w-5 text-purple-300" /> Quizzes ({quizzes.length})</h2>
        <div className="flex gap-2">
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="h-10 rounded-full glass px-4 text-sm">
            <option className="bg-[#061236]" value="">All courses</option>
            {courses.map((c) => <option className="bg-[#061236]" key={c.id} value={c.id}>{c.title.slice(0, 30)}</option>)}
          </select>
          <button onClick={() => setShowAdd(true)} className="btn-primary !py-2.5 !px-5 text-xs gap-2"><Plus className="h-4 w-4" /> CREATE QUIZ</button>
        </div>
      </div>

      {showAdd && (
        <div className="glass-strong rounded-[20px] p-6 space-y-4">
          <div className="flex justify-between"><h3 className="font-bold">Create Quiz</h3><button onClick={() => setShowAdd(false)}><X className="h-5 w-5" /></button></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="h-11 rounded-full glass px-4 text-sm sm:col-span-2">
              <option className="bg-[#061236]" value="">Select course</option>
              {courses.map((c) => <option className="bg-[#061236]" key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Quiz title" className="h-11 rounded-full glass px-4 text-sm sm:col-span-2" />
            <input type="number" min="0" max="100" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: Number(e.target.value) })} placeholder="Passing score %" className="h-11 rounded-full glass px-4 text-sm" />
            <input type="number" min="1" value={form.attemptLimit} onChange={(e) => setForm({ ...form, attemptLimit: e.target.value ? Number(e.target.value) : '' })} placeholder="Attempt limit (blank = unlimited)" className="h-11 rounded-full glass px-4 text-sm" />
            <div className="flex gap-4 items-center text-sm px-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.allowRetake} onChange={(e) => setForm({ ...form, allowRetake: e.target.checked })} className="h-4 w-4" /> Allow retakes</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFinal} onChange={(e) => setForm({ ...form, isFinal: e.target.checked })} className="h-4 w-4" /> Final exam</label>
            </div>
          </div>
          <button onClick={handleCreate} className="btn-primary w-full">CREATE & ADD QUESTIONS</button>
        </div>
      )}

      <div className="grid gap-3">
        {filtered.map((q) => {
          const course = courses.find((c) => c.id === q.courseId);
          const n = quizQuestions.filter((x) => x.quizId === q.id).length;
          const attempts = quizAttempts.filter((a) => a.quizId === q.id);
          return (
            <div key={q.id} className="glass rounded-[20px] p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[220px]">
                <div className="font-bold">{q.title} {q.isFinal && <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">FINAL</span>}</div>
                <div className="text-xs text-white/40 mt-1">{course?.title} • {n} questions • Pass {q.passingScore}% • {attempts.length} attempts {q.allowRetake ? '' : '• no retakes'}</div>
              </div>
              <button onClick={() => setManaging(q.id)} className="h-9 px-4 rounded-full bg-white text-black text-xs font-bold">MANAGE</button>
              <button onClick={async () => { if (confirm('Delete quiz and all its questions/attempts?')) { try { await deleteQuiz(q.id); audit(user, 'quiz.delete', 'quiz', q.id, {}); toast.success('Deleted'); } catch (err) { toast.error(err.message); } } }} className="h-9 w-9 rounded-full glass flex items-center justify-center text-red-300"><Trash2 className="h-4 w-4" /></button>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="glass rounded-2xl p-10 text-center text-white/40 text-sm">No quizzes yet. Create one — or generate with AI Studio.</div>}
      </div>
    </div>
  );
}
