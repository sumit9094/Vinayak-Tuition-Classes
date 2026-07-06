'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Users, BookOpen, UserCheck, Calendar, Clock, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  const mockStats = [
    {
      label: 'Total Students',
      value: '48',
      desc: 'English & Gujarati Mediums',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    {
      label: 'Active Batches',
      value: '6',
      desc: 'Std. 1 to 12 Commerce',
      icon: BookOpen,
      color: 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20',
    },
    {
      label: 'Tuition Faculty',
      value: '3',
      desc: 'Experienced Educators',
      icon: UserCheck,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    },
  ];

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl flex-grow flex flex-col justify-center">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-left"
      >
        <span className="text-xs font-black uppercase text-[#8B5CF6] tracking-[0.2em] bg-[#8B5CF6]/10 px-3 py-1 rounded-full border border-[#8B5CF6]/20">
          Control Panel
        </span>
        <h1 className="text-3xl sm:text-4xl font-black mt-3 tracking-tight">
          Hello, {user?.name || 'Administrator'}!
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
          {t('authDashboardDesc')}
        </p>
      </motion.div>

      {/* Mock Stats Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-3 gap-6 mb-10"
      >
        {mockStats.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md flex items-center justify-between shadow-sm"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {stat.label}
              </span>
              <span className="text-3xl font-black tracking-tight block text-slate-900 dark:text-white">
                {stat.value}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-550 block">
                {stat.desc}
              </span>
            </div>
            <div className={`p-3 rounded-xl border ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Announcement Callout */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-3xl p-8 sm:p-12 border border-[#8B5CF6]/25 dark:border-[#8B5CF6]/15 bg-gradient-to-br from-[#8B5CF6]/5 via-transparent to-accentCyan/5 relative overflow-hidden shadow-lg"
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/5 rounded-full mix-blend-screen filter blur-[80px] pointer-events-none"></div>

        <div className="max-w-2xl text-left relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Construction</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('authDashboardComingSoon')}
          </h2>

          <p className="text-slate-600 dark:text-slate-405 leading-relaxed text-sm font-medium">
            We are designing a robust dashboard for managing students, grading, fee notifications, and classroom schedules. Soon you will be able to manage classroom databases and review student application metrics in real-time.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4 text-[#8B5CF6]" />
              <span>Schedules & Batches</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <BarChart3 className="w-4 h-4 text-accentCyan" />
              <span>Analytical Reports</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
