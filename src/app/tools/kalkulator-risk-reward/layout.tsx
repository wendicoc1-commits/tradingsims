import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Kalkulator Risk to Reward (R:R) Saham & Sizing Posisi | TradeSim Pro',
  description:
    'Hitung rasio Risk to Reward (R:R), persentase risiko modal per transaksi, dan jumlah lot maksimal yang aman dibeli sebelum entri order saham BEI dan kripto.',
  keywords: [
    'kalkulator risk reward saham',
    'hitung risk to reward ratio',
    'kalkulator rasio rr trading',
    'risk management saham',
    'position sizing kalkulator',
    'hitung stop loss target profit saham',
    'cara hitung risk reward ratio',
  ],
  alternates: {
    canonical: `${SITE_URL}/tools/kalkulator-risk-reward`,
  },
  openGraph: {
    title: 'Kalkulator Risk to Reward (R:R) Saham & Sizing Posisi | TradeSim Pro',
    description:
      'Alat bantu gratis menghitung rasio Risk to Reward (R:R) dan ukuran lot aman sebelum membuka posisi trading.',
    url: `${SITE_URL}/tools/kalkulator-risk-reward`,
    type: 'website',
  },
};

export default function RiskRewardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
