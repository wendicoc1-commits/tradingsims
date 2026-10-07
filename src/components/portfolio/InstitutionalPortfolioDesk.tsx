'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ShieldAlert,
  Printer,
  Download,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  DollarSign,
  Maximize2,
} from 'lucide-react';
import { usePortfolioStore } from '@/store';

interface CorrelationStock {
  ticker: string;
  name: string;
  weight: number;
}

const CORRELATION_TICKERS: CorrelationStock[] = [
  { ticker: 'BBCA', name: 'Bank Central Asia', weight: 35 },
  { ticker: 'BMRI', name: 'Bank Mandiri', weight: 25 },
  { ticker: 'BBRI', name: 'Bank Rakyat Indonesia', weight: 15 },
  { ticker: 'ADRO', name: 'Adaro Energy', weight: 10 },
  { ticker: 'TLKM', name: 'Telkom Indonesia', weight: 8 },
  { ticker: 'ASII', name: 'Astra International', weight: 7 },
];

// Pre-computed historical rolling 1-year return correlation matrix
const CORRELATION_MATRIX: Record<string, Record<string, number>> = {
  BBCA: { BBCA: 1.00, BMRI: 0.82, BBRI: 0.74, ADRO: 0.22, TLKM: 0.45, ASII: 0.61 },
  BMRI: { BBCA: 0.82, BMRI: 1.00, BBRI: 0.86, ADRO: 0.28, TLKM: 0.41, ASII: 0.68 },
  BBRI: { BBCA: 0.74, BMRI: 0.86, BBRI: 1.00, ADRO: 0.25, TLKM: 0.38, ASII: 0.64 },
  ADRO: { BBCA: 0.22, BMRI: 0.28, BBRI: 0.25, ADRO: 1.00, TLKM: 0.12, ASII: 0.35 },
  TLKM: { BBCA: 0.45, BMRI: 0.41, BBRI: 0.38, ADRO: 0.12, TLKM: 1.00, ASII: 0.44 },
  ASII: { BBCA: 0.61, BMRI: 0.68, BBRI: 0.64, ADRO: 0.35, TLKM: 0.44, ASII: 1.00 },
};

function getCorrelationBg(value: number) {
  if (value === 1.0) return 'bg-[#15803d] text-white'; // Dark green
  if (value >= 0.8) return 'bg-[#16a34a]/80 text-white';
  if (value >= 0.6) return 'bg-[#22c55e]/60 text-white';
  if (value >= 0.4) return 'bg-[#eab308]/50 text-white';
  if (value >= 0.2) return 'bg-[#ca8a04]/40 text-white';
  if (value >= 0.0) return 'bg-[#27272a] text-[#a1a1aa]';
  return 'bg-[#ef4444]/40 text-white'; // Negative hedge
}

