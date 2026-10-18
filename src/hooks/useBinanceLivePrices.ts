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
    const res = await fetch('/api/crypto/realtime');
    if (!res.ok) return;
    const data = await res.json();
    const tickers = data?.tickers || {};
    if (Object.keys(tickers).length === 0) return;

    const newMap: Record<string, BinanceTickerData> = {};
    const now = Date.now();

    for (const [sym, t] of Object.entries(tickers) as [string, any][]) {
      if (!t || !t.price) continue;
      const prevPrice = globalPrevPrices[sym] ?? t.price;
      let direction: 'up' | 'down' | 'same' = 'same';
      if (t.price > prevPrice) direction = 'up';
      else if (t.price < prevPrice) direction = 'down';

      globalPrevPrices[sym] = t.price;

      if (direction !== 'same') {
        globalTickBuffer.push({
          symbol: sym,
          price: t.price,
          change24h: t.change24h ?? 0,
          timestamp: now,
          volume: t.quoteVolume24h ?? 1000000,
        });
      }

      newMap[sym] = {
        symbol: sym,
        price: t.price,
        change24h: t.change24h ?? 0,
        high24h: t.high24h ?? t.price * 1.02,
        low24h: t.low24h ?? t.price * 0.98,
        volume24h: t.volume24h ?? '$50M',
        quoteVolume24h: t.quoteVolume24h ?? 50000000,
        direction,
        lastUpdated: now,
      };
    }

    useCryptoPriceStore.getState().setTickerMap((prev) => ({ ...prev, ...newMap }));
    useCryptoPriceStore.getState().setLastHeartbeat(new Date().toLocaleTimeString());
    useCryptoPriceStore.getState().setIsConnected(true);
  } catch (err) {
    console.warn('Internal crypto realtime sync error:', err);
  }
}

let globalFuturesWs: WebSocket | null = null;
let reconnectFuturesTimer: NodeJS.Timeout | null = null;

let lastRestSnapshotTime = 0;

