import { NextResponse } from 'next/server';
import { getGlobalCrawledNews, CrawledArticle } from '@/lib/crawler/financialCrawlerService';
import { DisplayArticle } from '@/lib/stockNewsService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '35', 10);
    const search = searchParams.get('search') || '';

    // Fetch real live crawled articles from global financial portals & RSS
    let liveArticles: DisplayArticle[] = [];
    const crawlResult = await getGlobalCrawledNews({ limit, search, force: false });

    if (crawlResult?.articles && crawlResult.articles.length > 0) {
      liveArticles = crawlResult.articles.map((c: CrawledArticle, idx: number) => {
        const firstTicker = c.cashtags[0] || (c.region === 'IDX' ? 'IHSG' : 'SPX');
        const flag = c.region === 'IDX' ? '🇮🇩' : c.region === 'US' ? '🇺🇸' : c.region === 'ASIA' ? '🌏' : '🌍';

        return {
          id: `live-${c.id || idx}`,
          wireCode: `LIVE ${c.source.slice(0, 10).toUpperCase()}`,
          ticker: firstTicker,
          tickers: c.cashtags.length > 0 ? c.cashtags : [firstTicker],
          flag,
          title: c.title,
          summary: c.summary,
          sentiment: c.sentiment,
          sentimentScore: c.sentiment === 'BULLISH' ? 8 : c.sentiment === 'BEARISH' ? -7 : 0,
          source: c.source,
          date: c.publishedAt,
          relativeTime: c.timeAgo,
          period: 'TODAY',
          category: c.region === 'IDX' ? 'Korporasi & M&A' : 'Macro & Moneter',
          urgency: 'FLASH',
          byline: `${c.source} Live Wire Desk`,
          takeaways: [
            `Sumber resmi: ${c.source}`,
            `Wilayah pasar: ${c.region}`,
            `Sentimen terdeteksi: ${c.sentiment}`,
          ],
          body: [
            c.summary,
            `Artikel dipublikasikan secara riil oleh ${c.source}. Buka tautan untuk membaca analisis mendalam di situs penerbit resmi.`,
          ],
          marketImpact:
            c.sentiment === 'BULLISH'
              ? 'Katalis positif bagi sentimen pasar'
              : c.sentiment === 'BEARISH'
              ? 'Waspadai tekanan jual atau aksi ambil untung'
              : 'Dampak pasar berimbang / netral',
          isBloomberg: false,
          link: c.link,
          url: c.link,
        } as DisplayArticle;
      });
    }

    return NextResponse.json(
      {
        success: true,
        meta: {
          timestamp: new Date().toISOString(),
          sources: crawlResult?.status?.activeSources || ['Google News Finance', 'Portal IDX', 'Yahoo Finance RSS'],
          crawledCount: liveArticles.length,
        },
        totalArticles: liveArticles.length,
        articles: liveArticles,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch real-time news feed',
      },
      { status: 500 }
    );
  }
}
