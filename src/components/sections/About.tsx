'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeading from '../ui/SectionHeading';
import GlassCard from '../ui/GlassCard';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function About() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const slides = ['/img/std-12-2025.jpeg', '/img/std-10-2025.jpeg'];

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <section id="about-us" className="relative py-24 bg-white dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <SectionHeading 
          title={t('aboutTitle')} 
          subtitle={t('aboutSubtitle')}
        />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center mt-16">
          
          {/* Left: Animated Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-extrabold mb-6 text-slate-900 dark:text-white tracking-tight">
              {t('aboutHeading')}
            </h3>
            <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed text-lg font-medium">
              <p>{t('aboutP1')}</p>
              <p>{t('aboutP2')}</p>
              <p>{t('aboutP3')}</p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-6">
              <div className="border-l-4 border-accentViolet pl-4 py-1">
                <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">100%</h4>
                <p className="text-sm text-slate-500 font-semibold tracking-wide uppercase">{t('aboutBadgeCommitment')}</p>
              </div>
              <div className="border-l-4 border-accentCyan pl-4 py-1">
                <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">Top</h4>
                <p className="text-sm text-slate-500 font-semibold tracking-wide uppercase">{t('aboutBadgeResults')}</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Our Results Carousel Frame */}
          <div className="relative mt-12 lg:mt-0 flex justify-center">
            <GlassCard className="w-full max-w-[480px] aspect-[3/4] p-4 bg-white/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none" delay={0.2} hoverGlow={false}>
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900/60 flex flex-col border border-slate-200/50 dark:border-slate-800/50">
                {/* Frame Header */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10 relative">
                  <span className="font-black text-xs tracking-wider text-slate-800 dark:text-slate-250 uppercase">Our Academic Toppers</span>
                  <div className="flex space-x-1.5">
                    {slides.map((_, idx) => (
                      <span 
                        key={idx} 
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-accentViolet w-4' : 'bg-slate-300 dark:bg-slate-700'}`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Slides Container */}
                <div className="relative flex-grow w-full overflow-hidden flex items-center justify-center p-4">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={currentSlide}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                      }}
                      className="absolute inset-0 p-4 flex items-center justify-center"
                    >
                      <Image 
                        src={slides[currentSlide]} 
                        alt="Vinayak Tuition Academic Achievements" 
                        width={600}
                        height={450}
                        className="max-w-full max-h-full object-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-md"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <button
                    onClick={() => {
                      setDirection(-1);
                      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
                    }}
                    className="absolute left-4 z-20 p-2 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 hover:scale-105 active:scale-95 transition-all shadow-md"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setDirection(1);
                      setCurrentSlide((prev) => (prev + 1) % slides.length);
                    }}
                    className="absolute right-4 z-20 p-2 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 hover:scale-105 active:scale-95 transition-all shadow-md"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* Decorative blob (blur-free CSS radial gradient for WebKit performance) */}
            <div 
              className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle at center, rgba(139,92,246,0.08) 0%, transparent 70%)' }}
            ></div>
          </div>

        </div>
      </div>
    </section>
  );
}
