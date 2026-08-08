'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  RotateCw,
  Menu,
  GraduationCap,
  ShieldCheck,
  X,
  Trash2,
  MessageSquare,
  Bell,
  Image as ImageIcon,
  Upload,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUBJECTS_BY_STANDARD } from '@/lib/constants';
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

function toTitleCase(str: string) {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

function AdminDashboardContent() {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab');
  const validTabs = ['students', 'teachers', 'enquiries', 'reviews', 'attendance', 'marks', 'fees', 'gallery'];
  const initialTab = tabParam && validTabs.includes(tabParam.toLowerCase()) ? tabParam.toLowerCase() : null;

  const [activeTab, setActiveTab] = useState<string | null>(initialTab);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState<boolean>(false);

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (tab) {
        url.searchParams.set('tab', tab);
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  };

  const SECTION_INFO: Record<string, { labelEN: string; labelGJ: string; icon: any; desc: string }> = {
    students: { labelEN: 'Students', labelGJ: 'વિદ્યાર્થીઓ', icon: Users, desc: 'Registered student accounts and profiles' },
    teachers: { labelEN: 'Teachers', labelGJ: 'શિક્ષકો', icon: Briefcase, desc: 'Registered faculty accounts and subject permissions' },
    enquiries: { labelEN: 'Admissions / Enquiries', labelGJ: 'પ્રવેશ અરજીઓ', icon: ClipboardList, desc: 'New online admission form submissions' },
    reviews: { labelEN: 'Reviews / Testimonials', labelGJ: 'સમીક્ષાઓ', icon: Star, desc: 'Student and parent review submissions' },
    attendance: { labelEN: 'Attendance Logs', labelGJ: 'હાજરી', icon: Calendar, desc: 'Daily attendance progress tracking' },
    marks: { labelEN: 'Marks Reports', labelGJ: 'ગુણ પત્રક', icon: Award, desc: 'Student test scores and progress analytics' },
    fees: { labelEN: 'Fees Management', labelGJ: 'ફી વ્યવસ્થાપન', icon: DollarSign, desc: 'Tuition fees liabilities and payment history' },
    gallery: { labelEN: 'Gallery Photos', labelGJ: 'ગેલેરી ફોટો', icon: ImageIcon, desc: 'Public gallery photos and media assets' },
  };

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [reviewsPending, setReviewsPending] = useState<any[]>([]);
  const [reviewsApproved, setReviewsApproved] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [selectedStudentForMarks, setSelectedStudentForMarks] = useState<any | null>(null);

  // Gallery Management states
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryCategory, setGalleryCategory] = useState<'classroom' | 'events' | 'achievements' | 'facility'>('classroom');
  const [galleryCaption, setGalleryCaption] = useState<string>('');
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [uploadingGallery, setUploadingGallery] = useState<boolean>(false);
  const [galleryMsg, setGalleryMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deletingGalleryId, setDeletingGalleryId] = useState<string | null>(null);

  const fetchGalleryImages = async () => {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setGalleryImages(data.images || []);
      }
    } catch (e) {
      console.error('Fetch gallery error:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'gallery') {
      fetchGalleryImages();
    }
  }, [activeTab]);

  const handleUploadGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryFile) {
      setGalleryMsg({ type: 'error', text: 'Please select an image file to upload.' });
      return;
    }

    setUploadingGallery(true);
    setGalleryMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', galleryFile);
      formData.append('category', galleryCategory);
      formData.append('caption', galleryCaption);

      const res = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setGalleryMsg({ type: 'success', text: 'Photo uploaded to Gallery successfully!' });
        showSuccess('Photo uploaded to Gallery!');
        setGalleryFile(null);
        setGalleryCaption('');
        const fileInput = document.getElementById('admin-gallery-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchGalleryImages();
      } else {
        setGalleryMsg({ type: 'error', text: data.error || 'Failed to upload photo.' });
      }
    } catch (err) {
      console.error(err);
      setGalleryMsg({ type: 'error', text: 'Network error. Failed to upload photo.' });
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo from the gallery?')) return;
    setDeletingGalleryId(id);
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showSuccess('Photo deleted from gallery.');
        fetchGalleryImages();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete photo.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to delete photo.');
    } finally {
      setDeletingGalleryId(null);
    }
  };
  
  // Selected student details for fees modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [payingMonth, setPayingMonth] = useState<string | null>(null);
  
  // Fee payment form states
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<'cash' | 'upi'>('cash');
  const [payNote, setPayNote] = useState<string>('');

  // Fee filter states
  const [feeBranchFilter, setFeeBranchFilter] = useState<string>('');
  const [feeStandardFilter, setFeeStandardFilter] = useState<string>('');
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('');

  // UPI settings states (Email OTP 2-Step Verification)
  const [upiId, setUpiId] = useState<string>('');
  const [upiPayeeName, setUpiPayeeName] = useState<string>('');
  const [upiStep, setUpiStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState<string>('');
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefreshRecords = async () => {
    setIsRefreshing(true);
    const currentTab = activeTab;
    try {
      await fetchData();
      await fetchOverviewLogs();
      handleTabChange(currentTab);
    } catch (e) {
      console.error('Refresh records error:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Listen for drawer toggle event fired from fixed header in AdminLayout
  useEffect(() => {
    const handleToggle = () => setIsNavDrawerOpen((prev) => !prev);
    window.addEventListener('toggle-admin-drawer', handleToggle);
    return () => window.removeEventListener('toggle-admin-drawer', handleToggle);
  }, []);

  // Handle mobile hardware back button for open drawer and modals
  useEffect(() => {
    const isAnyModalOpen = isNavDrawerOpen || Boolean(selectedStudentForMarks) || Boolean(selectedStudentId);
    if (isAnyModalOpen) {
      window.history.pushState({ modalOpen: true }, '');
      const handlePopState = () => {
        setIsNavDrawerOpen(false);
        setSelectedStudentForMarks(null);
        setSelectedStudentId(null);
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isNavDrawerOpen, selectedStudentForMarks, selectedStudentId]);

  const handleRequestUpiOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage(null);
    const sanitizedUpiId = upiId.replace(/\s+/g, '').trim();
    const sanitizedPayeeName = upiPayeeName.trim();
    try {
      const res = await fetch('/api/settings/upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upiId: sanitizedUpiId,
          upiPayeeName: sanitizedPayeeName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUpiStep('otp');
        setSettingsMessage({ type: 'success', text: data.message || '6-digit verification code sent to your email.' });
      } else {
        setSettingsMessage({ type: 'error', text: data.error || 'Failed to request verification code' });
      }
    } catch (err) {
      console.error(err);
      setSettingsMessage({ type: 'error', text: 'Network error. Failed to send verification code.' });
    }
    setSavingSettings(false);
  };

  const handleVerifyUpiOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setSettingsMessage({ type: 'error', text: 'Please enter a valid 6-digit code sent to your email.' });
      return;
    }
    setSavingSettings(true);
    setSettingsMessage(null);
    try {
      const res = await fetch('/api/settings/upi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otpCode: otpCode.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUpiStep('form');
        setOtpCode('');
        setUpiId(data.upiId);
        setUpiPayeeName(data.upiPayeeName);
        setSettingsMessage({ type: 'success', text: 'UPI settings verified & updated successfully!' });
        showSuccess('UPI settings updated!');
      } else {
        setSettingsMessage({ type: 'error', text: data.error || 'Invalid or expired verification code.' });
      }
    } catch (err) {
      console.error(err);
      setSettingsMessage({ type: 'error', text: 'Network error. Failed to verify code.' });
    }
    setSavingSettings(false);
  };

  const handleCancelUpiOtp = () => {
    setUpiStep('form');
    setOtpCode('');
    setSettingsMessage(null);
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

  const handleSendPushReminder = async (student: any, breakdown: any[]) => {
    try {
      const pendingItems = breakdown.filter((b: any) => !b.paid);
      const totalPending = pendingItems.reduce((sum: number, b: any) => sum + b.amount, 0);

      const targetStudentId = student.id || student._id;

      const res = await fetch('/api/fees/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: targetStudentId,
          totalPending
        })
      });

      if (res.ok) {
        setSuccessOverlay({ show: true, message: `Push Reminder Sent to ${student.name}!` });
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send push reminder');
      }
    } catch (e) {
      console.error(e);
      alert('Network error. Failed to send push reminder.');
    }
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
  const [filterStandard, setFilterStandard] = useState<string>('10');
  const [filterSubject, setFilterSubject] = useState<string>('Maths');
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Auto-update filterSubject when filterStandard changes if current subject is not valid for standard
  useEffect(() => {
    const validSubjects = SUBJECTS_BY_STANDARD[filterStandard] || [];
    if (validSubjects.length > 0 && !validSubjects.includes(filterSubject)) {
      setFilterSubject(validSubjects[0]);
    }
  }, [filterStandard]);
  
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

  // Deep-linking tab auto-selection from URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      let target = tabParam.toLowerCase();
      if (target === 'admissions') target = 'enquiries';
      const validTabs = ['students', 'teachers', 'enquiries', 'reviews', 'attendance', 'marks', 'fees', 'gallery'];
      if (validTabs.includes(target)) {
        setActiveTab(target as any);
      }
    }
  }, [searchParams]);

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
  }, [activeTab, filterBranch, filterSubject, filterStandard, filterDate]);

  const fetchOverviewLogs = async () => {
    if (activeTab !== 'attendance' && activeTab !== 'marks') return;
    setErrorMsg(null);
    setLogsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        branch: filterBranch,
        subject: filterSubject,
        standard: filterStandard,
      });

      if (activeTab === 'attendance') {
        if (filterDate) queryParams.set('date', filterDate);
      }

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

  const filteredFees = fees.filter((record) => {
    const matchesSearch = record.name ? record.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const matchesBranch = feeBranchFilter ? record.branch === feeBranchFilter : true;
    const matchesStandard = feeStandardFilter ? String(record.standard) === feeStandardFilter : true;
    const matchesStatus = feeStatusFilter === 'pending'
      ? record.status !== 'all_paid'
      : feeStatusFilter === 'paid'
      ? record.status === 'all_paid'
      : true;
    return matchesSearch && matchesBranch && matchesStandard && matchesStatus;
  });

  const branchOptions = ["VINAYAK 1 SHIVAM", "VINAYAK 2 RAILWAY EAST"];
  const allSubjects = ["English", "Maths", "Social Science", "Science", "Account", "Business Administration", "Economics", "Statistics"];
  const availableSubjects = SUBJECTS_BY_STANDARD[filterStandard] || allSubjects;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl flex-grow flex flex-col justify-start">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 text-left">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-start gap-3">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-[#8B5CF6] dark:text-slate-400 dark:hover:text-white transition-all py-1.5 px-3 rounded-full bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer mb-1.5"
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
            onClick={handleRefreshRecords}
            disabled={isRefreshing || loading}
            className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer text-slate-700 dark:text-slate-200 flex items-center space-x-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#8B5CF6]' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Records'}</span>
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

      {/* Stats Summary Grid & Guidance Prompt — Only displayed on Admin Dashboard default landing view when no section is selected */}
      {activeTab === null && (
        <>
          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex items-center justify-between text-left">
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block">
                  Enrolled Students
                </span>
                <span className="text-3xl font-black tracking-tight block text-slate-900 dark:text-white">
                  {loading ? '...' : students.length}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 block">Across 2 branches</span>
              </div>
              <div className="p-3.5 rounded-2xl border bg-blue-500/10 text-blue-500 border-blue-500/20">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex items-center justify-between text-left">
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block">
                  Registered Faculty
                </span>
                <span className="text-3xl font-black tracking-tight block text-slate-900 dark:text-white">
                  {loading ? '...' : teachers.length}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 block">Assigned standard subjects</span>
              </div>
              <div className="p-3.5 rounded-2xl border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex items-center justify-between text-left">
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block">
                  School Administration
                </span>
                <span className="text-2xl font-black tracking-tight block text-slate-900 dark:text-white">
                  Admin Access
                </span>
                <span className="text-[10px] font-semibold text-slate-400 block">Full Administrative Access</span>
              </div>
              <div className="p-3.5 rounded-2xl border bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Landing Selection Prompt Card */}
          <div className="rounded-3xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 p-8 text-center space-y-4 max-w-xl mx-auto my-6 shadow-sm text-left sm:text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 flex items-center justify-center mx-auto">
              <Menu className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {language === 'GJ' ? 'મેનૂમાંથી વિભાગ પસંદ કરો' : 'Select a Section from Menu'}
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {language === 'GJ' 
                  ? 'ઉપર જમણી બાજુએ આપેલા Menu બટન પર ટેપ કરીને વિદ્યાર્થીઓ, શિક્ષકો, ફી, હાજરી અથવા ગુણ વિભાગ ખોલો.' 
                  : 'Tap the Menu button in the top right header to manage Students, Teachers, Fees, Attendance, Marks, or Reviews.'}
              </p>
            </div>
            <button
              onClick={() => setIsNavDrawerOpen(true)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#8B5CF6] text-white font-black text-xs hover:bg-[#7C3AED] transition-all shadow-md shadow-[#8B5CF6]/20 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>{language === 'GJ' ? 'નેવિગેશન મેનૂ ખોલો' : 'Open Navigation Menu'}</span>
            </button>
          </div>
        </>
      )}

      {/* Active Section Bar & Search Filters — Only displayed when a section is explicitly selected */}
      {activeTab !== null && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-left">
          {/* Left: Active Section Info */}
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase text-[#8B5CF6] tracking-wider bg-[#8B5CF6]/10 px-2.5 py-0.5 rounded-md border border-[#8B5CF6]/20">
                  Active View
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Section {SECTION_INFO[activeTab] ? Object.keys(SECTION_INFO).indexOf(activeTab) + 1 : 1} of {Object.keys(SECTION_INFO).length}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center mt-0.5">
                {React.createElement(SECTION_INFO[activeTab]?.icon || Users, { className: 'w-5 h-5 text-[#8B5CF6] mr-2 shrink-0' })}
                <span>{language === 'GJ' ? SECTION_INFO[activeTab]?.labelGJ : SECTION_INFO[activeTab]?.labelEN}</span>
              </h2>
            </div>
          </div>

          {/* Right: Search Input & Filters (for Students & Teachers) */}
          {(activeTab === 'students' || activeTab === 'teachers') && (
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-start sm:items-center">
              {/* Search Input */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={activeTab === 'students' ? 'Search by name...' : 'Search by name/subject...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none transition-colors"
                />
              </div>

              {/* Branch Filter */}
              <select
                value={activeTab === 'students' ? studentBranchFilter : teacherBranchFilter}
                onChange={(e) => {
                  if (activeTab === 'students') setStudentBranchFilter(e.target.value);
                  else setTeacherBranchFilter(e.target.value);
                }}
                className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none w-full sm:w-auto cursor-pointer"
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
                className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none w-full sm:w-auto cursor-pointer"
              >
                <option value="">All Standards</option>
                {["9", "10", "11", "12"].map((std, idx) => (
                  <option key={idx} value={std}>Std. {std}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

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

            {/* Pending Payment Claims Queue Card */}
            {pendingClaims.length > 0 && (
              <div className="glass-card rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 backdrop-blur-md p-6 shadow-sm text-left space-y-4">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Pending Payment Claims Queue</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                          {pendingClaims.length} New
                        </span>
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Students who indicated they completed payment with UPI Transaction ID / UTR.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingClaims.map((claim) => {
                    const studentObj = claim.studentId || {};
                    return (
                      <div
                        key={claim._id}
                        className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {studentObj.name || 'Student'}
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
                              {formatMonthLabel(claim.monthYear)}
                            </span>
                          </div>

                          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                            <span>Std. {studentObj.standard || 'N/A'}</span>
                            <span>•</span>
                            <span>{studentObj.branch || 'Vinayak'}</span>
                            {studentObj.phone && (
                              <>
                                <span>•</span>
                                <span>📞 {studentObj.phone}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-400">Claimed Amount:</span>
                            <span className="font-black text-emerald-600 dark:text-emerald-400">₹{claim.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/40 dark:border-slate-800">
                            <span className="font-semibold text-slate-400">Transaction ID / UTR:</span>
                            <span className="font-mono font-black text-[#8B5CF6] tracking-wider select-all">{claim.transactionId}</span>
                          </div>
                          <div className="text-[9px] font-medium text-slate-400 pt-0.5">
                            Submitted: {new Date(claim.claimedAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={() => handleResolveClaim(claim._id, 'confirm')}
                            className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm & Mark Paid</span>
                          </button>
                          <button
                            onClick={() => handleResolveClaim(claim._id, 'reject')}
                            className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fees Table Card */}
            <div className="glass-card rounded-2xl border border-slate-205 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4 text-left">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">Annual Tuition Fees Status</h2>
                    <p className="text-[10px] font-semibold text-slate-400">Overview of student fee liabilities, payments, and balances.</p>
                  </div>
                </div>

                {/* Fees Search & Multi-Filter Bar */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                  {/* Student Name Search Input */}
                  <div className="relative flex-1 sm:flex-none sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder={language === 'GJ' ? 'નામ શોધો...' : 'Search student...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                    />
                  </div>

                  {/* Branch Filter */}
                  <select
                    value={feeBranchFilter}
                    onChange={(e) => setFeeBranchFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none cursor-pointer"
                  >
                    <option value="">{language === 'GJ' ? 'બધી શાખાઓ' : 'All Branches'}</option>
                    {branchOptions.map((br, idx) => (
                      <option key={idx} value={br}>{br}</option>
                    ))}
                  </select>

                  {/* Standard Filter */}
                  <select
                    value={feeStandardFilter}
                    onChange={(e) => setFeeStandardFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none cursor-pointer"
                  >
                    <option value="">{language === 'GJ' ? 'બધા ધોરણ' : 'All Standards'}</option>
                    {["9", "10", "11", "12"].map((std, idx) => (
                      <option key={idx} value={std}>Std. {std}</option>
                    ))}
                  </select>

                  {/* Payment Status Filter */}
                  <select
                    value={feeStatusFilter}
                    onChange={(e) => setFeeStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none cursor-pointer text-[#8B5CF6]"
                  >
                    <option value="">{language === 'GJ' ? 'બધા સ્ટેટસ' : 'All Status'}</option>
                    <option value="pending">{language === 'GJ' ? 'માત્ર બાકી ફી (Pending)' : 'Unpaid Only'}</option>
                    <option value="paid">{language === 'GJ' ? 'બધી ભરાયેલી (Paid)' : 'Fully Paid Only'}</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="py-16 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
                </div>
              ) : filteredFees.length === 0 ? (
                <EmptyState
                  icon={DollarSign}
                  title="No matching student fee records found."
                  subtitle={
                    searchQuery || feeBranchFilter || feeStandardFilter || feeStatusFilter
                      ? 'Try adjusting your student name search query or filter options.'
                      : 'Student fee details will appear here once configured.'
                  }
                />
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
                      {filteredFees.map((record) => (
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

            {/* UPI Settings Card (Email OTP 2-Step Verification) */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm text-left max-w-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center">
                  <ShieldAlert className="w-4 h-4 text-[#8B5CF6] mr-2" />
                  UPI Payment Settings
                </h3>
                <span className="text-[9px] font-black uppercase text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded-full border border-[#8B5CF6]/20">
                  Email OTP Secured
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 mb-5 leading-relaxed">
                Configure the receiving UPI ID and Payee Name for student fee payments. Updating this sends a 6-digit verification code to your registered admin email.
              </p>

              {upiStep === 'form' ? (
                <form onSubmit={handleRequestUpiOtp} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        UPI ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                        placeholder="e.g. chiragvinayak92281@okicici"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Payee Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={upiPayeeName}
                        onChange={(e) => setUpiPayeeName(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                        placeholder="e.g. Vinayak Tuition Classes"
                      />
                    </div>
                  </div>

                  {settingsMessage && (
                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                      settingsMessage.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {settingsMessage.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      )}
                      <span>{settingsMessage.text}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={savingSettings || !upiId || !upiPayeeName}
                      className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#8B5CF6] text-white hover:bg-[#8B5CF6]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-[#8B5CF6]/20 flex items-center space-x-2"
                    >
                      {savingSettings ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                          <span>Requesting Code...</span>
                        </>
                      ) : (
                        <span>Save & Request Verification Code</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyUpiOtp} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1 text-xs">
                    <span className="text-[10px] font-black uppercase text-[#8B5CF6] block">Pending Change</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">New UPI ID: <span className="font-mono text-[#8B5CF6]">{upiId}</span></p>
                    <p className="font-medium text-slate-500 dark:text-slate-400">Payee Name: {upiPayeeName}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Enter Verification Code <span className="text-red-500">*</span></span>
                      <span className="text-[9px] text-[#8B5CF6] font-bold">Check your admin email</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 text-base font-black text-center tracking-[0.5em] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#8B5CF6] focus:outline-none font-mono"
                      placeholder="123456"
                    />
                  </div>

                  {settingsMessage && (
                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                      settingsMessage.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {settingsMessage.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      )}
                      <span>{settingsMessage.text}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleCancelUpiOtp}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      Cancel / Back
                    </button>

                    <button
                      type="submit"
                      disabled={savingSettings || otpCode.length !== 6}
                      className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#8B5CF6] text-white hover:bg-[#8B5CF6]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-[#8B5CF6]/20 flex items-center space-x-2"
                    >
                      {savingSettings ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                          <span>Verifying Code...</span>
                        </>
                      ) : (
                        <span>Confirm Change</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
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

              <div className="flex flex-wrap items-center gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Standard</span>
                  <select
                    value={filterStandard}
                    onChange={(e) => setFilterStandard(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
                  >
                    <option value="9">Std. 9</option>
                    <option value="10">Std. 10</option>
                    <option value="11">Std. 11</option>
                    <option value="12">Std. 12</option>
                  </select>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Branch</span>
                  <select
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
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
                    className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
                  >
                    {availableSubjects.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
                    />
                    <button
                      onClick={() => {
                        const d = new Date(filterDate || new Date());
                        d.setDate(d.getDate() - 1);
                        setFilterDate(d.toISOString().split('T')[0]);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
                      title="Previous Day"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => {
                        const d = new Date(filterDate || new Date());
                        d.setDate(d.getDate() + 1);
                        setFilterDate(d.toISOString().split('T')[0]);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer"
                      title="Next Day"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance logs table */}
            {attendanceRecords.length === 0 ? (
              <div className="text-center py-14 text-slate-400 font-semibold text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No attendance recorded for {new Date(filterDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} (Std. {filterStandard}, {filterBranch}, {filterSubject}).
              </div>
            ) : (
              <div>
                <span className="block sm:hidden text-[9px] font-bold text-slate-400 text-right mb-1">Scroll sideways →</span>
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
            </div>
          )}
          </div>
        )}

        {/* Marks Tab */}
        {activeTab === 'marks' && (() => {
          // Group marksRecords by student for Overview View 1
          const marksStudentMap: Record<string, {
            studentId: string;
            studentName: string;
            standard: string;
            records: TestMarkRecord[];
          }> = {};

          marksRecords.forEach((rec) => {
            const sId = (rec.studentId as any)?._id || rec._id;
            if (!marksStudentMap[sId]) {
              marksStudentMap[sId] = {
                studentId: sId,
                studentName: (rec.studentId as any)?.name || 'Unknown Student',
                standard: (rec.studentId as any)?.standard || 'N/A',
                records: [],
              };
            }
            marksStudentMap[sId].records.push(rec);
          });

          const studentMarksOverview = Object.values(marksStudentMap).map((item) => {
            const sortedRecords = [...item.records].sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime());
            const totalObtained = item.records.reduce((sum, r) => sum + (r.marksObtained || 0), 0);
            const totalMax = item.records.reduce((sum, r) => sum + (r.totalMarks || 1), 0);
            const avgPct = Math.round((totalObtained / totalMax) * 100);
            const latest = sortedRecords[0];

            return {
              ...item,
              testsTaken: item.records.length,
              avgPct,
              latestTest: latest ? `${latest.testName} — ${latest.marksObtained}/${latest.totalMarks}` : 'N/A',
              sortedRecords,
            };
          });

          return (
            <div className="glass-card rounded-2xl border border-slate-205 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm">
              {/* Filter controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-left border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Test score reports overview
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400">
                      Click any student row to view full test history and percentage score trend chart.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Standard</span>
                    <select
                      value={filterStandard}
                      onChange={(e) => setFilterStandard(e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
                    >
                      <option value="9">Std. 9</option>
                      <option value="10">Std. 10</option>
                      <option value="11">Std. 11</option>
                      <option value="12">Std. 12</option>
                    </select>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Branch</span>
                    <select
                      value={filterBranch}
                      onChange={(e) => setFilterBranch(e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
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
                      className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
                    >
                      {availableSubjects.map((sub, idx) => (
                        <option key={idx} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* View 1: Overview Table */}
              {logsLoading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : studentMarksOverview.length === 0 ? (
                <div className="text-center py-14 text-slate-400 font-semibold text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No test scores recorded for Std. {filterStandard}, {filterBranch}, {filterSubject}.
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Tests Taken</th>
                        <th className="py-3 px-4">Average Score</th>
                        <th className="py-3 px-4 text-right">Latest Test</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850/40">
                      {studentMarksOverview.map((item) => (
                        <tr
                          key={item.studentId}
                          onClick={() => setSelectedStudentForMarks(item)}
                          className="text-xs hover:bg-slate-100/60 dark:hover:bg-slate-900/40 transition-colors cursor-pointer"
                        >
                          <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200 text-left">
                            <div>
                              <span>{item.studentName}</span>
                              <span className="block text-[10px] font-semibold text-slate-400">Std. {item.standard}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {item.testsTaken} {item.testsTaken === 1 ? 'test' : 'tests'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              item.avgPct >= 75
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : item.avgPct >= 50
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                              {item.avgPct}%
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                            {item.latestTest}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* View 2: Student Detail Modal */}
              <AnimatePresence>
                {selectedStudentForMarks && (() => {
                  const studentRecords = selectedStudentForMarks.sortedRecords || [];
                  const allPcts = studentRecords.map((r: any) => Math.round((r.marksObtained / r.totalMarks) * 100));
                  const avgScorePct = allPcts.length ? Math.round(allPcts.reduce((a: number, b: number) => a + b, 0) / allPcts.length) : 0;
                  const highestScorePct = allPcts.length ? Math.max(...allPcts) : 0;
                  const lowestScorePct = allPcts.length ? Math.min(...allPcts) : 0;
                  const recentRecords = [...studentRecords].reverse().slice(-8);

                  return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl overflow-y-auto max-h-[92vh] flex flex-col text-left space-y-5"
                      >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
                          <div>
                            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                              {selectedStudentForMarks.studentName}
                            </h2>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">
                              Std. {selectedStudentForMarks.standard} • {filterBranch} • {filterSubject}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedStudentForMarks(null)}
                            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Quick Summary Stats Row (New) */}
                        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                          {/* Average Score Card */}
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Average Score</span>
                            <div className="flex items-baseline space-x-1 mt-1">
                              <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{avgScorePct}%</span>
                            </div>
                          </div>

                          {/* Highest Score Card */}
                          <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-left">
                            <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">Highest Score</span>
                            <div className="flex items-baseline space-x-1 mt-1">
                              <span className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{highestScorePct}%</span>
                            </div>
                          </div>

                          {/* Lowest Score Card */}
                          <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-left">
                            <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider block">Lowest Score</span>
                            <div className="flex items-baseline space-x-1 mt-1">
                              <span className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400">{lowestScorePct}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Score Percentage Trend Chart Section (Recent 6-8 Tests) */}
                        {recentRecords.length > 0 && (
                          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                Score Trend (Last {recentRecords.length} Tests)
                              </span>
                              <span className="text-[9px] font-bold text-slate-400">
                                Total {studentRecords.length} tests recorded
                              </span>
                            </div>
                            <div className="w-full overflow-x-auto pb-1">
                              <div className="min-w-[400px] h-[165px] flex items-end justify-between gap-4 pt-3 px-2">
                                {recentRecords.map((tRec: any, idx: number) => {
                                  const pct = Math.round((tRec.marksObtained / tRec.totalMarks) * 100);
                                  return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end min-w-[45px]">
                                      <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 shrink-0">{pct}%</span>
                                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-[90px] shrink-0">
                                        <div
                                          className={`w-full rounded-t-lg transition-all duration-500 ${
                                            pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                          }`}
                                          style={{ height: `${pct}%` }}
                                        />
                                      </div>
                                      <span
                                        className="text-[9px] font-bold text-slate-500 dark:text-slate-400 text-center leading-tight line-clamp-2 h-[24px] shrink-0"
                                        title={toTitleCase(tRec.testName)}
                                      >
                                        {toTitleCase(tRec.testName)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Section Divider */}
                        <div className="border-b border-slate-200 dark:border-slate-800" />

                        {/* Complete Test History Table Section */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                            Complete Test History ({studentRecords.length})
                          </h4>
                          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto w-full">
                            <table className="min-w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400 bg-slate-100/70 dark:bg-slate-900/60">
                                  <th className="py-2.5 px-3.5">Test Title</th>
                                  <th className="py-2.5 px-3.5 text-right">Score</th>
                                  <th className="py-2.5 px-3.5 text-right">Percentage</th>
                                  <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/40">
                                {studentRecords.map((rec: any, idx: number) => {
                                  const pct = Math.round((rec.marksObtained / rec.totalMarks) * 100);
                                  return (
                                    <tr
                                      key={rec._id}
                                      className={`text-xs transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/40 ${
                                        idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-900/30'
                                      }`}
                                    >
                                      {/* Test Title (Left-Aligned, Title Case) */}
                                      <td className="py-3 px-3.5 font-bold text-slate-800 dark:text-slate-200" title={rec.testName}>
                                        {toTitleCase(rec.testName)}
                                      </td>

                                      {/* Score (Right-Aligned) */}
                                      <td className="py-3 px-3.5 text-right font-black text-blue-600 dark:text-blue-400 whitespace-nowrap font-mono">
                                        {rec.marksObtained} / {rec.totalMarks}
                                      </td>

                                      {/* Percentage (Right-Aligned) */}
                                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black inline-block ${
                                          pct >= 75
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                            : pct >= 50
                                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                            : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                        }`}>
                                          {pct}%
                                        </span>
                                      </td>

                                      {/* Date (Right-Aligned) */}
                                      <td className="py-3 px-3.5 text-right font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                        {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })()}
              </AnimatePresence>
            </div>
          );
        })()}

        {/* Gallery Tab Panel */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 text-left">
            {/* Upload Form Card */}
            <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center">
                    <ImageIcon className="w-5 h-5 text-[#8B5CF6] mr-2" />
                    Gallery Photo Management
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-1">
                    Upload new photos to showcase in the public Gallery page (Classroom, Events, Achievements, Facility).
                  </p>
                </div>
              </div>

              {galleryMsg && (
                <div className={`p-4 mb-6 rounded-2xl text-xs font-semibold flex items-center justify-between ${
                  galleryMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{galleryMsg.text}</span>
                  </div>
                  <button onClick={() => setGalleryMsg(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleUploadGalleryImage} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* File Picker */}
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Select Photo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="admin-gallery-file-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setGalleryFile(e.target.files?.[0] || null)}
                    required
                    className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#8B5CF6]/10 file:text-[#8B5CF6] hover:file:bg-[#8B5CF6]/20 cursor-pointer"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={galleryCategory}
                    onChange={(e) => setGalleryCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none cursor-pointer"
                  >
                    <option value="classroom">Classroom</option>
                    <option value="events">Events</option>
                    <option value="achievements">Achievements</option>
                    <option value="facility">Facility</option>
                  </select>
                </div>

                {/* Caption Text Input */}
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Caption (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Short description, event name, etc."
                    value={galleryCaption}
                    onChange={(e) => setGalleryCaption(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#8B5CF6] focus:outline-none"
                  />
                </div>

                {/* Submit Upload Button */}
                <div className="md:col-span-3 flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={uploadingGallery || !galleryFile}
                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#8B5CF6] text-white hover:bg-[#8B5CF6]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#8B5CF6]/20 flex items-center space-x-2 cursor-pointer"
                  >
                    {uploadingGallery ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Photo</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Management Grid Card */}
            <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/20 backdrop-blur-md p-6 shadow-sm">
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Uploaded Gallery Photos ({galleryImages.length})</span>
                <span className="text-[10px] font-semibold text-slate-400">Publicly visible on /gallery</span>
              </h4>

              {galleryImages.length === 0 ? (
                <EmptyState
                  icon={ImageIcon}
                  title="No photos uploaded yet."
                  subtitle="Use the upload form above to add photos to the gallery."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((img) => (
                    <div
                      key={img._id}
                      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* Image Preview Container */}
                      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                        <img
                          src={img.imageUrl}
                          alt={img.caption || img.category}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Category Badge */}
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                          {img.category}
                        </span>
                      </div>

                      {/* Info & Action Controls */}
                      <div className="p-3.5 space-y-2 flex-grow flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                            {img.caption || <span className="italic text-slate-400 font-medium">No caption provided</span>}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-400 block mt-1">
                            {img.createdAt ? new Date(img.createdAt).toLocaleDateString() : 'Just now'}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                          <button
                            onClick={() => handleDeleteGalleryImage(img._id)}
                            disabled={deletingGalleryId === img._id}
                            className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-950/40 hover:bg-red-500/10 text-red-500 text-[11px] font-bold transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                          >
                            {deletingGalleryId === img._id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                            ) : (
                              <>
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendReminder(studentDetails.student, studentDetails.breakdown)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-500 text-white hover:bg-emerald-600 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Send WhatsApp</span>
                      </button>
                      <button
                        onClick={() => handleSendPushReminder(studentDetails.student, studentDetails.breakdown)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-blue-500 text-white hover:bg-blue-600 transition-all cursor-pointer shadow-md shadow-blue-500/10"
                      >
                        <Bell className="w-4 h-4" />
                        <span>Send Push</span>
                      </button>
                    </div>
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

      {/* Navigation Sidebar Drawer */}
      <AnimatePresence>
        {isNavDrawerOpen && (
          <div className="fixed inset-0 z-[9999] flex justify-end">
            {/* Semi-transparent Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNavDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Drawer Container (Right-sided) */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative z-10 w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full shadow-2xl flex flex-col justify-between text-left overflow-hidden"
            >
              {/* Top Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/20">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      Vinayak Admin
                    </h3>
                    <p className="text-[10px] font-extrabold uppercase text-[#8B5CF6] tracking-wider mt-0.5">
                      Workspace Navigation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNavDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links List */}
              <div className="p-4 space-y-2 flex-grow overflow-y-auto">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-3 block mb-2">
                  {language === 'GJ' ? 'વિભાગ પસંદ કરો' : 'Select Workspace Section'}
                </span>

                {(Object.keys(SECTION_INFO) as Array<keyof typeof SECTION_INFO>).map((key) => {
                  const info = SECTION_INFO[key];
                  const IconComponent = info.icon;
                  const isActive = activeTab === key;

                  const unreviewedEnquiriesCount = enquiries.filter((e: any) => !e.reviewed).length;
                  const pendingReviewsCount = reviewsPending.length;
                  const showEnquiriesBadge = key === 'enquiries' && unreviewedEnquiriesCount > 0;
                  const showReviewsBadge = key === 'reviews' && pendingReviewsCount > 0;

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        handleTabChange(key);
                        setIsNavDrawerOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer group border ${
                        isActive
                          ? 'bg-gradient-to-r from-[#8B5CF6] to-purple-600 text-white border-[#8B5CF6] shadow-lg shadow-[#8B5CF6]/20'
                          : 'bg-slate-50/70 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-white dark:bg-slate-900 text-[#8B5CF6] border border-slate-200/60 dark:border-slate-800'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-extrabold text-sm leading-tight">
                            {language === 'GJ' ? info.labelGJ : info.labelEN}
                          </span>
                          <span className={`text-[10px] font-medium line-clamp-1 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                            {info.desc}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        {showEnquiriesBadge && (
                          <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black leading-none shadow-sm">
                            {unreviewedEnquiriesCount}
                          </span>
                        )}
                        {showReviewsBadge && (
                          <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black leading-none shadow-sm">
                            {pendingReviewsCount}
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer Info & Logout Option */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 space-y-3">
                <button
                  onClick={() => {
                    setIsNavDrawerOpen(false);
                    logout();
                    window.location.href = '/login-select';
                  }}
                  className="w-full p-3 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-red-500 text-white shadow-sm">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-extrabold text-sm leading-tight text-red-600 dark:text-red-400">
                        {language === 'GJ' ? 'લૉગ આઉટ' : 'Log Out'}
                      </span>
                      <span className="text-[10px] font-medium text-red-500/80 dark:text-red-400/80">
                        {language === 'GJ' ? 'એડમિન પોર્ટલ માંથી બહાર નીકળો' : 'Exit Admin Session'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400 transition-transform group-hover:translate-x-1" />
                </button>

                <p className="text-[10px] font-bold text-slate-400 text-center">
                  Logged in as <span className="text-[#8B5CF6] font-extrabold">{user?.name || 'Admin'}</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
