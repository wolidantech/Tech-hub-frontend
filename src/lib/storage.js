// LocalStorage based DB for frontend-only LMS (production-ready architecture, swappable with API/Supabase)
// NOTE: When Supabase is configured (see src/lib/supabase.js + supabase/migrations),
// these keys act as a local cache/offline layer. Table names mirror the SQL schema.

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
  // --- LMS extensions (mirror supabase tables) ---
  CATEGORIES: 'wdth_categories',
  QUIZZES: 'wdth_quizzes',
  QUIZ_QUESTIONS: 'wdth_quiz_questions',
  QUIZ_ATTEMPTS: 'wdth_quiz_attempts',
  ASSIGNMENTS: 'wdth_assignments',
  ASSIGNMENT_SUBMISSIONS: 'wdth_assignment_submissions',
  COUPONS: 'wdth_coupons',
  COUPON_REDEMPTIONS: 'wdth_coupon_redemptions',
  AI_JOBS: 'wdth_ai_jobs',
  AI_CONTENT: 'wdth_ai_content',
  COMPLETION_RULES: 'wdth_completion_rules',
  AUDIT_LOGS: 'wdth_audit_logs',
  ANNOUNCEMENTS: 'wdth_announcements',
  COURSE_VIEWS: 'wdth_course_views',
  LEARNING_EVENTS: 'wdth_learning_events',
  CERT_TEMPLATES: 'wdth_cert_templates',
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
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Quota guard: drop oldest learning events and retry once
    if (key !== KEYS.LEARNING_EVENTS) {
      try {
        localStorage.removeItem(KEYS.LEARNING_EVENTS);
        localStorage.setItem(key, JSON.stringify(value));
      } catch { /* storage full; ignore */ }
    }
  }
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

// --- LMS extension accessors ---
export const getCategories = () => getStorage(KEYS.CATEGORIES, null);
export const saveCategories = (data) => setStorage(KEYS.CATEGORIES, data);
export const getQuizzes = () => getStorage(KEYS.QUIZZES, []);
export const saveQuizzes = (data) => setStorage(KEYS.QUIZZES, data);
export const getQuizQuestions = () => getStorage(KEYS.QUIZ_QUESTIONS, []);
export const saveQuizQuestions = (data) => setStorage(KEYS.QUIZ_QUESTIONS, data);
export const getQuizAttempts = () => getStorage(KEYS.QUIZ_ATTEMPTS, []);
export const saveQuizAttempts = (data) => setStorage(KEYS.QUIZ_ATTEMPTS, data);
export const getAssignments = () => getStorage(KEYS.ASSIGNMENTS, []);
export const saveAssignments = (data) => setStorage(KEYS.ASSIGNMENTS, data);
export const getSubmissions = () => getStorage(KEYS.ASSIGNMENT_SUBMISSIONS, []);
export const saveSubmissions = (data) => setStorage(KEYS.ASSIGNMENT_SUBMISSIONS, data);
export const getCoupons = () => getStorage(KEYS.COUPONS, []);
export const saveCoupons = (data) => setStorage(KEYS.COUPONS, data);
export const getRedemptions = () => getStorage(KEYS.COUPON_REDEMPTIONS, []);
export const saveRedemptions = (data) => setStorage(KEYS.COUPON_REDEMPTIONS, data);
export const getAIJobs = () => getStorage(KEYS.AI_JOBS, []);
export const saveAIJobs = (data) => setStorage(KEYS.AI_JOBS, data);
export const getAIContent = () => getStorage(KEYS.AI_CONTENT, []);
export const saveAIContent = (data) => setStorage(KEYS.AI_CONTENT, data);
export const getCompletionRules = () => getStorage(KEYS.COMPLETION_RULES, {});
export const saveCompletionRules = (data) => setStorage(KEYS.COMPLETION_RULES, data);
export const getAuditLogs = () => getStorage(KEYS.AUDIT_LOGS, []);
export const saveAuditLogs = (data) => setStorage(KEYS.AUDIT_LOGS, []);
export const getAnnouncements = () => getStorage(KEYS.ANNOUNCEMENTS, []);
export const saveAnnouncements = (data) => setStorage(KEYS.ANNOUNCEMENTS, data);
export const getCourseViews = () => getStorage(KEYS.COURSE_VIEWS, []);
export const saveCourseViews = (data) => setStorage(KEYS.COURSE_VIEWS, data);
export const getLearningEvents = () => getStorage(KEYS.LEARNING_EVENTS, []);
export const saveLearningEvents = (data) => setStorage(KEYS.LEARNING_EVENTS, data);
export const getCertTemplates = () => getStorage(KEYS.CERT_TEMPLATES, null);
export const saveCertTemplates = (data) => setStorage(KEYS.CERT_TEMPLATES, data);

// Current user session
export const getCurrentUser = () => getStorage(KEYS.CURRENT_USER, null);
export const setCurrentUser = (user) => setStorage(KEYS.CURRENT_USER, user);
export const clearCurrentUser = () => localStorage.removeItem(KEYS.CURRENT_USER);

export const generateId = () => Math.random().toString(36).slice(2, 10).toUpperCase();
export const generateCertId = () => `WDTH-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
export const generateVerificationCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  const arr = new Uint32Array(8);
  try { crypto.getRandomValues(arr); for (let i = 0; i < 8; i++) s += chars[arr[i] % chars.length]; }
  catch { for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]; }
  return `WDTH-${s.slice(0, 4)}-${s.slice(4)}`;
};
export const generatePaymentRef = () => `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
export const generateCouponCode = (prefix = 'WOLI') => `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

// Bank details - single source of truth
export const BANK_DETAILS = {
  bankName: 'MONIEPOINT',
  accountNumber: '69852663361',
  accountName: 'LUNA ENTRY SERVICES- WOLI DAN TECH HUB',
};
