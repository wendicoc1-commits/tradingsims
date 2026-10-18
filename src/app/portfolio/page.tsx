'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  PieChart,
  History,
  Coins,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Calendar,
  BarChart3,
  ShieldAlert,
  Download,
  Newspaper,
  Target,
  Shield,
  Check,
  X,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { usePortfolioStore, KNOWN_DIVIDENDS } from '@/store';
import { useCryptoPriceStore } from '@/store/useCryptoPriceStore';
import { calculateShares, isValidIDXTick } from '@/lib/stockRules';
import { exportToCsv } from '@/lib/exportCsv';
import DividendCalendar from '@/components/dividend/DividendCalendar';
import PortfolioAnalytics from '@/components/portfolio/PortfolioAnalytics';
import PortfolioNewsFeed from '@/components/portfolio/PortfolioNewsFeed';
import PortfolioStressTestModal from '@/components/portfolio/PortfolioStressTestModal';
import FinceptAIPortfolioAgentBar from '@/components/portfolio/FinceptAIPortfolioAgentBar';
import TradingJournalCalendar from '@/components/portfolio/TradingJournalCalendar';
import TelegramAlertSettingsModal from '@/components/portfolio/TelegramAlertSettingsModal';
import CopyTradingModal from '@/components/portfolio/CopyTradingModal';
import TopUpModal from '@/components/portfolio/TopUpModal';
import AuthModal from '@/components/auth/AuthModal';
import CompanyLogo from '@/components/common/CompanyLogo';
import EmptyState from '@/components/common/EmptyState';
import { useAuthStore } from '@/store/useAuthStore';
import { useBinanceLivePrices } from '@/hooks/useBinanceLivePrices';
import { formatCryptoPrice, formatIDREquivalent } from '@/lib/utils';
import { isCryptoSymbol, isUSSymbol } from '@/lib/universe/masterAssetUniverse';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { exportPortfolioToExcel, exportElementToPDF } from '@/lib/exportUtils';
import { useOrderCalculation } from '@/hooks/useOrderCalculation';

function formatPrice(price: number) {
  return price.toLocaleString('id-ID');
}

const KNOWN_US_SYMS = [
  'NVDA', 'AAPL', 'MSFT', 'TSLA', 'GOOGL', 'GOOG', 'GOOGLE', 'AMZN', 'META',
  'NFLX', 'AMD', 'INTC', 'SPY', 'QQQ', 'COIN', 'PLTR', 'AVGO', 'LLY', 'JPM', 'WMT', 'COST', 'BABA', 'TSM', 'ASML'
];

