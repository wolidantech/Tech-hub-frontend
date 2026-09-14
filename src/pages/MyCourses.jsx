import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import CourseArt from '../components/course/CourseArt';
import { Clock, BookOpen, Award, Play } from 'lucide-react';

export default function MyCourses() {
  const { user } = useAuth();
  const { getUserEnrollments, getCourseById, getProgress } = useCourses();
  if (!user) return null;
  const enrollments = getUserEnrollments(user.id).filter((e) => e.status !== 'removed');
  const items = enrollments.map(e => ({ e, course: getCourseById(e.courseId), progress: getProgress(user.id, e.courseId) })).filter(x => x.course);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-10">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-black text-[32px] leading-none mb-2">My Courses</h1>
        <p className="text-white/60 mb-8">{items.length} enrolled • Keep learning, keep growing</p>

        {items.length === 0 ? (
          <div className="glass rounded-[24px] p-16 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-white/20 mb-4" />
            <h3 className="font-bold text-lg">No enrolled courses</h3>
            <Link to="/courses" className="inline-flex mt-6 btn-primary">BROWSE COURSES</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {items.map(({ course, progress }) => {
              const total = course.curriculum ? course.curriculum.reduce((a,m)=>a+(m.lessons?.length||0),0) : (course.lessonsCount || 0);
              return (
                <div key={course.id} className="glass rounded-[20px] p-5">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 rounded-2xl overflow-hidden shrink-0"><CourseArt course={course} className="h-20" /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold leading-tight">{course.title}</h3>
                      <div className="text-xs text-white/50 mt-1 flex gap-3"><span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</span><span>{progress.completedLessons.length}/{total} lessons</span>{course.curriculum ? <span>{course.curriculum.length} modules</span> : null}</div>
                      <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600" style={{ width: `${progress.progress}%` }} /></div>
                      <div className="mt-3 flex gap-2">
                        {!total && <span className="px-3 py-2 rounded-full text-[10px] font-bold text-white/45" title="Modules and lessons are published by the academy in Supabase — this enrollment stays valid">CURRICULUM COMING</span>}
                        <Link to={`/learn/${course.slug}`} className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs flex items-center gap-1"><Play className="h-3 w-3" /> {progress.progress===100?'REVIEW':progress.progress===0?'START COURSE':'CONTINUE LEARNING'}</Link>
                        {progress.progress===100 && <Link to="/certificates" className="px-4 py-2 rounded-full bg-green-500/20 text-green-300 font-bold text-xs flex items-center gap-1"><Award className="h-3 w-3" /> CERTIFICATE</Link>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
