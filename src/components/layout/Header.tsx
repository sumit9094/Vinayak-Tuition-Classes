'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe, Menu, X, Sun, Moon, User } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems = [
    { name: t('navHome'), href: '/#home' },
    { name: t('navAbout'), href: '/#about-us' },
    { name: t('navCourses'), href: '/#courses' },
    { name: t('navGallery'), href: '/gallery' },
    { name: t('navContact'), href: '/#contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-850 py-3 shadow-lg shadow-black/5 dark:shadow-black/20' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
        {/* Logo / Brand Name */}
        <a href="/" className="flex items-center group">
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight block">VINAYAK</span>
            <span className="text-[10px] font-bold text-accentCyan tracking-[0.2em] uppercase -mt-1 block">Tuition Classes</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-accentViolet dark:hover:text-accentViolet transition-colors duration-200 tracking-wide"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Language selector & Theme Toggle & CTA */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Language Toggle Button */}
          <div className="relative flex items-center bg-slate-100/80 dark:bg-slate-900/60 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 transition-colors">
            <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400 ml-2 mr-1.5" />
            <button 
              onClick={() => setLanguage('EN')} 
              className={`text-xs font-black px-3 py-1 rounded-full transition-all duration-300 ${language === 'EN' ? 'bg-accentViolet text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLanguage('GJ')} 
              className={`text-xs font-black px-3 py-1 rounded-full transition-all duration-300 ${language === 'GJ' ? 'bg-accentViolet text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              ગુજરાતી
            </button>
          </div>

          <Link 
            href="/login" 
            className="p-2 rounded-full bg-[#8B5CF6] hover:bg-[#7c3aed] text-white transition-colors focus:outline-none flex items-center justify-center shadow-sm"
            aria-label="Portal Login"
          >
            <User className="w-4 h-4" />
          </Link>

          <a 
            href="#admission" 
            className="bg-gradient-to-r from-accentViolet to-accentCyan hover:opacity-90 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-[0_4px_15px_rgba(15,139,253,0.2)] transition-all duration-300"
          >
            {t('navAdmission')}
          </a>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center space-x-3 md:hidden">
          {/* Theme Toggle Button for Mobile */}
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Language selector for mobile directly on header */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-full border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setLanguage(language === 'EN' ? 'GJ' : 'EN')} 
              className="flex items-center space-x-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-accentViolet text-white shadow-sm"
            >
              <Globe className="w-3 h-3" />
              <span>{language === 'EN' ? 'GJ' : 'EN'}</span>
            </button>
          </div>

          <Link 
            href="/login" 
            className="p-1.5 rounded-full bg-[#8B5CF6] hover:bg-[#7c3aed] text-white transition-colors focus:outline-none flex items-center justify-center shadow-sm"
            aria-label="Portal Login"
          >
            <User className="w-4 h-4" />
          </Link>

          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-slate-700 dark:text-white focus:outline-none p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Sidebar Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-[290px] sm:w-[330px] bg-white/98 dark:bg-slate-950/98 backdrop-blur-lg border-l border-slate-200 dark:border-slate-900 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto md:hidden"
            >
              {/* Top Bar: Logo & Close */}
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <a href="/" onClick={() => setIsOpen(false)} className="flex items-center">
                    <div>
                      <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight block">VINAYAK</span>
                      <span className="text-[9px] font-bold text-accentCyan tracking-[0.2em] uppercase -mt-1 block">Tuition Classes</span>
                    </div>
                  </a>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-slate-700 dark:text-white focus:outline-none p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col space-y-4">
                  {navItems.map((item, idx) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link 
                        href={item.href} 
                        onClick={() => setIsOpen(false)}
                        className="block text-base font-bold text-slate-700 dark:text-slate-300 hover:text-accentViolet dark:hover:text-accentViolet transition-colors py-2 border-b border-slate-100 dark:border-slate-900/40"
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Bottom Actions */}
              <div className="space-y-6 mt-8">
                {/* Language Switcher */}
                <div className="flex flex-col space-y-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center">
                    <Globe className="w-3.5 h-3.5 mr-1.5" /> Language
                  </span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => { setLanguage('EN'); setIsOpen(false); }} 
                      className={`flex-1 text-xs font-bold py-2.5 rounded-xl border transition-all ${language === 'EN' ? 'bg-accentViolet text-white border-accentViolet shadow-sm shadow-accentViolet/10' : 'text-slate-500 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'}`}
                    >
                      English
                    </button>
                    <button 
                      onClick={() => { setLanguage('GJ'); setIsOpen(false); }} 
                      className={`flex-1 text-xs font-bold py-2.5 rounded-xl border transition-all ${language === 'GJ' ? 'bg-accentViolet text-white border-accentViolet shadow-sm shadow-accentViolet/10' : 'text-slate-500 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'}`}
                    >
                      ગુજરાતી
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Link 
                  href="/login" 
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold block text-sm tracking-wide hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  {t('authLoginBtn')}
                </Link>

                {/* Admission Button */}
                <a 
                  href="#admission" 
                  onClick={() => setIsOpen(false)}
                  className="bg-gradient-to-r from-accentViolet to-accentCyan text-white font-bold text-center py-3.5 rounded-xl block shadow-md shadow-accentViolet/10 text-sm tracking-wide"
                >
                  {t('navAdmission')}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
