'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { getCompanyLogoCandidates } from '@/lib/stockLogos';

interface CompanyLogoProps {
  symbol: string;
  name?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: 'full' | 'sm' | 'md' | 'lg' | 'xl' | 'none' | string;
  border?: boolean;
}

// Subtle border & text color accents for fallback typography badge (100% transparent bg)
const BADGE_COLOR_PALETTES = [
  { text: 'text-blue-400', border: 'border-blue-500/40' },
  { text: 'text-emerald-400', border: 'border-emerald-500/40' },
  { text: 'text-purple-400', border: 'border-purple-500/40' },
  { text: 'text-amber-400', border: 'border-amber-500/40' },
  { text: 'text-rose-400', border: 'border-rose-500/40' },
  { text: 'text-cyan-400', border: 'border-cyan-500/40' },
  { text: 'text-violet-400', border: 'border-violet-500/40' },
  { text: 'text-teal-400', border: 'border-teal-500/40' },
];

function getTickerColor(ticker: string) {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) {
    hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BADGE_COLOR_PALETTES.length;
  return BADGE_COLOR_PALETTES[index];
}

export default function CompanyLogo({
  symbol,
  name,
  size = 24,
  className = '',
  rounded = 'sm',
  border = false,
}: CompanyLogoProps) {
  const numericSize = useMemo(() => {
    if (typeof size === 'number') return size;
    if (size === 'sm') return 18;
    if (size === 'md') return 24;
    if (size === 'lg') return 36;
    if (size === 'xl') return 48;
    const parsed = parseInt(String(size), 10);
    return isNaN(parsed) ? 24 : parsed;
  }, [size]);

  const roundedClass = useMemo(() => {
    if (rounded === 'full') return 'rounded-full';
    if (rounded === 'sm') return 'rounded-sm';
    if (rounded === 'md') return 'rounded-md';
    if (rounded === 'lg') return 'rounded-lg';
    if (rounded === 'xl') return 'rounded-xl';
    if (rounded === 'none') return 'rounded-none';
    return 'rounded';
  }, [rounded]);

  const cleanSymbol = (symbol || '').replace('.JK', '').replace(/USDT$/i, '').trim().toUpperCase();
  const candidates = useMemo(() => getCompanyLogoCandidates(symbol || ''), [symbol]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasExhausted, setHasExhausted] = useState(false);

  // Reset index whenever symbol changes
  useEffect(() => {
    setCandidateIndex(0);
    setHasExhausted(false);
  }, [symbol]);

  const handleImgError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasExhausted(true);
    }
  };

  const currentUrl = candidates[candidateIndex];
  const palette = useMemo(() => getTickerColor(cleanSymbol || 'IDX'), [cleanSymbol]);
  const initials = cleanSymbol.slice(0, 2) || 'TR';

  // If image not found or all candidates exhausted, render clean transparent typography badge
  if (hasExhausted || !currentUrl || !cleanSymbol) {
    return (
      <div
        className={`shrink-0 flex items-center justify-center font-bold font-mono select-none bg-transparent ${roundedClass} border ${
          palette.border
        } ${palette.text} ${className}`}
        style={{
          width: `${numericSize}px`,
          height: `${numericSize}px`,
          minWidth: `${numericSize}px`,
          minHeight: `${numericSize}px`,
          fontSize: `${Math.max(9, Math.floor(numericSize * 0.42))}px`,
          letterSpacing: '-0.05em',
        }}
        title={name || cleanSymbol}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 flex items-center justify-center select-none bg-transparent ${roundedClass} ${
        border ? 'border border-zinc-800/80' : ''
      } ${className}`}
      style={{
        width: `${numericSize}px`,
        height: `${numericSize}px`,
        minWidth: `${numericSize}px`,
        minHeight: `${numericSize}px`,
      }}
      title={name || cleanSymbol}
    >
      <img
        src={currentUrl}
        alt={`${cleanSymbol} logo`}
        width={numericSize}
        height={numericSize}
        loading="lazy"
        onError={handleImgError}
        className="w-full h-full object-contain bg-transparent transition-opacity duration-150"
      />
    </div>
  );
}
