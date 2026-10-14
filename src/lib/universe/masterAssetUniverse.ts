/**
 * Fincept Master Asset Universe
 * Unifies 1200+ assets across:
 * - 951+ Indonesia Stock Exchange (IDX / BEI) Equities
 * - 160+ Global US & International Stocks (NASDAQ, S&P 500, NYSE, TSE, HKEX, Euronext)
 * - 72+ Top Liquid Cryptocurrencies (Binance / Spot)
 */

import idxDividendJson from '@/data/idx_dividend_all.json';
import { IDX_BENCHMARK_PRICES } from '@/data/idx_benchmark_prices';
import { MASTER_GLOBAL_STOCKS, MASTER_GLOBAL_CRYPTO } from '@/data/global_markets_universe';

export type AssetCategory = 'IDX' | 'CRYPTO' | 'GLOBAL';

export interface UnifiedAsset {
  symbol: string;
  name: string;
  category: AssetCategory;
  sector: string;
  currency: 'IDR' | 'USD';
  market: 'IDX' | 'US' | 'CRYPTO';
  board?: string;
  defaultPrice: number;
  flag: string;
  isPopular?: boolean;
}

// 1. Top Cryptocurrencies generated dynamically from MASTER_GLOBAL_CRYPTO (120+ pairs)
const POPULAR_CRYPTO = new Set([
  'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR',
  'LINK', 'PEPE', 'SHIB', 'RENDER', 'ARB', 'APT', 'TAO', 'FET', 'TON', 'KAS',
  'WIF', 'BONK', 'ENA', 'TIA', 'ONDO', 'JUP', 'AAVE', 'PENDLE', 'RAY', 'STRK',
]);

const CRYPTO_MASTER: UnifiedAsset[] = MASTER_GLOBAL_CRYPTO.map((c) => {
  const base = c.symbol.replace(/USDT$/, '');
  return {
    symbol: base,
    name: c.name,
    category: 'CRYPTO' as AssetCategory,
    sector: `Crypto ${c.category}`,
    currency: 'USD' as const,
    market: 'CRYPTO' as const,
    defaultPrice: c.price,
    flag: '⚡',
    isPopular: POPULAR_CRYPTO.has(base),
  };
});

// 2. Global US & World Stocks (160+ emiten)
// 2. 951 IDX Stocks from idx_dividend_all.json
const POPULAR_IDX = new Set([
  'BBCA', 'BBRI', 'BMRI', 'BBNI', 'ASII', 'TLKM',
  'ADRO', 'PTBA', 'PGAS', 'AMMN', 'ANTM', 'BREN',
  'ICBP', 'UNVR', 'MYOR', 'GOTO', 'BUKA', 'EMTK',
  'BRIS', 'MEDC', 'INKP', 'MDKA', 'CPIN', 'BRMS', 'CUAN',
]);

const IDX_MASTER: UnifiedAsset[] = (idxDividendJson as any[]).map((item) => {
  const code = (item.code || '').toUpperCase().trim();
  const benchmark = IDX_BENCHMARK_PRICES[code];
  const price = benchmark ? benchmark.price : (item.dps && item.yield ? Math.round((item.dps / item.yield) * 100) : 1000);

  return {
    symbol: code,
    name: item.name || `${code} Tbk`,
    category: 'IDX' as AssetCategory,
    sector: item.sector || 'General',
    currency: 'IDR' as const,
    market: 'IDX' as const,
    board: item.board || 'Utama',
    defaultPrice: price,
    flag: '🇮🇩',
    isPopular: POPULAR_IDX.has(code),
  };
});

const IDX_SET = new Set(IDX_MASTER.map((i) => i.symbol.toUpperCase()));

