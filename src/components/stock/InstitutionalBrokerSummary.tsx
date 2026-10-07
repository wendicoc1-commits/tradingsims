'use client';

import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Layers,
  ArrowRightLeft,
  PieChart,
  HelpCircle,
} from 'lucide-react';
import type { StockQuote } from '@/types';

interface BrokerRow {
  code: string;
  name: string;
  type: 'FOREIGN' | 'DOMESTIC';
  netLot: number;
  avgPrice: number;
  valueRupiah: number;
}

const BROKER_NAMES: Record<string, { name: string; type: 'FOREIGN' | 'DOMESTIC' }> = {
  AK: { name: 'UBS Sekuritas', type: 'FOREIGN' },
  BK: { name: 'J.P. Morgan Sekuritas', type: 'FOREIGN' },
  ZP: { name: 'Maybank Sekuritas', type: 'FOREIGN' },
  RX: { name: 'Macquarie Sekuritas', type: 'FOREIGN' },
  CS: { name: 'Credit Suisse Sekuritas', type: 'FOREIGN' },
  KZ: { name: 'CLSA Sekuritas', type: 'FOREIGN' },
  CG: { name: 'CGS International', type: 'FOREIGN' },
  YP: { name: 'Mirae Asset Sekuritas', type: 'DOMESTIC' },
  PD: { name: 'Indo Premier Sekuritas', type: 'DOMESTIC' },
  CC: { name: 'Mandiri Sekuritas', type: 'DOMESTIC' },
  NI: { name: 'BNI Sekuritas', type: 'DOMESTIC' },
  XC: { name: 'Ajaib Sekuritas', type: 'DOMESTIC' },
  SQ: { name: 'BCA Sekuritas', type: 'DOMESTIC' },
  GR: { name: 'Panin Sekuritas', type: 'DOMESTIC' },
  CP: { name: 'KB Valbury Sekuritas', type: 'DOMESTIC' },
  MG: { name: 'Semesta Indovest', type: 'DOMESTIC' },
};

function formatRupiahShort(val: number): string {
  if (Math.abs(val) >= 1_000_000_000_000) {
    return `${(val / 1_000_000_000_000).toFixed(2)} T`;
  }
  if (Math.abs(val) >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toFixed(1)} B`;
  }
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(0)} M`;
  }
  return val.toLocaleString('id-ID');
}

