// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LessonBody, { lessonHtml } from '../components/learn/LessonBody';
import LessonResources, { resourceUrl } from '../components/learn/LessonResources';
vi.mock('../components/learn/QuizTaker', () => ({ default: ({ quiz }) => <div>Opened quiz {quiz.id}</div> }));
vi.mock('../components/learn/AssignmentPanel', () => ({ default: ({ assignment }) => <div>Opened assignment {assignment.id}</div> }));
import CourseAssessments from '../components/learn/CourseAssessments';
afterEach(cleanup);

describe('Backend-authored lesson body', () => {
  it('renders images, resource links and real nested lists', () => {
    render(<LessonBody markdown={'# Theory\n\n![Diagram](https://example.org/diagram.png)\n\n[Reference](https://example.org/reference)\n\n1. Procedure\n   - Observe'} />);
    expect(screen.getByRole('img', { name: 'Diagram' }).getAttribute('src')).toBe('https://example.org/diagram.png');
    expect(screen.getByRole('link').getAttribute('href')).toBe('https://example.org/reference');
    expect(document.querySelector('ol li ul li').textContent).toBe('Observe');
  });
  it('preserves code literally instead of applying markdown replacements inside code', () => {
    render(<LessonBody markdown={'```js\nconst text = "**literal**";\nconst tag = "<img src=x onerror=alert(1)>";\n```'} />);
    expect(document.querySelector('pre code').textContent).toContain('**literal**');
    expect(document.querySelector('pre strong')).toBeNull();
    expect(document.querySelector('img')).toBeNull();
  });
  it('strips scripts, unsafe URLs, event handlers and form controls', () => {
    const html = lessonHtml('<script>alert(1)</script><img src="x" onerror="alert(1)"><iframe src="https://example.org"></iframe><input>\n\n[Click](javascript:alert%281%29)');
    const div = document.createElement('div'); div.innerHTML = html;
    expect(div.querySelector('script, iframe, input, [onerror], a[href^="javascript:"]')).toBeNull();
  });
});

describe('Lesson resources', () => {
  it('rejects unsupported schemes and does not invent missing resource URLs', () => {
    expect(resourceUrl('javascript:alert(1)')).toBeNull();
    expect(resourceUrl('data:text/html,test')).toBeNull();
    render(<LessonResources resources={[{ title: 'Missing PDF', type: 'pdf' }]} />);
    expect(screen.getByRole('status').textContent).toContain('no valid URL');
    expect(screen.queryByRole('link')).toBeNull();
  });
  it('offers retry after a failed download', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('offline'));
    render(<LessonResources resources={[{ title: 'Reading PDF', type: 'pdf', url: 'https://example.org/reading.pdf' }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    expect((await screen.findByRole('alert')).textContent).toContain('could not provide a download');
    expect(screen.getByRole('button', { name: 'Retry download' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Open' }).getAttribute('href')).toBe('https://example.org/reading.pdf');
    fetchMock.mockRestore();
  });
});

const props = {
  course: { curriculum: [{ id: 'module-id', title: 'Module one' }] },
  quizzes: [{ id: 'module-quiz', moduleId: 'module-id', title: 'Module assessment' }, { id: 'final-exam', title: 'Final exam', isFinal: true }, { id: 'lesson-quiz', moduleId: 'module-id', lessonId: 'lesson-id', title: 'Lesson-only quiz' }],
  assignments: [{ id: 'project-id', title: 'Final project', isFinalProject: true }], user: { id: 'student-id' },
};
describe('Assessment navigation', () => {
  it('uses module relationships and exposes final work independently of lesson position', () => {
    render(<CourseAssessments {...props} />);
    expect(screen.getByText('Module one — Assessment')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Module assessment/ }));
    expect(screen.getByText('Opened quiz module-quiz')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Final exam/ }));
    expect(screen.getByText('Opened quiz final-exam')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Final project/ }));
    expect(screen.getByText('Opened assignment project-id')).toBeTruthy();
    expect(screen.queryByText('Lesson-only quiz')).toBeNull();
  });
  it('never invents an assessment when the backend supplies none', () => {
    const { container } = render(<CourseAssessments {...props} quizzes={[]} assignments={[]} />);
    expect(container.innerHTML).toBe('');
  });
  it('prevents admin preview from submitting attempts', () => {
    render(<CourseAssessments {...props} preview />);
    fireEvent.click(screen.getByRole('button', { name: /Final exam/ }));
    expect(screen.getByText(/disabled in admin preview/)).toBeTruthy();
    expect(screen.queryByText('Opened quiz final-exam')).toBeNull();
  });
});
