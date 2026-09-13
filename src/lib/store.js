// Central Supabase data-access layer. The database is the ONLY source of
// truth — every function below reads/writes Postgres (via RLS) or Storage.
// Rows are mapped to the app's camelCase shapes at the boundary.
import { requireSb, friendlyError, uploadFile } from './supabase';

const sb = () => requireSb();
const num = (v, fb = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fb; };

async function one(query) {
  const { data, error } = await query;
  if (error) throw new Error(friendlyError(error));
  return data;
}

// ============================================================ MAPPERS
export const mapProfile = (p) => p && {
  id: p.id, fullName: p.full_name, email: p.email, phone: p.phone, role: p.role,
  avatar: p.avatar_url, bio: p.bio || '', skills: p.skills || [], interests: p.interests || [],
  skillLevel: p.skill_level, careerGoals: p.career_goals || [], onboarded: !!p.onboarded,
  banned: !!p.banned, lastLoginAt: p.last_login_at, createdAt: p.created_at,
  portfolioPublic: p.portfolio_public !== false, showCertificates: p.show_certificates !== false,
  showProjects: p.show_projects !== false,
};

export const mapCourseLight = (c) => c && {
  id: c.id, slug: c.slug, title: c.title,
  shortDescription: c.short_description || '', description: c.description || '',
  longDescription: c.long_description || '', category: c.category,
  instructor: c.instructor, instructorRole: c.instructor_role, duration: c.duration,
  lessonsCount: num(c.lessons_count), level: c.level, price: num(c.price),
  originalPrice: num(c.original_price), rating: num(c.rating, 5), students: num(c.students_count),
  thumbnail: c.thumbnail_key || 'default', thumbnailUrl: c.thumbnail_url,
  artTheme: c.art_theme, color: c.color, whatYouWillLearn: c.what_you_will_learn || [],
  requirements: c.requirements || [], audience: c.audience || [],
  published: !!c.published, featured: !!c.featured, archived: !!c.archived,
  createdAt: c.created_at, updatedAt: c.updated_at,
};

export const mapLesson = (l, contentById = {}, videosById = {}) => {
  const videos = videosById[l.id] || [];
  const primary = videos[0] || null;
  let videoUrl = '';
  let videoStoragePath = null;
  if (primary) {
    if (primary.provider === 'upload' || (primary.provider === 'ai_generated' && primary.storage_path)) {
      videoStoragePath = primary.storage_path;
    } else {
      videoUrl = primary.url || '';
    }
  }
  const text = contentById[l.id] || '';
  return {
    id: l.id, moduleId: l.module_id, title: l.title, type: l.type || 'video',
    duration: l.duration || '', videoUrl, videoStoragePath,
    textContent: text, content: text, resources: l.resources || [], subLessons: l.sub_lessons || [],
  };
};

export const mapEnrollment = (e) => e && {
  id: e.id, userId: e.user_id, courseId: e.course_id, status: e.status,
  method: e.method, couponCode: e.coupon_code, paymentId: e.payment_id,
  bundleId: e.bundle_id || null, approvedBy: e.approved_by, enrolledAt: e.enrolled_at,
};

const mimeFromName = (name = '') => {
  const ext = String(name).split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (['jpg', 'jpeg'].includes(ext)) return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  return '';
};

export const mapPayment = (p) => p && {
  id: p.id, userId: p.user_id, courseId: p.course_id, courseName: '',
  bundleId: p.bundle_id || null, bundleCourseIds: p.bundle_course_ids || [],
  studentName: p.student_name, email: p.email, phone: p.phone,
  amount: num(p.amount), originalAmount: p.original_amount,
  couponCode: p.coupon_code, couponDiscount: num(p.coupon_discount),
  transactionDate: p.transaction_date, reference: p.reference,
  receiptPath: p.receipt_path, receiptData: null,
  receiptName: (p.receipt_path || '').split('/').pop() || '',
  receiptType: mimeFromName(p.receipt_path), receiptSize: null,
  note: p.note || '',
  status: p.status, paymentMethod: 'Manual Bank Transfer',
  submittedAt: p.submitted_at, approvedBy: p.approved_by, approvedAt: p.approved_at,
  rejectedReason: p.rejected_reason, rejectedBy: p.rejected_by, rejectedAt: p.rejected_at,
};

export const mapCertificate = (c) => c && {
  id: c.id, certificateId: c.certificate_id, verificationCode: c.verification_code,
  userId: c.user_id, studentName: c.student_name, courseId: c.course_id,
  courseName: c.course_name, issueDate: c.issue_date, issuedBy: c.issued_by,
  status: c.status || 'valid', revokedAt: c.revoked_at,
};

export const mapNotification = (n) => n && {
  id: n.id, userId: n.user_id, type: n.type, title: n.title, message: n.message,
  courseId: n.course_id, paymentId: null, createdAt: n.created_at, read: !!n.read,
};

export const mapQuiz = (qz) => qz && {
  id: qz.id, courseId: qz.course_id, moduleId: qz.module_id, lessonId: qz.lesson_id,
  title: qz.title, description: qz.description || '', passingScore: num(qz.passing_score, 70),
  allowRetake: qz.allow_retake !== false, attemptLimit: qz.attempt_limit,
  isFinal: !!qz.is_final, status: qz.status, createdAt: qz.created_at,
};

export const mapQuestionFull = (q) => q && {
  id: q.id, quizId: q.quiz_id, type: q.type, question: q.question, options: q.options || [],
  correctAnswer: q.correct_answer, correctAnswers: q.correct_answers || [],
  acceptedAnswers: q.accepted_answers || [], explanation: q.explanation || '', createdAt: q.created_at,
};

export const mapAttempt = (a) => a && {
  id: a.id, quizId: a.quiz_id, courseId: a.quiz?.course_id || null, userId: a.user_id,
  answers: a.answers || {}, score: num(a.score), earned: num(a.earned), total: num(a.total),
  passed: !!a.passed, details: a.details || null, attemptNo: num(a.attempt_no, 1), createdAt: a.created_at,
};

export const mapAssignment = (a) => a && {
  id: a.id, courseId: a.course_id, moduleId: a.module_id, lessonId: a.lesson_id,
  title: a.title, description: a.description || '', instructions: a.instructions || '',
  requiredOutput: a.required_output || '', maxScore: num(a.max_score, 100),
  isFinalProject: !!a.is_final_project, status: a.status,
  deadline: a.deadline || '', submissionType: a.submission_type || 'any', createdAt: a.created_at,
};

