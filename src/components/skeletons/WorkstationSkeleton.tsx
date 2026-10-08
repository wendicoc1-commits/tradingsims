'use client';

import React from 'react';

export default function WorkstationSkeleton() {
  return (
    <div className="h-full w-full flex flex-col bg-[#090a0f] text-zinc-300 select-none overflow-hidden font-mono">
      {/* ── 1. Top Ticker Tape Bar Skeleton ── */}
      <div className="h-9 border-b border-zinc-800/80 bg-zinc-950/80 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-bold text-emerald-400">TRADESIM CLOUD ENGINE</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className="h-4 w-28 bg-zinc-800/60 rounded animate-pulse" />
            <div className="h-4 w-32 bg-zinc-800/60 rounded animate-pulse" />
            <div className="h-4 w-24 bg-zinc-800/60 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-zinc-800/60 rounded animate-pulse" />
          <span className="text-[10px] text-zinc-500 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            CONNECTING REALTIME FEED...
          </span>
        </div>
      </div>

      {/* ── 2. Main Workstation Grid ── */}
      <div className="flex-1 p-2 grid grid-cols-12 gap-2 overflow-hidden">
        {/* Left Column: Watchlist & Market Overview (3 Cols) */}
        <div className="hidden lg:flex col-span-3 flex-col gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-2.5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-12 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="space-y-2 mt-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-10 rounded bg-zinc-900/60 border border-zinc-800/50 p-2 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-2 w-24 bg-zinc-800/50 rounded animate-pulse" />
                </div>
                <div className="h-4 w-14 bg-zinc-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: Live Chart & Depth (6 Cols) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-2">
          {/* Chart Header */}
          <div className="h-12 rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-6 w-20 bg-zinc-800 rounded animate-pulse" />
              <div className="h-6 w-24 bg-emerald-950/40 border border-emerald-500/20 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-10 bg-zinc-800 rounded animate-pulse" />
              <div className="h-6 w-10 bg-zinc-800 rounded animate-pulse" />
              <div className="h-6 w-10 bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>

          {/* Chart Canvas Area */}
          <div className="flex-1 rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-4 relative overflow-hidden flex flex-col justify-between">
            {/* Grid Lines Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="flex justify-between items-center text-[10px] text-zinc-600 relative z-10">
              <div className="h-3 w-32 bg-zinc-800/60 rounded animate-pulse" />
              <div className="h-3 w-20 bg-zinc-800/60 rounded animate-pulse" />
            </div>

            {/* Simulated Candlestick / Wave Silhouette */}
            <div className="relative z-10 my-auto flex items-end justify-between h-40 px-4 opacity-40">
              {[40, 65, 55, 80, 95, 75, 110, 130, 115, 140, 125, 150, 135, 160].map((h, idx) => (
                <div
                  key={idx}
                  className="w-3 bg-cyan-500/40 rounded-t animate-pulse"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>

            <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-900">
              <span>INITIALIZING TRADINGVIEW HIGH-FREQUENCY ENGINE...</span>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <span className="text-cyan-400 font-bold">READY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fast Order Execution Desk (3 Cols) */}
        <div className="hidden lg:flex col-span-3 flex-col gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold text-amber-400">INSTANT ORDER DESK</span>
            <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <div className="h-8 rounded bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-xs text-emerald-400 font-bold">
              BUY
            </div>
            <div className="h-8 rounded bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-xs text-rose-400 font-bold">
              SELL
            </div>
          </div>

          <div className="space-y-3 mt-3">
            <div className="space-y-1">
              <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
              <div className="h-9 w-full bg-zinc-900 rounded border border-zinc-800 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
              <div className="h-9 w-full bg-zinc-900 rounded border border-zinc-800 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
              <div className="h-9 w-full bg-zinc-900 rounded border border-zinc-800 animate-pulse" />
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-zinc-800">
            <div className="h-10 w-full rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs text-amber-300 font-bold">
              MEMUAT TERMINAL SIMULATOR...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
