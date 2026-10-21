'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldAlert,
  Cpu,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  DollarSign,
  Copy,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Zap,
  Activity,
  Layers,
  Award,
  Radio,
  Clock,
  Compass,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePortfolioStore } from '@/store';
import { BoardroomResolution, BoardroomExecutive } from '@/app/api/ai/boardroom/route';
import SwarmSimulationWarRoom from '@/components/ai/SwarmSimulationWarRoom';

const FEATURED_TICKERS = [
  { symbol: 'BBCA', name: 'Bank Central Asia', market: 'IDX', flag: '🇮🇩' },
  { symbol: 'BBRI', name: 'Bank Rakyat Indonesia', market: 'IDX', flag: '🇮🇩' },
  { symbol: 'BMRI', name: 'Bank Mandiri', market: 'IDX', flag: '🇮🇩' },
  { symbol: 'TLKM', name: 'Telkom Indonesia', market: 'IDX', flag: '🇮🇩' },
  { symbol: 'ASII', name: 'Astra International', market: 'IDX', flag: '🇮🇩' },
  { symbol: 'ANTM', name: 'Aneka Tambang', market: 'IDX', flag: '🇮🇩' },
  { symbol: 'GOTO', name: 'GoTo Gojek Tokopedia', market: 'IDX', flag: '🇮🇩' },
  { symbol: 'BTC', name: 'Bitcoin Spot', market: 'CRYPTO', flag: '⚡' },
  { symbol: 'ETH', name: 'Ethereum Smart Contract', market: 'CRYPTO', flag: '⚡' },
  { symbol: 'SOL', name: 'Solana High-Speed', market: 'CRYPTO', flag: '⚡' },
  { symbol: 'NVDA', name: 'NVIDIA AI Computing', market: 'US', flag: '🇺🇸' },
];

