// ============================================================
// JAMB CBT — exam API client.
//
// The contract below is the one the backend implemented on
// `arena/01a10cb1-tech-hub-backend` @ 46025db (src/routes/jamb.routes.js). It is
// injected from configuration rather than hard-coded, so a deployment points the
// client at whatever base it agreed on and nothing is guessed:
//
//   GET  /api/jamb/subjects                          public subject list
//        → { subjects: [{ id, code, name, description, syllabus_versions[] }] }
//   POST /api/jamb/attempts        body { subject_ids: uuid[], mode, question_count }
//        → 201 { attempt_id, title, mode, subjects[], duration_minutes,
//                expires_at, total_questions,
//                questions: [{ id, subject, text, options: [{ id, text }] }] }
//        NOTE: `questions[].id` IS the attempt item id, so the same value is used
//        for submit (`question_id`) and autosave (`attempt_item_id`).
//   PUT  /api/jamb/attempts/:attemptId/answers   body { answers: [{ attempt_item_id, option_id }] }
//   POST /api/jamb/attempts/:attemptId/submit    body { answers: [{ question_id, option_id }] }
//        → { score, total, score_percent, pass_mark, passed, graded_at,
//            per_question: [{ question_id, subject, correct, explanation }] }
//   GET  /api/jamb/attempts        → { attempts: [{ id, status, started_at, expires_at,
//                submitted_at, total_questions, correct_count, score, exam{title,mode} }] }
//
// Errors the UI must distinguish:
//   409 JAMB_PAPER_TEMPLATE_UNAVAILABLE  content not ready — the requested
//                                        subjects/question count do not match a
//                                        published, reviewed template
//   403 JAMB_ACCESS_REQUIRED             paid pass missing (server-side check)
//   404 / route missing                  exam service not connected
//
// SECURITY: no answer key is ever returned (only per-question verdicts), grading
// is server-side, the client sends only the option ids the student chose, and the
// server re-checks paid entitlement on every attempt.
// ============================================================
import { apiFetch, ApiRequestError } from './api';

export const NOT_READY =
  'The JAMB exam service is not connected yet. The exam API has not been configured for this '
  + 'deployment, so no papers can be issued. Your access pass still applies once it is live.';

const CONTENT_NOT_READY =
  'That paper is not ready yet. The subjects and question count you chose do not match a '
  + 'published, reviewed paper — try a different combination.';

const ACCESS_REQUIRED =
  'The JAMB CBT area needs the paid pass. Complete your payment and wait for approval, then try again.';

export class JambApiUnavailableError extends Error {
  constructor(message = NOT_READY, { status = 0, code = 'EXAM_API_NOT_CONFIGURED' } = {}) {
    super(message);
    this.name = 'JambApiUnavailableError';
    this.status = status;
    this.code = code;
  }
}

/** 409 — no published template matches the selection (content not ready). */
export class JambContentNotReadyError extends Error {
  constructor(message = CONTENT_NOT_READY, { code = 'JAMB_PAPER_TEMPLATE_UNAVAILABLE' } = {}) {
    super(message);
    this.name = 'JambContentNotReadyError';
    this.code = code;
  }
}

/** 403 — the server refused the attempt because the paid pass is missing. */
export class JambAccessDeniedError extends Error {
  constructor(message = ACCESS_REQUIRED, { code = 'JAMB_ACCESS_REQUIRED' } = {}) {
    super(message);
    this.name = 'JambAccessDeniedError';
    this.code = code;
  }
}

const ENV_PATHS = {
  subjectsPath: 'VITE_EXAM_API_SUBJECTS_PATH',
  attemptsPath: 'VITE_EXAM_API_ATTEMPTS_PATH',
  submitPath: 'VITE_EXAM_API_SUBMIT_PATH',
  historyPath: 'VITE_EXAM_API_HISTORY_PATH',
};

// Optional: without it the client never claims server autosave and answers are
// described as saved on this device only.
const OPTIONAL_ENV_PATHS = {
  answersPath: 'VITE_EXAM_API_ANSWERS_PATH',
};

const clean = (value) => {
  const raw = String(value ?? '').trim();
  return raw.startsWith('/') ? raw : '';
};

const config = {
  subjectsPath: '',
  attemptsPath: '',
  submitPath: '',
  historyPath: '',
  answersPath: '',
  configuredAt: null,
};

/**
 * Hand the client the agreed contract. `submitPath` / `answersPath` may contain
 * the `:attemptId` placeholder. Throws on a path that is not API-relative, so a
 * typo cannot silently point the app at another origin.
 */
export function configureJambApi(next = {}) {
  const incoming = { ...config, ...next };
  const keys = [...Object.keys(ENV_PATHS), ...Object.keys(OPTIONAL_ENV_PATHS)];
  keys.forEach((key) => {
    const value = clean(incoming[key]);
    if (incoming[key] && !value) {
      throw new Error(`${key} must be an API-relative path such as "/jamb/subjects".`);
    }
    config[key] = value;
  });
  const required = Object.keys(ENV_PATHS).filter((key) => config[key]);
  config.configuredAt = required.length ? new Date().toISOString() : null;
  return { ...config };
}

export const getJambApiConfig = () => ({ ...config });

/** Clear the contract (bootstrap + tests): back to "not configured". */
export function resetJambApiConfig() {
  Object.keys(config).forEach((key) => { config[key] = key === 'configuredAt' ? null : ''; });
  return { ...config };
}

/**
 * `{ configured, missing, autosave }` — `missing` names the env vars still to be
 * set, `autosave` says whether the answers endpoint is configured too.
 */
