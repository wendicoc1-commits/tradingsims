import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Kalkulator Average Down Saham BEI (Hitung Harga Rata-Rata Baru) | TradeSim Pro',
  description:
    'Kalkulator gratis untuk menghitung harga rata-rata baru (new average price), modal tambahan, total lot akumulasi, dan titik impas saat melakukan averaging down saham di Bursa Efek Indonesia (BEI / IDX).',
  keywords: [
    'kalkulator average down saham',
    'kalkulator averaging saham',
    'cara hitung average down saham',
    'rumus average down saham',
    'hitung harga rata-rata saham',
    'kalkulator saham bei',
    'strategi averaging down saham',
    'average down kalkulator indonesia',
  ],
  alternates: {
    canonical: `${SITE_URL}/tools/kalkulator-averaging-saham`,
  },
  openGraph: {
    title: 'Kalkulator Average Down Saham BEI (Hitung Harga Rata-Rata Baru) | TradeSim Pro',
    description:
      'Hitung penurunan harga rata-rata saham dan modal tambahan saat averaging down saham dengan akurat.',
    url: `${SITE_URL}/tools/kalkulator-averaging-saham`,
    type: 'website',
  },
};

export default function AveragingCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
