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
  JAMB_MODES, buildSubmission, createAttempt, clearActiveAttempt, clearHistory, formatClock,
  loadActiveAttempt, loadHistory, nextQuestion, normalizeResult, recordHistory, sanitizeQuestion,
  saveActiveAttempt, saveAnswer, secondsLeft, toHistoryEntry, toggleFlag, unansweredIds,
} from '../lib/jambEngine';
import {
  JambApiUnavailableError, fetchJambSubjects, getJambApiStatus, resetJambApiStatus, startJambAttempt,
} from '../lib/jambApi';
import JambCBT from '../pages/jamb/JambCBT';
import JambExam from '../pages/jamb/JambExam';

const json = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

// Server-side key store: proves grading can happen without exposing keys.
const KEYS = { 'q-1': 'b', 'q-2': 'a', 'q-3': 'c' };

const PAPER = {
  attempt_id: 'attempt-1',
  duration_minutes: 20,
  subjects: ['Mathematics'],
  questions: [
    { id: 'q-1', subject: 'Mathematics', text: 'Solve: 2 + 2 = ?', options: [{ id: 'a', text: '3' }, { id: 'b', text: '4' }] },
    { id: 'q-2', subject: 'Mathematics', text: 'Solve: 5 - 1 = ?', options: [{ id: 'a', text: '4' }, { id: 'b', text: '6' }] },
    { id: 'q-3', subject: 'Mathematics', text: 'Solve: 3 × 3 = ?', options: [{ id: 'a', text: '6' }, { id: 'b', text: '12' }, { id: 'c', text: '9' }] },
  ],
};

