'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Users, 
  BookOpen, 
  MapPin, 
  CalendarCheck, 
  FileSpreadsheet, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle,
  Search,
  X,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const assignedBranches = user?.branches || [];
  const [activeBranch, setActiveBranch] = useState<string>('');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalType, setModalType] = useState<'attendance' | 'marks' | null>(null);

  // Form states
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent'>('present');
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [testName, setTestName] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [totalMarks, setTotalMarks] = useState('50');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Set default branch on load
  useEffect(() => {
    if (assignedBranches.length > 0 && !activeBranch) {
      setActiveBranch(assignedBranches[0]);
    }
  }, [assignedBranches, activeBranch]);

  // Fetch students for active branch
  const fetchStudents = async () => {
    if (!activeBranch) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/students?branch=${encodeURIComponent(activeBranch)}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      } else {
        setErrorMsg('Failed to fetch student data');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error. Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [activeBranch]);

  // Filter students by search query
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.standard.includes(searchQuery)
  );

  const handleOpenModal = (student: Student, type: 'attendance' | 'marks') => {
    setSelectedStudent(student);
    setModalType(type);
    // Reset forms
    setAttendanceStatus('present');
    setAttendanceDate(new Date().toISOString().split('T')[0]);
    setTestName('');
    setMarksObtained('');
    setTotalMarks('50');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setModalType(null);
  };

  // Submit Attendance Handler
  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !user?.subject) return;

    setFormSubmitting(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          subject: user.subject,
          branch: activeBranch,
          date: attendanceDate,
          status: attendanceStatus,
        }),
      });

      if (response.ok) {
        setSuccessMsg(`Attendance marked successfully for ${selectedStudent.name}!`);
        setTimeout(() => {
          handleCloseModal();
          setSuccessMsg(null);
        }, 1500);
      } else {
        const data = await response.json();
        setErrorMsg(data.error || 'Failed to submit attendance');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to connect to server.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Test Marks Handler
  const handleAddMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !user?.subject) return;

    if (Number(marksObtained) > Number(totalMarks)) {
      setErrorMsg('Obtained marks cannot exceed total marks');
      return;
    }

    setFormSubmitting(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          subject: user.subject,
          branch: activeBranch,
          testName,
          marksObtained: Number(marksObtained),
          totalMarks: Number(totalMarks),
        }),
      });

      if (response.ok) {
        setSuccessMsg(`Test marks recorded successfully for ${selectedStudent.name}!`);
        setTimeout(() => {
          handleCloseModal();
          setSuccessMsg(null);
        }, 1500);
      } else {
        const data = await response.json();
        setErrorMsg(data.error || 'Failed to record marks');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to connect to server.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl flex-grow flex flex-col justify-start">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 text-left">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-[10px] font-black uppercase text-[#8B5CF6] tracking-[0.2em] bg-[#8B5CF6]/10 px-3 py-1 rounded-full border border-[#8B5CF6]/20">
            {language === 'EN' ? 'Teacher Portal' : 'શિક્ષક પોર્ટલ'}
          </span>
          <h1 className="text-3xl font-black mt-3 tracking-tight text-slate-900 dark:text-white">
            Hello, {user?.name}!
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Subject: <strong className="text-[#8B5CF6]">{user?.subject}</strong> | Manage your students, attendance, and exam grades.
          </p>
        </motion.div>
      </div>

      {/* Branch Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2 shrink-0">
          {language === 'EN' ? 'Select Active Branch:' : 'શાખા પસંદ કરો:'}
        </span>
        {assignedBranches.map((br) => (
          <button
            key={br}
            onClick={() => setActiveBranch(br)}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all border shrink-0 ${
              activeBranch === br
                ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-md shadow-[#8B5CF6]/10'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{br}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Main Student List Workspace */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm flex flex-col">
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {language === 'EN' ? 'Class Enrolled Students' : 'વર્ગના વિદ્યાર્થીઓ'}
            </h2>
            <span className="text-[10px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] px-2.5 py-0.5 rounded-full border border-[#8B5CF6]/20">
              {filteredStudents.length} Students
            </span>
          </div>
          
          {/* Search bar */}
          <div className="relative max-w-sm w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'EN' ? 'Search by name or std...' : 'શોધો...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-550 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-2">
            <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <span className="text-xs font-semibold">No students matching your branch/subject criteria.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Standard</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/40">
                {filteredStudents.map((student) => (
                  <tr 
                    key={student._id}
                    className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {student.name}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-555 dark:text-slate-400">
                      Std. {student.standard}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-500 dark:text-slate-500">
                      <div className="space-y-0.5">
                        <span className="block text-[10px]">{student.email}</span>
                        <span className="block text-[9px]">{student.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenModal(student, 'attendance')}
                          className="flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/20 rounded-lg transition-all"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Mark Attendance</span>
                        </button>
                        <button
                          onClick={() => handleOpenModal(student, 'marks')}
                          className="flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-bold bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Add Test Marks</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Modal Portal */}
      <AnimatePresence>
        {selectedStudent && modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Success Notification Banner */}
              {successMsg && (
                <div className="flex items-center space-x-2 p-3.5 mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold animate-fadeIn">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Error Notification Banner */}
              {errorMsg && (
                <div className="flex items-center space-x-2 p-3.5 mb-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold animate-fadeIn">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Modal Headers */}
              <div className="mb-6 text-left">
                <span className="text-[10px] font-black uppercase text-[#8B5CF6] tracking-[0.2em] bg-[#8B5CF6]/10 px-2.5 py-0.5 rounded-full border border-[#8B5CF6]/20">
                  {modalType === 'attendance' ? 'Attendance Control' : 'Test Grading'}
                </span>
                <h3 className="text-lg font-black mt-2 text-slate-900 dark:text-white">
                  {selectedStudent.name}
                </h3>
                <p className="text-[10px] font-bold text-slate-400">
                  Std. {selectedStudent.standard} | Subject: {user?.subject}
                </p>
              </div>

              {/* Attendance Form */}
              {modalType === 'attendance' && (
                <form onSubmit={handleMarkAttendance} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Attendance Date
                    </label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Status Option
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAttendanceStatus('present')}
                        className={`py-2 text-xs font-black rounded-xl border transition-all ${
                          attendanceStatus === 'present'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-555/30'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendanceStatus('absent')}
                        className={`py-2 text-xs font-black rounded-xl border transition-all ${
                          attendanceStatus === 'absent'
                            ? 'bg-red-500/10 text-red-500 border-red-555/30'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-2.5 mt-4 text-xs font-black text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl transition-all shadow-md shadow-[#8B5CF6]/10 flex items-center justify-center space-x-2"
                  >
                    {formSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                    ) : (
                      <span>Record Attendance</span>
                    )}
                  </button>
                </form>
              )}

              {/* Test Marks Form */}
              {modalType === 'marks' && (
                <form onSubmit={handleAddMarks} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Test Title Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Weekly Test 1, Unit Exam"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Marks Obtained
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={marksObtained}
                        onChange={(e) => setMarksObtained(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Total Marks
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="50"
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-2.5 mt-4 text-xs font-black text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center space-x-2"
                  >
                    {formSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                    ) : (
                      <span>Save Score Record</span>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
