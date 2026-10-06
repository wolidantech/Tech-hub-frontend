// Storefront visibility guard: an archived (or unpublished) slug must behave
// like "not found" for students, while an admin can still open it to manage it.
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

let course;
const app = () => (
  <MemoryRouter initialEntries={['/course/test']}>
    <Routes><Route path="/course/:slug" element={<CourseDetails />} /></Routes>
  </MemoryRouter>
);

beforeEach(() => {
  cleanup();
  course = {
    id: 'course', slug: 'test', title: 'Archivable course', category: 'Design', level: 'Beginner',
    description: 'desc', longDescription: 'long', price: 5000, originalPrice: 10000,
    rating: 5, students: 1, duration: '6 hours', instructor: 'Woli Dan', instructorRole: 'Tutor',
    whatYouWillLearn: ['x'], requirements: [], audience: [], thumbnail: 'design',
  };
  mocks.user = { id: 'student', role: 'student' };
  mocks.courses = {
    coursesLoading: false, coursesError: null, accessKey: 'student',
    getCourseBySlug: () => course, isEnrolled: () => false,
    getManualPaymentByCourse: () => null, ensureCourseDetail: vi.fn().mockResolvedValue(course),
    refreshCourses: vi.fn(),
  };
  mocks.lms = {
    trackView: vi.fn(), getCourseQuizzes: () => [], getCourseAssignments: () => [],
    siteSettings: {}, addReview: vi.fn(), getCourseReviews: () => [],
    getCourseRating: () => 5, ensureCourseReviews: vi.fn().mockResolvedValue(),
  };
});

describe('Course storefront visibility', () => {
  it('renders a visible course for a student', async () => {
    render(app());
    expect(await screen.findByText('Archivable course')).toBeTruthy();
  });
  it('answers "not found" when a student opens an archived slug', async () => {
    course.archived = true;
    render(app());
    expect(await screen.findAllByText('Course not found.')).toBeTruthy();
    expect(screen.queryByText('ENROLL NOW - ₦5,000')).toBeNull();
  });
  it('answers "not found" when a student opens an unpublished slug', async () => {
    course.published = false;
    render(app());
    expect(await screen.findAllByText('Course not found.')).toBeTruthy();
  });
  it('still lets an admin open an archived course to manage it', async () => {
    course.archived = true;
    mocks.user = { id: 'admin', role: 'admin' };
    render(app());
    expect(await screen.findByText('Archivable course')).toBeTruthy();
  });
});
