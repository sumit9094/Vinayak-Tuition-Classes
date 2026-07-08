'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import AuthCard from '@/components/auth/AuthCard';
import FormInput from '@/components/auth/FormInput';
import PasswordInput from '@/components/auth/PasswordInput';
import SubmitButton from '@/components/auth/SubmitButton';

function LoginFormContent() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Banner notifications
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user is redirected after a successful registration
    if (searchParams.get('registered') === 'true') {
      setSuccessBanner(t('authSuccessRegister'));
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setSuccessBanner(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for field
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    // Clear error banner on type
    if (errorBanner) {
      setErrorBanner(null);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = t('authEmailErr');
    }

    // Password check (required, min 8 chars for login check as per spec)
    if (formData.password.length < 8) {
      newErrors.password = t('authPasswordValidationErr');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      const loggedInUser = await login(formData.email, formData.password);
      if (loggedInUser) {
        if (loggedInUser.type === 'student') {
          router.push('/student/dashboard');
        } else if (loggedInUser.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (loggedInUser.role === 'teacher') {
          router.push('/teacher/dashboard');
        }
      } else {
        setErrorBanner(t('authInvalidCredentials'));
      }
    } catch (err) {
      console.error('Login action error:', err);
      setErrorBanner(t('authInvalidCredentials'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Success Notification Banner */}
      {successBanner && (
        <div className="flex items-center space-x-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorBanner && (
        <div className="flex items-center space-x-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold animate-fadeIn">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Email Field */}
      <FormInput
        label={t('authEmailLabel')}
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder={t('authEmailPlaceholder')}
        icon={Mail}
        error={errors.email}
        required
        disabled={submitting}
        autoComplete="email"
      />

      {/* Password Field */}
      <div>
        <PasswordInput
          label={t('authPasswordLabel')}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={t('authPasswordPlaceholder')}
          error={errors.password}
          required
          disabled={submitting}
          autoComplete="current-password"
        />
        
        {/* Forgot Password Link */}
        <div className="flex justify-end mt-1.5">
          <Link
            href="/forgot-password"
            className="text-[11px] font-bold text-slate-500 hover:text-[#8B5CF6] dark:text-slate-400 dark:hover:text-[#8B5CF6] transition-colors"
          >
            {t('authForgotPassword')}
          </Link>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <SubmitButton isLoading={submitting} loadingText={t('authLoggingIn')}>
          {t('authLoginBtn')}
        </SubmitButton>
      </div>

      {/* Register Redirect Link */}
      <div className="text-center mt-6">
        <Link
          href="/register"
          className="text-xs font-bold text-slate-500 hover:text-[#8B5CF6] dark:text-slate-400 dark:hover:text-[#8B5CF6] transition-colors"
        >
          {t('authNoAccount')}
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <AuthCard title={t('authLoginTitle')}>
      <Suspense fallback={
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </AuthCard>
  );
}
