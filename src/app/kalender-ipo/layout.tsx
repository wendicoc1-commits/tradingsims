import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Kalender IPO Saham 2026 - Jadwal Penawaran Umum Perdana BEI | TradeSim Pro',
  description:
    'Daftar lengkap jadwal kalender IPO saham Indonesia 2026. Pantau tanggal penawaran awal (Book Building), jadwal e-IPO, harga penawaran saham, dan prospektus calon emiten BEI.',
  keywords: [
    'kalender ipo 2026',
    'jadwal ipo saham indonesia',
    'saham calon ipo',
    'e-ipo bei jadwal',
    'harga saham ipo hari ini',
  ],
  alternates: {
    canonical: `${SITE_URL}/kalender-ipo`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/kalender-ipo`,
    title: 'Kalender IPO Saham 2026 - TradeSim Pro',
    description: 'Jadwal dan kalender calon emiten penawaran umum perdana saham Indonesia.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function KalenderIPOLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
