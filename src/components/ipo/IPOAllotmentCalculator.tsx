'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Rocket,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Info,
  CheckCircle2,
  DollarSign,
  Scale,
} from 'lucide-react';
import CompanyLogo from '@/components/common/CompanyLogo';

interface IPOCalculationItem {
  symbol: string;
  name: string;
  offeringPrice: number;
  totalSharesOffered: number; // Milyar lembar
  totalFundsTarget: number; // Milyar Rp
  estimatedOversubscription: number; // Kali (x)
  retailAllotmentCapPercent: number; // % pooling ritel BEI
  maxARAFirstDayPercent: number; // Batas ARA hari pertama (%)
  maxARBFirstDayPercent: number; // Batas ARB hari pertama (%)
}

const SAMPLE_IPO_ITEMS: Record<string, IPOCalculationItem> = {
  BATR: {
    symbol: 'BATR',
    name: 'PT Baterai Anoda Mineral Tbk',
    offeringPrice: 480,
    totalSharesOffered: 2000,
    totalFundsTarget: 960,
    estimatedOversubscription: 31.5,
    retailAllotmentCapPercent: 15.0,
    maxARAFirstDayPercent: 35.0, // Fraksi 200 - 500: 35% ARA
    maxARBFirstDayPercent: 35.0,
  },
  NUSA: {
    symbol: 'NUSA',
    name: 'PT Nusantara Data Center Hyperscale Tbk',
    offeringPrice: 1300,
    totalSharesOffered: 1250,
    totalFundsTarget: 1625,
    estimatedOversubscription: 18.2,
    retailAllotmentCapPercent: 12.5,
    maxARAFirstDayPercent: 25.0, // Fraksi 500 - 2000: 25% ARA
    maxARBFirstDayPercent: 25.0,
  },
  LOGI: {
    symbol: 'LOGI',
    name: 'PT Logistik Digital Samudera Tbk',
    offeringPrice: 220,
    totalSharesOffered: 850,
    totalFundsTarget: 187,
    estimatedOversubscription: 28.4,
    retailAllotmentCapPercent: 15.0,
    maxARAFirstDayPercent: 35.0, // Fraksi 200 - 500: 35% ARA
    maxARBFirstDayPercent: 35.0,
  },
  KOPI: {
    symbol: 'KOPI',
    name: 'PT Kenangan Kopi Nusantara Tbk',
    offeringPrice: 850,
    totalSharesOffered: 1800,
    totalFundsTarget: 1530,
    estimatedOversubscription: 22.0,
    retailAllotmentCapPercent: 12.5,
    maxARAFirstDayPercent: 25.0, // Fraksi 500 - 2000: 25% ARA
    maxARBFirstDayPercent: 25.0,
  },
};

