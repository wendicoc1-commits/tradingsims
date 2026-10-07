'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Maximize2,
  Minimize2,
  Search,
  Layers,
  RefreshCw,
  X,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';
import { ALL_ID_HEATMAP_UNIVERSE, HeatmapStockData } from '@/data/heatmap_stocks_universe';
import { INVESTING_COM_GLOBAL_DIVIDENDS } from '@/data/investing_global_dividends';
import {
  computeSquarifiedTreemap,
  getTradingViewBlockColor,
} from '@/lib/treemapLayout';
import { fetchMarketBoard } from '@/lib/api';
import CompanyLogo from '@/components/common/CompanyLogo';

type DataSourceType = 'AllID' | 'LQ45' | 'IDX30' | 'BUMN20' | 'ISSI' | 'Global100';
type BlockSizeType = 'market_cap_basic' | 'volume' | 'turnover';
type BlockColorType = 'change' | 'change_1w' | 'change_1m' | 'change_1y' | 'div_yield' | 'pe_ratio';
type GroupingType = 'sector' | 'none';

const SECTOR_ICONS: Record<string, string> = {
  'Keuangan': '🏦',
  'Bahan Baku': '🧱',
  'Energi': '⚡',
  'Infrastruktur': '📡',
  'Konsumen Primer': '🛒',
  'Perindustrian': '🏭',
  'Teknologi': '💻',
  'Kesehatan': '🏥',
  'Konsumen Non-Primer': '🛍️',
  'Properti': '🏢',
  'Transportasi': '🚢',
  'United States': '🇺🇸',
  'Jepang': '🇯🇵',
  'Jerman': '🇩🇪',
  'Inggris': '🇬🇧',
  'Swiss': '🇨🇭',
  'Prancis': '🇫🇷',
  'Taiwan': '🇹🇼',
  'Korea Selatan': '🇰🇷',
  'Kanada': '🇨🇦',
  'Australia': '🇦🇺',
  'Arab Saudi': '🇸🇦',
  'Singapura': '🇸🇬',
};

const GLOBAL_HEATMAP_UNIVERSE: HeatmapStockData[] = INVESTING_COM_GLOBAL_DIVIDENDS.map((s) => ({
  symbol: s.ticker,
  displaySymbol: s.ticker,
  name: s.name,
  sector: s.country,
  subSector: s.sector,
  marketCap: Math.round(s.price * 1250000000 * 16000),
  price: s.price,
  change1D: Math.round((Math.sin(s.ticker.charCodeAt(0) * 3) * 2.6) * 10) / 10,
  change1W: Math.round((Math.cos(s.ticker.charCodeAt(0) * 2) * 4.2) * 10) / 10,
  change1M: Math.round((Math.sin(s.price * 5) * 6.5) * 10) / 10,
  change1Y: Math.round(s.growthYears * 1.8 * 10) / 10,
  volume: Math.round(15000000 + Math.abs(Math.sin(s.ticker.charCodeAt(0))) * 30000000),
  turnover: Math.round(s.price * 15000000 * 16000),
  peRatio: Math.max(12, Math.round(100 / Math.max(1, s.yieldPct) * 0.7)),
  divYield: s.yieldPct,
  isLQ45: false,
  isIDX30: false,
  isBUMN: false,
  isSyariah: false,
}));

