'use client';

import React from 'react';
import {
  Trophy,
  Crown,
  TrendingUp,
  Award,
  Flame,
  Shield,
  Layers,
  X,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import type { MeritocraticAllocation } from '@/lib/hedgefund/autonomousEcosystemSchema';

interface MeritocracyLeaderboardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  allocations: MeritocraticAllocation[];
  totalFundNavUsd: number;
}

export default function MeritocracyLeaderboardDrawer({
  isOpen,
  onClose,
  allocations,
  totalFundNavUsd,
}: MeritocracyLeaderboardDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 font-sans"
      onClick={onClose}
    >
      <div
        className="bg-[#0c0f17] border border-amber-500/30 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.15)] flex flex-col text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>MERITOCRATIC CAPITAL ALLOCATION &amp; DESK HIERARCHY</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Alokasi AUM Berbasis Rolling Sharpe &amp; Tingkat Meja Kantor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
          <div className="flex justify-between items-center text-slate-400 text-xs px-1">
            <span>TOTAL DANA TERKONTROL (AUM):</span>
            <span className="text-emerald-400 font-bold text-sm">
              ${totalFundNavUsd.toLocaleString()}
            </span>
          </div>

          <div className="space-y-2.5">
            {allocations.map((a, i) => {
              const isPenthouse = a.deskTier === 'CORNER_PENTHOUSE';
              const isExile = a.deskTier === 'INTERN_EXILE';

              return (
                <div
                  key={a.agentId}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isPenthouse
                      ? 'border-amber-500/60 bg-amber-950/20 shadow-md shadow-amber-500/10'
                      : isExile
                      ? 'border-rose-500/40 bg-rose-950/20'
                      : 'border-slate-800 bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        i === 0
                          ? 'bg-amber-500 text-black'
                          : i === 1
                          ? 'bg-slate-300 text-black'
                          : i === 2
                          ? 'bg-amber-800 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-2 text-xs">
                        <span>{a.agentName}</span>
                        {isPenthouse && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px]">
                            🏆 Penthouse Suite
                          </span>
                        )}
                        {isExile && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px]">
                            Intern Penalty Box
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Tier Meja: <strong className="text-slate-200">{a.deskTier.replace('_', ' ')}</strong> · Win Rate: <strong>{a.winRatePct}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Quantitative Metrics */}
                  <div className="text-right">
                    <div className="text-sm font-bold text-cyan-300">
                      ${a.currentAumUsd.toLocaleString()} ({a.allocatedCapitalPct}%)
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Sharpe: <strong className="text-emerald-400">{a.rollingSharpe}</strong> · Sortino: <strong className="text-emerald-400">{a.sortinoRatio}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
