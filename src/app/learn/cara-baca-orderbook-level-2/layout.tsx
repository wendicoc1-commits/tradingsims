import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const metadata: Metadata = {
  title: 'Cara Membaca Orderbook Level 2 Saham & Crypto (Bid vs Offer) | TradeSim Pro',
  description:
    'Panduan lengkap cara membaca orderbook Level 2 saham BEI / IDX dan crypto: memahami antrean beli (Bid), antrean jual (Offer), fraksi harga, fake bid, dan volume likuiditas pasar modal.',
  keywords: [
    'cara baca orderbook saham',
    'orderbook level 2 saham',
    'bid offer saham bei',
    'antrean beli jual saham',
    'cara baca bid offer idx',
    'order book crypto',
    'fake bid saham bandar',
  ],
  alternates: {
    canonical: `${SITE_URL}/learn/cara-baca-orderbook-level-2`,
  },
  openGraph: {
    title: 'Cara Membaca Orderbook Level 2 Saham & Crypto (Bid vs Offer) | TradeSim Pro',
    description:
      'Pelajari rahasia membaca kedalaman pasar (Market Depth) dan psikologi antrean transaksi saham di bursa secara praktis.',
    url: `${SITE_URL}/learn/cara-baca-orderbook-level-2`,
    type: 'article',
  },
};

export default function OrderbookArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
