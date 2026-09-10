import { Link } from 'react-router-dom';
import { BookOpen, Award, Clock, TrendingUp, Play, CheckCircle2, BarChart3, CreditCard, DollarSign, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { formatNaira } from '../lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const { getUserEnrollments, getCourseById, getProgress, getUserCertificates, getUserManualPayments, getUserPaymentSummary, getUserNotifications } = useCourses();

  if (!user) return null;

  const enrollments = getUserEnrollments(user.id);
  const certificates = getUserCertificates(user.id);
  const manualPayments = getUserManualPayments(user.id);
  const paymentSummary = getUserPaymentSummary(user.id);
  const notifications = getUserNotifications(user.id).slice(0,3);

  const coursesWithProgress = enrollments.map(e => {
    const course = getCourseById(e.courseId);
    const progress = getProgress(user.id, e.courseId);
    return { enrollment: e, course, progress };
  }).filter(x => x.course);

  const totalProgress = coursesWithProgress.length ? Math.round(coursesWithProgress.reduce((acc, c) => acc + c.progress.progress, 0) / coursesWithProgress.length) : 0;
  const completedCount = coursesWithProgress.filter(c => c.progress.progress === 100).length;
  const inProgressCount = coursesWithProgress.filter(c => c.progress.progress > 0 && c.progress.progress < 100).length;

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

        {/* Payment Summary - NEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            <div className="flex items-center justify-between mb-3"><TrendingUp className="h-5 w-5 text-cyan-400" /><span className="text-[11px] font-bold tracking-widest text-white/40">APPROVED</span></div>
            <div className="font-black text-2xl">{formatNaira(paymentSummary.approvedAmount)}</div>
            <div className="text-xs text-white/50 mt-1">{paymentSummary.approvedCount} payments</div>
          </div>
          <div className="glass rounded-[20px] p-5 border border-red-500/20 bg-red-500/5">
            <div className="flex items-center justify-between mb-3"><XCircle className="h-5 w-5 text-red-400" /><span className="text-[11px] font-bold tracking-widest text-white/40">REJECTED</span></div>
            <div className="font-black text-2xl text-red-300">{formatNaira(paymentSummary.rejectedAmount)}</div>
            <div className="text-xs text-white/50 mt-1">{paymentSummary.rejectedCount} rejected</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-3"><BookOpen className="h-5 w-5 text-cyan-300" /><span className="text-[11px] font-bold tracking-widest text-white/40">ENROLLED</span></div>
            <div className="font-black text-2xl">{enrollments.length}</div>
            <div className="text-xs text-white/50 mt-1">My Courses • Access only after approval</div>
          </div>
          <div className="glass rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-3"><TrendingUp className="h-5 w-5 text-green-400" /><span className="text-[11px] font-bold tracking-widest text-white/40">PROGRESS</span></div>
            <div className="font-black text-2xl">{totalProgress}%</div>
            <div className="text-xs text-white/50 mt-1">Average completion</div>
          </div>
          <div className="glass rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-3"><BarChart3 className="h-5 w-5 text-purple-400" /><span className="text-[11px] font-bold tracking-widest text-white/40">IN PROGRESS</span></div>
            <div className="font-black text-2xl">{inProgressCount}</div>
            <div className="text-xs text-white/50 mt-1">Active courses</div>
          </div>
          <div className="glass rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-3"><Award className="h-5 w-5 text-yellow-400" /><span className="text-[11px] font-bold tracking-widest text-white/40">CERTIFICATES</span></div>
            <div className="font-black text-2xl">{certificates.length}</div>
            <div className="text-xs text-white/50 mt-1">Completed</div>
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
                  const totalLessons = course.curriculum.reduce((acc, m) => acc + m.lessons.length, 0);
                  return (
                    <div key={course.id} className="glass rounded-[20px] p-5 flex gap-5 hover:border-white/15 transition group">
                      <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${course.thumbnail ? 'from-cyan-500 to-blue-600' : 'from-slate-600 to-slate-800'} flex items-center justify-center font-black text-sm shrink-0`}>
                        {course.title.slice(0,2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold leading-tight group-hover:text-cyan-300 transition">{course.title}</h3>
                            <div className="mt-1 flex items-center gap-3 text-[12px] text-white/50">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</span>
                              <span>{progress.completedLessons.length} / {totalLessons} lessons</span>
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
                  );
                })}
              </div>
            )}

            {/* Pending Payments Section */}
            {manualPayments.filter(p => p.status === 'pending').length > 0 && (
              <div className="space-y-4">
                <h2 className="font-bold text-xl flex items-center gap-2"><Clock className="h-5 w-5 text-amber-400" /> Pending Payments</h2>
                <div className="grid gap-3">
                  {manualPayments.filter(p => p.status === 'pending').map(p => (
                    <div key={p.id} className="glass rounded-2xl p-4 flex items-center justify-between border border-amber-500/20 bg-amber-500/5">
                      <div>
                        <div className="font-bold text-sm">{p.courseName}</div>
                        <div className="text-xs text-white/50">{formatNaira(p.amount)} • Ref: {p.reference} • {new Date(p.submittedAt).toLocaleDateString()}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> PENDING REVIEW</span>
                    </div>
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
                  {manualPayments.slice(0,4).map(p => (
                    <div key={p.id} className="flex items-center justify-between text-sm p-3 rounded-xl bg-white/[0.03]">
                      <div><div className="font-bold truncate max-w-[140px]">{p.courseName.slice(0,20)}</div><div className="text-xs text-white/40">{new Date(p.submittedAt).toLocaleDateString()} • {p.reference.slice(0,10)}</div></div>
                      <div className="text-right"><div className="font-bold">{formatNaira(p.amount)}</div><div className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.status==='approved'?'bg-green-500/20 text-green-300':p.status==='pending'?'bg-amber-500/20 text-amber-300':'bg-red-500/20 text-red-300'}`}>{p.status.toUpperCase()}</div></div>
                    </div>
                  ))}
                  <Link to="/my-payments" className="block text-center text-xs font-bold text-cyan-300 hover:text-cyan-200 mt-2">View All Payments →</Link>
                </div>
              )}
            </div>

            <div className="glass rounded-[20px] p-6">
              <h3 className="font-bold mb-4">Notifications</h3>
              {notifications.length === 0 ? (
                <div className="text-sm text-white/40">No notifications</div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className="p-3 rounded-xl bg-white/[0.03] text-sm">
                      <div className="font-bold text-xs">{n.title}</div>
                      <div className="text-xs text-white/50 mt-1 line-clamp-2">{n.message}</div>
                      <div className="text-[10px] text-white/30 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass rounded-[20px] p-6">
              <h3 className="font-bold mb-4">Payment Info</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-white/40">Bank</span><span className="font-bold">MONIEPOINT</span></div>
                <div className="flex justify-between"><span className="text-white/40">Account</span><span className="font-mono font-bold text-cyan-300">69852663361</span></div>
                <div className="text-[11px] text-white/30 mt-2">LUNA ENTRY SERVICES- WOLI DAN TECH HUB • Transfer exact amount, upload receipt, wait for approval</div>
              </div>
              <Link to="/my-payments" className="inline-flex mt-4 w-full h-10 rounded-full glass items-center justify-center font-bold text-xs">VIEW MY PAYMENTS</Link>
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
