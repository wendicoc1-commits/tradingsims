/**
 * Fincept Capital — Autonomous AI Crypto Trading Agent
 * 
 * Terinspirasi langsung dari framework Jesse AI (https://github.com/jesse-ai/jesse):
 * Agen otonom khusus aset kripto yang bertindak 24/7:
 * 1. Menjalankan evaluasi strategi kuantitatif Jesse (Trend Following, RSI Mean Reversion, Breakout).
 * 2. Mengambil keputusan BUY pada koin dengan Alpha & konveksitas tertinggi.
 * 3. Menjaga batas risiko independen (Stop Loss, Take Profit, dan batas alokasi modal NAV).
 * 4. Berdampak langsung ke portofolio pengguna: saldo kas RDN Rupiah dikonversi ke koin dan profit dikunci otomatis.
 */

import { usePortfolioStore } from '@/store';
import { useAIAgentStore } from '@/store/aiAgentStore';
import {
  SUPPORTED_CRYPTO_PAIRS,
  evaluateJesseStrategy,
  type CryptoAssetMeta,
  type JesseStrategySignal,
} from './jesseCryptoEngine';
import type { BinanceTickerData } from '@/hooks/useBinanceLivePrices';

export interface CryptoAlphaRanking {
  asset: CryptoAssetMeta;
  signal: JesseStrategySignal;
  compositeScore: number;
}

/**
 * Memindai seluruh semesta koin kripto menggunakan strategi Jesse AI
 */
export function scanCryptoUniverse(
  tickerMap: Record<string, BinanceTickerData> = {}
): {
  leaderboard: CryptoAlphaRanking[];
  topPick: CryptoAlphaRanking | null;
  timestamp: string;
} {
  const fallbackMap: Record<string, number> = {
    BTCUSDT: 68450, ETHUSDT: 2450, SOLUSDT: 154, BNBUSDT: 585, DOGEUSDT: 0.125,
    XRPUSDT: 0.54, ADAUSDT: 0.35, AVAXUSDT: 26.5, SUIUSDT: 1.85, NEARUSDT: 4.80,
    LINKUSDT: 11.5, PEPEUSDT: 0.0000095,
  };

  const ranked: CryptoAlphaRanking[] = SUPPORTED_CRYPTO_PAIRS.map((asset) => {
    const t = tickerMap[asset.symbol] || tickerMap[asset.baseAsset];
    const price = t?.price ?? fallbackMap[asset.symbol] ?? 10;
    const change24h = t?.change24h ?? 1.5;

    const signal = evaluateJesseStrategy(asset.symbol, price, change24h);

    // Skor komposit (0 - 100)
    let score = signal.confidence * 0.5 + signal.backtestMetrics.winRate * 0.3 + (signal.backtestMetrics.profitFactor * 10);
    if (signal.signal === 'STRONG_BUY') score += 15;
    else if (signal.signal === 'BUY') score += 8;
    else if (signal.signal === 'SELL') score -= 25;

    score = Math.max(10, Math.min(99, Math.round(score)));

    return {
      asset,
      signal,
      compositeScore: score,
    };
  });

  // Urutkan dari skor tertinggi
  ranked.sort((a, b) => b.compositeScore - a.compositeScore);

  const topPick = ranked.length > 0 && ranked[0].compositeScore >= 75 ? ranked[0] : null;

  return {
    leaderboard: ranked,
    topPick,
    timestamp: new Date().toLocaleTimeString('id-ID'),
  };
}

/**
 * Menjalankan satu siklus penuh trading crypto otonom:
 * 1. Monitor posisi koin eksisting (Take Profit & Stop Loss cut)
 * 2. Pemindaian sinyal Jesse AI & Auto-Buy Top Crypto Pick ke portofolio pengguna
 */
