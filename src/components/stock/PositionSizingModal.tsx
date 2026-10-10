'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Calculator,
  Target,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  X,
  Percent,
} from 'lucide-react';
import { usePortfolioStore } from '@/store';
import { getIDXTickSize, calculateShares, getForeignTick } from '@/lib/stockRules';
import type { StockQuote } from '@/types';

interface PositionSizingModalProps {
  quote: StockQuote;
  isOpen: boolean;
  onClose: () => void;
  onApplyPlan: (plan: {
    lots: number;
    price: number;
    tp: number;
    sl: number;
  }) => void;
}

export default function PositionSizingModal({
  quote,
  isOpen,
  onClose,
  onApplyPlan,
}: PositionSizingModalProps) {
  const { cash } = usePortfolioStore();

  const cleanSymbol = quote.symbol.replace('.JK', '').toUpperCase();
  const shareInfo = calculateShares(cleanSymbol, 1);
  const isForeign = shareInfo.isCrypto || shareInfo.isUS;
  const currencySymbol = isForeign ? '$' : 'Rp ';
  const minPrice = isForeign ? 0.00000001 : 50;

  const currentPrice = quote.price || (isForeign ? 1 : 1000);
  const tick = isForeign ? getForeignTick(currentPrice) : getIDXTickSize(currentPrice);
  const foreignPrec = currentPrice < 0.00001 ? 8 : currentPrice < 0.01 ? 6 : currentPrice < 1 ? 4 : 2;

  const [totalCapital, setTotalCapital] = useState<number>(cash > 0 ? cash : 100_000_000);
  const [riskPercent, setRiskPercent] = useState<number>(2); // 2% standard institutional rule
  const [entryPrice, setEntryPrice] = useState<number>(currentPrice);
  const [slPrice, setSlPrice] = useState<number>(
    isForeign
      ? Number((currentPrice * 0.95).toFixed(foreignPrec))
      : Math.max(50, Math.round(currentPrice * 0.95))
  );
  const [tpPrice, setTpPrice] = useState<number>(
    isForeign
      ? Number((currentPrice * 1.12).toFixed(foreignPrec))
      : Math.round(currentPrice * 1.12)
  );

  // Calculation
  const calculation = useMemo(() => {
    const maxRupiahRisk = (totalCapital * riskPercent) / 100;
    const rate = isForeign ? shareInfo.exchangeRate : 1;
    const multiplier = isForeign ? 1 : 100;

    const riskPerUnit = Math.max(0.0000000001, entryPrice - slPrice);
    const rewardPerUnit = Math.max(0, tpPrice - entryPrice);

    const riskPerUnitIDR = riskPerUnit * multiplier * rate;
    const costPerUnitIDR = entryPrice * multiplier * rate;

    let maxSafeLots = costPerUnitIDR > 0
      ? (isForeign && shareInfo.isCrypto
          ? Number((maxRupiahRisk / (riskPerUnitIDR || 1)).toFixed(entryPrice < 0.01 ? 2 : 4))
          : Math.floor(maxRupiahRisk / (riskPerUnitIDR || 1)))
      : 1;

    // Cap by available capital
    const capitalRequired = maxSafeLots * costPerUnitIDR;
    if (capitalRequired > totalCapital && costPerUnitIDR > 0) {
      maxSafeLots = isForeign && shareInfo.isCrypto
        ? Number((totalCapital / costPerUnitIDR).toFixed(entryPrice < 0.01 ? 2 : 4))
        : Math.floor(totalCapital / costPerUnitIDR);
    }
    maxSafeLots = Math.max(isForeign && shareInfo.isCrypto ? 0.001 : 1, maxSafeLots);

    const actualCapitalRequired = Math.round(maxSafeLots * costPerUnitIDR);
    const actualRupiahRisk = Math.round(maxSafeLots * riskPerUnitIDR);
    const actualRupiahReward = Math.round(maxSafeLots * rewardPerUnit * multiplier * rate);

    const rrRatio = riskPerUnit > 0 ? Number((rewardPerUnit / riskPerUnit).toFixed(2)) : 0;

    let rrStatus = 'R:R Kurang Ideal (< 1:1.5)';
    let rrColor = 'var(--negative)';
    let rrBg = 'var(--negative-bg)';

    if (rrRatio >= 2.5) {
      rrStatus = 'R:R Sangat Prima (≥ 1:2.5) ⭐️⭐️⭐️';
      rrColor = 'var(--positive)';
      rrBg = 'var(--positive-bg)';
    } else if (rrRatio >= 1.8) {
      rrStatus = 'R:R Sehat & Disarankan (≥ 1:1.8) ⭐️⭐️';
      rrColor = 'var(--accent)';
      rrBg = 'rgba(245, 158, 11, 0.15)';
    }

    return {
      maxRupiahRisk,
      riskPerUnit,
      riskPerUnitIDR,
      rewardPerUnit,
      maxSafeLots,
      actualCapitalRequired,
      actualRupiahRisk,
      actualRupiahReward,
      rrRatio,
      rrStatus,
      rrColor,
      rrBg,
    };
  }, [totalCapital, riskPercent, entryPrice, slPrice, tpPrice, isForeign, shareInfo]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden font-mono"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Kalkulator Risk-to-Reward &amp; Position Sizing</span>
              </div>
              <div className="text-[11px] text-neutral-400">
                Manajemen Risiko Portofolio Institusional &bull; {quote.displaySymbol}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin text-xs">
          {/* Capital & Risk Profile */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Total Modal Trading</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-neutral-500 text-xs">Rp</span>
                <input
                  type="number"
                  value={totalCapital}
                  onChange={(e) => setTotalCapital(Math.max(1_000_000, Number(e.target.value)))}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Maksimal Resiko per Transaksi</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setRiskPercent(pct)}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition-colors ${
                      riskPercent === pct
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Parameters */}
          <div className="p-3 rounded-xl border bg-neutral-950/60 space-y-3" style={{ borderColor: 'var(--border)' }}>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Entry Price ({isForeign ? 'USD' : 'IDR'})</label>
                <input
                  type="number"
                  step={isForeign ? (currentPrice < 0.00001 ? '0.00000001' : currentPrice < 0.01 ? '0.000001' : currentPrice < 1 ? '0.0001' : '0.01') : '1'}
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Math.max(minPrice, Number(e.target.value)))}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-mono outline-none focus:border-sky-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-rose-400 block mb-1">Stop Loss (SL)</label>
                <input
                  type="number"
                  step={isForeign ? (currentPrice < 0.00001 ? '0.00000001' : currentPrice < 0.01 ? '0.000001' : currentPrice < 1 ? '0.0001' : '0.01') : '1'}
                  value={slPrice}
                  onChange={(e) => setSlPrice(Math.max(minPrice, Number(e.target.value)))}
                  className="w-full bg-neutral-900 border border-rose-500/50 rounded px-2.5 py-1 text-xs text-rose-300 font-mono outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-emerald-400 block mb-1">Take Profit (TP)</label>
                <input
                  type="number"
                  step={isForeign ? (currentPrice < 0.00001 ? '0.00000001' : currentPrice < 0.01 ? '0.000001' : currentPrice < 1 ? '0.0001' : '0.01') : '1'}
                  value={tpPrice}
                  onChange={(e) => setTpPrice(Math.max(entryPrice, Number(e.target.value)))}
                  className="w-full bg-neutral-900 border border-emerald-500/50 rounded px-2.5 py-1 text-xs text-emerald-300 font-mono outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-800">
              <span className="text-neutral-400">Toleransi Resiko per {isForeign ? (shareInfo.isCrypto ? 'Koin' : 'Lembar') : 'Lembar'}:</span>
              <span className="text-rose-400 font-bold">
                -{currencySymbol}{calculation.riskPerUnit < 0.00001 ? calculation.riskPerUnit.toFixed(8) : calculation.riskPerUnit < 0.01 ? calculation.riskPerUnit.toFixed(6) : calculation.riskPerUnit < 1 ? calculation.riskPerUnit.toFixed(4) : calculation.riskPerUnit.toLocaleString('id-ID')} (-{((calculation.riskPerUnit / (entryPrice || 1)) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Calculation Output Cards */}
          <div className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Rekomendasi Alokasi Aman:</span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {calculation.maxSafeLots.toLocaleString('id-ID', { maximumFractionDigits: calculation.maxSafeLots >= 100 ? 0 : 4 })} {isForeign ? (shareInfo.isCrypto ? 'Koin Unit' : 'Shares') : `Lot (${(calculation.maxSafeLots * 100).toLocaleString('id-ID')} lbr)`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Modal Terpakai:</span>
              <span className="font-bold text-white font-mono">
                Rp {calculation.actualCapitalRequired.toLocaleString('id-ID')} ({((calculation.actualCapitalRequired / totalCapital) * 100).toFixed(1)}% Portofolio)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30">
                <div className="text-[10px] text-rose-300">POTENSI RUGI (SL)</div>
                <div className="text-xs font-bold text-rose-400 font-mono">
                  -Rp {calculation.actualRupiahRisk.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-[10px] text-emerald-300">POTENSI PROFIT (TP)</div>
                <div className="text-xs font-bold text-emerald-400 font-mono">
                  +Rp {calculation.actualRupiahReward.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-neutral-400">Risk-to-Reward Ratio:</span>
              <div className="text-right">
                <div className="text-sm font-bold font-mono" style={{ color: calculation.rrColor }}>
                  1 : {calculation.rrRatio}
                </div>
                <div className="text-[10px]" style={{ color: calculation.rrColor }}>
                  {calculation.rrStatus}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t flex items-center justify-end gap-3"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onApplyPlan({
                lots: calculation.maxSafeLots,
                price: entryPrice,
                tp: tpPrice,
                sl: slPrice,
              });
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Terapkan ke Order Form
          </button>
        </div>
      </div>
    </div>
  );
}
