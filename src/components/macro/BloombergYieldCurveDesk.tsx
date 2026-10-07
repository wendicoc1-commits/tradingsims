'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Layers,
  Calendar,
  Globe2,
  ArrowRight
} from 'lucide-react';

interface TenorData {
  tenor: string;
  tenorLabel: string;
  order: number;
  sbnToday: number;
  sbn1MAgo: number;
  sbn1YAgo: number;
  ustToday: number;
  ust1MAgo: number;
  ust1YAgo: number;
}

const YIELD_CURVE_DATA: TenorData[] = [
  { tenor: '1M', tenorLabel: '1 Bulan', order: 1, sbnToday: 5.85, sbn1MAgo: 5.90, sbn1YAgo: 5.75, ustToday: 4.82, ust1MAgo: 4.95, ust1YAgo: 5.30 },
  { tenor: '3M', tenorLabel: '3 Bulan', order: 2, sbnToday: 6.05, sbn1MAgo: 6.10, sbn1YAgo: 5.95, ustToday: 4.70, ust1MAgo: 4.85, ust1YAgo: 5.25 },
  { tenor: '6M', tenorLabel: '6 Bulan', order: 3, sbnToday: 6.20, sbn1MAgo: 6.25, sbn1YAgo: 6.10, ustToday: 4.55, ust1MAgo: 4.70, ust1YAgo: 5.15 },
  { tenor: '1Y', tenorLabel: '1 Tahun', order: 4, sbnToday: 6.35, sbn1MAgo: 6.40, sbn1YAgo: 6.25, ustToday: 4.30, ust1MAgo: 4.45, ust1YAgo: 4.95 },
  { tenor: '2Y', tenorLabel: '2 Tahun', order: 5, sbnToday: 6.42, sbn1MAgo: 6.48, sbn1YAgo: 6.35, ustToday: 4.22, ust1MAgo: 4.38, ust1YAgo: 4.80 },
  { tenor: '3Y', tenorLabel: '3 Tahun', order: 6, sbnToday: 6.50, sbn1MAgo: 6.55, sbn1YAgo: 6.40, ustToday: 4.18, ust1MAgo: 4.32, ust1YAgo: 4.60 },
  { tenor: '5Y', tenorLabel: '5 Tahun', order: 7, sbnToday: 6.62, sbn1MAgo: 6.70, sbn1YAgo: 6.55, ustToday: 4.25, ust1MAgo: 4.35, ust1YAgo: 4.50 },
  { tenor: '7Y', tenorLabel: '7 Tahun', order: 8, sbnToday: 6.74, sbn1MAgo: 6.80, sbn1YAgo: 6.65, ustToday: 4.32, ust1MAgo: 4.40, ust1YAgo: 4.52 },
  { tenor: '10Y', tenorLabel: '10 Tahun', order: 9, sbnToday: 6.84, sbn1MAgo: 6.92, sbn1YAgo: 6.78, ustToday: 4.40, ust1MAgo: 4.48, ust1YAgo: 4.58 },
  { tenor: '15Y', tenorLabel: '15 Tahun', order: 10, sbnToday: 7.02, sbn1MAgo: 7.10, sbn1YAgo: 6.95, ustToday: 4.55, ust1MAgo: 4.60, ust1YAgo: 4.70 },
  { tenor: '20Y', tenorLabel: '20 Tahun', order: 11, sbnToday: 7.12, sbn1MAgo: 7.18, sbn1YAgo: 7.05, ustToday: 4.68, ust1MAgo: 4.72, ust1YAgo: 4.82 },
  { tenor: '30Y', tenorLabel: '30 Tahun', order: 12, sbnToday: 7.20, sbn1MAgo: 7.25, sbn1YAgo: 7.15, ustToday: 4.75, ust1MAgo: 4.80, ust1YAgo: 4.90 },
];

