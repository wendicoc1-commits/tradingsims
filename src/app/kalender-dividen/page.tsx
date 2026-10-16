'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Percent,
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Coins,
  Building2,
  CheckCircle2,
  Sparkles,
  Calculator,
  HelpCircle,
} from 'lucide-react';
import idxDividendData from '@/data/idx_dividend_all.json';
import CompanyLogo from '@/components/common/CompanyLogo';

export default function KalenderDividenPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'HIGH_YIELD' | 'BIG_4_BANK' | 'KOMODITAS'>('ALL');
  const [minYield, setMinYield] = useState<number>(0);

  // Top high yield & famous dividend stocks
  const dividendStocks = useMemo(() => {
    return (idxDividendData as any[])
      .filter((s) => s.hasDividend && s.latestDPS > 0)
      .map((s) => {
        const yieldPercent = s.price > 0 ? ((s.latestDPS / s.price) * 100) : 0;
        return {
          code: s.code,
          name: s.name,
          price: s.price,
          latestDPS: s.latestDPS,
          yieldPercent: Number(yieldPercent.toFixed(2)),
          sector: s.sector || 'Umum',
          cumDate: s.cumDate || 'Segera Diumumkan',
          exDate: s.exDate || 'Segera Diumumkan',
          paymentDate: s.paymentDate || 'Segera Diumumkan',
        };
      })
      .sort((a, b) => b.yieldPercent - a.yieldPercent);
  }, []);

  const filteredStocks = useMemo(() => {
    return dividendStocks.filter((s) => {
      const matchSearch =
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchYield = s.yieldPercent >= minYield;

      if (!matchSearch || !matchYield) return false;

      if (selectedCategory === 'HIGH_YIELD') return s.yieldPercent >= 7.0;
      if (selectedCategory === 'BIG_4_BANK') return ['BBCA', 'BBRI', 'BMRI', 'BBNI'].includes(s.code);
      if (selectedCategory === 'KOMODITAS') return ['PTBA', 'ADRO', 'ITMG', 'PGAS', 'ANTM', 'MEDC'].includes(s.code);

      return true;
    });
  }, [dividendStocks, searchTerm, selectedCategory, minYield]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200">
      {/* Hero Section */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-[#0f172a]/40 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                <Calendar className="h-3.5 w-3.5" />
                Jadwal Saham Pembagi Dividen BEI 2026
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Kalender Dividen Saham IHSG Terlengkap
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
                Pantau tanggal Cum Date, Ex Date, Dividen per Lembar (DPS), dan ranking Dividend Yield tertinggi untuk 950+ emiten Bursa Efek Indonesia.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/tools/kalkulator-dividen"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
              >
                <Calculator className="h-4 w-4 text-emerald-400" />
                Kalkulator Dividen
              </Link>
              <Link
                href="/dividend"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                <Sparkles className="h-4 w-4" />
                Dividend Snowball Simulator
              </Link>
            </div>
          </div>

          {/* Quick Stat Highlights */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-[#0c101a] p-4">
              <div className="text-xs text-slate-400">Emiten Pembagi Dividen</div>
              <div className="mt-1 text-2xl font-bold text-white">{dividendStocks.length} Saham</div>
              <div className="text-xs text-emerald-400">Terdaftar di BEI</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0c101a] p-4">
              <div className="text-xs text-slate-400">Yield Tertinggi Rata-rata</div>
              <div className="mt-1 text-2xl font-bold text-emerald-400">12.5% - 21.0%</div>
              <div className="text-xs text-slate-400">Sektor Batubara & Energi</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0c101a] p-4">
              <div className="text-xs text-slate-400">Rata-rata Yield Big 4 Bank</div>
              <div className="mt-1 text-2xl font-bold text-sky-400">3.8% - 6.2%</div>
              <div className="text-xs text-slate-400">Konsisten & Stabil</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0c101a] p-4">
              <div className="text-xs text-slate-400">Bulan Musim Dividen Terpadat</div>
              <div className="mt-1 text-2xl font-bold text-amber-400">April - Juni</div>
              <div className="text-xs text-slate-400">Pasca RUPS Tahunan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Filter & Search Bar */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-[#0c101a] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Cari kode saham atau nama emiten (misal: BBCA, PTBA, ITMG)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Semua ({dividendStocks.length})
            </button>
            <button
              onClick={() => setSelectedCategory('HIGH_YIELD')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === 'HIGH_YIELD'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Yield &gt; 7% (High Yield)
            </button>
            <button
              onClick={() => setSelectedCategory('BIG_4_BANK')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === 'BIG_4_BANK'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Big 4 Bank
            </button>
            <button
              onClick={() => setSelectedCategory('KOMODITAS')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === 'KOMODITAS'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Komoditas & Energi
            </button>
          </div>
        </div>

        {/* Table of Dividend Stocks */}
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-[#0c101a]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/60 text-xs font-semibold uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3.5">Emiten</th>
                  <th className="px-4 py-3.5">Harga Pasar</th>
                  <th className="px-4 py-3.5">Dividen / Lbr (DPS)</th>
                  <th className="px-4 py-3.5">Dividend Yield</th>
                  <th className="px-4 py-3.5">Cum Date</th>
                  <th className="px-4 py-3.5">Ex Date</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStocks.slice(0, 60).map((stock) => (
                  <tr key={stock.code} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <CompanyLogo symbol={stock.code} size={28} />
                        <div>
                          <Link
                            href={`/stock/${stock.code}`}
                            className="font-bold text-white hover:text-emerald-400 transition"
                          >
                            {stock.code}
                          </Link>
                          <div className="text-xs text-slate-400 truncate max-w-[200px]">
                            {stock.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-200">
                      Rp {stock.price.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-400">
                      Rp {stock.latestDPS.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold ${
                        stock.yieldPercent >= 8
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : stock.yieldPercent >= 4
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {stock.yieldPercent}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-300">
                      {stock.cumDate}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {stock.exDate}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/stock/${stock.code}/dividen`}
                          className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:border-emerald-500 hover:text-white transition"
                        >
                          Histori
                        </Link>
                        <Link
                          href={`/stock/${stock.code}`}
                          className="rounded bg-emerald-600/80 px-2.5 py-1 text-xs text-white hover:bg-emerald-500 transition"
                        >
                          Simulasi
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStocks.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">
              Tidak ada saham dividen yang cocok dengan kata kunci pencarian.
            </div>
          )}
        </div>

        {/* Educational Content & Dividend Traps Guide for SEO */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-[#0c101a] p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-white">
              Istilah Penting Dalam Kalender Dividen Saham Indonesia
            </h2>
            <div className="mt-4 space-y-4 text-sm text-slate-300 leading-relaxed">
              <div>
                <strong className="text-emerald-400">1. Cum Date (Cumulative Date):</strong> Tanggal terakhir bagi investor untuk membeli atau menyimpan saham agar berhak tercatat sebagai penerima dividen. Jika Anda membeli saham di tanggal Cum Date dan menahannya sampai bursa tutup, Anda berhak atas dividen.
              </div>
              <div>
                <strong className="text-amber-400">2. Ex Date (Expired Date):</strong> Tanggal di mana hak atas dividen sudah hilang. Jika membeli saham pada hari Ex Date, Anda tidak akan mendapatkan dividen. Di hari Ex Date, harga saham di bursa umumnya mengalami koreksi wajar sebesar nominal dividen per lembar (DPS).
              </div>
              <div>
                <strong className="text-sky-400">3. Recording Date:</strong> Tanggal penentuan daftar resmi pemegang saham (DPS) oleh KSEI yang berhak menerima dividen tunai.
              </div>
              <div>
                <strong className="text-indigo-400">4. Payment Date:</strong> Hari di mana dana dividen tunai secara otomatis ditransfer ke Rekening Dana Nasabah (RDN) Anda.
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <ShieldAlert className="h-5 w-5" />
              Waspada Dividend Trap!
            </div>
            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              Dividend Trap terjadi saat investor tergoda membeli saham dengan yield dividen sangat tinggi (misal &gt;15%), namun pada hari <strong>Ex Date</strong> harga sahamnya anjlok lebih dalam dari nominal dividen yang diterima (misal ARB berhari-hari).
            </p>
            <div className="mt-4 rounded-lg border border-slate-800 bg-black/40 p-3 text-xs text-slate-400">
              💡 <strong>Tips TradeSim Pro:</strong> Gunakan simulator dividen kami untuk menguji skenario dividend capture strategy sebelum mengambil keputusan dengan uang riil.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
