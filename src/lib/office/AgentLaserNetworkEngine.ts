// src/lib/office/AgentLaserNetworkEngine.ts

export type LaserSignalType = 'TELEMETRY' | 'SIGNAL_TRADE' | 'RISK_VETO';

export interface LaserPacketDef {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  ctrlX: number;
  ctrlY: number;
  type: LaserSignalType;
  progress: number; // 0.0 to 1.0
  speed: number;    // per frame increment
  trailLength: number;
  active: boolean;
}

export interface ImpactRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  active: boolean;
}

export class AgentLaserNetworkEngine {
  private maxPackets = 48;
  private maxRipples = 32;

  // Pre-allocated object pools (Zero GC Churn)
  private packets: LaserPacketDef[] = [];
  private ripples: ImpactRipple[] = [];

  constructor() {
    for (let i = 0; i < this.maxPackets; i++) {
      this.packets.push({
        id: '',
        fromX: 0, fromY: 0,
        toX: 0, toY: 0,
        ctrlX: 0, ctrlY: 0,
        type: 'TELEMETRY',
        progress: 1.0,
        speed: 0.02,
        trailLength: 0.18,
        active: false,
      });
    }

    for (let i = 0; i < this.maxRipples; i++) {
      this.ripples.push({
        x: 0, y: 0,
        radius: 0,
        maxRadius: 36,
        alpha: 0,
        color: '#06b6d4',
        active: false,
      });
    }
  }

  /**
   * Menembakkan data stream antar dua meja agen
   */
  public fireStream(
    fromX: number, fromY: number,
    toX: number, toY: number,
    type: LaserSignalType = 'TELEMETRY'
  ): void {
    const p = this.packets.find((item) => !item.active);
    if (!p) return;

    // Hitung titik kontrol busur (Arched Bézier) dengan lengkungan estetik
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.hypot(dx, dy);
    if (dist < 10) return;
    
    // Normal perpendicular
    const nx = -dy / dist;
    const ny = dx / dist;
    const arch = Math.min(120, dist * 0.28);

    p.fromX = fromX;
    p.fromY = fromY;
    p.toX = toX;
    p.toY = toY;
    // Angkat ke atas secara isometrik
    p.ctrlX = (fromX + toX) / 2 + nx * arch;
    p.ctrlY = (fromY + toY) / 2 + ny * arch - 45;
    p.type = type;
    p.progress = 0.0;
    p.speed = 0.018 + (dist < 300 ? 0.015 : 0.008);
    p.trailLength = 0.22;
    p.active = true;
  }

  private triggerRipple(x: number, y: number, color: string): void {
    const r = this.ripples.find((item) => !item.active);
    if (!r) return;
    r.x = x;
    r.y = y;
    r.radius = 4;
    r.maxRadius = 38;
    r.alpha = 1.0;
    r.color = color;
    r.active = true;
  }

  private getPalette(type: LaserSignalType) {
    switch (type) {
      case 'SIGNAL_TRADE':
        return { core: '#ffffff', glow: '#fbbf24', ambient: 'rgba(251, 191, 36, 0.25)' };
      case 'RISK_VETO':
        return { core: '#ffffff', glow: '#ef4444', ambient: 'rgba(239, 68, 68, 0.35)' };
      case 'TELEMETRY':
      default:
        return { core: '#e0f2fe', glow: '#06b6d4', ambient: 'rgba(6, 182, 212, 0.25)' };
    }
  }

  private getBezierPoint(p: LaserPacketDef, t: number): { x: number; y: number } {
    const clampedT = Math.max(0, Math.min(1, t));
    const inv = 1 - clampedT;
    const x = inv * inv * p.fromX + 2 * inv * clampedT * p.ctrlX + clampedT * clampedT * p.toX;
    const y = inv * inv * p.fromY + 2 * inv * clampedT * p.ctrlY + clampedT * clampedT * p.toY;
    return { x, y };
  }

  public updateAndRender(ctx: CanvasRenderingContext2D, dt: number): void {
    ctx.save();
    ctx.lineCap = 'round';

    // 1. Render & Update Laser Packets
    for (let i = 0; i < this.packets.length; i++) {
      const p = this.packets[i];
      if (!p.active) continue;

      p.progress += p.speed;

      const pal = this.getPalette(p.type);

      // Gambar Jalur Panduan Lembut (Faint Guide Spline)
      ctx.beginPath();
      ctx.moveTo(p.fromX, p.fromY);
      ctx.quadraticCurveTo(p.ctrlX, p.ctrlY, p.toX, p.toY);
      ctx.strokeStyle = pal.ambient;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Gambar Laser Photon Head & Glowing Tail
      const headT = p.progress;
      const tailT = Math.max(0, p.progress - p.trailLength);

      const head = this.getBezierPoint(p, headT);
      const tail = this.getBezierPoint(p, tailT);
      const mid = this.getBezierPoint(p, (headT + tailT) / 2);

      // Outer Bloom Glow
      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      ctx.quadraticCurveTo(mid.x, mid.y, head.x, head.y);
      ctx.strokeStyle = pal.glow;
      ctx.lineWidth = 4.5;
      ctx.shadowColor = pal.glow;
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Inner Core Laser Beam
      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      ctx.quadraticCurveTo(mid.x, mid.y, head.x, head.y);
      ctx.strokeStyle = pal.core;
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Photon Head Flare
      ctx.fillStyle = pal.core;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Jika tiba di target
      if (p.progress >= 1.0) {
        p.active = false;
        this.triggerRipple(p.toX, p.toY, pal.glow);
      }
    }

    // 2. Render & Update Impact Ripples
    for (let i = 0; i < this.ripples.length; i++) {
      const r = this.ripples[i];
      if (!r.active) continue;

      r.radius += (r.maxRadius - r.radius) * 0.12 + 0.4;
      r.alpha -= 0.04;

      if (r.alpha <= 0.01) {
        r.active = false;
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = Math.max(0, r.alpha);
      ctx.lineWidth = 2.0;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}

export const globalLaserNetwork = new AgentLaserNetworkEngine();
