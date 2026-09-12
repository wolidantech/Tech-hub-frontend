import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, BookOpen, BarChart3, User, Star, CheckCircle2, Play, Award, ArrowRight, Shield, Zap, Globe, AlertTriangle } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import { useAuth } from '../context/AuthContext';
import { formatNaira, getCourseThumbnailGradient } from '../lib/utils';
import CourseArt from '../components/course/CourseArt';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';

function ReviewsSection({ course, user, enrolled }) {
  const { addReview, getCourseReviews, getCourseRating } = useLMS();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const reviews = getCourseReviews(course.id);
  const avg = getCourseRating(course.id, course.rating);
  const mine = user ? reviews.find((r) => r.userId === user.id) : null;

  const submit = () => {
    if (!text.trim()) { toast.error('Please write your review'); return; }
    try {
      addReview({ courseId: course.id, userId: user.id, studentName: user.fullName, rating, text });
      setText('');
      toast.success('Thanks for your review! ⭐');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="rounded-[24px] glass p-6 md:p-8">
      <Toaster richColors />
      <h3 className="font-bold text-lg">Student Reviews ({reviews.length})</h3>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-5 w-5 ${s <= Math.round(avg) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />)}</div>
        <span className="font-black text-xl">{avg}</span>
        <span className="text-sm text-white/40">average rating</span>
      </div>

      {reviews.length > 0 ? (
        <div className="mt-5 space-y-3 max-h-[380px] overflow-auto">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-xs">{(r.studentName || '?').charAt(0)}</div>
                  <span className="font-bold text-sm">{r.studentName}</span>
                </div>
                <div className="flex">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />)}</div>
              </div>
              <p className="text-sm text-white/70 mt-2">{r.text}</p>
              <div className="text-[11px] text-white/30 mt-1">{new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 text-sm text-white/40">No reviews yet — be the first!</div>
      )}

      {user && enrolled && !mine && (
        <div className="mt-5 rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
          <div className="font-bold text-sm">Write a review</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)}><Star className={`h-7 w-7 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} hover:scale-110 transition`} /></button>
            ))}
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your experience with this course..." className="w-full rounded-2xl glass p-3 text-sm h-20" />
          <button onClick={submit} className="btn-primary !py-2.5 text-xs">SUBMIT REVIEW</button>
        </div>
      )}
      {!user && <div className="mt-4 text-sm text-white/40">Enroll and log in to write a review.</div>}
      {mine && <div className="mt-4 text-sm text-green-300">✓ You've reviewed this course. Thank you!</div>}
    </div>
  );
}

