'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Activity, ShieldAlert, Zap, Filter, Flame, CheckCircle, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { StockQuote } from '@/types';

interface WhaleAlertTapeProps {
  quote: StockQuote;
}

interface TapeItem {
  id: string;
  time: string;
  price: number;
  lots: number;
  value: number; // in IDR
  isBuy: boolean; // true = Hajar Kanan (Ask), false = Hajar Kiri (Bid)
  isWhale: boolean;
  broker: string;
}

export default function WhaleAlertTape({ quote }: WhaleAlertTapeProps) {
  const [filterMode, setFilterMode] = useState<'ALL' | 'WHALE' | 'BUY' | 'SELL'>('ALL');
  const [spoofingDetected, setSpoofingDetected] = useState(false);

  // Generate realistic initial tape data
  const [trades, setTrades] = useState<TapeItem[]>(() => {
    const basePrice = quote.price || 1000;
    const brokers = ['AK', 'BK', 'ZP', 'RX', 'YP', 'PD', 'CC', 'NI', 'KZ'];
    const now = new Date();

    return Array.from({ length: 25 }, (_, i) => {
      const d = new Date(now.getTime() - i * 4000);
      const isBuy = Math.random() > 0.45;
      const isWhale = Math.random() < 0.25;
      const lots = isWhale ? Math.floor(Math.random() * 3000 + 800) : Math.floor(Math.random() * 150 + 5);
      const offset = (Math.floor(Math.random() * 3) - 1) * 25;
      const price = Math.max(50, basePrice + offset);
      const value = price * lots * 100;
      const broker = brokers[Math.floor(Math.random() * brokers.length)];

      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');

      return {
        id: `tape-${i}-${Date.now()}`,
        time: `${h}:${m}:${s}`,
        price,
        lots,
        value,
        isBuy,
        isWhale,
        broker,
      };
    });
  });

  // Simulate real-time live incoming trade packets
  useEffect(() => {
    const interval = setInterval(() => {
      const isBuy = Math.random() > 0.46;
      const isWhale = Math.random() < 0.22;
      const lots = isWhale ? Math.floor(Math.random() * 3500 + 1000) : Math.floor(Math.random() * 180 + 5);
      const basePrice = quote.price || 1000;
      const offset = (Math.floor(Math.random() * 3) - 1) * 25;
      const price = Math.max(50, basePrice + offset);
      const value = price * lots * 100;
      const brokers = isWhale ? ['AK', 'BK', 'ZP', 'RX', 'KZ'] : ['YP', 'PD', 'CC', 'NI', 'XC'];
      const broker = brokers[Math.floor(Math.random() * brokers.length)];

      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');

      const newTrade: TapeItem = {
        id: `tape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: `${h}:${m}:${s}`,
        price,
        lots,
        value,
        isBuy,
        isWhale,
        broker,
      };

      setTrades((prev) => [newTrade, ...prev.slice(0, 49)]);

      // Random spoofing alert trigger
      if (Math.random() < 0.08) {
        setSpoofingDetected(true);
        setTimeout(() => setSpoofingDetected(false), 8000);
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [quote.price]);

  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      if (filterMode === 'WHALE') return t.isWhale;
      if (filterMode === 'BUY') return t.isBuy;
      if (filterMode === 'SELL') return !t.isBuy;
      return true;
    });
  }, [trades, filterMode]);

  // Whale buy vs sell statistics
  const whaleStats = useMemo(() => {
    const whaleTrades = trades.filter((t) => t.isWhale);
    const buyVal = whaleTrades.filter((t) => t.isBuy).reduce((sum, t) => sum + t.value, 0);
    const sellVal = whaleTrades.filter((t) => !t.isBuy).reduce((sum, t) => sum + t.value, 0);
    const netVal = buyVal - sellVal;
    const totalVal = buyVal + sellVal || 1;
    const buyPct = Math.round((buyVal / totalVal) * 100);
    return { buyVal, sellVal, netVal, buyPct, sellPct: 100 - buyPct, count: whaleTrades.length };
  }, [trades]);

  return (
    <div
      className="rounded-xl border overflow-hidden flex flex-col"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Whale Alert & Institutional Tape Reading</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-extrabold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
                ⚠️ MODEL SIMULASI
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">Simulasi running trade edukasi (Bukan ITCH-feed langsung dari bursa)</p>
          </div>
        </div>

        {/* Spoofing Detector Badge */}
        <div>
          {spoofingDetected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-semibold animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>⚠️ Peringatan: Cabut Antrian (Fake Bid Spoofing)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Orderflow Wajar (No Spoofing)</span>
            </div>
          )}
        </div>
      </div>

      {/* Whale Meter Bar */}
      <div className="px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 flex flex-col gap-1.5 text-xs">
        <div className="flex justify-between items-center font-mono-num text-[11px]">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Whale Buy: Rp {(whaleStats.buyVal / 1e9).toFixed(2)} M ({whaleStats.buyPct}%)
          </span>
          <span className={`font-bold ${whaleStats.netVal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            Net Whale: {whaleStats.netVal >= 0 ? '+' : ''}Rp {(whaleStats.netVal / 1e9).toFixed(2)} Miliar
          </span>
          <span className="text-rose-400 font-semibold flex items-center gap-1">
            Whale Sell: Rp {(whaleStats.sellVal / 1e9).toFixed(2)} M ({whaleStats.sellPct}%) <ArrowDownRight className="w-3.5 h-3.5" />
          </span>
        </div>
        {/* Progress ratio bar */}
        <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden flex">
          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${whaleStats.buyPct}%` }} />
          <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${whaleStats.sellPct}%` }} />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filterMode === 'ALL' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Semua ({trades.length})
          </button>
          <button
            onClick={() => setFilterMode('WHALE')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filterMode === 'WHALE'
                ? 'bg-amber-500 text-black font-bold'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <span>🐋 Whale ({trades.filter((t) => t.isWhale).length})</span>
          </button>
          <button
            onClick={() => setFilterMode('BUY')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filterMode === 'BUY' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            Hajar Kanan
          </button>
          <button
            onClick={() => setFilterMode('SELL')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filterMode === 'SELL' ? 'bg-rose-600 text-white font-bold' : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            Hajar Kiri
          </button>
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">Real-time Feed</span>
      </div>

      {/* Tape Table */}
      <div className="max-h-[340px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-neutral-900/80 sticky top-0 border-b border-neutral-800 text-[11px] text-neutral-400">
            <tr>
              <th className="py-1.5 px-3 text-left">Waktu</th>
              <th className="py-1.5 px-3 text-left">Broker</th>
              <th className="py-1.5 px-3 text-right">Harga</th>
              <th className="py-1.5 px-3 text-right">Volume</th>
              <th className="py-1.5 px-3 text-right">Nilai (IDR)</th>
              <th className="py-1.5 px-3 text-center">Tipe Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 font-mono-num">
            {filteredTrades.map((t) => (
              <tr
                key={t.id}
                className={`hover:bg-neutral-800/40 transition-colors ${
                  t.isWhale ? 'bg-amber-500/5' : ''
                }`}
              >
                <td className="py-2 px-3 text-neutral-400 text-[11px]">{t.time}</td>
                <td className="py-2 px-3">
                  <span className="font-bold text-white px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px]">
                    {t.broker}
                  </span>
                </td>
                <td
                  className={`py-2 px-3 text-right font-semibold ${
                    t.isBuy ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  Rp {t.price.toLocaleString('id-ID')}
                </td>
                <td className="py-2 px-3 text-right">
                  <span className={`font-semibold ${t.isWhale ? 'text-amber-400 font-bold' : 'text-neutral-200'}`}>
                    {t.lots.toLocaleString('id-ID')} lot
                  </span>
                </td>
                <td className="py-2 px-3 text-right text-neutral-300">
                  {t.value >= 1e9
                    ? `Rp ${(t.value / 1e9).toFixed(2)} M`
                    : `Rp ${(t.value / 1e6).toFixed(1)} Jt`}
                </td>
                <td className="py-2 px-3 text-center">
                  {t.isWhale ? (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.isBuy
                          ? 'bg-emerald-500 text-black shadow-sm'
                          : 'bg-rose-500 text-white shadow-sm'
                      }`}
                    >
                      🐋 {t.isBuy ? 'WHALE BUY' : 'WHALE SELL'}
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        t.isBuy
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {t.isBuy ? 'HAKA (Ask)' : 'HAKI (Bid)'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
