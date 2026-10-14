import { requireSb, friendlyError } from './supabase';

/**
 * Lecturer + review data access. Everything here is a plain Postgres read
 * (RLS-scoped) or a SECURITY DEFINER RPC. There is deliberately NO direct
 * write to live course/quiz/assignment/submission tables from this module,
 * and nothing is persisted to localStorage — drafts live server-side so an
 * unfinished backend shows an honest error instead of fake "saved" state.
 */
const sb = () => requireSb();

export function backendMissing(err) {
  const msg = String(err?.message || err || '');
  if (/lecturer_content_revisions|lecturer_course_assignments|lecturer_grading_revisions|review_events|lecturer_invitations|is_assigned_lecturer|lecturer_review_queue/i.test(msg)
      && /(does not exist|not found|schema cache|404|42P01|PGRST2)/i.test(msg)) {
    return new Error('Lecturer backend is not installed yet: run supabase/migrations/012_lecturers_review_workflow.sql in the Supabase SQL Editor, then reload this page. No work was saved.');
  }
  return err instanceof Error ? err : new Error(friendlyError(err, msg || 'Request failed'));
}

async function one(query) {
  try {
    const { data, error } = await query;
    if (error) throw backendMissing(error);
    return data;
  } catch (err) { throw backendMissing(err); }
}
async function rpc(name, args) {
  try {
    const { data, error } = await sb().rpc(name, args);
    if (error) throw backendMissing(error);
    return data;
  } catch (err) { throw backendMissing(err); }
}

export const LECTURER_FILE_BUCKET = 'lecturer-files';

export async function fetchMyLecturerCourses(lecturerId) {
  const rows = await one(sb().from('lecturer_course_assignments')
    .select('course_id, active, courses:course_id(*)')
    .eq('lecturer_id', lecturerId).eq('active', true).order('created_at'));
  return (rows || []).filter((r) => r.courses).map((r) => ({
    id: r.courses.id, slug: r.courses.slug, title: r.courses.title,
    category: r.courses.category, published: !!r.courses.published,
  }));
}

export async function fetchCourseCurriculum(courseId) {
  const [modules, lessons, contents, quizzes, questions, assignments] = await Promise.all([
    one(sb().from('course_modules').select('*').eq('course_id', courseId).order('position')),
    one(sb().from('course_lessons').select('*').eq('course_id', courseId).order('position')),
    one(sb().from('course_content').select('*')).catch(() => []),
    one(sb().from('quizzes').select('*').eq('course_id', courseId).order('created_at')),
    one(sb().from('quiz_questions').select('*')).catch(() => []),
    one(sb().from('assignments').select('*').eq('course_id', courseId).order('created_at')),
  ]);
  return { modules: modules || [], lessons: lessons || [], contents: contents || [], quizzes: quizzes || [], questions: questions || [], assignments: assignments || [] };
}

export async function fetchMyContentRevisions(lecturerId) {
  return one(sb().from('lecturer_content_revisions').select('*').eq('lecturer_id', lecturerId).order('updated_at', { ascending: false }).limit(200)) || [];
}
export async function fetchMyGradingRevisions(lecturerId) {
  return one(sb().from('lecturer_grading_revisions').select('*').eq('lecturer_id', lecturerId).order('updated_at', { ascending: false }).limit(200)) || [];
}
export async function fetchReviewEvents(reviewId) {
  return one(sb().from('review_events').select('*').eq('review_id', reviewId).order('created_at')) || [];
}

export const saveContentDraft = (args) => rpc('lecturer_save_content_draft', {
  p_course: args.courseId, p_item_type: args.itemType, p_operation: args.operation,
  p_target_id: args.targetId || null, p_payload: args.payload, p_revision_id: args.revisionId || null,
});
export const submitContent = (revisionId) => rpc('lecturer_submit_content', { p_revision_id: revisionId });
export const discardContentDraft = (revisionId) => rpc('lecturer_delete_content_draft', { p_revision_id: revisionId });
export const saveGradeDraft = (submissionId, score, feedback, gradingId) => rpc('lecturer_save_grade', {
  p_submission: submissionId, p_score: Number(score), p_feedback: feedback || '', p_grading_id: gradingId || null,
});
export const submitGrade = (gradingId) => rpc('lecturer_submit_grade', { p_grading_id: gradingId });

