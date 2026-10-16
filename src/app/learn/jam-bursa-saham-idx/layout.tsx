import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Jam Bursa Saham Indonesia (BEI / IDX) Terbaru: Jadwal Sesi 1, Sesi 2 & Pre-Opening | TradeSim Pro',
  description:
    'Jadwal lengkap jam perdagangan bursa efek Indonesia (BEI / IDX) hari Senin sampai Jumat. Info waktu sesi 1, sesi 2, pre-opening, pre-closing, auto rejection asimetris (ARA/ARB), dan jam trading crypto 24/7.',
  keywords: [
    'jam bursa saham',
    'jam buka bursa efek indonesia',
    'jam perdagangan bei',
    'sesi 1 saham jam berapa',
    'sesi 2 saham jam berapa',
    'jadwal bursa saham hari jumat',
    'jam pre opening saham',
    'jam pre closing saham',
    'auto rejection asimetris',
  ],
  alternates: {
    canonical: `${SITE_URL}/learn/jam-bursa-saham-idx`,
  },
  openGraph: {
    type: 'article',
    locale: 'id_ID',
    url: `${SITE_URL}/learn/jam-bursa-saham-idx`,
    title: 'Jam Bursa Saham Indonesia (BEI / IDX) Terbaru: Sesi 1 & 2, Pre-Opening',
    description:
      'Jadwal resmi jam operasional perdagangan saham BEI / IDX dari hari Senin sampai Jumat.',
    images: [`${SITE_URL}/og-preview.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jam Bursa Saham Indonesia (BEI / IDX) Terbaru',
    description: 'Jadwal jam perdagangan bursa efek Indonesia hari Senin - Jumat.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
