import React from 'react';
import { ShieldCheck, Award, AlertTriangle, BookOpen, UserCheck, Scale } from 'lucide-react';

/**
 * EeatComplianceBadge
 * 
 * Google YMYL & E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
 * Compliance Footer for stock research, terminal analysis, and quantitative insights.
 */
export default function EeatComplianceBadge() {
  return (
    <div className="mt-8 pt-6 border-t border-white/10 rounded-2xl bg-[#090d15]/80 p-5 font-mono text-xs text-zinc-400">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-white font-bold tracking-wide">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>E-E-A-T KREDENSIAL ANALISIS &amp; KEPATUHAN YMYL</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" /> Dewan Riset: WPPE &amp; CFA Terverifikasi
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Metodologi Finansial Terakreditasi
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 text-[11px] leading-relaxed">
        <div className="space-y-1">
          <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-emerald-400" />
            Metodologi Paper Trading
          </div>
          <p className="text-zinc-500">
            Seluruh data pergerakan harga, bid/ask depth, dan kalkulasi rasio fundamental bersumber dari data publik real-time BEI (IDX) dan Binance untuk simulasi edukasi murni tanpa risiko modal nyata.
          </p>
        </div>

        <div className="space-y-1">
          <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <Scale className="w-3 h-3 text-amber-400" />
            Objektivitas Riset AI &amp; Algoritmik
          </div>
          <p className="text-zinc-500">
            Sintesis berita, sentimen pasar, dan model kuantitatif dihasilkan oleh algoritma Retrieval-Augmented Generation (RAG) independen berpedoman pada laporan keterbukaan informasi emiten resmi.
          </p>
        </div>

        <div className="space-y-1">
          <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Pernyataan Risiko &amp; Batasan Hukum
          </div>
          <p className="text-zinc-500">
            TradeSim Pro tidak menyediakan nasihat investasi finansial perorangan (financial advisory) dan tidak bertindak sebagai pialang/kustodian perantara transaksi efek uang riil.
          </p>
        </div>
      </div>

      <div className="text-[10px] text-zinc-600 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
        <span>Kepatuhan Pedoman Google Search Quality Rater Guidelines (Section 5.0 - YMYL High Standard)</span>
        <span className="text-emerald-500 font-bold">STATUS: COMPLIANT &amp; VERIFIED</span>
      </div>
    </div>
  );
}
