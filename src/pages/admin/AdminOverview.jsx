import { useMemo } from 'react';
import { TrendingUp, Ticket, Award, Target } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useLMS } from '../../context/LMSContext';
import { getUsers } from '../../lib/storage';
import { bucketByDay } from '../../lib/lms';
import { BarChart, Donut, Sparkline } from '../../components/charts/Charts';
import { formatNaira } from '../../lib/utils';

export default function AdminOverview() {
  const { courses, allEnrollments, allManualPayments, allCertificates, progressMap } = useCourses();
  const { quizAttempts, submissions, couponStats, adminLMSStats, redemptions } = useLMS();

  const users = useMemo(() => getUsers().filter((u) => u.role !== 'admin'), []);
  const registrations = useMemo(() => bucketByDay(users, 'createdAt', 14), [users]);
  const enrollmentTrend = useMemo(() => bucketByDay(allEnrollments, 'enrolledAt', 14), [allEnrollments]);
  const revenueTrend = useMemo(() => {
    const approved = allManualPayments.filter((p) => p.status === 'approved');
    const days = bucketByDay([], 'x', 14).map((d) => ({ ...d, value: 0 }));
    approved.forEach((p) => {
      const key = (p.approvedAt || p.submittedAt || '').slice(0, 10);
      const slot = days.find((d) => d.key === key);
      if (slot) slot.value += p.amount;
    });
    return days;
  }, [allManualPayments]);

  const popular = useMemo(() => {
    const counts = {};
    allEnrollments.forEach((e) => { counts[e.courseId] = (counts[e.courseId] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => ({
      course: courses.find((c) => c.id === id), count: n,
    })).filter((x) => x.course);
  }, [allEnrollments, courses]);

  const completed = Object.values(progressMap).filter((p) => p.progress === 100).length;
  const inProgress = Object.values(progressMap).filter((p) => p.progress > 0 && p.progress < 100).length;
  const completionRate = allEnrollments.length ? Math.round((completed / allEnrollments.length) * 100) : 0;

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-[20px] p-5">
          <div className="flex items-center justify-between mb-2"><Target className="h-5 w-5 text-green-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">COMPLETION RATE</span></div>
          <div className="font-black text-2xl">{completionRate}%</div>
          <div className="text-xs text-white/40">{completed} completed • {inProgress} in progress</div>
        </div>
        <div className="glass rounded-[20px] p-5">
          <div className="flex items-center justify-between mb-2"><Ticket className="h-5 w-5 text-cyan-300" /><span className="text-[11px] tracking-widest text-white/40 font-bold">COUPON USAGE</span></div>
          <div className="font-black text-2xl">{couponStats.redemptions}</div>
          <div className="text-xs text-white/40">{couponStats.active} active coupons • {couponStats.freeRedemptions} free</div>
        </div>
        <div className="glass rounded-[20px] p-5">
          <div className="flex items-center justify-between mb-2"><TrendingUp className="h-5 w-5 text-purple-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">QUIZ PASS RATE</span></div>
          <div className="font-black text-2xl">{adminLMSStats.passRate}%</div>
          <div className="text-xs text-white/40">{adminLMSStats.attempts} attempts • {adminLMSStats.quizzes} quizzes</div>
        </div>
        <div className="glass rounded-[20px] p-5">
          <div className="flex items-center justify-between mb-2"><Award className="h-5 w-5 text-yellow-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">PENDING REVIEWS</span></div>
          <div className="font-black text-2xl">{adminLMSStats.pendingReviews}</div>
          <div className="text-xs text-white/40">{adminLMSStats.submissions} total submissions</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-[20px] p-6">
          <h3 className="font-bold mb-1">Student Registrations</h3>
          <p className="text-xs text-white/40 mb-3">New signups per day (14 days)</p>
          <BarChart data={registrations} height={130} />
        </div>
        <div className="glass rounded-[20px] p-6">
          <h3 className="font-bold mb-1">Course Enrollments</h3>
          <p className="text-xs text-white/40 mb-3">Enrollments per day (14 days)</p>
          <BarChart data={enrollmentTrend} height={130} />
        </div>
        <div className="glass rounded-[20px] p-6">
          <h3 className="font-bold mb-1">Revenue Trend</h3>
          <p className="text-xs text-white/40 mb-3">Approved payments per day (₦)</p>
          <Sparkline data={revenueTrend.map((d) => d.value)} height={64} />
          <div className="mt-3 space-y-1 max-h-[120px] overflow-auto">
            {revenueTrend.filter((d) => d.value > 0).slice(-6).reverse().map((d) => (
              <div key={d.key} className="flex justify-between text-xs"><span className="text-white/40">{d.label}</span><span className="font-bold text-green-300">{formatNaira(d.value)}</span></div>
            ))}
            {revenueTrend.every((d) => d.value === 0) && <div className="text-xs text-white/40">No revenue in the last 14 days.</div>}
          </div>
        </div>
        <div className="glass rounded-[20px] p-6">
          <h3 className="font-bold mb-3">Course Completion</h3>
          <Donut size={150} segments={[
            { label: 'Completed', value: completed, color: '#22c55e' },
            { label: 'In progress', value: inProgress, color: '#22d3ee' },
            { label: 'Not started', value: Math.max(0, allEnrollments.length - completed - inProgress), color: 'rgba(255,255,255,0.2)' },
          ]} />
          <div className="mt-3 text-xs text-white/40">{allCertificates.length} certificates issued • {allEnrollments.length} enrollments</div>
        </div>
      </div>

      <div className="glass rounded-[20px] p-6">
        <h3 className="font-bold mb-4">Popular Courses</h3>
        {popular.length === 0 ? <div className="text-sm text-white/40">No enrollments yet.</div> : (
          <div className="space-y-3">
            {popular.map(({ course, count }) => {
              const max = popular[0].count;
              return (
                <div key={course.id}>
                  <div className="flex justify-between text-sm mb-1"><span className="font-bold truncate max-w-[70%]">{course.title}</span><span className="text-cyan-300 font-bold">{count} enrollments</span></div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600" style={{ width: `${(count / max) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {redemptions.length > 0 && (
        <div className="glass rounded-[20px] p-6">
          <h3 className="font-bold mb-4">Recent Coupon Redemptions</h3>
          <div className="space-y-2 max-h-[200px] overflow-auto">
            {redemptions.slice(0, 8).map((r) => (
              <div key={r.id} className="flex justify-between text-xs p-2.5 rounded-xl bg-white/[0.03]">
                <span className="font-mono font-bold text-cyan-300">{r.couponCode}</span>
                <span className="text-white/50">{r.courseId.slice(0, 20)} • saved {formatNaira(r.discount)}</span>
                <span className="text-white/30">{new Date(r.usedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
