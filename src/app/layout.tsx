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
    default: 'TradeSim Pro - Institutional Trading Simulator & FinTech Workstation',
    template: '%s | TradeSim Pro Workstation',
  },
  description:
    'Platform simulator trading saham Indonesia (BEI / IDX) dan crypto spot 24/7 dengan data pasar real-time, quantitative alpha scanner, dan sistem AI hedge fund desk institusional.',
  keywords: [
    'trading simulator indonesia',
    'simulasi saham idx',
    'paper trading crypto',
    'fintech trading workstation',
    'simulasi investasi saham bei',
    'belajar trading saham',
    'ai hedge fund desk',
    'screener saham indonesia',
    'bandarmology flow detector',
    'binance live paper trading',
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
        name: 'TradeSim Pro Workstation',
        url: SITE_URL,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'IDR',
        },
        description:
          'Simulator trading saham Indonesia (BEI / IDX) dan crypto spot 24/7 dengan data pasar real-time, alpha scanner, dan bot AI hedge fund.',
      },
      {
        '@type': 'FinancialService',
        '@id': `${SITE_URL}/#service`,
        name: 'TradeSim Pro Trading Simulation Service',
        url: SITE_URL,
        description:
          'Layanan edukasi dan simulasi paper trading multi-aset untuk pasar modal Indonesia dan pasar kripto global tanpa risiko finansial nyata.',
        areaServed: 'ID',
        currenciesAccepted: 'IDR, USD, USDT',
      },
    ],
  };

  return (
    <html lang="id" className="dark h-full antialiased">
      <head>
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
