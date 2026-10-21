'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calculator,
  ArrowRight,
  TrendingUp,
  Percent,
  DollarSign,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

export default function KalkulatorProfitTradingPage() {
  const [lots, setLots] = useState<number>(100); // 100 lot
  const [buyPrice, setBuyPrice] = useState<number>(4500); // Rp 4.500
  const [sellPrice, setSellPrice] = useState<number>(4800); // Rp 4.800
  const [buyFeePercent, setBuyFeePercent] = useState<number>(0.15); // 0.15%
  const [sellFeePercent, setSellFeePercent] = useState<number>(0.25); // 0.25% (termasuk PPh 0.1%)

  const stats = useMemo(() => {
    const totalShares = Math.max(0, lots) * 100;
    const grossBuyValue = totalShares * buyPrice;
    const buyFee = grossBuyValue * (buyFeePercent / 100);
    const totalBuyCapital = grossBuyValue + buyFee;

    const grossSellValue = totalShares * sellPrice;
    const sellFee = grossSellValue * (sellFeePercent / 100);
    const netSellProceeds = grossSellValue - sellFee;

    const totalFees = buyFee + sellFee;
    const grossProfit = grossSellValue - grossBuyValue;
    const netProfit = netSellProceeds - totalBuyCapital;
    const netReturnPercent = totalBuyCapital > 0 ? (netProfit / totalBuyCapital) * 100 : 0;

    // Hitung Break-Even Price (BEP)
    // netSellProceeds = totalBuyCapital -> grossSell * (1 - sellFee%) = totalBuyCapital
    const breakEvenPrice =
      totalShares > 0 && sellFeePercent < 100
        ? Math.ceil(totalBuyCapital / (totalShares * (1 - sellFeePercent / 100)))
        : buyPrice;

    return {
      totalShares,
      grossBuyValue,
      buyFee,
      totalBuyCapital,
      grossSellValue,
      sellFee,
      netSellProceeds,
      totalFees,
      grossProfit,
      netProfit,
      netReturnPercent,
      breakEvenPrice,
      isProfit: netProfit >= 0,
    };
  }, [lots, buyPrice, sellPrice, buyFeePercent, sellFeePercent]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-100">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/trading" className="hover:text-emerald-400 transition-colors">Trading</Link>
        <span>/</span>
        <span className="text-slate-200 font-medium">Kalkulator Profit Trading</span>
      </nav>

      {/* Header */}
      <header className="mb-8 pb-6 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Financial Calculator
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Akurat Fee Sekuritas &amp; PPh
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Kalkulator Profit Trading Saham &amp; Crypto (Net Cuan Bersih)
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
          Hitung potensi keuntungan bersih (net profit) trading saham secara presisi setelah dipotong fee beli, fee jual sekuritas, PPh final bursa, dan ketahui harga Break-Even Price (BEP) minimal Anda.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
          <EeatComplianceBadge />
          <ShareWebsiteButton />
        </div>
      </header>

      {/* MAIN CALCULATOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* INPUT PANEL (5 COLS) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center mb-4">
            <Calculator className="w-5 h-5 mr-2 text-emerald-400" /> Parameter Transaksi
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Jumlah Lot Saham (1 Lot = 100 Lembar)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={lots || ''}
                onChange={(e) => setLots(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400">({(stats.totalShares).toLocaleString('id-ID')} lembar)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Harga Beli (Rp)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={buyPrice || ''}
                onChange={(e) => setBuyPrice(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Jual (Rp)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={sellPrice || ''}
                onChange={(e) => setSellPrice(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Fee Beli Broker (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={buyFeePercent}
                onChange={(e) => setBuyFeePercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Fee Jual Broker (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={sellFeePercent}
                onChange={(e) => setSellFeePercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            *Standar rata-rata sekuritas BEI: Beli 0.15%, Jual 0.25% (sudah mencakup PPh final 0.1%, levy BEI, dan KPEI).
          </p>
        </div>

        {/* OUTPUT STATS PANEL (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          {/* NET PROFIT HERO CARD */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              stats.isProfit
                ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40'
                : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40'
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Hasil Estimasi Keuntungan Bersih (Net Profit)
            </div>
            <div className="flex items-baseline space-x-3 mb-2">
              <span className={`text-3xl sm:text-4xl font-black ${stats.isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stats.isProfit ? '+' : ''}Rp {Math.round(stats.netProfit).toLocaleString('id-ID')}
              </span>
              <span className={`text-lg font-bold ${stats.isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({stats.isProfit ? '+' : ''}{stats.netReturnPercent.toFixed(2)}%)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              *Telah dikurangi total fee transaksi sebesar <strong>Rp {Math.round(stats.totalFees).toLocaleString('id-ID')}</strong>
            </p>
          </div>

          {/* BREAKDOWN METRICS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium mb-1">Total Modal Beli + Fee</div>
              <div className="text-lg font-bold text-white font-mono">
                Rp {Math.round(stats.totalBuyCapital).toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Gross: Rp {Math.round(stats.grossBuyValue).toLocaleString('id-ID')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium mb-1">Hasil Bersih Penjualan</div>
              <div className="text-lg font-bold text-white font-mono">
                Rp {Math.round(stats.netSellProceeds).toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Gross: Rp {Math.round(stats.grossSellValue).toLocaleString('id-ID')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium mb-1">Harga Break-Even (BEP)</div>
              <div className="text-lg font-bold text-cyan-400 font-mono">
                Rp {stats.breakEvenPrice.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Harga minimal jual agar tidak rugi fee
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium mb-1">Keuntungan Kotor (Gross)</div>
              <div className="text-lg font-bold text-slate-200 font-mono">
                Rp {Math.round(stats.grossProfit).toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Sebelum dipotong fee broker
              </div>
            </div>
          </div>

          {/* SIMULATOR CTA */}
          <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-sm">Mau uji coba strategi ini secara langsung?</h3>
              <p className="text-xs text-slate-300">Gunakan simulator trading gratis modal Rp 50 Juta di TradeSim Pro.</p>
            </div>
            <Link
              href="/terminal"
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center transition-all"
            >
              Buka Simulator <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* EDUCATIONAL EXPLANATION SECTION */}
      <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 mb-8 space-y-4">
        <h2 className="text-xl font-bold text-white">Cara Menghitung Profit Trading Saham yang Benar</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Banyak trader pemula hanya menghitung keuntungan dari selisih harga jual dikurangi harga beli secara kasar. Padahal, setiap transaksi di bursa efek dikenakan potongan biaya transaksi (fee sekuritas, fee bursa KPEI/KSEI, dan PPh final 0.1% atas transaksi penjualan).
        </p>

        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400">
          <div>Net Profit = (Nilai Jual Kotor - Fee Jual) - (Nilai Beli Kotor + Fee Beli)</div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Oleh karena itu, mengetahui level <strong>Break-Even Price (BEP)</strong> sangat penting sebelum mengeksekusi order agar Anda tidak menjual di harga yang impas secara nominal namun merugi akibat potongan komisi broker.
        </p>
      </section>
    </div>
  );
}
