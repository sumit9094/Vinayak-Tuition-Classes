'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Globe
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
  const { user } = useAuth();
  const { language } = useLanguage();
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
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'marks'>('attendance');
  
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
      if (activeSubTab === 'attendance') {
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
      } else if (activeSubTab === 'marks' && testName.trim()) {
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
  }, [activeBranch, activeStandard, activeSubject, activeSubTab, attendanceDate]);

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
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl flex-grow flex flex-col justify-start">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 text-left">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-start gap-3">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-[#8B5CF6] dark:text-slate-400 dark:hover:text-white transition-all py-1.5 px-3 rounded-full bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm cursor-pointer mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isGj ? 'હોમ પેજ' : 'Back to Home'}</span>
          </Link>
          <span className="text-[10px] font-black uppercase text-[#8B5CF6] tracking-[0.2em] bg-[#8B5CF6]/10 px-3 py-1 rounded-full border border-[#8B5CF6]/20">
            {isGj ? 'શિક્ષક કાર્યક્ષેત્ર' : 'Teacher Workspace'}
          </span>
          <h1 className="text-3xl font-black mt-3 tracking-tight text-slate-900 dark:text-white">
            Hello, {user?.name}!
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {isGj ? 'વિષય: ' : 'Subject: '}<strong className="text-[#8B5CF6]">{activeSubject || user?.subject || '-'}</strong> | {isGj ? 'વિદ્યાર્થીઓ અને શૈક્ષણિક રેકોર્ડનું સંચાન.' : 'Manage student attendance and test marks in bulk.'}
          </p>
        </motion.div>
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-semibold text-left">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-sm font-semibold text-left">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Selectors Grid (Branch & Standard & Subject) */}
      <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
        {/* Branch Selection */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-3">
            {isGj ? 'સક્રિય શાખા (Branch):' : 'Select Branch:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {assignedBranches.map((br) => (
              <button
                key={br}
                onClick={() => setActiveBranch(br)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border shrink-0 ${
                  activeBranch === br
                    ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-md shadow-[#8B5CF6]/10'
                    : 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50'
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
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-3">
            {isGj ? 'સક્રિય ધોરણ (Standard):' : 'Select Standard:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {assignedStandards.map((std) => (
              <button
                key={std}
                onClick={() => setActiveStandard(std)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border shrink-0 ${
                  activeStandard === std
                    ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-md shadow-[#8B5CF6]/10'
                    : 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50'
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
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-3">
            {isGj ? 'સક્રિય વિષય (Subject):' : 'Select Subject:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {getAvailableSubjects(activeStandard).map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubject(sub)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border shrink-0 ${
                  activeSubject === sub
                    ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-md shadow-[#8B5CF6]/10'
                    : 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{sub}</span>
                </span>
              </button>
            ))}
            {getAvailableSubjects(activeStandard).length === 0 && (
              <span className="text-xs text-slate-405 font-semibold italic">No subjects available</span>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Tabs Switcher (Attendance vs Marks) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-850 self-stretch sm:self-start w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 flex-grow sm:flex-grow-0 ${
              activeSubTab === 'attendance'
                ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800'
                : 'text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>{isGj ? 'હાજરી પત્રક (Attendance)' : 'Mark Attendance'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('marks')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 flex-grow sm:flex-grow-0 ${
              activeSubTab === 'marks'
                ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800'
                : 'text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isGj ? 'ટેસ્ટ ગુણ (Test Marks)' : 'Add Test Marks'}</span>
          </button>
        </div>

        {/* Local Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={isGj ? 'નામ દ્વારા શોધો...' : 'Search student...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Register Workspace Panel */}
      <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm flex flex-col">
        {activeSubTab === 'attendance' ? (
          /* ATTENDANCE SECTION */
          <form onSubmit={handleBulkAttendanceSubmit} className="space-y-6">
            {/* Attendance Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-105 dark:border-slate-850/60 text-left">
              <div className="space-y-1">
                <span className="text-xs font-black text-slate-800 dark:text-slate-250 block">
                  {isGj ? 'હાજરી તારીખ સેટ કરો' : 'Attendance Date'}
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {isGj ? 'આ તારીખના ગ્રીડ ડેટા આપોઆપ લોડ થશે' : 'Existing entries for this date will pre-fill'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  required
                  className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
            </div>

            {/* Attendance Spreadsheet Grid */}
            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-16 text-slate-405 dark:text-slate-550 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-2">
                <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                <span className="text-xs font-semibold">{isGj ? 'કોઈ વિદ્યાર્થીઓ મળ્યા નથી.' : 'No students found in this branch & standard.'}</span>
              </div>
            ) : (
              <div className="overflow-x-auto w-full border border-slate-200 dark:border-slate-850 rounded-2xl">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-850 text-[10px] uppercase font-black tracking-wider text-slate-400">
                      <th className="py-3 px-3 sm:px-6 w-3/5">{isGj ? 'વિદ્યાર્થીનું નામ' : 'Student Name'}</th>
                      <th className="py-3 px-3 sm:px-6 text-center">{isGj ? 'હાજર (Present)' : 'Present'}</th>
                      <th className="py-3 px-3 sm:px-6 text-center">{isGj ? 'ગેરહાજર (Absent)' : 'Absent'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850/40">
                    {filteredStudents.map((student) => {
                      const currentStatus = gridAttendance[student._id] || 'present';
                      return (
                        <tr 
                          key={student._id} 
                          className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                        >
                          <td className="py-4 px-3 sm:px-6 font-bold text-slate-855 dark:text-slate-200 text-left">
                            {student.name}
                          </td>
                          <td className="py-4 px-3 sm:px-6">
                            <div className="flex justify-center">
                              <label className="relative flex items-center justify-center p-1 rounded-full hover:bg-emerald-500/10 cursor-pointer">
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
                            </div>
                          </td>
                          <td className="py-4 px-3 sm:px-6">
                            <div className="flex justify-center">
                              <label className="relative flex items-center justify-center p-1 rounded-full hover:bg-red-500/10 cursor-pointer">
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
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Save Button */}
            {students.length > 0 && !loading && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 text-xs font-black text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl transition-all shadow-md shadow-[#8B5CF6]/15 flex items-center space-x-2"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isGj ? 'હાજરી પત્રક સબમિટ કરો' : 'Submit Attendance Register'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        ) : (
          /* TEST MARKS SECTION */
          <form onSubmit={handleBulkMarksSubmit} className="space-y-6">
            {/* Test Info Entry selectors */}
            <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-105 dark:border-slate-850/60 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {isGj ? 'ટેસ્ટનું નામ દાખલ કરો' : 'Test / Exam Title'}
                </label>
                <div className="flex flex-wrap sm:flex-nowrap gap-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit Test 1"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full min-w-0 sm:flex-1 px-3.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={fetchStudentsAndExistingLogs}
                    className="px-3 py-1.5 text-[10px] font-black bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-colors shrink-0 w-full sm:w-auto text-center"
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

            {/* Marks Spreadsheet Grid */}
            {loading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-16 text-slate-405 dark:text-slate-550 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-2">
                <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                <span className="text-xs font-semibold">{isGj ? 'કોઈ વિદ્યાર્થીઓ મળ્યા નથી.' : 'No students found. Enter test name and load.'}</span>
              </div>
            ) : (
              <div className="overflow-x-auto w-full border border-slate-200 dark:border-slate-850 rounded-2xl">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-850 text-[10px] uppercase font-black tracking-wider text-slate-400">
                      <th className="py-3 px-3 sm:px-6 w-3/5">{isGj ? 'વિદ્યાર્થીનું નામ' : 'Student Name'}</th>
                      <th className="py-3 px-2 sm:px-6 text-center">{isGj ? 'મેળવેલ ગુણ' : 'Marks Obtained'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850/40">
                    {filteredStudents.map((student) => {
                      const val = gridMarks[student._id] || '';
                      return (
                        <tr 
                          key={student._id} 
                          className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                        >
                          <td className="py-4 px-3 sm:px-6 font-bold text-slate-850 dark:text-slate-200 text-left">
                            {student.name}
                          </td>
                          <td className="py-3 px-2 sm:px-6">
                            <div className="flex justify-center">
                              <input
                                type="number"
                                min="0"
                                max={totalMarks}
                                placeholder="Ab"
                                value={val}
                                onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                className="w-full max-w-[80px] px-2 py-1 text-center font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-blue-500 focus:outline-none"
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

            {/* Save Button */}
            {students.length > 0 && !loading && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 text-xs font-black text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-all shadow-md shadow-blue-500/15 flex items-center space-x-2"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isGj ? 'ગુણ પત્રક સબમિટ કરો' : 'Submit Test Marks'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
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
    </>
  );
}
