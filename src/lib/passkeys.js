// ============================================================
// Passkeys (WebAuthn) — Supabase Auth handles the ceremony.
//
// WHAT THIS DOES NOT DO: it never collects, transmits or stores biometric data.
// A passkey keeps the fingerprint / Face ID / device PIN on the device; the
// browser only ever hands Supabase a signed assertion. What the server stores is
// a credential id and a public key — nothing that can identify a finger or face.
// `deviceLabel()` below is a human-readable hint built from the browser's own
// user-agent string (not a fingerprinting script, and not stored server-side).
//
// The client must be created with `auth.experimental.passkey: true`
// (see src/lib/supabase.js); every method here surfaces a readable message when
// the browser, the authenticator or the project cannot complete the ceremony.
// ============================================================
import { requireSb, friendlyError } from './supabase';

const sb = () => requireSb();

export const PASSKEY_PRIVACY_NOTE =
  'Your fingerprint, face or device PIN never leaves this device. We store only a '
  + 'credential ID and a public key — no biometric data is collected, sent or saved.';

export function isPasskeySupported() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return Boolean(window.PublicKeyCredential)
    && typeof navigator.credentials?.get === 'function'
    && typeof navigator.credentials?.create === 'function';
}

/** Can this device actually verify the user (platform authenticator / security key)? */
export async function isPasskeyAvailable() {
  if (!isPasskeySupported()) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifiableAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * A short label for the device the passkey lives on, e.g. "Chrome on Android".
 * Built from the user-agent the browser already sends — deliberately not a
 * fingerprint, and used only to name a row in the passkey list.
 */
export function deviceLabel(ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '')) {
  const agent = String(ua || '');
  const platform = /android/i.test(agent) ? 'Android'
    : /iphone|ipad|ipod/i.test(agent) ? 'iPhone'
      : /windows/i.test(agent) ? 'Windows'
        : /mac os x/i.test(agent) ? 'Mac'
          : /linux/i.test(agent) ? 'Linux' : 'this device';
  const browser = /edg\//i.test(agent) ? 'Edge'
    : /chrome\//i.test(agent) ? 'Chrome'
      : /safari\//i.test(agent) ? 'Safari'
        : /firefox\//i.test(agent) ? 'Firefox' : 'Browser';
  return `${browser} on ${platform}`;
}

function friendly(err, fallback) {
  const msg = String(err?.message || '');
  if (/does not support webauthn|not supported/i.test(msg)) {
    return 'This browser cannot use passkeys. Use Chrome, Safari, Edge or Firefox on a recent phone or laptop — or log in with your password.';
  }
  if (/not allowed|NotAllowedError|cancelled|canceled|timeout|timed out/i.test(msg)) {
    return 'The passkey prompt was cancelled or timed out. Try again, or use your password.';
  }
  if (/no.*passkey|not found|no credential|not registered/i.test(msg)) {
    return 'No passkey found on this device yet. Add one from Account → Security, or log in with your password.';
  }
  if (/security|origin|https/i.test(msg)) {
    return 'Passkeys need a secure (https) connection on this domain. Log in with your password instead.';
  }
  return friendlyError(err, fallback);
}

/**
 * Sign in with a passkey: Supabase issues the challenge, the browser runs the
 * WebAuthn ceremony (Face ID / fingerprint / device PIN / security key) and the
 * server verifies it. Returns the same `{ data: { session, user }, error }`
 * shape as the other sign-in methods.
 */
export async function signInWithPasskey() {
  if (!isPasskeySupported()) {
    return { data: null, error: new Error('This browser cannot use passkeys. Please log in with your password.') };
  }
  try {
    const res = await sb().auth.signInWithPasskey();
    if (res?.error) return { data: null, error: new Error(friendly(res.error, 'Passkey sign-in failed.')) };
    return { data: res?.data || null, error: null };
  } catch (err) {
    return { data: null, error: new Error(friendly(err, 'Passkey sign-in failed.')) };
  }
}

/**
 * Register a passkey for the signed-in student. Returns the created passkey
 * metadata `{ id, friendly_name, created_at }`.
 */
export async function registerPasskey(name = deviceLabel()) {
  if (!isPasskeySupported()) throw new Error('This browser cannot create passkeys. Try Chrome, Safari, Edge or Firefox.');
  try {
    const { data, error } = await sb().auth.registerPasskey();
    if (error) throw new Error(friendly(error, 'Could not add that passkey.'));
    const created = data || {};
    if (created.id && name) {
      // The ceremony does not take a label, so name it right after.
      const { error: renameError } = await sb().auth.passkey.update({ passkeyId: created.id, friendlyName: name });
      if (renameError) return { ...created, friendly_name: created.friendly_name || name };
    }
    return { ...created, friendly_name: created.friendly_name || name };
  } catch (err) {
    if (err instanceof Error && /cannot create passkeys|passkey prompt|secure \(https\)/i.test(err.message)) throw err;
    throw new Error(friendly(err, 'Could not add that passkey.'));
  }
}

/** The student's registered passkeys (credential ids + labels only). */
export async function listPasskeys() {
  try {
    const { data, error } = await sb().auth.passkey.list();
    if (error) throw new Error(friendlyError(error, 'Could not load your passkeys.'));
    return data || [];
  } catch (err) {
    // Older clients without auth.passkey.* — treat as "none listed" rather than
    // breaking the security page.
    if (/undefined|not a function/i.test(String(err?.message))) return [];
    throw err;
  }
}

export async function renamePasskey(passkeyId, friendlyName) {
  const { data, error } = await sb().auth.passkey.update({ passkeyId, friendlyName });
  if (error) throw new Error(friendlyError(error, 'Could not rename that passkey.'));
  return data;
}

export async function deletePasskey(passkeyId) {
  const { error } = await sb().auth.passkey.delete({ passkeyId });
  if (error) throw new Error(friendlyError(error, 'Could not remove that passkey.'));
  return true;
}
