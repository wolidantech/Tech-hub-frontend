import { useState } from 'react';
import { Search, UserCheck, Ban, RotateCcw, Award, Bell, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useLMS } from '../../context/LMSContext';
import { useAuth } from '../../context/AuthContext';
import { getUsers } from '../../lib/storage';
import { formatNaira } from '../../lib/utils';
import { toast } from 'sonner';

export default function StudentControl() {
  const { user, setUserBanned } = useAuth();
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const {
    courses, enrollments, grantEnrollment, setEnrollmentStatus, resetProgress, adminSetLesson,
    getProgress, getUserManualPayments, getUserCertificates, issueCertificateManual, revokeCertificate,
    sendNotificationToUser, getUserEnrollments,
  } = useCourses();
  const { audit, getUserQuizAverage, getUserAttempts, resetQuizAttempts, getUserSubmissions, quizzes } = useLMS();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [enrollCourse, setEnrollCourse] = useState('');
  const [notify, setNotify] = useState({ title: '', message: '' });

  const students = getUsers().filter((u) => u.role !== 'admin').filter((u) =>
    !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const student = selected ? getUsers().find((u) => u.id === selected) : null;

  const doAction = (label, fn) => {
    if (!confirm(`${label} — continue?`)) return;
    try {
      fn();
      toast.success(label + ' ✓');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (student) {
    const studentEnrollments = getUserEnrollments(student.id);
    const payments = getUserManualPayments(student.id);
    const certs = getUserCertificates(student.id);
    const subs = getUserSubmissions(student.id);

    return (
      <div className="space-y-6">
        <button onClick={() => setSelected(null)} className="text-sm text-white/60 hover:text-white">← Back to students</button>

        <div className="glass rounded-[20px] p-6">
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex gap-4 items-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-2xl">{student.fullName.charAt(0)}</div>
              <div>
                <h2 className="font-black text-xl">{student.fullName}</h2>
                <div className="text-sm text-white/50">{student.email} • {student.phone}</div>
                <div className="text-xs text-white/40 mt-1">Joined {new Date(student.createdAt).toLocaleDateString()} • ID {student.id}</div>
                {student.banned && <div className="mt-1 inline-block px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[11px] font-bold">⛔ BANNED</div>}
                {student.lastLoginAt && <div className="text-[11px] text-white/40 mt-1">Last login: {new Date(student.lastLoginAt).toLocaleString()}</div>}
              </div>
            </div>
            <div className="flex gap-2 items-start">
              {student.banned ? (
                <button onClick={() => doAction('Unban student', () => { setUserBanned(student.id, false); audit(user, 'user.unban', 'user', student.id, {}); refresh(); })} className="h-9 px-4 rounded-full bg-green-500/20 text-green-300 text-xs font-bold flex items-center gap-1.5"><UserCheck className="h-4 w-4" /> UNBAN</button>
              ) : (
                <button onClick={() => doAction('BAN student (blocks login)', () => { setUserBanned(student.id, true); audit(user, 'user.ban', 'user', student.id, {}); refresh(); })} className="h-9 px-4 rounded-full bg-red-500/20 text-red-300 text-xs font-bold flex items-center gap-1.5"><Ban className="h-4 w-4" /> BAN</button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/[0.04] p-3"><div className="font-black text-lg">{studentEnrollments.length}</div><div className="text-[10px] text-white/40 font-bold">ENROLLED</div></div>
              <div className="rounded-xl bg-white/[0.04] p-3"><div className="font-black text-lg">{certs.filter((c) => c.status !== 'revoked').length}</div><div className="text-[10px] text-white/40 font-bold">CERTS</div></div>
              <div className="rounded-xl bg-white/[0.04] p-3"><div className="font-black text-lg text-green-300">{formatNaira(payments.filter((p) => p.status === 'approved').reduce((s, p) => s + p.amount, 0))}</div><div className="text-[10px] text-white/40 font-bold">PAID</div></div>
            </div>
          </div>
        </div>

        {/* Enrollments + progress control */}
        <div className="glass rounded-[20px] p-6 space-y-4">
          <h3 className="font-bold">Enrollments & Progress</h3>
          <div className="flex gap-2">
            <select value={enrollCourse} onChange={(e) => setEnrollCourse(e.target.value)} className="h-10 rounded-full glass px-4 text-sm flex-1">
              <option className="bg-[#061236]" value="">Select course to enroll manually</option>
              {courses.filter((c) => !studentEnrollments.some((e) => e.courseId === c.id && e.status !== 'removed')).map((c) => <option className="bg-[#061236]" key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <button onClick={() => { if (!enrollCourse) return toast.error('Select a course'); doAction('Manually enroll student', () => { grantEnrollment(student.id, enrollCourse, { method: 'admin_manual', grantedBy: user.email }); audit(user, 'enrollment.grant', 'enrollment', enrollCourse, { studentId: student.id }); setEnrollCourse(''); }); }} className="h-10 px-4 rounded-full bg-green-500 text-white text-xs font-bold">ENROLL</button>
          </div>
          <div className="space-y-3">
            {studentEnrollments.map((e) => {
              const course = courses.find((c) => c.id === e.courseId);
              const prog = getProgress(student.id, e.courseId);
              const qAvg = getUserQuizAverage(student.id, e.courseId);
              if (!course) return null;
              return (
                <div key={e.id} className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm">{course.title}</div>
                      <div className="text-xs text-white/50 mt-1">
                        {prog.completedLessons.length} lessons done • {prog.progress}% • Quiz avg: {qAvg != null ? `${qAvg}%` : '—'} • Enrolled {new Date(e.enrolledAt).toLocaleDateString()} • Status: <span className={`font-bold ${e.status === 'removed' ? 'text-red-300' : 'text-green-300'}`}>{(e.status || 'active').toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {e.status === 'removed' ? (
                        <button onClick={() => doAction('Restore course access', () => { setEnrollmentStatus(student.id, e.courseId, 'active'); audit(user, 'enrollment.restore', 'enrollment', e.courseId, { studentId: student.id }); })} className="h-8 px-3 rounded-full bg-green-500/20 text-green-300 text-[11px] font-bold">RESTORE ACCESS</button>
                      ) : (
                        <button onClick={() => doAction('Remove course access', () => { setEnrollmentStatus(student.id, e.courseId, 'removed'); audit(user, 'enrollment.remove', 'enrollment', e.courseId, { studentId: student.id }); })} className="h-8 px-3 rounded-full bg-red-500/20 text-red-300 text-[11px] font-bold">REMOVE ACCESS</button>
                      )}
                      <button onClick={() => doAction('Reset course progress', () => { resetProgress(student.id, e.courseId); audit(user, 'progress.reset', 'progress', e.courseId, { studentId: student.id }); })} className="h-8 px-3 rounded-full glass text-[11px] font-bold flex items-center gap-1"><RotateCcw className="h-3 w-3" /> RESET PROGRESS</button>
                    </div>
                  </div>
                  {/* Lesson-level control */}
                  <details className="mt-3">
                    <summary className="text-xs font-bold text-cyan-300 cursor-pointer">LESSON CONTROL ({prog.completedLessons.length}/{course.curriculum.reduce((a, m) => a + m.lessons.length, 0)})</summary>
                    <div className="mt-2 space-y-1 max-h-[220px] overflow-auto">
                      {course.curriculum.flatMap((m) => m.lessons).map((l) => {
                        const done = prog.completedLessons.includes(l.id);
                        return (
                          <div key={l.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/[0.02]">
                            <span className="truncate max-w-[70%]">{l.title}</span>
                            <button onClick={() => { adminSetLesson(student.id, e.courseId, l.id, !done); audit(user, done ? 'progress.lesson_incomplete' : 'progress.lesson_complete', 'lesson', l.id, { studentId: student.id }); }} className={`h-7 px-3 rounded-full text-[10px] font-bold ${done ? 'bg-green-500/20 text-green-300' : 'glass text-white/50'}`}>{done ? '✓ DONE — MARK INCOMPLETE' : 'MARK COMPLETE'}</button>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                  {/* Quiz attempts */}
                  <details className="mt-2">
                    <summary className="text-xs font-bold text-purple-300 cursor-pointer">QUIZ ATTEMPTS ({getUserAttempts(student.id).filter((a) => a.courseId === e.courseId).length})</summary>
                    <div className="mt-2 space-y-1">
                      {quizzes.filter((q) => q.courseId === e.courseId).map((q) => {
                        const atts = getUserAttempts(student.id, q.id);
                        return (
                          <div key={q.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/[0.02]">
                            <span>{q.title} — {atts.length} attempt(s){atts.length > 0 && ` • best ${Math.max(...atts.map((a) => a.score))}%`}</span>
                            {atts.length > 0 && <button onClick={() => doAction('Reset quiz attempts', () => resetQuizAttempts(student.id, q.id, user))} className="h-7 px-3 rounded-full glass text-[10px] font-bold">RESET</button>}
                          </div>
                        );
                      })}
                      {quizzes.filter((q) => q.courseId === e.courseId).length === 0 && <div className="text-xs text-white/30">No quizzes in this course.</div>}
                    </div>
                  </details>
                </div>
              );
            })}
            {studentEnrollments.length === 0 && <div className="text-sm text-white/40">Not enrolled in any course.</div>}
          </div>
        </div>

        {/* Payments */}
        <div className="glass rounded-[20px] p-6">
          <h3 className="font-bold mb-3">Payment History ({payments.length})</h3>
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex flex-wrap justify-between gap-2 text-xs p-3 rounded-xl bg-white/[0.03]">
                <span className="font-bold">{p.courseName.slice(0, 30)}</span>
                <span className="font-bold text-green-300">{formatNaira(p.amount)}</span>
                <span className="font-mono">{p.reference}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${p.status === 'approved' ? 'bg-green-500/20 text-green-300' : p.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>{p.status.toUpperCase()}</span>
              </div>
            ))}
            {payments.length === 0 && <div className="text-sm text-white/40">No payments.</div>}
          </div>
        </div>

        {/* Submissions */}
        {subs.length > 0 && (
          <div className="glass rounded-[20px] p-6">
            <h3 className="font-bold mb-3">Practical Submissions ({subs.length})</h3>
            <div className="space-y-2">
              {subs.map((s) => (
                <div key={s.id} className="flex flex-wrap justify-between gap-2 text-xs p-3 rounded-xl bg-white/[0.03]">
                  <span className="font-bold">{s.fileName}</span>
                  <span>{s.status.replace('_', ' ').toUpperCase()}{s.score != null ? ` • ${s.score} pts` : ''}</span>
                  <span className="text-white/40">{new Date(s.submittedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates */}
        <div className="glass rounded-[20px] p-6 space-y-3">
          <h3 className="font-bold">Certificates ({certs.length})</h3>
          <div className="space-y-2">
            {certs.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 text-xs p-3 rounded-xl bg-white/[0.03]">
                <span className="font-mono font-bold text-cyan-300">{c.certificateId}</span>
                <span>{c.courseName}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${c.status === 'revoked' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>{(c.status || 'valid').toUpperCase()}</span>
                {c.status !== 'revoked' && <button onClick={() => doAction('Revoke certificate', () => { revokeCertificate(c.id); audit(user, 'certificate.revoke', 'certificate', c.id, { studentId: student.id }); })} className="h-7 px-3 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold">REVOKE</button>}
              </div>
            ))}
            {certs.length === 0 && <div className="text-sm text-white/40">No certificates.</div>}
          </div>
          <div className="flex gap-2">
            <select id="manual-cert-course" className="h-10 rounded-full glass px-4 text-sm flex-1" defaultValue="">
              <option className="bg-[#061236]" value="">Select course to issue certificate manually</option>
              {studentEnrollments.map((e) => { const c = courses.find((x) => x.id === e.courseId); return c ? <option className="bg-[#061236]" key={e.id} value={c.id}>{c.title}</option> : null; })}
            </select>
            <button onClick={() => { const sel = document.getElementById('manual-cert-course'); if (!sel.value) return toast.error('Select a course'); const c = courses.find((x) => x.id === sel.value); doAction('Issue certificate manually', () => { issueCertificateManual({ userId: student.id, studentName: student.fullName, courseId: c.id, courseName: c.title, issuedBy: user.email }); sendNotificationToUser(student.id, { title: 'Congratulations! 🎓', message: `Congratulations! 🎓 You have successfully completed ${c.title}. Your WOLI DAN TECH HUB certificate is now available.`, type: 'course_completed', courseId: c.id }); audit(user, 'certificate.issue_manual', 'certificate', c.id, { studentId: student.id }); }); }} className="h-10 px-4 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1"><Award className="h-3.5 w-3.5" /> ISSUE</button>
          </div>
        </div>

        {/* Send notification */}
        <div className="glass rounded-[20px] p-6 space-y-3">
          <h3 className="font-bold flex items-center gap-2"><Bell className="h-4 w-4 text-cyan-300" /> Send Notification</h3>
          <input value={notify.title} onChange={(e) => setNotify({ ...notify, title: e.target.value })} placeholder="Title" className="w-full h-11 rounded-full glass px-4 text-sm" />
          <textarea value={notify.message} onChange={(e) => setNotify({ ...notify, message: e.target.value })} placeholder="Message" className="w-full rounded-2xl glass p-4 text-sm h-20" />
          <button onClick={() => { if (!notify.title.trim() || !notify.message.trim()) return toast.error('Title + message required'); sendNotificationToUser(student.id, { title: notify.title, message: notify.message, type: 'admin_message' }); audit(user, 'notification.send', 'user', student.id, { title: notify.title }); setNotify({ title: '', message: '' }); toast.success('Notification sent'); }} className="px-6 h-11 rounded-full bg-white text-black font-bold text-sm">SEND</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h2 className="font-bold text-xl flex items-center gap-2"><UserCheck className="h-5 w-5 text-cyan-300" /> Student Control ({students.length})</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="h-10 w-[280px] rounded-full glass pl-10 pr-4 text-sm" />
        </div>
      </div>
      <div className="glass rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-[11px] tracking-widest text-white/40">
              <tr><th className="text-left p-4">Student</th><th className="text-left p-4">Contact</th><th className="text-left p-4">Enrolled</th><th className="text-left p-4">Paid</th><th className="text-left p-4">Joined</th><th className="text-left p-4">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.map((u) => {
                const enrolled = enrollments.filter((e) => e.userId === u.id && e.status !== 'removed').length;
                const paid = getUserManualPayments(u.id).filter((p) => p.status === 'approved').reduce((s, p) => s + p.amount, 0);
                return (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-bold">{u.fullName}</td>
                    <td className="p-4 text-xs text-white/60">{u.email}<br />{u.phone}</td>
                    <td className="p-4"><span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">{enrolled} courses</span></td>
                    <td className="p-4 font-bold text-green-300 text-xs">{formatNaira(paid)}</td>
                    <td className="p-4 text-white/40 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4"><button onClick={() => setSelected(u.id)} className="h-9 px-4 rounded-full bg-white text-black text-xs font-bold">MANAGE</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
