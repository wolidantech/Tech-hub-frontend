// Admin: per-lesson extras — practical activity + downloadable resources.
// Everything is stored in Supabase (lesson_practicals / course_resources via
// migration 009); the student classroom renders exactly what is saved here.
import { useState } from 'react';
import { X, Wrench, FolderDown, Upload, Trash2, Save, Link2, FileUp } from 'lucide-react';
import { adminSavePractical, adminDeletePractical, adminSaveResource, adminDeleteResource, uploadCourseResource } from '../../lib/store';
import { validateUpload } from '../../lib/supabase';
import { toast } from 'sonner';

const input = 'w-full h-11 rounded-full glass px-4 text-sm focus:outline-none focus:border-cyan-400/50';
const area = 'w-full rounded-2xl glass p-3.5 text-sm focus:outline-none focus:border-cyan-400/50';

export default function LessonExtrasModal({ courseId, module, lesson, onClose, onSaved }) {
  const [p, setP] = useState(lesson.practical || null);
  const [practicalDraft, setPracticalDraft] = useState(lesson.practical ? { ...lesson.practical } : {
    title: lesson.title, objective: '', scenario: '', procedure: '', materials: [], observation: '',
    expected: '', questions: [], safety: '', estimatedMinutes: 20, submissionType: 'any',
  });
  const [resources, setResources] = useState((lesson.resources || []).map((r) => ({ ...r, saved: !String(r.id).startsWith('jsonb_') })));
  const [newRes, setNewRes] = useState({ title: '', url: '', type: 'link' });
  const [uploading, setUploading] = useState(false);

  const savePractical = async () => {
    try {
      const clean = {
        ...practicalDraft,
        materials: (practicalDraft.materials || []).filter(Boolean),
        questions: (practicalDraft.questions || []).filter(Boolean).map((q) => (typeof q === 'string' ? q : q.question || q.text || '')).filter(Boolean),
      };
      const saved = await adminSavePractical({
        id: p?.id || null, courseId, moduleId: module.id, lessonId: lesson.id, input: clean,
      });
      setP(saved);
      toast.success('Practical saved — students will see it in this lesson.');
      onSaved?.();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deletePractical = async () => {
    if (!p?.id || !confirm('Delete this practical activity?')) return;
    try { await adminDeletePractical(p.id); setP(null); toast.success('Practical removed'); onSaved?.(); }
    catch (err) { toast.error(err.message); }
  };

  const addResource = async () => {
    if (!newRes.title.trim()) return toast.error('Resource title required');
    if (!/^https?:\/\//i.test(newRes.url)) return toast.error('A resource needs a real https link (or upload a file) — never a placeholder');
    try {
      const saved = await adminSaveResource({
        courseId, moduleId: module.id, lessonId: lesson.id,
        input: { title: newRes.title.trim(), url: newRes.url.trim(), type: newRes.type, position: resources.length },
      });
      setResources((prev) => [...prev, { ...saved, saved: true }]);
      setNewRes({ title: '', url: '', type: newRes.type });
      toast.success('Resource linked');
      onSaved?.();
    } catch (err) { toast.error(err.message); }
  };

  const uploadResource = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateUpload('resources', file);
    if (!check.ok) return toast.error(check.error);
    setUploading(true);
    try {
      const path = await uploadCourseResource(courseId, file);
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const saved = await adminSaveResource({
        courseId, moduleId: module.id, lessonId: lesson.id,
        input: {
          title: file.name.replace(/\.[^.]+$/, ''), storagePath: path,
          type: ['pdf'].includes(ext) ? 'pdf' : ['doc', 'docx'].includes(ext) ? 'docx' : ['ppt', 'pptx'].includes(ext) ? 'pptx'
            : ['csv', 'json', 'xlsx'].includes(ext) ? 'dataset' : ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? 'image' : 'file',
          mimeType: file.type, size: file.size, position: resources.length,
        },
      });
      setResources((prev) => [...prev, { ...saved, saved: true }]);
      toast.success('File uploaded to the private resources bucket');
      onSaved?.();
    } catch (err) {
      toast.error(err.message);
    } finally { setUploading(false); e.target.value = ''; }
  };

  const removeResource = async (r) => {
    if (!confirm(`Remove “${r.title}”?`)) return;
    try {
      if (r.saved && r.id && !String(r.id).startsWith('jsonb_')) await adminDeleteResource(r.id);
      setResources((prev) => prev.filter((x) => x.id !== r.id));
      onSaved?.();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className="w-full max-w-[720px] my-auto glass-strong rounded-[24px] p-5 md:p-6 space-y-6">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-lg leading-tight">Lesson extras</h3>
            <div className="text-xs text-white/45 truncate">{lesson.title}</div>
          </div>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        {/* ---------- Practical ---------- */}
        <div className="rounded-2xl border border-orange-500/25 bg-orange-500/[0.04] p-4 space-y-3">
          <div className="font-bold flex items-center gap-2"><Wrench className="h-4 w-4 text-orange-300" /> PRACTICAL ACTIVITY {p ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">SAVED</span> : null}</div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            <input value={practicalDraft.title} onChange={(e) => setPracticalDraft({ ...practicalDraft, title: e.target.value })} placeholder="Activity title" className={input} />
            <input type="number" min="1" value={practicalDraft.estimatedMinutes || ''} onChange={(e) => setPracticalDraft({ ...practicalDraft, estimatedMinutes: Number(e.target.value) })} placeholder="Estimated minutes" className={input} />
          </div>
          <textarea value={practicalDraft.objective} onChange={(e) => setPracticalDraft({ ...practicalDraft, objective: e.target.value })} placeholder="Objective — what the student will achieve" className={`${area} h-16`} />
          <textarea value={practicalDraft.scenario} onChange={(e) => setPracticalDraft({ ...practicalDraft, scenario: e.target.value })} placeholder="Scenario / context (e.g. 'You are a lab technician…')" className={`${area} h-16`} />
          <textarea value={practicalDraft.materials.map((m) => (typeof m === 'string' ? m : m.name || m.title || '')).join('\n')} onChange={(e) => setPracticalDraft({ ...practicalDraft, materials: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })} placeholder={'Materials (one per line):\nMicroscope\nSlide of onion cells'} className={`${area} h-20`} />
          <textarea value={practicalDraft.procedure} onChange={(e) => setPracticalDraft({ ...practicalDraft, procedure: e.target.value })} placeholder={'Procedure — numbered steps, one per line:\n1. Prepare the slide\n2. Focus at low power'} className={`${area} h-24`} />
          <div className="grid sm:grid-cols-2 gap-2.5">
            <textarea value={practicalDraft.observation} onChange={(e) => setPracticalDraft({ ...practicalDraft, observation: e.target.value })} placeholder="What students should observe / record" className={`${area} h-20`} />
            <textarea value={practicalDraft.expected} onChange={(e) => setPracticalDraft({ ...practicalDraft, expected: e.target.value })} placeholder="Expected result" className={`${area} h-20`} />
          </div>
          <textarea value={practicalDraft.questions.map((q) => (typeof q === 'string' ? q : q.question || q.text || '')).join('\n')} onChange={(e) => setPracticalDraft({ ...practicalDraft, questions: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })} placeholder={'Follow-up questions (one per line)'} className={`${area} h-20`} />
          <textarea value={practicalDraft.safety} onChange={(e) => setPracticalDraft({ ...practicalDraft, safety: e.target.value })} placeholder="Safety notes (optional)" className={`${area} h-14`} />
          <div className="flex flex-wrap gap-2">
            <button onClick={savePractical} className="px-5 h-11 rounded-full bg-orange-500 text-white font-bold text-xs inline-flex items-center gap-2"><Save className="h-4 w-4" /> SAVE PRACTICAL</button>
            {p && <button onClick={deletePractical} className="px-5 h-11 rounded-full glass text-red-300 font-bold text-xs inline-flex items-center gap-2"><Trash2 className="h-4 w-4" /> REMOVE</button>}
          </div>
        </div>

        {/* ---------- Resources ---------- */}
        <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.04] p-4 space-y-3">
          <div className="font-bold flex items-center gap-2"><FolderDown className="h-4 w-4 text-cyan-300" /> RESOURCES ({resources.length})</div>
          {resources.map((r, i) => (
            <div key={r.id || i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.04]">
              <span className="text-lg shrink-0">{r.storagePath ? '📄' : '🔗'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{r.title}</div>
                <div className="text-[11px] text-white/40 truncate">{r.storagePath ? `file · ${r.mimeType || ''} · ${Math.round((r.size || 0) / 1024)} KB` : r.url}</div>
              </div>
              <button onClick={() => removeResource(r)} className="h-8 w-8 rounded-full glass flex items-center justify-center text-red-300 shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          {resources.length === 0 && <div className="text-xs text-white/40">No resources yet. Students see “no extra resources” — never a broken link.</div>}
          <div className="grid sm:grid-cols-[1fr_1fr_110px_auto] gap-2">
            <input value={newRes.title} onChange={(e) => setNewRes({ ...newRes, title: e.target.value })} placeholder="Title" className={input} />
            <input value={newRes.url} onChange={(e) => setNewRes({ ...newRes, url: e.target.value })} placeholder="https://real-link…" className={input} />
            <select value={newRes.type} onChange={(e) => setNewRes({ ...newRes, type: e.target.value })} className={`${input} !h-11`}>
              <option className="bg-[#061236]" value="link">Link</option>
              <option className="bg-[#061236]" value="pdf">PDF</option>
              <option className="bg-[#061236]" value="docx">DOCX</option>
              <option className="bg-[#061236]" value="pptx">PPTX</option>
              <option className="bg-[#061236]" value="image">Image</option>
              <option className="bg-[#061236]" value="dataset">Dataset</option>
              <option className="bg-[#061236]" value="docs">Docs</option>
              <option className="bg-[#061236]" value="video">Video</option>
              <option className="bg-[#061236]" value="tool">Tool</option>
            </select>
            <button onClick={addResource} className="h-11 px-4 rounded-full bg-white text-black font-bold text-xs inline-flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5" /> ADD</button>
          </div>
          <label className="flex items-center justify-center gap-2 h-11 rounded-full border border-dashed border-cyan-400/40 text-xs font-bold text-cyan-300 cursor-pointer hover:bg-cyan-400/10 transition">
            <FileUp className="h-4 w-4" /> {uploading ? 'UPLOADING…' : 'OR UPLOAD A FILE (PDF/DOCX/PPTX/IMAGE/DATASET ≤ 25MB)'}
            <input type="file" className="hidden" disabled={uploading} onChange={uploadResource} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.zip" />
          </label>
        </div>

        <button onClick={onClose} className="w-full btn-secondary !py-3 text-sm">DONE</button>
      </div>
    </div>
  );
}
