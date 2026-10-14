'use client';

import React, { useState } from 'react';
import { Layers, Bot, Globe2, ShieldAlert, TrendingUp, CheckCircle, Code2, ArrowUpRight } from 'lucide-react';

export default function BentoGrid() {
  const [selectedMarket, setSelectedMarket] = useState<'idx' | 'us' | 'crypto'>('idx');

  const MARKET_ASSETS = {
    idx: [
      { sym: 'BBCA', name: 'Bank Central Asia', price: '10.450', chg: '+1.45%' },
      { sym: 'BBRI', name: 'Bank Rakyat Indonesia', price: '4.980', chg: '-0.40%' },
      { sym: 'BMRI', name: 'Bank Mandiri', price: '6.850', chg: '+2.24%' },
      { sym: 'ASII', name: 'Astra International', price: '5.125', chg: '+0.98%' },
    ],
    us: [
      { sym: 'NVDA', name: 'NVIDIA Corp', price: '$124.50', chg: '+4.15%' },
      { sym: 'AAPL', name: 'Apple Inc', price: '$228.10', chg: '+1.02%' },
      { sym: 'MSFT', name: 'Microsoft Corp', price: '$442.80', chg: '+0.85%' },
      { sym: 'TSLA', name: 'Tesla Inc', price: '$254.20', chg: '+3.90%' },
    ],
    crypto: [
      { sym: 'BTC/USDT', name: 'Bitcoin', price: '$67,820', chg: '+3.12%' },
      { sym: 'ETH/USDT', name: 'Ethereum', price: '$3,540', chg: '+2.85%' },
      { sym: 'SOL/USDT', name: 'Solana', price: '$152.40', chg: '+5.60%' },
      { sym: 'BNB/USDT', name: 'Binance Coin', price: '$592.10', chg: '+1.75%' },
    ],
  };

  return (
    <section id="features" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── Section Header ── */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <span>[BENTO ARCHITECTURE]</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase font-sans">
          Engineered for Quantitative Precision
        </h2>
        <p className="mt-4 text-base text-zinc-400 font-normal leading-relaxed">
          Modular, low-latency micro-services powering your daily market edge. Explore institutional-grade order matching, backtesting, and risk mitigation.
        </p>
      </div>

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* ── Card 1: Large (8 Cols) - Real-Time Orderbook & Level 2 Depth ── */}
        <div className="md:col-span-12 lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#080b12] border border-white/10 hover:border-emerald-500/40 transition-all shadow-xl relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Layers className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                  MODULE 01 • REAL-TIME DEPTH
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Level 2 Orderbook &amp; Market Depth
                </h3>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 self-start sm:self-auto">
              FEED LATENCY: 8ms
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed">
            Unpack hidden liquidity blocks, institutional broker accumulations, and real-time bid/ask queues with realistic auto-rejection (ARA/ARB) bounds.
          </p>

          {/* Interactive Visual Orderbook Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/20">
              <div className="flex justify-between text-zinc-400 text-[11px] mb-2 font-bold">
                <span className="text-emerald-400">INSTITUTIONAL BIDS</span>
                <span>VOL (LOT)</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { price: '10.450', vol: '42,500', pct: 85 },
                  { price: '10.425', vol: '68,200', pct: 95 },
                  { price: '10.400', vol: '31,100', pct: 60 },
                  { price: '10.375', vol: '18,400', pct: 40 },
                ].map((b, i) => (
                  <div key={i} className="relative py-1 px-2 flex justify-between rounded bg-emerald-500/5">
                    <div
                      style={{ width: `${b.pct}%` }}
                      className="absolute inset-y-0 left-0 bg-emerald-500/15 rounded"
                    />
                    <span className="relative z-10 font-bold text-emerald-400">{b.price}</span>
                    <span className="relative z-10 text-zinc-300 font-mono-num">{b.vol}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/50 border border-rose-500/20">
              <div className="flex justify-between text-zinc-400 text-[11px] mb-2 font-bold">
                <span className="text-rose-400">ASK RESISTANCE</span>
                <span>VOL (LOT)</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { price: '10.475', vol: '12,800', pct: 30 },
                  { price: '10.500', vol: '54,600', pct: 88 },
                  { price: '10.525', vol: '29,400', pct: 55 },
                  { price: '10.550', vol: '16,200', pct: 35 },
                ].map((a, i) => (
                  <div key={i} className="relative py-1 px-2 flex justify-between rounded bg-rose-500/5">
                    <div
                      style={{ width: `${a.pct}%` }}
                      className="absolute inset-y-0 right-0 bg-rose-500/15 rounded"
                    />
                    <span className="relative z-10 text-zinc-300 font-mono-num">{a.vol}</span>
                    <span className="relative z-10 font-bold text-rose-400">{a.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 2: Medium (4 Cols) - AI & Algorithmic Strategy Studio ── */}
        <div className="md:col-span-12 lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#080b12] border border-white/10 hover:border-cyan-500/40 transition-all shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                  MODULE 02 • AGENTIC AI
                </span>
                <h3 className="text-lg font-bold text-white">Autonomous Quant AI</h3>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Run continuous Python/TypeScript strategy backtesting with automated trailing-stops and portfolio risk guards.
            </p>

            {/* Code Snippet Box */}
            <div className="p-3 bg-black/60 rounded-xl border border-white/10 font-mono text-[11px] text-zinc-300 mb-4 overflow-x-auto">
              <div className="flex items-center justify-between text-zinc-500 pb-1 mb-2 border-b border-white/5 text-[9px]">
                <span>strategy_alpha.py</span>
                <span className="text-cyan-400">SHARPE: 2.14</span>
              </div>
              <p className="text-cyan-300">@agent.on_tick(symbol=&apos;BBCA&apos;)</p>
              <p className="text-zinc-400">async def evaluate(market):</p>
              <p className="text-emerald-400 pl-2">if market.bandar_flow &gt; 10e9:</p>
              <p className="text-white pl-4">await order.buy(lots=10)</p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-400">Win Rate: <strong className="text-emerald-400">76.4%</strong></span>
            <span className="text-zinc-400">Max DD: <strong className="text-amber-400">-3.2%</strong></span>
          </div>
        </div>

        {/* ── Card 3: Medium (5 Cols) - Multi-Market Support ── */}
        <div className="md:col-span-12 lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#080b12] border border-white/10 hover:border-amber-500/40 transition-all shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Globe2 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                    MODULE 03 • GLOBAL ASSETS
                  </span>
                  <h3 className="text-lg font-bold text-white">Multi-Market Support</h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Toggle instantly between Indonesian blue chips (BEI), US Magnificent 7 tech equities, and 24/7 global crypto spot pairs.
            </p>

            {/* Market Toggle Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-black/50 border border-white/10 rounded-xl mb-4 font-mono text-xs">
              {(['idx', 'us', 'crypto'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMarket(m)}
                  className={`flex-1 py-1.5 rounded-lg text-center font-bold uppercase transition-all cursor-pointer ${
                    selectedMarket === m
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {m === 'idx' ? 'Saham BEI' : m === 'us' ? 'US Stocks' : 'Crypto 24/7'}
                </button>
              ))}
            </div>

            {/* Asset List */}
            <div className="space-y-2 font-mono text-xs">
              {MARKET_ASSETS[selectedMarket].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div>
                    <span className="font-bold text-white">{item.sym}</span>
                    <span className="text-[10px] text-zinc-500 ml-2 hidden sm:inline">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono-num text-white">{item.price}</span>
                    <span className={`text-[10px] font-bold ml-2 ${item.chg.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.chg}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Card 4: Large (7 Cols) - Risk Management Radar ── */}
        <div className="md:col-span-12 lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#080b12] border border-white/10 hover:border-emerald-500/40 transition-all shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                  MODULE 04 • PORTFOLIO DEFENSE
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Risk Management Radar &amp; Position Sizing
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
              Institutional capital preservation. Dynamic R:R ratios (Risk-to-Reward), automated stop-loss thresholds, and Kelly criterion position sizing to protect virtual RDN cash.
            </p>

            {/* Risk Telemetry Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-black/50 rounded-xl border border-white/5">
                <span className="text-[10px] text-zinc-500 block">RISK / REWARD</span>
                <span className="text-emerald-400 font-bold text-base">1 : 3.5</span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">Optimized Alpha</span>
              </div>
              <div className="p-3 bg-black/50 rounded-xl border border-white/5">
                <span className="text-[10px] text-zinc-500 block">MAX SLIPPAGE</span>
                <span className="text-white font-bold text-base">0.02%</span>
                <span className="text-[9px] text-emerald-400 block mt-0.5">Limit Protected</span>
              </div>
              <div className="p-3 bg-black/50 rounded-xl border border-white/5">
                <span className="text-[10px] text-zinc-500 block">MAX DRAWDOWN</span>
                <span className="text-amber-400 font-bold text-base">-2.8%</span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">Within Guardrail</span>
              </div>
              <div className="p-3 bg-black/50 rounded-xl border border-white/5">
                <span className="text-[10px] text-zinc-500 block">AUTO TP / SL</span>
                <span className="text-emerald-400 font-bold text-base">ACTIVE</span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">CRO Bambang Guard</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Dynamic Margin Shield: 100% Guaranteed</span>
            <span className="text-emerald-400 font-bold">READY TO DEPLOY</span>
          </div>
        </div>
      </div>
    </section>
  );
}