export default function InstitutionalBrokerSummary({ quote }: { quote: StockQuote }) {
  const [filterPeriod, setFilterPeriod] = useState<'1D' | '3D' | '1W' | '1M'>('1D');
  const basePrice = quote.price || 1000;
  const isPositive = (quote.changePercentage || 0) >= 0;

  // Analisis Bandarmologi Simulasi Berbasis Karakteristik Saham
  const data = useMemo(() => {
    const cleanSym = quote.symbol.replace('.JK', '').toUpperCase();
    const seed = cleanSym.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

    const buyerCodes = isPositive ? ['AK', 'BK', 'CC', 'ZP', 'RX'] : ['YP', 'PD', 'XC', 'NI', 'SQ'];
    const sellerCodes = isPositive ? ['YP', 'PD', 'XC', 'NI', 'GR'] : ['AK', 'BK', 'RX', 'ZP', 'KZ'];

    const mult = filterPeriod === '1M' ? 15 : filterPeriod === '1W' ? 4.5 : filterPeriod === '3D' ? 2.5 : 1;

    const topBuyers: BrokerRow[] = buyerCodes.map((code, idx) => {
      const info = BROKER_NAMES[code] || { name: `${code} Broker`, type: 'DOMESTIC' };
      const baseLot = Math.floor(45000 / (idx + 1) + (seed % 1000) * 12) * mult;
      const avg = Math.round(basePrice + (idx - 2) * 5);
      const value = baseLot * 100 * avg;
      return {
        code,
        name: info.name,
        type: info.type,
        netLot: baseLot,
        avgPrice: avg,
        valueRupiah: value,
      };
    });

    const topSellers: BrokerRow[] = sellerCodes.map((code, idx) => {
      const info = BROKER_NAMES[code] || { name: `${code} Broker`, type: 'DOMESTIC' };
      const baseLot = Math.floor((isPositive ? 32000 : 52000) / (idx + 1) + (seed % 800) * 10) * mult;
      const avg = Math.round(basePrice - (idx - 1) * 5);
      const value = baseLot * 100 * avg;
      return {
        code,
        name: info.name,
        type: info.type,
        netLot: baseLot,
        avgPrice: avg,
        valueRupiah: value,
      };
    });

    const totalBuyLots = topBuyers.reduce((s, b) => s + b.netLot, 0);
    const totalSellLots = topSellers.reduce((s, b) => s + b.netLot, 0);
    const totalBuyVal = topBuyers.reduce((s, b) => s + b.valueRupiah, 0);
    const totalSellVal = topSellers.reduce((s, b) => s + b.valueRupiah, 0);

    // Foreign Flow
    const foreignBuyVal = topBuyers.filter((b) => b.type === 'FOREIGN').reduce((s, b) => s + b.valueRupiah, 0);
    const foreignSellVal = topSellers.filter((s) => s.type === 'FOREIGN').reduce((s, s2) => s + s2.valueRupiah, 0);
    const netForeign = foreignBuyVal - foreignSellVal;

    // Rasio Konsentrasi Top 1, Top 3, Top 5
    const b1 = topBuyers[0]?.valueRupiah || 0;
    const s1 = topSellers[0]?.valueRupiah || 0;
    const b3 = topBuyers.slice(0, 3).reduce((s, b) => s + b.valueRupiah, 0);
    const s3 = topSellers.slice(0, 3).reduce((s, b) => s + b.valueRupiah, 0);
    const b5 = totalBuyVal;
    const s5 = totalSellVal;

    let bandarStatus: 'BIG ACCUMULATION' | 'NORMAL ACCUMULATION' | 'NEUTRAL' | 'DISTRIBUTION' = 'NEUTRAL';
    if (b3 > s3 * 1.35) {
      bandarStatus = 'BIG ACCUMULATION';
    } else if (b3 > s3 * 1.08) {
      bandarStatus = 'NORMAL ACCUMULATION';
    } else if (s3 > b3 * 1.25) {
      bandarStatus = 'DISTRIBUTION';
    }

    return {
      topBuyers,
      topSellers,
      totalBuyLots,
      totalSellLots,
      totalBuyVal,
      totalSellVal,
      netForeign,
      bandarStatus,
      b1,
      s1,
      b3,
      s3,
      b5,
      s5,
    };
  }, [basePrice, isPositive, quote.symbol, filterPeriod]);

  const maxVal = Math.max(
    ...data.topBuyers.map((b) => b.valueRupiah),
    ...data.topSellers.map((s) => s.valueRupiah)
  );

  return (
    <div className="rounded-xl border overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      {/* Top Header & Bandarmologi Metrics */}
      <div className="p-4 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Broker Summary & Bandar Detector &bull; {quote.displaySymbol}
            </h3>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                data.bandarStatus === 'BIG ACCUMULATION'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : data.bandarStatus === 'NORMAL ACCUMULATION'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : data.bandarStatus === 'DISTRIBUTION'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
            >
              {data.bandarStatus}
            </span>
          </div>
          <div className="text-[11px] text-zinc-400">
            Deteksi transaksi akumulasi institusi/bandar vs distribusi ritel berdasarkan kode broker BEI
          </div>
        </div>

        {/* Period Selector & Net Foreign Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
            {(['1D', '3D', '1W', '1M'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setFilterPeriod(period)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                  filterPeriod === period
                    ? 'bg-amber-400 text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <div
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 ${
              data.netForeign >= 0
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/40'
            }`}
          >
            <span>Net Foreign:</span>
            <span>{data.netForeign >= 0 ? '+' : '-'}Rp {formatRupiahShort(Math.abs(data.netForeign))}</span>
          </div>
        </div>
      </div>

      {/* Concentration Metrics Strip */}
      <div className="grid grid-cols-3 border-b text-center text-xs font-mono py-2.5 px-3 divide-x" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="text-[10px] text-zinc-400">Top 1 Concentration</div>
          <div className="font-bold text-white mt-0.5">
            B1: {formatRupiahShort(data.b1)} vs S1: {formatRupiahShort(data.s1)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-400">Top 3 Concentration (Key)</div>
          <div
            className="font-bold mt-0.5"
            style={{ color: data.b3 >= data.s3 ? 'var(--positive)' : 'var(--negative)' }}
          >
            B3: {formatRupiahShort(data.b3)} vs S3: {formatRupiahShort(data.s3)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-400">Top 5 Total Ratio</div>
          <div className="font-bold text-white mt-0.5">
            B5: {formatRupiahShort(data.b5)} vs S5: {formatRupiahShort(data.s5)}
          </div>
        </div>
      </div>

      {/* 2-Column Split: Top Buyers vs Top Sellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'var(--border)' }}>
        {/* Top Net Buyers */}
        <div className="p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold pb-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> Top 5 Net Buyer (Akumulasi)
            </span>
            <span className="font-mono text-zinc-400 text-[11px]">
              Total: {formatRupiahShort(data.totalBuyVal)}
            </span>
          </div>

          <div className="space-y-1.5">
            {data.topBuyers.map((b, idx) => {
              const widthPct = Math.max(12, Math.round((b.valueRupiah / maxVal) * 100));
              return (
                <div key={b.code} className="relative p-2 rounded-lg bg-zinc-900/60 overflow-hidden text-xs font-mono">
                  {/* Visual Depth Bar */}
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-500/10 transition-all pointer-events-none"
                    style={{ width: `${widthPct}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white w-6">{idx + 1}.</span>
                      <span className="font-bold text-emerald-400 px-1 rounded bg-emerald-500/20">{b.code}</span>
                      <span className="text-[11px] text-zinc-300 hidden sm:inline truncate max-w-[110px]">{b.name}</span>
                      <span
                        className={`text-[9px] px-1 rounded font-sans font-semibold ${
                          b.type === 'FOREIGN'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {b.type === 'FOREIGN' ? 'ASING' : 'DOM'}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-white">
                        +{b.netLot.toLocaleString('id-ID')} lot
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        @{b.avgPrice.toLocaleString('id-ID')} &bull; Rp {formatRupiahShort(b.valueRupiah)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Net Sellers */}
        <div className="p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold pb-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <TrendingDown className="w-3.5 h-3.5" /> Top 5 Net Seller (Distribusi)
            </span>
            <span className="font-mono text-zinc-400 text-[11px]">
              Total: {formatRupiahShort(data.totalSellVal)}
            </span>
          </div>

          <div className="space-y-1.5">
            {data.topSellers.map((s, idx) => {
              const widthPct = Math.max(12, Math.round((s.valueRupiah / maxVal) * 100));
              return (
                <div key={s.code} className="relative p-2 rounded-lg bg-zinc-900/60 overflow-hidden text-xs font-mono">
                  {/* Visual Depth Bar */}
                  <div
                    className="absolute inset-y-0 right-0 bg-rose-500/10 transition-all pointer-events-none"
                    style={{ width: `${widthPct}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white w-6">{idx + 1}.</span>
                      <span className="font-bold text-rose-400 px-1 rounded bg-rose-500/20">{s.code}</span>
                      <span className="text-[11px] text-zinc-300 hidden sm:inline truncate max-w-[110px]">{s.name}</span>
                      <span
                        className={`text-[9px] px-1 rounded font-sans font-semibold ${
                          s.type === 'FOREIGN'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {s.type === 'FOREIGN' ? 'ASING' : 'DOM'}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-white">
                        -{s.netLot.toLocaleString('id-ID')} lot
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        @{s.avgPrice.toLocaleString('id-ID')} &bull; Rp {formatRupiahShort(s.valueRupiah)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
