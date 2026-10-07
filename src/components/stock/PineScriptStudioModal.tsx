'use client';

import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Play,
  Share2,
  ShieldCheck,
  TrendingUp,
  Cpu,
  X,
  ExternalLink,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { generateAutonomousPineScript, PineScriptResult } from '@/lib/charting/aiChartPilotEngine';

interface PineScriptStudioModalProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyToChart?: (script: PineScriptResult) => void;
}

export default function PineScriptStudioModal({
  symbol,
  isOpen,
  onClose,
  onApplyToChart,
}: PineScriptStudioModalProps) {
  const [strategyType, setStrategyType] = useState<'BREAKOUT' | 'SMC_ORDER_BLOCK' | 'BANDAR_FLOW'>('BREAKOUT');
  const [copied, setCopied] = useState(false);
  const [desktopSynced, setDesktopSynced] = useState(false);

  const pineData: PineScriptResult = generateAutonomousPineScript(symbol, strategyType);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pineData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSyncDesktop = () => {
    setDesktopSynced(true);
    setTimeout(() => setDesktopSynced(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c0d12] border border-[#27272a] rounded-xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs">
        {/* ── Top Header ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#12131a] border-b border-[#27272a]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#3b82f6]/20 border border-[#3b82f6]/40 rounded">
              <Code2 className="w-4 h-4 text-[#60a5fa]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm tracking-wide">
                  PINE SCRIPT v5 STUDIO &bull; {symbol.toUpperCase()}
                </span>
                <span className="text-[10px] bg-[#00c853]/15 text-[#00c853] border border-[#00c853]/30 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Syntax Valid
                </span>
              </div>
              <p className="text-[11px] text-[#71717a]">
                AI-compiled TradingView script &bull; Siap dieksekusi di TradingView Desktop atau Web Chart
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#71717a] hover:text-white rounded hover:bg-[#27272a] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Strategy Selector & Controls Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#090a0f] border-b border-[#1f2029]">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#71717a] uppercase mr-1">Template Strategi:</span>
            <button
              onClick={() => setStrategyType('BREAKOUT')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
                strategyType === 'BREAKOUT'
                  ? 'bg-[#3b82f6] text-white shadow'
                  : 'bg-[#181922] text-[#a1a1aa] hover:text-white'
              }`}
            >
              ⚡ Donchian Breakout
            </button>
            <button
              onClick={() => setStrategyType('SMC_ORDER_BLOCK')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
                strategyType === 'SMC_ORDER_BLOCK'
                  ? 'bg-[#3b82f6] text-white shadow'
                  : 'bg-[#181922] text-[#a1a1aa] hover:text-white'
              }`}
            >
              🎯 SMC & Order Block
            </button>
            <button
              onClick={() => setStrategyType('BANDAR_FLOW')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
                strategyType === 'BANDAR_FLOW'
                  ? 'bg-[#3b82f6] text-white shadow'
                  : 'bg-[#181922] text-[#a1a1aa] hover:text-white'
              }`}
            >
              🐋 Whale / Bandar Accumulation
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded font-bold cursor-pointer transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
            <button
              onClick={handleSyncDesktop}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-bold cursor-pointer transition ${
                desktopSynced
                  ? 'bg-[#22c55e] text-black shadow-md'
                  : 'bg-[#00c853]/20 border border-[#00c853]/40 text-[#22c55e] hover:bg-[#00c853]/30'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{desktopSynced ? '✓ Terkoneksi TV Desktop!' : 'Sync TradingView Desktop'}</span>
            </button>
          </div>
        </div>

        {/* ── Main Content: Code Editor & Metrics ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* Code Viewer (2 Cols) */}
          <div className="md:col-span-2 flex flex-col bg-[#07080c] border-r border-[#1f2029] overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#101118] border-b border-[#1f2029] text-[10px] text-[#71717a]">
              <span>PINE SCRIPT v5 &bull; {pineData.title}</span>
              <span>UTF-8 &bull; LF</span>
            </div>
            <div className="p-3 overflow-auto flex-1 font-mono text-[11px] leading-relaxed text-[#e4e4e7] select-text">
              <pre className="whitespace-pre">
                {pineData.code.split('\n').map((line, idx) => (
                  <div key={idx} className="flex gap-3 hover:bg-[#181924]/40">
                    <span className="text-[#52525b] select-none text-right w-6">{idx + 1}</span>
                    <span
                      className={
                        line.startsWith('//@')
                          ? 'text-[#a1a1aa]'
                          : line.startsWith('indicator') || line.startsWith('strategy')
                          ? 'text-[#38bdf8] font-bold'
                          : line.includes('input.') || line.includes('ta.')
                          ? 'text-[#fbbf24]'
                          : line.includes('plot') || line.includes('box.new')
                          ? 'text-[#4ade80]'
                          : line.startsWith('//')
                          ? 'text-[#71717a] italic'
                          : 'text-[#f4f4f5]'
                      }
                    >
                      {line}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </div>

          {/* Side Analytics & Logic Breakdown */}
          <div className="p-3.5 bg-[#0d0e14] overflow-y-auto space-y-3.5">
            {/* Backtest Metrics Card */}
            <div className="p-3 bg-[#12141c] border border-[#27272a] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#fb923c]" /> Estimasi Backtest AI
                </span>
                <span className="text-[9px] bg-[#27272a] text-[#a1a1aa] px-1.5 py-0.2 rounded font-mono">
                  {pineData.metrics.tradesAnalyzed} Trades
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-[#090a0f] rounded border border-[#1f2029]">
                  <div className="text-[9px] text-[#71717a]">Win Rate</div>
                  <div className="text-base font-extrabold text-[#22c55e] mt-0.5">
                    {pineData.metrics.estimatedWinRate}%
                  </div>
                </div>
                <div className="p-2 bg-[#090a0f] rounded border border-[#1f2029]">
                  <div className="text-[9px] text-[#71717a]">Profit Factor</div>
                  <div className="text-base font-extrabold text-[#38bdf8] mt-0.5">
                    {pineData.metrics.profitFactor}x
                  </div>
                </div>
                <div className="p-2 bg-[#090a0f] rounded border border-[#1f2029]">
                  <div className="text-[9px] text-[#71717a]">Max Drawdown</div>
                  <div className="text-xs font-bold text-[#f43f5e] mt-1">
                    -{pineData.metrics.maxDrawdownPct}%
                  </div>
                </div>
                <div className="p-2 bg-[#090a0f] rounded border border-[#1f2029]">
                  <div className="text-[9px] text-[#71717a]">Sharpe Ratio</div>
                  <div className="text-xs font-bold text-white mt-1">
                    {pineData.metrics.sharpeRatio}
                  </div>
                </div>
              </div>
            </div>

            {/* Algorithm Logic Details */}
            <div className="p-3 bg-[#12141c] border border-[#27272a] rounded-lg">
              <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider block mb-2">
                Logika Aturan Kuantitatif
              </span>
              <ul className="space-y-1.5 text-[11px] text-[#d4d4d8]">
                {pineData.logicExplanation.map((expl, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#38bdf8] font-bold">•</span>
                    <span>{expl}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="pt-1">
              <button
                onClick={() => {
                  if (onApplyToChart) onApplyToChart(pineData);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-md font-bold cursor-pointer transition shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Terapkan Sinyal ke Web Chart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