function formatNumber(num: number): string {
  if (num >= 1e12) return `Rp ${(num / 1e12).toFixed(1)} T`;
  if (num >= 1e9) return `Rp ${(num / 1e9).toFixed(1)} M`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)} jt`;
  return num.toLocaleString('id-ID');
}

export default function IHSGHeatmap() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 720,
  });

  // URL / TradingView parameters
  const [dataSource, setDataSource] = useState<DataSourceType>('AllID');
  const [blockSize, setBlockSize] = useState<BlockSizeType>('market_cap_basic');
  const [blockColor, setBlockColor] = useState<BlockColorType>('change');
  const [grouping, setGrouping] = useState<GroupingType>('sector');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoveredStock, setHoveredStock] = useState<HeatmapStockData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Live stock data merged with backend quotes
  const [stocksData, setStocksData] = useState<HeatmapStockData[]>(ALL_ID_HEATMAP_UNIVERSE);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Measure container dimensions with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0) {
          setDimensions({
            width: Math.floor(width),
            height: Math.max(680, Math.floor(height || (isFullscreen ? window.innerHeight - 150 : 800))),
          });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isFullscreen]);

  // Fetch live market board updates from backend API
  const refreshLiveQuotes = () => {
    setIsRefreshing(true);
    fetchMarketBoard('LQ45', undefined, 50)
      .then((res) => {
        if (!res?.data) return;
        const liveMap = new Map<string, any>();
        res.data.forEach((item) => {
          liveMap.set(item.displaySymbol.toUpperCase(), item);
        });

        setStocksData((prev) =>
          prev.map((s) => {
            const live = liveMap.get(s.displaySymbol.toUpperCase());
            if (live && live.price > 0) {
              return {
                ...s,
                price: live.price,
                change1D: Number(live.changePercentage.toFixed(2)),
              };
            }
            return s;
          })
        );
      })
      .catch(() => {})
      .finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    refreshLiveQuotes();
  }, []);

  // Compute available sectors and counts based on dataSource
  const availableSectors = useMemo(() => {
    let base = dataSource === 'Global100' ? [...GLOBAL_HEATMAP_UNIVERSE] : [...stocksData];
    if (dataSource === 'LQ45') base = base.filter((s) => s.isLQ45);
    else if (dataSource === 'IDX30') base = base.filter((s) => s.isIDX30);
    else if (dataSource === 'BUMN20') base = base.filter((s) => s.isBUMN);
    else if (dataSource === 'ISSI') base = base.filter((s) => s.isSyariah);

    const counts = new Map<string, number>();
    base.forEach((s) => {
      counts.set(s.sector, (counts.get(s.sector) || 0) + 1);
    });

    const sectors = Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
      icon: SECTOR_ICONS[name] || '📊',
    }));

    // Sort by count descending
    sectors.sort((a, b) => b.count - a.count);

    return {
      totalStocks: base.length,
      sectors,
    };
  }, [stocksData, dataSource]);

  // Filter stocks based on dataSource, selectedSector & search
  const filteredStocks = useMemo(() => {
    let list = dataSource === 'Global100' ? [...GLOBAL_HEATMAP_UNIVERSE] : [...stocksData];

    if (dataSource === 'LQ45') {
      list = list.filter((s) => s.isLQ45);
    } else if (dataSource === 'IDX30') {
      list = list.filter((s) => s.isIDX30);
    } else if (dataSource === 'BUMN20') {
      list = list.filter((s) => s.isBUMN);
    } else if (dataSource === 'ISSI') {
      list = list.filter((s) => s.isSyariah);
    }

    if (selectedSector !== 'ALL') {
      list = list.filter((s) => s.sector === selectedSector);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toUpperCase();
      list = list.filter(
        (s) =>
          s.displaySymbol.toUpperCase().includes(q) ||
          s.name.toUpperCase().includes(q) ||
          s.sector.toUpperCase().includes(q) ||
          s.subSector.toUpperCase().includes(q)
      );
    }

    return list;
  }, [stocksData, dataSource, selectedSector, searchQuery]);

  // Metric accessor for sizing
  const getItemValue = (item: HeatmapStockData): number => {
    if (blockSize === 'volume') return Math.max(1, item.volume);
    if (blockSize === 'turnover') return Math.max(1, item.turnover);
    return Math.max(1, item.marketCap); // default: market_cap_basic
  };

  // Metric accessor for color
  const getItemColorMetric = (item: HeatmapStockData): number => {
    if (blockColor === 'change_1w') return item.change1W;
    if (blockColor === 'change_1m') return item.change1M;
    if (blockColor === 'change_1y') return item.change1Y;
    if (blockColor === 'div_yield') return item.divYield;
    if (blockColor === 'pe_ratio') return item.peRatio;
    return item.change1D; // default: 1D change
  };

  // Market Breadth Statistics
  const stats = useMemo(() => {
    const advances = filteredStocks.filter((s) => s.change1D > 0.15).length;
    const unchanged = filteredStocks.filter((s) => s.change1D >= -0.15 && s.change1D <= 0.15).length;
    const declines = filteredStocks.filter((s) => s.change1D < -0.15).length;
    const totalMarketCap = filteredStocks.reduce((sum, s) => sum + s.marketCap, 0);
    const totalTurnover = filteredStocks.reduce((sum, s) => sum + s.turnover, 0);

    return {
      advances,
      declines,
      unchanged,
      totalMarketCap,
      totalTurnover,
    };
  }, [filteredStocks]);

  // Compute Layout: Level 1 (Sectors) and Level 2 (Stocks)
  const layout = useMemo(() => {
    const { width, height } = dimensions;
    if (width <= 0 || height <= 0 || filteredStocks.length === 0) return { sectors: [], flatStocks: [] };

    // Case 1: Tanpa Grup (Flat Treemap)
    if (grouping === 'none') {
      const treemapItems = filteredStocks.map((stock) => ({
        data: stock,
        value: getItemValue(stock),
      }));

      const computed = computeSquarifiedTreemap(treemapItems, {
        x: 0,
        y: 0,
        w: width,
        h: height,
      });

      return {
        sectors: [],
        flatStocks: computed,
      };
    }

    // Case 2: Grouping by Sector
    // 1. Group stocks into sectors
    const sectorMap = new Map<string, HeatmapStockData[]>();
    filteredStocks.forEach((stock) => {
      const arr = sectorMap.get(stock.sector) || [];
      arr.push(stock);
      sectorMap.set(stock.sector, arr);
    });

    // 2. Compute total size per sector
    const sectorTreemapItems = Array.from(sectorMap.entries()).map(([sectorName, stocks]) => {
      const totalWeight = stocks.reduce((sum, s) => sum + getItemValue(s), 0);
      return {
        data: { sectorName, stocks },
        value: totalWeight,
      };
    });

    // 3. Compute Squarified Treemap for Sectors
    const sectorRects = computeSquarifiedTreemap(sectorTreemapItems, {
      x: 0,
      y: 0,
      w: width,
      h: height,
    });

    // 4. For each sector, compute Squarified Treemap for inner stocks
    const sectorsWithStocks = sectorRects.map((secResult) => {
      const { sectorName, stocks } = secResult.data;
      const sRect = secResult.rect;

      const headerHeight = sRect.h < 55 ? 16 : Math.min(22, Math.max(18, Math.floor(sRect.h * 0.1)));
      const contentHeight = Math.max(0, sRect.h - headerHeight);

      const innerStockItems = stocks.map((stk) => ({
        data: stk,
        value: getItemValue(stk),
      }));

      // Calculate inner rectangles relative to content area (x: 0, y: 0)
      const innerComputed = computeSquarifiedTreemap(innerStockItems, {
        x: 0,
        y: 0,
        w: sRect.w,
        h: contentHeight,
      });

      // Compute average 1D change for sector badge
      const avgChange =
        stocks.length > 0
          ? stocks.reduce((acc, s) => acc + s.change1D, 0) / stocks.length
          : 0;

      return {
        sectorName,
        rect: sRect,
        headerHeight,
        contentHeight,
        avgChange,
        stockCount: stocks.length,
        totalMarketCap: stocks.reduce((sum, s) => sum + s.marketCap, 0),
        stocks: innerComputed,
      };
    });

    return {
      sectors: sectorsWithStocks,
      flatStocks: [],
    };
  }, [dimensions, filteredStocks, grouping, blockSize]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`font-mono select-none flex flex-col ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#0c0d10] p-3 overflow-hidden text-neutral-200'
          : 'space-y-2.5 w-full'
      }`}
    >
      {/* ── TradingView Control Bar (Parameter Synchronizer) ── */}
      <div
        className="rounded border p-2 flex flex-wrap items-center justify-between gap-2 text-xs"
        style={{ backgroundColor: '#131722', borderColor: '#2a2e39' }}
      >
        {/* Left: Dropdown Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Sumber Data (dataSource) */}
          <div className="flex items-center bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1">
            <span className="text-[#787b86] text-[10px] mr-1.5 uppercase">Sumber:</span>
            <select
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value as DataSourceType)}
              className="bg-transparent border-none text-[#d1d4dc] text-xs font-bold outline-none cursor-pointer"
            >
              <option value="AllID" className="bg-[#1e222d] text-white">Semua Saham ID (All ID)</option>
              <option value="LQ45" className="bg-[#1e222d] text-white">Indeks LQ45</option>
              <option value="IDX30" className="bg-[#1e222d] text-white">Indeks IDX30</option>
              <option value="BUMN20" className="bg-[#1e222d] text-white">Indeks BUMN20</option>
              <option value="ISSI" className="bg-[#1e222d] text-white">Syariah (ISSI)</option>
              <option value="Global100" className="bg-[#1e222d] text-[#f59e0b] font-bold">🌍 Global & US 100 (Investing.com)</option>
            </select>
          </div>

          {/* 2. Ukuran Blok (blockSize) */}
          <div className="flex items-center bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1">
            <span className="text-[#787b86] text-[10px] mr-1.5 uppercase">Ukuran:</span>
            <select
              value={blockSize}
              onChange={(e) => setBlockSize(e.target.value as BlockSizeType)}
              className="bg-transparent border-none text-[#d1d4dc] text-xs font-bold outline-none cursor-pointer"
            >
              <option value="market_cap_basic" className="bg-[#1e222d] text-white">Kapitalisasi Pasar (Market Cap)</option>
              <option value="volume" className="bg-[#1e222d] text-white">Volume Transaksi</option>
              <option value="turnover" className="bg-[#1e222d] text-white">Nilai Transaksi (Turnover)</option>
            </select>
          </div>

          {/* 3. Warna Blok (blockColor) */}
          <div className="flex items-center bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1">
            <span className="text-[#787b86] text-[10px] mr-1.5 uppercase">Warna:</span>
            <select
              value={blockColor}
              onChange={(e) => setBlockColor(e.target.value as BlockColorType)}
              className="bg-transparent border-none text-[#d1d4dc] text-xs font-bold outline-none cursor-pointer"
            >
              <option value="change" className="bg-[#1e222d] text-white">Performa Harian (1D %)</option>
              <option value="change_1w" className="bg-[#1e222d] text-white">Performa 1 Minggu (%)</option>
              <option value="change_1m" className="bg-[#1e222d] text-white">Performa 1 Bulan (%)</option>
              <option value="change_1y" className="bg-[#1e222d] text-white">Performa 1 Tahun (%)</option>
              <option value="div_yield" className="bg-[#1e222d] text-white">Dividend Yield (%)</option>
              <option value="pe_ratio" className="bg-[#1e222d] text-white">Rasio P/E (Valuasi)</option>
            </select>
          </div>

          {/* 4. Pengelompokan (grouping) */}
          <div className="flex items-center bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1">
            <span className="text-[#787b86] text-[10px] mr-1.5 uppercase">Grup:</span>
            <select
              value={grouping}
              onChange={(e) => setGrouping(e.target.value as GroupingType)}
              className="bg-transparent border-none text-[#d1d4dc] text-xs font-bold outline-none cursor-pointer"
            >
              <option value="sector" className="bg-[#1e222d] text-white">Berdasarkan Sektor</option>
              <option value="none" className="bg-[#1e222d] text-white">Tanpa Pengelompokan</option>
            </select>
          </div>
        </div>

        {/* Right: Search, Breadth & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="flex items-center bg-[#1e222d] border border-[#2a2e39] rounded px-2 py-1">
            <Search className="w-3.5 h-3.5 text-[#787b86] mr-1.5 shrink-0" />
            <input
              type="text"
              placeholder="Cari Ticker (e.g. BBCA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[#d1d4dc] placeholder-[#50535e] text-xs font-mono w-32 sm:w-44 uppercase"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#787b86] hover:text-white ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Refresh Quotes */}
          <button
            onClick={refreshLiveQuotes}
            disabled={isRefreshing}
            className="p-1.5 rounded bg-[#1e222d] border border-[#2a2e39] text-[#787b86] hover:text-white transition-colors cursor-pointer"
            title="Refresh Live Quotes BEI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-[#1e222d] border border-[#2a2e39] text-[#787b86] hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh TradingView'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Sektor Filter Bar (Kategorisasi Sektor Interaktif) ── */}
      <div
        className="rounded border px-2.5 py-1.5 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-thin"
        style={{ backgroundColor: '#131722', borderColor: '#2a2e39' }}
      >
        <span className="text-[#787b86] text-[11px] font-bold uppercase shrink-0 mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-[#2962ff]" />
          Kategori:
        </span>

        {/* Semua Sektor Pill */}
        <button
          onClick={() => setSelectedSector('ALL')}
          className={`shrink-0 px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
            selectedSector === 'ALL'
              ? 'bg-[#2962ff] text-white border-[#2962ff] font-bold shadow-[0_0_8px_rgba(41,98,255,0.4)]'
              : 'bg-[#1e222d] text-[#b2b5be] border-[#2a2e39] hover:bg-[#262b3d] hover:text-white'
          }`}
        >
          <span>🌐</span>
          <span>Semua Sektor</span>
          <span
            className={`text-[10px] px-1 rounded font-mono-num ${
              selectedSector === 'ALL' ? 'bg-black/30 text-white' : 'bg-[#131722] text-[#787b86]'
            }`}
          >
            {availableSectors.totalStocks}
          </span>
        </button>

        {/* Individual Sector Pills */}
        {availableSectors.sectors.map((sec) => {
          const isSelected = selectedSector === sec.name;
          return (
            <button
              key={sec.name}
              onClick={() => setSelectedSector(isSelected ? 'ALL' : sec.name)}
              className={`shrink-0 px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
                isSelected
                  ? 'bg-[#2962ff] text-white border-[#2962ff] font-bold shadow-[0_0_8px_rgba(41,98,255,0.4)]'
                  : 'bg-[#1e222d] text-[#b2b5be] border-[#2a2e39] hover:bg-[#262b3d] hover:text-white'
              }`}
            >
              <span>{sec.icon}</span>
              <span>{sec.name}</span>
              <span
                className={`text-[10px] px-1 rounded font-mono-num ${
                  isSelected ? 'bg-black/30 text-white' : 'bg-[#131722] text-[#787b86]'
                }`}
              >
                {sec.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Market Breadth Telemetry & Legend Bar ── */}
      <div
        className="rounded border px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs"
        style={{ backgroundColor: '#131722', borderColor: '#2a2e39' }}
      >
        <div className="flex items-center gap-3 font-mono-num text-[11px]">
          {selectedSector !== 'ALL' && (
            <div className="flex items-center gap-1.5 bg-[#2962ff]/15 text-[#2962ff] px-2 py-0.5 rounded border border-[#2962ff]/30 font-bold">
              <span>{SECTOR_ICONS[selectedSector] || '📊'}</span>
              <span>Sektor: {selectedSector}</span>
              <button
                onClick={() => setSelectedSector('ALL')}
                className="hover:text-white ml-1 cursor-pointer"
                title="Tampilkan Semua Sektor"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-xs bg-[#089981]" />
            ▲ {stats.advances} Naik
          </span>
          <span className="flex items-center gap-1.5 text-[#94a3b8] font-bold">
            <span className="w-2 h-2 rounded-xs bg-[#2a2e39]" />
            ■ {stats.unchanged} Flat
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-bold">
            <span className="w-2 h-2 rounded-xs bg-[#f23645]" />
            ▼ {stats.declines} Turun
          </span>
          <span className="text-[#363a45] hidden sm:inline">|</span>
          <span className="text-[#787b86] hidden sm:inline">
            Total MCap: <strong className="text-white font-normal">{formatNumber(stats.totalMarketCap)}</strong>
          </span>
        </div>

        {/* Gradient Legend Bar */}
        <div className="flex items-center gap-1 text-[10px] font-mono-num">
          <span className="text-[#f23645] font-bold">-3%</span>
          <div className="h-2 w-28 rounded-xs overflow-hidden flex">
            <div className="flex-1 bg-[#f23645]" />
            <div className="flex-1 bg-[#8c2532]" />
            <div className="flex-1 bg-[#4a1e24]" />
            <div className="flex-1 bg-[#2a2e39]" />
            <div className="flex-1 bg-[#133e36]" />
            <div className="flex-1 bg-[#0c6052]" />
            <div className="flex-1 bg-[#089981]" />
          </div>
          <span className="text-[#089981] font-bold">+3%</span>
        </div>
      </div>

      {/* ── TradingView Squarified Treemap Canvas ── */}
      <div
        ref={containerRef}
        className="w-full relative overflow-hidden rounded border"
        style={{
          height: isFullscreen ? 'calc(100vh - 150px)' : '800px',
          backgroundColor: '#0c0d10',
          borderColor: '#2a2e39',
        }}
        onMouseLeave={() => setHoveredStock(null)}
      >
        {/* Render Sectors Mode */}
        {grouping === 'sector' &&
          layout.sectors.map((sec) => (
            <div
              key={sec.sectorName}
              className="absolute border overflow-hidden box-border"
              style={{
                left: sec.rect.x,
                top: sec.rect.y,
                width: sec.rect.w,
                height: sec.rect.h,
                borderColor: '#2a2e39',
                backgroundColor: '#0c0d10',
              }}
            >
              {/* Sector Header Ribbon */}
              <div
                onClick={() => setSelectedSector(selectedSector === sec.sectorName ? 'ALL' : sec.sectorName)}
                className="w-full bg-[#161922] border-b border-[#2a2e39] px-1.5 flex items-center justify-between text-[#787b86] overflow-hidden cursor-pointer hover:bg-[#1e222d] transition-colors"
                style={{ height: sec.headerHeight }}
                title={`Klik untuk fokus/zoom sektor ${sec.sectorName}`}
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-[11px] shrink-0">{SECTOR_ICONS[sec.sectorName] || '📊'}</span>
                  {sec.rect.w >= 60 && (
                    <span className="font-bold text-[9.5px] tracking-wider text-[#d1d4dc] uppercase truncate">
                      {sec.sectorName}
                    </span>
                  )}
                  {/* Sector Average Return Badge */}
                  {sec.rect.w >= 105 && (
                    <span
                      className={`text-[8.5px] font-mono-num font-bold px-1 rounded shrink-0 ${
                        sec.avgChange >= 0
                          ? 'text-[#089981] bg-[#089981]/15'
                          : 'text-[#f23645] bg-[#f23645]/15'
                      }`}
                    >
                      {sec.avgChange >= 0 ? '+' : ''}
                      {sec.avgChange.toFixed(2)}%
                    </span>
                  )}
                </div>
                {sec.rect.w >= 165 && (
                  <span className="text-[8.5px] font-mono-num text-[#787b86] shrink-0">
                    {sec.stockCount} Saham • {formatNumber(sec.totalMarketCap)}
                  </span>
                )}
              </div>

              {/* Dedicated Content Box for Stocks: Zero Overlap with Header Ribbon */}
              <div
                className="relative w-full overflow-hidden"
                style={{ height: sec.contentHeight }}
              >
                {sec.stocks.map((node) => {
                  const stock = node.data;
                  const r = node.rect;
                  const metricVal = getItemColorMetric(stock);
                  const colorStyle = getTradingViewBlockColor(metricVal, blockColor);

                  // Spatial room heuristics:
                  const hasRoomForLogo = r.w >= 70 && r.h >= 54;
                  const hasRoomForChange = (r.w >= 36 && r.h >= 28) || (r.w >= 50 && r.h >= 22);
                  const hasRoomForPrice = r.w >= 85 && r.h >= 66;
                  const hasRoomForMarketCap = r.w >= 115 && r.h >= 86;

                  const tickerSize =
                    r.w >= 110 && r.h >= 75
                      ? 'text-sm'
                      : r.w >= 65 && r.h >= 45
                      ? 'text-xs'
                      : r.w >= 38 && r.h >= 26
                      ? 'text-[10px]'
                      : 'text-[8.5px]';

                  const changeSize =
                    r.w >= 110 && r.h >= 75
                      ? 'text-xs'
                      : r.w >= 65 && r.h >= 45
                      ? 'text-[10px]'
                      : 'text-[8.5px]';

                  return (
                    <div
                      key={stock.symbol}
                      onClick={() => router.push(`/stock/${stock.displaySymbol}`)}
                      onMouseEnter={(e) => {
                        setHoveredStock(stock);
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={(e) => {
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }}
                      className="absolute box-border transition-colors hover:brightness-125 hover:z-20 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden p-0.5 group"
                      style={{
                        left: r.x,
                        top: r.y,
                        width: r.w,
                        height: r.h,
                        backgroundColor: colorStyle.bg,
                        color: colorStyle.text,
                        border: '1px solid #131722',
                      }}
                    >
                      {/* Ticker Row & Logo */}
                      <div className="flex items-center justify-center gap-1 max-w-full px-0.5 leading-none">
                        {hasRoomForLogo && (
                          <CompanyLogo
                            symbol={stock.displaySymbol}
                            name={stock.name}
                            size={r.w >= 100 ? 18 : 14}
                          />
                        )}
                        <span className={`font-mono font-bold tracking-tight truncate ${tickerSize}`}>
                          {stock.displaySymbol}
                        </span>
                      </div>

                      {/* Metric Value (Change % / Div / PE) */}
                      {hasRoomForChange && (
                        <div className={`font-mono-num font-bold leading-none mt-0.5 truncate max-w-full px-0.5 ${changeSize}`}>
                          {blockColor === 'pe_ratio'
                            ? `${metricVal.toFixed(1)}x`
                            : blockColor === 'div_yield'
                            ? `${metricVal.toFixed(1)}%`
                            : `${metricVal >= 0 ? '+' : ''}${metricVal.toFixed(2)}%`}
                        </div>
                      )}

                      {/* Price and Market Cap */}
                      {hasRoomForPrice && (
                        <div className="mt-1 space-y-0.2 opacity-80 font-mono-num text-[9px] leading-tight hidden sm:block truncate max-w-full">
                          <div>Rp {stock.price.toLocaleString('id-ID')}</div>
                          {hasRoomForMarketCap && (
                            <div className="opacity-75">{formatNumber(stock.marketCap)}</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        {/* Render Flat Mode (Without Grouping) */}
        {grouping === 'none' &&
          layout.flatStocks.map((node) => {
            const stock = node.data;
            const r = node.rect;
            const metricVal = getItemColorMetric(stock);
            const colorStyle = getTradingViewBlockColor(metricVal, blockColor);

            const hasRoomForLogo = r.w >= 70 && r.h >= 54;
            const hasRoomForChange = (r.w >= 36 && r.h >= 28) || (r.w >= 50 && r.h >= 22);
            const hasRoomForPrice = r.w >= 85 && r.h >= 66;
            const hasRoomForMarketCap = r.w >= 115 && r.h >= 86;

            const tickerSize =
              r.w >= 110 && r.h >= 75
                ? 'text-sm'
                : r.w >= 65 && r.h >= 45
                ? 'text-xs'
                : r.w >= 38 && r.h >= 26
                ? 'text-[10px]'
                : 'text-[8.5px]';

            const changeSize =
              r.w >= 110 && r.h >= 75
                ? 'text-xs'
                : r.w >= 65 && r.h >= 45
                ? 'text-[10px]'
                : 'text-[8.5px]';

            return (
              <div
                key={stock.symbol}
                onClick={() => router.push(`/stock/${stock.displaySymbol}`)}
                onMouseEnter={(e) => {
                  setHoveredStock(stock);
                  setTooltipPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseMove={(e) => {
                  setTooltipPos({ x: e.clientX, y: e.clientY });
                }}
                className="absolute box-border transition-colors hover:brightness-125 hover:z-20 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden p-0.5 group"
                style={{
                  left: r.x,
                  top: r.y,
                  width: r.w,
                  height: r.h,
                  backgroundColor: colorStyle.bg,
                  color: colorStyle.text,
                  border: '1px solid #131722',
                }}
              >
                <div className="flex items-center justify-center gap-1 max-w-full px-0.5 leading-none">
                  {hasRoomForLogo && (
                    <CompanyLogo
                      symbol={stock.displaySymbol}
                      name={stock.name}
                      size={r.w >= 100 ? 18 : 14}
                    />
                  )}
                  <span className={`font-mono font-bold tracking-tight truncate ${tickerSize}`}>
                    {stock.displaySymbol}
                  </span>
                </div>

                {hasRoomForChange && (
                  <div className={`font-mono-num font-bold leading-none mt-0.5 truncate max-w-full px-0.5 ${changeSize}`}>
                    {blockColor === 'pe_ratio'
                      ? `${metricVal.toFixed(1)}x`
                      : blockColor === 'div_yield'
                      ? `${metricVal.toFixed(1)}%`
                      : `${metricVal >= 0 ? '+' : ''}${metricVal.toFixed(2)}%`}
                  </div>
                )}

                {hasRoomForPrice && (
                  <div className="mt-1 space-y-0.2 opacity-80 font-mono-num text-[9px] leading-tight hidden sm:block truncate max-w-full">
                    <div>Rp {stock.price.toLocaleString('id-ID')}</div>
                    {hasRoomForMarketCap && (
                      <div className="opacity-75">{formatNumber(stock.marketCap)}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* ── TradingView Floating Tooltip Card ── */}
      {hoveredStock && tooltipPos && (
        <div
          className="fixed pointer-events-none z-50 bg-[#1e222d] border border-[#363a45] rounded-md shadow-2xl p-3 w-64 text-xs font-mono text-white animate-in fade-in"
          style={{
            left: Math.min(window.innerWidth - 270, tooltipPos.x + 14),
            top: Math.min(window.innerHeight - 240, tooltipPos.y + 14),
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#2a2e39] pb-2 mb-2">
            <div className="flex items-center gap-2">
              <CompanyLogo
                symbol={hoveredStock.displaySymbol}
                name={hoveredStock.name}
                size={30}
                rounded="md"
              />
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>{hoveredStock.displaySymbol}</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-[#2a2e39] text-[#787b86]">
                    {hoveredStock.sector}
                  </span>
                </div>
                <div className="text-[10px] text-[#787b86] truncate max-w-[150px]">
                  {hoveredStock.name}
                </div>
                {hoveredStock.subSector && (
                  <div className="text-[9px] text-[#50535e] truncate max-w-[150px]">
                    {hoveredStock.subSector}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-xs text-white">
                Rp {hoveredStock.price.toLocaleString('id-ID')}
              </div>
              <div
                className={`text-[10px] font-bold ${
                  hoveredStock.change1D >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {hoveredStock.change1D >= 0 ? '+' : ''}{hoveredStock.change1D.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Key Metrics Breakdown */}
          <div className="space-y-1 text-[10px] text-[#9598a1]">
            <div className="flex justify-between">
              <span>Kapitalisasi Pasar:</span>
              <span className="font-bold text-white">{formatNumber(hoveredStock.marketCap)}</span>
            </div>
            <div className="flex justify-between">
              <span>Volume Saham:</span>
              <span className="font-bold text-white">{(hoveredStock.volume / 1e6).toFixed(1)} Juta lbr</span>
            </div>
            <div className="flex justify-between">
              <span>Nilai Transaksi:</span>
              <span className="font-bold text-white">{formatNumber(hoveredStock.turnover)}</span>
            </div>
            <div className="flex justify-between">
              <span>P/E Ratio (Valuasi):</span>
              <span className="font-bold text-white">{hoveredStock.peRatio > 0 ? `${hoveredStock.peRatio.toFixed(1)}x` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Dividend Yield:</span>
              <span className="font-bold text-emerald-400">{hoveredStock.divYield > 0 ? `${hoveredStock.divYield.toFixed(1)}%` : '—'}</span>
            </div>
          </div>

          {/* Action Hint */}
          <div className="mt-2.5 pt-1.5 border-t border-[#2a2e39] flex items-center justify-between text-[9px] text-[#787b86]">
            <span>Klik untuk buka chart penuh</span>
            <span className="text-amber-400 font-bold flex items-center gap-0.5">
              Chartbit ↗
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
