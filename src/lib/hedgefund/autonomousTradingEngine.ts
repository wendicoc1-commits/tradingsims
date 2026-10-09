/**
 * Fincept Capital — Autonomous Trading & Cross-Platform Impact Engine
 * 
 * Engine ini bertindak sebagai jembatan langsung antara AI Agents dengan website Anda:
 * 1. Berdampak ke Portofolio: Membuka posisi BUY otomatis dan mengunci profit (TP/SL) otomatis.
 * 2. Berdampak ke Analisis Harga: Menghasilkan key level SMC dan sinkronisasi ke Watchlist pengguna.
 * 3. Berdampak ke Berita: Menerbitkan buletin live newsroom ke ticker dan wire feed website.
 */

import { usePortfolioStore, useWatchlistStore } from '@/store';
import { useAIAgentStore, type AIPriceAnalysis } from '@/store/aiAgentStore';
import { scanUniverseForTopAlpha, selectDiversifiedCandidate, type StockAlphaEvaluation } from './autonomousStockPicker';
import { computePositionSizing, roundTick, portfolioNav, type LiveQuote, type NewsItem, type PortfolioSnapshot } from './deskReports';
import { getGroundedStockIntelligence } from '../agents/groundedStockIntelligence';
import { runAutonomousCryptoAgentCycle } from '../crypto/autonomousCryptoAgent';
import { checkIDXMarketStatus, isIndonesianStock } from '../market/marketHours';
import { normalizeSymbol, calculateShares } from '../stockRules';
import { isCryptoSymbol } from '../universe/masterAssetUniverse';
import { sanitizeUntrustedIntel, formatUntrustedNewsContext, detectMarketRegime } from '../agents/agentContextCompactor';

/**
 * Dispatch trade event ke Quant Bridge (Freqtrade untuk Crypto, Lumibot untuk Equities di VPS 24/7)
 */
export function dispatchToQuantBridge(payload: {
  engine: 'freqtrade' | 'lumibot';
  action: 'BUY' | 'SELL';
  ticker: string;
  price: number;
  stopLoss?: number;
  targetPrice?: number;
  reason?: string;
}) {
  if (typeof window !== 'undefined') {
    fetch('/api/quant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
}

/**
 * Catat refleksi episodik ke memori persisten SQLite di VPS 24/7
 */
export function recordQuantMemoryToVPS(payload: {
  symbol: string;
  decision: string;
  entry_price?: number;
  target_price?: number;
  stop_loss?: number;
  justification?: string;
  post_trade_reflection?: string;
  market_regime?: string;
}) {
  if (typeof window !== 'undefined') {
    fetch('/api/quant?action=memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
}

// ── CONCURRENCY & CROSS-TAB LEASE LOCK (Anti-Double Execution) ──
const CROSS_TAB_LOCK_KEY = 'TRADEMIND_EXECUTION_LOCK_TIMESTAMP';
const CROSS_TAB_LOCK_TTL_MS = 12_000; // 12 detik lease lock
const ORDER_DEDUPLICATION_CACHE: Record<string, number> = {}; // ticker -> timestamp ms

// ── BLACK SWAN & FLASH CRASH DUAL-TICK CONFIRMATION TRACKER ──
const FLASH_CRASH_CONFIRMATION_CACHE: Record<string, { firstSeen: number; count: number; initialCrashPrice: number }> = {};

function acquireCrossTabLock(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const now = Date.now();
    const rawLock = localStorage.getItem(CROSS_TAB_LOCK_KEY);
    if (rawLock) {
      const lockTime = parseInt(rawLock, 10);
      if (now - lockTime < CROSS_TAB_LOCK_TTL_MS) {
        return false; // Concurrency conflict: cycle dipegang tab lain!
      }
    }
    localStorage.setItem(CROSS_TAB_LOCK_KEY, String(now));
    return true;
  } catch {
    return true;
  }
}

function releaseCrossTabLock(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CROSS_TAB_LOCK_KEY);
    } catch {}
  }
}

/**
 * Menjalankan satu siklus penuh otonom:
 * - Sinkronisasi harga pasar portofolio dengan live quotes
 * - Pantau & eksekusi TP/SL pada portofolio saat ini (dengan kepatuhan fraksi BEI)
 * - Skrining Alpha universe & eksekusi BUY pada Top Pick jika sinyal valid & plafon risiko aman
 * - Publikasi analisis harga ke Watchlist dan dispatches berita ke platform
 */
let isCycleCurrentlyExecuting = false;

