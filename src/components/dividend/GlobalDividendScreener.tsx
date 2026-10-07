'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  Coins,
  Crown,
  Award,
  Flame,
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { INVESTING_COM_GLOBAL_DIVIDENDS, GlobalDividendStock } from '@/data/investing_global_dividends';
import { exportToCsv } from '@/lib/exportCsv';
import CompanyLogo from '@/components/common/CompanyLogo';

export default function GlobalDividendScreener() {
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedFrequency, setSelectedFrequency] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'yield' | 'growth' | 'dps' | 'payout'>('yield');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Extract unique countries
  const countries = useMemo(() => {
    const list = Array.from(new Set(INVESTING_COM_GLOBAL_DIVIDENDS.map((s) => s.country))).sort();
    return ['ALL', ...list];
  }, []);

  // Extract unique sectors
  const sectors = useMemo(() => {
    const list = Array.from(new Set(INVESTING_COM_GLOBAL_DIVIDENDS.map((s) => s.sector))).sort();
    return ['ALL', ...list];
  }, []);

  // Summary Metrics
  const summary = useMemo(() => {
    const total = INVESTING_COM_GLOBAL_DIVIDENDS.length;
    const kings = INVESTING_COM_GLOBAL_DIVIDENDS.filter((s) => s.category.includes('King')).length;
    const aristocrats = INVESTING_COM_GLOBAL_DIVIDENDS.filter((s) => s.category.includes('Aristocrat')).length;
    const monthly = INVESTING_COM_GLOBAL_DIVIDENDS.filter((s) => s.frequency === 'Monthly').length;
    const avgYield = (
      INVESTING_COM_GLOBAL_DIVIDENDS.reduce((acc, s) => acc + s.yieldPct, 0) / total
    ).toFixed(2);
    const highestYieldStock = [...INVESTING_COM_GLOBAL_DIVIDENDS].sort((a, b) => b.yieldPct - a.yieldPct)[0];

    return { total, kings, aristocrats, monthly, avgYield, highestYieldStock };
  }, []);

  // Filter & Sort
  const filteredStocks = useMemo(() => {
    return INVESTING_COM_GLOBAL_DIVIDENDS.filter((s) => {
      const matchCountry = selectedCountry === 'ALL' || s.country === selectedCountry;
      const matchCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
      const matchFrequency = selectedFrequency === 'ALL' || s.frequency === selectedFrequency;
      const matchSector = selectedSector === 'ALL' || s.sector === selectedSector;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q);

      return matchCountry && matchCategory && matchFrequency && matchSector && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'yield') return b.yieldPct - a.yieldPct;
      if (sortBy === 'growth') return b.growthYears - a.growthYears;
      if (sortBy === 'dps') return b.dps - a.dps;
      if (sortBy === 'payout') return b.payoutRatioPct - a.payoutRatioPct;
      return 0;
    });
  }, [selectedCountry, selectedCategory, selectedFrequency, selectedSector, search, sortBy]);

  const totalPages = Math.ceil(filteredStocks.length / pageSize) || 1;
  const paginatedData = filteredStocks.slice((page - 1) * pageSize, page * pageSize);

  const handleExportCsv = () => {
    exportToCsv<GlobalDividendStock>({
      filename: 'fincept_investing_global_dividends',
      columns: [
        { header: 'Ticker', accessor: (s) => s.ticker },
        { header: 'Nama Perusahaan', accessor: (s) => s.name },
        { header: 'Negara', accessor: (s) => s.country },
        { header: 'Bursa', accessor: (s) => s.exchange },
        { header: 'Mata Uang', accessor: (s) => s.currency },
        { header: 'Sektor', accessor: (s) => s.sector },
        { header: 'Harga', accessor: (s) => s.price },
        { header: 'DPS Tahunan', accessor: (s) => s.dps },
        { header: 'Dividend Yield (%)', accessor: (s) => s.yieldPct },
        { header: 'Payout Ratio (%)', accessor: (s) => s.payoutRatioPct },
        { header: 'Frekuensi', accessor: (s) => s.frequency },
        { header: 'Ex-Date', accessor: (s) => s.exDate },
        { header: 'Pay-Date', accessor: (s) => s.payDate },
        { header: 'Pertumbuhan Dividen (Tahun)', accessor: (s) => s.growthYears },
        { header: 'Kategori', accessor: (s) => s.category },
        { header: 'Sumber', accessor: (s) => s.source },
        { header: 'Catatan Analis', accessor: (s) => s.notes },
      ],
      data: filteredStocks,
    });
  };

  return (
    <div className="space-y-6 font-mono select-none">
      {/* ── Top Header Banner ── */}
      <div
        className="rounded-2xl border p-6 shadow-sm"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Globe className="w-4 h-4" /> Sumber Terverifikasi: Investing.com Global Dividend Database
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              Master Dividen Saham Global & Luar Negeri (Wall Street, Eropa & Asia)
            </h1>
            <p className="text-xs text-neutral-400 max-w-3xl mt-1 leading-relaxed">
              Database komprehensif saham-saham dividen dunia terdaftar di Investing.com: mencakup Dividend Kings (50+ tahun berturut-turut naik), Dividend Aristocrats (25+ tahun), saham dividen bulanan (Monthly REITs), raksasa teknologi, dan emiten komoditas berimbal hasil jumbo (&gt;5%).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-neutral-900 border-neutral-700 text-neutral-300">
              {filteredStocks.length} Saham Tersaring
            </span>
          </div>
        </div>

        {/* ── Quick Filter Pills ── */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-800/80 overflow-x-auto text-xs">
          <span className="text-neutral-500 text-[11px] font-bold uppercase shrink-0">Preset Cepat:</span>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedCountry('ALL');
              setSelectedFrequency('ALL');
            }}
            className={`px-3 py-1 rounded-lg border font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'ALL' && selectedCountry === 'ALL' && selectedFrequency === 'ALL'
                ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Semua ({summary.total})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('Dividend King (50+ Thn)');
              setSelectedCountry('ALL');
            }}
            className={`px-3 py-1 rounded-lg border font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'Dividend King (50+ Thn)'
                ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                : 'bg-neutral-900 border-neutral-800 text-amber-400 hover:text-amber-300'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Dividend Kings (50+ Thn)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('Dividend Aristocrat (25+ Thn)');
              setSelectedCountry('ALL');
            }}
            className={`px-3 py-1 rounded-lg border font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'Dividend Aristocrat (25+ Thn)'
                ? 'bg-sky-500 text-black border-sky-500 shadow-sm'
                : 'bg-neutral-900 border-neutral-800 text-sky-400 hover:text-sky-300'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Dividend Aristocrats (25+ Thn)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('High Yield (>5%)');
              setSelectedCountry('ALL');
            }}
            className={`px-3 py-1 rounded-lg border font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'High Yield (>5%)'
                ? 'bg-emerald-500 text-black border-emerald-500 shadow-sm'
                : 'bg-neutral-900 border-neutral-800 text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>High Yield (&gt;5%)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedFrequency('Monthly');
              setSelectedCategory('ALL');
            }}
            className={`px-3 py-1 rounded-lg border font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedFrequency === 'Monthly'
                ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                : 'bg-neutral-900 border-neutral-800 text-indigo-400 hover:text-indigo-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Dividen Tiap Bulan (Monthly REIT)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCountry('United States');
              setSelectedCategory('ALL');
            }}
            className={`px-3 py-1 rounded-lg border font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCountry === 'United States'
                ? 'bg-neutral-200 text-black border-white shadow-sm'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            🇺🇸 Wall Street S&amp;P 500
          </button>
        </div>
      </div>

      {/* ── 4 KPI Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          className="rounded-xl border p-4 shadow-sm"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="text-[11px] text-neutral-400 mb-1">Total Saham Global Dividen</div>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400" />
            <span>{summary.total} Emiten Dunia</span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">13 Negara &amp; Pasar Utama</div>
        </div>

        <div
          className="rounded-xl border p-4 shadow-sm"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="text-[11px] text-neutral-400 mb-1">Rata-Rata Yield Global</div>
          <div className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>{summary.avgYield}% / Tahun</span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">Imbal hasil dividen kas rata-rata</div>
        </div>

        <div
          className="rounded-xl border p-4 shadow-sm"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="text-[11px] text-neutral-400 mb-1">Top Yield Tertinggi</div>
          <div className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
            <span>
              {summary.highestYieldStock.ticker} ({summary.highestYieldStock.yieldPct}%)
            </span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1 truncate">
            {summary.highestYieldStock.name} ({summary.highestYieldStock.country})
          </div>
        </div>

        <div
          className="rounded-xl border p-4 shadow-sm"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="text-[11px] text-neutral-400 mb-1">Rekor Pertumbuhan Dividen</div>
          <div className="text-xl font-bold text-sky-400 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>PG (68 Thn) &amp; KO (62 Thn)</span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">Dividen naik tanpa absen &gt; setengah abad</div>
        </div>
      </div>

      {/* ── Filters & Controls Bar ── */}
      <div
        className="rounded-xl border p-4 shadow-sm space-y-3"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari simbol (KO, AAPL, TSM)..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border text-xs bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Country Filter */}
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-lg border text-xs bg-neutral-950 border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              {countries.map((c) => (
                <option key={`country-${c}`} value={c}>
                  {c === 'ALL' ? 'Semua Negara (Global)' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-lg border text-xs bg-neutral-950 border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              {[
                { val: 'ALL', label: 'Semua Kategori' },
                { val: 'Dividend King (50+ Thn)', label: '👑 Dividend King (50+ Thn)' },
                { val: 'Dividend Aristocrat (25+ Thn)', label: '🏰 Dividend Aristocrat (25+ Thn)' },
                { val: 'High Yield (>5%)', label: '🔥 High Yield (>5%)' },
                { val: 'Monthly Dividend REIT', label: '🗓️ Monthly Dividend REIT' },
                { val: 'Consistent Compounder', label: '📈 Consistent Compounder' },
              ].map((cat) => (
                <option key={`cat-${cat.val}`} value={cat.val}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div>
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-lg border text-xs bg-neutral-950 border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              {sectors.map((s) => (
                <option key={`sector-${s}`} value={s}>
                  {s === 'ALL' ? 'Semua Sektor' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 rounded-lg border text-xs bg-neutral-950 border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              {[
                { val: 'yield', label: 'Urutkan: Dividend Yield Tertinggi (%)' },
                { val: 'growth', label: 'Urutkan: Rekor Kenaikan Terlama (Tahun)' },
                { val: 'dps', label: 'Urutkan: Nilai DPS Terbesar' },
                { val: 'payout', label: 'Urutkan: Payout Ratio Terendah' },
              ].map((opt) => (
                <option key={`sort-${opt.val}`} value={opt.val}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Table Bar with Export Action ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs">
        <div className="text-neutral-400">
          Menampilkan <strong className="text-white">{filteredStocks.length}</strong> saham global dari 16 negara
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] border border-[#f59e0b]/40 transition-all cursor-pointer shadow-sm self-start sm:self-auto"
          title="Unduh seluruh data hasil filter ke format CSV / Excel"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor CSV / Excel ({filteredStocks.length} Data)</span>
        </button>
      </div>

      {/* ── Table Results ── */}
      <div
        className="rounded-xl border overflow-hidden shadow-sm"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-neutral-900/60 text-neutral-400 text-[11px]" style={{ borderColor: 'var(--border)' }}>
                <th className="p-3">EMITEN &amp; BURSA</th>
                <th className="p-3">NEGARA</th>
                <th className="p-3">SEKTOR</th>
                <th className="p-3 text-right">HARGA SAHAM</th>
                <th className="p-3 text-right">DPS (TAHUNAN)</th>
                <th className="p-3 text-right">DIVIDEND YIELD</th>
                <th className="p-3 text-center">PAYOUT RATIO</th>
                <th className="p-3 text-center">FREKUENSI</th>
                <th className="p-3 text-center">EX-DIVIDEND</th>
                <th className="p-3 text-center">TGL BAYAR</th>
                <th className="p-3 text-center">STREAK</th>
                <th className="p-3">INVESTING.COM THESIS / CATATAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-neutral-500">
                    Tidak ditemukan saham dividen global yang cocok dengan filter Anda.
                  </td>
                </tr>
              ) : (
                paginatedData.map((s, idx) => {
                  const isHighYield = s.yieldPct >= 5;
                  const isKing = s.category.includes('King');
                  const isAristocrat = s.category.includes('Aristocrat');

                  return (
                    <tr
                      key={`${s.ticker}-${idx}`}
                      className="hover:bg-neutral-800/40 transition-colors"
                    >
                      {/* Ticker & Exchange */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <CompanyLogo symbol={s.ticker} name={s.name} size={28} />
                          <div className="min-w-0">
                            <Link
                              href={`/stock/${s.ticker}`}
                              className="font-bold text-white hover:text-amber-400 flex items-center gap-1.5"
                            >
                              <span className="text-amber-400 font-mono">{s.ticker}</span>
                              <span className="text-[10px] px-1 py-0.2 rounded bg-neutral-800 border border-neutral-700 text-neutral-400 font-normal">
                                {s.exchange}
                              </span>
                            </Link>
                            <div className="text-[11px] text-neutral-400 truncate max-w-[150px] mt-0.5">
                              {s.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Country */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{s.flag}</span>
                          <span className="text-neutral-300">{s.country}</span>
                        </div>
                      </td>

                      {/* Sector */}
                      <td className="p-3 text-neutral-400 whitespace-nowrap">{s.sector}</td>

                      {/* Price */}
                      <td className="p-3 text-right font-bold text-white whitespace-nowrap">
                        {s.currency} {s.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* DPS */}
                      <td className="p-3 text-right text-emerald-400 font-semibold whitespace-nowrap">
                        {s.currency} {s.dps.toFixed(2)}
                      </td>

                      {/* Yield */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-extrabold text-xs ${
                            isHighYield
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : s.yieldPct >= 3
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {s.yieldPct.toFixed(2)}%
                        </span>
                      </td>

                      {/* Payout Ratio */}
                      <td className="p-3 text-center text-neutral-300">
                        <span className={`text-[11px] font-semibold ${s.payoutRatioPct > 80 ? 'text-amber-400' : 'text-neutral-300'}`}>
                          {s.payoutRatioPct}%
                        </span>
                      </td>

                      {/* Frequency */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            s.frequency === 'Monthly'
                              ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300 font-bold'
                              : s.frequency === 'Quarterly'
                              ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                              : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                          }`}
                        >
                          {s.frequency}
                        </span>
                      </td>

                      {/* Ex-Date */}
                      <td className="p-3 text-center font-mono text-[11px] text-amber-300/90 whitespace-nowrap">
                        {s.exDate}
                      </td>

                      {/* Pay Date */}
                      <td className="p-3 text-center font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                        {s.payDate}
                      </td>

                      {/* Growth Streak */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {isKing && <Crown className="w-3 h-3 text-amber-400" />}
                          {isAristocrat && <Award className="w-3 h-3 text-sky-400" />}
                          <span
                            className={`font-bold text-[11px] ${
                              isKing ? 'text-amber-400' : isAristocrat ? 'text-sky-400' : 'text-neutral-400'
                            }`}
                          >
                            {s.growthYears} Thn
                          </span>
                        </div>
                      </td>

                      {/* Investing.com Thesis Notes */}
                      <td className="p-3 text-[11px] text-neutral-400 max-w-sm">
                        <div className="line-clamp-2 leading-relaxed" title={s.notes}>
                          {s.notes}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div
          className="p-3 border-t flex items-center justify-between text-xs text-neutral-400"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            Menampilkan {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredStocks.length)} dari{' '}
            {filteredStocks.length} saham dividen luar negeri
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 disabled:opacity-30 hover:bg-neutral-800 text-white cursor-pointer"
            >
              &larr; Prev
            </button>
            <span className="px-3 py-1 font-bold text-white">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 disabled:opacity-30 hover:bg-neutral-800 text-white cursor-pointer"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
