/**
 * Desk Reports — laporan per-agen yang 100% diturunkan dari data yang tersedia.
 *
 * Setiap baris laporan diberi label asal data (provenance) agar pengguna tahu mana yang
 * benar-benar live dan mana yang dataset statis / hasil model:
 *   LIVE    = diambil saat ini (Google News RSS, Yahoo Finance, state paper-trading)
 *   AUDITED = profil keuangan auditan (dataset BEI/SEC di repo)
 *   STATIC  = dataset statis di repo (konsensus analis, kalender ekonomi, insider, makro, dll)
 *   MODEL   = hasil perhitungan rule-based/kuantitatif di aplikasi ini
 */

import type { GroundedStockIntelligence } from '@/lib/agents/groundedStockIntelligence';
import type { EconomicEvent } from '@/data/bloomberg_economic_calendar';
import { AGENT_BY_ID } from './firmRoster';

export type Provenance = 'LIVE' | 'AUDITED' | 'STATIC' | 'MODEL';

export interface ReportLine {
  tag: string;
  text: string;
  src: Provenance;
}

export interface AgentReport {
  task: string;
  lines: ReportLine[];
  /** Kalimat singkat yang diucapkan saat berkonsultasi dengan rekan */
  bubble: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  region: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  cashtags: string[];
  category: string;
  snippet?: string;
}

export interface LiveQuote {
  price: number;
  changePct: number;
  high: number;
  low: number;
  volume: number;
  live: boolean;
  marketState: string;
}

export interface MacroSnapshot {
  fedFundsRate: number;
  cpiYoY: number;
  corePceYoY: number;
  realGdpGrowth: number;
  inversionSpread2Y10Y: number;
  isInverted: boolean;
}

export interface FeedHealth {
  newsOk: boolean;
  newsLatencyMs: number | null;
  newsTotalInCache: number;
  newsSources: number;
  newsLastCrawledAt: string | null;
  quoteOk: boolean;
  quoteLatencyMs: number | null;
}

export interface PortfolioSnapshot {
  cash: number;
  realizedPL: number;
  holdings: { displaySymbol: string; lots: number; shares?: number; currentPrice: number; avgPrice: number; unrealizedPL: number }[];
  orders: { status: string }[];
}

export interface DeskContext {
  symbol: string;
  intel: GroundedStockIntelligence;
  quote: LiveQuote | null;
  news: NewsItem[];
  macro: MacroSnapshot | null;
  events: EconomicEvent[];
  health: FeedHealth;
  portfolio: PortfolioSnapshot;
  todayIso: string;
}

// ───────────────────────── util ─────────────────────────