// 3. Global US & World Stocks (170+ emiten luar negeri)
const POPULAR_GLOBAL = new Set([
  'NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'META', 'PLTR', 'AVGO', 'AMD',
  'BRK.B', 'LLY', 'JPM', 'V', 'WMT', 'NFLX', 'ORCL', 'COST', 'XOM', 'COIN', 'QCOM',
  'CRM', 'ADBE', 'INTC', 'MA', 'PG', 'JNJ', 'HD', 'TSM', 'BABA', 'ASML', 'NVO',
  'ARM', 'SMCI', 'MSTR', 'UBER', 'CRWD', 'NOW', 'SNOW', 'RACE',
  'SPY', 'QQQ', 'SOXX', 'SMH', 'VOO',
]);

const GLOBAL_MASTER: UnifiedAsset[] = MASTER_GLOBAL_STOCKS
  .filter((s) => s.countryCode !== 'ID')
  .map((s) => ({
    symbol: s.ticker.toUpperCase(),
    name: s.name,
    category: 'GLOBAL' as AssetCategory,
    sector: s.sector,
    currency: (s.currency === 'IDR' ? 'IDR' : 'USD') as const,
    market: (s.countryCode === 'ID' ? 'IDX' : 'US') as const,
    defaultPrice: s.price,
    flag: s.flag || '🌐',
    isPopular: POPULAR_GLOBAL.has(s.ticker.toUpperCase()),
  }));

const GLOBAL_BY_SYMBOL = new Map<string, UnifiedAsset>();
for (const a of GLOBAL_MASTER) {
  GLOBAL_BY_SYMBOL.set(a.symbol.toUpperCase(), a);
}

// Master Map: Prioritaskan IDX dan Kripto agar tidak tertimpa saham global
export const MASTER_ASSETS: UnifiedAsset[] = [...CRYPTO_MASTER, ...IDX_MASTER, ...GLOBAL_MASTER];

// Index for O(1) lookup
const ASSET_BY_SYMBOL = new Map<string, UnifiedAsset>();
for (const a of MASTER_ASSETS) {
  const sym = a.symbol.toUpperCase();
  if (a.category === 'IDX') {
    ASSET_BY_SYMBOL.set(`${sym}.JK`, a);
  }
  // Jangan menimpa emiten jika sudah terdaftar
  if (!ASSET_BY_SYMBOL.has(sym)) {
    ASSET_BY_SYMBOL.set(sym, a);
  }
  if (a.category === 'CRYPTO') {
    ASSET_BY_SYMBOL.set(`${sym}USDT`, a);
    ASSET_BY_SYMBOL.set(`${sym}-USD`, a);
  }
}

// Global sets for fast O(1) membership checks
const CRYPTO_SET = new Set([
  ...CRYPTO_MASTER.map((c) => c.symbol.toUpperCase()),
  'S', 'SONIC', 'FTM', 'MATIC', 'POL', 'SKY', 'MKR',
]);
const GLOBAL_SET = new Set(GLOBAL_MASTER.map((g) => g.symbol.toUpperCase()));

/**
 * Check whether a symbol represents a Cryptocurrency
 */
export function isCryptoSymbol(symbol: string): boolean {
  if (!symbol) return false;
  const upper = symbol.trim().toUpperCase();
  if (upper.endsWith('.JK')) return false;
  const clean = upper.replace(/USDT$/i, '').replace(/-USD$/i, '');
  return CRYPTO_SET.has(clean) || upper.endsWith('USDT') || upper.endsWith('-USD');
}

/**
 * Check whether a symbol represents a US / Foreign Global Stock
 */
export function isUSSymbol(symbol: string): boolean {
  if (!symbol) return false;
  const upper = symbol.trim().toUpperCase();
  if (upper.endsWith('.JK')) return false;
  const clean = upper.replace('.JK', '');
  return GLOBAL_SET.has(clean) || POPULAR_GLOBAL.has(clean);
}

/**
 * Return all supported crypto base tickers
 */
export function getAllCryptoSymbols(): string[] {
  return Array.from(CRYPTO_SET);
}

const IDX_BY_SYMBOL = new Map<string, UnifiedAsset>();
for (const a of IDX_MASTER) {
  IDX_BY_SYMBOL.set(a.symbol.toUpperCase(), a);
}

/**
 * Return all supported global / US stock tickers
 */
