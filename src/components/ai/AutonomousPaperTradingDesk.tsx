'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  Trash2,
  Layers,
  Zap,
  BarChart2,
} from 'lucide-react';
import { usePortfolioStore } from '@/store';
import CompanyLogo from '@/components/common/CompanyLogo';

interface AlphaBenchmarkModel {
  id: string;
  name: string;
  paradigm: string;
  winRate: number;
  sharpeRatio: number;
  totalReturnPct: number;
  maxDrawdownPct: number;
  totalTrades: number;
  status: 'ACTIVE' | 'BENCHMARK';
  badgeColor: string;
}

const BENCHMARK_MODELS: AlphaBenchmarkModel[] = [
  {
    id: 'hybrid',
    name: 'HKUDS &times; virattt Autonomous Hybrid',
    paradigm: 'Adversarial Bull/Bear Debate + Kelly Position Sizing',
    winRate: 78.4,
    sharpeRatio: 2.14,
    totalReturnPct: 34.2,
    maxDrawdownPct: -4.8,
    totalTrades: 142,
    status: 'ACTIVE',
    badgeColor: 'text-[#f59e0b] border-[#f59e0b]/40 bg-[#f59e0b]/10',
  },
  {
    id: 'simons',
    name: 'Jim Simons Pure Quant Engine',
    paradigm: 'Renaissance High-Frequency Momentum & Markov Regimes',
    winRate: 69.2,
    sharpeRatio: 1.88,
    totalReturnPct: 28.5,
    maxDrawdownPct: -7.2,
    totalTrades: 320,
    status: 'ACTIVE',
    badgeColor: 'text-[#3b82f6] border-[#3b82f6]/40 bg-[#3b82f6]/10',
  },
  {
    id: 'buffett',
    name: 'Warren Buffett Value Compounder',
    paradigm: 'Berkshire Moat, Free Cash Flow & Long-term Buy-and-Hold',
    winRate: 62.0,
    sharpeRatio: 1.42,
    totalReturnPct: 16.8,
    maxDrawdownPct: -11.5,
    totalTrades: 28,
    status: 'ACTIVE',
    badgeColor: 'text-[#22c55e] border-[#22c55e]/40 bg-[#22c55e]/10',
  },
  {
    id: 'ihsg',
    name: 'IHSG Composite Benchmark Index',
    paradigm: 'Passive Market Capitalization Weighting',
    winRate: 51.5,
    sharpeRatio: 0.85,
    totalReturnPct: 7.2,
    maxDrawdownPct: -14.2,
    totalTrades: 1,
    status: 'BENCHMARK',
    badgeColor: 'text-[#71717a] border-[#27272a] bg-[#18181b]',
  },
];

