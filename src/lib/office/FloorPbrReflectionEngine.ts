// src/lib/office/FloorPbrReflectionEngine.ts
/**
 * PBR Wet/Metallic Floor Reflection Engine
 * Renders high-fidelity specular reflections of desk monitors, holograms,
 * and neon wall tickers across the dark marble trading floor.
 */

export type FloorPbrRegime = 'BULL_MOMENTUM' | 'BEAR_DRAWDOWN' | 'HIGH_VOLATILITY';

export interface EmissiveLightSource {
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
}

export class FloorPbrReflectionEngine {
  private lights: EmissiveLightSource[] = [];

  constructor() {
    this.initDefaultLights();
  }

  private initDefaultLights() {
    // Light source for Central Hologram Core
    this.lights.push({
      x: 880,
      y: 520,
      radius: 220,
      color: '#06b6d4',
      intensity: 0.35,
    });
  }

  public registerLight(light: EmissiveLightSource): void {
    this.lights.push(light);
  }

  /**
   * Renders PBR Wet Marble Floor Surface
   */
  public renderFloor(
    ctx: CanvasRenderingContext2D,
    worldW: number,
    worldH: number,
    now: number,
    regime: FloorPbrRegime = 'BULL_MOMENTUM'
  ): void {
    ctx.save();

    // 1. Base Dark Metallic Marble Background
    const baseGradient = ctx.createLinearGradient(0, 0, worldW, worldH);
    if (regime === 'BULL_MOMENTUM') {
      baseGradient.addColorStop(0, '#040d12');
      baseGradient.addColorStop(0.5, '#07161b');
      baseGradient.addColorStop(1, '#02090d');
    } else if (regime === 'BEAR_DRAWDOWN') {
      baseGradient.addColorStop(0, '#0a0a14');
      baseGradient.addColorStop(0.5, '#080c18');
      baseGradient.addColorStop(1, '#04050a');
    } else {
      // HIGH_VOLATILITY
      baseGradient.addColorStop(0, '#120a06');
      baseGradient.addColorStop(0.5, '#180f08');
      baseGradient.addColorStop(1, '#080503');
    }

    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, worldW, worldH);

    // 2. High-Tech Grid Tile Lines (Planar Perspective)
    const tileSize = 64;
    ctx.strokeStyle =
      regime === 'BULL_MOMENTUM'
        ? 'rgba(16, 185, 129, 0.05)'
        : regime === 'BEAR_DRAWDOWN'
        ? 'rgba(56, 189, 248, 0.04)'
        : 'rgba(245, 158, 11, 0.06)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = 0; x < worldW; x += tileSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, worldH);
    }
    for (let y = 0; y < worldH; y += tileSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(worldW, y);
    }
    ctx.stroke();

    // 3. Emissive Specular Light Reflections (Fresnel glow onto wet surface)
    for (const light of this.lights) {
      const grad = ctx.createRadialGradient(
        light.x,
        light.y,
        10,
        light.x,
        light.y,
        light.radius
      );
      grad.addColorStop(0, light.color);
      grad.addColorStop(0.4, `${light.color}44`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.save();
      ctx.globalAlpha = light.intensity * (0.85 + Math.sin(now * 2) * 0.15);
      ctx.fillStyle = grad;
      ctx.beginPath();
      // Elliptical perspective puddle reflection
      ctx.ellipse(light.x, light.y, light.radius, light.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Subtle Wet Surface Sheen (Micro-shimmer)
    const shimmerAlpha = 0.03 + Math.sin(now * 1.5) * 0.015;
    ctx.fillStyle = `rgba(255, 255, 255, ${shimmerAlpha})`;
    ctx.fillRect(0, 0, worldW, worldH);

    ctx.restore();
  }

  /**
   * Renders non-destructive specular light reflections over existing rendered floors
   */
  public renderFloorSpecularReflection(
    ctx: CanvasRenderingContext2D,
    worldW: number,
    worldH: number,
    now: number,
    regime: FloorPbrRegime = 'BULL_MOMENTUM'
  ): void {
    ctx.save();
    for (const light of this.lights) {
      const grad = ctx.createRadialGradient(
        light.x,
        light.y,
        10,
        light.x,
        light.y,
        light.radius
      );
      grad.addColorStop(0, light.color);
      grad.addColorStop(0.4, `${light.color}44`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.save();
      ctx.globalAlpha = light.intensity * (0.75 + Math.sin(now * 2) * 0.2);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(light.x, light.y, light.radius, light.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const shimmerAlpha = 0.02 + Math.sin(now * 1.5) * 0.01;
    ctx.fillStyle = `rgba(255, 255, 255, ${shimmerAlpha})`;
    ctx.fillRect(0, 0, worldW, worldH);
    ctx.restore();
  }
}

export const globalFloorPbr = new FloorPbrReflectionEngine();