export const mapSubmission = (s) => s && {
  id: s.id, assignmentId: s.assignment_id, courseId: s.course_id, userId: s.user_id,
  studentName: s.student_name, kind: s.kind || 'file',
  storagePath: s.storage_path, fileData: null,
  fileName: s.file_name || '', fileType: s.file_type || '', fileSize: s.file_size || 0,
  textContent: s.text_content || '', linkUrl: s.link_url || '', note: s.note || '',
  late: !!s.late, status: s.status, score: s.score, feedback: s.feedback || '',
  reviewedBy: s.reviewed_by, reviewedAt: s.reviewed_at, submittedAt: s.submitted_at,
};

export const mapCoupon = (c) => c && {
  id: c.id, code: c.code, courseId: c.course_id || 'ALL',
  discountType: c.discount_type, discountValue: num(c.discount_value),
  maxUses: c.max_uses, usedCount: num(c.used_count), expiresAt: c.expires_at,
  minPurchase: num(c.min_purchase), active: !!c.active,
  restrictedTo: {
    email: c.restricted_email || '', phone: c.restricted_phone || '', userId: c.restricted_user_id || '',
  },
  createdBy: c.created_by, createdAt: c.created_at,
};

export const mapRedemption = (r) => r && {
  id: r.id, couponId: r.coupon_id, couponCode: r.coupon_code, userId: r.user_id,
  courseId: r.course_id, discount: num(r.discount), amountDue: num(r.amount_due), usedAt: r.used_at,
};

export const mapAIJob = (j) => j && {
  id: j.id, kind: j.kind, input: j.input || {}, status: j.status,
  provider: j.provider, error: j.error, createdBy: j.created_by, createdAt: j.created_at, contentId: null,
};

export const mapAIContent = (c) => c && {
  id: c.id, jobId: c.job_id, kind: c.kind, title: c.title, input: c.input || {},
  data: c.data || {}, provider: c.provider, status: c.status,
  targetCourseId: c.target_course_id, createdBy: c.created_by,
  createdAt: c.created_at, updatedAt: c.updated_at,
};

export const mapRulesRow = (r) => ({
  requireLessonsPct: num(r.require_lessons_pct, 100), requireQuizAvg: num(r.require_quiz_avg),
  requireAssignmentsApproved: num(r.require_assignments_approved), requireFinalProject: !!r.require_final_project,
});

export const mapAudit = (a) => a && {
  id: a.id, actorEmail: a.actor_email, actorName: a.actor_name, action: a.action,
  entityType: a.entity_type, entityId: a.entity_id, details: a.details || {}, createdAt: a.created_at,
};

export const mapAnnouncement = (a) => a && {
  id: a.id, title: a.title, message: a.message, courseId: a.course_id,
  createdBy: a.created_by, createdAt: a.created_at,
};

export const mapEvent = (e) => e && {
  id: e.id, userId: e.user_id, courseId: e.course_id, kind: e.kind, refId: e.ref_id, createdAt: e.created_at,
};

export const mapPath = (p) => p && {
  id: p.id, title: p.title, desc: p.description || '', description: p.description || '',
  icon: p.icon || '🎯', level: p.level_range || '', levelRange: p.level_range || '',
  courseIds: p.course_ids || [], courseSlugs: [], isPublished: !!p.is_published,
  published: !!p.is_published, createdAt: p.created_at,
};

export const mapBundle = (b) => b && {
  id: b.id, title: b.title, description: b.description || '', courseIds: b.course_ids || [],
  price: num(b.price), originalPrice: num(b.original_price), badge: b.badge || '',
  isPublished: !!b.is_published, published: !!b.is_published, createdAt: b.created_at,
};

export const mapReview = (r) => r && {
  id: r.id, courseId: r.course_id, userId: r.user_id, studentName: r.student_name,
  rating: num(r.rating), text: r.body || '', status: r.status, createdAt: r.created_at,
};

export const mapPost = (p) => p && {
  id: p.id, courseId: p.course_id, lessonId: p.lesson_id, userId: p.user_id,
  authorName: p.author_name, title: p.title, body: p.body || '', pinned: !!p.pinned, createdAt: p.created_at,
};

export const mapComment = (c) => c && {
  id: c.id, postId: c.post_id, userId: c.user_id, authorName: c.author_name,
  body: c.body || '', isAdmin: !!c.is_admin, createdAt: c.created_at,
};

export const mapLive = (l) => {
  if (!l) return null;
  const d = l.scheduled_at ? new Date(l.scheduled_at) : null;
  const pad = (n) => String(n).padStart(2, '0');
  return {
    id: l.id, title: l.title, description: l.description || '', courseId: l.course_id,
    date: d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '',
    time: d ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : '',
    scheduledAt: l.scheduled_at, duration: num(l.duration_minutes, 60),
    platform: l.platform || 'Zoom', meetingLink: l.meeting_link || '',
    recordingUrl: l.recording_url || '', createdAt: l.created_at,
  };
};

export const mapConvo = (c) => c && {
  id: c.id, userId: c.user_id, title: c.title || 'New chat', messages: c.messages || [],
  courseId: c.course_id, lessonId: c.lesson_id,
  updatedAt: c.updated_at, createdAt: c.updated_at,
};

export const DEFAULT_SITE_SETTINGS = {
  siteName: 'WOLI DAN TECH HUB',
  tagline: 'Learn • Build • Grow',
  whatsapp: '08159610509',
  supportEmail: 'wolidantech@gmail.com',
  bankName: 'MONIEPOINT',
  accountNumber: '69852663361',
  accountName: 'LUNA ENTRY SERVICES- WOLI DAN TECH HUB',
  dantechEnabled: true,
  allowRegistration: true,
  facebook: '', instagram: '', twitter: '', youtube: '',
  metaDescription: 'WOLI DAN TECH HUB — Learn Digital Skills. Build Real Projects. Grow Your Future.',
};

export const mapSettings = (row) => ({
  ...DEFAULT_SITE_SETTINGS,
  ...(row ? {
    siteName: row.site_name, tagline: row.tagline, whatsapp: row.whatsapp,
    supportEmail: row.support_email, bankName: row.bank_name,
    accountNumber: row.account_number, accountName: row.account_name,
    dantechEnabled: !!row.dantech_enabled, allowRegistration: row.allow_registration !== false,
    ...(row.socials || {}),
    metaDescription: row.meta_description || DEFAULT_SITE_SETTINGS.metaDescription,
  } : {}),
});

