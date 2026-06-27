'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  const quickLinks = [
    { name: t('navHome'), href: '/#home' },
    { name: t('navAbout'), href: '/#about-us' },
    { name: t('navCourses'), href: '/#courses' },
    { name: t('navContact'), href: '/#contact' },
  ];

  return (
    <footer className="relative bg-white dark:bg-slate-950 pt-16 pb-8 border-t border-slate-200 dark:border-slate-800/80 overflow-hidden">
      {/* Animated Gradient Line */}
      <motion.div 
        className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-accentViolet via-accentCyan to-accentViolet w-full opacity-80"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 5, ease: "linear", repeat: Infinity }}
        style={{ backgroundSize: '200% 200%' }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-extrabold mb-3 py-1 bg-clip-text text-transparent bg-gradient-to-r from-accentViolet via-slate-800 to-accentCyan dark:via-white">
              Vinayak Tuition Classes
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed font-medium">
              {t('footerBrandDesc')}
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=100007169921798" target="_blank" rel="noopener noreferrer" className="h-10 px-4 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-accentViolet/20 transition-all text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm hover:shadow-md space-x-2">
                <Facebook size={20} />
                <span className="text-sm font-medium">Facebook</span>
              </a>
              <a href="https://www.instagram.com/vinayak_tuition_kalol?igsh=MXF6Z3V0dGpraW12dQ==" target="_blank" rel="noopener noreferrer" className="h-10 px-4 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-accentViolet/20 transition-all text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm hover:shadow-md space-x-2">
                <Instagram size={20} />
                <span className="text-sm font-medium hidden sm:inline-block">@vinayak_tuition_kalol</span>
                <span className="text-sm font-medium sm:hidden">Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">{t('footerQuickLinks')}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-slate-600 dark:text-slate-400 hover:text-accentViolet dark:hover:text-accentViolet transition-colors flex items-center group font-medium">
                    <span className="w-2 h-2 rounded-full bg-accentViolet mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">{t('footerContactUs')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start text-slate-600 dark:text-slate-400 font-medium">
                <MapPin className="mr-3 text-accentViolet shrink-0 mt-1" size={20} />
                <span>{t('footerAddress')}</span>
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-400 font-medium">
                <Phone className="mr-3 text-accentCyan shrink-0" size={20} />
                <span>+91 92281 74188</span>
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-400 font-medium">
                <Mail className="mr-3 text-accentViolet shrink-0" size={20} />
                <span>vinayaktuitionclasses76@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-200 dark:border-slate-850 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} Vinayak Tuition Classes. {t('footerCopyright')}</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-accentViolet dark:hover:text-accentViolet transition-colors">{t('footerPrivacy')}</a>
            <a href="#" className="hover:text-accentViolet dark:hover:text-accentViolet transition-colors">{t('footerTerms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
