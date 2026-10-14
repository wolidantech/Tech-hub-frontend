import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardCheck, FileQuestion, FolderOpen, GraduationCap, Loader2, RefreshCw, Save, Send, Trash2, UploadCloud, AlertTriangle, Clock3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  discardContentDraft, fetchAssignedSubmissions, fetchCourseCurriculum, fetchMyContentRevisions,
  fetchMyGradingRevisions, fetchMyLecturerCourses, saveContentDraft, saveGradeDraft,
  submitContent, submitGrade, uploadLecturerFile,
} from '../lib/lecturer';
import { toast, Toaster } from 'sonner';

const input = 'w-full min-h-11 rounded-xl glass px-3.5 text-sm min-w-0 focus:outline-none focus:border-cyan-400/50';
const label = 'block text-[11px] font-bold tracking-widest text-white/45 mb-1.5';
const statusStyle = (s) => ({
  draft: 'bg-white/10 text-white/70', pending_review: 'bg-amber-500/20 text-amber-200',
  approved: 'bg-cyan-500/20 text-cyan-200', published: 'bg-emerald-500/20 text-emerald-200',
  released: 'bg-emerald-500/20 text-emerald-200', changes_requested: 'bg-orange-500/20 text-orange-200',
  rejected: 'bg-rose-500/20 text-rose-200',
}[s] || 'bg-white/10 text-white/70');
export const prettyStatus = (s) => String(s || '').replaceAll('_', ' ');

