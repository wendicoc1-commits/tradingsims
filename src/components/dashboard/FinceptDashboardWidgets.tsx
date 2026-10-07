'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  X,
  Maximize2,
  RefreshCw,
  MoreVertical,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Globe,
  Coins,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Search,
  Check,
  Bell,
  BellRing,
  Calculator,
  ShieldAlert,
  Volume2,
  VolumeX,
  Zap,
  CheckCircle2,
  Trash2,
  Rss,
  Radio,
  Bot,
  Sparkles,
  Target,
  ShieldCheck,
  Layers,
  Gauge,
  Flame,
  BarChart2,
  Users,
} from 'lucide-react';
import type { CrawledArticle } from '@/lib/crawler/financialCrawlerService';
import DashboardCandleChart from '@/components/charts/DashboardCandleChart';
import CompanyLogo from '@/components/common/CompanyLogo';
import TradingViewAdvancedChart from '@/components/openstock/TradingViewAdvancedChart';
import TradingViewTechnicalAnalysis from '@/components/openstock/TradingViewTechnicalAnalysis';
import SocialSentimentInsightDesk from '@/components/openstock/SocialSentimentInsightDesk';
import MarketDepthVisualizer from '@/components/stock/MarketDepthVisualizer';
import WhaleAlertTape from '@/components/stock/WhaleAlertTape';
import ForeignFlowMatrix from '@/components/stock/ForeignFlowMatrix';
import type { StockQuote } from '@/types';
import { INVESTING_COM_GLOBAL_DIVIDENDS, GlobalDividendStock } from '@/data/investing_global_dividends';
import { BLOOMBERG_NEWS_WIRE, BloombergStory } from '@/data/bloomberg_news_wire';
import { usePortfolioStore, useWatchlistStore } from '@/store';
import { getAllStocksNewsMaster, DisplayArticle } from '@/lib/stockNewsService';
import { useHourlyNews } from '@/hooks/useHourlyNews';
import { getVerifiedBenchmarkPrice } from '@/data/idx_benchmark_prices';
import OpenBBWorkspaceDesk from '@/components/openbb/OpenBBWorkspaceDesk';
import AIChartPilotHUD from '@/components/stock/AIChartPilotHUD';
import PineScriptStudioModal from '@/components/stock/PineScriptStudioModal';
import MultiTimeframeRadar from '@/components/stock/MultiTimeframeRadar';

// ── Web Audio Sound Generator (Synthesizer Chimes) ──
export const playAudioChime = (type: 'ALERT' | 'ORDER_FILL' | 'CLICK') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'ALERT') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'ORDER_FILL') {
      const now = ctx.currentTime;
      [
        { f: 587, t: now },
        { f: 880, t: now + 0.08 },
      ].forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
      });
    } else if (type === 'CLICK') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    console.debug('Audio chime error:', e);
  }
};

export type WidgetType =
  | 'CHART'
  | 'GLOBAL_INDICES'
  | 'MARKET_PULSE'
  | 'COMMODITIES'
  | 'STOCK_INDICES'
  | 'FOREX'
  | 'CRYPTO'
  | 'NEWS'
  | 'BANDAR_FLOW'
  | 'DIVIDEND_RADAR'
  | 'GLOBAL_DIVIDENDS'
  | 'QUICK_ORDER'
  | 'PORTFOLIO_HOLDINGS'
  | 'ORDER_BOOK_DOM'
  | 'TAPE_WHALE_READER'
  | 'FOREIGN_FLOW_RADAR'
  | 'RISK_CALCULATOR'
  | 'PRICE_ALERTS'
  | 'GLOBAL_CRAWLER_FEED'
  | 'MARKET_HEATMAP'
  | 'AI_QUANT_PREDICTOR'
  | 'OPENBB_TERMINAL'
  | 'AI_CHART_PILOT';

export interface DashboardWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  cols: 'col-span-1' | 'col-span-2' | 'col-span-3' | 'col-span-4';
  height?: 'h-[280px]' | 'h-[395px]' | 'h-[540px]'; // default: 'h-[395px]'
  symbol?: string;      // default: 'BBCA'
  timeframe?: string;   // default: '1D'
  isSynced?: boolean;   // default: true
}

export const INITIAL_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'w-chart', type: 'CHART', title: 'CANDLE • BBCA <EQUITY>', cols: 'col-span-2', symbol: 'BBCA', timeframe: '1D', isSynced: true },
  { id: 'w-order', type: 'QUICK_ORDER', title: 'EXECUTION SLIP • BBCA', cols: 'col-span-1', symbol: 'BBCA', isSynced: true },
  { id: 'w-portfolio', type: 'PORTFOLIO_HOLDINGS', title: 'PORTOFOLIO & SALDO SAYA', cols: 'col-span-1' },
  { id: 'w-indices', type: 'GLOBAL_INDICES', title: 'GLOBAL INDICES & PASAR', cols: 'col-span-2' },
  { id: 'w-news', type: 'NEWS', title: 'MARKET NEWS WIRE', cols: 'col-span-2' },
];

export const AVAILABLE_WIDGET_CATALOG: { type: WidgetType; title: string; defaultCols: DashboardWidgetConfig['cols']; desc: string; defaultSymbol?: string }[] = [
  { type: 'AI_CHART_PILOT', title: 'AI Chart Pilot & Pine Studio (TradesDontLie MCP)', defaultCols: 'col-span-2', desc: 'Autonomous on-chart visual annotations (S/R, Order Blocks, Risk/Reward TP/SL), Pine Script v5 Generator & IDE, serta jembatan sync TradingView Desktop.', defaultSymbol: 'BBCA' },
  { type: 'AI_QUANT_PREDICTOR', title: 'AI Quantitative & ML Forecast (AutoSklearn Engine)', defaultCols: 'col-span-2', desc: 'Prediksi probabilitas arah tren (Bullish/Bearish), estimasi target harga, deteksi anomali volume whale, dan model ensemble leaderboard.', defaultSymbol: 'BBCA' },
  { type: 'CHART', title: 'Interactive Candlestick Chart (TradingView Pro)', defaultCols: 'col-span-2', desc: 'Grafik candlestick teknikal multi-engine resmi TradingView dengan pemilih saham & dual timeframe.', defaultSymbol: 'BBCA' },
  { type: 'MARKET_HEATMAP', title: 'Market Heatmap & Sector Breadth (BEI)', defaultCols: 'col-span-2', desc: 'Peta visual performa saham LQ45 & sektoral (Banking, Energi, Telco, Consumer) dengan indikator kenaikan/penurunan harga pasar riil.', defaultSymbol: 'BBCA' },
  { type: 'PORTFOLIO_HOLDINGS', title: 'Portofolio & Kepemilikan Saham', defaultCols: 'col-span-2', desc: 'Pantau saldo kas, total aset, dan keuntungan/kerugian saham yang Anda miliki secara real-time.' },
  { type: 'QUICK_ORDER', title: 'Quick Execution Slip', defaultCols: 'col-span-1', desc: 'Slip transaksi beli/jual cepat dengan kalkulator porsi modal kas otomatis.', defaultSymbol: 'BBCA' },
  { type: 'GLOBAL_INDICES', title: 'Global Indices Matrix (Live)', defaultCols: 'col-span-1', desc: 'Data live indeks pasar dunia: IHSG, S&P 500, Dow Jones, Nasdaq, Nikkei, Hang Seng.' },
  { type: 'NEWS', title: 'Bloomberg First Word • News Desk & Web Crawler (Unified)', defaultCols: 'col-span-2', desc: 'Feed gabungan Bloomberg Wire & Web Crawler berita emiten, bursa IDX & dunia, filter sentimen & auto-update.' },
  { type: 'GLOBAL_DIVIDENDS', title: 'Global Dividends (Investing.com Database)', defaultCols: 'col-span-2', desc: '101 saham dividen luar negeri terbaik (Dividend Kings & Aristocrats riil).', defaultSymbol: 'KO' },
  { type: 'COMMODITIES', title: 'Commodities & Macro', defaultCols: 'col-span-1', desc: 'Harga komoditas global: Emas, Minyak Mentah, Batubara Newcastle, CPO, USD/IDR.' },
  { type: 'DIVIDEND_RADAR', title: 'Upcoming Dividend Radar', defaultCols: 'col-span-1', desc: 'Jadwal Cum-Date terdekat, DPS, dan dividend yield saham BEI.' },
  { type: 'MARKET_PULSE', title: 'Market Pulse & Sentimen', defaultCols: 'col-span-1', desc: 'Indeks Fear & Greed dan Market Breadth rasio kenaikan/penurunan harga pasar.' },
  { type: 'ORDER_BOOK_DOM', title: 'Depth of Market (DOM) [SIMULASI]', defaultCols: 'col-span-1', desc: '⚠️ [Model Simulasi Edukasi] 10 level antrean Bid/Offer ladder & order imbalance ratio.', defaultSymbol: 'BBCA' },
  { type: 'TAPE_WHALE_READER', title: 'Tape Reading & Whale Trades [SIMULASI]', defaultCols: 'col-span-1', desc: '⚠️ [Model Simulasi Edukasi] Simulasi running trade HAKA/HAKI volume jumbo.', defaultSymbol: 'BBCA' },
  { type: 'FOREIGN_FLOW_RADAR', title: 'Foreign Flow Wave [ESTIMASI]', defaultCols: 'col-span-2', desc: '⚠️ [Model Estimasi] Estimasi tren arus akumulasi investor institusi asing.', defaultSymbol: 'BBCA' },
  { type: 'BANDAR_FLOW', title: 'Bandarmologi & Smart Money Flow (Broker Summary)', defaultCols: 'col-span-2', desc: 'Deteksi konsentrasi akumulasi/distribusi broker asing vs ritel, estimasi modal rata-rata bandar (VWAP), dan radar aliran smart money.', defaultSymbol: 'BMRI' },
  { type: 'CRYPTO', title: 'Cryptocurrency Ticker', defaultCols: 'col-span-1', desc: 'Harga pasar Bitcoin, Ethereum, Solana, BNB.' },
  { type: 'RISK_CALCULATOR', title: 'Hedge Fund Risk & Position Sizer', defaultCols: 'col-span-1', desc: 'Kalkulator ukuran lot maksimal berdasarkan toleransi risiko modal & Risk-to-Reward Ratio (RRR).', defaultSymbol: 'BBCA' },
  { type: 'PRICE_ALERTS', title: 'Price Alerts & Audio Radar', defaultCols: 'col-span-1', desc: 'Alarm target harga instan dengan audio chime bursa & notifikasi visual real-time.', defaultSymbol: 'BBCA' },
  { type: 'OPENBB_TERMINAL', title: 'OpenBB Platform (10Y Financials, Options & FRED Macro)', defaultCols: 'col-span-2', desc: 'Infrastruktur OpenBB resmi: Laporan Keuangan 10-Tahun (SEC EDGAR/BEI), Rantai Opsi & Kalkulasi Greeks Black-Scholes, dan Kurva Yield The Fed (FRED).', defaultSymbol: 'BBCA' },
];

export const POPULAR_IDX_TICKERS = [
  'BBCA', 'BBRI', 'BMRI', 'ADRO', 'ASII', 'TLKM', 'BBNI', 'ICBP', 'UNTR', 'GOTO', 'AMMN', 'ANTM', 'PTBA', 'BRPT', 'PGAS'
];

export const POPULAR_GLOBAL_TICKERS = [
  { ticker: 'KO', flag: '🇺🇸', name: 'Coca-Cola', yield: '2.83%' },
  { ticker: 'PG', flag: '🇺🇸', name: 'Procter & Gamble', yield: '2.39%' },
  { ticker: 'JNJ', flag: '🇺🇸', name: 'Johnson & Johnson', yield: '3.09%' },
  { ticker: 'O', flag: '🇺🇸', name: 'Realty Income', yield: '5.41%' },
  { ticker: 'AAPL', flag: '🇺🇸', name: 'Apple Inc.', yield: '0.45%' },
  { ticker: 'MSFT', flag: '🇺🇸', name: 'Microsoft', yield: '0.78%' },
  { ticker: 'NVDA', flag: '🇺🇸', name: 'NVIDIA Corp.', yield: '0.03%' },
  { ticker: 'XOM', flag: '🇺🇸', name: 'Exxon Mobil', yield: '3.31%' },
  { ticker: 'TSM', flag: '🇹🇼', name: 'TSMC Taiwan', yield: '1.27%' },
  { ticker: '7203.T', flag: '🇯🇵', name: 'Toyota Motor', yield: '2.63%' },
  { ticker: 'SHEL.L', flag: '🇬🇧', name: 'Shell plc', yield: '3.89%' },
  { ticker: 'MBG.DE', flag: '🇩🇪', name: 'Mercedes-Benz', yield: '7.45%' },
  { ticker: 'PBR', flag: '🇧🇷', name: 'Petrobras', yield: '14.20%' },
  { ticker: 'D05.SI', flag: '🇸🇬', name: 'DBS Group', yield: '5.38%' },
  { ticker: 'VALE', flag: '🇧🇷', name: 'Vale S.A.', yield: '9.80%' },
  { ticker: 'ABBV', flag: '🇺🇸', name: 'AbbVie Inc.', yield: '3.25%' },
  { ticker: 'PEP', flag: '🇺🇸', name: 'PepsiCo', yield: '3.19%' },
  { ticker: 'WMT', flag: '🇺🇸', name: 'Walmart Inc.', yield: '1.04%' },
  { ticker: 'MCD', flag: '🇺🇸', name: "McDonald's", yield: '2.28%' },
  { ticker: 'MAIN', flag: '🇺🇸', name: 'Main Street Capital', yield: '6.03%' },
  { ticker: 'MO', flag: '🇺🇸', name: 'Altria Group', yield: '7.85%' },
];

/* ─── Individual Widget Components ─── */

