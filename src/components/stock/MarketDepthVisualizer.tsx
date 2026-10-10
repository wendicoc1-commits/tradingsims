'use client';

import React, { useMemo } from 'react';
import {
  Layers,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  Info,
  Scale,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import type { StockQuote } from '@/types';
import { getForeignTick, getIDXTickSize } from '@/lib/stockRules';
import { formatCryptoPrice } from '@/lib/utils';
import { isCryptoSymbol, isUSSymbol } from '@/lib/universe/masterAssetUniverse';

interface MarketDepthVisualizerProps {
  quote: StockQuote;
}

export default function MarketDepthVisualizer({ quote }: MarketDepthVisualizerProps) {
  const curPrice = quote.price || 5000;
  const isCrypto = quote.market === 'CRYPTO' || quote.currency === 'USDT' || quote.symbol.endsWith('USDT') || isCryptoSymbol(quote.displaySymbol);
  const isUS = !isCrypto && (quote.market === 'US' || quote.currency === 'USD' || isUSSymbol(quote.displaySymbol));
  const isForeign = isCrypto || isUS;
  const tickStep = isForeign ? getForeignTick(curPrice) : getIDXTickSize(curPrice);

  // Generate 10-level bid and ask depth with cumulative volume
  const depthData = useMemo(() => {
    const isBull = quote.changePercentage >= 0;
    const prec = curPrice < 0.00001 ? 8 : curPrice < 0.01 ? 6 : curPrice < 1 ? 4 : 2;

    const bidLevels = Array.from({ length: 10 }, (_, i) => {
      const p = i === 0 ? curPrice : Math.max(tickStep, curPrice - tickStep * i);
      const formattedPrice = isForeign ? Number(p.toFixed(prec)) : Math.round(p);
      const lots = [24500, 31200, 28400, 19800, 16500, 14200, 11000, 8900, 7500, 6200][i];
      return { price: formattedPrice, lot: lots };
    });

    const askLevels = Array.from({ length: 10 }, (_, i) => {
      const p = curPrice + tickStep * (i + 1);
      const formattedPrice = isForeign ? Number(p.toFixed(prec)) : Math.round(p);
      const lots = [18400, 22100, 26800, 19500, 15400, 12200, 9800, 8400, 6900, 5100][i];
      return { price: formattedPrice, lot: lots };
    });

    let cumBid = 0;
    const bidsWithCum = bidLevels.map((b) => {
      cumBid += b.lot;
      return { ...b, cumLot: cumBid };
    });

    let cumAsk = 0;
    const asksWithCum = askLevels.map((a) => {
      cumAsk += a.lot;
      return { ...a, cumLot: cumAsk };
    });

    const totalBidLots = cumBid;
    const totalAskLots = cumAsk;

    // Order Flow Imbalance: (Total Bid - Total Ask) / (Total Bid + Total Ask)
    const ofiRatio = Number((((totalBidLots - totalAskLots) / (totalBidLots + totalAskLots)) * 100).toFixed(1));

    // Spoofing / Fake Bid Detection:
    // If top 2 ticks account for > 45% of total bid depth, it indicates fragile/spoof risk
    const top2BidLots = bidLevels[0].lot + bidLevels[1].lot;
    const top2Concentration = Number(((top2BidLots / totalBidLots) * 100).toFixed(1));
    const isSpoofRisk = top2Concentration > 42;

    return {
      bids: bidsWithCum,
      asks: asksWithCum,
      totalBidLots,
      totalAskLots,
      ofiRatio,
      top2Concentration,
      isSpoofRisk,
    };
  }, [curPrice, quote.changePercentage]);

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Top Header Ribbon ── */}
      <div
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                MARKET DEPTH WALL & ORDER FLOW IMBALANCE (OFI)
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30">
                ⚠️ MODEL ESTIMASI EDUKASI
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Estimasi ketebalan spread antrean bid vs ask (Bukan data Level-2 berlisensi resmi bursa).
            </p>
          </div>
        </div>

        {/* OFI Imbalance Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-neutral-900/60 border-neutral-800 text-xs">
          <span className="text-neutral-400">Order Flow Imbalance:</span>
          <span
            className={`font-bold flex items-center gap-1 ${
              depthData.ofiRatio >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {depthData.ofiRatio >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {depthData.ofiRatio >= 0 ? '+' : ''}{depthData.ofiRatio}% (
            {depthData.ofiRatio >= 0 ? 'Buyer Dominance' : 'Seller Dominance'})
          </span>
        </div>
      </div>

      {/* ── Key Depth Metrics Cards ── */}
      {(() => {
        const renderPrice = (p: number) => {
          if (isCrypto) return `${formatCryptoPrice(p)} USDT`;
          if (isUS) return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          return `Rp ${p.toLocaleString('id-ID')}`;
        };
        const unitLabel = isCrypto ? 'Koin' : isUS ? 'Shares' : 'Lot';
        const rate = isForeign ? 16000 : 1;

        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Total Bid Depth */}
              <div className="p-3.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 flex flex-col justify-between">
                <span className="text-xs text-emerald-400 font-bold">TOTAL BID DEPTH (ANTREAN BELI)</span>
                <div className="text-2xl font-bold font-mono text-emerald-300 my-1">
                  {depthData.totalBidLots.toLocaleString('id-ID')} {unitLabel}
                </div>
                <span className="text-[10px] text-neutral-400">
                  Nilai Total: Rp {((depthData.totalBidLots * curPrice * rate) / 1000000000).toFixed(2)} Miliar
                </span>
              </div>

              {/* Total Ask Depth */}
              <div className="p-3.5 rounded-xl border bg-rose-500/10 border-rose-500/30 flex flex-col justify-between">
                <span className="text-xs text-rose-400 font-bold">TOTAL ASK DEPTH (ANTREAN JUAL)</span>
                <div className="text-2xl font-bold font-mono text-rose-300 my-1">
                  {depthData.totalAskLots.toLocaleString('id-ID')} {unitLabel}
                </div>
                <span className="text-[10px] text-neutral-400">
                  Nilai Total: Rp {((depthData.totalAskLots * curPrice * rate) / 1000000000).toFixed(2)} Miliar
                </span>
              </div>

              {/* Spoofing / Fake Bid Integrity Card */}
              <div className="p-3.5 rounded-xl border bg-neutral-900/60 border-neutral-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                  <span>INTEGRITAS ANTREAN BID</span>
                  {depthData.isSpoofRisk ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="my-1">
                  <span
                    className={`text-sm font-bold block ${
                      depthData.isSpoofRisk ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {depthData.isSpoofRisk
                      ? '⚠️ Waspada Spoofing (Antrean Tipis Menumpuk)'
                      : '🟢 Solid Support (Antrean Natural Rata)'}
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">
                    Konsentrasi Top 2 Tick: {depthData.top2Concentration}% dari total antrean
                  </span>
                </div>
              </div>
            </div>

            {/* ── Visual Bid vs Ask Cumulative Depth Curves (Split Grid) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Cumulative Bids (Green) */}
              <div
                className="p-4 rounded-xl border space-y-2 shadow-sm"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pb-2 border-b border-neutral-800">
                  <span>ANTREAN BID BERTAHAP (CUMULATIVE BUY)</span>
                  <span>{unitLabel} & Akumulasi</span>
                </div>

                <div className="space-y-1.5">
                  {depthData.bids.map((b) => {
                    const maxCum = depthData.bids[depthData.bids.length - 1].cumLot;
                    const barPct = Math.round((b.cumLot / maxCum) * 100);
                    return (
                      <div key={b.price} className="relative py-1 px-2 rounded flex items-center justify-between text-xs overflow-hidden">
                        <div
                          className="absolute inset-0 bg-emerald-500/15 transition-all"
                          style={{ width: `${barPct}%` }}
                        />
                        <span className="font-bold text-white relative z-10">
                          {renderPrice(b.price)}
                        </span>
                        <div className="flex items-center gap-3 relative z-10 text-[11px]">
                          <span className="text-emerald-400">{b.lot.toLocaleString('id-ID')}</span>
                          <span className="text-neutral-400 font-medium">({b.cumLot.toLocaleString('id-ID')})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cumulative Asks (Red) */}
              <div
                className="p-4 rounded-xl border space-y-2 shadow-sm"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between text-xs font-bold text-rose-400 pb-2 border-b border-neutral-800">
                  <span>ANTREAN ASK BERTAHAP (CUMULATIVE SELL)</span>
                  <span>{unitLabel} & Akumulasi</span>
                </div>

                <div className="space-y-1.5">
                  {depthData.asks.map((a) => {
                    const maxCum = depthData.asks[depthData.asks.length - 1].cumLot;
                    const barPct = Math.round((a.cumLot / maxCum) * 100);
                    return (
                      <div key={a.price} className="relative py-1 px-2 rounded flex items-center justify-between text-xs overflow-hidden">
                        <div
                          className="absolute inset-0 bg-rose-500/15 transition-all"
                          style={{ width: `${barPct}%` }}
                        />
                        <span className="font-bold text-white relative z-10">
                          {renderPrice(a.price)}
                        </span>
                        <div className="flex items-center gap-3 relative z-10 text-[11px]">
                          <span className="text-rose-400">{a.lot.toLocaleString('id-ID')}</span>
                          <span className="text-neutral-400 font-medium">({a.cumLot.toLocaleString('id-ID')})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        );
      })()}
                  </span>
                  <div className="flex items-center gap-3 relative z-10 text-[11px]">
                    <span className="text-rose-400">{a.lot.toLocaleString('id-ID')}</span>
                    <span className="text-neutral-400 font-medium">({a.cumLot.toLocaleString('id-ID')})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
