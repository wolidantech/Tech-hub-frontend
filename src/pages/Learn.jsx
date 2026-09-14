import LessonBody from '../components/learn/LessonBody';
import LessonResources from '../components/learn/LessonResources';
import CourseAssessments from '../components/learn/CourseAssessments';
import { useParams, useSearchParams, Navigate, Link } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Play, CheckCircle2, BookOpen, ArrowLeft, FileText, Download, ChevronDown, ChevronUp, Video, HelpCircle, PenLine, Award, ListChecks, Search, Menu, X, Sparkles, Wrench, FolderDown, Rocket, ExternalLink, GraduationCap } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import { useAuth } from '../context/AuthContext';
import QuizTaker from '../components/learn/QuizTaker';
import AssignmentPanel from '../components/learn/AssignmentPanel';
import Discussions from '../components/learn/Discussions';
import { evaluateCompletion, getCourseCompletionRules } from '../lib/lms';
import { signedUrl } from '../lib/supabase';
import { toast, Toaster } from 'sonner';

function youtubeId(url = '') {
  const m = String(url).match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : null;
}

// ---------- Lesson type presentation ----------
const LESSON_TYPES = {
  video: { label: 'VIDEO LESSON', Icon: Video },
  text: { label: 'READING LESSON', Icon: BookOpen },
  practical: { label: 'PRACTICAL LESSON', Icon: Wrench },
  quiz: { label: 'QUIZ', Icon: HelpCircle },
  assignment: { label: 'ASSIGNMENT', Icon: PenLine },
  project: { label: 'FINAL PROJECT', Icon: Rocket },
  resource: { label: 'RESOURCES', Icon: FolderDown },
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
  const yid = youtubeId(url);
  if (!url) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0a1a4a] to-[#020a1f] p-4 sm:p-8">
        <div className="text-center">
          <Video className="h-12 w-12 mx-auto text-white/20 mb-3" />
          <div className="font-bold">No video attached</div>
          <div className="text-sm text-white/50 mt-1">Read the lesson below to continue learning.</div>
        </div>
      </div>
    );
  }
  if (loaded) {
    return <iframe src={yid ? `https://www.youtube-nocookie.com/embed/${yid}` : url} className="absolute inset-0 w-full h-full" allowFullScreen title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />;
  }
  return (
    <button type="button" aria-label={`Play ${title}`} onClick={() => setLoaded(true)} className="absolute inset-0 group w-full h-full text-left">
      {yid ? (
        <img src={`https://i.ytimg.com/vi/${yid}/hqdefault.jpg`} alt={title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a4a] to-[#020a1f]" />
      )}
      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition shadow-2xl">
          <Play className="h-8 w-8 text-black ml-1" />
        </div>
        <div className="text-sm font-bold text-white/90">▶ PLAY LESSON VIDEO</div>
        <div className="text-[11px] text-white/50">Video loads only when you press play (saves data)</div>
      </div>
    </button>
  );
}

