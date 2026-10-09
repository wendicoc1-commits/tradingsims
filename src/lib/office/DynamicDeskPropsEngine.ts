// src/lib/office/DynamicDeskPropsEngine.ts

export interface AgentDeskStatus {
  agentId: string;
  deskX: number;
  deskY: number;
  pendingTasks: number; // 0 = clean, >2 = stacked coffee mugs
  isTopSharpe: boolean; // Menampilkan Golden Bull Trophy
  hasError: boolean;    // Menampilkan Overheat Smoke/Glitch
}

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  life: number;
}

export class DynamicDeskPropsEngine {
  private smokePool: SmokeParticle[] = [];

  constructor() {
    for (let i = 0; i < 40; i++) {
      this.smokePool.push({ x: 0, y: 0, vx: 0, vy: 0, alpha: 0, size: 2, life: 0 });
    }
  }

  public emitErrorSmoke(x: number, y: number): void {
    const p = this.smokePool.find((item) => item.life <= 0);
    if (!p) return;
    p.x = x + (Math.random() - 0.5) * 14;
    p.y = y - 30;
    p.vx = (Math.random() - 0.5) * 0.8;
    p.vy = -1.2 - Math.random() * 0.8;
    p.size = 3 + Math.random() * 3;
    p.alpha = 0.8;
    p.life = 1.0;
  }

  public renderProps(ctx: CanvasRenderingContext2D, status: AgentDeskStatus, now: number): void {
    const { deskX, deskY, pendingTasks, isTopSharpe, hasError } = status;
    ctx.save();

    // 1. Stacked Coffee Mugs (Berdasarkan volume antrean tugas)
    const mugCount = Math.min(4, Math.floor(pendingTasks / 2));
    if (mugCount > 0) {
      const mugX = deskX - 32;
      const mugY = deskY - 14;

      for (let i = 0; i < mugCount; i++) {
        const stackOffset = i * 5;
        // Mug Body
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(mugX, mugY - stackOffset, 7, 6);
        // Mug Handle
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.strokeRect(mugX - 2, mugY - stackOffset + 1, 2, 4);
      }

      // Uap kopi mengepul dari cangkir teratas
      const steamY = mugY - mugCount * 5 - 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mugX + 3, steamY);
      ctx.quadraticCurveTo(mugX + 6 + Math.sin(now * 4) * 2, steamY - 6, mugX + 2, steamY - 12);
      ctx.stroke();
    }

    // 2. Golden Bull Trophy (Untuk Top Sharpe Performer)
    if (isTopSharpe) {
      const trophyX = deskX + 28;
      const trophyY = deskY - 20;

      // Pedestal
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(trophyX - 6, trophyY + 8, 12, 4);

      // Gold Glow Flare
      const pulse = 0.6 + Math.sin(now * 3) * 0.3;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10 * pulse;

      // Golden Bull Figurine Silhouette
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(trophyX, trophyY + 3, 5, 0, Math.PI * 2);
      ctx.fill();

      // Horns
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(trophyX - 4, trophyY + 1);
      ctx.lineTo(trophyX - 7, trophyY - 3);
      ctx.moveTo(trophyX + 4, trophyY + 1);
      ctx.lineTo(trophyX + 7, trophyY - 3);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 3. Overheat Smoke Emitter (Ketika Error / Rate Limit Terjadi)
    if (hasError && Math.random() < 0.25) {
      this.emitErrorSmoke(deskX, deskY);
    }

    ctx.restore();
  }

  public updateAndDrawSmoke(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (let i = 0; i < this.smokePool.length; i++) {
      const p = this.smokePool[i];
      if (p.life <= 0) continue;

      p.x += p.vx;
      p.y += p.vy;
      p.size += 0.15;
      p.life -= 0.025;
      p.alpha = p.life * 0.7;

      ctx.fillStyle = `rgba(239, 68, 68, ${p.alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export const globalDeskProps = new DynamicDeskPropsEngine();
