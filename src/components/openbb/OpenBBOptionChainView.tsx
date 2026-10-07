'use client';

import React, { useState } from 'react';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Layers,
  Activity,
  AlertTriangle,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { getOpenBBOptionChain, OpenBBOptionChain } from '@/lib/openbb/service';

export default function OpenBBOptionChainView({
  symbol,
  underlyingPrice = 9850,
}: {
  symbol: string;
  underlyingPrice?: number;
}) {
  const chain: OpenBBOptionChain = getOpenBBOptionChain(symbol, underlyingPrice);
  const [selectedStrike, setSelectedStrike] = useState<number | null>(chain.maxPainStrike);

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Sub-Header & Metadata ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#09090b] border border-[#27272a] rounded-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded">
            <Zap className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs tracking-wide">
                MEJA DERIVATIF &amp; RANTAI OPSI (OPTIONS DESK)
              </span>
              <span className="text-[10px] bg-[#18181b] border border-[#27272a] text-[#f59e0b] px-1.5 py-0.5 rounded font-bold">
                OPENBB DERIVATIVES &bull; BLACK-SCHOLES
              </span>
            </div>
            <p className="text-[11px] text-[#71717a]">
              Matriks opsi Call/Put, Implied Volatility (IV), Max Pain, dan parameter Greeks lengkap (Delta, Gamma, Vega, Theta).
            </p>
          </div>
        </div>

        {/* Expiry & Max Pain Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-[#121216] border border-[#27272a] px-2.5 py-1 rounded">
            <span className="text-[10px] text-[#71717a]">Expiry: </span>
            <span className="font-bold text-white text-[11px]">{chain.expirationDate}</span>
          </div>
          <div className="bg-[#121216] border border-[#27272a] px-2.5 py-1 rounded">
            <span className="text-[10px] text-[#71717a]">Max Pain: </span>
            <span className="font-bold text-[#f59e0b] text-[11px]">Rp {chain.maxPainStrike.toLocaleString('id-ID')}</span>
          </div>
          <div className="bg-[#121216] border border-[#27272a] px-2.5 py-1 rounded">
            <span className="text-[10px] text-[#71717a]">P/C Ratio: </span>
            <span className="font-bold text-[#22c55e] text-[11px]">{chain.putCallRatio} (Bullish Bias)</span>
          </div>
        </div>
      </div>

      {/* ── Key Options Volume Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 bg-[#0e0e12] border border-[#22c55e]/30 rounded">
          <div className="text-[10px] text-[#71717a]">Total Call Open Interest</div>
          <div className="text-sm font-bold text-[#22c55e] mt-0.5">{chain.totalCallOpenInterest.toLocaleString()} Kontrak</div>
          <div className="text-[9px] text-[#71717a]">Likuiditas Sisi Beli</div>
        </div>
        <div className="p-2.5 bg-[#0e0e12] border border-[#ef4444]/30 rounded">
          <div className="text-[10px] text-[#71717a]">Total Put Open Interest</div>
          <div className="text-sm font-bold text-[#ef4444] mt-0.5">{chain.totalPutOpenInterest.toLocaleString()} Kontrak</div>
          <div className="text-[9px] text-[#71717a]">Hedging Proteksi Pasar</div>
        </div>
        <div className="p-2.5 bg-[#0e0e12] border border-[#27272a] rounded">
          <div className="text-[10px] text-[#71717a]">ATM Implied Volatility</div>
          <div className="text-sm font-bold text-[#f59e0b] mt-0.5">24.5% Annualized</div>
          <div className="text-[9px] text-[#22c55e]">Volatilitas Terkendali</div>
        </div>
        <div className="p-2.5 bg-[#0e0e12] border border-[#27272a] rounded">
          <div className="text-[10px] text-[#71717a]">Harga Dasar (Underlying)</div>
          <div className="text-sm font-bold text-white mt-0.5">Rp {chain.underlyingPrice.toLocaleString('id-ID')}</div>
          <div className="text-[9px] text-[#71717a]">Level Titik Temu Spot</div>
        </div>
      </div>

      {/* ── Full Options Chain Matrix (Call - Strike - Put) ── */}
      <div className="bg-[#09090b] border border-[#27272a] rounded-sm overflow-x-auto">
        <table className="w-full text-xs text-center">
          <thead>
            <tr className="border-b border-[#27272a] bg-[#121216] text-[#71717a] text-[10px] uppercase">
              {/* Call Columns */}
              <th className="py-2 px-2 text-left text-[#22c55e]">Delta</th>
              <th className="py-2 px-2 text-right text-[#22c55e]">IV %</th>
              <th className="py-2 px-2 text-right text-[#22c55e]">Call Last</th>
              <th className="py-2 px-2 text-right text-[#22c55e]">Vol</th>
              <th className="py-2 px-2 text-right text-[#22c55e] border-r border-[#27272a]">OI</th>

              {/* Center Strike */}
              <th className="py-2 px-3 bg-[#18181b] text-white font-bold border-r border-[#27272a]">
                STRIKE
              </th>

              {/* Put Columns */}
              <th className="py-2 px-2 text-left text-[#ef4444]">OI</th>
              <th className="py-2 px-2 text-left text-[#ef4444]">Vol</th>
              <th className="py-2 px-2 text-left text-[#ef4444]">Put Last</th>
              <th className="py-2 px-2 text-left text-[#ef4444]">IV %</th>
              <th className="py-2 px-2 text-right text-[#ef4444]">Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f23] text-[11px]">
            {chain.contracts.map((c) => {
              const isAtm = c.strike === chain.maxPainStrike;
              const isSelected = selectedStrike === c.strike;

              return (
                <tr
                  key={c.strike}
                  onClick={() => setSelectedStrike(c.strike)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#f59e0b]/10'
                      : isAtm
                      ? 'bg-[#18181b]'
                      : 'hover:bg-[#121215]'
                  }`}
                >
                  {/* Call Data */}
                  <td className="py-1.5 px-2 text-left font-mono-num text-[#22c55e]">
                    +{c.call.delta}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono-num text-[#a1a1aa]">
                    {c.call.impliedVol}%
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono-num font-bold text-white">
                    Rp {c.call.last.toLocaleString('id-ID')}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono-num text-[#d4d4d8]">
                    {c.call.volume}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono-num text-[#71717a] border-r border-[#27272a]">
                    {c.call.openInterest}
                  </td>

                  {/* Strike Column */}
                  <td className={`py-1.5 px-3 font-mono-num font-black border-r border-[#27272a] ${
                    isAtm ? 'bg-[#f59e0b] text-black font-extrabold' : 'bg-[#18181b] text-white'
                  }`}>
                    Rp {c.strike.toLocaleString('id-ID')}
                  </td>

                  {/* Put Data */}
                  <td className="py-1.5 px-2 text-left font-mono-num text-[#71717a]">
                    {c.put.openInterest}
                  </td>
                  <td className="py-1.5 px-2 text-left font-mono-num text-[#d4d4d8]">
                    {c.put.volume}
                  </td>
                  <td className="py-1.5 px-2 text-left font-mono-num font-bold text-white">
                    Rp {c.put.last.toLocaleString('id-ID')}
                  </td>
                  <td className="py-1.5 px-2 text-left font-mono-num text-[#a1a1aa]">
                    {c.put.impliedVol}%
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono-num text-[#ef4444]">
                    {c.put.delta}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
