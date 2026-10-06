// @vitest-environment jsdom
// Sign-in security and student identity:
//   • no Supabase service-role key may ever reach frontend code
//   • passkeys (WebAuthn) + optional Google Authenticator TOTP go through
//     Supabase Auth, and no biometric data is collected
//   • the student ID card is issued by the backend; the UI only displays it and
//     shows an honest "upload a photo to generate your ID" state otherwise
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// --- shared fakes ------------------------------------------------------------
const mocks = vi.hoisted(() => {
  const client = {
    auth: {
      signInWithPasskey: vi.fn(),
      registerPasskey: vi.fn(),
      passkey: { list: vi.fn(), update: vi.fn(), delete: vi.fn() },
      mfa: {
        enroll: vi.fn(), challengeAndVerify: vi.fn(), listFactors: vi.fn(),
        unenroll: vi.fn(), getAuthenticatorAssuranceLevel: vi.fn(),
      },
    },
  };
  return {
    client,
    store: { fetchMyIdCard: vi.fn(), issueIdCardRpc: vi.fn() },
    authCtx: {
      user: { id: 'student-1', fullName: 'Ada Lovelace', email: 'ada@example.com', avatar: null },
      login: vi.fn(),
      loginWithPasskey: vi.fn(),
      needsSecondFactor: vi.fn(),
      completeTotpLogin: vi.fn(),
      updateProfile: vi.fn(),
    },
  };
});

vi.mock('../lib/supabase', () => ({
  requireSb: () => mocks.client,
  friendlyError: (err, fallback) => err?.message || fallback || 'Something went wrong',
  publicUrl: (bucket, p) => `https://cdn.test/${bucket}/${p}`,
}));
vi.mock('../lib/store', () => mocks.store);
vi.mock('../context/AuthContext', () => ({ useAuth: () => mocks.authCtx }));
vi.mock('../context/LMSContext', () => ({ useLMS: () => ({ categories: ['Web Development', 'Graphic Design'] }) }));

import {
  PASSKEY_PRIVACY_NOTE, deviceLabel, isPasskeySupported, listPasskeys, registerPasskey, signInWithPasskey,
} from '../lib/passkeys';
import { assuranceLevel, enrollTotp, listFactors, verifyTotp } from '../lib/mfa';
import { useStudentIdCard } from '../lib/useStudentIdCard';
import StudentIdCard from '../components/student/StudentIdCard';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

/** Every source file the browser ships. */
function sourceFiles(dir = 'src') {
  const out = [];
  const walk = (d) => {
    for (const entry of fs.readdirSync(path.join(process.cwd(), d), { withFileTypes: true })) {
      const rel = path.join(d, entry.name);
      if (entry.isDirectory()) walk(rel);
      else if (/\.(js|jsx|mjs|ts|tsx)$/.test(entry.name)) out.push(rel);
    }
  };
  walk(dir);
  return out;
}

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.authCtx.user = { id: 'student-1', fullName: 'Ada Lovelace', email: 'ada@example.com', avatar: null, onboarded: false };
  mocks.authCtx.updateProfile.mockReset();
  mocks.authCtx.updateProfile.mockImplementation(async (patch) => {
    if (patch?.avatarFile) mocks.authCtx.user = { ...mocks.authCtx.user, avatar: 'student-1/avatar.png' };
    return mocks.authCtx.user;
  });
});
afterEach(() => { delete window.PublicKeyCredential; });

