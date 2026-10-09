// src/lib/office/MarketAtmosphereEngine.ts

export type AtmosphereMode = 'BULL_GOLDEN' | 'BEAR_RAIN' | 'VOLATILITY_GLITCH' | 'NEUTRAL_CLEAN';

interface DustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  pulsePhase: number;
}

interface RainStreak {
  x: number;
  y: number;
  speed: number;
  length: number;
  alpha: number;
}

export class MarketAtmosphereEngine {
  private motes: DustMote[] = [];
  private rainStreaks: RainStreak[] = [];
  private glitchIntensity = 0;
  private width = 2400;
  private height = 1400;

  constructor() {
    // 120 Floating Golden Dust Particles
    for (let i = 0; i < 120; i++) {
      this.motes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.4, // Floating gently upwards
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.1,
        baseAlpha: 0.2 + Math.random() * 0.5,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // 80 Window Glass Rain Streaks
    for (let i = 0; i < 80; i++) {
      this.rainStreaks.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: 12 + Math.random() * 16,
        length: 16 + Math.random() * 28,
        alpha: 0.15 + Math.random() * 0.25,
      });
    }
  }

  public triggerGlitch(intensity: number = 1.0): void {
    this.glitchIntensity = Math.min(1.0, this.glitchIntensity + intensity);
  }

  public render(
    ctx: CanvasRenderingContext2D,
    mode: AtmosphereMode,
    now: number,
    vw: number,
    vh: number
  ): void {
    ctx.save();

    // 1. BULL: GOLDEN DUST MOTES
    if (mode === 'BULL_GOLDEN') {
      ctx.fillStyle = '#fbbf24';
      for (let i = 0; i < this.motes.length; i++) {
        const m = this.motes[i];
        m.x += m.vx + Math.sin(now + m.pulsePhase) * 0.2;
        m.y += m.vy;

        if (m.y < 0) m.y = this.height;
        if (m.x < 0) m.x = this.width;
        if (m.x > this.width) m.x = 0;

        const pulse = Math.sin(now * 2 + m.pulsePhase) * 0.2;
        ctx.globalAlpha = Math.max(0, m.baseAlpha + pulse);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. BEAR: WINDOW RAIN STREAKS
    else if (mode === 'BEAR_RAIN') {
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();

      for (let i = 0; i < this.rainStreaks.length; i++) {
        const r = this.rainStreaks[i];
        r.y += r.speed;
        r.x -= r.speed * 0.25;

        if (r.y > this.height) {
          r.y = 0;
          r.x = Math.random() * this.width;
        }

        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - r.length * 0.25, r.y + r.length);
      }
      ctx.stroke();

      // Cold Ambient Blue Tint
      ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 3. VOLATILITY CRT GLITCH OVERLAY
    if (this.glitchIntensity > 0.02) {
      this.glitchIntensity *= 0.92; // Decay

      ctx.save();
      // Scanlines
      ctx.fillStyle = `rgba(239, 68, 68, ${this.glitchIntensity * 0.12})`;
      for (let y = 0; y < vh; y += 4) {
        ctx.fillRect(0, y, vw, 1.5);
      }

      // Random Glitch Slice Offsets
      if (Math.random() < 0.4) {
        const sliceY = Math.random() * vh;
        const sliceH = 12 + Math.random() * 30;
        const shiftX = (Math.random() - 0.5) * 24 * this.glitchIntensity;
        ctx.fillStyle = `rgba(6, 182, 212, ${this.glitchIntensity * 0.25})`;
        ctx.fillRect(shiftX, sliceY, vw, sliceH);
      }
      ctx.restore();
    }

    ctx.restore();
  }
}

export const globalAtmosphere = new MarketAtmosphereEngine();
