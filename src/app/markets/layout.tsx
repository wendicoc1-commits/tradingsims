import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Peta Pasar Saham IHSG, Sektoral & Indeks Global - TradeSim Pro',
  description:
    'Pantau kondisi pasar modal Indonesia (IHSG), pergerakan indeks sektoral (Financials, Energy, Basic Tech), top gainers, top losers, dan indeks bursa saham global secara real-time di TradeSim Pro.',
  keywords: [
    'peta pasar saham',
    'ihsg hari ini',
    'indeks sektoral bei',
    'top gainer saham',
    'pasar modal indonesia realtime',
    'tradesim markets',
  ],
  alternates: {
    canonical: `${SITE_URL}/markets`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/markets`,
    title: 'Peta Pasar Saham IHSG & Sektoral Real-Time - TradeSim Pro',
    description: 'Overview menyeluruh bursa efek Indonesia dan indeks sektoral terupdate.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function MarketsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
