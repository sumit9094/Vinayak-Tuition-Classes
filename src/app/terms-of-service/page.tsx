'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Key, DollarSign, RefreshCw, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsOfServicePage() {
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
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accentCyan/10 border border-accentCyan/20 text-accentCyan text-xs font-black uppercase tracking-wider mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Platform Terms & Rules</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Terms of Service
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
              <BookOpen className="w-5 h-5 text-accentViolet mr-2 shrink-0" />
              1. Platform Overview
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Vinayak Tuition Classes operates this digital management platform to streamline academic attendance, test mark tracking, fee administration, and student/parent communications for our enrolled coaching students and faculty.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center text-slate-900 dark:text-white">
              <Key className="w-5 h-5 text-amber-500 mr-2 shrink-0" />
              2. Account Responsibilities & Confidentiality
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Registered students, teachers, and administrators are assigned individual login credentials (email/phone and password or security PIN).
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1.5 pl-2">
              <li>Users are strictly responsible for maintaining the security and confidentiality of their login credentials.</li>
              <li>Unauthorized account sharing or granting third-party access is prohibited.</li>
              <li>Please notify administration immediately if you suspect unauthorized account access.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center text-slate-900 dark:text-white">
              <DollarSign className="w-5 h-5 text-emerald-500 mr-2 shrink-0" />
              3. Fee Payment Terms & Policies
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Tuition fees are calculated according to the student’s standard and fee schedule.
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1.5 pl-2">
              <li>Payments are due monthly or per term as specified in the student fee structure.</li>
              <li>The online platform facilitates real-time fee tracking and direct UPI payments.</li>
              <li>Official tuition center policies govern fee refunds, cancellations, and disputes.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center text-slate-900 dark:text-white">
              <RefreshCw className="w-5 h-5 text-accentCyan mr-2 shrink-0" />
              4. Platform Updates & Modification
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Vinayak Tuition Classes reserves the right to update, modify, or enhance features of the platform at any time to improve system performance and user experience.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold flex items-center text-slate-900 dark:text-white">
              <Mail className="w-5 h-5 text-orange-500 mr-2 shrink-0" />
              5. Contact Information
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              For any questions regarding these Terms of Service, please reach out to us:
            </p>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-xs space-y-1">
              <p className="text-slate-900 dark:text-white font-bold">Vinayak Tuition Classes</p>
              <p className="text-slate-600 dark:text-slate-400">Email: <a href="mailto:vinayaktuitionclasses76@gmail.com" className="text-accentViolet hover:underline">vinayaktuitionclasses76@gmail.com</a></p>
              <p className="text-slate-600 dark:text-slate-400">Phone: <a href="tel:+919228174188" className="text-accentCyan hover:underline">+91 92281 74188</a></p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
