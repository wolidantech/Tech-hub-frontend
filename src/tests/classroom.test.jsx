// Test-only fixtures; never imported by the application or seeded into Supabase.
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
const mocks = vi.hoisted(() => ({ courses: {}, lms: {}, user: { id: 'student', role: 'student' } }));
vi.mock('../context/CourseContext', () => ({ useCourses: () => mocks.courses }));
vi.mock('../context/LMSContext', () => ({ useLMS: () => mocks.lms }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock('../components/learn/Discussions', () => ({ default: () => null }));
vi.mock('../components/learn/AssignmentPanel', () => ({ default: () => null }));
vi.mock('../components/learn/QuizTaker', () => ({ default: () => null }));
import Learn from '../pages/Learn';
let course;
const app = () => <MemoryRouter initialEntries={['/learn/test']}><Routes><Route path="/learn/:slug" element={<Learn />} /><Route path="/course/:slug" element={<p>Enrollment required</p>} /></Routes></MemoryRouter>;
beforeEach(() => {
  cleanup();
  course = { id: 'course', slug: 'test', title: 'Test course', curriculum: [{ id: 'module', title: 'Module', lessons: [{ id: 'lesson', title: 'Reading', type: 'text', content: 'Backend supplied theory text', resources: [] }] }] };
  mocks.courses = {
    coursesLoading: false, dataLoading: false, accessKey: 'student:active',
    getCourseBySlug: () => course, ensureCourseDetail: vi.fn().mockResolvedValue(course),
    getProgress: () => ({ progress: 0, completedLessons: [] }), isEnrolled: () => true,
    getUserCertificates: () => [], markLessonStarted: vi.fn(), markLessonComplete: vi.fn().mockResolvedValue(),
  };
  mocks.lms = { refreshCourseAssessments: vi.fn().mockResolvedValue(), getCourseQuizzes: () => [], getCourseAssignments: () => [], getUserQuizAverage: () => null, countApprovedAssignments: () => 0, isFinalProjectApproved: () => false, completionRules: {}, quizAttempts: [], submissions: [], getUpcomingClasses: () => [], aiContent: [] };
});
describe('Classroom regression coverage', () => {
  it('waits for enrollment and survives the loading-to-content hook transition', async () => {
    mocks.courses.dataLoading = true;
    const view = render(app());
    expect(screen.getByRole('status').textContent).toContain('enrollment');
    expect(screen.queryByText('Enrollment required')).toBeNull();
    mocks.courses.dataLoading = false;
    view.rerender(app());
    expect(await screen.findByText('Backend supplied theory text')).toBeTruthy();
    expect(mocks.lms.refreshCourseAssessments).toHaveBeenCalledWith('course');
  });
  it('keeps archived courses out of the classroom', async () => {
    course.archived = true;
    render(app());
    expect(await screen.findByText('This course is not available.')).toBeTruthy();
    expect(screen.queryByText('Backend supplied theory text')).toBeNull();
  });
  it('does not announce a certificate without a backend certificate record', async () => {
    mocks.courses.getProgress = () => ({ progress: 100, completedLessons: ['lesson'] });
    render(app());
    await screen.findByText('Backend supplied theory text');
    expect(screen.queryByText('Your WOLI DAN TECH HUB certificate is ready.')).toBeNull();
  });
  it('shows empty curriculum and can refresh it from the database', async () => {
    course.curriculum = [];
    render(app());
    expect(await screen.findByText(/No curriculum is available/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh curriculum' }));
    await waitFor(() => expect(mocks.courses.ensureCourseDetail).toHaveBeenCalledTimes(2));
  });
  it('renders backend video, written content and resources in a responsive media frame', async () => {
    course.curriculum[0].lessons[0] = {
      ...course.curriculum[0].lessons[0],
      videoUrl: 'https://www.youtube.com/watch?v=VideoFixture1',
      textContent: 'Written lesson from course_content',
      content: 'Written lesson from course_content',
      resources: [{ title: 'Lesson guide', type: 'docs', url: 'https://example.org/guide' }],
    };
    const { container } = render(app());
    expect(await screen.findByRole('button', { name: 'Play Reading' })).toBeTruthy();
    expect(container.querySelector('.aspect-video')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Open' }).getAttribute('href')).toBe('https://example.org/guide');
    fireEvent.click(screen.getByRole('button', { name: /^READ(?: LESSON)?$/ }));
    expect(await screen.findByText('Written lesson from course_content')).toBeTruthy();
  });
  it('saves explicit lesson progress through the database action', async () => {
    render(app());
    await screen.findByText('Backend supplied theory text');
    fireEvent.click(screen.getByRole('button', { name: /MARK AS COMPLETE/ }));
    await waitFor(() => expect(mocks.courses.markLessonComplete).toHaveBeenCalledWith('student', 'course', 'lesson'));
  });
  it('shows query failures with retry and recovers', async () => {
    mocks.courses.ensureCourseDetail.mockRejectedValueOnce(new Error('Network unavailable'));
    render(app());
    expect((await screen.findByRole('alert')).textContent).toContain('Network unavailable');
    fireEvent.click(screen.getByRole('button', { name: 'Retry curriculum' }));
    await waitFor(() => expect(screen.getByText('Backend supplied theory text')).toBeTruthy());
  });
  it('redirects only after enrollment has resolved as unavailable', async () => {
    mocks.courses.isEnrolled = () => false;
    render(app());
    expect(await screen.findByText('Enrollment required')).toBeTruthy();
  });
});
