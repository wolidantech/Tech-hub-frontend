import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useCourses } from './CourseContext';
import { subscribeChanges } from '../lib/supabase';
import { AI_CONTENT_STATUSES } from '../lib/lms';
import { generate as aiGenerate, getActiveProviderName } from '../lib/ai';
import {
  fetchCategories, adminCreateCategory, adminRenameCategory, adminDeleteCategory,
  fetchQuizzes, fetchQuizQuestionsAdmin, fetchQuizQuestionsRpc, fetchQuizReviewRpc,
  submitAttemptRpc, fetchMyAttempts, fetchAllAttempts, adminDeleteAttempts,
  adminCreateQuiz, adminUpdateQuiz, adminDeleteQuiz,
  adminAddQuestion, adminUpdateQuestion, adminDeleteQuestion,
  fetchAssignments, fetchMySubmissions, fetchAllSubmissions, submitSubmissionRow,
  uploadSubmissionFile, reviewSubmissionRow,
  submitPracticalRow, fetchMyPracticalSubmissions, fetchAllPracticalSubmissions, reviewPracticalSubmission,
  adminCreateAssignment, adminUpdateAssignment, adminDeleteAssignment,
  validateCouponRpc, redeemCouponRpc, fetchCoupons, adminCreateCoupon, adminUpdateCoupon,
  adminDeleteCoupon, fetchRedemptions,
  fetchAIJobs, createAIJob, updateAIJob, fetchAIContent, createAIContent,
  updateAIContentRow, deleteAIContentRow,
  fetchRules, saveRules, logAudit, fetchAuditLogs,
  fetchAnnouncements, createAnnouncement, deleteAnnouncement,
  logEvent, fetchMyEvents, fetchAllEvents,
  fetchPaths, adminSavePath, adminDeletePath,
  fetchBundles, adminSaveBundle, adminDeleteBundle,
  fetchCourseReviews, fetchAllReviews, addReviewRow, moderateReview as moderateReviewRow, deleteReview as deleteReviewRow,
  fetchPosts, createPostRow, adminTogglePin, adminDeletePost,
  fetchComments, createCommentRow, adminDeleteComment,
  fetchLiveClasses, adminSaveLive, adminDeleteLive,
  fetchMyConvos, saveConvoRow, deleteConvoRow,
  fetchSettings, updateSettings,
} from '../lib/store';

const LMSContext = createContext(null);
export const useLMS = () => {
  const ctx = useContext(LMSContext);
  if (!ctx) throw new Error('useLMS must be used within LMSProvider');
  return ctx;
};

export const mapPracticalSubmission = (s) => (s ? {
  id: s.id, practicalId: s.practical_id ?? s.practicalId, courseId: s.course_id ?? s.courseId,
  lessonId: s.lesson_id ?? s.lessonId, userId: s.user_id ?? s.userId,
  studentName: s.student_name ?? s.studentName ?? '', storagePath: s.storage_path ?? s.storagePath,
  fileName: s.file_name ?? s.fileName ?? '', fileType: s.file_type ?? s.fileType ?? '',
  fileSize: Number(s.file_size ?? s.fileSize ?? 0), textContent: s.text_content ?? s.textContent ?? '',
  observation: s.observation ?? '', note: s.note ?? '', status: s.status || 'submitted',
  score: s.score != null ? Number(s.score) : null, feedback: s.feedback ?? '',
  reviewedBy: s.reviewed_by ?? s.reviewedBy, reviewedAt: s.reviewed_at ?? s.reviewedAt,
  submittedAt: s.submitted_at ?? s.submittedAt,
} : s);

