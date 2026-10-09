'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Radio, Activity, Terminal, ShieldAlert, Cpu, Eye, EyeOff, Maximize2, Minimize2, RefreshCw } from 'lucide-react'

interface RadarTarget {
  id: string
  label: string
  azimuth: number
  elevation: number
  distance: number // 0 to 1
  signal: number // dB
  doppler: string
  action: 'BUY' | 'SELL' | 'HOLD'
}

export default function GroundStationMissionControl({
  isEmbedded = false
}: {
  isEmbedded?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedTarget, setSelectedTarget] = useState<string>('BTCUSDT')
  const [isSweepActive, setIsSweepActive] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  const waterfallCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const targetsRef = useRef<RadarTarget[]>([
    { id: 'BTCUSDT', label: 'BTC / USDT', azimuth: 45, elevation: 62, distance: 0.35, signal: -42.8, doppler: '+142 Hz', action: 'BUY' },
    { id: 'BBCA.JK', label: 'BBCA (JK)', azimuth: 140, elevation: 38, distance: 0.65, signal: -56.1, doppler: '-18 Hz', action: 'HOLD' },
    { id: 'OPUSDT', label: 'OP / USDT', azimuth: 220, elevation: 75, distance: 0.48, signal: -39.4, doppler: '+380 Hz', action: 'BUY' },
    { id: 'ARBUSDT', label: 'ARB / USDT', azimuth: 310, elevation: 22, distance: 0.82, signal: -71.2, doppler: '-95 Hz', action: 'SELL' }
  ])

  // Telemetry stream generator
  useEffect(() => {
    const hexChars = '0123456789ABCDEF'
    const interval = setInterval(() => {
      const now = new Date().toISOString().substring(11, 23)
      const randomHex = Array.from({ length: 8 }, () => hexChars[Math.floor(Math.random() * 16)]).join('')
      const randomId = targetsRef.current[Math.floor(Math.random() * targetsRef.current.length)].id
      const newEntry = `[${now}] PKT_RX 0x${randomHex} | TGT:${randomId} | SNR:${(Math.random() * 20 + 12).toFixed(1)}dB | FRAME_OK`
      setLogs(prev => [newEntry, ...prev.slice(0, 19)])
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  // 1. SDR Waterfall Canvas Animation
  useEffect(() => {
    const canvas = waterfallCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const width = canvas.width
    const height = canvas.height

    const imgData = ctx.createImageData(width, 1)

    const getColor = (val: number) => {
      // Heatmap gradient: dark blue -> cyan -> yellow -> orange -> red
      if (val < 0.25) return [10, 20, 50]
      if (val < 0.5) return [6, 182, 212]
      if (val < 0.75) return [234, 179, 8]
      return [239, 68, 68]
    }

    const draw = () => {
      // Shift canvas content downward by 1 row
      ctx.drawImage(canvas, 0, 0, width, height - 1, 0, 1, width, height - 1)

      // Generate new top row
      for (let x = 0; x < width; x++) {
        const noise = Math.random() * 0.35
        const centerWave = Math.sin(x * 0.08 + Date.now() * 0.005) * 0.4 + 0.4
        const peak = (x > width * 0.35 && x < width * 0.45) ? 0.4 : 0
        const total = Math.min(1, Math.max(0, noise + centerWave * 0.3 + peak))
        const [r, g, b] = getColor(total)
        const idx = x * 4
        imgData.data[idx] = r
        imgData.data[idx + 1] = g
        imgData.data[idx + 2] = b
        imgData.data[idx + 3] = 255
      }
      ctx.putImageData(imgData, 0, 0)
      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [])

  // 2. Polar Tracking Radar Canvas Animation
  useEffect(() => {
    const canvas = radarCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let angle = 0

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      const radius = Math.min(cx, cy) - 10

      ctx.clearRect(0, 0, w, h)

      // Background grid circles
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)'
      ctx.lineWidth = 1
      for (let r = 0.25; r <= 1.0; r += 0.25) {
        ctx.beginPath()
        ctx.arc(cx, cy, radius * r, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Crosshairs
      ctx.beginPath()
      ctx.moveTo(cx - radius, cy)
      ctx.lineTo(cx + radius, cy)
      ctx.moveTo(cx, cy - radius)
      ctx.lineTo(cx, cy + radius)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)'
      ctx.stroke()

      // Sweeper cone
      if (isSweepActive) {
        angle += 0.02
        if (angle > Math.PI * 2) angle -= Math.PI * 2

        const grad = ctx.createConicGradient(angle - Math.PI / 2, cx, cy)
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.35)')
        grad.addColorStop(0.12, 'rgba(6, 182, 212, 0)')
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fill()

        // Leading sweep line
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
        ctx.strokeStyle = '#22d3ee'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Plot targets
      targetsRef.current.forEach(tgt => {
        const rad = (tgt.azimuth * Math.PI) / 180
        const dist = tgt.distance * radius
        const tx = cx + Math.cos(rad) * dist
        const ty = cy + Math.sin(rad) * dist

        const isSelected = tgt.id === selectedTarget

        // Target blip
        ctx.beginPath()
        ctx.arc(tx, ty, isSelected ? 4 : 2.5, 0, Math.PI * 2)
        ctx.fillStyle = tgt.action === 'BUY' ? '#10b981' : tgt.action === 'SELL' ? '#ef4444' : '#eab308'
        ctx.fill()

        // Selection ring
        if (isSelected) {
          ctx.beginPath()
          ctx.arc(tx, ty, 8, 0, Math.PI * 2)
          ctx.strokeStyle = '#38bdf8'
          ctx.lineWidth = 1.5
          ctx.stroke()

          // Target label
          ctx.fillStyle = '#f8fafc'
          ctx.font = '9px monospace'
          ctx.fillText(tgt.label, tx + 10, ty + 3)
        }
      })

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [isSweepActive, selectedTarget])

  const currentObj = targetsRef.current.find(t => t.id === selectedTarget) || targetsRef.current[0]

  return (
    <div className={`rounded-xl border border-cyan-900/50 bg-[#060b17]/95 shadow-2xl backdrop-blur-md transition-all overflow-hidden ${
      isEmbedded ? 'w-full mb-4' : 'w-full'
    }`}>
      {/* ── Top Bar / Header ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-950 border-b border-cyan-900/40 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="font-bold text-white tracking-wider flex items-center gap-1.5 font-mono text-[11px]">
            GROUND STATION · SIGNAL DSP & POLAR RADAR
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
              LIVE
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSweepActive(!isSweepActive)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${
              isSweepActive
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isSweepActive ? 'SWEEP: ON' : 'SWEEP: OFF'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 grid grid-cols-1 md:grid-cols-12 gap-3 text-slate-300 font-mono text-xs">
          {/* ── 1. SDR Waterfall & Spectrum (Cols 4) ── */}
          <div className="md:col-span-4 rounded-lg bg-[#040812] border border-cyan-900/40 p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                <Activity className="w-3 h-3" /> SDR SPECTRUM WATERFALL
              </span>
              <span className="text-[9px] text-slate-500">BW: 2.4 MHz</span>
            </div>

            <div className="relative rounded overflow-hidden border border-cyan-950 bg-black h-36">
              <canvas
                ref={waterfallCanvasRef}
                width={240}
                height={144}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-cyan-300 border border-cyan-900/50">
                FFT: 1024 pt
              </div>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-1 text-[9px] text-center">
              <div className="p-1 rounded bg-[#091122] border border-slate-800">
                <span className="block text-slate-500">RX SENS</span>
                <span className="font-bold text-cyan-300">-98 dBm</span>
              </div>
              <div className="p-1 rounded bg-[#091122] border border-slate-800">
                <span className="block text-slate-500">NOISE FL</span>
                <span className="font-bold text-slate-400">-112 dB</span>
              </div>
              <div className="p-1 rounded bg-[#091122] border border-slate-800">
                <span className="block text-slate-500">SAMPLE RATE</span>
                <span className="font-bold text-emerald-400">10 MS/s</span>
              </div>
            </div>
          </div>

          {/* ── 2. Multi-Target Polar Tracking Radar (Cols 4) ── */}
          <div className="md:col-span-4 rounded-lg bg-[#040812] border border-cyan-900/40 p-2.5 flex flex-col items-center justify-between">
            <div className="w-full flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3" /> POLAR ALPHA RADAR
              </span>
              <span className="text-[9px] text-emerald-400 font-bold">LOCKED: 4</span>
            </div>

            <div className="relative w-36 h-36 my-1">
              <canvas
                ref={radarCanvasRef}
                width={160}
                height={160}
                className="w-full h-full"
              />
            </div>

            <div className="w-full flex items-center justify-between gap-1 overflow-x-auto text-[9px]">
              {targetsRef.current.map(tgt => (
                <button
                  key={tgt.id}
                  onClick={() => setSelectedTarget(tgt.id)}
                  className={`px-1.5 py-0.5 rounded border transition flex-1 text-center ${
                    tgt.id === selectedTarget
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tgt.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* ── 3. Telemetry Bitstream & Target Telemetry (Cols 4) ── */}
          <div className="md:col-span-4 rounded-lg bg-[#040812] border border-cyan-900/40 p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                <Terminal className="w-3 h-3" /> TELEMETRY BITSTREAM
              </span>
              <span className="text-[9px] text-cyan-300 font-bold">{currentObj.label}</span>
            </div>

            {/* Target telemetry stats */}
            <div className="p-1.5 rounded bg-[#091122] border border-cyan-900/30 grid grid-cols-2 gap-1 text-[9px] mb-2">
              <div>
                <span className="text-slate-500">AZ / EL:</span>{' '}
                <span className="text-cyan-300 font-bold">{currentObj.azimuth}° / {currentObj.elevation}°</span>
              </div>
              <div>
                <span className="text-slate-500">DOPPLER:</span>{' '}
                <span className="text-emerald-400 font-bold">{currentObj.doppler}</span>
              </div>
              <div>
                <span className="text-slate-500">SIGNAL:</span>{' '}
                <span className="text-cyan-300 font-bold">{currentObj.signal} dB</span>
              </div>
              <div>
                <span className="text-slate-500">ALPHA BIAS:</span>{' '}
                <span className={`font-bold ${
                  currentObj.action === 'BUY' ? 'text-emerald-400' : currentObj.action === 'SELL' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {currentObj.action}
                </span>
              </div>
            </div>

            {/* Terminal Logs */}
            <div className="h-20 rounded bg-black/80 border border-slate-900 p-1.5 overflow-y-auto text-[8px] font-mono text-cyan-400/80 leading-relaxed custom-scrollbar">
              {logs.map((log, idx) => (
                <div key={idx} className="truncate">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
