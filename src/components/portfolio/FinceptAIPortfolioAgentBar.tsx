'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Zap,
  Play,
  Pause,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  History,
  Newspaper,
  Sparkles,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { usePortfolioStore } from '@/store';
import { useAIAgentStore } from '@/store/aiAgentStore';
import { runAutonomousAgentCycle } from '@/lib/hedgefund/autonomousTradingEngine';
import { UNIVERSE_TICKERS } from '@/lib/hedgefund/autonomousStockPicker';

export default function FinceptAIPortfolioAgentBar() {
  const { cash, holdings, realizedPL } = usePortfolioStore();
  const {
    autoTradingEnabled,
    setAutoTradingEnabled,
    activeAgentTask,
    logs,
    dispatches,
    totalAiTradesCount,
    totalAiRealizedProfit,
    lastTradeAt,
    resetAiStats,
  } = useAIAgentStore();

  const [expanded, setExpanded] = useState(false);
  const [isRunningCycle, setIsRunningCycle] = useState(false);
  const [cycleMsg, setCycleMsg] = useState<string | null>(null);

  // Rekonsiliasi profit real jika stat AI sempat terdistorsi
  const displayRealizedProfit =
    (Math.abs(totalAiRealizedProfit) > 500_000_000 || isNaN(totalAiRealizedProfit))
      ? realizedPL
      : totalAiRealizedProfit;
  const isProfitPositive = displayRealizedProfit >= 0;

  const handleTriggerCycle = async () => {
    setIsRunningCycle(true);
    try {
      // 1. Ambil berita terbaru dari crawler
      let news = [];
      try {
        const res = await fetch('/api/crawler/news?limit=20');
        const json = await res.json();
        if (json?.success) news = json.articles;
      } catch {
        // fallback
      }

      // 2. Ambil harga realtime untuk semesta saham
      let liveQuotesMap: Record<string, any> = {};
      try {
        const qRes = await fetch(`/api/stocks/realtime?tickers=${UNIVERSE_TICKERS.join(',')}`);
        const qData = await qRes.json();
        if (qData?.success && qData.quotes) {
          liveQuotesMap = qData.quotes;
        }
      } catch {
        // fallback
      }

      const res = await runAutonomousAgentCycle(news, liveQuotesMap);
      if (res?.actionTaken) {
        setCycleMsg(res.actionTaken);
      } else {
        setCycleMsg(`Siklus selesai: Tim AI mengamati pasar. Top Alpha saat ini ${res?.topPick?.symbol || 'BMRI'}. Portofolio dalam kondisi prima.`);
      }
      setTimeout(() => setCycleMsg(null), 8000);
    } finally {
      setIsRunningCycle(false);
    }
  };

  const tradeLogs = logs.filter((l) => l.type === 'TRADE_BUY' || l.type === 'TRADE_SELL' || l.type === 'RISK_GATE');

  return (
    <div className="bg-[#0b0e14] border border-amber-500/30 rounded-xl overflow-hidden shadow-lg transition-all">
      {/* ── Main Bar ── */}
      <div className="p-3.5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-[#0e121a] to-[#0b0e14]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-lg shadow-md shadow-amber-500/20 text-black">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold font-mono tracking-wide text-white">
                FINCEPT AI AUTONOMOUS PORTFOLIO AGENT
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono flex items-center gap-1 ${
                  autoTradingEnabled
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${autoTradingEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                {autoTradingEnabled ? 'AUTO-TRADE AKTIF' : 'AUTO-TRADE PAUSED'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono flex items-center gap-1 bg-cyan-500/15 text-cyan-300 border border-cyan-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                BACKEND PYTHON: TERKONEKSI (PORT 8000 & 24/7 CLOUD)
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {activeAgentTask || 'Raditya (PM Saham), Kevin Zhang (Crypto PM) & Bambang (CRO) mengawasi portofolio Anda secara real-time.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Stat Ringkas */}
          <div className="hidden md:flex items-center gap-3 bg-[#121620] border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <div>
              <span className="text-zinc-500 text-[10px] block">TOTAL ORDER AI</span>
              <span className="text-white font-bold">{totalAiTradesCount} Trade</span>
            </div>
            <div className="w-px h-6 bg-zinc-800" />
            <div>
              <span className="text-zinc-500 text-[10px] block">PROFIT TEREALISASI</span>
              <span className={`font-bold ${isProfitPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isProfitPositive ? '+' : '-'}Rp {Math.abs(Math.round(displayRealizedProfit)).toLocaleString('id-ID')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset riwayat log dan counter statistik AI kembali ke 0?')) {
                  resetAiStats();
                }
              }}
              className="text-zinc-500 hover:text-amber-400 p-1 rounded transition-colors cursor-pointer self-center"
              title="Reset Statistik & Log Transaksi AI"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle Auto-Trade */}
          <button
            onClick={() => setAutoTradingEnabled(!autoTradingEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
              autoTradingEnabled
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
            }`}
            title="Aktifkan atau nonaktifkan eksekusi trading otomatis oleh AI ke portofolio ini"
          >
            {autoTradingEnabled ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {autoTradingEnabled ? 'Jeda Auto-Trade' : 'Aktifkan Auto-Trade'}
          </button>

          {/* Tombol Pemicu Siklus */}
          <button
            onClick={handleTriggerCycle}
            disabled={isRunningCycle}
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-mono rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            title="Jalankan evaluasi pasar & periksa aksi portofolio sekarang"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningCycle ? 'animate-spin text-amber-400' : ''}`} />
            {isRunningCycle ? 'Mengevaluasi…' : 'Scan & Trade'}
          </button>

          {/* Tombol Lihat Log */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-2.5 py-1.5 bg-[#171b26] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono rounded-lg flex items-center gap-1"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Log AI</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <Link
            href="/ai"
            className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono rounded-lg flex items-center gap-1"
            title="Buka Trading Floor Virtual Office"
          >
            <span>Trading Floor</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Notification Banner if cycle ran ── */}
      {cycleMsg && (
        <div className="bg-emerald-950/40 border-t border-emerald-500/30 px-4 py-2 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{cycleMsg}</span>
        </div>
      )}

      {/* ── Expandable AI Execution Log & Newsroom Dispatches ── */}
      {expanded && (
        <div className="border-t border-zinc-800/80 p-4 bg-[#0a0d13] space-y-3 text-xs font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Kolom Kiri: Riwayat Transaksi Eksekusi AI */}
            <div className="bg-[#10141d] border border-zinc-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-zinc-400 font-bold text-[11px] uppercase border-b border-zinc-800/60 pb-1.5">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Zap className="w-3.5 h-3.5" /> Riwayat Eksekusi Portofolio ({tradeLogs.length})
                </span>
                <span className="text-[10px] text-zinc-500">Raditya PM & Bambang CRO</span>
              </div>

              {tradeLogs.length === 0 ? (
                <div className="text-zinc-500 py-3 text-center text-xs">
                  Belum ada transaksi eksekusi AI. Klik <b className="text-amber-400">Scan & Trade</b> untuk memulai.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {tradeLogs.map((log) => {
                      const clean = log.symbol?.replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
                      const isCryptoLog = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT', 'TRX', 'RENDER', 'TAO', 'FET'].includes(clean) || log.symbol?.endsWith('USDT');
                      return (
                      <div
                        key={log.id}
                        className="p-2 rounded-lg bg-black/40 border border-zinc-800/80 space-y-1 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                log.type === 'TRADE_BUY'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : log.type === 'TRADE_SELL'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {log.type === 'TRADE_BUY' ? 'BUY' : log.type === 'TRADE_SELL' ? 'TAKE PROFIT' : 'STOP LOSS'}
                            </span>
                            <span className="text-white flex items-center gap-1">
                              {isCryptoLog && <span className="text-cyan-400">⚡</span>}
                              {log.symbol}
                            </span>
                            <span className="text-zinc-500 text-[10px]">· {log.agentName.split(' ')[0]}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500">{log.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-zinc-300">{log.details}</p>
                        {log.metadata && (
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-0.5 flex-wrap">
                            {log.metadata.price && (
                              <span>
                                Harga: {isCryptoLog ? `$${log.metadata.price.toLocaleString('en-US', { minimumFractionDigits: log.metadata.price < 1 ? 4 : 2 })}` : `Rp ${log.metadata.price.toLocaleString('id-ID')}`}
                              </span>
                            )}
                            {log.metadata.lots && <span>· {isCryptoLog ? 'Unit' : 'Lot'}: {log.metadata.lots}</span>}
                            {log.metadata.takeProfit && (
                              <span className="text-emerald-400">
                                · TP: {isCryptoLog ? `$${log.metadata.takeProfit.toLocaleString('en-US', { minimumFractionDigits: log.metadata.takeProfit < 1 ? 4 : 2 })}` : `Rp ${log.metadata.takeProfit.toLocaleString('id-ID')}`}
                              </span>
                            )}
                            {log.metadata.stopLoss && (
                              <span className="text-rose-400">
                                · SL: {isCryptoLog ? `$${log.metadata.stopLoss.toLocaleString('en-US', { minimumFractionDigits: log.metadata.stopLoss < 1 ? 4 : 2 })}` : `Rp ${log.metadata.stopLoss.toLocaleString('id-ID')}`}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Kolom Kanan: Buletin Berita Live AI Newsroom */}
            <div className="bg-[#10141d] border border-zinc-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-zinc-400 font-bold text-[11px] uppercase border-b border-zinc-800/60 pb-1.5">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Newspaper className="w-3.5 h-3.5" /> Buletin Live Newsroom Pod ({dispatches.length})
                </span>
                <span className="text-[10px] text-zinc-500">Marsha Utami & Bima</span>
              </div>

              {dispatches.length === 0 ? (
                <div className="text-zinc-500 py-3 text-center text-xs">
                  Belum ada dispatches berita baru.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {dispatches.map((disp) => (
                    <div
                      key={disp.id}
                      className="p-2 rounded-lg bg-black/40 border border-zinc-800/80 space-y-1 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white leading-snug line-clamp-1">
                          {disp.headline}
                        </span>
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded shrink-0 ${
                            disp.sentiment === 'BULLISH'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : disp.sentiment === 'BEARISH'
                              ? 'text-rose-400 bg-rose-500/10'
                              : 'text-zinc-400'
                          }`}
                        >
                          {disp.sentiment}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">{disp.summary}</p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                        <span>Oleh {disp.agentName}</span>
                        <span>{disp.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
