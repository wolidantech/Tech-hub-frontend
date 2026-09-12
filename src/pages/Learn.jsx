import { useParams, Navigate, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Play, CheckCircle2, BookOpen, ArrowLeft, FileText, Download, ChevronDown, ChevronUp, Video, HelpCircle, PenLine, Award, ListChecks } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import { useAuth } from '../context/AuthContext';
import QuizTaker from '../components/learn/QuizTaker';
import AssignmentPanel from '../components/learn/AssignmentPanel';
import { renderLessonMarkdown, evaluateCompletion, getCourseCompletionRules } from '../lib/lms';
import { toast, Toaster } from 'sonner';

function youtubeId(url = '') {
  const m = String(url).match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{6,})/);
  return m ? m[1] : null;
}

function VideoFacade({ url, title }) {
  const [loaded, setLoaded] = useState(false);
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
  if (loaded) {
    return <iframe src={url} className="absolute inset-0 w-full h-full" allowFullScreen title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />;
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
        <div className="text-[11px] text-white/50">Video loads only when you press play (saves data)</div>
      </div>
    </button>
  );
}

export default function Learn() {
  const { slug } = useParams();
  const { getCourseBySlug, getProgress, markLessonComplete, unmarkLesson, isEnrolled, getUserCertificates, issueCertificateManual, sendNotificationToUser } = useCourses();
  const { getCourseQuizzes, getCourseAssignments, getUserQuizAverage, countApprovedAssignments, isFinalProjectApproved, completionRules, trackEvent, quizAttempts, submissions } = useLMS();
  const { user } = useAuth();
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [openModules, setOpenModules] = useState({ m1: true });
  const [view, setView] = useState('video'); // video | read
  const [certChecked, setCertChecked] = useState(false);

  const course = getCourseBySlug(slug);
  const progress = course && user ? getProgress(user.id, course.id) : { completedLessons: [], progress: 0, lastLessonId: null };

  const allLessons = useMemo(() => (course ? course.curriculum.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title }))) : []), [course]);
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

  // Auto-issue certificate when ALL configured requirements are met
  useEffect(() => {
    if (!course || !user || !completion?.met || myCert || certChecked) return;
    setCertChecked(true);
    issueCertificateManual({ userId: user.id, studentName: user.fullName, courseId: course.id, courseName: course.title, issuedBy: 'WOLI DAN TECH HUB' });
    sendNotificationToUser(user.id, {
      title: 'Congratulations! 🎓',
      message: `Congratulations! 🎓 You have successfully completed ${course.title}. Your WOLI DAN TECH HUB certificate is now available.`,
      type: 'course_completed', courseId: course.id,
    });
    toast.success('🎓 Certificate unlocked! All requirements completed.', { duration: 6000 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completion?.met]);

  useEffect(() => {
    if (!activeLesson && allLessons.length) {
      const lastId = progress.lastLessonId;
      const last = lastId ? allLessons.find((l) => l.id === lastId) : null;
      const nextUncompleted = allLessons.find((l) => !progress.completedLessons.includes(l.id));
      const first = last || nextUncompleted || allLessons[0];
      setActiveLesson(first);
      setActiveModuleId(first.moduleId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!course) return <div className="p-20 text-center">Course not found</div>;
  if (!user) return <Navigate to="/login" />;
  if (!isEnrolled(user.id, course.id)) return <Navigate to={`/course/${slug}`} />;

  const currentIndex = activeLesson ? allLessons.findIndex((l) => l.id === activeLesson.id) : 0;
  const nextLesson = allLessons[currentIndex + 1];
  const prevLesson = allLessons[currentIndex - 1];

  const selectLesson = (lesson, moduleId) => {
    setActiveLesson(lesson);
    setActiveModuleId(moduleId);
    setView(lesson.type === 'text' && !lesson.videoUrl ? 'read' : 'video');
  };

  const handleComplete = () => {
    if (!activeLesson) return;
    const isCompleted = progress.completedLessons.includes(activeLesson.id);
    if (isCompleted) {
      unmarkLesson(user.id, course.id, activeLesson.id);
      toast.info('Marked as incomplete');
    } else {
      markLessonComplete(user.id, course.id, activeLesson.id);
      trackEvent(user.id, course.id, 'lesson_complete', activeLesson.id);
      toast.success('Lesson completed! 🎉');
      if (nextLesson) {
        setTimeout(() => selectLesson(nextLesson, nextLesson.moduleId), 600);
      }
    }
  };

  const toggleModule = (id) => setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));

  const lessonQuizzes = activeLesson ? getCourseQuizzes(course.id).filter((q) => q.lessonId === activeLesson.id || (q.moduleId === activeModuleId && !q.lessonId)) : [];
  const lessonAssignments = activeLesson ? getCourseAssignments(course.id).filter((a) => a.lessonId === activeLesson.id || (a.moduleId === activeModuleId && !a.lessonId)) : [];
  const courseQuizzes = getCourseQuizzes(course.id).filter((q) => !q.moduleId && !q.lessonId);
  const courseAssignments = getCourseAssignments(course.id).filter((a) => !a.moduleId && !a.lessonId);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020a1f]">
      <Toaster richColors />
      {/* Sidebar */}
      <div className="lg:w-[360px] border-r border-white/[0.06] bg-[#061236]/50 backdrop-blur-xl flex flex-col lg:h-screen lg:sticky lg:top-0 lg:overflow-hidden">
        <div className="p-5 border-b border-white/10 space-y-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link>
          <div>
            <h2 className="font-bold leading-tight">{course.title}</h2>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5"><span className="text-white/50">{progress.completedLessons.length} / {totalLessons} completed</span><span className="font-bold text-cyan-300">{progress.progress}%</span></div>
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
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {course.curriculum.map((mod) => (
            <div key={mod.id} className="rounded-2xl overflow-hidden border border-white/5">
              <button onClick={() => toggleModule(mod.id)} className="w-full flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.05] transition text-left">
                <div><div className="font-bold text-sm">{mod.title}</div><div className="text-[11px] text-white/40">{mod.lessons.filter((l) => progress.completedLessons.includes(l.id)).length}/{mod.lessons.length} completed</div></div>
                {openModules[mod.id] ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
              </button>
              {openModules[mod.id] && (
                <div className="divide-y divide-white/[0.04] bg-[#020a1f]/50">
                  {mod.lessons.map((lesson) => {
                    const isActive = activeLesson?.id === lesson.id;
                    const isDone = progress.completedLessons.includes(lesson.id);
                    const hasQuiz = getCourseQuizzes(course.id).some((q) => q.lessonId === lesson.id);
                    const hasTask = getCourseAssignments(course.id).some((a) => a.lessonId === lesson.id);
                    return (
                      <button key={lesson.id} onClick={() => selectLesson(lesson, mod.id)} className={`w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.04] transition ${isActive ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : 'border-l-2 border-transparent'}`}>
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-cyan-400 text-black' : 'glass'}`}>
                          {isDone ? <CheckCircle2 className="h-4 w-4" /> : lesson.type === 'video' ? <Play className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[13px] font-medium truncate ${isActive ? 'text-cyan-300' : ''}`}>{lesson.title}</div>
                          <div className="text-[11px] text-white/40 flex items-center gap-1.5">
                            {lesson.duration}
                            {lesson.videoUrl && <span className="inline-flex items-center gap-0.5"><Video className="h-3 w-3" /></span>}
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
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {activeLesson ? (
          <div className="max-w-[960px] mx-auto pb-16">
            {/* Tabs */}
            <div className="sticky top-0 z-10 bg-[#020a1f]/90 backdrop-blur-xl border-b border-white/[0.06] px-6 md:px-8 pt-4">
              <div className="flex gap-2">
                <button onClick={() => setView('video')} className={`px-5 py-2.5 rounded-t-2xl font-bold text-sm flex items-center gap-2 ${view === 'video' ? 'bg-white/[0.06] text-cyan-300' : 'text-white/50 hover:text-white'}`}>
                  <Video className="h-4 w-4" /> VIDEO LESSON
                </button>
                <button onClick={() => setView('read')} className={`px-5 py-2.5 rounded-t-2xl font-bold text-sm flex items-center gap-2 ${view === 'read' ? 'bg-white/[0.06] text-cyan-300' : 'text-white/50 hover:text-white'}`}>
                  <BookOpen className="h-4 w-4" /> READ LESSON
                </button>
              </div>
            </div>

            {view === 'video' ? (
              <div className="bg-black aspect-video relative overflow-hidden">
                <VideoFacade url={activeLesson.videoUrl} title={activeLesson.title} />
              </div>
            ) : (
              <div className="px-6 md:px-8 pt-6">
                <div className="glass rounded-2xl p-6 md:p-8">
                  {(activeLesson.textContent || activeLesson.content) ? (
                    <div className="lesson-body" dangerouslySetInnerHTML={{ __html: renderLessonMarkdown(activeLesson.textContent || activeLesson.content) }} />
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-white/20 mb-3" />
                      <div className="font-bold">Text version coming soon</div>
                      <p className="text-sm text-white/50 mt-2 max-w-[420px] mx-auto">Watch the video lesson above. A full written guide for "{activeLesson.title}" will be available here shortly.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] font-bold tracking-widest mb-3">{activeModuleId ? course.curriculum.find((m) => m.id === activeModuleId)?.title?.toUpperCase() : 'LESSON'} • {activeLesson.duration}</div>
                  <h1 className="font-display font-bold text-[24px] md:text-[28px] leading-tight">{activeLesson.title}</h1>
                  <div className="mt-2 text-sm text-white/50">Lesson {currentIndex + 1} of {totalLessons} • {course.title}</div>
                </div>
                <button onClick={handleComplete} className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition ${progress.completedLessons.includes(activeLesson.id) ? 'bg-green-500 text-white' : 'btn-primary'}`}>
                  <CheckCircle2 className="h-4 w-4" /> {progress.completedLessons.includes(activeLesson.id) ? 'COMPLETED' : 'MARK AS COMPLETE'}
                </button>
              </div>

              {/* Resources */}
              {activeLesson.resources?.length > 0 && (
                <div className="glass rounded-2xl p-6 space-y-3">
                  <h3 className="font-bold flex items-center gap-2"><Download className="h-4 w-4 text-cyan-300" /> Lesson Resources</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {activeLesson.resources.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noreferrer" className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition">
                        <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center"><FileText className="h-5 w-5 text-cyan-300" /></div>
                        <div><div className="font-bold text-sm">{r.name || `Resource ${i + 1}`}</div><div className="text-xs text-white/40">{r.size || 'Download'}</div></div>
                        <Download className="h-4 w-4 ml-auto text-white/40" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Quizzes */}
              {lessonQuizzes.map((q) => (
                <div key={q.id} className="glass rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold flex items-center gap-2"><HelpCircle className="h-4 w-4 text-purple-300" /> Quiz: {q.title}</h3>
                  <QuizTaker quiz={q} userId={user.id} />
                </div>
              ))}

              {/* Assignments */}
              {lessonAssignments.map((a) => (
                <div key={a.id} className="glass rounded-2xl p-6 space-y-4">
                  <AssignmentPanel assignment={a} user={user} />
                </div>
              ))}

              {/* Course-level quizzes & final */}
              {currentIndex === totalLessons - 1 && (courseQuizzes.length > 0 || courseAssignments.length > 0) && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-gradient-to-br from-purple-500/15 to-indigo-600/15 border border-purple-500/30 p-6">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Award className="h-5 w-5 text-purple-300" /> Final Assessment</h3>
                    <p className="text-sm text-white/60 mt-1">Complete these to unlock your certificate.</p>
                  </div>
                  {courseQuizzes.map((q) => (
                    <div key={q.id} className="glass rounded-2xl p-6 space-y-4">
                      <h3 className="font-bold flex items-center gap-2"><HelpCircle className="h-4 w-4 text-purple-300" /> {q.isFinal ? 'FINAL EXAM: ' : ''}{q.title}</h3>
                      <QuizTaker quiz={q} userId={user.id} />
                    </div>
                  ))}
                  {courseAssignments.map((a) => (
                    <div key={a.id} className="glass rounded-2xl p-6 space-y-4">
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
                  <p className="text-sm text-white/60 mt-1">Your WOLI DAN TECH HUB certificate is ready.</p>
                  <Link to="/certificates" className="inline-flex mt-4 px-6 py-3 rounded-full bg-green-500 text-white font-bold text-sm">VIEW & DOWNLOAD CERTIFICATE</Link>
                </div>
              )}

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
        ) : (
          <div className="p-20 text-center text-white/40">Select a lesson to start</div>
        )}
      </div>
    </div>
  );
}
