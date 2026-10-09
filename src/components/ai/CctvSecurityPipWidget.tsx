// src/components/ai/CctvSecurityPipWidget.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { Camera, Radio, Cpu, X, Focus } from 'lucide-react';

export interface CctvTargetAgent {
  id: string;
  name: string;
  dept: string;
  role: string;
  action: string;
  status: 'ACTIVE_EXECUTION' | 'WAR_ROOM_DEBATE' | 'RISK_HALT' | 'IDLE';
  confidence: number;
}

interface CctvPipProps {
  activeAgent: CctvTargetAgent | null;
  onFocusAgent?: (agentId: string) => void;
  onClose?: () => void;
}

export default function CctvSecurityPipWidget({ activeAgent, onFocusAgent, onClose }: CctvPipProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. CCTV Dark Monitor Background
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, w, h);

      // 2. Animated Radar / Face Silhouette Wireframe
      ctx.save();
      ctx.translate(w / 2, h / 2 - 8);

      // Reticle Ring
      ctx.strokeStyle = activeAgent?.status === 'RISK_HALT' ? '#ef4444' : '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();

      // Spinning Crosshair Radar
      const radAngle = time * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(radAngle) * 36, Math.sin(radAngle) * 36);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
      ctx.stroke();

      // Agent Digital Silhouette Core
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -6, 13, 0, Math.PI * 2);
      ctx.fill();

      // Shoulders
      ctx.beginPath();
      ctx.ellipse(0, 16, 20, 9, 0, 0, Math.PI);
      ctx.fill();

      ctx.restore();

      // 3. CRT Scanlines Effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1.2);
      }

      // 4. Glitch Timecode & REC HUD
      ctx.font = '10px monospace';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('● REC', 10, 18);

      ctx.fillStyle = '#94a3b8';
      const nowStr = new Date().toISOString().substring(11, 19);
      ctx.fillText(`CAM_04 · ${nowStr}`, w - 108, 18);

      // Corner Crosshairs
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      const ch = 8;
      // Top Left
      ctx.strokeRect(10, 10, ch, ch);
      // Bottom Right
      ctx.strokeRect(w - 18, h - 18, ch, ch);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeAgent]);

  if (!activeAgent) return null;

  return (
    <div className="absolute top-20 right-6 z-40 w-72 bg-slate-950/90 border border-cyan-500/40 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md transition-all duration-300">
      {/* CCTV Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/95 border-b border-cyan-500/20 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Camera className="w-3.5 h-3.5 animate-pulse text-rose-500" />
          <span className="font-bold tracking-wider">CCTV AUTO-TRACK</span>
        </div>
        <div className="flex items-center gap-2">
          {onFocusAgent && (
            <button
              onClick={() => onFocusAgent(activeAgent.id)}
              className="text-slate-400 hover:text-cyan-400 p-0.5 rounded transition"
              title="Focus Camera"
            >
              <Focus className="w-3.5 h-3.5" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition"
              title="Close PiP"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Security Cam View Canvas */}
      <div className="relative w-full h-36 bg-black">
        <canvas ref={canvasRef} width={288} height={144} className="w-full h-full block" />

        {/* Floating Confidence Badge */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
          <Cpu className="w-2.5 h-2.5" />
          <span>CONF: {(activeAgent.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Target Details Telemetry */}
      <div className="p-3 space-y-1.5 text-xs font-mono bg-slate-950/80">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">TARGET:</span>
          <span className="text-white font-bold">{activeAgent.name}</span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-500">DEPT / ROLE:</span>
          <span className="text-cyan-300">
            {activeAgent.dept} · {activeAgent.role}
          </span>
        </div>
        <div className="p-1.5 bg-slate-900/90 rounded border border-slate-800 text-[10px] text-slate-300 truncate">
          <span className="text-amber-400 font-semibold">ACTION: </span>
          {activeAgent.action}
        </div>
      </div>
    </div>
  );
}
