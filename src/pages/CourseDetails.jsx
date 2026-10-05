import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock, BookOpen, BarChart3, User, Star, CheckCircle2, Play, Award, ArrowRight, Shield, Zap, Globe,
  AlertTriangle, FileText, Lock, Layers, ChevronDown, ChevronUp, RefreshCw, GraduationCap,
} from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import { useAuth } from '../context/AuthContext';
import { copyText, formatNaira, getCourseThumbnailGradient } from '../lib/utils';
import { fetchClassroom, fetchCourseOutline } from '../lib/catalogApi';
import CourseArt from '../components/course/CourseArt';
import { toast, Toaster } from 'sonner';

function ReviewsSection({ course, user, enrolled }) {
  const { addReview, getCourseReviews, getCourseRating, ensureCourseReviews } = useLMS();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const reviews = getCourseReviews(course.id);
  const avg = getCourseRating(course.id, course.rating ?? 4.8);
  const mine = user ? reviews.find((r) => r.userId === user.id) : null;

  useEffect(() => { ensureCourseReviews(course.id).catch(() => {}); }, [course.id, ensureCourseReviews]);

  const submit = async () => {
    if (!text.trim()) { toast.error('Please write your review'); return; }
    try {
      await addReview({ courseId: course.id, userId: user.id, studentName: user.fullName, rating, text });
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
              <button key={s} aria-label={`${s} star rating`} onClick={() => setRating(s)} className="h-11 w-11 inline-flex items-center justify-center"><Star className={`h-7 w-7 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} hover:scale-110 transition`} /></button>
            ))}
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your experience with this course..." className="w-full rounded-2xl glass p-3 text-sm h-20" />
          <button onClick={submit} className="btn-primary min-h-11 text-xs">SUBMIT REVIEW</button>
        </div>
      )}
      {!user && <div className="mt-4 text-sm text-white/40">Enroll and log in to write a review.</div>}
      {mine && <div className="mt-4 text-sm text-green-300">✓ You've reviewed this course. Thank you!</div>}
    </div>
  );
}

