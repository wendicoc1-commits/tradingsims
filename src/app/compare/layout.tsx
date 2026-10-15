import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Komparasi Saham & Perbandingan Valuasi Multi-Emiten - TradeSim Pro',
  description:
    'Bandingkan kinerja keuangan, profitabilitas, valuasi PE/PBV, dan dividend yield antar emiten saham Indonesia secara berdampingan di TradeSim Pro.',
  keywords: [
    'komparasi saham',
    'bandingkan saham idx',
    'perbandingan valuasi saham',
    'komparasi emiten perbankan bbca bbri',
    'tradesim compare',
  ],
  alternates: {
    canonical: `${SITE_URL}/compare`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/compare`,
    title: 'Bandingkan Kinerja Saham Indonesia - TradeSim Pro',
    description: 'Komparasi mendalam valuasi fundamental dan kinerja emiten bursa efek.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
