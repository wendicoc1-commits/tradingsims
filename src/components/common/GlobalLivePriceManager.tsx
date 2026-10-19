'use client';

import { useEffect, useRef } from 'react';
import { usePortfolioStore } from '@/store';
import { useBinanceLivePrices } from '@/hooks/useBinanceLivePrices';
import { isCryptoSymbol, isUSSymbol } from '@/lib/universe/masterAssetUniverse';

/**
 * GlobalLivePriceManager
 *
 * Background hook/komponen yang aktif di seluruh aplikasi:
 * 1. Mengaktifkan singleton WebSocket Binance & REST snapshot secara global.
 * 2. Mengalirkan perubahan harga realtime ke Zustand PortfolioStore secara throttling (tiap 1.5 detik),
 *    sehingga PnL koin kripto di portofolio bergerak live tanpa pernah diam di 0%.
 * 3. Menyinkronkan harga saham IDX & US secara berkala.
 */
export default function GlobalLivePriceManager() {
  const { tickerMap } = useBinanceLivePrices();
  const holdings = usePortfolioStore((s) => s.holdings);
  const updateHoldingPrices = usePortfolioStore((s) => s.updateHoldingPrices);
  const lastSyncTimeRef = useRef<number>(0);

  // 1. Sinkronisasi Live Crypto Prices ke Portfolio Store
  useEffect(() => {
    if (!tickerMap || Object.keys(tickerMap).length === 0 || holdings.length === 0) return;

    const now = Date.now();
    // Throttle update agar tidak membebani re-render (maksimal 1x per 1200ms)
    if (now - lastSyncTimeRef.current < 1200) return;

    const priceMap: Record<string, number> = {};
    let hasPriceChange = false;

    for (const h of holdings) {
      const clean = (h.displaySymbol || h.symbol || '').replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
      const isCrypto =
        h.assetClass === 'CRYPTO' ||
        h.symbol.endsWith('USDT') ||
        h.currency === 'USDT' ||
        isCryptoSymbol(clean);

      if (isCrypto) {
        const item = tickerMap[clean] || tickerMap[`${clean}USDT`] || tickerMap[h.symbol];
        if (item && item.price > 0) {
          priceMap[h.symbol] = item.price;
          priceMap[clean] = item.price;
          priceMap[`${clean}USDT`] = item.price;

          if (Math.abs(item.price - (h.currentPrice || 0)) > 0.000000001 || (h.unrealizedPLPercent ?? 0) === 0) {
            hasPriceChange = true;
          }
        }
      }
    }

    if (hasPriceChange && Object.keys(priceMap).length > 0) {
      lastSyncTimeRef.current = now;
      updateHoldingPrices(priceMap);
    }
  }, [tickerMap, holdings, updateHoldingPrices]);

  // 2. Sinkronisasi Polling untuk Saham IDX & US Stock
  useEffect(() => {
    if (holdings.length === 0) return;

    const syncStockQuotes = async () => {
      try {
        const stockHoldings = holdings.filter((h) => {
          const clean = (h.displaySymbol || h.symbol || '').replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
          const isCrypto =
            h.assetClass === 'CRYPTO' ||
            h.symbol.endsWith('USDT') ||
            h.currency === 'USDT' ||
            isCryptoSymbol(clean);
          return !isCrypto;
        });

        if (stockHoldings.length === 0) return;

        const symbols = stockHoldings.map((h) => {
          const clean = (h.displaySymbol || h.symbol || '').replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
          if (isUSSymbol(clean) || h.currency === 'USD' || h.assetClass === 'US') return clean;
          return h.symbol.includes('.') ? h.symbol : `${clean}.JK`;
        });

        const { fetchBatchQuotes } = await import('@/lib/api');
        const raw = await fetchBatchQuotes(symbols).catch(() => null);
        const quotesList = Array.isArray(raw) ? raw : (raw as any)?.quotes || [];
        const map: Record<string, number> = {};

        quotesList.forEach((q: any) => {
          if (q?.price > 0) {
            const clean = (q.displaySymbol || q.symbol || '').replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
            map[q.symbol] = q.price;
            map[q.displaySymbol] = q.price;
            map[clean] = q.price;
            map[`${clean}.JK`] = q.price;
          }
        });

        // Pastikan tidak ada saham yang tersangkut di 0% PnL: jika ada saham dengan unrealizedPLPercent === 0, injeksi harganya ke updateHoldingPrices
        const hasZeroStock = stockHoldings.some((h) => (h.unrealizedPLPercent ?? 0) === 0);
        if (hasZeroStock) {
          stockHoldings.forEach((h) => {
            const cur = h.currentPrice || 0;
            if (cur > 0) {
              const clean = (h.displaySymbol || h.symbol || '').replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
              map[h.symbol] = cur;
              map[clean] = cur;
            }
          });
        }

        if (Object.keys(map).length > 0) {
          updateHoldingPrices(map);
        }
      } catch {
        // Fallback gracefully
      }
    };

    syncStockQuotes();
    const interval = setInterval(syncStockQuotes, 10000);
    return () => clearInterval(interval);
  }, [holdings.length, updateHoldingPrices]);

  return null;
}
