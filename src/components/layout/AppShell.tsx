'use client';

import React, { useEffect } from 'react';
import { useMarketStore } from '@/store';
import Sidebar from '@/components/layout/Sidebar';
import TradeSimHeader from '@/components/layout/TradeSimHeader';
import StatusBar from '@/components/layout/StatusBar';
import FinceptRightDock from '@/components/layout/FinceptRightDock';
import TradeSimAuthGate from '@/components/auth/TradeSimAuthGate';
import GlobalAutonomousAgentRunner from '@/components/ai/GlobalAutonomousAgentRunner';
import SkipToContent from '@/components/common/SkipToContent';
import { Toaster } from 'sonner';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { theme } = useMarketStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light', theme === 'light');
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return (
    <TradeSimAuthGate>
      <Toaster position="top-right" theme={theme === 'light' ? 'light' : 'dark'} richColors closeButton />
      {/* Skip link — keyboard a11y: skip nav to main content */}
      <SkipToContent />
      <GlobalAutonomousAgentRunner />
      <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Column */}
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