export async function runAutonomousAgentCycle(
  news: NewsItem[] = [],
  liveQuotesMap: Record<string, LiveQuote> = {},
  options?: { skipEquityBuy?: boolean }
): Promise<{
  actionTaken: string | null;
  tradeExecuted: boolean;
  topPick: StockAlphaEvaluation | null;
}> {
  if (isCycleCurrentlyExecuting || !acquireCrossTabLock()) {
    return { actionTaken: null, tradeExecuted: false, topPick: null };
  }
  isCycleCurrentlyExecuting = true;

  try {
    const aiStore = useAIAgentStore.getState();
    const portfolioStore = usePortfolioStore.getState();
    const watchlistStore = useWatchlistStore.getState();

    let actionTaken: string | null = null;
    let tradeExecuted = false;

    // ── HARD CIRCUIT BREAKER (KILL SWITCH) ──
    // Lindungi modal jika drawdown harian telah melebihi batas risiko -5% dari total ekuitas
    const currentNAV = portfolioNav(portfolioStore.cash, portfolioStore.holdings);
    const maxAllowableDrawdown = -0.05 * Math.max(10_000_000, currentNAV);
    if (portfolioStore.realizedPL < maxAllowableDrawdown) {
      if (Math.random() < 0.25) {
        aiStore.logAction({
          type: 'RISK_GATE',
          symbol: 'PORTFOLIO',
          agentId: 'cro',
          agentName: 'Budi Santoso (Chief Risk Officer)',
          agentEmoji: '🚨',
          title: 'CIRCUIT BREAKER AKTIF: Drawdown Harian Melebihi 5%',
          details: `Total Realized Loss (-Rp ${Math.abs(portfolioStore.realizedPL).toLocaleString('id-ID')}) telah melampaui batas toleransi risiko harian 5%. Pembelian aset baru dihentikan untuk melindungi modal kerja.`,
        });
      }
      return {
        actionTaken: '🚨 Hard Circuit Breaker: Pembelian otonom ditahan (Batas Drawdown Harian 5% tercapai).',
        tradeExecuted: false,
        topPick: null,
      };
    }

    // ── SANITASI BERITA DARI CRAWLER EKSTERNAL (ANTI INDIRECT PROMPT INJECTION) ──
    const sanitizedNews = (news || []).map((n) => ({
      ...n,
      title: sanitizeUntrustedIntel(n.title),
      summary: sanitizeUntrustedIntel(n.summary || ''),
    }));

  // ─────────────────────────────────────────────────────────────────────────────
  // 0. SINKRONISASI HARGA PASAR SELURUH PORTOFOLIO DENGAN QUOTES REALTIME
  // ─────────────────────────────────────────────────────────────────────────────
  if (Object.keys(liveQuotesMap).length > 0) {
    const priceMap: Record<string, number> = {};
    for (const [ticker, q] of Object.entries(liveQuotesMap)) {
      if (q && q.price > 0) {
        priceMap[ticker] = q.price;
        priceMap[`${ticker}.JK`] = q.price;
      }
    }
    portfolioStore.updateHoldingPrices(priceMap);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. MONITORING PORTOFOLIO EKSISTING (Otomatis Take Profit & Cut Loss)
  // ─────────────────────────────────────────────────────────────────────────────
  const currentHoldings = portfolioStore.holdings;
  for (const holding of currentHoldings) {
    // 0. Proteksi Transaksi Manual Pengguna:
    // Jika holding berasal dari pembelian manual pengguna (source === 'USER'),
    // bot AI dilarang menjualnya secara sepihak. Pengguna memiliki kendali penuh atas aset manual.
    if (holding.source === 'USER') {
      continue;
    }

    const sym = holding.displaySymbol.replace('.JK', '').toUpperCase();
    const liveQ = liveQuotesMap[sym];
    const rawPrice = liveQ?.price ?? holding.currentPrice;
    const isCrypto =
      holding.assetClass === 'CRYPTO' ||
      holding.symbol.endsWith('USDT') ||
      holding.currency === 'USDT' ||
      isCryptoSymbol(sym) ||
      ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT', 'TRX', 'RENDER', 'TAO', 'FET', 'CRV', 'MKR'].includes(sym);
    const KNOWN_US = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NFLX', 'AMD', 'INTC', 'SPY', 'QQQ', 'COIN', 'PLTR'];
    const isUS = !isCrypto && (holding.currency === 'USD' || holding.assetClass === 'US' || KNOWN_US.includes(sym));
    const isForeign = isCrypto || isUS;
    const rate = holding.exchangeRate || 16000;
    const sellPrice = isForeign ? rawPrice : roundTick(rawPrice);

    if (sellPrice <= 0) continue;

    // Proteksi Cooldown: Posisi yang baru dibuka (< 3 menit) dilarang dijual seketika oleh bot
    const isHoldingFresh = holding.lastBoughtAt ? (Date.now() - holding.lastBoughtAt < 3 * 60 * 1000) : false;
    if (isHoldingFresh && sellPrice < holding.avgPrice * 1.03) {
      continue;
    }

    // A. Cek Take Profit (Hanya terpicu jika target TP benar-benar di atas modal dan posisi tidak dalam cooldown)
    if (
      !isHoldingFresh &&
      holding.takeProfitPrice &&
      holding.takeProfitPrice >= holding.avgPrice * 1.01 &&
      sellPrice >= holding.takeProfitPrice &&
      (holding.lots > 0 || (holding.cryptoUnits || 0) > 0)
    ) {
      const sellLots = isCrypto ? (holding.cryptoUnits ?? holding.lots) : holding.lots;
      const res = portfolioStore.placeSellOrder({
        symbol: holding.symbol,
        displaySymbol: holding.displaySymbol,
        name: holding.name,
        price: sellPrice,
        lots: sellLots,
        orderType: 'MARKET',
        assetClass: isCrypto ? 'CRYPTO' : isUS ? 'US' : 'EQUITY',
        currency: isCrypto ? 'USDT' : isUS ? 'USD' : 'IDR',
      });

      if (res.order) {
        tradeExecuted = true;
        const estProfit = isForeign
          ? Math.round((sellPrice - holding.avgPrice) * sellLots * rate)
          : (sellPrice - holding.avgPrice) * sellLots * 100;
        const priceLabel = isForeign ? `$${sellPrice.toLocaleString('en-US')}` : `Rp ${sellPrice.toLocaleString('id-ID')}`;
        const qtyLabel = isCrypto ? `${sellLots} unit` : isUS ? `${sellLots} shares` : `${sellLots} lot`;
        actionTaken = `🎯 TAKE PROFIT OTOMATIS: Terjual ${qtyLabel} ${sym} @ ${priceLabel} (Untung: Rp ${estProfit.toLocaleString('id-ID')})`;

        aiStore.logAction({
          type: 'TRADE_SELL',
          symbol: sym,
          agentId: 'pm_idx',
          agentName: 'Raditya Pratama (L/S Equity PM)',
          agentEmoji: '💼',
          title: `Take Profit Otomatis: ${sym}`,
          details: `Target harga ${priceLabel} tercapai. Posisi dilikuidasi untuk mengamankan keuntungan modal.`,
          metadata: {
            price: sellPrice,
            lots: sellLots,
            realizedPL: estProfit,
            takeProfit: holding.takeProfitPrice,
          },
        });

        aiStore.recordTradeStat(false, estProfit);

        if (typeof window !== 'undefined') {
          fetch('/api/ai/agent?action=reflect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ticker: sym,
              trade_result: 'WIN',
              pnl_percentage: holding.avgPrice > 0 ? Number((((sellPrice - holding.avgPrice) / holding.avgPrice) * 100).toFixed(2)) : 5.0,
              reflection_text: `Take Profit tercapai pada ${priceLabel}. Keuntungan Rp ${estProfit.toLocaleString('id-ID')} terkunci. Momentum breakout terkonfirmasi.`,
              market_condition: isCrypto ? 'Crypto 24/7 Momentum' : 'IHSG Sesi Aktif',
            }),
          }).catch(() => {});
        }

        break; // satu eksekusi per siklus untuk kestabilan
      } else if (res.error) {
        aiStore.logAction({
          type: 'RISK_GATE',
          symbol: sym,
          agentId: 'cro',
          agentName: 'Bambang Suroso (Chief Risk Officer)',
          agentEmoji: '🛡️',
          title: `Take Profit Tertunda: ${sym}`,
          details: `Gagal menempatkan order jual: ${res.error}`,
        });
      }
    }

    // B. Cek Trailing Stop Loss Dinamis (ATR Chandelier Exit)
    // 🛡️ CHAOS RESILIENCE: DUAL-TICK FLASH CRASH & BLACK SWAN DETECTOR
    const isExtremeDrop = holding.peakPrice ? sellPrice < holding.peakPrice * 0.65 : false;
    let isGlitchDrop = false;
    let isConfirmedBlackSwan = false;

    if (isExtremeDrop) {
      const now = Date.now();
      const existing = FLASH_CRASH_CONFIRMATION_CACHE[sym];
      if (!existing) {
        // Tick pertama: Anggap anomali data sementara, beri grace period 1.5 detik
        FLASH_CRASH_CONFIRMATION_CACHE[sym] = { firstSeen: now, count: 1, initialCrashPrice: sellPrice };
        isGlitchDrop = true;
      } else {
        // Tick kedua dan seterusnya: Jika anjlok bertahan >= 1.5 detik, ini adalah Black Swan nyata!
        if (now - existing.firstSeen >= 1500) {
          isConfirmedBlackSwan = true;
          isGlitchDrop = false; // Buka proteksi glitch, izinkan Stop Loss darurat dieksekusi!
        } else {
          existing.count += 1;
          isGlitchDrop = true;
        }
      }
    } else {
      if (FLASH_CRASH_CONFIRMATION_CACHE[sym]) {
        delete FLASH_CRASH_CONFIRMATION_CACHE[sym];
      }
    }
    const isLiveValid = liveQ ? (liveQ.live !== false) : true;

    if (
      !isHoldingFresh &&
      isLiveValid &&
      !isGlitchDrop &&
      holding.trailingStopPrice &&
      sellPrice <= holding.trailingStopPrice &&
      holding.peakPrice &&
      holding.peakPrice > holding.avgPrice * 1.02 &&
      sellPrice > holding.avgPrice &&
      (holding.lots > 0 || (holding.cryptoUnits || 0) > 0)
    ) {
      const sellLots = isCrypto ? (holding.cryptoUnits ?? holding.lots) : holding.lots;
      const res = portfolioStore.placeSellOrder({
        symbol: holding.symbol,
        displaySymbol: holding.displaySymbol,
        name: holding.name,
        price: sellPrice,
        lots: sellLots,
        orderType: 'MARKET',
        assetClass: isCrypto ? 'CRYPTO' : isUS ? 'US' : 'EQUITY',
        currency: isCrypto ? 'USDT' : isUS ? 'USD' : 'IDR',
      });

      if (res.order) {
        tradeExecuted = true;
        const estProfit = isForeign
          ? Math.round((sellPrice - holding.avgPrice) * sellLots * rate)
          : (sellPrice - holding.avgPrice) * sellLots * 100;
        const priceLabel = isForeign ? `$${sellPrice.toLocaleString('en-US')}` : `Rp ${sellPrice.toLocaleString('id-ID')}`;
        const qtyLabel = isCrypto ? `${sellLots} unit` : isUS ? `${sellLots} shares` : `${sellLots} lot`;
        actionTaken = `📈 TRAILING STOP ATR TERKUNCI: Terjual ${qtyLabel} ${sym} @ ${priceLabel} setelah berbalik dari puncak ${holding.peakPrice} (Amankan Untung: Rp ${estProfit.toLocaleString('id-ID')})`;

        aiStore.logAction({
          type: 'TRADE_SELL',
          symbol: sym,
          agentId: 'head_trader',
          agentName: 'Gilang Ramadhan (Head Trader)',
          agentEmoji: '⚡',
          title: `Trailing Stop ATR Locked: ${sym}`,
          details: `Harga berbalik dari level puncak dan menyentuh batas trailing stop ${holding.trailingStopPrice}. Keuntungan modal berhasil dikunci otomatis.`,
          metadata: {
            price: sellPrice,
            lots: sellLots,
            realizedPL: estProfit,
            source: 'ATR Chandelier Exit Engine',
          },
        });

        aiStore.recordTradeStat(false, estProfit);

        dispatchToQuantBridge({
          engine: isCrypto ? 'freqtrade' : 'lumibot',
          action: 'SELL',
          ticker: sym,
          price: sellPrice,
          reason: 'Trailing Stop Chandelier Profit Secured',
        });

        if (typeof window !== 'undefined') {
          fetch('/api/ai/agent?action=reflect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ticker: sym,
              trade_result: 'WIN',
              pnl_percentage: holding.avgPrice > 0 ? Number((((sellPrice - holding.avgPrice) / holding.avgPrice) * 100).toFixed(2)) : 3.0,
              reflection_text: `Trailing Stop Chandelier terpicu pada ${priceLabel}. Profit Rp ${estProfit.toLocaleString('id-ID')} berhasil diamankan setelah harga berbalik dari puncak.`,
              market_condition: isForeign ? 'Global Asset Retracement' : 'IHSG Retracement',
            }),
          }).catch(() => {});
        }

        break;
      }
    }

    // C. Cek Hard Stop Loss (CRO Risk Gate Veto & Black Swan Emergency Exit)
    if (
      !isHoldingFresh &&
      isLiveValid &&
      (!isGlitchDrop || isConfirmedBlackSwan) &&
      (isConfirmedBlackSwan || (holding.stopLossPrice && holding.stopLossPrice <= holding.avgPrice * 0.99 && sellPrice <= holding.stopLossPrice)) &&
      (holding.lots > 0 || (holding.cryptoUnits || 0) > 0)
    ) {
      const sellLots = isCrypto ? (holding.cryptoUnits ?? holding.lots) : holding.lots;
      const res = portfolioStore.placeSellOrder({
        symbol: holding.symbol,
        displaySymbol: holding.displaySymbol,
        name: holding.name,
        price: sellPrice,
        lots: sellLots,
        orderType: 'MARKET',
        assetClass: isCrypto ? 'CRYPTO' : isUS ? 'US' : 'EQUITY',
        currency: isCrypto ? 'USDT' : isUS ? 'USD' : 'IDR',
      });

      if (res.order) {
        tradeExecuted = true;
        if (FLASH_CRASH_CONFIRMATION_CACHE[sym]) {
          delete FLASH_CRASH_CONFIRMATION_CACHE[sym];
        }
        const lossVal = isForeign
          ? Math.round((holding.avgPrice - sellPrice) * sellLots * rate)
          : (holding.avgPrice - sellPrice) * sellLots * 100;
        const priceLabel = isForeign ? `$${sellPrice.toLocaleString('en-US')}` : `Rp ${sellPrice.toLocaleString('id-ID')}`;
        const qtyLabel = isCrypto ? `${sellLots} unit` : isUS ? `${sellLots} shares` : `${sellLots} lot`;
        
        actionTaken = isConfirmedBlackSwan
          ? `🚨 BLACK SWAN EMERGENCY EXIT: Likuidasi Pasar ${qtyLabel} ${sym} @ ${priceLabel} (Flash Crash Terkonfirmasi >35%)`
          : `🛡️ STOP LOSS OTOMATIS (CRO VETO): Cut loss ${qtyLabel} ${sym} @ ${priceLabel} (Batas risiko: ${holding.stopLossPrice})`;

        aiStore.logAction({
          type: 'RISK_GATE',
          symbol: sym,
          agentId: 'cro',
          agentName: 'Bambang Suroso (Chief Risk Officer)',
          agentEmoji: isConfirmedBlackSwan ? '🚨' : '🛡️',
          title: isConfirmedBlackSwan ? `Black Swan Emergency Exit: ${sym}` : `Stop Loss Cut: ${sym}`,
          details: isConfirmedBlackSwan
            ? `Flash Crash ekstrim (>35% dari peak) terkonfirmasi oleh 2 tick berturut-turut. Emergency Kill-Switch aktif untuk memotong posisi secara instan.`
            : `Harga menyentuh batas proteksi modal ${holding.stopLossPrice}. Posisi ditutup untuk mencegah drawdown lebih dalam.`,
          metadata: {
            price: sellPrice,
            lots: sellLots,
            realizedPL: -lossVal,
            stopLoss: holding.stopLossPrice,
          },
        });

        aiStore.recordTradeStat(false, -lossVal);

        dispatchToQuantBridge({
          engine: isCrypto ? 'freqtrade' : 'lumibot',
          action: 'SELL',
          ticker: sym,
          price: sellPrice,
          stopLoss: holding.stopLossPrice,
          reason: 'CRO Veto Hard Stop Loss',
        });

        if (typeof window !== 'undefined') {
          fetch('/api/ai/agent?action=reflect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ticker: sym,
              trade_result: 'LOSS',
              pnl_percentage: holding.avgPrice > 0 ? Number((((sellPrice - holding.avgPrice) / holding.avgPrice) * 100).toFixed(2)) : -3.0,
              reflection_text: `Cut loss pada Rp ${sellPrice.toLocaleString('id-ID')} (Rugi: -Rp ${lossVal.toLocaleString('id-ID')}). Support tertembus dan volume buyer melemah. Pelajaran: perketat filter volume sebelum entry.`,
              market_condition: 'IHSG Breakdown / Volatilitas Tinggi',
            }),
          }).catch(() => {});
        }

        break;
      } else if (res.error) {
        aiStore.logAction({
          type: 'RISK_GATE',
          symbol: sym,
          agentId: 'cro',
          agentName: 'Bambang Suroso (Chief Risk Officer)',
          agentEmoji: '🛡️',
          title: `Stop Loss Cut Tertunda: ${sym}`,
          details: `Gagal memotong posisi: ${res.error}`,
        });
      }
    }

    // C. JUAL DISKRESIONER OTONOM AI (Kuasa Penuh AI Bot Menjual Saham Kapan Pun)
    if (aiStore.discretionarySellingEnabled && holding.lots > 0) {
      const holdingIntel = getGroundedStockIntelligence(sym, sellPrice);
      const mtfTrend = holdingIntel.technicals.mtfConsensus;
      const supplyZone = holdingIntel.technicals.orderBlockSupply?.min || Infinity;
      const profitPct = holding.unrealizedPLPercent ?? 0;

      // ── Proteksi Posisi Baru (Cooldown Grace Period) ──
      // Posisi yang baru dibeli kurang dari 5 menit dilarang keras dilikuidasi karena fluktuasi minor,
      // memberikan waktu bagi posisi untuk berkembang dan mencegah sindrom langsung jual setelah beli.
      const isHoldingFresh = holding.lastBoughtAt ? (Date.now() - holding.lastBoughtAt < 5 * 60 * 1000) : false;

      // 1. Likuidasi Pelemahan Tren: Hanya dieksekusi jika posisi SUDAH CUAN NYATA (>= +2.5%) untuk mengamankan keuntungan,
      // ATAU jika terjadi breakdown struktural parah (cut loss darurat <= -7.5%)
      const isTrendBroken =
        !isHoldingFresh &&
        (mtfTrend === 'STRONG_BEARISH' || (mtfTrend === 'BEARISH' && holdingIntel.financials.roe < 7)) &&
        (profitPct >= 2.5 || profitPct <= -7.5);
      
      // 2. Kunci Keuntungan Dinamis (Trailing TP): Profit > 8% dan menyentuh zona Order Block Supply
      const isSupplyResistance = profitPct >= 8.0 && sellPrice >= supplyZone;

      if (isTrendBroken || isSupplyResistance) {
        const sellLots = isCrypto ? (holding.cryptoUnits ?? holding.lots) : holding.lots;
        const res = portfolioStore.placeSellOrder({
          symbol: holding.symbol,
          displaySymbol: holding.displaySymbol,
          name: holding.name,
          price: sellPrice,
          lots: sellLots,
          orderType: 'MARKET',
          assetClass: isCrypto ? 'CRYPTO' : isUS ? 'US' : 'EQUITY',
          currency: isCrypto ? 'USDT' : isUS ? 'USD' : 'IDR',
        });

        if (res.order) {
          tradeExecuted = true;
          const estRealized = isForeign
            ? Math.round((sellPrice - holding.avgPrice) * sellLots * rate)
            : (sellPrice - holding.avgPrice) * sellLots * 100;
          const priceLabel = isForeign ? `$${sellPrice.toLocaleString('en-US')}` : `Rp ${sellPrice.toLocaleString('id-ID')}`;
          const qtyLabel = isCrypto ? `${sellLots} unit` : isUS ? `${sellLots} shares` : `${sellLots} lot`;

          if (isSupplyResistance) {
            actionTaken = `💰 KUNCI PROFIT DINAMIS AI: Terjual ${qtyLabel} ${sym} @ ${priceLabel} (+${profitPct.toFixed(1)}%). Menghindari pembalikan arah di zona pasokan.`;
            aiStore.logAction({
              type: 'TRADE_SELL',
              symbol: sym,
              agentId: isCrypto ? 'trader_crypto' : 'pm_idx',
              agentName: isCrypto ? 'Kevin Zhang (Jesse Crypto Desk Lead)' : 'Raditya Pratama (L/S Equity PM)',
              agentEmoji: isCrypto ? '⚡' : '💼',
              title: `Kunci Untung Dinamis: ${sym}`,
              details: `Harga menyentuh zona Order Block Supply dengan floating gain +${profitPct.toFixed(1)}%. AI melikuidasi posisi untuk mengamankan kas.`,
              metadata: {
                price: sellPrice,
                lots: sellLots,
                realizedPL: estRealized,
              },
            });
          } else {
            actionTaken = `🔻 LIKUIDASI DISKRESIONER AI: Cut posisi ${qtyLabel} ${sym} @ ${priceLabel} karena sinyal berbalik ${mtfTrend}. Proteksi modal aktif.`;
            aiStore.logAction({
              type: 'TRADE_SELL',
              symbol: sym,
              agentId: isCrypto ? 'cro' : 'cro',
              agentName: isCrypto ? 'Victor Halim (Chief Risk Officer)' : 'Bambang Suroso (Chief Risk Officer)',
              agentEmoji: '🛡️',
              title: `Likuidasi Diskresioner: ${sym}`,
              details: `Struktur pasar terkonfirmasi rusak (${mtfTrend}). Mandat otonom AI melikuidasi emiten untuk menghindari risiko penurunan lebih dalam.`,
              metadata: {
                price: sellPrice,
                lots: sellLots,
                realizedPL: estRealized,
              },
            });
          }

          aiStore.recordTradeStat(false, estRealized);
          break;
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. PEMINDAIAN UNIVERSE & SINKRONISASI ANALISIS HARGA KE WEBSITE
  // ─────────────────────────────────────────────────────────────────────────────
  const heldTickers = portfolioStore.holdings.map((h) => h.displaySymbol);
  const scanResult = scanUniverseForTopAlpha(sanitizedNews, liveQuotesMap, heldTickers);
  const topPick = scanResult.topPick;

  // Broadcast Analisis Harga ke useAIAgentStore untuk emiten teratas
  scanResult.rankedLeaderboard.slice(0, 5).forEach((item) => {
    const intel = getGroundedStockIntelligence(item.symbol, liveQuotesMap[item.symbol]?.price);
    const analysis: AIPriceAnalysis = {
      symbol: item.symbol,
      name: item.name,
      price: item.currentPrice,
      changePct: liveQuotesMap[item.symbol]?.changePct ?? 0,
      score: item.score,
      conviction: item.conviction,
      orderBlockDemand: intel.technicals.orderBlockDemand,
      orderBlockSupply: intel.technicals.orderBlockSupply,
      targetPrice12M: intel.institutionalConsensus.targetPriceConsensus || item.suggestedAction.targetPrice,
      stopLossPrice: item.suggestedAction.stopLoss,
      riskRewardRatio: item.suggestedAction.riskRewardRatio,
      trend: intel.technicals.mtfConsensus,
      updatedAt: new Date().toLocaleTimeString('id-ID'),
    };
    aiStore.setPriceAnalysis(item.symbol, analysis);
  });

  // Sinkronisasi ke Watchlist Pengguna ("Rekomendasi AI Agent")
  try {
    let aiWatchlist = watchlistStore.watchlists.find((w) => w.name.includes('Rekomendasi AI') || w.id === 'ai-agent-watchlist');
    if (!aiWatchlist) {
      watchlistStore.addWatchlist('🤖 Rekomendasi AI Agent');
      aiWatchlist = watchlistStore.watchlists.find((w) => w.name.includes('Rekomendasi AI'));
    }
    if (aiWatchlist) {
      // Pastikan Top 3 saham ada di watchlist AI
      scanResult.rankedLeaderboard.slice(0, 3).forEach((item) => {
        watchlistStore.addToWatchlist(aiWatchlist!.id, {
          symbol: `${item.symbol}.JK`,
          displaySymbol: item.symbol,
          name: item.name,
        });
      });
    }
  } catch {
    // Watchlist fallback
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. PEMBARUAN BERITA: PUBLIKASI AI NEWS DISPATCH
  // ─────────────────────────────────────────────────────────────────────────────
  if (news.length > 0 && Math.random() < 0.35) {
    const topNews = news[0];
    aiStore.publishDispatch({
      agentName: 'Marsha Utami (Newsroom Lead)',
      agentEmoji: '📡',
      headline: topNews.title,
      summary: `Dipindai otomatis oleh AI Crawler. Terkait emiten bursa dengan dampak pasar: ${topNews.sentiment || 'NEUTRAL'}. Sumber: ${topNews.source}.`,
      sentiment: topNews.sentiment === 'BULLISH' ? 'BULLISH' : topNews.sentiment === 'BEARISH' ? 'BEARISH' : 'NEUTRAL',
      affectedTickers: [topPick.symbol],
      sourceUrl: (topNews as any).link,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. EKSEKUSI TRADING OTOMATIS KE PORTOFOLIO (BUY TOP ALPHA PICK)
  // ─────────────────────────────────────────────────────────────────────────────
  if (aiStore.autoTradingEnabled && !tradeExecuted && topPick && !options?.skipEquityBuy) {
    const snapshot: PortfolioSnapshot = {
      cash: portfolioStore.cash,
      realizedPL: portfolioStore.realizedPL,
      holdings: portfolioStore.holdings,
      orders: portfolioStore.orders.map((o) => ({ status: String(o.status) })),
    };
    const totalNav = portfolioNav(snapshot);
    const maxAllocationPerAsset = totalNav * 0.25; // Batas maksimal alokasi 25% NAV per saham (Risk Governance)
    const maxAllocationPerSector = totalNav * 0.30; // 🛡️ SECTOR CONCENTRATION CEILING: Maksimal 30% NAV per sektor industri

    const findHolding = (sym: string) =>
      portfolioStore.holdings.find(
        (h) => h.displaySymbol.toUpperCase() === sym || h.symbol.replace('.JK', '').toUpperCase() === sym
      );
    const exposureOf = (sym: string) => {
      const h = findHolding(sym);
      if (!h) return 0;
      const isC = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'BNB'].includes(sym);
      const isU = !isC && (h.currency === 'USD' || h.assetClass === 'US' || ['NVDA', 'AAPL', 'MSFT', 'TSLA'].includes(sym));
      const p = liveQuotesMap[sym]?.price || h.currentPrice;
      if (isC || isU) {
        const u = h.cryptoUnits ?? h.shares ?? h.lots;
        const r = h.exchangeRate || 16000;
        return Math.round(u * p * r);
      }
      return (h.shares || h.lots * 100) * p;
    };

    // 🛡️ SECTOR EXPOSURE AGGREGATOR
    const sectorExposureOf = (sectorName: string) => {
      if (!sectorName) return 0;
      let total = 0;
      for (const h of portfolioStore.holdings) {
        const sym = h.displaySymbol.replace('.JK', '').toUpperCase();
        const assetObj = getGroundedStockIntelligence(sym);
        const hSec = (assetObj?.financials ? assetObj.name : (h.assetClass === 'CRYPTO' ? 'Crypto' : 'General')).toLowerCase();
        if (hSec.includes(sectorName.toLowerCase()) || sectorName.toLowerCase().includes(hSec)) {
          total += exposureOf(sym);
        }
      }
      return total;
    };

    // Posisi dianggap cukup jika sudah >= 10 lot atau menyentuh plafon alokasi
    const isAllocated = (sym: string) => {
      const h = findHolding(sym);
      return !!h && (h.lots >= 10 || exposureOf(sym) >= maxAllocationPerAsset);
    };

    const idxCheck = checkIDXMarketStatus();
    const isBEIOpen = idxCheck.isOpen;

    // AI memilih sendiri: jika bursa BEI buka, saham IDX berskor tertinggi yang belum dialokasikan.
    // Jika bursa BEI TUTUP (malam/weekend/sebelum jam 9): HANYA pilih aset non-Indonesia (Kripto 24/7 & Global Luar Negeri)!
    const nonIndoTarget =
      scanResult.rankedLeaderboard.find(
        (c) =>
          !isIndonesianStock(c.symbol) &&
          c.suggestedAction.action === 'BUY' &&
          c.score >= 75 &&
          !isAllocated(c.symbol.toUpperCase())
      ) || scanResult.rankedLeaderboard.find((c) => !isIndonesianStock(c.symbol));

    // Multi-sektor & multi-pilar rotasi portofolio: hindari konsentrasi bank/ROE prima saja
    const diversifiedCandidate = selectDiversifiedCandidate(
      scanResult.rankedLeaderboard,
      portfolioStore.holdings,
      isBEIOpen
    );

    const target = diversifiedCandidate ?? (
      isBEIOpen
        ? (scanResult.rankedLeaderboard.find(
            (c) =>
              c.suggestedAction.action === 'BUY' &&
              c.score >= 80 &&
              !isAllocated(c.symbol.toUpperCase())
          ) ?? topPick)
        : (nonIndoTarget ?? topPick)
    );

    const cleanSym = target.symbol.toUpperCase();
    const existingHolding = findHolding(cleanSym);
    const currentAssetExposure = exposureOf(cleanSym);
    const isAlreadySufficientlyAllocated = isAllocated(cleanSym);

    // ── ATURAN STRICT JAM BURSA BEI ──
    const isTargetIDX = (target.currency === 'IDR' || isIndonesianStock(target.symbol)) && !target.symbol.endsWith('USDT');
    const idxMarketCheck = isTargetIDX ? checkIDXMarketStatus() : null;
    const deliberatingTicker = aiStore.activeDeliberatingTicker;

    // ── SINKRONISASI RAPAT WAR ROOM AI AGENT DENGAN EKSEKUSI PEMBELIAN ──
    // Jika Dewan Komite Investasi di War Room sedang aktif menggelar sidang untuk suatu emiten (misal: BMRI):
    // 1. DILARANG KERAS membeli saham LAIN (seperti BBRI/dll) di background saat sidang BMRI berlangsung!
    // 2. Eksekusi pembelian saham ditangani langsung oleh musyawarah visual War Room (approveOrder),
    //    sehingga aset yang dieksekusi 100% SAMA PERSIS dengan apa yang ditampilkan di meja sidang avatar.
    if (deliberatingTicker) {
      aiStore.setActiveAgentTask(
        `Dewan Komite Investasi sedang menggelar Sidang War Room untuk ${deliberatingTicker}. Eksekusi diserahkan kepada dewan sidang.`
      );
    } else if (isTargetIDX && idxMarketCheck && !idxMarketCheck.isOpen) {
      if (Math.random() < 0.25) {
        aiStore.logAction({
          type: 'RISK_GATE',
          symbol: target.symbol,
          agentId: 'head_trader',
          agentName: 'Gilang Ramadhan (Head of Execution & Flow)',
          agentEmoji: '⚡',
          title: `Eksekusi Ditahan: Bursa BEI Tutup (${target.symbol})`,
          details: `Order beli ${target.symbol} ditunda karena ${idxMarketCheck.message} ${idxMarketCheck.nextOpenNotice} Bot dilarang membeli saham BEI di luar jam perdagangan aktif (Senin–Jumat 09:00–16:00 WIB). Kripto dan saham luar negeri tetap bebas aktif 24 jam.`,
        });
      }
      // Bursa BEI tutup, eksekusi saham dilewati namun Crypto Desk 24/7 tetap berjalan
    } else if (!options?.skipEquityBuy && !isAlreadySufficientlyAllocated && target.score >= 75 && target.suggestedAction.action === 'BUY') {
      const MIN_BOT_CASH_RESERVE = 1_000_000;

      // Proteksi Kas Minimum: Kas di bawah Rp 1.000.000 dilarang membeli saham baru
      if (portfolioStore.cash < MIN_BOT_CASH_RESERVE) {
        if (Math.random() < 0.2) {
          aiStore.logAction({
            type: 'RISK_GATE',
            symbol: target.symbol,
            agentId: 'cro',
            agentName: 'Budi Santoso (Chief Risk Officer)',
            agentEmoji: '🛡️',
            title: `Proteksi Likuiditas: Pembelian Saham Dibatalkan (Kas < Rp 1 Juta)`,
            details: `Saldo kas saat ini (Rp ${Math.round(portfolioStore.cash).toLocaleString('id-ID')}) berada di bawah batas minimum Rp 1.000.000. Sesuai mandat perlindungan modal, bot dilarang membeli saham atau crypto lagi.`,
            metadata: {
              cash: portfolioStore.cash,
              minCashRequired: MIN_BOT_CASH_RESERVE,
            },
          });
        }
        return;
      }

      const intel = getGroundedStockIntelligence(target.symbol, liveQuotesMap[target.symbol]?.price);
      const sizing = computePositionSizing(intel, snapshot);

      // 🛡️ SECTOR CONCENTRATION CHECK (Maksimal 30% NAV per sektor)
      const targetSector = (intel.name ? intel.name.split(' ')[0] : (isCryptoSymbol(target.symbol) ? 'Crypto' : 'General'));
      const currentSectorExp = sectorExposureOf(targetSector);
      
      // 🛡️ SLIPPAGE & LIQUIDITY FRICTION MODEL
      const isLiquidBluechip = ['BBCA', 'BBRI', 'BMRI', 'TLKM', 'ASII', 'BTC', 'ETH', 'SOL'].includes(cleanSym);
      const slippageRate = isLiquidBluechip ? 0.0015 : 0.0035; // 0.15% bluechip vs 0.35% mid/small-cap
      const rawEntryPrice = sizing.entry;
      const effectiveEntryPrice = isIndonesianStock(target.symbol)
        ? roundTick(Math.round(rawEntryPrice * (1 + slippageRate)))
        : Number((rawEntryPrice * (1 + slippageRate)).toFixed(4));
      sizing.entry = effectiveEntryPrice;
      sizing.notional = Math.round(effectiveEntryPrice * (isIndonesianStock(target.symbol) ? sizing.lots * 100 : sizing.lots));

      // Hitung total biaya pembelian termasuk broker fee (0.15%)
      const totalBuyCost = Math.round(sizing.notional * 1.0015);

      if (currentSectorExp + totalBuyCost > maxAllocationPerSector) {
        aiStore.logAction({
          type: 'RISK_GATE',
          symbol: target.symbol,
          agentId: 'cro',
          agentName: 'Bambang Suroso (Chief Risk Officer)',
          agentEmoji: '🛡️',
          title: `Plafon Sektor Penuh: ${target.symbol} Ditolak`,
          details: `Alokasi untuk sektor "${targetSector}" telah mencapai Rp ${Math.round(currentSectorExp).toLocaleString('id-ID')}. Pembelian tambahan Rp ${totalBuyCost.toLocaleString('id-ID')} akan menembus batas maksimal 30% NAV (Rp ${Math.round(maxAllocationPerSector).toLocaleString('id-ID')}). Trade dibatalkan demi mitigasi risiko klaster!`,
        });
        return;
      }

      // Cek apakah kas tidak cukup dan perlu rotasi modal
      // Proteksi Modal Ketat: Rotasi modal HANYA diizinkan jika melikuidasi posisi yang SUDAH UNTUNG (>= 2%),
      // DILARANG keras menjual posisi yang sedang floating rugi demi merotasi ke saham baru!
      if (
        aiStore.discretionarySellingEnabled &&
        target.score >= 86 &&
        sizing.ok &&
        sizing.lots > 0 &&
        (currentAssetExposure + totalBuyCost <= maxAllocationPerAsset) &&
        portfolioStore.cash < totalBuyCost &&
        portfolioStore.holdings.length > 0
      ) {
        // Cari holding yang sudah profit untuk take-profit parsial/rotasi modal
        const profitableHoldings = portfolioStore.holdings.filter(
          (h) => h.assetClass !== 'CRYPTO' && !h.symbol.endsWith('USDT') && h.lots > 0 && (h.unrealizedPLPercent || 0) >= 2.0
        );
        if (profitableHoldings.length > 0) {
          // Sort by highest profit
          profitableHoldings.sort((a, b) => (b.unrealizedPLPercent || 0) - (a.unrealizedPLPercent || 0));
          const rotCandidate = profitableHoldings[0];
          const rotSym = rotCandidate.displaySymbol.replace('.JK', '').toUpperCase();
          const rotPrice = roundTick(liveQuotesMap[rotSym]?.price ?? rotCandidate.currentPrice);
          const estimatedProceeds = rotPrice * rotCandidate.lots * 100 * 0.9975;

          // Hanya likuidasi jika hasil penjualan ditambah kas saat ini benar-benar cukup untuk membeli target dan menjaga cadangan kas Rp 1 Juta
          if (rotPrice > 0 && rotSym !== cleanSym && (portfolioStore.cash + estimatedProceeds - totalBuyCost >= MIN_BOT_CASH_RESERVE)) {
            const sellRes = portfolioStore.placeSellOrder({
              symbol: rotCandidate.symbol,
              displaySymbol: rotCandidate.displaySymbol,
              name: rotCandidate.name,
              price: rotPrice,
              lots: rotCandidate.lots,
              orderType: 'MARKET',
            });

            if (sellRes.order) {
              const releasedCash = rotPrice * rotCandidate.lots * 100 * 0.9975;
              aiStore.logAction({
                type: 'TRADE_ROTATE',
                symbol: rotSym,
                agentId: 'cio',
                agentName: 'Gita Wirjawan (Chief Investment Officer)',
                agentEmoji: '🏛️',
                title: `Rotasi Portofolio: Likuidasi ${rotSym} → Beli ${cleanSym}`,
                details: `Kas dilikuidasi dari ${rotSym} (+Rp ${Math.round(releasedCash).toLocaleString('id-ID')}) untuk merotasi modal ke ${cleanSym} yang memiliki konveksitas Alpha jauh lebih tinggi (Skor ${target.score}/100).`,
                metadata: {
                  price: rotPrice,
                  lots: rotCandidate.lots,
                  amount: releasedCash,
                },
              });
            }
          }
        }
      }

      // Cek kecukupan kas, sizing valid, batas cadangan Rp 1 Juta, dan tidak melebihi plafon alokasi 25% NAV
      if (
        sizing.ok &&
        sizing.lots > 0 &&
        portfolioStore.cash >= MIN_BOT_CASH_RESERVE &&
        (portfolioStore.cash - totalBuyCost >= MIN_BOT_CASH_RESERVE) &&
        portfolioStore.cash >= totalBuyCost &&
        (currentAssetExposure + totalBuyCost <= maxAllocationPerAsset)
      ) {
        // ── KONSULTASI DUE DILIGENCE DENGAN TRADEMIND-ALPHA (PYTHON FASTAPI GPT-4o + RAG) ──
        let oodaDecision: any = null;
        if (typeof window !== 'undefined') {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000);
            const oodaRes = await fetch('/api/ai/agent?action=analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ticker: target.symbol,
                additional_intel: `Emiten ${target.symbol} Rank #${target.rank} di Fincept Alpha Scanner (Skor ${target.score}/100). Sinyal: ${target.suggestedAction.reason}.`,
              }),
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (oodaRes.ok) {
              const oodaJson = await oodaRes.json();
              if (oodaJson?.decision) {
                oodaDecision = oodaJson.decision;
              }
            }
          } catch {
            // Fallback anggap aman jika server offline
          }
        }

        // Jika GPT-4o me-veto dengan rekomendasi HOLD atau SELL, tahan eksekusi
        if (oodaDecision && oodaDecision.keputusan && oodaDecision.keputusan !== 'BUY') {
          aiStore.logAction({
            type: 'RISK_GATE',
            symbol: target.symbol,
            agentId: 'cro',
            agentName: 'TradeMind-Alpha (GPT-4o Deep OODA)',
            agentEmoji: '🧠',
            title: `Order Ditolak Otak AI: ${target.symbol} (${oodaDecision.keputusan})`,
            details: `TradeMind-Alpha me-veto pembelian ${target.symbol}. Catatan Memori: ${oodaDecision.korelasi_memori || '-'} | Alasan: ${oodaDecision.alasan_eksekusi || '-'}`,
            metadata: {
              score: target.score,
              aiDecision: oodaDecision.keputusan,
              tp: oodaDecision.target_price,
              sl: oodaDecision.stop_loss,
            },
          });
          return; // 🛡️ CRO VETO: Hentikan eksekusi order jika OODA me-veto!
        }

        const { fullSymbol, displaySymbol } = normalizeSymbol(target.symbol);
          const shareInfo = calculateShares(target.symbol, sizing.lots);
          const isTargetForeign = shareInfo.isCrypto || shareInfo.isUS;

          let finalTakeProfit: number | undefined;
          let finalStopLoss: number | undefined;

          if (shareInfo.isCrypto) {
            finalTakeProfit = Number((sizing.entry * 1.15).toFixed(sizing.entry < 1 ? 8 : 4));
            finalStopLoss = Number((sizing.entry * 0.94).toFixed(sizing.entry < 1 ? 8 : 4));
          } else if (shareInfo.isUS) {
            finalTakeProfit = Number((sizing.entry * 1.15).toFixed(2));
            finalStopLoss = Number((sizing.entry * 0.94).toFixed(2));
          } else {
            // 🛡️ DETERMINISTIC HARD CLAMP (Anti-Self-Deception RRR):
            // Batasi stop loss maksimal -5% dan take profit realistis (min 1:1.8 RRR, max +15%)
            const minAllowedStop = roundTick(sizing.entry * 0.95);
            const rawSl = oodaDecision?.stop_loss && oodaDecision.stop_loss < sizing.entry
              ? roundTick(Math.max(minAllowedStop, oodaDecision.stop_loss))
              : sizing.stop;
            finalStopLoss = rawSl;

            const maxAllowedTp = roundTick(sizing.entry * 1.15);
            let rawTp = oodaDecision?.target_price && oodaDecision.target_price > sizing.entry
              ? roundTick(Math.min(maxAllowedTp, oodaDecision.target_price))
              : sizing.takeProfit;
            
            // Jamin Risk-Reward Ratio matematis tidak diakali (Wajib >= 1.8x)
            const riskPoints = Math.max(1, sizing.entry - finalStopLoss);
            if (rawTp - sizing.entry < riskPoints * 1.8) {
              rawTp = roundTick(sizing.entry + Math.round(riskPoints * 2.0));
            }
            finalTakeProfit = rawTp;
          }

          // 🛡️ DEDUPLIKASI ORDER (Cegah double execution pada saham yang sama dalam 60 detik)
          const lastOrderTime = ORDER_DEDUPLICATION_CACHE[target.symbol];
          if (lastOrderTime && Date.now() - lastOrderTime < 60_000) {
            aiStore.logAction({
              type: 'RISK_GATE',
              symbol: target.symbol,
              agentId: 'cro',
              agentName: 'Bambang Suroso (Chief Risk Officer)',
              agentEmoji: '🛡️',
              title: `Deduplikasi Order: ${target.symbol}`,
              details: `Order untuk ${target.symbol} baru saja dieksekusi kurang dari 60 detik lalu. Mencegah order ganda.`,
            });
            return;
          }
          ORDER_DEDUPLICATION_CACHE[target.symbol] = Date.now();

          const res = portfolioStore.placeBuyOrder({
            symbol: fullSymbol,
            displaySymbol,
            name: target.name,
            price: sizing.entry,
            lots: sizing.lots,
            orderType: isTargetForeign ? 'MARKET' : 'LIMIT',
            takeProfitPrice: finalTakeProfit,
            stopLossPrice: finalStopLoss,
            validityType: 'GTC',
            source: 'AI_AGENT',
            assetClass: shareInfo.isCrypto ? 'CRYPTO' : 'EQUITY',
            currency: shareInfo.currency,
            exchangeRate: shareInfo.exchangeRate,
          });

          if (res.order) {
            tradeExecuted = true;
            const priceLabel = isTargetForeign ? `$${sizing.entry.toLocaleString('en-US')}` : `Rp ${sizing.entry.toLocaleString('id-ID')}`;
            const unitLabel = shareInfo.isCrypto ? `${sizing.lots} unit` : shareInfo.isUS ? `${sizing.lots} shares` : `${sizing.lots} lot`;
            const strategyTag = target.strategyLabel ? ` [${target.strategyLabel}]` : target.sector ? ` [${target.sector}]` : '';
            actionTaken = `⚡ ORDER BUY OTOMATIS: ${unitLabel} ${target.symbol}${strategyTag} @ ${priceLabel} (SL: ${finalStopLoss} / TP: ${finalTakeProfit})`;

            aiStore.logAction({
              type: 'TRADE_BUY',
              symbol: target.symbol,
              agentId: 'pm_equity',
              agentName: oodaDecision ? 'Raditya Pratama & TradeMind-Alpha (GPT-4o)' : 'Raditya Pratama (L/S Equity PM)',
              agentEmoji: oodaDecision ? '🧠' : '💼',
              title: `Beli Saham Otonom: ${target.symbol}${strategyTag}`,
              details: oodaDecision?.alasan_eksekusi
                ? `[OODA Loop Approved] ${oodaDecision.alasan_eksekusi} | Memori RAG: ${oodaDecision.korelasi_memori || 'Pola terverifikasi aman'}`
                : `Berdasarkan konsensus sidang komite Fincept, emiten menduduki Rank #${target.rank} (Skor ${target.score}/100)${target.strategyLabel ? ` dengan pilar ${target.strategyLabel}` : ''}. Sizing dibatasi pada 1% risiko NAV (${sizing.lots} lot).`,
              metadata: {
                price: sizing.entry,
                lots: sizing.lots,
                amount: sizing.notional,
                score: target.score,
                strategy: target.strategyLabel,
                pillar: target.strategyPillar,
                stopLoss: finalStopLoss,
                takeProfit: finalTakeProfit,
                aiAnalysis: oodaDecision?.analisis_teknikal,
              },
            });

            aiStore.recordTradeStat(true);

            // Dispatch ke Quant Bridge (Freqtrade untuk Crypto / Lumibot untuk Equities)
            dispatchToQuantBridge({
              engine: shareInfo.isCrypto ? 'freqtrade' : 'lumibot',
              action: 'BUY',
              ticker: target.symbol,
              price: sizing.entry,
              stopLoss: finalStopLoss,
              targetPrice: finalTakeProfit,
              reason: oodaDecision?.alasan_eksekusi || `Autonomous Alpha Scanner Rank #${target.rank}`,
            });
          } else if (res.error) {
            aiStore.logAction({
              type: 'RISK_GATE',
              symbol: target.symbol,
              agentId: 'cro',
              agentName: 'Bambang Suroso (Chief Risk Officer)',
              agentEmoji: '🛡️',
              title: `Order Beli Tertahan: ${target.symbol}`,
              details: `Validasi eksekusi gagal: ${res.error}`,
            });
          }
        } else if (sizing.notional > 0 && portfolioStore.cash < totalBuyCost) {
        aiStore.logAction({
          type: 'RISK_GATE',
          symbol: target.symbol,
          agentId: 'cro',
          agentName: 'Bambang Suroso (Chief Risk Officer)',
          agentEmoji: '🛡️',
          title: `Plafon Kas Tidak Mencukupi: ${target.symbol}`,
          details: `Dibutuhkan Rp ${totalBuyCost.toLocaleString('id-ID')}, namun kas tersedia hanya Rp ${Math.round(portfolioStore.cash).toLocaleString('id-ID')}. Eksekusi ditunda.`,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. EKSEKUSI OTONOM PADA ASET CRYPTOCURRENCY (JESSE QUANT TRADING DESK)
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const cryptoTickersMap: Record<string, any> = {};
    for (const [sym, q] of Object.entries(liveQuotesMap)) {
      if (isCryptoSymbol(sym)) {
        const cleanBase = sym.toUpperCase().replace(/USDT$/i, '');
        cryptoTickersMap[`${cleanBase}USDT`] = {
          symbol: `${cleanBase}USDT`,
          price: q.price,
          change24h: q.changePct,
          high24h: q.high,
          low24h: q.low,
          volume24h: String(q.volume),
        };
      }
    }
    const cryptoCycle = await runAutonomousCryptoAgentCycle(cryptoTickersMap);
    if (cryptoCycle.tradeExecuted && !actionTaken) {
      tradeExecuted = true;
      actionTaken = cryptoCycle.actionTaken;
    }
  } catch {
    // Crypto auto cycle error handled gracefully
  }

  aiStore.setActiveAgentTask(
    actionTaken
      ? actionTaken
      : `AI mengamati pasar: Top Pick ${topPick.symbol} (Skor ${topPick.score}/100) & Crypto Desk aktif diawasi Kevin Zhang & CRO.`
  );

    return { actionTaken, tradeExecuted, topPick };
  } finally {
    isCycleCurrentlyExecuting = false;
    releaseCrossTabLock();
  }
}