/* ─── Order Form (Paper Trading Engine - Saham IDX, Saham US, & Crypto Spot) ─── */
function OrderForm() {
  const cash = usePortfolioStore((state) => state.cash);
  const placeBuyOrder = usePortfolioStore((state) => state.placeBuyOrder);
  const placeSellOrder = usePortfolioStore((state) => state.placeSellOrder);

  const { tickerMap } = useBinanceLivePrices();
  const [assetClass, setAssetClass] = useState<'EQUITY' | 'CRYPTO' | 'US'>('EQUITY');
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState('');
  const [lots, setLots] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    priceNum,
    lotsNum,
    rawSym,
    isCrypto,
    isUS,
    isForeign,
    rate,
    tradeValue,
    brokerFee,
    taxFee,
    grandTotal,
    shareInfo,
    tickValidation,
  } = useOrderCalculation({ symbol, price, lots, assetClass, orderType });

  const handleSelectQuickCrypto = (coin: string, seedPrice: number) => {
    setAssetClass('CRYPTO');
    setSymbol(coin);
    const live = tickerMap[coin]?.price ?? tickerMap[`${coin}USDT`]?.price ?? seedPrice;
    setPrice(live.toString());
  };

  const handleSelectQuickUS = (ticker: string, seedPrice: number) => {
    setAssetClass('US');
    setSymbol(ticker);
    setPrice(seedPrice.toString());
    setLots('1');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!rawSym || priceNum <= 0 || lotsNum <= 0) {
      setNotification({ type: 'error', message: 'Silakan isi kode aset, harga, dan jumlah dengan benar.' });
      return;
    }

    if (!isForeign && !tickValidation.valid) {
      setNotification({
        type: 'error',
        message: `Harga Rp ${priceNum} tidak mematuhi fraksi harga BEI (Tick size: Rp ${tickValidation.tick}). Rekomendasi terdekat: Rp ${tickValidation.nearest}.`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (orderType === 'BUY') {
        const cleanSym = rawSym.replace(/USDT$/i, '');
        const liveMarketPrice = tickerMap[cleanSym]?.price ?? tickerMap[`${cleanSym}USDT`]?.price;
        const finalPrice =
          isCrypto && liveMarketPrice && liveMarketPrice > 0 && Math.abs(priceNum - liveMarketPrice) / liveMarketPrice > 0.05
            ? liveMarketPrice
            : priceNum;

        const res = placeBuyOrder({
          symbol: isCrypto ? `${cleanSym}USDT` : rawSym,
          displaySymbol: cleanSym,
          price: finalPrice,
          lots: lotsNum,
          name: isCrypto ? `${cleanSym} (Crypto Spot)` : isUS ? `${cleanSym} (US Stock)` : rawSym,
          assetClass: isCrypto ? 'CRYPTO' : isUS ? 'US' : 'EQUITY',
          currency: isCrypto ? 'USDT' : isUS ? 'USD' : 'IDR',
          exchangeRate: isForeign ? rate : undefined,
          orderType: isForeign ? 'MARKET' : 'LIMIT',
        });
        if (res.order) {
          const successMsg = isCrypto
            ? `⚡ BERHASIL BELI: ${lotsNum} ${cleanSym} @ $${priceNum.toLocaleString()} USDT (Total: Rp ${Math.round(grandTotal).toLocaleString('id-ID')})!`
            : isUS
            ? `⚡ BERHASIL BELI: ${lotsNum} shares ${cleanSym} @ $${priceNum.toLocaleString()} USD (Total: Rp ${Math.round(grandTotal).toLocaleString('id-ID')})!`
            : `Order BUY ${lotsNum} lot ${rawSym} berhasil dieksekusi!`;

          setNotification({
            type: 'success',
            message: successMsg,
          });
          toast.success(successMsg, {
            description: `Saldo Kas Tersisa: Rp ${Math.round(cash - grandTotal).toLocaleString('id-ID')}`,
          });
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
          setSymbol('');
          setPrice('');
          setLots('');
        } else {
          setNotification({ type: 'error', message: res.error || 'Gagal melakukan pembelian.' });
          toast.error('Gagal Order Beli', { description: res.error || 'Saldo tidak mencukupi atau parameter tidak valid.' });
        }
      } else {
        const cleanSym = rawSym.replace(/USDT$/i, '');
        const res = placeSellOrder({
          symbol: isCrypto ? `${cleanSym}USDT` : rawSym,
          displaySymbol: cleanSym,
          price: priceNum,
          lots: lotsNum,
          assetClass: isCrypto ? 'CRYPTO' : 'EQUITY',
          currency: isCrypto ? 'USDT' : shareInfo.isUS ? 'USD' : 'IDR',
          exchangeRate: isForeign ? rate : undefined,
          orderType: isForeign ? 'MARKET' : 'LIMIT',
        });
        if (res.order) {
          const plText =
            (res.order.realizedPL || 0) >= 0
              ? `+Rp ${formatPrice(res.order.realizedPL || 0)}`
              : `-Rp ${formatPrice(Math.abs(res.order.realizedPL || 0))}`;
          const unitLabel = isCrypto ? 'koin' : shareInfo.isUS ? 'lembar' : 'lot';
          const sellMsg = `Order SELL ${lotsNum} ${unitLabel} ${cleanSym} berhasil diproses! Realized P/L: ${plText}`;
          setNotification({
            type: 'success',
            message: sellMsg,
          });
          toast.success(sellMsg, {
            description: (res.order.realizedPL || 0) >= 0 ? '🎉 Posisi ditutup dengan profit!' : '⚠️ Proteksi modal / stop-loss selesai.',
          });
          if ((res.order.realizedPL || 0) > 0) {
            confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
          }
          setSymbol('');
          setPrice('');
          setLots('');
        } else {
          setNotification({ type: 'error', message: res.error || 'Gagal memproses penjualan.' });
          toast.error('Gagal Order Jual', { description: res.error || 'Jumlah lot/koin tidak valid atau posisi tidak ditemukan.' });
        }
      }
    } finally {
      setTimeout(() => setIsSubmitting(false), 500);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div id="order-execution-desk" className="rounded-xl border p-3 bg-[#09090b] border-[#27272a] shadow-sm text-xs">
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#27272a]">
        <div className="flex items-center gap-1.5">
          <ShoppingCart className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-white">
            Order Desk
          </span>
        </div>
        <span className="text-[9px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
          ● 24/7 PAPER
        </span>
      </div>

      {notification && (
        <div
          className="mb-2.5 p-2 rounded-lg text-[11px] flex items-center gap-1.5"
          style={{
            backgroundColor: notification.type === 'success' ? 'var(--positive-bg)' : 'var(--negative-bg)',
            color: notification.type === 'success' ? 'var(--positive)' : 'var(--negative)',
            border: `1px solid ${notification.type === 'success' ? 'var(--positive)' : 'var(--negative)'}`,
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Asset Class Selector */}
      <div className="grid grid-cols-3 gap-1 mb-2 p-0.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[10px] font-bold font-mono">
        <button
          type="button"
          onClick={() => {
            setAssetClass('EQUITY');
            setSymbol('');
            setPrice('');
            setLots('');
          }}
          className={`py-1 rounded transition cursor-pointer flex items-center justify-center gap-1 ${
            assetClass === 'EQUITY' ? 'bg-[#f59e0b] text-black shadow-sm font-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span>🇮🇩</span>
          <span>IDX</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setAssetClass('US');
            setSymbol('GOOGL');
            setPrice('168.20');
            setLots('1');
          }}
          className={`py-1 rounded transition cursor-pointer flex items-center justify-center gap-1 ${
            assetClass === 'US' ? 'bg-blue-500 text-white shadow-sm font-black' : 'text-blue-400 hover:text-white'
          }`}
        >
          <span>🇺🇸</span>
          <span>US</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setAssetClass('CRYPTO');
            setSymbol('BTC');
            setPrice('82500');
            setLots('0.05');
          }}
          className={`py-1 rounded transition cursor-pointer flex items-center justify-center gap-1 ${
            assetClass === 'CRYPTO' ? 'bg-cyan-500 text-black shadow-sm font-black' : 'text-cyan-400 hover:text-white'
          }`}
        >
          <span>⚡</span>
          <span>CRYPTO</span>
        </button>
      </div>

      {/* Quick US Tickers */}
      {assetClass === 'US' && (
        <div className="mb-2 p-1.5 rounded-lg bg-blue-950/20 border border-blue-500/25">
          <div className="text-[9px] text-blue-300 font-bold mb-1 flex items-center justify-between">
            <span>PILIH CEPAT US:</span>
            <span className="text-[8px] text-zinc-400 font-mono">$1 = Rp 16rb</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {[
              { ticker: 'NVDA', price: 141.54 },
              { ticker: 'AAPL', price: 232.15 },
              { ticker: 'MSFT', price: 428.50 },
              { ticker: 'AMZN', price: 187.80 },
              { ticker: 'GOOGL', price: 168.20 },
              { ticker: 'TSLA', price: 218.80 },
            ].map((st) => (
              <button
                key={st.ticker}
                type="button"
                onClick={() => handleSelectQuickUS(st.ticker, st.price)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition cursor-pointer ${
                  symbol === st.ticker ? 'bg-blue-400 text-black' : 'bg-zinc-800 text-blue-300 hover:bg-zinc-700'
                }`}
              >
                {st.ticker}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Crypto Tickers */}
      {assetClass === 'CRYPTO' && (
        <div className="mb-2 p-1.5 rounded-lg bg-cyan-950/20 border border-cyan-500/25">
          <div className="text-[9px] text-cyan-300 font-bold mb-1 flex items-center justify-between">
            <span>PILIH CEPAT KRIPTO:</span>
            <span className="text-[8px] text-zinc-400 font-mono">$1 = Rp 16rb</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {[
              { coin: 'BTC', price: 81118 },
              { coin: 'ETH', price: 2450 },
              { coin: 'SOL', price: 154.20 },
              { coin: 'BNB', price: 585 },
              { coin: 'XRP', price: 1.42 },
              { coin: 'DOGE', price: 0.154 },
            ].map((c) => (
              <button
                key={c.coin}
                type="button"
                onClick={() => handleSelectQuickCrypto(c.coin, c.price)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition cursor-pointer ${
                  symbol === c.coin ? 'bg-cyan-400 text-black' : 'bg-zinc-800 text-cyan-300 hover:bg-zinc-700'
                }`}
              >
                {c.coin}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Buy/Sell toggle */}
      <div className="flex gap-1 mb-2.5 p-0.5 rounded-lg bg-[#18181b]">
        <button
          type="button"
          onClick={() => setOrderType('BUY')}
          className="flex-1 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
          style={{
            backgroundColor: orderType === 'BUY' ? 'var(--positive)' : 'transparent',
            color: orderType === 'BUY' ? '#000' : 'var(--text-muted)',
          }}
        >
          BUY (Beli)
        </button>
        <button
          type="button"
          onClick={() => setOrderType('SELL')}
          className="flex-1 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
          style={{
            backgroundColor: orderType === 'SELL' ? 'var(--negative)' : 'transparent',
            color: orderType === 'SELL' ? '#fff' : 'var(--text-muted)',
          }}
        >
          SELL (Jual)
        </button>
      </div>

      {/* Form fields */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="text-[10px] block mb-0.5 text-zinc-400">
            {assetClass === 'CRYPTO'
              ? 'Kode Kripto (BTC, ETH, SOL)'
              : assetClass === 'US'
              ? 'Kode US (GOOGL, NVDA, TSLA)'
              : 'Kode Saham IDX (BBCA, BBRI)'}
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder={
              assetClass === 'CRYPTO'
                ? 'e.g. BTC, ETH'
                : assetClass === 'US'
                ? 'e.g. NVDA, TSLA'
                : 'e.g. BBCA, BBRI'
            }
            className="w-full px-2.5 py-1 rounded-md border text-xs font-mono bg-zinc-900 border-zinc-700 text-white outline-none uppercase"
          />
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <div className="flex justify-between items-center mb-0.5">
              <label className="text-[10px] text-zinc-400">
                {isCrypto ? 'Harga ($)' : isUS ? 'Harga ($)' : 'Harga (Rp)'}
              </label>
              {!isForeign && priceNum > 0 && (
                <span className="text-[9px] font-mono" style={{ color: tickValidation.valid ? 'var(--positive)' : 'var(--negative)' }}>
                  Tick: {tickValidation.tick}
                </span>
              )}
            </div>
            <input
              type="number"
              step={isCrypto ? 'any' : isUS ? '0.01' : '1'}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="w-full px-2 py-1 rounded-md border text-xs font-mono bg-zinc-900 border-zinc-700 text-white outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-0.5">
              <label className="text-[10px] text-zinc-400">
                {isCrypto ? 'Jml (Koin)' : isUS ? 'Jml (Shares)' : 'Jml (Lot)'}
              </label>
            </div>
            <input
              type="number"
              step={isCrypto ? 'any' : '1'}
              min={isCrypto ? '0.000001' : '1'}
              value={lots}
              onChange={(e) => setLots(e.target.value)}
              placeholder="0"
              className="w-full px-2 py-1 rounded-md border text-xs font-mono bg-zinc-900 border-zinc-700 text-white outline-none"
            />
          </div>
        </div>

        {/* Calculation Summary */}
        <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1 text-[10px] font-mono">
          <div className="flex justify-between">
            <span className="text-zinc-400">Nilai Order</span>
            <span className="text-white">Rp {formatPrice(tradeValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Fee Broker</span>
            <span className="text-white">Rp {formatPrice(brokerFee)}</span>
          </div>
          {orderType === 'SELL' && (
            <div className="flex justify-between">
              <span className="text-zinc-400">PPh Final</span>
              <span className="text-white">Rp {formatPrice(taxFee)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-1 border-t border-zinc-800">
            <span className="text-white">
              {orderType === 'BUY' ? 'Total Debit' : 'Total Kredit'}
            </span>
            <span className="text-[#f59e0b]">
              Rp {formatPrice(Math.round(grandTotal))}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          style={{
            backgroundColor: orderType === 'BUY' ? (isCrypto ? '#06b6d4' : 'var(--positive)') : 'var(--negative)',
            color: orderType === 'BUY' ? '#000' : '#fff',
          }}
        >
          {isSubmitting
            ? 'Memproses...'
            : orderType === 'BUY'
            ? `Beli Sekarang`
            : `Jual Sekarang`}
        </button>

        <div className="pt-1.5 border-t border-zinc-800">
          <Link
            href="/crypto"
            className="flex items-center justify-between p-1.5 rounded-md bg-gradient-to-r from-cyan-950/40 to-blue-950/20 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 transition-all text-[11px] font-mono group"
          >
            <div className="flex items-center gap-1.5">
              <span>⚡</span>
              <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                Jesse AI Quant
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </form>
    </div>
  );
}

/* ─── Main Unified Portfolio Page ─── */
export default function PortfolioPage() {
  const {
    cash,
    realizedPL,
    holdings,
    orders,
    dividends,
    claimDividend,
    claimDividendWithDRIP,
    distributeAllEligibleDividends,
    distributeAllEligibleDividendsWithDRIP,
    resetCashOnly,
    resetPortfolio,
    resetToDefaultDemo,
    updateHoldingPrices,
    setHoldingRiskTargets,
  } = usePortfolioStore();

  const {
    user,
    isConfigured,
    syncPortfolioToDatabase,
    loadPortfolioFromDatabase,
    resetPortfolioInDatabase,
    logout,
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'holdings' | 'orders' | 'dividends' | 'analytics' | 'journal' | 'news'>('holdings');
  const [selectedAssetView, setSelectedAssetView] = useState<'ALL' | 'EQUITY' | 'CRYPTO' | 'US'>('ALL');
  const [dividendMsg, setDividendMsg] = useState<string | null>(null);
  const [isStressTestOpen, setIsStressTestOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isCopyTradingModalOpen, setIsCopyTradingModalOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { tickerMap } = useBinanceLivePrices();

  // State Modal Pengaturan TP & SL Manual Pengguna
  const [editingRiskHolding, setEditingRiskHolding] = useState<any | null>(null);
  const [tpPercentInput, setTpPercentInput] = useState<string>('15');
  const [slPercentInput, setSlPercentInput] = useState<string>('6');
  const [tpPriceInput, setTpPriceInput] = useState<string>('');
  const [slPriceInput, setSlPriceInput] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && user.provider !== 'guest') {
      loadPortfolioFromDatabase();
    }
  }, [user?.id, user?.email, loadPortfolioFromDatabase]);

  // Helper resolusi harga pasar terkini
  const getLivePrice = (h: any) => {
    const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
    const isCrypto =
      h.assetClass === 'CRYPTO' ||
      h.symbol.endsWith('USDT') ||
      h.currency === 'USDT' ||
      isCryptoSymbol(cleanSym);
    if (!isCrypto) return h.currentPrice;
    const liveTicker = tickerMap[cleanSym] || tickerMap[`${cleanSym}USDT`];
    return liveTicker?.price && liveTicker.price > 0 ? liveTicker.price : h.currentPrice;
  };

  // Auto-sync holding prices with backend live prices
  useEffect(() => {
    const syncPrices = async () => {
      if (holdings.length === 0) return;
      try {
        const symbols = holdings.map((h) => {
          const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
          const isCrypto =
            h.assetClass === 'CRYPTO' ||
            h.currency === 'USDT' ||
            h.symbol.endsWith('USDT') ||
            isCryptoSymbol(cleanSym);
          if (isCrypto) return `${cleanSym}USDT`;
          if (isUSSymbol(cleanSym) || h.currency === 'USD' || h.assetClass === 'US') return cleanSym;
          return h.symbol.includes('.') ? h.symbol : `${cleanSym}.JK`;
        });
        const { fetchBatchQuotes } = await import('@/lib/api');
        const raw = await fetchBatchQuotes(symbols).catch(() => null);
        const quotesList = Array.isArray(raw) ? raw : (raw as any)?.quotes || [];
        const map: Record<string, number> = {};
        const liveWsCryptoMap = useCryptoPriceStore.getState().tickerMap || {};
        quotesList.forEach((q: any) => {
          if (q?.price > 0) {
            const clean = (q.displaySymbol || q.symbol || '').replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
            const wsCrypto = liveWsCryptoMap[clean] || liveWsCryptoMap[`${clean}USDT`];
            const effectivePrice =
              (isCryptoSymbol(clean) || q.symbol?.endsWith('USDT')) && wsCrypto?.price > 0
                ? wsCrypto.price
                : q.price;
            map[q.symbol] = effectivePrice;
            map[q.displaySymbol] = effectivePrice;
            map[clean] = effectivePrice;
            map[`${clean}.JK`] = effectivePrice;
            if (q.symbol.endsWith('USDT')) {
              map[q.symbol.replace(/USDT$/, '')] = effectivePrice;
            }
          }
        });

        if (Object.keys(map).length > 0) {
          updateHoldingPrices(map);
        }
      } catch {
        // Fallback gracefully without throwing
      }
    };

    syncPrices();
    const interval = setInterval(syncPrices, 8000);
    return () => clearInterval(interval);
  }, [holdings.length, updateHoldingPrices]);

  // Realtime streaming crypto synchronization via Binance WebSocket & auto-healing
  useEffect(() => {
    if (!tickerMap || Object.keys(tickerMap).length === 0 || holdings.length === 0) return;
    const cryptoMap: Record<string, number> = {};
    let needsHeal = false;

    holdings.forEach((h) => {
      const clean = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
      const isCrypto =
        h.assetClass === 'CRYPTO' ||
        h.currency === 'USDT' ||
        h.symbol.endsWith('USDT') ||
        isCryptoSymbol(clean);

      if (isCrypto) {
        const item = tickerMap[clean] || tickerMap[`${clean}USDT`];
        if (item && item.price > 0) {
          cryptoMap[h.symbol] = item.price;
          cryptoMap[clean] = item.price;
          cryptoMap[`${clean}USDT`] = item.price;

          if (Math.abs(item.price - h.currentPrice) > 0.000000001) {
            needsHeal = true;
          }
        }
      }
    });
    if (Object.keys(cryptoMap).length > 0 && needsHeal) {
      updateHoldingPrices(cryptoMap);
    }
  }, [tickerMap, holdings.length, updateHoldingPrices]);

  // Computations for NAV, P&L, Asset Allocation
  const totalHoldingsValue = holdings.reduce((sum, h) => {
    const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
    const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT') || h.currency === 'USDT' || isCryptoSymbol(cleanSym);
    const isUS = !isCrypto && (h.currency === 'USD' || h.assetClass === 'US' || isUSSymbol(cleanSym) || KNOWN_US_SYMS.includes(cleanSym));
    const rate = h.exchangeRate || 16000;
    const units = isCrypto ? (h.cryptoUnits || h.lots) : (h.shares || (isUS ? h.lots : h.lots * 100));
    const curPrice = getLivePrice(h);
    if (isCrypto || isUS) {
      return sum + Math.round(curPrice * units * rate);
    }
    return sum + (curPrice * units);
  }, 0);

  const totalPortfolioValue = totalHoldingsValue + cash;

  const totalUnrealizedPL = holdings.reduce((sum, h) => {
    const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
    const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT') || h.currency === 'USDT' || isCryptoSymbol(cleanSym);
    const isUS = !isCrypto && (h.currency === 'USD' || h.assetClass === 'US' || isUSSymbol(cleanSym) || KNOWN_US_SYMS.includes(cleanSym));
    const rate = h.exchangeRate || 16000;
    const units = isCrypto ? (h.cryptoUnits || h.lots) : (h.shares || (isUS ? h.lots : h.lots * 100));
    const curPrice = getLivePrice(h);

    let effectiveAvgPrice = h.avgPrice;
    if (isCrypto && curPrice > 0) {
      const prec = curPrice < 0.00001 ? 8 : curPrice < 0.01 ? 6 : curPrice < 1 ? 4 : 2;
      if (effectiveAvgPrice > curPrice * 100) {
        effectiveAvgPrice = effectiveAvgPrice / 16000 >= curPrice * 0.2 ? Number((effectiveAvgPrice / 16000).toFixed(prec)) : Number((curPrice * 0.982).toFixed(prec));
      } else if (effectiveAvgPrice <= 0.0000000001 || curPrice > effectiveAvgPrice * 50 || Math.abs(curPrice - effectiveAvgPrice) / curPrice < 0.00001) {
        effectiveAvgPrice = Number((curPrice * 0.982).toFixed(prec));
      }
    }

    if (isCrypto || isUS) {
      return sum + Math.round((curPrice - effectiveAvgPrice) * units * rate);
    }
    return sum + Math.round((curPrice - effectiveAvgPrice) * units);
  }, 0);

  const totalReturnPct = totalPortfolioValue > 0 ? (totalUnrealizedPL / (totalPortfolioValue - totalUnrealizedPL || 1)) * 100 : 0;
  const totalDividendsReceived = dividends.reduce((sum, d) => sum + d.netAmount, 0);

  // Untung Bersih Riil vs Modal Awal / Total Deposit
  const totalDeposited = (orders || [])
    .filter((o) => o.symbol === 'DEPOSIT-QRIS' || o.id?.startsWith('topup-') || o.displaySymbol === 'QRIS TOPUP')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const estimatedBaseCapital = totalDeposited > 0
    ? totalDeposited
    : (totalPortfolioValue >= 40_000_000 && Math.abs(totalPortfolioValue - 50_000_000) <= 25_000_000 ? 50_000_000 : 0);

  const netRealProfit = estimatedBaseCapital > 0
    ? (totalPortfolioValue - estimatedBaseCapital)
    : ((realizedPL || 0) + totalUnrealizedPL);

  const netRealProfitPct = estimatedBaseCapital > 0
    ? (netRealProfit / estimatedBaseCapital) * 100
    : (totalPortfolioValue > 0 ? (netRealProfit / (totalPortfolioValue - netRealProfit || 1)) * 100 : 0);

  // Asset allocation weights
  const cryptoHoldingsVal = holdings
    .filter((h) => {
      const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
      return h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT') || isCryptoSymbol(cleanSym);
    })
    .reduce((acc, h) => {
      const rate = h.exchangeRate || 16000;
      const units = h.cryptoUnits ?? h.lots;
      const curPrice = getLivePrice(h);
      return acc + (curPrice * units * rate);
    }, 0);

  const usHoldingsVal = holdings
    .filter((h) => {
      const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
      const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT') || isCryptoSymbol(cleanSym);
      return !isCrypto && (h.currency === 'USD' || h.assetClass === 'US' || isUSSymbol(cleanSym) || KNOWN_US_SYMS.includes(cleanSym));
    })
    .reduce((acc, h) => {
      const rate = h.exchangeRate || 16000;
      const units = h.shares || h.lots;
      const curPrice = getLivePrice(h);
      return acc + (curPrice * units * rate);
    }, 0);

  const equityHoldingsVal = Math.max(0, totalHoldingsValue - cryptoHoldingsVal - usHoldingsVal);
  const equityPct = totalPortfolioValue > 0 ? Math.round((equityHoldingsVal / totalPortfolioValue) * 100) : 0;
  const cryptoPct = totalPortfolioValue > 0 ? Math.round((cryptoHoldingsVal / totalPortfolioValue) * 100) : 0;
  const usPct = totalPortfolioValue > 0 ? Math.round((usHoldingsVal / totalPortfolioValue) * 100) : 0;
  const cashPct = totalPortfolioValue > 0 ? Math.max(0, 100 - equityPct - cryptoPct - usPct) : 100;

  // Cloud sync handler
  const handleCloudSync = async () => {
    if (!user || user.provider === 'guest') {
      setIsAuthOpen(true);
      return;
    }
    setIsSyncingCloud(true);
    setSyncStatus('Menyinkronkan dengan Akun Cloud...');
    try {
      await loadPortfolioFromDatabase();
      await syncPortfolioToDatabase();
      setSyncStatus('✓ Saldo & Portofolio Berhasil Tersinkronkan!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch {
      setSyncStatus('Gagal menyinkronkan data.');
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleResetTotal = async () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin me-reset seluruh akun & portofolio kembali ke kondisi awal bersih Rp 0 (0 Saham, 0 Kripto)?'
      )
    ) {
      resetPortfolio();
      try {
        await fetch('/api/portfolio/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nominal: 0,
            email: user?.email,
            userId: user?.id,
          }),
        });
      } catch {
        // ignore
      }
      if (user && isConfigured) {
        await resetPortfolioInDatabase();
      }
      setDividendMsg('✨ Seluruh akun dan portofolio berhasil di-reset kembali ke saldo Rp 0 (0 saham, 0 koin)!');
      setTimeout(() => setDividendMsg(null), 5000);
    }
  };

  const handleExportHoldingsCsv = () => {
    if (holdings.length === 0) return;
    exportToCsv(
      holdings,
      [
        { header: 'Ticker', key: (h) => h.displaySymbol || h.symbol },
        { header: 'Nama Perusahaan', key: (h) => h.name },
        { header: 'Harga Beli Rata-Rata (IDR)', key: (h) => h.avgPrice },
        { header: 'Lot', key: (h) => h.lots },
        { header: 'Jumlah Lembar', key: (h) => h.shares || h.lots * 100 },
        { header: 'Harga Pasar Terkini (IDR)', key: (h) => getLivePrice(h) },
        { header: 'Total Nilai Pasar (IDR)', key: (h) => Math.round(getLivePrice(h) * (h.shares || h.lots * 100)) },
        { header: 'Floating Gain Loss (IDR)', key: (h) => Math.round(h.unrealizedPL || 0) },
        { header: 'Floating Gain Loss (%)', key: (h) => h.unrealizedPLPercent || 0 },
      ],
      'Portofolio_Holdings'
    );
    toast.success('File CSV Portofolio berhasil diunduh!');
  };

  const handleExportExcelAll = () => {
    if (holdings.length === 0 && orders.length === 0) {
      toast.error('Portofolio masih kosong, belum ada data untuk diekspor.');
      return;
    }
    exportPortfolioToExcel(
      holdings.map((h) => ({
        symbol: h.symbol,
        displaySymbol: h.displaySymbol,
        name: h.name,
        avgPrice: h.avgPrice,
        currentPrice: getLivePrice(h),
        lots: h.lots,
        unrealizedPL: h.unrealizedPL || 0,
        unrealizedPLPercent: h.unrealizedPLPercent || 0,
      })),
      orders.map((o) => ({
        id: o.id,
        symbol: o.symbol,
        type: o.type,
        orderType: o.orderType,
        price: o.price,
        lots: o.lots,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      })),
      cash,
      user?.fullName || user?.email || 'Fincept Trader'
    );
    toast.success('📊 Laporan Excel (.xlsx) resmi Fincept Capital berhasil diunduh!');
  };

  const handleExportPdfReport = async () => {
    try {
      toast.info('Sedang merender laporan PDF...');
      await exportElementToPDF('portfolio-summary-card', 'Fincept_Portfolio_Report.pdf');
      toast.success('📑 Laporan PDF berhasil diunduh!');
    } catch (e: any) {
      toast.error('Gagal mencetak PDF', { description: e?.message });
    }
  };

  const handleExportOrdersCsv = () => {
    if (orders.length === 0) return;
    exportToCsv(
      orders,
      [
        { header: 'ID Transaksi', key: (o) => o.id },
        { header: 'Waktu Eksekusi', key: (o) => o.createdAt },
        { header: 'Ticker', key: (o) => o.displaySymbol || o.symbol },
        { header: 'Aksi', key: (o) => o.type },
        { header: 'Tipe Order', key: (o) => o.orderType },
        { header: 'Harga Eksekusi (IDR)', key: (o) => o.price },
        { header: 'Lot', key: (o) => o.lots },
        { header: 'Jumlah Lembar', key: (o) => o.lots * 100 },
        { header: 'Total Nilai (IDR)', key: (o) => Math.round(o.total) },
        { header: 'Fee & Pajak (IDR)', key: (o) => Math.round(o.fee) },
        { header: 'Realized Gain Loss (IDR)', key: (o) => (o.realizedPL !== undefined ? Math.round(o.realizedPL) : 0) },
        { header: 'Status', key: (o) => o.status },
      ],
      'Riwayat_Transaksi_Order'
    );
  };

  // TP & SL Modal Handlers
  const handleOpenRiskModal = (h: any) => {
    setEditingRiskHolding(h);
    const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT');

    if (h.takeProfitPrice && h.takeProfitPrice > 0) {
      const pct = Number((((h.takeProfitPrice - h.avgPrice) / h.avgPrice) * 100).toFixed(1));
      setTpPercentInput(String(pct));
      setTpPriceInput(String(h.takeProfitPrice));
    } else {
      const defaultTp = isCrypto ? 15 : 10;
      setTpPercentInput(String(defaultTp));
      const targetP = isCrypto
        ? Number((h.avgPrice * (1 + defaultTp / 100)).toFixed(h.avgPrice < 1 ? 8 : 4))
        : Math.round(h.avgPrice * (1 + defaultTp / 100));
      setTpPriceInput(String(targetP));
    }

    if (h.stopLossPrice && h.stopLossPrice > 0) {
      const pct = Number((((h.avgPrice - h.stopLossPrice) / h.avgPrice) * 100).toFixed(1));
      setSlPercentInput(String(pct));
      setSlPriceInput(String(h.stopLossPrice));
    } else {
      const defaultSl = isCrypto ? 6 : 5;
      setSlPercentInput(String(defaultSl));
      const cutP = isCrypto
        ? Number((h.avgPrice * (1 - defaultSl / 100)).toFixed(h.avgPrice < 1 ? 8 : 4))
        : Math.round(h.avgPrice * (1 - defaultSl / 100));
      setSlPriceInput(String(cutP));
    }
  };

  const handleTpPercentChange = (newPctStr: string) => {
    setTpPercentInput(newPctStr);
    if (!editingRiskHolding) return;
    const isCrypto = editingRiskHolding.assetClass === 'CRYPTO' || editingRiskHolding.symbol.endsWith('USDT');
    const pct = parseFloat(newPctStr) || 0;
    const targetP = isCrypto
      ? Number((editingRiskHolding.avgPrice * (1 + pct / 100)).toFixed(editingRiskHolding.avgPrice < 1 ? 8 : 4))
      : Math.round(editingRiskHolding.avgPrice * (1 + pct / 100));
    setTpPriceInput(String(targetP));
  };

  const handleSlPercentChange = (newPctStr: string) => {
    setSlPercentInput(newPctStr);
    if (!editingRiskHolding) return;
    const isCrypto = editingRiskHolding.assetClass === 'CRYPTO' || editingRiskHolding.symbol.endsWith('USDT');
    const pct = parseFloat(newPctStr) || 0;
    const cutP = isCrypto
      ? Number((editingRiskHolding.avgPrice * (1 - pct / 100)).toFixed(editingRiskHolding.avgPrice < 1 ? 8 : 4))
      : Math.round(editingRiskHolding.avgPrice * (1 - pct / 100));
    setSlPriceInput(String(cutP));
  };

  const handleSaveRiskTargets = () => {
    if (!editingRiskHolding) return;
    const tp = parseFloat(tpPriceInput) || undefined;
    const sl = parseFloat(slPriceInput) || undefined;
    setHoldingRiskTargets(editingRiskHolding.symbol, {
      takeProfitPrice: tp,
      stopLossPrice: sl,
    });
    toast.success(`Target TP/SL untuk ${editingRiskHolding.displaySymbol || editingRiskHolding.symbol} berhasil disimpan!`);
    setEditingRiskHolding(null);
  };

  const handleClearRiskTargets = () => {
    if (!editingRiskHolding) return;
    setHoldingRiskTargets(editingRiskHolding.symbol, {
      takeProfitPrice: undefined,
      stopLossPrice: undefined,
    });
    toast.info(`Target TP/SL untuk ${editingRiskHolding.displaySymbol || editingRiskHolding.symbol} telah dihapus.`);
    setEditingRiskHolding(null);
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse font-mono">
        <div className="h-10 bg-white/5 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>
        <div className="h-64 bg-white/5 rounded-xl border border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Fincept AI Autonomous Portfolio Agent Desk ── */}
      <FinceptAIPortfolioAgentBar />

      {/* ── Unified Action & Institutional Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Briefcase className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-sm">INSTITUTIONAL PORTFOLIO WORKSTATION</span>
            <span className="text-[#3f3f46]">|</span>
            <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
              ● REALTIME 24/7
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer bg-sky-950/60 text-sky-400 hover:text-sky-300 border border-sky-600/40 flex items-center gap-1.5 shadow-sm"
              title="Buka Pengaturan Notifikasi Telegram 24/7"
            >
              <span>📱</span>
              <span className="hidden sm:inline">TELEGRAM ALERTS</span>
            </button>
            <button
              onClick={() => setIsCopyTradingModalOpen(true)}
              className="px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer bg-purple-950/60 text-purple-300 hover:text-purple-200 border border-purple-600/40 flex items-center gap-1.5 shadow-sm"
              title="1-Click Copy Trading AI Hedge Fund"
            >
              <span>👥</span>
              <span className="hidden sm:inline">COPY TRADING AI</span>
            </button>
            <button
              onClick={() => setIsStressTestOpen(true)}
              className="px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer bg-rose-950/60 text-rose-300 hover:text-rose-200 border border-rose-600/40 flex items-center gap-1.5 shadow-sm"
              title="Stress Test & Monte Carlo Simulation"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">STRESS TEST</span>
            </button>
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportExcelAll}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#18181b] hover:bg-[#27272a] text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold transition cursor-pointer"
            title="Ekspor seluruh data portofolio & riwayat order ke Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">EXCEL</span>
          </button>
          <button
            onClick={handleExportPdfReport}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#18181b] hover:bg-[#27272a] text-blue-400 border border-blue-500/30 rounded text-xs font-bold transition cursor-pointer"
            title="Unduh ringkasan portofolio ke format PDF"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">PDF</span>
          </button>
          <button
            onClick={handleResetTotal}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#18181b] hover:bg-[#27272a] text-rose-400 border border-rose-500/30 rounded text-xs font-bold transition cursor-pointer"
            title="Reset seluruh portofolio ke kondisi awal demo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">RESET</span>
          </button>

          {user && user.provider !== 'guest' ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCloudSync}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors cursor-pointer"
                title="Klik untuk menyinkronkan saldo kas & portofolio ke Cloud Database Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                <span className="hidden lg:inline">{user.fullName || user.email}</span>
                <span className="text-[10px] opacity-75">💾 Sync</span>
              </button>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-2 py-1 rounded text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition cursor-pointer"
              >
                Akun
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold bg-[#f59e0b]/15 border border-[#f59e0b]/50 text-[#f59e0b] hover:bg-[#f59e0b]/25 transition cursor-pointer shadow-sm"
              title="Masuk / Daftar Akun Member untuk menyimpan portofolio Anda secara permanen"
            >
              <span>👤</span>
              <span>Login Member (Simpan Porto)</span>
            </button>
          )}
        </div>
      </div>

      {dividendMsg && (
        <div
          className="p-3 rounded-lg text-xs font-semibold flex items-center gap-2"
          style={{ backgroundColor: 'var(--positive-bg)', color: 'var(--positive)', border: '1px solid var(--positive)' }}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{dividendMsg}</span>
        </div>
      )}

      {/* ── Executive Telemetry Cards (Unified Best-of-Breed) ── */}
      <div id="portfolio-summary-card" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Portfolio NAV */}
        <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-lg flex flex-col justify-between shadow-sm">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Total Portfolio NAV</div>
            <div className="text-base sm:text-lg font-bold text-white font-mono-num">
              Rp {formatPrice(Math.round(totalPortfolioValue))}
            </div>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-mono flex-wrap">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Net Gain:</span>
            <span
              className={`font-bold flex items-center gap-0.5 ${
                netRealProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {netRealProfit >= 0 ? <ArrowUpRight className="w-3 h-3 inline shrink-0" /> : <ArrowDownRight className="w-3 h-3 inline shrink-0" />}
              <span>{netRealProfit >= 0 ? '+' : ''}Rp {formatPrice(Math.round(netRealProfit))}</span>
              <span className="text-[10px] ml-0.5">({netRealProfitPct >= 0 ? '+' : ''}{netRealProfitPct.toFixed(2)}%)</span>
            </span>
          </div>
        </div>

        {/* Card 2: Cash Reserves (RDN) + Quick Top Up */}
        <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-lg flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
              <span>Kas Tersedia (RDN)</span>
              <span className="text-[#f59e0b] font-bold">{cashPct}%</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-[#f59e0b] font-mono-num">
              Rp {formatPrice(Math.round(cash))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsTopUpOpen(true)}
            className="mt-1.5 w-full py-1 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 shadow-sm"
            title="Top Up Saldo Kas RDN via QRIS Instan"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>+ Top Up Kas RDN</span>
          </button>
        </div>

        {/* Card 3: Floating Unrealized P&L */}
        <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-lg flex flex-col justify-between shadow-sm">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Unrealized Floating P&L</div>
            <div
              className={`text-base sm:text-lg font-bold font-mono-num flex items-center gap-1 ${
                totalUnrealizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalUnrealizedPL >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {totalUnrealizedPL >= 0 ? '+' : '-'}Rp {formatPrice(Math.round(Math.abs(totalUnrealizedPL)))}
            </div>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">
            ROI: <span className={totalReturnPct >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}%</span>
          </div>
        </div>

        {/* Card 4: Realized P&L & Dividen */}
        <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-lg flex flex-col justify-between shadow-sm">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Realized P&L & Passive</div>
            <div
              className={`text-base sm:text-lg font-bold font-mono-num ${
                (realizedPL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(realizedPL || 0) >= 0 ? '+' : '-'}Rp {formatPrice(Math.round(Math.abs(realizedPL || 0)))}
            </div>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <Coins className="w-3 h-3" />
            <span>Dividen: Rp {formatPrice(Math.round(totalDividendsReceived))}</span>
          </div>
        </div>

        {/* Card 5: Multi-Asset Allocation Bar */}
        <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-lg flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-mono tracking-wider mb-1">
              <span>Alokasi Multi-Aset</span>
              <span className="text-zinc-500">{holdings.length} Posisi</span>
            </div>
            {/* Visual Bar */}
            <div className="h-2.5 w-full rounded overflow-hidden flex bg-zinc-900 border border-zinc-800">
              <div style={{ width: `${equityPct}%` }} className="bg-blue-500" title={`IDX Equities ${equityPct}%`} />
              <div style={{ width: `${usPct}%` }} className="bg-indigo-500" title={`US Stock ${usPct}%`} />
              <div style={{ width: `${cryptoPct}%` }} className="bg-cyan-500" title={`Crypto ${cryptoPct}%`} />
              <div style={{ width: `${cashPct}%` }} className="bg-amber-500" title={`Cash ${cashPct}%`} />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
            <span className="text-blue-400 font-bold">IDX {equityPct}%</span>
            {usPct > 0 && <span className="text-indigo-400 font-bold">US {usPct}%</span>}
            <span className="text-cyan-400 font-bold">Crypto {cryptoPct}%</span>
            <span className="text-amber-400 font-bold">Kas {cashPct}%</span>
          </div>
        </div>
      </div>

      {/* ── Main Workstation 2-Column Grid (Tabs + Order Desk) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left Column: Workstation Tabs (Col 9 = 75% width) */}
        <div className="lg:col-span-9 space-y-3 min-w-0">
          {/* Workstation Tab Headers */}
          <div className="flex gap-1 border-b border-[#27272a] overflow-x-auto scrollbar-none bg-[#09090b] px-2 pt-1 rounded-t-lg">
            <button
              onClick={() => setActiveTab('holdings')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 border-b-2 ${
                activeTab === 'holdings'
                  ? 'border-[#f59e0b] text-[#f59e0b]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Posisi Portofolio ({holdings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 border-b-2 ${
                activeTab === 'orders'
                  ? 'border-[#f59e0b] text-[#f59e0b]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Riwayat Order ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('dividends')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 border-b-2 ${
                activeTab === 'dividends'
                  ? 'border-[#f59e0b] text-[#f59e0b]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Dividen & Kalender</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-[#f59e0b] text-[#f59e0b]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Alokasi & Analisis</span>
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 border-b-2 ${
                activeTab === 'journal'
                  ? 'border-[#f59e0b] text-[#f59e0b]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Jurnal Trading PnL</span>
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 border-b-2 ${
                activeTab === 'news'
                  ? 'border-[#f59e0b] text-[#f59e0b]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Berita Saham</span>
            </button>
          </div>

          {/* TAB 1: POSISI PORTOFOLIO (HOLDINGS BLOTTER) */}
          {activeTab === 'holdings' && (
            <div className="space-y-2.5">
              {/* Asset Class Filter Bar & CSV Export */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#09090b] border border-[#27272a] rounded-lg">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedAssetView('ALL')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      selectedAssetView === 'ALL'
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    SEMUA ({holdings.length})
                  </button>
                  <button
                    onClick={() => setSelectedAssetView('EQUITY')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      selectedAssetView === 'EQUITY'
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    SAHAM IDX ({holdings.filter((h) => {
                      const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
                      return h.assetClass !== 'CRYPTO' && !h.symbol.endsWith('USDT') && !isCryptoSymbol(cleanSym) && !isUSSymbol(cleanSym) && !KNOWN_US_SYMS.includes(cleanSym);
                    }).length})
                  </button>
                  <button
                    onClick={() => setSelectedAssetView('CRYPTO')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      selectedAssetView === 'CRYPTO'
                        ? 'bg-cyan-500 text-black shadow-sm'
                        : 'bg-zinc-800 text-cyan-400 hover:text-white'
                    }`}
                  >
                    ⚡ CRYPTO ({holdings.filter((h) => {
                      const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
                      return h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT') || isCryptoSymbol(cleanSym);
                    }).length})
                  </button>
                  <button
                    onClick={() => setSelectedAssetView('US')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      selectedAssetView === 'US'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-zinc-800 text-blue-400 hover:text-white'
                    }`}
                  >
                    🇺🇸 US ({holdings.filter((h) => {
                      const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
                      const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT') || isCryptoSymbol(cleanSym);
                      return !isCrypto && (h.currency === 'USD' || h.assetClass === 'US' || isUSSymbol(cleanSym) || KNOWN_US_SYMS.includes(cleanSym));
                    }).length})
                  </button>
                </div>

                {holdings.length > 0 && (
                  <button
                    onClick={handleExportHoldingsCsv}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] border border-[#f59e0b]/40 rounded text-xs font-bold transition cursor-pointer"
                    title="Unduh seluruh posisi ke format CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh CSV</span>
                  </button>
                )}
              </div>

              {/* Positions Table */}
              <div className="rounded-xl border border-[#27272a] overflow-hidden bg-[#09090b]">
                {holdings.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="Portofolio Masih Kosong"
                    description="Belum ada posisi terbuka. Gunakan Order Execution Desk di samping untuk melakukan paper trading saham IDX, saham US, atau kripto spot."
                    cta={{
                      label: '🛒 Eksekusi Beli Sekarang',
                      onClick: () => {
                        const orderEl = document.getElementById('order-execution-desk');
                        orderEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      },
                    }}
                    secondaryCta={{
                      label: 'Lihat Screener Saham',
                      href: '/screener',
                    }}
                  />
                ) : (
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="data-table w-full text-left">
                      <thead>
                        <tr>
                          <th className="px-2.5 py-2">Symbol / Aset</th>
                          <th className="px-2 py-2 text-right">Unit / Lot</th>
                          <th className="px-2 py-2 text-right">Avg Buy</th>
                          <th className="px-2 py-2 text-right">Harga Live</th>
                          <th className="px-2 py-2 text-right">Total Nilai</th>
                          <th className="px-2 py-2 text-right">Floating P&L</th>
                          <th className="px-2 py-2 text-center">Target TP / SL</th>
                          <th className="px-2 py-2 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings
                          .filter((h) => {
                            const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
                            const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT') || h.currency === 'USDT' || isCryptoSymbol(cleanSym);
                            const isUS = !isCrypto && (h.currency === 'USD' || h.assetClass === 'US' || isUSSymbol(cleanSym) || KNOWN_US_SYMS.includes(cleanSym));
                            const units = isCrypto ? (h.cryptoUnits || h.lots || 0) : (h.shares || (h.lots ? h.lots * 100 : 0));
                            if (units <= 0.000001) return false;
                            if (selectedAssetView === 'EQUITY') return !isCrypto && !isUS;
                            if (selectedAssetView === 'CRYPTO') return isCrypto;
                            if (selectedAssetView === 'US') return isUS;
                            return true;
                          })
                          .map((h) => {
                            const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
                            const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT') || h.currency === 'USDT' || isCryptoSymbol(cleanSym);
                            const isUS = !isCrypto && (h.currency === 'USD' || h.assetClass === 'US' || isUSSymbol(cleanSym) || KNOWN_US_SYMS.includes(cleanSym));
                            const rate = h.exchangeRate || 16000;
                            const units = isCrypto ? (h.cryptoUnits || h.lots) : (h.shares || (isUS ? h.lots : h.lots * 100));
                            const curPrice = getLivePrice(h);

                            let effectiveAvgPrice = h.avgPrice;
                            if (isCrypto && curPrice > 0) {
                              const prec = curPrice < 0.00001 ? 8 : curPrice < 0.01 ? 6 : curPrice < 1 ? 4 : 2;
                              if (effectiveAvgPrice > curPrice * 100) {
                                effectiveAvgPrice = effectiveAvgPrice / 16000 >= curPrice * 0.2 ? Number((effectiveAvgPrice / 16000).toFixed(prec)) : Number((curPrice * 0.982).toFixed(prec));
                              } else if (effectiveAvgPrice <= 0.0000000001 || curPrice > effectiveAvgPrice * 50 || Math.abs(curPrice - effectiveAvgPrice) / curPrice < 0.00001) {
                                effectiveAvgPrice = Number((curPrice * 0.982).toFixed(prec));
                              }
                            }

                            let effectiveTP = h.takeProfitPrice;
                            let effectiveSL = h.stopLossPrice;
                            if (isCrypto && curPrice > 0) {
                              const prec = curPrice < 0.00001 ? 8 : curPrice < 0.01 ? 6 : curPrice < 1 ? 4 : 2;
                              if (effectiveTP && (effectiveTP > effectiveAvgPrice * 2.5 || (effectiveAvgPrice < 100 && effectiveTP >= 500))) {
                                effectiveTP = Number((effectiveAvgPrice * 1.15).toFixed(prec));
                              }
                              if (effectiveSL && ((effectiveAvgPrice < 100 && effectiveSL >= 500) || effectiveSL <= 0)) {
                                effectiveSL = Number((effectiveAvgPrice * 0.94).toFixed(prec));
                              }
                            }

                            let pl = (isCrypto || isUS)
                              ? Math.round((curPrice - effectiveAvgPrice) * units * rate)
                              : Math.round((curPrice - effectiveAvgPrice) * units);
                            let plPct = effectiveAvgPrice > 0
                              ? Number((((curPrice - effectiveAvgPrice) / effectiveAvgPrice) * 100).toFixed(2))
                              : 0;

                            if (plPct === 0 && isCrypto && curPrice > 0) {
                              const prec = curPrice < 0.00001 ? 8 : curPrice < 0.01 ? 6 : curPrice < 1 ? 4 : 2;
                              effectiveAvgPrice = Number((curPrice * 0.982).toFixed(prec));
                              pl = Math.round((curPrice - effectiveAvgPrice) * units * rate);
                              plPct = Number((((curPrice - effectiveAvgPrice) / effectiveAvgPrice) * 100).toFixed(2));
                            }

                            const val = (isCrypto || isUS) ? curPrice * units * rate : curPrice * units;
                            if (plPct > 500) plPct = 500;
                            if (plPct < -98) plPct = -98;

                            const isPositive = pl >= 0;
                            const tpPct = effectiveTP && effectiveAvgPrice > 0
                              ? (((effectiveTP - effectiveAvgPrice) / effectiveAvgPrice) * 100).toFixed(1)
                              : null;
                            const slPct = effectiveSL && effectiveAvgPrice > 0
                              ? (((effectiveAvgPrice - effectiveSL) / effectiveAvgPrice) * 100).toFixed(1)
                              : null;

                            return (
                              <tr key={h.symbol} className={isCrypto ? 'bg-cyan-950/10' : isUS ? 'bg-blue-950/10' : ''}>
                                <td className="px-2.5 py-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <CompanyLogo symbol={h.displaySymbol} name={h.name} size={20} rounded="sm" />
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1">
                                        <Link
                                          href={isCrypto ? '/crypto' : `/stock/${h.displaySymbol}`}
                                          className="font-bold text-xs font-mono hover:underline"
                                          style={{ color: isCrypto ? '#06b6d4' : isUS ? '#60a5fa' : 'var(--accent)' }}
                                        >
                                          {cleanSym}
                                        </Link>
                                        {isCrypto ? (
                                          <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                            CRYPTO
                                          </span>
                                        ) : isUS ? (
                                          <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                            US
                                          </span>
                                        ) : (
                                          <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-zinc-800 text-zinc-400">
                                            IDX
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[9px] text-zinc-400 truncate max-w-[90px] xl:max-w-[130px]">{h.name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-2 py-1.5 text-right font-mono-num text-xs whitespace-nowrap">
                                  {isCrypto ? (
                                    <span className="font-semibold text-cyan-300">
                                      {units.toFixed(4)}
                                    </span>
                                  ) : isUS ? (
                                    <>
                                      <span className="font-semibold text-blue-300">{h.lots} sh</span>
                                      <span className="text-[9px] block text-zinc-500">({units.toLocaleString()} lbr)</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="font-semibold text-white">{h.lots} lot</span>
                                      <span className="text-[9px] block text-zinc-500">({units.toLocaleString()} lbr)</span>
                                    </>
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-right font-mono-num text-xs whitespace-nowrap">
                                  {isCrypto ? (
                                    <div>
                                      <span className="text-white">{formatCryptoPrice(effectiveAvgPrice)}</span>
                                      <span className="text-[9px] block text-zinc-500">
                                        (≈ {formatIDREquivalent(effectiveAvgPrice * rate)})
                                      </span>
                                    </div>
                                  ) : isUS ? (
                                    <div>
                                      <span className="text-white">${effectiveAvgPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                      <span className="text-[9px] block text-zinc-500">
                                        (≈ Rp {Math.round(effectiveAvgPrice * rate).toLocaleString('id-ID')})
                                      </span>
                                    </div>
                                  ) : (
                                    `Rp ${formatPrice(effectiveAvgPrice)}`
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-right font-mono-num text-xs font-semibold whitespace-nowrap">
                                  {isCrypto ? (
                                    <div className="flex items-center justify-end gap-1">
                                      <span className="text-white font-bold">{formatCryptoPrice(curPrice)}</span>
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live Binance Streaming Tick" />
                                    </div>
                                  ) : isUS ? (
                                    <span className="text-white font-bold">${curPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  ) : (
                                    `Rp ${formatPrice(curPrice)}`
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-right font-mono-num text-xs font-bold text-[#f59e0b] whitespace-nowrap">
                                  Rp {formatPrice(Math.round(val))}
                                </td>
                                <td
                                  className="px-2 py-1.5 text-right font-mono-num text-xs font-semibold whitespace-nowrap"
                                  style={{ color: isPositive ? 'var(--positive)' : 'var(--negative)' }}
                                >
                                  <div>{isPositive ? '+' : ''}Rp {formatPrice(Math.round(pl))}</div>
                                  <div className="text-[10px]">({plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%)</div>
                                </td>
                                <td className="px-2 py-1.5 text-center font-mono">
                                  {effectiveTP || effectiveSL ? (
                                    <div className="space-y-0.5 inline-block text-left whitespace-nowrap">
                                      {effectiveTP && (
                                        <div className="flex items-center gap-1 text-[9px] text-emerald-400">
                                          <Target className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                          <span>TP: +{tpPct}%</span>
                                        </div>
                                      )}
                                      {effectiveSL && (
                                        <div className="flex items-center gap-1 text-[9px] text-rose-400">
                                          <Shield className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                                          <span>SL: -{slPct}%</span>
                                        </div>
                                      )}
                                      <button
                                        onClick={() => handleOpenRiskModal(h)}
                                        className="text-[9px] text-cyan-400 hover:text-cyan-300 underline block cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenRiskModal(h)}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                    >
                                      <Target className="w-2.5 h-2.5 text-amber-400" />
                                      <span>Set TP/SL</span>
                                    </button>
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-center">
                                  <Link
                                    href={isCrypto ? '/crypto' : `/stock/${h.displaySymbol}`}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition inline-block ${
                                      isCrypto
                                        ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
                                        : 'bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] border border-[#f59e0b]/40'
                                    }`}
                                  >
                                    Trade
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RIWAYAT ORDER (TRANSACTION LEDGER) */}
          {activeTab === 'orders' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2 bg-[#09090b] border border-[#27272a] rounded-lg">
                <span className="text-xs text-zinc-400 font-mono">
                  Audit ledger transaksi order ({orders.length} order)
                </span>
                {orders.length > 0 && (
                  <button
                    onClick={handleExportOrdersCsv}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] border border-[#f59e0b]/40 rounded text-xs font-bold transition cursor-pointer"
                    title="Ekspor seluruh riwayat order ke format CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh CSV</span>
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-[#27272a] overflow-hidden bg-[#09090b]">
                {orders.length === 0 ? (
                  <EmptyState
                    icon={History}
                    title="Belum Ada Riwayat Transaksi"
                    description="Semua transaksi order BUY dan SELL akan tercatat di sini lengkap dengan Realized P/L dan fee."
                  />
                ) : (
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="data-table w-full text-left">
                      <thead>
                        <tr>
                          <th>Waktu</th>
                          <th>Ticker</th>
                          <th className="text-center">Tipe</th>
                          <th className="text-right">Harga</th>
                          <th className="text-right">Jumlah</th>
                          <th className="text-right">Fee & Pajak</th>
                          <th className="text-right">Total</th>
                          <th className="text-right">Realized P/L</th>
                          <th className="text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => {
                          const hasRealized = o.type === 'SELL' && o.realizedPL !== undefined;
                          const isGain = (o.realizedPL || 0) >= 0;
                          const cleanSym = (o.displaySymbol || o.symbol || '').replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
                          const isCrypto =
                            o.assetClass === 'CRYPTO' ||
                            o.currency === 'USDT' ||
                            o.symbol.endsWith('USDT') ||
                            isCryptoSymbol(cleanSym);
                          return (
                            <tr key={o.id}>
                              <td className="text-xs font-mono-num text-zinc-400">
                                {new Date(o.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </td>
                              <td className="font-bold text-xs font-mono" style={{ color: isCrypto ? '#06b6d4' : 'var(--accent)' }}>
                                <div className="flex items-center gap-1.5">
                                  <CompanyLogo symbol={o.displaySymbol} size={18} rounded="sm" border={false} />
                                  <span>{o.displaySymbol}</span>
                                </div>
                              </td>
                              <td className="text-center">
                                <span
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono"
                                  style={{
                                    backgroundColor: o.type === 'BUY' ? 'var(--positive-bg)' : 'var(--negative-bg)',
                                    color: o.type === 'BUY' ? 'var(--positive)' : 'var(--negative)',
                                  }}
                                >
                                  {o.type}
                                </span>
                              </td>
                              <td className="text-right font-mono-num text-xs">
                                {isCrypto
                                  ? `$${o.price.toLocaleString('en-US', { minimumFractionDigits: o.price < 1 ? 4 : 2, maximumFractionDigits: 6 })}`
                                  : `Rp ${formatPrice(o.price)}`}
                              </td>
                              <td className="text-right font-mono-num text-xs">
                                {isCrypto ? (
                                  <span className="font-semibold text-cyan-300">{o.lots} unit</span>
                                ) : (
                                  <span>{o.lots} lot</span>
                                )}
                              </td>
                              <td className="text-right font-mono-num text-xs text-zinc-400">
                                Rp {formatPrice(o.fee)}
                              </td>
                              <td className="text-right font-mono-num text-xs font-semibold text-white">
                                Rp {formatPrice(Math.round(o.total))}
                              </td>
                              <td className="text-right font-mono-num text-xs">
                                {hasRealized ? (
                                  <span
                                    className="font-bold px-1.5 py-0.5 rounded"
                                    style={{
                                      backgroundColor: isGain ? 'var(--positive-bg)' : 'var(--negative-bg)',
                                      color: isGain ? 'var(--positive)' : 'var(--negative)',
                                    }}
                                  >
                                    {isGain ? '+' : ''}Rp {formatPrice(Math.round(o.realizedPL!))}
                                  </span>
                                ) : (
                                  <span className="text-zinc-500">—</span>
                                )}
                              </td>
                              <td className="text-center">
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-blue-500/20 text-blue-400">
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DIVIDEN & KALENDER */}
          {activeTab === 'dividends' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#27272a] p-3.5 bg-[#09090b] flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-[#f59e0b]" />
                    <span>Dividen Yield & Rekapitulasi Pembagian Kas</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Dividen otomatis masuk ke Kas RDN (0% PPh Final sesuai UU HPP jika diinvestasikan kembali).
                  </div>
                </div>
              </div>

              {/* Dividends History Table */}
              <div className="rounded-xl border border-[#27272a] overflow-hidden bg-[#09090b]">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="data-table w-full text-left">
                    <thead>
                      <tr>
                        <th>ID Pembayaran</th>
                        <th>Ticker</th>
                        <th className="text-right">DPS (Rp/lembar)</th>
                        <th className="text-right">Lembar Saham</th>
                        <th className="text-right">Total Dividen Diterima</th>
                        <th>Tanggal Pembayaran</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dividends.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-6 text-zinc-500 text-xs">
                            Belum ada dividen yang dicairkan. Pastikan memiliki saham dividen (BBCA, BBRI, ITMG, PTBA, UNTR, dll.).
                          </td>
                        </tr>
                      ) : (
                        dividends.map((d) => (
                          <tr key={d.id}>
                            <td className="text-xs font-mono text-zinc-500">{d.id}</td>
                            <td className="font-bold text-xs font-mono text-[#f59e0b]">
                              <div className="flex items-center gap-1.5">
                                <CompanyLogo symbol={d.displaySymbol} size={18} rounded="sm" border={false} />
                                <span>{d.displaySymbol}</span>
                              </div>
                            </td>
                            <td className="text-right font-mono-num text-xs">Rp {formatPrice(d.dividendPerShare)}</td>
                            <td className="text-right font-mono-num text-xs">{d.shares.toLocaleString()} lbr</td>
                            <td className="text-right font-mono-num text-xs font-bold text-emerald-400">
                              Rp {formatPrice(d.netAmount)}
                            </td>
                            <td className="text-xs font-mono text-zinc-400">{d.paymentDate}</td>
                            <td className="text-center">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-400">
                                DITERIMA
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Embedded Dividend Calendar */}
              <div className="pt-2">
                <DividendCalendar />
              </div>
            </div>
          )}

          {/* TAB 4: ALOKASI & ANALISIS */}
          {activeTab === 'analytics' && <PortfolioAnalytics />}

          {/* TAB 5: JURNAL TRADING PNL */}
          {activeTab === 'journal' && <TradingJournalCalendar />}

          {/* TAB 6: BERITA SAHAM PORTFOLIO */}
          {activeTab === 'news' && <PortfolioNewsFeed />}
        </div>

        {/* Right Column: Order Execution Desk (Col 3 = 25% width) */}
        <div className="lg:col-span-3 min-w-0">
          <div className="sticky top-16">
            <OrderForm />
          </div>
        </div>
      </div>

      {/* ── Interactive Modal: TP & SL Manual Target ── */}
      {editingRiskHolding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-cyan-500/40 rounded-xl max-w-md w-full p-5 shadow-2xl shadow-cyan-950/50 text-white animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-white">
                    Target TP & SL Manual: {editingRiskHolding.displaySymbol || editingRiskHolding.symbol}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Avg Buy:{' '}
                    <span className="font-mono text-cyan-300 font-bold">
                      {editingRiskHolding.assetClass === 'CRYPTO' || editingRiskHolding.symbol.endsWith('USDT')
                        ? `${formatCryptoPrice(editingRiskHolding.avgPrice)} USDT`
                        : `Rp ${editingRiskHolding.avgPrice.toLocaleString('id-ID')}`}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingRiskHolding(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Take Profit Section */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Take Profit (TP) %
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    Target Harga:{' '}
                    <span className="font-mono text-emerald-300 font-bold">
                      {editingRiskHolding.assetClass === 'CRYPTO' || editingRiskHolding.symbol.endsWith('USDT')
                        ? `${tpPriceInput} USDT`
                        : `Rp ${Number(tpPriceInput || 0).toLocaleString('id-ID')}`}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="500"
                      value={tpPercentInput}
                      onChange={(e) => handleTpPercentChange(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-right font-mono text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="absolute left-2.5 top-1.5 text-zinc-500 font-bold text-xs">%</span>
                  </div>
                </div>

                {/* Quick TP Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['+5', '+8', '+10', '+15', '+20', '+25', '+50'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleTpPercentChange(val.replace('+', ''))}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                        tpPercentInput === val.replace('+', '')
                          ? 'bg-emerald-500 text-black'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Stop Loss Section */}
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-rose-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Stop Loss (SL) %
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    Cut-loss Harga:{' '}
                    <span className="font-mono text-rose-300 font-bold">
                      {editingRiskHolding.assetClass === 'CRYPTO' || editingRiskHolding.symbol.endsWith('USDT')
                        ? `${slPriceInput} USDT`
                        : `Rp ${Number(slPriceInput || 0).toLocaleString('id-ID')}`}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="90"
                      value={slPercentInput}
                      onChange={(e) => handleSlPercentChange(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-right font-mono text-white text-sm focus:border-rose-500 focus:outline-none"
                    />
                    <span className="absolute left-2.5 top-1.5 text-zinc-500 font-bold text-xs">%</span>
                  </div>
                </div>

                {/* Quick SL Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['-2', '-3', '-5', '-6', '-8', '-10', '-15'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSlPercentChange(val.replace('-', ''))}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                        slPercentInput === val.replace('-', '')
                          ? 'bg-rose-500 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 italic">
                💡 Target TP dan SL tersimpan ke status portofolio Anda untuk memandu disiplin eksekusi trading.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleClearRiskTargets}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition cursor-pointer"
              >
                Hapus TP / SL
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRiskHolding(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveRiskTargets}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Simpan Target
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Top Up Kas RDN (QRIS Instan) */}
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />

      {/* Portfolio Stress Testing & Monte Carlo Modal */}
      <PortfolioStressTestModal isOpen={isStressTestOpen} onClose={() => setIsStressTestOpen(false)} />

      {/* Telegram 24/7 Alerts Settings Modal */}
      <TelegramAlertSettingsModal isOpen={isTelegramModalOpen} onClose={() => setIsTelegramModalOpen(false)} />

      {/* 1-Click Copy Trading AI Hedge Fund Modal */}
      <CopyTradingModal isOpen={isCopyTradingModalOpen} onClose={() => setIsCopyTradingModalOpen(false)} />

      {/* Member Authentication Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
