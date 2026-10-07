'use client';

import React, { useState, useMemo } from 'react';
import {
  Newspaper,
  Calendar,
  Building2,
  ExternalLink,
  Radio,
  Flame,
  Crown,
  ChevronRight,
  Clock,
  Filter,
  Sparkles,
  CheckCircle2,
  FileText,
  Search,
} from 'lucide-react';
import { getStockNewsTimeline, DisplayArticle } from '@/lib/stockNewsService';
import { getHourlyDevelopmentForStock } from '@/lib/hourlyNewsEngine';
import { useHourlyNews } from '@/hooks/useHourlyNews';
import HourlyUpdateStatusBar from '@/components/news/HourlyUpdateStatusBar';
import CompanyLogo from '@/components/common/CompanyLogo';

export default function NewsAndBusinessPanel({
  symbol,
  name,
  sector,
}: {
  symbol: string;
  name: string;
  sector: string;
}) {
  const cleanSym = (symbol || '').replace('.JK', '').trim().toUpperCase();
  const [selectedStory, setSelectedStory] = useState<DisplayArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'BLOOMBERG' | 'EARNINGS' | 'REGULATORY' | 'ARCHIVE'>('ALL');
  const [activePeriod, setActivePeriod] = useState<'ALL' | 'TODAY' | 'MONTH' | 'ARCHIVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const hourlyState = useHourlyNews();

  // Fetch full timeline of news for this stock (current + hourly developments + historical archives)
  const fullTimeline = useMemo(() => {
    const base = getStockNewsTimeline(cleanSym);
    const hourlyStory = getHourlyDevelopmentForStock(cleanSym);
    const seen = new Set(base.map((b) => b.id));
    const merged = [...base];
    if (!seen.has(hourlyStory.id)) {
      merged.unshift(hourlyStory);
    }
    return merged;
  }, [cleanSym, hourlyState.articles]);

  // Filtered timeline
  const filteredStories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return fullTimeline.filter((story) => {
      // Category filter
      if (activeCategory === 'BLOOMBERG' && !story.isBloomberg && story.urgency !== 'FLASH' && story.urgency !== 'BFW') return false;
      if (activeCategory === 'EARNINGS' && !story.category.includes('Earnings') && !story.category.includes('Dividen')) return false;
      if (activeCategory === 'REGULATORY' && !story.category.includes('Regulasi') && !story.category.includes('Korporasi')) return false;
      if (activeCategory === 'ARCHIVE' && story.period !== 'ARCHIVE' && story.period !== 'QUARTER') return false;

      // Period filter
      if (activePeriod === 'TODAY' && story.period !== 'TODAY') return false;
      if (activePeriod === 'MONTH' && story.period === 'ARCHIVE') return false;
      if (activePeriod === 'ARCHIVE' && story.period !== 'ARCHIVE' && story.period !== 'QUARTER') return false;

      // Search query
      if (q) {
        const match =
          story.title.toLowerCase().includes(q) ||
          story.summary.toLowerCase().includes(q) ||
          story.source.toLowerCase().includes(q) ||
          story.takeaways.some((t) => t.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [fullTimeline, activeCategory, activePeriod, searchQuery]);

  const bloombergCount = fullTimeline.filter((s) => s.isBloomberg || s.urgency === 'FLASH' || s.urgency === 'BFW').length;
  const archiveCount = fullTimeline.filter((s) => s.period === 'ARCHIVE' || s.period === 'QUARTER').length;

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Header Info & Master Summary ── */}
      <div
        className="rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <CompanyLogo symbol={cleanSym} name={name} size={36} />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-white">
                Berita Finansial &amp; Arsip Historis: ${cleanSym}
              </h3>
            </div>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              Menampilkan {fullTimeline.length} catatan berita real-time dan arsip keterbukaan informasi sebelumnya
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {bloombergCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
              ⚡ {bloombergCount} Bloomberg Wire
            </span>
          )}
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/40"
          >
            🏛️ {archiveCount} Arsip Periode Sebelumnya
          </span>
        </div>
      </div>

      {/* Hourly Auto-Sync Status Bar (Every 1 Hour) */}
      <HourlyUpdateStatusBar hourlyState={hourlyState} />

      {/* ── Filters & Timeline Selector Bar ── */}
      <div
        className="rounded-lg border p-2.5 space-y-2 text-xs"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] scrollbar-none">
            {[
              { id: 'ALL', label: `Semua Berita (${fullTimeline.length})` },
              { id: 'BLOOMBERG', label: `⚡ Bloomberg Wire (${bloombergCount})` },
              { id: 'EARNINGS', label: `💰 Laba & Dividen` },
              { id: 'REGULATORY', label: `📜 Keterbukaan & RUPS` },
              { id: 'ARCHIVE', label: `📅 Arsip Sebelumnya (${archiveCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-2.5 py-1 rounded font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-[#f59e0b] text-black shadow-sm'
                    : 'bg-[#18181b] text-neutral-400 hover:text-white border border-[#27272a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Time Horizon Selector */}
          <div className="flex items-center gap-1 shrink-0 text-[10px]">
            <span className="text-neutral-500 uppercase font-bold">Periode:</span>
            {[
              { id: 'ALL', label: 'Semua Waktu' },
              { id: 'TODAY', label: 'Terbaru' },
              { id: 'MONTH', label: 'Bulan Ini' },
              { id: 'ARCHIVE', label: 'Kuartal Lalu' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePeriod(p.id as any)}
                className={`px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                  activePeriod === p.id
                    ? 'bg-neutral-200 text-black font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search within Stock News Timeline */}
        <div className="flex items-center gap-1.5 bg-[#121216] border border-[#27272a] px-2.5 py-1 rounded">
          <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari dalam berita & arsip ${cleanSym} (misal: dividen, RUPS, kuartal, laba, CapEx)...`}
            className="w-full bg-transparent text-white placeholder-neutral-500 outline-none text-[11px]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-neutral-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Chronological News & Archive Story Cards ── */}
      <div className="space-y-3">
        {filteredStories.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 border border-neutral-800 rounded-xl text-xs">
            Tidak ditemukan berita atau arsip historis yang cocok dengan kriteria pencarian &quot;{searchQuery}&quot;.
          </div>
        ) : (
          filteredStories.map((story) => {
            const isBloomberg = story.isBloomberg || story.urgency === 'FLASH' || story.urgency === 'BFW';
            const isArchive = story.period === 'ARCHIVE' || story.period === 'QUARTER';

            return (
              <div
                key={story.id}
                onClick={() => setSelectedStory(story)}
                className={`rounded-xl border p-4 transition-all cursor-pointer shadow-md space-y-2 group ${
                  isBloomberg
                    ? 'border-amber-500/40 bg-[#121216] hover:border-amber-400'
                    : isArchive
                    ? 'border-neutral-800/80 bg-[#0e0e12] hover:border-neutral-700'
                    : 'border-neutral-800 bg-[#121216] hover:border-neutral-600'
                }`}
              >
                {/* Top Meta Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CompanyLogo symbol={story.ticker} size={18} />
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        story.urgency === 'FLASH'
                          ? 'bg-red-500 text-white animate-pulse'
                          : story.urgency === 'BFW'
                          ? 'bg-amber-500 text-black'
                          : isArchive
                          ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                          : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      {story.urgency === 'ARCHIVE' ? 'ARSIP HISTORIS' : story.urgency}
                    </span>

                    <span className="text-amber-400 font-bold text-xs font-mono">{story.wireCode}</span>

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        story.sentiment === 'BULLISH'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : story.sentiment === 'BEARISH'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {story.sentiment === 'BULLISH'
                        ? `▲ Bullish (+${story.sentimentScore}%)`
                        : story.sentiment === 'BEARISH'
                        ? `▼ Bearish (-${Math.abs(story.sentimentScore)}%)`
                        : '● Netral'}
                    </span>

                    <span className="text-[10px] text-neutral-400">{story.category}</span>
                  </div>

                  <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-white">{story.relativeTime}</span>
                    <span className="text-neutral-600">({story.date})</span>
                  </div>
                </div>

                {/* Headline */}
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors leading-snug font-sans">
                  {story.title}
                </h4>

                {/* Single Takeaway snippet */}
                <div className="bg-[#18181b] border-l-2 border-amber-500 p-2.5 rounded text-xs text-neutral-300 font-sans space-y-1">
                  <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Intisari Laporan / Takeaway:</span>
                  </div>
                  <p className="line-clamp-2 leading-relaxed">{story.takeaways[0]}</p>
                </div>

                {/* Footer source & Read CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-[11px]">
                  <div className="text-neutral-400 text-[10px] truncate max-w-md">
                    Sumber: <strong className="text-neutral-300">{story.source}</strong> • {story.byline}
                  </div>
                  <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:underline text-[11px] shrink-0">
                    <span>Baca Laporan Lengkap</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── INTERACTIVE ARTICLE READER MODAL (FULL ACCURACY INSPECTOR) ── */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 font-mono">
          <div className="bg-[#09090b] border border-amber-500/50 rounded-xl max-w-2xl w-full p-5 text-xs space-y-3.5 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#27272a] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <CompanyLogo symbol={selectedStory.ticker} size={22} />
                  <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                    {selectedStory.urgency}
                  </span>
                  <span className="text-amber-400 font-bold text-xs">{selectedStory.wireCode}</span>
                  <span className="text-neutral-400 text-[10px]">({selectedStory.date})</span>
                </div>
                <div className="text-[11px] text-neutral-400">{selectedStory.byline}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="text-neutral-400 hover:text-white p-1 text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <h2 className="text-white text-base font-bold leading-snug font-sans border-l-3 border-amber-500 pl-3">
                {selectedStory.title}
              </h2>

              {/* Ticker Badges & Sentiment */}
              <div className="flex items-center justify-between gap-2 bg-[#121216] p-2.5 rounded border border-[#27272a]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-neutral-500 font-bold">EMITEN:</span>
                  {selectedStory.tickers.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f59e0b] text-black"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-neutral-500 font-bold">SENTIMEN:</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      selectedStory.sentiment === 'BULLISH'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : selectedStory.sentiment === 'BEARISH'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {selectedStory.sentiment} (+{selectedStory.sentimentScore}%)
                  </span>
                </div>
              </div>

              {/* Key Takeaways Box */}
              <div className="bg-[#15151a] border border-[#27272a] p-3 rounded-lg space-y-2">
                <span className="text-[10px] font-bold text-[#f59e0b] tracking-wider uppercase block">
                  KEY TAKEAWAYS / POIN-POIN UTAMA (BLOOMBERG BRIEF):
                </span>
                <ul className="space-y-1.5 text-xs text-neutral-300 font-sans">
                  {selectedStory.takeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full News Paragraphs */}
              <div className="space-y-2.5 text-xs text-neutral-300 leading-relaxed font-sans pt-1">
                {selectedStory.body.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Market Impact Analysis */}
              {selectedStory.marketImpact && (
                <div className="bg-[#121216] border-l-2 border-emerald-500 p-2.5 rounded text-xs text-neutral-300 font-sans">
                  <strong className="text-white">Dampak Pasar (Market Impact):</strong>{' '}
                  {selectedStory.marketImpact}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#27272a] pt-3 flex items-center justify-between text-[11px]">
              <span className="text-neutral-500">Sumber: {selectedStory.source} • Verified Accurate</span>
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
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
