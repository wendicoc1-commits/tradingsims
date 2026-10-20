'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Target, TrendingUp, TrendingDown, ArrowUpRight, ShieldCheck, Scale, Calculator, GitCompare } from 'lucide-react';
import type { StockQuote } from '@/types';
import { STOCK_DUELS } from '@/data/seo_programmatic_universe';

interface DailyPivotPointsPanelProps {
  symbol: string;
  name: string;
  quote?: StockQuote | null;
}

export default function DailyPivotPointsPanel({
  symbol,
  name,
  quote,
}: DailyPivotPointsPanelProps) {
  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const pivots = useMemo(() => {
    const currentPrice = quote?.price || 1000;
    // Gunakan high/low hari ini jika ada, atau estimasi volatilitas 1.8%
    const high = quote?.high || Math.round(currentPrice * 1.018);
    const low = quote?.low || Math.round(currentPrice * 0.982);
    const close = quote?.previousClose || currentPrice;

    const p = Math.round((high + low + close) / 3);
    const r1 = Math.round(2 * p - low);
    const s1 = Math.round(2 * p - high);
    const r2 = Math.round(p + (high - low));
    const s2 = Math.round(p - (high - low));
    const r3 = Math.round(high + 2 * (p - low));
    const s3 = Math.round(low - 2 * (high - p));

    const isAbovePivot = currentPrice >= p;

    return {
      p,
      r1,
      r2,
      r3,
      s1,
      s2,
      s3,
      high,
      low,
      currentPrice,
      isAbovePivot,
    };
  }, [quote]);

  // Cari duel yang relevan dengan emiten ini
  const relatedDuels = useMemo(() => {
    const sym = symbol.toUpperCase();
    return STOCK_DUELS.filter((d) => d.stockA.ticker === sym || d.stockB.ticker === sym).slice(0, 3);
  }, [symbol]);

  return (
    <div className="bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 text-zinc-200 font-sans shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-400">
              <Target className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-white font-mono">
              LEVEL PIVOT &amp; SUPPORT RESISTANCE HARIAN
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 font-mono">
            Prospek harga saham {symbol} ({name}) per {todayStr}
          </p>
        </div>
        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border shrink-0 ${
          pivots.isAbovePivot
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {pivots.isAbovePivot ? '🟢 DI ATAS PIVOT (BULLISH BIAS)' : '🔴 DI BAWAH PIVOT (BEARISH BIAS)'}
        </span>
      </div>

      {/* Grid Pivot Point Levels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center font-mono text-xs">
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-2.5">
          <span className="text-[10px] text-rose-400 font-bold block">SUPPORT 3</span>
          <span className="text-sm font-black text-white mt-0.5 block">Rp {pivots.s3.toLocaleString('id-ID')}</span>
        </div>
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-2.5">
          <span className="text-[10px] text-rose-400 font-bold block">SUPPORT 2</span>
          <span className="text-sm font-black text-white mt-0.5 block">Rp {pivots.s2.toLocaleString('id-ID')}</span>
        </div>
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-2.5">
          <span className="text-[10px] text-rose-400 font-bold block">SUPPORT 1</span>
          <span className="text-sm font-black text-white mt-0.5 block">Rp {pivots.s1.toLocaleString('id-ID')}</span>
        </div>
        <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-2.5 shadow-sm">
          <span className="text-[10px] text-amber-300 font-bold block">PIVOT POINT</span>
          <span className="text-base font-black text-amber-300 mt-0.5 block">Rp {pivots.p.toLocaleString('id-ID')}</span>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-2.5">
          <span className="text-[10px] text-emerald-400 font-bold block">RESISTANCE 1</span>
          <span className="text-sm font-black text-white mt-0.5 block">Rp {pivots.r1.toLocaleString('id-ID')}</span>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-2.5">
          <span className="text-[10px] text-emerald-400 font-bold block">RESISTANCE 2</span>
          <span className="text-sm font-black text-white mt-0.5 block">Rp {pivots.r2.toLocaleString('id-ID')}</span>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-2.5">
          <span className="text-[10px] text-emerald-400 font-bold block">RESISTANCE 3</span>
          <span className="text-sm font-black text-white mt-0.5 block">Rp {pivots.r3.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Crawlable Contextual Analysis (SEO Freshness Text) */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed space-y-1.5">
        <p>
          Berdasarkan perhitungan level pivot klasik pada perdagangan hari ini ({todayStr}), harga acuan tengah (Pivot Point) saham <b>{symbol}</b> berada di level <b>Rp {pivots.p.toLocaleString('id-ID')}</b>. 
          {pivots.isAbovePivot ? (
            <span> Dengan posisi harga saat ini (Rp {pivots.currentPrice.toLocaleString('id-ID')}) yang bertahan di atas Pivot, momentum condong positif dengan target pengujian resistance terdekat di <b>Rp {pivots.r1.toLocaleString('id-ID')}</b> hingga <b>Rp {pivots.r2.toLocaleString('id-ID')}</b>.</span>
          ) : (
            <span> Karena harga saat ini (Rp {pivots.currentPrice.toLocaleString('id-ID')}) bergerak di bawah Pivot, waspadai tekanan jual menuju area support kunci di <b>Rp {pivots.s1.toLocaleString('id-ID')}</b> dan batas pengaman <b>Rp {pivots.s2.toLocaleString('id-ID')}</b>.</span>
          )}
        </p>
      </div>

      {/* Internal Silo Linking Section */}
      <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Duel Komparasi Terkait */}
        {relatedDuels.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-zinc-500 text-[11px] flex items-center gap-1">
              <GitCompare className="w-3.5 h-3.5 text-amber-400" />
              <span>Bandingkan:</span>
            </span>
            {relatedDuels.map((duel) => (
              <Link
                key={duel.slug}
                href={`/vs/${duel.slug}`}
                className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-amber-300 hover:text-white transition-colors"
              >
                {duel.title.split(':')[0]} &rarr;
              </Link>
            ))}
          </div>
        )}

        {/* Shortcut ke Kalkulator Risiko & Dividen */}
        <div className="flex items-center gap-2">
          <Link
            href="/tools/kalkulator-risk-reward"
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold transition-all flex items-center gap-1 text-[11px]"
          >
            <Calculator className="w-3 h-3" />
            <span>Hitung Lot Aman</span>
          </Link>
          <Link
            href={`/stock/${symbol}/dividen`}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold transition-all flex items-center gap-1 text-[11px]"
          >
            <span>Jadwal Dividen {symbol}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
