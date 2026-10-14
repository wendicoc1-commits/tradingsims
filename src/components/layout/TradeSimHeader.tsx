'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { isCryptoSymbol, isUSSymbol } from '@/lib/universe/masterAssetUniverse';
import {
  Maximize2,
  Minimize2,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Clock,
  X,
  Sparkles,
  HelpCircle,
  Bot,
  Terminal,
  Briefcase,
  Coins,
  LayoutGrid,
  Filter,
  PieChart,
  Newspaper,
  Globe,
  Trophy,
  Compass,
  Layers,
  Shield,
  Zap,
  Volume2,
  VolumeX,
  LineChart,
  User,
  LogOut,
  Wallet,
  RefreshCw,
  Cloud,
  KeyRound,
  Tv,
  Monitor,
} from 'lucide-react';
import { useMarketStore, usePortfolioStore } from '@/store';
import { INVESTING_COM_GLOBAL_DIVIDENDS } from '@/data/investing_global_dividends';
import CompanyLogo from '@/components/common/CompanyLogo';
import { tradeSimAudio } from '@/lib/tradeSimAudio';
import TopUpModal from '@/components/portfolio/TopUpModal';
import AuthModal from '@/components/auth/AuthModal';
import { useAuthStore } from '@/store/useAuthStore';
import { useAIAgentStore } from '@/store/aiAgentStore';

interface CliSuggestion {
  cmd: string;
  desc: string;
  cat: 'saham' | 'pasar' | 'riset' | 'alat';
}

const CLI_COMMAND_SUGGESTIONS: CliSuggestion[] = [
  { cmd: 'BBCA', desc: 'Detail Saham BBCA & Analisis Teknikal', cat: 'saham' },
  { cmd: 'BMRI', desc: 'Detail Saham BMRI Bank Mandiri', cat: 'saham' },
  { cmd: 'BBRI', desc: 'Detail Saham BBRI Bank Rakyat Indonesia', cat: 'saham' },
  { cmd: 'ASII', desc: 'Detail Saham ASII Astra International', cat: 'saham' },
  { cmd: 'TLKM', desc: 'Detail Saham TLKM Telkom Indonesia', cat: 'saham' },
  { cmd: 'BTC', desc: 'Bitcoin Spot Trading & Analisis Realtime', cat: 'pasar' },
  { cmd: 'ETH', desc: 'Ethereum Spot Trading Desk', cat: 'pasar' },
  { cmd: 'NETWORK', desc: 'Peta Jaringan Ekosistem & Konglomerasi (Advanced Graph)', cat: 'pasar' },
  { cmd: 'HEATMAP', desc: 'Peta Sektoral IHSG & Market Cap', cat: 'pasar' },
  { cmd: 'SCREENER', desc: 'Stock Screener & Filter Fundamental', cat: 'pasar' },
  { cmd: 'DIVIDEND', desc: 'Analisis Dividen & Kalender Cum-Date', cat: 'pasar' },
  { cmd: 'BANDAR', desc: 'Radar Bandarmologi & Smart Money Flow', cat: 'pasar' },
  { cmd: 'MACRO', desc: 'Kalender Makro & Suku Bunga BI / Fed', cat: 'pasar' },
  { cmd: 'NEWS', desc: 'Breaking News Wire & Sentimen Pasar Riil', cat: 'riset' },
  { cmd: 'PORTFOLIO', desc: 'Portofolio Investasi & Trade Blotter', cat: 'alat' },
  { cmd: 'CRYPTO', desc: 'AI Quant Cryptocurrency Trading Desk', cat: 'pasar' },
  { cmd: 'ADMIN', desc: 'Panel Administrator (Approval Deposit & Portofolio)', cat: 'alat' },
  { cmd: 'TOPUP', desc: 'Top Up Saldo Kas Virtual via QRIS', cat: 'alat' },
  { cmd: 'LIGA', desc: 'Turnamen Liga Trading Berhadiah Tunai Rp 5 Jt', cat: 'alat' },
  { cmd: 'ROADMAP', desc: 'Peta Jalan Belajar Trader & Quant FinTech', cat: 'alat' },
  { cmd: 'ARCH', desc: 'Blueprint Arsitektur Sistem FinTech ACID', cat: 'alat' },
  { cmd: 'HELP', desc: 'Buka Panduan & Shortcuts TradeSim Pro', cat: 'alat' },
];

