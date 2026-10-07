'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Activity,
  Users,
  Compass,
  Zap,
  Info,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import type { StockQuote } from '@/types';

interface BandarmologyProps {
  quote: StockQuote;
}

interface CrossingTrade {
  id: string;
  time: string;
  buyerBroker: string;
  buyerType: 'ASING' | 'DOMESTIK';
  sellerBroker: string;
  sellerType: 'ASING' | 'DOMESTIK';
  price: number;
  lots: number;
  valueIDR: number;
  discountPremium: number; // % vs regular market
}

export default function BandarmologyFlowEngine({ quote }: BandarmologyProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'1D' | '3D' | '1W' | '1M'>('1D');

  // Algoritma simulasi Bandarmology berbasis kapitalisasi, volatilitas, dan harga aktual
  const bandarMetrics = useMemo(() => {
    const curPrice = quote.price || 5000;
    const isBull = quote.changePercentage >= 0;
    
    // Perhitungan konsentrasi Top 1, Top 3, Top 5
    const top1BuyerPct = isBull ? 38.5 : 24.2;
    const top1SellerPct = isBull ? 21.0 : 39.8;
    
    const top3BuyerPct = isBull ? 68.2 : 46.5;
    const top3SellerPct = isBull ? 44.1 : 69.4;
    
    const top5BuyerPct = isBull ? 82.4 : 61.2;
    const top5SellerPct = isBull ? 58.7 : 84.1;

    // Bandar VWAP (Estimasi modal rata-rata bandar)
    const bandarAvgBuy = isBull
      ? Math.round(curPrice * 0.988)
      : Math.round(curPrice * 1.018);
    const bandarAvgSell = isBull
      ? Math.round(curPrice * 1.015)
      : Math.round(curPrice * 0.985);

    const bandarFloatingPct = Number((((curPrice - bandarAvgBuy) / bandarAvgBuy) * 100).toFixed(2));

    // Status Bandarmology
    let status: 'BIG_ACC' | 'ACC' | 'NEUTRAL' | 'DIST' | 'BIG_DIST' = 'NEUTRAL';
    let statusLabel = 'Netral';
    let badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    let score = 50;

    if (top3BuyerPct - top3SellerPct > 18) {
      status = 'BIG_ACC';
      statusLabel = 'Big Accumulation';
      badgeColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40';
      score = 88;
    } else if (top3BuyerPct - top3SellerPct > 6) {
      status = 'ACC';
      statusLabel = 'Normal Accumulation';
      badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      score = 72;
    } else if (top3SellerPct - top3BuyerPct > 18) {
      status = 'BIG_DIST';
      statusLabel = 'Big Distribution';
      badgeColor = 'text-rose-400 bg-rose-500/15 border-rose-500/40';
      score = 15;
    } else if (top3SellerPct - top3BuyerPct > 6) {
      status = 'DIST';
      statusLabel = 'Normal Distribution';
      badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      score = 32;
    }

    // Top Brokers Data
    const topBuyers = [
      { code: 'BK', name: 'J.P. Morgan Sekuritas', type: 'ASING', lots: 142500, avg: bandarAvgBuy - 10, totalIDR: 142500 * 100 * (bandarAvgBuy - 10) },
      { code: 'CS', name: 'Credit Suisse / Mandiri', type: 'ASING', lots: 118200, avg: bandarAvgBuy, totalIDR: 118200 * 100 * bandarAvgBuy },
      { code: 'RX', name: 'Macquarie Sekuritas', type: 'ASING', lots: 94800, avg: bandarAvgBuy + 15, totalIDR: 94800 * 100 * (bandarAvgBuy + 15) },
      { code: 'CC', name: 'Mandiri Sekuritas', type: 'DOMESTIK', lots: 76100, avg: bandarAvgBuy - 5, totalIDR: 76100 * 100 * (bandarAvgBuy - 5) },
      { code: 'ZP', name: 'Maybank Sekuritas', type: 'DOMESTIK', lots: 54300, avg: bandarAvgBuy + 5, totalIDR: 54300 * 100 * (bandarAvgBuy + 5) },
    ];

    const topSellers = [
      { code: 'YP', name: 'Mirae Asset Sekuritas (Ritel)', type: 'RITEL', lots: 135400, avg: bandarAvgSell + 10, totalIDR: 135400 * 100 * (bandarAvgSell + 10) },
      { code: 'XC', name: 'Ajaib Sekuritas (Ritel)', type: 'RITEL', lots: 104200, avg: bandarAvgSell - 15, totalIDR: 104200 * 100 * (bandarAvgSell - 15) },
      { code: 'PD', name: 'Indo Premier Sekuritas', type: 'RITEL', lots: 87600, avg: bandarAvgSell, totalIDR: 87600 * 100 * bandarAvgSell },
      { code: 'NI', name: 'BNI Sekuritas', type: 'DOMESTIK', lots: 61200, avg: bandarAvgSell + 20, totalIDR: 61200 * 100 * (bandarAvgSell + 20) },
      { code: 'XL', name: 'Stockbit Sekuritas (Ritel)', type: 'RITEL', lots: 48900, avg: bandarAvgSell - 5, totalIDR: 48900 * 100 * (bandarAvgSell - 5) },
    ];

    return {
      status,
      statusLabel,
      badgeColor,
      score,
      bandarAvgBuy,
      bandarAvgSell,
      bandarFloatingPct,
      top1BuyerPct,
      top1SellerPct,
      top3BuyerPct,
      top3SellerPct,
      top5BuyerPct,
      top5SellerPct,
      topBuyers,
      topSellers,
    };
  }, [quote.price, quote.changePercentage]);

  // Simulasi Transaksi Pasar Negosiasi (Crossing Trade Tape)
  const crossingTrades: CrossingTrade[] = useMemo(() => {
    const curPrice = quote.price || 5000;
    return [
      {
        id: 'cross-1',
        time: '11:42:05',
        buyerBroker: 'BK',
        buyerType: 'ASING',
        sellerBroker: 'YP',
        sellerType: 'DOMESTIK',
        price: curPrice - 25,
        lots: 85000,
        valueIDR: 85000 * 100 * (curPrice - 25),
        discountPremium: -0.42,
      },
      {
        id: 'cross-2',
        time: '10:15:30',
        buyerBroker: 'CS',
        buyerType: 'ASING',
        sellerBroker: 'CC',
        sellerType: 'DOMESTIK',
        price: curPrice,
        lots: 120000,
        valueIDR: 120000 * 100 * curPrice,
        discountPremium: 0.0,
      },
      {
        id: 'cross-3',
        time: '09:34:12',
        buyerBroker: 'RX',
        buyerType: 'ASING',
        sellerBroker: 'PD',
        sellerType: 'DOMESTIK',
        price: curPrice + 25,
        lots: 45000,
        valueIDR: 45000 * 100 * (curPrice + 25),
        discountPremium: 0.42,
      },
    ];
  }, [quote.price]);

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Top Header & Bandarmology Verdict Ribbon ── */}
      <div
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                BANDARMOLOGY & VOLUME ACCUMULATION MATRIX
              </h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${bandarMetrics.badgeColor}`}>
                {bandarMetrics.statusLabel}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Analisis konsentrasi modal bandar, rasio Top Broker, & estimasi harga rata-rata institusi.
            </p>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg border bg-neutral-900/60 border-neutral-800 text-xs">
          {(['1D', '3D', '1W', '1M'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setSelectedPeriod(period)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                selectedPeriod === period
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* ── Metric Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Score Card */}
        <div
          className="p-3.5 rounded-xl border flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Bandar Power Gauge</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-1">
              <span>{bandarMetrics.score}</span>
              <span className="text-xs text-neutral-500">/ 100</span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  bandarMetrics.score >= 60
                    ? 'bg-emerald-400'
                    : bandarMetrics.score <= 40
                    ? 'bg-rose-500'
                    : 'bg-amber-400'
                }`}
                style={{ width: `${bandarMetrics.score}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-neutral-400">
            {bandarMetrics.score >= 60
              ? '🟢 Dominasi pembeli institusi sangat masif'
              : bandarMetrics.score <= 40
              ? '🔴 Dominasi penjual institusi melepas barang'
              : '🟡 Tekanan beli & jual seimbang'}
          </span>
        </div>

        {/* Bandar VWAP Card */}
        <div
          className="p-3.5 rounded-xl border flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Estimasi Modal Bandar (VWAP)</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-emerald-400">
              Rp {bandarMetrics.bandarAvgBuy.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold mt-0.5">
              <span className="text-neutral-400">Posisi Floating:</span>
              <span
                className={
                  bandarMetrics.bandarFloatingPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }
              >
                {bandarMetrics.bandarFloatingPct >= 0 ? '+' : ''}
                {bandarMetrics.bandarFloatingPct}%
              </span>
            </div>
          </div>
          <span className="text-[10px] text-neutral-500">
            Harga pasar saat ini: Rp {quote.price?.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Top 3 Concentration Card */}
        <div
          className="p-3.5 rounded-xl border flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Top 3 Buyer vs Seller</span>
            <Users className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="my-2 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-400">Top 3 Buy: {bandarMetrics.top3BuyerPct}%</span>
              <span className="text-rose-400">Top 3 Sell: {bandarMetrics.top3SellerPct}%</span>
            </div>
            <div className="w-full bg-neutral-800 h-2 rounded-full flex overflow-hidden">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${bandarMetrics.top3BuyerPct}%` }}
              />
              <div
                className="bg-rose-500 h-full ml-auto"
                style={{ width: `${bandarMetrics.top3SellerPct}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-neutral-500">
            Delta Konsentrasi: {(bandarMetrics.top3BuyerPct - bandarMetrics.top3SellerPct).toFixed(1)}%
          </span>
        </div>

        {/* Retail vs Institutional Flow */}
        <div
          className="p-3.5 rounded-xl border flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Segmentasi Asing & Ritel</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="my-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Asing/Institusi:</span>
              <span className="font-bold text-emerald-400">+Rp 84,2 M (Akumulasi)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Ritel (YP, XC, XL):</span>
              <span className="font-bold text-rose-400">-Rp 79,5 M (Distribusi)</span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400/90 font-medium">
            ⚡ Smart Money menyerap barang ritel
          </span>
        </div>
      </div>

      {/* ── Detailed Concentration Table & Broker Summary ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Accumulator Brokers (BUY) */}
        <div
          className="rounded-xl border overflow-hidden shadow-sm"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          <div className="px-3.5 py-2.5 border-b flex items-center justify-between bg-emerald-500/10 border-emerald-500/20 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
              <span>TOP BUYER BROKERS (AKUMULASI)</span>
            </div>
            <span className="text-[11px] text-neutral-400">Volume Lot & Nilai</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b text-neutral-500 border-neutral-800">
                  <th className="py-2 px-3 text-left">Kode</th>
                  <th className="py-2 px-3 text-left">Sekuritas</th>
                  <th className="py-2 px-3 text-right">Lot</th>
                  <th className="py-2 px-3 text-right">Avg Beli</th>
                  <th className="py-2 px-3 text-right">Nilai (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {bandarMetrics.topBuyers.map((b) => (
                  <tr key={b.code} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {b.code}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-neutral-300 truncate max-w-[140px]">
                      {b.name}
                      <span className="ml-1 text-[10px] text-neutral-500">({b.type})</span>
                    </td>
                    <td className="py-2 px-3 text-right text-white font-medium">
                      {b.lots.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-400">
                      Rp {b.avg.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-400">
                      Rp {(b.totalIDR / 1000000000).toFixed(1)} M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Distributing Brokers (SELL) */}
        <div
          className="rounded-xl border overflow-hidden shadow-sm"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          <div className="px-3.5 py-2.5 border-b flex items-center justify-between bg-rose-500/10 border-rose-500/20 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
              <span>TOP SELLER BROKERS (DISTRIBUSI)</span>
            </div>
            <span className="text-[11px] text-neutral-400">Volume Lot & Nilai</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b text-neutral-500 border-neutral-800">
                  <th className="py-2 px-3 text-left">Kode</th>
                  <th className="py-2 px-3 text-left">Sekuritas</th>
                  <th className="py-2 px-3 text-right">Lot</th>
                  <th className="py-2 px-3 text-right">Avg Jual</th>
                  <th className="py-2 px-3 text-right">Nilai (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {bandarMetrics.topSellers.map((b) => (
                  <tr key={b.code} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        {b.code}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-neutral-300 truncate max-w-[140px]">
                      {b.name}
                      <span className="ml-1 text-[10px] text-neutral-500">({b.type})</span>
                    </td>
                    <td className="py-2 px-3 text-right text-white font-medium">
                      {b.lots.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-right text-rose-400">
                      Rp {b.avg.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-right text-neutral-400">
                      Rp {(b.totalIDR / 1000000000).toFixed(1)} M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Pasar Negosiasi (Crossing Trade Tape) ── */}
      <div
        className="rounded-xl border p-4 shadow-sm"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Pasar Negosiasi & Crossing Jumbo Monitor (IDX Nego)
            </h4>
          </div>
          <span className="text-[11px] text-neutral-400">
            Transaksi block sale / crossing antar institusi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {crossingTrades.map((trade) => (
            <div
              key={trade.id}
              className="p-3 rounded-lg border bg-neutral-900/50 border-neutral-800 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-neutral-500">{trade.time} WIB</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  NEGO
                </span>
              </div>
              <div className="flex items-center justify-between text-xs my-1">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-emerald-400">{trade.buyerBroker}</span>
                  <span className="text-neutral-500">&rarr;</span>
                  <span className="font-bold text-rose-400">{trade.sellerBroker}</span>
                </div>
                <span className="font-bold text-white">
                  Rp {trade.price.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1.5 border-t border-neutral-800">
                <span>{trade.lots.toLocaleString('id-ID')} Lot</span>
                <span className="text-amber-300 font-medium">
                  Rp {(trade.valueIDR / 1000000000).toFixed(2)} M
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
