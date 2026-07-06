'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Sun, Moon, Globe, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no mock user is present, redirect to login page
    const timer = setTimeout(() => {
      if (!isLoading && !user && !sessionStorage.getItem('mock_user')) {
        router.push('/login');
      }
    }, 500); // Small timeout to allow hydration
    
    return () => clearTimeout(timer);
  }, [user, isLoading, router]);

  // Render a full-page loading spinner while verification is happening
  if (isLoading || (!user && typeof window !== 'undefined' && !sessionStorage.getItem('mock_user'))) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-50 dark:bg-darkObsidian transition-colors duration-300">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B5CF6]"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Verifying session...</p>
      </div>
    );
  }

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-darkObsidian dark:text-white transition-colors duration-300">
      {/* Protected Dashboard Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-850 py-4 shadow-sm">
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo / Brand Name */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div>
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight block">VINAYAK</span>
              <span className="text-[9px] font-bold text-accentCyan tracking-[0.2em] uppercase -mt-1 block">
                Tuition Classes
              </span>
            </div>
            <div className="bg-[#8B5CF6]/10 text-[#8B5CF6] text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center border border-[#8B5CF6]/20">
              <Shield className="w-2.5 h-2.5 mr-1" />
              Portal
            </div>
          </Link>

          {/* Quick Controls */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-105/80 dark:bg-slate-900/60 p-1 rounded-full border border-slate-200 dark:border-slate-800">
              <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1.5 mr-1" />
              <button
                onClick={() => setLanguage('EN')}
                className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-all ${
                  language === 'EN' ? 'bg-[#8B5CF6] text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('GJ')}
                className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-all ${
                  language === 'GJ' ? 'bg-[#8B5CF6] text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                GJ
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-105/80 dark:bg-slate-900/60 text-slate-650 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-colors focus:outline-none"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>

            {/* User display & Sign Out */}
            <span className="hidden sm:inline-block text-xs font-bold text-slate-600 dark:text-slate-300 px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {user?.name} ({user?.role})
            </span>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 text-xs font-bold py-1.5 px-3 rounded-full text-white bg-red-500 hover:bg-red-600 shadow-sm transition-colors focus:outline-none"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t('authLogoutBtn')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col">
        {children}
      </main>
    </div>
  );
}
