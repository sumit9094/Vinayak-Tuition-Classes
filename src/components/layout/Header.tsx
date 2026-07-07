'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe, Menu, X, Sun, Moon, User, Download, Share } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'other'>('other');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Check if already installed / running in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
      
      if (isStandalone) {
        setShowInstallBtn(false);
        return;
      } else {
        // Show install button by default on mount if not standalone
        setShowInstallBtn(true);
      }

      // 2. Handler for beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallBtn(true);
      };

      // 3. Handler for appinstalled event
      const handleAppInstalled = () => {
        setDeferredPrompt(null);
        setShowInstallBtn(false);
        console.log('Vinayak Tuition PWA installed successfully');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      // 4. Platform check for custom guide
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setPlatform(isIOS ? 'ios' : 'other');

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA prompt outcome: ${outcome}`);
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBtn(false);
      }
    } else {
      setShowModal(true);
    }
  };

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

          {/* Install App Button for Desktop */}
          {showInstallBtn && (
            <button
              onClick={handleInstallClick}
              className="p-2 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors focus:outline-none flex items-center justify-center shadow-sm"
              aria-label="Install App"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

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

          {/* Install App Button for Mobile */}
          {showInstallBtn && (
            <button
              onClick={handleInstallClick}
              className="p-1.5 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors focus:outline-none flex items-center justify-center shadow-sm"
              aria-label="Install App"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

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

      {/* iOS Installation Instructions Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden z-10"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="text-center space-y-4">
                {/* Icon */}
                <div className="w-12 h-12 bg-[#3B82F6]/10 text-[#3B82F6] rounded-full flex items-center justify-center mx-auto border border-[#3B82F6]/20">
                  <Download className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {language === 'EN' ? 'Install Vinayak Tuition' : 'વિનાયક ટ્યુશન ડાઉનલોડ કરો'}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-405 font-medium leading-relaxed">
                  {language === 'EN' 
                    ? 'Add this application to your home screen for quick access and offline features.'
                    : 'ઝડપી ઍક્સેસ અને ઑફલાઇન વિશેષતાઓ માટે આ એપ્લિકેશનને તમારા હોમ સ્ક્રીન પર ઉમેરો.'}
                </p>

                {/* Step instructions */}
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-900 rounded-2xl p-4 text-left space-y-3">
                  {platform === 'ios' ? (
                    <>
                      <div className="flex items-start space-x-3 text-xs font-semibold text-slate-700 dark:text-slate-350">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#3B82F6] text-white text-[10px] font-black shrink-0 mt-0.5">
                          1
                        </div>
                        <p className="leading-5">
                          {language === 'EN' 
                            ? 'Tap the Share button at the bottom of Safari.' 
                            : 'સફારી બ્રાઉઝરના તળિયે આપેલ શેર આઇકોન પર ટેપ કરો.'}
                          <span className="inline-flex items-center align-middle ml-1.5 p-1 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded shadow-sm text-slate-550 dark:text-slate-400">
                            <Share className="w-3.5 h-3.5" />
                          </span>
                        </p>
                      </div>

                      <div className="flex items-start space-x-3 text-xs font-semibold text-slate-700 dark:text-slate-355">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#3B82F6] text-white text-[10px] font-black shrink-0 mt-0.5">
                          2
                        </div>
                        <p className="leading-5">
                          {language === 'EN' 
                            ? 'Scroll down and select "Add to Home Screen".' 
                            : 'નીચે સ્ક્રોલ કરો અને "Add to Home Screen" પસંદ કરો.'}
                        </p>
                      </div>

                      <div className="flex items-start space-x-3 text-xs font-semibold text-slate-700 dark:text-slate-355">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#3B82F6] text-white text-[10px] font-black shrink-0 mt-0.5">
                          3
                        </div>
                        <p className="leading-5">
                          {language === 'EN' 
                            ? 'Tap "Add" in the top-right corner to complete.' 
                            : 'પૂર્ણ કરવા માટે ઉપર જમણા ખૂણામાં "Add" પર ટેપ કરો.'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start space-x-3 text-xs font-semibold text-slate-700 dark:text-slate-355">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#3B82F6] text-white text-[10px] font-black shrink-0 mt-0.5">
                          A
                        </div>
                        <div className="leading-5">
                          <strong className="text-slate-900 dark:text-white">{language === 'EN' ? 'On Mobile:' : 'મોબાઇલ પર:'}</strong>
                          <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                            {language === 'EN' 
                              ? 'Tap the browser menu icon (3 dots) and select "Install app" or "Add to Home screen".'
                              : 'બ્રાઉઝર મેનૂ આઇકોન (3 બિંદુઓ) પર ટેપ કરો અને "Install app" અથવા "Add to Home screen" પસંદ કરો.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 text-xs font-semibold text-slate-700 dark:text-slate-355">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#3B82F6] text-white text-[10px] font-black shrink-0 mt-0.5">
                          B
                        </div>
                        <div className="leading-5">
                          <strong className="text-slate-900 dark:text-white">{language === 'EN' ? 'On Desktop:' : 'ડેસ્કટોપ પર:'}</strong>
                          <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                            {language === 'EN' 
                              ? 'Click the install icon (monitor with down arrow) inside the browser address bar at the top-right.'
                              : 'જમણી બાજુએ બ્રાઉઝર સરનામાં બારની અંદર ઇન્સ્ટોલ આઇકોન (મોનિટર અને ડાઉન એરો) પર ક્લિક કરો.'}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.98] outline-none"
                >
                  {language === 'EN' ? 'Got It' : 'સમજાઈ ગયું'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