export async function runAutonomousCryptoAgentCycle(
  tickerMap: Record<string, BinanceTickerData> = {}
): Promise<{
  actionTaken: string | null;
  tradeExecuted: boolean;
  topPick: CryptoAlphaRanking | null;
}> {
  const aiStore = useAIAgentStore.getState();
  const portfolioStore = usePortfolioStore.getState();

  let actionTaken: string | null = null;
  let tradeExecuted = false;
  const exchangeRate = 16000; // Kurs acuan USDT/IDR

  // ─────────────────────────────────────────────────────────────────────────────
  // 0. SINKRONISASI HARGA PASAR SELURUH HOLDING CRYPTO
  // ─────────────────────────────────────────────────────────────────────────────
  if (Object.keys(tickerMap).length > 0) {
    const priceMap: Record<string, number> = {};
    for (const [sym, t] of Object.entries(tickerMap)) {
      if (t?.price > 0) {
        priceMap[sym] = t.price;
        const clean = sym.replace(/USDT$/i, '');
        priceMap[clean] = t.price;
      }
    }
    portfolioStore.updateHoldingPrices(priceMap);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. MONITORING TAKE PROFIT & STOP LOSS PADA HOLDING CRYPTO AKTIF
  // ─────────────────────────────────────────────────────────────────────────────
  const cryptoHoldings = portfolioStore.holdings.filter(
    (h) => h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT')
  );

  for (const holding of cryptoHoldings) {
    const sym = holding.symbol.toUpperCase();
    const cleanSym = holding.displaySymbol.replace(/USDT$/i, '').toUpperCase();
    const livePrice = tickerMap[sym]?.price ?? tickerMap[`${cleanSym}USDT`]?.price ?? holding.currentPrice;
    const units = holding.cryptoUnits ?? holding.lots;

    if (units <= 0 || livePrice <= 0) continue;

    // A. Cek Take Profit Otomatis Kripto
    if (holding.takeProfitPrice && livePrice >= holding.takeProfitPrice) {
      const res = portfolioStore.placeSellOrder({
        symbol: sym,
        displaySymbol: cleanSym,
        price: livePrice,
        lots: Number(units.toFixed(6)),
        orderType: 'MARKET',
        assetClass: 'CRYPTO',
        currency: 'USDT',
        exchangeRate,
      });

      if (res.order) {
        tradeExecuted = true;
        const estProfitIDR = (res.order.realizedPL || 0);
        actionTaken = `🎯 TAKE PROFIT CRYPTO OTOMATIS: Terjual ${units.toFixed(4)} ${cleanSym} @ $${livePrice.toLocaleString()} (Untung: Rp ${Math.round(estProfitIDR).toLocaleString('id-ID')})`;

        aiStore.logAction({
          type: 'TRADE_SELL',
          symbol: cleanSym,
          agentId: 'trader_crypto',
          agentName: 'Kevin Zhang (Jesse Crypto Desk Lead)',
          agentEmoji: '⚡',
          title: `Take Profit Kripto: ${cleanSym}`,
          details: `Target harga $${holding.takeProfitPrice.toLocaleString()} tercapai. Jesse AI melikuidasi posisi dan mengamankan keuntungan ke kas RDN Rupiah.`,
          metadata: {
            price: livePrice,
            lots: units,
            realizedPL: estProfitIDR,
            takeProfit: holding.takeProfitPrice,
          },
        });

        aiStore.recordTradeStat(false, estProfitIDR);
        break; // satu eksekusi per siklus
      }
    }

    // B. Cek Stop Loss Otomatis Kripto (CRO Bambang & Jesse Risk Gate)
    if (holding.stopLossPrice && livePrice <= holding.stopLossPrice) {
      const res = portfolioStore.placeSellOrder({
        symbol: sym,
        displaySymbol: cleanSym,
        price: livePrice,
        lots: Number(units.toFixed(6)),
        orderType: 'MARKET',
        assetClass: 'CRYPTO',
        currency: 'USDT',
        exchangeRate,
      });

      if (res.order) {
        tradeExecuted = true;
        const lossIDR = Math.abs(res.order.realizedPL || 0);
        actionTaken = `🛡️ STOP LOSS CRYPTO (JESSE VETO): Cut loss ${units.toFixed(4)} ${cleanSym} @ $${livePrice.toLocaleString()} (Batas risiko $${holding.stopLossPrice.toLocaleString()})`;

        aiStore.logAction({
          type: 'RISK_GATE',
          symbol: cleanSym,
          agentId: 'cro',
          agentName: 'Victor Halim (Chief Risk Officer)',
          agentEmoji: '🚨',
          title: `Stop Loss Cut Kripto: ${cleanSym}`,
          details: `Harga menyentuh batas proteksi modal $${holding.stopLossPrice.toLocaleString()}. Posisi dipotong untuk mencegah kerugian lebih besar.`,
          metadata: {
            price: livePrice,
            lots: units,
            realizedPL: -lossIDR,
            stopLoss: holding.stopLossPrice,
          },
        });

        aiStore.recordTradeStat(false, -lossIDR);
        break;
      }
    }

    // C. JUAL DISKRESIONER OTONOM AI (Kuasa Penuh Jesse AI Bot)
    // AI berhak melikuidasi koin kapan pun saat sinyal berbalik SELL atau divergensi momentum
    if (aiStore.discretionarySellingEnabled) {
      const chg = tickerMap[sym]?.change24h ?? 0;
      const jesseSignal = evaluateJesseStrategy(sym, livePrice, chg);

      if (jesseSignal.signal === 'SELL') {
        const res = portfolioStore.placeSellOrder({
          symbol: sym,
          displaySymbol: cleanSym,
          price: livePrice,
          lots: Number(units.toFixed(6)),
          orderType: 'MARKET',
          assetClass: 'CRYPTO',
          currency: 'USDT',
          exchangeRate,
        });

        if (res.order) {
          tradeExecuted = true;
          const plIDR = res.order.realizedPL || 0;
          actionTaken = `⚡ JESSE AI DISCRETIONARY SELL: Likuidasi ${units.toFixed(4)} ${cleanSym} @ $${livePrice.toLocaleString()} (Sinyal Jesse berbalik SELL)`;

          aiStore.logAction({
            type: 'TRADE_SELL',
            symbol: cleanSym,
            agentId: 'trader_crypto',
            agentName: 'Kevin Zhang (Jesse Crypto Desk Lead)',
            agentEmoji: '⚡',
            title: `Likuidasi Diskresioner Kripto: ${cleanSym}`,
            details: `Strategi Jesse AI mendeteksi pembalikan tren ke SELL (${jesseSignal.strategyName}). Kuasa portofolio penuh AI melikuidasi posisi untuk menyelamatkan modal.`,
            metadata: {
              price: livePrice,
              lots: units,
              realizedPL: plIDR,
              source: 'Jesse AI Quantitative Engine',
            },
          });

          aiStore.recordTradeStat(false, plIDR);
          break;
        }
      }

      // D. Kunci Profit Dinamis (Floating Profit > 10% dan momentum melemah)
      const costBasis = holding.avgPrice;
      const profitPct = costBasis > 0 ? ((livePrice - costBasis) / costBasis) * 100 : 0;
      if (profitPct >= 10 && chg < -1.5) {
        const res = portfolioStore.placeSellOrder({
          symbol: sym,
          displaySymbol: cleanSym,
          price: livePrice,
          lots: Number(units.toFixed(6)),
          orderType: 'MARKET',
          assetClass: 'CRYPTO',
          currency: 'USDT',
          exchangeRate,
        });

        if (res.order) {
          tradeExecuted = true;
          const profitIDR = res.order.realizedPL || 0;
          actionTaken = `💰 KUNCI PROFIT CRYPTO OTONOM: Terjual ${units.toFixed(4)} ${cleanSym} @ $${livePrice.toLocaleString()} (+${profitPct.toFixed(1)}%)`;

          aiStore.logAction({
            type: 'TRADE_SELL',
            symbol: cleanSym,
            agentId: 'trader_crypto',
            agentName: 'Kevin Zhang (Jesse Crypto Desk Lead)',
            agentEmoji: '⚡',
            title: `Kunci Keuntungan Kripto Dinamis: ${cleanSym}`,
            details: `Keuntungan mengambang mencapai +${profitPct.toFixed(1)}% dan momentum 24h melemah (${chg.toFixed(1)}%). Jesse AI mengamankan kas Rupiah.`,
            metadata: {
              price: livePrice,
              lots: units,
              realizedPL: profitIDR,
            },
          });

          aiStore.recordTradeStat(false, profitIDR);
          break;
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. PEMINDAIAN SEMESTA & EKSEKUSI BUY OTOMATIS OLEH JESSE AI AGENT
  // ─────────────────────────────────────────────────────────────────────────────
  const scanResult = scanCryptoUniverse(tickerMap);
  const topPick = scanResult.topPick;

  if (aiStore.autoTradingEnabled && !tradeExecuted && topPick) {
    const cleanSym = topPick.asset.baseAsset;
    const existingHolding = portfolioStore.holdings.find(
      (h) =>
        (h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT')) &&
        (h.displaySymbol.toUpperCase() === cleanSym || h.symbol.toUpperCase() === topPick.asset.symbol)
    );

    // Hitung total nilai portofolio untuk alokasi risiko
    const totalCryptoValueIDR = cryptoHoldings.reduce((sum, h) => {
      const liveP = tickerMap[h.symbol]?.price ?? h.currentPrice;
      const u = h.cryptoUnits ?? h.lots;
      return sum + u * liveP * (h.exchangeRate || exchangeRate);
    }, 0);

    const totalEquityValueIDR = portfolioStore.holdings
      .filter((h) => h.assetClass !== 'CRYPTO' && !h.symbol.endsWith('USDT'))
      .reduce((sum, h) => sum + h.currentPrice * (h.shares || h.lots * 100), 0);

    const totalNav = portfolioStore.cash + totalCryptoValueIDR + totalEquityValueIDR;
    const maxCryptoBudgetTotal = totalNav * 0.35; // Maks 35% NAV total untuk aset crypto
    const maxPerCoinBudget = totalNav * 0.15;     // Maks 15% NAV per koin

    const currentCoinExposureIDR = existingHolding
      ? (existingHolding.cryptoUnits ?? existingHolding.lots) * topPick.signal.currentPrice * exchangeRate
      : 0;

    // Sizing alokasi beli per trade (sekitar Rp 2 Juta - Rp 5 Juta disesuaikan kas)
    const targetTradeAmountIDR = Math.min(
      Math.max(1000000, Math.floor(portfolioStore.cash * 0.05)), // 5% kas atau min 1jt
      maxPerCoinBudget - currentCoinExposureIDR,
      maxCryptoBudgetTotal - totalCryptoValueIDR
    );

    const isSignalEligible =
      (topPick.signal.signal === 'STRONG_BUY' || topPick.signal.signal === 'BUY') &&
      topPick.compositeScore >= 78;

    const hasBudget = targetTradeAmountIDR >= 500000 && portfolioStore.cash >= targetTradeAmountIDR * 1.001;
    const isUnderAllocated = currentCoinExposureIDR < maxPerCoinBudget;

    if (isSignalEligible && hasBudget && isUnderAllocated) {
      const budgetUSDT = targetTradeAmountIDR / exchangeRate;
      const calculatedUnits = Number((budgetUSDT / topPick.signal.currentPrice).toFixed(6));

      if (calculatedUnits > 0) {
        const res = portfolioStore.placeBuyOrder({
          symbol: topPick.asset.symbol,
          displaySymbol: topPick.asset.baseAsset,
          name: `${topPick.asset.name} (Crypto)`,
          price: topPick.signal.currentPrice,
          lots: calculatedUnits,
          orderType: 'MARKET',
          assetClass: 'CRYPTO',
          currency: 'USDT',
          exchangeRate,
          takeProfitPrice: topPick.signal.takeProfit,
          stopLossPrice: topPick.signal.stopLoss,
        });

        if (res.order) {
          tradeExecuted = true;
          actionTaken = `⚡ JESSE AI AUTO-BUY: ${calculatedUnits} ${topPick.asset.baseAsset} @ $${topPick.signal.currentPrice.toLocaleString()} (TP: $${topPick.signal.takeProfit.toLocaleString()} / SL: $${topPick.signal.stopLoss.toLocaleString()})`;

          aiStore.logAction({
            type: 'TRADE_BUY',
            symbol: topPick.asset.baseAsset,
            agentId: 'trader_crypto',
            agentName: 'Kevin Zhang (Jesse Crypto Desk Lead)',
            agentEmoji: '⚡',
            title: `Beli Crypto Otonom: ${topPick.asset.baseAsset}`,
            details: `Strategi Jesse Adaptive Trend & SMC mengonfirmasi sinyal ${topPick.signal.signal} (Skor ${topPick.compositeScore}/100, Win Rate ${topPick.signal.backtestMetrics.winRate}%). Total pembelian Rp ${targetTradeAmountIDR.toLocaleString('id-ID')}.`,
            metadata: {
              price: topPick.signal.currentPrice,
              lots: calculatedUnits,
              amount: targetTradeAmountIDR,
              score: topPick.compositeScore,
              stopLoss: topPick.signal.stopLoss,
              takeProfit: topPick.signal.takeProfit,
            },
          });

          aiStore.recordTradeStat(true);
        }
      }
    }
  }

  return { actionTaken, tradeExecuted, topPick };
}
