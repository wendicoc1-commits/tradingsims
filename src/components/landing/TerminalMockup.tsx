'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ArrowUpRight, TrendingUp, Zap, Shield, Cpu } from 'lucide-react';

interface TerminalMockupProps {
  onEnterTerminal: (e?: React.MouseEvent) => void;
}

export default function TerminalMockup({ onEnterTerminal }: TerminalMockupProps) {
  const [activeCandle, setActiveCandle] = useState({ height: 92, up: true });
  const [lastPrice, setLastPrice] = useState(10450);
  const [orderbookDepth, setOrderbookDepth] = useState([
    { bidPrice: 10450, bidVol: 14200, askPrice: 10475, askVol: 8900 },
    { bidPrice: 10425, bidVol: 28400, askPrice: 10500, askVol: 19400 },
    { bidPrice: 10400, bidVol: 45100, askPrice: 10525, askVol: 22100 },
    { bidPrice: 10375, bidVol: 18900, askPrice: 10550, askVol: 31200 },
    { bidPrice: 10350, bidVol: 62000, askPrice: 10575, askVol: 14800 },
  ]);
  const [executionLogs, setExecutionLogs] = useState([
    { id: 1, time: '10:44:12', action: 'FILLED', symbol: 'BBCA', size: '25 Lot', price: '10.450', latency: '9ms' },
    { id: 2, time: '10:44:18', action: 'AUTO-SL', symbol: 'NVDA', size: '10 Shares', price: '$124.50', latency: '12ms' },
    { id: 3, time: '10:44:23', action: 'SIGNAL', symbol: 'BTC/USDT', size: '0.5 BTC', price: '$67,820', latency: '8ms' },
  ]);

  // Live orderbook & tick oscillation
  useEffect(() => {
    const tickInterval = setInterval(() => {
      const delta = (Math.random() - 0.45) * 50;
      setLastPrice((prev) => Math.round(prev + delta));
      setActiveCandle({
        height: Math.floor(Math.random() * 22) + 78,
        up: delta >= 0,
      });

      // Add a live log occasionally
      const newLog = {
        id: Date.now(),
        time: new Date().toTimeString().split(' ')[0],
        action: Math.random() > 0.5 ? 'FILLED' : 'ACCUMULATE',
        symbol: Math.random() > 0.5 ? 'BBCA' : 'ETH/USDT',
        size: Math.floor(Math.random() * 20 + 5) + ' Lot',
        price: '10.' + Math.floor(Math.random() * 50 + 420),
        latency: Math.floor(Math.random() * 6 + 7) + 'ms',
      };
      setExecutionLogs((prev) => [newLog, ...prev.slice(0, 3)]);
    }, 2400);

    return () => clearInterval(tickInterval);
  }, []);

  return (
    <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-b from-white/20 via-emerald-500/20 to-transparent shadow-[0_0_80px_rgba(16,185,129,0.15)] overflow-hidden">
      {/* Outer Glow & Background */}
      <div className="relative bg-[#090c13]/95 backdrop-blur-2xl rounded-[15px] border border-white/10 overflow-hidden font-mono text-xs">
        {/* Mockup Titlebar */}
        <div className="h-10 px-4 bg-[#0d111a] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] text-zinc-400 ml-2 hidden sm:inline">
              workstation://pro.tradesim/execution-hub
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              L2 FEED LIVE
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">LATENCY: 8.4ms</span>
          </div>
        </div>

        {/* Mockup Body: 3-Column Workstation Grid */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Column 1: Live Candlestick & Depth Visualizer (7 Cols) */}
          <div className="lg:col-span-7 bg-[#06080e] rounded-xl border border-white/[0.08] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">BBCA.JK</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                    IDX EQUITY
                  </span>
                  <span className="font-bold text-emerald-400 text-sm ml-1 font-mono-num">
                    Rp {lastPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-semibold">1D • CANDLE + VOL</span>
              </div>

              {/* Simulated Candlestick Chart */}
              <div className="h-44 w-full flex items-end gap-1.5 pt-4 pb-2 relative">
                {[38, 52, 46, 62, 70, 58, 76, 84, 68, 90, 85, 94].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-0.5 h-2.5 bg-emerald-400/30" />
                    <div
                      style={{ height: `${h}%` }}
                      className={`w-full rounded-xs ${i % 3 === 1 ? 'bg-rose-500' : 'bg-emerald-500'} transition-all`}
                    />
                    <div className="w-0.5 h-2.5 bg-emerald-400/30" />
                  </div>
                ))}
                {/* Real-time Ticking Live Candle */}
                <div className="flex-1 flex flex-col items-center gap-1 relative">
                  <div className="w-0.5 h-2.5 bg-emerald-400/60" />
                  <div
                    style={{ height: `${activeCandle.height}%` }}
                    className={`w-full rounded-xs transition-all duration-300 ${
                      activeCandle.up
                        ? 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                        : 'bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                    }`}
                  />
                  <div className="w-0.5 h-2.5 bg-emerald-400/60" />
                  <span className="absolute -top-1 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                </div>
              </div>
            </div>

            {/* Depth Chart Visualizer Bar */}
            <div className="pt-3 border-t border-white/[0.08]">
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span className="text-emerald-400">Total Bids: 184,800 Lot (68%)</span>
                <span className="text-rose-400">Total Asks: 86,400 Lot (32%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 flex overflow-hidden">
                <div className="bg-emerald-500 h-full w-[68%]" />
                <div className="bg-rose-500 h-full w-[32%]" />
              </div>
            </div>
          </div>

          {/* Column 2: Level 2 Orderbook Ladder (5 Cols) */}
          <div className="lg:col-span-5 bg-[#06080e] rounded-xl border border-white/[0.08] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-[10px] text-zinc-400 font-bold uppercase">
                <span>Bid (Buyer)</span>
                <span>Ask (Seller)</span>
              </div>

              {/* Orderbook Ladder Table */}
              <div className="divide-y divide-white/[0.04] text-[11px] my-1">
                {orderbookDepth.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-2 py-1.5 relative">
                    <div className="flex justify-between pr-2 border-r border-white/5">
                      <span className="font-bold text-emerald-400">{row.bidPrice.toLocaleString()}</span>
                      <span className="text-zinc-400 font-mono-num">{row.bidVol.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pl-2">
                      <span className="text-zinc-400 font-mono-num">{row.askVol.toLocaleString()}</span>
                      <span className="font-bold text-rose-400">{row.askPrice.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons inside Terminal Mockup */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center gap-2">
              <button
                type="button"
                onClick={onEnterTerminal}
                className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-center transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>Simulate Order</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Strip: Real-time Algorithmic Execution Tape */}
        <div className="px-4 py-2 bg-[#06080e] border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400 overflow-x-auto">
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-400" />
              AI RADAR LOGS:
            </span>
            {executionLogs.map((log) => (
              <span key={log.id} className="flex items-center gap-1.5 shrink-0">
                <span className="text-zinc-500">[{log.time}]</span>
                <span className="text-white font-semibold">{log.symbol}</span>
                <span className="text-emerald-400 font-bold">{log.action}</span>
                <span className="text-zinc-400">{log.size} @ {log.price}</span>
                <span className="text-zinc-600">•</span>
              </span>
            ))}
          </div>
          <span className="text-emerald-400 font-bold shrink-0 hidden md:inline">0.0% SLIPPAGE</span>
        </div>
      </div>
    </div>
  );
}
