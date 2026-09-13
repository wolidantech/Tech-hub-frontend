import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Users, BookOpen, DollarSign, Award, TrendingUp, Shield, Lock, LogOut, Settings, Eye, EyeOff, XCircle, Clock } from 'lucide-react';
import { formatNaira } from '../lib/utils';
import { toast, Toaster } from 'sonner';
import AdminOverview from './admin/AdminOverview';
import CourseManager from './admin/CourseManager';
import StudentControl from './admin/StudentControl';
import QuizManager from './admin/QuizManager';
import AssignmentReview from './admin/AssignmentReview';
import CouponManager from './admin/CouponManager';
import AIStudio from './admin/AIStudio';
import NotificationManager from './admin/NotificationManager';
import AuditLogViewer from './admin/AuditLogViewer';
import CommunityManager from './admin/CommunityManager';
import SiteSettingsPanel from './admin/SiteSettingsPanel';
import PaymentsManager from './admin/PaymentsManager';

export default function Admin() {
  const { user, isAdmin, changePassword, adminLogout, adminEmail } = useAuth();
  const { 
    allManualPayments, allEnrollments, allCertificates, stats,
  } = useCourses();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  
  // Change password
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [changing, setChanging] = useState(false);

  if (!user) return <Navigate to="/admin/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.new !== pwdForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwdForm.new.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setChanging(true);
    try {
      await changePassword(pwdForm.current, pwdForm.new);
      toast.success('Password changed successfully');
      setPwdForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChanging(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f]">
      <Toaster richColors />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center"><Shield className="h-5 w-5" /></div>
              <div>
                <h1 className="font-display font-black text-[28px] leading-none">Admin Dashboard</h1>
                <p className="text-white/60 text-sm mt-1">Secure • {adminEmail} • {user.fullName}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-2 flex-wrap">
              {['overview','courses','students','quizzes','assignments','coupons','ai-studio','community','payments','certificates','notify','audit','settings'].map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide capitalize flex items-center gap-1.5 ${tab===t?'bg-white text-black':'glass text-white/60 hover:text-white'}`}>
                  {t === 'settings' && <Settings className="h-3.5 w-3.5" />}
                  {t === 'payments' && stats.pendingPayments > 0 && <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />}
                  {t}
                </button>
              ))}
            </div>
            <button onClick={handleLogout} className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold flex items-center gap-1.5 hover:bg-red-500/20 transition">
              <LogOut className="h-3.5 w-3.5" /> LOGOUT
            </button>
          </div>
        </div>

        {tab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass rounded-[20px] p-5"><div className="flex items-center justify-between mb-2"><Users className="h-5 w-5 text-cyan-300" /><span className="text-[11px] tracking-widest text-white/40 font-bold">STUDENTS</span></div><div className="font-black text-2xl">{stats.totalStudents}</div><div className="text-xs text-white/40">{stats.totalEnrollments} enrollments</div></div>
              <div className="glass rounded-[20px] p-5"><div className="flex items-center justify-between mb-2"><BookOpen className="h-5 w-5 text-purple-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">COURSES</span></div><div className="font-black text-2xl">{stats.totalCourses}</div><div className="text-xs text-white/40">Active courses</div></div>
              <div className="glass rounded-[20px] p-5 border border-green-500/20 bg-green-500/5"><div className="flex items-center justify-between mb-2"><DollarSign className="h-5 w-5 text-green-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">REVENUE</span></div><div className="font-black text-2xl text-green-300">{formatNaira(stats.totalRevenue)}</div><div className="text-xs text-white/40">{stats.approvedPayments} approved payments</div></div>
              <div className="glass rounded-[20px] p-5 border border-amber-500/20 bg-amber-500/5"><div className="flex items-center justify-between mb-2"><Clock className="h-5 w-5 text-amber-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">PENDING</span></div><div className="font-black text-2xl text-amber-300">{stats.pendingPayments}</div><div className="text-xs text-white/40">{formatNaira(stats.pendingAmount)} pending</div></div>
              <div className="glass rounded-[20px] p-5"><div className="flex items-center justify-between mb-2"><TrendingUp className="h-5 w-5 text-blue-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">APPROVED</span></div><div className="font-black text-2xl">{stats.approvedPayments}</div><div className="text-xs text-white/40">{formatNaira(stats.approvedRevenue)} approved</div></div>
              <div className="glass rounded-[20px] p-5 border border-red-500/20 bg-red-500/5"><div className="flex items-center justify-between mb-2"><XCircle className="h-5 w-5 text-red-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">REJECTED</span></div><div className="font-black text-2xl text-red-300">{stats.rejectedPayments}</div><div className="text-xs text-white/40">{formatNaira(stats.rejectedAmount)} rejected</div></div>
              <div className="glass rounded-[20px] p-5"><div className="flex items-center justify-between mb-2"><Award className="h-5 w-5 text-orange-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">COMPLETED</span></div><div className="font-black text-2xl">{stats.completedCourses}</div><div className="text-xs text-white/40">Courses completed</div></div>
              <div className="glass rounded-[20px] p-5"><div className="flex items-center justify-between mb-2"><Award className="h-5 w-5 text-pink-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">CERTIFICATES</span></div><div className="font-black text-2xl">{stats.certificatesIssued}</div><div className="text-xs text-white/40">Issued</div></div>
            </div>

            <AdminOverview />

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="glass rounded-[20px] p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Clock className="h-4 w-4 text-amber-400" /> Pending Payments ({stats.pendingPayments})</h3>
                <div className="space-y-3 max-h-[300px] overflow-auto">
                  {allManualPayments.filter(p => p.status === 'pending').slice(0,5).map(p => (
                    <div key={p.id} className="flex justify-between items-center text-sm p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div><div className="font-bold">{p.studentName}</div><div className="text-xs text-white/50">{p.courseName.slice(0,20)} • {formatNaira(p.amount)}</div></div>
                      <span className="text-amber-300 text-xs px-2 py-1 rounded-full bg-amber-500/20">PENDING</span>
                    </div>
                  ))}
                  {stats.pendingPayments === 0 && <div className="text-sm text-white/40 text-center py-8">No pending payments 🎉</div>}
                </div>
              </div>
              <div className="glass rounded-[20px] p-6">
                <h3 className="font-bold mb-4">Recent Enrollments</h3>
                <div className="space-y-3 max-h-[300px] overflow-auto">
                  {allEnrollments.slice(-5).reverse().map(e => (
                    <div key={e.id} className="flex justify-between text-sm"><span>{e.userId.slice(0,8)} → {e.courseId.slice(0,15)}</span><span className="text-xs text-white/40">{new Date(e.enrolledAt).toLocaleDateString()}</span></div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-[20px] p-6 border border-cyan-500/20 bg-cyan-500/5">
                <h3 className="font-bold mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-cyan-300" /> Security Status</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-white/50">Admin Email</span><span className="font-mono font-bold text-cyan-300">{adminEmail}</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Password Storage</span><span className="text-green-300 font-bold">Hashed (SHA-256 + Salt)</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Payment Verification</span><span className="text-green-300 font-bold">Manual • Secure</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Receipt Access</span><span className="text-green-300 font-bold">Admin Only</span></div>
                  <div className="pt-3 text-[11px] text-white/30">Manual bank transfer: MONIEPOINT 69852663361 • Only approved payments count toward revenue</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'courses' && <CourseManager />}

        {tab === 'students' && <StudentControl />}

        {tab === 'quizzes' && <QuizManager />}

        {tab === 'assignments' && <AssignmentReview />}

        {tab === 'coupons' && <CouponManager />}

        {tab === 'ai-studio' && <AIStudio />}

        {tab === 'community' && <CommunityManager />}

        {tab === 'notify' && <NotificationManager />}

        {tab === 'audit' && <AuditLogViewer />}

        {tab === 'payments' && <PaymentsManager />}

        {tab === 'certificates' && (
          <div className="space-y-6">
            <h2 className="font-bold text-xl">Certificates Issued: {allCertificates.length}</h2>
            <div className="glass rounded-[20px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.03] text-[11px] tracking-widest text-white/40">
                    <tr><th className="text-left p-4">Certificate ID</th><th className="text-left p-4">Student</th><th className="text-left p-4">Course</th><th className="text-left p-4">Date</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allCertificates.slice().reverse().map(c => (
                      <tr key={c.id} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-mono font-bold text-cyan-300">{c.certificateId}</td>
                        <td className="p-4 font-mono text-xs">{c.userId.slice(0,8)}</td>
                        <td className="p-4">{c.courseName}</td>
                        <td className="p-4 text-white/40 text-xs">{new Date(c.issueDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="max-w-[800px] space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass rounded-[24px] p-8 space-y-6">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2"><Lock className="h-5 w-5 text-cyan-300" /> Change Password</h3>
                  <p className="text-sm text-white/50 mt-1">Update your admin password securely. Passwords are hashed with SHA-256 + salt.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input required type={showPwd.current ? 'text' : 'password'} value={pwdForm.current} onChange={e => setPwdForm({ ...pwdForm, current: e.target.value })} placeholder="Current Password" className="w-full h-[48px] rounded-full glass pl-11 pr-12 text-sm focus:outline-none focus:border-cyan-400/50" />
                    <button type="button" onClick={() => setShowPwd({ ...showPwd, current: !showPwd.current })} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"><span className="sr-only">toggle</span>{showPwd.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input required type={showPwd.new ? 'text' : 'password'} value={pwdForm.new} onChange={e => setPwdForm({ ...pwdForm, new: e.target.value })} placeholder="New Password (min 8 chars)" className="w-full h-[48px] rounded-full glass pl-11 pr-12 text-sm focus:outline-none focus:border-cyan-400/50" />
                    <button type="button" onClick={() => setShowPwd({ ...showPwd, new: !showPwd.new })} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">{showPwd.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input required type={showPwd.confirm ? 'text' : 'password'} value={pwdForm.confirm} onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })} placeholder="Confirm New Password" className="w-full h-[48px] rounded-full glass pl-11 pr-12 text-sm focus:outline-none focus:border-cyan-400/50" />
                    <button type="button" onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">{showPwd.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                  <button disabled={changing} className="w-full btn-primary !py-3.5 disabled:opacity-60">{changing ? 'UPDATING...' : 'UPDATE PASSWORD'}</button>
                </form>

                <div className="text-[11px] text-white/30 leading-relaxed">
                  • Passwords are never stored as plain text<br />
                  • Hashed with SHA-256 + secure salt<br />
                  • No password displayed in UI or logs<br />
                  • Session expires after 8 hours
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass rounded-[24px] p-6 space-y-4">
                  <h4 className="font-bold flex items-center gap-2"><Shield className="h-5 w-5 text-green-400" /> Admin Security Info</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-white/40">Admin Email</span><span className="font-mono font-bold text-cyan-300">{adminEmail}</span></div>
                    <div className="flex justify-between"><span className="text-white/40">Role</span><span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">ADMIN</span></div>
                    <div className="flex justify-between"><span className="text-white/40">Password Storage</span><span className="text-green-300 font-bold text-xs">Hashed • SHA-256 + Salt</span></div>
                    <div className="flex justify-between"><span className="text-white/40">Session Duration</span><span className="font-bold">8 hours</span></div>
                    <div className="flex justify-between"><span className="text-white/40">Bank Account</span><span className="font-mono font-bold text-xs">69852663361 • MONIEPOINT</span></div>
                  </div>
                </div>

                <SiteSettingsPanel />

                <div className="rounded-[20px] bg-red-500/10 border border-red-500/20 p-6 space-y-3">
                  <h4 className="font-bold text-red-300 flex items-center gap-2"><LogOut className="h-4 w-4" /> Danger Zone</h4>
                  <p className="text-sm text-white/50">Logout will clear your secure admin session.</p>
                  <button onClick={handleLogout} className="w-full h-11 rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-600">LOGOUT FROM ADMIN</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
