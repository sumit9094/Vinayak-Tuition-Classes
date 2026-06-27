'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CursorGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return (
    <motion.div
      className="hidden md:block fixed top-0 left-0 w-[500px] h-[500px] bg-gradient-to-r from-accentViolet/10 to-accentCyan/10 rounded-full blur-[130px] pointer-events-none z-[-1]"
      animate={{
        x: mousePosition.x - 250,
        y: mousePosition.y - 250,
      }}
      transition={{ type: 'tween', ease: 'backOut', duration: 0.8 }}
    />
  );
}
