import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, BookOpen, BarChart3, User, Star, CheckCircle2, Play, Award, ArrowRight, Shield, Zap, Globe, AlertTriangle, FileText, Layers, Wrench, PenLine, HelpCircle, Download, Printer, ChevronDown, ChevronUp, GraduationCap, RefreshCw } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import { useAuth } from '../context/AuthContext';
import { formatNaira, getCourseThumbnailGradient } from '../lib/utils';
import { estimateStudyHours, downloadAsFile } from '../lib/lms';
import CourseArt from '../components/course/CourseArt';
import { BrandMark } from '../components/common/BrandLogo';
import { Skeleton, ErrorState } from '../components/common/StateUI';
import { useState, useEffect, useMemo } from 'react';
import { toast, Toaster } from 'sonner';

function ReviewsSection({ course, user, enrolled }) {
  const { addReview, getCourseReviews, getCourseRating, ensureCourseReviews } = useLMS();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const reviews = getCourseReviews(course.id);
  const avg = getCourseRating(course.id, course.rating);
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
    <div className="rounded-[24px] glass p-5 md:p-8">
      <Toaster richColors position="top-center" />
      <h3 className="font-bold text-lg">Student Reviews ({reviews.length})</h3>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <div className="flex">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`h-5 w-5 ${s <= Math.round(avg) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />)}</div>
        <span className="font-black text-xl">{avg}</span>
        <span className="text-sm text-white/40">average rating</span>
      </div>

      {reviews.length > 0 ? (
        <div className="mt-5 space-y-3 max-h-[380px] overflow-auto">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-xs shrink-0">{(r.studentName || '?').charAt(0)}</div>
                  <span className="font-bold text-sm truncate">{r.studentName}</span>
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
              <button key={s} onClick={() => setRating(s)} aria-label={`Rate ${s} stars`}><Star className={`h-7 w-7 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} hover:scale-110 transition`} /></button>
            ))}
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your experience with this course..." className="w-full rounded-2xl glass p-3 text-sm h-20 focus:outline-none" />
          <button onClick={submit} className="btn-primary !py-2.5 text-xs w-full sm:w-auto">SUBMIT REVIEW</button>
        </div>
      )}
      {!user && <div className="mt-4 text-sm text-white/40">Enroll and log in to write a review.</div>}
      {mine && <div className="mt-4 text-sm text-green-300">✓ You've reviewed this course. Thank you!</div>}
    </div>
  );
}

const TYPE_DOT = { video: 'bg-amber-400', text: 'bg-sky-400', practical: 'bg-orange-400', quiz: 'bg-purple-400', assignment: 'bg-rose-400', project: 'bg-green-400', resource: 'bg-cyan-400' };

function Stat({ Icon, value, label, cls = 'text-cyan-300' }) {
  return (
    <div className="glass rounded-2xl p-3.5 text-center">
      <Icon className={`h-5 w-5 mx-auto mb-1 ${cls}`} />
      <div className="font-black text-lg leading-none">{value ?? '—'}</div>
      <div className="text-[10px] font-bold tracking-widest text-white/40 mt-1.5">{label}</div>
    </div>
  );
}

export default function CourseDetails() {
  const { slug } = useParams();
  const { getCourseBySlug, isEnrolled, getManualPaymentByCourse, ensureCourseDetail, retryCourseDetail, getProgress, coursesLoading } = useCourses();
  const { trackView, getCourseQuizzes, getCourseAssignments, siteSettings } = useLMS();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openModule, setOpenModule] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const course = getCourseBySlug(slug);
  const enrolled = user && course ? isEnrolled(user.id, course.id) : false;
  const progress = course && user ? getProgress(user.id, course.id) : null;

  useEffect(() => {
    if (!course) return;
    trackView(user?.id, course.id);
    if (!course.curriculum) {
      ensureCourseDetail(course.id).then(() => setDetailError('')).catch((err) => setDetailError(err.message));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, course?.id]);

  useEffect(() => {
    if (course?.curriculum?.length && !openModule) setOpenModule(course.curriculum[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.curriculum]);

  const retry = async () => {
    if (!course) return;
    setRetrying(true);
    try { await retryCourseDetail(course.id); setDetailError(''); toast.success('Curriculum reloaded.'); }
    catch (e) { setDetailError(e.message); }
    finally { setRetrying(false); }
  };

  const curriculum = course?.curriculum || [];
  const counts = course?.counts || (curriculum.length ? {
    modules: curriculum.length,
    topics: curriculum.reduce((a, m) => a + (m.topics?.length || 0), 0),
    lessons: curriculum.reduce((a, m) => a + (m.lessons?.length || 0), 0),
    resources: curriculum.reduce((a, m) => a + (m.lessons || []).reduce((s, l) => s + (l.resources?.length || 0), 0), 0),
    practicals: curriculum.reduce((a, m) => a + (m.lessons || []).filter((l) => l.practical).length, 0),
  } : null);
  const quizCount = course ? getCourseQuizzes(course.id).length : 0;
  const assignmentCount = course ? getCourseAssignments(course.id).length : 0;
  const totalLessons = counts?.lessons ?? (curriculum.length
    ? curriculum.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
    : (course?.lessonsCount || 0));
  const studyHours = course ? estimateStudyHours(course) : null;

  if (!course && coursesLoading) {
    return (
      <div className="pt-12 pb-24 px-4 max-w-[1180px] mx-auto space-y-6">
        <div className="h-[220px] rounded-[24px] bg-white/[0.04] animate-pulse" />
        <Skeleton lines={6} />
      </div>
    );
  }
  if (!course) {
    return (
      <div className="pt-16 pb-24 px-4 max-w-[560px] mx-auto">
        <ErrorState
          title="Course not found"
          message={`“${slug}” is not in the published catalog right now. It may be unpublished, archived, or the catalog is still loading.`}
          className="mb-4"
        />
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => window.location.reload()} className="btn-secondary !py-2.5 text-xs"><RefreshCw className="h-4 w-4 mr-2" /> RELOAD</button>
          <Link to="/courses" className="btn-primary !py-2.5 !text-[13px]">BROWSE ALL COURSES</Link>
        </div>
      </div>
    );
  }

  const manualPayment = user ? getManualPaymentByCourse(user.id, course.id) : null;
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

  const cta = enrolled
    ? (progress && progress.progress > 0 ? 'CONTINUE LEARNING' : 'START COURSE')
    : manualPayment?.status === 'pending' ? 'PAYMENT PENDING REVIEW'
      : manualPayment?.status === 'rejected' ? `RETRY PAYMENT - ${formatNaira(course.price)}`
        : `ENROLL NOW - ${formatNaira(course.price)}`;

  // Full printable scheme of work (spec 6): modules → topics → lessons.
  const buildSchemeHtml = () => {
    const rows = curriculum.map((m) => `
      <h2>${m.title}</h2>
      ${(m.topics || []).map((t) => `<h3>${t.title}</h3><ul>${t.lessons.map((l) => `<li><b>${l.title}</b> <span class="meta">${l.type} · ${l.duration || ''}</span>${l.description ? `<div class="ld">${l.description}</div>` : ''}</li>`).join('')}</ul></div>`).join('')}
      ${(!(m.topics || []).some((t) => t.lessons.length)) ? `<ul>${(m.lessons || []).map((l) => `<li><b>${l.title}</b> <span class="meta">${l.type} · ${l.duration || ''}</span></li>`).join('')}</ul>` : ''}
    `).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>${course.title} — Scheme of Work</title><style>
      body{font-family:Georgia,serif;max-width:760px;margin:36px auto;padding:0 22px;color:#111;line-height:1.6}
      .brand{display:flex;gap:10px;align-items:center;border-bottom:2px solid #0ea5e9;padding-bottom:10px;margin-bottom:16px}
      h1{font-size:24px;margin:8px 0} h2{font-size:17px;margin-top:22px;border-bottom:1px solid #ddd;padding-bottom:3px} h3{font-size:13.5px;color:#0369a1;margin:12px 0 4px;text-transform:uppercase;letter-spacing:.6px}
      ul{margin:4px 0 8px;padding-left:20px} li{margin:4px 0} .meta{color:#666;font-size:11.5px;text-transform:capitalize} .ld{font-size:12.5px;color:#444}
      small{color:#555;letter-spacing:2px;font-size:10px}
    </style></head><body>
      <div class="brand"><svg width="30" height="30" viewBox="0 0 100 100"><rect x="3" y="3" width="94" height="94" rx="21" fill="#0ea5e9"/><path d="M20 29 L35 71 L50 42 L65 71 L80 29" fill="none" stroke="#fff" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <div><b>WOLI DAN TECH HUB</b><br/><small>LEARN • BUILD • GROW</small></div></div>
      <h1>${course.title}</h1>
      <p><b>Scheme of work</b> — ${counts?.modules || curriculum.length} modules · ${totalLessons} lessons${counts?.topics ? ` · ${counts.topics} topics` : ''} · ${counts?.practicals || 0} practicals</p>
      ${rows}
      <p style="margin-top:26px;font-size:11px;color:#777">Generated ${new Date().toLocaleDateString()} from the live course catalog — WOLI DAN TECH HUB.</p>
    </body></html>`;
  };

  const printScheme = () => {
    const w = window.open('', '_blank', 'width=900,height=720');
    if (!w) {
      downloadAsFile(`${course.slug}-scheme-of-work.html`, buildSchemeHtml(), 'text/html');
      toast.info('Downloaded — open it and use Print → Save as PDF.');
      return;
    }
    w.document.write(buildSchemeHtml());
    w.document.close();
    w.focus();
    setTimeout(() => { try { w.print(); } catch { /* manual */ } }, 400);
  };

  const previewModules = showAll ? curriculum : curriculum.slice(0, 4);

  return (
    <div className="min-h-screen pb-16">
      {/* ================= HERO ================= */}
      <div className="relative border-b border-white/[0.06] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020a1f] via-[#020a1f]/80 to-transparent" />
        <div className="relative mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-14 md:pb-16">
          <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-10 items-start">
            <div className="space-y-5 min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full glass text-[11px] font-bold tracking-widest">{(course.category || '').toUpperCase()}</span>
                {enrolled && <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-[11px] font-bold text-green-300 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> ENROLLED</span>}
                {!enrolled && <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-[11px] font-bold text-green-300 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" /> BESTSELLER</span>}
                <span className="px-3 py-1 rounded-full glass text-[11px] font-bold">{course.level}</span>
              </div>

              <h1 className="font-display font-black text-[30px] sm:text-[40px] md:text-[46px] leading-[0.95] break-words">{course.title}</h1>
              <p className="text-[17px] text-white/70 leading-relaxed">{course.description}</p>
              {course.longDescription && <p className="text-sm text-white/50 leading-relaxed">{course.longDescription}</p>}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm min-w-0">
                <span className="flex items-center gap-2 min-w-0"><span className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-xs shrink-0">{(course.instructor || 'W')[0]}</span> <span className="truncate">{course.instructor}{course.instructorRole ? ` • ${course.instructorRole}` : ''}</span></span>
                <span className="flex items-center gap-1.5 text-white/60"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {course.rating} ({course.students} students)</span>
              </div>

              <div className="flex flex-wrap gap-2.5 text-[13px]">
                <span className="flex items-center gap-2 px-3 py-2 rounded-full glass"><Clock className="h-4 w-4 text-cyan-300" /> {studyHours ? `${studyHours} h study` : (course.duration || 'Self-paced')}</span>
                <span className="flex items-center gap-2 px-3 py-2 rounded-full glass"><BookOpen className="h-4 w-4 text-cyan-300" /> {totalLessons} lessons</span>
                <span className="flex items-center gap-2 px-3 py-2 rounded-full glass"><BarChart3 className="h-4 w-4" /> {course.level}</span>
                <span className="flex items-center gap-2 px-3 py-2 rounded-full glass"><Award className="h-4 w-4 text-purple-300" /> Certificate</span>
              </div>
            </div>

            {/* ---------- purchase / status card ---------- */}
            <div className="lg:sticky lg:top-[100px]">
              <div className="rounded-[24px] glass-strong p-[1px]">
                <div className="rounded-[23px] bg-[#0a1a4a]/80 backdrop-blur-xl overflow-hidden">
                  <div className="relative">
                    <CourseArt course={course} className="h-[220px] md:h-[240px]" />
                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur text-xs font-bold"><Play className="h-3 w-3" /> {enrolled ? 'YOUR COURSE' : 'PREVIEW'}</div>
                  </div>
                  <div className="p-5 md:p-6 space-y-5">
                    <div className="flex items-baseline gap-3">
                      <div className="font-black text-[30px]">{formatNaira(course.price)}</div>
                      {course.originalPrice > course.price && <div className="text-sm line-through text-white/40">{formatNaira(course.originalPrice)}</div>}
                    </div>

                    {enrolled && progress && (
                      <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 space-y-2">
                        <div className="flex justify-between text-xs"><span className="text-white/60">Your progress</span><span className="font-black text-cyan-300">{progress.progress}%</span></div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600" style={{ width: `${progress.progress}%` }} /></div>
                        <div className="text-[11px] text-white/40">{(progress.completedLessons || []).length}/{totalLessons} lessons completed</div>
                      </div>
                    )}

                    <button onClick={handleEnroll} className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all ${enrolled ? 'bg-white text-black hover:bg-white/90' : manualPayment?.status === 'pending' ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30' : 'btn-primary'}`}>
                      {enrolled ? <GraduationCap className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />} {cta}
                    </button>
                    {enrolled && <div className="text-center text-xs text-green-300 flex items-center justify-center gap-1"><CheckCircle2 className="h-4 w-4" /> Access granted — full classroom unlocked</div>}

                    <div className="space-y-2.5 text-[13px]">
                      <div className="font-bold text-white/80">This course includes:</div>
                      {[
                        `${totalLessons} structured lessons in ${curriculum.length || counts?.modules || 0} modules`,
                        counts?.topics ? `${counts.topics} topics covered in depth` : 'A complete step-by-step scheme of work',
                        `${counts?.practicals || 0} hands-on practical activities`,
                        quizCount > 0 ? `${quizCount} quizzes with auto-grading` : 'Quizzes with instant feedback',
                        assignmentCount > 0 ? `${assignmentCount} assignments reviewed by instructors` : 'Assignments with instructor review',
                        (counts?.resources || 0) > 0 ? `${counts.resources} downloadable resources (PDFs, files, tools)` : 'Downloadable resources & curated references',
                        'Lifetime access on any device',
                        'Certificate of completion',
                        'DanTECH AI tutor in every lesson',
                        'WhatsApp community access',
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-2 text-white/65"><CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" /> {item}</div>
                      ))}
                    </div>

                    {!enrolled && (
                      <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4 space-y-2">
                        <div className="text-[11px] font-bold tracking-widest text-white/40">MANUAL BANK TRANSFER</div>
                        <div className="text-xs"><span className="text-white/50">Bank:</span> <span className="font-bold">{siteSettings?.bankName || 'MONIEPOINT'}</span></div>
                        <div className="text-xs"><span className="text-white/50">Account:</span> <span className="font-mono font-bold text-cyan-300">{siteSettings?.accountNumber || '69852663361'}</span></div>
                        <div className="text-xs"><span className="text-white/50">Name:</span> <span className="font-bold">{siteSettings?.accountName || 'LUNA ENTRY SERVICES'}</span></div>
                        <div className="text-[11px] text-white/30 mt-2">Only approved payments grant course access</div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-1">
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

      {/* ================= MAIN GRID ================= */}
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8 py-10 md:py-12 grid lg:grid-cols-[1.3fr_0.7fr] gap-8 lg:gap-10">
        <div className="space-y-8 lg:space-y-10 min-w-0">
          {/* Learning outcomes */}
          <div className="rounded-[24px] glass p-5 md:p-8">
            <h3 className="font-bold text-xl mb-5 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-cyan-300" /> What You Will Learn</h3>
            {(course.whatYouWillLearn || []).length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {course.whatYouWillLearn.map((item, i) => (
                  <div key={i} className="flex gap-3 text-sm text-white/70"><CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" /> {item}</div>
                ))}
              </div>
            ) : <div className="text-sm text-white/40">Learning outcomes will be published with the full curriculum.</div>}
            {(course.skillsGained || []).length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/10">
                <div className="text-[11px] font-bold tracking-widest text-white/40 mb-2.5">SKILLS YOU GAIN</div>
                <div className="flex flex-wrap gap-2">
                  {course.skillsGained.map((s, i) => <span key={i} className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-200 text-xs font-bold">{s}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Requirements / audience / estimated study */}
          <div className="rounded-[24px] glass p-5 md:p-8 grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-300" /> Requirements</h3>
              {(course.requirements || []).length > 0 ? (
                <div className="space-y-2">{course.requirements.map((r, i) => <div key={i} className="flex gap-2 text-sm text-white/70"><span className="text-amber-300">•</span> {r}</div>)}</div>
              ) : <div className="text-sm text-white/40">None — start from zero. A phone or laptop with internet is enough.</div>}
            </div>
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2"><User className="h-4 w-4 text-green-300" /> Who Is This For?</h3>
              {(course.audience || []).length > 0 ? (
                <div className="space-y-2">{course.audience.map((a, i) => <div key={i} className="flex gap-2 text-sm text-white/70"><span className="text-green-300">•</span> {a}</div>)}</div>
              ) : <div className="text-sm text-white/40">Beginners and improvers who want practical, income-ready skills.</div>}
            </div>
            <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <Stat Icon={Layers} value={curriculum.length || counts?.modules} label="MODULES" />
              <Stat Icon={BookOpen} value={totalLessons} label="LESSONS" cls="text-green-300" />
              <Stat Icon={Wrench} value={counts?.practicals || 0} label="PRACTICALS" cls="text-orange-300" />
              <Stat Icon={HelpCircle} value={quizCount || '—'} label="QUIZZES" cls="text-purple-300" />
              <Stat Icon={PenLine} value={assignmentCount || '—'} label="ASSIGNMENTS" cls="text-rose-300" />
              <Stat Icon={Clock} value={studyHours ? `${studyHours}h` : (course.duration || '—')} label="STUDY TIME" cls="text-amber-300" />
            </div>
          </div>

          {/* ===== SCHEME OF WORK / curriculum ===== */}
          <div className="rounded-[24px] glass p-5 md:p-8" id="curriculum">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-bold text-xl">Course Curriculum — Scheme of Work</h3>
                <div className="text-xs text-white/45 mt-1">
                  {course.curriculum
                    ? `${curriculum.length} module${curriculum.length === 1 ? '' : 's'} • ${totalLessons} lessons${counts?.topics ? ` • ${counts.topics} topics` : ''}${counts?.resources ? ` • ${counts.resources} resources` : ''}`
                    : 'Live from the academy database'}
                </div>
              </div>
              {course.curriculum && curriculum.length > 0 && (
                <button onClick={printScheme} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-bold hover:bg-white/10 transition shrink-0">
                  <Printer className="h-3.5 w-3.5" /> {enrolled ? 'FULL SCHEME (PDF)' : 'SYLLABUS (PDF)'}
                </button>
              )}
            </div>

            {detailError && (
              <ErrorState
                className="mb-4"
                title="The curriculum could not be loaded"
                message={detailError}
                onRetry={retry}
              />
            )}
            {!course.curriculum && !detailError && (
              <div className="space-y-3"><Skeleton lines={3} /><Skeleton lines={3} /><Skeleton lines={3} /></div>
            )}
            {course.curriculum && curriculum.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center">
                <Layers className="h-8 w-8 mx-auto text-white/25 mb-2" />
                <div className="font-bold text-white/80">No curriculum published yet</div>
                <p className="text-sm text-white/45 mt-1.5 max-w-[440px] mx-auto">This course is live in the catalog; modules, lessons, practicals and quizzes come straight from the academy database and appear here the moment they are published. {enrolled ? 'Your seat is reserved — nothing more to pay.' : ''}</p>
                <button onClick={retry} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass text-xs font-bold hover:bg-white/10"><RefreshCw className={`h-3.5 w-3.5 ${retrying ? 'animate-spin' : ''}`} /> CHECK AGAIN</button>
              </div>
            )}

            <div className="space-y-3">
              {previewModules.map((mod, mi) => (
                <div key={mod.id} className="rounded-2xl border border-white/10 overflow-hidden">
                  <button onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)} className="w-full flex items-center justify-between gap-3 p-4 bg-white/[0.03] hover:bg-white/[0.05] transition text-left">
                    <div className="min-w-0">
                      <div className="font-bold leading-snug">{mod.title}</div>
                      <div className="text-[11px] text-white/45 mt-0.5">Module {mi + 1} • {(mod.lessons || []).length} lessons{mod.topics?.length ? ` • ${mod.topics.length} topics` : ''}</div>
                    </div>
                    <span className="text-xs text-white/50 shrink-0">{openModule === mod.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
                  </button>
                  {openModule === mod.id && (
                    <div className="divide-y divide-white/5 bg-[#020a1f]/40">
                      {(mod.topics || []).length > 0 ? (mod.topics).map((t) => (
                        t.lessons.length > 0 && (
                          <div key={t.id}>
                            <div className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300/70">📌 {t.title}</div>
                            {t.lessons.map((lesson) => <LessonPreviewRow key={lesson.id} lesson={lesson} enrolled={enrolled} slug={slug} />)}
                          </div>
                        )
                      )) : (mod.lessons || []).map((lesson) => <LessonPreviewRow key={lesson.id} lesson={lesson} enrolled={enrolled} slug={slug} />)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {curriculum.length > 4 && (
              <button onClick={() => setShowAll((v) => !v)} className="mt-4 w-full h-11 rounded-full glass font-bold text-sm hover:bg-white/[0.08] transition">
                {showAll ? 'SHOW LESS ▲' : `SHOW ALL ${curriculum.length} MODULES ▼`}
              </button>
            )}
          </div>

          {/* Instructor */}
          <div className="rounded-[24px] glass p-5 md:p-8 flex gap-4 flex-wrap sm:flex-nowrap">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-xl shrink-0">{(course.instructor || 'W')[0]}</div>
            <div className="min-w-0">
              <div className="font-bold text-lg">{course.instructor}</div>
              <div className="text-sm text-cyan-300">{course.instructorRole}</div>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">Professional instructor with years of experience helping students build practical skills that generate income. Every WOLI DAN TECH HUB course is taught in plain English, with real examples and hands-on tasks.</p>
            </div>
          </div>

          <ReviewsSection course={course} user={user} enrolled={enrolled} />
        </div>

        {/* ---------- right rail ---------- */}
        <div className="space-y-5 min-w-0">
          <div className="rounded-[24px] glass p-6">
            <h4 className="font-bold mb-4">Share This Course</h4>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied'); }} className="flex-1 h-11 rounded-full glass text-sm font-bold hover:bg-white/10">Copy Link</button>
              <a href={`https://wa.me/?text=${encodeURIComponent(`Check out this course: ${course.title}`)} ${window.location.href}`} target="_blank" rel="noreferrer" className="flex-1 h-11 rounded-full bg-[#25D366] text-white text-sm font-bold flex items-center justify-center">WhatsApp</a>
            </div>
          </div>

          <div className="rounded-[24px] bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/25 p-5">
            <div className="flex items-center gap-2.5 mb-2">
              <BrandMark size={30} />
              <div className="font-black text-sm tracking-wide">WOLI DAN TECH HUB</div>
            </div>
            <div className="text-[10px] font-bold tracking-[0.3em] text-cyan-300/70">LEARN • BUILD • GROW</div>
            <p className="text-xs text-white/55 mt-2 leading-relaxed">Real courses, real projects, certificates that verify. One academy, every digital skill.</p>
          </div>

          <div className="rounded-[24px] bg-gradient-to-br from-purple-500/20 to-blue-600/20 border border-purple-500/20 p-6">
            <h4 className="font-bold mb-2 flex items-center gap-2"><FileText className="h-5 w-5 text-purple-300" /> Turn Skills Into a CV</h4>
            <p className="text-sm text-white/60 mb-4">Build a professional CV in minutes — free, no account needed. Add what you learn here and download a print-ready PDF.</p>
            <Link to="/cv-builder" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-500 text-white font-bold text-sm hover:bg-purple-600 transition"><ArrowRight className="h-4 w-4" /> CREATE MY CV FREE</Link>
          </div>

          <div className="rounded-[24px] bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 p-6">
            <h4 className="font-bold mb-2">Need Help?</h4>
            <p className="text-sm text-white/60 mb-4">Chat with us on WhatsApp for payment or course questions.</p>
            <a href="https://wa.me/2348159610509" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm"><User className="h-4 w-4" /> CHAT ON WHATSAPP</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonPreviewRow({ lesson, enrolled, slug }) {
  const hasBody = !!(lesson.textContent || lesson.content);
  return (
    <div className="flex items-center gap-3 p-3.5 text-sm">
      <span className={`h-2 w-2 rounded-full shrink-0 ${TYPE_DOT[lesson.type] || 'bg-white/30'}`} />
      <div className="flex-1 min-w-0">
        <div className="font-medium leading-snug">{lesson.title}</div>
        <div className="text-[11px] text-white/40 flex items-center gap-1.5 flex-wrap">
          <span className="capitalize">{lesson.type}</span>
          {lesson.duration && <><span>•</span> {lesson.duration}</>}
          {(lesson.resources || []).length > 0 && <><span>•</span> <Download className="h-3 w-3" /> {lesson.resources.length}</>}
          {lesson.practical && <><span>•</span> <Wrench className="h-3 w-3 text-orange-300" /> practical</>}
          {!hasBody && !enrolled && <span>• preview</span>}
        </div>
      </div>
      {enrolled ? (
        <Link to={`/learn/${slug}`} className="px-3 py-1.5 rounded-full bg-cyan-400 text-black text-[11px] font-black shrink-0 hover:bg-cyan-300 transition">OPEN</Link>
      ) : (
        <span className="h-5 w-5 rounded-full border border-white/20 flex items-center justify-center shrink-0"><div className="h-1.5 w-1.5 rounded-full bg-white/25" /></span>
      )}
    </div>
  );
}
