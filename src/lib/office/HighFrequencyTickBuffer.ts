// src/lib/office/HighFrequencyTickBuffer.ts
export interface MarketTick {
  symbol: string;
  price: number;
  change24h: number;
  timestamp: number;
  volume: number;
}

/**
 * LockFreeMarketRingBuffer
 * High-frequency circular buffer decoupling high-throughput WebSocket streams (e.g. Binance/VPS)
 * from React rendering cycles and canvas draw ticks.
 */
export class LockFreeMarketRingBuffer {
  private capacity: number;
  private buffer: Array<MarketTick | null>;
  private writePointer: number = 0;
  private latestPointers: Map<string, number> = new Map();

  constructor(capacity: number = 512) {
    this.capacity = capacity;
    this.buffer = new Array(capacity).fill(null);
  }

  /**
   * Enqueue tick without triggering React re-renders or GC churn
   */
  public push(tick: MarketTick): void {
    const idx = this.writePointer % this.capacity;
    this.buffer[idx] = tick;
    this.latestPointers.set(tick.symbol, idx);
    this.writePointer++;
    if (this.writePointer >= this.capacity * 2) {
      this.writePointer = this.writePointer % this.capacity;
    }
  }

  /**
   * Instant O(1) retrieval of the latest market tick for a symbol
   */
  public getLatest(symbol: string): MarketTick | null {
    const idx = this.latestPointers.get(symbol);
    if (idx === undefined) return null;
    return this.buffer[idx];
  }

  /**
   * Consumes a bulk snapshot without garbage collection pressure
   */
  public drainRecentSnapshot(): Record<string, MarketTick> {
    const snapshot: Record<string, MarketTick> = {};
    for (const [sym, idx] of this.latestPointers.entries()) {
      const val = this.buffer[idx];
      if (val) snapshot[sym] = val;
    }
    return snapshot;
  }
}

export const globalTickBuffer = new LockFreeMarketRingBuffer(1024);
