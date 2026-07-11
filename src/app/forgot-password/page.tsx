'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import AuthCard from '@/components/auth/AuthCard';
import FormInput from '@/components/auth/FormInput';
import SubmitButton from '@/components/auth/SubmitButton';

export default function ForgotPasswordPage() {
  const { language, t } = useLanguage();
  const isGj = language === 'GJ';

  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'student' | 'staff'>('student');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg(t('authEmailErr'));
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userType }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(
          isGj
            ? 'જો આ ઈમેલ એકાઉન્ટ રજીસ્ટર્ડ હશે, તો પાસવર્ડ રીસેટ કરવાની લિન્ક મોકલવામાં આવી છે.'
            : 'If this email exists, a password reset link has been sent.'
        );
        setEmail('');
      } else {
        setErrorMsg(data.error || (isGj ? 'વિનંતી સબમિટ કરવામાં નિષ્ફળતા' : 'Failed to submit request'));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(isGj ? 'કનેક્શન નિષ્ફળ રહ્યું. ફરીથી પ્રયત્ન કરો.' : 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title={isGj ? 'પાસવર્ડ પુનઃપ્રાપ્ત કરો' : 'Forgot Password'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Helper info text */}
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-left">
          {isGj
            ? 'તમારો રજિસ્ટર્ડ ઈમેલ એડ્રેસ દાખલ કરો અને અમે તમને પાસવર્ડ રીસેટ કરવા માટે એક લિંક મોકલીશું.'
            : 'Enter your registered email address below and we will send you a secure link to reset your password.'}
        </p>

        {/* Success Banner */}
        {successMsg && (
          <div className="flex items-center space-x-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold animate-fadeIn text-left">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="flex items-center space-x-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold animate-fadeIn text-left">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* User Type Selector */}
        <div className="space-y-1.5 text-left">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
            {isGj ? 'તમે કોણ છો?' : 'I am a...'}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                userType === 'student'
                  ? 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {isGj ? 'વિદ્યાર્થી (Student)' : 'Student'}
            </button>
            <button
              type="button"
              onClick={() => setUserType('staff')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                userType === 'staff'
                  ? 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {isGj ? 'સ્ટાફ (Teacher/Admin)' : 'Teacher / Admin'}
            </button>
          </div>
        </div>

        {/* Email Input Field */}
        <FormInput
          label={t('authEmailLabel')}
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          placeholder={t('authEmailPlaceholder')}
          icon={Mail}
          required
          disabled={submitting}
          autoComplete="email"
        />

        {/* Submit Button */}
        <div className="pt-2">
          <SubmitButton isLoading={submitting} loadingText={isGj ? 'મોકલી રહ્યું છે...' : 'Sending Link...'}>
            {isGj ? 'રીસેટ લિંક મોકલો' : 'Send Reset Link'}
          </SubmitButton>
        </div>

        {/* Back to Login Redirect Link */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-[#8B5CF6] dark:text-slate-400 dark:hover:text-[#8B5CF6] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isGj ? 'લોગીન પેજ પર પાછા જાઓ' : 'Back to Login'}</span>
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