export function getJambApiStatus() {
  const missing = Object.keys(ENV_PATHS).filter((key) => !config[key]).map((key) => ENV_PATHS[key]);
  return { configured: missing.length === 0, missing, autosave: Boolean(config.answersPath) };
}

export const isJambApiConfigured = () => getJambApiStatus().configured;
export const supportsAutosave = () => Boolean(config.answersPath);

// Optional env wiring: a deployment sets the agreed paths at build time. Unset
// means "not configured" — there is no fallback and no guessed URL.
const envConfigured = (() => {
  const env = import.meta.env || {};
  const fromEnv = {};
  [...Object.entries(ENV_PATHS), ...Object.entries(OPTIONAL_ENV_PATHS)].forEach(([key, varName]) => {
    if (env[varName]) fromEnv[key] = env[varName];
  });
  return Object.keys(fromEnv).length ? fromEnv : null;
})();
if (envConfigured) configureJambApi(envConfigured);

function requirePath(key) {
  if (config[key]) return;
  const status = getJambApiStatus();
  const label = (ENV_PATHS[key] || OPTIONAL_ENV_PATHS[key] || key);
  throw new JambApiUnavailableError(`${NOT_READY} (awaiting: ${label})`, { code: 'EXAM_API_NOT_CONFIGURED' });
}

/** Translate transport failures into the three states the UI shows. */
function wrap(err) {
  if (err instanceof JambApiUnavailableError
    || err instanceof JambContentNotReadyError
    || err instanceof JambAccessDeniedError) return err;

  if (err instanceof ApiRequestError) {
    const code = String(err.code || '');
    // 409 — the selection does not match a published, reviewed paper.
    if (err.status === 409 || /TEMPLATE_UNAVAILABLE|QUESTION_BANK_INCOMPLETE|EXAM_CONFIGURATION_INVALID/.test(code)) {
      return new JambContentNotReadyError(err.message || CONTENT_NOT_READY, { code: code || 'JAMB_PAPER_TEMPLATE_UNAVAILABLE' });
    }
    // 403 — the server's own paid-access check refused the attempt.
    if (err.status === 403 || /JAMB_ACCESS_REQUIRED|JAMB_PAID_ACCESS_REQUIRED/.test(code)) {
      return new JambAccessDeniedError(err.message || ACCESS_REQUIRED, { code: code || 'JAMB_ACCESS_REQUIRED' });
    }
    if (err.notImplemented || code === 'ROUTE_NOT_FOUND' || code === 'NOT_FOUND') {
      return new JambApiUnavailableError(NOT_READY, { status: err.status, code });
    }
    if (err.status === 0) {
      return new JambApiUnavailableError(`${NOT_READY} (the exam service could not be reached.)`, { status: 0, code: 'NETWORK_ERROR' });
    }
  }
  return err;
}

/** Subject list for the selection screen. `code` drives the mode rules. */
export async function fetchJambSubjects() {
  requirePath('subjectsPath');
  try {
    const data = await apiFetch(config.subjectsPath);
    const list = Array.isArray(data?.subjects) ? data.subjects : (Array.isArray(data) ? data : []);
    return list.map((s) => ({
      id: s.id,
      code: s.code || '',
      name: s.name || s.title || String(s.id),
      description: s.description || '',
      syllabusYears: (s.syllabus_versions || []).map((v) => v.exam_year).filter(Boolean),
      questionCount: Number.isFinite(Number(s.question_count)) ? Number(s.question_count) : null,
    }));
  } catch (err) {
    throw wrap(err);
  }
}

/**
 * Ask the server to issue a paper. The response carries questions and options
 * only — never a key — plus `expires_at`, which makes the countdown server-owned.
 */
export async function startJambAttempt({ subjectIds = [], mode = 'practice', questionCount = 20 } = {}) {
  requirePath('attemptsPath');
  if (!subjectIds.length) throw new Error('Choose at least one subject.');
  try {
    return await apiFetch(config.attemptsPath, {
      body: { subject_ids: subjectIds, mode, question_count: questionCount },
    });
  } catch (err) {
    throw wrap(err);
  }
}

const withAttemptId = (template, attemptId, fallbackQuery) => (template.includes(':attemptId')
  ? { path: template.replace(':attemptId', encodeURIComponent(attemptId)), query: undefined }
  : { path: template, query: { attempt_id: attemptId, ...fallbackQuery } });

/**
 * Debounced autosave of the chosen options. Answers only — no keys travel either
 * way. Returns the server's summary, or `null` when autosave is not configured.
 */
export async function saveJambAnswers(attemptId, answers = []) {
  if (!config.answersPath) return null;
  if (!attemptId || !answers.length) return null;
  try {
    const { path, query } = withAttemptId(config.answersPath, attemptId);
    const data = await apiFetch(path, { method: 'PUT', query, body: { answers } });
    return data?.result ?? data ?? { saved: answers.length };
  } catch (err) {
    throw wrap(err);
  }
}

/** Send the chosen option ids for grading. Server-side scoring only. */
export async function submitJambAttempt(attemptId, submission) {
  requirePath('submitPath');
  try {
    const { path, query } = withAttemptId(config.submitPath, attemptId);
    return await apiFetch(path, { body: submission, query });
  } catch (err) {
    throw wrap(err);
  }
}

/** Attempt history from the exam service (authoritative when reachable). */
export async function fetchJambAttemptHistory() {
  requirePath('historyPath');
  try {
    const data = await apiFetch(config.historyPath);
    return Array.isArray(data?.attempts) ? data.attempts : (Array.isArray(data) ? data : []);
  } catch (err) {
    throw wrap(err);
  }
}

// The timer contract is implemented once, in the pure engine:
// `resolveTimerSource(paper)` in src/lib/jambEngine.js.
export { resolveTimerSource } from './jambEngine';
