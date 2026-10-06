import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, Shield, Stethoscope, Fingerprint, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isPasskeyAvailable, PASSKEY_PRIVACY_NOTE } from '../lib/passkeys';
import { toast, Toaster } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  // Set when the failure is the backend connection rather than the password,
  // so we can offer diagnostics instead of a toast that vanishes in 4 seconds.
  const [backendIssue, setBackendIssue] = useState(null);
  // 'credentials' -> email + password; 'totp' -> the Google Authenticator step
  // that follows a password sign-in for accounts with a verified factor.
  const [step, setStep] = useState('credentials');
  const [code, setCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [passkeyReady, setPasskeyReady] = useState(false);
  const { login, loginWithPasskey, needsSecondFactor, completeTotpLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  // Passkeys need WebAuthn: only advertise the button on browsers that have it.
  useEffect(() => {
    let alive = true;
    isPasskeyAvailable().then((ok) => { if (alive) setPasskeyReady(!!ok); });
    return () => { alive = false; };
  }, []);

  const goAfterLogin = (user) => {
    toast.success(`Welcome back, ${user.fullName}!`);
    setTimeout(() => {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (!user.onboarded) navigate('/onboarding');
      else navigate(from);
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBackendIssue(null);
    try {
      // A password sign-in only lands on AAL2 once the second factor is checked,
      // so an account with an authenticator gets the code step first.
      if (await needsSecondFactor()) {
        setPendingEmail(email);
        setStep('totp');
        setCode('');
        return;
      }
      goAfterLogin(await login(email, password));
    } catch (err) {
      const msg = err?.message || 'Login failed. Please try again.';
      toast.error(msg);
      const isBackend = /network|failed to fetch|cannot reach|backend not configured|check your connection|something went wrong/i.test(msg);
      if (isBackend) setBackendIssue(msg);
    } finally {
      setLoading(false);
    }
  };

  // Passkey sign-in: the browser runs the WebAuthn ceremony, Supabase verifies it.
  const handlePasskey = async () => {
    setLoading(true);
    setBackendIssue(null);
    try {
      goAfterLogin(await loginWithPasskey());
    } catch (err) {
      toast.error(err?.message || 'Passkey sign-in failed. You can still use your password.');
    } finally {
      setLoading(false);
    }
  };

  const handleTotp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      goAfterLogin(await completeTotpLogin(code));
    } catch (err) {
      toast.error(err?.message || 'That code was not accepted');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex">
      <Toaster richColors position="top-center" />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] font-bold tracking-widest"><Sparkles className="h-3 w-3 text-cyan-300" /> WELCOME BACK</div>
            <img src="/logo.svg" alt="DANQEL DIGITAL INSTITUTE" className="h-24 w-auto max-w-full mb-5" draggable={false} />
            <h1 className="font-display font-black text-[32px] leading-none">Login to your account</h1>
            <p className="text-sm text-white/60">Continue your learning journey</p>
          </div>

          {backendIssue && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/25 p-4 text-left">
              <div className="font-bold text-rose-300 text-sm">This isn’t your password</div>
              <p className="mt-1 text-xs text-white/60 leading-relaxed">
                The site could not reach its database, so no account can be verified right now.
                Everyone will see this until the connection is fixed.
              </p>
              <Link
                to="/backend-status"
                className="mt-3 inline-flex items-center gap-2 h-9 px-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold transition"
              >
                <Stethoscope className="h-3.5 w-3.5 text-cyan-300" /> DIAGNOSE THE CONNECTION
              </Link>
            </div>
          )}

          {step === 'totp' && (
            <form onSubmit={handleTotp} className="space-y-5 glass-strong rounded-[24px] p-6">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <KeyRound className="h-4 w-4" /> TWO-STEP VERIFICATION
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                {pendingEmail ? `Enter the 6-digit code from your authenticator app for ${pendingEmail}.` : 'Enter the 6-digit code from your authenticator app.'}
                {' '}Codes change every 30 seconds.
              </p>
              <input
                autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code}
                onChange={e => setCode(e.target.value)} placeholder="123456"
                className="w-full h-[56px] rounded-2xl glass text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-cyan-400/50"
              />
              <button disabled={loading || code.replace(/\s/g, '').length < 6} className="w-full btn-primary !py-4 !text-[14px] gap-2 disabled:opacity-60">
                {loading ? 'CHECKING...' : 'VERIFY & CONTINUE'} <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => { setStep('credentials'); setCode(''); }}
                className="w-full text-xs text-white/50 hover:text-white font-bold">
                USE A DIFFERENT ACCOUNT
              </button>
            </form>
          )}

          {passkeyReady && step === 'credentials' && (
            <div className="glass-strong rounded-[24px] p-5 space-y-3">
              <div className="flex items-start gap-3">
                <Fingerprint className="h-5 w-5 text-cyan-300 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-bold text-sm">Sign in with a passkey</div>
                  <p className="mt-1 text-[11px] text-white/50 leading-relaxed">{PASSKEY_PRIVACY_NOTE}</p>
                </div>
              </div>
              <button type="button" onClick={handlePasskey} disabled={loading}
                className="w-full h-11 rounded-full glass border border-white/15 text-xs font-bold hover:bg-white/10 disabled:opacity-60 transition">
                {loading ? 'WAITING FOR YOUR DEVICE...' : 'USE FACE ID / FINGERPRINT / PIN'}
              </button>
              <div className="text-[10px] text-white/35 text-center font-bold tracking-widest">OR USE YOUR PASSWORD</div>
            </div>
          )}

          {step === 'credentials' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="next" className="w-full h-[52px] rounded-full glass pl-11 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input required type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" enterKeyHint="go" className="w-full h-[52px] rounded-full glass pl-11 pr-12 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.08] transition" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded" /> <span className="text-white/60">Remember me</span></label>
              <Link to="/forgot-password" className="text-cyan-300 hover:text-cyan-200 font-semibold">Forgot password?</Link>
            </div>

            <button disabled={loading} className="w-full btn-primary !py-4 !text-[14px] gap-2 disabled:opacity-60">
              {loading ? 'LOGGING IN...' : 'LOGIN'} <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center text-sm text-white/50">
              Don't have an account? <Link to="/register" className="text-cyan-300 font-bold hover:text-cyan-200">Create account</Link>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="text-[11px] text-white/40 text-center mb-3 font-bold tracking-widest">ACCOUNT TYPES</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="glass rounded-xl p-3 border border-cyan-500/20">
                  <div className="font-bold text-cyan-300 flex items-center gap-1"><Shield className="h-3 w-3" /> Admin</div>
                  <div className="text-white/60 text-[11px] mt-1">Use /admin/login</div>
                  <div className="text-white/40 text-[10px] mt-1">Secure • Hashed password</div>
                </div>
                <div className="glass rounded-xl p-3">
                  <div className="font-bold">Student</div>
                  <div className="text-white/60 text-[11px] mt-1">Login here</div>
                  <div className="text-white/40 text-[10px] mt-1">Create new account</div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <Link to="/admin/login" className="text-xs text-cyan-300 font-bold hover:text-cyan-200">Go to Admin Login →</Link>
              </div>
            </div>
          </form>
          )}
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#0a1a4a] via-[#061236] to-[#020a1f] p-12 items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.2),transparent_60%)]" />
        <div className="relative space-y-6 max-w-[480px]">
          <h2 className="font-display font-black text-[40px] leading-[0.9]">Learn. <span className="text-gradient">Build.</span> Grow.</h2>
          <p className="text-white/60 leading-relaxed">Join 100+ Nigerians mastering digital skills that create real income. Your future starts here.</p>
          <div className="grid grid-cols-2 gap-3 pt-6">
            {[
              { k: '12+', v: 'Courses' },
              { k: '₦5k', v: 'Per Course' },
              { k: '24/7', v: 'Access' },
              { k: '100%', v: 'Practical' },
            ].map(s => (
              <div key={s.v} className="glass rounded-2xl p-4"><div className="font-black text-xl text-gradient">{s.k}</div><div className="text-xs text-white/50">{s.v}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
