import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, BookOpen, BarChart3, User, Star, CheckCircle2, Play, Award, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { formatNaira, getCourseThumbnailGradient } from '../lib/utils';
import { useState } from 'react';

export default function CourseDetails() {
  const { slug } = useParams();
  const { getCourseBySlug, isEnrolled } = useCourses();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openModule, setOpenModule] = useState('m1');

  const course = getCourseBySlug(slug);
  if (!course) return <div className="p-20 text-center">Course not found</div>;

  const enrolled = user ? isEnrolled(user.id, course.id) : false;
  const totalLessons = course.curriculum.reduce((acc, m) => acc + m.lessons.length, 0);
  const gradient = getCourseThumbnailGradient(course.thumbnail);

  const handleEnroll = () => {
    if (!user) {
      navigate('/register', { state: { from: `/course/${slug}` } });
      return;
    }
    if (enrolled) {
      navigate(`/learn/${course.slug}`);
      return;
    }
    navigate(`/enroll/${course.slug}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative border-b border-white/[0.06] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020a1f] via-[#020a1f]/80 to-transparent" />
        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-start">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full glass text-[11px] font-bold tracking-widest">{course.category.toUpperCase()}</span>
                <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-[11px] font-bold text-green-300 flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" /> BESTSELLER</span>
                <span className="px-3 py-1 rounded-full glass text-[11px] font-bold">{course.level}</span>
              </div>

              <h1 className="font-display font-black text-[32px] md:text-[48px] leading-[0.9]">{course.title}</h1>
              <p className="text-[18px] text-white/70 leading-relaxed">{course.description}</p>
              <p className="text-sm text-white/50 leading-relaxed">{course.longDescription}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-2"><div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-xs">{course.instructor.charAt(0)}</div> {course.instructor} • {course.instructorRole}</span>
                <span className="flex items-center gap-1.5 text-white/60"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {course.rating} ({course.students} students)</span>
              </div>

              <div className="flex flex-wrap gap-3 text-[13px]">
                <span className="flex items-center gap-2 px-3 py-2 rounded-full glass"><Clock className="h-4 w-4" /> {course.duration}</span>
                <span className="flex items-center gap-2 px-3 py-2 rounded-full glass"><BookOpen className="h-4 w-4" /> {totalLessons} lessons</span>
                <span className="flex items-center gap-2 px-3 py-2 rounded-full glass"><BarChart3 className="h-4 w-4" /> {course.level}</span>
                <span className="flex items-center gap-2 px-3 py-2 rounded-full glass"><Award className="h-4 w-4" /> Certificate</span>
              </div>
            </div>

            {/* Enroll Card */}
            <div className="lg:sticky lg:top-[100px]">
              <div className="rounded-[24px] glass-strong p-[1px]">
                <div className="rounded-[23px] bg-[#0a1a4a]/80 backdrop-blur-xl overflow-hidden">
                  <div className={`h-[220px] bg-gradient-to-br ${gradient} relative p-6 flex flex-col justify-end`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur text-xs font-bold"><Play className="h-3 w-3" /> PREVIEW COURSE</div>
                      <h3 className="mt-3 font-black text-2xl leading-none">{course.title.slice(0, 20)}</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="flex items-baseline gap-3">
                      <div className="font-black text-[32px]">{formatNaira(course.price)}</div>
                      <div className="text-sm line-through text-white/40">{formatNaira(course.originalPrice)}</div>
                      <div className="ml-auto px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold">{Math.round((1 - course.price / course.originalPrice) * 100)}% OFF</div>
                    </div>

                    <button onClick={handleEnroll} className="w-full btn-primary !py-4 !text-[15px] gap-2">
                      {enrolled ? 'CONTINUE LEARNING' : `ENROLL NOW - ${formatNaira(course.price)}`} <ArrowRight className="h-4 w-4" />
                    </button>

                    {enrolled && <div className="text-center text-xs text-green-300 flex items-center justify-center gap-1"><CheckCircle2 className="h-4 w-4" /> You are enrolled in this course</div>}

                    <div className="space-y-3 text-[13px]">
                      <div className="font-bold text-white/80">This course includes:</div>
                      {[
                        `${course.duration} on-demand video`,
                        `${totalLessons} lessons`,
                        'Downloadable resources',
                        'Lifetime access',
                        'Certificate of completion',
                        'WhatsApp community access'
                      ].map(item => (
                        <div key={item} className="flex items-center gap-2 text-white/60"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> {item}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="glass rounded-xl p-3 text-center"><Shield className="h-5 w-5 mx-auto text-cyan-300 mb-1" /><div className="text-[11px] font-bold">Secure Pay</div></div>
                      <div className="glass rounded-xl p-3 text-center"><Zap className="h-5 w-5 mx-auto text-cyan-300 mb-1" /><div className="text-[11px] font-bold">Instant Access</div></div>
                      <div className="glass rounded-xl p-3 text-center"><Globe className="h-5 w-5 mx-auto text-cyan-300 mb-1" /><div className="text-[11px] font-bold">Lifetime</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
        <div className="space-y-10">
          {/* What you'll learn */}
          <div className="rounded-[24px] glass p-6 md:p-8">
            <h3 className="font-bold text-xl mb-6">What You Will Learn</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {course.whatYouWillLearn.map((item, i) => (
                <div key={i} className="flex gap-3 text-sm text-white/70"><CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" /> {item}</div>
              ))}
            </div>
          </div>

          {/* Curriculum */}
          <div className="rounded-[24px] glass p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl">Course Curriculum</h3>
              <span className="text-xs px-3 py-1 rounded-full glass">{course.curriculum.length} modules • {totalLessons} lessons</span>
            </div>
            <div className="space-y-3">
              {course.curriculum.map(mod => (
                <div key={mod.id} className="rounded-2xl border border-white/10 overflow-hidden">
                  <button onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)} className="w-full flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.05] transition text-left">
                    <div className="font-bold">{mod.title}</div>
                    <div className="text-xs text-white/50">{mod.lessons.length} lessons</div>
                  </button>
                  {openModule === mod.id && (
                    <div className="divide-y divide-white/5">
                      {mod.lessons.map(lesson => (
                        <div key={lesson.id} className="flex items-center gap-3 p-4 text-sm">
                          <div className="h-8 w-8 rounded-full glass flex items-center justify-center shrink-0">
                            {lesson.type === 'video' ? <Play className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{lesson.title}</div>
                            <div className="text-xs text-white/40 capitalize">{lesson.type} • {lesson.duration}</div>
                          </div>
                          {!enrolled && <div className="h-5 w-5 rounded-full border border-white/20 flex items-center justify-center"><div className="h-2 w-2 rounded-full bg-white/20" /></div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructor */}
          <div className="rounded-[24px] glass p-6 md:p-8 flex gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-xl shrink-0">{course.instructor.charAt(0)}</div>
            <div>
              <div className="font-bold text-lg">{course.instructor}</div>
              <div className="text-sm text-cyan-300">{course.instructorRole}</div>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">Professional instructor with years of experience helping students build practical skills that generate income. Passionate about making tech education accessible in Nigeria.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] glass p-6">
            <h4 className="font-bold mb-4">Share This Course</h4>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="flex-1 h-11 rounded-full glass text-sm font-bold hover:bg-white/10">Copy Link</button>
              <a href={`https://wa.me/?text=Check out this course: ${course.title} ${window.location.href}`} target="_blank" className="flex-1 h-11 rounded-full bg-[#25D366] text-white text-sm font-bold flex items-center justify-center">WhatsApp</a>
            </div>
          </div>

          <div className="rounded-[24px] bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 p-6">
            <h4 className="font-bold mb-2">Need Help?</h4>
            <p className="text-sm text-white/60 mb-4">Chat with us on WhatsApp for any questions about this course.</p>
            <a href="https://wa.me/2348159610509" target="_blank" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm"><User className="h-4 w-4" /> CHAT ON WHATSAPP</a>
          </div>
        </div>
      </div>
    </div>
  );
}
