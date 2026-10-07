'use client';

import React, { useState } from 'react';
import {
  GitMerge,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Truck,
  Users2,
  Globe2,
  Info
} from 'lucide-react';
import { getSupplyChainData, StockSupplyChainData, SupplyChainNode } from '@/data/bloomberg_supply_chain';

interface SupplyChainNetworkDeskProps {
  symbol: string;
}

export default function SupplyChainNetworkDesk({ symbol }: SupplyChainNetworkDeskProps) {
  const data: StockSupplyChainData = getSupplyChainData(symbol);
  const [selectedNode, setSelectedNode] = useState<SupplyChainNode | null>(null);

  const getRiskBadge = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (risk) {
      case 'LOW':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5" /> LOW RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" /> MED RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 flex items-center gap-1">
            <ShieldAlert className="w-2.5 h-2.5" /> HIGH RISK
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded border bg-[#09090b] border-[#27272a]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-ping" />
            <span className="text-xs font-black text-[#f59e0b] uppercase tracking-widest flex items-center gap-1.5">
              <GitMerge className="w-3.5 h-3.5" />
              TRADESIM NETWORK &bull; SUPPLY CHAIN &amp; CUSTOMER EXPOSURE
            </span>
            <span className="text-[10px] text-[#71717a]">| RELATIONSHIP EXPOSURE &amp; DEPENDENCY RISK</span>
          </div>
          <h2 className="text-lg font-black text-white tracking-wide">
            Jejaring Rantai Pasok, Pemasok Utama &amp; Pelanggan ({data.symbol})
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Peta dekomposisi rantai nilai institusional: melacak pemasok komponen penting, persentase eksposur beban/omset, dan risiko disrupsi operasional.
          </p>
        </div>

        {/* Overall Vulnerability Gauges */}
        <div className="flex items-center gap-3 p-2 rounded bg-[#18181b] border border-[#27272a] shrink-0 text-right">
          <div>
            <div className="text-[9px] text-[#71717a] uppercase font-bold">Supply Vulnerability</div>
            <div className="mt-0.5">{getRiskBadge(data.overallSupplyRisk)}</div>
          </div>
          <div className="border-l border-[#27272a] pl-3">
            <div className="text-[9px] text-[#71717a] uppercase font-bold">Customer Concentration</div>
            <div className="mt-0.5">{getRiskBadge(data.overallCustomerRisk)}</div>
          </div>
        </div>
      </div>

      {/* ── Focal Company Strategic Summary Card ── */}
      <div className="p-3.5 rounded border bg-[#121216] border-[#27272a] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center font-bold text-base text-[#f59e0b]">
            {data.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <span>{data.name}</span>
              <span className="text-[10px] text-[#71717a] font-normal">({data.sector})</span>
            </div>
            <p className="text-xs text-[#a1a1aa] mt-0.5 max-w-3xl leading-relaxed">
              {data.focalSummary}
            </p>
          </div>
        </div>
        <div className="text-[10px] text-[#71717a] shrink-0 bg-[#18181b] px-2.5 py-1.5 rounded border border-[#27272a]">
          Klik salah satu kartu di bawah untuk melihat rincian kontrak.
        </div>
      </div>

      {/* ── 3-Column Visual Flow: Suppliers -> Focal -> Customers ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Column 1: Tier-1 Suppliers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2 py-1 rounded bg-[#18181b] border border-[#27272a]">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#38bdf8]" />
              TIER-1 SUPPLIERS ({data.suppliers.length})
            </span>
            <span className="text-[9px] text-[#71717a]">INPUT PRODUKSI</span>
          </div>

          <div className="space-y-2">
            {data.suppliers.map((sup, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedNode(sup)}
                className={`p-3 rounded border bg-[#121216] border-[#27272a] hover:border-[#38bdf8]/60 cursor-pointer transition-all ${
                  selectedNode?.name === sup.name ? 'border-[#38bdf8] bg-[#18181f]' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>{sup.name}</span>
                      {sup.ticker && (
                        <span className="px-1 py-0.2 rounded text-[8px] bg-[#27272a] text-[#38bdf8] font-bold">
                          {sup.ticker}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#a1a1aa] flex items-center gap-1 mt-0.5">
                      <Globe2 className="w-2.5 h-2.5 text-[#71717a]" />
                      <span>{sup.country}</span>
                    </div>
                  </div>
                  {getRiskBadge(sup.dependencyRisk)}
                </div>

                <div className="mt-2 text-[11px] text-[#d4d4d8] line-clamp-1">
                  {sup.productCategory}
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-[#1f1f23] pt-1.5 text-[10px]">
                  <span className="text-[#71717a]">Eksposur Beban:</span>
                  <span className="font-bold text-[#38bdf8] font-mono">
                    ~{sup.revenueExposurePercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Focal Hub / Production Center */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2 py-1 rounded bg-[#18181b] border border-[#27272a]">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#f59e0b]" />
              FOCAL CORE HUB
            </span>
            <span className="text-[9px] text-[#f59e0b] font-bold">OPERASIONAL {data.symbol}</span>
          </div>

          <div className="p-4 rounded border bg-[#121216] border-[#f59e0b]/40 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#f59e0b]/5 rounded-full blur-xl pointer-events-none" />

            <div className="text-center py-2 border-b border-[#27272a]">
              <div className="text-base font-black text-white">{data.name}</div>
              <div className="text-xs text-[#f59e0b] font-bold mt-0.5">Ticker: {data.symbol}</div>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded bg-[#18181b] border border-[#27272a]">
                <div className="text-[#71717a] text-[9px] uppercase font-bold">Transformasi Nilai</div>
                <div className="text-zinc-300 mt-0.5">
                  Mengintegrasikan pasokan dari {data.suppliers.length} vendor strategis menjadi output bernilai tambah tinggi.
                </div>
              </div>

              <div className="p-2 rounded bg-[#18181b] border border-[#27272a]">
                <div className="text-[#71717a] text-[9px] uppercase font-bold">Diversifikasi Saluran</div>
                <div className="text-zinc-300 mt-0.5">
                  Menyalurkan produk ke {data.customers.length} segmen pembeli inti dengan mitigasi risiko piutang.
                </div>
              </div>
            </div>

            {/* Strategic Partners List */}
            {data.partners.length > 0 && (
              <div className="border-t border-[#27272a] pt-2 space-y-1">
                <div className="text-[10px] font-bold text-[#f59e0b] uppercase">
                  Mitra Prinsipal / JV:
                </div>
                {data.partners.map((p, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-[#1c1917] text-[10px] text-zinc-300 flex justify-between items-center">
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-[#f59e0b] font-bold">{p.productCategory}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Tier-1 Customers & Distribution */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2 py-1 rounded bg-[#18181b] border border-[#27272a]">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5 text-[#22c55e]" />
              TIER-1 CUSTOMERS ({data.customers.length})
            </span>
            <span className="text-[9px] text-[#71717a]">SUMBER PENDAPATAN</span>
          </div>

          <div className="space-y-2">
            {data.customers.map((cust, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedNode(cust)}
                className={`p-3 rounded border bg-[#121216] border-[#27272a] hover:border-[#22c55e]/60 cursor-pointer transition-all ${
                  selectedNode?.name === cust.name ? 'border-[#22c55e] bg-[#181f18]' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>{cust.name}</span>
                      {cust.ticker && (
                        <span className="px-1 py-0.2 rounded text-[8px] bg-[#27272a] text-[#22c55e] font-bold">
                          {cust.ticker}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#a1a1aa] flex items-center gap-1 mt-0.5">
                      <Globe2 className="w-2.5 h-2.5 text-[#71717a]" />
                      <span>{cust.country}</span>
                    </div>
                  </div>
                  {getRiskBadge(cust.dependencyRisk)}
                </div>

                <div className="mt-2 text-[11px] text-[#d4d4d8] line-clamp-1">
                  {cust.productCategory}
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-[#1f1f23] pt-1.5 text-[10px]">
                  <span className="text-[#71717a]">Porsi Omset:</span>
                  <span className="font-bold text-[#22c55e] font-mono">
                    ~{cust.revenueExposurePercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Detail Card for Selected Node ── */}
      {selectedNode && (
        <div className="p-4 rounded border bg-[#09090b] border-[#27272a] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#f59e0b] font-bold text-xs uppercase flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> DETAIL JEJARING: {selectedNode.name}
              </span>
              <span className="text-[10px] text-[#71717a]">({selectedNode.country})</span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-[#71717a] hover:text-white cursor-pointer"
            >
              ✕ Tutup
            </button>
          </div>
          <p className="text-xs text-[#e4e4e7] leading-relaxed">
            {selectedNode.notes}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="p-2 rounded bg-[#18181b] border border-[#27272a]">
              <div className="text-[#71717a] text-[9px] uppercase">Kategori Peran</div>
              <div className="font-bold text-white">{selectedNode.relationshipType}</div>
            </div>
            <div className="p-2 rounded bg-[#18181b] border border-[#27272a]">
              <div className="text-[#71717a] text-[9px] uppercase">Persentase Eksposur</div>
              <div className="font-bold text-[#f59e0b] font-mono">~{selectedNode.revenueExposurePercent}%</div>
            </div>
            <div className="p-2 rounded bg-[#18181b] border border-[#27272a]">
              <div className="text-[#71717a] text-[9px] uppercase">Tingkat Risiko Ketergantungan</div>
              <div className="font-bold text-white">{selectedNode.dependencyRisk}</div>
            </div>
            <div className="p-2 rounded bg-[#18181b] border border-[#27272a]">
              <div className="text-[#71717a] text-[9px] uppercase">Status Hubungan</div>
              <div className="font-bold text-[#22c55e]">{selectedNode.status}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
