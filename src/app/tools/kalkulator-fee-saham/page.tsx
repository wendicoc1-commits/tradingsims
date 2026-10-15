'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, CheckCircle2, Shield, TrendingUp, HelpCircle, RefreshCw, Zap, DollarSign } from 'lucide-react';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

export default function FeeCalculatorPage() {
  const [stockSymbol, setStockSymbol] = useState('BBCA');
  const [buyPrice, setBuyPrice] = useState<number>(10450);
  const [sellPrice, setSellPrice] = useState<number>(10850);
  const [lots, setLots] = useState<number>(50); // 1 lot = 100 lembar
  const [buyFeePercent, setBuyFeePercent] = useState<number>(0.15); // 0.15% standar broker
  const [sellFeePercent, setSellFeePercent] = useState<number>(0.25); // 0.25% standar broker

  const shares = useMemo(() => lots * 100, [lots]);
  const grossBuyValue = useMemo(() => shares * buyPrice, [shares, buyPrice]);
  const grossSellValue = useMemo(() => shares * sellPrice, [shares, sellPrice]);

  const buyFee = useMemo(() => (grossBuyValue * buyFeePercent) / 100, [grossBuyValue, buyFeePercent]);
  const totalBuyCost = useMemo(() => grossBuyValue + buyFee, [grossBuyValue, buyFee]);

  const sellFee = useMemo(() => (grossSellValue * sellFeePercent) / 100, [grossSellValue, sellFeePercent]);
  const netSellProceeds = useMemo(() => grossSellValue - sellFee, [grossSellValue, sellFee]);

  const netProfitLoss = useMemo(() => netSellProceeds - totalBuyCost, [netSellProceeds, totalBuyCost]);
  const netProfitPercent = useMemo(() => (totalBuyCost > 0 ? (netProfitLoss / totalBuyCost) * 100 : 0), [netProfitLoss, totalBuyCost]);

  // Breakeven price calculation:
  // (P_be * shares) * (1 - sellFeePercent/100) = totalBuyCost
  const breakevenPrice = useMemo(() => {
    if (shares <= 0) return 0;
    const factor = 1 - sellFeePercent / 100;
    return Math.ceil(totalBuyCost / (shares * factor));
  }, [totalBuyCost, shares, sellFeePercent]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kalkulator Fee Saham IDX & Breakeven Price',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    description: 'Kalkulator gratis untuk menghitung fee beli, fee jual, pajak PPh, levy bursa, dan titik impas (breakeven price) trading saham BEI / IDX.',
  };

  return (
    <div className="min-h-screen bg-[#06080E] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Simple Header */}
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
              href="/tools/kalkulator-lot"
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors hidden sm:inline"
            >
              Kalkulator Lot &amp; Money Management &rarr;
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

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-6">
          <Link href="/" className="hover:text-emerald-400">Beranda</Link>
          <span>/</span>
          <span className="text-zinc-400">Tools Finansial</span>
          <span>/</span>
          <span className="text-emerald-400">Kalkulator Fee Saham</span>
        </div>

        {/* Title */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight uppercase">
            Kalkulator Fee Saham &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Breakeven Price BEI</span>
          </h1>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
            Hitung total biaya beli, biaya jual sekuritas, pajak transaksi, dan harga titik impas (Breakeven Price) saham Indonesia secara presisi sebelum melakukan eksekusi order.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Form Column */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0B0E14] border border-white/10 p-6 sm:p-7 shadow-xl space-y-5 font-mono">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2">Kode Saham (Ticker)</label>
                <input
                  type="text"
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2">Jumlah Lot (1 Lot = 100 Lembar)</label>
                <input
                  type="number"
                  min={1}
                  value={lots}
                  onChange={(e) => setLots(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2">Harga Beli (Rp)</label>
                <input
                  type="number"
                  min={1}
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 uppercase tracking-wider mb-2">Estimasi Harga Jual (Rp)</label>
                <input
                  type="number"
                  min={1}
                  value={sellPrice}
                  onChange={(e) => setSellPrice(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-cyan-400 font-bold text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Broker Fee Presets */}
            <div className="pt-3 border-t border-white/5">
              <span className="block text-[11px] text-zinc-500 uppercase tracking-wider mb-3">Persentase Fee Broker Sekuritas</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Fee Beli:</span>
                    <span className="text-white font-bold">{buyFeePercent}%</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={buyFeePercent}
                    onChange={(e) => setBuyFeePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Fee Jual:</span>
                    <span className="text-white font-bold">{sellFeePercent}%</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={sellFeePercent}
                    onChange={(e) => setSellFeePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
              <p className="text-[10px] text-zinc-600 mt-2">
                *Standar sekuritas Indonesia (Mirae, Stockbit, Mandiri, Indo Premier, BCA Sekuritas) rata-rata: Beli 0.15% | Jual 0.25% (termasuk PPh 0.1% + Levy KPEI/BEI 0.043%).
              </p>
            </div>
          </div>

          {/* Result Card Column */}
          <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-[#0c121d] to-[#070b12] border border-emerald-500/30 p-6 sm:p-7 shadow-2xl font-mono space-y-6">
            <div>
              <span className="text-[11px] text-zinc-400 uppercase tracking-widest block">TITIK IMPAS MINIMAL (BREAKEVEN)</span>
              <div className="text-3xl font-black text-amber-400 mt-1">
                Rp {breakevenPrice.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Minimal harga jual saham agar tidak merugi setelah dipotong seluruh fee beli &amp; jual.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Total Modal Beli:</span>
                <span className="text-white font-bold">Rp {totalBuyCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Fee Beli ({buyFeePercent}%):</span>
                <span className="text-rose-400">-Rp {Math.round(buyFee).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Hasil Bersih Jual:</span>
                <span className="text-white font-bold">Rp {Math.round(netSellProceeds).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Fee Jual ({sellFeePercent}%):</span>
                <span className="text-rose-400">-Rp {Math.round(sellFee).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <span className="text-[11px] text-zinc-400 uppercase tracking-widest block">ESTIMASI PROFIT / LOSS BERSIH</span>
              <div className={`text-2xl font-black mt-1 ${netProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netProfitLoss >= 0 ? '+' : ''}Rp {Math.round(netProfitLoss).toLocaleString('id-ID')} ({netProfitPercent.toFixed(2)}%)
              </div>
            </div>

            {/* CTA directly to platform */}
            <div className="pt-2">
              <Link
                href="/"
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
              >
                <span>UJI STRATEGI INI DI SIMULATOR</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-[10px] text-zinc-500 block text-center mt-2">
                Dapatkan modal virtual Rp 50.000.000 bebas risiko
              </span>
            </div>
          </div>
        </div>

        {/* Informative SEO Content & FAQ Section */}
        <div className="mt-16 pt-10 border-t border-white/10 space-y-6 text-sm text-zinc-400 leading-relaxed font-sans">
          <h2 className="text-xl font-mono font-bold text-white uppercase">
            Panduan Cara Menghitung Fee Transaksi Saham Indonesia (BEI)
          </h2>
          <p>
            Saat bertransaksi saham di Bursa Efek Indonesia melalui sekuritas, investor dikenakan beberapa komponen biaya resmi:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs font-mono">
            <li><strong>Komisi Broker (Broker Fee):</strong> Berkisar antara 0.10% s.d. 0.20% untuk transaksi beli dan 0.20% s.d. 0.30% untuk transaksi jual.</li>
            <li><strong>Biaya Transaksi Bursa (Levy BEI, KPEI, KSEI):</strong> Sebesar 0.043% dari nilai transaksi bruto.</li>
            <li><strong>Pajak Penghasilan (PPh Final):</strong> Sebesar 0.1% khusus dikenakan pada transaksi penjualan saham (UU Pajak).</li>
            <li><strong>PPN Komisi Broker:</strong> Pajak Pertambahan Nilai sebesar 11% yang dihitung dari total komisi broker saja.</li>
          </ul>

          <h3 className="text-lg font-mono font-bold text-white uppercase pt-4">
            Mengapa Perlu Mengetahui Breakeven Price?
          </h3>
          <p>
            Banyak trader pemula mengira menjual saham dengan kenaikan 1 fraksi harga sudah menghasilkan keuntungan. Padahal, jika kenaikan harga tersebut belum menutupi akumulasi fee beli (rata-rata 0.15%) dan fee jual (rata-rata 0.25%), transaksi Anda sebenarnya masih berada dalam posisi merugi (net loss). Gunakan kalkulator ini untuk memastikan harga target exit Anda selalu di atas titik impas.
          </p>
        </div>

        {/* E-E-A-T Compliance Badge */}
        <EeatComplianceBadge />
      </main>
    </div>
  );
}
