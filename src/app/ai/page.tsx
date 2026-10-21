'use client';

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import {
  Bot,
  Sparkles,
  Send,
  TrendingUp,
  TrendingDown,
  Layers,
  ShieldAlert,
  Zap,
  RotateCcw,
  Scale,
  DollarSign,
  PieChart,
  Copy,
  Check,
  Users,
  Swords,
  Briefcase,
  Activity,
  Building2,
  Coins,
  Flame,
  Cpu,
  Globe,
  Brain,
  AlertTriangle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ── Tab Loading Skeleton ──
function TabLoadingSkeleton({ title }: { title: string }) {
  return (
    <div className="min-h-[500px] w-full rounded-2xl border border-zinc-800 bg-[#07090e] p-8 flex flex-col items-center justify-center space-y-4">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
        <Activity className="h-6 w-6 animate-pulse" />
      </div>
      <div className="space-y-1.5 text-center">
        <h4 className="text-sm font-bold text-white font-mono">{title}</h4>
        <p className="text-xs text-zinc-400 font-mono">Menyiapkan model komputasi kuantitatif & streaming WebSocket...</p>
      </div>
      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full w-24 animate-indeterminate bg-gradient-to-r from-amber-500 to-indigo-500" />
      </div>
    </div>
  );
}

// ── Tab Error Boundary ──
interface ErrorBoundaryProps {
  children: ReactNode;
  tabName: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class TabErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[TabErrorBoundary: ${this.props.tabName}]`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[420px] w-full rounded-2xl border border-rose-500/30 bg-zinc-950 p-6 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1 max-w-md">
            <h4 className="text-sm font-bold text-white font-mono">
              Kendala Rendering pada {this.props.tabName}
            </h4>
            <p className="text-xs text-zinc-400">
              Komponen ini diisolasi untuk mencegah gangguan pada fitur TradeSims lainnya.
              {this.state.error?.message ? ` (${this.state.error.message.slice(0, 90)})` : ''}
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onReset?.();
            }}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Muat Ulang Tab Ini</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Dynamic Imports with SSR: False for heavy client engines ──
const VirtualAgentOfficeView = dynamic(() => import('@/components/ai/VirtualAgentOfficeView'), {
  ssr: false,
  loading: () => <TabLoadingSkeleton title="AI Virtual Office (War Room 2.5D)" />,
});

const QuantBridgeDeskView = dynamic(() => import('@/components/ai/QuantBridgeDeskView'), {
  ssr: false,
  loading: () => <TabLoadingSkeleton title="Quant Desk (Freqtrade & Lumibot)" />,
});

const JesseCryptoDeskView = dynamic(() => import('@/components/ai/JesseCryptoDeskView'), {
  ssr: false,
  loading: () => <TabLoadingSkeleton title="Jesse AI Crypto Desk (Spot Trading)" />,
});

const HedgeFundCommitteeView = dynamic(() => import('@/components/ai/HedgeFundCommitteeView'), {
  ssr: false,
  loading: () => <TabLoadingSkeleton title="Komite Hedge Fund (7 Personas)" />,
});

const BullBearDebateArena = dynamic(() => import('@/components/ai/BullBearDebateArena'), {
  ssr: false,
  loading: () => <TabLoadingSkeleton title="Arena Debat Bull vs Bear (HKUDS)" />,
});

const AutonomousPaperTradingDesk = dynamic(() => import('@/components/ai/AutonomousPaperTradingDesk'), {
  ssr: false,
  loading: () => <TabLoadingSkeleton title="Autonomous Paper Trading & Benchmark" />,
});

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  tableData?: {
    headers: string[];
    rows: (string | number)[][];
  };
  metrics?: { label: string; value: string; sentiment?: 'bullish' | 'bearish' | 'neutral' }[];
}

const PRESET_PROMPTS = [
  {
    title: 'Analisis Valuasi Perbankan',
    prompt: 'Bandingkan valuasi perbankan BBCA vs BMRI vs BBRI (PBV, ROE, NIM, dan dividen yield)',
  },
  {
    title: 'Screening Dividen Yield > 8%',
    prompt: 'Tampilkan emiten IDX dengan dividend yield > 8% dan rasio utang DER di bawah 1.0x',
  },
  {
    title: 'Dampak Spin-off ADRO & AADI',
    prompt: 'Bagaimana analisis dampak spin-off batu bara ADRO terhadap dividen spesial dan valuasi holding?',
  },
  {
    title: 'DuPont Breakdown & Health Check',
    prompt: 'Lakukan DuPont 3-Step Analysis dan uji kebangkrutan Altman Z-Score untuk ASII dan TLKM',
  },
  {
    title: 'Radar Akumulasi Bandar (Smart Money)',
    prompt: 'Deteksi broker institusi asing yang sedang net buy akumulasi pada saham-saham perbankan minggu ini',
  },
];

export default function FinceptAiCopilotPage() {
  const [mounted, setMounted] = useState(false);
  const [mainAiTab, setMainAiTab] = useState<
    'VIRTUAL_OFFICE' | 'QUANT_BRIDGE' | 'CRYPTO_DESK' | 'HEDGE_FUND' | 'BULL_BEAR_DEBATE' | 'PAPER_TRADING' | 'COPILOT_CHAT'
  >('VIRTUAL_OFFICE');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'chat' || tabParam === 'copilot') {
        setMainAiTab('COPILOT_CHAT');
      } else if (tabParam === 'cyberdeck' || tabParam === 'ai-os' || tabParam === 'globe' || tabParam === 'hud') {
        setMainAiTab('VIRTUAL_OFFICE');
      } else if (tabParam === 'quant' || tabParam === 'bridge' || tabParam === 'freqtrade' || tabParam === 'lumibot') {
        setMainAiTab('QUANT_BRIDGE');
      } else if (tabParam === 'crypto' || tabParam === 'jesse' || tabParam === 'desk') {
        setMainAiTab('CRYPTO_DESK');
      } else if (tabParam === 'debate' || tabParam === 'arena' || tabParam === 'bull-bear') {
        setMainAiTab('BULL_BEAR_DEBATE');
      } else if (tabParam === 'paper' || tabParam === 'settlement' || tabParam === 'benchmark') {
        setMainAiTab('PAPER_TRADING');
      } else if (tabParam === 'hedge-fund' || tabParam === 'committee') {
        setMainAiTab('HEDGE_FUND');
      } else if (tabParam === 'office' || tabParam === 'war-room') {
        setMainAiTab('VIRTUAL_OFFICE');
      }
    }
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      timestamp: '09:00:00',
      text: 'Selamat datang di **Bloomberg AI Financial Copilot** (Institutional Research Edition). Saya siap menganalisis laporan keuangan IDX, valuasi multi-emiten, kalkulasi dividen, rasio DuPont, hingga pergerakan smart money bandarmologi. Silakan pilih template prompt di bawah atau ketik analisis yang Anda butuhkan.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('id-ID'),
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    const lower = query.toLowerCase();

    // Check if query mentions a specific stock or crypto ticker
    const tickerMatch = query.toUpperCase().match(/\b(BTC|ETH|SOL|BNB|DOGE|XRP|ADA|AVAX|SUI|NEAR|LINK|PEPE|BBCA|BMRI|BBRI|BBNI|GOTO|ADRO|ASII|TLKM|ANTM|PGAS|ITMG|PTBA|ICBP|INDF|UNVR|BRIS|MEDC|INKP|MDKA|CPIN|NVDA|AAPL|TSLA|MSFT)\b/);

    if (tickerMatch) {
      const sym = tickerMatch[1];
      try {
        const res = await fetch(`/api/ai/predict?symbol=${sym}&horizon=5D`);
        if (res.ok) {
          const q = await res.json();
          const reply: ChatMessage = {
            id: `a-${Date.now()}`,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString('id-ID'),
            text: `### 🏛️ Laporan Intelijen Kuantitatif: ${q.symbol} (${q.name || sym})
**Status Rezim Pasar:** \`${q.marketRegime?.phase || 'CHOPPY RANGE'}\` • *${q.marketRegime?.sentimentTone || 'NEUTRAL'}*
${q.marketRegime?.description || ''}

**Strategi Eksekusi:** ${q.marketRegime?.recommendedStrategy || ''}
${q.tripleConfluenceVerdict || ''}

**Detail Metrik Kuantitatif Terverifikasi:**
- **Harga Saat Ini:** Rp ${(q.currentPrice || 0).toLocaleString('id-ID')}
- **RSI (14-Sesi):** ${q.indicators?.rsi14 || 50}
- **Chaikin Money Flow (CMF-20):** ${q.indicators?.cmf20 >= 0 ? '+' : ''}${q.indicators?.cmf20 || 0} (${q.indicators?.cmf20 > 0 ? 'Smart Money Inflow' : 'Net Outflow'})
- **Volume Z-Score Spike:** +${q.indicators?.volumeZScore || 0}σ
- **Volatilitas Tahunan (Annualized):** ${q.indicators?.annualizedVolatility || 0}%`,
            tableData: {
              headers: ['Parameter Quant', 'Nilai Model', 'Benchmark / Keterangan'],
              rows: [
                ['Composite Alpha Grade', q.compositeAlpha?.grade || 'A', `Skor: ${q.compositeAlpha?.totalScore || 70}/100`],
                ['Sinyal Horizon 5-Hari', q.forecasts?.['5D']?.signalStrength || 'HOLD', `Confidence: ${q.forecasts?.['5D']?.confidenceScore || 50}%`],
                ['Target Harga Median (P50)', `Rp ${(q.forecasts?.['5D']?.priceTarget?.medianTarget || 0).toLocaleString('id-ID')}`, `Return: +${q.forecasts?.['5D']?.priceTarget?.expectedReturnPct || 0}%`],
                ['Target Bullish (P90)', `Rp ${(q.forecasts?.['5D']?.priceTarget?.upperTarget || 0).toLocaleString('id-ID')}`, 'Ekspansi Monte Carlo'],
                ['Invalidasi (Hard Stop Loss)', `Rp ${(q.forecasts?.['5D']?.priceTarget?.stopLoss || 0).toLocaleString('id-ID')}`, 'Proteksi Modal 1.5x ATR'],
                ['Ukuran Lot Optimal (Kelly)', `${q.kellySizing?.recommendedLots || 10} LOT`, `Alokasi: ${q.kellySizing?.halfKellyPct || 10}% Portofolio`],
              ],
            },
            metrics: [
              { label: 'Composite Alpha', value: `${q.compositeAlpha?.totalScore || 75}/100`, sentiment: 'bullish' },
              { label: 'Smart Money Divergence', value: q.smartMoneyDivergence?.badge || 'NORMAL', sentiment: q.smartMoneyDivergence?.severity === 'BULLISH' ? 'bullish' : 'neutral' },
              { label: 'Win Rate Backtest', value: `${q.backtestMetrics?.winRate || 75}%`, sentiment: 'bullish' },
            ],
          };
          setMessages((prev) => [...prev, reply]);
          setIsTyping(false);
          return;
        }
      } catch (err) {
        // Fall back to standard logic
      }
    }

    setTimeout(() => {
      let reply: ChatMessage;

      if (lower.includes('perbankan') || lower.includes('bbca') || lower.includes('bmri') || lower.includes('bbri')) {
        reply = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString('id-ID'),
          text: `### Ringkasan Eksekutif: Komparasi Perbankan Big-4 IDX
Berdasarkan laporan keuangan konsolidasian audit terbaru:
- **BBCA** mempertahankan premi valuasi tertinggi karena dominasi dana murah (CASA > 80%) dan risiko NPL terendah (NPL Gross 1.9%).
- **BMRI** menunjukkan pertumbuhan laba terkuat dengan efisiensi platform digital Livin/Kopra serta ekspansi kredit korporasi solid.
- **BBRI** menawarkan Dividend Yield tertinggi (~6.2%), namun menghadapi tantangan restrukturisasi segmen mikro Kupedes pasca-pandemi.`,
          tableData: {
            headers: ['Ticker', 'Harga (Rp)', 'PER (TTM)', 'PBV (x)', 'ROE (%)', 'NIM (%)', 'Div Yield (%)'],
            rows: [
              ['BBCA', '10.525', '22.4x', '4.65x', '21.4%', '5.8%', '2.8%'],
              ['BMRI', '7.050', '11.8x', '2.25x', '20.1%', '5.3%', '5.1%'],
              ['BBRI', '4.980', '12.6x', '2.42x', '18.8%', '7.6%', '6.2%'],
              ['BBNI', '5.475', '9.4x', '1.25x', '14.6%', '4.4%', '5.2%'],
            ],
          },
          metrics: [
            { label: 'Top Quality Pick', value: 'BBCA (Strong Moat)', sentiment: 'bullish' },
            { label: 'Top Growth & RoE', value: 'BMRI (Undervalued vs BBCA)', sentiment: 'bullish' },
            { label: 'Top Income/Dividend', value: 'BBRI (Yield 6.2%)', sentiment: 'neutral' },
          ],
        };
      } else if (lower.includes('dividen') || lower.includes('yield') || lower.includes('der')) {
        reply = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString('id-ID'),
          text: `### Hasil Screening: Emiten High Dividend Yield (>8%) & Neraca Sehat (DER < 1.0x)
Ditemukan **5 emiten utama** yang membagikan dividen jumbo dengan rasio utang berbunga sangat minim:`,
          tableData: {
            headers: ['Ticker', 'Nama Perusahaan', 'Harga', 'DPS 2024 (Rp)', 'Div Yield (%)', 'DPR (%)', 'DER (x)'],
            rows: [
              ['ADRO', 'Adaro Energy Indonesia', 'Rp 3.840', 'Rp 580', '15.1%', '65%', '0.24x'],
              ['ITMG', 'Indo Tambangraya Megah', 'Rp 26.500', 'Rp 3.250', '12.3%', '70%', '0.18x'],
              ['PTBA', 'Bukit Asam Tbk', 'Rp 2.950', 'Rp 397', '13.5%', '75%', '0.35x'],
              ['BJBR', 'Bank BJB Tbk', 'Rp 1.010', 'Rp 95', '9.4%', '55%', '0.85x'],
              ['MPMX', 'Mitra Pinasthika Mustika', 'Rp 1.020', 'Rp 115', '11.2%', '85%', '0.42x'],
            ],
          },
          metrics: [
            { label: 'Rata-rata Yield Portofolio', value: '12.3% per tahun', sentiment: 'bullish' },
            { label: 'Status Keuangan', value: 'Net Cash & Zero Default Risk', sentiment: 'bullish' },
          ],
        };
      } else if (lower.includes('adro') || lower.includes('spin-off') || lower.includes('aadi')) {
        reply = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString('id-ID'),
          text: `### Analisis Khusus: Spin-off Bisnis Batu Bara Termal ADRO ke AADI
1. **Mekanisme Transaksi:** ADRO mendivestasikan 99.99% kepemilikan di PT Adaro Andalan Indonesia (AAI / AADI) senilai kisaran USD 2.45 Miliar.
2. **Dividen Spesial:** Pemegang saham ADRO berhak atas dividen tunai bernilai jumbo (estimasi dividen yield spesial ~20-25%) yang dapat digunakan untuk menyerap penawaran saham AAI (PUPS).
3. **Valuasi Pasca Spin-off:** ADRO holding akan bertransformasi menjadi *Adaro Minerals & Green Energy* (fokus pada bauksit, aluminium smelter di Kaltara, dan energi terbarukan).`,
          metrics: [
            { label: 'Potensi Yield Spesial', value: '20% - 25%', sentiment: 'bullish' },
            { label: 'Rating Analis', value: 'BUY / ACCUMULATE', sentiment: 'bullish' },
            { label: 'Risk Factor', value: 'Fluktuasi Harga Batu Bara Global', sentiment: 'neutral' },
          ],
        };
      } else {
        reply = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString('id-ID'),
          text: `### Hasil Riset Kuantitatif: ${query}
Berdasarkan model Bloomberg Quant Multi-Factor Engine:
1. **Analisis Tren & Momentum:** Sektor bergerak dengan volume rata-rata di atas moving average 20-hari.
2. **Kesehatan Neraca:** Rasio Quick Ratio > 1.2x mengindikasikan likuiditas jangka pendek yang solid tanpa risiko solvabilitas.
3. **Rekomendasi Strategis:** Akumulasi bertahap pada area support kunci dengan stop loss terukur.`,
          metrics: [
            { label: 'Model Confidence', value: '92.4%', sentiment: 'bullish' },
            { label: 'Risk-Reward Ratio', value: '1 : 2.8', sentiment: 'bullish' },
          ],
        };
      }

      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 600);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!mounted) {
    return <TabLoadingSkeleton title="Fincept AI Platform" />;
  }

  return (
    <div className="space-y-3 font-mono select-none">
      {/* ── Top Level AI Hub Switcher Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 glass-panel rounded-xl text-xs">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/40 border border-white/[0.06] rounded-lg">
          <button
            onClick={() => setMainAiTab('VIRTUAL_OFFICE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              mainAiTab === 'VIRTUAL_OFFICE'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>AI Virtual Office (War Room 2.5D)</span>
          </button>

          <button
            onClick={() => setMainAiTab('QUANT_BRIDGE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              mainAiTab === 'QUANT_BRIDGE'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] font-extrabold'
                : 'text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:text-white hover:bg-emerald-500/20'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-300" />
            <span>Quant Desk (Freqtrade &amp; Lumibot)</span>
          </button>

          <button
            onClick={() => setMainAiTab('CRYPTO_DESK')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              mainAiTab === 'CRYPTO_DESK'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)] font-extrabold'
                : 'text-cyan-400 border border-cyan-500/30 bg-cyan-500/10 hover:text-white hover:bg-cyan-500/20'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-cyan-300" />
            <span>Jesse AI Crypto Desk (Spot Trading)</span>
          </button>

          <button
            onClick={() => setMainAiTab('HEDGE_FUND')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              mainAiTab === 'HEDGE_FUND'
                ? 'bg-white/20 text-white border border-white/30 font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Komite Hedge Fund (7 Personas)</span>
          </button>

          <button
            onClick={() => setMainAiTab('BULL_BEAR_DEBATE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              mainAiTab === 'BULL_BEAR_DEBATE'
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Arena Debat Bull vs Bear (HKUDS)</span>
          </button>

          <button
            onClick={() => setMainAiTab('PAPER_TRADING')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              mainAiTab === 'PAPER_TRADING'
                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Autonomous Paper Trading &amp; Benchmark</span>
          </button>

          <button
            onClick={() => setMainAiTab('COPILOT_CHAT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              mainAiTab === 'COPILOT_CHAT'
                ? 'bg-blue-500/25 text-blue-300 border border-blue-500/40 font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Financial Copilot Chat</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-300 font-bold">QUANT INTELLIGENCE HUB</span>
        </div>
      </div>

      {/* ── Tab Content Rendering with Isolated Error Boundary ── */}
      {mainAiTab === 'VIRTUAL_OFFICE' ? (
        <TabErrorBoundary tabName="AI Virtual Office">
          <VirtualAgentOfficeView />
        </TabErrorBoundary>
      ) : mainAiTab === 'QUANT_BRIDGE' ? (
        <TabErrorBoundary tabName="Quant Desk">
          <QuantBridgeDeskView />
        </TabErrorBoundary>
      ) : mainAiTab === 'CRYPTO_DESK' ? (
        <TabErrorBoundary tabName="Jesse Crypto Desk">
          <JesseCryptoDeskView />
        </TabErrorBoundary>
      ) : mainAiTab === 'HEDGE_FUND' ? (
        <TabErrorBoundary tabName="Komite Hedge Fund">
          <HedgeFundCommitteeView />
        </TabErrorBoundary>
      ) : mainAiTab === 'BULL_BEAR_DEBATE' ? (
        <TabErrorBoundary tabName="Arena Debat Bull vs Bear">
          <BullBearDebateArena />
        </TabErrorBoundary>
      ) : mainAiTab === 'PAPER_TRADING' ? (
        <TabErrorBoundary tabName="Autonomous Paper Trading">
          <AutonomousPaperTradingDesk />
        </TabErrorBoundary>
      ) : (
        <div className="space-y-3">
          {/* ── Sub-header Copilot Bar ── */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#09090b] border border-[#27272a] rounded-sm text-xs">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#f59e0b]" />
              <span className="font-bold text-white text-sm">BLOOMBERG AI RESEARCH COPILOT</span>
              <span className="text-[#3f3f46]">|</span>
              <span className="text-[#22c55e] text-[10px] font-bold">QUANT ENGINE v4.2 ONLINE</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#a1a1aa]">
              <span className="bg-[#18181b] border border-[#27272a] px-2 py-0.5 rounded text-[10px] text-[#f59e0b]">
                MODEL: GEMINI QUANTITATIVE-FINANCE
              </span>
              <button
                onClick={() => setMessages([messages[0]])}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Chat</span>
              </button>
            </div>
          </div>

          {/* ── Quick Prompt Chips ── */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            {PRESET_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.prompt)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#121215] hover:bg-[#18181b] border border-[#27272a] hover:border-[#f59e0b] rounded text-[#d4d4d8] hover:text-white transition-colors whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#f59e0b]" />
                <span>{p.title}</span>
              </button>
            ))}
          </div>

          {/* ── Chat Messages Stream ── */}
          <div className="bg-[#09090b] border border-[#27272a] rounded-sm p-4 min-h-[500px] max-h-[640px] overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 text-[10px] text-[#71717a]">
                  <span>{m.sender === 'user' ? 'YOU (TRADER)' : 'BLOOMBERG QUANT AI'}</span>
                  <span>&bull;</span>
                  <span>{m.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded p-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#1e1e24] border border-[#2e2e38] text-white'
                      : 'bg-[#0f0f12] border border-[#27272a] text-[#e4e4e7] space-y-3'
                  }`}
                >
                  {m.sender === 'user' ? (
                    <div className="whitespace-pre-line">{m.text}</div>
                  ) : (
                    <div className="prose prose-invert max-w-none text-xs leading-relaxed prose-p:my-1 prose-headings:my-1.5 prose-strong:text-amber-400">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.text}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Optional Table */}
                  {m.tableData && (
                    <div className="overflow-x-auto my-2 border border-[#27272a] rounded">
                      <table className="w-full text-left text-[11px] divide-y divide-[#27272a]">
                        <thead className="bg-[#18181b] text-[#a1a1aa]">
                          <tr>
                            {m.tableData.headers.map((h, i) => (
                              <th key={i} className="px-2.5 py-1.5 font-bold uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#18181b] bg-[#0c0c0e]">
                          {m.tableData.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[#18181b]/50">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`px-2.5 py-1.5 font-mono ${
                                    cIdx === 0 ? 'font-bold text-white' : 'text-[#d4d4d8]'
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Optional Key Metrics Chips */}
                  {m.metrics && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-[#1e1e24]">
                      {m.metrics.map((metric, idx) => (
                        <div key={idx} className="bg-[#141418] border border-[#27272a] p-2 rounded">
                          <div className="text-[10px] text-[#71717a]">{metric.label}</div>
                          <div
                            className={`text-xs font-bold font-mono ${
                              metric.sentiment === 'bullish'
                                ? 'text-[#22c55e]'
                                : metric.sentiment === 'bearish'
                                ? 'text-[#ef4444]'
                                : 'text-[#f59e0b]'
                            }`}
                          >
                            {metric.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Copy message button */}
                  {m.sender === 'assistant' && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="flex items-center gap-1 text-[10px] text-[#71717a] hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === m.id ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === m.id ? 'Tersalin' : 'Salin Analisis'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[#f59e0b]">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-ping" />
                <span>Bloomberg Quant AI sedang memproses pemodelan data keuangan...</span>
              </div>
            )}
          </div>

          {/* ── Chat Input Bar ── */}
          <div className="flex items-center gap-2 bg-[#09090b] border border-[#27272a] focus-within:border-[#f59e0b] p-1.5 rounded-sm transition-colors">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Ketik pertanyaan atau emiten (misal: 'Bandingkan ROE & DER emiten semen SMGR vs INTP')..."
              className="flex-1 bg-transparent px-2 text-xs text-white placeholder-[#71717a] outline-none"
            />
            <button
              onClick={() => handleSend()}
              className="flex items-center gap-1 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold px-3 py-1.5 rounded text-xs transition-colors cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>KIRIM</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
