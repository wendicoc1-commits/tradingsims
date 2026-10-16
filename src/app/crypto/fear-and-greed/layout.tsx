import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Crypto Fear and Greed Index Hari Ini - Indikator Sentimen Bitcoin & Altcoin | TradeSim Pro',
  description:
    'Pantau Crypto Fear and Greed Index real-time hari ini. Ketahui sentimen pasar kripto (Extreme Fear, Greed), siklus akumulasi Bitcoin, level support & resistance, dan simulasi trading kripto modal Rp 50 Juta di TradeSim Pro.',
  keywords: [
    'crypto fear and greed index hari ini',
    'indikator fear and greed bitcoin',
    'sentimen pasar crypto',
    'prediksi harga btc hari ini',
    'siklus bitcoin halving',
    'analisis teknikal crypto indonesia',
    'simulasi trading crypto',
  ],
  alternates: {
    canonical: `${SITE_URL}/crypto/fear-and-greed`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/crypto/fear-and-greed`,
    title: 'Crypto Fear and Greed Index Hari Ini - TradeSim Pro',
    description: 'Indikator sentimen pasar Bitcoin dan altcoin terlengkap dengan visualisasi gauge real-time.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function CryptoFearAndGreedLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Pasar Kripto', item: `${SITE_URL}/crypto` },
          { '@type': 'ListItem', position: 3, name: 'Fear and Greed Index', item: `${SITE_URL}/crypto/fear-and-greed` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Apa arti skor pada Crypto Fear and Greed Index?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Skor 0–24 menunjukkan Extreme Fear (ketakutan ekstrem/fase diskon akumulasi), 25–49 menunjukkan Fear, 50 menunjukkan Netral, 51–74 menunjukkan Greed, dan 75–100 menunjukkan Extreme Greed (keserakahan ekstrem/pasar rawan koreksi).',
            },
          },
          {
            '@type': 'Question',
            name: 'Kapan waktu terbaik membeli Bitcoin berdasarkan Fear & Greed?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Secara historis, membeli saat indikator berada di zona Extreme Fear (di bawah skor 20) memberikan rasio keuntungan jangka panjang (risk-reward) terbaik.',
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
