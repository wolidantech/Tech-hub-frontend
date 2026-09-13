import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { subscribeChanges } from '../lib/supabase';
import {
  fetchCourses, fetchCourseDetail, adminCreateCourse, adminUpdateCourse, adminDeleteCourse,
  adminCreateModule, adminUpdateModule, adminDeleteModule,
  adminCreateLesson, adminUpdateLesson, adminDeleteLesson,
  fetchMyEnrollments, fetchAllEnrollments, adminGrantEnrollment, adminSetEnrollmentStatus,
  submitPaymentRow, fetchMyPayments, fetchAllPayments, approvePaymentRpc, rejectPaymentRpc, uploadReceipt,
  fetchMyProgress, fetchAllProgress, buildProgressMap, markLessonDb, unmarkLessonDb, resetProgressDb,
  fetchMyCertificates, fetchAllCertificates, verifyCertificateRpc, issueCertificateRpc, revokeCertificateRpc,
  fetchMyNotifications, markNotificationRead, markAllNotificationsRead,
  sendNotificationRow, broadcastNotifications, fetchBundles, fetchAdminStats, logEvent,
} from '../lib/store';

const CourseContext = createContext(null);
export const useCourses = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used within CourseProvider');
  return ctx;
};

export const CourseProvider = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [detailIds, setDetailIds] = useState(() => new Set());
  const [enrollments, setEnrollments] = useState([]);
  const [manualPayments, setManualPayments] = useState([]);
  const [progressRows, setProgressRows] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [bundleNames, setBundleNames] = useState({});
  const [dataLoading, setDataLoading] = useState(false);
  const [adminStats, setAdminStats] = useState(null);

  // ---------- Catalog (public) ----------
  const refreshCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const list = await fetchCourses();
      setCourses((prev) => {
        // Preserve already-loaded curriculum details across refreshes
        const details = new Map(prev.filter((c) => c.curriculum).map((c) => [c.id, c.curriculum]));
        return list.map((c) => (details.has(c.id) ? { ...c, curriculum: details.get(c.id) } : c));
      });
      try {
        const bundles = await fetchBundles();
        setBundleNames(Object.fromEntries(bundles.map((b) => [b.id, b.title])));
      } catch { /* non-fatal: bundle names fall back */ }
    } catch (err) {
      console.error('[courses] failed to load catalog:', err.message);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => { refreshCourses(); }, [refreshCourses]);

  // Full curriculum + content for one course (cached). Visitors get titles only
  // for lessons (RLS withholds bodies/videos until enrolled).
  const ensureCourseDetail = useCallback(async (courseId) => {
    if (!courseId) return null;
    let found = null;
    setCourses((prev) => {
      found = prev.find((c) => c.id === courseId && c.curriculum);
      return prev;
    });
    if (found) return found;
    const detail = await fetchCourseDetail(courseId);
    setCourses((prev) => prev.map((c) => (c.id === courseId ? detail : c)));
    setDetailIds((prev) => new Set(prev).add(courseId));
    return detail;
  }, []);

  // ---------- Per-user / admin data ----------
  const refreshMine = useCallback(async () => {
    if (!user) {
      setEnrollments([]); setManualPayments([]); setProgressRows([]);
      setCertificates([]); setNotifications([]); setAdminStats(null);
      return;
    }
    setDataLoading(true);
    try {
      if (user.role === 'admin') {
        const [en, pay, prog, certs] = await Promise.all([
          fetchAllEnrollments(), fetchAllPayments(), fetchAllProgress(), fetchAllCertificates(),
        ]);
        setEnrollments(en); setManualPayments(pay); setProgressRows(prog); setCertificates(certs);
        try { setAdminStats(await fetchAdminStats()); } catch (e) { console.error('[courses] admin stats failed:', e.message); }
      } else {
        const [en, pay, prog, certs, notifs] = await Promise.all([
          fetchMyEnrollments(user.id), fetchMyPayments(user.id), fetchMyProgress(user.id),
          fetchMyCertificates(user.id), fetchMyNotifications(user.id),
        ]);
        setEnrollments(en); setManualPayments(pay); setProgressRows(prog);
        setCertificates(certs); setNotifications(notifs);
      }
    } catch (err) {
      console.error('[courses] failed to load user data:', err.message);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => { refreshMine(); }, [refreshMine]);

  // Preload curriculum details for enrolled courses (Learn, DanTECH, progress %).
  useEffect(() => {
    if (!user || user.role === 'admin' || !enrollments.length) return;
    const ids = [...new Set(enrollments.filter((e) => e.status !== 'removed').map((e) => e.courseId))];
    ids.forEach((id) => { ensureCourseDetail(id).catch(() => {}); });
  }, [user, enrollments, ensureCourseDetail]);

  // ---------- Realtime ----------
  useEffect(() => {
    if (!user) return undefined;
    const unsubs = [];
    try {
      const mine = `user_id=eq.${user.id}`;
      unsubs.push(subscribeChanges({
        channel: `notif-${user.id}`, table: 'student_notifications', filter: mine,
        callback: () => { fetchMyNotifications(user.id).then(setNotifications).catch(() => {}); },
      }));
      unsubs.push(subscribeChanges({
        channel: `pay-${user.id}`, table: 'manual_payments', filter: isAdmin ? null : mine,
        callback: () => {
          (isAdmin ? fetchAllPayments() : fetchMyPayments(user.id)).then(setManualPayments).catch(() => {});
          (isAdmin ? fetchAllEnrollments() : fetchMyEnrollments(user.id)).then(setEnrollments).catch(() => {});
        },
      }));
      unsubs.push(subscribeChanges({
        channel: `cert-${user.id}`, table: 'certificate_issues', filter: isAdmin ? null : mine,
        callback: () => {
          (isAdmin ? fetchAllCertificates() : fetchMyCertificates(user.id)).then(setCertificates).catch(() => {});
        },
      }));
    } catch { /* realtime unavailable: polling via refresh UI still works */ }
    return () => unsubs.forEach((u) => { try { u(); } catch {} });
  }, [user, isAdmin]);

  // ---------- Derived ----------
  const totalsByCourse = useMemo(() => {
    const t = {};
    courses.forEach((c) => {
      t[c.id] = c.curriculum
        ? c.curriculum.reduce((a, m) => a + (m.lessons?.length || 0), 0)
        : (c.lessonsCount || 0);
    });
    return t;
  }, [courses]);

  const progressMap = useMemo(
    () => buildProgressMap(progressRows, totalsByCourse),
    [progressRows, totalsByCourse],
  );

  const paymentsEnriched = useMemo(() => manualPayments.map((p) => {
    if (p.courseId) {
      const c = courses.find((x) => x.id === p.courseId);
      return { ...p, courseName: c?.title || p.courseId };
    }
    if (p.bundleId) return { ...p, courseName: bundleNames[p.bundleId] ? `Bundle: ${bundleNames[p.bundleId]}` : `Bundle ${p.bundleId.slice(0, 8)}` };
    return { ...p, courseName: 'Course' };
  }), [manualPayments, courses, bundleNames]);

  const getCourseBySlug = useCallback((slug) => courses.find((c) => c.slug === slug), [courses]);
  const getCourseById = useCallback((id) => courses.find((c) => c.id === id), [courses]);
  const isEnrolled = useCallback((userId, courseId) =>
    enrollments.some((e) => e.userId === userId && e.courseId === courseId && e.status !== 'removed'),
  [enrollments]);

  // ===== MANUAL BANK TRANSFER SYSTEM =====
  const submitManualPayment = async ({
    userId, courseId, studentName, email, phone, amount, transactionDate, reference,
    receiptFile, receiptName, receiptType, receiptSize,
    couponCode = null, couponDiscount = 0, originalAmount = null,
    bundleId = null, bundleCourseIds = [],
  }) => {
    if (!receiptFile) throw new Error('Please upload your payment receipt');
    if (!String(reference || '').trim()) throw new Error('Transaction reference is required');
    const receiptPath = await uploadReceipt(userId, receiptFile);
    try {
      const payment = await submitPaymentRow({
        userId, courseId: courseId || null, studentName, email, phone, amount,
        transactionDate, reference: String(reference).trim(), receiptPath,
        couponCode, couponDiscount, originalAmount, bundleId, bundleCourseIds,
      });
      setManualPayments((prev) => [payment, ...prev]);
      return payment;
    } catch (err) {
      // Best-effort orphan cleanup is handled by storage lifecycle; surface the error.
      throw err;
    }
  };

  const approveManualPayment = async (paymentId) => {
    await approvePaymentRpc(paymentId);
    const [pay, en] = await Promise.all([fetchAllPayments(), fetchAllEnrollments()]);
    setManualPayments(pay);
    setEnrollments(en);
    refreshCourses().catch(() => {});
    return pay.find((p) => p.id === paymentId);
  };

  const rejectManualPayment = async (paymentId, reason) => {
    await rejectPaymentRpc(paymentId, reason);
    const pay = await fetchAllPayments();
    setManualPayments(pay);
    return pay.find((p) => p.id === paymentId);
  };

  const getUserManualPayments = useCallback((userId) =>
    paymentsEnriched.filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)), [paymentsEnriched]);
  const getManualPaymentByCourse = useCallback((userId, courseId) =>
    paymentsEnriched.filter((p) => p.userId === userId && p.courseId === courseId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0], [paymentsEnriched]);
  const getAllManualPayments = useCallback(() =>
    paymentsEnriched.slice().sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)), [paymentsEnriched]);
  const getPendingManualPayments = useCallback(() => paymentsEnriched.filter((p) => p.status === 'pending'), [paymentsEnriched]);
  const getUserEnrollments = useCallback((userId) => enrollments.filter((e) => e.userId === userId), [enrollments]);
  const getUserPayments = useCallback((userId) => getUserManualPayments(userId), [getUserManualPayments]);

  const getProgress = useCallback((userId, courseId) =>
    progressMap[`${userId}_${courseId}`] || { completedLessons: [], progress: 0, lastLessonId: null },
  [progressMap]);

  const markLessonComplete = async (userId, courseId, lessonId) => {
    if (!isEnrolled(userId, courseId)) throw new Error('Not enrolled');
    const key = `${userId}_${courseId}`;
    const current = progressMap[key];
    if (current?.completedLessons.includes(lessonId)) return current;
    await markLessonDb(userId, courseId, lessonId);
    logEvent({ userId, courseId, kind: 'lesson_complete', refId: lessonId });
    const completedAt = new Date().toISOString();
    setProgressRows((prev) => {
      if (prev.some((r) => r.user_id === userId && r.lesson_id === lessonId)) return prev;
      return [...prev, { user_id: userId, course_id: courseId, lesson_id: lessonId, completed_at: completedAt }];
    });
    // A completion trigger may have issued a certificate — refresh.
    if (user?.id === userId) fetchMyCertificates(userId).then(setCertificates).catch(() => {});
    else if (isAdmin) fetchAllCertificates().then(setCertificates).catch(() => {});
    const total = totalsByCourse[courseId] || 0;
    const completed = [...(current?.completedLessons || []), lessonId];
    return { completedLessons: completed, progress: total ? Math.min(100, Math.round((completed.length / total) * 100)) : 0, lastLessonId: lessonId };
  };

  const unmarkLesson = async (userId, courseId, lessonId) => {
    await unmarkLessonDb(userId, lessonId);
    setProgressRows((prev) => prev.filter((r) => !(r.user_id === userId && r.lesson_id === lessonId)));
  };

  const getUserCertificates = useCallback((userId) => certificates.filter((c) => c.userId === userId), [certificates]);

  // Public verification (DB RPC; name is masked server-side).
  const verifyCertificate = useCallback(async (code) => verifyCertificateRpc(code), []);

  const getUserNotifications = useCallback((userId) =>
    notifications.filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [notifications]);

  const markNotificationRead = async (notifId) => {
    await markNotificationRead(notifId);
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = async (userId) => {
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((n) => (n.userId === userId ? { ...n, read: true } : n)));
  };

  // Admin actions
  const addCourse = async (course) => {
    const created = await adminCreateCourse(course);
    setCourses((prev) => [{ ...created, curriculum: course.curriculum || [] }, ...prev]);
    return created;
  };

  const updateCourse = async (id, updates) => {
    const updated = await adminUpdateCourse(id, updates);
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated, curriculum: c.curriculum } : c)));
    return updated;
  };

  const deleteCourse = async (id) => {
    await adminDeleteCourse(id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const refreshDetail = async (courseId) => {
    const detail = await fetchCourseDetail(courseId);
    setCourses((prev) => prev.map((c) => (c.id === courseId ? detail : c)));
    return detail;
  };

  const addModule = async (courseId, title) => {
    const mod = await adminCreateModule(courseId, title);
    await refreshDetail(courseId);
    return mod;
  };
  const updateModule = async (courseId, moduleId, updates) => {
    await adminUpdateModule(moduleId, updates);
    await refreshDetail(courseId);
  };
  const deleteModule = async (courseId, moduleId) => {
    await adminDeleteModule(moduleId);
    await refreshDetail(courseId);
  };
  const addLesson = async (courseId, moduleId, lesson) => {
    const l = await adminCreateLesson(courseId, moduleId, lesson);
    await refreshDetail(courseId);
    return l;
  };
  const updateLesson = async (courseId, moduleId, lessonId, updates) => {
    await adminUpdateLesson(lessonId, updates);
    await refreshDetail(courseId);
  };
  const deleteLesson = async (courseId, moduleId, lessonId) => {
    await adminDeleteLesson(lessonId);
    await refreshDetail(courseId);
  };
  const setCoursePublished = (courseId, published) => updateCourse(courseId, { published });

  // ===== ADMIN STUDENT-DASHBOARD CONTROL =====
  const grantEnrollment = async (userId, courseId, meta = {}) => {
    const enrollment = await adminGrantEnrollment(userId, courseId, meta);
    setEnrollments((prev) => {
      const i = prev.findIndex((e) => e.userId === userId && e.courseId === courseId);
      if (i === -1) return [...prev, enrollment];
      const next = prev.slice();
      next[i] = enrollment;
      return next;
    });
    return enrollment;
  };

  const setEnrollmentStatus = async (userId, courseId, status) => {
    await adminSetEnrollmentStatus(userId, courseId, status);
    setEnrollments((prev) => prev.map((e) =>
      (e.userId === userId && e.courseId === courseId ? { ...e, status } : e)));
  };

  const resetProgress = async (userId, courseId) => {
    await resetProgressDb(userId, courseId);
    setProgressRows((prev) => prev.filter((r) => !(r.user_id === userId && r.course_id === courseId)));
  };

  const adminSetLesson = async (userId, courseId, lessonId, complete) => {
    if (complete) {
      await markLessonDb(userId, courseId, lessonId);
      setProgressRows((prev) => {
        if (prev.some((r) => r.user_id === userId && r.lesson_id === lessonId)) return prev;
        return [...prev, { user_id: userId, course_id: courseId, lesson_id: lessonId, completed_at: new Date().toISOString() }];
      });
    } else {
      await unmarkLessonDb(userId, lessonId);
      setProgressRows((prev) => prev.filter((r) => !(r.user_id === userId && r.lesson_id === lessonId)));
    }
  };

  const issueCertificateManual = async ({ userId, courseId }) => {
    const res = await issueCertificateRpc(userId, courseId);
    const certs = isAdmin ? await fetchAllCertificates() : await fetchMyCertificates(userId);
    setCertificates(certs);
    return certs.find((c) => c.certificateId === res.certificateId) || res;
  };

  const revokeCertificate = async (certId) => {
    await revokeCertificateRpc(certId);
    setCertificates((prev) => prev.map((c) =>
      (c.id === certId || c.certificateId === certId)
        ? { ...c, status: 'revoked', revokedAt: new Date().toISOString() } : c));
  };

  const sendNotificationToUser = async (userId, { title, message, type = 'announcement', courseId = null }) =>
    sendNotificationRow({ userId, title, message, type, courseId });

  const broadcastNotification = async (userIds, payload) =>
    broadcastNotifications(userIds, payload);

  const stats = useMemo(() => {
    const totalStudents = new Set([...enrollments.map((e) => e.userId), ...manualPayments.map((p) => p.userId)]).size;
    const approvedPayments = manualPayments.filter((p) => p.status === 'approved');
    const pendingPayments = manualPayments.filter((p) => p.status === 'pending');
    const rejectedPayments = manualPayments.filter((p) => p.status === 'rejected');
    const totalRevenue = approvedPayments.reduce((sum, p) => sum + p.amount, 0);
    const completed = Object.values(progressMap).filter((p) => p.progress === 100).length;
    return {
      totalStudents,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      totalRevenue,
      approvedRevenue: totalRevenue,
      pendingAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
      rejectedAmount: rejectedPayments.reduce((sum, p) => sum + p.amount, 0),
      approvedPayments: approvedPayments.length,
      pendingPayments: pendingPayments.length,
      rejectedPayments: rejectedPayments.length,
      completedCourses: completed,
      certificatesIssued: certificates.filter((c) => c.status !== 'revoked').length,
    };
  }, [enrollments, courses, manualPayments, progressMap, certificates]);

  const getUserPaymentSummary = useCallback((userId) => {
    const userManual = manualPayments.filter((p) => p.userId === userId);
    const approved = userManual.filter((p) => p.status === 'approved');
    const pending = userManual.filter((p) => p.status === 'pending');
    const rejected = userManual.filter((p) => p.status === 'rejected');
    return {
      totalPaid: approved.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
      approvedAmount: approved.reduce((sum, p) => sum + p.amount, 0),
      rejectedAmount: rejected.reduce((sum, p) => sum + p.amount, 0),
      totalPayments: userManual.length,
      approvedCount: approved.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
    };
  }, [manualPayments]);

  return (
    <CourseContext.Provider value={{
      courses,
      coursesLoading,
      dataLoading,
      ensureCourseDetail,
      refreshCourses,
      refreshMine,
      enrollments,
      payments: [],
      manualPayments: paymentsEnriched,
      certificates,
      progressMap,
      notifications,
      getCourseBySlug,
      getCourseById,
      isEnrolled,
      // Manual payment system
      submitManualPayment,
      approveManualPayment,
      rejectManualPayment,
      getUserManualPayments,
      getManualPaymentByCourse,
      getAllManualPayments,
      getPendingManualPayments,
      getUserPaymentSummary,
      getUserNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      getUserEnrollments,
      getUserPayments,
      getProgress,
      markLessonComplete,
      unmarkLesson,
      getUserCertificates,
      verifyCertificate,
      addCourse,
      updateCourse,
      deleteCourse,
      setCoursePublished,
      addModule, updateModule, deleteModule,
      addLesson, updateLesson, deleteLesson,
      grantEnrollment, setEnrollmentStatus, resetProgress, adminSetLesson,
      issueCertificateManual, revokeCertificate,
      sendNotificationToUser, broadcastNotification,
      stats,
      adminStats,
      allPayments: [],
      allManualPayments: paymentsEnriched,
      allEnrollments: enrollments,
      allCertificates: certificates,
    }}>
      {children}
    </CourseContext.Provider>
  );
};
