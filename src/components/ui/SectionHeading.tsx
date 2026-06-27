'use client';

import { motion } from 'framer-motion';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export default function SectionHeading({ title, subtitle, align = 'center' }: SectionHeadingProps) {
  return (
    <div className={`mb-16 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-5xl font-extrabold mb-2 py-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-accentViolet to-slate-950 dark:from-white dark:via-indigo-200 dark:to-cyan-200 tracking-tight"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`flex flex-col ${align === 'center' ? 'items-center justify-center' : 'items-start'} gap-4`}
        >
          <div className="h-1 w-24 bg-gradient-to-r from-accentViolet to-accentCyan rounded-full opacity-80"></div>
          <p className="text-slate-655 dark:text-slate-400 max-w-2xl text-lg font-medium leading-relaxed">
            {subtitle}
          </p>
        </motion.div>
      )}
    </div>
  );
}
