'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Search,
  ArrowUpDown,
  Filter,
  Flame,
  Award,
  AlertTriangle,
  Coins,
  ChevronRight,
  Info,
} from 'lucide-react';
import CompanyLogo from '@/components/common/CompanyLogo';
import Link from 'next/link';

interface BrokerDetail {
  code: string;
  name: string;
  type: 'ASING' | 'DOMESTIK';
  buyVol: number; // Ribuan Lot
  buyVal: number; // Milyar Rp
  buyAvg: number;
  sellVol: number;
  sellVal: number;
  sellAvg: number;
  netVal: number; // Milyar Rp
}

interface StockBandarProfile {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  bandarAction: 'BIG_ACCUMULATION' | 'NORMAL_ACCUM' | 'NEUTRAL' | 'NORMAL_DISTRIB' | 'BIG_DISTRIB';
  accumScore: number; // 0 - 100
  top3BuyerConcentration: number; // %
  top3SellerConcentration: number; // %
  foreignNetVal: number; // Milyar Rp
  domesticNetVal: number; // Milyar Rp
  topBuyers: BrokerDetail[];
  topSellers: BrokerDetail[];
  notes: string;
}

const SAMPLE_BANDAR_DATA: Record<string, StockBandarProfile> = {
  BMRI: {
    symbol: 'BMRI',
    name: 'PT Bank Mandiri (Persero) Tbk',
    price: 4030,
    changePercent: 0.50,
    bandarAction: 'BIG_ACCUMULATION',
    accumScore: 92,
    top3BuyerConcentration: 74.2,
    top3SellerConcentration: 38.6,
    foreignNetVal: 482.5,
    domesticNetVal: -482.5,
    topBuyers: [
      { code: 'ZP', name: 'Maybank Sekuritas', type: 'ASING', buyVol: 540, buyVal: 217.6, buyAvg: 4025, sellVol: 40, sellVal: 16.1, sellAvg: 4030, netVal: 201.5 },
      { code: 'AK', name: 'UBS Sekuritas', type: 'ASING', buyVol: 380, buyVal: 153.1, buyAvg: 4030, sellVol: 20, sellVal: 8.1, sellAvg: 4030, netVal: 145.0 },
      { code: 'BK', name: 'J.P. Morgan Sekuritas', type: 'ASING', buyVol: 320, buyVal: 129.0, buyAvg: 4028, sellVol: 15, sellVal: 6.0, sellAvg: 4030, netVal: 123.0 },
      { code: 'RX', name: 'Macquarie Sekuritas', type: 'ASING', buyVol: 190, buyVal: 76.6, buyAvg: 4030, sellVol: 30, sellVal: 12.1, sellAvg: 4030, netVal: 64.5 },
    ],
    topSellers: [
      { code: 'PD', name: 'Indo Premier Sekuritas', type: 'DOMESTIK', buyVol: 40, buyVal: 16.1, buyAvg: 4030, sellVol: 350, sellVal: 140.9, sellAvg: 4025, netVal: -124.8 },
      { code: 'XC', name: 'Ajaib Sekuritas', type: 'DOMESTIK', buyVol: 50, buyVal: 20.1, buyAvg: 4030, sellVol: 280, sellVal: 112.8, sellAvg: 4028, netVal: -92.7 },
      { code: 'YP', name: 'Mirae Asset Sekuritas', type: 'DOMESTIK', buyVol: 60, buyVal: 24.2, buyAvg: 4028, sellVol: 260, sellVal: 104.7, sellAvg: 4025, netVal: -80.5 },
      { code: 'CC', name: 'Mandiri Sekuritas', type: 'DOMESTIK', buyVol: 80, buyVal: 32.2, buyAvg: 4030, sellVol: 240, sellVal: 96.7, sellAvg: 4030, netVal: -64.5 },
    ],
    notes: 'Konsentrasi Smart Money sangat tinggi (74.2%). Tiga broker institusi global (ZP, AK, BK) memborong barang ritel domestik di level Rp 4.030 menjelang Cum-Date dividen tunai.',
  },
  BBCA: {
    symbol: 'BBCA',
    name: 'PT Bank Central Asia Tbk',
    price: 6100,
    changePercent: 1.67,
    bandarAction: 'NORMAL_ACCUM',
    accumScore: 78,
    top3BuyerConcentration: 61.5,
    top3SellerConcentration: 45.2,
    foreignNetVal: 215.3,
    domesticNetVal: -215.3,
    topBuyers: [
      { code: 'AK', name: 'UBS Sekuritas', type: 'ASING', buyVol: 210, buyVal: 128.1, buyAvg: 6090, sellVol: 10, sellVal: 6.1, sellAvg: 6100, netVal: 122.0 },
      { code: 'KZ', name: 'CLSA Sekuritas', type: 'ASING', buyVol: 140, buyVal: 85.3, buyAvg: 6095, sellVol: 20, sellVal: 12.2, sellAvg: 6100, netVal: 73.1 },
      { code: 'RX', name: 'Macquarie Sekuritas', type: 'ASING', buyVol: 90, buyVal: 54.9, buyAvg: 6100, sellVol: 15, sellVal: 9.1, sellAvg: 6090, netVal: 45.8 },
    ],
    topSellers: [
      { code: 'YP', name: 'Mirae Asset Sekuritas', type: 'DOMESTIK', buyVol: 30, buyVal: 18.3, buyAvg: 6100, sellVol: 180, sellVal: 109.8, sellAvg: 6090, netVal: -91.5 },
      { code: 'PD', name: 'Indo Premier Sekuritas', type: 'DOMESTIK', buyVol: 25, buyVal: 15.2, buyAvg: 6090, sellVol: 140, sellVal: 85.4, sellAvg: 6100, netVal: -70.2 },
      { code: 'NI', name: 'BNI Sekuritas', type: 'DOMESTIK', buyVol: 20, buyVal: 12.2, buyAvg: 6100, sellVol: 95, sellVal: 57.9, sellAvg: 6090, netVal: -45.7 },
    ],
    notes: 'Akumulasi konsisten oleh UBS dan CLSA membawa harga menguat ke Rp 6.100. Distribusi ritel domestik terserap solid.',
  },
  ADRO: {
    symbol: 'ADRO',
    name: 'PT Adaro Energy Indonesia Tbk',
    price: 2500,
    changePercent: 3.73,
    bandarAction: 'BIG_ACCUMULATION',
    accumScore: 95,
    top3BuyerConcentration: 79.1,
    top3SellerConcentration: 32.4,
    foreignNetVal: 364.8,
    domesticNetVal: -364.8,
    topBuyers: [
      { code: 'BK', name: 'J.P. Morgan Sekuritas', type: 'ASING', buyVol: 420, buyVal: 105.0, buyAvg: 2490, sellVol: 15, sellVal: 3.7, sellAvg: 2500, netVal: 101.3 },
      { code: 'ZP', name: 'Maybank Sekuritas', type: 'ASING', buyVol: 310, buyVal: 77.4, buyAvg: 2495, sellVol: 10, sellVal: 2.5, sellAvg: 2500, netVal: 74.9 },
      { code: 'CG', name: 'CGS International', type: 'ASING', buyVol: 280, buyVal: 70.0, buyAvg: 2500, sellVol: 20, sellVal: 5.0, sellAvg: 2500, netVal: 65.0 },
    ],
    topSellers: [
      { code: 'XC', name: 'Ajaib Sekuritas', type: 'DOMESTIK', buyVol: 30, buyVal: 7.5, buyAvg: 2500, sellVol: 340, sellVal: 84.7, sellAvg: 2490, netVal: -77.2 },
      { code: 'YP', name: 'Mirae Asset Sekuritas', type: 'DOMESTIK', buyVol: 45, buyVal: 11.2, buyAvg: 2495, sellVol: 290, sellVal: 72.2, sellAvg: 2490, netVal: -61.0 },
      { code: 'PD', name: 'Indo Premier Sekuritas', type: 'DOMESTIK', buyVol: 35, buyVal: 8.7, buyAvg: 2500, sellVol: 210, sellVal: 52.3, sellAvg: 2490, netVal: -43.6 },
    ],
    notes: 'Sentimen spin-off memicu lonjakan harga ke Rp 2.500 (+3.73%). Top 3 Buyer menguasai 79.1% volume pasar reguler.',
  },
  GOTO: {
    symbol: 'GOTO',
    name: 'PT GoTo Gojek Tokopedia Tbk',
    price: 30,
    changePercent: 7.14,
    bandarAction: 'NORMAL_DISTRIB',
    accumScore: 40,
    top3BuyerConcentration: 38.2,
    top3SellerConcentration: 64.8,
    foreignNetVal: -82.4,
    domesticNetVal: 82.4,
    topBuyers: [
      { code: 'XC', name: 'Ajaib Sekuritas', type: 'DOMESTIK', buyVol: 1850, buyVal: 5.5, buyAvg: 30, sellVol: 450, sellVal: 1.3, sellAvg: 30, netVal: 4.2 },
      { code: 'PD', name: 'Indo Premier Sekuritas', type: 'DOMESTIK', buyVol: 1420, buyVal: 4.2, buyAvg: 30, sellVol: 510, sellVal: 1.5, sellAvg: 30, netVal: 2.7 },
      { code: 'YP', name: 'Mirae Asset Sekuritas', type: 'DOMESTIK', buyVol: 1100, buyVal: 3.3, buyAvg: 30, sellVol: 480, sellVal: 1.4, sellAvg: 30, netVal: 1.9 },
    ],
    topSellers: [
      { code: 'BK', name: 'J.P. Morgan Sekuritas', type: 'ASING', buyVol: 120, buyVal: 0.4, buyAvg: 30, sellVol: 2600, sellVal: 7.8, sellAvg: 30, netVal: -7.4 },
      { code: 'AK', name: 'UBS Sekuritas', type: 'ASING', buyVol: 80, buyVal: 0.2, buyAvg: 30, sellVol: 2100, sellVal: 6.3, sellAvg: 30, netVal: -6.1 },
      { code: 'CC', name: 'Mandiri Sekuritas', type: 'DOMESTIK', buyVol: 200, buyVal: 0.6, buyAvg: 30, sellVol: 1500, sellVal: 4.5, sellAvg: 30, netVal: -3.9 },
    ],
    notes: 'Harga rebound ke Rp 30 (+7.14%) didorong spekulasi ritel, namun transaksi asing masih mencatatkan net outflow.',
  },
  ASII: {
    symbol: 'ASII',
    name: 'PT Astra International Tbk',
    price: 4630,
    changePercent: 2.66,
    bandarAction: 'NORMAL_ACCUM',
    accumScore: 71,
    top3BuyerConcentration: 58.4,
    top3SellerConcentration: 42.1,
    foreignNetVal: 128.6,
    domesticNetVal: -128.6,
    topBuyers: [
      { code: 'ZP', name: 'Maybank Sekuritas', type: 'ASING', buyVol: 120, buyVal: 55.5, buyAvg: 4625, sellVol: 15, sellVal: 6.9, sellAvg: 4630, netVal: 48.6 },
      { code: 'KZ', name: 'CLSA Sekuritas', type: 'ASING', buyVol: 95, buyVal: 44.0, buyAvg: 4630, sellVol: 10, sellVal: 4.6, sellAvg: 4630, netVal: 39.4 },
    ],
    topSellers: [
      { code: 'YP', name: 'Mirae Asset Sekuritas', type: 'DOMESTIK', buyVol: 20, buyVal: 9.2, buyAvg: 4630, sellVol: 110, sellVal: 50.9, sellAvg: 4625, netVal: -41.7 },
      { code: 'PD', name: 'Indo Premier Sekuritas', type: 'DOMESTIK', buyVol: 18, buyVal: 8.3, buyAvg: 4625, sellVol: 85, sellVal: 39.3, sellAvg: 4630, netVal: -31.0 },
    ],
    notes: 'Akumulasi mantap di Rp 4.630 (+2.66%) didukung sentimen dividen interim Astra.',
  },
};