export default function AutonomousBoardroomView() {
  const [selectedSymbol, setSelectedSymbol] = useState('BBCA');
  const [customInput, setCustomInput] = useState('');
  const [resolution, setResolution] = useState<BoardroomResolution | null>(null);
  const [marketIntel, setMarketIntel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeliberating, setIsDeliberating] = useState(false);
  const [activeTab, setActiveTab] = useState<'BOARDROOM' | 'WAR_ROOM' | 'TRANSCRIPT' | 'DIRECTIVE' | 'INTEL_WIRE'>('BOARDROOM');
  const [orderCopied, setOrderCopied] = useState(false);

  const placeBuyOrder = usePortfolioStore((s) => s.placeBuyOrder);

  // Fetch Boardroom Resolution for selected asset
  const fetchBoardroom = async (sym: string, isLiveRun: boolean = false) => {
    const clean = sym.trim().toUpperCase().replace('.JK', '').replace('^', '');
    if (!clean) return;

    if (isLiveRun) {
      setIsDeliberating(true);
    } else {
      setLoading(true);
    }
    setOrderCopied(false);

    try {
      const res = await fetch('/api/ai/boardroom', {
        method: isLiveRun ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: isLiveRun ? JSON.stringify({ symbol: clean }) : undefined,
      });

      if (!res.ok) throw new Error('Gagal menghubungi C-Suite Boardroom');
      const data: BoardroomResolution = await res.json();
      setResolution(data);
      if (isLiveRun) {
        toast.success(`Sidang Direksi Otonom untuk ${clean} selesai! Konsensus: ${data.action}`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error saat menjalankan sidang direksi');
    } finally {
      setLoading(false);
      setIsDeliberating(false);
    }
  };

  // Fetch 24/7 Market Wire Intel from VPS
  const fetchMarketIntel = async () => {
    try {
      const res = await fetch('/api/ai/market-intelligence');
      if (res.ok) {
        const data = await res.json();
        if (data.brief) setMarketIntel(data.brief);
      }
    } catch {}
  };

  useEffect(() => {
    fetchBoardroom(selectedSymbol);
    fetchMarketIntel();
  }, [selectedSymbol]);

  const handleCopyOrder = () => {
    if (!resolution) return;

    const price = resolution.price;
    const lots = Math.max(1, Math.round(resolution.recommendedAllocationLots));

    try {
      placeBuyOrder(resolution.symbol, resolution.name, price, lots, 'LIMIT');
      setOrderCopied(true);
      toast.success(
        `Sukses menyalin order direksi: BUY ${lots} Lot ${resolution.symbol} @ Rp ${price.toLocaleString('id-ID')}`
      );
    } catch (err: any) {
      toast.error('Gagal menempatkan order: ' + (err?.message || 'Periksa saldo virtual'));
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold tracking-wider uppercase">
                Autonomous Company Framework
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                24/7 Multi-Agent C-Suite Live
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>🏛️ Autonomous AI Boardroom</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-normal">
                C-Suite Deliberation
              </span>
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl">
              Dewan Direksi Otonom yang menggabungkan pola pikir **Jeff Bezos** (Flywheel Capital Allocator), **Charlie Munger** (Risk Inversion), **Werner Vogels** (Fault-Tolerant Engine), dan **Seth Godin** (Market Psychology).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/hedge-fund"
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              7 Master Committee
            </Link>
            <Link
              href="/portfolio"
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Portofolio Virtual
            </Link>
          </div>
        </div>

                {/* Banner Integrasi Virtual Office Otak Terpadu */}
        <Link
          href="/ai?tab=office&autopilot=1"
          className="p-3.5 rounded-xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-purple-900/40 border border-purple-500/30 flex items-center justify-between gap-3 text-xs hover:border-purple-400 transition-all group shadow-lg"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-sm">
              🏢
            </span>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>Gabung ke Otak AI Virtual Office 24/7</span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  ● 100% OTONOM TANPA SENTUHAN MANUSIA
                </span>
              </div>
              <div className="text-zinc-400 text-[11px] mt-0.5">
                Saksikan dewan C-Suite &amp; komite Hedge Fund berdebat di War Room dan mengeksekusi order virtual otomatis di denah kantor 2D.
              </div>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-purple-600 group-hover:bg-purple-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 shrink-0 transition-colors">
            <span>Masuk Kantor Virtual &rarr;</span>
          </div>
        </Link>

        {/* 24/7 Market Wire Ticker Banner */}
        {marketIntel && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-black text-[10px] uppercase flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                24/7 Wire
              </span>
              <span className="text-zinc-300 font-bold truncate max-w-xl">
                {marketIntel.headline}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('INTEL_WIRE')}
              className="text-amber-400 hover:text-amber-300 font-mono font-bold text-[11px] flex items-center gap-1 shrink-0"
            >
              <span>Buka Market Wire Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Ticker Quick Selector & Search */}
        <div className="bg-[#10131b] border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider">
              Pilih Emiten / Aset untuk Disidangkan:
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customInput.trim()) {
                  setSelectedSymbol(customInput.trim().toUpperCase());
                  setCustomInput('');
                }
              }}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <input
                type="text"
                placeholder="Cari Ticker (e.g. BREN, NVDA, SOL)..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-xs rounded-lg px-3 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 w-full sm:w-56 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-xs font-bold text-zinc-200 transition-colors"
              >
                Cari
              </button>
            </form>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {FEATURED_TICKERS.map((t) => (
              <button
                key={t.symbol}
                onClick={() => setSelectedSymbol(t.symbol)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                  selectedSymbol === t.symbol
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black'
                    : 'bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <span>{t.flag}</span>
                <span>{t.symbol}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Resolution Header Hero */}
        {resolution && (
          <div className="bg-gradient-to-r from-[#141824] via-[#10141f] to-[#141824] border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-white font-mono tracking-tight">
                    {resolution.symbol}
                  </h2>
                  <span className="text-sm text-zinc-400 font-medium">{resolution.name}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                    {resolution.currency === 'IDR'
                      ? `Rp ${resolution.price.toLocaleString('id-ID')}`
                      : `$${resolution.price.toLocaleString('en-US')}`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className={`px-3 py-1 rounded-md text-xs font-black font-mono tracking-wider ${
                      resolution.action === 'STRONG BUY'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : resolution.action === 'ACCUMULATE'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : resolution.action === 'HOLD / WAIT'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    KONSENSUS DIREKSI: {resolution.action}
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">
                    Keyakinan Dewan: <span className="font-bold text-white">{resolution.overallConviction}%</span>
                  </div>
                  <span className="text-zinc-600">•</span>
                  <div className="text-xs text-zinc-400 font-mono">
                    Target Alokasi: <span className="font-bold text-amber-400">{resolution.recommendedAllocationPct}%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={() => fetchBoardroom(resolution.symbol, true)}
                  disabled={isDeliberating}
                  className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isDeliberating ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Dewan Sedang Bersidang...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Jalankan Sidang Otonom</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyOrder}
                  disabled={orderCopied}
                  className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-emerald-600/20 disabled:bg-zinc-800 disabled:text-zinc-500 cursor-pointer"
                >
                  {orderCopied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Order Disalin ke Portofolio!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Order ke Portofolio ({resolution.recommendedAllocationLots} Lot)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Target, SL, and Risk/Reward metric bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-800/80">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-mono uppercase">Entry Disarankan</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">
                  {resolution.currency === 'IDR'
                    ? `Rp ${resolution.price.toLocaleString('id-ID')}`
                    : `$${resolution.price.toLocaleString('en-US')}`}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-emerald-400 font-mono uppercase">Take Profit (TP)</div>
                <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                  {resolution.currency === 'IDR'
                    ? `Rp ${resolution.targetPrice.toLocaleString('id-ID')}`
                    : `$${resolution.targetPrice.toLocaleString('en-US')}`}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-rose-400 font-mono uppercase">Stop Loss (Munger Gate)</div>
                <div className="text-sm font-bold text-rose-300 font-mono mt-0.5">
                  {resolution.currency === 'IDR'
                    ? `Rp ${resolution.stopLossPrice.toLocaleString('id-ID')}`
                    : `$${resolution.stopLossPrice.toLocaleString('en-US')}`}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="text-[10px] text-amber-400 font-mono uppercase">Risk : Reward Ratio</div>
                <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                  1 : {resolution.riskRewardRatio}x
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 text-xs font-mono font-bold overflow-x-auto">
                    <button
            onClick={() => setActiveTab('WAR_ROOM')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'WAR_ROOM'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>WAR ROOM SWARM (50 AGENTS)</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-sans font-bold">
              MIROFISH 🐟
            </span>
          </button>
<button
            onClick={() => setActiveTab('BOARDROOM')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'BOARDROOM'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>DEWAN DIREKSI (4 PERSONAS)</span>
          </button>
          <button
            onClick={() => setActiveTab('TRANSCRIPT')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'TRANSCRIPT'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>TRANSKRIP SIDANG DIALOG</span>
          </button>
          <button
            onClick={() => setActiveTab('DIRECTIVE')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'DIRECTIVE'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>SURAT KETETAPAN DIREKSI</span>
          </button>
          <button
            onClick={() => setActiveTab('INTEL_WIRE')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'INTEL_WIRE'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>24/7 MARKET WIRE (VPS DAEMON)</span>
          </button>
        </div>

        {/* TAB 1: EXECUTIVE ROSTER CARDS */}
        {activeTab === 'BOARDROOM' && resolution && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resolution.executives.map((exec) => (
              <div
                key={exec.id}
                className="bg-[#10141f] border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 space-y-4 transition-all relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: exec.color }}
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={exec.avatar}
                      alt={exec.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {exec.name}
                      </h3>
                      <div className="text-xs text-amber-400 font-mono">{exec.role}</div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{exec.persona}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                      exec.vote === 'BULLISH'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : exec.vote === 'BEARISH'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {exec.vote} ({exec.conviction}%)
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 leading-relaxed italic">
                  "{exec.statement}"
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1 border-t border-zinc-800/60">
                  <span className="flex items-center gap-1 text-zinc-500">
                    <span>Fokus:</span>
                    <span className="text-zinc-300 font-medium">{exec.focusPoint}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-[10px] font-semibold text-zinc-300">
                    {exec.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: LIVE DIALOGUE TRANSCRIPT */}
        {activeTab === 'TRANSCRIPT' && resolution && (
          <div className="bg-[#10141f] border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Transkrip Debat &amp; Musyawarah Sidang Direksi
                </h3>
                <p className="text-xs text-zinc-400">
                  Transkrip argumen otonom antar-eksekutif sebelum voting konsensus final ditetapkan.
                </p>
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {new Date(resolution.timestamp).toLocaleTimeString('id-ID')} WIB
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {resolution.dialogueTranscript.map((d, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                  <img
                    src={d.avatar}
                    alt={d.speakerName}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0 mt-0.5"
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white font-mono">{d.speakerName}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-800 text-amber-400 font-mono">
                        {d.tag}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{d.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: OFFICIAL BOARD DIRECTIVE */}
        {activeTab === 'DIRECTIVE' && resolution && (
          <div className="bg-[#10141f] border border-zinc-800 rounded-xl p-6 space-y-6">
            <div>
              <div className="text-amber-400 font-mono text-xs font-bold uppercase tracking-widest mb-1">
                Executive Committee Directive
              </div>
              <h3 className="text-xl font-black text-white">Surat Ketetapan Investasi Direksi</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Ketetapan resmi alokasi modal dan mitigasi risiko berdasarkan sidang otonom 24/7.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700/80 space-y-3">
              <div className="text-xs font-bold text-white uppercase font-mono">Instruksi CEO (Jeff Bezos):</div>
              <p className="text-xs text-zinc-300 leading-relaxed">{resolution.ceoDirective}</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 font-mono">
                <ShieldAlert className="w-4 h-4" />
                <span>Protokol Proteksi Risiko (Charlie Munger Gate):</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{resolution.riskNotice}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-mono">Target Lot Terkalkulasi:</div>
                <div className="text-lg font-black text-white font-mono mt-1">
                  {resolution.recommendedAllocationLots.toLocaleString('id-ID')} Lot
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-mono">Nominal Alokasi Modal:</div>
                <div className="text-lg font-black text-amber-400 font-mono mt-1">
                  {resolution.capitalAllocationFormatted}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-mono">Regim Makro Ditetapkan:</div>
                <div className="text-xs font-black text-emerald-400 font-mono mt-2 truncate">
                  {resolution.macroRegime}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 24/7 AUTONOMOUS MARKET WIRE (VPS DAEMON) */}
        {activeTab === 'INTEL_WIRE' && marketIntel && (
          <div className="bg-[#10141f] border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    VPS CLOUD AUTOPILOT DAEMON
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Host: 38.9.46.160:8002
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-mono">
                  {marketIntel.headline}
                </h3>
              </div>
              <button
                onClick={fetchMarketIntel}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refresh Wire</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
              <div className="text-amber-400 font-mono font-bold mb-1 uppercase tracking-wider">
                Macro Intelligence Summary:
              </div>
              {marketIntel.macro_summary}
            </div>

            {/* Top Picks Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider">
                Top Autonomous Alpha Signals (Live Streamed):
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="py-2.5 px-3">Aset</th>
                      <th className="py-2.5 px-3">Sinyal</th>
                      <th className="py-2.5 px-3">Entry Disarankan</th>
                      <th className="py-2.5 px-3">Target (TP)</th>
                      <th className="py-2.5 px-3">Stop Loss</th>
                      <th className="py-2.5 px-3">Risk:Reward</th>
                      <th className="py-2.5 px-3">Katalis Direksi</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {marketIntel.top_picks?.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-white">{p.symbol}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              p.action === 'STRONG BUY'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-teal-500/20 text-teal-300'
                            }`}
                          >
                            {p.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-zinc-300">
                          {p.entry > 100 ? p.entry.toLocaleString('id-ID') : p.entry}
                        </td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">
                          {p.target > 100 ? p.target.toLocaleString('id-ID') : p.target}
                        </td>
                        <td className="py-3 px-3 text-rose-400">
                          {p.stop_loss > 100 ? p.stop_loss.toLocaleString('id-ID') : p.stop_loss}
                        </td>
                        <td className="py-3 px-3 text-amber-300 font-bold">{p.rrr}x</td>
                        <td className="py-3 px-3 text-zinc-400 max-w-xs truncate">{p.driver}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedSymbol(p.symbol.replace('/USDT', ''))}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-zinc-200 transition-colors cursor-pointer"
                          >
                            Sidang &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* C-Suite Perspectives Grid */}
            {marketIntel.c_suite_perspectives && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
                  <div className="font-bold text-amber-400 font-mono mb-1">👑 Jeff Bezos (CEO Directives):</div>
                  <p className="text-zinc-300 leading-relaxed italic">{marketIntel.c_suite_perspectives.bezos_ceo}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
                  <div className="font-bold text-rose-400 font-mono mb-1">🛡️ Charlie Munger (Risk Gate):</div>
                  <p className="text-zinc-300 leading-relaxed italic">{marketIntel.c_suite_perspectives.munger_cro}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
                  <div className="font-bold text-cyan-400 font-mono mb-1">⚙️ Werner Vogels (Systems SRE):</div>
                  <p className="text-zinc-300 leading-relaxed italic">{marketIntel.c_suite_perspectives.vogels_cto}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
                  <div className="font-bold text-purple-400 font-mono mb-1">📣 Seth Godin (Sentiment Flow):</div>
                  <p className="text-zinc-300 leading-relaxed italic">{marketIntel.c_suite_perspectives.godin_cmo}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
