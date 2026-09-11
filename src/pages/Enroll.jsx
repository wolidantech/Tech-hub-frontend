import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Shield, Copy, CheckCircle2, Upload, AlertTriangle, ArrowLeft, FileText, Calendar, CreditCard, Phone } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { formatNaira, formatDate } from '../lib/utils';
import { BANK_DETAILS } from '../lib/storage';
import { toast, Toaster } from 'sonner';

export default function Enroll() {
  const { slug } = useParams();
  const { getCourseBySlug, submitManualPayment, getManualPaymentByCourse, getUserManualPayments } = useCourses();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    studentName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    amount: '',
    transactionDate: new Date().toISOString().split('T')[0],
    reference: ''
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  const course = getCourseBySlug(slug);
  if (!course) return <div className="p-20 text-center">Course not found</div>;
  if (!user) {
    navigate('/login');
    return null;
  }

  const existingPayment = getManualPaymentByCourse(user.id, course.id);
  const userPayments = getUserManualPayments(user.id);

  // If already approved, redirect to learn
  if (existingPayment?.status === 'approved') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-[480px] glass-strong rounded-[24px] p-8 text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto"><CheckCircle2 className="h-10 w-10 text-green-400" /></div>
          <div>
            <h1 className="font-display font-black text-2xl">Already Enrolled ✅</h1>
            <p className="mt-2 text-white/60">You already have approved access to <span className="text-white font-bold">{course.title}</span></p>
          </div>
          <Link to={`/learn/${course.slug}`} className="inline-flex w-full h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 items-center justify-center font-bold">START LEARNING</Link>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    toast.success('Account number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, JPEG, PNG, PDF allowed');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB allowed');
      return;
    }

    setReceiptFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setReceiptPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!receiptFile) {
      toast.error('Please upload payment receipt');
      return;
    }

    if (!form.reference.trim()) {
      toast.error('Transaction reference is required');
      return;
    }

    setSubmitting(true);

    try {
      // Convert file to base64 for storage (secure, only admin and owner can view)
      const receiptData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(receiptFile);
      });

      const payment = submitManualPayment({
        userId: user.id,
        courseId: course.id,
        studentName: form.studentName,
        email: form.email,
        phone: form.phone,
        amount: form.amount || course.price,
        transactionDate: form.transactionDate,
        reference: form.reference,
        receiptData,
        receiptName: receiptFile.name,
        receiptType: receiptFile.type,
        receiptSize: receiptFile.size
      });

      setSuccess(payment);
      toast.success('Payment submitted successfully! Pending review.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-12">
        <Toaster richColors />
        <div className="mx-auto max-w-[640px] px-4">
          <div className="glass-strong rounded-[24px] p-8 md:p-10 text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto"><FileText className="h-10 w-10 text-amber-400" /></div>
            <div>
              <h1 className="font-display font-black text-2xl md:text-3xl">Payment Submitted Successfully! 🎉</h1>
              <p className="mt-3 text-white/70 leading-relaxed">Your payment is currently being reviewed by WOLI DAN TECH HUB. You will be notified once approved.</p>
            </div>

            <div className="glass rounded-2xl p-6 text-left space-y-3">
              <div className="flex justify-between text-sm"><span className="text-white/50">Course</span><span className="font-bold">{course.title}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/50">Amount</span><span className="font-bold text-green-300">{formatNaira(success.amount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/50">Reference</span><span className="font-mono font-bold">{success.reference}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/50">Status</span><span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">PENDING REVIEW</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/50">Submitted</span><span className="font-bold">{new Date(success.submittedAt).toLocaleString()}</span></div>
            </div>

            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-left">
              <div className="font-bold text-amber-300 text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Important</div>
              <ul className="mt-2 text-xs text-white/60 space-y-1 list-disc pl-5">
                <li>Do NOT submit another payment for this course while pending</li>
                <li>Course access will be granted only after admin approval</li>
                <li>You will receive notification when approved</li>
                <li>Check My Payments for status updates</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link to="/my-payments" className="h-12 rounded-full glass flex items-center justify-center font-bold text-sm">MY PAYMENTS</Link>
              <Link to="/dashboard" className="h-12 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm">DASHBOARD</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-8">
      <Toaster richColors />
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
        <Link to={`/course/${slug}`} className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6"><ArrowLeft className="h-4 w-4" /> Back to course</Link>

        {existingPayment?.status === 'pending' && (
          <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-bold text-amber-300">Pending Payment Exists</div>
              <div className="text-white/60 mt-1">You already have a pending payment for this course (Ref: {existingPayment.reference}) submitted on {new Date(existingPayment.submittedAt).toLocaleDateString()}. Please wait for admin review.</div>
              <Link to="/my-payments" className="inline-flex mt-2 text-xs font-bold text-amber-300 hover:text-amber-200">View in My Payments →</Link>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
          {/* Left - Course & Bank Details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display font-black text-[28px] leading-none">Manual Bank Transfer</h1>
              <p className="mt-2 text-white/60 text-sm">Transfer the exact amount and upload receipt for verification</p>
            </div>

            <div className="glass rounded-[24px] p-6 space-y-5">
              <h3 className="font-bold flex items-center gap-2"><CreditCard className="h-5 w-5 text-cyan-300" /> Order Summary</h3>
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black shrink-0">{course.title.slice(0,2)}</div>
                <div>
                  <div className="font-bold leading-tight">{course.title}</div>
                  <div className="text-sm text-white/50 mt-1">{course.category} • {course.duration}</div>
                  <div className="mt-2 font-black text-xl text-gradient">{formatNaira(course.price)}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-indigo-700/20 border border-cyan-500/30 p-[1px]">
              <div className="rounded-[23px] bg-[#0a1a4a]/90 p-6 space-y-5">
                <h3 className="font-bold text-lg flex items-center gap-2">🏦 Bank Transfer Details</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.05] border border-white/10">
                    <div><div className="text-[11px] tracking-widest text-white/40 font-bold">BANK NAME</div><div className="font-black text-lg mt-1">{BANK_DETAILS.bankName}</div></div>
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-sm">M</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white text-black space-y-3">
                    <div className="flex justify-between items-start">
                      <div><div className="text-[11px] tracking-widest text-black/40 font-bold">ACCOUNT NUMBER</div><div className="font-mono font-black text-2xl tracking-wider mt-1">{BANK_DETAILS.accountNumber}</div></div>
                      <button onClick={handleCopy} className="h-10 px-4 rounded-full bg-black text-white font-bold text-xs flex items-center gap-2 hover:bg-black/80 transition">
                        <Copy className="h-4 w-4" /> {copied ? 'COPIED!' : 'COPY'}
                      </button>
                    </div>
                    <div className="pt-3 border-t border-black/10">
                      <div className="text-[11px] tracking-widest text-black/40 font-bold">ACCOUNT NAME</div>
                      <div className="font-bold mt-1 leading-tight">{BANK_DETAILS.accountName}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
                    <div className="font-bold text-amber-300 text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Important Instruction</div>
                    <p className="mt-2 text-sm text-white/70 leading-relaxed">Transfer the <span className="font-black text-white">exact course amount ({formatNaira(course.price)})</span> to the account above, then upload your payment receipt below.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-white/40">
                  <Shield className="h-3.5 w-3.5" /> Secure • Manual verification by admin • No auto approval
                </div>
              </div>
            </div>

            <div className="glass rounded-[24px] p-6">
              <h4 className="font-bold mb-3">How It Works</h4>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Transfer Money', desc: `Send ${formatNaira(course.price)} to ${BANK_DETAILS.accountNumber} (${BANK_DETAILS.bankName})` },
                  { step: '2', title: 'Upload Receipt', desc: 'Fill form and upload JPG, PNG or PDF receipt' },
                  { step: '3', title: 'Wait for Review', desc: 'Admin verifies payment (usually within 2-6 hours)' },
                  { step: '4', title: 'Get Access', desc: 'Once approved, course appears in My Courses' },
                ].map(s => (
                  <div key={s.step} className="flex gap-3">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-xs shrink-0">{s.step}</div>
                    <div><div className="font-bold text-sm">{s.title}</div><div className="text-xs text-white/50">{s.desc}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Payment Form */}
          <div className="space-y-6">
            <div className="glass-strong rounded-[24px] p-6 md:p-8">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2"><Upload className="h-5 w-5 text-cyan-300" /> Submit Payment Receipt</h3>
              <p className="text-sm text-white/50 mb-6">After transfer, fill this form and upload receipt for verification</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-white/40 mb-2 block">STUDENT NAME *</label>
                    <input required value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} placeholder="Full Name" className="w-full h-[48px] rounded-full glass px-5 text-sm focus:outline-none focus:border-cyan-400/50" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-white/40 mb-2 block">PHONE NUMBER *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                      <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0815..." className="w-full h-[48px] rounded-full glass pl-11 pr-5 text-sm focus:outline-none focus:border-cyan-400/50" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold tracking-widest text-white/40 mb-2 block">EMAIL ADDRESS *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="w-full h-[48px] rounded-full glass px-5 text-sm focus:outline-none focus:border-cyan-400/50" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-white/40 mb-2 block">COURSE *</label>
                    <input value={course.title} disabled className="w-full h-[48px] rounded-full glass px-5 text-sm bg-white/[0.03] text-white/60" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-white/40 mb-2 block">AMOUNT PAID (₦) *</label>
                    <input required type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder={String(course.price)} className="w-full h-[48px] rounded-full glass px-5 text-sm focus:outline-none focus:border-cyan-400/50" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-white/40 mb-2 block">TRANSACTION DATE *</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                      <input required type="date" value={form.transactionDate} onChange={e => setForm({ ...form, transactionDate: e.target.value })} className="w-full h-[48px] rounded-full glass pl-11 pr-5 text-sm focus:outline-none focus:border-cyan-400/50" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-widest text-white/40 mb-2 block">TRANSACTION REFERENCE *</label>
                    <input required value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="e.g. TRF-123456789" className="w-full h-[48px] rounded-full glass px-5 text-sm focus:outline-none focus:border-cyan-400/50 font-mono" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold tracking-widest text-white/40 mb-2 block">PAYMENT RECEIPT (JPG, JPEG, PNG, PDF - Max 5MB) *</label>
                  <div className="relative">
                    <input required type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="w-full h-[56px] rounded-2xl glass px-5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-black file:font-bold file:text-xs hover:file:bg-white/90 focus:outline-none focus:border-cyan-400/50" />
                  </div>
                  {receiptFile && (
                    <div className="mt-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                      <FileText className="h-8 w-8 text-green-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{receiptFile.name}</div>
                        <div className="text-xs text-white/50">{(receiptFile.size / 1024).toFixed(1)} KB • {receiptFile.type}</div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    </div>
                  )}
                  {receiptPreview && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 max-h-[200px]">
                      <img src={receiptPreview} alt="Receipt preview" className="w-full h-auto max-h-[200px] object-contain bg-black/20" />
                    </div>
                  )}
                </div>

                <button disabled={submitting || existingPayment?.status === 'pending'} type="submit" className="w-full btn-primary !py-4 !text-[14px] gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'SUBMITTING...' : 'SUBMIT PAYMENT FOR REVIEW'} <Upload className="h-4 w-4" />
                </button>

                <div className="text-[11px] text-white/30 text-center leading-relaxed">
                  By submitting, you confirm that you transferred {formatNaira(course.price)} to {BANK_DETAILS.accountNumber} ({BANK_DETAILS.bankName}) and the receipt is valid. False receipts will be rejected.
                </div>
              </form>
            </div>

            <div className="glass rounded-2xl p-5">
              <h4 className="font-bold text-sm mb-3">Need Help?</h4>
              <p className="text-xs text-white/50 leading-relaxed">If you have issues with transfer or upload, chat with us on WhatsApp for immediate assistance.</p>
              <a href="https://wa.me/2348159610509" target="_blank" className="inline-flex mt-3 px-4 py-2 rounded-full bg-[#25D366] text-white font-bold text-xs">CHAT ON WHATSAPP</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