// ================================================================== secret hygiene
describe('service-role key guardrail', () => {
  it('keeps every service-role secret out of the frontend', () => {
    // Comments and UI copy are allowed to *warn about* the service key; what may
    // never appear is code that reads or embeds one. So comments are stripped
    // before the scan, and the patterns target values rather than prose.
    const stripComments = (src) => src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:'"\\])\/\/.*$/gm, '$1');

    const offenders = [];
    for (const file of sourceFiles('src')) {
      const code = stripComments(read(file));
      if (/import\.meta\.env\.\w*SERVICE\w*/i.test(code)) offenders.push(`${file}: reads a service-role env var`);
      if (/service[_-]?role\w*\s*[:=]\s*['"`]/i.test(code)) offenders.push(`${file}: assigns a service-role value`);
      if (/createClient\([^)]*SERVICE/i.test(code)) offenders.push(`${file}: client built with a service key`);
      // A hardcoded JWT (header.payload.signature) is a leaked key either way.
      if (/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/.test(code)) offenders.push(`${file}: hardcoded JWT`);
    }
    expect(offenders).toEqual([]);
  });

  it('only ever reads the anon key, and enables the passkey methods', () => {
    const src = read('src/lib/supabase.js');
    expect(src).toMatch(/VITE_SUPABASE_ANON_KEY/);
    // Without this flag every auth.passkey/signInWithPasskey call throws.
    expect(src).toMatch(/experimental:\s*\{\s*passkey:\s*true\s*\}/);
  });

  it('documents the boundary in the published env template', () => {
    const env = read('.env.example');
    expect(env).toMatch(/VITE_SUPABASE_ANON_KEY/);
    expect(env.toLowerCase()).toMatch(/service[- _]role/);   // warned about, never set
    expect(env).not.toMatch(/^\s*VITE_SUPABASE_SERVICE_ROLE_KEY=.+/m);
  });
});

// ======================================================================= passkeys
describe('passkeys (WebAuthn) through Supabase Auth', () => {
  it('does not advertise passkeys on a browser without WebAuthn', async () => {
    expect(isPasskeySupported()).toBe(false);
    const res = await signInWithPasskey();
    expect(res.error?.message).toMatch(/cannot use passkeys/i);
    expect(mocks.client.auth.signInWithPasskey).not.toHaveBeenCalled();
  });

  it('signs in through the Supabase ceremony and hands back the session', async () => {
    window.PublicKeyCredential = { isUserVerifiableAuthenticatorAvailable: async () => true };
    Object.defineProperty(window.navigator, 'credentials', {
      configurable: true, value: { get: async () => ({}), create: async () => ({}) },
    });
    expect(isPasskeySupported()).toBe(true);
    mocks.client.auth.signInWithPasskey.mockResolvedValue({ data: { user: { id: 'student-1' } }, error: null });
    const res = await signInWithPasskey();
    expect(res.error).toBeNull();
    expect(res.data.user.id).toBe('student-1');
  });

  it('turns a cancelled ceremony into something a student can act on', async () => {
    window.PublicKeyCredential = { isUserVerifiableAuthenticatorAvailable: async () => true };
    Object.defineProperty(window.navigator, 'credentials', {
      configurable: true, value: { get: async () => ({}), create: async () => ({}) },
    });
    mocks.client.auth.signInWithPasskey.mockResolvedValue({ data: null, error: { message: 'NotAllowedError: The operation was cancelled.' } });
    const res = await signInWithPasskey();
    expect(res.error?.message).toMatch(/cancelled|password/i);
    expect(res.error?.message).not.toMatch(/NotAllowedError/);
  });

  it('registers a passkey and names it after the device', async () => {
    window.PublicKeyCredential = { isUserVerifiableAuthenticatorAvailable: async () => true };
    Object.defineProperty(window.navigator, 'credentials', {
      configurable: true, value: { get: async () => ({}), create: async () => ({}) },
    });
    mocks.client.auth.registerPasskey.mockResolvedValue({ data: { id: 'pk-1' }, error: null });
    mocks.client.auth.passkey.update.mockResolvedValue({ data: { id: 'pk-1' }, error: null });
    const created = await registerPasskey('Chrome on Android');
    expect(created.id).toBe('pk-1');
    expect(mocks.client.auth.passkey.update).toHaveBeenCalledWith({ passkeyId: 'pk-1', friendlyName: 'Chrome on Android' });
  });

  it('lists passkeys as credential ids and labels — never biometric material', async () => {
    mocks.client.auth.passkey.list.mockResolvedValue({
      data: [{ id: 'pk-1', friendly_name: 'Chrome on Android', created_at: '2026-10-01', last_used_at: null }],
      error: null,
    });
    const list = await listPasskeys();
    expect(list[0]).toMatchObject({ id: 'pk-1', friendly_name: 'Chrome on Android' });
    expect(JSON.stringify(list)).not.toMatch(/biometric|fingerprint|face/i);
  });

  it('collects no biometric data anywhere in the passkey or login flow', () => {
    const passkeys = read('src/lib/passkeys.js');
    expect(passkeys).not.toMatch(/getUserMedia|mediaDevices|fingerprintSensor|faceData|biometricTemplate/i);
    // The UI says so out loud, in the words a student reads.
    expect(PASSKEY_PRIVACY_NOTE).toMatch(/never leaves this device/i);
    expect(read('src/pages/Login.jsx')).toContain('PASSKEY_PRIVACY_NOTE');
    expect(read('src/pages/Security.jsx')).toContain('PASSKEY_PRIVACY_NOTE');
  });

  it('labels a device from the browser string, not a fingerprinting script', () => {
    expect(deviceLabel('Mozilla/5.0 (Linux; Android 14) Chrome/126')).toBe('Chrome on Android');
    expect(deviceLabel('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Safari/604')).toBe('Safari on iPhone');
    expect(deviceLabel('')).toBe('Browser on this device');
  });
});

// =========================================================== Google Authenticator
describe('optional Google Authenticator (TOTP)', () => {
  it('enrolls a factor and hands the UI a QR code plus setup key', async () => {
    mocks.client.auth.mfa.enroll.mockResolvedValue({
      data: { id: 'factor-1', type: 'totp', totp: { qr_code: 'data:image/svg+xml;base64,QQ==', secret: 'JBSWY3DPEHPK3PXP', uri: 'otpauth://totp/x' } },
      error: null,
    });
    const res = await enrollTotp();
    expect(res).toMatchObject({ factorId: 'factor-1', secret: 'JBSWY3DPEHPK3PXP', uri: 'otpauth://totp/x' });
    expect(res.qrCode).toMatch(/^data:image\/svg/);
  });

  it('refuses a malformed code before talking to the server', async () => {
    await expect(verifyTotp('12345')).rejects.toThrow(/6-digit/);
    await expect(verifyTotp('abcdef')).rejects.toThrow(/6-digit/);
    expect(mocks.client.auth.mfa.challengeAndVerify).not.toHaveBeenCalled();
  });

  it('verifies against the enrolled factor and steps the session up', async () => {
    mocks.client.auth.mfa.listFactors.mockResolvedValue({
      data: { all: [{ id: 'factor-1', factor_type: 'totp', status: 'verified' }] }, error: null,
    });
    mocks.client.auth.mfa.challengeAndVerify.mockResolvedValue({
      data: { access_token: 'jwt', user: { id: 'student-1' } }, error: null,
    });
    const res = await verifyTotp(' 123 456 ');
    expect(mocks.client.auth.mfa.challengeAndVerify).toHaveBeenCalledWith({ factorId: 'factor-1', code: '123456' });
    expect(res.user.id).toBe('student-1');
  });

  it('reports when a password login still needs its second factor', async () => {
    mocks.client.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal1', nextLevel: 'aal2', currentAuthenticationMethods: ['password'] }, error: null,
    });
    expect((await assuranceLevel()).needsSecondFactor).toBe(true);

    mocks.client.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: 'aal2', nextLevel: 'aal2' }, error: null,
    });
    expect((await assuranceLevel()).needsSecondFactor).toBe(false);

    const { all, verified } = await listFactors();
    expect(all).toHaveLength(1);
    expect(verified).toHaveLength(1);
  });

  it('asks for the code after a password sign-in when a factor exists', async () => {
    mocks.authCtx.needsSecondFactor.mockResolvedValue(true);
    mocks.authCtx.login.mockResolvedValue({ id: 'student-1', fullName: 'Ada Lovelace' });
    const Login = (await import('../pages/Login')).default;
    render(<MemoryRouter><Login /></MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /^LOGIN/ }));

    expect(await screen.findByText('TWO-STEP VERIFICATION')).toBeTruthy();
    // The password alone did not log anybody in.
    expect(mocks.authCtx.login).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText('123456'), { target: { value: '654321' } });
    fireEvent.click(screen.getByRole('button', { name: /VERIFY & CONTINUE/ }));
    await waitFor(() => expect(mocks.authCtx.completeTotpLogin).toHaveBeenCalledWith('654321'));
  });

  it('signs in straight away when the account has no second factor', async () => {
    mocks.authCtx.needsSecondFactor.mockResolvedValue(false);
    mocks.authCtx.login.mockResolvedValue({ id: 'student-1', fullName: 'Ada Lovelace', role: 'student', onboarded: true });
    const Login = (await import('../pages/Login')).default;
    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /^LOGIN/ }));
    await waitFor(() => expect(mocks.authCtx.login).toHaveBeenCalledWith('ada@example.com', 'secret123'));
    expect(screen.queryByText('TWO-STEP VERIFICATION')).toBeNull();
  });
});

