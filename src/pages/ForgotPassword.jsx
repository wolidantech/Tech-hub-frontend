import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'sonner';

// Secure email-link reset via Supabase Auth (no phone-number shortcut,
// no password ever handled by our own code).
export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await resetPassword(email);
      setSent(true);
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
          <p className="text-sm text-white/50 mt-1">Enter your account email — we'll send you a secure reset link.</p>
        </div>
        {sent ? (
          <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-5 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto" />
            <div className="font-bold">Check your inbox 📧</div>
            <p className="text-sm text-white/60">If an account exists for <span className="font-bold text-white">{email}</span>, a reset link is on its way. It expires in 1 hour.</p>
          </div>
        ) : (
          <form onSubmit={handle} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full h-[48px] rounded-full glass pl-11 pr-5 text-sm focus:outline-none focus:border-cyan-400/50" />
            </div>
            <button disabled={busy} className="w-full btn-primary !py-3.5 disabled:opacity-50">{busy ? 'SENDING...' : 'SEND RESET LINK'}</button>
          </form>
        )}
        <div className="text-center text-sm"><Link to="/login" className="text-cyan-300 font-bold">← Back to Login</Link></div>
      </div>
    </div>
  );
}
