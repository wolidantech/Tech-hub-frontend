import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Fingerprint, KeyRound, Loader2, Pencil, Plus, QrCode, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  PASSKEY_PRIVACY_NOTE, deletePasskey, deviceLabel, isPasskeySupported, listPasskeys,
  registerPasskey, renamePasskey,
} from '../lib/passkeys';
import { TOTP_HELP, assuranceLevel, enrollTotp, listFactors, unenrollTotp, verifyTotp } from '../lib/mfa';
import { toast, Toaster } from 'sonner';

const stamp = (value) => {
  if (!value) return 'never used';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Account security: passkeys (WebAuthn) + optional Google Authenticator TOTP.
 * Both are Supabase Auth features — this page never touches a service-role key
 * and never sees biometric data (the browser keeps that on the device).
 */
export default function Security() {
  const { user } = useAuth();
  const [passkeys, setPasskeys] = useState([]);
  const [passkeysBusy, setPasskeysBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [factors, setFactors] = useState({ totp: [], verified: [] });
  const [aal, setAal] = useState(null);
  const [enroll, setEnroll] = useState(null);   // { factorId, secret, uri, qrCode }
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const webauthn = isPasskeySupported();

  const loadPasskeys = useCallback(async () => {
    setPasskeysBusy(true);
    try { setPasskeys(await listPasskeys()); }
    catch (err) { toast.error(err.message); }
    finally { setPasskeysBusy(false); }
  }, []);

  const loadFactors = useCallback(async () => {
    try {
      setFactors(await listFactors());
      setAal(await assuranceLevel());
    } catch (err) { toast.error(err.message); }
  }, []);

  useEffect(() => { if (user) { loadPasskeys(); loadFactors(); } }, [user, loadPasskeys, loadFactors]);

  if (!user) return <Navigate to="/login" />;

  const addPasskey = async () => {
    setAdding(true);
    try {
      await registerPasskey(deviceLabel());
      toast.success('Passkey added. You can now sign in with it.');
      await loadPasskeys();
    } catch (err) { toast.error(err.message); }
    finally { setAdding(false); }
  };

  const removePasskey = async (id) => {
    try { await deletePasskey(id); toast.success('Passkey removed'); await loadPasskeys(); }
    catch (err) { toast.error(err.message); }
  };

  const rename = async (pk) => {
    const next = window.prompt('Name this passkey', pk.friendly_name || deviceLabel());
    if (next === null || !next.trim()) return;
    try { await renamePasskey(pk.id, next.trim().slice(0, 40)); await loadPasskeys(); }
    catch (err) { toast.error(err.message); }
  };

  const startEnroll = async () => {
    setBusy(true);
    try { setEnroll(await enrollTotp()); setCode(''); }
    catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const confirmEnroll = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await verifyTotp(code, enroll?.factorId);
      toast.success('Authenticator connected. It will be required at sign-in.');
      setEnroll(null); setCode('');
      await loadFactors();
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const removeFactor = async (id) => {
    try { await unenrollTotp(id); toast.success('Authenticator removed'); await loadFactors(); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-10">
      <Toaster richColors />
      <div className="mx-auto max-w-[760px] px-4 sm:px-6">
        <h1 className="font-display font-black text-[32px] leading-none">Security</h1>
        <p className="mt-2 text-sm text-white/60">
          How you sign in. Session strength: <span className="text-cyan-300 font-bold">{aal?.currentLevel ? aal.currentLevel.toUpperCase() : '—'}</span>
        </p>

        {/* ---------------- Passkeys ---------------- */}
        <section className="mt-8 glass-strong rounded-[24px] p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Fingerprint className="h-5 w-5 text-cyan-300 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold">Passkeys</h2>
              <p className="mt-1 text-[11px] text-white/50 leading-relaxed">{PASSKEY_PRIVACY_NOTE}</p>
            </div>
          </div>

          {!webauthn && (
            <p className="text-[11px] text-amber-300/90">
              This browser cannot create passkeys. Chrome, Safari, Edge and Firefox on a recent phone or laptop can.
            </p>
          )}

          {passkeysBusy
            ? <div className="text-xs text-white/50 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
            : passkeys.length === 0
              ? <p className="text-xs text-white/50">No passkeys yet. Add one to sign in with Face ID, your fingerprint or your device PIN.</p>
              : (
                <ul className="space-y-2">
                  {passkeys.map((pk) => (
                    <li key={pk.id} className="glass rounded-2xl p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">{pk.friendly_name || 'Passkey'}</div>
                        <div className="text-[10px] text-white/45">Added {stamp(pk.created_at)} · last used {stamp(pk.last_used_at)}</div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => rename(pk)} title="Rename" className="p-2 rounded-lg hover:bg-white/10"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => removePasskey(pk.id)} title="Remove" className="p-2 rounded-lg hover:bg-rose-500/20"><Trash2 className="h-3.5 w-3.5 text-rose-300" /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

          <button onClick={addPasskey} disabled={adding || !webauthn}
            className="w-full h-11 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-[#020617] text-xs font-black disabled:opacity-50 hover:opacity-90 transition flex items-center justify-center gap-2">
            {adding ? <><Loader2 className="h-4 w-4 animate-spin" /> WAITING FOR YOUR DEVICE…</> : <><Plus className="h-4 w-4" /> ADD A PASSKEY</>}
          </button>
        </section>

        {/* ---------------- Google Authenticator ---------------- */}
        <section className="mt-6 glass-strong rounded-[24px] p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 text-cyan-300 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold">Google Authenticator <span className="text-[10px] text-white/40 font-bold tracking-widest ml-1">OPTIONAL</span></h2>
              <p className="mt-1 text-[11px] text-white/50 leading-relaxed">{TOTP_HELP}</p>
            </div>
          </div>

          {factors.verified.length > 0 && !enroll && (
            <ul className="space-y-2">
              {factors.verified.map((f) => (
                <li key={f.id} className="glass rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" /> {f.friendly_name || 'Authenticator'}
                  </div>
                  <button onClick={() => removeFactor(f.id)} className="p-2 rounded-lg hover:bg-rose-500/20"><Trash2 className="h-3.5 w-3.5 text-rose-300" /></button>
                </li>
              ))}
            </ul>
          )}

          {enroll ? (
            <form onSubmit={confirmEnroll} className="space-y-4">
              <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
                {enroll.qrCode
                  ? <img src={enroll.qrCode} alt="Scan this code with your authenticator app" className="h-[168px] w-[168px] rounded-xl bg-white p-2" />
                  : <div className="h-[168px] w-[168px] rounded-xl bg-white/5 grid place-items-center text-white/40"><QrCode className="h-8 w-8" /></div>}
                <div className="min-w-0 text-center sm:text-left">
                  <div className="text-[10px] font-bold tracking-widest text-white/40">SETUP KEY</div>
                  <div className="font-mono text-xs break-all text-cyan-200">{enroll.secret}</div>
                  <p className="mt-2 text-[10px] text-white/45 leading-relaxed">
                    Cannot scan? Type this key into the app instead. Save it somewhere safe — it is shown only once.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <input autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code}
                  onChange={e => setCode(e.target.value)} placeholder="123456"
                  className="flex-1 h-12 rounded-full glass px-5 text-center tracking-[0.4em] focus:outline-none focus:border-cyan-400/50" />
                <button disabled={busy || code.replace(/\s/g, '').length < 6} className="btn-primary !py-3 px-6 disabled:opacity-50">
                  {busy ? 'CHECKING…' : 'VERIFY'}
                </button>
              </div>
              <button type="button" onClick={() => setEnroll(null)} className="w-full text-xs text-white/50 hover:text-white font-bold">CANCEL</button>
            </form>
          ) : (
            <button onClick={startEnroll} disabled={busy}
              className="w-full h-11 rounded-full glass border border-white/15 text-xs font-bold hover:bg-white/10 disabled:opacity-50 flex items-center justify-center gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {factors.verified.length ? 'ADD ANOTHER AUTHENTICATOR' : 'SET UP GOOGLE AUTHENTICATOR'}
            </button>
          )}
        </section>

        <p className="mt-6 text-[10px] text-white/35 leading-relaxed">
          Passkeys and authenticator codes are verified by Supabase Auth. This site stores no biometric data and holds
          only the public (anon) key — administrative keys never run in the browser.
        </p>
      </div>
    </div>
  );
}
