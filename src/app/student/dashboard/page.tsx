'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  ArrowLeft,
  DollarSign,
  Check,
  Copy,
  ExternalLink,
  Download,
  Loader2,
  X,
  Home,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { MONTHLY_FEE_BY_STANDARD } from '@/lib/constants';

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

function StudentDashboardContent() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const searchParams = useSearchParams();

  const subjects = user?.subjects || [];
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  const initialTab = (searchParams.get('tab') as any) || 'home';
  const [activeTab, setActiveTab] = useState<'home' | 'attendance' | 'marks' | 'fees' | 'profile'>(
    ['home', 'attendance', 'marks', 'fees', 'profile'].includes(initialTab) ? initialTab : 'home'
  );
  
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  };

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<TestMarkRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Student fees breakdown
  const [feesBreakdown, setFeesBreakdown] = useState<any[]>([]);
  const [totalPendingFees, setTotalPendingFees] = useState<number>(0);
  const [upiSettings, setUpiSettings] = useState<{ upiId: string, upiPayeeName: string } | null>(null);

  // Pay Now Modal & QR states
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [payUpiLink, setPayUpiLink] = useState<string>('');
  const [cleanUpiId, setCleanUpiId] = useState<string>('');
  const [cleanPayeeName, setCleanPayeeName] = useState<string>('');

  // Payment Claims states
  const [paymentClaims, setPaymentClaims] = useState<any[]>([]);
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [claimTxnId, setClaimTxnId] = useState<string>('');
  const [claimTargetMonth, setClaimTargetMonth] = useState<string>('');
  const [claimTargetAmount, setClaimTargetAmount] = useState<number>(0);

  // Payment Notification States & Rate Limiting Cooldown
  const [notifyingPayment, setNotifyingPayment] = useState<boolean>(false);
  const [notifySuccessMsg, setNotifySuccessMsg] = useState<string | null>(null);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);

  const handleDownloadReceipt = async (paymentId: string, monthYear: string) => {
    if (!paymentId) return;
    setDownloadingReceiptId(paymentId);
    try {
      const res = await fetch(`/api/fees/receipt/${paymentId}`);

      if (!res.ok) {
        let errText = 'Failed to download receipt';
        try {
          const errJson = await res.json();
          errText = errJson.error || errText;
        } catch (e) {}
        alert(`Receipt Download Error: ${errText}`);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${monthYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download receipt error:', err);
      alert('Network error downloading receipt. Please try again.');
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  const handleOpenClaimModal = (monthYear?: string, amount?: number) => {
    const firstUnpaid = feesBreakdown.find((b: any) => !b.paid);
    const targetMonth = monthYear || firstUnpaid?.monthYear || '';
    const targetAmount = amount || firstUnpaid?.amount || totalPendingFees;

    setClaimTargetMonth(targetMonth);
    setClaimTargetAmount(targetAmount);
    setClaimTxnId('');
    setNotifySuccessMsg(null);
    setShowClaimModal(true);
  };

  const handleSubmitPaymentClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const studentIdStr = (user as any)?.id || (user as any)?._id || '';

    if (!claimTxnId || claimTxnId.trim().length < 6) {
      setNotifySuccessMsg(
        language === 'EN'
          ? 'Please enter a valid UPI Transaction ID / UTR Number (min 6 characters).'
          : 'કૃપા કરીને માન્ય UPI Transaction ID / UTR નંબર (ઓછામાં ઓછા ૬ અક્ષર) દાખલ કરો.'
      );
      return;
    }

    setNotifyingPayment(true);
    setNotifySuccessMsg(null);

    try {
      const res = await fetch('/api/fees/notify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentIdStr,
          studentName: user?.name || 'Student',
          amount: claimTargetAmount,
          monthYear: claimTargetMonth,
          transactionId: claimTxnId.trim(),
          standard: (user as any)?.standard || '',
          branch: (user as any)?.branch || '',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotifySuccessMsg(
          language === 'EN'
            ? `Thanks! Payment claim with UTR ${claimTxnId.trim()} submitted — awaiting admin confirmation.`
            : `આભાર! UTR નંબર ${claimTxnId.trim()} સાથે પેમેન્ટ ક્લેમ સબમિટ થઈ ગયો છે — એડમિન ચકાસણીની રાહમાં છે.`
        );
        setClaimTxnId('');
        setShowClaimModal(false);
        fetchFeesAndClaims();
      } else {
        setNotifySuccessMsg(data.error || 'Failed to submit payment claim.');
      }
    } catch (e) {
      console.error(e);
      setNotifySuccessMsg('Network error. Failed to submit claim.');
    } finally {
      setNotifyingPayment(false);
    }
  };

  // Mobile Hardware Back-Button Listener for Pay Modal
  useEffect(() => {
    if (showPayModal) {
      window.history.pushState({ modalOpen: true }, '');
      const handlePopState = () => setShowPayModal(false);
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [showPayModal]);

  // Fallback state for UPI app launch
  const [showUpiFallbackNote, setShowUpiFallbackNote] = useState<boolean>(false);

  const handleUpiClick = () => {
    setTimeout(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        setShowUpiFallbackNote(true);
      }
    }, 1500);
  };

  const handleOpenPayModal = async () => {
    if (!upiSettings?.upiId) return;
    setShowUpiFallbackNote(false);
    const sanitizedUpiId = (upiSettings.upiId || '').replace(/\s+/g, '').trim();
    const sanitizedPayeeName = (upiSettings.upiPayeeName || 'Vinayak Tuition Classes').trim();
    const cleanStudentName = (user?.name || 'Student').replace(/[^a-zA-Z0-9\s]/g, '').trim();

    const paParam = encodeURIComponent(sanitizedUpiId);
    const pnParam = encodeURIComponent(sanitizedPayeeName);
    const tnParam = encodeURIComponent(`${cleanStudentName}-Fee`);
    
    const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
    const upiParams = `pa=${paParam}&pn=${pnParam}&am=${totalPendingFees}&cu=INR&tn=${tnParam}`;

    // For Android, use intent:// scheme (without package restriction so all UPI apps appear in chooser)
    const androidIntentLink = `intent://pay?${upiParams}#Intent;scheme=upi;end`;
    const standardUpiLink = `upi://pay?${upiParams}`;

    const targetLink = isAndroid ? androidIntentLink : standardUpiLink;

    setCleanUpiId(sanitizedUpiId);
    setCleanPayeeName(sanitizedPayeeName);
    setPayUpiLink(targetLink);

    try {
      // Use standard upi:// scheme for QR code generation
      const qrLink = `upi://pay?${upiParams}`;
      const url = await QRCode.toDataURL(qrLink, { width: 240, margin: 2 });
      setQrDataUrl(url);
    } catch (err) {
      console.error('QR generation error:', err);
    }

    setShowPayModal(true);
  };

  const handleCopyUpi = () => {
    if (!cleanUpiId) return;
    navigator.clipboard.writeText(cleanUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const formatMonthLabel = (monthYearStr: string) => {
    if (!monthYearStr) return '';
    const [year, month] = monthYearStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };

  // Handle deep-linked tab auto-select and subject parameter
  useEffect(() => {
    const subjectParam = searchParams.get('subject');
    if (subjectParam && subjects.includes(subjectParam)) {
      setSelectedSubject(subjectParam);
    } else if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0]);
    }

    const tab = searchParams.get('tab');
    if (tab && ['home', 'attendance', 'marks', 'fees', 'profile'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams, subjects]);

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

  // Fetch fees breakdown & payment claims when student profile loads
  const fetchFeesAndClaims = async () => {
    if (!user?._id) return;
    try {
      const [feesRes, claimsRes] = await Promise.all([
        fetch(`/api/fees/${user._id}`),
        fetch(`/api/fees/claims?studentId=${user._id}`),
      ]);

      if (feesRes.ok) {
        const data = await feesRes.json();
        setFeesBreakdown(data.breakdown || []);
        const pendingTotal = (data.breakdown || [])
          .filter((b: any) => !b.paid)
          .reduce((sum: number, b: any) => sum + b.amount, 0);
        setTotalPendingFees(pendingTotal);
      }

      if (claimsRes.ok) {
        const claimsData = await claimsRes.json();
        setPaymentClaims(claimsData.claims || []);
      }
    } catch (e) {
      console.error('Fetch student fees/claims error:', e);
    }
  };

  useEffect(() => {
    fetchFeesAndClaims();
  }, [user]);

  // Fetch UPI Settings
  useEffect(() => {
    const fetchUpiSettings = async () => {
      try {
        const res = await fetch('/api/settings/upi');
        if (res.ok) {
          const data = await res.json();
          setUpiSettings(data);
        }
      } catch (e) {
        console.error('Error fetching UPI settings:', e);
      }
    };
    fetchUpiSettings();
  }, []);

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
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl flex-grow flex flex-col justify-start text-left pb-28">
      {/* Header Banner */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col items-start gap-2.5">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-[#8B5CF6] dark:text-slate-400 dark:hover:text-white transition-all py-1.5 px-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'EN' ? 'Back to Home' : 'હોમ પેજ'}</span>
        </Link>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black uppercase text-[#8B5CF6] tracking-[0.15em] bg-[#8B5CF6]/10 px-3 py-1 rounded-full border border-[#8B5CF6]/20">
            {language === 'EN' ? 'Student Dashboard' : 'વિદ્યાર્થી ક્ષેત્ર'}
          </span>
          <span className="text-xs font-bold text-slate-400">
            Std. {user?.standard || '10'} • {user?.branch || 'Vinayak'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 dark:text-white tracking-tight">
          {language === 'EN' ? `Welcome back, ${user?.name}!` : `સ્વાગત છે, ${user?.name}!`}
        </h1>
      </motion.div>

      {/* Global Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: HOME OVERVIEW SCREEN */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Subject Filter Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
              {language === 'EN' ? 'Subject:' : 'વિષય:'}
            </span>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all border shrink-0 cursor-pointer ${
                  selectedSubject === sub
                    ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* 4 Interactive Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Attendance */}
            <div
              onClick={() => handleTabChange('attendance')}
              className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-[#8B5CF6]/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                  <Percent className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {presentCount} / {totalClasses} Days
                </span>
              </div>
              <div className="mt-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  {language === 'EN' ? 'Attendance Rate' : 'હાજરીનો દર'}
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{attendanceRate}%</span>
                  <span className="text-xs font-bold text-slate-400">Present</span>
                </div>
              </div>
              <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 text-slate-300 dark:text-slate-700 transition-transform group-hover:translate-x-1 group-hover:text-[#8B5CF6]" />
            </div>

            {/* Card 2: Latest Test Marks */}
            <div
              onClick={() => handleTabChange('marks')}
              className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-[#8B5CF6]/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                  Avg {averageTestScore}%
                </span>
              </div>
              <div className="mt-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  {language === 'EN' ? 'Latest Test Score' : 'છેલ્લા ટેસ્ટ ગુણ'}
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white truncate max-w-[180px]">
                    {marks.length > 0 ? `${marks[0].marksObtained}/${marks[0].totalMarks}` : 'No Tests'}
                  </span>
                  <span className="text-xs font-bold text-[#8B5CF6]">
                    {marks.length > 0 ? `${Math.round((marks[0].marksObtained/marks[0].totalMarks)*100)}%` : ''}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 block mt-0.5 truncate">
                  {marks.length > 0 ? marks[0].testName : 'No test marks recorded'}
                </span>
              </div>
              <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 text-slate-300 dark:text-slate-700 transition-transform group-hover:translate-x-1 group-hover:text-[#8B5CF6]" />
            </div>

            {/* Card 3: Fees Status */}
            <div
              onClick={() => handleTabChange('fees')}
              className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-[#8B5CF6]/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl border ${totalPendingFees > 0 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  totalPendingFees > 0
                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                  {totalPendingFees > 0 ? 'Pending' : 'All Paid ✓'}
                </span>
              </div>
              <div className="mt-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  {language === 'EN' ? 'Tuition Fees Status' : 'ટ્યુશન ફી સ્થિતિ'}
                </span>
                <span className={`text-2xl font-black block tracking-tight ${totalPendingFees > 0 ? 'text-red-500 dark:text-orange-400' : 'text-emerald-500'}`}>
                  {totalPendingFees > 0 ? `₹${totalPendingFees.toLocaleString('en-IN')}` : 'All Paid ✓'}
                </span>
              </div>
              <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 text-slate-300 dark:text-slate-700 transition-transform group-hover:translate-x-1 group-hover:text-[#8B5CF6]" />
            </div>

            {/* Card 4: Student Profile Summary */}
            <div
              onClick={() => handleTabChange('profile')}
              className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-[#8B5CF6]/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-purple-500/10 text-[#8B5CF6] rounded-2xl border border-[#8B5CF6]/20">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase text-[#8B5CF6] bg-[#8B5CF6]/10 px-2.5 py-1 rounded-full border border-[#8B5CF6]/20">
                  Std. {user?.standard || '10'}
                </span>
              </div>
              <div className="mt-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  {language === 'EN' ? 'Student Profile' : 'પ્રોફાઇલ માહિતી'}
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white block truncate">
                  {user?.name}
                </span>
                <span className="text-xs font-semibold text-slate-400 block truncate mt-0.5">
                  {user?.branch}
                </span>
              </div>
              <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 text-slate-300 dark:text-slate-700 transition-transform group-hover:translate-x-1 group-hover:text-[#8B5CF6]" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE LOG */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center">
                <Calendar className="w-5 h-5 text-[#8B5CF6] mr-2" />
                {language === 'EN' ? 'Attendance Logs' : 'હાજરી વિગતો'}
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {language === 'EN' ? `Showing attendance records for ${selectedSubject || 'selected subject'}` : 'પસંદ કરેલ વિષય માટે દૈનિક હાજરી'}
              </p>
            </div>

            {/* Subject Filter Bar */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-3 pt-1 my-1">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border shrink-0 cursor-pointer ${
                    selectedSubject === sub
                      ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
            </div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-16 text-xs font-semibold border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-2 p-6">
              <Clock className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-1" />
              <span className="text-base font-black text-slate-700 dark:text-slate-300">No attendance logs found</span>
              <span className="text-slate-400 text-xs">No records registered for {selectedSubject || 'this subject'} yet.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attendance.map((rec) => (
                <div 
                  key={rec._id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                >
                  <div className="space-y-0.5 text-left">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                      {new Date(rec.date).toLocaleDateString(language === 'EN' ? 'en-US' : 'gu-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="block text-[10px] font-bold text-slate-400">
                      Subject: {rec.subject}
                    </span>
                  </div>
                  <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                    rec.status === 'present'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {rec.status === 'present' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MARKS & TEST GRADES */}
      {activeTab === 'marks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center">
                <Award className="w-5 h-5 text-[#8B5CF6] mr-2" />
                {language === 'EN' ? 'Test Grades & Scores' : 'ટેસ્ટ પરિણામો'}
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {language === 'EN' ? `Overall Average Score: ${averageTestScore}%` : `સરેરાશ પરિણામ: ${averageTestScore}%`}
              </p>
            </div>

            {/* Subject Filter Bar */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-3 pt-1 my-1">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border shrink-0 cursor-pointer ${
                    selectedSubject === sub
                      ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
            </div>
          ) : marks.length === 0 ? (
            <div className="text-center py-16 text-xs font-semibold border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-2 p-6">
              <Award className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-1" />
              <span className="text-base font-black text-slate-700 dark:text-slate-300">No test results found</span>
              <span className="text-slate-400 text-xs">No marks records uploaded for {selectedSubject || 'this subject'} yet.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {marks.map((mark) => {
                const pct = Math.round((mark.marksObtained / mark.totalMarks) * 100);
                return (
                  <div 
                    key={mark._id}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between"
                  >
                    <div className="space-y-1 text-left">
                      <span className="text-sm font-black text-slate-900 dark:text-white block">
                        {mark.testName}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 block">
                        Subject: {mark.subject} • Date: {new Date(mark.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-base font-black text-[#8B5CF6] block">
                        {mark.marksObtained} / {mark.totalMarks}
                      </span>
                      <span className="inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
                        {pct}% Score
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FEES STATUS & ONLINE PAYMENT */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {language === 'EN' ? 'Tuition Fees Status' : 'ટ્યુશન ફી વિગતો'}
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {language === 'EN' ? 'Monthly tuition fee liabilities & payment status' : 'માસિક ટ્યુશન ફી ની વિગત'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1">
                <div className="text-xs font-bold text-slate-500">
                  {language === 'EN' ? 'Monthly Rate:' : 'માસિક ફી:'}{' '}
                  <span className="font-black text-slate-800 dark:text-slate-200">
                    ₹{(MONTHLY_FEE_BY_STANDARD[user?.standard || ''] || 0).toLocaleString()}
                  </span>
                </div>
                <div className={`text-xs font-bold ${totalPendingFees > 0 ? 'text-red-500 dark:text-orange-400' : 'text-emerald-500'}`}>
                  {language === 'EN' ? 'Total Pending Amount:' : 'કુલ બાકી રકમ:'}{' '}
                  <span className="font-black text-sm">₹{totalPendingFees.toLocaleString('en-IN')}</span>
                </div>
                
                {upiSettings?.upiId && totalPendingFees > 0 && (
                  <button
                    onClick={handleOpenPayModal}
                    className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>{language === 'EN' ? 'Pay Fees Online' : 'ઓનલાઇન ફી ચૂકવો'}</span>
                  </button>
                )}
              </div>
            </div>

            {feesBreakdown.length === 0 ? (
              <div className="text-center py-12 text-xs font-semibold text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 mt-4">
                No fee records configured yet.
              </div>
            ) : (
              <div className="overflow-x-auto w-full mt-4">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                      <th className="py-3 px-4">Month</th>
                      <th className="py-3 px-4">Rate / Amount</th>
                      <th className="py-3 px-4">Payment Mode</th>
                      <th className="py-3 px-4">Payment Date</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {feesBreakdown.map((item) => {
                      const pendingClaim = paymentClaims.find((c: any) => c.monthYear === item.monthYear && c.status === 'pending');
                      const rejectedClaim = paymentClaims.find((c: any) => c.monthYear === item.monthYear && c.status === 'rejected');

                      return (
                        <tr key={item.monthYear} className="text-xs">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-200">
                            {formatMonthLabel(item.monthYear)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                            ₹{item.amount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-500 dark:text-slate-400 capitalize">
                            {item.paid ? item.mode : '-'}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-400">
                            {item.paid && item.paidAt ? new Date(item.paidAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {item.paid ? (
                              <div className="flex items-center justify-end space-x-2">
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  <Check className="w-3 h-3" />
                                  <span>Paid</span>
                                </span>
                                {item.paymentId && (
                                  <button
                                    onClick={() => handleDownloadReceipt(item.paymentId, item.monthYear)}
                                    disabled={downloadingReceiptId === item.paymentId}
                                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[10px] font-black bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/20 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                                    title={language === 'EN' ? 'Download Fee Receipt PDF' : 'ફી રસીદ PDF ડાઉનલોડ કરો'}
                                  >
                                    {downloadingReceiptId === item.paymentId ? (
                                      <Loader2 className="w-3 h-3 animate-spin text-[#8B5CF6]" />
                                    ) : (
                                      <Download className="w-3 h-3 text-[#8B5CF6]" />
                                    )}
                                    <span>
                                      {downloadingReceiptId === item.paymentId
                                        ? (language === 'EN' ? 'Saving...' : 'સેવ થઈ રહ્યું છે...')
                                        : (language === 'EN' ? 'Receipt' : 'રસીદ')}
                                    </span>
                                  </button>
                                )}
                              </div>
                            ) : pendingClaim ? (
                              <div className="flex flex-col items-end gap-1">
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  <Clock className="w-3 h-3 animate-pulse" />
                                  <span>Claim Pending</span>
                                </span>
                                <span className="text-[9px] font-mono text-slate-400">
                                  UTR: {pendingClaim.transactionId}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end gap-1.5">
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Pending</span>
                                </span>
                                <button
                                  onClick={() => handleOpenClaimModal(item.monthYear, item.amount)}
                                  className="px-2.5 py-1 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/20 text-[10px] font-black transition-all cursor-pointer"
                                >
                                  {rejectedClaim ? 'Resubmit Claim' : "I've Paid"}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT PROFILE */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm text-left">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="p-3 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-2xl border border-[#8B5CF6]/20">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {user?.name}
                </h2>
                <p className="text-xs font-semibold text-[#8B5CF6]">
                  Standard {user?.standard || '10'} • {user?.branch}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Registered Email</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{user?.email || 'N/A'}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Phone Contact</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{(user as any)?.phone || 'N/A'}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Assigned Branch</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{user?.branch || 'N/A'}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Enrolled Subjects</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {subjects.map((s) => (
                    <span key={s} className="px-2 py-0.5 text-[10px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-md border border-[#8B5CF6]/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Your Fees Modal */}
      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayModal(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl overflow-y-auto max-h-[85vh] text-left space-y-3 sm:space-y-3.5"
            >
              {/* Top Bar Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                      {language === 'EN' ? 'Pay Your Fees' : 'ફી ચૂકવો'}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                      {language === 'EN' ? 'Direct UPI Payment & Details' : 'સરળ UPI પેમેન્ટ વિગતો'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Amount Card */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                  {language === 'EN' ? 'Total Amount Due' : 'કુલ ભરવાપાત્ર રકમ'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  ₹{totalPendingFees.toLocaleString()}
                </span>
              </div>

              {/* UPI Info & Copy */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">Payee Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate ml-2">{cleanPayeeName}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="font-semibold text-slate-400">UPI ID:</span>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className="font-black text-[#8B5CF6] tracking-wide text-xs sm:text-sm truncate">{cleanUpiId}</span>
                    <button
                      onClick={handleCopyUpi}
                      className="p-1 sm:p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1 shrink-0"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[9px] sm:text-[10px] font-bold">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Simplified Helper Note */}
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] sm:text-[11px] text-blue-600 dark:text-blue-400 font-medium leading-relaxed flex items-start space-x-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p>
                  {language === 'EN'
                    ? 'Scan the QR code below with your UPI app (GPay/PhonePe/Paytm) to pay, or copy the UPI ID above to pay manually.'
                    : 'તમારી પેમેન્ટ એપ (GPay/PhonePe/Paytm) થી નીચેનો QR કોડ સ્કેન કરો અથવા ઉપર આપેલ UPI ID કૉપી કરીને મેન્યુઅલી ભરો.'}
                </p>
              </div>

              {/* QR Code Section & Download Button */}
              {qrDataUrl && (
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block">
                    {language === 'EN' ? 'Scan QR Code to Pay' : 'પેમેન્ટ કરવા માટે QR કોડ સ્કેન કરો'}
                  </span>
                  <div className="p-2.5 bg-white rounded-2xl border border-slate-200 dark:border-slate-800 inline-block shadow-sm">
                    <img src={qrDataUrl} alt="UPI Payment QR Code" className="w-36 h-36 sm:w-40 sm:h-40 mx-auto object-contain" />
                  </div>
                  <div>
                    <a
                      href={qrDataUrl}
                      download="Vinayak_Tuition_UPI_QR.png"
                      className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      <span>{language === 'EN' ? 'Download QR Code' : 'QR કોડ ડાઉનલોડ કરો'}</span>
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fixed Bottom Navigation Bar for Student Dashboard */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md">
        <div className="max-w-md mx-auto flex items-center justify-around py-2 px-2">
          {[
            { id: 'home', labelEN: 'Home', labelGJ: 'હોમ', icon: Home },
            { id: 'attendance', labelEN: 'Attendance', labelGJ: 'હાજરી', icon: Calendar },
            { id: 'marks', labelEN: 'Marks', labelGJ: 'ગુણ', icon: Award },
            { id: 'fees', labelEN: 'Fees', labelGJ: 'ફી', icon: DollarSign },
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
                  {language === 'GJ' ? item.labelGJ : item.labelEN}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
      </div>
    }>
      <StudentDashboardContent />
    </Suspense>
  );
}
