import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'sonner';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await register({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password });
      toast.success(`Welcome, ${user.fullName}! Account created.`);
      setTimeout(() => navigate(from), 600);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex">
      <Toaster richColors position="top-center" />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[440px] space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] font-bold tracking-widest"><Sparkles className="h-3 w-3 text-cyan-300" /> JOIN WOLI DAN TECH HUB</div>
            <h1 className="font-display font-black text-[32px] leading-none">Create your account</h1>
            <p className="text-sm text-white/60">Start learning practical digital skills today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Full Name" className="w-full h-[52px] rounded-full glass pl-11 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition" />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email Address" className="w-full h-[52px] rounded-full glass pl-11 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition" />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone Number (e.g. 0815...)" className="w-full h-[52px] rounded-full glass pl-11 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input required type={show ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password (min 6 chars)" className="w-full h-[52px] rounded-full glass pl-11 pr-12 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input required type={show ? 'text' : 'password'} value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="Confirm Password" className="w-full h-[52px] rounded-full glass pl-11 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition" />
            </div>

            <div className="flex items-start gap-2 text-[12px] text-white/50">
              <input required type="checkbox" className="mt-1 rounded" />
              <span>I agree to the <span className="text-white font-semibold">Terms</span> and <span className="text-white font-semibold">Privacy Policy</span> of WOLI DAN TECH HUB</span>
            </div>

            <button disabled={loading} className="w-full btn-primary !py-4 !text-[14px] gap-2 disabled:opacity-60">
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'} <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center text-sm text-white/50">
              Already have an account? <Link to="/login" className="text-cyan-300 font-bold hover:text-cyan-200">Login</Link>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px]">
              {[
                'Secure & Encrypted',
                'Instant Access',
                'Certificate Included'
              ].map(t => (
                <div key={t} className="flex items-center gap-1 text-white/40 justify-center"><CheckCircle2 className="h-3 w-3 text-cyan-400" /> {t}</div>
              ))}
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#0a1a4a] via-[#061236] to-[#020a1f] p-12 items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(34,211,238,0.2),transparent_60%)]" />
        <div className="relative space-y-6 max-w-[480px]">
          <h2 className="font-display font-black text-[40px] leading-[0.9]">Skills for a <span className="text-gradient">Better Future</span></h2>
          <p className="text-white/60 leading-relaxed">Master AI, design, video editing, web development and more. Practical training, real projects, real income.</p>
          <div className="space-y-3">
            {[
              'Practical, project-based learning',
              'Learn on your phone or laptop',
              'Certificate of completion',
              'WhatsApp community support'
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/70"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> {item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