export function getAllGlobalSymbols(): string[] {
  return Array.from(GLOBAL_SET);
}

/**
 * Get asset definition by symbol (supports ticker like BBCA, BTC, NVDA, BTCUSDT)
 */
export function getAssetBySymbol(symbol: string): UnifiedAsset | undefined {
  if (!symbol) return undefined;
  const upper = symbol.toUpperCase().trim();
  // Jika secara eksplisit berakhiran .JK, prioritaskan emiten BEI (mencegah tabrakan seperti STRK/LINK/META)
  if (upper.endsWith('.JK')) {
    const clean = upper.replace('.JK', '');
    return IDX_BY_SYMBOL.get(clean) || ASSET_BY_SYMBOL.get(clean);
  }
  // Jika secara eksplisit berakhiran USDT atau -USD, prioritaskan koin crypto
  if (upper.endsWith('USDT') || upper.endsWith('-USD')) {
    const clean = upper.replace(/USDT$/, '').replace(/-USD$/, '');
    return ASSET_BY_SYMBOL.get(`${clean}USDT`) || ASSET_BY_SYMBOL.get(clean);
  }
  // Prioritaskan saham global jika cocok langsung (misal: META, NVDA, AAPL)
  if (GLOBAL_BY_SYMBOL.has(upper)) {
    return GLOBAL_BY_SYMBOL.get(upper);
  }
  const clean = upper.replace('.JK', '');
  return ASSET_BY_SYMBOL.get(clean) || ASSET_BY_SYMBOL.get(clean.replace(/USDT$/i, ''));
}

/**
 * Filter assets by category ('ALL' | 'IDX' | 'CRYPTO' | 'GLOBAL')
 */
export function getAssetsByCategory(category: 'ALL' | 'IDX' | 'CRYPTO' | 'GLOBAL'): UnifiedAsset[] {
  if (category === 'ALL') return MASTER_ASSETS;
  return MASTER_ASSETS.filter((a) => a.category === category);
}

/**
 * Search assets by ticker or name with fast prefix + substring search
 */
export function searchAssets(
  query: string,
  category: 'ALL' | 'IDX' | 'CRYPTO' | 'GLOBAL' = 'ALL',
  limit = 20
): UnifiedAsset[] {
  const q = query.toUpperCase().trim();
  const pool = category === 'ALL' ? MASTER_ASSETS : MASTER_ASSETS.filter((a) => a.category === category);

  if (!q) {
    // Return popular/first items
    const popular = pool.filter((a) => a.isPopular);
    return popular.length > 0 ? popular.slice(0, limit) : pool.slice(0, limit);
  }

  // Exact match first
  const exact = pool.filter((a) => a.symbol === q);
  // Starts with symbol
  const startsSym = pool.filter((a) => a.symbol !== q && a.symbol.startsWith(q));
  // Includes in name or sector
  const contains = pool.filter((a) => !a.symbol.startsWith(q) && (a.name.toUpperCase().includes(q) || a.sector.toUpperCase().includes(q)));

  return [...exact, ...startsSym, ...contains].slice(0, limit);
}

/**
 * Get all available sectors across master universe
 */
export function getAllSectors(): string[] {
  const set = new Set<string>();
  for (const a of MASTER_ASSETS) {
    if (a.sector) set.add(a.sector);
  }
  return Array.from(set).sort();
}

/**
 * Universe metrics
 */
export function getUniverseSummary() {
  return {
    totalAssets: MASTER_ASSETS.length,
    idxCount: IDX_MASTER.length,
    cryptoCount: CRYPTO_MASTER.length,
    globalCount: GLOBAL_MASTER.length,
  };
}

export const UNIVERSE_STATS = {
  totalAssets: MASTER_ASSETS.length,
  idxCount: IDX_MASTER.length,
  cryptoCount: CRYPTO_MASTER.length,
  globalCount: GLOBAL_MASTER.length,
};

/**
 * Universal Symbol Mapper for TradingView Widgets (Advanced Chart & Technical Analysis)
 * Converts any IDX, Crypto, US, or International ticker to its exact TradingView format.
 */
