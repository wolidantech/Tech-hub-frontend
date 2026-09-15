import { Link } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { BookOpen, Award, Clock, TrendingUp, Play, CheckCircle2, BarChart3, CreditCard, DollarSign, XCircle, Sparkles, HelpCircle, PenLine, Megaphone, Flame, Zap, Trophy, Medal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import { formatNaira } from '../lib/utils';
import { bucketByDay, estimateLearningMinutes, isCatalogCourse, recommendCourses } from '../lib/lms';
import { computeGamification, BADGES } from '../lib/gamify';
import { fetchLeaderboard } from '../lib/store';
import { ProgressRing, BarChart } from '../components/charts/Charts';
import CourseArt from '../components/course/CourseArt';

export default function Dashboard() {
  const { user } = useAuth();
  const { courses, enrollments: allEnrollments, progressMap, getUserEnrollments, getCourseById, getProgress, getUserCertificates, getUserManualPayments, getUserPaymentSummary, getUserNotifications, isEnrolled, lessonActivity } = useCourses();
  const { getUserQuizAverage, getUserAttempts, getUserSubmissions, courseViews, learningEvents, announcements, quizAttempts, submissions, getUpcomingClasses, quizzes } = useLMS();

  const uid = user?.id || '';
  const enrollments = useMemo(() => (uid ? getUserEnrollments(uid) : []), [uid, getUserEnrollments]);
  const certificates = useMemo(() => (uid ? getUserCertificates(uid).filter((c) => c.status !== 'revoked') : []), [uid, getUserCertificates]);
  const manualPayments = useMemo(() => (uid ? getUserManualPayments(uid) : []), [uid, getUserManualPayments]);
  const paymentSummary = useMemo(() => (uid ? getUserPaymentSummary(uid) : { totalPaid: 0, approvedCount: 0, pendingAmount: 0, pendingCount: 0, approvedAmount: 0, rejectedAmount: 0, rejectedCount: 0 }), [uid, getUserPaymentSummary]);
  const notifications = useMemo(() => (uid ? getUserNotifications(uid).slice(0, 4) : []), [uid, getUserNotifications]);

  const coursesWithProgress = useMemo(() => enrollments.map((e) => {
    const course = getCourseById(e.courseId);
    const progress = getProgress(uid, e.courseId);
    return { enrollment: e, course, progress };
  }).filter((x) => x.course), [enrollments, uid, getCourseById, getProgress]);

  const totalProgress = coursesWithProgress.length ? Math.round(coursesWithProgress.reduce((acc, c) => acc + c.progress.progress, 0) / coursesWithProgress.length) : 0;
  const completedCount = coursesWithProgress.filter((c) => c.progress.progress === 100).length;
  const inProgressCount = coursesWithProgress.filter((c) => c.progress.progress > 0 && c.progress.progress < 100).length;

  // ---- Analytics ----
  const myEvents = useMemo(() => learningEvents.filter((e) => e.userId === uid), [learningEvents, uid]);
  const activity = useMemo(() => bucketByDay(myEvents, 'createdAt', 14), [myEvents]);
  const learningMins = useMemo(() => estimateLearningMinutes(myEvents), [myEvents]);
  const quizAvgs = useMemo(() => coursesWithProgress.map(({ course }) => getUserQuizAverage(uid, course.id)).filter((v) => v != null), [coursesWithProgress, uid, getUserQuizAverage]);
  const quizAvg = quizAvgs.length ? Math.round(quizAvgs.reduce((s, v) => s + v, 0) / quizAvgs.length) : null;
  const mySubs = useMemo(() => (uid ? getUserSubmissions(uid) : []), [uid, getUserSubmissions]);
  const avgScore = useMemo(() => {
    const scored = mySubs.filter((s) => s.score != null);
    return scored.length ? Math.round(scored.reduce((s, x) => s + x.score, 0) / scored.length) : null;
  }, [mySubs]);
  const myAttempts = useMemo(() => (uid ? getUserAttempts(uid) : []), [uid, getUserAttempts]);

  const recommended = useMemo(() => {
    if (!uid) return [];
    const enrolledIds = enrollments.map((e) => e.courseId);
    const completedIds = enrolledIds.filter((id) => getProgress(uid, id).progress === 100);
    const viewedIds = courseViews.filter((v) => v.userId === uid).map((v) => v.courseId);
    return recommendCourses({ courses: courses.filter(isCatalogCourse), enrolledIds, completedIds, viewedIds, interests: user?.interests || [], limit: 3 });
  }, [courses, enrollments, courseViews, uid, getProgress, user]);

  const myAnnouncements = useMemo(() => announcements.filter((a) => !a.courseId || enrollments.some((e) => e.courseId === a.courseId)).slice(0, 3), [announcements, enrollments]);

  // ---- Gamification ----
  const game = useMemo(() => (uid ? computeGamification({ userId: uid, enrollments: allEnrollments, progressMap, courses, quizAttempts, submissions, learningEvents }) : null), [uid, allEnrollments, progressMap, courses, quizAttempts, submissions, learningEvents]);
  const myBadges = useMemo(() => (game ? BADGES.filter((b) => game.badges.includes(b.id)) : []), [game]);
  const [leaderboard, setLeaderboard] = useState([]);
  useEffect(() => {
    let alive = true;
    fetchLeaderboard(5).then((rows) => { if (alive) setLeaderboard((rows || []).map((r, i) => ({ ...r, rank: i + 1 }))); }).catch(() => {});
    return () => { alive = false; };
  }, [uid]);
  const myRankRow = leaderboard.find((r) => r.userId === uid);
  const myRank = myRankRow ? myRankRow.rank : -1;

  const upcomingLive = useMemo(() => {
    if (!uid) return [];
    const ids = enrollments.map((e) => e.courseId);
    return getUpcomingClasses(ids.length ? ids : null).slice(0, 2);
  }, [uid, enrollments, getUpcomingClasses]);

  // Continue Learning: the exact lesson the student last opened (lesson_activity),
  // falling back to the last completed lesson. Backend rows are the source.
  const resume = useMemo(() => {
    if (!uid) return null;
    const activeEnrollments = new Set(enrollments.filter((e) => e.status === 'active').map((e) => e.courseId));
    const recent = (lessonActivity || []).find((a) => a.userId === uid && activeEnrollments.has(a.courseId));
    const pick = (courseId, lessonId) => {
      const course = getCourseById(courseId);
      if (!course) return null;
      const lesson = (course.curriculum || []).flatMap((m) => m.lessons || []).find((l) => l.id === lessonId);
      return { course, lesson, progress: getProgress(uid, courseId).progress };
    };
    if (recent) {
      const r = pick(recent.courseId, recent.lessonId);
      if (r) return r;
    }
    for (const e of enrollments) {
      const p = getProgress(uid, e.courseId);
      if (p.lastLessonId && p.progress < 100) {
        const r = pick(e.courseId, p.lastLessonId);
        if (r) return r;
      }
    }
    return null;
  }, [uid, enrollments, lessonActivity, getCourseById, getProgress]);

  // Recent quiz results across all courses.
  const recentAttempts = useMemo(() => {
    if (!uid) return [];
    const byQuiz = {};
    quizzes.forEach((z) => { byQuiz[z.id] = z; });
    return myAttempts
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4)
      .map((a) => ({ ...a, quizTitle: byQuiz[a.quizId]?.title || 'Quiz' }));
  }, [uid, myAttempts, quizzes]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display font-black text-[28px] md:text-[36px] leading-none">Welcome, {user.fullName.split(' ')[0]} 👋</h1>
            <p className="mt-2 text-white/60">Here's what's happening with your learning journey</p>
          </div>
          <div className="flex gap-3">
            <Link to="/my-payments" className="px-5 py-3 rounded-full glass font-bold text-xs flex items-center gap-2"><CreditCard className="h-4 w-4" /> MY PAYMENTS</Link>
            <Link to="/courses" className="btn-primary !py-3 !px-6 text-[13px]">BROWSE COURSES</Link>
          </div>
        </div>

        {/* Live classes */}
        {upcomingLive.length > 0 && (
          <div className="mb-6 space-y-3">
            {upcomingLive.map((lc) => (
              <div key={lc.id} className="rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/15 border border-red-500/30 p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400 animate-pulse shrink-0" />
                  <div>
                    <div className="font-bold text-sm">🔴 LIVE: {lc.title}</div>
                    <div className="text-xs text-white/60">{lc.date} • {lc.time} • {lc.platform}</div>
                  </div>
                </div>
                <a href={lc.meetingLink} target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-full bg-red-500 text-white font-bold text-xs">JOIN CLASS</a>
              </div>
            ))}
          </div>
        )}

        {/* Continue Learning — resume the exact lesson where you stopped */}
        {resume && (
          <div className="mb-6 rounded-[24px] bg-gradient-to-r from-cyan-500/15 to-blue-600/15 border border-cyan-400/30 p-5 md:p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[11px] font-black tracking-widest text-cyan-300 mb-1.5">▶ CONTINUE LEARNING</div>
              <div className="font-bold text-lg leading-tight truncate">{resume.lesson ? resume.lesson.title : resume.course.title}</div>
              <div className="text-xs text-white/60 mt-1 truncate">{resume.course.title} • {resume.progress}% complete</div>
            </div>
            <Link to={`/learn/${resume.course.slug}`} className="px-6 py-3 rounded-full bg-cyan-400 text-black font-black text-xs flex items-center gap-2 hover:bg-cyan-300 transition shrink-0">
              <Play className="h-4 w-4" /> RESUME LESSON
            </Link>
          </div>
        )}

        {/* Gamification */}
        {game && (
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 mb-8">
            <div className="glass rounded-[24px] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex flex-col items-center justify-center">
                    <span className="font-black text-xl leading-none">{game.level}</span>
                    <span className="text-[9px] font-black">LEVEL</span>
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-300" /> {game.xp} XP</div>
                    <div className="text-xs text-white/50 mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-400" /> {game.streak}-day streak</span>
                      <span>•</span><span>{game.xpToNext} XP to Level {game.level + 1}</span>
                    </div>
                    <div className="w-48 h-2 rounded-full bg-white/10 mt-2 overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-400 to-orange-600" style={{ width: `${Math.round(game.xpProgress * 100)}%` }} /></div>
                  </div>
                </div>
                <Link to={`/student/${uid}`} className="text-xs font-bold text-cyan-300">VIEW PORTFOLIO →</Link>
              </div>
              <div className="mt-4">
                <div className="text-[11px] font-bold tracking-widest text-white/40 mb-2">BADGES ({myBadges.length}/{BADGES.length})</div>
                {myBadges.length === 0 ? (
                  <div className="text-xs text-white/40">Complete lessons and quizzes to earn badges 🏅</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {myBadges.map((b) => (
                      <span key={b.id} title={b.desc} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-bold">
                        <span className="text-base">{b.icon}</span> {b.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="glass rounded-[24px] p-6">
              <div className="font-bold flex items-center gap-2 mb-3"><Trophy className="h-4 w-4 text-amber-300" /> Leaderboard</div>
              <div className="space-y-2">
                {leaderboard.map((r, i) => (
                  <div key={r.userId} className={`flex items-center gap-3 p-2.5 rounded-xl text-sm ${r.userId === uid ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-white/[0.03]'}`}>
                    <span className="font-black w-6 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                    <span className="font-bold truncate flex-1">{r.name}{r.userId === uid && ' (you)'}</span>
                    <span className="text-xs font-bold text-amber-300">{r.xp} XP</span>
                  </div>
                ))}
                {leaderboard.length === 0 && <div className="text-xs text-white/40">No activity yet.</div>}
              </div>
              {myRank > 5 && <div className="text-xs text-white/40 mt-2">Your rank: #{myRank}</div>}
            </div>
          </div>
        )}

        {/* Announcements */}
        {myAnnouncements.length > 0 && (
          <div className="mb-8 space-y-3">
            {myAnnouncements.map((a) => (
              <div key={a.id} className="rounded-2xl bg-gradient-to-r from-cyan-500/15 to-blue-600/15 border border-cyan-500/25 p-4 flex gap-3">
                <Megaphone className="h-5 w-5 text-cyan-300 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-bold">{a.title}</div>
                  <div className="text-white/60 mt-0.5">{a.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Learning analytics */}
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4 mb-8">
          <div className="glass rounded-[24px] p-6 flex items-center gap-6">
            <div className="relative shrink-0">
              <ProgressRing value={totalProgress} size={110} stroke={10} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-black text-2xl">{totalProgress}%</span>
                <span className="text-[10px] text-white/40 font-bold">OVERALL</span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              <div className="font-bold">Learning Progress</div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-white/[0.04] p-2.5"><div className="font-black text-lg text-green-300">{completedCount}</div><div className="text-[10px] text-white/40 font-bold">COMPLETED</div></div>
                <div className="rounded-xl bg-white/[0.04] p-2.5"><div className="font-black text-lg text-cyan-300">{inProgressCount}</div><div className="text-[10px] text-white/40 font-bold">IN PROGRESS</div></div>
                <div className="rounded-xl bg-white/[0.04] p-2.5"><div className="font-black text-lg">{quizAvg != null ? `${quizAvg}%` : '—'}</div><div className="text-[10px] text-white/40 font-bold">QUIZ AVG</div></div>
                <div className="rounded-xl bg-white/[0.04] p-2.5"><div className="font-black text-lg">{Math.floor(learningMins / 60)}h {learningMins % 60}m</div><div className="text-[10px] text-white/40 font-bold">LEARNING TIME</div></div>
              </div>
            </div>
          </div>
          <div className="glass rounded-[24px] p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold flex items-center gap-2"><Flame className="h-4 w-4 text-orange-400" /> Learning Activity (14 days)</div>
              <div className="text-xs text-white/40">{myEvents.length} activities • {myAttempts.length} quiz attempts</div>
            </div>
            <BarChart data={activity} height={110} />
          </div>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-[20px] p-5 border border-green-500/20 bg-green-500/5">
            <div className="flex items-center justify-between mb-3"><DollarSign className="h-5 w-5 text-green-400" /><span className="text-[11px] font-bold tracking-widest text-white/40">TOTAL PAID</span></div>
            <div className="font-black text-2xl text-green-300">{formatNaira(paymentSummary.totalPaid)}</div>
            <div className="text-xs text-white/50 mt-1">{paymentSummary.approvedCount} approved • Only approved counts</div>
          </div>
          <div className="glass rounded-[20px] p-5 border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center justify-between mb-3"><Clock className="h-5 w-5 text-amber-400" /><span className="text-[11px] font-bold tracking-widest text-white/40">PENDING</span></div>
            <div className="font-black text-2xl text-amber-300">{formatNaira(paymentSummary.pendingAmount)}</div>
            <div className="text-xs text-white/50 mt-1">{paymentSummary.pendingCount} awaiting review</div>
          </div>
          <div className="glass rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-3"><HelpCircle className="h-5 w-5 text-purple-400" /><span className="text-[11px] font-bold tracking-widest text-white/40">QUIZ AVG</span></div>
            <div className="font-black text-2xl">{quizAvg != null ? `${quizAvg}%` : '—'}</div>
            <div className="text-xs text-white/50 mt-1">{myAttempts.length} attempts taken</div>
          </div>
          <div className="glass rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-3"><Award className="h-5 w-5 text-yellow-400" /><span className="text-[11px] font-bold tracking-widest text-white/40">CERTIFICATES</span></div>
            <div className="font-black text-2xl">{certificates.length}</div>
            <div className="text-xs text-white/50 mt-1">{avgScore != null ? `Avg assignment score: ${avgScore}` : 'Completed courses'}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.5fr_0.7fr] gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl">My Courses</h2>
              <div className="flex gap-3">
                <Link to="/my-payments" className="text-sm text-cyan-300 font-bold hover:text-cyan-200">My Payments →</Link>
                <Link to="/my-courses" className="text-sm text-white/50 font-bold hover:text-white">View All →</Link>
              </div>
            </div>

            {coursesWithProgress.length === 0 ? (
              <div className="glass rounded-[24px] p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-white/20 mb-4" />
                <h3 className="font-bold text-lg">No courses yet</h3>
                <p className="text-sm text-white/50 mt-2 max-w-[320px] mx-auto">Enroll via bank transfer, upload receipt, wait for admin approval to get access</p>
                <div className="flex gap-3 justify-center mt-6">
                  <Link to="/courses" className="btn-primary !px-8">BROWSE COURSES</Link>
                  <Link to="/my-payments" className="btn-secondary !px-8">MY PAYMENTS</Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {coursesWithProgress.map(({ course, progress }) => {
                  const totalLessons = course.curriculum ? course.curriculum.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) : (course.lessonsCount || 0);
                  const qAvg = getUserQuizAverage(user.id, course.id);
                  return (
                    <div key={course.id} className="glass rounded-[20px] overflow-hidden hover:border-white/15 transition group">
                      <div className="flex gap-5 p-5">
                        <div className="h-20 w-20 rounded-2xl overflow-hidden shrink-0">
                          <CourseArt course={course} className="h-20" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-bold leading-tight group-hover:text-cyan-300 transition">{course.title}</h3>
                              <div className="mt-1 flex items-center gap-3 text-[12px] text-white/50 flex-wrap">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</span>
                                <span>{(progress.completedLessons || []).length} / {totalLessons} lessons</span>
                                {qAvg != null && <span className="flex items-center gap-1"><HelpCircle className="h-3 w-3" /> Quiz {qAvg}%</span>}
                                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-[10px] font-bold">ENROLLED</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-black text-cyan-300">{progress.progress}%</div>
                              <div className="text-[11px] text-white/40">Complete</div>
                            </div>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-700" style={{ width: `${progress.progress}%` }} />
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Link to={`/learn/${course.slug}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 transition">
                              <Play className="h-3.5 w-3.5" /> {progress.progress === 0 ? 'START' : progress.progress === 100 ? 'REVIEW' : 'CONTINUE'}
                            </Link>
                            {progress.progress === 100 && <span className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-green-500/20 text-green-300 text-xs font-bold"><CheckCircle2 className="h-3.5 w-3.5" /> Completed</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Assignment feedback */}
            {mySubs.filter((s) => s.feedback).length > 0 && (
              <div className="space-y-4">
                <h2 className="font-bold text-xl flex items-center gap-2"><PenLine className="h-5 w-5 text-amber-300" /> Latest Assignment Feedback</h2>
                {mySubs.filter((s) => s.feedback).slice(0, 2).map((s) => (
                  <div key={s.id} className="glass rounded-2xl p-4 text-sm">
                    <div className="flex justify-between"><span className="font-bold">{s.fileName}</span><span className="font-black text-amber-300">{s.score != null ? `${s.score} pts` : ''}</span></div>
                    <div className="text-white/60 mt-1 line-clamp-2">{s.feedback}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent quiz results */}
            {recentAttempts.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-bold text-xl flex items-center gap-2"><HelpCircle className="h-5 w-5 text-purple-300" /> Recent Quiz Results</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {recentAttempts.map((a) => (
                    <div key={a.id} className="glass rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm truncate">{a.quizTitle}</span>
                        <span className={`font-black text-sm shrink-0 ${a.passed ? 'text-green-300' : 'text-red-300'}`}>{a.score}%</span>
                      </div>
                      <div className="text-xs text-white/50 mt-1 flex items-center gap-1.5">
                        {a.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
                        {a.passed ? 'Passed' : 'Not passed yet'} • attempt {a.attemptNo}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Payments — access confirmed by the backend */}
            {manualPayments.filter((p) => p.status === 'approved' && p.courseId && isEnrolled(user.id, p.courseId)).slice(0, 3).map((p) => {
              const approvedCourse = getCourseById(p.courseId);
              return (
                <div key={p.id} className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center shrink-0"><CheckCircle2 className="h-5 w-5 text-green-300" /></div>
                    <div>
                      <div className="font-bold text-green-300 text-sm">Payment Approved</div>
                      <div className="text-xs text-white/60 mt-0.5">{p.courseName} • Your course access is now active.</div>
                    </div>
                  </div>
                  {approvedCourse && (
                    <Link to={`/learn/${approvedCourse.slug}`} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 text-white font-bold text-xs flex items-center gap-2">
                      <Play className="h-3.5 w-3.5" /> START COURSE
                    </Link>
                  )}
                </div>
              );
            })}

            {/* Pending Payments Section */}
            {manualPayments.filter((p) => p.status === 'pending').length > 0 && (
              <div className="space-y-4">
                <h2 className="font-bold text-xl flex items-center gap-2"><Clock className="h-5 w-5 text-amber-400" /> Pending Payments</h2>
                <div className="grid gap-3">
                  {manualPayments.filter((p) => p.status === 'pending').map((p) => (
                    <div key={p.id} className="glass rounded-2xl p-4 flex items-center justify-between border border-amber-500/20 bg-amber-500/5">
                      <div>
                        <div className="font-bold text-sm">{p.courseName}</div>
                        <div className="text-xs text-white/50">{formatNaira(p.amount)} • Ref: {p.reference} • {new Date(p.submittedAt).toLocaleDateString()}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">PENDING REVIEW</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommended.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-bold text-xl flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-300" /> Recommended For You</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {recommended.map((c) => (
                    <Link key={c.id} to={`/course/${c.slug}`} className="glass rounded-2xl overflow-hidden hover:border-cyan-400/40 transition group">
                      <CourseArt course={c} className="h-28" />
                      <div className="p-3">
                        <div className="font-bold text-xs leading-tight line-clamp-2 group-hover:text-cyan-300">{c.title}</div>
                        <div className="text-[11px] text-white/40 mt-1">{formatNaira(c.price)} • ⭐ {c.rating}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass rounded-[20px] p-6">
              <h3 className="font-bold mb-4">My Payments</h3>
              {manualPayments.length === 0 ? (
                <div className="text-sm text-white/40">No payments yet</div>
              ) : (
                <div className="space-y-3">
                  {manualPayments.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm p-3 rounded-xl bg-white/[0.03]">
                      <div><div className="font-bold truncate max-w-[140px]">{p.courseName.slice(0, 20)}</div><div className="text-xs text-white/40">{new Date(p.submittedAt).toLocaleDateString()} • {p.reference.slice(0, 10)}</div></div>
                      <div className="text-right"><div className="font-bold">{formatNaira(p.amount)}</div><div className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.status === 'approved' ? 'bg-green-500/20 text-green-300' : p.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>{p.status.toUpperCase()}</div></div>
                    </div>
                  ))}
                  <Link to="/my-payments" className="block text-center text-xs font-bold text-cyan-300 hover:text-cyan-200 mt-2">View All Payments →</Link>
                </div>
              )}
            </div>

            <div className="glass rounded-[20px] p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-purple-400" /> My Stats</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-white/40">Enrolled</span><span className="font-bold">{enrollments.length} courses</span></div>
                <div className="flex justify-between"><span className="text-white/40">Completed</span><span className="font-bold">{completedCount} courses</span></div>
                <div className="flex justify-between"><span className="text-white/40">Quiz average</span><span className="font-bold">{quizAvg != null ? `${quizAvg}%` : '—'}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Assignment avg</span><span className="font-bold">{avgScore != null ? `${avgScore} pts` : '—'}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Learning time</span><span className="font-bold">{Math.floor(learningMins / 60)}h {learningMins % 60}m</span></div>
                <div className="flex justify-between"><span className="text-white/40">Certificates</span><span className="font-bold">{certificates.length}</span></div>
              </div>
              <Link to="/certificates" className="inline-flex mt-4 w-full h-10 rounded-full glass items-center justify-center font-bold text-xs">VIEW CERTIFICATES</Link>
            </div>

            <div className="glass rounded-[20px] p-6">
              <h3 className="font-bold mb-4">Notifications</h3>
              {notifications.length === 0 ? (
                <div className="text-sm text-white/40">No notifications</div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 rounded-xl bg-white/[0.03] text-sm">
                      <div className="font-bold text-xs">{n.title}</div>
                      <div className="text-xs text-white/50 mt-1 line-clamp-2">{n.message}</div>
                      <div className="text-[10px] text-white/30 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[20px] bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 p-6">
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-sm text-white/60 mb-4">Chat with us on WhatsApp for payment support</p>
              <a href="https://wa.me/2348159610509" target="_blank" className="inline-flex px-4 py-2 rounded-full bg-white text-black font-bold text-sm">CHAT ON WHATSAPP</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
