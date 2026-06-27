'use client';

import SectionHeading from '../ui/SectionHeading';
import GlassCard from '../ui/GlassCard';
import { Award, Target, Users, BookOpen, Clock, Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function WhyChooseUs() {
  const { t } = useLanguage();

  const features = [
    { title: t('whyF1'), icon: Award, color: "text-accentViolet", bg: "bg-accentViolet/20" },
    { title: t('whyF2'), icon: Heart, color: "text-rose-400", bg: "bg-rose-500/20" },
    { title: t('whyF3'), icon: Target, color: "text-orange-400", bg: "bg-orange-500/20" },
    { title: t('whyF4'), icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/20" },
    { title: t('whyF5'), icon: Clock, color: "text-purple-400", bg: "bg-purple-500/20" },
    { title: t('whyF6'), icon: BookOpen, color: "text-accentCyan", bg: "bg-accentCyan/20" },
  ];

  return (
    <section id="why-choose-us" className="relative py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <SectionHeading 
          title={t('whyTitle')} 
          subtitle={t('whySubtitle')}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {features.map((feature, index) => (
            <GlassCard 
              key={index} 
              delay={index * 0.1}
              className="flex items-center space-x-5 group cursor-default bg-white/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-none"
              hoverGlow={true}
            >
              <div className={`p-4 rounded-2xl ${feature.bg} transition-colors ${feature.color} shrink-0`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-accentViolet transition-colors">
                {feature.title}
              </h3>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
