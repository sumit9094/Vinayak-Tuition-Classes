'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Users, 
  UserCheck, 
  Clock, 
  MapPin, 
  BookOpen, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  Search,
  PlusCircle,
  Briefcase,
  Layers,
  TrendingUp,
  FileText,
  DollarSign,
  AlertCircle,
  Check,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Student {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  parentContact?: string;
  standard: string;
  branch?: string;
  subjects: string[];
  createdAt: string;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone: string;
  branches: string[];
  subject: string;
  createdAt: string;
}

interface AttendanceRecord {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    standard: string;
  };
  subject: string;
  branch: string;
  date: string;
  status: 'present' | 'absent';
}

interface TestMarkRecord {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    standard: string;
  };
  subject: string;
  branch: string;
  testName: string;
  marksObtained: number;
  totalMarks: number;
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'attendance' | 'marks' | 'fees'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  // Overview tables filter selections
  const [filterBranch, setFilterBranch] = useState<string>('VINAYAK 1 SHIVAM');
  const [filterSubject, setFilterSubject] = useState<string>('Maths');
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [marksRecords, setMarksRecords] = useState<TestMarkRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Teacher Form States
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    branches: [] as string[],
    subject: 'Maths',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch initial collections
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch Students
      const studentsRes = await fetch('/api/students');
      // 2. Fetch Teachers
      const teachersRes = await fetch('/api/teachers');

      if (studentsRes.ok && teachersRes.ok) {
        const studentsData = await studentsRes.json();
        const teachersData = await teachersRes.json();
        setStudents(studentsData.students || []);
        setTeachers(teachersData.teachers || []);
      } else {
        setErrorMsg('Failed to load portal collections');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error. Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch attendance or marks logs when filters change
  const fetchOverviewLogs = async () => {
    if (activeTab !== 'attendance' && activeTab !== 'marks') return;
    setErrorMsg(null);
    try {
      const queryParams = new URLSearchParams({
        branch: filterBranch,
        subject: filterSubject,
      });

      const endpoint = activeTab === 'attendance' ? '/api/attendance' : '/api/marks';
      const res = await fetch(`${endpoint}?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (activeTab === 'attendance') {
          setAttendanceRecords(data.records || []);
        } else {
          setMarksRecords(data.records || []);
        }
      } else {
        setErrorMsg('Failed to retrieve overview logs');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load filters data');
    }
  };

  useEffect(() => {
    fetchOverviewLogs();
  }, [activeTab, filterBranch, filterSubject]);

  // Handle branch checkboxes for teacher creation
  const handleBranchCheckbox = (branchName: string) => {
    setNewTeacher((prev) => {
      const exists = prev.branches.includes(branchName);
      const nextBranches = exists
        ? prev.branches.filter((b) => b !== branchName)
        : [...prev.branches, branchName];
      return { ...prev, branches: nextBranches };
    });
  };

  // Submit New Teacher handler
  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeacher.branches.length === 0) {
      setErrorMsg('Please select at least one branch for the teacher');
      return;
    }

    setFormSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(`Teacher ${newTeacher.name} registered successfully!`);
        setNewTeacher({
          name: '',
          email: '',
          phone: '',
          password: '',
          branches: [],
          subject: 'Maths',
        });
        // Reload list
        fetchData();
      } else {
        setErrorMsg(data.error || 'Failed to add teacher');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Search filtering
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.standard.includes(searchQuery) ||
      (s.branch || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const branchOptions = ["VINAYAK 1 SHIVAM", "VINAYAK 2 RAILWAY EAST"];
  const allSubjects = ["English", "Maths", "Social Science", "Science", "Account", "Business Administration", "Economics", "Statistics"];

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl flex-grow flex flex-col justify-start">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 text-left">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-[10px] font-black uppercase text-[#8B5CF6] tracking-[0.2em] bg-[#8B5CF6]/10 px-3 py-1 rounded-full border border-[#8B5CF6]/20">
            Administrative Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-3 tracking-tight text-slate-900 dark:text-white">
            Hello, {user?.name || 'Administrator'}!
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
            Manage registrations, teachers accounts, daily attendance, and test records.
          </p>
        </motion.div>

        {/* Action Controls */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer text-slate-700 dark:text-slate-200"
          >
            Refresh Records
          </button>
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
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats Summary Grid */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md flex items-center justify-between shadow-sm">
          <div className="space-y-1 text-left">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Enrolled Students
            </span>
            <span className="text-3xl font-black tracking-tight block text-slate-900 dark:text-white">
              {loading ? '...' : students.length}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 block">Across 2 branches</span>
          </div>
          <div className="p-3 rounded-xl border bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md flex items-center justify-between shadow-sm">
          <div className="space-y-1 text-left">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Registered Faculty
            </span>
            <span className="text-3xl font-black tracking-tight block text-slate-900 dark:text-white">
              {loading ? '...' : teachers.length}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 block">Assigned standard subjects</span>
          </div>
          <div className="p-3 rounded-xl border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md flex items-center justify-between shadow-sm">
          <div className="space-y-1 text-left">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Active Control
            </span>
            <span className="text-3xl font-black tracking-tight block text-slate-900 dark:text-white">
              Admin
            </span>
            <span className="text-[10px] font-semibold text-slate-400 block">System Master Permissions</span>
          </div>
          <div className="p-3 rounded-xl border bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher Selector & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-850 overflow-x-auto">
          {(['students', 'teachers', 'attendance', 'marks', 'fees'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800'
                  : 'text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Universal Search Bar (Visible only for student/teacher tabs) */}
        {(activeTab === 'students' || activeTab === 'teachers') && (
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'students' ? 'Search students...' : 'Search teachers...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none transition-colors"
            />
          </div>
        )}
      </div>

      {/* Tab Panels */}
      <div className="flex-grow">
        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm">
            <h3 className="text-base font-black text-left text-slate-900 dark:text-white mb-6 flex items-center">
              <Users className="w-5 h-5 text-[#8B5CF6] mr-2" />
              Registered Student Accounts
            </h3>

            {loading ? (
              <div className="py-16 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <p className="text-slate-400 py-10 text-xs font-semibold">No student records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Branch Office</th>
                      <th className="py-3 px-4">Standard</th>
                      <th className="py-3 px-4">Subjects (Auto)</th>
                      <th className="py-3 px-4">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850/40">
                    {filteredStudents.map((st) => (
                      <tr key={st._id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-855 dark:text-slate-200">
                          <div className="space-y-0.5 text-left">
                            <span>{st.name}</span>
                            {!st.email && (
                              <span className="block text-[8px] uppercase tracking-wider text-amber-500 font-bold">
                                Guest Admission Form
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-655 dark:text-slate-400">
                          {st.branch || <span className="text-slate-400">-</span>}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-655 dark:text-slate-400">
                          Std. {st.standard}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {st.subjects.map((sub, idx) => (
                              <span key={idx} className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-[9px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                                {sub}
                              </span>
                            ))}
                            {st.subjects.length === 0 && <span className="text-slate-400 font-semibold">-</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-500 dark:text-slate-500">
                          {st.phone || st.parentContact || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left: Teachers list */}
            <div className="md:col-span-2 glass-card rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm">
              <h3 className="text-base font-black text-left text-slate-900 dark:text-white mb-6 flex items-center">
                <Briefcase className="w-5 h-5 text-[#8B5CF6] mr-2" />
                Teaching Faculty members
              </h3>

              {loading ? (
                <div className="py-16 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8B5CF6]"></div>
                </div>
              ) : filteredTeachers.length === 0 ? (
                <p className="text-slate-400 py-10 text-xs font-semibold">No teachers registered.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                        <th className="py-3 px-4">Teacher Name</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Branches</th>
                        <th className="py-3 px-4">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850/40">
                      {filteredTeachers.map((tch) => (
                        <tr key={tch._id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-855 dark:text-slate-200 text-left">
                            <div className="space-y-0.5">
                              <span className="block">{tch.name}</span>
                              <span className="block text-[10px] text-slate-400 font-semibold">{tch.email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-black text-[#8B5CF6]">
                            {tch.subject}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1">
                              {tch.branches.map((br, idx) => (
                                <span key={idx} className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                  {br.split(' ')[1] || br}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-500 dark:text-slate-500">
                            {tch.phone}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right: Add teacher form */}
            <div className="md:col-span-1 glass-card rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm text-left">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6 flex items-center">
                <PlusCircle className="w-4 h-4 text-[#8B5CF6] mr-2" />
                Add New Faculty
              </h3>

              <form onSubmit={handleAddTeacherSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Name</label>
                  <input
                    type="text"
                    required
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                    placeholder="e.g. rahul@example.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Contact Number</label>
                  <input
                    type="tel"
                    required
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                    placeholder="10-digit phone"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Password</label>
                  <input
                    type="password"
                    required
                    value={newTeacher.password}
                    onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                    placeholder="Password (min 8 chars)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Subject Taught</label>
                  <select
                    value={newTeacher.subject}
                    onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                  >
                    {allSubjects.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Assigned Branches</label>
                  {branchOptions.map((br, idx) => (
                    <label key={idx} className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-350 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTeacher.branches.includes(br)}
                        onChange={() => handleBranchCheckbox(br)}
                        className="rounded border-slate-300 text-[#8B5CF6] focus:ring-[#8B5CF6] cursor-pointer"
                      />
                      <span>{br}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-2.5 mt-4 text-xs font-black text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl transition-all shadow-md shadow-[#8B5CF6]/10 flex items-center justify-center space-x-2"
                >
                  {formSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                  ) : (
                    <span>Register Teacher</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="glass-card rounded-2xl border border-slate-205 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm">
            {/* Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-left border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-[#8B5CF6]" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Attendance Records Overview
                </h3>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Branch</span>
                  <select
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    {branchOptions.map((br, idx) => (
                      <option key={idx} value={br}>{br}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Subject</span>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    {allSubjects.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Attendance logs table */}
            {attendanceRecords.length === 0 ? (
              <div className="text-center py-14 text-slate-400 font-semibold text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No attendance logs found for the selected branch & subject.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Standard</th>
                      <th className="py-3 px-4">Marked Date</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850/40">
                    {attendanceRecords.map((rec) => (
                      <tr key={rec._id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200 text-left">
                          {rec.studentId?.name || 'Unknown Student'}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-555">
                          Std. {rec.studentId?.standard || 'N/A'}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-500">
                          {new Date(rec.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              rec.status === 'present'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {rec.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Marks Tab */}
        {activeTab === 'marks' && (
          <div className="glass-card rounded-2xl border border-slate-205 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm">
            {/* Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-left border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Test score reports overview
                </h3>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Branch</span>
                  <select
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    {branchOptions.map((br, idx) => (
                      <option key={idx} value={br}>{br}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Subject</span>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    {allSubjects.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Test marks logs table */}
            {marksRecords.length === 0 ? (
              <div className="text-center py-14 text-slate-400 font-semibold text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No test marks registered for the selected branch & subject.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Standard</th>
                      <th className="py-3 px-4">Test Title</th>
                      <th className="py-3 px-4 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850/40">
                    {marksRecords.map((rec) => {
                      const percentage = Math.round((rec.marksObtained / rec.totalMarks) * 100);
                      return (
                        <tr key={rec._id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200 text-left">
                            {rec.studentId?.name || 'Unknown Student'}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-555">
                            Std. {rec.studentId?.standard || 'N/A'}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-500">
                            {rec.testName}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="space-y-0.5">
                              <span className="block font-black text-blue-500">{rec.marksObtained} / {rec.totalMarks}</span>
                              <span className="block text-[9px] font-bold text-slate-400">{percentage}% score</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Fees Tab */}
        {activeTab === 'fees' && (
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-8 shadow-sm text-left max-w-2xl mx-auto">
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-6 flex items-center">
              <DollarSign className="w-5 h-5 text-emerald-500 mr-2" />
              Fees Collection & Installments Structure
            </h3>

            <div className="space-y-6">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tuition fees structures are set according to standard and stream. Installments are divided into three parts throughout the academic session.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/10">
                  <span className="text-[10px] font-black text-[#8B5CF6] uppercase block">Secondary (Std. 9 & 10)</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">₹ 15,000 / Year</span>
                  <span className="text-[9px] font-semibold text-slate-400 block mt-1">Payable in 3 installments of ₹ 5,000</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/10">
                  <span className="text-[10px] font-black text-blue-500 uppercase block">Commerce (Std. 11 & 12)</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">₹ 22,000 / Year</span>
                  <span className="text-[9px] font-semibold text-slate-400 block mt-1">Payable in 3 installments of ₹ 7,333</span>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs font-semibold">
                  <span className="block font-bold">Interactive Payments Management coming soon</span>
                  <span className="block text-[10px] opacity-80">Online payments gateway and receipts downloading features will be enabled in the next update.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
