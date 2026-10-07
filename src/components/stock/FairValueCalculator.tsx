'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, Sparkles, TrendingUp, TrendingDown, Target, ShieldCheck, AlertCircle } from 'lucide-react';
import type { StockQuote } from '@/types';

interface FairValueCalculatorProps {
  quote: StockQuote;
}

export default function FairValueCalculator({ quote }: FairValueCalculatorProps) {
  const currentPrice = quote.price || 1000;

  // DCF Sliders State
  const [growthRate, setGrowthRate] = useState<number>(10); // 10% annual 5Y growth
  const [discountRate, setDiscountRate] = useState<number>(10); // 10% WACC
  const [terminalGrowth, setTerminalGrowth] = useState<number>(3.5); // 3.5% terminal growth

  // Estimasi Fundamental Berdasarkan Saham
  const pe = quote.peRatio || 12.5;
  const eps = Math.round(currentPrice / pe);
  // Estimasi Book Value Per Share (BVPS)
  const estimatedPbv = currentPrice > 8000 ? 4.2 : currentPrice > 3000 ? 2.5 : 1.2;
  const bvps = Math.round(currentPrice / estimatedPbv);

  // 1. Benjamin Graham Formula: sqrt(22.5 * EPS * BVPS)
  const grahamValue = useMemo(() => {
    if (eps <= 0 || bvps <= 0) return currentPrice;
    return Math.round(Math.sqrt(22.5 * eps * bvps));
  }, [eps, bvps, currentPrice]);

  // 2. DCF Valuation Calculation (5 Years + Terminal Value)
  const dcfValue = useMemo(() => {
    const fcfBase = eps * 0.85; // Estimasi Free Cash Flow ~ 85% of EPS
    let pvSum = 0;
    let cf = fcfBase;
    const r = discountRate / 100;
    const g = growthRate / 100;
    const tg = terminalGrowth / 100;

    for (let yr = 1; yr <= 5; yr++) {
      cf = cf * (1 + g);
      const pv = cf / Math.pow(1 + r, yr);
      pvSum += pv;
    }

    // Terminal Value
    const terminalValue = (cf * (1 + tg)) / Math.max(0.01, r - tg);
    const pvTerminal = terminalValue / Math.pow(1 + r, 5);

    const totalIntrinsic = pvSum + pvTerminal;
    return Math.round(Math.max(50, totalIntrinsic));
  }, [eps, growthRate, discountRate, terminalGrowth]);

  // 3. Blended Fair Value & Margin of Safety
  const blendedFairValue = Math.round((grahamValue * 0.4) + (dcfValue * 0.6));
  const marginOfSafety = Number((((blendedFairValue - currentPrice) / blendedFairValue) * 100).toFixed(1));
  const upsidePercent = Number((((blendedFairValue - currentPrice) / currentPrice) * 100).toFixed(1));

  const isUndervalued = marginOfSafety > 10;
  const isFair = marginOfSafety >= -10 && marginOfSafety <= 10;

  return (
    <div
      className="rounded-xl border p-4 space-y-4"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Fair Value & DCF Intrinsic Calculator</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-indigo-500/20 text-indigo-300">
                BENJAMIN GRAHAM & DCF
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Kalkulasi saintifik harga wajar intrinsik saham {quote.displaySymbol}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isUndervalued ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> UNDERVALUED (+{marginOfSafety}% Margin of Safety)
            </span>
          ) : isFair ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Target className="w-3.5 h-3.5" /> FAIR VALUE (Harga Wajar)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertCircle className="w-3.5 h-3.5" /> PREMIUM / OVERVALUED ({marginOfSafety}%)
            </span>
          )}
        </div>
      </div>

      {/* Main Fair Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Harga Sekarang */}
        <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
          <span className="text-[11px] text-neutral-400">Harga Pasar Terkini</span>
          <div className="text-lg font-bold font-mono-num text-white mt-1">
            Rp {currentPrice.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">P/E: {pe.toFixed(1)}x • P/BV: ~{estimatedPbv.toFixed(1)}x</span>
        </div>

        {/* Benjamin Graham Number */}
        <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Graham Number Formula</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">EPS {eps}</span>
          </div>
          <div className="text-lg font-bold font-mono-num text-emerald-400 mt-1">
            Rp {grahamValue.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-neutral-500">√(22.5 × EPS × BVPS)</span>
        </div>

        {/* DCF Fair Value */}
        <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">DCF Fair Value (Konsensus)</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">WACC {discountRate}%</span>
          </div>
          <div className="text-lg font-bold font-mono-num text-indigo-400 mt-1">
            Rp {dcfValue.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] font-semibold text-emerald-400">
            Potensi Upside: {upsidePercent >= 0 ? '+' : ''}{upsidePercent}%
          </div>
        </div>
      </div>

      {/* Interactive DCF Assumption Sliders */}
      <div className="p-4 rounded-lg bg-neutral-900/80 border border-neutral-800 space-y-3">
        <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
          Parameter Asumsi Model DCF
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Growth Rate */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-400">Pertumbuhan Laba 5 Thn:</span>
              <span className="font-bold text-emerald-400 font-mono">{growthRate}% p.a.</span>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              step="0.5"
              value={growthRate}
              onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Discount Rate / WACC */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-400">Tingkat Diskonto (WACC):</span>
              <span className="font-bold text-indigo-400 font-mono">{discountRate}%</span>
            </div>
            <input
              type="range"
              min="6"
              max="16"
              step="0.5"
              value={discountRate}
              onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Terminal Growth */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-neutral-400">Pertumbuhan Terminal:</span>
              <span className="font-bold text-amber-400 font-mono">{terminalGrowth}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.25"
              value={terminalGrowth}
              onChange={(e) => setTerminalGrowth(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Visual Margin of Safety Meter */}
      <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-400 font-medium">Batas Harga Wajar Gabungan (Blended Intrinsic):</span>
          <span className="font-bold text-white font-mono text-sm">
            Rp {blendedFairValue.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Margin of Safety bar */}
        <div className="w-full h-2.5 rounded-full bg-neutral-800 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-300 ${
              isUndervalued ? 'bg-emerald-500' : isFair ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(10, ((blendedFairValue) / (currentPrice * 1.5)) * 100))}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
          <span>Diskon Ekstrem (&lt; Rp {Math.round(currentPrice * 0.7)})</span>
          <span>Harga Sekarang (Rp {currentPrice.toLocaleString('id-ID')})</span>
          <span>Target Premium (&gt; Rp {Math.round(currentPrice * 1.3)})</span>
        </div>
      </div>
    </div>
  );
}
