'use client';

import { useState } from 'react';
import SectionHeading from '../ui/SectionHeading';
import GlassCard from '../ui/GlassCard';
import { MapPin, Phone, Mail, Navigation } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Contact() {
  const { language, t } = useLanguage();
  const [mapActive, setMapActive] = useState(false);

  return (
    <section id="contact" className="relative py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <SectionHeading 
          title={t('contactTitle')} 
          subtitle={t('contactSubtitle')}
        />

        <div className="grid lg:grid-cols-2 gap-12 mt-16 items-start">
          
          {/* Contact Details Cards */}
          <div className="space-y-6">
            <GlassCard className="p-6 border border-slate-200 dark:border-slate-800 border-l-4 border-l-accentViolet bg-white/80 dark:bg-slate-950/40 shadow-md dark:shadow-none hover:border-accentViolet/30 transition-all duration-300" delay={0} hoverGlow={false}>
              <div className="flex items-start">
                <MapPin className="text-accentViolet mr-3.5 shrink-0 mt-1" size={24} />
                <div className="flex-grow">
                  <p className="text-slate-850 dark:text-slate-100 font-extrabold text-base sm:text-lg leading-snug mb-2">
                    {t('contactLocDesc')}
                  </p>
                  <a 
                    href="https://maps.app.goo.gl/8mbaXz4kcm9KJocp6" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-accentViolet hover:text-accentCyan transition-colors font-bold tracking-wide"
                  >
                    {t('contactLocLink')} <Navigation className="ml-1.5 w-4 h-4" />
                  </a>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border border-slate-200 dark:border-slate-800 border-l-4 border-l-orange-500 bg-white/80 dark:bg-slate-950/40 shadow-md dark:shadow-none hover:border-orange-500/30 transition-all duration-300" delay={0.2} hoverGlow={false}>
              <div className="flex items-center">
                <Phone className="text-orange-400 mr-3.5 shrink-0" size={24} />
                <div className="flex-grow">
                  <a href="tel:+919228174188" className="inline-block py-1 text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 transition-opacity">
                    +91 92281 74188
                  </a>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border border-slate-200 dark:border-slate-800 border-l-4 border-l-accentCyan bg-white/80 dark:bg-slate-950/40 shadow-md dark:shadow-none hover:border-accentCyan/30 transition-all duration-300" delay={0.4} hoverGlow={false}>
              <div className="flex items-center">
                <Mail className="text-accentCyan mr-3.5 shrink-0" size={24} />
                <div className="flex-grow">
                  <a href="mailto:vinayaktuitionclasses76@gmail.com" className="text-base sm:text-lg text-slate-850 dark:text-slate-200 hover:text-accentCyan transition-colors font-extrabold">
                    vinayaktuitionclasses76@gmail.com
                  </a>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Google Maps Embed with Scroll Lock */}
          <div className="h-full min-h-[400px]">
            <GlassCard className="w-full h-full p-2 bg-white/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-none" delay={0.3} hoverGlow={false}>
              <div 
                className="relative w-full h-full rounded-xl overflow-hidden group cursor-pointer"
                onClick={() => setMapActive(true)}
                onMouseLeave={() => setMapActive(false)}
              >
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3667.15456201594!2d72.484111!3d23.247981!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395c259edfae65af%3A0x467808bcd7514c44!2sVinayak%20Tuition%20Classes!5e0!3m2!1sen!2sin!4v1717336000000!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, borderRadius: '0.75rem', minHeight: '400px' }} 
                  className={`transition-all duration-350 ${mapActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                
                {!mapActive && (
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none group-hover:bg-slate-950/30 transition-all duration-300 md:hidden">
                    <div className="bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white font-extrabold px-5 py-2.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 text-sm pointer-events-auto cursor-pointer transition-transform hover:scale-105 active:scale-95">
                      {language === 'EN' ? 'Tap to Interact with Map' : 'નકશો વાપરવા માટે ટેપ કરો'}
                    </div>
                  </div>
                )}

                {mapActive && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setMapActive(false); }}
                    className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white font-extrabold px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-800 text-xs z-20 hover:scale-105 active:scale-95 transition-transform md:hidden"
                  >
                    {language === 'EN' ? 'Lock Map' : 'નકશો લોક કરો'}
                  </button>
                )}
              </div>
            </GlassCard>
          </div>

        </div>
      </div>

    </section>
  );
}
