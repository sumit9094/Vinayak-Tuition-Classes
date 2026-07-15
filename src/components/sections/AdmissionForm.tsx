'use client';

import { useState } from 'react';
import SectionHeading from '../ui/SectionHeading';
import GlassCard from '../ui/GlassCard';
import { Send, User, Phone, BookOpen, Languages, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function AdmissionForm() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    standard: '',
    medium: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const targetEmail = "crazyshorts.2027@gmail.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admission-enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          parentContact: formData.contact,
          standard: formData.standard,
          medium: formData.medium,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setFormData({ name: '', contact: '', standard: '', medium: '', message: '' });
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        const errData = await response.json();
        alert(errData.error || 'Submission failed. Please try again.');
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="admission" className="relative py-24 bg-white dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-accentViolet/5 rounded-full mix-blend-screen filter blur-[40px] -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <SectionHeading 
          title={t('admissionTitle')} 
          subtitle={t('admissionSubtitle')}
        />

        <div className="max-w-3xl mx-auto mt-16">
          <GlassCard className="p-8 sm:p-12 border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/40 shadow-md dark:shadow-none" delay={0.2} hoverGlow={false}>
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-650 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-500/30">
                  <Send size={32} />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{t('admissionSuccessTitle')}</h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium">{t('admissionSuccessDesc')}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2 relative group">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t('admissionLabelName')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-accentViolet transition-colors" />
                      </div>
                      <input 
                        required 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        type="text" 
                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-accentViolet focus:ring-2 focus:ring-accentViolet/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                        placeholder={t('admissionPlaceholderName')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t('admissionLabelContact')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-accentViolet transition-colors" />
                      </div>
                      <input 
                        required 
                        name="contact"
                        value={formData.contact}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) {
                            setFormData({ ...formData, contact: val });
                          }
                        }}
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit mobile number"
                        type="tel" 
                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-accentViolet focus:ring-2 focus:ring-accentViolet/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                        placeholder={t('admissionPlaceholderContact')}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t('admissionLabelStandard')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <BookOpen className="h-5 w-5 text-slate-400 group-focus-within:text-accentViolet transition-colors" />
                      </div>
                      <select 
                        required 
                        name="standard"
                        value={formData.standard}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-accentViolet focus:ring-2 focus:ring-accentViolet/20 transition-all appearance-none font-medium"
                      >
                        <option value="" disabled className="bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500">{t('admissionPlaceholderStandard')}</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(std => (
                          <option key={std} value={`Standard ${std}`} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
                            {t('admissionLabelStandard')} {std}
                          </option>
                        ))}
                        <option value="Std 11 Commerce" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{t('admissionOptionStd11Com')}</option>
                        <option value="Std 12 Commerce" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{t('admissionOptionStd12Com')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t('admissionLabelMedium')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Languages className="h-5 w-5 text-slate-400 group-focus-within:text-accentViolet transition-colors" />
                      </div>
                      <select 
                        required 
                        name="medium"
                        value={formData.medium}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-accentViolet focus:ring-2 focus:ring-accentViolet/20 transition-all appearance-none font-medium"
                      >
                        <option value="" disabled className="bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500">{t('admissionPlaceholderMedium')}</option>
                        <option value="English" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{t('admissionOptionEnglish')}</option>
                        <option value="Gujarati" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{t('admissionOptionGujarati')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t('admissionLabelMessage')}</label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-0 pl-4 pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-slate-400 group-focus-within:text-accentViolet transition-colors" />
                    </div>
                    <textarea 
                      rows={4}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-accentViolet focus:ring-2 focus:ring-accentViolet/20 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                      placeholder={t('admissionPlaceholderMessage')}
                    ></textarea>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full relative group overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-accentViolet to-accentCyan rounded-xl transition-opacity duration-300"></span>
                  <div className="relative py-4 rounded-xl flex items-center justify-center bg-white dark:bg-slate-950 group-hover:bg-opacity-0 dark:group-hover:bg-opacity-0 transition-all duration-300 text-slate-900 dark:text-white group-hover:text-white dark:group-hover:text-white">
                    <span className="font-bold text-lg flex items-center tracking-wide">
                      {isSubmitting ? t('admissionButtonSubmitting') : (
                        <>{t('admissionButtonSubmit')} <Send className="ml-2 w-5 h-5" /></>
                      )}
                    </span>
                  </div>
                </button>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
