import { MetadataRoute } from 'next';
import idxDividendJson from '@/data/idx_dividend_all.json';
import { MASTER_GLOBAL_CRYPTO, MASTER_GLOBAL_STOCKS } from '@/data/global_markets_universe';
import { KAMUS_TERMS } from '@/data/kamus_finansial_data';
import { STOCK_DUELS, IDX_INDICES, BROKER_DIRECTORY } from '@/data/seo_programmatic_universe';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';
  const now = new Date();

  // Core Static & High-Intent Educational Routes
  const staticRoutes = [
    { path: '', changeFrequency: 'always' as const, priority: 1.0 },
    { path: '/trading', changeFrequency: 'always' as const, priority: 1.0 },
    { path: '/terminal', changeFrequency: 'always' as const, priority: 0.98 },
    { path: '/markets', changeFrequency: 'hourly' as const, priority: 0.95 },
    { path: '/crypto', changeFrequency: 'always' as const, priority: 0.95 },
    { path: '/hedge-fund', changeFrequency: 'hourly' as const, priority: 0.9 },
    { path: '/portfolio', changeFrequency: 'always' as const, priority: 0.85 },
    { path: '/screener', changeFrequency: 'daily' as const, priority: 0.85 },
    { path: '/bandar', changeFrequency: 'hourly' as const, priority: 0.85 },
    { path: '/heatmap', changeFrequency: 'hourly' as const, priority: 0.8 },
    { path: '/compare', changeFrequency: 'daily' as const, priority: 0.85 },
    { path: '/dividend', changeFrequency: 'weekly' as const, priority: 0.75 },
    { path: '/ipo', changeFrequency: 'weekly' as const, priority: 0.75 },
    { path: '/macro', changeFrequency: 'daily' as const, priority: 0.75 },

    // Financial Tools / Calculators (High Inbound Volume)
    { path: '/tools/kalkulator-fee-saham', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/tools/kalkulator-lot', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/tools/kalkulator-averaging-saham', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/tools/kalkulator-dividen', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/tools/kalkulator-cagr-saham', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/tools/kalkulator-risk-reward', changeFrequency: 'monthly' as const, priority: 0.92 },
    { path: '/tools/kalkulator-cut-loss-bep', changeFrequency: 'monthly' as const, priority: 0.92 },
    { path: '/tools/kalkulator-profit-trading', changeFrequency: 'monthly' as const, priority: 0.93 },

    // Educational Guides & Knowledge Articles
    { path: '/learn/apa-itu-trading', changeFrequency: 'monthly' as const, priority: 0.98 },
    { path: '/learn/strategi-trading-saham', changeFrequency: 'monthly' as const, priority: 0.95 },
    { path: '/learn/cara-main-saham-pemula', changeFrequency: 'monthly' as const, priority: 0.95 },
    { path: '/learn/jam-bursa-saham-idx', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/learn/istilah-bandarmologi-saham', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/learn/istilah-saham', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/learn/apa-itu-paper-trading', changeFrequency: 'monthly' as const, priority: 0.85 },
    { path: '/learn/cara-baca-orderbook-level-2', changeFrequency: 'monthly' as const, priority: 0.85 },

    // Kamus Pasar Modal Hub
    { path: '/kamus', changeFrequency: 'weekly' as const, priority: 0.9 },

    // Crypto Sentiment Hub
    { path: '/crypto/fear-and-greed', changeFrequency: 'hourly' as const, priority: 0.9 },
  ];

  // Sector Landing Routes
  const sectorSlugs = [
    'perbankan',
    'energi-dan-batubara',
    'teknologi-dan-digital',
    'konsumer-dan-ritel',
    'infrastruktur-dan-telekomunikasi',
    'kripto-layer-1',
  ];
  const sectorRoutes = sectorSlugs.map((slug) => ({
    url: `${baseUrl}/sektor/${slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.88,
  }));

  // Popular Head-to-Head Comparison Routes
  const comparePairs = [
    'bbca-vs-bbri',
    'bmri-vs-bbni',
    'goto-vs-buka',
    'adro-vs-ptba',
    'antm-vs-mdka',
    'tlkm-vs-isat',
    'asii-vs-untr',
    'icbp-vs-indf',
    'btc-vs-eth',
    'sol-vs-eth',
    'nvda-vs-amd',
    'aapl-vs-msft',
  ];
  const compareRoutes = comparePairs.map((pair) => ({
    url: `${baseUrl}/compare/${pair}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  // Kamus Defined Terms Routes
  const kamusRoutes = KAMUS_TERMS.map((term) => ({
    url: `${baseUrl}/kamus/${term.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  // Programmatic Market Wrap Routes
  const pasarSlugs = [
    'top-gainers',
    'top-losers',
    'foreign-flow',
    'lq45-terbaik',
    'saham-dividen-tertinggi',
  ];
  const pasarRoutes = pasarSlugs.map((slug) => ({
    url: `${baseUrl}/pasar/${slug}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.92,
  }));

  const POPULAR_IDX = new Set([
    'BBCA', 'BBRI', 'BMRI', 'BBNI', 'ASII', 'TLKM',
    'ADRO', 'PTBA', 'PGAS', 'AMMN', 'ANTM', 'BREN',
    'ICBP', 'UNVR', 'MYOR', 'GOTO', 'BUKA', 'EMTK',
    'BRIS', 'MEDC', 'INKP', 'MDKA', 'CPIN', 'BRMS',
    'CUAN', 'BUMI', 'DEWA', 'ENRG', 'ERAA', 'EXCL',
    'ISAT', 'GGRM', 'HMSP', 'TOWR', 'TBIG', 'SMGR',
    'KLBF', 'ACES', 'TPIA', 'AKRA', 'ESSA', 'ARTO',
    'HEAL', 'MIKA', 'SILO', 'SIDO', 'CMRY', 'NISP',
  ]);

  // Programmatic Dividend Detail Routes for Popular Dividend Payers
  const stockDividendRoutes = Array.from(POPULAR_IDX).map((ticker) => ({
    url: `${baseUrl}/stock/${ticker}/dividen`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.88,
  }));

  // Programmatic Fundamental Analysis Scorecard Routes
  const stockAnalisisRoutes = Array.from(POPULAR_IDX).map((ticker) => ({
    url: `${baseUrl}/analisis/${ticker}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.88,
  }));

  // Programmatic Stock Duel Routes (/vs/[pair])
  const duelRoutes = STOCK_DUELS.map((d) => ({
    url: `${baseUrl}/vs/${d.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.89,
  }));

  // Programmatic IDX Indices Routes (/indeks/[slug])
  const idxIndicesRoutes = IDX_INDICES.map((idx) => ({
    url: `${baseUrl}/indeks/${idx.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Programmatic Broker Directory Routes (/broker/[kode])
  const brokerRoutes = BROKER_DIRECTORY.map((b) => ({
    url: `${baseUrl}/broker/${b.code.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  // Comprehensive 951+ IDX Stocks
  const idxRoutes = (idxDividendJson as any[])
    .map((item) => (item.code || '').toUpperCase().trim())
    .filter((code) => code.length >= 4 && code.length <= 6)
    .map((ticker) => {
      const isPopular = POPULAR_IDX.has(ticker);
      return {
        url: `${baseUrl}/stock/${ticker}`,
        lastModified: now,
        changeFrequency: (isPopular ? 'hourly' : 'daily') as MetadataRoute.Sitemap[number]['changeFrequency'],
        priority: isPopular ? 0.85 : 0.75,
      };
    });

  // Top Liquid Crypto Pairs (BTC, ETH, SOL, etc.)
  const cryptoRoutes = MASTER_GLOBAL_CRYPTO.map((coin) => {
    const clean = coin.symbol.replace(/USDT$/, '');
    return {
      url: `${baseUrl}/stock/${clean}`,
      lastModified: now,
      changeFrequency: 'always' as const,
      priority: 0.85,
    };
  });

  // Global US & International Stocks (AAPL, NVDA, TSLA, MSFT, etc.)
  const globalRoutes = MASTER_GLOBAL_STOCKS.slice(0, 80).map((stock) => {
    return {
      url: `${baseUrl}/stock/${stock.ticker}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    };
  });

  const allStaticMapped = staticRoutes.map((r) => ({
    url: r.path === '' ? `${baseUrl}/` : `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Combine and deduplicate URLs by exact URL string
  const urlMap = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of [
    ...allStaticMapped,
    ...sectorRoutes,
    ...compareRoutes,
    ...kamusRoutes,
    ...pasarRoutes,
    ...stockDividendRoutes,
    ...stockAnalisisRoutes,
    ...duelRoutes,
    ...idxIndicesRoutes,
    ...brokerRoutes,
    ...idxRoutes,
    ...cryptoRoutes,
    ...globalRoutes,
  ]) {
    if (!urlMap.has(entry.url)) {
      urlMap.set(entry.url, entry);
    }
  }

  return Array.from(urlMap.values());
}
