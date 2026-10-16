import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Istilah Bandarmologi Saham Lengkap: Akumulasi, Distribusi & Broker Summary | TradeSim Pro',
  description:
    'Kamus lengkap istilah bandarmologi saham Indonesia (BEI). Pahami arti akumulasi, distribusi, mark up, mark down, broker summary, foreign flow, dan cara membaca jejak smart money di TradeSim Pro.',
  keywords: [
    'istilah bandarmologi',
    'apa itu bandarmologi',
    'akumulasi saham',
    'distribusi saham',
    'broker summary saham',
    'cara baca broker summary',
    'kode broker saham',
    'foreign flow saham',
    'smart money indonesia',
    'bandar saham indonesia',
  ],
  alternates: {
    canonical: `${SITE_URL}/learn/istilah-bandarmologi-saham`,
  },
  openGraph: {
    type: 'article',
    locale: 'id_ID',
    url: `${SITE_URL}/learn/istilah-bandarmologi-saham`,
    title: 'Istilah Bandarmologi Saham Lengkap: Akumulasi, Distribusi & Broker Summary',
    description:
      'Panduan terlengkap memahami metode bandarmologi dan membaca pergerakan smart money di bursa saham Indonesia.',
    images: [`${SITE_URL}/og-preview.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Istilah Bandarmologi Saham Lengkap',
    description: 'Panduan memahami istilah bandarmologi dan cara mendeteksi akumulasi bandar.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
