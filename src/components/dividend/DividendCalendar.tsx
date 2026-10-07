'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Coins,
  Clock,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { KNOWN_DIVIDENDS, usePortfolioStore } from '@/store';
import CompanyLogo from '@/components/common/CompanyLogo';
import DividendDeepDiveModal from '@/components/dividend/DividendDeepDiveModal';

interface DividendEvent {
  code: string;
  name: string;
  dps: number;
  yield: number;
  frequency: string;
  category: string;
  cumDate: string;
  exDate: string;
  payDate: string;
  daysToCum: number;
  daysToPay: number;
  isOwned: boolean;
  ownedLots: number;
  potentialDividend: number;
}

export default function DividendCalendar() {
  const { holdings } = usePortfolioStore();
  const [filterType, setFilterType] = useState<'ALL' | 'OWNED' | 'HIGH_YIELD' | 'ARISTOCRAT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [deepDiveModalOpen, setDeepDiveModalOpen] = useState(false);
  const [selectedDeepDiveSymbol, setSelectedDeepDiveSymbol] = useState('BMRI');

  // Buat daftar event dividen dari 252 emiten
  const events = useMemo<DividendEvent[]>(() => {
    const today = new Date();
    const list: DividendEvent[] = [];

    const ownedMap = new Map<string, number>();
    holdings.forEach((h) => {
      const sym = (h.displaySymbol || h.symbol).replace('.JK', '').toUpperCase();
      ownedMap.set(sym, (ownedMap.get(sym) || 0) + (h.lots || 0));
    });

    Object.entries(KNOWN_DIVIDENDS).forEach(([code, info]) => {
      if (!info.hasDividend || info.dps <= 0) return;

      const ownedLots = ownedMap.get(code) || 0;
      const shares = ownedLots * 100;
      const potential = shares * info.dps;

      // Parsing estimasi tanggal & hitung selisih hari sebenarnya terhadap hari ini (02 Okt 2026)
      const cumDateStr = info.cumDate || '2026-10-15';
      const payDateStr = info.payDate || '2026-10-31';

      const cum = new Date(cumDateStr);
      const ex = new Date(cum);
      ex.setDate(ex.getDate() + 1);
      const pay = new Date(payDateStr);

      const diffTimeCum = cum.getTime() - today.getTime();
      const daysToCum = Math.ceil(diffTimeCum / (1000 * 60 * 60 * 24));

      const diffTimePay = pay.getTime() - today.getTime();
      const daysToPay = Math.ceil(diffTimePay / (1000 * 60 * 60 * 24));

      list.push({
        code,
        name: info.notes ? info.notes.split('.')[0] : `Emiten ${code} Tbk`,
        dps: info.dps,
        yield: info.yield || 3.5,
        frequency: info.frequency || '1x Setahun',
        category: info.category || 'Dividen Papan Utama',
        cumDate: cumDateStr,
        exDate: ex.toISOString().split('T')[0],
        payDate: payDateStr,
        daysToCum,
        daysToPay,
        isOwned: ownedLots > 0,
        ownedLots,
        potentialDividend: potential,
      });
    });

    // Urutkan kalender berdasarkan tanggal dividen paling terbaru/terdekat (cum-date terdekat)
    return list.sort((a, b) => {
      // Prioritaskan event yang cum date-nya hari ini atau ke depan (>= 0)
      if (a.daysToCum >= 0 && b.daysToCum < 0) return -1;
      if (a.daysToCum < 0 && b.daysToCum >= 0) return 1;
      if (a.daysToCum >= 0 && b.daysToCum >= 0) {
        if (a.daysToCum !== b.daysToCum) return a.daysToCum - b.daysToCum;
      }
      return b.yield - a.yield;
    });
  }, [holdings]);

  // Filter daftar event
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filterType === 'OWNED' && !e.isOwned) return false;
      if (filterType === 'HIGH_YIELD' && e.yield < 7.0) return false;
      if (filterType === 'ARISTOCRAT' && !e.category.toLowerCase().includes('aristokrat') && !e.category.toLowerCase().includes('konsisten')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!e.code.toLowerCase().includes(q) && !e.name.toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [events, filterType, searchQuery]);

  // Statistik kalender
  const totalOwnedDividends = useMemo(() => {
    return events.filter((e) => e.isOwned).reduce((sum, e) => sum + e.potentialDividend, 0);
  }, [events]);

  const highYieldCount = useMemo(() => {
    return events.filter((e) => e.yield >= 7.0).length;
  }, [events]);

  return (
    <div className="space-y-5">
      {/* Top Banner & Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Emiten Pembagi Dividen Aktif</span>
          </div>
          <div className="text-xl font-bold font-mono-num text-white">
            {events.length} <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>Saham Terdaftar</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Potensi Dividen Portofolio Anda</span>
          </div>
          <div className="text-xl font-bold font-mono-num" style={{ color: 'var(--positive)' }}>
            Rp {totalOwnedDividends.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Kategori High Yield (&ge; 7% p.a.)</span>
          </div>
          <div className="text-xl font-bold font-mono-num text-purple-300">
            {highYieldCount} <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>Saham Super Yield</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              filterType === 'ALL'
                ? 'bg-amber-400 text-black font-bold'
                : 'text-zinc-400 hover:text-white bg-white/5'
            }`}
          >
            Semua ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('OWNED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              filterType === 'OWNED'
                ? 'bg-amber-400 text-black font-bold'
                : 'text-zinc-400 hover:text-white bg-white/5'
            }`}
          >
            Saham Portofolio ({events.filter((e) => e.isOwned).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('HIGH_YIELD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              filterType === 'HIGH_YIELD'
                ? 'bg-purple-500 text-white font-bold'
                : 'text-zinc-400 hover:text-white bg-white/5'
            }`}
          >
            High Yield &ge; 7% ({highYieldCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('ARISTOCRAT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              filterType === 'ARISTOCRAT'
                ? 'bg-blue-500 text-white font-bold'
                : 'text-zinc-400 hover:text-white bg-white/5'
            }`}
          >
            Aristokrat Konsisten
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode atau nama emiten..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Events Table / Timeline */}
      <div className="rounded-xl border overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="data-table min-w-[720px] w-full">
          <thead>
            <tr>
              <th>Emiten</th>
              <th className="text-right">DPS (Rp/lbr)</th>
              <th className="text-right">Dividend Yield</th>
              <th>Status Cum Date</th>
              <th>Jadwal Pembayaran</th>
              <th className="text-right">Kepemilikan Anda</th>
              <th className="text-center">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((e) => {
              const isHighYield = e.yield >= 7.0;
              return (
                <tr key={e.code}>
                  <td>
                    <div className="flex items-center gap-2">
                      <CompanyLogo symbol={e.code} name={e.name} size={24} rounded="md" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/stock/${e.code}`}
                            className="font-bold text-xs font-mono hover:underline"
                            style={{ color: 'var(--accent)' }}
                          >
                            {e.code}
                          </Link>
                          {e.isOwned && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              DI PORTO
                            </span>
                          )}
                          {isHighYield && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              HIGH YIELD
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 max-w-xs truncate">{e.name}</div>
                      </div>
                    </div>
                  </td>

                  <td className="text-right font-mono-num text-xs font-bold text-white">
                    Rp {e.dps.toLocaleString('id-ID')}
                  </td>

                  <td className="text-right font-mono-num text-xs font-bold" style={{ color: isHighYield ? '#a855f7' : 'var(--positive)' }}>
                    {e.yield.toFixed(1)}% p.a.
                  </td>

                  <td>
                    <div className="text-xs font-mono text-zinc-200">{e.cumDate}</div>
                    <div className="text-[10px]">
                      {e.daysToCum === 0 ? (
                        <span className="text-amber-300 font-bold flex items-center gap-1 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40 w-fit">
                          <Sparkles className="w-3 h-3 text-amber-400" /> CUM-DATE HARI INI!
                        </span>
                      ) : e.daysToCum > 0 ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Cum Date dlm {e.daysToCum} hari
                        </span>
                      ) : (
                        <span className="text-zinc-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-zinc-500" /> Lewat Cum Date ({Math.abs(e.daysToCum)} hari lalu)
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    <div className="text-xs font-mono text-zinc-200">{e.payDate}</div>
                    <div className="text-[10px] text-zinc-400">Frekuensi: {e.frequency}</div>
                  </td>

                  <td className="text-right font-mono-num text-xs">
                    {e.isOwned ? (
                      <div>
                        <span className="font-bold text-emerald-400">{e.ownedLots} Lot</span>
                        <div className="text-[10px] text-zinc-400">
                          Est. Rp {e.potentialDividend.toLocaleString('id-ID')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-zinc-500">0 Lot</span>
                    )}
                  </td>

                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {e.code === 'BMRI' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDeepDiveSymbol('BMRI');
                            setDeepDiveModalOpen(true);
                          }}
                          className="px-2 py-1 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors inline-flex items-center gap-1 cursor-pointer animate-pulse"
                          title="Buka Analisis Mendalam Dividen BMRI Hari Ini"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Analisis BMRI</span>
                        </button>
                      )}
                      <Link
                        href={`/stock/${e.code}`}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors hover:bg-white/10 text-zinc-300 hover:text-white inline-flex items-center gap-1"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Detail</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal Analisis Mendalam Dividen */}
      <DividendDeepDiveModal
        isOpen={deepDiveModalOpen}
        onClose={() => setDeepDiveModalOpen(false)}
        symbol={selectedDeepDiveSymbol}
      />
    </div>
  );
}
