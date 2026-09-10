import { useParams, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Play, CheckCircle2, BookOpen, ArrowLeft, FileText, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'sonner';

export default function Learn() {
  const { slug } = useParams();
  const { getCourseBySlug, getProgress, markLessonComplete, unmarkLesson, isEnrolled } = useCourses();
  const { user } = useAuth();
  const [activeLesson, setActiveLesson] = useState(null);
  const [openModules, setOpenModules] = useState({ m1: true });

  const course = getCourseBySlug(slug);
  if (!course) return <div className="p-20 text-center">Course not found</div>;
  if (!user) return <Navigate to="/login" />;
  if (!isEnrolled(user.id, course.id)) return <Navigate to={`/course/${slug}`} />;

  const progress = getProgress(user.id, course.id);
  const allLessons = course.curriculum.flatMap(m => m.lessons);
  const totalLessons = allLessons.length;

  useEffect(() => {
    if (!activeLesson) {
      const lastId = progress.lastLessonId;
      const last = lastId ? allLessons.find(l => l.id === lastId) : null;
      const nextUncompleted = allLessons.find(l => !progress.completedLessons.includes(l.id));
      setActiveLesson(last || nextUncompleted || allLessons[0]);
    }
  }, []);

  const currentIndex = activeLesson ? allLessons.findIndex(l => l.id === activeLesson.id) : 0;
  const nextLesson = allLessons[currentIndex + 1];
  const prevLesson = allLessons[currentIndex - 1];

  const handleComplete = () => {
    if (!activeLesson) return;
    const isCompleted = progress.completedLessons.includes(activeLesson.id);
    if (isCompleted) {
      unmarkLesson(user.id, course.id, activeLesson.id);
      toast.info('Marked as incomplete');
    } else {
      markLessonComplete(user.id, course.id, activeLesson.id);
      toast.success('Lesson completed! 🎉');
      if (progress.completedLessons.length + 1 === totalLessons) {
        toast.success('Course completed! Certificate generated 🎓', { duration: 5000 });
      }
    }
  };

  const toggleModule = (id) => setOpenModules(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020a1f]">
      <Toaster richColors />
      {/* Sidebar */}
      <div className="lg:w-[360px] border-r border-white/[0.06] bg-[#061236]/50 backdrop-blur-xl flex flex-col lg:h-screen lg:sticky lg:top-0">
        <div className="p-5 border-b border-white/10 space-y-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link>
          <div>
            <h2 className="font-bold leading-tight">{course.title}</h2>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5"><span className="text-white/50">{progress.completedLessons.length} / {totalLessons} completed</span><span className="font-bold text-cyan-300">{progress.progress}%</span></div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all" style={{ width: `${progress.progress}%` }} /></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {course.curriculum.map(mod => (
            <div key={mod.id} className="rounded-2xl overflow-hidden border border-white/5">
              <button onClick={() => toggleModule(mod.id)} className="w-full flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.05] transition text-left">
                <div><div className="font-bold text-sm">{mod.title}</div><div className="text-[11px] text-white/40">{mod.lessons.filter(l => progress.completedLessons.includes(l.id)).length}/{mod.lessons.length} completed</div></div>
                {openModules[mod.id] ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
              </button>
              {openModules[mod.id] && (
                <div className="divide-y divide-white/[0.04] bg-[#020a1f]/50">
                  {mod.lessons.map(lesson => {
                    const isActive = activeLesson?.id === lesson.id;
                    const isDone = progress.completedLessons.includes(lesson.id);
                    return (
                      <button key={lesson.id} onClick={() => setActiveLesson(lesson)} className={`w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.04] transition ${isActive ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : 'border-l-2 border-transparent'}`}>
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-cyan-400 text-black' : 'glass'}`}>
                          {isDone ? <CheckCircle2 className="h-4 w-4" /> : lesson.type === 'video' ? <Play className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[13px] font-medium truncate ${isActive ? 'text-cyan-300' : ''}`}>{lesson.title}</div>
                          <div className="text-[11px] text-white/40">{lesson.duration} • {lesson.type}</div>
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
          <div className="max-w-[960px] mx-auto">
            {/* Video / Content */}
            <div className="bg-black aspect-video relative overflow-hidden">
              {activeLesson.type === 'video' ? (
                <iframe src={activeLesson.videoUrl} className="absolute inset-0 w-full h-full" allowFullScreen title={activeLesson.title} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0a1a4a] to-[#020a1f] p-8">
                  <div className="glass rounded-2xl p-8 max-w-[600px] text-center">
                    <FileText className="h-12 w-12 mx-auto text-cyan-300 mb-4" />
                    <h3 className="font-bold text-xl mb-2">{activeLesson.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{activeLesson.content || 'This is a text lesson with downloadable resources and practical exercises.'}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] font-bold tracking-widest mb-3">{activeLesson.type.toUpperCase()} • {activeLesson.duration}</div>
                  <h1 className="font-display font-bold text-[24px] md:text-[28px] leading-tight">{activeLesson.title}</h1>
                  <div className="mt-2 text-sm text-white/50">Lesson {currentIndex + 1} of {totalLessons} • {course.title}</div>
                </div>
                <button onClick={handleComplete} className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition ${progress.completedLessons.includes(activeLesson.id) ? 'bg-green-500 text-white' : 'btn-primary'}`}>
                  <CheckCircle2 className="h-4 w-4" /> {progress.completedLessons.includes(activeLesson.id) ? 'COMPLETED' : 'MARK AS COMPLETE'}
                </button>
              </div>

              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="font-bold">Lesson Content</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {activeLesson.content || `In this lesson, you'll learn about ${activeLesson.title}. Follow along with the video and complete the practical exercises. Make sure to mark as complete when done to track your progress.`}
                </p>
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="glass rounded-xl p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center"><FileText className="h-5 w-5 text-cyan-300" /></div>
                    <div><div className="font-bold text-sm">Lesson Notes</div><div className="text-xs text-white/40">PDF • 2.4 MB</div></div>
                    <Download className="h-4 w-4 ml-auto text-white/40" />
                  </div>
                  <div className="glass rounded-xl p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center"><BookOpen className="h-5 w-5 text-purple-300" /></div>
                    <div><div className="font-bold text-sm">Resources</div><div className="text-xs text-white/40">ZIP • 12 MB</div></div>
                    <Download className="h-4 w-4 ml-auto text-white/40" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <button disabled={!prevLesson} onClick={() => prevLesson && setActiveLesson(prevLesson)} className="px-6 py-3 rounded-full glass font-bold text-sm disabled:opacity-30 hover:bg-white/10 transition">← Previous</button>
                {nextLesson ? (
                  <button onClick={() => setActiveLesson(nextLesson)} className="px-6 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90 transition">Next →</button>
                ) : (
                  <Link to={`/certificates`} className="px-6 py-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 text-white font-bold text-sm">View Certificate 🎓</Link>
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
