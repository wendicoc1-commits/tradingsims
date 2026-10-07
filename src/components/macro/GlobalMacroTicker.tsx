'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Globe, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import type { CommodityItem } from '@/types';

export const MACRO_COMMODITIES_DATA: CommodityItem[] = [
  {
    id: 'coal',
    name: 'Newcastle Coal',
    symbol: 'COAL',
    category: 'COMMODITY',
    unit: 'USD/T',
    price: 139.80,
    changePoint: 2.30,
    changePercent: 1.67,
    relatedStocks: ['ADRO', 'PTBA', 'ITMG', 'BUMI'],
  },
  {
    id: 'oil-brent',
    name: 'Brent Crude Oil',
    symbol: 'BRENT',
    category: 'COMMODITY',
    unit: 'USD/Bbl',
    price: 74.45,
    changePoint: -0.65,
    changePercent: -0.87,
    relatedStocks: ['MEDC', 'ELSA', 'AKRA'],
  },
  {
    id: 'gold',
    name: 'Gold (XAU/USD)',
    symbol: 'GOLD',
    category: 'COMMODITY',
    unit: 'USD/Oz',
    price: 2662.50,
    changePoint: 14.20,
    changePercent: 0.54,
    relatedStocks: ['ANTM', 'MDKA', 'BRMS', 'ARCI'],
  },
  {
    id: 'nickel',
    name: 'LME Nickel',
    symbol: 'NICKEL',
    category: 'COMMODITY',
    unit: 'USD/T',
    price: 17620,
    changePoint: 340,
    changePercent: 1.97,
    relatedStocks: ['INCO', 'ANTM', 'NCKL', 'MBMA'],
  },
  {
    id: 'cpo',
    name: 'MDEX CPO Crude Palm',
    symbol: 'FCPO',
    category: 'COMMODITY',
    unit: 'MYR/T',
    price: 4325,
    changePoint: 45,
    changePercent: 1.05,
    relatedStocks: ['AALI', 'LSIP', 'TAPG', 'DSNG'],
  },
  {
    id: 'usdidr',
    name: 'USD / IDR',
    symbol: 'USDIDR',
    category: 'MACRO',
    unit: 'IDR',
    price: 15640,
    changePoint: -35,
    changePercent: -0.22,
    relatedStocks: ['BBCA', 'TLKM', 'ASII'],
  },
  {
    id: 'sbn10y',
    name: 'Indo 10Y Bond Yield',
    symbol: 'ID10Y',
    category: 'MACRO',
    unit: '%',
    price: 6.74,
    changePoint: 0.02,
    changePercent: 0.30,
    relatedStocks: ['ORI026', 'SR021', 'BBCA'],
  },
  {
    id: 'sp500',
    name: 'S&P 500',
    symbol: 'SPX',
    category: 'GLOBAL_INDEX',
    unit: 'Pts',
    price: 5751.13,
    changePoint: 22.45,
    changePercent: 0.39,
    relatedStocks: ['AAPL', 'MSFT', 'NVDA'],
  },
  {
    id: 'hsi',
    name: 'Hang Seng (HK)',
    symbol: 'HSI',
    category: 'GLOBAL_INDEX',
    unit: 'Pts',
    price: 22736.85,
    changePoint: 623.10,
    changePercent: 2.82,
    relatedStocks: ['GOTO', 'BUKA'],
  },
  {
    id: 'nikkei',
    name: 'Nikkei 225 (JP)',
    symbol: 'N225',
    category: 'GLOBAL_INDEX',
    unit: 'Pts',
    price: 38652.20,
    changePoint: 742.60,
    changePercent: 1.96,
    relatedStocks: ['ASII'],
  },
];

export default function GlobalMacroTicker() {
  const [commodities, setCommodities] = useState(MACRO_COMMODITIES_DATA);
  const [isPaused, setIsPaused] = useState(false);

  // Micro price updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPaused) return;
      setCommodities((prev) =>
        prev.map((c) => {
          const deltaPct = (Math.random() - 0.48) * 0.15;
          const newPrice = Number((c.price * (1 + deltaPct / 100)).toFixed(2));
          const newChangePoint = Number((c.changePoint + (newPrice - c.price)).toFixed(2));
          const newChangePercent = Number((c.changePercent + deltaPct).toFixed(2));
          return {
            ...c,
            price: newPrice,
            changePoint: newChangePoint,
            changePercent: newChangePercent,
          };
        })
      );
    }, 15000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const itemsDoubled = [...commodities, ...commodities];

  return (
    <div
      className="w-full overflow-hidden border-b py-1 px-2 select-none"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider shrink-0"
          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--accent)' }}
        >
          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>MACRO & KOMODITAS</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="ticker-animate inline-flex gap-5 cursor-pointer">
            {itemsDoubled.map((item, idx) => {
              const isPositive = item.changePercent >= 0;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono-num hover:opacity-80 transition-opacity"
                  title={`Terkait dengan saham: ${item.relatedStocks.join(', ')}`}
                >
                  <span className="font-semibold text-neutral-300">
                    {item.name}
                  </span>
                  <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                    {item.price.toLocaleString('id-ID')} <span className="text-[9px] text-neutral-400 font-sans">{item.unit}</span>
                  </span>
                  <span
                    className="inline-flex items-center gap-0.5 font-semibold text-[10px] px-1 py-0.2 rounded"
                    style={{
                      color: isPositive ? 'var(--positive)' : 'var(--negative)',
                      backgroundColor: isPositive ? 'var(--positive-bg)' : 'var(--negative-bg)',
                    }}
                  >
                    {isPositive ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </span>
                  <span className="text-neutral-600 ml-1">•</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
