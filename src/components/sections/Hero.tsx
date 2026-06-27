'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();
  
  const fullText = t('heroBadgeAdmission');
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset typewriter if language/fullText changes
  useEffect(() => {
    setTypedText('');
    setIsDeleting(false);
  }, [fullText]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const handleType = () => {
      if (!isDeleting) {
        if (typedText === fullText) {
          timer = setTimeout(() => setIsDeleting(true), 2000);
        } else {
          setTypedText(fullText.slice(0, typedText.length + 1));
        }
      } else {
        if (typedText === '') {
          setIsDeleting(false);
        } else {
          setTypedText(fullText.slice(0, typedText.length - 1));
        }
      }
    };

    const speed = isDeleting ? 40 : 100;
    
    if (typedText === fullText && !isDeleting) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (typedText === '' && isDeleting) {
      timer = setTimeout(() => setIsDeleting(false), 800);
    } else {
      timer = setTimeout(handleType, speed);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, fullText]);

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-16 lg:pt-28 lg:pb-0 bg-gradient-to-b from-slate-100 via-white to-slate-100 dark:from-darkObsidian dark:via-slate-950 dark:to-darkObsidian transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accentViolet/5 dark:bg-accentViolet/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accentCyan/5 dark:bg-accentCyan/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-accentViolet/5 dark:bg-accentViolet/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">
        
        {/* Left Content */}
        <div className="text-left w-full lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center bg-white/65 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 sm:px-5 sm:py-2 mb-3 lg:mb-6 shadow-md hover:border-accentViolet/30 transition-all duration-300">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentViolet to-accentCyan dark:from-indigo-300 dark:to-accentCyan text-[11px] sm:text-sm font-extrabold tracking-wider min-h-[20px] py-1 flex items-center select-none">
                {typedText}
                <span className="inline-block w-[3px] h-4 ml-1 bg-accentCyan dark:bg-indigo-300 animate-[pulse_0.8s_infinite] align-middle"></span>
              </span>
            </div>
          </motion.div>

          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-3 lg:mb-6 leading-tight text-slate-900 dark:text-white tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('heroTitlePart1')} <br />
            <span className="inline-block py-1 text-transparent bg-clip-text bg-gradient-to-r from-accentViolet via-indigo-400 to-accentCyan dark:via-indigo-200 drop-shadow-sm">{t('heroTitlePart2')}</span> <br />
            {t('heroTitlePart3')}
          </motion.h1>

          <motion.p 
            className="text-sm sm:text-base lg:text-xl text-slate-600 dark:text-slate-400 mb-5 lg:mb-10 max-w-lg font-medium leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('heroSubtitle')}
          </motion.p>

          <motion.div 
            className="flex flex-row space-x-3 sm:space-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a href="#admission" className="relative group overflow-hidden rounded-full p-[2px] shadow-lg hover:shadow-xl transition-shadow duration-300 flex-1 sm:flex-none">
              <span className="absolute inset-0 bg-gradient-to-r from-accentViolet to-accentCyan rounded-full animate-[spin_4s_linear_infinite]"></span>
              <div className="relative bg-white dark:bg-slate-950 px-3 py-2.5 sm:px-8 sm:py-4 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-transparent">
                <span className="text-accentViolet dark:text-white font-bold text-xs sm:text-base whitespace-nowrap tracking-wide">{t('heroJoinNow')}</span>
              </div>
            </a>
            
            <a href="#contact" className="relative group overflow-hidden rounded-full p-[2px] flex-1 sm:flex-none">
              <span className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2.5 sm:px-8 sm:py-4 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:bg-transparent">
                <span className="text-slate-700 dark:text-slate-200 group-hover:text-white font-bold text-xs sm:text-base whitespace-nowrap transition-colors">{t('heroContactUs')}</span>
              </div>
            </a>
          </motion.div>
        </div>

        <div className="relative block w-full lg:w-1/2 mt-2 mb-14 lg:my-0">
          <div className="relative w-full max-w-[550px] lg:aspect-square mx-auto flex items-center justify-center">
            
            {/* Glowing Studio Background */}
            <div className="absolute w-[80%] h-[80%] bg-gradient-radial from-accentViolet/30 via-accentCyan/10 to-transparent rounded-full blur-[80px] -z-10 animate-pulse"></div>
            
            {/* Large Decorative Circle */}
            <div className="absolute w-[70%] h-[70%] rounded-full border-2 border-dashed border-accentViolet/20 animate-[spin_60s_linear_infinite] -z-10"></div>
            
            {/* Main Student Image */}
            <motion.div 
              className="relative z-10 h-auto lg:h-[80%] w-auto flex items-center justify-center"
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
            >
              <img 
                src="/hero-main.jpg" 
                alt="Vinayak Tuition Classes" 
                className="w-auto h-auto max-h-[250px] sm:max-h-[400px] lg:max-h-[500px] max-w-[85%] sm:max-w-none rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl hover:scale-105 transition-transform duration-500"
              />
            </motion.div>

            {/* Floating Detail Cards surrounding the student */}
            
            {/* Card 6: Direct Call Banner */}
            <div className="absolute -bottom-14 sm:bottom-0 left-1/2 -translate-x-1/2 z-30 w-[95%] sm:w-[90%] max-w-[360px]">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full"
              >
                <a 
                  href="tel:+919228174188" 
                  className="flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-accentViolet to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-black py-3 px-4 sm:py-3.5 sm:px-6 rounded-2xl shadow-[0_15px_30px_rgba(15,139,253,0.3)] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-white/10 text-center text-sm sm:text-base tracking-wide whitespace-nowrap"
                >
                  <Phone size={18} className="fill-current animate-wiggle shrink-0" />
                  <span>{t('heroCardCall')}</span>
                </a>
              </motion.div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
