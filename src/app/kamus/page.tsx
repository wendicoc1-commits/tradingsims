'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Search, ArrowRight, Zap, TrendingUp, HelpCircle } from 'lucide-react';
import { KAMUS_TERMS } from '@/data/kamus_finansial_data';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

export default function KamusIndexPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Valuasi & Fundamental', 'Teknikal & Orderbook', 'Aksi Korporasi', 'Bandarmologi'];

  const filtered = useMemo(() => {
    return KAMUS_TERMS.filter((item) => {
      const matchCat = activeCategory === 'ALL' || item.category === activeCategory;
      const matchSearch =
        item.term.toLowerCase().includes(search.toLowerCase()) ||
        item.shortDefinition.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-[#06080E] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded bg-amber-500 text-black font-black text-xs flex items-center justify-center font-mono">
              ⚡
            </div>
            <span className="font-bold text-sm tracking-tight text-white font-mono">
              TRADESIM<span className="text-amber-400">.OS</span> <span className="text-zinc-500 text-xs font-normal">/ kamus</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ShareWebsiteButton />
            <Link
              href="/terminal"
              className="text-xs font-bold px-3 py-1.5 rounded bg-emerald-500 text-black hover:bg-emerald-400 transition-colors flex items-center gap-1 font-mono shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              <span>Buka Terminal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kamus Pasar Modal A-Z</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Kamus Istilah Saham, Valuasi &amp; Bandarmologi
          </h1>
          <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
            Daftar lengkap istilah penting pasar saham Indonesia (BEI / IDX) dan aset kripto global. Temukan definisi resmi, rumus matematis, contoh kasus nyata, dan cara mempraktikkannya di simulator.
          </p>
          <EeatComplianceBadge reviewedDate="16 Oktober 2026" reviewerName="TradeSim Pro Quantitative Desk" />
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari istilah finansial (misal: PER, PBV, Dividen, ARA, ARB, Right Issue)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#090D16] border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-mono">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-[#090D16] border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Terms Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <Link
              key={item.slug}
              href={`/kamus/${item.slug}`}
              className="p-5 rounded-2xl bg-[#090D16] border border-zinc-800 hover:border-emerald-500/40 transition-colors group block space-y-2.5"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-bold">
                  {item.category}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <h2 className="font-bold text-base text-white group-hover:text-emerald-300 font-mono">
                {item.term}
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-2">
                {item.shortDefinition}
              </p>
              {item.formula && (
                <div className="text-[11px] font-mono text-amber-300/80 pt-1 border-t border-zinc-850 truncate">
                  📐 {item.formula}
                </div>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
