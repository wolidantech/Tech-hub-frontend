import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { useLMS } from '../../context/LMSContext';
import { formatNaira } from '../../lib/utils';
import SignedFile from '../../components/common/SignedFile';
import {
  Search, Eye, CheckCircle2, XCircle, Clock, AlertTriangle, Loader2, BadgeCheck, Play,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const fmtDateTime = (v) => (v ? new Date(v).toLocaleString() : '—');

const QUICK_REJECT_REASONS = [
  'Receipt could not be verified. Please upload a valid receipt.',
  'The amount on the receipt does not match the amount due.',
  'Transaction reference is missing or incorrect.',
  'The receipt appears to be altered or unclear.',
  'Duplicate payment submission.',
];

function StatusBadge({ status }) {
  const map = {
    approved: 'bg-green-500/20 border-green-500/30 text-green-300',
    pending: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
    rejected: 'bg-red-500/20 border-red-500/30 text-red-300',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${map[status] || 'glass'}`}>
      {status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
      {status === 'pending' && <Clock className="h-3 w-3" />}
      {status === 'rejected' && <XCircle className="h-3 w-3" />}
      {String(status).toUpperCase()}
    </span>
  );
}

export default function PaymentsManager() {
  const { user } = useAuth();
  const {
    allManualPayments, allEnrollments, stats,
    approveManualPayment, rejectManualPayment, resyncPayments,
  } = useCourses();
  const { audit } = useLMS();

  const [paymentFilter, setPaymentFilter] = useState('all'); // all | pending | approved | rejected
  const [search, setSearch] = useState('');

  // Modals
  const [viewPayment, setViewPayment] = useState(null);      // receipt viewer
  const [approveTarget, setApproveTarget] = useState(null);  // approve confirmation
  const [approveResult, setApproveResult] = useState(null);  // { payment, enrolled } after success
  const [rejectTarget, setRejectTarget] = useState(null);    // reject modal
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTouched, setRejectTouched] = useState(false);
  const [acting, setActing] = useState(false);

  const filtered = allManualPayments.filter((p) => {
    if (paymentFilter !== 'all' && p.status !== paymentFilter) return false;
    if (search && !`${p.studentName} ${p.email} ${p.courseName} ${p.reference}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Backend-confirmed enrollment status for a payment (never assumed client-side).
  const enrollmentState = (p) => {
    const cids = p.bundleId ? (p.bundleCourseIds || []) : [p.courseId].filter(Boolean);
    if (!cids.length) return { active: false, label: '—' };
    const activeCount = cids.filter((cid) =>
      allEnrollments.some((e) => e.userId === p.userId && e.courseId === cid && e.status === 'active')).length;
    if (activeCount === 0) return { active: false, label: 'NOT ACTIVE' };
    if (p.bundleId) return { active: true, label: `ACTIVE (${activeCount}/${cids.length} courses)` };
    return { active: true, label: 'ACTIVE' };
  };

  // ---------------- APPROVE ----------------
  const openApprove = (p) => { setApproveResult(null); setApproveTarget(p); setViewPayment(null); };
  const closeApprove = () => { setApproveTarget(null); setApproveResult(null); };

  const confirmApprove = async () => {
    if (!approveTarget || acting) return;
    setActing(true);
    try {
      const updated = await approveManualPayment(approveTarget.id);
      audit(user, 'payment.approve', 'manual_payment', approveTarget.id, {
        student: approveTarget.studentName, amount: approveTarget.amount,
      });
      const finalPayment = updated || { ...approveTarget, status: 'approved' };
      setApproveResult({ payment: finalPayment, enrolled: enrollmentState(finalPayment).active });
      toast.success(`Payment approved — ${approveTarget.studentName}'s access is now active.`);
    } catch (err) {
      toast.error(err?.message || 'Approval failed. Please try again.');
      // Resync so the table reflects the true server state (e.g. already approved).
      resyncPayments().catch(() => {});
      closeApprove();
    } finally {
      setActing(false);
    }
  };

  // ---------------- REJECT ----------------
  const openReject = (p) => { setRejectTarget(p); setRejectReason(''); setRejectTouched(false); setViewPayment(null); };
  const closeReject = () => { setRejectTarget(null); setRejectReason(''); setRejectTouched(false); };

  const confirmReject = async () => {
    setRejectTouched(true);
    if (!rejectReason.trim()) {
      toast.error('A rejection reason is required.');
      return;
    }
    if (!rejectTarget || acting) return;
    setActing(true);
    try {
      await rejectManualPayment(rejectTarget.id, rejectReason.trim());
      audit(user, 'payment.reject', 'manual_payment', rejectTarget.id, {
        student: rejectTarget.studentName, reason: rejectReason.trim(),
      });
      toast.success('Payment rejected. The student can now see the reason.');
      closeReject();
    } catch (err) {
      toast.error(err?.message || 'Rejection failed. Please try again.');
      resyncPayments().catch(() => {});
      closeReject();
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster richColors />
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="font-bold text-xl">Manual Bank Transfer Payments</h2>
          <p className="text-sm text-white/50 mt-1">Bank: MONIEPOINT • Account: 69852663361 • LUNA ENTRY SERVICES- WOLI DAN TECH HUB</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All', count: allManualPayments.length },
            { id: 'pending', label: 'Pending', count: stats.pendingPayments },
            { id: 'approved', label: 'Approved', count: stats.approvedPayments },
            { id: 'rejected', label: 'Rejected', count: stats.rejectedPayments },
          ].map((f) => (
            <button key={f.id} onClick={() => setPaymentFilter(f.id)} className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 ${paymentFilter === f.id ? 'bg-white text-black' : 'glass text-white/60 hover:text-white'}`}>
              {f.label} <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${paymentFilter === f.id ? 'bg-black text-white' : 'bg-white/10'}`}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-green-500/20 bg-green-500/5"><div className="text-[11px] text-white/40 font-bold">TOTAL REVENUE (Approved Only)</div><div className="font-black text-xl text-green-300 mt-1">{formatNaira(stats.totalRevenue)}</div></div>
        <div className="glass rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5"><div className="text-[11px] text-white/40 font-bold">PENDING AMOUNT</div><div className="font-black text-xl text-amber-300 mt-1">{formatNaira(stats.pendingAmount)}</div></div>
        <div className="glass rounded-2xl p-4"><div className="text-[11px] text-white/40 font-bold">APPROVED</div><div className="font-black text-xl mt-1">{formatNaira(stats.approvedRevenue)} • {stats.approvedPayments} payments</div></div>
        <div className="glass rounded-2xl p-4 border border-red-500/20 bg-red-500/5"><div className="text-[11px] text-white/40 font-bold">REJECTED</div><div className="font-black text-xl text-red-300 mt-1">{stats.rejectedPayments} payments</div></div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-[360px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student, email, course, reference..." className="h-10 w-full rounded-full glass pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-400/40" />
        </div>
      </div>

      <div className="glass rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead className="bg-white/[0.03] text-[11px] tracking-widest text-white/40">
              <tr>
                <th className="text-left p-4">Student</th>
                <th className="text-left p-4">Course</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Payment Date</th>
                <th className="text-left p-4">Reference</th>
                <th className="text-left p-4">Receipt</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Submitted Date</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] align-top">
                  <td className="p-4">
                    <div className="font-bold">{p.studentName}</div>
                    <div className="text-xs text-white/40">{p.email}</div>
                    <div className="text-xs text-white/40">{p.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold max-w-[180px]">{p.courseName}</div>
                    {p.couponCode && <div className="text-xs text-cyan-300 mt-0.5">Coupon {p.couponCode}</div>}
                    {p.note && <div className="text-[11px] text-white/40 mt-1 italic max-w-[180px]">📝 {p.note}</div>}
                  </td>
                  <td className="p-4 font-bold text-green-300 whitespace-nowrap">{formatNaira(p.amount)}</td>
                  <td className="p-4 text-xs text-white/60 whitespace-nowrap">{p.transactionDate ? new Date(p.transactionDate).toLocaleDateString() : '—'}</td>
                  <td className="p-4 font-mono text-xs">{p.reference}</td>
                  <td className="p-4">
                    <button onClick={() => setViewPayment(p)} className="h-8 px-3 rounded-full glass text-xs font-bold flex items-center gap-1 hover:bg-white/10 whitespace-nowrap">
                      <Eye className="h-3.5 w-3.5" /> VIEW RECEIPT
                    </button>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={p.status} />
                    {p.status === 'approved' && (
                      <div className="mt-1.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${enrollmentState(p).active ? 'bg-green-500/15 border-green-500/30 text-green-300' : 'bg-white/5 border-white/10 text-white/40'}`}>
                          ACCESS: {enrollmentState(p).label}
                        </span>
                        <div className="text-[10px] text-green-300/70 mt-1">By {p.approvedBy}</div>
                      </div>
                    )}
                    {p.status === 'rejected' && (
                      <>
                        {p.rejectedReason && <div className="text-[10px] text-red-300/80 mt-1.5 max-w-[160px]">{p.rejectedReason}</div>}
                        {p.rejectedBy && <div className="text-[10px] text-white/30 mt-0.5">By {p.rejectedBy}</div>}
                      </>
                    )}
                  </td>
                  <td className="p-4 text-xs text-white/50 whitespace-nowrap">{fmtDateTime(p.submittedAt)}</td>
                  <td className="p-4">
                    {p.status === 'pending' ? (
                      <div className="flex gap-1.5 flex-wrap">
                        <button onClick={() => openApprove(p)} className="h-8 px-3 rounded-full bg-green-500 text-white text-xs font-bold flex items-center gap-1 hover:bg-green-600 whitespace-nowrap">
                          <CheckCircle2 className="h-3.5 w-3.5" /> APPROVE
                        </button>
                        <button onClick={() => openReject(p)} className="h-8 px-3 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1 hover:bg-red-500/30 whitespace-nowrap">
                          <XCircle className="h-3.5 w-3.5" /> REJECT
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-white/30">Decided — view receipt only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-white/40 text-sm">No payments found{paymentFilter !== 'all' ? ` for filter: ${paymentFilter}` : ''}{search ? ` matching “${search}”` : ''}.</div>
          )}
        </div>
      </div>

      {/* ============ RECEIPT VIEWER MODAL ============ */}
      {viewPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-[700px] max-h-[90vh] overflow-auto glass-strong rounded-[24px] p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-lg flex items-center gap-2"><Eye className="h-5 w-5 text-cyan-300" /> Receipt — Secure View (Admin)</h3>
              <button onClick={() => setViewPayment(null)} className="h-8 w-8 rounded-full glass flex items-center justify-center shrink-0">✕</button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm glass rounded-2xl p-4">
              <div><span className="text-white/40 text-xs">Student:</span><div className="font-bold">{viewPayment.studentName} • {viewPayment.email}</div></div>
              <div><span className="text-white/40 text-xs">Course:</span><div className="font-bold">{viewPayment.courseName}</div></div>
              <div><span className="text-white/40 text-xs">Amount:</span><div className="font-bold text-green-300">{formatNaira(viewPayment.amount)}</div></div>
              <div><span className="text-white/40 text-xs">Reference:</span><div className="font-mono font-bold">{viewPayment.reference}</div></div>
              <div><span className="text-white/40 text-xs">Payment Date:</span><div className="font-bold">{viewPayment.transactionDate ? new Date(viewPayment.transactionDate).toLocaleDateString() : '—'}</div></div>
              <div><span className="text-white/40 text-xs">Submitted:</span><div className="font-bold">{fmtDateTime(viewPayment.submittedAt)}</div></div>
              {viewPayment.note && <div className="sm:col-span-2"><span className="text-white/40 text-xs">Student note:</span><div className="italic text-white/70">{viewPayment.note}</div></div>}
              <div className="sm:col-span-2"><span className="text-white/40 text-xs">Status:</span> <StatusBadge status={viewPayment.status} /></div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30 p-4">
              {viewPayment.receiptPath ? (
                <SignedFile bucket="receipts" path={viewPayment.receiptPath} fileName={viewPayment.receiptName} fileType={viewPayment.receiptType} />
              ) : (
                <div className="p-8 text-center text-sm text-white/40">Receipt file unavailable.</div>
              )}
            </div>

            {viewPayment.status === 'pending' && (
              <div className="flex gap-3">
                <button onClick={() => openApprove(viewPayment)} className="flex-1 h-12 rounded-full bg-green-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-green-600">
                  <CheckCircle2 className="h-5 w-5" /> APPROVE PAYMENT
                </button>
                <button onClick={() => openReject(viewPayment)} className="flex-1 h-12 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 font-bold flex items-center justify-center gap-2 hover:bg-red-500/30">
                  <XCircle className="h-5 w-5" /> REJECT
                </button>
              </div>
            )}

            <button onClick={() => setViewPayment(null)} className="w-full h-11 rounded-full glass font-bold">CLOSE</button>
          </div>
        </div>
      )}

      {/* ============ APPROVAL CONFIRMATION MODAL ============ */}
      {approveTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-[480px] glass-strong rounded-[24px] p-6 space-y-5">
            {!approveResult ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0"><BadgeCheck className="h-5 w-5 text-green-400" /></div>
                  <div><h3 className="font-bold">Approve this payment?</h3><p className="text-xs text-white/50">This grants course access immediately and notifies the student.</p></div>
                </div>

                <div className="glass rounded-2xl p-4 space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-white/50">Student</span><span className="font-bold">{approveTarget.studentName}</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Course</span><span className="font-bold text-right max-w-[240px]">{approveTarget.courseName}</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Amount</span><span className="font-black text-green-300">{formatNaira(approveTarget.amount)}</span></div>
                  <div className="flex justify-between"><span className="text-white/50">Reference</span><span className="font-mono font-bold">{approveTarget.reference}</span></div>
                </div>

                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-white/60 flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  Confirm you have verified the receipt against the bank statement. Approval cannot be undone from this screen.
                </div>

                <div className="flex gap-3">
                  <button onClick={closeApprove} disabled={acting} className="flex-1 h-11 rounded-full glass font-bold disabled:opacity-50">CANCEL</button>
                  <button onClick={confirmApprove} disabled={acting} className="flex-1 h-11 rounded-full bg-green-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-60">
                    {acting ? <><Loader2 className="h-4 w-4 animate-spin" /> APPROVING…</> : <><CheckCircle2 className="h-4 w-4" /> APPROVE PAYMENT</>}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto"><CheckCircle2 className="h-8 w-8 text-green-400" /></div>
                  <h3 className="font-bold text-lg">Payment Approved</h3>
                  <div className="flex justify-center"><StatusBadge status="approved" /></div>
                  <div className="glass rounded-2xl p-4 text-sm space-y-2 text-left">
                    <div className="flex justify-between"><span className="text-white/50">Student</span><span className="font-bold">{approveResult.payment.studentName}</span></div>
                    <div className="flex justify-between"><span className="text-white/50">Course</span><span className="font-bold text-right max-w-[240px]">{approveResult.payment.courseName}</span></div>
                    <div className="flex justify-between items-center"><span className="text-white/50">Enrollment / Access</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${enrollmentState(approveResult.payment).active ? 'bg-green-500/15 border-green-500/30 text-green-300' : 'bg-amber-500/15 border-amber-500/30 text-amber-300'}`}>
                        {enrollmentState(approveResult.payment).active ? `ACCESS ${enrollmentState(approveResult.payment).label}` : 'SYNCING…'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-white/50">The student has been notified and their dashboard now shows this payment as approved.</p>
                </div>
                <button onClick={closeApprove} className="w-full h-11 rounded-full bg-white text-black font-bold flex items-center justify-center gap-2"><Play className="h-4 w-4" /> DONE</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============ REJECTION MODAL ============ */}
      {rejectTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-[520px] max-h-[92vh] overflow-auto glass-strong rounded-[24px] p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0"><XCircle className="h-5 w-5 text-red-400" /></div>
              <div><h3 className="font-bold">Reject this payment?</h3><p className="text-xs text-white/50">{rejectTarget.studentName} • {rejectTarget.courseName} • {formatNaira(rejectTarget.amount)}</p></div>
            </div>

            <div className="glass rounded-2xl p-4 space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-white/50">Reference</span><span className="font-mono font-bold">{rejectTarget.reference}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Submitted</span><span className="font-bold">{fmtDateTime(rejectTarget.submittedAt)}</span></div>
            </div>

            <div>
              <label className="text-xs font-bold tracking-widest text-white/40 mb-2 block">REJECTION REASON * (shown to the student)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_REJECT_REASONS.map((r) => (
                  <button key={r} onClick={() => { setRejectReason(r); setRejectTouched(true); }} className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition ${rejectReason === r ? 'bg-red-500/25 border-red-400/60 text-red-100' : 'glass border-white/10 text-white/60 hover:text-white'}`}>
                    {r.length > 44 ? `${r.slice(0, 44)}…` : r}
                  </button>
                ))}
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => { setRejectReason(e.target.value); setRejectTouched(true); }}
                placeholder="e.g. Receipt could not be verified. Please upload a valid receipt."
                rows={3}
                maxLength={500}
                className={`w-full rounded-2xl glass p-4 text-sm focus:outline-none resize-none ${rejectTouched && !rejectReason.trim() ? 'border-red-400/60' : 'focus:border-red-400/50'}`}
              />
              {rejectTouched && !rejectReason.trim() && (
                <div className="mt-1.5 text-xs text-red-300 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> A rejection reason is required — payments cannot be rejected without one.</div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={closeReject} disabled={acting} className="flex-1 h-11 rounded-full glass font-bold disabled:opacity-50">CANCEL</button>
              <button onClick={confirmReject} disabled={acting || !rejectReason.trim()} className="flex-1 h-11 rounded-full bg-red-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed">
                {acting ? <><Loader2 className="h-4 w-4 animate-spin" /> REJECTING…</> : <><XCircle className="h-4 w-4" /> REJECT PAYMENT</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