function mockExamApi({ available = true } = {}) {
  const calls = [];
  global.fetch = vi.fn(async (url, opts = {}) => {
    const full = String(url);
    calls.push({ url: full, body: opts.body ? JSON.parse(opts.body) : null });
    // Service not deployed yet: every exam route 404s (ROUTE_NOT_FOUND).
    if (!available) return json({ success: false, error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found' } }, 404);
    if (full.includes('/api/exams/jamb/subjects')) {
      return json({ success: true, data: { subjects: [{ id: 'sub-maths', name: 'Mathematics', question_count: 40 }, { id: 'sub-eng', name: 'Use of English', question_count: 40 }] } });
    }
    if (full.includes('/api/exams/jamb/attempts') && full.endsWith('/submit')) {
      const answers = calls[calls.length - 1].body?.answers || [];
      const perQuestion = answers.map((a) => ({ question_id: a.question_id, correct: KEYS[a.question_id] === a.option_id, explanation: 'Server-side explanation.' }));
      const score = perQuestion.filter((q) => q.correct).length;
      return json({ success: true, data: { attempt_id: 'attempt-1', score, total: 3, pass_mark: 50, passed: (score / 3) * 100 >= 50, per_question: perQuestion } });
    }
    if (full.includes('/api/exams/jamb/attempts')) return json({ success: true, data: PAPER }, 201);
    return json({ success: false, error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found' } }, 404);
  });
  return calls;
}

beforeEach(() => {
  cleanup();
  resetJambApiStatus();
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
    const attempt = createAttempt({ paper: PAPER, mode: 'practice', now: 0 });
    expect(attempt.questions).toHaveLength(3);
    expect(attempt.index).toBe(0);

    const answered = saveAnswer(attempt, 'q-1', 'b');
    expect(answered.answers).toEqual({ 'q-1': 'b' });
    expect(attempt.answers).toEqual({}); // original untouched

    const flagged = toggleFlag(answered, 'q-1');
    expect(flagged.flagged).toEqual(['q-1']);
    expect(nextQuestion(flagged).index).toBe(1);
    expect(unansweredIds(flagged)).toEqual(['q-2', 'q-3']);
    expect(saveAnswer(flagged, 'q-1', null).answers).toEqual({});
  });

  it('counts down from the paper duration and formats the clock', () => {
    const attempt = createAttempt({ paper: PAPER, mode: 'mock', now: 0 });
    expect(attempt.durationMinutes).toBe(20);
    expect(secondsLeft(attempt, 0)).toBe(1200);
    expect(formatClock(secondsLeft(attempt, 60000))).toBe('19:00');
    expect(formatClock(secondsLeft(attempt, 60 * 60 * 1000))).toBe('00:00');
    expect(formatClock(3661)).toBe('1:01:01');
  });

  it('submits only question and option ids', () => {
    const attempt = saveAnswer(createAttempt({ paper: PAPER, mode: 'practice', now: 0 }), 'q-1', 'b');
    const submission = buildSubmission(attempt, 1000);
    expect(submission.answers).toEqual([{ question_id: 'q-1', option_id: 'b' }]);
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
    const attempt = saveAnswer(createAttempt({ paper: PAPER, mode: 'practice', now: 0 }), 'q-2', 'a');
    saveActiveAttempt(attempt);
    expect(loadActiveAttempt().answers).toEqual({ 'q-2': 'a' });
    clearActiveAttempt();
    expect(loadActiveAttempt()).toBeNull();
  });
});

// ================================================================== api seam
describe('JAMB exam API seam', () => {
  it('reports the service as unavailable while the endpoints are missing', async () => {
    mockExamApi({ available: false });
    const status = await getJambApiStatus();
    expect(status.available).toBe(false);
    expect(status.reason).toMatch(/not connected yet/);
    await expect(fetchJambSubjects()).rejects.toBeInstanceOf(JambApiUnavailableError);
    await expect(startJambAttempt({ subjectIds: ['sub-maths'] })).rejects.toBeInstanceOf(JambApiUnavailableError);
  });

  it('issues a paper with the selected subjects and mode when available', async () => {
    const calls = mockExamApi({ available: true });
    resetJambApiStatus();
    expect((await getJambApiStatus()).available).toBe(true);

    const subjects = await fetchJambSubjects();
    expect(subjects.map((s) => s.name)).toEqual(['Mathematics', 'Use of English']);

    const paper = await startJambAttempt({ subjectIds: ['sub-maths'], mode: 'mock', questionCount: 40 });
    const post = calls.find((c) => c.body && c.body.subject_ids);
    expect(post.body).toEqual({ subject_ids: ['sub-maths'], mode: 'mock', question_count: 40 });
    // The issued paper carries questions and options — never the key.
    expect(JSON.stringify(paper)).not.toMatch(/correct_answer|is_correct|"answer"/i);
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
    mockExamApi({ available: false });
    hub();
    expect(await screen.findByText('Exam service not connected yet')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'START PAPER' }).disabled).toBe(true);
    // no fabricated subject list while the service is down
    expect(screen.queryByText('Mathematics')).toBeNull();
  });

  it('re-checks the exam service on demand', async () => {
    mockExamApi({ available: false });
    hub();
    await screen.findByText('Exam service not connected yet');
    mockExamApi({ available: true });
    fireEvent.click(screen.getByRole('button', { name: /Re-check the exam service/ }));
    await waitFor(() => expect(screen.queryByText('Exam service not connected yet')).toBeNull());
    expect(await screen.findByText('Mathematics')).toBeTruthy();
  });

  it('runs a full paper: subjects → mode → timer → navigation → saved answers → results → history', async () => {
    mockExamApi({ available: true });
    hub();

    // 1 — subjects come from the exam service
    fireEvent.click(await screen.findByText('Mathematics'));
    // 2 — mock mode
    fireEvent.click(screen.getByRole('button', { name: /Mock exam/ }));
    // 3 — paper length, then start
    fireEvent.click(screen.getByRole('button', { name: '20 questions' }));
    fireEvent.click(screen.getByRole('button', { name: 'START PAPER' }));

    // 4 — the runner shows the paper with a live timer
    expect(await screen.findByText('Solve: 2 + 2 = ?')).toBeTruthy();
    expect(screen.getByRole('timer').textContent).toMatch(/20:00/);
    expect(screen.getByText(/MOCK EXAM/i)).toBeTruthy();

    // 5 — answering is saved to this device as it happens
    fireEvent.click(screen.getByRole('button', { name: 'B 4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Solve: 5 - 1 = ?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'A 4' }));
    await waitFor(() => {
      const draft = JSON.parse(sessionStorage.getItem('wdth.jamb.active'));
      expect(draft.answers).toEqual({ 'q-1': 'b', 'q-2': 'a' });
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
    // 2 of 3 correct (q-1=b, q-2=a) → 67%, above the 50% pass mark
    expect(screen.getByText('67%')).toBeTruthy();
    expect(screen.getByText(/Passed — well done!/)).toBeTruthy();
    // mock mode does not review individual questions
    expect(screen.queryByText('Review')).toBeNull();
    expect(loadHistory()[0]).toMatchObject({ attemptId: 'attempt-1', score: 2, total: 3, mode: 'mock' });
    expect(loadActiveAttempt()).toBeNull();
  });

  it('restores a saved attempt in a fresh tab session', async () => {
    mockExamApi({ available: true });
    const attempt = createAttempt({ paper: PAPER, mode: 'practice' });
    saveActiveAttempt(saveAnswer(attempt, 'q-1', 'b'));
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

// ================================================================ guardrails
describe('JAMB area isolation', () => {
  const read = (file) => fs.readFileSync(path.join(process.cwd(), 'src', file), 'utf8');

  it('never touches the Supabase quiz tables or the LMS data layer', () => {
    ['lib/jambApi.js', 'lib/jambEngine.js', 'pages/jamb/JambCBT.jsx', 'pages/jamb/JambExam.jsx'].forEach((file) => {
      const src = read(file);
      expect(src).not.toMatch(/from '.*supabase'/);
      expect(src).not.toMatch(/from '.*\/store'/);
      expect(src).not.toMatch(/from\(('|")quizzes('|")\)/);
      expect(src).not.toMatch(/quiz_attempts|quiz_questions|quiz_options/);
    });
  });

  it('keeps the question bank out of the frontend bundle', () => {
    // No hard-coded JAMB questions in source: papers are issued per attempt.
    const src = read('lib/jambEngine.js');
    expect(src).not.toMatch(/options:\s*\[\s*\{\s*id:/);
    expect(JAMB_MODES.practice.review).toBe(true);
    expect(JAMB_MODES.mock.review).toBe(false);
  });
});
