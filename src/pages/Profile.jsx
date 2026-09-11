import { useState } from 'react';
import { User, Mail, Phone, Lock, Award, BookOpen, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { toast, Toaster } from 'sonner';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { getUserEnrollments, getUserCertificates } = useCourses();
  const [form, setForm] = useState({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '', password: '' });

  if (!user) return null;
  const enrollments = getUserEnrollments(user.id);
  const certs = getUserCertificates(user.id);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ fullName: form.fullName, email: form.email, phone: form.phone, ...(form.password ? { password: form.password } : {}) });
    toast.success('Profile updated successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-10">
      <Toaster richColors />
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-black text-[32px] leading-none mb-8">My Profile</h1>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
          <div className="space-y-6">
            <div className="glass rounded-[24px] p-8 text-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-3xl mx-auto shadow-[0_0_30px_rgba(34,211,238,0.4)]">{user.fullName.charAt(0).toUpperCase()}</div>
              <h2 className="mt-4 font-bold text-xl">{user.fullName}</h2>
              <div className="text-sm text-white/50">{user.email}</div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="glass rounded-2xl p-3"><div className="font-black text-lg">{enrollments.length}</div><div className="text-[11px] text-white/40">Courses</div></div>
                <div className="glass rounded-2xl p-3"><div className="font-black text-lg">{certs.length}</div><div className="text-[11px] text-white/40">Certs</div></div>
                <div className="glass rounded-2xl p-3"><div className="font-black text-lg">{user.role}</div><div className="text-[11px] text-white/40">Role</div></div>
              </div>
            </div>

            <div className="glass rounded-[24px] p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2"><BookOpen className="h-5 w-5 text-cyan-300" /> Learning Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-white/50">Enrolled Courses</span><span className="font-bold">{enrollments.length}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Certificates Earned</span><span className="font-bold">{certs.length}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Member Since</span><span className="font-bold">{new Date(user.createdAt).toLocaleDateString()}</span></div>
              </div>
            </div>
          </div>

          <div className="glass rounded-[24px] p-8">
            <h3 className="font-bold text-lg mb-6">Edit Profile</h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full h-[52px] rounded-full glass pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400/50" placeholder="Full Name" />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full h-[52px] rounded-full glass pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400/50" placeholder="Email" />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full h-[52px] rounded-full glass pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400/50" placeholder="Phone" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full h-[52px] rounded-full glass pl-11 pr-4 text-sm focus:outline-none focus:border-cyan-400/50" placeholder="New Password (leave blank to keep current)" />
              </div>

              <button type="submit" className="w-full btn-primary !py-4 gap-2"><Save className="h-4 w-4" /> SAVE CHANGES</button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="font-bold mb-3 flex items-center gap-2"><Award className="h-4 w-4 text-yellow-400" /> My Certificates</h4>
              {certs.length === 0 ? <div className="text-sm text-white/40">No certificates yet. Complete a course to earn one.</div> : (
                <div className="space-y-2">
                  {certs.map(c => (
                    <div key={c.id} className="flex items-center justify-between glass rounded-xl p-3 text-sm">
                      <span className="font-medium">{c.courseName.slice(0,30)}</span>
                      <span className="text-xs font-mono text-cyan-300">{c.certificateId}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
