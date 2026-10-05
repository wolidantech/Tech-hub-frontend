// ============================================================
// JAMB CBT — exam API seam.
//
// STATUS (2026-10): the backend does NOT yet expose a standalone JAMB exam
// API. `GET /api/classroom/quizzes/:quizId` exists for *course* quizzes and is
// deliberately NOT used here — the JAMB area is a separate product surface and
// must not be wired to Supabase's quiz tables (no question bank, no answer
// keys, no attempt rows shared with the LMS).
//
// Until the exam endpoints land, every call below rejects with
// `JambApiUnavailableError` after a real probe, and the UI says exactly that
// instead of inventing questions. The paths are the expected contract; when
// the backend ships them (or names them differently) only this file changes —
// the engine (src/lib/jambEngine.js) and the pages stay untouched.
//
// Expected contract:
//   GET  /api/exams/jamb/subjects                    → { subjects: [{id, name, question_count}] }
//   POST /api/exams/jamb/attempts                    → body { subject_ids, mode, question_count }
//                                                    → { attempt_id, duration_minutes, questions: [{id, text, options:[{id,text}]}] }
//   POST /api/exams/jamb/attempts/:id/submit         → body { answers: [{question_id, option_id}] }
//                                                    → { score, total, passed, per_question: [{question_id, correct, explanation}] }
//   GET  /api/exams/jamb/attempts/mine               → { attempts: [...] }
//
// SECURITY: question payloads never contain answer keys (see
// `sanitizeQuestion` in jambEngine.js, which strips them defensively), and
// grading is server-side — the browser only ever sends the option ids the
// student chose.
// ============================================================
import { apiFetch, ApiRequestError } from './api';

export const JAMB_ENDPOINTS = {
  subjects: '/exams/jamb/subjects',
  attempts: '/exams/jamb/attempts',
  submit: (attemptId) => `/exams/jamb/attempts/${encodeURIComponent(attemptId)}/submit`,
  mine: '/exams/jamb/attempts/mine',
};

const NOT_READY = 'The JAMB exam service is not connected yet. The backend exam endpoints have not been published, so no papers can be issued.';

export class JambApiUnavailableError extends Error {
  constructor(message = NOT_READY, { status = 0, code = 'EXAM_API_UNAVAILABLE' } = {}) {
    super(message);
    this.name = 'JambApiUnavailableError';
    this.status = status;
    this.code = code;
  }
}

const isMissingEndpoint = (err) =>
  err instanceof ApiRequestError && (err.notImplemented || err.code === 'ROUTE_NOT_FOUND' || err.code === 'NOT_FOUND');

/** Turn any failure into the honest "not available yet" state. */
function toUnavailable(err) {
  if (err instanceof JambApiUnavailableError) return err;
  if (isMissingEndpoint(err)) return new JambApiUnavailableError(NOT_READY, { status: err.status, code: err.code });
  if (err instanceof ApiRequestError && err.status === 0) {
    return new JambApiUnavailableError(`${NOT_READY} (the exam service could not be reached.)`, { status: 0, code: 'NETWORK_ERROR' });
  }
  return err;
}

let cachedStatus = null;

/**
 * Probe the exam API once per page load. Returns
 * `{ available, reason, checkedAt }` — never throws.
 */
export async function getJambApiStatus({ force = false } = {}) {
  if (cachedStatus && !force) return cachedStatus;
  try {
    await apiFetch(JAMB_ENDPOINTS.subjects, { query: { limit: 1 } });
    cachedStatus = { available: true, reason: '', checkedAt: new Date().toISOString() };
  } catch (err) {
    const unavailable = toUnavailable(err);
    cachedStatus = {
      available: false,
      reason: unavailable.message || NOT_READY,
      checkedAt: new Date().toISOString(),
    };
  }
  return cachedStatus;
}

export const resetJambApiStatus = () => { cachedStatus = null; };

/** Subject list for the selection screen. */
export async function fetchJambSubjects() {
  try {
    const data = await apiFetch(JAMB_ENDPOINTS.subjects);
    const list = Array.isArray(data?.subjects) ? data.subjects : (Array.isArray(data) ? data : []);
    return list.map((s) => ({
      id: s.id,
      name: s.name || s.title || String(s.id),
      description: s.description || '',
      questionCount: Number.isFinite(Number(s.question_count)) ? Number(s.question_count) : null,
    }));
  } catch (err) {
    throw toUnavailable(err);
  }
}

/**
 * Ask the server to issue a paper. The response is a question list WITHOUT
 * answer keys; `sanitizeQuestion` (applied by the engine) strips any key field
 * that slips through, so the browser can never hold the answers.
 */
export async function startJambAttempt({ subjectIds = [], mode = 'practice', questionCount = 20 } = {}) {
  if (!subjectIds.length) throw new Error('Choose at least one subject.');
  try {
    const data = await apiFetch(JAMB_ENDPOINTS.attempts, {
      body: { subject_ids: subjectIds, mode, question_count: questionCount },
    });
    return data;
  } catch (err) {
    throw toUnavailable(err);
  }
}

/** Send the chosen option ids for grading. Server-side scoring only. */
export async function submitJambAttempt(attemptId, submission) {
  try {
    return await apiFetch(JAMB_ENDPOINTS.submit(attemptId), { body: submission });
  } catch (err) {
    throw toUnavailable(err);
  }
}

/** Attempt history as stored by the exam service (when it exists). */
export async function fetchJambAttemptHistory() {
  try {
    const data = await apiFetch(JAMB_ENDPOINTS.mine);
    return Array.isArray(data?.attempts) ? data.attempts : (Array.isArray(data) ? data : []);
  } catch (err) {
    throw toUnavailable(err);
  }
}
