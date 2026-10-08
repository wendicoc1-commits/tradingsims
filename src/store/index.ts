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
  source?: 'AI_AGENT' | 'USER' | string
}

export interface PortfolioState {
  cash: number
  realizedPL: number // Akumulasi total keuntungan/kerugian modal terealisasi
  holdings: PortfolioHolding[]
  orders: Order[]
  conditionalOrders: ConditionalOrder[]
  dividends: DividendRecord[]
  lastUpdated: number
  placeBuyOrder: (paramsOrSymbol: OrderParams | string, ...args: any[]) => { order: Order | null; error?: string }
  placeSellOrder: (paramsOrSymbol: OrderParams | string, ...args: any[]) => { order: Order | null; error?: string }
  placeConditionalOrder: (params: Omit<ConditionalOrder, 'id' | 'createdAt' | 'status'>) => { order: ConditionalOrder | null; error?: string }
  cancelConditionalOrder: (id: string) => void
  setHoldingRiskTargets: (symbol: string, params: { takeProfitPrice?: number; stopLossPrice?: number; validityType?: 'DAY' | 'GTC' }) => void
  checkPriceTriggers: (symbol: string, currentPrice: number) => { triggered: boolean; type?: 'TAKE_PROFIT' | 'STOP_LOSS' | 'TRAILING_STOP' | 'BREAKOUT_BUY'; order?: Order; message?: string }
  updateHoldingPrices: (priceMap: Record<string, number>) => void
  claimDividend: (symbol: string, dps: number) => { success: boolean; amount: number; message: string }
  claimDividendWithDRIP: (symbol: string, dps: number) => { success: boolean; newLots: number; leftoverCash: number; totalDividend: number; message: string }
  distributeAllEligibleDividends: () => { total: number; count: number; symbols: string[] }
  resetCashOnly: (amount?: number) => void
  topUpCashWithBonus: (transferNominalIDR: number) => { addedVirtualCash: number; newTotalCash: number }
  resetPortfolio: () => void
  resetToDefaultDemo: () => void
}

const SHARES_PER_LOT = 100
const BUY_FEE_RATE = 0.0015 // 0.15% fee
const SELL_FEE_RATE = 0.0025 // 0.25% fee

export const INITIAL_CASH = 0 // Rp 0 murni (bersih kosong)

export const INITIAL_HOLDINGS: PortfolioHolding[] = []

export const INITIAL_ORDERS: Order[] = []

