import type { Metadata } from 'next';
import React from 'react';
import { getAssetBySymbol, isCryptoSymbol } from '@/lib/universe/masterAssetUniverse';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

interface Props {
  params: Promise<{ symbol: string }> | { symbol: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSymbol = resolvedParams?.symbol || 'BBCA';
  const symbol = decodeURIComponent(rawSymbol).toUpperCase();

  const asset = getAssetBySymbol(symbol);
  const isCrypto = isCryptoSymbol(symbol) || symbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL'].includes(symbol);
  const name = asset?.name || (isCrypto ? `${symbol} Crypto` : `Saham ${symbol}`);

  const title = `Analisis Fundamental & Valuasi ${symbol} (${name}) - Piotroski Score & Nilai Wajar | TradeSim Pro`;
  const description = `Analisis mendalam fundamental saham ${symbol} (${name}). Cek skor kesehatan keuangan (Piotroski F-Score), estimasi nilai wajar (Fair Value), rasio valuasi PER & PBV, ROE, tingkat utang, dan rekomendasi di TradeSim Pro.`;
  const pageUrl = `${SITE_URL}/analisis/${symbol}`;

  return {
    title,
    description,
    keywords: [
      `analisis fundamental ${symbol}`,
      `nilai wajar saham ${symbol}`,
      `fair value ${symbol}`,
      `piotroski score ${symbol}`,
      `valuasi per pbv ${symbol}`,
      `apakah saham ${symbol} bagus`,
      `rekomendasi beli ${symbol}`,
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'article',
      locale: 'id_ID',
      url: pageUrl,
      title,
      description,
      images: [`${SITE_URL}/og-preview.png`],
    },
  };
}

export default async function AnalisisLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const rawSymbol = resolvedParams?.symbol || 'BBCA';
  const symbol = decodeURIComponent(rawSymbol).toUpperCase();
  const pageUrl = `${SITE_URL}/analisis/${symbol}`;
  const asset = getAssetBySymbol(symbol);
  const name = asset?.name || `Saham ${symbol}`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Analisis Saham', item: `${SITE_URL}/markets` },
          { '@type': 'ListItem', position: 3, name: `Analisis ${symbol}`, item: pageUrl },
        ],
      },
      {
        '@type': 'Article',
        headline: `Analisis Fundamental & Valuasi Nilai Wajar ${symbol} (${name})`,
        description: `Laporan diagnostik komprehensif kesehatan finansial, valuasi rasio, dan skor Piotroski emiten ${symbol}.`,
        publisher: {
          '@type': 'Organization',
          name: 'TradeSim Pro Quantitative Desk',
          url: SITE_URL,
        },
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
