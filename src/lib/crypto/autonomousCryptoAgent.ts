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
import { formatCryptoPrice } from '@/lib/utils';

import { CRYPTO_BENCHMARK_PRICES } from '@/data/idx_benchmark_prices';

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
  const fallbackMap: Record<string, number> = {};
  for (const [sym, b] of Object.entries(CRYPTO_BENCHMARK_PRICES)) {
    fallbackMap[sym] = b.price;
  }

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

  const topPick = ranked.length > 0 && ranked[0].compositeScore >= 82 ? ranked[0] : null;

  return {
    leaderboard: ranked,
    topPick,
    timestamp: new Date().toLocaleTimeString('id-ID'),
  };
}

/**
 * Memilih koin kripto terbaik dengan rotasi diversifikasi multi-kategori (L1, L2, DeFi, AI, Meme, Infrastructure):
 * - Hindari over-konsentrasi pada koin yang sama (misal PEPE / SUI saja).
 * - Berikan prioritas tinggi pada koin dan kategori yang belum dimiliki di portofolio.
 */
export function selectDiversifiedCryptoCandidate(
  candidates: CryptoAlphaRanking[],
  currentHoldings: any[] = []
): CryptoAlphaRanking | null {
  const eligible = candidates.filter(
    (c) => (c.signal.signal === 'STRONG_BUY' || c.signal.signal === 'BUY') && c.compositeScore >= 72
  );
  if (eligible.length === 0) return null;

  // Analisis portofolio koin yang sudah dimiliki
  const ownedCrypto = currentHoldings.filter(
    (h) => h.assetClass === 'CRYPTO' || h.symbol?.endsWith('USDT')
  );
  const ownedSymbols = new Set(
    ownedCrypto.map((h) => (h.displaySymbol || h.symbol).replace(/USDT$/i, '').toUpperCase())
  );

  const categoryCounts: Record<string, number> = {};
  ownedCrypto.forEach((h) => {
    const sym = (h.displaySymbol || h.symbol).replace(/USDT$/i, '').toUpperCase();
    const meta = SUPPORTED_CRYPTO_PAIRS.find((p) => p.baseAsset === sym || p.symbol === h.symbol);
    if (meta) {
      categoryCounts[meta.category] = (categoryCounts[meta.category] || 0) + 1;
    }
  });

  const scored = eligible.map((c) => {
    const base = c.asset.baseAsset.toUpperCase();
    const isOwned = ownedSymbols.has(base);
    const catCount = categoryCounts[c.asset.category] || 0;

    let priority = c.compositeScore;

    // 1. Prioritas Koin Baru (+25 Poin jika belum dimiliki)
    if (!isOwned) {
      priority += 25;
    } else {
      priority -= 35; // Penalti berat jika sudah punya koin ini agar tidak beli koin yang sama terus
    }

    // 2. Rotasi Kategori (+15 Poin jika kategori belum ada di portofolio)
    if (catCount === 0) {
      priority += 15;
    } else {
      priority -= (catCount * 12); // Penalti jika kategori sudah ramai
    }

    // 3. Batasi Meme Coin (PEPE/DOGE):
    // Jika portofolio sudah memegang koin Meme, penalti berat (-25 Poin) agar beralih ke L1/AI/L2
    if (c.asset.category === 'Meme' && (categoryCounts['Meme'] || 0) > 0) {
      priority -= 25;
    }

    // 4. Bonus Kategori Prioritas Fondasi (L1 Bluechip & AI):
    if (c.asset.category === 'L1' || c.asset.category === 'AI') {
      priority += 5;
    }

    return { candidate: c, priority };
  });

  scored.sort((a, b) => b.priority - a.priority);

  return scored[0]?.candidate || eligible[0] || null;
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
    // 0. Jangan sentuh koin yang dibeli manual oleh pengguna (source === 'USER')
    if (holding.source === 'USER') continue;

    const sym = holding.symbol.toUpperCase();
    const cleanSym = holding.displaySymbol.replace(/USDT$/i, '').toUpperCase();
    const livePrice = tickerMap[sym]?.price ?? tickerMap[`${cleanSym}USDT`]?.price ?? holding.currentPrice;
    const units = holding.cryptoUnits ?? holding.lots;

    if (units <= 0 || livePrice <= 0) continue;

    // Proteksi Cooldown: Koin yang baru dibeli kurang dari 3 menit dilarang dilikuidasi seketika
    const isHoldingFresh = holding.lastBoughtAt ? (Date.now() - holding.lastBoughtAt < 3 * 60 * 1000) : false;
    if (isHoldingFresh && livePrice < holding.avgPrice * 1.03) {
      continue;
    }

    // A. Cek Take Profit Otomatis Kripto (Hanya jika TP benar-benar di atas modal dan tidak dalam cooldown)
    if (!isHoldingFresh && holding.takeProfitPrice && holding.takeProfitPrice >= holding.avgPrice * 1.01 && livePrice >= holding.takeProfitPrice) {
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

    // B. Cek Stop Loss Otomatis Kripto (CRO Bambang & Jesse Risk Gate - hanya jika SL di bawah modal dan tidak dalam cooldown)
    // Proteksi: Tidak boleh terpicu akibat glitch feed anomali (>35% dalam 1 tick)
    const isGlitchDrop = holding.peakPrice ? livePrice < holding.peakPrice * 0.65 : false;
    if (!isHoldingFresh && !isGlitchDrop && holding.stopLossPrice && holding.stopLossPrice <= holding.avgPrice * 0.99 && livePrice <= holding.stopLossPrice) {
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
    // Proteksi Overtrading: Jangan panik jual posisi jika baru dibuka kurang dari 5 menit,
    // dan posisi harus sudah profit nyata (>= +2%) sebelum diizinkan likuidasi diskresioner
    if (aiStore.discretionarySellingEnabled) {
      const isHoldingFresh = holding.lastBoughtAt ? (Date.now() - holding.lastBoughtAt < 5 * 60 * 1000) : false;
      const chg = tickerMap[sym]?.change24h ?? 0;
      const jesseSignal = evaluateJesseStrategy(sym, livePrice, chg);
      const isProfitable = livePrice >= holding.avgPrice * 1.02; // Minimal profit +2% nyata
      const isSevereBreakdown = holding.avgPrice > 0 && livePrice < holding.avgPrice * 0.92;

      if (!isHoldingFresh && jesseSignal.signal === 'SELL' && (isProfitable || isSevereBreakdown)) {
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
            details: `Strategi Jesse AI mendeteksi pembalikan tren ke SELL (${jesseSignal.strategyName}). Posisi dilikuidasi untuk mengamankan kas.`,
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

  if (aiStore.autoTradingEnabled && !tradeExecuted) {
    // ── SINKRONISASI RAPAT WAR ROOM ──
    // Jika Dewan Komite Investasi di War Room sedang aktif menggelar sidang (misal: BMRI):
    // Tahan pembelian koin crypto selama sidang berlangsung (~25 detik) agar seluruh fokus
    // dan eksekusi tertuju pada keputusan mufakat komite dan tidak terjadi trade yang tumpang tindih.
    if (aiStore.activeDeliberatingTicker) {
      return { tradeExecuted, actionTaken, scanResult };
    }

    const MIN_BOT_CASH_RESERVE = 1_000_000;

    // Proteksi Kas Minimum: Bot crypto DILARANG membeli koin jika kas di bawah Rp 1.000.000
    if (portfolioStore.cash < MIN_BOT_CASH_RESERVE) {
      if (Math.random() < 0.2) {
        aiStore.logAction({
          type: 'RISK_GATE',
          symbol: topPick?.asset.baseAsset || 'CRYPTO',
          agentId: 'trader_crypto',
          agentName: 'Kevin Zhang (Jesse Crypto Desk Lead)',
          agentEmoji: '⚡',
          title: `Jesse AI Risk Gate: Pembelian Crypto Ditolak (Kas < Rp 1 Juta)`,
          details: `Sisa saldo kas saat ini (Rp ${Math.round(portfolioStore.cash).toLocaleString('id-ID')}) berada di bawah batas minimum Rp 1.000.000. Sesuai aturan manajemen risiko modal, bot crypto menonaktifkan seluruh pembelian koin baru.`,
          metadata: {
            cash: portfolioStore.cash,
            minCashRequired: MIN_BOT_CASH_RESERVE,
          },
        });
      }
      return { tradeExecuted, actionTaken, scanResult };
    }

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
    const maxCryptoBudgetTotal = totalNav * 0.40; // Maks 40% NAV total untuk aset crypto
    const maxPerCoinBudget = totalNav * 0.20;     // Maks 20% NAV per koin

    const availableCashAfterReserve = Math.max(0, portfolioStore.cash - MIN_BOT_CASH_RESERVE);

    // Cari kandidat koin terbaik dengan rotasi multi-kategori dan pencegahan duplikasi (hindari PEPE/SUI berulang)
    const diversifiedPick = selectDiversifiedCryptoCandidate(scanResult.leaderboard, portfolioStore.holdings);
    const eligibleCandidates = scanResult.leaderboard.filter(
      (c) => (c.signal.signal === 'STRONG_BUY' || c.signal.signal === 'BUY') && c.compositeScore >= 72
    );
    const candidateList = diversifiedPick
      ? [diversifiedPick, ...eligibleCandidates.filter((c) => c.asset.symbol !== diversifiedPick.asset.symbol)]
      : eligibleCandidates;

    for (const candidate of candidateList) {
      const cleanSym = candidate.asset.baseAsset;
      const existingHolding = portfolioStore.holdings.find(
        (h) =>
          (h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT')) &&
          (h.displaySymbol.toUpperCase() === cleanSym || h.symbol.toUpperCase() === candidate.asset.symbol)
      );

      const currentCoinExposureIDR = existingHolding
        ? (existingHolding.cryptoUnits ?? existingHolding.lots) * candidate.signal.currentPrice * exchangeRate
        : 0;

      // Sizing alokasi beli per trade (disesuaikan kas yang aman setelah cadangan Rp 1 Juta)
      const targetTradeAmountIDR = Math.min(
        Math.max(1_000_000, Math.floor(availableCashAfterReserve * 0.05)),
        maxPerCoinBudget - currentCoinExposureIDR,
        maxCryptoBudgetTotal - totalCryptoValueIDR,
        availableCashAfterReserve
      );

      const hasBudget =
        portfolioStore.cash >= MIN_BOT_CASH_RESERVE &&
        targetTradeAmountIDR >= 500_000 &&
        (portfolioStore.cash - targetTradeAmountIDR * 1.001 >= MIN_BOT_CASH_RESERVE);
      const isUnderAllocated = currentCoinExposureIDR < maxPerCoinBudget && totalCryptoValueIDR < maxCryptoBudgetTotal;

      if (hasBudget && isUnderAllocated) {
        const budgetUSDT = targetTradeAmountIDR / exchangeRate;
        const calculatedUnits = Number((budgetUSDT / candidate.signal.currentPrice).toFixed(6));

        if (calculatedUnits > 0) {
          const userTpPct = aiStore.cryptoTakeProfitPct || 15;
          const userSlPct = aiStore.cryptoStopLossPct || 6;
          const liveP = tickerMap[candidate.asset.symbol]?.price ?? tickerMap[candidate.asset.baseAsset]?.price;
          const curP = (liveP && liveP > 0) ? liveP : candidate.signal.currentPrice;
          const calculatedTP = Number((curP * (1 + userTpPct / 100)).toFixed(curP < 1 ? 8 : 4));
          const calculatedSL = Number((curP * (1 - userSlPct / 100)).toFixed(curP < 1 ? 8 : 4));

          const res = portfolioStore.placeBuyOrder({
            symbol: candidate.asset.symbol,
            displaySymbol: candidate.asset.baseAsset,
            name: `${candidate.asset.name} (Crypto)`,
            price: curP,
            lots: calculatedUnits,
            orderType: 'MARKET',
            assetClass: 'CRYPTO',
            currency: 'USDT',
            exchangeRate,
            takeProfitPrice: calculatedTP,
            stopLossPrice: calculatedSL,
            source: 'AI_AGENT',
          });

          if (res.order) {
            tradeExecuted = true;
            actionTaken = `⚡ JESSE AI AUTO-BUY: ${calculatedUnits} ${candidate.asset.baseAsset} [${candidate.asset.category}] @ ${formatCryptoPrice(curP)} (TP: +${userTpPct}% [${formatCryptoPrice(calculatedTP)}] / SL: -${userSlPct}% [${formatCryptoPrice(calculatedSL)}])`;

            aiStore.logAction({
              type: 'TRADE_BUY',
              symbol: candidate.asset.baseAsset,
              agentId: 'trader_crypto',
              agentName: 'Kevin Zhang (Jesse Crypto Desk Lead)',
              agentEmoji: '⚡',
              title: `Beli Crypto Otonom: ${candidate.asset.baseAsset} [${candidate.asset.category}]`,
              details: `Strategi Jesse Adaptive Trend (${candidate.signal.strategyName}) mengonfirmasi sinyal ${candidate.signal.signal} pada sektor ${candidate.asset.category}. Parameter risiko: TP +${userTpPct}% (${formatCryptoPrice(calculatedTP)}) & SL -${userSlPct}% (${formatCryptoPrice(calculatedSL)}). Total order Rp ${Math.round(targetTradeAmountIDR).toLocaleString('id-ID')}.`,
              metadata: {
                price: curP,
                lots: calculatedUnits,
                amount: Math.round(targetTradeAmountIDR),
                score: candidate.compositeScore,
                stopLoss: calculatedSL,
                takeProfit: calculatedTP,
              },
            });

            aiStore.recordTradeStat(true);
            break;
          }
        }
      }
    }
  }

  return { actionTaken, tradeExecuted, topPick };
}
