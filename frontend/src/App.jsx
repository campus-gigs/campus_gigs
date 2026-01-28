import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));

// Auth pages
const LoginPage = React.lazy(() => import('./components/Auth/LoginPage'));
const SignupPage = React.lazy(() => import('./components/Auth/SignupPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const SafetyTipsPage = React.lazy(() => import('./pages/SafetyTipsPage'));

// Layout
const DashboardLayout = React.lazy(() => import('./components/Layout/DashboardLayout'));

// Dashboard pages
const JobBoard = React.lazy(() => import('./components/Dashboard/JobBoard'));
const MyJobsPage = React.lazy(() => import('./components/Dashboard/MyJobsPage'));
const FavoritesPage = React.lazy(() => import('./components/Dashboard/FavoritesPage'));
const ProfilePage = React.lazy(() => import('./components/Dashboard/ProfilePage'));
const ChatPage = React.lazy(() => import('./components/Dashboard/ChatPage'));

// Admin pages
const AdminPanel = React.lazy(() => import('./components/Admin/AdminPanel'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Protected route wrapper for admin
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >

        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <Suspense fallback={<PageLoader />}>
              <LandingPage />
            </Suspense>
          } />
          <Route path="/login" element={
            <Suspense fallback={<PageLoader />}>
              <LoginPage />
            </Suspense>
          } />
          <Route path="/signup" element={
            <Suspense fallback={<PageLoader />}>
              <SignupPage />
            </Suspense>
          } />
          <Route path="/terms" element={
            <Suspense fallback={<PageLoader />}>
              <TermsPage />
            </Suspense>
          } />
          <Route path="/privacy" element={
            <Suspense fallback={<PageLoader />}>
              <PrivacyPolicyPage />
            </Suspense>
          } />
          <Route path="/safety" element={
            <Suspense fallback={<PageLoader />}>
              <SafetyTipsPage />
            </Suspense>
          } />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={
            <Suspense fallback={<PageLoader />}>
              <DashboardLayout />
            </Suspense>
          }>
            <Route index element={<Suspense fallback={<PageLoader />}><JobBoard /></Suspense>} />
            <Route path="my-jobs" element={<Suspense fallback={<PageLoader />}><MyJobsPage /></Suspense>} />
            <Route path="favorites" element={<Suspense fallback={<PageLoader />}><FavoritesPage /></Suspense>} />
            <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
            <Route path="profile/:userId" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
            <Route path="chat" element={<Suspense fallback={<PageLoader />}><ChatPage /></Suspense>} />
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AdminPanel />
                  </Suspense>
                </AdminRoute>
              }
            />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
      <SpeedInsights />
    </AuthProvider>
  );
}

export default App;
