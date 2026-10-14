'use client';

import React from 'react';
import { Check, X, ShieldAlert, Zap, Terminal, Sparkles, TrendingUp, Layers } from 'lucide-react';

interface ComparisonFeature {
  name: string;
  category: string;
  traditional: string | boolean;
  tradesim: string | boolean;
  highlight?: boolean;
}

const features: ComparisonFeature[] = [
  {
    name: 'Execution Latency (Simulation)',
    category: 'Speed & Architecture',
    traditional: '450ms - 1.2s (Lagged REST)',
    tradesim: '< 12ms (Native WebSocket Ladder)',
    highlight: true,
  },
  {
    name: 'L2 Market Depth & Full Book',
    category: 'Speed & Architecture',
    traditional: 'Limited Top 5 Bids/Asks',
    tradesim: 'Unrestricted 20+ Level Depth & Whales',
    highlight: true,
  },
  {
    name: 'Multi-Market Paper Trading',
    category: 'Execution Fidelity',
    traditional: 'Single Market (Restricted)',
    tradesim: 'IDX Equities + US Tech + 24/7 Crypto',
  },
  {
    name: 'Institutional Slippage & Partial Fills',
    category: 'Execution Fidelity',
    traditional: false,
    tradesim: true,
    highlight: true,
  },
  {
    name: 'AI Autonomous Strategy Backtester',
    category: 'Quant & Intelligence',
    traditional: false,
    tradesim: 'Integrated Python / Vector Engine',
    highlight: true,
  },
  {
    name: 'Sentiment RAG & Live SEC / IDX Tape',
    category: 'Quant & Intelligence',
    traditional: 'Delayed 15-30 mins',
    tradesim: 'Sub-second LLM Vector Summarizer',
  },
  {
    name: 'Capital at Risk During Training',
    category: 'Risk & Capital',
    traditional: 'Real Money Loss on Learning Curve',
    tradesim: '$100,000 Risk-Free Liquid Ledger',
    highlight: true,
  },
  {
    name: 'Direct WebSocket & Quant API Key',
    category: 'Developer & Quants',
    traditional: '$500+/mo Institutional Add-on',
    tradesim: 'Zero Fee Developer Tier Included',
  },
];

interface ComparisonMatrixProps {
  onLaunchTerminal: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  user?: any;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ onLaunchTerminal, onOpenAuth, user }) => {
  return (
    <section id="comparison" className="relative py-28 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#06080E]/70 overflow-hidden">
      {/* Background HUD Accents */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(16,185,129,0.06),transparent_80%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs tracking-widest uppercase mb-4">
            <Layers className="w-3.5 h-3.5" />
            BENCHMARK SPECIFICATION // MATRIX 01
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-mono">
            Traditional Brokers <span className="text-zinc-500">VS</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">TradeSim Pro</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            Stop practicing on laggy retail broker demo accounts. Trade on an institutional engine built with zero-lag WebSocket feeds, high-fidelity order routing, and AI quant tools.
          </p>
        </div>

        {/* Matrix Container / Card */}
        <div className="relative rounded-2xl border border-white/10 bg-[#0B0E14]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Tech HUD Corner Brackets */}
          <div className="absolute top-2 left-2 font-mono text-[9px] text-zinc-600 select-none">┌ ID: SPEC-902</div>
          <div className="absolute top-2 right-2 font-mono text-[9px] text-zinc-600 select-none">ENG-REF: V3.9 ┐</div>
          <div className="absolute bottom-2 left-2 font-mono text-[9px] text-zinc-600 select-none">└ STATUS: VERIFIED</div>
          <div className="absolute bottom-2 right-2 font-mono text-[9px] text-zinc-600 select-none">CONF: 99.98% ┘</div>

          {/* Table Header */}
          <div className="grid grid-cols-12 items-center p-5 sm:p-6 border-b border-white/10 bg-white/[0.02]">
            <div className="col-span-5 sm:col-span-6 font-mono text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-zinc-500" />
              CAPABILITY MATRIX
            </div>
            <div className="col-span-3 sm:col-span-3 font-mono text-xs uppercase tracking-wider text-zinc-400 font-semibold text-center">
              TRADITIONAL RETAIL BROKER
            </div>
            <div className="col-span-4 sm:col-span-3 font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold text-center flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              TRADESIM TERMINAL
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/5 font-mono text-xs sm:text-sm">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 items-center p-4 sm:p-5 transition-colors hover:bg-white/[0.04] ${
                  feature.highlight ? 'bg-emerald-500/[0.02]' : ''
                }`}
              >
                {/* Feature Name & Category */}
                <div className="col-span-5 sm:col-span-6 pr-2">
                  <div className="text-zinc-200 font-medium font-sans text-xs sm:text-sm">{feature.name}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{feature.category}</div>
                </div>

                {/* Traditional Broker column */}
                <div className="col-span-3 sm:col-span-3 text-center px-2">
                  {typeof feature.traditional === 'boolean' ? (
                    feature.traditional ? (
                      <Check className="w-4 h-4 text-zinc-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-red-500/70 mx-auto" />
                    )
                  ) : (
                    <span className="text-zinc-400 text-[11px] sm:text-xs leading-tight block">{feature.traditional}</span>
                  )}
                </div>

                {/* TradeSim column */}
                <div className="col-span-4 sm:col-span-3 text-center px-2">
                  {typeof feature.tradesim === 'boolean' ? (
                    feature.tradesim ? (
                      <div className="inline-flex items-center gap-1 text-emerald-400 font-bold justify-center">
                        <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                        <span className="text-[10px] hidden sm:inline uppercase">Supported</span>
                      </div>
                    ) : (
                      <X className="w-4 h-4 text-zinc-600 mx-auto" />
                    )
                  ) : (
                    <span className="text-emerald-400 font-bold text-[11px] sm:text-xs leading-tight block drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                      {feature.tradesim}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Card Footer Banner */}
          <div className="p-6 bg-gradient-to-r from-emerald-950/30 via-zinc-900/40 to-cyan-950/30 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-mono text-sm font-bold">READY TO UPGRADE YOUR EXECUTION?</div>
                <div className="text-zinc-400 text-xs">Unlock $100,000 simulated liquidity ledger instantly without KYC or credit card.</div>
              </div>
            </div>

            {user ? (
              <button
                onClick={onLaunchTerminal}
                className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] flex items-center gap-2 whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                LAUNCH SIMULATOR NOW
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth?.('login')}
                className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] flex items-center gap-2 whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                SIGN IN KE SIMULATOR
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
