'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, BookOpen, MapPin, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import AuthCard from '@/components/auth/AuthCard';
import FormInput from '@/components/auth/FormInput';
import PasswordInput from '@/components/auth/PasswordInput';
import SubmitButton from '@/components/auth/SubmitButton';

export default function RegisterPage() {
  const { language, t } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    branch: 'VINAYAK 1 SHIVAM',
    standard: '9',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Custom phone input handling to only allow digits and max 10 chars
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for field on type
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

    // Name check
    if (formData.fullName.trim().length < 3) {
      newErrors.fullName = t('authNameErr');
    }

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = t('authEmailErr');
    }

    // Phone check (10 digits standard Indian mobile check starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = t('authPhoneErr');
    }

    // Password check (min 8 chars, 1 uppercase, 1 number)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = t('authPasswordValidationErr');
    }

    // Confirm password check
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('authConfirmPasswordErr');
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
    try {
      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to login page with query param to trigger success toast
        router.push('/login?registered=true');
      } else {
        setErrorBanner(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorBanner('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const branchOptions = [
    { value: 'VINAYAK 1 SHIVAM', label: 'VINAYAK 1 SHIVAM' },
    { value: 'VINAYAK 2 RAILWAY EAST', label: 'VINAYAK 2 RAILWAY EAST' },
  ];

  const standardOptions = [
    { value: '9', label: language === 'EN' ? 'Std. 9' : 'ધોરણ ૯' },
    { value: '10', label: language === 'EN' ? 'Std. 10' : 'ધોરણ ૧૦' },
    { value: '11', label: language === 'EN' ? 'Std. 11 Commerce' : 'ધોરણ ૧૧ કોમર્સ' },
    { value: '12', label: language === 'EN' ? 'Std. 12 Commerce' : 'ધોરણ ૧૨ કોમર્સ' },
  ];

  return (
    <AuthCard title={t('authRegisterTitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Notification Banner */}
        {errorBanner && (
          <div className="flex items-center space-x-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Full Name */}
        <FormInput
          label={t('authFullNameLabel')}
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          placeholder={t('authFullNamePlaceholder')}
          icon={User}
          error={errors.fullName}
          required
          disabled={submitting}
        />

        {/* Email */}
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

        {/* Phone Number */}
        <FormInput
          label={t('authPhoneLabel')}
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder={t('authPhonePlaceholder')}
          icon={Phone}
          error={errors.phone}
          required
          disabled={submitting}
          autoComplete="tel"
        />

        {/* Branch Selection */}
        <FormInput
          label={language === 'EN' ? 'Select Branch' : 'શાખા પસંદ કરો'}
          name="branch"
          type="select"
          value={formData.branch}
          onChange={handleChange}
          options={branchOptions}
          icon={MapPin}
          required
          disabled={submitting}
        />

        {/* Standard Selection */}
        <FormInput
          label={language === 'EN' ? 'Select Standard' : 'ધોરણ પસંદ કરો'}
          name="standard"
          type="select"
          value={formData.standard}
          onChange={handleChange}
          options={standardOptions}
          icon={BookOpen}
          required
          disabled={submitting}
        />

        {/* Password */}
        <PasswordInput
          label={t('authPasswordLabel')}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={t('authPasswordPlaceholder')}
          error={errors.password}
          required
          disabled={submitting}
        />

        {/* Confirm Password */}
        <PasswordInput
          label={t('authConfirmPasswordLabel')}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder={t('authConfirmPasswordPlaceholder')}
          error={errors.confirmPassword}
          required
          disabled={submitting}
        />

        {/* Submit Button */}
        <div className="pt-2">
          <SubmitButton isLoading={submitting} loadingText={t('authSubmitting')}>
            {t('authCreateAccountBtn')}
          </SubmitButton>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-xs font-bold text-slate-500 hover:text-[#8B5CF6] dark:text-slate-400 dark:hover:text-[#8B5CF6] transition-colors"
          >
            {t('authAlreadyAccount')}
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
