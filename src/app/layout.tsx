import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

export const viewport: Viewport = {
  themeColor: '#090a0f',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TradeSim Pro - #1 Trading Simulator Saham Indonesia (BEI) & Crypto',
    template: '%s | TradeSim Pro - Trading Simulator',
  },
  description:
    'TradeSim Pro adalah platform trading simulator saham Indonesia (BEI / IDX) dan crypto spot 24/7 dengan data pasar real-time, orderbook level 2, saldo virtual gratis Rp 50 Juta, dan AI workstation.',
  keywords: [
    'tradesim',
    'trading simulator',
    'tradesim pro',
    'trading simulator indonesia',
    'trading simulator saham',
    'simulator trading saham indonesia',
    'paper trading indonesia',
    'simulasi saham idx bei',
    'aplikasi trading simulator',
    'belajar trading saham gratis',
    'paper trading crypto',
  ],
  authors: [{ name: 'TradeSim Pro Quantitative Team', url: SITE_URL }],
  creator: 'TradeSim Pro',
  publisher: 'TradeSim Pro Workstation',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: 'TradeSim Pro Workstation',
    title: 'TradeSim Pro - Institutional Trading Simulator & FinTech Workstation',
    description:
      'Simulator trading saham Indonesia (BEI) dan crypto spot 24/7 dengan data pasar real-time dan AI autonomous hedge fund desk.',
    images: [
      {
        url: `${SITE_URL}/og-preview.png`,
        width: 1200,
        height: 630,
        alt: 'TradeSim Pro Institutional Workstation Terminal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TradeSim Pro - Institutional Trading Simulator & FinTech Workstation',
    description:
      'Simulator trading saham Indonesia (BEI) & crypto spot 24/7 dengan data pasar real-time dan AI hedge fund desk.',
    images: [`${SITE_URL}/og-preview.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: [
      'google8cdf32fe8d870fa1',
      'Ovd69w3BxEqbUb7CeU6bb7USGiH3ALULyzlVbyTTV_o',
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#app`,
        name: 'TradeSim Pro - #1 Trading Simulator Saham Indonesia & Crypto',
        alternateName: ['TradeSim', 'TradeSim Pro', 'Trading Simulator Indonesia', 'Paper Trading IDX'],
        url: SITE_URL,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Windows, macOS, Android, iOS, Web',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'IDR',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '12480',
          bestRating: '5',
          worstRating: '1',
        },
        description:
          'TradeSim Pro adalah platform trading simulator saham Indonesia (BEI / IDX) dan crypto spot 24/7 dengan data pasar real-time, orderbook level 2, saldo virtual gratis Rp 50 Juta, dan AI workstation.',
      },
      {
        '@type': 'FinancialService',
        '@id': `${SITE_URL}/#service`,
        name: 'TradeSim Pro Paper Trading & Financial Simulation',
        url: SITE_URL,
        description:
          'Layanan edukasi dan simulasi paper trading multi-aset untuk pasar modal Indonesia (IDX) dan crypto global tanpa risiko kerugian finansial nyata.',
        areaServed: 'ID',
        currenciesAccepted: 'IDR, USD, USDT',
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Apa itu TradeSim Pro?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'TradeSim Pro adalah platform simulasi trading saham Indonesia (BEI / IDX) dan crypto spot 24/7 pertama dengan data pasar real-time, orderbook level 2, analisis bandarmologi, dan modal virtual gratis tanpa risiko uang asli.',
            },
          },
          {
            '@type': 'Question',
            name: 'Apakah trading di TradeSim Pro menggunakan uang asli?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Tidak. TradeSim Pro adalah platform paper trading simulasi 100% aman tanpa risiko uang riil. Setiap pengguna baru langsung mendapatkan saldo modal virtual gratis hingga Rp 50.000.000 untuk berlatih strategi investasi.',
            },
          },
          {
            '@type': 'Question',
            name: 'Apakah data pergerakan saham dan crypto di simulator ini real-time?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ya, seluruh data harga saham IHSG / IDX, chart candlestick teknikal, orderbook bid/offer, dan harga koin kripto diperbarui secara real-time mengikuti pergerakan bursa pasar nyata.',
            },
          },
          {
            '@type': 'Question',
            name: 'Bagaimana cara mulai paper trading di TradeSim Pro?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Anda cukup membuka website https://www.tradingsims.my.id, klik tombol Mulai Trading Simulator, buat akun gratis dalam 10 detik, dan Anda bisa langsung membeli atau menjual saham pilihan seperti BBCA, BBRI, GOTO, atau Bitcoin.',
            },
          },
        ],
      },
      {
        '@type': 'HowTo',
        '@id': `${SITE_URL}/#howto`,
        name: 'Cara Memulai Trading Simulator Saham & Kripto di TradeSim Pro',
        description: 'Panduan langkah demi langkah memulai paper trading saham Indonesia (BEI / IDX) dan crypto 24/7 tanpa risiko dengan modal virtual Rp 50.000.000.',
        totalTime: 'PT3M',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Buka Platform TradeSim Pro',
            text: 'Kunjungi website resmi TradeSim Pro di https://www.tradingsims.my.id dan klik tombol Buka Terminal atau Mulai Simulasi.',
            url: `${SITE_URL}/terminal`,
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Klaim Saldo Virtual Gratis Rp 50.000.000',
            text: 'Daftar akun gratis dalam 10 detik dan saldo modal virtual Rp 50.000.000 langsung aktif di portofolio simulasi RDN Anda.',
            url: `${SITE_URL}/portfolio`,
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Pilih Saham atau Kripto Favorit',
            text: 'Cari emiten saham pilihan (seperti BBCA, BBRI, GOTO) atau aset kripto (BTC, ETH) dan pantau chart candlestick real-time serta orderbook level 2.',
            url: `${SITE_URL}/markets`,
          },
          {
            '@type': 'HowToStep',
            position: 4,
            name: 'Pasang Order Beli & Pantau Keuntungan Portofolio',
            text: 'Masukkan jumlah lot yang diinginkan, pilih tipe order (Market / Limit Order), dan klik Beli. Pantau laba rugi (P&L) portofolio Anda secara real-time.',
            url: `${SITE_URL}/terminal`,
          },
        ],
      },
    ],
  };

  return (
    <html lang="id" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://wrbzwjriruttagqufalr.supabase.co" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="h-full overflow-hidden font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
