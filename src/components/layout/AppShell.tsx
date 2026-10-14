'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useMarketStore } from '@/store';
import { useAuthStore } from '@/store/useAuthStore';
import TradeSimHeader from '@/components/layout/TradeSimHeader';
import StatusBar from '@/components/layout/StatusBar';
import FinceptRightDock from '@/components/layout/FinceptRightDock';
import TradeSimAuthGate from '@/components/auth/TradeSimAuthGate';
import GlobalAutonomousAgentRunner from '@/components/ai/GlobalAutonomousAgentRunner';
import SkipToContent from '@/components/common/SkipToContent';
import { Toaster } from 'sonner';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { theme } = useMarketStore();
  const pathname = usePathname() || '';
  const isAdmin = pathname.startsWith('/admin');
  const isLanding = pathname === '/' || pathname === '/landing';
  const isTools = pathname.startsWith('/tools');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light', theme === 'light');
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  // Otomatis sinkronkan data member aktif ke Supabase Cloud saat login
  useEffect(() => {
    if (isAdmin || isLanding || isTools) return;
    const timer = setTimeout(() => {
      const authUser = useAuthStore.getState().user;
      if (authUser && authUser.email && authUser.provider !== 'guest') {
        useAuthStore.getState().syncPortfolioToDatabase().catch(() => {});
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isAdmin, isLanding, isTools]);

  // Pastikan rute admin, tools, dan landing page bisa scroll penuh secara alami
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isAdmin || isLanding || isTools) {
      document.body.classList.remove('overflow-hidden');
      document.body.classList.add('overflow-y-auto');
    } else {
      document.body.classList.remove('overflow-y-auto');
      document.body.classList.add('overflow-hidden');
    }
  }, [isAdmin, isLanding, isTools]);

  // Rute admin, landing page, dan tools memiliki layout scroll mandiri
  if (isAdmin || isLanding || isTools) {
    return (
      <>
        <Toaster position="top-right" theme="dark" richColors closeButton />
        {children}
      </>
    );
  }

  return (
    <TradeSimAuthGate>
      <Toaster position="top-right" theme={theme === 'light' ? 'light' : 'dark'} richColors closeButton />
      {/* Skip link — keyboard a11y: skip nav to main content */}
      <SkipToContent />
      <GlobalAutonomousAgentRunner />
      <div className="flex min-h-[100dvh] h-[100dvh] max-h-[100dvh] w-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Main Column (Full-Width without Sidebar) */}
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          {/* TradeSim Pro Header */}
          <header role="banner">
            <TradeSimHeader />
          </header>

          {/* Full-Width Content */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <main id="main-content" className="flex-1 min-w-0 overflow-y-auto p-3 lg:p-4" aria-label="Konten Utama TradeSim Pro">
              {children}
            </main>
          </div>

          {/* Bottom Status Bar */}
          <StatusBar />
        </div>

        {/* Retractable Right Dock (Watchlist & Fast Order Desk) */}
        <FinceptRightDock />
      </div>
    </TradeSimAuthGate>
  );
}
