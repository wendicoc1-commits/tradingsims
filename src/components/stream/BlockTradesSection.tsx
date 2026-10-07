'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  Zap,
  Filter,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import CompanyLogo from '@/components/common/CompanyLogo';

export interface BlockTrade {
  id: string;
  time: string;
  ticker: string;
  name: string;
  marketType: 'NEGOSIASI' | 'REGULER' | 'CROSSING';
  price: number;
  lots: number;
  value: number; // IDR
  buyerBroker: string;
  sellerBroker: string;
  isForeignBuy: boolean;
  isForeignSell: boolean;
}

const BROKERS: Record<string, { name: string; type: 'FOREIGN' | 'DOMESTIC' }> = {
  ZP: { name: 'Maybank Kim Eng Sekuritas', type: 'FOREIGN' },
  BK: { name: 'J.P. Morgan Sekuritas Indonesia', type: 'FOREIGN' },
  RX: { name: 'Macquarie Sekuritas Indonesia', type: 'FOREIGN' },
  AK: { name: 'UBS Sekuritas Indonesia', type: 'FOREIGN' },
  CS: { name: 'Credit Suisse / UBS', type: 'FOREIGN' },
  CG: { name: 'Citigroup Sekuritas Indonesia', type: 'FOREIGN' },
  CC: { name: 'Mandiri Sekuritas', type: 'DOMESTIC' },
  NI: { name: 'BNI Sekuritas', type: 'DOMESTIC' },
  PD: { name: 'Indo Premier Sekuritas', type: 'DOMESTIC' },
  YP: { name: 'Mirae Asset Sekuritas', type: 'DOMESTIC' },
  DR: { name: 'RHB Sekuritas Indonesia', type: 'DOMESTIC' },
};

