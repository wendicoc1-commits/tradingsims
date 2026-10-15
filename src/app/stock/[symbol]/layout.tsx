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
  const isCrypto = isCryptoSymbol(symbol) || symbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA'].includes(symbol);

  const assetName = asset?.name || (isCrypto ? `${symbol} / Tether US Dollar Spot` : `Saham ${symbol} (Bursa Efek Indonesia)`);
  const assetCategory = isCrypto ? 'Kripto Spot 24/7' : 'Saham BEI / IDX';

  const title = `Simulasi Trading ${symbol} (${assetName}) | Real-Time Chart & Orderbook`;
  const description = `Latihan paper trading dan simulasi investasi ${assetCategory} untuk ${symbol} (${assetName}) dengan modal virtual gratis Rp 50 Juta tanpa risiko uang riil. Akses chart candlestick real-time, orderbook level 2, dan radar bandarmologi di TradeSim Pro.`;
  const pageUrl = `${SITE_URL}/stock/${symbol}`;

  return {
    title,
    description,
    keywords: [
      `simulasi trading ${symbol}`,
      `paper trading ${symbol}`,
      `chart ${symbol} realtime`,
      `orderbook ${symbol}`,
      `harga ${symbol} hari ini`,
      `belajar trading ${symbol}`,
      `tradesim ${symbol}`,
      'trading simulator indonesia',
      'paper trading saham',
      'simulasi saham bei',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url: pageUrl,
      siteName: 'TradeSim Pro Workstation',
      title: `${title} - TradeSim Pro`,
      description,
      images: [
        {
          url: `${SITE_URL}/og-preview.png`,
          width: 1200,
          height: 630,
          alt: `Chart dan Orderbook Simulasi Trading ${symbol}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - TradeSim Pro`,
      description,
      images: [`${SITE_URL}/og-preview.png`],
    },
  };
}

export default async function StockDetailLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const symbol = decodeURIComponent(resolvedParams?.symbol || 'BBCA').toUpperCase();
  const pageUrl = `${SITE_URL}/stock/${symbol}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
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
        name: 'Pasar & Saham',
        item: `${SITE_URL}/markets`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `Simulasi ${symbol}`,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
