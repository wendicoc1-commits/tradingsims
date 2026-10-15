import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Kalkulator Lot Saham & Money Management Position Sizing | TradeSim Pro',
  description:
    'Hitung jumlah lot saham optimal berdasarkan toleransi risiko modal, batasan stop loss (cut loss), dan aturan money management 1-2% risk per trade secara otomatis dan gratis.',
  keywords: [
    'kalkulator lot saham',
    'hitung lot beli saham',
    'kalkulator money management saham',
    'position sizing saham',
    'cara hitung lot saham bei',
    'risk management trading saham',
    'kalkulator stop loss saham',
  ],
  alternates: {
    canonical: `${SITE_URL}/tools/kalkulator-lot`,
  },
  openGraph: {
    title: 'Kalkulator Lot Saham & Money Management Position Sizing | TradeSim Pro',
    description:
      'Kalkulator gratis untuk menghitung jumlah lot pembelian saham yang aman sesuai profil risiko dan batasan stop loss modal Anda.',
    url: `${SITE_URL}/tools/kalkulator-lot`,
    type: 'website',
  },
};

export default function LotCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
