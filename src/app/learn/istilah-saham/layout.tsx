import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Kamus Istilah Saham & Pasar Modal Indonesia (A-Z) - TradeSim Pro',
  description:
    'Glosarium dan kamus lengkap istilah saham Indonesia: Arti Bid & Offer, Lot, HAKA, HAKI, ARA, ARB, Cut Loss, Dividen, PER, PBV, Bandarmologi, dan cara mempraktikkannya di simulator saham TradeSim Pro.',
  keywords: [
    'kamus istilah saham',
    'arti bid offer saham',
    'apa itu lot saham',
    'arti haka haki',
    'istilah pasar modal indonesia',
    'apa itu ara arb',
    'istilah bandarmologi',
    'belajar saham pemula',
    'glosarium saham bei',
    'tradesim kamus saham',
  ],
  alternates: {
    canonical: `${SITE_URL}/learn/istilah-saham`,
  },
  openGraph: {
    type: 'article',
    locale: 'id_ID',
    url: `${SITE_URL}/learn/istilah-saham`,
    title: 'Kamus Istilah Saham & Pasar Modal Indonesia Terlengkap - TradeSim Pro',
    description: 'Panduan lengkap istilah-istilah wajib di bursa saham Indonesia yang sering digunakan trader dan investor.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function IstilahSahamLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE_URL}/learn/istilah-saham#terms`,
    name: 'Kamus Istilah Saham Indonesia TradeSim Pro',
    description: 'Kumpulan definisi istilah pasar modal Indonesia (BEI / IDX) untuk edukasi trader pemula.',
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