/** One outline module: topics + lesson titles (never lesson content). */
function OutlineModule({ mod, open, onToggle, unlocked }) {
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <button aria-expanded={open} onClick={onToggle} className="w-full min-h-11 flex items-center justify-between gap-3 p-4 bg-white/[0.03] hover:bg-white/[0.05] transition text-left">
        <div className="min-w-0">
          <div className="font-bold break-words">{mod.title}</div>
          {mod.description && <div className="text-xs text-white/40 break-words line-clamp-1">{mod.description}</div>}
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <span className="text-xs text-white/50">{mod.lessonsCount || mod.lessons.length} lessons</span>
          {open ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
        </div>
      </button>
      {open && (
        <div className="divide-y divide-white/5">
          {mod.topics?.length > 0 && mod.topics.map((topic) => (
            <div key={topic.id} className="px-4 py-2.5 text-[11px] font-black tracking-widest text-cyan-300/70 bg-white/[0.02] flex items-center gap-2">
              <Layers className="h-3.5 w-3.5" /> {topic.title.toUpperCase()}
              <span className="ml-auto text-white/30 font-bold normal-case tracking-normal">{topic.lessonsCount} lessons</span>
            </div>
          ))}
          {(mod.lessons || []).length === 0 && (
            <div className="p-4 text-xs text-white/40">No published lessons in this module yet.</div>
          )}
          {(mod.lessons || []).map((lesson) => (
            <div key={lesson.id} className="min-h-11 flex items-center gap-3 p-4 text-sm">
              <div className="h-8 w-8 rounded-full glass flex items-center justify-center shrink-0">
                {lesson.type === 'video' ? <Play className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium break-words">{lesson.title}</div>
                <div className="text-xs text-white/40 capitalize">{lesson.type} {lesson.duration ? `• ${lesson.duration}` : ''}</div>
              </div>
              {lesson.freePreview && <span className="text-[10px] font-black px-2 py-1 rounded-full bg-green-500/20 text-green-300">FREE PREVIEW</span>}
              {!unlocked && !lesson.freePreview && <Lock className="h-4 w-4 text-white/25 shrink-0" aria-label="Locked until enrolled" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CourseDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEnrolled, getManualPaymentByCourse } = useCourses();
  const { siteSettings } = useLMS();

  // Public outline — GET /api/classroom/:slug/outline (titles only)
  const [outline, setOutline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModule, setOpenModule] = useState(null);
  // A 404 from the outline endpoint is the storefront's "not found" rule
  // (archived/unpublished slugs are not part of the public catalogue), not a
  // retryable failure — so it gets its own state instead of an error banner.
  const [notFound, setNotFound] = useState(false);

  // Enrolled students additionally load the gated classroom endpoint, which is
  // the only place full lesson access is granted.
  const [classroom, setClassroom] = useState(null);
  const [classroomError, setClassroomError] = useState('');

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    setNotFound(false);
    try {
      const data = await fetchCourseOutline(slug, { signal });
      setOutline(data);
      setOpenModule((prev) => prev || data.modules?.[0]?.id || null);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      if (err?.status === 404) setNotFound(true);
      else setError(err?.message || 'Could not load this course.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const controller = new AbortController();
    setOutline(null);
    setClassroom(null);
    setClassroomError('');
    setNotFound(false);
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const course = outline?.course || null;
  // Enrollment truth: the API's own enrollment record (it is attached to the
  // outline for signed-in students), with the local enrollment row as backup.
  const enrollmentStatus = String(outline?.enrollment?.status || '').toUpperCase();
  const enrolled = ['ACTIVE', 'COMPLETED'].includes(enrollmentStatus)
    || Boolean(user && course && isEnrolled(user.id, course.id));

  useEffect(() => {
    if (!enrolled || !course) return undefined;
    const controller = new AbortController();
    fetchClassroom(slug, { signal: controller.signal })
      .then(setClassroom)
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setClassroomError(err?.message || 'Could not open your classroom.');
      });
    return () => controller.abort();
  }, [enrolled, course?.id, slug]);

  const modules = useMemo(() => classroom?.curriculum?.length ? classroom.curriculum : (outline?.modules || []), [classroom, outline]);
  const totalLessons = outline?.totalLessons ?? modules.reduce((n, m) => n + (m.lessons?.length || 0), 0);
  const manualPayment = user && course ? getManualPaymentByCourse(user.id, course.id) : null;
  const gradient = getCourseThumbnailGradient(course?.thumbnail);
  const curriculumMessage = outline?.curriculumStatus?.message || '';

  const handleEnroll = () => {
    if (!user) { navigate('/register', { state: { from: `/course/${slug}` } }); return; }
    if (enrolled) { navigate(`/learn/${course.slug}`); return; }
    if (manualPayment?.status === 'pending') { navigate('/my-payments'); return; }
    navigate(`/enroll/${course.slug}`);
  };

  const enrollLabel = enrolled
    ? 'CONTINUE LEARNING'
    : manualPayment?.status === 'pending'
      ? 'PAYMENT PENDING REVIEW'
      : manualPayment?.status === 'rejected'
        ? `RETRY PAYMENT - ${formatNaira(course?.price)}`
        : `ENROLL NOW - ${formatNaira(course?.price)}`;

  if (loading) return <div role="status" className="min-h-[60vh] grid place-content-center p-6 text-center text-white/60">Loading course…</div>;
  if (notFound || (!loading && !error && !course)) {
    return (
      <div className="min-h-[60vh] grid place-content-center gap-4 p-6 text-center">
        <p>Course not found.</p>
        <Link className="btn-secondary min-h-11" to="/courses">Browse courses</Link>
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="min-h-[60vh] grid place-content-center gap-4 p-6 text-center">
        <p>{error}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button className="btn-primary min-h-11" onClick={() => load()}>Try again</button>
          <Link className="btn-secondary min-h-11" to="/courses">Browse courses</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen max-w-full overflow-x-clip">
      <div className="relative border-b border-white/[0.06] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020a1f] via-[#020a1f]/80 to-transparent" />
        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-start">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full glass text-[11px] font-bold tracking-widest">{(course.category || 'Course').toUpperCase()}</span>
                {course.level && <span className="px-3 py-1 rounded-full glass text-[11px] font-bold">{course.level}</span>}
                {enrolled && (
                  <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-[11px] font-bold text-green-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> ENROLLED
                  </span>
                )}
              </div>

              <h1 className="font-display font-black text-[30px] sm:text-[36px] md:text-[48px] leading-[1] sm:leading-[0.95] break-words">{course.title}</h1>
              <p className="text-base sm:text-[18px] text-white/70 leading-relaxed">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {course.instructor && (
                  <span className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-xs">{course.instructor.charAt(0)}</span>
                    {course.instructor}{course.instructorRole ? ` • ${course.instructorRole}` : ''}
                  </span>
                )}
                {course.rating != null && (
                  <span className="flex items-center gap-1.5 text-white/60"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {course.rating}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-[13px]">
                {course.duration && <span className="flex items-center gap-2 px-3 py-2 rounded-full glass"><Clock className="h-4 w-4" /> {course.duration}</span>}
                <span className="flex items-center gap-2 px-3 py-2 rounded-full glass"><BookOpen className="h-4 w-4" /> {totalLessons} lessons</span>
                <span className="flex items-center gap-2 px-3 py-2 rounded-full glass"><Layers className="h-4 w-4" /> {modules.length} modules</span>
                <span className="flex items-center gap-2 px-3 py-2 rounded-full glass"><BarChart3 className="h-4 w-4" /> {course.level || 'All levels'}</span>
                <span className="flex items-center gap-2 px-3 py-2 rounded-full glass"><Award className="h-4 w-4" /> Certificate</span>
              </div>

              {enrolled && (
                <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-4 flex flex-wrap gap-3 items-center">
                  <GraduationCap className="h-5 w-5 text-green-300" />
                  <div className="text-xs text-white/70 flex-1 min-w-[200px]">
                    {classroomError
                      ? `Your enrollment is active, but the classroom could not be opened: ${classroomError}`
                      : 'Your enrollment is active — the full classroom (lessons, videos, quizzes) is unlocked.'}
                  </div>
                  <Link to={`/learn/${course.slug}`} className="min-h-11 inline-flex items-center gap-2 px-4 rounded-full bg-white text-black text-xs font-bold">OPEN CLASSROOM <ArrowRight className="h-4 w-4" /></Link>
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-[100px]">
              <div className="rounded-[24px] glass-strong p-[1px]">
                <div className="rounded-[23px] bg-[#0a1a4a]/80 backdrop-blur-xl overflow-hidden">
                  <div className="relative">
                    <CourseArt course={course} className="h-[240px]" />
                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur text-xs font-bold"><Play className="h-3 w-3" /> COURSE OUTLINE</div>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <div className="font-black text-[32px]">{formatNaira(course.price)}</div>
                      {course.originalPrice > course.price && (
                        <>
                          <div className="text-sm line-through text-white/40">{formatNaira(course.originalPrice)}</div>
                          <div className="sm:ml-auto px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold">{Math.round((1 - course.price / course.originalPrice) * 100)}% OFF</div>
                        </>
                      )}
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
                      {enrollLabel} <ArrowRight className="h-4 w-4" />
                    </button>

                    <div className="space-y-3 text-[13px]">
                      <div className="font-bold text-white/80">This course includes:</div>
                      {[
                        course.duration ? `${course.duration} on-demand video` : 'On-demand video lessons',
                        `${totalLessons} lessons across ${modules.length} modules`,
                        outline?.counts?.quizzes ? `${outline.counts.quizzes} quizzes with auto-grading` : 'Quizzes & assessments',
                        outline?.counts?.assignments ? `${outline.counts.assignments} practical assignments` : 'Practical assignments',
                        'Downloadable resources',
                        'Lifetime access',
                        'Certificate of completion',
                        'WhatsApp community access',
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-white/60"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> {item}</div>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4 space-y-2">
                      <div className="text-[11px] font-bold tracking-widest text-white/40">MANUAL BANK TRANSFER</div>
                      <div className="text-xs"><span className="text-white/50">Bank:</span> <span className="font-bold">{siteSettings?.bankName || 'MONIEPOINT'}</span></div>
                      <div className="text-xs"><span className="text-white/50">Account:</span> <span className="font-mono font-bold text-cyan-300">{siteSettings?.accountNumber || '69852663361'}</span></div>
                      <div className="text-xs"><span className="text-white/50">Name:</span> <span className="font-bold">{siteSettings?.accountName || 'LUNA ENTRY SERVICES'}</span></div>
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
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="font-bold text-xl">Course Outline</h3>
                <span className="mt-2 inline-flex text-xs px-3 py-1.5 rounded-full glass">
                  {modules.length} modules
                  {outline?.counts?.topics ? ` • ${outline.counts.topics} topics` : ''}
                  {' • '}
                  {totalLessons} lessons
                </span>
              </div>
              <button onClick={() => load()} className="min-h-11 px-4 rounded-full glass text-xs font-bold hover:bg-white/10 inline-flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh outline
              </button>
            </div>

            {/* The API reports curriculum readiness so an unfinished course is
                visible BEFORE payment instead of after. */}
            {!outline?.curriculumComplete && curriculumMessage && (
              <div className="mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                <div className="text-xs text-white/70">{curriculumMessage}</div>
              </div>
            )}

            {modules.length === 0 ? (
              <div className="rounded-2xl bg-white/[0.03] p-5 text-sm text-white/60">
                <p className="font-bold text-white">No curriculum is available for this course yet.</p>
                <p className="mt-1">Refresh if lessons were just published, or contact support before enrolling.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {modules.map((mod) => (
                  <OutlineModule
                    key={mod.id}
                    mod={mod}
                    unlocked={enrolled}
                    open={openModule === mod.id}
                    onToggle={() => setOpenModule(openModule === mod.id ? null : mod.id)}
                  />
                ))}
              </div>
            )}
            <p className="mt-4 text-xs text-white/40">
              Lesson videos, notes and quizzes unlock after your payment is approved. This outline is the public curriculum — no lesson content is shown here.
            </p>
          </div>

          <div className="rounded-[24px] glass p-6 md:p-8 flex gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-xl shrink-0">{(course.instructor || 'W').charAt(0)}</div>
            <div>
              <div className="font-bold text-lg">{course.instructor || 'Woli Dan Tech Hub'}</div>
              <div className="text-sm text-cyan-300">{course.instructorRole || 'Instructor'}</div>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">Professional instructor with years of experience helping students build practical skills that generate income.</p>
            </div>
          </div>

          <ReviewsSection course={course} user={user} enrolled={enrolled} />
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] glass p-6">
            <h4 className="font-bold mb-4">Share This Course</h4>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const ok = await copyText(window.location.href);
                  if (ok) toast.success('Course link copied!');
                  else toast.error('Copy was blocked — long-press the address bar to copy.');
                }}
                className="flex-1 h-11 rounded-full glass text-sm font-bold hover:bg-white/10 active:scale-[0.98] transition"
              >
                Copy Link
              </button>
              <a href={`https://wa.me/?text=Check out this course: ${course.title} ${window.location.href}`} target="_blank" rel="noreferrer" className="flex-1 h-11 rounded-full bg-[#25D366] text-white text-sm font-bold flex items-center justify-center">WhatsApp</a>
            </div>
          </div>

          <div className="rounded-[24px] bg-gradient-to-br from-purple-500/20 to-blue-600/20 border border-purple-500/20 p-6">
            <h4 className="font-bold mb-2 flex items-center gap-2"><FileText className="h-5 w-5 text-purple-300" /> Turn Skills Into a CV</h4>
            <p className="text-sm text-white/60 mb-4">Build a professional CV in minutes — free, no account needed. Add what you learn here and download a print-ready PDF.</p>
            <Link to="/cv-builder" className="min-h-11 inline-flex items-center gap-2 px-5 rounded-full bg-purple-500 text-white font-bold text-sm hover:bg-purple-600 transition"><ArrowRight className="h-4 w-4" /> CREATE MY CV FREE</Link>
          </div>

          <div className="rounded-[24px] bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 p-6">
            <h4 className="font-bold mb-2">Need Help?</h4>
            <p className="text-sm text-white/60 mb-4">Chat with us on WhatsApp for payment or course questions.</p>
            <a href="https://wa.me/2348159610509" target="_blank" rel="noreferrer" className="min-h-11 inline-flex items-center gap-2 px-5 rounded-full bg-white text-black font-bold text-sm"><User className="h-4 w-4" /> CHAT ON WHATSAPP</a>
          </div>
        </div>
      </div>
    </div>
  );
}
