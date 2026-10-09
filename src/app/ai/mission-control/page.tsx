'use client'

import React from 'react'
import MissionControlDecisionCenter from '@/components/ai/MissionControlDecisionCenter'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Building2 } from 'lucide-react'

export default function MissionControlPreviewPage() {
  return (
    <div className="min-h-screen bg-[#02050c] text-slate-100 p-4 md:p-8 font-mono">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/ai"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-500 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke AI Copilot
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                🛡️ Mission Control Oversight & Decisions Preview
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Stand-alone Preview
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Adaptasi Konsep &quot;Human-in-the-Loop&quot; dan Emergency Circuit Breaker untuk AI Swarm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> 100% 2D & Clean Architecture
            </span>
          </div>
        </div>

        {/* The Live Component */}
        <div>
          <MissionControlDecisionCenter />
        </div>

        {/* Integration Preview Explanation */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-3">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            Rencana Penempatan di Virtual Agent Office
          </h2>
          <p className="text-slate-400 leading-relaxed font-sans">
            Komponen ini dapat diakses sebagai <strong>Tab / Drawer &quot;Oversight &amp; Decisions&quot;</strong> atau diletakkan tepat di samping denah lantai meja trading para agen AI di <code className="text-amber-300 font-mono">VirtualAgentOfficeView.tsx</code>. Ini memberikan kontrol penuh kepada Anda atas setiap order besar yang diusulkan agen, lengkap dengan tombol darurat <strong>Emergency Kill Switch</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
