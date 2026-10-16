import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Kalender IPO Saham BEI 2026 - Jadwal Penawaran, Prospektus & Underwriter | TradeSim Pro',
  description:
    'Jadwal dan kalender IPO saham Indonesia (BEI / IDX) terbaru 2026. Pantau tanggal Book Building, Penawaran Umum (Offering), Penjatahan, Estimasi Listing, harga penawaran, dan simulator penjatahan e-IPO.',
  keywords: [
    'jadwal ipo saham 2026',
    'kalender ipo bei',
    'saham ipo terbaru',
    'harga penawaran ipo',
    'prospektus ipo saham',
    'e-ipo indonesia',
    'underwriter ipo',
    'kalkulator penjatahan ipo',
  ],
  alternates: {
    canonical: `${SITE_URL}/ipo`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/ipo`,
    title: 'Kalender IPO Saham BEI 2026 - TradeSim Pro',
    description:
      'Pantau jadwal calon emiten bursa saham Indonesia yang sedang dalam masa Book Building, Offering, dan Listing secara real-time.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function IPOLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Kalender IPO', item: `${SITE_URL}/ipo` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Apa itu masa Book Building dalam proses IPO saham?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Book Building adalah masa penawaran awal di mana calon investor dapat menyampaikan minat pemesanan saham pada rentang harga tertentu sebelum harga final IPO ditetapkan.',
            },
          },
          {
            '@type': 'Question',
            name: 'Bagaimana cara memesan saham IPO melalui sistem e-IPO?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Pemesanan saham IPO dilakukan secara elektronik melalui platform e-IPO BEI menggunakan SID (Single Investor Identification) dan rekening RDN sekuritas terdaftar.',
            },
          },
          {
            '@type': 'Question',
            name: 'Apakah semua pemesanan saham IPO pasti mendapatkan jatah penuh?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Tidak selalu. Jika terjadi oversubscribed (kelebihan permintaan), penjatahan akan dialokasikan secara proporsional sesuai mekanisme penjatahan pasti (fixed allotment) dan terpusat (pooling allotment).',
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