export default function BandarmologiRadar() {
  const [selectedStock, setSelectedStock] = useState<string>('BMRI');
  const [search, setSearch] = useState('');

  const current = SAMPLE_BANDAR_DATA[selectedStock] || SAMPLE_BANDAR_DATA['BMRI'];

  const getActionBadge = (action: StockBandarProfile['bandarAction']) => {
    switch (action) {
      case 'BIG_ACCUMULATION':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">BIG ACCUMULATION (Bandar Masuk)</span>;
      case 'NORMAL_ACCUM':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-green-500/15 text-green-400 border border-green-500/30">Akumulasi Sedang</span>;
      case 'NEUTRAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">Netral / Konsolidasi</span>;
      case 'NORMAL_DISTRIB':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">Distribusi Bertahap</span>;
      case 'BIG_DISTRIB':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">BIG DISTRIBUTION (Bandar Keluar)</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Selector Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-zinc-400 font-semibold mr-1 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Hot Ticker:
          </span>
          {Object.keys(SAMPLE_BANDAR_DATA).map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => setSelectedStock(sym)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedStock === sym
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'bg-zinc-800/60 text-zinc-300 hover:text-white hover:bg-zinc-700/60'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>

        <div className="text-xs text-zinc-400">
          Mode Analisis: <span className="text-emerald-400 font-bold">Broker Summary (End of Day Real-time)</span>
        </div>
      </div>

      {/* Main Stock Profile Header */}
      <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CompanyLogo symbol={current.symbol} name={current.name} size={44} rounded="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-mono">{current.symbol}</h3>
                {getActionBadge(current.bandarAction)}
              </div>
              <p className="text-xs text-zinc-400">{current.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Harga Penutupan</div>
              <div className="text-lg font-mono-num font-bold text-white">
                Rp {current.price.toLocaleString('id-ID')}
                <span className={`text-xs ml-1.5 ${current.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {current.changePercent >= 0 ? `+${current.changePercent}%` : `${current.changePercent}%`}
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Bandar Accum Score</div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-mono-num font-bold text-amber-400">{current.accumScore}/100</div>
                <div className="w-20 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      current.accumScore >= 70
                        ? 'bg-emerald-500'
                        : current.accumScore >= 45
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${current.accumScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Foreign Flow</div>
              <div className={`text-sm font-mono-num font-bold ${current.foreignNetVal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {current.foreignNetVal >= 0 ? `+Rp ${current.foreignNetVal} M` : `-Rp ${Math.abs(current.foreignNetVal)} M`}
              </div>
            </div>
          </div>
        </div>

        {/* Bandar Smart Money Summary Note */}
        <div className="mt-3 p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{current.notes}</p>
        </div>
      </div>

      {/* Two Columns: Top Buyers (Akumulator) vs Top Sellers (Distributor) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Net Buyers */}
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Top Net Buyers (Smart Money Inflow)</h4>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Konsentrasi Top 3: {current.top3BuyerConcentration}%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                  <th className="text-left pb-2">Broker</th>
                  <th className="text-center pb-2">Tipe</th>
                  <th className="text-right pb-2">Beli (Milyar)</th>
                  <th className="text-right pb-2">Rata-rata</th>
                  <th className="text-right pb-2">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {current.topBuyers.map((b) => (
                  <tr key={b.code} className="hover:bg-white/5 transition-colors">
                    <td className="py-2">
                      <span className="font-mono font-bold text-emerald-400 mr-1.5">{b.code}</span>
                      <span className="text-[11px] text-zinc-400">{b.name}</span>
                    </td>
                    <td className="py-2 text-center">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        b.type === 'ASING' ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-700 text-zinc-300'
                      }`}>
                        {b.type}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono-num text-white">Rp {b.buyVal.toFixed(1)} M</td>
                    <td className="py-2 text-right font-mono-num text-zinc-300">Rp {b.buyAvg.toLocaleString('id-ID')}</td>
                    <td className="py-2 text-right font-mono-num font-bold text-emerald-400">+Rp {b.netVal.toFixed(1)} M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Net Sellers */}
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <h4 className="text-sm font-bold text-white">Top Net Sellers (Ritel / Distributor)</h4>
            </div>
            <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Konsentrasi Top 3: {current.top3SellerConcentration}%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                  <th className="text-left pb-2">Broker</th>
                  <th className="text-center pb-2">Tipe</th>
                  <th className="text-right pb-2">Jual (Milyar)</th>
                  <th className="text-right pb-2">Rata-rata</th>
                  <th className="text-right pb-2">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {current.topSellers.map((s) => (
                  <tr key={s.code} className="hover:bg-white/5 transition-colors">
                    <td className="py-2">
                      <span className="font-mono font-bold text-rose-400 mr-1.5">{s.code}</span>
                      <span className="text-[11px] text-zinc-400">{s.name}</span>
                    </td>
                    <td className="py-2 text-center">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        s.type === 'ASING' ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-700 text-zinc-300'
                      }`}>
                        {s.type}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono-num text-white">Rp {s.sellVal.toFixed(1)} M</td>
                    <td className="py-2 text-right font-mono-num text-zinc-300">Rp {s.sellAvg.toLocaleString('id-ID')}</td>
                    <td className="py-2 text-right font-mono-num font-bold text-rose-400">-Rp {Math.abs(s.netVal).toFixed(1)} M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
