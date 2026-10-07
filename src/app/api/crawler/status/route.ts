import { NextResponse } from 'next/server';
import { getGlobalCrawledNews } from '@/lib/crawler/financialCrawlerService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getGlobalCrawledNews({ limit: 1 });
    return NextResponse.json({
      success: true,
      telemetry: {
        ...data.status,
        timestamp: new Date().toISOString(),
        crawlerEngines: [
          { name: 'Google News Finance (Wall St & Global)', type: 'RSS Syndication', status: 'ACTIVE' },
          { name: 'Google News IDX (Indonesia Portals)', type: 'RSS Syndication', status: 'ACTIVE' },
          { name: 'Yahoo Finance Global API', type: 'JSON Stream', status: 'ACTIVE' },
          { name: 'CNBC Financial Markets', type: 'RSS Syndication', status: 'ACTIVE' },
          { name: 'Asia-Pacific Markets Wire', type: 'RSS Syndication', status: 'ACTIVE' },
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch crawler status',
      },
      { status: 500 }
    );
  }
}
