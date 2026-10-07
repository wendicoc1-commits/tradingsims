import { NextResponse } from 'next/server';
import { generateHourlyNewsFeed } from '@/lib/hourlyNewsEngine';
import { getGlobalCrawledNews, CrawledArticle } from '@/lib/crawler/financialCrawlerService';
import { DisplayArticle } from '@/lib/stockNewsService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hourParam = searchParams.get('hour');
    const targetHour = hourParam !== null ? parseInt(hourParam, 10) : undefined;

    const baseData = generateHourlyNewsFeed(targetHour);

    // Fetch live crawled articles from global financial portals
    let liveCrawled: DisplayArticle[] = [];
    try {
      const crawlResult = await getGlobalCrawledNews({ limit: 25 });
      if (crawlResult?.articles && crawlResult.articles.length > 0) {
        liveCrawled = crawlResult.articles.map((c: CrawledArticle, idx: number) => {
          const firstTicker = c.cashtags[0] || (c.region === 'IDX' ? 'IHSG' : 'SPX');
          const flag = c.region === 'IDX' ? '🇮🇩' : c.region === 'US' ? '🇺🇸' : c.region === 'ASIA' ? '🌏' : '🌍';

          return {
            id: `crawled-${c.id || idx}`,
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
            byline: `${c.source} Global Web Crawler Desk`,
            takeaways: [
              `Sumber resmi: ${c.source}`,
              `Wilayah pasar: ${c.region}`,
              `Sentimen terdeteksi: ${c.sentiment}`,
            ],
            body: [
              c.summary,
              `Artikel asli dipublikasikan oleh ${c.source}. Anda dapat membaca berita selengkapnya langsung di tautan sumber resmi.`,
            ],
            marketImpact: c.sentiment === 'BULLISH' ? 'Positif bagi sentimen pasar' : c.sentiment === 'BEARISH' ? 'Waspadai tekanan jual' : 'Dampak netral',
            isBloomberg: false,
            link: c.link,
            url: c.link,
          } as DisplayArticle;
        });
      }
    } catch (e) {
      console.warn('Hourly news: crawler merge error', e);
    }

    const mergedArticles = [...liveCrawled, ...baseData.articles];

    return NextResponse.json(
      {
        success: true,
        meta: {
          ...baseData.meta,
          crawledCount: liveCrawled.length,
        },
        totalArticles: mergedArticles.length,
        articles: mergedArticles,
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
        error: error.message || 'Failed to fetch hourly news feed',
      },
      { status: 500 }
    );
  }
}

