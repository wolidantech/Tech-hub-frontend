import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyCourses from './pages/MyCourses';
import MyPayments from './pages/MyPayments';
import Learn from './pages/Learn';
import Enroll from './pages/Enroll';
import Certificates from './pages/Certificates';
import CertificateView from './pages/CertificateView';
import VerifyCertificate from './pages/VerifyCertificate';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import About from './pages/About';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#020a1f]"><div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin, isAdminSessionValid } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#020a1f]"><div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" /></div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
  if (!isAdminSessionValid()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function PublicAdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#020a1f]"><div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" /></div>;
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CourseProvider>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/courses" element={<Layout><Courses /></Layout>} />
            <Route path="/course/:slug" element={<Layout><CourseDetails /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/verify-certificate" element={<Layout><VerifyCertificate /></Layout>} />
            <Route path="/certificate/:id" element={<Layout><CertificateView /></Layout>} />

            <Route path="/admin/login" element={<PublicAdminRoute><AdminLogin /></PublicAdminRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/my-courses" element={<ProtectedRoute><Layout><MyCourses /></Layout></ProtectedRoute>} />
            <Route path="/my-payments" element={<ProtectedRoute><Layout><MyPayments /></Layout></ProtectedRoute>} />
            <Route path="/learn/:slug" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
            <Route path="/enroll/:slug" element={<ProtectedRoute><Layout><Enroll /></Layout></ProtectedRoute>} />
            <Route path="/certificates" element={<ProtectedRoute><Layout><Certificates /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

            <Route path="/admin" element={<AdminRedirect />} />
            <Route path="/admin/dashboard" element={<AdminRoute><Layout><Admin /></Layout></AdminRoute>} />

            <Route path="*" element={<Layout><div className="min-h-[60vh] flex items-center justify-center text-center p-8"><div><h1 className="font-black text-4xl">404</h1><p className="text-white/60 mt-2">Page not found</p><a href="/" className="inline-flex mt-6 btn-primary">GO HOME</a></div></div></Layout>} />
          </Routes>
        </CourseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
