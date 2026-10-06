// Storefront visibility guard: the course page is served by the API outline
// endpoint, which only returns PUBLISHED courses. An archived or unpublished
// slug therefore behaves like "not found" for everyone — students AND admins —
// and course management happens in the admin dashboard instead.
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mocks = vi.hoisted(() => ({ courses: {}, lms: {}, user: { id: 'student', role: 'student' } }));
vi.mock('../context/CourseContext', () => ({ useCourses: () => mocks.courses }));
vi.mock('../context/LMSContext', () => ({ useLMS: () => mocks.lms }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: mocks.user }) }));

import CourseDetails from '../pages/CourseDetails';

const json = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

// The backend resolves the slug with `requirePublished: true`, so anything
// archived/unpublished comes back as NOT_FOUND.
const OUTLINE = {
  course: {
    id: 'course', slug: 'test', title: 'Visible course', description: 'desc', price: 5000,
    duration: '6 hours', difficulty_level: 'BEGINNER', is_published: true,
    course_categories: { id: 'cat-1', name: 'Design' },
  },
  modules: [{ id: 'm1', title: 'Module one', description: null, order_number: 1, topics: [], lessons: [{ id: 'l1', module_id: 'm1', title: 'First lesson', lesson_type: 'VIDEO', duration: '10:00', order_number: 1, is_free_preview: false }], topics_count: 0, lessons_count: 1 }],
  total_lessons: 1,
  counts: { modules: 1, topics: 0, lessons: 1, quizzes: 0, assignments: 0, assessments: 0 },
  curriculum_complete: true,
  curriculum_status: { complete: true, message: 'Curriculum ready — 1 module(s), 1 published lesson(s)' },
  enrollment: null,
  progress: null,
  has_access: false,
};

let visible;
const app = () => (
  <MemoryRouter initialEntries={['/course/test']}>
    <Routes><Route path="/course/:slug" element={<CourseDetails />} /></Routes>
  </MemoryRouter>
);

beforeEach(() => {
  cleanup();
  visible = true;
  mocks.user = { id: 'student', role: 'student' };
  global.fetch = vi.fn(async () => (visible
    ? json({ success: true, data: OUTLINE })
    : json({ success: false, error: { code: 'NOT_FOUND', message: 'Course not found' } }, 404)));
  mocks.courses = {
    isEnrolled: () => false, getManualPaymentByCourse: () => null,
  };
  mocks.lms = {
    siteSettings: {}, addReview: vi.fn(), getCourseReviews: () => [],
    getCourseRating: () => 5, ensureCourseReviews: vi.fn().mockResolvedValue(),
  };
});

describe('Course storefront visibility (API-served outline)', () => {
  it('renders a published course for a student', async () => {
    render(app());
    expect(await screen.findByText('Visible course')).toBeTruthy();
    expect(screen.getByText('ENROLL NOW - ₦5,000')).toBeTruthy();
  });

  it('answers "not found" when a student opens an archived slug', async () => {
    visible = false; // backend: archived row is not part of the public catalogue
    render(app());
    expect(await screen.findAllByText('Course not found.')).toBeTruthy();
    expect(screen.queryByText(/ENROLL NOW/)).toBeNull();
  });

  it('answers "not found" when a student opens an unpublished slug', async () => {
    visible = false;
    render(app());
    expect(await screen.findAllByText('Course not found.')).toBeTruthy();
  });

  it('keeps archived courses out of the storefront for admins too — the dashboard manages them', async () => {
    visible = false;
    mocks.user = { id: 'admin', role: 'admin' };
    render(app());
    expect(await screen.findAllByText('Course not found.')).toBeTruthy();
    // Admins still get a way back to the catalogue (and manage rows in
    // /admin/dashboard, which edits courses directly rather than via the
    // public outline endpoint).
    expect(screen.getByRole('link', { name: 'Browse courses' })).toBeTruthy();
  });

  it('surfaces a backend failure with a retry instead of a blank page', async () => {
    global.fetch = vi.fn(async () => { throw new TypeError('Failed to fetch'); });
    render(app());
    expect(await screen.findByText(/Cannot reach the course server/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy();
  });
});
