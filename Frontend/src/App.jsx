import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Guards & Layouts
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import AppLayout from './components/layout/AppLayout';

// Lazy-loaded Pages for Route-level Code Splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const TeamsPage = lazy(() => import('./pages/TeamsPage'));
const TeamDetailsPage = lazy(() => import('./pages/TeamDetailsPage'));
const CreateTeamPage = lazy(() => import('./pages/CreateTeamPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Subtle route transition fallback
const RouteFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8">
    <div className="w-7 h-7 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-slate-800 dark:border-t-brand-500 animate-spin" />
  </div>
);

export const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Public Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Auth Routes (restricted to unauthenticated users) */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Route>

                {/* Protected Workspace Routes (requires JWT authentication) */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/discover" element={<DiscoverPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/:id" element={<ProfilePage />} />
                    <Route path="/teams" element={<TeamsPage />} />
                    <Route path="/teams/create" element={<CreateTeamPage />} />
                    <Route path="/teams/:id" element={<TeamDetailsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
