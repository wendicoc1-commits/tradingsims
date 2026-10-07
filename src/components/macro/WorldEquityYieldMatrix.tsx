'use client';

import React, { useState } from 'react';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ShieldCheck,
  Percent,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function WorldEquityYieldMatrix() {
  const [activeTab, setActiveTab] = useState<'SPREAD' | 'EQUITIES' | 'FX'>('SPREAD');

  // Sovereign Bond Data
  const sovereignBonds = [
    { country: '🇮🇩 Indonesia 10Y SBN', yieldVal: 6.72, change: -0.04, positive: false, desc: 'Benchmark Surat Berharga Negara 10 Tahun (FR0101)' },
    { country: '🇺🇸 US 10Y Treasury Note', yieldVal: 4.28, change: +0.06, positive: true, desc: 'Benchmark Bebas Risiko Global Wall Street' },
    { country: '🇮🇩 Indonesia 5Y SBN', yieldVal: 6.51, change: -0.02, positive: false, desc: 'SBN Tenor Menengah (FR0095)' },
    { country: '🇺🇸 US 2Y Treasury Note', yieldVal: 3.98, change: +0.03, positive: true, desc: 'Sensitif terhadap Ekspektasi Suku Bunga Fed' },
    { country: '🇩🇪 German 10Y Bund', yieldVal: 2.21, change: -0.01, positive: false, desc: 'Benchmark Obligasi Teraman Zona Euro' },
    { country: '🇯🇵 Japan 10Y JGB', yieldVal: 0.95, change: +0.02, positive: true, desc: 'Bank of Japan Yield Curve Control Reference' },
  ];

  const yieldSpreadBps = Math.round((6.72 - 4.28) * 100); // 244 bps

  // Major Currencies (FX)
  const currencies = [
    { pair: 'USD/IDR', price: '15.680', chg: '+35 (+0.22%)', positive: true, high: '15.710', low: '15.640' },
    { pair: 'EUR/USD', price: '1.0945', chg: '-0.0016 (-0.15%)', positive: false, high: '1.0975', low: '1.0930' },
    { pair: 'USD/JPY', price: '149.20', chg: '+0.52 (+0.35%)', positive: true, high: '149.50', low: '148.60' },
    { pair: 'GBP/USD', price: '1.3120', chg: '-0.0010 (-0.08%)', positive: false, high: '1.3150', low: '1.3105' },
    { pair: 'SGD/IDR', price: '11.980', chg: '+22 (+0.18%)', positive: true, high: '12.010', low: '11.950' },
    { pair: 'USD/CNY', price: '7.0850', chg: '+0.0070 (+0.10%)', positive: true, high: '7.0920', low: '7.0780' },
  ];

  // World Equities
  const equities = [
    { region: 'ASIA-PASIFIK', name: 'IHSG (Indonesia)', index: '7,612.35', chg: '+42.10', pct: '+0.56%', positive: true },
    { region: 'ASIA-PASIFIK', name: 'LQ45 (Blue Chips)', index: '942.80', chg: '+6.50', pct: '+0.69%', positive: true },
    { region: 'ASIA-PASIFIK', name: 'Nikkei 225 (Tokyo)', index: '38,650.00', chg: '+180.20', pct: '+0.47%', positive: true },
    { region: 'ASIA-PASIFIK', name: 'Hang Seng (Hong Kong)', index: '22,736.87', chg: '+623.40', pct: '+2.82%', positive: true },
    { region: 'AMERIKA', name: 'S&P 500 (Wall Street)', index: '5,751.13', chg: '+22.40', pct: '+0.39%', positive: true },
    { region: 'AMERIKA', name: 'Nasdaq 100 (Tech)', index: '19,836.20', chg: '+142.10', pct: '+0.72%', positive: true },
    { region: 'AMERIKA', name: 'Dow Jones Industrial', index: '42,352.75', chg: '-110.20', pct: '-0.26%', positive: false },
    { region: 'EROPA', name: 'FTSE 100 (London)', index: '8,280.60', chg: '+15.40', pct: '+0.19%', positive: true },
    { region: 'EROPA', name: 'DAX 40 (Frankfurt)', index: '19,210.90', chg: '+85.30', pct: '+0.45%', positive: true },
  ];

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('SPREAD')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'SPREAD'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
            }`}
          >
            🏛️ SOVEREIGN YIELD SPREAD (SBN vs US 10Y)
          </button>
          <button
            onClick={() => setActiveTab('EQUITIES')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'EQUITIES'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
            }`}
          >
            📈 WORLD EQUITY INDICES &lt;WEI&gt;
          </button>
          <button
            onClick={() => setActiveTab('FX')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'FX'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
            }`}
          >
            💱 GLOBAL CURRENCIES &lt;FXC&gt;
          </button>
        </div>
        <span className="text-[10px] text-[#71717a] hidden sm:inline">
          GLOBAL CROSS-ASSET MONITOR
        </span>
      </div>

      {/* ── TAB 1: SOVEREIGN SPREAD ── */}
      {activeTab === 'SPREAD' && (
        <div className="space-y-4">
          {/* Key Spread Highlight Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-[#09090b] border border-[#27272a]">
              <div className="text-[11px] text-[#71717a] uppercase font-bold">Indonesia 10Y SBN Yield</div>
              <div className="text-2xl font-bold text-white font-mono-num mt-1">6.72%</div>
              <div className="text-[10px] text-[#22c55e] mt-0.5">Surat Berharga Negara FR0101</div>
            </div>

            <div className="p-4 rounded-lg bg-[#09090b] border border-[#27272a]">
              <div className="text-[11px] text-[#71717a] uppercase font-bold">US 10-Year Treasury Yield</div>
              <div className="text-2xl font-bold text-white font-mono-num mt-1">4.28%</div>
              <div className="text-[10px] text-[#a1a1aa] mt-0.5">Benchmark Global Risk-Free</div>
            </div>

            <div className="p-4 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/40">
              <div className="text-[11px] text-[#f59e0b] uppercase font-bold flex items-center justify-between">
                <span>Indo-US Yield Spread</span>
                <span className="text-[10px] bg-[#f59e0b] text-black px-1.5 py-0.2 rounded font-extrabold">PRIMA</span>
              </div>
              <div className="text-2xl font-bold text-[#f59e0b] font-mono-num mt-1">+{yieldSpreadBps} bps</div>
              <div className="text-[10px] text-[#d4d4d8] mt-0.5">Spread &gt;200 bps menopang aliran modal masuk (inflow)</div>
            </div>
          </div>

          {/* Table of Sovereign Yields */}
          <div className="rounded-lg border border-[#27272a] bg-[#09090b] overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#18181b] text-[#71717a] border-b border-[#27272a] text-[11px] uppercase">
                  <th className="py-2.5 px-3">Instrumen Surat Berharga</th>
                  <th className="py-2.5 px-3 text-right">Yield (%)</th>
                  <th className="py-2.5 px-3 text-right">Perubahan Harian</th>
                  <th className="py-2.5 px-3">Deskripsi / Peranan Pasar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f23]">
                {sovereignBonds.map((b, i) => (
                  <tr key={i} className="hover:bg-[#18181b]/50">
                    <td className="py-2.5 px-3 font-bold text-white">{b.country}</td>
                    <td className="py-2.5 px-3 text-right font-mono-num font-bold text-[#f59e0b]">{b.yieldVal}%</td>
                    <td className={`py-2.5 px-3 text-right font-mono-num font-bold ${b.change < 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {b.change > 0 ? `+${b.change}%` : `${b.change}%`}
                    </td>
                    <td className="py-2.5 px-3 text-[#a1a1aa] text-[11px]">{b.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: WORLD EQUITIES ── */}
      {activeTab === 'EQUITIES' && (
        <div className="rounded-lg border border-[#27272a] bg-[#09090b] overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#18181b] text-[#71717a] border-b border-[#27272a] text-[11px] uppercase">
                <th className="py-2.5 px-3">Wilayah</th>
                <th className="py-2.5 px-3">Indeks Pasar Saham</th>
                <th className="py-2.5 px-3 text-right">Level Terkini</th>
                <th className="py-2.5 px-3 text-right">Poin</th>
                <th className="py-2.5 px-3 text-right">Perubahan (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f23]">
              {equities.map((eq, i) => (
                <tr key={i} className="hover:bg-[#18181b]/50">
                  <td className="py-2.5 px-3 text-[10px] text-[#71717a] font-bold">{eq.region}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{eq.name}</td>
                  <td className="py-2.5 px-3 text-right font-mono-num font-bold text-[#d4d4d8]">{eq.index}</td>
                  <td className={`py-2.5 px-3 text-right font-mono-num ${eq.positive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    {eq.chg}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono-num font-bold ${eq.positive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    {eq.pct}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 3: GLOBAL CURRENCIES ── */}
      {activeTab === 'FX' && (
        <div className="rounded-lg border border-[#27272a] bg-[#09090b] overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#18181b] text-[#71717a] border-b border-[#27272a] text-[11px] uppercase">
                <th className="py-2.5 px-3">Pasangan Mata Uang</th>
                <th className="py-2.5 px-3 text-right">Kurs Live</th>
                <th className="py-2.5 px-3 text-right">Perubahan</th>
                <th className="py-2.5 px-3 text-right">Tertinggi Harian</th>
                <th className="py-2.5 px-3 text-right">Terendah Harian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f23]">
              {currencies.map((c, i) => (
                <tr key={i} className="hover:bg-[#18181b]/50">
                  <td className="py-2.5 px-3 font-bold text-white font-mono">{c.pair}</td>
                  <td className="py-2.5 px-3 text-right font-mono-num font-bold text-[#f59e0b]">{c.price}</td>
                  <td className={`py-2.5 px-3 text-right font-mono-num ${c.positive ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                    {c.chg}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-num text-[#71717a]">{c.high}</td>
                  <td className="py-2.5 px-3 text-right font-mono-num text-[#71717a]">{c.low}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
