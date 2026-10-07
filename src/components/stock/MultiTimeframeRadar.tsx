'use client';

import React from 'react';
import { Layers, Activity, TrendingUp, TrendingDown, Minus, ShieldCheck } from 'lucide-react';
import { getMultiTimeframeRadar, MultiTimeframeInsight } from '@/lib/charting/aiChartPilotEngine';

export default function MultiTimeframeRadar({
  symbol,
  currentPrice,
}: {
  symbol: string;
  currentPrice: number;
}) {
  const radarData: MultiTimeframeInsight[] = getMultiTimeframeRadar(symbol, currentPrice);

  return (
    <div className="p-3 bg-[#0a0b10] border border-[#27272a] rounded-lg font-mono select-none">
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#1f2029]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#38bdf8]" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Multi-Timeframe Trend Radar
          </span>
        </div>
        <span className="text-[10px] bg-[#181924] border border-[#27272a] text-[#38bdf8] px-2 py-0.5 rounded font-bold">
          4-FRAME CONSENSUS &bull; {symbol.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {radarData.map((item) => {
          const isBullish = item.trend.includes('BULLISH');
          const isBearish = item.trend.includes('BEARISH');

          return (
            <div
              key={item.timeframe}
              className="p-2.5 bg-[#10121a] border border-[#27272a] rounded-md flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-white text-[11px] bg-[#1c1d28] px-1.5 py-0.2 rounded">
                  {item.timeframe}
                </span>
                <span
                  className={`text-[10px] font-bold flex items-center gap-0.5 ${
                    isBullish ? 'text-[#00c853]' : isBearish ? 'text-[#ff1744]' : 'text-[#fbbf24]'
                  }`}
                >
                  {isBullish ? <TrendingUp className="w-3 h-3" /> : isBearish ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {item.trend === 'STRONG_BULLISH'
                    ? 'STRONG BULL'
                    : item.trend === 'BULLISH'
                    ? 'BULLISH'
                    : item.trend === 'SIDEWAYS'
                    ? 'SIDEWAYS'
                    : 'BEARISH'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#a1a1aa] my-1">
                <span>RSI (14):</span>
                <span className={`font-bold ${item.rsi >= 60 ? 'text-[#00c853]' : item.rsi <= 40 ? 'text-[#ff1744]' : 'text-white'}`}>
                  {item.rsi}
                </span>
              </div>

              <div className="text-[10px] text-[#71717a] border-t border-[#1f2029] pt-1 mt-1 truncate" title={item.bias}>
                {item.bias}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
