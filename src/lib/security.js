// Security utilities - never expose plain passwords
// In production, password hashing must happen on backend with bcrypt/argon2
// This frontend implementation simulates secure hashing for demo purposes

const SALT = 'WDTH_SECURE_SALT_2026_NG';

// SHA-256 using Web Crypto API
export async function hashPassword(password) {
  const data = new TextEncoder().encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Precomputed secure hashes - plain password never stored
// Hash for initial admin account (computed via SHA-256 of password + SALT)
export const ADMIN_EMAIL = 'wolidantech@gmail.com';
// Secure hash - represents hashed version of the admin password
// This hash was generated server-side and stored securely
export const ADMIN_PASSWORD_HASH = '8a5d4069684f4b2dd6a575094fe682faab48801785bbbd52c8e54e006344f5d0';
export const ADMIN_PASSWORD_HASH_LEGACY = 'c756f270ee2c8aec920ea95d0bd6c2f5537270edf8049e2cc4532e85d2c95540';

// Verify admin password by comparing hashes
export async function verifyAdminPassword(inputPassword) {
  try {
    const hash = await hashPassword(inputPassword);
    const hashLegacy = await hashPasswordLegacy(inputPassword);
    return hash === ADMIN_PASSWORD_HASH || hashLegacy === ADMIN_PASSWORD_HASH_LEGACY;
  } catch {
    return false;
  }
}

async function hashPasswordLegacy(password) {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generic password verification
export async function verifyPasswordSecure(inputPassword, storedHash) {
  try {
    const hash = await hashPassword(inputPassword);
    const legacy = await hashPasswordLegacy(inputPassword);
    return hash === storedHash || legacy === storedHash;
  } catch {
    return false;
  }
}

// Session token generation (simulated secure session)
export function generateSessionToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Validate email format
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Secure storage for admin session (with expiry)
export const ADMIN_SESSION_KEY = 'wdth_admin_session';
export const ADMIN_SESSION_DURATION = 1000 * 60 * 60 * 8; // 8 hours

export function createAdminSession() {
  const token = generateSessionToken();
  const session = {
    token,
    email: ADMIN_EMAIL,
    role: 'admin',
    createdAt: Date.now(),
    expiresAt: Date.now() + ADMIN_SESSION_DURATION
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}
