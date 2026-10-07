'use client';

import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  FileText,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getAnalystConsensus, StockConsensusData } from '@/data/bloomberg_analyst_consensus';
import { formatPrice } from '@/lib/utils';

interface AnalystConsensusDeskProps {
  symbol: string;
  currentPrice?: number;
  currency?: string;
}

export default function AnalystConsensusDesk({
  symbol,
  currentPrice: propPrice,
  currency: propCurrency = 'IDR',
}: AnalystConsensusDeskProps) {
  const data: StockConsensusData = getAnalystConsensus(symbol);
  const activePrice = propPrice || data.currentPrice;
  const currency = propCurrency || data.currency;

  const [ratingFilter, setRatingFilter] = useState<'ALL' | 'BUY' | 'HOLD' | 'SELL'>('ALL');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  const filteredRecs = data.recommendations.filter((r) => {
    if (ratingFilter === 'ALL') return true;
    if (ratingFilter === 'BUY') return r.rating === 'BUY' || r.rating === 'OUTPERFORM';
    if (ratingFilter === 'HOLD') return r.rating === 'HOLD';
    if (ratingFilter === 'SELL') return r.rating === 'SELL' || r.rating === 'UNDERPERFORM';
    return true;
  });

  const upsideToConsensus = ((data.targetPriceConsensus - activePrice) / activePrice) * 100;
  const buyPercent = Math.round((data.buyCount / data.totalAnalysts) * 100);
  const holdPercent = Math.round((data.holdCount / data.totalAnalysts) * 100);
  const sellPercent = 100 - buyPercent - holdPercent;

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded border bg-[#09090b] border-[#27272a]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-ping" />
            <span className="text-xs font-black text-[#f59e0b] uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              BLOOMBERG ANR &lt;GO&gt; &bull; ANALYST CONSENSUS &amp; ESTIMATES
            </span>
            <span className="text-[10px] text-[#71717a]">| WALL STREET &amp; IDX RESEARCH COVERAGE</span>
          </div>
          <h2 className="text-lg font-black text-white tracking-wide">
            Konsensus Target Price &amp; Rekomendasi Riset Sekuritas ({data.symbol})
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Agregasi konsensus resmi dari broker tier-1 global dan domestik (J.P. Morgan, CLSA, Mandiri Sekuritas, Macquarie, BCA Sekuritas).
          </p>
        </div>

        {/* Momentum revision badge */}
        <div className="flex items-center gap-2 p-2 rounded bg-[#18181b] border border-[#27272a] shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-[#71717a] uppercase font-bold">Revision Momentum (30D)</div>
            <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-[#22c55e]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{data.revisionMomentum.upgraded30D} Upgrades</span>
              <span className="text-[#71717a] font-normal">/ {data.revisionMomentum.downgraded30D} Cuts</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Consensus Target Price */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Konsensus Target Price (12M)</div>
          <div className="text-xl font-black text-[#f59e0b] mt-1 font-mono">
            {formatPrice(data.targetPriceConsensus, currency)}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold mt-1 text-[#22c55e]">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Potensi Upside: +{upsideToConsensus.toFixed(1)}%</span>
          </div>
        </div>

        {/* Consensus Score Gauge */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Consensus Rating Score</div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-white">{data.consensusScore.toFixed(1)}</span>
            <span className="text-xs text-[#71717a]">/ 5.0</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
              STRONG BUY
            </span>
          </div>
          <div className="text-[10px] text-[#a1a1aa] mt-1">
            Total {data.totalAnalysts} Analis Terdaftar
          </div>
        </div>

        {/* High / Low Range */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Target Price High vs Low</div>
          <div className="flex items-center justify-between mt-1.5 text-xs font-mono">
            <span className="text-[#22c55e] font-bold">High: {formatPrice(data.targetPriceHigh, currency)}</span>
            <span className="text-[#ef4444] font-bold">Low: {formatPrice(data.targetPriceLow, currency)}</span>
          </div>
          <div className="w-full bg-[#27272a] h-1.5 rounded-full mt-2 overflow-hidden flex">
            <div className="bg-[#22c55e] h-full" style={{ width: '70%' }} />
            <div className="bg-[#f59e0b] h-full" style={{ width: '20%' }} />
            <div className="bg-[#ef4444] h-full" style={{ width: '10%' }} />
          </div>
        </div>

        {/* Breakdown Ratio */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Distribusi Rekomendasi</div>
          <div className="flex items-center justify-between text-[11px] font-bold mt-1">
            <span className="text-[#22c55e]">BUY: {data.buyCount} ({buyPercent}%)</span>
            <span className="text-[#f59e0b]">HOLD: {data.holdCount}</span>
            <span className="text-[#ef4444]">SELL: {data.sellCount}</span>
          </div>
          <div className="w-full bg-[#27272a] h-2 rounded-full mt-2 overflow-hidden flex">
            <div className="bg-[#22c55e] h-full" style={{ width: `${buyPercent}%` }} />
            <div className="bg-[#f59e0b] h-full" style={{ width: `${holdPercent}%` }} />
            <div className="bg-[#ef4444] h-full" style={{ width: `${sellPercent}%` }} />
          </div>
        </div>
      </div>

      {/* ── Table Filter and Listing ── */}
      <div className="rounded border bg-[#121216] border-[#27272a] overflow-hidden">
        {/* Table Control Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border-b border-[#27272a] bg-[#18181b]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#f59e0b]" />
            <span className="font-bold text-white text-xs uppercase tracking-wide">
              Daftar Catatan Riset Analis (Broker Notes)
            </span>
            <span className="text-[10px] text-[#71717a]">({filteredRecs.length} publikasi)</span>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1">
            {(['ALL', 'BUY', 'HOLD', 'SELL'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setRatingFilter(mode)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  ratingFilter === mode
                    ? 'bg-[#f59e0b] text-black font-extrabold shadow-sm'
                    : 'text-[#a1a1aa] hover:text-white bg-[#27272a]/50 hover:bg-[#27272a]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#0d0d10] text-[10px] text-[#71717a] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-3">Sekuritas &amp; Broker</th>
                <th className="py-2.5 px-3">Analis</th>
                <th className="py-2.5 px-3">Rating</th>
                <th className="py-2.5 px-3 text-right">Target Price</th>
                <th className="py-2.5 px-3 text-right">Potensi Upside</th>
                <th className="py-2.5 px-3 text-right">Fwd P/E</th>
                <th className="py-2.5 px-3 text-right">Tanggal Riset</th>
                <th className="py-2.5 px-3">Thesis Utama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f23] text-xs">
              {filteredRecs.map((rec) => {
                const isSelected = selectedNote === rec.id;
                return (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedNote(isSelected ? null : rec.id)}
                    className={`hover:bg-[#18181c] cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#18181c]' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#27272a] text-[#f59e0b] border border-[#3f3f46]">
                          {rec.firmCode}
                        </span>
                        <span className="truncate max-w-[140px]">{rec.firm}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#d4d4d8] text-[11px]">
                      {rec.analyst}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold inline-block ${
                          rec.rating === 'BUY' || rec.rating === 'OUTPERFORM'
                            ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30'
                            : rec.rating === 'HOLD'
                            ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30'
                            : 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30'
                        }`}
                      >
                        {rec.rating}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white font-mono">
                      {formatPrice(rec.targetPrice, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono">
                      <span
                        className={rec.impliedUpside >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}
                      >
                        {rec.impliedUpside >= 0 ? '+' : ''}{rec.impliedUpside.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#a1a1aa] font-mono">
                      {rec.peForward}x
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#71717a] text-[11px] font-mono">
                      {rec.reportDate}
                    </td>
                    <td className="py-2.5 px-3 text-[#a1a1aa] text-[11px] truncate max-w-xs">
                      {rec.headline}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Note Deep Dive Modal / Drawer */}
        {selectedNote && (() => {
          const activeRec = data.recommendations.find((r) => r.id === selectedNote);
          if (!activeRec) return null;
          return (
            <div className="p-4 bg-[#09090b] border-t border-[#27272a] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#f59e0b] font-bold text-xs uppercase">
                    &bull; DETAIL RISET: {activeRec.firm} ({activeRec.firmCode})
                  </span>
                  <span className="text-[10px] text-[#71717a]">Analis: {activeRec.analyst}</span>
                </div>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="text-xs text-[#71717a] hover:text-white cursor-pointer"
                >
                  ✕ Tutup
                </button>
              </div>
              <h4 className="text-sm font-bold text-white">
                &ldquo;{activeRec.headline}&rdquo;
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                <div className="p-2 rounded bg-[#18181b] border border-[#27272a]">
                  <div className="text-[#71717a] text-[9px] uppercase">Rating Resmi</div>
                  <div className="font-bold text-[#22c55e]">{activeRec.rating}</div>
                </div>
                <div className="p-2 rounded bg-[#18181b] border border-[#27272a]">
                  <div className="text-[#71717a] text-[9px] uppercase">Target Price (12M)</div>
                  <div className="font-bold text-white font-mono">{formatPrice(activeRec.targetPrice, currency)}</div>
                </div>
                <div className="p-2 rounded bg-[#18181b] border border-[#27272a]">
                  <div className="text-[#71717a] text-[9px] uppercase">Estimasi EPS 2026F</div>
                  <div className="font-bold text-[#f59e0b] font-mono">Rp {activeRec.eps2026F}</div>
                </div>
                <div className="p-2 rounded bg-[#18181b] border border-[#27272a]">
                  <div className="text-[#71717a] text-[9px] uppercase">Forward P/E Multiple</div>
                  <div className="font-bold text-white font-mono">{activeRec.peForward}x</div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
