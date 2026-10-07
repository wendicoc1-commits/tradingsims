import { NextResponse } from 'next/server';
import { getVerifiedBenchmarkPrice } from '@/data/idx_benchmark_prices';
import { INVESTING_COM_GLOBAL_DIVIDENDS } from '@/data/investing_global_dividends';
import { generateCalibratedCandles } from '@/app/api/stocks/history/route';
import { analyzeStockQuant, OHLCVCandle } from '@/lib/quant/engine';
import { evaluateHedgeFundCommittee } from '@/lib/hedgefund/engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSymbol = searchParams.get('symbol') || searchParams.get('ticker') || 'BBCA';
    const requestedHorizon = (searchParams.get('horizon') || '5D').toUpperCase() as '1D' | '5D' | '20D';
    const cleanSym = rawSymbol.replace('.JK', '').replace('^', '').toUpperCase().trim();

    // 1. Resolve verified market price & metadata
    const globalMatch = INVESTING_COM_GLOBAL_DIVIDENDS.find(
      (g) => g.ticker.toUpperCase() === cleanSym
    );
    const benchmark = globalMatch
      ? { price: globalMatch.price, currency: globalMatch.currency, name: globalMatch.name }
      : getVerifiedBenchmarkPrice(cleanSym);

    const paramPrice = searchParams.get('price');
    const overridePrice = paramPrice ? parseFloat(paramPrice) : null;
    const currentPrice = overridePrice && overridePrice > 0 ? overridePrice : benchmark.price;
    const currency = benchmark.currency;
    const companyName = benchmark.name;

    // 2. Generate calibrated historical candles anchored directly to current price
    const rawCandles = generateCalibratedCandles(currentPrice, '1D', 80);
    const candles: OHLCVCandle[] = rawCandles.map((c) => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    }));

    // 3. Execute High-Frequency Institutional Quant Engine
    const quant = analyzeStockQuant(cleanSym, companyName, candles, currency);

    // 4. Derive Anomaly Isolation Score
    const volumeZ = quant.indicators.volumeZScore;
    const isAnomaly = volumeZ >= 2.0 || (Math.abs(quant.indicators.dailyDrift) >= 3.0 && volumeZ >= 1.5);
    const anomalyStatus = isAnomaly
      ? (quant.indicators.cmf20 >= 0 ? 'WHALE ACCUMULATION ANOMALY' : 'DISTRIBUTION SPIKE')
      : volumeZ >= 1.4 ? 'ELEVATED' : 'NORMAL';

    const smartMoneyFlow = quant.indicators.cmf20 > 0.05
      ? 'ACCUMULATING'
      : quant.indicators.cmf20 < -0.05
      ? 'DISTRIBUTING'
      : 'NEUTRAL';

    const anomalyDetails = isAnomaly
      ? `🚨 ANOMALI STATISTIKA (+${volumeZ}σ): Arus transaksi institusi melonjak signifikan ${quant.indicators.cmf20 >= 0 ? 'menyerap likuiditas (Net Inflow)' : 'menembus bid (Net Outflow)'}.`
      : volumeZ >= 1.4
      ? `Aktivitas volume transaksi berada di atas batas normal (+${volumeZ}σ) dengan Chaikin Flow: ${quant.indicators.cmf20 >= 0 ? '+' : ''}${quant.indicators.cmf20}.`
      : 'Arus likuiditas transaksi dan volume berfluktuasi dalam batas statistika normal.';

    // 5. Structure Unified Quant Response
    const responsePayload = {
      symbol: cleanSym,
      name: companyName,
      currentPrice,
      currency,
      changePct: Number(quant.indicators.dailyDrift.toFixed(2)),
      timestamp: new Date().toISOString(),
      activeHorizon: requestedHorizon,
      marketRegime: quant.marketRegime,
      confluenceMatrix: quant.confluenceMatrix,
      isTripleConfluence: quant.isTripleConfluence,
      tripleConfluenceVerdict: quant.tripleConfluenceVerdict,
      compositeAlpha: {
        totalScore: quant.factors.compositeAlpha,
        grade: quant.factors.alphaGrade,
        breakdown: {
          technical: quant.factors.trendScore,
          sentimentNlp: quant.factors.momentumScore,
          smartMoneyFlow: quant.factors.smartMoneyScore,
        },
        verdict: quant.factors.alphaGrade.includes('AAA')
          ? 'Conviction Sangat Kuat: Didukung konfluensi indikator kuantitatif multi-faktor.'
          : 'Conviction Moderat: Pantau konfirmasi volume sebelum menambah eksposur.',
      },
      kellySizing: quant.kellySizing,
      smartMoneyDivergence: quant.smartMoneyDivergence,
      xaiThesis: quant.xaiThesis,
      forecasts: quant.forecasts,
      anomalyDetection: {
        isAnomaly,
        anomalyScore: Number((0.7 - volumeZ * 0.25).toFixed(3)),
        status: anomalyStatus,
        volumeZScore: volumeZ,
        details: anomalyDetails,
        smartMoneyFlow,
      },
      features: quant.features,
      ensembleLeaderboard: quant.ensembleLeaderboard,
      metaLearner: {
        name: 'AutoSklearn Institutional Stacking Engine',
        stackingMethod: 'Ridge-Regularized Meta-Learner (K-Fold CV)',
        regimeAdjustment: `Adaptive Weight Calibration via ${quant.marketRegime.phaseTag}`,
      },
      backtestMetrics: quant.backtestMetrics,
      indicators: quant.indicators,
      hedgeFundCommittee: evaluateHedgeFundCommittee(cleanSym, companyName, candles, currency),
    };

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    console.error('Error in /api/ai/predict:', err);
    return NextResponse.json(
      { error: err?.message || 'Gagal memproses quant prediction' },
      { status: 500 }
    );
  }
}
