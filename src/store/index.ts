import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Watchlist, WatchlistItem, Order, PortfolioHolding, DividendRecord, ConditionalOrder } from '../types'
import ALL_DIVIDEND_DATA from '@/data/idx_dividend_all.json'
import { DIVIDEND_PAYING_STOCKS } from '@/data/dividend_stocks'
import { checkIDXMarketStatus } from '@/lib/market/marketHours'

// ==========================================
// Market Store
// ==========================================
export interface MarketState {
  selectedSymbol: string
  activeTab: string
  theme: 'dark' | 'light'
  isRightDockOpen: boolean
  activeDockTab: 'watchlist' | 'order'
  setSelectedSymbol: (symbol: string) => void
  setActiveTab: (tab: string) => void
  setRightDockOpen: (open: boolean) => void
  setActiveDockTab: (tab: 'watchlist' | 'order') => void
  toggleRightDock: () => void
  toggleTheme: () => void
}

export const useMarketStore = create<MarketState>((set) => ({
  selectedSymbol: 'BBCA.JK',
  activeTab: 'overview',
  theme: 'dark',
  isRightDockOpen: false,
  activeDockTab: 'watchlist',
  setSelectedSymbol: (symbol: string) => set({ selectedSymbol: symbol }),
  setActiveTab: (tab: string) => set({ activeTab: tab }),
  setRightDockOpen: (open: boolean) => set({ isRightDockOpen: open }),
  setActiveDockTab: (tab: 'watchlist' | 'order') => set({ activeDockTab: tab, isRightDockOpen: true }),
  toggleRightDock: () => set((state) => ({ isRightDockOpen: !state.isRightDockOpen })),
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark'
      if (typeof document !== 'undefined') {
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      return { theme: nextTheme }
    }),
}))

// ==========================================
// Watchlist Store
// ==========================================
export interface WatchlistState {
  watchlists: Watchlist[]
  addWatchlist: (name: string) => void
  removeWatchlist: (id: string) => void
  addToWatchlist: (
    watchlistId: string,
    item: { symbol: string; displaySymbol: string; name: string }
  ) => void
  removeFromWatchlist: (watchlistId: string, itemIdOrSymbol: string) => void
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      watchlists: [
        {
          id: 'default-watchlist',
          name: 'Favorit Saya',
          createdAt: new Date().toISOString(),
          items: [
            {
              id: 'item-bbca',
              symbol: 'BBCA.JK',
              displaySymbol: 'BBCA',
              name: 'Bank Central Asia Tbk',
              addedAt: new Date().toISOString(),
            },
            {
              id: 'item-bbri',
              symbol: 'BBRI.JK',
              displaySymbol: 'BBRI',
              name: 'Bank Rakyat Indonesia Tbk',
              addedAt: new Date().toISOString(),
            },
            {
              id: 'item-tlkm',
              symbol: 'TLKM.JK',
              displaySymbol: 'TLKM',
              name: 'Telkom Indonesia Tbk',
              addedAt: new Date().toISOString(),
            },
          ],
        },
      ],

