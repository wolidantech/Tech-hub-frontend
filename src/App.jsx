import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { LMSProvider } from './context/LMSContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DanTechAI from './components/dantech/DanTechAI';

import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import About from './pages/About';
import AdminLogin from './pages/AdminLogin';
import VerifyCertificate from './pages/VerifyCertificate';
import LearningPaths from './pages/LearningPaths';
import CareerHub from './pages/CareerHub';
import StudentPortfolio from './pages/StudentPortfolio';
import Search from './pages/Search';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import SetupGate from './components/common/SetupGate';
import BackendStatus from './pages/BackendStatus';

// Code-split heavy routes for faster mobile loads
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyCourses = lazy(() => import('./pages/MyCourses'));
const MyPayments = lazy(() => import('./pages/MyPayments'));
const Learn = lazy(() => import('./pages/Learn'));
const Enroll = lazy(() => import('./pages/Enroll'));
const BundleEnroll = lazy(() => import('./pages/BundleEnroll'));
const Certificates = lazy(() => import('./pages/Certificates'));
const CertificateView = lazy(() => import('./pages/CertificateView'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const CVBuilder = lazy(() => import('./pages/CVBuilder'));
const AIPage = lazy(() => import('./pages/AIPage'));

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#020a1f]">
    <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
  </div>
);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <RouteLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <RouteLoader />;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}

function PublicAdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <RouteLoader />;
  if (user && isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#020a1f]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AdminRedirect() {
  const { user, isAdmin } = useAuth();
  if (user && isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/admin/login" replace />;
}

const lazyEl = (el) => <Suspense fallback={<RouteLoader />}>{el}</Suspense>;

// The whole storefront + dashboard lives behind SetupGate and the providers.
function GatedApp() {
  return (
      <SetupGate>
      <AuthProvider>
        <CourseProvider>
          <LMSProvider>
            <Routes>
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/courses" element={<Layout><Courses /></Layout>} />
              <Route path="/course/:slug" element={<Layout><CourseDetails /></Layout>} />
              <Route path="/courses/:slug" element={<Layout><CourseDetails /></Layout>} />
              <Route path="/login" element={<Layout><Login /></Layout>} />
              <Route path="/register" element={<Layout><Register /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/contact" element={<Layout><Contact /></Layout>} />
              <Route path="/verify-certificate" element={<Layout><VerifyCertificate /></Layout>} />
              <Route path="/certificates/verify" element={<Layout><VerifyCertificate /></Layout>} />
              <Route path="/learning-paths" element={<Layout><LearningPaths /></Layout>} />
              <Route path="/career-hub" element={<Layout><CareerHub /></Layout>} />
              <Route path="/cv-builder" element={lazyEl(<Layout><CVBuilder /></Layout>)} />
              <Route path="/student/:id" element={<StudentPortfolio />} />
              <Route path="/search" element={<Layout><Search /></Layout>} />
              <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
              <Route path="/update-password" element={<Layout><UpdatePassword /></Layout>} />
              <Route path="/certificate/:id" element={lazyEl(<Layout><CertificateView /></Layout>)} />

              <Route path="/admin/login" element={<PublicAdminRoute><AdminLogin /></PublicAdminRoute>} />

              <Route path="/dashboard" element={lazyEl(<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>)} />
              <Route path="/my-courses" element={lazyEl(<ProtectedRoute><Layout><MyCourses /></Layout></ProtectedRoute>)} />
              <Route path="/my-payments" element={lazyEl(<ProtectedRoute><Layout><MyPayments /></Layout></ProtectedRoute>)} />
              <Route path="/learn/:slug" element={lazyEl(<ProtectedRoute><Learn /></ProtectedRoute>)} />
              <Route path="/enroll/:slug" element={lazyEl(<ProtectedRoute><Layout><Enroll /></Layout></ProtectedRoute>)} />
              <Route path="/enroll/bundle/:id" element={lazyEl(<ProtectedRoute><Layout><BundleEnroll /></Layout></ProtectedRoute>)} />
              <Route path="/certificates" element={lazyEl(<ProtectedRoute><Layout><Certificates /></Layout></ProtectedRoute>)} />
              <Route path="/profile" element={lazyEl(<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>)} />
              <Route path="/onboarding" element={lazyEl(<ProtectedRoute><Onboarding /></ProtectedRoute>)} />
              <Route path="/ai" element={lazyEl(<ProtectedRoute><AIPage /></ProtectedRoute>)} />

              <Route path="/admin" element={<AdminRedirect />} />
              <Route path="/admin/dashboard" element={lazyEl(<AdminRoute><Layout><Admin /></Layout></AdminRoute>)} />

              <Route path="*" element={<Layout><div className="min-h-[60vh] flex items-center justify-center text-center p-8"><div><h1 className="font-black text-4xl">404</h1><p className="text-white/60 mt-2">Page not found</p><a href="/" className="inline-flex mt-6 btn-primary">GO HOME</a></div></div></Layout>} />
            </Routes>
            <DanTechAI />
          </LMSProvider>
        </CourseProvider>
      </AuthProvider>
      </SetupGate>
  );
}

// /backend-status is deliberately NOT gated. When Supabase is unconfigured or
// unreachable, SetupGate would otherwise hide the one page that explains why —
// which is precisely when an administrator needs it.
function Shell() {
  const { pathname } = useLocation();
  if (pathname === '/backend-status') return <BackendStatus />;
  return <GatedApp />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
