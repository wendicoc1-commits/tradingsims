'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  X,
  Sliders,
  DollarSign,
  Activity,
  Flame,
} from 'lucide-react';
import { usePortfolioStore } from '@/store';

interface CopyTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AgentProfile {
  id: string;
  name: string;
  role: string;
  emoji: string;
  avatarBg: string;
  winRate: number;
  sharpeRatio: number;
  assetClass: 'IDX Equities' | 'Crypto 24/7' | 'Global Macro' | 'Ultra Low Risk';
  description: string;
}

const AGENT_ROSTER: AgentProfile[] = [
  {
    id: 'raditya',
    name: 'Raditya Pratama',
    role: 'Senior L/S Equity PM',
    emoji: '💼',
    avatarBg: 'from-blue-600 to-indigo-700',
    winRate: 74.5,
    sharpeRatio: 1.95,
    assetClass: 'IDX Equities',
    description: 'Fokus pada Bluechip LQ45, rotasi multi-sektor, dan kepatuhan mutlak fraksi harga BEI.',
  },
  {
    id: 'kevin',
    name: 'Kevin Zhang',
    role: 'Crypto Momentum Quant Desk',
    emoji: '⚡',
    avatarBg: 'from-amber-500 to-orange-600',
    winRate: 68.2,
    sharpeRatio: 2.14,
    assetClass: 'Crypto 24/7',
    description: 'Trading breakout otomatis 24 jam di BTC, ETH, SOL dengan Chandelier Trailing Exit.',
  },
  {
    id: 'gita',
    name: 'Gita Wirjawan',
    role: 'Chief Investment Officer (Macro)',
    emoji: '🏛️',
    avatarBg: 'from-emerald-600 to-teal-700',
    winRate: 81.0,
    sharpeRatio: 1.82,
    assetClass: 'Global Macro',
    description: 'Alokasi siklus makro, dividend compounder, dan perlindungan nilai lindung pasar global.',
  },
  {
    id: 'bambang',
    name: 'Bambang Suroso',
    role: 'Chief Risk Officer (CRO)',
    emoji: '🛡️',
    avatarBg: 'from-rose-600 to-red-800',
    winRate: 86.5,
    sharpeRatio: 2.35,
    assetClass: 'Ultra Low Risk',
    description: 'Penjaga modal dengan plafon risiko 1:2 RRR, proteksi black swan, dan batasan sektor 30% NAV.',
  },
];

export default function CopyTradingModal({ isOpen, onClose }: CopyTradingModalProps) {
  const { cash } = usePortfolioStore();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('raditya');
  const [allocationAmount, setAllocationAmount] = useState<number>(5_000_000);
  const [activeMirrors, setActiveMirrors] = useState<Record<string, number>>({});
  const [successNotif, setSuccessNotif] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('TRADEMIND_ACTIVE_COPY_TRADING');
        if (saved) setActiveMirrors(JSON.parse(saved));
      } catch {}
    }
  }, [isOpen]);

  const handleToggleMirror = (agentId: string) => {
    const updated = { ...activeMirrors };
    if (updated[agentId]) {
      delete updated[agentId];
      setSuccessNotif(`Berhenti mengikuti sinyal ${AGENT_ROSTER.find((a) => a.id === agentId)?.name}.`);
    } else {
      updated[agentId] = allocationAmount;
      setSuccessNotif(`✅ Sukses mengaktifkan Copy-Trading untuk ${AGENT_ROSTER.find((a) => a.id === agentId)?.name} (Alokasi: Rp ${allocationAmount.toLocaleString('id-ID')})!`);
    }
    setActiveMirrors(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('TRADEMIND_ACTIVE_COPY_TRADING', JSON.stringify(updated));
    }
    setTimeout(() => setSuccessNotif(null), 3000);
  };

  if (!isOpen) return null;

  const currentAgent = AGENT_ROSTER.find((a) => a.id === selectedAgentId) || AGENT_ROSTER[0];
  const isCurrentlyMirrored = !!activeMirrors[currentAgent.id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              1-Click Copy Trading AI Hedge Fund
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-semibold border border-purple-500/20">
                Auto-Mirror
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pilih agen komite favorit Anda dan alokasikan modal untuk otomatis menyalin setiap order eksekusi.
            </p>
          </div>
        </div>

        {/* Notifications */}
        {successNotif && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successNotif}</span>
          </div>
        )}

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
          {AGENT_ROSTER.map((agent) => {
            const isSelected = agent.id === selectedAgentId;
            const isMirrored = !!activeMirrors[agent.id];

            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50/30 dark:bg-purple-950/20 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {isMirrored && (
                  <span className="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="h-2.5 w-2.5" /> AKTIF
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${agent.avatarBg} flex items-center justify-center text-xl shadow-sm shrink-0`}>
                    {agent.emoji}
                  </div>
                  <div className="truncate">
                    <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                      {agent.name}
                    </h4>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">
                      {agent.role}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Flame className="h-3 w-3" /> Win {agent.winRate}%
                  </div>
                  <div className="text-zinc-400 text-[10px]">
                    Sharpe: <strong className="text-zinc-600 dark:text-zinc-300">{agent.sharpeRatio}</strong>
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-700/60 text-[9px] font-semibold text-zinc-600 dark:text-zinc-300">
                    {agent.assetClass}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Agent Configuration Panel */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Alokasi Modal untuk {currentAgent.name}
            </span>
            <span className="text-sm font-bold text-emerald-500 font-mono">
              Rp {allocationAmount.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={1_000_000}
            max={Math.max(50_000_000, cash)}
            step={500_000}
            value={allocationAmount}
            onChange={(e) => setAllocationAmount(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />

          <div className="flex justify-between text-[10px] text-zinc-400">
            <span>Min: Rp 1 Juta</span>
            <span>Kas Tersedia: Rp {Math.round(cash).toLocaleString('id-ID')}</span>
            <span>Maks: Rp 50 Juta</span>
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed italic border-t border-zinc-200/50 dark:border-zinc-700/50 pt-2">
            &ldquo;{currentAgent.description}&rdquo;
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-5 border-t border-zinc-100 dark:border-zinc-800 mt-5">
          <div className="text-[11px] text-zinc-400">
            Status: {isCurrentlyMirrored ? (
              <span className="text-emerald-500 font-bold">Mengikuti otomatis (Rp {(activeMirrors[currentAgent.id] || 0).toLocaleString('id-ID')})</span>
            ) : (
              <span>Belum diikuti</span>
            )}
          </div>

          <button
            onClick={() => handleToggleMirror(currentAgent.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-sm ${
              isCurrentlyMirrored
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            {isCurrentlyMirrored ? `Hentikan Copy-Trading ${currentAgent.name}` : `Mulai Copy-Trading ${currentAgent.name}`}
          </button>
        </div>
      </div>
    </div>
  );
}
