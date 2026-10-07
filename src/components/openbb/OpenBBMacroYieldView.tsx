'use client';

import React from 'react';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { getOpenBBFredMacro, OpenBBFredMacro } from '@/lib/openbb/service';

export default function OpenBBMacroYieldView() {
  const macro: OpenBBFredMacro = getOpenBBFredMacro();

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Sub-Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#09090b] border border-[#27272a] rounded-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#a855f7]/10 border border-[#a855f7]/30 rounded">
            <Globe className="w-5 h-5 text-[#c084fc]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs tracking-wide">
                FEDERAL RESERVE (FRED) YIELD CURVE &amp; MAKROEKONOMI
              </span>
              <span className="text-[10px] bg-[#18181b] border border-[#27272a] text-[#c084fc] px-1.5 py-0.5 rounded font-bold">
                OPENBB &bull; ST. LOUIS FED GATEWAY
              </span>
            </div>
            <p className="text-[11px] text-[#71717a]">
              Struktur suku bunga US Treasury (1M s/d 30Y), deteksi inversi yield curve, dan indikator inflasi CPI/PCE.
            </p>
          </div>
        </div>

        {/* Inversion Status */}
        <div className={`px-3 py-1.5 rounded border text-xs font-bold flex items-center gap-1.5 ${
          macro.isInverted
            ? 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]'
            : 'bg-[#22c55e]/10 border-[#22c55e]/40 text-[#22c55e]'
        }`}>
          {macro.isInverted ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          <span>{macro.isInverted ? 'YIELD CURVE INVERTED (2Y-10Y: ' + macro.inversionSpread2Y10Y + '%)' : 'NORMAL CURVE'}</span>
        </div>
      </div>

      {/* ── Macro Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 bg-[#0e0e12] border border-[#27272a] rounded">
          <div className="text-[10px] text-[#71717a]">Federal Funds Rate</div>
          <div className="text-sm font-bold text-white mt-0.5">{macro.fedFundsRate}%</div>
          <div className="text-[9px] text-[#71717a]">Suku Bunga Acuan The Fed</div>
        </div>
        <div className="p-2.5 bg-[#0e0e12] border border-[#27272a] rounded">
          <div className="text-[10px] text-[#71717a]">US Headline CPI Inflation</div>
          <div className="text-sm font-bold text-[#f59e0b] mt-0.5">{macro.cpiYoY}% YoY</div>
          <div className="text-[9px] text-[#71717a]">Indeks Harga Konsumen</div>
        </div>
        <div className="p-2.5 bg-[#0e0e12] border border-[#27272a] rounded">
          <div className="text-[10px] text-[#71717a]">Core PCE Deflator</div>
          <div className="text-sm font-bold text-[#22c55e] mt-0.5">{macro.corePceYoY}% YoY</div>
          <div className="text-[9px] text-[#22c55e]">Target Target Fed (2.0%)</div>
        </div>
        <div className="p-2.5 bg-[#0e0e12] border border-[#27272a] rounded">
          <div className="text-[10px] text-[#71717a]">Pertumbuhan PDB Riil (GDP)</div>
          <div className="text-sm font-bold text-white mt-0.5">+{macro.realGdpGrowth}%</div>
          <div className="text-[9px] text-[#71717a]">Ekspansi Ekonomi AS</div>
        </div>
      </div>

      {/* ── US Treasury Curve Table & Visualizer ── */}
      <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-sm space-y-3">
        <div className="text-xs font-bold text-white flex items-center justify-between">
          <span>STRUKTUR KURVA YIELD US TREASURY (MATURITAS 1M - 30Y)</span>
          <span className="text-[10px] text-[#71717a]">Sumber: U.S. Department of the Treasury</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {macro.treasuryYields.map((y) => (
            <div key={y.maturity} className="p-2 bg-[#121216] border border-[#27272a] rounded text-center">
              <div className="text-[10px] text-[#71717a] font-bold">{y.maturity}</div>
              <div className="text-sm font-black text-white mt-0.5">{y.yieldPct}%</div>
              <div className="h-1 w-full bg-[#18181b] rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-[#c084fc] h-full"
                  style={{ width: `${(y.yieldPct / 6) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
