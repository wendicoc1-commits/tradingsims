import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Kalender Dividen Saham IHSG 2026 - Jadwal Cum Date & Yield Tertinggi | TradeSim Pro',
  description:
    'Kalender dan jadwal dividen saham BEI / IDX terlengkap 2026. Pantau tanggal Cum Date, Ex Date, Recording Date, Pembayaran DPS, dan daftar saham dividen yield terbesar di TradeSim Pro.',
  keywords: [
    'kalender dividen saham 2026',
    'jadwal dividen saham ihsg',
    'cum date dividen hari ini',
    'saham dividen yield tertinggi',
    'jadwal dividen bbca',
    'jadwal dividen ptba',
    'dividen saham bumn',
    'kalkulator dividen saham',
  ],
  alternates: {
    canonical: `${SITE_URL}/kalender-dividen`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/kalender-dividen`,
    title: 'Kalender Dividen Saham IHSG 2026 - TradeSim Pro',
    description:
      'Pantau jadwal pembagian dividen emiten bursa saham Indonesia (BEI) secara real-time lengkap dengan tanggal Cum Date dan yield tertinggi.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function KalenderDividenLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Kalender Dividen', item: `${SITE_URL}/kalender-dividen` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Apa itu Cum Date dalam pembagian dividen saham?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Cum Date (Cumulative Date) adalah batas hari terakhir bagi investor untuk membeli atau memiliki saham suatu emiten agar berhak menerima pembagian dividen tunai.',
            },
          },
          {
            '@type': 'Question',
            name: 'Kapan dividen saham masuk ke rekening RDN?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Dividen tunai akan otomatis ditransfer ke Rekening Dana Nasabah (RDN) investor pada tanggal Pembayaran (Payment Date), biasanya 2–3 minggu setelah Recording Date.',
            },
          },
          {
            '@type': 'Question',
            name: 'Bagaimana cara menghitung Dividend Yield saham?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Dividend Yield dihitung dengan membagi Dividen per Lembar Saham (DPS) dengan harga pasar saham saat ini, lalu dikalikan 100%. Contoh: Dividen Rp 500 dengan harga saham Rp 5.000 menghasilkan yield 10%.',
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
