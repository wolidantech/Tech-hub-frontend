import { useState } from 'react';
import { Plus, X, Trash2, Ticket, Copy } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useLMS } from '../../context/LMSContext';
import { useAuth } from '../../context/AuthContext';
import { generateCouponCode } from '../../lib/ids';
import { formatNaira } from '../../lib/utils';
import { toast } from 'sonner';

export default function CouponManager() {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { coupons, redemptions, createCoupon, updateCoupon, deleteCoupon, couponStats } = useLMS();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ code: '', courseId: 'ALL', discountType: 'percentage', discountValue: 50, maxUses: 1, expiresAt: '', minPurchase: 0, active: true, restrictEmail: '', restrictPhone: '' });

  const handleCreate = async () => {
    try {
      const coupon = await createCoupon({
        code: form.code || generateCouponCode(),
        courseId: form.courseId,
        discountType: form.discountType,
        discountValue: form.discountType === 'free' ? 100 : Number(form.discountValue),
        maxUses: form.maxUses === '' ? null : Number(form.maxUses),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        minPurchase: Number(form.minPurchase),
        active: form.active,
        restrictedTo: { ...(form.restrictEmail ? { email: form.restrictEmail } : {}), ...(form.restrictPhone ? { phone: form.restrictPhone } : {}) },
        actor: user,
      });
      toast.success(`Coupon ${coupon.code} created 🎟️`);
      setShowAdd(false);
      setForm({ code: '', courseId: 'ALL', discountType: 'percentage', discountValue: 50, maxUses: 1, expiresAt: '', minPurchase: 0, active: true, restrictEmail: '', restrictPhone: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const discountLabel = (c) => {
    if (c.discountType === 'free') return '100% FREE';
    if (c.discountType === 'percentage') return `${c.discountValue}% OFF`;
    return `${formatNaira(c.discountValue)} OFF`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="font-bold text-xl flex items-center gap-2"><Ticket className="h-5 w-5 text-cyan-300" /> Coupons ({coupons.length})</h2>
          <p className="text-sm text-white/50 mt-1">{couponStats.active} active • {couponStats.redemptions} redemptions ({couponStats.freeRedemptions} free) • Validated server-side equivalent on redeem</p>
        </div>
        <button onClick={() => { setForm({ ...form, code: generateCouponCode() }); setShowAdd(true); }} className="btn-primary !py-2.5 !px-5 text-xs gap-2"><Plus className="h-4 w-4" /> CREATE COUPON</button>
      </div>

      {showAdd && (
        <div className="glass-strong rounded-[20px] p-6 space-y-4">
          <div className="flex justify-between"><h3 className="font-bold">Create Coupon</h3><button onClick={() => setShowAdd(false)}><X className="h-5 w-5" /></button></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex gap-2">
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Coupon code" className="flex-1 h-11 rounded-full glass px-4 text-sm font-mono" />
              <button onClick={() => setForm({ ...form, code: generateCouponCode() })} className="h-11 px-4 rounded-full glass text-xs font-bold">RANDOM</button>
            </div>
            <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="h-11 rounded-full glass px-4 text-sm">
              <option className="bg-[#061236]" value="ALL">All courses</option>
              {courses.map((c) => <option className="bg-[#061236]" key={c.id} value={c.id}>{c.title.slice(0, 40)}</option>)}
            </select>
            <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="h-11 rounded-full glass px-4 text-sm">
              <option className="bg-[#061236]" value="percentage">Percentage %</option>
              <option className="bg-[#061236]" value="fixed">Fixed Amount ₦</option>
              <option className="bg-[#061236]" value="free">100% FREE</option>
            </select>
            {form.discountType !== 'free' && (
              <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === 'percentage' ? 'e.g. 50' : 'e.g. 2500'} className="h-11 rounded-full glass px-4 text-sm" />
            )}
            <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Max uses (blank = unlimited)" className="h-11 rounded-full glass px-4 text-sm" />
            <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="h-11 rounded-full glass px-4 text-sm" />
            <input type="number" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} placeholder="Minimum purchase ₦ (0 = none)" className="h-11 rounded-full glass px-4 text-sm" />
            <label className="flex items-center gap-2 text-sm px-2"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4" /> Active</label>
          </div>
          <div className="rounded-2xl border border-dashed border-amber-400/30 bg-amber-500/5 p-4">
            <div className="font-bold text-sm mb-2">Restrict to a specific student (optional — for financial assistance)</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={form.restrictEmail} onChange={(e) => setForm({ ...form, restrictEmail: e.target.value })} placeholder="Student email (optional)" className="h-11 rounded-full glass px-4 text-sm" />
              <input value={form.restrictPhone} onChange={(e) => setForm({ ...form, restrictPhone: e.target.value })} placeholder="Student phone (optional)" className="h-11 rounded-full glass px-4 text-sm" />
            </div>
            <div className="text-[11px] text-white/40 mt-2">A restricted coupon will NOT work for any other student.</div>
          </div>
          <button onClick={handleCreate} className="btn-primary w-full">CREATE COUPON</button>
        </div>
      )}

      <div className="glass rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-white/[0.03] text-[11px] tracking-widest text-white/40">
              <tr><th className="text-left p-4">Code</th><th className="text-left p-4">Course</th><th className="text-left p-4">Discount</th><th className="text-left p-4">Uses</th><th className="text-left p-4">Expires</th><th className="text-left p-4">Restricted</th><th className="text-left p-4">Status</th><th className="text-left p-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coupons.map((c) => {
                const course = courses.find((x) => x.id === c.courseId);
                const used = redemptions.filter((r) => r.couponId === c.id).length;
                const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                return (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="p-4">
                      <span className="font-mono font-bold text-cyan-300">{c.code}</span>
                      <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Copied!'); }} className="ml-2 text-white/30 hover:text-white"><Copy className="h-3.5 w-3.5 inline" /></button>
                    </td>
                    <td className="p-4 text-xs max-w-[160px] truncate">{c.courseId === 'ALL' ? 'All courses' : course?.title || c.courseId}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-[11px] font-bold ${c.discountType === 'free' ? 'bg-green-500/20 text-green-300' : 'bg-cyan-500/20 text-cyan-300'}`}>{discountLabel(c)}</span></td>
                    <td className="p-4 text-xs font-bold">{used}{c.maxUses != null ? ` / ${c.maxUses}` : ' / ∞'}</td>
                    <td className="p-4 text-xs text-white/50">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}{expired && <span className="text-red-300 font-bold"> (expired)</span>}</td>
                    <td className="p-4 text-[11px] text-white/50 font-mono">{c.restrictedTo?.email || c.restrictedTo?.phone || c.restrictedTo?.userId ? `${c.restrictedTo.email || ''} ${c.restrictedTo.phone || ''}`.trim() : '—'}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-[11px] font-bold ${c.active && !expired ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/40'}`}>{c.active && !expired ? 'ACTIVE' : 'INACTIVE'}</span></td>
                    <td className="p-4">
                      <div className="flex gap-1.5">
                        <button onClick={async () => { try { await updateCoupon(c.id, { active: !c.active }, user); toast.success(c.active ? 'Disabled' : 'Enabled'); } catch (err) { toast.error(err.message); } }} className="h-8 px-3 rounded-full glass text-[11px] font-bold">{c.active ? 'DISABLE' : 'ENABLE'}</button>
                        <button onClick={async () => { if (confirm(`Delete coupon ${c.code}?`)) { try { await deleteCoupon(c.id, user); toast.success('Deleted'); } catch (err) { toast.error(err.message); } } }} className="h-8 w-8 rounded-full glass flex items-center justify-center text-red-300"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {coupons.length === 0 && <div className="p-12 text-center text-white/40 text-sm">No coupons yet. Create one for a course — e.g. a 100% FREE coupon for a student in need.</div>}
        </div>
      </div>

      {redemptions.length > 0 && (
        <div className="glass rounded-[20px] p-6">
          <h3 className="font-bold mb-4">Redemption History ({redemptions.length})</h3>
          <div className="space-y-2 max-h-[260px] overflow-auto">
            {redemptions.map((r) => (
              <div key={r.id} className="flex flex-wrap justify-between gap-2 text-xs p-3 rounded-xl bg-white/[0.03]">
                <span className="font-mono font-bold text-cyan-300">{r.couponCode}</span>
                <span className="text-white/50">User {r.userId.slice(0, 8)} • Course {r.courseId.slice(0, 18)}</span>
                <span className="text-green-300 font-bold">saved {formatNaira(r.discount)} • due {formatNaira(r.amountDue)}</span>
                <span className="text-white/30">{new Date(r.usedAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
