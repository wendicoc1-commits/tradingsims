'use client';

import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Building,
  Globe2,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { getOwnershipData, StockOwnershipData, InsiderTransaction } from '@/data/bloomberg_insiders';
import { formatPrice } from '@/lib/utils';

interface InsiderOwnershipDeskProps {
  symbol: string;
}

export default function InsiderOwnershipDesk({ symbol }: InsiderOwnershipDeskProps) {
  const data: StockOwnershipData = getOwnershipData(symbol);
  const [selectedTx, setSelectedTx] = useState<InsiderTransaction | null>(null);

  const formatIdrBillion = (val: number) => {
    if (Math.abs(val) >= 1_000_000_000_000) {
      return `Rp ${(val / 1_000_000_000_000).toFixed(2)} Triliun`;
    }
    return `Rp ${(val / 1_000_000_000).toFixed(2)} Miliar`;
  };

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded border bg-[#09090b] border-[#27272a]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-ping" />
            <span className="text-xs font-black text-[#f59e0b] uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              TRADESIM OWNERSHIP &bull; INSIDER &amp; INSTITUTIONAL HOLDINGS
            </span>
            <span className="text-[10px] text-[#71717a]">| OJK FORM 4 FILINGS &amp; SMART MONEY FLOW</span>
          </div>
          <h2 className="text-lg font-black text-white tracking-wide">
            Transaksi Orang Dalam &amp; Kepemilikan Institusi Raksasa ({data.symbol})
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Melacak pembelian/penjualan saham oleh Direksi, Dewan Komisaris, dan Pemegang Saham Pengendali, serta posisi dana institusi global (Vanguard, BlackRock, NBIM).
          </p>
        </div>

        {/* Insider Flow Summary */}
        <div className="flex items-center gap-2 p-2 rounded bg-[#18181b] border border-[#27272a] shrink-0 text-right">
          <div>
            <div className="text-[9px] text-[#71717a] uppercase font-bold">Net Insider Flow (30 Hari)</div>
            <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-[#22c55e]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{formatIdrBillion(data.netInsiderFlow30D)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI & Shareholder Structure Overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Insider Sentiment */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Insider Sentiment Meter</div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-black text-[#22c55e]">VERY BULLISH</span>
          </div>
          <div className="text-[10px] text-[#a1a1aa] mt-1">
            {data.insiderBuyCount30D} Transaksi Beli vs {data.insiderSellCount30D} Transaksi Jual
          </div>
        </div>

        {/* Controlling Shareholders */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Pemegang Saham Pengendali (PSP)</div>
          <div className="text-lg font-black text-[#f59e0b] mt-1 font-mono">
            {data.shareholderDistribution.controllingShareholders}%
          </div>
          <div className="text-[10px] text-[#71717a] mt-1">Porsi Mayoritas Terkunci</div>
        </div>

        {/* Foreign Institutions */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Institusi Asing (Foreign Funds)</div>
          <div className="text-lg font-black text-[#38bdf8] mt-1 font-mono">
            {data.shareholderDistribution.foreignInstitutions}%
          </div>
          <div className="text-[10px] text-[#71717a] mt-1">BlackRock, Vanguard, NBIM</div>
        </div>

        {/* Domestic Retail & Institutions */}
        <div className="p-3.5 rounded border bg-[#121216] border-[#27272a]">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Institusi Lokal &amp; Ritel</div>
          <div className="text-lg font-black text-white mt-1 font-mono">
            {(data.shareholderDistribution.domesticInstitutions + data.shareholderDistribution.domesticRetail).toFixed(1)}%
          </div>
          <div className="text-[10px] text-[#71717a] mt-1">
            Domestik: {data.shareholderDistribution.domesticInstitutions}% | Ritel: {data.shareholderDistribution.domesticRetail}%
          </div>
        </div>
      </div>

      {/* ── Shareholder Distribution Visual Bar ── */}
      <div className="p-3 rounded border bg-[#121216] border-[#27272a] space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-[#f59e0b]">PSP / Sponsor ({data.shareholderDistribution.controllingShareholders}%)</span>
          <span className="text-[#38bdf8]">Institusi Asing ({data.shareholderDistribution.foreignInstitutions}%)</span>
          <span className="text-[#a78bfa]">Institusi Lokal ({data.shareholderDistribution.domesticInstitutions}%)</span>
          <span className="text-[#22c55e]">Publik / Ritel ({data.shareholderDistribution.domesticRetail}%)</span>
        </div>
        <div className="w-full bg-[#27272a] h-2.5 rounded-full overflow-hidden flex">
          <div className="bg-[#f59e0b] h-full" style={{ width: `${data.shareholderDistribution.controllingShareholders}%` }} />
          <div className="bg-[#38bdf8] h-full" style={{ width: `${data.shareholderDistribution.foreignInstitutions}%` }} />
          <div className="bg-[#a78bfa] h-full" style={{ width: `${data.shareholderDistribution.domesticInstitutions}%` }} />
          <div className="bg-[#22c55e] h-full" style={{ width: `${data.shareholderDistribution.domesticRetail}%` }} />
        </div>
      </div>

      {/* ── Insider Transactions Tape Table ── */}
      <div className="rounded border bg-[#121216] border-[#27272a] overflow-hidden">
        <div className="p-3 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
            Catatan Transaksi Insider Resmi (Direksi &amp; Komisaris)
          </span>
          <span className="text-[10px] text-[#71717a]">Sumber: Keterbukaan Informasi BEI / OJK</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#0d0d10] text-[10px] text-[#71717a] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Nama Pejabat Insider</th>
                <th className="py-2.5 px-3">Jabatan</th>
                <th className="py-2.5 px-3">Aksi</th>
                <th className="py-2.5 px-3 text-right">Volume (Lot)</th>
                <th className="py-2.5 px-3 text-right">Harga Transaksi</th>
                <th className="py-2.5 px-3 text-right">Nilai Transaksi</th>
                <th className="py-2.5 px-3 text-right">Sisa Kepemilikan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f23] text-xs">
              {data.insiderTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-[#18181c] cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono text-[#a1a1aa] text-[11px]">{tx.date}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{tx.insiderName}</td>
                  <td className="py-2.5 px-3 text-[#a1a1aa] text-[11px]">{tx.position}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        tx.transactionType === 'BUY'
                          ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30'
                          : 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30'
                      }`}
                    >
                      {tx.transactionType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                    {tx.lot.toLocaleString()} lot
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#d4d4d8]">
                    Rp {tx.pricePerShare.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#22c55e]">
                    {formatIdrBillion(tx.totalValueIdr)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#a1a1aa] text-[11px]">
                    {tx.sharesHeldAfter.toLocaleString()} lbr ({tx.ownershipPercentAfter}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Transaction Details */}
        {selectedTx && (
          <div className="p-3.5 bg-[#09090b] border-t border-[#27272a] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#f59e0b] font-bold text-xs uppercase">
                &bull; Keterbukaan Informasi: {selectedTx.insiderName} ({selectedTx.position})
              </span>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-xs text-[#71717a] hover:text-white cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>
            <p className="text-xs text-[#e4e4e7]">
              {selectedTx.filingNotice}
            </p>
          </div>
        )}
      </div>

      {/* ── Top Institutional Shareholders Table ── */}
      <div className="rounded border bg-[#121216] border-[#27272a] overflow-hidden">
        <div className="p-3 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between">
          <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
            <Building className="w-4 h-4 text-[#38bdf8]" />
            Top Institutional Shareholders (Smart Money Register)
          </span>
          <span className="text-[10px] text-[#71717a]">Pelaporan Kustodian Kuartal Terkini</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#0d0d10] text-[10px] text-[#71717a] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Nama Institusi / Manajer Investasi</th>
                <th className="py-2.5 px-3">Tipe</th>
                <th className="py-2.5 px-3">Negara</th>
                <th className="py-2.5 px-3 text-right">Jumlah Saham</th>
                <th className="py-2.5 px-3 text-right">Porsi (%)</th>
                <th className="py-2.5 px-3 text-right">Perubahan Kuartal</th>
                <th className="py-2.5 px-3 text-right">Estimasi Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f23] text-xs">
              {data.topInstitutionalHolders.map((inst) => (
                <tr key={inst.rank} className="hover:bg-[#18181c] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[#71717a] text-[11px]">{inst.rank}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{inst.institutionName}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#27272a] text-[#a1a1aa]">
                      {inst.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#a1a1aa] text-[11px]">{inst.country}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-white">
                    {inst.sharesHeld.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#f59e0b]">
                    {inst.ownershipPercent}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    {inst.changeQuarterShares > 0 ? (
                      <span className="text-[#22c55e]">+{inst.changeQuarterShares.toLocaleString()}</span>
                    ) : inst.changeQuarterShares < 0 ? (
                      <span className="text-[#ef4444]">{inst.changeQuarterShares.toLocaleString()}</span>
                    ) : (
                      <span className="text-[#71717a]">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#38bdf8]">
                    {formatIdrBillion(inst.valueIdr)}
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
