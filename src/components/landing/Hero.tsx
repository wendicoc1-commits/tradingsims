'use client';

import React from 'react';
import { ArrowRight, Play, Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';
import TerminalMockup from './TerminalMockup';

interface HeroProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onEnterTerminal: (e?: React.MouseEvent) => void;
  user?: any;
}

export default function Hero({ onOpenAuth, onEnterTerminal, user }: HeroProps) {
  return (
    <section className="relative z-10 pt-12 pb-16 md:pt-18 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      {/* ── Top Eyebrow Tag + Live Mini Ticker Badges ── */}
      <div className="inline-flex flex-wrap items-center justify-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#0d111a]/90 border border-white/10 text-xs font-mono mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]">
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold text-[11px] tracking-wide flex items-center gap-1">
          <Zap className="w-3 h-3 fill-black" />
          NEXT-GEN SUITE
        </span>
        <div className="flex items-center gap-3 text-[11px] text-zinc-300 font-semibold px-1">
          <span className="flex items-center gap-1">
            <span className="text-white">BTC/USD</span>
            <span className="text-emerald-400 font-bold">+3.2%</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1">
            <span className="text-white">NVDA</span>
            <span className="text-emerald-400 font-bold">+4.1%</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1">
            <span className="text-white">BBCA</span>
            <span className="text-emerald-400 font-bold">+1.8%</span>
          </span>
        </div>
      </div>

      {/* ── Main Headline with Masked Line Reveal & Refined Aesthetics ── */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.08] max-w-5xl mx-auto uppercase font-sans text-zinc-100">
        <span className="block text-xs sm:text-sm font-mono tracking-widest text-emerald-400 font-bold mb-3 uppercase">
          TRADESIM PRO • #1 TRADING SIMULATOR INDONESIA
        </span>
        <span className="block overflow-hidden pb-1">
          <span className="inline-block transition-transform duration-1000 ease-out transform translate-y-0">
            Trading Simulator <span className="font-extralight text-zinc-400">Tanpa Risiko.</span>
          </span>
        </span>
        <span className="block overflow-hidden pt-1">
          <span className="inline-block bg-gradient-to-r from-[#e2c58e] via-[#ebd9b8] to-[#10b981] bg-clip-text text-transparent font-medium drop-shadow-[0_0_35px_rgba(226,197,142,0.2)]">
            Saham BEI &amp; Crypto Real-Time
          </span>
        </span>
      </h1>

      {/* ── Subheadline with subtle breathing typography ── */}
      <p className="mt-6 text-base sm:text-lg md:text-xl text-[#9c978b] max-w-3xl mx-auto font-normal leading-relaxed">
        <strong className="text-zinc-200">TradeSim Pro</strong> adalah platform trading simulator institusional terlengkap di Indonesia. Latihan simulasi trading saham BEI (IDX) dan crypto spot 24/7 dengan data pasar real-time, modal virtual Rp 50.000.000 gratis, dan teknologi AI hedge fund workstation.
      </p>

      {/* ── CTA Button Group ── */}
      <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
        {user ? (
          <button
            type="button"
            onClick={onEnterTerminal}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm font-mono tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all group cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-black group-hover:scale-110 transition-transform" />
            <span>BUKA WORKSTATION TERMINAL</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm font-mono tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all group cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-black group-hover:scale-110 transition-transform" />
              <span>MASUK / SIGN IN UNTUK TRADING</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-white font-bold text-sm font-mono flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
              <span>Daftar Akun Gratis (Modal Rp 100 Jt)</span>
            </button>
          </>
        )}
      </div>

      {/* ── Instant Virtual Balance Callout ── */}
      <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#090d15]/90 border border-emerald-500/30 text-xs font-mono text-zinc-300">
        <span className="text-zinc-500">⚡ Starting Capital:</span>
        <span className="text-emerald-400 font-extrabold text-sm font-mono-num">
          Rp 50.000.000 / $100,000 USD
        </span>
        <span className="text-zinc-600 hidden sm:inline">•</span>
        <span className="text-zinc-400 hidden sm:inline">100% Risk-Free Simulation</span>
      </div>

      {/* ── Interactive Terminal Mockup Visual ── */}
      <div className="mt-14 max-w-5xl mx-auto">
        <TerminalMockup onEnterTerminal={onEnterTerminal} />
      </div>
    </section>
  );
}
