'use client';

import React from 'react';
import TradeSimKnowledgeGraphViewer from '@/components/network/TradeSimKnowledgeGraphViewer';

export default function NetworkPage() {
  return (
    <div className="w-full h-full flex flex-col font-sans">
      <TradeSimKnowledgeGraphViewer />
    </div>
  );
}
