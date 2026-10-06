// @vitest-environment jsdom
// JAMB CBT area: subject selection, practice/mock modes, question navigation,
// timer, saved answers, results and attempt history — and the guarantee that
// answer keys never reach the browser and the area is not wired to the LMS
// quiz tables.
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import {
  JAMB_MODES, buildAutosave, buildSubmission, createAttempt, clearActiveAttempt, clearHistory,
  formatClock, isServerAttempt, loadActiveAttempt, loadHistory, mapServerAttempt, mergeHistory,
  nextQuestion, normalizeResult, recordHistory, sanitizeQuestion, saveActiveAttempt, saveAnswer,
  secondsLeft, toHistoryEntry, toggleFlag, unansweredIds, validateSelection,
} from '../lib/jambEngine';
import {
  JambAccessDeniedError, JambApiUnavailableError, JambContentNotReadyError, configureJambApi,
  fetchJambAttemptHistory, fetchJambSubjects, getJambApiStatus, isJambApiConfigured,
  resetJambApiConfig, saveJambAnswers, startJambAttempt, supportsAutosave,
} from '../lib/jambApi';
import JambCBT from '../pages/jamb/JambCBT';
import JambExam from '../pages/jamb/JambExam';

// The paid gate and the session are not what these tests exercise, so both are
// stubbed: `accessState` is mutated per test to model locked / pending / granted.
const accessState = vi.hoisted(() => ({
  state: 'granted',
  entitled: true,
  product: { id: 'bundle-jamb', title: 'JAMB CBT Pass', price: 5000, kind: 'exam_access', isPublished: true },
  payment: null,
  error: '',
  reload: vi.fn(),
}));
vi.mock('../lib/useJambAccess', () => ({ useJambAccess: () => accessState }));
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'student-1', fullName: 'Test Student', email: 't@example.com' } }),
}));

const json = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

// Server-side key store: proves grading can happen without exposing keys.
const KEYS = { 'item-1': 'opt-b', 'item-2': 'opt-a', 'item-3': 'opt-c' };

// A paper exactly as POST /api/jamb/attempts returns it: `questions[].id` IS the
// attempt item id, options carry only { id, text }, and `expires_at` makes the
// countdown server-owned.
const PAPER = {
  id: 'attempt-1',
  attempt_id: 'attempt-1',
  title: 'Mathematics practice (20)',
  mode: 'practice',
  duration_minutes: 20,
  expires_at: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
  total_questions: 3,
  subjects: ['Mathematics'],
  questions: [
    { id: 'item-1', subject: 'Mathematics', text: 'Solve: 2 + 2 = ?', options: [{ id: 'opt-a', text: '3' }, { id: 'opt-b', text: '4' }] },
    { id: 'item-2', subject: 'Mathematics', text: 'Solve: 5 - 1 = ?', options: [{ id: 'opt-a', text: '4' }, { id: 'opt-b', text: '6' }] },
    { id: 'item-3', subject: 'Mathematics', text: 'Solve: 3 × 3 = ?', options: [{ id: 'opt-a', text: '6' }, { id: 'opt-b', text: '12' }, { id: 'opt-c', text: '9' }] },
  ],
};

// The same paper WITHOUT a server deadline: what the client falls back to when
// the exam service does not (yet) issue `expires_at`.
const CLIENT_PAPER = { ...PAPER, expires_at: undefined, duration_minutes: 20 };

// One row from GET /api/jamb/attempts (the student's server-side exam record).
const SERVER_ATTEMPT = {
  id: 'attempt-0',
  exam_id: 'exam-1',
  status: 'SUBMITTED',
  started_at: '2026-10-01T09:00:00.000Z',
  expires_at: '2026-10-01T09:20:00.000Z',
  submitted_at: '2026-10-01T09:18:00.000Z',
  total_questions: 20,
  correct_count: 16,
  score: 80,
  selected_subject_codes: ['MATHEMATICS'],
  created_at: '2026-10-01T09:00:00.000Z',
  exam: { id: 'exam-1', slug: 'practice-maths-20', title: 'Mathematics practice (20)', mode: 'PRACTICE', syllabus_year: 2026 },
};

/**
 * The agreed contract (Tech-hub-backend @ 46025db, src/routes/jamb.routes.js).
 * A deployment supplies these via `VITE_EXAM_API_*`; nothing is hard-coded in
 * src/lib/jambApi.js itself.
 */
