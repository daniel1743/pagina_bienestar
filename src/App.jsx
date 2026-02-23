
import React from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ArticlesListPage from './pages/ArticlesListPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import CommunityPage from './pages/CommunityPage';
import LegalPage from './pages/LegalPage';
import GetStartedPage from './pages/GetStartedPage';
import UserProfilePage from './pages/UserProfilePage';
import NotificationsPage from './pages/NotificationsPage';

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Header />}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/registro" element={<LoginPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/articulos" element={<ArticlesListPage />} />
          <Route path="/articulos/:slug" element={<ArticleDetailPage />} />
          <Route path="/comunidad" element={<CommunityPage />} />
          <Route path="/empieza-aqui" element={<GetStartedPage />} />
          <Route path="/perfil/:id" element={<UserProfilePage />} />
          
          {/* Static Pages via LegalPage component */}
          <Route path="/sobre-mi" element={<LegalPage />} />
          <Route path="/legal/:page" element={<LegalPage />} />
          <Route path="/politica-privacidad" element={<LegalPage />} />
          <Route path="/terminos" element={<LegalPage />} />
          <Route path="/aviso-medico" element={<LegalPage />} />
          <Route path="/politica-editorial" element={<LegalPage />} />

          {/* Protected Routes */}
          <Route path="/notificaciones" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProfileProvider>
          <Router>
            <ScrollToTop />
            <AppLayout />
            <Toaster />
          </Router>
        </UserProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
