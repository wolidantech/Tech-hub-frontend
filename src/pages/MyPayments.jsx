import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { formatNaira } from '../lib/utils';
import { fetchMyRedemptions } from '../lib/store';
import SignedFile from '../components/common/SignedFile';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Eye, FileText, Download, Calendar, CreditCard, Ticket } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MyPayments() {
  const { user } = useAuth();
  const { getUserManualPayments, getUserPaymentSummary, getCourseById } = useCourses();
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [myRedemptions, setMyRedemptions] = useState([]);

  useEffect(() => {
    if (user) fetchMyRedemptions(user.id).then(setMyRedemptions).catch(() => {});
  }, [user]);

  if (!user) return null;

  const payments = getUserManualPayments(user.id);
  const summary = getUserPaymentSummary(user.id);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved': return { label: 'APPROVED', color: 'bg-green-500/20 border-green-500/30 text-green-300', icon: CheckCircle2 };
      case 'pending': return { label: 'PENDING REVIEW', color: 'bg-amber-500/20 border-amber-500/30 text-amber-300', icon: Clock };
      case 'rejected': return { label: 'REJECTED', color: 'bg-red-500/20 border-red-500/30 text-red-300', icon: XCircle };
      default: return { label: status.toUpperCase(), color: 'glass', icon: AlertTriangle };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-10">
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-black text-[32px] leading-none">My Payments</h1>
            <p className="mt-2 text-white/60">Track your manual bank transfer payments</p>
          </div>
          <Link to="/courses" className="btn-primary !py-2.5 !px-6 text-xs">BROWSE COURSES</Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-[20px] p-5 border border-green-500/20 bg-green-500/5">
            <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold tracking-widest text-white/40">TOTAL PAID</span><CheckCircle2 className="h-4 w-4 text-green-400" /></div>
            <div className="font-black text-xl text-green-300">{formatNaira(summary.totalPaid)}</div>
            <div className="text-[11px] text-white/40 mt-1">{summary.approvedCount} approved</div>
          </div>
          <div className="glass rounded-[20px] p-5 border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold tracking-widest text-white/40">PENDING</span><Clock className="h-4 w-4 text-amber-400" /></div>
            <div className="font-black text-xl text-amber-300">{formatNaira(summary.pendingAmount)}</div>
            <div className="text-[11px] text-white/40 mt-1">{summary.pendingCount} pending review</div>
          </div>
          <div className="glass rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold tracking-widest text-white/40">APPROVED</span><CheckCircle2 className="h-4 w-4 text-cyan-300" /></div>
            <div className="font-black text-xl">{formatNaira(summary.approvedAmount)}</div>
            <div className="text-[11px] text-white/40 mt-1">{summary.approvedCount} payments</div>
          </div>
          <div className="glass rounded-[20px] p-5 border border-red-500/20 bg-red-500/5">
            <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-bold tracking-widest text-white/40">REJECTED</span><XCircle className="h-4 w-4 text-red-400" /></div>
            <div className="font-black text-xl text-red-300">{formatNaira(summary.rejectedAmount)}</div>
            <div className="text-[11px] text-white/40 mt-1">{summary.rejectedCount} rejected</div>
          </div>
        </div>

        {myRedemptions.length > 0 && (
          <div className="space-y-3 mb-8">
            <h2 className="font-bold text-lg flex items-center gap-2"><Ticket className="h-5 w-5 text-cyan-300" /> Coupon Enrollments</h2>
            {myRedemptions.map((r) => {
              const course = getCourseById(r.courseId);
              return (
                <div key={r.id} className="glass rounded-[20px] p-5 flex flex-wrap items-center justify-between gap-4 border border-cyan-500/20 bg-cyan-500/5">
                  <div className="flex gap-4 items-center">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shrink-0"><Ticket className="h-6 w-6" /></div>
                    <div>
                      <div className="font-bold">{course?.title || r.courseId}</div>
                      <div className="text-xs text-white/50 mt-1">Coupon <span className="font-mono text-cyan-300 font-bold">{r.couponCode}</span> • Saved {formatNaira(r.discount)} • {new Date(r.usedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 text-[11px] font-bold">COUPON APPROVED</span>
                    {course && <Link to={`/learn/${course.slug}`} className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs">START LEARNING</Link>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {payments.length === 0 && myRedemptions.length === 0 ? (
          <div className="glass rounded-[24px] p-16 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-white/20 mb-4" />
            <h3 className="font-bold text-lg">No payments yet</h3>
            <p className="text-sm text-white/50 mt-2 max-w-[400px] mx-auto">When you pay via bank transfer and upload receipt, your payments will appear here with status updates</p>
            <Link to="/courses" className="inline-flex mt-6 btn-primary">BROWSE COURSES</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map(payment => {
              const statusConfig = getStatusConfig(payment.status);
              const StatusIcon = statusConfig.icon;
              const course = getCourseById(payment.courseId);
              return (
                <div key={payment.id} className="glass rounded-[20px] p-6 hover:border-white/15 transition">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1 min-w-0">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black shrink-0">
                        {payment.courseName.slice(0,2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold leading-tight">{payment.courseName}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${statusConfig.color}`}>
                            <StatusIcon className="h-3.5 w-3.5" /> {statusConfig.label}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div><span className="text-white/40">Amount:</span><div className="font-bold">{formatNaira(payment.amount)}</div></div>
                          <div><span className="text-white/40">Method:</span><div className="font-bold">{payment.paymentMethod}</div></div>
                          <div><span className="text-white/40">Reference:</span><div className="font-mono font-bold truncate">{payment.reference}</div></div>
                          <div><span className="text-white/40">Date:</span><div className="font-bold flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(payment.submittedAt).toLocaleDateString()}</div></div>
                        </div>

                        {payment.status === 'rejected' && payment.rejectedReason && (
                          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                            <div className="font-bold text-red-300">Rejection Reason:</div>
                            <div className="text-white/60 mt-1">{payment.rejectedReason}</div>
                          </div>
                        )}

                        {payment.status === 'approved' && (
                          <div className="mt-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs">
                            <div className="font-bold text-green-300">✅ Payment Approved</div>
                            <div className="text-white/60 mt-1">Approved by {payment.approvedBy} on {new Date(payment.approvedAt).toLocaleString()}. Course access granted.</div>
                          </div>
                        )}

                        {payment.status === 'pending' && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                            <div className="font-bold text-amber-300">⏳ Pending Review</div>
                            <div className="text-white/60 mt-1">Your payment is being reviewed by admin. You will be notified once approved. Do not submit duplicate payment.</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => setSelectedReceipt(payment)} className="px-4 py-2 rounded-full glass font-bold text-xs flex items-center gap-2 hover:bg-white/10">
                        <Eye className="h-4 w-4" /> VIEW RECEIPT
                      </button>
                      {payment.status === 'approved' && course && (
                        <Link to={`/learn/${course.slug}`} className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center gap-2">
                          START LEARNING
                        </Link>
                      )}
                      {payment.status === 'approved' && !course && payment.bundleId && (
                        <Link to="/my-courses" className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center gap-2">
                          MY COURSES
                        </Link>
                      )}
                      {payment.status === 'rejected' && course && (
                        <Link to={`/enroll/${course.slug}`} className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2">
                          RETRY PAYMENT
                        </Link>
                      )}
                      {payment.status === 'rejected' && !course && payment.bundleId && (
                        <Link to={`/enroll/bundle/${payment.bundleId}`} className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2">
                          RETRY PAYMENT
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <div className="w-full max-w-[600px] max-h-[90vh] overflow-auto glass-strong rounded-[24px] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Payment Receipt</h3>
                <button onClick={() => setSelectedReceipt(null)} className="h-8 w-8 rounded-full glass flex items-center justify-center">✕</button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-white/50">Course</span><span className="font-bold">{selectedReceipt.courseName}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Amount</span><span className="font-bold">{formatNaira(selectedReceipt.amount)}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Reference</span><span className="font-mono font-bold">{selectedReceipt.reference}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Date</span><span className="font-bold">{new Date(selectedReceipt.submittedAt).toLocaleString()}</span></div>
              </div>

              {selectedReceipt.receiptPath ? (
                <SignedFile bucket="receipts" path={selectedReceipt.receiptPath} fileType={selectedReceipt.receiptType} fileName={selectedReceipt.receiptName} />
              ) : (
                <div className="p-8 text-center text-sm text-white/40">
                  <FileText className="h-10 w-10 mx-auto text-white/20 mb-2" />
                  Receipt file unavailable.
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setSelectedReceipt(null)} className="flex-1 h-11 rounded-full glass font-bold text-sm">CLOSE</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
