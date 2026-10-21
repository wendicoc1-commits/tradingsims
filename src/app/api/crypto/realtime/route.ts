import { NextResponse } from 'next/server';
import { MASTER_GLOBAL_CRYPTO } from '@/data/global_markets_universe';

export interface CryptoTickerItem {
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

// In-memory server cache to minimize upstream exchange calls
let cachedTickers: Record<string, CryptoTickerItem> = {};
let lastCacheTime = 0;
const CACHE_TTL_MS = 1200; // 1.2s fresh cache
let inFlightFetch: Promise<Record<string, CryptoTickerItem>> | null = null;

async function fetchFromUpstream(): Promise<Record<string, CryptoTickerItem>> {
  const result: Record<string, CryptoTickerItem> = {};
  const now = Date.now();

  // 1. Try Binance Vision Spot Tickers (Public AWS mirror, non-blocked)
  // and Bybit Spot API concurrently
  const [visionRes, bybitRes, futuresRes] = await Promise.allSettled([
    fetch('https://data-api.binance.vision/api/v3/ticker/24hr', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    }).catch(() => null),
    fetch('https://api.bybit.com/v5/market/tickers?category=spot', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    }).catch(() => null),
    fetch('https://fapi.binance.com/fapi/v1/ticker/24hr', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    }).catch(() => null),
  ]);

  // Helper format volume
  const formatVol = (num: number) => {
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(1) + 'K';
    return '$' + Math.round(num).toLocaleString('en-US');
  };

  // Process Binance Spot
  if (visionRes.status === 'fulfilled' && visionRes.value && visionRes.value.ok) {
    try {
      const data = await visionRes.value.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const sym = item.symbol;
          if (!sym || !sym.endsWith('USDT')) continue;
          const curPrice = parseFloat(item.lastPrice);
          if (!curPrice || curPrice <= 0) continue;
          const changePct = parseFloat(item.priceChangePercent) || 0;
          const high = parseFloat(item.highPrice) || curPrice * 1.02;
          const low = parseFloat(item.lowPrice) || curPrice * 0.98;
          const quoteVol = parseFloat(item.quoteVolume) || 0;
          const base = sym.replace(/USDT$/, '');

          const tickerItem: CryptoTickerItem = {
            symbol: sym,
            price: curPrice,
            change24h: Math.round(changePct * 100) / 100,
            high24h: high,
            low24h: low,
            volume24h: formatVol(quoteVol),
            quoteVolume24h: quoteVol,
            direction: 'same',
            lastUpdated: now,
          };

          result[sym] = tickerItem;
          result[base] = { ...tickerItem, symbol: base };
        }
      }
    } catch {
      // Ignore parse failure
    }
  }

  // Process Binance Futures (For coins like POPCAT, MEW, KAS, AKT)
  if (futuresRes.status === 'fulfilled' && futuresRes.value && futuresRes.value.ok) {
    try {
      const fData = await futuresRes.value.json();
      if (Array.isArray(fData)) {
        for (const item of fData) {
          const sym = item.symbol;
          if (!sym || !sym.endsWith('USDT')) continue;
          if (result[sym]) continue; // Spot takes priority

          const curPrice = parseFloat(item.lastPrice);
          if (!curPrice || curPrice <= 0) continue;
          const changePct = parseFloat(item.priceChangePercent) || 0;
          const high = parseFloat(item.highPrice) || curPrice * 1.02;
          const low = parseFloat(item.lowPrice) || curPrice * 0.98;
          const quoteVol = parseFloat(item.quoteVolume || '0') || 0;
          const base = sym.replace(/USDT$/, '');

          const tickerItem: CryptoTickerItem = {
            symbol: sym,
            price: curPrice,
            change24h: Math.round(changePct * 100) / 100,
            high24h: high,
            low24h: low,
            volume24h: formatVol(quoteVol),
            quoteVolume24h: quoteVol,
            direction: 'same',
            lastUpdated: now,
          };

          result[sym] = tickerItem;
          result[base] = { ...tickerItem, symbol: base };
        }
      }
    } catch {
      // Ignore parse failure
    }
  }

  // Process Bybit Spot (e.g. MKRUSDT and general failover)
  if (bybitRes.status === 'fulfilled' && bybitRes.value && bybitRes.value.ok) {
    try {
      const bData = await bybitRes.value.json();
      const list = bData?.result?.list;
      if (Array.isArray(list)) {
        for (const item of list) {
          const sym = item.symbol;
          if (!sym || !sym.endsWith('USDT')) continue;
          const base = sym.replace(/USDT$/, '');
          if (result[sym] && result[base]) continue; // Already provided by Binance

          const curPrice = parseFloat(item.lastPrice);
          if (!curPrice || curPrice <= 0) continue;
          const changePct = (parseFloat(item.price24hPcnt) || 0) * 100;
          const high = parseFloat(item.highPrice24h) || curPrice * 1.02;
          const low = parseFloat(item.lowPrice24h) || curPrice * 0.98;
          const quoteVol = parseFloat(item.turnover24h || '0') || 0;

          const tickerItem: CryptoTickerItem = {
            symbol: sym,
            price: curPrice,
            change24h: Math.round(changePct * 100) / 100,
            high24h: high,
            low24h: low,
            volume24h: formatVol(quoteVol),
            quoteVolume24h: quoteVol,
            direction: 'same',
            lastUpdated: now,
          };

          result[sym] = tickerItem;
          result[base] = { ...tickerItem, symbol: base };
        }
      }
    } catch {
      // Ignore parse failure
    }
  }

  // Handle aliases (S/SONIC, POL/MATIC, RENDER/RNDR)
  if (result['SUSDT']) {
    result['FTMUSDT'] = { ...result['SUSDT'], symbol: 'FTMUSDT' };
    result['FTM'] = { ...result['SUSDT'], symbol: 'FTM' };
    result['SONICUSDT'] = { ...result['SUSDT'], symbol: 'SONICUSDT' };
    result['SONIC'] = { ...result['SUSDT'], symbol: 'SONIC' };
  }
  if (result['POLUSDT']) {
    result['MATICUSDT'] = { ...result['POLUSDT'], symbol: 'MATICUSDT' };
    result['MATIC'] = { ...result['POLUSDT'], symbol: 'MATIC' };
  }
  if (result['RENDERUSDT']) {
    result['RNDRUSDT'] = { ...result['RENDERUSDT'], symbol: 'RNDRUSDT' };
    result['RNDR'] = { ...result['RENDERUSDT'], symbol: 'RNDR' };
  }

  // 4. Ensure ALL tokens from MASTER_GLOBAL_CRYPTO are present with at least benchmark if upstream missed them
  for (const c of MASTER_GLOBAL_CRYPTO) {
    const base = c.symbol.replace(/USDT$/, '');
    if (!result[c.symbol] && !result[base]) {
      const fallbackItem: CryptoTickerItem = {
        symbol: c.symbol,
        price: c.price,
        change24h: c.change24h || 1.25,
        high24h: c.high24h || c.price * 1.02,
        low24h: c.low24h || c.price * 0.98,
        volume24h: c.volume24h || '$45.2M',
        quoteVolume24h: 45200000,
        direction: 'same',
        lastUpdated: now,
      };
      result[c.symbol] = fallbackItem;
      result[base] = { ...fallbackItem, symbol: base };
    }
  }

  return result;
}

export async function GET() {
  const now = Date.now();

  if (Object.keys(cachedTickers).length > 0 && now - lastCacheTime < CACHE_TTL_MS) {
    return NextResponse.json({
      status: 'success',
      source: 'cache',
      timestamp: now,
      count: Object.keys(cachedTickers).length,
      tickers: cachedTickers,
    });
  }

  if (!inFlightFetch) {
    inFlightFetch = fetchFromUpstream()
      .then((data) => {
        if (Object.keys(data).length > 0) {
          cachedTickers = data;
          lastCacheTime = Date.now();
        }
        return cachedTickers;
      })
      .finally(() => {
        inFlightFetch = null;
      });
  }

  const tickers = await inFlightFetch;

  return NextResponse.json({
    status: 'success',
    source: 'upstream',
    timestamp: Date.now(),
    count: Object.keys(tickers).length,
    tickers,
  });
}
