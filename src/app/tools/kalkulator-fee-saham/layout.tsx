import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Kalkulator Fee Beli & Jual Saham BEI (Titik Impas Breakeven) | TradeSim Pro',
  description:
    'Hitung biaya transaksi beli dan jual saham di Bursa Efek Indonesia (BEI / IDX), komisi broker, levy KPEI/KSEI, PPh final, dan titik impas (breakeven price) secara akurat dan gratis.',
  keywords: [
    'kalkulator fee saham',
    'kalkulator fee saham bei',
    'hitung fee beli jual saham',
    'breakeven price saham',
    'biaya transaksi saham',
    'komisi broker saham',
    'kalkulator saham indonesia',
    'fee sekuritas saham',
  ],
  alternates: {
    canonical: `${SITE_URL}/tools/kalkulator-fee-saham`,
  },
  openGraph: {
    title: 'Kalkulator Fee Beli & Jual Saham BEI (Titik Impas Breakeven) | TradeSim Pro',
    description:
      'Kalkulator gratis untuk menghitung komisi broker, pajak PPh, levy bursa, dan harga titik impas (breakeven price) saham BEI / IDX.',
    url: `${SITE_URL}/tools/kalkulator-fee-saham`,
    type: 'website',
  },
};

export default function FeeCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
