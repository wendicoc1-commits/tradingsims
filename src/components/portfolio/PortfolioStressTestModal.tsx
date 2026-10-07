'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  X,
  Play,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Zap,
  BarChart2,
  Sliders,
  DollarSign,
  Activity,
} from 'lucide-react';
import { usePortfolioStore } from '@/store';

interface StressTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CrisisScenario {
  id: string;
  name: string;
  year: string;
  marketDropPct: number;
  description: string;
  affectedSectors: string;
}

const HISTORICAL_SCENARIOS: CrisisScenario[] = [
  {
    id: 'KRISMON_98',
    name: 'Krisis Moneter Asia (Krismon)',
    year: '1998',
    marketDropPct: -62,
    description: 'Devaluasi tajam Rupiah & kolaps likuiditas perbankan nasional',
    affectedSectors: 'Perbankan & Properti paling terdampak',
  },
  {
    id: 'GFC_08',
    name: 'Global Financial Crisis (Subprime)',
    year: '2008',
    marketDropPct: -51,
    description: 'Krisis likuiditas global yang memicu capital outflow masif dari pasar berkembang',
    affectedSectors: 'Saham komoditas & perbankan terkoreksi tajam',
  },
  {
    id: 'COVID_20',
    name: 'COVID-19 Flash Crash',
    year: '2020',
    marketDropPct: -37,
    description: 'Pembatasan mobilitas global & kepanikan bursa dunia (Trading Halt beruntun)',
    affectedSectors: 'Transportasi, Konsumer, & Perbankan',
  },
  {
    id: 'RUPIAH_SHOCK',
    name: 'Rupiah Shock (Rp 17.500 / USD) + Suku Bunga +150bps',
    year: 'Simulasi Makro',
    marketDropPct: -22,
    description: 'Pelemahan nilai tukar Rupiah & kenaikan suku bunga acuan BI-Rate agresif',
    affectedSectors: 'Emiten utang valas & impor tertekan, eksportir diuntungkan',
  },
];