export function mapToTradingViewSymbol(symbol: string): string {
  if (!symbol) return 'IDX:BBCA';
  let s = symbol.trim().toUpperCase().replace('.JK', '');
  if (s === 'GOOGLE') s = 'GOOGL';
  if (s.includes(':')) return s;

  // Indices
  if (s === '^JKSE' || s === 'JKSE' || s === 'IHSG') return 'IDX:COMPOSITE';
  if (s === '^GSPC' || s === 'GSPC' || s === 'SPX') return 'SP:SPX';
  if (s === '^NDX' || s === 'NDX') return 'NASDAQ:NDX';
  if (s === '^DJI' || s === 'DJI') return 'DJ:DJI';

  // Crypto spot pairs (Binance / Bybit fallback for delisted or special pairs)
  if (isCryptoSymbol(s) || s.endsWith('USDT') || s.endsWith('-USD')) {
    const clean = s.replace(/USDT$/i, '').replace(/-USD$/i, '');
    if (clean === 'MKR') return 'BYBIT:MKRUSDT';
    if (clean === 'FTM') return 'BINANCE:SUSDT';
    if (clean === 'SONIC' || clean === 'S') return 'BINANCE:SUSDT';
    if (clean === 'MATIC') return 'BINANCE:POLUSDT';
    if (clean === 'RNDR') return 'BINANCE:RENDERUSDT';
    if (clean === 'POPCAT') return 'BYBIT:POPCATUSDT';
    if (clean === 'MEW') return 'BYBIT:MEWUSDT';
    if (clean === 'KAS') return 'BYBIT:KASUSDT';
    if (clean === 'AKT') return 'BYBIT:AKTUSDT';
    if (clean === 'SKY') return 'BINANCE:SKYUSDT';
    return `BINANCE:${clean}USDT`;
  }

  // Exact ticker overrides for international dual-class & foreign markets
  if (s === 'BRK.B' || s === 'BRK/B' || s === 'BRK-B') return 'NYSE:BRK.B';
  if (s === 'BRK.A' || s === 'BRK/A' || s === 'BRK-A') return 'NYSE:BRK.A';
  if (s === 'BF.B' || s === 'BF/B' || s === 'BF-B') return 'NYSE:BF.B';
  if (s === 'MC.PA') return 'EURONEXT:MC';
  if (s === 'NESN.SW') return 'SIX:NESN';
  if (s === '7203.T') return 'TSE:7203';
  if (s === '6758.T') return 'TSE:6758';
  if (s === '7974.T') return 'TSE:7974';
  if (s === '9984.T') return 'TSE:9984';
  if (s === '005930.KS') return 'KRX:005930';
  if (s === '000660.KS') return 'KRX:000660';
  if (s === '0700.HK') return 'HKEX:700';
  if (s === '2222.SR') return 'TADAWUL:2222';

  // Match against global stocks master catalog
  const globalMatch = MASTER_GLOBAL_STOCKS.find((g) => g.ticker.toUpperCase() === s);
  if (globalMatch) {
    const ex = (globalMatch.exchange || 'NASDAQ').toUpperCase();
    if (ex.includes('NYSE')) return `NYSE:${s}`;
    if (ex.includes('NASDAQ')) return `NASDAQ:${s}`;
    if (ex.includes('EURONEXT')) return `EURONEXT:${s}`;
    if (ex.includes('TSE')) return `TSE:${s.replace('.T', '')}`;
    if (ex.includes('HKEX')) return `HKEX:${s.replace('.HK', '').replace(/^0+/, '')}`;
    if (ex.includes('KRX')) return `KRX:${s.replace('.KS', '')}`;
    if (ex.includes('TADAWUL')) return `TADAWUL:${s.replace('.SR', '')}`;
    return `${ex}:${s}`;
  }

  // Foreign / US fallback
  if (isUSSymbol(s)) {
    return `NASDAQ:${s}`;
  }

  // Indonesian IDX Stocks
  return `IDX:${s}`;
}
