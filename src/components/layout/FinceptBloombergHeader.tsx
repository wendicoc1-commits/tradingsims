'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Clock,
  X,
  Sparkles,
  HelpCircle,
  CornerDownLeft,
  Bot,
  Scale,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useMarketStore } from '@/store';
import { INVESTING_COM_GLOBAL_DIVIDENDS } from '@/data/investing_global_dividends';
import CompanyLogo from '@/components/common/CompanyLogo';
import { bloombergAudio } from '@/lib/bloombergAudio';
import TopUpModal from '@/components/portfolio/TopUpModal';
import AdminTopUpApprovalModal from '@/components/portfolio/AdminTopUpApprovalModal';
import AuthModal from '@/components/auth/AuthModal';
import { useAuthStore } from '@/store/useAuthStore';

interface CliSuggestion {
  cmd: string;
  desc: string;
  cat: 'saham' | 'pasar' | 'riset' | 'alat';
}

const CLI_COMMAND_SUGGESTIONS: CliSuggestion[] = [
  { cmd: 'BBCA <GO>', desc: 'Detail Saham BBCA & Analisis Teknikal', cat: 'saham' },
  { cmd: 'BMRI <GO>', desc: 'Detail Saham BMRI Bank Mandiri', cat: 'saham' },
  { cmd: 'BBRI <GO>', desc: 'Detail Saham BBRI Bank Rakyat Indonesia', cat: 'saham' },
  { cmd: 'ASII <GO>', desc: 'Detail Saham ASII Astra International', cat: 'saham' },
  { cmd: 'TLKM <GO>', desc: 'Detail Saham TLKM Telkom Indonesia', cat: 'saham' },
  { cmd: 'LPAD <GO>', desc: 'Multi-Chart Launchpad Workstation', cat: 'alat' },
  { cmd: 'HEATMAP <GO>', desc: 'Peta Sektoral IHSG & Market Cap', cat: 'pasar' },
  { cmd: 'SCREENER <GO>', desc: 'Stock Screener & Filter Fundamental', cat: 'pasar' },
  { cmd: 'DIV <GO>', desc: 'Analisis Dividen & Kalender Cum-Date', cat: 'pasar' },
  { cmd: 'BANDAR <GO>', desc: 'Radar Bandarmologi & Smart Money Flow', cat: 'pasar' },
  { cmd: 'ECO <GO>', desc: 'Kalender Makro & Suku Bunga BI / Fed', cat: 'pasar' },
  { cmd: 'BLOCK <GO>', desc: 'Transaksi Jumbo Pasar Negosiasi Tape', cat: 'pasar' },
  { cmd: 'IPO <GO>', desc: 'e-IPO Pipeline & Jadwal Penawaran', cat: 'pasar' },
  { cmd: 'FA <GO>', desc: 'Valuasi Fair Value & DCF Compass', cat: 'riset' },
  { cmd: 'ANR <GO>', desc: 'Rekomendasi Analis & Target Harga', cat: 'riset' },
  { cmd: 'OBB <GO>', desc: 'OpenBB 10-Tahun Financials & Options Desk', cat: 'riset' },
  { cmd: 'OPTIONS <GO>', desc: 'Rantai Opsi & Kalkulasi Greeks Derivatif', cat: 'riset' },
  { cmd: 'DEBATE <GO>', desc: 'Arena Debat Dialektika Bull vs Bear (HKUDS)', cat: 'riset' },
  { cmd: 'PAPER <GO>', desc: 'Autonomous Paper Trading Desk & Benchmark', cat: 'alat' },
  { cmd: 'AI <GO>', desc: 'Bloomberg AI Financial Copilot', cat: 'riset' },
  { cmd: 'NEWS <GO>', desc: 'Breaking News Wire & Sentimen Pasar', cat: 'riset' },
  { cmd: 'CRYPTO <GO>', desc: 'Jesse AI Quant Cryptocurrency Trading Desk', cat: 'pasar' },
  { cmd: 'BTC <GO>', desc: 'Bitcoin Spot Trading & Analisis Realtime', cat: 'pasar' },
  { cmd: 'PORT <GO>', desc: 'Portofolio Investasi & Trade Blotter', cat: 'alat' },
  { cmd: 'TOPUP <GO>', desc: 'Top Up Saldo Kas RDN via QRIS Resmi', cat: 'alat' },
  { cmd: 'ADMIN <GO>', desc: 'Panel Verifikasi Persetujuan Top-Up (PIN)', cat: 'alat' },
  { cmd: 'LOGIN <GO>', desc: 'Masuk / Daftar Akun Member (Email, Apple, FB)', cat: 'alat' },
  { cmd: 'SOUND <GO>', desc: 'Toggle Audio Suara Bloomberg Terminal', cat: 'alat' },
  { cmd: 'HELP <GO>', desc: 'Buka Panduan & Cheatsheet Terminal', cat: 'alat' },
];

