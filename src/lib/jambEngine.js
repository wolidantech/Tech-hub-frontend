// ============================================================
// JAMB CBT engine — pure session logic.
//
// RULES (see src/lib/jambApi.js for the network half):
//   1. This file never contains questions, options or answer keys. Everything
//      comes from the exam API at runtime, so the browser bundle ships no
//      examinable content.
//   2. Answer keys never reach the browser: a paper only carries
//      `{ id, text, options: [{ id, text }] }`, and grading happens server-side.
//   3. Nothing here touches Supabase quiz tables — the JAMB area is a separate
//      product surface waiting on the backend's standalone exam endpoints.
// ============================================================

export const JAMB_MODES = {
  practice: {
    id: 'practice',
    label: 'Practice mode',
    blurb: 'Shorter sets, review every answer with the explanation the exam server returns.',
    defaultQuestions: 20,
    defaultMinutes: 20,
    secondsPerQuestion: 60,
    review: true,
  },
  mock: {
    id: 'mock',
    label: 'Mock exam',
    blurb: 'Full timed paper — no feedback until you submit, auto-submits when time runs out.',
    defaultQuestions: 60,
    defaultMinutes: 75,
    secondsPerQuestion: 75,
    review: false,
  },
};

export const QUESTION_COUNTS = [10, 20, 40, 60];

const STORAGE_HISTORY = 'wdth.jamb.history';
const STORAGE_ACTIVE = 'wdth.jamb.active';

const safeParse = (raw, fallback) => {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
};

// History is per-device (localStorage); the in-progress paper is per-tab
// (sessionStorage) so two tabs cannot fight over one attempt.
const readLocal = (key, fallback) => {
  try { return safeParse(globalThis.localStorage?.getItem?.(key), fallback); } catch { return fallback; }
};
const readSession = (key, fallback) => {
  try { return safeParse(globalThis.sessionStorage?.getItem?.(key), fallback); } catch { return fallback; }
};

/**
 * Client-side mirror of the server's paper rules, so the student is told before
 * a request is sent rather than by a 400:
 *   practice → exactly ONE subject
 *   mock     → must include Use of English, then the template's electives
 * The question count still has to match a published template; only the server
 * knows those, so a 409 JAMB_PAPER_TEMPLATE_UNAVAILABLE stays possible.
 */
export const MOCK_REQUIRED_SUBJECT_CODE = 'USE-OF-ENGLISH';

export function validateSelection({ selected = [], mode = 'practice', subjects = [] } = {}) {
  const chosen = subjects.filter((s) => selected.includes(s.id));
  if (!chosen.length) return { ok: false, reason: 'Choose at least one subject.' };
  if (mode === 'practice' && chosen.length !== 1) {
    return { ok: false, reason: 'Practice mode is one subject at a time. Pick a single subject, or switch to a full mock.' };
  }
  if (mode === 'mock') {
    const hasEnglish = chosen.some((s) => String(s.code || '').toUpperCase() === MOCK_REQUIRED_SUBJECT_CODE);
    if (!hasEnglish) {
      return { ok: false, reason: 'Every JAMB mock includes Use of English. Add it to your selection.' };
    }
  }
  return { ok: true, reason: '' };
}

/**
 * Defensive paper sanitiser. Even if a future endpoint accidentally included a
 * key, the CBT client refuses to keep it — the browser must never hold answers.
 */
const KEY_FIELDS = ['correct_answer', 'correctAnswer', 'correct_option', 'correctOption', 'answer', 'answers', 'is_correct', 'isCorrect', 'solution', 'explanation'];

export function sanitizeQuestion(question) {
  const { options = [], ...rest } = question || {};
  const clean = {};
  Object.entries(rest).forEach(([key, value]) => {
    if (!KEY_FIELDS.some((f) => f.toLowerCase() === key.toLowerCase())) clean[key] = value;
  });
  return {
    id: clean.id ?? clean.question_id ?? String(Math.random()),
    subject: clean.subject || clean.subject_name || null,
    text: clean.text || clean.question || '',
    options: (options || []).map((o) => ({
      id: o.id ?? o.option_id ?? o.text,
      text: o.text || o.option_text || String(o),
    })),
  };
}

/**
 * Build a session from a paper issued by the exam API.
 * @param {object} paper `{ id, subject(s), questions, duration_minutes }`
 * @param {'practice'|'mock'} mode
 * @param {Date|number} [now]
 */
/**
 * Who owns the clock for a paper?
 *
 * 'server' — the paper carried an absolute deadline (`expires_at`), so the
 *            countdown survives a refresh or a paused tab and cannot be
 *            extended from the client. This is the agreed target.
 * 'client' — no deadline was issued, so the countdown is a DISPLAY timer only:
 *            the exam server still decides whether the attempt was in time, and
 *            the UI must say so instead of implying the browser is the referee.
 */
