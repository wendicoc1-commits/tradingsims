'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, CheckCircle2, TrendingUp, HelpCircle, RefreshCw, Zap, DollarSign, Percent } from 'lucide-react';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

export default function CagrCalculatorPage() {
  const [initialInvestment, setInitialInvestment] = useState<number>(10000000); // Rp 10 Juta
  const [finalValue, setFinalValue] = useState<number>(35000000); // Rp 35 Juta
  const [years, setYears] = useState<number>(5); // 5 Tahun

  // CAGR Formula: (Final / Initial) ^ (1 / years) - 1
  const cagrPercent = useMemo(() => {
    if (initialInvestment <= 0 || finalValue <= 0 || years <= 0) return 0;
    const ratio = finalValue / initialInvestment;
    const rate = Math.pow(ratio, 1 / years) - 1;
    return rate * 100;
  }, [initialInvestment, finalValue, years]);

  const totalGain = useMemo(() => finalValue - initialInvestment, [finalValue, initialInvestment]);
  const absoluteReturnPercent = useMemo(() => {
    if (initialInvestment <= 0) return 0;
    return (totalGain / initialInvestment) * 100;
  }, [totalGain, initialInvestment]);

  // Projected year-by-year trajectory table
  const yearlyProjections = useMemo(() => {
    const list = [];
    const rateDecimal = cagrPercent / 100;
    for (let i = 0; i <= years; i++) {
      const val = initialInvestment * Math.pow(1 + rateDecimal, i);
      list.push({
        year: i,
        value: Math.round(val),
        gain: Math.round(val - initialInvestment),
      });
    }
    return list;
  }, [initialInvestment, cagrPercent, years]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kalkulator CAGR Saham & Investasi Majemuk',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    description:
      'Kalkulator gratis untuk menghitung Compound Annual Growth Rate (CAGR) investasi saham, reksa dana, dan obligasi dengan simulasi pertumbuhan majemuk tahunan.',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Apa itu CAGR (Compound Annual Growth Rate)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CAGR (Compound Annual Growth Rate) adalah tingkat pertumbuhan tahunan rata-rata suatu investasi selama periode waktu tertentu dengan memperhitungkan efek bunga berbunga (compounding). CAGR memberikan gambaran pertumbuhan yang halus dan realistis dibandingkan return absolut tahunan biasa.',
        },
      },
      {
        '@type': 'Question',
        name: 'Bagaimana rumus cara menghitung CAGR?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Rumus matematis CAGR adalah: CAGR = (Nilai Akhir / Nilai Awal) ^ (1 / Jumlah Tahun) - 1. Hasil desimal kemudian dikalikan 100 untuk mendapatkan persentase tahunan.',
        },
      },
      {
        '@type': 'Question',
        name: 'Berapa angka CAGR saham yang dianggap bagus di Indonesia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Untuk bursa saham Indonesia (IHSG), return historis tahunan jangka panjang berada di kisaran 10% - 14% per tahun. Portofolio saham yang menghasilkan CAGR di atas 15% - 20% secara konsisten dalam 5-10 tahun dinilai sangat unggul (outperform bursa).',
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

      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded bg-amber-500 text-black font-black text-xs flex items-center justify-center font-mono">
              ⚡
            </div>
            <span className="font-bold text-sm tracking-tight text-white font-mono">
              TRADESIM<span className="text-amber-400">.OS</span> <span className="text-zinc-500 text-xs font-normal">/ tools / cagr</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ShareWebsiteButton />
            <Link
              href="/terminal"
              className="text-xs font-bold px-3 py-1.5 rounded bg-emerald-500 text-black hover:bg-emerald-400 transition-colors flex items-center gap-1 font-mono shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              <span>Buka Terminal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Title & E-E-A-T Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Kalkulator Pertumbuhan Investasi Majemuk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Kalkulator CAGR Saham &amp; Investasi Online Gratis
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
            Hitung tingkat pertumbuhan tahunan majemuk (<em className="text-white font-medium not-italic">Compound Annual Growth Rate</em>) untuk mengukur performa riil portofolio saham, reksa dana, atau aset kripto Anda selama rentang waktu investasi.
          </p>
          <EeatComplianceBadge reviewedDate="16 Oktober 2026" reviewerName="TradeSim Pro Quantitative Desk" />
        </div>

        {/* Interactive Calculator Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Form (6 Cols) */}
          <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-[#090D16] border border-zinc-800/80 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="font-bold text-sm text-white flex items-center gap-2 font-mono">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Parameter Investasi</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setInitialInvestment(10000000);
                  setFinalValue(35000000);
                  setYears(5);
                }}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* Modal Awal */}
              <div>
                <label className="block text-zinc-400 mb-1 font-sans">Nilai Modal Awal (Rp):</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500">Rp</span>
                  <input
                    type="number"
                    step="100000"
                    min="1"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-9 pr-3 py-2 bg-[#070A10] border border-zinc-700 rounded-lg text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 mt-1.5">
                  {[5000000, 10000000, 50000000, 100000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setInitialInvestment(amt)}
                      className="px-2 py-0.5 rounded text-[10px] bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    >
                      {(amt / 1000000).toFixed(0)} Jt
                    </button>
                  ))}
                </div>
              </div>

              {/* Nilai Akhir */}
              <div>
                <label className="block text-zinc-400 mb-1 font-sans">Nilai Akhir Portofolio (Rp):</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500">Rp</span>
                  <input
                    type="number"
                    step="100000"
                    min="1"
                    value={finalValue}
                    onChange={(e) => setFinalValue(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-9 pr-3 py-2 bg-[#070A10] border border-zinc-700 rounded-lg text-white font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 mt-1.5">
                  {[20000000, 35000000, 75000000, 150000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFinalValue(amt)}
                      className="px-2 py-0.5 rounded text-[10px] bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    >
                      {(amt / 1000000).toFixed(0)} Jt
                    </button>
                  ))}
                </div>
              </div>

              {/* Durasi Investasi (Tahun) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-zinc-400 font-sans">Durasi Periode (Tahun):</label>
                  <span className="text-emerald-400 font-bold">{years} Tahun</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>1 Thn</span>
                  <span>5 Thn</span>
                  <span>10 Thn</span>
                  <span>20 Thn</span>
                  <span>30 Thn</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results Dashboard (6 Cols) */}
          <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c1424] to-[#070a12] border border-emerald-500/30 shadow-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-zinc-400 tracking-wider uppercase">
                Hasil Perhitungan Pertumbuhan
              </span>

              {/* Main CAGR Metric */}
              <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 text-center">
                <span className="text-xs text-zinc-400 font-mono">Pertumbuhan Tahunan Majemuk (CAGR):</span>
                <div className="text-3xl sm:text-4xl font-black font-mono mt-1 text-emerald-400 tracking-tight">
                  {cagrPercent > 0 ? `+${cagrPercent.toFixed(2)}%` : `${cagrPercent.toFixed(2)}%`}
                  <span className="text-xs text-zinc-400 font-normal ml-1">/ tahun</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Uang Anda bertumbuh rata-rata <strong className="text-emerald-300">{cagrPercent.toFixed(2)}%</strong> setiap tahun selama {years} tahun.
                </p>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Total Keuntungan Bersih</span>
                  <span className={`font-bold text-sm ${totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {totalGain >= 0 ? '+' : ''}Rp {totalGain.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Total Return Absolut</span>
                  <span className={`font-bold text-sm ${absoluteReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {absoluteReturnPercent >= 0 ? '+' : ''}{absoluteReturnPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Box */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs">
              <p className="text-zinc-300">
                Ingin menguji strategi untuk mencapai CAGR di atas 15%? Latih portofolio Anda di simulator saham real-time TradeSim Pro gratis tanpa risiko.
              </p>
              <Link
                href="/terminal"
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold font-mono hover:bg-emerald-400 transition-colors"
              >
                <span>Mulai Simulasi Saham</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Growth Projections Table */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#090D16] border border-zinc-800 space-y-4">
          <h2 className="font-bold text-base text-white flex items-center gap-2 font-mono">
            <Percent className="w-4 h-4 text-emerald-400" />
            <span>Tabel Proyeksi Akumulasi Majemuk Per Tahun</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0c1220] text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Tahun Ke-</th>
                  <th className="py-2.5 px-3 text-right">Nilai Portofolio</th>
                  <th className="py-2.5 px-3 text-right">Total Akumulasi Laba</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {yearlyProjections.map((p) => (
                  <tr key={p.year} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-2.5 px-3 text-zinc-300">Tahun {p.year} {p.year === 0 ? '(Awal)' : ''}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">Rp {p.value.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">+{((p.gain / initialInvestment) * 100).toFixed(1)}% (+Rp {p.gain.toLocaleString('id-ID')})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Educational Content & FAQ */}
        <div className="space-y-6 pt-4 border-t border-zinc-800">
          <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed space-y-4">
            <h2 className="text-xl font-bold text-white">Panduan Lengkap Memahami CAGR dalam Investasi Saham</h2>
            <p>
              Dalam dunia investasi pasar modal, menghitung return rata-rata aritmatika sederhana sering kali menyesatkan karena tidak memperhitungkan efek volatilitas dan bunga berbunga (<em className="text-white">compounding interest</em>). 
              Oleh sebab itu, institusi finansial global seperti BlackRock, Morgan Stanley, dan manajer investasi di Indonesia selalu menggunakan <strong>CAGR (Compound Annual Growth Rate)</strong> untuk mengevaluasi kinerja reksa dana, saham individu, dan portofolio hedge fund.
            </p>
            
            <h3 className="text-lg font-bold text-white">Rumus Matematis CAGR</h3>
            <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 font-mono text-center text-emerald-400 text-sm">
              CAGR = (Nilai Akhir / Nilai Awal) ^ (1 / Jumlah Tahun) - 1
            </div>

            <h3 className="text-lg font-bold text-white">Perbedaan Return Rata-Rata Biasa vs CAGR</h3>
            <p>
              Misalkan Anda berinvestasi Rp 10.000.000. Pada tahun pertama naik 100% menjadi Rp 20.000.000, lalu di tahun kedua turun 50% kembali ke Rp 10.000.000.
              Jika dihitung rata-rata biasa: (100% - 50%) / 2 = +25% per tahun (seolah-olah untung). Namun kenyataannya uang Anda tidak bertambah sama sekali.
              Dengan formula CAGR, hasilnya adalah 0% per tahun — mencerminkan kondisi riil kekayaan Anda tanpa bias ilusi matematis.
            </p>
          </div>

          {/* Interactive FAQ Section */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
            </h3>
            <div className="space-y-3">
              {faqSchema.mainEntity.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#090D16] border border-zinc-800/80 space-y-2">
                  <h4 className="font-bold text-sm text-white">{item.name}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