export async function fetchAssignedSubmissions(courseIds) {
  if (!courseIds?.length) return [];
  return one(sb().from('assignment_submissions').select('*').in('course_id', courseIds)
    .order('submitted_at', { ascending: false }).limit(300)) || [];
}

// ---------- Admin ----------
export async function fetchLecturers() {
  const rows = await one(sb().from('profiles').select('*').in('role', ['lecturer', 'instructor']).order('full_name')) || [];
  return rows;
}
export async function fetchAssignmentMap() {
  return one(sb().from('lecturer_course_assignments').select('*').order('created_at')) || [];
}
export async function fetchReviewQueue() {
  // lecturer_review_queue is a view; content/grading rows are also read
  // directly below for previews, so the queue stays usable pre-view grants.
  const [content, grading] = await Promise.all([
    one(sb().from('lecturer_content_revisions').select('*, profiles:lecturer_id(full_name,email), courses:course_id(title)').order('submitted_at', { ascending: false, nullsFirst: false }).limit(200)),
    one(sb().from('lecturer_grading_revisions').select('*, profiles:lecturer_id(full_name,email), courses:course_id(title)').order('submitted_at', { ascending: false, nullsFirst: false }).limit(200)),
  ]);
  return [
    ...(content || []).map((r) => ({ ...r, kind: 'content' })),
    ...(grading || []).map((r) => ({ ...r, kind: 'grading' })),
  ].sort((a, b) => String(b.submitted_at || b.created_at).localeCompare(String(a.submitted_at || a.created_at)));
}
export const adminReviewContent = (id, decision, reason) => rpc('admin_review_content', { p_revision_id: id, p_decision: decision, p_reason: reason || '' });
export const adminPublishContent = (id) => rpc('admin_publish_content', { p_revision_id: id });
export const adminReviewGrade = (id, decision, reason) => rpc('admin_review_grade', { p_grading_id: id, p_decision: decision, p_reason: reason || '' });
export const adminReleaseGrade = (id) => rpc('admin_release_grade', { p_grading_id: id });
export const adminPromoteLecturer = (userId) => rpc('admin_promote_lecturer', { p_user_id: userId });
export const adminSetLecturerEnabled = (userId, enabled) => rpc('admin_set_lecturer_enabled', { p_user_id: userId, p_enabled: enabled });
export const adminAssignCourse = (lecturerId, courseId) => rpc('admin_assign_lecturer_course', { p_lecturer: lecturerId, p_course: courseId });
export const adminUnassignCourse = (lecturerId, courseId) => rpc('admin_unassign_lecturer_course', { p_lecturer: lecturerId, p_course: courseId });

export async function inviteLecturer({ email, fullName }) {
  const client = sb();
  const { data, error } = await client.functions.invoke('invite-lecturer', {
    body: { email, fullName, redirectTo: `${window.location.origin}/update-password` },
  });
  if (error || data?.error) {
    throw new Error(data?.error || 'The invite-lecturer Edge Function is not deployed yet. Deploy supabase/functions/invite-lecturer (see supabase/functions/README.md), or register the account normally and use “Promote existing account” below — that path works today.');
  }
  return data;
}

/** Upload a private teaching file with real progress (XHR, not fetch). */
export function uploadLecturerFile(lecturerId, courseId, file, onProgress) {
  return new Promise((resolve, reject) => {
    (async () => {
      const client = sb();
      const { data: sessionData } = await client.auth.getSession();
      const token = sessionData?.session?.access_token;
      const url = import.meta.env.VITE_SUPABASE_URL;
      const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!token || !url) throw new Error('Your session expired. Sign in again, then retry the upload.');
      const safe = String(file.name || 'material').replace(/[^A-Za-z0-9._-]+/g, '-');
      const path = `${lecturerId}/${courseId}/${Date.now()}-${safe}`;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${url}/storage/v1/object/${LECTURER_FILE_BUCKET}/${path}`);
      xhr.setRequestHeader('apikey', anon); xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.setRequestHeader('x-upsert', 'false');
      xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100)); };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300
        ? resolve(path)
        : reject(new Error(`Upload failed (${xhr.status}). Check your connection and retry — the draft was not submitted.`)));
      xhr.onerror = () => reject(new Error('Upload failed: network error. Check your connection and retry.'));
      xhr.onabort = () => reject(new Error('Upload cancelled.'));
      xhr.send(file);
    })().catch(reject);
  });
}