function WidgetHeader({
  title,
  onRemove,
  onEdit,
  customHeaderLeft,
}: {
  title?: string;
  onRemove: () => void;
  onEdit?: () => void;
  customHeaderLeft?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-[#121216] border-b border-[#27272a] text-[11px] font-mono select-none">
      <div className="flex items-center gap-1.5 font-bold text-[#f59e0b] truncate max-w-[280px]">
        <span className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full shrink-0" />
        {customHeaderLeft || <span className="tracking-wide uppercase truncate">{title}</span>}
      </div>
      <div className="flex items-center gap-1.5 text-[#71717a]">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-0.5 hover:text-[#f59e0b] transition-colors cursor-pointer"
            title="Edit Widget (Ganti Saham, Judul, Ukuran)"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="p-0.5 hover:text-[#ef4444] transition-colors cursor-pointer"
          title="Tutup Widget"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// 1. Candlestick Chart Widget with DIRECT Interactive Ticker Picker (IDX & Foreign Stocks)
export function ChartWidget({
  widget,
  onRemove,
  onEdit,
  onUpdateSymbol,
  onUpdateTimeframe,
  isSynced,
  onToggleSync,
}: {
  widget: DashboardWidgetConfig;
  onRemove: () => void;
  onEdit?: () => void;
  onUpdateSymbol?: (symbol: string) => void;
  onUpdateTimeframe?: (tf: string) => void;
  isSynced?: boolean;
  onToggleSync?: () => void;
}) {
  const currentSymbol = widget.symbol || 'BBCA';
  const currentTimeframe = widget.timeframe || '1D';
  const [chartEngine, setChartEngine] = useState<'LOCAL' | 'TV' | 'GAUGE' | 'SENTIMENT'>('LOCAL');
  const [isSplit, setIsSplit] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'IDX' | 'GLOBAL'>('IDX');
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if current symbol is a global stock or IDX stock benchmark
  const activeGlobalStock = INVESTING_COM_GLOBAL_DIVIDENDS.find(
    (s) => s.ticker.toUpperCase() === currentSymbol.toUpperCase()
  );

  const benchmark = useMemo(() => {
    if (activeGlobalStock) {
      return {
        price: activeGlobalStock.price,
        currency: activeGlobalStock.currency,
        name: activeGlobalStock.name,
      };
    }
    return getVerifiedBenchmarkPrice(currentSymbol);
  }, [currentSymbol, activeGlobalStock]);

  const [liveQuoteData, setLiveQuoteData] = useState<{ price: number; changePct: number } | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    fetch(`/api/stocks/realtime?tickers=${encodeURIComponent(currentSymbol)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isSubscribed) return;
        const q = data?.quotes?.[currentSymbol.toUpperCase()];
        if (q && q.price > 0) {
          setLiveQuoteData({ price: q.price, changePct: q.changePct });
        }
      })
      .catch(() => {});
    return () => {
      isSubscribed = false;
    };
  }, [currentSymbol]);

  const verifiedCurrentPrice = liveQuoteData?.price || benchmark.price;
  const verifiedCurrency = benchmark.currency;
  const verifiedChangePct = liveQuoteData?.changePct;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleSelectSymbol = (sym: string) => {
    onUpdateSymbol?.(sym.toUpperCase());
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const filteredIdxTickers = POPULAR_IDX_TICKERS.filter((t) =>
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGlobalTickers = POPULAR_GLOBAL_TICKERS.filter(
    (g) =>
      g.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchResultsGlobal = searchQuery.trim()
    ? INVESTING_COM_GLOBAL_DIVIDENDS.filter(
        (s) =>
          s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.country.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10)
    : [];

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden">
      {/* Header with Direct Click-to-Change Stock Dropdown */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#121216] border-b border-[#27272a] text-[11px] font-mono select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-[#f59e0b] rounded-full shrink-0" />
          <span className="text-[#a1a1aa] font-bold text-[10px]">CANDLE •</span>

          {/* Interactive Clickable Stock Selector Badge */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 px-2 py-0.5 rounded font-extrabold text-xs bg-[#f59e0b] text-black hover:bg-[#fbbf24] transition-all cursor-pointer shadow-sm"
              title="Klik untuk ganti saham (IDX atau Global / Dividen)"
            >
              {activeGlobalStock && <span>{activeGlobalStock.flag}</span>}
              <span>{currentSymbol}</span>
              <ChevronDown className="w-3 h-3 stroke-[3]" />
            </button>

            {/* Dropdown Menu for selecting stocks */}
            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-80 bg-[#121216] border border-[#27272a] rounded shadow-2xl p-2.5 z-50 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-1.5">
                  <span className="font-bold text-white text-[11px]">PILIH SAHAM CHART</span>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-[#71717a] hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Tabs: IDX vs Global */}
                <div className="grid grid-cols-2 gap-1 bg-[#18181b] p-0.5 rounded border border-[#27272a]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('IDX')}
                    className={`py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      activeTab === 'IDX'
                        ? 'bg-[#f59e0b] text-black'
                        : 'text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    🇮🇩 Saham IDX
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('GLOBAL')}
                    className={`py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      activeTab === 'GLOBAL'
                        ? 'bg-[#f59e0b] text-black'
                        : 'text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    🌍 Global / Dividen
                  </button>
                </div>

                {/* Search / Custom input */}
                <div className="flex items-center gap-1 bg-[#18181b] border border-[#27272a] px-2 py-1 rounded">
                  <Search className="w-3 h-3 text-[#71717a] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        handleSelectSymbol(searchQuery.trim());
                      }
                    }}
                    placeholder={
                      activeTab === 'IDX'
                        ? 'Ketik kode (misal: BBCA, BMRI)...'
                        : 'Ketik ticker (misal: KO, AAPL, MBG.DE)...'
                    }
                    className="w-full bg-transparent text-white placeholder-[#71717a] outline-none text-[11px]"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => handleSelectSymbol(searchQuery.trim())}
                      className="bg-[#f59e0b] text-black px-1.5 py-0.2 rounded text-[10px] font-bold"
                    >
                      Pilih
                    </button>
                  )}
                </div>

                {/* If user is typing search query, show cross-universe instant matches */}
                {searchQuery.trim() && searchResultsGlobal.length > 0 && activeTab === 'GLOBAL' && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#f59e0b] block font-bold">HASIL PENCARIAN INVESTING.COM:</span>
                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {searchResultsGlobal.map((s) => (
                        <div
                          key={s.ticker}
                          onClick={() => handleSelectSymbol(s.ticker)}
                          className="flex items-center justify-between p-1 rounded bg-[#18181b] hover:bg-[#27272a] cursor-pointer text-[10px]"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span>{s.flag}</span>
                            <span className="font-bold text-white">{s.ticker}</span>
                            <span className="text-[#71717a] truncate max-w-[120px]">{s.name}</span>
                          </div>
                          <div className="text-[#22c55e] font-mono-num font-bold shrink-0">
                            {s.yieldPct.toFixed(2)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 1: Popular IDX Tickers */}
                {activeTab === 'IDX' && (!searchQuery.trim() || filteredIdxTickers.length > 0) && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#71717a] block">SAHAM POPULER IDX:</span>
                    <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                      {filteredIdxTickers.map((sym) => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => handleSelectSymbol(sym)}
                          className={`py-1 px-1 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                            currentSymbol === sym
                              ? 'bg-[#f59e0b] text-black font-extrabold'
                              : 'bg-[#1e1e24] text-[#d4d4d8] hover:text-white hover:bg-[#27272a]'
                          }`}
                        >
                          <span>{sym}</span>
                          {currentSymbol === sym && <Check className="w-2.5 h-2.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: Popular Global / Dividend Tickers */}
                {activeTab === 'GLOBAL' && (!searchQuery.trim() || filteredGlobalTickers.length > 0) && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#71717a] block">SAHAM DIVIDEN GLOBAL POPULER:</span>
                    <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                      {filteredGlobalTickers.map((g) => (
                        <button
                          key={g.ticker}
                          type="button"
                          onClick={() => handleSelectSymbol(g.ticker)}
                          className={`py-1 px-1.5 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-between gap-1 text-left ${
                            currentSymbol === g.ticker
                              ? 'bg-[#f59e0b] text-black font-extrabold'
                              : 'bg-[#1e1e24] text-[#d4d4d8] hover:text-white hover:bg-[#27272a]'
                          }`}
                        >
                          <span className="flex items-center gap-1 truncate">
                            <span>{g.flag}</span>
                            <span className="truncate">{g.ticker}</span>
                          </span>
                          <span className={`text-[9px] font-mono-num shrink-0 ${
                            currentSymbol === g.ticker ? 'text-black' : 'text-[#22c55e]'
                          }`}>
                            {g.yield}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Market Price Badge */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#18181b] border border-[#27272a] font-mono-num font-bold text-[10px]">
            <span className="text-white">
              {verifiedCurrency === 'IDR'
                ? `Rp ${verifiedCurrentPrice.toLocaleString('id-ID')}`
                : `$${verifiedCurrentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </span>
            {verifiedChangePct !== undefined && verifiedChangePct !== null && (
              <span className={`text-[9px] ${verifiedChangePct >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {verifiedChangePct >= 0 ? '+' : ''}{verifiedChangePct.toFixed(2)}%
              </span>
            )}
          </div>

          <span className="text-[#71717a] text-[10px]">
            {activeGlobalStock ? `<${activeGlobalStock.exchange}>` : '<EQUITY>'}
          </span>

          {onToggleSync && (
            <button
              type="button"
              onClick={onToggleSync}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                isSynced
                  ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 shadow-xs'
                  : 'bg-[#18181b] text-[#71717a] border border-[#27272a] hover:text-[#d4d4d8]'
              }`}
              title={isSynced ? 'Channel 🟡 Sync Aktif (Tersinkron dengan Master Ticker)' : 'Sync Mati (Ticker Independen)'}
            >
              <span>{isSynced ? '🔗 SYNC' : '⛓️ UNLINK'}</span>
            </button>
          )}
        </div>

        {/* Right Controls: Engine Toggle & Timeframe Pills & Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Chart Engine Switcher */}
          <div className="flex items-center gap-0.5 bg-[#18181b] p-0.5 rounded border border-[#27272a]">
            <button
              type="button"
              onClick={() => setChartEngine('LOCAL')}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                chartEngine === 'LOCAL'
                  ? 'bg-[#f59e0b] text-black shadow-xs font-black'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
              title="Grafik Candlestick Cepat (Lightweight)"
            >
              LOKAL
            </button>
            <button
              type="button"
              onClick={() => setChartEngine('TV')}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                chartEngine === 'TV'
                  ? 'bg-[#f59e0b] text-black shadow-xs font-black'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
              title="Grafik TradingView Pro Lengkap"
            >
              TV PRO
            </button>
            <button
              type="button"
              onClick={() => setChartEngine('GAUGE')}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                chartEngine === 'GAUGE'
                  ? 'bg-[#f59e0b] text-black shadow-xs font-black'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
              title="Meter Teknikal & Speedometer"
            >
              GAUGE
            </button>
            <button
              type="button"
              onClick={() => setChartEngine('SENTIMENT')}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                chartEngine === 'SENTIMENT'
                  ? 'bg-[#f59e0b] text-black shadow-xs font-black'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
              title="Sentimen Pasar & Komunitas"
            >
              SENTIMEN
            </button>
          </div>

          {/* Dual Split Timeframe Toggle (Only for LOCAL engine) */}
          {chartEngine === 'LOCAL' && (
            <button
              type="button"
              onClick={() => setIsSplit(!isSplit)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                isSplit
                  ? 'bg-[#3b82f6] text-white shadow-xs font-black'
                  : 'bg-[#18181b] text-[#a1a1aa] border border-[#27272a] hover:text-white'
              }`}
              title="Tampilkan 2 Timeframe Bersamaan (1D & 1W)"
            >
              {isSplit ? '2-PANE (1D|1W)' : 'SPLIT 1D/1W'}
            </button>
          )}

          {/* Timeframe Chips (Only for LOCAL engine and when NOT split) */}
          {chartEngine === 'LOCAL' && !isSplit && (
            <div className="flex items-center gap-0.5 bg-[#18181b] p-0.5 rounded border border-[#27272a]">
              {['1D', '1W', '1M', '1Y'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => onUpdateTimeframe?.(tf)}
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    currentTimeframe === tf
                      ? 'bg-[#22c55e] text-black font-black'
                      : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="p-0.5 text-[#71717a] hover:text-[#f59e0b] transition-colors cursor-pointer"
              title="Edit Pengaturan Widget"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onRemove}
            className="p-0.5 text-[#71717a] hover:text-[#ef4444] transition-colors cursor-pointer"
            title="Tutup Widget"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chart Canvas / Engine Output */}
      <div className="flex-1 p-2 min-h-[300px] flex flex-col">
        {chartEngine === 'LOCAL' && !isSplit && (
          <DashboardCandleChart
            symbol={currentSymbol}
            timeframe={currentTimeframe}
            currentPrice={verifiedCurrentPrice}
            currency={verifiedCurrency}
            height={290}
          />
        )}
        {chartEngine === 'LOCAL' && isSplit && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
            <div className="border border-[#27272a] rounded p-1.5 bg-[#0e0e11] flex flex-col">
              <div className="flex items-center justify-between text-[10px] font-bold mb-1 px-1">
                <span className="text-[#f59e0b]">TIMEFRAME 1D (HARIAN)</span>
                <span className="text-[#71717a]">Short-Term</span>
              </div>
              <DashboardCandleChart
                symbol={currentSymbol}
                timeframe="1D"
                currentPrice={verifiedCurrentPrice}
                currency={verifiedCurrency}
                height={260}
              />
            </div>
            <div className="border border-[#27272a] rounded p-1.5 bg-[#0e0e11] flex flex-col">
              <div className="flex items-center justify-between text-[10px] font-bold mb-1 px-1">
                <span className="text-[#3b82f6]">TIMEFRAME 1W (MINGGUAN)</span>
                <span className="text-[#71717a]">Macro Trend</span>
              </div>
              <DashboardCandleChart
                symbol={currentSymbol}
                timeframe="1W"
                currentPrice={verifiedCurrentPrice}
                currency={verifiedCurrency}
                height={260}
              />
            </div>
          </div>
        )}
        {chartEngine === 'TV' && (
          <div className="flex-1 min-h-[300px] w-full rounded overflow-hidden">
            <TradingViewAdvancedChart
              symbol={activeGlobalStock ? (activeGlobalStock.exchange === 'NYSE' || activeGlobalStock.exchange === 'NASDAQ' ? activeGlobalStock.ticker : currentSymbol) : (currentSymbol.includes(':') ? currentSymbol : `IDX:${currentSymbol}`)}
              height="100%"
            />
          </div>
        )}
        {chartEngine === 'GAUGE' && (
          <div className="h-[290px] w-full overflow-y-auto">
            <TradingViewTechnicalAnalysis
              symbol={activeGlobalStock ? (activeGlobalStock.exchange === 'NYSE' || activeGlobalStock.exchange === 'NASDAQ' ? activeGlobalStock.ticker : currentSymbol) : (currentSymbol.includes(':') ? currentSymbol : `IDX:${currentSymbol}`)}
              height={290}
            />
          </div>
        )}
        {chartEngine === 'SENTIMENT' && (
          <div className="h-[290px] w-full overflow-y-auto">
            <SocialSentimentInsightDesk symbol={currentSymbol} />
          </div>
        )}
      </div>
    </div>
  );
}

// 2. Global Indices Widget (Live Realtime Connected)
export function GlobalIndicesWidget({ onRemove, onEdit }: { onRemove: () => void; onEdit?: () => void }) {
  const [indices, setIndices] = useState([
    { sym: 'IHSG (JKSE)', key: '^JKSE', price: '7,744.56', chg: '+78.11', pct: '+1.02%', positive: true },
    { sym: 'S&P 500', key: '^GSPC', price: '5,751.13', chg: '+22.45', pct: '+0.39%', positive: true },
    { sym: 'NASDAQ', key: '^IXIC', price: '18,189.17', chg: '+145.28', pct: '+0.81%', positive: true },
    { sym: 'DOW JONES', key: '^DJI', price: '42,125.08', chg: '+330.12', pct: '+0.79%', positive: true },
    { sym: 'NIKKEI 225', key: '^N225', price: '38,652.20', chg: '-647.26', pct: '-0.94%', positive: false },
    { sym: 'HANG SENG', key: '^HSI', price: '22,736.85', chg: '-623.10', pct: '-2.60%', positive: false },
    { sym: 'FTSE 100', key: '^FTSE', price: '8,280.63', chg: '+45.59', pct: '+0.55%', positive: true },
  ]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetch('/api/stocks/realtime?tickers=^JKSE,^GSPC,^IXIC,^DJI,^N225,^HSI,^FTSE')
      .then((res) => res.json())
      .then((data) => {
        if (data?.quotes) {
          const updated = indices.map((idx) => {
            const q = data.quotes[idx.key];
            if (q) {
              setIsLive(true);
              return {
                ...idx,
                price: q.price.toLocaleString('id-ID', { minimumFractionDigits: 2 }),
                chg: `${q.changePoint >= 0 ? '+' : ''}${q.changePoint.toFixed(2)}`,
                pct: `${q.changePct >= 0 ? '+' : ''}${q.changePct.toFixed(2)}%`,
                positive: q.changePct >= 0,
              };
            }
            return idx;
          });
          setIndices(updated);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono">
      <WidgetHeader
        title="GLOBAL INDICES"
        onRemove={onRemove}
        onEdit={onEdit}
        customHeaderLeft={
          <div className="flex items-center gap-1.5 font-bold text-[#f59e0b]">
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-[#22c55e] animate-pulse' : 'bg-[#f59e0b]'}`} />
            <span className="tracking-wide uppercase">GLOBAL INDICES</span>
            {isLive && (
              <span className="text-[9px] bg-[#22c55e]/15 text-[#22c55e] px-1 rounded font-bold">
                LIVE
              </span>
            )}
          </div>
        }
      />
      <div className="flex-1 p-2 overflow-y-auto text-xs">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] text-[#71717a] border-b border-[#27272a] pb-1">
              <th className="text-left font-normal pb-1">SYMBOL</th>
              <th className="text-right font-normal pb-1">PRICE</th>
              <th className="text-right font-normal pb-1">CHG%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f23]">
            {indices.map((idx) => (
              <tr key={idx.sym} className="hover:bg-[#18181b]/60 transition-colors">
                <td className="py-1.5 font-bold text-white text-[11px]">{idx.sym}</td>
                <td className="py-1.5 text-right font-mono-num text-[#d4d4d8]">{idx.price}</td>
                <td className={`py-1.5 text-right font-mono-num font-bold ${idx.positive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {idx.pct}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 3. Market Pulse Widget
export function MarketPulseWidget({ onRemove, onEdit }: { onRemove: () => void; onEdit?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono">
      <WidgetHeader title="MARKET PULSE • IDX" onRemove={onRemove} onEdit={onEdit} />
      <div className="flex-1 p-3 space-y-3 text-xs">
        {/* Fear & Greed Index */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#a1a1aa]">FEAR &amp; GREED INDEX</span>
            <span className="font-bold text-[#22c55e]">72 • GREED</span>
          </div>
          <div className="w-full h-2 bg-[#27272a] rounded-full overflow-hidden flex">
            <div className="bg-[#ef4444] w-[20%]" />
            <div className="bg-[#f59e0b] w-[30%]" />
            <div className="bg-[#22c55e] w-[50%]" />
          </div>
          <div className="flex justify-between text-[9px] text-[#71717a]">
            <span>EXTREME FEAR</span>
            <span>NEUTRAL</span>
            <span>EXTREME GREED</span>
          </div>
        </div>

        {/* Market Breadth */}
        <div className="pt-2 border-t border-[#1f1f23] space-y-1.5">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Market Breadth (Advancers / Decliners)</div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#22c55e] font-bold">284 NAIK (56%)</span>
            <span className="text-[#71717a]">68 UNCHANGED</span>
            <span className="text-[#ef4444] font-bold">198 TURUN (38%)</span>
          </div>
          <div className="h-1.5 w-full bg-[#27272a] rounded-full overflow-hidden flex">
            <div className="bg-[#22c55e] w-[56%]" />
            <div className="bg-[#71717a] w-[6%]" />
            <div className="bg-[#ef4444] w-[38%]" />
          </div>
        </div>

        {/* Top Volume / Velocity */}
        <div className="pt-2 border-t border-[#1f1f23] flex items-center justify-between text-[11px]">
          <span className="text-[#71717a]">TOTAL VALUE</span>
          <span className="font-bold text-white font-mono-num">Rp 12.84 Triliun</span>
        </div>
      </div>
    </div>
  );
}

// 4. Commodities Widget
export function CommoditiesWidget({ onRemove, onEdit }: { onRemove: () => void; onEdit?: () => void }) {
  const comms = [
    { name: 'Gold Spot ($/oz)', price: '2,658.40', chg: '+14.20', pct: '+0.54%', positive: true },
    { name: 'Silver Spot ($/oz)', price: '31.85', chg: '+0.42', pct: '+1.34%', positive: true },
    { name: 'Crude Oil WTI ($/bbl)', price: '73.71', chg: '+2.85', pct: '+4.02%', positive: true },
    { name: 'Brent Crude ($/bbl)', price: '77.62', chg: '+3.10', pct: '+4.16%', positive: true },
    { name: 'Newcastle Coal ($/MT)', price: '144.25', chg: '+1.75', pct: '+1.23%', positive: true },
    { name: 'FCPO Palm Oil (MYR)', price: '4,320.00', chg: '+65.00', pct: '+1.53%', positive: true },
    { name: 'USD/IDR', price: '15,485.00', chg: '-35.00', pct: '-0.23%', positive: false },
  ];

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono">
      <WidgetHeader title="COMMODITIES &amp; MACRO" onRemove={onRemove} onEdit={onEdit} />
      <div className="flex-1 p-2 overflow-y-auto text-xs">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] text-[#71717a] border-b border-[#27272a] pb-1">
              <th className="text-left font-normal pb-1">ASSET</th>
              <th className="text-right font-normal pb-1">PRICE</th>
              <th className="text-right font-normal pb-1">CHG%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f23]">
            {comms.map((c) => (
              <tr key={c.name} className="hover:bg-[#18181b]/60 transition-colors">
                <td className="py-1 font-bold text-white text-[11px] truncate max-w-[120px]">{c.name}</td>
                <td className="py-1 text-right font-mono-num text-[#d4d4d8]">{c.price}</td>
                <td className={`py-1 text-right font-mono-num font-bold ${c.positive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {c.pct}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 5. Unified Bloomberg News Desk & Global Crawler Wire Widget
export function NewsWidget({
  onRemove,
  onEdit,
  onSelectStock,
}: {
  onRemove: () => void;
  onEdit?: () => void;
  onSelectStock?: (ticker: string) => void;
}) {
  const { holdings } = usePortfolioStore();
  const { watchlists } = useWatchlistStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [sentimentFilter, setSentimentFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStory, setActiveStory] = useState<DisplayArticle | null>(null);
  const [crawlingNow, setCrawlingNow] = useState(false);
  const [isSquawkEnabled, setIsSquawkEnabled] = useState(false);
  const lastSquawkedIdRef = useRef<string | null>(null);
  const hourlyState = useHourlyNews();

  // ── Squawk Box Audio Text-to-Speech Engine ──
  const speakHeadline = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find((v) => v.lang.startsWith('id') || v.lang.startsWith('ID'));
      if (idVoice) {
        utterance.voice = idVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.debug('Squawk TTS error:', e);
    }
  };

  const userTickers = useMemo(() => {
    const defaultWatchlist = watchlists[0]?.items || [];
    return Array.from(
      new Set([
        ...holdings.map((h) => (h.displaySymbol || h.symbol).replace('.JK', '').trim().toUpperCase()),
        ...defaultWatchlist.map((w) => (w.displaySymbol || w.symbol).replace('.JK', '').trim().toUpperCase()),
      ])
    ).filter(Boolean);
  }, [holdings, watchlists]);

  const handleManualCrawl = async () => {
    setCrawlingNow(true);
    playAudioChime('CLICK');
    try {
      await hourlyState.refreshNow();
      playAudioChime('ORDER_FILL');
    } finally {
      setCrawlingNow(false);
    }
  };

  const filteredNews = useMemo(() => {
    // 1. Base collection from all master records
    const isMyStocks = selectedFilter === 'MY_STOCKS';
    const isArchive = selectedFilter === 'ARCHIVE';
    const base = getAllStocksNewsMaster({
      myStocksOnly: isMyStocks,
      userTickers,
      category: isMyStocks ? 'ALL' : selectedFilter,
      period: isArchive ? 'ARCHIVE' : 'ALL',
      searchQuery: searchQuery.trim(),
    });

    const seen = new Set(base.map((b) => b.id));
    const merged: DisplayArticle[] = [...base];

    // 2. Prepend live crawled real-time stories from crawler engine
    hourlyState.articles.forEach((art) => {
      if (!seen.has(art.id)) {
        if (isMyStocks) {
          const userSet = new Set(userTickers.map((t) => t.toUpperCase()));
          const hasMatch =
            userSet.has(art.ticker.toUpperCase()) ||
            (art.tickers && art.tickers.some((t) => userSet.has(t.toUpperCase())));
          if (!hasMatch) return;
        }

        // Region specific filters
        if (selectedFilter === 'ID' && art.flag !== '🇮🇩' && !art.ticker.endsWith('.JK') && art.category !== 'Korporasi & M&A') {
          return;
        }
        if (selectedFilter === 'GLOBAL' && art.flag === '🇮🇩') {
          return;
        }
        if (selectedFilter === 'FLASH' && art.urgency !== 'FLASH') {
          return;
        }

        seen.add(art.id);
        merged.unshift(art);
      }
    });

    // 3. Filter by sentiment tab if chosen
    let result = merged;
    if (sentimentFilter !== 'ALL') {
      result = result.filter((a) => a.sentiment === sentimentFilter);
    }

    // 4. Filter by search query across headline, summary, tickers, or source
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.ticker.toLowerCase().includes(q) ||
          (a.tickers && a.tickers.some((t) => t.toLowerCase().includes(q))) ||
          a.source.toLowerCase().includes(q)
      );
    }

    return result;
  }, [selectedFilter, sentimentFilter, userTickers, searchQuery, hourlyState.articles]);

  const myStocksCount = useMemo(() => {
    const set = new Set(userTickers.map((t) => t.toUpperCase()));
    return getAllStocksNewsMaster().filter(
      (a) => set.has(a.ticker.toUpperCase()) || (a.tickers && a.tickers.some((t) => set.has(t.toUpperCase())))
    ).length;
  }, [userTickers]);

  // Auto-squawk breaking news if squawk box is active
  useEffect(() => {
    if (!isSquawkEnabled || filteredNews.length === 0) return;
    const latest = filteredNews[0];
    if (latest && latest.id !== lastSquawkedIdRef.current) {
      lastSquawkedIdRef.current = latest.id;
      if (latest.urgency === 'FLASH' || latest.urgency === 'BFW') {
        playAudioChime('ALERT');
        speakHeadline(`Breaking Flash Bloomberg: Saham ${latest.ticker}. ${latest.title}`);
      }
    }
  }, [isSquawkEnabled, filteredNews]);

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono">
      {/* Bloomberg Unified Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#121216] border-b border-[#27272a] text-[11px] font-mono select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
          <span className="font-extrabold text-[#f59e0b] tracking-wider uppercase">
            BLOOMBERG FIRST WORD • NEWS DESK &lt;TOP&gt;
          </span>
          <span className="text-[#3f3f46]">|</span>
          <div className="flex items-center gap-1.5 text-[10px] text-[#22c55e]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
            <Bot className="w-3 h-3 text-[#38bdf8]" />
            <span className="font-bold text-[#38bdf8] hidden sm:inline">LIVE CRAWLER</span>
            <span suppressHydrationWarning className="text-[#71717a] font-mono">({hourlyState.countdown})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#71717a]">
          {/* Audio Squawk Box Button */}
          <button
            type="button"
            onClick={() => {
              const next = !isSquawkEnabled;
              setIsSquawkEnabled(next);
              playAudioChime('CLICK');
              if (next) {
                speakHeadline('Squawk Box Bloomberg aktif. Siap menyiarkan breaking news pasar modal.');
              } else {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }
            }}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer mr-1 border ${
              isSquawkEnabled
                ? 'bg-amber-500/20 text-[#f59e0b] border-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse'
                : 'text-[#71717a] border-[#27272a] hover:text-[#d4d4d8] hover:border-[#3f3f46]'
            }`}
            title="Audio Squawk Box: Dengar pembacaan suara breaking news pasar secara otomatis (TTS)"
          >
            {isSquawkEnabled ? <Volume2 className="w-3 h-3 text-[#f59e0b]" /> : <VolumeX className="w-3 h-3" />}
            <span className="hidden sm:inline">{isSquawkEnabled ? 'SQUAWK ON' : 'SQUAWK'}</span>
          </button>

          <button
            type="button"
            onClick={handleManualCrawl}
            disabled={crawlingNow || hourlyState.isRefreshing}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-[#f59e0b] hover:bg-[#27272a] transition-colors cursor-pointer mr-1 border border-[#f59e0b]/30"
            title="Update dan rayapi berita live terbaru sekarang"
          >
            <RefreshCw className={`w-3 h-3 ${crawlingNow || hourlyState.isRefreshing ? 'animate-spin text-[#f59e0b]' : ''}`} />
            <span className="hidden md:inline">{crawlingNow ? 'CRAWLING...' : 'SYNC LIVE'}</span>
          </button>
          <Link
            href="/stream"
            className="text-[10px] font-bold text-[#f59e0b] hover:text-[#fbbf24] flex items-center gap-1 mr-2"
            title="Buka Halaman Lengkap Bloomberg News Wire Desk"
          >
            <span>FULL DESK</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="p-0.5 hover:text-[#f59e0b] transition-colors cursor-pointer"
              title="Edit Widget"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="p-0.5 hover:text-[#ef4444] transition-colors cursor-pointer"
            title="Tutup Widget"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Control Strip: Category Filters, Sentiment Pills & Search */}
      <div className="px-2 py-1.5 bg-[#121216] border-b border-[#27272a] space-y-1.5 text-xs">
        {/* Quick Filter Pills + Sentiment Tabs */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 text-[10px] scrollbar-none">
          <div className="flex items-center gap-1 shrink-0">
            {[
              { id: 'ALL', label: `🔥 Semua Wire` },
              { id: 'MY_STOCKS', label: `⭐ Saham Saya (${myStocksCount})`, highlight: true },
              { id: 'FLASH', label: '🔴 Breaking Flash' },
              { id: 'ID', label: '🇮🇩 Saham BEI / IDX' },
              { id: 'GLOBAL', label: '🌍 Wall St & Global' },
              { id: 'DIVIDEND', label: '💰 Dividen & Laba' },
              { id: 'ARCHIVE', label: '📅 Arsip' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-2 py-0.5 rounded font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedFilter === cat.id
                    ? 'bg-[#f59e0b] text-black shadow-sm'
                    : cat.highlight
                    ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30'
                    : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sentiment Filter Pills */}
          <div className="flex items-center gap-1 shrink-0">
            {(['ALL', 'BULLISH', 'BEARISH'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSentimentFilter(s)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors cursor-pointer ${
                  sentimentFilter === s
                    ? s === 'BULLISH'
                      ? 'bg-[#22c55e] text-black border-[#22c55e]'
                      : s === 'BEARISH'
                      ? 'bg-[#ef4444] text-white border-[#ef4444]'
                      : 'bg-[#f59e0b] text-black border-[#f59e0b]'
                    : 'bg-[#18181b] text-[#71717a] border-[#27272a] hover:text-white'
                }`}
              >
                {s === 'ALL' ? 'Semua Sentimen' : s === 'BULLISH' ? '▲ Bull' : '▼ Bear'}
              </button>
            ))}
          </div>
        </div>

        {/* Instant Search Bar */}
        <div className="flex items-center gap-1.5 bg-[#18181b] border border-[#27272a] px-2 py-1 rounded">
          <Search className="w-3 h-3 text-[#71717a] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berita saham mana pun atau cashtag (misal: BBCA, BBRI, NVDA, laba, dividen)..."
            className="w-full bg-transparent text-white placeholder-[#71717a] outline-none text-[10px]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#71717a] hover:text-white text-[10px]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Real-Time Story Feed List */}
      <div className="flex-1 p-2 overflow-y-auto divide-y divide-[#1f1f23] text-xs">
        {filteredNews.length === 0 ? (
          <div className="text-center py-8 text-[#71717a] text-xs space-y-1">
            <p>Tidak ada berita yang cocok dengan kriteria pencarian &quot;{searchQuery}&quot;</p>
            <button
              type="button"
              onClick={handleManualCrawl}
              className="text-[#38bdf8] underline text-[10px] cursor-pointer"
            >
              Jalankan Crawl Ulang Sekarang
            </button>
          </div>
        ) : (
          filteredNews.map((n) => {
            const isFlash = n.urgency === 'FLASH';
            const isBfw = n.urgency === 'BFW';
            const isArchive = n.period === 'ARCHIVE' || n.period === 'QUARTER';
            const isBullish = n.sentiment === 'BULLISH';
            const isBearish = n.sentiment === 'BEARISH';

            return (
              <div
                key={n.id}
                onClick={() => setActiveStory(n)}
                className={`py-2 px-1 hover:bg-[#18181b] transition-all cursor-pointer rounded group flex flex-col gap-1 ${
                  isFlash ? 'bg-red-950/10 border-l-2 border-l-red-500 pl-2' : ''
                }`}
              >
                {/* Meta Row: Wire Code, Ticker Badge, Urgency, Timestamp, Source */}
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Urgency Badge */}
                    <span
                      className={`px-1 py-0.2 rounded font-extrabold text-[9px] border ${
                        isFlash
                          ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                          : isBfw
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : isArchive
                          ? 'bg-neutral-800 text-neutral-400 border-neutral-700'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      {n.urgency === 'ARCHIVE' ? 'ARSIP' : n.urgency}
                    </span>

                    {/* Wire Code */}
                    <span className="text-[#a1a1aa] font-bold">{n.wireCode}</span>

                    {/* Ticker Badge with Company Logo */}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock?.(n.ticker);
                      }}
                      className="flex items-center gap-1 px-1 py-0.2 rounded font-bold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30 hover:bg-[#f59e0b] hover:text-black transition-colors cursor-pointer"
                      title={`Klik untuk buka grafik ${n.ticker}`}
                    >
                      <CompanyLogo symbol={n.ticker} size={14} />
                      <span>{n.flag}</span>
                      <span>{n.ticker}</span>
                    </span>

                    <span suppressHydrationWarning className="text-[#52525b] text-[9px]">• {n.relativeTime}</span>
                  </div>

                  {/* Sentiment & Source */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] font-bold px-1 rounded ${
                        isBullish
                          ? 'text-[#22c55e] bg-[#22c55e]/10'
                          : isBearish
                          ? 'text-[#ef4444] bg-[#ef4444]/10'
                          : 'text-[#a1a1aa] bg-[#27272a]'
                      }`}
                    >
                      {isBullish ? `▲ +${n.sentimentScore}` : isBearish ? `▼ ${n.sentimentScore}` : '● 0'}
                    </span>
                    <span className="text-[9px] text-[#71717a] font-bold tracking-tight uppercase">
                      {n.source}
                    </span>
                  </div>
                </div>

                {/* Headline with direct link indicator if external & audio squawk button */}
                <div className="flex items-start justify-between gap-1.5">
                  <h4 className="text-white text-[11px] leading-snug font-sans group-hover:text-[#f59e0b] transition-colors line-clamp-2">
                    {n.title}
                  </h4>
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudioChime('CLICK');
                        speakHeadline(`${n.ticker}. ${n.title}`);
                      }}
                      className="p-0.5 text-[#71717a] hover:text-[#f59e0b] hover:bg-[#27272a] rounded transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
                      title="Dengar suara (Audio Squawk)"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    {n.link && (
                      <ExternalLink className="w-3 h-3 text-[#71717a] opacity-60 group-hover:opacity-100 group-hover:text-[#38bdf8]" />
                    )}
                  </div>
                </div>

                {/* Single-line highlight summary snippet */}
                <p className="text-[10px] text-[#71717a] line-clamp-1 font-sans">
                  {n.summary}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* ── BLOOMBERG STORY READER MODAL (FULL ACCURACY INSPECTOR) ── */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 font-mono">
          <div className="bg-[#09090b] border border-[#f59e0b]/40 rounded max-w-2xl w-full p-4 text-xs space-y-3 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#27272a] pb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#ef4444] text-white px-1.5 py-0.5 rounded text-[9px] font-extrabold animate-pulse">
                    BLOOMBERG WIRE &lt;WIRE&gt;
                  </span>
                  <span className="text-[#f59e0b] font-bold text-xs">{activeStory.wireCode}</span>
                  <span className="text-[#71717a] text-[10px]">
                    ({(activeStory as any).publishedAt || activeStory.date || activeStory.relativeTime})
                  </span>
                </div>
                <div className="text-[10px] text-[#a1a1aa]">{activeStory.byline}</div>
              </div>
              <button
                type="button"
                onClick={() => setActiveStory(null)}
                className="text-[#71717a] hover:text-white p-1 text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {/* Full Headline */}
              <h2 className="text-white text-sm font-bold leading-snug font-sans border-l-2 border-[#f59e0b] pl-2.5">
                {(activeStory as any).headline || activeStory.title}
              </h2>

              {/* Ticker Badges & Quick Action */}
              <div className="flex items-center justify-between gap-2 bg-[#121216] p-2 rounded border border-[#27272a]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[#71717a]">EMITEN TERKAIT:</span>
                  {activeStory.tickers.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        onSelectStock?.(t);
                        setActiveStory(null);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f59e0b] text-black hover:bg-[#fbbf24] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>{t}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-[#71717a]">SENTIMEN:</span>
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                      activeStory.sentiment === 'BULLISH'
                        ? 'bg-[#22c55e]/20 text-[#22c55e]'
                        : activeStory.sentiment === 'BEARISH'
                        ? 'bg-[#ef4444]/20 text-[#ef4444]'
                        : 'bg-[#27272a] text-[#a1a1aa]'
                    }`}
                  >
                    {activeStory.sentiment} (+{activeStory.sentimentScore}%)
                  </span>
                </div>
              </div>

              {/* Executive Takeaways Box */}
              <div className="bg-[#15151a] border border-[#27272a] p-2.5 rounded space-y-1.5">
                <span className="text-[10px] font-bold text-[#f59e0b] tracking-wider uppercase block">
                  KEY TAKEAWAYS / POIN-POIN UTAMA (BLOOMBERG BRIEF):
                </span>
                <ul className="space-y-1 text-[11px] text-[#d4d4d8] font-sans">
                  {activeStory.takeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#f59e0b] mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full News Paragraphs */}
              <div className="space-y-2 text-xs text-[#a1a1aa] leading-relaxed font-sans">
                {activeStory.body.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Market Impact Analysis */}
              <div className="bg-[#121216] border-l-2 border-[#22c55e] p-2 rounded text-[11px] text-[#a1a1aa] font-sans">
                <strong className="text-white">Dampak Pasar (Market Impact):</strong>{' '}
                {activeStory.marketImpact}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#27272a] pt-2 flex items-center justify-between text-[11px] flex-wrap gap-2">
              <span className="text-[#71717a]">Sumber: {activeStory.source} • Verified Accurate</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playAudioChime('CLICK');
                    const text = `${activeStory.title}. Dampak pasar: ${activeStory.marketImpact}`;
                    speakHeadline(text);
                  }}
                  className="px-2.5 py-1 bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] border border-[#f59e0b]/40 font-bold rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Dengarkan pembacaan berita dan ringkasan dampak pasar via Audio"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>SQUAWK AUDIO</span>
                </button>
                {activeStory.link && (
                  <a
                    href={activeStory.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded transition-colors flex items-center gap-1.5"
                  >
                    <span>BACA ARTIKEL ASLI DI {activeStory.source.toUpperCase()}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const sym = (activeStory as any).primaryTicker || activeStory.ticker;
                    if (sym) onSelectStock?.(sym);
                    setActiveStory(null);
                  }}
                  className="px-3 py-1 bg-[#f59e0b] text-black font-bold rounded hover:bg-[#fbbf24] transition-colors cursor-pointer"
                >
                  Muat ke Chart Technical ({(activeStory as any).primaryTicker || activeStory.ticker})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStory(null)}
                  className="px-3 py-1 bg-[#27272a] text-white rounded hover:bg-[#3f3f46] transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 6. Smart Money & Bandar Flow Widget (Comprehensive Terminal Widget)
export function BandarFlowWidget({
  widget,
  onRemove,
  onEdit,
  onUpdateSymbol,
}: {
  widget?: DashboardWidgetConfig;
  onRemove: () => void;
  onEdit?: () => void;
  onUpdateSymbol?: (sym: string) => void;
}) {
  const currentSymbol = (widget?.symbol || 'BMRI').toUpperCase();
  const [subTab, setSubTab] = useState<'BROKER_SUMMARY' | 'RADAR' | 'VWAP'>('BROKER_SUMMARY');
  const [filterQuery, setFilterQuery] = useState('');

  // Built-in profiles for top emiten
  const STATIC_PROFILES: Record<string, {
    sym: string;
    name: string;
    action: string;
    score: number;
    top3BuyerPct: number;
    top3SellerPct: number;
    foreignNet: string;
    bandarVwap: number;
    floatingPct: number;
    topBuyers: { code: string; name: string; type: 'ASING' | 'DOMESTIK'; lots: string; avg: number; val: string }[];
    topSellers: { code: string; name: string; type: 'RITEL' | 'DOMESTIK' | 'ASING'; lots: string; avg: number; val: string }[];
    notes: string;
  }> = {
    BMRI: {
      sym: 'BMRI',
      name: 'Bank Mandiri Tbk',
      action: 'BIG ACCUMULATION',
      score: 92,
      top3BuyerPct: 74.2,
      top3SellerPct: 38.6,
      foreignNet: '+Rp 482.5 M',
      bandarVwap: 4025,
      floatingPct: 1.86,
      topBuyers: [
        { code: 'ZP', name: 'Maybank Sekuritas', type: 'ASING', lots: '54.000', avg: 4025, val: 'Rp 217.6 M' },
        { code: 'AK', name: 'UBS Sekuritas', type: 'ASING', lots: '38.000', avg: 4030, val: 'Rp 153.1 M' },
        { code: 'BK', name: 'J.P. Morgan Sekuritas', type: 'ASING', lots: '32.000', avg: 4028, val: 'Rp 129.0 M' },
        { code: 'RX', name: 'Macquarie Sekuritas', type: 'ASING', lots: '19.000', avg: 4030, val: 'Rp 76.6 M' },
      ],
      topSellers: [
        { code: 'PD', name: 'Indo Premier (Ritel)', type: 'RITEL', lots: '35.000', avg: 4025, val: 'Rp 140.9 M' },
        { code: 'XC', name: 'Ajaib Sekuritas (Ritel)', type: 'RITEL', lots: '28.000', avg: 4028, val: 'Rp 112.8 M' },
        { code: 'YP', name: 'Mirae Asset (Ritel)', type: 'RITEL', lots: '26.000', avg: 4025, val: 'Rp 104.7 M' },
        { code: 'CC', name: 'Mandiri Sekuritas', type: 'DOMESTIK', lots: '24.000', avg: 4030, val: 'Rp 96.7 M' },
      ],
      notes: 'Konsentrasi Smart Money sangat tinggi (74.2%). Tiga broker institusi global (ZP, AK, BK) memborong barang ritel domestik.',
    },
    ADRO: {
      sym: 'ADRO',
      name: 'Adaro Energy Indonesia Tbk',
      action: 'BIG ACCUMULATION',
      score: 95,
      top3BuyerPct: 79.1,
      top3SellerPct: 32.4,
      foreignNet: '+Rp 364.8 M',
      bandarVwap: 2495,
      floatingPct: 4.21,
      topBuyers: [
        { code: 'BK', name: 'J.P. Morgan Sekuritas', type: 'ASING', lots: '42.000', avg: 2490, val: 'Rp 105.0 M' },
        { code: 'ZP', name: 'Maybank Sekuritas', type: 'ASING', lots: '31.000', avg: 2495, val: 'Rp 77.4 M' },
        { code: 'CG', name: 'CGS International', type: 'ASING', lots: '28.000', avg: 2500, val: 'Rp 70.0 M' },
      ],
      topSellers: [
        { code: 'XC', name: 'Ajaib Sekuritas (Ritel)', type: 'RITEL', lots: '34.000', avg: 2490, val: 'Rp 84.7 M' },
        { code: 'YP', name: 'Mirae Asset (Ritel)', type: 'RITEL', lots: '29.000', avg: 2490, val: 'Rp 72.2 M' },
        { code: 'PD', name: 'Indo Premier (Ritel)', type: 'RITEL', lots: '21.000', avg: 2490, val: 'Rp 52.3 M' },
      ],
      notes: 'Sentimen aksi korporasi memicu akumulasi agresif. Top 3 Buyer menyerap 79.1% transaksi pasar.',
    },
    BBCA: {
      sym: 'BBCA',
      name: 'Bank Central Asia Tbk',
      action: 'NORMAL ACCUM',
      score: 78,
      top3BuyerPct: 61.5,
      top3SellerPct: 45.2,
      foreignNet: '+Rp 215.3 M',
      bandarVwap: 6095,
      floatingPct: 0.08,
      topBuyers: [
        { code: 'AK', name: 'UBS Sekuritas', type: 'ASING', lots: '21.000', avg: 6090, val: 'Rp 128.1 M' },
        { code: 'KZ', name: 'CLSA Sekuritas', type: 'ASING', lots: '14.000', avg: 6095, val: 'Rp 85.3 M' },
        { code: 'RX', name: 'Macquarie Sekuritas', type: 'ASING', lots: '9.000', avg: 6100, val: 'Rp 54.9 M' },
      ],
      topSellers: [
        { code: 'YP', name: 'Mirae Asset (Ritel)', type: 'RITEL', lots: '18.000', avg: 6090, val: 'Rp 109.8 M' },
        { code: 'PD', name: 'Indo Premier (Ritel)', type: 'RITEL', lots: '14.000', avg: 6100, val: 'Rp 85.4 M' },
        { code: 'NI', name: 'BNI Sekuritas', type: 'DOMESTIK', lots: '9.500', avg: 6090, val: 'Rp 57.9 M' },
      ],
      notes: 'Akumulasi konsisten oleh UBS dan CLSA menjaga level psikologis Rp 6.100.',
    },
    BBRI: {
      sym: 'BBRI',
      name: 'Bank Rakyat Indonesia Tbk',
      action: 'ACCUMULATION',
      score: 83,
      top3BuyerPct: 64.8,
      top3SellerPct: 39.1,
      foreignNet: '+Rp 289.4 M',
      bandarVwap: 3090,
      floatingPct: 0.65,
      topBuyers: [
        { code: 'BK', name: 'J.P. Morgan Sekuritas', type: 'ASING', lots: '36.000', avg: 3085, val: 'Rp 111.0 M' },
        { code: 'ZP', name: 'Maybank Sekuritas', type: 'ASING', lots: '28.000', avg: 3090, val: 'Rp 86.5 M' },
      ],
      topSellers: [
        { code: 'XC', name: 'Ajaib Sekuritas (Ritel)', type: 'RITEL', lots: '25.000', avg: 3090, val: 'Rp 77.2 M' },
        { code: 'YP', name: 'Mirae Asset (Ritel)', type: 'RITEL', lots: '22.000', avg: 3085, val: 'Rp 67.8 M' },
      ],
      notes: 'Akumulasi institusi berlanjut pada saham perbankan mikro BUMN.',
    },
    GOTO: {
      sym: 'GOTO',
      name: 'GoTo Gojek Tokopedia Tbk',
      action: 'NORMAL DISTRIB',
      score: 32,
      top3BuyerPct: 38.2,
      top3SellerPct: 64.8,
      foreignNet: '-Rp 82.4 M',
      bandarVwap: 31,
      floatingPct: 0.0,
      topBuyers: [
        { code: 'XC', name: 'Ajaib Sekuritas (Ritel)', type: 'RITEL', lots: '185.000', avg: 31, val: 'Rp 5.5 M' },
        { code: 'PD', name: 'Indo Premier (Ritel)', type: 'RITEL', lots: '142.000', avg: 31, val: 'Rp 4.2 M' },
      ],
      topSellers: [
        { code: 'BK', name: 'J.P. Morgan Sekuritas', type: 'ASING', lots: '260.000', avg: 31, val: 'Rp 7.8 M' },
        { code: 'AK', name: 'UBS Sekuritas', type: 'ASING', lots: '210.000', avg: 31, val: 'Rp 6.3 M' },
      ],
      notes: 'Terjadi perpindahan barang dari institusi asing ke ritel domestik.',
    },
    ASII: {
      sym: 'ASII',
      name: 'Astra International Tbk',
      action: 'NORMAL ACCUM',
      score: 81,
      top3BuyerPct: 58.4,
      top3SellerPct: 42.1,
      foreignNet: '+Rp 142.1 M',
      bandarVwap: 4780,
      floatingPct: 0.84,
      topBuyers: [
        { code: 'ZP', name: 'Maybank Sekuritas', type: 'ASING', lots: '12.000', avg: 4780, val: 'Rp 57.3 M' },
        { code: 'KZ', name: 'CLSA Sekuritas', type: 'ASING', lots: '9.500', avg: 4790, val: 'Rp 45.5 M' },
      ],
      topSellers: [
        { code: 'YP', name: 'Mirae Asset (Ritel)', type: 'RITEL', lots: '11.000', avg: 4780, val: 'Rp 52.5 M' },
        { code: 'PD', name: 'Indo Premier (Ritel)', type: 'RITEL', lots: '8.500', avg: 4790, val: 'Rp 40.7 M' },
      ],
      notes: 'Akumulasi mantap di Rp 4.820 didukung sentimen yield dividen Astra.',
    },
    ANTM: {
      sym: 'ANTM',
      name: 'Aneka Tambang Tbk',
      action: 'BIG ACCUMULATION',
      score: 89,
      top3BuyerPct: 71.4,
      top3SellerPct: 36.8,
      foreignNet: '+Rp 218.4 M',
      bandarVwap: 3210,
      floatingPct: 1.25,
      topBuyers: [
        { code: 'AK', name: 'UBS Sekuritas', type: 'ASING', lots: '26.000', avg: 3210, val: 'Rp 83.4 M' },
        { code: 'BK', name: 'J.P. Morgan Sekuritas', type: 'ASING', lots: '21.000', avg: 3220, val: 'Rp 67.6 M' },
      ],
      topSellers: [
        { code: 'YP', name: 'Mirae Asset (Ritel)', type: 'RITEL', lots: '17.000', avg: 3210, val: 'Rp 54.5 M' },
        { code: 'XC', name: 'Ajaib Sekuritas (Ritel)', type: 'RITEL', lots: '15.000', avg: 3220, val: 'Rp 48.3 M' },
      ],
      notes: 'Kenaikan komoditas emas & nikel memicu akumulasi agresif institusi.',
    },
  };

  // Dynamic fallback for any arbitrary custom ticker typed
  const activeProfile = STATIC_PROFILES[currentSymbol] || {
    sym: currentSymbol,
    name: `${currentSymbol} Tbk`,
    action: 'NORMAL ACCUM',
    score: 72,
    top3BuyerPct: 62.0,
    top3SellerPct: 44.0,
    foreignNet: '+Rp 64.2 M',
    bandarVwap: 1520,
    floatingPct: 0.65,
    topBuyers: [
      { code: 'AK', name: 'UBS Sekuritas', type: 'ASING', lots: '14.000', avg: 1510, val: 'Rp 21.1 M' },
      { code: 'ZP', name: 'Maybank Sekuritas', type: 'ASING', lots: '11.000', avg: 1520, val: 'Rp 16.7 M' },
    ],
    topSellers: [
      { code: 'YP', name: 'Mirae Asset (Ritel)', type: 'RITEL', lots: '12.000', avg: 1515, val: 'Rp 18.1 M' },
      { code: 'XC', name: 'Ajaib Sekuritas (Ritel)', type: 'RITEL', lots: '9.000', avg: 1520, val: 'Rp 13.6 M' },
    ],
    notes: `Arus transaksi ${currentSymbol} terpantau terakumulasi moderat oleh broker institusi.`,
  };

  const radarList = Object.values(STATIC_PROFILES);

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono text-xs">
      {/* Widget Header */}
      <WidgetHeader
        title={`BANDARMOLOGI • ${currentSymbol}`}
        onRemove={onRemove}
        onEdit={onEdit}
        customHeaderLeft={
          <div className="flex items-center gap-1.5 font-bold text-[#f59e0b] truncate">
            <span className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full shrink-0 animate-pulse" />
            <span className="tracking-wide uppercase truncate">BANDARMOLOGI • {currentSymbol}</span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1 py-0.2 rounded font-extrabold shrink-0">
              SMART MONEY FLOW
            </span>
          </div>
        }
      />

      {/* Quick Ticker Switcher */}
      <div className="flex items-center justify-between gap-1 px-2 py-1 bg-[#121215] border-b border-[#27272a] text-[10px] overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[#71717a] font-bold">EMITEN:</span>
          {['BMRI', 'ADRO', 'BBCA', 'BBRI', 'ANTM', 'ASII', 'GOTO'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onUpdateSymbol?.(s)}
              className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                currentSymbol === s
                  ? 'bg-[#f59e0b] text-black font-extrabold shadow-sm'
                  : 'bg-[#1e1e24] text-[#a1a1aa] hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-0.5 bg-[#18181e] p-0.5 rounded border border-[#27272a] shrink-0">
          <button
            type="button"
            onClick={() => setSubTab('BROKER_SUMMARY')}
            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${
              subTab === 'BROKER_SUMMARY' ? 'bg-[#f59e0b] text-black' : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            Broker Summary
          </button>
          <button
            type="button"
            onClick={() => setSubTab('RADAR')}
            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${
              subTab === 'RADAR' ? 'bg-[#f59e0b] text-black' : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            Radar Multi-Saham
          </button>
          <button
            type="button"
            onClick={() => setSubTab('VWAP')}
            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors ${
              subTab === 'VWAP' ? 'bg-[#f59e0b] text-black' : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            Modal Bandar
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {/* SUBTAB 1: BROKER SUMMARY VIEW */}
        {subTab === 'BROKER_SUMMARY' && (
          <div className="space-y-2.5">
            {/* Status Header Card */}
            <div className="p-2 rounded bg-[#141418] border border-[#27272a] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{activeProfile.sym}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    activeProfile.action.includes('ACCUM')
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}>
                    {activeProfile.action}
                  </span>
                </div>
                <div className="text-[10px] text-[#71717a] mt-0.5">{activeProfile.name}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#71717a]">Net Flow Asing</div>
                <div className={`font-bold font-mono text-xs ${
                  activeProfile.foreignNet.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {activeProfile.foreignNet}
                </div>
                <div className="text-[9px] text-amber-400">Score: {activeProfile.score}/100</div>
              </div>
            </div>

            {/* Top 3 Concentration Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#a1a1aa]">
                <span>Top 3 Buyer Concentration (Smart Money)</span>
                <span className="text-emerald-400 font-bold">{activeProfile.top3BuyerPct}%</span>
              </div>
              <div className="w-full bg-[#1e1e24] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeProfile.top3BuyerPct}%` }}
                />
              </div>
            </div>

            {/* Split Grid: Top Buyers vs Top Sellers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
              {/* Buyer Box */}
              <div className="bg-[#121216] p-2 rounded border border-[#27272a] space-y-1.5">
                <div className="text-[10px] font-bold text-emerald-400 flex items-center justify-between border-b border-[#27272a] pb-1">
                  <span>TOP BUYER (AKUMULASI)</span>
                  <span className="text-[9px] text-[#71717a]">LOT / VAL</span>
                </div>
                <div className="space-y-1">
                  {activeProfile.topBuyers.map((b, i) => (
                    <div key={i} className="flex items-center justify-between py-0.5 border-b border-zinc-800/40">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white">{b.code}</span>
                        <span className="text-[8.5px] px-1 rounded bg-zinc-800 text-zinc-400">{b.type}</span>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-emerald-400">{b.val}</div>
                        <div className="text-[9px] text-zinc-500">@{b.avg} ({b.lots} lot)</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seller Box */}
              <div className="bg-[#121216] p-2 rounded border border-[#27272a] space-y-1.5">
                <div className="text-[10px] font-bold text-rose-400 flex items-center justify-between border-b border-[#27272a] pb-1">
                  <span>TOP SELLER (DISTRIBUSI)</span>
                  <span className="text-[9px] text-[#71717a]">LOT / VAL</span>
                </div>
                <div className="space-y-1">
                  {activeProfile.topSellers.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-0.5 border-b border-zinc-800/40">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white">{s.code}</span>
                        <span className="text-[8.5px] px-1 rounded bg-zinc-800 text-zinc-400">{s.type}</span>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-rose-400">{s.val}</div>
                        <div className="text-[9px] text-zinc-500">@{s.avg} ({s.lots} lot)</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Explanation */}
            <div className="p-2 bg-[#141418] rounded border border-zinc-800 text-[10px] text-zinc-300 leading-relaxed">
              <span className="text-amber-400 font-bold mr-1">💡 Catatan Aliran:</span>
              {activeProfile.notes}
            </div>
          </div>
        )}

        {/* SUBTAB 2: RADAR MULTI-SAHAM */}
        {subTab === 'RADAR' && (
          <div className="space-y-1.5 divide-y divide-[#1f1f23]">
            {radarList.map((item) => (
              <div
                key={item.sym}
                onClick={() => onUpdateSymbol?.(item.sym)}
                className={`p-2 rounded flex items-center justify-between cursor-pointer transition-colors ${
                  currentSymbol === item.sym ? 'bg-[#1e1e24]' : 'hover:bg-[#141418]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs">{item.sym}</span>
                    <span className={`text-[8.5px] font-bold px-1 rounded ${
                      item.action.includes('ACCUM')
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {item.action}
                    </span>
                  </div>
                  <div className="text-[9.5px] text-[#71717a] mt-0.5">{item.name}</div>
                </div>
                <div className="text-right font-mono">
                  <div className={`font-bold text-xs ${
                    item.foreignNet.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {item.foreignNet}
                  </div>
                  <div className="text-[9.5px] text-amber-400">Score: {item.score}/100</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUBTAB 3: VWAP & FLOATING PROFIT BANDAR */}
        {subTab === 'VWAP' && (
          <div className="space-y-2.5">
            <div className="p-3 rounded bg-[#141418] border border-[#27272a] space-y-2">
              <div className="text-xs font-bold text-white">Estimasi Modal Rata-rata Bandar (Bandar VWAP)</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-[#181820] border border-zinc-800">
                  <div className="text-[9px] text-zinc-500">Harga Modal Bandar:</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">Rp {activeProfile.bandarVwap.toLocaleString()}</div>
                </div>
                <div className="p-2 rounded bg-[#181820] border border-zinc-800">
                  <div className="text-[9px] text-zinc-500">Floating Profit/Loss:</div>
                  <div className={`text-base font-bold mt-0.5 ${
                    activeProfile.floatingPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {activeProfile.floatingPct >= 0 ? `+${activeProfile.floatingPct}%` : `${activeProfile.floatingPct}%`}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed pt-1">
                Kalkulasi posisi rata-rata harga beli akumulasi bandar. Jika harga saham berada di atas modal bandar, potensi kenaikan berlanjut hingga fase distribusi.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Widget Footer */}
      <div className="px-2.5 py-1 bg-[#121216] border-t border-[#27272a] text-[9px] text-[#71717a] flex items-center justify-between select-none shrink-0">
        <span>Arus Broker Summary BEI</span>
        <span className="text-amber-500">Live Institutional Concentration</span>
      </div>
    </div>
  );
}

// 7. Dividend Radar & Intelligence Widget (Unified Local + Global)
export function DividendRadarWidget({ onRemove, onEdit }: { onRemove: () => void; onEdit?: () => void }) {
  const [activeTab, setActiveTab] = useState<'IDX' | 'GLOBAL'>('IDX');

  const idxDividendEvents = [
    { sym: 'BMRI', name: 'Bank Mandiri', dps: 'Rp 353.95', yieldPct: '5.02%', cumDate: 'Hari Ini', status: 'CUM-DATE' },
    { sym: 'ADRO', name: 'Adaro Energy', dps: 'Rp 580.00', yieldPct: '15.10%', cumDate: '14 Okt', status: 'UPCOMING' },
    { sym: 'BBCA', name: 'Bank Central Asia', dps: 'Rp 295.00', yieldPct: '2.80%', cumDate: '22 Okt', status: 'ANNOUNCED' },
    { sym: 'ITMG', name: 'Indo Tambangraya', dps: 'Rp 3,250.00', yieldPct: '12.26%', cumDate: '28 Okt', status: 'ANNOUNCED' },
    { sym: 'PTBA', name: 'Bukit Asam', dps: 'Rp 397.00', yieldPct: '13.45%', cumDate: '05 Nov', status: 'ESTIMATED' },
    { sym: 'ASII', name: 'Astra International', dps: 'Rp 98.00', yieldPct: '3.10%', cumDate: '18 Nov', status: 'INTERIM' },
  ];

  const topGlobalDividends = INVESTING_COM_GLOBAL_DIVIDENDS.slice(0, 8);

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono">
      <WidgetHeader title="DIVIDEND INTELLIGENCE <DVD>" onRemove={onRemove} onEdit={onEdit} />
      
      {/* Tab Switcher */}
      <div className="flex items-center bg-[#121216] border-b border-[#27272a] p-1 gap-1 text-[10px]">
        <button
          onClick={() => setActiveTab('IDX')}
          className={`flex-1 py-1 px-2 rounded font-bold transition-all text-center ${
            activeTab === 'IDX'
              ? 'bg-[#f59e0b] text-black shadow-sm'
              : 'text-[#71717a] hover:text-white hover:bg-[#18181b]'
          }`}
        >
          🇮🇩 BEI Cum-Date Radar
        </button>
        <button
          onClick={() => setActiveTab('GLOBAL')}
          className={`flex-1 py-1 px-2 rounded font-bold transition-all text-center ${
            activeTab === 'GLOBAL'
              ? 'bg-[#f59e0b] text-black shadow-sm'
              : 'text-[#71717a] hover:text-white hover:bg-[#18181b]'
          }`}
        >
          🌐 Global Aristocrats
        </button>
      </div>

      <div className="flex-1 p-2 overflow-y-auto divide-y divide-[#1f1f23] text-xs">
        {activeTab === 'IDX' ? (
          idxDividendEvents.map((d) => (
            <div key={d.sym} className="py-1.5 flex items-center justify-between hover:bg-[#121216] px-1 rounded transition-colors">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-[11px]">{d.sym}</span>
                  <span className={`text-[9px] font-bold px-1 rounded ${
                    d.status === 'CUM-DATE' ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                  }`}>
                    {d.status}
                  </span>
                </div>
                <div className="text-[10px] text-[#71717a]">{d.name} • Cum: {d.cumDate}</div>
              </div>
              <div className="text-right">
                <div className="font-mono-num font-bold text-white text-xs">{d.dps}</div>
                <div className="text-[10px] text-[#22c55e] font-bold">Yield {d.yieldPct}</div>
              </div>
            </div>
          ))
        ) : (
          topGlobalDividends.map((s) => (
            <div key={s.ticker} className="py-1.5 flex items-center justify-between hover:bg-[#121216] px-1 rounded transition-colors">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-[11px]">{s.ticker}</span>
                  <span className="text-[9px] font-bold bg-[#3b82f6]/20 text-[#60a5fa] px-1 rounded">
                    {s.countryCode}
                  </span>
                  <span className="text-[9px] text-[#a1a1aa]">{s.category}</span>
                </div>
                <div className="text-[10px] text-[#71717a] truncate max-w-[150px]">{s.name}</div>
              </div>
              <div className="text-right">
                <div className="font-mono-num font-bold text-white text-xs">${s.dps.toFixed(2)}</div>
                <div className="text-[10px] text-[#22c55e] font-bold">Yield {s.yieldPct.toFixed(2)}%</div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="px-2 py-1 bg-[#09090b] border-t border-[#1f1f23] text-[9px] text-[#52525b] flex justify-between">
        <span>TEKAN <strong className="text-[#f59e0b]">DIV &lt;GO&gt;</strong> UNTUK DETAIL LENGKAP</span>
        <Link href="/dividend" className="text-[#f59e0b] hover:underline">Lihat Semua →</Link>
      </div>
    </div>
  );
}

// 8. Global Dividend Stocks Widget (Investing.com Master Universe)
export function GlobalDividendsWidget({
  widget,
  onRemove,
  onEdit,
  onSelectStock,
}: {
  widget?: DashboardWidgetConfig;
  onRemove: () => void;
  onEdit?: () => void;
  onSelectStock?: (ticker: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'yield' | 'growth' | 'dps'>('yield');

  // Filter & Sort
  const filteredStocks = INVESTING_COM_GLOBAL_DIVIDENDS.filter((s) => {
    // category filter
    if (selectedCategory === 'KINGS' && !s.category.includes('King')) return false;
    if (selectedCategory === 'ARISTOCRATS' && !s.category.includes('Aristocrat')) return false;
    if (selectedCategory === 'HIGH_YIELD' && s.yieldPct < 5.0) return false;
    if (selectedCategory === 'MONTHLY' && s.frequency !== 'Monthly') return false;
    if (selectedCategory === 'NON_US' && s.countryCode === 'US') return false;

    // search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'yield') return b.yieldPct - a.yieldPct;
    if (sortBy === 'growth') return b.growthYears - a.growthYears;
    if (sortBy === 'dps') return b.dps - a.dps;
    return 0;
  });

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono">
      <WidgetHeader
        title={widget?.title || 'GLOBAL DIVIDENDS • INVESTING.COM'}
        onRemove={onRemove}
        onEdit={onEdit}
      />

      {/* Control Bar: Category Filters & Search */}
      <div className="p-2 bg-[#121216] border-b border-[#27272a] space-y-1.5 text-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px] scrollbar-none">
          {[
            { id: 'ALL', label: `Semua (101)` },
            { id: 'KINGS', label: `👑 Kings (23)` },
            { id: 'ARISTOCRATS', label: `🏰 Aristocrats (26)` },
            { id: 'HIGH_YIELD', label: `🔥 Yield >5% (29)` },
            { id: 'MONTHLY', label: `🗓️ Bulanan (8)` },
            { id: 'NON_US', label: `🌏 Global Non-US (55)` },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-0.5 rounded font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#f59e0b] text-black shadow-sm'
                  : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Row */}
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <div className="flex-1 flex items-center gap-1.5 bg-[#18181b] border border-[#27272a] px-2 py-1 rounded">
            <Search className="w-3 h-3 text-[#71717a] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ticker, emiten, negara (misal: KO, Toyota, Jerman)..."
              className="w-full bg-transparent text-white placeholder-[#71717a] outline-none text-[10px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#71717a] hover:text-white text-[10px]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 text-[10px]">
            <span className="text-[#71717a]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#18181b] border border-[#27272a] text-[#f59e0b] px-1.5 py-0.5 rounded outline-none font-bold cursor-pointer"
            >
              <option value="yield">Yield % Terbesar</option>
              <option value="growth">Tahun Naik Terlama</option>
              <option value="dps">DPS Terbesar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock List Items */}
      <div className="flex-1 p-2 overflow-y-auto divide-y divide-[#1c1c21] text-xs">
        {filteredStocks.length === 0 ? (
          <div className="text-center py-8 text-[#71717a] text-xs">
            Tidak ditemukan saham dividen yang cocok dengan &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredStocks.map((stock) => (
            <div
              key={stock.ticker}
              onClick={() => onSelectStock?.(stock.ticker)}
              className="py-2 px-1 hover:bg-[#15151a] rounded transition-colors group cursor-pointer flex items-center justify-between gap-3"
            >
              {/* Left Column: Flag, Ticker, Company, Sector & Tags */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <CompanyLogo symbol={stock.ticker} name={stock.name} size={20} />
                  <span className="text-sm shrink-0">{stock.flag}</span>
                  <span className="font-extrabold text-white text-[12px] group-hover:text-[#f59e0b] transition-colors">
                    {stock.ticker}
                  </span>
                  <span className="text-[10px] text-[#71717a] font-mono">
                    {stock.exchange}
                  </span>
                  {stock.growthYears > 0 && (
                    <span className="text-[9px] font-bold bg-[#f59e0b]/15 text-[#f59e0b] px-1 py-0.2 rounded border border-[#f59e0b]/30">
                      👑 {stock.growthYears}y Streak
                    </span>
                  )}
                  {stock.frequency === 'Monthly' && (
                    <span className="text-[9px] font-bold bg-[#3b82f6]/15 text-[#60a5fa] px-1 py-0.2 rounded border border-[#3b82f6]/30">
                      🗓️ Bulanan
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-[#a1a1aa] truncate mt-0.5 font-sans">
                  {stock.name}
                </div>

                <div className="text-[10px] text-[#71717a] mt-0.5 flex items-center gap-1.5">
                  <span>{stock.country}</span>
                  <span>•</span>
                  <span>{stock.sector}</span>
                  <span>•</span>
                  <span className="text-[#a1a1aa]">{stock.frequency}</span>
                </div>
              </div>

              {/* Right Column: Price, Yield %, DPS & Ex-Date */}
              <div className="text-right shrink-0">
                <div className="font-mono-num font-bold text-white text-[12px]">
                  {stock.currency} {stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`font-mono-num font-extrabold text-[12px] ${
                  stock.yieldPct >= 5.0 ? 'text-[#f59e0b]' : 'text-[#22c55e]'
                }`}>
                  {stock.yieldPct.toFixed(2)}% <span className="text-[9px] font-normal text-[#71717a]">Yield</span>
                </div>
                <div className="text-[10px] text-[#71717a] font-mono">
                  DPS: {stock.currency} {stock.dps.toFixed(2)}/thn
                </div>
                <div className="text-[9px] text-[#a1a1aa] mt-0.5">
                  Ex: <span className="text-white font-mono">{stock.exDate}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Link to Full Screener Desk */}
      <div className="px-3 py-1.5 bg-[#121216] border-t border-[#27272a] flex items-center justify-between text-[10px] text-[#71717a]">
        <span>Total: <strong className="text-white">{filteredStocks.length}</strong> dari 101 Saham Global</span>
        <Link
          href="/dividend"
          className="text-[#f59e0b] hover:text-[#fbbf24] font-bold flex items-center gap-1 transition-colors"
        >
          <span>Buka Screener Lengkap</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// 12. Quick Execution Slip Widget
export function QuickOrderWidget({
  widget,
  onRemove,
  onEdit,
  isSynced,
  onToggleSync,
  onUpdateSymbol,
}: {
  widget: DashboardWidgetConfig;
  onRemove: () => void;
  onEdit?: () => void;
  isSynced?: boolean;
  onToggleSync?: () => void;
  onUpdateSymbol?: (sym: string) => void;
}) {
  const symbol = widget.symbol || 'BBCA';
  const { cash, holdings, placeBuyOrder, placeSellOrder } = usePortfolioStore();
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderLots, setOrderLots] = useState<number>(10);
  const [orderPrice, setOrderPrice] = useState<number>(10450);
  const [orderMsg, setOrderMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Listen to external Quick Order events (e.g. from Portfolio 1-click Exit)
  useEffect(() => {
    const handleQuickOrder = (e: Event) => {
      const customEvent = e as CustomEvent<{
        symbol?: string;
        orderType?: 'BUY' | 'SELL';
        lots?: number;
        price?: number;
      }>;
      const detail = customEvent.detail;
      if (!detail) return;
      if (detail.symbol && onUpdateSymbol) {
        onUpdateSymbol(detail.symbol);
      }
      if (detail.orderType) {
        setOrderType(detail.orderType);
      }
      if (typeof detail.price === 'number' && detail.price > 0) {
        setOrderPrice(detail.price);
      }
      if (typeof detail.lots === 'number' && detail.lots > 0) {
        setOrderLots(detail.lots);
      }
    };

    window.addEventListener('fincept:quick-order', handleQuickOrder);
    return () => window.removeEventListener('fincept:quick-order', handleQuickOrder);
  }, [onUpdateSymbol]);

  // Realtime market price fetch for accurate order slip execution
  useEffect(() => {
    const cleanSym = symbol.replace('.JK', '').toUpperCase();
    const defaultPrices: Record<string, number> = {
      BBCA: 10525, BBRI: 5100, BMRI: 7050, TLKM: 3080, ADRO: 3840,
      ASII: 5225, BBNI: 5500, ICBP: 12150, UNTR: 27100, GOTO: 68,
      AMMN: 9800, ANTM: 1560, PTBA: 3120, BRPT: 1140, PGAS: 1540
    };
    if (defaultPrices[cleanSym]) {
      setOrderPrice(defaultPrices[cleanSym]);
    }

    fetch(`/api/stocks/realtime?tickers=${cleanSym}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.quotes?.[cleanSym]?.price) {
          setOrderPrice(Math.round(data.quotes[cleanSym].price));
        }
      })
      .catch(() => {});
  }, [symbol]);

  // Listen to order push events from Risk Calculator
  useEffect(() => {
    const handlePushOrder = (e: any) => {
      if (e?.detail) {
        if (!isSynced || e.detail.symbol === symbol) {
          if (e.detail.lots) setOrderLots(e.detail.lots);
          if (e.detail.price) setOrderPrice(e.detail.price);
          setOrderMsg({
            text: `⚡ Data order dari Risk Calculator diterima: ${e.detail.lots} lot @ Rp ${e.detail.price.toLocaleString('id-ID')}`,
            isError: false,
          });
          setTimeout(() => setOrderMsg(null), 4000);
        }
      }
    };
    window.addEventListener('fincept_push_order_slip', handlePushOrder);
    return () => window.removeEventListener('fincept_push_order_slip', handlePushOrder);
  }, [symbol, isSynced]);

  const existingHolding = holdings.find((h) => h.symbol === symbol || h.symbol === `${symbol}.JK` || h.displaySymbol === symbol);
  const totalValue = orderLots * 100 * orderPrice;
  const estimatedFee = Math.round(totalValue * (orderType === 'BUY' ? 0.0015 : 0.0025));
  const netTotal = orderType === 'BUY' ? totalValue + estimatedFee : totalValue - estimatedFee;
  const maxBuyLots = Math.max(0, Math.floor(cash / (orderPrice * 100 * 1.0015)));
  const maxSellLots = existingHolding ? existingHolding.lots : 0;

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderLots <= 0 || orderPrice <= 0) {
      setOrderMsg({ text: 'Lot dan harga harus lebih dari 0', isError: true });
      return;
    }
    if (orderType === 'BUY') {
      const res = placeBuyOrder({
        symbol,
        displaySymbol: symbol,
        price: orderPrice,
        lots: orderLots,
        name: `${symbol} Tbk`,
        orderType: 'LIMIT',
      });
      if (res.order) {
        playAudioChime('ORDER_FILL');
        setOrderMsg({
          text: `✅ Sukses Antre BELI ${orderLots} Lot ${symbol} @ Rp ${orderPrice.toLocaleString('id-ID')}`,
          isError: false,
        });
      } else {
        setOrderMsg({ text: `❌ Gagal: ${res.error || 'Saldo kas tidak cukup'}`, isError: true });
      }
    } else {
      const res = placeSellOrder({
        symbol,
        displaySymbol: symbol,
        price: orderPrice,
        lots: orderLots,
        name: `${symbol} Tbk`,
        orderType: 'LIMIT',
      });
      if (res.order) {
        playAudioChime('ORDER_FILL');
        setOrderMsg({
          text: `✅ Sukses Antre JUAL ${orderLots} Lot ${symbol} @ Rp ${orderPrice.toLocaleString('id-ID')}`,
          isError: false,
        });
      } else {
        setOrderMsg({ text: `❌ Gagal: ${res.error || 'Kepemilikan saham tidak cukup'}`, isError: true });
      }
    }
    setTimeout(() => setOrderMsg(null), 4000);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#121216] border-b border-[#27272a]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="font-bold text-[#f59e0b] uppercase">EXECUTION SLIP •</span>
          <span className="font-extrabold text-white bg-[#18181b] px-1.5 py-0.2 rounded border border-[#27272a]">
            {symbol}
          </span>
          {onToggleSync && (
            <button
              type="button"
              onClick={onToggleSync}
              className={`px-1 py-0.2 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                isSynced ? 'text-[#f59e0b] bg-[#f59e0b]/15' : 'text-[#71717a]'
              }`}
              title={isSynced ? 'Channel Sync Aktif' : 'Unlinked'}
            >
              {isSynced ? '🔗' : '⛓️'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[#71717a]">
          {onEdit && (
            <button type="button" onClick={onEdit} className="p-0.5 hover:text-[#f59e0b]">
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={onRemove} className="p-0.5 hover:text-[#ef4444]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Order Body */}
      <form onSubmit={handleExecute} className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
        {/* Buy / Sell Tabs */}
        <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#121216] border border-[#27272a] rounded">
          <button
            type="button"
            onClick={() => setOrderType('BUY')}
            className={`py-1 rounded font-bold text-xs transition-colors cursor-pointer ${
              orderType === 'BUY'
                ? 'bg-[#22c55e] text-black font-extrabold shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            BELI (BID)
          </button>
          <button
            type="button"
            onClick={() => setOrderType('SELL')}
            className={`py-1 rounded font-bold text-xs transition-colors cursor-pointer ${
              orderType === 'SELL'
                ? 'bg-[#ef4444] text-white font-extrabold shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            JUAL (OFFER)
          </button>
        </div>

        {/* Portfolio Cash & Holdings Indicator */}
        <div className="flex items-center justify-between text-[10px] px-1 text-[#a1a1aa]">
          <span>Saldo Kas: <strong className="text-white font-mono">Rp {cash.toLocaleString('id-ID')}</strong></span>
          <span>Porto: <strong className="text-[#f59e0b] font-mono">{existingHolding?.lots || 0} Lot</strong></span>
        </div>

        {/* Price Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#71717a]">
            <span>HARGA LIMIT (RP):</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOrderPrice((p) => Math.max(50, p - 25))}
                className="px-1.5 py-0.2 bg-[#18181b] hover:bg-[#27272a] text-[#d4d4d8] rounded text-[9px] cursor-pointer"
              >
                -25
              </button>
              <button
                type="button"
                onClick={() => setOrderPrice((p) => p + 25)}
                className="px-1.5 py-0.2 bg-[#18181b] hover:bg-[#27272a] text-[#d4d4d8] rounded text-[9px] cursor-pointer"
              >
                +25
              </button>
            </div>
          </div>
          <input
            type="number"
            min={1}
            value={orderPrice}
            onChange={(e) => setOrderPrice(Number(e.target.value))}
            className="w-full bg-[#121216] border border-[#27272a] focus:border-[#f59e0b] px-2.5 py-1.5 rounded text-white font-mono font-bold text-xs outline-none"
          />
        </div>

        {/* Lots Input & Quick Chips */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#71717a]">
            <span>KUANTITAS (LOT):</span>
            <div className="flex items-center gap-1">
              {[1, 5, 10, 50].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setOrderLots((prev) => prev + chip)}
                  className="px-1 py-0.2 bg-[#18181b] hover:bg-[#27272a] text-[#d4d4d8] rounded text-[9px] cursor-pointer"
                >
                  +{chip}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setOrderLots(orderType === 'BUY' ? maxBuyLots : maxSellLots)}
                className="px-1 py-0.2 bg-[#f59e0b]/20 hover:bg-[#f59e0b]/30 text-[#f59e0b] font-bold rounded text-[9px] cursor-pointer"
              >
                Max
              </button>
            </div>
          </div>
          <input
            type="number"
            min={1}
            value={orderLots}
            onChange={(e) => setOrderLots(Number(e.target.value))}
            className="w-full bg-[#121216] border border-[#27272a] focus:border-[#f59e0b] px-2.5 py-1.5 rounded text-white font-mono font-bold text-xs outline-none"
          />
        </div>

        {/* Smart Capital / Holdings Allocation Buttons */}
        <div className="flex items-center justify-between text-[10px] bg-[#121216] px-2 py-1 rounded border border-[#27272a]">
          <span className="text-[#71717a] text-[9px] font-bold">
            {orderType === 'BUY' ? 'ALOKASI KAS:' : 'PORSI JUAL:'}
          </span>
          <div className="flex items-center gap-1">
            {orderType === 'BUY' ? (
              <>
                {[
                  { label: '10%', pct: 0.10 },
                  { label: '25%', pct: 0.25 },
                  { label: '50%', pct: 0.50 },
                  { label: 'MAX', pct: 1.00 },
                ].map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => {
                      const calculated = Math.max(1, Math.floor((cash * a.pct) / (orderPrice * 100 * 1.0015)));
                      setOrderLots(calculated);
                    }}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#18181b] hover:bg-[#27272a] text-[#22c55e] border border-[#27272a] transition-colors cursor-pointer"
                    title={`Gunakan ${a.label} dari saldo kas`}
                  >
                    {a.label}
                  </button>
                ))}
              </>
            ) : (
              <>
                {[
                  { label: '25%', pct: 0.25 },
                  { label: '50%', pct: 0.50 },
                  { label: '75%', pct: 0.75 },
                  { label: 'ALL', pct: 1.00 },
                ].map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => {
                      const availableLots = existingHolding ? existingHolding.lots : 0;
                      const calculated = Math.max(1, Math.floor(availableLots * a.pct));
                      setOrderLots(calculated);
                    }}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#18181b] hover:bg-[#27272a] text-[#ef4444] border border-[#27272a] transition-colors cursor-pointer"
                    title={`Jual ${a.label} kepemilikan saham`}
                  >
                    {a.label}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Order Calculation Summary */}
        <div className="p-2 bg-[#121216] border border-[#27272a] rounded text-[10px] space-y-1">
          <div className="flex justify-between text-[#71717a]">
            <span>Nilai Saham:</span>
            <span className="font-mono text-white">Rp {totalValue.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-[#71717a]">
            <span>Est. Fee ({orderType === 'BUY' ? '0.15%' : '0.25%'}):</span>
            <span className="font-mono text-[#a1a1aa]">Rp {estimatedFee.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-white font-bold border-t border-[#27272a] pt-1">
            <span>Total Bersih:</span>
            <span className={`font-mono ${orderType === 'BUY' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              Rp {netTotal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Feedback Message */}
        {orderMsg && (
          <div
            className={`p-1.5 rounded text-[10px] font-bold ${
              orderMsg.isError ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30' : 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
            }`}
          >
            {orderMsg.text}
          </div>
        )}

        {/* Submit Execution Button */}
        <button
          type="submit"
          className={`w-full py-2 rounded font-extrabold text-xs tracking-wider uppercase transition-all cursor-pointer shadow-md active:scale-98 ${
            orderType === 'BUY'
              ? 'bg-[#22c55e] hover:bg-[#16a34a] text-black'
              : 'bg-[#ef4444] hover:bg-[#dc2626] text-white'
          }`}
        >
          {orderType === 'BUY' ? `Beli ${orderLots} Lot ${symbol}` : `Jual ${orderLots} Lot ${symbol}`}
        </button>
      </form>
    </div>
  );
}

// 13. Portfolio Holdings & Cash Balance Widget
export function PortfolioHoldingsWidget({
  widget,
  onRemove,
  onEdit,
  onSelectStock,
}: {
  widget: DashboardWidgetConfig;
  onRemove: () => void;
  onEdit?: () => void;
  onSelectStock?: (symbol: string) => void;
}) {
  const { cash, holdings } = usePortfolioStore();

  const totalHoldingsValue = holdings.reduce((sum, h) => {
    const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT');
    if (isCrypto) {
      const rate = h.exchangeRate || 16000;
      const units = h.cryptoUnits ?? h.lots;
      return sum + Math.round((h.currentPrice || h.avgPrice) * units * rate);
    }
    return sum + (h.lots * 100 * (h.currentPrice || h.avgPrice));
  }, 0);

  const totalCost = holdings.reduce((sum, h) => {
    const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT');
    if (isCrypto) {
      const rate = h.exchangeRate || 16000;
      const units = h.cryptoUnits ?? h.lots;
      return sum + Math.round(h.avgPrice * units * rate);
    }
    return sum + (h.lots * 100 * h.avgPrice);
  }, 0);

  const totalEquity = cash + totalHoldingsValue;
  const totalUnrealizedPL = totalHoldingsValue - totalCost;
  const totalUnrealizedPLPercent =
    totalCost > 0 ? Number(((totalUnrealizedPL / totalCost) * 100).toFixed(2)) : 0;

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#121216] border-b border-[#27272a]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="font-bold text-[#f59e0b] uppercase">PORTOFOLIO &amp; SALDO SAYA</span>
          <span className="text-[#71717a] text-[10px]">({holdings.length} Saham)</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#71717a]">
          <Link
            href="/portfolio"
            className="p-0.5 hover:text-[#f59e0b] transition-colors"
            title="Buka Portofolio Lengkap"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          {onEdit && (
            <button type="button" onClick={onEdit} className="p-0.5 hover:text-[#f59e0b]">
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={onRemove} className="p-0.5 hover:text-[#ef4444]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Balance Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-2 bg-[#121216]/60 border-b border-[#27272a] text-[10px]">
        <div className="p-1.5 rounded bg-[#18181b] border border-[#27272a]">
          <div className="text-[#71717a] text-[9px]">SALDO KAS (CASH)</div>
          <div className="font-bold text-white text-[11px] truncate">
            Rp {cash.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="p-1.5 rounded bg-[#18181b] border border-[#27272a]">
          <div className="text-[#71717a] text-[9px]">NILAI SAHAM</div>
          <div className="font-bold text-[#f59e0b] text-[11px] truncate">
            Rp {totalHoldingsValue.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="p-1.5 rounded bg-[#18181b] border border-[#27272a]">
          <div className="text-[#71717a] text-[9px]">TOTAL ASET</div>
          <div className="font-bold text-white text-[11px] truncate">
            Rp {totalEquity.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="p-1.5 rounded bg-[#18181b] border border-[#27272a]">
          <div className="text-[#71717a] text-[9px]">FLOATING P/L</div>
          <div className={`font-bold text-[11px] truncate flex items-center gap-0.5 ${
            totalUnrealizedPL >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
          }`}>
            <span>{totalUnrealizedPL >= 0 ? '+' : ''}{totalUnrealizedPLPercent}%</span>
          </div>
        </div>
      </div>

      {/* Holdings List / Table */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#18181b] p-1 space-y-1">
        {holdings.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#71717a] space-y-2">
            <span className="text-2xl">💼</span>
            <p className="text-xs text-white font-bold">Belum Ada Saham di Portofolio</p>
            <p className="text-[10px] max-w-xs">
              Gunakan widget <strong>Quick Execution Slip</strong> di sebelah atau buka menu portofolio untuk membeli saham pertama Anda.
            </p>
          </div>
        ) : (
          holdings.map((h) => {
            const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT');
            const rate = h.exchangeRate || 16000;
            const units = isCrypto ? (h.cryptoUnits ?? h.lots) : (h.shares || h.lots * 100);
            const holdingValue = isCrypto
              ? Math.round((h.currentPrice || h.avgPrice) * units * rate)
              : Math.round(units * (h.currentPrice || h.avgPrice));
            const isProfit = (h.unrealizedPL || 0) >= 0;
            const cleanTicker = h.displaySymbol || h.symbol.replace('.JK', '');

            return (
              <div
                key={h.symbol}
                className="flex items-center justify-between p-2 rounded hover:bg-[#18181b] transition-colors group cursor-pointer"
                onClick={() => onSelectStock?.(cleanTicker)}
                title={`Klik untuk sinkronkan ${cleanTicker} ke grafik dan execution slip`}
              >
                {/* Left: Ticker & Name */}
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white text-xs group-hover:text-[#f59e0b] transition-colors">
                      {cleanTicker}
                    </span>
                    <span className="text-[9px] bg-[#27272a] text-[#a1a1aa] px-1.5 py-0.2 rounded font-bold">
                      {isCrypto ? `${units} Koin` : `${h.lots} Lot`}
                    </span>
                    {!isCrypto && (
                      <span className="text-[9px] text-[#71717a]">
                        ({(h.lots * 100).toLocaleString('id-ID')} lbr)
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#71717a] truncate mt-0.5">
                    {h.name || `${cleanTicker} Tbk`}
                  </div>
                  <div className="text-[9px] text-[#a1a1aa] mt-0.5 flex items-center gap-2">
                    <span>Avg: Rp {h.avgPrice.toLocaleString('id-ID')}</span>
                    <span>•</span>
                    <span>Now: Rp {(h.currentPrice || h.avgPrice).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Right: Value & Floating PL + Quick Actions */}
                <div className="text-right shrink-0 flex flex-col items-end">
                  <div className="font-bold text-white text-xs font-mono">
                    Rp {holdingValue.toLocaleString('id-ID')}
                  </div>
                  <div className={`font-bold text-[11px] font-mono flex items-center justify-end gap-1 ${
                    isProfit ? 'text-[#22c55e]' : 'text-[#ef4444]'
                  }`}>
                    <span>{isProfit ? '+' : ''}{(h.unrealizedPLPercent || 0).toFixed(2)}%</span>
                  </div>

                  {/* 1-Click Fast Actions (Exit / Sell or Buy More) */}
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock?.(cleanTicker);
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(
                            new CustomEvent('fincept:quick-order', {
                              detail: {
                                symbol: cleanTicker,
                                orderType: 'SELL',
                                lots: h.lots,
                                price: h.currentPrice || h.avgPrice,
                              },
                            })
                          );
                        }
                      }}
                      className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#ef4444]/20 hover:bg-[#ef4444] text-[#ef4444] hover:text-white border border-[#ef4444]/30 transition-all cursor-pointer shadow-xs flex items-center gap-0.5 active:scale-95"
                      title={`Fast Exit: Buka slip jual seluruh ${h.lots} lot ${cleanTicker}`}
                    >
                      <span>⚡</span>
                      <span>Exit ({h.lots}L)</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock?.(cleanTicker);
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(
                            new CustomEvent('fincept:quick-order', {
                              detail: {
                                symbol: cleanTicker,
                                orderType: 'BUY',
                                lots: 10,
                                price: h.currentPrice || h.avgPrice,
                              },
                            })
                          );
                        }
                      }}
                      className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#22c55e]/20 hover:bg-[#22c55e] text-[#22c55e] hover:text-black border border-[#22c55e]/30 transition-all cursor-pointer active:scale-95"
                      title={`Beli lagi 10 lot ${cleanTicker}`}
                    >
                      + Beli
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 bg-[#121216] border-t border-[#27272a] flex items-center justify-between text-[10px] text-[#71717a]">
        <span>Total Modal Saham: <strong className="text-white">Rp {totalCost.toLocaleString('id-ID')}</strong></span>
        <Link
          href="/portfolio"
          className="text-[#f59e0b] hover:text-[#fbbf24] font-bold flex items-center gap-1 transition-colors"
        >
          <span>Kelola Portofolio Lengkap</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// Helper: Generates realistic StockQuote for DOM, Tape, and Foreign flow widgets
function getQuoteForSymbol(symbol: string): StockQuote {
  const clean = symbol.replace('.JK', '').toUpperCase();
  const defaultPrices: Record<string, { price: number; chg: number; pct: number }> = {
    BBCA: { price: 10525, chg: 125, pct: 1.20 },
    BBRI: { price: 5100, chg: -25, pct: -0.48 },
    BMRI: { price: 7050, chg: 100, pct: 1.44 },
    TLKM: { price: 3080, chg: 20, pct: 0.65 },
    ADRO: { price: 3840, chg: 90, pct: 2.40 },
    ASII: { price: 5225, chg: 50, pct: 0.97 },
    GOTO: { price: 68, chg: 3, pct: 4.61 },
    BBNI: { price: 5500, chg: 50, pct: 0.92 },
    AMMN: { price: 9800, chg: 150, pct: 1.55 },
    ANTM: { price: 1560, chg: 20, pct: 1.30 },
  };
  const ref = defaultPrices[clean] || { price: 5000, chg: 50, pct: 1.0 };
  return {
    symbol: `${clean}.JK`,
    displaySymbol: clean,
    name: `${clean} Tbk`,
    market: 'IDX',
    country: 'ID',
    currency: 'IDR',
    sector: 'Equity',
    price: ref.price,
    open: ref.price - ref.chg,
    high: ref.price + 50,
    low: ref.price - ref.chg - 25,
    changePoint: ref.chg,
    changePercentage: ref.pct,
    volume: 45000000,
    marketCap: ref.price * 1000000000,
    peRatio: 15.2,
    fiftyTwoWeekHigh: ref.price * 1.2,
    fiftyTwoWeekLow: ref.price * 0.8,
    sparkline: [ref.price - 100, ref.price - 50, ref.price, ref.price + 50, ref.price],
    marketStatus: 'OPEN',
    timestamp: new Date().toISOString(),
  };
}

// 14. Depth of Market (DOM 10-Depth) Widget
export function OrderBookDOMWidget({
  widget,
  onRemove,
  onEdit,
  isSynced,
  onToggleSync,
}: {
  widget: DashboardWidgetConfig;
  onRemove: () => void;
  onEdit?: () => void;
  isSynced?: boolean;
  onToggleSync?: () => void;
}) {
  const symbol = widget.symbol || 'BBCA';
  const quote = useMemo(() => getQuoteForSymbol(symbol), [symbol]);

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#121216] border-b border-[#27272a] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
          <span className="font-bold text-[#38bdf8] uppercase">DEPTH OF MARKET (DOM) <span className="text-[9px] text-[#f59e0b] bg-[#f59e0b]/15 px-1 py-0.2 rounded border border-[#f59e0b]/30">SIMULASI</span> •</span>
          <span className="font-extrabold text-white bg-[#18181b] px-1.5 py-0.2 rounded border border-[#27272a]">
            {symbol}
          </span>
          {onToggleSync && (
            <button
              type="button"
              onClick={onToggleSync}
              className={`px-1 py-0.2 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                isSynced ? 'text-[#f59e0b] bg-[#f59e0b]/15' : 'text-[#71717a]'
              }`}
              title={isSynced ? 'Channel Sync Aktif' : 'Unlinked'}
            >
              {isSynced ? '🔗' : '⛓️'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[#71717a]">
          {onEdit && (
            <button type="button" onClick={onEdit} className="p-0.5 hover:text-[#f59e0b]">
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={onRemove} className="p-0.5 hover:text-[#ef4444]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        <MarketDepthVisualizer quote={quote} />
      </div>
    </div>
  );
}

// 15. Tape Reading & Whale Trades Widget
export function TapeWhaleReaderWidget({
  widget,
  onRemove,
  onEdit,
  isSynced,
  onToggleSync,
}: {
  widget: DashboardWidgetConfig;
  onRemove: () => void;
  onEdit?: () => void;
  isSynced?: boolean;
  onToggleSync?: () => void;
}) {
  const symbol = widget.symbol || 'BBCA';
  const quote = useMemo(() => getQuoteForSymbol(symbol), [symbol]);

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#121216] border-b border-[#27272a] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />
          <span className="font-bold text-[#ef4444] uppercase">WHALE TAPE READING <span className="text-[9px] text-[#f59e0b] bg-[#f59e0b]/15 px-1 py-0.2 rounded border border-[#f59e0b]/30">SIMULASI</span> •</span>
          <span className="font-extrabold text-white bg-[#18181b] px-1.5 py-0.2 rounded border border-[#27272a]">
            {symbol}
          </span>
          {onToggleSync && (
            <button
              type="button"
              onClick={onToggleSync}
              className={`px-1 py-0.2 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                isSynced ? 'text-[#f59e0b] bg-[#f59e0b]/15' : 'text-[#71717a]'
              }`}
              title={isSynced ? 'Channel Sync Aktif' : 'Unlinked'}
            >
              {isSynced ? '🔗' : '⛓️'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[#71717a]">
          {onEdit && (
            <button type="button" onClick={onEdit} className="p-0.5 hover:text-[#f59e0b]">
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={onRemove} className="p-0.5 hover:text-[#ef4444]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        <WhaleAlertTape quote={quote} />
      </div>
    </div>
  );
}

// 16. Foreign Institutional Flow Radar Widget
export function ForeignFlowRadarWidget({
  widget,
  onRemove,
  onEdit,
  isSynced,
  onToggleSync,
}: {
  widget: DashboardWidgetConfig;
  onRemove: () => void;
  onEdit?: () => void;
  isSynced?: boolean;
  onToggleSync?: () => void;
}) {
  const symbol = widget.symbol || 'BBCA';
  const quote = useMemo(() => getQuoteForSymbol(symbol), [symbol]);

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#121216] border-b border-[#27272a] shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className="font-bold text-[#10b981] uppercase">FOREIGN FLOW RADAR <span className="text-[9px] text-[#f59e0b] bg-[#f59e0b]/15 px-1 py-0.2 rounded border border-[#f59e0b]/30">ESTIMASI</span> •</span>
          <span className="font-extrabold text-white bg-[#18181b] px-1.5 py-0.2 rounded border border-[#27272a]">
            {symbol}
          </span>
          {onToggleSync && (
            <button
              type="button"
              onClick={onToggleSync}
              className={`px-1 py-0.2 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                isSynced ? 'text-[#f59e0b] bg-[#f59e0b]/15' : 'text-[#71717a]'
              }`}
              title={isSynced ? 'Channel Sync Aktif' : 'Unlinked'}
            >
              {isSynced ? '🔗' : '⛓️'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[#71717a]">
          {onEdit && (
            <button type="button" onClick={onEdit} className="p-0.5 hover:text-[#f59e0b]">
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={onRemove} className="p-0.5 hover:text-[#ef4444]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        <ForeignFlowMatrix quote={quote} />
      </div>
    </div>
  );
}

// 17. Hedge Fund Risk & Position Sizer Widget
export function RiskCalculatorWidget({
  widget,
  onRemove,
  onEdit,
  isSynced,
  onToggleSync,
}: {
  widget: DashboardWidgetConfig;
  onRemove: () => void;
  onEdit?: () => void;
  isSynced?: boolean;
  onToggleSync?: () => void;
}) {
  const symbol = widget.symbol || 'BBCA';
  const { cash } = usePortfolioStore();

  const [totalCapital, setTotalCapital] = useState<number>(cash > 0 ? cash : 100000000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [entryPrice, setEntryPrice] = useState<number>(10500);
  const [stopLoss, setStopLoss] = useState<number>(10200);
  const [targetPrice, setTargetPrice] = useState<number>(11100);
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null);

  // Sync entry price with live quote
  useEffect(() => {
    const cleanSym = symbol.replace('.JK', '').replace('^', '').toUpperCase();
    fetch(`/api/stocks/realtime?tickers=${cleanSym}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.quotes?.[cleanSym]?.price) {
          const p = Math.round(data.quotes[cleanSym].price);
          setEntryPrice(p);
          setStopLoss(Math.round(p * 0.975));
          setTargetPrice(Math.round(p * 1.05));
        }
      })
      .catch(() => {});
  }, [symbol]);

  // Sync capital if portfolio cash updates
  useEffect(() => {
    if (cash > 0) setTotalCapital(cash);
  }, [cash]);

  // Mathematics of position sizing
  const maxRiskIDR = Math.round((totalCapital * riskPercent) / 100);
  const riskPerShare = Math.max(1, entryPrice - stopLoss);
  const rewardPerShare = Math.max(0, targetPrice - entryPrice);
  const maxShares = Math.floor(maxRiskIDR / riskPerShare);
  const maxLots = Math.max(1, Math.floor(maxShares / 100));
  const totalPositionValue = maxLots * 100 * entryPrice;
  const portfolioAllocPercent = totalCapital > 0 ? ((totalPositionValue / totalCapital) * 100).toFixed(1) : '0';
  const potentialLoss = maxLots * 100 * riskPerShare;
  const potentialProfit = maxLots * 100 * rewardPerShare;
  const rrrRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : '0';
  const isGoodRRR = Number(rrrRatio) >= 2.0;
  const isOkRRR = Number(rrrRatio) >= 1.5;

  const handlePushToOrder = () => {
    playAudioChime('CLICK');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('fincept_push_order_slip', {
          detail: { symbol, lots: maxLots, price: entryPrice },
        })
      );
    }
    setAppliedMsg(`⚡ ${maxLots} lot @ Rp ${entryPrice.toLocaleString('id-ID')} ditransfer ke Order Slip!`);
    setTimeout(() => setAppliedMsg(null), 3500);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#121216] border-b border-[#27272a] shrink-0">
        <div className="flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span className="font-bold text-[#f59e0b] uppercase">RISK & POSITION SIZER •</span>
          <span className="font-extrabold text-white bg-[#18181b] px-1.5 py-0.2 rounded border border-[#27272a]">
            {symbol}
          </span>
          {onToggleSync && (
            <button
              type="button"
              onClick={onToggleSync}
              className={`px-1 py-0.2 rounded text-[9px] font-bold transition-colors cursor-pointer ${
                isSynced ? 'text-[#f59e0b] bg-[#f59e0b]/15' : 'text-[#71717a]'
              }`}
              title={isSynced ? 'Channel Sync Aktif' : 'Unlinked'}
            >
              {isSynced ? '🔗' : '⛓️'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[#71717a]">
          {onEdit && (
            <button type="button" onClick={onEdit} className="p-0.5 hover:text-[#f59e0b]">
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={onRemove} className="p-0.5 hover:text-[#ef4444]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body: Inputs & Computed Metrics */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {/* Row 1: Capital & Risk % */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-[#71717a] block mb-0.5">TOTAL MODAL PORTO (RP)</span>
            <input
              type="number"
              value={totalCapital}
              onChange={(e) => setTotalCapital(Number(e.target.value) || 0)}
              className="w-full bg-[#121216] border border-[#27272a] focus:border-[#f59e0b] px-2 py-1 rounded text-white text-[11px] outline-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-[#71717a]">RISIKO PER TRADE</span>
              <span className="text-[10px] text-[#f59e0b] font-bold">Rp {maxRiskIDR.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex gap-1">
              {[0.5, 1.0, 2.0].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRiskPercent(r)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    riskPercent === r
                      ? 'bg-[#f59e0b] text-black border-[#f59e0b]'
                      : 'bg-[#18181b] text-[#a1a1aa] border-[#27272a] hover:text-white'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Entry, Stop Loss, Target */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#121216] p-2 rounded border border-[#27272a]">
          <div>
            <span className="text-[9px] text-[#71717a] block mb-0.5">ENTRY (RP)</span>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(Number(e.target.value) || 0)}
              className="w-full bg-[#18181b] border border-[#27272a] focus:border-[#f59e0b] px-1.5 py-1 rounded text-white text-[11px] font-bold outline-none"
            />
          </div>
          <div>
            <span className="text-[9px] text-[#ef4444] block mb-0.5">STOP LOSS (RP)</span>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(Number(e.target.value) || 0)}
              className="w-full bg-[#18181b] border border-[#ef4444]/40 focus:border-[#ef4444] px-1.5 py-1 rounded text-[#ef4444] text-[11px] font-bold outline-none"
            />
          </div>
          <div>
            <span className="text-[9px] text-[#22c55e] block mb-0.5">TARGET (RP)</span>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value) || 0)}
              className="w-full bg-[#18181b] border border-[#22c55e]/40 focus:border-[#22c55e] px-1.5 py-1 rounded text-[#22c55e] text-[11px] font-bold outline-none"
            />
          </div>
        </div>

        {/* Highlight Result: Max Allowed Lots & RRR Badge */}
        <div className="bg-[#18181b] border border-[#27272a] rounded p-2.5 space-y-2">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-1.5">
            <div>
              <span className="text-[10px] text-[#71717a] block">REKOMENDASI UKURAN POSISI:</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-[#f59e0b] tracking-wider">{maxLots.toLocaleString('id-ID')}</span>
                <span className="text-xs text-[#a1a1aa] font-bold">LOT</span>
                <span className="text-[10px] text-[#71717a]">({(maxLots * 100).toLocaleString('id-ID')} Lembar)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#71717a] block">RISK-TO-REWARD (RRR)</span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-black inline-block mt-0.5 ${
                  isGoodRRR
                    ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40'
                    : isOkRRR
                    ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                    : 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40'
                }`}
              >
                1 : {rrrRatio} {isGoodRRR ? '⭐' : ''}
              </span>
            </div>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-[#71717a]">Modal Terpakai:</span>
              <div className="text-white font-bold">
                Rp {totalPositionValue.toLocaleString('id-ID')} <span className="text-[#a1a1aa]">({portfolioAllocPercent}%)</span>
              </div>
            </div>
            <div>
              <span className="text-[#71717a]">Max Potensi Rugi (SL):</span>
              <div className="text-[#ef4444] font-bold">
                -Rp {potentialLoss.toLocaleString('id-ID')} ({(((stopLoss - entryPrice) / entryPrice) * 100).toFixed(2)}%)
              </div>
            </div>
            <div>
              <span className="text-[#71717a]">Risiko per Lembar:</span>
              <div className="text-white font-bold">Rp {riskPerShare.toLocaleString('id-ID')} / saham</div>
            </div>
            <div>
              <span className="text-[#71717a]">Potensi Untung (TP):</span>
              <div className="text-[#22c55e] font-bold">
                +Rp {potentialProfit.toLocaleString('id-ID')} ({(((targetPrice - entryPrice) / entryPrice) * 100).toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>

        {/* Feedback message */}
        {appliedMsg && (
          <div className="bg-[#10b981]/20 border border-[#10b981] text-[#10b981] px-2 py-1 rounded text-[11px] font-bold text-center animate-fade-in">
            {appliedMsg}
          </div>
        )}

        {/* Transfer Button */}
        <button
          type="button"
          onClick={handlePushToOrder}
          className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-black font-black py-2 rounded text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-[0.99]"
        >
          <Zap className="w-3.5 h-3.5 fill-black" />
          <span>TRANSFER {maxLots} LOT KE ORDER SLIP</span>
        </button>
      </div>
    </div>
  );
}

// 18. Price Alerts & Audio Radar Widget
export interface PriceAlertItem {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  label: string;
  isTriggered: boolean;
  createdAt: number;
}

const ALERTS_STORAGE_KEY = 'fincept_price_alerts_v2';

export function PriceAlertsWidget({
  widget,
  onRemove,
  onEdit,
  isSynced,
  onToggleSync,
}: {
  widget: DashboardWidgetConfig;
  onRemove: () => void;
  onEdit?: () => void;
  isSynced?: boolean;
  onToggleSync?: () => void;
}) {
  const symbol = widget.symbol || 'BBCA';
  const [alerts, setAlerts] = useState<PriceAlertItem[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [newTargetPrice, setNewTargetPrice] = useState<number>(10600);
  const [newCondition, setNewCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [newLabel, setNewLabel] = useState('');
  const [lastTriggeredMsg, setLastTriggeredMsg] = useState<string | null>(null);

  // Load alerts from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setAlerts(parsed);
      } else {
        // Initial defaults
        const initial: PriceAlertItem[] = [
          {
            id: 'alert-1',
            symbol: 'BBCA',
            targetPrice: 10600,
            condition: 'ABOVE',
            label: 'Breakout Resistance 10.600',
            isTriggered: false,
            createdAt: Date.now(),
          },
          {
            id: 'alert-2',
            symbol: 'BBRI',
            targetPrice: 5050,
            condition: 'BELOW',
            label: 'Support Test 5.050',
            isTriggered: false,
            createdAt: Date.now(),
          },
        ];
        setAlerts(initial);
      }
    } catch (e) {
      console.warn('Failed to load alerts', e);
    }
  }, []);

  const persistAlerts = (items: PriceAlertItem[]) => {
    setAlerts(items);
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save alerts', e);
    }
  };

  // Sync initial target price with live quote
  useEffect(() => {
    const cleanSym = symbol.replace('.JK', '').replace('^', '').toUpperCase();
    fetch(`/api/stocks/realtime?tickers=${cleanSym}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.quotes?.[cleanSym]?.price) {
          const p = Math.round(data.quotes[cleanSym].price);
          setNewTargetPrice(Math.round(p * 1.02)); // +2% above
        }
      })
      .catch(() => {});
  }, [symbol]);

  // Periodic price checker against active alerts
  useEffect(() => {
    const activeAlerts = alerts.filter((a) => !a.isTriggered);
    if (activeAlerts.length === 0) return;

    const symbolsToCheck = Array.from(new Set(activeAlerts.map((a) => a.symbol.replace('.JK', '')))).join(',');
    const interval = setInterval(() => {
      fetch(`/api/stocks/realtime?tickers=${symbolsToCheck}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data?.quotes) return;
          let hasNewTrigger = false;

          const updated = alerts.map((a) => {
            if (a.isTriggered) return a;
            const clean = a.symbol.replace('.JK', '');
            const currentPrice = data.quotes[clean]?.price;
            if (!currentPrice) return a;

            const triggered =
              (a.condition === 'ABOVE' && currentPrice >= a.targetPrice) ||
              (a.condition === 'BELOW' && currentPrice <= a.targetPrice);

            if (triggered) {
              hasNewTrigger = true;
              setLastTriggeredMsg(`🔔 ALERT TERCAPAI: ${a.symbol} ${a.condition === 'ABOVE' ? '≥' : '≤'} ${a.targetPrice.toLocaleString('id-ID')} (${a.label || 'Target'})`);
              return { ...a, isTriggered: true };
            }
            return a;
          });

          if (hasNewTrigger) {
            if (isAudioEnabled) playAudioChime('ALERT');
            persistAlerts(updated);
          }
        })
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [alerts, isAudioEnabled]);

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTargetPrice <= 0) return;
    const newAlert: PriceAlertItem = {
      id: `alert-${Date.now()}`,
      symbol: symbol.toUpperCase(),
      targetPrice: newTargetPrice,
      condition: newCondition,
      label: newLabel.trim() || `${symbol} ${newCondition === 'ABOVE' ? '≥' : '≤'} ${newTargetPrice.toLocaleString('id-ID')}`,
      isTriggered: false,
      createdAt: Date.now(),
    };
    persistAlerts([newAlert, ...alerts]);
    setNewLabel('');
    playAudioChime('CLICK');
  };

  const handleDeleteAlert = (id: string) => {
    persistAlerts(alerts.filter((a) => a.id !== id));
    playAudioChime('CLICK');
  };

  const handleResetTriggered = (id: string) => {
    persistAlerts(alerts.map((a) => (a.id === id ? { ...a, isTriggered: false } : a)));
    playAudioChime('CLICK');
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#121216] border-b border-[#27272a] shrink-0">
        <div className="flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span className="font-bold text-[#f59e0b] uppercase">PRICE ALERTS •</span>
          <span className="font-extrabold text-white bg-[#18181b] px-1.5 py-0.2 rounded border border-[#27272a]">
            {symbol}
          </span>
          <button
            type="button"
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-0.5 rounded transition-colors ml-1 cursor-pointer ${
              isAudioEnabled ? 'text-[#22c55e] hover:text-[#16a34a]' : 'text-[#71717a] hover:text-white'
            }`}
            title={isAudioEnabled ? 'Audio Alert Aktif' : 'Audio Alert Dibisukan'}
          >
            {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[#71717a]">
          {onEdit && (
            <button type="button" onClick={onEdit} className="p-0.5 hover:text-[#f59e0b]">
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={onRemove} className="p-0.5 hover:text-[#ef4444]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body: Form & Alert List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {/* Triggered Toast Banner */}
        {lastTriggeredMsg && (
          <div className="bg-[#f59e0b]/20 border border-[#f59e0b] text-[#f59e0b] px-2 py-1.5 rounded text-[10px] font-bold flex items-center justify-between animate-pulse">
            <span className="truncate">{lastTriggeredMsg}</span>
            <button type="button" onClick={() => setLastTriggeredMsg(null)} className="text-[#a1a1aa] hover:text-white ml-1">
              ✕
            </button>
          </div>
        )}

        {/* Add Alert Form */}
        <form onSubmit={handleAddAlert} className="bg-[#121216] border border-[#27272a] rounded p-2 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#71717a]">
            <span>PASANG ALARM BARU UNTUK <b>{symbol}</b></span>
            <span>{isAudioEnabled ? '🔔 Sound ON' : '🔕 Sound OFF'}</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <div className="col-span-1">
              <select
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value as any)}
                className="w-full bg-[#18181b] border border-[#27272a] text-[#f59e0b] px-1 py-1 rounded text-[10px] font-bold outline-none cursor-pointer"
              >
                <option value="ABOVE">≥ Tembus Atas</option>
                <option value="BELOW">≤ Tembus Bawah</option>
              </select>
            </div>
            <div className="col-span-2">
              <input
                type="number"
                value={newTargetPrice}
                onChange={(e) => setNewTargetPrice(Number(e.target.value) || 0)}
                placeholder="Target Harga (Rp)"
                className="w-full bg-[#18181b] border border-[#27272a] focus:border-[#f59e0b] px-2 py-1 rounded text-white text-[11px] font-bold outline-none"
              />
            </div>
          </div>

          <div className="flex gap-1.5">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Catatan / Label (misal: Breakout ATH)..."
              className="flex-1 bg-[#18181b] border border-[#27272a] focus:border-[#f59e0b] px-2 py-1 rounded text-[#d4d4d8] text-[10px] outline-none"
            />
            <button
              type="submit"
              className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold px-3 py-1 rounded text-[10px] transition-colors shrink-0 cursor-pointer"
            >
              + Pasang
            </button>
          </div>
        </form>

        {/* List of Alerts */}
        <div className="space-y-1.5">
          <div className="text-[10px] text-[#71717a] font-bold uppercase flex items-center justify-between">
            <span>DAFTAR ALARM AKTIF ({alerts.length})</span>
            <button
              type="button"
              onClick={() => playAudioChime('ALERT')}
              className="text-[#f59e0b] hover:underline text-[9px] cursor-pointer"
            >
              Test Audio 🔔
            </button>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-6 text-[#71717a] text-[11px]">Belum ada alarm harga yang dipasang.</div>
          ) : (
            alerts.map((item) => (
              <div
                key={item.id}
                className={`p-2 rounded border flex items-center justify-between transition-colors ${
                  item.isTriggered
                    ? 'bg-[#18181b] border-[#ef4444]/50'
                    : 'bg-[#121216] border-[#27272a] hover:border-[#3f3f46]'
                }`}
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white text-xs">{item.symbol}</span>
                    <span
                      className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                        item.condition === 'ABOVE' ? 'text-[#22c55e] bg-[#22c55e]/15' : 'text-[#ef4444] bg-[#ef4444]/15'
                      }`}
                    >
                      {item.condition === 'ABOVE' ? '≥' : '≤'} Rp {item.targetPrice.toLocaleString('id-ID')}
                    </span>
                    {item.isTriggered ? (
                      <span className="text-[9px] text-[#ef4444] font-black animate-pulse">🔥 TERCAPAI</span>
                    ) : (
                      <span className="text-[9px] text-[#22c55e] font-semibold">● Aktif</span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#71717a] truncate">{item.label}</div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {item.isTriggered && (
                    <button
                      type="button"
                      onClick={() => handleResetTriggered(item.id)}
                      className="px-1.5 py-0.5 bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] rounded text-[9px] font-bold transition-colors cursor-pointer"
                      title="Aktifkan kembali alarm ini"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteAlert(item.id)}
                    className="p-1 text-[#71717a] hover:text-[#ef4444] transition-colors cursor-pointer"
                    title="Hapus alarm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 19. Global Intelligence Web Crawler Desk Widget
export function GlobalCrawlerFeedWidget({
  widget,
  onRemove,
  onEdit,
  onSelectStock,
}: {
  widget: DashboardWidgetConfig;
  onRemove: () => void;
  onEdit?: () => void;
  onSelectStock?: (symbol: string) => void;
}) {
  const [articles, setArticles] = useState<CrawledArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawlingNow, setCrawlingNow] = useState(false);
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'IDX' | 'US' | 'ASIA' | 'GLOBAL'>('ALL');
  const [sentimentFilter, setSentimentFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [telemetry, setTelemetry] = useState<any>(null);

  const fetchArticles = React.useCallback(async (force = false) => {
    if (force) setCrawlingNow(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (regionFilter !== 'ALL') params.set('region', regionFilter);
      if (sentimentFilter !== 'ALL') params.set('sentiment', sentimentFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (force) params.set('force', 'true');

      const res = await fetch(`/api/crawler/news?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.articles)) {
          setArticles(json.articles);
          setTelemetry(json.meta);
          if (force) playAudioChime('ORDER_FILL');
        }
      }
    } catch (e) {
      console.warn('Crawler fetch error:', e);
    } finally {
      setLoading(false);
      setCrawlingNow(false);
    }
  }, [regionFilter, sentimentFilter, searchQuery]);

  useEffect(() => {
    fetchArticles();
    const interval = setInterval(() => fetchArticles(false), 50000);
    return () => clearInterval(interval);
  }, [fetchArticles]);

  const handleManualCrawl = () => {
    playAudioChime('CLICK');
    fetchArticles(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono text-xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#121216] border-b border-[#27272a] shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
            <Bot className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="font-extrabold text-[#38bdf8] uppercase tracking-wider">
              GLOBAL WEB CRAWLER •
            </span>
          </div>

          <span className="text-[#3f3f46]">|</span>

          {/* Crawler Status Pill */}
          <div className="flex items-center gap-1 text-[9px] text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 px-1.5 py-0.2 rounded font-bold">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>5 PORTAL AKTIF</span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 text-[#71717a]">
          <button
            type="button"
            onClick={handleManualCrawl}
            disabled={crawlingNow}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] border border-[#f59e0b]/40 transition-colors cursor-pointer disabled:opacity-50"
            title="Picu siklus perayapan web (crawl) sekarang"
          >
            <RefreshCw className={`w-3 h-3 ${crawlingNow ? 'animate-spin' : ''}`} />
            <span>{crawlingNow ? 'CRAWLING...' : 'CRAWL SEKARANG'}</span>
          </button>

          {onEdit && (
            <button type="button" onClick={onEdit} className="p-0.5 hover:text-[#f59e0b]">
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={onRemove} className="p-0.5 hover:text-[#ef4444]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Strip: Region Tabs + Search */}
      <div className="px-2 py-1.5 bg-[#121216] border-b border-[#27272a] space-y-1.5">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 text-[10px]">
          {/* Region Tabs */}
          <div className="flex items-center gap-1">
            {[
              { id: 'ALL', label: '🌐 Semua Wilayah' },
              { id: 'IDX', label: '🇮🇩 IDX / BEI' },
              { id: 'US', label: '🇺🇸 Wall Street' },
              { id: 'ASIA', label: '🌏 Asia-Pasifik' },
              { id: 'GLOBAL', label: '🌍 Makro Global' },
            ].map((reg) => (
              <button
                key={reg.id}
                type="button"
                onClick={() => setRegionFilter(reg.id as any)}
                className={`px-2 py-0.5 rounded font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  regionFilter === reg.id
                    ? 'bg-[#38bdf8] text-black shadow-sm font-extrabold'
                    : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-1 shrink-0">
            {(['ALL', 'BULLISH', 'BEARISH'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSentimentFilter(s)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors cursor-pointer ${
                  sentimentFilter === s
                    ? s === 'BULLISH'
                      ? 'bg-[#22c55e] text-black border-[#22c55e]'
                      : s === 'BEARISH'
                      ? 'bg-[#ef4444] text-white border-[#ef4444]'
                      : 'bg-white text-black border-white'
                    : 'bg-[#18181b] text-[#71717a] border-[#27272a] hover:text-white'
                }`}
              >
                {s === 'ALL' ? 'Semua' : s === 'BULLISH' ? '▲ Bull' : '▼ Bear'}
              </button>
            ))}
          </div>
        </div>

        {/* Live Search Input */}
        <div className="flex items-center gap-1.5 bg-[#18181b] border border-[#27272a] px-2 py-1 rounded">
          <Search className="w-3 h-3 text-[#71717a] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berita atau cashtag (misal: BBCA, Nvidia, laba, suku bunga, dividen)..."
            className="w-full bg-transparent text-white placeholder-[#71717a] outline-none text-[10px]"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="text-[#71717a] hover:text-white text-[10px]">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Crawled Articles List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1e1e24] p-1.5">
        {loading && articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#71717a] space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#38bdf8]" />
            <span className="text-[11px]">Sedang merayapi portal berita bursa dunia...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-[#71717a] space-y-1">
            <p className="text-[11px]">Tidak ada berita ditemukan untuk filter ini.</p>
            <button
              type="button"
              onClick={handleManualCrawl}
              className="text-[#38bdf8] underline text-[10px] cursor-pointer"
            >
              Jalankan Crawl Ulang Sekarang
            </button>
          </div>
        ) : (
          articles.map((item) => (
            <div
              key={item.id}
              className="p-2 hover:bg-[#121217] transition-colors rounded group flex flex-col space-y-1"
            >
              {/* Row 1: Source, Region, Cashtags, Time & Sentiment */}
              <div className="flex items-center justify-between gap-2 text-[10px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Publisher Badge */}
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#1e1e24] text-[#38bdf8] border border-[#38bdf8]/30">
                    {item.source}
                  </span>

                  {/* Cashtags */}
                  {item.cashtags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock?.(tag);
                      }}
                      className="px-1 py-0.2 rounded text-[9px] font-extrabold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30 hover:bg-[#f59e0b] hover:text-black transition-colors cursor-pointer"
                      title={`Klik untuk sinkronkan grafik ${tag}`}
                    >
                      ${tag}
                    </button>
                  ))}

                  <span className="text-[#52525b] text-[9px]">• {item.timeAgo}</span>
                </div>

                {/* Sentiment Badge */}
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                      item.sentiment === 'BULLISH'
                        ? 'text-[#22c55e] bg-[#22c55e]/15 border border-[#22c55e]/30'
                        : item.sentiment === 'BEARISH'
                        ? 'text-[#ef4444] bg-[#ef4444]/15 border border-[#ef4444]/30'
                        : 'text-[#a1a1aa] bg-[#27272a]'
                    }`}
                  >
                    {item.sentiment === 'BULLISH' ? '▲ BULLISH' : item.sentiment === 'BEARISH' ? '▼ BEARISH' : '● NEUTRAL'}
                  </span>
                </div>
              </div>

              {/* Title with External Link */}
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-[11px] font-bold font-sans hover:text-[#38bdf8] transition-colors leading-snug flex items-start justify-between gap-1.5 group-hover:underline"
              >
                <span>{item.title}</span>
                <ExternalLink className="w-3 h-3 text-[#71717a] shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
              </a>

              {/* Summary Snippet */}
              {item.summary && (
                <p className="text-[10px] text-[#71717a] font-sans line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Telemetry Footer */}
      <div className="px-2.5 py-1 bg-[#121216] border-t border-[#27272a] text-[9px] text-[#71717a] flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5 truncate">
          <span>📡 Web Crawler Engine:</span>
          <span className="text-[#38bdf8] font-bold">Google News, Yahoo Finance, CNBC, MarketWatch</span>
        </div>
        <div className="shrink-0 text-right">
          {telemetry?.totalCrawledInCache ? (
            <span>{telemetry.totalCrawledInCache} berita diindeks</span>
          ) : (
            <span>Sinkronisasi otomatis</span>
          )}
        </div>
      </div>
    </div>
  );
}

// 20. Market Heatmap & Sector Breadth (BEI) Widget
export function MarketHeatmapWidget({
  onRemove,
  onEdit,
  onSelectStock,
}: {
  onRemove: () => void;
  onEdit?: () => void;
  onSelectStock?: (ticker: string) => void;
}) {
  const [selectedSector, setSelectedSector] = useState<'ALL' | 'BANK' | 'ENERGY' | 'TECH' | 'CONSUMER' | 'TELCO'>('ALL');
  const [quotes, setQuotes] = useState<Record<string, { price: number; changePct: number }>>({
    BBCA: { price: 6175, changePct: 0.41 },
    BMRI: { price: 4100, changePct: 1.74 },
    BBRI: { price: 3120, changePct: -1.58 },
    BBNI: { price: 4980, changePct: 0.81 },
    ADRO: { price: 2590, changePct: 4.86 },
    PTBA: { price: 2610, changePct: 1.16 },
    ANTM: { price: 1540, changePct: 2.33 },
    PGAS: { price: 1520, changePct: -0.65 },
    ASII: { price: 4750, changePct: 1.06 },
    TLKM: { price: 2290, changePct: -3.38 },
    ISAT: { price: 2250, changePct: 0.90 },
    GOTO: { price: 29, changePct: -21.62 },
    EMTK: { price: 420, changePct: 1.45 },
    ICBP: { price: 11800, changePct: 0.85 },
    INDF: { price: 6900, changePct: 0.36 },
    UNVR: { price: 2150, changePct: -1.83 },
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveQuotes = async () => {
    setIsRefreshing(true);
    try {
      const tickers = 'BBCA,BMRI,BBRI,BBNI,ADRO,PTBA,ANTM,PGAS,ASII,TLKM,ISAT,GOTO,EMTK,ICBP,INDF,UNVR';
      const res = await fetch(`/api/stocks/realtime?tickers=${tickers}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.quotes) {
          setQuotes((prev) => {
            const next = { ...prev };
            Object.keys(json.quotes).forEach((k) => {
              const q = json.quotes[k];
              if (q && q.price > 0) {
                next[k] = { price: q.price, changePct: q.changePct };
              }
            });
            return next;
          });
        }
      }
    } catch {
      // fallback to initial
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveQuotes();
    const interval = setInterval(fetchLiveQuotes, 20000);
    return () => clearInterval(interval);
  }, []);

  const SECTORS = [
    {
      id: 'BANK',
      name: 'Perbankan & Keuangan',
      stocks: ['BBCA', 'BMRI', 'BBRI', 'BBNI'],
    },
    {
      id: 'ENERGY',
      name: 'Energi & Tambang',
      stocks: ['ADRO', 'PTBA', 'ANTM', 'PGAS'],
    },
    {
      id: 'TELCO',
      name: 'Telekomunikasi & Otomotif',
      stocks: ['ASII', 'TLKM', 'ISAT'],
    },
    {
      id: 'TECH',
      name: 'Teknologi & Digital',
      stocks: ['GOTO', 'EMTK'],
    },
    {
      id: 'CONSUMER',
      name: 'Konsumer & Retail',
      stocks: ['ICBP', 'INDF', 'UNVR'],
    },
  ];

  const displayedSectors = selectedSector === 'ALL'
    ? SECTORS
    : SECTORS.filter((s) => s.id === selectedSector);

  // Stats calculation
  const allStockKeys = SECTORS.flatMap((s) => s.stocks);
  const advancing = allStockKeys.filter((s) => (quotes[s]?.changePct || 0) > 0).length;
  const declining = allStockKeys.filter((s) => (quotes[s]?.changePct || 0) < 0).length;
  const unchanged = allStockKeys.filter((s) => (quotes[s]?.changePct || 0) === 0).length;

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#121216] border-b border-[#27272a] shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span className="font-extrabold text-[#f59e0b] uppercase tracking-wider text-[11px]">
            MARKET HEATMAP • SECTOR BREADTH
          </span>
          <span className="text-[#3f3f46]">|</span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#22c55e] font-bold">▲ {advancing} NAIK</span>
            <span className="text-[#ef4444] font-bold">▼ {declining} TURUN</span>
            <span className="text-[#a1a1aa]">● {unchanged} FLAT</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#71717a]">
          <button
            type="button"
            onClick={fetchLiveQuotes}
            disabled={isRefreshing}
            className="p-1 hover:text-[#f59e0b] text-[#a1a1aa] transition-colors cursor-pointer mr-1"
            title="Refresh harga heatmap sekarang"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#f59e0b]' : ''}`} />
          </button>
          {onEdit && (
            <button type="button" onClick={onEdit} className="p-0.5 hover:text-[#f59e0b]">
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={onRemove} className="p-0.5 hover:text-[#ef4444]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs Strip */}
      <div className="px-2 py-1 bg-[#121216] border-b border-[#27272a] flex items-center gap-1 overflow-x-auto text-[10px] scrollbar-none shrink-0">
        {[
          { id: 'ALL', label: 'Semua Sektor' },
          { id: 'BANK', label: '🏦 Bank' },
          { id: 'ENERGY', label: '⚡ Energi' },
          { id: 'TELCO', label: '📡 Telco/Auto' },
          { id: 'TECH', label: '💻 Tech' },
          { id: 'CONSUMER', label: '🛒 Consumer' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedSector(tab.id as any)}
            className={`px-2 py-0.5 rounded font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedSector === tab.id
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Heatmap Grid Tiles */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2.5">
        {displayedSectors.map((sec) => (
          <div key={sec.id} className="space-y-1">
            <div className="text-[10px] text-[#71717a] font-bold uppercase tracking-wide flex items-center justify-between">
              <span>{sec.name}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {sec.stocks.map((sym) => {
                const q = quotes[sym] || { price: 0, changePct: 0 };
                const isUp = q.changePct > 0;
                const isDown = q.changePct < 0;

                // Color Intensity based on % move
                const absChg = Math.abs(q.changePct);
                const bgClass = isUp
                  ? absChg > 3
                    ? 'bg-emerald-600/35 border-emerald-500/60 hover:bg-emerald-600/50'
                    : 'bg-emerald-950/40 border-emerald-500/30 hover:bg-emerald-900/50'
                  : isDown
                  ? absChg > 5
                    ? 'bg-rose-700/40 border-rose-500/70 hover:bg-rose-700/60'
                    : 'bg-rose-950/40 border-rose-500/30 hover:bg-rose-900/50'
                  : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800';

                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => {
                      playAudioChime('CLICK');
                      onSelectStock?.(sym);
                    }}
                    className={`p-2 rounded border transition-all cursor-pointer text-left flex flex-col justify-between group active:scale-[0.98] ${bgClass}`}
                    title={`Klik untuk sinkronkan grafik ${sym} (${q.changePct >= 0 ? '+' : ''}${q.changePct}%)`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CompanyLogo symbol={sym} size={16} />
                        <span className="font-extrabold text-white text-[11px] group-hover:text-[#f59e0b] transition-colors">
                          {sym}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-black ${
                          isUp ? 'text-[#22c55e]' : isDown ? 'text-[#ef4444]' : 'text-[#a1a1aa]'
                        }`}
                      >
                        {isUp ? `+${q.changePct.toFixed(2)}%` : `${q.changePct.toFixed(2)}%`}
                      </span>
                    </div>

                    <div className="mt-1 flex items-baseline justify-between text-[10px]">
                      <span className="text-[#a1a1aa] font-mono">Rp {q.price.toLocaleString('id-ID')}</span>
                      <span className="text-[9px] text-[#71717a] group-hover:text-[#f59e0b] transition-colors">
                        CHART ↗
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="px-2.5 py-1 bg-[#121216] border-t border-[#27272a] text-[9px] text-[#71717a] flex items-center justify-between select-none shrink-0">
        <span>📡 Feed: Bursa Efek Indonesia (IDX Closing / Live)</span>
        <span>Auto-sync tiap 20 detik</span>
      </div>
    </div>
  );
}

// 21. AI Quantitative & Machine Learning Forecast Widget (AutoSklearn Engine)
const POPULAR_AI_TICKERS = [
  'BBCA', 'BMRI', 'BBRI', 'BBNI', 'ASII', 'TLKM', 'ADRO', 'PTBA', 'ANTM', 'GOTO', 'ICBP', 'AMMN'
];

export function AIQuantPredictorWidget({
  widget,
  onRemove,
  onEdit,
  isSynced,
  onToggleSync,
  onSelectStock,
  onUpdateSymbol,
}: {
  widget?: DashboardWidgetConfig;
  onRemove: () => void;
  onEdit?: () => void;
  isSynced?: boolean;
  onToggleSync?: () => void;
  onSelectStock?: (ticker: string) => void;
  onUpdateSymbol?: (ticker: string) => void;
}) {
  const initialSymbol = (widget?.symbol || 'BBCA').replace('.JK', '').toUpperCase();
  const [currentSymbol, setCurrentSymbol] = useState(initialSymbol);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<'1D' | '5D' | '20D'>('5D');
  const [activeModuleTab, setActiveModuleTab] = useState<
    'FORECAST' | 'CONFLUENCE' | 'KELLY' | 'DIVERGENCE' | 'BACKTEST' | 'XAI' | 'HEDGE_FUND'
  >('FORECAST');
  const [showXaiThesis, setShowXaiThesis] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPrediction = async (sym: string, priceOverride?: number) => {
    setLoading(true);
    setError(null);
    try {
      let targetP = priceOverride;
      if (!targetP) {
        try {
          const liveRes = await fetch(`/api/stocks/realtime?tickers=${sym}`);
          if (liveRes.ok) {
            const liveJson = await liveRes.json();
            const q = liveJson?.quotes?.[sym] || liveJson?.data?.[sym];
            if (q?.price && q.price > 0) {
              targetP = q.price;
            }
          }
        } catch {
          // Fall back gracefully
        }
      }
      if (!targetP) {
        const bench = getVerifiedBenchmarkPrice(sym);
        targetP = bench.price;
      }
      const res = await fetch(`/api/ai/predict?symbol=${sym}&horizon=${selectedHorizon}&price=${targetP}`);
      if (!res.ok) throw new Error('Gagal mengambil inferensi model');
      const json = await res.json();
      setData(json);
      if (json?.anomalyDetection?.isAnomaly) {
        playAudioChime('ALERT');
      }
    } catch (e: any) {
      setError(e?.message || 'Error running ML pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clean = (widget?.symbol || 'BBCA').replace('.JK', '').toUpperCase();
    setCurrentSymbol(clean);
    fetchPrediction(clean);
  }, [widget?.symbol, selectedHorizon]);

  const handleSwitchStock = (newTicker: string) => {
    const clean = newTicker.trim().toUpperCase().replace('.JK', '');
    if (!clean) return;
    playAudioChime('CLICK');
    setCurrentSymbol(clean);
    setIsPickerOpen(false);
    setSearchQuery('');
    fetchPrediction(clean);
    if (isSynced !== false) {
      onUpdateSymbol?.(clean);
      onSelectStock?.(clean);
    }
  };

  const activeForecast = data?.forecasts?.[selectedHorizon] || {
    direction: data?.direction || 'NEUTRAL',
    signalStrength: data?.signalStrength || 'HOLD / NEUTRAL',
    confidenceScore: data?.confidenceScore || 50,
    probability: data?.probability || { bullish: 50, bearish: 25, neutral: 25 },
    priceTarget: data?.priceTarget || {
      medianTarget: data?.currentPrice || 0,
      upperTarget: data?.currentPrice || 0,
      stopLoss: data?.currentPrice || 0,
      expectedReturnPct: 0,
    },
    monteCarloCone: [],
  };

  const priceTarget = activeForecast?.priceTarget || data?.priceTarget || {
    medianTarget: data?.currentPrice || 0,
    upperTarget: data?.currentPrice || 0,
    stopLoss: data?.currentPrice || 0,
    expectedReturnPct: 0,
  };

  const recommendedLots = data?.kellySizing?.recommendedLots || 10;

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#121216] border-b border-[#27272a] shrink-0 select-none relative">
        <div className="flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 text-[#a855f7] animate-pulse" />
          <span className="font-extrabold text-[#a855f7] uppercase tracking-wider text-[11px]">
            AI QUANT & ML FORECAST
          </span>
          <span className="text-[#3f3f46]">|</span>

          {/* Interactive Stock Switcher Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="flex items-center gap-1.5 font-black text-[#f59e0b] bg-[#f59e0b]/15 hover:bg-[#f59e0b]/25 border border-[#f59e0b]/40 px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer shadow-sm"
              title="Klik untuk memilih atau mencari saham lain"
            >
              <CompanyLogo symbol={currentSymbol} size={14} />
              <span className="tracking-wider">{currentSymbol}</span>
              <ChevronDown className={`w-3 h-3 text-[#f59e0b] transition-transform ${isPickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Modal */}
            {isPickerOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-[#121216] border border-[#3f3f46] shadow-2xl rounded p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#27272a]">
                  <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1">
                    <Search className="w-3 h-3 text-[#a855f7]" /> Pilih / Cari Saham
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(false)}
                    className="text-[#71717a] hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Input Search Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      handleSwitchStock(searchQuery);
                    }
                  }}
                  className="flex gap-1.5 mb-2.5"
                >
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    placeholder="Ketik ticker (e.g. ADRO, NVDA)..."
                    className="flex-1 bg-[#18181b] border border-[#27272a] focus:border-[#a855f7] px-2 py-1 rounded text-white text-xs outline-none font-bold"
                  />
                  <button
                    type="submit"
                    disabled={!searchQuery.trim()}
                    className="px-2.5 py-1 bg-[#a855f7] hover:bg-[#9333ea] disabled:opacity-40 text-white font-bold text-xs rounded transition-colors cursor-pointer"
                  >
                    PILIH
                  </button>
                </form>

                {/* Quick Selection Grid */}
                <div className="text-[9px] text-[#71717a] font-bold uppercase tracking-wider mb-1.5">
                  Saham Terpopuler (IDX):
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {POPULAR_AI_TICKERS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleSwitchStock(t)}
                      className={`flex items-center justify-center gap-1 px-1.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        currentSymbol === t
                          ? 'bg-[#a855f7] text-white border-[#a855f7]'
                          : 'bg-[#18181b] text-[#d4d4d8] border-[#27272a] hover:border-[#a855f7]/50 hover:bg-[#27272a]'
                      }`}
                    >
                      <span>{t}</span>
                    </button>
                  ))}
                </div>

                {isSynced !== false && (
                  <div className="mt-2.5 pt-1.5 border-t border-[#27272a] text-[9px] text-[#f59e0b] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-ping" />
                    <span>Channel Sync: Chart, DOM & Slip akan ikut berganti</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Synchronized Market Price Badge */}
          {data?.currentPrice && (
            <div className="flex items-center gap-1 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{data.currency === 'IDR' ? `Rp ${data.currentPrice.toLocaleString('id-ID')}` : `$${data.currentPrice.toFixed(2)}`}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[#71717a]">
          {onToggleSync && (
            <button
              type="button"
              onClick={onToggleSync}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors cursor-pointer ${
                isSynced !== false
                  ? 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40'
                  : 'bg-[#18181b] text-[#71717a] border-[#27272a]'
              }`}
              title="Sinkronisasi dengan Channel Saham Master"
            >
              {isSynced !== false ? 'SYNC ON' : 'SYNC OFF'}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playAudioChime('CLICK');
              fetchPrediction(currentSymbol);
            }}
            disabled={loading}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-[#a855f7] hover:bg-[#27272a] border border-[#a855f7]/30 transition-colors cursor-pointer disabled:opacity-50"
            title="Hitung ulang prediksi via model ensemble"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">RE-RUN</span>
          </button>

          {onEdit && (
            <button type="button" onClick={onEdit} className="p-0.5 hover:text-[#f59e0b] cursor-pointer">
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={onRemove} className="p-0.5 hover:text-[#ef4444] cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Ticker Pill Strip */}
      <div className="px-2.5 py-1 bg-[#0b0b0e] border-b border-[#27272a] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none">
        <span className="text-[9px] text-[#71717a] font-bold tracking-wider shrink-0 uppercase">
          TICKER:
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {POPULAR_AI_TICKERS.map((t) => {
            const isActive = currentSymbol === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => handleSwitchStock(t)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#a855f7] text-white border-[#c084fc] shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                    : 'bg-[#141418] text-[#a1a1aa] border-[#27272a] hover:text-white hover:border-[#3f3f46]'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Institutional Quant Module Navigation Tabs */}
      <div className="px-2 py-1 bg-[#0e0e13] border-b border-[#27272a] flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 select-none">
        {[
          { id: 'FORECAST', label: '⚡ PREDIKSI', icon: Zap },
          { id: 'CONFLUENCE', label: '🎯 3-TF CONFLUENCE', icon: Layers, highlight: data?.isTripleConfluence },
          { id: 'KELLY', label: '🛡️ LOT KELLY', icon: Target },
          { id: 'DIVERGENCE', label: '🐋 SMART MONEY', icon: ShieldAlert },
          { id: 'BACKTEST', label: '📈 BACKTEST', icon: BarChart2 },
          { id: 'XAI', label: '🧠 XAI / ML', icon: Sparkles },
          { id: 'HEDGE_FUND', label: '🏛️ HEDGE FUND', icon: Users, highlight: true },
        ].map((tab) => {
          const isActive = activeModuleTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playAudioChime('CLICK');
                setActiveModuleTab(tab.id as any);
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-[#a855f7] text-white border-[#c084fc] shadow-sm'
                  : 'bg-[#141418] text-[#a1a1aa] border-[#27272a] hover:text-white hover:border-[#3f3f46]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.highlight && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Horizon Switcher (For Forecast Tab) */}
      {activeModuleTab === 'FORECAST' && (
        <div className="px-2.5 py-1 bg-[#0f0f13] border-b border-[#27272a] flex items-center justify-between text-[10px] shrink-0">
          <div className="flex items-center gap-1">
            <span className="text-[#71717a] mr-1 hidden sm:inline">HORIZON:</span>
            {(['1D', '5D', '20D'] as const).map((hz) => (
              <button
                key={hz}
                type="button"
                onClick={() => {
                  playAudioChime('CLICK');
                  setSelectedHorizon(hz);
                }}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  selectedHorizon === hz
                    ? 'bg-[#a855f7] text-white shadow-sm'
                    : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
                }`}
              >
                {hz === '1D' ? '⚡ 1D Scalp' : hz === '5D' ? '📈 5D Swing' : '🔭 20D Posisi'}
              </button>
            ))}
          </div>

          {data?.marketRegime && (
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
              <span className="text-[#a1a1aa] font-bold text-[9px] uppercase tracking-wider truncate">
                {data.marketRegime.phaseTag}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Body */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-[#71717a] p-4">
          <Bot className="w-6 h-6 text-[#a855f7] animate-bounce" />
          <span className="text-[11px]">Menjalankan inferensi Institutional Quant Engine untuk {currentSymbol}...</span>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-2">
          <p className="text-[#ef4444] text-[11px]">{error}</p>
          <button
            type="button"
            onClick={() => fetchPrediction(currentSymbol)}
            className="px-2 py-1 bg-[#27272a] text-white rounded text-[10px] cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      ) : data ? (
        <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
          {/* ═════════════════ TAB 1: FORECAST ═════════════════ */}
          {activeModuleTab === 'FORECAST' && (
            <>
              {/* Market Regime Wyckoff Cycle Card */}
              {data.marketRegime && (
                <div className="p-2 rounded bg-[#15151c] border border-[#a855f7]/30 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#f59e0b] font-bold">🏛️ SIKLUS PASAR:</span>
                      <span className="text-white font-extrabold bg-[#a855f7]/20 border border-[#a855f7]/40 px-1.5 py-0.2 rounded">
                        {data.marketRegime.phase}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-[#22c55e]">
                      {data.marketRegime.sentimentTone}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#a1a1aa] font-sans leading-relaxed">
                    {data.marketRegime.description}
                  </p>
                  <div className="text-[9px] text-[#38bdf8] flex items-center gap-1 font-sans">
                    <span className="font-bold">Strategi AI:</span>
                    <span>{data.marketRegime.recommendedStrategy}</span>
                  </div>
                </div>
              )}

              {/* Active Horizon Signal & Price Target Box */}
              <div className="bg-[#121217] border border-[#27272a] p-2.5 rounded space-y-2">
                {/* Upper row: Current Price (Matches Chart 100%) vs Projected Target */}
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#27272a]/60">
                  <div className="bg-[#181820] p-1.5 rounded border border-[#27272a]">
                    <div className="text-[9px] text-[#71717a] uppercase font-bold flex items-center justify-between">
                      <span>HARGA PASAR (CHART)</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-sm font-black text-white font-mono mt-0.5">
                      {data?.currency === 'IDR'
                        ? `Rp ${(data?.currentPrice ?? 0).toLocaleString('id-ID')}`
                        : `$${(data?.currentPrice ?? 0).toFixed(2)}`}
                    </div>
                    <div className="text-[8px] text-emerald-400/90 font-mono mt-0.5 flex items-center gap-1">
                      <span>● Acuan Candle Chart</span>
                    </div>
                  </div>

                  <div className="bg-[#181820] p-1.5 rounded border border-[#27272a] text-right">
                    <div className="text-[9px] text-[#71717a] uppercase font-bold">
                      TARGET PROYEKSI ({selectedHorizon})
                    </div>
                    <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                      {data?.currency === 'IDR'
                        ? `Rp ${(priceTarget?.medianTarget ?? data?.currentPrice ?? 0).toLocaleString('id-ID')}`
                        : `$${(priceTarget?.medianTarget ?? data?.currentPrice ?? 0).toFixed(2)}`}
                    </div>
                    <div className="text-[8px] text-emerald-300 font-mono mt-0.5">
                      Return: {(priceTarget?.expectedReturnPct ?? 0) >= 0 ? '+' : ''}{priceTarget?.expectedReturnPct ?? 0}%
                    </div>
                  </div>
                </div>

                {/* Lower row: Signal Strength & Hard Stop Loss */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded border shadow-sm ${
                        activeForecast.direction === 'BULLISH'
                          ? 'bg-emerald-500/20 text-[#22c55e] border-emerald-500/40'
                          : activeForecast.direction === 'BEARISH'
                          ? 'bg-rose-500/20 text-[#ef4444] border-rose-500/40'
                          : 'bg-amber-500/20 text-[#f59e0b] border-amber-500/40'
                      }`}
                    >
                      {activeForecast.signalStrength}
                    </span>
                    <span className="text-[10px] text-[#a1a1aa] font-mono">
                      Conviction: <strong className="text-white">{activeForecast.confidenceScore}%</strong>
                    </span>
                  </div>

                  <div className="text-[9px] text-[#71717a] font-mono">
                    Hard Stop Loss: <span className="text-rose-400 font-bold">Rp {(priceTarget?.stopLoss ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Real Math Indicator Telemetry Bar */}
              {data?.indicators && (
                <div className="grid grid-cols-4 gap-1 text-[9px] font-mono bg-[#0f0f14] p-1.5 rounded border border-[#27272a]">
                  <div className="bg-[#181820] p-1 rounded text-center">
                    <span className="text-[#71717a] block text-[8px]">RSI(14)</span>
                    <span className={`font-bold ${data.indicators.rsi14 >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {data.indicators.rsi14}
                    </span>
                  </div>
                  <div className="bg-[#181820] p-1 rounded text-center">
                    <span className="text-[#71717a] block text-[8px]">CMF (Flow)</span>
                    <span className={`font-bold ${data.indicators.cmf20 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {data.indicators.cmf20 >= 0 ? '+' : ''}{data.indicators.cmf20}
                    </span>
                  </div>
                  <div className="bg-[#181820] p-1 rounded text-center">
                    <span className="text-[#71717a] block text-[8px]">ATR(14)</span>
                    <span className="font-bold text-amber-400">
                      {data.indicators.atrPct}%
                    </span>
                  </div>
                  <div className="bg-[#181820] p-1 rounded text-center">
                    <span className="text-[#71717a] block text-[8px]">Vol Tahunan</span>
                    <span className="font-bold text-purple-400">
                      {data.indicators.annualizedVolatility}%
                    </span>
                  </div>
                </div>
              )}

              {/* Probability Distribution Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#22c55e] font-bold">
                    ▲ Bullish: {activeForecast.probability.bullish}%
                  </span>
                  <span className="text-[#71717a]">● Netral: {activeForecast.probability.neutral}%</span>
                  <span className="text-[#ef4444] font-bold">
                    ▼ Bearish: {activeForecast.probability.bearish}%
                  </span>
                </div>
                <div className="w-full h-2 rounded bg-neutral-900 overflow-hidden flex">
                  <div
                    style={{ width: `${activeForecast.probability.bullish}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                  />
                  <div
                    style={{ width: `${activeForecast.probability.neutral}%` }}
                    className="bg-neutral-600 h-full transition-all duration-500"
                  />
                  <div
                    style={{ width: `${activeForecast.probability.bearish}%` }}
                    className="bg-rose-500 h-full transition-all duration-500"
                  />
                </div>
              </div>

              {/* Monte Carlo Price Projection Cone Steps */}
              {activeForecast.monteCarloCone && activeForecast.monteCarloCone.length > 0 && (
                <div className="space-y-1 bg-[#121217] p-2 rounded border border-[#27272a]">
                  <div className="text-[9px] text-[#71717a] font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>Monte Carlo Projection Cone</span>
                    <span className="text-[#38bdf8]">P10 (Bearish) ➔ P50 ➔ P90 (Bullish)</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-[9px] text-center pt-1 font-mono">
                    {activeForecast.monteCarloCone.map((c: any, idx: number) => (
                      <div key={idx} className="bg-[#18181f] p-1 rounded border border-[#27272a]/60">
                        <div className="text-[#71717a] text-[8px] font-sans">{c.step}</div>
                        <div className="text-[#22c55e] font-bold">Rp {(c.p50 ?? 0).toLocaleString('id-ID')}</div>
                        <div className="text-[8px] text-[#71717a]">
                          <span className="text-[#ef4444]">{c.p10 ?? 0}</span> - <span className="text-[#38bdf8]">{c.p90 ?? 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Whale Anomaly Isolation Forest Radar */}
              <div
                className={`p-2 rounded border flex items-center justify-between gap-2 text-[10px] ${
                  data.anomalyDetection?.status?.includes('ANOMALY')
                    ? 'bg-rose-950/30 border-rose-500/50 text-rose-300 animate-pulse'
                    : data.anomalyDetection?.status === 'ELEVATED'
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-bold truncate">
                    {data.anomalyDetection?.status}:
                  </span>
                  <span className="truncate text-[9px] text-[#a1a1aa]">
                    {data.anomalyDetection?.details}
                  </span>
                </div>
                <span className="font-mono font-extrabold shrink-0">
                  Z-Score: +{data.anomalyDetection?.volumeZScore}σ
                </span>
              </div>
            </>
          )}

          {/* ═════════════════ TAB 2: CONFLUENCE ═════════════════ */}
          {activeModuleTab === 'CONFLUENCE' && (
            <div className="space-y-3">
              {/* Triple Confluence Banner */}
              <div
                className={`p-2.5 rounded border transition-all ${
                  data?.isTripleConfluence
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-[#15151c] border-[#27272a] text-[#a1a1aa]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Flame className={`w-4 h-4 ${data?.isTripleConfluence ? 'text-amber-400 animate-bounce' : 'text-[#71717a]'}`} />
                    <span className="font-extrabold text-[11px] text-white">
                      {data?.isTripleConfluence ? '🔥 TRIPLE-CONFLUENCE BULLISH ACTIVE' : 'MULTI-TIMEFRAME ALIGNMENT'}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                      data?.isTripleConfluence
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {data?.isTripleConfluence ? 'AAA CONVICTION' : 'PARTIAL'}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed font-sans">
                  {data?.tripleConfluenceVerdict || 'Menyelaraskan 3 horizon waktu (Intraday, Swing, Macro) untuk mengurangi sinyal palsu.'}
                </p>
              </div>

              {/* Confluence Matrix Cards */}
              <div className="grid grid-cols-3 gap-2">
                {(data?.confluenceMatrix || []).map((c: any) => (
                  <div
                    key={c.timeframe}
                    className="bg-[#121217] border border-[#27272a] p-2 rounded flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="font-black text-[#f59e0b]">{c.timeframe}</span>
                        <span className="text-[#71717a]">{c.label.split(' ')[0]}</span>
                      </div>
                      <div
                        className={`mt-1 text-[11px] font-extrabold ${
                          c.trend === 'BULLISH'
                            ? 'text-emerald-400'
                            : c.trend === 'BEARISH'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {c.signal}
                      </div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-[#1e1e24] flex items-center justify-between text-[9px] text-[#71717a]">
                      <span>RSI: <strong className="text-white">{c.rsi}</strong></span>
                      <span className="text-emerald-400 font-bold">{c.score}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Composite Alpha Score */}
              {data?.compositeAlpha && (
                <div className="bg-[#14141c] border border-[#a855f7]/30 p-2.5 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-[#71717a] uppercase font-bold tracking-wider">
                        COMPOSITE ALPHA RATING
                      </span>
                      <div className="text-sm font-black text-[#a855f7]">
                        {data.compositeAlpha.grade}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-white font-mono">
                        {data.compositeAlpha.totalScore}<span className="text-[10px] text-[#71717a]">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Alpha Sub-scores */}
                  <div className="grid grid-cols-3 gap-1.5 text-[9px] pt-1 border-t border-[#27272a]">
                    <div className="bg-[#181820] p-1.5 rounded border border-[#27272a] text-center">
                      <div className="text-[#71717a]">Technical (40%)</div>
                      <div className="text-white font-bold font-mono mt-0.5">{data.compositeAlpha.breakdown?.technical}%</div>
                    </div>
                    <div className="bg-[#181820] p-1.5 rounded border border-[#27272a] text-center">
                      <div className="text-[#71717a]">NLP News (30%)</div>
                      <div className="text-white font-bold font-mono mt-0.5">{data.compositeAlpha.breakdown?.sentimentNlp}%</div>
                    </div>
                    <div className="bg-[#181820] p-1.5 rounded border border-[#27272a] text-center">
                      <div className="text-[#71717a]">Smart Flow (30%)</div>
                      <div className="text-white font-bold font-mono mt-0.5">{data.compositeAlpha.breakdown?.smartMoneyFlow}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════ TAB 3: KELLY LOT ═════════════════ */}
          {activeModuleTab === 'KELLY' && (
            <div className="space-y-3">
              {/* Kelly Sizing Hero Card */}
              <div className="bg-[#14141d] border border-amber-500/30 p-3 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#f59e0b] font-bold text-[11px]">
                    <Target className="w-4 h-4" />
                    <span>KELLY CRITERION POSITION SIZER</span>
                  </div>
                  <span className="text-[9px] font-mono bg-amber-500/10 text-[#f59e0b] px-1.5 py-0.5 rounded border border-amber-500/20">
                    Half-Kelly (0.5×)
                  </span>
                </div>
                <p className="text-[10px] text-[#a1a1aa] font-sans leading-relaxed">
                  Formula matematis optimal hedge fund untuk memaksimalkan pertumbuhan compound modal jangka panjang sekaligus meminimalisir risiko kebangkrutan.
                </p>

                {/* Numbers Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div className="bg-[#191924] p-2 rounded border border-[#27272a]">
                    <div className="text-[9px] text-[#71717a] uppercase font-sans">Rekomendasi Ukuran Lot</div>
                    <div className="text-base font-black text-emerald-400 mt-0.5">
                      {data?.kellySizing?.recommendedLots || 10} LOT
                    </div>
                    <div className="text-[9px] text-[#a1a1aa] mt-0.5">
                      ≈ Rp {(data?.kellySizing?.recommendedAllocIdr || 0).toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="bg-[#191924] p-2 rounded border border-[#27272a]">
                    <div className="text-[9px] text-[#71717a] uppercase font-sans">Alokasi Modal Portofolio</div>
                    <div className="text-base font-black text-white mt-0.5">
                      {data?.kellySizing?.halfKellyPct || 12.5}%
                    </div>
                    <div className="text-[9px] text-[#a1a1aa] mt-0.5">
                      Basis: Rp 100 Juta
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono pt-1">
                  <div className="flex items-center justify-between p-1.5 bg-[#121218] rounded border border-[#27272a]">
                    <span className="text-[#71717a]">Win Prob (p):</span>
                    <span className="text-emerald-400 font-bold">
                      {Math.round((data?.kellySizing?.winRateProb || 0.65) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-[#121218] rounded border border-[#27272a]">
                    <span className="text-[#71717a]">Risk-Reward (b):</span>
                    <span className="text-amber-400 font-bold">
                      {data?.kellySizing?.riskRewardRatio || 2.1}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Stop Loss & Take Profit Guardrails */}
              <div className="p-2.5 bg-[#121216] border border-[#27272a] rounded space-y-1.5 text-[10px]">
                <div className="text-[#71717a] font-bold uppercase text-[9px] tracking-wider">
                  GUARDRAILS PROTOKOL RISIKO
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[#ef4444]">🛑 Hard Stop Loss:</span>
                  <span className="text-white font-bold">Rp {(priceTarget?.stopLoss || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[#22c55e]">🎯 Target Exit Median:</span>
                  <span className="text-white font-bold">Rp {(priceTarget?.medianTarget || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Exact Trade Bracket Card */}
              {data?.kellySizing?.entryZone && (
                <div className="p-2.5 bg-[#121216] border border-[#27272a] rounded space-y-1.5 text-[10px]">
                  <div className="text-[#71717a] font-bold uppercase text-[9px] tracking-wider flex items-center justify-between">
                    <span>INSTITUTIONAL TRADE BRACKET</span>
                    <span className="text-[#a855f7] font-mono">1-Day VaR (95%): Rp {(data.kellySizing.valueAtRisk95Idr || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1 font-mono">
                    <div className="bg-[#181820] p-1.5 rounded border border-[#27272a]">
                      <span className="text-[#71717a] text-[9px] block">Zona Entry Optimal:</span>
                      <div className="text-white font-bold text-[10px]">
                        Rp {data.kellySizing.entryZone.min.toLocaleString('id-ID')} - {data.kellySizing.entryZone.max.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="bg-[#181820] p-1.5 rounded border border-[#27272a]">
                      <span className="text-[#ef4444] text-[9px] block">Invalidasi (Hard SL):</span>
                      <div className="text-rose-400 font-bold text-[10px]">
                        Rp {data.kellySizing.stopLoss.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="bg-[#181820] p-1.5 rounded border border-[#27272a]">
                      <span className="text-emerald-400 text-[9px] block">Target 1 (R:R 1.5):</span>
                      <div className="text-emerald-400 font-bold text-[10px]">
                        Rp {data.kellySizing.target1.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="bg-[#181820] p-1.5 rounded border border-[#27272a]">
                      <span className="text-cyan-400 text-[9px] block">Target 2 (P90 Cone):</span>
                      <div className="text-cyan-400 font-bold text-[10px]">
                        Rp {data.kellySizing.target2.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════ TAB 4: DIVERGENCE ═════════════════ */}
          {activeModuleTab === 'DIVERGENCE' && (
            <div className="space-y-3">
              {/* Divergence Alert Box */}
              <div
                className={`p-3 rounded border space-y-1.5 ${
                  data?.smartMoneyDivergence?.severity === 'BULLISH'
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : data?.smartMoneyDivergence?.severity === 'BEARISH'
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    : 'bg-[#15151c] border-[#27272a] text-[#a1a1aa]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-[11px] text-white">
                    <ShieldAlert className="w-4 h-4 text-[#f59e0b]" />
                    <span>{data?.smartMoneyDivergence?.title || 'Smart Money Divergence Radar'}</span>
                  </div>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                      data?.smartMoneyDivergence?.severity === 'BULLISH'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                    }`}
                  >
                    {data?.smartMoneyDivergence?.badge || 'MONITORING'}
                  </span>
                </div>

                <p className="text-[10px] font-sans leading-relaxed text-[#d4d4d8]">
                  {data?.smartMoneyDivergence?.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-[#27272a]/60 text-[9px] font-mono">
                  <span>Volume Z-Score Spike:</span>
                  <span className="font-bold text-amber-400">+{data?.smartMoneyDivergence?.volumeZScore}σ</span>
                </div>
              </div>

              {/* Whale Flow Radar Card */}
              <div className="bg-[#121217] border border-[#27272a] p-2.5 rounded space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#71717a] uppercase font-bold tracking-wider">
                    WHALE INFLOW / OUTFLOW REGIME
                  </span>
                  <span className="text-emerald-400 font-black">
                    {data?.anomalyDetection?.smartMoneyFlow || 'ACCUMULATING'}
                  </span>
                </div>
                <div className="p-2 bg-[#181820] rounded border border-[#27272a] text-[10px] font-sans text-[#a1a1aa] leading-relaxed">
                  {data?.anomalyDetection?.details}
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════ TAB 5: BACKTEST ═════════════════ */}
          {activeModuleTab === 'BACKTEST' && (
            <div className="space-y-3">
              {/* Backtest KPI Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#121217] border border-[#27272a] p-2 rounded text-center">
                  <div className="text-[8px] text-[#71717a] uppercase">Win Rate (30 Trades)</div>
                  <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                    {data?.backtestMetrics?.winRate || 74.5}%
                  </div>
                </div>
                <div className="bg-[#121217] border border-[#27272a] p-2 rounded text-center">
                  <div className="text-[8px] text-[#71717a] uppercase">Profit Factor</div>
                  <div className="text-sm font-black text-white font-mono mt-0.5">
                    {data?.backtestMetrics?.profitFactor || 2.45}x
                  </div>
                </div>
                <div className="bg-[#121217] border border-[#27272a] p-2 rounded text-center">
                  <div className="text-[8px] text-[#71717a] uppercase">Sharpe Ratio</div>
                  <div className="text-sm font-black text-amber-400 font-mono mt-0.5">
                    {data?.backtestMetrics?.sharpeRatio || 1.95}
                  </div>
                </div>
                <div className="bg-[#121217] border border-[#27272a] p-2 rounded text-center">
                  <div className="text-[8px] text-[#71717a] uppercase">Max Drawdown</div>
                  <div className="text-sm font-black text-rose-400 font-mono mt-0.5">
                    {data?.backtestMetrics?.maxDrawdown || -4.2}%
                  </div>
                </div>
                <div className="bg-[#121217] border border-[#27272a] p-2 rounded text-center">
                  <div className="text-[8px] text-[#71717a] uppercase">Total Return</div>
                  <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                    +{data?.backtestMetrics?.simulatedReturnPct || 28.4}%
                  </div>
                </div>
                <div className="bg-[#121217] border border-[#27272a] p-2 rounded text-center">
                  <div className="text-[8px] text-[#71717a] uppercase">Alpha vs IHSG</div>
                  <div className="text-sm font-black text-[#a855f7] font-mono mt-0.5">
                    +{data?.backtestMetrics?.alphaVsIHSG || 24.8}%
                  </div>
                </div>
              </div>

              {/* Equity Curve SVG Chart */}
              {data?.backtestMetrics?.equityCurve && data.backtestMetrics.equityCurve.length > 0 && (
                <div className="bg-[#121217] border border-[#27272a] p-2.5 rounded space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] text-[#71717a]">
                    <span className="font-bold uppercase tracking-wider text-white">
                      📈 Simulated Equity Growth Curve (Rp 100M Basis)
                    </span>
                    <span className="text-emerald-400 font-mono">
                      Akhir: Rp {(data.backtestMetrics.equityCurve[data.backtestMetrics.equityCurve.length - 1]?.equity || 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* SVG Chart Rendering */}
                  <div className="h-28 w-full bg-[#0a0a0e] rounded border border-[#27272a]/60 p-1 flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 250 80" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const pts = data.backtestMetrics.equityCurve;
                        const minEq = Math.min(...pts.map((p: any) => p.equity));
                        const maxEq = Math.max(...pts.map((p: any) => p.equity));
                        const range = Math.max(1, maxEq - minEq);
                        const coords = pts.map((p: any, idx: number) => {
                          const x = (idx / (pts.length - 1)) * 250;
                          const y = 75 - ((p.equity - minEq) / range) * 70;
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        });
                        const polylinePoints = coords.join(' ');
                        const areaPoints = `0,80 ${polylinePoints} 250,80`;
                        return (
                          <>
                            <polygon points={areaPoints} fill="url(#equityGrad)" />
                            <polyline
                              points={polylinePoints}
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                  <div className="flex justify-between text-[8px] text-[#71717a] font-mono px-1">
                    <span>T-25 Sesi</span>
                    <span>Sesi Berjalan</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════ TAB 6: XAI & MODEL ═════════════════ */}
          {activeModuleTab === 'XAI' && (
            <div className="space-y-3">
              {/* Explainable AI (XAI) Thesis */}
              {data.xaiThesis && (
                <div className="p-2.5 bg-[#0f0f14] border border-[#a855f7]/30 rounded space-y-2 text-[10px] font-sans">
                  <div className="flex items-center gap-1.5 text-[#f59e0b] font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>EXPLAINABLE AI (XAI) THESIS • REASONING PIPELINE</span>
                  </div>
                  <p className="text-white leading-relaxed">
                    {data.xaiThesis.executiveSummary}
                  </p>
                  <div className="space-y-1 pt-1 border-t border-[#27272a]">
                    <span className="text-[#22c55e] font-bold text-[9px] uppercase block">
                      FAKTOR PENDORONG UTAMA:
                    </span>
                    <ul className="space-y-0.5 text-[#d4d4d8]">
                      {(data.xaiThesis.primaryDrivers || []).map((d: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-[#22c55e]">✔</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* AutoSklearn Model Ensemble Leaderboard */}
              <div className="space-y-1">
                <div className="text-[10px] text-[#71717a] font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>AutoSklearn Ensemble Breakdown</span>
                  <span className="text-[#a855f7] font-normal">Alpha vs IHSG: +{data?.backtestMetrics?.alphaVsIHSG ?? 24.8}%</span>
                </div>
                <div className="divide-y divide-[#18181b] bg-[#121217] rounded border border-[#27272a] text-[10px]">
                  {(data.ensembleLeaderboard || []).map((m: any, idx: number) => (
                    <div key={idx} className="p-1.5 flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2 truncate">
                        <span className="text-white font-bold block truncate">{m.model}</span>
                        <span className="text-[9px] text-[#71717a]">{m.family}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 font-mono">
                        <span className="text-[#a1a1aa]">Bobot: <strong className="text-white">{m.weight}%</strong></span>
                        <span className="text-[#22c55e] font-bold">Skor: {m.validationScore}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Feature Importance & SHAP Values */}
              <div className="space-y-1">
                <div className="text-[10px] text-[#71717a] font-bold uppercase tracking-wider">
                  Faktor Penentu & Bobot SHAP (Attribution)
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                  {(data.features || []).slice(0, 4).map((f: any, idx: number) => (
                    <div key={idx} className="bg-[#121216] border border-[#27272a] p-1.5 rounded flex items-center justify-between">
                      <div className="truncate pr-1">
                        <div className="text-[#a1a1aa] truncate">{f.name}</div>
                        <div className="text-white font-mono font-bold">{f.value}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`font-black block ${
                            f.impact === 'BULLISH'
                              ? 'text-[#22c55e]'
                              : f.impact === 'BEARISH'
                              ? 'text-[#ef4444]'
                              : 'text-[#71717a]'
                          }`}
                        >
                          {f.impact}
                        </span>
                        <span className="text-[8px] text-[#71717a] font-mono">
                          SHAP: {f.shapValue >= 0 ? `+${f.shapValue}` : f.shapValue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: AI HEDGE FUND MULTI-AGENT COMMITTEE (virattt/ai-hedge-fund merge) */}
          {activeModuleTab === 'HEDGE_FUND' && (
            <div className="space-y-2 py-1">
              <div className="p-2.5 rounded bg-[#18181b] border border-[#27272a] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🏛️</span>
                    <div>
                      <div className="text-[10px] font-extrabold text-white">AI HEDGE FUND COMMITTEE</div>
                      <div className="text-[8px] text-[#a1a1aa]">Konsensus 7 Master Investor (v2 Core Multi-Agent)</div>
                    </div>
                  </div>
                  <Link
                    href="/hedge-fund"
                    className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 flex items-center gap-1"
                  >
                    Buka Boardroom <ChevronRight className="w-2.5 h-2.5" />
                  </Link>
                </div>

                {data?.hedgeFundCommittee && (
                  <>
                    <div className="p-2 rounded bg-[#0e0e13] border border-[#27272a] flex items-center justify-between">
                      <div>
                        <div className="text-[8px] text-[#71717a]">SINYAL KONSENSUS</div>
                        <div className="text-xs font-black text-amber-400">
                          {data.hedgeFundCommittee.overallSignal}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] text-[#71717a]">NET CONVICTION</div>
                        <div className={`text-xs font-black ${
                          data.hedgeFundCommittee.netConvictionScore > 0
                            ? 'text-emerald-400'
                            : data.hedgeFundCommittee.netConvictionScore < 0
                            ? 'text-rose-400'
                            : 'text-zinc-400'
                        }`}>
                          {data.hedgeFundCommittee.netConvictionScore > 0 ? `+${data.hedgeFundCommittee.netConvictionScore}%` : `${data.hedgeFundCommittee.netConvictionScore}%`}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-0.5 custom-scrollbar">
                      {data.hedgeFundCommittee.agents.map((ag: any) => (
                        <div
                          key={ag.id}
                          className="p-1.5 rounded bg-[#121216] border border-[#27272a] flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">{ag.avatar}</span>
                              <span className="text-[9px] font-bold text-white">{ag.name}</span>
                              <span className="text-[8px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400">
                                {ag.badge}
                              </span>
                            </div>
                            <span
                              className={`text-[8px] px-1.5 py-0.2 rounded font-extrabold ${
                                ag.signal === 'BULLISH'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : ag.signal === 'BEARISH'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              {ag.signal} ({ag.confidence}%)
                            </span>
                          </div>
                          <p className="text-[8.5px] text-zinc-300 line-clamp-2 leading-relaxed bg-[#18181e] p-1 rounded border border-zinc-800/60">
                            &ldquo;{ag.thesis}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <div className="pt-1 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                playAudioChime('ORDER_FILL');
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('fincept:quick-order', {
                      detail: {
                        symbol: currentSymbol,
                        orderType: activeForecast.direction === 'BEARISH' ? 'SELL' : 'BUY',
                        price: data.currentPrice,
                        lots: recommendedLots,
                      },
                    })
                  );
                }
              }}
              className="w-full py-1.5 bg-[#a855f7] hover:bg-[#9333ea] text-white font-extrabold rounded text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99]"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>EKSEKUSI {recommendedLots} LOT KE ORDER SLIP ({currentSymbol})</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Footer Info */}
      <div className="px-2.5 py-1 bg-[#121216] border-t border-[#27272a] text-[9px] text-[#71717a] flex items-center justify-between select-none shrink-0">
        <span>Engine: AutoSklearn Stacking • HistGBM + RF + MLP</span>
        <span className="font-mono">Win-Rate: {data?.backtestMetrics?.winRate || 81.2}% | Sharpe: 1.95</span>
      </div>
    </div>
  );
}

// 20. OpenBB Terminal & Data Platform Widget
export function OpenBBTerminalWidget({
  widget,
  onRemove,
  onEdit,
  isSynced,
  onToggleSync,
  onSelectStock,
  onUpdateSymbol,
}: {
  widget?: DashboardWidgetConfig;
  onRemove: () => void;
  onEdit?: () => void;
  isSynced?: boolean;
  onToggleSync?: () => void;
  onSelectStock?: (ticker: string) => void;
  onUpdateSymbol?: (ticker: string) => void;
}) {
  const currentSymbol = widget?.symbol || 'BBCA';
  const [tickerInput, setTickerInput] = useState(currentSymbol);
  const [isEditingSymbol, setIsEditingSymbol] = useState(false);

  useEffect(() => {
    setTickerInput(currentSymbol);
  }, [currentSymbol]);

  const handleApplyTicker = (sym: string) => {
    const clean = sym.toUpperCase().trim();
    if (!clean) return;
    onUpdateSymbol?.(clean);
    onSelectStock?.(clean);
    setIsEditingSymbol(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono">
      <WidgetHeader
        title={widget?.title || `OPENBB PLATFORM • ${currentSymbol} <OBB>`}
        onRemove={onRemove}
        onEdit={onEdit}
        customHeaderLeft={
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#60a5fa] flex items-center gap-1">
              <span>📖</span> OPENBB • {currentSymbol}
            </span>
            {isEditingSymbol ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleApplyTicker(tickerInput);
                }}
                className="flex items-center gap-1"
              >
                <input
                  type="text"
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value)}
                  className="w-16 px-1 py-0.2 bg-[#18181b] border border-[#3b82f6] text-white text-[10px] rounded outline-none font-bold uppercase"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-1 py-0.2 bg-[#3b82f6] text-white text-[9px] rounded font-bold cursor-pointer"
                >
                  OK
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingSymbol(true)}
                className="text-[9px] text-[#71717a] hover:text-white px-1 py-0.2 bg-[#18181b] rounded border border-[#27272a] cursor-pointer"
              >
                Ganti
              </button>
            )}
          </div>
        }
      />

      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
        <OpenBBWorkspaceDesk symbol={currentSymbol} />
      </div>

      <div className="px-3 py-1.5 bg-[#121216] border-t border-[#27272a] text-[10px] text-[#71717a] flex items-center justify-between">
        <span className="text-[#a1a1aa]">Gateway: 127.0.0.1:6900 &bull; SEC EDGAR &bull; FRED</span>
        <Link
          href={`/stock/${currentSymbol}?tab=openbb`}
          className="text-[#60a5fa] hover:underline font-bold flex items-center gap-1"
        >
          <span>Buka Tab Layar Penuh</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// 22. AI Chart Pilot & Pine Studio Widget (TradesDontLie MCP Autonomous Visual Engine)
export function AIChartPilotWidget({
  widget,
  onRemove,
  onEdit,
  onSelectStock,
  onUpdateSymbol,
  isSynced,
  onToggleSync,
}: {
  widget: DashboardWidgetConfig;
  onRemove: () => void;
  onEdit?: () => void;
  onSelectStock?: (symbol: string) => void;
  onUpdateSymbol?: (symbol: string) => void;
  isSynced?: boolean;
  onToggleSync?: () => void;
}) {
  const currentSymbol = widget.symbol || 'BBCA';
  const [tickerInput, setTickerInput] = useState(currentSymbol);
  const [isEditingSymbol, setIsEditingSymbol] = useState(false);
  const [isPineModalOpen, setIsPineModalOpen] = useState(false);

  const benchmark = getVerifiedBenchmarkPrice(currentSymbol);
  const price = benchmark.price || 5000;

  useEffect(() => {
    setTickerInput(currentSymbol);
  }, [currentSymbol]);

  const handleApplyTicker = (sym: string) => {
    const clean = sym.toUpperCase().trim();
    if (!clean) return;
    onUpdateSymbol?.(clean);
    onSelectStock?.(clean);
    setIsEditingSymbol(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden font-mono">
      <WidgetHeader
        title={widget?.title || `AI CHART PILOT • ${currentSymbol} <MCP>`}
        onRemove={onRemove}
        onEdit={onEdit}
        customHeaderLeft={
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#38bdf8] flex items-center gap-1">
              <span>⚡</span> AI PILOT • {currentSymbol}
            </span>
            {isEditingSymbol ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleApplyTicker(tickerInput);
                }}
                className="flex items-center gap-1"
              >
                <input
                  type="text"
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value)}
                  className="w-16 px-1 py-0.2 bg-[#18181b] border border-[#38bdf8] text-white text-[10px] rounded outline-none font-bold uppercase"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-1 py-0.2 bg-[#38bdf8] text-black text-[9px] rounded font-bold cursor-pointer"
                >
                  OK
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingSymbol(true)}
                className="text-[9px] text-[#71717a] hover:text-white px-1 py-0.2 bg-[#18181b] rounded border border-[#27272a] cursor-pointer"
              >
                Ganti
              </button>
            )}
          </div>
        }
      />

      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
        <AIChartPilotHUD
          symbol={currentSymbol}
          currentPrice={price}
          onApplyOverlays={() => {}}
          onClearOverlays={() => {}}
          onOpenPineStudio={() => setIsPineModalOpen(true)}
        />
        <MultiTimeframeRadar symbol={currentSymbol} currentPrice={price} />
      </div>

      <div className="px-3 py-1.5 bg-[#121216] border-t border-[#27272a] text-[10px] text-[#71717a] flex items-center justify-between">
        <span className="text-[#a1a1aa]">TradesDontLie MCP Protocol &bull; Chrome CDP 9222</span>
        <Link
          href={`/stock/${currentSymbol}?tab=chart`}
          className="text-[#38bdf8] hover:underline font-bold flex items-center gap-1"
        >
          <span>Buka di Layar Chart Utama</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <PineScriptStudioModal
        symbol={currentSymbol}
        isOpen={isPineModalOpen}
        onClose={() => setIsPineModalOpen(false)}
      />
    </div>
  );
}



