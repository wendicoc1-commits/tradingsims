'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  CheckCircle2,
  Circle,
  TrendingUp,
  Cpu,
  Coins,
  ShieldAlert,
  BarChart3,
  BookOpen,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
  Target,
  Terminal,
  ExternalLink,
} from 'lucide-react';

interface RoadmapNode {
  id: string;
  title: string;
  desc: string;
  actionUrl: string;
  actionText: string;
  skills: string[];
  estimatedHours: string;
}

interface RoadmapTrack {
  id: string;
  name: string;
  tagline: string;
  icon: any;
  color: string;
  borderColor: string;
  badgeBg: string;
  nodes: RoadmapNode[];
}

const ROADMAP_TRACKS: RoadmapTrack[] = [
  {
    id: 'idx-stock',
    name: '1. Trader Saham BEI / IDX Mastery',
    tagline: 'Jalur resmi dari pemula hingga mahir menganalisis emiten bursa saham Indonesia.',
    icon: TrendingUp,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    nodes: [
      {
        id: 'idx-1',
        title: 'Mekanisme Pasar & Fraksi Harga BEI',
        desc: 'Pahami jam bursa, pra-pembukaan, sesi I & II, fraksi harga (tick size), batasan Auto Rejection (ARA/ARB), dan struktur biaya transaksi (broker & levy fee).',
        actionUrl: '/screener',
        actionText: 'Buka Screener Saham',
        skills: ['Fraksi Harga', 'Jam Perdagangan', 'ARA/ARB', 'Order Book'],
        estimatedHours: '3 Jam',
      },
      {
        id: 'idx-2',
        title: 'Analisis Fundamental & Laporan Keuangan',
        desc: 'Membaca Laporan Keuangan (Neraca, Laba Rugi, Arus Kas). Memahami metrik valuasi: Price to Earnings (PER), Price to Book (PBV), Dividend Yield, dan ROE.',
        actionUrl: '/dividend',
        actionText: 'Cek Kalender Dividen & Rasio',
        skills: ['PER & PBV', 'Dividend Yield', 'Debt to Equity', 'Laba Bersih'],
        estimatedHours: '6 Jam',
      },
      {
        id: 'idx-3',
        title: 'Analisis Teknikal Modern & Price Action',
        desc: 'Membaca pola Candlestick, Support & Resistance kunci, Moving Averages (MA20, MA50, MA200), RSI Overbought/Oversold, dan indikator volume.',
        actionUrl: '/stock/BBCA',
        actionText: 'Buka Grafik Candlestick BBCA',
        skills: ['Price Action', 'Support Resistance', 'RSI & MACD', 'Moving Averages'],
        estimatedHours: '8 Jam',
      },
      {
        id: 'idx-4',
        title: 'Radar Bandarmologi & Smart Money Flow',
        desc: 'Mendeteksi akumulasi dan distribusi konglomerat / institusi asing (Foreign Flow). Membaca Broker Summary (Net Buy/Sell) di bursa Indonesia.',
        actionUrl: '/bandar',
        actionText: 'Buka Radar Bandarmologi',
        skills: ['Foreign Flow', 'Broker Summary', 'Akumulasi & Distribusi', 'Peta Konglomerasi'],
        estimatedHours: '10 Jam',
      },
      {
        id: 'idx-5',
        title: 'Risk & Portfolio Money Management',
        desc: 'Manajemen modal terstruktur: Risk to Reward Ratio (minimal 1:2), aturan maksimal risiko 1-2% modal per trade, dan disiplin Cut Loss.',
        actionUrl: '/portfolio',
        actionText: 'Kelola Portofolio & Risk Sizing',
        skills: ['Risk to Reward', 'Position Sizing', 'Stop Loss Disiplin', 'P&L Blotter'],
        estimatedHours: '5 Jam',
      },
    ],
  },
  {
    id: 'quant-algo',
    name: '2. Algorithmic & Quant Trader (FinTech Python/TS)',
    tagline: 'Membangun bot trading mandiri, scanner kuantitatif, dan model probabilitas matematika.',
    icon: Cpu,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    nodes: [
      {
        id: 'quant-1',
        title: 'Statistika Finansial & Probabilitas Pasar',
        desc: 'Pahami distribusi return harga normal vs fat tails, Standard Deviation, Z-Score, Volatilitas Tahunan, dan konsep Mean Reversion vs Trend Following.',
        actionUrl: '/ai',
        actionText: 'Buka AI Trading Floor',
        skills: ['Mean & Variance', 'Z-Score Normalization', 'Sharpe Ratio', 'Max Drawdown'],
        estimatedHours: '8 Jam',
      },
      {
        id: 'quant-2',
        title: 'Market Microstructure & Order Matching',
        desc: 'Cara kerja matching engine bursa (FIFO Price-Time Priority), kedalaman antrean order book (Level 2 LOB data), bid-ask spread, dan slippage.',
        actionUrl: '/architecture',
        actionText: 'Lihat Blueprint Arsitektur Engine',
        skills: ['Order Book LOB', 'Bid-Ask Spread', 'Price-Time Priority', 'Market Impact'],
        estimatedHours: '6 Jam',
      },
      {
        id: 'quant-3',
        title: 'Custom Quantitative Indicators Engine',
        desc: 'Membuat rumus matematika indikator sendiri: VWAP (Volume-Weighted Average Price), Exponential Moving Average, Bollinger Bandwidth, dan Momentum Alpha.',
        actionUrl: '/screener',
        actionText: 'Uji Indikator di Screener',
        skills: ['VWAP Formulation', 'Alpha Formula', 'Time-series Resampling'],
        estimatedHours: '7 Jam',
      },
      {
        id: 'quant-4',
        title: 'Backtesting Engine & Walk-Forward Validation',
        desc: 'Menguji strategi historis tanpa overfitting atau look-ahead bias. Mengukur metrik performa quant: Win Rate, Profit Factor, Calmar Ratio, dan Expectancy.',
        actionUrl: '/portfolio',
        actionText: 'Evaluasi Realized P&L Portofolio',
        skills: ['Walk-Forward Analysis', 'Overfitting Prevention', 'Profit Factor'],
        estimatedHours: '12 Jam',
      },
      {
        id: 'quant-5',
        title: 'Autonomous AI Hedge Fund Agent Integration',
        desc: 'Mengintegrasikan Large Language Model (LLM) untuk membaca sentimen berita, laporan emiten, dan mengeksekusi order paper trade secara otomatis.',
        actionUrl: '/ai',
        actionText: 'Aktifkan AI Auto-Trader Pilot',
        skills: ['LLM Sentiment Analysis', 'Autonomous Agents', 'Automated Execution'],
        estimatedHours: '10 Jam',
      },
    ],
  },
  {
    id: 'crypto-spot',
    name: '3. Crypto Spot 24/7 & Global Liquidity Flow',
    tagline: 'Navigasi pasar aset kripto likuiditas global yang buka 24 jam nonstop tanpa jeda libur.',
    icon: Coins,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    nodes: [
      {
        id: 'crypto-1',
        title: 'Dasar Likuiditas Aset Digital & Stablecoin',
        desc: 'Mekanisme pasangan mata uang kripto (BTC/USDT, ETH/USDT), peran stablecoin (USDT/USDC), dan perbedaan pasar Spot vs Derivatif.',
        actionUrl: '/crypto',
        actionText: 'Buka Terminal Crypto Spot',
        skills: ['Order Spot USDT', 'Stablecoin Pegging', 'Global 24/7 Trading'],
        estimatedHours: '4 Jam',
      },
      {
        id: 'crypto-2',
        title: 'On-Chain Flow, Whale Alert & Order Depth',
        desc: 'Melacak pergerakan dompet paus (whale inflow/outflow ke exchange), volume akumulasi, dan analisis likuiditas global Binance Spot.',
        actionUrl: '/crypto',
        actionText: 'Pantau Live Quotes 25+ Koin',
        skills: ['Whale Tracking', 'Exchange Inflow/Outflow', 'Order Book Depth'],
        estimatedHours: '6 Jam',
      },
      {
        id: 'crypto-3',
        title: 'Manajemen Volatilitas & Disiplin 24/7',
        desc: 'Strategi menghadapi volatilitas ekstrem di akhir pekan, trailing stop otomatis, take-profit bertahap, dan menjaga psikologi tanpa FOMO.',
        actionUrl: '/portfolio',
        actionText: 'Uji Eksekusi di Portofolio',
        skills: ['Trailing Stop', 'Multi-tier Take Profit', 'Anti-FOMO Discipline'],
        estimatedHours: '5 Jam',
      },
    ],
  },
];

