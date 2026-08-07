'use client';

import { motion } from 'framer-motion';
import SectionHeading from '../ui/SectionHeading';
import GlassCard from '../ui/GlassCard';
import { Award, BookOpen, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Faculties() {
  const { t } = useLanguage();

  const faculties = [
    {
      name: t('facArvindName'),
      role: t('facArvindRole'),
      experience: t('facArvindExp'),
      subject: t('facArvindSub'),
      imagePlaceholder: "bg-gradient-to-tr from-accentViolet to-indigo-500"
    },
    {
      name: t('facMeenaName'),
      role: t('facMeenaRole'),
      experience: t('facMeenaExp'),
      subject: t('facMeenaSub'),
      imagePlaceholder: "bg-gradient-to-tr from-orange-500 to-amber-400"
    },
    {
      name: t('facRajeshName'),
      role: t('facRajeshRole'),
      experience: t('facRajeshExp'),
      subject: t('facRajeshSub'),
      imagePlaceholder: "bg-gradient-to-tr from-accentCyan to-blue-450"
    }
  ];

  return (
    <section id="faculties" className="relative py-24 bg-white dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <SectionHeading 
          title={t('facultiesTitle')} 
          subtitle={t('facultiesSubtitle')}
        />

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {faculties.map((faculty, index) => (
            <GlassCard key={index} delay={index * 0.2} className="text-center group overflow-hidden bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-none">
              {/* Image Placeholder */}
              <div className="relative w-32 h-32 mx-auto mb-6 rounded-full p-1 bg-slate-100 dark:bg-slate-900 group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800">
                <div className={`w-full h-full rounded-full ${faculty.imagePlaceholder} flex items-center justify-center shadow-inner`}>
                   <GraduationCap className="w-12 h-12 text-white drop-shadow-sm" />
                </div>
                
                {/* Floating badge */}
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 rounded-full p-2 border border-slate-200 dark:border-slate-800 shadow-lg">
                  <Award className="w-5 h-5 text-accentViolet" />
                </div>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{faculty.name}</h3>
              <p className="text-brandBlue dark:text-accentCyan font-bold tracking-wide mb-1">{faculty.role}</p>
              
              <div className="flex flex-col items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-855">
                <div className="flex items-center text-slate-700 dark:text-slate-300 font-medium text-sm">
                   <BookOpen className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
                   {faculty.subject}
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider bg-slate-100 dark:bg-slate-900 py-1.5 px-3 rounded-full border border-slate-200 dark:border-slate-800">
                  {faculty.experience}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
