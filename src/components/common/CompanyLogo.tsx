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

export default function CompanyLogo({
  symbol,
  name,
  size = 24,
  className = '',
  border = false,
}: CompanyLogoProps) {
  const cleanSymbol = (symbol || '').replace('.JK', '').trim().toUpperCase();
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

  if (hasExhausted || !currentUrl || !cleanSymbol) {
    return (
      <div
        className={`shrink-0 flex items-center justify-center font-bold font-mono text-zinc-400 select-none bg-transparent ${
          border ? 'border border-zinc-800' : ''
        } ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          fontSize: `${Math.max(8, Math.floor(size * 0.38))}px`,
        }}
        title={name || cleanSymbol}
      >
        {cleanSymbol.slice(0, 2)}
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 flex items-center justify-center bg-transparent select-none ${
        border ? 'border border-zinc-800/60' : ''
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
        className="w-full h-full object-contain bg-transparent transition-opacity duration-150"
      />
    </div>
  );
}
