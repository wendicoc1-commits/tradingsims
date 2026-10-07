/**
 * Fincept Capital — Autonomous Trading & Cross-Platform Impact Engine
 * 
 * Engine ini bertindak sebagai jembatan langsung antara AI Agents dengan website Anda:
 * 1. Berdampak ke Portofolio: Membuka posisi BUY otomatis dan mengunci profit (TP/SL) otomatis.
 * 2. Berdampak ke Analisis Harga: Menghasilkan key level SMC dan sinkronisasi ke Watchlist pengguna.
 * 3. Berdampak ke Berita: Menerbitkan buletin live newsroom ke ticker dan wire feed website.
 */

import { usePortfolioStore } from '@/store';
import { useWatchlistStore } from '@/store';
import { useAIAgentStore, type AIPriceAnalysis } from '@/store/aiAgentStore';
import { scanUniverseForTopAlpha, type StockAlphaEvaluation } from './autonomousStockPicker';
import { computePositionSizing, roundTick, portfolioNav, type LiveQuote, type NewsItem, type PortfolioSnapshot } from './deskReports';
import { getGroundedStockIntelligence } from '../agents/groundedStockIntelligence';
import { runAutonomousCryptoAgentCycle } from '../crypto/autonomousCryptoAgent';
import { checkIDXMarketStatus } from '../market/marketHours';

/**
 * Menjalankan satu siklus penuh otonom:
 * - Sinkronisasi harga pasar portofolio dengan live quotes
 * - Pantau & eksekusi TP/SL pada portofolio saat ini (dengan kepatuhan fraksi BEI)
 * - Skrining Alpha universe & eksekusi BUY pada Top Pick jika sinyal valid & plafon risiko aman
 * - Publikasi analisis harga ke Watchlist dan dispatches berita ke platform
 */
