/**
 * Utilitas dan Aturan Bursa Efek Indonesia (IDX) & Pasar US
 */

export interface TickRule {
  min: number;
  max: number;
  tick: number;
}

// Fraksi Harga Resmi BEI (IDX) SK Direksi PT BEI
export const IDX_TICK_RULES: TickRule[] = [
  { min: 0, max: 200, tick: 1 },
  { min: 200, max: 500, tick: 2 },
  { min: 500, max: 2000, tick: 5 },
  { min: 2000, max: 5000, tick: 10 },
  { min: 5000, max: Infinity, tick: 25 },
];

/**
 * Mengambil fraksi harga yang sah untuk harga tertentu di BEI
 */
export function getIDXTickSize(price: number): number {
  if (price <= 0) return 1;
  const rule = IDX_TICK_RULES.find((r) => price >= r.min && price < r.max);
  return rule ? rule.tick : 25;
}

/**
 * Validasi apakah harga mematuhi fraksi harga resmi BEI
 */
export function isValidIDXTick(price: number): { valid: boolean; tick: number; nearest: number } {
  const tick = getIDXTickSize(price);
  const remainder = price % tick;
  if (remainder === 0) {
    return { valid: true, tick, nearest: price };
  }
  const nearest = Math.round(price / tick) * tick;
  return { valid: false, tick, nearest };
}

/**
 * Menghitung jumlah lembar saham:
 * - Saham IDX (misal BBCA, BBCA.JK): 1 lot = 100 lembar
 * - Saham US (misal NVDA, AAPL): 1 lot di form dianggap 1 share
 */
export function calculateShares(symbol: string, lots: number): { isUS: boolean; shares: number; unitLabel: string } {
  const clean = symbol.replace('.JK', '').toUpperCase();
  const isUS = !symbol.endsWith('.JK') && clean.length <= 5 && !['BBCA','BBRI','BMRI','BBNI','TLKM','ASII','AMMN','BREN','ICBP','INDF','GOTO','UNVR','ADRO','ANTM','BRIS','KLBF','PGAS'].includes(clean);
  
  if (isUS) {
    return { isUS: true, shares: lots, unitLabel: 'lembar (shares)' };
  }
  return { isUS: false, shares: lots * 100, unitLabel: 'lot (100 lembar)' };
}

/**
 * Normalisasi ticker agar konsisten
 */
export function normalizeSymbol(sym: string): { fullSymbol: string; displaySymbol: string } {
  const clean = sym.trim().toUpperCase().replace('.JK', '');
  // Default saham Indonesia jika 4 huruf
  if (clean.length === 4 && /^[A-Z]+$/.test(clean)) {
    return { fullSymbol: `${clean}.JK`, displaySymbol: clean };
  }
  return { fullSymbol: sym.includes('.') || sym.startsWith('^') ? sym : `${clean}.JK`, displaySymbol: clean };
}
