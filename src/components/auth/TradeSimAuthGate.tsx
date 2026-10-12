'use client';

import React from 'react';

/**
 * TradeSimAuthGate
 * 
 * Workstation Paper Trading terbuka secara instan (0ms delay) tanpa blocking screen.
 * Autentikasi dan login cloud dikelola melalui AuthModal di TradeSimHeader.
 */
export default function TradeSimAuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
