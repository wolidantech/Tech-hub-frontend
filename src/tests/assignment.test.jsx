// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
const mocks = vi.hoisted(() => ({ submit: vi.fn() }));
vi.mock('../context/LMSContext', () => ({ useLMS: () => ({ submitAssignment: mocks.submit, getUserSubmissions: () => [] }) }));
import AssignmentPanel from '../components/learn/AssignmentPanel';
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const assignment = { id: 'assignment-id', title: 'Backend assignment', submissionType: 'text', maxScore: 100 };
describe('Assignment submission', () => {
  it('retains an answer on failure and confirms success only after a retry is saved', async () => {
    mocks.submit.mockRejectedValueOnce(new Error('Connection lost')).mockResolvedValueOnce({ id: 'submission-id' });
    render(<AssignmentPanel assignment={assignment} user={{ id: 'student-id', fullName: 'Student' }} />);
    const answer = screen.getByPlaceholderText('Write your answer / essay here...');
    fireEvent.change(answer, { target: { value: 'My completed work' } });
    fireEvent.click(screen.getByRole('button', { name: /SUBMIT ASSIGNMENT/ }));
    expect((await screen.findByRole('alert')).textContent).toContain('Connection lost');
    expect(answer.value).toBe('My completed work');
    expect(screen.queryByText('Submission saved. Awaiting instructor review.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /SUBMIT ASSIGNMENT/ }));
    expect(await screen.findByText('Submission saved. Awaiting instructor review.')).toBeTruthy();
    expect(mocks.submit.mock.calls[1][0]).toMatchObject({ assignmentId: 'assignment-id', userId: 'student-id', textContent: 'My completed work', kind: 'text' });
    expect(typeof mocks.submit.mock.calls[1][0].onUploadProgress).toBe('function');
  });
});
