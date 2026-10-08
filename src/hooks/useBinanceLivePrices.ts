'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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

import { MASTER_GLOBAL_CRYPTO } from '@/data/global_markets_universe';

const INITIAL_CRYPTO_SEEDS: Record<string, { price: number; change24h: number; high: number; low: number; vol: string; qVol: number }> = {};
for (const c of MASTER_GLOBAL_CRYPTO) {
  const base = c.symbol.replace(/USDT$/, '');
  INITIAL_CRYPTO_SEEDS[base] = {
    price: c.price,
    change24h: c.change24h,
    high: c.high24h,
    low: c.low24h,
    vol: c.volume24h,
    qVol: 500000000,
  };
}

function buildInitialSeeds(): Record<string, BinanceTickerData> {
  const initial: Record<string, BinanceTickerData> = {};
  const now = Date.now();
  for (const [base, data] of Object.entries(INITIAL_CRYPTO_SEEDS)) {
    const pairSym = `${base}USDT`;
    const item: BinanceTickerData = {
      symbol: pairSym,
      price: data.price,
      change24h: data.change24h,
      high24h: data.high,
      low24h: data.low,
      volume24h: data.vol,
      quoteVolume24h: data.qVol,
      direction: 'same',
      lastUpdated: now,
    };
    initial[pairSym] = item;
    initial[base] = { ...item, symbol: base };
  }
  return initial;
}

export function useBinanceLivePrices() {
  const [tickerMap, setTickerMap] = useState<Record<string, BinanceTickerData>>(buildInitialSeeds);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastHeartbeat, setLastHeartbeat] = useState<string>(() => new Date().toLocaleTimeString());
  const [error, setError] = useState<string | null>(null);

  const prevPricesRef = useRef<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback to internal Next.js realtime API if direct Binance is blocked by ISP/CORS
  const fetchInternalFallback = useCallback(async () => {
    try {
      const symbols = Object.keys(INITIAL_CRYPTO_SEEDS).join(',');
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
        prevPricesRef.current[pairSym] = currentPrice;
        prevPricesRef.current[base] = currentPrice;
      }

      setTickerMap((prev) => ({ ...prev, ...newMap }));
      setLastHeartbeat(new Date().toLocaleTimeString());
      setIsConnected(true);
    } catch (err) {
      console.warn('Internal crypto fallback error:', err);
    }
  }, []);

  // 1. Initial REST Fetch for instant load (<100ms)
  const fetchInitialSnapshot = useCallback(async () => {
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (!res.ok) {
        await fetchInternalFallback();
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

        // Store both BTCUSDT and BTC so lookup by either key always succeeds
        newMap[sym] = tickerData;
        newMap[base] = { ...tickerData, symbol: base };

        prevPricesRef.current[sym] = currentPrice;
        prevPricesRef.current[base] = currentPrice;
      }

      setTickerMap((prev) => ({ ...prev, ...newMap }));
      setLastHeartbeat(new Date().toLocaleTimeString());
      setIsConnected(true);
    } catch (err) {
      console.warn('Binance direct REST fetch blocked/failed, trying internal fallback:', err);
      await fetchInternalFallback();
    }
  }, [fetchInternalFallback]);

  // 2. Connect to Binance WebSocket (!miniTicker@arr for all USDT pairs in realtime)
  useEffect(() => {
    fetchInitialSnapshot();

    function connectWs() {
      try {
        const ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const rawTickers = JSON.parse(event.data);
            if (!Array.isArray(rawTickers)) return;

            const now = Date.now();
            setTickerMap((prev) => {
              const updated = { ...prev };

              for (const t of rawTickers) {
                const sym = t.s;
                if (!sym || !sym.endsWith('USDT')) continue;

                const curPrice = parseFloat(t.c);
                const openPrice = parseFloat(t.o);
                const highPrice = parseFloat(t.h);
                const lowPrice = parseFloat(t.l);
                const quoteVol = parseFloat(t.q);

                const prevPrice = prevPricesRef.current[sym] ?? curPrice;
                let direction: 'up' | 'down' | 'same' = 'same';
                if (curPrice > prevPrice) direction = 'up';
                else if (curPrice < prevPrice) direction = 'down';

                prevPricesRef.current[sym] = curPrice;

                const changePct = openPrice > 0 ? ((curPrice - openPrice) / openPrice) * 100 : 0;

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

                // Store both BTCUSDT and BTC
                updated[sym] = tickerData;
                updated[base] = { ...tickerData, symbol: base };
                prevPricesRef.current[base] = curPrice;
              }

              return updated;
            });

            setLastHeartbeat(new Date().toLocaleTimeString());
          } catch (e) {
            console.error('Error parsing Binance ws data', e);
          }
        };

        ws.onerror = () => {
          // In some Indonesian ISPs or restricted networks, WS fails. Fallback to REST polling.
          setIsConnected(false);
          fetchInternalFallback();
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Auto reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWs();
          }, 5000);
        };
      } catch (err) {
        setIsConnected(false);
        setError(String(err));
        fetchInternalFallback();
      }
    }

    connectWs();

    // Fallback polling interval every 8s to keep prices live regardless of WebSocket status
    const fallbackInterval = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        fetchInitialSnapshot();
      }
    }, 8000);

    return () => {
      clearInterval(fallbackInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchInitialSnapshot, fetchInternalFallback]);

  return {
    tickerMap,
    isConnected,
    lastHeartbeat,
    error,
    refreshSnapshot: fetchInitialSnapshot,
  };
}
