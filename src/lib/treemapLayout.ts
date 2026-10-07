export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TreemapResult<T> {
  data: T;
  value: number;
  rect: Rect;
}

/**
 * Bruls, Huizing, van Wijk (2000) Squarified Treemap Algorithm
 * Produces aspect-ratio optimized rectangular tessellations fitting perfectly inside container.
 */
export function computeSquarifiedTreemap<T>(
  items: { data: T; value: number }[],
  container: Rect
): TreemapResult<T>[] {
  if (items.length === 0 || container.w <= 0 || container.h <= 0) return [];

  // Filter positive weights
  const validItems = items.filter((i) => i.value > 0);
  if (validItems.length === 0) return [];

  // Sort descending by weight
  validItems.sort((a, b) => b.value - a.value);

  const totalValue = validItems.reduce((sum, item) => sum + item.value, 0);
  const totalArea = container.w * container.h;

  // Normalized area per item such that sum(area) == containerArea
  const normalized = validItems.map((item) => ({
    ...item,
    area: (item.value / totalValue) * totalArea,
  }));

  const results: TreemapResult<T>[] = [];

  function worst(row: typeof normalized, sideLength: number): number {
    if (row.length === 0) return Infinity;
    const rowArea = row.reduce((sum, r) => sum + r.area, 0);
    const side2 = sideLength * sideLength;
    const rowArea2 = rowArea * rowArea;
    let max = -Infinity;
    for (const item of row) {
      const a = item.area;
      const r1 = (side2 * a) / rowArea2;
      const r2 = rowArea2 / (side2 * a);
      const ratio = Math.max(r1, r2);
      if (ratio > max) max = ratio;
    }
    return max;
  }

  function layoutRow(
    row: typeof normalized,
    rect: Rect
  ): { nextRect: Rect } {
    const rowArea = row.reduce((sum, r) => sum + r.area, 0);
    const isHorizontal = rect.w >= rect.h;

    if (isHorizontal) {
      const rowWidth = Math.max(1, rowArea / rect.h);
      let curY = rect.y;
      for (const item of row) {
        const itemHeight = Math.max(1, item.area / rowWidth);
        results.push({
          data: item.data,
          value: item.value,
          rect: {
            x: rect.x,
            y: curY,
            w: rowWidth,
            h: itemHeight,
          },
        });
        curY += itemHeight;
      }
      return {
        nextRect: {
          x: rect.x + rowWidth,
          y: rect.y,
          w: Math.max(0, rect.w - rowWidth),
          h: rect.h,
        },
      };
    } else {
      const rowHeight = Math.max(1, rowArea / rect.w);
      let curX = rect.x;
      for (const item of row) {
        const itemWidth = Math.max(1, item.area / rowHeight);
        results.push({
          data: item.data,
          value: item.value,
          rect: {
            x: curX,
            y: rect.y,
            w: itemWidth,
            h: rowHeight,
          },
        });
        curX += itemWidth;
      }
      return {
        nextRect: {
          x: rect.x,
          y: rect.y + rowHeight,
          w: rect.w,
          h: Math.max(0, rect.h - rowHeight),
        },
      };
    }
  }

  function squarify(
    children: typeof normalized,
    row: typeof normalized,
    rect: Rect
  ) {
    if (children.length === 0) {
      if (row.length > 0) {
        layoutRow(row, rect);
      }
      return;
    }

    const item = children[0];
    const shortestSide = Math.max(1, Math.min(rect.w, rect.h));

    if (row.length === 0) {
      squarify(children.slice(1), [item], rect);
      return;
    }

    const currentWorst = worst(row, shortestSide);
    const candidateWorst = worst([...row, item], shortestSide);

    if (candidateWorst <= currentWorst) {
      squarify(children.slice(1), [...row, item], rect);
    } else {
      const { nextRect } = layoutRow(row, rect);
      squarify(children, [], nextRect);
    }
  }

  squarify(normalized, [], container);

  return results;
}

/**
 * Canonical TradingView Heatmap Colors:
 * Vibrant green on top, dark muted crimson on bottom, dark neutral in the middle.
 */
export function getTradingViewBlockColor(
  value: number,
  metricType: 'change' | 'change_1w' | 'change_1m' | 'change_1y' | 'div_yield' | 'pe_ratio'
): { bg: string; text: string; border: string } {
  if (metricType === 'div_yield') {
    if (value >= 10.0) return { bg: '#089981', text: '#ffffff', border: '#10b981' };
    if (value >= 6.0) return { bg: '#0d6b5b', text: '#ffffff', border: '#059669' };
    if (value >= 3.0) return { bg: '#17493f', text: '#e2e8f0', border: '#047857' };
    if (value > 0.0) return { bg: '#1f3531', text: '#cbd5e1', border: '#064e3b' };
    return { bg: '#2a2e39', text: '#94a3b8', border: '#334155' };
  }

  if (metricType === 'pe_ratio') {
    if (value <= 0) return { bg: '#2a2e39', text: '#94a3b8', border: '#334155' }; // Defisit
    if (value <= 8.0) return { bg: '#089981', text: '#ffffff', border: '#10b981' }; // Sangat Murah
    if (value <= 15.0) return { bg: '#0d6b5b', text: '#ffffff', border: '#059669' }; // Valuasi Wajar
    if (value <= 25.0) return { bg: '#17493f', text: '#e2e8f0', border: '#047857' };
    if (value <= 40.0) return { bg: '#50232b', text: '#fecdd3', border: '#881337' };
    return { bg: '#f23645', text: '#ffffff', border: '#ef4444' }; // Premium / Mahal
  }

  // Default: Percentage Change (1D, 1W, 1M, 1Y)
  if (value >= 3.0) {
    return { bg: '#089981', text: '#ffffff', border: '#22c55e' }; // Vibrant Green
  }
  if (value >= 1.5) {
    return { bg: '#0c6052', text: '#ffffff', border: '#16a34a' }; // Medium Green
  }
  if (value > 0.15) {
    return { bg: '#133e36', text: '#e2e8f0', border: '#15803d' }; // Muted Green
  }
  if (value >= -0.15 && value <= 0.15) {
    return { bg: '#2a2e39', text: '#94a3b8', border: '#374151' }; // Neutral Slate Gray
  }
  if (value > -1.5) {
    return { bg: '#4a1e24', text: '#fecdd3', border: '#991b1b' }; // Muted Red
  }
  if (value > -3.0) {
    return { bg: '#8c2532', text: '#ffffff', border: '#dc2626' }; // Medium Red
  }
  return { bg: '#f23645', text: '#ffffff', border: '#f87171' }; // Vibrant Red
}
