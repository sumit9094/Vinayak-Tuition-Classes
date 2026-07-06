'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import AuthCard from '@/components/auth/AuthCard';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();

  return (
    <AuthCard title={t('authForgotPassword')}>
      <div className="text-center space-y-6 py-6">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
          {t('authDashboardComingSoon')}
        </p>
        
        <div className="pt-2">
          <Link
            href="/login"
            className="
              inline-flex justify-center items-center w-full py-3 px-4 
              bg-[#8B5CF6] hover:bg-[#7c3aed] text-white 
              font-bold rounded-xl shadow-[0_4px_15px_rgba(139,92,246,0.25)] 
              transition-all duration-300 transform active:scale-[0.98]
              text-sm tracking-wide
            "
          >
            {t('authLoginBtn')}
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
