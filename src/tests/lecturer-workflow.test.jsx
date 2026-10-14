import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (f) => readFileSync(f, 'utf8');

describe('lecturer review workflow contract', () => {
  it('uses the exact agreed backend status values', () => {
    const sql = read('supabase/migrations/012_lecturers_review_workflow.sql');
    for (const status of ['draft', 'pending_review', 'approved', 'published', 'released', 'changes_requested', 'rejected']) {
      expect(sql).toContain(`'${status}'`);
    }
    expect(sql).toContain("status in\n    ('draft','pending_review','approved','published','changes_requested','rejected')");
  });

  it('never grants lecturers direct writes to live teaching tables', () => {
    const sql = read('supabase/migrations/012_lecturers_review_workflow.sql');
    for (const table of ['course_modules','course_lessons','quizzes','quiz_questions','assignments','assignment_submissions']) {
      expect(sql).not.toMatch(new RegExp(`create policy[^;]*lecturer[^;]*on public\\.${table}[^;]*for (insert|update|delete|all)`, 'is'));
    }
    expect(sql).toContain('lecturer_save_content_draft');
    expect(sql).toContain('admin_publish_content');
    expect(sql).toContain('admin_release_grade');
  });

  it('does not persist lecturer drafts in browser storage', () => {
    expect(read('src/lib/lecturer.js')).not.toMatch(/localStorage\.(setItem|getItem)|sessionStorage\.(setItem|getItem)/);
    expect(read('src/pages/LecturerDashboard.jsx')).not.toMatch(/localStorage\.(setItem|getItem)|sessionStorage\.(setItem|getItem)/);
  });
});

describe('student ID card export', () => {
  it('exports the existing card and never calls the issue RPC', () => {
    const card = read('src/components/student/StudentIdCard.jsx');
    expect(card).toContain('DOWNLOAD PDF');
    expect(card).toContain('DOWNLOAD IMAGE');
    expect(card).toContain('OPEN / SHARE / SAVE TO FILES');
    expect(card).toContain('data-testid="student-id-card"');
    expect(read('src/lib/idCardExport.js')).not.toContain('issueIdCardRpc');
    expect(read('src/lib/idCardExport.js')).toContain('%PDF-1.4');
  });
});