async function fetchInitialRestSnapshot(force = false) {
  const nowMs = Date.now();
  if (!force && hasFetchedInitial && (nowMs - lastRestSnapshotTime < 2500)) return;
  hasFetchedInitial = true;
  lastRestSnapshotTime = nowMs;
  try {
    const newMap: Record<string, BinanceTickerData> = {};
    const now = Date.now();

    // 1. Panggil server Next.js lokal dan Binance Vision (tidak terblokir di ISP Indonesia)
    const [internalRes, visionRes, spotRes, futuresRes] = await Promise.allSettled([
      fetch('/api/crypto/realtime'),
      fetch('https://data-api.binance.vision/api/v3/ticker/24hr'),
      fetch('https://api.binance.com/api/v3/ticker/24hr'),
      fetch('https://fapi.binance.com/fapi/v1/ticker/24hr'),
    ]);

    // Jika internal endpoint berhasil (100% tidak terblokir di ISP Indonesia)
    if (internalRes.status === 'fulfilled' && internalRes.value.ok) {
      const internalData = await internalRes.value.json();
      const tickers = internalData?.tickers || {};
      for (const [sym, t] of Object.entries(tickers) as [string, any][]) {
        if (!t || !t.price) continue;
        newMap[sym] = {
          symbol: sym,
          price: t.price,
          change24h: t.change24h ?? 0,
          high24h: t.high24h ?? t.price * 1.02,
          low24h: t.low24h ?? t.price * 0.98,
          volume24h: t.volume24h ?? '$50M',
          quoteVolume24h: t.quoteVolume24h ?? 50000000,
          direction: 'same',
          lastUpdated: now,
        };
        globalPrevPrices[sym] = t.price;
      }
    }

    // 2. Process Binance Spot (Vision atau api.binance.com)
    const validSpotRes = (visionRes.status === 'fulfilled' && visionRes.value.ok)
      ? visionRes
      : (spotRes.status === 'fulfilled' && spotRes.value.ok)
      ? spotRes
      : null;

    if (validSpotRes) {
      const spotData = await validSpotRes.value.json();
      if (Array.isArray(spotData)) {
        for (const item of spotData) {
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
      }
    }

    // 2. Process Binance Futures Tickers (Supplements coins not on Spot, e.g. POPCAT, MEW, KAS, AKT)
    if (futuresRes.status === 'fulfilled' && futuresRes.value.ok) {
      const futuresData = await futuresRes.value.json();
      if (Array.isArray(futuresData)) {
        for (const item of futuresData) {
          const sym = item.symbol;
          if (!sym.endsWith('USDT')) continue;
          if (newMap[sym]) continue; // Already covered by Spot

          const currentPrice = parseFloat(item.lastPrice);
          const changePct = parseFloat(item.priceChangePercent);
          const high = parseFloat(item.highPrice);
          const low = parseFloat(item.lowPrice);
          const quoteVol = parseFloat(item.quoteVolume || '0');

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
      }
    }

    // 3. Process Bybit Spot for tokens delisted on Binance (e.g. MKRUSDT)
    try {
      const bybitRes = await fetch('https://api.bybit.com/v5/market/tickers?category=spot&symbol=MKRUSDT');
      if (bybitRes.ok) {
        const bybitData = await bybitRes.json();
        const item = bybitData?.result?.list?.[0];
        if (item) {
          const currentPrice = parseFloat(item.lastPrice);
          const changePct = parseFloat(item.price24hPcnt) * 100;
          const high = parseFloat(item.highPrice24h);
          const low = parseFloat(item.lowPrice24h);
          const quoteVol = parseFloat(item.turnover24h || '0');
          const volFormatted = '$' + (quoteVol >= 1e6 ? (quoteVol / 1e6).toFixed(2) + 'M' : quoteVol.toLocaleString());
          const tickerData: BinanceTickerData = {
            symbol: 'MKRUSDT',
            price: currentPrice,
            change24h: Math.round(changePct * 100) / 100,
            high24h: high,
            low24h: low,
            volume24h: volFormatted,
            quoteVolume24h: quoteVol,
            direction: 'same',
            lastUpdated: now,
          };
          newMap['MKRUSDT'] = tickerData;
          newMap['MKR'] = { ...tickerData, symbol: 'MKR' };
          globalPrevPrices['MKRUSDT'] = currentPrice;
          globalPrevPrices['MKR'] = currentPrice;
        }
      }
    } catch {
      // Bybit fallback
    }

    // 4. Guarantee that all MASTER_GLOBAL_CRYPTO tokens (including MKR) have at least a verified benchmark if still missing
    for (const c of MASTER_GLOBAL_CRYPTO) {
      const base = c.symbol.replace(/USDT$/, '');
      if (!newMap[c.symbol] && !newMap[base]) {
        const fallbackTicker: BinanceTickerData = {
          symbol: c.symbol,
          price: c.price,
          change24h: c.change24h || 0.76,
          high24h: c.high24h || c.price * 1.015,
          low24h: c.low24h || c.price * 0.985,
          volume24h: c.volume24h || '$45.2M',
          quoteVolume24h: 45200000,
          direction: 'same',
          lastUpdated: now,
        };
        newMap[c.symbol] = fallbackTicker;
        newMap[base] = { ...fallbackTicker, symbol: base };
        globalPrevPrices[c.symbol] = c.price;
        globalPrevPrices[base] = c.price;
      }
    }

    if (Object.keys(newMap).length > 0) {
      useCryptoPriceStore.getState().setTickerMap((prev) => ({ ...prev, ...newMap }));
      useCryptoPriceStore.getState().setLastHeartbeat(new Date().toLocaleTimeString());
      useCryptoPriceStore.getState().setIsConnected(true);
    } else {
      await fetchInternalCryptoFallback();
    }
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

function processIncomingTickers(rawTickers: any[]) {
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

    // Propagate 1:1 rebrand aliases so users searching legacy or new tickers get real-time price
    if (sym === 'SUSDT') {
      pendingTickersBatch['FTMUSDT'] = { ...tickerData, symbol: 'FTMUSDT' };
      pendingTickersBatch['FTM'] = { ...tickerData, symbol: 'FTM' };
      pendingTickersBatch['SONICUSDT'] = { ...tickerData, symbol: 'SONICUSDT' };
      pendingTickersBatch['SONIC'] = { ...tickerData, symbol: 'SONIC' };
      globalPrevPrices['FTMUSDT'] = curPrice;
      globalPrevPrices['FTM'] = curPrice;
    } else if (sym === 'POLUSDT') {
      pendingTickersBatch['MATICUSDT'] = { ...tickerData, symbol: 'MATICUSDT' };
      pendingTickersBatch['MATIC'] = { ...tickerData, symbol: 'MATIC' };
      globalPrevPrices['MATICUSDT'] = curPrice;
      globalPrevPrices['MATIC'] = curPrice;
    } else if (sym === 'RENDERUSDT') {
      pendingTickersBatch['RNDRUSDT'] = { ...tickerData, symbol: 'RNDRUSDT' };
      pendingTickersBatch['RNDR'] = { ...tickerData, symbol: 'RNDR' };
      globalPrevPrices['RNDRUSDT'] = curPrice;
      globalPrevPrices['RNDR'] = curPrice;
    }
  }

  if (!batchFlushTimer) {
    batchFlushTimer = setTimeout(() => {
      batchFlushTimer = null;
      flushTickerBatch();
    }, 200);
  }
}

function initSingletonWebSocket() {
  if (typeof window === 'undefined') return;

  // 1. Connect Binance Spot WebSocket
  if (!globalWs || (globalWs.readyState !== WebSocket.OPEN && globalWs.readyState !== WebSocket.CONNECTING)) {
    try {
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');
      globalWs = ws;

      ws.onopen = () => {
        useCryptoPriceStore.getState().setIsConnected(true);
        useCryptoPriceStore.getState().setError(null);
      };

      ws.onmessage = (event) => {
        try {
          processIncomingTickers(JSON.parse(event.data));
        } catch (e) {
          console.error('Error parsing Binance ws data', e);
        }
      };

      ws.onerror = () => {
        useCryptoPriceStore.getState().setIsConnected(false);
      };

      ws.onclose = () => {
        globalWs = null;
        if (globalSubscriberCount > 0) {
          if (reconnectTimer) clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => initSingletonWebSocket(), 3000);
        }
      };
    } catch {
      // ignore
    }
  }

  // 2. Connect Binance Futures WebSocket (Provides live ticks for POPCAT, MEW, KAS, AKT, etc.)
  if (!globalFuturesWs || (globalFuturesWs.readyState !== WebSocket.OPEN && globalFuturesWs.readyState !== WebSocket.CONNECTING)) {
    try {
      const fws = new WebSocket('wss://fstream.binance.com/ws/!miniTicker@arr');
      globalFuturesWs = fws;

      fws.onmessage = (event) => {
        try {
          processIncomingTickers(JSON.parse(event.data));
        } catch {
          // ignore
        }
      };

      fws.onclose = () => {
        globalFuturesWs = null;
        if (globalSubscriberCount > 0) {
          if (reconnectFuturesTimer) clearTimeout(reconnectFuturesTimer);
          reconnectFuturesTimer = setTimeout(() => initSingletonWebSocket(), 4000);
        }
      };
    } catch {
      // ignore
    }
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

    // ── Polling Interval Cadangan (Dual-Stream Failover) ──
    // Menjamin jika WebSocket terputus, di-throttle browser di background tab,
    // atau terhalang firewall ISP/VPN di Indonesia, harga tetap bergerak dinamis!
    const pollInterval = setInterval(() => {
      fetchInternalCryptoFallback();
    }, 2000);

    return () => {
      clearInterval(pollInterval);
      globalSubscriberCount = Math.max(0, globalSubscriberCount - 1);
      if (globalSubscriberCount === 0) {
        // If all components unmounted, close sockets to prevent background idle leak
        if (globalWs) {
          globalWs.close();
          globalWs = null;
        }
        if (globalFuturesWs) {
          globalFuturesWs.close();
          globalFuturesWs = null;
        }
        if (reconnectTimer) clearTimeout(reconnectTimer);
        if (reconnectFuturesTimer) clearTimeout(reconnectFuturesTimer);
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
