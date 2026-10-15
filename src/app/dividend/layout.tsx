import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Kalender Dividen Saham IHSG & Yield Calculator - TradeSim Pro',
  description:
    'Jadwal dan kalender dividen saham Indonesia (BEI / IDX) terbaru. Cek tanggal Cum Date, Ex Date, Payment Date, dan estimasi dividen yield emiten terpopuler di TradeSim Pro.',
  keywords: [
    'kalender dividen saham',
    'jadwal dividen idx',
    'dividen yield saham indonesia',
    'cum date dividen hari ini',
    'saham dividen terbesar',
    'tradesim dividen',
  ],
  alternates: {
    canonical: `${SITE_URL}/dividend`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/dividend`,
    title: 'Kalender Dividen Saham IHSG Terbaru - TradeSim Pro',
    description: 'Pantau jadwal pembagian dividen emiten bursa saham Indonesia secara terstruktur dan real-time.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function DividendLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
