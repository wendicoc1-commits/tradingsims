import { NextResponse } from 'next/server';
import { BLOOMBERG_NEWS_WIRE } from '@/data/bloomberg_news_wire';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';
  const now = new Date().toISOString();

  const xmlEntries = BLOOMBERG_NEWS_WIRE.slice(0, 50).map((story) => {
    // Escape XML entities
    const safeHeadline = story.headline
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    return `  <url>
    <loc>${baseUrl}/stream?story=${story.id}</loc>
    <news:news>
      <news:publication>
        <news:name>TradeSim Pro News Wire</news:name>
        <news:language>id</news:language>
      </news:publication>
      <news:publication_date>${now}</news:publication_date>
      <news:title>${safeHeadline}</news:title>
    </news:news>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${xmlEntries}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
