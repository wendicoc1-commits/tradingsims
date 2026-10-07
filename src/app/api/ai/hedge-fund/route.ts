import { NextResponse } from 'next/server';
import { getVerifiedBenchmarkPrice, IDX_BENCHMARK_PRICES } from '@/data/idx_benchmark_prices';
import { INVESTING_COM_GLOBAL_DIVIDENDS } from '@/data/investing_global_dividends';
import { MASTER_GLOBAL_STOCKS } from '@/data/global_markets_universe';
import { ALL_ID_HEATMAP_UNIVERSE } from '@/data/heatmap_stocks_universe';
import { fetchYahooQuote, US_STOCKS } from '@/app/api/stocks/realtime/route';
import { generateCalibratedCandles } from '@/app/api/stocks/history/route';
import { evaluateHedgeFundCommittee } from '@/lib/hedgefund/engine';
import { OHLCVCandle } from '@/lib/quant/engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSymbol = searchParams.get('symbol') || searchParams.get('ticker') || 'BBCA';
    const cleanSym = rawSymbol.replace('.JK', '').replace('^', '').toUpperCase().trim();

    // 1. Resolve live price & metadata for ANY stock
    const paramPrice = searchParams.get('price');
    const paramCurrency = searchParams.get('currency');
    const paramName = searchParams.get('name');

    let currentPrice = paramPrice ? parseFloat(paramPrice) : 0;
    let currency = paramCurrency || 'IDR';
    let companyName = paramName || `${cleanSym} Tbk`;

    // Try resolving from real-time live feed if price not provided
    if (!currentPrice || currentPrice <= 0) {
      try {
        const live = await fetchYahooQuote(cleanSym);
        if (live && live.price > 0) {
          currentPrice = live.price;
          currency = live.currency || currency;
        }
      } catch {}
    }

    // Check Global stocks database (US, Tech, Global Giants)
    const globalMatch =
      MASTER_GLOBAL_STOCKS.find((g) => g.ticker.toUpperCase() === cleanSym) ||
      INVESTING_COM_GLOBAL_DIVIDENDS.find((g) => g.ticker.toUpperCase() === cleanSym);

    if (globalMatch) {
      if (!currentPrice || currentPrice <= 0) currentPrice = globalMatch.price;
      currency = globalMatch.currency;
      companyName = globalMatch.name;
    } else if (US_STOCKS.has(cleanSym)) {
      if (!currentPrice || currentPrice <= 0) currentPrice = 150;
      currency = 'USD';
      companyName = `${cleanSym} Inc.`;
    } else {
      // Check Indonesian stocks universe
      const idxHeatmap = ALL_ID_HEATMAP_UNIVERSE.find(
        (i) => i.displaySymbol.toUpperCase() === cleanSym || i.symbol.replace('.JK', '').toUpperCase() === cleanSym
      );
      if (idxHeatmap) {
        if (!currentPrice || currentPrice <= 0) currentPrice = idxHeatmap.price;
        currency = 'IDR';
        companyName = idxHeatmap.name;
      } else if (IDX_BENCHMARK_PRICES[cleanSym]) {
        const bench = IDX_BENCHMARK_PRICES[cleanSym];
        if (!currentPrice || currentPrice <= 0) currentPrice = bench.price;
        currency = bench.currency;
        companyName = bench.name;
      } else {
        const bench = getVerifiedBenchmarkPrice(cleanSym);
        if (!currentPrice || currentPrice <= 0) currentPrice = bench.price;
        currency = bench.currency;
        companyName = bench.name;
      }
    }

    // 2. Obtain historical candles anchored to the current price
    const rawCandles = generateCalibratedCandles(currentPrice, '1D', 80);
    const candles: OHLCVCandle[] = rawCandles.map((c) => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    }));

    // 3. Execute Multi-Agent AI Hedge Fund Committee
    const report = evaluateHedgeFundCommittee(cleanSym, companyName, candles, currency);

    return NextResponse.json(report);
  } catch (err: any) {
    console.error('Error in /api/ai/hedge-fund:', err);
    return NextResponse.json(
      { error: err?.message || 'Gagal mengevaluasi komite AI Hedge Fund' },
      { status: 500 }
    );
  }
}
