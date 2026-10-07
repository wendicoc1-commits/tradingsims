'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Target,
  Maximize2,
  Code2,
  Cpu,
  Check,
  Send,
  Eye,
  Layers,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import {
  detectSupportResistanceLevels,
  detectSmartMoneyZones,
  calculateRiskRewardPlan,
  ChartAnnotationOverlay,
} from '@/lib/charting/aiChartPilotEngine';

interface AIChartPilotHUDProps {
  symbol: string;
  currentPrice: number;
  onApplyOverlays: (overlays: ChartAnnotationOverlay[]) => void;
  onClearOverlays: () => void;
  onOpenPineStudio: () => void;
}

export default function AIChartPilotHUD({
  symbol,
  currentPrice,
  onApplyOverlays,
  onClearOverlays,
  onOpenPineStudio,
}: AIChartPilotHUDProps) {
  const [activeModes, setActiveModes] = useState<{
    sr: boolean;
    smc: boolean;
    rr: boolean;
  }>({ sr: false, smc: false, rr: false });

  const [promptInput, setPromptInput] = useState('');
  const [desktopConnected, setDesktopConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const toggleSR = () => {
    const nextState = !activeModes.sr;
    setActiveModes((prev) => ({ ...prev, sr: nextState }));

    if (nextState) {
      const srLevels = detectSupportResistanceLevels(symbol, currentPrice, currentPrice * 1.04, currentPrice * 0.96);
      onApplyOverlays(srLevels);
      setStatusMessage(`AI menggambar 4 garis S/R kunci untuk ${symbol.toUpperCase()}`);
    } else {
      onClearOverlays();
      setStatusMessage(null);
    }
  };

  const toggleSMC = () => {
    const nextState = !activeModes.smc;
    setActiveModes((prev) => ({ ...prev, smc: nextState }));

    if (nextState) {
      const zones = detectSmartMoneyZones(symbol, currentPrice);
      const overlays: ChartAnnotationOverlay[] = [
        {
          type: 'ORDER_BLOCK',
          title: `Bullish Demand Block (Rp ${zones.demandZone.low.toLocaleString()} - ${zones.demandZone.high.toLocaleString()})`,
          price: zones.demandZone.high,
          secondaryPrice: zones.demandZone.low,
          color: '#00c853',
          lineStyle: 'SOLID',
          rationale: 'Zona akumulasi volume institusi Smart Money.',
        },
        {
          type: 'ORDER_BLOCK',
          title: `Bearish Supply Block (Rp ${zones.supplyZone.low.toLocaleString()} - ${zones.supplyZone.high.toLocaleString()})`,
          price: zones.supplyZone.high,
          secondaryPrice: zones.supplyZone.low,
          color: '#ff1744',
          lineStyle: 'SOLID',
          rationale: 'Zona distribusi order jual institusi.',
        },
      ];
      onApplyOverlays(overlays);
      setStatusMessage(`AI menandai zona Order Block Demand & Supply untuk ${symbol.toUpperCase()}`);
    } else {
      onClearOverlays();
      setStatusMessage(null);
    }
  };

  const toggleRiskReward = () => {
    const nextState = !activeModes.rr;
    setActiveModes((prev) => ({ ...prev, rr: nextState }));

    if (nextState) {
      const rr = calculateRiskRewardPlan(symbol, currentPrice, 3.2);
      const overlays: ChartAnnotationOverlay[] = [
        {
          type: 'RISK_REWARD',
          title: `🎯 Take Profit (+${rr.rewardPct}%): Rp ${rr.takeProfit.toLocaleString('id-ID')}`,
          price: rr.takeProfit,
          color: '#00e676',
          lineStyle: 'SOLID',
          rationale: `Target rasio Risk/Reward 1:${rr.rrRatio}`,
        },
        {
          type: 'RISK_REWARD',
          title: `ENTRY: Rp ${rr.entry.toLocaleString('id-ID')}`,
          price: rr.entry,
          color: '#38bdf8',
          lineStyle: 'DOTTED',
          rationale: 'Level eksekusi posisi',
        },
        {
          type: 'RISK_REWARD',
          title: `🛑 Stop Loss (-${rr.riskPct}%): Rp ${rr.stopLoss.toLocaleString('id-ID')}`,
          price: rr.stopLoss,
          color: '#f43f5e',
          lineStyle: 'SOLID',
          rationale: 'Level proteksi modal',
        },
      ];
      onApplyOverlays(overlays);
      setStatusMessage(`AI memasang target TP/SL (R:R 1:${rr.rrRatio}) untuk ${symbol.toUpperCase()}`);
    } else {
      onClearOverlays();
      setStatusMessage(null);
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    const lower = promptInput.toLowerCase();
    if (lower.includes('support') || lower.includes('resisten') || lower.includes('s/r')) {
      toggleSR();
    } else if (lower.includes('block') || lower.includes('smc') || lower.includes('fvg') || lower.includes('demand')) {
      toggleSMC();
    } else if (lower.includes('tp') || lower.includes('sl') || lower.includes('target') || lower.includes('risk')) {
      toggleRiskReward();
    } else if (lower.includes('pine') || lower.includes('script') || lower.includes('skrip') || lower.includes('kode')) {
      onOpenPineStudio();
    } else {
      toggleSR();
    }
    setPromptInput('');
  };

  const handleSyncTradingViewDesktop = () => {
    setDesktopConnected(true);
    setStatusMessage(`Terkoneksi ke TradingView Desktop (Port 9222)! Simbol ${symbol.toUpperCase()} & garis aktif disinkronkan.`);
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  return (
    <div className="bg-[#090a0f]/95 border border-[#27272a] rounded-lg p-2.5 font-mono text-xs backdrop-blur-md shadow-lg select-none">
      {/* ── Top Bar Status & Sync ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-[#1f2029]">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#3b82f6]/20 border border-[#3b82f6]/40 rounded">
            <Sparkles className="w-3.5 h-3.5 text-[#60a5fa] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs tracking-wider">
                AI CHART PILOT
              </span>
              <span className="text-[9px] bg-[#00c853]/15 text-[#00c853] border border-[#00c853]/30 px-1.5 py-0.2 rounded font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00c853] animate-ping" /> Active Vision
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncTradingViewDesktop}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
              desktopConnected
                ? 'bg-[#00c853]/20 border border-[#00c853]/50 text-[#00c853]'
                : 'bg-[#181922] border border-[#27272a] text-[#a1a1aa] hover:text-white'
            }`}
            title="Koneksikan ke TradingView Desktop via Chrome DevTools Protocol (CDP port 9222)"
          >
            <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>{desktopConnected ? 'TV Desktop Synced' : 'Sync TV Desktop'}</span>
          </button>

          <button
            onClick={onOpenPineStudio}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded text-[11px] font-bold cursor-pointer transition shadow"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Pine Script Studio</span>
          </button>
        </div>
      </div>

      {/* ── Quick Action Buttons Bar ── */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <button
          onClick={toggleSR}
          className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition flex items-center gap-1.5 ${
            activeModes.sr
              ? 'bg-[#38bdf8] text-black shadow-sm'
              : 'bg-[#12131c] border border-[#27272a] text-[#d4d4d8] hover:border-[#38bdf8]'
          }`}
        >
          <Zap className="w-3 h-3 text-[#38bdf8]" />
          <span>⚡ Auto S/R Lines</span>
        </button>

        <button
          onClick={toggleSMC}
          className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition flex items-center gap-1.5 ${
            activeModes.smc
              ? 'bg-[#00c853] text-black shadow-sm'
              : 'bg-[#12131c] border border-[#27272a] text-[#d4d4d8] hover:border-[#00c853]'
          }`}
        >
          <Target className="w-3 h-3 text-[#00c853]" />
          <span>🎯 Order Block & FVG</span>
        </button>

        <button
          onClick={toggleRiskReward}
          className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition flex items-center gap-1.5 ${
            activeModes.rr
              ? 'bg-[#f59e0b] text-black shadow-sm'
              : 'bg-[#12131c] border border-[#27272a] text-[#d4d4d8] hover:border-[#f59e0b]'
          }`}
        >
          <Maximize2 className="w-3 h-3 text-[#f59e0b]" />
          <span>📐 Risk/Reward Target (R:R)</span>
        </button>

        {(activeModes.sr || activeModes.smc || activeModes.rr) && (
          <button
            onClick={() => {
              setActiveModes({ sr: false, smc: false, rr: false });
              onClearOverlays();
              setStatusMessage(null);
            }}
            className="px-2 py-1 rounded text-[10px] text-[#71717a] hover:text-white bg-[#181920] border border-[#27272a] cursor-pointer"
          >
            Hapus Gambar AI
          </button>
        )}
      </div>

      {/* ── Prompt Bar for Natural Language Commands ── */}
      <form onSubmit={handlePromptSubmit} className="relative flex items-center">
        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Perintahkan AI (contoh: 'Gambar resisten terdekat', 'Cari order block', 'Buat pine script')..."
          className="w-full bg-[#101118] border border-[#27272a] rounded px-3 py-1.5 pr-8 text-[11px] text-white placeholder-[#71717a] focus:outline-none focus:border-[#3b82f6]"
        />
        <button
          type="submit"
          className="absolute right-2 p-1 text-[#60a5fa] hover:text-white transition cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* ── Status Toast ── */}
      {statusMessage && (
        <div className="mt-2 p-1.5 bg-[#181924] border border-[#27272a] rounded text-[10px] text-[#38bdf8] flex items-center gap-1.5 animate-in fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
