'use client';

import React from 'react';
import { Clock, RefreshCw, Zap, Bell, CheckCircle2 } from 'lucide-react';
import { UseHourlyNewsReturn } from '@/hooks/useHourlyNews';

interface HourlyUpdateStatusBarProps {
  hourlyState: UseHourlyNewsReturn;
  className?: string;
}

export default function HourlyUpdateStatusBar({
  hourlyState,
  className = '',
}: HourlyUpdateStatusBarProps) {
  const { meta, countdown, isRefreshing, hasNewStories, refreshNow, dismissNewBadge } = hourlyState;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 rounded-lg border bg-[#09090b] border-[#27272a] text-xs font-mono select-none ${className}`}
    >
      {/* Left: Active Hourly Status & Indicators */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-bold text-[10px] tracking-wider uppercase">
            LIVE REFRESH: TIAP 1 JAM
          </span>
        </div>

        <div className="flex items-center gap-1 text-[#a1a1aa] text-[11px]">
          <span>Update Terakhir:</span>
          <span className="text-white font-bold">{meta.lastUpdated}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[#71717a] text-[11px]">
          &bull;
          <span>Siklus Jam Ke:</span>
          <span className="text-[#f59e0b] font-bold">{meta.cycleHour}:00</span>
        </div>

        {hasNewStories && (
          <div
            onClick={dismissNewBadge}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#f59e0b]/20 border border-[#f59e0b]/40 text-[#f59e0b] cursor-pointer hover:bg-[#f59e0b]/30 transition-colors animate-pulse"
            title="Klik untuk menandai telah dibaca"
          >
            <Zap className="w-3 h-3" />
            <span className="font-bold text-[10px]">
              +{meta.totalStoriesThisHour} RILIS BARU JAM INI
            </span>
          </div>
        )}
      </div>

      {/* Right: Countdown to Next Hour & Force Refresh Button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-[#a1a1aa]">
          <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>Update Berikutnya:</span>
          <span className="font-mono-num font-bold text-[#f59e0b] bg-[#18181b] px-1.5 py-0.5 rounded border border-[#27272a]">
            {countdown}
          </span>
        </div>

        <button
          onClick={refreshNow}
          disabled={isRefreshing}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer border ${
            isRefreshing
              ? 'bg-[#27272a] text-[#71717a] border-transparent cursor-not-allowed'
              : 'bg-[#18181b] hover:bg-[#27272a] text-white hover:text-[#f59e0b] border-[#27272a]'
          }`}
          title="Sinkronisasi & ambil pembaruan berita bisnis jam ini sekarang"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#f59e0b]' : ''}`} />
          <span>{isRefreshing ? 'Menyinkronkan...' : 'Update Sekarang'}</span>
        </button>
      </div>
    </div>
  );
}
