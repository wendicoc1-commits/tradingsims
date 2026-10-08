/**
 * Fincept Capital — AI Agent Store
 * 
 * Mengelola state koordinasi AI Agent yang berdampak langsung ke website:
 * 1. Autonomous Auto-Trading (eksekusi langsung ke usePortfolioStore)
 * 2. Pembaruan Berita (Newsroom live dispatches & market wire)
 * 3. Analisis Harga Kuantitatif (SMC key levels, target harga, dan sinkronisasi watchlist)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIAgentLog {
  id: string;
  timestamp: string;
  type: 'TRADE_BUY' | 'TRADE_SELL' | 'TRADE_ROTATE' | 'NEWS_DISPATCH' | 'PRICE_ANALYSIS' | 'RISK_GATE';
  symbol: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  title: string;
  details: string;
  metadata?: {
    price?: number;
    lots?: number;
    amount?: number;
    realizedPL?: number;
    score?: number;
    stopLoss?: number;
    takeProfit?: number;
    source?: string;
  };
}

export interface AIDispatch {
  id: string;
  timestamp: string;
  agentName: string;
  agentEmoji: string;
  headline: string;
  summary: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  affectedTickers: string[];
  sourceUrl?: string;
}

export interface AIPriceAnalysis {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  score: number;
  conviction: string;
  orderBlockDemand: { min: number; max: number };
  orderBlockSupply: { min: number; max: number };
  targetPrice12M: number;
  stopLossPrice: number;
  riskRewardRatio: number;
  trend: string;
  updatedAt: string;
}

export interface AIAgentState {
  autoTradingEnabled: boolean;
  discretionarySellingEnabled: boolean; // Mandat penuh: AI diizinkan jual saham & crypto kapan pun
  maxAllocationPerTradePct: number; // default 10% NAV
  
  // Parameter TP & SL Manual yang dapat dikonfigurasi Pengguna
  takeProfitPct: number;         // default 10% (Saham IDX)
  stopLossPct: number;           // default 5% (Saham IDX)
  cryptoTakeProfitPct: number;   // default 15% (Crypto Spot)
  cryptoStopLossPct: number;     // default 6% (Crypto Spot)
  trailingStopPct: number;       // default 5% (Trailing Lock)

  activeAgentTask: string | null;
  activeDeliberatingTicker: string | null; // Simpan emiten yang sedang dirapatkan di War Room agar seluruh bot tersinkronisasi
  logs: AIAgentLog[];
  dispatches: AIDispatch[];
  priceAnalyses: Record<string, AIPriceAnalysis>;
  totalAiTradesCount: number;
  totalAiRealizedProfit: number;
  lastTradeAt: string | null;
  lastScanAt: string | null;
  
  // Actions
  setAutoTradingEnabled: (enabled: boolean) => void;
  setDiscretionarySellingEnabled: (enabled: boolean) => void;
  setMaxAllocationPerTradePct: (pct: number) => void;
  setRiskTargets: (targets: {
    takeProfitPct?: number;
    stopLossPct?: number;
    cryptoTakeProfitPct?: number;
    cryptoStopLossPct?: number;
    trailingStopPct?: number;
  }) => void;
  setActiveAgentTask: (task: string | null) => void;
  setActiveDeliberatingTicker: (ticker: string | null) => void;
  logAction: (log: Omit<AIAgentLog, 'id' | 'timestamp'>) => void;
  publishDispatch: (dispatch: Omit<AIDispatch, 'id' | 'timestamp'>) => void;
  setPriceAnalysis: (symbol: string, analysis: AIPriceAnalysis) => void;
  recordTradeStat: (isBuy: boolean, profitChange?: number) => void;
  clearLogs: () => void;
  resetAiStats: () => void;
}

export const useAIAgentStore = create<AIAgentState>()(
  persist(
    (set) => ({
      autoTradingEnabled: true, // Default ON sesuai permintaan pengguna
      discretionarySellingEnabled: true, // Default ON: Mandat jual otonom di tangan AI
      maxAllocationPerTradePct: 10,
      
      // Default Target Risiko Manual Pengguna
      takeProfitPct: 10,
      stopLossPct: 5,
      cryptoTakeProfitPct: 15,
      cryptoStopLossPct: 6,
      trailingStopPct: 5,

      activeAgentTask: 'AI Agent aktif mengawasi 1,000+ saham bursa & crypto...',
      activeDeliberatingTicker: null,
      logs: [
        {
          id: 'log-init-1',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString('id-ID'),
          type: 'PRICE_ANALYSIS',
          symbol: 'BMRI',
          agentId: 'head_quant',
          agentName: 'Dr. William Chen (Head Quant)',
          agentEmoji: '🧮',
          title: 'Deteksi Zona Demand Smart Money',
          details: 'Order Block Demand teridentifikasi di level Rp 5.200 - Rp 5.250 dengan rasio R:R 1:3.4.',
          metadata: { price: 5225, score: 92 },
        },
        {
          id: 'log-init-2',
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toLocaleTimeString('id-ID'),
          type: 'NEWS_DISPATCH',
          symbol: 'BBCA',
          agentId: 'news_editor',
          agentName: 'Marsha Utami (Editor-in-Chief)',
          agentEmoji: '🗞️',
          title: 'Pembaruan Berita Sektor Perbankan',
          details: 'Likuiditas perbankan tetap tebal, kredit tumbuh double digit mendukung margin bunga bersih.',
          metadata: { score: 88, source: 'Google News Crawler' },
        },
      ],
      dispatches: [
        {
          id: 'disp-init-1',
          timestamp: new Date().toLocaleTimeString('id-ID'),
          agentName: 'Marsha Utami (Newsroom Lead)',
          agentEmoji: '📡',
          headline: 'Konsolidasi IHSG: Aliran Dana Asing Akumulasi Big Banks',
          summary: 'Arus dana institusi terkonsentrasi pada emiten berfundamental kokoh dengan ROE > 18%.',
          sentiment: 'BULLISH',
          affectedTickers: ['BBCA', 'BMRI', 'BBRI'],
        },
      ],
      priceAnalyses: {},
      totalAiTradesCount: 2,
      totalAiRealizedProfit: 0,
      lastTradeAt: null,
      lastScanAt: null,

      setAutoTradingEnabled: (enabled) => set({ autoTradingEnabled: enabled }),
      setDiscretionarySellingEnabled: (enabled) => set({ discretionarySellingEnabled: enabled }),
      setMaxAllocationPerTradePct: (pct) => set({ maxAllocationPerTradePct: pct }),
      setRiskTargets: (targets) =>
        set((state) => ({
          takeProfitPct: targets.takeProfitPct ?? state.takeProfitPct,
          stopLossPct: targets.stopLossPct ?? state.stopLossPct,
          cryptoTakeProfitPct: targets.cryptoTakeProfitPct ?? state.cryptoTakeProfitPct,
          cryptoStopLossPct: targets.cryptoStopLossPct ?? state.cryptoStopLossPct,
          trailingStopPct: targets.trailingStopPct ?? state.trailingStopPct,
        })),
      setActiveAgentTask: (task) => set({ activeAgentTask: task }),
      setActiveDeliberatingTicker: (ticker) => set({ activeDeliberatingTicker: ticker }),

      logAction: (log) =>
        set((state) => {
          const newEntry: AIAgentLog = {
            ...log,
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: new Date().toLocaleTimeString('id-ID'),
          };
          return {
            logs: [newEntry, ...state.logs.slice(0, 49)], // simpan max 50 riwayat
          };
        }),

      publishDispatch: (disp) =>
        set((state) => {
          const newDisp: AIDispatch = {
            ...disp,
            id: `disp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: new Date().toLocaleTimeString('id-ID'),
          };
          return {
            dispatches: [newDisp, ...state.dispatches.slice(0, 19)],
          };
        }),

      setPriceAnalysis: (symbol, analysis) =>
        set((state) => ({
          priceAnalyses: {
            ...state.priceAnalyses,
            [symbol]: analysis,
          },
        })),

      recordTradeStat: (isBuy, profitChange = 0) =>
        set((state) => {
          const newCount = state.totalAiTradesCount + 1;
          const currentProfit = state.totalAiRealizedProfit;
          // Sanitasi nilai jika sebelumnya sempat terjadi overflow perkalian fee
          const sanitizedBase = (Math.abs(currentProfit) > 500_000_000 || isNaN(currentProfit)) ? 0 : currentProfit;
          const safeDelta = isBuy ? 0 : (isNaN(profitChange) ? 0 : profitChange);
          return {
            totalAiTradesCount: newCount,
            totalAiRealizedProfit: sanitizedBase + safeDelta,
            lastTradeAt: new Date().toLocaleTimeString('id-ID'),
          };
        }),

      clearLogs: () => set({ logs: [] }),
      resetAiStats: () => set({ totalAiTradesCount: 0, totalAiRealizedProfit: 0, logs: [] }),
    }),
    {
      name: 'fincept-ai-agent-storage',
    }
  )
);