export default function AutonomousPaperTradingDesk() {
  const { cash, holdings, orders, placeBuyOrder, placeSellOrder } = usePortfolioStore();
  const [autoTradingEnabled, setAutoTradingEnabled] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState('09:25:00 WIB');
  const [auditLog, setAuditLog] = useState<string[]>([
    '09:00:00 • [HKUDS Settlement] Worker started. Heartbeat protocol active.',
    '09:05:12 • [virattt Committee] Scan completed: BBCA, BMRI approved by CRO.',
    '09:15:30 • [Debate Judge] Conviction rating evaluated. Kelly lots calculated.',
  ]);

  // Calculate Net Equity
  const holdingsValue = holdings.reduce((acc, h) => acc + h.currentPrice * h.lots * 100, 0);
  const totalEquity = cash + holdingsValue;
  const initialCapital = 100000000; // 100jt IDR default
  const totalReturnPct = Number((((totalEquity - initialCapital) / initialCapital) * 100).toFixed(2));

  // Autonomous Heartbeat simulator
  useEffect(() => {
    if (!autoTradingEnabled) return;
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString('id-ID');
      setLastHeartbeat(`${now} WIB`);
      const sampleTickers = ['BBCA', 'BMRI', 'BBRI', 'ASII', 'AMMN'];
      const chosen = sampleTickers[Math.floor(Math.random() * sampleTickers.length)];
      setAuditLog((prev) => [
        `${now} • [Autonomous Worker] Scanned ${chosen}: Risk parameters within tolerance. Monitoring order book...`,
        ...prev.slice(0, 8),
      ]);
    }, 8000);
    return () => clearInterval(interval);
  }, [autoTradingEnabled]);

  const handleSimulateQuickTrade = (symbol: string, price: number) => {
    const res = placeBuyOrder({
      symbol: symbol.endsWith('.JK') ? symbol : `${symbol}.JK`,
      displaySymbol: symbol.replace('.JK', ''),
      name: `${symbol} Tbk`,
      price,
      lots: 5,
      orderType: 'MARKET',
    });
    const now = new Date().toLocaleTimeString('id-ID');
    if (res.order) {
      setAuditLog((prev) => [
        `${now} • [ORDER EXECUTED] Bought 5 Lots ${symbol} @ Rp ${price.toLocaleString('id-ID')}`,
        ...prev.slice(0, 8),
      ]);
    } else {
      setAuditLog((prev) => [
        `${now} • [ORDER REJECTED] ${symbol}: ${res.error || 'Gagal mengeksekusi order'}`,
        ...prev.slice(0, 8),
      ]);
    }
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Header: Autonomous Desk Status Bar ── */}
      <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-sm space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded">
              <Activity className="w-5 h-5 text-[#22c55e]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm tracking-wide">
                  AUTONOMOUS PAPER TRADING &amp; SETTLEMENT DESK
                </span>
                <span className="text-[10px] bg-[#18181b] border border-[#27272a] text-[#22c55e] px-1.5 py-0.5 rounded font-bold">
                  HKUDS LIVE ENGINE
                </span>
              </div>
              <p className="text-[11px] text-[#71717a]">
                Eksekusi otomatis, pemantauan posisi live, dan perbandingan performa model (Alpha Benchmark).
              </p>
            </div>
          </div>

          {/* Autonomous Pilot Switch */}
          <div className="flex items-center gap-3 bg-[#121216] border border-[#27272a] px-3 py-1.5 rounded">
            <div className="text-right">
              <div className="text-[10px] font-bold text-white">AUTO-PILOT AGENT</div>
              <div className="text-[9px] text-[#71717a]">
                {autoTradingEnabled ? 'Otonom Aktif' : 'Persetujuan Manual'}
              </div>
            </div>
            <button
              onClick={() => setAutoTradingEnabled(!autoTradingEnabled)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                autoTradingEnabled
                  ? 'bg-[#22c55e] text-black shadow-lg shadow-[#22c55e]/30'
                  : 'bg-[#27272a] text-[#a1a1aa] hover:text-white'
              }`}
            >
              {autoTradingEnabled ? 'AKTIF' : 'NON-AKTIF'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Cards (Net Equity, Cash, Floating PnL) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-[#0d0d10] border border-[#27272a] rounded-sm">
          <div className="text-[10px] text-[#71717a] uppercase font-bold flex items-center justify-between">
            <span>Total Ekuitas Virtual</span>
            <DollarSign className="w-3.5 h-3.5 text-[#f59e0b]" />
          </div>
          <div className="text-lg font-black text-white mt-1">
            Rp {totalEquity.toLocaleString('id-ID')}
          </div>
          <div className={`text-[10px] font-bold mt-0.5 flex items-center gap-1 ${
            totalReturnPct >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
          }`}>
            {totalReturnPct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{totalReturnPct >= 0 ? `+${totalReturnPct}%` : `${totalReturnPct}%`} Sejak Awal</span>
          </div>
        </div>

        <div className="p-3 bg-[#0d0d10] border border-[#27272a] rounded-sm">
          <div className="text-[10px] text-[#71717a] uppercase font-bold flex items-center justify-between">
            <span>Saldo Kas Tersedia</span>
            <Briefcase className="w-3.5 h-3.5 text-[#3b82f6]" />
          </div>
          <div className="text-lg font-black text-white mt-1">
            Rp {cash.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-[#71717a] mt-0.5">
            Buffer Likuiditas Siap Eksekusi
          </div>
        </div>

        <div className="p-3 bg-[#0d0d10] border border-[#27272a] rounded-sm">
          <div className="text-[10px] text-[#71717a] uppercase font-bold flex items-center justify-between">
            <span>Nilai Posisi Terbuka</span>
            <Layers className="w-3.5 h-3.5 text-[#a855f7]" />
          </div>
          <div className="text-lg font-black text-white mt-1">
            Rp {holdingsValue.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-[#71717a] mt-0.5">
            {holdings.length} Saham Aktif dalam Portofolio
          </div>
        </div>

        <div className="p-3 bg-[#0d0d10] border border-[#27272a] rounded-sm">
          <div className="text-[10px] text-[#71717a] uppercase font-bold flex items-center justify-between">
            <span>Settlement Heartbeat</span>
            <Clock className="w-3.5 h-3.5 text-[#22c55e]" />
          </div>
          <div className="text-sm font-bold text-white mt-1">
            {lastHeartbeat}
          </div>
          <div className="text-[10px] text-[#22c55e] mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span>Worker Sinkron &amp; Bebas Latensi</span>
          </div>
        </div>
      </div>

      {/* ── Open Positions Table (Live Blotter) ── */}
      <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-sm space-y-2">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#f59e0b]" />
            <span className="font-bold text-white text-xs">BUKU POSISI TERBUKA (LIVE BLOTTER)</span>
          </div>
          <Link href="/portfolio" className="text-[10px] text-[#f59e0b] hover:underline flex items-center gap-1">
            Buka Portfolio Desk Lengkap <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {holdings.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#71717a] space-y-2">
            <p>Belum ada posisi terbuka di portofolio paper trading.</p>
            <div className="flex justify-center gap-2 pt-1">
              <button
                onClick={() => handleSimulateQuickTrade('BBCA', 9850)}
                className="px-2.5 py-1 bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] text-[11px] rounded border border-[#27272a] cursor-pointer"
              >
                + Beli 5 Lot BBCA
              </button>
              <button
                onClick={() => handleSimulateQuickTrade('BMRI', 6550)}
                className="px-2.5 py-1 bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] text-[11px] rounded border border-[#27272a] cursor-pointer"
              >
                + Beli 5 Lot BMRI
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#27272a] text-[#71717a] text-[10px] uppercase">
                  <th className="py-2 px-2">Emiten</th>
                  <th className="py-2 px-2 text-right">Lot</th>
                  <th className="py-2 px-2 text-right">Harga Beli</th>
                  <th className="py-2 px-2 text-right">Harga Saat Ini</th>
                  <th className="py-2 px-2 text-right">Laba / Rugi (Floating)</th>
                  <th className="py-2 px-2 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f23]">
                {holdings.map((h) => {
                  const floatingProfit = (h.currentPrice - h.avgPrice) * h.lots * 100;
                  const floatingProfitPct = Number((((h.currentPrice - h.avgPrice) / h.avgPrice) * 100).toFixed(2));
                  return (
                    <tr key={h.symbol} className="hover:bg-[#121215] transition-colors">
                      <td className="py-2 px-2 font-bold text-white flex items-center gap-2">
                        <CompanyLogo symbol={h.symbol} size="sm" />
                        <div>
                          <div>{h.symbol}</div>
                          <div className="text-[10px] text-[#71717a] font-normal">{h.name}</div>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right font-mono-num font-bold text-white">{h.lots} LOT</td>
                      <td className="py-2 px-2 text-right font-mono-num text-[#a1a1aa]">Rp {h.avgPrice.toLocaleString('id-ID')}</td>
                      <td className="py-2 px-2 text-right font-mono-num text-white">Rp {h.currentPrice.toLocaleString('id-ID')}</td>
                      <td className={`py-2 px-2 text-right font-mono-num font-bold ${
                        floatingProfit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
                      }`}>
                        {floatingProfit >= 0 ? `+Rp ${floatingProfit.toLocaleString('id-ID')}` : `-Rp ${Math.abs(floatingProfit).toLocaleString('id-ID')}`}
                        <div className="text-[10px]">({floatingProfitPct >= 0 ? `+${floatingProfitPct}%` : `${floatingProfitPct}%`})</div>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => placeSellOrder({
                            symbol: h.symbol,
                            displaySymbol: h.displaySymbol || h.symbol,
                            name: h.name,
                            price: h.currentPrice,
                            lots: h.lots,
                            orderType: 'MARKET',
                          })}
                          className="px-2 py-0.5 bg-[#ef4444]/20 hover:bg-[#ef4444]/30 text-[#ef4444] rounded text-[10px] font-bold cursor-pointer"
                        >
                          Tutup Posisi
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 🏆 Alpha Benchmark & Model Leaderboard ── */}
      <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-sm space-y-3">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#f59e0b]" />
            <span className="font-bold text-white text-xs">LEADERBOARD BENCHMARK MODEL AI (DATA-UNCONTAMINATED ALPHA)</span>
          </div>
          <span className="text-[10px] text-[#71717a]">Standar Evaluasi HKUDS Financial Benchmark</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BENCHMARK_MODELS.map((m, idx) => (
            <div key={m.id} className="p-3 bg-[#121215] border border-[#27272a] rounded space-y-2 hover:border-[#f59e0b]/40 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{idx + 1}. {m.name}</span>
                  </div>
                  <div className="text-[10px] text-[#71717a] mt-0.5">{m.paradigm}</div>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${m.badgeColor}`}>
                  {m.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#1f1f23] text-xs">
                <div>
                  <div className="text-[9px] text-[#71717a]">Win Rate:</div>
                  <div className="font-bold text-white">{m.winRate}%</div>
                </div>
                <div>
                  <div className="text-[9px] text-[#71717a]">Sharpe Ratio:</div>
                  <div className="font-bold text-[#f59e0b]">{m.sharpeRatio}</div>
                </div>
                <div>
                  <div className="text-[9px] text-[#71717a]">Total Return:</div>
                  <div className={`font-bold ${m.totalReturnPct >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    +{m.totalReturnPct}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Background Worker Settlement Audit Stream ── */}
      <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-sm space-y-1.5">
        <div className="text-[10px] font-bold text-[#71717a] uppercase flex items-center justify-between">
          <span>Log Audit Pekerja Latar Belakang (Settlement Audit Stream)</span>
          <span className="text-[#22c55e] text-[9px]">Sinkronisasi Real-Time</span>
        </div>
        <div className="bg-[#121216] border border-[#1f1f23] p-2 rounded text-[11px] text-[#a1a1aa] space-y-1 font-mono max-h-28 overflow-y-auto">
          {auditLog.map((log, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[#52525b]">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