const SPEEDS = [1, 1.25, 1.5, 2];
function LessonVideo({ lesson, onVideoProgress }) {
  const [signed, setSigned] = useState(null);
  const [videoError, setVideoError] = useState('');
  const [videoRetry, setVideoRetry] = useState(0);
  const [speed, setSpeed] = useState(1);
  const lastReport = useRef(0);
  useEffect(() => {
    let alive = true;
    setSigned(null);
    setVideoError('');
    if (lesson.videoStoragePath) {
      signedUrl('lesson-videos', lesson.videoStoragePath)
        .then((u) => {
          if (!alive) return;
          if (u) setSigned(u);
          else setVideoError('The private video link could not be created. Check your enrollment and try again.');
        })
        .catch(err => { if (alive) setVideoError(err.message || 'The video could not be loaded.'); });
    }
    return () => { alive = false; };
  }, [lesson.videoStoragePath, videoRetry]);
  if (videoError) return <div role="alert" className="absolute inset-0 grid place-content-center gap-3 p-4 text-center text-sm">{videoError}<button className="min-h-11 rounded-full glass px-5 font-bold" onClick={() => { setVideoError(''); setVideoRetry(n => n + 1); }}>Retry video</button></div>;
  if (lesson.videoStoragePath || /\.(mp4|webm|mov)(\?|$)/i.test(lesson.videoUrl || '')) {
    if (lesson.videoStoragePath && !signed) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        </div>
      );
    }
    return (
      <>
        <video
          src={signed || lesson.videoUrl}
          key={videoRetry}
          onError={() => setVideoError('Video could not be loaded. Check your connection or contact support.')}
          preload="metadata"
          controls
          playsInline
          ref={node => { if (node) node.playbackRate = speed; }}
          className="absolute inset-0 w-full h-full bg-black"
          onLoadedMetadata={(e) => { try { e.target.playbackRate = speed; } catch { /* ignore */ } }}
          onTimeUpdate={(e) => {
            if (!onVideoProgress) return;
            const now = Date.now();
            if (now - lastReport.current > 15000) { // throttle: one report per 15s
              lastReport.current = now;
              onVideoProgress(e.target.currentTime || 0, e.target.duration || null);
            }
          }}
        />
        <div className="absolute bottom-14 right-2 sm:right-3 flex gap-1">
          {SPEEDS.map((s) => (
            <button key={s} aria-label={`Set playback speed to ${s} times`} onClick={() => setSpeed(s)} className={`min-h-11 min-w-11 px-2 rounded-full text-[11px] font-bold backdrop-blur bg-black/70 border transition ${speed === s ? 'border-cyan-400 text-cyan-300' : 'border-white/20 text-white/70 hover:text-white'}`}>{s}×</button>
          ))}
        </div>
      </>
    );
  }
  return <VideoFacade url={lesson.videoUrl} title={lesson.title} />;
}

