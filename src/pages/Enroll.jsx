import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Shield, Zap, CheckCircle2, CreditCard, ArrowLeft } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { formatNaira } from '../lib/utils';
import { toast, Toaster } from 'sonner';

export default function Enroll() {
  const { slug } = useParams();
  const { getCourseBySlug, enrollUser } = useCourses();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  const course = getCourseBySlug(slug);
  if (!course) return <div className="p-20 text-center">Course not found</div>;
  if (!user) {
    navigate('/login');
    return null;
  }

  const handlePay = async () => {
    setPaying(true);
    // Simulate Paystack flow
    toast.info('Initializing Paystack secure checkout...');
    await new Promise(r => setTimeout(r, 1500));
    try {
      enrollUser(user.id, course.id, course.price);
      setSuccess(true);
      toast.success('Payment successful! You are now enrolled 🎉');
    } catch (e) {
      toast.error('Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Toaster richColors />
        <div className="w-full max-w-[480px] glass-strong rounded-[24px] p-8 text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto"><CheckCircle2 className="h-10 w-10 text-green-400" /></div>
          <div>
            <h1 className="font-display font-black text-2xl">PAYMENT SUCCESSFUL ✅</h1>
            <p className="mt-2 text-white/60">You are now enrolled in <span className="text-white font-bold">{course.title}</span></p>
          </div>
          <div className="glass rounded-2xl p-4 text-left text-sm space-y-2">
            <div className="flex justify-between"><span className="text-white/50">Course</span><span className="font-bold">{course.title.slice(0,30)}</span></div>
            <div className="flex justify-between"><span className="text-white/50">Amount</span><span className="font-bold text-green-300">{formatNaira(course.price)}</span></div>
            <div className="flex justify-between"><span className="text-white/50">Student</span><span className="font-bold">{user.fullName}</span></div>
            <div className="flex justify-between"><span className="text-white/50">Email</span><span className="font-bold">{user.email}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/dashboard" className="h-12 rounded-full glass flex items-center justify-center font-bold text-sm">GO TO DASHBOARD</Link>
            <Link to={`/learn/${course.slug}`} className="h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(14,165,233,0.4)]">START LEARNING</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-12">
      <Toaster richColors />
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8">
        <Link to={`/course/${slug}`} className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8"><ArrowLeft className="h-4 w-4" /> Back to course</Link>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
          <div className="space-y-6">
            <div>
              <h1 className="font-display font-black text-[32px] leading-none">Checkout</h1>
              <p className="mt-2 text-white/60">Complete your enrollment securely with Paystack</p>
            </div>

            <div className="glass rounded-[24px] p-6 space-y-5">
              <h3 className="font-bold">Order Summary</h3>
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black shrink-0">{course.title.slice(0,2)}</div>
                <div>
                  <div className="font-bold leading-tight">{course.title}</div>
                  <div className="text-sm text-white/50 mt-1">{course.category} • {course.duration} • {course.lessonsCount} lessons</div>
                  <div className="mt-2 inline-flex px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold">Lifetime Access</div>
                </div>
              </div>

              <div className="space-y-3 text-sm pt-4 border-t border-white/10">
                <div className="flex justify-between"><span className="text-white/50">Subtotal</span><span className="font-bold">{formatNaira(course.price)}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Discount</span><span className="font-bold text-green-300">- {formatNaira(course.originalPrice - course.price)}</span></div>
                <div className="flex justify-between text-lg font-black pt-3 border-t border-white/10"><span>Total</span><span className="text-gradient">{formatNaira(course.price)}</span></div>
              </div>
            </div>

            <div className="glass rounded-[24px] p-6 space-y-4">
              <h3 className="font-bold">Student Information</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><div className="text-white/40 text-xs">Full Name</div><div className="font-bold mt-1">{user.fullName}</div></div>
                <div><div className="text-white/40 text-xs">Email</div><div className="font-bold mt-1">{user.email}</div></div>
                <div><div className="text-white/40 text-xs">Phone</div><div className="font-bold mt-1">{user.phone}</div></div>
                <div><div className="text-white/40 text-xs">Course</div><div className="font-bold mt-1">{course.title.slice(0,24)}</div></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[24px] glass-strong p-[1px]">
              <div className="rounded-[23px] bg-[#0a1a4a]/80 p-6 space-y-6">
                <h3 className="font-bold text-lg">Payment Method</h3>

                <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center"><CreditCard className="h-5 w-5 text-black" /></div>
                  <div><div className="font-bold text-sm">Paystack Secure Checkout</div><div className="text-xs text-white/60">Cards, Bank Transfer, USSD, Mobile Money</div></div>
                  <Shield className="h-5 w-5 text-green-400 ml-auto" />
                </div>

                <div className="space-y-3 text-[13px]">
                  {[
                    'Debit/Credit Cards (Visa, Mastercard, Verve)',
                    'Bank Transfer',
                    'USSD',
                    'Mobile Money & More'
                  ].map(m => (
                    <div key={m} className="flex items-center gap-2 text-white/70"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> {m}</div>
                  ))}
                </div>

                <button disabled={paying} onClick={handlePay} className="w-full btn-primary !py-4 !text-[15px] gap-2 disabled:opacity-60">
                  {paying ? 'PROCESSING...' : `PAY ${formatNaira(course.price)}`} <Zap className="h-4 w-4" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-white/40">
                  <Shield className="h-3.5 w-3.5" /> Secured by Paystack • No card details stored
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="glass rounded-xl p-3"><div className="font-bold">256-bit</div><div className="text-white/40">SSL Encryption</div></div>
                  <div className="glass rounded-xl p-3"><div className="font-bold">Instant</div><div className="text-white/40">Access</div></div>
                  <div className="glass rounded-xl p-3"><div className="font-bold">₦5k</div><div className="text-white/40">One-time</div></div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 text-sm">
              <div className="font-bold mb-2">What happens after payment?</div>
              <ul className="space-y-2 text-white/60 text-[13px] list-disc pl-4">
                <li>Immediate access to all lessons</li>
                <li>Course added to your dashboard</li>
                <li>Certificate upon completion</li>
                <li>WhatsApp community invite</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
