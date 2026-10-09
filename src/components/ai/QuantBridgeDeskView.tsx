'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Activity,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Play,
  Terminal,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Flame,
  ArrowRight,
  Layers,
  Zap,
} from 'lucide-react';

interface QuantStatusData {
  success: boolean;
  source?: string;
  status?: {
    freqtrade?: {
      installed: boolean;
      mode: string;
      active_pairs: string[];
      open_trades: any[];
      uptime_seconds?: number;
    };
    lumibot?: {
      installed: boolean;
      broker: string;
      active_strategies: string[];
      open_positions: any[];
      equity_usd?: number;
    };
  };
}

export default function QuantBridgeDeskView() {
  const [quantStatus, setQuantStatus] = useState<QuantStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [backtestResult, setBacktestResult] = useState<any>(null);
  const [backtestTicker, setBacktestTicker] = useState('NVDA');
  const [dispatchTicker, setDispatchTicker] = useState('BTC');
  const [dispatchAction, setDispatchAction] = useState<'BUY' | 'SELL'>('BUY');
  const [dispatchMsg, setDispatchMsg] = useState<string | null>(null);
  const [recentLogs, setRecentLogs] = useState<string[]>([
    'Inisialisasi Quant Bridge Daemon v1.0...',
    'Menghubungkan ke http://localhost:8002...',
    'Engine Freqtrade (Crypto 24/7) terdeteksi...',
    'Engine Lumibot (Wall Street / US Stocks) terdeteksi...',
  ]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quant');
      if (res.ok) {
        const data = await res.json();
        setQuantStatus(data);
        if (data.source === 'LOCAL_QUANT_BRIDGE_ONLINE') {
          addLog('🟢 Quant Bridge lokal terhubung di http://localhost:8002');
        } else {
          addLog('☁️ Mode Standalone Cloud aktif (Bridge lokal offline)');
        }
      }
    } catch {
      addLog('⚠️ Gagal menghubungi endpoint /api/quant');
    } finally {
      setLoading(false);
    }
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('id-ID');
    setRecentLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRunBacktest = async () => {
    setBacktestLoading(true);
    setBacktestResult(null);
    addLog(`🚀 Menjalankan backtest Lumibot 90 hari untuk ${backtestTicker}...`);

    try {
      const res = await fetch('/api/quant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engine: 'lumibot',
          ticker: backtestTicker,
          days: 90,
          strategy: 'TradeMindMomentumStrategy',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBacktestResult(data);
        addLog(`✅ Backtest Lumibot selesai! Sharpe: ${data.metrics?.sharpe_ratio}, CAGR: +${data.metrics?.cagr_percent}%`);
      }
    } catch (err: any) {
      addLog(`❌ Gagal mengeksekusi backtest: ${err.message}`);
    } finally {
      setBacktestLoading(false);
    }
  };

  const handleDispatchSignal = async () => {
    setDispatchMsg(null);
    addLog(`📡 Mengirimkan sinyal AI ${dispatchAction} ${dispatchTicker} ke Freqtrade...`);

    try {
      const res = await fetch('/api/quant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engine: 'freqtrade',
          action: dispatchAction,
          ticker: `${dispatchTicker}/USDT`,
          price: dispatchTicker === 'BTC' ? 98500 : dispatchTicker === 'ETH' ? 2750 : 185,
          stopLoss: dispatchTicker === 'BTC' ? 95000 : 2600,
          targetPrice: dispatchTicker === 'BTC' ? 104000 : 2950,
          reason: 'Disetujui komite TradeMind-Alpha (SMC Demand Zone)',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDispatchMsg(`Sinyal ${dispatchAction} ${dispatchTicker} berhasil diterima oleh Freqtrade Engine!`);
        addLog(`⚡ Freqtrade menerima sinyal: ${data.message || 'Trade Created'}`);
        fetchStatus();
      }
    } catch (err: any) {
      setDispatchMsg('Gagal mengirim sinyal ke Freqtrade');
    }
  };

  const isLocalConnected = quantStatus?.source === 'LOCAL_QUANT_BRIDGE_ONLINE';

  return (
    <div className="space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Quant Engine Desk (Freqtrade & Lumibot)
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold">
                    v1.0 Live Bridge
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Integrasi Otak AI (TradeMind-Alpha) dengan Otot Eksekusi Algoritmik Freqtrade (Kripto) & Lumibot (Wall Street).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
              isLocalConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isLocalConnected ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'}`} />
              {isLocalConnected ? 'Local Bridge Online (Port 8002)' : 'Cloud Serverless Emulated'}
            </div>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs flex items-center gap-1 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── 2 KARTU STATUS ENGINE ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KARTU 1: FREQTRADE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
                ⚡
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Freqtrade Crypto Desk (24/7)</h3>
                <span className="text-[11px] text-slate-400">Binance / Bybit / CCXT Integration</span>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
              DRY-RUN READY
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-800">
              <span className="text-slate-400">Active Trading Pairs:</span>
              <span className="text-slate-200 font-mono font-semibold">BTC/USDT, ETH/USDT, SOL/USDT, BNB/USDT</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-800">
              <span className="text-slate-400">Open Simulated Trades:</span>
              <span className="text-emerald-400 font-bold font-mono">
                {quantStatus?.status?.freqtrade?.open_trades?.length || 1} Posisi Aktif
              </span>
            </div>
          </div>

          {/* Sinyal Dispatcher Manual */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Tes Kirim Sinyal AI ke Freqtrade:</h4>
            <div className="flex gap-2">
              <select
                value={dispatchTicker}
                onChange={(e) => setDispatchTicker(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
              >
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="SOL">SOL</option>
                <option value="BNB">BNB</option>
              </select>
              <select
                value={dispatchAction}
                onChange={(e) => setDispatchAction(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
              <button
                onClick={handleDispatchSignal}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg px-3 py-1.5 text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Zap className="w-3.5 h-3.5" />
                Trigger Freqtrade
              </button>
            </div>
            {dispatchMsg && (
              <p className="mt-2 text-[11px] text-emerald-400 font-medium">✓ {dispatchMsg}</p>
            )}
          </div>
        </div>

        {/* KARTU 2: LUMIBOT */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-sm">
                📈
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Lumibot Wall Street Desk</h3>
                <span className="text-[11px] text-slate-400">US Equities, Options & Alpaca Paper</span>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">
              ALPACAPAPER READY
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-800">
              <span className="text-slate-400">Active Strategies:</span>
              <span className="text-slate-200 font-mono font-semibold">TradeMindMomentum, DeltaNeutralHedging</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-800">
              <span className="text-slate-400">Equity Virtual:</span>
              <span className="text-slate-200 font-bold font-mono">$100,000.00 USD</span>
            </div>
          </div>

          {/* Backtest Runner */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Jalankan Backtest Kuantitatif Lumibot:</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={backtestTicker}
                onChange={(e) => setBacktestTicker(e.target.value.toUpperCase())}
                placeholder="NVDA"
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase w-24"
              />
              <button
                onClick={handleRunBacktest}
                disabled={backtestLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg px-3 py-1.5 text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                {backtestLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Run 90D Backtest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── HASIL BACKTEST MODAL / CARD JIKA SUDAH DIJALANKAN ── */}
      {backtestResult && (
        <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Hasil Backtest Lumibot: {backtestResult.ticker} ({backtestResult.period_days} Hari)
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
              {backtestResult.verdict}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
              <div className="text-slate-400 text-[11px]">CAGR (Tahunan)</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">+{backtestResult.metrics?.cagr_percent}%</div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
              <div className="text-slate-400 text-[11px]">Sharpe Ratio</div>
              <div className="text-lg font-bold text-blue-400 mt-1">{backtestResult.metrics?.sharpe_ratio}</div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
              <div className="text-slate-400 text-[11px]">Max Drawdown</div>
              <div className="text-lg font-bold text-rose-400 mt-1">{backtestResult.metrics?.max_drawdown_percent}%</div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
              <div className="text-slate-400 text-[11px]">Win Rate</div>
              <div className="text-lg font-bold text-amber-400 mt-1">{backtestResult.metrics?.win_rate_percent}%</div>
            </div>
          </div>
        </div>
      )}

      {/* ── LIVE TERMINAL BRIDGE LOGS ── */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-lg font-mono text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-slate-300">Quant Bridge Real-Time Log Feed</span>
          </div>
          <span className="text-[10px] text-slate-500">Listening on port 8002</span>
        </div>
        <div className="space-y-1 text-slate-300 max-h-36 overflow-y-auto">
          {recentLogs.map((log, idx) => (
            <div key={idx} className="leading-relaxed">
              <span className="text-indigo-400">{'>'}</span> {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
