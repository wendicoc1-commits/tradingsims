'use client';

import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  ChevronRight,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { getOpenBBFinancials, OpenBBFinancialReport } from '@/lib/openbb/service';

export default function OpenBBFinancialStatementsView({ symbol }: { symbol: string }) {
  const [statementType, setStatementType] = useState<'INCOME' | 'BALANCE' | 'CASHFLOW'>('INCOME');
  const report: OpenBBFinancialReport = getOpenBBFinancials(symbol);

  const activeRows =
    statementType === 'INCOME'
      ? report.incomeStatement
      : statementType === 'BALANCE'
      ? report.balanceSheet
      : report.cashFlowStatement;

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Sub-Header & Selector ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#09090b] border border-[#27272a] rounded-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded">
            <FileText className="w-5 h-5 text-[#60a5fa]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs tracking-wider">
                {report.name} ({report.symbol}) &bull; LAPORAN AUDITED
              </span>
              <span className="text-[10px] bg-[#18181b] border border-[#27272a] text-[#60a5fa] px-1.5 py-0.5 rounded font-bold">
                OPENBB ODP &bull; {report.currency === 'USD' ? 'SEC EDGAR 10-K' : 'BEI LAPKEU TAHUNAN'}
              </span>
            </div>
            <p className="text-[11px] text-[#71717a]">
              Laporan resmi Neraca, Laba Rugi, dan Arus Kas berstandar {report.currency === 'USD' ? 'US GAAP ($ Juta)' : 'SAK/IFRS (Rp Miliar)'} periode 2020 - 2024 & TTM.
            </p>
          </div>
        </div>

        {/* Statement Switcher */}
        <div className="flex items-center gap-1 bg-[#121216] border border-[#27272a] p-1 rounded text-xs">
          <button
            onClick={() => setStatementType('INCOME')}
            className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
              statementType === 'INCOME'
                ? 'bg-[#3b82f6] text-white shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            Laba Rugi (Income)
          </button>
          <button
            onClick={() => setStatementType('BALANCE')}
            className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
              statementType === 'BALANCE'
                ? 'bg-[#3b82f6] text-white shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            Neraca (Balance Sheet)
          </button>
          <button
            onClick={() => setStatementType('CASHFLOW')}
            className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
              statementType === 'CASHFLOW'
                ? 'bg-[#3b82f6] text-white shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            Arus Kas (Cash Flow)
          </button>
        </div>
      </div>

      {/* ── Key Financial Ratios Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 bg-[#0e0e12] border border-[#27272a] rounded">
          <div className="text-[10px] text-[#71717a]">Gross Profit Margin</div>
          <div className="text-sm font-bold text-white mt-0.5">{report.keyRatios.grossMarginPct}%</div>
          <div className={`text-[9px] mt-0.5 font-medium ${
            report.keyRatios.grossMarginPct >= 50
              ? 'text-[#22c55e]'
              : report.keyRatios.grossMarginPct >= 25
              ? 'text-[#60a5fa]'
              : 'text-[#eab308]'
          }`}>
            {report.keyRatios.grossMarginPct >= 50
              ? 'High Margin / Moat Kuat'
              : report.keyRatios.grossMarginPct >= 25
              ? 'Solid Industrial / FMCG Margin'
              : 'High Volume Business'}
          </div>
        </div>
        <div className="p-2.5 bg-[#0e0e12] border border-[#27272a] rounded">
          <div className="text-[10px] text-[#71717a]">Operating Margin (EBIT)</div>
          <div className={`text-sm font-bold mt-0.5 ${
            report.keyRatios.operatingMarginPct >= 0 ? 'text-[#60a5fa]' : 'text-[#ef4444]'
          }`}>
            {report.keyRatios.operatingMarginPct}%
          </div>
          <div className="text-[9px] text-[#71717a] mt-0.5">
            {report.keyRatios.operatingMarginPct >= 30
              ? 'Operasional Sangat Efisien'
              : report.keyRatios.operatingMarginPct >= 10
              ? 'EBITda Sehat'
              : 'Opex Intensif'}
          </div>
        </div>
        <div className="p-2.5 bg-[#0e0e12] border border-[#27272a] rounded">
          <div className="text-[10px] text-[#71717a]">FCF Conversion Rate</div>
          <div className={`text-sm font-bold mt-0.5 ${
            report.keyRatios.fcfConversionPct >= 50 ? 'text-[#22c55e]' : 'text-[#eab308]'
          }`}>
            {report.keyRatios.fcfConversionPct}%
          </div>
          <div className="text-[9px] text-[#71717a] mt-0.5">
            {report.keyRatios.fcfConversionPct >= 80
              ? 'Cash Generation Luar Biasa'
              : report.keyRatios.fcfConversionPct >= 40
              ? 'Free Cash Flow Positif'
              : 'Capex / Reinvestasi Tinggi'}
          </div>
        </div>
        <div className="p-2.5 bg-[#0e0e12] border border-[#27272a] rounded">
          <div className="text-[10px] text-[#71717a]">Debt-to-Equity (DER)</div>
          <div className="text-sm font-bold text-white mt-0.5">{report.keyRatios.debtToEquity}x</div>
          <div className={`text-[9px] mt-0.5 ${
            report.keyRatios.debtToEquity <= 0.5
              ? 'text-[#22c55e]'
              : report.keyRatios.debtToEquity <= 1.5
              ? 'text-[#71717a]'
              : 'text-[#eab308]'
          }`}>
            {report.keyRatios.debtToEquity <= 0.5
              ? 'Sangat Konservatif (Low Debt)'
              : report.keyRatios.debtToEquity <= 1.5
              ? 'Leverage Terkendali'
              : 'Financial Leverage Tinggi'}
          </div>
        </div>
      </div>

      {/* ── Financial Statement Table ── */}
      <div className="bg-[#09090b] border border-[#27272a] rounded-sm overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-[#27272a] bg-[#121216] text-[#71717a] text-[10px] uppercase">
              <th className="py-2.5 px-3 min-w-[240px]">Pos Akuntansi ({report.currency})</th>
              {report.years.map((yr) => (
                <th key={yr} className="py-2.5 px-3 text-right min-w-[100px]">
                  FY {yr}
                </th>
              ))}
              <th className="py-2.5 px-3 text-right">YoY Growth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f23]">
            {activeRows.map((row, idx) => {
              const valPrev = row.values['2023'];
              const valCurr = row.values['2024'];
              const yoy = valPrev ? (((valCurr - valPrev) / Math.abs(valPrev)) * 100).toFixed(1) : '—';
              const isPositive = Number(yoy) >= 0;

              return (
                <tr
                  key={idx}
                  className={`hover:bg-[#121215] transition-colors ${
                    row.category === 'header'
                      ? 'bg-[#18181b]/40 font-bold text-white'
                      : row.category === 'subtotal'
                      ? 'font-semibold text-[#f4f4f5]'
                      : 'text-[#d4d4d8]'
                  }`}
                >
                  <td className="py-2.5 px-3 flex items-center justify-between">
                    <span className={row.category === 'header' ? 'text-white' : ''}>{row.lineItem}</span>
                    <span className="text-[9px] text-[#52525b] font-normal">{row.unit}</span>
                  </td>
                  {report.years.map((yr) => {
                    const val = row.values[yr];
                    return (
                      <td
                        key={yr}
                        className={`py-2.5 px-3 text-right font-mono-num ${
                          val < 0 ? 'text-[#ef4444]' : ''
                        }`}
                      >
                        {val < 0 ? `(${Math.abs(val).toLocaleString('id-ID')})` : val.toLocaleString('id-ID')}
                      </td>
                    );
                  })}
                  <td className={`py-2.5 px-3 text-right font-mono-num font-bold ${
                    isPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'
                  }`}>
                    {yoy !== '—' ? (isPositive ? `+${yoy}%` : `${yoy}%`) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
