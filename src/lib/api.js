// ============================================================
// REST client for the WOLI DAN TECH HUB backend (Tech-hub-backend).
//
// The catalogue, course outlines and the student classroom are served by the
// API — not by hard-coded frontend data. Contract (see Tech-hub-backend
// src/app.js):
//
//   GET  /api/course-categories        public categories
//   GET  /api/courses                  public catalogue (category_id / search /
//                                      difficulty / page / limit filters)
//   GET  /api/classroom/:idOrSlug/outline   public curriculum outline
//   GET  /api/classroom/:idOrSlug           gated classroom (enrolled students)
//
// Every response is an envelope: `{ success: true, data }` or
// `{ success: false, error: { code, message } }`. This module unwraps it once
// so callers never see the envelope, and turns failures into
// `ApiRequestError` instances that are safe to render.
// ============================================================
import { aiAuthHeaders, cleanEnv } from './supabase';

// `VITE_API_URL` may be an origin (https://api.example.com) or a full base
// (https://api.example.com/api). Without it we use the SAME ORIGIN (`/api`),
// which is what a production deploy behind one domain and the Vite dev proxy
// both give us — browser code never hard-codes a localhost URL.
const RAW_BASE = cleanEnv(import.meta.env?.VITE_API_URL);

export const apiBase = () => {
  if (!RAW_BASE) return '/api';
  const trimmed = RAW_BASE.replace(/\/+$/, '');
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
};

/** Absolute URL for an API path, e.g. `/courses` → `${base}/courses`. */
export const apiUrl = (path, query) => {
  const base = apiBase().replace(/\/+$/, '');
  const clean = `/${String(path || '').replace(/^\/+/, '')}`;
  const url = `${base}${clean}`;
  if (!query) return url;
  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
};

export class ApiRequestError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', url = '' } = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.url = url;
    // 404 / 405 / 501 mean "this endpoint is not (yet) served by the backend".
    // Callers use that to show an honest "not available yet" panel instead of a
    // generic network failure.
    this.notImplemented = status === 404 || status === 405 || status === 501;
  }
}

const FRIENDLY = [
  [/^Failed to fetch|NetworkError|Load failed|network request failed/i, 'Cannot reach the course server. Check your connection and try again.'],
  [/^abort/i, 'The request was cancelled.'],
];

function friendlyNetworkMessage(err) {
  const msg = String(err?.message || '');
  const hit = FRIENDLY.find(([re]) => re.test(msg));
  return hit ? hit[1] : 'Cannot reach the course server. Check your connection and try again.';
}

/**
 * Perform an API request and return the unwrapped `data`.
 * @param {string} path  path after `/api`, e.g. `/courses`
 * @param {object} [opts]
 * @param {object} [opts.query]   query-string params (empty values dropped)
 * @param {object} [opts.body]    JSON body
 * @param {string} [opts.method]  defaults to GET (POST when a body is given)
 * @param {boolean} [opts.auth]   attach the signed-in student's bearer token
 * @param {AbortSignal} [opts.signal]
 */
export async function apiFetch(path, { query, body, method, auth = true, signal } = {}) {
  const url = apiUrl(path, query);
  const headers = { Accept: 'application/json' };
  if (auth) {
    // Same credential the AI gateway uses: the student's own Supabase access
    // token, so the API can enforce enrollment/role per request.
    try {
      Object.assign(headers, await aiAuthHeaders());
    } catch { /* unauthenticated request — public endpoints still work */ }
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(url, {
      method: method || (body !== undefined ? 'POST' : 'GET'),
      headers,
      credentials: 'include',
      signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiRequestError(friendlyNetworkMessage(err), { status: 0, code: 'NETWORK_ERROR', url });
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch { /* non-JSON body — status code below still decides */ }

  if (!response.ok) {
    const error = payload?.error || {};
    const code = error.code || (response.status === 404 ? 'NOT_FOUND' : 'HTTP_ERROR');
    const message = error.message
      || (response.status === 401 ? 'Please log in again to continue.'
        : response.status === 403 ? 'You do not have access to that course.'
          : response.status === 404 ? 'Not found on the course server.'
            : response.status === 501 ? 'That service is not available yet.'
              : `The course server returned an error (${response.status}).`);
    throw new ApiRequestError(message, { status: response.status, code, url });
  }

  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) return payload.data;
  return payload;
}
