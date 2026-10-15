import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Kalkulator Dividen Saham & Dividend Yield BEI Realtime - TradeSim Pro',
  description:
    'Kalkulator dividen saham Indonesia (BEI / IDX) gratis. Hitung estimasi passive income dividen per tahun, dividend yield (%), jumlah lembar saham, dan estimasi pajak dividen secara akurat.',
  keywords: [
    'kalkulator dividen saham',
    'hitung dividen yield saham',
    'kalkulator passive income dividen',
    'cara hitung dividen saham',
    'dividen saham bei kalkulator',
    'dps dividen per lembar',
    'tradesim kalkulator dividen',
  ],
  alternates: {
    canonical: `${SITE_URL}/tools/kalkulator-dividen`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/tools/kalkulator-dividen`,
    title: 'Kalkulator Dividen Saham Indonesia & Yield - TradeSim Pro',
    description: 'Hitung estimasi pendapatan dividen saham dan dividend yield dengan mudah dan akurat.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function KalkulatorDividenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