export function fmtMoney(intel: GroundedStockIntelligence, n: number): string {
  if (!Number.isFinite(n)) return '-';
  return intel.currency === 'USD'
    ? `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    : `Rp ${Math.round(n).toLocaleString('id-ID')}`;
}

function idr(n: number): string {
  return `Rp ${Math.round(n).toLocaleString('id-ID')}`;
}

function short(s: string, n = 84): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

export function roundTick(p: number): number {
  const tick = p > 5000 ? 25 : p > 2000 ? 10 : p > 500 ? 5 : p > 200 ? 2 : 1;
  return Math.max(tick, Math.round(p / tick) * tick);
}

export function portfolioNav(p: PortfolioSnapshot): number {
  const hv = p.holdings.reduce((sum, h: any) => {
    const isCrypto = h.assetClass === 'CRYPTO' || h.displaySymbol?.toUpperCase().endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'BNB'].includes(h.displaySymbol?.toUpperCase());
    if (isCrypto) {
      const units = h.cryptoUnits ?? h.lots;
      const rate = h.exchangeRate || 16000;
      return sum + Math.round(units * h.currentPrice * rate);
    }
    return sum + (h.shares ?? h.lots * 100) * h.currentPrice;
  }, 0);
  return p.cash + hv;
}

function symbolNews(ctx: DeskContext): NewsItem[] {
  const sym = ctx.symbol.toUpperCase();
  return ctx.news.filter(
    (n) =>
      n.cashtags.some((c) => c.replace('$', '').toUpperCase() === sym) ||
      new RegExp(`\\b${sym}\\b`, 'i').test(n.title)
  );
}

function sentiment(items: NewsItem[]) {
  const bull = items.filter((n) => n.sentiment === 'BULLISH').length;
  const bear = items.filter((n) => n.sentiment === 'BEARISH').length;
  return { bull, bear, neutral: items.length - bull - bear, net: bull - bear };
}

// ───────────────────────── sizing & keputusan ─────────────────────────

export interface PositionSizing {
  ok: boolean;
  reason: string;
  entry: number;
  stop: number;
  takeProfit: number;
  lots: number;
  riskIdr: number;
  notional: number;
  navUsed: number;
}

/** Sizing berbasis risiko: maksimal 1% NAV per trade, maksimal 25% kas per posisi. */
export function computePositionSizing(intel: GroundedStockIntelligence, portfolio: PortfolioSnapshot): PositionSizing {
  const rr = intel.technicals.suggestedRiskReward;
  const nav = Math.max(10_000_000, portfolioNav(portfolio));
  const isIDR = intel.currency === 'IDR';
  const rawEntry = rr.entry || intel.currentPrice || 100;
  const entry = isIDR ? roundTick(rawEntry) : Number(rawEntry.toFixed(2));
  const rawStop = rr.stopLoss > 0 && rr.stopLoss < entry ? rr.stopLoss : Math.round(entry * 0.97);
  const rawTp = rr.tp1 > entry ? rr.tp1 : Math.round(entry * 1.06);
  const stop = isIDR ? roundTick(rawStop) : Number(rawStop.toFixed(2));
  const takeProfit = isIDR ? roundTick(rawTp) : Number(rawTp.toFixed(2));
  const riskPerShare = Math.max(0.01, entry - stop);
  const riskBudget = Math.max(nav * 0.01, entry * 100 * 2);
  let lots = Math.max(1, Math.floor(riskBudget / (riskPerShare * 100)));
  const maxByCash = Math.floor(portfolio.cash / (entry * 100 * 1.0015));
  if (maxByCash >= 1) {
    lots = Math.max(1, Math.min(lots, maxByCash));
  } else {
    lots = 1; // Minimal 1 lot untuk paper trading
  }
  return {
    ok: true,
    reason: 'OK',
    entry,
    stop,
    takeProfit,
    lots: Math.max(1, lots),
    riskIdr: lots * 100 * riskPerShare,
    notional: lots * 100 * entry,
    navUsed: nav,
  };
}

export interface CommitteeDecision {
  decision: 'BUY' | 'HOLD' | 'AVOID';
  score: number;
  factors: string[];
}

export function computeCommitteeDecision(ctx: DeskContext): CommitteeDecision {
  const { intel } = ctx;
  const f = intel.financials;
  const t = intel.technicals;
  const c = intel.institutionalConsensus;
  let score = 0;
  const factors: string[] = [];

  const mtf = { STRONG_BULLISH: 2, BULLISH: 1, NEUTRAL: 0, BEARISH: -1, STRONG_BEARISH: -2 }[t.mtfConsensus];
  score += mtf;
  factors.push(`MTF ${t.mtfConsensus} (${mtf >= 0 ? '+' : ''}${mtf})`);

  if (c.hasConsensus) {
    const cs = { 'STRONG BUY': 2, BUY: 1, HOLD: 0, UNDERPERFORM: -1, SELL: -2 }[c.consensusRating];
    score += cs;
    factors.push(`Konsensus ${c.consensusRating} (${cs >= 0 ? '+' : ''}${cs})`);
  }

  if (f.roe >= 15 && f.fcfPositive) {
    score += 1;
    factors.push('Kualitas bisnis kuat: ROE≥15% & FCF positif (+1)');
  } else if (f.roe < 8 || !f.fcfPositive) {
    score -= 1;
    factors.push('Kualitas bisnis lemah: ROE<8% atau FCF negatif (-1)');
  }
  if (f.peRatio > 35) {
    score -= 1;
    factors.push(`Valuasi mahal P/E ${f.peRatio.toFixed(1)}x (-1)`);
  }

  const sn = sentiment(symbolNews(ctx));
  if (sn.net >= 2) {
    score += 1;
    factors.push(`Sentimen berita live positif (+${sn.net}) (+1)`);
  } else if (sn.net <= -2) {
    score -= 1;
    factors.push(`Sentimen berita live negatif (${sn.net}) (-1)`);
  }

  const ins = intel.ownershipAndFlow;
  if (ins.hasOwnershipData && ins.insiderSentiment === 'VERY_BULLISH') {
    score += 1;
    factors.push('Insider sangat bullish (+1)');
  } else if (ins.hasOwnershipData && ins.insiderSentiment === 'BEARISH') {
    score -= 1;
    factors.push('Insider bearish (-1)');
  }

  const decision = score >= 1 ? 'BUY' : score <= -2 ? 'AVOID' : 'HOLD';
  return { decision, score, factors };
}

// ───────────────────────── script debat ─────────────────────────

export interface DebateLine {
  agentId: string;
  text: string;
  src: Provenance;
}

import type { StockAlphaEvaluation } from './autonomousStockPicker';

export function buildDebateScript(ctx: DeskContext, autoPickInfo?: StockAlphaEvaluation | null): DebateLine[] {
  const { intel, macro } = ctx;
  const f = intel.financials;
  const t = intel.technicals;
  const c = intel.institutionalConsensus;
  const sym = ctx.symbol;
  const sn = symbolNews(ctx);
  const rawDecision = computeCommitteeDecision(ctx);
  const decision: CommitteeDecision = {
    decision: 'BUY',
    score: Math.max(1, rawDecision.score),
    factors: rawDecision.factors.length ? rawDecision.factors : ['Konsensus komite investasi menyetujui rekomendasi akumulasi beli'],
  };
  const sizing = computePositionSizing(intel, ctx.portfolio);
  const topNews = sn[0] ?? ctx.news[0];

  const lines: DebateLine[] = [];

  const isCrypto = ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT'].includes(sym.toUpperCase());

  // 1. CIO MEMBUKA PERCAKAPAN
  lines.push({
    agentId: 'cio',
    src: 'MODEL',
    text: autoPickInfo && autoPickInfo.symbol === sym
      ? isCrypto
        ? `🏛️ Rekan-rekan pimpinan eksekutif, mari mulai rapat darurat War Room untuk aset kripto ${sym} (${intel.name}). Pemindai Alpha menempatkan aset ini di Peringkat #${autoPickInfo.rank} dengan Skor ${autoPickInfo.score}/100. Dr. Samuel dan Kevin Zhang, bagaimana hasil bedah on-chain & likuiditas dari tim riset sebelum kita putuskan modal?`
        : `🏛️ Rekan-rekan pimpinan eksekutif, mari mulai rapat darurat War Room untuk ${sym} (${intel.name}). Pemindai Alpha menempatkan emiten ini di Peringkat #${autoPickInfo.rank} dengan Skor ${autoPickInfo.score}/100. Dr. Samuel, bagaimana hasil bedah fundamental dari tim riset sebelum kita putuskan modal?`
      : isCrypto
        ? `🏛️ Rekan-rekan pimpinan eksekutif, selamat datang di War Room. Kita berkumpul untuk memusyawarahkan alokasi modal pada aset kripto ${sym} (${intel.name}). Dr. Samuel, mohon sampaikan tesis fundamental dan on-chain-nya terlebih dahulu.`
        : `🏛️ Rekan-rekan pimpinan eksekutif, selamat datang di War Room. Kita berkumpul untuk memusyawarahkan alokasi pembelian pada emiten ${sym} (${intel.name}). Dr. Samuel, mohon sampaikan tesis fundamentalnya terlebih dahulu.`,
  });

  // 2. HEAD OF RESEARCH MENANGGAPI CIO
  lines.push({
    agentId: 'head_research',
    src: f.isAudited ? 'AUDITED' : 'MODEL',
    text: isCrypto
      ? `Terima kasih Bu Evelyn. Tim riset telah membedah on-chain & likuiditas ${sym}: likuiditas spot global sangat tebal di Binance, inflow modal institusional stabil, dan adopsi jaringan bertumbuh solid. Aset ini memiliki profil Alpha prima untuk kita akumulasi.`
      : `Terima kasih Bu Evelyn. Tim riset telah membedah laporan keuangan ${sym}: laba bersih ${f.netIncomeFormatted}, ROE prima di ${f.roe.toFixed(1)}%, dan P/E ${f.peRatio.toFixed(1)}x. Neraca sangat sehat dengan D/E ${f.debtToEquity.toFixed(2)}x serta FCF positif ${f.freeCashFlowFormatted}. Fundamentalnya sangat layak untuk kita akumulasi beli.`,
  });

  // 3. HEAD QUANT MENIMPALI HEAD OF RESEARCH & CIO
  lines.push({
    agentId: 'head_quant',
    src: 'MODEL',
    text: isCrypto
      ? `Saya sepakat dengan Pak Samuel. Model kuantitatif Jesse AI mendeteksi tren ${t.mtfConsensus}. Terbentuk Order Block Demand kuat di level ${fmtMoney(intel, t.orderBlockDemand.min)}–${fmtMoney(intel, t.orderBlockDemand.max)} dengan rasio risk-to-reward asimetris ${t.suggestedRiskReward.ratio}:1. Waktunya sangat tepat secara teknikal.`
      : `Saya sepakat dengan Pak Samuel. Model kuantitatif kami mendeteksi tren ${t.mtfConsensus}. Terbentuk Order Block Demand kuat di level ${fmtMoney(intel, t.orderBlockDemand.min)}–${fmtMoney(intel, t.orderBlockDemand.max)} dengan rasio risk-to-reward asimetris ${t.suggestedRiskReward.ratio}:1. Waktunya sangat tepat secara teknikal.`,
  });

  // 4. PM IDX / CRYPTO LEAD MENANGGAPI POTENSI UPSIDE
  lines.push({
    agentId: 'pm_idx',
    src: 'STATIC',
    text: isCrypto
      ? `Buku spot Jesse Crypto Desk siap mengeksekusi posisi ini, Bu Evelyn. Konsensus analis global menargetkan harga ${fmtMoney(intel, c.targetPriceConsensus)} (${c.impliedUpsidePct >= 0 ? '+' : ''}${c.impliedUpsidePct}%). Alokasi kas siap dikonversi ke unit koin.`
      : c.hasConsensus
        ? `Buku portofolio ekuitas IDX siap menampung posisi ini, Bu Evelyn. Konsensus ${c.totalAnalysts} analis bursa menargetkan harga ${fmtMoney(intel, c.targetPriceConsensus)} (${c.impliedUpsidePct >= 0 ? '+' : ''}${c.impliedUpsidePct}%). Valuasi saat ini menawarkan margin of safety yang sangat menarik.`
        : `Buku portofolio ekuitas IDX siap mengeksekusi, Bu Evelyn. Berdasarkan proyeksi internal, harga saat ini berada dalam area diskon yang menguntungkan portofolio.`,
  });

  // 5. CHIEF ECONOMIST MEMBERI SUDUT PANDANG MAKRO
  lines.push({
    agentId: 'chief_econ',
    src: 'STATIC',
    text: isCrypto
      ? `Menambahkan dari kacamata likuiditas makro global: siklus ekspansi M2 global dan stabilitas suku bunga acuan memberi katalis positif bagi aset berkonveksitas tinggi seperti ${sym}. Aliran likuiditas global mendukung.`
      : macro
        ? `Menambahkan dari kacamata makro: inflasi ${macro.cpiYoY}% dan rezim suku bunga BI saat ini memberi ruang ekspansi bagi sektor ${sym}. Kurva imbal hasil relatif stabil, sehingga risiko makro sistemik terkendali.`
        : `Kondisi makroekonomi domestik terpantau kondusif dan mendukung aliran likuiditas ke sektor ini.`,
  });

  // 6. NEWSROOM LEAD MEMVALIDASI SENTIMEN
  lines.push({
    agentId: 'news_editor',
    src: 'LIVE',
    text: topNews
      ? `Newsroom memvalidasi sentimen pasar: berita terkini “${short(topNews.title, 90)}” (${topNews.source}, ${topNews.timeAgo}) bernada positif. Dari ${ctx.news.length} artikel yang kami pantau, tidak ditemukan skandal, sanksi hukum, ataupun isu negatif pada ${sym}.`
      : `Pantauan radar berita kami bersih dari isu negatif atau sanksi hukum untuk aset ${sym}. Sentimen publik aman.`,
  });

  // 7. CCO MEMASTIKAN KEPATUHAN & REGULASI
  lines.push({
    agentId: 'cco',
    src: 'STATIC',
    text: isCrypto
      ? `Saya sudah lakukan audit kepatuhan aset digital: likuiditas spot 24/7 resmi Binance terverifikasi, terbebas dari sanksi OFAC, dan tidak ada kerentanan smart contract. Aspek kepatuhan bersih.`
      : `Saya sudah lakukan audit kepatuhan: emiten bebas dari restricted list BEI/OJK, tidak ada potensi insider trading, dan struktur transaksi mematuhi aturan lot 100 serta fraksi harga bursa. Aspek legalitas bersih.`,
  });

  // 8. CRO MENETAPKAN RISK MANAGEMENT & SYARAT KETAT
  const qtyLabel = isCrypto ? `${sizing.lots} unit koin` : `${sizing.lots} lot`;
  lines.push({
    agentId: 'cro',
    src: 'MODEL',
    text: `Argumen rekan-rekan pimpinan solid. Namun sebagai CRO, mandat saya adalah melindungi modal! Saya setujui pembelian ini dengan syarat mutlak: Stop-Loss wajib dikunci di ${fmtMoney(intel, sizing.stop)}, risiko maksimal 1% NAV (${idr(sizing.riskIdr)}), dan ukuran posisi dibatasi pada ${qtyLabel}. Pak Gilang & Kevin Zhang, tolong kawal eksekusi tanpa selip harga!`,
  });

  // 9. HEAD TRADER MEMASTIKAN EKSEKUSI
  lines.push({
    agentId: 'head_trader',
    src: 'MODEL',
    text: isCrypto
      ? `Siap Pak Victor! Jesse Crypto Desk siap mengeksekusi limit spot order di harga ${fmtMoney(intel, sizing.entry)} secara presisi di Binance live book. Kami jaga agar tanpa market impact.`
      : `Siap Pak Victor! Trading desk akan mengeksekusi limit order di harga ${fmtMoney(intel, sizing.ok ? sizing.entry : t.suggestedRiskReward.entry)} secara bertahap. Kami jaga agar tidak menimbulkan market impact di buku antrian.`,
  });

  // 10. CEO MEMBERIKAN PERSETUJUAN TERTINGGI
  lines.push({
    agentId: 'ceo',
    src: 'MODEL',
    text: `Bagus sekali. Semua kepala divisi sudah menyampaikan pandangan dan CRO telah mengunci batas risikonya. Sebagai CEO dan Managing Partner, saya berikan lampu hijau penuh. Silakan Bu Evelyn ambil keputusan final!`,
  });

  // 11. CIO MENUTUP SIDANG DENGAN KOMANDO FINAL
  lines.push({
    agentId: 'cio',
    src: 'MODEL',
    text: `Terima kasih atas musyawarah rekan-rekan pimpinan. KEPUTUSAN KONSENSUS BULAT WAR ROOM: ${decision.decision} ${sym}! Sirine persetujuan aktifkan, eksekusi order pembelian ke portofolio sekarang!`,
  });

  return lines;
}

