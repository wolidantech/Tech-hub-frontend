// ============================================================
// Optional second factor: TOTP (Google Authenticator / Authy / 1Password).
//
// Supabase Auth owns the secret and the verification. This module only wires the
// ceremony to the UI:
//   enroll  → QR code + secret to scan into the authenticator app
//   verify  → the 6-digit code the app shows
//   aal     → whether the current session still needs the second factor
//
// The secret is displayed ONCE during enrollment and is never persisted by this
// app; after verification the browser holds a normal session token.
// ============================================================
import { requireSb, friendlyError } from './supabase';

const sb = () => requireSb();

export const TOTP_HELP =
  'Scan the QR code with Google Authenticator (or Authy, 1Password, Microsoft Authenticator), '
  + 'then enter the 6-digit code it shows. Keep the setup key somewhere safe in case you change phones.';

const codeError = (err) => {
  const msg = String(err?.message || '');
  if (/invalid.*code|otp.*invalid|challenge.*expired|expired/i.test(msg)) {
    return 'That code did not work or has expired. Codes change every 30 seconds — try the newest one.';
  }
  return friendlyError(err, 'Could not verify that code.');
};

/**
 * Start TOTP enrollment. Returns `{ factorId, secret, uri, qrCode }` where
 * `qrCode` is an SVG data URL that can be dropped straight into an <img>.
 */
export async function enrollTotp(friendlyName = 'Woli Dan Tech Hub') {
  const { data, error } = await sb().auth.mfa.enroll({ factorType: 'totp', friendlyName });
  if (error) throw new Error(friendlyError(error, 'Could not start authenticator setup.'));
  return {
    factorId: data?.id,
    secret: data?.totp?.secret || '',
    uri: data?.totp?.uri || '',
    qrCode: data?.totp?.qr_code || '',
    friendlyName: data?.friendly_name || friendlyName,
  };
}

/**
 * Verify a 6-digit code against the enrolled factor and step the session up to
 * AAL2. `factorId` is optional — without it the first verified TOTP factor is
 * used, which is what a login prompt needs.
 */
export async function verifyTotp(code, factorId = null) {
  const trimmed = String(code || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(trimmed)) throw new Error('Enter the 6-digit code from your authenticator app.');
  const id = factorId || (await firstVerifiedTotpId());
  if (!id) throw new Error('No authenticator is set up on this account yet.');
  const { data, error } = await sb().auth.mfa.challengeAndVerify({ factorId: id, code: trimmed });
  if (error) throw new Error(codeError(error));
  return data;
}

/** The account's factors, split into what the UI needs. */
export async function listFactors() {
  const { data, error } = await sb().auth.mfa.listFactors();
  if (error) throw new Error(friendlyError(error, 'Could not load your security settings.'));
  const all = data?.all || [];
  const totp = all.filter((f) => String(f.factor_type || f.type) === 'totp');
  return { all, totp, verified: totp.filter((f) => f.status === 'verified'), unverified: totp.filter((f) => f.status !== 'verified') };
}

export async function unenrollTotp(factorId) {
  const { error } = await sb().auth.mfa.unenroll({ factorId });
  if (error) throw new Error(friendlyError(error, 'Could not remove that authenticator.'));
  return true;
}

/**
 * `{ currentLevel, nextLevel, needsSecondFactor }` — after a password sign-in,
 * `nextLevel === 'aal2'` means the account has a verified second factor and the
 * session must be stepped up before it can be used.
 */
export async function assuranceLevel() {
  try {
    const { data, error } = await sb().auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) return { currentLevel: null, nextLevel: null, needsSecondFactor: false };
    return {
      currentLevel: data?.currentLevel || null,
      nextLevel: data?.nextLevel || null,
      needsSecondFactor: Boolean(data?.nextLevel && data.nextLevel !== data.currentLevel),
    };
  } catch {
    return { currentLevel: null, nextLevel: null, needsSecondFactor: false };
  }
}

async function firstVerifiedTotpId() {
  const { verified } = await listFactors();
  return verified[0]?.id || null;
}