export function resolveTimerSource(paper = {}) {
  const deadline = paper?.expires_at || paper?.deadline || paper?.ends_at;
  if (deadline) {
    const ms = typeof deadline === 'number' ? deadline : new Date(deadline).getTime();
    if (Number.isFinite(ms)) return { source: 'server', deadlineMs: ms };
  }
  return { source: 'client', deadlineMs: null };
}

export function createAttempt({ paper, mode = 'practice', now = Date.now() }) {
  const config = JAMB_MODES[mode] || JAMB_MODES.practice;
  const questions = (paper?.questions || []).map(sanitizeQuestion);
  const startedAt = typeof now === 'number' ? now : new Date(now).getTime();
  const minutes = Number(paper?.duration_minutes) > 0 ? Number(paper.duration_minutes) : config.defaultMinutes;
  const timer = resolveTimerSource(paper);
  const subjects = paper?.subjects
    || [...new Set(questions.map((q) => q.subject).filter(Boolean))]
    || [];
  return {
    attemptId: paper?.attempt_id || paper?.id || `local-${startedAt}`,
    paperId: paper?.paper_id || paper?.id || null,
    mode,
    subjects: Array.isArray(subjects) ? subjects : [subjects].filter(Boolean),
    title: paper?.title || 'JAMB CBT paper',
    questions,
    answers: {},
    flagged: [],
    index: 0,
    startedAt,
    // A server-issued deadline wins; otherwise the clock starts now.
    endsAt: timer.source === 'server' ? timer.deadlineMs : startedAt + minutes * 60 * 1000,
    durationMinutes: minutes,
    timerSource: timer.source,
    submittedAt: null,
  };
}

export const saveAnswer = (attempt, questionId, optionId) => ({
  ...attempt,
  answers: optionId == null
    ? Object.fromEntries(Object.entries(attempt.answers).filter(([k]) => k !== String(questionId)))
    : { ...attempt.answers, [String(questionId)]: optionId },
});

export const toggleFlag = (attempt, questionId) => {
  const key = String(questionId);
  const flagged = attempt.flagged.includes(key)
    ? attempt.flagged.filter((f) => f !== key)
    : [...attempt.flagged, key];
  return { ...attempt, flagged };
};

export const goTo = (attempt, index) => ({
  ...attempt,
  index: Math.max(0, Math.min(attempt.questions.length - 1, index)),
});

export const nextQuestion = (attempt) => goTo(attempt, attempt.index + 1);
export const prevQuestion = (attempt) => goTo(attempt, attempt.index - 1);

export const currentQuestion = (attempt) => attempt?.questions?.[attempt.index] || null;
export const answeredCount = (attempt) => Object.keys(attempt?.answers || {}).length;
export const unansweredIds = (attempt) =>
  (attempt?.questions || []).filter((q) => attempt.answers[String(q.id)] == null).map((q) => q.id);

/** Seconds left on the clock (never negative). */
export function secondsLeft(attempt, now = Date.now()) {
  if (!attempt?.endsAt) return 0;
  const stamp = typeof now === 'number' ? now : new Date(now).getTime();
  return Math.max(0, Math.round((attempt.endsAt - stamp) / 1000));
}

export const isExpired = (attempt, now = Date.now()) => secondsLeft(attempt, now) <= 0;

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Submission payload: question id → chosen option id. Nothing else leaves the
 * device, and no key can come back inside it.
 */
export function buildSubmission(attempt, now = Date.now()) {
  const stamp = typeof now === 'number' ? now : new Date(now).getTime();
  return {
    answers: (attempt?.questions || [])
      .filter((q) => attempt.answers[String(q.id)] != null)
      .map((q) => ({ question_id: String(q.id), option_id: String(attempt.answers[String(q.id)]) })),
    started_at: new Date(attempt.startedAt).toISOString(),
    submitted_at: new Date(stamp).toISOString(),
    mode: attempt.mode,
  };
}

/**
 * Autosave payload for `PUT /jamb/attempts/:attemptId/answers`. A paper's
 * question id IS the attempt item id (the server issues it that way), so the
 * same value answers both endpoints — the server never sees anything but ids.
 */
export function buildAutosave(attempt) {
  return (attempt?.questions || [])
    .filter((q) => attempt.answers[String(q.id)] != null)
    .map((q) => ({ attempt_item_id: String(q.id), option_id: String(attempt.answers[String(q.id)]) }));
}

/** Is this attempt backed by the exam server (so autosave/history apply)? */
export const isServerAttempt = (attempt) =>
  Boolean(attempt?.attemptId) && !String(attempt.attemptId).startsWith('local-');

/**
 * Normalise whatever the grading endpoint returns into one shape the UI can
 * render. Only the server's verdict per question is used — never a key.
 */
