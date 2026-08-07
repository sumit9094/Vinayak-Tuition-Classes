'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverGlow?: boolean;
}

export default function GlassCard({ children, className, delay = 0, hoverGlow = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className={cn(
        "glass-card rounded-2xl p-6 relative overflow-hidden group transition-all duration-500",
        hoverGlow && "hover:border-accentViolet/30 hover:-translate-y-2 hover:scale-[1.01]",
        className
      )}
    >
      {/* GPU-composited shadow hover layer to avoid expensive main-thread box-shadow animation */}
      {hoverGlow && (
        <div className="absolute inset-0 rounded-2xl shadow-[0_20px_50px_rgba(124,58,237,0.15)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
      {hoverGlow && (
        <div className="absolute inset-0 bg-gradient-to-br from-accentViolet/5 to-accentCyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
