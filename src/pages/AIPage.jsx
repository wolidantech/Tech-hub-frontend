import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Square, Plus, Copy, Check, RefreshCw, Pencil, Trash2, Paperclip, Sparkles, History, X, BookOpen, Layers, StickyNote, Dumbbell, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { askDanTech, AI_MODES, QUICK_ACTIONS } from '../lib/dantech';
import { generate } from '../lib/ai';
import { renderLessonMarkdown } from '../lib/lms';
import { saveNoteDb } from '../lib/store';
import { toast, Toaster } from 'sonner';

const LS_CONVOS = 'wdth_ai_convos_v1';
const LS_ACTIVE = 'wdth_ai_active_v1';
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const loadConvos = () => { try { return JSON.parse(localStorage.getItem(LS_CONVOS) || '[]') || []; } catch { return []; } };

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3" aria-label="DanTECH AI is typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-2 w-2 rounded-full bg-cyan-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
      <span className="ml-2 text-[11px] text-white/40 font-bold">DanTECH AI is typing…</span>
    </div>
  );
}

// ==================== Study tools drawer ====================
function StudyTools({ user, open, onClose }) {
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState(null);
  const [cards, setCards] = useState(null);
  const [flipped, setFlipped] = useState({});
  const [doc, setDoc] = useState(null); // {kind, markdown}

  const needTopic = () => { if (!topic.trim()) { toast.error('Enter a topic first (e.g. "CSS Flexbox")'); return false; } return true; };
  const runCards = async () => {
    if (!needTopic()) return; setBusy('cards'); setDoc(null);
    try { const out = await generate('flashcards', { topic: topic.trim() }); setCards(out.data); setFlipped({}); }
    catch (e) { toast.error(e.message); } finally { setBusy(null); }
  };
  const runDoc = async (kind) => {
    if (!needTopic()) return; setBusy(kind); setCards(null);
    try {
      const out = await generate(kind, { topic: topic.trim() });
      setDoc({ kind, markdown: out.data.markdown || JSON.stringify(out.data, null, 2) });
    } catch (e) { toast.error(e.message); } finally { setBusy(null); }
  };
  const saveDocAsNote = async () => {
    if (!user) { toast.info('Sign in to save notes to your account.'); return; }
    if (!doc) return;
    try {
      await saveNoteDb({ userId: user.id, title: `${topic.trim() || 'Study'} — ${doc.kind}`, body: doc.markdown });
      toast.success('Saved to your study notes 📌');
    } catch (e) { toast.error(e.message); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <button aria-label="Close study tools" onClick={onClose} className="absolute inset-0 bg-black/70" />
      <div className="absolute right-0 top-0 h-full w-full max-w-[420px] bg-[#04102c] border-l border-white/10 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="font-bold flex items-center gap-2"><BookOpen className="h-4 w-4 text-cyan-300" /> STUDY TOOLS</div>
          <button onClick={onClose} className="h-9 w-9 rounded-full glass flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label htmlFor="st-topic" className="block text-[11px] font-bold tracking-widest text-white/40 uppercase mb-1.5">Topic</label>
            <input id="st-topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. CSS Flexbox, SEO, Canva…"
              className="w-full h-11 rounded-xl bg-white/[0.05] border border-white/10 px-3.5 text-sm focus:outline-none focus:border-cyan-400/60" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={runCards} disabled={!!busy} className="h-11 rounded-xl glass text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-40"><Layers className="h-4 w-4 text-cyan-300" /> {busy === 'cards' ? '…' : 'FLASHCARDS'}</button>
            <button onClick={() => runDoc('notes')} disabled={!!busy} className="h-11 rounded-xl glass text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-40"><StickyNote className="h-4 w-4 text-cyan-300" /> {busy === 'notes' ? '…' : 'STUDY NOTES'}</button>
            <button onClick={() => runDoc('summary')} disabled={!!busy} className="h-11 rounded-xl glass text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-40"><Sparkles className="h-4 w-4 text-cyan-300" /> {busy === 'summary' ? '…' : 'SUMMARY'}</button>
            <button onClick={() => runDoc('exercise')} disabled={!!busy} className="h-11 rounded-xl glass text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/10 disabled:opacity-40"><Dumbbell className="h-4 w-4 text-cyan-300" /> {busy === 'exercise' ? '…' : 'PRACTICE'}</button>
          </div>

          {cards && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/50">{cards.title} — tap to flip</span>
                <button onClick={() => setFlipped({})} className="text-[11px] font-bold text-cyan-300">Reset</button>
              </div>
              {cards.cards.map((c, i) => (
                <button key={i} onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
                  className={`w-full text-left rounded-2xl border p-4 transition ${flipped[i] ? 'border-cyan-400/50 bg-cyan-500/10' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'}`}>
                  <div className="text-[10px] font-bold tracking-widest text-cyan-300 mb-1">{flipped[i] ? 'ANSWER' : `CARD ${i + 1}`}</div>
                  <div className="text-sm leading-relaxed">{flipped[i] ? c.back : c.front}</div>
                </button>
              ))}
            </div>
          )}

          {doc && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-widest text-cyan-300">{doc.kind.toUpperCase()}</span>
                <button onClick={saveDocAsNote} className="text-[11px] font-bold text-cyan-300 flex items-center gap-1"><Save className="h-3.5 w-3.5" /> Save to notes</button>
              </div>
              <div className="lesson-body text-sm" dangerouslySetInnerHTML={{ __html: renderLessonMarkdown(doc.markdown) }} />
            </div>
          )}

          <div className="rounded-2xl glass p-4 text-[11px] text-white/50 leading-relaxed space-y-1.5">
            <p className="font-bold text-white/70">📌 Bookmarks & lesson summaries</p>
            <p>Bookmark any lesson from its page in the classroom, then use the DanTECH AI panel there for lesson-specific summaries, quizzes and questions.</p>
            <p className="font-bold text-white/70 pt-1">🔒 Privacy</p>
            <p>DanTECH AI only sees what YOU paste or upload here. It never sees other students' files or submissions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Main page ====================
export default function AIPage() {
  const { user } = useAuth();
  const [convos, setConvos] = useState(loadConvos);
  const [activeId, setActiveId] = useState(() => localStorage.getItem(LS_ACTIVE) || null);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('quick');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(null);
  const [histOpen, setHistOpen] = useState(false);
  const [studyOpen, setStudyOpen] = useState(false);
  const ctrlRef = useRef(null);
  const scrollRef = useRef(null);
  const taRef = useRef(null);
  const fileRef = useRef(null);

  const active = useMemo(() => convos.find((c) => c.id === activeId) || null, [convos, activeId]);
  const messages = active?.messages || [];

  // persist
  useEffect(() => { try { localStorage.setItem(LS_CONVOS, JSON.stringify(convos.slice(0, 20))); } catch { /* full */ } }, [convos]);
  useEffect(() => { if (activeId) localStorage.setItem(LS_ACTIVE, activeId); }, [activeId]);
  useEffect(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages.length, busy]);

  const newChat = () => {
    const c = { id: uid(), title: 'New chat', messages: [], createdAt: Date.now(), updatedAt: Date.now() };
    setConvos((cs) => [c, ...cs]); setActiveId(c.id); setHistOpen(false); setInput('');
  };
  const removeChat = (id) => {
    setConvos((cs) => cs.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
    toast.info('Conversation deleted');
  };
  const patchConvo = (id, fn) => setConvos((cs) => cs.map((c) => (c.id === id ? { ...fn(c), updatedAt: Date.now() } : c)));

  const send = async (raw, opts = {}) => {
    const text = String(raw ?? input).trim();
    if (!text || busy) return;
    let convo = active;
    if (!convo) { convo = { id: uid(), title: text.slice(0, 48), messages: [], createdAt: Date.now(), updatedAt: Date.now() }; setConvos((cs) => [convo, ...cs]); setActiveId(convo.id); }
    const baseMessages = opts.base || convo.messages;
    const userMsg = { role: 'user', content: text, ts: Date.now(), mode };
    patchConvo(convo.id, (c) => ({ ...c, title: c.messages.length ? c.title : text.slice(0, 48), messages: [...baseMessages, userMsg] }));
    setInput(''); setBusy(true);

    const mObj = AI_MODES.find((m) => m.id === mode);
    const prompt = mObj?.prefix ? `${mObj.prefix}${text}` : text;
    const history = baseMessages.map((m) => ({ role: m.role, content: m.content }));
    ctrlRef.current = new AbortController();
    try {
      const res = await askDanTech(prompt, { history, signal: ctrlRef.current.signal, mode });
      patchConvo(convo.id, (c) => ({ ...c, messages: [...c.messages, { role: 'assistant', content: res.text, ts: Date.now(), mode, provider: res.provider, sources: res.sources || [] }] }));
    } catch (err) {
      if (err.name === 'AbortError') {
        patchConvo(convo.id, (c) => ({ ...c, messages: [...c.messages, { role: 'assistant', content: '_(stopped by you — ask me to continue or rephrase)_', ts: Date.now(), mode }] }));
      } else {
        toast.error(err.message || 'DanTECH AI hit an error');
      }
    } finally { setBusy(false); ctrlRef.current = null; }
  };

  const stop = () => ctrlRef.current?.abort();
  const regenerate = () => {
    const msgs = [...messages];
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'assistant') { msgs.splice(i, 1); break; }
    }
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    const convo = active;
    patchConvo(convo.id, (c) => ({ ...c, messages: msgs.slice(0, -1) })); // drop user msg too; send() re-adds it
    send(lastUser.content, { base: msgs.slice(0, -1) });
  };
  const editMsg = (msgId) => {
    const idx = messages.findIndex((m) => m.ts === msgId);
    if (idx < 0) return;
    setInput(messages[idx].content);
    patchConvo(active.id, (c) => ({ ...c, messages: messages.slice(0, idx) }));
    taRef.current?.focus();
  };
  const copyMsg = async (text, key) => {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1500); }
    catch { toast.error('Could not copy'); }
  };

  const onFile = (e) => {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    if (!/\.(txt|md|csv|json)$/i.test(f.name)) {
      toast.error('Only text files (.txt, .md, .csv, .json) can be read here. For PDFs or docs, paste the text into the chat.');
      return;
    }
    if (f.size > 200 * 1024) { toast.error('File is larger than 200 KB — paste the most relevant section instead.'); return; }
    const reader = new FileReader();
    reader.onload = () => send(`Here is my uploaded file "${f.name}":\n\n"""\n${String(reader.result).slice(0, 60000)}\n"""\n\nPlease summarize it, list the key concepts, and give me 3 questions to test myself.`);
    reader.onerror = () => toast.error('Could not read that file');
    reader.readAsText(f);
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const modeObj = AI_MODES.find((m) => m.id === mode);

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] text-white">
      <Toaster richColors />
      <StudyTools user={user} open={studyOpen} onClose={() => setStudyOpen(false)} />

      {/* Header */}
      <header className="shrink-0 border-b border-white/10 bg-[#020a1f]/80 backdrop-blur-xl">
        <div className="px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/dashboard" aria-label="Back to dashboard" className="h-9 w-9 rounded-full glass flex items-center justify-center shrink-0"><ArrowLeft className="h-4 w-4" /></Link>
            <div className="min-w-0">
              <div className="font-display font-black text-sm sm:text-base truncate">DAN<span className="text-cyan-400">TECH</span> AI</div>
              <div className="text-[10px] text-white/40 font-bold truncate">Your study & career copilot</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setHistOpen((v) => !v)} className="lg:hidden h-9 px-3 rounded-full glass text-[11px] font-bold flex items-center gap-1.5" aria-label="Conversation history"><History className="h-4 w-4" /><span className="hidden sm:inline">History</span></button>
            <button onClick={() => setStudyOpen(true)} className="h-9 px-3 rounded-full glass text-[11px] font-bold flex items-center gap-1.5 text-cyan-300"><BookOpen className="h-4 w-4" /><span className="hidden sm:inline">Study tools</span></button>
            <button onClick={newChat} className="h-9 px-3.5 rounded-full bg-cyan-400 text-black text-[11px] font-bold flex items-center gap-1.5"><Plus className="h-4 w-4" /><span className="hidden sm:inline">New chat</span></button>
          </div>
        </div>
        {/* Modes bar */}
        <div className="px-3 sm:px-6 pb-2.5 flex gap-1.5 overflow-x-auto" role="tablist" aria-label="AI modes">
          {AI_MODES.map((m) => (
            <button key={m.id} role="tab" aria-selected={mode === m.id} onClick={() => setMode(m.id)} title={m.hint}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition ${mode === m.id ? 'bg-cyan-400 text-black' : 'glass text-white/50 hover:text-white'}`}>
              {m.icon} {m.name}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        {/* History sidebar */}
        <aside className={`${histOpen ? 'flex absolute z-40 inset-y-0 left-0 w-[280px] bg-[#04102c] border-r border-white/10' : 'hidden'} lg:relative lg:flex lg:w-[260px] lg:bg-transparent lg:border-r lg:border-white/5 flex-col`}>
          <div className="flex items-center justify-between p-3 lg:pt-4">
            <span className="text-[11px] font-bold tracking-widest text-white/40">CONVERSATIONS</span>
            <button onClick={() => setHistOpen(false)} className="lg:hidden h-8 w-8 rounded-full glass flex items-center justify-center"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
            {convos.length === 0 && <p className="text-xs text-white/35 px-2 py-4">No conversations yet. Start one — any question works.</p>}
            {convos.map((c) => (
              <div key={c.id} className={`group rounded-xl px-3 py-2.5 cursor-pointer transition flex items-center justify-between gap-2 ${c.id === activeId ? 'bg-cyan-500/15 border border-cyan-400/30' : 'bg-white/[0.03] border border-transparent hover:bg-white/[0.07]'}`}
                onClick={() => { setActiveId(c.id); setHistOpen(false); }} role="button" tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveId(c.id)}>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{c.title}</div>
                  <div className="text-[10px] text-white/35">{c.messages.length} messages · {new Date(c.updatedAt).toLocaleDateString()}</div>
                </div>
                <button aria-label={`Delete conversation ${c.title}`} onClick={(e) => { e.stopPropagation(); removeChat(c.id); }}
                  className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-white/30 hover:text-red-300 hover:bg-white/10"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-white/10 text-[10px] text-white/35 leading-relaxed">
            Saved on this device. Use lesson pages for course-aware answers.
          </div>
        </aside>

        {/* Chat column */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4">
            <div className="max-w-[860px] mx-auto space-y-4">
              {messages.length === 0 && !busy && (
                <div className="text-center py-10 md:py-16">
                  <div className="inline-flex h-16 w-16 rounded-3xl bg-gradient-to-br from-cyan-400 to-purple-500 items-center justify-center text-3xl shadow-[0_0_60px_rgba(34,211,238,0.35)]">🤖</div>
                  <h1 className="font-display font-black text-2xl md:text-4xl mt-5">Hi {user?.fullName?.split?.(' ')[0] || 'there'}! Ask me anything.</h1>
                  <p className="text-white/50 mt-2 max-w-[520px] mx-auto text-sm md:text-base">Lessons, code, careers, CVs, business — pick a mode above and go. For lesson-specific help, open DanTECH AI on the lesson page.</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-[640px] mx-auto">
                    {QUICK_ACTIONS.slice(0, 6).map((qa) => (
                      <button key={qa.id} onClick={() => send(qa.prompt)} className="px-4 py-2.5 rounded-full glass text-xs font-bold hover:bg-white/10 transition">{qa.label}</button>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-[640px] mx-auto">
                    {['How do I start freelancing as a beginner?', 'Explain CSS Flexbox simply', 'Build me a 2-week study plan for Canva'].map((p) => (
                      <button key={p} onClick={() => send(p)} className="px-4 py-2.5 rounded-full border border-white/10 text-xs text-white/60 hover:border-cyan-400/40 hover:text-white transition">{p}</button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={m.ts + i} className={m.role === 'user' ? 'flex justify-end' : ''}>
                  {m.role === 'user' ? (
                    <div className="max-w-[85%] sm:max-w-[70%]">
                      <div className="rounded-3xl rounded-br-lg bg-gradient-to-br from-cyan-500/90 to-blue-600/90 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words">{m.content}</div>
                      <div className="flex justify-end gap-1 mt-1">
                        <button onClick={() => editMsg(m.ts)} aria-label="Edit message" className="h-7 w-7 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => copyMsg(m.content, `u-${m.ts}`)} aria-label="Copy message" className="h-7 w-7 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10">{copied === `u-${m.ts}` ? <Check className="h-3.5 w-3.5 text-cyan-300" /> : <Copy className="h-3.5 w-3.5" />}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="glass rounded-2xl rounded-tl-lg p-4 sm:p-5 max-w-full">
                      <div className="flex items-center gap-2 mb-2 text-[10px] font-bold tracking-widest text-white/35">
                        <span className="text-cyan-300">DANTECH AI</span>
                        {m.mode && <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/50">{AI_MODES.find((x) => x.id === m.mode)?.name?.toUpperCase() || m.mode}</span>}
                        {m.provider === 'local' && <span className="text-white/25">ON-DEVICE ASSIST</span>}
                        {m.provider === 'secure-backend' && <span className="text-white/25">SECURE BACKEND</span>}
                      </div>
                      <div className="lesson-body text-sm leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: renderLessonMarkdown(m.content) }} />
                      {m.sources?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-white/40 space-y-1">
                          <span className="font-bold tracking-widest text-white/35">SOURCES (from backend search):</span>
                          {m.sources.map((s, si) => <div key={si}>• {typeof s === 'string' ? s : <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">{s.title || s.url}</a>}</div>)}
                        </div>
                      )}
                      <div className="flex gap-1 mt-3">
                        <button onClick={() => copyMsg(m.content, `a-${m.ts}`)} className="h-7 px-2.5 rounded-full glass text-[11px] font-bold flex items-center gap-1.5 text-white/60 hover:text-white">{copied === `a-${m.ts}` ? <><Check className="h-3.5 w-3.5 text-cyan-300" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}</button>
                        {i === messages.length - 1 && !busy && (
                          <button onClick={regenerate} className="h-7 px-2.5 rounded-full glass text-[11px] font-bold flex items-center gap-1.5 text-white/60 hover:text-white"><RefreshCw className="h-3.5 w-3.5" /> Regenerate</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {busy && <div className="glass rounded-2xl rounded-tl-lg"><TypingDots /></div>}
            </div>
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-white/10 bg-[#020a1f]/90 backdrop-blur-xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="max-w-[860px] mx-auto px-3 sm:px-6 pt-2.5">
              {messages.length > 0 && (
                <div className="flex gap-1.5 overflow-x-auto pb-2" aria-label="Quick actions">
                  {QUICK_ACTIONS.map((qa) => (
                    <button key={qa.id} onClick={() => send(qa.prompt)} disabled={busy}
                      className="shrink-0 px-3 py-1.5 rounded-full glass text-[10px] font-bold text-white/60 hover:text-cyan-300 disabled:opacity-40">{qa.label}</button>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <input ref={fileRef} type="file" accept=".txt,.md,.csv,.json" className="hidden" onChange={onFile} aria-hidden="true" tabIndex={-1} />
                <button onClick={() => fileRef.current?.click()} aria-label="Attach a text file" className="h-11 w-11 shrink-0 rounded-full glass flex items-center justify-center text-white/50 hover:text-cyan-300 transition"><Paperclip className="h-4 w-4" /></button>
                <textarea ref={taRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} rows={1}
                  placeholder={`Message DanTECH AI (${modeObj?.name})…`} aria-label="Message DanTECH AI"
                  className="flex-1 max-h-40 min-h-[44px] rounded-2xl bg-white/[0.05] border border-white/10 px-4 py-3 text-sm resize-none focus:outline-none focus:border-cyan-400/60 placeholder:text-white/30" />
                {busy ? (
                  <button onClick={stop} aria-label="Stop generating" className="h-11 w-11 shrink-0 rounded-full bg-red-500/90 flex items-center justify-center"><Square className="h-4 w-4" /></button>
                ) : (
                  <button onClick={() => send()} disabled={!input.trim()} aria-label="Send message" className="h-11 w-11 shrink-0 rounded-full bg-cyan-400 text-black flex items-center justify-center disabled:opacity-40"><Send className="h-4 w-4" /></button>
                )}
              </div>
              <div className="flex items-center justify-between pt-1.5 text-[10px] text-white/30">
                <span>{modeObj?.icon} {modeObj?.name}: {modeObj?.hint}</span>
                <span className="hidden sm:inline">Enter to send · Shift+Enter for new line</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
