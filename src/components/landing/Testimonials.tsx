'use client';

import React from 'react';
import { MessageSquare, Star, ShieldCheck, TrendingUp, Award, CheckCircle2 } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  firm: string;
  performance: string;
  sharpe: string;
  verifiedBadge: string;
  avatarText: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'The Level 2 orderbook and order ladder are indistinguishable from Bloomberg or CQG. Testing our mean-reversion strategies on TradeSim saved our fund over $85K in early execution slippage.',
    author: 'Reza Pratama',
    role: 'Lead Quantitative Strategist',
    firm: 'Valura Capital Partners',
    performance: '+42.8% Simulated Annualized',
    sharpe: 'Sharpe 2.64',
    verifiedBadge: 'VERIFIED QUANT DESK',
    avatarText: 'RP',
  },
  {
    quote:
      'I passed my $200K FTMO / Prop Firm challenge on the first try solely because I trained execution discipline on TradeSim Pro. The realistic IDX & US slippage engine gives no room for fake wins.',
    author: 'Daniel Kusuma',
    role: 'Full-Time Prop Trader & Scalper',
    firm: 'Independent Prop Trader',
    performance: 'Passed $200K Funded Test',
    sharpe: 'Win Rate 68.2%',
    verifiedBadge: 'FUNDED PROP TRADER',
    avatarText: 'DK',
  },
  {
    quote:
      'The Python backtester coupled with real-time vector news sentiment is a game changer. We prototype alpha ideas in minutes and test order fills directly against realistic liquidity barriers.',
    author: 'Sarah Lin, CFA',
    role: 'Portfolio Manager & Algorithmic Trader',
    firm: 'Aegis Macro Fund',
    performance: 'Max Drawdown -3.1%',
    sharpe: 'Sharpe 3.12',
    verifiedBadge: 'VERIFIED ASSET MGR',
    avatarText: 'SL',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="relative py-28 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#0B0E14] overflow-hidden">
      {/* Background Subtle Radials */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(56,189,248,0.06),transparent_80%)]" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-4">
            <Award className="w-3.5 h-3.5" />
            COMMUNITY & INSTITUTIONAL VALIDATION
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-mono">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">150,000+</span> Traders & Quants
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            From institutional hedge fund modelers to aspiring retail prop traders, see how our simulated high-frequency engine sharpens real-market performance.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl border border-white/10 bg-[#06080E]/80 backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between hover:border-emerald-500/30 hover:scale-[1.01] transition-all duration-300 group shadow-xl"
            >
              {/* Tech corner accent */}
              <div className="absolute top-2 right-3 font-mono text-[9px] text-zinc-600 group-hover:text-cyan-400/60 transition-colors">
                REV_ID//0{idx + 1}
              </div>

              {/* Quote & Stars */}
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 font-mono text-[10px] text-zinc-500 uppercase tracking-wider">5.0 RATING</span>
                </div>

                <p className="text-zinc-300 font-sans text-sm leading-relaxed italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Info & Performance Metrics */}
              <div className="pt-5 border-t border-white/10">
                {/* Metrics Pill */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                    {t.performance}
                  </span>
                  <span className="font-mono text-[11px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                    {t.sharpe}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Avatar text */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/20 flex items-center justify-center font-mono font-bold text-xs text-white shadow-inner flex-shrink-0">
                    {t.avatarText}
                  </div>

                  <div className="min-w-0">
                    <div className="text-white font-mono text-sm font-semibold truncate flex items-center gap-1.5">
                      {t.author}
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    </div>
                    <div className="text-zinc-400 text-[11px] truncate">{t.role}</div>
                    <div className="text-zinc-500 font-mono text-[10px] tracking-wider uppercase truncate">{t.firm}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1 text-[9px] font-mono text-zinc-500 tracking-widest uppercase">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {t.verifiedBadge}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
