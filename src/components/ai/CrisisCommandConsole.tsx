'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  Droplet,
  ShieldAlert,
  Radio,
  Zap,
  Activity,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  X,
} from 'lucide-react';
import type { CrisisScenarioType, CrisisEventPayload } from '@/lib/hedgefund/autonomousEcosystemSchema';

interface CrisisCommandConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectCrisis: (crisis: CrisisEventPayload) => void;
  isCrisisActive: boolean;
  activeCrisis: CrisisEventPayload | null;
  onResolveCrisis: () => void;
}

export default function CrisisCommandConsole({
  isOpen,
  onClose,
  onInjectCrisis,
  isCrisisActive,
  activeCrisis,
  onResolveCrisis,
}: CrisisCommandConsoleProps) {
  const [selectedScenario, setSelectedScenario] = useState<CrisisScenarioType>('FLASH_CRASH');
  const [duration, setDuration] = useState<number>(45);

  if (!isOpen) return null;

  const scenarios: {
    type: CrisisScenarioType;
    title: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
    impact: { priceDrop: number; spread: number; slippage: number };
  }[] = [
    {
      type: 'FLASH_CRASH',
      title: 'Flash Crash Cascade',
      desc: '-15% kejatuhan indeks instan dalam 60 detik akibat kaskade likuidasi bot HFT.',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      color: 'border-rose-500/40 bg-rose-950/30',
      impact: { priceDrop: 15.0, spread: 3.5, slippage: 4.0 },
    },
    {
      type: 'LIQUIDITY_DROUGHT',
      title: 'Liquidity Freeze (Drought)',
      desc: 'Market maker menarik order bid; spread orderbook melebar 10x lipat dan slippage ekstrem.',
      icon: <Droplet className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-950/30',
      impact: { priceDrop: 4.5, spread: 10.0, slippage: 8.5 },
    },
    {
      type: 'REGULATORY_BLACKOUT',
      title: 'Emergency Regulatory Halt',
      desc: 'Intervensi darurat regulator; pembekuan instrumen dan circuit breaker lantai bursa dipicu.',
      icon: <ShieldAlert className="w-4 h-4 text-purple-400" />,
      color: 'border-purple-500/40 bg-purple-950/30',
      impact: { priceDrop: 8.0, spread: 5.0, slippage: 5.0 },
    },
  ];

  const handleLaunch = () => {
    const active = scenarios.find((s) => s.type === selectedScenario)!;
    const payload: CrisisEventPayload = {
      crisisId: `CRISIS-${Date.now()}`,
      type: active.type,
      severity: active.type === 'FLASH_CRASH' ? 'CATASTROPHIC' : 'CRITICAL',
      triggeredAt: Date.now(),
      durationSeconds: duration,
      marketImpact: {
        priceDropPct: active.impact.priceDrop,
        spreadMultiplier: active.impact.spread,
        slippageMultiplier: active.impact.slippage,
      },
      officeState: {
        alarmAudio: true,
        lightingColor: 'rgba(239, 68, 68, 0.35)',
        circuitBreakerTripped: true,
      },
    };
    onInjectCrisis(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 font-sans"
      onClick={onClose}
    >
      <div
        className="rounded-2xl border border-rose-500/40 bg-slate-950/95 p-5 shadow-[0_0_50px_rgba(244,63,94,0.2)] text-slate-100 max-w-lg w-full transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-400 animate-pulse">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold tracking-wider uppercase text-rose-300 flex items-center gap-2">
                <span>Chaos Engineering &amp; Crisis Injector</span>
              </h3>
              <p className="text-xs text-slate-400">Stress Testing Kesiapan AI &amp; Risk Officer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        {isCrisisActive && (
          <div className="my-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              STATUS: KRISIS PASAR AKTIF ({activeCrisis?.type})
            </div>
            <span className="text-[11px] text-rose-400">Circuit Breaker TRIP</span>
          </div>
        )}

        {/* Scenario Selection */}
        <div className="space-y-2.5 my-4">
          {scenarios.map((sc) => {
            const isSelected = selectedScenario === sc.type;
            return (
              <button
                key={sc.type}
                onClick={() => setSelectedScenario(sc.type)}
                disabled={isCrisisActive}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  isSelected
                    ? `${sc.color} ring-1 ring-rose-400/60`
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80'
                } ${isCrisisActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="mt-0.5">{sc.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-slate-100">{sc.title}</span>
                    <span className="font-mono text-[11px] text-rose-400 font-bold">
                      -{sc.impact.priceDrop}% Impact
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{sc.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Controls */}
        {isCrisisActive ? (
          <div className="space-y-3 pt-2">
            <button
              onClick={onResolveCrisis}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
            >
              <RotateCcw className="w-4 h-4" />
              Pulihkan Pasar &amp; Reset Circuit Breaker
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span>Durasi Guncangan:</span>
              <span className="text-rose-300 font-bold">{duration} detik</span>
            </div>
            <button
              onClick={handleLaunch}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Injeksi Black Swan ke Seluruh Agen Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