export const INITIAL_DIVIDENDS: DividendRecord[] = []


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
  lastUpdated: Date.now(),

  resetCashOnly: (amount = INITIAL_CASH) => {
    const now = Date.now()
    set({ cash: amount, lastUpdated: now })
    if (typeof window !== 'undefined') {
      import('@/store/useAuthStore').then(({ useAuthStore }) => {
        useAuthStore.getState().syncPortfolioToDatabase();
      }).catch(() => {});
    }
  },

  topUpCashWithBonus: (transferNominalIDR: number) => {
    const multiplier = Math.floor(transferNominalIDR / 10000)
    const addedVirtualCash = multiplier * 1000000
    if (addedVirtualCash <= 0) {
      return { addedVirtualCash: 0, newTotalCash: get().cash }
    }
    const newTotalCash = get().cash + addedVirtualCash
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const depositOrder: Order = {
      id: `topup-qris-${Date.now()}`,
      symbol: 'DEPOSIT-QRIS',
      displaySymbol: 'QRIS TOPUP',
      type: 'BUY',
      orderType: 'MARKET',
      price: 1,
      lots: multiplier,
      shares: addedVirtualCash,
      total: addedVirtualCash,
      fee: 0,
      brokerFee: 0,
      taxFee: 0,
      status: 'FILLED',
      createdAt: nowStr,
      filledAt: nowStr,
    }
    const now = Date.now()
    set({
      cash: newTotalCash,
      orders: [depositOrder, ...get().orders],
      lastUpdated: now,
    })
    if (typeof window !== 'undefined') {
      import('@/store/useAuthStore').then(({ useAuthStore }) => {
        useAuthStore.getState().syncPortfolioToDatabase();
      }).catch(() => {});
    }
    return { addedVirtualCash, newTotalCash }
  },

  resetPortfolio: () => {
    const now = Date.now()
    set({
      cash: INITIAL_CASH,
      realizedPL: 0,
      holdings: [],
      orders: [],
      conditionalOrders: [],
      dividends: [],
      lastUpdated: now,
    })
    if (typeof window !== 'undefined') {
      import('@/store/useAuthStore').then(({ useAuthStore }) => {
        useAuthStore.getState().resetPortfolioInDatabase(INITIAL_CASH);
      }).catch(() => {});
    }
  },

  resetToDefaultDemo: () => {
    const now = Date.now()
    set({
      cash: INITIAL_CASH,
      realizedPL: 0,
      holdings: JSON.parse(JSON.stringify(INITIAL_HOLDINGS)),
      orders: JSON.parse(JSON.stringify(INITIAL_ORDERS)),
      conditionalOrders: [],
      dividends: JSON.parse(JSON.stringify(INITIAL_DIVIDENDS)),
      lastUpdated: now,
    })
    if (typeof window !== 'undefined') {
      import('@/store/useAuthStore').then(({ useAuthStore }) => {
        useAuthStore.getState().resetPortfolioInDatabase(INITIAL_CASH);
      }).catch(() => {});
    }
  },

  placeBuyOrder: (paramsOrSymbol: OrderParams | string, ...args: any[]): { order: Order | null; error?: string } => {
    let params: OrderParams
    if (typeof paramsOrSymbol === 'string') {
      const sym = paramsOrSymbol
      let name = sym
      let price = 1000
      let lots = 1
      let orderType: 'LIMIT' | 'MARKET' = 'MARKET'

      if (typeof args[0] === 'number') {
        // Bentuk: placeBuyOrder(symbol, lots, price)
        lots = args[0]
        price = typeof args[1] === 'number' ? args[1] : 1000
      } else if (typeof args[0] === 'string') {
        // Bentuk: placeBuyOrder(symbol, name, price, lots, orderType)
        name = args[0]
        price = typeof args[1] === 'number' ? args[1] : 1000
        lots = typeof args[2] === 'number' ? args[2] : 1
        orderType = typeof args[3] === 'string' ? args[3] as any : 'MARKET'
      }
      params = { symbol: sym, name, price, lots, orderType }
    } else {
      params = paramsOrSymbol
    }

    const { cash, holdings, orders } = get()
    const { symbol, displaySymbol, price, lots, name = displaySymbol, orderType = 'LIMIT' } = params

    if (lots <= 0 || price <= 0) {
      return { order: null, error: 'Jumlah koin/lot dan harga harus bernilai positif.' }
    }

    // Deteksi apakah instrumen merupakan cryptocurrency
    const isCrypto =
      params.assetClass === 'CRYPTO' ||
      params.currency === 'USDT' ||
      symbol.toUpperCase().endsWith('USDT') ||
      !!displaySymbol?.toUpperCase().endsWith('USDT') ||
      ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT', 'TRX', 'RENDER', 'TAO', 'FET', 'ARB', 'OP', 'APT', 'KAS', 'TON'].includes(
        (displaySymbol || symbol).replace(/USDT$/i, '').toUpperCase()
      )

    // Normalisasi simbol konsisten
    const cleanSym = (displaySymbol || symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase()
    const KNOWN_US = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NFLX', 'AMD', 'INTC', 'SPY', 'QQQ', 'COIN', 'PLTR']
    const isUS = !isCrypto && (params.currency === 'USD' || KNOWN_US.includes(cleanSym))
    const resolvedSym = isCrypto
      ? `${cleanSym}USDT`
      : isUS
      ? cleanSym
      : (symbol.includes('.') || symbol.startsWith('^') ? symbol : `${cleanSym}.JK`)
    const isIDX = !isCrypto && !isUS && (resolvedSym.endsWith('.JK') || (!symbol.includes('.') && cleanSym.length === 4))

    // Validasi Jam Bursa BEI: Bot dilarang membeli saham BEI di luar jam bursa (Senin–Jumat 09:00–16:00 WIB)
    // Kripto dan Saham Global bebas aktif 24 jam nonstop
    if (params.source === 'AI_AGENT' && isIDX) {
      const marketCheck = checkIDXMarketStatus()
      if (!marketCheck.isOpen) {
        return {
          order: null,
          error: `Bot dilarang membeli saham BEI di luar jam perdagangan bursa (09:00–16:00 WIB). ${marketCheck.message}`,
        }
      }
    }

    let execPrice = price
    // Validasi & sinkronisasi fraksi harga resmi BEI jika saham Indonesia (tidak memblokir jam di mode simulator agar latihan & AI agent bisa berjalan 24/7)
    if (isIDX) {
      const tick = execPrice > 5000 ? 25 : execPrice > 2000 ? 10 : execPrice > 500 ? 5 : execPrice > 200 ? 2 : 1
      const remainder = execPrice % tick
      if (remainder !== 0) {
        execPrice = Math.round(execPrice / tick) * tick
      }
    }

    const rate = params.exchangeRate || 16000 // Kurs acuan USDT/USD ke IDR
    const currency = isCrypto ? (params.currency || 'USDT') : isUS ? 'USD' : 'IDR'

    let totalCost: number
    let tradeValue: number
    let brokerFee: number
    let totalShares: number
    let sharesMultiplier: number

    if (isCrypto) {
      sharesMultiplier = 1
      totalShares = lots // Dalam satuan unit koin (bisa desimal)
      const tradeValueUSD = execPrice * lots
      tradeValue = Math.round(tradeValueUSD * rate)
      brokerFee = Math.round(tradeValue * 0.001) // Spot fee crypto 0.1%
      totalCost = tradeValue + brokerFee
    } else if (isUS) {
      sharesMultiplier = 1
      totalShares = lots // 1 lembar shares US
      const tradeValueUSD = execPrice * lots
      tradeValue = Math.round(tradeValueUSD * rate)
      brokerFee = Math.round(tradeValue * 0.0015)
      totalCost = tradeValue + brokerFee
    } else {
      sharesMultiplier = SHARES_PER_LOT
      totalShares = lots * sharesMultiplier
      tradeValue = execPrice * totalShares
      brokerFee = Math.round(tradeValue * BUY_FEE_RATE)
      totalCost = tradeValue + brokerFee
    }

    // Proteksi Batas Cadangan Kas Minimum Bot AI (Rp 1.000.000):
    // Sesuai aturan manajemen risiko modal, jika saldo kas saat ini di bawah Rp 1.000.000,
    // atau jika order beli bot akan membuat sisa kas turun di bawah batas aman cadangan Rp 1.000.000,
    // maka bot dilarang membeli saham atau crypto baru.
    const MIN_BOT_CASH_RESERVE = 1_000_000
    if (params.source === 'AI_AGENT') {
      if (cash < MIN_BOT_CASH_RESERVE) {
        return {
          order: null,
          error: `⛔ Proteksi Likuiditas Bot: Saldo kas (Rp ${Math.round(cash).toLocaleString('id-ID')}) di bawah batas minimum Rp 1.000.000. Bot dilarang membeli saham & crypto demi melindungi modal.`,
        }
      }
      if (cash - totalCost < MIN_BOT_CASH_RESERVE) {
        return {
          order: null,
          error: `⛔ Proteksi Cadangan Kas Bot: Pembelian ini (biaya Rp ${Math.round(totalCost).toLocaleString('id-ID')}) akan menyisakan kas Rp ${Math.round(cash - totalCost).toLocaleString('id-ID')}, di bawah batas aman Rp 1.000.000. Order beli bot ditolak.`,
        }
      }
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
      price: execPrice,
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
      exchangeRate: (isCrypto || isUS) ? rate : undefined,
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
    const isForeign = isCrypto || isUS

    if (existingHoldingIndex >= 0) {
      const existing = holdings[existingHoldingIndex]
      const existingShares = existing.shares || existing.lots * sharesMultiplier
      const newTotalShares = existingShares + totalShares
      const newTotalLots = isIDX ? Math.round(newTotalShares / SHARES_PER_LOT) : newTotalShares

      const existingTotalCost = isForeign
        ? existing.avgPrice * existingShares * (existing.exchangeRate || rate)
        : existing.avgPrice * existingShares
      const newPurchaseCost = tradeValue + brokerFee

      const newAvgPrice = isForeign
        ? Number(((existing.avgPrice * existingShares + execPrice * totalShares) / newTotalShares).toFixed(execPrice < 0.01 ? 8 : (isCrypto ? 4 : 2)))
        : Math.round((existingTotalCost + newPurchaseCost) / newTotalShares)

      const unrealizedPL = isForeign
        ? Math.round((execPrice - newAvgPrice) * newTotalShares * rate)
        : (execPrice - newAvgPrice) * newTotalShares
      const unrealizedPLPercent = newAvgPrice > 0
        ? Number((((execPrice - newAvgPrice) / newAvgPrice) * 100).toFixed(2))
        : 0

      updatedHoldings = [...holdings]
      updatedHoldings[existingHoldingIndex] = {
        ...existing,
        avgPrice: newAvgPrice,
        lots: newTotalLots,
        shares: newTotalShares,
        currentPrice: execPrice,
        unrealizedPL,
        unrealizedPLPercent,
        takeProfitPrice: (params.takeProfitPrice && params.takeProfitPrice > execPrice) ? params.takeProfitPrice : existing.takeProfitPrice,
        stopLossPrice: (params.stopLossPrice && params.stopLossPrice < execPrice) ? params.stopLossPrice : existing.stopLossPrice,
        validityType: params.validityType || existing.validityType || 'GTC',
        assetClass: isCrypto ? 'CRYPTO' : existing.assetClass || 'EQUITY',
        currency: isCrypto ? 'USDT' : isUS ? 'USD' : existing.currency || 'IDR',
        cryptoUnits: isCrypto ? newTotalShares : undefined,
        exchangeRate: isForeign ? rate : undefined,
        lastBoughtAt: Date.now(),
      }
    } else {
      const initialAvgPrice = isForeign ? execPrice : Math.round((tradeValue + brokerFee) / totalShares)
      const unrealizedPL = isForeign
        ? Math.round((execPrice - initialAvgPrice) * totalShares * rate)
        : (execPrice - initialAvgPrice) * totalShares
      const unrealizedPLPercent = Number((((execPrice - initialAvgPrice) / initialAvgPrice) * 100).toFixed(2))

      const safeTakeProfit = (params.takeProfitPrice && params.takeProfitPrice > execPrice) ? params.takeProfitPrice : undefined
      const safeStopLoss = (params.stopLossPrice && params.stopLossPrice < execPrice) ? params.stopLossPrice : undefined

      const newHolding: PortfolioHolding = {
        symbol: resolvedSym,
        displaySymbol: cleanSym,
        name: name || (isCrypto ? `${cleanSym}/USDT` : isUS ? `${cleanSym} (US Stock)` : cleanSym),
        avgPrice: initialAvgPrice,
        lots,
        shares: totalShares,
        currentPrice: execPrice,
        unrealizedPL,
        unrealizedPLPercent,
        takeProfitPrice: safeTakeProfit,
        stopLossPrice: safeStopLoss,
        peakPrice: execPrice,
        trailingStopPct: isCrypto ? 8 : 6, // 8% untuk volatilitas kripto, 6% untuk saham
        trailingStopPrice: isCrypto
          ? Number((execPrice * 0.92).toFixed(execPrice < 0.01 ? 8 : 4))
          : isUS
          ? Number((execPrice * 0.94).toFixed(2))
          : Math.round(execPrice * 0.94),
        validityType: params.validityType || 'GTC',
        assetClass: isCrypto ? 'CRYPTO' : 'EQUITY',
        currency: isCrypto ? 'USDT' : isUS ? 'USD' : 'IDR',
        cryptoUnits: isCrypto ? lots : undefined,
        exchangeRate: isForeign ? rate : undefined,
        totalDividendEarned: 0,
        realizedPL: 0,
        createdAt: new Date().toISOString(),
        lastBoughtAt: Date.now(),
      }
      updatedHoldings = [...holdings, newHolding]
    }

    set({
      cash: cash - totalCost,
      holdings: updatedHoldings,
      orders: [newOrder, ...orders],
      lastUpdated: Date.now(),
    })

    if (typeof window !== 'undefined') {
      import('@/lib/tradeSimAudio').then(({ tradeSimAudio }) => tradeSimAudio.playOrderFilledChime()).catch(() => {});
      import('@/store/useAuthStore').then(({ useAuthStore }) => {
        useAuthStore.getState().recordOrderToDatabase(newOrder);
        useAuthStore.getState().syncPortfolioToDatabase();
      }).catch(() => {});
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
    set({ holdings: updated, lastUpdated: Date.now() })

    if (typeof window !== 'undefined') {
      import('@/store/useAuthStore').then(({ useAuthStore }) => {
        useAuthStore.getState().syncPortfolioToDatabase();
      }).catch(() => {});
    }
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
    set({ conditionalOrders: [newOrder, ...conditionalOrders], lastUpdated: Date.now() })
    return { order: newOrder }
  },

  cancelConditionalOrder: (id: string) => {
    const { conditionalOrders } = get()
    set({
      conditionalOrders: conditionalOrders.map((co) =>
        co.id === id ? { ...co, status: 'CANCELLED' } : co
      ),
      lastUpdated: Date.now(),
    })
  },

  checkPriceTriggers: (symbol: string, currentPrice: number) => {
    const { holdings, conditionalOrders, placeSellOrder, placeBuyOrder } = get()
    const clean = symbol.replace('.JK', '').toUpperCase()
    const targetHolding = holdings.find((h) => h.displaySymbol.toUpperCase() === clean || h.symbol.toUpperCase() === symbol.toUpperCase())

    // 1. Cek Target TP/SL Direct Holding (Hanya terpicu jika target TP benar-benar di atas modal dan target SL di bawah modal)
    if (targetHolding && targetHolding.lots > 0) {
      if (
        targetHolding.takeProfitPrice &&
        targetHolding.takeProfitPrice > targetHolding.avgPrice &&
        currentPrice >= targetHolding.takeProfitPrice
      ) {
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

      if (
        targetHolding.stopLossPrice &&
        targetHolding.stopLossPrice < targetHolding.avgPrice &&
        currentPrice <= targetHolding.stopLossPrice
      ) {
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

  placeSellOrder: (paramsOrSymbol: OrderParams | string, ...args: any[]): { order: Order | null; error?: string } => {
    let params: OrderParams
    if (typeof paramsOrSymbol === 'string') {
      const sym = paramsOrSymbol
      let name = sym
      let price = 1000
      let lots = 1
      let orderType: 'LIMIT' | 'MARKET' = 'MARKET'

      if (typeof args[0] === 'number') {
        // Bentuk: placeSellOrder(symbol, lots, price)
        lots = args[0]
        price = typeof args[1] === 'number' ? args[1] : 1000
      } else if (typeof args[0] === 'string') {
        // Bentuk: placeSellOrder(symbol, name, price, lots, orderType)
        name = args[0]
        price = typeof args[1] === 'number' ? args[1] : 1000
        lots = typeof args[2] === 'number' ? args[2] : 1
        orderType = typeof args[3] === 'string' ? args[3] as any : 'MARKET'
      }
      params = { symbol: sym, name, price, lots, orderType }
    } else {
      params = paramsOrSymbol
    }

    const { cash, holdings, orders, realizedPL: currentTotalRealizedPL } = get()
    const { symbol, displaySymbol, price, lots, orderType = 'LIMIT' } = params

    if (lots <= 0 || price <= 0) {
      return { order: null, error: 'Jumlah koin/lot dan harga jual harus bernilai positif.' }
    }

    // Deteksi apakah instrumen merupakan cryptocurrency
    const isCrypto =
      params.assetClass === 'CRYPTO' ||
      params.currency === 'USDT' ||
      symbol.toUpperCase().endsWith('USDT') ||
      !!displaySymbol?.toUpperCase().endsWith('USDT') ||
      ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT', 'TRX', 'RENDER', 'TAO', 'FET', 'ARB', 'OP', 'APT', 'KAS', 'TON'].includes(
        (displaySymbol || symbol).replace(/USDT$/i, '').toUpperCase()
      )

    const cleanSym = (displaySymbol || symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase()
    const KNOWN_US = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NFLX', 'AMD', 'INTC', 'SPY', 'QQQ', 'COIN', 'PLTR']
    const isUS = !isCrypto && (params.currency === 'USD' || KNOWN_US.includes(cleanSym))
    const resolvedSym = isCrypto
      ? `${cleanSym}USDT`
      : isUS
      ? cleanSym
      : (symbol.includes('.') || symbol.startsWith('^') ? symbol : `${cleanSym}.JK`)
    const isIDX = !isCrypto && !isUS && (resolvedSym.endsWith('.JK') || (!symbol.includes('.') && cleanSym.length === 4))

    let execPrice = price
    // Validasi & sinkronisasi fraksi harga BEI HANYA jika saham Indonesia
    if (isIDX) {
      const tick = execPrice > 5000 ? 25 : execPrice > 2000 ? 10 : execPrice > 500 ? 5 : execPrice > 200 ? 2 : 1
      const remainder = execPrice % tick
      if (remainder !== 0) {
        execPrice = Math.round(execPrice / tick) * tick
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
    const isInsufficient = isCrypto ? (availableLots + 0.0000001 < lots) : (availableLots < lots)
    if (isInsufficient) {
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
      const tradeValueUSD = execPrice * lots
      tradeValue = Math.round(tradeValueUSD * rate)
      brokerFee = Math.round(tradeValue * 0.001) // 0.1% spot fee
      taxFee = Math.round(tradeValue * 0.001) // 0.1% PPh Final Bappebti
      totalFee = brokerFee + taxFee
      netProceeds = tradeValue - totalFee
      costBasisSold = existing.avgPrice * lots * rate
    } else if (isUS) {
      sharesSold = lots
      const tradeValueUSD = execPrice * lots
      tradeValue = Math.round(tradeValueUSD * rate)
      brokerFee = Math.round(tradeValue * 0.0015)
      taxFee = 0
      totalFee = brokerFee + taxFee
      netProceeds = tradeValue - totalFee
      costBasisSold = existing.avgPrice * lots * rate
    } else {
      sharesSold = lots * sharesMultiplier
      tradeValue = execPrice * sharesSold
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
      price: execPrice,
      lots,
      shares: sharesSold,
      total: tradeValue,
      fee: totalFee,
      brokerFee,
      taxFee,
      realizedPL: orderRealizedPL,
      realizedPLPercent: orderRealizedPLPercent,
      assetClass: isCrypto ? 'CRYPTO' : 'EQUITY',
      currency: isCrypto ? 'USDT' : isUS ? 'USD' : 'IDR',
      cryptoUnits: isCrypto ? lots : undefined,
      exchangeRate: (isCrypto || isUS) ? rate : undefined,
      status: 'FILLED',
      createdAt: now,
      filledAt: now,
    }

    let updatedHoldings: PortfolioHolding[]
    const remainingLots = isCrypto
      ? (Math.abs(availableLots - lots) < 0.000001 ? 0 : Math.max(0, availableLots - lots))
      : availableLots - lots

    if (remainingLots <= 0.000001) {
      // Jika seluruh aset terjual habis
      updatedHoldings = holdings.filter((_, idx) => idx !== existingHoldingIndex)
    } else {
      // Jika penjualan sebagian
      const isForeign = isCrypto || isUS
      const remainingShares = isForeign ? remainingLots : remainingLots * sharesMultiplier
      const remainingUnrealizedPL = isForeign
        ? Math.round((execPrice - existing.avgPrice) * remainingLots * rate)
        : (execPrice - existing.avgPrice) * remainingShares
      const remainingUnrealizedPercent = existing.avgPrice > 0
        ? Number((((execPrice - existing.avgPrice) / existing.avgPrice) * 100).toFixed(2))
        : 0

      updatedHoldings = [...holdings]
      updatedHoldings[existingHoldingIndex] = {
        ...existing,
        lots: remainingLots,
        shares: remainingShares,
        cryptoUnits: isCrypto ? remainingLots : undefined,
        currentPrice: execPrice,
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
      lastUpdated: Date.now(),
    })

    if (typeof window !== 'undefined') {
      import('@/lib/tradeSimAudio').then(({ tradeSimAudio }) => tradeSimAudio.playOrderFilledChime()).catch(() => {});
      import('@/store/useAuthStore').then(({ useAuthStore }) => {
        useAuthStore.getState().recordOrderToDatabase(newOrder);
        if (remainingLots <= 0.000001) {
          useAuthStore.getState().deleteHoldingFromDatabase(resolvedSym);
        }
        useAuthStore.getState().syncPortfolioToDatabase();
      }).catch(() => {});
    }

    return { order: newOrder }
  },

  updateHoldingPrices: (priceMap: Record<string, number>) => {
    set((state) => ({
      holdings: state.holdings.map((holding) => {
        const clean = holding.displaySymbol.toUpperCase()
        const isCrypto = holding.assetClass === 'CRYPTO' || holding.symbol.endsWith('USDT')
        const KNOWN_US = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NFLX', 'AMD', 'INTC', 'SPY', 'QQQ', 'COIN', 'PLTR']
        const isUS = !isCrypto && (holding.currency === 'USD' || holding.assetClass === 'US' || KNOWN_US.includes(clean))
        const candidatePrice =
          priceMap[holding.symbol] ??
          priceMap[clean] ??
          priceMap[`${clean}USDT`] ??
          holding.currentPrice

        const newPrice = (candidatePrice && candidatePrice > 0) ? candidatePrice : holding.currentPrice

        let effectiveAvgPrice = holding.avgPrice
        let effectiveUnits = holding.cryptoUnits ?? holding.lots
        let effectiveLots = holding.lots
        let effectiveShares = holding.shares
        let wasHealed = false

        // Proteksi jika terjadi anomali ekstrem akibat kekeliruan input mata uang IDR ke USD (rasio > 200x)
        if (isCrypto && effectiveAvgPrice > newPrice * 200 && newPrice > 0) {
          const rate = holding.exchangeRate || 16000
          const originalInvestedIDR = effectiveAvgPrice * effectiveUnits
          effectiveAvgPrice = newPrice
          effectiveUnits = Number((originalInvestedIDR / (newPrice * rate)).toFixed(4))
          effectiveLots = effectiveUnits
          effectiveShares = effectiveUnits
          wasHealed = true
        }

        let unrealizedPL = 0
        let unrealizedPLPercent = 0

        if (isCrypto) {
          const rate = holding.exchangeRate || 16000
          unrealizedPL = Math.round((newPrice - effectiveAvgPrice) * effectiveUnits * rate)
          unrealizedPLPercent = effectiveAvgPrice > 0
            ? Number((((newPrice - effectiveAvgPrice) / effectiveAvgPrice) * 100).toFixed(2))
            : 0
        } else if (isUS) {
          const rate = holding.exchangeRate || 16000
          const units = holding.shares ?? holding.lots
          unrealizedPL = Math.round((newPrice - effectiveAvgPrice) * units * rate)
          unrealizedPLPercent = effectiveAvgPrice > 0
            ? Number((((newPrice - effectiveAvgPrice) / effectiveAvgPrice) * 100).toFixed(2))
            : 0
        } else {
          const totalShares = holding.shares || holding.lots * SHARES_PER_LOT
          unrealizedPL = (newPrice - effectiveAvgPrice) * totalShares
          unrealizedPLPercent = effectiveAvgPrice > 0
            ? Number((((newPrice - effectiveAvgPrice) / effectiveAvgPrice) * 100).toFixed(2))
            : 0
        }

        // ── ATR Trailing Stop: Naikkan batas pengunci profit jika harga mencetak puncak baru ──
        const peakPrice = Math.max(holding.peakPrice || effectiveAvgPrice || newPrice, newPrice)
        const trailPct = holding.trailingStopPct || (isCrypto ? 8 : 6)
        const calculatedTrailingPrice = isCrypto
          ? Number((peakPrice * (1 - trailPct / 100)).toFixed(peakPrice < 0.01 ? 8 : 4))
          : isUS
          ? Number((peakPrice * (1 - trailPct / 100)).toFixed(2))
          : Math.round(peakPrice * (1 - trailPct / 100))
        const trailingStopPrice = Math.max(holding.trailingStopPrice || 0, calculatedTrailingPrice)

        if (wasHealed && typeof window !== 'undefined') {
          import('@/store/useAuthStore').then(({ useAuthStore }) => {
            useAuthStore.getState().syncPortfolioToDatabase();
          }).catch(() => {});
        }

        return {
          ...holding,
          avgPrice: effectiveAvgPrice,
          lots: effectiveLots,
          shares: effectiveShares,
          cryptoUnits: isCrypto ? effectiveUnits : holding.cryptoUnits,
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
      lastUpdated: Date.now(),
    })

    if (typeof window !== 'undefined') {
      import('@/store/useAuthStore').then(({ useAuthStore }) => {
        useAuthStore.getState().syncPortfolioToDatabase();
      }).catch(() => {});
    }

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
        lastUpdated: Date.now(),
      })

      if (typeof window !== 'undefined') {
        import('@/store/useAuthStore').then(({ useAuthStore }) => {
          useAuthStore.getState().syncPortfolioToDatabase();
        }).catch(() => {});
      }
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
    const costPerLot = Math.max(1, currentPrice * SHARES_PER_LOT)

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
      lastUpdated: Date.now(),
    })

    if (typeof window !== 'undefined') {
      import('@/store/useAuthStore').then(({ useAuthStore }) => {
        useAuthStore.getState().syncPortfolioToDatabase();
      }).catch(() => {});
    }

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
        const costPerLot = Math.max(1, currentPrice * SHARES_PER_LOT)

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
        lastUpdated: Date.now(),
      })

      if (typeof window !== 'undefined') {
        import('@/store/useAuthStore').then(({ useAuthStore }) => {
          useAuthStore.getState().syncPortfolioToDatabase();
        }).catch(() => {});
      }
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
      name: 'stockbit_portfolio_storage_v2',
      version: 2,
      migrate: (persistedState: any) => {
        if (!persistedState) {
          if (typeof window !== 'undefined') {
            try {
              const legacyRaw = localStorage.getItem('stockbit_portfolio_storage')
              if (legacyRaw) {
                const parsed = JSON.parse(legacyRaw)
                const legacyState = parsed?.state || parsed
                if (legacyState && typeof legacyState.cash === 'number') {
                  return {
                    cash: legacyState.cash,
                    realizedPL: legacyState.realizedPL || 0,
                    holdings: Array.isArray(legacyState.holdings) ? legacyState.holdings : [],
                    orders: Array.isArray(legacyState.orders) ? legacyState.orders : [],
                    conditionalOrders: Array.isArray(legacyState.conditionalOrders) ? legacyState.conditionalOrders : [],
                    dividends: Array.isArray(legacyState.dividends) ? legacyState.dividends : [],
                    lastUpdated: typeof legacyState.lastUpdated === 'number' ? legacyState.lastUpdated : Date.now(),
                  }
                }
              }
            } catch {}
          }
          return {
            cash: 0,
            realizedPL: 0,
            holdings: [],
            orders: [],
            conditionalOrders: [],
            dividends: [],
            lastUpdated: Date.now(),
          }
        }
        return {
          cash: typeof persistedState.cash === 'number' ? persistedState.cash : 0,
          realizedPL: typeof persistedState.realizedPL === 'number' ? persistedState.realizedPL : 0,
          holdings: Array.isArray(persistedState.holdings) ? persistedState.holdings : [],
          orders: Array.isArray(persistedState.orders) ? persistedState.orders : [],
          conditionalOrders: Array.isArray(persistedState.conditionalOrders) ? persistedState.conditionalOrders : [],
          dividends: Array.isArray(persistedState.dividends) ? persistedState.dividends : [],
          lastUpdated: typeof persistedState.lastUpdated === 'number' ? persistedState.lastUpdated : Date.now(),
        }
      },
      partialize: (state) => ({
        cash: state.cash,
        realizedPL: state.realizedPL,
        holdings: state.holdings,
        orders: state.orders,
        conditionalOrders: state.conditionalOrders,
        dividends: state.dividends,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
)

/**
 * Menunggu hingga Zustand Persist selesai menghidrasi data dari localStorage ke memori.
 * Sangat penting untuk mencegah race condition di mana halaman me-refresh dan memicu
 * loadPortfolioFromDatabase sebelum localStorage selesai dibaca.
 */
export async function waitForPortfolioHydration(): Promise<void> {
  if (typeof window === 'undefined') return
  if (usePortfolioStore.persist.hasHydrated()) return

  return new Promise<void>((resolve) => {
    if (usePortfolioStore.persist.hasHydrated()) {
      resolve()
      return
    }
    const unsub = usePortfolioStore.persist.onFinishHydration(() => {
      unsub()
      resolve()
    })
    setTimeout(() => {
      resolve()
    }, 400)
  })
}


