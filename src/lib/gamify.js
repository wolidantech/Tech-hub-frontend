// Gamification: XP, badges, streaks, leaderboard — computed from real activity.
// XP rules: lesson 10 • quiz pass 20 • assignment approved 30 • course complete 100 • review 5

export const XP_RULES = { lesson: 10, quizPass: 20, assignmentApproved: 30, courseComplete: 100, review: 5, streakDay: 5 };

export const BADGES = [
  { id: 'first-course', name: 'First Course', desc: 'Enrolled in your first course', icon: '🎓', check: ({ enrollments }) => enrollments.length >= 1 },
  { id: 'design-starter', name: 'Design Starter', desc: 'Completed 5 design lessons', icon: '🎨', check: ({ lessonsByCategory }) => (lessonsByCategory.Design || 0) + (lessonsByCategory['Graphic Design'] || 0) + (lessonsByCategory['UI/UX Design'] || 0) >= 5 },
  { id: 'code-builder', name: 'Code Builder', desc: 'Completed 5 coding lessons', icon: '💻', check: ({ lessonsByCategory }) => ['Web Development', 'Frontend Development', 'Python', 'JavaScript', 'Mobile App Development', 'Mobile Development'].reduce((s, c) => s + (lessonsByCategory[c] || 0), 0) >= 5 },
  { id: 'ai-explorer', name: 'AI Explorer', desc: 'Completed 5 AI lessons', icon: '🤖', check: ({ lessonsByCategory }) => ['AI & Technology', 'AI & Artificial Intelligence', 'Generative AI', 'Prompt Engineering'].reduce((s, c) => s + (lessonsByCategory[c] || 0), 0) >= 5 },
  { id: 'quiz-master', name: 'Quiz Master', desc: 'Passed 5 quizzes', icon: '🧠', check: ({ quizzesPassed }) => quizzesPassed >= 5 },
  { id: 'project-builder', name: 'Project Builder', desc: 'Got 3 assignments approved', icon: '🛠', check: ({ approvedCount }) => approvedCount >= 3 },
  { id: 'streak-7', name: '7-Day Learner', desc: 'Learned 7 days in a row', icon: '🔥', check: ({ streak }) => streak >= 7 },
  { id: 'course-champion', name: 'Course Champion', desc: 'Completed a full course', icon: '🏆', check: ({ completedCount }) => completedCount >= 1 },
  { id: 'scholar', name: 'Scholar', desc: 'Earned 500 XP', icon: '⭐', check: ({ xp }) => xp >= 500 },
];

export function dayKeys(events) {
  return [...new Set(events.map((e) => (e.createdAt || '').slice(0, 10)))].sort();
}

export function calcStreak(events) {
  const days = dayKeys(events);
  if (!days.length) return 0;
  let streak = 0;
  const d = new Date();
  // allow today missing (count back from yesterday)
  const hasToday = days.includes(d.toISOString().slice(0, 10));
  if (!hasToday) d.setDate(d.getDate() - 1);
  while (days.includes(d.toISOString().slice(0, 10))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function computeGamification({ userId, enrollments, progressMap, courses, quizAttempts, submissions, learningEvents, reviews = [] }) {
  const myEnrollments = enrollments.filter((e) => e.userId === userId && e.status !== 'removed');
  const byId = new Map(courses.map((c) => [c.id, c]));
  let lessons = 0, completedCount = 0;
  const lessonsByCategory = {};
  myEnrollments.forEach((e) => {
    const c = byId.get(e.courseId);
    const p = progressMap[`${userId}_${e.courseId}`];
    const n = p?.completedLessons?.length || 0;
    lessons += n;
    if (p?.progress === 100) completedCount += 1;
    if (c) lessonsByCategory[c.category] = (lessonsByCategory[c.category] || 0) + n;
  });
  const myAttempts = quizAttempts.filter((a) => a.userId === userId);
  const quizzesPassed = new Set(myAttempts.filter((a) => a.passed).map((a) => a.quizId)).size;
  const approvedCount = submissions.filter((s) => s.userId === userId && s.status === 'approved').length;
  const myReviews = reviews.filter((r) => r.userId === userId).length;
  const myEvents = learningEvents.filter((e) => e.userId === userId);
  const streak = calcStreak(myEvents);
  const xp = lessons * XP_RULES.lesson + quizzesPassed * XP_RULES.quizPass + approvedCount * XP_RULES.assignmentApproved + completedCount * XP_RULES.courseComplete + myReviews * XP_RULES.review + Math.min(streak, 30) * XP_RULES.streakDay;

  const ctx = { enrollments: myEnrollments, lessonsByCategory, quizzesPassed, approvedCount, streak, completedCount, xp };
  const badges = BADGES.filter((b) => { try { return b.check(ctx); } catch { return false; } }).map((b) => b.id);
  return { xp, streak, badges, lessons, quizzesPassed, approvedCount, completedCount, level: Math.floor(xp / 200) + 1 };
}

export function buildLeaderboard({ users, enrollments, progressMap, courses, quizAttempts, submissions, learningEvents, limit = 10 }) {
  return users
    .filter((u) => u.role !== 'admin' && !u.banned)
    .map((u) => ({ user: u, ...computeGamification({ userId: u.id, enrollments, progressMap, courses, quizAttempts, submissions, learningEvents }) }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
}
