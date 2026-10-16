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
  const exchangeName = isCrypto ? 'Binance Spot' : 'Bursa Efek Indonesia (IDX)';

  const title = `Harga ${symbol} Hari Ini (${assetName}), Chart & Simulasi Trading | TradeSim Pro`;
  const description = `Pantau harga saham & kripto ${symbol} (${assetName}) real-time di ${exchangeName}. Akses chart teknikal candlestick interaktif, orderbook bid/offer level 2, analisis bandarmologi, dan simulasi paper trading gratis modal Rp 50 Juta di TradeSim Pro.`;
  const pageUrl = `${SITE_URL}/stock/${symbol}`;
  const ogImageUrl = `${SITE_URL}/stock/${symbol}/opengraph-image`;

  return {
    title,
    description,
    keywords: [
      `harga ${symbol} hari ini`,
      `saham ${symbol}`,
      `chart ${symbol} realtime`,
      `orderbook ${symbol}`,
      `analisis teknikal ${symbol}`,
      `simulasi trading ${symbol}`,
      `paper trading ${symbol}`,
      `bandarmologi ${symbol}`,
      `dividend ${symbol}`,
      'trading simulator indonesia',
      'paper trading saham bei',
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
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Chart & Orderbook Simulasi Trading ${symbol} - ${assetName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - TradeSim Pro`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function StockDetailLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const symbol = decodeURIComponent(resolvedParams?.symbol || 'BBCA').toUpperCase();
  const pageUrl = `${SITE_URL}/stock/${symbol}`;

  const asset = getAssetBySymbol(symbol);
  const isCrypto = isCryptoSymbol(symbol) || symbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA'].includes(symbol);
  const assetName = asset?.name || (isCrypto ? `${symbol} Crypto Spot` : `Saham ${symbol}`);
  const exchangeName = isCrypto ? 'Binance Spot 24/7' : 'Bursa Efek Indonesia (IDX)';
  const currency = isCrypto ? 'USD' : 'IDR';

  const stockGraphSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
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
            name: isCrypto ? 'Pasar Crypto' : 'Pasar Saham IDX',
            item: isCrypto ? `${SITE_URL}/crypto` : `${SITE_URL}/markets`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${symbol} - ${assetName}`,
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'FinancialProduct',
        '@id': `${pageUrl}#product`,
        name: `${symbol} - ${assetName}`,
        tickerSymbol: symbol,
        category: isCrypto ? 'Cryptocurrency' : 'Equities',
        description: `Instrumen keuangan ${symbol} (${assetName}) yang diperdagangkan di ${exchangeName}. Tersedia untuk simulasi paper trading real-time di TradeSim Pro.`,
        feesAndCommissionsSpecification: 'Simulasi gratis modal virtual Rp 50.000.000 (0% risiko uang riil)',
        offers: {
          '@type': 'Offer',
          priceCurrency: currency,
          price: asset?.defaultPrice || 1000,
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: `Bagaimana cara simulasi trading ${symbol} gratis tanpa modal uang asli?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Di TradeSim Pro, Anda dapat langsung melakukan paper trading untuk ${symbol} (${assetName}) menggunakan modal virtual gratis Rp 50.000.000. Cukup buka halaman ${symbol}, tentukan jumlah lot atau koin, dan pasang order Market atau Limit tanpa risiko finansial nyata.`,
            },
          },
          {
            '@type': 'Question',
            name: `Apakah data chart dan orderbook ${symbol} di TradeSim Pro diperbarui real-time?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Ya, chart candlestick teknikal, bid/offer orderbook level 2, dan volume perdagangan ${symbol} dihubungkan langsung dengan feed pasar ${exchangeName} secara real-time.`,
            },
          },
          {
            '@type': 'Question',
            name: `Fitur analisis apa saja yang tersedia untuk emiten ${symbol}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `TradeSim Pro menyediakan chart interaktif TradingView, indikator teknikal (RSI, MACD, EMA), ringkasan broker bandarmologi, konsensus analis Bloomberg, kalender dividen, dan corporate action untuk ${symbol}.`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stockGraphSchema) }}
      />
      {children}
    </>
  );
}
