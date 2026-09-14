import { useParams, useSearchParams, Navigate, Link } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Play, CheckCircle2, BookOpen, ArrowLeft, FileText, ChevronDown, ChevronUp, Video, HelpCircle, PenLine, Award, ListChecks, Search, Menu, X, Sparkles, Wrench, Printer, Layers, AlertTriangle, RefreshCw } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import { useAuth } from '../context/AuthContext';
import QuizTaker from '../components/learn/QuizTaker';
import AssignmentPanel from '../components/learn/AssignmentPanel';
import PracticalPanel from '../components/learn/PracticalPanel';
import ResourceList from '../components/learn/ResourceList';
import Discussions from '../components/learn/Discussions';
import { BrandMark } from '../components/common/BrandLogo';
import { ErrorState, Skeleton } from '../components/common/StateUI';
import { renderLessonMarkdown, evaluateCompletion, getCourseCompletionRules, downloadAsFile } from '../lib/lms';
import { signedUrl } from '../lib/supabase';
import { toast, Toaster } from 'sonner';

function youtubeId(url = '') {
  const m = String(url).match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : null;
}
const isDirectVideo = (url) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(String(url || ''));
const toEmbed = (url) => {
  const id = youtubeId(url);
  if (id) return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
  return url;
};

// ---------- Lesson type presentation ----------
const LESSON_TYPES = {
  video: { label: 'VIDEO LESSON', Icon: Video },
  text: { label: 'READING LESSON', Icon: BookOpen },
  practical: { label: 'PRACTICAL LESSON', Icon: Wrench },
  quiz: { label: 'QUIZ', Icon: HelpCircle },
  assignment: { label: 'ASSIGNMENT', Icon: PenLine },
  project: { label: 'FINAL PROJECT', Icon: Award },
  resource: { label: 'RESOURCES', Icon: FileText },
};
const lessonType = (lesson) => LESSON_TYPES[lesson?.type] || LESSON_TYPES.video;

// Pull structured callouts out of the lesson markdown so the classroom can
// show objectives / key points even before the student opens the full text.
function extractSection(src = '', marker = '') {
  const re = new RegExp(`^## [^\\n]*${marker}[^\\n]*\\n([\\s\\S]*?)(?=^## |$)`, 'm');
  const m = String(src || '').match(re);
  if (!m) return [];
  return m[1].split('\n').map((l) => l.trim()).filter((l) => /^[-*]\s/.test(l)).map((l) => l.replace(/^[-*]\s+(?:\[[ x]\]\s*)?/, ''));
}

function VideoFacade({ url, title }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const yid = youtubeId(url);
  if (!url) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0a1a4a] to-[#020a1f] p-8">
        <div className="text-center">
          <Video className="h-12 w-12 mx-auto text-white/20 mb-3" />
          <div className="font-bold">Video coming soon</div>
          <div className="text-sm text-white/50 mt-1">Read the lesson below to continue learning.</div>
        </div>
      </div>
    );
  }
  if (yid && loaded) {
    return <iframe src={toEmbed(url)} className="absolute inset-0 w-full h-full" allowFullScreen title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />;
  }
  if (isDirectVideo(url)) {
    return (
      <video
        src={url} controls playsInline preload="none"
        onError={() => setFailed(true)}
        className="absolute inset-0 w-full h-full bg-black"
      />
    );
  }
  return (
    <button onClick={() => setLoaded(true)} className="absolute inset-0 group w-full h-full text-left">
      {yid ? (
        <img src={`https://i.ytimg.com/vi/${yid}/hqdefault.jpg`} alt={title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a4a] to-[#020a1f]" />
      )}
      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="h-20 w-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition shadow-2xl">
          <Play className="h-8 w-8 text-black ml-1" />
        </div>
        <div className="text-sm font-bold text-white/90">▶ PLAY LESSON VIDEO</div>
        <div className="text-[11px] text-white/50 px-6 text-center">Video loads only when you press play (saves data)</div>
      </div>
    </button>
  );
}

