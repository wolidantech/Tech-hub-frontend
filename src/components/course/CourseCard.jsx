import { Link } from 'react-router-dom';
import { Clock, BookOpen, Star, User, ArrowRight } from 'lucide-react';
import { formatNaira } from '../../lib/utils';
import CourseArt from './CourseArt';

export default function CourseCard({ course, onEnroll }) {
  const totalLessons = course.curriculum?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || course.lessonsCount || 0;
  return (
    <div className="group relative rounded-[24px] glass-card overflow-hidden hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_40px_rgba(14,165,233,0.15)] flex flex-col">
      {/* Premium 3D thumbnail */}
      <div className="relative">
        <CourseArt course={course} />
        <div className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur border border-white/15 text-[11px] font-bold tracking-wide">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          {course.category.toUpperCase()}
        </div>
        {/* Price badge */}
        <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-white text-black font-black text-sm shadow-lg">
          {formatNaira(course.price)}
          {course.originalPrice > course.price && (
            <span className="ml-2 text-[11px] line-through text-black/50 font-medium">{formatNaira(course.originalPrice)}</span>
          )}
        </div>
        {/* Level */}
        <div className="absolute bottom-4 left-4 z-20 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur border border-white/10 text-[11px] font-semibold">
          {course.level}
        </div>
        {course.featured && (
          <div className="absolute bottom-4 right-4 z-20 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[11px] font-black">
            ⭐ FEATURED
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-[16px] leading-tight line-clamp-2 group-hover:text-cyan-300 transition">
          {course.title}
        </h3>
        <p className="mt-2 text-[13px] text-white/60 line-clamp-2 leading-relaxed">
          {course.shortDescription}
        </p>

        <div className="mt-4 flex items-center gap-3 text-[12px] text-white/50">
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {course.instructor}</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" /> {course.rating}</span>
        </div>

        <div className="mt-4 flex items-center gap-4 text-[12px] text-white/50">
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {course.duration}</span>
          <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {totalLessons} lessons</span>
          <span className="ml-auto flex items-center gap-1 text-white/40"><span className="h-1.5 w-1.5 rounded-full bg-green-400" /> {course.students} students</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link to={`/course/${course.slug}`} className="inline-flex items-center justify-center gap-1.5 h-11 rounded-full glass font-bold text-[13px] hover:bg-white/[0.12] transition">
            VIEW COURSE
          </Link>
          <button onClick={() => onEnroll?.(course)} className="inline-flex items-center justify-center gap-1.5 h-11 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 font-bold text-[13px] shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:scale-[1.02] transition-all">
            ENROLL NOW <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Hover glow */}
      <div className="pointer-events-none absolute -inset-px rounded-[24px] opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20 blur-[1px]" />
    </div>
  );
}