// Progress rows -> progressMap { [userId_courseId]: { completedLessons, progress, lastLessonId } }
// totalLessonsByCourse: { [courseId]: n } — pass 0/unknown and progress stays 0 until detail loads.
export function buildProgressMap(rows, totalLessonsByCourse = {}) {
  const map = {};
  (rows || []).forEach((r) => {
    const key = `${r.user_id}_${r.course_id}`;
    if (!map[key]) map[key] = { completedLessons: [], progress: 0, lastLessonId: null, lastAt: null };
    map[key].completedLessons.push(r.lesson_id);
    if (!map[key].lastAt || (r.completed_at && r.completed_at > map[key].lastAt)) {
      map[key].lastAt = r.completed_at;
      map[key].lastLessonId = r.lesson_id;
    }
  });
  Object.keys(map).forEach((key) => {
    const courseId = key.slice(key.indexOf('_') + 1);
    const total = totalLessonsByCourse[courseId] || 0;
    const n = map[key].completedLessons.length;
    map[key].progress = total > 0 ? Math.min(100, Math.round((n / total) * 100)) : 0;
    delete map[key].lastAt;
  });
  return map;
}

// ============================================================ PROFILES
export const fetchMyProfile = async (userId) =>
  mapProfile(await one(sb().from('profiles').select('*').eq('id', userId).maybeSingle()));

export const fetchProfiles = async () =>
  (await one(sb().from('profiles').select('*').order('created_at', { ascending: false }).limit(2000))).map(mapProfile);

const PROFILE_COLS = {
  fullName: 'full_name', phone: 'phone', avatar: 'avatar_url', bio: 'bio', skills: 'skills',
  interests: 'interests', skillLevel: 'skill_level', careerGoals: 'career_goals',
  onboarded: 'onboarded', portfolioPublic: 'portfolio_public',
  showCertificates: 'show_certificates', showProjects: 'show_projects',
};

export const updateProfileRow = async (userId, patch) => {
  const cols = {};
  Object.entries(patch || {}).forEach(([k, v]) => {
    if (PROFILE_COLS[k]) cols[PROFILE_COLS[k]] = v;
  });
  // role/banned/email are NEVER self-editable (defense in depth; trigger enforces too).
  return mapProfile(await one(sb().from('profiles').update(cols).eq('id', userId).select().single()));
};

export const adminSetRole = async (userId, role) => {
  if (!['student', 'instructor', 'admin'].includes(role)) throw new Error('Invalid role');
  await one(sb().from('profiles').update({ role }).eq('id', userId).select('id'));
};

export const adminSetBanned = async (userId, banned) => {
  await one(sb().from('profiles').update({ banned: !!banned }).eq('id', userId).select('id'));
};

export const touchLastLogin = async (userId) => {
  try { await sb().from('profiles').update({ last_login_at: new Date().toISOString() }).eq('id', userId); } catch { /* non-fatal */ }
};

export const uploadAvatar = async (userId, file) => uploadFile('avatars', userId, file);
export const uploadThumbnail = async (courseId, file) => uploadFile('thumbnails', courseId, file);

// ============================================================ COURSES
export const fetchCourses = async ({ onlyPublished = false } = {}) => {
  let q = sb().from('courses').select('*').order('featured', { ascending: false }).order('created_at', { ascending: true });
  if (onlyPublished) q = q.eq('published', true);
  return (await one(q)).map(mapCourseLight);
};

export const fetchCourseDetail = async (courseId) => {
  const course = mapCourseLight(await one(sb().from('courses').select('*').eq('id', courseId).single()));
  const modules = await one(sb().from('course_modules').select('*').eq('course_id', courseId).order('position'));
  const lessons = await one(sb().from('course_lessons').select('*').eq('course_id', courseId).order('position'));
  const ids = lessons.map((l) => l.id);
  let contents = [];
  let videos = [];
  if (ids.length) {
    // course_content/course_videos are enrolled-only; RLS returns [] for outsiders (no error).
    contents = await one(sb().from('course_content').select('*').in('lesson_id', ids));
    videos = await one(sb().from('course_videos').select('*').in('lesson_id', ids));
  }
  const contentById = Object.fromEntries(contents.map((c) => [c.lesson_id, c.body_markdown || '']));
  const videosById = {};
  videos.forEach((v) => { (videosById[v.lesson_id] ||= []).push(v); });
  const byModule = {};
  lessons.forEach((l) => { (byModule[l.module_id] ||= []).push(mapLesson(l, contentById, videosById)); });
  return {
    ...course,
    curriculum: modules.map((m) => ({ id: m.id, title: m.title, lessons: byModule[m.id] || [] })),
  };
};

export const adminCreateCourse = async (input) => {
  const row = {
    slug: input.slug, title: input.title,
    short_description: input.shortDescription || '', description: input.description || '',
    long_description: input.longDescription || '', category: input.category || 'General',
    instructor: input.instructor || 'Woli Dan', instructor_role: input.instructorRole || '',
    duration: input.duration || '', level: input.level || 'Beginner',
    price: num(input.price), original_price: num(input.originalPrice),
    thumbnail_key: input.thumbnail || 'default', thumbnail_url: input.thumbnailUrl || null,
    art_theme: input.artTheme || null, color: input.color || null,
    what_you_will_learn: input.whatYouWillLearn || [],
    requirements: input.requirements || [], audience: input.audience || [],
    published: !!input.published, featured: !!input.featured,
  };
  return mapCourseLight(await one(sb().from('courses').insert(row).select().single()));
};

const COURSE_COLS = {
  slug: 'slug', title: 'title', shortDescription: 'short_description', description: 'description',
  longDescription: 'long_description', category: 'category', instructor: 'instructor',
  instructorRole: 'instructor_role', duration: 'duration', level: 'level', price: 'price',
  originalPrice: 'original_price', thumbnail: 'thumbnail_key', thumbnailUrl: 'thumbnail_url',
  artTheme: 'art_theme', color: 'color', whatYouWillLearn: 'what_you_will_learn',
  requirements: 'requirements', audience: 'audience', published: 'published',
  featured: 'featured', archived: 'archived',
};

export const adminUpdateCourse = async (id, patch) => {
  const cols = {};
  Object.entries(patch || {}).forEach(([k, v]) => { if (COURSE_COLS[k]) cols[COURSE_COLS[k]] = v; });
  return mapCourseLight(await one(sb().from('courses').update(cols).eq('id', id).select().single()));
};

