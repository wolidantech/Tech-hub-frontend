import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  getCategories, saveCategories, getQuizzes, saveQuizzes, getQuizQuestions, saveQuizQuestions,
  getQuizAttempts, saveQuizAttempts, getAssignments, saveAssignments, getSubmissions, saveSubmissions,
  getCoupons, saveCoupons, getRedemptions, saveRedemptions, getAIJobs, saveAIJobs,
  getAIContent, saveAIContent, getCompletionRules, saveCompletionRules, getAuditLogs, saveAuditLogs,
  getAnnouncements, saveAnnouncements, getCourseViews, saveCourseViews, getLearningEvents, saveLearningEvents,
  generateId, generateVerificationCode, generateCertId,
} from '../lib/storage';
import { DEFAULT_CATEGORIES } from '../data/catalog';
import { validateCoupon, scoreQuizAttempt, AI_CONTENT_STATUSES } from '../lib/lms';
import { generate as aiGenerate, getActiveProviderName } from '../lib/ai';

const LMSContext = createContext(null);
export const useLMS = () => {
  const ctx = useContext(LMSContext);
  if (!ctx) throw new Error('useLMS must be used within LMSProvider');
  return ctx;
};

export const LMSProvider = ({ children }) => {
  const [categories, setCategories] = useState(() => getCategories() || DEFAULT_CATEGORIES);
  const [quizzes, setQuizzes] = useState(() => getQuizzes());
  const [quizQuestions, setQuizQuestions] = useState(() => getQuizQuestions());
  const [quizAttempts, setQuizAttempts] = useState(() => getQuizAttempts());
  const [assignments, setAssignments] = useState(() => getAssignments());
  const [submissions, setSubmissions] = useState(() => getSubmissions());
  const [coupons, setCoupons] = useState(() => getCoupons());
  const [redemptions, setRedemptions] = useState(() => getRedemptions());
  const [aiJobs, setAIJobs] = useState(() => getAIJobs());
  const [aiContent, setAIContent] = useState(() => getAIContent());
  const [completionRules, setCompletionRules] = useState(() => getCompletionRules());
  const [auditLogs, setAuditLogs] = useState(() => getAuditLogs());
  const [announcements, setAnnouncements] = useState(() => getAnnouncements());
  const [courseViews, setCourseViews] = useState(() => getCourseViews());
  const [learningEvents, setLearningEvents] = useState(() => getLearningEvents());
  const [learningPaths, setLearningPaths] = useState(() => getLearningPaths() || DEFAULT_LEARNING_PATHS);
  const [bundles, setBundles] = useState(() => getBundles());
  const [reviews, setReviews] = useState(() => getReviews());
  const [posts, setPosts] = useState(() => getPosts());
  const [comments, setComments] = useState(() => getComments());
  const [liveClasses, setLiveClasses] = useState(() => getLiveClasses());
  const [aiConvos, setAIConvos] = useState(() => getAIConvos());
  const [siteSettings, setSiteSettingsState] = useState(() => ({ ...DEFAULT_SITE_SETTINGS, ...(getSiteSettings() || {}) }));

  useEffect(() => saveCategories(categories), [categories]);
  useEffect(() => saveQuizzes(quizzes), [quizzes]);
  useEffect(() => saveQuizQuestions(quizQuestions), [quizQuestions]);
  useEffect(() => saveQuizAttempts(quizAttempts), [quizAttempts]);
  useEffect(() => saveAssignments(assignments), [assignments]);
  useEffect(() => saveSubmissions(submissions), [submissions]);
  useEffect(() => saveCoupons(coupons), [coupons]);
  useEffect(() => saveRedemptions(redemptions), [redemptions]);
  useEffect(() => saveAIJobs(aiJobs), [aiJobs]);
  useEffect(() => saveAIContent(aiContent), [aiContent]);
  useEffect(() => saveCompletionRules(completionRules), [completionRules]);
  useEffect(() => saveAuditLogs(auditLogs.slice(-500)), [auditLogs]);
  useEffect(() => saveAnnouncements(announcements), [announcements]);
  useEffect(() => saveCourseViews(courseViews.slice(-2000)), [courseViews]);
  useEffect(() => saveLearningEvents(learningEvents.slice(-3000)), [learningEvents]);
  useEffect(() => saveLearningPaths(learningPaths), [learningPaths]);
  useEffect(() => saveBundles(bundles), [bundles]);
  useEffect(() => saveReviews(reviews), [reviews]);
  useEffect(() => savePosts(posts.slice(-1000)), [posts]);
  useEffect(() => saveComments(comments.slice(-5000)), [comments]);
  useEffect(() => saveLiveClasses(liveClasses), [liveClasses]);
  useEffect(() => saveAIConvos(aiConvos.slice(-500)), [aiConvos]);
  useEffect(() => saveSiteSettings(siteSettings), [siteSettings]);

  // ---------------- Audit ----------------
  const audit = (actor, action, entityType, entityId, details = {}) => {
    const entry = { id: generateId(), actorEmail: actor?.email || 'system', actorName: actor?.fullName || 'System', action, entityType, entityId, details, createdAt: new Date().toISOString() };
    setAuditLogs((prev) => [entry, ...prev].slice(0, 500));
    return entry;
  };

  // ---------------- Categories ----------------
  const addCategory = (name, actor) => {
    const n = (name || '').trim();
    if (!n) throw new Error('Category name required');
    if (categories.includes(n)) throw new Error('Category already exists');
    setCategories((p) => [...p, n]);
    if (actor) audit(actor, 'category.create', 'category', n, {});
  };
  const renameCategory = (oldName, newName, actor) => {
    setCategories((p) => p.map((c) => (c === oldName ? newName : c)));
    if (actor) audit(actor, 'category.rename', 'category', oldName, { newName });
  };
  const deleteCategory = (name, actor) => {
    setCategories((p) => p.filter((c) => c !== name));
    if (actor) audit(actor, 'category.delete', 'category', name, {});
  };

  // ---------------- Quizzes ----------------
  const createQuiz = ({ courseId, moduleId = null, lessonId = null, title, description = '', passingScore = 70, allowRetake = true, isFinal = false, status = 'published' }) => {
    const q = { id: generateId(), courseId, moduleId, lessonId, title, description, passingScore: Number(passingScore), allowRetake, isFinal, status, createdAt: new Date().toISOString() };
    setQuizzes((p) => [q, ...p]);
    return q;
  };
  const updateQuiz = (id, updates) => setQuizzes((p) => p.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  const deleteQuiz = (id) => {
    setQuizzes((p) => p.filter((q) => q.id !== id));
    setQuizQuestions((p) => p.filter((q) => q.quizId !== id));
  };
  const addQuestion = (quizId, { type = 'multiple_choice', question, options = [], correctAnswer = 0, correctAnswers = [], explanation = '' }) => {
    const qq = { id: generateId(), quizId, type, question, options, correctAnswer, correctAnswers, explanation, createdAt: new Date().toISOString() };
    setQuizQuestions((p) => [...p, qq]);
    return qq;
  };
  const updateQuestion = (id, updates) => setQuizQuestions((p) => p.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  const deleteQuestion = (id) => setQuizQuestions((p) => p.filter((q) => q.id !== id));
  const getQuizWithQuestions = (quizId) => ({ ...quizzes.find((q) => q.id === quizId), questions: quizQuestions.filter((q) => q.quizId === quizId) });
  const getCourseQuizzes = (courseId) => quizzes.filter((q) => q.courseId === courseId && q.status === 'published');

  const submitQuizAttempt = ({ quizId, userId, answers }) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) throw new Error('Quiz not found');
    const prior = quizAttempts.filter((a) => a.quizId === quizId && a.userId === userId);
    if (prior.length > 0 && !quiz.allowRetake) throw new Error('Retakes are not allowed for this quiz');
    if (quiz.attemptLimit && prior.length >= quiz.attemptLimit) throw new Error(`Attempt limit reached (${quiz.attemptLimit}). Contact your instructor.`);
    const questions = quizQuestions.filter((q) => q.quizId === quizId);
    const result = scoreQuizAttempt(questions, answers);
    const attempt = {
      id: generateId(), quizId, courseId: quiz.courseId, userId, answers,
      score: result.score, earned: result.earned, total: result.total,
      passed: result.score >= quiz.passingScore, details: result.details,
      attemptNo: prior.length + 1, createdAt: new Date().toISOString(),
    };
    setQuizAttempts((p) => [attempt, ...p]);
    setLearningEvents((p) => [...p, { id: generateId(), userId, courseId: quiz.courseId, kind: 'quiz_attempt', refId: attempt.id, createdAt: attempt.createdAt }]);
    return attempt;
  };
  const getUserAttempts = (userId, quizId = null) => quizAttempts.filter((a) => a.userId === userId && (!quizId || a.quizId === quizId));
  const getUserQuizAverage = (userId, courseId) => {
    // Best attempt per quiz, averaged
    const courseQuizIds = quizzes.filter((q) => q.courseId === courseId).map((q) => q.id);
    const best = {};
    quizAttempts.filter((a) => a.userId === userId && courseQuizIds.includes(a.quizId)).forEach((a) => {
      best[a.quizId] = Math.max(best[a.quizId] || 0, a.score);
    });
    const vals = Object.values(best);
    return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
  };
  const resetQuizAttempts = (userId, quizId, actor) => {
    setQuizAttempts((p) => p.filter((a) => !(a.userId === userId && a.quizId === quizId)));
    if (actor) audit(actor, 'quiz.reset_attempts', 'quiz', quizId, { userId });
  };

  // ---------------- Assignments ----------------
  const createAssignment = ({ courseId, moduleId = null, lessonId = null, title, description = '', instructions = '', requiredOutput = '', maxScore = 100, isFinalProject = false, status = 'published', deadline = '', submissionType = 'any' }) => {
    const a = { id: generateId(), courseId, moduleId, lessonId, title, description, instructions, requiredOutput, maxScore: Number(maxScore), isFinalProject, status, deadline, submissionType, createdAt: new Date().toISOString() };
    setAssignments((p) => [a, ...p]);
    return a;
  };
  const updateAssignment = (id, updates) => setAssignments((p) => p.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  const deleteAssignment = (id) => setAssignments((p) => p.filter((a) => a.id !== id));
  const getCourseAssignments = (courseId) => assignments.filter((a) => a.courseId === courseId && a.status === 'published');

  const submitAssignment = ({ assignmentId, userId, studentName, kind = 'file', fileData = null, fileName = '', fileType = '', fileSize = 0, textContent = '', linkUrl = '', note = '' }) => {
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg) throw new Error('Assignment not found');
    if (kind === 'text' && !String(textContent).trim()) throw new Error('Please write your answer before submitting');
    if (kind === 'link' && !/^https?:\/\//i.test(linkUrl)) throw new Error('Please enter a valid link starting with http');
    if (kind === 'file' && !fileData) throw new Error('Please select a file to upload');
    const late = asg.deadline ? new Date() > new Date(asg.deadline) : false;
    const sub = {
      id: generateId(), assignmentId, courseId: asg.courseId, userId, studentName,
      kind, fileData, fileName, fileType, fileSize, textContent, linkUrl, note, late,
      status: 'submitted', score: null, feedback: '', reviewedBy: null, reviewedAt: null,
      submittedAt: new Date().toISOString(),
    };
    setSubmissions((p) => [sub, ...p]);
    setLearningEvents((p) => [...p, { id: generateId(), userId, courseId: asg.courseId, kind: 'assignment_submit', refId: sub.id, createdAt: sub.submittedAt }]);
    return sub;
  };
  const reviewSubmission = ({ submissionId, status, score = null, feedback = '', actor }) => {
    if (!['under_review', 'approved', 'needs_revision'].includes(status)) throw new Error('Invalid status');
    setSubmissions((p) => p.map((s) => (s.id === submissionId ? { ...s, status, score, feedback, reviewedBy: actor?.email, reviewedAt: new Date().toISOString() } : s)));
    if (actor) audit(actor, `submission.${status}`, 'submission', submissionId, { score });
    return submissions.find((s) => s.id === submissionId);
  };
  const getUserSubmissions = (userId, courseId = null) => submissions.filter((s) => s.userId === userId && (!courseId || s.courseId === courseId));
  const countApprovedAssignments = (userId, courseId) => submissions.filter((s) => s.userId === userId && s.courseId === courseId && s.status === 'approved').length;
  const isFinalProjectApproved = (userId, courseId) => {
    const finals = assignments.filter((a) => a.courseId === courseId && a.isFinalProject).map((a) => a.id);
    if (!finals.length) return false;
    return submissions.some((s) => s.userId === userId && finals.includes(s.assignmentId) && s.status === 'approved');
  };

  // ---------------- Coupons ----------------
  const createCoupon = ({ code, courseId = 'ALL', discountType = 'percentage', discountValue = 10, maxUses = 100, expiresAt = null, minPurchase = 0, active = true, restrictedTo = {}, actor }) => {
    const c = (code || '').trim().toUpperCase();
    if (!c) throw new Error('Coupon code required');
    if (coupons.some((x) => x.code === c)) throw new Error('Coupon code already exists');
    const coupon = {
      id: generateId(), code: c, courseId, discountType,
      discountValue: Number(discountValue), maxUses: maxUses == null ? null : Number(maxUses),
      usedCount: 0, expiresAt, minPurchase: Number(minPurchase), active,
      restrictedTo, createdBy: actor?.email || 'admin', createdAt: new Date().toISOString(),
    };
    setCoupons((p) => [coupon, ...p]);
    if (actor) audit(actor, 'coupon.create', 'coupon', coupon.id, { code: c, courseId, discountType, discountValue });
    return coupon;
  };
  const updateCoupon = (id, updates, actor) => {
    setCoupons((p) => p.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    if (actor) audit(actor, 'coupon.update', 'coupon', id, updates);
  };
  const deleteCoupon = (id, actor) => {
    setCoupons((p) => p.filter((c) => c.id !== id));
    if (actor) audit(actor, 'coupon.delete', 'coupon', id, {});
  };
  const getCouponByCode = (code) => coupons.find((c) => c.code === String(code || '').trim().toUpperCase());

  const validateCouponForUser = (code, { courseId, coursePrice, user }) => {
    const coupon = getCouponByCode(code);
    const redemptionCount = redemptions.filter((r) => r.couponId === coupon?.id).length;
    return { coupon, ...validateCoupon(coupon, { courseId, coursePrice, user, redemptionCount }) };
  };

  const recordRedemption = ({ couponId, userId, courseId, discount, amountDue }) => {
    const coupon = coupons.find((c) => c.id === couponId);
    if (!coupon) throw new Error('Coupon not found');
    const redemption = {
      id: generateId(), couponId, couponCode: coupon.code, userId, courseId,
      discount, amountDue, usedAt: new Date().toISOString(),
    };
    setRedemptions((p) => [redemption, ...p]);
    setCoupons((p) => p.map((c) => (c.id === couponId ? { ...c, usedCount: (c.usedCount || 0) + 1 } : c)));
    return redemption;
  };

  const couponStats = useMemo(() => ({
    total: coupons.length,
    active: coupons.filter((c) => c.active).length,
    redemptions: redemptions.length,
    freeRedemptions: redemptions.filter((r) => r.amountDue === 0).length,
  }), [coupons, redemptions]);

  // ---------------- AI Content Studio ----------------
  const runAIGeneration = async (kind, input, { actor, targetCourseId = null } = {}) => {
    const job = { id: generateId(), kind, input, status: 'running', provider: getActiveProviderName(), createdBy: actor?.email, createdAt: new Date().toISOString() };
    setAIJobs((p) => [job, ...p]);
    try {
      const out = await aiGenerate(kind, input);
      const content = {
        id: generateId(), jobId: job.id, kind, input,
        title: input.courseName || input.topic || input.title || `${kind} draft`,
        data: out.data, provider: out.provider,
        status: 'draft', // DRAFT ONLY — admin review required
        targetCourseId, createdBy: actor?.email, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      setAIContent((p) => [content, ...p]);
      setAIJobs((p) => p.map((j) => (j.id === job.id ? { ...j, status: 'completed', contentId: content.id } : j)));
      if (actor) audit(actor, 'ai.generate', 'ai_content', content.id, { kind, provider: out.provider });
      return content;
    } catch (err) {
      setAIJobs((p) => p.map((j) => (j.id === job.id ? { ...j, status: 'failed', error: err.message } : j)));
      throw err;
    }
  };
  const updateAIContent = (id, updates) => setAIContent((p) => p.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)));
  const setAIStatus = (id, status, actor) => {
    if (!AI_CONTENT_STATUSES.includes(status)) throw new Error('Invalid status');
    // Publishing requires prior approval
    const item = aiContent.find((c) => c.id === id);
    if (status === 'published' && item?.status !== 'approved') throw new Error('Content must be APPROVED before publishing');
    setAIContent((p) => p.map((c) => (c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c)));
    if (actor) audit(actor, `ai.${status}`, 'ai_content', id, {});
  };
  const deleteAIContent = (id, actor) => {
    setAIContent((p) => p.filter((c) => c.id !== id));
    if (actor) audit(actor, 'ai.delete', 'ai_content', id, {});
  };

  // ---------------- Completion rules ----------------
  const setCourseRules = (courseId, rules, actor) => {
    setCompletionRules((p) => ({ ...p, [courseId]: { ...(p[courseId] || {}), ...rules } }));
    if (actor) audit(actor, 'completion_rules.update', 'course', courseId, rules);
  };

  // ---------------- Certificates helpers (records live in CourseContext) ----------------
  const buildCertificateRecord = ({ userId, studentName, courseId, courseName, issuedBy }) => ({
    id: generateId(),
    certificateId: generateCertId(),
    verificationCode: generateVerificationCode(),
    userId, studentName, courseId, courseName,
    issueDate: new Date().toISOString(),
    issuedBy: issuedBy || 'WOLI DAN TECH HUB',
    status: 'valid',
  });

  // ---------------- Views / events / announcements ----------------
  const trackView = (userId, courseId) => {
    setCourseViews((p) => [...p, { id: generateId(), userId: userId || 'anon', courseId, createdAt: new Date().toISOString() }].slice(-2000));
  };
  const trackEvent = (userId, courseId, kind, refId = null) => {
    setLearningEvents((p) => [...p, { id: generateId(), userId, courseId, kind, refId, createdAt: new Date().toISOString() }].slice(-3000));
  };
  const sendAnnouncement = ({ title, message, courseId = null, actor }) => {
    const a = { id: generateId(), title, message, courseId, createdBy: actor?.email, createdAt: new Date().toISOString() };
    setAnnouncements((p) => [a, ...p]);
    if (actor) audit(actor, 'announcement.send', 'announcement', a.id, { courseId });
    return a;
  };

  // ---------------- Learning paths ----------------
  const createPath = (data, actor) => {
    const p = { id: generateId(), ...data, createdAt: new Date().toISOString() };
    setLearningPaths((prev) => [...prev, p]);
    if (actor) audit(actor, 'path.create', 'learning_path', p.id, { title: data.title });
    return p;
  };
  const updatePath = (id, updates, actor) => {
    setLearningPaths((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    if (actor) audit(actor, 'path.update', 'learning_path', id, updates);
  };
  const deletePath = (id, actor) => {
    setLearningPaths((prev) => prev.filter((p) => p.id !== id));
    if (actor) audit(actor, 'path.delete', 'learning_path', id, {});
  };

  // ---------------- Bundles ----------------
  const createBundle = (data, actor) => {
    const b = { id: generateId(), published: true, ...data, createdAt: new Date().toISOString() };
    setBundles((prev) => [b, ...prev]);
    if (actor) audit(actor, 'bundle.create', 'bundle', b.id, { title: data.title });
    return b;
  };
  const updateBundle = (id, updates, actor) => {
    setBundles((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    if (actor) audit(actor, 'bundle.update', 'bundle', id, updates);
  };
  const deleteBundle = (id, actor) => {
    setBundles((prev) => prev.filter((b) => b.id !== id));
    if (actor) audit(actor, 'bundle.delete', 'bundle', id, {});
  };
  const getBundleById = (id) => bundles.find((b) => b.id === id);

  // ---------------- Reviews ----------------
  const addReview = ({ courseId, userId, studentName, rating, text }) => {
    if (reviews.some((r) => r.courseId === courseId && r.userId === userId)) throw new Error('You already reviewed this course');
    const r = { id: generateId(), courseId, userId, studentName, rating: Math.max(1, Math.min(5, Number(rating))), text: String(text || '').slice(0, 1000), status: 'published', createdAt: new Date().toISOString() };
    setReviews((prev) => [r, ...prev]);
    setLearningEvents((p) => [...p, { id: generateId(), userId, courseId, kind: 'review', refId: r.id, createdAt: r.createdAt }]);
    return r;
  };
  const moderateReview = (id, status, actor) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    if (actor) audit(actor, `review.${status}`, 'review', id, {});
  };
  const deleteReview = (id, actor) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    if (actor) audit(actor, 'review.delete', 'review', id, {});
  };
  const getCourseReviews = (courseId) => reviews.filter((r) => r.courseId === courseId && r.status === 'published');
  const getCourseRating = (courseId, fallback = 4.8) => {
    const rs = getCourseReviews(courseId);
    if (!rs.length) return fallback;
    return Math.round((rs.reduce((s, r) => s + r.rating, 0) / rs.length) * 10) / 10;
  };

  // ---------------- Community ----------------
  const createPost = ({ courseId, lessonId = null, userId, authorName, title, body }) => {
    const p = { id: generateId(), courseId, lessonId, userId, authorName, title: String(title || '').slice(0, 140), body: String(body || '').slice(0, 3000), pinned: false, createdAt: new Date().toISOString() };
    setPosts((prev) => [p, ...prev]);
    return p;
  };
  const togglePinPost = (id, actor) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)));
    if (actor) audit(actor, 'community.pin', 'post', id, {});
  };
  const deletePost = (id, actor) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setComments((prev) => prev.filter((c) => c.postId !== id));
    if (actor) audit(actor, 'community.delete_post', 'post', id, {});
  };
  const addComment = ({ postId, userId, authorName, body, isAdmin = false }) => {
    const c = { id: generateId(), postId, userId, authorName, body: String(body || '').slice(0, 2000), isAdmin, createdAt: new Date().toISOString() };
    setComments((prev) => [...prev, c]);
    return c;
  };
  const deleteComment = (id, actor) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    if (actor) audit(actor, 'community.delete_comment', 'comment', id, {});
  };
  const getCoursePosts = (courseId) => posts.filter((p) => p.courseId === courseId).sort((a, b) => (b.pinned - a.pinned) || (new Date(b.createdAt) - new Date(a.createdAt)));
  const getPostComments = (postId) => comments.filter((c) => c.postId === postId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // ---------------- Live classes ----------------
  const createLiveClass = (data, actor) => {
    const l = { id: generateId(), ...data, createdAt: new Date().toISOString() };
    setLiveClasses((prev) => [l, ...prev]);
    if (actor) audit(actor, 'live.create', 'live_class', l.id, { title: data.title });
    return l;
  };
  const updateLiveClass = (id, updates, actor) => {
    setLiveClasses((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    if (actor) audit(actor, 'live.update', 'live_class', id, updates);
  };
  const deleteLiveClass = (id, actor) => {
    setLiveClasses((prev) => prev.filter((l) => l.id !== id));
    if (actor) audit(actor, 'live.delete', 'live_class', id, {});
  };
  const getUpcomingClasses = (courseIds = null) => liveClasses
    .filter((l) => new Date(`${l.date}T${l.time || '00:00'}`) >= new Date(Date.now() - 2 * 3600 * 1000))
    .filter((l) => !courseIds || !l.courseId || courseIds.includes(l.courseId))
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  // ---------------- DanTECH AI conversations ----------------
  const saveConvo = (convo) => {
    setAIConvos((prev) => {
      const rest = prev.filter((c) => c.id !== convo.id);
      return [convo, ...rest].slice(0, 500);
    });
  };
  const getUserConvos = (userId) => aiConvos.filter((c) => c.userId === userId);
  const deleteConvo = (id) => setAIConvos((prev) => prev.filter((c) => c.id !== id));

  // ---------------- Site settings ----------------
  const updateSiteSettings = (updates, actor) => {
    setSiteSettingsState((prev) => ({ ...prev, ...updates }));
    if (actor) audit(actor, 'settings.update', 'site_settings', 'global', updates);
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
      categories, addCategory, renameCategory, deleteCategory,
      quizzes, quizQuestions, quizAttempts,
      createQuiz, updateQuiz, deleteQuiz, addQuestion, updateQuestion, deleteQuestion,
      getQuizWithQuestions, getCourseQuizzes, submitQuizAttempt, getUserAttempts, getUserQuizAverage, resetQuizAttempts,
      assignments, submissions,
      createAssignment, updateAssignment, deleteAssignment, getCourseAssignments,
      submitAssignment, reviewSubmission, getUserSubmissions, countApprovedAssignments, isFinalProjectApproved,
      coupons, redemptions, createCoupon, updateCoupon, deleteCoupon, getCouponByCode,
      validateCouponForUser, recordRedemption, couponStats,
      aiJobs, aiContent, runAIGeneration, updateAIContent, setAIStatus, deleteAIContent,
      completionRules, setCourseRules, buildCertificateRecord,
      auditLogs, audit,
      announcements, sendAnnouncement,
      courseViews, trackView, learningEvents, trackEvent,
      learningPaths, createPath, updatePath, deletePath,
      bundles, createBundle, updateBundle, deleteBundle, getBundleById,
      reviews, addReview, moderateReview, deleteReview, getCourseReviews, getCourseRating,
      posts, comments, createPost, togglePinPost, deletePost, addComment, deleteComment, getCoursePosts, getPostComments,
      liveClasses, createLiveClass, updateLiveClass, deleteLiveClass, getUpcomingClasses,
      aiConvos, saveConvo, getUserConvos, deleteConvo,
      siteSettings, updateSiteSettings,
      adminLMSStats,
    }}>
      {children}
    </LMSContext.Provider>
  );
};
