'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Award,
  ClipboardList,
  Star,
  ArrowLeft,
  X,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessOverlay from '@/components/ui/SuccessOverlay';

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
  standards?: string[];
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

const EmptyState = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 mb-4">
      <Icon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
    </div>
    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{title}</p>
    {subtitle && <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 mt-1">{subtitle}</p>}
  </div>
);

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'enquiries' | 'reviews' | 'attendance' | 'marks' | 'fees'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [reviewsPending, setReviewsPending] = useState<any[]>([]);
  const [reviewsApproved, setReviewsApproved] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  
  // Selected student details for fees modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [payingMonth, setPayingMonth] = useState<string | null>(null);
  
  // Fee payment form states
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<'cash' | 'upi'>('cash');
  const [payNote, setPayNote] = useState<string>('');

  // UPI settings states
  const [upiId, setUpiId] = useState<string>('');
  const [upiPayeeName, setUpiPayeeName] = useState<string>('');
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSaveUpiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage(null);
    try {
      const res = await fetch('/api/settings/upi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId, upiPayeeName }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMessage({ type: 'success', text: 'UPI settings saved successfully!' });
        setUpiId(data.upiId);
        setUpiPayeeName(data.upiPayeeName);
      } else {
        setSettingsMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (err) {
      console.error(err);
      setSettingsMessage({ type: 'error', text: 'Network error. Failed to save settings.' });
    }
    setSavingSettings(false);
  };

  // Student & Teacher tab filter states
  const [studentBranchFilter, setStudentBranchFilter] = useState<string>('');
  const [studentStandardFilter, setStudentStandardFilter] = useState<string>('');
  const [teacherBranchFilter, setTeacherBranchFilter] = useState<string>('');
  const [teacherStandardFilter, setTeacherStandardFilter] = useState<string>('');

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete student "${studentName}"? This action cannot be undone.`)) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Student account "${studentName}" deleted successfully.`);
        showSuccess(`Student "${studentName}" removed.`);
        fetchData();
      } else {
        setErrorMsg(data.error || 'Failed to delete student.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Network error. Failed to delete student.');
    }
  };

  const handleDeleteTeacher = async (teacherId: string, teacherName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete teacher "${teacherName}"? This action cannot be undone.`)) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/teachers/${teacherId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Teacher account "${teacherName}" deleted successfully.`);
        showSuccess(`Teacher "${teacherName}" removed.`);
        fetchData();
      } else {
        setErrorMsg(data.error || 'Failed to delete teacher.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Network error. Failed to delete teacher.');
    }
  };

  const handleToggleEnquiryReviewed = async (enqId: string, currentReviewed: boolean) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admission-enquiry/${enqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed: !currentReviewed }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(
          !currentReviewed 
            ? 'Enquiry marked as reviewed.' 
            : 'Enquiry marked as unreviewed.'
        );
        if (!currentReviewed) showSuccess('Enquiry marked as reviewed!');
        fetchData();
      } else {
        setErrorMsg(data.error || 'Failed to update enquiry status.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Network error. Failed to update enquiry.');
    }
  };

  const handleDeleteEnquiry = async (enqId: string, visitorName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete enquiry from "${visitorName}"?`)) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admission-enquiry/${enqId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Enquiry from "${visitorName}" deleted successfully.`);
        showSuccess(`Enquiry from "${visitorName}" deleted.`);
        fetchData();
      } else {
        setErrorMsg(data.error || 'Failed to delete enquiry.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Network error. Failed to delete enquiry.');
    }
  };

  const formatMonthLabel = (monthYearStr: string) => {
    if (!monthYearStr) return '';
    const [year, month] = monthYearStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };

  const handleViewDetails = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/fees/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setStudentDetails(data);
      }
    } catch (e) {
      console.error('Error fetching details:', e);
    }
    setLoadingDetails(false);
  };

  const handleSavePayment = async (monthYear: string) => {
    if (payAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    try {
      const res = await fetch(`/api/fees/${selectedStudentId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthYear,
          amount: payAmount,
          mode: payMode,
          note: payNote,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStudentDetails({ ...studentDetails, breakdown: data.breakdown });
        setPayingMonth(null);
        // Refresh main list
        const feesRes = await fetch('/api/fees');
        if (feesRes.ok) {
          const feesData = await feesRes.json();
          setFees(feesData.fees || []);
        }
      } else {
        alert(data.error || 'Failed to record payment');
      }
    } catch (e) {
      console.error(e);
      alert('Network error. Failed to save payment.');
    }
  };

  const handleRemovePayment = async (monthYear: string) => {
    if (!window.confirm(`Are you sure you want to delete the payment record for ${formatMonthLabel(monthYear)}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/fees/${selectedStudentId}/payments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthYear }),
      });
      const data = await res.json();
      if (res.ok) {
        setStudentDetails({ ...studentDetails, breakdown: data.breakdown });
        // Refresh main list
        const feesRes = await fetch('/api/fees');
        if (feesRes.ok) {
          const feesData = await feesRes.json();
          setFees(feesData.fees || []);
        }
      } else {
        alert(data.error || 'Failed to remove payment');
      }
    } catch (e) {
      console.error(e);
      alert('Network error. Failed to delete payment.');
    }
  };

  const handleSendReminder = (student: any, breakdown: any[]) => {
    const pendingItems = breakdown.filter((b: any) => !b.paid);
    const pendingMonthsLabels = pendingItems.map((b: any) => formatMonthLabel(b.monthYear));
    const totalPendingAmount = pendingItems.reduce((sum: number, b: any) => sum + b.amount, 0);

    const messageText = `Namaste, ${student.name} ki fee pending hai:\n${pendingMonthsLabels.join(', ')} — total ₹${totalPendingAmount}.\nKripya jaldi bhugtan karein. — Vinayak Tuition Classes`;

    const parentPhone = student.parentContact || student.phone || '';
    const cleanPhone = parentPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(waLink, '_blank');
  };

  const tabTranslations: Record<'EN' | 'GJ', Record<string, string>> = {
    EN: {
      students: "students",
      teachers: "teachers",
      enquiries: "admissions / enquiries",
      reviews: "reviews / testimonials",
      attendance: "attendance",
      marks: "marks",
      fees: "fees"
    },
    GJ: {
      students: "વિદ્યાર્થીઓ",
      teachers: "શિક્ષકો",
      enquiries: "પ્રવેશ પૂછપરછ",
      reviews: "પ્રતિસાદ / સમીક્ષાઓ",
      attendance: "હાજરી",
      marks: "પરીક્ષા ગુણ",
      fees: "ફી વિગતો"
    }
  };
  
  // Overview tables filter selections
  const [filterBranch, setFilterBranch] = useState<string>('VINAYAK 1 SHIVAM');
  const [filterSubject, setFilterSubject] = useState<string>('Maths');
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [marksRecords, setMarksRecords] = useState<TestMarkRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [successOverlay, setSuccessOverlay] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const showSuccess = (message: string) => {
    setSuccessOverlay({ show: true, message });
  };

  // New Teacher Form States
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    branches: [] as string[],
    standards: [] as string[],
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
      // 3. Fetch Enquiries
      const enquiriesRes = await fetch('/api/admission-enquiry');
      // 4. Fetch Reviews
      const pendingRes = await fetch('/api/reviews/pending');
      const approvedRes = await fetch('/api/reviews');

      if (studentsRes.ok && teachersRes.ok) {
        const studentsData = await studentsRes.json();
        const teachersData = await teachersRes.json();
        setStudents(studentsData.students || []);
        setTeachers(teachersData.teachers || []);
      } else {
        setErrorMsg('Failed to load portal collections');
      }

      if (enquiriesRes.ok) {
        const enquiriesData = await enquiriesRes.json();
        setEnquiries(enquiriesData.enquiries || []);
      }

      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setReviewsPending(data.reviews || []);
      }

      if (approvedRes.ok) {
        const data = await approvedRes.json();
        setReviewsApproved(data.reviews || []);
      }

      // 5. Fetch Fees
      const feesRes = await fetch('/api/fees');
      if (feesRes.ok) {
        const feesData = await feesRes.json();
        setFees(feesData.fees || []);
      }

      // 6. Fetch UPI Settings
      const settingsRes = await fetch('/api/settings/upi');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setUpiId(settingsData.upiId || '');
        setUpiPayeeName(settingsData.upiPayeeName || '');
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

  const handleApproveReview = async (id: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/reviews/${id}/approve`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setSuccessMsg('Review approved successfully!');
        showSuccess('Review approved and published!');
        fetchData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to approve review');
      }
    } catch (e) {
      setErrorMsg('Failed to connect to the server');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccessMsg('Review deleted successfully!');
        showSuccess('Review deleted.');
        fetchData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to delete review');
      }
    } catch (e) {
      setErrorMsg('Failed to connect to the server');
    }
  };

  useEffect(() => {
    fetchOverviewLogs();
  }, [activeTab, filterBranch, filterSubject]);

  const fetchOverviewLogs = async () => {
    if (activeTab !== 'attendance' && activeTab !== 'marks') return;
    setErrorMsg(null);
    setLogsLoading(true);
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
    } finally {
      setLogsLoading(false);
    }
  };

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

  const handleStandardCheckbox = (std: string) => {
    setNewTeacher((prev) => {
      const exists = prev.standards.includes(std);
      const nextStandards = exists
        ? prev.standards.filter((s) => s !== std)
        : [...prev.standards, std];
      return { ...prev, standards: nextStandards };
    });
  };

  // Submit New Teacher handler
  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeacher.branches.length === 0) {
      setErrorMsg('Please select at least one branch for the teacher');
      return;
    }
    if (newTeacher.standards.length === 0) {
      setErrorMsg('Please select at least one standard for the teacher');
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
          standards: [],
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

  // Search and dropdown filtering
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = studentBranchFilter ? s.branch === studentBranchFilter : true;
    const matchesStandard = studentStandardFilter ? s.standard === studentStandardFilter : true;
    return matchesSearch && matchesBranch && matchesStandard;
  });

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = teacherBranchFilter ? (t.branches || []).includes(teacherBranchFilter) : true;
    const matchesStandard = teacherStandardFilter ? (t.standards || []).includes(teacherStandardFilter) : true;
    return matchesSearch && matchesBranch && matchesStandard;
  });

  const branchOptions = ["VINAYAK 1 SHIVAM", "VINAYAK 2 RAILWAY EAST"];
  const allSubjects = ["English", "Maths", "Social Science", "Science", "Account", "Business Administration", "Economics", "Statistics"];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl flex-grow flex flex-col justify-start">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 text-left">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-start gap-3">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-[#8B5CF6] dark:text-slate-400 dark:hover:text-white transition-all py-1.5 px-3 rounded-full bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm cursor-pointer mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'GJ' ? 'હોમ પેજ' : 'Back to Home'}</span>
          </Link>
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
          <Link
            href="/teacher/dashboard"
            className="px-4 py-2 text-xs font-black bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20 rounded-xl transition-all shadow-sm flex items-center"
          >
            Switch to Teacher Workspace
          </Link>
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
          {(['students', 'teachers', 'enquiries', 'reviews', 'attendance', 'marks', 'fees'] as const).map((tab) => {
            const unreviewedEnquiriesCount = enquiries.filter((e: any) => !e.reviewed).length;
            const pendingReviewsCount = reviewsPending.length;
            
            const showEnquiriesBadge = tab === 'enquiries' && unreviewedEnquiriesCount > 0;
            const showReviewsBadge = tab === 'reviews' && pendingReviewsCount > 0;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800'
                    : 'text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{tabTranslations[language as 'EN' | 'GJ']?.[tab] || tabTranslations['EN'][tab]}</span>
                {showEnquiriesBadge && (
                  <span className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-black leading-none">
                    {unreviewedEnquiriesCount}
                  </span>
                )}
                {showReviewsBadge && (
                  <span className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-black leading-none">
                    {pendingReviewsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Universal Search Bar & Dropdown Filters */}
        {(activeTab === 'students' || activeTab === 'teachers') && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-start sm:items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === 'students' ? 'Search by name...' : 'Search by name/subject...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none transition-colors"
              />
            </div>

            {/* Branch Filter */}
            <select
              value={activeTab === 'students' ? studentBranchFilter : teacherBranchFilter}
              onChange={(e) => {
                if (activeTab === 'students') setStudentBranchFilter(e.target.value);
                else setTeacherBranchFilter(e.target.value);
              }}
              className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none w-full sm:w-auto"
            >
              <option value="">All Branches</option>
              {branchOptions.map((br, idx) => (
                <option key={idx} value={br}>{br}</option>
              ))}
            </select>

            {/* Standard Filter */}
            <select
              value={activeTab === 'students' ? studentStandardFilter : teacherStandardFilter}
              onChange={(e) => {
                if (activeTab === 'students') setStudentStandardFilter(e.target.value);
                else setTeacherStandardFilter(e.target.value);
              }}
              className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none w-full sm:w-auto"
            >
              <option value="">All Standards</option>
              {["9", "10", "11", "12"].map((std, idx) => (
                <option key={idx} value={std}>Std. {std}</option>
              ))}
            </select>
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
              <EmptyState icon={Users} title="No student records found." subtitle="Students will appear here once they register." />
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Branch Office</th>
                      <th className="py-3 px-4">Standard</th>
                      <th className="py-3 px-4">Subjects (Auto)</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850/40">
                    {filteredStudents.map((st) => (
                      <tr key={st._id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                          <div className="space-y-0.5 text-left">
                            <span>{st.name}</span>
                            {!st.email && (
                              <span className="block text-[8px] uppercase tracking-wider text-amber-500 font-bold">
                                Guest Admission Form
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400">
                          {st.branch || <span className="text-slate-400">-</span>}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400">
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
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDeleteStudent(st._id, st.name)}
                            className="p-1.5 rounded-lg border border-red-200 dark:border-red-950/40 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                            title="Delete Student Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
            <div className="md:col-span-2 w-full overflow-hidden glass-card rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm">
              <h3 className="text-base font-black text-left text-slate-900 dark:text-white mb-6 flex items-center">
                <Briefcase className="w-5 h-5 text-[#8B5CF6] mr-2" />
                Teaching Faculty members
              </h3>

              {loading ? (
                <div className="py-16 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
                </div>
              ) : filteredTeachers.length === 0 ? (
                <EmptyState icon={Briefcase} title="No teachers registered." subtitle="Add faculty using the form below." />
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                        <th className="py-3 px-4">Teacher Name</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Branches</th>
                        <th className="py-3 px-4">Standards</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850/40">
                      {filteredTeachers.map((tch) => (
                        <tr key={tch._id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200 text-left">
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
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1">
                              {(tch.standards || []).map((std, idx) => (
                                <span key={idx} className="bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                                  Std. {std}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-500 dark:text-slate-500">
                            {tch.phone}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleDeleteTeacher(tch._id, tch.name)}
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-950/40 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                              title="Delete Teacher Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Assigned Standards</label>
                  {["9", "10", "11", "12"].map((std, idx) => (
                    <label key={idx} className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-350 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTeacher.standards.includes(std)}
                        onChange={() => handleStandardCheckbox(std)}
                        className="rounded border-slate-300 text-[#8B5CF6] focus:ring-[#8B5CF6] cursor-pointer"
                      />
                      <span>Standard {std}</span>
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

        {/* Enquiries Tab */}
        {activeTab === 'enquiries' && (
          <div className="glass-card rounded-2xl border border-slate-205 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="text-left flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-[#8B5CF6]" />
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Admission Enquiries Overview</h2>
                  <p className="text-[10px] font-semibold text-slate-400">Incoming inquiries from the homepage form.</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-16 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
              </div>
            ) : enquiries.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No enquiries submitted yet." subtitle="Visitor inquiries from the homepage form will appear here." />
            ) : (
              <div className="overflow-x-auto w-full rounded-2xl border border-slate-200 dark:border-slate-850">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-850 text-[10px] uppercase font-black tracking-wider text-slate-400">
                      <th className="py-3 px-4">Visitor Name</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Requested Standard</th>
                      <th className="py-3 px-4">Medium</th>
                      <th className="py-3 px-4">Message</th>
                      <th className="py-3 px-4">Received At</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850/40">
                    {enquiries.map((enq) => (
                      <tr key={enq._id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">{enq.name}</td>
                        <td className="py-4 px-4 font-bold text-slate-650 dark:text-slate-400">
                          <a href={`tel:${enq.parentContact}`} className="hover:text-[#8B5CF6] transition-colors">{enq.parentContact}</a>
                        </td>
                        <td className="py-4 px-4 font-black text-[#8B5CF6]">{enq.standard}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            enq.medium === 'English' 
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                              : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                          }`}>
                            {enq.medium}
                          </span>
                        </td>
                        <td className="py-4 px-4 max-w-xs truncate text-slate-550 dark:text-slate-450" title={enq.message}>
                          {enq.message || '-'}
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-semibold">
                          {new Date(enq.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            enq.reviewed 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                          }`}>
                            {enq.reviewed ? 'Reviewed' : 'New'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleToggleEnquiryReviewed(enq._id, enq.reviewed)}
                              className={`px-2 py-1 rounded-lg border text-[10px] font-black transition-colors cursor-pointer ${
                                enq.reviewed 
                                  ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-200/50' 
                                  : 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/20'
                              }`}
                              title={enq.reviewed ? "Mark as New" : "Mark as Reviewed"}
                            >
                              {enq.reviewed ? 'Undo' : 'Reviewed'}
                            </button>
                            <button
                              onClick={() => handleDeleteEnquiry(enq._id, enq.name)}
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                              title="Delete Enquiry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        )}

        {/* Reviews Moderation Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Pending Reviews Card */}
            <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="text-left flex items-center space-x-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Pending Moderation Queue</h2>
                    <p className="text-[10px] font-semibold text-slate-400">Reviews submitted by visitors that require approval.</p>
                  </div>
                </div>
                <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                  {reviewsPending.length} Pending
                </span>
              </div>

              {loading ? (
                <div className="py-16 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
                </div>
              ) : reviewsPending.length === 0 ? (
                <EmptyState icon={Star} title="No pending reviews." subtitle="New visitor testimonials awaiting approval will appear here." />
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {reviewsPending.map((rev) => (
                    <div key={rev._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between text-left space-y-4 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{rev.name}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-slate-300 dark:text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{rev.message}"</p>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="px-3 py-1.5 text-[10px] font-black text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer"
                        >
                          Reject & Delete
                        </button>
                        <button
                          onClick={() => handleApproveReview(rev._id)}
                          className="px-3 py-1.5 text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors cursor-pointer"
                        >
                          Approve Live
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approved Reviews Card */}
            <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="text-left flex items-center space-x-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Live Testimonials</h2>
                    <p className="text-[10px] font-semibold text-slate-400">Approved testimonials currently visible on the homepage.</p>
                  </div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                  {reviewsApproved.length} Live
                </span>
              </div>

              {reviewsApproved.length === 0 ? (
                <EmptyState icon={Check} title="No approved testimonials yet." subtitle="Approved reviews will be visible on the homepage." />
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {reviewsApproved.map((rev) => (
                    <div key={rev._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between text-left space-y-4 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{rev.name}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-slate-300 dark:text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{rev.message}"</p>
                      </div>
                      <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-850">
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="px-3 py-1.5 text-[10px] font-black text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer"
                        >
                          Remove Testimonial
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fees Tab */}
        {activeTab === 'fees' && (
          <div className="space-y-6">

            {/* Fees Table Card */}
            <div className="glass-card rounded-2xl border border-slate-205 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="text-left flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Annual Tuition Fees Status</h2>
                    <p className="text-[10px] font-semibold text-slate-400">Overview of student fee liabilities, payments, and balances.</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="py-16 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
                </div>
              ) : fees.length === 0 ? (
                <EmptyState icon={DollarSign} title="No fee records found." subtitle="Student fee details will appear here once configured." />
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Branch</th>
                        <th className="py-3 px-4">Standard</th>
                        <th className="py-3 px-4">Monthly Fee</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850/40">
                      {fees.map((record) => (
                        <tr key={record.studentId} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200 text-left">
                            {record.name}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400">
                            {record.branch || <span className="text-slate-400">-</span>}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400">
                            Std. {record.standard}
                          </td>
                          <td className="py-4 px-4 font-black text-slate-700 dark:text-slate-300">
                            ₹{record.monthlyFee.toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            {record.status === 'all_paid' ? (
                              <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-450 font-black">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1"></span>
                                All Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-500 dark:text-orange-400 font-black">
                                {record.pendingMonths.length} months pending (₹{record.totalPending.toLocaleString()})
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleViewDetails(record.studentId)}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-black text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 hover:bg-[#8B5CF6]/20 transition-all cursor-pointer shadow-sm"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* UPI Settings Card */}
            <div className="glass-card rounded-2xl border border-slate-205 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm text-left max-w-xl">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center">
                <ShieldAlert className="w-4 h-4 text-[#8B5CF6] mr-2" />
                UPI Payment Settings
              </h3>
              <p className="text-[10px] font-semibold text-slate-400 mb-6">
                Configure the UPI ID and Payee Name for student "Pay Now" deep links.
              </p>

              <form onSubmit={handleSaveUpiSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">UPI ID</label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                      placeholder="e.g. chiragvinayak92281@okicici"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Payee Name</label>
                    <input
                      type="text"
                      required
                      value={upiPayeeName}
                      onChange={(e) => setUpiPayeeName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                      placeholder="e.g. Vinayak Tuition Classes"
                    />
                  </div>
                </div>

                {settingsMessage && (
                  <p className={`text-[10px] font-bold ${settingsMessage.type === 'success' ? 'text-emerald-555' : 'text-red-555'}`}>
                    {settingsMessage.text}
                  </p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-[#8B5CF6] text-white hover:bg-[#8B5CF6]/90 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {savingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
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
              <div className="overflow-x-auto w-full">
                <table className="min-w-full text-left border-collapse">
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
              <div className="overflow-x-auto w-full">
                <table className="min-w-full text-left border-collapse">
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


      {/* Student Fees Detail Modal */}
      <AnimatePresence>
        {selectedStudentId && studentDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {studentDetails.student.name} — Fee Details
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    Std. {studentDetails.student.standard} | {studentDetails.student.branch}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudentId(null);
                    setStudentDetails(null);
                    setPayingMonth(null);
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-grow space-y-6">
                {/* Actions & Reminder bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-450">
                    Monthly Ledger
                  </span>
                  
                  {studentDetails.breakdown.some((b: any) => !b.paid) && (
                    <button
                      onClick={() => handleSendReminder(studentDetails.student, studentDetails.breakdown)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-500 text-white hover:bg-emerald-600 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Reminder</span>
                    </button>
                  )}
                </div>

                {/* Monthly list */}
                <div className="space-y-4">
                  {studentDetails.breakdown.map((item: any) => (
                    <div 
                      key={item.monthYear} 
                      className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 bg-slate-50/40 dark:bg-slate-900/10 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                            {formatMonthLabel(item.monthYear)}
                          </span>
                          <span className="block text-[10px] font-bold text-slate-405 mt-0.5">
                            Standard rate: ₹{item.amount.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.paid
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {item.paid ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Paid</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Pending</span>
                              </>
                            )}
                          </span>

                          {item.paid ? (
                            <button
                              onClick={() => handleRemovePayment(item.monthYear)}
                              className="p-1 rounded-lg border border-red-200 dark:border-red-950/40 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                              title="Delete payment record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            payingMonth !== item.monthYear && (
                              <button
                                onClick={() => {
                                  setPayingMonth(item.monthYear);
                                  setPayAmount(item.amount);
                                  setPayMode('cash');
                                  setPayNote('');
                                }}
                                className="px-3 py-1.5 rounded-xl text-[10px] font-black text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 hover:bg-[#8B5CF6]/20 transition-all cursor-pointer"
                              >
                                Mark as Paid
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {/* Inline form for marking payment */}
                      {payingMonth === item.monthYear && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
                        >
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Amount</label>
                            <input
                              type="number"
                              value={payAmount}
                              onChange={(e) => setPayAmount(Number(e.target.value))}
                              className="w-full px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Payment Mode</label>
                            <select
                              value={payMode}
                              onChange={(e) => setPayMode(e.target.value as 'cash' | 'upi')}
                              className="w-full px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                            >
                              <option value="cash">Cash</option>
                              <option value="upi">UPI / Online</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400">Note (Optional)</label>
                            <input
                              type="text"
                              value={payNote}
                              placeholder="Receipt ref, etc."
                              onChange={(e) => setPayNote(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                            />
                          </div>

                          <div className="sm:col-span-3 flex justify-end space-x-2 mt-2">
                            <button
                              onClick={() => setPayingMonth(null)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-550"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSavePayment(item.monthYear)}
                              className="px-4 py-1.5 rounded-lg text-xs font-black bg-[#8B5CF6] text-white hover:bg-[#8B5CF6]/90 transition-all cursor-pointer"
                            >
                              Record Payment
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Display payment details if paid */}
                      {item.paid && (
                        <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/40 text-[10px] font-semibold text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                          <span>Mode: <strong className="text-slate-700 dark:text-slate-300 uppercase">{item.mode}</strong></span>
                          <span>Date: <strong>{new Date(item.paidAt).toLocaleDateString()}</strong></span>
                          {item.note && <span className="truncate">Note: <strong>{item.note}</strong></span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Overlay */}
      <AnimatePresence>
        {successOverlay.show && (
          <SuccessOverlay
            message={successOverlay.message}
            onClose={() => setSuccessOverlay({ show: false, message: '' })}
          />
        )}
      </AnimatePresence>
    </div>
  </div>
);
}
