import { create } from 'zustand';
import type { BinanceTickerData } from '@/hooks/useBinanceLivePrices';
import { MASTER_GLOBAL_CRYPTO } from '@/data/global_markets_universe';

const INITIAL_CRYPTO_SEEDS: Record<string, { price: number; change24h: number; high: number; low: number; vol: string; qVol: number }> = {};
for (const c of MASTER_GLOBAL_CRYPTO) {
  const base = c.symbol.replace(/USDT$/, '');
  INITIAL_CRYPTO_SEEDS[base] = {
    price: c.price,
    change24h: c.change24h,
    high: c.high24h,
    low: c.low24h,
    vol: c.volume24h,
    qVol: 500000000,
  };
}

function buildInitialSeeds(): Record<string, BinanceTickerData> {
  const initial: Record<string, BinanceTickerData> = {};
  const now = Date.now();
  for (const [base, data] of Object.entries(INITIAL_CRYPTO_SEEDS)) {
    const pairSym = `${base}USDT`;
    const item: BinanceTickerData = {
      symbol: pairSym,
      price: data.price,
      change24h: data.change24h,
      high24h: data.high,
      low24h: data.low,
      volume24h: data.vol,
      quoteVolume24h: data.qVol,
      direction: 'same',
      lastUpdated: now,
    };
    initial[pairSym] = item;
    initial[base] = { ...item, symbol: base };
  }
  return initial;
}

interface CryptoPriceState {
  tickerMap: Record<string, BinanceTickerData>;
  isConnected: boolean;
  lastHeartbeat: string;
  error: string | null;
  setTickerMap: (map: Record<string, BinanceTickerData> | ((prev: Record<string, BinanceTickerData>) => Record<string, BinanceTickerData>)) => void;
  setIsConnected: (connected: boolean) => void;
  setLastHeartbeat: (hb: string) => void;
  setError: (err: string | null) => void;
}

export const useCryptoPriceStore = create<CryptoPriceState>((set) => ({
  tickerMap: buildInitialSeeds(),
  isConnected: false,
  lastHeartbeat: new Date().toLocaleTimeString(),
  error: null,
  setTickerMap: (updater) =>
    set((state) => ({
      tickerMap: typeof updater === 'function' ? updater(state.tickerMap) : updater,
    })),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setLastHeartbeat: (hb) => set({ lastHeartbeat: hb }),
  setError: (err) => set({ error: err }),
}));
