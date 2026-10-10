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
  Volume2,
  VolumeX,
  LineChart,
  User,
  LogOut,
  Wallet,
  RefreshCw,
  Cloud,
  KeyRound,
} from 'lucide-react';
import { useMarketStore, usePortfolioStore } from '@/store';
import { INVESTING_COM_GLOBAL_DIVIDENDS } from '@/data/investing_global_dividends';
import CompanyLogo from '@/components/common/CompanyLogo';
import { tradeSimAudio } from '@/lib/tradeSimAudio';
import TopUpModal from '@/components/portfolio/TopUpModal';
import AdminTopUpApprovalModal from '@/components/portfolio/AdminTopUpApprovalModal';
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
  { cmd: 'HELP', desc: 'Buka Panduan & Shortcuts TradeSim Pro', cat: 'alat' },
];

export default function TradeSimHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, setSelectedSymbol } = useMarketStore();
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
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'change_password'>('login');
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const cliInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkSession();

    const handleSyncOnFocus = () => {
      checkSession();
    };

    window.addEventListener('focus', handleSyncOnFocus);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleSyncOnFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

    if (cmd === 'PORT' || cmd === 'PORTFOLIO') router.push('/portfolio');
    else if (cmd === 'TOPUP' || cmd === 'DEPOSIT') setIsTopUpOpen(true);
    else if (cmd === 'ADMIN' || cmd === 'APPROVAL') setIsAdminOpen(true);
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
    <header className="sticky top-0 z-40 flex flex-col bg-[#09090b] text-[#f4f4f5] border-b border-[#27272a] shadow-md select-none font-sans">
      {/* ── Top Bar: Brand, Search, Status & Controls ── */}
      <div className="flex items-center justify-between px-3 h-11 border-b border-[#1f1f23] gap-2">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-7 h-7 rounded bg-emerald-500 text-black font-black text-sm shadow-sm group-hover:bg-emerald-400 transition-colors">
              <LineChart className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                TRADESIM <span className="text-emerald-400 text-xs px-1 rounded bg-emerald-500/15 border border-emerald-500/30 font-mono">PRO</span>
              </span>
              <span className="text-[9px] text-zinc-500 font-mono -mt-0.5 hidden sm:inline">
                INSTITUTIONAL SIMULATOR
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
              placeholder="Ketik simbol (BBCA, BTC, NVDA) atau perintah..."
              className="w-full bg-[#121215] border border-[#27272a] rounded pl-8 pr-16 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
            />
            <span className="absolute right-2 text-[9px] text-zinc-500 font-mono pointer-events-none" aria-hidden="true">
              ENTER ↵
            </span>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && cliInput && (
            <div className="absolute left-0 top-full mt-1 w-full bg-[#121216] border border-[#27272a] rounded-lg shadow-2xl py-1 z-50 text-[11px] max-h-72 overflow-y-auto">
              <div className="px-3 py-1 text-zinc-500 font-bold border-b border-[#27272a] flex justify-between items-center text-[9px]">
                <span>HASIL &amp; PERINTAH</span>
                <button onClick={() => setShowSuggestions(false)} className="hover:text-white">✕</button>
              </div>
              {CLI_COMMAND_SUGGESTIONS.filter(
                (s) => s.cmd.toLowerCase().includes(cliInput.toLowerCase()) || s.desc.toLowerCase().includes(cliInput.toLowerCase())
              ).map((item) => (
                <div
                  key={item.cmd}
                  onClick={() => executeCommand(item.cmd)}
                  className="px-3 py-1.5 hover:bg-zinc-800 cursor-pointer flex justify-between items-center transition-colors"
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
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>WIB: <strong className="text-zinc-200">{timeWib}</strong></span>
            <span className="text-zinc-600">•</span>
            <span>NY: <strong className="text-zinc-400">{timeNy}</strong></span>
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
                  onClick={() => logout()}
                  aria-label={`Keluar dari akun ${user.email}`}
                  className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title={`Keluar (${user.email})`}
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                aria-label="Buka form masuk akun member"
                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <User className="w-3 h-3" aria-hidden="true" />
                <span>Masuk</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <nav aria-label="Navigasi Cepat Workstation" className="flex items-center px-3 bg-[#0c0c0e] text-xs h-9 border-b border-[#1f1f23] overflow-x-auto no-scrollbar gap-1">
        <Link
          href="/"
          aria-current={pathname === '/' ? 'page' : undefined}
          className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 ${
            pathname === '/'
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <span>🖥️ Terminal</span>
        </Link>
        <Link
          href="/ai"
          aria-current={pathname.startsWith('/ai') ? 'page' : undefined}
          className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 ${
            pathname.startsWith('/ai')
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
              : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          <span>🤖 AI Trading Floor</span>
        </Link>
        <Link
          href="/portfolio"
          aria-current={pathname.startsWith('/portfolio') ? 'page' : undefined}
          className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 ${
            pathname.startsWith('/portfolio')
              ? 'bg-zinc-800 text-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <span>💼 Portofolio &amp; Order</span>
        </Link>
        <Link
          href="/crypto"
          className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 ${
            pathname.startsWith('/crypto')
              ? 'bg-zinc-800 text-cyan-400 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <span>⚡ Crypto Spot</span>
        </Link>
        <Link
          href="/heatmap"
          className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 ${
            pathname.startsWith('/heatmap')
              ? 'bg-zinc-800 text-white font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <span>🗺️ Heatmap IHSG</span>
        </Link>
        <Link
          href="/screener"
          className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 ${
            pathname.startsWith('/screener')
              ? 'bg-zinc-800 text-white font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <span>🔍 Screener</span>
        </Link>
        <Link
          href="/dividend"
          className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 ${
            pathname.startsWith('/dividend')
              ? 'bg-zinc-800 text-white font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <span>💰 Dividen</span>
        </Link>
        <Link
          href="/stream"
          className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 ${
            pathname.startsWith('/stream')
              ? 'bg-zinc-800 text-white font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <span>📰 Live News Wire</span>
        </Link>
        <Link
          href="/macro"
          className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 ${
            pathname.startsWith('/macro')
              ? 'bg-zinc-800 text-white font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <span>🌐 Makro &amp; Suku Bunga</span>
        </Link>
        <Link
          href="/admin/portfolios"
          aria-current={pathname.startsWith('/admin') ? 'page' : undefined}
          className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 ml-auto ${
            pathname.startsWith('/admin')
              ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40 font-bold'
              : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/40'
          }`}
        >
          <span>🛡️ Admin Panel</span>
        </Link>
      </nav>

      {/* Modals */}
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
      <AdminTopUpApprovalModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
        initialEmail={user?.email || ''}
      />
    </header>
  );
}
