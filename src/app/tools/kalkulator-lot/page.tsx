'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, ShieldCheck, HelpCircle, Target, Percent, DollarSign } from 'lucide-react';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

export default function LotPositionCalculatorPage() {
  const [totalCapital, setTotalCapital] = useState<number>(50000000); // 50 Juta
  const [riskPercent, setRiskPercent] = useState<number>(2.0); // 2% risk rule
  const [entryPrice, setEntryPrice] = useState<number>(10450); // BBCA
  const [stopLossPrice, setStopLossPrice] = useState<number>(9950); // Stop loss level

  // Max risk in Rupiah
  const maxRiskRupiah = useMemo(() => (totalCapital * riskPercent) / 100, [totalCapital, riskPercent]);

  // Risk per share
  const riskPerShare = useMemo(() => Math.max(1, entryPrice - stopLossPrice), [entryPrice, stopLossPrice]);

  // Max shares & lots
  const maxShares = useMemo(() => {
    if (riskPerShare <= 0) return 0;
    return Math.floor(maxRiskRupiah / riskPerShare);
  }, [maxRiskRupiah, riskPerShare]);

  const maxLots = useMemo(() => Math.floor(maxShares / 100), [maxShares]);

  // Position total value
  const totalPositionValue = useMemo(() => maxLots * 100 * entryPrice, [maxLots, entryPrice]);
  const portfolioAllocationPercent = useMemo(
    () => (totalCapital > 0 ? (totalPositionValue / totalCapital) * 100 : 0),
    [totalPositionValue, totalCapital]
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kalkulator Lot Saham & Money Management Position Sizing',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    description: 'Kalkulator money management dan position sizing saham untuk menghitung batas maksimal lot pembelian berdasarkan toleransi risiko portofolio (1% - 2% Rule).',
  };

  return (
    <div className="min-h-screen bg-[#06080E] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-white/10 bg-[#0B0E14]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-mono font-bold text-white text-base">
            <span className="w-7 h-7 rounded bg-emerald-500 text-black flex items-center justify-center font-black text-xs">
              TS
            </span>
            <span>TRADESIM<span className="text-emerald-400">.PRO</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/tools/kalkulator-fee-saham"
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors hidden sm:inline"
            >
              Kalkulator Fee &amp; Breakeven Saham &rarr;
            </Link>
            <ShareWebsiteButton variant="tool" />
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase"
            >
              Buka Simulator
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-6">
          <Link href="/" className="hover:text-emerald-400">Beranda</Link>
          <span>/</span>
          <span className="text-zinc-400">Tools Finansial</span>
          <span>/</span>
          <span className="text-emerald-400">Kalkulator Lot &amp; Risk Management</span>
        </div>

        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight uppercase">
            Kalkulator Lot Saham &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Money Management</span>
          </h1>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
            Kendalikan risiko portofolio Anda. Hitung batas lot maksimal yang boleh dibeli berdasarkan jarak Stop Loss dan aturan risiko modal (1% - 2% Risk Rule).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0B0E14] border border-white/10 p-6 sm:p-7 shadow-xl space-y-5 font-mono">
            <div>
              <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2">Total Modal Portofolio (Rp)</label>
              <input
                type="number"
                min={100000}
                step={100000}
                value={totalCapital}
                onChange={(e) => setTotalCapital(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] text-zinc-400 uppercase tracking-wider">Toleransi Risiko per Trade (% Modal)</label>
                <span className="text-amber-400 text-xs font-bold">{riskPercent}% (Maksimal Rugi: Rp {maxRiskRupiah.toLocaleString('id-ID')})</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.5}
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>0.5% (Sangat Konservatif)</span>
                <span>2% (Standar Institusional)</span>
                <span>5% (Agresif)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2">Harga Beli / Entry (Rp)</label>
                <input
                  type="number"
                  min={1}
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2">Harga Stop Loss (Rp)</label>
                <input
                  type="number"
                  min={1}
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-rose-400 font-bold text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
            {stopLossPrice >= entryPrice && (
              <p className="text-xs text-rose-400 font-sans">
                *Peringatan: Harga Stop Loss harus berada di bawah harga Entry beli!
              </p>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-[#0c121d] to-[#070b12] border border-cyan-500/30 p-6 sm:p-7 shadow-2xl font-mono space-y-6">
            <div>
              <span className="text-[11px] text-zinc-400 uppercase tracking-widest block">REKOMENDASI UKURAN POSISI MAKSIMAL</span>
              <div className="text-4xl font-black text-emerald-400 mt-1">
                {maxLots.toLocaleString('id-ID')} <span className="text-lg text-white font-normal">LOT</span>
              </div>
              <span className="text-xs text-zinc-400 block mt-1">
                Setara { (maxLots * 100).toLocaleString('id-ID') } lembar saham
              </span>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Total Dana Yang Digunakan:</span>
                <span className="text-white font-bold">Rp {totalPositionValue.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Alokasi dari Portofolio:</span>
                <span className="text-amber-400 font-bold">{portfolioAllocationPercent.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Jarak Stop Loss:</span>
                <span className="text-rose-400">-{(((entryPrice - stopLossPrice) / entryPrice) * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Maksimal Risiko Finansial:</span>
                <span className="text-rose-400 font-bold">-Rp {maxRiskRupiah.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
              >
                <span>SIMULASIKAN POSISI INI SEKARANG</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <EeatComplianceBadge />
      </main>
    </div>
  );
}
