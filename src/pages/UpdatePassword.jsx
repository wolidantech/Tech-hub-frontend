import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'sonner';

// Landing page for Supabase Auth recovery links (/update-password).
export default function UpdatePassword() {
  const { setNewPassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setBusy(true);
    try {
      await setNewPassword(form.password);
      toast.success('Password updated! Please log in.');
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
          <h1 className="font-display font-black text-2xl mt-4">Set New Password</h1>
          <p className="text-sm text-white/50 mt-1">Choose a new password for your account.</p>
        </div>
        <form onSubmit={handle} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="New password (min 6 chars)" className="w-full h-[48px] rounded-full glass pl-11 pr-5 text-sm focus:outline-none focus:border-cyan-400/50" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input required type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Confirm new password" className="w-full h-[48px] rounded-full glass pl-11 pr-5 text-sm focus:outline-none focus:border-cyan-400/50" />
          </div>
          <button disabled={busy} className="w-full btn-primary !py-3.5 disabled:opacity-50">{busy ? 'UPDATING...' : 'UPDATE PASSWORD'}</button>
        </form>
        <div className="text-center text-sm"><Link to="/login" className="text-cyan-300 font-bold">← Back to Login</Link></div>
      </div>
    </div>
  );
}
