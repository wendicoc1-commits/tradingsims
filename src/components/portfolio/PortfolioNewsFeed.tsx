'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Calendar,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  Bookmark,
  ShieldCheck,
  Building2,
  X,
  Radio,
  FileText,
  AlertCircle
} from 'lucide-react';
import { usePortfolioStore, useWatchlistStore } from '@/store';
import { getStockNewsTimeline, getMyStocksNews, DisplayArticle } from '@/lib/stockNewsService';
import CompanyLogo from '@/components/common/CompanyLogo';
import { useHourlyNews } from '@/hooks/useHourlyNews';
import HourlyUpdateStatusBar from '@/components/news/HourlyUpdateStatusBar';

export default function PortfolioNewsFeed() {
  const { holdings } = usePortfolioStore();
  const { watchlists } = useWatchlistStore();

  const [selectedStock, setSelectedStock] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'ARCHIVE'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<DisplayArticle | null>(null);

  // Extract unique stock tickers from holdings and watchlists
  const holdingTickers = useMemo(() => {
    return Array.from(new Set(holdings.map((h) => (h.displaySymbol || h.symbol).replace('.JK', '').toUpperCase())));
  }, [holdings]);

  const watchlistTickers = useMemo(() => {
    const list: string[] = [];
    watchlists.forEach((w) => {
      w.items.forEach((item) => {
        list.push((item.displaySymbol || item.symbol).replace('.JK', '').toUpperCase());
      });
    });
    return Array.from(new Set(list));
  }, [watchlists]);

  // Combine and sort unique tickers
  const allUserTickers = useMemo(() => {
    return Array.from(new Set([...holdingTickers, ...watchlistTickers])).sort();
  }, [holdingTickers, watchlistTickers]);

  const hourlyState = useHourlyNews();

  // Fetch articles based on selected stock or all user stocks + merge hourly live stories
  const allArticles = useMemo(() => {
    const base =
      selectedStock !== 'ALL'
        ? getStockNewsTimeline(selectedStock)
        : getMyStocksNews(holdingTickers, watchlistTickers);

    const userSet = new Set(
      selectedStock !== 'ALL' ? [selectedStock.toUpperCase()] : allUserTickers.map((t) => t.toUpperCase())
    );

    const seen = new Set(base.map((b) => b.id));
    const merged = [...base];

    hourlyState.articles.forEach((art) => {
      const artTickers = [art.ticker, ...(art.tickers || [])].map((t) => t.toUpperCase());
      const matches = artTickers.some((t) => userSet.has(t));
      if (matches && !seen.has(art.id)) {
        seen.add(art.id);
        merged.unshift(art);
      }
    });

    return merged;
  }, [selectedStock, holdingTickers, watchlistTickers, allUserTickers, hourlyState.articles]);

  // Filter articles based on period, category, and search query
  const filteredArticles = useMemo(() => {
    return allArticles.filter((art) => {
      // Period filter
      if (selectedPeriod !== 'ALL' && art.period !== selectedPeriod) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL' && art.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = art.title.toLowerCase().includes(q);
        const inSummary = art.summary.toLowerCase().includes(q);
        const inTicker = art.ticker.toLowerCase().includes(q) || art.tickers.some((t) => t.toLowerCase().includes(q));
        const inTakeaways = art.takeaways.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inSummary && !inTicker && !inTakeaways) {
          return false;
        }
      }
      return true;
    });
  }, [allArticles, selectedPeriod, selectedCategory, searchQuery]);

  return (
    <div className="space-y-4 font-mono">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border bg-[#09090b] border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#f59e0b]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              News Desk & Historical Timeline Saham Saya
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
              {allUserTickers.length} Emiten Terpantau
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Arsip berita berkala, keterbukaan informasi BEI, SEC EDGAR, dan rilis dividen historis untuk seluruh saham di portofolio & watchlist Anda.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berita atau isu..."
            className="w-full bg-[#18181b] border border-[#27272a] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#71717a] outline-none focus:border-[#f59e0b]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Hourly Auto-Sync Status Bar (1-Hour Frequency) */}
      <HourlyUpdateStatusBar hourlyState={hourlyState} />

      {/* Ticker Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setSelectedStock('ALL')}
          className={`px-3 py-1.5 rounded text-xs font-bold shrink-0 transition-colors cursor-pointer ${
            selectedStock === 'ALL'
              ? 'bg-[#f59e0b] text-black shadow-sm'
              : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
          }`}
        >
          ⭐ SEMUA SAHAM SAYA ({allUserTickers.length})
        </button>

        {allUserTickers.map((ticker) => {
          const isHolding = holdingTickers.includes(ticker);
          const isSelected = selectedStock === ticker;
          return (
            <button
              key={ticker}
              onClick={() => setSelectedStock(ticker)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold shrink-0 transition-colors cursor-pointer border ${
                isSelected
                  ? 'bg-[#f59e0b] text-black border-[#f59e0b]'
                  : 'bg-[#18181b] text-[#d4d4d8] border-[#27272a] hover:border-[#f59e0b]/50'
              }`}
            >
              <CompanyLogo symbol={ticker} size={16} rounded="sm" border={false} />
              <span>{ticker}</span>
              {isHolding && (
                <span
                  className={`text-[9px] px-1 rounded ${
                    isSelected ? 'bg-black/20 text-black font-extrabold' : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                  title="Posisi saham aktif di portofolio"
                >
                  HOLD
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Tabs: Period & Category */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#27272a]">
        {/* Period Filter */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-[11px] text-[#71717a] mr-1 hidden sm:inline">Periode:</span>
          {(
            [
              { id: 'ALL', label: 'Semua Waktu' },
              { id: 'TODAY', label: '⚡ Hari Ini' },
              { id: 'WEEK', label: 'Minggu Ini' },
              { id: 'MONTH', label: 'Bulan Ini' },
              { id: 'ARCHIVE', label: '📅 Arsip Sebelumnya' },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p.id)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                selectedPeriod === p.id
                  ? 'bg-[#27272a] text-[#f59e0b] border border-[#f59e0b]/50'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-[11px] text-[#71717a] mr-1 hidden sm:inline">Topik:</span>
          {[
            { id: 'ALL', label: 'Semua Kategori' },
            { id: 'Earnings & Dividen', label: '💰 Laba & Dividen' },
            { id: 'Keterbukaan Regulasi', label: '🏛️ Regulasi & RUPS' },
            { id: 'Korporasi & M&A', label: '🤝 Korporasi & CapEx' },
            { id: 'Tech & AI', label: '🤖 Tech & AI' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/40'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Article Feed Cards */}
      {filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-[#27272a] rounded-lg bg-[#09090b] text-[#71717a]">
          <FileText className="w-10 h-10 mb-2 opacity-30" />
          <div className="text-sm font-bold text-gray-300">Tidak Ada Berita yang Cocok</div>
          <div className="text-xs max-w-sm mt-1">
            Coba ubah filter periode atau kata kunci pencarian untuk melihat arsip keterbukaan informasi lainnya.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredArticles.map((art) => {
            const isBullish = art.sentiment === 'BULLISH';
            const isBearish = art.sentiment === 'BEARISH';
            return (
              <div
                key={art.id}
                onClick={() => setActiveArticle(art)}
                className="group p-4 rounded-lg border bg-[#0c0c0e] hover:bg-[#121216] border-[#27272a] hover:border-[#f59e0b]/50 transition-all cursor-pointer space-y-2.5 shadow-sm"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                  <div className="flex items-center gap-2">
                    <CompanyLogo symbol={art.ticker} size={22} rounded="md" />
                    <span className="font-bold text-white text-xs px-1.5 py-0.5 rounded bg-[#18181b] border border-[#27272a]">
                      {art.flag} {art.ticker}
                    </span>
                    <span className="text-[11px] text-[#71717a] font-mono">{art.wireCode}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded font-bold bg-[#27272a] text-[#a1a1aa]">
                      {art.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isBullish
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : isBearish
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {art.sentiment} ({art.sentimentScore > 0 ? `+${art.sentimentScore}` : art.sentimentScore})
                    </span>
                    <span className="text-[11px] text-[#71717a] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {art.relativeTime}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-[#f4f4f5] group-hover:text-[#f59e0b] transition-colors leading-snug">
                  {art.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-[#a1a1aa] line-clamp-2 leading-relaxed">
                  {art.summary}
                </p>

                {/* Key Takeaways Preview */}
                {art.takeaways && art.takeaways.length > 0 && (
                  <div className="bg-[#18181b] border border-[#27272a] rounded p-2.5 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-[#f59e0b] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Key Takeaway / Rangkuman Utama:</span>
                    </div>
                    <ul className="text-xs text-[#d4d4d8] space-y-0.5 pl-3 list-disc">
                      {art.takeaways.slice(0, 2).map((takeaway, i) => (
                        <li key={i} className="line-clamp-1">{takeaway}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer Source & Link */}
                <div className="flex items-center justify-between text-[11px] text-[#71717a] pt-1">
                  <span className="truncate max-w-[70%]">
                    Sumber: <span className="text-[#a1a1aa]">{art.source}</span> &bull; {art.byline}
                  </span>
                  <div className="flex items-center gap-1 text-[#f59e0b] group-hover:underline">
                    <span>Baca Selengkapnya</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Story Inspection Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0c0c0e] border border-[#27272a] rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#27272a] flex items-start justify-between gap-3 bg-[#09090b]">
              <div className="flex items-center gap-2.5">
                <CompanyLogo symbol={activeArticle.ticker} size={32} rounded="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a]">
                      {activeArticle.flag} {activeArticle.ticker}
                    </span>
                    <span className="text-xs text-[#f59e0b] font-mono">{activeArticle.wireCode}</span>
                    <span className="text-[10px] text-[#71717a]">&bull; {activeArticle.relativeTime}</span>
                  </div>
                  <div className="text-[11px] text-[#a1a1aa] mt-0.5">
                    {activeArticle.source} &bull; {activeArticle.byline}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono scrollbar-thin">
              <h2 className="text-base font-bold text-white leading-snug">
                {activeArticle.title}
              </h2>

              {/* Sentiment Banner */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                  activeArticle.sentiment === 'BULLISH'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : activeArticle.sentiment === 'BEARISH'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-zinc-800/50 border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="font-bold">
                    Analisis Sentimen: {activeArticle.sentiment} (Skor: {activeArticle.sentimentScore})
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/40">
                  {activeArticle.urgency}
                </span>
              </div>

              {/* Key Takeaways */}
              {activeArticle.takeaways && activeArticle.takeaways.length > 0 && (
                <div className="p-3.5 rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/5 space-y-2">
                  <div className="text-xs font-bold text-[#f59e0b] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Rangkuman Eksekutif & Poin Kunci</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#d4d4d8] pl-4 list-disc">
                    {activeArticle.takeaways.map((point, idx) => (
                      <li key={idx} className="leading-relaxed">{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Article Paragraphs */}
              <div className="space-y-2.5 text-xs text-[#a1a1aa] leading-relaxed border-t border-[#27272a] pt-3">
                <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">
                  Naskah Berita & Keterbukaan Lengkap:
                </div>
                {activeArticle.body && activeArticle.body.length > 0 ? (
                  activeArticle.body.map((para, i) => <p key={i}>{para}</p>)
                ) : (
                  <p>{activeArticle.summary}</p>
                )}
              </div>

              {/* Market Impact Box */}
              {activeArticle.marketImpact && (
                <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] space-y-1">
                  <div className="text-[11px] font-bold text-[#f59e0b] uppercase">
                    Dampak Terhadap Pasar & Valuasi:
                  </div>
                  <p className="text-xs text-[#d4d4d8]">{activeArticle.marketImpact}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-[#27272a] flex items-center justify-between bg-[#09090b]">
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/stock/${activeArticle.ticker}`}
                  className="px-3 py-1.5 rounded text-xs font-bold bg-[#f59e0b] text-black hover:bg-[#d97706] transition-colors flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Buka Terminal Saham {activeArticle.ticker}</span>
                </Link>
                <Link
                  href="/stream"
                  className="px-3 py-1.5 rounded text-xs font-semibold bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a] transition-colors"
                >
                  Buka Bloomberg Live Wire
                </Link>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-[#27272a] text-white hover:bg-[#3f3f46] transition-colors cursor-pointer"
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
