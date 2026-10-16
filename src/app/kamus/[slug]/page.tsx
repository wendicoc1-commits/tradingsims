'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowLeft, ArrowRight, Zap, Calculator, HelpCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { KAMUS_TERMS } from '@/data/kamus_finansial_data';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

export default function KamusDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'price-to-earnings-ratio-per';
  const item = KAMUS_TERMS.find((t) => t.slug === slug) || KAMUS_TERMS[0];

  return (
    <div className="min-h-screen bg-[#06080E] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/kamus" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            <span className="font-bold text-sm tracking-tight text-white font-mono">
              TRADESIM<span className="text-amber-400">.OS</span> <span className="text-zinc-500 text-xs font-normal">/ kamus / {item.slug}</span>
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
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kategori: {item.category}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Apa Itu {item.term}?
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Panduan lengkap memahami pengertian {item.term}, rumus perhitungannya, dan contoh nyata dalam transaksi saham di Bursa Efek Indonesia.
          </p>
          <EeatComplianceBadge reviewedDate="16 Oktober 2026" reviewerName="TradeSim Pro Quantitative Desk" />
        </div>

        {/* Direct Answer Definition Box (Targeting Google Definition Featured Snippet) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#090D16] border border-emerald-500/30 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Definisi Ringkas ({item.term})</span>
          </div>
          <p className="text-base sm:text-lg text-white font-medium leading-relaxed font-sans">
            {item.shortDefinition}
          </p>
        </div>

        {/* Full Explanation */}
        <div className="p-6 rounded-2xl bg-[#090D16] border border-zinc-800 space-y-4">
          <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Penjelasan Mendalam &amp; Fungsi Finansial</span>
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed font-sans">
            {item.fullExplanation}
          </p>

          {/* Formula Box if available */}
          {item.formula && (
            <div className="p-4 rounded-xl bg-black/60 border border-amber-500/30 space-y-1.5 font-mono">
              <span className="text-[11px] text-amber-400 font-bold block">Rumus Matematis:</span>
              <div className="text-base font-bold text-emerald-400">{item.formula}</div>
            </div>
          )}

          {/* Case Study Example */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <span className="text-xs text-zinc-400 font-mono font-bold block">Contoh Kasus Nyata di Saham BEI:</span>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">{item.example}</p>
          </div>
        </div>

        {/* Practice in Simulator CTA */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-[#070a10] border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-sm text-white">Praktikkan Konsep Ini di Simulator</h3>
            <p className="text-xs text-zinc-400">{item.actionPrompt}</p>
          </div>
          <Link
            href="/terminal"
            className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold font-mono text-xs hover:bg-emerald-400 transition-colors shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          >
            Buka Terminal Simulator
          </Link>
        </div>

        {/* Other Related Terms */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <h2 className="text-base font-bold text-white font-mono">Istilah Terkait Lainnya:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {KAMUS_TERMS.filter((t) => t.slug !== slug).slice(0, 6).map((term) => (
              <Link
                key={term.slug}
                href={`/kamus/${term.slug}`}
                className="p-3.5 rounded-xl bg-[#090D16] border border-zinc-800 hover:border-emerald-500/40 transition-colors group block"
              >
                <h3 className="font-bold text-xs text-white group-hover:text-emerald-300 font-mono truncate">{term.term}</h3>
                <span className="text-[10px] text-zinc-500 block mt-1">{term.category}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
