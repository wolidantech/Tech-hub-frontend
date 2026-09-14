// Shared LMS business logic.
// IMPORTANT SECURITY NOTE: coupon validation, completion checks and certificate
// issuance MUST be enforced server-side in production (see supabase/ + server/).
// These functions are written backend-agnostic so the SAME code can run on the
// server gateway AND as an optimistic client. Never trust client-only results.

export const SUBMISSION_STATUSES = ['submitted', 'under_review', 'approved', 'needs_revision'];
export const AI_CONTENT_STATUSES = ['draft', 'in_review', 'approved', 'published', 'archived'];

export const ALLOWED_SUBMISSION_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png',
  'application/pdf', 'video/mp4', 'application/zip', 'application/x-zip-compressed',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword', 'application/vnd.ms-excel', 'application/vnd.ms-powerpoint',
];
export const MAX_SUBMISSION_BYTES = 25 * 1024 * 1024; // 25MB

export function validateSubmissionFile(file) {
  if (!file) return { ok: false, error: 'No file selected' };
  if (!ALLOWED_SUBMISSION_TYPES.includes(file.type) && !/\.(jpg|jpeg|png|pdf|mp4|zip|docx|pptx|xlsx)$/i.test(file.name)) {
    return { ok: false, error: 'Unsupported file. Allowed: JPG, PNG, PDF, MP4, ZIP, DOCX, PPTX, XLSX' };
  }
  if (file.size > MAX_SUBMISSION_BYTES) return { ok: false, error: 'File too large. Max 25MB' };
  return { ok: true };
}

// ---------- Coupons ----------
/**
 * Pure coupon validation. Mirror this on the backend; the backend is authoritative.
 * coupon: { code, courseId|'ALL', discountType: 'percentage'|'fixed'|'free', discountValue,
 *           maxUses, usedCount, expiresAt, minPurchase, active, restrictedTo: {email?, phone?, userId?} }
 */
export function validateCoupon(coupon, { courseId, coursePrice, user, redemptionCount, now = new Date() }) {
  if (!coupon) return { valid: false, reason: 'Invalid coupon code' };
  if (!coupon.active) return { valid: false, reason: 'This coupon is inactive' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return { valid: false, reason: 'This coupon has expired' };
  if (coupon.courseId !== 'ALL' && coupon.courseId !== courseId) return { valid: false, reason: 'This coupon is not valid for this course' };
  const uses = redemptionCount ?? coupon.usedCount ?? 0;
  if (coupon.maxUses != null && uses >= coupon.maxUses) return { valid: false, reason: 'This coupon has reached its usage limit' };
  if (coupon.minPurchase && coursePrice < coupon.minPurchase) return { valid: false, reason: `This coupon requires a minimum purchase of ₦${coupon.minPurchase.toLocaleString()}` };
  const r = coupon.restrictedTo || {};
  if (r.userId && r.userId !== user?.id) return { valid: false, reason: 'This coupon was issued to another student' };
  if (r.email && r.email.toLowerCase() !== (user?.email || '').toLowerCase()) return { valid: false, reason: 'This coupon was issued to another student' };
  if (r.phone && String(r.phone).replace(/\D/g,'').slice(-10) !== String(user?.phone || '').replace(/\D/g,'').slice(-10)) {
    return { valid: false, reason: 'This coupon was issued to another student' };
  }
  let discount = 0;
  if (coupon.discountType === 'free' || (coupon.discountType === 'percentage' && Number(coupon.discountValue) >= 100)) {
    discount = coursePrice;
  } else if (coupon.discountType === 'percentage') {
    discount = Math.round((coursePrice * Number(coupon.discountValue)) / 100);
  } else {
    discount = Math.min(Number(coupon.discountValue), coursePrice);
  }
  const amountDue = Math.max(0, coursePrice - discount);
  return { valid: true, discount, amountDue, isFree: amountDue === 0 };
}

// ---------- Quizzes ----------
/**
 * Numeric grading — mirrors the server-side `submit_quiz_attempt()` branch in
 * migration 009: strips units/separators and compares with tolerance, so
 * "₦1,200.50", "1200,50 naira" and "1200.5" all grade consistently.
 */
export function gradeNumericAnswer(given, expected, tolerance = 0.0001) {
  if (expected == null || given == null || String(given).trim() === '') return false;
  // Mirror of the server rule (009): remove thousands separators + whitespace,
  // then take the first decimal number. "1,200.5 naira" → 1200.5
  const cleaned = String(given).replace(/\s+/g, '').replace(/,/g, '');
  const m = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!m) return false;
  const n = Number(m[0]);
  if (!Number.isFinite(n)) return false;
  return Math.abs(n - Number(expected)) <= Math.abs(Number(tolerance) || 0.0001);
}

