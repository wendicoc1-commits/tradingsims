'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Coins,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Percent,
  Search,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Filter,
  BarChart3,
  Layers,
  Sparkles,
  Globe,
} from 'lucide-react';
import ALL_DIVIDEND_DATA from '@/data/idx_dividend_all.json';
import DividendCalendar from '@/components/dividend/DividendCalendar';
import DividendSnowballCalculator from '@/components/dividend/DividendSnowballCalculator';
import DividendTrapScanner from '@/components/dividend/DividendTrapScanner';
import GlobalDividendScreener from '@/components/dividend/GlobalDividendScreener';

function formatPrice(val: number) {
  return val.toLocaleString('id-ID');
}

export default function DividendAnalysisPage() {
  const [viewTab, setViewTab] = useState<'global' | 'screener' | 'calendar' | 'snowball' | 'trap'>('global');
  const [filterType, setFilterType] = useState<'ALL' | 'PAYING' | 'NON_PAYING'>('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [boardFilter, setBoardFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Statistik Ringkasan 951 Saham
  const stats = useMemo(() => {
    const total = ALL_DIVIDEND_DATA.length;
    const paying = ALL_DIVIDEND_DATA.filter((s) => s.hasDividend).length;
    const nonPaying = total - paying;
    return {
      total,
      paying,
      payingPercent: ((paying / total) * 100).toFixed(1),
      nonPaying,
      nonPayingPercent: ((nonPaying / total) * 100).toFixed(1),
    };
  }, []);

  // Filter Data Dinamis
  const filteredData = useMemo(() => {
    return ALL_DIVIDEND_DATA.filter((s) => {
      const matchType =
        filterType === 'ALL' ||
        (filterType === 'PAYING' && s.hasDividend) ||
        (filterType === 'NON_PAYING' && !s.hasDividend);

      const matchSector = sectorFilter === 'ALL' || s.sector === sectorFilter;
      const matchBoard = boardFilter === 'ALL' || s.board === boardFilter;

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.reason && s.reason.toLowerCase().includes(q));

      return matchType && matchSector && matchBoard && matchSearch;
    });
  }, [filterType, sectorFilter, boardFilter, search]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  // Kategori Sektor Unik
  const sectors = useMemo(() => {
    const set = new Set(ALL_DIVIDEND_DATA.map((s) => s.sector));
    return ['ALL', ...Array.from(set).sort()];
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 font-mono" style={{ backgroundColor: 'rgba(0,200,83,0.1)', color: 'var(--positive)' }}>
              <Coins className="w-4 h-4" /> IDX Comprehensive Dividend Screener (951 Emiten BEI)
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Analisis Lengkap Dividen Seluruh 951 Saham Indonesia
            </h1>
            <p className="text-xs max-w-3xl mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Database audit menyeluruh yang membedah emiten yang membagikan dividen kas (yield, payout ratio, konsistensi) vs emiten yang tidak membagikan dividen beserta alasan hukum berdasarkan UU PT No. 40/2007 (defisit saldo laba, pertumbuhan capex, atau suspensi).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/portfolio"
              className="px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
              style={{ backgroundColor: 'var(--accent)', color: '#000' }}
            >
              Klaim Dividen di Portofolio &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Kartu Statistik Makro Dividen 951 Saham */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Total Emiten Dianalisis</div>
          <div className="text-xl font-bold font-mono-num" style={{ color: 'var(--text-primary)' }}>
            {stats.total} Emiten
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Seluruh saham tercatat di BEI</div>
        </div>

        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Saham Pembagi Dividen</div>
          <div className="text-xl font-bold font-mono-num flex items-center gap-1.5" style={{ color: 'var(--positive)' }}>
            <CheckCircle2 className="w-5 h-5" />
            {stats.paying} ({stats.payingPercent}%)
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Didominasi Papan Utama & BUMN</div>
        </div>

        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Saham Non-Dividen</div>
          <div className="text-xl font-bold font-mono-num flex items-center gap-1.5" style={{ color: 'var(--negative)' }}>
            <XCircle className="w-5 h-5" />
            {stats.nonPaying} ({stats.nonPayingPercent}%)
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Defisit saldo laba & capex pertumbuhan</div>
        </div>

        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Regulasi Pajak Dividen</div>
          <div className="text-xl font-bold font-mono-num" style={{ color: 'var(--accent)' }}>
            0% PPh Final
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Bebas pajak (UU Harmonisasi Perpajakan)</div>
        </div>
      </div>

      {/* View Switcher: Global vs IDX Screener vs Calendar vs Snowball */}
      <div className="flex border-b gap-2 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setViewTab('global')}
          className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          style={{
            color: viewTab === 'global' ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: viewTab === 'global' ? '2px solid var(--accent)' : '2px solid transparent',
          }}
        >
          <Globe className="w-4 h-4 text-sky-400" />
          Saham Luar Negeri (Investing.com Master Universe)
        </button>
        <button
          onClick={() => setViewTab('screener')}
          className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          style={{
            color: viewTab === 'screener' ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: viewTab === 'screener' ? '2px solid var(--accent)' : '2px solid transparent',
          }}
        >
          <Coins className="w-4 h-4" />
          Screener 951 Saham Indonesia (IDX)
        </button>
        <button
          onClick={() => setViewTab('calendar')}
          className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          style={{
            color: viewTab === 'calendar' ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: viewTab === 'calendar' ? '2px solid var(--accent)' : '2px solid transparent',
          }}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          Kalender Dividen &amp; Jadwal Cum Date
        </button>
        <button
          onClick={() => setViewTab('snowball')}
          className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          style={{
            color: viewTab === 'snowball' ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: viewTab === 'snowball' ? '2px solid var(--accent)' : '2px solid transparent',
          }}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Dividend Snowball Simulator
        </button>
        <button
          onClick={() => setViewTab('trap')}
          className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          style={{
            color: viewTab === 'trap' ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: viewTab === 'trap' ? '2px solid var(--accent)' : '2px solid transparent',
          }}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Dividend Trap &amp; Health Scanner
        </button>
      </div>

      {viewTab === 'global' ? (
        <GlobalDividendScreener />
      ) : viewTab === 'trap' ? (
        <DividendTrapScanner />
      ) : viewTab === 'snowball' ? (
        <DividendSnowballCalculator />
      ) : viewTab === 'calendar' ? (
        <DividendCalendar />
      ) : (
        <>
          {/* Filter Control Bar */}
          <div className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button
              onClick={() => { setFilterType('ALL'); setPage(1); }}
              className="px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
              style={{
                backgroundColor: filterType === 'ALL' ? 'var(--accent)' : 'transparent',
                color: filterType === 'ALL' ? '#000' : 'var(--text-muted)',
              }}
            >
              Semua 951 Saham
            </button>
            <button
              onClick={() => { setFilterType('PAYING'); setPage(1); }}
              className="px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              style={{
                backgroundColor: filterType === 'PAYING' ? 'var(--positive)' : 'transparent',
                color: filterType === 'PAYING' ? '#000' : 'var(--text-muted)',
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Pembagi Dividen ({stats.paying})
            </button>
            <button
              onClick={() => { setFilterType('NON_PAYING'); setPage(1); }}
              className="px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              style={{
                backgroundColor: filterType === 'NON_PAYING' ? 'var(--negative)' : 'transparent',
                color: filterType === 'NON_PAYING' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <XCircle className="w-3.5 h-3.5" /> Tidak Beri Dividen ({stats.nonPaying})
            </button>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border w-full lg:w-72" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}>
            <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari ticker, emiten, atau alasan..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-xs w-full"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Sektor & Papan Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs" style={{ borderColor: 'var(--border)' }}>
          <span className="font-semibold text-[11px]" style={{ color: 'var(--text-muted)' }}>Filter Sektor:</span>
          <select
            value={sectorFilter}
            onChange={(e) => { setSectorFilter(e.target.value); setPage(1); }}
            className="px-2.5 py-1 rounded border text-xs bg-transparent outline-none cursor-pointer"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            {sectors.map((s) => (
              <option key={s} value={s} className="bg-gray-900 text-white">
                {s === 'ALL' ? 'Semua Sektor' : s}
              </option>
            ))}
          </select>

          <span className="font-semibold text-[11px] ml-2" style={{ color: 'var(--text-muted)' }}>Papan Pencatatan:</span>
          <select
            value={boardFilter}
            onChange={(e) => { setBoardFilter(e.target.value); setPage(1); }}
            className="px-2.5 py-1 rounded border text-xs bg-transparent outline-none cursor-pointer"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="ALL" className="bg-gray-900 text-white">Semua Papan</option>
            <option value="Utama" className="bg-gray-900 text-white">Papan Utama</option>
            <option value="Pengembangan" className="bg-gray-900 text-white">Papan Pengembangan</option>
            <option value="Pemantauan Khusus" className="bg-gray-900 text-white">Papan Pemantauan Khusus</option>
            <option value="Akselerasi" className="bg-gray-900 text-white">Papan Akselerasi</option>
          </select>

          <span className="ml-auto text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
            Menemukan {filteredData.length} emiten
          </span>
        </div>
      </div>

      {/* Tabel Utama 951 Saham */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-12">No</th>
                <th>Ticker</th>
                <th>Nama Perusahaan</th>
                <th>Sektor</th>
                <th>Papan</th>
                <th className="text-center">Status Dividen</th>
                <th className="text-right">DPS Terakhir</th>
                <th className="text-right">Est. Yield</th>
                <th>Kategori / Alasan Non-Dividen</th>
                <th>Analisis Kebijakan Finansial</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, idx) => {
                const globalIndex = (page - 1) * pageSize + idx + 1;
                return (
                  <tr key={item.code}>
                    <td className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {globalIndex}
                    </td>
                    <td>
                      <Link
                        href={`/stock/${item.code}`}
                        className="font-bold font-mono text-xs hover:underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        {item.code}
                      </Link>
                    </td>
                    <td>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                        {item.name.length > 32 ? item.name.slice(0, 32) + '...' : item.name}
                      </span>
                    </td>
                    <td>
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {item.sector}
                      </span>
                    </td>
                    <td>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                        {item.board}
                      </span>
                    </td>
                    <td className="text-center">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded font-mono font-bold inline-flex items-center gap-1"
                        style={{
                          backgroundColor: item.hasDividend ? 'var(--positive-bg)' : 'var(--negative-bg)',
                          color: item.hasDividend ? 'var(--positive)' : 'var(--negative)',
                        }}
                      >
                        {item.hasDividend ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {item.hasDividend ? 'DIVIDEN' : 'NON-DIVIDEN'}
                      </span>
                    </td>
                    <td className="text-right font-mono-num text-xs font-semibold">
                      {item.hasDividend ? `Rp ${formatPrice(item.dps)}` : '—'}
                    </td>
                    <td className="text-right font-mono-num text-xs font-bold" style={{ color: item.hasDividend && item.yield >= 6 ? 'var(--positive)' : 'var(--text-primary)' }}>
                      {item.hasDividend ? `${item.yield.toFixed(1)}%` : '—'}
                    </td>
                    <td>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                        style={{
                          backgroundColor: item.hasDividend ? 'rgba(255,215,0,0.1)' : 'rgba(255,23,68,0.1)',
                          color: item.hasDividend ? '#ffd700' : 'var(--negative)',
                        }}
                      >
                        {item.hasDividend ? item.category : item.reason}
                      </span>
                    </td>
                    <td className="text-[11px] max-w-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {item.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          Halaman {page} dari {totalPages} ({filteredData.length} emiten)
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            &larr; Sebelumnya
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Berikutnya &rarr;
          </button>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
