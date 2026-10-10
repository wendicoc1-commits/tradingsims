'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  BookOpen,
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  Check,
  Newspaper,
  Zap,
  Wallet,
  Briefcase,
  Target,
  Shield,
  Calendar,
  FileText,
  Bot,
  Scale,
  Award,
  GitMerge,
  Users,
} from 'lucide-react';
import { fetchQuote, fetchHistory } from '@/lib/api';
import { useWatchlistStore, usePortfolioStore } from '@/store';
import type { StockQuote, HistoryCandle } from '@/types';
import { calculateEMA, calculateRSI } from '@/lib/indicators';
import NewsAndBusinessPanel from '@/components/stock/NewsAndBusinessPanel';
import ChartbitTradingPanel from '@/components/stock/ChartbitTradingPanel';
import InstitutionalBrokerSummary from '@/components/stock/InstitutionalBrokerSummary';
import PeerComparison from '@/components/stock/PeerComparison';
import WhaleAlertTape from '@/components/stock/WhaleAlertTape';
import FairValueCalculator from '@/components/stock/FairValueCalculator';
import HistoricalValuationBand from '@/components/stock/HistoricalValuationBand';
import DuPontAnalysisDesk from '@/components/stock/DuPontAnalysisDesk';
import AnalystConsensusDesk from '@/components/stock/AnalystConsensusDesk';
import SupplyChainNetworkDesk from '@/components/stock/SupplyChainNetworkDesk';
import InsiderOwnershipDesk from '@/components/stock/InsiderOwnershipDesk';
import OptionsWarrantsDesk from '@/components/stock/OptionsWarrantsDesk';
import FinancialStatementsTable from '@/components/stock/FinancialStatementsTable';
import ForeignFlowMatrix from '@/components/stock/ForeignFlowMatrix';
import CompanyLogo from '@/components/common/CompanyLogo';
import { ALL_ID_HEATMAP_UNIVERSE } from '@/data/heatmap_stocks_universe';
import { getAssetBySymbol } from '@/lib/universe/masterAssetUniverse';
import { getVerifiedBenchmarkPrice } from '@/data/idx_benchmark_prices';
import BandarmologyFlowEngine from '@/components/stock/BandarmologyFlowEngine';
import SeasonalityHeatmap from '@/components/stock/SeasonalityHeatmap';
import ResearchTearSheetModal from '@/components/stock/ResearchTearSheetModal';
import AIResearchCopilot from '@/components/stock/AIResearchCopilot';
import BloombergFairValueCompass from '@/components/stock/BloombergFairValueCompass';
import OpenBBWorkspaceDesk from '@/components/openbb/OpenBBWorkspaceDesk';
import AIChartPilotHUD from '@/components/stock/AIChartPilotHUD';
import PineScriptStudioModal from '@/components/stock/PineScriptStudioModal';
import MultiTimeframeRadar from '@/components/stock/MultiTimeframeRadar';
import type { ChartAnnotationOverlay, PineScriptResult } from '@/lib/charting/aiChartPilotEngine';

