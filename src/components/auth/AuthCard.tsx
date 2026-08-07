'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, ArrowLeft } from 'lucide-react';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  floatingHeader?: boolean;
}

export default function AuthCard({ children, title, floatingHeader = false }: AuthCardProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-darkObsidian dark:text-white transition-colors duration-300">
      {/* Background blur blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#8B5CF6]/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accentCyan/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>

      {/* Floating Header Mode (Used on Login Page) */}
      {floatingHeader && (
        <>
          {/* Floating Settings Panel */}
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center space-x-2.5 z-50">
            {/* Language selector */}
            <div className="flex items-center bg-white/90 dark:bg-slate-900/90 p-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm px-1">
              <button
                type="button"
                onClick={() => setLanguage('EN')}
                className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  language === 'EN'
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('GJ')}
                className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  language === 'GJ'
                    ? 'bg-[#8B5CF6] text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                ગુજરાતી
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm backdrop-blur-sm focus:outline-none cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>

          {/* Floating Back to Home Button */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-50">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:text-[#8B5CF6] dark:hover:text-white transition-all py-1.5 px-3.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm hover:border-[#8B5CF6]/40 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('authBackHome')}</span>
            </Link>
          </div>
        </>
      )}

      <div className="w-full max-w-md relative z-10 my-auto space-y-4 sm:space-y-5">
        {/* Stacked Header Bar Mode (Used on Register Page & tall forms) */}
        {!floatingHeader && (
          <div className="flex items-center justify-between w-full gap-2 px-1">
            {/* Back to Home Button */}
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:text-[#8B5CF6] dark:hover:text-white transition-all py-1.5 px-3.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#8B5CF6]/40 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('authBackHome')}</span>
            </Link>

            {/* Right Panel: Language Selector & Theme Toggle */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Language selector */}
              <div className="flex items-center bg-white/90 dark:bg-slate-900/90 p-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm px-1">
                <button
                  type="button"
                  onClick={() => setLanguage('EN')}
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    language === 'EN'
                      ? 'bg-[#8B5CF6] text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('GJ')}
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    language === 'GJ'
                      ? 'bg-[#8B5CF6] text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  ગુજરાતી
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm focus:outline-none cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>
        )}

        {/* Main Form Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-2xl bg-white dark:bg-slate-950/80 backdrop-blur-xl"
        >
          {/* Logo / Brand Header */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <Link href="/" className="text-center group">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight block">VINAYAK</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-accentCyan tracking-[0.25em] uppercase -mt-1 block">
                Tuition Classes
              </span>
            </Link>
            <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white text-center">
              {title}
            </h2>
          </div>

          {/* Form Content */}
          {children}
        </motion.div>
      </div>
    </div>
  );
}