export function normalizeResult(graded = {}, attempt = {}) {
  const perQuestion = (graded.per_question || graded.questions || []).map((row) => ({
    questionId: String(row.question_id ?? row.id ?? ''),
    subject: row.subject || null,
    correct: Boolean(row.correct ?? row.is_correct),
    explanation: row.explanation || '',
  }));
  const total = Number.isFinite(Number(graded.total ?? attempt?.questions?.length))
    ? Number(graded.total ?? attempt?.questions?.length)
    : perQuestion.length;
  const score = Number.isFinite(Number(graded.score)) ? Number(graded.score) : perQuestion.filter((q) => q.correct).length;
  // The server sends `score_percent`; use it verbatim when present so the score
  // the student sees is the one the exam service recorded.
  const percentage = Number.isFinite(Number(graded.score_percent))
    ? Math.round(Number(graded.score_percent))
    : (total > 0 ? Math.round((score / total) * 100) : 0);
  const subjects = {};
  perQuestion.forEach((row) => {
    if (!row.subject) return;
    subjects[row.subject] = subjects[row.subject] || { subject: row.subject, score: 0, total: 0 };
    subjects[row.subject].total += 1;
    if (row.correct) subjects[row.subject].score += 1;
  });
  return {
    attemptId: graded.attempt_id ?? attempt?.attemptId ?? null,
    mode: graded.mode ?? attempt?.mode ?? null,
    subjects: attempt?.subjects || Object.keys(subjects),
    score,
    total,
    percentage,
    passMark: Number.isFinite(Number(graded.pass_mark)) ? Number(graded.pass_mark) : 50,
    passed: graded.passed != null ? Boolean(graded.passed) : percentage >= 50,
    perQuestion,
    bySubject: Object.values(subjects),
    gradedAt: graded.graded_at || new Date().toISOString(),
  };
}

/** One history row. Metadata only — answers and keys are never stored. */
export function toHistoryEntry(result = {}, attempt = {}) {
  return {
    attemptId: result.attemptId || attempt.attemptId || `attempt-${Date.now()}`,
    title: attempt.title || 'JAMB CBT paper',
    mode: result.mode || attempt.mode || null,
    subjects: result.subjects || attempt.subjects || [],
    score: result.score ?? null,
    total: result.total ?? null,
    percentage: result.percentage ?? null,
    passed: result.passed ?? null,
    answered: answeredCount(attempt),
    completedAt: result.gradedAt || new Date().toISOString(),
  };
}

/**
 * Map one row from `GET /jamb/attempts` onto the same shape the UI already
 * renders, so server history and device-local history sit in one list.
 * `score` is the server's percentage; `correct_count`/`total_questions` are the
 * raw marks. In-progress attempts are graded as null, not as a zero.
 */
export function mapServerAttempt(row = {}) {
  const submitted = String(row.status || '').toUpperCase() !== 'IN_PROGRESS';
  const total = Number.isFinite(Number(row.total_questions)) ? Number(row.total_questions) : null;
  const correct = submitted && Number.isFinite(Number(row.correct_count)) ? Number(row.correct_count) : null;
  const percent = submitted && Number.isFinite(Number(row.score))
    ? Math.round(Number(row.score))
    : (submitted && total ? Math.round(((correct || 0) / total) * 100) : null);
  return {
    attemptId: row.id,
    title: row.exam?.title || 'JAMB CBT paper',
    mode: String(row.exam?.mode || '').toLowerCase() || null,
    subjects: row.selected_subject_codes || [],
    score: correct,
    total,
    percentage: percent,
    passed: percent == null ? null : percent >= 50,
    inProgress: !submitted,
    completedAt: row.submitted_at || row.created_at || row.started_at || new Date().toISOString(),
    source: 'server',
  };
}

/**
 * Merge server history (authoritative) with what this device recorded, dropping
 * device rows the server already knows about.
 */
export function mergeHistory(serverRows = [], deviceRows = []) {
  const server = (serverRows || []).map(mapServerAttempt);
  const known = new Set(server.map((r) => String(r.attemptId)));
  const device = (deviceRows || [])
    .filter((r) => !known.has(String(r.attemptId)))
    .map((r) => ({ ...r, source: 'device' }));
  return [...server, ...device].sort(
    (a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0),
  );
}

export function loadHistory() {
  const rows = readLocal(STORAGE_HISTORY, []);
  return Array.isArray(rows) ? rows : [];
}

export function recordHistory(entry) {
  if (!entry) return loadHistory();
  const next = [entry, ...loadHistory().filter((r) => r.attemptId !== entry.attemptId)].slice(0, 50);
  try { globalThis.localStorage?.setItem?.(STORAGE_HISTORY, JSON.stringify(next)); } catch { /* storage disabled */ }
  return next;
}

export function clearHistory() {
  try { globalThis.localStorage?.removeItem?.(STORAGE_HISTORY); } catch { /* storage disabled */ }
  return [];
}

// ---------- In-progress attempt (survives a refresh) ----------
export const saveActiveAttempt = (attempt) => {
  try { globalThis.sessionStorage?.setItem?.(STORAGE_ACTIVE, JSON.stringify(attempt)); } catch { /* storage disabled */ }
};

export const loadActiveAttempt = () => readSession(STORAGE_ACTIVE, null);

export const clearActiveAttempt = () => {
  try { globalThis.sessionStorage?.removeItem?.(STORAGE_ACTIVE); } catch { /* storage disabled */ }
};
