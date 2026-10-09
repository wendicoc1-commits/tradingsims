'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Sparkles, TrendingUp, TrendingDown, RefreshCw, Cpu, ShieldCheck, Activity, BarChart2, Layers } from 'lucide-react'

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  isForecast?: boolean
  confidence?: number
}

interface KronosData {
  success: boolean
  symbol: string
  timeframe: string
  model: string
  architecture: string
  metrics: {
    rankIC: number
    baselineRankIC: number
    confidenceScore: number
    historicalVolatility: number
    expectedReturnPct: number
    signal: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH'
  }
  currentPrice: number
  historicalCandles: Candle[]
  forecastCandles: Candle[]
  keyLevels: {
    projectedHigh: number
    projectedLow: number
    pivotPoint: number
  }
}

export default function KronosKLineForecastView({
  isEmbedded = false
}: {
  isEmbedded?: boolean
}) {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [timeframe, setTimeframe] = useState('1h')
  const [data, setData] = useState<KronosData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const availableTickers = [
    { id: 'BTCUSDT', label: 'BTC/USDT' },
    { id: 'ETHUSDT', label: 'ETH/USDT' },
    { id: 'SOLUSDT', label: 'SOL/USDT' },
    { id: 'ARBUSDT', label: 'ARB/USDT' },
    { id: 'BBCA.JK', label: 'BBCA (JK)' },
    { id: 'BBRI.JK', label: 'BBRI (JK)' }
  ]

  const fetchForecast = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/quant/kronos?symbol=${symbol}&timeframe=${timeframe}&steps=5`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Failed to load Kronos forecast:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchForecast()
  }, [symbol, timeframe])

  // Draw Candlestick + Ghost Forecast Chart on Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const allCandles = [...data.historicalCandles, ...data.forecastCandles]
    if (allCandles.length === 0) return

    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    // Find min / max price
    let minP = Math.min(...allCandles.map(c => c.low))
    let maxP = Math.max(...allCandles.map(c => c.high))
    const pad = (maxP - minP) * 0.1 || 1
    minP -= pad
    maxP += pad

    const priceToY = (p: number) => h - ((p - minP) / (maxP - minP)) * (h - 30) - 15

    // Draw background grid lines
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 0.5
    for (let i = 1; i <= 4; i++) {
      const gy = (h / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, gy)
      ctx.lineTo(w, gy)
      ctx.stroke()
    }

    const candleWidth = Math.max(3, (w / allCandles.length) * 0.65)
    const gap = w / allCandles.length

    // Highlight forecast area background
    const histCount = data.historicalCandles.length
    const splitX = histCount * gap
    ctx.fillStyle = 'rgba(16, 185, 129, 0.05)'
    ctx.fillRect(splitX, 0, w - splitX, h)

    // Forecast divider line
    ctx.strokeStyle = '#10b981'
    ctx.setLineDash([3, 3])
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(splitX, 0)
    ctx.lineTo(splitX, h)
    ctx.stroke()
    ctx.setLineDash([])

    // Label for forecast
    ctx.fillStyle = '#10b981'
    ctx.font = '9px monospace'
    ctx.fillText('KRONOS GHOST CANDLES ➔', splitX + 6, 14)

    // Draw candles
    allCandles.forEach((c, idx) => {
      const x = idx * gap + gap / 2
      const isUp = c.close >= c.open
      const openY = priceToY(c.open)
      const closeY = priceToY(c.close)
      const highY = priceToY(c.high)
      const lowY = priceToY(c.low)

      if (c.isForecast) {
        // Ghost Candle (Semi-transparent with glowing border)
        const ghostColor = isUp ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)'
        const borderColor = isUp ? '#4ade80' : '#f87171'

        // Wick
        ctx.strokeStyle = borderColor
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, highY)
        ctx.lineTo(x, lowY)
        ctx.stroke()

        // Body
        const top = Math.min(openY, closeY)
        const height = Math.max(2, Math.abs(closeY - openY))
        ctx.fillStyle = ghostColor
        ctx.fillRect(x - candleWidth / 2, top, candleWidth, height)
        ctx.strokeStyle = borderColor
        ctx.strokeRect(x - candleWidth / 2, top, candleWidth, height)
      } else {
        // Regular historical candle
        const bodyColor = isUp ? '#22c55e' : '#ef4444'

        // Wick
        ctx.strokeStyle = bodyColor
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, highY)
        ctx.lineTo(x, lowY)
        ctx.stroke()

        // Body
        const top = Math.min(openY, closeY)
        const height = Math.max(2, Math.abs(closeY - openY))
        ctx.fillStyle = bodyColor
        ctx.fillRect(x - candleWidth / 2, top, candleWidth, height)
      }
    })
  }, [data])

  return (
    <div className={`rounded-2xl border border-emerald-900/40 bg-[#040813]/95 shadow-2xl backdrop-blur-md overflow-hidden font-mono text-xs ${
      isEmbedded ? 'w-full mb-4' : 'w-full'
    }`}>
      {/* ── Top Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border-b border-emerald-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs tracking-wider">
                KRONOS · FINANCIAL FOUNDATION MODEL FORECASTER
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                12B K-LINES PRETRAINED
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Autoregressive Decoder-only Transformer · Paper Tsinghua Univ (arXiv:2508.02739)
            </p>
          </div>
        </div>

        {/* Controls: Symbol & Timeframe & Refresh */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-slate-800">
            {availableTickers.map(t => (
              <button
                key={t.id}
                onClick={() => setSymbol(t.id)}
                className={`px-2 py-1 rounded text-[10px] transition ${
                  symbol === t.id
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 bg-black/60 p-0.5 rounded-lg border border-slate-800">
            {['1h', '4h', '1d'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded text-[10px] uppercase transition ${
                  timeframe === tf
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={fetchForecast}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Refresh Forecast"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Key Metrics Ribbon ── */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-2.5 bg-[#03060e] border-b border-slate-900 text-center text-[10px]">
          <div className="p-1.5 rounded bg-[#070e1c] border border-slate-800/80">
            <span className="text-slate-500 block">HARGA SAAT INI</span>
            <span className="font-bold text-white text-xs">
              {data.symbol.includes('.JK') ? `Rp ${data.currentPrice.toLocaleString('id-ID')}` : `$${data.currentPrice.toLocaleString()}`}
            </span>
          </div>

          <div className="p-1.5 rounded bg-[#070e1c] border border-slate-800/80">
            <span className="text-slate-500 block">PROYEKSI TARGET 5-CANDLE</span>
            <span className={`font-bold text-xs ${data.metrics.expectedReturnPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {data.metrics.expectedReturnPct >= 0 ? '+' : ''}{data.metrics.expectedReturnPct}%
            </span>
          </div>

          <div className="p-1.5 rounded bg-[#070e1c] border border-slate-800/80">
            <span className="text-slate-500 block">RANK-IC SCORE (VS 0.046 BASE)</span>
            <span className="font-bold text-cyan-300 text-xs flex items-center justify-center gap-1">
              <span>{data.metrics.rankIC}</span>
              <span className="text-[9px] text-emerald-400">(+93% Boost)</span>
            </span>
          </div>

          <div className="p-1.5 rounded bg-[#070e1c] border border-slate-800/80">
            <span className="text-slate-500 block">HISTORICAL VOLATILITY</span>
            <span className="font-bold text-amber-400 text-xs">{data.metrics.historicalVolatility}%</span>
          </div>

          <div className="p-1.5 rounded bg-[#070e1c] border border-slate-800/80">
            <span className="text-slate-500 block">KRONOS AI SIGNAL</span>
            <span className={`font-black text-xs ${
              data.metrics.signal.includes('BULLISH') ? 'text-emerald-400' : data.metrics.signal.includes('BEARISH') ? 'text-red-400' : 'text-slate-300'
            }`}>
              {data.metrics.signal}
            </span>
          </div>
        </div>
      )}

      {/* ── Main Canvas Chart ── */}
      <div className="p-3">
        <div className="relative rounded-xl border border-slate-800 bg-black h-56 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={720}
            height={224}
            className="w-full h-full object-cover"
          />

          {isLoading && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center gap-2 text-cyan-300 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Menghitung autoregressive trajectory Kronos...</span>
            </div>
          )}

          <div className="absolute bottom-2 left-2 flex items-center gap-3 text-[9px] bg-black/80 px-2 py-1 rounded border border-slate-800">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span className="text-slate-300">Candle Aktual</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded border border-emerald-400 bg-emerald-500/30" />
              <span className="text-emerald-300 font-bold">Ghost Candle (Kronos Forecast)</span>
            </div>
          </div>
        </div>

        {/* Quantitative Insight for Jim Simons Desk */}
        {data && (
          <div className="mt-2.5 p-2 rounded-lg bg-[#070f20] border border-cyan-900/40 flex items-center justify-between gap-2 text-[10px]">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300">
                <strong className="text-white">Jim Simons Quant Desk:</strong> Sinyal{' '}
                <span className="text-emerald-300 font-bold">{data.metrics.signal}</span> terdeteksi pada {data.symbol}. Probabilitas kelanjutan tren sebesar{' '}
                <span className="text-cyan-300 font-bold">{(data.metrics.confidenceScore * 100).toFixed(0)}%</span>.
              </span>
            </div>
            <span className="text-[9px] text-slate-500 whitespace-nowrap">Auto-synced to Engine</span>
          </div>
        )}
      </div>
    </div>
  )
}
