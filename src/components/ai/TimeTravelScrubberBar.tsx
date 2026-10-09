'use client';

import React from 'react';
import {
  Rewind,
  FastForward,
  Play,
  Pause,
  Clock,
  RotateCcw,
  Sparkles,
  Shield,
  Activity,
} from 'lucide-react';
import type { ReplayTickSnapshot } from '@/lib/office/TimeTravelReplayEngine';

interface TimeTravelScrubberBarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentTick: number;
  totalTicks: number;
  isReplaying: boolean;
  onScrub: (tick: number) => void;
  onTogglePlay: () => void;
  activeSnapshot: ReplayTickSnapshot | null;
}

export default function TimeTravelScrubberBar({
  isOpen,
  onToggle,
  currentTick,
  totalTicks,
  isReplaying,
  onScrub,
  onTogglePlay,
  activeSnapshot,
}: TimeTravelScrubberBarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto rounded-2xl border border-cyan-500/30 bg-slate-950/95 p-3.5 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-slate-100 font-mono text-xs backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-200 flex items-center gap-2 text-xs">
              <span>TIME-TRAVEL TICK REPLAY</span>
              {isReplaying && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] animate-pulse">
                  SCRUBBING PAUSED
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Audit status agen per detik · Zero RAM Overhead ({totalTicks} Ticks Terkoleksi)
            </p>
          </div>
        </div>

        {/* Live Snapshot Info */}
        {activeSnapshot && (
          <div className="hidden sm:flex items-center gap-3 text-[11px] bg-slate-900/60 px-3 py-1 rounded-xl border border-slate-800">
            <div>NAV: <strong className="text-emerald-400">${activeSnapshot.navUsd.toLocaleString()}</strong></div>
            <div>Aset: <strong className="text-amber-400">{activeSnapshot.activeStock}</strong></div>
            <div>Threat: <strong className={activeSnapshot.threatLevel === 'NORMAL' ? 'text-emerald-400' : 'text-rose-400'}>{activeSnapshot.threatLevel}</strong></div>
          </div>
        )}

        {/* Play/Pause Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onTogglePlay}
            className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1 transition-colors"
          >
            {isReplaying ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="text-[10px] uppercase">{isReplaying ? 'Resume' : 'Freeze'}</span>
          </button>
          <button
            onClick={onToggle}
            className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Scrubber Range Slider */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-[10px] text-slate-500 w-12 text-right">T-{Math.max(0, totalTicks - currentTick)}s</span>
        <input
          type="range"
          min={0}
          max={Math.max(1, totalTicks - 1)}
          value={currentTick}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <span className="text-[10px] text-cyan-300 font-bold w-12">Tick {currentTick}</span>
      </div>
    </div>
  );
}
