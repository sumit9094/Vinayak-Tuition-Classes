'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/ui/FloatingWhatsApp';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide layout elements on login, register, forgot-password, and dashboard routes
  const isAuthOrDashboard = 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/forgot-password' || 
    pathname.startsWith('/admin') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/student');

  return (
    <>
      {!isAuthOrDashboard && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAuthOrDashboard && <FloatingWhatsApp />}
      {!isAuthOrDashboard && <Footer />}
    </>
  );
}
