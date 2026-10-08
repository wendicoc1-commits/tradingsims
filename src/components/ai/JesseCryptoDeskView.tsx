'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Activity,
  Bot,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Sliders,
  DollarSign,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Percent,
  Flame,
  Play,
  Pause,
  History,
} from 'lucide-react';
import { usePortfolioStore } from '@/store';
import { useAIAgentStore } from '@/store/aiAgentStore';
import { useBinanceLivePrices, type BinanceTickerData } from '@/hooks/useBinanceLivePrices';
import {
  SUPPORTED_CRYPTO_PAIRS,
  evaluateJesseStrategy,
  calculateCryptoOrder,
  type CryptoAssetMeta,
  type JesseStrategySignal,
} from '@/lib/crypto/jesseCryptoEngine';
import {
  runAutonomousCryptoAgentCycle,
  scanCryptoUniverse,
  type CryptoAlphaRanking,
} from '@/lib/crypto/autonomousCryptoAgent';
import { bloombergAudio } from '@/lib/bloombergAudio';
import TopUpModal from '@/components/portfolio/TopUpModal';

export default function JesseCryptoDeskView() {
  const { cash, holdings, orders, placeBuyOrder, placeSellOrder } = usePortfolioStore();
  const { tickerMap, isConnected, lastHeartbeat, refreshSnapshot } = useBinanceLivePrices();
  const { autoTradingEnabled, setAutoTradingEnabled, logs } = useAIAgentStore();

  const [selectedPair, setSelectedPair] = useState<string>('BTCUSDT');
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [inputMode, setInputMode] = useState<'IDR' | 'COIN'>('IDR');
  const [amountIDR, setAmountIDR] = useState<string>('5000000'); // Default Rp 5 Juta
  const [coinUnits, setCoinUnits] = useState<string>('0.005');
  const [customTP, setCustomTP] = useState<string>('');
  const [customSL, setCustomSL] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // State Autonomous Crypto AI
  const [isRunningAutoCycle, setIsRunningAutoCycle] = useState(false);
  const [autoCycleMsg, setAutoCycleMsg] = useState<string | null>(null);
  const [cryptoRankings, setCryptoRankings] = useState<CryptoAlphaRanking[]>([]);
  const [showLogDrawer, setShowLogDrawer] = useState(false);

  const exchangeRate = 16000; // 1 USDT = Rp 16.000

  // Asset terpilih
  const currentAsset: CryptoAssetMeta = useMemo(() => {
    return SUPPORTED_CRYPTO_PAIRS.find((p) => p.symbol === selectedPair) || SUPPORTED_CRYPTO_PAIRS[0];
  }, [selectedPair]);

  // Data harga Binance terkini
  const liveTicker: BinanceTickerData | undefined = tickerMap[selectedPair] || tickerMap[selectedPair.replace(/USDT$/, '')];
  const currentPriceUSDT = liveTicker?.price ?? (selectedPair === 'BTCUSDT' ? 68500 : selectedPair === 'ETHUSDT' ? 2450 : selectedPair === 'SOLUSDT' ? 154 : selectedPair === 'BNBUSDT' ? 585 : selectedPair === 'DOGEUSDT' ? 0.125 : selectedPair === 'XRPUSDT' ? 0.54 : selectedPair === 'ADAUSDT' ? 0.35 : selectedPair === 'AVAXUSDT' ? 26.5 : selectedPair === 'SUIUSDT' ? 1.14 : selectedPair === 'NEARUSDT' ? 4.80 : selectedPair === 'LINKUSDT' ? 11.5 : selectedPair === 'PEPEUSDT' ? 0.0000095 : 10);
  const change24h = liveTicker?.change24h ?? 1.85;

  // Evaluasi Algoritma Jesse AI
  const jesseSignal: JesseStrategySignal = useMemo(() => {
    return evaluateJesseStrategy(selectedPair, currentPriceUSDT, change24h);
  }, [selectedPair, currentPriceUSDT, change24h]);

  // Holding koin yang terpilih saat ini
  const currentHolding = holdings.find(
    (h) =>
      (h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT')) &&
      (h.displaySymbol.toUpperCase() === currentAsset.baseAsset ||
        h.symbol.toUpperCase() === currentAsset.symbol)
  );

  const availableCoinBalance = currentHolding?.cryptoUnits ?? currentHolding?.lots ?? 0;

  // Hitung estimasi order
  const idrVal = parseFloat(amountIDR) || 0;
  const coinVal = parseFloat(coinUnits) || 0;

  const orderCalculation = useMemo(() => {
    if (inputMode === 'IDR') {
      return calculateCryptoOrder({
        priceUSDT: currentPriceUSDT,
        amountIDR: idrVal,
        exchangeRate,
      });
    } else {
      return calculateCryptoOrder({
        priceUSDT: currentPriceUSDT,
        coinUnits: coinVal,
        exchangeRate,
      });
    }
  }, [inputMode, idrVal, coinVal, currentPriceUSDT, exchangeRate]);

  // Auto-sync form nilai saat switch mode
  const handleQuickPercent = (pct: number) => {
    if (orderSide === 'BUY') {
      const budget = Math.floor(cash * pct);
      setInputMode('IDR');
      setAmountIDR(budget.toString());
    } else {
      const sellUnits = Number((availableCoinBalance * pct).toFixed(6));
      setInputMode('COIN');
      setCoinUnits(sellUnits.toString());
    }
  };

  // Trigger Autonomous Cycle untuk Crypto
  const handleTriggerCryptoCycle = async () => {
    setIsRunningAutoCycle(true);
    try {
      const res = await runAutonomousCryptoAgentCycle(tickerMap);
      if (res.actionTaken) {
        setAutoCycleMsg(res.actionTaken);
      } else {
        setAutoCycleMsg(
          `Siklus selesai: Kevin Zhang (Crypto Quant PM) mengamati 12 koin. Top Alpha saat ini ${
            res.topPick?.asset.baseAsset || 'BTC'
          }. Seluruh posisi diawasi CRO.`
        );
      }
      const scanRes = scanCryptoUniverse(tickerMap);
      setCryptoRankings(scanRes.leaderboard);
      setTimeout(() => setAutoCycleMsg(null), 8000);
    } finally {
      setIsRunningAutoCycle(false);
    }
  };

  useEffect(() => {
    const scanRes = scanCryptoUniverse(tickerMap);
    setCryptoRankings(scanRes.leaderboard);
  }, [tickerMap]);

  // Interval otomatis setiap 60 detik jika auto-trading aktif
  useEffect(() => {
    if (!autoTradingEnabled) return;
    const interval = setInterval(() => {
      runAutonomousCryptoAgentCycle(tickerMap).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [autoTradingEnabled, tickerMap]);

  // Terapkan rekomendasi TP / SL Jesse AI
  const handleApplyJesseRiskTargets = () => {
    setCustomTP(jesseSignal.takeProfit.toString());
    setCustomSL(jesseSignal.stopLoss.toString());
    setNotification({
      type: 'success',
      message: `Parameter risiko Jesse AI diterapkan: TP $${jesseSignal.takeProfit.toLocaleString()} & SL $${jesseSignal.stopLoss.toLocaleString()}`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Eksekusi Order Beli / Jual
  const handleExecuteTrade = () => {
    const finalUnits = inputMode === 'IDR' ? orderCalculation.units : coinVal;
    if (finalUnits <= 0 || currentPriceUSDT <= 0) {
      setNotification({ type: 'error', message: 'Jumlah koin atau nilai transaksi tidak valid.' });
      return;
    }

    if (orderSide === 'BUY') {
      const MIN_BOT_CASH_RESERVE = 1_000_000;
      if (cash < MIN_BOT_CASH_RESERVE) {
        setNotification({
          type: 'error',
          message: `⛔ Proteksi Likuiditas: Saldo kas (Rp ${Math.round(cash).toLocaleString('id-ID')}) di bawah batas minimum Rp 1.000.000. Bot crypto dinonaktifkan dari pembelian baru.`,
        });
        return;
      }
      if (cash - orderCalculation.grandTotalIDR < MIN_BOT_CASH_RESERVE) {
        setNotification({
          type: 'error',
          message: `⛔ Proteksi Cadangan Kas: Pembelian ini akan menyisakan kas Rp ${Math.round(cash - orderCalculation.grandTotalIDR).toLocaleString('id-ID')} (di bawah cadangan minimum Rp 1 Juta). Order dibatalkan.`,
        });
        return;
      }
      if (cash < orderCalculation.grandTotalIDR) {
        setNotification({
          type: 'error',
          message: `Saldo kas tidak cukup. Dibutuhkan Rp ${orderCalculation.grandTotalIDR.toLocaleString('id-ID')}, tersedia Rp ${cash.toLocaleString('id-ID')}.`,
        });
        return;
      }

      const res = placeBuyOrder({
        symbol: currentAsset.symbol,
        displaySymbol: currentAsset.baseAsset,
        name: `${currentAsset.name} (Crypto)`,
        price: currentPriceUSDT,
        lots: Number(finalUnits.toFixed(6)),
        orderType: 'MARKET',
        assetClass: 'CRYPTO',
        currency: 'USDT',
        exchangeRate,
        takeProfitPrice: parseFloat(customTP) || undefined,
        stopLossPrice: parseFloat(customSL) || undefined,
        source: 'AI_AGENT',
      });

      if (res.order) {
        bloombergAudio.playOrderFilledChime();
        setNotification({
          type: 'success',
          message: `⚡ BERHASIL BELI: ${finalUnits.toFixed(4)} ${currentAsset.baseAsset} @ $${currentPriceUSDT.toLocaleString()} (Total: Rp ${orderCalculation.grandTotalIDR.toLocaleString('id-ID')})`,
        });
        setTimeout(() => setNotification(null), 6000);
      } else {
        setNotification({ type: 'error', message: res.error || 'Gagal mengeksekusi order beli crypto.' });
      }
    } else {
      if (availableCoinBalance < finalUnits) {
        setNotification({
          type: 'error',
          message: `Saldo ${currentAsset.baseAsset} tidak cukup. Anda hanya memiliki ${availableCoinBalance} ${currentAsset.baseAsset}.`,
        });
        return;
      }

      const res = placeSellOrder({
        symbol: currentAsset.symbol,
        displaySymbol: currentAsset.baseAsset,
        price: currentPriceUSDT,
        lots: Number(finalUnits.toFixed(6)),
        orderType: 'MARKET',
        assetClass: 'CRYPTO',
        currency: 'USDT',
        exchangeRate,
      });

      if (res.order) {
        bloombergAudio.playOrderFilledChime();
        const pl = res.order.realizedPL || 0;
        const plText = pl >= 0 ? `+Rp ${pl.toLocaleString('id-ID')}` : `-Rp ${Math.abs(pl).toLocaleString('id-ID')}`;
        setNotification({
          type: 'success',
          message: `🎯 BERHASIL JUAL: ${finalUnits.toFixed(4)} ${currentAsset.baseAsset} @ $${currentPriceUSDT.toLocaleString()} (Realized P/L: ${plText})`,
        });
        setTimeout(() => setNotification(null), 6000);
      } else {
        setNotification({ type: 'error', message: res.error || 'Gagal memproses penjualan crypto.' });
      }
    }
  };

  // Filter holdings crypto aktif
  const cryptoHoldings = holdings.filter(
    (h) => h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT')
  );

  const totalCryptoValueIDR = cryptoHoldings.reduce((sum, h) => {
    const liveP = tickerMap[h.symbol]?.price ?? h.currentPrice;
    const units = h.cryptoUnits ?? h.lots;
    return sum + units * liveP * (h.exchangeRate || exchangeRate);
  }, 0);

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 font-mono p-3 md:p-6 space-y-5">
      {/* ── Top Terminal Banner ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-[#0d131f] via-[#090d16] to-[#07090e] border border-cyan-500/30 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20 text-black">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-base md:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                JESSE AI QUANT CRYPTOCURRENCY DESK
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isConnected ? 'BINANCE REALTIME WS LIVE' : 'CONNECTING BINANCE...'}
              </span>
              <a
                href="https://github.com/jesse-ai/jesse"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-zinc-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
              >
                jesse-ai/jesse <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Trading spot crypto multi-koin 24/7 dengan strategi kuantitatif otomatis, risk management ketat, dan eksekusi instan portofolio.
            </p>
          </div>
        </div>

        {/* Financial Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-[#0b0f19] border border-zinc-800 rounded-lg px-3 py-1.5">
            <span className="text-[10px] text-zinc-400 block">KAS PORTOFOLIO (IDR)</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              Rp {cash.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#0b0f19] border border-cyan-900/40 rounded-lg px-3 py-1.5">
            <span className="text-[10px] text-cyan-400 block">NILAI CRYPTO HELD</span>
            <span className="text-sm font-bold text-cyan-300 font-mono">
              Rp {Math.round(totalCryptoValueIDR).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#0b0f19] border border-zinc-800 rounded-lg px-3 py-1.5">
            <span className="text-[10px] text-zinc-400 block">KURS ACUAN</span>
            <span className="text-sm font-bold text-zinc-300 font-mono">
              1 USDT = Rp {exchangeRate.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* ── Fincept & Jesse AI Autonomous Crypto Agent Control Bar ── */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/30 via-[#0a0e17] to-[#07090e] border border-cyan-500/40 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-lg text-cyan-300">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                AUTONOMOUS AI CRYPTO TRADING POD
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                  autoTradingEnabled
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${autoTradingEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                {autoTradingEnabled ? 'AUTO-TRADE AKTIF' : 'AUTO-TRADE PAUSED'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {autoCycleMsg ||
                'Kevin Zhang (Crypto PM) & Jesse Vance (Quant) memindai 12 koin. Eksekusi order BUY/TP/SL otomatis ke portofolio Anda.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAutoTradingEnabled(!autoTradingEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              autoTradingEnabled
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500 text-black hover:bg-emerald-400'
            }`}
          >
            {autoTradingEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {autoTradingEnabled ? 'Pause AI' : 'Aktifkan AI Auto-Trade'}
          </button>

          <button
            onClick={handleTriggerCryptoCycle}
            disabled={isRunningAutoCycle}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningAutoCycle ? 'animate-spin' : ''}`} />
            {isRunningAutoCycle ? 'Scanning Universe...' : 'Scan & Auto-Trade Kripto'}
          </button>

          <button
            onClick={() => setShowLogDrawer(!showLogDrawer)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            Riwayat Trade AI
          </button>
        </div>
      </div>

      {/* Drawer Riwayat Trade AI Kripto */}
      {showLogDrawer && (
        <div className="p-4 rounded-xl bg-[#090d16] border border-cyan-500/30 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-bold text-xs text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              LOG AKTIVITAS & EKSEKUSI TRADING OTONOM KRIPTO
            </span>
            <button
              onClick={() => setShowLogDrawer(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Tutup ✕
            </button>
          </div>

          {logs.filter((l) => l.type === 'TRADE_BUY' || l.type === 'TRADE_SELL' || l.type === 'RISK_GATE').length === 0 ? (
            <div className="text-center py-6 text-zinc-500 text-xs">
              Belum ada eksekusi trading otomatis yang tercatat. Klik "Scan & Auto-Trade Kripto" untuk memulai.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {logs
                .filter((l) => l.type === 'TRADE_BUY' || l.type === 'TRADE_SELL' || l.type === 'RISK_GATE')
                .map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-[#06080e] border border-zinc-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{log.agentEmoji}</span>
                        <span className="font-bold text-white">{log.title}</span>
                        <span className="text-[10px] text-zinc-400">({log.timestamp})</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">{log.details}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 ${
                        log.type === 'TRADE_BUY'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : log.type === 'TRADE_SELL'
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {log.type.replace('_', ' ')}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── Notification Banner ── */}
      {notification && (
        <div
          className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-between gap-2 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-zinc-400 hover:text-white text-xs px-2 py-0.5 rounded"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ── Crypto Universe Ticker Bar ── */}
      <div className="overflow-x-auto pb-1 scrollbar-thin">
        <div className="flex items-center gap-2 min-w-max">
          {SUPPORTED_CRYPTO_PAIRS.map((item) => {
            const t = tickerMap[item.symbol];
            const p = t?.price ?? (item.symbol === 'BTCUSDT' ? 68500 : 100);
            const chg = t?.change24h ?? 0;
            const isSelected = selectedPair === item.symbol;
            const isPositive = chg >= 0;

            return (
              <button
                key={item.symbol}
                onClick={() => setSelectedPair(item.symbol)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                    : 'bg-[#0a0e17] border-zinc-800 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <img
                  src={item.logo}
                  alt={item.baseAsset}
                  className="w-5 h-5 rounded-full object-contain shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs">{item.baseAsset}</span>
                    <span className="text-[10px] text-zinc-400">/USDT</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono">
                    <span className="font-bold text-white">
                      ${p < 1 ? p.toFixed(4) : p.toLocaleString()}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {chg.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Workspace: 2-Columns Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── LEFT: Chart & Jesse AI Intelligence (8 Cols) ── */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Pair Header */}
          <div className="p-4 rounded-xl bg-[#0b0f19] border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={currentAsset.logo}
                alt={currentAsset.name}
                className="w-8 h-8 rounded-full object-contain"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    {currentAsset.name} ({currentAsset.baseAsset}/USDT)
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-800 rounded text-zinc-300 border border-zinc-700">
                    {currentAsset.category}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">{currentAsset.description}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl md:text-2xl font-bold font-mono text-white flex items-center justify-end gap-2">
                ${currentPriceUSDT < 1 ? currentPriceUSDT.toFixed(6) : currentPriceUSDT.toLocaleString()}
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold ${
                    change24h >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {change24h >= 0 ? '+' : ''}
                  {change24h.toFixed(2)}%
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 block font-mono">
                ≈ Rp {(currentPriceUSDT * exchangeRate).toLocaleString('id-ID')} / koin
              </span>
            </div>
          </div>

          {/* Interactive TradingView Candlestick Chart */}
          <div className="rounded-xl border border-zinc-800 bg-[#090d16] overflow-hidden shadow-lg h-[440px] relative">
            <iframe
              title={`${currentAsset.baseAsset} Chart`}
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${selectedPair}&symbol=BINANCE:${selectedPair}&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=090d16&studies=%5B%5D&theme=dark&style=1&timezone=Asia%2FJakarta&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en`}
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>

          {/* ── Jesse AI Strategy Terminal Box ── */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c111d] to-[#080c14] border border-cyan-500/30 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm text-white">
                  JESSE AI QUANT STRATEGY COPILOT: {jesseSignal.strategyName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Timeframe: 1h</span>
                <button
                  onClick={handleApplyJesseRiskTargets}
                  className="px-2.5 py-1 text-xs font-bold rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Pakai TP/SL Jesse AI
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 rounded-lg bg-[#080b12] border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">SINYAL ALGORITMA</span>
                <span
                  className={`text-sm font-bold block mt-0.5 ${
                    jesseSignal.signal === 'STRONG_BUY'
                      ? 'text-emerald-400 animate-pulse'
                      : jesseSignal.signal === 'BUY'
                      ? 'text-emerald-300'
                      : jesseSignal.signal === 'SELL'
                      ? 'text-rose-400'
                      : 'text-amber-300'
                  }`}
                >
                  {jesseSignal.signal.replace('_', ' ')} ({jesseSignal.confidence}%)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#080b12] border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">WIN RATE HISTORIS</span>
                <span className="text-sm font-bold text-cyan-300 block mt-0.5">
                  {jesseSignal.backtestMetrics.winRate}% ({jesseSignal.backtestMetrics.tradesCount} trades)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#080b12] border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">SHARPE & PROFIT FACTOR</span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {jesseSignal.backtestMetrics.sharpeRatio} SR · {jesseSignal.backtestMetrics.profitFactor} PF
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#080b12] border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block">MAX DRAWDOWN</span>
                <span className="text-sm font-bold text-amber-400 block mt-0.5">
                  {jesseSignal.backtestMetrics.maxDrawdown}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-[#090d17] p-3 rounded-lg border border-zinc-800/80">
              <div>
                <span className="text-zinc-400 block text-[11px]">Recommended Entry</span>
                <span className="font-bold text-white">
                  ${jesseSignal.suggestedEntry < 1 ? jesseSignal.suggestedEntry.toFixed(6) : jesseSignal.suggestedEntry.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Take Profit Target</span>
                <span className="font-bold text-emerald-400">
                  ${jesseSignal.takeProfit < 1 ? jesseSignal.takeProfit.toFixed(6) : jesseSignal.takeProfit.toLocaleString()} ({jesseSignal.riskReward}x R:R)
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Stop Loss Cut</span>
                <span className="font-bold text-rose-400">
                  ${jesseSignal.stopLoss < 1 ? jesseSignal.stopLoss.toFixed(6) : jesseSignal.stopLoss.toLocaleString()} (Kelly Risk 1.5%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Direct Trading Form & Holdings Desk (4 Cols) ── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Order Execution Panel */}
          <div className="p-4 rounded-xl bg-[#0b0f19] border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-bold text-sm text-white flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-cyan-400" />
                SPOT ORDER EXECUTION
              </span>
              <span className="text-[11px] text-zinc-400">Instant Market Order</span>
            </div>

            {/* Buy / Sell Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-[#070a10] border border-zinc-800">
              <button
                onClick={() => setOrderSide('BUY')}
                className={`py-2 rounded font-bold text-xs transition-all cursor-pointer ${
                  orderSide === 'BUY'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                BELI (BUY)
              </button>
              <button
                onClick={() => setOrderSide('SELL')}
                className={`py-2 rounded font-bold text-xs transition-all cursor-pointer ${
                  orderSide === 'SELL'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                JUAL (SELL)
              </button>
            </div>

            {/* Available Balance Status */}
            <div className="p-2.5 rounded-lg bg-[#080c14] border border-zinc-800 text-xs flex justify-between items-center">
              <span className="text-zinc-400">
                {orderSide === 'BUY' ? 'Kas RDN Siap Beli:' : `Saldo ${currentAsset.baseAsset}:`}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold font-mono text-white">
                  {orderSide === 'BUY'
                    ? `Rp ${cash.toLocaleString('id-ID')}`
                    : `${availableCoinBalance.toFixed(4)} ${currentAsset.baseAsset}`}
                </span>
                {orderSide === 'BUY' && (
                  <button
                    type="button"
                    onClick={() => setIsTopUpOpen(true)}
                    className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-extrabold text-[10px] border border-amber-500/40 cursor-pointer transition-all"
                    title="Top Up Saldo Kas RDN via QRIS (Rp 10.000 = Rp 1.000.000 Kas)"
                  >
                    + Top Up
                  </button>
                )}
              </div>
            </div>

            {/* Mode Input: IDR vs Coin Units */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-zinc-400">Metode Nominal:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInputMode('IDR')}
                    className={`text-[11px] px-2 py-0.5 rounded ${
                      inputMode === 'IDR' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-500'
                    }`}
                  >
                    Nominal IDR (Rp)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('COIN')}
                    className={`text-[11px] px-2 py-0.5 rounded ${
                      inputMode === 'COIN' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-500'
                    }`}
                  >
                    Jumlah Koin ({currentAsset.baseAsset})
                  </button>
                </div>
              </div>

              {inputMode === 'IDR' ? (
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 text-xs">Rp</span>
                  <input
                    type="number"
                    value={amountIDR}
                    onChange={(e) => setAmountIDR(e.target.value)}
                    placeholder="Contoh: 5000000"
                    className="w-full pl-9 pr-3 py-2 bg-[#070a10] border border-zinc-700 rounded-lg text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="relative">
                  <span className="absolute right-3 top-2.5 text-zinc-500 text-xs">{currentAsset.baseAsset}</span>
                  <input
                    type="number"
                    step="any"
                    value={coinUnits}
                    onChange={(e) => setCoinUnits(e.target.value)}
                    placeholder={`Contoh: 0.05`}
                    className="w-full pl-3 pr-16 py-2 bg-[#070a10] border border-zinc-700 rounded-lg text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Quick Percent Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {[0.1, 0.25, 0.5, 1].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleQuickPercent(pct)}
                  className="py-1 text-[11px] font-bold rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  {pct * 100}%
                </button>
              ))}
            </div>

            {/* Take Profit & Stop Loss Inputs */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Target TP ($ USDT)</label>
                <input
                  type="number"
                  step="any"
                  value={customTP}
                  onChange={(e) => setCustomTP(e.target.value)}
                  placeholder={`$${jesseSignal.takeProfit}`}
                  className="w-full px-2.5 py-1.5 bg-[#070a10] border border-zinc-800 rounded text-xs text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Batas SL ($ USDT)</label>
                <input
                  type="number"
                  step="any"
                  value={customSL}
                  onChange={(e) => setCustomSL(e.target.value)}
                  placeholder={`$${jesseSignal.stopLoss}`}
                  className="w-full px-2.5 py-1.5 bg-[#070a10] border border-zinc-800 rounded text-xs text-rose-400 font-mono focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Order Summary Receipt */}
            <div className="p-3 rounded-lg bg-[#070a10] border border-zinc-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Estimasi Koin:</span>
                <span className="text-white font-bold">
                  {orderCalculation.units.toFixed(6)} {currentAsset.baseAsset}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Nilai Bersih ($ USDT):</span>
                <span className="text-white font-bold">
                  ${orderCalculation.totalUSDT.toFixed(2)} USDT
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Biaya Transaksi (0.1%):</span>
                <span className="text-zinc-300">
                  Rp {orderCalculation.feeIDR.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-1.5 font-bold">
                <span className="text-zinc-300">Total Potong / Terima:</span>
                <span className={orderSide === 'BUY' ? 'text-emerald-400' : 'text-cyan-400'}>
                  Rp {orderCalculation.grandTotalIDR.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecuteTrade}
              className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider transition-all cursor-pointer shadow-lg ${
                orderSide === 'BUY'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/25'
              }`}
            >
              {orderSide === 'BUY'
                ? `⚡ BELI SEKARANG (${currentAsset.baseAsset})`
                : `🎯 JUAL SEKARANG (${currentAsset.baseAsset})`}
            </button>
          </div>

          {/* Active Crypto Holdings */}
          <div className="p-4 rounded-xl bg-[#0b0f19] border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                PORTOFOLIO CRYPTO ANDA
              </span>
              <span className="text-[10px] text-zinc-400">{cryptoHoldings.length} aset</span>
            </div>

            {cryptoHoldings.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs">
                Belum ada aset crypto di portofolio. Beli koin pertama Anda di atas!
              </div>
            ) : (
              <div className="space-y-2">
                {cryptoHoldings.map((h) => {
                  const sym = h.displaySymbol.toUpperCase();
                  const liveP = tickerMap[`${sym}USDT`]?.price ?? h.currentPrice;
                  const units = h.cryptoUnits ?? h.lots;
                  const pl = (liveP - h.avgPrice) * units * (h.exchangeRate || exchangeRate);
                  const plPct = h.avgPrice > 0 ? ((liveP - h.avgPrice) / h.avgPrice) * 100 : 0;

                  return (
                    <div
                      key={h.symbol}
                      className="p-2.5 rounded-lg bg-[#070a10] border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white">{sym}</span>
                          <span className="text-[10px] text-zinc-400">
                            {units.toFixed(4)} koin
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Avg: ${h.avgPrice.toLocaleString()} · Now: ${liveP.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-bold font-mono block ${
                            pl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {pl >= 0 ? '+' : ''}
                          Rp {Math.round(pl).toLocaleString('id-ID')}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            plPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          ({plPct >= 0 ? '+' : ''}
                          {plPct.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Up Saldo Kas RDN Modal (QRIS) */}
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
    </div>
  );
}
