'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  Radio,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileText,
  Globe,
  Flame,
  Award,
  Crown,
  Sparkles,
  Zap,
  Star,
  Briefcase,
  Calendar,
  Layers,
} from 'lucide-react';
import { getAllStocksNewsMaster, DisplayArticle } from '@/lib/stockNewsService';
import { usePortfolioStore, useWatchlistStore } from '@/store';
import CompanyLogo from '@/components/common/CompanyLogo';
import { useHourlyNews } from '@/hooks/useHourlyNews';
import HourlyUpdateStatusBar from '@/components/news/HourlyUpdateStatusBar';
import BlockTradesSection from '@/components/stream/BlockTradesSection';

export default function MarketNewsWirePage() {
  const { holdings } = usePortfolioStore();
  const { watchlists } = useWatchlistStore();

  const [wireSection, setWireSection] = useState<'NEWS_WIRE' | 'BLOCK_TRADES'>('NEWS_WIRE');
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'MY_STOCKS' | 'FLASH' | 'ID' | 'GLOBAL' | 'DIVIDEND' | 'TECH' | 'ARCHIVE'
  >('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'ARCHIVE'>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<'ALL' | 'BULLISH' | 'BEARISH' | 'NEUTRAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStoryModal, setActiveStoryModal] = useState<DisplayArticle | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('tab') === 'block') {
        setWireSection('BLOCK_TRADES');
      }
    }
  }, []);

  // Extract all user's held and watched stock tickers
  const userTickers = useMemo(() => {
    const defaultWatchlist = watchlists[0]?.items || [];
    return Array.from(
      new Set([
        ...holdings.map((h) => (h.displaySymbol || h.symbol).replace('.JK', '').trim().toUpperCase()),
        ...defaultWatchlist.map((w) => (w.displaySymbol || w.symbol).replace('.JK', '').trim().toUpperCase()),
      ])
    ).filter(Boolean);
  }, [holdings, watchlists]);

  const hourlyState = useHourlyNews();

  // Master articles list across all 950+ IDX & 101 Global stocks with hourly live prepended
  const allMasterArticles = useMemo(() => {
    const base = getAllStocksNewsMaster();
    const seen = new Set(base.map((b) => b.id));
    const merged = [...base];
    hourlyState.articles.forEach((art) => {
      if (!seen.has(art.id)) {
        seen.add(art.id);
        merged.unshift(art);
      }
    });
    return merged;
  }, [hourlyState.articles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    let list = allMasterArticles;

    if (activeTab === 'MY_STOCKS') {
      const userSet = new Set(userTickers.map((t) => t.toUpperCase()));
      list = list.filter(
        (a) => userSet.has(a.ticker.toUpperCase()) || (a.tickers && a.tickers.some((t) => userSet.has(t.toUpperCase())))
      );
    } else if (activeTab === 'FLASH') {
      list = list.filter((a) => a.urgency === 'FLASH' || a.urgency === 'MOVER');
    } else if (activeTab === 'ID') {
      list = list.filter((a) => a.flag === '🇮🇩');
    } else if (activeTab === 'GLOBAL') {
      list = list.filter((a) => a.flag !== '🇮🇩');
    } else if (activeTab === 'DIVIDEND') {
      list = list.filter((a) => a.category === 'Earnings & Dividen');
    } else if (activeTab === 'TECH') {
      list = list.filter((a) => a.category === 'Tech & AI');
    } else if (activeTab === 'ARCHIVE') {
      list = list.filter((a) => a.period === 'ARCHIVE' || a.period === 'QUARTER');
    }

    if (selectedPeriod !== 'ALL') {
      list = list.filter((a) => a.period === selectedPeriod);
    }

    if (selectedSentiment !== 'ALL') {
      list = list.filter((a) => a.sentiment === selectedSentiment);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.ticker.toLowerCase().includes(q) ||
          (a.tickers && a.tickers.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [allMasterArticles, activeTab, userTickers, selectedPeriod, selectedSentiment, searchQuery]);

  // Counts
  const myStocksCount = useMemo(() => {
    const userSet = new Set(userTickers.map((t) => t.toUpperCase()));
    return allMasterArticles.filter(
      (a) => userSet.has(a.ticker.toUpperCase()) || (a.tickers && a.tickers.some((t) => userSet.has(t.toUpperCase())))
    ).length;
  }, [allMasterArticles, userTickers]);

  const archiveCount = useMemo(() => {
    return allMasterArticles.filter((a) => a.period === 'ARCHIVE' || a.period === 'QUARTER').length;
  }, [allMasterArticles]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-mono select-none">
      {/* ── Top Bloomberg Header Banner ── */}
      <div
        className="rounded border p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg"
        style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse" />
            <span className="text-xs font-black text-[#f59e0b] uppercase tracking-widest flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#ef4444]" />
              BLOOMBERG PROFESSIONAL NEWS WIRE &lt;WIRE/TOP&gt;
            </span>
            <span className="text-[10px] text-[#71717a] font-normal">| ALL EQUITIES &amp; HISTORICAL ARCHIVES</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-wide">
            Intelijen Berita Finansial, Keterbukaan Emiten &amp; Arsip Historis
          </h1>
          <p className="text-xs text-[#a1a1aa] font-sans mt-0.5 max-w-3xl">
            Liputan berita pasar modal terverifikasi: mencakup seluruh 950+ saham IHSG/BEI, 101 saham dividen global, serta arsip keterbukaan informasi sebelumnya.
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('MY_STOCKS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition-all cursor-pointer ${
              activeTab === 'MY_STOCKS'
                ? 'bg-[#f59e0b] text-black border-[#f59e0b]'
                : 'bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] border-[#f59e0b]/40'
            }`}
            title="Saring langsung berita untuk saham di Portofolio & Watchlist Anda"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Saham Saya ({myStocksCount})</span>
          </button>

          <span className="text-[11px] font-bold px-2.5 py-1.5 rounded bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">
            {filteredArticles.length} / {allMasterArticles.length} Berita
          </span>
        </div>
      </div>

      {/* ── Section Switcher: Live Wire vs Block Trades ── */}
      <div className="flex items-center gap-2 border-b border-[#27272a] pb-2 text-xs">
        <button
          type="button"
          onClick={() => setWireSection('NEWS_WIRE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition-all ${
            wireSection === 'NEWS_WIRE'
              ? 'bg-amber-500 text-black shadow-sm font-extrabold'
              : 'bg-[#18181e] text-zinc-400 hover:text-white border border-[#27272a]'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Live News &amp; Wire Pasar ({allMasterArticles.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setWireSection('BLOCK_TRADES')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition-all ${
            wireSection === 'BLOCK_TRADES'
              ? 'bg-amber-500 text-black shadow-sm font-extrabold'
              : 'bg-[#18181e] text-zinc-400 hover:text-white border border-[#27272a]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Transaksi Nego &amp; Crossing (Whale Block Trades)</span>
        </button>
      </div>

      {wireSection === 'BLOCK_TRADES' ? (
        <BlockTradesSection />
      ) : (
        <>
          {/* ── Hourly Auto-Sync Status Bar (Every 1 Hour) ── */}
          <HourlyUpdateStatusBar hourlyState={hourlyState} />

          {/* ── Main Category Pills Navigation ── */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        {[
          { id: 'ALL', label: `🔥 Semua Wire (${allMasterArticles.length})` },
          { id: 'MY_STOCKS', label: `⭐ Saham Saya (${myStocksCount})`, highlight: true },
          { id: 'FLASH', label: '🚨 Breaking Flash' },
          { id: 'ID', label: '🇮🇩 Bursa IDX' },
          { id: 'GLOBAL', label: '🌍 Wall St & Global' },
          { id: 'DIVIDEND', label: '💰 Dividen & Laba' },
          { id: 'TECH', label: '⚡ Tech & AI' },
          { id: 'ARCHIVE', label: `📅 Arsip Sebelumnya (${archiveCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded font-bold whitespace-nowrap transition-colors cursor-pointer text-[11px] ${
              activeTab === tab.id
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : tab.highlight
                ? 'bg-[#f59e0b]/15 text-[#f59e0b] hover:bg-[#f59e0b]/25 border border-[#f59e0b]/30'
                : 'bg-[#121216] text-[#a1a1aa] hover:text-white border border-[#27272a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Search Bar & Secondary Horizon Filter ── */}
      <div
        className="rounded border p-2.5 space-y-2 text-xs"
        style={{ backgroundColor: '#0e0e12', borderColor: '#27272a' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Search Input for All Stocks */}
          <div className="flex-1 flex items-center gap-2 bg-[#18181b] border border-[#27272a] px-3 py-1.5 rounded">
            <Search className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ticker mana pun, kata kunci, emiten (misal: BBRI, BMRI, NVDA, KO, dividen, RUPS)..."
              className="w-full bg-transparent text-white placeholder-[#71717a] outline-none text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#71717a] hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Time Period Filter */}
          <div className="flex items-center gap-1.5 text-[11px] shrink-0 overflow-x-auto">
            <span className="text-[#71717a] uppercase font-bold text-[10px]">Periode:</span>
            {[
              { id: 'ALL', label: 'Semua Periode' },
              { id: 'TODAY', label: 'Hari Ini' },
              { id: 'WEEK', label: 'Minggu Ini' },
              { id: 'MONTH', label: 'Bulan Ini' },
              { id: 'ARCHIVE', label: 'Arsip Historis' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPeriod(p.id as any)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer text-[10px] ${
                  selectedPeriod === p.id
                    ? 'bg-[#f59e0b] text-black font-bold'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-1 shrink-0 text-[11px]">
            <span className="text-[#71717a] uppercase font-bold text-[10px]">Sentimen:</span>
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value as any)}
              className="bg-[#18181b] border border-[#27272a] text-[#d4d4d8] px-2 py-1 rounded outline-none text-[11px] font-mono cursor-pointer"
            >
              <option value="ALL">Semua Sentimen</option>
              <option value="BULLISH">▲ Bullish (+)</option>
              <option value="BEARISH">▼ Bearish (-)</option>
              <option value="NEUTRAL">● Netral</option>
            </select>
          </div>
        </div>

        {/* User Stocks Quick Badges (when on My Stocks mode) */}
        {activeTab === 'MY_STOCKS' && (
          <div className="pt-2 border-t border-[#1f1f23] flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-[#f59e0b] font-bold flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Filter Saham Anda:</span>
            </span>
            {userTickers.length === 0 ? (
              <span className="text-[#71717a]">Belum ada saham di portofolio atau watchlist.</span>
            ) : (
              userTickers.map((ticker) => (
                <button
                  key={ticker}
                  type="button"
                  onClick={() => setSearchQuery(ticker)}
                  className="px-2 py-0.5 rounded bg-[#18181b] hover:bg-[#27272a] text-white border border-[#27272a] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <CompanyLogo symbol={ticker} size={14} />
                  <span>{ticker}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── News Articles Stream List ── */}
      <div className="space-y-2.5">
        {filteredArticles.length === 0 ? (
          <div
            className="p-12 text-center text-[#71717a] border rounded text-xs space-y-2"
            style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}
          >
            <div className="text-sm font-bold text-white">Tidak Ada Berita atau Arsip yang Cocok</div>
            <p>
              Tidak ditemukan berita untuk kriteria pencarian &quot;{searchQuery}&quot; pada filter {activeTab}.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTab('ALL');
                setSelectedPeriod('ALL');
                setSelectedSentiment('ALL');
                setSearchQuery('');
              }}
              className="mt-2 px-3 py-1 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded text-xs cursor-pointer font-bold"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          filteredArticles.map((art) => {
            const isFlash = art.urgency === 'FLASH';
            const isBfw = art.urgency === 'BFW';
            const isArchive = art.period === 'ARCHIVE' || art.period === 'QUARTER';
            const isBullish = art.sentiment === 'BULLISH';
            const isBearish = art.sentiment === 'BEARISH';

            return (
              <div
                key={art.id}
                onClick={() => setActiveStoryModal(art)}
                className={`p-3.5 rounded border transition-all cursor-pointer group flex flex-col gap-1.5 ${
                  isFlash
                    ? 'bg-red-950/15 border-red-500/50 hover:border-red-400'
                    : isBfw
                    ? 'bg-[#121216] border-[#f59e0b]/40 hover:border-[#f59e0b]'
                    : isArchive
                    ? 'bg-[#0a0a0d] border-[#1f1f23] hover:border-[#3f3f46]'
                    : 'bg-[#09090b] border-[#27272a] hover:border-[#52525b]'
                }`}
              >
                {/* Meta Top Line */}
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Urgency Badge */}
                    <span
                      className={`px-1.5 py-0.2 rounded font-extrabold text-[9px] border ${
                        isFlash
                          ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                          : isBfw
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : isArchive
                          ? 'bg-neutral-800 text-neutral-400 border-neutral-700'
                          : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                      }`}
                    >
                      {art.urgency === 'ARCHIVE' ? 'ARSIP' : art.urgency}
                    </span>

                    {/* Wire Code */}
                    <span className="text-[#a1a1aa] font-bold font-mono">{art.wireCode}</span>

                    {/* Ticker Badge with Company Logo */}
                    <Link
                      href={`/stock/${art.ticker}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-1.5 py-0.2 rounded font-bold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30 hover:bg-[#f59e0b] hover:text-black transition-colors"
                      title={`Buka detail emiten ${art.ticker}`}
                    >
                      <CompanyLogo symbol={art.ticker} size={14} />
                      <span>{art.flag}</span>
                      <span>{art.ticker}</span>
                    </Link>

                    <span className="text-[#52525b] text-[9px]">• {art.relativeTime}</span>
                    <span className="text-[#71717a] text-[9px]">({art.date})</span>
                  </div>

                  {/* Sentiment & Source */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        isBullish
                          ? 'text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30'
                          : isBearish
                          ? 'text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/30'
                          : 'text-[#a1a1aa] bg-[#27272a]'
                      }`}
                    >
                      {isBullish ? `▲ +${art.sentimentScore}%` : isBearish ? `▼ ${art.sentimentScore}%` : '● Netral'}
                    </span>
                    <span className="text-[10px] text-[#71717a] font-bold tracking-tight uppercase">
                      {art.source}
                    </span>
                  </div>
                </div>

                {/* Headline */}
                <h3 className="text-white text-xs sm:text-[13px] font-bold leading-snug font-sans group-hover:text-[#f59e0b] transition-colors">
                  {art.title}
                </h3>

                {/* Summary / Takeaway snippet */}
                <p className="text-[11px] text-[#a1a1aa] line-clamp-2 font-sans leading-relaxed">
                  {art.summary}
                </p>

                {/* Footer byline & Read prompt */}
                <div className="flex items-center justify-between pt-1 border-t border-[#18181b] text-[10px] text-[#71717a]">
                  <span className="truncate max-w-md">{art.byline}</span>
                  <span className="text-[#f59e0b] font-bold flex items-center gap-1 group-hover:underline">
                    <span>Baca Lengkap</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  )}

      {/* ── MODAL INSPECTOR FOR COMPLETE STORY & HISTORICAL RECORD ── */}
      {activeStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 font-mono">
          <div className="bg-[#09090b] border border-[#f59e0b]/50 rounded max-w-2xl w-full p-5 text-xs space-y-3.5 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#27272a] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <CompanyLogo symbol={activeStoryModal.ticker} size={22} />
                  <span className="bg-[#ef4444] text-white px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                    {activeStoryModal.urgency}
                  </span>
                  <span className="text-[#f59e0b] font-bold text-xs">{activeStoryModal.wireCode}</span>
                  <span className="text-[#71717a] text-[10px]">({activeStoryModal.date})</span>
                </div>
                <div className="text-[11px] text-[#a1a1aa]">{activeStoryModal.byline}</div>
              </div>
              <button
                type="button"
                onClick={() => setActiveStoryModal(null)}
                className="text-[#71717a] hover:text-white p-1 text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <h2 className="text-white text-base font-bold leading-snug font-sans border-l-3 border-[#f59e0b] pl-3">
                {activeStoryModal.title}
              </h2>

              {/* Ticker Badges & Sentiment */}
              <div className="flex items-center justify-between gap-2 bg-[#121216] p-2.5 rounded border border-[#27272a]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[#71717a] font-bold">EMITEN TERKAIT:</span>
                  {activeStoryModal.tickers?.map((t) => (
                    <Link
                      key={t}
                      href={`/stock/${t}`}
                      onClick={() => setActiveStoryModal(null)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f59e0b] text-black hover:bg-[#fbbf24] transition-colors flex items-center gap-1"
                    >
                      <CompanyLogo symbol={t} size={14} />
                      <span>{t}</span>
                    </Link>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-[#71717a] font-bold">SENTIMEN:</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      activeStoryModal.sentiment === 'BULLISH'
                        ? 'bg-[#22c55e]/20 text-[#22c55e]'
                        : activeStoryModal.sentiment === 'BEARISH'
                        ? 'bg-[#ef4444]/20 text-[#ef4444]'
                        : 'bg-[#27272a] text-[#a1a1aa]'
                    }`}
                  >
                    {activeStoryModal.sentiment} (+{activeStoryModal.sentimentScore}%)
                  </span>
                </div>
              </div>

              {/* Takeaways Box */}
              {activeStoryModal.takeaways && activeStoryModal.takeaways.length > 0 && (
                <div className="bg-[#15151a] border border-[#27272a] p-3 rounded space-y-2">
                  <span className="text-[10px] font-bold text-[#f59e0b] tracking-wider uppercase block">
                    KEY TAKEAWAYS / POIN-POIN UTAMA (BLOOMBERG BRIEF):
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#d4d4d8] font-sans">
                    {activeStoryModal.takeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#f59e0b] mt-0.5 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full News Paragraphs */}
              <div className="space-y-2.5 text-xs text-[#d4d4d8] leading-relaxed font-sans pt-1">
                {activeStoryModal.body?.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Market Impact Analysis */}
              {activeStoryModal.marketImpact && (
                <div className="bg-[#121216] border-l-2 border-[#22c55e] p-2.5 rounded text-xs text-[#a1a1aa] font-sans">
                  <strong className="text-white">Dampak Pasar (Market Impact):</strong>{' '}
                  {activeStoryModal.marketImpact}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#27272a] pt-3 flex items-center justify-between text-[11px]">
              <span className="text-[#71717a]">Sumber: {activeStoryModal.source} • Verified Accurate</span>
              <button
                type="button"
                onClick={() => setActiveStoryModal(null)}
                className="px-4 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded transition-colors cursor-pointer font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
