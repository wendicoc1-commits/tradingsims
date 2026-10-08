import { MetadataRoute } from 'next';
import { POPULAR_IDX_TICKERS } from '@/components/dashboard/FinceptDashboardWidgets';
import { MASTER_GLOBAL_CRYPTO } from '@/data/global_markets_universe';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';
  const now = new Date();

  const staticRoutes = [
    { path: '', changeFrequency: 'always' as const, priority: 1.0 },
    { path: '/markets', changeFrequency: 'hourly' as const, priority: 0.9 },
    { path: '/crypto', changeFrequency: 'always' as const, priority: 0.95 },
    { path: '/hedge-fund', changeFrequency: 'hourly' as const, priority: 0.9 },
    { path: '/portfolio', changeFrequency: 'always' as const, priority: 0.85 },
    { path: '/screener', changeFrequency: 'daily' as const, priority: 0.8 },
    { path: '/compare', changeFrequency: 'daily' as const, priority: 0.75 },
    { path: '/heatmap', changeFrequency: 'hourly' as const, priority: 0.8 },
    { path: '/macro', changeFrequency: 'daily' as const, priority: 0.7 },
    { path: '/dividend', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/ipo', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/bandar', changeFrequency: 'hourly' as const, priority: 0.85 },
    { path: '/openstock', changeFrequency: 'hourly' as const, priority: 0.8 },
  ];

  // Extended IDX popular tickers for high-traffic search engine keywords
  const extendedIdxTickers = Array.from(new Set([
    ...POPULAR_IDX_TICKERS,
    'BBNI', 'ASII', 'TLKM', 'UNTR', 'ICBP', 'INDF', 'KLBF', 'CPIN', 'SMGR',
    'INKP', 'MEDC', 'PGAS', 'MDKA', 'ANTM', 'BRPT', 'TPIA', 'AMMN', 'GOTO',
    'BUKA', 'ARTO', 'ESSA', 'AKRA', 'ACES', 'MYOR', 'INCO', 'HRUM', 'ITMG',
    'PTBA', 'ADRO', 'PGEO', 'MAPA', 'MAPI', 'CTRA', 'BSDE', 'PWON', 'SMRA',
  ]));

  const stockRoutes = extendedIdxTickers.map((ticker) => ({
    url: `${baseUrl}/stock/${ticker}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }));

  // Top Crypto routes (BTC, ETH, SOL, etc.)
  const cryptoRoutes = MASTER_GLOBAL_CRYPTO.slice(0, 25).map((coin) => {
    const clean = coin.symbol.replace(/USDT$/, '');
    return {
      url: `${baseUrl}/stock/${clean}`,
      lastModified: now,
      changeFrequency: 'always' as const,
      priority: 0.85,
    };
  });

  const allStaticMapped = staticRoutes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  return [...allStaticMapped, ...stockRoutes, ...cryptoRoutes];
}

