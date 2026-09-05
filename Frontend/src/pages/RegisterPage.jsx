import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, BookOpen, KeyRound } from 'lucide-react';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import { YEAR_OPTIONS } from '../utils/constants';
import authApi from '../services/authApi';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../utils/helpers';

export const RegisterPage = () => {
  const [stage, setStage] = useState('details'); // 'details' | 'otp'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    branch: '',
    year: '1',
    bio: '',
    otp: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const navigate = useNavigate();
  const { success: toastSuccess } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (generalError) setGeneralError('');
  };

  const validateDetails = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.password || formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }
    if (!formData.college.trim()) errs.college = 'College name is required';
    if (!formData.branch.trim()) errs.branch = 'Branch is required';
    return errs;
  };

  // Step 1: Submit details & send OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const validationErrors = validateDetails();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      await authApi.sendOtp(formData.email);
      setStage('otp');
      toastSuccess(`Verification code sent to ${formData.email}`);
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to send OTP. Please check your email and try again.');
      setGeneralError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    setGeneralError('');
    try {
      await authApi.sendOtp(formData.email);
      toastSuccess(`New verification code sent to ${formData.email}`);
    } catch (err) {
      setGeneralError(extractErrorMessage(err, 'Failed to resend OTP. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Verify OTP & Create Account
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!formData.otp.trim()) {
      setGeneralError('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      // 1. Verify OTP with backend
      await authApi.verifyOtp(formData.email, formData.otp);

      // 2. Complete registration on backend
      await authApi.register(formData);

      toastSuccess('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        'Registration failed. Please ensure the OTP is correct and not expired.'
      );
      setGeneralError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
            SG
          </div>
          <span className="font-semibold text-lg text-slate-900 tracking-tight">SanGam</span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Create student account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {stage === 'details'
            ? 'Join your campus network and start collaborating'
            : 'Verify your email address to complete registration'}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-7 px-6 sm:px-8 rounded-xl border border-slate-200 shadow-subtle">
          {generalError && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
              {generalError}
            </div>
          )}

          {stage === 'details' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  placeholder="Sahul Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  leftIcon={User}
                  error={errors.name}
                  required
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  leftIcon={Mail}
                  error={errors.email}
                  required
                />
              </div>

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                leftIcon={Lock}
                error={errors.password}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="College / Institution"
                  name="college"
                  placeholder="e.g. ABES Engineering College"
                  value={formData.college}
                  onChange={handleChange}
                  leftIcon={Building2}
                  error={errors.college}
                  required
                />

                <Input
                  label="Branch / Major"
                  name="branch"
                  placeholder="e.g. Computer Science"
                  value={formData.branch}
                  onChange={handleChange}
                  leftIcon={BookOpen}
                  error={errors.branch}
                  required
                />
              </div>

              <Select
                label="Academic Year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                options={YEAR_OPTIONS.filter((o) => o.value !== '')}
                required
              />

              <div>
                <label
                  htmlFor="register-bio"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Bio (Optional)
                </label>
                <textarea
                  id="register-bio"
                  name="bio"
                  rows={2}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Briefly describe what you like building or skills you're focusing on..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                {isLoading ? 'Sending verification code...' : 'Continue to Email Verification'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Verification code sent to:</span>
                  <span className="font-semibold text-slate-800">{formData.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStage('details');
                    setGeneralError('');
                  }}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  Change details
                </button>
              </div>

              <Input
                label="Enter 6-Digit Verification OTP"
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
                {isLoading ? 'Verifying & Creating Account...' : 'Verify OTP & Create Account'}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-xs text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                >
                  Didn't receive the code? Resend OTP
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-slate-900 hover:text-brand-600 transition-colors underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
