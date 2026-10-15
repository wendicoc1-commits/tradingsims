import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Heatmap Pasar Saham Indonesia (IHSG Sektoral) - TradeSim Pro',
  description:
    'Visualisasi peta panas (Heatmap) saham Indonesia (BEI / IDX) berdasarkan kapitalisasi pasar dan pergerakan persentase harga harian real-time di TradeSim Pro.',
  keywords: [
    'heatmap saham indonesia',
    'peta panas saham idx',
    'stock heatmap ihsg',
    'sektoral saham hijau merah',
    'tradesim heatmap',
  ],
  alternates: {
    canonical: `${SITE_URL}/heatmap`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/heatmap`,
    title: 'Heatmap Pasar Saham Indonesia Real-Time - TradeSim Pro',
    description: 'Visualisasi interaktif pergerakan seluruh saham bursa efek Indonesia.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function HeatmapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
