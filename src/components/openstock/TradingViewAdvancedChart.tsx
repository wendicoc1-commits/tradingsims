'use client';

import React, { useEffect, useRef } from 'react';
import { isCryptoSymbol, isUSSymbol } from '@/lib/universe/masterAssetUniverse';

interface TradingViewAdvancedChartProps {
  symbol?: string;
  theme?: 'dark' | 'light';
  height?: number | string;
}

export default function TradingViewAdvancedChart({
  symbol = 'BBCA',
  theme = 'dark',
  height = 360,
}: TradingViewAdvancedChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize symbol for TradingView:
  const getTvSymbol = (sym: string) => {
    const s = sym.toUpperCase().trim().replace('.JK', '');
    if (s.includes(':')) return s;
    if (s === '^JKSE' || s === 'JKSE') return 'IDX:COMPOSITE';
    if (isCryptoSymbol(s) || s.endsWith('USDT')) {
      const clean = s.replace(/USDT$/i, '');
      return `BINANCE:${clean}USDT`;
    }
    if (isUSSymbol(s)) {
      return `NASDAQ:${s}`;
    }
    return `IDX:${s}`;
  };

  const tvSymbol = getTvSymbol(symbol);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: 'D',
      timezone: 'Asia/Jakarta',
      theme: theme,
      style: '1',
      locale: 'id',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      backgroundColor: '#09090b',
      gridColor: '#18181b',
    });

    container.appendChild(widgetDiv);
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [tvSymbol, theme]);

  return (
    <div
      ref={containerRef}
      style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}
      className="tradingview-widget-container rounded overflow-hidden border border-[#27272a] bg-[#09090b] w-full min-h-[300px]"
    />
  );
}
