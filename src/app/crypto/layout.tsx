import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Simulator Trading Crypto 24/7 Realtime (BTC, ETH, SOL) - TradeSim Pro',
  description:
    'Latihan trading crypto spot 24/7 tanpa risiko dengan modal virtual gratis. Pantau harga real-time Bitcoin (BTC), Ethereum (ETH), Solana (SOL), orderbook, dan chart candlestick di TradeSim Pro.',
  keywords: [
    'simulator trading crypto',
    'paper trading crypto indonesia',
    'simulasi trading bitcoin',
    'belajar trading crypto gratis',
    'chart crypto realtime',
    'tradesim crypto',
    'trading simulator crypto 24 jam',
  ],
  alternates: {
    canonical: `${SITE_URL}/crypto`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/crypto`,
    title: 'Simulator Trading Crypto 24/7 Realtime - TradeSim Pro',
    description: 'Platform simulasi paper trading crypto spot 24/7 tanpa risiko kerugian uang riil dengan chart real-time.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function CryptoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
