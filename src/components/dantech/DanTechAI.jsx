import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, X, Send, Plus, Trash2, History, Square, Copy, Check, RefreshCw, Maximize2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { useLMS } from '../../context/LMSContext';
import { askDanTech, buildCourseIndex, SUGGESTED_PROMPTS, DANTECH_NAME, isCloudDanTechEnabled, AI_MODES, QUICK_ACTIONS } from '../../lib/dantech';
import { renderLessonMarkdown, downloadAsFile } from '../../lib/lms';

function withCopyButtons(html) {
  return String(html).replace(
    /<pre class="lesson-code">/g,
    '<div class="dantech-codewrap"><button data-copy-code="1" class="dantech-copy">Copy code</button><pre class="lesson-code">'
  ).replace(/<\/code><\/pre>/g, '</code></pre></div>');
}

export default function DanTechAI() {
  const { user } = useAuth();
  const { courses, getCourseBySlug, getCourseById, getProgress, ensureCourseDetail } = useCourses();
  const { saveConvo, getUserConvos, deleteConvo, siteSettings } = useLMS();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [convoId, setConvoId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [mode, setMode] = useState('quick');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const bottomRef = useRef(null);
  const boxRef = useRef(null);
  const ctrlRef = useRef(null);

  const enabled = siteSettings?.dantechEnabled !== false;
  const isStudent = user && user.role !== 'admin';
  const onAdmin = location.pathname.startsWith('/admin');
  const onStandaloneAI = location.pathname === '/ai';

  // ---- Lesson context (Learn page publishes current lesson to sessionStorage) ----
  const lessonCtx = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('wdth_lesson_ctx') || 'null'); } catch { return null; }
  }, [location.pathname, open]);
  const m = location.pathname.match(/^\/learn\/([\w-]+)/);
  const course = m ? getCourseBySlug(m[1]) : (lessonCtx ? getCourseById(lessonCtx.courseId) : null);
  const courseId = course?.id || null;

  // Catalog entries are light — load full curriculum for lesson-aware answers.
  useEffect(() => {
    if (courseId && !course?.curriculum) ensureCourseDetail(courseId).catch(() => {});
  }, [courseId, course?.curriculum, ensureCourseDetail]);

  const allLessons = useMemo(
    () => (course?.curriculum || []).flatMap((mod) => (mod.lessons || []).map((l) => ({ ...l, moduleTitle: mod.title }))),
    [course],
  );
  const lesson = lessonCtx && course ? allLessons.find((l) => l.id === lessonCtx.lessonId) : null;
  const progress = course && user ? getProgress(user.id, course.id) : null;
  const nextLesson = course && progress ? allLessons.find((l) => !(progress.completedLessons || []).includes(l.id)) : null;
  const index = useMemo(() => buildCourseIndex(courses), [courses]);
  const convos = user ? getUserConvos(user.id) : [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking, open]);

  // The Learn classroom dispatches 'wdth_open_dantech' with an optional
  // prefilled prompt ("Ask DanTECH AI" button) — open the tutor and prefill.
  useEffect(() => {
    const onOpen = (e) => {
      setOpen(true);
      setShowHistory(false);
      const prompt = e?.detail?.prompt;
      if (prompt) setInput(String(prompt));
    };
    window.addEventListener('wdth_open_dantech', onOpen);
    return () => window.removeEventListener('wdth_open_dantech', onOpen);
  }, []);

  // Hide for admins/guests and on the dedicated AI page, where a second
  // floating composer would cover the full-page composer. After all hooks.
  if (!enabled || !isStudent || onAdmin || onStandaloneAI) return null;

  const persist = async (msgs, id = convoId) => {
    try {
      const saved = await saveConvo({
        id, userId: user.id,
        title: (msgs.find((x) => x.role === 'user')?.text || 'New chat').slice(0, 60),
        messages: msgs.slice(-100),
        courseId: course?.id || null, lessonId: lesson?.id || null,
      });
      if (!convoId) setConvoId(saved.id);
    } catch {
      // Chat still works — history sync is best-effort.
    }
  };

  const send = async (text, opts = {}) => {
    const msg = (text ?? input).trim();
    if (!msg || thinking) return;
    const userMsg = { role: 'user', text: msg, createdAt: new Date().toISOString() };
    const base = opts.base || messages;
    const next = [...base, userMsg];
    setMessages(next);
    setInput('');
    setThinking(true);
    const mObj = AI_MODES.find((x) => x.id === mode);
    const prompt = mObj?.prefix ? `${mObj.prefix}${msg}` : msg;
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    try {
      const reply = await askDanTech(prompt, {
        context: { courseId: course?.id, lessonId: lesson?.id, level: course?.level },
        history: next.map((x) => ({ role: x.role, text: x.text })),
        signal: ctrl.signal, mode,
        index, course, lesson, nextLesson, progress,
      });
      const final = [...next, { role: 'ai', text: reply.text, sources: reply.sources || [], mode, createdAt: new Date().toISOString() }];
      setMessages(final);
      persist(final);
    } catch (err) {
      if (err?.name === 'AbortError') {
        setMessages([...next, { role: 'ai', text: '_Stopped. Ask me to continue or rephrase._', mode, createdAt: new Date().toISOString() }]);
      } else {
        setMessages([...next, { role: 'ai', text: `Hmm, I hit a snag. Please try again in a moment. (Error: ${err.message})`, createdAt: new Date().toISOString() }]);
      }
    } finally {
      setThinking(false);
      ctrlRef.current = null;
    }
  };

  const stopGen = () => ctrlRef.current?.abort();
  const regenerate = () => {
    const lastUser = [...messages].reverse().find((x) => x.role === 'user');
    if (!lastUser || thinking) return;
    send(lastUser.text, { base: messages.slice(0, Math.max(0, messages.length - 2)) });
  };
  const copyMsg = async (text, idx) => {
    try { await navigator.clipboard.writeText(text); setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 1500); } catch { /* noop */ }
  };

  const newChat = () => { setMessages([]); setConvoId(null); setShowHistory(false); };
  const loadConvo = (c) => { setMessages(c.messages || []); setConvoId(c.id); setShowHistory(false); };

  const onMessagesClick = (e) => {
    const btn = e.target.closest('[data-copy-code]');
    if (!btn) return;
    const code = btn.parentElement?.querySelector('code')?.innerText || '';
    navigator.clipboard.writeText(code).then(() => {
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy code'; }, 1500);
    });
  };

  const exportChat = () => {
    const md = messages.map((x) => `**${x.role === 'ai' ? DANTECH_NAME : 'You'}:**\n${x.text}`).join('\n\n---\n\n');
    downloadAsFile(`dantech-chat-${Date.now()}.md`, md, 'text/markdown');
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={`Ask ${DANTECH_NAME}`}
          className="safe-floating-bottom fixed right-[max(0.75rem,env(safe-area-inset-right))] z-40 flex max-w-[calc(100vw-1.5rem)] items-center gap-2.5 pl-2 pr-4 sm:pr-5 py-2 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-[0_8px_30px_rgba(139,92,246,0.5)] hover:scale-105 transition-all"
        >
          <span className="h-11 w-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl animate-pulse">🤖</span>
          <span className="text-left leading-tight">
            <span className="block font-black text-sm">Ask {DANTECH_NAME}</span>
            <span className="block text-[11px] text-white/70">{course ? `Help with ${course.title.slice(0, 22)}…` : 'Your AI Learning Assistant'}</span>
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div role="dialog" aria-modal="true" aria-label={`${DANTECH_NAME} chat`} className="safe-floating-bottom fixed z-50 inset-x-2 sm:inset-x-auto sm:right-[max(1.25rem,env(safe-area-inset-right))] sm:w-[420px] h-[min(78dvh,700px)] sm:h-[600px] max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1rem)] rounded-[20px] sm:rounded-[24px] overflow-hidden glass-strong shadow-2xl flex flex-col border border-purple-500/30">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">🤖</div>
            <div className="flex-1 min-w-0">
              <div className="font-black flex items-center gap-1.5">{DANTECH_NAME} <Sparkles className="h-3.5 w-3.5" /></div>
              <div className="text-[11px] text-white/70 truncate">Your AI Learning Assistant {course ? `• 📖 ${course.title.slice(0, 26)}` : ''}</div>
            </div>
            <Link to="/ai" onClick={() => setOpen(false)} title="Open full page" aria-label="Open full AI page" className="hidden min-[375px]:flex h-11 w-11 shrink-0 rounded-full bg-white/15 items-center justify-center hover:bg-white/25"><Maximize2 className="h-4 w-4" /></Link>
            <button onClick={() => setShowHistory(!showHistory)} title="History" aria-label="Conversation history" className="h-11 w-11 shrink-0 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25"><History className="h-4 w-4" /></button>
            <button onClick={newChat} title="New chat" aria-label="Start new chat" className="hidden min-[375px]:flex h-11 w-11 shrink-0 rounded-full bg-white/15 items-center justify-center hover:bg-white/25"><Plus className="h-4 w-4" /></button>
            <button onClick={() => setOpen(false)} aria-label="Close AI chat" className="h-11 w-11 shrink-0 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25"><X className="h-4 w-4" /></button>
          </div>

          {/* AI modes */}
          <div className="px-3 pt-2.5 pb-1 flex gap-1.5 overflow-x-auto bg-white/[0.03]" role="tablist" aria-label="AI modes">
            {AI_MODES.map((mm) => (
              <button key={mm.id} role="tab" aria-selected={mode === mm.id} onClick={() => setMode(mm.id)} title={mm.hint}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold transition ${mode === mm.id ? 'bg-cyan-400 text-black' : 'glass text-white/50 hover:text-white'}`}>
                {mm.icon} {mm.name}
              </button>
            ))}
          </div>

          {showHistory ? (
            <div className="flex-1 overflow-auto p-3 space-y-2">
              <div className="text-xs font-bold text-white/40 px-1">CONVERSATION HISTORY ({convos.length})</div>
              {convos.map((c) => (
                <div key={c.id} className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08]">
                  <button onClick={() => loadConvo(c)} className="flex-1 text-left min-w-0">
                    <div className="font-bold text-sm truncate">{c.title}</div>
                    <div className="text-[11px] text-white/40">{c.messages?.length || 0} msgs • {new Date(c.updatedAt).toLocaleDateString()}</div>
                  </button>
                  <button onClick={() => deleteConvo(c.id)} className="text-white/30 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              {convos.length === 0 && <div className="text-center text-sm text-white/40 py-10">No conversations yet.</div>}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div ref={boxRef} onClick={onMessagesClick} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-6 space-y-3">
                    <div className="text-5xl">🤖</div>
                    <div className="font-bold text-lg">Hi! I'm {DANTECH_NAME}.</div>
                    <p className="text-sm text-white/60 max-w-[300px] mx-auto">What would you like to learn today?{lesson ? ` I can see you're studying **${lesson.title}**.` : ''}</p>
                    <div className="flex flex-wrap gap-2 justify-center pt-2">
                      {SUGGESTED_PROMPTS.map((s) => (
                        <button key={s} onClick={() => send(s === 'Explain this lesson' && lesson ? `Explain this lesson: ${lesson.title}` : s)} className="px-3 py-1.5 rounded-full glass text-xs font-bold hover:bg-white/15">{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-md' : 'bg-white/[0.06] border border-white/10 rounded-bl-md'}`}>
                      {msg.role === 'ai' && <div className="text-[10px] font-black tracking-widest text-purple-300 mb-1.5">✨ {DANTECH_NAME}</div>}
                      {msg.role === 'user' ? (
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                      ) : (
                        <div className="lesson-body dantech-body" dangerouslySetInnerHTML={{ __html: withCopyButtons(renderLessonMarkdown(msg.text)) }} />
                      )}
                      {msg.sources?.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-white/40">📚 Sources: {msg.sources.map((s) => s.lessonTitle).join(' • ').slice(0, 120)}</div>
                      )}
                      {msg.role === 'ai' && (
                        <div className="flex gap-1 mt-2">
                          <button onClick={() => copyMsg(msg.text, i)} title="Copy answer" className="h-6 px-2 rounded-full bg-white/5 text-[10px] font-bold text-white/50 hover:text-white flex items-center gap-1">
                            {copiedIdx === i ? <><Check className="h-3 w-3 text-cyan-300" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                          </button>
                          {i === messages.length - 1 && !thinking && (
                            <button onClick={regenerate} title="Regenerate" className="h-6 px-2 rounded-full bg-white/5 text-[10px] font-bold text-white/50 hover:text-white flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Retry</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" />
                      <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggested follow-ups */}
              {/* Quick actions — always available, incl. on lesson pages */}
              <div className="px-3 pb-1 flex gap-1.5 overflow-x-auto" aria-label="Quick actions">
                {QUICK_ACTIONS.map((qa) => (
                  <button key={qa.id} onClick={() => send(qa.prompt)} disabled={thinking} className="whitespace-nowrap px-3 py-1 rounded-full glass text-[10px] font-bold text-white/60 hover:text-cyan-300 disabled:opacity-40">{qa.label}</button>
                ))}
                {messages.length > 0 && <button onClick={exportChat} className="whitespace-nowrap px-3 py-1 rounded-full glass text-[10px] font-bold">Export</button>}
              </div>

              {/* Input */}
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 border-t border-white/10 flex gap-2">
                <input
                  value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder={lesson ? `Ask about "${lesson.title.slice(0, 30)}..."` : `Ask ${DANTECH_NAME} anything...`}
                  className="flex-1 h-11 rounded-full glass px-4 text-sm focus:outline-none focus:border-purple-400/50"
                />
                {thinking ? (
                  <button type="button" onClick={stopGen} title="Stop" className="h-11 w-11 rounded-full bg-red-500/90 flex items-center justify-center shrink-0"><Square className="h-4 w-4" /></button>
                ) : (
                  <button disabled={!input.trim()} className="h-11 w-11 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 flex items-center justify-center disabled:opacity-40 shrink-0">
                    <Send className="h-4 w-4" />
                  </button>
                )}
              </form>
              <div className="px-4 pb-2.5 text-[10px] text-white/30 text-center">
                {DANTECH_NAME} guides your learning — it won't do assignments for you 🙂 {isCloudDanTechEnabled() ? '• Cloud AI' : '• On-device'}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
