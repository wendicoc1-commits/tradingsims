import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
  children: React.ReactNode;
}

const PASAR_TITLES: Record<string, { title: string; desc: string; keywords: string[] }> = {
  'top-gainers': {
    title: 'Top Gainers Saham Hari Ini - Saham Paling Naik di BEI / IDX | TradeSim Pro',
    desc: 'Daftar saham dengan kenaikan persentase harga tertinggi (Top Gainers) di Bursa Efek Indonesia hari ini. Pantau volume transaksi, perubahan harga, dan analisis teknikal.',
    keywords: ['top gainers hari ini', 'saham paling naik hari ini', 'top gainers bei', 'saham ara hari ini', 'rekomendasi saham hari ini'],
  },
  'top-losers': {
    title: 'Top Losers Saham Hari Ini - Saham Paling Turun di BEI / IDX | TradeSim Pro',
    desc: 'Daftar saham dengan penurunan harga terbesar (Top Losers) di Bursa Efek Indonesia hari ini. Analisis potensi pantulan teknikal (oversold bounce) dan akumulasi bandar.',
    keywords: ['top losers hari ini', 'saham paling turun hari ini', 'top losers bei', 'saham arb hari ini', 'saham oversold rsi'],
  },
  'foreign-flow': {
    title: 'Saham Akumulasi Asing Hari Ini - Net Foreign Buy & Sell Terbesar | TradeSim Pro',
    desc: 'Pantau arus dana investor asing (Foreign Flow) di Bursa Efek Indonesia hari ini. Cek saham yang paling banyak diborong (Net Foreign Buy) dan dijual asing secara real-time.',
    keywords: ['foreign flow hari ini', 'saham dibeli asing hari ini', 'net foreign buy ihsg', 'akumulasi asing saham', 'aliran dana asing bursa'],
  },
  'lq45-terbaik': {
    title: 'Saham LQ45 Terbaik & Terpopuler - Indeks Bluechip Likuiditas Tinggi | TradeSim Pro',
    desc: 'Daftar 45 saham paling likuid dengan fundamental kuat (Indeks LQ45) di Bursa Efek Indonesia. Cek valuasi PER, PBV, dividend yield, dan simulasi trading tanpa risiko.',
    keywords: ['saham lq45 terbaik', 'daftar saham lq45', 'saham bluechip indonesia', 'saham paling aman untuk pemula', 'investasi saham lq45'],
  },
  'saham-dividen-tertinggi': {
    title: 'Daftar Saham Dividen Yield Tertinggi di IHSG 2026 | TradeSim Pro',
    desc: 'Peringkat emiten bursa saham Indonesia dengan pembagian dividend yield terbesar tahun 2026. Pantau tanggal Cum Date dan rasio pembayaran dividen (DPR).',
    keywords: ['saham dividen yield tertinggi', 'saham dividen terbesar', 'saham dividen jumbo', 'dividen yield ihsg', 'saham passive income'],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || 'top-gainers';
  const info = PASAR_TITLES[slug] || {
    title: 'Data & Pergerakan Pasar Saham Indonesia - TradeSim Pro',
    desc: 'Pantau pergerakan harga saham, volume transaksi, dan arus dana investor di Bursa Efek Indonesia secara real-time.',
    keywords: ['pasar saham indonesia', 'ihsg hari ini', 'bursa efek indonesia'],
  };

  const pageUrl = `${SITE_URL}/pasar/${slug}`;

  return {
    title: info.title,
    description: info.desc,
    keywords: info.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url: pageUrl,
      title: info.title,
      description: info.desc,
      images: [`${SITE_URL}/og-preview.png`],
    },
  };
}

export default async function PasarLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || 'top-gainers';
  const info = PASAR_TITLES[slug] || { title: 'Pasar Saham' };
  const pageUrl = `${SITE_URL}/pasar/${slug}`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Pasar', item: `${SITE_URL}/markets` },
          { '@type': 'ListItem', position: 3, name: info.title, item: pageUrl },
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