export default function Learn() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { coursesLoading, coursesError, dataLoading, dataError, refreshMine, refreshCourses, accessKey, getCourseBySlug, getProgress, markLessonComplete, unmarkLesson, isEnrolled, getUserCertificates, ensureCourseDetail, markLessonStarted, reportVideoProgress } = useCourses();
  const { refreshCourseAssessments, getCourseQuizzes, getCourseAssignments, getUserQuizAverage, countApprovedAssignments, isFinalProjectApproved, completionRules, quizAttempts, submissions, getUpcomingClasses, aiContent } = useLMS();
  const { user } = useAuth();
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [openModules, setOpenModules] = useState({});
  const [detailError, setDetailError] = useState('');
  const [view, setView] = useState('read');
  const [detailLoading, setDetailLoading] = useState(true);
  const [retry, setRetry] = useState(0); // video | read
  const [certChecked, setCertChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [savingProgress, setSavingProgress] = useState(false);
  const [query, setQuery] = useState(''); // curriculum search

  // Admin preview: admins can walk the exact student classroom before
  // publishing, without needing an enrollment. Backend RLS already lets
  // admins read curriculum, content and videos.
  const isAdmin = user?.role === 'admin';
  const preview = isAdmin && searchParams.get('preview') === '1';

  const course = getCourseBySlug(slug);
  const progress = course && user ? getProgress(user.id, course.id) : { completedLessons: [], progress: 0, lastLessonId: null };

  useEffect(() => {
    let alive = true;
    setActiveLesson(null);
    setCertChecked(false);
    setDetailError('');
    setDetailLoading(true);
    if (course?.id && !dataLoading) Promise.all([ensureCourseDetail(course.id), refreshCourseAssessments(course.id)])
      .catch(err => { if (alive) setDetailError(err.message); })
      .finally(() => { if (alive) setDetailLoading(false); });
    return () => { alive = false; };
  }, [course?.id, accessKey, dataLoading, retry, ensureCourseDetail, refreshCourseAssessments]);

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
    if (!myCert || certChecked) return;
    setCertChecked(true);
    toast.success('🎓 All requirements completed! Your certificate is ready.', { duration: 6000 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myCert?.id]);

  useEffect(() => {
    if (!detailLoading && !activeLesson && allLessons.length) {
      const lastId = progress.lastLessonId;
      const last = lastId ? allLessons.find((l) => l.id === lastId) : null;
      const nextUncompleted = allLessons.find((l) => !(progress.completedLessons || []).includes(l.id));
      const first = last || nextUncompleted || allLessons[0];
      setActiveLesson(first);
      setView(first.videoUrl || first.videoStoragePath ? 'video' : 'read');
      setActiveModuleId(first.moduleId);
      setOpenModules((prev) => ({ ...prev, [first.moduleId]: true }));
      try { sessionStorage.setItem('wdth_lesson_ctx', JSON.stringify({ courseId: course.id, lessonId: first.id })); } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLessons, activeLesson, detailLoading]);

  // Track "lesson started" the moment a lesson is opened (never completion —
  // completing still requires the explicit MARK AS COMPLETE button + backend).
  useEffect(() => {
    if (course && user && activeLesson && !preview) Promise.resolve(markLessonStarted(user.id, course.id, activeLesson.id)).catch(err => toast.error(err.message || 'Could not save lesson activity.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLesson?.id]);

  const currentIndex = activeLesson ? allLessons.findIndex((l) => l.id === activeLesson.id) : 0;
  const nextLesson = allLessons[currentIndex + 1];
  const prevLesson = allLessons[currentIndex - 1];

  const selectLesson = (lesson, moduleId) => {
    setActiveLesson(lesson);
    setActiveModuleId(moduleId);
    setSidebarOpen(false);
    setView(!lesson.videoUrl && !lesson.videoStoragePath ? 'read' : 'video');
    // Publish context for DanTECH AI
    try { sessionStorage.setItem('wdth_lesson_ctx', JSON.stringify({ courseId: course.id, lessonId: lesson.id })); } catch { /* ignore */ }
  };

  // Curriculum search: matches lesson titles, module titles and resource names.
  const q = query.trim().toLowerCase();
  const filteredCurriculum = useMemo(() => {
    const list = course?.curriculum || [];
    if (!q) return list;
    return list
      .map((mod) => ({
        ...mod,
        lessons: (mod.lessons || []).filter((l) =>
          l.title.toLowerCase().includes(q)
          || mod.title.toLowerCase().includes(q)
          || (l.resources || []).some((r) => (r.title || r.name || '').toLowerCase().includes(q))
          || (l.textContent || l.content || '').toLowerCase().includes(q)),
      }))
      .filter((mod) => mod.lessons.length > 0);
  }, [course, q]);

  if (coursesLoading || dataLoading) return <div role="status" className="min-h-[60vh] grid place-content-center p-6 text-center text-white/60">Loading course and enrollment…</div>;
  if (coursesError || dataError) return <div role="alert" className="min-h-[60vh] grid place-content-center gap-4 p-6 text-center"><p>{coursesError || dataError}</p><button className="btn-primary min-h-11 mx-auto" onClick={() => { refreshCourses(); refreshMine(); }}>Try again</button></div>;
  if (!course) return <div className="min-h-[60vh] grid place-content-center gap-4 p-6 text-center"><p>Course not found.</p><Link className="btn-secondary min-h-11" to="/courses">Browse courses</Link></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!preview && !isEnrolled(user.id, course.id)) return <Navigate to={`/course/${slug}`} replace />;
  if (detailLoading) return <div role="status" className="min-h-[60vh] grid place-content-center p-6 text-center text-white/60">Loading modules, lessons and resources…</div>;
  if (detailError) return <div role="alert" className="min-h-[60vh] grid place-content-center gap-4 p-6 text-center"><p>Couldn't load curriculum: {detailError}</p><button className="btn-primary min-h-11 mx-auto" onClick={() => setRetry(n => n + 1)}>Retry curriculum</button></div>;
  if (!allLessons.length) return <div className="min-h-[60vh] grid place-content-center gap-4 p-6 text-center"><div><BookOpen className="mx-auto mb-3 h-10 w-10 text-white/30" /><p className="font-bold">No curriculum is available for this course yet.</p><p className="mt-2 text-sm text-white/50">If lessons were just added, refresh the database-backed curriculum.</p></div><div className="flex flex-wrap justify-center gap-3"><button className="btn-primary min-h-11" onClick={() => setRetry(n => n + 1)}>Refresh curriculum</button><Link className="btn-secondary min-h-11" to={`/course/${slug}`}>Back to course</Link></div></div>;

  const handleComplete = async () => {
    if (!activeLesson || savingProgress || preview) return;
    setSavingProgress(true);
    const isCompleted = (progress.completedLessons || []).includes(activeLesson.id);
    try {
      if (isCompleted) {
        await unmarkLesson(user.id, course.id, activeLesson.id);
        toast.info('Marked as incomplete');
      } else {
        await markLessonComplete(user.id, course.id, activeLesson.id);
        toast.success('Lesson completed! 🎉');
        if (nextLesson) {
          selectLesson(nextLesson, nextLesson.moduleId);
        }
      }
    } catch (err) {
      toast.error(err.message);
    } finally { setSavingProgress(false); }
  };

  const toggleModule = (id) => setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));

  const lessonQuizzes = activeLesson ? getCourseQuizzes(course.id).filter((q) => q.lessonId === activeLesson.id) : [];
  const lessonAssignments = activeLesson ? getCourseAssignments(course.id).filter((a) => a.lessonId === activeLesson.id) : [];

  return (
    <div className="classroom-shell min-h-screen max-w-full overflow-x-clip flex flex-col lg:flex-row bg-[#020a1f] pb-[max(1rem,env(safe-area-inset-bottom))] lg:pb-0">
      <Toaster richColors />
      {/* Sidebar — sticky column on desktop, slide-over drawer on mobile */}
      <div className={`${sidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} lg:static lg:flex lg:w-[360px] lg:shrink-0`}>
        {sidebarOpen && <button aria-label="Close curriculum" onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-black/70 lg:hidden" />}
        <aside aria-label="Course curriculum" className="relative w-[min(90%,360px)] max-w-full lg:w-full lg:max-w-none border-r border-white/[0.06] bg-[#061236] lg:bg-[#061236]/50 backdrop-blur-xl flex flex-col h-[100dvh] lg:h-screen lg:sticky lg:top-0 lg:overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 space-y-4">
          <div className="mx-auto h-1 w-10 rounded-full bg-white/20 lg:hidden" aria-hidden="true" />
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="inline-flex min-h-11 items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link>
            <button aria-label="Close curriculum panel" onClick={() => setSidebarOpen(false)} className="lg:hidden h-11 w-11 rounded-full glass flex items-center justify-center"><X className="h-4 w-4" /></button>
          </div>
          <div>
            <h2 className="font-bold leading-tight">{course.title}</h2>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5"><span className="text-white/50">{(progress.completedLessons || []).length} / {totalLessons} completed</span><span className="font-bold text-cyan-300">{progress.progress}%</span></div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all" style={{ width: `${progress.progress}%` }} /></div>
            </div>
            {/* Completion requirements checklist */}
            {completion && (rules.requireQuizAvg > 0 || rules.requireAssignmentsApproved > 0 || rules.requireFinalProject) && (
              <div className="mt-3 rounded-xl bg-white/[0.03] border border-white/10 p-3">
                <div className="text-[11px] font-bold tracking-widest text-white/40 flex items-center gap-1.5 mb-2"><ListChecks className="h-3.5 w-3.5" /> CERTIFICATE REQUIREMENTS</div>
                <div className="space-y-1.5">
                  {completion.checks.map((c) => (
                    <div key={c.key} className="flex items-center gap-2 text-xs">
                      {c.met ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <div className="h-3.5 w-3.5 rounded-full border border-white/30 ml-0.5" style={{ width: 14, height: 14 }} />}
                      <span className={c.met ? 'text-green-300' : 'text-white/60'}>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Curriculum search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lessons, topics, resources…"
              className="w-full h-11 rounded-full bg-white/[0.06] border border-white/10 pl-10 pr-12 text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50"
            />
            {query && <button aria-label="Clear curriculum search" onClick={() => setQuery('')} className="absolute right-0 top-1/2 h-11 w-11 -translate-y-1/2 grid place-content-center text-white/40 hover:text-white"><X className="h-4 w-4" /></button>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {detailError && <div className="text-xs text-red-300 p-2">Couldn't load lessons: {detailError}</div>}
          {!course.curriculum && !detailError && <div className="text-xs text-white/40 p-2">Loading lessons…</div>}
          {q && filteredCurriculum.length === 0 && course.curriculum && (
            <div className="text-xs text-white/40 p-3 text-center">No lessons match “{query}”.</div>
          )}
          {filteredCurriculum.map((mod) => (
            <div key={mod.id} className="rounded-2xl overflow-hidden border border-white/5">
              <button aria-expanded={!!openModules[mod.id] || !!q} onClick={() => toggleModule(mod.id)} className="w-full min-h-11 flex items-center justify-between gap-3 p-4 bg-white/[0.03] hover:bg-white/[0.05] transition text-left">
                <div className="min-w-0"><div className="font-bold text-sm break-words">{mod.title}</div><div className="text-[11px] text-white/40">{(mod.lessons || []).filter((l) => (progress.completedLessons || []).includes(l.id)).length}/{(mod.lessons || []).length} completed</div></div>
                {openModules[mod.id] ? <ChevronUp className="h-4 w-4 shrink-0 text-white/40" /> : <ChevronDown className="h-4 w-4 shrink-0 text-white/40" />}
              </button>
              {(openModules[mod.id] || !!q) && (
                <div className="divide-y divide-white/[0.04] bg-[#020a1f]/50">
                  {(mod.lessons || []).map((lesson) => {
                    const isActive = activeLesson?.id === lesson.id;
                    const isDone = (progress.completedLessons || []).includes(lesson.id);
                    const hasQuiz = getCourseQuizzes(course.id).some((qz) => qz.lessonId === lesson.id);
                    const hasTask = getCourseAssignments(course.id).some((a) => a.lessonId === lesson.id);
                    const { Icon: TypeIcon } = lessonType(lesson);
                    return (
                      <button key={lesson.id} onClick={() => selectLesson(lesson, mod.id)} className={`w-full min-h-11 flex items-center gap-3 p-3 text-left hover:bg-white/[0.04] transition ${isActive ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : 'border-l-2 border-transparent'}`}>
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-cyan-400 text-black' : 'glass'}`}>
                          {isDone ? <CheckCircle2 className="h-4 w-4" /> : <TypeIcon className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[13px] font-medium truncate ${isActive ? 'text-cyan-300' : ''}`}>{lesson.title}</div>
                          <div className="text-[11px] text-white/40 flex items-center gap-1.5">
                            {lesson.duration}
                            <span className={`uppercase tracking-wider text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.06] ${lesson.type === 'project' ? 'text-amber-300' : ''}`}>{lessonType(lesson).label.split(' ')[0]}</span>
                            {(lesson.videoUrl || lesson.videoStoragePath) && <span className="inline-flex items-center gap-0.5"><Video className="h-3 w-3" /></span>}
                            {(lesson.textContent || lesson.content) && <span className="inline-flex items-center gap-0.5"><FileText className="h-3 w-3" /></span>}
                            {hasQuiz && <span className="inline-flex items-center gap-0.5 text-purple-300"><HelpCircle className="h-3 w-3" /></span>}
                            {hasTask && <span className="inline-flex items-center gap-0.5 text-amber-300"><PenLine className="h-3 w-3" /></span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        </aside>
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0 max-w-full pb-20 lg:pb-0">
        {/* Mobile curriculum drawer toggle */}
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-4 z-40 inline-flex min-h-11 items-center gap-2 px-4 rounded-full bg-cyan-400 text-black font-bold text-xs shadow-2xl">
          <Menu className="h-4 w-4" /> CURRICULUM
        </button>

        {/* Admin preview bar */}
        {preview && (
          <div className="sticky top-0 z-30 bg-gradient-to-r from-purple-600 to-indigo-600 px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="uppercase tracking-widest">👁 Admin Preview — exactly what students see</span>
            {(() => {
              const courseAI = aiContent.filter((c) => c.targetCourseId === course.id);
              if (!courseAI.length) return <span className="text-white/70 font-medium normal-case">No AI-generated content for this course.</span>;
              const byStatus = {};
              courseAI.forEach((c) => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });
              return <span className="font-medium normal-case">AI content: {Object.entries(byStatus).map(([s, n]) => `${n} ${s}`).join(' · ')} — students only see approved/published</span>;
            })()}
            <span className="w-full sm:w-auto sm:ml-auto flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-white text-purple-700">STUDENT VIEW</span>
              <Link to="/admin/dashboard" className="min-h-11 inline-flex items-center px-3 rounded-full bg-white/20 hover:bg-white/30">ADMIN EDIT VIEW</Link>
              <Link to={`/course/${slug}`} className="min-h-11 inline-flex items-center px-3 rounded-full bg-white/20 hover:bg-white/30">EXIT PREVIEW</Link>
            </span>
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h1 className="font-bold text-xl">{course.title}</h1><p className="text-sm text-white/60">Lesson progress: {progress.progress}%</p></div>
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden min-h-11 glass rounded-xl px-4" aria-label="Open scheme of work">Scheme of work ▾</button>
          </div>
          <details className="glass rounded-2xl p-4">
            <summary className="cursor-pointer min-h-11 flex items-center font-bold">Course guide — description, objectives & requirements</summary>
            <div className="mt-4 space-y-4">
              {(course.longDescription || course.description) && <LessonBody markdown={course.longDescription || course.description} />}
              {course.whatYouWillLearn?.length > 0 && <div><h2 className="font-bold">Learning objectives</h2><ul className="list-disc pl-5">{course.whatYouWillLearn.map((objective, i) => <li key={i}>{objective}</li>)}</ul></div>}
              {course.requirements?.length > 0 && <div><h2 className="font-bold">Requirements</h2><ul className="list-disc pl-5">{course.requirements.map((requirement, i) => <li key={i}>{requirement}</li>)}</ul></div>}
              <p className="text-sm text-white/60">Use the scheme of work to study every lesson. Lesson completion, quiz results and instructor-reviewed assignments contribute according to this course’s backend completion rules.</p>
            </div>
          </details>
          <CourseAssessments key={course.id} course={course} quizzes={getCourseQuizzes(course.id)} assignments={getCourseAssignments(course.id)} user={user} preview={preview} />
        </div>
        {activeLesson ? (
          <div className="max-w-[960px] mx-auto pb-16">
            {/* Tabs */}
            <div className="sticky top-0 z-10 bg-[#020a1f]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-6 md:px-8 pt-2 sm:pt-4">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setView('video')} className={`min-w-0 min-h-11 px-2 sm:px-5 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 ${view === 'video' ? 'bg-white/[0.06] text-cyan-300' : 'text-white/50 hover:text-white'}`}>
                  <Video className="h-4 w-4 shrink-0" /> VIDEO <span className="hidden sm:inline">LESSON</span>
                </button>
                <button onClick={() => setView('read')} className={`min-w-0 min-h-11 px-2 sm:px-5 rounded-t-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 ${view === 'read' ? 'bg-white/[0.06] text-cyan-300' : 'text-white/50 hover:text-white'}`}>
                  <BookOpen className="h-4 w-4 shrink-0" /> READ <span className="hidden sm:inline">LESSON</span>
                </button>
              </div>
            </div>

            {view === 'video' ? (
              <>
                <div className="w-full max-w-full bg-black aspect-video relative overflow-hidden">
                  <LessonVideo
                    lesson={activeLesson}
                    onVideoProgress={user && !preview ? (secs, dur) => reportVideoProgress(user.id, course.id, activeLesson.id, secs, dur) : null}
                  />
                </div>
                {/* Study panel under the video: objectives + key points, so the
                    lesson is complete even before opening the full text. */}
                {(extractSection(activeLesson.textContent || activeLesson.content, 'learn').length > 0
                  || extractSection(activeLesson.textContent || activeLesson.content, 'Checklist').length > 0) && (
                  <div className="px-4 sm:px-6 md:px-8 pt-5 sm:pt-6">
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
                          <button onClick={() => setView('read')} className="mt-3 min-h-11 text-xs font-bold text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Read the full lesson →</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 sm:px-6 md:px-8 pt-5 sm:pt-6">
                <div className="glass rounded-2xl p-4 sm:p-6 md:p-8">
                  {(activeLesson.textContent || activeLesson.content) ? (
                    <LessonBody markdown={activeLesson.textContent || activeLesson.content} />
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-white/20 mb-3" />
                      <div className="font-bold">No written content is available</div>
                      <p className="text-sm text-white/50 mt-2 max-w-[420px] mx-auto">Use the available video or resources, or contact your instructor if this lesson should contain theory.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 sm:p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Link to={`/course/${slug}`} className="min-h-11 inline-flex items-center text-[11px] text-white/40 hover:text-white font-bold tracking-wide">← BACK TO COURSE</Link>
                    <span className="text-white/20">/</span>
                    <button onClick={() => { setOpenModules((prev) => ({ ...prev, [activeModuleId]: true })); setSidebarOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="min-h-11 text-[11px] text-white/40 hover:text-white font-bold tracking-wide text-left">BACK TO MODULE</button>
                  </div>
                  <div className="max-w-full inline-flex flex-wrap items-center gap-2 px-3 py-2 rounded-2xl glass text-[11px] font-bold tracking-wide sm:tracking-widest mb-3 break-words">
                    {(() => { const { Icon: TIcon, label } = lessonType(activeLesson); return (<><TIcon className="h-3.5 w-3.5 text-cyan-300" /> <span className="text-cyan-300">{label}</span></>); })()}
                    <span className="text-white/30">•</span> {activeModuleId ? (course.curriculum || []).find((m) => m.id === activeModuleId)?.title?.toUpperCase() : 'LESSON'} • {activeLesson.duration}
                  </div>
                  <h1 className="font-display font-bold text-[24px] md:text-[28px] leading-tight">{activeLesson.title}</h1>
                  <div className="mt-2 text-sm text-white/50">Lesson {currentIndex + 1} of {totalLessons} • {course.title}</div>
                </div>
                <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-2">
                  <button disabled={savingProgress || preview} onClick={handleComplete} className={`min-h-11 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition ${(progress.completedLessons || []).includes(activeLesson.id) ? 'bg-green-500 text-white' : 'btn-primary'}`}>
                    <CheckCircle2 className="h-4 w-4" /> {(progress.completedLessons || []).includes(activeLesson.id) ? 'COMPLETED' : savingProgress ? 'SAVING…' : 'MARK AS COMPLETE'}
                  </button>
                  {!isAdmin && (
                    <button onClick={() => window.dispatchEvent(new CustomEvent('wdth_open_dantech', { detail: { prompt: `Explain this lesson in simple terms: ${activeLesson.title}` } }))} className="min-h-11 inline-flex items-center justify-center gap-2 px-4 rounded-full glass text-xs font-bold text-purple-300 hover:bg-white/10 transition">
                      <Sparkles className="h-3.5 w-3.5" /> Ask DanTECH AI
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-lessons checklist */}
              {activeLesson.subLessons?.length > 0 && (
                <div className="glass rounded-2xl p-4 sm:p-6 space-y-3">
                  <h3 className="font-bold flex items-center gap-2"><ListChecks className="h-4 w-4 text-green-300" /> In This Lesson ({activeLesson.subLessons.length} topics)</h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {activeLesson.subLessons.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 text-sm text-white/75 bg-white/[0.03] rounded-xl px-3 py-2.5">
                        <BookOpen className="h-4 w-4 text-cyan-300 shrink-0" /> {s.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <LessonResources key={activeLesson.id} resources={activeLesson.resources} />

              {/* Upcoming live class */}
              {course && getUpcomingClasses([course.id]).slice(0, 1).map((lc) => (
                <div key={lc.id} className="rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-black tracking-widest text-red-300 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" /> LIVE CLASS</div>
                    <div className="font-bold mt-1">{lc.title}</div>
                    <div className="text-xs text-white/60">{lc.date} • {lc.time} ({lc.duration} mins) • {lc.platform}</div>
                  </div>
                  <a href={lc.meetingLink} target="_blank" rel="noreferrer" className="min-h-11 inline-flex items-center px-5 rounded-full bg-red-500 text-white font-bold text-xs hover:bg-red-400">JOIN CLASS 🔴</a>
                </div>
              ))}

              {/* Quizzes */}
              {lessonQuizzes.map((q) => (
                <div key={q.id} className="glass rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold flex items-center gap-2"><HelpCircle className="h-4 w-4 text-purple-300" /> Quiz: {q.title}</h3>
                  {preview ? <p>Quiz attempts are disabled in admin preview.</p> : <QuizTaker quiz={q} userId={user.id} />}
                </div>
              ))}

              {/* Assignments */}
              {lessonAssignments.map((a) => (
                <div key={a.id} className="glass rounded-2xl p-6 space-y-4">
                  {preview ? <p>Submissions are disabled in admin preview.</p> : <AssignmentPanel assignment={a} user={user} />}
                </div>
              ))}

              {/* Certificate CTA */}
              {myCert && (
                <div className="rounded-2xl bg-gradient-to-br from-green-500/15 to-emerald-600/15 border border-green-500/30 p-6 text-center">
                  <Award className="h-10 w-10 mx-auto text-green-300 mb-2" />
                  <div className="font-black text-xl">All Requirements Completed! 🎓</div>
                  <p className="text-sm text-white/60 mt-1">Your WOLI DAN TECH HUB certificate is ready.</p>
                  <Link to="/certificates" className="min-h-11 inline-flex items-center mt-4 px-6 py-3 rounded-full bg-green-500 text-white font-bold text-sm">VIEW & DOWNLOAD CERTIFICATE</Link>
                </div>
              )}

              {/* Lesson Q&A */}
              {activeLesson && (
                <Discussions courseId={course.id} lessonId={activeLesson.id} user={user} title={`Q&A — ${activeLesson.title.slice(0, 40)}`} />
              )}

              <div className="flex flex-wrap justify-between gap-4">
                <button disabled={!prevLesson} onClick={() => prevLesson && selectLesson(prevLesson, prevLesson.moduleId)} className="min-h-11 px-6 py-3 rounded-full glass font-bold text-sm disabled:opacity-30 hover:bg-white/10 transition">← Previous</button>
                {nextLesson ? (
                  <button onClick={() => selectLesson(nextLesson, nextLesson.moduleId)} className="min-h-11 px-6 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90 transition">Next →</button>
                ) : (
                  <Link to="/certificates" className="min-h-11 inline-flex items-center px-6 py-3 rounded-full glass font-bold text-sm">Check certificate status</Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-20 text-center text-white/40">Select a lesson to start</div>
        )}
      </main>
    </div>
  );
}
