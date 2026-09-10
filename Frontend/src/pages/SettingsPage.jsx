import React, { useState, useEffect } from 'react';
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
  Trash2,
  AlertTriangle,
  KeyRound,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import userApi from '../services/userApi';
import { API_BASE_URL } from '../utils/constants';
import { extractErrorMessage } from '../utils/helpers';

export const SettingsPage = () => {
  const { user, logout, token } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  // Delete Account State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otp, setOtp] = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenDeleteModal = () => {
    setOtpRequested(false);
    setOtp('');
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleRequestDeleteOtp = async () => {
    setIsRequestingOtp(true);
    setDeleteError(null);
    try {
      await userApi.requestDeleteAccountOtp();
      setOtpRequested(true);
      setCooldown(60);
      success('Verification OTP has been sent to your registered email.');
    } catch (err) {
      console.error('Failed to request delete OTP:', err);
      const msg = extractErrorMessage(err, 'Failed to send OTP. Please try again.');
      setDeleteError(msg);
      toastError(msg);
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleConfirmDeleteAccount = async (e) => {
    e?.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setDeleteError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError(null);
    try {
      await userApi.verifyAndDeleteAccount(otp.trim());
      success('Your SanGam account has been permanently deleted.');
      setIsDeleteModalOpen(false);
      logout();
      navigate('/register');
    } catch (err) {
      console.error('Failed to delete account:', err);
      const msg = extractErrorMessage(err, 'Failed to delete account. Please verify your OTP.');
      setDeleteError(msg);
      toastError(msg);
    } finally {
      setIsDeletingAccount(false);
    }
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

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-rose-200 dark:border-rose-900/40 p-6 shadow-subtle space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-rose-100 dark:border-rose-900/30">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <h2 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
            Danger Zone
          </h2>
        </div>

        {/* Sign Out */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Sign Out</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clear your active session from this browser.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            leftIcon={LogOut}
            className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Sign Out
          </Button>
        </div>

        {/* Delete Account */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-400">Delete Account</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
              Permanently delete your SanGam account, team memberships, and profile data. Requires email OTP verification.
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={handleOpenDeleteModal}
            leftIcon={Trash2}
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Delete Account OTP Verification Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Your SanGam Account"
        description="Permanently remove your student account and personal data from SanGam."
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeletingAccount}
            >
              Cancel
            </Button>
            {otpRequested ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleConfirmDeleteAccount}
                isLoading={isDeletingAccount}
                disabled={!otp.trim() || otp.trim().length !== 6}
                leftIcon={Trash2}
              >
                Confirm & Permanently Delete
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleRequestDeleteOtp}
                isLoading={isRequestingOtp}
                leftIcon={Send}
              >
                Send Verification OTP
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              Warning: This action is irreversible!
            </p>
            <p className="text-[11px] leading-relaxed">
              Your profile, achievements, projects, skills, and memberships will be deleted. If you lead active teams, please delete or transfer your teams first.
            </p>
          </div>

          {deleteError && (
            <div className="p-3 rounded-lg bg-rose-100/70 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {deleteError}
            </div>
          )}

          {!otpRequested ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                To confirm this deletion, click below to receive a 6-digit one-time password at:
              </p>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-800 dark:text-slate-200">
                {user?.email}
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmDeleteAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Enter 6-digit OTP code sent to your email:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center tracking-widest text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span>Didn't receive the OTP?</span>
                <button
                  type="button"
                  onClick={handleRequestDeleteOtp}
                  disabled={cooldown > 0 || isRequestingOtp}
                  className="font-medium text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
