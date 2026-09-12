import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Users, BookOpen, DollarSign, Award, TrendingUp, Search, Edit, Trash2, Plus, Save, X, Shield, Lock, LogOut, Settings, Eye, EyeOff, CheckCircle2, XCircle, Clock, FileText, Download, AlertTriangle } from 'lucide-react';
import { formatNaira } from '../lib/utils';
import { getUsers } from '../lib/storage';
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

export default function Admin() {
  const { user, isAdmin, changePassword, adminLogout, adminEmail } = useAuth();
  const { 
    courses, allPayments, allManualPayments, allEnrollments, allCertificates, stats, 
    updateCourse, deleteCourse, addCourse,
    approveManualPayment, rejectManualPayment
  } = useCourses();
  const { audit } = useLMS();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ price: 0, title: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', slug: '', category: 'Design', price: 5000, duration: '5 hours', level: 'Beginner', instructor: 'Woli Dan', description: '' });
  
  // Change password
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [changing, setChanging] = useState(false);

  // Manual payment review
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState('all'); // all, pending, approved, rejected

  if (!user) return <Navigate to="/admin/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;

  const users = getUsers().filter(u => u.role !== 'admin');

  const handleEdit = (course) => {
    setEditing(course.id);
    setEditForm({ price: course.price, title: course.title });
  };

  const handleSave = (id) => {
    updateCourse(id, { price: Number(editForm.price), title: editForm.title });
    setEditing(null);
    toast.success('Course updated');
  };

  const handleAdd = () => {
    const slug = newCourse.slug || newCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    addCourse({
      id: slug,
      slug,
      title: newCourse.title.toUpperCase(),
      shortDescription: newCourse.description || 'New course',
      description: newCourse.description,
      longDescription: newCourse.description,
      category: newCourse.category,
      instructor: newCourse.instructor,
      instructorRole: 'Instructor',
      duration: newCourse.duration,
      lessonsCount: 12,
      level: newCourse.level,
      price: Number(newCourse.price),
      originalPrice: Number(newCourse.price) * 2,
      rating: 4.8,
      students: 0,
      thumbnail: 'design',
      color: 'from-cyan-500 to-blue-600',
      whatYouWillLearn: ['Skill 1', 'Skill 2', 'Skill 3'],
      curriculum: [
        { id: 'm1', title: 'Introduction', lessons: [{ id: `${slug}-l1`, title: 'Welcome', type: 'video', duration: '10:00', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }] }
      ]
    });
    setShowAdd(false);
    toast.success('Course added');
  };

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

  const handleApprove = (payment) => {
    if (!confirm(`Are you sure you want to approve this payment?\n\nStudent: ${payment.studentName}\nCourse: ${payment.courseName}\nAmount: ${formatNaira(payment.amount)}\nReference: ${payment.reference}\n\nThis will grant course access immediately.`)) return;
    try {
      approveManualPayment(payment.id, user);
      toast.success(`Payment approved! ${payment.studentName} now has access to ${payment.courseName} 🎉`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = (payment) => {
    if (!rejectReason.trim()) {
      toast.error('Please enter rejection reason');
      return;
    }
    try {
      rejectManualPayment(payment.id, rejectReason, user);
      audit(user, 'payment.reject', 'manual_payment', payment.id, { student: payment.studentName, reason: rejectReason });
      toast.success('Payment rejected');
      setShowRejectModal(null);
      setRejectReason('');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredManualPayments = allManualPayments.filter(p => {
    if (paymentFilter !== 'all' && p.status !== paymentFilter) return false;
    if (search && !`${p.studentName} ${p.email} ${p.courseName} ${p.reference}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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

        {tab === '__legacy_courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-xl">Manage Courses • Prices Editable</h2>
              <button onClick={() => setShowAdd(true)} className="btn-primary !py-2.5 !px-5 text-xs gap-2"><Plus className="h-4 w-4" /> ADD COURSE</button>
            </div>

            {showAdd && (
              <div className="glass-strong rounded-[20px] p-6 space-y-4">
                <div className="flex justify-between"><h3 className="font-bold">Add New Course</h3><button onClick={() => setShowAdd(false)}><X className="h-5 w-5" /></button></div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} placeholder="Course Title" className="h-11 rounded-full glass px-4 text-sm" />
                  <input value={newCourse.slug} onChange={e => setNewCourse({ ...newCourse, slug: e.target.value })} placeholder="Slug (auto from title if blank)" className="h-11 rounded-full glass px-4 text-sm" />
                  <input value={newCourse.category} onChange={e => setNewCourse({ ...newCourse, category: e.target.value })} placeholder="Category" className="h-11 rounded-full glass px-4 text-sm" />
                  <input type="number" value={newCourse.price} onChange={e => setNewCourse({ ...newCourse, price: e.target.value })} placeholder="Price" className="h-11 rounded-full glass px-4 text-sm" />
                  <input value={newCourse.duration} onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })} placeholder="Duration" className="h-11 rounded-full glass px-4 text-sm" />
                  <input value={newCourse.level} onChange={e => setNewCourse({ ...newCourse, level: e.target.value })} placeholder="Level" className="h-11 rounded-full glass px-4 text-sm" />
                </div>
                <textarea value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} placeholder="Description" className="w-full rounded-2xl glass p-4 text-sm h-24" />
                <button onClick={handleAdd} className="btn-primary w-full">CREATE COURSE</button>
              </div>
            )}

            <div className="glass rounded-[20px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.03] text-[11px] tracking-widest text-white/40">
                    <tr><th className="text-left p-4">Course</th><th className="text-left p-4">Category</th><th className="text-left p-4">Price</th><th className="text-left p-4">Students</th><th className="text-left p-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {courses.map(c => (
                      <tr key={c.id} className="hover:bg-white/[0.02]">
                        <td className="p-4">
                          {editing===c.id ? (
                            <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="h-8 rounded-full glass px-3 text-xs w-[200px]" />
                          ) : (
                            <div className="font-bold">{c.title}</div>
                          )}
                          <div className="text-xs text-white/40">{c.slug}</div>
                        </td>
                        <td className="p-4 text-white/60">{c.category}</td>
                        <td className="p-4">
                          {editing===c.id ? (
                            <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="h-8 rounded-full glass px-3 text-xs w-[100px]" />
                          ) : (
                            <span className="font-bold text-cyan-300">{formatNaira(c.price)}</span>
                          )}
                        </td>
                        <td className="p-4">{c.students}</td>
                        <td className="p-4 flex gap-2">
                          {editing===c.id ? (
                            <>
                              <button onClick={() => handleSave(c.id)} className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center"><Save className="h-4 w-4" /></button>
                              <button onClick={() => setEditing(null)} className="h-8 w-8 rounded-full glass flex items-center justify-center"><X className="h-4 w-4" /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(c)} className="h-8 w-8 rounded-full glass flex items-center justify-center hover:bg-white/10"><Edit className="h-4 w-4" /></button>
                              <button onClick={() => { if(confirm('Delete course?')) { deleteCourse(c.id); toast.success('Deleted'); } }} className="h-8 w-8 rounded-full glass flex items-center justify-center hover:bg-red-500/20 text-red-300"><Trash2 className="h-4 w-4" /></button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === '__legacy_students' && (
          <div className="space-y-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-[320px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="h-10 w-full rounded-full glass pl-10 pr-4 text-sm" />
              </div>
              <div className="text-sm text-white/50">{users.length} students</div>
            </div>

            <div className="glass rounded-[20px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.03] text-[11px] tracking-widest text-white/40">
                    <tr><th className="text-left p-4">Student</th><th className="text-left p-4">Email</th><th className="text-left p-4">Phone</th><th className="text-left p-4">Enrolled</th><th className="text-left p-4">Joined</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.filter(u => !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())).map(u => {
                      const enrolled = allEnrollments.filter(e => e.userId === u.id).length;
                      return (
                        <tr key={u.id} className="hover:bg-white/[0.02]">
                          <td className="p-4 font-bold">{u.fullName}</td>
                          <td className="p-4 text-white/60">{u.email}</td>
                          <td className="p-4 text-white/60">{u.phone}</td>
                          <td className="p-4"><span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">{enrolled} courses</span></td>
                          <td className="p-4 text-white/40 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="font-bold text-xl">Manual Bank Transfer Payments</h2>
                <p className="text-sm text-white/50 mt-1">Bank: MONIEPOINT • Account: 69852663361 • LUNA ENTRY SERVICES- WOLI DAN TECH HUB</p>
              </div>
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'All', count: allManualPayments.length },
                  { id: 'pending', label: 'Pending', count: stats.pendingPayments },
                  { id: 'approved', label: 'Approved', count: stats.approvedPayments },
                  { id: 'rejected', label: 'Rejected', count: stats.rejectedPayments },
                ].map(f => (
                  <button key={f.id} onClick={() => setPaymentFilter(f.id)} className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 ${paymentFilter===f.id?'bg-white text-black':'glass text-white/60 hover:text-white'}`}>
                    {f.label} <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${paymentFilter===f.id?'bg-black text-white':'bg-white/10'}`}>{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass rounded-2xl p-4 border border-green-500/20 bg-green-500/5"><div className="text-[11px] text-white/40 font-bold">TOTAL REVENUE (Approved Only)</div><div className="font-black text-xl text-green-300 mt-1">{formatNaira(stats.totalRevenue)}</div></div>
              <div className="glass rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5"><div className="text-[11px] text-white/40 font-bold">PENDING AMOUNT</div><div className="font-black text-xl text-amber-300 mt-1">{formatNaira(stats.pendingAmount)}</div></div>
              <div className="glass rounded-2xl p-4"><div className="text-[11px] text-white/40 font-bold">APPROVED</div><div className="font-black text-xl mt-1">{formatNaira(stats.approvedRevenue)} • {stats.approvedPayments} payments</div></div>
              <div className="glass rounded-2xl p-4 border border-red-500/20 bg-red-500/5"><div className="text-[11px] text-white/40 font-bold">REJECTED</div><div className="font-black text-xl text-red-300 mt-1">{stats.rejectedPayments} payments</div></div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-[360px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student, email, course, reference..." className="h-10 w-full rounded-full glass pl-10 pr-4 text-sm" />
              </div>
            </div>

            <div className="glass rounded-[20px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.03] text-[11px] tracking-widest text-white/40">
                    <tr>
                      <th className="text-left p-4">Student</th>
                      <th className="text-left p-4">Course</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Reference</th>
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Receipt</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredManualPayments.map(p => (
                      <tr key={p.id} className="hover:bg-white/[0.02]">
                        <td className="p-4">
                          <div className="font-bold">{p.studentName}</div>
                          <div className="text-xs text-white/40">{p.email}</div>
                          <div className="text-xs text-white/40">{p.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold">{p.courseName.slice(0,30)}</div>
                          <div className="text-xs text-white/40">{p.courseId.slice(0,15)}</div>
                        </td>
                        <td className="p-4 font-bold text-green-300">{formatNaira(p.amount)}</td>
                        <td className="p-4 font-mono text-xs">{p.reference}</td>
                        <td className="p-4 text-xs text-white/50">
                          <div>{new Date(p.submittedAt).toLocaleDateString()}</div>
                          <div className="text-[11px] text-white/30">Trx: {p.transactionDate}</div>
                        </td>
                        <td className="p-4">
                          <button onClick={() => setSelectedPayment(p)} className="h-8 px-3 rounded-full glass text-xs font-bold flex items-center gap-1 hover:bg-white/10">
                            <Eye className="h-3.5 w-3.5" /> VIEW
                          </button>
                          <div className="text-[10px] text-white/30 mt-1">{p.receiptName?.slice(0,15)}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            p.status==='approved'?'bg-green-500/20 border-green-500/30 text-green-300':
                            p.status==='pending'?'bg-amber-500/20 border-amber-500/30 text-amber-300':
                            'bg-red-500/20 border-red-500/30 text-red-300'
                          }`}>
                            {p.status.toUpperCase()}
                          </span>
                          {p.status==='rejected' && p.rejectedReason && <div className="text-[10px] text-red-300/70 mt-1 max-w-[120px] truncate">{p.rejectedReason}</div>}
                          {p.status==='approved' && <div className="text-[10px] text-green-300/70 mt-1">By {p.approvedBy?.slice(0,15)}</div>}
                        </td>
                        <td className="p-4">
                          {p.status === 'pending' ? (
                            <div className="flex gap-1.5">
                              <button onClick={() => handleApprove(p)} className="h-8 px-3 rounded-full bg-green-500 text-white text-xs font-bold flex items-center gap-1 hover:bg-green-600">
                                <CheckCircle2 className="h-3.5 w-3.5" /> APPROVE
                              </button>
                              <button onClick={() => setShowRejectModal(p)} className="h-8 w-8 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 flex items-center justify-center hover:bg-red-500/30">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-white/30">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredManualPayments.length === 0 && (
                  <div className="p-12 text-center text-white/40 text-sm">No payments found for filter: {paymentFilter}</div>
                )}
              </div>
            </div>

            {/* Receipt Viewer Modal */}
            {selectedPayment && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                <div className="w-full max-w-[700px] max-h-[90vh] overflow-auto glass-strong rounded-[24px] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Payment Receipt - Secure View (Admin Only)</h3>
                    <button onClick={() => setSelectedPayment(null)} className="h-8 w-8 rounded-full glass flex items-center justify-center">✕</button>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4 text-sm glass rounded-2xl p-4">
                    <div><span className="text-white/40 text-xs">Student:</span><div className="font-bold">{selectedPayment.studentName} • {selectedPayment.email}</div></div>
                    <div><span className="text-white/40 text-xs">Course:</span><div className="font-bold">{selectedPayment.courseName}</div></div>
                    <div><span className="text-white/40 text-xs">Amount:</span><div className="font-bold text-green-300">{formatNaira(selectedPayment.amount)}</div></div>
                    <div><span className="text-white/40 text-xs">Reference:</span><div className="font-mono font-bold">{selectedPayment.reference}</div></div>
                    <div><span className="text-white/40 text-xs">Transaction Date:</span><div className="font-bold">{selectedPayment.transactionDate}</div></div>
                    <div><span className="text-white/40 text-xs">Submitted:</span><div className="font-bold">{new Date(selectedPayment.submittedAt).toLocaleString()}</div></div>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30">
                    {selectedPayment.receiptType === 'application/pdf' ? (
                      <div className="p-12 text-center">
                        <FileText className="h-16 w-16 mx-auto text-white/20 mb-4" />
                        <div className="font-bold">{selectedPayment.receiptName}</div>
                        <div className="text-xs text-white/40 mt-1">{(selectedPayment.receiptSize / 1024).toFixed(1)} KB • PDF</div>
                        <a href={selectedPayment.receiptData} download={selectedPayment.receiptName} className="inline-flex mt-6 px-6 py-3 rounded-full bg-white text-black font-bold text-sm gap-2">
                          <Download className="h-4 w-4" /> DOWNLOAD PDF
                        </a>
                      </div>
                    ) : (
                      <img src={selectedPayment.receiptData} alt="Receipt" className="w-full h-auto max-h-[600px] object-contain" />
                    )}
                  </div>

                  {selectedPayment.status === 'pending' && (
                    <div className="flex gap-3">
                      <button onClick={() => { handleApprove(selectedPayment); setSelectedPayment(null); }} className="flex-1 h-12 rounded-full bg-green-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-green-600">
                        <CheckCircle2 className="h-5 w-5" /> APPROVE PAYMENT
                      </button>
                      <button onClick={() => { setShowRejectModal(selectedPayment); setSelectedPayment(null); }} className="flex-1 h-12 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 font-bold flex items-center justify-center gap-2 hover:bg-red-500/30">
                        <XCircle className="h-5 w-5" /> REJECT
                      </button>
                    </div>
                  )}

                  <button onClick={() => setSelectedPayment(null)} className="w-full h-11 rounded-full glass font-bold">CLOSE</button>
                </div>
              </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                <div className="w-full max-w-[480px] glass-strong rounded-[24px] p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center"><XCircle className="h-5 w-5 text-red-400" /></div>
                    <div><h3 className="font-bold">Reject Payment</h3><p className="text-xs text-white/50">{showRejectModal.studentName} • {showRejectModal.courseName}</p></div>
                  </div>

                  <div>
                    <label className="text-xs font-bold tracking-widest text-white/40 mb-2 block">REJECTION REASON *</label>
                    <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full h-12 rounded-full glass px-5 text-sm focus:outline-none focus:border-red-400/50">
                      <option className="bg-[#061236]" value="">Select reason</option>
                      <option className="bg-[#061236]" value="Invalid receipt">Invalid receipt</option>
                      <option className="bg-[#061236]" value="Payment not found">Payment not found</option>
                      <option className="bg-[#061236]" value="Incorrect amount">Incorrect amount</option>
                      <option className="bg-[#061236]" value="Duplicate payment">Duplicate payment</option>
                      <option className="bg-[#061236]" value="Incorrect transaction reference">Incorrect transaction reference</option>
                      <option className="bg-[#061236]" value="Other">Other</option>
                    </select>
                    {rejectReason === 'Other' && (
                      <textarea value={rejectReason === 'Other' ? '' : rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter custom reason..." className="mt-3 w-full rounded-2xl glass p-4 text-sm h-24 focus:outline-none focus:border-red-400/50" />
                    )}
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Or type detailed reason..." className="mt-3 w-full rounded-2xl glass p-4 text-sm h-24 focus:outline-none focus:border-red-400/50" />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => { setShowRejectModal(null); setRejectReason(''); }} className="flex-1 h-11 rounded-full glass font-bold">CANCEL</button>
                    <button onClick={() => handleReject(showRejectModal)} className="flex-1 h-11 rounded-full bg-red-500 text-white font-bold">REJECT PAYMENT</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
