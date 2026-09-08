import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight, CheckCircle2, Server, ArrowLeft } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ThemeToggle from '../components/common/ThemeToggle';
import { useToast } from '../context/ToastContext';
import authApi from '../services/authApi';
import { extractErrorMessage } from '../utils/helpers';

export const ForgotPasswordPage = () => {
  // 'email' | 'otp' | 'reset' | 'success'
  const [stage, setStage] = useState('email');

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const { success: toastSuccess } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errorMessage) setErrorMessage('');
  };

  // Step 1: Request Password Reset OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      setErrors({ email: 'Please enter your registered email address.' });
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.forgotPasswordSendOtp(formData.email);
      setStage('otp');
      toastSuccess(response?.message || 'If registered, an OTP has been sent to your email.');
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(err, 'Unable to send OTP. Please check your email and try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await authApi.forgotPasswordSendOtp(formData.email);
      toastSuccess(`A new verification code was dispatched to ${formData.email}`);
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, 'Failed to resend OTP. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!formData.otp.trim()) {
      setErrors({ otp: 'Please enter the 6-digit verification code.' });
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await authApi.forgotPasswordVerifyOtp(formData.email, formData.otp);
      setStage('reset');
      toastSuccess('Code verified! Please set your new password.');
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 401) {
        setErrorMessage('Invalid or expired OTP. Please try again or request a new code.');
      } else {
        setErrorMessage(extractErrorMessage(err, 'Unable to verify OTP. Please try again.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const validationErrors = {};

    if (!formData.newPassword || formData.newPassword.length < 8) {
      validationErrors.newPassword = 'Password must be at least 8 characters long.';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await authApi.forgotPasswordReset(formData.email, formData.newPassword);
      setStage('success');
      toastSuccess('Password updated successfully!');
    } catch (err) {
      setErrorMessage(
        extractErrorMessage(
          err,
          'Failed to reset password. Your reset session may have expired. Please start over.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isServerWaking =
    typeof errorMessage === 'string' &&
    (errorMessage.toLowerCase().includes('waking up') ||
      errorMessage.toLowerCase().includes('starting up') ||
      errorMessage.toLowerCase().includes('free hosting'));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-150">
      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-subtle">
            SG
          </div>
          <span className="font-semibold text-lg text-slate-900 dark:text-slate-100 tracking-tight">SanGam</span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {stage === 'email' && 'Reset your password'}
          {stage === 'otp' && 'Verify your code'}
          {stage === 'reset' && 'Create new password'}
          {stage === 'success' && 'Password updated'}
        </h1>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {stage === 'email' && "Enter your registered email and we'll send you an OTP."}
          {stage === 'otp' && `Enter the 6-digit code sent to ${formData.email}`}
          {stage === 'reset' && 'Choose a secure password of at least 8 characters.'}
          {stage === 'success' && 'You can now sign in with your new credentials.'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-7 px-6 sm:px-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          {/* Error / Server Wake-up Notification */}
          {errorMessage && (
            isServerWaking ? (
              <div className="mb-5 p-3.5 rounded-lg bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2.5 animate-in fade-in">
                <Server className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-semibold block mb-0.5">SanGam server is waking up</span>
                  <span className="text-[11px] text-amber-800 dark:text-amber-300">{errorMessage}</span>
                </div>
              </div>
            ) : (
              <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 leading-relaxed animate-in fade-in">
                {errorMessage}
              </div>
            )
          )}

          {/* STAGE 1: Request OTP */}
          {stage === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="Registered College Email"
                name="email"
                type="email"
                placeholder="name@college.edu or registered email"
                value={formData.email}
                onChange={handleChange}
                leftIcon={Mail}
                error={errors.email}
                required
                autoFocus
                autoComplete="email"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                {isLoading ? 'Sending verification code...' : 'Send Reset OTP'}
              </Button>
            </form>
          )}

          {/* STAGE 2: Verify OTP */}
          {stage === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Code sent to:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{formData.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStage('email');
                    setErrorMessage('');
                  }}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
                >
                  Change email
                </button>
              </div>

              <Input
                label="Enter 6-Digit OTP"
                name="otp"
                type="text"
                placeholder="e.g. 123456"
                value={formData.otp}
                onChange={handleChange}
                leftIcon={KeyRound}
                error={errors.otp}
                required
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                {isLoading ? 'Verifying code...' : 'Verify OTP & Continue'}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                >
                  Didn't receive the code? Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* STAGE 3: Reset Password */}
          {stage === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.newPassword}
                onChange={handleChange}
                leftIcon={Lock}
                error={errors.newPassword}
                required
                autoFocus
                autoComplete="new-password"
              />

              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                leftIcon={Lock}
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                {isLoading ? 'Updating password...' : 'Update Password'}
              </Button>
            </form>
          )}

          {/* STAGE 4: Success */}
          {stage === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Password successfully changed
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your password has been updated. You can now log into your SanGam account.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => navigate('/login')}
                rightIcon={ArrowRight}
              >
                Go to Sign In
              </Button>
            </div>
          )}

          {/* Footer Link */}
          {stage !== 'success' && (
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-medium text-slate-900 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors underline-offset-4 hover:underline"
              >
                Back to Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
