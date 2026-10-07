'use client';

import React, { useEffect } from 'react';
import { useMarketStore } from '@/store';
import Sidebar from '@/components/layout/Sidebar';
import FinceptBloombergHeader from '@/components/layout/FinceptBloombergHeader';
import StatusBar from '@/components/layout/StatusBar';
import FinceptRightDock from '@/components/layout/FinceptRightDock';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { theme } = useMarketStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light', theme === 'light');
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Authentic Fincept / Bloomberg Multi-Level Header */}
        <FinceptBloombergHeader />

        {/* Full-Width Content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <main className="flex-1 min-w-0 overflow-y-auto p-3 lg:p-4">
            {children}
          </main>
        </div>

        {/* Institutional Bottom Status Bar */}
        <StatusBar />
      </div>

      {/* Retractable Right Dock (Watchlist & Fast Order Desk) */}
      <FinceptRightDock />
    </div>
  );
}