export const adminDeleteCourse = async (id) => {
  await one(sb().from('courses').delete().eq('id', id));
};

export const adminCreateModule = async (courseId, title) => {
  const existing = await one(sb().from('course_modules').select('position').eq('course_id', courseId).order('position', { ascending: false }).limit(1));
  const position = existing.length ? num(existing[0].position) + 1 : 0;
  const m = await one(sb().from('course_modules').insert({ course_id: courseId, title, position }).select().single());
  return { id: m.id, title: m.title, lessons: [] };
};

export const adminUpdateModule = async (moduleId, patch) => {
  const cols = {};
  if (patch.title !== undefined) cols.title = patch.title;
  if (patch.position !== undefined) cols.position = patch.position;
  await one(sb().from('course_modules').update(cols).eq('id', moduleId));
};

export const adminDeleteModule = async (moduleId) => {
  await one(sb().from('course_modules').delete().eq('id', moduleId));
};

export const adminCreateLesson = async (courseId, moduleId, lesson) => {
  const existing = await one(sb().from('course_lessons').select('position').eq('module_id', moduleId).order('position', { ascending: false }).limit(1));
  const position = lesson.position ?? (existing.length ? num(existing[0].position) + 1 : 0);
  const l = await one(sb().from('course_lessons').insert({
    course_id: courseId, module_id: moduleId, title: lesson.title || 'New lesson',
    type: lesson.type === 'text' ? 'text' : 'video', duration: lesson.duration || '',
    position, resources: lesson.resources || [], sub_lessons: lesson.subLessons || [],
  }).select().single());
  if (lesson.textContent || lesson.content) {
    await one(sb().from('course_content').insert({ lesson_id: l.id, body_markdown: lesson.textContent || lesson.content || '' }));
  }
  if (lesson.videoUrl) {
    await one(sb().from('course_videos').insert({ lesson_id: l.id, provider: 'youtube', url: lesson.videoUrl, status: 'published' }));
  }
  return { id: l.id, moduleId, title: l.title, type: l.type, duration: l.duration || '', videoUrl: lesson.videoUrl || '', videoStoragePath: null, textContent: lesson.textContent || lesson.content || '', content: lesson.textContent || lesson.content || '', resources: lesson.resources || [], subLessons: lesson.subLessons || [] };
};

export const adminUpdateLesson = async (lessonId, patch) => {
  const cols = {};
  if (patch.title !== undefined) cols.title = patch.title;
  if (patch.type !== undefined) cols.type = patch.type;
  if (patch.duration !== undefined) cols.duration = patch.duration;
  if (patch.position !== undefined) cols.position = patch.position;
  if (patch.resources !== undefined) cols.resources = patch.resources;
  if (patch.subLessons !== undefined) cols.sub_lessons = patch.subLessons;
  if (Object.keys(cols).length) await one(sb().from('course_lessons').update(cols).eq('id', lessonId));
  if (patch.textContent !== undefined || patch.content !== undefined) {
    const body = patch.textContent ?? patch.content ?? '';
    await one(sb().from('course_content').upsert({ lesson_id: lessonId, body_markdown: body }, { onConflict: 'lesson_id' }));
  }
  if (patch.videoUrl !== undefined) {
    await one(sb().from('course_videos').delete().eq('lesson_id', lessonId));
    if (patch.videoUrl) {
      await one(sb().from('course_videos').insert({ lesson_id: lessonId, provider: 'youtube', url: patch.videoUrl, status: 'published' }));
    }
  }
};

export const adminDeleteLesson = async (lessonId) => {
  await one(sb().from('course_lessons').delete().eq('id', lessonId));
};

// ============================================================ ENROLLMENTS
export const fetchMyEnrollments = async (userId) =>
  (await one(sb().from('enrollments').select('*').eq('user_id', userId).order('enrolled_at', { ascending: false }))).map(mapEnrollment);

export const fetchAllEnrollments = async () =>
  (await one(sb().from('enrollments').select('*').order('enrolled_at', { ascending: false }).limit(5000))).map(mapEnrollment);

export const adminGrantEnrollment = async (userId, courseId, meta = {}) =>
  mapEnrollment(await one(sb().from('enrollments').upsert({
    user_id: userId, course_id: courseId, status: 'active',
    method: meta.method || 'admin_manual', coupon_code: meta.couponCode || null,
  }, { onConflict: 'user_id,course_id' }).select().single()));

export const adminSetEnrollmentStatus = async (userId, courseId, status) => {
  await one(sb().from('enrollments').update({ status }).eq('user_id', userId).eq('course_id', courseId));
};

// ============================================================ PAYMENTS
export const submitPaymentRow = async (row) =>
  mapPayment(await one(sb().from('manual_payments').insert({
    user_id: row.userId, course_id: row.courseId || null,
    bundle_id: row.bundleId || null, bundle_course_ids: row.bundleCourseIds || [],
    student_name: row.studentName, email: row.email, phone: row.phone,
    amount: num(row.amount), original_amount: row.originalAmount ?? null,
    coupon_code: row.couponCode || null, coupon_discount: num(row.couponDiscount),
    transaction_date: row.transactionDate || null, reference: row.reference,
    receipt_path: row.receiptPath, note: row.note || null, status: 'pending',
  }).select().single()));

export const fetchMyPayments = async (userId) =>
  (await one(sb().from('manual_payments').select('*').eq('user_id', userId).order('submitted_at', { ascending: false }))).map(mapPayment);

export const fetchAllPayments = async () =>
  (await one(sb().from('manual_payments').select('*').order('submitted_at', { ascending: false }).limit(5000))).map(mapPayment);

export const approvePaymentRpc = async (paymentId) =>
  one(sb().rpc('approve_payment', { p_payment_id: paymentId }));

export const rejectPaymentRpc = async (paymentId, reason) =>
  one(sb().rpc('reject_payment', { p_payment_id: paymentId, p_reason: reason }));

export const uploadReceipt = async (userId, file, onProgress = null) => uploadFile('receipts', userId, file, onProgress);

// ============================================================ COUPONS
const couponResult = (code, r) => ({
  coupon: { code }, code,
  valid: !!r.valid, reason: r.reason || '', discount: num(r.discount),
  amountDue: num(r.amountDue), isFree: !!r.isFree || num(r.amountDue) === 0, duplicate: !!r.duplicate,
});

