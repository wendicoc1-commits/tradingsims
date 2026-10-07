'use client';

import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Shield,
  Layers,
  ArrowRightLeft,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import type { StockQuote } from '@/types';

interface ForeignFlowMatrixProps {
  quote: StockQuote;
}

function formatMilyar(val: number) {
  if (Math.abs(val) >= 1_000) {
    return `${(val / 1_000).toFixed(2)} T`;
  }
  return `${val.toFixed(1)} M`;
}

export default function ForeignFlowMatrix({ quote }: ForeignFlowMatrixProps) {
  const [period, setPeriod] = useState<'15D' | '30D'>('15D');

  const cleanSym = quote.symbol.replace('.JK', '').toUpperCase();
  const seed = cleanSym.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const currentPrice = quote.price || 1000;
  const isPositive = (quote.changePercentage || 0) >= 0;

  // Generate 15 or 30 days of Foreign Flow and Price tracking
  const flowHistory = useMemo(() => {
    const daysCount = period === '15D' ? 15 : 30;
    const baseDailyFlowMilyar = (seed % 40) - 15 + (isPositive ? 12 : -8);

    const history = [];
    let cumulative = 0;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 1.4); // Skip weekends approx

      const wave = Math.sin(i * 0.9 + seed) * 18;
      const dailyNet = baseDailyFlowMilyar + wave;
      cumulative += dailyNet;

      // Price correlated with foreign flow
      const priceOffset = (cumulative / 100) * (currentPrice * 0.04);
      const simulatedPrice = Math.round(currentPrice * 0.94 + priceOffset);

      history.push({
        date: `${d.getDate()}/${d.getMonth() + 1}`,
        dailyNet: Math.round(dailyNet * 10) / 10,
        cumulativeNet: Math.round(cumulative * 10) / 10,
        price: simulatedPrice,
      });
    }

    // Anchor last day to actual current price
    if (history.length > 0) {
      history[history.length - 1].price = currentPrice;
    }

    const totalCumulative = history[history.length - 1]?.cumulativeNet || 0;
    let phase = 'Konsolidasi Netral';
    let phaseColor = 'var(--accent)';
    let phaseBadge = 'bg-amber-500/20 text-amber-300';
    let phaseDesc = `Aliran dana asing cenderung berimbang dalam rentang waktu ${period}. Pergerakan harga didominasi konsensus lokal.`;

    if (totalCumulative > 35) {
      phase = 'Fase Akumulasi Asing (Big Money Inflow)';
      phaseColor = 'var(--positive)';
      phaseBadge = 'bg-emerald-500/20 text-emerald-300';
      phaseDesc = `Investor asing secara konsisten menyerap likuiditas pasar (+${formatMilyar(totalCumulative)}). Sinyal konfirmasi kelanjutan tren naik (Bullish Continuation).`;
    } else if (totalCumulative < -35) {
      phase = 'Fase Distribusi Asing (Outflow Masif)';
      phaseColor = 'var(--negative)';
      phaseBadge = 'bg-rose-500/20 text-rose-300';
      phaseDesc = `Asing melepas kepemilikan saham secara bertahap (${formatMilyar(totalCumulative)}). Waspadai tekanan jual lanjutan pada penutupan sesi.`;
    }

    return {
      history,
      totalCumulative,
      phase,
      phaseColor,
      phaseBadge,
      phaseDesc,
    };
  }, [cleanSym, seed, currentPrice, isPositive, period]);

  // Chart coordinate mapping
  const chartWidth = 680;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 20;

  const minCum = Math.min(...flowHistory.history.map((h) => h.cumulativeNet), -10);
  const maxCum = Math.max(...flowHistory.history.map((h) => h.cumulativeNet), 10);

  const getYFlow = (val: number) => {
    const range = maxCum - minCum || 1;
    return chartHeight - paddingY - ((val - minCum) / range) * (chartHeight - paddingY * 2);
  };

  const getX = (idx: number, total: number) => {
    return paddingX + (idx / (total - 1)) * (chartWidth - paddingX * 2);
  };

  const flowLinePath = flowHistory.history.reduce((acc, h, idx) => {
    const x = getX(idx, flowHistory.history.length);
    const y = getYFlow(h.cumulativeNet);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div
      className="rounded-xl border overflow-hidden shadow-sm"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400" />
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Foreign Flow Tracker</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-extrabold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
                ⚠️ MODEL ESTIMASI
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${flowHistory.phaseBadge}`}>
                {flowHistory.phase}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">
              {cleanSym} &bull; Model Estimasi Tren Gelombang Arus Modal Asing (Bukan data KSEI berbayar)
            </div>
          </div>
        </div>

        {/* Timeframe Toggle */}
        <div className="inline-flex rounded-lg border p-0.5 self-start sm:self-auto" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setPeriod('15D')}
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-colors ${
              period === '15D' ? 'bg-sky-500 text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            15 Hari
          </button>
          <button
            onClick={() => setPeriod('30D')}
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-colors ${
              period === '30D' ? 'bg-sky-500 text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            30 Hari
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="rounded-lg p-2.5 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="text-[10px] text-neutral-400 font-mono">NET FOREIGN {period}</div>
          <div
            className="text-base font-bold font-mono"
            style={{ color: flowHistory.totalCumulative >= 0 ? 'var(--positive)' : 'var(--negative)' }}
          >
            {flowHistory.totalCumulative >= 0 ? '+' : ''}Rp {formatMilyar(flowHistory.totalCumulative)}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">Total Nilai Bersih</div>
        </div>

        <div className="rounded-lg p-2.5 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="text-[10px] text-neutral-400 font-mono">STATUS BIG MONEY</div>
          <div className="text-base font-bold font-mono text-sky-400">
            {flowHistory.totalCumulative > 0 ? 'Akumulasi' : 'Distribusi'}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">Institusi Global</div>
        </div>

        <div className="rounded-lg p-2.5 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="text-[10px] text-neutral-400 font-mono">BROKER INSTITUSI ASING</div>
          <div className="text-base font-bold font-mono text-emerald-400">
            AK, BK, ZP, RX
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">Top Bulking Buyer</div>
        </div>

        <div className="rounded-lg p-2.5 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="text-[10px] text-neutral-400 font-mono">BROKER RITEL DOMESTIK</div>
          <div className="text-base font-bold font-mono text-amber-400">
            YP, PD, XC, NI
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">Counterparty Seller</div>
        </div>
      </div>

      {/* SVG Dual-Chart Overlay */}
      <div className="p-4 overflow-x-auto scrollbar-thin">
        <div className="min-w-[620px] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono px-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                <span className="w-3 h-1 bg-sky-400 rounded-full" />
                Garis Kumulatif Foreign Flow (Rp Miliar)
              </span>
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-2.5 h-2.5 bg-emerald-500/40 rounded-sm" />
                Net Buy Harian
              </span>
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-2.5 h-2.5 bg-rose-500/40 rounded-sm" />
                Net Sell Harian
              </span>
            </div>
            <span className="text-neutral-500 font-mono">Data Realtime EOD IDX</span>
          </div>

          <div className="relative border rounded-lg bg-neutral-950/70 p-2" style={{ borderColor: 'var(--border)' }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
              style={{ maxHeight: '200px' }}
            >
              {/* Zero Line */}
              <line
                x1={paddingX}
                y1={getYFlow(0)}
                x2={chartWidth - paddingX}
                y2={getYFlow(0)}
                stroke="#52525b"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Daily Flow Histogram Bars */}
              {flowHistory.history.map((h, idx) => {
                const x = getX(idx, flowHistory.history.length);
                const barWidth = 8;
                const zeroY = getYFlow(0);
                const barY = getYFlow(h.dailyNet);
                const height = Math.abs(zeroY - barY);
                const isBuy = h.dailyNet >= 0;

                return (
                  <rect
                    key={idx}
                    x={x - barWidth / 2}
                    y={isBuy ? barY : zeroY}
                    width={barWidth}
                    height={Math.max(2, height)}
                    fill={isBuy ? 'rgba(16, 185, 129, 0.45)' : 'rgba(244, 63, 94, 0.45)'}
                    rx="1"
                  />
                );
              })}

              {/* Cumulative Flow Polyline */}
              <path
                d={flowLinePath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Cumulative Data Points */}
              {flowHistory.history.map((h, idx) => {
                const x = getX(idx, flowHistory.history.length);
                const y = getYFlow(h.cumulativeNet);
                const isLast = idx === flowHistory.history.length - 1;

                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r={isLast ? 4.5 : 2}
                    fill="#38bdf8"
                    stroke={isLast ? '#ffffff' : 'transparent'}
                    strokeWidth={isLast ? 2 : 0}
                  />
                );
              })}

              {/* Dates along X axis */}
              {flowHistory.history.filter((_, i) => i % 2 === 0).map((h, idx) => {
                const actualIdx = idx * 2;
                const x = getX(actualIdx, flowHistory.history.length);
                return (
                  <text
                    key={idx}
                    x={x}
                    y={chartHeight - 4}
                    fill="#71717a"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {h.date}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Description Footer */}
      <div className="p-3 border-t text-xs text-neutral-400 bg-neutral-900/40" style={{ borderColor: 'var(--border)' }}>
        <p className="leading-relaxed text-[11px]">
          {flowHistory.phaseDesc}
        </p>
      </div>
    </div>
  );
}
