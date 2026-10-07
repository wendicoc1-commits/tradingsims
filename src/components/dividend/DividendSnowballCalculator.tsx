'use client';

import React, { useState, useMemo } from 'react';
import {
  Coins,
  Sparkles,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  DollarSign,
  Zap,
  Info,
  Clock,
  Layers,
} from 'lucide-react';

export default function DividendSnowballCalculator() {
  const [initialCapital, setInitialCapital] = useState<number>(50000000); // Rp 50 Juta
  const [monthlyDCA, setMonthlyDCA] = useState<number>(5000000); // Rp 5 Juta / bulan
  const [dividendYield, setDividendYield] = useState<number>(5.5); // 5.5%
  const [dividendGrowthRate, setDividendGrowthRate] = useState<number>(8.0); // 8% dividend CAGR
  const [capitalGrowthRate, setCapitalGrowthRate] = useState<number>(7.0); // 7% price appreciation
  const [targetMonthlyExpense, setTargetMonthlyExpense] = useState<number>(15000000); // Rp 15 Jt/bln = Rp 180 Jt/thn
  const [projectionYears, setProjectionYears] = useState<number>(20);

  const targetAnnualExpense = targetMonthlyExpense * 12;

  // Snowball Compounding Engine
  const projectionResults = useMemo(() => {
    let currentPortfolio = initialCapital;
    let currentPortfolioNoDRIP = initialCapital;
    let currentYield = dividendYield / 100;

    const yearlyData = [];
    let freedomYear: number | null = null;

    for (let yr = 1; yr <= projectionYears; yr++) {
      const annualDCA = monthlyDCA * 12;
      
      // Hitung dividen tahunan berjalan
      const annualDividendIncome = currentPortfolio * currentYield;
      const annualDividendNoDRIP = currentPortfolioNoDRIP * currentYield;

      // Reinvestasi DRIP: dividen + DCA diinvestasikan kembali
      currentPortfolio = (currentPortfolio + annualDividendIncome + annualDCA) * (1 + capitalGrowthRate / 100);
      
      // Tanpa Reinvestasi: hanya DCA, dividen diambil/dikonsumsi
      currentPortfolioNoDRIP = (currentPortfolioNoDRIP + annualDCA) * (1 + capitalGrowthRate / 100);

      // Pertumbuhan dividen (CAGR)
      currentYield = currentYield * (1 + (dividendGrowthRate - capitalGrowthRate) / 100);

      const isFreedomReached = annualDividendIncome >= targetAnnualExpense;
      if (isFreedomReached && freedomYear === null) {
        freedomYear = yr;
      }

      yearlyData.push({
        year: yr,
        portfolioValue: Math.round(currentPortfolio),
        portfolioValueNoDRIP: Math.round(currentPortfolioNoDRIP),
        annualDividend: Math.round(annualDividendIncome),
        monthlyDividend: Math.round(annualDividendIncome / 12),
        isFreedomReached,
      });
    }

    const finalYear = yearlyData[yearlyData.length - 1];
    const snowballMultiplier = Number((finalYear.portfolioValue / Math.max(1, finalYear.portfolioValueNoDRIP)).toFixed(2));

    return {
      yearlyData,
      freedomYear,
      finalPortfolio: finalYear.portfolioValue,
      finalAnnualDividend: finalYear.annualDividend,
      finalMonthlyDividend: finalYear.monthlyDividend,
      snowballMultiplier,
    };
  }, [
    initialCapital,
    monthlyDCA,
    dividendYield,
    dividendGrowthRate,
    capitalGrowthRate,
    targetAnnualExpense,
    projectionYears,
  ]);

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Top Header Ribbon ── */}
      <div
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                DIVIDEND SNOWBALL & FINANCIAL FREEDOM SIMULATOR
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
                COMPOUND DRIP
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Simulasi efek eksponensial bola salju dividen & target waktu pensiun mandiri secara finansial.
            </p>
          </div>
        </div>

        {projectionResults.freedomYear ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-sm">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Target Freedom Tercapai di Tahun Ke-{projectionResults.freedomYear}!</span>
          </div>
        ) : (
          <div className="text-xs text-amber-400 px-3 py-1 rounded border border-amber-500/30 bg-amber-500/10">
            ⏳ Tingkatkan tabungan DCA untuk mempercepat tahun kebebasan
          </div>
        )}
      </div>

      {/* ── Input Parameter Controls ── */}
      <div
        className="p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div>
          <label className="text-[11px] text-neutral-400 block mb-1">Modal Investasi Awal (IDR)</label>
          <input
            type="number"
            value={initialCapital}
            onChange={(e) => setInitialCapital(Number(e.target.value))}
            className="w-full p-2 rounded-lg border text-xs bg-neutral-900 border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-[11px] text-neutral-400 block mb-1">Tabungan Rutin / DCA (IDR / Bulan)</label>
          <input
            type="number"
            value={monthlyDCA}
            onChange={(e) => setMonthlyDCA(Number(e.target.value))}
            className="w-full p-2 rounded-lg border text-xs bg-neutral-900 border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-[11px] text-neutral-400 block mb-1">Target Biaya Hidup Pensiun (IDR / Bulan)</label>
          <input
            type="number"
            value={targetMonthlyExpense}
            onChange={(e) => setTargetMonthlyExpense(Number(e.target.value))}
            className="w-full p-2 rounded-lg border text-xs bg-neutral-900 border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-[11px] text-neutral-400 block mb-1">Rata-rata Dividend Yield Portofolio (%)</label>
          <input
            type="number"
            step="0.1"
            value={dividendYield}
            onChange={(e) => setDividendYield(Number(e.target.value))}
            className="w-full p-2 rounded-lg border text-xs bg-neutral-900 border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-[11px] text-neutral-400 block mb-1">Pertumbuhan Dividen Emiten (CAGR % / Tahun)</label>
          <input
            type="number"
            step="0.5"
            value={dividendGrowthRate}
            onChange={(e) => setDividendGrowthRate(Number(e.target.value))}
            className="w-full p-2 rounded-lg border text-xs bg-neutral-900 border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-[11px] text-neutral-400 block mb-1">Horizon Proyeksi Waktu (Tahun)</label>
          <select
            value={projectionYears}
            onChange={(e) => setProjectionYears(Number(e.target.value))}
            className="w-full p-2 rounded-lg border text-xs bg-neutral-900 border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
          >
            <option value={10}>10 Tahun</option>
            <option value={15}>15 Tahun</option>
            <option value={20}>20 Tahun</option>
            <option value={25}>25 Tahun</option>
          </select>
        </div>
      </div>

      {/* ── Key Highlight Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-neutral-900/60 border-neutral-800">
          <span className="text-xs text-neutral-400">Total Nilai Portofolio Akhir</span>
          <div className="text-xl font-bold font-mono text-emerald-400 my-1">
            Rp {(projectionResults.finalPortfolio / 1000000000).toFixed(2)} Miliar
          </div>
          <span className="text-[10px] text-neutral-500">
            {projectionResults.snowballMultiplier}x lebih besar berkat efek DRIP
          </span>
        </div>

        <div className="p-3.5 rounded-xl border bg-neutral-900/60 border-neutral-800">
          <span className="text-xs text-neutral-400">Dividen Pasif Tahunan Akhir</span>
          <div className="text-xl font-bold font-mono text-white my-1">
            Rp {(projectionResults.finalAnnualDividend / 1000000).toFixed(1)} Juta / Thn
          </div>
          <span className="text-[10px] text-emerald-400">
            Arus kas pasif murni tanpa menjual modal saham
          </span>
        </div>

        <div className="p-3.5 rounded-xl border bg-neutral-900/60 border-neutral-800">
          <span className="text-xs text-neutral-400">Gaji Pasif Bulanan Akhir</span>
          <div className="text-xl font-bold font-mono text-amber-400 my-1">
            Rp {(projectionResults.finalMonthlyDividend / 1000000).toFixed(1)} Juta / Bln
          </div>
          <span className="text-[10px] text-neutral-500">
            vs Target Pengeluaran: Rp {(targetMonthlyExpense / 1000000).toFixed(1)} Juta / Bln
          </span>
        </div>

        <div className="p-3.5 rounded-xl border bg-neutral-900/60 border-neutral-800">
          <span className="text-xs text-neutral-400">Tahun Kebebasan Finansial</span>
          <div className="text-xl font-bold font-mono text-sky-400 my-1">
            {projectionResults.freedomYear ? `Tahun Ke-${projectionResults.freedomYear}` : '> 25 Tahun'}
          </div>
          <span className="text-[10px] text-neutral-500">
            Saat dividen pasif melampaui seluruh biaya hidup
          </span>
        </div>
      </div>

      {/* ── Visual Snowball Progression Table ── */}
      <div
        className="rounded-xl border overflow-hidden shadow-sm"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="p-3 border-b flex items-center justify-between text-xs" style={{ borderColor: 'var(--border)' }}>
          <span className="font-bold text-white uppercase">TABEL PROYEKSI PERTUMBUHAN BOLA SALJU DIVIDEN</span>
          <span className="text-neutral-500">Reinvestasi DRIP 100% Aktif</span>
        </div>

        <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
          <table className="w-full text-xs font-mono text-right">
            <thead className="sticky top-0 bg-neutral-900/95 border-b border-neutral-800">
              <tr className="text-neutral-400">
                <th className="py-2.5 px-3 text-left">Tahun Ke-</th>
                <th className="py-2.5 px-3">Portofolio (Snowball DRIP)</th>
                <th className="py-2.5 px-3">Portofolio (Tanpa DRIP)</th>
                <th className="py-2.5 px-3">Dividen Tahunan</th>
                <th className="py-2.5 px-3">Dividen / Bulan</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {projectionResults.yearlyData.map((row) => (
                <tr
                  key={row.year}
                  className={`hover:bg-neutral-800/30 transition-colors ${
                    row.year === projectionResults.freedomYear
                      ? 'bg-emerald-500/10 font-bold'
                      : ''
                  }`}
                >
                  <td className="py-2 px-3 text-left font-bold text-neutral-200">
                    Tahun {row.year}
                  </td>
                  <td className="py-2 px-3 font-bold text-emerald-400">
                    Rp {row.portfolioValue.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2 px-3 text-neutral-400">
                    Rp {row.portfolioValueNoDRIP.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2 px-3 font-semibold text-white">
                    Rp {row.annualDividend.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2 px-3 text-amber-300">
                    Rp {row.monthlyDividend.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {row.isFreedomReached ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        FREEDOM 🎯
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-500">Akumulasi</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
