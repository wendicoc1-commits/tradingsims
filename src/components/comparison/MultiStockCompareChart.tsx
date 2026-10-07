'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Plus,
  X,
  Activity,
  BarChart3,
  Check,
  Scale,
} from 'lucide-react';
import { ALL_ID_HEATMAP_UNIVERSE } from '@/data/heatmap_stocks_universe';
import CompanyLogo from '@/components/common/CompanyLogo';

const PRESET_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function MultiStockCompareChart() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>(['BBCA', 'BBRI', 'BMRI']);
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | '3Y'>('1Y');
  const [includeIHSG, setIncludeIHSG] = useState(true);

  const availableStocks = ALL_ID_HEATMAP_UNIVERSE;

  const toggleTicker = (ticker: string) => {
    if (selectedTickers.includes(ticker)) {
      if (selectedTickers.length > 1) {
        setSelectedTickers(selectedTickers.filter((t) => t !== ticker));
      }
    } else {
      if (selectedTickers.length < 5) {
        setSelectedTickers([...selectedTickers, ticker]);
      }
    }
  };

  // Generate normalized comparative performance curve
  const comparisonData = useMemo(() => {
    const steps = ['Start', 'Q1', 'Q2', 'Q3', 'End'];
    
    // Seed return profiles for each ticker
    const tickerMetrics = selectedTickers.map((ticker, idx) => {
      const stock = availableStocks.find((s) => s.displaySymbol === ticker);
      const color = PRESET_COLORS[idx % PRESET_COLORS.length];
      
      let baseFinalReturn = 14.5;
      if (ticker === 'BBCA') baseFinalReturn = 18.2;
      if (ticker === 'BBRI') baseFinalReturn = 8.4;
      if (ticker === 'BMRI') baseFinalReturn = 16.5;
      if (ticker === 'ASII') baseFinalReturn = 12.0;
      if (ticker === 'TLKM') baseFinalReturn = -4.5;
      if (ticker === 'ADRO') baseFinalReturn = 22.8;

      const curve = [
        0,
        Number((baseFinalReturn * 0.28).toFixed(1)),
        Number((baseFinalReturn * 0.52).toFixed(1)),
        Number((baseFinalReturn * 0.85).toFixed(1)),
        baseFinalReturn,
      ];

      return {
        ticker,
        name: stock?.name || ticker,
        color,
        peRatio: stock?.peRatio || 12.0,
        divYield: stock?.divYield || 3.0,
        finalReturn: baseFinalReturn,
        volatility: Number((14 + idx * 2.2).toFixed(1)),
        correlationIHSG: Number((0.85 - idx * 0.05).toFixed(2)),
        curve,
      };
    });

    const ihsgCurve = [0, 3.2, 5.8, 8.4, 9.8];

    return {
      steps,
      tickers: tickerMetrics,
      ihsgCurve,
    };
  }, [selectedTickers, availableStocks]);

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Top Header Ribbon ── */}
      <div
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                MULTI-STOCK RELATIVE PERFORMANCE & OVERLAY COMPARISON
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded border text-sky-400 bg-sky-500/10 border-sky-500/30">
                NORMALIZED %
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Komparasi performa persentase imbal hasil saham, volatilitas, & korelasi terhadap indeks acuan.
            </p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg border bg-neutral-900/60 border-neutral-800 text-xs">
          {(['1M', '3M', '6M', '1Y', '3Y'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                timeframe === tf
                  ? 'bg-sky-500 text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* ── Ticker Selector Pills Bar ── */}
      <div
        className="p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-neutral-400 font-bold">Pilih Ticker (Maks 5):</span>
          {['BBCA', 'BBRI', 'BMRI', 'BBNI', 'ASII', 'TLKM', 'ADRO', 'AMMN', 'ICBP'].map((sym) => {
            const isSelected = selectedTickers.includes(sym);
            return (
              <button
                key={sym}
                type="button"
                onClick={() => toggleTicker(sym)}
                className={`px-3 py-1 rounded-lg border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-sky-500 text-black border-sky-400 shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{sym}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIncludeIHSG(!includeIHSG)}
          className={`px-3 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
            includeIHSG
              ? 'bg-neutral-800 text-amber-400 border-amber-500/40'
              : 'bg-neutral-900 text-neutral-500 border-neutral-800'
          }`}
        >
          {includeIHSG ? '✓ Benchmark IHSG (+9.8%)' : '+ Tampilkan IHSG'}
        </button>
      </div>

      {/* ── Visual Normalized Overlay Comparison Chart ── */}
      <div
        className="p-4 rounded-xl border shadow-sm"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
          <span className="font-bold text-white uppercase tracking-wider">
            Normalized Performance Return Curve (% Dari Baseline 0%)
          </span>

          {/* Legend Items */}
          <div className="flex items-center gap-3 flex-wrap">
            {comparisonData.tickers.map((t) => (
              <div key={t.ticker} className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-white">{t.ticker}</span>
                <span style={{ color: t.color }}>({t.finalReturn >= 0 ? '+' : ''}{t.finalReturn}%)</span>
              </div>
            ))}
            {includeIHSG && (
              <div className="flex items-center gap-1.5 font-bold text-neutral-400">
                <span className="w-3 h-3 rounded-full bg-amber-400 border border-neutral-700" />
                <span>IHSG (+9.8%)</span>
              </div>
            )}
          </div>
        </div>

        {/* Visual Multi-Bar / Trend Display */}
        <div className="h-48 w-full flex items-end gap-3 pt-6 px-4 border-b border-neutral-800 bg-neutral-950/40 rounded-lg">
          {comparisonData.steps.map((step, sIdx) => (
            <div key={step} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <div className="flex items-end gap-1.5 h-full w-full justify-center">
                {comparisonData.tickers.map((t) => {
                  const val = t.curve[sIdx];
                  const height = Math.max(8, Math.min(95, Math.round(Math.abs(val) * 3.5)));
                  return (
                    <div
                      key={t.ticker}
                      className="w-3 sm:w-4 rounded-t transition-all duration-300 hover:brightness-125 relative group"
                      style={{
                        backgroundColor: t.color,
                        height: `${height}%`,
                      }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 bg-black/90 px-1 rounded z-10 whitespace-nowrap pointer-events-none">
                        {t.ticker}: {val}%
                      </span>
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] text-neutral-400">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comparative Metrics Table ── */}
      <div
        className="rounded-xl border overflow-hidden shadow-sm"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="p-3 border-b flex items-center justify-between text-xs" style={{ borderColor: 'var(--border)' }}>
          <span className="font-bold text-white uppercase">TABEL PERBANDINGAN METRIK & VALUASI</span>
          <span className="text-neutral-500">Periode: {timeframe}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-right">
            <thead>
              <tr className="border-b text-neutral-400 border-neutral-800 bg-neutral-900/40">
                <th className="py-2.5 px-3 text-left">Saham</th>
                <th className="py-2.5 px-3">Return Periode</th>
                <th className="py-2.5 px-3">P/E (TTM)</th>
                <th className="py-2.5 px-3">Div Yield</th>
                <th className="py-2.5 px-3">Volatilitas (Tahunan)</th>
                <th className="py-2.5 px-3">Korelasi vs IHSG</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/70">
              {comparisonData.tickers.map((t) => (
                <tr key={t.ticker} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <Link href={`/stock/${t.ticker}`} className="font-bold text-white hover:text-amber-400">
                        {t.ticker}
                      </Link>
                      <span className="text-[11px] text-neutral-500 truncate max-w-[120px]">
                        {t.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-bold" style={{ color: t.color }}>
                    {t.finalReturn >= 0 ? '+' : ''}{t.finalReturn}%
                  </td>
                  <td className="py-2.5 px-3 text-neutral-200">{t.peRatio}x</td>
                  <td className="py-2.5 px-3 text-emerald-400">{t.divYield}%</td>
                  <td className="py-2.5 px-3 text-neutral-300">{t.volatility}%</td>
                  <td className="py-2.5 px-3 text-neutral-300">{t.correlationIHSG}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.finalReturn >= 9.8
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {t.finalReturn >= 9.8 ? 'OUTPERFORM' : 'LAGGARD'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
