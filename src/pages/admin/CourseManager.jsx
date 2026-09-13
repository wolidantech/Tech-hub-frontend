import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Edit, Trash2, Eye, EyeOff, Save, Image as ImageIcon, ChevronDown, ChevronUp, ListChecks, FolderPlus } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useLMS } from '../../context/LMSContext';
import { useAuth } from '../../context/AuthContext';
import { formatNaira } from '../../lib/utils';
import { uploadThumbnail } from '../../lib/store';
import { DEFAULT_COMPLETION_RULES } from '../../lib/lms';
import CourseArt from '../../components/course/CourseArt';
import { BundleManager, PathManager } from './BundlePathManager';
import { toast } from 'sonner';

export default function CourseManager() {
  const { user } = useAuth();
  const { courses, addCourse, updateCourse, deleteCourse, setCoursePublished, addModule, updateModule, deleteModule, addLesson, updateLesson, deleteLesson, ensureCourseDetail } = useCourses();
  const { categories, addCategory, deleteCategory, completionRules, setCourseRules, audit, getCourseQuizzes, getCourseAssignments } = useLMS();

  const [showAdd, setShowAdd] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', category: categories[0] || 'Design', price: 5000, duration: '5 hours', level: 'Beginner', instructor: 'Woli Dan', description: '' });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [managing, setManaging] = useState(null); // course id for curriculum view
  const [openMod, setOpenMod] = useState(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [lessonForm, setLessonForm] = useState(null); // { moduleId, lesson? }
  const [lessonData, setLessonData] = useState({ title: '', type: 'video', duration: '10:00', videoUrl: '', textContent: '' });
  const [rulesForm, setRulesForm] = useState(null);
  const [newCat, setNewCat] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('courses'); // courses | bundles | paths

  const filtered = courses.filter((c) => !search || c.title.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    if (!newCourse.title.trim()) { toast.error('Title required'); return; }
    const slug = newCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (courses.some((c) => c.slug === slug)) { toast.error('A course with this title already exists'); return; }
    try {
      const created = await addCourse({
        slug, title: newCourse.title.toUpperCase(),
        shortDescription: newCourse.description || 'New course', description: newCourse.description,
        longDescription: newCourse.description, category: newCourse.category, instructor: newCourse.instructor,
        instructorRole: 'Instructor', duration: newCourse.duration, level: newCourse.level,
        price: Number(newCourse.price), originalPrice: Number(newCourse.price) * 2,
        thumbnail: 'default', published: false, featured: false,
        whatYouWillLearn: [],
      });
      audit(user, 'course.create', 'course', created.id, { title: newCourse.title });
      setShowAdd(false);
      setNewCourse({ title: '', category: categories[0] || 'Design', price: 5000, duration: '5 hours', level: 'Beginner', instructor: 'Woli Dan', description: '' });
      toast.success('Course created as UNPUBLISHED. Add curriculum, then publish.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const startEdit = (c) => { setEditing(c.id); setEditForm({ title: c.title, price: c.price, originalPrice: c.originalPrice, category: c.category, duration: c.duration, level: c.level, instructor: c.instructor, shortDescription: c.shortDescription, description: c.description, featured: !!c.featured, requirements: (c.requirements || []).join('\n'), audience: (c.audience || []).join('\n') }); };
  const saveEdit = async (id) => {
    try {
      await updateCourse(id, { ...editForm, price: Number(editForm.price), originalPrice: Number(editForm.originalPrice), requirements: String(editForm.requirements || '').split('\n').map((s) => s.trim()).filter(Boolean), audience: String(editForm.audience || '').split('\n').map((s) => s.trim()).filter(Boolean) });
      audit(user, 'course.update', 'course', id, { price: editForm.price });
      setEditing(null);
      toast.success('Course updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleThumbnail = async (courseId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Max 2MB for thumbnails'); return; }
    try {
      const path = await uploadThumbnail(courseId, file);
      await updateCourse(courseId, { thumbnailUrl: path });
      audit(user, 'course.thumbnail', 'course', courseId, {});
      toast.success('Thumbnail updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openLessonForm = (moduleId, lesson = null) => {
    setLessonForm({ moduleId, lessonId: lesson?.id || null });
    setLessonData(lesson ? { title: lesson.title, type: lesson.type, duration: lesson.duration, videoUrl: lesson.videoUrl || '', textContent: lesson.textContent || lesson.content || '', subLessons: (lesson.subLessons || []).map((s) => s.title).join('\n') } : { title: '', type: 'video', duration: '10:00', videoUrl: '', textContent: '', subLessons: '' });
  };
  const saveLesson = async (courseId) => {
    if (!lessonData.title.trim()) { toast.error('Lesson title required'); return; }
    const payload = { ...lessonData, subLessons: String(lessonData.subLessons || '').split('\n').map((s) => s.trim()).filter(Boolean).map((t, i) => ({ id: `sub-${Date.now()}-${i}`, title: t })) };
    try {
      if (lessonForm.lessonId) await updateLesson(courseId, lessonForm.moduleId, lessonForm.lessonId, { ...payload });
      else await addLesson(courseId, lessonForm.moduleId, { ...payload });
      setLessonForm(null);
      toast.success('Lesson saved');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const course = managing ? courses.find((c) => c.id === managing) : null;
  const rules = managing ? { ...DEFAULT_COMPLETION_RULES, ...(completionRules[managing] || {}) } : null;

  useEffect(() => {
    if (course && !course.curriculum) ensureCourseDetail(course.id).catch((err) => toast.error(err.message));
  }, [managing, course, ensureCourseDetail]);

  // ---- Curriculum detail view ----
  if (course) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => setManaging(null)} className="text-sm text-white/60 hover:text-white">← Back to courses</button>
          <div className="flex gap-2">
            <Link to={`/learn/${course.slug}?preview=1`} className="px-4 py-2 rounded-full text-xs font-bold glass flex items-center gap-1.5 hover:bg-white/10 transition">
              <Eye className="h-3.5 w-3.5" /> PREVIEW AS STUDENT
            </Link>
            <button onClick={async () => { try { await setCoursePublished(course.id, !course.published); audit(user, course.published ? 'course.unpublish' : 'course.publish', 'course', course.id, {}); toast.success(course.published ? 'Unpublished' : 'Published 🎉'); } catch (err) { toast.error(err.message); } }} className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 ${course.published ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-green-500 text-white'}`}>
              {course.published ? <><EyeOff className="h-3.5 w-3.5" /> UNPUBLISH</> : <><Eye className="h-3.5 w-3.5" /> PUBLISH</>}
            </button>
          </div>
        </div>

        <div className="glass rounded-[20px] overflow-hidden">
          <CourseArt course={course} className="h-44" />
          <div className="p-6 flex flex-wrap justify-between gap-4">
            <div>
              <h2 className="font-black text-xl">{course.title}</h2>
              <div className="text-sm text-white/50 mt-1">{course.category} • {formatNaira(course.price)} • {getCourseQuizzes(course.id).length} quizzes • {getCourseAssignments(course.id).length} assignments</div>
            </div>
            <label className="px-4 py-2.5 rounded-full glass text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-white/10">
              <ImageIcon className="h-4 w-4" /> {course.thumbnailUrl ? 'REPLACE THUMBNAIL' : 'UPLOAD THUMBNAIL'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleThumbnail(course.id, e)} />
            </label>
          </div>
        </div>

        {/* Completion rules */}
        <div className="glass rounded-[20px] p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4"><ListChecks className="h-4 w-4 text-green-400" /> Completion Requirements (for certificate)</h3>
          {rulesForm ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs text-white/40 font-bold">REQUIRED LESSONS %</label><input type="number" min="1" max="100" value={rulesForm.requireLessonsPct} onChange={(e) => setRulesForm({ ...rulesForm, requireLessonsPct: Number(e.target.value) })} className="mt-1 w-full h-11 rounded-full glass px-4 text-sm" /></div>
              <div><label className="text-xs text-white/40 font-bold">MIN QUIZ AVERAGE % (0 = none)</label><input type="number" min="0" max="100" value={rulesForm.requireQuizAvg} onChange={(e) => setRulesForm({ ...rulesForm, requireQuizAvg: Number(e.target.value) })} className="mt-1 w-full h-11 rounded-full glass px-4 text-sm" /></div>
              <div><label className="text-xs text-white/40 font-bold">APPROVED ASSIGNMENTS REQUIRED (0 = none)</label><input type="number" min="0" value={rulesForm.requireAssignmentsApproved} onChange={(e) => setRulesForm({ ...rulesForm, requireAssignmentsApproved: Number(e.target.value) })} className="mt-1 w-full h-11 rounded-full glass px-4 text-sm" /></div>
              <div className="flex items-end gap-2 pb-1">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={rulesForm.requireFinalProject} onChange={(e) => setRulesForm({ ...rulesForm, requireFinalProject: e.target.checked })} className="h-4 w-4" /> Require final project approval</label>
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <button onClick={async () => { try { await setCourseRules(course.id, rulesForm, user); setRulesForm(null); toast.success('Completion rules saved'); } catch (err) { toast.error(err.message); } }} className="px-6 h-11 rounded-full bg-green-500 text-white font-bold text-sm">SAVE RULES</button>
                <button onClick={() => setRulesForm(null)} className="px-6 h-11 rounded-full glass font-bold text-sm">CANCEL</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="px-3 py-1.5 rounded-full glass">{rules.requireLessonsPct}% lessons</span>
              {rules.requireQuizAvg > 0 && <span className="px-3 py-1.5 rounded-full glass">Quiz avg ≥ {rules.requireQuizAvg}%</span>}
              {rules.requireAssignmentsApproved > 0 && <span className="px-3 py-1.5 rounded-full glass">{rules.requireAssignmentsApproved} approved assignment(s)</span>}
              {rules.requireFinalProject && <span className="px-3 py-1.5 rounded-full glass">Final project approved</span>}
              <button onClick={() => setRulesForm({ ...rules })} className="px-4 py-1.5 rounded-full glass text-xs font-bold flex items-center gap-1"><Edit className="h-3.5 w-3.5" /> EDIT RULES</button>
            </div>
          )}
        </div>

        {/* Modules */}
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Curriculum — {course.curriculum?.length || 0} modules</h3>
          <div className="flex gap-2">
            <input value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} placeholder="New module title" className="h-10 w-[220px] rounded-full glass px-4 text-sm" />
            <button onClick={async () => { if (!newModuleTitle.trim()) return toast.error('Enter module title'); try { await addModule(course.id, newModuleTitle.trim()); setNewModuleTitle(''); toast.success('Module added'); } catch (err) { toast.error(err.message); } }} className="px-4 h-10 rounded-full bg-white text-black font-bold text-xs">+ ADD MODULE</button>
          </div>
        </div>

        <div className="space-y-3">
          {(course.curriculum || []).map((mod, mi) => (
            <div key={mod.id} className="glass rounded-[20px] overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-white/[0.03]">
                <button onClick={() => setOpenMod(openMod === mod.id ? null : mod.id)} className="flex items-center gap-2 font-bold text-left">
                  {openMod === mod.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="text-cyan-300 text-sm">MODULE {mi + 1}</span> {mod.title}
                  <span className="text-xs text-white/40 font-normal">{(mod.lessons || []).length} lessons)</span>
                </button>
                <div className="flex gap-2">
                  <button onClick={async () => { const t = prompt('Rename module:', mod.title); if (t) { try { await updateModule(course.id, mod.id, { title: t }); } catch (err) { toast.error(err.message); } } }} className="h-8 w-8 rounded-full glass flex items-center justify-center"><Edit className="h-3.5 w-3.5" /></button>
                  <button onClick={async () => { if (confirm(`Delete module "${mod.title}" and its lessons?`)) { try { await deleteModule(course.id, mod.id); toast.success('Module deleted'); } catch (err) { toast.error(err.message); } } }} className="h-8 w-8 rounded-full glass flex items-center justify-center text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              {openMod === mod.id && (
                <div className="p-4 space-y-2">
                  {(mod.lessons || []).map((l, li) => (
                    <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] text-sm">
                      <span className="text-white/30 font-mono text-xs w-6">{li + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{l.title}</div>
                        <div className="text-[11px] text-white/40">{l.type} • {l.duration} {l.videoUrl ? '• 🎬' : ''} {(l.textContent || l.content) ? '• 📖' : ''}</div>
                      </div>
                      <button onClick={() => openLessonForm(mod.id, l)} className="h-8 px-3 rounded-full glass text-xs font-bold">EDIT</button>
                      <button onClick={async () => { if (confirm('Delete lesson?')) { try { await deleteLesson(course.id, mod.id, l.id); toast.success('Lesson deleted'); } catch (err) { toast.error(err.message); } } }} className="h-8 w-8 rounded-full glass flex items-center justify-center text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => openLessonForm(mod.id)} className="w-full h-10 rounded-xl border border-dashed border-white/20 text-xs font-bold text-white/50 hover:text-white hover:border-cyan-400/50">+ ADD LESSON</button>
                </div>
              )}
            </div>
          ))}
          {(!course.curriculum || course.curriculum.length === 0) && <div className="glass rounded-2xl p-10 text-center text-white/40 text-sm">No modules yet. Add your first module above — or generate a full curriculum with AI Studio.</div>}
        </div>

        {/* Lesson editor modal */}
        {lessonForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <div className="w-full max-w-[640px] max-h-[90vh] overflow-auto glass-strong rounded-[24px] p-6 space-y-4">
              <div className="flex justify-between items-center"><h3 className="font-bold text-lg">{lessonForm.lessonId ? 'Edit Lesson' : 'Add Lesson'}</h3><button onClick={() => setLessonForm(null)}><X className="h-5 w-5" /></button></div>
              <input value={lessonData.title} onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })} placeholder="Lesson title" className="w-full h-11 rounded-full glass px-4 text-sm" />
              <div className="grid sm:grid-cols-2 gap-3">
                <select value={lessonData.type} onChange={(e) => setLessonData({ ...lessonData, type: e.target.value })} className="h-11 rounded-full glass px-4 text-sm">
                  <option className="bg-[#061236]" value="video">Video lesson</option>
                  <option className="bg-[#061236]" value="text">Text lesson</option>
                </select>
                <input value={lessonData.duration} onChange={(e) => setLessonData({ ...lessonData, duration: e.target.value })} placeholder="Duration (e.g. 12:30)" className="h-11 rounded-full glass px-4 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/40">VIDEO URL (YouTube embed link)</label>
                <input value={lessonData.videoUrl} onChange={(e) => setLessonData({ ...lessonData, videoUrl: e.target.value })} placeholder="https://www.youtube.com/embed/..." className="mt-1 w-full h-11 rounded-full glass px-4 text-sm font-mono" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/40">READ LESSON CONTENT (markdown supported: headings, tables, code, tips)</label>
                <textarea value={lessonData.textContent} onChange={(e) => setLessonData({ ...lessonData, textContent: e.target.value })} placeholder="# Lesson Title&#10;&#10;Write the full text version here..." className="mt-1 w-full rounded-2xl glass p-4 text-sm h-48 font-mono" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/40">SUB-LESSONS / TOPICS COVERED (one per line — shown as checklist)</label>
                <textarea value={lessonData.subLessons} onChange={(e) => setLessonData({ ...lessonData, subLessons: e.target.value })} placeholder="Installing the tools&#10;Your first project&#10;Exporting your work" className="mt-1 w-full rounded-2xl glass p-4 text-sm h-20 font-mono" />
              </div>
              <button onClick={() => saveLesson(course.id)} className="w-full btn-primary !py-3">SAVE LESSON</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- Course list view ----
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex gap-2">
          {[{ id: 'courses', label: `Courses (${courses.length})` }, { id: 'bundles', label: 'Bundles' }, { id: 'paths', label: 'Learning Paths' }].map((t) => (
            <button key={t.id} onClick={() => setView(t.id)} className={`px-4 py-2 rounded-full text-xs font-bold ${view === t.id ? 'bg-white text-black' : 'glass text-white/60'}`}>{t.label}</button>
          ))}
        </div>
        {view === 'courses' && (
          <div className="flex gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..." className="h-10 w-[220px] rounded-full glass px-4 text-sm" />
            <button onClick={() => setShowAdd(true)} className="btn-primary !py-2.5 !px-5 text-xs gap-2"><Plus className="h-4 w-4" /> ADD COURSE</button>
          </div>
        )}
      </div>

      {view === 'bundles' && <BundleManager />}
      {view === 'paths' && <PathManager />}

      {view === 'courses' && (
        <div className="space-y-6">

      {/* Categories */}
      <div className="glass rounded-[20px] p-5">
        <div className="font-bold text-sm mb-3 flex items-center gap-2"><FolderPlus className="h-4 w-4 text-cyan-300" /> Categories ({categories.length})</div>
        <div className="flex flex-wrap gap-2 mb-3 max-h-[110px] overflow-auto">
          {categories.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-bold">
              {c}
              <button onClick={async () => { if (confirm(`Delete category "${c}"?`)) { try { await deleteCategory(c, user); toast.success('Category deleted'); } catch (e) { toast.error(e.message); } } }} className="text-white/30 hover:text-red-300"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category name" className="h-10 flex-1 max-w-[280px] rounded-full glass px-4 text-sm" />
          <button onClick={async () => { try { await addCategory(newCat, user); setNewCat(''); toast.success('Category added'); } catch (e) { toast.error(e.message); } }} className="h-10 px-4 rounded-full bg-white text-black font-bold text-xs">ADD</button>
        </div>
      </div>

      {showAdd && (
        <div className="glass-strong rounded-[20px] p-6 space-y-4">
          <div className="flex justify-between"><h3 className="font-bold">Add New Course (starts UNPUBLISHED)</h3><button onClick={() => setShowAdd(false)}><X className="h-5 w-5" /></button></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <input value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} placeholder="Course Title" className="h-11 rounded-full glass px-4 text-sm sm:col-span-2" />
            <select value={newCourse.category} onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} className="h-11 rounded-full glass px-4 text-sm">
              {categories.map((c) => <option key={c} className="bg-[#061236]" value={c}>{c}</option>)}
            </select>
            <input type="number" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })} placeholder="Price" className="h-11 rounded-full glass px-4 text-sm" />
            <input value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })} placeholder="Duration" className="h-11 rounded-full glass px-4 text-sm" />
            <input value={newCourse.level} onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })} placeholder="Level" className="h-11 rounded-full glass px-4 text-sm" />
          </div>
          <textarea value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} placeholder="Description" className="w-full rounded-2xl glass p-4 text-sm h-24" />
          <button onClick={handleAdd} className="btn-primary w-full">CREATE COURSE</button>
        </div>
      )}

      <div className="grid gap-3">
        {filtered.map((c) => (
          <div key={c.id} className="glass rounded-[20px] p-4 flex flex-wrap items-center gap-4">
            <div className="h-16 w-24 rounded-xl overflow-hidden shrink-0"><CourseArt course={c} className="h-16" /></div>
            <div className="flex-1 min-w-[200px]">
              {editing === c.id ? (
                <div className="grid sm:grid-cols-2 gap-2">
                  <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="h-9 rounded-full glass px-3 text-xs sm:col-span-2" />
                  <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="h-9 rounded-full glass px-3 text-xs" />
                  <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="h-9 rounded-full glass px-3 text-xs">
                    {categories.map((cat) => <option key={cat} className="bg-[#061236]" value={cat}>{cat}</option>)}
                  </select>
                  <input value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })} className="h-9 rounded-full glass px-3 text-xs" />
                  <input value={editForm.level} onChange={(e) => setEditForm({ ...editForm, level: e.target.value })} className="h-9 rounded-full glass px-3 text-xs" />
                  <textarea value={editForm.requirements} onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })} placeholder="Requirements (one per line)" className="rounded-xl glass px-3 py-2 text-xs h-16" />
                  <textarea value={editForm.audience} onChange={(e) => setEditForm({ ...editForm, audience: e.target.value })} placeholder="Who is this for? (one per line)" className="rounded-xl glass px-3 py-2 text-xs h-16" />
                </div>
              ) : (
                <>
                  <div className="font-bold flex items-center gap-2 flex-wrap">{c.title}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.published ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/50'}`}>{c.published ? 'PUBLISHED' : 'DRAFT'}</span>
                    {c.featured && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">FEATURED</span>}
                    {c.archived && <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-300 text-[10px] font-bold">ARCHIVED</span>}
                  </div>
                  <div className="text-xs text-white/40 mt-1">{c.category} • <span className="text-cyan-300 font-bold">{formatNaira(c.price)}</span> • {c.curriculum ? c.curriculum.reduce((a, m) => a + (m.lessons?.length || 0), 0) : (c.lessonsCount || 0)} lessons • {c.students} students</div>
                </>
              )}
            </div>
            <div className="flex gap-1.5 items-center">
              {editing === c.id ? (
                <>
                  <button onClick={() => saveEdit(c.id)} className="h-9 w-9 rounded-full bg-green-500 text-white flex items-center justify-center"><Save className="h-4 w-4" /></button>
                  <button onClick={() => setEditing(null)} className="h-9 w-9 rounded-full glass flex items-center justify-center"><X className="h-4 w-4" /></button>
                </>
              ) : (
                <>
                  <button onClick={() => setManaging(c.id)} className="h-9 px-4 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold">CURRICULUM</button>
                  <button onClick={async () => { try { await setCoursePublished(c.id, !c.published); audit(user, c.published ? 'course.unpublish' : 'course.publish', 'course', c.id, {}); } catch (err) { toast.error(err.message); } }} title={c.published ? 'Unpublish' : 'Publish'} className="h-9 w-9 rounded-full glass flex items-center justify-center">{c.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                  <button onClick={() => startEdit(c)} className="h-9 w-9 rounded-full glass flex items-center justify-center"><Edit className="h-4 w-4" /></button>
                  <button onClick={async () => { try { await updateCourse(c.id, { archived: !c.archived }); audit(user, c.archived ? 'course.unarchive' : 'course.archive', 'course', c.id, {}); toast.success(c.archived ? 'Unarchived' : 'Archived — hidden from store'); } catch (err) { toast.error(err.message); } }} title={c.archived ? 'Unarchive' : 'Archive'} className="h-9 px-3 rounded-full glass text-[10px] font-bold">{c.archived ? 'UNARCHIVE' : 'ARCHIVE'}</button>
                  <button onClick={async () => { if (confirm(`Delete "${c.title}"? This cannot be undone.`)) { try { await deleteCourse(c.id); audit(user, 'course.delete', 'course', c.id, {}); toast.success('Deleted'); } catch (err) { toast.error(err.message); } } }} className="h-9 w-9 rounded-full glass flex items-center justify-center text-red-300"><Trash2 className="h-4 w-4" /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
        </div>
      )}
    </div>
  );
}
