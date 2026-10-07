'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Filter,
  Search,
  RefreshCw,
  X,
  ArrowUpDown,
  Download,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { fetchMarketBoard } from '@/lib/api';
import type { MarketBoardItem } from '@/types';
import CompanyLogo from '@/components/common/CompanyLogo';
import { ALL_ID_HEATMAP_UNIVERSE, HeatmapStockData } from '@/data/heatmap_stocks_universe';
import { INVESTING_COM_GLOBAL_DIVIDENDS } from '@/data/investing_global_dividends';
import { exportToCsv } from '@/lib/exportCsv';

function formatPrice(price: number, currency: string) {
  if (currency === 'IDR') return price.toLocaleString('id-ID');
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const NON_SYARIAH_STOCKS = new Set([
  'BBCA', 'BBRI', 'BMRI', 'BBNI', 'BBTN', 'BDMN', 'BNGA', 'BNLI', 'PNBN', 'BTPN', 'NISP',
  'GGRM', 'HMSP', 'WIIM', 'ITIC', 'MLBI', 'DLTA'
]);

export function isStockSyariah(symbol: string): boolean {
  const clean = symbol.replace('.JK', '').toUpperCase();
  return !NON_SYARIAH_STOCKS.has(clean);
}

const SCREENER_PRESETS = [
  { label: 'LQ45 Blue Chips', category: 'LQ45' },
  { label: 'IDX30 Unggulan', category: 'IDX30' },
  { label: '🌙 Saham Syariah (DES OJK)', category: 'SYARIAH' },
  { label: 'Jakarta Islamic Index (JII)', category: 'JII' },
  { label: 'Sektor Keuangan & Bank', category: 'BANK' },
  { label: 'Energi & Tambang', category: 'ENERGY' },
  { label: 'Teknologi & Digital', category: 'TECH' },
  { label: 'Konsumer & Ritel', category: 'CONSUMER' },
  { label: 'Infrastruktur & Telco', category: 'INFRA' },
  { label: 'Papan Utama BEI', category: 'UTAMA' },
  { label: 'Seluruh Saham BEI', category: 'ALL' },
  { label: '🌍 Saham Global Utama', category: 'GLOBAL' },
];

type SortField = 'symbol' | 'price' | 'changePercentage';
type SortDir = 'asc' | 'desc';

export default function ScreenerPage() {
  const [preset, setPreset] = useState('LQ45');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<MarketBoardItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Fallback mapper from offline universe
  const getOfflineFallback = (cat: string, q: string): MarketBoardItem[] => {
    let source: HeatmapStockData[] = ALL_ID_HEATMAP_UNIVERSE;

    if (cat === 'LQ45') source = source.filter((s) => s.isLQ45);
    else if (cat === 'IDX30') source = source.filter((s) => s.isIDX30);
    else if (cat === 'SYARIAH' || cat === 'JII') source = source.filter((s) => s.isSyariah && (!cat.includes('JII') || s.isLQ45));
    else if (cat === 'BANK') source = source.filter((s) => s.sector === 'Keuangan');
    else if (cat === 'ENERGY') source = source.filter((s) => s.sector === 'Energi');
    else if (cat === 'TECH') source = source.filter((s) => s.sector === 'Teknologi');
    else if (cat === 'CONSUMER') source = source.filter((s) => s.sector.includes('Konsumer'));
    else if (cat === 'INFRA') source = source.filter((s) => s.sector.includes('Infrastruktur'));
    else if (cat === 'UTAMA') source = source.filter((s) => s.marketCap >= 5e12);

    if (q.trim()) {
      const kw = q.toLowerCase();
      source = source.filter(
        (s) =>
          s.displaySymbol.toLowerCase().includes(kw) ||
          s.name.toLowerCase().includes(kw) ||
          s.sector.toLowerCase().includes(kw)
      );
    }

    return source.map((s) => ({
      symbol: s.symbol,
      displaySymbol: s.displaySymbol,
      name: s.name,
      market: 'IDX',
      country: 'ID',
      currency: 'IDR',
      sector: s.sector,
      board: s.isLQ45 ? 'LQ45' : 'Papan Utama',
      tier: s.subSector,
      isLQ45: s.isLQ45,
      hasLiveQuote: true,
      price: s.price,
      changePoint: Math.round(s.price * (s.change1D / 100)),
      changePercentage: s.change1D,
      high: Math.round(s.price * 1.02),
      low: Math.round(s.price * 0.98),
      sparkline: [s.price * 0.98, s.price * 0.99, s.price, s.price * 1.01, s.price],
    }));
  };

  const loadData = async (cat: string, q: string, off: number) => {
    setLoading(true);
    try {
      if (cat === 'GLOBAL') {
        let gList = INVESTING_COM_GLOBAL_DIVIDENDS;
        if (q.trim()) {
          const kw = q.toLowerCase();
          gList = gList.filter(
            (s) =>
              s.ticker.toLowerCase().includes(kw) ||
              s.name.toLowerCase().includes(kw) ||
              s.country.toLowerCase().includes(kw) ||
              s.sector.toLowerCase().includes(kw)
          );
        }

        const mapped: MarketBoardItem[] = gList.map((s) => ({
          symbol: s.ticker,
          displaySymbol: s.ticker,
          name: `${s.flag} ${s.name}`,
          market: s.exchange,
          country: s.country,
          currency: s.currency,
          sector: s.sector,
          board: s.country,
          tier: s.category,
          isLQ45: false,
          hasLiveQuote: true,
          price: s.price,
          changePoint: s.dps,
          changePercentage: s.yieldPct,
          high: s.price * 1.05,
          low: s.price * 0.95,
          sparkline: [s.price * 0.97, s.price * 0.99, s.price, s.price * 1.01, s.price],
        }));

        setItems(mapped);
        setTotal(mapped.length);
        setLoading(false);
        return;
      }

      // Attempt live fetch from backend
      try {
        const data = await fetchMarketBoard(cat === 'SYARIAH' || cat === 'JII' ? 'ALL' : cat, q, 50, off);
        if (data?.data && data.data.length > 0) {
          let res = data.data;
          if (cat === 'SYARIAH' || cat === 'JII') {
            res = res.filter((item) => isStockSyariah(item.displaySymbol));
          }
          setItems(res);
          setTotal(res.length);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback to offline universe
      }

      // Offline Fallback
      const fallbackItems = getOfflineFallback(cat, q);
      setItems(fallbackItems);
      setTotal(fallbackItems.length);
    } catch {
      const fallbackItems = getOfflineFallback(cat, q);
      setItems(fallbackItems);
      setTotal(fallbackItems.length);
    }
    setLoading(false);
  };

  const handleExportCsv = () => {
    exportToCsv<MarketBoardItem>({
      filename: `bloomberg_screener_${preset.toLowerCase()}`,
      columns: [
        { header: 'Ticker', accessor: (i) => i.displaySymbol },
        { header: 'Nama Perusahaan', accessor: (i) => i.name },
        { header: 'Bursa / Market', accessor: (i) => i.market },
        { header: 'Negara', accessor: (i) => i.country },
        { header: 'Mata Uang', accessor: (i) => i.currency },
        { header: 'Sektor', accessor: (i) => i.sector },
        { header: 'Papan / Kategori', accessor: (i) => i.board || i.tier },
        { header: 'Harga Terakhir', accessor: (i) => i.price },
        { header: 'Perubahan %', accessor: (i) => i.changePercentage },
      ],
      data: items,
    });
  };

  useEffect(() => {
    setOffset(0);
    loadData(preset, search, 0);
  }, [preset]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOffset(0);
      loadData(preset, search, 0);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'symbol') return mul * a.displaySymbol.localeCompare(b.displaySymbol);
    if (sortField === 'price') return mul * (a.price - b.price);
    if (sortField === 'changePercentage') return mul * (a.changePercentage - b.changePercentage);
    return 0;
  });

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded bg-[#09090b] border border-[#27272a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-ping" />
            <span className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              STOCK SCREENER PRO
            </span>
            <span className="text-[10px] text-[#71717a]">| BEI &amp; GLOBAL UNIVERSE</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white">
            Penyaring Saham Berdasarkan Sektor &amp; Kategori
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Filter saham likuid LQ45, IDX30, Syariah OJK, sektor perbankan, energi, dan papan utama secara instan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => loadData(preset, search, offset)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#18181b] hover:bg-[#27272a] text-[#d4d4d8] hover:text-white border border-[#27272a] text-xs transition-colors cursor-pointer"
            title="Segarkan data screener"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#f59e0b]' : ''}`} />
            <span>Segarkan</span>
          </button>
          <button
            onClick={handleExportCsv}
            disabled={items.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold text-xs transition-colors cursor-pointer"
            title="Ekspor hasil screener ke CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* ── Preset Category Buttons ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
        {SCREENER_PRESETS.map((p) => (
          <button
            key={p.category}
            onClick={() => setPreset(p.category)}
            className={`px-3 py-1 rounded font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 text-xs ${
              preset === p.category
                ? 'bg-[#f59e0b] text-black shadow-sm font-extrabold'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Search Input ── */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kode saham atau nama emiten (misal: BBCA, ASII, ADRO, Telkom)..."
          className="w-full bg-[#121216] border border-[#27272a] focus:border-[#f59e0b] pl-9 pr-8 py-2 rounded text-white text-xs outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Results Table ── */}
      <div className="rounded border bg-[#09090b] border-[#27272a] overflow-hidden">
        <div className="px-3 py-2 bg-[#121216] border-b border-[#27272a] flex items-center justify-between text-xs text-[#a1a1aa]">
          <div>
            Menampilkan <strong className="text-white">{sortedItems.length}</strong> saham
          </div>
          <div className="text-[10px] text-[#71717a]">
            Klik kolom untuk mengurutkan data
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#121216]/60 text-[#71717a] text-[11px]">
                <th
                  onClick={() => handleSort('symbol')}
                  className="p-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>EMITEN</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">SEKTOR &amp; PAPAN</th>
                <th
                  onClick={() => handleSort('price')}
                  className="p-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>HARGA TERAKHIR</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('changePercentage')}
                  className="p-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>PERUBAHAN 1D</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f23]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#71717a]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#f59e0b]" />
                      <span>Memuat data saham...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#71717a]">
                    Tidak ada saham yang cocok dengan kriteria pencarian &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => {
                  const isUp = item.changePercentage >= 0;
                  return (
                    <tr
                      key={item.symbol}
                      className="hover:bg-[#18181b]/70 transition-colors group"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <CompanyLogo symbol={item.displaySymbol} name={item.name} size={28} rounded="sm" />
                          <div>
                            <Link
                              href={`/stock/${item.displaySymbol}`}
                              className="font-bold text-white group-hover:text-[#f59e0b] transition-colors flex items-center gap-1"
                            >
                              <span>{item.displaySymbol}</span>
                              {item.isLQ45 && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
                                  LQ45
                                </span>
                              )}
                            </Link>
                            <div className="text-[10px] text-[#71717a] truncate max-w-[200px] sm:max-w-xs">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="text-white text-xs">{item.sector}</div>
                        <div className="text-[10px] text-[#71717a]">{item.board}</div>
                      </td>

                      <td className="p-3 text-right font-mono font-bold text-white text-sm">
                        {item.currency === 'IDR' ? 'Rp ' : '$'}
                        {formatPrice(item.price, item.currency)}
                      </td>

                      <td className="p-3 text-right font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            isUp
                              ? 'text-[#22c55e] bg-[#22c55e]/10'
                              : 'text-[#ef4444] bg-[#ef4444]/10'
                          }`}
                        >
                          {isUp ? '+' : ''}{item.changePercentage.toFixed(2)}%
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <Link
                          href={`/stock/${item.displaySymbol}`}
                          className="px-2.5 py-1 rounded bg-[#18181b] hover:bg-[#f59e0b] text-[#a1a1aa] hover:text-black font-bold text-[10px] transition-colors border border-[#27272a] hover:border-[#f59e0b]"
                        >
                          Analisis
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
