import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User, Shield, CreditCard, BookOpen, Search, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { user, logout, isAdmin } = useAuth();
  const { getPendingManualPayments } = useCourses();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/courses', label: 'Skills Library' },
    { to: '/learning-paths', label: 'Paths' },
    { to: '/career-hub', label: 'Career' },
    { to: '/cv-builder', label: 'CV Builder' },
    ...(user && !isAdmin ? [{ to: '/ai', label: 'AI' }] : []),
    { to: '/verify-certificate', label: 'Verify' },
  ];

  const doSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const pendingCount = isAdmin ? getPendingManualPayments().length : 0;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#020a1f]/80 backdrop-blur-2xl">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(34,211,238,0.5)]">
              W
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
            </div>
            <div className="leading-none">
              <div className="font-display font-bold text-[16px] tracking-tight">WOLI DAN</div>
              <div className="font-display font-bold text-[13px] text-gradient tracking-widest -mt-0.5">TECH HUB</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive(l.to) ? 'bg-white/[0.08] text-white' : 'text-white/60 hover:text-white hover:bg-white/[0.05]'}`}>
                {l.label}
              </Link>
            ))}
            <form onSubmit={doSearch} className="relative ml-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." className="h-9 w-[130px] focus:w-[190px] transition-all rounded-full glass pl-9 pr-3 text-xs placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50" />
            </form>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-semibold hover:bg-white/[0.1] transition relative">
                  {isAdmin ? <Shield className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                  {isAdmin ? 'Admin' : 'Dashboard'}
                  {pendingCount > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-black text-[11px] font-black flex items-center justify-center">{pendingCount}</span>}
                </Link>
                {!isAdmin && (
                  <>
                    <Link to="/my-payments" className="px-3 py-2 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/[0.05] flex items-center gap-1.5"><CreditCard className="h-4 w-4" /> Payments</Link>
                    <Link to="/my-courses" className="px-3 py-2 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/[0.05] flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> My Courses</Link>
                  </>
                )}
                <div className="h-6 w-px bg-white/10" />
                <div className="flex items-center gap-3">
                  <div className="text-right leading-tight hidden lg:block">
                    <div className="text-sm font-semibold">{user.fullName}</div>
                    <div className="text-[11px] text-white/50">{user.role}</div>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-sm">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <button onClick={() => { logout(); navigate('/'); }} className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-5 py-2.5 rounded-full text-sm font-semibold text-white/80 hover:text-white transition">Login</Link>
                <Link to="/register" className="btn-primary !py-2.5 !px-6 !text-[13px]">START LEARNING</Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-full glass">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#061236]/95 backdrop-blur-2xl">
          <div className="px-4 py-6 space-y-4">
            <form onSubmit={doSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses, lessons, paths..." className="h-11 w-full rounded-full glass pl-11 pr-4 text-sm focus:outline-none" />
            </form>
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className={`block px-4 py-3 rounded-xl font-medium ${isActive(l.to) ? 'bg-white/[0.08] text-white' : 'text-white/70'}`}>
                {l.label}
              </Link>
            ))}
            <Link to="/cv-builder" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-black text-sm">
              <FileText className="h-4 w-4" /> CREATE YOUR PROFESSIONAL CV — FREE
            </Link>
            {user && !isAdmin && (
              <Link to="/ai" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-purple-400/40 bg-purple-500/10 text-purple-200 font-bold text-sm">
                <Sparkles className="h-4 w-4" /> Open DanTECH AI Full Page
              </Link>
            )}
            <div className="pt-4 border-t border-white/10 space-y-3">
              {user ? (
                <>
                  <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl glass font-semibold">
                    <LayoutDashboard className="h-4 w-4" /> {isAdmin ? `Admin Dashboard ${pendingCount > 0 ? `(${pendingCount} pending)` : ''}` : 'My Dashboard'}
                  </Link>
                  {!isAdmin && (
                    <>
                      <Link to="/my-payments" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-white/70"><CreditCard className="h-4 w-4" /> My Payments</Link>
                      <Link to="/my-courses" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-white/70"><BookOpen className="h-4 w-4" /> My Courses</Link>
                    </>
                  )}
                  <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-white/70">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                  <button onClick={() => { logout(); setOpen(false); navigate('/'); }} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl glass text-center font-semibold">Login</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="block btn-primary text-center">START LEARNING</Link>
                  <Link to="/admin/login" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-center text-xs text-white/40">Admin Login</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
