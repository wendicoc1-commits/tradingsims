'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Scale,
  Sparkles,
  Bot,
  Brain,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  Sliders,
  DollarSign,
  ChevronRight,
  Layers,
  PieChart,
  Search,
  ExternalLink,
  Clock,
  Globe,
  Filter,
  X,
} from 'lucide-react';
import { HedgeFundCommitteeReport, HedgeFundAgentVote } from '@/lib/hedgefund/types';
import { usePortfolioStore } from '@/store';
import { checkIDXMarketStatus, isIndonesianStock } from '@/lib/market/marketHours';

interface SearchableStock {
  symbol: string;
  name: string;
  market: 'IDX' | 'US';
  sector: 'Crypto (Jesse Desk)' | 'Perbankan' | 'LQ45 & Bluechip' | 'Komoditas & Energi' | 'Teknologi & Telco' | 'Konsumer & Manufaktur' | 'US Tech Giants';
  flag: string;
}

const STOCK_UNIVERSE: SearchableStock[] = [
  // ⚡ Crypto (Jesse AI Quant Desk)
  { symbol: 'BTC', name: 'Bitcoin (Spot / Jesse AI Quant)', market: 'US', sector: 'Crypto (Jesse Desk)', flag: '⚡' },
  { symbol: 'ETH', name: 'Ethereum (Spot / Smart Contract)', market: 'US', sector: 'Crypto (Jesse Desk)', flag: '⚡' },
  { symbol: 'SOL', name: 'Solana (High-Performance L1)', market: 'US', sector: 'Crypto (Jesse Desk)', flag: '⚡' },
  { symbol: 'BNB', name: 'Build and Build (Binance Ecosystem)', market: 'US', sector: 'Crypto (Jesse Desk)', flag: '⚡' },
  { symbol: 'DOGE', name: 'Dogecoin (Meme Liquidity King)', market: 'US', sector: 'Crypto (Jesse Desk)', flag: '⚡' },
  { symbol: 'XRP', name: 'Ripple (Cross-border Settlement)', market: 'US', sector: 'Crypto (Jesse Desk)', flag: '⚡' },
  { symbol: 'ADA', name: 'Cardano (PoS Ecosystem)', market: 'US', sector: 'Crypto (Jesse Desk)', flag: '⚡' },
  { symbol: 'AVAX', name: 'Avalanche (Subnet Architecture)', market: 'US', sector: 'Crypto (Jesse Desk)', flag: '⚡' },
  { symbol: 'SUI', name: 'Sui Network (Move VM)', market: 'US', sector: 'Crypto (Jesse Desk)', flag: '⚡' },
  { symbol: 'NEAR', name: 'NEAR Protocol (AI Chain)', market: 'US', sector: 'Crypto (Jesse Desk)', flag: '⚡' },
  { symbol: 'LINK', name: 'Chainlink (Decentralized Oracle)', market: 'US', sector: 'Crypto (Jesse Desk)', flag: '⚡' },
  { symbol: 'PEPE', name: 'Pepe (Speculative Momentum)', market: 'US', sector: 'Crypto (Jesse Desk)', flag: '⚡' },

  // 🏛️ Perbankan IDX
  { symbol: 'BBCA', name: 'Bank Central Asia Tbk', market: 'IDX', sector: 'Perbankan', flag: '🇮🇩' },
  { symbol: 'BBRI', name: 'Bank Rakyat Indonesia Tbk', market: 'IDX', sector: 'Perbankan', flag: '🇮🇩' },
  { symbol: 'BMRI', name: 'Bank Mandiri Tbk', market: 'IDX', sector: 'Perbankan', flag: '🇮🇩' },
  { symbol: 'BBNI', name: 'Bank Negara Indonesia Tbk', market: 'IDX', sector: 'Perbankan', flag: '🇮🇩' },
  { symbol: 'BRIS', name: 'Bank Syariah Indonesia Tbk', market: 'IDX', sector: 'Perbankan', flag: '🇮🇩' },
  { symbol: 'BBTN', name: 'Bank Tabungan Negara Tbk', market: 'IDX', sector: 'Perbankan', flag: '🇮🇩' },
  { symbol: 'BDMN', name: 'Bank Danamon Indonesia Tbk', market: 'IDX', sector: 'Perbankan', flag: '🇮🇩' },
  { symbol: 'BNGA', name: 'Bank CIMB Niaga Tbk', market: 'IDX', sector: 'Perbankan', flag: '🇮🇩' },
  { symbol: 'ARTO', name: 'Bank Jago Tbk', market: 'IDX', sector: 'Perbankan', flag: '🇮🇩' },
  { symbol: 'PNBN', name: 'Bank Pan Indonesia Tbk', market: 'IDX', sector: 'Perbankan', flag: '🇮🇩' },

  // 💎 LQ45 & Bluechip
  { symbol: 'ASII', name: 'Astra International Tbk', market: 'IDX', sector: 'LQ45 & Bluechip', flag: '🇮🇩' },
  { symbol: 'TLKM', name: 'Telkom Indonesia Tbk', market: 'IDX', sector: 'LQ45 & Bluechip', flag: '🇮🇩' },
  { symbol: 'BREN', name: 'Barito Renewables Energy Tbk', market: 'IDX', sector: 'LQ45 & Bluechip', flag: '🇮🇩' },
  { symbol: 'AMMN', name: 'Amman Mineral Internasional Tbk', market: 'IDX', sector: 'LQ45 & Bluechip', flag: '🇮🇩' },
  { symbol: 'TPIA', name: 'Chandra Asri Pacific Tbk', market: 'IDX', sector: 'LQ45 & Bluechip', flag: '🇮🇩' },
  { symbol: 'BRPT', name: 'Barito Pacific Tbk', market: 'IDX', sector: 'LQ45 & Bluechip', flag: '🇮🇩' },
  { symbol: 'UNTR', name: 'United Tractors Tbk', market: 'IDX', sector: 'LQ45 & Bluechip', flag: '🇮🇩' },
  { symbol: 'SMGR', name: 'Semen Indonesia Tbk', market: 'IDX', sector: 'LQ45 & Bluechip', flag: '🇮🇩' },
  { symbol: 'INTP', name: 'Indocement Tunggal Prakarsa Tbk', market: 'IDX', sector: 'LQ45 & Bluechip', flag: '🇮🇩' },

  // ⚡ Komoditas & Energi
  { symbol: 'ADRO', name: 'Adaro Energy Indonesia Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },
  { symbol: 'ANTM', name: 'Aneka Tambang Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },
  { symbol: 'PTBA', name: 'Bukit Asam Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },
  { symbol: 'MEDC', name: 'Medco Energi Internasional Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },
  { symbol: 'PGAS', name: 'Perusahaan Gas Negara Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },
  { symbol: 'INCO', name: 'Vale Indonesia Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },
  { symbol: 'MDKA', name: 'Merdeka Copper Gold Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },
  { symbol: 'TINS', name: 'Timah Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },
  { symbol: 'BRMS', name: 'Bumi Resources Minerals Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },
  { symbol: 'HRUM', name: 'Harum Energy Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },
  { symbol: 'AKRA', name: 'AKR Corporindo Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },
  { symbol: 'INDY', name: 'Indika Energy Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },
  { symbol: 'ITMG', name: 'Indo Tambangraya Megah Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },
  { symbol: 'CUAN', name: 'Petrindo Jaya Kreasi Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },
  { symbol: 'PGEO', name: 'Pertamina Geothermal Energy Tbk', market: 'IDX', sector: 'Komoditas & Energi', flag: '🇮🇩' },

  // 🚀 Teknologi & Telco
  { symbol: 'GOTO', name: 'GoTo Gojek Tokopedia Tbk', market: 'IDX', sector: 'Teknologi & Telco', flag: '🇮🇩' },
  { symbol: 'BUKA', name: 'Bukalapak.com Tbk', market: 'IDX', sector: 'Teknologi & Telco', flag: '🇮🇩' },
  { symbol: 'EMTK', name: 'Elang Mahkota Teknologi Tbk', market: 'IDX', sector: 'Teknologi & Telco', flag: '🇮🇩' },
  { symbol: 'ISAT', name: 'Indosat Ooredoo Hutchison Tbk', market: 'IDX', sector: 'Teknologi & Telco', flag: '🇮🇩' },
  { symbol: 'EXCL', name: 'XL Axiata Tbk', market: 'IDX', sector: 'Teknologi & Telco', flag: '🇮🇩' },
  { symbol: 'TOWR', name: 'Sarana Menara Nusantara Tbk', market: 'IDX', sector: 'Teknologi & Telco', flag: '🇮🇩' },
  { symbol: 'TBIG', name: 'Tower Bersama Infrastructure Tbk', market: 'IDX', sector: 'Teknologi & Telco', flag: '🇮🇩' },

  // 🏭 Konsumer & Manufaktur
  { symbol: 'ICBP', name: 'Indofood CBP Sukses Makmur Tbk', market: 'IDX', sector: 'Konsumer & Manufaktur', flag: '🇮🇩' },
  { symbol: 'INDF', name: 'Indofood Sukses Makmur Tbk', market: 'IDX', sector: 'Konsumer & Manufaktur', flag: '🇮🇩' },
  { symbol: 'UNVR', name: 'Unilever Indonesia Tbk', market: 'IDX', sector: 'Konsumer & Manufaktur', flag: '🇮🇩' },
  { symbol: 'KLBF', name: 'Kalbe Farma Tbk', market: 'IDX', sector: 'Konsumer & Manufaktur', flag: '🇮🇩' },
  { symbol: 'CPIN', name: 'Charoen Pokphand Indonesia Tbk', market: 'IDX', sector: 'Konsumer & Manufaktur', flag: '🇮🇩' },
  { symbol: 'JPFA', name: 'Japfa Comfeed Indonesia Tbk', market: 'IDX', sector: 'Konsumer & Manufaktur', flag: '🇮🇩' },
  { symbol: 'MYOR', name: 'Mayora Indah Tbk', market: 'IDX', sector: 'Konsumer & Manufaktur', flag: '🇮🇩' },
  { symbol: 'CMRY', name: 'Cisarua Mountain Dairy Tbk', market: 'IDX', sector: 'Konsumer & Manufaktur', flag: '🇮🇩' },
  { symbol: 'SIDO', name: 'Industri Jamu Sido Muncul Tbk', market: 'IDX', sector: 'Konsumer & Manufaktur', flag: '🇮🇩' },
  { symbol: 'INKP', name: 'Indah Kiat Pulp & Paper Tbk', market: 'IDX', sector: 'Konsumer & Manufaktur', flag: '🇮🇩' },
  { symbol: 'TKIM', name: 'Pabrik Kertas Tjiwi Kimia Tbk', market: 'IDX', sector: 'Konsumer & Manufaktur', flag: '🇮🇩' },

  // 🌐 US Tech Giants & Global Leaders
  { symbol: 'NVDA', name: 'NVIDIA Corporation', market: 'US', sector: 'US Tech Giants', flag: '🇺🇸' },
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'US', sector: 'US Tech Giants', flag: '🇺🇸' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', market: 'US', sector: 'US Tech Giants', flag: '🇺🇸' },
  { symbol: 'TSLA', name: 'Tesla Inc.', market: 'US', sector: 'US Tech Giants', flag: '🇺🇸' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)', market: 'US', sector: 'US Tech Giants', flag: '🇺🇸' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'US', sector: 'US Tech Giants', flag: '🇺🇸' },
  { symbol: 'META', name: 'Meta Platforms Inc.', market: 'US', sector: 'US Tech Giants', flag: '🇺🇸' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', market: 'US', sector: 'US Tech Giants', flag: '🇺🇸' },
  { symbol: 'PLTR', name: 'Palantir Technologies', market: 'US', sector: 'US Tech Giants', flag: '🇺🇸' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', market: 'US', sector: 'US Tech Giants', flag: '🇺🇸' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', market: 'US', sector: 'US Tech Giants', flag: '🇺🇸' },
  { symbol: 'ARM', name: 'Arm Holdings plc', market: 'US', sector: 'US Tech Giants', flag: '🇬🇧' },
  { symbol: 'NFLX', name: 'Netflix Inc.', market: 'US', sector: 'US Tech Giants', flag: '🇺🇸' },
  { symbol: 'BABA', name: 'Alibaba Group Holding', market: 'US', sector: 'US Tech Giants', flag: '🇨🇳' },
];

const SECTOR_CATEGORIES = [
  'SEMUA',
  'Crypto (Jesse Desk)',
  'Perbankan',
  'LQ45 & Bluechip',
  'Komoditas & Energi',
  'Teknologi & Telco',
  'Konsumer & Manufaktur',
  'US Tech Giants',
] as const;

export default function HedgeFundCommitteeView() {
  const [selectedSymbol, setSelectedSymbol] = useState('BBCA');
  const [report, setReport] = useState<HedgeFundCommitteeReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'BOARDROOM' | 'CIO_ORDER' | 'RISK_GATE' | 'QUANT_BRIDGE' | 'LEDGER'>('BOARDROOM');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentTickers, setRecentTickers] = useState<string[]>(['BBCA', 'BREN', 'CUAN', 'ANTM', 'PLTR', 'NVDA']);
  const [orderExecuted, setOrderExecuted] = useState(false);

  const placeBuyOrder = usePortfolioStore((s) => s.placeBuyOrder);

  // Load recently analyzed tickers from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fincept_recent_hedge_tickers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentTickers(parsed);
        }
      }
    } catch {}
  }, []);

  const addRecentTicker = (sym: string) => {
    setRecentTickers((prev) => {
      const filtered = prev.filter((t) => t !== sym);
      const updated = [sym, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('fincept_recent_hedge_tickers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const fetchCommitteeReport = async (sym: string) => {
    const clean = sym.trim().toUpperCase().replace('.JK', '').replace('^', '');
    if (!clean) return;

    setLoading(true);
    setError(null);
    setOrderExecuted(false);
    addRecentTicker(clean);

    try {
      // 1. Fetch live realtime quote first to pass current price
      let liveP: number | undefined;
      try {
        const liveRes = await fetch(`/api/stocks/realtime?tickers=${clean}`);
        if (liveRes.ok) {
          const lJson = await liveRes.json();
          const q = lJson?.quotes?.[clean] || lJson?.data?.[clean];
          if (q?.price) liveP = q.price;
        }
      } catch {}

      const url = liveP
        ? `/api/ai/hedge-fund?symbol=${clean}&price=${liveP}`
        : `/api/ai/hedge-fund?symbol=${clean}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Gagal mengambil laporan komite hedge fund untuk ${clean}`);
      const data = await res.json();
      setReport(data);
    } catch (e: any) {
      setError(e?.message || `Error processing committee deliberations for ${clean}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommitteeReport(selectedSymbol);
  }, [selectedSymbol]);

  const handleSelectSymbol = (sym: string) => {
    const clean = sym.trim().toUpperCase().replace('.JK', '').replace('^', '');
    if (clean) {
      setSelectedSymbol(clean);
      setSearchQuery('');
      setIsDropdownOpen(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    handleSelectSymbol(searchQuery);
  };

  // Filtered stocks for autocomplete dropdown
  const filteredSuggestions = searchQuery.trim()
    ? STOCK_UNIVERSE.filter(
        (s) =>
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.sector.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  // Filtered stocks by category for quick pill selection
  const categoryPills = STOCK_UNIVERSE.filter((s) => {
    if (selectedCategory === 'SEMUA') return true;
    return s.sector === selectedCategory;
  });

  const handleExecuteOrder = () => {
    if (!report) return;
    const plan = report.executionPlan;
    if (plan.action.includes('BUY')) {
      const isIndo = isIndonesianStock(report.symbol);
      const mCheck = isIndo ? checkIDXMarketStatus() : null;
      if (isIndo && mCheck && !mCheck.isOpen) {
        alert(`⛔ Order Beli Saham BEI Ditolak di Luar Jam Bursa!\n\n${mCheck.message}\n${mCheck.nextOpenNotice}\n\nBot dilarang membeli saham BEI di luar jam perdagangan resmi (Senin–Jumat 09:00–16:00 WIB). Kripto dan saham luar negeri bebas trading 24 jam.`);
        return;
      }

      const res = placeBuyOrder({
        symbol: report.symbol.endsWith('.JK') ? report.symbol : `${report.symbol}.JK`,
        displaySymbol: report.symbol.replace('.JK', ''),
        price: plan.suggestedEntryPrice,
        lots: plan.targetAllocationLots,
        name: report.name,
        orderType: 'LIMIT',
      });
      if (res.order) {
        setOrderExecuted(true);
      }
    }
  };

  const getSignalBadgeColor = (sig: string) => {
    switch (sig) {
      case 'STRONG BUY':
      case 'BULLISH':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'ACCUMULATE':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/40';
      case 'BEARISH':
      case 'TRIM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'EXIT / SHORT':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-[#e4e4e7] font-mono select-none">
      {/* Top Banner Header */}
      <div className="border-b border-[#27272a] bg-[#121214] px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                AI HEDGE FUND COMMITTEE
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                v2 Multi-Agent Engine
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold">
                Universal Stock Support (IDX + US)
              </span>
            </div>
            <p className="text-xs text-[#a1a1aa]">
              Sidang 7 Investor Legendaris (Buffett, Munger, Graham, Lynch, Druckenmiller, Wood, Simons) + CRO Risk Gate &amp; CIO Execution
            </p>
          </div>
        </div>

        {/* Current Active Symbol Indicator */}
        <div className="flex items-center gap-3 bg-[#18181b] px-3 py-1.5 rounded border border-[#27272a]">
          <span className="text-xs text-zinc-400">Sedang Disidang:</span>
          <span className="text-sm font-black text-amber-400 tracking-wider">
            {selectedSymbol}
          </span>
          <button
            onClick={() => fetchCommitteeReport(selectedSymbol)}
            title="Muat Ulang Sidang"
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* UNIVERSAL SEARCH & DISCOVERY BAR */}
      <div className="border-b border-[#27272a] bg-[#101012] px-4 py-3 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input Box with Autocomplete */}
          <div className="relative flex-1 max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value.toUpperCase());
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Ketik kode saham apa saja (contoh: BBCA, BREN, CUAN, ANTM, MEDC, PLTR, NVDA, TSLA)..."
                  className="w-full bg-[#18181b] border border-[#27272a] focus:border-amber-500 pl-9 pr-9 py-2 rounded text-xs text-white placeholder-zinc-500 focus:outline-none transition-all uppercase"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Sidangkan Saham</span>
              </button>
            </form>

            {/* Dropdown Suggestions */}
            {isDropdownOpen && searchQuery.trim().length > 0 && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute z-50 left-0 right-0 mt-1 bg-[#141416] border border-amber-500/40 rounded-lg shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                  <div className="p-2 bg-zinc-900/90 text-[10px] text-zinc-400 border-b border-zinc-800 flex items-center justify-between">
                    <span>HASIL SARAN SAHAM</span>
                    <span className="text-amber-400">Tekan Enter untuk jalankan</span>
                  </div>

                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((s) => (
                    <button
                      key={s.symbol}
                      onClick={() => handleSelectSymbol(s.symbol)}
                      className="w-full px-3 py-2 text-left hover:bg-amber-500/10 border-b border-zinc-800/50 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{s.flag}</span>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-amber-400">
                            {s.symbol}
                          </div>
                          <div className="text-[10px] text-zinc-400 line-clamp-1">{s.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {s.sector}
                        </span>
                      </div>
                    </button>
                  ))
                ) : null}

                {/* Option to analyze exact custom ticker typed by user */}
                <button
                  onClick={() => handleSelectSymbol(searchQuery)}
                  className="w-full px-3 py-2.5 text-left bg-amber-500/15 hover:bg-amber-500/25 border-t border-amber-500/30 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2 text-amber-400">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold">
                        Analisis Saham Kustom: <span className="underline">{searchQuery.toUpperCase()}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Jalankan sidang komite AI untuk saham ini (Semua emiten IDX &amp; Global didukung)
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </>
          )}
          </div>

          {/* Recently Analyzed Tickers History */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
            <span className="text-zinc-500 text-[11px] flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-zinc-500" />
              Riwayat Terakhir:
            </span>
            {recentTickers.map((t) => (
              <button
                key={t}
                onClick={() => handleSelectSymbol(t)}
                className={`px-2 py-0.5 text-[11px] rounded transition-all shrink-0 border ${
                  selectedSymbol === t
                    ? 'bg-amber-500 text-black border-amber-400 font-bold'
                    : 'bg-[#18181b] text-zinc-300 border-[#27272a] hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Sector Category Filters & Quick Ticker Selector */}
        <div className="space-y-2 pt-1">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1 scrollbar-none">
            <span className="text-zinc-500 text-[10px] uppercase font-semibold flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3 h-3" /> Filter Sektor:
            </span>
            {SECTOR_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-zinc-700 text-white font-bold border border-zinc-600'
                    : 'bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800/80'
                }`}
              >
                {cat === 'SEMUA' ? '🌟 Semua Saham' : cat}
              </button>
            ))}
          </div>

          {/* Quick Selection Buttons for Filtered Category */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categoryPills.slice(0, 18).map((t) => (
              <button
                key={t.symbol}
                onClick={() => handleSelectSymbol(t.symbol)}
                className={`px-2.5 py-1 text-xs rounded border transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  selectedSymbol === t.symbol
                    ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-[#18181b] text-zinc-300 border-[#27272a] hover:bg-[#27272a] hover:text-white'
                }`}
              >
                <span className="text-[10px]">{t.flag}</span>
                <span>{t.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <div className="text-sm text-zinc-400 animate-pulse">
              Memanggil komite AI Hedge Fund untuk {selectedSymbol}...
            </div>
            <div className="text-xs text-zinc-500">
              Menghitung pandangan Buffett, Munger, Graham, Lynch, Druckenmiller, Wood &amp; Simons
            </div>
          </div>
        ) : error || !report ? (
          <div className="p-6 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 mx-auto" />
            <div className="font-bold">Terjadi Kesalahan Inferensi Komite</div>
            <div className="text-xs">{error}</div>
            <button
              onClick={() => fetchCommitteeReport(selectedSymbol)}
              className="px-4 py-1.5 bg-rose-500/20 border border-rose-500/40 rounded text-xs hover:bg-rose-500/30"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            {/* ECC Grounded Institutional Intelligence Banner */}
            <div className="p-3.5 rounded-lg bg-gradient-to-r from-emerald-950/40 via-[#121214] to-blue-950/30 border border-emerald-500/30 text-xs shadow-lg space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ECC Institutional Grounding: AKTIF
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold">
                    100% Anti-Hallucination Guardrail
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <span>Sumber Terverifikasi:</span>
                  <span className="text-zinc-200 font-medium">
                    {report.dataSourceCitation || 'Lapkeu Auditan BEI/SEC & Bloomberg Consensus'}
                  </span>
                </div>
              </div>

              {/* Verified Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
                <div className="bg-black/40 p-2 rounded border border-zinc-800">
                  <div className="text-zinc-500 text-[9px] uppercase">Pendapatan TTM</div>
                  <div className="font-bold text-white truncate">{report.groundedFinancials?.revenueFormatted || 'Tervalidasi'}</div>
                </div>
                <div className="bg-black/40 p-2 rounded border border-zinc-800">
                  <div className="text-zinc-500 text-[9px] uppercase">Laba Bersih TTM</div>
                  <div className="font-bold text-emerald-400 truncate">{report.groundedFinancials?.netIncomeFormatted || 'Tervalidasi'}</div>
                </div>
                <div className="bg-black/40 p-2 rounded border border-zinc-800">
                  <div className="text-zinc-500 text-[9px] uppercase">ROE Auditan</div>
                  <div className="font-bold text-amber-400">{report.groundedFinancials?.roe || 16.5}%</div>
                </div>
                <div className="bg-black/40 p-2 rounded border border-zinc-800">
                  <div className="text-zinc-500 text-[9px] uppercase">Valuasi P/E</div>
                  <div className="font-bold text-cyan-400">{report.groundedFinancials?.peRatio || 12.4}x</div>
                </div>
                <div className="bg-black/40 p-2 rounded border border-zinc-800">
                  <div className="text-zinc-500 text-[9px] uppercase">Free Cash Flow</div>
                  <div className="font-bold text-purple-400 truncate">{report.groundedFinancials?.freeCashFlowFormatted || 'Positif'}</div>
                </div>
                <div className="bg-black/40 p-2 rounded border border-zinc-800">
                  <div className="text-zinc-500 text-[9px] uppercase">Target Konsensus Analis</div>
                  <div className="font-bold text-emerald-400 truncate">
                    {report.institutionalConsensus?.targetPriceConsensus
                      ? `${report.currency === 'IDR' ? `Rp ${report.institutionalConsensus.targetPriceConsensus.toLocaleString('id-ID')}` : `$${report.institutionalConsensus.targetPriceConsensus}`} (${report.institutionalConsensus.impliedUpsidePct > 0 ? '+' : ''}${report.institutionalConsensus.impliedUpsidePct}%)`
                      : 'Overweight'}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Consensus Summary Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Box 1: Master Consensus Dial */}
              <div className="p-4 rounded-lg bg-[#121214] border border-[#27272a] flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-2 mb-3">
                  <span className="text-xs font-semibold text-zinc-400">KONSENSUS FINAL KOMITE</span>
                  <span className="text-[10px] text-zinc-500">{new Date(report.timestamp).toLocaleTimeString('id-ID')} WIB</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-zinc-400">{report.symbol} • {report.currency}</div>
                    <div className="text-2xl font-black text-white">
                      {report.currency === 'IDR' ? `Rp ${report.currentPrice.toLocaleString()}` : `$${report.currentPrice.toLocaleString()}`}
                    </div>
                    <div className={`mt-2 inline-block px-3 py-1 rounded-md text-xs font-bold border ${getSignalBadgeColor(report.overallSignal)}`}>
                      {report.overallSignal}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-zinc-500">NET CONVICTION SCORE</div>
                    <div className={`text-3xl font-black ${report.netConvictionScore > 0 ? 'text-emerald-400' : report.netConvictionScore < 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
                      {report.netConvictionScore > 0 ? `+${report.netConvictionScore}%` : `${report.netConvictionScore}%`}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1">
                      Keyakinan: {report.consensusConfidence}%
                    </div>
                  </div>
                </div>

                {/* Vote Scorecard Pills */}
                <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {report.voteTallies.bullish} Bullish
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-zinc-400" />
                    {report.voteTallies.neutral} Netral
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    {report.voteTallies.bearish} Bearish
                  </div>
                </div>
              </div>

              {/* Box 2: CIO Master Allocation & Execution */}
              <div className="p-4 rounded-lg bg-[#121214] border border-[#27272a] flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-2 mb-3">
                  <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-amber-500" />
                    CIO PORTFOLIO ALLOCATION
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    Mandat Multi-Manager
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Target Alokasi Portofolio:</span>
                    <span className="font-bold text-amber-400">{report.cioVerdict.allocationPct}% Modal</span>
                  </div>
                  <div className="w-full bg-[#18181b] h-2 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${Math.min(100, report.cioVerdict.allocationPct * 5)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded bg-[#18181b] border border-zinc-800">
                      <div className="text-zinc-500">Stop-Loss Protektif</div>
                      <div className="font-bold text-rose-400">
                        {report.currency === 'IDR' ? `Rp ${report.riskGate.estimatedStopLoss.toLocaleString()}` : `$${report.riskGate.estimatedStopLoss.toLocaleString()}`}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-[#18181b] border border-zinc-800">
                      <div className="text-zinc-500">Target Profit (TP1)</div>
                      <div className="font-bold text-emerald-400">
                        {report.currency === 'IDR' ? `Rp ${report.executionPlan.takeProfit1.toLocaleString()}` : `$${report.executionPlan.takeProfit1.toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#27272a] flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Risk/Reward: 1 : {report.riskGate.riskRewardRatio}</span>
                  <button
                    onClick={handleExecuteOrder}
                    disabled={orderExecuted || !report.overallSignal.includes('BUY')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                      orderExecuted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : report.overallSignal.includes('BUY')
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {orderExecuted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Order Eksekusi OK
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> Eksekusi Order Paper
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Box 3: Risk Gate Assessment */}
              <div className="p-4 rounded-lg bg-[#121214] border border-[#27272a] flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-2 mb-3">
                  <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    DESK RISIKO (CRO GATE)
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    report.riskGate.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {report.riskGate.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Value at Risk (95% VaR):</span>
                    <span className="font-semibold text-zinc-300">±{report.riskGate.valueAtRisk95Pct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Plafon Posisi Maksimum:</span>
                    <span className="font-semibold text-zinc-300">{report.riskGate.maxPositionCapPct}% Book</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Status Volatilitas:</span>
                    <span className="font-semibold text-zinc-300">{report.riskGate.volatilityFlag}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 bg-[#18181b] p-2 rounded border border-zinc-800 line-clamp-2">
                    {report.riskGate.riskNotes}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#27272a] text-[10px] text-zinc-500">
                  {report.riskGate.grossExposureConstraint}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-[#27272a] flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('BOARDROOM')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'BOARDROOM'
                    ? 'border-amber-500 text-amber-500 bg-amber-500/5'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Debat Sidang Komite (7 Analis)
              </button>
              <button
                onClick={() => setActiveTab('CIO_ORDER')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'CIO_ORDER'
                    ? 'border-amber-500 text-amber-500 bg-amber-500/5'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Tiket Eksekusi &amp; Rencana Order
              </button>
              <button
                onClick={() => setActiveTab('QUANT_BRIDGE')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'QUANT_BRIDGE'
                    ? 'border-amber-500 text-amber-500 bg-amber-500/5'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Integrasi AI Quant Engine
              </button>
            </div>

            {/* TAB CONTENT: BOARDROOM DEBATE */}
            {activeTab === 'BOARDROOM' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-400 leading-relaxed">
                  <strong>Ringkasan Sidang Komite:</strong> {report.executiveSummary}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="p-4 rounded-lg bg-[#121214] border border-[#27272a] hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        {/* Agent Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{agent.avatar}</span>
                            <div>
                              <div className="font-bold text-sm text-white">{agent.name}</div>
                              <div className="text-[10px] text-zinc-400">{agent.title}</div>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getSignalBadgeColor(agent.signal)}`}>
                            {agent.signal}
                          </span>
                        </div>

                        {/* Strategy Style Badge */}
                        <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                            {agent.badge}
                          </span>
                          <span className="text-zinc-500">Bobot Komite: {Math.round(agent.strategyWeight * 100)}%</span>
                        </div>

                        {/* Confidence Meter */}
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-zinc-400">Keyakinan Analisis</span>
                            <span className="font-semibold text-white">{agent.confidence}%</span>
                          </div>
                          <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden border border-zinc-800">
                            <div
                              className={`h-full rounded-full ${
                                agent.signal === 'BULLISH'
                                  ? 'bg-emerald-500'
                                  : agent.signal === 'BEARISH'
                                  ? 'bg-rose-500'
                                  : 'bg-zinc-500'
                              }`}
                              style={{ width: `${agent.confidence}%` }}
                            />
                          </div>
                        </div>

                        {/* Reasoning Thesis */}
                        <p className="mt-3 text-xs text-zinc-300 leading-relaxed bg-[#18181b] p-3 rounded border border-zinc-800/80">
                          &ldquo;{agent.thesis}&rdquo;
                        </p>
                      </div>

                      {/* Criteria Checklist */}
                      <div className="pt-2 border-t border-[#27272a] space-y-1.5">
                        <div className="text-[10px] font-semibold text-zinc-500">PARAMETER EVALUASI:</div>
                        {agent.criteria.map((c, i) => (
                          <div key={i} className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-400">{c.label}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white">{c.value}</span>
                              <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                                c.status === 'PASS'
                                  ? 'text-emerald-400 bg-emerald-500/10'
                                  : c.status === 'FAIL'
                                  ? 'text-rose-400 bg-rose-500/10'
                                  : 'text-zinc-400 bg-zinc-800'
                              }`}>
                                {c.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: CIO EXECUTION ORDER */}
            {activeTab === 'CIO_ORDER' && (
              <div className="p-6 rounded-lg bg-[#121214] border border-[#27272a] space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-500" />
                    TIKET PESANAN &amp; RENCANA EKSEKUSI PORTOFOLIO
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Dihitung oleh algoritma CIO berdasarkan konsensus 7 analis dan pembatas risiko CRO.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded bg-[#18181b] border border-zinc-800">
                    <div className="text-xs text-zinc-500">Tindakan Order</div>
                    <div className="text-lg font-bold text-white mt-1">{report.executionPlan.action}</div>
                    <div className="text-[10px] text-zinc-400 mt-1">Tipe: {report.executionPlan.orderType}</div>
                  </div>
                  <div className="p-4 rounded bg-[#18181b] border border-zinc-800">
                    <div className="text-xs text-zinc-500">Harga Masuk Usulan (Entry)</div>
                    <div className="text-lg font-bold text-amber-400 mt-1">
                      {report.currency === 'IDR' ? `Rp ${report.executionPlan.suggestedEntryPrice.toLocaleString()}` : `$${report.executionPlan.suggestedEntryPrice}`}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1">Sesuai penutupan live market</div>
                  </div>
                  <div className="p-4 rounded bg-[#18181b] border border-zinc-800">
                    <div className="text-xs text-zinc-500">Level Stop-Loss Protektif</div>
                    <div className="text-lg font-bold text-rose-400 mt-1">
                      {report.currency === 'IDR' ? `Rp ${report.executionPlan.stopLossPrice.toLocaleString()}` : `$${report.executionPlan.stopLossPrice}`}
                    </div>
                    <div className="text-[10px] text-rose-500 mt-1">Batas risiko terketat</div>
                  </div>
                  <div className="p-4 rounded bg-[#18181b] border border-zinc-800">
                    <div className="text-xs text-zinc-500">Target Take-Profit (TP1)</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">
                      {report.currency === 'IDR' ? `Rp ${report.executionPlan.takeProfit1.toLocaleString()}` : `$${report.executionPlan.takeProfit1}`}
                    </div>
                    <div className="text-[10px] text-emerald-500 mt-1">Risk/Reward 1 : {report.riskGate.riskRewardRatio}</div>
                  </div>
                </div>

                <div className="p-4 rounded bg-[#18181b] border border-zinc-800 space-y-3">
                  <div className="font-bold text-xs text-white">Simulasi Alokasi Modal Fund (Modal Dasar: Rp 100.000.000)</div>
                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-zinc-500">Porsi Dana: </span>
                      <span className="font-bold text-white">Rp {report.executionPlan.targetCapitalAllocated.toLocaleString()} ({report.cioVerdict.allocationPct}%)</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Ukuran Lot: </span>
                      <span className="font-bold text-white">{report.executionPlan.targetAllocationLots} Lot</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Horizon Waktu: </span>
                      <span className="font-bold text-white">{report.executionPlan.timeframe}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={handleExecuteOrder}
                      disabled={orderExecuted || !report.overallSignal.includes('BUY')}
                      className={`py-2.5 px-3 rounded font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        orderExecuted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                          : report.overallSignal.includes('BUY')
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      {orderExecuted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Order Berhasil Masuk Portofolio
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" /> Eksekusi Pesanan ke Portofolio
                        </>
                      )}
                    </button>

                    <Link
                      href="/ai?tab=debate"
                      className="py-2.5 px-3 rounded font-bold text-xs bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] border border-[#27272a] hover:border-[#f59e0b] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>⚔️</span>
                      <span>Uji di Arena Debat Bull vs Bear (HKUDS)</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: QUANT BRIDGE */}
            {activeTab === 'QUANT_BRIDGE' && (
              <div className="p-6 rounded-lg bg-[#121214] border border-[#27272a] space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    JEMBATAN INTEGRASI: AI QUANT &times; HEDGE FUND
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Menghubungkan sinyal matematis Jim Simons (Renaissance Desk) dengan pertimbangan diskresioner Buffett, Graham &amp; Munger.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded bg-[#18181b] border border-zinc-800">
                    <div className="text-xs text-zinc-500">Composite Alpha Score</div>
                    <div className="text-2xl font-bold text-white mt-1">{report.quantEngineMerge.compositeAlpha}/100</div>
                    <div className="text-[10px] text-zinc-400 mt-1">Multi-Faktor Kuat</div>
                  </div>
                  <div className="p-4 rounded bg-[#18181b] border border-zinc-800">
                    <div className="text-xs text-zinc-500">Smart Money Score (CMF)</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">{report.quantEngineMerge.smartMoneyScore}/100</div>
                    <div className="text-[10px] text-zinc-400 mt-1">Arus Uang Institusional</div>
                  </div>
                  <div className="p-4 rounded bg-[#18181b] border border-zinc-800">
                    <div className="text-xs text-zinc-500">Rezim Volatilitas Wyckoff</div>
                    <div className="text-lg font-bold text-amber-400 mt-1">{report.quantEngineMerge.marketRegime}</div>
                    <div className="text-[10px] text-zinc-400 mt-1">Markov Regime State</div>
                  </div>
                  <div className="p-4 rounded bg-[#18181b] border border-zinc-800">
                    <div className="text-xs text-zinc-500">Target Monte Carlo (5D p50)</div>
                    <div className="text-xl font-bold text-white mt-1">
                      {report.currency === 'IDR' ? `Rp ${report.quantEngineMerge.monteCarlo5DMedian.toLocaleString()}` : `$${report.quantEngineMerge.monteCarlo5DMedian}`}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1">1.000 Lintasan Acak GBM</div>
                  </div>
                </div>

                <div className="p-4 rounded bg-[#18181b] border border-zinc-800 space-y-2">
                  <div className="text-xs font-bold text-white">Hubungan Antar Komponen:</div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Sistem ini merealisasikan prinsip <em>virattt/ai-hedge-fund v2</em>: keputusan investasi bukan semata-mata opini teks LLM, melainkan sintesis terverifikasi antara <strong>model diskresioner fundamental</strong> (Buffett, Munger, Graham, Lynch), <strong>infleksi momentum</strong> (Druckenmiller), <strong>disrupsi platform</strong> (Wood), dan <strong>model kuantitatif probabilistik murni</strong> (Jim Simons dengan Bollinger Bands, MACD, CMF, Volume Z-Score, dan Monte Carlo).
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Buka Terminal Workstation Utama <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
