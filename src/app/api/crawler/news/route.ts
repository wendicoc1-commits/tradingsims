import { NextResponse } from 'next/server';
import { getGlobalCrawledNews } from '@/lib/crawler/financialCrawlerService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'ALL';
    const sentiment = searchParams.get('sentiment') || 'ALL';
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '35', 10);
    const force = searchParams.get('force') === 'true';

    const result = await getGlobalCrawledNews({
      force,
      region,
      sentiment,
      search,
      limit,
    });

    return NextResponse.json(
      {
        success: true,
        meta: {
          region,
          sentiment,
          search,
          count: result.articles.length,
          totalCrawledInCache: result.status.totalArticles,
          lastCrawledAt: result.status.lastCrawledAt,
          crawlerStatus: result.status.status,
          sourcesMonitored: result.status.sourcesMonitored,
        },
        articles: result.articles,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15',
        },
      }
    );
  } catch (error: any) {
    console.error('Crawler API GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to crawl global stock market news',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const result = await getGlobalCrawledNews({ force: true });
    return NextResponse.json({
      success: true,
      message: 'Global web crawl cycle executed successfully',
      meta: {
        totalCrawled: result.articles.length,
        lastCrawledAt: result.status.lastCrawledAt,
        crawlerStatus: result.status.status,
      },
      articles: result.articles.slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to trigger crawler',
      },
      { status: 500 }
    );
  }
}
