import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Cara Main Saham untuk Pemula dari Nol: Panduan Lengkap & Simulasi Gratis | TradeSim Pro',
  description:
    'Panduan lengkap dan praktis cara main saham pemula di Indonesia (BEI / IDX) dari nol. Pelajari cara beli saham, istilah 1 lot, membaca candlestick, memilih sekuritas, dan latihan simulasi modal virtual Rp 50 Juta.',
  keywords: [
    'cara main saham pemula',
    'belajar saham dari nol',
    'cara investasi saham',
    'panduan main saham',
    'cara beli saham di bei',
    'modal main saham pemula',
    'simulasi trading saham pemula',
    'belajar trading gratis',
  ],
  alternates: {
    canonical: `${SITE_URL}/learn/cara-main-saham-pemula`,
  },
  openGraph: {
    type: 'article',
    locale: 'id_ID',
    url: `${SITE_URL}/learn/cara-main-saham-pemula`,
    title: 'Cara Main Saham untuk Pemula dari Nol: Panduan Praktis & Simulasi Gratis',
    description:
      'Langkah demi langkah memahami cara kerja pasar saham Indonesia (BEI), istilah dasar, dan tips cuan tanpa risiko dengan paper trading.',
    images: [`${SITE_URL}/og-preview.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cara Main Saham untuk Pemula dari Nol: Panduan Lengkap',
    description: 'Panduan lengkap cara main saham dari nol untuk pemula di Indonesia.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
