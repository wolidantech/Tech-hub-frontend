import { Link } from 'react-router-dom';
import { CheckCircle2, Target, Eye, Users, Award, Zap, Globe, BookOpen, MessageCircle } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-[800px] mx-auto text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[11px] font-bold tracking-widest">ABOUT WOLI DAN TECH HUB</div>
          <h1 className="font-display font-black text-[36px] md:text-[56px] leading-[0.9]">We Make Digital Skills <span className="text-gradient">Accessible For All</span></h1>
          <p className="text-[18px] text-white/60 leading-relaxed">WOLI DAN TECH HUB helps students, beginners, entrepreneurs, creatives and aspiring professionals develop practical digital skills that create real opportunities in the digital economy.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-[960px] mx-auto mb-16">
          <div className="glass-strong rounded-[24px] p-8 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center"><Target className="h-6 w-6" /></div>
            <div className="text-[11px] tracking-widest font-bold text-cyan-300">OUR MISSION</div>
            <div className="font-display font-bold text-2xl leading-tight">To make quality digital skills training accessible, practical and affordable.</div>
            <p className="text-sm text-white/60 leading-relaxed">We believe everyone deserves the opportunity to learn high-income digital skills, regardless of background or location. Our courses are priced at ₦5,000 to remove financial barriers.</p>
          </div>
          <div className="glass-strong rounded-[24px] p-8 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center"><Eye className="h-6 w-6" /></div>
            <div className="text-[11px] tracking-widest font-bold text-purple-300">OUR VISION</div>
            <div className="font-display font-bold text-2xl leading-tight">To empower people with digital skills they can use to create opportunities, build careers and grow businesses.</div>
            <p className="text-sm text-white/60 leading-relaxed">We envision a Nigeria where every young person can monetize their skills, build a career, and compete globally from their phone or laptop.</p>
          </div>
        </div>

        <div className="max-w-[1080px] mx-auto grid lg:grid-cols-3 gap-8 mb-20">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-display font-bold text-[28px] leading-tight">Why WOLI DAN TECH HUB?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Practical Training', desc: 'No boring theory. Learn by building real projects you can show to clients.' },
                { title: 'Beginner Friendly', desc: 'Start from zero. No prior experience needed. We explain everything simply.' },
                { title: 'Affordable', desc: '₦5,000 per course. One-time payment, lifetime access. No subscriptions.' },
                { title: 'Mobile First', desc: 'Learn on your phone. 70% of our students learn from smartphones.' },
                { title: 'Certificate Included', desc: 'Professional certificate after completion. Verifiable by employers.' },
                { title: 'Community Support', desc: 'Join 100+ learners on WhatsApp. Get help, resources, job updates.' },
              ].map(f => (
                <div key={f.title} className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-2 font-bold mb-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> {f.title}</div>
                  <div className="text-sm text-white/50 leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-[24px] bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px]">
              <div className="rounded-[23px] bg-[#0a1a4a] p-6 space-y-4">
                <h3 className="font-bold text-lg">By The Numbers</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">Students</span><span className="font-black text-xl">100+</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">Courses</span><span className="font-black text-xl">12+</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">Categories</span><span className="font-black text-xl">7</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/60 text-sm">Avg Rating</span><span className="font-black text-xl">4.9/5</span></div>
                </div>
              </div>
            </div>
            <div className="glass rounded-[24px] p-6 space-y-3">
              <h4 className="font-bold">Our Values</h4>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2"><span className="text-cyan-300">•</span><span className="text-white/70">Practical over theoretical</span></div>
                <div className="flex gap-2"><span className="text-cyan-300">•</span><span className="text-white/70">Affordable over expensive</span></div>
                <div className="flex gap-2"><span className="text-cyan-300">•</span><span className="text-white/70">Community over competition</span></div>
                <div className="flex gap-2"><span className="text-cyan-300">•</span><span className="text-white/70">Results over certificates</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1080px] mx-auto">
          <div className="rounded-[32px] bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 p-[1px]">
            <div className="rounded-[31px] bg-[#020a1f] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3">
                <h3 className="font-display font-black text-[28px] leading-tight">Ready to Start Learning?</h3>
                <p className="text-white/60 max-w-[480px]">Join 100+ students building real skills. From AI video creation to web development, your future starts here.</p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link to="/courses" className="btn-primary !px-8">BROWSE COURSES</Link>
                <a href="https://wa.me/2348159610509" target="_blank" className="btn-secondary !px-8 gap-2"><MessageCircle className="h-4 w-4" /> CHAT ON WHATSAPP</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
