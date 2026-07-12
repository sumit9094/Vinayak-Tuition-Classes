'use client';

import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function GalleryPage() {
  const { t } = useLanguage();

  // You can add your actual image paths here
  const images = [
    '/gallery/V 1.jpeg',
    '/gallery/V 2.jpeg',
    '/gallery/V 3.jpeg',
    '/gallery/V 4.jpeg',
    '/gallery/V 5.jpg',
    '/gallery/V 6.jpg',
    '/gallery/V 7.jpg',
    '/gallery/V 8.jpg',
    '/gallery/V 9.jpg',
    '/gallery/V 10.jpg',
    '/gallery/V 11.jpg',
    '/gallery/V 12.jpg',
  ];

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50 dark:bg-darkObsidian">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            {t('galleryTitle')}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('gallerySubtitle')}
          </p>
        </motion.div>

        {images.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map((img, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden rounded-2xl shadow-lg group bg-slate-100 dark:bg-slate-800 break-inside-avoid"
              >
                <Image 
                  src={img} 
                  alt={`Gallery Image ${index + 1}`} 
                  width={400}
                  height={300}
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Gallery is Empty</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center">
              Please add your images to the <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">public/gallery</code> folder.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
