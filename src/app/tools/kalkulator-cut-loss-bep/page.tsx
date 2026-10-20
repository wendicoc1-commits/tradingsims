'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calculator,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  Percent,
  RotateCcw,
  Scale,
  Sparkles,
} from 'lucide-react';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

const LOSS_MATRIX = [
  { loss: 5, gainNeeded: 5.26, difficulty: 'Sangat Mudah' },
  { loss: 10, gainNeeded: 11.11, difficulty: 'Mudah' },
  { loss: 15, gainNeeded: 17.65, difficulty: 'Sedang' },
  { loss: 20, gainNeeded: 25.00, difficulty: 'Sedang' },
  { loss: 25, gainNeeded: 33.33, difficulty: 'Menantang' },
  { loss: 30, gainNeeded: 42.86, difficulty: 'Berat' },
  { loss: 40, gainNeeded: 66.67, difficulty: 'Sangat Berat' },
  { loss: 50, gainNeeded: 100.00, difficulty: 'Ekstrem (Butuh Bagian 2x lipat)' },
  { loss: 60, gainNeeded: 150.00, difficulty: 'Kritis' },
  { loss: 75, gainNeeded: 300.00, difficulty: 'Hampir Mustahil (Butuh 4x lipat)' },
  { loss: 90, gainNeeded: 900.00, difficulty: 'Kerusakan Modal Total' },
];

