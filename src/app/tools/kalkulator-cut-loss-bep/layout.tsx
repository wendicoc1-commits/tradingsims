import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Kalkulator Cut Loss & BEP Pemulihan Modal Saham | TradeSim Pro',
  description:
    'Hitung persentase keuntungan yang wajib diraih untuk kembali modal (Break-Even Point) setelah mengalami floating loss. Lengkap dengan matriks pemulihan kerugian asimetris.',
  keywords: [
    'kalkulator cut loss saham',
    'hitung bep setelah rugi saham',
    'kalkulator pemulihan modal saham',
    'break even point trading saham',
    'matriks kerugian saham',
    'cara memulihkan porto saham nyangkut',
    'kalkulator impas saham',
  ],
  alternates: {
    canonical: `${SITE_URL}/tools/kalkulator-cut-loss-bep`,
  },
  openGraph: {
    title: 'Kalkulator Cut Loss & BEP Pemulihan Modal Saham | TradeSim Pro',
    description:
      'Kalkulator gratis menghitung persentase keuntungan yang dibutuhkan untuk kembali ke modal awal setelah saham mengalami penurunan harga.',
    url: `${SITE_URL}/tools/kalkulator-cut-loss-bep`,
    type: 'website',
  },
};

export default function CutLossBepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
