'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Coins, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  HelpCircle,
  Percent,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface PresetStock {
  ticker: string;
  name: string;
  price: number;
  dps: number;
}

const POPULAR_DIVIDEND_PRESETS: PresetStock[] = [
  { ticker: 'PTBA', name: 'Bukit Asam', price: 2500, dps: 397 },
  { ticker: 'ITMG', name: 'Indo Tambangraya', price: 26000, dps: 2750 },
  { ticker: 'BBRI', name: 'Bank Rakyat Indonesia', price: 4700, dps: 285 },
  { ticker: 'BBCA', name: 'Bank Central Asia', price: 9800, dps: 270 },
  { ticker: 'ASII', name: 'Astra International', price: 5100, dps: 421 },
];

export default function KalkulatorDividenPage() {
  const [stockPrice, setStockPrice] = useState<number>(4700);
  const [dps, setDps] = useState<number>(285);
  const [lots, setLots] = useState<number>(100);
  const [isReinvested, setIsReinvested] = useState<boolean>(true); // Pajak 0% jika diinvestasikan kembali di NKRI

  const calculation = useMemo(() => {
    const totalShares = Math.max(0, lots) * 100;
    const totalCapital = totalShares * Math.max(0, stockPrice);
    const grossDividend = totalShares * Math.max(0, dps);
    const taxRate = isReinvested ? 0.0 : 0.10; // Pajak dividen PPh Final 10% atau 0% jika diinvestasikan kembali (UU HPP)
    const taxAmount = grossDividend * taxRate;
    const netDividend = grossDividend - taxAmount;
    const yieldPercentage = stockPrice > 0 ? (dps / stockPrice) * 100 : 0;

    return {
      totalShares,
      totalCapital,
      grossDividend,
      taxAmount,
      netDividend,
      yieldPercentage,
    };
  }, [stockPrice, dps, lots, isReinvested]);

  const applyPreset = (preset: PresetStock) => {
    setStockPrice(preset.price);
    setDps(preset.dps);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-emerald-400 transition">Beranda</Link>
          <span>/</span>
          <Link href="/dividend" className="hover:text-emerald-400 transition">Dividen</Link>
          <span>/</span>
          <span className="text-emerald-400 font-medium">Kalkulator Dividen Saham</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <Coins className="w-4 h-4" />
            <span>Financial Tools & Dividend Yield Calculator</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            Kalkulator Dividen Saham BEI
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Hitung estimasi passive income dividen per tahun, persentase dividend yield, dan simulasi keuntungan dividen saham Anda.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-8">
          <span className="text-xs text-slate-400 block mb-2 font-semibold">Pilih Contoh Emiten Saham Dividen Populer:</span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_DIVIDEND_PRESETS.map((p) => (
              <button
                key={p.ticker}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <span className="text-emerald-400">{p.ticker}</span>
                <span className="text-slate-500">•</span>
                <span>Rp {p.price.toLocaleString('id-ID')}</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1 rounded">
                  DPS {p.dps}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Calculator & Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Input Panel */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <span>Input Data Investasi</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Harga Saham per Lembar (Rp)
                </label>
                <input
                  type="number"
                  min={1}
                  value={stockPrice || ''}
                  onChange={(e) => setStockPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  DPS - Dividen Per Lembar / Dividend Per Share (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={dps || ''}
                  onChange={(e) => setDps(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Jumlah Lot Saham yang Dimiliki
                </label>
                <input
                  type="number"
                  min={1}
                  value={lots || ''}
                  onChange={(e) => setLots(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500 text-sm"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  1 Lot = 100 lembar saham (Total: {calculation.totalShares.toLocaleString('id-ID')} lembar)
                </span>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isReinvested}
                    onChange={(e) => setIsReinvested(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-950 border-slate-700"
                  />
                  <span>Reinvestasi di Indonesia (Bebas Pajak 0% UU Cipta Kerja)</span>
                </label>
                <span className="text-[10px] text-slate-500 block pl-6">
                  {isReinvested ? '✅ Bebas pajak PPh dividen 0%' : '⚠️ Dikenakan PPh Final Dividen 10%'}
                </span>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5 text-emerald-400" />
                <span>Hasil Estimasi Dividen</span>
              </h2>

              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 mb-5 text-center">
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block mb-1">
                  Estimasi Dividen Bersih
                </span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-400 block mb-1">
                  Rp {Math.round(calculation.netDividend).toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-400">
                  Dividend Yield: <strong className="text-white">{calculation.yieldPercentage.toFixed(2)}%</strong>
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Total Modal Investasi:</span>
                  <span className="font-bold text-white">Rp {calculation.totalCapital.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Total Kepemilikan Lembar:</span>
                  <span className="font-bold text-white">{calculation.totalShares.toLocaleString('id-ID')} Lembar ({lots} Lot)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Dividen Kotor (Gross):</span>
                  <span className="font-bold text-white">Rp {calculation.grossDividend.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Pajak Dividen ({isReinvested ? '0%' : '10%'}):</span>
                  <span className="font-bold text-rose-400">- Rp {Math.round(calculation.taxAmount).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                href="/terminal"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs text-center transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <span>Praktikkan Simulasi Beli Saham Ini</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* SEO Educational Text Section */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-sm text-slate-300 space-y-4">
          <h3 className="text-base font-bold text-white">
            Rumus & Cara Menghitung Dividen Saham Indonesia
          </h3>
          <p className="leading-relaxed">
            Dividen saham adalah bagian dari keuntungan bersih perusahaan yang dibagikan kepada para pemegang saham secara proporsional berdasarkan jumlah lembar saham yang dimiliki.
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-emerald-400">
            Total Dividen = Jumlah Lembar Saham x Dividen per Lembar (DPS)<br />
            Dividend Yield (%) = (DPS / Harga Pasar Saham Saat Ini) x 100%
          </div>
          <p className="leading-relaxed">
            Berdasarkan UU Cipta Kerja (Harmonisasi Peraturan Perpajakan), dividen yang diterima oleh wajib pajak orang pribadi dalam negeri **bebas pajak (tarif 0%)** asalkan dividen tersebut diinvestasikan kembali di wilayah Negara Kesatuan Republik Indonesia dalam jangka waktu minimal 3 tahun.
          </p>
        </div>
      </div>
    </div>
  );
}
