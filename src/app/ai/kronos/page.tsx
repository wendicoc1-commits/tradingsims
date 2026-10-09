'use client'

import React from 'react'
import KronosKLineForecastView from '@/components/ai/KronosKLineForecastView'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Building2 } from 'lucide-react'

export default function KronosPreviewPage() {
  return (
    <div className="min-h-screen bg-[#02050c] text-slate-100 p-4 md:p-8 font-mono">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/ai"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke AI Copilot
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                🔮 Kronos Financial Market Foundation Model
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Ghost Candlestick Forecast
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                12 Miliar K-Line Pretrained Transformer untuk Autoregressive Generative Price Prediction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> 100% 2D Ghost Candles
            </span>
          </div>
        </div>

        {/* The Live Component */}
        <div>
          <KronosKLineForecastView />
        </div>

        {/* Integration Preview Explanation */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-3 font-sans">
          <h2 className="font-bold text-white flex items-center gap-2 font-mono">
            <Building2 className="w-4 h-4 text-emerald-400" />
            Integrasi ke Meja Jim Simons &amp; Chart Utama
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Prediksi K-line Kronos ini langsung menyuplai sinyal kuantitatif murni ke meja agen <strong>Jim Simons (Statistical Arbitrage)</strong> dan <strong>Ray Dalio (Risk Parity)</strong> di Virtual Agent Office tanpa mengganggu logika penalaran LLM Gemini makroekonomi yang sudah ada.
          </p>
        </div>
      </div>
    </div>
  )
}
