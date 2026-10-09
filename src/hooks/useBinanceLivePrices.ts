'use client';

import { useEffect, useCallback } from 'react';
import { useCryptoPriceStore } from '@/store/useCryptoPriceStore';
import { MASTER_GLOBAL_CRYPTO } from '@/data/global_markets_universe';
import { globalTickBuffer } from '@/lib/office/HighFrequencyTickBuffer';

export interface BinanceTickerData {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  quoteVolume24h: number;
  direction?: 'up' | 'down' | 'same';
  lastUpdated: number;
}

// ── Module-level WebSocket Singleton State ──
let globalWs: WebSocket | null = null;
let globalSubscriberCount = 0;
let reconnectTimer: NodeJS.Timeout | null = null;
const globalPrevPrices: Record<string, number> = {};
let hasFetchedInitial = false;

async function fetchInternalCryptoFallback() {
  try {
    const symbols = MASTER_GLOBAL_CRYPTO.map((c) => c.symbol.replace(/USDT$/, '')).join(',');
    const res = await fetch(`/api/stocks/realtime?tickers=${symbols}`);
    if (!res.ok) return;
    const data = await res.json();
    const quotes = data?.quotes || {};
    const newMap: Record<string, BinanceTickerData> = {};
    const now = Date.now();

    for (const [sym, q] of Object.entries(quotes) as [string, any][]) {
      if (!q || !q.price) continue;
      const base = sym.replace(/USDT$/, '').replace(/-USD$/, '');
      const pairSym = `${base}USDT`;
      const currentPrice = q.price;
      const changePct = q.changePct ?? 0;
      const high = q.high ?? currentPrice * 1.02;
      const low = q.low ?? currentPrice * 0.98;

      const vol = '$' + (currentPrice > 1000 ? '12.4B' : '450M');
      const tickerData: BinanceTickerData = {
        symbol: pairSym,
        price: currentPrice,
        change24h: changePct,
        high24h: high,
        low24h: low,
        volume24h: vol,
        quoteVolume24h: 500000000,
        direction: 'same',
        lastUpdated: now,
      };

      newMap[pairSym] = tickerData;
      newMap[base] = { ...tickerData, symbol: base };
      globalPrevPrices[pairSym] = currentPrice;
      globalPrevPrices[base] = currentPrice;
    }

    useCryptoPriceStore.getState().setTickerMap((prev) => ({ ...prev, ...newMap }));
    useCryptoPriceStore.getState().setLastHeartbeat(new Date().toLocaleTimeString());
    useCryptoPriceStore.getState().setIsConnected(true);
  } catch (err) {
    console.warn('Internal crypto fallback error:', err);
  }
}

async function fetchInitialRestSnapshot() {
  if (hasFetchedInitial) return;
  hasFetchedInitial = true;
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    if (!res.ok) {
      await fetchInternalCryptoFallback();
      return;
    }
    const data = await res.json();
    const newMap: Record<string, BinanceTickerData> = {};
    const now = Date.now();

    for (const item of data) {
      const sym = item.symbol;
      if (!sym.endsWith('USDT')) continue;

      const currentPrice = parseFloat(item.lastPrice);
      const changePct = parseFloat(item.priceChangePercent);
      const high = parseFloat(item.highPrice);
      const low = parseFloat(item.lowPrice);
      const quoteVol = parseFloat(item.quoteVolume);

      let volFormatted = '$' + quoteVol.toLocaleString();
      if (quoteVol >= 1e9) {
        volFormatted = '$' + (quoteVol / 1e9).toFixed(2) + 'B';
      } else if (quoteVol >= 1e6) {
        volFormatted = '$' + (quoteVol / 1e6).toFixed(2) + 'M';
      }

      const base = sym.replace(/USDT$/, '');
      const tickerData: BinanceTickerData = {
        symbol: sym,
        price: currentPrice,
        change24h: changePct,
        high24h: high,
        low24h: low,
        volume24h: volFormatted,
        quoteVolume24h: quoteVol,
        direction: 'same',
        lastUpdated: now,
      };

      newMap[sym] = tickerData;
      newMap[base] = { ...tickerData, symbol: base };
      globalPrevPrices[sym] = currentPrice;
      globalPrevPrices[base] = currentPrice;
    }

    useCryptoPriceStore.getState().setTickerMap((prev) => ({ ...prev, ...newMap }));
    useCryptoPriceStore.getState().setLastHeartbeat(new Date().toLocaleTimeString());
    useCryptoPriceStore.getState().setIsConnected(true);
  } catch {
    await fetchInternalCryptoFallback();
  }
}

let pendingTickersBatch: Record<string, BinanceTickerData> = {};
let batchFlushTimer: NodeJS.Timeout | null = null;

