// src/lib/cognitive/EpisodicMemoryStore.ts
/**
 * Episodic Memory Vault & Continuous Learning Store
 * Menyimpan pelajaran kegagalan masa lalu (Anti-Patterns & Heuristics)
 * untuk diinjeksi ke Pre-Action Retrieval sebelum eksekusi order.
 */

export interface EpisodicHeuristic {
  id: string;
  timestamp: number;
  symbol: string;
  regime: 'BULL_MOMENTUM' | 'BEAR_DRAWDOWN' | 'HIGH_VOLATILITY' | 'CALM_EQUILIBRIUM';
  rootCause: 'ASSUMPTION_ERROR' | 'EXECUTION_SLIPPAGE' | 'DATA_ANOMALY' | 'REGIME_SHIFT';
  rule: string;
  pnlPct: number;
  tags: string[];
}

const STORAGE_KEY = 'TRADEMIND_EPISODIC_HEURISTICS_V1';

export class EpisodicMemoryStore {
  private heuristics: EpisodicHeuristic[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.heuristics = JSON.parse(raw);
      }
    } catch {
      this.heuristics = [];
    }

    // Default Seed Heuristics jika memori masih kosong
    if (this.heuristics.length === 0) {
      this.heuristics = [
        {
          id: 'SEED-001',
          timestamp: Date.now() - 86400000 * 3,
          symbol: 'BBRI',
          regime: 'BEAR_DRAWDOWN',
          rootCause: 'ASSUMPTION_ERROR',
          rule: 'JANGAN beli breakout di BBRI saat IHSG/Regime BEAR_DRAWDOWN tanpa akumulasi asing Net Buy > Rp 50 Miliar.',
          pnlPct: -3.8,
          tags: ['IDX', 'BREAKOUT', 'BEAR_MARKET'],
        },
        {
          id: 'SEED-002',
          timestamp: Date.now() - 86400000 * 2,
          symbol: 'BTCUSDT',
          regime: 'HIGH_VOLATILITY',
          rootCause: 'EXECUTION_SLIPPAGE',
          rule: 'Wajib gunakan Trailing Stop ATR 2.5x saat BTCUSDT berfluktuasi > 4% dalam 1 jam untuk mencegah likuidasi wick palsu.',
          pnlPct: -4.2,
          tags: ['CRYPTO', 'SLIPPAGE', 'HIGH_VOLATILITY'],
        },
        {
          id: 'SEED-003',
          timestamp: Date.now() - 86400000,
          symbol: 'ASII',
          regime: 'CALM_EQUILIBRIUM',
          rootCause: 'REGIME_SHIFT',
          rule: 'Tolak sinyal beli ASII jika volume harian di bawah rata-rata MA20 (likuiditas mengering).',
          pnlPct: -2.5,
          tags: ['IDX', 'VOLUME', 'LIQUIDITY'],
        },
      ];
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.heuristics.slice(0, 100))); // Maks 100 memori terbaru
    } catch {}
  }

  /**
   * Commit pelajaran baru dari hasil post-mortem
   */
  public commitLesson(heuristic: Omit<EpisodicHeuristic, 'id' | 'timestamp'>): EpisodicHeuristic {
    const entry: EpisodicHeuristic = {
      ...heuristic,
      id: `EP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: Date.now(),
    };

    // Sisipkan di awal (most recent first)
    this.heuristics.unshift(entry);
    this.saveToStorage();

    // Sync juga ke VPS backend asinkron
    if (typeof window !== 'undefined') {
      fetch('/api/quant?action=memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: entry.symbol,
          decision: 'POST_MORTEM_COMMIT',
          justification: entry.rule,
          market_regime: entry.regime,
          post_trade_reflection: `Root Cause: ${entry.rootCause} | PnL: ${entry.pnlPct}%`,
        }),
      }).catch(() => {});
    }

    return entry;
  }

  /**
   * Pre-Action Retrieval: Cari memori kegagalan paling relevan untuk aset dan regime saat ini
   */
  public retrieveSimilarMistakes(
    symbol: string,
    regime: string,
    limit: number = 3
  ): EpisodicHeuristic[] {
    const symUpper = symbol.toUpperCase().replace('.JK', '');

    // Skoring relevansi berbasis simbol, regime, dan kata kunci
    const scored = this.heuristics.map((h) => {
      let score = 0;
      if (h.symbol.toUpperCase().replace('.JK', '') === symUpper) score += 5;
      if (h.regime === regime) score += 3;
      return { heuristic: h, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored
      .filter((s) => s.score > 0)
      .slice(0, limit)
      .map((s) => s.heuristic);
  }

  public getAll(): EpisodicHeuristic[] {
    return [...this.heuristics];
  }
}

export const globalEpisodicMemory = new EpisodicMemoryStore();
