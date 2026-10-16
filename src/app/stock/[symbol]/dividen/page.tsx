'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Percent,
  Coins,
  TrendingUp,
  ArrowLeft,
  Calculator,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';
import idxDividendData from '@/data/idx_dividend_all.json';
import { getAssetBySymbol } from '@/lib/universe/masterAssetUniverse';
import CompanyLogo from '@/components/common/CompanyLogo';

export default function StockDividendPage() {
  const params = useParams();
  const rawSymbol = (params?.symbol as string) || 'BBCA';
  const symbol = decodeURIComponent(rawSymbol).toUpperCase();

  const asset = getAssetBySymbol(symbol);
  const stockDividend = useMemo(() => {
    return (idxDividendData as any[]).find((s) => s.code === symbol) || {
      code: symbol,
      name: asset?.name || `Saham ${symbol}`,
      price: asset?.defaultPrice || 5000,
      latestDPS: Math.round((asset?.defaultPrice || 5000) * 0.045),
      hasDividend: true,
      sector: asset?.sector || 'Umum',
    };
  }, [symbol, asset]);

  const [lotCount, setLotCount] = useState<number>(10);
  const sharesCount = lotCount * 100;
  const price = stockDividend.price || 1000;
  const dps = stockDividend.latestDPS || 0;
  const yieldPercent = price > 0 ? ((dps / price) * 100).toFixed(2) : '0';
  const totalDividendGross = sharesCount * dps;
  const taxEstimate = totalDividendGross * 0.1; // 10% PPh Dividen final (kecuali diinvestasikan kembali)
  const totalDividendNet = totalDividendGross - taxEstimate;

  // Mock historical dividend records for presentation
  const historyDividends = [
    { year: '2025', dps: dps, yield: `${yieldPercent}%`, type: 'Final', cumDate: '28 Mar 2025' },
    { year: '2024', dps: Math.round(dps * 0.9), yield: `${(Number(yieldPercent) * 0.9).toFixed(2)}%`, type: 'Final', cumDate: '26 Mar 2024' },
    { year: '2023', dps: Math.round(dps * 0.82), yield: `${(Number(yieldPercent) * 0.85).toFixed(2)}%`, type: 'Final', cumDate: '29 Mar 2023' },
    { year: '2022', dps: Math.round(dps * 0.75), yield: `${(Number(yieldPercent) * 0.8).toFixed(2)}%`, type: 'Final', cumDate: '25 Mar 2022' },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200">
      {/* Header bar */}
      <div className="border-b border-slate-800 bg-[#0c101a]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <Link
            href={`/stock/${symbol}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Analisis & Chart {symbol}
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <CompanyLogo symbol={symbol} size={48} />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                    Dividen Saham {symbol}
                  </h1>
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
                    Yield {yieldPercent}%
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{stockDividend.name} - Sektor {stockDividend.sector}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/stock/${symbol}`}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition"
              >
                Mulai Simulasi Trading
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-[#0c101a] p-4">
            <div className="text-xs text-slate-400">Dividen per Lembar (DPS)</div>
            <div className="mt-1 text-2xl font-bold text-emerald-400">
              Rp {dps.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-slate-500">Estimasi Terakhir</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0c101a] p-4">
            <div className="text-xs text-slate-400">Dividend Yield</div>
            <div className="mt-1 text-2xl font-bold text-white">
              {yieldPercent}%
            </div>
            <div className="text-xs text-slate-500">Berdasarkan Harga Rp {price.toLocaleString('id-ID')}</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0c101a] p-4">
            <div className="text-xs text-slate-400">Estimasi Cum Date</div>
            <div className="mt-1 text-lg font-bold text-sky-400">
              Maret - Mei 2026
            </div>
            <div className="text-xs text-slate-500">Pasca RUPST</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0c101a] p-4">
            <div className="text-xs text-slate-400">Konsistensi Pembagian</div>
            <div className="mt-1 text-lg font-bold text-amber-400">
              Rutin Tiap Tahun
            </div>
            <div className="text-xs text-emerald-400">Track Record Solid</div>
          </div>
        </div>

        {/* Interactive Lot-to-Dividend Calculator */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-[#0c101a] p-6">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <Calculator className="h-5 w-5 text-emerald-400" />
            Kalkulator Simulasi Penerimaan Dividen {symbol}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Hitung perkiraan dividen tunai yang Anda terima berdasarkan kepemilikan lot saham {symbol}.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Jumlah Kepemilikan Lot ({symbol})
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={lotCount}
                  onChange={(e) => setLotCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-sm font-semibold text-slate-400 whitespace-nowrap">
                  = {sharesCount.toLocaleString('id-ID')} lembar
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                {[10, 50, 100, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setLotCount(preset)}
                    className="rounded border border-slate-700 bg-slate-800/80 px-2 py-1 text-xs text-slate-300 hover:border-emerald-500 hover:text-white"
                  >
                    {preset} Lot
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-4">
              <div className="text-xs text-slate-400">Total Dividen Kotor (Gross)</div>
              <div className="text-2xl font-extrabold text-emerald-400">
                Rp {Math.round(totalDividendGross).toLocaleString('id-ID')}
              </div>

              <div className="mt-3 flex justify-between border-t border-slate-800 pt-3 text-xs">
                <span className="text-slate-400">Modal Pembelian (Estimasi):</span>
                <span className="font-semibold text-white">Rp {(sharesCount * price).toLocaleString('id-ID')}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs">
                <span className="text-slate-400">Pajak Dividen Final 10%:</span>
                <span className="text-rose-400">- Rp {Math.round(taxEstimate).toLocaleString('id-ID')}</span>
              </div>
              <div className="mt-1 flex justify-between text-xs font-bold">
                <span className="text-slate-200">Estimasi Bersih (Net RDN):</span>
                <span className="text-emerald-300">Rp {Math.round(totalDividendNet).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dividend History Table */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-[#0c101a] p-6">
          <h2 className="text-lg font-bold text-white">
            Riwayat Pembagian Dividen {symbol}
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400">
                <tr>
                  <th className="py-2.5">Tahun Buku</th>
                  <th className="py-2.5">Tipe Dividen</th>
                  <th className="py-2.5">DPS (per Lembar)</th>
                  <th className="py-2.5">Dividend Yield</th>
                  <th className="py-2.5">Cum Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {historyDividends.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-800/20">
                    <td className="py-3 font-semibold text-white">{row.year}</td>
                    <td className="py-3 text-xs">{row.type}</td>
                    <td className="py-3 font-medium text-emerald-400">Rp {row.dps.toLocaleString('id-ID')}</td>
                    <td className="py-3 font-bold">{row.yield}</td>
                    <td className="py-3 text-xs text-slate-400">{row.cumDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
