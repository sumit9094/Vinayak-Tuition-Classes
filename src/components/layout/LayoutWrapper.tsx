'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/ui/FloatingWhatsApp';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide layout elements on login, register, forgot-password, and admin routes
  const isAuthOrAdmin = 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/forgot-password' || 
    pathname.startsWith('/admin');

  return (
    <>
      {!isAuthOrAdmin && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAuthOrAdmin && <FloatingWhatsApp />}
      {!isAuthOrAdmin && <Footer />}
    </>
  );
}