function Chip({ status }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${statusStyle(status)}`}>{prettyStatus(status)}</span>; }

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [curriculum, setCurriculum] = useState({ modules: [], lessons: [], contents: [], quizzes: [], questions: [], assignments: [] });
  const [revisions, setRevisions] = useState([]);
  const [gradings, setGradings] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [uploadPct, setUploadPct] = useState(null);

  const [draft, setDraft] = useState({
    revisionId: '', itemType: 'lesson', operation: 'create', targetId: '', moduleId: '', title: '',
    type: 'text', duration: '', bodyMarkdown: '', videoUrl: '', storagePath: '', maxScore: 100,
    instructions: '', requiredOutput: '', deadline: '', submissionType: 'any', passingScore: 70,
    allowRetake: true, attemptLimit: '', isFinal: false,
  });
  const [questions, setQuestions] = useState([{ type: 'multiple_choice', question: '', optionsText: 'Option A, Option B', correctAnswer: 0, marks: 1, explanation: '' }]);
  const [gradeInputs, setGradeInputs] = useState({});

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true); setError('');
    try {
      const [cs, revs, grads] = await Promise.all([
        fetchMyLecturerCourses(user.id), fetchMyContentRevisions(user.id), fetchMyGradingRevisions(user.id),
      ]);
      setCourses(cs); setRevisions(revs); setGradings(grads);
      setCourseId((prev) => prev || cs[0]?.id || '');
      const subs = await fetchAssignedSubmissions(cs.map((c) => c.id));
      setSubmissions(subs);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!courseId) return;
    fetchCourseCurriculum(courseId).then(setCurriculum).catch((e) => setError(e.message));
  }, [courseId]);

  const course = courses.find((c) => c.id === courseId);
  const pendingMarks = useMemo(() => submissions.filter((s) => !gradings.some((g) => g.submission_id === s.id && ['approved', 'released'].includes(g.status))), [submissions, gradings]);
  const awaiting = revisions.filter((r) => r.status === 'pending_review').length + gradings.filter((g) => g.status === 'pending_review').length;

  const act = async (key, fn, okMsg) => {
    if (busy) return; setBusy(key); setError('');
    try { await fn(); if (okMsg) toast.success(okMsg); await load(); }
    catch (err) { setError(err.message); toast.error(err.message); }
    finally { setBusy(''); }
  };

  const payloadFor = () => {
    const base = { title: draft.title, moduleId: draft.moduleId || undefined };
    if (draft.itemType === 'module') return { title: draft.title, position: 0 };
    if (draft.itemType === 'lesson' || draft.itemType === 'material') return { ...base, type: draft.type, duration: draft.duration, bodyMarkdown: draft.bodyMarkdown, videoUrl: draft.videoUrl || undefined, storagePath: draft.storagePath || undefined, resources: draft.storagePath ? [{ name: 'Teaching material', storagePath: draft.storagePath, bucket: 'lecturer-files' }] : [] };
    if (draft.itemType === 'quiz') return { ...base, passingScore: Number(draft.passingScore) || 70, allowRetake: !!draft.allowRetake, attemptLimit: draft.attemptLimit === '' ? undefined : Number(draft.attemptLimit), isFinal: !!draft.isFinal, questions: questions.map((q) => ({ type: q.type, question: q.question, options: q.optionsText.split(',').map((x) => x.trim()).filter(Boolean), correctAnswer: Number(q.correctAnswer) || 0, marks: Number(q.marks) || 1, explanation: q.explanation })) };
    return { ...base, instructions: draft.instructions, requiredOutput: draft.requiredOutput, maxScore: Number(draft.maxScore) || 100, deadline: draft.deadline || undefined, submissionType: draft.submissionType, isFinalProject: !!draft.isFinal };
  };

  const saveDraft = (submit = false) => act(submit ? 'submit-new' : 'save-new', async () => {
    if (!courseId) throw new Error('Select one of your assigned courses first.');
    if (!draft.title.trim() && draft.itemType !== 'material') throw new Error('Give the item a title first.');
    const saved = await saveContentDraft({ courseId, itemType: draft.itemType, operation: draft.operation, targetId: draft.targetId || null, payload: payloadFor(), revisionId: draft.revisionId || null });
    if (submit) await submitContent(saved.id);
    setDraft((d) => ({ ...d, revisionId: submit ? '' : saved.id }));
  }, submit ? 'Submitted for administrator review.' : 'Draft saved on the server.');

  const onMaterialFile = async (file) => {
    if (!file || !courseId) return;
    setUploadPct(0); setError('');
    try {
      const path = await uploadLecturerFile(user.id, courseId, file, setUploadPct);
      setDraft((d) => ({ ...d, storagePath: path, itemType: 'material', title: d.title || file.name }));
      toast.success('Material uploaded privately. Save it as a draft, then submit for review.');
    } catch (err) { setError(err.message); }
    finally { setUploadPct(null); }
  };

  const editRevision = (r) => {
    const p = r.payload || {};
    setCourseId(r.course_id);
    setDraft({
      revisionId: r.id, itemType: r.item_type, operation: r.operation, targetId: r.target_id || '',
      moduleId: p.moduleId || '', title: p.title || r.title || '', type: p.type || 'text', duration: p.duration || '',
      bodyMarkdown: p.bodyMarkdown || '', videoUrl: p.videoUrl || '', storagePath: p.storagePath || '',
      maxScore: p.maxScore || 100, instructions: p.instructions || '', requiredOutput: p.requiredOutput || '',
      deadline: p.deadline ? String(p.deadline).slice(0, 16) : '', submissionType: p.submissionType || 'any',
      passingScore: p.passingScore || 70, allowRetake: p.allowRetake !== false, attemptLimit: p.attemptLimit ?? '', isFinal: !!p.isFinalProject || !!p.isFinal,
    });
    if (Array.isArray(p.questions) && p.questions.length) setQuestions(p.questions.map((q) => ({ type: q.type || 'multiple_choice', question: q.question || '', optionsText: (q.options || []).join(', '), correctAnswer: q.correctAnswer ?? 0, marks: q.marks || 1, explanation: q.explanation || '' })));
    setTab(r.item_type === 'quiz' ? 'quizzes' : r.item_type === 'assignment' ? 'assignments' : 'studio');
  };

  const tabs = [
    ['overview', 'Overview', GraduationCap], ['courses', 'My Courses', BookOpen], ['studio', 'Modules & Lessons', FolderOpen],
    ['quizzes', 'Quizzes', FileQuestion], ['assignments', 'Assignments', ClipboardCheck], ['submissions', 'Student Submissions', UploadCloud], ['requests', 'My Review Requests', Clock3],
  ];
  const targets = draft.itemType === 'module' ? curriculum.modules : draft.itemType === 'quiz' ? curriculum.quizzes : draft.itemType === 'assignment' ? curriculum.assignments : curriculum.lessons;

  return (
    <div className="min-h-screen max-w-full overflow-x-clip bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-6 sm:py-10">
      <Toaster richColors />
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-[28px] sm:text-[32px] font-black leading-tight">Lecturer Dashboard</h1>
            <p className="text-sm text-white/55 break-words">{user?.fullName} • Lecturer access only • Content and marks go live only after administrator review.</p>
          </div>
          <button onClick={load} disabled={loading} className="min-h-11 rounded-full glass px-4 text-xs font-bold inline-flex items-center gap-2 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> REFRESH</button>
        </div>

        {error && <div role="alert" className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100 flex gap-2"><AlertTriangle className="h-5 w-5 shrink-0" /><span className="min-w-0 break-words">{error}</span></div>}

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" role="tablist" aria-label="Lecturer sections">
          {tabs.map(([id, text, Icon]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-bold inline-flex items-center gap-2 ${tab === id ? 'bg-white text-black' : 'glass text-white/70'}`}><Icon className="h-4 w-4" />{text}</button>
          ))}
        </div>

        {loading ? <div className="glass mt-6 rounded-3xl p-8 text-sm text-white/60 flex gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading your assigned workspace…</div> : (
          <>
            {tab === 'overview' && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[['Assigned courses', courses.length], ['Submissions awaiting marking', pendingMarks.length], ['Awaiting admin decision', awaiting], ['Published / released', revisions.filter((r) => r.status === 'published').length + gradings.filter((g) => g.status === 'released').length]].map(([k, v]) => (
                  <div key={k} className="glass rounded-3xl p-5"><div className="text-[11px] font-bold tracking-widest text-white/45">{k.toUpperCase()}</div><div className="mt-2 text-3xl font-black">{v}</div></div>
                ))}
                <div className="glass rounded-3xl p-5 sm:col-span-2 lg:col-span-4 text-sm text-white/60">Drafts are private. <b className="text-white">Pending Review</b> work is invisible to students; only an administrator can publish content or release marks.</div>
              </div>
            )}

            {tab === 'courses' && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {courses.map((c) => <div key={c.id} className="glass rounded-3xl p-5"><h3 className="font-bold break-words">{c.title}</h3><p className="mt-1 text-xs text-white/50">{c.category} • {c.published ? 'Live course' : 'Not published yet'}</p><button className="mt-4 min-h-11 rounded-full bg-white text-black px-4 text-xs font-black" onClick={() => { setCourseId(c.id); setTab('studio'); }}>OPEN WORKSPACE</button></div>)}
                {!courses.length && <div className="glass rounded-3xl p-6 text-sm text-white/55 md:col-span-2">No courses assigned yet. An administrator assigns courses under Admin → Lecturers.</div>}
              </div>
            )}

            {(tab === 'studio' || tab === 'quizzes' || tab === 'assignments') && (
              <div className="mt-6 glass rounded-3xl p-5 sm:p-6 space-y-4">
                <h2 className="font-bold text-lg">{tab === 'quizzes' ? 'Prepare a quiz' : tab === 'assignments' ? 'Set an assignment' : 'Modules, lessons & materials'}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div><label className={label} htmlFor="lec-course">ASSIGNED COURSE</label><select id="lec-course" className={input} value={courseId} onChange={(e) => setCourseId(e.target.value)}>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
                  <div><label className={label} htmlFor="lec-kind">ITEM TYPE</label><select id="lec-kind" className={input} value={draft.itemType} onChange={(e) => setDraft({ ...draft, itemType: e.target.value, targetId: '', operation: 'create' })}><option value="module">Module</option><option value="lesson">Lesson</option><option value="material">Teaching material</option><option value="quiz">Quiz</option><option value="assignment">Assignment</option></select></div>
                  <div><label className={label} htmlFor="lec-op">ACTION</label><select id="lec-op" className={input} value={draft.operation} onChange={(e) => setDraft({ ...draft, operation: e.target.value, targetId: '' })}><option value="create">Create new</option><option value="update">Revise published item (creates a review copy)</option><option value="delete">Request deletion</option></select></div>
                  {draft.operation !== 'create' && <div><label className={label} htmlFor="lec-target">LIVE ITEM</label><select id="lec-target" className={input} value={draft.targetId} onChange={(e) => setDraft({ ...draft, targetId: e.target.value })}><option value="">Select…</option>{targets.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></div>}
                  {draft.itemType !== 'module' && <div><label className={label} htmlFor="lec-module">MODULE</label><select id="lec-module" className={input} value={draft.moduleId} onChange={(e) => setDraft({ ...draft, moduleId: e.target.value })}><option value="">Select module…</option>{curriculum.modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select></div>}
                  <div className="md:col-span-2"><label className={label} htmlFor="lec-title">TITLE</label><input id="lec-title" className={input} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Introduction to spreadsheets" /></div>
                </div>

                {(draft.itemType === 'lesson' || draft.itemType === 'material') && <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div><label className={label} htmlFor="lec-type">LESSON TYPE</label><select id="lec-type" className={input} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}><option value="text">Written lesson</option><option value="video">Video lesson</option></select></div>
                    <div><label className={label} htmlFor="lec-duration">DURATION</label><input id="lec-duration" className={input} value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} placeholder="e.g. 12 min" /></div>
                  </div>
                  <div><label className={label} htmlFor="lec-body">LESSON CONTENT</label><textarea id="lec-body" rows={7} className={`${input} h-auto py-3`} value={draft.bodyMarkdown} onChange={(e) => setDraft({ ...draft, bodyMarkdown: e.target.value })} placeholder="Write the lesson here…" /></div>
                  <div><label className={label} htmlFor="lec-video">VIDEO URL (OPTIONAL)</label><input id="lec-video" inputMode="url" className={input} value={draft.videoUrl} onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })} placeholder="https://…" /></div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <label className={label} htmlFor="lec-file">UPLOAD TEACHING MATERIAL (PRIVATE UNTIL PUBLISHED)</label>
                    <input id="lec-file" type="file" className="block w-full max-w-full text-sm" onChange={(e) => onMaterialFile(e.target.files?.[0])} />
                    {uploadPct !== null && <div className="mt-3"><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-400 transition-all" style={{ width: `${uploadPct}%` }} /></div><p className="mt-1 text-xs text-white/55">Uploading… {uploadPct}% — keep this page open on slow connections.</p></div>}
                    {draft.storagePath && <p className="mt-2 break-all text-xs text-emerald-300">Uploaded: {draft.storagePath}</p>}
                  </div>
                </>}

                {draft.itemType === 'quiz' && <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div><label className={label} htmlFor="lec-pass">PASS MARK %</label><input id="lec-pass" type="number" min="0" max="100" className={input} value={draft.passingScore} onChange={(e) => setDraft({ ...draft, passingScore: e.target.value })} /></div>
                    <div><label className={label} htmlFor="lec-limit">ATTEMPT LIMIT (BLANK = UNLIMITED)</label><input id="lec-limit" type="number" min="1" className={input} value={draft.attemptLimit} onChange={(e) => setDraft({ ...draft, attemptLimit: e.target.value })} /></div>
                    <label className="flex min-h-11 items-center gap-2 text-sm pt-5"><input type="checkbox" checked={draft.allowRetake} onChange={(e) => setDraft({ ...draft, allowRetake: e.target.checked })} className="h-4 w-4" /> Allow retake</label>
                  </div>
                  {questions.map((q, i) => (
                    <fieldset key={i} className="rounded-2xl border border-white/10 p-4 space-y-3">
                      <legend className="px-1 text-xs font-black">QUESTION {i + 1}</legend>
                      <input aria-label={`Question ${i + 1}`} className={input} value={q.question} onChange={(e) => setQuestions(questions.map((x, j) => j === i ? { ...x, question: e.target.value } : x))} placeholder="Question" />
                      <input aria-label={`Options for question ${i + 1}`} className={input} value={q.optionsText} onChange={(e) => setQuestions(questions.map((x, j) => j === i ? { ...x, optionsText: e.target.value } : x))} placeholder="Options, separated by commas" />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <input aria-label="Correct option number" type="number" min="1" className={input} value={Number(q.correctAnswer) + 1} onChange={(e) => setQuestions(questions.map((x, j) => j === i ? { ...x, correctAnswer: Math.max(0, Number(e.target.value) - 1) } : x))} placeholder="Correct option #" />
                        <input aria-label="Marks" type="number" min="1" className={input} value={q.marks} onChange={(e) => setQuestions(questions.map((x, j) => j === i ? { ...x, marks: e.target.value } : x))} placeholder="Marks" />
                        <input aria-label="Explanation" className={input} value={q.explanation} onChange={(e) => setQuestions(questions.map((x, j) => j === i ? { ...x, explanation: e.target.value } : x))} placeholder="Explanation (shown after scoring)" />
                      </div>
                      <p className="text-[11px] text-white/40">Correct answers are stored only in your private revision and the server-side question bank — never sent to student browsers.</p>
                    </fieldset>
                  ))}
                  <button className="min-h-11 rounded-full glass px-4 text-xs font-bold" onClick={() => setQuestions([...questions, { type: 'multiple_choice', question: '', optionsText: '', correctAnswer: 0, marks: 1, explanation: '' }])}>+ ADD QUESTION</button>
                </div>}

                {draft.itemType === 'assignment' && <div className="space-y-4">
                  <div><label className={label} htmlFor="lec-inst">INSTRUCTIONS</label><textarea id="lec-inst" rows={5} className={`${input} h-auto py-3`} value={draft.instructions} onChange={(e) => setDraft({ ...draft, instructions: e.target.value })} /></div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div><label className={label} htmlFor="lec-out">REQUIRED OUTPUT</label><input id="lec-out" className={input} value={draft.requiredOutput} onChange={(e) => setDraft({ ...draft, requiredOutput: e.target.value })} /></div>
                    <div><label className={label} htmlFor="lec-max">MAXIMUM MARKS</label><input id="lec-max" type="number" min="1" className={input} value={draft.maxScore} onChange={(e) => setDraft({ ...draft, maxScore: e.target.value })} /></div>
                    <div><label className={label} htmlFor="lec-dead">DEADLINE</label><input id="lec-dead" type="datetime-local" className={input} value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} /></div>
                  </div>
                  <div><label className={label} htmlFor="lec-subtype">SUBMISSION REQUIREMENT</label><select id="lec-subtype" className={input} value={draft.submissionType} onChange={(e) => setDraft({ ...draft, submissionType: e.target.value })}><option value="any">File, text or link</option><option value="file">File only</option><option value="text">Text only</option><option value="link">Link only</option></select></div>
                </div>}

                <div className="flex flex-col min-[480px]:flex-row gap-2 pt-1">
                  <button disabled={!!busy} onClick={() => saveDraft(false)} className="min-h-11 flex-1 rounded-full glass px-4 text-xs font-black disabled:opacity-60 inline-flex justify-center items-center gap-2"><Save className="h-4 w-4" />{busy === 'save-new' ? 'SAVING…' : 'SAVE DRAFT'}</button>
                  <button disabled={!!busy} onClick={() => saveDraft(true)} className="min-h-11 flex-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-4 text-xs font-black text-[#020617] disabled:opacity-60 inline-flex justify-center items-center gap-2"><Send className="h-4 w-4" />{busy === 'submit-new' ? 'SUBMITTING…' : 'SUBMIT FOR REVIEW'}</button>
                </div>
                <p className="text-[11px] text-white/40">Editing a published item creates a separate revision — the live version students see does not change until an admin approves and publishes your exact submitted version.</p>
              </div>
            )}

            {tab === 'submissions' && (
              <div className="mt-6 space-y-4">
                {submissions.map((s) => {
                  const g = gradings.find((x) => x.submission_id === s.id);
                  const val = gradeInputs[s.id] || { score: g?.proposed_score ?? '', feedback: g?.proposed_feedback ?? '', id: g?.id || '' };
                  return (
                    <article key={s.id} className="glass rounded-3xl p-5 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0"><h3 className="font-bold break-words">{s.student_name || 'Student submission'}</h3><p className="text-xs text-white/50 break-words">{s.file_name || s.kind || 'Submission'} • {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : ''} • Official status: {prettyStatus(s.status)}</p></div>
                        {g ? <Chip status={g.status} /> : <Chip status="draft" />}
                      </div>
                      {s.text_content && <p className="whitespace-pre-wrap break-words rounded-xl bg-white/[0.04] p-3 text-sm">{s.text_content}</p>}
                      {s.link_url && <a className="break-all text-sm text-cyan-300 underline" href={s.link_url} target="_blank" rel="noreferrer">Open submitted link</a>}
                      {s.storage_path && <p className="break-all text-xs text-white/50">Private file: {s.storage_path} (download through the admin-reviewed student submission viewer; never share this path publicly.)</p>}
                      <div className="grid gap-3 md:grid-cols-[140px_1fr]">
                        <input aria-label="Proposed score" type="number" min="0" className={input} value={val.score} disabled={g && !['draft', 'changes_requested', 'rejected'].includes(g.status)} onChange={(e) => setGradeInputs({ ...gradeInputs, [s.id]: { ...val, score: e.target.value } })} placeholder="Score" />
                        <textarea aria-label="Proposed feedback" rows={3} className={`${input} h-auto py-3`} value={val.feedback} disabled={g && !['draft', 'changes_requested', 'rejected'].includes(g.status)} onChange={(e) => setGradeInputs({ ...gradeInputs, [s.id]: { ...val, feedback: e.target.value } })} placeholder="Feedback for the student (released only after admin approval)" />
                      </div>
                      <div className="flex flex-col min-[480px]:flex-row gap-2">
                        <button disabled={!!busy} className="min-h-11 rounded-full glass px-4 text-xs font-black disabled:opacity-60" onClick={() => act(`grade-${s.id}`, async () => { const saved = await saveGradeDraft(s.id, val.score, val.feedback, val.id || null); setGradeInputs({ ...gradeInputs, [s.id]: { ...val, id: saved.id } }); }, 'Marking draft saved on the server.')}>SAVE MARKING DRAFT</button>
                        <button disabled={!!busy} className="min-h-11 rounded-full bg-white px-4 text-xs font-black text-black disabled:opacity-60" onClick={() => act(`submit-grade-${s.id}`, async () => { const saved = val.id ? { id: val.id } : await saveGradeDraft(s.id, val.score, val.feedback, null); await submitGrade(saved.id); }, 'Marking submitted for administrator review.')}>SUBMIT MARKING FOR REVIEW</button>
                      </div>
                      {g?.review_reason && <p className="text-xs text-orange-200">Administrator: {g.review_reason}</p>}
                    </article>
                  );
                })}
                {!submissions.length && <div className="glass rounded-3xl p-6 text-sm text-white/55">No student submissions for your assigned courses yet.</div>}
              </div>
            )}

            {tab === 'requests' && (
              <div className="mt-6 space-y-4">
                {[...revisions.map((r) => ({ ...r, kind: 'content' })), ...gradings.map((g) => ({ ...g, kind: 'grading', item_type: 'marking', title: 'Assignment marking' }))].map((r) => (
                  <article key={`${r.kind}-${r.id}`} className="glass rounded-3xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0"><h3 className="font-bold break-words">{r.title || r.item_type}</h3><p className="text-xs text-white/50">{r.kind} • {prettyStatus(r.item_type)} • v{r.submitted_version || r.revision_version} • {new Date(r.updated_at).toLocaleString()}</p></div><Chip status={r.status} />
                    </div>
                    {r.review_reason && <p className="mt-3 rounded-xl bg-orange-500/10 p-3 text-sm text-orange-100">Administrator feedback: {r.review_reason}</p>}
                    {r.kind === 'content' && <pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black/25 p-3 text-[11px] text-white/65">{JSON.stringify(r.payload, null, 2)}</pre>}
                    {r.kind === 'grading' && <p className="mt-3 text-sm text-white/70">Proposed score: <b>{r.proposed_score}</b><br />Feedback: {r.proposed_feedback || '—'}</p>}
                    {['draft', 'changes_requested', 'rejected'].includes(r.status) && r.kind === 'content' && (
                      <div className="mt-4 flex flex-col min-[480px]:flex-row gap-2">
                        <button className="min-h-11 rounded-full glass px-4 text-xs font-black" onClick={() => editRevision(r)}>REVISE</button>
                        <button disabled={!!busy} className="min-h-11 rounded-full bg-white px-4 text-xs font-black text-black disabled:opacity-60" onClick={() => act(`resubmit-${r.id}`, () => submitContent(r.id), 'Resubmitted for review.')}>RESUBMIT</button>
                        <button disabled={!!busy} className="min-h-11 rounded-full glass px-4 text-xs font-black text-rose-200 disabled:opacity-60 inline-flex items-center justify-center gap-1" onClick={() => act(`discard-${r.id}`, () => discardContentDraft(r.id), 'Draft discarded.')}><Trash2 className="h-4 w-4" /> DISCARD</button>
                      </div>
                    )}
                  </article>
                ))}
                {!revisions.length && !gradings.length && <div className="glass rounded-3xl p-6 text-sm text-white/55">No review requests yet. Save a draft from Modules & Lessons, Quizzes or Assignments.</div>}
              </div>
            )}
          </>
        )}
        <p className="mt-8 text-center text-xs text-white/40">Need access to another course? Ask an administrator — assignments are controlled in Admin → Lecturers. <Link className="text-cyan-300 underline" to="/dashboard">Student dashboard</Link></p>
      </div>
    </div>
  );
}
