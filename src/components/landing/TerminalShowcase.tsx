'use client';

import React, { useState } from 'react';
import { Terminal, Cpu, Newspaper, ArrowRight, CheckCircle2, TrendingUp, BarChart3, Bot, Zap } from 'lucide-react';

interface ShowcaseProps {
  onEnterTerminal: (e?: React.MouseEvent) => void;
}

export default function TerminalShowcase({ onEnterTerminal }: ShowcaseProps) {
  const [activeTab, setActiveTab] = useState<'paper' | 'quant' | 'sentiment'>('paper');

  const TABS = [
    { id: 'paper', label: 'Paper Trading Simulator', icon: <Terminal className="w-4 h-4" /> },
    { id: 'quant', label: 'Quant Algorithmic Studio', icon: <Cpu className="w-4 h-4" /> },
    { id: 'sentiment', label: 'Sentiment & RAG News Feed', icon: <Newspaper className="w-4 h-4" /> },
  ];

  return (
    <section id="showcase" className="relative z-10 py-20 bg-[#06080e]/90 border-t border-white/[0.08] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <span>[TERMINAL IN ACTION]</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase font-sans">
            Three Specialized Trading Desks
          </h2>
          <p className="mt-4 text-base text-zinc-400 font-normal leading-relaxed">
            Switch effortlessly between manual order execution, automated algorithmic logic, and real-time AI sentiment analysis.
          </p>

          {/* Tab Selector Pills */}
          <div className="mt-8 flex items-center justify-center gap-2 flex-wrap font-mono text-xs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-105'
                    : 'bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display Area */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[#090c14] border border-white/10 shadow-2xl overflow-hidden">
          {activeTab === 'paper' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                  DESK 01 • EXECUTION SIMULATOR
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Realistic Blotter &amp; Zero Risk Fill
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Practice high-stake trading psychology with Rp 50,000,000 virtual cash. Accurate tick-by-tick market matching, ARA/ARB thresholds, and instant liquidity execution.
                </p>

                <div className="space-y-2.5 pt-2">
                  {[
                    'Instant virtual balance top up via simulated dynamic QRIS',
                    'Direct broker summary & foreign net buy/sell accumulation radar',
                    'Multi-timeframe charting with TradingView-caliber indicators',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={onEnterTerminal}
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs font-mono flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <span>Launch Paper Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 p-5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-white/10 text-zinc-400 text-[11px]">
                  <span>VIRTUAL RDN PORTFOLIO TELEMETRY</span>
                  <span className="text-emerald-400 font-bold">PRO ACCOUNT</span>
                </div>
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-500">TOTAL PORTFOLIO NAV</span>
                    <div className="text-lg font-bold text-white mt-0.5">Rp 53.420.000</div>
                    <span className="text-[10px] text-emerald-400 font-bold block mt-1">+Rp 3.420.000 (+6.84%)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-500">CASH RESERVES</span>
                    <div className="text-lg font-bold text-amber-400 mt-0.5">Rp 22.500.000</div>
                    <span className="text-[10px] text-zinc-400 block mt-1">42.1% Liquidity Buffer</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center justify-between">
                  <span>Simulated Commission Fee: 0.00%</span>
                  <span className="font-bold">SAVED: Rp 150.000</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quant' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                  DESK 02 • ALGORITHMIC STUDIO
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Backtesting &amp; Autonomous Agents
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Design, backtest, and automate trading algorithms. Our three AI autonomous PMs (Raditya, Kevin Zhang, and Bambang CRO) execute risk rules in real-time.
                </p>

                <div className="space-y-2.5 pt-2">
                  {[
                    'Autonomous portfolio rebalancing and trailing-stop enforcement',
                    'Sharpe, Sortino, and Maximum Drawdown automated metrics',
                    'Real-time webhook and Telegram alert dispatch integration',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={onEnterTerminal}
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs font-mono flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    <span>Open Quant Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 p-5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-white/10 text-zinc-400 text-[11px]">
                  <span>AI AGENT PORTFOLIO TELEMETRY</span>
                  <span className="text-cyan-400 font-bold">RADITYA &amp; BAMBANG ACTIVE</span>
                </div>
                <div className="grid grid-cols-3 gap-2 my-4 text-center">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-500 block">TOTAL TRADES</span>
                    <span className="text-base font-bold text-white mt-1 block">48 Trades</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-500 block">WIN RATE</span>
                    <span className="text-base font-bold text-emerald-400 mt-1 block">78.2%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-zinc-500 block">PROFIT FACTOR</span>
                    <span className="text-base font-bold text-cyan-400 mt-1 block">2.65</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px]">
                  <span>⚡ Latest Action: Trailing SL adjusted to Rp 10.350 on BBCA (+0.95%)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sentiment' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
                  DESK 03 • MARKET INTELLIGENCE
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Sentiment &amp; RAG News Crawlers
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Synthesize real-time financial breaking news, corporate actions, and dividend distributions with contextual AI Retrieval-Augmented Generation.
                </p>

                <div className="space-y-2.5 pt-2">
                  {[
                    'Hourly news extraction from Bisnis, Kontan, CNBC & Bloomberg',
                    'Sentiment classification (Bullish, Bearish, Neutral) with confidence score',
                    'Automatic cashtags linking news to specific orderbook symbols',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={onEnterTerminal}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs font-mono flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <span>View Live News Feed</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 p-5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-white/10 text-zinc-400 text-[11px]">
                  <span>LIVE INTELLIGENCE STREAM</span>
                  <span className="text-amber-400 font-bold">HOURLY RAG PIPELINE</span>
                </div>
                <div className="space-y-2.5 my-4">
                  {[
                    { sym: 'BBCA', sentiment: 'BULLISH', score: '+88%', headline: 'Laba Bersih Q3 Naik 12.8% YoY, Kredit Korporasi Tumbuh Kuat' },
                    { sym: 'NVDA', sentiment: 'BULLISH', score: '+92%', headline: 'Blackwell GPU Demand Exceeds Supply Across Cloud Hyperscalers' },
                    { sym: 'TLKM', sentiment: 'NEUTRAL', score: '0%', headline: 'Fokus Perluasan Jaringan Fiber Optic di Wilayah Indonesia Timur' },
                  ].map((item, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-start gap-3">
                      <span className="font-bold text-white">{item.sym}</span>
                      <div className="flex-1">
                        <p className="text-zinc-300 text-[11px] leading-snug">{item.headline}</p>
                        <span className="text-[10px] text-emerald-400 font-bold mt-1 inline-block">
                          {item.sentiment} ({item.score})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
