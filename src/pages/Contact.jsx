import { useState } from 'react';
import { MessageCircle, Mail, Phone, MapPin, Send, Clock, Users } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We will reply on WhatsApp shortly 🚀');
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f]">
      <Toaster richColors />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-[720px] mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[11px] font-bold tracking-widest"><MessageCircle className="h-4 w-4 text-cyan-300" /> CONTACT US</div>
          <h1 className="font-display font-black text-[36px] md:text-[52px] leading-[0.9]">Get in Touch with <span className="text-gradient">WOLI DAN TECH HUB</span></h1>
          <p className="text-white/60">Have questions? Chat with us on WhatsApp for fastest response. We're here to help you start your digital skills journey.</p>
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 max-w-[1080px] mx-auto">
          <div className="space-y-6">
            <div className="glass-strong rounded-[24px] p-8 space-y-6">
              <h3 className="font-bold text-xl">Contact Information</h3>
              
              <a href="https://wa.me/2348159610509" target="_blank" className="flex items-center gap-4 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/15 transition group">
                <div className="h-12 w-12 rounded-2xl bg-[#25D366] flex items-center justify-center shrink-0 group-hover:scale-110 transition"><Phone className="h-6 w-6 text-white" /></div>
                <div><div className="text-[11px] tracking-widest font-bold text-white/40">WHATSAPP</div><div className="font-black text-lg">08159610509</div><div className="text-xs text-[#25D366]">Fastest response • Online now</div></div>
              </a>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center"><Mail className="h-5 w-5" /></div>
                  <div><div className="text-xs text-white/40">Email</div><div className="font-bold">info@wolidantech.com</div></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center"><MapPin className="h-5 w-5" /></div>
                  <div><div className="text-xs text-white/40">Location</div><div className="font-bold">Lagos, Nigeria • Online Worldwide</div></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center"><Clock className="h-5 w-5" /></div>
                  <div><div className="text-xs text-white/40">Response Time</div><div className="font-bold">Within 2 hours (WhatsApp)</div></div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-3">
                <a href="https://wa.me/2348159610509" target="_blank" className="w-full h-12 rounded-full bg-[#25D366] text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:bg-[#20bd5a] transition"><MessageCircle className="h-5 w-5" /> CHAT ON WHATSAPP</a>
                <a href="https://chat.whatsapp.com/Hj9hsrcYSXHDIPW6DnW73z" target="_blank" className="w-full h-12 rounded-full glass font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition"><Users className="h-5 w-5" /> JOIN WHATSAPP GROUP</a>
              </div>
            </div>

            <div className="glass rounded-[24px] p-6">
              <h4 className="font-bold mb-3">Why WhatsApp?</h4>
              <ul className="space-y-2 text-sm text-white/60 list-disc pl-5">
                <li>Fastest response - under 2 hours</li>
                <li>Direct support from Woli Dan</li>
                <li>Voice notes & screen sharing</li>
                <li>Join community of 100+ learners</li>
              </ul>
            </div>
          </div>

          <div className="glass rounded-[24px] p-8">
            <h3 className="font-bold text-xl mb-2">Send us a Message</h3>
            <p className="text-sm text-white/50 mb-6">Fill the form and we'll reply via WhatsApp or email</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className="h-[52px] rounded-full glass px-5 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50" />
                <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone Number" className="h-[52px] rounded-full glass px-5 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50" />
              </div>
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email Address" className="w-full h-[52px] rounded-full glass px-5 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50" />
              <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="How can we help you? Tell us about your goals..." rows={6} className="w-full rounded-[20px] glass p-5 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 resize-none" />
              <button type="submit" className="w-full btn-primary !py-4 gap-2"><Send className="h-4 w-4" /> SUBMIT MESSAGE</button>
              <div className="text-[11px] text-white/30 text-center">We respect your privacy. No spam, only helpful replies.</div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
