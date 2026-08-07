'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, Briefcase, ShieldCheck, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import AuthCard from '@/components/auth/AuthCard';

export default function LoginSelectPage() {
  const { language } = useLanguage();
  const router = useRouter();

  const isGj = language === 'GJ';

  const roles = [
    {
      id: 'student',
      title: isGj ? 'વિદ્યાર્થી પોર્ટલ' : 'Student Portal',
      subtitle: isGj ? 'નવું એકાઉન્ટ રજીસ્ટર કરો અથવા સ્ટુડન્ટ ડેશબોર્ડમાં લોગિન કરો.' : 'New student registration & portal access',
      icon: User,
      color: 'from-blue-500 to-indigo-600',
      accentBorder: 'border-l-blue-500',
      badge: isGj ? 'મુખ્ય પોર્ટલ' : 'Most Common',
      target: '/login',
      isPrimary: true,
    },
    {
      id: 'teacher',
      title: isGj ? 'શિક્ષક / ફેકલ્ટી' : 'Teacher / Faculty',
      subtitle: isGj ? 'પરીક્ષા ગુણ અને હાજરી ટ્રેક કરવા માટે લોગિન કરો.' : 'Faculty login to record student marks & logs',
      icon: Briefcase,
      color: 'from-purple-500 to-indigo-600',
      accentBorder: 'border-l-purple-500',
      badge: null,
      target: '/login?role=teacher',
      isPrimary: false,
    },
    {
      id: 'admin',
      title: isGj ? 'એડમિન પોર્ટલ' : 'Administrator',
      subtitle: isGj ? 'ફી વ્યવસ્થાપન, પ્રવેશ અરજીઓ અને સેટિંગ્સ માટે લોગિન કરો.' : 'Admin panel for fees, admissions & settings',
      icon: ShieldCheck,
      color: 'from-amber-500 to-orange-600',
      accentBorder: 'border-l-amber-500',
      badge: null,
      target: '/login?role=admin',
      isPrimary: false,
    },
  ];

  return (
    <AuthCard title="">
      <div className="space-y-4 -mt-4">
        {/* Welcome Subheading */}
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 text-center mb-6">
          {isGj ? 'જી આવકારો! આજે કોણ લોગિન કરી રહ્યું છે?' : "Welcome! Who's logging in today?"}
        </p>

        {/* Role Cards List */}
        <div className="space-y-3.5">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => router.push(role.target)}
                className={`w-full text-left rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 border-l-[5px] ${role.accentBorder} transition-all duration-200 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer group relative overflow-hidden ${
                  role.isPrimary ? 'p-5 sm:p-5.5 shadow-md' : 'p-4 sm:p-4.5 shadow-sm'
                }`}
              >
                {/* Badge for Student Portal */}
                {role.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {role.badge}
                  </span>
                )}

                <div className="flex items-center justify-between pr-2">
                  <div className="flex items-center space-x-3.5 sm:space-x-4">
                    {/* Icon Square with Gradient */}
                    <div className={`rounded-2xl bg-gradient-to-br ${role.color} text-white shadow-md group-hover:scale-105 transition-transform duration-200 flex items-center justify-center shrink-0 ${
                      role.isPrimary ? 'p-3.5' : 'p-3'
                    }`}>
                      <Icon className={role.isPrimary ? 'w-6 h-6' : 'w-5 h-5'} />
                    </div>

                    <div>
                      <h3 className={`font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
                        role.isPrimary ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                      }`}>
                        {role.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {role.subtitle}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Decorative Soft Blurred Geometric Blobs */}
        <div className="pt-4 flex justify-center items-center pointer-events-none opacity-40 dark:opacity-20">
          <div className="w-24 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 blur-[1px]"></div>
        </div>
      </div>
    </AuthCard>
  );
}
