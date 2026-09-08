import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Server } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ThemeToggle from '../components/common/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import authApi from '../services/authApi';
import { extractErrorMessage } from '../utils/helpers';

export const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
  const handleLogin = async (e) => {
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

  const isServerWaking =
    typeof errorMessage === 'string' &&
    (errorMessage.toLowerCase().includes('waking up') ||
      errorMessage.toLowerCase().includes('starting up') ||
      errorMessage.toLowerCase().includes('free hosting'));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-150 relative">
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
          Sign in to your account
        </h1>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Connect with peers and student collaborators
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-7 px-6 sm:px-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          {/* Error / Server Wake-Up Notice */}
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

          {/* Clean Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="College Email"
              name="email"
              type="email"
              placeholder="name@college.edu or name@example.com"
              value={formData.email}
              onChange={handleChange}
              leftIcon={Mail}
              required
              autoFocus
              autoComplete="email"
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Password <span className="text-rose-500">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                leftIcon={Lock}
                required
                autoComplete="current-password"
              />
            </div>

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

          {/* Footer Registration Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-medium text-slate-900 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors underline-offset-4 hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
