'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Globe, ArrowLeft } from 'lucide-react';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
}

export default function AuthCard({ children, title }: AuthCardProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50 text-slate-900 dark:bg-darkObsidian dark:text-white transition-colors duration-300">
      {/* Background blur blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#8B5CF6]/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accentCyan/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>

      {/* Floating Settings Panel */}
      <div className="absolute top-6 right-6 flex items-center space-x-3 z-50">
        {/* Language selector */}
        <div className="flex items-center bg-white/80 dark:bg-slate-900/60 p-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm">
          <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-2 mr-1" />
          <button
            onClick={() => setLanguage('EN')}
            className={`text-[10px] font-black px-2 py-1 rounded-full transition-all ${
              language === 'EN'
                ? 'bg-[#8B5CF6] text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('GJ')}
            className={`text-[10px] font-black px-2 py-1 rounded-full transition-all ${
              language === 'GJ'
                ? 'bg-[#8B5CF6] text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            ગુજરાતી
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>

      {/* Back to Home Button floating left */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          href="/"
          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-[#8B5CF6] dark:text-slate-400 dark:hover:text-white transition-colors py-1.5 px-3 rounded-full bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('authBackHome')}</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl border border-slate-200 dark:border-slate-850 p-8 sm:p-10 shadow-xl bg-white/90 dark:bg-slate-950/50 backdrop-blur-lg"
        >
          {/* Logo / Brand Header */}
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="text-center group">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight block">VINAYAK</span>
              <span className="text-[11px] font-bold text-accentCyan tracking-[0.25em] uppercase -mt-1 block">
                Tuition Classes
              </span>
            </Link>
            <h2 className="mt-6 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white text-center">
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