export function scoreQuizAttempt(questions, answers) {
  // answers: { [questionId]: selectedIndex | selectedIndex[] | numeric | text }
  let earned = 0, total = 0;
  const details = questions.map((q) => {
    total += 1;
    const given = answers[q.id];
    let correct = false;
    if (q.type === 'multiple_answer') {
      const a = [...(Array.isArray(given) ? given : [])].sort().join(',');
      const b = [...q.correctAnswers].sort().join(',');
      correct = a === b && a !== '';
    } else if (q.type === 'short_answer') {
      const norm = String(given || '').trim().toLowerCase();
      const accepted = (q.acceptedAnswers || []).map((s) => String(s).trim().toLowerCase()).filter(Boolean);
      correct = norm !== '' && accepted.some((a) => norm === a || norm.includes(a));
    } else if (q.type === 'numeric') {
      correct = gradeNumericAnswer(given, q.answerNumber ?? q.correctAnswer, q.answerTolerance ?? 0.0001);
    } else {
      correct = Number(given) === Number(q.correctAnswer);
    }
    if (correct) earned += 1;
    return { questionId: q.id, correct, given, explanation: q.explanation };
  });
  const pct = total ? Math.round((earned / total) * 100) : 0;
  return { earned, total, score: pct, details };
}

/** Parse "14 min" / "2 hours" / 22 (minutes) into minutes; 0 when unknown. */
export function parseDurationMinutes(v) {
  if (v == null) return 0;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const s = String(v).toLowerCase();
  const h = s.match(/(\d+(?:\.\d+)?)\s*(hour|hr|h)\b/);
  const m = s.match(/(\d+(?:\.\d+)?)\s*(min|minute|m)\b/);
  if (!h && !m) {
    const bare = Number(s);
    return Number.isFinite(bare) && bare > 0 && bare < 100000 ? bare : 0;
  }
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

/** Estimated total study time for a curriculum (course-level override wins). */
export function estimateStudyHours(course) {
  if (!course) return null;
  if (course.estimatedHours) return Number(course.estimatedHours);
  const mins = (course.curriculum || []).reduce((sum, m) => sum + (m.lessons || []).reduce((s2, l) => (
    s2 + (l.estimatedMinutes || parseDurationMinutes(l.duration) || (l.subLessons || []).length * 8)
  ), 0), 0);
  if (!mins) return null;
  return Math.round((mins / 60) * 10) / 10;
}

/** Human "6h 40m" from minutes. */
export function formatMinutes(mins) {
  const m = Number(mins) || 0;
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

/** Submission status labels shared by assignments + practicals. */
export const REVIEW_STATUS_LABELS = {
  submitted: { label: 'SUBMITTED', tone: 'blue' },
  under_review: { label: 'UNDER REVIEW', tone: 'amber' },
  approved: { label: 'APPROVED', tone: 'green' },
  needs_revision: { label: 'REVISION REQUIRED', tone: 'red' },
  graded: { label: 'GRADED', tone: 'green' },
  pending: { label: 'PENDING', tone: 'white' },
};
export function submissionStatus(sub) {
  if (!sub) return { key: 'pending', ...REVIEW_STATUS_LABELS.pending };
  const key = sub.score != null && sub.status === 'approved' ? 'graded' : (sub.status || 'submitted');
  return { key, ...(REVIEW_STATUS_LABELS[key] || REVIEW_STATUS_LABELS.submitted) };
}

// ---------- Completion rules ----------
export const DEFAULT_COMPLETION_RULES = {
  requireLessonsPct: 100,   // % of lessons that must be complete
  requireQuizAvg: 0,        // 0 = no quiz requirement; else min average %
  requireAssignmentsApproved: 0, // 0 = none required; else count of approved submissions
  requireFinalProject: false,
};

export function getCourseCompletionRules(rulesMap, courseId) {
  return { ...DEFAULT_COMPLETION_RULES, ...(rulesMap?.[courseId] || {}) };
}

export function evaluateCompletion({ rules, lessonsProgressPct, quizAverage, approvedAssignments, finalProjectApproved }) {
  const checks = [];
  checks.push({ key: 'lessons', label: `${rules.requireLessonsPct}% lessons completed`, met: lessonsProgressPct >= rules.requireLessonsPct, value: lessonsProgressPct });
  if (rules.requireQuizAvg > 0) checks.push({ key: 'quiz', label: `Quiz average ≥ ${rules.requireQuizAvg}%`, met: (quizAverage ?? 0) >= rules.requireQuizAvg, value: quizAverage });
  if (rules.requireAssignmentsApproved > 0) checks.push({ key: 'assignments', label: `${rules.requireAssignmentsApproved} assignment(s) approved`, met: (approvedAssignments ?? 0) >= rules.requireAssignmentsApproved, value: approvedAssignments });
  if (rules.requireFinalProject) checks.push({ key: 'project', label: 'Final project approved', met: !!finalProjectApproved, value: finalProjectApproved });
  return { met: checks.every((c) => c.met), checks };
}

// ---------- Recommendations ----------
import { CATEGORY_RECOMMENDATIONS } from '../data/catalog';

export function recommendCourses({ courses, enrolledIds = [], completedIds = [], viewedIds = [], interests = [], limit = 4 }) {
  const byId = new Map(courses.map((c) => [c.id, c]));
  const score = new Map();
  const touch = (cat, w) => {
    (CATEGORY_RECOMMENDATIONS[cat] || []).forEach((target, i) => {
      score.set(target, (score.get(target) || 0) + w * (1 - i * 0.15));
    });
  };
  completedIds.forEach((id) => { const c = byId.get(id); if (c) touch(c.category, 3); });
  enrolledIds.forEach((id) => { const c = byId.get(id); if (c) touch(c.category, 2); });
  viewedIds.forEach((id) => { const c = byId.get(id); if (c) touch(c.category, 1); });
  interests.forEach((cat) => touch(cat, 2.5));
  const excluded = new Set([...enrolledIds, ...completedIds]);
  return courses
    .filter((c) => c.published !== false && !excluded.has(c.id))
    .map((c) => ({ course: c, s: (score.get(c.category) || 0) + (c.rating || 0) * 0.1 + Math.min(c.students || 0, 300) / 3000 }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.course);
}

// ---------- Analytics helpers ----------
export function bucketByDay(items, dateKey, days = 14) {
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ label: d.toLocaleDateString('en', { day: 'numeric', month: 'short' }), value: items.filter((x) => (x[dateKey] || '').slice(0, 10) === key).length, key });
  }
  return out;
}

