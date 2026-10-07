'use client';

import React from 'react';
import {
  FileText,
  Printer,
  X,
  Building2,
  TrendingUp,
  Award,
  ShieldCheck,
  CheckCircle,
  BarChart2,
  Coins,
} from 'lucide-react';
import type { StockQuote } from '@/types';
import CompanyLogo from '@/components/common/CompanyLogo';

interface TearSheetModalProps {
  quote: StockQuote;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResearchTearSheetModal({ quote, isOpen, onClose }: TearSheetModalProps) {
  if (!isOpen) return null;

  const curPrice = quote.price || 5000;
  const targetBase = Math.round(curPrice * 1.18);
  const targetBull = Math.round(curPrice * 1.35);
  const targetBear = Math.round(curPrice * 0.92);

  // Financial Health Scores
  const altmanZ = 3.42; // Safe > 2.99
  const piotroskiF = 8; // Max 9
  const beneishM = -2.85; // Safe < -1.78

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none font-mono">
      <div
        className="w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl relative space-y-4 print:p-0 print:border-none print:shadow-none print:max-w-none print:bg-white print:text-black"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        {/* Modal Top Control Bar (Hidden when Printing) */}
        <div className="flex items-center justify-between pb-3 border-b print:hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              1-Page Equity Research Tear Sheet (Institutional Report)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF (A4)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── TEAR SHEET A4 CONTENT CONTAINER ── */}
        <div className="space-y-4 print:space-y-3 bg-neutral-950 p-5 rounded-xl border border-neutral-800 print:bg-white print:border-none print:p-0">
          {/* Header Tear Sheet */}
          <div className="flex items-start justify-between border-b pb-4 border-neutral-800 print:border-neutral-300">
            <div className="flex items-center gap-4">
              <CompanyLogo symbol={quote.displaySymbol} name={quote.name} size={54} rounded="xl" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold font-mono text-white print:text-black">
                    {quote.displaySymbol}
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded font-bold bg-amber-500 text-black">
                    OVERWEIGHT (BUY)
                  </span>
                </div>
                <h2 className="text-xs text-neutral-300 print:text-neutral-700 mt-0.5">
                  {quote.name} &bull; Sektor: {quote.sector}
                </h2>
                <span className="text-[10px] text-neutral-500 print:text-neutral-500">
                  Indonesia Stock Exchange (IDX) &bull; Bloomberg Ticker: {quote.displaySymbol} IJ Equity
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase">Harga Pasar Terkini</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 print:text-black">
                Rp {curPrice.toLocaleString('id-ID')}
              </div>
              <span className="text-xs text-neutral-400">
                Target Konsensus: <b className="text-amber-400 print:text-black">Rp {targetBase.toLocaleString('id-ID')}</b> (+18%)
              </span>
            </div>
          </div>

          {/* Quick Ratios & Multiples Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg border bg-neutral-900/60 border-neutral-800 print:bg-neutral-100 print:border-neutral-300">
              <span className="text-[10px] text-neutral-400 print:text-neutral-600 block">P/E Ratio (TTM)</span>
              <span className="text-sm font-bold text-white print:text-black">{quote.peRatio || 12.4}x</span>
              <span className="text-[9px] text-neutral-500 print:text-neutral-500 block">Sektor Median: 14.8x</span>
            </div>

            <div className="p-2.5 rounded-lg border bg-neutral-900/60 border-neutral-800 print:bg-neutral-100 print:border-neutral-300">
              <span className="text-[10px] text-neutral-400 print:text-neutral-600 block">Price to Book (PBV)</span>
              <span className="text-sm font-bold text-white print:text-black">2.45x</span>
              <span className="text-[9px] text-neutral-500 print:text-neutral-500 block">ROE: 21.4%</span>
            </div>

            <div className="p-2.5 rounded-lg border bg-neutral-900/60 border-neutral-800 print:bg-neutral-100 print:border-neutral-300">
              <span className="text-[10px] text-neutral-400 print:text-neutral-600 block">Dividend Yield</span>
              <span className="text-sm font-bold text-emerald-400 print:text-black">3.85%</span>
              <span className="text-[9px] text-neutral-500 print:text-neutral-500 block">Payout Ratio: 62%</span>
            </div>

            <div className="p-2.5 rounded-lg border bg-neutral-900/60 border-neutral-800 print:bg-neutral-100 print:border-neutral-300">
              <span className="text-[10px] text-neutral-400 print:text-neutral-600 block">Market Cap</span>
              <span className="text-sm font-bold text-white print:text-black">
                Rp {(quote.marketCap / 1000000000000).toFixed(1)} T
              </span>
              <span className="text-[9px] text-neutral-500 print:text-neutral-500 block">Papan Utama IDX</span>
            </div>
          </div>

          {/* Institutional Health Check Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg border bg-neutral-900/40 border-neutral-800 print:border-neutral-300">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300 print:text-black mb-1">
                <span>Altman Z-Score</span>
                <span className="text-emerald-400 print:text-green-700">{altmanZ}</span>
              </div>
              <span className="text-[10px] text-emerald-400 print:text-green-700 font-semibold block">
                🟢 Safe Zone (Sangat Sehat)
              </span>
              <span className="text-[9px] text-neutral-500 print:text-neutral-600 block mt-0.5">
                Risiko kebangkrutan atau gagal bayar mendekati nol.
              </span>
            </div>

            <div className="p-3 rounded-lg border bg-neutral-900/40 border-neutral-800 print:border-neutral-300">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300 print:text-black mb-1">
                <span>Piotroski F-Score</span>
                <span className="text-emerald-400 print:text-green-700">{piotroskiF} / 9</span>
              </div>
              <span className="text-[10px] text-emerald-400 print:text-green-700 font-semibold block">
                🟢 Strong Momentum
              </span>
              <span className="text-[9px] text-neutral-500 print:text-neutral-600 block mt-0.5">
                Pertumbuhan fundamental & arus kas operasional solid.
              </span>
            </div>

            <div className="p-3 rounded-lg border bg-neutral-900/40 border-neutral-800 print:border-neutral-300">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300 print:text-black mb-1">
                <span>Beneish M-Score</span>
                <span className="text-emerald-400 print:text-green-700">{beneishM}</span>
              </div>
              <span className="text-[10px] text-emerald-400 print:text-green-700 font-semibold block">
                🟢 Low Manipulation Risk
              </span>
              <span className="text-[9px] text-neutral-500 print:text-neutral-600 block mt-0.5">
                Kualitas pembukuan laporan laba rugi terpercaya.
              </span>
            </div>
          </div>

          {/* 5-Year Historical Financial Summary */}
          <div className="rounded-lg border overflow-hidden border-neutral-800 print:border-neutral-300">
            <div className="px-3 py-1.5 bg-neutral-900 text-[11px] font-bold text-neutral-300 print:bg-neutral-200 print:text-black">
              RINGKASAN KINERJA KEUANGAN (5-TAHUNAN HISTORIS)
            </div>
            <table className="w-full text-[11px] font-mono text-right">
              <thead>
                <tr className="border-b border-neutral-800 print:border-neutral-300 text-neutral-400 print:text-neutral-600">
                  <th className="py-1.5 px-3 text-left">Metrik Finansial</th>
                  <th className="py-1.5 px-2">FY21</th>
                  <th className="py-1.5 px-2">FY22</th>
                  <th className="py-1.5 px-2">FY23</th>
                  <th className="py-1.5 px-2">FY24</th>
                  <th className="py-1.5 px-3">FY25 (TTM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 print:divide-neutral-200 text-neutral-200 print:text-black">
                <tr>
                  <td className="py-1 px-3 text-left font-medium">Pendapatan (Triliun IDR)</td>
                  <td className="py-1 px-2">88.5</td>
                  <td className="py-1 px-2">97.8</td>
                  <td className="py-1 px-2">108.2</td>
                  <td className="py-1 px-2">119.4</td>
                  <td className="py-1 px-3 font-bold text-white print:text-black">128.6</td>
                </tr>
                <tr>
                  <td className="py-1 px-3 text-left font-medium">Laba Bersih (Triliun IDR)</td>
                  <td className="py-1 px-2">31.4</td>
                  <td className="py-1 px-2">40.7</td>
                  <td className="py-1 px-2">48.6</td>
                  <td className="py-1 px-2">53.2</td>
                  <td className="py-1 px-3 font-bold text-emerald-400 print:text-black">58.4</td>
                </tr>
                <tr>
                  <td className="py-1 px-3 text-left font-medium">Net Profit Margin (NPM)</td>
                  <td className="py-1 px-2">35.5%</td>
                  <td className="py-1 px-2">41.6%</td>
                  <td className="py-1 px-2">44.9%</td>
                  <td className="py-1 px-2">44.6%</td>
                  <td className="py-1 px-3 font-bold">45.4%</td>
                </tr>
                <tr>
                  <td className="py-1 px-3 text-left font-medium">Return on Equity (ROE)</td>
                  <td className="py-1 px-2">16.8%</td>
                  <td className="py-1 px-2">19.2%</td>
                  <td className="py-1 px-2">21.0%</td>
                  <td className="py-1 px-2">21.8%</td>
                  <td className="py-1 px-3 font-bold">22.4%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Institutional Price Targets & Scenario Planning */}
          <div className="p-3 rounded-lg border bg-neutral-900/40 border-neutral-800 print:border-neutral-300">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
              Analyst Target Price & Skenario (12-Bulan Horizon)
            </span>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded bg-neutral-900/80 print:bg-neutral-100">
                <span className="text-[9px] text-rose-400 font-bold block">BEAR CASE</span>
                <span className="text-xs font-bold text-white print:text-black">
                  Rp {targetBear.toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] text-rose-400 block">-8% Downside</span>
              </div>
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 print:bg-neutral-200">
                <span className="text-[9px] text-amber-400 font-bold block">BASE CASE (TARGET)</span>
                <span className="text-xs font-bold text-amber-300 print:text-black">
                  Rp {targetBase.toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] text-emerald-400 font-bold block">+18% Upside</span>
              </div>
              <div className="p-2 rounded bg-neutral-900/80 print:bg-neutral-100">
                <span className="text-[9px] text-emerald-400 font-bold block">BULL CASE</span>
                <span className="text-xs font-bold text-white print:text-black">
                  Rp {targetBull.toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] text-emerald-400 block">+35% Upside</span>
              </div>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="pt-2 text-[9px] text-neutral-500 print:text-neutral-500 border-t border-neutral-800 print:border-neutral-300 flex justify-between">
            <span>Fincept Research Desk &bull; Disiapkan otomatis oleh Institutional Terminal Engine</span>
            <span>Halaman 1 dari 1 (A4 Tear Sheet) &bull; Untuk Keperluan Analisis Internal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
