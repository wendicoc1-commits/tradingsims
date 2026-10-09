// src/components/ai/FloatingAgentInspector.tsx
'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Cpu,
  TrendingUp,
  TrendingDown,
  X,
  Zap,
  Target,
  Clock,
  Layers,
} from 'lucide-react';
import { AgentProfile } from '@/types/simulation.types';

interface FloatingAgentInspectorProps {
  agent: AgentProfile | null;
  onClose: () => void;
  onConveneWarRoomVote?: (agentId: string) => void;
}

export default function FloatingAgentInspector({
  agent,
  onClose,
  onConveneWarRoomVote,
}: FloatingAgentInspectorProps) {
  const latestCoT = useMemo(() => {
    if (!agent || agent.cotHistory.length === 0) return null;
    return agent.cotHistory[agent.cotHistory.length - 1];
  }, [agent]);

  if (!agent) return null;

  const isHighSharpe = agent.rollingSharpeRatio >= 2.0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 30, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 30, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed top-20 right-6 w-[410px] max-w-[calc(100vw-32px)] bg-[#070b13]/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.18)] text-slate-100 font-mono text-xs overflow-hidden z-50 pointer-events-auto"
      >
        {/* Top Header Bar */}
        <div className="p-3.5 bg-gradient-to-r from-cyan-950/40 via-[#0d1527] to-transparent border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={agent.avatarUrl || '/avatars/agent_default.png'}
                alt={agent.name}
                className="w-10 h-10 rounded-xl border border-cyan-400/50 object-cover bg-slate-900"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              {isHighSharpe && (
                <div
                  className="absolute -top-1.5 -right-1.5 p-1 bg-amber-400 rounded-full text-black shadow-md shadow-amber-400/40"
                  title="Rank #1 Executive Suite: Sharpe Ratio Tertinggi"
                >
                  <Award className="w-3 h-3" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm truncate">{agent.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-semibold shrink-0">
                  {agent.status}
                </span>
              </div>
              <p className="text-[10px] text-cyan-400/90 uppercase font-sans tracking-wider truncate">
                {agent.role.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quant Metric KPI Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-black/40 border-b border-cyan-500/10 text-center">
          <div className="p-2 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[9px] text-slate-400 block tracking-wider">SHARPE RATIO</span>
            <span
              className={`text-sm font-extrabold ${
                isHighSharpe ? 'text-amber-300' : 'text-emerald-400'
              }`}
            >
              {agent.rollingSharpeRatio.toFixed(2)}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[9px] text-slate-400 block tracking-wider">NET ALPHA</span>
            <span
              className={`text-sm font-extrabold flex items-center justify-center gap-0.5 ${
                agent.netAlphaUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {agent.netAlphaUsd >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              ${Math.abs(agent.netAlphaUsd).toLocaleString()}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[9px] text-slate-400 block tracking-wider">LATENCY</span>
            <span className="text-sm font-extrabold text-cyan-300">
              {agent.activeModelLatencyMs}ms
            </span>
          </div>
        </div>

        {/* Secondary Telemetry: Win Rate, Task Queue & Drawdown */}
        <div className="grid grid-cols-3 gap-2 px-3 py-2 border-b border-cyan-500/10 text-[10px]">
          <div className="flex items-center gap-1 text-slate-400">
            <Target className="w-3 h-3 text-cyan-400" />
            <span>Win Rate: <b className="text-white">{agent.winRatePct.toFixed(1)}%</b></span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Layers className="w-3 h-3 text-amber-400" />
            <span>Queue: <b className="text-white">{agent.taskQueueDepth} tasks</b></span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-rose-400" />
            <span>Drawdown: <b className="text-white">-{agent.maxDrawdownPct.toFixed(1)}%</b></span>
          </div>
        </div>

        {/* Chain-of-Thought (CoT) Live Terminal Feed */}
        <div className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-cyan-400 flex items-center gap-1.5 font-bold">
              <Cpu className="w-3.5 h-3.5" />
              CHAIN-OF-THOUGHT INFERENCE
            </span>
            <span className="text-[10px] text-slate-400 font-sans">
              {latestCoT ? `${latestCoT.tokenCount} tokens • ${latestCoT.latencyMs}ms` : 'Listening to live feed...'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/70 border border-slate-800 font-mono text-[11px] leading-relaxed text-slate-300 max-h-36 overflow-y-auto scrollbar-thin">
            {latestCoT ? (
              <div className="space-y-1">
                <p className="text-cyan-200">
                  <span className="text-cyan-500 font-bold">&gt; CoT Reasoning:</span>{' '}
                  {latestCoT.thoughtSnippet}
                </p>
                {latestCoT.proposedAction && (
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Proposed Action:</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        latestCoT.proposedAction === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : latestCoT.proposedAction === 'SELL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {latestCoT.proposedAction} (Conviction: {(latestCoT.convictionScore * 100).toFixed(0)}%)
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-600 italic">&gt; Telemetry standby. Memantau sinyal pasar 24/7...</p>
            )}
          </div>

          {/* Action Trigger Button: Panggil Sidang War Room */}
          <div className="pt-1">
            <button
              onClick={() => onConveneWarRoomVote?.(agent.id)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>PANGGIL SIDANG WAR ROOM</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
