import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Download, Printer, Save, Search, FileText, Cloud, X, Check, Wand2, Eye, ZoomIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CVPreview, { CV_TEMPLATES } from '../components/cv/CVPreview';
import { searchOccupations } from '../data/occupations';
import { generate } from '../lib/ai';
import { fetchMyCVs, saveCVDb, deleteCVDb } from '../lib/store';
import { toast, Toaster } from 'sonner';

const LS_KEY = 'wdth_cv_draft_v1';
const emptyCV = () => ({
  personal: { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', portfolio: '', github: '', website: '' },
  summary: '',
  experience: [], education: [], skills: [], certifications: [], projects: [],
  achievements: [], languages: [], volunteer: [], references: [],
});
const STEPS = ['Personal', 'Summary', 'Experience', 'Education', 'Skills', 'Extras', 'Template', 'Preview'];

const inp = 'w-full h-11 rounded-xl bg-white/[0.05] border border-white/10 px-3.5 text-sm placeholder:text-white/25 focus:outline-none focus:border-cyan-400/60 transition';
const lbl = 'block text-[11px] font-bold tracking-widest text-white/40 uppercase mb-1.5';

// ---------------- Occupation picker (searchable taxonomy) ----------------
function OccupationPicker({ value, onPick }) {
  const [q, setQ] = useState(value || '');
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchOccupations(q, 12), [q]);
  return (
    <div className="relative">
      <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
        placeholder="Search 350+ occupations… e.g. Frontend Developer, Nurse, Accountant" className={`${inp} pl-10`} />
      {open && results.length > 0 && (
        <div className="absolute z-30 mt-2 w-full max-h-64 overflow-y-auto rounded-2xl glass border border-white/10 shadow-2xl">
          {results.map((o) => (
            <button key={o.id} onClick={() => { onPick(o.title); setQ(o.title); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 hover:bg-white/10 transition">
              <div className="text-sm font-semibold">{o.title}</div>
              <div className="text-[11px] text-white/40">{o.sector}</div>
            </button>
          ))}
        </div>
      )}
      {open && q && results.length === 0 && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl glass border border-white/10 px-4 py-3 text-xs text-white/50">
          No match — but you can still type your exact title in "Professional Title" below.
        </div>
      )}
    </div>
  );
}

// ---------------- AI improve (never invents facts) ----------------
function AIImprove({ text, field, onApply }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const run = async () => {
    if (!String(text || '').trim()) { toast.error('Write a few words first — DanTECH AI improves YOUR information.'); return; }
    setBusy(true); setResult(null);
    try {
      const out = await generate('cv_improve', { text, field });
      setResult(out.data);
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  return (
    <div>
      <button type="button" onClick={run} disabled={busy}
        className="inline-flex items-center gap-2 px-4 h-9 rounded-full glass text-xs font-bold text-purple-300 hover:bg-white/10 transition disabled:opacity-50">
        <Wand2 className="h-3.5 w-3.5" /> {busy ? 'Improving…' : 'Improve with DanTECH AI'}
      </button>
      {result && (
        <div className="mt-3 rounded-2xl border border-purple-400/30 bg-purple-500/10 p-4 space-y-3">
          <div className="text-sm whitespace-pre-line leading-relaxed">{result.improved}</div>
          <ul className="text-[11px] text-white/50 space-y-0.5">{result.changes.map((c, i) => <li key={i}>• {c}</li>)}</ul>
          <div className="text-[10px] text-amber-300/80">{result.honestyNote}</div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { onApply(result.improved); setResult(null); toast.success('Applied to your CV'); }}
              className="px-4 h-9 rounded-full bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Apply</button>
            <button type="button" onClick={() => setResult(null)} className="px-4 h-9 rounded-full glass text-xs font-bold">Discard</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Small form helpers ----------------
const Field = ({ label, children }) => (<div><span className={lbl}>{label}</span>{children}</div>);
function ListEditor({ items, setItems, empty, render, label }) {
  const move = (i, d) => {
    const j = i + d; if (j < 0 || j >= items.length) return;
    const next = [...items]; [next[i], next[j]] = [next[j], next[i]]; setItems(next);
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-white/30">{label} {i + 1}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} className="h-7 w-7 rounded-lg glass flex items-center justify-center text-white/50 hover:text-white"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => move(i, 1)} className="h-7 w-7 rounded-lg glass flex items-center justify-center text-white/50 hover:text-white"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="h-7 w-7 rounded-lg glass flex items-center justify-center text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          {render(item, (patch) => setItems(items.map((x, j) => (j === i ? { ...x, ...patch } : x))))}
        </div>
      ))}
      <button type="button" onClick={() => setItems([...items, empty()])}
        className="w-full h-11 rounded-xl border border-dashed border-white/20 text-xs font-bold text-white/50 hover:text-cyan-300 hover:border-cyan-400/50 flex items-center justify-center gap-2">
        <Plus className="h-4 w-4" /> Add {label.toLowerCase()}
      </button>
    </div>
  );
}

// ---------------- Main page ----------------
export default function CVBuilder() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [cv, setCv] = useState(() => {
    try { const d = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); return d || emptyCV(); } catch { return emptyCV(); }
  });
  const [myCVs, setMyCVs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // mobile preview toggle
  const [fullPreview, setFullPreview] = useState(false); // full-screen preview
  const [zoom, setZoom] = useState(1);
  const scaleWrap = useRef(null);
  const [scale, setScale] = useState(1);

  // Autosave draft locally (guests included).
  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(cv)); } catch { /* full */ } }, [cv]);
  useEffect(() => { if (user) fetchMyCVs(user.id).then(setMyCVs).catch(() => {}); }, [user]);

  // Fit the 794px A4 preview into its container (mobile-first).
  useEffect(() => {
    const el = scaleWrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, (el.clientWidth - 2) / 794)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [showPreview, step, fullPreview]);

  const setPersonal = (patch) => setCv((c) => ({ ...c, personal: { ...c.personal, ...patch } }));
  const filled = cv.personal.fullName || cv.personal.email || cv.experience.length || cv.summary;

  const saveToCloud = async (asNew = false) => {
    if (!user) return;
    setSaving(true);
    try {
      const saved = await saveCVDb({ id: asNew ? null : activeId, userId: user.id, title: cv.personal.fullName ? `${cv.personal.fullName} — CV` : 'My CV', template: template, data: cv });
      setActiveId(saved.id);
      setMyCVs(await fetchMyCVs(user.id));
      toast.success(asNew ? 'Saved as a new CV version ☁️' : 'CV saved to your account ☁️');
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };
  const loadCV = (doc) => { setCv({ ...emptyCV(), ...(doc.data || {}) }); setActiveId(doc.id); setStep(0); toast.success(`Loaded "${doc.title}"`); };
  const removeCV = async (doc) => {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    await deleteCVDb(user.id, doc.id);
    setMyCVs(await fetchMyCVs(user.id));
    if (activeId === doc.id) setActiveId(null);
    toast.info('CV deleted');
  };

  const template = cv._template || 'modern';
  const setTemplate = (id) => setCv((c) => ({ ...c, _template: id }));

  const downloadPDF = () => {
    document.body.classList.add('cv-print-mode');
    setTimeout(() => { window.print(); setTimeout(() => document.body.classList.remove('cv-print-mode'), 500); }, 50);
  };

  // ---------- Landing (first visit) ----------
  const [started, setStarted] = useState(Boolean(filled));

  if (!started) {
    return (
      <div className="min-h-screen">
        <Toaster richColors />
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 py-14 md:py-20">
          <div className="text-center max-w-[720px] mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[11px] font-bold tracking-widest"><FileText className="h-4 w-4 text-cyan-300" /> FREE • NO ACCOUNT NEEDED</div>
            <h1 className="font-display font-black text-[34px] md:text-[56px] leading-[1.05] mt-5">Create a Professional CV in Minutes</h1>
            <p className="mt-4 text-white/60 md:text-lg">Build a modern, professional CV tailored to your career and download it as a PDF — free, no registration required.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setStarted(true)} className="btn-primary !py-4 !px-8 !text-sm flex items-center justify-center gap-2"><FileText className="h-4 w-4" /> CREATE MY CV</button>
              <button onClick={() => { setStarted(true); setStep(1); }} className="px-8 py-4 rounded-full glass font-bold text-sm flex items-center justify-center gap-2 text-purple-300 hover:bg-white/10 transition"><Sparkles className="h-4 w-4" /> USE AI TO BUILD MY CV</button>
            </div>
            <div className="mt-10 grid sm:grid-cols-3 gap-3 text-left">
              {[['🌍', '350+ occupations', 'Searchable career taxonomy from technology to skilled trades.'], ['🎨', '6 professional templates', 'Modern, corporate, minimal, creative, executive & academic — switch anytime without losing data.'], ['🤖', 'DanTECH AI writer', 'Improves YOUR wording. It never invents qualifications or experience.']].map(([i, t, d]) => (
                <div key={t} className="glass rounded-2xl p-5"><div className="text-2xl">{i}</div><div className="font-bold mt-2">{t}</div><div className="text-xs text-white/50 mt-1">{d}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Step content ----------
  const stepBody = [
    // 0 PERSONAL
    <div key="s0" className="space-y-4">
      <Field label="Your occupation (searchable)"><OccupationPicker value={cv.personal.title} onPick={(t) => setPersonal({ title: t })} /></Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name *"><input className={inp} value={cv.personal.fullName} onChange={(e) => setPersonal({ fullName: e.target.value })} placeholder="Adaeze Okafor" /></Field>
        <Field label="Professional title"><input className={inp} value={cv.personal.title} onChange={(e) => setPersonal({ title: e.target.value })} placeholder="Frontend Developer" /></Field>
        <Field label="Email"><input type="email" className={inp} value={cv.personal.email} onChange={(e) => setPersonal({ email: e.target.value })} placeholder="you@email.com" /></Field>
        <Field label="Phone"><input type="tel" className={inp} value={cv.personal.phone} onChange={(e) => setPersonal({ phone: e.target.value })} placeholder="+234 800 000 0000" /></Field>
      </div>
      <Field label="Location"><input className={inp} value={cv.personal.location} onChange={(e) => setPersonal({ location: e.target.value })} placeholder="Lagos, Nigeria" /></Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="LinkedIn"><input className={inp} value={cv.personal.linkedin} onChange={(e) => setPersonal({ linkedin: e.target.value })} placeholder="linkedin.com/in/you" /></Field>
        <Field label="Portfolio / Website"><input className={inp} value={cv.personal.portfolio} onChange={(e) => setPersonal({ portfolio: e.target.value })} placeholder="yoursite.com" /></Field>
        <Field label="GitHub"><input className={inp} value={cv.personal.github} onChange={(e) => setPersonal({ github: e.target.value })} placeholder="github.com/you" /></Field>
        <Field label="Website (other)"><input className={inp} value={cv.personal.website} onChange={(e) => setPersonal({ website: e.target.value })} placeholder="…" /></Field>
      </div>
    </div>,
    // 1 SUMMARY
    <div key="s1" className="space-y-4">
      <Field label="Professional summary">
        <textarea rows={6} className={`${inp} !h-auto py-3 leading-relaxed`} value={cv.summary} onChange={(e) => setCv({ ...cv, summary: e.target.value })}
          placeholder="2–4 sentences: who you are, your strongest skills, and what you deliver. DanTECH AI can polish it below." />
      </Field>
      <AIImprove text={cv.summary} field="summary" onApply={(t) => setCv({ ...cv, summary: t })} />
    </div>,
    // 2 EXPERIENCE
    <div key="s2" className="space-y-4">
      <ListEditor label="Position" items={cv.experience} setItems={(v) => setCv({ ...cv, experience: v })}
        empty={() => ({ role: '', company: '', location: '', start: '', end: '', description: '' })}
        render={(e, set) => (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input className={inp} value={e.role} onChange={(ev) => set({ role: ev.target.value })} placeholder="Job title" />
              <input className={inp} value={e.company} onChange={(ev) => set({ company: ev.target.value })} placeholder="Company" />
              <input className={inp} value={e.start} onChange={(ev) => set({ start: ev.target.value })} placeholder="Start (e.g. Jan 2022)" />
              <input className={inp} value={e.end} onChange={(ev) => set({ end: ev.target.value })} placeholder="End (or Present)" />
            </div>
            <input className={inp} value={e.location} onChange={(ev) => set({ location: ev.target.value })} placeholder="Location" />
            <textarea rows={3} className={`${inp} !h-auto py-3`} value={e.description} onChange={(ev) => set({ description: ev.target.value })} placeholder="What you did and achieved (one point per line)" />
            <AIImprove text={e.description} field="experience" onApply={(t) => set({ description: t })} />
          </div>
        )} />
    </div>,
    // 3 EDUCATION
    <div key="s3" className="space-y-4">
      <ListEditor label="Education" items={cv.education} setItems={(v) => setCv({ ...cv, education: v })}
        empty={() => ({ degree: '', school: '', year: '', details: '' })}
        render={(e, set) => (
          <div className="grid sm:grid-cols-2 gap-3">
            <input className={inp} value={e.degree} onChange={(ev) => set({ degree: ev.target.value })} placeholder="Degree / qualification" />
            <input className={inp} value={e.school} onChange={(ev) => set({ school: ev.target.value })} placeholder="Institution" />
            <input className={inp} value={e.year} onChange={(ev) => set({ year: ev.target.value })} placeholder="Year" />
            <input className={inp} value={e.details} onChange={(ev) => set({ details: ev.target.value })} placeholder="Details (grade, focus…)" />
          </div>
        )} />
    </div>,
    // 4 SKILLS
    <div key="s4" className="space-y-4">
      <Field label="Skills (one per line)">
        <textarea rows={6} className={`${inp} !h-auto py-3`} value={cv.skills.join('\n')}
          onChange={(e) => setCv({ ...cv, skills: e.target.value.split('\n') })}
          placeholder={'JavaScript\nCanva\nProject management'} />
      </Field>
      <AIImprove text={cv.skills.filter(Boolean).join(', ')} field="skills" onApply={(t) => setCv({ ...cv, skills: t.replace(/•/g, '').split(/\n|,\s*/).map((s) => s.trim()).filter(Boolean) })} />
    </div>,
    // 5 EXTRAS
    <div key="s5" className="space-y-6">
      <div><span className={lbl}>Projects</span>
        <ListEditor label="Project" items={cv.projects} setItems={(v) => setCv({ ...cv, projects: v })} empty={() => ({ name: '', link: '', description: '' })}
          render={(p, set) => (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input className={inp} value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="Project name" />
                <input className={inp} value={p.link} onChange={(e) => set({ link: e.target.value })} placeholder="Link (optional)" />
              </div>
              <textarea rows={2} className={`${inp} !h-auto py-3`} value={p.description} onChange={(e) => set({ description: e.target.value })} placeholder="What it does / your role" />
            </div>
          )} />
      </div>
      <div><span className={lbl}>Certifications</span>
        <ListEditor label="Certification" items={cv.certifications} setItems={(v) => setCv({ ...cv, certifications: v })} empty={() => ({ name: '', issuer: '', year: '' })}
          render={(c, set) => (
            <div className="grid sm:grid-cols-3 gap-3">
              <input className={inp} value={c.name} onChange={(e) => set({ name: e.target.value })} placeholder="Certification" />
              <input className={inp} value={c.issuer} onChange={(e) => set({ issuer: e.target.value })} placeholder="Issuer" />
              <input className={inp} value={c.year} onChange={(e) => set({ year: e.target.value })} placeholder="Year" />
            </div>
          )} />
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Achievements (one per line)">
          <textarea rows={4} className={`${inp} !h-auto py-3`} value={cv.achievements.join('\n')} onChange={(e) => setCv({ ...cv, achievements: e.target.value.split('\n') })} placeholder={'Grew Instagram page 0 → 5,000 followers\nBest Employee Q3 2024'} />
        </Field>
        <Field label="Languages (name — level)">
          <textarea rows={4} className={`${inp} !h-auto py-3`} value={cv.languages.map((l) => l.name ? `${l.name}${l.level ? ` — ${l.level}` : ''}` : '').join('\n')}
            onChange={(e) => setCv({ ...cv, languages: e.target.value.split('\n').map((s) => { const [name, level] = s.split('—').map((x) => x.trim()); return { name: name || '', level: level || '' }; }) })}
            placeholder={'English — Fluent\nYoruba — Native'} />
        </Field>
      </div>
      <div><span className={lbl}>Volunteer experience</span>
        <ListEditor label="Volunteer role" items={cv.volunteer} setItems={(v) => setCv({ ...cv, volunteer: v })} empty={() => ({ role: '', org: '', description: '' })}
          render={(v, set) => (
            <div className="grid sm:grid-cols-2 gap-3">
              <input className={inp} value={v.role} onChange={(e) => set({ role: e.target.value })} placeholder="Role" />
              <input className={inp} value={v.org} onChange={(e) => set({ org: e.target.value })} placeholder="Organization" />
              <input className={`${inp} sm:col-span-2`} value={v.description} onChange={(e) => set({ description: e.target.value })} placeholder="What you did" />
            </div>
          )} />
      </div>
      <div><span className={lbl}>References</span>
        <ListEditor label="Reference" items={cv.references} setItems={(v) => setCv({ ...cv, references: v })} empty={() => ({ name: '', role: '', contact: '' })}
          render={(r, set) => (
            <div className="grid sm:grid-cols-3 gap-3">
              <input className={inp} value={r.name} onChange={(e) => set({ name: e.target.value })} placeholder="Name" />
              <input className={inp} value={r.role} onChange={(e) => set({ role: e.target.value })} placeholder="Role / relationship" />
              <input className={inp} value={r.contact} onChange={(e) => set({ contact: e.target.value })} placeholder="Contact" />
            </div>
          )} />
      </div>
    </div>,
    // 6 TEMPLATE
    <div key="s6" className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {CV_TEMPLATES.map((t) => (
        <button key={t.id} onClick={() => setTemplate(t.id)}
          className={`rounded-2xl border p-4 text-left transition ${template === t.id ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}>
          <div className="h-2 w-10 rounded-full mb-3" style={{ background: t.accent }} />
          <div className="font-bold text-sm">{t.name}</div>
          <div className="text-[10px] font-bold tracking-widest text-cyan-300 mt-0.5">{t.category.toUpperCase()}</div>
          <div className="text-[11px] text-white/45 mt-1.5 leading-snug">{t.desc}</div>
          {template === t.id && <div className="text-[11px] font-bold text-cyan-300 mt-2 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Selected</div>}
        </button>
      ))}
    </div>,
    // 7 PREVIEW & DOWNLOAD
    <div key="s7" className="space-y-4">
      <div className="glass rounded-2xl p-5 flex flex-wrap gap-3 items-center">
        <button onClick={downloadPDF} className="btn-primary !py-3.5 !px-6 text-xs flex items-center gap-2"><Download className="h-4 w-4" /> DOWNLOAD CV AS PDF</button>
        <button onClick={downloadPDF} className="px-6 py-3.5 rounded-full glass font-bold text-xs flex items-center gap-2 hover:bg-white/10"><Printer className="h-4 w-4" /> PRINT CV</button>
        <button onClick={() => setFullPreview(true)} className="px-6 py-3.5 rounded-full glass font-bold text-xs flex items-center gap-2 hover:bg-white/10"><ZoomIn className="h-4 w-4" /> FULL-SCREEN PREVIEW</button>
      </div>
      <p className="text-[11px] text-white/40">Tip: in the print dialog choose <b>Save as PDF</b>, paper size <b>A4</b>, margins <b>default</b>. The file is print-ready.</p>
      {!user && (
        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-5">
          <div className="font-bold flex items-center gap-2 text-cyan-300 text-sm"><Cloud className="h-4 w-4" /> Want to edit this CV later?</div>
          <p className="text-xs text-white/60 mt-1">Your draft is saved on this device. <Link to="/register" className="text-cyan-300 font-bold underline">Create a free account</Link> to save multiple CV versions in the cloud.</p>
        </div>
      )}
      {user && (
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="font-bold text-sm flex items-center gap-2"><Cloud className="h-4 w-4 text-cyan-300" /> Cloud saving</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => saveToCloud(false)} disabled={saving} className="px-5 h-10 rounded-full bg-cyan-400 text-black text-xs font-bold flex items-center gap-2 disabled:opacity-50"><Save className="h-3.5 w-3.5" /> {activeId ? 'Save changes' : 'Save to my account'}</button>
            <button onClick={() => saveToCloud(true)} disabled={saving} className="px-5 h-10 rounded-full glass text-xs font-bold flex items-center gap-2 hover:bg-white/10"><Plus className="h-3.5 w-3.5" /> Save as new version</button>
          </div>
          {myCVs.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-bold tracking-widest text-white/40">MY SAVED CVs</div>
              {myCVs.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] px-3 py-2.5">
                  <div className="min-w-0"><div className="text-xs font-bold truncate">{d.title}</div><div className="text-[10px] text-white/40">{new Date(d.updatedAt).toLocaleString()}</div></div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => loadCV(d)} className="px-3 h-8 rounded-full glass text-[11px] font-bold">Open</button>
                    <button onClick={() => removeCV(d)} className="h-8 w-8 rounded-full glass flex items-center justify-center text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>,
  ][step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f]">
      <Toaster richColors />
      {/* Print-only copy of the CV (A4) */}
      <div id="cv-print-root"><CVPreview data={cv} template={template} /></div>

      {/* Full-screen preview modal */}
      {fullPreview && (
        <div className="fixed inset-0 z-[80] bg-black/90 overflow-y-auto p-4">
          <div className="max-w-[860px] mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-2">
                {[0.6, 0.8, 1].map((z) => <button key={z} onClick={() => setZoom(z)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${zoom === z ? 'bg-cyan-400 text-black' : 'glass text-white/60'}`}>{Math.round(z * 100)}%</button>)}
              </div>
              <button onClick={() => setFullPreview(false)} className="h-10 w-10 rounded-full glass flex items-center justify-center"><X className="h-5 w-5" /></button>
            </div>
            <div style={{ width: 794 * zoom }} className="mx-auto"><div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}><CVPreview data={cv} template={template} /></div></div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1280px] px-3 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link to="/" className="text-sm text-white/50 hover:text-white flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> Home</Link>
          <h1 className="font-display font-black text-xl md:text-2xl">CV BUILDER</h1>
          <button onClick={() => setShowPreview((s) => !s)} className="lg:hidden px-4 py-2 rounded-full glass text-xs font-bold flex items-center gap-2"><Eye className="h-4 w-4" /> {showPreview ? 'FORM' : 'PREVIEW'}</button>
        </div>

        {/* Stepper */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-5 -mx-3 px-3 sm:mx-0 sm:px-0">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)} className={`shrink-0 px-3.5 py-2 rounded-full text-[11px] font-bold transition ${i === step ? 'bg-cyan-400 text-black' : i < step ? 'bg-cyan-500/20 text-cyan-300' : 'glass text-white/40'}`}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-8 items-start">
          {/* FORM */}
          <div className={`${showPreview ? 'hidden lg:block' : ''} glass rounded-[24px] p-4 sm:p-6 space-y-5 min-w-0`}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">{STEPS[step]}</h2>
              <span className="text-[11px] text-white/35 font-bold">Step {step + 1} of {STEPS.length}</span>
            </div>
            {stepBody}
            <div className="flex justify-between gap-3 pt-2">
              <button disabled={step === 0} onClick={() => setStep(step - 1)} className="px-5 py-3 rounded-full glass font-bold text-xs disabled:opacity-30 flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Back</button>
              {step < STEPS.length - 1
                ? <button onClick={() => setStep(step + 1)} className="btn-primary !py-3 !px-6 !text-xs flex items-center gap-2">Next <ArrowRight className="h-4 w-4" /></button>
                : <button onClick={downloadPDF} className="btn-primary !py-3 !px-6 !text-xs flex items-center gap-2"><Download className="h-4 w-4" /> DOWNLOAD PDF</button>}
            </div>
          </div>

          {/* LIVE PREVIEW */}
          <div className={`${showPreview ? '' : 'hidden lg:block'} lg:sticky lg:top-24 min-w-0`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-widest text-white/40">LIVE PREVIEW — {CV_TEMPLATES.find((t) => t.id === template)?.name?.toUpperCase()}</span>
              <button onClick={() => setFullPreview(true)} className="text-[11px] font-bold text-cyan-300 flex items-center gap-1"><ZoomIn className="h-3.5 w-3.5" /> Expand</button>
            </div>
            <div ref={scaleWrap} className="w-full overflow-hidden rounded-xl bg-white shadow-2xl">
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 794 }}>
                <CVPreview data={cv} template={template} />
              </div>
              {/* keep wrapper height in sync with scaled page */}
              <div style={{ marginTop: -(1123 * (1 - scale)) }} />
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {CV_TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setTemplate(t.id)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${template === t.id ? 'bg-cyan-400 text-black' : 'glass text-white/50'}`}>{t.name}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