export default function BloombergYieldCurveDesk() {
  const [activeMarket, setActiveMarket] = useState<'BOTH' | 'SBN' | 'UST'>('BOTH');
  const [activePeriod, setActivePeriod] = useState<'TODAY' | '1M_AGO' | '1Y_AGO'>('TODAY');

  // Key Spreads
  const sbn2Y = YIELD_CURVE_DATA.find((d) => d.tenor === '2Y')?.sbnToday || 6.42;
  const sbn10Y = YIELD_CURVE_DATA.find((d) => d.tenor === '10Y')?.sbnToday || 6.84;
  const sbn2Y10YSpread = Math.round((sbn10Y - sbn2Y) * 100); // bps

  const ust2Y = YIELD_CURVE_DATA.find((d) => d.tenor === '2Y')?.ustToday || 4.22;
  const ust10Y = YIELD_CURVE_DATA.find((d) => d.tenor === '10Y')?.ustToday || 4.40;
  const ust2Y10YSpread = Math.round((ust10Y - ust2Y) * 100); // bps (+18 bps)

  const sovereign10YSpread = Math.round((sbn10Y - ust10Y) * 100); // +244 bps

  // SVG Chart Dimensions
  const chartWidth = 760;
  const chartHeight = 220;
  const padLeft = 45;
  const padRight = 25;
  const padTop = 20;
  const padBottom = 30;

  const minYield = 3.5;
  const maxYield = 8.0;

  const getX = (index: number) => {
    return padLeft + (index / (YIELD_CURVE_DATA.length - 1)) * (chartWidth - padLeft - padRight);
  };

  const getY = (yieldVal: number) => {
    const norm = (yieldVal - minYield) / (maxYield - minYield);
    return chartHeight - padBottom - norm * (chartHeight - padTop - padBottom);
  };

  const getPointsPath = (curveType: 'sbn' | 'ust', period: 'TODAY' | '1M_AGO' | '1Y_AGO') => {
    return YIELD_CURVE_DATA.map((d, i) => {
      let val = d.sbnToday;
      if (curveType === 'sbn') {
        val = period === 'TODAY' ? d.sbnToday : period === '1M_AGO' ? d.sbn1MAgo : d.sbn1YAgo;
      } else {
        val = period === 'TODAY' ? d.ustToday : period === '1M_AGO' ? d.ust1MAgo : d.ust1YAgo;
      }
      return `${getX(i)},${getY(val)}`;
    }).join(' ');
  };

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded border bg-[#09090b] border-[#27272a]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-ping" />
            <span className="text-xs font-black text-[#f59e0b] uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              TRADESIM YCRV &bull; SOVEREIGN YIELD CURVE &amp; INVERSION MONITOR
            </span>
            <span className="text-[10px] text-[#71717a]">| FIXED INCOME BENCHMARK DESK</span>
          </div>
          <h2 className="text-lg font-black text-white tracking-wide">
            Kurva Imbal Hasil Surat Utang Negara (SBN) &amp; US Treasury
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Memonitor ekspektasi suku bunga global, bentuk kurva imbal hasil (*steepening / flattening*), serta spread 2Y-10Y sebagai indikator siklus makroekonomi.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded bg-[#18181b] border border-[#27272a]">
            {(['BOTH', 'SBN', 'UST'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveMarket(m)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  activeMarket === m
                    ? 'bg-[#f59e0b] text-black font-extrabold shadow-sm'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                {m === 'BOTH' ? 'SBN & UST OVERLAY' : m === 'SBN' ? 'SBN INDONESIA' : 'US TREASURY'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded bg-[#18181b] border border-[#27272a]">
            {(['TODAY', '1M_AGO', '1Y_AGO'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  activePeriod === p
                    ? 'bg-white text-black font-extrabold shadow-sm'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                {p === 'TODAY' ? 'HARI INI' : p === '1M_AGO' ? '1 BLN LALU' : '1 THN LALU'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Key Inversion & Spread Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* US 2Y-10Y Spread Inversion Detector */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">US Treasury 2Y vs 10Y Curve Spread</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-black font-mono ${ust2Y10YSpread >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {ust2Y10YSpread >= 0 ? `+${ust2Y10YSpread}` : ust2Y10YSpread} bps
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#22c55e]/15 text-[#22c55e]">
              NORMAL STEEPENING
            </span>
          </div>
          <div className="text-[10px] text-[#a1a1aa] mt-1">
            10Y: {ust10Y}% &bull; 2Y: {ust2Y}% (Bukan Resesi Inversi)
          </div>
        </div>

        {/* Indonesia SBN 2Y-10Y Curve Spread */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Indonesia SBN 2Y vs 10Y Slope</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-[#f59e0b] font-mono">
              +{sbn2Y10YSpread} bps
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b]">
              HEALTHY UPWARD
            </span>
          </div>
          <div className="text-[10px] text-[#a1a1aa] mt-1">
            SBN 10Y: {sbn10Y}% &bull; SBN 2Y: {sbn2Y}%
          </div>
        </div>

        {/* SBN vs US Sovereign Spread */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">10Y Sovereign Risk Premium Spread</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-[#38bdf8] font-mono">
              +{sovereign10YSpread} bps
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#38bdf8]/15 text-[#38bdf8]">
              RUPIAH RESILIENT
            </span>
          </div>
          <div className="text-[10px] text-[#a1a1aa] mt-1">
            Imbal Hasil SBN 10Y (6.84%) vs US 10Y (4.40%)
          </div>
        </div>
      </div>

      {/* ── Interactive SVG Yield Curve Graphic ── */}
      <div className="p-4 rounded border bg-[#121216] border-[#27272a] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#f59e0b]" />
            <span className="font-bold text-white text-xs uppercase">
              Grafik Struktur Kurva Imbal Hasil (Yield Curve Term Structure)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            {(activeMarket === 'BOTH' || activeMarket === 'SBN') && (
              <span className="flex items-center gap-1.5 text-[#f59e0b] font-bold">
                <span className="w-3 h-0.5 bg-[#f59e0b] rounded" /> SBN Indonesia
              </span>
            )}
            {(activeMarket === 'BOTH' || activeMarket === 'UST') && (
              <span className="flex items-center gap-1.5 text-[#38bdf8] font-bold">
                <span className="w-3 h-0.5 bg-[#38bdf8] rounded" /> US Treasury
              </span>
            )}
          </div>
        </div>

        {/* SVG Container */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56 font-mono text-[9px]">
            {/* Grid Lines */}
            {[4.0, 5.0, 6.0, 7.0].map((gridY) => (
              <g key={gridY}>
                <line
                  x1={padLeft}
                  y1={getY(gridY)}
                  x2={chartWidth - padRight}
                  y2={getY(gridY)}
                  stroke="#27272a"
                  strokeDasharray="2 2"
                />
                <text x={padLeft - 6} y={getY(gridY) + 3} fill="#71717a" textAnchor="end">
                  {gridY.toFixed(1)}%
                </text>
              </g>
            ))}

            {/* X-axis Tenor Labels */}
            {YIELD_CURVE_DATA.map((d, i) => (
              <text
                key={d.tenor}
                x={getX(i)}
                y={chartHeight - 10}
                fill="#a1a1aa"
                textAnchor="middle"
                fontWeight="bold"
              >
                {d.tenor}
              </text>
            ))}

            {/* SBN Curve Polyline */}
            {(activeMarket === 'BOTH' || activeMarket === 'SBN') && (
              <>
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getPointsPath('sbn', activePeriod)}
                />
                {YIELD_CURVE_DATA.map((d, i) => {
                  const val = activePeriod === 'TODAY' ? d.sbnToday : activePeriod === '1M_AGO' ? d.sbn1MAgo : d.sbn1YAgo;
                  return (
                    <circle
                      key={`sbn-${d.tenor}`}
                      cx={getX(i)}
                      cy={getY(val)}
                      r="3.5"
                      fill="#f59e0b"
                      stroke="#09090b"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </>
            )}

            {/* US Treasury Curve Polyline */}
            {(activeMarket === 'BOTH' || activeMarket === 'UST') && (
              <>
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getPointsPath('ust', activePeriod)}
                />
                {YIELD_CURVE_DATA.map((d, i) => {
                  const val = activePeriod === 'TODAY' ? d.ustToday : activePeriod === '1M_AGO' ? d.ust1MAgo : d.ust1YAgo;
                  return (
                    <circle
                      key={`ust-${d.tenor}`}
                      cx={getX(i)}
                      cy={getY(val)}
                      r="3.5"
                      fill="#38bdf8"
                      stroke="#09090b"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </>
            )}
          </svg>
        </div>
      </div>

      {/* ── Yield Matrix Table ── */}
      <div className="rounded border bg-[#121216] border-[#27272a] overflow-hidden">
        <div className="p-3 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-[#38bdf8]" />
            Tabel Matriks Imbal Hasil Lengkap Antar Tenor
          </span>
          <span className="text-[10px] text-[#71717a]">Diperbarui Real-Time (Data Pasar SBN DJPPR &amp; US Fed)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#0d0d10] text-[10px] text-[#71717a] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-3">Tenor</th>
                <th className="py-2.5 px-3 text-right">SBN Yield (Hari Ini)</th>
                <th className="py-2.5 px-3 text-right">SBN (1 Bln Lalu)</th>
                <th className="py-2.5 px-3 text-right">SBN (1 Thn Lalu)</th>
                <th className="py-2.5 px-3 text-right">US Treasury (Hari Ini)</th>
                <th className="py-2.5 px-3 text-right">UST (1 Bln Lalu)</th>
                <th className="py-2.5 px-3 text-right">Yield Spread (bps)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f23] text-xs font-mono">
              {YIELD_CURVE_DATA.map((row) => {
                const spread = Math.round((row.sbnToday - row.ustToday) * 100);
                return (
                  <tr key={row.tenor} className="hover:bg-[#18181c] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">
                      {row.tenor} <span className="text-[#71717a] font-normal text-[10px]">({row.tenorLabel})</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#f59e0b]">
                      {row.sbnToday.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#a1a1aa]">
                      {row.sbn1MAgo.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#71717a]">
                      {row.sbn1YAgo.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#38bdf8]">
                      {row.ustToday.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#a1a1aa]">
                      {row.ust1MAgo.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#22c55e]">
                      +{spread} bps
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