export const validateCouponRpc = async (code, courseId) =>
  couponResult(String(code || '').trim().toUpperCase(), await one(sb().rpc('validate_coupon', { p_code: code, p_course_id: courseId })));

export const redeemCouponRpc = async (code, courseId) =>
  couponResult(String(code || '').trim().toUpperCase(), await one(sb().rpc('redeem_coupon', { p_code: code, p_course_id: courseId })));

export const fetchCoupons = async () =>
  (await one(sb().from('coupons').select('*').order('created_at', { ascending: false }))).map(mapCoupon);

export const adminCreateCoupon = async (input, createdBy) =>
  mapCoupon(await one(sb().from('coupons').insert({
    code: String(input.code || '').trim().toUpperCase(),
    course_id: input.courseId && input.courseId !== 'ALL' ? input.courseId : null,
    discount_type: input.discountType || 'percentage', discount_value: num(input.discountValue),
    max_uses: input.maxUses == null || input.maxUses === '' ? null : num(input.maxUses),
    expires_at: input.expiresAt || null, min_purchase: num(input.minPurchase),
    active: input.active !== false,
    restricted_email: input.restrictedTo?.email || input.restrictEmail || null,
    restricted_phone: input.restrictedTo?.phone || input.restrictPhone || null,
    restricted_user_id: input.restrictedTo?.userId || null,
    created_by: createdBy || 'admin',
  }).select().single()));

const COUPON_COLS = {
  code: 'code', courseId: 'course_id', discountType: 'discount_type', discountValue: 'discount_value',
  maxUses: 'max_uses', expiresAt: 'expires_at', minPurchase: 'min_purchase', active: 'active',
};

export const adminUpdateCoupon = async (id, patch) => {
  const cols = {};
  Object.entries(patch || {}).forEach(([k, v]) => {
    if (!COUPON_COLS[k]) return;
    cols[COUPON_COLS[k]] = k === 'courseId' && (v === 'ALL' || !v) ? null : v;
  });
  if (patch.restrictedTo) {
    cols.restricted_email = patch.restrictedTo.email || null;
    cols.restricted_phone = patch.restrictedTo.phone || null;
    cols.restricted_user_id = patch.restrictedTo.userId || null;
  }
  return mapCoupon(await one(sb().from('coupons').update(cols).eq('id', id).select().single()));
};

export const adminDeleteCoupon = async (id) => {
  await one(sb().from('coupons').delete().eq('id', id));
};

export const fetchRedemptions = async () =>
  (await one(sb().from('coupon_redemptions').select('*').order('used_at', { ascending: false }).limit(5000))).map(mapRedemption);

export const fetchMyRedemptions = async (userId) =>
  (await one(sb().from('coupon_redemptions').select('*').eq('user_id', userId).order('used_at', { ascending: false }).limit(500))).map(mapRedemption);

// ============================================================ PROGRESS
export const fetchMyProgress = async (userId) =>
  one(sb().from('lesson_progress').select('*').eq('user_id', userId).limit(10000));

export const fetchAllProgress = async () =>
  one(sb().from('lesson_progress').select('*').limit(20000));

export const markLessonDb = async (userId, courseId, lessonId) => {
  await one(sb().from('lesson_progress').upsert(
    { user_id: userId, course_id: courseId, lesson_id: lessonId },
    { onConflict: 'user_id,lesson_id', ignoreDuplicates: true },
  ));
};

export const unmarkLessonDb = async (userId, lessonId) => {
  await one(sb().from('lesson_progress').delete().eq('user_id', userId).eq('lesson_id', lessonId));
};

export const resetProgressDb = async (userId, courseId) => {
  await one(sb().from('lesson_progress').delete().eq('user_id', userId).eq('course_id', courseId));
};

// ============================================================ QUIZZES
export const fetchQuizzes = async (courseId = null) => {
  let q = sb().from('quizzes').select('*').order('created_at', { ascending: true });
  if (courseId) q = q.eq('course_id', courseId);
  return (await one(q)).map(mapQuiz);
};

export const fetchQuizQuestionsAdmin = async (quizId) =>
  (await one(sb().from('quiz_questions').select('*').eq('quiz_id', quizId).order('created_at'))).map(mapQuestionFull);

export const fetchQuizQuestionsRpc = async (quizId) =>
  (await one(sb().rpc('get_quiz_questions', { p_quiz_id: quizId }))) || [];

export const fetchQuizReviewRpc = async (quizId) =>
  (await one(sb().rpc('get_quiz_review', { p_quiz_id: quizId }))) || [];

export const submitAttemptRpc = async (quizId, answers) =>
  mapAttempt(await one(sb().rpc('submit_quiz_attempt', { p_quiz_id: quizId, p_answers: answers || {} })));

export const fetchMyAttempts = async (userId) =>
  (await one(sb().from('quiz_attempts').select('*, quiz:quizzes(course_id)').eq('user_id', userId).order('created_at', { ascending: false }).limit(2000))).map(mapAttempt);

export const fetchAllAttempts = async () =>
  (await one(sb().from('quiz_attempts').select('*, quiz:quizzes(course_id)').order('created_at', { ascending: false }).limit(5000))).map(mapAttempt);

export const adminDeleteAttempts = async (userId, quizId) => {
  await one(sb().from('quiz_attempts').delete().eq('user_id', userId).eq('quiz_id', quizId));
};

export const adminCreateQuiz = async (input) =>
  mapQuiz(await one(sb().from('quizzes').insert({
    course_id: input.courseId, module_id: input.moduleId || null, lesson_id: input.lessonId || null,
    title: input.title, description: input.description || '',
    passing_score: num(input.passingScore, 70), allow_retake: input.allowRetake !== false,
    attempt_limit: input.attemptLimit || null, is_final: !!input.isFinal, status: input.status || 'published',
  }).select().single()));

const QUIZ_COLS = {
  title: 'title', description: 'description', passingScore: 'passing_score', allowRetake: 'allow_retake',
  attemptLimit: 'attempt_limit', isFinal: 'is_final', status: 'status', moduleId: 'module_id', lessonId: 'lesson_id',
};

export const adminUpdateQuiz = async (id, patch) => {
  const cols = {};
  Object.entries(patch || {}).forEach(([k, v]) => { if (QUIZ_COLS[k]) cols[QUIZ_COLS[k]] = v; });
  return mapQuiz(await one(sb().from('quizzes').update(cols).eq('id', id).select().single()));
};