export default function CourseDetails() {
  const { slug } = useParams();
  const { getCourseBySlug, isEnrolled, getManualPaymentByCourse } = useCourses();
  const { trackView, getCourseQuizzes, getCourseAssignments } = useLMS();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openModule, setOpenModule] = useState('m1');

  const course = getCourseBySlug(slug);

  useEffect(() => {
    if (course) trackView(user?.id || 'anon', course.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!course) return <div className="p-20 text-center">Course not found</div>;

  const enrolled = user ? isEnrolled(user.id, course.id) : false;
  const manualPayment = user ? getManualPaymentByCourse(user.id, course.id) : null;
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
    if (manualPayment?.status === 'pending') {
      navigate('/my-payments');
      return;
    }
    navigate(`/enroll/${course.slug}`);
  };

  const getEnrollButtonText = () => {
    if (enrolled) return 'CONTINUE LEARNING';
    if (manualPayment?.status === 'pending') return 'PAYMENT PENDING REVIEW';
    if (manualPayment?.status === 'rejected') return `RETRY PAYMENT - ${formatNaira(course.price)}`;
    return `ENROLL NOW - ${formatNaira(course.price)}`;
  };

  return (
    <div className="min-h-screen">
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

            <div className="lg:sticky lg:top-[100px]">
              <div className="rounded-[24px] glass-strong p-[1px]">
                <div className="rounded-[23px] bg-[#0a1a4a]/80 backdrop-blur-xl overflow-hidden">
                  <div className="relative">
                    <CourseArt course={course} className="h-[240px]" />
                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur text-xs font-bold"><Play className="h-3 w-3" /> PREVIEW COURSE</div>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="flex items-baseline gap-3">
                      <div className="font-black text-[32px]">{formatNaira(course.price)}</div>
                      <div className="text-sm line-through text-white/40">{formatNaira(course.originalPrice)}</div>
                      <div className="ml-auto px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold">{Math.round((1 - course.price / course.originalPrice) * 100)}% OFF</div>
                    </div>

                    {manualPayment?.status === 'pending' && (
                      <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                        <div className="text-xs">
                          <div className="font-bold text-amber-300">Payment Pending Review</div>
                          <div className="text-white/60 mt-1">Ref: {manualPayment.reference} • Submitted {new Date(manualPayment.submittedAt).toLocaleDateString()}. Admin will verify soon.</div>
                        </div>
                      </div>
                    )}

                    {manualPayment?.status === 'rejected' && (
                      <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
                        <div className="font-bold text-red-300 text-xs">Payment Rejected</div>
                        <div className="text-white/60 text-xs mt-1">Reason: {manualPayment.rejectedReason}</div>
                      </div>
                    )}

                    <button onClick={handleEnroll} className={`w-full !py-4 !text-[15px] gap-2 inline-flex items-center justify-center rounded-full font-bold transition-all ${enrolled ? 'bg-white text-black hover:bg-white/90' : manualPayment?.status === 'pending' ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300 cursor-pointer hover:bg-amber-500/30' : 'btn-primary'}`}>
                      {getEnrollButtonText()} <ArrowRight className="h-4 w-4" />
                    </button>

                    {enrolled && <div className="text-center text-xs text-green-300 flex items-center justify-center gap-1"><CheckCircle2 className="h-4 w-4" /> You are enrolled • Access granted after approval</div>}

                    <div className="space-y-3 text-[13px]">
                      <div className="font-bold text-white/80">This course includes:</div>
                      {[
                        `${course.duration} on-demand video`,
                        `${totalLessons} lessons`,
                        quizCount > 0 ? `${quizCount} quizzes with auto-grading` : 'Quizzes & assessments',
                        assignmentCount > 0 ? `${assignmentCount} practical assignments` : 'Practical assignments',
                        'Downloadable resources',
                        'Lifetime access',
                        'Certificate of completion',
                        'WhatsApp community access'
                      ].map(item => (
                        <div key={item} className="flex items-center gap-2 text-white/60"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> {item}</div>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4 space-y-2">
                      <div className="text-[11px] font-bold tracking-widest text-white/40">MANUAL BANK TRANSFER</div>
                      <div className="text-xs"><span className="text-white/50">Bank:</span> <span className="font-bold">MONIEPOINT</span></div>
                      <div className="text-xs"><span className="text-white/50">Account:</span> <span className="font-mono font-bold text-cyan-300">69852663361</span></div>
                      <div className="text-xs"><span className="text-white/50">Name:</span> <span className="font-bold">LUNA ENTRY SERVICES- WOLI DAN TECH HUB</span></div>
                      <div className="text-[11px] text-white/30 mt-2">Only approved payments grant course access</div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="glass rounded-xl p-3 text-center"><Shield className="h-5 w-5 mx-auto text-cyan-300 mb-1" /><div className="text-[11px] font-bold">Secure Pay</div></div>
                      <div className="glass rounded-xl p-3 text-center"><Zap className="h-5 w-5 mx-auto text-cyan-300 mb-1" /><div className="text-[11px] font-bold">Manual Verify</div></div>
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
          <div className="rounded-[24px] glass p-6 md:p-8">
            <h3 className="font-bold text-xl mb-6">What You Will Learn</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {course.whatYouWillLearn.map((item, i) => (
                <div key={i} className="flex gap-3 text-sm text-white/70"><CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" /> {item}</div>
              ))}
            </div>
          </div>

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

          <div className="rounded-[24px] glass p-6 md:p-8 flex gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-xl shrink-0">{course.instructor.charAt(0)}</div>
            <div>
              <div className="font-bold text-lg">{course.instructor}</div>
              <div className="text-sm text-cyan-300">{course.instructorRole}</div>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">Professional instructor with years of experience helping students build practical skills that generate income.</p>
            </div>
          </div>

          <ReviewsSection course={course} user={user} enrolled={enrolled} />
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
            <p className="text-sm text-white/60 mb-4">Chat with us on WhatsApp for payment or course questions.</p>
            <a href="https://wa.me/2348159610509" target="_blank" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm"><User className="h-4 w-4" /> CHAT ON WHATSAPP</a>
          </div>
        </div>
      </div>
    </div>
  );
}
