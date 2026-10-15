import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Turnamen Trading Simulator Saham & Crypto Berhadiah - TradeSim Pro',
  description:
    'Ikuti kejuaraan trading simulator saham Indonesia dan crypto spot di TradeSim Pro. Buktikan keahlian analisis investasi Anda, raih peringkat teratas leaderboard, dan menangkan hadiah menarik tanpa risiko modal nyata.',
  keywords: [
    'turnamen trading simulator',
    'kompetisi trading saham',
    'trading championship indonesia',
    'liga trading paper simulator',
    'lomba trading saham gratis',
    'tradesim championship',
  ],
  alternates: {
    canonical: `${SITE_URL}/championship`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/championship`,
    title: 'Turnamen Trading Simulator Berhadiah - TradeSim Pro',
    description: 'Kompetisi trading simulasi saham dan kripto bergengsi di Indonesia.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function ChampionshipLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
