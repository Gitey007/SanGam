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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { API_BASE_URL } from '../utils/constants';

export const SettingsPage = () => {
  const { user, logout, token } = useAuth();
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
          <SettingsIcon className="w-5 h-5 text-slate-900" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Account & Settings
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Manage your account profile, college details, and active authentication session.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">
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
            <h3 className="text-base font-semibold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>College</span>
            </div>
            <p className="text-xs font-semibold text-slate-900">
              {user?.college || 'Not set'}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Branch / Major</span>
            </div>
            <p className="text-xs font-semibold text-slate-900">
              {user?.branch || 'Not set'}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Academic Year</span>
            </div>
            <p className="text-xs font-semibold text-slate-900">
              {user?.year ? `Year ${user.year}` : 'Not set'}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span>Registered Email</span>
            </div>
            <p className="text-xs font-semibold text-slate-900 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Session & Backend Connection */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">
            Authentication & Backend Status
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-600">Session Status</span>
            <Badge variant="success" size="sm">
              Authenticated (JWT Active)
            </Badge>
          </div>

          <div className="flex items-center justify-between py-1.5 border-t border-slate-100">
            <span className="text-slate-600">Backend API URL</span>
            <span className="font-mono text-[11px] text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              {API_BASE_URL || '/api (Vite Proxy)'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-t border-slate-100">
            <span className="text-slate-600">Auth Token Verification</span>
            <span className="text-slate-500">
              {token ? 'Bearer token attached to API headers' : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone / Logout */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Sign Out</h3>
            <p className="text-xs text-slate-500 mt-0.5">
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
