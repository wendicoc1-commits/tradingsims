'use client';

import React, { useEffect, useRef } from 'react';

interface TradingViewTechnicalAnalysisProps {
  symbol?: string;
  theme?: 'dark' | 'light';
  height?: number | string;
}

export default function TradingViewTechnicalAnalysis({
  symbol = 'NASDAQ:AAPL',
  theme = 'dark',
  height = 420,
}: TradingViewTechnicalAnalysisProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getTvSymbol = (sym: string) => {
    const s = sym.toUpperCase().trim();
    if (s.includes(':')) return s;
    if (['BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'GOTO', 'ADRO', 'ICBP', 'UNVR'].includes(s)) {
      return `IDX:${s}`;
    }
    if (['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META'].includes(s)) {
      return `NASDAQ:${s}`;
    }
    return s;
  };

  const tvSymbol = getTvSymbol(symbol);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '<div class="tradingview-widget-container__widget"></div>';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: '1D',
      width: '100%',
      isTransparent: false,
      height: typeof height === 'number' ? height : 420,
      symbol: tvSymbol,
      showIntervalTabs: true,
      displayMode: 'multiple',
      locale: 'en',
      colorTheme: theme,
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [tvSymbol, theme, height]);

  return (
    <div
      ref={containerRef}
      style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}
      className="tradingview-widget-container rounded overflow-hidden border border-[#27272a] bg-[#09090b]"
    />
  );
}