export default function FinceptBloombergHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, setSelectedSymbol, setRightDockOpen, setActiveDockTab } = useMarketStore();
  const { user, logout, checkSession } = useAuthStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'markets' | 'research' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [timeUtc, setTimeUtc] = useState('');
  const [timeWib, setTimeWib] = useState('');
  const [timeNy, setTimeNy] = useState('');
  const [timeLon, setTimeLon] = useState('');
  const [timeTok, setTimeTok] = useState('');
  const [cliInput, setCliInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpCategory, setHelpCategory] = useState<'all' | 'saham' | 'pasar' | 'riset' | 'alat'>('all');
  const [helpSearch, setHelpSearch] = useState('');
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const cliInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    setIsSoundEnabled(bloombergAudio.getSoundEnabled());
  }, []);

  const handleToggleSound = () => {
    const nextState = bloombergAudio.toggleSound();
    setIsSoundEnabled(nextState);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clock updates for Bloomberg multi-timezones
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25));
      setTimeWib(new Date(now.getTime() + 7 * 3600 * 1000).toISOString().slice(11, 19));
      setTimeNy(new Date(now.getTime() - 4 * 3600 * 1000).toISOString().slice(11, 19));
      setTimeLon(new Date(now.getTime() + 1 * 3600 * 1000).toISOString().slice(11, 19));
      setTimeTok(new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(11, 19));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global Hotkeys (Cmd+K, Ctrl+K, or '/')
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        cliInputRef.current?.focus();
        setShowSuggestions(true);
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        cliInputRef.current?.focus();
        setShowSuggestions(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
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
    // Strip trailing <GO> or GO
    let cmd = rawCommand.trim().toUpperCase();
    cmd = cmd.replace(/<GO>$/i, '').replace(/\s+GO$/i, '').trim();
    if (!cmd) return;

    setShowSuggestions(false);

    if (cmd === 'HELP' || cmd === '?') {
      setShowHelpModal(true);
      return;
    }

    // Compound command support: e.g., "BBCA ANR", "ANR BBRI", "ASII SPLC", "BBCA OWN", "BBCA OMON", "BBCA FA"
    const parts = cmd.split(/\s+/);
    if (parts.length === 2) {
      const [p1, p2] = parts;
      const functionMap: Record<string, string> = {
        ANR: 'anr', EE: 'anr', CONSENSUS: 'anr',
        SPLC: 'splc', SUPPLY: 'splc',
        OWN: 'own', INSIDER: 'own', OWNERSHIP: 'own',
        OMON: 'omon', VOL: 'omon', WARRANT: 'omon', OPTIONS: 'omon',
        FA: 'dupont', DUPONT: 'dupont',
        NEWS: 'news', BANDAR: 'bandar', FLOW: 'bandar',
        DEPTH: 'orderbook', ORDERBOOK: 'orderbook',
      };
      if (functionMap[p2]) {
        setSelectedSymbol(p1);
        router.push(`/stock/${p1}?tab=${functionMap[p2]}`);
        setCliInput('');
        return;
      } else if (functionMap[p1]) {
        setSelectedSymbol(p2);
        router.push(`/stock/${p2}?tab=${functionMap[p1]}`);
        setCliInput('');
        return;
      }
    }

    if (cmd === 'OPENSTOCK' || cmd === 'ODS' || cmd === 'TRADINGVIEW' || cmd === 'SENTIMENT' || cmd === 'LPAD' || cmd === 'LAUNCHPAD' || cmd === 'DESK' || cmd === 'WORKSTATION') {
      router.push('/');
    }
    else if (cmd === 'ANR' || cmd === 'EE' || cmd === 'CONSENSUS') router.push('/stock/BBCA?tab=intel');
    else if (cmd === 'YCRV' || cmd === 'CURVE' || cmd === 'INVERSION') router.push('/macro?tab=ycrv');
    else if (cmd === 'SPLC' || cmd === 'SUPPLY' || cmd === 'SUPPLIER') router.push('/stock/BBCA?tab=intel');
    else if (cmd === 'OWN' || cmd === 'INSIDER' || cmd === 'OWNERSHIP') router.push('/stock/BBCA?tab=intel');
    else if (cmd === 'OMON' || cmd === 'VOL' || cmd === 'WARRANT' || cmd === 'OPTIONS') router.push('/stock/BBCA?tab=intel');
    else if (cmd === 'ECO' || cmd === 'MACRO' || cmd === 'ECFC' || cmd === 'CALENDAR') router.push('/macro');
    else if (cmd === 'WEI' || cmd === 'GVD' || cmd === 'SPREAD' || cmd === 'FXC') router.push('/macro?tab=wei');
    else if (cmd === 'BLOCK' || cmd === 'BLOCKS' || cmd === 'WHALE' || cmd === 'CROSS' || cmd === 'FXI') router.push('/stream?tab=block');
    else if (cmd === 'FA' || cmd === 'DUPONT' || cmd === 'VALUATION' || cmd === 'DCF') router.push('/stock/BBCA?tab=valuation');
    else if (cmd === 'SOUND' || cmd === 'AUDIO') {
      handleToggleSound();
    }
    else if (cmd === 'PORT' || cmd === 'PORTFOLIO') router.push('/portfolio');
    else if (cmd === 'TOPUP' || cmd === 'TOP-UP' || cmd === 'QRIS' || cmd === 'DEPOSIT') {
      setIsTopUpOpen(true);
    }
    else if (cmd === 'ADMIN' || cmd === 'APPROVAL' || cmd === 'ACC') {
      setIsAdminOpen(true);
    }
    else if (cmd === 'LOGIN' || cmd === 'AUTH' || cmd === 'SIGNIN' || cmd === 'REGISTER') {
      setIsAuthModalOpen(true);
    }
    else if (cmd === 'OBB' || cmd === 'OPENBB' || cmd === 'STATEMENTS') router.push('/stock/BBCA?tab=openbb');
    else if (cmd === 'OPTIONS' || cmd === 'OPTION' || cmd === 'GREEKS' || cmd === 'DERIV') router.push('/stock/BBCA?tab=openbb');
    else if (cmd === 'OFFICE' || cmd === 'WARROOM' || cmd === 'WAR' || cmd === 'ROOM') router.push('/ai?tab=office');
    else if (cmd === 'DEBATE' || cmd === 'ARENA' || cmd === 'BULLBEAR') router.push('/ai?tab=debate');
    else if (cmd === 'PAPER' || cmd === 'SETTLEMENT' || cmd === 'BENCHMARK') router.push('/ai?tab=paper');
    else if (cmd === 'AI' || cmd === 'AICHAT' || cmd === 'COPILOT' || cmd === 'GPT' || cmd === 'HEDGE') router.push('/ai');
    else if (cmd === 'EQUITY' || cmd === 'STOCKS' || cmd === 'SCREENER') router.push('/screener');
    else if (cmd === 'NEWS' || cmd === 'STREAM' || cmd === 'TOP' || cmd === 'WIRE') router.push('/stream');
    else if (cmd === 'DIVIDEND' || cmd === 'DIV' || cmd === 'DVD') router.push('/dividend');
    else if (cmd === 'IPO') router.push('/ipo');
    else if (cmd === 'BANDAR' || cmd === 'FLOW') router.push('/?preset=bandarDesk');
    else if (cmd === 'CRYPTO' || cmd === 'BTC' || cmd === 'ETH' || cmd === 'COIN' || cmd === 'JESSE') router.push('/crypto');
    else if (cmd === 'HEATMAP' || cmd === 'MAP') router.push('/heatmap');
    else if (cmd === 'BLOOMBERG') router.push('/stock/BBCA?tab=valuation');
    else {
      const cleanTicker = cmd.replace(/[^A-Z0-9.]/g, '');
      if (cleanTicker.length >= 1 && cleanTicker.length <= 12) {
        setSelectedSymbol(cleanTicker);
        router.push(`/stock/${cleanTicker}`);
      }
    }
    setCliInput('');
  };

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(cliInput);
  };

  const filteredHelpCommands = CLI_COMMAND_SUGGESTIONS.filter((s) => {
    const matchesCat = helpCategory === 'all' || s.cat === helpCategory;
    const matchesSearch =
      !helpSearch ||
      s.cmd.toLowerCase().includes(helpSearch.toLowerCase()) ||
      s.desc.toLowerCase().includes(helpSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <header className="sticky top-0 z-40 bg-[#09090b] border-b border-[#27272a] select-none font-mono text-xs">
      {/* ── Level 1: Terminal Status & Global Search Bar ── */}
      <div className="flex items-center justify-between px-3 h-9 border-b border-[#1f1f23] text-[11px] text-[#a1a1aa]">
        {/* Left: Interactive Search / Command Prompt */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <form onSubmit={handleCliSubmit} className="flex items-center gap-1.5 bg-[#121216] border border-[#27272a] focus-within:border-[#f59e0b] px-2 py-1 rounded transition-colors shadow-inner">
              <span className="text-[#f59e0b] font-bold">&gt;</span>
              <input
                ref={cliInputRef}
                type="text"
                value={cliInput}
                onChange={(e) => {
                  setCliInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Cari saham / perintah (Ctrl+K)..."
                className="w-44 sm:w-64 md:w-72 bg-transparent outline-none text-[#fafafa] placeholder-[#52525b] text-[10px] font-mono"
              />
              <button
                type="submit"
                className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-extrabold px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 cursor-pointer shadow-sm active:scale-95 transition-all"
                title="Eksekusi Perintah"
              >
                <span>&lt;GO&gt;</span>
              </button>
            </form>

            {/* Suggestions Popover */}
            {showSuggestions && (() => {
              const q = cliInput.toLowerCase().trim();
              const matchingCmds = q
                ? CLI_COMMAND_SUGGESTIONS.filter(
                    (s) => s.cmd.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
                  )
                : CLI_COMMAND_SUGGESTIONS.slice(0, 5);

              const matchingStocks = q
                ? INVESTING_COM_GLOBAL_DIVIDENDS.filter(
                    (st) =>
                      st.ticker.toLowerCase().includes(q) ||
                      st.name.toLowerCase().includes(q) ||
                      st.country.toLowerCase().includes(q)
                  ).slice(0, 5)
                : [];

              return (
                <div className="absolute left-0 top-full mt-1 w-80 bg-[#121216] border border-[#27272a] rounded shadow-2xl py-1 z-50 text-[10px] max-h-80 overflow-y-auto">
                  <div className="px-2.5 py-1 text-[#71717a] font-bold border-b border-[#27272a] flex justify-between items-center text-[9px]">
                    <span>{q ? 'HASIL PENCARIAN' : 'REKOMENDASI PERINTAH CEPAT'}</span>
                    <button onClick={() => setShowSuggestions(false)} className="hover:text-white">✕</button>
                  </div>

                  {matchingCmds.map((item) => (
                    <div
                      key={item.cmd}
                      onClick={() => executeCommand(item.cmd)}
                      className="px-2.5 py-1.5 hover:bg-[#27272a] cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <span className="text-[#f59e0b] font-bold font-mono">{item.cmd}</span>
                      <span className="text-[#a1a1aa] truncate max-w-[160px] text-[9px]">{item.desc}</span>
                    </div>
                  ))}

                  {matchingStocks.length > 0 && (
                    <>
                      <div className="px-2.5 py-1 text-[#71717a] font-bold border-t border-b border-[#27272a] flex justify-between items-center text-[9px] mt-1 bg-[#18181b]">
                        <span>SAHAM GLOBAL</span>
                        <span className="text-[#f59e0b] text-[8px]">{matchingStocks.length} MATCH</span>
                      </div>
                      {matchingStocks.map((st) => (
                        <div
                          key={st.ticker}
                          onClick={() => executeCommand(`${st.ticker} <GO>`)}
                          className="px-2.5 py-1.5 hover:bg-[#27272a] cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <CompanyLogo symbol={st.ticker} name={st.name} size={16} />
                            <span className="shrink-0">{st.flag}</span>
                            <span className="text-[#f59e0b] font-bold font-mono shrink-0">{st.ticker}</span>
                            <span className="text-zinc-400 truncate text-[9px]">{st.name}</span>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className="text-emerald-400 font-bold font-mono text-[9px]">{st.yieldPct}% Yld</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })()}
          </div>

          <button
            onClick={() => setShowHelpModal(true)}
            className="text-[#71717a] hover:text-[#f59e0b] transition-colors p-1"
            title="Buka Cheatsheet Perintah Terminal (HELP)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Live Clocks & System Controls */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#22c55e] font-bold text-[10px] bg-[#22c55e]/10 px-1.5 py-0.5 rounded border border-[#22c55e]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            LIVE
          </span>

          <div
            className="hidden sm:flex items-center gap-2 text-[10px] text-[#d4d4d8]"
            title={`WIB: ${timeWib} | NY: ${timeNy} | LON: ${timeLon} | TOK: ${timeTok}`}
          >
            <span>WIB: <strong className="text-[#f59e0b] font-mono">{timeWib}</strong></span>
            <span className="text-[#3f3f46] hidden md:inline">&bull;</span>
            <span className="text-[#71717a] hidden md:inline font-mono">NY: {timeNy}</span>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-[#27272a]">
            <button
              onClick={handleToggleSound}
              className={`p-1 transition-colors cursor-pointer ${isSoundEnabled ? 'text-[#f59e0b]' : 'text-[#71717a] hover:text-white'}`}
              title={isSoundEnabled ? 'Audio Terminal: AKTIF' : 'Audio Terminal: SENYAP'}
            >
              {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1 hover:text-white text-[#71717a] transition-colors"
              title="Layar Penuh"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleTheme}
              className="p-1 hover:text-white text-[#71717a] transition-colors"
              title="Ganti Tema"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Level 2: Clean 4-Pillar Workstation Navigation Bar ── */}
      <div ref={dropdownRef} className="flex items-center justify-between px-3 bg-[#09090b] text-[11px] border-b border-[#1f1f23] h-9 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1 shrink-0">
          {/* Workstation Utama: OVERVIEW & MULTI-CHART WORKSTATION */}
          <Link
            href="/"
            className={`px-3 py-1.5 uppercase font-bold tracking-tight transition-all duration-150 flex items-center gap-1.5 rounded-sm ${
              pathname === '/'
                ? 'text-[#f59e0b] bg-[#18181b] border-b-2 border-[#f59e0b]'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#121215]'
            }`}
          >
            <span>🖥️ WORKSTATION UTAMA</span>
          </Link>

          {/* Pillar 2: MARKETS & SCANNER (Dropdown) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'markets' ? null : 'markets')}
              className={`px-3 py-1.5 uppercase font-bold tracking-tight transition-all duration-150 flex items-center gap-1 rounded-sm cursor-pointer ${
                ['/heatmap', '/screener', '/dividend', '/ipo', '/markets', '/macro'].some((p) => pathname.startsWith(p))
                  ? 'text-[#f59e0b] bg-[#18181b] border-b-2 border-[#f59e0b]'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#121215]'
              }`}
            >
              <span>📊 PASAR &amp; SCANNER</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'markets' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'markets' && (
              <div className="absolute left-0 top-full mt-1 w-64 bg-[#121216] border border-[#27272a] rounded shadow-2xl p-1.5 z-50 text-xs space-y-1">
                <div className="px-2 py-1 text-[9px] font-bold text-[#71717a] border-b border-[#27272a] uppercase">
                  ANALISIS PASAR &amp; PENYARING SAHAM
                </div>
                <Link
                  href="/heatmap"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#18181b] text-[#d4d4d8] hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>🗺️</span>
                    <div>
                      <div className="font-bold text-[11px] text-white">Market Heatmap</div>
                      <div className="text-[9px] text-[#71717a]">Peta Sektoral IHSG &amp; Global</div>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/screener"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#18181b] text-[#d4d4d8] hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>🔍</span>
                    <div>
                      <div className="font-bold text-[11px] text-white">Stock Screener Pro</div>
                      <div className="text-[9px] text-[#71717a]">Filter Teknikal &amp; Fundamental</div>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/dividend"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#18181b] text-[#d4d4d8] hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <div>
                      <div className="font-bold text-[11px] text-white">Dividen Global &amp; Kalender</div>
                      <div className="text-[9px] text-[#71717a]">Saham Dividen &amp; Jadwal Cum-Date</div>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/ipo"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#18181b] text-[#d4d4d8] hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>🚀</span>
                    <div>
                      <div className="font-bold text-[11px] text-white">e-IPO Pipeline</div>
                      <div className="text-[9px] text-[#71717a]">Jadwal Penawaran Saham Perdana</div>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/macro"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#18181b] text-[#d4d4d8] hover:text-white transition-colors border-t border-[#27272a]/60 pt-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span>🏛️</span>
                    <div>
                      <div className="font-bold text-[11px] text-[#f59e0b]">Kalender Makro &amp; Suku Bunga</div>
                      <div className="text-[9px] text-[#71717a]">BI-Rate, Fed FOMC, SBN 10Y Yield</div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Pillar 3: RESEARCH & INTEL (Dropdown) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'research' ? null : 'research')}
              className={`px-3 py-1.5 uppercase font-bold tracking-tight transition-all duration-150 flex items-center gap-1 rounded-sm cursor-pointer ${
                ['/stream', '/ai', '/bloomberg'].some((p) => pathname.startsWith(p))
                  ? 'text-[#f59e0b] bg-[#18181b] border-b-2 border-[#f59e0b]'
                  : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#121215]'
              }`}
            >
              <span>🔬 RISET &amp; INTEL</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'research' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'research' && (
              <div className="absolute left-0 top-full mt-1 w-64 bg-[#121216] border border-[#27272a] rounded shadow-2xl p-1.5 z-50 text-xs space-y-1">
                <div className="px-2 py-1 text-[9px] font-bold text-[#71717a] border-b border-[#27272a] uppercase">
                  RISET SAHAM &amp; FUNDAMENTAL
                </div>
                <Link
                  href="/stock/BBCA?tab=valuation"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#18181b] text-[#d4d4d8] hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>🎯</span>
                    <div>
                      <div className="font-bold text-[11px] text-[#f59e0b]">Valuasi Fair Value &amp; DCF</div>
                      <div className="text-[9px] text-[#71717a]">DCF, Graham Formula &amp; Konsensus</div>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/stream"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#18181b] text-[#d4d4d8] hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>📰</span>
                    <div>
                      <div className="font-bold text-[11px] text-white">Berita Pasar Wire</div>
                      <div className="text-[9px] text-[#71717a]">Live Breaking News &amp; Sentimen</div>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/ai"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#18181b] text-[#d4d4d8] hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>🏛️</span>
                    <div>
                      <div className="font-bold text-[11px] text-[#f59e0b]">Bloomberg AI Intelligence Hub</div>
                      <div className="text-[9px] text-[#71717a]">Komite Hedge Fund 7-Persona &amp; Financial Copilot</div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Pillar 4: PORTOFOLIO DESK */}
          <Link
            href="/portfolio"
            className={`px-3 py-1.5 uppercase font-bold tracking-tight transition-all duration-150 flex items-center gap-1.5 rounded-sm ${
              pathname.startsWith('/portfolio')
                ? 'text-[#f59e0b] bg-[#18181b] border-b-2 border-[#f59e0b]'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#121215]'
            }`}
          >
            <span>💼 PORTOFOLIO &amp; TRADING</span>
          </Link>
        </div>

        {/* Right Action Tools: Member Login, Top Up QRIS, Watchlist Dock & Quick Trade */}
        <div className="flex items-center gap-2 pl-2 shrink-0">
          {/* Member Auth Button */}
          {user ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#18181b] border border-zinc-700 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-amber-300 max-w-[80px] truncate">
                {user.fullName || user.email.split('@')[0]}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="text-zinc-500 hover:text-rose-400 text-[9px] underline ml-0.5 cursor-pointer"
                title="Keluar (Logout)"
              >
                Keluar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700 text-[10px] font-black cursor-pointer shadow-sm transition-all active:scale-95"
              title="Masuk / Daftar Akun Member (Email, Apple ID, Facebook)"
            >
              <span>👤</span>
              <span>MASUK</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsTopUpOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-[#f59e0b] hover:text-amber-400 border border-amber-500/40 text-[10px] font-black cursor-pointer shadow-sm transition-all active:scale-95"
            title="Top Up Saldo Kas RDN via QRIS (Rp 10.000 = Rp 1.000.000 Saldo Kas)"
          >
            <span>💳</span>
            <span>TOP UP</span>
            <span className="text-[9px] bg-[#f59e0b] text-black px-1 rounded font-black">QRIS</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveDockTab('watchlist');
              setRightDockOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18181b] hover:bg-[#27272a] text-[#d4d4d8] hover:text-white border border-[#27272a] text-[10px] font-bold cursor-pointer transition-colors"
            title="Buka Watchlist Cepat"
          >
            <span>📊</span>
            <span>Watchlist</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveDockTab('order');
              setRightDockOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f59e0b] hover:bg-[#d97706] text-black text-[10px] font-extrabold cursor-pointer shadow-sm transition-all active:scale-95"
            title="Buka Form Eksekusi Order Cepat Beli / Jual"
          >
            <span>⚡</span>
            <span>Quick Trade</span>
          </button>
        </div>
      </div>

      {/* ── Cheatsheet Modal ── */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-[#27272a] rounded-sm max-w-lg w-full p-4 font-mono text-xs space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#27272a] pb-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="text-[#f59e0b]">&gt;</span>
                <span>PANDUAN PERINTAH TERMINAL</span>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-[#71717a] hover:text-white">✕</button>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717a]" />
              <input
                type="text"
                value={helpSearch}
                onChange={(e) => setHelpSearch(e.target.value)}
                placeholder="Cari perintah atau fitur..."
                className="w-full bg-[#121216] border border-[#27272a] focus:border-[#f59e0b] pl-8 pr-3 py-1.5 rounded text-white text-xs outline-none"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'saham', label: 'Saham' },
                { id: 'pasar', label: 'Pasar & Makro' },
                { id: 'riset', label: 'Riset' },
                { id: 'alat', label: 'Alat' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setHelpCategory(c.id as any)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer shrink-0 ${
                    helpCategory === c.id
                      ? 'bg-[#f59e0b] text-black border-[#f59e0b]'
                      : 'bg-[#18181b] text-[#a1a1aa] border-[#27272a] hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="divide-y divide-[#18181b] max-h-72 overflow-y-auto">
              {filteredHelpCommands.map((s) => (
                <div
                  key={s.cmd}
                  onClick={() => {
                    executeCommand(s.cmd);
                    setShowHelpModal(false);
                  }}
                  className="py-1.5 px-2 hover:bg-[#18181b] cursor-pointer flex justify-between items-center rounded transition-colors group"
                >
                  <span className="text-[#f59e0b] font-bold group-hover:underline">{s.cmd}</span>
                  <span className="text-[#d4d4d8] text-[11px]">{s.desc}</span>
                </div>
              ))}
              {filteredHelpCommands.length === 0 && (
                <div className="py-4 text-center text-[#71717a]">
                  Tidak ada perintah yang cocok.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#27272a] flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-3 py-1 rounded text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Up Saldo Kas RDN Modal (QRIS) ── */}
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />

      {/* ── Panel Verifikasi Admin Top-Up (Metode A) ── */}
      <AdminTopUpApprovalModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

      {/* ── Member Auth Modal (Email, Apple, Facebook, Google) ── */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}