      addWatchlist: (name: string) =>
        set((state) => ({
          watchlists: [
            ...state.watchlists,
            {
              id: `watchlist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              name,
              items: [],
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeWatchlist: (id: string) =>
        set((state) => ({
          watchlists: state.watchlists.filter((w) => w.id !== id),
        })),

      addToWatchlist: (watchlistId, item) =>
        set((state) => ({
          watchlists: state.watchlists.map((w) => {
            if (w.id !== watchlistId) return w
            const alreadyExists = w.items.some((i) => i.symbol === item.symbol)
            if (alreadyExists) return w

            const newItem: WatchlistItem = {
              id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              symbol: item.symbol,
              displaySymbol: item.displaySymbol,
              name: item.name,
              addedAt: new Date().toISOString(),
            }

            return {
              ...w,
              items: [...w.items, newItem],
            }
          }),
        })),

      removeFromWatchlist: (watchlistId, itemIdOrSymbol) =>
        set((state) => ({
          watchlists: state.watchlists.map((w) => {
            if (w.id !== watchlistId) return w
            return {
              ...w,
              items: w.items.filter(
                (i) => i.id !== itemIdOrSymbol && i.symbol !== itemIdOrSymbol
              ),
            }
          }),
        })),
    }),
    {
      name: 'stockbit_watchlist_storage',
      partialize: (state) => ({
        watchlists: state.watchlists,
      }),
    }
  )
)

// ==========================================
// Portfolio & SBN Store
// ==========================================
export interface OrderParams {
  symbol: string
  displaySymbol?: string
  price: number
  lots: number
  name?: string
  orderType?: 'LIMIT' | 'MARKET'
  takeProfitPrice?: number
  stopLossPrice?: number
  validityType?: 'DAY' | 'GTC'
  assetClass?: 'EQUITY' | 'CRYPTO'
  currency?: 'IDR' | 'USDT' | 'USD'
  cryptoUnits?: number
  exchangeRate?: number
}

export interface PortfolioState {
  cash: number
  realizedPL: number // Akumulasi total keuntungan/kerugian modal terealisasi
  holdings: PortfolioHolding[]
  orders: Order[]
  conditionalOrders: ConditionalOrder[]
  dividends: DividendRecord[]
  placeBuyOrder: (params: OrderParams) => { order: Order | null; error?: string }
  placeSellOrder: (params: OrderParams) => { order: Order | null; error?: string }
  placeConditionalOrder: (params: Omit<ConditionalOrder, 'id' | 'createdAt' | 'status'>) => { order: ConditionalOrder | null; error?: string }
  cancelConditionalOrder: (id: string) => void
  setHoldingRiskTargets: (symbol: string, params: { takeProfitPrice?: number; stopLossPrice?: number; validityType?: 'DAY' | 'GTC' }) => void
  checkPriceTriggers: (symbol: string, currentPrice: number) => { triggered: boolean; type?: 'TAKE_PROFIT' | 'STOP_LOSS' | 'TRAILING_STOP' | 'BREAKOUT_BUY'; order?: Order; message?: string }
  updateHoldingPrices: (priceMap: Record<string, number>) => void
  claimDividend: (symbol: string, dps: number) => { success: boolean; amount: number; message: string }
  claimDividendWithDRIP: (symbol: string, dps: number) => { success: boolean; newLots: number; leftoverCash: number; totalDividend: number; message: string }
  distributeAllEligibleDividends: () => { total: number; count: number; symbols: string[] }
  distributeAllEligibleDividendsWithDRIP: () => { totalLotsAdded: number; leftoverCashAdded: number; totalDividendValue: number; count: number; symbols: string[] }
  resetCashOnly: (amount?: number) => void
  resetPortfolio: () => void
  resetToDefaultDemo: () => void
}

const SHARES_PER_LOT = 100
const BUY_FEE_RATE = 0.0015 // 0.15% fee
const SELL_FEE_RATE = 0.0025 // 0.25% fee

export const INITIAL_CASH = 100000000 // Rp 100 Juta

export const INITIAL_HOLDINGS: PortfolioHolding[] = [
  {
    symbol: 'BBCA.JK',
    displaySymbol: 'BBCA',
    name: 'Bank Central Asia Tbk',
    avgPrice: 5850, // Inklusif fee beli
    lots: 20, // 20 lot = 2.000 lembar
    shares: 2000,
    currentPrice: 6025,
    unrealizedPL: (6025 - 5850) * 2000,
    unrealizedPLPercent: Number((((6025 - 5850) / 5850) * 100).toFixed(2)),
    takeProfitPrice: 6350, // Target Take Profit (+5.4%)
    stopLossPrice: 5700, // Batas Stop Loss (-2.5%)
    validityType: 'GTC',
    totalDividendEarned: 540000, // 270 x 2000
    realizedPL: 0,
  },
  {
    symbol: 'BBRI.JK',
    displaySymbol: 'BBRI',
    name: 'Bank Rakyat Indonesia Tbk',
    avgPrice: 2980, // Inklusif fee beli
    lots: 50, // 50 lot = 5.000 lembar
    shares: 5000,
    currentPrice: 3060,
    unrealizedPL: (3060 - 2980) * 5000,
    unrealizedPLPercent: Number((((3060 - 2980) / 2980) * 100).toFixed(2)),
    takeProfitPrice: 3250, // Target Take Profit
    stopLossPrice: 2900, // Batas Stop Loss
    validityType: 'GTC',
    totalDividendEarned: 1595000, // 319 x 5000
    realizedPL: 0,
  },
]

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'init-order-1',
    symbol: 'BBCA.JK',
    displaySymbol: 'BBCA',
    type: 'BUY',
    orderType: 'LIMIT',
    price: 5850,
    lots: 20,
    shares: 2000,
    total: 5850 * 2000,
    fee: Math.round(5850 * 2000 * BUY_FEE_RATE),
    brokerFee: Math.round(5850 * 2000 * BUY_FEE_RATE),
    status: 'FILLED',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    filledAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'init-order-2',
    symbol: 'BBRI.JK',
    displaySymbol: 'BBRI',
    type: 'BUY',
    orderType: 'LIMIT',
    price: 2980,
    lots: 50,
    shares: 5000,
    total: 2980 * 5000,
    fee: Math.round(2980 * 5000 * BUY_FEE_RATE),
    brokerFee: Math.round(2980 * 5000 * BUY_FEE_RATE),
    status: 'FILLED',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    filledAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
]

export const INITIAL_DIVIDENDS: DividendRecord[] = [
  {
    id: 'div-bbca-1',
    symbol: 'BBCA.JK',
    displaySymbol: 'BBCA',
    name: 'Bank Central Asia Tbk',
    dividendPerShare: 270,
    shares: 2000,
    grossAmount: 540000,
    taxAmount: 0,
    netAmount: 540000,
    cumDate: '2024-03-22',
    paymentDate: '2024-04-04',
    status: 'PAID',
  },
]

export interface DividendItemInfo {
  dps: number
  yield: number
  cumDate: string
  payDate: string
  hasDividend: boolean
  frequency?: string
  category?: string
  notes?: string
}

function buildKnownDividends(): Record<string, DividendItemInfo> {
  const map: Record<string, DividendItemInfo> = {}

  // 1. Inisialisasi seluruh 252 emiten pembagi dividen dari database komprehensif IDX
  ;(ALL_DIVIDEND_DATA as any[]).forEach((item) => {
    if (item.hasDividend && item.dps > 0) {
      const sym = item.code.toUpperCase()
      map[sym] = {
        dps: Number(item.dps),
        yield: Number(item.yield) || 3.5,
        cumDate: '2024-05-15',
        payDate: '2024-06-05',
        hasDividend: true,
        frequency: item.frequency || '1x Setahun',
        category: item.category || 'Dividen Papan Utama',
        notes: item.notes || 'Rutin membagikan dividen kas tahunan kepada para pemegang saham.',
      }
    }
  })

  // 2. Perkaya dengan histori dividend yield & tanggal akurat dari DIVIDEND_PAYING_STOCKS
  DIVIDEND_PAYING_STOCKS.forEach((d) => {
    const sym = d.code.toUpperCase()
    map[sym] = {
      ...(map[sym] || {}),
      dps: d.dps,
      yield: d.dividendYield,
      cumDate: d.cumDate,
      payDate: d.payDate,
      hasDividend: true,
      frequency: d.frequency,
      category: d.category,
      notes: d.notes,
    }
  })

  return map
}

// Katalog lengkap seluruh emiten pembagi dividen di Bursa Efek Indonesia (252 saham)
export const KNOWN_DIVIDENDS: Record<string, DividendItemInfo> = buildKnownDividends()

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      cash: INITIAL_CASH,
  realizedPL: 0,
  holdings: JSON.parse(JSON.stringify(INITIAL_HOLDINGS)),
  orders: JSON.parse(JSON.stringify(INITIAL_ORDERS)),
  conditionalOrders: [],
  dividends: JSON.parse(JSON.stringify(INITIAL_DIVIDENDS)),

  resetCashOnly: (amount = INITIAL_CASH) => {
    set({ cash: amount })
  },

  resetPortfolio: () => {
    set({
      cash: INITIAL_CASH,
      realizedPL: 0,
      holdings: [],
      orders: [],
      conditionalOrders: [],
      dividends: [],
    })
  },

  resetToDefaultDemo: () => {
    set({
      cash: INITIAL_CASH,
      realizedPL: 0,
      holdings: JSON.parse(JSON.stringify(INITIAL_HOLDINGS)),
      orders: JSON.parse(JSON.stringify(INITIAL_ORDERS)),
      conditionalOrders: [],
      dividends: JSON.parse(JSON.stringify(INITIAL_DIVIDENDS)),
    })
  },

  placeBuyOrder: (params: OrderParams): { order: Order | null; error?: string } => {
    const { cash, holdings, orders } = get()
    const { symbol, displaySymbol, price, lots, name = displaySymbol, orderType = 'LIMIT' } = params

    if (lots <= 0 || price <= 0) {
      return { order: null, error: 'Jumlah koin/lot dan harga harus bernilai positif.' }
    }

    // Deteksi apakah instrumen merupakan cryptocurrency
    const isCrypto =
      params.assetClass === 'CRYPTO' ||
      symbol.toUpperCase().endsWith('USDT') ||
      !!displaySymbol?.toUpperCase().endsWith('USDT') ||
      ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT', 'TRX'].includes(
        (displaySymbol || symbol).replace(/USDT$/i, '').toUpperCase()
      )

    // Normalisasi simbol konsisten
    const cleanSym = (displaySymbol || symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase()
    const resolvedSym = isCrypto
      ? `${cleanSym}USDT`
      : (symbol.includes('.') || symbol.startsWith('^') ? symbol : `${cleanSym}.JK`)
    const isIDX = !isCrypto && (resolvedSym.endsWith('.JK') || cleanSym.length === 4)

    // Validasi fraksi harga & jam perdagangan resmi BEI HANYA jika saham Indonesia
    if (isIDX) {
      const marketCheck = checkIDXMarketStatus()
      if (!marketCheck.isOpen) {
        return {
          order: null,
          error: `Transaksi Ditolak di Luar Jam Bursa: ${marketCheck.message} ${marketCheck.nextOpenNotice} Pembelian saham Indonesia hanya diizinkan pada jam bursa aktif.`,
        }
      }

      const remainder = price % (price > 5000 ? 25 : price > 2000 ? 10 : price > 500 ? 5 : price > 200 ? 2 : 1)
      if (remainder !== 0) {
        return { order: null, error: `Harga Rp ${price} tidak sesuai dengan fraksi harga resmi BEI.` }
      }
    }

    const rate = params.exchangeRate || 16000 // Kurs acuan USDT ke IDR
    const currency = isCrypto ? (params.currency || 'USDT') : 'IDR'

    let totalCost: number
    let tradeValue: number
    let brokerFee: number
    let totalShares: number
    let sharesMultiplier: number

    if (isCrypto) {
      sharesMultiplier = 1
      totalShares = lots // Dalam satuan unit koin (bisa desimal)
      const tradeValueUSD = price * lots
      tradeValue = Math.round(tradeValueUSD * rate)
      brokerFee = Math.round(tradeValue * 0.001) // Spot fee crypto 0.1%
      totalCost = tradeValue + brokerFee
    } else {
      sharesMultiplier = isIDX ? SHARES_PER_LOT : 1
      totalShares = lots * sharesMultiplier
      tradeValue = price * totalShares
      brokerFee = Math.round(tradeValue * BUY_FEE_RATE)
      totalCost = tradeValue + brokerFee
    }

    if (cash < totalCost) {
      return {
        order: null,
        error: `Saldo kas tidak mencukupi. Butuh Rp ${totalCost.toLocaleString('id-ID')}, tersedia Rp ${cash.toLocaleString('id-ID')}.`,
      }
    }

    const orderId = `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const now = new Date().toISOString()

    const newOrder: Order = {
      id: orderId,
      symbol: resolvedSym,
      displaySymbol: cleanSym,
      type: 'BUY',
      orderType,
      price,
      lots,
      shares: totalShares,
      total: tradeValue,
      fee: brokerFee,
      brokerFee,
      taxFee: 0,
      takeProfitPrice: params.takeProfitPrice,
      stopLossPrice: params.stopLossPrice,
      validityType: params.validityType || 'GTC',
      assetClass: isCrypto ? 'CRYPTO' : 'EQUITY',
      currency,
      cryptoUnits: isCrypto ? lots : undefined,
      exchangeRate: isCrypto ? rate : undefined,
      status: 'FILLED',
      createdAt: now,
      filledAt: now,
    }

    // Cari posisi kepemilikan aset dengan pencocokan fleksibel
    const existingHoldingIndex = holdings.findIndex(
      (h) =>
        h.displaySymbol.toUpperCase() === cleanSym ||
        h.symbol.toUpperCase() === resolvedSym ||
        (isCrypto && h.symbol.replace(/USDT$/i, '').toUpperCase() === cleanSym)
    )

    let updatedHoldings: PortfolioHolding[]

    if (existingHoldingIndex >= 0) {
      const existing = holdings[existingHoldingIndex]
      const existingShares = existing.shares || existing.lots * sharesMultiplier
      const newTotalShares = existingShares + totalShares
      const newTotalLots = isIDX ? Math.round(newTotalShares / SHARES_PER_LOT) : newTotalShares

      const existingTotalCost = isCrypto
        ? existing.avgPrice * existingShares * (existing.exchangeRate || rate)
        : existing.avgPrice * existingShares
      const newPurchaseCost = tradeValue + brokerFee

      const newAvgPrice = isCrypto
        ? Number(((existing.avgPrice * existingShares + price * totalShares) / newTotalShares).toFixed(4))
        : Math.round((existingTotalCost + newPurchaseCost) / newTotalShares)

      const unrealizedPL = isCrypto
        ? Math.round((price - newAvgPrice) * newTotalShares * rate)
        : (price - newAvgPrice) * newTotalShares
      const unrealizedPLPercent = newAvgPrice > 0
        ? Number((((price - newAvgPrice) / newAvgPrice) * 100).toFixed(2))
        : 0

      updatedHoldings = [...holdings]
      updatedHoldings[existingHoldingIndex] = {
        ...existing,
        avgPrice: newAvgPrice,
        lots: newTotalLots,
        shares: newTotalShares,
        currentPrice: price,
        unrealizedPL,
        unrealizedPLPercent,
        takeProfitPrice: params.takeProfitPrice || existing.takeProfitPrice,
        stopLossPrice: params.stopLossPrice || existing.stopLossPrice,
        validityType: params.validityType || existing.validityType || 'GTC',
        assetClass: isCrypto ? 'CRYPTO' : existing.assetClass || 'EQUITY',
        currency: isCrypto ? 'USDT' : existing.currency || 'IDR',
        cryptoUnits: isCrypto ? newTotalShares : undefined,
        exchangeRate: isCrypto ? rate : undefined,
      }
    } else {
      const initialAvgPrice = isCrypto ? price : Math.round((tradeValue + brokerFee) / totalShares)
      const unrealizedPL = isCrypto
        ? Math.round((price - initialAvgPrice) * totalShares * rate)
        : (price - initialAvgPrice) * totalShares
      const unrealizedPLPercent = Number((((price - initialAvgPrice) / initialAvgPrice) * 100).toFixed(2))

      const newHolding: PortfolioHolding = {
        symbol: resolvedSym,
        displaySymbol: cleanSym,
        name: name || (isCrypto ? `${cleanSym}/USDT` : cleanSym),
        avgPrice: initialAvgPrice,
        lots,
        shares: totalShares,
        currentPrice: price,
        unrealizedPL,
        unrealizedPLPercent,
        takeProfitPrice: params.takeProfitPrice,
        stopLossPrice: params.stopLossPrice,
        peakPrice: price,
        trailingStopPct: isCrypto ? 6 : 4, // 6% untuk volatilitas kripto, 4% untuk saham
        trailingStopPrice: isCrypto
          ? Number((price * 0.94).toFixed(4))
          : Math.round(price * 0.96),
        validityType: params.validityType || 'GTC',
        assetClass: isCrypto ? 'CRYPTO' : 'EQUITY',
        currency: isCrypto ? 'USDT' : 'IDR',
        cryptoUnits: isCrypto ? lots : undefined,
        exchangeRate: isCrypto ? rate : undefined,
        totalDividendEarned: 0,
        realizedPL: 0,
      }
      updatedHoldings = [...holdings, newHolding]
    }

    set({
      cash: cash - totalCost,
      holdings: updatedHoldings,
      orders: [newOrder, ...orders],
    })

    if (typeof window !== 'undefined') {
      import('@/lib/bloombergAudio').then(({ bloombergAudio }) => bloombergAudio.playOrderFilledChime()).catch(() => {});
    }

    return { order: newOrder }
  },

  setHoldingRiskTargets: (symbol: string, params: { takeProfitPrice?: number; stopLossPrice?: number; validityType?: 'DAY' | 'GTC' }) => {
    const { holdings } = get()
    const clean = symbol.replace('.JK', '').toUpperCase()
    const updated = holdings.map((h) => {
      if (h.displaySymbol.toUpperCase() === clean || h.symbol.toUpperCase() === symbol.toUpperCase()) {
        return {
          ...h,
          takeProfitPrice: params.takeProfitPrice,
          stopLossPrice: params.stopLossPrice,
          validityType: params.validityType || h.validityType || 'GTC',
        }
      }
      return h
    })
    set({ holdings: updated })
  },

  placeConditionalOrder: (params: Omit<ConditionalOrder, 'id' | 'createdAt' | 'status'>) => {
    const { conditionalOrders } = get()
    const id = `cond-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const newOrder: ConditionalOrder = {
      ...params,
      id,
      peakPrice: params.peakPrice || params.triggerPrice,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    }
    set({ conditionalOrders: [newOrder, ...conditionalOrders] })
    return { order: newOrder }
  },

  cancelConditionalOrder: (id: string) => {
    const { conditionalOrders } = get()
    set({
      conditionalOrders: conditionalOrders.map((co) =>
        co.id === id ? { ...co, status: 'CANCELLED' } : co
      ),
    })
  },

  checkPriceTriggers: (symbol: string, currentPrice: number) => {
    const { holdings, conditionalOrders, placeSellOrder, placeBuyOrder } = get()
    const clean = symbol.replace('.JK', '').toUpperCase()
    const targetHolding = holdings.find((h) => h.displaySymbol.toUpperCase() === clean || h.symbol.toUpperCase() === symbol.toUpperCase())

    // 1. Cek Target TP/SL Direct Holding
    if (targetHolding && targetHolding.lots > 0) {
      if (targetHolding.takeProfitPrice && currentPrice >= targetHolding.takeProfitPrice) {
        const res = placeSellOrder({
          symbol: targetHolding.symbol,
          displaySymbol: targetHolding.displaySymbol,
          name: targetHolding.name,
          price: currentPrice,
          lots: targetHolding.lots,
          orderType: 'MARKET',
        })
        if (res.order) {
          return {
            triggered: true,
            type: 'TAKE_PROFIT',
            order: res.order,
            message: `🎯 Target Take Profit Terpicu! Seluruh ${targetHolding.lots} lot ${clean} otomatis terjual di harga Rp ${currentPrice.toLocaleString('id-ID')}.`,
          }
        }
      }

      if (targetHolding.stopLossPrice && currentPrice <= targetHolding.stopLossPrice) {
        const res = placeSellOrder({
          symbol: targetHolding.symbol,
          displaySymbol: targetHolding.displaySymbol,
          name: targetHolding.name,
          price: currentPrice,
          lots: targetHolding.lots,
          orderType: 'MARKET',
        })
        if (res.order) {
          return {
            triggered: true,
            type: 'STOP_LOSS',
            order: res.order,
            message: `🛡️ Batas Stop Loss Terpicu! Seluruh ${targetHolding.lots} lot ${clean} otomatis dipotong (Cut Loss) di harga Rp ${currentPrice.toLocaleString('id-ID')}.`,
          }
        }
      }
    }

    // 2. Cek Active Conditional Orders
    const activeOrders = conditionalOrders.filter(
      (co) => co.status === 'ACTIVE' && (co.displaySymbol.toUpperCase() === clean || co.symbol.toUpperCase() === symbol.toUpperCase())
    )

    for (const co of activeOrders) {
      // TRAILING STOP
      if (co.conditionType === 'TRAILING_STOP') {
        const peak = Math.max(co.peakPrice || currentPrice, currentPrice)
        const trailPercent = co.trailingPercent || 3
        const triggerThreshold = peak * (1 - trailPercent / 100)

        // Update peak price jika harga naik lebih tinggi
        if (currentPrice > (co.peakPrice || 0)) {
          set({
            conditionalOrders: conditionalOrders.map((o) =>
              o.id === co.id ? { ...o, peakPrice: currentPrice } : o
            ),
          })
        }

        if (currentPrice <= triggerThreshold) {
          const res = placeSellOrder({
            symbol: co.symbol,
            displaySymbol: co.displaySymbol,
            price: currentPrice,
            lots: co.lots,
            orderType: 'MARKET',
          })
          set({
            conditionalOrders: conditionalOrders.map((o) =>
              o.id === co.id ? { ...o, status: 'TRIGGERED', triggeredAt: new Date().toISOString() } : o
            ),
          })
          return {
            triggered: true,
            type: 'TRAILING_STOP',
            order: res.order || undefined,
            message: `📉 Trailing Stop Terpicu! Harga turun ${trailPercent}% dari puncak (Rp ${peak.toLocaleString('id-ID')}) ke Rp ${currentPrice.toLocaleString('id-ID')}. ${co.lots} lot ${clean} terjual.`,
          }
        }
      }

      // BREAKOUT BUY
      if (co.conditionType === 'BREAKOUT_BUY') {
        if (currentPrice >= co.triggerPrice) {
          const res = placeBuyOrder({
            symbol: co.symbol,
            displaySymbol: co.displaySymbol,
            price: currentPrice,
            lots: co.lots,
            orderType: 'MARKET',
          })
          set({
            conditionalOrders: conditionalOrders.map((o) =>
              o.id === co.id ? { ...o, status: 'TRIGGERED', triggeredAt: new Date().toISOString() } : o
            ),
          })
          return {
            triggered: true,
            type: 'BREAKOUT_BUY',
            order: res.order || undefined,
            message: `🚀 Breakout Buy Terpicu! Harga menembus batas resisten Rp ${co.triggerPrice.toLocaleString('id-ID')}. ${co.lots} lot ${clean} berhasil dibeli.`,
          }
        }
      }

      // STOP LOSS CONDITIONAL
      if (co.conditionType === 'STOP_LOSS') {
        if (currentPrice <= co.triggerPrice) {
          const res = placeSellOrder({
            symbol: co.symbol,
            displaySymbol: co.displaySymbol,
            price: currentPrice,
            lots: co.lots,
            orderType: 'MARKET',
          })
          set({
            conditionalOrders: conditionalOrders.map((o) =>
              o.id === co.id ? { ...o, status: 'TRIGGERED', triggeredAt: new Date().toISOString() } : o
            ),
          })
          return {
            triggered: true,
            type: 'STOP_LOSS',
            order: res.order || undefined,
            message: `🛡️ Conditional Stop Loss Terpicu pada Rp ${currentPrice.toLocaleString('id-ID')}!`,
          }
        }
      }

      // TAKE PROFIT CONDITIONAL
      if (co.conditionType === 'TAKE_PROFIT') {
        if (currentPrice >= co.triggerPrice) {
          const res = placeSellOrder({
            symbol: co.symbol,
            displaySymbol: co.displaySymbol,
            price: currentPrice,
            lots: co.lots,
            orderType: 'MARKET',
          })
          set({
            conditionalOrders: conditionalOrders.map((o) =>
              o.id === co.id ? { ...o, status: 'TRIGGERED', triggeredAt: new Date().toISOString() } : o
            ),
          })
          return {
            triggered: true,
            type: 'TAKE_PROFIT',
            order: res.order || undefined,
            message: `🎯 Conditional Take Profit Terpicu pada Rp ${currentPrice.toLocaleString('id-ID')}!`,
          }
        }
      }
    }

    return { triggered: false }
  },

  placeSellOrder: (params: OrderParams): { order: Order | null; error?: string } => {
    const { cash, holdings, orders, realizedPL: currentTotalRealizedPL } = get()
    const { symbol, displaySymbol, price, lots, orderType = 'LIMIT' } = params

    if (lots <= 0 || price <= 0) {
      return { order: null, error: 'Jumlah koin/lot dan harga jual harus bernilai positif.' }
    }

    // Deteksi apakah instrumen merupakan cryptocurrency
    const isCrypto =
      params.assetClass === 'CRYPTO' ||
      symbol.toUpperCase().endsWith('USDT') ||
      !!displaySymbol?.toUpperCase().endsWith('USDT') ||
      ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT', 'TRX'].includes(
        (displaySymbol || symbol).replace(/USDT$/i, '').toUpperCase()
      )

    const cleanSym = (displaySymbol || symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase()
    const resolvedSym = isCrypto
      ? `${cleanSym}USDT`
      : (symbol.includes('.') || symbol.startsWith('^') ? symbol : `${cleanSym}.JK`)
    const isIDX = !isCrypto && (resolvedSym.endsWith('.JK') || cleanSym.length === 4)

    // Validasi fraksi harga BEI HANYA jika saham Indonesia
    if (isIDX) {
      const remainder = price % (price > 5000 ? 25 : price > 2000 ? 10 : price > 500 ? 5 : price > 200 ? 2 : 1)
      if (remainder !== 0) {
        return { order: null, error: `Harga jual Rp ${price} tidak mematuhi fraksi harga resmi BEI.` }
      }
    }

    const existingHoldingIndex = holdings.findIndex(
      (h) =>
        h.displaySymbol.toUpperCase() === cleanSym ||
        h.symbol.toUpperCase() === resolvedSym ||
        (isCrypto && h.symbol.replace(/USDT$/i, '').toUpperCase() === cleanSym)
    )

    if (existingHoldingIndex < 0) {
      return { order: null, error: `Anda tidak memiliki aset ${cleanSym} di portofolio.` }
    }

    const existing = holdings[existingHoldingIndex]
    const availableLots = isCrypto ? (existing.cryptoUnits ?? existing.lots) : existing.lots
    if (availableLots < lots) {
      return {
        order: null,
        error: `Jumlah saldo tidak mencukupi. Anda hanya memiliki ${availableLots} ${isCrypto ? 'koin' : 'lot'} ${cleanSym}.`,
      }
    }

    const rate = params.exchangeRate || existing.exchangeRate || 16000
    let tradeValue: number
    let brokerFee: number
    let taxFee: number
    let totalFee: number
    let netProceeds: number
    let costBasisSold: number
    let sharesSold: number
    const sharesMultiplier = isIDX ? SHARES_PER_LOT : 1

    if (isCrypto) {
      sharesSold = lots
      const tradeValueUSD = price * lots
      tradeValue = Math.round(tradeValueUSD * rate)
      brokerFee = Math.round(tradeValue * 0.001) // 0.1% spot fee
      taxFee = Math.round(tradeValue * 0.001) // 0.1% PPh Final Bappebti
      totalFee = brokerFee + taxFee
      netProceeds = tradeValue - totalFee
      costBasisSold = existing.avgPrice * lots * rate
    } else {
      sharesSold = lots * sharesMultiplier
      tradeValue = price * sharesSold
      brokerFee = Math.round(tradeValue * 0.0015)
      taxFee = Math.round(tradeValue * 0.0010) // 0.1% PPh Final bursa
      totalFee = brokerFee + taxFee
      netProceeds = tradeValue - totalFee
      costBasisSold = existing.avgPrice * sharesSold
    }

    const orderRealizedPL = netProceeds - costBasisSold
    const orderRealizedPLPercent = costBasisSold > 0 ? Number(((orderRealizedPL / costBasisSold) * 100).toFixed(2)) : 0

    const orderId = `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const now = new Date().toISOString()

    const newOrder: Order = {
      id: orderId,
      symbol: resolvedSym,
      displaySymbol: cleanSym,
      type: 'SELL',
      orderType,
      price,
      lots,
      shares: sharesSold,
      total: tradeValue,
      fee: totalFee,
      brokerFee,
      taxFee,
      realizedPL: orderRealizedPL,
      realizedPLPercent: orderRealizedPLPercent,
      assetClass: isCrypto ? 'CRYPTO' : 'EQUITY',
      currency: isCrypto ? 'USDT' : 'IDR',
      cryptoUnits: isCrypto ? lots : undefined,
      exchangeRate: isCrypto ? rate : undefined,
      status: 'FILLED',
      createdAt: now,
      filledAt: now,
    }

    let updatedHoldings: PortfolioHolding[]
    const remainingLots = availableLots - lots

    if (remainingLots <= 0.000001) {
      // Jika seluruh aset terjual habis
      updatedHoldings = holdings.filter((_, idx) => idx !== existingHoldingIndex)
    } else {
      // Jika penjualan sebagian
      const remainingShares = isCrypto ? remainingLots : remainingLots * sharesMultiplier
      const remainingUnrealizedPL = isCrypto
        ? Math.round((price - existing.avgPrice) * remainingLots * rate)
        : (price - existing.avgPrice) * remainingShares
      const remainingUnrealizedPercent = existing.avgPrice > 0
        ? Number((((price - existing.avgPrice) / existing.avgPrice) * 100).toFixed(2))
        : 0

      updatedHoldings = [...holdings]
      updatedHoldings[existingHoldingIndex] = {
        ...existing,
        lots: remainingLots,
        shares: remainingShares,
        cryptoUnits: isCrypto ? remainingLots : undefined,
        currentPrice: price,
        unrealizedPL: remainingUnrealizedPL,
        unrealizedPLPercent: remainingUnrealizedPercent,
        realizedPL: (existing.realizedPL || 0) + orderRealizedPL,
      }
    }

    set({
      cash: cash + netProceeds,
      realizedPL: currentTotalRealizedPL + orderRealizedPL,
      holdings: updatedHoldings,
      orders: [newOrder, ...orders],
    })

    if (typeof window !== 'undefined') {
      import('@/lib/bloombergAudio').then(({ bloombergAudio }) => bloombergAudio.playOrderFilledChime()).catch(() => {});
    }

    return { order: newOrder }
  },

  updateHoldingPrices: (priceMap: Record<string, number>) => {
    set((state) => ({
      holdings: state.holdings.map((holding) => {
        const clean = holding.displaySymbol.toUpperCase()
        const isCrypto = holding.assetClass === 'CRYPTO' || holding.symbol.endsWith('USDT')
        const newPrice =
          priceMap[holding.symbol] ??
          priceMap[clean] ??
          priceMap[`${clean}USDT`] ??
          holding.currentPrice

        let unrealizedPL = 0
        let unrealizedPLPercent = 0

        if (isCrypto) {
          const rate = holding.exchangeRate || 16000
          const units = holding.cryptoUnits ?? holding.lots
          unrealizedPL = Math.round((newPrice - holding.avgPrice) * units * rate)
          unrealizedPLPercent = holding.avgPrice > 0
            ? Number((((newPrice - holding.avgPrice) / holding.avgPrice) * 100).toFixed(2))
            : 0
        } else {
          const totalShares = holding.shares || holding.lots * SHARES_PER_LOT
          unrealizedPL = (newPrice - holding.avgPrice) * totalShares
          unrealizedPLPercent = holding.avgPrice > 0
            ? Number((((newPrice - holding.avgPrice) / holding.avgPrice) * 100).toFixed(2))
            : 0
        }

        // ── ATR Trailing Stop: Naikkan batas pengunci profit jika harga mencetak puncak baru ──
        const peakPrice = Math.max(holding.peakPrice || holding.avgPrice || newPrice, newPrice)
        const trailPct = holding.trailingStopPct || (isCrypto ? 6 : 4)
        const calculatedTrailingPrice = isCrypto
          ? Number((peakPrice * (1 - trailPct / 100)).toFixed(4))
          : Math.round(peakPrice * (1 - trailPct / 100))
        const trailingStopPrice = Math.max(holding.trailingStopPrice || 0, calculatedTrailingPrice)

        return {
          ...holding,
          currentPrice: newPrice,
          peakPrice,
          trailingStopPrice,
          unrealizedPL,
          unrealizedPLPercent,
        }
      }),
    }))
  },

  claimDividend: (symbol: string, dps: number) => {
    const { cash, holdings, dividends } = get()
    const cleanSym = symbol.replace('.JK', '').toUpperCase()
    const holding = holdings.find((h) => h.displaySymbol.toUpperCase() === cleanSym || h.symbol.toUpperCase() === symbol.toUpperCase())

    if (!holding || holding.lots <= 0) {
      return { success: false, amount: 0, message: `Anda tidak memiliki saham ${cleanSym} untuk menerima dividen.` }
    }

    const totalShares = holding.lots * SHARES_PER_LOT
    const gross = totalShares * dps
    const tax = 0 // Dividen dalam negeri bebas pajak jika diinvestasikan kembali (PPh 0%)
    const net = gross - tax

    const record: DividendRecord = {
      id: `div-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      symbol: holding.symbol,
      displaySymbol: holding.displaySymbol,
      name: holding.name,
      dividendPerShare: dps,
      shares: totalShares,
      grossAmount: gross,
      taxAmount: tax,
      netAmount: net,
      cumDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'PAID',
    }

    // Perbarui saldo kas dan total dividen pada holding
    const updatedHoldings = holdings.map((h) => {
      if (h.symbol === holding.symbol) {
        return {
          ...h,
          totalDividendEarned: (h.totalDividendEarned || 0) + net,
        }
      }
      return h
    })

    set({
      cash: cash + net,
      holdings: updatedHoldings,
      dividends: [record, ...dividends],
    })

    return { success: true, amount: net, message: `Dividen ${cleanSym} sebesar Rp ${net.toLocaleString('id-ID')} berhasil masuk ke Saldo Kas Anda!` }
  },

  distributeAllEligibleDividends: (): { total: number; count: number; symbols: string[] } => {
    const { cash, holdings, dividends } = get()
    let totalClaimed = 0
    const claimedSymbols: string[] = []
    const newRecords: DividendRecord[] = []
    const nowStr = new Date().toISOString().split('T')[0]

    const updatedHoldings = holdings.map((h) => {
      const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').trim().toUpperCase()
      const divInfo = KNOWN_DIVIDENDS[cleanSym]
      if (divInfo && divInfo.dps > 0 && h.lots > 0) {
        const totalShares = h.shares || (h.lots * SHARES_PER_LOT)
        const net = totalShares * divInfo.dps
        totalClaimed += net
        claimedSymbols.push(cleanSym)

        newRecords.push({
          id: `div-${Date.now()}-${cleanSym}-${Math.random().toString(36).slice(2, 6)}`,
          symbol: h.symbol,
          displaySymbol: h.displaySymbol || cleanSym,
          name: h.name || `${cleanSym} Tbk`,
          dividendPerShare: divInfo.dps,
          shares: totalShares,
          grossAmount: net,
          taxAmount: 0,
          netAmount: net,
          cumDate: divInfo.cumDate || nowStr,
          paymentDate: nowStr,
          status: 'PAID',
        })

        return {
          ...h,
          totalDividendEarned: (h.totalDividendEarned || 0) + net,
        }
      }
      return h
    })

    if (totalClaimed > 0) {
      set({
        cash: cash + totalClaimed,
        holdings: updatedHoldings,
        dividends: [...newRecords, ...dividends],
      })
    }

    return { total: totalClaimed, count: claimedSymbols.length, symbols: claimedSymbols }
  },

  claimDividendWithDRIP: (symbol: string, dps: number) => {
    const { cash, holdings, dividends } = get()
    const cleanSym = symbol.replace('.JK', '').trim().toUpperCase()
    const holding = holdings.find(
      (h) => h.displaySymbol.toUpperCase() === cleanSym || h.symbol.toUpperCase() === symbol.toUpperCase()
    )

    if (!holding || holding.lots <= 0) {
      return { success: false, newLots: 0, leftoverCash: 0, totalDividend: 0, message: `Anda tidak memiliki saham ${cleanSym}.` }
    }

    const totalShares = holding.shares || (holding.lots * SHARES_PER_LOT)
    const totalDividend = totalShares * dps
    const currentPrice = holding.currentPrice || holding.avgPrice || 1000
    const costPerLot = currentPrice * SHARES_PER_LOT

    const newLots = Math.floor(totalDividend / costPerLot)
    const costUsed = newLots * costPerLot
    const leftoverCash = totalDividend - costUsed

    const record: DividendRecord = {
      id: `div-drip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      symbol: holding.symbol,
      displaySymbol: holding.displaySymbol,
      name: `${holding.name} (DRIP Reinvest)`,
      dividendPerShare: dps,
      shares: totalShares,
      grossAmount: totalDividend,
      taxAmount: 0,
      netAmount: totalDividend,
      cumDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'PAID',
    }

    const updatedHoldings = holdings.map((h) => {
      const hClean = (h.displaySymbol || h.symbol).replace('.JK', '').trim().toUpperCase()
      if (hClean === cleanSym || h.symbol.toUpperCase() === holding.symbol.toUpperCase()) {
        const updatedLots = h.lots + newLots
        const updatedShares = updatedLots * SHARES_PER_LOT
        const updatedAvgPrice = updatedLots > 0
          ? Math.round(((h.lots * h.avgPrice) + (newLots * currentPrice)) / updatedLots)
          : h.avgPrice
        const updatedUnrealizedPL = (h.currentPrice - updatedAvgPrice) * updatedShares
        const updatedUnrealizedPercent = updatedAvgPrice > 0
          ? Number((((h.currentPrice - updatedAvgPrice) / updatedAvgPrice) * 100).toFixed(2))
          : 0

        return {
          ...h,
          lots: updatedLots,
          shares: updatedShares,
          avgPrice: updatedAvgPrice,
          unrealizedPL: updatedUnrealizedPL,
          unrealizedPLPercent: updatedUnrealizedPercent,
          totalDividendEarned: (h.totalDividendEarned || 0) + totalDividend,
        }
      }
      return h
    })

    set({
      cash: cash + leftoverCash,
      holdings: updatedHoldings,
      dividends: [record, ...dividends],
    })

    const msg = newLots > 0
      ? `DRIP Berhasil! Dividen Rp ${totalDividend.toLocaleString('id-ID')} otomatis di-reinvestasi menjadi +${newLots} lot ${cleanSym} (Sisa kembalian kas: Rp ${leftoverCash.toLocaleString('id-ID')}).`
      : `Dividen Rp ${totalDividend.toLocaleString('id-ID')} belum mencukupi 1 lot (butuh Rp ${costPerLot.toLocaleString('id-ID')}), seluruh dana masuk ke Kas RDN.`

    return {
      success: true,
      newLots,
      leftoverCash,
      totalDividend,
      message: msg,
    }
  },

  distributeAllEligibleDividendsWithDRIP: () => {
    const { cash, holdings, dividends } = get()
    let totalLotsAdded = 0
    let leftoverCashAdded = 0
    let totalDividendValue = 0
    const symbols: string[] = []
    const newRecords: DividendRecord[] = []
    const nowStr = new Date().toISOString().split('T')[0]

    const updatedHoldings = holdings.map((h) => {
      const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').trim().toUpperCase()
      const divInfo = KNOWN_DIVIDENDS[cleanSym]
      if (divInfo && divInfo.dps > 0 && h.lots > 0) {
        const totalShares = h.shares || (h.lots * SHARES_PER_LOT)
        const totalDividend = totalShares * divInfo.dps
        const currentPrice = h.currentPrice || h.avgPrice || 1000
        const costPerLot = currentPrice * SHARES_PER_LOT

        const newLots = Math.floor(totalDividend / costPerLot)
        const costUsed = newLots * costPerLot
        const leftoverCash = totalDividend - costUsed

        totalLotsAdded += newLots
        leftoverCashAdded += leftoverCash
        totalDividendValue += totalDividend
        symbols.push(`${cleanSym} (+${newLots} lot)`)

        newRecords.push({
          id: `div-drip-${Date.now()}-${cleanSym}-${Math.random().toString(36).slice(2, 6)}`,
          symbol: h.symbol,
          displaySymbol: h.displaySymbol || cleanSym,
          name: `${h.name} (DRIP Reinvest)`,
          dividendPerShare: divInfo.dps,
          shares: totalShares,
          grossAmount: totalDividend,
          taxAmount: 0,
          netAmount: totalDividend,
          cumDate: divInfo.cumDate || nowStr,
          paymentDate: nowStr,
          status: 'PAID',
        })

        const updatedLots = h.lots + newLots
        const updatedShares = updatedLots * SHARES_PER_LOT
        const updatedAvgPrice = updatedLots > 0
          ? Math.round(((h.lots * h.avgPrice) + (newLots * currentPrice)) / updatedLots)
          : h.avgPrice
        const updatedUnrealizedPL = (h.currentPrice - updatedAvgPrice) * updatedShares
        const updatedUnrealizedPercent = updatedAvgPrice > 0
          ? Number((((h.currentPrice - updatedAvgPrice) / updatedAvgPrice) * 100).toFixed(2))
          : 0

        return {
          ...h,
          lots: updatedLots,
          shares: updatedShares,
          avgPrice: updatedAvgPrice,
          unrealizedPL: updatedUnrealizedPL,
          unrealizedPLPercent: updatedUnrealizedPercent,
          totalDividendEarned: (h.totalDividendEarned || 0) + totalDividend,
        }
      }
      return h
    })

    if (totalDividendValue > 0) {
      set({
        cash: cash + leftoverCashAdded,
        holdings: updatedHoldings,
        dividends: [...newRecords, ...dividends],
      })
    }

    return {
      totalLotsAdded,
      leftoverCashAdded,
      totalDividendValue,
      count: symbols.length,
      symbols,
    }
  },
    }),
    {
      name: 'stockbit_portfolio_storage',
      partialize: (state) => ({
        cash: state.cash,
        realizedPL: state.realizedPL,
        holdings: state.holdings,
        orders: state.orders,
        conditionalOrders: state.conditionalOrders,
        dividends: state.dividends,
      }),
    }
  )
)