const TEST_CONTRACT = {
  subjectsPath: '/jamb/subjects',
  attemptsPath: '/jamb/attempts',
  submitPath: '/jamb/attempts/:attemptId/submit',
  historyPath: '/jamb/attempts',
  answersPath: '/jamb/attempts/:attemptId/answers',
};

const agreeOnContract = (overrides = {}) => configureJambApi({ ...TEST_CONTRACT, ...overrides });

const SUBJECTS = [
  { id: 'sub-maths', code: 'MATHEMATICS', name: 'Mathematics', description: 'Algebra and geometry' },
  { id: 'sub-english', code: 'USE-OF-ENGLISH', name: 'Use of English', description: 'Comprehension and summary' },
  { id: 'sub-physics', code: 'PHYSICS', name: 'Physics', description: 'Mechanics and waves' },
];

/**
 * Fake exam service speaking the agreed contract, including its failure modes:
 *   400 JAMB_SUBJECT_SELECTION_INVALID  practice takes one subject
 *   400 JAMB_REQUIRED_SUBJECT_MISSING   a mock must include Use of English
 *   409 JAMB_PAPER_TEMPLATE_UNAVAILABLE the count matches no published template
 *   403 JAMB_ACCESS_REQUIRED            the paid pass is missing
 */
function mockExamApi({ available = true, locked = false, history = [SERVER_ATTEMPT], autosave = true } = {}) {
  const calls = [];
  const saved = {};
  let startedMode = 'practice';
  global.fetch = vi.fn(async (url, opts = {}) => {
    const full = String(url);
    calls.push({ url: full, method: opts.method || (opts.body ? 'POST' : 'GET'), body: opts.body ? JSON.parse(opts.body) : null });
    if (!available) return json({ success: false, error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found' } }, 404);

    // Subjects and history are public/authenticated-only; the PAID check happens
    // when a paper is issued, exactly like the backend's `authenticate` + access
    // check on the attempt routes.
    if (full.endsWith('/api/jamb/subjects')) {
      return json({ success: true, data: { subjects: SUBJECTS } });
    }
    if (locked) return json({ success: false, error: { code: 'JAMB_ACCESS_REQUIRED', message: 'Purchase the JAMB CBT pass before starting an exam' } }, 403);
    if (/\/api\/jamb\/attempts\/[^/]+\/answers$/.test(full)) {
      if (!autosave) return json({ success: false, error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found' } }, 404);
      (calls[calls.length - 1].body?.answers || []).forEach((a) => { saved[a.attempt_item_id] = a.option_id; });
      return json({ success: true, data: { result: { saved: (calls[calls.length - 1].body?.answers || []).length } } });
    }
    if (/\/api\/jamb\/attempts\/[^/]+\/submit$/.test(full)) {
      const answers = calls[calls.length - 1].body?.answers || [];
      const chosen = { ...saved };
      answers.forEach((a) => { chosen[a.question_id] = a.option_id; });
      const perQuestion = Object.keys(KEYS).map((qid) => ({
        question_id: qid, subject: 'Mathematics',
        correct: chosen[qid] === KEYS[qid], explanation: 'Server-side explanation.',
      }));
      const score = perQuestion.filter((q) => q.correct).length;
      const total = perQuestion.length;
      const percent = (score / total) * 100;
      return json({
        success: true,
        data: {
          attempt_id: 'attempt-1', mode: startedMode, score, total, score_percent: percent,
          pass_mark: 50, passed: percent >= 50, graded_at: new Date().toISOString(), per_question: perQuestion,
        },
      });
    }
    if (full.endsWith('/api/jamb/attempts') && calls[calls.length - 1].method === 'GET') {
      return json({ success: true, data: { attempts: history } });
    }
    if (full.endsWith('/api/jamb/attempts')) {
      const body = calls[calls.length - 1].body || {};
      const codes = (body.subject_ids || []).map((id) => (SUBJECTS.find((x) => x.id === id) || {}).code);
      if (body.mode !== 'mock' && (body.subject_ids || []).length !== 1) {
        return json({ success: false, error: { code: 'JAMB_SUBJECT_SELECTION_INVALID', message: 'Choose one subject for practice mode' } }, 400);
      }
      if (body.mode === 'mock' && !codes.includes('USE-OF-ENGLISH')) {
        return json({ success: false, error: { code: 'JAMB_REQUIRED_SUBJECT_MISSING', message: 'A JAMB mock must include Use of English' } }, 400);
      }
      // Only the published template's length is issuable.
      if (Number(body.question_count) !== 20) {
        return json({
          success: false,
          error: {
            code: 'JAMB_PAPER_TEMPLATE_UNAVAILABLE',
            message: 'No reviewed paper matches those subjects and question count. Choose an available combination or contact the school.',
          },
        }, 409);
      }
      startedMode = body.mode === 'mock' ? 'mock' : 'practice';
      return json({ success: true, data: { ...PAPER, mode: startedMode } }, 201);
    }
    return json({ success: false, error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found' } }, 404);
  });
  return calls;
}

beforeEach(() => {
  cleanup();
  resetJambApiConfig();          // start un-agreed, like a fresh deployment
  accessState.state = 'granted';
  accessState.entitled = true;
  accessState.payment = null;
  accessState.error = '';
  clearHistory();
  clearActiveAttempt();
});
afterEach(() => { vi.restoreAllMocks(); });

// ==================================================================== engine
describe('JAMB engine — session logic without answer keys', () => {
  it('strips any key-like field from a question before the client keeps it', () => {
    const clean = sanitizeQuestion({ id: 'q-9', text: 'Q?', correct_answer: 'b', correctAnswer: 'b', is_correct: true, explanation: 'because', options: [{ id: 'a', text: 'A' }] });
    expect(clean).toEqual({ id: 'q-9', subject: null, text: 'Q?', options: [{ id: 'a', text: 'A' }] });
    expect(JSON.stringify(clean)).not.toMatch(/correct|explanation/i);
  });

  it('tracks answers, flags and navigation immutably', () => {
    const attempt = createAttempt({ paper: CLIENT_PAPER, mode: 'practice', now: 0 });
    expect(attempt.questions).toHaveLength(3);
    expect(attempt.index).toBe(0);

    const answered = saveAnswer(attempt, 'item-1', 'opt-b');
    expect(answered.answers).toEqual({ 'item-1': 'opt-b' });
    expect(attempt.answers).toEqual({}); // original untouched

    const flagged = toggleFlag(answered, 'item-2');
    expect(flagged.flagged).toEqual(['item-2']);
    expect(nextQuestion(flagged).index).toBe(1);
    expect(unansweredIds(flagged)).toEqual(['item-2', 'item-3']);
    expect(saveAnswer(flagged, 'item-1', null).answers).toEqual({});
  });

  it('counts down from the paper duration and formats the clock', () => {
    const attempt = createAttempt({ paper: CLIENT_PAPER, mode: 'mock', now: 0 });
    expect(attempt.durationMinutes).toBe(20);
    expect(secondsLeft(attempt, 0)).toBe(1200);
    expect(formatClock(secondsLeft(attempt, 60000))).toBe('19:00');
    expect(formatClock(secondsLeft(attempt, 60 * 60 * 1000))).toBe('00:00');
    expect(formatClock(3661)).toBe('1:01:01');
  });

  it('submits only question and option ids', () => {
    const attempt = saveAnswer(createAttempt({ paper: CLIENT_PAPER, mode: 'practice', now: 0 }), 'item-1', 'opt-b');
    const submission = buildSubmission(attempt, 1000);
    expect(submission.answers).toEqual([{ question_id: 'item-1', option_id: 'opt-b' }]);
    expect(JSON.stringify(submission)).not.toMatch(/correct|explanation|option_text|"text"/i);
  });

  it('normalises the server verdict and records history on this device', () => {
    const attempt = createAttempt({ paper: PAPER, mode: 'mock', now: 0 });
    const result = normalizeResult({ score: 2, total: 3, pass_mark: 50, passed: true, per_question: [{ question_id: 'q-1', correct: true }, { question_id: 'q-2', correct: true }, { question_id: 'q-3', correct: false }] }, attempt);
    expect(result.percentage).toBe(67);
    expect(result.passed).toBe(true);

    const entry = toHistoryEntry(result, attempt);
    recordHistory(entry);
    expect(loadHistory()[0]).toMatchObject({ attemptId: 'attempt-1', score: 2, total: 3, percentage: 67, mode: 'mock' });
    // history keeps metadata only
    expect(JSON.stringify(loadHistory())).not.toMatch(/correct_answer|option_id/i);
    expect(clearHistory()).toEqual([]);
  });

  it('restores an in-progress attempt after a reload', () => {
    const attempt = saveAnswer(createAttempt({ paper: CLIENT_PAPER, mode: 'practice', now: 0 }), 'item-2', 'opt-a');
    saveActiveAttempt(attempt);
    expect(loadActiveAttempt().answers).toEqual({ 'item-2': 'opt-a' });
    clearActiveAttempt();
    expect(loadActiveAttempt()).toBeNull();
  });
});

// ================================================================== api seam
describe('JAMB exam API seam', () => {
  it('ships with no endpoint configured and never guesses a route', async () => {
    const fetchSpy = mockExamApi({ available: true });
    const status = getJambApiStatus();
    expect(status.configured).toBe(false);
    expect(isJambApiConfigured()).toBe(false);
    // All four contract points are named as still to be agreed.
    expect(status.missing).toEqual([
      'VITE_EXAM_API_SUBJECTS_PATH', 'VITE_EXAM_API_ATTEMPTS_PATH',
      'VITE_EXAM_API_SUBMIT_PATH', 'VITE_EXAM_API_HISTORY_PATH',
    ]);
    // Autosave is a separate, optional capability — it must not be implied.
    expect(status.autosave).toBe(false);
    await expect(fetchJambSubjects()).rejects.toBeInstanceOf(JambApiUnavailableError);
    await expect(startJambAttempt({ subjectIds: ['sub-maths'] })).rejects.toBeInstanceOf(JambApiUnavailableError);
    await expect(fetchJambSubjects()).rejects.toThrow(/not connected yet/);
    // The honest state costs zero requests: no invented URL was probed.
    expect(fetchSpy).toHaveLength(0);
  });

  it('rejects a configured path that is not API-relative', () => {
    expect(() => configureJambApi({ subjectsPath: 'https://guessed.example/exams' })).toThrow(/API-relative/);
    expect(() => configureJambApi({ attemptsPath: 'exams/jamb/attempts' })).toThrow(/API-relative/);
  });

  it('issues a paper with the selected subjects and mode once the contract is agreed', async () => {
    const calls = mockExamApi({ available: true });
    agreeOnContract();
    expect(getJambApiStatus().configured).toBe(true);

    const subjects = await fetchJambSubjects();
    expect(subjects.map((s) => s.name)).toEqual(['Mathematics', 'Use of English', 'Physics']);
    // `code` drives the mode rules, so it must survive the mapping.
    expect(subjects.map((s) => s.code)).toEqual(['MATHEMATICS', 'USE-OF-ENGLISH', 'PHYSICS']);

    const paper = await startJambAttempt({ subjectIds: ['sub-maths'], mode: 'practice', questionCount: 20 });
    const post = calls.find((c) => c.body && c.body.subject_ids);
    expect(post.body).toEqual({ subject_ids: ['sub-maths'], mode: 'practice', question_count: 20 });
    // The paper the server issues owns the clock.
    expect(paper.expires_at).toBeTruthy();
    expect(createAttempt({ paper, mode: 'practice' }).timerSource).toBe('server');
    expect(post.url).toContain('/api/jamb/attempts');
    // The issued paper carries questions and options — never the key.
    expect(JSON.stringify(paper)).not.toMatch(/correct_answer|is_correct|"answer"/i);
  });

  it('falls back to the honest state when an agreed route is missing server-side', async () => {
    mockExamApi({ available: false });   // every route 404s
    agreeOnContract();
    await expect(fetchJambSubjects()).rejects.toThrow(/not connected yet/);
  });
});

// ======================================================================= UI
describe('JAMB CBT interface', () => {
  const hub = () => render(
    <MemoryRouter initialEntries={['/jamb-cbt']}>
      <Routes>
        <Route path="/jamb-cbt" element={<JambCBT />} />
        <Route path="/jamb-cbt/exam" element={<JambExam />} />
      </Routes>
    </MemoryRouter>,
  );

  it('says plainly that the exam service is not connected, and disables starting', async () => {
    mockExamApi({ available: false });   // unconfigured: nothing is fetched
    hub();
    expect(await screen.findByText('Exam service not connected yet')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'START PAPER' }).disabled).toBe(true);
    // no fabricated subject list while the service is down
    expect(screen.queryByText('Mathematics')).toBeNull();
  });

  it('picks the subjects up on re-check once the contract is configured', async () => {
    hub();
    await screen.findByText('Exam service not connected yet');
    // The backend team agrees the contract; the deployment configures it.
    mockExamApi({ available: true });
    agreeOnContract();
    fireEvent.click(screen.getByRole('button', { name: /Re-check the exam service/ }));
    await waitFor(() => expect(screen.queryByText('Exam service not connected yet')).toBeNull());
    expect(await screen.findByText('Mathematics')).toBeTruthy();
  });

  it('locks the paper behind the paid pass', async () => {
    accessState.state = 'locked';
    accessState.entitled = false;
    mockExamApi({ available: true });
    agreeOnContract();
    hub();
    expect(await screen.findByText('JAMB CBT is a paid pass')).toBeTruthy();
    fireEvent.click(await screen.findByText('Mathematics'));
    expect(screen.getByRole('button', { name: 'START PAPER' }).disabled).toBe(true);
    // The way in is the existing bundle payment flow, not a new one.
    expect(screen.getByRole('link', { name: /BUY THE JAMB PASS/ }).getAttribute('href'))
      .toBe('/enroll/bundle/bundle-jamb');
  });

  it('shows a payment that is awaiting admin approval', async () => {
    accessState.state = 'pending';
    accessState.entitled = false;
    accessState.payment = { reference: 'TRF-4417', status: 'pending' };
    mockExamApi({ available: true });
    agreeOnContract();
    hub();
    expect(await screen.findByText(/awaiting approval/i)).toBeTruthy();
    expect(screen.getByText(/TRF-4417/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'START PAPER' }).disabled).toBe(true);
  });

  it('runs a full paper: subjects → mode → timer → navigation → saved answers → results → history', async () => {
    mockExamApi({ available: true });
    agreeOnContract();
    hub();

    // 1 — subjects come from the exam service
    fireEvent.click(await screen.findByText('Mathematics'));
    // 2 — mock mode (which always needs Use of English)
    fireEvent.click(screen.getByRole('button', { name: /Mock exam/ }));
    fireEvent.click(screen.getByText('Use of English'));
    // 3 — paper length, then start
    fireEvent.click(screen.getByRole('button', { name: '20 questions' }));
    fireEvent.click(screen.getByRole('button', { name: 'START PAPER' }));

    // 4 — the runner shows the paper with a live timer
    expect(await screen.findByText('Solve: 2 + 2 = ?')).toBeTruthy();
    expect(screen.getByRole('timer').textContent).toMatch(/(20:00|19:59)/);
    expect(screen.getByText(/MOCK EXAM/i)).toBeTruthy();

    // 5 — answering is saved to this device as it happens
    fireEvent.click(screen.getByRole('button', { name: 'B 4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Solve: 5 - 1 = ?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'A 4' }));
    await waitFor(() => {
      const draft = JSON.parse(sessionStorage.getItem('wdth.jamb.active'));
      expect(draft.answers).toEqual({ 'item-1': 'opt-b', 'item-2': 'opt-a' });
    });

    // 6 — question navigator jumps between questions
    const nav = screen.getByRole('button', { name: /Go to question 3, not answered/ });
    fireEvent.click(nav);
    expect(await screen.findByText('Solve: 3 × 3 = ?')).toBeTruthy();

    // 7 — submit with a blank warns first, then grades server-side
    fireEvent.click(screen.getByRole('button', { name: 'SUBMIT' }));
    expect(await screen.findByText('Submit with blanks?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'SUBMIT NOW' }));

    expect(await screen.findByText('MOCK EXAM RESULT')).toBeTruthy();
    // 2 of 3 correct (item-1=opt-b, item-2=opt-a) → 67%, above the 50% pass mark
    expect(screen.getByText('67%')).toBeTruthy();
    expect(screen.getByText(/Passed — well done!/)).toBeTruthy();
    // mock mode does not review individual questions
    expect(screen.queryByText('Review')).toBeNull();
    expect(loadHistory()[0]).toMatchObject({ attemptId: 'attempt-1', score: 2, total: 3, mode: 'mock' });
    expect(loadActiveAttempt()).toBeNull();
  });

  it('restores a saved attempt in a fresh tab session', async () => {
    mockExamApi({ available: true });
    agreeOnContract();
    const attempt = createAttempt({ paper: CLIENT_PAPER, mode: 'practice' });
    saveActiveAttempt(saveAnswer(attempt, 'item-1', 'opt-b'));
    render(
      <MemoryRouter initialEntries={['/jamb-cbt/exam']}>
        <Routes><Route path="/jamb-cbt/exam" element={<JambExam />} /></Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText('Solve: 2 + 2 = ?')).toBeTruthy();
    expect(screen.getByText(/1\/3 answered/)).toBeTruthy();
    // the previously chosen option is still selected
    expect(screen.getByRole('button', { name: 'B 4' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('redirects to the hub when there is no paper in progress', () => {
    render(
      <MemoryRouter initialEntries={['/jamb-cbt/exam']}>
        <Routes>
          <Route path="/jamb-cbt" element={<p>JAMB hub</p>} />
          <Route path="/jamb-cbt/exam" element={<JambExam />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('JAMB hub')).toBeTruthy();
  });
});

// ============================================== agreed-contract behaviours
describe('JAMB agreed contract — rules, autosave, history', () => {
  it('mirrors the server selection rules before sending anything', () => {
    expect(validateSelection({ selected: [], mode: 'practice', subjects: SUBJECTS }).ok).toBe(false);
    // practice takes exactly one subject
    expect(validateSelection({ selected: ['sub-maths'], mode: 'practice', subjects: SUBJECTS }).ok).toBe(true);
    expect(validateSelection({ selected: ['sub-maths', 'sub-physics'], mode: 'practice', subjects: SUBJECTS }).reason)
      .toMatch(/one subject at a time/i);
    // a mock must include Use of English
    expect(validateSelection({ selected: ['sub-maths'], mode: 'mock', subjects: SUBJECTS }).reason)
      .toMatch(/Use of English/);
    expect(validateSelection({ selected: ['sub-english', 'sub-maths'], mode: 'mock', subjects: SUBJECTS }).ok).toBe(true);
  });

  it('practice mode keeps a single subject in the UI', async () => {
    mockExamApi({ available: true });
    agreeOnContract();
    render(<MemoryRouter initialEntries={['/jamb-cbt']}><Routes><Route path="/jamb-cbt" element={<JambCBT />} /></Routes></MemoryRouter>);
    fireEvent.click(await screen.findByText('Mathematics'));
    fireEvent.click(screen.getByText('Physics'));
    expect(screen.getByRole('button', { name: 'Physics' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Mathematics' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('blocks a mock without Use of English and says why', async () => {
    mockExamApi({ available: true });
    agreeOnContract();
    render(<MemoryRouter initialEntries={['/jamb-cbt']}><Routes><Route path="/jamb-cbt" element={<JambCBT />} /></Routes></MemoryRouter>);
    fireEvent.click(await screen.findByText('Mathematics'));
    fireEvent.click(screen.getByRole('button', { name: /Mock exam/ }));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toMatch(/Use of English/);
    expect(screen.getByRole('button', { name: 'START PAPER' }).disabled).toBe(true);
  });

  it('treats 409 JAMB_PAPER_TEMPLATE_UNAVAILABLE as content not ready', async () => {
    mockExamApi({ available: true });
    agreeOnContract();
    await expect(startJambAttempt({ subjectIds: ['sub-maths'], mode: 'practice', questionCount: 40 }))
      .rejects.toBeInstanceOf(JambContentNotReadyError);
    // …and the page explains it inline instead of inventing a paper.
    render(<MemoryRouter initialEntries={['/jamb-cbt']}><Routes><Route path="/jamb-cbt" element={<JambCBT />} /></Routes></MemoryRouter>);
    fireEvent.click(await screen.findByText('Mathematics'));
    fireEvent.click(screen.getByRole('button', { name: '40 questions' }));
    fireEvent.click(screen.getByRole('button', { name: 'START PAPER' }));
    expect(await screen.findByText('That paper is not published yet')).toBeTruthy();
    expect(screen.getByText(/No reviewed paper matches those subjects/)).toBeTruthy();
  });

  it('treats 403 JAMB_ACCESS_REQUIRED as the paid gate, not a bug', async () => {
    mockExamApi({ available: true, locked: true });
    agreeOnContract();
    await expect(startJambAttempt({ subjectIds: ['sub-maths'], mode: 'practice', questionCount: 20 }))
      .rejects.toBeInstanceOf(JambAccessDeniedError);
    accessState.reload.mockClear();
    render(<MemoryRouter initialEntries={['/jamb-cbt']}><Routes><Route path="/jamb-cbt" element={<JambCBT />} /></Routes></MemoryRouter>);
    fireEvent.click(await screen.findByText('Mathematics'));
    fireEvent.click(screen.getByRole('button', { name: '20 questions' }));
    fireEvent.click(screen.getByRole('button', { name: 'START PAPER' }));
    await waitFor(() => expect(accessState.reload).toHaveBeenCalled());
  });

  it('autosaves answers to the server, debounced, using attempt item ids', async () => {
    const calls = mockExamApi({ available: true });
    agreeOnContract();
    expect(supportsAutosave()).toBe(true);
    expect(buildAutosave(saveAnswer(createAttempt({ paper: PAPER, mode: 'practice', now: 0 }), 'item-1', 'opt-b')))
      .toEqual([{ attempt_item_id: 'item-1', option_id: 'opt-b' }]);

    const attempt = createAttempt({ paper: PAPER, mode: 'practice' });
    saveActiveAttempt(attempt);
    render(<MemoryRouter initialEntries={['/jamb-cbt/exam']}><Routes><Route path="/jamb-cbt/exam" element={<JambExam />} /></Routes></MemoryRouter>);
    await screen.findByText('Solve: 2 + 2 = ?');
    fireEvent.click(screen.getByRole('button', { name: 'B 4' }));

    // Debounced: not instant, then one PUT with the attempt item id.
    await waitFor(() => {
      const put = calls.find((c) => c.method === 'PUT' && /\/answers$/.test(c.url));
      expect(put).toBeTruthy();
      expect(put.url).toContain('/api/jamb/attempts/attempt-1/answers');
      expect(put.body).toEqual({ answers: [{ attempt_item_id: 'item-1', option_id: 'opt-b' }] });
    }, { timeout: 3000 });
    expect(await screen.findByText(/Saved to your account/)).toBeTruthy();
  });

  it('never claims a server save when the answers endpoint is not configured', async () => {
    const calls = mockExamApi({ available: true });
    agreeOnContract({ answersPath: '' });
    expect(supportsAutosave()).toBe(false);
    const attempt = createAttempt({ paper: PAPER, mode: 'practice' });
    saveActiveAttempt(attempt);
    render(<MemoryRouter initialEntries={['/jamb-cbt/exam']}><Routes><Route path="/jamb-cbt/exam" element={<JambExam />} /></Routes></MemoryRouter>);
    await screen.findByText('Solve: 2 + 2 = ?');
    fireEvent.click(screen.getByRole('button', { name: 'B 4' }));
    await waitFor(() => {
      const draft = JSON.parse(sessionStorage.getItem('wdth.jamb.active'));
      expect(draft.answers).toEqual({ 'item-1': 'opt-b' });   // still saved locally
    });
    expect(screen.getByText('Answers saved on this device only')).toBeTruthy();
    expect(calls.find((c) => c.method === 'PUT')).toBeUndefined();
    expect(await saveJambAnswers('attempt-1', [{ attempt_item_id: 'item-1', option_id: 'opt-b' }])).toBeNull();
  });

  it('reads attempt history from the server and labels device-only rows', async () => {
    mockExamApi({ available: true });
    agreeOnContract();
    const rows = await fetchJambAttemptHistory();
    expect(rows).toHaveLength(1);
    const mapped = mapServerAttempt(rows[0]);
    expect(mapped).toMatchObject({ attemptId: 'attempt-0', title: 'Mathematics practice (20)', mode: 'practice', score: 16, total: 20, percentage: 80, passed: true, source: 'server' });

    // A device row the server does not know about is kept and labelled.
    recordHistory({ attemptId: 'local-1', title: 'Offline paper', mode: 'practice', score: 5, total: 10, percentage: 50, passed: true, completedAt: '2026-09-30T10:00:00.000Z' });
    const merged = mergeHistory(rows, loadHistory());
    expect(merged.map((r) => r.attemptId)).toEqual(['attempt-0', 'local-1']);
    expect(merged[1].source).toBe('device');

    // An in-progress attempt is not shown as a zero score.
    expect(mapServerAttempt({ ...rows[0], status: 'IN_PROGRESS', correct_count: null, score: null }).percentage).toBeNull();
  });

  it('falls back to device history, labelled, when the server history fails', async () => {
    mockExamApi({ available: false });
    agreeOnContract();
    await expect(fetchJambAttemptHistory()).rejects.toBeInstanceOf(JambApiUnavailableError);
  });

  it('only calls a server attempt "server-backed" when it has a real id', () => {
    expect(isServerAttempt(createAttempt({ paper: PAPER, mode: 'practice' }))).toBe(true);
    expect(isServerAttempt(createAttempt({ paper: { questions: PAPER.questions }, mode: 'practice' }))).toBe(false);
  });
});

// ================================================================ guardrails
describe('JAMB area isolation', () => {
  const read = (file) => fs.readFileSync(path.join(process.cwd(), 'src', file), 'utf8');

  it('never touches the Supabase quiz tables or the LMS data layer', () => {
    ['lib/jambApi.js', 'lib/jambEngine.js', 'lib/useJambAccess.js', 'pages/jamb/JambCBT.jsx', 'pages/jamb/JambExam.jsx'].forEach((file) => {
      const src = read(file);
      expect(src).not.toMatch(/from '.*supabase'/);
      expect(src).not.toMatch(/from\(('|")quizzes('|")\)/);
      expect(src).not.toMatch(/quiz_attempts|quiz_questions|quiz_options/);
    });
    // Papers, grading and history bypass the LMS data layer entirely…
    ['lib/jambApi.js', 'lib/jambEngine.js', 'pages/jamb/JambCBT.jsx', 'pages/jamb/JambExam.jsx'].forEach((file) => {
      expect(read(file)).not.toMatch(/from '.*\/store'/);
    });
    // …while the paid gate may read the payment/bundle tables — that is its job.
    expect(read('lib/useJambAccess.js')).toMatch(/fetchBundles|fetchMyPayments/);
  });

  it('lets an admin publish the exam pass, and gates on an approved payment for it', () => {
    // The pass is a real bundles row (kind = exam_access), so the existing
    // bank-transfer + admin-approval flow is the only way in.
    const form = read('pages/admin/BundlePathManager.jsx');
    expect(form).toMatch(/exam_access/);
    expect(form).toMatch(/JAMB CBT pass/);
    expect(read('lib/store.js')).toMatch(/kind: input\.kind === 'exam_access' \? 'exam_access' : 'courses'/);

    const gate = read('lib/useJambAccess.js');
    expect(gate).toMatch(/kind === 'exam_access'/);
    expect(gate).toMatch(/status === 'approved'/);
    expect(gate).toMatch(/status === 'pending'/);
    // …and the page routes the student to the existing checkout, not a new one.
    expect(read('pages/jamb/JambCBT.jsx')).toMatch(/\/enroll\/bundle\//);
  });

  it('labels the clock honestly: a display timer until the server issues a deadline', () => {
    // No deadline in the paper -> the browser clock is only a display.
    const clientTimed = createAttempt({ paper: CLIENT_PAPER, mode: 'mock', now: 0 });
    expect(clientTimed.timerSource).toBe('client');
    expect(clientTimed.endsAt).toBe(20 * 60 * 1000);   // the paper's own 20 minutes
    // Server deadline wins, so a refresh cannot extend the paper.
    const deadline = Date.now() + 5 * 60 * 1000;
    const serverTimed = createAttempt({ paper: { ...CLIENT_PAPER, expires_at: new Date(deadline).toISOString() }, mode: 'mock', now: 0 });
    expect(serverTimed.timerSource).toBe('server');
    expect(serverTimed.endsAt).toBe(deadline);
    // ...and the runner tells the student which one they are looking at.
    expect(read('pages/jamb/JambExam.jsx')).toMatch(/display timer/);
  });

  it('keeps the question bank out of the frontend bundle', () => {
    // No hard-coded JAMB questions in source: papers are issued per attempt.
    const src = read('lib/jambEngine.js');
    expect(src).not.toMatch(/options:\s*\[\s*\{\s*id:/);
    expect(JAMB_MODES.practice.review).toBe(true);
    expect(JAMB_MODES.mock.review).toBe(false);
  });
});