const SPEEDS = [1, 1.25, 1.5, 2];
function LessonVideo({ lesson, onVideoProgress }) {
  const [signed, setSigned] = useState(null);
  const [state, setState] = useState('idle'); // idle | loading | ready | error
  const [speed, setSpeed] = useState(1);
  const lastReport = useRef(0);
  useEffect(() => {
    let alive = true;
    setSigned(null);
    if (lesson.videoStoragePath) {
      setState('loading');
      signedUrl('lesson-videos', lesson.videoStoragePath)
        .then((u) => { if (!alive) return; if (u) { setSigned(u); setState('ready'); } else setState('error'); })
        .catch(() => { if (alive) setState('error'); });
    } else {
      setState('ready');
    }
    return () => { alive = false; };
  }, [lesson.videoStoragePath]);
  if (lesson.videoStoragePath) {
    if (state === 'loading') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black text-white/60 text-sm">
          <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          Preparing your video…
        </div>
      );
    }
    if (state === 'error' || !signed) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-300" />
          <div className="font-bold">The video could not load</div>
          <div className="text-sm text-white/50">Your lesson text below is still fully available.</div>
          <button onClick={() => { setState('loading'); signedUrl('lesson-videos', lesson.videoStoragePath).then((u) => { if (u) { setSigned(u); setState('ready'); } else setState('error'); }); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-bold hover:bg-white/10">
            <RefreshCw className="h-3.5 w-3.5" /> RETRY VIDEO
          </button>
        </div>
      );
    }
    return (
      <>
        <video
          src={signed}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full bg-black"
          onLoadedMetadata={(e) => { try { e.target.playbackRate = speed; } catch { /* ignore */ } }}
          onError={() => setState('error')}
          onTimeUpdate={(e) => {
            if (!onVideoProgress) return;
            const now = Date.now();
            if (now - lastReport.current > 15000) { // throttle: one report per 15s
              lastReport.current = now;
              onVideoProgress(e.target.currentTime || 0, e.target.duration || null);
            }
          }}
        />
        <div className="absolute bottom-16 right-3 flex gap-1.5">
          {SPEEDS.map((s) => (
            <button key={s} onClick={() => setSpeed(s)} className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur bg-black/60 border transition ${speed === s ? 'border-cyan-400 text-cyan-300' : 'border-white/20 text-white/70 hover:text-white'}`}>{s}×</button>
          ))}
        </div>
      </>
    );
  }
  return <VideoFacade url={lesson.videoUrl} title={lesson.title} />;
}

// Mobile-safe lesson print → PDF (works on Android/iPhone via the print
// dialog's "Save as PDF"). No third-party PDF library, no keys, no uploads.
function printLessonHtml(course, moduleTitle, lesson) {
  const body = renderLessonMarkdown(lesson.textContent || lesson.content || '');
  const resources = (lesson.resources || []).filter((r) => r.url || r.storagePath).map((r) => `<li>${r.title || 'Resource'}${r.url ? ` — <a href="${r.url}">${r.url}</a>` : ' (course file)'}</li>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${lesson.title} — ${course.title}</title>
<style>
 body{font-family:Georgia,'Times New Roman',serif;color:#111;max-width:720px;margin:32px auto;padding:0 24px;line-height:1.65}
 .brand{display:flex;align-items:center;gap:10px;border-bottom:2px solid #0ea5e9;padding-bottom:12px;margin-bottom:18px}
 .brand b{font-size:17px;letter-spacing:.4px} .brand small{color:#555;letter-spacing:2px;font-size:10px}
 h1{font-size:26px;margin:6px 0} .meta{color:#555;font-size:12px;text-transform:uppercase;letter-spacing:1px}
 h2{font-size:19px;border-bottom:1px solid #ccc;padding-bottom:4px;margin-top:26px}
 h3{font-size:15.5px;margin-top:18px} code{background:#f1f5f9;padding:2px 5px;border-radius:4px;font-size:13px}
 pre{background:#0f172a;color:#e2e8f0;padding:14px;border-radius:8px;overflow:auto;font-size:13px}
 table{width:100%;border-collapse:collapse;font-size:13px} th,td{border:1px solid #cbd5e1;padding:7px 9px;text-align:left}
 img{max-width:100%} blockquote{border-left:3px solid #0ea5e9;margin:12px 0;padding:2px 14px;color:#334155}
 .lesson-callout{border:1px solid #94a3b8;border-radius:6px;padding:8px 12px;margin:10px 0;font-size:14px;background:#f8fafc}
 ul,ol{padding-left:22px} li{margin:3px 0}
 .footer{margin-top:28px;border-top:1px solid #ddd;padding-top:10px;font-size:11px;color:#777}
 @media print{ a{color:#0369a1;text-decoration:none} }
</style></head><body>
<div class="brand">
  <svg width="34" height="34" viewBox="0 0 100 100"><rect x="3" y="3" width="94" height="94" rx="21" fill="#0ea5e9"/><path d="M20 29 L35 71 L50 42 L65 71 L80 29" fill="none" stroke="#fff" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  <div><b>WOLI DAN TECH HUB</b><br/><small>LEARN • BUILD • GROW</small></div>
</div>
<div class="meta">${course.title} • ${moduleTitle || ''}</div>
<h1>${lesson.title}</h1>
${body}
${resources ? `<h2>Lesson Resources</h2><ul>${resources}</ul>` : ''}
<div class="footer">Printed from WOLI DAN TECH HUB — ${new Date().toLocaleString()} • wolidantechhub.netlify.app</div>
</body></html>`;
}

export default function Learn() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const {
    getCourseBySlug, getProgress, markLessonComplete, unmarkLesson, isEnrolled,
    getUserCertificates, ensureCourseDetail, retryCourseDetail, coursesLoading,
    markLessonStarted, reportVideoProgress,
  } = useCourses();
  const { getCourseQuizzes, getCourseAssignments, getUserQuizAverage, countApprovedAssignments, isFinalProjectApproved, completionRules, quizAttempts, submissions, getUpcomingClasses, aiContent, getMyPracticalSubmissions } = useLMS();
  const { user } = useAuth();
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [openModules, setOpenModules] = useState({});
  const [detailError, setDetailError] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [view, setView] = useState('video'); // video | read
  const [certChecked, setCertChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [query, setQuery] = useState(''); // curriculum search

  // Admin preview: admins can walk the exact student classroom before
  // publishing, without needing an enrollment. Backend RLS already lets
  // admins read curriculum, content and videos.
  const isAdmin = user?.role === 'admin';
  const preview = isAdmin && searchParams.get('preview') === '1';

  const course = getCourseBySlug(slug);
  const progress = course && user ? getProgress(user.id, course.id) : { completedLessons: [], progress: 0, lastLessonId: null };

  // Load the real curriculum from Supabase (modules → topics → lessons →
  // content/resources/practicals). Retriable — an empty cache or a failed
  // query must never strand the classroom.
  useEffect(() => {
    if (course && !course.curriculum) ensureCourseDetail(course.id).then((d) => { if (d) setDetailError(''); }).catch((err) => setDetailError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, course?.id]);

  const retryDetail = useCallback(async () => {
    if (!course) return;
    setRetrying(true);
    try { await retryCourseDetail(course.id); setDetailError(''); toast.success('Curriculum reloaded.'); }
    catch (err) { setDetailError(err.message); toast.error(err.message); }
    finally { setRetrying(false); }
  }, [course, retryCourseDetail]);

  const allLessons = useMemo(() => (course?.curriculum || []).flatMap((m) => (m.lessons || []).map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title }))), [course]);
  const totalLessons = allLessons.length;

  const rules = useMemo(() => (course ? getCourseCompletionRules(completionRules, course.id) : null), [course, completionRules]);
  const quizAverage = course && user ? getUserQuizAverage(user.id, course.id) : null;
  const approvedCount = course && user ? countApprovedAssignments(user.id, course.id) : 0;
  const finalApproved = course && user ? isFinalProjectApproved(user.id, course.id) : false;
  const completion = useMemo(() => {
    if (!rules) return null;
    return evaluateCompletion({ rules, lessonsProgressPct: progress.progress, quizAverage, approvedAssignments: approvedCount, finalProjectApproved: finalApproved });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules, progress.progress, quizAverage, approvedCount, finalApproved, quizAttempts.length, submissions.length]);

  const myCert = course && user ? getUserCertificates(user.id).find((c) => c.courseId === course.id && c.status !== 'revoked') : null;

  // Certificates are issued server-side when completion rules are met.
  // Congratulate once the checklist flips to met; the cert arrives via DB.
  useEffect(() => {
    if (!course || !user || !completion?.met || myCert || certChecked) return;
    setCertChecked(true);
    toast.success('🎓 All requirements completed! Your certificate is ready.', { duration: 6000 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completion?.met]);

  useEffect(() => {
    if (!activeLesson && allLessons.length) {
      const lastId = progress.lastLessonId;
      const last = lastId ? allLessons.find((l) => l.id === lastId) : null;
      const nextUncompleted = allLessons.find((l) => !(progress.completedLessons || []).includes(l.id));
      const first = last || nextUncompleted || allLessons[0];
      setActiveLesson(first);
      setActiveModuleId(first.moduleId);
      setOpenModules((prev) => ({ ...prev, [first.moduleId]: true }));
      try { sessionStorage.setItem('wdth_lesson_ctx', JSON.stringify({ courseId: course.id, lessonId: first.id })); } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLessons, activeLesson]);

  // Track "lesson started" the moment a lesson is opened (never completion —
  // completing still requires the explicit MARK AS COMPLETE button + backend).
  useEffect(() => {
    if (course && user && activeLesson && !preview) markLessonStarted(user.id, course.id, activeLesson.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLesson?.id]);

  // ---- states that must not render a broken page ----
  if (!user) return <Navigate to="/login" state={{ from: `/learn/${slug}` }} replace />;
  if (!course) {
    if (coursesLoading) {
      return (
        <div className="min-h-screen bg-[#020a1f] p-6 space-y-4">
          <div className="max-w-[720px] mx-auto pt-10"><Skeleton lines={4} /></div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#020a1f] flex items-center justify-center p-6">
        <div className="max-w-[460px] w-full">
          <ErrorState
            title="This course could not be found"
            message={`No published course matches “${slug}”. It may have been unpublished, or the catalog is still loading. Open the Skills Library and start from there.`}
            className="mb-4"
          />
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={retryDetail} disabled={retrying || !course} className="btn-primary !py-2.5 disabled:opacity-40"><RefreshCw className={`h-4 w-4 mr-2 ${retrying ? 'animate-spin' : ''}`} /> RELOAD CATALOG</button>
            <Link to="/courses" className="btn-secondary !py-2.5">BROWSE COURSES</Link>
          </div>
        </div>
      </div>
    );
  }
  if (!preview && !isEnrolled(user.id, course.id)) return <Navigate to={`/course/${slug}`} replace />;

  const currentIndex = activeLesson ? allLessons.findIndex((l) => l.id === activeLesson.id) : 0;
  const nextLesson = allLessons[currentIndex + 1];
  const prevLesson = allLessons[currentIndex - 1];

  const selectLesson = (lesson, moduleId) => {
    setActiveLesson(lesson);
    setActiveModuleId(moduleId);
    setSidebarOpen(false);
    setView(lesson.type === 'text' && !lesson.videoUrl && !lesson.videoStoragePath ? 'read' : 'video');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try { sessionStorage.setItem('wdth_lesson_ctx', JSON.stringify({ courseId: course.id, lessonId: lesson.id })); } catch { /* ignore */ }
  };

  const scrollToBlock = (id) => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.classList.add('ring-2', 'ring-cyan-400/60'); setTimeout(() => el.classList.remove('ring-2', 'ring-cyan-400/60'), 1600); }
    else toast.info('Nothing here yet for this lesson.');
  };

  // Curriculum search: matches lesson titles, module+topic titles, resources
  // and the full lesson text.
  const q = query.trim().toLowerCase();
  const filteredCurriculum = useMemo(() => {
    const list = course?.curriculum || [];
    if (!q) return list;
    return list
      .map((mod) => ({
        ...mod,
        topics: (mod.topics || []).filter((t) => t.title.toLowerCase().includes(q)),
        lessons: (mod.lessons || []).filter((l) =>
          l.title.toLowerCase().includes(q)
          || mod.title.toLowerCase().includes(q)
          || (l.resources || []).some((r) => (r.title || r.name || '').toLowerCase().includes(q))
          || (l.textContent || l.content || '').toLowerCase().includes(q)),
      }))
      .filter((mod) => mod.lessons.length > 0 || (mod.topics || []).length > 0);
  }, [course, q]);

  const handleComplete = async () => {
    if (!activeLesson) return;
    const isCompleted = (progress.completedLessons || []).includes(activeLesson.id);
    try {
      if (isCompleted) {
        await unmarkLesson(user.id, course.id, activeLesson.id);
        toast.info('Marked as incomplete');
      } else {
        await markLessonComplete(user.id, course.id, activeLesson.id);
        toast.success('Lesson completed! 🎉');
        if (nextLesson) setTimeout(() => selectLesson(nextLesson, nextLesson.moduleId), 600);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePrint = () => {
    if (!activeLesson) return;
    try {
      const w = window.open('', '_blank', 'width=900,height=700');
      if (!w) {
        // Mobile browsers often block popups → fall back to a downloadable file
        downloadAsFile(`${activeLesson.title.replace(/[^\w\- ]+/g, '').trim() || 'lesson'}.html`, printLessonHtml(course, activeModuleTitle, activeLesson), 'text/html');
        toast.info('Downloaded as HTML — open it and use Share/Print → Save as PDF.');
        return;
      }
      w.document.write(printLessonHtml(course, activeModuleTitle, activeLesson));
      w.document.close();
      w.focus();
      setTimeout(() => { try { w.print(); } catch { /* user prints manually */ } }, 400);
    } catch {
      toast.error('Your browser blocked printing — use the browser menu → Print.');
    }
  };

  const toggleModule = (id) => setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));

  const lessonQuizzes = activeLesson ? getCourseQuizzes(course.id).filter((x) => x.lessonId === activeLesson.id || (x.moduleId === activeModuleId && !x.lessonId)) : [];
  const lessonAssignments = activeLesson ? getCourseAssignments(course.id).filter((x) => x.lessonId === activeLesson.id || (x.moduleId === activeModuleId && !x.lessonId)) : [];
  const courseQuizzes = getCourseQuizzes(course.id).filter((x) => !x.moduleId && !x.lessonId);
  const courseAssignments = getCourseAssignments(course.id).filter((x) => !x.moduleId && !x.lessonId);
  const activeModuleTitle = (course.curriculum || []).find((m) => m.id === activeModuleId)?.title;

  // ---------- curriculum sidebar (used by desktop column AND mobile drawer) ----------
  const sidebar = (
    <div className="relative w-[86%] max-w-[360px] lg:w-full lg:max-w-none border-r border-white/[0.06] bg-[#061236] lg:bg-[#061236]/50 backdrop-blur-xl flex flex-col h-full lg:h-screen lg:sticky lg:top-0 lg:overflow-hidden">
      <div className="p-5 border-b border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden h-9 w-9 rounded-full glass flex items-center justify-center" aria-label="Close curriculum"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex items-start gap-3">
          <BrandMark size={34} className="shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h2 className="font-bold leading-tight">{course.title}</h2>
            <div className="mt-2.5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/50">{(progress.completedLessons || []).length} / {totalLessons} lessons</span>
                <span className="font-bold text-cyan-300">{progress.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all" style={{ width: `${progress.progress}%` }} /></div>
            </div>
          </div>
        </div>
        {/* Completion requirements checklist */}
        {completion && (rules.requireQuizAvg > 0 || rules.requireAssignmentsApproved > 0 || rules.requireFinalProject) && (
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
            <div className="text-[11px] font-bold tracking-widest text-white/40 flex items-center gap-1.5 mb-2"><ListChecks className="h-3.5 w-3.5" /> CERTIFICATE REQUIREMENTS</div>
            <div className="space-y-1.5">
              {completion.checks.map((c) => (
                <div key={c.key} className="flex items-center gap-2 text-xs">
                  {c.met ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" /> : <span className="h-3.5 w-3.5 rounded-full border border-white/30 shrink-0" />}
                  <span className={c.met ? 'text-green-300' : 'text-white/60'}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Curriculum search */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, topics, resources…"
            className="w-full h-11 rounded-full bg-white/[0.06] border border-white/10 pl-10 pr-9 text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50"
          />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white" aria-label="Clear search"><X className="h-4 w-4" /></button>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {detailError && (
          <ErrorState
            title="The curriculum could not be loaded"
            message={detailError}
            onRetry={retryDetail}
            className="!p-4"
          />
        )}
        {!course.curriculum && !detailError && <div className="p-2"><Skeleton lines={5} /></div>}
        {course.curriculum && totalLessons === 0 && !detailError && (
          <div className="m-2 rounded-xl border border-dashed border-white/15 p-5 text-center">
            <Layers className="h-7 w-7 mx-auto text-white/25 mb-2" />
            <div className="text-sm font-bold text-white/80">No curriculum is available for this course yet.</div>
            <div className="text-xs text-white/45 mt-1.5 leading-relaxed">
              Your enrollment is active — instructors are publishing lessons. {isAdmin ? 'Add modules & lessons in Admin → Courses, then run migrations 001-009 + the curriculum seed.' : 'You will be notified when it is ready.'}
            </div>
            <button onClick={retryDetail} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass text-xs font-bold hover:bg-white/10">
              <RefreshCw className={`h-3.5 w-3.5 ${retrying ? 'animate-spin' : ''}`} /> CHECK AGAIN
            </button>
          </div>
        )}
        {q && filteredCurriculum.length === 0 && course.curriculum && totalLessons > 0 && (
          <div className="text-xs text-white/40 p-3 text-center">No lessons match “{query}”.</div>
        )}
        {filteredCurriculum.map((mod) => (
          <div key={mod.id} className="rounded-2xl overflow-hidden border border-white/5">
            <button onClick={() => toggleModule(mod.id)} className="w-full flex items-center justify-between gap-2 p-4 bg-white/[0.03] hover:bg-white/[0.05] transition text-left">
              <div className="min-w-0">
                <div className="font-bold text-sm leading-snug">{mod.title}</div>
                <div className="text-[11px] text-white/40">
                  {(mod.lessons || []).filter((l) => (progress.completedLessons || []).includes(l.id)).length}/{(mod.lessons || []).length} completed
                  {(mod.topicsWithLessons?.length || mod.topics?.length) ? ` • ${((mod.topicsWithLessons || mod.topics) || []).length} topics` : ''}
                </div>
              </div>
              {openModules[mod.id] ? <ChevronUp className="h-4 w-4 text-white/40 shrink-0" /> : <ChevronDown className="h-4 w-4 text-white/40 shrink-0" />}
            </button>
            {(openModules[mod.id] || !!q) && (
              <div className="divide-y divide-white/[0.04] bg-[#020a1f]/50">
                {(mod.topicsWithLessons || []).length > 0 ? (
                  (mod.topicsWithLessons || []).map((topic) => (
                    <div key={topic.id}>
                      <div className="px-4 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300/70">{topic.title}</div>
                      {topic.lessons.map((lesson) => <LessonRow key={lesson.id} lesson={lesson} mod={mod} />)}
                    </div>
                  ))
                ) : (mod.lessons || []).map((lesson) => <LessonRow key={lesson.id} lesson={lesson} mod={mod} />)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  function LessonRow({ lesson, mod }) {
    const isActive = activeLesson?.id === lesson.id;
    const isDone = (progress.completedLessons || []).includes(lesson.id);
    const hasQuiz = getCourseQuizzes(course.id).some((qz) => qz.lessonId === lesson.id);
    const hasTask = getCourseAssignments(course.id).some((a) => a.lessonId === lesson.id);
    const hasPractical = !!lesson.practical || lesson.type === 'practical';
    const { Icon: TypeIcon } = lessonType(lesson);
    return (
      <button onClick={() => selectLesson(lesson, mod.id)} className={`w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.04] transition ${isActive ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : 'border-l-2 border-transparent'}`}>
        <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-cyan-400 text-black' : 'glass'}`}>
          {isDone ? <CheckCircle2 className="h-4 w-4" /> : <TypeIcon className="h-3.5 w-3.5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-[13px] font-medium leading-snug ${isActive ? 'text-cyan-300' : ''}`}>{lesson.title}</div>
          <div className="text-[11px] text-white/40 flex items-center gap-1.5 flex-wrap">
            {lesson.duration && <span>{lesson.duration}</span>}
            <span className={`uppercase tracking-wider text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.06] ${lesson.type === 'project' ? 'text-amber-300' : ''}`}>{lessonType(lesson).label.split(' ')[0]}</span>
            {(lesson.videoUrl || lesson.videoStoragePath) && <span className="inline-flex items-center gap-0.5" title="Video"><Video className="h-3 w-3" /></span>}
            {(lesson.textContent || lesson.content) && <span className="inline-flex items-center gap-0.5" title="Written lesson"><FileText className="h-3 w-3" /></span>}
            {(lesson.resources || []).length > 0 && <span className="inline-flex items-center gap-0.5" title="Resources"><BookOpen className="h-3 w-3" /></span>}
            {hasPractical && <span className="inline-flex items-center gap-0.5 text-orange-300" title="Practical"><Wrench className="h-3 w-3" /></span>}
            {hasQuiz && <span className="inline-flex items-center gap-0.5 text-purple-300" title="Quiz"><HelpCircle className="h-3 w-3" /></span>}
            {hasTask && <span className="inline-flex items-center gap-0.5 text-amber-300" title="Assignment"><PenLine className="h-3 w-3" /></span>}
          </div>
        </div>
      </button>
    );
  }

  const pctBar = (
    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all" style={{ width: `${progress.progress}%` }} />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020a1f]">
      <Toaster richColors />
      {/* Sidebar — sticky column on desktop, slide-over drawer on mobile */}
      <div className={`${sidebarOpen ? 'fixed inset-0 z-[70] flex' : 'hidden'} lg:static lg:flex lg:w-[360px] lg:shrink-0`}>
        {sidebarOpen && <button aria-label="Close curriculum" onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-black/70 lg:hidden" />}
        {sidebar}
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Mobile top bar: course + progress + curriculum button (spec 17) */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#020a1f]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 pt-[max(10px,env(safe-area-inset-top))] pb-2.5">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black tracking-[0.18em] text-cyan-300/80">WOLI DAN TECH HUB</div>
              <div className="font-bold text-sm leading-tight truncate">{course.title}</div>
            </div>
            <span className="text-xs font-black text-cyan-300 shrink-0">{progress.progress}%</span>
            <button
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-cyan-400 text-black text-xs font-black"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-3.5 w-3.5" /> CURRICULUM <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-2">{pctBar}</div>
        </div>

        {/* Admin preview bar */}
        {preview && (
          <div className="sticky lg:top-0 top-[104px] z-20 bg-gradient-to-r from-purple-600 to-indigo-600 px-4 md:px-6 py-2.5 flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="uppercase tracking-widest">👁 Admin Preview — exactly what students see</span>
            {(() => {
              const courseAI = aiContent.filter((c) => c.targetCourseId === course.id);
              if (!courseAI.length) return <span className="text-white/70 font-medium normal-case">No AI-generated content for this course.</span>;
              const byStatus = {};
              courseAI.forEach((c) => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });
              return <span className="font-medium normal-case">AI content: {Object.entries(byStatus).map(([s, n]) => `${n} ${s}`).join(' · ')} — students only see approved/published</span>;
            })()}
            <span className="ml-auto flex gap-2">
              <span className="px-3 py-1 rounded-full bg-white text-purple-700">STUDENT VIEW</span>
              <Link to="/admin/dashboard" className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30">ADMIN EDIT VIEW</Link>
              <Link to={`/course/${slug}`} className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30">EXIT PREVIEW</Link>
            </span>
          </div>
        )}

        {/* Desktop curriculum toggle when drawer closed on wide-but-not-lg? (lg handles) */}
        {totalLessons === 0 && !detailError && course.curriculum && (
          <div className="max-w-[720px] mx-auto p-6">
            <ErrorState
              title="No curriculum is available for this course yet."
              message={isAdmin
                ? 'Publish modules and lessons in Admin → Courses. (If a fresh backend: run supabase/migrations/009 + the seed, then reload.)'
                : 'Your enrollment is active. The academy is still publishing lessons for this course — everything you complete later counts toward the same progress bar.'}
              onRetry={retryDetail}
            />
          </div>
        )}
        {detailError && !allLessons.length && (
          <div className="max-w-[720px] mx-auto p-6">
            <ErrorState title="The classroom could not load" message={detailError} onRetry={retryDetail} />
          </div>
        )}

        {activeLesson ? (
          <div className="max-w-[960px] mx-auto pb-24 lg:pb-16">
            {/* Tabs */}
            <div className="sticky lg:top-0 top-[104px] z-10 bg-[#020a1f]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 md:px-8 pt-3">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                <button onClick={() => setView('video')} className={`whitespace-nowrap px-4 py-2.5 rounded-t-2xl font-bold text-[13px] flex items-center gap-2 ${view === 'video' ? 'bg-white/[0.06] text-cyan-300' : 'text-white/50 hover:text-white'}`}>
                  <Video className="h-4 w-4" /> VIDEO
                </button>
                <button onClick={() => setView('read')} className={`whitespace-nowrap px-4 py-2.5 rounded-t-2xl font-bold text-[13px] flex items-center gap-2 ${view === 'read' ? 'bg-white/[0.06] text-cyan-300' : 'text-white/50 hover:text-white'}`}>
                  <BookOpen className="h-4 w-4" /> READ LESSON
                </button>
                {(activeLesson.practical || activeLesson.type === 'practical') && (
                  <button onClick={() => scrollToBlock('practical-section')} className="whitespace-nowrap px-4 py-2.5 rounded-t-2xl font-bold text-[13px] flex items-center gap-2 text-white/50 hover:text-white">
                    <Wrench className="h-4 w-4" /> PRACTICAL
                  </button>
                )}
                {lessonQuizzes.length > 0 && (
                  <button onClick={() => scrollToBlock('quiz-section')} className="whitespace-nowrap px-4 py-2.5 rounded-t-2xl font-bold text-[13px] flex items-center gap-2 text-white/50 hover:text-white">
                    <HelpCircle className="h-4 w-4" /> QUIZ
                  </button>
                )}
                {lessonAssignments.length > 0 && (
                  <button onClick={() => scrollToBlock('assignment-section')} className="whitespace-nowrap px-4 py-2.5 rounded-t-2xl font-bold text-[13px] flex items-center gap-2 text-white/50 hover:text-white">
                    <PenLine className="h-4 w-4" /> ASSIGNMENT
                  </button>
                )}
              </div>
            </div>

            {view === 'video' ? (
              <>
                <div className="bg-black aspect-video relative overflow-hidden">
                  <LessonVideo
                    lesson={activeLesson}
                    onVideoProgress={user && !preview ? (secs, dur) => reportVideoProgress(user.id, course.id, activeLesson.id, secs, dur) : null}
                  />
                </div>
                {/* Study panel under the video: objectives + key points, so the
                    lesson is complete even before opening the full text. */}
                {(extractSection(activeLesson.textContent || activeLesson.content, 'learn').length > 0
                  || extractSection(activeLesson.textContent || activeLesson.content, 'Checklist').length > 0) && (
                  <div className="px-4 md:px-8 pt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {extractSection(activeLesson.textContent || activeLesson.content, 'learn').length > 0 && (
                        <div className="glass rounded-2xl p-5">
                          <div className="text-[11px] font-bold tracking-widest text-cyan-300 mb-2.5">🎯 LEARNING OBJECTIVES</div>
                          <ul className="space-y-1.5">
                            {extractSection(activeLesson.textContent || activeLesson.content, 'learn').map((o, i) => (
                              <li key={i} className="text-sm text-white/75 flex gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" /> {o}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {extractSection(activeLesson.textContent || activeLesson.content, 'Checklist').length > 0 && (
                        <div className="glass rounded-2xl p-5">
                          <div className="text-[11px] font-bold tracking-widest text-green-300 mb-2.5">✅ KEY CHECKPOINTS</div>
                          <ul className="space-y-1.5">
                            {extractSection(activeLesson.textContent || activeLesson.content, 'Checklist').map((o, i) => (
                              <li key={i} className="text-sm text-white/75 flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" /> {o}</li>
                            ))}
                          </ul>
                          <button onClick={() => setView('read')} className="mt-3 text-xs font-bold text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Read the full lesson →</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 md:px-8 pt-6">
                <div className="glass rounded-2xl p-5 md:p-8">
                  {(activeLesson.textContent || activeLesson.content) ? (
                    <div className="lesson-body" dangerouslySetInnerHTML={{ __html: renderLessonMarkdown(activeLesson.textContent || activeLesson.content) }} />
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-white/20 mb-3" />
                      <div className="font-bold">Text version coming soon</div>
                      <p className="text-sm text-white/50 mt-2 max-w-[420px] mx-auto">Watch the video lesson. A full written guide for “{activeLesson.title}” will be available here shortly.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 md:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Link to={`/course/${slug}`} className="text-[11px] text-white/40 hover:text-white font-bold tracking-wide">← BACK TO COURSE</Link>
                    <span className="text-white/20">/</span>
                    <button onClick={() => { setOpenModules((prev) => ({ ...prev, [activeModuleId]: true })); setSidebarOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-[11px] text-white/40 hover:text-white font-bold tracking-wide text-left">BACK TO MODULE</button>
                  </div>
                  <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full glass text-[11px] font-bold tracking-widest mb-3">
                    {(() => { const { Icon: TIcon, label } = lessonType(activeLesson); return (<><TIcon className="h-3.5 w-3.5 text-cyan-300" /> <span className="text-cyan-300">{label}</span></>); })()}
                    {activeModuleTitle && <><span className="text-white/30">•</span> <span className="uppercase">{activeModuleTitle}</span></>}
                    {activeLesson.duration && <><span className="text-white/30">•</span> {activeLesson.duration}</>}
                  </div>
                  <h1 className="font-display font-bold text-[24px] md:text-[28px] leading-tight">{activeLesson.title}</h1>
                  {activeLesson.description && <p className="text-sm text-white/55 mt-2 max-w-[640px] leading-relaxed">{activeLesson.description}</p>}
                  <div className="mt-2 text-sm text-white/50">Lesson {currentIndex + 1} of {totalLessons}</div>
                </div>
                <div className="flex flex-col items-stretch lg:items-end gap-2 w-full lg:w-auto">
                  <button onClick={handleComplete} className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition ${(progress.completedLessons || []).includes(activeLesson.id) ? 'bg-green-500 text-white' : 'btn-primary'}`}>
                    <CheckCircle2 className="h-4 w-4" /> {(progress.completedLessons || []).includes(activeLesson.id) ? 'COMPLETED' : 'MARK AS COMPLETE'}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={handlePrint} className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full glass text-xs font-bold text-white/70 hover:bg-white/10 transition" title="Print or save the lesson as PDF">
                      <Printer className="h-3.5 w-3.5" /> PDF
                    </button>
                    {!isAdmin && (
                      <button onClick={() => window.dispatchEvent(new CustomEvent('wdth_open_dantech', { detail: { prompt: `Explain this lesson in simple terms: ${activeLesson.title}`, lessonId: activeLesson.id } }))} className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full glass text-xs font-bold text-purple-300 hover:bg-white/10 transition">
                        <Sparkles className="h-3.5 w-3.5" /> Ask DanTECH AI
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sub-lessons checklist */}
              {activeLesson.subLessons?.length > 0 && (
                <div className="glass rounded-2xl p-6 space-y-3">
                  <h3 className="font-bold flex items-center gap-2"><ListChecks className="h-4 w-4 text-green-300" /> In This Lesson ({activeLesson.subLessons.length} topics)</h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {activeLesson.subLessons.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 text-sm text-white/75 bg-white/[0.03] rounded-xl px-3 py-2.5">
                        <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" /> {s.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRACTICAL — spec 8 */}
              <div id="practical-section" className="scroll-mt-40">
                {activeLesson.practical ? (
                  <PracticalPanel practical={activeLesson.practical} user={user} courseId={course.id} lessonId={activeLesson.id} />
                ) : activeLesson.type === 'practical' ? (
                  <div className="glass rounded-2xl p-6 flex flex-wrap items-center gap-4">
                    <Wrench className="h-8 w-8 text-orange-300 shrink-0" />
                    <div className="flex-1 min-w-[220px]">
                      <div className="font-bold">Practical activity</div>
                      <p className="text-sm text-white/55 mt-1">The practical brief for this lesson will be published soon. Follow the “✍️ Practical” steps inside the lesson text — and check back for the submission area.</p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* RESOURCES — real files + curated links (spec 7) */}
              <div id="resources-section" className="scroll-mt-40 space-y-3">
                <h3 className="font-bold flex items-center gap-2 text-lg"><BookOpen className="h-5 w-5 text-cyan-300" /> Lesson Resources</h3>
                <ResourceList resources={activeLesson.resources || []} />
              </div>

              {/* Upcoming live class */}
              {getUpcomingClasses([course.id]).slice(0, 1).map((lc) => (
                <div key={lc.id} className="rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-black tracking-widest text-red-300 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" /> LIVE CLASS</div>
                    <div className="font-bold mt-1">{lc.title}</div>
                    <div className="text-xs text-white/60">{lc.date} • {lc.time} ({lc.duration} mins) • {lc.platform}</div>
                  </div>
                  <a href={lc.meetingLink} target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-full bg-red-500 text-white font-bold text-xs hover:bg-red-400">JOIN CLASS 🔴</a>
                </div>
              ))}

              {/* Quizzes */}
              <div id="quiz-section" className="scroll-mt-40 space-y-6">
                {lessonQuizzes.map((quiz) => (
                  <div key={quiz.id} className="glass rounded-2xl p-5 md:p-6 space-y-4">
                    <h3 className="font-bold flex items-center gap-2"><HelpCircle className="h-4 w-4 text-purple-300" /> Quiz: {quiz.title}</h3>
                    <QuizTaker quiz={quiz} userId={user.id} />
                  </div>
                ))}
              </div>

              {/* Assignments */}
              <div id="assignment-section" className="scroll-mt-40 space-y-6">
                {lessonAssignments.map((a) => (
                  <div key={a.id} className="glass rounded-2xl p-5 md:p-6">
                    <AssignmentPanel assignment={a} user={user} />
                  </div>
                ))}
              </div>

              {/* Course-level quizzes & final */}
              {currentIndex === totalLessons - 1 && (courseQuizzes.length > 0 || courseAssignments.length > 0) && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-gradient-to-br from-purple-500/15 to-indigo-600/15 border border-purple-500/30 p-6">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Award className="h-5 w-5 text-purple-300" /> Final Assessment</h3>
                    <p className="text-sm text-white/60 mt-1">Complete these to unlock your certificate.</p>
                  </div>
                  {courseQuizzes.map((quiz) => (
                    <div key={quiz.id} className="glass rounded-2xl p-5 md:p-6 space-y-4">
                      <h3 className="font-bold flex items-center gap-2"><HelpCircle className="h-4 w-4 text-purple-300" /> {quiz.isFinal ? 'FINAL EXAM: ' : ''}{quiz.title}</h3>
                      <QuizTaker quiz={quiz} userId={user.id} />
                    </div>
                  ))}
                  {courseAssignments.map((a) => (
                    <div key={a.id} className="glass rounded-2xl p-5 md:p-6">
                      <AssignmentPanel assignment={a} user={user} />
                    </div>
                  ))}
                </div>
              )}

              {/* Certificate CTA */}
              {completion?.met && (
                <div className="rounded-2xl bg-gradient-to-br from-green-500/15 to-emerald-600/15 border border-green-500/30 p-6 text-center">
                  <Award className="h-10 w-10 mx-auto text-green-300 mb-2" />
                  <div className="font-black text-xl">All Requirements Completed! 🎓</div>
                  <p className="text-sm text-white/60 mt-1">Your WOLI DAN TECH HUB certificate is ready{myCert ? ' and verified.' : ' — it is issued automatically by the academy.'}</p>
                  <Link to="/certificates" className="inline-flex mt-4 px-6 py-3 rounded-full bg-green-500 text-white font-bold text-sm">VIEW & DOWNLOAD CERTIFICATE</Link>
                </div>
              )}

              {/* Lesson Q&A */}
              <Discussions courseId={course.id} lessonId={activeLesson.id} user={user} title={`Q&A — ${activeLesson.title.slice(0, 40)}`} />

              {/* Prev / Next */}
              <div className="flex justify-between gap-4">
                <button disabled={!prevLesson} onClick={() => prevLesson && selectLesson(prevLesson, prevLesson.moduleId)} className="px-6 py-3 rounded-full glass font-bold text-sm disabled:opacity-30 hover:bg-white/10 transition">← Previous</button>
                {nextLesson ? (
                  <button onClick={() => selectLesson(nextLesson, nextLesson.moduleId)} className="px-6 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90 transition">Next →</button>
                ) : (
                  <Link to="/certificates" className="px-6 py-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 text-white font-bold text-sm">View Certificate 🎓</Link>
                )}
              </div>
            </div>
          </div>
        ) : totalLessons > 0 ? (
          <div className="p-12 text-center text-white/40">
            <Layers className="h-10 w-10 mx-auto mb-3 text-white/20" />
            Select a lesson from the curriculum to start learning.
          </div>
        ) : null}
      </div>
    </div>
  );
}
