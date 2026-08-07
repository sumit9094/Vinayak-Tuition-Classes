'use client';

import Link from 'next/link';
import { Home, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-darkObsidian text-slate-900 dark:text-white p-6 transition-colors duration-300">
      {/* Glow Effect */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none -z-0"
        style={{ background: 'radial-gradient(circle at center, rgba(139,92,246,0.15) 0%, transparent 70%)' }}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6"
      >
        {/* Brand Logo & Icon Badge */}
        <div className="flex flex-col items-center space-y-3">
          <img 
            src="/logo.png" 
            alt="Vinayak Tuition Classes" 
            className="w-16 h-16 object-contain rounded-2xl shadow-md"
          />
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>404 — Page Not Found</span>
          </div>
        </div>

        {/* 404 Heading & Description */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            404
          </h1>
          <h2 className="text-base font-extrabold text-slate-700 dark:text-slate-300">
            પેજ મળ્યું નથી / Page Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            The page you are looking for might have been moved, deleted, or does not exist. Please return to the homepage.
          </p>
        </div>

        {/* Home Redirection Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-purple-600 hover:from-purple-600 hover:to-[#8B5CF6] text-white text-xs font-black shadow-lg shadow-[#8B5CF6]/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Homepage</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