export const LMSProvider = ({ children }) => {
  const { user } = useAuth();
  const { getCourseBySlug, getCourseById } = useCourses();
  const isAdmin = user?.role === 'admin';

  const [categories, setCategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [practicalSubs, setPracticalSubs] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [aiJobs, setAIJobs] = useState([]);
  const [aiContent, setAIContent] = useState([]);
  const [completionRules, setCompletionRules] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [learningEvents, setLearningEvents] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [aiConvos, setAIConvos] = useState([]);
  const [siteSettings, setSiteSettingsState] = useState(null);
  const [lmsLoading, setLmsLoading] = useState(true);

  // ---------- Public bootstrap ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      setLmsLoading(true);
      try {
        const [cats, anns, paths, bunds, live, settings, rules] = await Promise.all([
          fetchCategories().catch(() => []),
          fetchAnnouncements().catch(() => []),
          fetchPaths().catch(() => []),
          fetchBundles().catch(() => []),
          fetchLiveClasses().catch(() => []),
          fetchSettings().catch(() => null),
          fetchRules().catch(() => ({})),
        ]);
        if (!alive) return;
        setCategories(cats); setAnnouncements(anns); setLearningPaths(paths);
        setBundles(bunds); setLiveClasses(live);
        if (settings) setSiteSettingsState(settings);
        setCompletionRules(rules);
      } finally {
        if (alive) setLmsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // ---------- Role-scoped data ----------
  useEffect(() => {
    if (!user) {
      setQuizAttempts([]); setSubmissions([]); setLearningEvents([]);
      setCoupons([]); setRedemptions([]); setAIJobs([]); setAIContent([]);
      setAuditLogs([]); setAIConvos([]); setReviews([]); setQuizQuestions([]);
      setQuizzes([]); setAssignments([]); setPosts([]); setComments([]);
      return;
    }
    let alive = true;
    (async () => {
      try {
        // RLS automatically scopes quizzes/assignments to enrolled courses for students.
        const [qz, asg] = await Promise.all([fetchQuizzes().catch(() => []), fetchAssignments().catch(() => [])]);
        if (!alive) return;
        setQuizzes(qz); setAssignments(asg);
        if (user.role === 'admin') {
          const [att, sub, ev, coup, red, jobs, content, logs, revs, prsub] = await Promise.all([
            fetchAllAttempts().catch(() => []), fetchAllSubmissions().catch(() => []),
            fetchAllEvents().catch(() => []), fetchCoupons().catch(() => []),
            fetchRedemptions().catch(() => []), fetchAIJobs().catch(() => []),
            fetchAIContent().catch(() => []), fetchAuditLogs().catch(() => []),
            fetchAllReviews().catch(() => []), fetchAllPracticalSubmissions().catch(() => []),
          ]);
          if (!alive) return;
          setQuizAttempts(att); setSubmissions(sub); setLearningEvents(ev);
          setCoupons(coup); setRedemptions(red); setAIJobs(jobs); setAIContent(content);
          setAuditLogs(logs); setReviews(revs);
          setPracticalSubs((prsub || []).map(mapPracticalSubmission));
        } else {
          const [att, sub, ev, convos, prsub] = await Promise.all([
            fetchMyAttempts(user.id).catch(() => []), fetchMySubmissions(user.id).catch(() => []),
            fetchMyEvents(user.id).catch(() => []), fetchMyConvos(user.id).catch(() => []),
            fetchMyPracticalSubmissions(user.id).catch(() => []),
          ]);
          if (!alive) return;
          setQuizAttempts(att); setSubmissions(sub); setLearningEvents(ev); setAIConvos(convos);
          setPracticalSubs((prsub || []).map(mapPracticalSubmission));
        }
      } catch (err) {
        console.error('[lms] failed to load:', err.message);
      }
    })();
    return () => { alive = false; };
  }, [user]);

  // ---------- Realtime: announcements (+ admin review queues) ----------
  useEffect(() => {
    if (!user) return undefined;
    const unsubs = [];
    try {
      unsubs.push(subscribeChanges({
        channel: 'announcements', table: 'announcements',
        callback: () => { fetchAnnouncements().then(setAnnouncements).catch(() => {}); },
      }));
      if (user.role === 'admin') {
        unsubs.push(subscribeChanges({
          channel: 'admin-subs', table: 'assignment_submissions',
          callback: () => { fetchAllSubmissions().then(setSubmissions).catch(() => {}); },
        }));
        unsubs.push(subscribeChanges({
          channel: 'admin-rev', table: 'reviews',
          callback: () => { fetchAllReviews().then(setReviews).catch(() => {}); },
        }));
      }
    } catch { /* realtime unavailable */ }
    return () => unsubs.forEach((u) => { try { u(); } catch {} });
  }, [user]);

  // ---------------- Audit ----------------
  const audit = useCallback(async (actor, action, entityType, entityId, details = {}) => {
    await logAudit({
      actorEmail: actor?.email || 'system', actorName: actor?.fullName || 'System',
      action, entityType, entityId, details,
    });
  }, []);

  // ---------------- Categories ----------------
  const addCategory = async (name, actor) => {
    await adminCreateCategory(name);
    setCategories((p) => [...p, String(name).trim()]);
    if (actor) audit(actor, 'category.create', 'category', name, {});
  };
  const renameCategory = async (oldName, newName, actor) => {
    await adminRenameCategory(oldName, newName);
    setCategories((p) => p.map((c) => (c === oldName ? newName : c)));
    if (actor) audit(actor, 'category.rename', 'category', oldName, { newName });
  };
  const deleteCategory = async (name, actor) => {
    await adminDeleteCategory(name);
    setCategories((p) => p.filter((c) => c !== name));
    if (actor) audit(actor, 'category.delete', 'category', name, {});
  };

  // ---------------- Quizzes ----------------
  const createQuiz = async (input) => {
    const q = await adminCreateQuiz(input);
    setQuizzes((p) => [q, ...p]);
    return q;
  };
  const updateQuiz = async (id, updates) => {
    const q = await adminUpdateQuiz(id, updates);
    setQuizzes((p) => p.map((x) => (x.id === id ? q : x)));
    return q;
  };
  const deleteQuiz = async (id) => {
    await adminDeleteQuiz(id);
    setQuizzes((p) => p.filter((q) => q.id !== id));
    setQuizQuestions((p) => p.filter((q) => q.quizId !== id));
  };
  const addQuestion = async (quizId, q) => {
    const created = await adminAddQuestion(quizId, q);
    setQuizQuestions((p) => [...p, created]);
    return created;
  };
  const updateQuestion = async (id, updates) => {
    const q = await adminUpdateQuestion(id, updates);
    setQuizQuestions((p) => p.map((x) => (x.id === id ? q : x)));
    return q;
  };
  const deleteQuestion = async (id) => {
    await adminDeleteQuestion(id);
    setQuizQuestions((p) => p.filter((q) => q.id !== id));
  };
  // Admin: load full questions (with answers) for one quiz into cache.
  const ensureQuizQuestions = useCallback(async (quizId) => {
    const rows = await fetchQuizQuestionsAdmin(quizId);
    setQuizQuestions((prev) => [...prev.filter((q) => q.quizId !== quizId), ...rows]);
    return rows;
  }, []);
  // Student: questions WITHOUT answers (secure RPC). Never exposes answer keys.
  const fetchQuizForTaker = useCallback(async (quizId) => fetchQuizQuestionsRpc(quizId), []);
  // Student: questions WITH answers — only after attempting (secure RPC).
  const fetchQuizReview = useCallback(async (quizId) => fetchQuizReviewRpc(quizId), []);
  const getCourseQuizzes = useCallback((courseId) =>
    quizzes.filter((q) => q.courseId === courseId && q.status === 'published'), [quizzes]);

  const submitQuizAttempt = async ({ quizId, userId, answers }) => {
    const attempt = await submitAttemptRpc(quizId, answers);
    setQuizAttempts((p) => [attempt, ...p]);
    return attempt;
  };
  const getUserAttempts = useCallback((userId, quizId = null) =>
    quizAttempts.filter((a) => a.userId === userId && (!quizId || a.quizId === quizId)), [quizAttempts]);
  const getUserQuizAverage = useCallback((userId, courseId) => {
    const courseQuizIds = quizzes.filter((q) => q.courseId === courseId).map((q) => q.id);
    const best = {};
    quizAttempts.filter((a) => a.userId === userId && courseQuizIds.includes(a.quizId)).forEach((a) => {
      best[a.quizId] = Math.max(best[a.quizId] || 0, a.score);
    });
    const vals = Object.values(best);
    return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
  }, [quizzes, quizAttempts]);
  const resetQuizAttempts = async (userId, quizId, actor) => {
    await adminDeleteAttempts(userId, quizId);
    setQuizAttempts((p) => p.filter((a) => !(a.userId === userId && a.quizId === quizId)));
    if (actor) audit(actor, 'quiz.reset_attempts', 'quiz', quizId, { userId });
  };

  // ---------------- Assignments ----------------
  const createAssignment = async (input) => {
    const a = await adminCreateAssignment(input);
    setAssignments((p) => [a, ...p]);
    return a;
  };
  const updateAssignment = async (id, updates) => {
    const a = await adminUpdateAssignment(id, updates);
    setAssignments((p) => p.map((x) => (x.id === id ? a : x)));
    return a;
  };
  const deleteAssignment = async (id) => {
    await adminDeleteAssignment(id);
    setAssignments((p) => p.filter((a) => a.id !== id));
  };
  const getCourseAssignments = useCallback((courseId) =>
    assignments.filter((a) => a.courseId === courseId && a.status === 'published'), [assignments]);

  const submitAssignment = async ({ assignmentId, userId, studentName, kind = 'file', file = null, textContent = '', linkUrl = '', note = '', onProgress = null }) => {
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg) throw new Error('Assignment not found');
    if (kind === 'text' && !String(textContent).trim()) throw new Error('Please write your answer before submitting');
    if (kind === 'link' && !/^https?:\/\//i.test(linkUrl)) throw new Error('Please enter a valid link starting with http');
    if (kind === 'file' && !file) throw new Error('Please select a file to upload');
    let storagePath = null;
    let fileName = '';
    let fileType = '';
    let fileSize = 0;
    if (kind === 'file' && file) {
      storagePath = await uploadSubmissionFile(userId, file, onProgress);
      fileName = file.name; fileType = file.type; fileSize = file.size;
    }
    const late = asg.deadline ? new Date() > new Date(asg.deadline) : false;
    const sub = await submitSubmissionRow({
      assignmentId, courseId: asg.courseId, userId, studentName, kind,
      storagePath, fileName, fileType, fileSize, textContent, linkUrl, note, late,
    });
    logEvent({ userId, courseId: asg.courseId, kind: 'assignment_submit', refId: sub.id });
    setSubmissions((p) => [sub, ...p]);
    return sub;
  };

  // ---------- Practical submissions (lesson_practicals → practical_submissions) ----------
  const submitPractical = async ({ practical, userId, courseId, lessonId, studentName, file = null, observation = '', textContent = '', note = '', onProgress = null }) => {
    if (!practical) throw new Error('Practical not found');
    if (!file && !String(observation).trim() && !String(textContent).trim()) {
      throw new Error('Add your observation (or upload a file) before submitting');
    }
    let storagePath = null; let fileName = ''; let fileType = ''; let fileSize = 0;
    if (file) {
      storagePath = await uploadSubmissionFile(userId, file, onProgress);
      fileName = file.name; fileType = file.type; fileSize = file.size;
    }
    const sub = await submitPracticalRow({
      practicalId: practical.id, courseId, lessonId, userId, studentName,
      storagePath, fileName, fileType, fileSize, observation, textContent, note,
    });
    logEvent({ userId, courseId, kind: 'practical_submit', refId: sub.id || sub?.id });
    setPracticalSubs((p) => [mapPracticalSubmission(sub), ...p]);
    return sub;
  };

  const getMyPracticalSubmissions = useCallback((userId, practicalId = null) =>
    practicalSubs.filter((s) => s.userId === userId && (!practicalId || s.practicalId === practicalId)),
  [practicalSubs]);


  const reviewPractical = async ({ submissionId, status, score = null, feedback = '', actor }) => {
    const updated = await reviewPracticalSubmission(submissionId, { status, score, feedback, reviewedBy: actor?.email || '' });
    setPracticalSubs((p) => p.map((x) => (x.id === submissionId ? mapPracticalSubmission(updated) : x)));
    if (actor) audit(actor, `practical_submission.${status}`, 'practical_submission', submissionId, { score });
    return updated;
  };

  const reviewSubmission = async ({ submissionId, status, score = null, feedback = '', actor }) => {
    const updated = await reviewSubmissionRow(submissionId, { status, score, feedback, reviewedBy: actor?.email || '' });
    setSubmissions((p) => p.map((s) => (s.id === submissionId ? updated : s)));
    if (actor) audit(actor, `submission.${status}`, 'submission', submissionId, { score });
    return updated;
  };

  const getUserSubmissions = useCallback((userId, courseId = null) =>
    submissions.filter((s) => s.userId === userId && (!courseId || s.courseId === courseId)), [submissions]);
  const countApprovedAssignments = useCallback((userId, courseId) =>
    submissions.filter((s) => s.userId === userId && s.courseId === courseId && s.status === 'approved').length,
  [submissions]);
  const isFinalProjectApproved = useCallback((userId, courseId) => {
    const finals = assignments.filter((a) => a.courseId === courseId && a.isFinalProject).map((a) => a.id);
    if (!finals.length) return false;
    return submissions.some((s) => s.userId === userId && finals.includes(s.assignmentId) && s.status === 'approved');
  }, [assignments, submissions]);

  // ---------------- Coupons ----------------
  const createCoupon = async (input) => {
    const actor = input.actor;
    const coupon = await adminCreateCoupon(input, actor?.email);
    setCoupons((p) => [coupon, ...p]);
    if (actor) audit(actor, 'coupon.create', 'coupon', coupon.id, { code: coupon.code });
    return coupon;
  };
  const updateCoupon = async (id, updates, actor) => {
    const coupon = await adminUpdateCoupon(id, updates);
    setCoupons((p) => p.map((c) => (c.id === id ? coupon : c)));
    if (actor) audit(actor, 'coupon.update', 'coupon', id, updates);
    return coupon;
  };
  const deleteCoupon = async (id, actor) => {
    await adminDeleteCoupon(id);
    setCoupons((p) => p.filter((c) => c.id !== id));
    if (actor) audit(actor, 'coupon.delete', 'coupon', id, {});
  };
  const getCouponByCode = useCallback((code) =>
    coupons.find((c) => c.code === String(code || '').trim().toUpperCase()), [coupons]);

  // Server-side validation (no redemption). Students can call this safely.
  const validateCouponForUser = useCallback(async (code, { courseId }) =>
    validateCouponRpc(code, courseId), []);

  // Server-side redemption. FREE coupons instantly enroll (server enrolls + notifies).
  const recordRedemption = useCallback(async ({ code, couponCode, courseId }) =>
    redeemCouponRpc(code || couponCode, courseId), []);

  const couponStats = useMemo(() => ({
    total: coupons.length,
    active: coupons.filter((c) => c.active).length,
    redemptions: redemptions.length,
    freeRedemptions: redemptions.filter((r) => r.amountDue === 0).length,
  }), [coupons, redemptions]);

  // ---------------- AI Content Studio ----------------
  const runAIGeneration = async (kind, input, { actor, targetCourseId = null } = {}) => {
    const job = await createAIJob({ kind, input, provider: getActiveProviderName(), createdBy: actor?.email });
    setAIJobs((p) => [job, ...p]);
    try {
      const out = await aiGenerate(kind, input);
      const content = await createAIContent({
        jobId: job.id, kind, input,
        title: input.courseName || input.topic || input.title || `${kind} draft`,
        data: out.data, provider: out.provider, status: 'draft',
        targetCourseId, createdBy: actor?.email,
      });
      setAIContent((p) => [content, ...p]);
      await updateAIJob(job.id, { status: 'completed' });
      setAIJobs((p) => p.map((j) => (j.id === job.id ? { ...j, status: 'completed' } : j)));
      if (actor) audit(actor, 'ai.generate', 'ai_content', content.id, { kind, provider: out.provider });
      return content;
    } catch (err) {
      await updateAIJob(job.id, { status: 'failed', error: err.message }).catch(() => {});
      setAIJobs((p) => p.map((j) => (j.id === job.id ? { ...j, status: 'failed', error: err.message } : j)));
      throw err;
    }
  };
  const updateAIContent = async (id, updates) => {
    const c = await updateAIContentRow(id, updates);
    setAIContent((p) => p.map((x) => (x.id === id ? c : x)));
    return c;
  };
  const setAIStatus = async (id, status, actor) => {
    if (!AI_CONTENT_STATUSES.includes(status)) throw new Error('Invalid status');
    const item = aiContent.find((c) => c.id === id);
    if (status === 'published' && item?.status !== 'approved') throw new Error('Content must be APPROVED before publishing');
    const c = await updateAIContentRow(id, { status });
    setAIContent((p) => p.map((x) => (x.id === id ? c : x)));
    if (actor) audit(actor, `ai.${status}`, 'ai_content', id, {});
  };
  const deleteAIContent = async (id, actor) => {
    await deleteAIContentRow(id);
    setAIContent((p) => p.filter((c) => c.id !== id));
    if (actor) audit(actor, 'ai.delete', 'ai_content', id, {});
  };

  // ---------------- Completion rules ----------------
  const setCourseRules = async (courseId, rules, actor) => {
    await saveRules(courseId, rules);
    setCompletionRules((p) => ({ ...p, [courseId]: { ...(p[courseId] || {}), ...rules } }));
    if (actor) audit(actor, 'completion_rules.update', 'course', courseId, rules);
  };

  // ---------------- Views / events / announcements ----------------
  const trackView = useCallback((userId, courseId) => {
    if (!userId) return;
    logEvent({ userId, courseId, kind: 'course_view' });
  }, []);
  const trackEvent = useCallback((userId, courseId, kind, refId = null) => {
    if (!userId) return;
    logEvent({ userId, courseId, kind, refId });
  }, []);
  const courseViews = useMemo(() => learningEvents
    .filter((e) => e.kind === 'course_view')
    .map((e) => ({ id: e.id, userId: e.userId, courseId: e.courseId, createdAt: e.createdAt })),
  [learningEvents]);

  const sendAnnouncement = async ({ title, message, courseId = null, actor }) => {
    const a = await createAnnouncement({ title, message, courseId, createdBy: actor?.email });
    setAnnouncements((p) => [a, ...p]);
    if (actor) audit(actor, 'announcement.send', 'announcement', a.id, { courseId });
    return a;
  };
  const removeAnnouncement = async (id, actor) => {
    await deleteAnnouncement(id);
    setAnnouncements((p) => p.filter((a) => a.id !== id));
    if (actor) audit(actor, 'announcement.delete', 'announcement', id, {});
  };

  // ---------------- Learning paths ----------------
  const resolvePathCourseIds = useCallback((data) => {
    if (data.courseIds?.length) return data.courseIds;
    return (data.courseSlugs || []).map((s) => getCourseBySlug(s)?.id || getCourseById(s)?.id).filter(Boolean);
  }, [getCourseBySlug, getCourseById]);

  const withSlugs = useCallback((p) => ({
    ...p,
    courseSlugs: (p.courseIds || []).map((id) => getCourseById(id)?.slug).filter(Boolean),
  }), [getCourseById]);

  const pathsWithSlugs = useMemo(() => learningPaths.map(withSlugs), [learningPaths, withSlugs]);

  const createPath = async (data, actor) => {
    const p = withSlugs(await adminSavePath({ ...data, courseIds: resolvePathCourseIds(data) }));
    setLearningPaths((prev) => [...prev, p]);
    if (actor) audit(actor, 'path.create', 'learning_path', p.id, { title: data.title });
    return p;
  };
  const updatePath = async (id, updates, actor) => {
    const patch = { ...updates };
    if (updates.courseSlugs) patch.courseIds = resolvePathCourseIds(updates);
    const p = withSlugs(await adminSavePath(patch, id));
    setLearningPaths((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
    if (actor) audit(actor, 'path.update', 'learning_path', id, updates);
    return p;
  };
  const deletePath = async (id, actor) => {
    await adminDeletePath(id);
    setLearningPaths((prev) => prev.filter((p) => p.id !== id));
    if (actor) audit(actor, 'path.delete', 'learning_path', id, {});
  };

  // ---------------- Bundles ----------------
  const createBundle = async (data, actor) => {
    const b = await adminSaveBundle(data);
    setBundles((prev) => [b, ...prev]);
    if (actor) audit(actor, 'bundle.create', 'bundle', b.id, { title: data.title });
    return b;
  };
  const updateBundle = async (id, updates, actor) => {
    const b = await adminSaveBundle(updates, id);
    setBundles((prev) => prev.map((x) => (x.id === id ? { ...x, ...b } : x)));
    if (actor) audit(actor, 'bundle.update', 'bundle', id, updates);
    return b;
  };
  const deleteBundle = async (id, actor) => {
    await adminDeleteBundle(id);
    setBundles((prev) => prev.filter((b) => b.id !== id));
    if (actor) audit(actor, 'bundle.delete', 'bundle', id, {});
  };
  const getBundleById = useCallback((id) => bundles.find((b) => b.id === id), [bundles]);

  // ---------------- Reviews ----------------
  const ensureCourseReviews = useCallback(async (courseId) => {
    if (isAdmin) return reviews.filter((r) => r.courseId === courseId);
    const rows = await fetchCourseReviews(courseId);
    setReviews((prev) => [...prev.filter((r) => r.courseId !== courseId), ...rows]);
    return rows;
  }, [isAdmin, reviews]);
  const addReview = async ({ courseId, userId, studentName, rating, text }) => {
    const r = await addReviewRow({ courseId, userId, studentName, rating, text });
    setReviews((prev) => [r, ...prev]);
    return r;
  };
  const moderateReview = async (id, status, actor) => {
    await moderateReviewRow(id, status);
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    if (actor) audit(actor, `review.${status}`, 'review', id, {});
  };
  const deleteReview = async (id, actor) => {
    await deleteReviewRow(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    if (actor) audit(actor, 'review.delete', 'review', id, {});
  };
  const getCourseReviews = useCallback((courseId) =>
    reviews.filter((r) => r.courseId === courseId && r.status === 'published'), [reviews]);
  const getCourseRating = useCallback((courseId, fallback = 4.8) => {
    const rs = reviews.filter((r) => r.courseId === courseId && r.status === 'published');
    if (!rs.length) return fallback;
    return Math.round((rs.reduce((s, r) => s + r.rating, 0) / rs.length) * 10) / 10;
  }, [reviews]);

  // ---------------- Community ----------------
  const ensureCoursePosts = useCallback(async (courseId) => {
    const rows = await fetchPosts(courseId);
    setPosts((prev) => [...prev.filter((p) => p.courseId !== courseId), ...rows]);
    return rows;
  }, []);
  const ensurePostComments = useCallback(async (postId) => {
    const rows = await fetchComments(postId);
    setComments((prev) => [...prev.filter((c) => c.postId !== postId), ...rows]);
    return rows;
  }, []);
  const createPost = async ({ courseId, lessonId = null, userId, authorName, title, body }) => {
    const p = await createPostRow({ courseId, lessonId, userId, authorName, title, body });
    setPosts((prev) => [p, ...prev]);
    return p;
  };
  const togglePinPost = async (id, actor) => {
    const post = posts.find((p) => p.id === id);
    await adminTogglePin(id, !(post?.pinned));
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)));
    if (actor) audit(actor, 'community.pin', 'post', id, {});
  };
  const deletePost = async (id, actor) => {
    await adminDeletePost(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setComments((prev) => prev.filter((c) => c.postId !== id));
    if (actor) audit(actor, 'community.delete_post', 'post', id, {});
  };
  const addComment = async ({ postId, userId, authorName, body, isAdmin: admin = false }) => {
    const c = await createCommentRow({ postId, userId, authorName, body, isAdmin: admin });
    setComments((prev) => [...prev, c]);
    return c;
  };
  const deleteComment = async (id, actor) => {
    await adminDeleteComment(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
    if (actor) audit(actor, 'community.delete_comment', 'comment', id, {});
  };
  const getCoursePosts = useCallback((courseId) =>
    posts.filter((p) => p.courseId === courseId)
      .sort((a, b) => (b.pinned - a.pinned) || (new Date(b.createdAt) - new Date(a.createdAt))), [posts]);
  const getPostComments = useCallback((postId) =>
    comments.filter((c) => c.postId === postId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), [comments]);

  // ---------------- Live classes ----------------
  const createLiveClass = async (data, actor) => {
    const l = await adminSaveLive(data);
    setLiveClasses((prev) => [l, ...prev]);
    if (actor) audit(actor, 'live.create', 'live_class', l.id, { title: data.title });
    return l;
  };
  const updateLiveClass = async (id, updates, actor) => {
    const l = await adminSaveLive(updates, id);
    setLiveClasses((prev) => prev.map((x) => (x.id === id ? l : x)));
    if (actor) audit(actor, 'live.update', 'live_class', id, updates);
    return l;
  };
  const deleteLiveClass = async (id, actor) => {
    await adminDeleteLive(id);
    setLiveClasses((prev) => prev.filter((l) => l.id !== id));
    if (actor) audit(actor, 'live.delete', 'live_class', id, {});
  };
  const getUpcomingClasses = useCallback((courseIds = null) => liveClasses
    .filter((l) => new Date(`${l.date}T${l.time || '00:00'}`) >= new Date(Date.now() - 2 * 3600 * 1000))
    .filter((l) => !courseIds || !l.courseId || courseIds.includes(l.courseId))
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)), [liveClasses]);

  // ---------------- DanTECH AI conversations ----------------
  const saveConvo = async (convo) => {
    const saved = await saveConvoRow(convo);
    setAIConvos((prev) => {
      const rest = prev.filter((c) => c.id !== saved.id);
      return [saved, ...rest].slice(0, 100);
    });
    return saved;
  };
  const getUserConvos = useCallback((userId) => aiConvos.filter((c) => c.userId === userId), [aiConvos]);
  const deleteConvo = async (id) => {
    await deleteConvoRow(id);
    setAIConvos((prev) => prev.filter((c) => c.id !== id));
  };

  // ---------------- Site settings ----------------
  const updateSiteSettings = async (updates, actor) => {
    const current = siteSettings || {};
    const prevSocials = { facebook: current.facebook, instagram: current.instagram, twitter: current.twitter, youtube: current.youtube };
    const next = await updateSettings(updates, prevSocials);
    setSiteSettingsState(next);
    if (actor) audit(actor, 'settings.update', 'site_settings', 'global', updates);
    return next;
  };

  const adminLMSStats = useMemo(() => ({
    quizzes: quizzes.length,
    questions: quizQuestions.length,
    attempts: quizAttempts.length,
    passRate: quizAttempts.length ? Math.round((quizAttempts.filter((a) => a.passed).length / quizAttempts.length) * 100) : 0,
    assignments: assignments.length,
    submissions: submissions.length,
    pendingReviews: submissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length,
    coupons: couponStats,
    aiDrafts: aiContent.filter((c) => c.status === 'draft' || c.status === 'in_review').length,
    aiPublished: aiContent.filter((c) => c.status === 'published').length,
  }), [quizzes, quizQuestions, quizAttempts, assignments, submissions, couponStats, aiContent]);

  return (
    <LMSContext.Provider value={{
      lmsLoading,
      categories, addCategory, renameCategory, deleteCategory,
      quizzes, quizQuestions, quizAttempts,
      createQuiz, updateQuiz, deleteQuiz, addQuestion, updateQuestion, deleteQuestion,
      ensureQuizQuestions, fetchQuizForTaker, fetchQuizReview,
      getCourseQuizzes, submitQuizAttempt, getUserAttempts, getUserQuizAverage, resetQuizAttempts,
      assignments, submissions,
      createAssignment, updateAssignment, deleteAssignment, getCourseAssignments,
      submitAssignment, reviewSubmission, getUserSubmissions, countApprovedAssignments, isFinalProjectApproved,
      submitPractical, getMyPracticalSubmissions, reviewPractical, practicalSubs,
      coupons, redemptions, createCoupon, updateCoupon, deleteCoupon, getCouponByCode,
      validateCouponForUser, recordRedemption, couponStats,
      aiJobs, aiContent, runAIGeneration, updateAIContent, setAIStatus, deleteAIContent,
      completionRules, setCourseRules,
      auditLogs, audit,
      announcements, sendAnnouncement, removeAnnouncement,
      courseViews, trackView, learningEvents, trackEvent,
      learningPaths: pathsWithSlugs, createPath, updatePath, deletePath,
      bundles, createBundle, updateBundle, deleteBundle, getBundleById,
      reviews, addReview, moderateReview, deleteReview, getCourseReviews, getCourseRating, ensureCourseReviews,
      posts, comments, createPost, togglePinPost, deletePost, addComment, deleteComment,
      getCoursePosts, getPostComments, ensureCoursePosts, ensurePostComments,
      liveClasses, createLiveClass, updateLiveClass, deleteLiveClass, getUpcomingClasses,
      aiConvos, saveConvo, getUserConvos, deleteConvo,
      siteSettings, updateSiteSettings,
      adminLMSStats,
    }}>
      {children}
    </LMSContext.Provider>
  );
};
