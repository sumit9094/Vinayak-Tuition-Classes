'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mail, Lock, Eye, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50 dark:bg-darkObsidian text-slate-900 dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-4xl">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-accentViolet dark:text-slate-400 dark:hover:text-white transition-colors py-2 px-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-left"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accentViolet/10 border border-accentViolet/20 text-accentViolet text-xs font-black uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy & Data Security</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Last updated: July 24, 2026
          </p>
        </motion.div>

        {/* Policy Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/40 shadow-xl space-y-8 text-left leading-relaxed text-sm"
        >
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center text-slate-900 dark:text-white">
              <Eye className="w-5 h-5 text-accentViolet mr-2 shrink-0" />
              1. Information We Collect
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Vinayak Tuition Classes collects personal information necessary to manage student enrollments, academic records, and parent communications. This includes:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1.5 pl-2">
              <li>Student full name, standard/class (9, 10, 11, or 12), and enrolled branch office.</li>
              <li>Parent/guardian contact phone numbers and email addresses.</li>
              <li>Attendance records marked during regular coaching sessions.</li>
              <li>Test scores and academic evaluation reports.</li>
              <li>Tuition fee status, payment breakdown records, and transaction histories.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center text-slate-900 dark:text-white">
              <FileText className="w-5 h-5 text-accentCyan mr-2 shrink-0" />
              2. How We Use Your Information
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              The information collected is strictly used for legitimate educational and operational purposes:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1.5 pl-2">
              <li>To manage student admissions and account registration.</li>
              <li>To record attendance and evaluate individual test performance.</li>
              <li>To send academic performance updates and attendance alerts to parents.</li>
              <li>To issue monthly fee status reports and facilitate payments via UPI deep links.</li>
              <li>To send push notification reminders for upcoming classes or announcements.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center text-slate-900 dark:text-white">
              <Lock className="w-5 h-5 text-emerald-500 mr-2 shrink-0" />
              3. Data Protection & Sharing
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              We prioritize data security and confidentiality. Your personal information is encrypted in transit and stored in secure database environments. We do <strong>not</strong> sell, rent, or trade student or parent personal data to third parties for marketing purposes.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Data is shared only as necessary to operate essential platform features (e.g., UPI payment processing applications or push notification dispatch services).
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center text-slate-900 dark:text-white">
              <Mail className="w-5 h-5 text-orange-500 mr-2 shrink-0" />
              4. Privacy Questions & Contact
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              If you have any questions or concerns regarding this Privacy Policy or your data protection rights, please contact our administration:
            </p>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-xs space-y-1">
              <p className="text-slate-900 dark:text-white font-bold">Vinayak Tuition Classes</p>
              <p className="text-slate-600 dark:text-slate-400">Email: <a href="mailto:vinayaktuitionclasses76@gmail.com" className="text-accentViolet hover:underline">vinayaktuitionclasses76@gmail.com</a></p>
              <p className="text-slate-600 dark:text-slate-400">Phone: <a href="tel:+919228174188" className="text-accentCyan hover:underline">+91 92281 74188</a></p>
            </div>
          </section>

          {/* Policy Update Note */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 italic">
            Note: This Privacy Policy may be updated periodically to reflect operational improvements or regulatory compliance updates.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
