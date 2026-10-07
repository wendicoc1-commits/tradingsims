'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Newspaper,
  Target,
  ArrowUpRight,
  Flame,
  ShieldCheck,
  Activity
} from 'lucide-react';

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface SentimentData {
  symbol: string;
  overallScore: number; // -100 to +100
  sentimentLabel: 'VERY_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'VERY_BEARISH';
  totalMentions24H: number;
  mentionSpikePercent: number;
  sources: {
    reddit: {
      bullishPercent: number;
      volume: string;
      topSubreddits: string[];
      trendingSample: string;
    };
    xFinTwit: {
      bullishPercent: number;
      volume: string;
      topKeyword: string;
      trendingSample: string;
    };
    newsMedia: {
      bullishPercent: number;
      volume: string;
      tone: string;
      trendingSample: string;
    };
    polymarket: {
      question: string;
      probabilityYes: number;
      volumeUsd: string;
    };
  };
}

export default function SocialSentimentInsightDesk({ symbol = 'AAPL' }: { symbol?: string }) {
  const sym = symbol.toUpperCase().trim();

  // Synthetic real-time sentiment engine
  const getSentimentData = (ticker: string): SentimentData => {
    if (ticker === 'NVDA') {
      return {
        symbol: 'NVDA',
        overallScore: 88,
        sentimentLabel: 'VERY_BULLISH',
        totalMentions24H: 48920,
        mentionSpikePercent: 142.5,
        sources: {
          reddit: {
            bullishPercent: 86,
            volume: '18.4K posts/comments',
            topSubreddits: ['r/wallstreetbets', 'r/stocks', 'r/options'],
            trendingSample: 'Blackwell GPU supply sold out through 2026. Data center capex by hyper-scalers continues unabated.',
          },
          xFinTwit: {
            bullishPercent: 91,
            volume: '24.1K tweets',
            topKeyword: '#Blackwell #AIInfrastructure',
            trendingSample: 'Jensen Huang keynote affirms CUDA ecosystem moat. Sell-side price targets being raised across the board.',
          },
          newsMedia: {
            bullishPercent: 82,
            volume: '1.2K articles',
            tone: 'Strongly Positive',
            trendingSample: 'Reuters: Big tech capex guarantees sustained high-margin backlog for Nvidia AI accelerators.',
          },
          polymarket: {
            question: 'Will NVDA reach $150 before end of Q4 2026?',
            probabilityYes: 78,
            volumeUsd: '$4.2M',
          },
        },
      };
    }

    if (ticker === 'BBCA') {
      return {
        symbol: 'BBCA',
        overallScore: 82,
        sentimentLabel: 'VERY_BULLISH',
        totalMentions24H: 12450,
        mentionSpikePercent: 38.0,
        sources: {
          reddit: {
            bullishPercent: 78,
            volume: '1.2K discussions',
            topSubreddits: ['r/indonesia', 'r/finansial'],
            trendingSample: 'Saham defensif terbaik di IHSG. Dividen stabil, CASA 82% membuat BCA tetap raja di tengah fluktuasi suku bunga.',
          },
          xFinTwit: {
            bullishPercent: 84,
            volume: '6.8K tweets',
            topKeyword: '#SahamBBCA #IHSG',
            trendingSample: 'Foreign inflow konsisten masuk ke BBCA. NPL LAR di rekor terendah industri.',
          },
          newsMedia: {
            bullishPercent: 80,
            volume: '420 articles',
            tone: 'Consistently Positive',
            trendingSample: 'Kontan: BCA raih pertumbuhan kredit dobel digit dengan margin bunga bersih terjaga prima.',
          },
          polymarket: {
            question: 'Will Bank Central Asia (BBCA) hit Rp 11,500 in 2026?',
            probabilityYes: 82,
            volumeUsd: '$890K',
          },
        },
      };
    }

    // Default / AAPL
    return {
      symbol: ticker,
      overallScore: 74,
      sentimentLabel: 'BULLISH',
      totalMentions24H: 32400,
      mentionSpikePercent: 24.8,
      sources: {
        reddit: {
          bullishPercent: 72,
          volume: '12.8K posts/comments',
          topSubreddits: ['r/stocks', 'r/investing', 'r/apple'],
          trendingSample: 'Ecosystem lock-in and services revenue run-rate provide high free cash flow visibility.',
        },
        xFinTwit: {
          bullishPercent: 76,
          volume: '16.5K tweets',
          topKeyword: `#${ticker} #TechEarnings`,
          trendingSample: 'Institutional accumulation visible on dips. Upgrade cycle gaining momentum.',
        },
        newsMedia: {
          bullishPercent: 71,
          volume: '850 articles',
          tone: 'Positive',
          trendingSample: 'Bloomberg: Institutional price targets cluster around 18% upside from current levels.',
        },
        polymarket: {
          question: `Will ${ticker} outperform S&P 500 this quarter?`,
          probabilityYes: 68,
          volumeUsd: '$1.8M',
        },
      },
    };
  };

  const data = getSentimentData(sym);

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded border bg-[#09090b] border-[#27272a]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-ping" />
            <span className="text-xs font-black text-[#f59e0b] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              OPENSTOCK SENTIMENT &bull; CROSS-SOURCE SOCIAL INTELLIGENCE
            </span>
            <span className="text-[10px] text-[#71717a]">| ADANOS &amp; SOCIAL AGGREGATION</span>
          </div>
          <h2 className="text-lg font-black text-white tracking-wide">
            Sentimen Multi-Platform: Reddit, X (Twitter), Berita &amp; Polymarket ({data.symbol})
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Analisis NLP real-time menyatukan percakapan media sosial ritel, komunitas institusi, dan pasar prediksi terdesentralisasi.
          </p>
        </div>

        {/* Global Gauge Score */}
        <div className="flex items-center gap-3 p-2.5 rounded bg-[#18181b] border border-[#27272a] shrink-0 text-right">
          <div>
            <div className="text-[9px] text-[#71717a] uppercase font-bold">Social Sentiment Score</div>
            <div className="flex items-baseline gap-1.5 justify-end mt-0.5">
              <span className="text-2xl font-black text-[#22c55e] font-mono">+{data.overallScore}</span>
              <span className="text-xs text-[#71717a]">/ 100</span>
            </div>
          </div>
          <div className="border-l border-[#27272a] pl-3">
            <span className="px-2 py-1 rounded text-[10px] font-extrabold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 inline-block">
              {data.sentimentLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ── Sentiment KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Reddit */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a] space-y-2">
          <div className="flex items-center justify-between text-[#f97316]">
            <span className="font-bold flex items-center gap-1.5 text-xs">
              <MessageCircle className="w-4 h-4" /> Reddit Communities
            </span>
            <span className="text-[10px] text-[#71717a] font-mono">{data.sources.reddit.volume}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-lg font-black text-white">{data.sources.reddit.bullishPercent}%</span>
            <span className="text-[10px] text-[#22c55e] font-bold">BULLISH</span>
          </div>
          <div className="w-full bg-[#27272a] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#f97316] h-full" style={{ width: `${data.sources.reddit.bullishPercent}%` }} />
          </div>
          <div className="text-[10px] text-[#71717a] truncate">
            Top: {data.sources.reddit.topSubreddits.join(', ')}
          </div>
        </div>

        {/* X / Twitter */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a] space-y-2">
          <div className="flex items-center justify-between text-[#38bdf8]">
            <span className="font-bold flex items-center gap-1.5 text-xs">
              <XTwitterIcon className="w-4 h-4" /> X.com FinTwit
            </span>
            <span className="text-[10px] text-[#71717a] font-mono">{data.sources.xFinTwit.volume}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-lg font-black text-white">{data.sources.xFinTwit.bullishPercent}%</span>
            <span className="text-[10px] text-[#22c55e] font-bold">BULLISH</span>
          </div>
          <div className="w-full bg-[#27272a] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#38bdf8] h-full" style={{ width: `${data.sources.xFinTwit.bullishPercent}%` }} />
          </div>
          <div className="text-[10px] text-[#71717a] truncate">
            Kata Kunci: {data.sources.xFinTwit.topKeyword}
          </div>
        </div>

        {/* News Media */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a] space-y-2">
          <div className="flex items-center justify-between text-[#a78bfa]">
            <span className="font-bold flex items-center gap-1.5 text-xs">
              <Newspaper className="w-4 h-4" /> Global News Tone
            </span>
            <span className="text-[10px] text-[#71717a] font-mono">{data.sources.newsMedia.volume}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-lg font-black text-white">{data.sources.newsMedia.bullishPercent}%</span>
            <span className="text-[10px] text-[#22c55e] font-bold">{data.sources.newsMedia.tone}</span>
          </div>
          <div className="w-full bg-[#27272a] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#a78bfa] h-full" style={{ width: `${data.sources.newsMedia.bullishPercent}%` }} />
          </div>
          <div className="text-[10px] text-[#71717a] truncate">
            Sumber: Finnhub, Reuters, Bloomberg
          </div>
        </div>

        {/* Polymarket */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a] space-y-2">
          <div className="flex items-center justify-between text-[#f59e0b]">
            <span className="font-bold flex items-center gap-1.5 text-xs">
              <Target className="w-4 h-4" /> Polymarket Odds
            </span>
            <span className="text-[10px] text-[#71717a] font-mono">{data.sources.polymarket.volumeUsd}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-lg font-black text-white">{data.sources.polymarket.probabilityYes}%</span>
            <span className="text-[10px] text-[#22c55e] font-bold">YES ODDS</span>
          </div>
          <div className="w-full bg-[#27272a] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#f59e0b] h-full" style={{ width: `${data.sources.polymarket.probabilityYes}%` }} />
          </div>
          <div className="text-[10px] text-[#71717a] truncate">
            Prediksi Terdesentralisasi
          </div>
        </div>
      </div>

      {/* ── Trending Discussion Quotes ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a] space-y-1.5">
          <div className="text-[10px] font-bold text-[#f97316] uppercase flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" /> Sorotan Populer di Reddit
          </div>
          <p className="text-xs text-[#e4e4e7] leading-relaxed italic">
            &ldquo;{data.sources.reddit.trendingSample}&rdquo;
          </p>
        </div>

        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a] space-y-1.5">
          <div className="text-[10px] font-bold text-[#38bdf8] uppercase flex items-center gap-1.5">
            <XTwitterIcon className="w-3.5 h-3.5" /> Konsensus Komunitas FinTwit
          </div>
          <p className="text-xs text-[#e4e4e7] leading-relaxed italic">
            &ldquo;{data.sources.xFinTwit.trendingSample}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
