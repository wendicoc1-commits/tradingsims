'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Globe,
  Filter,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import { BLOOMBERG_ECONOMIC_EVENTS, EconomicEvent } from '@/data/bloomberg_economic_calendar';

export default function BloombergEconomicCalendar() {
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [selectedImpact, setSelectedImpact] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalEvent, setActiveModalEvent] = useState<EconomicEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return BLOOMBERG_ECONOMIC_EVENTS.filter((ev) => {
      if (selectedCountry !== 'ALL' && ev.country !== selectedCountry) return false;
      if (selectedImpact !== 'ALL' && ev.impact !== selectedImpact) return false;
      if (selectedCategory !== 'ALL' && ev.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = ev.eventName.toLowerCase().includes(q);
        const inCat = ev.category.toLowerCase().includes(q);
        const inSum = ev.summary.toLowerCase().includes(q);
        if (!inName && !inCat && !inSum) return false;
      }
      return true;
    });
  }, [selectedCountry, selectedImpact, selectedCategory, searchQuery]);

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Header Terminal Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border bg-[#09090b] border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-ping" />
            <h2 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
              <span>BLOOMBERG ECONOMIC CALENDAR &lt;ECO / ECFC&gt;</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
              MAKROEKONOMI & SUKU BUNGA
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Jadwal rilis keputusan suku bunga BI & Fed, inflasi CPI, US Non-Farm Payrolls, dan indikator makroekonomi penggerak pasar modal dunia.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari BI-Rate, Fed, CPI..."
            className="w-full bg-[#18181b] border border-[#27272a] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#71717a] outline-none focus:border-[#f59e0b]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 rounded-lg border bg-[#0c0c0e] border-[#27272a]">
        {/* Country Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs scrollbar-none">
          {[
            { id: 'ALL', label: '🌍 Semua Negara' },
            { id: 'ID', label: '🇮🇩 Indonesia (BI/BPS)' },
            { id: 'US', label: '🇺🇸 United States (Fed)' },
            { id: 'CN', label: '🇨🇳 Tiongkok (PBOC)' },
            { id: 'JP', label: '🇯🇵 Jepang (BOJ)' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCountry(c.id)}
              className={`px-2.5 py-1 rounded text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                selectedCountry === c.id
                  ? 'bg-[#f59e0b] text-black shadow-sm'
                  : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Impact Selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-[#71717a]">Impact:</span>
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'HIGH', label: '🔴 High Impact', highlight: true },
            { id: 'MEDIUM', label: '🟡 Medium' },
          ].map((imp) => (
            <button
              key={imp.id}
              onClick={() => setSelectedImpact(imp.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                selectedImpact === imp.id
                  ? 'bg-[#27272a] text-[#f59e0b] border border-[#f59e0b]/50'
                  : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              {imp.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Master Economic Events Table ── */}
      <div className="rounded-lg border border-[#27272a] overflow-hidden bg-[#09090b]">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#18181b] text-[#71717a] border-b border-[#27272a] text-[11px] uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Waktu & Tanggal</th>
                <th className="py-2.5 px-2">Negara</th>
                <th className="py-2.5 px-3">Peristiwa Ekonomi Makro</th>
                <th className="py-2.5 px-2 text-center">Impact</th>
                <th className="py-2.5 px-3 text-right">Aktual</th>
                <th className="py-2.5 px-3 text-right">Konsensus</th>
                <th className="py-2.5 px-3 text-right">Sebelumnya</th>
                <th className="py-2.5 px-3 text-center">Analisis Pasar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f23]">
              {filteredEvents.map((ev) => {
                const isHigh = ev.impact === 'HIGH';
                const hasActual = ev.actual !== null;

                return (
                  <tr
                    key={ev.id}
                    onClick={() => setActiveModalEvent(ev)}
                    className="hover:bg-[#18181b]/70 transition-colors cursor-pointer group"
                  >
                    {/* Waktu & Tanggal */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-white font-mono-num">{ev.date}</div>
                      <div className="text-[11px] text-[#71717a] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{ev.time}</span>
                      </div>
                    </td>

                    {/* Negara */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <span className="text-base mr-1" title={ev.country}>{ev.flag}</span>
                      <span className="text-[11px] font-bold text-[#a1a1aa]">{ev.country}</span>
                    </td>

                    {/* Peristiwa */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#f4f4f5] group-hover:text-[#f59e0b] transition-colors line-clamp-1">
                        {ev.eventName}
                      </div>
                      <div className="text-[10px] text-[#71717a] flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">
                          {ev.category}
                        </span>
                        <span>Periode: {ev.period}</span>
                      </div>
                    </td>

                    {/* Impact Badge */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isHigh
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {ev.impact}
                      </span>
                    </td>

                    {/* Aktual */}
                    <td className="py-3 px-3 text-right font-mono-num font-bold">
                      {hasActual ? (
                        <span className="text-[#22c55e] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          {ev.actual}
                        </span>
                      ) : (
                        <span className="text-[#71717a] italic">Menunggu</span>
                      )}
                    </td>

                    {/* Konsensus */}
                    <td className="py-3 px-3 text-right font-mono-num text-[#d4d4d8]">
                      {ev.consensus}
                    </td>

                    {/* Sebelumnya */}
                    <td className="py-3 px-3 text-right font-mono-num text-[#71717a]">
                      {ev.previous}
                    </td>

                    {/* Analisis Link */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalEvent(ev);
                        }}
                        className="px-2 py-1 rounded text-[11px] font-bold text-[#f59e0b] hover:bg-[#f59e0b]/10 border border-[#f59e0b]/30 inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Implikasi</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Modal Implikasi Makro ── */}
      {activeModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0c0c0e] border border-[#27272a] rounded-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#27272a] flex items-start justify-between gap-3 bg-[#09090b]">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{activeModalEvent.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#f59e0b] uppercase">
                      BLOOMBERG MACRO INTELLIGENCE
                    </span>
                    <span className="text-[10px] text-[#71717a]">&bull; {activeModalEvent.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug mt-0.5">
                    {activeModalEvent.eventName}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveModalEvent(null)}
                className="p-1 rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs font-mono overflow-y-auto">
              {/* Data Comparison Box */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-[#18181b] border border-[#27272a] text-center">
                <div>
                  <div className="text-[10px] text-[#71717a] uppercase font-bold">Rilis Aktual</div>
                  <div className="text-base font-bold text-[#22c55e] font-mono-num mt-0.5">
                    {activeModalEvent.actual || 'Belum Rilis'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#71717a] uppercase font-bold">Konsensus</div>
                  <div className="text-base font-bold text-[#f59e0b] font-mono-num mt-0.5">
                    {activeModalEvent.consensus}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#71717a] uppercase font-bold">Sebelumnya</div>
                  <div className="text-base font-bold text-[#d4d4d8] font-mono-num mt-0.5">
                    {activeModalEvent.previous}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-white uppercase tracking-wider">
                  Rangkuman Data & Kebijakan:
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  {activeModalEvent.summary}
                </p>
              </div>

              {/* Market Implication Box */}
              <div className="p-3.5 rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/5 space-y-1.5">
                <div className="text-xs font-bold text-[#f59e0b] uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Implikasi Terhadap Saham & Pasar Modal:</span>
                </div>
                <p className="text-xs text-[#d4d4d8] leading-relaxed">
                  {activeModalEvent.marketImplication}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#27272a] flex justify-end bg-[#09090b]">
              <button
                onClick={() => setActiveModalEvent(null)}
                className="px-4 py-1.5 rounded text-xs font-semibold bg-[#27272a] text-white hover:bg-[#3f3f46] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
