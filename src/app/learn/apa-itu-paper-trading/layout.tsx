import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Apa itu Paper Trading? Pengertian, Manfaat & Cara Simulasi Saham BEI | TradeSim Pro',
  description:
    'Pelajari apa itu paper trading (simulasi trading saham), bagaimana cara kerjanya di pasar modal Indonesia (BEI / IDX), manfaatnya bagi trader pemula, serta cara memulai latihan dengan modal virtual gratis.',
  keywords: [
    'apa itu paper trading',
    'paper trading indonesia',
    'simulasi trading saham',
    'belajar paper trading gratis',
    'virtual trading saham bei',
    'cara belajar trading tanpa modal',
    'aplikasi simulator trading saham',
  ],
  alternates: {
    canonical: `${SITE_URL}/learn/apa-itu-paper-trading`,
  },
  openGraph: {
    title: 'Apa itu Paper Trading? Panduan Lengkap Simulasi Saham BEI & Crypto | TradeSim Pro',
    description:
      'Panduan lengkap memulai paper trading saham dan kripto secara gratis dengan data pasar real-time tanpa risiko kehilangan uang.',
    url: `${SITE_URL}/learn/apa-itu-paper-trading`,
    type: 'article',
  },
};

export default function PaperTradingArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
