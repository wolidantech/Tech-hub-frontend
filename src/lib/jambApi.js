// ============================================================
// JAMB CBT — exam API seam.
//
// STATUS (2026-10): the backend does NOT expose a standalone exam API yet.
// There are no `/api/exams/*` routes in wolidantech/Tech-hub-backend, and the
// course endpoints (`/api/courses`, `/api/classroom/...`) deliberately do not
// cover this product: the JAMB area must not be wired to the LMS quiz tables or
// to Supabase quiz/answer tables at all.
//
// SO THIS FILE SHIPS WITH NO ENDPOINT PATHS. Nothing is guessed and nothing is
// fetched until the real contract is agreed and handed to `configureJambApi()`
// (or set through the `VITE_EXAM_API_*` env vars). Every call below rejects with
// `JambApiUnavailableError` until then, and the UI says exactly that. When the
// backend publishes the exam API, only this file (and the env) changes — the
// engine (src/lib/jambEngine.js) and the pages stay untouched.
//
// WHAT THE AGREEMENT HAS TO COVER (recorded here so the gap is explicit):
//   subjects   – the selectable subject list
//   attempts   – issuing a paper: { id, questions:[{id,text,options:[{id,text}]}],
//                duration_minutes } and NO answer keys
//   submit     – server-side grading from the chosen option ids
//   history    – the student's past attempts
//   timer      – who owns the clock. The server should return a deadline
//                (`expires_at`) so a paused/refreshed tab cannot extend it;
//                until it does, the client clock is a DISPLAY timer and the UI
//                labels it as such (see `resolveTimerSource`).
//
// SECURITY: no answer key may appear in a paper payload (`sanitizeQuestion` in
// jambEngine.js strips key-like fields defensively), grading stays server-side,
// and this layer only ever sends the option ids the student chose.
// ============================================================
import { apiFetch, ApiRequestError } from './api';

export const NOT_READY =
  'The JAMB exam service is not connected yet. The exam API and its server-side timer have '
  + 'not been agreed, so no papers can be issued. Your access pass still applies once it is live.';

export class JambApiUnavailableError extends Error {
  constructor(message = NOT_READY, { status = 0, code = 'EXAM_API_NOT_CONFIGURED' } = {}) {
    super(message);
    this.name = 'JambApiUnavailableError';
    this.status = status;
    this.code = code;
  }
}

const ENV_PATHS = {
  subjectsPath: 'VITE_EXAM_API_SUBJECTS_PATH',
  attemptsPath: 'VITE_EXAM_API_ATTEMPTS_PATH',
  submitPath: 'VITE_EXAM_API_SUBMIT_PATH',
  historyPath: 'VITE_EXAM_API_HISTORY_PATH',
};

const clean = (value) => {
  const raw = String(value ?? '').trim();
  return raw.startsWith('/') ? raw : '';
};

/**
 * The agreed contract. `submitPath` may contain the `:attemptId` placeholder.
 * Called from the app bootstrap (or filled in from env below); nothing else in
 * the app knows these URLs.
 */
const config = {
  subjectsPath: '',
  attemptsPath: '',
  submitPath: '',
  historyPath: '',
  configuredAt: null,
};

export function configureJambApi(next = {}) {
  const incoming = { ...config, ...next };
  const paths = ['subjectsPath', 'attemptsPath', 'submitPath', 'historyPath'];
  paths.forEach((key) => {
    const value = clean(incoming[key]);
    if (incoming[key] && !value) {
      throw new Error(`${key} must be an API-relative path such as "/exams/jamb/subjects".`);
    }
    config[key] = value;
  });
  config.configuredAt = paths.some((key) => config[key]) ? new Date().toISOString() : null;
  return { ...config };
}

export const getJambApiConfig = () => ({ ...config });

/**
 * Clear the agreed contract (bootstrap + tests). After this the layer is back to
 * "not agreed": every call rejects and nothing is fetched.
 */
export function resetJambApiConfig() {
  config.subjectsPath = '';
  config.attemptsPath = '';
  config.submitPath = '';
  config.historyPath = '';
  config.configuredAt = null;
  return { ...config };
}

// Optional env wiring: a deployment that has the agreed contract can set the
// four paths at build time. Unset means "not agreed" — no fallback guessing.
const envConfigured = (() => {
  const env = import.meta.env || {};
  const fromEnv = {};
  Object.entries(ENV_PATHS).forEach(([key, varName]) => { if (env[varName]) fromEnv[key] = env[varName]; });
  return Object.keys(fromEnv).length ? fromEnv : null;
})();
if (envConfigured) configureJambApi(envConfigured);

/**
 * `{ configured, missing }` — `missing` names the env vars still to be agreed,
 * because that is what whoever deploys the contract has to set.
 */
export function getJambApiStatus() {
  const missing = Object.keys(ENV_PATHS).filter((key) => !config[key]).map((key) => ENV_PATHS[key]);
  return { configured: missing.length === 0, missing };
}

export const isJambApiConfigured = () => getJambApiStatus().configured;

function requirePath(key) {
  const status = getJambApiStatus();
  if (status.configured) return;
  throw new JambApiUnavailableError(
    `${NOT_READY} (awaiting: ${status.missing.join(', ')})`,
    { code: 'EXAM_API_NOT_CONFIGURED' },
  );
}

function wrap(err) {
  if (err instanceof JambApiUnavailableError) return err;
  if (err instanceof ApiRequestError && (err.notImplemented || err.code === 'ROUTE_NOT_FOUND' || err.code === 'NOT_FOUND')) {
    return new JambApiUnavailableError(NOT_READY, { status: err.status, code: err.code });
  }
  if (err instanceof ApiRequestError && err.status === 0) {
    return new JambApiUnavailableError(`${NOT_READY} (the exam service could not be reached.)`, { status: 0, code: 'NETWORK_ERROR' });
  }
  return err;
}

/** Subject list for the selection screen. */
export async function fetchJambSubjects() {
  requirePath('subjectsPath');
  try {
    const data = await apiFetch(config.subjectsPath);
    const list = Array.isArray(data?.subjects) ? data.subjects : (Array.isArray(data) ? data : []);
    return list.map((s) => ({
      id: s.id,
      name: s.name || s.title || String(s.id),
      description: s.description || '',
      questionCount: Number.isFinite(Number(s.question_count)) ? Number(s.question_count) : null,
    }));
  } catch (err) {
    throw wrap(err);
  }
}

/**
 * Ask the server to issue a paper. The response is a question list WITHOUT
 * answer keys; `sanitizeQuestion` (applied by the engine) strips any key field
 * that slips through, so the browser can never hold the answers.
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

/** Send the chosen option ids for grading. Server-side scoring only. */
export async function submitJambAttempt(attemptId, submission) {
  requirePath('submitPath');
  try {
    const path = config.submitPath.includes(':attemptId')
      ? config.submitPath.replace(':attemptId', encodeURIComponent(attemptId))
      : config.submitPath;
    return await apiFetch(path, { body: submission, query: config.submitPath.includes(':attemptId') ? undefined : { attempt_id: attemptId } });
  } catch (err) {
    throw wrap(err);
  }
}

/** Attempt history as stored by the exam service (when it exists). */
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
