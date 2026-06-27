'use client';

import SectionHeading from '../ui/SectionHeading';
import GlassCard from '../ui/GlassCard';
import { BookOpen, Calculator, LineChart, Briefcase, Languages } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Courses() {
  const { t } = useLanguage();

  const courses = [
    {
      title: t('coursesPrimaryTitle'),
      subtitle: t('coursesPrimarySub'),
      description: t('coursesPrimaryDesc'),
      icon: BookOpen,
      color: "text-accentViolet",
      bgColor: "bg-accentViolet/20",
      border: "group-hover:border-accentViolet/30"
    },
    {
      title: t('coursesSecondaryTitle'),
      subtitle: t('coursesSecondarySub'),
      description: t('coursesSecondaryDesc'),
      icon: Calculator,
      color: "text-accentCyan",
      bgColor: "bg-accentCyan/20",
      border: "group-hover:border-accentCyan/30"
    },
    {
      title: t('coursesHigherTitle'),
      subtitle: t('coursesHigherSub'),
      description: t('coursesHigherDesc'),
      icon: LineChart,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      border: "group-hover:border-orange-500/30"
    }
  ];

  const subjects = [
    { name: t('subjectAccounts'), icon: Calculator },
    { name: t('subjectStatistics'), icon: LineChart },
    { name: t('subjectEconomics'), icon: Briefcase },
    { name: t('subjectEnglish'), icon: Languages },
    { name: t('subjectMaths'), icon: Calculator },
  ];

  return (
    <section id="courses" className="relative py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <SectionHeading 
          title={t('coursesTitle')} 
          subtitle={t('coursesSubtitle')}
        />

        <div className="grid md:grid-cols-3 gap-8 mb-20 mt-16">
          {courses.map((course, index) => (
            <GlassCard key={index} delay={index * 0.2} className={`transition-all duration-300 ${course.border} bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-none`}>
              <div className={`mb-6 p-4 rounded-2xl ${course.bgColor} inline-block ${course.color} shadow-sm`}>
                <course.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{course.title}</h3>
              <p className={`text-sm font-bold ${course.color} mb-4 tracking-wider uppercase`}>{course.subtitle}</p>
              <p className="text-slate-655 dark:text-slate-400 font-medium leading-relaxed">{course.description}</p>
            </GlassCard>
          ))}
        </div>

        {/* Subjects specialized area */}
        <div className="mt-16 text-center bg-white dark:bg-slate-950/50 rounded-3xl p-10 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800/80 max-w-4xl mx-auto backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">{t('coursesSpecializedTitle')}</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {subjects.map((subject, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 py-3 px-6 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-accentViolet/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-default group shadow-sm"
              >
                <subject.icon size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-accentViolet transition-colors" />
                <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-accentViolet transition-colors">{subject.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
