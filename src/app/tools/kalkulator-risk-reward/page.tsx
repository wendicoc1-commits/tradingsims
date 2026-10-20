'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calculator,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Target,
  Percent,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Scale,
  Sparkles,
} from 'lucide-react';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

export default function RiskRewardCalculatorPage() {
  const [totalCapital, setTotalCapital] = useState<number>(50000000); // 50 Juta
  const [riskTolerancePercent, setRiskTolerancePercent] = useState<number>(2); // 2%
  const [entryPrice, setEntryPrice] = useState<number>(5000);
  const [stopLossPrice, setStopLossPrice] = useState<number>(4700);
  const [targetPrice, setTargetPrice] = useState<number>(5600);

  const stats = useMemo(() => {
    const riskPerShare = Math.max(0, entryPrice - stopLossPrice);
    const rewardPerShare = Math.max(0, targetPrice - entryPrice);

    const riskPercent = entryPrice > 0 ? (riskPerShare / entryPrice) * 100 : 0;
    const rewardPercent = entryPrice > 0 ? (rewardPerShare / entryPrice) * 100 : 0;

    const rrRatio = riskPerShare > 0 ? parseFloat((rewardPerShare / riskPerShare).toFixed(2)) : 0;

    // Uang maksimal yang boleh rugi (Capital * Risk%)
    const maxRiskIdr = totalCapital * (riskTolerancePercent / 100);

    // Risiko per lot (100 lembar)
    const riskPerLot = riskPerShare * 100;

    // Maksimal lot yang boleh dibeli
    const maxLotsAllowed = riskPerLot > 0 ? Math.floor(maxRiskIdr / riskPerLot) : 0;

    // Total modal yang dibelanjakan
    const totalAllocatedIdr = maxLotsAllowed * entryPrice * 100;

    // Potensi Profit & Loss
    const potentialProfitIdr = maxLotsAllowed * rewardPerShare * 100;
    const potentialLossIdr = maxLotsAllowed * riskPerShare * 100;

    let verdict = 'HINDARI (RISIKO TINGGI)';
    let verdictColor = 'text-rose-400';
    let verdictBg = 'bg-rose-500/10 border-rose-500/30';
    let advice = 'Rasio Risk/Reward di bawah 1.5:1 tidak memberikan margin of safety memadai. Sesuaikan target profit lebih tinggi atau cari saham dengan stop loss lebih ketat.';

    if (rrRatio >= 2.0) {
      verdict = 'SANGAT BAIK (ASIMETRIS)';
      verdictColor = 'text-emerald-400';
      verdictBg = 'bg-emerald-500/10 border-emerald-500/30';
      advice = 'Peluang transaksi memiliki rasio asimetri ideal. Ganjaran keuntungan minimal 2x lipat dari potensi risiko kerugian.';
    } else if (rrRatio >= 1.5) {
      verdict = 'LAYAK / CUKUP';
      verdictColor = 'text-amber-400';
      verdictBg = 'bg-amber-500/10 border-amber-500/30';
      advice = 'Rasio memenuhi standar minimum trading institusional (1.5:1). Gunakan trailing stop saat target pertama tercapai.';
    }

    return {
      riskPerShare,
      rewardPerShare,
      riskPercent,
      rewardPercent,
      rrRatio,
      maxRiskIdr,
      maxLotsAllowed,
      totalAllocatedIdr,
      potentialProfitIdr,
      potentialLossIdr,
      verdict,
      verdictColor,
      verdictBg,
      advice,
    };
  }, [totalCapital, riskTolerancePercent, entryPrice, stopLossPrice, targetPrice]);

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 font-sans">
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/terminal" className="hover:text-emerald-400 transition-colors">Tools</Link>
          <span>/</span>
          <span className="text-zinc-200">Kalkulator Risk/Reward Saham</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-zinc-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3">
              <Scale className="w-3.5 h-3.5" />
              <span>Money Management &amp; Sizing Institusional</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Kalkulator Risk/Reward &amp; Ukuran Posisi Saham
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Hitung rasio Risk to Reward (R:R), batas toleransi kerugian modal (Risk per Trade), dan jumlah lot saham maksimal yang aman dibeli sebelum menekan tombol order.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <ShareWebsiteButton variant="tool" />
          </div>
        </div>

        {/* Grid Input & Hasil */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Kolom Kiri: Formulir Input */}
          <div className="lg:col-span-6 bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 font-mono">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Parameter Transaksi</span>
            </h2>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">
                  Total Modal Portofolio (Kas RDN)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500">Rp</span>
                  <input
                    type="number"
                    value={totalCapital}
                    onChange={(e) => setTotalCapital(Number(e.target.value) || 0)}
                    className="w-full bg-[#161c2c] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1.5 flex justify-between">
                  <span>Toleransi Risiko per Trade (% Modal)</span>
                  <span className="text-emerald-400 font-bold">{riskTolerancePercent}% (Rp {Math.round(stats.maxRiskIdr).toLocaleString('id-ID')})</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={riskTolerancePercent}
                  onChange={(e) => setRiskTolerancePercent(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>0.5% (Sangat Konservatif)</span>
                  <span>1%-2% (Standar Pro)</span>
                  <span>5% (Agresif)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    Harga Beli (Entry)
                  </label>
                  <input
                    type="number"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value) || 0)}
                    className="w-full bg-[#161c2c] border border-zinc-700/80 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-rose-300 font-bold mb-1">
                    Stop Loss (SL)
                  </label>
                  <input
                    type="number"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(Number(e.target.value) || 0)}
                    className="w-full bg-[#161c2c] border border-rose-500/40 rounded-xl px-3 py-2 text-rose-300 font-bold text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-emerald-300 font-bold mb-1">
                    Target Profit (TP)
                  </label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Number(e.target.value) || 0)}
                    className="w-full bg-[#161c2c] border border-emerald-500/40 rounded-xl px-3 py-2 text-emerald-300 font-bold text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Hasil Analisis Sizing & Rasio R:R */}
          <div className="lg:col-span-6 bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-zinc-400 font-bold uppercase">Evaluasi Rasio Risk/Reward</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border ${stats.verdictBg} ${stats.verdictColor}`}>
                  {stats.verdict}
                </span>
              </div>

              {/* R:R Hero Stat */}
              <div className="p-4 rounded-xl bg-[#141b2a] border border-zinc-800 text-center mb-5">
                <span className="text-[11px] font-mono text-zinc-400 block mb-1">RASIO RISK : REWARD</span>
                <span className="text-3xl sm:text-4xl font-mono font-black text-white">
                  1 : <span className={stats.verdictColor}>{stats.rrRatio}</span>
                </span>
                <div className="flex items-center justify-center gap-4 text-xs font-mono mt-2 pt-2 border-t border-zinc-800/80">
                  <span className="text-rose-400 font-bold">Risiko: -{stats.riskPercent.toFixed(1)}% (Rp {stats.riskPerShare.toLocaleString('id-ID')})</span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-emerald-400 font-bold">Ganjaran: +{stats.rewardPercent.toFixed(1)}% (Rp {stats.rewardPerShare.toLocaleString('id-ID')})</span>
                </div>
              </div>

              {/* Rekomendasi Ukuran Lot */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs mb-4">
                <div className="bg-[#121622] p-3 rounded-xl border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Maksimal Lot Aman</span>
                  <span className="text-xl font-black text-emerald-400 mt-0.5 block">
                    {stats.maxLotsAllowed.toLocaleString('id-ID')} Lot
                  </span>
                  <span className="text-[10px] text-zinc-500">({(stats.maxLotsAllowed * 100).toLocaleString('id-ID')} lembar)</span>
                </div>

                <div className="bg-[#121622] p-3 rounded-xl border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">Alokasi Modal Beli</span>
                  <span className="text-xl font-black text-white mt-0.5 block">
                    Rp {Math.round(stats.totalAllocatedIdr).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    ({totalCapital > 0 ? ((stats.totalAllocatedIdr / totalCapital) * 100).toFixed(1) : 0}% dari total modal)
                  </span>
                </div>
              </div>

              {/* Potensi Keuntungan vs Kerugian Rupiah */}
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Potensi Laba jika Kena TP:</span>
                  <span className="text-emerald-400 font-bold">+Rp {Math.round(stats.potentialProfitIdr).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Potensi Rugi jika Kena SL:</span>
                  <span className="text-rose-400 font-bold">-Rp {Math.round(stats.potentialLossIdr).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 mt-4 italic font-sans leading-relaxed border-t border-zinc-800/80 pt-3">
              💡 <b>Tips Money Management:</b> {stats.advice}
            </p>
          </div>
        </div>

        {/* Panduan Edukasi & SEO FAQ Section */}
        <section className="bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-zinc-300">
          <h2 className="text-xl font-bold text-white font-mono">
            Panduan Lengkap Rasio Risk to Reward (R:R) untuk Trader Saham
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-zinc-400">
            <div>
              <h3 className="font-bold text-zinc-200 text-sm mb-2">Mengapa Rasio Risk/Reward Lebih Penting daripada Win Rate?</h3>
              <p>
                Banyak trader pemula terobsesi mengejar strategi dengan tingkat kemenangan (win rate) 90%. Padahal, seorang trader institusional dengan win rate hanya 40% tetap bisa mencetak cuan konsisten jika rasio Risk/Reward-nya 1:3. Menang 4 kali menghasilkan +12R, kalah 6 kali hanya rugi -6R, menghasilkan laba bersih +6R.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-zinc-200 text-sm mb-2">Aturan Batasan Risiko 2% (2% Rule)</h3>
              <p>
                Prinsip manajemen risiko standar global menyatakan jangan pernah mempertaruhkan lebih dari 1% hingga 2% dari total modal portofolio Anda pada satu transaksi tunggal. Dengan membatasi risiko maksimal 2%, Anda membutuhkan 50 kali kegagalan berturut-turut sebelum modal Anda habis, memberikan ketahanan psikologis yang prima.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <Link
              href="/ai"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all"
            >
              <span>Uji Strategi Risk/Reward di AI Virtual Office TradeSims</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
