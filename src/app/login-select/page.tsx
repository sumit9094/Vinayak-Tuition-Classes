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
      subtitle: isGj ? 'નવું એકાઉન્ટ રજીસ્ટર કરો અથવા સ્ટુડન્ટ ડેશબોર્ડમાં લોગિન કરો.' : 'New student registration & portal access.',
      icon: User,
      color: 'from-cyan-500 to-blue-600',
      badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      target: '/register',
    },
    {
      id: 'teacher',
      title: isGj ? 'શિક્ષક / ફેકલ્ટી' : 'Teacher / Faculty',
      subtitle: isGj ? 'પરીક્ષા ગુણ અને હાજરી ટ્રેક કરવા માટે લોગિન કરો.' : 'Faculty login to record student marks & logs.',
      icon: Briefcase,
      color: 'from-[#8B5CF6] to-purple-600',
      badgeBg: 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20',
      target: '/login?role=teacher',
    },
    {
      id: 'admin',
      title: isGj ? 'એડમિન પોર્ટલ' : 'Administrator',
      subtitle: isGj ? 'ફી વ્યવસ્થાપન, પ્રવેશ અરજીઓ અને સેટિંગ્સ માટે લોગિન કરો.' : 'Admin panel for fees, admissions & settings.',
      icon: ShieldCheck,
      color: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      target: '/login?role=admin',
    },
  ];

  return (
    <AuthCard title={isGj ? 'રોલ પસંદ કરો' : 'Select Account Type'}>
      <div className="space-y-3 sm:space-y-3.5">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center -mt-2 mb-4 font-semibold">
          {isGj
            ? 'આગળ વધવા માટે તમારો એકાઉન્ટ પ્રકાર પસંદ કરો:'
            : 'Select your role below to proceed:'}
        </p>

        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => router.push(role.target)}
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-[#8B5CF6]/40 transition-all text-left group flex items-center justify-between shadow-sm cursor-pointer"
            >
              <div className="flex items-center space-x-3.5">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${role.color} text-white shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#8B5CF6] transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {role.subtitle}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#8B5CF6] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </button>
          );
        })}
      </div>
    </AuthCard>
  );
}