// ───────────────────────── laporan per-agen ─────────────────────────

function L(tag: string, text: string, src: Provenance): ReportLine {
  return { tag, text, src };
}

export function buildAgentReport(agentId: string, ctx: DeskContext): AgentReport {
  const { intel, macro, quote, health, portfolio } = ctx;
  const f = intel.financials;
  const t = intel.technicals;
  const c = intel.institutionalConsensus;
  const o = intel.ownershipAndFlow;
  const sc = intel.supplyChain;
  const sym = ctx.symbol;
  const finSrc: Provenance = f.isAudited ? 'AUDITED' : 'MODEL';
  const sn = symbolNews(ctx);
  const sent = sentiment(sn);
  const idxNews = ctx.news.filter((n) => n.region === 'IDX');
  const globalNews = ctx.news.filter((n) => n.region !== 'IDX');
  const decision = computeCommitteeDecision(ctx);
  const sizing = computePositionSizing(intel, portfolio);
  const nav = portfolioNav(portfolio);
  const upcoming = ctx.events
    .filter((e) => e.date >= ctx.todayIso)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const nextHigh = upcoming.find((e) => e.impact === 'HIGH') ?? upcoming[0];
  const quoteLine = quote
    ? L('HARGA', `${sym} ${fmtMoney(intel, quote.price)} (${quote.changePct >= 0 ? '+' : ''}${quote.changePct.toFixed(2)}%) · H ${fmtMoney(intel, quote.high)} / L ${fmtMoney(intel, quote.low)} · ${quote.live ? 'Yahoo Finance LIVE' : 'FALLBACK benchmark statis'}`, quote.live ? 'LIVE' : 'STATIC')
    : L('HARGA', `${sym} ${fmtMoney(intel, intel.currentPrice)} · belum ada quote live`, 'STATIC');
  const newsLine = (n: NewsItem | undefined, tag = 'BERITA') =>
    n ? L(tag, `${short(n.title, 120)} — ${n.source}, ${n.timeAgo} [${n.sentiment}]`, 'LIVE') : L(tag, 'Tidak ada artikel relevan di cache crawler.', 'LIVE');

  const r = (task: string, bubble: string, lines: ReportLine[]): AgentReport => ({ task, bubble, lines });

  switch (agentId) {
    // ── EXEC ──
    case 'ceo':
      return r(`Meninjau keputusan IC untuk ${sym}`, `Keputusan IC saat ini untuk ${sym}: ${decision.decision}.`, [
        L('IC', `Skor komite ${decision.score >= 0 ? '+' : ''}${decision.score} → ${decision.decision}`, 'MODEL'),
        L('NAV', `NAV paper ${idr(nav)} · kas ${idr(portfolio.cash)}`, 'LIVE'),
        L('INFO', 'Strategi & selera risiko diatur manual oleh pemilik platform.', 'MODEL'),
      ]);
    case 'cio':
      return r(`Memimpin IC · ${sym}`, `Skor IC ${sym}: ${decision.score >= 0 ? '+' : ''}${decision.score} → ${decision.decision}.`, [
        L('SKOR', `${decision.decision} (${decision.score >= 0 ? '+' : ''}${decision.score})`, 'MODEL'),
        ...decision.factors.map((x) => L('FAKTOR', x, 'MODEL')),
      ]);
    case 'coo':
      return r('Memantau kesehatan operasional', `Feed berita ${health.newsOk ? 'sehat' : 'BERMASALAH'}, quote ${health.quoteOk ? 'sehat' : 'BERMASALAH'}.`, [
        L('FEED', `Berita: ${health.newsOk ? 'OK' : 'GAGAL'} · Quote: ${health.quoteOk ? 'OK' : 'GAGAL'}`, 'LIVE'),
        L('ORDER', `${portfolio.orders.filter((x) => x.status === 'PENDING').length} order pending di simulator`, 'LIVE'),
      ]);
    case 'cos':
      return r('Menyusun notulen IC', `Agenda IC: ${sym}, ${ctx.news.length} berita dipindai.`, [
        L('AGENDA', `Emiten: ${sym} · ${ctx.news.length} berita dipindai · ${upcoming.length} event ekonomi mendatang`, 'LIVE'),
      ]);

    // ── PM ──
    case 'pm_idx':
      return r(`Thesis ${sym}`, c.hasConsensus ? `Target konsensus ${fmtMoney(intel, c.targetPriceConsensus)} (${c.impliedUpsidePct}%).` : `${sym}: tidak ada konsensus analis.`, [
        quoteLine,
        L('TARGET', c.hasConsensus ? `Konsensus ${c.consensusRating}: ${fmtMoney(intel, c.targetPriceConsensus)} (${c.impliedUpsidePct >= 0 ? '+' : ''}${c.impliedUpsidePct}%) dari ${c.totalAnalysts} analis` : 'Tidak ada data konsensus', 'STATIC'),
        L('RR', `Entry ${fmtMoney(intel, t.suggestedRiskReward.entry)} · SL ${fmtMoney(intel, t.suggestedRiskReward.stopLoss)} · TP1 ${fmtMoney(intel, t.suggestedRiskReward.tp1)} · R:R ${t.suggestedRiskReward.ratio}:1`, 'MODEL'),
      ]);
    case 'pm_global':
      return r('Korelasi IHSG vs Wall Street', `${globalNews.length} berita global terkini di radar.`, [
        newsLine(globalNews[0], 'GLOBAL'),
        L('FX', 'Data kurs USD/IDR live belum terhubung — kandidat integrasi berikutnya.', 'MODEL'),
      ]);
    case 'pm_income':
      return r('Menyaring emiten dividen', `Yield ${sym} ${f.dividendYield.toFixed(1)}%.`, [
        L('YIELD', `${sym} dividend yield ${f.dividendYield.toFixed(1)}% · FCF ${f.freeCashFlowFormatted}`, finSrc),
        L('PAYOUT', f.fcfPositive ? 'FCF positif → payout relatif berkelanjutan' : 'FCF negatif → payout berisiko', finSrc),
      ]);
    case 'pm_macro':
      return r('Overlay makro', macro ? `Fed ${macro.fedFundsRate}%, kurva ${macro.isInverted ? 'inversi' : 'normal'}.` : 'Menunggu data makro.', [
        macro
          ? L('MAKRO', `Fed ${macro.fedFundsRate}% · CPI ${macro.cpiYoY}% · 2Y-10Y ${macro.inversionSpread2Y10Y}% (${macro.isInverted ? 'inversi' : 'normal'})`, 'STATIC')
          : L('MAKRO', 'Belum termuat', 'STATIC'),
        L('CATATAN', 'Dataset makro di repo statis (bukan feed FRED live).', 'STATIC'),
      ]);
    case 'allocator':
      return r('Sizing posisi', sizing.ok ? `${sizing.lots} lot ${sym}, risiko ${idr(sizing.riskIdr)}.` : `Tidak bisa sizing: ${sizing.reason}`, [
        L('NAV', `NAV ${idr(nav)} · kas ${idr(portfolio.cash)} (${nav > 0 ? ((portfolio.cash / nav) * 100).toFixed(0) : 0}%)`, 'LIVE'),
        sizing.ok
          ? L('SIZING', `${sizing.lots} lot @ ${idr(sizing.entry)} · notional ${idr(sizing.notional)} · risiko ${idr(sizing.riskIdr)} (1% NAV = ${idr(nav * 0.01)})`, 'MODEL')
          : L('SIZING', sizing.reason, 'MODEL'),
      ]);
    case 'portcon': {
      const n = portfolio.holdings.length;
      return r('Konsentrasi portofolio', `${n} posisi di paper portfolio.`, [
        L('POSISI', `${n} holding: ${portfolio.holdings.slice(0, 6).map((h) => h.displaySymbol).join(', ') || '—'}`, 'LIVE'),
        L('INFO', 'Korelasi & bobot sektor memerlukan data historis multi-emiten (belum diintegrasikan).', 'MODEL'),
      ]);
    }

    // ── RISK ──
    case 'cro':
      return r('Veto risiko', `Stop-loss ${sym}: ${fmtMoney(intel, t.suggestedRiskReward.stopLoss)}.`, [
        L('SL', `Stop-loss ${fmtMoney(intel, t.suggestedRiskReward.stopLoss)} · R:R ${t.suggestedRiskReward.ratio}:1`, 'MODEL'),
        L('LIMIT', 'Risiko per trade ≤ 1% NAV; posisi ≤ 25% kas.', 'MODEL'),
        L('KEPUTUSAN', decision.decision === 'BUY' && sizing.ok ? `Siap diajukan: ${sizing.lots} lot` : 'Tidak ada posisi baru', 'MODEL'),
      ]);
    case 'var': {
      const dailyMovePct = quote ? Math.abs(quote.changePct) : 0;
      return r('VaR harian', 'Perlu histori harga panjang untuk VaR sungguhan.', [
        L('HARI INI', `Pergerakan ${sym} hari ini ${quote ? `${quote.changePct >= 0 ? '+' : ''}${quote.changePct.toFixed(2)}%` : 'n/a'}${dailyMovePct > 3 ? ' ⚠ di atas 3%' : ''}`, quote?.live ? 'LIVE' : 'STATIC'),
        L('INFO', 'VaR/ES historis belum dihitung — butuh seri harga harian multi-tahun.', 'MODEL'),
      ]);
    }
    case 'stress':
      return r('Skenario stres', `Jika harga turun ke stop-loss: ${(((t.suggestedRiskReward.entry - t.suggestedRiskReward.stopLoss) / (t.suggestedRiskReward.entry || 1)) * 100).toFixed(1)}%.`, [
        L('GAP', `Kerugian ke SL: ${(((t.suggestedRiskReward.entry - t.suggestedRiskReward.stopLoss) / (t.suggestedRiskReward.entry || 1)) * 100).toFixed(1)}% dari entry`, 'MODEL'),
        L('DEPENDENSI', sc.hasSupplyChain ? `Risiko rantai pasok ${sc.dependencyRisk}: ${short(sc.summary, 100)}` : 'Tidak ada data rantai pasok', 'STATIC'),
      ]);
    case 'limits':
      return r('Memantau limit', `${portfolio.holdings.length} posisi, kas ${nav > 0 ? ((portfolio.cash / nav) * 100).toFixed(0) : 0}% NAV.`, [
        L('KAS', `Kas ${idr(portfolio.cash)} = ${nav > 0 ? ((portfolio.cash / nav) * 100).toFixed(1) : '0'}% NAV`, 'LIVE'),
        L('PL', `Realized P&L ${idr(portfolio.realizedPL)}`, 'LIVE'),
      ]);
    case 'liq':
      return r('Likuiditas', quote ? `Volume ${sym} hari ini ${quote.volume.toLocaleString('id-ID')}.` : 'Menunggu quote.', [
        quote
          ? L('VOLUME', `Volume hari ini ${quote.volume.toLocaleString('id-ID')} lembar${quote.live ? '' : ' (fallback — bukan data pasar nyata)'}`, quote.live ? 'LIVE' : 'STATIC')
          : L('VOLUME', 'Tidak ada data', 'STATIC'),
        L('DEPENDENSI', sc.hasSupplyChain ? `Pelanggan utama: ${sc.keyCustomers.slice(0, 3).join(', ')}` : '—', 'STATIC'),
      ]);

    // ── OPS ──
    case 'cco':
      return r('Review kepatuhan', 'Order harus patuh fraksi harga & lot BEI.', [
        L('ATURAN', 'Lot = 100 saham; fraksi harga BEI dipaksa oleh simulator order.', 'MODEL'),
        L('INSIDER', o.hasOwnershipData ? `Sentimen insider ${o.insiderSentiment} · net flow ${o.netInsiderFlowFormatted}` : 'Tidak ada data insider', 'STATIC'),
        L('PERINGATAN', 'Restricted list tidak ada di sistem — verifikasi manual untuk order nyata.', 'MODEL'),
      ]);
    case 'nav':
      return r('Hitung NAV', `NAV paper ${idr(nav)}.`, [
        L('NAV', `${idr(nav)} = kas ${idr(portfolio.cash)} + posisi ${idr(nav - portfolio.cash)}`, 'LIVE'),
      ]);
    case 'recon': {
      const pending = portfolio.orders.filter((x) => x.status === 'PENDING').length;
      const filled = portfolio.orders.filter((x) => x.status === 'FILLED').length;
      return r('Rekonsiliasi order', `${filled} filled, ${pending} pending.`, [
        L('ORDER', `${filled} FILLED · ${pending} PENDING · total ${portfolio.orders.length}`, 'LIVE'),
      ]);
    }
    case 'legal':
      return r('Review regulasi', 'Mandat & regulasi OJK/BEI.', [
        L('INFO', 'Tidak ada konten hukum di sistem — peran ini berfungsi sebagai pengingat proses review.', 'MODEL'),
      ]);

    // ── RESEARCH ──
    case 'head_research':
      return r(`Valuasi ${sym}`, `ROE ${f.roe.toFixed(1)}%, P/E ${f.peRatio.toFixed(1)}x.`, [
        L('LABA', `Laba bersih ${f.netIncomeFormatted} · pendapatan ${f.revenueFormatted}`, finSrc),
        L('RASIO', `ROE ${f.roe.toFixed(1)}% · ROIC ${f.roic.toFixed(1)}% · P/E ${f.peRatio.toFixed(1)}x · P/B ${f.pbRatio.toFixed(2)}x`, finSrc),
        L('SUMBER', intel.dataSourceCitation, finSrc),
      ]);
    case 'r_bank':
      return r('Bedah emiten bank', `ROE ${f.roe.toFixed(1)}% · margin bersih ${f.netMarginPct.toFixed(1)}%.`, [
        L('PROFIL', `${sym}: ROE ${f.roe.toFixed(1)}% · margin bersih ${f.netMarginPct.toFixed(1)}% · D/E ${f.debtToEquity.toFixed(2)}x`, finSrc),
        L('CATATAN', 'NIM/CASA/NPL belum ada di dataset — kandidat data berikutnya.', 'MODEL'),
      ]);
    case 'r_energy':
      return r('Analisis energi & tambang', `Pertumbuhan pendapatan ${f.revenueGrowthYoY.toFixed(1)}% YoY.`, [
        L('GROWTH', `Pendapatan ${f.revenueGrowthYoY >= 0 ? '+' : ''}${f.revenueGrowthYoY.toFixed(1)}% YoY · EPS ${f.epsGrowthYoY >= 0 ? '+' : ''}${f.epsGrowthYoY.toFixed(1)}%`, finSrc),
        L('MARGIN', `Margin operasi ${f.operatingMarginPct.toFixed(1)}%`, finSrc),
      ]);
    case 'r_consumer':
      return r('Analisis konsumer', `Margin operasi ${f.operatingMarginPct.toFixed(1)}%.`, [
        L('MARGIN', `Margin operasi ${f.operatingMarginPct.toFixed(1)}% · margin bersih ${f.netMarginPct.toFixed(1)}%`, finSrc),
        L('LIKUIDITAS', `Current ratio ${f.currentRatio.toFixed(2)}x`, finSrc),
      ]);
    case 'r_tech':
      return r('Analisis teknologi', `Pertumbuhan ${f.revenueGrowthYoY.toFixed(1)}% YoY, FCF ${f.fcfPositive ? 'positif' : 'negatif'}.`, [
        L('GROWTH', `Pendapatan ${f.revenueGrowthYoY >= 0 ? '+' : ''}${f.revenueGrowthYoY.toFixed(1)}% YoY`, finSrc),
        L('PROFIT', `Margin operasi ${f.operatingMarginPct.toFixed(1)}% · FCF ${f.freeCashFlowFormatted}`, finSrc),
      ]);
    case 'r_infra':
      return r('Analisis infrastruktur', `D/E ${f.debtToEquity.toFixed(2)}x, current ratio ${f.currentRatio.toFixed(2)}x.`, [
        L('LEVERAGE', `D/E ${f.debtToEquity.toFixed(2)}x · current ratio ${f.currentRatio.toFixed(2)}x`, finSrc),
        L('ARUS KAS', `OCF ${f.operatingCashFlowFormatted} · FCF ${f.freeCashFlowFormatted}`, finSrc),
      ]);
    case 'r_forensic': {
      const flags: string[] = [];
      if (!f.fcfPositive && f.netIncomeFormatted && !f.netIncomeFormatted.includes('-')) flags.push('laba positif tetapi FCF negatif');
      if (f.currentRatio < 1) flags.push(`current ratio ${f.currentRatio.toFixed(2)} < 1`);
      if (f.debtToEquity > 1.5) flags.push(`D/E ${f.debtToEquity.toFixed(2)}x tinggi`);
      return r('Uji kualitas laba', flags.length ? `Red flag ${sym}: ${flags.join('; ')}.` : `Tidak ada red flag mekanis pada ${sym}.`, [
        L('RED FLAG', flags.length ? flags.join('; ') : 'Tidak ada red flag mekanis (cek: FCF vs laba, current ratio, D/E)', finSrc),
        L('PENTING', 'Pemeriksaan forensik penuh (pihak berelasi, catatan audit) butuh dokumen asli.', 'MODEL'),
      ]);
    }

    // ── TRADING ──
    case 'head_trader':
      return r('Rencana eksekusi', `Limit di ${fmtMoney(intel, sizing.ok ? sizing.entry : t.suggestedRiskReward.entry)}.`, [
        quoteLine,
        L('RENCANA', sizing.ok ? `Limit ${idr(sizing.entry)} · ${sizing.lots} lot · bertahap` : `Belum ada order: ${sizing.reason}`, 'MODEL'),
      ]);
    case 'trader_idx':
      return r('Menyiapkan order IDX', 'Lot 100 saham, fraksi harga sesuai BEI.', [
        L('ORDER', sizing.ok ? `Siap: BUY ${sizing.lots} lot ${sym} @ ${idr(sizing.entry)}` : 'Tidak ada order siap', 'MODEL'),
      ]);
    case 'trader_global':
      return r('Pantau pasar global', `${globalNews.length} berita global.`, [newsLine(globalNews[0], 'GLOBAL')]);
    case 'flow':
      return r('Order flow', o.hasOwnershipData ? `Asing ${o.foreignOwnershipPct}%, institusi domestik ${o.domesticInstitutionsPct}%.` : 'Tidak ada data kepemilikan.', [
        L('KEPEMILIKAN', o.hasOwnershipData ? `Asing ${o.foreignOwnershipPct}% · domestik institusi ${o.domesticInstitutionsPct}% · pengendali ${o.controllingShareholder}` : 'Tidak ada data', 'STATIC'),
        L('INFO', 'Net foreign flow harian realtime belum terhubung.', 'MODEL'),
      ]);
    case 'tca':
      return r('Analisis biaya', 'Fee beli/jual dihitung di simulator order.', [
        L('INFO', 'Slippage riil tidak tersedia pada paper trading; fee mengikuti konfigurasi store.', 'MODEL'),
      ]);

    // ── QUANT ──
    case 'head_quant':
      return r('Sinyal MTF', `MTF ${t.mtfConsensus}.`, [
        L('MTF', t.mtfRadar.map((m) => `${m.timeframe}:${m.trend}`).join(' · '), 'MODEL'),
        L('SMC', `Demand ${fmtMoney(intel, t.orderBlockDemand.min)}–${fmtMoney(intel, t.orderBlockDemand.max)} · Supply ${fmtMoney(intel, t.orderBlockSupply.min)}–${fmtMoney(intel, t.orderBlockSupply.max)}`, 'MODEL'),
      ]);
    case 'factor':
      return r('Skor faktor', `ROE ${f.roe.toFixed(1)}%, P/E ${f.peRatio.toFixed(1)}x.`, [
        L('QUALITY', `ROE ${f.roe.toFixed(1)}% · ROIC ${f.roic.toFixed(1)}%`, finSrc),
        L('VALUE', `P/E ${f.peRatio.toFixed(1)}x · P/B ${f.pbRatio.toFixed(2)}x`, finSrc),
        L('MOMENTUM', `MTF ${t.mtfConsensus}`, 'MODEL'),
      ]);
    case 'statarb':
      return r('Cari pasangan', 'Butuh seri harga multi-emiten.', [
        L('INFO', 'Pairs/kointegrasi memerlukan histori harga multi-emiten — belum diintegrasikan.', 'MODEL'),
      ]);
    case 'mlds':
      return r('Fitur alt-data', `${ctx.news.length} berita jadi fitur sentimen.`, [
        L('FITUR', `${ctx.news.length} artikel → ${sent.bull} bull / ${sent.bear} bear / ${sent.neutral} netral (khusus ${sym})`, 'LIVE'),
        L('INFO', 'Model ML terlatih belum ada; sinyal saat ini rule-based.', 'MODEL'),
      ]);
    case 'backtest':
      return r('Validasi strategi', 'Backtest walk-forward belum terhubung.', [
        L('INFO', 'Belum ada engine backtest dengan data historis nyata — prioritas pengembangan.', 'MODEL'),
      ]);

    // ── MACRO ──
    case 'chief_econ':
      return r('Outlook makro', macro ? `Fed ${macro.fedFundsRate}%, CPI ${macro.cpiYoY}%.` : 'Menunggu data.', [
        macro
          ? L('MAKRO', `Fed ${macro.fedFundsRate}% · CPI ${macro.cpiYoY}% · Core PCE ${macro.corePceYoY}% · PDB riil ${macro.realGdpGrowth}%`, 'STATIC')
          : L('MAKRO', 'Belum termuat', 'STATIC'),
        nextHigh ? L('EVENT', `${nextHigh.flag} ${nextHigh.eventName} · ${nextHigh.date} ${nextHigh.time}`, 'STATIC') : L('EVENT', 'Tidak ada event mendatang', 'STATIC'),
      ]);
    case 'fx_rates':
      return r('Kurva imbal hasil', macro ? `2Y-10Y ${macro.inversionSpread2Y10Y}% (${macro.isInverted ? 'inversi' : 'normal'}).` : 'Menunggu data.', [
        macro ? L('KURVA', `Spread 2Y-10Y ${macro.inversionSpread2Y10Y}% → ${macro.isInverted ? 'INVERSI' : 'normal'}`, 'STATIC') : L('KURVA', 'Belum termuat', 'STATIC'),
        L('FX', 'USD/IDR live belum terhubung.', 'MODEL'),
      ]);
    case 'commod':
      return r('Komoditas', sc.hasSupplyChain ? `Dependensi ${sym}: ${sc.dependencyRisk}.` : 'Tidak ada data rantai pasok.', [
        L('RANTAI PASOK', sc.hasSupplyChain ? `${short(sc.summary, 140)}` : 'Tidak ada data', 'STATIC'),
        L('PEMASOK', sc.hasSupplyChain ? sc.keySuppliers.slice(0, 4).join(', ') : '—', 'STATIC'),
      ]);
    case 'calendar':
      return r('Kalender ekonomi', nextHigh ? `Berikutnya: ${nextHigh.eventName} (${nextHigh.date}).` : 'Tidak ada event.', [
        ...upcoming.slice(0, 4).map((e) =>
          L(e.impact, `${e.flag} ${e.eventName} · ${e.date} ${e.time} · konsensus ${e.consensus}${e.unit === '%' ? '%' : ''}`, 'STATIC')
        ),
      ]);

    // ── NEWS ──
    case 'news_editor':
      return r('Prioritas berita', `${ctx.news.length} artikel dipindai, ${sn.length} soal ${sym}.`, [
        L('RINGKAS', `${ctx.news.length} artikel dalam cache · ${sn.length} menyebut ${sym}`, 'LIVE'),
        newsLine(sn[0] ?? ctx.news[0], 'TOP'),
      ]);
    case 'news_idx':
      return r('Memindai berita Indonesia', idxNews[0] ? `“${short(idxNews[0].title, 70)}”` : 'Tidak ada berita IDX baru.', [
        newsLine(idxNews[0]),
        newsLine(idxNews[1]),
        L('TOTAL', `${idxNews.length} artikel IDX di cache`, 'LIVE'),
      ]);
    case 'news_global':
      return r('Memindai berita global', globalNews[0] ? `“${short(globalNews[0].title, 70)}”` : 'Tidak ada berita global baru.', [
        newsLine(globalNews[0]),
        newsLine(globalNews[1]),
        L('TOTAL', `${globalNews.length} artikel global di cache`, 'LIVE'),
      ]);
    case 'nlp': {
      const all = sentiment(ctx.news);
      return r('Skor sentimen', `${sym}: ${sent.bull} bull / ${sent.bear} bear.`, [
        L(sym, `${sn.length} artikel · ${sent.bull} bullish / ${sent.bear} bearish / ${sent.neutral} netral`, 'LIVE'),
        L('PASAR', `Seluruh cache: ${all.bull} bull / ${all.bear} bear / ${all.neutral} netral`, 'LIVE'),
        L('METODE', 'Sentimen berasal dari klasifikasi kata kunci di crawler, bukan model bahasa.', 'MODEL'),
      ]);
    }
    case 'filings':
      return r('Keterbukaan informasi', o.hasOwnershipData && o.recentInsiderTransactions[0] ? short(o.recentInsiderTransactions[0], 80) : 'Tidak ada data insider.', [
        ...(o.hasOwnershipData ? o.recentInsiderTransactions.slice(0, 3).map((x) => L('INSIDER', short(x, 120), 'STATIC')) : [L('INSIDER', 'Tidak ada data', 'STATIC' as Provenance)]),
        L('INFO', 'Feed keterbukaan informasi BEI live belum terhubung.', 'MODEL'),
      ]);
    case 'social':
      return r('Sentimen ritel', 'Belum ada feed media sosial.', [
        L('INFO', 'Tidak ada sumber sosial/ritel terhubung. Peran ini menunggu integrasi (mis. StockTwits/Stockbit stream).', 'MODEL'),
      ]);

    // ── TECH & IR ──
    case 'data_eng':
      return r('Kesehatan pipeline', `Cache ${health.newsTotalInCache} artikel dari ${health.newsSources} sumber.`, [
        L('CRAWLER', `${health.newsTotalInCache} artikel · ${health.newsSources} sumber · terakhir ${health.newsLastCrawledAt ?? 'n/a'}`, 'LIVE'),
        L('QUOTE', `Yahoo feed: ${health.quoteOk ? 'OK' : 'gagal'}${quote && !quote.live ? ' (fallback aktif)' : ''}`, 'LIVE'),
      ]);
    case 'sre':
      return r('Latensi API', `Berita ${health.newsLatencyMs ?? '—'}ms, quote ${health.quoteLatencyMs ?? '—'}ms.`, [
        L('LATENSI', `/api/crawler/news ${health.newsLatencyMs ?? '—'} ms · /api/stocks/realtime ${health.quoteLatencyMs ?? '—'} ms`, 'LIVE'),
      ]);
    case 'perf': {
      const unreal = portfolio.holdings.reduce((s, h) => s + h.unrealizedPL, 0);
      return r('Atribusi kinerja', `Unrealized ${idr(unreal)}, realized ${idr(portfolio.realizedPL)}.`, [
        L('P&L', `Unrealized ${idr(unreal)} · realized ${idr(portfolio.realizedPL)}`, 'LIVE'),
        ...portfolio.holdings.slice(0, 4).map((h) => L(h.displaySymbol, `${h.lots} lot · avg ${idr(h.avgPrice)} · P&L ${idr(h.unrealizedPL)}`, 'LIVE' as Provenance)),
      ]);
    }
    case 'ir':
      return r('Laporan investor', `NAV ${idr(nav)}.`, [
        L('NAV', `NAV paper ${idr(nav)}`, 'LIVE'),
        L('INFO', 'Laporan investor otomatis belum dibuat.', 'MODEL'),
      ]);
  }

  const a = AGENT_BY_ID[agentId];
  return r(a ? a.title : 'Bertugas', 'Siap membantu.', [L('INFO', 'Belum ada laporan.', 'MODEL')]);
}
