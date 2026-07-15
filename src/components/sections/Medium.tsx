'use client';

import SectionHeading from '../ui/SectionHeading';
import GlassCard from '../ui/GlassCard';
import { useLanguage } from '@/context/LanguageContext';

export default function Medium() {
  const { t } = useLanguage();

  return (
    <section className="relative py-24 bg-white dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      {/* Soft Wave Background Alternative using Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <SectionHeading 
          title={t('mediumTitle')} 
          subtitle={t('mediumSubtitle')}
        />

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto mt-16">
          
          {/* English Medium Card */}
          <div className="group relative perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-r from-accentViolet to-cyan-400 rounded-3xl blur-lg opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
            <GlassCard 
              className="relative h-full flex flex-col items-center justify-center text-center p-8 sm:p-14 transition-transform duration-500 group-hover:rotate-y-12 transform-style-3d border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:border-accentViolet/30 transition-all duration-300"
              hoverGlow={false}
            >
              <h3 className="text-4xl font-extrabold mb-4 py-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accentViolet to-cyan-500 drop-shadow-sm">{t('mediumEnglishTitle')}</h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-lg">
                {t('mediumEnglishDesc')}
              </p>
            </GlassCard>
          </div>

          {/* Gujarati Medium Card */}
          <div className="group relative perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-3xl blur-lg opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
            <GlassCard 
              className="relative h-full flex flex-col items-center justify-center text-center p-8 sm:p-14 transition-transform duration-500 group-hover:-rotate-y-12 transform-style-3d border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:border-orange-500/30 transition-all duration-300"
              hoverGlow={false}
              delay={0.2}
            >
              <h3 className="text-4xl font-extrabold mb-4 py-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400 drop-shadow-sm">{t('mediumGujaratiTitle')}</h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-lg">
                {t('mediumGujaratiDesc')}
              </p>
            </GlassCard>
          </div>

        </div>
      </div>
    </section>
  );
}
