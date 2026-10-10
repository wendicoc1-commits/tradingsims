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
  Gift,
  Landmark,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Calendar,
  BarChart3,
  ShieldAlert,
  Download,
  Newspaper,
} from 'lucide-react';
import { usePortfolioStore, KNOWN_DIVIDENDS } from '@/store';
import { calculateShares, isValidIDXTick } from '@/lib/stockRules';
import { exportToCsv } from '@/lib/exportCsv';
import DividendCalendar from '@/components/dividend/DividendCalendar';
import PortfolioAnalytics from '@/components/portfolio/PortfolioAnalytics';
import PortfolioNewsFeed from '@/components/portfolio/PortfolioNewsFeed';
import PortfolioStressTestModal from '@/components/portfolio/PortfolioStressTestModal';
import InstitutionalPortfolioDesk from '@/components/portfolio/InstitutionalPortfolioDesk';
import FinceptAIPortfolioAgentBar from '@/components/portfolio/FinceptAIPortfolioAgentBar';
import TradingJournalCalendar from '@/components/portfolio/TradingJournalCalendar';
import TelegramAlertSettingsModal from '@/components/portfolio/TelegramAlertSettingsModal';
import CopyTradingModal from '@/components/portfolio/CopyTradingModal';
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

/* ─── Order Form (Paper Trading Engine - Saham IDX, Saham US, & Crypto Spot) ─── */
function OrderForm() {
  // Granular Zustand selectors: Mencegah re-render form saat holding price / lastUpdated bergerak
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

  // Ekstraksi domain math order calculation ke hook terpisah
  const {
    priceNum,
    lotsNum,
    rawSym,
    cleanSym,
    isCrypto,
    isUS,
    isForeign,
    rate,
    tradeValue,
    brokerFee,
    taxFee,
    totalFee,
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
    if (isSubmitting) return; // Mencegah double-click / multi-submit race condition

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
        // Gunakan harga live pasar jika harga form terpaut > 5% dari live Binance atau jika harga default
        const finalPrice = (isCrypto && liveMarketPrice && liveMarketPrice > 0 && Math.abs(priceNum - liveMarketPrice) / liveMarketPrice > 0.05)
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
          const plText = (res.order.realizedPL || 0) >= 0 ? `+Rp ${formatPrice(res.order.realizedPL || 0)}` : `-Rp ${formatPrice(Math.abs(res.order.realizedPL || 0))}`;
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
      setTimeout(() => setIsSubmitting(false), 500); // 500ms safety mutex guard
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div id="order-execution-desk" className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Order Execution Desk
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
          ● INSTANT 24/7 PAPER TRADING
        </span>
      </div>

      {notification && (
        <div
          className="mb-3 p-2.5 rounded-lg text-xs flex items-center gap-2"
          style={{
            backgroundColor: notification.type === 'success' ? 'var(--positive-bg)' : 'var(--negative-bg)',
            color: notification.type === 'success' ? 'var(--positive)' : 'var(--negative)',
            border: `1px solid ${notification.type === 'success' ? 'var(--positive)' : 'var(--negative)'}`,
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Asset Class Selector: Saham IDX vs Saham US vs Crypto Spot */}
      <div className="grid grid-cols-3 gap-1 mb-2.5 p-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-bold font-mono">
        <button
          type="button"
          onClick={() => {
            setAssetClass('EQUITY');
            setSymbol('');
            setPrice('');
            setLots('');
          }}
          className={`py-1.5 rounded transition cursor-pointer flex items-center justify-center gap-1 ${
            assetClass === 'EQUITY'
              ? 'bg-[#f59e0b] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span>🇮🇩</span>
          <span>SAHAM IDX</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setAssetClass('US');
            setSymbol('GOOGL');
            setPrice('168.20');
            setLots('1');
          }}
          className={`py-1.5 rounded transition cursor-pointer flex items-center justify-center gap-1 ${
            assetClass === 'US'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-blue-400 hover:text-white'
          }`}
        >
          <span>🇺🇸</span>
          <span>SAHAM US (USD)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setAssetClass('CRYPTO');
            setSymbol('BTC');
            setPrice('82500');
            setLots('0.05');
          }}
          className={`py-1.5 rounded transition cursor-pointer flex items-center justify-center gap-1 ${
            assetClass === 'CRYPTO'
              ? 'bg-cyan-500 text-black shadow-sm'
              : 'text-cyan-400 hover:text-white'
          }`}
        >
          <span>⚡</span>
          <span>CRYPTO (24/7)</span>
        </button>
      </div>

      {/* Quick US Tickers */}
      {assetClass === 'US' && (
        <div className="mb-3 p-2 rounded-lg bg-blue-950/20 border border-blue-500/25">
          <div className="text-[10px] text-blue-300 font-bold mb-1.5 flex items-center justify-between">
            <span>PILIH CEPAT SAHAM GLOBAL / US:</span>
            <span className="text-[9px] text-zinc-400 font-mono">Kurs $1 = Rp 16.000 (1 lot = 1 share)</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { ticker: 'NVDA', price: 141.54 },
              { ticker: 'AAPL', price: 232.15 },
              { ticker: 'MSFT', price: 428.50 },
              { ticker: 'AMZN', price: 187.80 },
              { ticker: 'GOOGL', price: 168.20 },
              { ticker: 'META', price: 589.40 },
              { ticker: 'TSLA', price: 218.80 },
              { ticker: 'PLTR', price: 44.20 },
              { ticker: 'AMD', price: 156.40 },
              { ticker: 'AVGO', price: 182.40 },
              { ticker: 'COIN', price: 215.40 },
              { ticker: 'LLY', price: 924.50 },
              { ticker: 'JPM', price: 224.50 },
              { ticker: 'WMT', price: 82.50 },
              { ticker: 'COST', price: 912.40 },
              { ticker: 'SPY', price: 578.40 },
              { ticker: 'QQQ', price: 494.20 },
              { ticker: 'TSM', price: 198.50 },
              { ticker: 'BABA', price: 101.20 },
              { ticker: 'ASML', price: 712.40 },
            ].map((st) => (
              <button
                key={st.ticker}
                type="button"
                onClick={() => handleSelectQuickUS(st.ticker, st.price)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                  symbol === st.ticker
                    ? 'bg-blue-400 text-black'
                    : 'bg-zinc-800 text-blue-300 hover:bg-zinc-700'
                }`}
              >
                {st.ticker} (${st.price})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Crypto Tickers */}
      {assetClass === 'CRYPTO' && (
        <div className="mb-3 p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/25">
          <div className="text-[10px] text-cyan-300 font-bold mb-1.5 flex items-center justify-between">
            <span>PILIH CEPAT KRIPTO SPOT:</span>
            <span className="text-[9px] text-zinc-400 font-mono">Kurs $1 = Rp 16.000</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { coin: 'BTC', price: 81118 },
              { coin: 'ETH', price: 2450 },
              { coin: 'SOL', price: 154.20 },
              { coin: 'BNB', price: 585 },
              { coin: 'XRP', price: 1.42 },
              { coin: 'DOGE', price: 0.154 },
              { coin: 'SUI', price: 1.85 },
              { coin: 'NEAR', price: 2.45 },
              { coin: 'PEPE', price: 0.00000378 },
              { coin: 'SHIB', price: 0.000018 },
              { coin: 'RENDER', price: 1.828 },
              { coin: 'ARB', price: 0.1672 },
              { coin: 'APT', price: 0.7161 },
              { coin: 'TON', price: 2.85 },
              { coin: 'KAS', price: 0.138 },
              { coin: 'TAO', price: 540 },
              { coin: 'FET', price: 0.62 },
              { coin: 'LINK', price: 11.50 },
              { coin: 'AAVE', price: 154.20 },
              { coin: 'ONDO', price: 0.765 },
              { coin: 'WIF', price: 1.45 },
            ].map((c) => {
              const live = tickerMap[c.coin]?.price ?? tickerMap[`${c.coin}USDT`]?.price ?? c.price;
              const displayVal = live < 0.01 ? live.toFixed(8) : live < 1 ? live.toFixed(4) : live.toLocaleString();
              return (
                <button
                  key={c.coin}
                  type="button"
                  onClick={() => handleSelectQuickCrypto(c.coin, live)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                    symbol === c.coin
                      ? 'bg-cyan-400 text-black'
                      : 'bg-zinc-800 text-cyan-300 hover:bg-zinc-700'
                  }`}
                >
                  {c.coin} (${displayVal})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Buy/Sell toggle */}
      <div className="flex gap-1 mb-3.5 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <button
          type="button"
          onClick={() => setOrderType('BUY')}
          className="flex-1 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
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
          className="flex-1 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
          style={{
            backgroundColor: orderType === 'SELL' ? 'var(--negative)' : 'transparent',
            color: orderType === 'SELL' ? '#fff' : 'var(--text-muted)',
          }}
        >
          SELL (Jual)
        </button>
      </div>

      {/* Form fields */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-[11px] block mb-1" style={{ color: 'var(--text-muted)' }}>
            {assetClass === 'CRYPTO'
              ? 'Kode Kripto (contoh: BTC, ETH, SOL, DOGE)'
              : assetClass === 'US'
              ? 'Kode Saham US (contoh: GOOGL, AAPL, NVDA, MSFT, TSLA)'
              : 'Kode Saham IDX (contoh: BBCA, BBRI, BMRI, TLKM)'}
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder={
              assetClass === 'CRYPTO'
                ? 'e.g. BTC, ETH, SOL, DOGE'
                : assetClass === 'US'
                ? 'e.g. GOOGL, AAPL, NVDA, TSLA'
                : 'e.g. BBCA, BBRI, BMRI, TLKM'
            }
            className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono bg-transparent outline-none uppercase"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {isCrypto ? 'Harga ($ USDT)' : isUS ? 'Harga ($ USD)' : 'Harga (Rp)'}
              </label>
              {!isForeign && priceNum > 0 && (
                <span className="text-[10px] font-mono" style={{ color: tickValidation.valid ? 'var(--positive)' : 'var(--negative)' }}>
                  Tick: {tickValidation.tick}
                </span>
              )}
            </div>
            <input
              type="number"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={assetClass === 'CRYPTO' ? '82500' : assetClass === 'US' ? '168.20' : '9850'}
              className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono-num bg-transparent outline-none"
              style={{
                borderColor: !tickValidation.valid ? 'var(--negative)' : 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            {!isForeign && !tickValidation.valid && (
              <span className="text-[10px] block mt-0.5 text-red-400">
                Gunakan Rp {tickValidation.nearest}
              </span>
            )}
            {isForeign && priceNum > 0 && (
              <span className="text-[9px] block mt-0.5 text-zinc-400 font-mono">
                ≈ Rp {(priceNum * rate).toLocaleString('id-ID')}
              </span>
            )}
          </div>

          <div>
            <label className="text-[11px] block mb-1" style={{ color: 'var(--text-muted)' }}>
              {isCrypto ? 'Jumlah Koin (Unit)' : isUS ? 'Jumlah Shares (Lembar)' : 'Jumlah Lot'}
            </label>
            <input
              type="number"
              step="any"
              value={lots}
              onChange={(e) => setLots(e.target.value)}
              placeholder={isCrypto ? '0.05' : isUS ? '1' : '10'}
              className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono-num bg-transparent outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            {!isCrypto && lotsNum > 0 && (
              <span className="text-[10px] block mt-0.5" style={{ color: 'var(--text-muted)' }}>
                = {isUS ? `${lotsNum.toLocaleString()} lembar` : `${(lotsNum * 100).toLocaleString()} lembar`}
              </span>
            )}
          </div>
        </div>

        {/* Breakdown Transaksi Realistis */}
        <div className="space-y-1.5 pt-2 border-t text-[11px]" style={{ borderColor: 'var(--border)' }}>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>{isCrypto ? 'Nilai Transaksi (IDR)' : 'Nilai Bruto Saham'}</span>
            <span className="font-mono-num" style={{ color: 'var(--text-primary)' }}>
              Rp {formatPrice(tradeValue)}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>{isCrypto ? 'Spot Fee (0.10%)' : 'Fee Broker & Bursa (0.15%)'}</span>
            <span className="font-mono-num" style={{ color: 'var(--text-primary)' }}>
              Rp {formatPrice(brokerFee)}
            </span>
          </div>
          {orderType === 'SELL' && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>{isCrypto ? 'PPh Final Kripto (0.10%)' : 'PPh Final Penjualan (0.10%)'}</span>
              <span className="font-mono-num" style={{ color: 'var(--text-primary)' }}>
                Rp {formatPrice(taxFee)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
            <span style={{ color: 'var(--text-primary)' }}>
              {orderType === 'BUY' ? 'Total Debit Kas' : 'Total Kredit Bersih ke Kas'}
            </span>
            <span className="font-mono-num" style={{ color: 'var(--accent)' }}>
              Rp {formatPrice(Math.round(grandTotal))}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          style={{
            backgroundColor: orderType === 'BUY' ? (isCrypto ? '#06b6d4' : 'var(--positive)') : 'var(--negative)',
            color: orderType === 'BUY' ? '#000' : '#fff',
          }}
        >
          {isSubmitting
            ? 'Memproses Order...'
            : orderType === 'BUY'
            ? `Eksekusi Beli ${isCrypto ? 'Crypto Spot' : 'Saham'} Sekarang`
            : `Eksekusi Jual ${isCrypto ? 'Crypto Spot' : 'Saham'} Sekarang`}
        </button>

        <div className="pt-2 border-t border-zinc-800">
          <Link
            href="/crypto"
            className="flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-cyan-950/40 to-blue-950/20 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 transition-all text-xs font-mono group"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <div>
                <span className="font-bold block text-white group-hover:text-cyan-300 transition-colors">
                  Trading Crypto Spot (Jesse AI)
                </span>
                <span className="text-[10px] text-zinc-400">
                  BTC, ETH, SOL, DOGE · Eksekusi 24/7
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </form>
    </div>
  );
}

/* ─── Portfolio Page ─── */
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
  } = usePortfolioStore();
  const { user, isConfigured, syncPortfolioToDatabase, loadPortfolioFromDatabase, resetPortfolioInDatabase, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'holdings' | 'dividends' | 'calendar' | 'journal' | 'analytics' | 'orders' | 'news'>('holdings');
  const [portfolioView, setPortfolioView] = useState<'institutional' | 'classic'>('institutional');
  const [dividendMsg, setDividendMsg] = useState<string | null>(null);
  const [useDRIP, setUseDRIP] = useState(false);
  const [isStressTestOpen, setIsStressTestOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isCopyTradingModalOpen, setIsCopyTradingModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { tickerMap } = useBinanceLivePrices();

  // Sync to database if user is logged in
  const handleCloudSync = async () => {
    if (!user || user.provider === 'guest') {
      setIsAuthOpen(true);
      return;
    }
    setSyncStatus('Menyinkronkan dengan Akun Cloud...');
    try {
      await loadPortfolioFromDatabase();
      await syncPortfolioToDatabase();
      setSyncStatus('✓ Saldo & Portofolio Berhasil Tersinkronkan dengan Akun Anda!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch {
      setSyncStatus('Gagal menyinkronkan data.');
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ambil portofolio dari cloud segera saat user login atau akun berubah
  useEffect(() => {
    if (user && user.provider !== 'guest') {
      loadPortfolioFromDatabase();
    }
  }, [user?.id, user?.email, loadPortfolioFromDatabase]);

  useEffect(() => {
    // Auto-sync holding prices with backend live prices (with offline fallback)
    const syncPrices = async () => {
      if (holdings.length === 0) return;
      try {
        const symbols = holdings.map((h) => {
          const isCrypto =
            h.assetClass === 'CRYPTO' ||
            h.currency === 'USDT' ||
            h.symbol.endsWith('USDT') ||
            isCryptoSymbol(h.displaySymbol);
          if (isCrypto) return h.symbol;
          if (isUSSymbol(h.displaySymbol) || h.currency === 'USD' || h.assetClass === 'US') return h.displaySymbol;
          return h.symbol.includes('.') ? h.symbol : `${h.displaySymbol}.JK`;
        });
        const { fetchBatchQuotes } = await import('@/lib/api');
        const raw = await fetchBatchQuotes(symbols).catch(() => null);
        const quotesList = Array.isArray(raw) ? raw : (raw as any)?.quotes || [];
        const map: Record<string, number> = {};
        quotesList.forEach((q: any) => {
          if (q?.price > 0) {
            map[q.symbol] = q.price;
            map[q.displaySymbol] = q.price;
            if (q.symbol.endsWith('USDT')) {
              map[q.symbol.replace(/USDT$/, '')] = q.price;
            }
          }
        });

        // Fallback: Hanya isi benchmark untuk holding yang belum memiliki harga pasar (> 0)
        // JANGAN PERNAH menimpa harga posisi aktif yang sudah berjalan dengan angka benchmark statis!
        if (Object.keys(map).length === 0) {
          const { ALL_ID_HEATMAP_UNIVERSE } = await import('@/data/heatmap_stocks_universe');
          const { getVerifiedBenchmarkPrice } = await import('@/data/idx_benchmark_prices');
          holdings.forEach((h) => {
            if (!h.currentPrice || h.currentPrice <= 0) {
              const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').toUpperCase();
              const isCrypto =
                h.assetClass === 'CRYPTO' ||
                h.currency === 'USDT' ||
                h.symbol.endsWith('USDT') ||
                isCryptoSymbol(cleanSym);

              if (isCrypto) {
                const bench = getVerifiedBenchmarkPrice(`${cleanSym.replace(/USDT$/i, '')}USDT`);
                if (bench && bench.price > 0) {
                  map[h.symbol] = bench.price;
                  map[h.displaySymbol] = bench.price;
                }
                return;
              }

              const found = ALL_ID_HEATMAP_UNIVERSE.find(
                (s) => s.displaySymbol === cleanSym || s.symbol.toUpperCase() === `${cleanSym}.JK`
              );
              if (found && found.price > 0) {
                map[h.symbol] = found.price;
                map[h.displaySymbol] = found.price;
              } else {
                const bench = getVerifiedBenchmarkPrice(cleanSym);
                if (bench && bench.price > 0) {
                  map[h.symbol] = bench.price;
                  map[h.displaySymbol] = bench.price;
                }
              }
            }
          });
        }

        if (Object.keys(map).length > 0) {
          updateHoldingPrices(map);
        }
      } catch {
        // Fallback gracefully without throwing
      }
    };

    syncPrices();
    const interval = setInterval(syncPrices, 8000); // Sinkronisasi otomatis tiap 8 detik agar pergerakan tick saham terasa live
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

  const totalHoldingsValue = holdings.reduce((sum, h) => {
    const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT') || h.currency === 'USDT' || isCryptoSymbol(h.displaySymbol);
    const clean = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
    const isUS = !isCrypto && (h.currency === 'USD' || h.assetClass === 'US' || isUSSymbol(clean));
    const rate = h.exchangeRate || 16000;
    const units = isCrypto ? (h.cryptoUnits || h.lots) : (h.shares || (isUS ? h.lots : h.lots * 100));
    if (isCrypto || isUS) {
      return sum + Math.round(h.currentPrice * units * rate);
    }
    return sum + (h.currentPrice * (h.shares || h.lots * 100));
  }, 0);
  const totalPortfolioValue = totalHoldingsValue + cash;
  const totalUnrealizedPL = holdings.reduce((sum, h) => sum + (h.unrealizedPL || 0), 0);
  const totalDividendsReceived = dividends.reduce((sum, d) => sum + d.netAmount, 0);
  const totalPassiveIncome = totalDividendsReceived;

  const handleClaimSingle = (sym: string, dps: number) => {
    const res = claimDividend(sym, dps);
    setDividendMsg(res.message);
    setTimeout(() => setDividendMsg(null), 5000);
  };

  const handleClaimSingleDRIP = (sym: string, dps: number) => {
    const res = claimDividendWithDRIP(sym, dps);
    setDividendMsg(res.message);
    setTimeout(() => setDividendMsg(null), 6000);
  };

  const handleClaimAll = () => {
    if (useDRIP) {
      const res = distributeAllEligibleDividendsWithDRIP();
      if (res.count > 0) {
        setDividendMsg(
          `✨ Auto-DRIP Berhasil! Total dividen Rp ${res.totalDividendValue.toLocaleString(
            'id-ID'
          )} telah di-reinvestasi menjadi +${res.totalLotsAdded} Lot tambahan saham (${res.symbols.join(
            ', '
          )}). Sisa kembalian kas: Rp ${res.leftoverCashAdded.toLocaleString('id-ID')} masuk ke RDN!`
        );
      } else {
        setDividendMsg('Tidak ada dividen yang memenuhi syarat untuk program reinvestasi DRIP.');
      }
    } else {
      const res = distributeAllEligibleDividends();
      if (res.total > 0) {
        setDividendMsg(
          `Berhasil mencairkan total dividen sebesar Rp ${res.total.toLocaleString(
            'id-ID'
          )} dari ${res.count} saham (${res.symbols.join(', ')}) langsung ke saldo kas RDN!`
        );
      } else {
        setDividendMsg(
          'Tidak ada dividen yang dapat dicairkan. Pastikan portofolio Anda memiliki saham yang membagikan dividen (seperti BBCA, BBRI, ITMG, PTBA, UNTR, PGAS).'
        );
      }
    }
    setTimeout(() => setDividendMsg(null), 6000);
  };

  const handleResetCashOnly = async (nominal?: number) => {
    let targetNominal = typeof nominal === 'number' ? nominal : 100000000;
    if (typeof nominal !== 'number') {
      const promptVal = window.prompt(
        'Atur Nominal Kas Portofolio Anda (IDR):\nContoh:\n- 10000000 (10 Juta)\n- 25000000 (25 Juta)\n- 50000000 (50 Juta)\n- 100000000 (100 Juta)',
        String(cash || 100000000)
      );
      if (!promptVal) return;
      const parsed = parseFloat(promptVal.replace(/[^0-9]/g, ''));
      if (isNaN(parsed) || parsed < 0) {
        alert('Nominal tidak valid.');
        return;
      }
      targetNominal = parsed;
    }

    resetCashOnly(targetNominal);
    if (user && isConfigured) {
      await syncPortfolioToDatabase();
    }
    setDividendMsg(`⚡ Saldo Kas RDN berhasil disetel menjadi Rp ${targetNominal.toLocaleString('id-ID')} tanpa mengubah kepemilikan saham Anda!`);
    setTimeout(() => setDividendMsg(null), 5000);
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
        { header: 'Harga Pasar Terkini (IDR)', key: (h) => h.currentPrice },
        { header: 'Total Nilai Pasar (IDR)', key: (h) => Math.round(h.currentPrice * (h.shares || h.lots * 100)) },
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
        currentPrice: h.currentPrice,
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
        { header: 'Jumlah Lembar', key: (o) => (o.lots * 100) },
        { header: 'Total Nilai (IDR)', key: (o) => Math.round(o.total) },
        { header: 'Fee & Pajak (IDR)', key: (o) => Math.round(o.fee) },
        { header: 'Realized Gain Loss (IDR)', key: (o) => o.realizedPL !== undefined ? Math.round(o.realizedPL) : 0 },
        { header: 'Status', key: (o) => o.status },
      ],
      'Riwayat_Transaksi_Order'
    );
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
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

      {/* View Switcher: Institutional Desk vs Classic View */}
      <div className="flex items-center justify-between bg-[#09090b] border border-[#27272a] p-1.5 rounded-sm">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPortfolioView('institutional')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              portfolioView === 'institutional'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
            }`}
          >
            🏛️ INSTITUTIONAL DESK & CORRELATION
          </button>
          <button
            onClick={() => setPortfolioView('classic')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              portfolioView === 'classic'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
            }`}
          >
            📑 CLASSIC DETAILED DESK
          </button>
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
        </div>
        <div className="flex items-center gap-2">
          {syncStatus && (
            <span className="text-[10px] text-emerald-400 font-mono animate-pulse hidden md:inline">
              {syncStatus}
            </span>
          )}
          {user && user.provider !== 'guest' ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCloudSync}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors cursor-pointer"
                title="Klik untuk menyinkronkan saldo kas & portofolio ke Cloud Database Supabase"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Cloud: {user.fullName || user.email}</span>
                <span className="text-[10px] opacity-75">💾 Sync</span>
              </button>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-2 py-1 rounded text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
                title="Ganti akun atau login akun lain"
              >
                Ganti Akun
              </button>
              <button
                onClick={async () => {
                  await logout();
                  setIsAuthOpen(true);
                }}
                className="px-2 py-1 rounded text-[11px] font-semibold text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Logout dari akun ini"
              >
                Keluar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold bg-[#f59e0b]/15 border border-[#f59e0b]/50 text-[#f59e0b] hover:bg-[#f59e0b]/25 transition-colors cursor-pointer shadow-sm"
              title="Masuk / Daftar Akun Member untuk menyimpan portofolio Anda secara permanen"
            >
              <span>👤</span>
              <span>Login Member (Simpan Porto)</span>
            </button>
          )}
          <span className="text-[10px] text-[#71717a] hidden sm:inline">
            {portfolioView === 'institutional' ? 'BLOOMBERG PORTFOLIO ATTRIBUTION' : 'DETAILED HOLDINGS & ORDERS'}
          </span>
        </div>
      </div>

      {portfolioView === 'institutional' ? (
        <div className="space-y-4">
          <InstitutionalPortfolioDesk />
          <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-sm">
            <h2 className="text-xs font-bold text-[#f59e0b] mb-2 uppercase">
              QUICK ORDER EXECUTION DESK
            </h2>
            <OrderForm />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Portofolio Saham, Dividen & SBN Ritel
              </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Real-time Portfolio Tracking &bull; Realized / Unrealized Gain &bull; Dividen & SBN
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setUseDRIP(!useDRIP)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              useDRIP
                ? 'bg-purple-600/25 text-purple-300 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                : 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-white'
            }`}
            title="Dividend Reinvestment Plan (DRIP): Otomatis mengonversi dividen kas menjadi lot saham tambahan di harga pasar (0 fee broker)"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: useDRIP ? '#a855f7' : '#71717a' }} />
            <span>Mode DRIP: {useDRIP ? 'AKTIF (Auto-Reinvest)' : 'KAS RDN'}</span>
          </button>
          <button
            onClick={handleClaimAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm hover:brightness-110"
            style={{
              backgroundColor: useDRIP ? '#a855f7' : 'var(--accent)',
              color: useDRIP ? '#fff' : '#000',
            }}
            title={useDRIP ? 'Reinvestasikan dividen langsung menjadi lot saham' : 'Cairkan semua dividen ke saldo kas'}
          >
            <Gift className="w-3.5 h-3.5" />
            {useDRIP ? '✨ Eksekusi DRIP (Reinvestasi Saham)' : 'Cairkan Semua Dividen'}
          </button>
          <button
            type="button"
            onClick={() => setIsStressTestOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-rose-400 border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20"
            title="Uji ketahanan portofolio terhadap skenario krisis historis & simulasi Monte Carlo"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Stress Test & Monte Carlo</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcelAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20"
            title="Ekspor seluruh data portofolio & riwayat order ke Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdfReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-blue-400 border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20"
            title="Unduh ringkasan portofolio ke format PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh PDF</span>
          </button>

          <button
            type="button"
            onClick={handleResetTotal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-red-400 border-red-500/40 bg-red-500/10 hover:bg-red-500/20"
            title="Reset seluruh portofolio & transaksi ke kondisi awal demo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Portofolio Demo
          </button>
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

      {/* Summary Cards */}
      <div id="portfolio-summary-card" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Total Nilai Aset</div>
          <div className="text-lg font-bold font-mono-num" style={{ color: 'var(--text-primary)' }}>
            Rp {formatPrice(Math.round(totalPortfolioValue))}
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Kas Tersedia (RDN)</span>
          </div>
          <div className="text-lg font-bold font-mono-num" style={{ color: 'var(--accent)' }}>
            Rp {formatPrice(Math.round(cash))}
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Unrealized Gain / Loss</div>
          <div
            className="text-lg font-bold font-mono-num flex items-center gap-1"
            style={{ color: totalUnrealizedPL >= 0 ? 'var(--positive)' : 'var(--negative)' }}
          >
            {totalUnrealizedPL >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            Rp {formatPrice(Math.round(Math.abs(totalUnrealizedPL)))}
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Realized Profit / Loss</div>
          <div
            className="text-lg font-bold font-mono-num flex items-center gap-1"
            style={{ color: (realizedPL || 0) >= 0 ? 'var(--positive)' : 'var(--negative)' }}
          >
            {(realizedPL || 0) >= 0 ? '+' : '-'}Rp {formatPrice(Math.round(Math.abs(realizedPL || 0)))}
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Passive Income</div>
          <div className="text-lg font-bold font-mono-num flex items-center gap-1" style={{ color: 'var(--positive)' }}>
            <Coins className="w-4 h-4" />
            Rp {formatPrice(Math.round(totalPassiveIncome))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Tabs Area */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="flex gap-1 border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setActiveTab('holdings')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
              style={{
                color: activeTab === 'holdings' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'holdings' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <PieChart className="w-4 h-4" /> Saham Dimiliki ({holdings.length})
            </button>
            <button
              onClick={() => setActiveTab('dividends')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
              style={{
                color: activeTab === 'dividends' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'dividends' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <Coins className="w-4 h-4" /> Klaim Dividen ({dividends.length})
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
              style={{
                color: activeTab === 'calendar' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'calendar' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <Calendar className="w-4 h-4 text-amber-400" /> Kalender Dividen
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
              style={{
                color: activeTab === 'journal' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'journal' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <Calendar className="w-4 h-4 text-emerald-400" /> Jurnal PnL Kalender
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
              style={{
                color: activeTab === 'analytics' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'analytics' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Analisis & Alokasi
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
              style={{
                color: activeTab === 'orders' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'orders' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <History className="w-4 h-4" /> Riwayat Order & Realized P/L ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
              style={{
                color: activeTab === 'news' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'news' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <Newspaper className="w-4 h-4 text-[#f59e0b]" /> Berita Saham Saya
            </button>
          </div>

          {/* TAB 1: HOLDINGS SAHAM */}
          {activeTab === 'holdings' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-zinc-400">
                  Total {holdings.length} posisi saham aktif dalam portofolio
                </span>
                {holdings.length > 0 && (
                  <button
                    onClick={handleExportHoldingsCsv}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] border border-[#f59e0b]/40 rounded text-xs font-mono font-semibold transition-colors cursor-pointer"
                    title="Ekspor seluruh posisi saham ke format CSV (kompatibel Excel & Google Sheets)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Portofolio CSV</span>
                  </button>
                )}
              </div>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              {holdings.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="Portofolio Saham Masih Kosong"
                  description="Belum ada posisi aktif. Beli saham IDX, kripto, atau saham US melalui form Order di samping untuk mulai membangun portofolio dan mengumpulkan dividen."
                  cta={{
                    label: '🛒 Mulai Beli Saham Pertama',
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
                  <table className="data-table min-w-[760px] w-full">
                    <thead>
                      <tr>
                        <th>Ticker</th>
                        <th className="text-right">Avg Buy (Fee Inkl.)</th>
                        <th className="text-right">Lot (Lembar)</th>
                        <th className="text-right">Harga Live</th>
                        <th className="text-right">Total Nilai</th>
                        <th className="text-right">Floating Gain/Loss</th>
                        <th className="text-center">Aksi Dividen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings
                        .filter((h) => {
                          const isC = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT') || h.currency === 'USDT' || isCryptoSymbol(h.displaySymbol);
                          const u = isC ? (h.cryptoUnits || h.lots || 0) : (h.shares || (h.lots ? h.lots * 100 : 0));
                          return u > 0.000001;
                        })
                        .map((h) => {
                          const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT') || h.currency === 'USDT' || isCryptoSymbol(h.displaySymbol);
                          const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
                          const isUS = !isCrypto && (h.currency === 'USD' || h.assetClass === 'US' || isUSSymbol(cleanSym));
                          const rate = h.exchangeRate || 16000;
                          const units = isCrypto ? (h.cryptoUnits || h.lots) : (h.shares || (isUS ? h.lots : h.lots * 100));
                          let effectiveAvg = h.avgPrice;
                          if (isCrypto && h.currentPrice > 0) {
                            const prec = h.currentPrice < 0.00001 ? 8 : h.currentPrice < 0.01 ? 6 : h.currentPrice < 1 ? 4 : 2;
                            if (effectiveAvg > h.currentPrice * 100) {
                              effectiveAvg = effectiveAvg / 16000 >= h.currentPrice * 0.2 ? Number((effectiveAvg / 16000).toFixed(prec)) : h.currentPrice;
                            } else if (effectiveAvg <= 0.0000000001 || h.currentPrice > effectiveAvg * 50) {
                              effectiveAvg = h.currentPrice;
                            }
                          }
                          const val = (isCrypto || isUS) ? h.currentPrice * units * rate : h.currentPrice * units;
                          const pl = (isCrypto || isUS) ? Math.round((h.currentPrice - effectiveAvg) * units * rate) : (h.unrealizedPL || Math.round((h.currentPrice - effectiveAvg) * units));
                          const isPositive = (pl || 0) >= 0;
                          let plPct = effectiveAvg > 0 ? ((h.currentPrice - effectiveAvg) / effectiveAvg) * 100 : (h.unrealizedPLPercent || 0);
                          if (plPct > 500) plPct = 500;
                          if (plPct < -98) plPct = -98;
                        const divInfo = KNOWN_DIVIDENDS[cleanSym];
                        const totalDividend = divInfo && divInfo.dps > 0 ? divInfo.dps * units : 0;
                        return (
                          <tr key={h.symbol} className={isCrypto ? 'bg-cyan-950/10' : isUS ? 'bg-blue-950/10' : ''}>
                            <td>
                              <div className="flex items-center gap-2">
                                {isCrypto ? (
                                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-black shrink-0">
                                    ⚡
                                  </div>
                                ) : isUS ? (
                                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                    🇺🇸
                                  </div>
                                ) : (
                                  <CompanyLogo symbol={h.displaySymbol} name={h.name} size={24} rounded="md" />
                                )}
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <Link
                                      href={isCrypto ? '/crypto' : `/stock/${h.displaySymbol}`}
                                      className="font-bold text-xs font-mono hover:underline"
                                      style={{ color: isCrypto ? '#06b6d4' : isUS ? '#60a5fa' : 'var(--accent)' }}
                                    >
                                      {cleanSym}
                                    </Link>
                                    {isCrypto ? (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                        CRYPTO
                                      </span>
                                    ) : isUS ? (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                        US STOCK
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{h.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-right font-mono-num text-xs font-semibold">
                              {isCrypto ? (
                                <div>
                                  <span>{formatCryptoPrice(h.avgPrice)} USDT</span>
                                  <span className="text-[10px] block text-zinc-500">
                                    (≈ {formatIDREquivalent(h.avgPrice * rate)})
                                  </span>
                                </div>
                              ) : isUS ? (
                                <div>
                                  <span className="text-white">${h.avgPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                                  <span className="text-[10px] block text-zinc-400">
                                    (≈ Rp {Math.round(h.avgPrice * rate).toLocaleString('id-ID')})
                                  </span>
                                </div>
                              ) : (
                                `Rp ${formatPrice(h.avgPrice)}`
                              )}
                            </td>
                            <td className="text-right font-mono-num text-xs">
                              {isCrypto ? (
                                <span className="font-semibold text-cyan-300">{units.toFixed(4)} koin</span>
                              ) : isUS ? (
                                <>
                                  <span className="font-semibold text-blue-300">{h.lots} shares</span>
                                  <span className="text-[10px] block text-gray-400">({units.toLocaleString()} lbr)</span>
                                </>
                              ) : (
                                <>
                                  <span className="font-semibold">{h.lots} lot</span>
                                  <span className="text-[10px] block text-gray-400">({units.toLocaleString()} lbr)</span>
                                </>
                              )}
                            </td>
                            <td className="text-right font-mono-num text-xs font-semibold">
                              {isCrypto ? (
                                <span className="text-white font-bold">{formatCryptoPrice(h.currentPrice)} USDT</span>
                              ) : isUS ? (
                                <span className="text-white font-bold">${h.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                              ) : (
                                `Rp ${formatPrice(h.currentPrice)}`
                              )}
                            </td>
                            <td className="text-right font-mono-num text-xs font-bold">
                              Rp {formatPrice(Math.round(val))}
                            </td>
                            <td
                              className="text-right font-mono-num text-xs font-semibold"
                              style={{ color: isPositive ? 'var(--positive)' : 'var(--negative)' }}
                            >
                              {isPositive ? '+' : ''}Rp {formatPrice(Math.round(pl))} ({plPct.toFixed(2)}%)
                            </td>
                            <td className="text-center">
                              {isCrypto ? (
                                <Link
                                  href="/crypto"
                                  className="px-2.5 py-1 rounded text-[11px] font-bold transition-all inline-flex items-center gap-1 font-mono text-cyan-300 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 shadow-sm"
                                  title="Buka Jesse AI Quant Desk untuk trading koin ini"
                                >
                                  <Coins className="w-3 h-3 text-cyan-400" />
                                  <span>Jesse Desk</span>
                                </Link>
                              ) : divInfo && divInfo.dps > 0 ? (
                                <div className="inline-flex items-center gap-1.5">
                                  {useDRIP ? (
                                    <button
                                      onClick={() => handleClaimSingleDRIP(h.symbol, divInfo.dps)}
                                      className="px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer hover:opacity-90 inline-flex items-center gap-1 font-mono text-purple-300 border border-purple-500/50 bg-purple-500/15 shadow-sm"
                                      title={`DRIP: Otomatis belikan lot saham ${cleanSym} dari total dividen Rp ${formatPrice(totalDividend)}`}
                                    >
                                      <Sparkles className="w-3 h-3 text-purple-400" />
                                      <span>DRIP (+Lot)</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleClaimSingle(h.symbol, divInfo.dps)}
                                      className="px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer hover:opacity-90 inline-flex items-center gap-1 font-mono"
                                      style={{ backgroundColor: 'var(--positive-bg)', color: 'var(--positive)', border: '1px solid var(--positive)' }}
                                      title={`Klaim dividen Rp ${divInfo.dps}/lbr (Total: Rp ${formatPrice(totalDividend)}) ke kas`}
                                    >
                                      <Coins className="w-3 h-3" />
                                      <span>Klaim Rp {formatPrice(divInfo.dps)}</span>
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span
                                  className="text-[10px] px-2 py-0.5 rounded font-mono"
                                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                                  title="Emiten berstatus Non-Dividen (fokus ekspansi/rugi bersih)"
                                >
                                  Non-Dividen
                                </span>
                              )}
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

          {/* TAB 2: DIVIDEND TRACKER */}
          {activeTab === 'dividends' && (
            <div className="space-y-4">
              <div className="rounded-xl border p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Dividen Yield & Rekapitulasi Pembagian Kas
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Dividen otomatis masuk ke Kas RDN (0% PPh Final jika diinvestasikan kembali sesuai UU HPP).
                  </div>
                </div>
                <button
                  onClick={handleClaimAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--positive)', color: '#000' }}
                >
                  Cairkan Semua
                </button>
              </div>

              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="data-table min-w-[700px] w-full">
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
                      {dividends.map((d) => (
                        <tr key={d.id}>
                          <td className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{d.id}</td>
                          <td className="font-bold text-xs font-mono" style={{ color: 'var(--accent)' }}>
                            <div className="flex items-center gap-1.5">
                              <CompanyLogo symbol={d.displaySymbol} size={18} rounded="sm" border={false} />
                              <span>{d.displaySymbol}</span>
                            </div>
                          </td>
                          <td className="text-right font-mono-num text-xs">Rp {formatPrice(d.dividendPerShare)}</td>
                          <td className="text-right font-mono-num text-xs">{d.shares.toLocaleString()} lbr</td>
                          <td className="text-right font-mono-num text-xs font-bold" style={{ color: 'var(--positive)' }}>
                            Rp {formatPrice(d.netAmount)}
                          </td>
                          <td className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{d.paymentDate}</td>
                          <td className="text-center">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded font-mono"
                              style={{ backgroundColor: 'var(--positive-bg)', color: 'var(--positive)' }}
                            >
                              DITERIMA
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: KALENDER DIVIDEN & COUNTDOWN */}
          {activeTab === 'calendar' && (
            <DividendCalendar />
          )}

          {/* TAB 4: RIWAYAT ORDER & REALIZED P/L */}
          {activeTab === 'orders' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-zinc-400">
                  Log audit transaksi order & eksekusi bursa ({orders.length} order)
                </span>
                {orders.length > 0 && (
                  <button
                    onClick={handleExportOrdersCsv}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] border border-[#f59e0b]/40 rounded text-xs font-mono font-semibold transition-colors cursor-pointer"
                    title="Ekspor seluruh riwayat order & realized P/L ke format CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Riwayat Order CSV</span>
                  </button>
                )}
              </div>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              {orders.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="Belum Ada Riwayat Transaksi"
                  description="Semua eksekusi order BUY dan SELL akan tercatat di sini lengkap dengan Realized P/L, fee broker, dan status order."
                  cta={{
                    label: '📈 Eksekusi Order Pertama',
                    onClick: () => {
                      const orderEl = document.getElementById('order-execution-desk');
                      orderEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    },
                  }}
                />
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="data-table min-w-[760px] w-full">
                    <thead>
                      <tr>
                        <th>Waktu</th>
                        <th>Ticker</th>
                        <th className="text-center">Tipe</th>
                        <th className="text-right">Harga</th>
                        <th className="text-right">Lot (Lembar)</th>
                        <th className="text-right">Fee & Pajak</th>
                        <th className="text-right">Total Transaksi</th>
                        <th className="text-right">Realized Gain/Loss</th>
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
                          ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT', 'TRX', 'RENDER', 'TAO', 'FET'].includes(cleanSym);
                        return (
                          <tr key={o.id}>
                            <td className="text-xs font-mono-num" style={{ color: 'var(--text-muted)' }}>
                              {new Date(o.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                            <td className="font-bold text-xs font-mono" style={{ color: isCrypto ? '#06b6d4' : 'var(--accent)' }}>
                              <div className="flex items-center gap-1.5">
                                {isCrypto ? (
                                  <span className="w-4 h-4 rounded bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-bold">⚡</span>
                                ) : (
                                  <CompanyLogo symbol={o.displaySymbol} size={18} rounded="sm" border={false} />
                                )}
                                <span>{o.displaySymbol}</span>
                                {isCrypto && (
                                  <span className="text-[8px] bg-cyan-500/20 text-cyan-300 px-1 rounded border border-cyan-500/30 font-bold">CRYPTO</span>
                                )}
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
                                <>
                                  {o.lots} lot <span className="text-[10px] text-gray-400">({o.shares || o.lots * 100} lbr)</span>
                                </>
                              )}
                            </td>
                            <td className="text-right font-mono-num text-xs" style={{ color: 'var(--text-muted)' }}>
                              Rp {formatPrice(o.fee)}
                            </td>
                            <td className="text-right font-mono-num text-xs font-semibold">
                              Rp {formatPrice(Math.round(o.total))}
                              {isCrypto && (
                                <span className="text-[10px] block text-zinc-500 font-normal">
                                  (≈ ${(o.price * o.lots).toLocaleString('en-US', { maximumFractionDigits: 2 })})
                                </span>
                              )}
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
                                  {isGain ? '+' : ''}Rp {formatPrice(Math.round(o.realizedPL!))} ({o.realizedPLPercent}%)
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>—</span>
                              )}
                            </td>
                            <td className="text-center">
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                                style={{
                                  backgroundColor: 'var(--blue-bg)',
                                  color: 'var(--blue)',
                                }}
                              >
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

          {/* TAB: TRADING JOURNAL CALENDAR HEATMAP */}
          {activeTab === 'journal' && (
            <TradingJournalCalendar />
          )}

          {/* TAB: ANALYTICS & ALLOCATION */}
          {activeTab === 'analytics' && (
            <PortfolioAnalytics />
          )}

          {/* TAB: BERITA & ARSIP SEBELUMNYA SAHAM SAYA */}
          {activeTab === 'news' && (
            <PortfolioNewsFeed />
          )}
        </div>

        {/* Order Execution Widget */}
        <div>
          <OrderForm />
        </div>
      </div>
    </div>
  )}

      {/* Portfolio Stress Testing & Monte Carlo Modal */}
      <PortfolioStressTestModal
        isOpen={isStressTestOpen}
        onClose={() => setIsStressTestOpen(false)}
      />

      {/* Telegram 24/7 Alerts Settings Modal */}
      <TelegramAlertSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />

      {/* 1-Click Copy Trading AI Hedge Fund Modal */}
      <CopyTradingModal
        isOpen={isCopyTradingModalOpen}
        onClose={() => setIsCopyTradingModalOpen(false)}
      />

      {/* Member Authentication Modal (Email, Apple, Facebook, Google) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}
