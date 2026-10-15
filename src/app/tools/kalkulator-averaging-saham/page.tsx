'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingDown,
  ArrowRight,
  Shield,
  Zap,
  HelpCircle,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';

interface BuyTier {
  id: string;
  label: string;
  price: number;
  lots: number;
}

export default function AveragingCalculatorPage() {
  const [stockSymbol, setStockSymbol] = useState('BBRI');
  const [tiers, setTiers] = useState<BuyTier[]>([
    { id: '1', label: 'Pembelian 1 (Harga Awal)', price: 4800, lots: 50 },
    { id: '2', label: 'Pembelian 2 (Averaging Down)', price: 4200, lots: 75 },
  ]);

  const [brokerFeePercent, setBrokerFeePercent] = useState<number>(0.15); // Beli
  const [targetExitPrice, setTargetExitPrice] = useState<number>(4700);

  const addTier = () => {
    if (tiers.length >= 5) return;
    const nextIdx = tiers.length + 1;
    const lastPrice = tiers[tiers.length - 1]?.price || 4000;
    setTiers([
      ...tiers,
      {
        id: String(Date.now()),
        label: `Pembelian ${nextIdx} (Averaging)`,
        price: Math.max(50, lastPrice - 200),
        lots: 50,
      },
    ]);
  };

  const removeTier = (id: string) => {
    if (tiers.length <= 2) return;
    setTiers(tiers.filter((t) => t.id !== id));
  };

  const updateTier = (id: string, field: 'price' | 'lots', value: number) => {
    setTiers(
      tiers.map((t) => {
        if (t.id === id) {
          return { ...t, [field]: Math.max(0, value) };
        }
        return t;
      })
    );
  };

  // Perhitungan Keuangan
  const calculation = useMemo(() => {
    let totalShares = 0;
    let totalGrossCapital = 0;

    const tierBreakdown = tiers.map((tier) => {
      const shares = tier.lots * 100;
      const grossCost = shares * tier.price;
      const fee = (grossCost * brokerFeePercent) / 100;
      const netCost = grossCost + fee;

      totalShares += shares;
      totalGrossCapital += grossCost;

      return {
        ...tier,
        shares,
        grossCost,
        netCost,
      };
    });

    const totalLots = totalShares / 100;
    const newAveragePrice = totalShares > 0 ? totalGrossCapital / totalShares : 0;
    const initialPrice = tiers[0]?.price || 0;
    const priceReduction = initialPrice - newAveragePrice;
    const priceReductionPercent =
      initialPrice > 0 ? (priceReduction / initialPrice) * 100 : 0;

    const totalFeeBuy = (totalGrossCapital * brokerFeePercent) / 100;
    const grandTotalCapital = totalGrossCapital + totalFeeBuy;

    // Titik impas (Breakeven) asumsi fee jual 0.25%
    const sellFeeFactor = 1 - 0.25 / 100;
    const breakevenExitPrice =
      totalShares > 0 ? Math.ceil(grandTotalCapital / (totalShares * sellFeeFactor)) : 0;

    // Proyeksi jika rebound ke targetExitPrice
    const targetGrossSell = totalShares * targetExitPrice;
    const targetSellFee = (targetGrossSell * 0.25) / 100;
    const targetNetProceeds = targetGrossSell - targetSellFee;
    const projectedProfitLoss = targetNetProceeds - grandTotalCapital;
    const projectedProfitPercent =
      grandTotalCapital > 0 ? (projectedProfitLoss / grandTotalCapital) * 100 : 0;

    return {
      tierBreakdown,
      totalLots,
      totalShares,
      totalGrossCapital,
      grandTotalCapital,
      newAveragePrice: Math.round(newAveragePrice),
      priceReduction: Math.round(priceReduction),
      priceReductionPercent: Number(priceReductionPercent.toFixed(2)),
      breakevenExitPrice,
      projectedProfitLoss,
      projectedProfitPercent: Number(projectedProfitPercent.toFixed(2)),
    };
  }, [tiers, brokerFeePercent, targetExitPrice]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kalkulator Average Down Saham BEI',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    description:
      'Kalkulator gratis untuk menghitung harga rata-rata baru (new average price), modal tambahan, dan titik impas saat melakukan averaging down saham BEI.',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Apa itu strategi averaging down dalam saham?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Averaging down adalah strategi membeli saham tambahan ketika harganya turun dari harga beli awal, dengan tujuan menurunkan harga beli rata-rata (average price) sehingga titik impas (breakeven) menjadi lebih rendah.',
        },
      },
      {
        '@type': 'Question',
        name: 'Bagaimana rumus menghitung harga rata-rata baru saham?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Rumus average down adalah: Total Modal Pembelian Keseluruhan dibagi dengan Total Jumlah Lembar Saham. Contoh: (50 lot x Rp 4.800 + 75 lot x Rp 4.200) / 125 lot = Rp 4.440 per lembar.',
        },
      },
      {
        '@type': 'Question',
        name: 'Kapan saat yang tepat untuk melakukan average down?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Averaging down sebaiknya hanya dilakukan pada emiten berfundamental kuat (seperti saham Bluechip LQ45 / perbankan besar) yang sedang mengalami koreksi teknikal sementara, bukan pada saham gorengan yang tren fundamentalnya memburuk.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#06080E] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header Bar */}
      <header className="border-b border-white/10 bg-[#0B0E14]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-mono font-bold text-white text-base">
            <span className="w-7 h-7 rounded bg-emerald-500 text-black flex items-center justify-center font-black text-xs">
              TS
            </span>
            <span>TradeSim Pro</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-mono">
            <Link
              href="/tools/kalkulator-fee-saham"
              className="text-zinc-400 hover:text-white transition-colors hidden sm:inline"
            >
              Fee Saham
            </Link>
            <Link
              href="/tools/kalkulator-lot"
              className="text-zinc-400 hover:text-white transition-colors hidden sm:inline"
            >
              Kalkulator Lot
            </Link>
            <Link
              href="/terminal"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-semibold hover:bg-emerald-500/25 transition-all flex items-center gap-1.5"
            >
              <span>Buka Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-10 pb-8 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-semibold mb-4">
          <TrendingDown className="w-3.5 h-3.5" />
          ALAT STRATEGI AKUMULASI SAHAM BEI
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-mono tracking-tight leading-tight">
          Kalkulator Average Down Saham
        </h1>
        <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Hitung penurunan harga rata-rata baru (*new average price*), modal tambahan yang dibutuhkan, dan titik impas secara otomatis sebelum menambah porsi saham yang sedang turun.
        </p>
      </section>

      {/* Main Interactive Calculator Grid */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Input Panel (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0B0E14] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400">Kode Saham:</span>
                <input
                  type="text"
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                  placeholder="BBRI"
                  className="w-20 px-2 py-1 rounded bg-white/5 border border-white/15 text-white font-mono font-bold text-xs uppercase text-center focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span>Fee Beli:</span>
                <select
                  value={brokerFeePercent}
                  onChange={(e) => setBrokerFeePercent(Number(e.target.value))}
                  className="bg-white/5 border border-white/15 text-white rounded px-2 py-1 text-xs focus:outline-none"
                >
                  <option value={0.15}>0.15% (Umum)</option>
                  <option value={0.10}>0.10% (Murah)</option>
                  <option value={0.19}>0.19% (Tradisional)</option>
                  <option value={0}>0% (Tanpa Fee)</option>
                </select>
              </div>
            </div>

            {/* List of Purchase Tiers */}
            <div className="space-y-4">
              {tiers.map((tier, idx) => (
                <div
                  key={tier.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/10 relative group hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {tier.label}
                    </span>
                    {tiers.length > 2 && idx > 0 && (
                      <button
                        onClick={() => removeTier(tier.id)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                        title="Hapus baris ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                        Harga Beli (Rp / Lembar)
                      </label>
                      <input
                        type="number"
                        value={tier.price || ''}
                        onChange={(e) => updateTier(tier.id, 'price', Number(e.target.value))}
                        step="10"
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                        Jumlah Pembelian (Lot)
                      </label>
                      <input
                        type="number"
                        value={tier.lots || ''}
                        onChange={(e) => updateTier(tier.id, 'lots', Number(e.target.value))}
                        step="1"
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="mt-2.5 flex justify-between items-center text-[11px] font-mono text-zinc-400 border-t border-white/5 pt-2">
                    <span>{tier.lots * 100} lembar</span>
                    <span className="text-white font-semibold">
                      Rp {(tier.lots * 100 * tier.price).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Tier Button */}
            {tiers.length < 5 && (
              <button
                onClick={addTier}
                className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-emerald-500/50 text-zinc-300 hover:text-emerald-400 font-mono text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pembelian Averaging Down Lainnya (Maks. 5)</span>
              </button>
            )}

            {/* Target Rebound Exit Price Simulation */}
            <div className="mt-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
              <label className="block text-xs font-mono text-cyan-300 font-bold mb-1.5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                Simulasi Target Harga Jual Rebound (Exit Target):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={targetExitPrice || ''}
                  onChange={(e) => setTargetExitPrice(Number(e.target.value))}
                  step="25"
                  className="flex-1 px-3 py-2 rounded-lg bg-black/60 border border-cyan-500/30 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                />
                <span className="text-xs font-mono text-zinc-400">Rp / Lembar</span>
              </div>
            </div>
          </div>

          {/* Results Summary Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#0B0E14] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold block">
                Hasil Perhitungan Akumulasi
              </span>

              {/* Big Highlight: New Average Price */}
              <div className="mt-3 p-4 rounded-xl bg-black/60 border border-emerald-500/40 text-center">
                <div className="text-xs font-mono text-zinc-400">HARGA RATA-RATA BARU (NEW AVG)</div>
                <div className="text-4xl font-mono font-black text-white mt-1 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  Rp {calculation.newAveragePrice.toLocaleString('id-ID')}
                </div>
                <div className="text-xs font-mono text-emerald-400/90 mt-1 flex items-center justify-center gap-1">
                  <span>Turun {calculation.priceReductionPercent}%</span>
                  <span>(-Rp {calculation.priceReduction.toLocaleString('id-ID')})</span>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="mt-5 space-y-3 text-xs font-mono border-t border-white/10 pt-4">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Total Kepemilikan:</span>
                  <span className="text-white font-bold">
                    {calculation.totalLots.toLocaleString('id-ID')} Lot ({calculation.totalShares.toLocaleString('id-ID')} lbr)
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-400">
                  <span>Total Modal Disetor:</span>
                  <span className="text-white font-bold">
                    Rp {calculation.grandTotalCapital.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-400">
                  <span>Titik Impas (BEP + Fee):</span>
                  <span className="text-cyan-400 font-bold">
                    Rp {calculation.breakevenExitPrice.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-2">
                  <span className="text-zinc-300">Estimasi Hasil jika Rebound ke Rp {targetExitPrice.toLocaleString('id-ID')}:</span>
                  <span
                    className={`font-bold ${
                      calculation.projectedProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {calculation.projectedProfitLoss >= 0 ? '+' : ''}
                    Rp {calculation.projectedProfitLoss.toLocaleString('id-ID')} ({calculation.projectedProfitPercent}%)
                  </span>
                </div>
              </div>

              {/* Action Button to Simulator */}
              <div className="mt-6">
                <Link
                  href="/terminal"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>Coba Eksekusi di Simulator</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[10px] text-zinc-500 text-center font-mono mt-2">
                  Gunakan saldo virtual Rp 50.000.000 untuk simulasi tanpa modal nyata.
                </p>
              </div>
            </div>

            {/* Warning Note */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/90 leading-relaxed font-sans">
                <strong>Catatan Manajemen Risiko:</strong> Averaging down melipatgandakan risiko kerugian jika saham terus mengalami downtrend. Pastikan hanya menerapkannya pada emiten dengan fundamental sehat dan batasi alokasi maksimal per saham.
              </div>
            </div>
          </div>
        </div>

        {/* SEO Educational Guide Section */}
        <section className="mt-16 bg-[#0B0E14] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white mb-4">
            Panduan Lengkap Strategi Averaging Down Saham
          </h2>
          <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed space-y-4 font-sans">
            <p>
              <strong>Averaging Down</strong> adalah strategi investasi di mana seorang trader atau investor membeli saham tambahan ketika harga saham tersebut mengalami penurunan dari harga pembelian pertamanya. Tujuan utamanya adalah untuk <em>menurunkan rata-rata harga modal</em>, sehingga ketika harga saham mengalami pembalikan arah (*rebound*), posisi portofolio dapat kembali mencapai titik impas (*breakeven*) atau bahkan menghasilkan laba jauh lebih cepat.
            </p>

            <h3 className="text-base font-bold text-white font-mono mt-4">
              Rumus Matematika Average Down Saham
            </h3>
            <p>
              Rumus menghitung harga rata-rata baru adalah pembagian antara total dana yang dibelanjakan dengan total lembar saham yang terkumpul:
            </p>
            <div className="p-3 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-emerald-300">
              Harga Rata-Rata Baru = ( (Harga Beli 1 x Lembar 1) + (Harga Beli 2 x Lembar 2) + ... ) / Total Lembar Saham
            </div>

            <h3 className="text-base font-bold text-white font-mono mt-4">
              Tips Aman Melakukan Averaging Down di Bursa Efek Indonesia (BEI):
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li><strong>Prioritaskan Saham Bluechip (LQ45 / Kompas100):</strong> Hindari averaging down pada saham lapis tiga atau saham gorengan yang fundamental keuangannya merugi.</li>
              <li><strong>Siapkan Modal Bertahap:</strong> Jangan habiskan seluruh kas (*cash balance*) pada pembelian kedua. Gunakan metode *pyramid buying* (contoh: rasio 20% - 30% - 50%).</li>
              <li><strong>Tetapkan Batas Maksimal (Cut Loss Plan):</strong> Jika harga saham menembus *major support* atau ada perubahan fundamental fundamental perusahaan, disiplinlah untuk membatasi risiko (*stop loss*).</li>
            </ul>
          </div>

          {/* Interactive FAQ Accordion */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold font-mono text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              Pertanyaan yang Sering Diajukan (FAQ)
            </h3>
            <div className="space-y-3">
              <details className="p-4 rounded-xl bg-white/[0.02] border border-white/10 group cursor-pointer">
                <summary className="font-mono text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors list-none flex justify-between items-center">
                  <span>Apa perbedaan Averaging Down dan Averaging Up?</span>
                  <span className="text-emerald-400">+</span>
                </summary>
                <p className="mt-2 text-xs text-zinc-400 font-sans leading-relaxed">
                  Averaging Down dilakukan saat harga saham turun untuk memperkecil modal rata-rata, sedangkan Averaging Up (Pyramiding) dilakukan saat harga saham sedang naik untuk menambah posisi pemenang (*riding the trend*).
                </p>
              </details>

              <details className="p-4 rounded-xl bg-white/[0.02] border border-white/10 group cursor-pointer">
                <summary className="font-mono text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors list-none flex justify-between items-center">
                  <span>Apakah kalkulator ini sudah memperhitungkan komisi broker dan pajak?</span>
                  <span className="text-emerald-400">+</span>
                </summary>
                <p className="mt-2 text-xs text-zinc-400 font-sans leading-relaxed">
                  Ya, kalkulator ini menyediakan opsi pemilihan fee beli broker (default 0.15%) serta menghitung titik impas (*breakeven*) dengan memperhitungkan biaya jual (default 0.25% termasuk PPh 0.1% dan levy bursa).
                </p>
              </details>

              <details className="p-4 rounded-xl bg-white/[0.02] border border-white/10 group cursor-pointer">
                <summary className="font-mono text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors list-none flex justify-between items-center">
                  <span>Bisa langsung coba strategi ini secara gratis tanpa uang nyata?</span>
                  <span className="text-emerald-400">+</span>
                </summary>
                <p className="mt-2 text-xs text-zinc-400 font-sans leading-relaxed">
                  Tentu saja! Anda bisa membuka <Link href="/terminal" className="text-emerald-400 underline">Workstation Terminal TradeSim Pro</Link> untuk mempraktikkan averaging down pada emiten saham BEI dan crypto dengan saldo virtual gratis Rp 50.000.000.
                </p>
              </details>
            </div>
          </div>

          {/* E-E-A-T Disclaimer Badge */}
          <div className="mt-8">
            <EeatComplianceBadge />
          </div>
        </section>
      </main>
    </div>
  );
}
