import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  LogOut,
  Building2,
  Mail,
  BookOpen,
  Calendar,
  ExternalLink,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { API_BASE_URL } from '../utils/constants';

export const SettingsPage = () => {
  const { user, logout, token } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-slate-900 dark:text-white" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Account & Settings
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Manage your account profile, college details, appearance theme, and active session.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-subtle space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Student Profile Details
            </h2>
          </div>
          <Link to="/profile">
            <Button variant="outline" size="sm" rightIcon={ExternalLink}>
              Edit in Profile
            </Button>
          </Link>
        </div>

        <div className="flex items-start gap-4">
          <Avatar name={user?.name} size="lg" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 text-xs mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>College</span>
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              {user?.college || 'Not set'}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 text-xs mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Branch / Major</span>
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              {user?.branch || 'Not set'}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 text-xs mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Academic Year</span>
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              {user?.year ? `Year ${user.year}` : 'Not set'}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 text-xs mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span>Registered Email</span>
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Appearance & Theme Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
          <Sun className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Appearance & Theme
          </h2>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Customize how SanGam looks on your device. Choose light, dark, or sync with your system preference.
        </p>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center justify-center p-3.5 rounded-lg border text-xs font-medium transition-all ${
              theme === 'light'
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <Sun className="w-5 h-5 mb-1.5 text-amber-500" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center justify-center p-3.5 rounded-lg border text-xs font-medium transition-all ${
              theme === 'dark'
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <Moon className="w-5 h-5 mb-1.5 text-brand-400" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center justify-center p-3.5 rounded-lg border text-xs font-medium transition-all ${
              theme === 'system'
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <Laptop className="w-5 h-5 mb-1.5 text-slate-500 dark:text-slate-400" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Session & Backend Connection */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
          <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Authentication & Backend Status
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-600 dark:text-slate-300">Session Status</span>
            <Badge variant="success" size="sm">
              Authenticated (JWT Active)
            </Badge>
          </div>

          <div className="flex items-center justify-between py-1.5 border-t border-slate-100 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-300">Backend API URL</span>
            <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
              {API_BASE_URL || '/api (Vite Proxy)'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-t border-slate-100 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-300">Auth Token Verification</span>
            <span className="text-slate-500 dark:text-slate-400">
              {token ? 'Bearer token attached to API headers' : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone / Logout */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Sign Out</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clear your active session from this browser.
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            leftIcon={LogOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
