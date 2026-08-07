'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import AuthCard from '@/components/auth/AuthCard';
import PasswordInput from '@/components/auth/PasswordInput';
import SubmitButton from '@/components/auth/SubmitButton';

function ResetPasswordFormContent() {
  const { language, t } = useLanguage();
  const isGj = language === 'GJ';
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');
  const userType = searchParams.get('type');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    if (!token || !userType || (userType !== 'student' && userType !== 'staff')) {
      setErrorMsg(
        isGj
          ? 'અમાન્ય અથવા અપૂર્ણ પાસવર્ડ રીસેટ લિંક.'
          : 'Invalid or incomplete password reset link.'
      );
      setInvalidToken(true);
    }
  }, [token, userType, isGj]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const validate = () => {
    // Password validation (8 chars minimum)
    if (formData.password.length < 8) {
      setErrorMsg(t('authPasswordValidationErr'));
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg(t('authConfirmPasswordErr'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invalidToken) return;

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          userType,
          newPassword: formData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(
          isGj
            ? 'પાસવર્ડ સફળતાપૂર્વક અપડેટ થયો છે! લોગીન પેજ પર રીડાયરેક્ટ થઈ રહ્યું છે...'
            : 'Password updated successfully! Redirecting to login...'
        );
        setFormData({ password: '', confirmPassword: '' });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setErrorMsg(data.error || (isGj ? 'પાસવર્ડ અપડેટ કરવામાં નિષ્ફળતા' : 'Failed to reset password'));
        if (data.error && data.error.includes('expired')) {
          setInvalidToken(true);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(isGj ? 'કનેક્શન નિષ્ફળ રહ્યું. ફરીથી પ્રયત્ન કરો.' : 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (invalidToken) {
    return (
      <div className="space-y-5 text-left">
        <div className="flex items-start space-x-2.5 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="block font-bold">
              {isGj ? 'લિંક અમાન્ય અથવા સમાપ્ત થઈ ગઈ છે' : 'Invalid or Expired Link'}
            </span>
            <span className="block text-[11px] opacity-80 leading-relaxed">
              {errorMsg || (isGj
                ? 'આ લિંકનો ઉપયોગ થઈ ચૂક્યો છે અથવા સમયસીમા સમાપ્ત થઈ ગઈ છે. કૃપા કરીને નવો લિંક વિનંતી કરો.'
                : 'This password reset link is invalid or has expired. Please request a new link.')}
            </span>
          </div>
        </div>

        <Link
          href="/forgot-password"
          className="w-full py-2.5 text-xs font-black text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl transition-all shadow-md shadow-[#8B5CF6]/10 flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isGj ? 'નવી લિંક માટે અરજી કરો' : 'Request New Link'}</span>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-center space-x-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="flex items-center space-x-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold animate-fadeIn">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Password Field */}
      <PasswordInput
        label={isGj ? 'નવો પાસવર્ડ' : 'New Password'}
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder={isGj ? 'ઓછામાં ઓછા ૮ અક્ષર' : 'At least 8 characters'}
        required
        disabled={submitting || !!successMsg}
        autoComplete="new-password"
      />

      {/* Confirm Password Field */}
      <PasswordInput
        label={isGj ? 'નવા પાસવર્ડની પુષ્ટિ કરો' : 'Confirm New Password'}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder={isGj ? 'નવો પાસવર્ડ ફરીથી દાખલ કરો' : 'Confirm your new password'}
        required
        disabled={submitting || !!successMsg}
        autoComplete="new-password"
      />

      {/* Submit Button */}
      <div className="pt-2">
        <SubmitButton isLoading={submitting} loadingText={isGj ? 'અપડેટ થઈ રહ્યું છે...' : 'Resetting Password...'}>
          {isGj ? 'પાસવર્ડ અપડેટ કરો' : 'Reset Password'}
        </SubmitButton>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();

  return (
    <AuthCard title={t('authForgotPassword')}>
      <Suspense fallback={
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
        </div>
      }>
        <ResetPasswordFormContent />
      </Suspense>
    </AuthCard>
  );
}
