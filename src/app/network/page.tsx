'use client';

import React from 'react';
import AdvancedMarketGraph from '@/components/network/AdvancedMarketGraph';

export default function NetworkPage() {
  return (
    <div className="w-full h-[calc(100vh-6rem)] flex flex-col">
      <AdvancedMarketGraph />
    </div>
  );
}
