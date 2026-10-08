'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Zap,
  CheckCircle2,
  AlertCircle,
  Percent,
  RefreshCw,
  Layers,
  ArrowRightLeft,
  Shield,
  Target,
  Clock,
  RotateCcw,
  Calculator,
} from 'lucide-react';
import { usePortfolioStore } from '@/store';
import { getIDXTickSize, isValidIDXTick, calculateShares, getForeignTick } from '@/lib/stockRules';
import type { StockQuote } from '@/types';
import PositionSizingModal from './PositionSizingModal';

interface ChartbitTradingPanelProps {
  quote: StockQuote;
  selectedPrice?: number | null;
  onOrderSuccess?: () => void;
  className?: string;
}

export default function ChartbitTradingPanel({
  quote,
  selectedPrice,
  onOrderSuccess,
  className = '',
}: ChartbitTradingPanelProps) {
  const {
    cash,
    holdings,
    placeBuyOrder,
    placeSellOrder,
    setHoldingRiskTargets,
    placeConditionalOrder,
    checkPriceTriggers,
    resetPortfolio,
  } = usePortfolioStore();

  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [priceInput, setPriceInput] = useState<string>(quote.price ? String(quote.price) : '1000');
  const [lotsInput, setLotsInput] = useState<string>('1');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Advanced Risk Management State (Take Profit, Stop Loss & Trailing Stop)
  const [showRiskConfig, setShowRiskConfig] = useState<boolean>(true);
  const [enableTP, setEnableTP] = useState<boolean>(false);
  const [tpInput, setTpInput] = useState<string>('');
  const [enableSL, setEnableSL] = useState<boolean>(false);
  const [slInput, setSlInput] = useState<string>('');
  const [enableTrailing, setEnableTrailing] = useState<boolean>(false);
  const [trailingPercentInput, setTrailingPercentInput] = useState<string>('3');
  const [validityType, setValidityType] = useState<'DAY' | 'GTC'>('GTC');

  // Trigger check on live price update
  useEffect(() => {
    if (quote.price && quote.price > 0) {
      const res = checkPriceTriggers(quote.symbol, quote.price);
      if (res.triggered && res.message) {
        setNotification({ type: 'success', message: res.message });
      }
    }
  }, [quote.price, quote.symbol, checkPriceTriggers]);

  const cleanSymbol = quote.symbol.replace('.JK', '').toUpperCase();
  const currentPrice = quote.price || 1000;

  // Cek apakah user memiliki saham ini di portofolio
  const currentHolding = useMemo(() => {
    return holdings.find(
      (h) => h.displaySymbol.toUpperCase() === cleanSymbol || h.symbol.toUpperCase() === quote.symbol.toUpperCase()
    );
  }, [holdings, cleanSymbol, quote.symbol]);

  // Sinkronisasi target TP/SL dari holding yang sudah ada jika tersedia
  useEffect(() => {
    if (currentHolding) {
      if (currentHolding.takeProfitPrice) {
        setEnableTP(true);
        setTpInput(String(currentHolding.takeProfitPrice));
      }
      if (currentHolding.stopLossPrice) {
        setEnableSL(true);
        setSlInput(String(currentHolding.stopLossPrice));
      }
      if (currentHolding.validityType) {
        setValidityType(currentHolding.validityType);
      }
    }
  }, [currentHolding]);

  // Update input harga jika selectedPrice dari luar berubah
  useEffect(() => {
    if (selectedPrice && selectedPrice > 0) {
      setPriceInput(String(selectedPrice));
    }
  }, [selectedPrice]);

  useEffect(() => {
    if (quote.price && orderType === 'MARKET') {
      setPriceInput(String(quote.price));
    }
  }, [quote.price, orderType]);

  // Share & Asset Info
  const lotsNum = parseFloat(lotsInput) || 0;
  const shareInfo = calculateShares(cleanSymbol, lotsNum);
  const isForeign = shareInfo.isCrypto || shareInfo.isUS;

  // Realisme Mekanisme Pasar: Bid/Ask Spread (Gunakan fraksi harga sesuai kelas aset)
  const currentTick = isForeign ? getForeignTick(currentPrice) : getIDXTickSize(currentPrice);
  const bestBidPrice = isForeign
    ? Number(Math.max(currentTick, currentPrice - currentTick).toFixed(currentPrice < 1 ? 6 : 4))
    : quote.low && quote.low < currentPrice
    ? Math.max(currentTick, currentPrice - currentTick)
    : Math.max(currentTick, currentPrice - currentTick);
  const bestAskPrice = isForeign
    ? Number((currentPrice + currentTick).toFixed(currentPrice < 1 ? 6 : 4))
    : currentPrice + currentTick;
  const spreadPoints = Number((bestAskPrice - bestBidPrice).toFixed(currentPrice < 1 ? 6 : 4));
  const spreadPercent = ((spreadPoints / (bestBidPrice || 1)) * 100).toFixed(2);

  // Jika MARKET order: Pembeli beli di harga ASK, Penjual jual di harga BID
  const executedMarketPrice = orderSide === 'BUY' ? bestAskPrice : bestBidPrice;
  const priceNum = orderType === 'MARKET' ? executedMarketPrice : parseFloat(priceInput) || currentPrice;

  const tick = isForeign ? getForeignTick(priceNum) : getIDXTickSize(priceNum);
  const tickValidation = isForeign
    ? { valid: true, tick, nearest: priceNum }
    : isValidIDXTick(priceNum);

  // Untuk IDX: priceNum (IDR) * (lots * 100). Untuk Crypto: priceNum (USDT) * units * 16.000. Untuk US: priceNum (USD) * shares * 16.000
  const grossTradeValue = Math.round(priceNum * shareInfo.shares * shareInfo.exchangeRate);

  // Realistis Broker Fee: 0.15% fee beli, 0.25% fee jual (0.15% fee broker + 0.1% PPh final)
  const brokerFee = Math.round(grossTradeValue * 0.0015);
  const taxFee = orderSide === 'SELL' ? Math.round(grossTradeValue * 0.001) : 0;
  const totalFee = brokerFee + taxFee;
  const estimatedTotal = orderSide === 'BUY' ? grossTradeValue + totalFee : Math.max(0, grossTradeValue - totalFee);

  // Perhitungan batas Auto Rejection BEI (Simulasi hanya untuk emiten saham BEI)
  const araPrice = useMemo(() => {
    if (isForeign) return Math.round(currentPrice * 1.5);
    let pct = 0.25;
    if (currentPrice > 5000) pct = 0.20;
    else if (currentPrice < 200) pct = 0.35;
    const raw = Math.round(currentPrice * (1 + pct));
    const t = getIDXTickSize(raw);
    return Math.floor(raw / t) * t;
  }, [currentPrice, isForeign]);

  const arbPrice = useMemo(() => {
    if (isForeign) return Number((currentPrice * 0.5).toFixed(currentPrice < 1 ? 6 : 2));
    let pct = 0.25;
    if (currentPrice > 5000) pct = 0.20;
    else if (currentPrice < 200) pct = 0.35;
    const raw = Math.round(currentPrice * (1 - pct));
    const t = getIDXTickSize(raw);
    return Math.max(t, Math.ceil(raw / t) * t);
  }, [currentPrice, isForeign]);

  // Adjust harga dengan tick
  const handlePriceStep = (direction: 'UP' | 'DOWN') => {
    if (orderType === 'MARKET') return;
    const currentVal = parseFloat(priceInput) || currentPrice;
    if (shareInfo.isCrypto || shareInfo.isUS) {
      const step = getForeignTick(currentVal);
      const nextVal = direction === 'UP' ? currentVal + step : Math.max(step, currentVal - step);
      setPriceInput(String(Number(nextVal.toFixed(currentVal < 1 ? 6 : 2))));
    } else {
      const currentTick = getIDXTickSize(currentVal);
      let nextVal = direction === 'UP' ? currentVal + currentTick : currentVal - currentTick;
      if (nextVal <= 0) nextVal = currentTick;
      setPriceInput(String(nextVal));
    }
  };

  // Adjust TP dengan tick
  const handleTpStep = (direction: 'UP' | 'DOWN') => {
    const currentVal = parseFloat(tpInput) || priceNum;
    if (shareInfo.isCrypto || shareInfo.isUS) {
      const step = getForeignTick(currentVal);
      const nextVal = direction === 'UP' ? currentVal + step : Math.max(step, currentVal - step);
      setTpInput(String(Number(nextVal.toFixed(currentVal < 1 ? 6 : 2))));
    } else {
      const t = getIDXTickSize(currentVal);
      let nextVal = direction === 'UP' ? currentVal + t : currentVal - t;
      if (nextVal <= 0) nextVal = t;
      setTpInput(String(nextVal));
    }
  };

  // Adjust SL dengan tick
  const handleSlStep = (direction: 'UP' | 'DOWN') => {
    const currentVal = parseFloat(slInput) || priceNum;
    if (shareInfo.isCrypto || shareInfo.isUS) {
      const step = getForeignTick(currentVal);
      const nextVal = direction === 'UP' ? currentVal + step : Math.max(step, currentVal - step);
      setSlInput(String(Number(nextVal.toFixed(currentVal < 1 ? 6 : 2))));
    } else {
      const t = getIDXTickSize(currentVal);
      let nextVal = direction === 'UP' ? currentVal + t : currentVal - t;
      if (nextVal <= 0) nextVal = t;
      setSlInput(String(nextVal));
    }
  };

  // Shortcut Persentase Take Profit
  const setTpByPercent = (pct: number) => {
    setEnableTP(true);
    const base = priceNum > 0 ? priceNum : currentPrice;
    if (shareInfo.isCrypto || shareInfo.isUS) {
      const target = base * (1 + pct / 100);
      setTpInput(String(Number(target.toFixed(base < 1 ? 6 : 2))));
    } else {
      const raw = Math.round(base * (1 + pct / 100));
      const t = getIDXTickSize(raw);
      const rounded = Math.round(raw / t) * t;
      setTpInput(String(rounded));
    }
  };

  // Shortcut Persentase Stop Loss
  const setSlByPercent = (pct: number) => {
    setEnableSL(true);
    const base = priceNum > 0 ? priceNum : currentPrice;
    if (shareInfo.isCrypto || shareInfo.isUS) {
      const target = Math.max(0.0001, base * (1 - pct / 100));
      setSlInput(String(Number(target.toFixed(base < 1 ? 6 : 2))));
    } else {
      const raw = Math.round(base * (1 - pct / 100));
      const t = getIDXTickSize(raw);
      const rounded = Math.round(raw / t) * t;
      setSlInput(String(rounded));
    }
  };

  // Adjust lot cepat
  const handleAddLots = (amount: number) => {
    const nextLots = Math.max(1, (parseInt(lotsInput, 10) || 0) + amount);
    setLotsInput(String(nextLots));
  };

  // Preset persentase lot
  const handleLotPercentage = (pct: number) => {
    if (orderSide === 'BUY') {
      if (priceNum <= 0) return;
      const availableCashForPct = (cash * pct) / 100;
      const unitMultiplier = shareInfo.isIDX ? 100 : 1;
      const unitCostIDR = (priceNum * unitMultiplier * shareInfo.exchangeRate) * 1.0015;
      if (shareInfo.isCrypto) {
        const units = Number((availableCashForPct / unitCostIDR).toFixed(6));
        setLotsInput(String(units > 0 ? units : 0.001));
      } else {
        const maxLots = Math.floor(availableCashForPct / unitCostIDR);
        setLotsInput(String(Math.max(1, maxLots)));
      }
    } else {
      if (!currentHolding || currentHolding.lots <= 0) {
        setLotsInput('0');
        return;
      }
      const availableHoldingUnits = currentHolding.cryptoUnits ?? currentHolding.lots;
      if (shareInfo.isCrypto) {
        const calculatedUnits = Number(((availableHoldingUnits * pct) / 100).toFixed(6));
        setLotsInput(String(calculatedUnits));
      } else {
        const calculatedLots = Math.floor((availableHoldingUnits * pct) / 100);
        setLotsInput(String(Math.max(1, calculatedLots)));
      }
    }
  };

  // Update TP/SL untuk posisi yang sudah ada
  const handleUpdateExistingRiskTargets = () => {
    const parsedTp = enableTP && parseFloat(tpInput) > 0 ? parseFloat(tpInput) : undefined;
    const parsedSl = enableSL && parseFloat(slInput) > 0 ? parseFloat(slInput) : undefined;

    setHoldingRiskTargets(cleanSymbol, {
      takeProfitPrice: parsedTp,
      stopLossPrice: parsedSl,
      validityType,
    });

    setNotification({
      type: 'success',
      message: `Target Risiko Posisi ${cleanSymbol} Berhasil Diperbarui: ${parsedTp ? `TP: Rp ${parsedTp.toLocaleString('id-ID')}` : 'Tanpa TP'} | ${parsedSl ? `SL: Rp ${parsedSl.toLocaleString('id-ID')}` : 'Tanpa SL'} (${validityType}).`,
    });
    if (onOrderSuccess) onOrderSuccess();
  };

  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    if (lotsNum <= 0) {
      setNotification({ type: 'error', message: 'Jumlah lot harus lebih besar dari 0.' });
      setIsSubmitting(false);
      return;
    }

    if (priceNum <= 0) {
      setNotification({ type: 'error', message: 'Harga transaksi tidak valid.' });
      setIsSubmitting(false);
      return;
    }

    if (orderType === 'LIMIT' && !isForeign && !tickValidation.valid) {
      setNotification({
        type: 'error',
        message: `Harga Rp ${priceNum.toLocaleString('id-ID')} tidak sesuai fraksi BEI. Rekomendasi: Rp ${tickValidation.nearest.toLocaleString('id-ID')}.`,
      });
      setIsSubmitting(false);
      return;
    }

    const parsedTp = enableTP && parseFloat(tpInput) > 0 ? parseFloat(tpInput) : undefined;
    const parsedSl = enableSL && parseFloat(slInput) > 0 ? parseFloat(slInput) : undefined;

    if (parsedTp && parsedTp <= priceNum && orderSide === 'BUY') {
      setNotification({
        type: 'error',
        message: 'Harga Take Profit harus lebih tinggi dari harga beli.',
      });
      setIsSubmitting(false);
      return;
    }

    if (parsedSl && parsedSl >= priceNum && orderSide === 'BUY') {
      setNotification({
        type: 'error',
        message: 'Harga Stop Loss harus lebih rendah dari harga beli.',
      });
      setIsSubmitting(false);
      return;
    }

    if (orderSide === 'BUY') {
      const res = placeBuyOrder({
        symbol: quote.symbol,
        displaySymbol: cleanSymbol,
        name: quote.name,
        price: priceNum,
        lots: lotsNum,
        orderType,
        takeProfitPrice: parsedTp,
        stopLossPrice: parsedSl,
        validityType,
        assetClass: shareInfo.isCrypto ? 'CRYPTO' : 'EQUITY',
        currency: shareInfo.currency,
        exchangeRate: shareInfo.exchangeRate,
        cryptoUnits: shareInfo.isCrypto ? lotsNum : undefined,
      });

      if (res.order) {
        if (enableTrailing && parseFloat(trailingPercentInput) > 0) {
          placeConditionalOrder({
            symbol: quote.symbol,
            displaySymbol: cleanSymbol,
            type: 'SELL',
            conditionType: 'TRAILING_STOP',
            triggerPrice: priceNum,
            trailingPercent: parseFloat(trailingPercentInput),
            peakPrice: priceNum,
            lots: lotsNum,
          });
        }

        const unitTxt = shareInfo.isCrypto ? `${lotsNum} koin` : `${lotsNum} lot`;
        const costTxt = `Rp ${estimatedTotal.toLocaleString('id-ID')}`;
        setNotification({
          type: 'success',
          message: `Sukses Beli ${unitTxt} ${cleanSymbol} (Total: ${costTxt})! ${parsedTp ? `TP: ${parsedTp} ` : ''}${parsedSl ? `SL: ${parsedSl} ` : ''}${enableTrailing ? `[Trailing Stop -${trailingPercentInput}%]` : ''}`,
        });
        if (onOrderSuccess) onOrderSuccess();
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Gagal mengeksekusi pembelian.',
        });
      }
    } else {
      const res = placeSellOrder({
        symbol: quote.symbol,
        displaySymbol: cleanSymbol,
        name: quote.name,
        price: priceNum,
        lots: lotsNum,
        orderType,
        assetClass: shareInfo.isCrypto ? 'CRYPTO' : 'EQUITY',
        currency: shareInfo.currency,
        exchangeRate: shareInfo.exchangeRate,
        cryptoUnits: shareInfo.isCrypto ? lotsNum : undefined,
      });

      if (res.order) {
        const pl = res.order.realizedPL || 0;
        const plText = pl >= 0 ? `+Rp ${pl.toLocaleString('id-ID')}` : `-Rp ${Math.abs(pl).toLocaleString('id-ID')}`;
        const unitTxt = shareInfo.isCrypto ? `${lotsNum} koin` : `${lotsNum} lot`;
        setNotification({
          type: 'success',
          message: `Sukses Jual ${unitTxt} ${cleanSymbol}! Realized P/L: ${plText}.`,
        });
        if (onOrderSuccess) onOrderSuccess();
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Gagal mengeksekusi penjualan.',
        });
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${className}`}
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b mb-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: orderSide === 'BUY' ? 'var(--positive)' : 'var(--negative)' }}
            />
            <span className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--text-primary)' }}>
              ⚡ Chart Trading &bull; {cleanSymbol}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>RDN:</span>
            <span className="font-semibold text-emerald-400">
              Rp {mounted ? cash.toLocaleString('id-ID') : '...'}
            </span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset saldo RDN dan semua posisi portofolio kembali ke semula (Rp 100 Juta)?')) {
                  resetPortfolio();
                  setNotification({
                    type: 'success',
                    message: 'Saldo RDN dan semua posisi saham berhasil di-reset ke Rp 100.000.000 semula!',
                  });
                }
              }}
              title="Reset Saldo RDN & Portofolio ke Semula (Rp 100 Juta)"
              className="ml-1 p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-0.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-[10px] hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Current Position Overview if held */}
        {mounted && currentHolding && currentHolding.lots > 0 && (
          <div
            className="mb-3 p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between"
            style={{
              backgroundColor: currentHolding.unrealizedPL >= 0 ? 'var(--positive-bg)' : 'var(--negative-bg)',
              borderColor: currentHolding.unrealizedPL >= 0 ? 'rgba(0, 200, 83, 0.3)' : 'rgba(255, 23, 68, 0.3)',
            }}
          >
            <div>
              <div className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                Posisi: {currentHolding.lots} Lot ({currentHolding.shares.toLocaleString('id-ID')} lbr)
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Avg Buy: Rp {currentHolding.avgPrice.toLocaleString('id-ID')}
              </div>
              {(currentHolding.takeProfitPrice || currentHolding.stopLossPrice) && (
                <div className="text-[10px] flex items-center gap-2 mt-0.5 font-bold">
                  {currentHolding.takeProfitPrice && (
                    <span className="text-emerald-400">TP: Rp {currentHolding.takeProfitPrice.toLocaleString('id-ID')}</span>
                  )}
                  {currentHolding.stopLossPrice && (
                    <span className="text-red-400">SL: Rp {currentHolding.stopLossPrice.toLocaleString('id-ID')}</span>
                  )}
                </div>
              )}
            </div>

            <div className="text-right">
              <div
                className="font-bold text-xs"
                style={{ color: currentHolding.unrealizedPL >= 0 ? 'var(--positive)' : 'var(--negative)' }}
              >
                {currentHolding.unrealizedPL >= 0 ? '+' : ''}
                Rp {currentHolding.unrealizedPL.toLocaleString('id-ID')} ({currentHolding.unrealizedPLPercent}%)
              </div>
              <button
                type="button"
                onClick={() => {
                  setOrderSide('SELL');
                  setOrderType('MARKET');
                  setLotsInput(String(currentHolding.lots));
                }}
                className="text-[10px] text-red-400 underline hover:text-red-300 cursor-pointer"
              >
                Jual Cepat Semua
              </button>
            </div>
          </div>
        )}

        {/* Risk-Reward & Position Sizing Calculator Quick Trigger */}
        <div className="mb-2.5">
          <button
            type="button"
            onClick={() => setShowCalcModal(true)}
            className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Kalkulator R:R &amp; Position Sizing</span>
          </button>
        </div>

        {/* Order Mode Toggle (BUY vs SELL) */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => setOrderSide('BUY')}
            className="py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            style={{
              backgroundColor: orderSide === 'BUY' ? 'var(--positive)' : 'var(--bg-card)',
              color: orderSide === 'BUY' ? '#ffffff' : 'var(--text-muted)',
              border: orderSide === 'BUY' ? '1px solid var(--positive)' : '1px solid var(--border)',
            }}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            BELI (BUY)
          </button>

          <button
            type="button"
            onClick={() => setOrderSide('SELL')}
            className="py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            style={{
              backgroundColor: orderSide === 'SELL' ? 'var(--negative)' : 'var(--bg-card)',
              color: orderSide === 'SELL' ? '#ffffff' : 'var(--text-muted)',
              border: orderSide === 'SELL' ? '1px solid var(--negative)' : '1px solid var(--border)',
            }}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            JUAL (SELL)
          </button>
        </div>

        {/* Order Type Toggle (LIMIT vs MARKET) */}
        <div className="flex items-center justify-between bg-black/20 p-1 rounded-lg mb-3 border" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => setOrderType('LIMIT')}
            className="flex-1 py-1 text-xs font-medium rounded transition-all cursor-pointer text-center"
            style={{
              backgroundColor: orderType === 'LIMIT' ? 'var(--bg-card)' : 'transparent',
              color: orderType === 'LIMIT' ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: orderType === 'LIMIT' ? '700' : '500',
            }}
          >
            Limit Order
          </button>
          <button
            type="button"
            onClick={() => {
              setOrderType('MARKET');
              setPriceInput(String(currentPrice));
            }}
            className="flex-1 py-1 text-xs font-medium rounded transition-all cursor-pointer text-center"
            style={{
              backgroundColor: orderType === 'MARKET' ? 'var(--bg-card)' : 'transparent',
              color: orderType === 'MARKET' ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: orderType === 'MARKET' ? '700' : '500',
            }}
          >
            Market Order (Instan)
          </button>
        </div>

        {/* Realisme Pasar: Bid / Ask Spread Selector */}
        <div className="mb-3 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 font-mono text-xs">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5">
            <span>BID / ASK SPREAD REALISTIS:</span>
            <span className="text-zinc-500">
              Spread: {spreadPoints} pts ({spreadPercent}%)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setOrderSide('SELL');
                setPriceInput(String(bestBidPrice));
              }}
              className={`p-1.5 rounded flex flex-col items-start transition-all cursor-pointer border text-left ${
                orderSide === 'SELL' && priceNum === bestBidPrice
                  ? 'bg-rose-500/20 border-rose-500/60 text-white shadow-xs'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-rose-500/30'
              }`}
            >
              <span className="text-[10px] text-zinc-400">BID (JUAL)</span>
              <span className="text-xs font-bold text-rose-400 mt-0.5">
                Rp {bestBidPrice.toLocaleString('id-ID')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOrderSide('BUY');
                setPriceInput(String(bestAskPrice));
              }}
              className={`p-1.5 rounded flex flex-col items-start transition-all cursor-pointer border text-left ${
                orderSide === 'BUY' && priceNum === bestAskPrice
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-xs'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-emerald-500/30'
              }`}
            >
              <span className="text-[10px] text-zinc-400">ASK (BELI)</span>
              <span className="text-xs font-bold text-emerald-400 mt-0.5">
                Rp {bestAskPrice.toLocaleString('id-ID')}
              </span>
            </button>
          </div>
          {orderType === 'MARKET' && (
            <div className="text-[10px] text-zinc-400 mt-1.5 flex items-center justify-between bg-zinc-950/80 px-2 py-1 rounded">
              <span>Mode Market Instan:</span>
              <span className={orderSide === 'BUY' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {orderSide === 'BUY' ? `Beli di Ask (Rp ${bestAskPrice.toLocaleString('id-ID')})` : `Jual di Bid (Rp ${bestBidPrice.toLocaleString('id-ID')})`}
              </span>
            </div>
          )}
        </div>

        {/* Price Input Controls */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-medium">Harga Eksekusi (Rp)</span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              Tick Size: Rp {tick}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={orderType === 'MARKET'}
              onClick={() => handlePriceStep('DOWN')}
              className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-base hover:bg-white/5 active:scale-95 disabled:opacity-40 cursor-pointer"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              -
            </button>
            <input
              type="number"
              disabled={orderType === 'MARKET'}
              value={orderType === 'MARKET' ? currentPrice : priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="flex-1 h-9 px-3 rounded-lg border font-mono text-sm text-center font-bold outline-none focus:border-amber-400 disabled:opacity-75"
              style={{
                borderColor: tickValidation.valid ? 'var(--border)' : 'var(--negative)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="button"
              disabled={orderType === 'MARKET'}
              onClick={() => handlePriceStep('UP')}
              className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-base hover:bg-white/5 active:scale-95 disabled:opacity-40 cursor-pointer"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              +
            </button>
          </div>

          {/* Shortcut Harga Cepat (ARB/-5%, Last, ARA/+5%) */}
          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              type="button"
              disabled={orderType === 'MARKET'}
              onClick={() => {
                if (shareInfo.isCrypto || shareInfo.isUS) {
                  const down5 = Number((currentPrice * 0.95).toFixed(currentPrice < 1 ? 6 : 2));
                  setPriceInput(String(down5));
                } else {
                  setPriceInput(String(arbPrice));
                }
              }}
              className="py-1 px-1.5 text-[10px] font-mono rounded border text-center transition-colors hover:border-red-500 hover:text-red-400 cursor-pointer"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
            >
              {shareInfo.isIDX ? `ARB ${arbPrice.toLocaleString('id-ID')}` : `-5%`}
            </button>
            <button
              type="button"
              disabled={orderType === 'MARKET'}
              onClick={() => setPriceInput(String(currentPrice))}
              className="py-1 px-1.5 text-[10px] font-mono rounded border text-center transition-colors hover:border-amber-400 hover:text-amber-400 cursor-pointer font-bold"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}
            >
              Last {shareInfo.isIDX ? currentPrice.toLocaleString('id-ID') : `$${currentPrice.toLocaleString()}`}
            </button>
            <button
              type="button"
              disabled={orderType === 'MARKET'}
              onClick={() => {
                if (shareInfo.isCrypto || shareInfo.isUS) {
                  const up5 = Number((currentPrice * 1.05).toFixed(currentPrice < 1 ? 6 : 2));
                  setPriceInput(String(up5));
                } else {
                  setPriceInput(String(araPrice));
                }
              }}
              className="py-1 px-1.5 text-[10px] font-mono rounded border text-center transition-colors hover:border-emerald-500 hover:text-emerald-400 cursor-pointer"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
            >
              {shareInfo.isIDX ? `ARA ${araPrice.toLocaleString('id-ID')}` : `+5%`}
            </button>
          </div>
        </div>

        {/* Lot Input Controls */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-medium">
              {shareInfo.isCrypto ? 'Jumlah Koin Unit' : shareInfo.isUS ? 'Jumlah Lembar (Shares)' : 'Jumlah Lot (1 lot = 100 lbr)'}
            </span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {shareInfo.isCrypto
                ? `${lotsNum} ${cleanSymbol} (Spot Crypto)`
                : shareInfo.isUS
                ? `${lotsNum} shares @ USD`
                : `= ${(lotsNum * 100).toLocaleString('id-ID')} lbr`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleAddLots(shareInfo.isCrypto ? -0.1 : -1)}
              className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-base hover:bg-white/5 active:scale-95 cursor-pointer"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              -
            </button>
            <input
              type="number"
              step={shareInfo.isCrypto ? 'any' : '1'}
              min={shareInfo.isCrypto ? '0.000001' : '1'}
              value={lotsInput}
              onChange={(e) => setLotsInput(e.target.value)}
              className="flex-1 h-9 px-3 rounded-lg border font-mono text-sm text-center font-bold outline-none focus:border-amber-400"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
            <button
              type="button"
              onClick={() => handleAddLots(1)}
              className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-base hover:bg-white/5 active:scale-95 cursor-pointer"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              +
            </button>
          </div>

          {/* Quick Lot Chips */}
          <div className="flex items-center gap-1 pt-1 overflow-x-auto pb-0.5">
            {[1, 5, 10, 50, 100].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setLotsInput(String(amt))}
                className="flex-1 py-1 text-[10px] font-mono rounded border text-center transition-colors hover:bg-white/5 cursor-pointer"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}
              >
                +{amt}
              </button>
            ))}
          </div>

          {/* Buying Power / Portfolio Holdings % */}
          <div className="grid grid-cols-4 gap-1 pt-1">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleLotPercentage(pct)}
                className="py-1 text-[10px] font-mono rounded border text-center transition-colors hover:border-amber-400 hover:text-amber-400 cursor-pointer"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
              >
                {pct === 100 ? 'Max (100%)' : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* 🛡️ Manajemen Risiko: Take Profit & Stop Loss */}
        <div className="mb-3 p-3 rounded-xl border space-y-2.5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--accent)' }}>
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Manajemen Risiko (TP & SL)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowRiskConfig(!showRiskConfig)}
              className="text-[10px] font-mono underline hover:text-white cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              {showRiskConfig ? 'Tutup' : 'Buka'}
            </button>
          </div>

          {showRiskConfig && (
            <div className="space-y-2.5 pt-1 text-xs">
              {/* Take Profit Toggle & Input */}
              <div className="p-2 rounded-lg border bg-black/20" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-emerald-400">
                    <input
                      type="checkbox"
                      checked={enableTP}
                      onChange={(e) => setEnableTP(e.target.checked)}
                      className="rounded accent-emerald-500 cursor-pointer"
                    />
                    <Target className="w-3.5 h-3.5" />
                    <span>Take Profit (Ambil Untung)</span>
                  </label>
                  {enableTP && tpInput && priceNum > 0 && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      +{(((parseFloat(tpInput) - priceNum) / priceNum) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>

                {enableTP && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleTpStep('DOWN')}
                        className="w-7 h-7 rounded border flex items-center justify-center font-bold text-sm hover:bg-white/5 cursor-pointer"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        placeholder="Harga TP (Rp)"
                        value={tpInput}
                        onChange={(e) => setTpInput(e.target.value)}
                        className="flex-1 h-7 px-2 rounded border font-mono text-xs text-center font-bold outline-none focus:border-emerald-400"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleTpStep('UP')}
                        className="w-7 h-7 rounded border flex items-center justify-center font-bold text-sm hover:bg-white/5 cursor-pointer"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}
                      >
                        +
                      </button>
                    </div>
                    {/* Shortcut persen TP */}
                    <div className="grid grid-cols-4 gap-1">
                      {[3, 5, 10, 15].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setTpByPercent(pct)}
                          className="py-0.5 text-[9px] font-mono rounded border text-center hover:border-emerald-500 hover:text-emerald-400 cursor-pointer"
                          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                        >
                          +{pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stop Loss Toggle & Input */}
              <div className="p-2 rounded-lg border bg-black/20" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-red-400">
                    <input
                      type="checkbox"
                      checked={enableSL}
                      onChange={(e) => setEnableSL(e.target.checked)}
                      className="rounded accent-red-500 cursor-pointer"
                    />
                    <Shield className="w-3.5 h-3.5" />
                    <span>Stop Loss (Batas Kerugian)</span>
                  </label>
                  {enableSL && slInput && priceNum > 0 && (
                    <span className="text-[10px] font-mono font-bold text-red-400">
                      {(((parseFloat(slInput) - priceNum) / priceNum) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>

                {enableSL && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSlStep('DOWN')}
                        className="w-7 h-7 rounded border flex items-center justify-center font-bold text-sm hover:bg-white/5 cursor-pointer"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        placeholder="Harga SL (Rp)"
                        value={slInput}
                        onChange={(e) => setSlInput(e.target.value)}
                        className="flex-1 h-7 px-2 rounded border font-mono text-xs text-center font-bold outline-none focus:border-red-400"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSlStep('UP')}
                        className="w-7 h-7 rounded border flex items-center justify-center font-bold text-sm hover:bg-white/5 cursor-pointer"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}
                      >
                        +
                      </button>
                    </div>
                    {/* Shortcut persen SL */}
                    <div className="grid grid-cols-4 gap-1">
                      {[2, 3, 5, 7].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setSlByPercent(pct)}
                          className="py-0.5 text-[9px] font-mono rounded border text-center hover:border-red-500 hover:text-red-400 cursor-pointer"
                          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                        >
                          -{pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Trailing Stop Toggle & Input */}
              <div className="p-2 rounded-lg border bg-black/20" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-amber-400">
                    <input
                      type="checkbox"
                      checked={enableTrailing}
                      onChange={(e) => setEnableTrailing(e.target.checked)}
                      className="rounded accent-amber-500 cursor-pointer"
                    />
                    <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Trailing Stop (Kunci Untung Otomatis)</span>
                  </label>
                  {enableTrailing && (
                    <span className="text-[10px] font-mono font-bold text-amber-400">
                      -{trailingPercentInput}% dari Puncak
                    </span>
                  )}
                </div>

                {enableTrailing && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="Trailing % (misal 3)"
                        value={trailingPercentInput}
                        onChange={(e) => setTrailingPercentInput(e.target.value)}
                        className="flex-1 h-7 px-2 rounded border font-mono text-xs text-center font-bold outline-none focus:border-amber-400"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                      />
                      <span className="text-xs text-neutral-400 px-1 font-mono">%</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[2, 3, 5, 8].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setTrailingPercentInput(String(pct))}
                          className="py-0.5 text-[9px] font-mono rounded border text-center hover:border-amber-500 hover:text-amber-400 cursor-pointer"
                          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Masa Berlaku (Day Order vs GTC) */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-3 h-3" />
                  Masa Berlaku:
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setValidityType('DAY')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border cursor-pointer ${
                      validityType === 'DAY' ? 'border-amber-400 text-amber-400 bg-amber-400/10' : 'border-zinc-700 text-zinc-400'
                    }`}
                  >
                    Day Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setValidityType('GTC')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border cursor-pointer ${
                      validityType === 'GTC' ? 'border-amber-400 text-amber-400 bg-amber-400/10' : 'border-zinc-700 text-zinc-400'
                    }`}
                  >
                    GTC (Sampai Batal)
                  </button>
                </div>
              </div>

              {/* Tombol Simpan TP/SL jika sudah ada posisi di portofolio */}
              {currentHolding && currentHolding.lots > 0 && (
                <button
                  type="button"
                  onClick={handleUpdateExistingRiskTargets}
                  className="w-full py-1.5 mt-1 rounded border text-[11px] font-bold font-mono transition-colors hover:border-amber-400 text-amber-300 cursor-pointer"
                  style={{ borderColor: 'rgba(255, 215, 0, 0.4)', backgroundColor: 'rgba(255, 215, 0, 0.05)' }}
                >
                  ⚡ Perbarui Target TP / SL Posisi Ini
                </button>
              )}
            </div>
          )}
        </div>

        {/* Calculation Breakdown */}
        <div className="p-3 rounded-xl border text-xs font-mono space-y-1.5 mb-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
            <span>Nilai Transaksi</span>
            <span>Rp {grossTradeValue.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <span>Estimasi Biaya Transaksi</span>
            <span>
              Rp {totalFee.toLocaleString('id-ID')}{' '}
              <span className="text-[9px]">({orderSide === 'BUY' ? 'Fee 0.15%' : 'Fee 0.25% + PPh 0.1%'})</span>
            </span>
          </div>
          <div className="border-t pt-1.5 flex items-center justify-between font-bold text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <span>{orderSide === 'BUY' ? 'Total Pembayaran' : 'Total Diterima'}</span>
            <span style={{ color: orderSide === 'BUY' ? 'var(--positive)' : 'var(--negative)' }}>
              Rp {estimatedTotal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-2.5 rounded-lg border mb-3 text-xs flex items-start gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="leading-tight">{notification.message}</div>
          </div>
        )}
      </div>

      {/* Main Execution Button */}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={handleExecuteOrder}
        className="w-full py-3 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 disabled:opacity-50"
        style={{
          backgroundColor: orderSide === 'BUY' ? 'var(--positive)' : 'var(--negative)',
          color: '#ffffff',
        }}
      >
        <Zap className="w-4 h-4" />
        {orderSide === 'BUY'
          ? `BELI ${cleanSymbol} (${lotsNum} LOT)`
          : `JUAL ${cleanSymbol} (${lotsNum} LOT)`}
      </button>

      {/* Position Sizing & Risk Management Modal */}
      <PositionSizingModal
        quote={quote}
        isOpen={showCalcModal}
        onClose={() => setShowCalcModal(false)}
        onApplyPlan={(plan) => {
          setLotsInput(String(plan.lots));
          setPriceInput(String(plan.price));
          setEnableTP(true);
          setTpInput(String(plan.tp));
          setEnableSL(true);
          setSlInput(String(plan.sl));
          setShowRiskConfig(true);
          setOrderSide('BUY');
          setNotification({
            type: 'success',
            message: `Rencana posisi diterapkan: ${plan.lots} Lot @ Rp ${plan.price.toLocaleString('id-ID')} (TP: Rp ${plan.tp.toLocaleString('id-ID')}, SL: Rp ${plan.sl.toLocaleString('id-ID')})`,
          });
        }}
      />
    </div>
  );
}
