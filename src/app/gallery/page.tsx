'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ImageIcon, 
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';

interface GalleryImageItem {
  _id: string;
  imageUrl: string;
  category: 'classroom' | 'events' | 'achievements' | 'facility';
  caption?: string;
  createdAt?: string;
}

export default function GalleryPage() {
  const { language } = useLanguage();

  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = [
    { key: 'All', labelEN: 'All Photos', labelGJ: 'તમામ તસવીરો' },
    { key: 'classroom', labelEN: 'Classroom', labelGJ: 'ક્લાસરૂમ' },
    { key: 'events', labelEN: 'Events', labelGJ: 'કાર્યક્રમો' },
    { key: 'achievements', labelEN: 'Achievements', labelGJ: 'સિદ્ધિઓ' },
    { key: 'facility', labelEN: 'Facility', labelGJ: 'સુવિધાઓ' },
  ];

  // Fetch images from API
  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
      }
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Filtered images list
  const filteredImages = images.filter((img) => {
    if (activeCategory === 'All') return true;
    return img.category === activeCategory.toLowerCase();
  });

  // Lightbox Navigation
  const handlePrev = useCallback(() => {
    if (lightboxIndex === null || filteredImages.length === 0) return;
    setLightboxIndex((prev) => (prev! === 0 ? filteredImages.length - 1 : prev! - 1));
  }, [lightboxIndex, filteredImages.length]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null || filteredImages.length === 0) return;
    setLightboxIndex((prev) => (prev! === filteredImages.length - 1 ? 0 : prev! + 1));
  }, [lightboxIndex, filteredImages.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handlePrev, handleNext]);

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50 dark:bg-darkObsidian text-left">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center space-x-1.5 text-[10px] font-black uppercase text-[#8B5CF6] tracking-[0.2em] bg-[#8B5CF6]/10 px-3.5 py-1.5 rounded-full border border-[#8B5CF6]/20 mb-3">
            <Sparkles className="w-3 h-3 text-[#8B5CF6]" />
            <span>{language === 'EN' ? 'Campus Memories & Moments' : 'કેમ્પસ યાદો અને વિશેષ ક્ષણો'}</span>
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            {language === 'EN' ? 'Photo Gallery' : 'ફોટો ગેલેરી'}
          </h1>
          <p className="text-sm md:text-base font-medium text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {language === 'EN' 
              ? 'Explore our interactive classroom sessions, annual celebrations, student rank achievements, and modern learning infrastructure.' 
              : 'અમારા ક્લાસરૂમ સત્રો, વાર્ષિક ઉત્સવો, વિદ્યાર્થીઓની શ્રેષ્ઠ સિદ્ધિઓ અને સવલતોની તસવીરો જુઓ.'}
          </p>
        </motion.div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-start md:justify-center space-x-2 overflow-x-auto pb-4 mb-10 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveCategory(cat.key);
                  setLightboxIndex(null);
                }}
                className={`px-4 py-2 rounded-full text-xs font-black capitalize transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/25 border border-[#8B5CF6]'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {language === 'EN' ? cat.labelEN : cat.labelGJ}
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B5CF6]"></div>
          </div>
        ) : filteredImages.length > 0 ? (
          /* Responsive Image Grid (2 cols mobile, 3-4 cols desktop) */
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredImages.map((img, idx) => (
              <motion.div
                key={img._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => setLightboxIndex(idx)}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Image Display */}
                <div className="relative h-48 sm:h-56 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  <img
                    src={img.imageUrl}
                    alt={img.caption || img.category}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Category Pill */}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                    {img.category}
                  </span>
                </div>

                {/* Caption / Footer */}
                {img.caption && (
                  <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-850">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {img.caption}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Graceful Empty State */
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center max-w-lg mx-auto p-8 shadow-sm">
            <div className="w-16 h-16 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-2xl flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
              {language === 'EN' ? 'Photos coming soon!' : 'તસવીરો ટૂંક સમયમાં આવી રહી છે!'}
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'EN' 
                ? 'Check back later for new photos in this category.' 
                : 'પાછળથી આ કેટેગરીમાં નવી તસવીરો જોવા માટે ફરી પાછા ચોક્કસ જુઓ.'}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredImages[lightboxIndex] && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxIndex(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute -top-12 right-0 sm:top-2 sm:right-2 p-2 rounded-full bg-black/60 text-white hover:bg-white hover:text-slate-900 transition-colors z-20 border border-white/20 cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Main Image View */}
              <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
                <img
                  src={filteredImages[lightboxIndex].imageUrl}
                  alt={filteredImages[lightboxIndex].caption || 'Gallery Image'}
                  className="max-h-[75vh] w-auto object-contain rounded-2xl"
                />

                {/* Left Arrow Button */}
                {filteredImages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="absolute left-3 p-3 rounded-full bg-black/60 text-white hover:bg-white hover:text-slate-900 transition-colors border border-white/20 cursor-pointer"
                    title="Previous Photo"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Right Arrow Button */}
                {filteredImages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-3 p-3 rounded-full bg-black/60 text-white hover:bg-white hover:text-slate-900 transition-colors border border-white/20 cursor-pointer"
                    title="Next Photo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Caption & Counter Footer */}
              <div className="mt-4 text-center space-y-1">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/20">
                  {filteredImages[lightboxIndex].category} ({lightboxIndex + 1} / {filteredImages.length})
                </span>
                {filteredImages[lightboxIndex].caption && (
                  <p className="text-sm font-bold text-white max-w-xl">
                    {filteredImages[lightboxIndex].caption}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