export default function CutLossBreakEvenCalculatorPage() {
  const [initialCapital, setInitialCapital] = useState<number>(50000000); // 50 Juta
  const [currentLossPercent, setCurrentLossPercent] = useState<number>(20); // 20%

  const stats = useMemo(() => {
    const lossFraction = Math.min(0.99, Math.max(0.01, currentLossPercent / 100));
    // Rumus matematis pemulihan kerugian: (1 / (1 - Loss)) - 1
    const gainNeededPercent = parseFloat((((1 / (1 - lossFraction)) - 1) * 100).toFixed(2));

    const remainingCapital = initialCapital * (1 - lossFraction);
    const lossAmountIdr = initialCapital - remainingCapital;
    const recoveryProfitNeededIdr = remainingCapital * (gainNeededPercent / 100);

    let severity = 'TERKENDALI';
    let severityColor = 'text-emerald-400';
    let severityBg = 'bg-emerald-500/10 border-emerald-500/30';
    let advice = 'Kerugian masih dalam batas wajar. Kedisiplinan cut-loss di level ini mudah dipulihkan dengan 1-2 transaksi standar.';

    if (currentLossPercent >= 50) {
      severity = 'BENCANA MODAL (EKSTREM)';
      severityColor = 'text-rose-400';
      severityBg = 'bg-rose-500/10 border-rose-500/40';
      advice = 'Anda membutuhkan kenaikan +100% atau lebih dari sisa modal hanya untuk kembali ke titik nol. Hindari hold saham zombie yang terus membusuk.';
    } else if (currentLossPercent >= 30) {
      severity = 'BERAT / KRITIS';
      severityColor = 'text-amber-400';
      severityBg = 'bg-amber-500/10 border-amber-500/40';
      advice = 'Membutuhkan kenaikan di atas +40% untuk kembali modal. Evaluasi apakah modal lebih produktif jika dirotasi ke emiten berfundamental sehat.';
    }

    return {
      gainNeededPercent,
      remainingCapital,
      lossAmountIdr,
      recoveryProfitNeededIdr,
      severity,
      severityColor,
      severityBg,
      advice,
    };
  }, [initialCapital, currentLossPercent]);

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 font-sans">
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/terminal" className="hover:text-emerald-400 transition-colors">Tools</Link>
          <span>/</span>
          <span className="text-zinc-200">Kalkulator Cut-Loss &amp; BEP Pemulihan Modal</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-zinc-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono mb-3">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Matematika Pemulihan Asimetris Saham</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Kalkulator Pemulihan Kerugian &amp; Break-Even (Cut Loss)
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Ketahui secara pasti berapa persen keuntungan yang wajib Anda raih dari sisa modal untuk kembali ke titik impas (Break-Even Point / BEP) setelah mengalami kerugian.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <ShareWebsiteButton variant="tool" />
          </div>
        </div>

        {/* Grid Input & Hasil */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Kolom Kiri: Input */}
          <div className="lg:col-span-6 bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 font-mono">
              <Calculator className="w-4 h-4 text-rose-400" />
              <span>Kondisi Portofolio Saat Ini</span>
            </h2>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">
                  Modal Awal Portofolio (Sebelum Rugi)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500">Rp</span>
                  <input
                    type="number"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Number(e.target.value) || 0)}
                    className="w-full bg-[#161c2c] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1.5 flex justify-between">
                  <span>Persentase Penurunan / Floating Loss</span>
                  <span className="text-rose-400 font-bold">-{currentLossPercent}% (-Rp {Math.round(stats.lossAmountIdr).toLocaleString('id-ID')})</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="90"
                  step="1"
                  value={currentLossPercent}
                  onChange={(e) => setCurrentLossPercent(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>-5% (Ringan)</span>
                  <span>-20% (Kritis)</span>
                  <span>-50% (Bencana)</span>
                  <span>-90%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#141b2a] border border-zinc-800 text-xs space-y-2 mt-4">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Sisa Modal Anda Sekarang:</span>
                  <span className="text-white font-bold">Rp {Math.round(stats.remainingCapital).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Kerugian Nominal:</span>
                  <span className="text-rose-400 font-bold">-Rp {Math.round(stats.lossAmountIdr).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Hasil BEP */}
          <div className="lg:col-span-6 bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-zinc-400 font-bold uppercase">Tingkat Keparahan Modal</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border ${stats.severityBg} ${stats.severityColor}`}>
                  {stats.severity}
                </span>
              </div>

              {/* BEP Hero Stat */}
              <div className="p-5 rounded-xl bg-[#141b2a] border border-zinc-800 text-center mb-5">
                <span className="text-[11px] font-mono text-zinc-400 block mb-1">
                  KENAIKAN YANG DIBUTUHKAN UNTUK KEMBALI MODAL (BEP)
                </span>
                <span className="text-4xl sm:text-5xl font-mono font-black text-emerald-400">
                  +{stats.gainNeededPercent}%
                </span>
                <p className="text-xs text-zinc-400 font-mono mt-2">
                  Dari sisa modal <b>Rp {Math.round(stats.remainingCapital).toLocaleString('id-ID')}</b>, Anda wajib menghasilkan profit <b>+Rp {Math.round(stats.recoveryProfitNeededIdr).toLocaleString('id-ID')}</b>.
                </p>
              </div>

              {/* Box Pemahaman Logika */}
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-sans">
                💡 <b>Prinsip Matematika Asimetris:</b> Kerugian bekerja secara geometris melawan Anda. Saat portofolio turun 50%, modal Anda tidak butuh naik 50% untuk pulih, melainkan <b>wajib naik 100% (2x lipat)</b>.
              </div>
            </div>

            <p className="text-xs text-zinc-400 mt-4 italic font-sans leading-relaxed border-t border-zinc-800/80 pt-3">
              🎯 <b>Rekomendasi Trader Pro:</b> {stats.advice}
            </p>
          </div>
        </div>

        {/* Tabel Matriks Pemulihan Kerugian */}
        <section className="bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-zinc-300 mb-8">
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <span>Matriks Pemulihan Kerugian Asimetris Saham</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/60">
                  <th className="py-2.5 px-3 text-left">Tingkat Kerugian (% Loss)</th>
                  <th className="py-2.5 px-3 text-left">Kenaikan untuk BEP (% Gain Needed)</th>
                  <th className="py-2.5 px-3 text-left">Tingkat Kesulitan Pemulihan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {LOSS_MATRIX.map((row) => {
                  const isCurrent = Math.abs(row.loss - currentLossPercent) <= 2;
                  return (
                    <tr
                      key={row.loss}
                      className={isCurrent ? 'bg-amber-500/15 font-bold text-amber-300' : 'hover:bg-zinc-900/40 text-zinc-300'}
                    >
                      <td className="py-2 px-3 text-rose-400 font-bold">-{row.loss}%</td>
                      <td className="py-2 px-3 text-emerald-400 font-bold">+{row.gainNeeded.toFixed(2)}%</td>
                      <td className="py-2 px-3 text-zinc-400">{row.difficulty}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* E-E-A-T Compliance Badge */}
        <div className="mt-8">
          <EeatComplianceBadge />
        </div>
      </main>
    </div>
  );
}
