// LocalStorage based DB for frontend-only LMS (production-ready architecture, swappable with API)

const KEYS = {
  USERS: 'wdth_users',
  CURRENT_USER: 'wdth_current_user',
  COURSES: 'wdth_courses_custom',
  ENROLLMENTS: 'wdth_enrollments',
  PAYMENTS: 'wdth_payments',
  MANUAL_PAYMENTS: 'wdth_manual_payments',
  PROGRESS: 'wdth_progress',
  CERTIFICATES: 'wdth_certificates',
  NOTIFICATIONS: 'wdth_notifications',
};

export const getStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const setStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const storageKeys = KEYS;

// Users
export const getUsers = () => getStorage(KEYS.USERS, []);
export const saveUsers = (users) => setStorage(KEYS.USERS, users);

// Enrollments
export const getEnrollments = () => getStorage(KEYS.ENROLLMENTS, []);
export const saveEnrollments = (data) => setStorage(KEYS.ENROLLMENTS, data);

// Payments (legacy auto)
export const getPayments = () => getStorage(KEYS.PAYMENTS, []);
export const savePayments = (data) => setStorage(KEYS.PAYMENTS, data);

// Manual Bank Transfer Payments
export const getManualPayments = () => getStorage(KEYS.MANUAL_PAYMENTS, []);
export const saveManualPayments = (data) => setStorage(KEYS.MANUAL_PAYMENTS, data);

// Progress: { [userId_courseId]: { completedLessons: [], lastLessonId, progress } }
export const getProgressMap = () => getStorage(KEYS.PROGRESS, {});
export const saveProgressMap = (data) => setStorage(KEYS.PROGRESS, data);

// Certificates
export const getCertificates = () => getStorage(KEYS.CERTIFICATES, []);
export const saveCertificates = (data) => setStorage(KEYS.CERTIFICATES, data);

// Notifications
export const getNotifications = () => getStorage(KEYS.NOTIFICATIONS, []);
export const saveNotifications = (data) => setStorage(KEYS.NOTIFICATIONS, data);

// Courses custom overrides (price edits, new courses)
export const getCustomCourses = () => getStorage(KEYS.COURSES, null);
export const saveCustomCourses = (data) => setStorage(KEYS.COURSES, data);

// Current user session
export const getCurrentUser = () => getStorage(KEYS.CURRENT_USER, null);
export const setCurrentUser = (user) => setStorage(KEYS.CURRENT_USER, user);
export const clearCurrentUser = () => localStorage.removeItem(KEYS.CURRENT_USER);

export const generateId = () => Math.random().toString(36).slice(2, 10).toUpperCase();
export const generateCertId = () => `WDTH-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
export const generatePaymentRef = () => `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

// Bank details - single source of truth
export const BANK_DETAILS = {
  bankName: 'MONIEPOINT',
  accountNumber: '69852663361',
  accountName: 'LUNA ENTRY SERVICES- WOLI DAN TECH HUB',
};