export default function BlockTradesSection() {
  const [filterType, setFilterType] = useState<'ALL' | 'NEGO' | 'FOREIGN' | 'ABOVE_5B'>('ALL');
  const [selectedTicker, setSelectedTicker] = useState<string>('ALL');

  const [trades, setTrades] = useState<BlockTrade[]>([
    {
      id: 'bt-01',
      time: '14:48:12',
      ticker: 'BBCA',
      name: 'Bank Central Asia',
      marketType: 'NEGOSIASI',
      price: 10450,
      lots: 24500,
      value: 25602500000,
      buyerBroker: 'BK',
      sellerBroker: 'CC',
      isForeignBuy: true,
      isForeignSell: false,
    },
    {
      id: 'bt-02',
      time: '14:42:05',
      ticker: 'BMRI',
      name: 'Bank Mandiri',
      marketType: 'REGULER',
      price: 7050,
      lots: 18200,
      value: 12831000000,
      buyerBroker: 'AK',
      sellerBroker: 'YP',
      isForeignBuy: true,
      isForeignSell: false,
    },
    {
      id: 'bt-03',
      time: '14:35:40',
      ticker: 'BBRI',
      name: 'Bank Rakyat Indonesia',
      marketType: 'CROSSING',
      price: 4980,
      lots: 35000,
      value: 17430000000,
      buyerBroker: 'RX',
      sellerBroker: 'ZP',
      isForeignBuy: true,
      isForeignSell: true,
    },
    {
      id: 'bt-04',
      time: '14:28:19',
      ticker: 'TLKM',
      name: 'Telkom Indonesia',
      marketType: 'REGULER',
      price: 3120,
      lots: 22000,
      value: 6864000000,
      buyerBroker: 'ZP',
      sellerBroker: 'PD',
      isForeignBuy: true,
      isForeignSell: false,
    },
    {
      id: 'bt-05',
      time: '14:15:52',
      ticker: 'ADRO',
      name: 'Adaro Energy Indonesia',
      marketType: 'NEGOSIASI',
      price: 3840,
      lots: 40000,
      value: 15360000000,
      buyerBroker: 'CC',
      sellerBroker: 'NI',
      isForeignBuy: false,
      isForeignSell: false,
    },
    {
      id: 'bt-06',
      time: '14:02:11',
      ticker: 'AMMN',
      name: 'Amman Mineral Internasional',
      marketType: 'REGULER',
      price: 9450,
      lots: 12500,
      value: 11812500000,
      buyerBroker: 'BK',
      sellerBroker: 'DR',
      isForeignBuy: true,
      isForeignSell: false,
    },
    {
      id: 'bt-07',
      time: '13:50:33',
      ticker: 'ASII',
      name: 'Astra International',
      marketType: 'REGULER',
      price: 5200,
      lots: 15000,
      value: 7800000000,
      buyerBroker: 'RX',
      sellerBroker: 'CC',
      isForeignBuy: true,
      isForeignSell: false,
    },
  ]);

  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      if (selectedTicker !== 'ALL' && t.ticker !== selectedTicker) return false;
      if (filterType === 'NEGO' && t.marketType !== 'NEGOSIASI') return false;
      if (filterType === 'FOREIGN' && !t.isForeignBuy) return false;
      if (filterType === 'ABOVE_5B' && t.value < 5000000000) return false;
      return true;
    });
  }, [trades, filterType, selectedTicker]);

  const totalValueNego = useMemo(() => {
    return trades.reduce((acc, t) => acc + t.value, 0);
  }, [trades]);

  const foreignNetValue = useMemo(() => {
    return trades.reduce((acc, t) => {
      if (t.isForeignBuy && !t.isForeignSell) return acc + t.value;
      if (!t.isForeignBuy && t.isForeignSell) return acc - t.value;
      return acc;
    }, 0);
  }, [trades]);

  return (
    <div className="space-y-4 font-mono">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-[#121216] border border-[#27272a] rounded">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Total Transaksi Crossing / Nego</div>
          <div className="text-base sm:text-lg font-black text-white mt-1">
            Rp {(totalValueNego / 1000000000).toFixed(1)} Miliar
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">{trades.length} transaksi jumbo terdeteksi</div>
        </div>

        <div className="p-3 bg-[#121216] border border-[#27272a] rounded">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Foreign Crossing Net Flow</div>
          <div className={`text-base sm:text-lg font-black mt-1 ${foreignNetValue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {foreignNetValue >= 0 ? '+' : ''}Rp {(foreignNetValue / 1000000000).toFixed(1)} Miliar
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Institusi global akumulasi bersih</div>
        </div>

        <div className="p-3 bg-[#121216] border border-[#27272a] rounded">
          <div className="text-[10px] text-[#71717a] uppercase font-bold">Transaksi Nego Terbesar</div>
          <div className="text-base sm:text-lg font-black text-amber-400 mt-1">
            BBCA • Rp 25.6 M
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Broker BK &rarr; CC (24.500 Lot)</div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#101014] border border-[#27272a] rounded text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] text-zinc-500 font-bold uppercase mr-1">Filter:</span>
          {[
            { id: 'ALL', label: 'Semua Transaksi Jumbo' },
            { id: 'NEGO', label: 'Khusus Pasar Nego' },
            { id: 'FOREIGN', label: 'Foreign Buyer (Institusi Asing)' },
            { id: 'ABOVE_5B', label: 'Nilai > Rp 5 Miliar' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors whitespace-nowrap ${
                filterType === f.id
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'bg-[#18181e] text-zinc-400 hover:text-white border border-[#27272a]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-zinc-500">Emiten:</span>
          {['ALL', 'BBCA', 'BMRI', 'BBRI', 'TLKM', 'ADRO'].map((sym) => (
            <button
              key={sym}
              onClick={() => setSelectedTicker(sym)}
              className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                selectedTicker === sym
                  ? 'bg-amber-500 text-black'
                  : 'bg-[#18181e] text-zinc-400 hover:text-white'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Block Trades Table */}
      <div className="rounded border border-[#27272a] bg-[#101014] overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr className="border-b border-[#27272a] bg-[#141418] text-[10px] text-[#71717a] uppercase">
              <th className="py-2.5 px-3">Waktu</th>
              <th className="py-2.5 px-3">Emiten</th>
              <th className="py-2.5 px-3">Pasar</th>
              <th className="py-2.5 px-3 text-right">Harga</th>
              <th className="py-2.5 px-3 text-right">Volume (Lot)</th>
              <th className="py-2.5 px-3 text-right">Nilai Transaksi</th>
              <th className="py-2.5 px-3 text-center">Buyer (Pembeli)</th>
              <th className="py-2.5 px-3 text-center">Seller (Penjual)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e24]">
            {filteredTrades.map((t) => (
              <tr key={t.id} className="hover:bg-[#181820] transition-colors">
                <td className="py-2.5 px-3 text-zinc-400 text-[11px] whitespace-nowrap">{t.time}</td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <Link href={`/stock/${t.ticker}`} className="flex items-center gap-2 hover:text-amber-400">
                    <CompanyLogo symbol={t.ticker} size="sm" />
                    <div>
                      <div className="font-bold text-white text-xs">{t.ticker}</div>
                      <div className="text-[9.5px] text-zinc-500 line-clamp-1">{t.name}</div>
                    </div>
                  </Link>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold border ${
                    t.marketType === 'NEGOSIASI'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : t.marketType === 'CROSSING'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}>
                    {t.marketType}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-white whitespace-nowrap">
                  Rp {t.price.toLocaleString('id-ID')}
                </td>
                <td className="py-2.5 px-3 text-right text-zinc-300 whitespace-nowrap">
                  {t.lots.toLocaleString('id-ID')} Lot
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-amber-400 whitespace-nowrap">
                  Rp {(t.value / 1000000000).toFixed(2)} M
                </td>
                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.isForeignBuy ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {t.buyerBroker} {t.isForeignBuy ? '(Asing)' : '(Dom)'}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.isForeignSell ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {t.sellerBroker} {t.isForeignSell ? '(Asing)' : '(Dom)'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
