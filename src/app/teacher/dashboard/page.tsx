'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Users, 
  BookOpen, 
  MapPin, 
  CalendarCheck, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  Search,
  ClipboardList,
  Calendar,
  Save,
  Check,
  X,
  ArrowLeft,
  Globe,
  Home,
  User,
  Award,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessOverlay from '@/components/ui/SuccessOverlay';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  standard: string;
  branch: string;
  subjects: string[];
}

export default function TeacherDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeacherDashboardContent />
    </Suspense>
  );
}

function TeacherDashboardContent() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const isGj = language === 'GJ';

  const assignedBranches = user?.branches || [];
  const assignedStandards = user?.role === 'admin' 
    ? ["9", "10", "12"] 
    : (user?.standards || []);

  const getAvailableSubjects = (std: string): string[] => {
    if (user?.role === 'admin') {
      if (std === '9') return ['Maths'];
      if (std === '10') return ['Maths', 'English'];
      if (std === '12') return ['English'];
      return ['Maths', 'English'];
    }
    return [user?.subject].filter(Boolean) as string[];
  };

  const [activeBranch, setActiveBranch] = useState<string>('');
  const [activeStandard, setActiveStandard] = useState<string>('');
  const [activeSubject, setActiveSubject] = useState<string>('');
  
  const initialTab = (searchParams.get('tab') as any) || 'home';
  const [activeTab, setActiveTab] = useState<'home' | 'attendance' | 'marks' | 'profile'>(
    ['home', 'attendance', 'marks', 'profile'].includes(initialTab) ? initialTab : 'home'
  );

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  };
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [successOverlay, setSuccessOverlay] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const showSuccess = (message: string) => {
    setSuccessOverlay({ show: true, message });
  };

  // Form states
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [testName, setTestName] = useState<string>('');
  const [totalMarks, setTotalMarks] = useState<string>('50');

  // Grid states
  const [gridAttendance, setGridAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [gridMarks, setGridMarks] = useState<Record<string, string>>({});

  // Set default values on load
  useEffect(() => {
    if (assignedBranches.length > 0 && !activeBranch) {
      setActiveBranch(assignedBranches[0]);
    }
    if (assignedStandards.length > 0 && !activeStandard) {
      setActiveStandard(assignedStandards[0]);
    }
  }, [assignedBranches, activeBranch, assignedStandards, activeStandard]);

  // Update active subject when standard changes
  useEffect(() => {
    if (activeStandard) {
      const avail = getAvailableSubjects(activeStandard);
      if (avail.length > 0) {
        if (!avail.includes(activeSubject)) {
          setActiveSubject(avail[0]);
        }
      } else {
        setActiveSubject('');
      }
    } else {
      setActiveSubject('');
    }
  }, [activeStandard, activeSubject]);

  // Fetch student list and existing records when branch, standard, tab, date, or sync action changes
  const fetchStudentsAndExistingLogs = async () => {
    const currentSubject = activeSubject || user?.subject;
    if (!activeBranch || !activeStandard || !currentSubject) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Fetch Students matching branch, standard, and subject
      const studentRes = await fetch(
        `/api/students?branch=${encodeURIComponent(activeBranch)}&standard=${activeStandard}&subject=${encodeURIComponent(currentSubject)}`
      );
      if (!studentRes.ok) throw new Error('Failed to load student list');
      const studentData = await studentRes.json();
      const studentList: Student[] = studentData.students || [];
      setStudents(studentList);

      // 2. Initialize default grid state
      const initialAttendance: Record<string, 'present' | 'absent'> = {};
      const initialMarks: Record<string, string> = {};
      studentList.forEach(s => {
        initialAttendance[s._id] = 'present';
        initialMarks[s._id] = '';
      });

      // 3. Fetch existing logs to pre-fill
      if (activeTab === 'attendance') {
        const attRes = await fetch(
          `/api/attendance?branch=${encodeURIComponent(activeBranch)}&subject=${encodeURIComponent(currentSubject)}&date=${attendanceDate}`
        );
        if (attRes.ok) {
          const attData = await attRes.json();
          const records = attData.records || [];
          records.forEach((r: any) => {
            const sId = typeof r.studentId === 'object' ? r.studentId._id : r.studentId;
            initialAttendance[sId] = r.status;
          });
        }
      } else if (activeTab === 'marks' && testName.trim()) {
        const marksRes = await fetch(
          `/api/marks?branch=${encodeURIComponent(activeBranch)}&subject=${encodeURIComponent(currentSubject)}&testName=${encodeURIComponent(testName.trim())}`
        );
        if (marksRes.ok) {
          const marksData = await marksRes.json();
          const records = marksData.records || [];
          records.forEach((r: any) => {
            const sId = typeof r.studentId === 'object' ? r.studentId._id : r.studentId;
            initialMarks[sId] = r.marksObtained !== null && r.marksObtained !== undefined ? String(r.marksObtained) : '';
            if (r.totalMarks) {
              setTotalMarks(String(r.totalMarks));
            }
          });
        }
      }

      setGridAttendance(initialAttendance);
      setGridMarks(initialMarks);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(isGj ? 'ડેટા લોડ કરવામાં નિષ્ફળતા' : 'Failed to retrieve register records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndExistingLogs();
  }, [activeBranch, activeStandard, activeSubject, activeTab, attendanceDate]);

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent') => {
    setGridAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkChange = (studentId: string, value: string) => {
    setGridMarks(prev => ({ ...prev, [studentId]: value }));
  };

  const handleBulkAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (students.length === 0) return;

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const recordsArray = students.map(s => ({
      studentId: s._id,
      status: gridAttendance[s._id] || 'present',
    }));

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: activeBranch,
          subject: activeSubject || user?.subject,
          date: attendanceDate,
          records: recordsArray,
        }),
      });

      if (response.ok) {
        const msg = isGj
          ? `${students.length} વિદ્યાર્થીઓની હાજરી સફળતાપૂર્વક સાચવવામાં આવી!`
          : `Attendance saved for ${students.length} students successfully!`;
        setSuccessMsg(msg);
        showSuccess(isGj ? 'હાજરી સાચવી!' : 'Attendance Saved!');
      } else {
        const data = await response.json();
        setErrorMsg(data.error || 'Failed to submit attendance logs');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to connect to the server');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkMarksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (students.length === 0) return;

    if (!testName.trim()) {
      setErrorMsg(isGj ? 'મહેરબાની કરીને ટેસ્ટ નામ દાખલ કરો' : 'Test Name is required');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const recordsArray = students.map(s => ({
      studentId: s._id,
      marksObtained: gridMarks[s._id] === '' ? null : Number(gridMarks[s._id]),
    }));

    // Validation
    for (const rec of recordsArray) {
      if (rec.marksObtained !== null && Number(rec.marksObtained) > Number(totalMarks)) {
        setErrorMsg(
          isGj
            ? `મેળવેલ ગુણ કુલ ગુણ (${totalMarks}) થી વધુ ન હોઈ શકે`
            : `Obtained marks cannot exceed total marks of ${totalMarks}`
        );
        setSaving(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: activeBranch,
          subject: activeSubject || user?.subject,
          testName: testName.trim(),
          totalMarks: Number(totalMarks),
          records: recordsArray,
        }),
      });

      if (response.ok) {
        const msg = isGj
          ? `${students.length} વિદ્યાર્થીઓના ગુણ સફળતાપૂર્વક સાચવવામાં આવ્યા!`
          : `Test marks saved for ${students.length} students successfully!`;
        setSuccessMsg(msg);
        showSuccess(isGj ? 'ગુણ સાચવ્યા!' : 'Marks Saved!');
      } else {
        const data = await response.json();
        setErrorMsg(data.error || 'Failed to submit exam grades');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to connect to the server');
    } finally {
      setSaving(false);
    }
  };

  // Search filter
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

    return (
    <>
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl flex-grow flex flex-col justify-start pb-28">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 text-left">
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-start gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-[#8B5CF6] dark:text-slate-400 dark:hover:text-white transition-all py-1.5 px-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isGj ? 'હોમ પેજ' : 'Back to Home'}</span>
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#8B5CF6] hover:text-white hover:bg-[#8B5CF6] transition-all py-1.5 px-3 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isGj ? 'એડમિન ડેશબોર્ડ' : 'Admin Panel'}</span>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-2 mt-1">
            <span className="text-[10px] font-black uppercase text-[#8B5CF6] tracking-[0.15em] bg-[#8B5CF6]/10 px-3 py-1 rounded-full border border-[#8B5CF6]/20">
              {isGj ? 'શિક્ષક કાર્યક્ષેત્ર' : 'Teacher Workspace'}
            </span>
            <span className="text-xs font-bold text-slate-400">
              {activeSubject || user?.subject || 'All Subjects'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight text-slate-900 dark:text-white">
            Hello, {user?.name}!
          </h1>
        </motion.div>
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold text-left">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-xs font-bold text-left">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: TEACHER HOME OVERVIEW SCREEN */}
      {activeTab === 'home' && (
        <div className="space-y-6 text-left">
          {/* Quick Stats Grid (3 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Enrolled Students */}
            <div
              onClick={() => setActiveTab('attendance')}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-[#8B5CF6]/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-purple-500/10 text-[#8B5CF6] rounded-2xl border border-[#8B5CF6]/20">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-[#8B5CF6] bg-[#8B5CF6]/10 px-2.5 py-1 rounded-full border border-[#8B5CF6]/20">
                  Std. {activeStandard || 'All'}
                </span>
              </div>
              <div className="mt-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  {isGj ? 'કુલ નોંધાયેલ વિદ્યાર્થીઓ' : 'Enrolled Students'}
                </span>
                <span className="text-3xl font-black text-slate-900 dark:text-white block tracking-tight">
                  {students.length}
                </span>
                <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                  {activeBranch || 'All Branches'}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#8B5CF6]">
                <span>{isGj ? 'વિદ્યાર્થી યાદી જુઓ' : 'View Student Roster'}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 2: Today's Attendance Status */}
            <div
              onClick={() => setActiveTab('attendance')}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-[#8B5CF6]/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  Object.keys(gridAttendance).length > 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}>
                  {Object.keys(gridAttendance).length > 0 ? 'Marked Today' : 'Pending'}
                </span>
              </div>
              <div className="mt-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  {isGj ? 'આજની હાજરી સ્થિતિ' : "Today's Attendance"}
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white block tracking-tight">
                  {Object.keys(gridAttendance).length > 0 ? `Marked for ${Object.keys(gridAttendance).length} Students` : 'Not Marked Today'}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#8B5CF6]">
                <span>{isGj ? 'હાજરી માર્ક કરો' : 'Mark Attendance Now'}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 3: Test Marks Recorded */}
            <div
              onClick={() => setActiveTab('marks')}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-[#8B5CF6]/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                  Exams & Marks
                </span>
              </div>
              <div className="mt-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  {isGj ? 'ટેસ્ટ ગુણ એન્ટ્રી' : 'Test Score Records'}
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white block tracking-tight truncate">
                  {testName || 'Unit Test Grade Sheet'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                  Total Marks: {totalMarks}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#8B5CF6]">
                <span>{isGj ? 'ગુણ ઉમેરો' : 'Add Test Scores'}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 & 3: ATTENDANCE & MARKS SCREENS */}
      {(activeTab === 'attendance' || activeTab === 'marks') && (
        <div className="space-y-6 text-left">
          {/* Selectors Grid (Branch & Standard & Subject) */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Branch Selection */}
            <div className="rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2.5">
                {isGj ? 'સક્રિય શાખા (Branch):' : 'Select Branch:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {assignedBranches.map((br) => (
                  <button
                    key={br}
                    onClick={() => setActiveBranch(br)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border shrink-0 cursor-pointer ${
                      activeBranch === br
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{br}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Standard Selection */}
            <div className="rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2.5">
                {isGj ? 'સક્રિય ધોરણ (Standard):' : 'Select Standard:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {assignedStandards.map((std) => (
                  <button
                    key={std}
                    onClick={() => setActiveStandard(std)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border shrink-0 cursor-pointer ${
                      activeStandard === std
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center space-x-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Standard {std}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Selection */}
            <div className="rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2.5">
                {isGj ? 'સક્રિય વિષય (Subject):' : 'Select Subject:'}
              </span>
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-3 pt-1 my-1">
                {getAvailableSubjects(activeStandard).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubject(sub)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border shrink-0 cursor-pointer ${
                      activeSubject === sub
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-Header & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center">
              {activeTab === 'attendance' ? (
                <>
                  <CalendarCheck className="w-5 h-5 text-[#8B5CF6] mr-2" />
                  <span>{isGj ? 'હાજરી પત્રક (Attendance Register)' : 'Daily Attendance Register'}</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-5 h-5 text-[#8B5CF6] mr-2" />
                  <span>{isGj ? 'ટેસ્ટ ગુણ (Test Marks Register)' : 'Test Marks Entry Register'}</span>
                </>
              )}
            </h2>

            {/* Local Student Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={isGj ? 'નામ દ્વારા શોધો...' : 'Search student...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Register Workspace Panel */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            {activeTab === 'attendance' ? (
              /* ATTENDANCE FORM */
              <form onSubmit={handleBulkAttendanceSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-left">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                      {isGj ? 'હાજરી તારીખ સેટ કરો' : 'Attendance Date'}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {isGj ? 'આ તારીખના ગ્રીડ ડેટા આપોઆપ લોડ થશે' : 'Existing entries for this date will pre-fill'}
                    </span>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      required
                      className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="py-16 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-2 p-6">
                    <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{isGj ? 'કોઈ વિદ્યાર્થીઓ મળ્યા નથી.' : 'No students found'}</span>
                    <span className="text-xs">{isGj ? 'પસંદ કરેલ શાખા અને ધોરણમાં કોઈ ડેટા નથી' : 'No student records registered in this branch & standard.'}</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <table className="min-w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                          <th className="py-3 px-4 sm:px-6 w-3/5">{isGj ? 'વિદ્યાર્થીનું નામ' : 'Student Name'}</th>
                          <th className="py-3 px-4 sm:px-6 text-center">{isGj ? 'હાજર' : 'Present'}</th>
                          <th className="py-3 px-4 sm:px-6 text-center">{isGj ? 'ગેરહાજર' : 'Absent'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredStudents.map((student) => {
                          const currentStatus = gridAttendance[student._id] || 'present';
                          return (
                            <tr key={student._id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                              <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-800 dark:text-slate-200">
                                {student.name}
                              </td>
                              <td className="py-3.5 px-4 sm:px-6 text-center">
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`status-${student._id}`}
                                    checked={currentStatus === 'present'}
                                    onChange={() => handleAttendanceChange(student._id, 'present')}
                                    className="sr-only"
                                  />
                                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                                    currentStatus === 'present'
                                      ? 'bg-emerald-500 text-white border-emerald-500'
                                      : 'border-slate-300 dark:border-slate-700'
                                  }`}>
                                    {currentStatus === 'present' && <Check className="w-3.5 h-3.5" />}
                                  </div>
                                </label>
                              </td>
                              <td className="py-3.5 px-4 sm:px-6 text-center">
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`status-${student._id}`}
                                    checked={currentStatus === 'absent'}
                                    onChange={() => handleAttendanceChange(student._id, 'absent')}
                                    className="sr-only"
                                  />
                                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                                    currentStatus === 'absent'
                                      ? 'bg-red-500 text-white border-red-500'
                                      : 'border-slate-300 dark:border-slate-700'
                                  }`}>
                                    {currentStatus === 'absent' && <X className="w-3.5 h-3.5" />}
                                  </div>
                                </label>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {students.length > 0 && !loading && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 text-xs font-black text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl transition-all shadow-md shadow-[#8B5CF6]/20 flex items-center space-x-2 cursor-pointer"
                    >
                      {saving ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{isGj ? 'હાજરી સબમિટ કરો' : 'Submit Attendance Register'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            ) : (
              /* MARKS FORM */
              <form onSubmit={handleBulkMarksSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {isGj ? 'ટેસ્ટનું નામ' : 'Test / Exam Title'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Unit Test 1"
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        className="flex-1 min-w-0 px-3.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={fetchStudentsAndExistingLogs}
                        className="shrink-0 px-3 py-1.5 text-[10px] font-black bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-colors"
                      >
                        {isGj ? 'ડેટા લાવો' : 'Load Logs'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {isGj ? 'કુલ ગુણ' : 'Total Marks'}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="50"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                      className="w-full px-3.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="py-16 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-2 p-6">
                    <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{isGj ? 'કોઈ વિદ્યાર્થીઓ મળ્યા નથી.' : 'No students found'}</span>
                    <span className="text-xs">{isGj ? 'ટેસ્ટનું નામ ઉમેરો અને લિંક ડેટા પર ક્લિક કરો' : 'Enter test title and click "Load Logs"'}</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <table className="min-w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                          <th className="py-3 px-4 sm:px-6 w-3/5">{isGj ? 'વિદ્યાર્થીનું નામ' : 'Student Name'}</th>
                          <th className="py-3 px-4 sm:px-6 text-center">{isGj ? 'મેળવેલ ગુણ' : 'Marks Obtained'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredStudents.map((student) => {
                          const val = gridMarks[student._id] || '';
                          return (
                            <tr key={student._id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                              <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-800 dark:text-slate-200">
                                {student.name}
                              </td>
                              <td className="py-3 px-4 sm:px-6 text-center">
                                <div className="flex justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max={totalMarks}
                                    placeholder="Ab"
                                    value={val}
                                    onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                    className="w-full max-w-[90px] px-2.5 py-1 text-center font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-[#8B5CF6] focus:outline-none"
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {students.length > 0 && !loading && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 text-xs font-black text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2 cursor-pointer"
                    >
                      {saving ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{isGj ? 'ગુણ સબમિટ કરો' : 'Submit Test Marks'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: TEACHER PROFILE */}
      {activeTab === 'profile' && (
        <div className="space-y-6 text-left">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="p-3 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-2xl border border-[#8B5CF6]/20">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {user?.name}
                </h2>
                <p className="text-xs font-semibold text-[#8B5CF6]">
                  Teacher • {user?.subject || 'Faculty Member'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Registered Email</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{user?.email || 'N/A'}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Phone Contact</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{(user as any)?.phone || 'N/A'}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Assigned Branches</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {assignedBranches.map((b) => (
                    <span key={b} className="px-2 py-0.5 text-[10px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-md border border-[#8B5CF6]/20">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Assigned Standards</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {assignedStandards.map((s) => (
                    <span key={s} className="px-2 py-0.5 text-[10px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-md border border-[#8B5CF6]/20">
                      Std. {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Success Overlay */}
    <AnimatePresence>
      {successOverlay.show && (
        <SuccessOverlay
          message={successOverlay.message}
          onClose={() => setSuccessOverlay({ show: false, message: '' })}
        />
      )}
    </AnimatePresence>

    {/* Fixed Bottom Navigation Bar for Teacher Workspace */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-2">
        {[
          { id: 'home', labelEN: 'Home', labelGJ: 'હોમ', icon: Home },
          { id: 'attendance', labelEN: 'Attendance', labelGJ: 'હાજરી', icon: CalendarCheck },
          { id: 'marks', labelEN: 'Marks', labelGJ: 'ગુણ', icon: FileSpreadsheet },
          { id: 'profile', labelEN: 'Profile', labelGJ: 'પ્રોફાઇલ', icon: User },
        ].map((item) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id as any)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#8B5CF6] font-extrabold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-[#8B5CF6]/10 scale-110' : ''}`}>
                <IconComp className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {isGj ? item.labelGJ : item.labelEN}
              </span>
            </button>
          );
        })}
      </div>
    </div>
    </>
  );
}
