'use client';

import React, { useState } from 'react';
import { Terminal, ArrowRight, Shield, Zap, Sparkles, Check, Globe, Lock } from 'lucide-react';

interface FooterProps {
  onLaunchTerminal: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  user?: any;
}

export const Footer: React.FC<FooterProps> = ({ onLaunchTerminal, onOpenAuth, user }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 4000);
    }
  };

  return (
    <footer className="relative bg-[#06080E] border-t border-white/10 overflow-hidden text-zinc-400 font-sans">
      {/* Top CTA Banner */}
      <div className="relative py-24 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden">
        {/* Glowing Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs tracking-widest uppercase mb-6">
            <Zap className="w-3.5 h-3.5" />
            ZERO CAPITAL RISK // INSTITUTIONAL ACCESS
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-mono tracking-tight uppercase leading-tight">
            Ready to Dominate <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
              The Orderbook?
            </span>
          </h2>

          <p className="mt-6 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Join 150,000+ traders and quant engineers deploying risk-free strategies, analyzing real-time order depth, and mastering multi-market execution.
          </p>

          {/* Action Form & Direct Launch */}
          <div className="mt-10 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSubscribe} className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email for quant alpha..."
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-zinc-500 text-sm font-mono focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
              {subscribed && (
                <div className="absolute inset-0 bg-emerald-950/90 border border-emerald-500 rounded-xl flex items-center justify-center gap-2 text-emerald-400 font-mono text-xs">
                  <Check className="w-4 h-4" /> ACCESS INVITATION LOGGED
                </div>
              )}
            </form>

            {user ? (
              <button
                onClick={onLaunchTerminal}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_rgba(16,185,129,0.7)] flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Terminal className="w-4 h-4" />
                LAUNCH TERMINAL FREE
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_rgba(16,185,129,0.7)] flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Lock className="w-4 h-4" />
                SIGN IN KE WORKSTATION
              </button>
            )}
          </div>

          {/* Trust points */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> $100K Paper Capital
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Instant Setup &lt; 30s
            </span>
          </div>
        </div>
      </div>

      {/* Main Sitemap / Institutional Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="text-white font-mono font-bold text-lg tracking-wider">
                TRADESIM<span className="text-emerald-400">.PRO</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed mb-6 font-sans">
              Next-generation institutional paper trading terminal and quant simulation architecture. Real-time market depth, sub-12ms execution simulator, and automated algorithmic backtesting.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:text-emerald-400 flex items-center justify-center transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:text-emerald-400 flex items-center justify-center transition-colors">
                <Terminal className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 1: Platform */}
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-white font-semibold mb-4">
              TERMINAL & DESK
            </div>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={onLaunchTerminal} className="hover:text-emerald-400 transition-colors">
                  Web Terminal Engine
                </button>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">
                  Level 2 Orderbook
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">
                  Multi-Market Switcher
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-emerald-400 transition-colors">
                  Quant Backtest Studio
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-emerald-400 transition-colors">
                  Sentiment RAG Scanner
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Markets */}
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-white font-semibold mb-4">
              SUPPORTED MARKETS
            </div>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="hover:text-emerald-400 transition-colors cursor-pointer">
                  IDX Equities (LQ45 & Tech)
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-400 transition-colors cursor-pointer">
                  US Equities (NASDAQ & S&P 500)
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-400 transition-colors cursor-pointer">
                  24/7 Crypto Liquidity (BTC, ETH, SOL)
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Global Foreign Exchange (FX)
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Macro Commodities & Gold
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-white font-semibold mb-4">
              RESOURCES & LEGAL
            </div>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#comparison" className="hover:text-emerald-400 transition-colors">
                  Broker Comparison Matrix
                </a>
              </li>
              <li>
                <a href="/tools/kalkulator-fee-saham" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                  Kalkulator Fee Saham BEI
                </a>
              </li>
              <li>
                <a href="/tools/kalkulator-lot" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                  Kalkulator Lot &amp; Money Management
                </a>
              </li>
              <li>
                <a href="/tools/kalkulator-averaging-saham" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                  Kalkulator Average Down Saham
                </a>
              </li>
              <li>
                <a href="/learn/apa-itu-paper-trading" className="hover:text-emerald-400 transition-colors">
                  Panduan: Apa itu Paper Trading?
                </a>
              </li>
              <li>
                <a href="/learn/cara-baca-orderbook-level-2" className="hover:text-emerald-400 transition-colors">
                  Panduan: Cara Baca Orderbook Level 2
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  System Status (99.98%)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Institutional Financial Risk Disclaimer */}
        <div className="mt-12 pt-8 border-t border-white/5 font-mono text-[10px] leading-relaxed text-zinc-600">
          <div className="flex items-center gap-1.5 text-zinc-500 mb-2 font-bold uppercase">
            <Shield className="w-3.5 h-3.5 text-zinc-500" />
            REGULATORY & FINANCIAL DISCLAIMER
          </div>
          <p>
            TradeSim Pro is an institutional educational and simulation environment. All trades, orders, account balances, and portfolio equity displayed within this platform are 100% simulated paper assets and do not involve real capital, banking transactions, or brokerage custody. Past simulated performance is no guarantee of future real-market results. Trading securities, equities, options, and cryptocurrencies involves significant financial risk and is not suitable for all investors.
          </p>
        </div>

        {/* Copyright and Latency status */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-zinc-600">
          <div>&copy; {new Date().getFullYear()} TradeSim Technologies Inc. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM NODE: JAK-01 ONLINE
            </span>
            <span>BUILD: PROD_v3.9.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
