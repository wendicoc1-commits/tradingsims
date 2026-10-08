import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';
  const now = new Date();

  const routes = [
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

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
