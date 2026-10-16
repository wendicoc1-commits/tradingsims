import type { Metadata } from 'next';
import React from 'react';
import { getAssetBySymbol } from '@/lib/universe/masterAssetUniverse';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

interface Props {
  params: Promise<{ pair: string }> | { pair: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const rawPair = resolvedParams?.pair || 'bbca-vs-bbri';
  const parts = decodeURIComponent(rawPair).toLowerCase().split('-vs-');
  const sym1 = (parts[0] || 'BBCA').toUpperCase();
  const sym2 = (parts[1] || 'BBRI').toUpperCase();

  const asset1 = getAssetBySymbol(sym1);
  const asset2 = getAssetBySymbol(sym2);

  const name1 = asset1?.name || sym1;
  const name2 = asset2?.name || sym2;

  const title = `Perbandingan ${sym1} vs ${sym2}: Analisis Fundamental, Valuasi & Grafik | TradeSim Pro`;
  const description = `Bandingkan saham ${sym1} (${name1}) vs ${sym2} (${name2}) secara mendalam: Perbandingan valuasi P/E, PBV, Dividend Yield, Market Cap, analisis broker, dan simulasi paper trading real-time di TradeSim Pro.`;
  const pageUrl = `${SITE_URL}/compare/${rawPair.toLowerCase()}`;

  return {
    title,
    description,
    keywords: [
      `${sym1} vs ${sym2}`,
      `perbandingan ${sym1} ${sym2}`,
      `bagus mana ${sym1} atau ${sym2}`,
      `valuasi ${sym1} vs ${sym2}`,
      `dividen ${sym1} vs ${sym2}`,
      `komparasi saham idx`,
      'trading simulator indonesia',
      'analisis fundamental komparatif',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url: pageUrl,
      title,
      description,
      images: [
        {
          url: `${SITE_URL}/og-preview.png`,
          width: 1200,
          height: 630,
          alt: `Komparasi Saham ${sym1} vs ${sym2}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/og-preview.png`],
    },
  };
}

export default async function ComparePairLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const rawPair = resolvedParams?.pair || 'bbca-vs-bbri';
  const parts = decodeURIComponent(rawPair).toLowerCase().split('-vs-');
  const sym1 = (parts[0] || 'BBCA').toUpperCase();
  const sym2 = (parts[1] || 'BBRI').toUpperCase();
  const pageUrl = `${SITE_URL}/compare/${rawPair.toLowerCase()}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Beranda',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Komparasi Saham',
            item: `${SITE_URL}/compare`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${sym1} vs ${sym2}`,
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'ItemList',
        name: `Perbandingan Valuasi ${sym1} vs ${sym2}`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: sym1,
            url: `${SITE_URL}/stock/${sym1}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: sym2,
            url: `${SITE_URL}/stock/${sym2}`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Antara ${sym1} dan ${sym2}, mana yang memiliki dividen lebih tinggi?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Perbandingan dividen ${sym1} vs ${sym2} bergantung pada dividend payout ratio dan yield tahunan masing-masing emiten. Anda dapat melihat yield riil dan jadwal cum-date lengkap di TradeSim Pro.`,
            },
          },
          {
            '@type': 'Question',
            name: `Bagaimana cara menguji simulasi trading ${sym1} dan ${sym2}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Di TradeSim Pro, Anda mendapatkan modal virtual gratis Rp 50.000.000 untuk mengeksekusi order beli/jual pada kedua saham ini secara real-time tanpa risiko uang asli.`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
