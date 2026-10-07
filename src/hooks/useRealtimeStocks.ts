'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { LiveStockQuote } from '@/app/api/stocks/realtime/route';

export function useRealtimeStocks(initialTickers: string[] = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'BBCA', 'BMRI', 'BBRI']) {
  const [liveQuotes, setLiveQuotes] = useState<Record<string, LiveStockQuote>>({});
  const [isLive, setIsLive] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const prevPricesRef = useRef<Record<string, number>>({});

  const fetchQuotes = useCallback(async () => {
    if (!initialTickers || initialTickers.length === 0) return;
    try {
      const tickerString = initialTickers.join(',');
      const res = await fetch(`/api/stocks/realtime?tickers=${encodeURIComponent(tickerString)}`);
      if (!res.ok) return;

      const data = await res.json();
      if (data && data.quotes) {
        setLiveQuotes(data.quotes);
        setLastUpdated(new Date().toLocaleTimeString());
        setIsLive(true);
      }
    } catch {
      // Keep existing data on network glitch
    }
  }, [initialTickers]);

  useEffect(() => {
    fetchQuotes();
    // Refresh quotes every 4 seconds
    const interval = setInterval(fetchQuotes, 4000);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  return {
    liveQuotes,
    isLive,
    lastUpdated,
    refreshQuotes: fetchQuotes,
  };
}