function flushTickerBatch() {
  if (Object.keys(pendingTickersBatch).length === 0) return;
  const toFlush = pendingTickersBatch;
  pendingTickersBatch = {};
  useCryptoPriceStore.getState().setTickerMap((prev) => ({
    ...prev,
    ...toFlush,
  }));
  useCryptoPriceStore.getState().setLastHeartbeat(new Date().toLocaleTimeString());
}

function initSingletonWebSocket() {
  if (typeof window === 'undefined') return;
  if (globalWs && (globalWs.readyState === WebSocket.OPEN || globalWs.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');
    globalWs = ws;

    ws.onopen = () => {
      useCryptoPriceStore.getState().setIsConnected(true);
      useCryptoPriceStore.getState().setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const rawTickers = JSON.parse(event.data);
        if (!Array.isArray(rawTickers)) return;

        const now = Date.now();

        for (const t of rawTickers) {
          const sym = t.s;
          if (!sym || !sym.endsWith('USDT')) continue;

          const curPrice = parseFloat(t.c);
          const openPrice = parseFloat(t.o);
          const highPrice = parseFloat(t.h);
          const lowPrice = parseFloat(t.l);
          const quoteVol = parseFloat(t.q);

          const prevPrice = globalPrevPrices[sym] ?? curPrice;
          let direction: 'up' | 'down' | 'same' = 'same';
          if (curPrice > prevPrice) direction = 'up';
          else if (curPrice < prevPrice) direction = 'down';

          globalPrevPrices[sym] = curPrice;

          const changePct = openPrice > 0 ? ((curPrice - openPrice) / openPrice) * 100 : 0;

          // Push instantly to high-frequency zero-allocation RingBuffer
          globalTickBuffer.push({
            symbol: sym,
            price: curPrice,
            change24h: Math.round(changePct * 100) / 100,
            timestamp: now,
            volume: quoteVol,
          });

          let volFormatted = '$' + quoteVol.toLocaleString();
          if (quoteVol >= 1e9) {
            volFormatted = '$' + (quoteVol / 1e9).toFixed(2) + 'B';
          } else if (quoteVol >= 1e6) {
            volFormatted = '$' + (quoteVol / 1e6).toFixed(2) + 'M';
          }

          const base = sym.replace(/USDT$/, '');
          const tickerData: BinanceTickerData = {
            symbol: sym,
            price: curPrice,
            change24h: Math.round(changePct * 100) / 100,
            high24h: highPrice,
            low24h: lowPrice,
            volume24h: volFormatted,
            quoteVolume24h: quoteVol,
            direction,
            lastUpdated: now,
          };

          pendingTickersBatch[sym] = tickerData;
          pendingTickersBatch[base] = { ...tickerData, symbol: base };
          globalPrevPrices[base] = curPrice;
        }

        // Batch flush ke React Store setiap 200ms untuk mencegah DOM re-render storm
        if (!batchFlushTimer) {
          batchFlushTimer = setTimeout(() => {
            batchFlushTimer = null;
            flushTickerBatch();
          }, 200);
        }
      } catch (e) {
        console.error('Error parsing Binance ws data', e);
      }
    };

    ws.onerror = () => {
      useCryptoPriceStore.getState().setIsConnected(false);
      fetchInternalCryptoFallback();
    };

    ws.onclose = () => {
      useCryptoPriceStore.getState().setIsConnected(false);
      globalWs = null;
      // Reconnect if there are still active subscribers
      if (globalSubscriberCount > 0) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          initSingletonWebSocket();
        }, 3000);
      }
    };
  } catch {
    fetchInternalCryptoFallback();
  }
}

/**
 * useBinanceLivePrices
 * Connects to a SINGLE shared WebSocket instance regardless of how many components call this hook.
 */
export function useBinanceLivePrices() {
  const tickerMap = useCryptoPriceStore((s) => s.tickerMap);
  const isConnected = useCryptoPriceStore((s) => s.isConnected);
  const lastHeartbeat = useCryptoPriceStore((s) => s.lastHeartbeat);
  const error = useCryptoPriceStore((s) => s.error);

  useEffect(() => {
    globalSubscriberCount++;
    fetchInitialRestSnapshot();
    initSingletonWebSocket();

    return () => {
      globalSubscriberCount = Math.max(0, globalSubscriberCount - 1);
      if (globalSubscriberCount === 0 && globalWs) {
        // If all components unmounted, close socket to prevent background idle leak
        globalWs.close();
        globalWs = null;
        if (reconnectTimer) clearTimeout(reconnectTimer);
      }
    };
  }, []);

  const refreshSnapshot = useCallback(() => {
    hasFetchedInitial = false;
    fetchInitialRestSnapshot();
  }, []);

  return {
    tickerMap,
    isConnected,
    lastHeartbeat,
    error,
    refreshSnapshot,
  };
}
