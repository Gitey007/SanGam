import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TeamsPage from './pages/TeamsPage';
import CreateTeamPage from './pages/CreateTeamPage';
import TeamDetailsPage from './pages/TeamDetailsPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import SkillsPage from './pages/SkillsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/teams/:id" element={<TeamDetailsPage />} />
              <Route path="/skills" element={<SkillsPage />} />

              {/* Protected Routes */}
              <Route
                path="/teams/create"
                element={
                  <ProtectedRoute>
                    <CreateTeamPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <EditProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4">
              <p>© {new Date().getFullYear()} SanGam. Built for College Developers & Teams.</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
