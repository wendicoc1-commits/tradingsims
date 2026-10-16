import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Kalkulator CAGR Saham & Investasi (Compound Annual Growth Rate) | TradeSim Pro',
  description:
    'Hitung tingkat pertumbuhan tahunan majemuk (CAGR) investasi saham, reksa dana, dan portofolio Anda secara akurat. Gratis kalkulator CAGR, rumus matematis, dan simulasi compound interest.',
  keywords: [
    'kalkulator cagr',
    'hitung cagr saham',
    'compound annual growth rate',
    'rumus cagr',
    'kalkulator investasi majemuk',
    'kalkulator return saham',
    'bunga berbunga saham',
    'tradesim pro tools',
  ],
  alternates: {
    canonical: `${SITE_URL}/tools/kalkulator-cagr-saham`,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: `${SITE_URL}/tools/kalkulator-cagr-saham`,
    title: 'Kalkulator CAGR Saham & Investasi Online Gratis | TradeSim Pro',
    description:
      'Kalkulator Compound Annual Growth Rate (CAGR) untuk evaluasi performa investasi saham dan portofolio jangka panjang.',
    images: [`${SITE_URL}/og-preview.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kalkulator CAGR Saham & Investasi Online Gratis | TradeSim Pro',
    description:
      'Hitung tingkat return tahunan majemuk (CAGR) saham dan portofolio Anda dengan mudah dan akurat.',
    images: [`${SITE_URL}/og-preview.png`],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
