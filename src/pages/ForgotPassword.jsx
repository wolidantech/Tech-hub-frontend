import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'sonner';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', phone: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setBusy(true);
    try {
      await resetPassword(form.email, form.phone, form.password);
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Toaster richColors />
      <div className="w-full max-w-[440px] glass-strong rounded-[24px] p-8 space-y-6">
        <div className="text-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto"><KeyRound className="h-7 w-7" /></div>
          <h1 className="font-display font-black text-2xl mt-4">Reset Password</h1>
          <p className="text-sm text-white/50 mt-1">Verify your email + phone number to set a new password.</p>
        </div>
        <form onSubmit={handle} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="w-full h-[48px] rounded-full glass pl-11 pr-5 text-sm focus:outline-none focus:border-cyan-400/50" />
          </div>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number on your account" className="w-full h-[48px] rounded-full glass pl-11 pr-5 text-sm focus:outline-none focus:border-cyan-400/50" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="New password (min 6 chars)" className="w-full h-[48px] rounded-full glass pl-11 pr-5 text-sm focus:outline-none focus:border-cyan-400/50" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input required type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Confirm new password" className="w-full h-[48px] rounded-full glass pl-11 pr-5 text-sm focus:outline-none focus:border-cyan-400/50" />
          </div>
          <button disabled={busy} className="w-full btn-primary !py-3.5 disabled:opacity-50">{busy ? 'RESETTING...' : 'RESET PASSWORD'}</button>
        </form>
        <div className="text-center text-sm"><Link to="/login" className="text-cyan-300 font-bold">← Back to Login</Link></div>
      </div>
    </div>
  );
}