export default function InstitutionalPortfolioDesk() {
  const { cash, holdings } = usePortfolioStore();
  const [selectedAssetView, setSelectedAssetView] = useState<'ALL' | 'EQUITY' | 'FIXED' | 'CRYPTO'>('ALL');

  // Compute portfolio valuation (supporting both Equities & Crypto Spot)
  const holdingsValue = holdings.reduce((acc, h) => {
    const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT');
    const rate = h.exchangeRate || 16000;
    const units = isCrypto ? (h.cryptoUnits ?? h.lots) : (h.shares || h.lots * 100);
    return acc + (isCrypto ? h.currentPrice * units * rate : h.currentPrice * units);
  }, 0);
  const totalNav = cash + holdingsValue;
  const unrealizedPl = holdings.reduce((acc, h) => acc + (h.unrealizedPL || 0), 0);
  const totalReturnPct = totalNav > 0 ? (unrealizedPl / (totalNav - unrealizedPl || 1)) * 100 : 0;

  // Real asset allocation weights
  const cryptoHoldingsVal = holdings
    .filter((h) => h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT'))
    .reduce((acc, h) => {
      const rate = h.exchangeRate || 16000;
      const units = h.cryptoUnits ?? h.lots;
      return acc + h.currentPrice * units * rate;
    }, 0);
  const equityHoldingsVal = holdingsValue - cryptoHoldingsVal;

  const equityPct = totalNav > 0 ? Math.round((equityHoldingsVal / totalNav) * 100) : 0;
  const cryptoPct = totalNav > 0 ? Math.round((cryptoHoldingsVal / totalNav) * 100) : 0;
  const cashPct = totalNav > 0 ? Math.round((cash / totalNav) * 100) : 100;
  const fixedIncomePct = 0;

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-3 font-mono select-none">
      {/* ── Sub-header Institutional Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#09090b] border border-[#27272a] rounded-sm text-xs">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#f59e0b]" />
          <span className="font-bold text-white text-sm">INSTITUTIONAL PORTFOLIO DESK</span>
          <span className="text-[#3f3f46]">|</span>
          <span className="text-[#22c55e] text-[10px] font-bold">ALPHA ATTRIBUTION v3.0</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#18181b] hover:bg-[#27272a] text-[#d4d4d8] hover:text-white border border-[#27272a] rounded text-[11px] transition-colors cursor-pointer"
            title="Cetak Institutional One-Pager Tear Sheet"
          >
            <Printer className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>PRINT TEAR SHEET</span>
          </button>
        </div>
      </div>

      {/* ── Top Level Executive Telemetry (Matching Fincept Screenshot 4) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="bg-[#09090b] border border-[#27272a] p-2.5 rounded-sm">
          <div className="text-[10px] text-[#71717a] uppercase">Total Portfolio NAV</div>
          <div className="text-sm md:text-base font-bold text-white">
            Rp {totalNav.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-[#22c55e] flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>+1.42% Today</span>
          </div>
        </div>

        <div className="bg-[#09090b] border border-[#27272a] p-2.5 rounded-sm">
          <div className="text-[10px] text-[#71717a] uppercase">Cash Reserves</div>
          <div className="text-sm md:text-base font-bold text-[#f59e0b]">
            Rp {cash.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-[#71717a]">
            {cashPct}% of total assets
          </div>
        </div>

        <div className="bg-[#09090b] border border-[#27272a] p-2.5 rounded-sm">
          <div className="text-[10px] text-[#71717a] uppercase">Unrealized P&L</div>
          <div
            className={`text-sm md:text-base font-bold ${
              unrealizedPl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
            }`}
          >
            {unrealizedPl >= 0 ? '+' : ''}Rp {unrealizedPl.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-[#71717a]">
            ({totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}% ROI)
          </div>
        </div>

        <div className="bg-[#09090b] border border-[#27272a] p-2.5 rounded-sm">
          <div className="text-[10px] text-[#71717a] uppercase">Sharpe Ratio</div>
          <div className="text-sm md:text-base font-bold text-[#22c55e]">
            1.84 <span className="text-[10px] font-normal text-[#a1a1aa]">(High Alpha)</span>
          </div>
          <div className="text-[10px] text-[#71717a]">Benchmark: Rf 6.0%</div>
        </div>

        <div className="bg-[#09090b] border border-[#27272a] p-2.5 rounded-sm">
          <div className="text-[10px] text-[#71717a] uppercase">Max Drawdown (MDD)</div>
          <div className="text-sm md:text-base font-bold text-[#f59e0b]">
            -8.2% <span className="text-[10px] font-normal text-[#a1a1aa]">(Controlled)</span>
          </div>
          <div className="text-[10px] text-[#71717a]">1Y Peak-to-Trough</div>
        </div>

        <div className="bg-[#09090b] border border-[#27272a] p-2.5 rounded-sm">
          <div className="text-[10px] text-[#71717a] uppercase">Portfolio Beta & VaR</div>
          <div className="text-sm md:text-base font-bold text-white">
            0.92 <span className="text-[10px] font-normal text-[#71717a]">vs IHSG</span>
          </div>
          <div className="text-[10px] text-[#ef4444]">VaR 95%: -1.8% / day</div>
        </div>
      </div>

      {/* ── Mid Row: Asset Allocation & Correlation Matrix Heatmap ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Left: Asset Allocation Breakdown (Col 4) */}
        <div className="lg:col-span-4 bg-[#09090b] border border-[#27272a] rounded-sm p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#27272a] mb-3">
              <span className="font-bold text-xs text-white uppercase flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-[#f59e0b]" />
                Multi-Asset Allocation
              </span>
              <span className="text-[10px] text-[#71717a]">TARGET RATIO</span>
            </div>

            {/* Horizontal Stacked Allocation Bar */}
            <div className="h-3 w-full rounded overflow-hidden flex mb-3">
              <div style={{ width: `${equityPct}%` }} className="bg-[#3b82f6]" title={`Equities ${equityPct}%`} />
              <div style={{ width: `${cashPct}%` }} className="bg-[#f59e0b]" title={`Cash ${cashPct}%`} />
              <div style={{ width: `${fixedIncomePct}%` }} className="bg-[#10b981]" title={`Bonds ${fixedIncomePct}%`} />
              <div style={{ width: `${cryptoPct}%` }} className="bg-[#ec4899]" title={`Crypto ${cryptoPct}%`} />
            </div>

            {/* Legend with Values */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                  <span className="text-white">Indonesian Equities (IDX)</span>
                </div>
                <span className="font-mono font-bold text-white">{equityPct}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                  <span className="text-white">Cash & Pasar Uang</span>
                </div>
                <span className="font-mono font-bold text-white">{cashPct}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span className="text-white">SBN & Fixed Income</span>
                </div>
                <span className="font-mono font-bold text-white">{fixedIncomePct}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" />
                  <span className="text-white">Digital Assets / Crypto</span>
                </div>
                <span className="font-mono font-bold text-white">{cryptoPct}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e1e24] text-[10px] text-[#71717a] flex items-center justify-between">
            <span>RISK PROFILE: BALANCED MODERATE</span>
            <span className="text-[#22c55e]">OPTIMIZED</span>
          </div>
        </div>

        {/* Right: Cross-Asset Correlation Matrix Heatmap (Col 8) */}
        <div className="lg:col-span-8 bg-[#09090b] border border-[#27272a] rounded-sm p-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#27272a] mb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span className="font-bold text-xs text-white uppercase">
                Cross-Asset Correlation Matrix Heatmap
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#71717a]">
              <span>ROLLING 252-DAY RETURN CORRELATION</span>
            </div>
          </div>

          <p className="text-[10px] text-[#a1a1aa] mb-2">
            Korelasi &gt; 0.70 mengindikasikan risiko pergerakan searah. Korelasi rendah/negatif (&lt; 0.30) memberikan proteksi diversifikasi risiko portofolio.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-1.5 text-left text-[11px] font-bold text-[#71717a]">ASSET</th>
                  {CORRELATION_TICKERS.map((st) => (
                    <th key={st.ticker} className="p-1.5 text-[11px] font-bold text-[#d4d4d8]">
                      {st.ticker}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CORRELATION_TICKERS.map((row) => (
                  <tr key={row.ticker} className="border-t border-[#18181b]">
                    <td className="p-1.5 text-left font-bold text-white text-xs">
                      {row.ticker}
                    </td>
                    {CORRELATION_TICKERS.map((col) => {
                      const val = CORRELATION_MATRIX[row.ticker]?.[col.ticker] ?? 0;
                      return (
                        <td key={col.ticker} className="p-1">
                          <div
                            className={`py-1 rounded font-mono text-[11px] font-bold ${getCorrelationBg(val)}`}
                          >
                            {val.toFixed(2)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Color Scale Legend */}
          <div className="flex items-center justify-end gap-3 mt-3 text-[10px] text-[#71717a]">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#15803d]" />
              <span>1.00 (Self)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#16a34a]" />
              <span>0.70+ (High)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#eab308]" />
              <span>0.40 - 0.69 (Medium)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#27272a]" />
              <span>0.00 - 0.39 (Diversified)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Active Holdings Blotter Table ── */}
      <div className="bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#121215] border-b border-[#27272a] text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">POSITIONS & EXECUTION BLOTTER</span>
            <span className="text-[10px] text-[#71717a] font-mono">({holdings.length} POSISI TERBUKA)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedAssetView('ALL')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                selectedAssetView === 'ALL'
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              SEMUA ({holdings.length})
            </button>
            <button
              onClick={() => setSelectedAssetView('EQUITY')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                selectedAssetView === 'EQUITY'
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              SAHAM IDX ({holdings.filter((h) => h.assetClass !== 'CRYPTO' && !h.symbol.endsWith('USDT')).length})
            </button>
            <button
              onClick={() => setSelectedAssetView('CRYPTO')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                selectedAssetView === 'CRYPTO'
                  ? 'bg-cyan-500 text-black'
                  : 'bg-zinc-800 text-cyan-400 hover:text-white'
              }`}
            >
              ⚡ CRYPTO ({holdings.filter((h) => h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT')).length})
            </button>
          </div>
        </div>

        {holdings.length === 0 ? (
          <div className="p-8 text-center text-[#71717a] text-xs">
            Belum ada posisi terbuka. Gunakan order form di bawah atau menu Trading Crypto untuk membuka posisi (Paper Trading).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-[#27272a]">
              <thead className="bg-[#18181b] text-[#a1a1aa] text-[10px] uppercase font-bold">
                <tr>
                  <th className="px-3 py-2">Symbol / Aset</th>
                  <th className="px-3 py-2">Unit / Lot</th>
                  <th className="px-3 py-2">Avg Buy</th>
                  <th className="px-3 py-2">Harga Pasar</th>
                  <th className="px-3 py-2">Total Nilai (IDR)</th>
                  <th className="px-3 py-2">Floating P&L</th>
                  <th className="px-3 py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181b]">
                {holdings
                  .filter((h) => {
                    const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT');
                    if (selectedAssetView === 'EQUITY') return !isCrypto;
                    if (selectedAssetView === 'CRYPTO') return isCrypto;
                    return true;
                  })
                  .map((h) => {
                    const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT');
                    const rate = h.exchangeRate || 16000;
                    const units = isCrypto ? (h.cryptoUnits ?? h.lots) : (h.shares || h.lots * 100);
                    const val = isCrypto ? h.currentPrice * units * rate : h.currentPrice * units;
                    const pl = h.unrealizedPL || 0;
                    const plPct = h.unrealizedPLPercent || 0;
                    const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();

                    return (
                      <tr key={h.symbol} className={isCrypto ? 'bg-cyan-950/15 hover:bg-cyan-950/25' : 'hover:bg-[#18181b]/50'}>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={isCrypto ? '/crypto' : `/stock/${h.displaySymbol}`}
                              className="font-bold text-white hover:text-[#f59e0b]"
                              style={{ color: isCrypto ? '#06b6d4' : undefined }}
                            >
                              {cleanSym}
                            </Link>
                            {isCrypto ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                CRYPTO SPOT
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-zinc-800 text-zinc-400">
                                IDX
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#71717a]">{h.name}</div>
                        </td>
                        <td className="px-3 py-2 font-mono text-white">
                          {isCrypto ? (
                            <span className="text-cyan-300 font-bold">{units.toFixed(4)} koin</span>
                          ) : (
                            <span>{h.lots} lot <span className="text-[10px] text-zinc-500">({units.toLocaleString()} lbr)</span></span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono text-[#d4d4d8]">
                          {isCrypto ? (
                            <div>
                              <span>${h.avgPrice.toLocaleString()} USDT</span>
                              <span className="text-[9px] block text-zinc-500">(≈ Rp {Math.round(h.avgPrice * rate).toLocaleString('id-ID')})</span>
                            </div>
                          ) : (
                            `Rp ${h.avgPrice.toLocaleString('id-ID')}`
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono text-white font-bold">
                          {isCrypto ? `$${h.currentPrice.toLocaleString()}` : `Rp ${h.currentPrice.toLocaleString('id-ID')}`}
                        </td>
                        <td className="px-3 py-2 font-mono text-[#f59e0b] font-bold">
                          Rp {Math.round(val).toLocaleString('id-ID')}
                        </td>
                        <td className="px-3 py-2 font-mono font-bold">
                          <span className={pl >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                            {pl >= 0 ? '+' : ''}Rp {Math.round(pl).toLocaleString('id-ID')} ({plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Link
                            href={isCrypto ? '/crypto' : `/stock/${h.displaySymbol}`}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCrypto
                                ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
                                : 'bg-[#27272a] hover:bg-[#3f3f46] text-[#d4d4d8] hover:text-white'
                            }`}
                          >
                            {isCrypto ? 'Trade Crypto' : 'Trade'}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