export const adminDeleteQuiz = async (id) => {
  await one(sb().from('quizzes').delete().eq('id', id));
};

export const adminAddQuestion = async (quizId, q) =>
  mapQuestionFull(await one(sb().from('quiz_questions').insert({
    quiz_id: quizId, type: q.type || 'multiple_choice', question: q.question,
    options: q.options || [], correct_answer: q.correctAnswer ?? null,
    correct_answers: q.correctAnswers || [], accepted_answers: q.acceptedAnswers || [],
    explanation: q.explanation || '',
  }).select().single()));

const QUESTION_COLS = {
  type: 'type', question: 'question', options: 'options', correctAnswer: 'correct_answer',
  correctAnswers: 'correct_answers', acceptedAnswers: 'accepted_answers', explanation: 'explanation',
};

export const adminUpdateQuestion = async (id, patch) => {
  const cols = {};
  Object.entries(patch || {}).forEach(([k, v]) => { if (QUESTION_COLS[k]) cols[QUESTION_COLS[k]] = v; });
  return mapQuestionFull(await one(sb().from('quiz_questions').update(cols).eq('id', id).select().single()));
};

export const adminDeleteQuestion = async (id) => {
  await one(sb().from('quiz_questions').delete().eq('id', id));
};

// ============================================================ ASSIGNMENTS
export const fetchAssignments = async (courseId = null) => {
  let q = sb().from('assignments').select('*').order('created_at', { ascending: true });
  if (courseId) q = q.eq('course_id', courseId);
  return (await one(q)).map(mapAssignment);
};

export const fetchMySubmissions = async (userId) =>
  (await one(sb().from('assignment_submissions').select('*').eq('user_id', userId).order('submitted_at', { ascending: false }).limit(2000))).map(mapSubmission);

export const fetchAllSubmissions = async () =>
  (await one(sb().from('assignment_submissions').select('*').order('submitted_at', { ascending: false }).limit(5000))).map(mapSubmission);

export const submitSubmissionRow = async (row) =>
  mapSubmission(await one(sb().from('assignment_submissions').insert({
    assignment_id: row.assignmentId, course_id: row.courseId, user_id: row.userId,
    student_name: row.studentName || '', kind: row.kind || 'file',
    storage_path: row.storagePath || null, file_name: row.fileName || '',
    file_type: row.fileType || '', file_size: row.fileSize || 0,
    text_content: row.textContent || '', link_url: row.linkUrl || '', note: row.note || '',
    late: !!row.late, status: 'submitted',
  }).select().single()));

export const uploadSubmissionFile = async (userId, file) => uploadFile('submissions', userId, file);

export const reviewSubmissionRow = async (id, { status, score = null, feedback = '', reviewedBy = '' }) => {
  if (!['under_review', 'approved', 'needs_revision'].includes(status)) throw new Error('Invalid status');
  return mapSubmission(await one(sb().from('assignment_submissions').update({
    status, score, feedback, reviewed_by: reviewedBy, reviewed_at: new Date().toISOString(),
  }).eq('id', id).select().single()));
};

export const adminCreateAssignment = async (input) =>
  mapAssignment(await one(sb().from('assignments').insert({
    course_id: input.courseId, module_id: input.moduleId || null, lesson_id: input.lessonId || null,
    title: input.title, description: input.description || '', instructions: input.instructions || '',
    required_output: input.requiredOutput || '', max_score: num(input.maxScore, 100),
    is_final_project: !!input.isFinalProject, status: input.status || 'published',
    deadline: input.deadline || null, submission_type: input.submissionType || 'any',
  }).select().single()));

const ASSIGNMENT_COLS = {
  title: 'title', description: 'description', instructions: 'instructions', requiredOutput: 'required_output',
  maxScore: 'max_score', isFinalProject: 'is_final_project', status: 'status',
  deadline: 'deadline', submissionType: 'submission_type', moduleId: 'module_id', lessonId: 'lesson_id',
};

export const adminUpdateAssignment = async (id, patch) => {
  const cols = {};
  Object.entries(patch || {}).forEach(([k, v]) => { if (ASSIGNMENT_COLS[k]) cols[ASSIGNMENT_COLS[k]] = v === '' ? null : v; });
  return mapAssignment(await one(sb().from('assignments').update(cols).eq('id', id).select().single()));
};

export const adminDeleteAssignment = async (id) => {
  await one(sb().from('assignments').delete().eq('id', id));
};

// ============================================================ CERTIFICATES
export const fetchMyCertificates = async (userId) =>
  (await one(sb().from('certificate_issues').select('*').eq('user_id', userId).order('issue_date', { ascending: false }))).map(mapCertificate);

export const fetchAllCertificates = async () =>
  (await one(sb().from('certificate_issues').select('*').order('issue_date', { ascending: false }).limit(5000))).map(mapCertificate);

export const verifyCertificateRpc = async (code) =>
  one(sb().rpc('verify_certificate', { p_code: String(code || '').trim() }));

export const issueCertificateRpc = async (userId, courseId) =>
  one(sb().rpc('issue_certificate_manual', { p_user_id: userId, p_course_id: courseId }));

export const revokeCertificateRpc = async (certId) =>
  one(sb().rpc('revoke_certificate', { p_cert_id: certId }));

