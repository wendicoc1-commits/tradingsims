import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'TradeSim Pro - Institutional Trading Simulator & FinTech Workstation',
  description:
    'Real-time multi-asset trading simulation, portfolio analytics, and quantitative execution engine for IDX & Crypto markets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark h-full antialiased">
      <body className="h-full overflow-hidden font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