export async function runAutonomousAgentCycle(
  news: NewsItem[] = [],
  liveQuotesMap: Record<string, LiveQuote> = {},
  options?: { skipEquityBuy?: boolean }
): Promise<{
  actionTaken: string | null;
  tradeExecuted: boolean;
  topPick: StockAlphaEvaluation | null;
}> {
  const aiStore = useAIAgentStore.getState();
  const portfolioStore = usePortfolioStore.getState();
  const watchlistStore = useWatchlistStore.getState();

  let actionTaken: string | null = null;
  let tradeExecuted = false;

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
    const sym = holding.displaySymbol.replace('.JK', '').toUpperCase();
    const liveQ = liveQuotesMap[sym];
    const rawPrice = liveQ?.price ?? holding.currentPrice;
    const sellPrice = roundTick(rawPrice);

    if (sellPrice <= 0) continue;

    // A. Cek Take Profit
    if (holding.takeProfitPrice && sellPrice >= holding.takeProfitPrice && holding.lots > 0) {
      const sellLots = holding.lots;
      const res = portfolioStore.placeSellOrder({
        symbol: holding.symbol,
        displaySymbol: holding.displaySymbol,
        name: holding.name,
        price: sellPrice,
        lots: sellLots,
        orderType: 'MARKET',
      });

      if (res.order) {
        tradeExecuted = true;
        const estProfit = (sellPrice - holding.avgPrice) * sellLots * 100;
        actionTaken = `🎯 TAKE PROFIT OTOMATIS: Terjual ${sellLots} lot ${sym} @ Rp ${sellPrice.toLocaleString('id-ID')} (Untung: Rp ${estProfit.toLocaleString('id-ID')})`;

        aiStore.logAction({
          type: 'TRADE_SELL',
          symbol: sym,
          agentId: 'pm_idx',
          agentName: 'Raditya Pratama (L/S Equity PM)',
          agentEmoji: '💼',
          title: `Take Profit Otomatis: ${sym}`,
          details: `Target harga Rp ${holding.takeProfitPrice.toLocaleString('id-ID')} tercapai. Posisi dilikuidasi untuk mengamankan keuntungan modal.`,
          metadata: {
            price: sellPrice,
            lots: sellLots,
            realizedPL: estProfit,
            takeProfit: holding.takeProfitPrice,
          },
        });

        aiStore.recordTradeStat(false, estProfit);
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
    if (
      holding.trailingStopPrice &&
      sellPrice <= holding.trailingStopPrice &&
      holding.peakPrice &&
      holding.peakPrice > holding.avgPrice * 1.02 &&
      holding.lots > 0
    ) {
      const sellLots = holding.lots;
      const res = portfolioStore.placeSellOrder({
        symbol: holding.symbol,
        displaySymbol: holding.displaySymbol,
        name: holding.name,
        price: sellPrice,
        lots: sellLots,
        orderType: 'MARKET',
      });

      if (res.order) {
        tradeExecuted = true;
        const estProfit = (sellPrice - holding.avgPrice) * sellLots * 100;
        actionTaken = `📈 TRAILING STOP ATR TERKUNCI: Terjual ${sellLots} lot ${sym} @ Rp ${sellPrice.toLocaleString('id-ID')} setelah berbalik dari puncak Rp ${holding.peakPrice.toLocaleString('id-ID')} (Amankan Untung: Rp ${estProfit.toLocaleString('id-ID')})`;

        aiStore.logAction({
          type: 'TRADE_SELL',
          symbol: sym,
          agentId: 'head_trader',
          agentName: 'Gilang Ramadhan (Head Trader)',
          agentEmoji: '⚡',
          title: `Trailing Stop ATR Locked: ${sym}`,
          details: `Harga berbalik dari level puncak Rp ${holding.peakPrice.toLocaleString('id-ID')} dan menyentuh batas trailing stop Rp ${holding.trailingStopPrice.toLocaleString('id-ID')}. Keuntungan modal berhasil dikunci otomatis.`,
          metadata: {
            price: sellPrice,
            lots: sellLots,
            realizedPL: estProfit,
            source: 'ATR Chandelier Exit Engine',
          },
        });

        aiStore.recordTradeStat(false, estProfit);
        break;
      }
    }

    // C. Cek Hard Stop Loss (CRO Risk Gate Veto)
    if (holding.stopLossPrice && sellPrice <= holding.stopLossPrice && holding.lots > 0) {
      const sellLots = holding.lots;
      const res = portfolioStore.placeSellOrder({
        symbol: holding.symbol,
        displaySymbol: holding.displaySymbol,
        name: holding.name,
        price: sellPrice,
        lots: sellLots,
        orderType: 'MARKET',
      });

      if (res.order) {
        tradeExecuted = true;
        const lossVal = (holding.avgPrice - sellPrice) * sellLots * 100;
        actionTaken = `🛡️ STOP LOSS OTOMATIS (CRO VETO): Cut loss ${sellLots} lot ${sym} @ Rp ${sellPrice.toLocaleString('id-ID')} (Batas risiko Rp ${holding.stopLossPrice.toLocaleString('id-ID')})`;

        aiStore.logAction({
          type: 'RISK_GATE',
          symbol: sym,
          agentId: 'cro',
          agentName: 'Bambang Suroso (Chief Risk Officer)',
          agentEmoji: '🛡️',
          title: `Stop Loss Cut: ${sym}`,
          details: `Harga menyentuh batas proteksi modal Rp ${holding.stopLossPrice.toLocaleString('id-ID')}. Posisi ditutup untuk mencegah drawdown lebih dalam.`,
          metadata: {
            price: sellPrice,
            lots: sellLots,
            realizedPL: -lossVal,
            stopLoss: holding.stopLossPrice,
          },
        });

        aiStore.recordTradeStat(false, -lossVal);
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

      // 1. Likuidasi Pelemahan Tren: Sinyal berbalik Strong Bearish atau Bearish dengan fundamental rapuh
      const isTrendBroken = mtfTrend === 'STRONG_BEARISH' || (mtfTrend === 'BEARISH' && holdingIntel.financials.roe < 7);
      
      // 2. Kunci Keuntungan Dinamis (Trailing TP): Profit > 8% dan menyentuh zona Order Block Supply
      const isSupplyResistance = profitPct >= 8.0 && sellPrice >= supplyZone;

      if (isTrendBroken || isSupplyResistance) {
        const sellLots = holding.lots;
        const res = portfolioStore.placeSellOrder({
          symbol: holding.symbol,
          displaySymbol: holding.displaySymbol,
          name: holding.name,
          price: sellPrice,
          lots: sellLots,
          orderType: 'MARKET',
        });

        if (res.order) {
          tradeExecuted = true;
          const estRealized = (sellPrice - holding.avgPrice) * sellLots * 100;
          if (isSupplyResistance) {
            actionTaken = `💰 KUNCI PROFIT DINAMIS AI: Terjual ${sellLots} lot ${sym} @ Rp ${sellPrice.toLocaleString('id-ID')} (+${profitPct.toFixed(1)}%). Menghindari pembalikan arah di zona pasokan.`;
            aiStore.logAction({
              type: 'TRADE_SELL',
              symbol: sym,
              agentId: 'pm_idx',
              agentName: 'Raditya Pratama (L/S Equity PM)',
              agentEmoji: '💼',
              title: `Kunci Untung Dinamis: ${sym}`,
              details: `Harga menyentuh zona Order Block Supply dengan floating gain +${profitPct.toFixed(1)}%. AI melikuidasi posisi untuk mengamankan kas.`,
              metadata: {
                price: sellPrice,
                lots: sellLots,
                realizedPL: estRealized,
              },
            });
          } else {
            actionTaken = `🔻 LIKUIDASI DISKRESIONER AI: Cut posisi ${sellLots} lot ${sym} @ Rp ${sellPrice.toLocaleString('id-ID')} karena sinyal berbalik ${mtfTrend}. Proteksi modal aktif.`;
            aiStore.logAction({
              type: 'TRADE_SELL',
              symbol: sym,
              agentId: 'cro',
              agentName: 'Bambang Suroso (Chief Risk Officer)',
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
  const scanResult = scanUniverseForTopAlpha(news, liveQuotesMap, heldTickers);
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

    const findHolding = (sym: string) =>
      portfolioStore.holdings.find(
        (h) => h.displaySymbol.toUpperCase() === sym || h.symbol.replace('.JK', '').toUpperCase() === sym
      );
    const exposureOf = (sym: string) => {
      const h = findHolding(sym);
      return h ? (h.shares || h.lots * 100) * (liveQuotesMap[sym]?.price || h.currentPrice) : 0;
    };
    // Posisi dianggap cukup jika sudah >= 10 lot atau menyentuh plafon alokasi
    const isAllocated = (sym: string) => {
      const h = findHolding(sym);
      return !!h && (h.lots >= 10 || exposureOf(sym) >= maxAllocationPerAsset);
    };

    // AI memilih sendiri: saham IDX berskor tertinggi yang BELUM cukup dialokasikan.
    // Tidak lagi terpaku pada peringkat #1 — saat #1 sudah terisi, AI pindah ke kandidat berikutnya.
    const target =
      scanResult.rankedLeaderboard.find(
        (c) =>
          c.currency === 'IDR' &&
          c.suggestedAction.action === 'BUY' &&
          c.score >= 78 &&
          !isAllocated(c.symbol.toUpperCase())
      ) ?? topPick;

    const cleanSym = target.symbol.toUpperCase();
    const existingHolding = findHolding(cleanSym);
    const currentAssetExposure = exposureOf(cleanSym);
    const isAlreadySufficientlyAllocated = isAllocated(cleanSym);

    // Status jam bursa BEI (hanya informatif; tidak memblokir order di mode simulator agar pengujian AI berjalan 24/7)
    const isTargetIDX = target.currency === 'IDR';
    const idxMarketCheck = isTargetIDX ? checkIDXMarketStatus() : null;

    if (!isAlreadySufficientlyAllocated && target.score >= 78 && target.suggestedAction.action === 'BUY') {
      const intel = getGroundedStockIntelligence(target.symbol, liveQuotesMap[target.symbol]?.price);
      const sizing = computePositionSizing(intel, snapshot);

      // Hitung total biaya pembelian termasuk broker fee (0.15%)
      const totalBuyCost = Math.round(sizing.notional * 1.0015);

      // Cek apakah kas tidak cukup dan perlu rotasi modal dari holding terlemah
      if (
        aiStore.discretionarySellingEnabled &&
        target.score >= 84 &&
        portfolioStore.cash < totalBuyCost &&
        portfolioStore.holdings.length > 0
      ) {
        // Cari holding dengan skor/kinerja paling buruk untuk dirotasi
        const equityHoldings = portfolioStore.holdings.filter((h) => h.assetClass !== 'CRYPTO' && !h.symbol.endsWith('USDT') && h.lots > 0);
        if (equityHoldings.length > 0) {
          // Sort by lowest unrealized P/L percent
          equityHoldings.sort((a, b) => (a.unrealizedPLPercent || 0) - (b.unrealizedPLPercent || 0));
          const weakest = equityHoldings[0];
          const weakSym = weakest.displaySymbol.replace('.JK', '').toUpperCase();
          const weakPrice = roundTick(liveQuotesMap[weakSym]?.price ?? weakest.currentPrice);

          if (weakPrice > 0 && weakSym !== cleanSym) {
            const sellRes = portfolioStore.placeSellOrder({
              symbol: weakest.symbol,
              displaySymbol: weakest.displaySymbol,
              name: weakest.name,
              price: weakPrice,
              lots: weakest.lots,
              orderType: 'MARKET',
            });

            if (sellRes.order) {
              const releasedCash = weakPrice * weakest.lots * 100 * 0.9975;
              aiStore.logAction({
                type: 'TRADE_ROTATE',
                symbol: weakSym,
                agentId: 'cio',
                agentName: 'Gita Wirjawan (Chief Investment Officer)',
                agentEmoji: '🏛️',
                title: `Rotasi Portofolio: Likuidasi ${weakSym} → Beli ${cleanSym}`,
                details: `Kas dilikuidasi dari ${weakSym} (+Rp ${Math.round(releasedCash).toLocaleString('id-ID')}) untuk merotasi modal ke ${cleanSym} yang memiliki konveksitas Alpha jauh lebih tinggi (Skor ${target.score}/100).`,
                metadata: {
                  price: weakPrice,
                  lots: weakest.lots,
                  amount: releasedCash,
                },
              });
            }
          }
        }
      }

      // Cek kecukupan kas, sizing valid, dan tidak melebihi plafon alokasi 25% NAV
      if (
        sizing.ok &&
        sizing.lots > 0 &&
        portfolioStore.cash >= totalBuyCost &&
        (currentAssetExposure + totalBuyCost <= maxAllocationPerAsset)
      ) {
        const res = portfolioStore.placeBuyOrder({
          symbol: `${target.symbol}.JK`,
          displaySymbol: target.symbol,
          name: target.name,
          price: sizing.entry,
          lots: sizing.lots,
          orderType: 'LIMIT',
          takeProfitPrice: sizing.takeProfit,
          stopLossPrice: sizing.stop,
          validityType: 'GTC',
        });

        if (res.order) {
          tradeExecuted = true;
          actionTaken = `⚡ ORDER BUY OTOMATIS: ${sizing.lots} lot ${target.symbol} @ Rp ${sizing.entry.toLocaleString('id-ID')} (SL: Rp ${sizing.stop.toLocaleString('id-ID')} / TP: Rp ${sizing.takeProfit.toLocaleString('id-ID')})`;

          aiStore.logAction({
            type: 'TRADE_BUY',
            symbol: target.symbol,
            agentId: 'pm_equity',
            agentName: 'Raditya Pratama (L/S Equity PM)',
            agentEmoji: '💼',
            title: `Beli Saham Otonom: ${target.symbol}`,
            details: `Berdasarkan konsensus sidang komite Fincept, emiten menduduki Rank #${target.rank} (Skor ${target.score}/100). Sizing dibatasi pada 1% risiko NAV (${sizing.lots} lot).`,
            metadata: {
              price: sizing.entry,
              lots: sizing.lots,
              amount: sizing.notional,
              score: target.score,
              stopLoss: sizing.stop,
              takeProfit: sizing.takeProfit,
            },
          });

          aiStore.recordTradeStat(true);
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
      if (['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT'].includes(sym.toUpperCase())) {
        cryptoTickersMap[`${sym.toUpperCase()}USDT`] = {
          symbol: `${sym.toUpperCase()}USDT`,
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
}
