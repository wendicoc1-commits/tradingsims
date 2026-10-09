// src/lib/office/HolographicMarketHub.ts

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  intensity: number;
  color: string;
  active: boolean;
}

export class HolographicMarketHub {
  private shockwaves: Shockwave[] = [];

  constructor() {
    for (let i = 0; i < 8; i++) {
      this.shockwaves.push({
        x: 0, y: 0,
        radius: 0,
        maxRadius: 280,
        intensity: 0,
        color: '#10b981',
        active: false,
      });
    }
  }

  public triggerShockwave(x: number, y: number, color: string = '#10b981', maxRadius: number = 280): void {
    const sw = this.shockwaves.find((s) => !s.active);
    if (!sw) return;
    sw.x = x;
    sw.y = y;
    sw.radius = 10;
    sw.maxRadius = maxRadius;
    sw.intensity = 1.0;
    sw.color = color;
    sw.active = true;
  }

  /**
   * Menggambar Silinder Orderbook 3D Berputar, Wireframe Globe, & Specular Floor Reflection
   */
  public renderHoloHub(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    now: number
  ): void {
    ctx.save();

    // 1. Ambient Floor Glow Cone (Proyeksi dari bawah ke atas)
    const baseGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 180);
    baseGrad.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
    baseGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
    baseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 190, 95, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Tiled Floor Grid Reflection / Specular Highlight
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.12)';
    ctx.lineWidth = 1;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
      const rotAngle = angle + now * 0.2;
      const ex = cx + Math.cos(rotAngle) * 160;
      const ey = cy + Math.sin(rotAngle) * 80;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    // 3. Rotating 3D Holographic Cylinder (Orderbook Depth Bars)
    const cylinderR = 110;
    const rotation = now * 0.6;
    const slices = 16;

    for (let i = 0; i < slices; i++) {
      const sliceAngle = rotation + (i * Math.PI * 2) / slices;
      const cosA = Math.cos(sliceAngle);
      const sinA = Math.sin(sliceAngle);

      // Hanya gambar separuh depan untuk kedalaman 3D (Culling back-faces)
      const depthFactor = (sinA + 1) / 2; // 0 to 1
      const alpha = 0.15 + depthFactor * 0.7;

      const px = cx + cosA * cylinderR;
      const py = cy + sinA * (cylinderR * 0.5);

      // Ketinggian bar sebanding dengan simulasi volume orderbook
      const barH = 20 + Math.sin(now * 3 + i) * 14 + (i % 2 === 0 ? 15 : 0);
      const isBid = cosA >= 0;
      const col = isBid ? `rgba(16, 185, 129, ${alpha})` : `rgba(244, 63, 94, ${alpha})`;

      ctx.fillStyle = col;
      ctx.fillRect(px - 3, py - barH, 6, barH);

      // Top floating cap
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px - 2, py - barH - 2, 4, 2);
    }

    // 4. Central Floating Core Sphere (Pulsing Alpha Crystal)
    const sphereY = cy - 50 + Math.sin(now * 2) * 6;
    ctx.save();
    ctx.translate(cx, sphereY);

    for (let r = 0; r < 4; r++) {
      const ringAngle = now * (0.8 + r * 0.3);
      ctx.beginPath();
      ctx.ellipse(0, 0, 32 + r * 6, (32 + r * 6) * Math.abs(Math.sin(ringAngle)), ringAngle, 0, Math.PI * 2);
      ctx.strokeStyle = r % 2 === 0 ? 'rgba(56, 189, 248, 0.65)' : 'rgba(251, 191, 36, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Core Flash
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Render Active Shockwaves (Trade Liquidation Ripple)
    for (let s = 0; s < this.shockwaves.length; s++) {
      const sw = this.shockwaves[s];
      if (!sw.active) continue;

      sw.radius += (sw.maxRadius - sw.radius) * 0.08 + 2.5;
      sw.intensity -= 0.025;

      if (sw.intensity <= 0.02 || sw.radius >= sw.maxRadius) {
        sw.active = false;
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(sw.x, sw.y, sw.radius, sw.radius * 0.52, 0, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 3.5 * sw.intensity;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 18 * sw.intensity;
      ctx.globalAlpha = Math.max(0, sw.intensity);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}

export const globalHoloHub = new HolographicMarketHub();
