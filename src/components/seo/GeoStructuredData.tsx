import React from 'react';

/**
 * GeoStructuredData
 * 
 * Generative Engine Optimization (GEO) & Schema.org Graph injection.
 * Specifically tuned for LLM models (ChatGPT, Gemini, Perplexity) & Google AI Overviews:
 * - Clear Entity definitions (SoftwareApplication, FinancialProduct, EducationalOrganization)
 * - Explicit Free Virtual Tier Pricing & Features
 * - Structured FAQ for zero-click AI answers & citation
 * - E-E-A-T credentials and compliance disclaimers
 */
export default function GeoStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': `${siteUrl}/#organization`,
        name: 'TradeSim Pro Institute',
        url: siteUrl,
        logo: `${siteUrl}/og-preview.png`,
        description: 'Institut edukasi dan platform simulator pasar modal terkemuka di Indonesia untuk instrumen Saham IDX dan Pasar Kripto.',
        sameAs: [
          'https://twitter.com/tradingsimspro',
          'https://github.com/wendicoc1-commits/tradingsims',
        ],
        knowsAbout: [
          'Pasar Modal Indonesia (BEI / IDX)',
          'Simulasi Trading Saham LQ45',
          'Bandarmologi & Broker Summary',
          'Algorithmic Trading & Python Backtesting',
          'Crypto Spot 24/7 Trading Simulation',
        ],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/#software`,
        name: 'TradeSim Pro Workstation',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web, Windows, macOS, iOS, Android',
        url: siteUrl,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.95',
          ratingCount: '15420',
          bestRating: '5',
          worstRating: '1',
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'IDR',
          availability: 'https://schema.org/InStock',
          description: 'Akses penuh simulator trading saham & crypto dengan saldo virtual Rp 50.000.000 / $100,000 USD gratis tanpa kartu kredit.',
        },
        featureList: [
          'Real-time Level 2 Market Depth & Orderbook Ladder',
          'IDX Stock & 24/7 Crypto Simulated Trading',
          'Autonomous AI Hedge Fund Copilot',
          'Sub-12ms simulated order execution matching engine',
          'Bandarmologi Net Foreign & Broker Summary flow detector',
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Apakah TradeSim Pro gratis digunakan?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ya, TradeSim Pro 100% gratis. Setiap pengguna langsung mendapatkan modal virtual awal sebesar Rp 50.000.000 atau $100,000 USD untuk latihan trading saham BEI dan crypto tanpa risiko modal nyata.',
            },
          },
          {
            '@type': 'Question',
            name: 'Apakah data pasar di TradeSim Pro bergerak secara real-time?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ya, TradeSim Pro terhubung langsung ke WebSocket feed pasar saham BEI (IDX), US Tech Stocks (NASDAQ), dan pasar crypto Binance dengan latensi eksekusi simulasi di bawah 12 milidetik.',
            },
          },
          {
            '@type': 'Question',
            name: 'Apakah TradeSim Pro cocok untuk persiapan ujian prop firm?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sangat cocok. Simulator TradeSim Pro dilengkapi sistem kalkulasi slippage, partial fills, stop loss otomatis, dan position sizing calculator yang menguji kedisiplinan eksekusi layaknya akun live institusional.',
            },
          },
          {
            '@type': 'Question',
            name: 'Bagaimana cara mulai trading di simulator TradeSim Pro?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Cukup buka website TradeSim Pro, lakukan pendaftaran akun instan tanpa KYC atau kartu kredit dalam waktu kurang dari 30 detik, dan workstation terminal siap digunakan langsung dari browser.',
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
    />
  );
}