function formatPrice(price: number, currency: string) {
  if (currency === 'IDR') return price.toLocaleString('id-ID');
  if (price < 0.00001) return price.toFixed(8);
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatMarketCap(mc: number) {
  if (!mc) return '—';
  if (mc >= 1e15) return (mc / 1e15).toFixed(2) + ' Kuadriliun';
  if (mc >= 1e12) return (mc / 1e12).toFixed(2) + ' Triliun';
  if (mc >= 1e9) return (mc / 1e9).toFixed(2) + ' Miliar';
  if (mc >= 1e6) return (mc / 1e6).toFixed(2) + ' Juta';
  return mc.toLocaleString();
}

function generateFallbackStockCandles(basePrice: number, count = 60): HistoryCandle[] {
  const candles: HistoryCandle[] = [];
  const now = new Date();
  const minFloor = basePrice < 0.001 ? basePrice * 0.1 : basePrice < 1 ? basePrice * 0.2 : basePrice < 50 ? basePrice * 0.5 : 50;
  let price = Math.max(minFloor, basePrice * 0.92);
  const prec = basePrice < 0.00001 ? 8 : basePrice < 0.01 ? 6 : basePrice < 1 ? 4 : basePrice < 100 ? 2 : 0;
  const roundP = (v: number) => prec > 0 ? Number(v.toFixed(prec)) : Math.round(v);

  for (let i = count; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const timeSec = Math.floor(d.getTime() / 1000);
    const change = (Math.random() - 0.48) * 0.03 * price;
    const open = roundP(price);
    const close = roundP(Math.max(minFloor, price + change));
    const high = roundP(Math.max(open, close) + Math.random() * 0.015 * price);
    const low = roundP(Math.max(minFloor, Math.min(open, close) - Math.random() * 0.015 * price));
    const volume = Math.floor(Math.random() * 500000) + 10000;
    price = close;
    candles.push({ time: timeSec, open, high, low, close, volume });
  }
  return candles;
}

/* ─── Candlestick Chart Component ─── */
function CandlestickChart({
  symbol,
  timeframe,
  basePrice,
  indicators = { ema20: true, ema50: false, ema200: false, rsi: false },
  positionLines,
  aiOverlays,
  appliedScript,
}: {
  symbol: string;
  timeframe: string;
  basePrice?: number;
  indicators?: { ema20: boolean; ema50: boolean; ema200: boolean; rsi: boolean };
  positionLines?: { entryPrice?: number; takeProfit?: number; stopLoss?: number };
  aiOverlays?: ChartAnnotationOverlay[];
  appliedScript?: PineScriptResult | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [candles, setCandles] = useState<HistoryCandle[]>([]);
  const [loading, setLoading] = useState(true);

  // Hitung RSI terkini jika dibutuhkan
  const rsiValue = useMemo(() => {
    if (!candles || candles.length < 15) return null;
    const rsiPoints = calculateRSI(
      candles.map((c) => ({
        time: (typeof c.time === 'number' ? c.time : Math.floor(new Date(c.time).getTime() / 1000)),
        close: Number(c.close),
      })),
      14
    );
    if (rsiPoints.length === 0) return null;
    return rsiPoints[rsiPoints.length - 1].value;
  }, [candles]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchHistory(symbol, timeframe)
      .then((data) => {
        if (isMounted) {
          if (data?.candles && data.candles.length > 0) {
            setCandles(data.candles);
          } else {
            setCandles(generateFallbackStockCandles(basePrice || 5000));
          }
        }
      })
      .catch(() => {
        if (isMounted) setCandles(generateFallbackStockCandles(basePrice || 5000));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [symbol, timeframe, basePrice]);

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return;

    let isSubscribed = true;

    import('lightweight-charts').then(({ createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries, LineStyle, createSeriesMarkers }: any) => {
      if (!isSubscribed || !containerRef.current) return;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }

      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#8888a0',
          fontSize: 11,
        },
        grid: {
          vertLines: { color: 'rgba(42, 42, 62, 0.4)' },
          horzLines: { color: 'rgba(42, 42, 62, 0.4)' },
        },
        width: containerRef.current.clientWidth,
        height: 420,
        timeScale: {
          borderColor: '#2a2a3e',
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: '#2a2a3e',
        },
      });

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#00c853',
        downColor: '#ff1744',
        borderUpColor: '#00c853',
        borderDownColor: '#ff1744',
        wickUpColor: '#00c853',
        wickDownColor: '#ff1744',
      });

      const mappedCandles = candles.map((c) => ({
        time: (typeof c.time === 'number' ? c.time : Math.floor(new Date(c.time).getTime() / 1000)) as any,
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
      }));

      candleSeries.setData(mappedCandles);

      // Volume histogram
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#448aff33',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.82,
          bottom: 0,
        },
      });

      volumeSeries.setData(
        candles.map((c) => ({
          time: (typeof c.time === 'number' ? c.time : Math.floor(new Date(c.time).getTime() / 1000)) as any,
          value: Number(c.volume || 0),
          color: Number(c.close) >= Number(c.open) ? 'rgba(0, 200, 83, 0.3)' : 'rgba(255, 23, 68, 0.3)',
        }))
      );

      // --- TECHNICAL INDICATORS OVERLAY ---
      if (indicators?.ema20) {
        const ema20Data = calculateEMA(mappedCandles, 20);
        if (ema20Data.length > 0) {
          const ema20Series = chart.addSeries(LineSeries, {
            color: '#38bdf8',
            lineWidth: 2,
            title: 'EMA 20',
          });
          ema20Series.setData(ema20Data);
        }
      }

      if (indicators?.ema50) {
        const ema50Data = calculateEMA(mappedCandles, 50);
        if (ema50Data.length > 0) {
          const ema50Series = chart.addSeries(LineSeries, {
            color: '#fb923c',
            lineWidth: 2,
            title: 'EMA 50',
          });
          ema50Series.setData(ema50Data);
        }
      }

      if (indicators?.ema200) {
        const ema200Data = calculateEMA(mappedCandles, 200);
        if (ema200Data.length > 0) {
          const ema200Series = chart.addSeries(LineSeries, {
            color: '#f43f5e',
            lineWidth: 2,
            title: 'EMA 200',
          });
          ema200Series.setData(ema200Data);
        }
      }

      // --- VISUAL RISK MANAGEMENT TARGET LINES ---
      if (positionLines?.entryPrice && positionLines.entryPrice > 0) {
        candleSeries.createPriceLine({
          price: positionLines.entryPrice,
          color: '#38bdf8',
          lineWidth: 2,
          lineStyle: LineStyle ? LineStyle.Solid : 0,
          axisLabelVisible: true,
          title: `ENTRY: Rp ${positionLines.entryPrice.toLocaleString('id-ID')}`,
        });
      }

      if (positionLines?.takeProfit && positionLines.takeProfit > 0) {
        candleSeries.createPriceLine({
          price: positionLines.takeProfit,
          color: '#00c853',
          lineWidth: 2,
          lineStyle: LineStyle ? LineStyle.Dashed : 2,
          axisLabelVisible: true,
          title: `TP TARGET: Rp ${positionLines.takeProfit.toLocaleString('id-ID')}`,
        });
      }

      if (positionLines?.stopLoss && positionLines.stopLoss > 0) {
        candleSeries.createPriceLine({
          price: positionLines.stopLoss,
          color: '#ff1744',
          lineWidth: 2,
          lineStyle: LineStyle ? LineStyle.Dashed : 2,
          axisLabelVisible: true,
          title: `STOP LOSS: Rp ${positionLines.stopLoss.toLocaleString('id-ID')}`,
        });
      }

      // --- AUTONOMOUS AI ANNOTATION OVERLAYS (S/R, ORDER BLOCKS, RISK/REWARD) ---
      if (aiOverlays && aiOverlays.length > 0) {
        aiOverlays.forEach((ov) => {
          candleSeries.createPriceLine({
            price: ov.price,
            color: ov.color,
            lineWidth: 2,
            lineStyle:
              ov.lineStyle === 'DASHED'
                ? (LineStyle ? LineStyle.Dashed : 2)
                : ov.lineStyle === 'DOTTED'
                ? (LineStyle ? LineStyle.Dotted : 1)
                : (LineStyle ? LineStyle.Solid : 0),
            axisLabelVisible: true,
            title: ov.title,
          });
          if (ov.secondaryPrice && ov.secondaryPrice > 0) {
            candleSeries.createPriceLine({
              price: ov.secondaryPrice,
              color: ov.color,
              lineWidth: 1,
              lineStyle: LineStyle ? LineStyle.Dotted : 1,
              axisLabelVisible: false,
              title: '',
            });
          }
        });
      }

      // --- PINE SCRIPT STRATEGY MARKERS (BUY / SELL VISUAL SIGNALS) ---
      if (appliedScript && mappedCandles.length > 10) {
        try {
          const markers: any[] = [];
          const len = mappedCandles.length;
          if (len >= 6) {
            markers.push({
              time: mappedCandles[len - 5].time,
              position: 'belowBar',
              color: '#00e676',
              shape: 'arrowUp',
              text: `BUY (Pine v5)`,
            });
          }
          if (len >= 2) {
            markers.push({
              time: mappedCandles[len - 1].time,
              position: 'aboveBar',
              color: '#38bdf8',
              shape: 'circle',
              text: `SIGNAL: ${appliedScript.title.slice(0, 16)}`,
            });
          }

          if (typeof createSeriesMarkers === 'function') {
            createSeriesMarkers(candleSeries, markers);
          } else if (typeof (candleSeries as any).setMarkers === 'function') {
            (candleSeries as any).setMarkers(markers);
          }
        } catch (err) {
          console.debug('Pine Script marker notice:', err);
        }
      }

      chart.timeScale().fitContent();
      chartInstanceRef.current = chart;

      const handleResize = () => {
        if (containerRef.current && chartInstanceRef.current) {
          chartInstanceRef.current.applyOptions({ width: containerRef.current.clientWidth });
        }
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartInstanceRef.current) {
          chartInstanceRef.current.remove();
          chartInstanceRef.current = null;
        }
      };
    });

    return () => {
      isSubscribed = false;
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [candles, indicators, positionLines, aiOverlays, appliedScript]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[420px] gap-2">
        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Memuat grafik candlestick...</span>
      </div>
    );
  }

  if (candles.length === 0) {
    return (
      <div className="flex items-center justify-center h-[420px] text-xs" style={{ color: 'var(--text-muted)' }}>
        Data grafik belum tersedia untuk rentang waktu ini.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="w-full" />
      {indicators?.rsi && rsiValue !== null && (
        <div
          className="flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-mono"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-400">RSI (14):</span>
            <span className="font-bold font-mono text-white text-sm">{rsiValue.toFixed(1)}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                rsiValue >= 70
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : rsiValue <= 30
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}
            >
              {rsiValue >= 70 ? 'OVERBOUGHT (>70)' : rsiValue <= 30 ? 'OVERSOLD (<30)' : 'NEUTRAL ZONE'}
            </span>
          </div>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Level 70 Jenuh Beli &bull; Level 30 Jenuh Jual
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Simulated Orderbook ─── */
function OrderbookPanel({ quote, onSelectPrice }: { quote: StockQuote; onSelectPrice?: (price: number) => void }) {
  const basePrice = quote.price || 1000;

  const bidLevels = useMemo(() => {
    const tickSize = basePrice > 5000 ? 25 : basePrice > 2000 ? 10 : basePrice > 500 ? 5 : basePrice > 200 ? 2 : 1;
    return Array.from({ length: 10 }, (_, i) => {
      const price = basePrice - (i + 1) * tickSize;
      const lots = Math.floor(Math.sin(i + 1) * 2000) + 2500;
      return { price: Math.max(price, tickSize), lots };
    });
  }, [basePrice]);

  const askLevels = useMemo(() => {
    const tickSize = basePrice > 5000 ? 25 : basePrice > 2000 ? 10 : basePrice > 500 ? 5 : basePrice > 200 ? 2 : 1;
    return Array.from({ length: 10 }, (_, i) => {
      const price = basePrice + (i + 1) * tickSize;
      const lots = Math.floor(Math.cos(i + 1) * 2000) + 2500;
      return { price, lots };
    });
  }, [basePrice]);

  const maxLots = Math.max(...bidLevels.map((b) => b.lots), ...askLevels.map((a) => a.lots));

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Orderbook Level 2
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded font-mono" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
          Klik baris harga untuk isi form trading
        </span>
      </div>

      <div className="grid grid-cols-2">
        {/* Bid side */}
        <div className="border-r" style={{ borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-2 px-3 py-1.5 text-[11px] font-mono border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
            <span>Bid</span>
            <span className="text-right">Lot</span>
          </div>
          {bidLevels.map((level, i) => (
            <div
              key={`bid-${i}`}
              onClick={() => onSelectPrice?.(level.price)}
              title={`Pilih harga Rp ${level.price.toLocaleString('id-ID')}`}
              className="relative grid grid-cols-2 px-3 py-1 font-mono-num text-xs cursor-pointer hover:bg-emerald-500/10 transition-colors"
            >
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${(level.lots / maxLots) * 100}%`,
                  backgroundColor: 'var(--positive-bg)',
                  zIndex: 0,
                }}
              />
              <span className="relative z-10 font-semibold" style={{ color: 'var(--positive)' }}>
                {formatPrice(level.price, quote.currency)}
              </span>
              <span className="relative z-10 text-right" style={{ color: 'var(--text-secondary)' }}>
                {level.lots.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Ask side */}
        <div>
          <div className="grid grid-cols-2 px-3 py-1.5 text-[11px] font-mono border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
            <span>Offer/Ask</span>
            <span className="text-right">Lot</span>
          </div>
          {askLevels.map((level, i) => (
            <div
              key={`ask-${i}`}
              onClick={() => onSelectPrice?.(level.price)}
              title={`Pilih harga Rp ${level.price.toLocaleString('id-ID')}`}
              className="relative grid grid-cols-2 px-3 py-1 font-mono-num text-xs cursor-pointer hover:bg-red-500/10 transition-colors"
            >
              <div
                className="absolute inset-y-0 right-0"
                style={{
                  width: `${(level.lots / maxLots) * 100}%`,
                  backgroundColor: 'var(--negative-bg)',
                  zIndex: 0,
                }}
              />
              <span className="relative z-10 font-semibold" style={{ color: 'var(--negative)' }}>
                {formatPrice(level.price, quote.currency)}
              </span>
              <span className="relative z-10 text-right" style={{ color: 'var(--text-secondary)' }}>
                {level.lots.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Running Trade Panel ─── */
function RunningTradePanel({ quote }: { quote: StockQuote }) {
  const trades = useMemo(() => {
    const basePrice = quote.price || 1000;
    const tickSize = basePrice > 5000 ? 25 : basePrice > 2000 ? 10 : basePrice > 500 ? 5 : 2;

    return Array.from({ length: 15 }, (_, i) => {
      const offset = ((i % 5) - 2) * tickSize;
      const price = basePrice + offset;
      const lots = (i * 37 + 12) % 400 + 10;
      const isBuy = i % 2 === 0;
      const m = (50 - i * 3) % 60;
      const s = (45 + i * 7) % 60;
      return {
        time: `15:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`,
        price: Math.max(price, tickSize),
        lots,
        isBuy,
      };
    });
  }, [quote.price]);

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Running Trade
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded font-mono" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
          Live Tape
        </span>
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th className="text-right">Harga</th>
              <th className="text-right">Lot</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => (
              <tr key={i}>
                <td className="font-mono-num text-xs" style={{ color: 'var(--text-muted)' }}>
                  {t.time}
                </td>
                <td
                  className="text-right font-mono-num text-xs font-semibold"
                  style={{ color: t.isBuy ? 'var(--positive)' : 'var(--negative)' }}
                >
                  {formatPrice(t.price, quote.currency)}
                </td>
                <td className="text-right font-mono-num text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {t.lots}
                </td>
                <td className="text-center">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono"
                    style={{
                      backgroundColor: t.isBuy ? 'var(--positive-bg)' : 'var(--negative-bg)',
                      color: t.isBuy ? 'var(--positive)' : 'var(--negative)',
                    }}
                  >
                    {t.isBuy ? 'BUY' : 'SELL'}
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

/* ─── Key Stats Panel ─── */
function KeyStatsPanel({ quote }: { quote: StockQuote }) {
  const stats = [
    { label: 'Market Cap', value: formatMarketCap(quote.marketCap) },
    { label: 'P/E Ratio', value: quote.peRatio ? `${quote.peRatio.toFixed(2)}x` : '—' },
    { label: 'Volume Hari Ini', value: quote.volume ? quote.volume.toLocaleString() : '—' },
    { label: '52-Week High', value: formatPrice(quote.fiftyTwoWeekHigh, quote.currency) },
    { label: '52-Week Low', value: formatPrice(quote.fiftyTwoWeekLow, quote.currency) },
    { label: 'Harga Pembukaan', value: formatPrice(quote.open, quote.currency) },
    { label: 'Tertinggi Hari Ini', value: formatPrice(quote.high, quote.currency) },
    { label: 'Terendah Hari Ini', value: formatPrice(quote.low, quote.currency) },
  ];

  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Statistik Utama & Fundamental
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            <div className="text-sm font-mono-num font-semibold" style={{ color: 'var(--text-primary)' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Bandar Detector / Broker Summary (Simulated) ─── */
function BrokerSummaryPanel({ quote }: { quote: StockQuote }) {
  const isCrypto = quote.market === 'CRYPTO' || quote.currency === 'USDT';
  const isUS = !isCrypto && quote.currency === 'USD';
  const tickStep = isCrypto ? quote.price * 0.004 : isUS ? quote.price * 0.002 : 25;
  const unitLabel = isCrypto ? 'koin' : isUS ? 'shares' : 'lot';

  const topBuyers = [
    { code: isCrypto ? 'Binance Whales' : 'YP', netLot: 48200, avg: Math.max(tickStep, quote.price - tickStep) },
    { code: isCrypto ? 'Coinbase Inst' : 'PD', netLot: 32150, avg: Math.max(tickStep, quote.price - tickStep * 0.4) },
    { code: isCrypto ? 'Wintermute MM' : 'CC', netLot: 28900, avg: quote.price },
    { code: isCrypto ? 'Jump Trading' : 'KZ', netLot: 19400, avg: quote.price + tickStep * 0.6 },
  ];

  const topSellers = [
    { code: isCrypto ? 'Bybit Outflow' : 'AK', netLot: 54100, avg: quote.price + tickStep * 0.8 },
    { code: isCrypto ? 'Kraken Desk' : 'BK', netLot: 36700, avg: quote.price + tickStep * 1.4 },
    { code: isCrypto ? 'OKX Flow' : 'ZP', netLot: 21300, avg: Math.max(tickStep, quote.price - tickStep * 0.2) },
    { code: isCrypto ? 'Retail Panic' : 'GR', netLot: 15800, avg: Math.max(tickStep, quote.price - tickStep * 0.6) },
  ];

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isCrypto ? 'On-Chain Flow / Whale Detector' : 'Broker Summary (Bandar Detector)'}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded font-semibold font-mono" style={{ backgroundColor: 'var(--positive-bg)', color: 'var(--positive)' }}>
          {isCrypto ? 'Net Inflow: +$14.8M (Akumulasi)' : 'Net Foreign: +Rp 14.8 B (Akumulasi)'}
        </span>
      </div>
      <div className="grid grid-cols-2">
        <div className="border-r p-3" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--positive)' }}>Top Buyer</div>
          {topBuyers.map((b) => (
            <div key={b.code} className="flex justify-between items-center text-xs py-1 font-mono-num">
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{b.code}</span>
              <span style={{ color: 'var(--text-secondary)' }}>+{b.netLot.toLocaleString()} {unitLabel}</span>
              <span style={{ color: 'var(--text-muted)' }}>@{formatPrice(b.avg, quote.currency)}</span>
            </div>
          ))}
        </div>
        <div className="p-3">
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--negative)' }}>Top Seller</div>
          {topSellers.map((s) => (
            <div key={s.code} className="flex justify-between items-center text-xs py-1 font-mono-num">
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{s.code}</span>
              <span style={{ color: 'var(--text-secondary)' }}>-{s.netLot.toLocaleString()} {unitLabel}</span>
              <span style={{ color: 'var(--text-muted)' }}>@{formatPrice(s.avg, quote.currency)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Stock Detail Page ─── */
const TIMEFRAMES = ['1D', '1W', '1M', '1Y', 'ALL'];
const TABS = [
  { key: 'chart', label: 'Chart & Trading', icon: BarChart3 },
  { key: 'bandar', label: 'Bandarmologi & Flow', icon: TrendingUp },
  { key: 'valuation', label: 'Fundamental & Valuasi', icon: DollarSign },
  { key: 'openbb', label: 'OpenBB 10Y Statements & Options', icon: BookOpen },
  { key: 'intel', label: 'Intelijen Emiten', icon: Award },
  { key: 'news', label: 'Berita & AI Copilot', icon: Newspaper },
];

export default function StockDetailPage() {
  const params = useParams();
  const rawSymbol = (params?.symbol as string) || 'BBCA';
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1M');
  const [activeTab, setActiveTab] = useState('chart');
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [isTearSheetOpen, setIsTearSheetOpen] = useState(false);
  const [aiOverlays, setAiOverlays] = useState<ChartAnnotationOverlay[]>([]);
  const [isPineStudioOpen, setIsPineStudioOpen] = useState(false);
  const [appliedPineScript, setAppliedPineScript] = useState<PineScriptResult | null>(null);

  // Sync activeTab from URL search query (e.g., from Bloomberg CLI 'BBCA FA')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const qTab = new URLSearchParams(window.location.search).get('tab');
      if (qTab) {
        const lower = qTab.toLowerCase();
        if (['chart', 'orderbook', 'depth'].includes(lower)) {
          setActiveTab('chart');
        } else if (['bandar', 'flow', 'broker'].includes(lower)) {
          setActiveTab('bandar');
        } else if (['valuation', 'fa', 'dupont', 'financials', 'dcf'].includes(lower)) {
          setActiveTab('valuation');
        } else if (['openbb', 'obb', 'statements', '10y', 'options', 'deriv'].includes(lower)) {
          setActiveTab('openbb');
        } else if (['intel', 'anr', 'consensus', 'splc', 'supply', 'own', 'insider', 'omon', 'warrant', 'seasonality'].includes(lower)) {
          setActiveTab('intel');
        } else if (['news', 'copilot', 'ai', 'business'].includes(lower)) {
          setActiveTab('news');
        }
      }
    }
  }, []);
  const [showTradingPanel, setShowTradingPanel] = useState(true);
  const [indicators, setIndicators] = useState({
    ema20: true,
    ema50: false,
    ema200: false,
    rsi: false,
  });

  const { watchlists, addToWatchlist } = useWatchlistStore();
  const { holdings, checkPriceTriggers } = usePortfolioStore();
  const activeWatchlist = watchlists[0];

  const cleanSymbol = rawSymbol.replace('.JK', '').toUpperCase();
  const currentHolding = useMemo(() => {
    return holdings.find(
      (h) =>
        h.displaySymbol.toUpperCase() === cleanSymbol ||
        h.symbol.toUpperCase() === rawSymbol.toUpperCase() ||
        h.symbol.toUpperCase() === (quote?.symbol || '').toUpperCase()
    );
  }, [holdings, cleanSymbol, rawSymbol, quote?.symbol]);

  const positionLines = useMemo(() => {
    if (!currentHolding || currentHolding.lots <= 0) return undefined;
    return {
      entryPrice: currentHolding.avgPrice,
      takeProfit: currentHolding.takeProfitPrice,
      stopLoss: currentHolding.stopLossPrice,
    };
  }, [currentHolding]);

  const isInWatchlist = activeWatchlist?.items.some(
    (i) => i.displaySymbol.toUpperCase() === rawSymbol.toUpperCase() || i.symbol.toUpperCase() === rawSymbol.toUpperCase()
  );

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const getStockFallback = (sym: string): StockQuote => {
      const cleanSym = sym.replace('.JK', '').replace('^', '').toUpperCase();
      const cryptoKey = cleanSym.replace(/USDT$/, '').replace(/-USD$/, '');
      const asset = getAssetBySymbol(cleanSym) || getAssetBySymbol(cryptoKey);
      const bench = getVerifiedBenchmarkPrice(cleanSym);

      const found = ALL_ID_HEATMAP_UNIVERSE.find(
        (s) => s.displaySymbol === cleanSym || s.symbol === sym || s.symbol === `${cleanSym}.JK`
      );
      if (found) {
        const chgPt = Math.round(found.price * (found.change1D / 100));
        const prevClose = found.price - chgPt;
        return {
          symbol: found.symbol,
          displaySymbol: found.displaySymbol,
          name: found.name,
          market: 'IDX',
          country: 'ID',
          currency: 'IDR',
          sector: found.sector,
          price: found.price,
          open: prevClose,
          high: Math.round(found.price * 1.015),
          low: Math.round(found.price * 0.985),
          changePoint: chgPt,
          changePercentage: found.change1D,
          volume: found.volume,
          marketCap: found.marketCap,
          peRatio: found.peRatio,
          fiftyTwoWeekHigh: Math.round(found.price * 1.25),
          fiftyTwoWeekLow: Math.round(found.price * 0.75),
          sparkline: [prevClose, prevClose + Math.round(chgPt * 0.3), prevClose + Math.round(chgPt * 0.7), found.price],
          marketStatus: 'OPEN',
          timestamp: new Date().toISOString(),
        };
      }

      const isCrypto = asset?.category === 'CRYPTO' || ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT'].includes(cryptoKey);
      const isUSD = isCrypto || asset?.currency === 'USD' || bench.currency === 'USD';
      const fallbackPrice = asset?.defaultPrice || bench.price || (isUSD ? 50 : 1000);
      const changePct = isCrypto ? 1.85 : 0.45;
      const chgPt = fallbackPrice * (changePct / 100);
      const prevClose = fallbackPrice - chgPt;

      const formatP = (v: number) => {
        if (fallbackPrice < 0.001) return Number(v.toFixed(8));
        if (fallbackPrice < 1) return Number(v.toFixed(4));
        if (isUSD) return Math.round(v * 100) / 100;
        return Math.round(v);
      };

      return {
        symbol: isCrypto ? `${cryptoKey}USDT` : isUSD ? cleanSym : `${cleanSym}.JK`,
        displaySymbol: cryptoKey,
        name: asset?.name || bench.name || (isCrypto ? `${cryptoKey} (Spot)` : `${cleanSym} Tbk`),
        market: isCrypto ? 'CRYPTO' : isUSD ? 'US' : 'IDX',
        country: isCrypto ? 'CRYPTO' : isUSD ? 'US' : 'ID',
        currency: isCrypto ? 'USDT' : isUSD ? 'USD' : 'IDR',
        sector: asset?.sector || (isCrypto ? 'Cryptocurrency' : 'Equities'),
        price: formatP(fallbackPrice),
        open: formatP(prevClose),
        high: formatP(fallbackPrice * 1.02),
        low: formatP(fallbackPrice * 0.98),
        changePoint: formatP(chgPt),
        changePercentage: changePct,
        volume: isUSD ? 25000000 : 1000000,
        marketCap: isUSD ? fallbackPrice * 19000000 : fallbackPrice * 1000000000,
        peRatio: isCrypto ? null : 12.0,
        fiftyTwoWeekHigh: formatP(fallbackPrice * 1.35),
        fiftyTwoWeekLow: formatP(fallbackPrice * 0.65),
        sparkline: [formatP(prevClose), formatP(prevClose + chgPt * 0.3), formatP(prevClose + chgPt * 0.7), formatP(fallbackPrice)],
        marketStatus: 'OPEN',
        timestamp: new Date().toISOString(),
      };
    };

    fetchQuote(rawSymbol)
      .then((data) => {
        if (isMounted) {
          if (data && data.price) {
            setQuote(data);
          } else {
            setQuote(getStockFallback(rawSymbol));
          }
        }
      })
      .catch(() => {
        if (isMounted) setQuote(getStockFallback(rawSymbol));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [rawSymbol]);

  const handleToggleWatchlist = () => {
    if (!quote || !activeWatchlist) return;
    addToWatchlist(activeWatchlist.id, {
      symbol: quote.symbol,
      displaySymbol: quote.displaySymbol,
      name: quote.name,
    });
  };

  if (loading || !quote) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Mengambil data saham {rawSymbol}...</span>
      </div>
    );
  }

  const isPositive = quote.changePercentage >= 0;
  const marketStatusObj = typeof quote.marketStatus === 'object' ? quote.marketStatus : null;

  return (
    <div className="space-y-4">
      {/* Stock Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-start gap-3.5">
          <CompanyLogo symbol={quote.displaySymbol} name={quote.name} size={48} rounded="lg" />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold font-mono" style={{ color: 'var(--accent)' }}>
                {quote.displaySymbol}
              </h1>
              <span
                className="text-xs px-2 py-0.5 rounded font-mono"
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
              >
                {quote.market} &middot; {quote.country}
              </span>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span
                className="w-2 h-2 rounded-full pulse-live"
                style={{
                  backgroundColor: marketStatusObj?.isOpen ? 'var(--positive)' : 'var(--negative)',
                }}
              />
              {marketStatusObj?.session || 'Market Open'}
            </div>
            <button
              onClick={handleToggleWatchlist}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: isInWatchlist ? 'var(--positive-bg)' : 'var(--bg-card)',
                color: isInWatchlist ? 'var(--positive)' : 'var(--text-secondary)',
              }}
            >
              {isInWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {isInWatchlist ? 'Dalam Watchlist' : '+ Watchlist'}
            </button>

            {/* Direct Holding Badge in Header */}
            <div
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border font-mono font-medium"
              style={{
                borderColor: currentHolding && currentHolding.lots > 0 ? 'var(--accent)' : 'var(--border)',
                backgroundColor: currentHolding && currentHolding.lots > 0 ? 'rgba(255, 215, 0, 0.1)' : 'var(--bg-card)',
                color: currentHolding && currentHolding.lots > 0 ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>
                {currentHolding && currentHolding.lots > 0
                  ? `Dimiliki: ${currentHolding.lots} Lot (${currentHolding.shares.toLocaleString('id-ID')} lbr)`
                  : 'Dimiliki: 0 Lot'}
              </span>
            </div>

            {/* 1-Page Tear Sheet PDF Export Button */}
            <button
              type="button"
              onClick={() => setIsTearSheetOpen(true)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-all cursor-pointer font-bold bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
              title="Buka 1-Page Institutional Equity Research Tear Sheet & Export PDF"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>📄 Tear Sheet (PDF)</span>
            </button>
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {quote.name} &bull; <span style={{ color: 'var(--text-muted)' }}>{quote.sector}</span>
          </div>
        </div>
      </div>

        <div className="text-right">
          <div className="text-3xl font-bold font-mono-num" style={{ color: 'var(--text-primary)' }}>
            {quote.currency === 'IDR' ? 'Rp ' : '$'}
            {formatPrice(quote.price, quote.currency)}
          </div>
          <div className="flex items-center justify-end gap-2 mt-1">
            <span
              className="flex items-center gap-0.5 text-sm font-mono-num font-semibold"
              style={{ color: isPositive ? 'var(--positive)' : 'var(--negative)' }}
            >
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {isPositive ? '+' : ''}{quote.changePoint.toFixed(2)}
            </span>
            <span
              className="text-xs font-mono-num font-semibold px-2 py-0.5 rounded"
              style={{
                backgroundColor: isPositive ? 'var(--positive-bg)' : 'var(--negative-bg)',
                color: isPositive ? 'var(--positive)' : 'var(--negative)',
              }}
            >
              {isPositive ? '+' : ''}{quote.changePercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            style={{
              color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'chart' && (
        <div className="space-y-4">
          {/* Chart Header & Trading Toolbar */}
          <div className="p-3 rounded-xl border space-y-2.5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Timeframes */}
              <div className="flex items-center gap-1">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className="px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer"
                    style={{
                      backgroundColor: timeframe === tf ? 'var(--accent)' : 'var(--bg-surface)',
                      color: timeframe === tf ? '#000' : 'var(--text-secondary)',
                      fontWeight: timeframe === tf ? '700' : '500',
                    }}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Display Langsung Berapa Jumlah Saham yang Kita Punya */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium shadow-sm"
                style={{
                  borderColor: currentHolding && currentHolding.lots > 0 ? 'var(--positive)' : 'var(--border)',
                  backgroundColor: currentHolding && currentHolding.lots > 0 ? 'var(--positive-bg)' : 'var(--bg-surface)',
                }}
              >
                <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Saham Dimiliki: </span>
                  <span className="font-bold text-white">
                    {currentHolding && currentHolding.lots > 0
                      ? `${currentHolding.lots} Lot (${currentHolding.shares.toLocaleString('id-ID')} lembar)`
                      : '0 Lot (0 lembar)'}
                  </span>
                  {currentHolding && currentHolding.lots > 0 && (
                    <span className="ml-2 font-semibold" style={{ color: currentHolding.unrealizedPL >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                      &bull; {currentHolding.unrealizedPL >= 0 ? '+' : ''}Rp {currentHolding.unrealizedPL.toLocaleString('id-ID')} ({currentHolding.unrealizedPLPercent}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Action Buttons & Toggle Panel */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTradingPanel(true);
                    setSelectedPrice(quote.price);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono text-white transition-all hover:brightness-110 active:scale-95 cursor-pointer shadow-sm"
                  style={{ backgroundColor: 'var(--positive)' }}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  + Beli Cepat
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowTradingPanel(true);
                    setSelectedPrice(quote.price);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono text-white transition-all hover:brightness-110 active:scale-95 cursor-pointer shadow-sm"
                  style={{ backgroundColor: 'var(--negative)' }}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  - Jual Cepat
                </button>

                <button
                  type="button"
                  onClick={() => setShowTradingPanel(!showTradingPanel)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: showTradingPanel ? 'var(--bg-surface)' : 'transparent',
                    borderColor: showTradingPanel ? 'var(--accent)' : 'var(--border)',
                    color: showTradingPanel ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  <Zap className="w-3.5 h-3.5" />
                  {showTradingPanel ? 'Sembunyikan Panel' : 'Panel Trading'}
                </button>
              </div>
            </div>

            {/* Indikator Teknikal Toolbar */}
            <div className="flex items-center justify-between border-t pt-2 text-xs font-mono" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  📊 Indikator Overlay:
                </span>
                <button
                  type="button"
                  onClick={() => setIndicators((prev) => ({ ...prev, ema20: !prev.ema20 }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    indicators.ema20
                      ? 'bg-sky-500/20 text-sky-400 border-sky-400'
                      : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  EMA 20
                </button>
                <button
                  type="button"
                  onClick={() => setIndicators((prev) => ({ ...prev, ema50: !prev.ema50 }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    indicators.ema50
                      ? 'bg-amber-500/20 text-amber-400 border-amber-400'
                      : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  EMA 50
                </button>
                <button
                  type="button"
                  onClick={() => setIndicators((prev) => ({ ...prev, ema200: !prev.ema200 }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    indicators.ema200
                      ? 'bg-rose-500/20 text-rose-400 border-rose-400'
                      : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  EMA 200
                </button>
                <button
                  type="button"
                  onClick={() => setIndicators((prev) => ({ ...prev, rsi: !prev.rsi }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    indicators.rsi
                      ? 'bg-purple-500/20 text-purple-400 border-purple-400'
                      : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  RSI (14)
                </button>
              </div>

              {/* Status Garis Target di Chart */}
              <div className="flex items-center gap-3 text-[11px] hidden sm:flex">
                {positionLines?.entryPrice && (
                  <span className="flex items-center gap-1 text-sky-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Entry: Rp {positionLines.entryPrice.toLocaleString('id-ID')}
                  </span>
                )}
                {positionLines?.takeProfit && (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Target className="w-3 h-3" />
                    TP: Rp {positionLines.takeProfit.toLocaleString('id-ID')}
                  </span>
                )}
                {positionLines?.stopLoss && (
                  <span className="flex items-center gap-1 text-red-400 font-bold">
                    <Shield className="w-3 h-3" />
                    SL: Rp {positionLines.stopLoss.toLocaleString('id-ID')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Chart + Trading Panel Split Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
            {/* Chart & Order Depth (Span 2 when panel is open, 3 when collapsed) */}
            <div className={`${showTradingPanel ? 'xl:col-span-2' : 'xl:col-span-3'} space-y-4`}>
              {/* AI Chart Pilot HUD Control Bar */}
              <AIChartPilotHUD
                symbol={rawSymbol}
                currentPrice={quote.price}
                onApplyOverlays={(ovs) => setAiOverlays(ovs)}
                onClearOverlays={() => {
                  setAiOverlays([]);
                  setAppliedPineScript(null);
                }}
                onOpenPineStudio={() => setIsPineStudioOpen(true)}
              />

              {/* Candlestick Chart View */}
              <div className="rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                {/* Visual Chart Header with Direct Position Overlay */}
                <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b text-xs font-mono" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{quote.displaySymbol}</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>&bull; {quote.name}</span>
                    {aiOverlays.length > 0 && (
                      <span className="text-[10px] bg-sky-500/15 text-sky-400 border border-sky-500/30 px-1.5 py-0.2 rounded font-bold">
                        ⚡ {aiOverlays.length} AI Overlays Aktif
                      </span>
                    )}
                    {appliedPineScript && (
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                        📜 {appliedPineScript.title.slice(0, 20)}...
                      </span>
                    )}
                  </div>

                  {/* Direct Holding Indicator on Chart */}
                  <div>
                    {currentHolding && currentHolding.lots > 0 ? (
                      <div className="flex items-center gap-2 px-2.5 py-0.5 rounded border text-[11px] font-mono" style={{ backgroundColor: 'var(--positive-bg)', borderColor: 'var(--positive)' }}>
                        <span className="font-bold text-emerald-400">
                          💼 Dimiliki: {currentHolding.lots} Lot ({currentHolding.shares.toLocaleString('id-ID')} lbr)
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>&bull; Avg Rp {currentHolding.avgPrice.toLocaleString('id-ID')}</span>
                        <span className="font-semibold" style={{ color: currentHolding.unrealizedPL >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                          &bull; P/L: {currentHolding.unrealizedPL >= 0 ? '+' : ''}Rp {currentHolding.unrealizedPL.toLocaleString('id-ID')} ({currentHolding.unrealizedPLPercent}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        💼 Kepemilikan: 0 Lot
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2">
                  <CandlestickChart
                    symbol={rawSymbol}
                    timeframe={timeframe}
                    basePrice={quote.price}
                    indicators={indicators}
                    positionLines={positionLines}
                    aiOverlays={aiOverlays}
                    appliedScript={appliedPineScript}
                  />
                </div>
              </div>

              {/* Multi-Timeframe Trend Consensus Radar */}
              <MultiTimeframeRadar symbol={rawSymbol} currentPrice={quote.price} />

              {/* Orderbook & Running Trade below chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <OrderbookPanel quote={quote} onSelectPrice={(p) => {
                  setSelectedPrice(p);
                  setShowTradingPanel(true);
                }} />
                <RunningTradePanel quote={quote} />
              </div>
            </div>

            {/* Chartbit Interactive Trading Dock (Span 1) */}
            {showTradingPanel && (
              <div className="xl:col-span-1 sticky top-4">
                <ChartbitTradingPanel
                  quote={quote}
                  selectedPrice={selectedPrice}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PILAR 2: BANDARMOLOGI & FLOW ── */}
      {activeTab === 'bandar' && (
        <div className="space-y-4">
          <BandarmologyFlowEngine quote={quote} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ForeignFlowMatrix quote={quote} />
            <InstitutionalBrokerSummary quote={quote} />
          </div>
          <WhaleAlertTape quote={quote} />
          <OrderbookPanel quote={quote} onSelectPrice={(p) => setSelectedPrice(p)} />
        </div>
      )}

      {/* ── PILAR 3: FUNDAMENTAL & VALUASI ── */}
      {activeTab === 'valuation' && (
        <div className="space-y-6">
          <BloombergFairValueCompass />
          <HistoricalValuationBand quote={quote} />
          <DuPontAnalysisDesk quote={quote} />
          <FinancialStatementsTable quote={quote} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FairValueCalculator quote={quote} />
            <PeerComparison quote={quote} />
          </div>
          <KeyStatsPanel quote={quote} />
        </div>
      )}

      {/* ── PILAR OPENBB DATA PLATFORM (10Y STATEMENTS & OPTIONS) ── */}
      {activeTab === 'openbb' && (
        <OpenBBWorkspaceDesk symbol={cleanSymbol} />
      )}

      {/* ── PILAR 4: INTELIJEN EMITEN ── */}
      {activeTab === 'intel' && (
        <div className="space-y-4">
          <AnalystConsensusDesk
            symbol={quote.symbol}
            currentPrice={quote.price}
            currency={quote.currency}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InsiderOwnershipDesk symbol={quote.symbol} />
            <SupplyChainNetworkDesk symbol={quote.symbol} />
          </div>
          <OptionsWarrantsDesk symbol={quote.symbol} />
          <SeasonalityHeatmap quote={quote} />
        </div>
      )}

      {/* ── PILAR 5: BERITA & AI COPILOT ── */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <NewsAndBusinessPanel
            symbol={rawSymbol}
            name={quote.name}
            sector={quote.sector}
          />
          <AIResearchCopilot quote={quote} />
        </div>
      )}

      {/* 1-Page Institutional Equity Research Tear Sheet Modal */}
      <ResearchTearSheetModal
        quote={quote}
        isOpen={isTearSheetOpen}
        onClose={() => setIsTearSheetOpen(false)}
      />

      {/* Pine Script v5 Studio & TradingView Desktop Connector Modal */}
      <PineScriptStudioModal
        symbol={rawSymbol}
        isOpen={isPineStudioOpen}
        onClose={() => setIsPineStudioOpen(false)}
        onApplyToChart={(script) => {
          setAppliedPineScript(script);
        }}
      />
    </div>
  );
}
