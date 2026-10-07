import { NextResponse } from 'next/server';
import { INVESTING_COM_GLOBAL_DIVIDENDS } from '@/data/investing_global_dividends';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country')?.toUpperCase();
    const category = searchParams.get('category');
    const sector = searchParams.get('sector');
    const q = searchParams.get('q')?.toLowerCase().trim();
    const sort = searchParams.get('sort') || 'yield';

    let results = [...INVESTING_COM_GLOBAL_DIVIDENDS];

    if (country && country !== 'ALL') {
      results = results.filter(
        (s) => s.countryCode.toUpperCase() === country || s.country.toUpperCase() === country
      );
    }

    if (category && category !== 'ALL') {
      results = results.filter((s) => s.category === category);
    }

    if (sector && sector !== 'ALL') {
      results = results.filter((s) => s.sector.toLowerCase().includes(sector.toLowerCase()));
    }

    if (q) {
      results = results.filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.notes.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === 'yield') {
      results.sort((a, b) => b.yieldPct - a.yieldPct);
    } else if (sort === 'growth') {
      results.sort((a, b) => b.growthYears - a.growthYears);
    } else if (sort === 'dps') {
      results.sort((a, b) => b.dps - a.dps);
    } else if (sort === 'payout') {
      results.sort((a, b) => b.payoutRatioPct - a.payoutRatioPct);
    }

    return NextResponse.json({
      status: 'success',
      source: 'Investing.com Global Dividend Calendar & Database',
      totalCount: results.length,
      data: results,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch global dividend stocks' },
      { status: 500 }
    );
  }
}
