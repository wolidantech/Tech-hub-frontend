import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Users, BookOpen, DollarSign, Award, TrendingUp, Search, Edit, Trash2, Plus, Save, X, Shield, Lock, LogOut, Settings, Eye, EyeOff } from 'lucide-react';
import { formatNaira } from '../lib/utils';
import { getUsers } from '../lib/storage';
import { toast, Toaster } from 'sonner';

export default function Admin() {
  const { user, isAdmin, changePassword, adminLogout, adminEmail } = useAuth();
  const { courses, allPayments, allEnrollments, allCertificates, stats, updateCourse, deleteCourse, addCourse } = useCourses();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ price: 0, title: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', slug: '', category: 'Design', price: 5000, duration: '5 hours', level: 'Beginner', instructor: 'Woli Dan', description: '' });
  
  // Change password state
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [changing, setChanging] = useState(false);

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
              {['overview','courses','students','payments','certificates','settings'].map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide capitalize flex items-center gap-1.5 ${tab===t?'bg-white text-black':'glass text-white/60 hover:text-white'}`}>
                  {t === 'settings' && <Settings className="h-3.5 w-3.5" />}
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="glass rounded-[20px] p-5"><div className="flex items-center justify-between mb-2"><Users className="h-5 w-5 text-cyan-300" /><span className="text-[11px] tracking-widest text-white/40 font-bold">STUDENTS</span></div><div className="font-black text-2xl">{stats.totalStudents}</div><div className="text-xs text-white/40">Total learners</div></div>
              <div className="glass rounded-[20px] p-5"><div className="flex items-center justify-between mb-2"><BookOpen className="h-5 w-5 text-purple-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">COURSES</span></div><div className="font-black text-2xl">{stats.totalCourses}</div><div className="text-xs text-white/40">Active courses</div></div>
              <div className="glass rounded-[20px] p-5"><div className="flex items-center justify-between mb-2"><TrendingUp className="h-5 w-5 text-green-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">ENROLLMENTS</span></div><div className="font-black text-2xl">{stats.totalEnrollments}</div><div className="text-xs text-white/40">Total enrollments</div></div>
              <div className="glass rounded-[20px] p-5"><div className="flex items-center justify-between mb-2"><DollarSign className="h-5 w-5 text-yellow-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">REVENUE</span></div><div className="font-black text-2xl">{formatNaira(stats.totalRevenue)}</div><div className="text-xs text-white/40">Total revenue</div></div>
              <div className="glass rounded-[20px] p-5"><div className="flex items-center justify-between mb-2"><Award className="h-5 w-5 text-orange-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">COMPLETED</span></div><div className="font-black text-2xl">{stats.completedCourses}</div><div className="text-xs text-white/40">Courses completed</div></div>
              <div className="glass rounded-[20px] p-5"><div className="flex items-center justify-between mb-2"><Award className="h-5 w-5 text-pink-400" /><span className="text-[11px] tracking-widest text-white/40 font-bold">CERTIFICATES</span></div><div className="font-black text-2xl">{stats.certificatesIssued}</div><div className="text-xs text-white/40">Issued</div></div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="glass rounded-[20px] p-6">
                <h3 className="font-bold mb-4">Recent Payments</h3>
                <div className="space-y-3">
                  {allPayments.slice(-5).reverse().map(p => (
                    <div key={p.id} className="flex justify-between text-sm"><span>{p.reference.slice(0,10)} • {p.amount}</span><span className="text-green-300 text-xs px-2 py-0.5 rounded-full bg-green-500/20">{p.status}</span></div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-[20px] p-6">
                <h3 className="font-bold mb-4">Recent Enrollments</h3>
                <div className="space-y-3">
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
                  <div className="flex justify-between"><span className="text-white/50">Session</span><span className="text-green-300 font-bold">Secure • 8h expiry</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Role Protection</span><span className="text-green-300 font-bold">ADMIN only</span></div>
                  <div className="pt-3 text-[11px] text-white/30">No plain passwords stored or displayed. All auth uses secure hashing.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'courses' && (
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

        {tab === 'students' && (
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
            <h2 className="font-bold text-xl">Payment Management • Revenue: {formatNaira(stats.totalRevenue)}</h2>
            <div className="glass rounded-[20px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.03] text-[11px] tracking-widest text-white/40">
                    <tr><th className="text-left p-4">Student</th><th className="text-left p-4">Course</th><th className="text-left p-4">Amount</th><th className="text-left p-4">Reference</th><th className="text-left p-4">Status</th><th className="text-left p-4">Date</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allPayments.slice().reverse().map(p => (
                      <tr key={p.id} className="hover:bg-white/[0.02]">
                        <td className="p-4 font-mono text-xs">{p.userId.slice(0,8)}</td>
                        <td className="p-4 text-white/60">{p.courseId.slice(0,20)}</td>
                        <td className="p-4 font-bold text-green-300">{formatNaira(p.amount)}</td>
                        <td className="p-4 font-mono text-xs">{p.reference}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status==='successful'?'bg-green-500/20 text-green-300':'bg-yellow-500/20 text-yellow-300'}`}>{p.status}</span></td>
                        <td className="p-4 text-white/40 text-xs">{new Date(p.date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                    <div className="flex justify-between"><span className="text-white/40">Route Protection</span><span className="text-green-300 font-bold">Enabled</span></div>
                  </div>
                </div>

                <div className="glass rounded-[24px] p-6 space-y-4">
                  <h4 className="font-bold">Forgot Password?</h4>
                  <p className="text-sm text-white/50">If you forgot your admin password, you need to reset it via secure recovery. In production, this would send a reset link to your registered email.</p>
                  <button onClick={() => toast.info('Password recovery: In production, a reset link would be sent to wolidantech@gmail.com via secure email. For demo, use Change Password if logged in, or clear localStorage to reset.')} className="w-full h-11 rounded-full glass font-bold text-sm hover:bg-white/10">SEND RESET LINK</button>
                  <div className="text-[11px] text-white/30">Recovery emails are sent only to the registered admin email address.</div>
                </div>

                <div className="rounded-[20px] bg-red-500/10 border border-red-500/20 p-6 space-y-3">
                  <h4 className="font-bold text-red-300 flex items-center gap-2"><LogOut className="h-4 w-4" /> Danger Zone</h4>
                  <p className="text-sm text-white/50">Logout will clear your secure admin session. You will need to login again at /admin/login</p>
                  <button onClick={handleLogout} className="w-full h-11 rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-600">LOGOUT FROM ADMIN</button>
                </div>
              </div>
            </div>

            <div className="glass rounded-[20px] p-6">
              <h4 className="font-bold mb-3">Security Implementation Details</h4>
              <div className="grid md:grid-cols-2 gap-4 text-xs text-white/50 leading-relaxed">
                <div>
                  <div className="font-bold text-white/80 mb-1">✅ Implemented</div>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Passwords stored as SHA-256 hash + salt, never plain text</li>
                    <li>No password exposed in frontend source code</li>
                    <li>Secure session tokens with 8-hour expiry</li>
                    <li>Protected /admin routes (ADMIN role only)</li>
                    <li>Admin login at /admin/login → /admin/dashboard</li>
                    <li>Change password functionality</li>
                    <li>Forgot password flow prepared</li>
                    <li>Logout clears session</li>
                  </ul>
                </div>
                <div>
                  <div className="font-bold text-white/80 mb-1">🔒 Production Recommendations</div>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Use bcrypt/argon2 on backend (not SHA-256)</li>
                    <li>Store hashes in secure database, not localStorage</li>
                    <li>Use HTTP-only cookies for sessions</li>
                    <li>Implement rate limiting & 2FA</li>
                    <li>Email-based password recovery with tokens</li>
                    <li>Audit logging for admin actions</li>
                    <li>HTTPS only, CSP headers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
