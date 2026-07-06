import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import CursorGlow from '@/components/ui/CursorGlow'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import { LanguageProvider } from '@/context/LanguageContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#8B5CF6',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://vinayaktuition.com'),
  title: 'Vinayak Tuition Classes | Best Coaching in Kalol',
  description: 'Vinayak Tuition Classes provides quality education with personal attention and strong academic guidance for students from Standard 1 to 12. English & Gujarati Medium in Kalol.',
  keywords: 'Tuition Classes in Kalol, Best Coaching Classes in Kalol, Commerce Tuition Classes, English Medium Tuition, Gujarati Medium Tuition, Standard 1 to 12, Vinayak Tuition, Education in Kalol',
  authors: [{ name: 'Vinayak Tuition Classes' }],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Vinayak Tuition Classes | Best Coaching in Kalol',
    description: 'Empowering minds, shaping futures. Premium quality education for English & Gujarati medium students in Kalol.',
    url: 'https://vinayaktuition.com',
    siteName: 'Vinayak Tuition Classes',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vinayak Tuition Classes',
    description: 'Premium quality education in Kalol.',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vinayak',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-darkObsidian dark:text-white antialiased selection:bg-accentViolet/20 selection:text-accentViolet min-h-screen flex flex-col transition-colors duration-300`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <CursorGlow />
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
