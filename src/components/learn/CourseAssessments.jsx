import { useState } from 'react';
import QuizTaker from './QuizTaker';
import AssignmentPanel from './AssignmentPanel';

// Uses existing module_id / lesson_id relationships. No synthetic tasks or IDs.
export default function CourseAssessments({ course, quizzes, assignments, user, preview = false }) {
  const [active, setActive] = useState(null);
  const groups = [
    ...(course.curriculum || []).map(module => ({ id: module.id, title: `${module.title} — Assessment`, match: item => item.moduleId === module.id && !item.lessonId })),
    { id: 'course', title: 'Course assessments & final work', match: item => !item.moduleId && !item.lessonId },
  ].map(group => ({ ...group, quizzes: quizzes.filter(group.match), assignments: assignments.filter(group.match) }))
    .filter(group => group.quizzes.length || group.assignments.length);
  if (!groups.length) return null;
  return <section id="course-assessments" aria-label="Course assessments" className="glass rounded-2xl p-4 sm:p-6 space-y-4 scroll-mt-8">
    <h2 className="font-bold text-lg">Assessments & final work</h2>
    <p className="text-sm text-white/60">Open module assessments, practical projects and examinations here. Scores and reviews are saved by the backend; opening an assessment does not mark it complete.</p>
    {groups.map(group => <div key={group.id} className="space-y-2">
      <h3 className="font-bold text-cyan-200">{group.title}</h3>
      {[...group.quizzes.map(item => ({ item, kind: 'quiz' })), ...group.assignments.map(item => ({ item, kind: 'assignment' }))].map(({ item, kind }) => {
        const key = `${kind}-${item.id}`;
        const open = active === key;
        return <div key={key} className="rounded-xl border border-white/10 overflow-hidden">
          <button aria-expanded={open} aria-controls={`assessment-${key}`} onClick={() => setActive(open ? null : key)} className="w-full text-left p-4 hover:bg-white/5">
            <span className="text-xs text-white/50 block">{kind === 'quiz' ? item.isFinal ? 'FINAL EXAMINATION' : 'QUIZ' : item.isFinalProject ? 'FINAL PRACTICAL / PROJECT' : 'ASSIGNMENT'}</span>
            <span className="font-bold">{item.title}</span><span className="ml-2">{open ? '−' : '+'}</span>
          </button>
          {open && <div id={`assessment-${key}`} className="p-3 sm:p-5 border-t border-white/10">
            {preview ? <p>Student submissions and attempts are disabled in admin preview. Review this assessment in the admin manager.</p> : kind === 'quiz' ? <QuizTaker key={key} quiz={item} userId={user.id} /> : <AssignmentPanel key={key} assignment={item} user={user} />}
          </div>}
        </div>;
      })}
    </div>)}
  </section>;
}
