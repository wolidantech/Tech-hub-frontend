import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { coursesData, enrichCourses } from '../data/courses';
import { getCustomCourses, saveCustomCourses, getEnrollments, saveEnrollments, getPayments, savePayments, getProgressMap, saveProgressMap, getCertificates, saveCertificates, generateId, generateCertId, generatePaymentRef } from '../lib/storage';

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
  const [progressMap, setProgressMap] = useState(() => getProgressMap());
  const [certificates, setCertificates] = useState(() => getCertificates());

  useEffect(() => { saveCustomCourses(courses); }, [courses]);
  useEffect(() => { saveEnrollments(enrollments); }, [enrollments]);
  useEffect(() => { savePayments(payments); }, [payments]);
  useEffect(() => { saveProgressMap(progressMap); }, [progressMap]);
  useEffect(() => { saveCertificates(certificates); }, [certificates]);

  const getCourseBySlug = (slug) => courses.find(c => c.slug === slug);
  const getCourseById = (id) => courses.find(c => c.id === id);

  const isEnrolled = (userId, courseId) => enrollments.some(e => e.userId === userId && e.courseId === courseId);

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

  const getUserEnrollments = (userId) => enrollments.filter(e => e.userId === userId);
  const getUserPayments = (userId) => payments.filter(p => p.userId === userId);

  const getProgress = (userId, courseId) => {
    const key = `${userId}_${courseId}`;
    return progressMap[key] || { completedLessons: [], progress: 0, lastLessonId: null };
  };

  const markLessonComplete = (userId, courseId, lessonId) => {
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

    // Auto-generate certificate if 100%
    if (progress === 100) {
      const existing = certificates.find(c => c.userId === userId && c.courseId === courseId);
      if (!existing) {
        const cert = {
          id: generateId(),
          certificateId: generateCertId(),
          userId,
          courseId,
          courseName: course.title,
          studentName: '', // filled later
          issueDate: new Date().toISOString(),
        };
        setCertificates(prev => [...prev, cert]);
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
    const totalStudents = new Set(enrollments.map(e => e.userId)).size;
    const totalRevenue = payments.filter(p => p.status === 'successful').reduce((sum, p) => sum + p.amount, 0);
    const completed = Object.values(progressMap).filter(p => p.progress === 100).length;
    return {
      totalStudents,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      totalRevenue,
      completedCourses: completed,
      certificatesIssued: certificates.length
    };
  }, [enrollments, courses, payments, progressMap, certificates]);

  return (
    <CourseContext.Provider value={{
      courses,
      enrollments,
      payments,
      certificates,
      progressMap,
      getCourseBySlug,
      getCourseById,
      isEnrolled,
      enrollUser,
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
      allEnrollments: enrollments,
      allCertificates: certificates
    }}>
      {children}
    </CourseContext.Provider>
  );
};
