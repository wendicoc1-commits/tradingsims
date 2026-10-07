'use client';

import React, { useState } from 'react';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { getWarrantsForUnderlying, StructuredWarrant } from '@/data/bloomberg_options_warrants';

interface OptionsWarrantsDeskProps {
  symbol: string;
}

export default function OptionsWarrantsDesk({ symbol }: OptionsWarrantsDeskProps) {
  const warrants = getWarrantsForUnderlying(symbol);
  const [filterType, setFilterType] = useState<'ALL' | 'CALL' | 'PUT'>('ALL');
  const [selectedWarrant, setSelectedWarrant] = useState<StructuredWarrant | null>(null);

  const filtered = warrants.filter((w) => {
    if (filterType === 'ALL') return true;
    return w.type === filterType;
  });

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded border bg-[#09090b] border-[#27272a]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-ping" />
            <span className="text-xs font-black text-[#f59e0b] uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              BLOOMBERG OMON &lt;GO&gt; &bull; STRUCTURED WARRANTS &amp; VOLATILITY MATRIX
            </span>
            <span className="text-[10px] text-[#71717a]">| IDX CALL &amp; PUT DERIVATIVES DESK</span>
          </div>
          <h2 className="text-lg font-black text-white tracking-wide">
            Matriks Waran Terstruktur &amp; Parameter Yunani (Greeks) ({symbol.toUpperCase()})
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Instrumen derivatif leverage resmi BEI yang diterbitkan oleh sekuritas likuiditas (RHB Sekuritas &amp; Maybank). Menghitung Implied Volatility (IV) dan parameter Greeks (&Delta;, &Gamma;, &Theta;, &nu;).
          </p>
        </div>

        {/* Filter Type Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded bg-[#18181b] border border-[#27272a] shrink-0">
          {(['ALL', 'CALL', 'PUT'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-[#f59e0b] text-black shadow-sm font-extrabold'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              {type === 'ALL' ? 'SEMUA WARAN' : `${type} OPTIONS`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Volatility & Greeks Overview Banner ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Rata-rata Implied Volatility (IV)</div>
          <div className="text-xl font-black text-[#f59e0b] mt-1 font-mono">
            {filtered.length > 0
              ? (filtered.reduce((acc, w) => acc + w.impliedVolatility, 0) / filtered.length).toFixed(1)
              : '24.5'}%
          </div>
          <div className="text-[10px] text-[#a1a1aa] mt-1">Ekspektasi Fluktuasi Pasar 30D</div>
        </div>

        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Maksimum Effective Gearing</div>
          <div className="text-xl font-black text-[#22c55e] mt-1 font-mono">
            {filtered.length > 0
              ? Math.max(...filtered.map((w) => Math.abs(w.effectiveGearing))).toFixed(1)
              : '8.4'}x
          </div>
          <div className="text-[10px] text-[#a1a1aa] mt-1">Daya Ungkit Modal Ritel</div>
        </div>

        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Total Seri Terdaftar</div>
          <div className="text-xl font-black text-white mt-1 font-mono">
            {filtered.length} Seri
          </div>
          <div className="text-[10px] text-[#a1a1aa] mt-1">Penerbit: RHB &amp; Maybank</div>
        </div>

        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Total Open Interest (OI)</div>
          <div className="text-xl font-black text-[#38bdf8] mt-1 font-mono">
            {(filtered.reduce((acc, w) => acc + w.openInterest, 0) / 1_000_000).toFixed(2)}M
          </div>
          <div className="text-[10px] text-[#a1a1aa] mt-1">Kontrak Terbuka di KPEI</div>
        </div>
      </div>

      {/* ── Table of Structured Warrants ── */}
      <div className="rounded border bg-[#121216] border-[#27272a] overflow-hidden">
        <div className="p-3 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#f59e0b]" />
            Daftar Seri Waran Terstruktur &amp; Greeks
          </span>
          <span className="text-[10px] text-[#71717a]">
            Klik baris untuk simulasi sensitivitas harga
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#0d0d10] text-[10px] text-[#71717a] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-3">Kode Waran</th>
                <th className="py-2.5 px-3">Tipe</th>
                <th className="py-2.5 px-3">Penerbit</th>
                <th className="py-2.5 px-3 text-right">Strike</th>
                <th className="py-2.5 px-3 text-right">Harga Terakhir</th>
                <th className="py-2.5 px-3 text-right">Perubahan</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Gearing</th>
                <th className="py-2.5 px-3 text-right">IV (%)</th>
                <th className="py-2.5 px-3 text-right">Delta (&Delta;)</th>
                <th className="py-2.5 px-3 text-right">Theta (&Theta;)</th>
                <th className="py-2.5 px-3 text-right">Jatuh Tempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f23] text-xs">
              {filtered.map((w) => {
                const isSelected = selectedWarrant?.code === w.code;
                return (
                  <tr
                    key={w.code}
                    onClick={() => setSelectedWarrant(isSelected ? null : w)}
                    className={`hover:bg-[#18181c] cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#18181c]' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-white font-mono flex items-center gap-1.5">
                      <span className="text-[#f59e0b]">&bull;</span>
                      <span>{w.code}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                          w.type === 'CALL'
                            ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30'
                            : 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30'
                        }`}
                      >
                        {w.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#a1a1aa] text-[11px]">{w.issuer}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                      Rp {w.strikePrice.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#f59e0b]">
                      Rp {w.lastPrice}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={w.changePercent >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                        {w.changePercent >= 0 ? '+' : ''}{w.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          w.moneyness === 'ITM'
                            ? 'bg-[#22c55e]/10 text-[#22c55e]'
                            : w.moneyness === 'ATM'
                            ? 'bg-[#f59e0b]/10 text-[#f59e0b]'
                            : 'bg-[#71717a]/15 text-[#a1a1aa]'
                        }`}
                      >
                        {w.moneyness}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#38bdf8] font-bold">
                      {w.effectiveGearing}x
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#d4d4d8]">
                      {w.impliedVolatility}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#22c55e]">
                      {w.delta.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#ef4444]">
                      {w.theta.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#71717a] text-[11px]">
                      {w.daysToExpiry} Hari
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Warrant Deep-Dive Simulation */}
        {selectedWarrant && (
          <div className="p-4 bg-[#09090b] border-t border-[#27272a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#f59e0b] font-bold text-xs uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> DETAIL SIMULASI DERIVATIF: {selectedWarrant.code}
              </span>
              <button
                onClick={() => setSelectedWarrant(null)}
                className="text-xs text-[#71717a] hover:text-white cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>
            <p className="text-xs text-[#a1a1aa]">
              Rasio Konversi: <strong className="text-white">{selectedWarrant.exerciseRatio}</strong> | 
              Jatuh Tempo: <strong className="text-white">{selectedWarrant.expiryDate}</strong> ({selectedWarrant.daysToExpiry} hari lagi) | 
              Bid/Ask: <strong className="text-[#22c55e]">Rp {selectedWarrant.bid}</strong> / <strong className="text-[#ef4444]">Rp {selectedWarrant.ask}</strong>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded bg-[#18181b] border border-[#27272a]">
                <div className="text-[#71717a] text-[9px] uppercase">Delta (&Delta;)</div>
                <div className="font-bold text-[#22c55e]">{selectedWarrant.delta}</div>
                <div className="text-[9px] text-[#71717a]">Perubahan harga per Rp 1 saham induk</div>
              </div>
              <div className="p-2 rounded bg-[#18181b] border border-[#27272a]">
                <div className="text-[#71717a] text-[9px] uppercase">Gamma (&Gamma;)</div>
                <div className="font-bold text-white">{selectedWarrant.gamma}</div>
                <div className="text-[9px] text-[#71717a]">Akselerasi Delta</div>
              </div>
              <div className="p-2 rounded bg-[#18181b] border border-[#27272a]">
                <div className="text-[#71717a] text-[9px] uppercase">Theta (&Theta; / Hari)</div>
                <div className="font-bold text-[#ef4444]">{selectedWarrant.theta}</div>
                <div className="text-[9px] text-[#71717a]">Penyusutan nilai per hari (Time Decay)</div>
              </div>
              <div className="p-2 rounded bg-[#18181b] border border-[#27272a]">
                <div className="text-[#71717a] text-[9px] uppercase">Vega (&nu;)</div>
                <div className="font-bold text-[#38bdf8]">{selectedWarrant.vega}</div>
                <div className="text-[9px] text-[#71717a]">Sensitivitas per 1% kenaikan volatilitas</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
