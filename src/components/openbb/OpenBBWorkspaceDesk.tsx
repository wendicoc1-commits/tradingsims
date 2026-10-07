'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Zap,
  Globe,
  Activity,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';
import OpenBBFinancialStatementsView from './OpenBBFinancialStatementsView';
import OpenBBOptionChainView from './OpenBBOptionChainView';
import OpenBBMacroYieldView from './OpenBBMacroYieldView';

export default function OpenBBWorkspaceDesk({ symbol = 'BBCA' }: { symbol?: string }) {
  const [activeSubTab, setActiveSubTab] = useState<'FINANCIALS' | 'OPTIONS' | 'MACRO'>('FINANCIALS');

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Top OpenBB Platform Navigation Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#09090b] border border-[#27272a] rounded-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded">
            <BookOpen className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm tracking-wide">
                OPENBB OPEN DATA PLATFORM (ODP)
              </span>
              <span className="text-[10px] bg-[#18181b] border border-[#27272a] text-[#22c55e] px-1.5 py-0.5 rounded font-bold">
                PLATFORM v4.2 ONLINE
              </span>
            </div>
            <p className="text-[11px] text-[#71717a]">
              Infrastruktur terpadu data fundamental SEC EDGAR, rantai opsi Black-Scholes, dan makro FRED.
            </p>
          </div>
        </div>

        {/* Sub-tab Switches */}
        <div className="flex items-center gap-1 bg-[#121216] border border-[#27272a] p-1 rounded text-xs">
          <button
            onClick={() => setActiveSubTab('FINANCIALS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
              activeSubTab === 'FINANCIALS'
                ? 'bg-[#3b82f6] text-white shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📑 Laporan Keuangan 10Y</span>
          </button>

          <button
            onClick={() => setActiveSubTab('OPTIONS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
              activeSubTab === 'OPTIONS'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Meja Opsi &amp; Greeks</span>
          </button>

          <button
            onClick={() => setActiveSubTab('MACRO')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
              activeSubTab === 'MACRO'
                ? 'bg-[#a855f7] text-white shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>🏛️ Makro &amp; Yield FRED</span>
          </button>
        </div>
      </div>

      {/* ── Active View Rendering ── */}
      {activeSubTab === 'FINANCIALS' && <OpenBBFinancialStatementsView symbol={symbol} />}
      {activeSubTab === 'OPTIONS' && <OpenBBOptionChainView symbol={symbol} />}
      {activeSubTab === 'MACRO' && <OpenBBMacroYieldView />}

      {/* ── Status Gateway Footer ── */}
      <div className="p-2.5 bg-[#09090b] border border-[#1f1f23] rounded-sm text-[10px] text-[#71717a] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span>OPENBB PYTHON SDK COMPATIBLE</span>
          </span>
          <span>&bull;</span>
          <span>FASTAPI GATEWAY: 127.0.0.1:6900</span>
          <span>&bull;</span>
          <span>MCP TOOL CALLING READY</span>
        </div>
        <span className="text-[#a1a1aa]">TEKAN <strong className="text-[#f59e0b]">OBB &lt;GO&gt;</strong> DI CLI UNTUK DATA LANGSUNG</span>
      </div>
    </div>
  );
}