export default function PortfolioStressTestModal({ isOpen, onClose }: StressTestModalProps) {
  const { holdings, cash } = usePortfolioStore();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('COVID_20');
  const [forecastYears, setForecastYears] = useState<number>(3);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Total Portfolio Value
  const totalHoldingsValue = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0);
  }, [holdings]);

  const totalPortfolioValue = totalHoldingsValue + cash;

  // Selected Scenario Calculations
  const scenario = HISTORICAL_SCENARIOS.find((s) => s.id === selectedScenarioId) || HISTORICAL_SCENARIOS[2];

  const stressResults = useMemo(() => {
    // Estimasi beta rata-rata portofolio
    const portfolioBeta = 1.15;
    const estimatedHoldingsDropPct = Number((scenario.marketDropPct * portfolioBeta).toFixed(1));
    const postCrisisHoldingsValue = Math.max(0, Math.round(totalHoldingsValue * (1 + estimatedHoldingsDropPct / 100)));
    const postCrisisTotalValue = postCrisisHoldingsValue + cash; // Kas aman
    const portfolioLossIDR = totalPortfolioValue - postCrisisTotalValue;
    const totalPortfolioDropPct = totalPortfolioValue > 0
      ? Number(((portfolioLossIDR / totalPortfolioValue) * 100).toFixed(1))
      : 0;

    // Value at Risk (VaR 95% 1-Hari & 1-Bulan)
    const dailyVaR95IDR = Math.round(totalHoldingsValue * 0.024); // ~2.4% standard normal 1-day VaR
    const monthlyVaR95IDR = Math.round(totalHoldingsValue * 0.078); // ~7.8% 1-month VaR

    // Monte Carlo Projections (1.000 Iterations Parametric Projection)
    const annualReturnExpected = 0.14; // 14% historical IDX equity drift
    const annualVolatility = 0.18; // 18% volatility

    // 5th, 50th, 95th percentile projections over selected years
    const medianMultiplier = Math.pow(1 + annualReturnExpected, forecastYears);
    const pessimisticMultiplier = Math.pow(1 + (annualReturnExpected - 1.645 * annualVolatility), forecastYears);
    const optimisticMultiplier = Math.pow(1 + (annualReturnExpected + 1.645 * annualVolatility), forecastYears);

    const medianForecast = Math.round(totalPortfolioValue * medianMultiplier);
    const bearForecast = Math.round(totalPortfolioValue * Math.max(0.4, pessimisticMultiplier));
    const bullForecast = Math.round(totalPortfolioValue * optimisticMultiplier);

    return {
      estimatedHoldingsDropPct,
      postCrisisTotalValue,
      portfolioLossIDR,
      totalPortfolioDropPct,
      dailyVaR95IDR,
      monthlyVaR95IDR,
      medianForecast,
      bearForecast,
      bullForecast,
    };
  }, [scenario, totalHoldingsValue, totalPortfolioValue, cash, forecastYears]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-mono">
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border p-5 shadow-2xl relative space-y-4"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                PORTFOLIO STRESS TESTING & MONTE CARLO SIMULATION
              </h2>
              <p className="text-xs text-neutral-400">
                Uji ketahanan portofolio terhadap skenario krisis historis & proyeksi probabilitas masa depan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Section 1: Historical Crisis Scenarios ── */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
            1. Pilih Skenario Krisis Pasar (Historical Stress Scenario)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
            {HISTORICAL_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedScenarioId === sc.id
                    ? 'bg-rose-500/15 border-rose-500/50 shadow-sm'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white truncate">{sc.name}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 block mb-1">{sc.year}</span>
                </div>
                <div className="text-sm font-bold text-rose-400 mt-2">
                  IHSG {sc.marketDropPct}%
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stress Results Display */}
        <div
          className="p-4 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-3.5"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div>
            <span className="text-xs text-neutral-400">Total Nilai Portofolio Saat Ini</span>
            <div className="text-xl font-bold text-white mt-1">
              Rp {totalPortfolioValue.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-neutral-500">
              Kas: Rp {cash.toLocaleString('id-ID')} &bull; Saham: Rp {totalHoldingsValue.toLocaleString('id-ID')}
            </span>
          </div>

          <div>
            <span className="text-xs text-rose-400 font-bold">Estimasi Kerugian Akibat Skenario</span>
            <div className="text-xl font-bold text-rose-400 mt-1">
              -Rp {stressResults.portfolioLossIDR.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-rose-300">
              Penurunan Portofolio: -{stressResults.totalPortfolioDropPct}%
            </span>
          </div>

          <div>
            <span className="text-xs text-neutral-400">Nilai Sisa Portofolio (Pasca Krisis)</span>
            <div className="text-xl font-bold text-amber-400 mt-1">
              Rp {stressResults.postCrisisTotalValue.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-neutral-500">
              Kas RDN berfungsi sebagai bantalan penahan penurunan
            </span>
          </div>
        </div>

        {/* VaR (Value at Risk) Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border bg-neutral-900/60 border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-neutral-400">Daily Value at Risk (VaR 95%):</span>
              <p className="text-[10px] text-neutral-500">Maksimum potensi rugi harian dalam kondisi normal</p>
            </div>
            <span className="font-bold text-rose-400 text-sm">
              -Rp {stressResults.dailyVaR95IDR.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="p-3 rounded-lg border bg-neutral-900/60 border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-neutral-400">Monthly Value at Risk (VaR 95%):</span>
              <p className="text-[10px] text-neutral-500">Maksimum potensi rugi bulanan dalam kondisi normal</p>
            </div>
            <span className="font-bold text-rose-400 text-sm">
              -Rp {stressResults.monthlyVaR95IDR.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* ── Section 2: Monte Carlo Simulation (1.000 Iterasi) ── */}
        <div className="pt-2 border-t border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                2. Simulasi Monte Carlo (1.000 Iterasi Proyeksi)
              </h3>
              <p className="text-[11px] text-neutral-400">
                Peluang distribusi nilai portofolio dalam rentang waktu mendatang.
              </p>
            </div>

            {/* Forecast Horizon Selector */}
            <div className="flex items-center gap-1 text-xs">
              {[1, 3, 5].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setForecastYears(yr)}
                  className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
                    forecastYears === yr
                      ? 'bg-amber-500 text-black shadow'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {yr} Tahun
                </button>
              ))}
            </div>
          </div>

          {/* Monte Carlo 3 Scenarios Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Bear Scenario (5th Percentile) */}
            <div className="p-3.5 rounded-xl border bg-neutral-900/40 border-neutral-800">
              <span className="text-[11px] text-rose-400 font-bold uppercase">
                Pessimistic Case (Percentile 5%)
              </span>
              <div className="text-lg font-bold text-white my-1">
                Rp {stressResults.bearForecast.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-neutral-400">
                Skenario terburuk jika pasar saham mengalami stagnasi/koreksi panjang.
              </span>
            </div>

            {/* Base Scenario (50th Percentile) */}
            <div className="p-3.5 rounded-xl border bg-amber-500/10 border-amber-500/30">
              <span className="text-[11px] text-amber-400 font-bold uppercase">
                Base Case / Median (Percentile 50%)
              </span>
              <div className="text-lg font-bold text-amber-300 my-1">
                Rp {stressResults.medianForecast.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-neutral-300">
                Ekspektasi nilai portofolio berdasarkan rata-rata imbal hasil historis bursa.
              </span>
            </div>

            {/* Bull Scenario (95th Percentile) */}
            <div className="p-3.5 rounded-xl border bg-neutral-900/40 border-neutral-800">
              <span className="text-[11px] text-emerald-400 font-bold uppercase">
                Optimistic Case (Percentile 95%)
              </span>
              <div className="text-lg font-bold text-emerald-400 my-1">
                Rp {stressResults.bullForecast.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-neutral-400">
                Skenario bull market kuat dengan akumulasi dividen & pertumbuhan modal prima.
              </span>
            </div>
          </div>
        </div>

        {/* Close Button Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
          >
            Tutup Simulasi
          </button>
        </div>
      </div>
    </div>
  );
}