export default function TradeSimHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, crtScanline, toggleCrtScanline, setSelectedSymbol } = useMarketStore();
  const { cash, holdings } = usePortfolioStore();

  const totalHoldingsValue = useMemo(() => {
    return (holdings || []).reduce((sum, h) => {
      const isCrypto = h.assetClass === 'CRYPTO' || h.symbol?.endsWith('USDT') || h.currency === 'USDT' || isCryptoSymbol(h.displaySymbol);
      const clean = (h.displaySymbol || h.symbol || '').replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
      const isUS = !isCrypto && (h.currency === 'USD' || h.assetClass === 'US' || isUSSymbol(clean));
      const rate = h.exchangeRate || 16000;
      const units = isCrypto ? (h.cryptoUnits || h.lots) : (h.shares || (isUS ? h.lots : h.lots * 100));
      if (isCrypto || isUS) {
        return sum + Math.round((h.currentPrice || 0) * (units || 0) * rate);
      }
      return sum + ((h.currentPrice || 0) * (units || 0));
    }, 0);
  }, [holdings]);
  const totalNav = cash + totalHoldingsValue;
  const { user, logout, checkSession } = useAuthStore();
  const { autoTradingEnabled, setAutoTradingEnabled } = useAIAgentStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'markets' | 'research' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [timeWib, setTimeWib] = useState('');
  const [timeNy, setTimeNy] = useState('');
  const [cliInput, setCliInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'change_password'>('login');
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [isGuestBannerDismissed, setIsGuestBannerDismissed] = useState(false);
  const cliInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    setIsSoundEnabled(tradeSimAudio.getSoundEnabled());

    const updateClocks = () => {
      const now = new Date();
      setTimeWib(
        now.toLocaleTimeString('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setTimeNy(
        now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };

    updateClocks();
    const timer = setInterval(updateClocks, 1000);
    return () => clearInterval(timer);
  }, []);

  // Synchronize theme and CRT Scanlines from Zustand store to DOM
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'phosphore') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'phosphore');
      } else if (theme === 'acidule') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'acidule');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.removeAttribute('data-theme');
      }

      if (crtScanline) {
        document.body.classList.add('crt-screen');
      } else {
        document.body.classList.remove('crt-screen');
      }
    }
  }, [theme, crtScanline]);

  const handleToggleSound = () => {
    const nextState = tradeSimAudio.toggleSound();
    setIsSoundEnabled(nextState);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const executeCommand = (rawCommand: string) => {
    let cmd = rawCommand.trim().toUpperCase();
    cmd = cmd.replace(/<GO>$/i, '').replace(/\s+GO$/i, '').trim();
    if (!cmd) return;

    setShowSuggestions(false);

    if (cmd === 'HELP' || cmd === '?') {
      setShowHelpModal(true);
      return;
    }

    if (cmd === 'TERM' || cmd === 'TERMINAL' || cmd === 'DASHBOARD') router.push('/terminal');
    else if (cmd === 'HOME' || cmd === 'BERANDA' || cmd === 'LANDING') router.push('/');
    else if (cmd === 'PORT' || cmd === 'PORTFOLIO') router.push('/portfolio');
    else if (cmd === 'TOPUP' || cmd === 'DEPOSIT') setIsTopUpOpen(true);
    else if (cmd === 'ADMIN' || cmd === 'APPROVAL') router.push('/admin/deposits');
    else if (cmd === 'LIGA' || cmd === 'CHAMPIONSHIP' || cmd === 'TOURNAMENT') router.push('/championship');
    else if (cmd === 'ROADMAP' || cmd === 'LEARN') router.push('/roadmap');
    else if (cmd === 'ARCH' || cmd === 'ARCHITECTURE') router.push('/architecture');
    else if (cmd === 'LOGIN' || cmd === 'AUTH') setIsAuthModalOpen(true);
    else if (cmd === 'SOUND' || cmd === 'AUDIO') handleToggleSound();
    else if (cmd === 'NEWS' || cmd === 'STREAM') router.push('/stream');
    else if (cmd === 'CRYPTO' || cmd === 'BTC' || cmd === 'ETH') router.push('/crypto');
    else if (cmd === 'NETWORK' || cmd === 'GRAPH') router.push('/network');
    else if (cmd === 'HEATMAP') router.push('/heatmap');
    else if (cmd === 'SCREENER') router.push('/screener');
    else if (cmd === 'DIVIDEND' || cmd === 'DIV') router.push('/dividend');
    else if (cmd === 'IPO') router.push('/ipo');
    else if (cmd === 'MACRO' || cmd === 'ECO') router.push('/macro');
    else {
      const cleanTicker = cmd.replace(/[^A-Z0-9.]/g, '');
      if (cleanTicker.length >= 1 && cleanTicker.length <= 12) {
        setSelectedSymbol(cleanTicker);
        router.push(`/stock/${cleanTicker}`);
      }
    }
    setCliInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(cliInput);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setCliInput('');
    }
  };

  return (
    <header className="sticky top-0 z-40 flex flex-col glass-header text-[#f8fafc] border-b border-white/[0.08] shadow-2xl select-none font-sans">
      {/* ── Top Bar: Brand, Search, Status & Controls ── */}
      <div className="flex items-center justify-between px-3 h-11 border-b border-white/[0.06] gap-2">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-7 h-7 rounded bg-amber-500 text-black font-black text-sm shadow-[0_0_12px_rgba(245,158,11,0.35)] group-hover:bg-amber-400 transition-all font-mono">
              ⚡
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5 font-mono">
                TRADESIM<span className="text-amber-400 font-black">.OS</span> <span className="text-amber-400 text-[9px] px-1 rounded bg-amber-500/15 border border-amber-500/30 font-mono font-bold">v2.1 UNIX</span>
              </span>
              <span className="text-[9px] text-zinc-400 font-mono -mt-0.5 hidden sm:inline tracking-wider">
                <span className="text-amber-400 font-bold">~/tradesim</span>/workstation/<span className="text-white font-semibold">{pathname === '/' ? 'terminal' : pathname.replace('/', '')}</span> <span className="text-zinc-600">(main*)</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Command Palette / Search */}
        <div className="relative flex-1 max-w-md mx-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
            <input
              id="header-cli-search"
              ref={cliInputRef}
              type="text"
              value={cliInput}
              aria-label="Pencarian simbol saham, kripto, atau perintah terminal"
              onChange={(e) => {
                setCliInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Cari emiten (BBCA, BTC, NVDA) atau perintah..."
              className="w-full bg-[#0a0d14]/90 border border-white/10 rounded-md pl-8 pr-16 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-mono transition-all"
            />
            <div className="absolute right-2 flex items-center gap-1 pointer-events-none">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-white/5 border border-white/10 rounded text-zinc-400">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && cliInput && (
            <div className="absolute left-0 top-full mt-1 w-full glass-dropdown rounded-lg py-1 z-50 text-[11px] max-h-72 overflow-y-auto">
              <div className="px-3 py-1 text-zinc-400 font-bold border-b border-white/10 flex justify-between items-center text-[9px]">
                <span>HASIL &amp; PERINTAH</span>
                <button onClick={() => setShowSuggestions(false)} className="hover:text-white">✕</button>
              </div>
              {CLI_COMMAND_SUGGESTIONS.filter(
                (s) => s.cmd.toLowerCase().includes(cliInput.toLowerCase()) || s.desc.toLowerCase().includes(cliInput.toLowerCase())
              ).map((item) => (
                <div
                  key={item.cmd}
                  onClick={() => executeCommand(item.cmd)}
                  className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex justify-between items-center transition-colors"
                >
                  <span className="text-emerald-400 font-bold font-mono">{item.cmd}</span>
                  <span className="text-zinc-400 text-[10px] truncate">{item.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Live Status, Clocks, & User Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Latency & Realtime Ping Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>18ms</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>WIB: <strong className="text-zinc-200 font-mono-num">{timeWib}</strong></span>
            <span className="text-zinc-600">•</span>
            <span>NY: <strong className="text-zinc-400 font-mono-num">{timeNy}</strong></span>
          </div>

          {/* User Status / Top-up Action */}
          <div className="flex items-center gap-1.5 border-l border-[#27272a] pl-2.5">
            {/* Saldo Kas & Total Aset Virtual (Tampil di setiap tab di pojok kanan atas) */}
            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[11px] transition-all cursor-pointer group shadow-sm"
              title={`Kas Tersedia (RDN): Rp ${Math.round(cash).toLocaleString('id-ID')} · Total Nilai Portofolio: Rp ${Math.round(totalNav).toLocaleString('id-ID')} (Klik untuk Top Up)`}
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
              <span>Rp {Math.round(cash).toLocaleString('id-ID')}</span>
              {totalHoldingsValue > 0 && (
                <span className="hidden sm:inline text-[10px] text-zinc-400 font-normal">
                  (Aset: Rp {Math.round(totalNav).toLocaleString('id-ID')})
                </span>
              )}
            </button>

            {/* Dedicated High-Visibility Top Up Button */}
            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-[11px] shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
              title="Top Up Saldo Virtual (10k = 1 Juta Saldo)"
            >
              <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />
              <span>+ Top Up</span>
            </button>

            {/* AI Auto-Pilot Global Toggle */}
            <button
              type="button"
              onClick={() => setAutoTradingEnabled(!autoTradingEnabled)}
              className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                autoTradingEnabled
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-zinc-700'
              }`}
              title={autoTradingEnabled ? 'AI Trading Otonom Aktif di Semua Halaman (Background). Klik untuk Jeda.' : 'AI Trading Otonom Dijeda. Klik untuk Mengaktifkan.'}
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span className={`w-1.5 h-1.5 rounded-full ${autoTradingEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
              <span className="hidden lg:inline">{autoTradingEnabled ? 'AI Pilot: ON' : 'AI Pilot: OFF'}</span>
            </button>

            {/* Audio Toggle */}

            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={isSoundEnabled ? 'Nonaktifkan efek audio pasar' : 'Aktifkan efek audio pasar'}
              className={`p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${
                isSoundEnabled ? 'text-emerald-400' : 'text-zinc-500'
              }`}
              title={isSoundEnabled ? 'Audio Efek: Aktif' : 'Audio Efek: Senyap'}
            >
              {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" aria-hidden="true" /> : <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>

            {user ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    setIsManualSyncing(true);
                    try {
                      await useAuthStore.getState().syncPortfolioToDatabase();
                      await useAuthStore.getState().loadPortfolioFromDatabase();
                    } finally {
                      setTimeout(() => setIsManualSyncing(false), 600);
                    }
                  }}
                  aria-label="Sinkronkan portofolio ke cloud Supabase"
                  className={`p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer ${
                    isManualSyncing ? 'animate-spin text-emerald-400' : ''
                  }`}
                  title="Sinkronkan Portofolio ke Cloud Sekarang (Lintas Perangkat)"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <div
                  className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono"
                  title={`Akun Member: ${user.email}`}
                >
                  <Cloud className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                  <span className="max-w-[110px] truncate">{user.email.split('@')[0]}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('change_password');
                    setIsAuthModalOpen(true);
                  }}
                  aria-label="Ubah kata sandi akun"
                  className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                  title="Ubah Kata Sandi (Password)"
                >
                  <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await logout();
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  }}
                  aria-label={`Keluar dari akun ${user.email}`}
                  className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title={`Keluar (${user.email})`}
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  aria-label="Buka form masuk akun member"
                  className="px-2 py-1 rounded hover:bg-white/10 text-zinc-300 hover:text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <User className="w-3 h-3" aria-hidden="true" />
                  <span>Masuk</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  aria-label="Buka form daftar akun gratis"
                  className="px-2.5 py-1 rounded bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <Sparkles className="w-3 h-3 text-black" aria-hidden="true" />
                  <span>Daftar Gratis</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Smart Guest Cloud Conversion Banner ── */}
      {(!user || user.provider === 'guest') && !isGuestBannerDismissed && (
        <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-[#080b11] border-b border-amber-500/30 px-3 py-1 flex items-center justify-between text-[11px] font-sans text-zinc-300">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="truncate">
              <strong className="text-amber-300 font-semibold">Mode Tamu:</strong> Saldo kas &amp; transaksi hanya tersimpan di memori browser lokal.
            </span>
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('register');
                setIsAuthModalOpen(true);
              }}
              className="ml-1 text-emerald-400 hover:text-emerald-300 underline font-bold underline-offset-2 shrink-0 cursor-pointer"
            >
              Simpan Permanen ke Cloud Gratis &rarr;
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsGuestBannerDismissed(true)}
            className="text-zinc-500 hover:text-zinc-300 p-0.5 ml-2 cursor-pointer shrink-0"
            title="Tutup pemberitahuan ini"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ── Navigation Tabs Matching Image 1 (Fincept Terminal) ── */}
      <nav aria-label="Navigasi Cepat Workstation" className="flex items-center px-2 bg-[#080b11] text-xs h-8 border-b border-white/[0.08] overflow-x-auto no-scrollbar gap-0.5 font-mono">
        <Link
          href="/"
          onClick={() => tradeSimAudio.playClick()}
          aria-current={pathname === '/' ? 'page' : undefined}
          className="px-2.5 py-1 text-xs font-bold transition-all tracking-wider shrink-0 text-amber-400 hover:text-amber-300 hover:bg-white/5 flex items-center gap-1 border-r border-white/10 mr-1"
          title="Buka Landing Page TradeSim Pro"
        >
          <span>🏠 BERANDA</span>
        </Link>
        <Link
          href="/terminal"
          onClick={() => tradeSimAudio.playClick()}
          aria-current={pathname === '/terminal' ? 'page' : undefined}
          className={`px-3 py-1 text-xs font-bold transition-all tracking-wider shrink-0 ${
            pathname === '/terminal'
              ? 'bg-[#f97316] text-black font-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          DASHBOARD
        </Link>
        <Link
          href="/heatmap"
          onClick={() => tradeSimAudio.playClick()}
          aria-current={pathname.startsWith('/heatmap') ? 'page' : undefined}
          className={`px-3 py-1 text-xs font-bold transition-all tracking-wider shrink-0 ${
            pathname.startsWith('/heatmap')
              ? 'bg-[#f97316] text-black font-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          MARKETS
        </Link>
        <Link
          href="/crypto"
          onClick={() => tradeSimAudio.playClick()}
          aria-current={pathname.startsWith('/crypto') ? 'page' : undefined}
          className={`px-3 py-1 text-xs font-bold transition-all tracking-wider shrink-0 ${
            pathname.startsWith('/crypto')
              ? 'bg-[#f97316] text-black font-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          CRYPTO
        </Link>
        <Link
          href="/screener"
          onClick={() => tradeSimAudio.playClick()}
          aria-current={pathname.startsWith('/screener') ? 'page' : undefined}
          className={`px-3 py-1 text-xs font-bold transition-all tracking-wider shrink-0 ${
            pathname.startsWith('/screener')
              ? 'bg-[#f97316] text-black font-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          EQUITY
        </Link>
        <Link
          href="/portfolio"
          onClick={() => tradeSimAudio.playClick()}
          aria-current={pathname.startsWith('/portfolio') ? 'page' : undefined}
          className={`px-3 py-1 text-xs font-bold transition-all tracking-wider shrink-0 ${
            pathname.startsWith('/portfolio')
              ? 'bg-[#f97316] text-black font-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          PORTFOLIO
        </Link>
        <Link
          href="/stream"
          onClick={() => tradeSimAudio.playClick()}
          aria-current={pathname.startsWith('/stream') ? 'page' : undefined}
          className={`px-3 py-1 text-xs font-bold transition-all tracking-wider shrink-0 ${
            pathname.startsWith('/stream')
              ? 'bg-[#f97316] text-black font-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          NEWS
        </Link>
        <Link
          href="/ai"
          onClick={() => tradeSimAudio.playClick()}
          aria-current={pathname.startsWith('/ai') ? 'page' : undefined}
          className={`px-3 py-1 text-xs font-bold transition-all tracking-wider shrink-0 ${
            pathname.startsWith('/ai')
              ? 'bg-[#f97316] text-black font-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          AI CHAT
        </Link>
        <Link
          href="/championship"
          onClick={() => tradeSimAudio.playClick()}
          aria-current={pathname.startsWith('/championship') ? 'page' : undefined}
          className={`px-3 py-1 text-xs font-bold transition-all tracking-wider shrink-0 ${
            pathname.startsWith('/championship')
              ? 'bg-[#f97316] text-black font-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          BACKTEST
        </Link>
        <Link
          href="/macro"
          onClick={() => tradeSimAudio.playClick()}
          aria-current={pathname.startsWith('/macro') ? 'page' : undefined}
          className={`px-3 py-1 text-xs font-bold transition-all tracking-wider shrink-0 ${
            pathname.startsWith('/macro')
              ? 'bg-[#f97316] text-black font-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          ALGO
        </Link>
        <Link
          href="/architecture"
          onClick={() => tradeSimAudio.playClick()}
          aria-current={pathname.startsWith('/architecture') ? 'page' : undefined}
          className={`px-3 py-1 text-xs font-bold transition-all tracking-wider shrink-0 ${
            pathname.startsWith('/architecture')
              ? 'bg-[#f97316] text-black font-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          NODES
        </Link>
        <Link
          href="/dividend"
          onClick={() => tradeSimAudio.playClick()}
          aria-current={pathname.startsWith('/dividend') ? 'page' : undefined}
          className={`px-3 py-1 text-xs font-bold transition-all tracking-wider shrink-0 ${
            pathname.startsWith('/dividend')
              ? 'bg-[#f97316] text-black font-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          QUANTLIB
        </Link>
      </nav>

      {/* Modals */}
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
        initialEmail={user?.email || ''}
      />

    </header>
  );
}
