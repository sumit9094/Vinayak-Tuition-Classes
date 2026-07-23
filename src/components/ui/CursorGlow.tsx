'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CursorGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    // Disable entirely on touch devices / coarse pointers to save WebKit main-thread resources
    const hoverMediaQuery = window.matchMedia('(hover: hover)');
    const touchMediaQuery = window.matchMedia('(pointer: coarse)');

    if (!hoverMediaQuery.matches || touchMediaQuery.matches) {
      setIsTouchDevice(true);
      return;
    }

    setIsTouchDevice(false);

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  if (isTouchDevice || (mousePosition.x === 0 && mousePosition.y === 0)) {
    return null;
  }

  return (
    <motion.div
      className="hidden md:block fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none z-[-1]"
      style={{
        background: 'radial-gradient(circle at center, rgba(139,92,246,0.12) 0%, rgba(6,182,212,0.06) 45%, transparent 70%)'
      }}
      animate={{
        x: mousePosition.x - 250,
        y: mousePosition.y - 250,
      }}
      transition={{ type: 'tween', ease: 'backOut', duration: 0.8 }}
    />
  );
}
