import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Bloomberg Terminal - Professional Market Data & Analytics',
  description: 'Enterprise Financial Terminal & Quantitative Market Intelligence for IDX & Global Markets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark h-full antialiased">
      <body className="h-full overflow-hidden font-mono">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
