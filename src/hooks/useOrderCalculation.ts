import { useMemo } from 'react';
import { calculateShares, isValidIDXTick } from '@/lib/stockRules';
import { isCryptoSymbol } from '@/lib/universe/masterAssetUniverse';

interface UseOrderCalculationParams {
  symbol: string;
  price: string;
  lots: string;
  assetClass: 'EQUITY' | 'CRYPTO' | 'US';
  orderType: 'BUY' | 'SELL';
}

export interface OrderCalculationResult {
  priceNum: number;
  lotsNum: number;
  rawSym: string;
  cleanSym: string;
  isCrypto: boolean;
  isUS: boolean;
  isForeign: boolean;
  rate: number;
  tradeValue: number;
  brokerFee: number;
  taxFee: number;
  totalFee: number;
  grandTotal: number;
  shareInfo: { shares: number; isUS: boolean };
  tickValidation: { valid: boolean; tick: number; nearest: number };
}

/**
 * useOrderCalculation - Domain hook for trading math & financial order rules.
 * Separates financial calculation logic from React UI presentation.
 */
export function useOrderCalculation({
  symbol,
  price,
  lots,
  assetClass,
  orderType,
}: UseOrderCalculationParams): OrderCalculationResult {
  return useMemo(() => {
    const priceNum = parseFloat(price) || 0;
    const lotsNum = parseFloat(lots) || 0;
    const rawSym = symbol.trim().toUpperCase();
    const cleanSym = rawSym.replace(/USDT$/i, '');
    const isCrypto = assetClass === 'CRYPTO' || rawSym.endsWith('USDT') || isCryptoSymbol(rawSym);

    const rate = 16000; // Kurs acuan USDT/USD ke IDR
    const shareInfo = calculateShares(rawSym, lotsNum);
    const isUS = assetClass === 'US' || shareInfo.isUS;
    const isForeign = isCrypto || isUS;

    const tradeValue = isForeign
      ? Math.round(priceNum * lotsNum * rate)
      : priceNum * (shareInfo.shares || Math.round(lotsNum * 100));

    // Rincian fee broker & PPh bursa / crypto
    const brokerFee = isCrypto ? Math.round(tradeValue * 0.0010) : Math.round(tradeValue * 0.0015);
    const taxFee = orderType === 'SELL' ? (isCrypto ? Math.round(tradeValue * 0.0010) : isUS ? 0 : Math.round(tradeValue * 0.0010)) : 0;
    const totalFee = brokerFee + taxFee;
    const grandTotal = orderType === 'BUY' ? tradeValue + totalFee : tradeValue - totalFee;

    // Validasi fraksi harga BEI secara realtime (hanya untuk saham IDX)
    const tickValidation = !isForeign && rawSym && priceNum > 0
      ? isValidIDXTick(priceNum)
      : { valid: true, tick: 1, nearest: priceNum };

    return {
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
    };
  }, [symbol, price, lots, assetClass, orderType]);
}
