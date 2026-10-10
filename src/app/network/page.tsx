'use client';

import React, { useState } from 'react';
import AdvancedMarketGraph from '@/components/network/AdvancedMarketGraph';
import TradeSimKnowledgeGraphViewer from '@/components/network/TradeSimKnowledgeGraphViewer';
import { Layers, Box, Sparkles } from 'lucide-react';

export default function NetworkPage() {
  const [viewEngine, setViewEngine] = useState<'obsidian' | '3d'>('obsidian');

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex flex-col space-y-3 font-sans">
      {/* Top Engine Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 bg-zinc-950/90 border border-zinc-800 rounded-xl shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-extrabold text-white">
              Unified Network &amp; Architecture Graph Universe
            </h1>
            <p className="text-[10px] sm:text-[11px] text-zinc-400">
              Integrasi penuh Obsidian Graph View (Arsitektur Sistem &amp; Konglomerasi Saham BEI) serta simulasi 3D WebGL.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
          <button
            onClick={() => setViewEngine('obsidian')}
            className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewEngine === 'obsidian'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Obsidian Graph View</span>
          </button>
          <button
            onClick={() => setViewEngine('3d')}
            className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewEngine === '3d'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D WebGL Universe</span>
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 w-full min-h-[640px]">
        {viewEngine === 'obsidian' ? (
          <TradeSimKnowledgeGraphViewer />
        ) : (
          <AdvancedMarketGraph />
        )}
      </div>
    </div>
  );
}
