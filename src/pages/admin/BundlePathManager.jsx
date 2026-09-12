import { useState } from 'react';
import { Plus, X, Edit, Trash2, Package, Map, Eye, EyeOff } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useLMS } from '../../context/LMSContext';
import { useAuth } from '../../context/AuthContext';
import { formatNaira } from '../../lib/utils';
import { toast } from 'sonner';

export function BundleManager() {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { bundles, createBundle, updateBundle, deleteBundle } = useLMS();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', courseIds: [], price: 15000, originalPrice: 30000, badge: '' });

  const toggleCourse = (id) => setForm({ ...form, courseIds: form.courseIds.includes(id) ? form.courseIds.filter((x) => x !== id) : [...form.courseIds, id] });

  const startEdit = (b) => { setEditing(b.id); setForm({ title: b.title, description: b.description || '', courseIds: b.courseIds || [], price: b.price, originalPrice: b.originalPrice || b.price, badge: b.badge || '' }); setShowForm(true); };

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    if (form.courseIds.length < 2) { toast.error('Select at least 2 courses'); return; }
    const payload = { title: form.title, description: form.description, courseIds: form.courseIds, price: Number(form.price), originalPrice: Number(form.originalPrice), badge: form.badge };
    try {
      if (editing) { await updateBundle(editing, payload, user); toast.success('Bundle updated'); }
      else { await createBundle(payload, user); toast.success('Bundle created 🎁'); }
      setShowForm(false); setEditing(null);
      setForm({ title: '', description: '', courseIds: [], price: 15000, originalPrice: 30000, badge: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2"><Package className="h-5 w-5 text-amber-300" /> Course Bundles ({bundles.length})</h3>
        <button onClick={() => setShowForm(true)} className="btn-primary !py-2.5 !px-5 text-xs gap-2"><Plus className="h-4 w-4" /> CREATE BUNDLE</button>
      </div>

      {showForm && (
        <div className="glass-strong rounded-[20px] p-6 space-y-4">
          <div className="flex justify-between"><h4 className="font-bold">{editing ? 'Edit' : 'Create'} Bundle</h4><button onClick={() => { setShowForm(false); setEditing(null); }}><X className="h-5 w-5" /></button></div>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Bundle title (e.g. Complete AI Creator Bundle)" className="w-full h-11 rounded-full glass px-4 text-sm" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Bundle description" className="w-full rounded-2xl glass p-4 text-sm h-20" />
          <div className="grid sm:grid-cols-3 gap-3">
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Bundle price" className="h-11 rounded-full glass px-4 text-sm" />
            <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="Original total" className="h-11 rounded-full glass px-4 text-sm" />
            <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Badge (e.g. BEST VALUE)" className="h-11 rounded-full glass px-4 text-sm" />
          </div>
          <div>
            <div className="text-xs font-bold text-white/40 mb-2">SELECT COURSES ({form.courseIds.length} selected)</div>
            <div className="grid sm:grid-cols-2 gap-2 max-h-[240px] overflow-auto">
              {courses.map((c) => (
                <label key={c.id} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer ${form.courseIds.includes(c.id) ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-white/[0.02]'}`}>
                  <input type="checkbox" checked={form.courseIds.includes(c.id)} onChange={() => toggleCourse(c.id)} className="h-4 w-4 shrink-0" />
                  <span className="truncate">{c.title}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={save} className="btn-primary w-full">{editing ? 'SAVE CHANGES' : 'CREATE BUNDLE'}</button>
        </div>
      )}

      <div className="grid gap-3">
        {bundles.map((b) => (
          <div key={b.id} className="glass rounded-[20px] p-4 flex flex-wrap items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-2xl shrink-0">🎁</div>
            <div className="flex-1 min-w-[200px]">
              <div className="font-bold flex items-center gap-2 flex-wrap">{b.title}
                {b.badge && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">{b.badge}</span>}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.published !== false ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/50'}`}>{b.published !== false ? 'LIVE' : 'HIDDEN'}</span>
              </div>
              <div className="text-xs text-white/40 mt-1">{(b.courseIds || []).length} courses • <span className="text-cyan-300 font-bold">{formatNaira(b.price)}</span> <span className="line-through">{formatNaira(b.originalPrice || b.price)}</span></div>
              <div className="text-[11px] text-white/30 mt-0.5 truncate">{(b.courseIds || []).map((id) => courses.find((c) => c.id === id)?.title).filter(Boolean).join(' • ')}</div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => startEdit(b)} className="h-9 w-9 rounded-full glass flex items-center justify-center"><Edit className="h-4 w-4" /></button>
              <button onClick={async () => { try { await updateBundle(b.id, { published: !(b.published !== false) }, user); toast.success('Updated'); } catch (err) { toast.error(err.message); } }} className="h-9 w-9 rounded-full glass flex items-center justify-center">{b.published !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
              <button onClick={async () => { if (confirm('Delete bundle?')) { try { await deleteBundle(b.id, user); toast.success('Deleted'); } catch (err) { toast.error(err.message); } } }} className="h-9 w-9 rounded-full glass flex items-center justify-center text-red-300"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {bundles.length === 0 && <div className="glass rounded-2xl p-10 text-center text-sm text-white/40">No bundles yet. Create one to sell multiple courses at a discount.</div>}
      </div>
    </div>
  );
}

export function PathManager() {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { learningPaths, createPath, updatePath, deletePath } = useLMS();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', desc: '', icon: '🎯', level: 'Beginner → Advanced', courseSlugs: [] });

  const toggleCourse = (slug) => setForm({ ...form, courseSlugs: form.courseSlugs.includes(slug) ? form.courseSlugs.filter((x) => x !== slug) : [...form.courseSlugs, slug] });

  const startEdit = (p) => { setEditing(p.id); setForm({ title: p.title, desc: p.desc || '', icon: p.icon || '🎯', level: p.level || '', courseSlugs: p.courseSlugs || [] }); setShowForm(true); };

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    if (form.courseSlugs.length < 2) { toast.error('Select at least 2 courses in order'); return; }
    try {
      if (editing) { await updatePath(editing, form, user); toast.success('Path updated'); }
      else { await createPath(form, user); toast.success('Learning path created 🗺'); }
      setShowForm(false); setEditing(null);
      setForm({ title: '', desc: '', icon: '🎯', level: 'Beginner → Advanced', courseSlugs: [] });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2"><Map className="h-5 w-5 text-green-300" /> Learning Paths ({learningPaths.length})</h3>
        <button onClick={() => setShowForm(true)} className="btn-primary !py-2.5 !px-5 text-xs gap-2"><Plus className="h-4 w-4" /> CREATE PATH</button>
      </div>

      {showForm && (
        <div className="glass-strong rounded-[20px] p-6 space-y-4">
          <div className="flex justify-between"><h4 className="font-bold">{editing ? 'Edit' : 'Create'} Learning Path</h4><button onClick={() => { setShowForm(false); setEditing(null); }}><X className="h-5 w-5" /></button></div>
          <div className="grid sm:grid-cols-[80px_1fr] gap-3">
            <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🎯" className="h-11 rounded-full glass px-4 text-sm text-center text-xl" />
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Path title (e.g. AI Creator Path)" className="h-11 rounded-full glass px-4 text-sm" />
          </div>
          <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Short description" className="w-full h-11 rounded-full glass px-4 text-sm" />
          <input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="Level range (e.g. Beginner → Advanced)" className="w-full h-11 rounded-full glass px-4 text-sm" />
          <div>
            <div className="text-xs font-bold text-white/40 mb-2">COURSES IN ORDER ({form.courseSlugs.length} selected)</div>
            <div className="grid sm:grid-cols-2 gap-2 max-h-[240px] overflow-auto">
              {courses.map((c) => {
                const order = form.courseSlugs.indexOf(c.slug);
                return (
                  <label key={c.id} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer ${order >= 0 ? 'border-green-400 bg-green-500/10' : 'border-white/10 bg-white/[0.02]'}`}>
                    <input type="checkbox" checked={order >= 0} onChange={() => toggleCourse(c.slug)} className="h-4 w-4 shrink-0" />
                    {order >= 0 && <span className="h-5 w-5 rounded-full bg-green-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">{order + 1}</span>}
                    <span className="truncate">{c.title}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <button onClick={save} className="btn-primary w-full">{editing ? 'SAVE CHANGES' : 'CREATE PATH'}</button>
        </div>
      )}

      <div className="grid gap-3">
        {learningPaths.map((p) => (
          <div key={p.id} className="glass rounded-[20px] p-4 flex flex-wrap items-center gap-4">
            <div className="text-4xl shrink-0">{p.icon}</div>
            <div className="flex-1 min-w-[200px]">
              <div className="font-bold">{p.title}</div>
              <div className="text-xs text-white/40 mt-1">{p.level} • {(p.courseSlugs || []).length} steps</div>
              <div className="text-[11px] text-white/30 mt-0.5 truncate">{(p.courseSlugs || []).join(' → ')}</div>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => startEdit(p)} className="h-9 w-9 rounded-full glass flex items-center justify-center"><Edit className="h-4 w-4" /></button>
              <button onClick={async () => { if (confirm('Delete path?')) { try { await deletePath(p.id, user); toast.success('Deleted'); } catch (err) { toast.error(err.message); } } }} className="h-9 w-9 rounded-full glass flex items-center justify-center text-red-300"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
