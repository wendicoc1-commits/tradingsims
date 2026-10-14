'use client';

import React from 'react';
import { Activity, Zap, Shield, Users } from 'lucide-react';

export default function MarketStatsBar() {
  const STATS = [
    {
      val: '$14.2B+',
      label: 'Simulated Volume Traded',
      sub: 'Cumulative order flow across 250+ assets',
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      color: 'text-emerald-400',
    },
    {
      val: '99.98%',
      label: 'Data Feed Uptime',
      sub: 'BEI, NASDAQ & Binance WebSocket feeds',
      icon: <Shield className="w-5 h-5 text-teal-400" />,
      color: 'text-teal-400',
    },
    {
      val: '< 12ms',
      label: 'Order Execution Latency',
      sub: 'Ultra low latency tick simulation engine',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      color: 'text-cyan-400',
    },
    {
      val: '150K+',
      label: 'Active Traders & Quants',
      sub: 'Retail investors & prop firm candidates',
      icon: <Users className="w-5 h-5 text-amber-400" />,
      color: 'text-amber-400',
    },
  ];

  return (
    <section className="relative z-10 py-12 bg-[#06080e]/80 border-y border-white/[0.08] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((s, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                  {s.icon}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  [STAT 0{idx + 1}]
                </span>
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono ${s.color} tracking-tight`}>
                {s.val}
              </div>
              <div className="text-xs sm:text-sm font-bold text-white mt-1">
                {s.label}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-1 leading-snug">
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
