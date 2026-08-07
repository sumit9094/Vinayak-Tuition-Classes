'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface SuccessOverlayProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function SuccessOverlay({ message, onClose, duration = 2500 }: SuccessOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <motion.div
      key="success-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      aria-live="polite"
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative z-10 flex flex-col items-center gap-4 bg-white dark:bg-slate-900 rounded-3xl px-10 py-8 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer"
        onClick={onClose}
        role="alertdialog"
        aria-label={message}
      >
        {/* Animated tick circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 18, delay: 0.2 }}
          >
            <CheckCircle2 className="w-9 h-9 text-emerald-500" strokeWidth={2.5} />
          </motion.div>
        </motion.div>

        <div className="text-center space-y-1">
          <p className="text-base font-black text-slate-900 dark:text-white">{message}</p>
          <p className="text-[11px] font-semibold text-slate-400">Tap anywhere to dismiss</p>
        </div>

        {/* Auto-dismiss progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-emerald-500 rounded-b-3xl"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      </motion.div>
    </motion.div>
  );
}
