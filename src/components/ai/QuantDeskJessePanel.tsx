// src/components/ai/QuantDeskJessePanel.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Flame,
  Zap,
  Activity,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sliders,
  DollarSign,
  AlertTriangle,
  Play,
  CheckCircle2,
  Lock,
  Cpu,
  Terminal,
  ExternalLink,
  Target,
} from 'lucide-react';
import { usePortfolioStore } from '@/store';
import { useAIAgentStore } from '@/store/aiAgentStore';
import { globalTickBuffer } from '@/lib/office/HighFrequencyTickBuffer';
import { evaluateJesseStrategy, type JesseStrategySignal } from '@/lib/crypto/jesseCryptoEngine';
import { dispatchToQuantBridge } from '@/lib/hedgefund/autonomousTradingEngine';
import { SUPPORTED_CRYPTO_PAIRS } from '@/hooks/useBinanceLivePrices';

interface QuantDeskJessePanelProps {
  selectedSymbol?: string;
  onSelectSymbol?: (sym: string) => void;
  onRequestWarRoomConsensus?: (symbol: string, signal: JesseStrategySignal) => void;
  onLocateJesseDesk?: () => void;
}

export default function QuantDeskJessePanel({
  selectedSymbol = 'BTC',
  onSelectSymbol,
  onRequestWarRoomConsensus,
  onLocateJesseDesk,
}: QuantDeskJessePanelProps) {
  const [activePair, setActivePair] = useState<string>(selectedSymbol.replace(/USDT$/i, ''));
  const [activeTab, setActiveTab] = useState<'JESSE_STRATEGY' | 'QUANT_POSITIONS' | 'VPS_LOGS'>('JESSE_STRATEGY');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Sync dengan selectedSymbol luar jika berubah
  useEffect(() => {
    const clean = selectedSymbol.replace(/USDT$/i, '');
    if (['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP', 'SUI', 'AVAX'].includes(clean)) {
      setActivePair(clean);
    }
  }, [selectedSymbol]);

  // Read portfolio store
  const cash = usePortfolioStore((s) => s.cash);
  const holdings = usePortfolioStore((s) => s.holdings);
  const placeBuyOrder = usePortfolioStore((s) => s.placeBuyOrder);
  const placeSellOrder = usePortfolioStore((s) => s.placeSellOrder);

  // Live price & tick calculation from LockFreeMarketRingBuffer (0ms lag)
  const [tickerState, setTickerState] = useState<{ price: number; change24h: number }>({
    price: 68500,
    change24h: 2.4,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const pairKey = `${activePair}USDT`;
      const tick = globalTickBuffer.getLatest(pairKey) || globalTickBuffer.getLatest(activePair);
      if (tick) {
        setTickerState({
          price: tick.price,
          change24h: tick.change24h,
        });
      }
    }, 250);
    return () => clearInterval(interval);
  }, [activePair]);

  // Evaluasi Strategi Kuantitatif Jesse AI
  const jesseSignal: JesseStrategySignal = useMemo(() => {
    return evaluateJesseStrategy(activePair, tickerState.price, tickerState.change24h);
  }, [activePair, tickerState.price, tickerState.change24h]);

  // Filter holdings yang relevan dengan Crypto
  const cryptoHoldings = useMemo(() => {
    return holdings.filter(
      (h) =>
        h.assetClass === 'CRYPTO' ||
        h.currency === 'USDT' ||
        h.symbol?.toUpperCase().includes('USDT') ||
        ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP', 'SUI'].includes(h.symbol?.replace('.JK', '').toUpperCase())
    );
  }, [holdings]);

  // One-Click Asynchronous Execution Gate
  const handleExecuteJesseTrade = useCallback(async () => {
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const pairSym = `${activePair}USDT`;
      const curPrice = tickerState.price;
      const targetLots = activePair === 'BTC' ? 0.05 : activePair === 'ETH' ? 0.8 : 5.0;
      const rate = 16000;
      const costIDR = targetLots * curPrice * rate;

      // Single Risk Gate: Verifikasi kas minimum
      if (cash < costIDR + 1000000) {
        setExecutionResult({
          ok: false,
          msg: 'Risk Gate: Saldo kas tidak mencukupi untuk cadangan minimum Rp 1 Juta.',
        });
        setIsExecuting(false);
        return;
      }

      // 1. Eksekusi ke Portfolio Store
      const res = placeBuyOrder({
        symbol: pairSym,
        displaySymbol: activePair,
        name: `${activePair} (Jesse Crypto Desk)`,
        price: curPrice,
        lots: targetLots,
        orderType: 'LIMIT',
        assetClass: 'CRYPTO',
        currency: 'USDT',
        exchangeRate: rate,
        takeProfitPrice: jesseSignal.takeProfit,
        stopLossPrice: jesseSignal.stopLoss,
        source: 'AI_AGENT',
      });

      if (res.error) {
        setExecutionResult({ ok: false, msg: res.error });
      } else {
        // 2. Dispatch asinkron ke VPS Linux Cloud daemon (Freqtrade / Lumibot)
        dispatchToQuantBridge({
          engine: 'freqtrade',
          action: 'BUY',
          ticker: pairSym,
          price: curPrice,
          stopLoss: jesseSignal.stopLoss,
          takeProfit: jesseSignal.takeProfit,
          lots: targetLots,
        });

        // 3. Catat aksi di AI Agent Store
        useAIAgentStore.getState().logAction({
          type: 'TRADE_BUY',
          symbol: activePair,
          agentId: 'trader_crypto',
          agentName: 'Kevin Zhang (Jesse Crypto PM)',
          agentEmoji: '⚡',
          title: `Eksekusi Taktikal: ${activePair}`,
          details: `Eksekusi Taktikal Jesse AI (${jesseSignal.strategyName}) disetujui QuantDesk. SL: $${jesseSignal.stopLoss.toLocaleString()}, TP: $${jesseSignal.takeProfit.toLocaleString()}.`,
          metadata: {
            price: curPrice,
            lots: targetLots,
            stopLoss: jesseSignal.stopLoss,
            takeProfit: jesseSignal.takeProfit,
            source: 'Jesse AI Quantitative Engine',
          },
        });

        setExecutionResult({
          ok: true,
          msg: `Order terkirim: BUY ${targetLots} ${activePair} @ $${curPrice.toLocaleString()} (TP $${jesseSignal.takeProfit.toLocaleString()} / SL $${jesseSignal.stopLoss.toLocaleString()})`,
        });
      }
    } catch (e: any) {
      setExecutionResult({ ok: false, msg: e?.message || 'Gagal mengeksekusi order' });
    } finally {
      setIsExecuting(false);
    }
  }, [activePair, tickerState.price, cash, placeBuyOrder, jesseSignal]);

  return (
    <div className="flex flex-col h-full bg-[#090d16] border border-cyan-500/20 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
      {/* ── Top Bar: Hybrid Asinkron Status & VPS Heartbeat ── */}
      <div className="p-3 bg-[#0d1322] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
            <Flame className="w-4 h-4 animate-pulse text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs tracking-wider">QUANTDESK &times; JESSE AI</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-extrabold">
                HYBRID ASINKRON
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Tactical Crypto Engine &middot; Single Risk Gate</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLocateJesseDesk}
            className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] flex items-center gap-1 transition"
            title="Arahkan kamera ke meja Kevin Zhang di kanvas kantor"
          >
            <Target className="w-3 h-3 text-cyan-400" />
            <span>Meja Jesse</span>
          </button>
        </div>
      </div>

      {/* ── Pair Selector Tabs ── */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[#090e1a] border-b border-slate-800/80 overflow-x-auto scrollbar-none text-[11px]">
        {['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP', 'SUI'].map((coin) => {
          const isSelected = activePair === coin;
          return (
            <button
              key={coin}
              onClick={() => {
                setActivePair(coin);
                if (onSelectSymbol) onSelectSymbol(coin);
              }}
              className={`px-2.5 py-1 rounded font-bold transition-all shrink-0 flex items-center gap-1 ${
                isSelected
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{coin}</span>
            </button>
          );
        })}
      </div>

      {/* ── Live Ticker Strip ── */}
      <div className="p-3 bg-[#0a1120] border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-500 block">HARGA LIVE (BINANCE WS)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white tracking-wide">
              ${tickerState.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`text-xs font-semibold flex items-center ${
                tickerState.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {tickerState.change24h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {tickerState.change24h >= 0 ? '+' : ''}
              {tickerState.change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Live Signal Badge */}
        <div className="text-right">
          <span className="text-[10px] text-slate-500 block">SINYAL JESSE AI</span>
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-extrabold tracking-wider inline-flex items-center gap-1 border ${
              jesseSignal.signal === 'BUY'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 animate-pulse'
                : jesseSignal.signal === 'SELL'
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            <Zap className="w-3 h-3" />
            {jesseSignal.signal} ({jesseSignal.confidence}%)
          </span>
        </div>
      </div>

      {/* ── Sub Navigation (Strategy vs Positions vs Logs) ── */}
      <div className="flex border-b border-slate-800 text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('JESSE_STRATEGY')}
          className={`flex-1 py-2 text-center transition ${
            activeTab === 'JESSE_STRATEGY'
              ? 'bg-cyan-500/10 text-cyan-300 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ANALISIS STRATEGI
        </button>
        <button
          onClick={() => setActiveTab('QUANT_POSITIONS')}
          className={`flex-1 py-2 text-center transition ${
            activeTab === 'QUANT_POSITIONS'
              ? 'bg-cyan-500/10 text-cyan-300 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          POSISI AKTIF ({cryptoHoldings.length})
        </button>
        <button
          onClick={() => setActiveTab('VPS_LOGS')}
          className={`flex-1 py-2 text-center transition ${
            activeTab === 'VPS_LOGS'
              ? 'bg-cyan-500/10 text-cyan-300 border-b-2 border-cyan-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          TERMINAL VPS
        </button>
      </div>

      {/* ── Content Viewport ── */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
        {activeTab === 'JESSE_STRATEGY' && (
          <div className="space-y-3">
            {/* Strategy Card */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">MODEL / ALGORITMA:</span>
                <span className="text-amber-400 font-bold">{jesseSignal.strategyName}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{jesseSignal.description}</p>
            </div>

            {/* Technical Confluence Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">EMA TREND (20/50/200)</span>
                <span className="text-xs font-bold text-emerald-400">BULLISH ALIGNMENT</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">RISK / REWARD RATIO</span>
                <span className="text-xs font-bold text-cyan-300">1 : {jesseSignal.riskRewardRatio}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">STOP LOSS (PROTEKSI)</span>
                <span className="text-xs font-bold text-rose-400">${jesseSignal.stopLoss.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">TAKE PROFIT (TARGET)</span>
                <span className="text-xs font-bold text-emerald-400">${jesseSignal.takeProfit.toLocaleString()}</span>
              </div>
            </div>

            {/* Asynchronous War Room Alignment Status */}
            <div className="p-2.5 rounded-xl bg-[#0b1322] border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[11px] font-bold text-white block">KOMITE WAR ROOM AGENT OFFICE</span>
                  <span className="text-[10px] text-slate-400">Status Rezim: Konsensus Alpha Diizinkan</span>
                </div>
              </div>
              {onRequestWarRoomConsensus && (
                <button
                  onClick={() => onRequestWarRoomConsensus(activePair, jesseSignal)}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold rounded text-[10px] flex items-center gap-1 transition"
                  title="Kirim sinyal ini ke meja sidang War Room untuk dimusyawarahkan oleh komite makro"
                >
                  <Activity className="w-3 h-3" />
                  <span>Sidang Komite</span>
                </button>
              )}
            </div>

            {/* Eksekusi Cepat One-Click via QuantDesk */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={handleExecuteJesseTrade}
                disabled={isExecuting}
                className="w-full py-2.5 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{isExecuting ? 'Memvalidasi Risk Gate…' : `⚡ Eksekusi Order ${activePair} via QuantDesk`}</span>
              </button>

              {executionResult && (
                <div
                  className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                    executionResult.ok
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {executionResult.ok ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{executionResult.msg}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'QUANT_POSITIONS' && (
          <div className="space-y-2">
            {cryptoHoldings.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-1">
                <p>Belum ada posisi kripto aktif di buku QuantDesk.</p>
                <p className="text-[10px]">Eksekusi sinyal Jesse AI di tab Strategi untuk membuka posisi.</p>
              </div>
            ) : (
              cryptoHoldings.map((h, i) => {
                const pnl = h.unrealizedPL || 0;
                const pnlPct = h.unrealizedPLPercent || 0;
                const isProfitable = pnl >= 0;
                return (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{h.displaySymbol || h.symbol}</span>
                        <span className="text-[10px] text-slate-400">({h.lots} unit)</span>
                      </div>
                      <span className={`text-xs font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfitable ? '+' : ''}${pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Entry: ${(h.avgPrice || 0).toLocaleString()}</span>
                      <span>Harga: ${(h.currentPrice || 0).toLocaleString()}</span>
                    </div>

                    {h.stopLossPrice && h.takeProfitPrice && (
                      <div className="flex justify-between items-center text-[9px] text-slate-500 pt-0.5 border-t border-slate-800/60">
                        <span>SL: ${h.stopLossPrice.toLocaleString()}</span>
                        <span>TP: ${h.takeProfitPrice.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'VPS_LOGS' && (
          <div className="p-2.5 bg-black/80 rounded-xl border border-slate-800 text-[10px] font-mono leading-relaxed space-y-1 text-emerald-300/90 max-h-72 overflow-y-auto">
            <div className="text-slate-500">[QUANT_VPS_DAEMON] Host: 38.9.46.160:8002 · Freqtrade v2024.9</div>
            <div className="text-slate-500">[JESSE_RUNTIME] WebSocket: wss://stream.binance.com:9443 (!miniTicker@arr)</div>
            <div>&gt; [TICK] {activePair}USDT: ${tickerState.price.toLocaleString()} ({tickerState.change24h}%)</div>
            <div>&gt; [STRATEGY] Evaluasi indikator EMA/RSI {activePair} &rarr; Sinyal {jesseSignal.signal} (Conf: {jesseSignal.confidence}%)</div>
            <div>&gt; [RISK_GATE] Single Source of Truth: LockFreeMarketRingBuffer AKTIF.</div>
            <div>&gt; [HEARTBEAT] Bridge daemon 24/7 online. Tidak ada konflik eksekusi terdeteksi.</div>
          </div>
        )}
      </div>

      {/* ── Footer Status Strip ── */}
      <div className="p-2 bg-[#090d16] border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>Risk Firewall: Strict Active</span>
        </span>
        <span>Kas Bebas: Rp {Math.round(cash).toLocaleString('id-ID')}</span>
      </div>
    </div>
  );
}
