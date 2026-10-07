'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Swords,
  TrendingUp,
  TrendingDown,
  Scale,
  ShieldAlert,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  ChevronRight,
  Flame,
  Activity,
  Layers,
  Send,
} from 'lucide-react';
import { generateBullBearDebate, DebateResult } from '@/lib/hedgefund/debateEngine';
import { usePortfolioStore } from '@/store';
import CompanyLogo from '@/components/common/CompanyLogo';

const TICKER_CATEGORIES = {
  ALL: 'SEMUA',
  IDX: '🇮🇩 SAHAM IDX',
  CRYPTO: '⚡ CRYPTO (JESSE)',
  US: '🌐 US TECH',
} as const;

type TickerCategory = keyof typeof TICKER_CATEGORIES;

const TICKER_DATA: { symbol: string; category: 'IDX' | 'CRYPTO' | 'US'; label?: string }[] = [
  // Crypto Jesse Desk
  { symbol: 'BTC', category: 'CRYPTO', label: 'Bitcoin' },
  { symbol: 'ETH', category: 'CRYPTO', label: 'Ethereum' },
  { symbol: 'SOL', category: 'CRYPTO', label: 'Solana' },
  { symbol: 'BNB', category: 'CRYPTO', label: 'BNB' },
  { symbol: 'DOGE', category: 'CRYPTO', label: 'Dogecoin' },
  { symbol: 'XRP', category: 'CRYPTO', label: 'XRP' },
  // IDX
  { symbol: 'BBCA', category: 'IDX' },
  { symbol: 'BMRI', category: 'IDX' },
  { symbol: 'BBRI', category: 'IDX' },
  { symbol: 'BREN', category: 'IDX' },
  { symbol: 'ADRO', category: 'IDX' },
  { symbol: 'ASII', category: 'IDX' },
  { symbol: 'TLKM', category: 'IDX' },
  { symbol: 'AMMN', category: 'IDX' },
  { symbol: 'ANTM', category: 'IDX' },
  // US
  { symbol: 'NVDA', category: 'US' },
  { symbol: 'AAPL', category: 'US' },
];

