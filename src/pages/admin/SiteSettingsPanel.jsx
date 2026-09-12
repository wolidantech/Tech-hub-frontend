import { useState, useEffect } from 'react';
import { Settings, Save, MessageCircle, Landmark, Bot, Globe } from 'lucide-react';
import { useLMS } from '../../context/LMSContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function SiteSettingsPanel() {
  const { siteSettings, updateSiteSettings } = useLMS();
  const { user } = useAuth();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (siteSettings && !form) setForm({ ...siteSettings });
  }, [siteSettings, form]);

  const save = async () => {
    if (!form.accountNumber?.trim() || !form.bankName?.trim() || !form.accountName?.trim()) {
      toast.error('Bank details cannot be empty');
      return;
    }
    try {
      const next = await updateSiteSettings(form, user);
      setForm({ ...next });
      toast.success('Site settings saved ✓');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!form) return <div className="glass rounded-[24px] p-6 text-sm text-white/40">Loading settings…</div>;

  const input = 'w-full h-11 rounded-full glass px-4 text-sm';

  return (
    <div className="glass rounded-[24px] p-6 space-y-6">
      <h4 className="font-bold flex items-center gap-2 text-lg"><Settings className="h-5 w-5 text-cyan-300" /> Site Settings</h4>

      <div className="space-y-3">
        <div className="font-bold text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-cyan-300" /> BRANDING</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} placeholder="Site name" title="Site name" className={input} />
          <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Tagline" title="Tagline" className={input} />
        </div>
        <input value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="Meta description (SEO)" title="Meta description" className={input} />
      </div>

      <div className="space-y-3">
        <div className="font-bold text-sm flex items-center gap-2"><MessageCircle className="h-4 w-4 text-green-300" /> CONTACT</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="WhatsApp number" title="WhatsApp" className={input} />
          <input value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} placeholder="Support email" title="Support email" className={input} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="Facebook URL" title="Facebook" className={input} />
          <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="Instagram URL" title="Instagram" className={input} />
          <input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} placeholder="X / Twitter URL" title="Twitter" className={input} />
          <input value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} placeholder="YouTube URL" title="YouTube" className={input} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="font-bold text-sm flex items-center gap-2"><Landmark className="h-4 w-4 text-amber-300" /> BANK DETAILS (shown on all enroll pages)</div>
        <div className="grid sm:grid-cols-3 gap-3">
          <input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="Bank name" title="Bank name" className={input} />
          <input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} placeholder="Account number" title="Account number" className={`${input} font-mono`} />
          <input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} placeholder="Account name" title="Account name" className={input} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="font-bold text-sm flex items-center gap-2"><Bot className="h-4 w-4 text-purple-300" /> FEATURES & AI</div>
        <label className="flex items-center justify-between rounded-2xl bg-white/[0.03] border border-white/10 p-4 text-sm">
          <span><span className="font-bold">DanTECH AI assistant</span><span className="block text-xs text-white/40">Floating "Ask DanTECH AI" chat for students</span></span>
          <input type="checkbox" checked={!!form.dantechEnabled} onChange={(e) => setForm({ ...form, dantechEnabled: e.target.checked })} className="h-5 w-5" />
        </label>
        <label className="flex items-center justify-between rounded-2xl bg-white/[0.03] border border-white/10 p-4 text-sm">
          <span><span className="font-bold">Allow new registrations</span><span className="block text-xs text-white/40">Turn off to close signups temporarily</span></span>
          <input type="checkbox" checked={!!form.allowRegistration} onChange={(e) => setForm({ ...form, allowRegistration: e.target.checked })} className="h-5 w-5" />
        </label>
        <div className="text-xs text-white/40 leading-relaxed">Cloud AI: set <span className="font-mono">VITE_DANTECH_ENDPOINT</span> to connect DanTECH AI to your secure AI backend (API keys stay server-side — never in the browser). Without it, the built-in on-device tutor is used.</div>
      </div>

      <button onClick={save} className="w-full btn-primary !py-3.5 gap-2"><Save className="h-4 w-4" /> SAVE SETTINGS</button>
    </div>
  );
}
