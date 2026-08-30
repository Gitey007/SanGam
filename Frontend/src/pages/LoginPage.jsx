import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import authApi from '../services/authApi';
import { extractErrorMessage } from '../utils/helpers';

export const LoginPage = () => {
  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp'
  const [otpStage, setOtpStage] = useState('request'); // 'request' | 'verify'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { success: toastSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  // Password Login Handler
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      if (response && response.token) {
        login(response.token, response);
        toastSuccess('Signed in successfully');
        navigate(from, { replace: true });
      } else {
        throw new Error('Invalid response structure from authentication server.');
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        setErrorMessage('Invalid email or password. Please check your credentials.');
      } else {
        setErrorMessage(extractErrorMessage(err, 'Unable to connect to server. Please try again.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Request Handler
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      setErrorMessage('Please enter your email address to receive an OTP.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await authApi.sendOtp(formData.email);
      setOtpStage('verify');
      toastSuccess(`Verification code sent to ${formData.email}`);
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, 'Unable to send OTP. Please check the email or try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Verification Handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!formData.otp.trim()) {
      setErrorMessage('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.verifyOtp(formData.email, formData.otp);
      if (response && response.token) {
        login(response.token, response);
        toastSuccess('Signed in successfully via email OTP');
        navigate(from, { replace: true });
      } else {
        throw new Error('Invalid OTP response.');
      }
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

  const handleSwitchMode = (mode) => {
    setAuthMode(mode);
    setOtpStage('request');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
            SG
          </div>
          <span className="font-semibold text-lg text-slate-900 tracking-tight">SanGam</span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h1>
        <p className="mt-1.5 text-xs text-slate-500">
          Connect with peers and student collaborators
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 sm:px-8 rounded-xl border border-slate-200 shadow-subtle">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/80 rounded-lg mb-6 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleSwitchMode('password')}
              className={`py-1.5 rounded-md transition-all ${
                authMode === 'password'
                  ? 'bg-white text-slate-900 font-semibold shadow-subtle'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('otp')}
              className={`py-1.5 rounded-md transition-all ${
                authMode === 'otp'
                  ? 'bg-white text-slate-900 font-semibold shadow-subtle'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Email OTP
            </button>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {/* Password Mode Form */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <Input
                label="College Email"
                name="email"
                type="email"
                placeholder="name@college.edu or name@example.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={Mail}
                required
                autoComplete="email"
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                leftIcon={Lock}
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          )}

          {/* Email OTP Mode Form */}
          {authMode === 'otp' && (
            <div>
              {otpStage === 'request' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="Enter registered email"
                    value={formData.email}
                    onChange={handleChange}
                    leftIcon={Mail}
                    hint="We will send a one-time passcode to your email."
                    required
                    autoComplete="email"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full mt-2"
                    isLoading={isLoading}
                  >
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Code sent to:</span>
                      <span className="font-medium text-slate-800">{formData.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpStage('request')}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Change
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
                    {isLoading ? 'Verifying...' : 'Verify OTP & Sign In'}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className="text-xs text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                    >
                      Didn't receive the code? Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer Registration Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-medium text-slate-900 hover:text-brand-600 transition-colors underline-offset-4 hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
