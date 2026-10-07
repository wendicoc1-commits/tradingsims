'use client';

import React, { useState, useMemo } from 'react';
import {
  Gauge,
  TrendingUp,
  TrendingDown,
  Coins,
  ShieldCheck,
  Building2,
  DollarSign,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Layers,
  Calculator,
  Flame,
  Info,
} from 'lucide-react';
import CompanyLogo from '@/components/common/CompanyLogo';

interface ValuationFramework {
  symbol: string;
  name: string;
  sector: string;
  marketPrice: number;
  currency: string;
  // Metric Inputs
  epsLTM: number;
  bvps: number;
  dps: number;
  fcfPerShare: number;
  roe: number; // %
  wacc: number; // % Discount rate
  growthRate5Y: number; // %
  terminalGrowth: number; // %
  pbvMean3Y: number;
  perMean3Y: number;
  // Model Calculations
  dcfFairValue: number;
  grahamNumber: number;
  pbvHistoricalValue: number;
  ddmGordonValue: number;
  consensusFairValue: number;
  upsidePotential: number; // %
  valuationBand: 'DEEP_DISCOUNT' | 'UNDERVALUED' | 'FAIR_VALUE' | 'OVERVALUED';
  catalysts: string[];
}

export const BLOOMBERG_VALUATION_PROFILES: Record<string, ValuationFramework> = {
  BMRI: {
    symbol: 'BMRI',
    name: 'PT Bank Mandiri (Persero) Tbk',
    sector: 'Financials / Banking',
    marketPrice: 4030,
    currency: 'IDR',
    epsLTM: 590.2,
    bvps: 2780.0,
    dps: 353.95,
    fcfPerShare: 620.0,
    roe: 21.8,
    wacc: 9.5,
    growthRate5Y: 10.5,
    terminalGrowth: 4.5,
    pbvMean3Y: 1.85,
    perMean3Y: 10.2,
    dcfFairValue: 5150,
    grahamNumber: 6075,
    pbvHistoricalValue: 5143,
    ddmGordonValue: 4890,
    consensusFairValue: 5120,
    upsidePotential: 27.05,
    valuationBand: 'UNDERVALUED',
    catalysts: [
      'Cum-Date dividen tunai Rp 353,95/lembar (Yield 8,78%) hari ini',
      'Pertumbuhan kredit digital Livin & Kopra tumbuh +18% YoY',
      'ROE konsisten di atas 21% dengan kualitas aset NPL terjaga 1.02%',
    ],
  },
  BBCA: {
    symbol: 'BBCA',
    name: 'PT Bank Central Asia Tbk',
    sector: 'Financials / Banking',
    marketPrice: 6100,
    currency: 'IDR',
    epsLTM: 472.0,
    bvps: 2240.0,
    dps: 270.0,
    fcfPerShare: 490.0,
    roe: 22.4,
    wacc: 8.5,
    growthRate5Y: 9.0,
    terminalGrowth: 4.5,
    pbvMean3Y: 3.80,
    perMean3Y: 18.5,
    dcfFairValue: 7200,
    grahamNumber: 4875,
    pbvHistoricalValue: 8512,
    ddmGordonValue: 6750,
    consensusFairValue: 7150,
    upsidePotential: 17.21,
    valuationBand: 'UNDERVALUED',
    catalysts: [
      'CASA Ratio tertinggi di perbankan ASEAN (82,4%) memastikan CoF super rendah',
      'Dividen interim Oktober 2026 stabil dengan rekam jejak 20+ tahun',
      'Kolektibilitas kredit teruji paling tangguh di segala siklus ekonomi',
    ],
  },
  ADRO: {
    symbol: 'ADRO',
    name: 'PT Adaro Energy Indonesia Tbk',
    sector: 'Energy / Coal & Minerals',
    marketPrice: 2500,
    currency: 'IDR',
    epsLTM: 362.5,
    bvps: 2150.0,
    dps: 580.0,
    fcfPerShare: 720.0,
    roe: 19.5,
    wacc: 11.0,
    growthRate5Y: 4.0,
    terminalGrowth: 2.0,
    pbvMean3Y: 1.45,
    perMean3Y: 6.8,
    dcfFairValue: 3350,
    grahamNumber: 4185,
    pbvHistoricalValue: 3117,
    ddmGordonValue: 3200,
    consensusFairValue: 3380,
    upsidePotential: 35.20,
    valuationBand: 'DEEP_DISCOUNT',
    catalysts: [
      'Valuasi PER di bawah 7x dengan arus kas kas operasional tebal',
      'Rencana dividen spesial jumbo dari aksi korporasi spin-off AAI',
      'Ekspansi smelter aluminium hijau Kaltara mulai berkontribusi 2027',
    ],
  },
  ASII: {
    symbol: 'ASII',
    name: 'PT Astra International Tbk',
    sector: 'Industrials / Automotive',
    marketPrice: 4630,
    currency: 'IDR',
    epsLTM: 739.0,
    bvps: 4980.0,
    dps: 421.0,
    fcfPerShare: 780.0,
    roe: 15.2,
    wacc: 10.0,
    growthRate5Y: 5.5,
    terminalGrowth: 3.5,
    pbvMean3Y: 1.25,
    perMean3Y: 7.8,
    dcfFairValue: 5850,
    grahamNumber: 9100,
    pbvHistoricalValue: 6225,
    ddmGordonValue: 5600,
    consensusFairValue: 5900,
    upsidePotential: 27.43,
    valuationBand: 'UNDERVALUED',
    catalysts: [
      'Valuasi PBV berada di level 0.93x (di bawah mean historis 10 tahun)',
      'Dividen interim Oktober 2026 dengan estimasi yield > 8.0%',
      'Diversifikasi solid pada sektor tambang emas (Agincourt) dan infrastruktur',
    ],
  },
  PTBA: {
    symbol: 'PTBA',
    name: 'PT Bukit Asam Tbk',
    sector: 'Energy / Coal Mining',
    marketPrice: 3180,
    currency: 'IDR',
    epsLTM: 412.0,
    bvps: 1850.0,
    dps: 397.0,
    fcfPerShare: 310.0,
    roe: 22.0,
    wacc: 11.5,
    growthRate5Y: 3.0,
    terminalGrowth: 2.0,
    pbvMean3Y: 1.70,
    perMean3Y: 7.2,
    dcfFairValue: 3250,
    grahamNumber: 4140,
    pbvHistoricalValue: 3145,
    ddmGordonValue: 3300,
    consensusFairValue: 3260,
    upsidePotential: 2.52,
    valuationBand: 'FAIR_VALUE',
    catalysts: [
      'Dividen yield dua digit (12.48%) sebagai BUMN tambang',
      'Harga saham saat ini berada di sekitar fair value konsensus',
    ],
  },
};