// ============================================================ NOTIFICATIONS
export const fetchMyNotifications = async (userId) =>
  (await one(sb().from('student_notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(200))).map(mapNotification);

export const markNotificationRead = async (id) => {
  await one(sb().from('student_notifications').update({ read: true }).eq('id', id));
};

export const markAllNotificationsRead = async (userId) => {
  await one(sb().from('student_notifications').update({ read: true }).eq('user_id', userId).eq('read', false));
};

export const sendNotificationRow = async ({ userId, type = 'announcement', title, message, courseId = null }) =>
  mapNotification(await one(sb().from('student_notifications').insert({
    user_id: userId, type, title, message, course_id: courseId,
  }).select().single()));

export const broadcastNotifications = async (userIds, { title, message, type = 'announcement', courseId = null }) => {
  const ids = [...new Set(userIds || [])];
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100).map((userId) => ({ user_id: userId, type, title, message, course_id: courseId }));
    await one(sb().from('student_notifications').insert(chunk));
  }
  return ids.length;
};

// ============================================================ ANNOUNCEMENTS
export const fetchAnnouncements = async () =>
  (await one(sb().from('announcements').select('*').order('created_at', { ascending: false }).limit(200))).map(mapAnnouncement);

export const createAnnouncement = async ({ title, message, courseId = null, createdBy = '' }) =>
  mapAnnouncement(await one(sb().from('announcements').insert({
    title, message, course_id: courseId, created_by: createdBy,
  }).select().single()));

export const deleteAnnouncement = async (id) => {
  await one(sb().from('announcements').delete().eq('id', id));
};

// ============================================================ REVIEWS
export const fetchCourseReviews = async (courseId) =>
  (await one(sb().from('reviews').select('*').eq('course_id', courseId).eq('status', 'published').order('created_at', { ascending: false }).limit(500))).map(mapReview);

export const fetchAllReviews = async () =>
  (await one(sb().from('reviews').select('*').order('created_at', { ascending: false }).limit(2000))).map(mapReview);

export const addReviewRow = async ({ courseId, userId, studentName, rating, text }) =>
  mapReview(await one(sb().from('reviews').insert({
    course_id: courseId, user_id: userId, student_name: studentName,
    rating: Math.max(1, Math.min(5, num(rating, 5))), body: String(text || '').slice(0, 1000),
  }).select().single()));

export const moderateReview = async (id, status) => {
  if (!['published', 'hidden'].includes(status)) throw new Error('Invalid status');
  await one(sb().from('reviews').update({ status }).eq('id', id));
};

export const deleteReview = async (id) => {
  await one(sb().from('reviews').delete().eq('id', id));
};

// ============================================================ DISCUSSION
export const fetchPosts = async (courseId) =>
  (await one(sb().from('discussion_posts').select('*').eq('course_id', courseId).order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(500))).map(mapPost);

export const createPostRow = async ({ courseId, lessonId = null, userId, authorName, title, body }) =>
  mapPost(await one(sb().from('discussion_posts').insert({
    course_id: courseId, lesson_id: lessonId, user_id: userId, author_name: authorName,
    title: String(title || '').slice(0, 140), body: String(body || '').slice(0, 3000),
  }).select().single()));

export const adminTogglePin = async (id, pinned) => {
  await one(sb().from('discussion_posts').update({ pinned: !!pinned }).eq('id', id));
};

export const adminDeletePost = async (id) => {
  await one(sb().from('discussion_posts').delete().eq('id', id));
};

export const fetchComments = async (postId) =>
  (await one(sb().from('discussion_comments').select('*').eq('post_id', postId).order('created_at').limit(1000))).map(mapComment);

export const createCommentRow = async ({ postId, userId, authorName, body, isAdmin = false }) =>
  mapComment(await one(sb().from('discussion_comments').insert({
    post_id: postId, user_id: userId, author_name: authorName,
    body: String(body || '').slice(0, 2000), is_admin: !!isAdmin,
  }).select().single()));

export const adminDeleteComment = async (id) => {
  await one(sb().from('discussion_comments').delete().eq('id', id));
};

// ============================================================ LIVE CLASSES
export const fetchLiveClasses = async () =>
  (await one(sb().from('live_classes').select('*').order('scheduled_at').limit(500))).map(mapLive);

export const adminSaveLive = async (input, id = null) => {
  const scheduled_at = input.date ? new Date(`${input.date}T${input.time || '00:00'}`).toISOString() : new Date().toISOString();
  const row = {
    title: input.title, description: input.description || '',
    course_id: input.courseId || null, scheduled_at,
    duration_minutes: num(input.duration, 60), platform: input.platform || 'Zoom',
    meeting_link: input.meetingLink, recording_url: input.recordingUrl || '',
  };
  const q = id
    ? sb().from('live_classes').update(row).eq('id', id).select().single()
    : sb().from('live_classes').insert(row).select().single();
  return mapLive(await one(q));
};

export const adminDeleteLive = async (id) => {
  await one(sb().from('live_classes').delete().eq('id', id));
};

// ============================================================ PATHS & BUNDLES
export const fetchPaths = async () =>
  (await one(sb().from('learning_paths').select('*').order('created_at'))).map(mapPath);

export const adminSavePath = async (input, id = null) => {
  const row = {
    title: input.title, description: input.desc || input.description || '',
    icon: input.icon || '🎯', level_range: input.level || input.levelRange || '',
    course_ids: input.courseIds || [], is_published: input.published !== false && input.isPublished !== false,
  };
  const q = id
    ? sb().from('learning_paths').update(row).eq('id', id).select().single()
    : sb().from('learning_paths').insert(row).select().single();
  return mapPath(await one(q));
};

export const adminDeletePath = async (id) => {
  await one(sb().from('learning_paths').delete().eq('id', id));
};

export const fetchBundles = async () =>
  (await one(sb().from('bundles').select('*').order('created_at', { ascending: false }))).map(mapBundle);

export const adminSaveBundle = async (input, id = null) => {
  const row = {
    title: input.title, description: input.description || '', course_ids: input.courseIds || [],
    price: num(input.price), original_price: num(input.originalPrice), badge: input.badge || '',
    is_published: input.published !== false && input.isPublished !== false,
  };
  const q = id
    ? sb().from('bundles').update(row).eq('id', id).select().single()
    : sb().from('bundles').insert(row).select().single();
  return mapBundle(await one(q));
};

export const adminDeleteBundle = async (id) => {
  await one(sb().from('bundles').delete().eq('id', id));
};

// ============================================================ SETTINGS / CATEGORIES / RULES
export const fetchSettings = async () =>
  mapSettings(await one(sb().from('site_settings').select('*').eq('id', 1).maybeSingle()));

export const updateSettings = async (patch, prevSocials = {}) => {
  const cols = {};
  if (patch.siteName !== undefined) cols.site_name = patch.siteName;
  if (patch.tagline !== undefined) cols.tagline = patch.tagline;
  if (patch.whatsapp !== undefined) cols.whatsapp = patch.whatsapp;
  if (patch.supportEmail !== undefined) cols.support_email = patch.supportEmail;
  if (patch.bankName !== undefined) cols.bank_name = patch.bankName;
  if (patch.accountNumber !== undefined) cols.account_number = patch.accountNumber;
  if (patch.accountName !== undefined) cols.account_name = patch.accountName;
  if (patch.dantechEnabled !== undefined) cols.dantech_enabled = patch.dantechEnabled;
  if (patch.allowRegistration !== undefined) cols.allow_registration = patch.allowRegistration;
  if (patch.metaDescription !== undefined) cols.meta_description = patch.metaDescription;
  const socials = { ...prevSocials };
  ['facebook', 'instagram', 'twitter', 'youtube'].forEach((k) => {
    if (patch[k] !== undefined) socials[k] = patch[k];
  });
  cols.socials = socials;
  return mapSettings(await one(sb().from('site_settings').update(cols).eq('id', 1).select().single()));
};

export const fetchCategories = async () =>
  (await one(sb().from('categories').select('name').order('sort_order').order('name'))).map((r) => r.name);

export const adminCreateCategory = async (name) => {
  const n = String(name || '').trim();
  if (!n) throw new Error('Category name required');
  await one(sb().from('categories').insert({ name: n }));
};

export const adminRenameCategory = async (oldName, newName) => {
  await one(sb().from('categories').update({ name: newName }).eq('name', oldName));
};

export const adminDeleteCategory = async (name) => {
  await one(sb().from('categories').delete().eq('name', name));
};

export const fetchRules = async () => {
  const rows = await one(sb().from('course_completion_rules').select('*'));
  return Object.fromEntries(rows.map((r) => [r.course_id, mapRulesRow(r)]));
};

export const saveRules = async (courseId, rules) =>
  one(sb().from('course_completion_rules').upsert({
    course_id: courseId,
    require_lessons_pct: num(rules.requireLessonsPct, 100),
    require_quiz_avg: num(rules.requireQuizAvg),
    require_assignments_approved: num(rules.requireAssignmentsApproved),
    require_final_project: !!rules.requireFinalProject,
  }, { onConflict: 'course_id' }));

// ============================================================ AUDIT
export const logAudit = async ({ actorEmail = 'system', actorName = 'System', action, entityType = null, entityId = null, details = {} }) => {
  try {
    await sb().from('audit_logs').insert({
      actor_email: actorEmail, actor_name: actorName, action,
      entity_type: entityType, entity_id: entityId ? String(entityId) : null, details: details || {},
    });
  } catch { /* audit must never break the user flow */ }
};

export const fetchAuditLogs = async (limit = 500) =>
  (await one(sb().from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit))).map(mapAudit);

