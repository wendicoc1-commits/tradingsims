// src/lib/office/SpriteSheetAtlasPool.ts
export type AgentVisualState = 'idle' | 'walking' | 'typing' | 'alert_crisis' | 'vault_reading' | 'meeting';

export interface BakedSpriteCoord {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/**
 * AgentSpriteAtlas
 * Pre-bakes agent visual state variations onto an Offscreen Canvas Atlas
 * to reduce per-frame canvas procedural path generation and draw call overhead.
 */
export class AgentSpriteAtlas {
  private atlasCanvas: HTMLCanvasElement | null = null;
  private atlasCtx: CanvasRenderingContext2D | null = null;
  private frameCoordinates: Map<string, BakedSpriteCoord> = new Map();
  public spriteSize = 64; // High-DPI base cell

  constructor() {
    if (typeof document !== 'undefined') {
      this.initAtlas();
    }
  }

  private initAtlas(): void {
    try {
      this.atlasCanvas = document.createElement('canvas');
      this.atlasCanvas.width = 512;
      this.atlasCanvas.height = 512;
      this.atlasCtx = this.atlasCanvas.getContext('2d', { alpha: true });
      if (this.atlasCtx) {
        this.atlasCtx.imageSmoothingEnabled = false;
        this.bakeAtlas();
      }
    } catch {
      // Fallback if SSR or canvas creation fails
    }
  }

  private bakeAtlas(): void {
    if (!this.atlasCtx || !this.atlasCanvas) return;
    const ctx = this.atlasCtx;
    const states: AgentVisualState[] = ['idle', 'walking', 'typing', 'alert_crisis', 'vault_reading', 'meeting'];
    const depts = [
      { id: 'ALPHA', color: '#10b981' },
      { id: 'QUANT', color: '#3b82f6' },
      { id: 'RISK', color: '#ef4444' },
      { id: 'MACRO', color: '#f59e0b' },
      { id: 'COMM', color: '#8b5cf6' },
      { id: 'COMPL', color: '#06b6d4' },
    ];

    let curX = 0;
    let curY = 0;

    depts.forEach((dept) => {
      states.forEach((state) => {
        const key = `${dept.id}_${state}`;

        ctx.save();
        ctx.translate(curX + this.spriteSize / 2, curY + this.spriteSize / 2);

        // Pre-baked ambient shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 20, 15, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Outer glow on crisis alert
        if (state === 'alert_crisis') {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, Math.PI * 2);
          ctx.stroke();
        } else if (state === 'typing') {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(-16, -18, 32, 34);
        }

        // Body base
        ctx.fillStyle = dept.color;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(-3, -3, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        ctx.restore();

        this.frameCoordinates.set(key, {
          sx: curX,
          sy: curY,
          sw: this.spriteSize,
          sh: this.spriteSize,
        });

        curX += this.spriteSize;
        if (curX + this.spriteSize > this.atlasCanvas.width) {
          curX = 0;
          curY += this.spriteSize;
        }
      });
    });
  }

  /**
   * Fast sprite drawing via pre-baked texture atlas
   */
  public drawBakedAgent(
    targetCtx: CanvasRenderingContext2D,
    dept: string,
    state: AgentVisualState,
    targetX: number,
    targetY: number,
    scale: number = 1.0
  ): boolean {
    if (!this.atlasCanvas) return false;
    const coord = this.frameCoordinates.get(`${dept}_${state}`) || this.frameCoordinates.get(`${dept}_idle`);
    if (!coord) return false;

    const renderW = this.spriteSize * scale;
    const renderH = this.spriteSize * scale;

    targetCtx.drawImage(
      this.atlasCanvas,
      coord.sx, coord.sy, coord.sw, coord.sh,
      targetX - renderW / 2, targetY - renderH / 2,
      renderW, renderH
    );
    return true;
  }
}

export const globalAgentAtlas = new AgentSpriteAtlas();
