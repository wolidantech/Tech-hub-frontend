import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Shield, Eye, EyeOff, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'sonner';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { adminLogin, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(email, password);
      toast.success('Admin authenticated successfully. Redirecting to dashboard...');
      setTimeout(() => navigate('/admin/dashboard'), 800);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-safe-top safe-bottom min-h-screen flex bg-[#020a1f]">
      <Toaster richColors position="top-center" />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.5)]">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-[28px] leading-none">Admin Login</h1>
              <p className="mt-2 text-sm text-white/60">Secure access to WOLI DAN TECH HUB admin dashboard</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold tracking-widest text-amber-300">
              <AlertTriangle className="h-3 w-3" /> RESTRICTED ACCESS
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-300 flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Admin Email"
                  className="w-full h-[52px] rounded-full glass pl-11 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  required
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Admin Password"
                  className="w-full h-[52px] rounded-full glass pl-11 pr-12 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Secured by Supabase Auth</span>
              <Link to="/forgot-password" className="text-cyan-300 hover:text-cyan-200 font-semibold">Forgot Password?</Link>
            </div>

            <button disabled={loading} className="w-full btn-primary !py-4 !text-[14px] gap-2 disabled:opacity-60">
              {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'} <ArrowRight className="h-4 w-4" />
            </button>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="text-[11px] text-white/30 text-center leading-relaxed">
                This is a secure area. All login attempts are monitored. Unauthorized access is prohibited.
                Passwords are stored as secure hashes and never displayed.
              </div>
              <div className="text-center text-sm">
                <Link to="/" className="text-white/50 hover:text-white">← Back to Website</Link>
              </div>
            </div>
          </form>

          <div className="glass rounded-2xl p-4 space-y-2">
            <div className="text-[11px] font-bold tracking-widest text-white/40">SECURITY FEATURES</div>
            <ul className="text-[12px] text-white/50 space-y-1">
              <li>• Bank-grade auth (Supabase Auth, bcrypt)</li>
              <li>• No passwords in source code or storage</li>
              <li>• Role-based access control (ADMIN only)</li>
              <li>• Secure sessions with auto refresh</li>
              <li>• Protected admin routes</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#0a1a4a] via-[#061236] to-[#020a1f] p-12 items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.15),transparent_60%)]" />
        <div className="relative space-y-6 max-w-[480px]">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center"><Shield className="h-6 w-6" /></div>
          <h2 className="font-display font-black text-[36px] leading-[0.9]">Secure Admin <span className="text-gradient">Dashboard</span></h2>
          <p className="text-white/60 leading-relaxed">Manage courses, students, payments, and certificates. All admin actions are secured with hashed authentication and role-based protection.</p>
          
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center"><Shield className="h-4 w-4 text-green-400" /></div>
              Secure password storage (never plain text)
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center"><Lock className="h-4 w-4 text-cyan-400" /></div>
              Secure session with auto refresh
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center"><Eye className="h-4 w-4 text-purple-400" /></div>
              No password exposure in UI or code
            </div>
          </div>

          <div className="glass rounded-2xl p-4 mt-6">
            <div className="text-xs font-bold tracking-widest text-white/40 mb-2">ADMIN ACCESS</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-white/50">Sign in with</span><span className="font-bold text-cyan-300">Your admin account</span></div>
              <div className="flex justify-between"><span className="text-white/50">Access</span><span className="font-bold text-green-300">ADMIN Role Required</span></div>
              <div className="text-[11px] text-white/30 mt-2">Admin accounts are created in the database by the system owner. Credentials are never shown here.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
