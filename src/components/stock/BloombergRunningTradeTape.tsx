'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Filter,
  Play,
  Pause,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TradeTicket {
  id: string;
  time: string;
  symbol: string;
  price: number;
  lots: number;
  action: 'HAKA' | 'HAKI' | 'CROSSING';
  brokerBuyer?: string;
  brokerSeller?: string;
}

const INITIAL_TRADES: TradeTicket[] = [
  { id: 't-1', time: '14:59:58', symbol: 'BMRI', price: 4030, lots: 2500, action: 'HAKA', brokerBuyer: 'ZP', brokerSeller: 'PD' },
  { id: 't-2', time: '14:59:55', symbol: 'BBCA', price: 6100, lots: 1800, action: 'HAKA', brokerBuyer: 'AK', brokerSeller: 'YP' },
  { id: 't-3', time: '14:59:52', symbol: 'ADRO', price: 2500, lots: 4500, action: 'HAKA', brokerBuyer: 'BK', brokerSeller: 'XC' },
  { id: 't-4', time: '14:59:49', symbol: 'GOTO', price: 30, lots: 25000, action: 'HAKI', brokerBuyer: 'PD', brokerSeller: 'BK' },
  { id: 't-5', time: '14:59:45', symbol: 'ASII', price: 4630, lots: 1200, action: 'HAKA', brokerBuyer: 'KZ', brokerSeller: 'NI' },
  { id: 't-6', time: '14:59:41', symbol: 'PTBA', price: 3180, lots: 950, action: 'HAKI', brokerBuyer: 'YP', brokerSeller: 'CG' },
  { id: 't-7', time: '14:59:38', symbol: 'BMRI', price: 4030, lots: 5200, action: 'HAKA', brokerBuyer: 'BK', brokerSeller: 'CC' },
  { id: 't-8', time: '14:59:32', symbol: 'BBRI', price: 3080, lots: 3400, action: 'HAKA', brokerBuyer: 'ZP', brokerSeller: 'PD' },
];

export default function BloombergRunningTradeTape() {
  const [trades, setTrades] = useState<TradeTicket[]>(INITIAL_TRADES);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [filterSymbol, setFilterSymbol] = useState<string>('ALL');

  // Order Flow Metrics (HAKA vs HAKI)
  const hakaVolume = trades.filter((t) => t.action === 'HAKA').reduce((s, t) => s + t.lots, 0);
  const hakiVolume = trades.filter((t) => t.action === 'HAKI').reduce((s, t) => s + t.lots, 0);
  const totalVol = hakaVolume + hakiVolume || 1;
  const hakaRatio = ((hakaVolume / totalVol) * 100).toFixed(1);

  // Live Simulation ticker streamer
  useEffect(() => {
    if (!isLive) return;

    const symbols = ['BMRI', 'BBCA', 'ADRO', 'BBRI', 'ASII', 'GOTO', 'PTBA', 'TLKM'];
    const prices: Record<string, number> = { BMRI: 4030, BBCA: 6100, ADRO: 2500, BBRI: 3080, ASII: 4630, GOTO: 30, PTBA: 3180, TLKM: 2850 };
    const brokers = ['ZP', 'AK', 'BK', 'RX', 'KZ', 'PD', 'YP', 'XC', 'CC', 'NI'];

    const interval = setInterval(() => {
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      const basePrice = prices[sym];
      const isBuy = Math.random() > 0.42; // slightly bullish bias
      const lots = Math.floor(Math.random() * 3500) + 50;

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      const newTicket: TradeTicket = {
        id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        time: timeStr,
        symbol: sym,
        price: basePrice,
        lots,
        action: isBuy ? 'HAKA' : 'HAKI',
        brokerBuyer: brokers[Math.floor(Math.random() * brokers.length)],
        brokerSeller: brokers[Math.floor(Math.random() * brokers.length)],
      };

      setTrades((prev) => [newTicket, ...prev.slice(0, 40)]);
    }, 1800);

    return () => clearInterval(interval);
  }, [isLive]);

  const filtered = filterSymbol === 'ALL' ? trades : trades.filter((t) => t.symbol === filterSymbol);

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Top OFI (Order Flow Imbalance) Pressure Bar */}
      <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>ORDER FLOW IMBALANCE (OFI) & RUNNING TRADE</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  LEVEL 2 TAPE
                </span>
              </div>
              <p className="text-xs text-zinc-400">Tekanan Beli Agresif (HAKA) vs Tekanan Jual Agresif (HAKI)</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                isLive
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}
            >
              {isLive ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isLive ? 'STREAMING LIVE' : 'PAUSED'}</span>
            </button>
          </div>
        </div>

        {/* Visual OFI Gauge Bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> HAKA (Beli Agresif): {hakaRatio}% ({hakaVolume.toLocaleString()} Lot)
            </span>
            <span className="text-rose-400 flex items-center gap-1">
              HAKI (Jual Agresif): {(100 - Number(hakaRatio)).toFixed(1)}% ({hakiVolume.toLocaleString()} Lot) <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${hakaRatio}%` }}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${100 - Number(hakaRatio)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Running Trade Tape Table */}
      <div className="rounded-xl border overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-semibold">Live Trade Execution Stream</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {['ALL', 'BMRI', 'BBCA', 'ADRO', 'BBRI', 'ASII'].map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => setFilterSymbol(sym)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                  filterSymbol === sym ? 'bg-amber-500 text-black' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[360px] scrollbar-thin">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-[11px]">
              <tr>
                <th className="text-left py-2 px-3">Waktu</th>
                <th className="text-left py-2 px-3">Ticker</th>
                <th className="text-right py-2 px-3">Harga</th>
                <th className="text-right py-2 px-3">Volume (Lot)</th>
                <th className="text-center py-2 px-3">Aksi</th>
                <th className="text-center py-2 px-3">Buyer &rarr; Seller</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {filtered.map((t) => {
                const isHaka = t.action === 'HAKA';
                return (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors font-mono">
                    <td className="py-2 px-3 text-zinc-400 text-[11px]">{t.time}</td>
                    <td className="py-2 px-3 font-bold text-white">{t.symbol}</td>
                    <td className={`py-2 px-3 text-right font-bold ${isHaka ? 'text-emerald-400' : 'text-rose-400'}`}>
                      Rp {t.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-white">
                      {t.lots.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isHaka
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {t.action}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center text-[11px] text-zinc-300">
                      <span className="font-bold text-emerald-400">{t.brokerBuyer}</span>
                      <span className="text-zinc-500 mx-1">&rarr;</span>
                      <span className="font-bold text-rose-400">{t.brokerSeller}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
