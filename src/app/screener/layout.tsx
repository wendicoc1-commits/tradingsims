import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Screener Saham IDX & Filter Fundamental Real-Time - TradeSim Pro',
  description:
    'Screener saham Indonesia (BEI / IDX) terlengkap. Filter emiten berdasarkan rasio PE, PBV, ROE, Dividend Yield, Volume, dan kriteria teknikal secara real-time di TradeSim Pro.',
  keywords: [
    'screener saham idx',
    'stock screener indonesia',
    'filter saham fundamental',
    'screener saham bei',
    'cari saham murah undervalued',
    'screening saham teknikal',
    'tradesim screener',
  ],
  alternates: {
    canonical: `${SITE_URL}/screener`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/screener`,
    title: 'Screener Saham IDX Real-Time - TradeSim Pro',
    description: 'Filter saham Indonesia terbaik dengan parameter fundamental dan teknikal akurat.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function ScreenerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
