import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { isConfigured } from '../../lib/backendHealth';
import { BrandMark } from '../common/BrandLogo';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#020a1f] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* CV CTA strip */}
        <div className="mt-12 rounded-3xl border border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 via-blue-600/10 to-purple-600/15 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-display font-black text-xl md:text-2xl">Need a job-ready CV today?</div>
            <p className="text-sm text-white/60 mt-1">Create a professional CV in minutes — free, no account required. Download as PDF instantly.</p>
          </div>
          <Link to="/cv-builder" className="shrink-0 btn-primary !py-3.5 !px-7 !text-sm whitespace-nowrap">CREATE YOUR PROFESSIONAL CV</Link>
        </div>

        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <BrandMark size={44} />
              <div>
                <div className="font-display font-bold leading-none">WOLI DAN</div>
                <div className="font-display font-bold text-gradient text-sm tracking-widest leading-none">TECH HUB</div>
                <div className="text-[10px] tracking-[0.2em] text-white/50 mt-1">LEARN • BUILD • GROW</div>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Making quality digital skills training accessible, practical and affordable for every Nigerian youth.
            </p>
            <div className="flex gap-3">
              <a href="https://wa.me/2348159610509" target="_blank" className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-green-500/20 hover:border-green-500/30 transition">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href="mailto:info@wolidantech.com" className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-sm tracking-wide">QUICK LINKS</h4>
            <ul className="space-y-3 text-sm text-white/60">
              {[
                ['Home', '/'],
                ['Global Skills Library', '/courses'],
                ['Learning Paths', '/learning-paths'],
                ['Career Hub', '/career-hub'],
                ['CV Builder — Free', '/cv-builder'],
                ['About', '/about'],
                ['Contact', '/contact'],
                ['Login', '/login'],
                ['Sign Up', '/register'],
                ['Verify Certificate', '/verify-certificate'],
              ].map(([label, to]) => (
                <li key={to}><Link to={to} className="hover:text-cyan-300 transition flex items-center gap-1 group">{label} <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" /></Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-sm tracking-wide">COURSES</h4>
            <ul className="space-y-3 text-sm text-white/60">
              {[
                'AI Video Creation',
                'Video Editing',
                'Graphic Design',
                'Digital Marketing',
                'Mobile App Development',
                'Web Development',
                'UI/UX Design',
                'Microsoft Office'
              ].map(c => (
                <li key={c}><Link to="/courses" className="hover:text-cyan-300 transition">{c}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-sm tracking-wide">CONTACT</h4>
            <div className="space-y-4 text-sm">
              <a href="https://wa.me/2348159610509" className="flex items-center gap-3 text-white/70 hover:text-white transition">
                <span className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center"><Phone className="h-4 w-4 text-green-400" /></span>
                WhatsApp: 08159610509
              </a>
              <div className="flex items-center gap-3 text-white/60">
                <span className="h-8 w-8 rounded-full glass flex items-center justify-center"><Mail className="h-4 w-4" /></span>
                info@wolidantech.com
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <span className="h-8 w-8 rounded-full glass flex items-center justify-center"><MapPin className="h-4 w-4" /></span>
                Lagos, Nigeria • Online
              </div>

              <a href="https://chat.whatsapp.com/Hj9hsrcYSXHDIPW6DnW73z" target="_blank" className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#25D366] text-white font-bold text-sm hover:bg-[#20bd5a] transition shadow-[0_0_20px_rgba(37,211,102,0.4)]">
                <MessageCircle className="h-4 w-4" /> JOIN WHATSAPP GROUP
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <div>© 2026 WOLI DAN TECH HUB. All Rights Reserved.</div>
          <div className="flex items-center gap-6">
            <span>Digital Skills • Better Opportunities • Real Income</span>
            {/* Was a hardcoded "All systems operational" — a false claim whenever
                the database is paused, misconfigured or unreachable, which is
                exactly when someone is debugging an empty site. */}
            <Link
              to="/backend-status"
              title="Test the database connection"
              className="hidden md:inline-flex items-center gap-2 hover:text-white transition"
            >
              <span className={`h-2 w-2 rounded-full animate-pulse ${isConfigured() ? 'bg-green-400' : 'bg-amber-400'}`} />
              {isConfigured() ? 'Backend status' : 'Backend not configured'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
