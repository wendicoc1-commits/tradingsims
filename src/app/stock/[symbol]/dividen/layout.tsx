import type { Metadata } from 'next';
import React from 'react';
import { getAssetBySymbol } from '@/lib/universe/masterAssetUniverse';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

interface Props {
  params: Promise<{ symbol: string }> | { symbol: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const symbol = decodeURIComponent(resolvedParams?.symbol || 'BBCA').toUpperCase();
  const asset = getAssetBySymbol(symbol);
  const name = asset?.name || `Saham ${symbol}`;

  const title = `Jadwal & Histori Dividen ${symbol} (${name}) 2026 - Yield, Cum Date & DPS | TradeSim Pro`;
  const description = `Pantau jadwal dividen ${symbol} (${name}) terbaru tahun 2026. Cek tanggal Cum Date, Ex Date, Dividen per Lembar (DPS), Dividend Yield, riwayat pembayaran 5 tahun terakhir, dan kalkulator simulasi dividen.`;
  const pageUrl = `${SITE_URL}/stock/${symbol}/dividen`;

  return {
    title,
    description,
    keywords: [
      `dividen ${symbol}`,
      `jadwal dividen ${symbol} 2026`,
      `cum date dividen ${symbol}`,
      `dividend yield ${symbol}`,
      `dps ${symbol}`,
      `pembagian dividen ${symbol}`,
      `kalkulator dividen ${symbol}`,
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

export default async function StockDividendLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const symbol = decodeURIComponent(resolvedParams?.symbol || 'BBCA').toUpperCase();
  const pageUrl = `${SITE_URL}/stock/${symbol}/dividen`;
  const asset = getAssetBySymbol(symbol);
  const name = asset?.name || `Saham ${symbol}`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Kalender Dividen', item: `${SITE_URL}/dividend` },
          { '@type': 'ListItem', position: 3, name: `Dividen ${symbol}`, item: pageUrl },
        ],
      },
      {
        '@type': 'FinancialProduct',
        name: `Dividen Saham ${symbol} - ${name}`,
        tickerSymbol: symbol,
        description: `Informasi pembagian dividen tunai emiten ${symbol} (${name}) terdaftar di Bursa Efek Indonesia.`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Berapa perkiraan dividen saham ${symbol} per lembar?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Dividen ${symbol} diumumkan secara resmi setelah persetujuan Rapat Umum Pemegang Saham Tahunan (RUPST). Cek tabel histori dividen dan yield real-time di TradeSim Pro.`,
            },
          },
          {
            '@type': 'Question',
            name: `Kapan batas waktu membeli saham ${symbol} agar dapat dividen?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Anda wajib membeli dan menyimpan saham ${symbol} selambat-lambatnya pada tanggal Cum Date di pasar reguler dan pasar negosiasi.`,
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
