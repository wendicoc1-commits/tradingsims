'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Cpu,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  DollarSign,
  Layers,
  ArrowRight,
  HelpCircle,
  BarChart3,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePortfolioStore } from '@/store';
import {
  SwarmSimulationResult,
  SwarmAgent,
  PRESET_SCENARIOS,
  PresetScenario,
} from '@/lib/hedgefund/swarmSimulationEngine';

interface SwarmSimulationWarRoomProps {
  symbol?: string;
  onSelectSymbol?: (sym: string) => void;
}

const POPULAR_TICKERS = ['BBCA', 'BBRI', 'BMRI', 'TLKM', 'ASII', 'GOTO', 'ANTM', 'BTC', 'ETH', 'SOL', 'NVDA'];

export default function SwarmSimulationWarRoom({
  symbol = 'BBCA',
  onSelectSymbol,
}: SwarmSimulationWarRoomProps) {
  const [activeSymbol, setActiveSymbol] = useState(symbol);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('rate_hike_50bps');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [simulationData, setSimulationData] = useState<SwarmSimulationResult | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<SwarmAgent | null>(null);
  const [activeRoundTab, setActiveRoundTab] = useState<number>(0);
  const [orderExecuted, setOrderExecuted] = useState(false);

  const placeBuyOrder = usePortfolioStore((s) => s.placeBuyOrder);

  // Sync prop changes
  useEffect(() => {
    if (symbol && symbol !== activeSymbol) {
      setActiveSymbol(symbol);
    }
  }, [symbol]);

  // Fetch or execute simulation
  const runSimulation = async (sym: string = activeSymbol, scenarioText?: string) => {
    setIsLoading(true);
    setOrderExecuted(false);
    setSelectedAgent(null);

    const promptToSend =
      scenarioText || (isCustomMode && customPrompt.trim() ? customPrompt.trim() : selectedPresetId);

    try {
      const res = await fetch('/api/ai/swarm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: sym,
          scenario: promptToSend,
          count: 50,
        }),
      });

      if (!res.ok) throw new Error('Gagal menjalankan simulasi Swarm');
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Terjadi kesalahan sistem Swarm');

      setSimulationData(json.data);
      if (json.data.agentRosterSample && json.data.agentRosterSample.length > 0) {
        setSelectedAgent(json.data.agentRosterSample[0]);
      }
      toast.success(
        `Simulasi 50 Agen Pasar untuk ${sym} selesai! Konsensus: ${json.data.consensusScore}/100 (${json.data.crowdState})`
      );
    } catch (err: any) {
      toast.error(err?.message || 'Error saat menjalankan simulasi swarm');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    runSimulation(activeSymbol);
  }, [activeSymbol]);

  const handlePresetSelect = (pId: string) => {
    setSelectedPresetId(pId);
    setIsCustomMode(false);
  };

  const handleTickerChange = (newTicker: string) => {
    setActiveSymbol(newTicker);
    if (onSelectSymbol) onSelectSymbol(newTicker);
  };

  const handleCopyOrder = () => {
    if (!simulationData) return;
    const price = simulationData.basePrice;
    const lots = simulationData.expectedPriceImpactPct > 0 ? 15 : 5;

    try {
      placeBuyOrder(simulationData.symbol, simulationData.name, price, lots, 'LIMIT');
      setOrderExecuted(true);
      toast.success(
        `Sukses menerapkan strategi Swarm: BUY ${lots} Lot ${simulationData.symbol} @ Rp ${price.toLocaleString('id-ID')}`
      );
    } catch (e: any) {
      toast.error(e?.message || 'Gagal menyalin order');
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'STRONG_BUY':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'ACCUMULATE':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'HOLD':
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      case 'TRIM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'PANIC_SELL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const getCrowdStateBadge = (state: string) => {
    switch (state) {
      case 'EUPHORIA':
        return {
          label: 'EUPHORIA EKSTREM (RETAIL PEAK)',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          desc: 'Kawanan retail mengejar harga secara membabi buta. Risiko jebakan bandar sangat tinggi.',
        };
      case 'SMART_ACCUMULATION':
        return {
          label: 'AKUMULASI BANDAR (SMART MONEY)',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          desc: 'Institusi diam-diam menyerap likuiditas diskon di tengah ketakutan publik.',
        };
      case 'DISTRIBUTION_TRAP':
        return {
          label: 'JEBAKAN DISTRIBUSI (FAKEOUT)',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          desc: 'Whale mendorong harga naik tipis hanya untuk melepas muatan besar ke antrean bid retail.',
        };
      case 'CAPITULATION':
        return {
          label: 'KAPITULASI PANIK (BOTTOMING)',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          desc: 'Aksi jual panik massal. Seringkali menjadi sinyal pembalikan arah jangka menengah.',
        };
      default:
        return {
          label: 'KONSOLIDASI NETRAL',
          color: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          desc: 'Kekuatan pembeli dan penjual seimbang dalam rentang harga sideways.',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-zinc-950 via-indigo-950/20 to-zinc-950 p-6 backdrop-blur-xl">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                MiroFish Multi-Agent Swarm Intelligence
              </span>
              <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 text-xs text-zinc-400">
                50 Autonomous Agents • 3-Round Diffusion
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
              War Room: Simulasi Reaksi Kawanan Pasar
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">
              Uji ketahanan portofolio Anda terhadap guncangan makro, panic dump, dan skenario ekstrim.
              Mesin mensimulasikan dinamika 50 agen heterogen (Retail FOMO, Smart Money, HFT Scalper, dan Contrarian Munger)
              untuk memprediksi ekuilibrium harga sebelum terjadi di bursa nyata.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => runSimulation()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Activity className="h-4 w-4 animate-spin" />
                  Mensimulasikan 50 Agen...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  Jalankan Simulasi Swarm
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Ticker Chips */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-zinc-800/80 pt-4">
          <span className="text-xs font-medium text-zinc-400">Pilih Aset:</span>
          {POPULAR_TICKERS.map((t) => (
            <button
              key={t}
              onClick={() => handleTickerChange(t)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                activeSymbol === t
                  ? 'border border-indigo-500 bg-indigo-500/20 text-white shadow'
                  : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── SCENARIO CONTROLLER ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Skenario Guncangan Pasar ("What-If" Stress Test)
          </h3>
          <button
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="text-xs text-indigo-400 hover:underline"
          >
            {isCustomMode ? 'Pilih dari Preset Skenario Standar' : '+ Tulis Skenario Kustom Bebas'}
          </button>
        </div>

        {!isCustomMode ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {PRESET_SCENARIOS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                    isSelected
                      ? 'border-indigo-500/80 bg-indigo-500/10 ring-1 ring-indigo-500/40'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-bold text-white">{preset.label}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        preset.impactVector > 0
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {preset.impactVector > 0 ? `+Shock` : `-Shock`}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2">{preset.description}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Contoh: Emiten mengumumkan pembagian dividen jumbo 12% dan akuisisi tambang emas baru, namun rupiah melemah ke 16.500 per USD..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                onClick={() => runSimulation(activeSymbol, customPrompt)}
                disabled={isLoading || !customPrompt.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Uji Skenario Kustom Ini
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── SIMULATION OUTCOME DASHBOARD ── */}
      {simulationData && (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Consensus Score */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase tracking-wider">Konsensus Swarm</span>
                <Users className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`text-3xl font-black ${
                    simulationData.consensusScore >= 65
                      ? 'text-emerald-400'
                      : simulationData.consensusScore <= 35
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {simulationData.consensusScore}
                </span>
                <span className="text-xs text-zinc-500">/ 100</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    simulationData.consensusScore >= 65
                      ? 'bg-emerald-500'
                      : simulationData.consensusScore <= 35
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${simulationData.consensusScore}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-zinc-400">
                {simulationData.consensusScore >= 65
                  ? 'Mayoritas agen condong melakukan aksi akumulasi/beli.'
                  : simulationData.consensusScore <= 35
                  ? 'Sentimen panik mendominasi ruang simulasi.'
                  : 'Orderflow terbelah, pelaku pasar defensif.'}
              </p>
            </div>

            {/* Expected Price Impact */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase tracking-wider">Dampak Harga Tertaksir</span>
                <Activity className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`text-3xl font-black ${
                    simulationData.expectedPriceImpactPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {simulationData.expectedPriceImpactPct >= 0 ? '+' : ''}
                  {simulationData.expectedPriceImpactPct.toFixed(2)}%
                </span>
              </div>
              <div className="mt-2 text-xs text-zinc-400">
                Rentang Konfidensi 95%:
                <span className="ml-1 font-mono text-white">
                  [{simulationData.confidenceInterval.lowPct >= 0 ? '+' : ''}
                  {simulationData.confidenceInterval.lowPct.toFixed(1)}% s/d{' '}
                  {simulationData.confidenceInterval.highPct >= 0 ? '+' : ''}
                  {simulationData.confidenceInterval.highPct.toFixed(1)}%]
                </span>
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                Estimasi pergeseran harga penutupan berdasarkan order imbalance.
              </p>
            </div>

            {/* Crowd Psychology State */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase tracking-wider">Fase Psikologi Pasar</span>
                <Flame className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-2">
                {(() => {
                  const badge = getCrowdStateBadge(simulationData.crowdState);
                  return (
                    <span
                      className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-bold ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                {getCrowdStateBadge(simulationData.crowdState).desc}
              </p>
            </div>

            {/* Whale Trap Risk */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase tracking-wider">Risiko Whale Trap</span>
                {simulationData.whaleTrapProbability >= 50 ? (
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`text-3xl font-black ${
                    simulationData.whaleTrapProbability >= 50 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {simulationData.whaleTrapProbability}%
                </span>
                <span className="text-xs text-zinc-500">Probabilitas</span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    simulationData.whaleTrapProbability >= 50 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${simulationData.whaleTrapProbability}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-zinc-400">
                {simulationData.whaleTrapProbability >= 50
                  ? 'Waspada: Smart money terdeteksi berlawanan arah dengan ritel.'
                  : 'Aman: Pola akumulasi terverifikasi organik tanpa indikasi jebakan.'}
              </p>
            </div>
          </div>

          {/* ── 50-AGENT VISUAL MATRIX & INSPECTOR ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Swarm Grid Matrix (Left 2 cols) */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-xl lg:col-span-2">
              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-base font-bold text-white">Matriks 50 Agen Pasar Otonom</h3>
                  <p className="text-xs text-zinc-400">
                    Klik salah satu agen untuk menginspeksi buku pesanan, profil modal, dan alasan keputusannya.
                  </p>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Beli Kuat
                  </span>
                  <span className="flex items-center gap-1 text-teal-300">
                    <span className="h-2 w-2 rounded-full bg-teal-500" /> Akumulasi
                  </span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <span className="h-2 w-2 rounded-full bg-zinc-600" /> Tahan
                  </span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Jual Parsial
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> Panik Jual
                  </span>
                </div>
              </div>

              {/* Grid of 50 Agents */}
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {Array.from({ length: 50 }).map((_, idx) => {
                  const sampleAgent =
                    simulationData.agentRosterSample[idx % simulationData.agentRosterSample.length];
                  const isSelected = selectedAgent?.id === sampleAgent?.id;

                  let dotColor = 'bg-zinc-600 hover:ring-zinc-400';
                  if (sampleAgent?.currentAction === 'STRONG_BUY') dotColor = 'bg-emerald-500 hover:ring-emerald-400 shadow-emerald-500/50 shadow-sm';
                  else if (sampleAgent?.currentAction === 'ACCUMULATE') dotColor = 'bg-teal-400 hover:ring-teal-300';
                  else if (sampleAgent?.currentAction === 'TRIM') dotColor = 'bg-amber-500 hover:ring-amber-400';
                  else if (sampleAgent?.currentAction === 'PANIC_SELL') dotColor = 'bg-rose-500 hover:ring-rose-400 shadow-rose-500/50 shadow-sm';

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedAgent(sampleAgent)}
                      className={`group relative flex h-11 w-full flex-col items-center justify-center rounded-xl border p-1 transition-all ${
                        isSelected
                          ? 'border-white bg-indigo-500/20 ring-2 ring-indigo-400'
                          : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-600 hover:bg-zinc-900'
                      }`}
                    >
                      <div className={`h-3 w-3 rounded-full transition-transform group-hover:scale-125 ${dotColor}`} />
                      <span className="mt-1 font-mono text-[9px] text-zinc-500 group-hover:text-zinc-300">
                        #{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Archetype Composition Bar */}
              <div className="mt-5 border-t border-zinc-800 pt-4">
                <span className="text-xs font-semibold text-zinc-400">Komposisi Populasi Swarm:</span>
                <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full">
                  <div className="bg-indigo-500" style={{ width: '40%' }} title="Retail FOMO (40%)" />
                  <div className="bg-emerald-500" style={{ width: '25%' }} title="Smart Money Institutional (25%)" />
                  <div className="bg-cyan-500" style={{ width: '20%' }} title="HFT & Scalper Bots (20%)" />
                  <div className="bg-amber-500" style={{ width: '15%' }} title="Munger Contrarian Value (15%)" />
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" /> 40% Retail FOMO
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> 25% Smart Money
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" /> 20% HFT Scalper
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> 15% Contrarian
                  </span>
                </div>
              </div>
            </div>

            {/* Agent Inspector Card (Right col) */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-xl">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Inspektor Agen Otonom
                  </h4>
                  <span className="font-mono text-xs text-indigo-400">{selectedAgent?.id || 'agent-1'}</span>
                </div>

                {selectedAgent ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h5 className="text-base font-bold text-white">{selectedAgent.name}</h5>
                      <span className="mt-1 inline-block rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-300">
                        Tipe: {selectedAgent.archetype.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Estimasi Modal:</span>
                        <span className="font-mono font-semibold text-white">
                          Rp {selectedAgent.capitalSize.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Toleransi Risiko:</span>
                        <span className="font-mono font-semibold text-white">
                          {Math.round(selectedAgent.riskTolerance * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Kecepatan Respon:</span>
                        <span className="font-mono font-semibold text-white">
                          {selectedAgent.reactionSpeedMs} ms
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-zinc-800">
                        <span className="text-zinc-500">Keputusan T2:</span>
                        <span
                          className={`rounded border px-2 py-0.5 text-[10px] font-bold ${getActionBadgeColor(
                            selectedAgent.currentAction
                          )}`}
                        >
                          {selectedAgent.currentAction.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-zinc-400">Logika Internal Agen:</span>
                      <p className="mt-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs leading-relaxed italic text-zinc-300">
                        "{selectedAgent.lastReasoning}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-zinc-500">
                    Pilih agen pada matriks untuk membaca buku logikanya.
                  </div>
                )}
              </div>

              {/* Action Recommendation */}
              <div className="mt-5 border-t border-zinc-800 pt-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Panduan Strategis Swarm:
                </span>
                <div className="mt-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span className="text-xs font-bold text-white">
                      {simulationData.actionRecommendation.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopyOrder}
                  disabled={orderExecuted}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
                >
                  {orderExecuted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Order Tersinkron ke Portofolio
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                      Salin Order ke Simulasi Virtual
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── 3-ROUND DIFFUSION TIMELINE ── */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-xl">
            <h3 className="text-base font-bold text-white">
              Evolusi Difusi Sentimen: 3 Babak Simulasi Pasar
            </h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              Bagaimana kepanikan dan gairah merambat dari respon algoritma awal hingga terbentuknya ekuilibrium harga baru.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {simulationData.rounds.map((round) => (
                <div
                  key={round.round}
                  className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-700"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">{round.timestamp}</span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          round.simulatedPriceChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {round.simulatedPriceChangePct >= 0 ? '+' : ''}
                        {round.simulatedPriceChangePct.toFixed(2)}%
                      </span>
                    </div>

                    <h5 className="mt-2 text-xs font-bold text-white">{round.label}</h5>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{round.narrativePulse}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-800/60 pt-2 text-[11px] text-zinc-500">
                    <span>🟢 {round.buyCount} Beli</span>
                    <span>🔴 {round.sellCount} Jual</span>
                    <span>⚪ {round.holdCount} Tahan</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── C-SUITE EXECUTIVE REACTIONS ── */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                Tanggapan Dewan Direksi C-Suite terhadap Simulasi Swarm
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">
              Evaluasi mendalam oleh persona eksekutif AI TradeSims Pro atas temuan matriks agen.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Bezos */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Jeff Bezos (CEO)</span>
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                    {simulationData.cSuiteVerdicts.bezos.vote}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                  "{simulationData.cSuiteVerdicts.bezos.insight}"
                </p>
              </div>

              {/* Munger */}
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300">Charlie Munger (CRO)</span>
                  <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">
                    {simulationData.cSuiteVerdicts.munger.vote}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                  "{simulationData.cSuiteVerdicts.munger.insight}"
                </p>
              </div>

              {/* Vogels */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">Werner Vogels (CTO)</span>
                  <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                    {simulationData.cSuiteVerdicts.vogels.vote}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                  "{simulationData.cSuiteVerdicts.vogels.insight}"
                </p>
              </div>

              {/* Godin */}
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300">Seth Godin (CMO)</span>
                  <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300">
                    {simulationData.cSuiteVerdicts.godin.vote}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                  "{simulationData.cSuiteVerdicts.godin.insight}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
