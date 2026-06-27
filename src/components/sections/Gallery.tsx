'use client';

import SectionHeading from '../ui/SectionHeading';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function Gallery() {
  const { t } = useLanguage();

  const galleryItems = [
    { id: 1, title: t('galleryItemClassroom'), span: "md:col-span-2 md:row-span-2", bg: "bg-gradient-to-br from-accentViolet to-indigo-600" },
    { id: 2, title: t('galleryItemDoubt'), span: "col-span-1 row-span-1", bg: "bg-gradient-to-tr from-orange-500 to-amber-500" },
    { id: 3, title: t('galleryItemEvent'), span: "col-span-1 row-span-1", bg: "bg-gradient-to-bl from-accentViolet to-fuchsia-500" },
    { id: 4, title: t('galleryItemLibrary'), span: "col-span-1 row-span-1", bg: "bg-gradient-to-t from-accentCyan to-sky-500" },
    { id: 5, title: t('galleryItemStudy'), span: "col-span-1 row-span-1", bg: "bg-gradient-to-b from-emerald-500 to-teal-600" },
  ];

  return (
    <section id="gallery" className="relative py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <SectionHeading 
          title={t('galleryTitle')} 
          subtitle={t('gallerySubtitle')}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 h-[600px] mt-16 p-4 bg-white/80 dark:bg-slate-950/40 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-none backdrop-blur-sm">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm ${item.span} ${item.bg}`}
            >
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors duration-500"></div>
              
              {/* Pattern placeholder */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]"></div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>
              
              <div className="absolute bottom-0 left-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="w-10 h-1 bg-white rounded-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"></div>
                <h3 className="text-xl font-bold text-white drop-shadow-md">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
