'use client';

import React from 'react';
import Link from 'next/link';

interface CashtagTextProps {
  text: string;
  className?: string;
  linkClassName?: string;
}

const KNOWN_TICKERS = new Set([
  'BBCA', 'BBRI', 'BMRI', 'BBNI', 'ASII', 'TLKM',
  'ADRO', 'PTBA', 'PGAS', 'AMMN', 'ANTM', 'BREN',
  'ICBP', 'UNVR', 'MYOR', 'GOTO', 'BUKA', 'EMTK',
  'BRIS', 'MEDC', 'INKP', 'MDKA', 'CPIN', 'BRMS',
  'CUAN', 'BUMI', 'DEWA', 'ENRG', 'ERAA', 'EXCL',
  'ISAT', 'GGRM', 'HMSP', 'TOWR', 'TBIG', 'SMGR',
  'KLBF', 'ACES', 'TPIA', 'AKRA', 'ESSA', 'ARTO',
  'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA',
  'NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL',
]);

/**
 * AutoCashtagLinker parses any string and automatically wraps tickers (e.g. $BBCA or BBCA)
 * into internal SEO-friendly links pointing to /stock/[ticker].
 */
export function AutoCashtagLinker({
  text,
  className = '',
  linkClassName = 'text-emerald-400 font-mono font-bold hover:underline hover:text-emerald-300 transition-colors',
}: CashtagTextProps) {
  if (!text) return null;

  // Match words starting with $ or standalone uppercase tickers
  const regex = /(\$[A-Z]{2,6}\b|\b[A-Z]{4}\b)/g;
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const cleanSymbol = part.replace(/^\$/, '').toUpperCase();
        if (KNOWN_TICKERS.has(cleanSymbol)) {
          return (
            <Link
              key={index}
              href={`/stock/${cleanSymbol}`}
              className={linkClassName}
              title={`Buka Simulasi & Analisis ${cleanSymbol}`}
            >
              {part}
            </Link>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
