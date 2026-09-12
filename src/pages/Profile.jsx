import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Award, BookOpen, Save, Camera, Share2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import { toast, Toaster } from 'sonner';

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const { getUserEnrollments, getUserCertificates } = useCourses();
  const { categories } = useLMS();
  const [form, setForm] = useState({
    fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '',
    bio: user?.bio || '', skills: (user?.skills || []).join(', '),
    interests: user?.interests || [], portfolioPublic: user?.portfolioPublic !== false,
    showCertificates: user?.showCertificates !== false, showProjects: user?.showProjects !== false,
  });
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

  if (!user) return null;
  const enrollments = getUserEnrollments(user.id);
  const certs = getUserCertificates(user.id);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Only images allowed');
    if (file.size > 1 * 1024 * 1024) return toast.error('Max 1MB for profile photo');
    const reader = new FileReader();
    reader.onload = () => { updateProfile({ avatar: reader.result }); toast.success('Profile photo updated 📸'); };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      fullName: form.fullName, email: form.email, phone: form.phone, bio: form.bio.slice(0, 500),
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20),
      interests: form.interests,
      portfolioPublic: form.portfolioPublic, showCertificates: form.showCertificates, showProjects: form.showProjects,
    });
    toast.success('Profile updated successfully');
  };

  const handlePwd = async (e) => {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) return toast.error('New passwords do not match');
    try {
      await changePassword(pwd.current, pwd.next);
      toast.success('Password changed');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-10">
      <Toaster richColors />
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
          <h1 className="font-display font-black text-[32px] leading-none">Profile Settings</h1>
          <Link to={`/student/${user.id}`} className="px-5 py-2.5 rounded-full glass font-bold text-xs flex items-center gap-2"><Eye className="h-4 w-4" /> VIEW MY PORTFOLIO</Link>
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
          <div className="space-y-6">
            <div className="glass rounded-[24px] p-8 text-center">
              <div className="relative inline-block">
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar" className="h-24 w-24 rounded-full object-cover mx-auto border-4 border-cyan-400/40" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-3xl mx-auto shadow-[0_0_30px_rgba(34,211,238,0.4)]">{user.fullName.charAt(0).toUpperCase()}</div>
                )}
                <label className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:scale-110 transition" title="Upload photo">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </label>
              </div>
              <h2 className="mt-4 font-bold text-xl">{user.fullName}</h2>
              <div className="text-sm text-white/50">{user.email}</div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="glass rounded-2xl p-3"><div className="font-black text-lg">{enrollments.length}</div><div className="text-[11px] text-white/40">Courses</div></div>
                <div className="glass rounded-2xl p-3"><div className="font-black text-lg">{certs.length}</div><div className="text-[11px] text-white/40">Certs</div></div>
                <div className="glass rounded-2xl p-3"><div className="font-black text-lg capitalize">{user.skillLevel?.split(' ')[0] || 'New'}</div><div className="text-[11px] text-white/40">Level</div></div>
              </div>
            </div>

            <div className="glass rounded-[24px] p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Share2 className="h-5 w-5 text-cyan-300" /> Portfolio Privacy</h3>
              <label className="flex items-center justify-between text-sm"><span>Public portfolio page</span><input type="checkbox" checked={form.portfolioPublic} onChange={(e) => setForm({ ...form, portfolioPublic: e.target.checked })} className="h-4 w-4" /></label>
              <label className="flex items-center justify-between text-sm"><span>Show certificates publicly</span><input type="checkbox" checked={form.showCertificates} onChange={(e) => setForm({ ...form, showCertificates: e.target.checked })} className="h-4 w-4" /></label>
              <label className="flex items-center justify-between text-sm"><span>Show projects publicly</span><input type="checkbox" checked={form.showProjects} onChange={(e) => setForm({ ...form, showProjects: e.target.checked })} className="h-4 w-4" /></label>
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/student/${user.id}`); toast.success('Portfolio link copied!'); }} className="w-full h-10 rounded-full glass font-bold text-xs">COPY PORTFOLIO LINK</button>
            </div>

            <div className="glass rounded-[24px] p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Lock className="h-5 w-5 text-amber-300" /> Change Password</h3>
              <form onSubmit={handlePwd} className="space-y-3">
                <input type="password" required value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} placeholder="Current password" className="w-full h-11 rounded-full glass px-4 text-sm" />
                <input type="password" required value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} placeholder="New password" className="w-full h-11 rounded-full glass px-4 text-sm" />
                <input type="password" required value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} placeholder="Confirm new password" className="w-full h-11 rounded-full glass px-4 text-sm" />
                <button className="w-full h-11 rounded-full bg-white text-black font-bold text-sm">UPDATE PASSWORD</button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass rounded-[24px] p-8">
              <h3 className="font-bold text-lg mb-6">Edit Profile</h3>
              <form onSubmit={handleSave} className="space-y-5">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full h-[52px] rounded-full glass pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400/50" placeholder="Full Name" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-[52px] rounded-full glass pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400/50" placeholder="Email" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-[52px] rounded-full glass pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400/50" placeholder="Phone" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 mb-1 block">BIO (shown on your portfolio)</label>
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell the world who you are..." className="w-full rounded-2xl glass p-4 text-sm h-24" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 mb-1 block">SKILLS (comma separated)</label>
                  <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Video Editing, Canva, Python..." className="w-full h-[52px] rounded-full glass px-5 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 mb-2 block">INTERESTS (powers your recommendations)</label>
                  <div className="flex flex-wrap gap-1.5 max-h-[130px] overflow-auto">
                    {categories.map((c) => (
                      <button type="button" key={c} onClick={() => setForm({ ...form, interests: form.interests.includes(c) ? form.interests.filter((x) => x !== c) : [...form.interests, c] })} className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${form.interests.includes(c) ? 'bg-gradient-to-r from-cyan-400 to-blue-600' : 'glass text-white/50'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary !py-4 gap-2"><Save className="h-4 w-4" /> SAVE CHANGES</button>
              </form>
            </div>

            <div className="glass rounded-[24px] p-6">
              <h4 className="font-bold mb-3 flex items-center gap-2"><Award className="h-4 w-4 text-yellow-400" /> My Certificates</h4>
              {certs.length === 0 ? <div className="text-sm text-white/40">No certificates yet. Complete a course to earn one.</div> : (
                <div className="space-y-2">
                  {certs.map((c) => (
                    <div key={c.id} className="flex items-center justify-between glass rounded-xl p-3 text-sm">
                      <span className="font-medium">{c.courseName.slice(0, 30)}</span>
                      <span className="text-xs font-mono text-cyan-300">{c.certificateId}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex items-center gap-2 text-sm text-white/50"><BookOpen className="h-4 w-4" /> Member since {new Date(user.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