// ================================================================ student ID card
describe('student ID card', () => {
  const renderCard = (props) => render(<StudentIdCard {...props} />);

  it('shows "upload a photo to generate your ID" when there is no photo', () => {
    renderCard({ card: null, status: 'need-photo', error: '', issuing: false });
    expect(screen.getByText('Upload a photo to generate your ID')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'UPLOAD A PHOTO' })).toBeTruthy();
    // Nothing that looks like an issued card.
    expect(screen.queryByText(/WDTH-\d{4}-\d{6}/)).toBeNull();
  });

  it('offers to issue the card once a photo exists', async () => {
    const onIssue = vi.fn();
    renderCard({ card: null, status: 'unissued', error: '', issuing: false, onIssue });
    fireEvent.click(screen.getByRole('button', { name: /GENERATE MY STUDENT ID/ }));
    expect(onIssue).toHaveBeenCalled();
  });

  it('displays the card exactly as the backend issued it', () => {
    renderCard({
      card: {
        id: 'card-1', cardNumber: 'WDTH-2026-481902', fullName: 'Ada Lovelace',
        photoPath: 'student-1/avatar.png', programme: 'Digital Skills',
        issuedAt: '2026-10-05T09:00:00.000Z', status: 'active',
      },
      status: 'ready', error: '', issuing: false,
    });
    expect(screen.getByText('WDTH-2026-481902')).toBeTruthy();
    expect(screen.getByText('Ada Lovelace')).toBeTruthy();
    expect(screen.getByText('VERIFIED')).toBeTruthy();
    expect(screen.getByAltText('Ada Lovelace').getAttribute('src')).toContain('avatars/student-1/avatar.png');
  });

  it('surfaces the server refusal instead of inventing a card', () => {
    renderCard({
      card: null, status: 'need-photo', issuing: false,
      error: 'Upload a profile photo to generate your ID card',
    });
    expect(screen.getByText('Upload a profile photo to generate your ID card')).toBeTruthy();
  });

  it('drives its states from the database row, not from local guesses', async () => {
    const states = [];
    function Probe({ user }) {
      const hook = useStudentIdCard(user);
      states.push(hook.status);
      return <div data-testid="status">{hook.status}</div>;
    }

    // 1 — no photo on the profile yet
    mocks.store.fetchMyIdCard.mockResolvedValue(null);
    const first = render(<Probe user={{ id: 'student-1', avatar: null }} />);
    await waitFor(() => expect(first.getByTestId('status').textContent).toBe('need-photo'));
    first.unmount();

    // 2 — photo present, card not issued yet
    const second = render(<Probe user={{ id: 'student-1', avatar: 'student-1/avatar.png' }} />);
    await waitFor(() => expect(second.getByTestId('status').textContent).toBe('unissued'));
    second.unmount();

    // 3 — the backend has issued it
    mocks.store.fetchMyIdCard.mockResolvedValue({
      id: 'card-1', cardNumber: 'WDTH-2026-481902', fullName: 'Ada Lovelace', status: 'active',
    });
    const third = render(<Probe user={{ id: 'student-1', avatar: 'student-1/avatar.png' }} />);
    await waitFor(() => expect(third.getByTestId('status').textContent).toBe('ready'));
    third.unmount();

    expect(states).toContain('loading');
    expect(states.filter((s) => s === 'ready')).toHaveLength(1);
  });

  it('asks the server to mint the card and reports its answer', async () => {
    mocks.store.fetchMyIdCard.mockResolvedValue(null);
    mocks.store.issueIdCardRpc.mockRejectedValue(new Error('Upload a profile photo to generate your ID card'));
    function Probe({ user }) {
      const { status, error, issue } = useStudentIdCard(user);
      return (
        <div>
          <span data-testid="status">{status}</span>
          <span data-testid="error">{error}</span>
          <button onClick={issue}>issue</button>
        </div>
      );
    }
    const view = render(<Probe user={{ id: 'student-1', avatar: null }} />);
    fireEvent.click(view.getByText('issue'));
    await waitFor(() => expect(view.getByTestId('status').textContent).toBe('need-photo'));
    expect(view.getByTestId('error').textContent).toMatch(/Upload a profile photo/);
    expect(mocks.store.issueIdCardRpc).toHaveBeenCalled();
  });

  it('issues the card as soon as the signup photo is saved', async () => {
    mocks.store.fetchMyIdCard.mockResolvedValue(null);
    mocks.store.issueIdCardRpc.mockResolvedValue({
      id: 'card-1', cardNumber: 'WDTH-2026-481902', fullName: 'Ada Lovelace',
      photoPath: 'student-1/avatar.png', programme: 'Digital Skills', status: 'active', reissued: true,
    });
    const Onboarding = (await import('../pages/Onboarding')).default;
    render(<MemoryRouter><Onboarding /></MemoryRouter>);

    // Walk the three personalisation steps to reach the photo step.
    fireEvent.click(await screen.findByText('Web Development'));
    fireEvent.click(screen.getByRole('button', { name: /CONTINUE/ }));
    fireEvent.click(await screen.findByRole('button', { name: /CONTINUE/ }));
    fireEvent.click(await screen.findByRole('button', { name: /CONTINUE TO MY ID/ }));

    // The honest pending state is on screen before any upload.
    expect(await screen.findByText('Upload a photo to generate your ID')).toBeTruthy();
    expect(mocks.store.issueIdCardRpc).not.toHaveBeenCalled();

    const file = new File(['photo'], 'me.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText ? document.querySelector('input[type="file"]') : document.querySelector('input[type="file"]'), { target: { files: [file] } });

    // Saving the photo stores it on the profile AND mints the card — no extra click.
    await waitFor(() => expect(mocks.authCtx.updateProfile).toHaveBeenCalledWith({ avatarFile: file }));
    await waitFor(() => expect(mocks.store.issueIdCardRpc).toHaveBeenCalled());
    expect(await screen.findByText('WDTH-2026-481902')).toBeTruthy();
  });

  it('asks for the photo during onboarding, right after registration', () => {
    const src = read('src/pages/Onboarding.jsx');
    expect(src).toMatch(/StudentIdCard/);
    expect(src).toMatch(/avatarFile/);
    expect(src).toMatch(/Your student ID/);
    // Registration sends the student there instead of straight to the dashboard.
    expect(read('src/pages/Register.jsx')).toMatch(/onboarding/);
  });
});