export default function BullBearDebateArena({ initialSymbol = 'BBCA' }: { initialSymbol?: string }) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [selectedCategory, setSelectedCategory] = useState<TickerCategory>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [debate, setDebate] = useState<DebateResult>(() => generateBullBearDebate(initialSymbol));
  const [activeRound, setActiveRound] = useState<1 | 2 | 3>(3);
  const [isDebating, setIsDebating] = useState(false);
  const [executedOrder, setExecutedOrder] = useState(false);

  const { placeBuyOrder, cash } = usePortfolioStore();

  const handleSelectTicker = (newSym: string) => {
    setSymbol(newSym);
    setIsDebating(true);
    setExecutedOrder(false);
    setTimeout(() => {
      setDebate(generateBullBearDebate(newSym));
      setIsDebating(false);
    }, 400);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    handleSelectTicker(searchInput.toUpperCase().trim());
    setSearchInput('');
  };

  const handleExecutePaperOrder = () => {
    if (executedOrder) return;
    const isBuy = debate.winner === 'BULL';
    if (!isBuy) return;

    // Buy 10 lots in paper trading
    const res = placeBuyOrder({
      symbol: `${debate.symbol}.JK`,
      displaySymbol: debate.symbol,
      name: debate.name,
      price: debate.currentPrice,
      lots: 10,
      orderType: 'MARKET',
    });
    if (res.order) {
      setExecutedOrder(true);
    }
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Top Bar: Ticker Selector & Arena Status ── */}
      <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded">
              <Swords className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm tracking-wide">
                  ARENA DEBAT ADVERSARIAL: BULL vs. BEAR
                </span>
                <span className="text-[10px] bg-[#18181b] border border-[#27272a] text-[#f59e0b] px-1.5 py-0.5 rounded font-bold">
                  HKUDS/AI-TRADER ENGINE
                </span>
              </div>
              <p className="text-[11px] text-[#71717a]">
                Dialektika saling serang argumen antara Agen Optimis (Bull) vs Agen Skeptis (Bear) dengan Putusan Hakim Ketua (CIO).
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 bg-[#121216] border border-[#27272a] focus-within:border-[#f59e0b] px-2 py-1 rounded">
            <Search className="w-3.5 h-3.5 text-[#71717a]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari emiten lain (misal: BREN, BBRI)..."
              className="bg-transparent text-xs text-white placeholder-[#52525b] outline-none w-48 font-mono uppercase"
            />
            <button type="submit" className="bg-[#f59e0b] text-black font-bold text-[10px] px-2 py-0.5 rounded hover:bg-[#d97706] cursor-pointer">
              UJI
            </button>
          </form>
        </div>

        {/* Kategori Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none border-t border-[#18181b] pt-2">
          <span className="text-[#52525b] text-[10px] uppercase font-bold shrink-0">Filter Aset:</span>
          {(Object.keys(TICKER_CATEGORIES) as TickerCategory[]).map((catKey) => {
            const count = catKey === 'ALL' ? TICKER_DATA.length : TICKER_DATA.filter((x) => x.category === catKey).length;
            const isCatActive = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                  isCatActive
                    ? catKey === 'CRYPTO'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-[#f59e0b] text-black shadow-md shadow-amber-500/20'
                    : 'bg-[#121215] text-[#a1a1aa] border border-[#27272a] hover:bg-[#18181c] hover:text-white'
                }`}
              >
                {TICKER_CATEGORIES[catKey]} ({count})
              </button>
            );
          })}
        </div>

        {/* Quick Ticker Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          <span className="text-[#52525b] text-[10px] uppercase font-bold shrink-0">Pilihan Cepat:</span>
          {TICKER_DATA.filter((item) => selectedCategory === 'ALL' || item.category === selectedCategory).map((t) => {
            const isCrypto = t.category === 'CRYPTO';
            const isActive = symbol === t.symbol;
            return (
              <button
                key={t.symbol}
                onClick={() => handleSelectTicker(t.symbol)}
                className={`px-2.5 py-0.5 rounded border transition-colors cursor-pointer shrink-0 flex items-center gap-1 font-mono ${
                  isActive
                    ? isCrypto
                      ? 'bg-cyan-400 text-black font-extrabold border-cyan-400 shadow-sm'
                      : 'bg-[#f59e0b] text-black font-extrabold border-[#f59e0b]'
                    : isCrypto
                    ? 'bg-cyan-950/30 text-cyan-300 border-cyan-800/40 hover:bg-cyan-900/40 hover:border-cyan-500'
                    : 'bg-[#121215] text-[#a1a1aa] border-[#27272a] hover:border-[#f59e0b] hover:text-white'
                }`}
              >
                {isCrypto && <span className="text-[10px] text-cyan-400">⚡</span>}
                <span>{t.symbol}</span>
                {t.label && <span className="text-[9px] opacity-70">({t.label})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Stock Header & Live Conviction Meter ── */}
      <div className="p-4 bg-[#0d0d10] border border-[#27272a] rounded-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CompanyLogo symbol={debate.symbol} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">{debate.symbol}</span>
                <span className="text-xs text-[#a1a1aa]">{debate.name}</span>
                <span className="text-[10px] bg-[#18181b] border border-[#27272a] text-[#71717a] px-1.5 py-0.2 rounded font-bold">
                  {debate.market} • {debate.currency}
                </span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                {debate.currency === 'IDR' ? `Rp ${debate.currentPrice.toLocaleString('id-ID')}` : `$${debate.currentPrice}`}
                <span className="text-xs text-[#71717a] font-normal ml-2">Harga Benchmark Terverifikasi</span>
              </div>
            </div>
          </div>

          {/* Verdict Badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-[#71717a] uppercase font-bold">Putusan Hakim Ketua</div>
              <div className={`text-sm font-black ${
                debate.winner === 'BULL' ? 'text-[#22c55e]' : debate.winner === 'BEAR' ? 'text-[#ef4444]' : 'text-[#f59e0b]'
              }`}>
                {debate.verdictAction}
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded border font-black text-xs flex items-center gap-1.5 ${
              debate.winner === 'BULL'
                ? 'bg-[#22c55e]/10 border-[#22c55e]/40 text-[#22c55e]'
                : debate.winner === 'BEAR'
                ? 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]'
                : 'bg-[#f59e0b]/10 border-[#f59e0b]/40 text-[#f59e0b]'
            }`}>
              <Scale className="w-4 h-4" />
              <span>{debate.convictionPct}% CONVICTION</span>
            </div>
          </div>
        </div>

        {/* Dynamic Conviction Bar (Bull vs Bear Balance of Power) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-[#22c55e] flex items-center gap-1">
              🐂 BULL POWER ({debate.bullScore}%)
            </span>
            <span className="text-[#71717a]">KESEIMBANGAN ADVERSARIAL</span>
            <span className="text-[#ef4444] flex items-center gap-1">
              BEAR POWER ({debate.bearScore}%) 🐻
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#18181b] rounded-full overflow-hidden flex border border-[#27272a]">
            <div
              className="bg-[#22c55e] transition-all duration-500"
              style={{ width: `${debate.bullScore}%` }}
              title={`Bull Score: ${debate.bullScore}%`}
            />
            <div
              className="bg-[#ef4444] transition-all duration-500"
              style={{ width: `${debate.bearScore}%` }}
              title={`Bear Score: ${debate.bearScore}%`}
            />
          </div>
        </div>
      </div>

      {/* ── Round Navigation Switcher ── */}
      <div className="flex items-center gap-2 border-b border-[#27272a] pb-2 text-xs">
        <span className="text-[#71717a] font-bold text-[10px] uppercase">Ronde Sidang:</span>
        {[
          { id: 1, label: 'Ronde 1: Argumen Pembuka' },
          { id: 2, label: 'Ronde 2: Bantahan & Saling Serang' },
          { id: 3, label: 'Ronde 3: Putusan Akhir & Eksekusi' },
        ].map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveRound(r.id as 1 | 2 | 3)}
            className={`px-3 py-1 rounded transition-all cursor-pointer font-bold ${
              activeRound === r.id
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'bg-[#121215] text-[#a1a1aa] hover:text-white border border-[#27272a]'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* ── Arena Clash View (Split Column) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 🐂 Bull Desk */}
        <div className="p-4 bg-[#09090b] border border-[#22c55e]/30 rounded-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#22c55e]" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐂</span>
              <div>
                <span className="font-extrabold text-white text-xs tracking-wider">
                  AGEN BULL (OPTIMISTIK EXPANSION)
                </span>
                <div className="text-[10px] text-[#22c55e] font-semibold">Advokat Nilai &amp; Pertumbuhan</div>
              </div>
            </div>
            <span className="text-[10px] bg-[#22c55e]/20 text-[#22c55e] font-bold px-2 py-0.5 rounded">
              SKOR: {debate.bullScore}/100
            </span>
          </div>

          {/* Argument Body based on active round */}
          {activeRound === 1 && (
            <div className="space-y-2 text-xs">
              <div className="font-bold text-white text-xs">{debate.rounds.round1.bullOpening.headline}</div>
              <ul className="space-y-1.5 text-[#d4d4d8] text-[11px] list-disc list-inside">
                {debate.rounds.round1.bullOpening.points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
              <div className="pt-2 grid grid-cols-1 gap-1.5">
                {debate.rounds.round1.bullOpening.metrics.map((m, i) => (
                  <div key={i} className="flex justify-between p-1.5 bg-[#121215] border border-[#27272a] rounded text-[11px]">
                    <span className="text-[#a1a1aa]">{m.label}:</span>
                    <span className="text-[#22c55e] font-bold">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeRound === 2 && (
            <div className="space-y-2 text-xs">
              <div className="font-bold text-white text-xs">{debate.rounds.round2.bullRebuttal.headline}</div>
              <ul className="space-y-1.5 text-[#d4d4d8] text-[11px] list-disc list-inside">
                {debate.rounds.round2.bullRebuttal.points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
              <div className="pt-2 grid grid-cols-1 gap-1.5">
                {debate.rounds.round2.bullRebuttal.metrics.map((m, i) => (
                  <div key={i} className="flex justify-between p-1.5 bg-[#121215] border border-[#27272a] rounded text-[11px]">
                    <span className="text-[#a1a1aa]">{m.label}:</span>
                    <span className="text-[#22c55e] font-bold">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeRound === 3 && (
            <div className="p-3 bg-[#121215] border border-[#22c55e]/20 rounded space-y-2 text-xs">
              <div className="font-bold text-[#22c55e] text-xs">Tesis Final Pihak Bull:</div>
              <p className="text-[#d4d4d8] text-[11px] leading-relaxed">
                Katalis utama: <strong>{debate.keyCatalyst}</strong>. Didukung oleh arus akumulasi smart money dan parit ekonomi tebal yang menjamin proyeksi margin jangka panjang.
              </p>
              <div className="text-[10px] text-[#71717a]">
                Target Bullish (Upside): <strong className="text-white">Rp {debate.suggestedTakeProfit.toLocaleString('id-ID')}</strong> (+{Math.round(((debate.suggestedTakeProfit - debate.currentPrice)/debate.currentPrice)*100)}%)
              </div>
            </div>
          )}
        </div>

        {/* 🐻 Bear Desk */}
        <div className="p-4 bg-[#09090b] border border-[#ef4444]/30 rounded-sm space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#ef4444]" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐻</span>
              <div>
                <span className="font-extrabold text-white text-xs tracking-wider">
                  AGEN BEAR (RISK FORENSIC INVESTIGATOR)
                </span>
                <div className="text-[10px] text-[#ef4444] font-semibold">Investigator Risiko &amp; Skeptis</div>
              </div>
            </div>
            <span className="text-[10px] bg-[#ef4444]/20 text-[#ef4444] font-bold px-2 py-0.5 rounded">
              SKOR: {debate.bearScore}/100
            </span>
          </div>

          {/* Argument Body based on active round */}
          {activeRound === 1 && (
            <div className="space-y-2 text-xs">
              <div className="font-bold text-white text-xs">{debate.rounds.round1.bearOpening.headline}</div>
              <ul className="space-y-1.5 text-[#d4d4d8] text-[11px] list-disc list-inside">
                {debate.rounds.round1.bearOpening.points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
              <div className="pt-2 grid grid-cols-1 gap-1.5">
                {debate.rounds.round1.bearOpening.metrics.map((m, i) => (
                  <div key={i} className="flex justify-between p-1.5 bg-[#121215] border border-[#27272a] rounded text-[11px]">
                    <span className="text-[#a1a1aa]">{m.label}:</span>
                    <span className="text-[#ef4444] font-bold">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeRound === 2 && (
            <div className="space-y-2 text-xs">
              <div className="font-bold text-white text-xs">{debate.rounds.round2.bearRebuttal.headline}</div>
              <ul className="space-y-1.5 text-[#d4d4d8] text-[11px] list-disc list-inside">
                {debate.rounds.round2.bearRebuttal.points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
              <div className="pt-2 grid grid-cols-1 gap-1.5">
                {debate.rounds.round2.bearRebuttal.metrics.map((m, i) => (
                  <div key={i} className="flex justify-between p-1.5 bg-[#121215] border border-[#27272a] rounded text-[11px]">
                    <span className="text-[#a1a1aa]">{m.label}:</span>
                    <span className="text-[#ef4444] font-bold">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeRound === 3 && (
            <div className="p-3 bg-[#121215] border border-[#ef4444]/20 rounded space-y-2 text-xs">
              <div className="font-bold text-[#ef4444] text-xs">Peringatan Keras Pihak Bear:</div>
              <p className="text-[#d4d4d8] text-[11px] leading-relaxed">
                Risiko terbesar: <strong>{debate.biggestRisk}</strong>. Kegagalan mempertahankan level support kunci dapat memicu likuidasi berantai dan tekanan jual institusi.
              </p>
              <div className="text-[10px] text-[#71717a]">
                Batas Invalidasi (Hard Stop): <strong className="text-white">Rp {debate.suggestedStopLoss.toLocaleString('id-ID')}</strong> ({Math.round(((debate.suggestedStopLoss - debate.currentPrice)/debate.currentPrice)*100)}%)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ⚖️ Judge CIO Final Synthesis & Execution Card ── */}
      <div className="p-4 bg-[#0e0e12] border border-[#f59e0b]/40 rounded-sm space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#f59e0b]" />
            <div>
              <span className="font-extrabold text-white text-xs tracking-wider">
                PUTUSAN SIDANG KETUA HAKIM (CIO SYNTHESIS)
              </span>
              <div className="text-[10px] text-[#a1a1aa]">Sintesis Independen Bebas Bias Berdasar Matriks Probabilitas</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#71717a]">Rasio Risk / Reward:</span>
            <span className="bg-[#18181b] border border-[#27272a] px-2 py-0.5 rounded text-xs font-bold text-[#f59e0b]">
              1 : {debate.riskRewardRatio}x
            </span>
          </div>
        </div>

        <p className="text-xs text-[#d4d4d8] leading-relaxed">
          {debate.verdictSummary}
        </p>

        {/* Execution Slip Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="p-2.5 bg-[#121216] border border-[#27272a] rounded">
            <span className="text-[10px] text-[#71717a]">Entry Ideal:</span>
            <div className="font-bold text-white text-xs mt-0.5">
              {debate.currency === 'USD' ? `$${debate.suggestedEntry.toLocaleString()}` : `Rp ${debate.suggestedEntry.toLocaleString('id-ID')}`}
            </div>
          </div>
          <div className="p-2.5 bg-[#121216] border border-[#27272a] rounded">
            <span className="text-[10px] text-[#71717a]">Hard Stop Loss:</span>
            <div className="font-bold text-[#ef4444] text-xs mt-0.5">
              {debate.currency === 'USD' ? `$${debate.suggestedStopLoss.toLocaleString()}` : `Rp ${debate.suggestedStopLoss.toLocaleString('id-ID')}`}
            </div>
          </div>
          <div className="p-2.5 bg-[#121216] border border-[#27272a] rounded">
            <span className="text-[10px] text-[#71717a]">Target Profit (P80):</span>
            <div className="font-bold text-[#22c55e] text-xs mt-0.5">
              {debate.currency === 'USD' ? `$${debate.suggestedTakeProfit.toLocaleString()}` : `Rp ${debate.suggestedTakeProfit.toLocaleString('id-ID')}`}
            </div>
          </div>
          <div className="p-2.5 bg-[#121216] border border-[#27272a] rounded">
            <span className="text-[10px] text-[#71717a]">Saldo Kas Virtual:</span>
            <div className="font-bold text-[#f59e0b] text-xs mt-0.5">
              Rp {cash.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Action Button: One-Click Paper Execution */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-[#71717a] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Terhubung ke Mesin Paper Trading &amp; Portofolio Virtual</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExecutePaperOrder}
              disabled={executedOrder || debate.winner !== 'BULL'}
              className={`px-4 py-2 rounded font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                executedOrder
                  ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40'
                  : debate.winner === 'BULL'
                  ? 'bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold shadow-lg shadow-[#22c55e]/20'
                  : 'bg-[#27272a] text-[#71717a] cursor-not-allowed'
              }`}
            >
              {executedOrder ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                  <span>Pesanan 10 Lot Berhasil Masuk ke Portofolio!</span>
                </>
              ) : debate.winner === 'BULL' ? (
                <>
                  <Play className="w-4 h-4" />
                  <span>🚀 Eksekusi Putusan ke Portofolio Paper Trading</span>
                </>
              ) : (
                <span>⚠️ Putusan Bearish: Tidak Disarankan Buka Posisi Beli</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
