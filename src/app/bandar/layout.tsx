import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Radar Bandarmologi & Broker Summary Saham BEI - TradeSim Pro',
  description:
    'Analisis aliran dana institusi dan bandarmologi saham Indonesia (BEI / IDX). Pantau akumulasi vs distribusi, broker summary harian, dan foreign flow net buy/sell di TradeSim Pro.',
  keywords: [
    'bandarmologi saham',
    'broker summary idx',
    'akumulasi distribusi saham',
    'foreign flow saham bei',
    'analisis bandar saham',
    'radar bandarmologi realtime',
    'tradesim bandar',
  ],
  alternates: {
    canonical: `${SITE_URL}/bandar`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/bandar`,
    title: 'Radar Bandarmologi & Broker Summary - TradeSim Pro',
    description: 'Pantau akumulasi dan distribusi bandar serta aliran dana asing di bursa saham Indonesia.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function BandarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
