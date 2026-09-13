import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Shield, Copy, CheckCircle2, Upload, AlertTriangle, ArrowLeft, FileText, Package, Loader2 } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useLMS } from '../context/LMSContext';
import { useAuth } from '../context/AuthContext';
import { formatNaira } from '../lib/utils';
import { toast, Toaster } from 'sonner';
import PaymentFlow from '../components/payment/PaymentFlow';

export default function BundleEnroll() {
  const { id } = useParams();
  const { getCourseById, submitManualPayment, isEnrolled, getUserManualPayments } = useCourses();
  const { getBundleById, siteSettings } = useLMS();
  const { user } = useAuth();

  const bundle = getBundleById(id);

  const [form, setForm] = useState({
    studentName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    amount: String(bundle?.price ?? ''),
    transactionDate: new Date().toISOString().split('T')[0],
    reference: '',
    note: ''
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | uploading | submitting
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!bundle || bundle.published === false) return <div className="p-20 text-center">Bundle not found</div>;
  if (!user) return <div className="p-20 text-center"><Link to="/login" className="btn-primary">LOGIN TO CONTINUE</Link></div>;

  const submitting = phase !== 'idle';

  const bank = {
    bankName: siteSettings?.bankName || 'MONIEPOINT',
    accountNumber: siteSettings?.accountNumber || '69852663361',
    accountName: siteSettings?.accountName || 'LUNA ENTRY SERVICES',
  };
  const bundleCourses = (bundle.courseIds || []).map((cid) => getCourseById(cid)).filter(Boolean);
  const alreadyAll = bundleCourses.length > 0 && bundleCourses.every((c) => isEnrolled(user.id, c.id));

  const handleCopy = () => {
    navigator.clipboard.writeText(bank.accountNumber);
    setCopied(true);
    toast.success('Account number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) { toast.error('Only JPG, PNG, PDF allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB allowed'); return; }
    setReceiptFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!receiptFile) { toast.error('Please upload payment receipt'); return; }
    if (!form.reference.trim()) { toast.error('Transaction reference is required'); return; }
    const amountPaid = Math.round(Number(form.amount));
    if (!Number.isFinite(amountPaid) || amountPaid <= 0) { toast.error('Enter the amount you transferred'); return; }
    if (amountPaid !== bundle.price) {
      toast.error(`The amount must be exactly ${formatNaira(bundle.price)} — the bundle price shown above.`);
      return;
    }
    setPhase('uploading');
    setProgress(3);
    try {
      const payment = await submitManualPayment({
        userId: user.id,
        courseId: null,
        studentName: form.studentName, email: form.email, phone: form.phone,
        amount: amountPaid,
        transactionDate: form.transactionDate,
        reference: form.reference,
        note: form.note,
        receiptFile,
        bundleId: bundle.id, bundleCourseIds: bundle.courseIds,
        onUploadProgress: (p) => setProgress(Math.max(3, Math.min(96, p))),
      });
      setPhase('submitting');
      setProgress(100);
      setSuccess(payment);
      toast.success('Payment submitted successfully.');
    } catch (err) {
      toast.error(err?.message || 'Payment submission failed. Please try again.');
    } finally {
      setPhase('idle');
    }
  };

  const existingBundlePayment = getUserManualPayments(user.id).find((p) => p.bundleId === bundle.id && (p.status === 'pending' || p.status === 'approved'));
  if (existingBundlePayment?.status === 'approved' || alreadyAll) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-[480px] glass-strong rounded-[24px] p-8 text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto"><CheckCircle2 className="h-10 w-10 text-green-400" /></div>
          <h1 className="font-display font-black text-2xl">You Own This Bundle ✅</h1>
          <p className="text-white/60">You're enrolled in all {bundleCourses.length} courses.</p>
          <Link to="/my-courses" className="inline-flex w-full h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 items-center justify-center font-bold">GO TO MY COURSES</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-12">
        <Toaster richColors />
        <div className="mx-auto max-w-[640px] px-4">
          <div className="glass-strong rounded-[24px] p-8 md:p-10 text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto"><FileText className="h-10 w-10 text-amber-400" /></div>
            <h1 className="font-display font-black text-2xl md:text-3xl">Payment submitted successfully.</h1>
            <p className="text-white/70">Your bundle payment is <span className="text-amber-300 font-bold">PENDING</span> manual verification. Access to all {bundleCourses.length} courses unlocks only after an administrator approves it.</p>
            <PaymentFlow status="pending" className="justify-center" />
            <div className="glass rounded-2xl p-6 text-left space-y-3">
              <div className="flex justify-between text-sm"><span className="text-white/50">Bundle</span><span className="font-bold">{bundle.title}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/50">Amount</span><span className="font-bold text-green-300">{formatNaira(success.amount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/50">Reference</span><span className="font-mono font-bold">{success.reference}</span></div>
              <div className="flex justify-between text-sm items-center"><span className="text-white/50">Status</span><span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">PENDING</span></div>
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
        <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6"><ArrowLeft className="h-4 w-4" /> Back to courses</Link>
        {existingBundlePayment?.status === 'pending' && (
          <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-bold text-amber-300">Pending Bundle Payment</div>
              <div className="text-white/60 mt-1">You already submitted payment for this bundle (Ref: {existingBundlePayment.reference}). Please wait for admin review.</div>
              <Link to="/my-payments" className="inline-flex mt-2 text-xs font-bold text-amber-300">View in My Payments →</Link>
            </div>
          </div>
        )}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
          <div className="space-y-6">
            <div className="glass-strong rounded-[24px] p-8">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-amber-300"><Package className="h-4 w-4" /> COURSE BUNDLE</div>
              <h1 className="font-display font-black text-2xl md:text-3xl mt-2">{bundle.title}</h1>
              <p className="text-sm text-white/60 mt-2">{bundle.description}</p>
              <div className="flex items-baseline gap-3 mt-4">
                <div className="font-black text-[36px]">{formatNaira(bundle.price)}</div>
                <div className="text-sm line-through text-white/40">{formatNaira(bundle.originalPrice || bundle.price)}</div>
                <div className="ml-auto px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold">SAVE {formatNaira((bundle.originalPrice || bundle.price) - bundle.price)}</div>
              </div>
              <div className="mt-5 space-y-2">
                <div className="text-xs font-bold text-white/40">INCLUDED COURSES ({bundleCourses.length})</div>
                {bundleCourses.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/10 p-3 text-sm">
                    <span className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="font-bold truncate">{c.title}</span>
                    {isEnrolled(user.id, c.id) && <span className="ml-auto text-[10px] font-bold text-green-300 shrink-0">✓ OWNED</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-[24px] p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Shield className="h-5 w-5 text-cyan-300" /> Step 1: Transfer {formatNaira(bundle.price)}</h3>
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 space-y-3">
                <div><div className="text-[11px] tracking-widest text-white/40 font-bold">BANK NAME</div><div className="font-black text-lg mt-1">{bank.bankName}</div></div>
                <div className="rounded-xl bg-white text-black p-4 flex items-center justify-between gap-3">
                  <div><div className="text-[11px] tracking-widest text-black/40 font-bold">ACCOUNT NUMBER</div><div className="font-mono font-black text-2xl tracking-wider mt-1">{bank.accountNumber}</div></div>
                  <button onClick={handleCopy} className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center shrink-0">{copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}</button>
                </div>
                <div><div className="text-[11px] tracking-widest text-white/40 font-bold">ACCOUNT NAME</div><div className="font-bold mt-1">{bank.accountName}</div></div>
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-[24px] p-8 h-fit">
            <h3 className="font-bold text-lg flex items-center gap-2"><Upload className="h-5 w-5 text-cyan-300" /> Step 2: Upload Receipt</h3>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} placeholder="Full name" required className="w-full h-12 rounded-full glass px-5 text-sm" />
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" required type="email" className="h-12 rounded-full glass px-5 text-sm" />
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" required className="h-12 rounded-full glass px-5 text-sm" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder={`Amount paid (${bundle.price})`} type="number" min="1" required className="w-full h-12 rounded-full glass px-5 text-sm font-bold" />
                  <div className="text-[10px] text-white/30 mt-1">Must match the exact bundle amount: {formatNaira(bundle.price)}</div>
                </div>
                <input value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} type="date" max={new Date().toISOString().split('T')[0]} required className="h-12 rounded-full glass px-5 text-sm" />
              </div>
              <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Payment / transaction reference" required className="w-full h-12 rounded-full glass px-5 text-sm font-mono" />
              <div>
                <label className="text-xs font-bold text-white/40">PAYMENT RECEIPT (JPG/JPEG/PNG/PDF, max 5MB)</label>
                <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="mt-1 w-full h-[52px] rounded-2xl glass px-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-black file:font-bold file:text-xs" />
                {receiptFile && <div className="text-xs text-green-300 mt-1">✓ {receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} KB)</div>}
              </div>
              <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value.slice(0, 500) })} placeholder="Note (optional) — e.g. paid from a different account name" rows={2} className="w-full rounded-2xl glass p-4 text-sm focus:outline-none resize-none" />
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-white/60 flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                Transfer the exact bundle amount, then upload your receipt. All {bundleCourses.length} courses unlock only after admin approval — access stays locked while your payment is pending.
              </div>
              {submitting && (
                <div className="rounded-2xl bg-cyan-500/10 border border-cyan-400/30 p-4 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-cyan-200">
                    <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {phase === 'uploading' ? 'Uploading receipt…' : 'Submitting payment for verification…'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <button disabled={submitting || existingBundlePayment?.status === 'pending'} className="w-full btn-primary !py-4 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting
                  ? (phase === 'uploading' ? `UPLOADING RECEIPT… ${progress}%` : 'SUBMITTING PAYMENT…')
                  : existingBundlePayment?.status === 'pending' ? 'WAITING FOR REVIEW OF PENDING PAYMENT' : `SUBMIT BUNDLE PAYMENT (${formatNaira(bundle.price)})`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
