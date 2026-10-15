import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Workstation Terminal Trading Simulator - TradeSim Pro',
  description:
    'FinTech Workstation Terminal institusional untuk simulasi trading saham Indonesia (BEI) & crypto spot. Dilengkapi interactive chart, orderbook bid/offer level 2, paper trading, dan AI copilot.',
  keywords: [
    'terminal trading simulator',
    'workstation trading indonesia',
    'fincept terminal',
    'paper trading workstation',
    'trading simulator terminal',
    'tradesim terminal',
  ],
  alternates: {
    canonical: `${SITE_URL}/terminal`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/terminal`,
    title: 'Workstation Terminal Trading Simulator - TradeSim Pro',
    description: 'Workstation trading institusional interaktif untuk simulasi saham dan crypto tanpa risiko.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function TerminalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
