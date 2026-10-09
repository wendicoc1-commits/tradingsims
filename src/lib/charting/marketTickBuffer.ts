/**
 * High-Performance Decoupled Market Tick Ring Buffer (Pilar 1)
 * 
 * Mengisolasi update streaming WebSocket berfrekuensi tinggi (10-50 ticks/detik)
 * dari React Lifecycle. Rendering engine membaca langsung dari buffer menggunakan
 * interpolasi linier (Lerp) untuk menjamin 60 FPS tanpa unnecessary re-renders.
 */

export interface MarketTick {
  timestamp: number;
  price: number;
  volume: number;
}

export class MarketTickRingBuffer {
  private capacity: number;
  private timestamps: Float64Array;
  private prices: Float64Array;
  private volumes: Float64Array;
  private head: number = 0;
  private count: number = 0;

  constructor(capacity: number = 256) {
    this.capacity = capacity;
    this.timestamps = new Float64Array(capacity);
    this.prices = new Float64Array(capacity);
    this.volumes = new Float64Array(capacity);
  }

  /**
   * Menambahkan tick baru dengan O(1) memory complexity (Zero Garbage Collection)
   */
  public push(price: number, volume: number = 0, timestamp: number = performance.now()): void {
    this.timestamps[this.head] = timestamp;
    this.prices[this.head] = price;
    this.volumes[this.head] = volume;

    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) {
      this.count++;
    }
  }

  /**
   * Mendapatkan harga terbaru
   */
  public getLatestPrice(): number {
    if (this.count === 0) return 0;
    const latestIndex = (this.head - 1 + this.capacity) % this.capacity;
    return this.prices[latestIndex];
  }

  /**
   * Interpolasi linier (Lerp) untuk transisi animasi chart/canvas yang halus
   */
  public interpolatePrice(currentVisualPrice: number, smoothingFactor: number = 0.15): number {
    const targetPrice = this.getLatestPrice();
    if (targetPrice === 0) return currentVisualPrice;
    return currentVisualPrice + (targetPrice - currentVisualPrice) * smoothingFactor;
  }

  /**
   * Mengambil snapshot N tick terakhir untuk visualisasi sparkline
   */
  public getRecentPrices(limit: number = 30): number[] {
    const result: number[] = [];
    const n = Math.min(this.count, limit);
    for (let i = n - 1; i >= 0; i--) {
      const idx = (this.head - 1 - i + this.capacity * 2) % this.capacity;
      result.push(this.prices[idx]);
    }
    return result;
  }

  public clear(): void {
    this.head = 0;
    this.count = 0;
  }
}
