'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Languages, LineChart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function WhyChooseUs() {
  const { language } = useLanguage();
  const isGj = language === 'GJ';

  const features = [
    {
      icon: GraduationCap,
      color: 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20',
      titleEN: 'Experienced Faculty',
      titleGJ: 'અનુભવી શિક્ષકો',
      descEN: 'Qualified teachers with deep subject expertise and years of proven teaching methodology.',
      descGJ: 'વિષયના ગહન જ્ઞાન અને અનુભવ સાથે લાયક શિક્ષકોનું સચોટ માર્ગદર્શન.',
    },
    {
      icon: Users,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      titleEN: 'Personalized Small Batches',
      titleGJ: 'નાની બેચ અને અંગત ધ્યાન',
      descEN: 'Small batch sizes to ensure individual attention and clear doubt resolution for every student.',
      descGJ: 'દરેક વિદ્યાર્થીને વ્યક્તિગત માર્ગદર્શન અને પ્રશ્નોના નિવારણ માટે મર્યાદિત સંખ્યા.',
    },
    {
      icon: Languages,
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      titleEN: 'Bilingual Instruction',
      titleGJ: 'અંગ્રેજી અને ગુજરાતી માધ્યમ',
      descEN: 'Dedicated English & Gujarati Medium batches tailored to respective curriculum requirements.',
      descGJ: 'અંગ્રેજી અને ગુજરાતી માધ્યમના વિદ્યાર્થીઓ માટે અલગ અનુકૂળ બેચ.',
    },
    {
      icon: LineChart,
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      titleEN: 'Result-Oriented Approach',
      titleGJ: 'પરિણામલક્ષી ટેસ્ટ સિસ્ટમ',
      descEN: 'Regular chapter-wise unit tests, performance analysis, and transparent parent reporting.',
      descGJ: 'નિયમિત પ્રકરણ મુજબ ટેસ્ટ, પ્રગતિ પત્રક અને વાલીઓ સાથે પારદર્શક સંવાદ.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-50/50 dark:bg-slate-950/40 border-y border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-6xl text-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 space-y-3"
        >
          <span className="text-[10px] font-black uppercase text-[#8B5CF6] tracking-[0.2em] bg-[#8B5CF6]/10 px-3.5 py-1 rounded-full border border-[#8B5CF6]/20">
            {isGj ? 'અમારા વિશિષ્ટ પાસાઓ' : 'Why Choose Vinayak'}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {isGj ? 'શા માટે વિનાયક ટ્યુશન ક્લાસીસ પસંદ કરશો?' : 'Building Strong Academic Foundations'}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {isGj
              ? 'અમે ધોરણ 1 થી 12 ના તમામ વિદ્યાર્થીઓને ગુણવત્તાયુક્ત શિક્ષણ આપીએ છીએ.'
              : 'Our systematic approach, experienced faculty, and disciplined environment empower students to excel.'}
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {features.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:border-[#8B5CF6]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`p-3.5 rounded-2xl border ${item.color} inline-block mb-4`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 leading-snug">
                    {isGj ? item.titleGJ : item.titleEN}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    {isGj ? item.descGJ : item.descEN}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
