'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { getCompanyLogoCandidates } from '@/lib/stockLogos';

interface CompanyLogoProps {
  symbol: string;
  name?: string;
  size?: number;
  className?: string;
  rounded?: 'full' | 'sm' | 'md' | 'lg' | string;
  border?: boolean;
}

// Deterministic aesthetic color generator based on ticker hash
const BADGE_COLOR_PALETTES = [
  { bg: 'from-blue-600 to-indigo-800', text: 'text-white', border: 'border-blue-500/30' },
  { bg: 'from-emerald-600 to-teal-800', text: 'text-white', border: 'border-emerald-500/30' },
  { bg: 'from-purple-600 to-indigo-900', text: 'text-white', border: 'border-purple-500/30' },
  { bg: 'from-amber-500 to-orange-700', text: 'text-white', border: 'border-amber-500/30' },
  { bg: 'from-rose-600 to-pink-800', text: 'text-white', border: 'border-rose-500/30' },
  { bg: 'from-cyan-600 to-blue-800', text: 'text-white', border: 'border-cyan-500/30' },
  { bg: 'from-violet-600 to-purple-800', text: 'text-white', border: 'border-violet-500/30' },
  { bg: 'from-teal-600 to-emerald-900', text: 'text-white', border: 'border-teal-500/30' },
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
  border = false,
}: CompanyLogoProps) {
  const cleanSymbol = (symbol || '').replace('.JK', '').replace(/USDT$/i, '').trim().toUpperCase();
  const candidates = useMemo(() => getCompanyLogoCandidates(cleanSymbol), [cleanSymbol]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasExhausted, setHasExhausted] = useState(false);

  // Reset index whenever symbol changes
  useEffect(() => {
    setCandidateIndex(0);
    setHasExhausted(false);
  }, [cleanSymbol]);

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

  // If image not found or exhausted, render dynamic crisp typography badge
  if (hasExhausted || !currentUrl || !cleanSymbol) {
    return (
      <div
        className={`shrink-0 flex items-center justify-center font-bold font-mono select-none rounded bg-gradient-to-br ${palette.bg} ${palette.text} ${
          border ? `border ${palette.border}` : ''
        } shadow-inner ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          fontSize: `${Math.max(9, Math.floor(size * 0.42))}px`,
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
      className={`shrink-0 flex items-center justify-center select-none overflow-hidden rounded ${
        border ? 'border border-zinc-800/80' : ''
      } ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
      title={name || cleanSymbol}
    >
      <img
        src={currentUrl}
        alt={`${cleanSymbol} logo`}
        width={size}
        height={size}
        loading="lazy"
        onError={handleImgError}
        className="w-full h-full object-contain transition-opacity duration-150"
      />
    </div>
  );
}
