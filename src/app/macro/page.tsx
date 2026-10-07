'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Globe,
  TrendingUp,
  Percent,
  Layers,
  Sparkles,
  Activity
} from 'lucide-react';
import BloombergEconomicCalendar from '@/components/macro/BloombergEconomicCalendar';
import WorldEquityYieldMatrix from '@/components/macro/WorldEquityYieldMatrix';
import BloombergYieldCurveDesk from '@/components/macro/BloombergYieldCurveDesk';

export default function MacroIntelligencePage() {
  const [activeView, setActiveView] = useState<'ECO' | 'WEI' | 'YCRV'>('ECO');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const qTab = new URLSearchParams(window.location.search).get('tab');
      if (qTab) {
        const upper = qTab.toUpperCase();
        if (upper === 'YCRV' || upper === 'CURVE') {
          setActiveView('YCRV');
        } else if (upper === 'WEI' || upper === 'SPREAD') {
          setActiveView('WEI');
        } else if (upper === 'ECO') {
          setActiveView('ECO');
        }
      }
    }
  }, []);

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-mono select-none">
      {/* ── Top Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded border bg-[#09090b] border-[#27272a]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-ping" />
            <span className="text-xs font-black text-[#f59e0b] uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              BLOOMBERG MACRO INTELLIGENCE &lt;ECO / WEI / YCRV&gt;
            </span>
            <span className="text-[10px] text-[#71717a]">| CENTRAL BANKS, SOVEREIGN SPREADS &amp; INVERSION</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-wide">
            Kalender Ekonomi Makro, Suku Bunga &amp; Yield Curve Desk
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Pusat data kebijakan moneter Bank Indonesia (BI-Rate), FOMC The Fed, struktur imbal hasil SBN vs US Treasury, dan deteksi dini resesi.
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded bg-[#18181b] border border-[#27272a] shrink-0 flex-wrap">
          <button
            onClick={() => setActiveView('ECO')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              activeView === 'ECO'
                ? 'bg-[#f59e0b] text-black shadow-sm font-extrabold'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            📅 ECO &bull; KALENDER MAKRO
          </button>
          <button
            onClick={() => setActiveView('WEI')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              activeView === 'WEI'
                ? 'bg-[#f59e0b] text-black shadow-sm font-extrabold'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            🏛️ WEI &bull; YIELD SPREAD &amp; FX
          </button>
          <button
            onClick={() => setActiveView('YCRV')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              activeView === 'YCRV'
                ? 'bg-[#f59e0b] text-black shadow-sm font-extrabold'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            📈 YCRV &bull; YIELD CURVE &amp; INVERSI
          </button>
        </div>
      </div>

      {/* ── Active Module Content ── */}
      {activeView === 'ECO' ? (
        <BloombergEconomicCalendar />
      ) : activeView === 'WEI' ? (
        <WorldEquityYieldMatrix />
      ) : (
        <BloombergYieldCurveDesk />
      )}
    </div>
  );
}
