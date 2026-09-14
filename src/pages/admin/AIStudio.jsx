import { useState } from 'react';
import { Sparkles, X, RefreshCw, Check, Trash2, Eye, Upload, ChevronDown } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useLMS } from '../../context/LMSContext';
import { useAuth } from '../../context/AuthContext';
import { AI_KINDS, getActiveProviderName, isCloudAIEnabled } from '../../lib/ai';
import { renderLessonMarkdown } from '../../lib/lms';
import { toast } from 'sonner';

const STATUS_STYLE = {
  draft: 'bg-white/10 text-white/60',
  in_review: 'bg-amber-500/20 text-amber-300',
  approved: 'bg-blue-500/20 text-blue-300',
  published: 'bg-green-500/20 text-green-300',
  archived: 'bg-white/5 text-white/30',
};

export default function AIStudio() {
  const { user } = useAuth();
  const { courses, addCourse, addModule, addLesson } = useCourses();
  const { aiContent, aiJobs, runAIGeneration, updateAIContent, setAIStatus, deleteAIContent, createQuiz, addQuestion, createAssignment, categories } = useLMS();
  const [kind, setKind] = useState('course_outline');
  const [form, setForm] = useState({ courseName: '', category: '', level: 'Beginner', duration: '8 weeks', numModules: 6, objectives: '', instructions: '', topic: '', objective: '', style: 'beginner-friendly practical teaching', numQuestions: 5, output: '', voiceGender: 'female', voiceLang: 'en', voiceSpeed: 1, teachingStyle: 'friendly coach' });
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null);
  const [editJson, setEditJson] = useState('');
  const [applyTarget, setApplyTarget] = useState('');
  const [applyOpen, setApplyOpen] = useState(null);

  const F = (k, placeholder, type = 'text') => (
    <input type={type} value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={placeholder} className="w-full h-11 rounded-full glass px-4 text-sm" />
  );

  const handleGenerate = async () => {
    if (kind === 'course_outline' && !form.courseName.trim()) return toast.error('Course name required');
    if (kind !== 'course_outline' && !form.topic.trim() && !form.courseName.trim()) return toast.error('Topic required');
    setGenerating(true);
    try {
      const input = { ...form, topic: form.topic || form.courseName, voice: { gender: form.voiceGender, language: form.voiceLang, speed: Number(form.voiceSpeed), teachingStyle: form.teachingStyle } };
      const content = await runAIGeneration(kind, input, { actor: user });
      toast.success(`Draft generated (${content.provider}) — review before publishing`);
      setPreview(content.id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async (item) => {
    setGenerating(true);
    try {
      const content = await runAIGeneration(item.kind, item.input, { actor: user });
      toast.success('Regenerated as a new draft');
      setPreview(content.id);
    } catch (err) { toast.error(err.message); } finally { setGenerating(false); }
  };

  // Apply approved content into the live catalog (course stays UNPUBLISHED until reviewed)
  const applyContent = async (item) => {
    try {
      if (item.kind === 'course_outline') {
        const d = item.data;
        const slug = d.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (courses.some((c) => c.slug === slug)) { toast.error('A course with this title already exists'); return; }
        const created = await addCourse({
          slug, title: d.title.toUpperCase(), shortDescription: (d.description || '').slice(0, 120),
          description: d.description, longDescription: d.description, category: d.category || 'General',
          instructor: 'Woli Dan', instructorRole: 'Instructor', duration: d.duration,
          level: d.level, price: 5000, originalPrice: 10000,
          thumbnail: 'default', published: false, featured: false,
          whatYouWillLearn: d.learningObjectives || [],
        });
        for (const [i, m] of (d.modules || []).entries()) {
          const mod = await addModule(created.id, `Module ${i + 1}: ${m.title}`);
          for (const l of (m.lessons || [])) {
            await addLesson(created.id, mod.id, { title: l.title, type: 'text', duration: l.duration || '15:00', videoUrl: '', textContent: `# ${l.title}\n\n${l.description || ''}\n\n## Key concepts\n\n${(l.keyConcepts || []).map((k) => `- ${k}`).join('\n')}` });
          }
          // auto-create draft quiz shell (questions are added in the Quizzes tab)
          if (m.quiz) await createQuiz({ courseId: created.id, title: `Module ${i + 1} Quiz: ${m.title}`, passingScore: m.quiz.passingScore || 70, allowRetake: true, status: 'draft' });
        }
        if (d.finalProject) await createAssignment({ courseId: created.id, title: 'Final Project', description: d.finalProject, instructions: 'Complete and submit your final project.', requiredOutput: d.finalProject, isFinalProject: true, status: 'draft' });
        toast.success('Course created as UNPUBLISHED with draft quizzes/assignment. Review in Courses tab.');
      } else if (item.kind === 'quiz') {
        if (!applyTarget) { toast.error('Select a target course'); return; }
        const q = await createQuiz({ courseId: applyTarget, title: item.data.title || form.topic, passingScore: item.data.passingScore || 70, allowRetake: true, status: 'draft' });
        for (const qq of (item.data.questions || [])) {
          await addQuestion(q.id, { type: qq.type, question: qq.question, options: qq.options, correctAnswer: qq.correctAnswer ?? 0, correctAnswers: qq.correctAnswers || [], acceptedAnswers: qq.acceptedAnswers || [], explanation: qq.explanation || '' });
        }
        toast.success(`Quiz imported as DRAFT into course (${item.data.questions?.length || 0} questions). Publish from Quizzes tab.`);
      } else if (item.kind === 'assignment') {
        if (!applyTarget) { toast.error('Select a target course'); return; }
        await createAssignment({ courseId: applyTarget, title: item.data.title, description: item.data.description, instructions: item.data.instructions, requiredOutput: item.data.requiredOutput, maxScore: 100, status: 'draft' });
        toast.success('Assignment imported as DRAFT. Publish from Assignments tab.');
      } else if (item.kind === 'lesson_text') {
        toast.info('Copy the lesson text below into a lesson via Courses → Curriculum → Edit Lesson.');
      }
      await setAIStatus(item.id, 'published', user);
      setApplyOpen(null);
    } catch (err) { toast.error(err.message); }
  };

  const renderData = (item) => {
    const d = item.data;
    if (!d) return <div className="text-sm text-white/40">Empty draft</div>;
    if (item.kind === 'course_outline') {
      return (
        <div className="space-y-4 text-sm">
          <p className="text-white/70 leading-relaxed">{d.description}</p>
          <div><div className="font-bold mb-1">Objectives</div><ul className="list-disc pl-5 text-white/60 space-y-0.5">{(d.learningObjectives || []).map((o, i) => <li key={i}>{o}</li>)}</ul></div>
          {(d.modules || []).map((m, i) => (
            <div key={i} className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <div className="font-bold">Module {i + 1}: {m.title}</div>
              <div className="text-white/50 text-xs mt-0.5">{m.summary}</div>
              <ul className="mt-2 space-y-1">{(m.lessons || []).map((l, j) => <li key={j} className="text-xs text-white/60">• {l.title}</li>)}</ul>
              {m.practical && <div className="text-xs text-amber-200/80 mt-2">🛠 {m.practical}</div>}
            </div>
          ))}
          {d.finalProject && <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-3 text-xs"><span className="font-bold text-purple-300">Final Project: </span>{d.finalProject}</div>}
        </div>
      );
    }
    if (item.kind === 'lesson_text' || item.kind === 'summary' || item.kind === 'notes') {
      return <div className="lesson-body" dangerouslySetInnerHTML={{ __html: renderLessonMarkdown(d.markdown || '') }} />;
    }
    if (item.kind === 'exercise') {
      return (
        <div className="space-y-2 text-sm">
          <div className="font-bold text-base">🛠 {d.title}</div>
          <ol className="list-decimal pl-5 space-y-1 text-white/70">{(d.steps || []).map((s, i) => <li key={i}>{s}</li>)}</ol>
          <div className="text-xs"><span className="font-bold text-cyan-300">Deliverable: </span>{d.deliverable}</div>
          <div className="text-xs text-white/40">~{d.estimatedMinutes} mins • {d.level}</div>
        </div>
      );
    }
    if (item.kind === 'flashcards') {
      return (
        <div className="space-y-2 text-sm">
          <div className="font-bold text-base">🃏 {d.title}</div>
          {(d.cards || []).map((c, i) => (
            <div key={i} className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <div className="font-bold text-xs text-purple-300">FRONT</div>
              <div>{c.front}</div>
              <div className="font-bold text-xs text-green-300 mt-2">BACK</div>
              <div className="text-white/70">{c.back}</div>
            </div>
          ))}
        </div>
      );
    }
    if (item.kind === 'quiz') {
      return (
        <div className="space-y-2 text-sm">
          {(d.questions || []).map((q, i) => (
            <div key={i} className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <div className="font-bold">Q{i + 1}. {q.question}</div>
              <div className="mt-1 text-xs space-y-0.5">{(q.options || []).map((o, oi) => {
                const ok = q.type === 'multiple_answer' ? q.correctAnswers?.includes(oi) : q.correctAnswer === oi;
                return <div key={oi} className={ok ? 'text-green-300 font-bold' : 'text-white/50'}>{ok ? '✓ ' : '• '}{o}</div>;
              })}</div>
              {q.explanation && <div className="text-xs text-white/40 mt-1">💡 {q.explanation}</div>}
            </div>
          ))}
        </div>
      );
    }
    if (item.kind === 'assignment') {
      return (
        <div className="space-y-2 text-sm">
          <div className="font-bold text-base">{d.title}</div>
          <p className="text-white/60">{d.description}</p>
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 whitespace-pre-line text-white/70">{d.instructions}</div>
          <div className="text-xs"><span className="font-bold text-cyan-300">Required output: </span>{d.requiredOutput}</div>
        </div>
      );
    }
    if (item.kind === 'video_script' || item.kind === 'voiceover' || item.kind === 'lesson_script') {
      return (
        <div className="space-y-2 text-sm">
          <div className="font-bold">{d.title}</div>
          <div className="text-xs text-white/50">Voice: {d.voice?.gender} • {d.voice?.language} • {d.voice?.speed}x • {d.voice?.style} • ~{d.estimatedWords} words</div>
          {(d.scenes || []).map((s, i) => (
            <div key={i} className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <div className="text-[11px] font-bold text-cyan-300">{s.time} • 🎬 {s.visual}</div>
              <div className="text-white/70 mt-1 italic">🎙 "{s.narration}"</div>
            </div>
          ))}
          {d.subtitles && <pre className="text-[11px] font-mono bg-black/40 rounded-xl p-3 overflow-x-auto text-white/60">{d.subtitles}</pre>}
        </div>
      );
    }
    return <pre className="text-xs font-mono bg-black/40 rounded-xl p-3 overflow-x-auto">{JSON.stringify(d, null, 2)}</pre>;
  };

  const previewItem = aiContent.find((c) => c.id === preview);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-xl flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-300" /> AI Content Studio</h2>
        <p className="text-sm text-white/50 mt-1">
          Provider: <span className="font-mono font-bold text-cyan-300">{getActiveProviderName()}</span> {isCloudAIEnabled() ? '(secure backend — keys never in frontend)' : '(offline templates — set VITE_AI_ENDPOINT for cloud AI)'}
          {' '}• All output starts as <span className="font-bold text-white/80">DRAFT</span> and requires your review.
        </p>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        {/* Generator */}
        <div className="glass rounded-[20px] p-6 space-y-4 h-fit">
          <div className="flex flex-wrap gap-2">
            {AI_KINDS.map((k) => (
              <button key={k.id} onClick={() => setKind(k.id)} title={k.desc} className={`px-3 py-2 rounded-full text-xs font-bold ${kind === k.id ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black' : 'glass text-white/60 hover:text-white'}`}>{k.label}</button>
            ))}
          </div>

          {kind === 'course_outline' && (
            <div className="space-y-3">
              {F('courseName', 'Course Name (e.g. Video Editing with CapCut)')}
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-11 rounded-full glass px-4 text-sm">
                  <option className="bg-[#061236]" value="">Category</option>
                  {categories.map((c) => <option className="bg-[#061236]" key={c} value={c}>{c}</option>)}
                </select>
                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="h-11 rounded-full glass px-4 text-sm">
                  {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((l) => <option className="bg-[#061236]" key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
                {F('duration', 'Duration (e.g. 8 weeks)')}
                <input type="number" min="2" max="12" value={form.numModules} onChange={(e) => setForm({ ...form, numModules: e.target.value })} placeholder="Modules" className="h-11 rounded-full glass px-4 text-sm" />
              </div>
              <textarea value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} placeholder="Learning objectives" className="w-full rounded-2xl glass p-4 text-sm h-20" />
              <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Special instructions (optional)" className="w-full rounded-2xl glass p-4 text-sm h-16" />
            </div>
          )}

          {kind !== 'course_outline' && (
            <div className="space-y-3">
              {F('topic', kind === 'quiz' ? 'Quiz Topic' : 'Lesson Topic (e.g. Introduction to Canva)')}
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="h-11 rounded-full glass px-4 text-sm">
                  {['Beginner', 'Intermediate', 'Advanced'].map((l) => <option className="bg-[#061236]" key={l} value={l}>{l}</option>)}
                </select>
                {(kind === 'video_script' || kind === 'voiceover' || kind === 'lesson_text') && F('duration', 'Duration (e.g. 10 minutes)')}
                {kind === 'quiz' && <input type="number" min="3" max="20" value={form.numQuestions} onChange={(e) => setForm({ ...form, numQuestions: e.target.value })} placeholder="Questions" className="h-11 rounded-full glass px-4 text-sm" />}
              </div>
              {F('objective', 'Teaching objective (optional)')}
              {F('style', 'Teaching style (e.g. beginner-friendly practical)')}
              {(kind === 'video_script' || kind === 'voiceover') && (
                <div className="rounded-2xl border border-white/10 p-3 space-y-2">
                  <div className="text-xs font-bold text-white/40">AI INSTRUCTOR VOICE</div>
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
                    <select value={form.voiceGender} onChange={(e) => setForm({ ...form, voiceGender: e.target.value })} className="h-10 rounded-full glass px-3 text-xs">
                      <option className="bg-[#061236]" value="female">Female voice</option>
                      <option className="bg-[#061236]" value="male">Male voice</option>
                    </select>
                    <select value={form.voiceLang} onChange={(e) => setForm({ ...form, voiceLang: e.target.value })} className="h-10 rounded-full glass px-3 text-xs">
                      <option className="bg-[#061236]" value="en">English</option>
                      <option className="bg-[#061236]" value="en-NG" disabled>Nigerian English (soon)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
                    <select value={form.voiceSpeed} onChange={(e) => setForm({ ...form, voiceSpeed: e.target.value })} className="h-10 rounded-full glass px-3 text-xs">
                      <option className="bg-[#061236]" value="0.9">0.9x speed</option>
                      <option className="bg-[#061236]" value="1">1.0x speed</option>
                      <option className="bg-[#061236]" value="1.1">1.1x speed</option>
                    </select>
                    <input value={form.teachingStyle} onChange={(e) => setForm({ ...form, teachingStyle: e.target.value })} placeholder="Style" className="h-10 rounded-full glass px-3 text-xs" />
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={handleGenerate} disabled={generating} className="w-full btn-primary !py-3.5 disabled:opacity-50">
            <Sparkles className="h-4 w-4 mr-2" /> {generating ? 'GENERATING...' : 'GENERATE DRAFT'}
          </button>
          <div className="text-[11px] text-white/30 leading-relaxed">AI output is a starting draft. Always review for accuracy before approving — unverified AI content must never be presented as guaranteed fact.</div>
        </div>

        {/* Drafts */}
        <div className="space-y-4">
          <h3 className="font-bold">Generated Content ({aiContent.length})</h3>
          {aiContent.length === 0 && <div className="glass rounded-2xl p-10 text-center text-white/40 text-sm">No AI drafts yet. Generate your first course outline, lesson, quiz or script.</div>}
          {aiContent.map((item) => (
            <div key={item.id} className="glass rounded-[20px] p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0 sm:min-w-[200px]">
                  <div className="font-bold text-sm">{item.title}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">{item.kind} • {item.provider} • {new Date(item.createdAt).toLocaleString()}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLE[item.status]}`}>{item.status.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <button onClick={() => setPreview(preview === item.id ? null : item.id)} className="h-8 px-3 rounded-full glass text-[11px] font-bold flex items-center gap-1"><Eye className="h-3 w-3" /> {preview === item.id ? 'HIDE' : 'PREVIEW'}</button>
                <button onClick={() => { setPreview(item.id); setEditJson(JSON.stringify(item.data, null, 2)); }} className="h-8 px-3 rounded-full glass text-[11px] font-bold">EDIT</button>
                <button onClick={() => handleRegenerate(item)} disabled={generating} className="h-8 px-3 rounded-full glass text-[11px] font-bold flex items-center gap-1"><RefreshCw className="h-3 w-3" /> REGENERATE</button>
                {item.status === 'draft' && <button onClick={async () => { try { await setAIStatus(item.id, 'in_review', user); toast.success('Moved to review'); } catch (err) { toast.error(err.message); } }} className="h-8 px-3 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold">REVIEW</button>}
                {(item.status === 'draft' || item.status === 'in_review') && <button onClick={async () => { try { await setAIStatus(item.id, 'approved', user); toast.success('Approved ✅'); } catch (err) { toast.error(err.message); } }} className="h-8 px-3 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold flex items-center gap-1"><Check className="h-3 w-3" /> APPROVE</button>}
                {item.status === 'approved' && ['course_outline', 'quiz', 'assignment'].includes(item.kind) && (
                  <button onClick={() => setApplyOpen(applyOpen === item.id ? null : item.id)} className="h-8 px-3 rounded-full bg-green-500 text-white text-[11px] font-bold flex items-center gap-1"><Upload className="h-3 w-3" /> APPLY & PUBLISH <ChevronDown className="h-3 w-3" /></button>
                )}
                <button onClick={async () => { if (confirm('Delete this draft?')) { try { await deleteAIContent(item.id, user); toast.success('Deleted'); } catch (err) { toast.error(err.message); } } }} className="h-8 w-8 rounded-full glass flex items-center justify-center text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>

              {applyOpen === item.id && (
                <div className="mt-3 rounded-xl bg-green-500/5 border border-green-500/20 p-3 flex flex-wrap gap-2 items-center">
                  {item.kind !== 'course_outline' && (
                    <select value={applyTarget} onChange={(e) => setApplyTarget(e.target.value)} className="h-11 w-full rounded-full glass px-3 text-xs flex-1 min-w-0 sm:min-w-[200px]">
                      <option className="bg-[#061236]" value="">Select target course</option>
                      {courses.map((c) => <option className="bg-[#061236]" key={c.id} value={c.id}>{c.title.slice(0, 40)}</option>)}
                    </select>
                  )}
                  <button onClick={() => applyContent(item)} className="h-10 px-5 rounded-full bg-green-500 text-white text-xs font-bold">CONFIRM APPLY (imports as draft content)</button>
                </div>
              )}

              {preview === item.id && (
                <div className="mt-3 rounded-2xl bg-black/20 border border-white/10 p-4 max-h-[480px] overflow-auto">
                  {renderData(item)}
                  {editJson && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs font-bold text-white/40">EDIT RAW CONTENT (JSON)</div>
                      <textarea value={editJson} onChange={(e) => setEditJson(e.target.value)} className="w-full h-48 rounded-xl bg-black/50 border border-white/10 p-3 font-mono text-xs" />
                      <div className="flex gap-2">
                        <button onClick={async () => { let parsed; try { parsed = JSON.parse(editJson); } catch { return toast.error('Invalid JSON'); } try { await updateAIContent(item.id, { data: parsed }); setEditJson(''); toast.success('Draft updated'); } catch (err) { toast.error(err.message); } }} className="px-4 h-10 rounded-full bg-white text-black text-xs font-bold">SAVE EDITS</button>
                        <button onClick={() => setEditJson('')} className="px-4 h-10 rounded-full glass text-xs font-bold">CANCEL</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {aiJobs.length > 0 && (
            <div className="text-[11px] text-white/30">Recent jobs: {aiJobs.slice(0, 5).map((j) => `${j.kind}:${j.status}`).join(' • ')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
