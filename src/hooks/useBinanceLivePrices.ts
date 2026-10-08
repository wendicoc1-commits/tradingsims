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

const INITIAL_CRYPTO_SEEDS: Record<string, { price: number; change24h: number; high: number; low: number; vol: string; qVol: number }> = {
  BTC: { price: 81118, change24h: 0.15, high: 82500, low: 80800, vol: '$42.4B', qVol: 42400000000 },
  ETH: { price: 2450, change24h: 1.15, high: 2490, low: 2380, vol: '$14.2B', qVol: 14200000000 },
  SOL: { price: 108.32, change24h: -0.06, high: 112, low: 106, vol: '$4.8B', qVol: 4800000000 },
  BNB: { price: 585, change24h: 0.95, high: 592, low: 578, vol: '$1.2B', qVol: 1200000000 },
  DOGE: { price: 0.0827, change24h: -0.13, high: 0.086, low: 0.081, vol: '$1.5B', qVol: 1500000000 },
  XRP: { price: 1.42, change24h: 1.20, high: 1.48, low: 1.38, vol: '$3.8B', qVol: 3800000000 },
  ADA: { price: 0.35, change24h: 0.50, high: 0.362, low: 0.341, vol: '$320M', qVol: 320000000 },
  AVAX: { price: 26.5, change24h: 1.80, high: 27.4, low: 25.6, vol: '$450M', qVol: 450000000 },
  SUI: { price: 1.85, change24h: 2.20, high: 1.92, low: 1.78, vol: '$820M', qVol: 820000000 },
  NEAR: { price: 4.67, change24h: -0.49, high: 4.85, low: 4.60, vol: '$380M', qVol: 380000000 },
  LINK: { price: 11.5, change24h: 1.45, high: 11.85, low: 11.15, vol: '$290M', qVol: 290000000 },
  PEPE: { price: 0.00000378, change24h: 1.80, high: 0.00000395, low: 0.00000365, vol: '$780M', qVol: 780000000 },
  SHIB: { price: 0.000018, change24h: 1.20, high: 0.0000188, low: 0.0000174, vol: '$310M', qVol: 310000000 },
  DOT: { price: 4.25, change24h: 0.85, high: 4.38, low: 4.16, vol: '$180M', qVol: 180000000 },
  RENDER: { price: 1.828, change24h: 1.50, high: 1.92, low: 1.78, vol: '$240M', qVol: 240000000 },
  ARB: { price: 0.1672, change24h: 0.80, high: 0.175, low: 0.162, vol: '$210M', qVol: 210000000 },
  APT: { price: 0.7161, change24h: 1.20, high: 0.745, low: 0.701, vol: '$180M', qVol: 180000000 },
  TAO: { price: 540, change24h: 2.80, high: 560, low: 518, vol: '$190M', qVol: 190000000 },
  FET: { price: 1.35, change24h: 2.20, high: 1.42, low: 1.28, vol: '$150M', qVol: 150000000 },
};

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