export default function BloombergFairValueCompass() {
  const [selectedStock, setSelectedStock] = useState<string>('BMRI');

  const profile = BLOOMBERG_VALUATION_PROFILES[selectedStock] || BLOOMBERG_VALUATION_PROFILES['BMRI'];

  const getBadge = (band: ValuationFramework['valuationBand']) => {
    switch (band) {
      case 'DEEP_DISCOUNT':
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 animate-pulse">DEEP DISCOUNT (Diskon Besar)</span>;
      case 'UNDERVALUED':
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">UNDERVALUED (Murah)</span>;
      case 'FAIR_VALUE':
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">FAIR VALUE (Harga Wajar)</span>;
      case 'OVERVALUED':
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">OVERVALUED (Kemahalan)</span>;
    }
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Ticker Selector Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-zinc-400 font-semibold mr-1 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-amber-400" /> Terminal Equities:
          </span>
          {Object.keys(BLOOMBERG_VALUATION_PROFILES).map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => setSelectedStock(sym)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedStock === sym
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'bg-zinc-800/60 text-zinc-300 hover:text-white'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>

        <div className="text-xs text-zinc-400">
          Terminal Mode: <span className="text-amber-400 font-bold">Bloomberg Multi-Model Fair Value &lt;FA COMP&gt;</span>
        </div>
      </div>

      {/* Main Fair Value Compass Card */}
      <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <CompanyLogo symbol={profile.symbol} name={profile.name} size={48} rounded="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">{profile.symbol}</h2>
                {getBadge(profile.valuationBand)}
              </div>
              <p className="text-xs text-zinc-400">{profile.name} &bull; {profile.sector}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Harga Pasar Terkini</div>
              <div className="text-xl font-mono-num font-bold text-white">
                Rp {profile.marketPrice.toLocaleString('id-ID')}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Harga Wajar Konsensus</div>
              <div className="text-xl font-mono-num font-bold text-amber-400">
                Rp {profile.consensusFairValue.toLocaleString('id-ID')}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Potensi Upside (Margin of Safety)</div>
              <div className={`text-xl font-mono-num font-bold ${profile.upsidePotential >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {profile.upsidePotential >= 0 ? `+${profile.upsidePotential.toFixed(1)}%` : `${profile.upsidePotential.toFixed(1)}%`}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Models Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          {/* Model 1: DCF */}
          <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Discounted Cash Flow</span>
              <span className="text-amber-400 font-bold">DCF</span>
            </div>
            <div className="text-lg font-mono-num font-bold text-white mt-1">
              Rp {profile.dcfFairValue.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              WACC: {profile.wacc}% &bull; Growth: {profile.growthRate5Y}%
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-bold">
              +{( ((profile.dcfFairValue - profile.marketPrice) / profile.marketPrice) * 100 ).toFixed(1)}% vs Pasar
            </div>
          </div>

          {/* Model 2: Graham Number */}
          <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Benjamin Graham Value</span>
              <span className="text-blue-400 font-bold">&radic;(22.5 &times; EPS &times; BV)</span>
            </div>
            <div className="text-lg font-mono-num font-bold text-white mt-1">
              Rp {profile.grahamNumber.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              EPS: Rp {profile.epsLTM} &bull; BVPS: Rp {profile.bvps}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-bold">
              +{( ((profile.grahamNumber - profile.marketPrice) / profile.marketPrice) * 100 ).toFixed(1)}% vs Pasar
            </div>
          </div>

          {/* Model 3: Historical PBV Band */}
          <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Historical PBV Band</span>
              <span className="text-purple-400 font-bold">Mean 3Y</span>
            </div>
            <div className="text-lg font-mono-num font-bold text-white mt-1">
              Rp {profile.pbvHistoricalValue.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Mean PBV: {profile.pbvMean3Y}x
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-bold">
              +{( ((profile.pbvHistoricalValue - profile.marketPrice) / profile.marketPrice) * 100 ).toFixed(1)}% vs Pasar
            </div>
          </div>

          {/* Model 4: DDM Gordon Growth */}
          <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Gordon Dividend Model</span>
              <span className="text-emerald-400 font-bold">DDM</span>
            </div>
            <div className="text-lg font-mono-num font-bold text-white mt-1">
              Rp {profile.ddmGordonValue.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              DPS: Rp {profile.dps} &bull; Ke: {profile.wacc}%
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-bold">
              +{( ((profile.ddmGordonValue - profile.marketPrice) / profile.marketPrice) * 100 ).toFixed(1)}% vs Pasar
            </div>
          </div>
        </div>

        {/* Catalysts & Investment Thesis */}
        <div className="mt-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs">
          <div className="font-bold text-zinc-200 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Katalis Kunci Pendorong Harga Wajar (Investment Thesis):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-zinc-300">
            {profile.catalysts.map((cat, idx) => (
              <li key={idx}>{cat}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