export function estimateLearningMinutes(events) {
  // Each lesson completion ≈ 12 min; quiz attempt ≈ 8 min; default floor per event 5 min
  return events.reduce((acc, e) => acc + (e.kind === 'lesson_complete' ? 12 : e.kind === 'quiz_attempt' ? 8 : 5), 0);
}

// ---------- Minimal rich-text (markdown-lite) to safe HTML ----------
// Supports: headings, bold, italic, code blocks, inline code, lists, tables, quotes, tips.
export function renderLessonMarkdown(src = '') {
  let html = String(src || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => `<pre class="lesson-code"><code>${code.replace(/\n$/, '')}</code></pre>`);
  // tables
  html = html.replace(/((?:^\|.*\|\s*$\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').filter((r) => !/^\|[\s\-|:]+\|$/.test(r.trim()));
    const cells = rows.map((r, i) => {
      const tds = r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const tag = i === 0 ? 'th' : 'td';
      return `<tr>${tds.map((c) => `<${tag}>${c}</${tag}>`).join('')}</tr>`;
    });
    return `<table class="lesson-table">${cells.join('')}</table>`;
  });
  // images (safe http/https only — never fabricated/JS URLs) then links
  html = html.replace(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_, alt, src, title) => `<img src="${src}" alt="${alt}" title="${title || alt}" loading="lazy" class="lesson-image" />`);
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="lesson-link">$1</a>');
  // display formulas: $$ ... $$ (kept as readable math text, no eval)
  html = html.replace(/^\s*\$\$([\s\S]+?)\$\$\s*$/gm, (_, f) => `<div class="lesson-formula">${f.trim()}</div>`);
  // headings
  html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>').replace(/^### (.*)$/gm, '<h3>$1</h3>').replace(/^## (.*)$/gm, '<h2>$1</h2>').replace(/^# (.*)$/gm, '<h1>$1</h1>');
  // tips / notes / warnings
  html = html.replace(/^&gt; \[!(TIP|NOTE|WARNING)\] (.*)$/gm, (_, k, t) => `<div class="lesson-callout ${k.toLowerCase()}"><strong>${k}:</strong> ${t}</div>`);
  html = html.replace(/^&gt; (.*)$/gm, '<blockquote>$1</blockquote>');
  // lists
  html = html.replace(/((?:^[-*] .+$\n?)+)/gm, (b) => `<ul>${b.trim().split('\n').map((l) => `<li>${l.replace(/^[-*] /, '')}</li>`).join('')}</ul>`);
  html = html.replace(/((?:^\d+\. .+$\n?)+)/gm, (b) => `<ol>${b.trim().split('\n').map((l) => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('')}</ol>`);
  // inline
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code>$1</code>');
  // paragraphs
  html = html.split(/\n{2,}/).map((p) => (/^<(h\d|ul|ol|pre|table|blockquote|div)/.test(p.trim()) ? p : `<p>${p.replace(/\n/g, '<br/>')}</p>`)).join('');
  return html;
}

export function downloadAsFile(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
