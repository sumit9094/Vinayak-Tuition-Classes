'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  User, 
  MapPin, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  Percent, 
  Award,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AttendanceRecord {
  _id: string;
  subject: string;
  branch: string;
  date: string;
  status: 'present' | 'absent';
}

interface TestMarkRecord {
  _id: string;
  subject: string;
  branch: string;
  testName: string;
  marksObtained: number;
  totalMarks: number;
  createdAt: string;
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { language } = useLanguage();

  const subjects = user?.subjects || [];
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<TestMarkRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Set default subject on load
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  // Fetch data when subject changes
  useEffect(() => {
    if (!selectedSubject || !user?.branch) return;

    const fetchSubjectData = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          branch: user.branch || '',
          subject: selectedSubject,
        });

        // 1. Fetch attendance
        const attRes = await fetch(`/api/attendance?${queryParams.toString()}`);
        // 2. Fetch marks
        const marksRes = await fetch(`/api/marks?${queryParams.toString()}`);

        if (attRes.ok && marksRes.ok) {
          const attData = await attRes.json();
          const marksData = await marksRes.json();
          setAttendance(attData.records || []);
          setMarks(marksData.records || []);
        } else {
          setError('Failed to retrieve performance logs');
        }
      } catch (err) {
        console.error('Fetch student data error:', err);
        setError('Network error. Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectData();
  }, [selectedSubject, user]);

  // Calculate statistics
  const totalClasses = attendance.length;
  const presentCount = attendance.filter(r => r.status === 'present').length;
  const absentCount = totalClasses - presentCount;
  const attendanceRate = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

  const averageTestScore = marks.length > 0
    ? Math.round(
        (marks.reduce((acc, curr) => acc + (curr.marksObtained / curr.totalMarks), 0) / marks.length) * 100
      )
    : 0;

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl flex-grow flex flex-col justify-start text-left">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col items-start gap-3">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-[#8B5CF6] dark:text-slate-400 dark:hover:text-white transition-all py-1.5 px-3 rounded-full bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm cursor-pointer mb-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'EN' ? 'Back to Home' : 'હોમ પેજ'}</span>
        </Link>
        <span className="text-[10px] font-black uppercase text-[#8B5CF6] tracking-[0.2em] bg-[#8B5CF6]/10 px-3 py-1 rounded-full border border-[#8B5CF6]/20">
          {language === 'EN' ? 'Student Workspace' : 'વિદ્યાર્થી ક્ષેત્ર'}
        </span>
        <h1 className="text-3xl font-black mt-3 text-slate-900 dark:text-white tracking-tight">
          {language === 'EN' ? `Welcome back, ${user?.name}!` : `સ્વાગત છે, ${user?.name}!`}
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          {language === 'EN' ? 'Track your daily attendance progress and test score reports.' : 'તમારી દૈનિક હાજરી અને ટેસ્ટ માર્ક્સ ટ્રેક કરો.'}
        </p>
      </motion.div>

      {/* Info Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <div className="md:col-span-1 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-455 dark:text-slate-500">
              {language === 'EN' ? 'My Profile' : 'મારી માહિતી'}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <User className="w-4 h-4 text-[#8B5CF6]" />
                <span>{user?.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <BookOpen className="w-4 h-4 text-[#8B5CF6]" />
                <span>Standard {user?.standard} (Commerce)</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-[#8B5CF6]" />
                <span className="truncate">{user?.branch}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mb-1">Registered Contact:</span>
            <span className="text-xs font-bold text-slate-655 dark:text-slate-400">{user?.email}</span>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {language === 'EN' ? 'Attendance Rate' : 'હાજરીનો દર'}
            </span>
            <span className="text-4xl font-black text-slate-900 dark:text-white block tracking-tight">
              {attendanceRate}%
            </span>
            <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 block">
              {presentCount} present out of {totalClasses} classes
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        {/* Marks Summary */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {language === 'EN' ? 'Average Marks' : 'સરેરાશ ગુણ'}
            </span>
            <span className="text-4xl font-black text-slate-900 dark:text-white block tracking-tight">
              {averageTestScore}%
            </span>
            <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 block">
              Based on {marks.length} tests recorded
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Subject Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2 shrink-0">
          {language === 'EN' ? 'Select Subject:' : 'વિષય પસંદ કરો:'}
        </span>
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all border shrink-0 ${
              selectedSubject === sub
                ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-md shadow-[#8B5CF6]/10'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-55 text-slate-700 dark:text-slate-350'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Stats and History */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Attendance Timeline */}
        <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center">
            <Calendar className="w-4 h-4 text-[#8B5CF6] mr-2" />
            {language === 'EN' ? 'Attendance Log' : 'હાજરી લોગ'}
          </h3>
          
          {loading ? (
            <div className="flex-grow flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8B5CF6]"></div>
            </div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-12 text-xs font-semibold text-slate-400 dark:text-slate-550 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-2">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-750" />
              <span>No attendance logs registered for {selectedSubject || 'this subject'}.</span>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {attendance.map((rec) => (
                <div 
                  key={rec._id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/10"
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {new Date(rec.date).toLocaleDateString(language === 'EN' ? 'en-US' : 'gu-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="block text-[9px] font-semibold text-slate-400">
                      Class Attendance Marked
                    </span>
                  </div>
                  <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                    rec.status === 'present'
                      ? 'bg-emerald-500/10 text-emerald-555 border-emerald-555/20'
                      : 'bg-red-500/10 text-red-555 border-red-555/20'
                  }`}>
                    {rec.status === 'present' ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>Present</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>Absent</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Marks Grades */}
        <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center">
            <Award className="w-4 h-4 text-[#8B5CF6] mr-2" />
            {language === 'EN' ? 'Test Grades' : 'ટેસ્ટ ગુણ'}
          </h3>

          {loading ? (
            <div className="flex-grow flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8B5CF6]"></div>
            </div>
          ) : marks.length === 0 ? (
            <div className="text-center py-12 text-xs font-semibold text-slate-400 dark:text-slate-555 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-2">
              <Award className="w-8 h-8 text-slate-300 dark:text-slate-750" />
              <span>No test score logs registered for {selectedSubject || 'this subject'}.</span>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {marks.map((mark) => {
                const pct = Math.round((mark.marksObtained / mark.totalMarks) * 100);
                return (
                  <div 
                    key={mark._id}
                    className="p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/10 flex items-center justify-between"
                  >
                    <div className="space-y-1 text-left">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                        {mark.testName}
                      </span>
                      <span className="text-[10px] font-bold text-slate-455 block">
                        Marked on: {new Date(mark.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-xs font-black text-[#8B5CF6] block">
                        {mark.marksObtained} / {mark.totalMarks}
                      </span>
                      <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                        {pct}% Score
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
