'use client'

import React from 'react'
import AgentMissionControlDashboard from '@/components/ai/mission-control/AgentMissionControlDashboard'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export default function MissionControlPreviewPage() {
  return (
    <div className="min-h-screen bg-[#02050c] text-slate-100 p-2 md:p-4 font-mono">
      <div className="max-w-[1720px] mx-auto space-y-3">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <div className="flex items-center gap-3">
            <Link
              href="/ai"
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke AI Copilot
            </Link>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                🛡️ Fincept AI Mission Control Dashboard (Full Command Center)
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Fleet Orchestrator View
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">
                Integrasi Komprehensif: Fleet Roster + 2D Virtual Office Canvas + Contextual Inspector + Telemetry Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> 100% 2D &amp; High FPS
            </span>
          </div>
        </div>

        {/* Master Mission Control Shell Component */}
        <AgentMissionControlDashboard />
      </div>
    </div>
  )
}
