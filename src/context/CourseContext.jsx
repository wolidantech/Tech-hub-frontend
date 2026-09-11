import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { coursesData, enrichCourses } from '../data/courses';
import { 
  getCustomCourses, saveCustomCourses, 
  getEnrollments, saveEnrollments, 
  getPayments, savePayments, 
  getManualPayments, saveManualPayments,
  getProgressMap, saveProgressMap, 
  getCertificates, saveCertificates, 
  generateId, generateCertId, generatePaymentRef,
  getNotifications, saveNotifications
} from '../lib/storage';

const CourseContext = createContext(null);
export const useCourses = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used within CourseProvider');
  return ctx;
};

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState(() => {
    const custom = getCustomCourses();
    return custom ? custom : enrichCourses(coursesData);
  });
  const [enrollments, setEnrollments] = useState(() => getEnrollments());
  const [payments, setPayments] = useState(() => getPayments());
  const [manualPayments, setManualPayments] = useState(() => getManualPayments());
  const [progressMap, setProgressMap] = useState(() => getProgressMap());
  const [certificates, setCertificates] = useState(() => getCertificates());
  const [notifications, setNotifications] = useState(() => getNotifications());

  useEffect(() => { saveCustomCourses(courses); }, [courses]);
  useEffect(() => { saveEnrollments(enrollments); }, [enrollments]);
  useEffect(() => { savePayments(payments); }, [payments]);
  useEffect(() => { saveManualPayments(manualPayments); }, [manualPayments]);
  useEffect(() => { saveProgressMap(progressMap); }, [progressMap]);
  useEffect(() => { saveCertificates(certificates); }, [certificates]);
  useEffect(() => { saveNotifications(notifications); }, [notifications]);

  const getCourseBySlug = (slug) => courses.find(c => c.slug === slug);
  const getCourseById = (id) => courses.find(c => c.id === id);

  const isEnrolled = (userId, courseId) => enrollments.some(e => e.userId === userId && e.courseId === courseId);

  // Legacy auto enroll (for backward compat, but new flow uses manual)
  const enrollUser = (userId, courseId, amount) => {
    if (isEnrolled(userId, courseId)) return;
    const enrollment = {
      id: generateId(),
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      status: 'active'
    };
    const payment = {
      id: generateId(),
      userId,
      courseId,
      amount,
      reference: generatePaymentRef(),
      status: 'successful',
      method: 'Paystack',
      date: new Date().toISOString()
    };
    setEnrollments(prev => [...prev, enrollment]);
    setPayments(prev => [...prev, payment]);
    return { enrollment, payment };
  };

  // ===== MANUAL BANK TRANSFER SYSTEM =====

  const submitManualPayment = ({
    userId,
    courseId,
    studentName,
    email,
    phone,
    amount,
    transactionDate,
    reference,
    receiptData, // base64
    receiptName,
    receiptType,
    receiptSize
  }) => {
    // Validate not already approved
    const existingApproved = manualPayments.find(p => p.userId === userId && p.courseId === courseId && p.status === 'approved');
    if (existingApproved) throw new Error('You already have an approved payment for this course');

    // Check pending exists - allow resubmit if rejected, but block if pending
    const existingPending = manualPayments.find(p => p.userId === userId && p.courseId === courseId && p.status === 'pending');
    if (existingPending) throw new Error('You already have a pending payment for this course. Please wait for review.');

    const course = getCourseById(courseId);

    const manualPayment = {
      id: generateId(),
      userId,
      courseId,
      courseName: course?.title || courseId,
      studentName,
      email,
      phone,
      amount: Number(amount),
      transactionDate,
      reference,
      receiptData, // base64 string (secure, only admin and owner can view)
      receiptName,
      receiptType,
      receiptSize,
      status: 'pending', // pending | approved | rejected
      paymentMethod: 'Manual Bank Transfer',
      bankDetails: {
        bankName: 'MONIEPOINT',
        accountNumber: '69852663361',
        accountName: 'LUNA ENTRY SERVICES- WOLI DAN TECH HUB'
      },
      submittedAt: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
      rejectedReason: null,
      rejectedAt: null,
      rejectedBy: null
    };

    setManualPayments(prev => [...prev, manualPayment]);

    // Add notification
    const notif = {
      id: generateId(),
      userId,
      type: 'payment_submitted',
      title: 'Payment Submitted for Review',
      message: `Your payment for ${course?.title} is being reviewed. Status: PENDING REVIEW`,
      courseId,
      paymentId: manualPayment.id,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [...prev, notif]);

    return manualPayment;
  };

  const approveManualPayment = (paymentId, adminUser) => {
    const payment = manualPayments.find(p => p.id === paymentId);
    if (!payment) throw new Error('Payment not found');
    if (payment.status === 'approved') throw new Error('Already approved');

    // Update payment status
    const updatedPayments = manualPayments.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'approved',
          approvedBy: adminUser?.email || adminUser?.fullName || 'Admin',
          approvedAt: new Date().toISOString()
        };
      }
      return p;
    });
    setManualPayments(updatedPayments);

    // Create enrollment if not exists
    const existingEnrollment = enrollments.find(e => e.userId === payment.userId && e.courseId === payment.courseId);
    if (!existingEnrollment) {
      const enrollment = {
        id: generateId(),
        userId: payment.userId,
        courseId: payment.courseId,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        paymentId: payment.id,
        approvedBy: adminUser?.email
      };
      setEnrollments(prev => [...prev, enrollment]);
    }

    // Notification for student
    const course = getCourseById(payment.courseId);
    const notif = {
      id: generateId(),
      userId: payment.userId,
      type: 'payment_approved',
      title: 'Payment Approved! 🎉',
      message: `Your payment for ${course?.title || payment.courseName} has been approved. You can now access your course from your Student Dashboard. WOLI DAN TECH HUB - Learn • Build • Grow`,
      courseId: payment.courseId,
      paymentId: payment.id,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [...prev, notif]);

    return updatedPayments.find(p => p.id === paymentId);
  };

  const rejectManualPayment = (paymentId, reason, adminUser) => {
    const payment = manualPayments.find(p => p.id === paymentId);
    if (!payment) throw new Error('Payment not found');
    if (!reason) throw new Error('Rejection reason is required');

    const updatedPayments = manualPayments.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'rejected',
          rejectedReason: reason,
          rejectedBy: adminUser?.email || adminUser?.fullName || 'Admin',
          rejectedAt: new Date().toISOString()
        };
      }
      return p;
    });
    setManualPayments(updatedPayments);

    const course = getCourseById(payment.courseId);
    const notif = {
      id: generateId(),
      userId: payment.userId,
      type: 'payment_rejected',
      title: 'Payment Could Not Be Verified',
      message: `Your payment for ${course?.title || payment.courseName} could not be verified. Reason: ${reason}. Please contact WOLI DAN TECH HUB if you believe this was an error.`,
      courseId: payment.courseId,
      paymentId: payment.id,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [...prev, notif]);

    return updatedPayments.find(p => p.id === paymentId);
  };

  const getUserManualPayments = (userId) => manualPayments.filter(p => p.userId === userId).sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  const getManualPaymentByCourse = (userId, courseId) => manualPayments.filter(p => p.userId === userId && p.courseId === courseId).sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
  const getAllManualPayments = () => manualPayments.slice().sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  const getPendingManualPayments = () => manualPayments.filter(p => p.status === 'pending');

  const getUserEnrollments = (userId) => enrollments.filter(e => e.userId === userId);
  const getUserPayments = (userId) => payments.filter(p => p.userId === userId);

  const getProgress = (userId, courseId) => {
    const key = `${userId}_${courseId}`;
    return progressMap[key] || { completedLessons: [], progress: 0, lastLessonId: null };
  };

  const markLessonComplete = (userId, courseId, lessonId) => {
    // Security: only allow if enrolled
    if (!isEnrolled(userId, courseId)) throw new Error('Not enrolled');

    const key = `${userId}_${courseId}`;
    const current = progressMap[key] || { completedLessons: [], progress: 0, lastLessonId: null };
    if (current.completedLessons.includes(lessonId)) return current;

    const course = getCourseById(courseId);
    const totalLessons = course.curriculum.reduce((acc, m) => acc + m.lessons.length, 0);
    const completed = [...current.completedLessons, lessonId];
    const progress = Math.round((completed.length / totalLessons) * 100);

    const updated = { completedLessons: completed, progress, lastLessonId: lessonId };
    const newMap = { ...progressMap, [key]: updated };
    setProgressMap(newMap);

    if (progress === 100) {
      const existing = certificates.find(c => c.userId === userId && c.courseId === courseId);
      if (!existing) {
        const cert = {
          id: generateId(),
          certificateId: generateCertId(),
          userId,
          courseId,
          courseName: course.title,
          studentName: '',
          issueDate: new Date().toISOString(),
        };
        setCertificates(prev => [...prev, cert]);

        const notif = {
          id: generateId(),
          userId,
          type: 'course_completed',
          title: 'Course Completed! 🎓',
          message: `Congratulations! You completed ${course.title}. Your certificate is ready.`,
          courseId,
          createdAt: new Date().toISOString(),
          read: false
        };
        setNotifications(prev => [...prev, notif]);
      }
    }

    return updated;
  };

  const unmarkLesson = (userId, courseId, lessonId) => {
    const key = `${userId}_${courseId}`;
    const current = progressMap[key];
    if (!current) return;
    const completed = current.completedLessons.filter(id => id !== lessonId);
    const course = getCourseById(courseId);
    const total = course.curriculum.reduce((acc, m) => acc + m.lessons.length, 0);
    const progress = total ? Math.round((completed.length / total) * 100) : 0;
    setProgressMap({ ...progressMap, [key]: { ...current, completedLessons: completed, progress } });
  };

  const getUserCertificates = (userId) => certificates.filter(c => c.userId === userId);
  const verifyCertificate = (certId) => certificates.find(c => c.certificateId === certId);

  const getUserNotifications = (userId) => notifications.filter(n => n.userId === userId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const markNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  // Admin actions
  const addCourse = (course) => {
    const newCourse = {
      ...course,
      id: course.id || course.slug,
      slug: course.slug,
      curriculum: course.curriculum || [
        { id: 'm1', title: 'Introduction', lessons: [{ id: `${course.id}-l1`, title: 'Welcome', type: 'video', duration: '10:00', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }] }
      ]
    };
    setCourses(prev => [newCourse, ...prev]);
  };

  const updateCourse = (id, updates) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCourse = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const stats = useMemo(() => {
    const totalStudents = new Set([...enrollments.map(e => e.userId), ...manualPayments.map(p => p.userId)]).size;
    const approvedPayments = manualPayments.filter(p => p.status === 'approved');
    const pendingPayments = manualPayments.filter(p => p.status === 'pending');
    const rejectedPayments = manualPayments.filter(p => p.status === 'rejected');
    const totalRevenue = approvedPayments.reduce((sum, p) => sum + p.amount, 0) + payments.filter(p => p.status === 'successful').reduce((sum, p) => sum + p.amount, 0);
    const completed = Object.values(progressMap).filter(p => p.progress === 100).length;
    return {
      totalStudents,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      totalRevenue,
      approvedRevenue: approvedPayments.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
      rejectedAmount: rejectedPayments.reduce((sum, p) => sum + p.amount, 0),
      approvedPayments: approvedPayments.length,
      pendingPayments: pendingPayments.length,
      rejectedPayments: rejectedPayments.length,
      completedCourses: completed,
      certificatesIssued: certificates.length
    };
  }, [enrollments, courses, payments, manualPayments, progressMap, certificates]);

  const getUserPaymentSummary = (userId) => {
    const userManual = manualPayments.filter(p => p.userId === userId);
    const approved = userManual.filter(p => p.status === 'approved');
    const pending = userManual.filter(p => p.status === 'pending');
    const rejected = userManual.filter(p => p.status === 'rejected');
    return {
      totalPaid: approved.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
      approvedAmount: approved.reduce((sum, p) => sum + p.amount, 0),
      rejectedAmount: rejected.reduce((sum, p) => sum + p.amount, 0),
      totalPayments: userManual.length,
      approvedCount: approved.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length
    };
  };

  return (
    <CourseContext.Provider value={{
      courses,
      enrollments,
      payments,
      manualPayments,
      certificates,
      progressMap,
      notifications,
      getCourseBySlug,
      getCourseById,
      isEnrolled,
      enrollUser,
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
      stats,
      allPayments: payments,
      allManualPayments: manualPayments,
      allEnrollments: enrollments,
      allCertificates: certificates
    }}>
      {children}
    </CourseContext.Provider>
  );
};
