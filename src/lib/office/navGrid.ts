/**
 * Navigasi grid sederhana untuk agen kantor: BFS 4-arah + string-pulling (line-of-sight).
 * Cukup cepat untuk dunia 2400x1500 px dengan sel 16 px (~14 ribu sel).
 */

export interface Pt {
  x: number;
  y: number;
}

export class NavGrid {
  readonly cell: number;
  readonly cols: number;
  readonly rows: number;
  private blocked: Uint8Array;

  constructor(worldW: number, worldH: number, cell = 16) {
    this.cell = cell;
    this.cols = Math.ceil(worldW / cell);
    this.rows = Math.ceil(worldH / cell);
    this.blocked = new Uint8Array(this.cols * this.rows);
  }

  private idx(cx: number, cy: number) {
    return cy * this.cols + cx;
  }

  inBounds(cx: number, cy: number) {
    return cx >= 0 && cy >= 0 && cx < this.cols && cy < this.rows;
  }

  blockRect(x: number, y: number, w: number, h: number) {
    const x0 = Math.max(0, Math.floor(x / this.cell));
    const y0 = Math.max(0, Math.floor(y / this.cell));
    const x1 = Math.min(this.cols - 1, Math.floor((x + w) / this.cell));
    const y1 = Math.min(this.rows - 1, Math.floor((y + h) / this.cell));
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) this.blocked[this.idx(cx, cy)] = 1;
    }
  }

  isFreeCell(cx: number, cy: number) {
    return this.inBounds(cx, cy) && this.blocked[this.idx(cx, cy)] === 0;
  }

  isFreePoint(x: number, y: number) {
    return this.isFreeCell(Math.floor(x / this.cell), Math.floor(y / this.cell));
  }

  /** Sel bebas terdekat (spiral) dari sebuah titik dunia. */
  nearestFree(x: number, y: number): { cx: number; cy: number } {
    const cx0 = Math.floor(x / this.cell);
    const cy0 = Math.floor(y / this.cell);
    if (this.isFreeCell(cx0, cy0)) return { cx: cx0, cy: cy0 };
    for (let r = 1; r < 40; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          if (this.isFreeCell(cx0 + dx, cy0 + dy)) return { cx: cx0 + dx, cy: cy0 + dy };
        }
      }
    }
    return { cx: Math.max(0, Math.min(this.cols - 1, cx0)), cy: Math.max(0, Math.min(this.rows - 1, cy0)) };
  }

  private lineClear(a: Pt, b: Pt): boolean {
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.ceil(dist / (this.cell / 2)));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (!this.isFreePoint(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) return false;
    }
    return true;
  }

  /** Cari jalur dari (sx,sy) ke (tx,ty). Hasil berupa titik-titik dunia (tanpa titik awal). */
  findPath(sx: number, sy: number, tx: number, ty: number): Pt[] {
    const start = this.nearestFree(sx, sy);
    const goal = this.nearestFree(tx, ty);
    const total = this.cols * this.rows;
    const prev = new Int32Array(total).fill(-2);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;
    const s = this.idx(start.cx, start.cy);
    const g = this.idx(goal.cx, goal.cy);
    prev[s] = -1;
    queue[tail++] = s;
    const dxs = [1, -1, 0, 0];
    const dys = [0, 0, 1, -1];
    let found = s === g;
    while (head < tail && !found) {
      const cur = queue[head++];
      const cx = cur % this.cols;
      const cy = (cur / this.cols) | 0;
      for (let k = 0; k < 4; k++) {
        const nx = cx + dxs[k];
        const ny = cy + dys[k];
        if (!this.isFreeCell(nx, ny)) continue;
        const ni = this.idx(nx, ny);
        if (prev[ni] !== -2) continue;
        prev[ni] = cur;
        if (ni === g) {
          found = true;
          break;
        }
        queue[tail++] = ni;
      }
    }
    if (!found) return [{ x: tx, y: ty }];

    const cells: Pt[] = [];
    for (let c = g; c !== -1; c = prev[c]) {
      cells.push({
        x: (c % this.cols) * this.cell + this.cell / 2,
        y: ((c / this.cols) | 0) * this.cell + this.cell / 2,
      });
    }
    cells.reverse();
    cells.push({ x: tx, y: ty });

    // string-pulling: loncat ke titik terjauh yang masih terlihat langsung
    const pts: Pt[] = [];
    let anchor: Pt = { x: sx, y: sy };
    let i = 0;
    while (i < cells.length) {
      let far = i;
      for (let j = cells.length - 1; j > i; j--) {
        if (this.lineClear(anchor, cells[j])) {
          far = j;
          break;
        }
      }
      pts.push(cells[far]);
      anchor = cells[far];
      i = far + 1;
    }
    return pts;
  }
}