// ============================================================ AI STUDIO
export const fetchAIJobs = async () =>
  (await one(sb().from('ai_generation_jobs').select('*').order('created_at', { ascending: false }).limit(500))).map(mapAIJob);

export const createAIJob = async ({ kind, input, provider, createdBy }) =>
  mapAIJob(await one(sb().from('ai_generation_jobs').insert({
    kind, input: input || {}, status: 'running', provider: provider || null, created_by: createdBy || null,
  }).select().single()));

export const updateAIJob = async (id, patch) => {
  const cols = {};
  if (patch.status) cols.status = patch.status;
  if (patch.error !== undefined) cols.error = patch.error;
  await one(sb().from('ai_generation_jobs').update(cols).eq('id', id));
};

export const fetchAIContent = async () =>
  (await one(sb().from('ai_generated_content').select('*').order('created_at', { ascending: false }).limit(500))).map(mapAIContent);

export const createAIContent = async ({ jobId = null, kind, title, input, data, provider, status = 'draft', targetCourseId = null, createdBy }) =>
  mapAIContent(await one(sb().from('ai_generated_content').insert({
    job_id: jobId, kind, title, input: input || {}, data: data || {},
    provider: provider || null, status, target_course_id: targetCourseId, created_by: createdBy || null,
  }).select().single()));

export const updateAIContentRow = async (id, patch) => {
  const cols = {};
  if (patch.title !== undefined) cols.title = patch.title;
  if (patch.data !== undefined) cols.data = patch.data;
  if (patch.status) cols.status = patch.status;
  if (patch.targetCourseId !== undefined) cols.target_course_id = patch.targetCourseId;
  return mapAIContent(await one(sb().from('ai_generated_content').update(cols).eq('id', id).select().single()));
};

export const deleteAIContentRow = async (id) => {
  await one(sb().from('ai_generated_content').delete().eq('id', id));
};

// ============================================================ EVENTS
export const logEvent = async ({ userId, courseId = null, kind, refId = null }) => {
  try {
    await sb().from('learning_events').insert({ user_id: userId, course_id: courseId, kind, ref_id: refId });
  } catch { /* analytics must never break the user flow */ }
};

export const fetchMyEvents = async (userId) =>
  (await one(sb().from('learning_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(3000))).map(mapEvent);

export const fetchAllEvents = async () =>
  (await one(sb().from('learning_events').select('*').order('created_at', { ascending: false }).limit(5000))).map(mapEvent);

// ============================================================ AI CONVERSATIONS
export const fetchMyConvos = async (userId) =>
  (await one(sb().from('ai_conversations').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(100))).map(mapConvo);

export const saveConvoRow = async (convo) => {
  if (convo.id) {
    const updated = await one(sb().from('ai_conversations').update({
      title: convo.title, messages: (convo.messages || []).slice(-100),
      course_id: convo.courseId || null, lesson_id: convo.lessonId || null,
      updated_at: new Date().toISOString(),
    }).eq('id', convo.id).select().single());
    return mapConvo(updated);
  }
  const created = await one(sb().from('ai_conversations').insert({
    user_id: convo.userId, title: convo.title || 'New chat',
    messages: (convo.messages || []).slice(-100),
    course_id: convo.courseId || null, lesson_id: convo.lessonId || null,
  }).select().single());
  return mapConvo(created);
};

export const deleteConvoRow = async (id) => {
  await one(sb().from('ai_conversations').delete().eq('id', id));
};

// ============================================================ SOCIAL / ADMIN RPCs
export const fetchMyXP = async (userId) => {
  const rows = await one(sb().from('xp_events').select('xp').eq('user_id', userId).limit(10000));
  return rows.reduce((s, r) => s + num(r.xp), 0);
};

export const fetchLeaderboard = async (limit = 20) =>
  (await one(sb().rpc('get_leaderboard', { p_limit: limit }))) || [];

export const fetchShowcase = async (limit = 12) =>
  (await one(sb().rpc('get_showcase', { p_limit: limit }))) || [];

export const fetchPublicPortfolio = async (userId) =>
  one(sb().rpc('get_public_portfolio', { p_user_id: userId }));

export const fetchAdminStats = async () =>
  one(sb().rpc('get_admin_stats'));

export const fetchStudentDetail = async (userId) =>
  one(sb().rpc('get_student_detail', { p_user_id: userId }));