export default function RoadmapPage() {
  const [activeTrackId, setActiveTrackId] = useState<string>('idx-stock');
  const [completedNodeIds, setCompletedNodeIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tradesim_roadmap_completed');
      if (saved) {
        setCompletedNodeIds(JSON.parse(saved));
      }
    } catch (_) {}
    setIsLoaded(true);
  }, []);

  const toggleNodeCompletion = (nodeId: string) => {
    setCompletedNodeIds((prev) => {
      let updated: string[];
      if (prev.includes(nodeId)) {
        updated = prev.filter((id) => id !== nodeId);
      } else {
        updated = [...prev, nodeId];
      }
      try {
        localStorage.setItem('tradesim_roadmap_completed', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const totalAllNodes = ROADMAP_TRACKS.reduce((sum, t) => sum + t.nodes.length, 0);
  const totalCompleted = completedNodeIds.length;
  const progressPercent = Math.round((totalCompleted / totalAllNodes) * 100);

  const activeTrack = ROADMAP_TRACKS.find((t) => t.id === activeTrackId) || ROADMAP_TRACKS[0];
  const trackCompletedCount = activeTrack.nodes.filter((n) => completedNodeIds.includes(n.id)).length;
  const trackPercent = Math.round((trackCompletedCount / activeTrack.nodes.length) * 100);

  return (
    <div className="min-h-screen bg-[#07080b] text-neutral-200">
      {/* Hero Section */}
      <div className="border-b border-neutral-800/80 bg-gradient-to-b from-neutral-900/60 via-neutral-950/40 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
                <Compass className="w-3.5 h-3.5" />
                <span>Peta Jalan Karir FinTech &amp; Trader Institusi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                TradeSim Trader &amp; Quant Learning Roadmap
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 max-w-2xl leading-relaxed">
                Panduan kurikulum visual langkah-demi-langkah dari pemula hingga profesional. Centang setiap tahap yang Anda selesaikan dan langsung praktikkan materinya di simulator TradeSim Pro.
              </p>
            </div>

            {/* Total Overall Progress Card */}
            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 shrink-0 w-full md:w-72 shadow-xl">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-neutral-400 font-medium flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" /> Total Kemajuan Anda:
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">{progressPercent}%</span>
              </div>
              <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-neutral-500">
                <span>{totalCompleted} dari {totalAllNodes} Modul Dikuasai</span>
                <span className="text-emerald-400 font-medium">
                  {progressPercent === 100
                    ? 'Master Trader 🏆'
                    : progressPercent > 50
                    ? 'Intermediate Quant 🚀'
                    : 'Novice Learner 🌱'}
                </span>
              </div>
            </div>
          </div>

          {/* Track Switcher Tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto no-scrollbar pb-1">
            {ROADMAP_TRACKS.map((track) => {
              const Icon = track.icon;
              const isSelected = activeTrackId === track.id;
              const count = track.nodes.filter((n) => completedNodeIds.includes(n.id)).length;
              return (
                <button
                  key={track.id}
                  onClick={() => setActiveTrackId(track.id)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? `bg-neutral-800 ${track.color} ${track.borderColor} shadow-lg shadow-neutral-900/50`
                      : 'bg-neutral-900/40 text-neutral-400 border-neutral-800/80 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{track.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${track.badgeBg}`}>
                    {count}/{track.nodes.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Roadmap Tree Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Track Header Banner */}
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTrack.color}`}>
              Track Terpilih
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">{activeTrack.name}</h2>
            <p className="text-xs text-neutral-400 mt-1">{activeTrack.tagline}</p>
          </div>
          <div className="text-right sm:text-right shrink-0">
            <span className="text-xs text-neutral-400">Progres Jalur Ini:</span>
            <div className="text-xl font-extrabold text-white font-mono">{trackPercent}%</div>
          </div>
        </div>

        {/* Step Nodes List */}
        <div className="relative space-y-6">
          {/* Vertical Connecting Line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-neutral-800 -z-0 hidden sm:block" />

          {activeTrack.nodes.map((node, index) => {
            const isCompleted = completedNodeIds.includes(node.id);
            return (
              <div
                key={node.id}
                className={`relative z-10 p-5 sm:p-6 rounded-2xl border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-neutral-900/80 border-emerald-500/40 shadow-emerald-500/5 shadow-xl'
                    : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Step Number & Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleNodeCompletion(node.id)}
                    aria-label={`Tandai selesai modul ${node.title}`}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border cursor-pointer transition transform active:scale-95 ${
                      isCompleted
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 animate-in zoom-in" />
                    ) : (
                      <span className="font-mono text-sm font-bold">0{index + 1}</span>
                    )}
                  </button>

                  {/* Body Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                          Tahap {index + 1}
                        </span>
                        <h3 className={`text-base font-bold transition ${isCompleted ? 'text-emerald-300' : 'text-white'}`}>
                          {node.title}
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                        ⏱️ Est. {node.estimatedHours}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed">{node.desc}</p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {node.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-950 text-neutral-300 border border-neutral-800"
                        >
                          #{skill}
                        </span>
                      ))}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-neutral-800/60 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleNodeCompletion(node.id)}
                        className={`text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          isCompleted
                            ? 'text-emerald-400 hover:text-emerald-300'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Telah Dikuasai (Klik untuk Batal)</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-4 h-4" />
                            <span>Tandai Selesai Pelajari</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={node.actionUrl}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span>{node.actionText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Call to Action */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-neutral-900 border border-amber-500/30 text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 mb-1">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Siap Menguji Keahlian Anda di Pasar Riil?</h3>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto">
            Teori tanpa praktik adalah ilusi. Buka terminal simulator TradeSim Pro sekarang dan uji setiap strategi menggunakan saldo kas virtual tanpa risiko kehilangan uang nyata.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <Terminal className="w-4 h-4" />
              <span>Buka Terminal Trading</span>
            </Link>
            <Link
              href="/portfolio"
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs border border-neutral-700 transition flex items-center gap-1.5"
            >
              <span>Lihat Portofolio Anda</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
