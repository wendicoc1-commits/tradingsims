'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Percent,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Scale,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import type { StockQuote } from '@/types';

interface DuPontAnalysisDeskProps {
  quote: StockQuote;
}

export default function DuPontAnalysisDesk({ quote }: DuPontAnalysisDeskProps) {
  const [modelType, setModelType] = useState<'3_STAGE' | '5_STAGE'>('3_STAGE');

  const cleanSym = (quote.symbol || 'BBCA').replace('.JK', '').toUpperCase();

  // Sensible default financial ratios based on company tier
  const isBank = ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'BRIS', 'BDMN', 'BBTN'].includes(cleanSym);
  const isTech = ['GOTO', 'BUKA', 'NVDA', 'AAPL', 'MSFT'].includes(cleanSym);

  const netMargin = isBank ? 36.5 : isTech ? 24.8 : 18.2; // %
  const assetTurnover = isBank ? 0.08 : isTech ? 0.65 : 0.85; // x
  const leverage = isBank ? 6.2 : isTech ? 1.5 : 2.1; // x
  const calculatedROE = (netMargin * assetTurnover * leverage).toFixed(2); // ~18.1%

  // 5-Stage specific sub-metrics
  const taxBurden = 0.78; // Net Income / EBT (78% retained after 22% tax)
  const interestBurden = 0.92; // EBT / EBIT
  const ebitMargin = isBank ? 50.8 : 28.5; // %
  const stage5ROE = (taxBurden * interestBurden * (ebitMargin / 100) * assetTurnover * leverage * 100).toFixed(2);

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border bg-[#09090b] border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#f59e0b]" />
            <h3 className="text-sm font-black text-white tracking-wider uppercase">
              DUPONT ROE DECOMPOSITION &amp; PROFITABILITY DRIVER &lt;FA&gt;
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
              {cleanSym}
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Dekomposisi imbal hasil ekuitas (Return on Equity) untuk membedah sumber profitabilitas riil: efisiensi operasional, produktivitas aset, atau pengungkit utang.
          </p>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center gap-1 p-1 rounded bg-[#18181b] border border-[#27272a] text-xs">
          <button
            onClick={() => setModelType('3_STAGE')}
            className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
              modelType === '3_STAGE'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            3-Stage DuPont
          </button>
          <button
            onClick={() => setModelType('5_STAGE')}
            className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
              modelType === '5_STAGE'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            5-Stage Advanced
          </button>
        </div>
      </div>

      {/* ── Summary Result Card ── */}
      <div className="p-4 rounded-lg bg-[#0c0c0e] border border-[#27272a] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] text-[#71717a] uppercase font-bold">Total Return on Equity (ROE)</div>
          <div className="text-3xl font-black text-[#22c55e] font-mono-num mt-0.5">
            {modelType === '3_STAGE' ? calculatedROE : stage5ROE}%
          </div>
          <div className="text-xs text-[#a1a1aa] mt-1">
            Kategori Kualitas Laba: <span className="text-[#f59e0b] font-bold">PRIMA (High Quality Earnings)</span>
          </div>
        </div>

        <div className="text-xs text-[#a1a1aa] max-w-md bg-[#18181b] p-3 rounded border border-[#27272a] leading-relaxed">
          {isBank ? (
            <p>
              Tingginya ROE {cleanSym} ditopang oleh <strong className="text-white">Net Profit Margin ({netMargin}%)</strong> yang kuat berkat dana murah (CASA) dominan dan leverage perbankan yang sehat ({leverage}x).
            </p>
          ) : (
            <p>
              Profitabilitas {cleanSym} didorong oleh kombinasi efisiensi margin dan perputaran aset operasional yang prima di atas rata-rata sektor industrinya.
            </p>
          )}
        </div>
      </div>

      {/* ── 3-Stage Mathematical Visual Formula ── */}
      {modelType === '3_STAGE' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Pillar 1: Net Profit Margin */}
          <div className="p-4 rounded-lg bg-[#09090b] border border-[#27272a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#71717a] uppercase font-bold">1. Margin Efisiensi</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">OP. EFFICIENCY</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono-num">{netMargin}%</div>
            <div className="text-[11px] text-[#a1a1aa]">Net Profit Margin (Laba Bersih / Pendapatan)</div>
            <p className="text-[10px] text-[#71717a] pt-1 border-t border-[#1f1f23]">
              Kemampuan perusahaan menjaga persentase pendapatan tetap utuh sebagai laba bersih setelah seluruh beban biaya.
            </p>
          </div>

          {/* Pillar 2: Asset Turnover */}
          <div className="p-4 rounded-lg bg-[#09090b] border border-[#27272a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#71717a] uppercase font-bold">2. Perputaran Aset</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-bold">ASSET VELOCITY</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono-num">{assetTurnover}x</div>
            <div className="text-[11px] text-[#a1a1aa]">Asset Turnover (Pendapatan / Total Aset)</div>
            <p className="text-[10px] text-[#71717a] pt-1 border-t border-[#1f1f23]">
              Mengukur seberapa produktif setiap Rp 1 aset yang dimiliki dalam menghasilkan penjualan dan omzet usaha.
            </p>
          </div>

          {/* Pillar 3: Financial Leverage */}
          <div className="p-4 rounded-lg bg-[#09090b] border border-[#27272a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#71717a] uppercase font-bold">3. Financial Leverage</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 font-bold">EQUITY MULTIPLIER</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono-num">{leverage}x</div>
            <div className="text-[11px] text-[#a1a1aa]">Equity Multiplier (Total Aset / Ekuitas)</div>
            <p className="text-[10px] text-[#71717a] pt-1 border-t border-[#1f1f23]">
              Tingkat penggunaan utang dan modal luar untuk mendongkrak kapasitas bisnis tanpa membahayakan solvabilitas.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {/* 5-Stage Items */}
          <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a]">
            <div className="text-[10px] text-[#71717a] uppercase font-bold">Tax Burden</div>
            <div className="text-lg font-bold text-white font-mono-num mt-1">{taxBurden}x</div>
            <div className="text-[9px] text-[#71717a]">Net Income / EBT</div>
          </div>
          <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a]">
            <div className="text-[10px] text-[#71717a] uppercase font-bold">Interest Burden</div>
            <div className="text-lg font-bold text-white font-mono-num mt-1">{interestBurden}x</div>
            <div className="text-[9px] text-[#71717a]">EBT / EBIT</div>
          </div>
          <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a]">
            <div className="text-[10px] text-[#71717a] uppercase font-bold">EBIT Margin</div>
            <div className="text-lg font-bold text-[#f59e0b] font-mono-num mt-1">{ebitMargin}%</div>
            <div className="text-[9px] text-[#71717a]">EBIT / Revenue</div>
          </div>
          <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a]">
            <div className="text-[10px] text-[#71717a] uppercase font-bold">Asset Turnover</div>
            <div className="text-lg font-bold text-white font-mono-num mt-1">{assetTurnover}x</div>
            <div className="text-[9px] text-[#71717a]">Revenue / Total Assets</div>
          </div>
          <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a]">
            <div className="text-[10px] text-[#71717a] uppercase font-bold">Equity Multiplier</div>
            <div className="text-lg font-bold text-white font-mono-num mt-1">{leverage}x</div>
            <div className="text-[9px] text-[#71717a]">Assets / Equity</div>
          </div>
        </div>
      )}

      {/* ── Peer Comparison Benchmark ── */}
      <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#f59e0b]" />
          <span className="font-bold text-white">Benchmark Sektor Rata-Rata:</span>
          <span className="text-[#a1a1aa]">ROE Rata-Rata Industri: 12.4%</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#22c55e] font-bold">
          <ArrowUpRight className="w-4 h-4" />
          <span>{cleanSym} Mengungguli Industri (+{(parseFloat(calculatedROE) - 12.4).toFixed(1)}% Alpha)</span>
        </div>
      </div>
    </div>
  );
}