export default function IPOAllotmentCalculator() {
  const [selectedIPO, setSelectedIPO] = useState<string>('BATR');
  const [orderAmountJuta, setOrderAmountJuta] = useState<number>(25); // Pesan Rp 25 Juta

  const ipo = SAMPLE_IPO_ITEMS[selectedIPO] || SAMPLE_IPO_ITEMS['BATR'];

  // Allotment simulation
  const orderAmountRp = orderAmountJuta * 1000000;
  const orderedLots = Math.floor(orderAmountRp / (ipo.offeringPrice * 100));
  const totalOrderedValue = orderedLots * ipo.offeringPrice * 100;

  // Formula Penjatahan Pooling BEI Sederhana
  // Ritel tier 1 (< Rp 100 Jt) biasanya mendapatkan alokasi fixed lebih tinggi dibanding tier besar
  const estimatedAllotmentPercent = Math.max(1.5, Number((100 / ipo.estimatedOversubscription).toFixed(2)));
  const estimatedAllottedLots = Math.max(1, Math.round((orderedLots * estimatedAllotmentPercent) / 100));
  const estimatedAllottedValue = estimatedAllottedLots * ipo.offeringPrice * 100;
  const refundedCash = totalOrderedValue - estimatedAllottedValue;

  // ARA Day 1 Simulation
  const araDay1Price = Math.round(ipo.offeringPrice * (1 + ipo.maxARAFirstDayPercent / 100));
  const araDay1Gain = (araDay1Price - ipo.offeringPrice) * (estimatedAllottedLots * 100);
  const arbDay1Price = Math.round(ipo.offeringPrice * (1 - ipo.maxARBFirstDayPercent / 100));
  const arbDay1Loss = (ipo.offeringPrice - arbDay1Price) * (estimatedAllottedLots * 100);

  return (
    <div className="space-y-4">
      {/* Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-zinc-400 font-semibold mr-1 flex items-center gap-1">
            <Rocket className="w-3.5 h-3.5 text-purple-400" /> Pipeline IPO:
          </span>
          {Object.keys(SAMPLE_IPO_ITEMS).map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => setSelectedIPO(sym)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedIPO === sym
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-zinc-800/60 text-zinc-300 hover:text-white'
              }`}
            >
              {sym} - {SAMPLE_IPO_ITEMS[sym].name.split(' ')[1]}
            </button>
          ))}
        </div>

        <div className="text-xs text-zinc-400">
          Aturan: <span className="text-emerald-400 font-bold">Peraturan OJK IX.A.7 (Penjatahan Terpusat Pooling)</span>
        </div>
      </div>

      {/* Main IPO Profile */}
      <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CompanyLogo symbol={ipo.symbol} name={ipo.name} size={44} rounded="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-mono">{ipo.symbol}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  ESTIMASI OVER-SUBSCRIBED {ipo.estimatedOversubscription}x
                </span>
              </div>
              <p className="text-xs text-zinc-400">{ipo.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Harga Penawaran IPO</div>
              <div className="text-lg font-mono-num font-bold text-white">
                Rp {ipo.offeringPrice.toLocaleString('id-ID')} / lbr
              </div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Target Emisi</div>
              <div className="text-lg font-mono-num font-bold text-amber-400">
                Rp {ipo.totalFundsTarget.toLocaleString('id-ID')} Milyar
              </div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Batas ARA Hari 1</div>
              <div className="text-lg font-mono-num font-bold text-emerald-400">
                +{ipo.maxARAFirstDayPercent}% (Rp {araDay1Price.toLocaleString('id-ID')})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two columns: Input Pesanan vs Estimasi Penjatahan & Potensi ARA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order Input Form */}
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-purple-400" />
            <span>Simulasi Nilai Pesanan e-IPO</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Nominal Pemesanan (Juta Rupiah):</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={orderAmountJuta}
                  onChange={(e) => setOrderAmountJuta(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
                <span className="text-zinc-400 font-mono">Juta Rp</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Total Lot Dipesan:</span>
                <span className="font-mono-num font-bold text-white">{orderedLots} Lot</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Total Dana Ditahan (Escrow):</span>
                <span className="font-mono-num font-semibold text-white">Rp {totalOrderedValue.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>Tier Investor:</span>
                <span className="text-emerald-400 font-semibold">
                  {orderAmountJuta <= 100 ? 'Ritel Prioritas (< Rp 100 Jt)' : 'Institusi / Ritel Besar (> Rp 100 Jt)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Output Estimation Result */}
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Hasil Estimasi Penjatahan & Skenario Listing</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-400">Estimasi Dapat Barang</div>
                <div className="text-base font-mono-num font-bold text-purple-300 mt-0.5">
                  {estimatedAllottedLots} Lot
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  Rp {estimatedAllottedValue.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                <div className="text-[10px] text-zinc-400">Dana Refund (Kembali ke RDN)</div>
                <div className="text-base font-mono-num font-bold text-emerald-400 mt-0.5">
                  Rp {refundedCash.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  Otomatis cair di T+1 pasca allotment
                </div>
              </div>
            </div>

            {/* Skenario Hari Pertama Listing */}
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <div className="font-semibold text-white text-[11px] mb-1">Proyeksi Listing Hari Pertama:</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Skenario 1x ARA (+{ipo.maxARAFirstDayPercent}%):
                </span>
                <span className="font-mono-num font-bold text-emerald-400">
                  +Rp {araDay1Gain.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-rose-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 rotate-180" /> Skenario 1x ARB (-{ipo.maxARBFirstDayPercent}%):
                </span>
                <span className="font-mono-num font-bold text-rose-400">
                  -Rp {arbDay1Loss.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
