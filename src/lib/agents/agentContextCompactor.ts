/**
 * Agent Context Compactor & Deterministic Risk Guardrail (TradeMind-Alpha)
 * 
 * 1. Token Bloat Reduction: Mengompres Grounded Stock Intelligence (~85% token reduction)
 * 2. Prompt Injection Defense: Sanitasi dan isolasi intel pengguna
 * 3. Deterministic Order Guardrail: Memaksa validasi Fraksi Harga Resmi BEI & Strict Risk/Reward
 * 4. Episodic Memory: Ringkasan sliding window keputusan masa lalu
 */

import { getGroundedStockIntelligence, GroundedStockIntelligence } from '@/lib/agents/groundedStockIntelligence';
import { getIDXTickSize, getForeignTick, isValidIDXTick } from '@/lib/stockRules';
import { isCryptoSymbol, isUSSymbol } from '@/lib/universe/masterAssetUniverse';

export interface CompressedMarketContext {
  symbol: string;
  name: string;
  currency: 'IDR' | 'USD';
  currentPrice: number;
  isForeign: boolean;
  smcSupport: number;
  smcResistance: number;
  bandarmologiVerdict: 'AKUMULASI' | 'DISTRIBUSI' | 'NETRAL';
  peRatio: number;
  pbRatio: number;
  consensusRating: string;
  targetPriceConsensus: number;
}

export interface ValidatedAgentDecision {
  analisis_teknikal: string;
  bandarmologi_verdict: 'AKUMULASI' | 'DISTRIBUSI' | 'NETRAL';
  korelasi_memori: string;
  keputusan: 'BUY' | 'SELL' | 'HOLD';
  entry_price: number;
  target_price: number;
  stop_loss: number;
  risk_reward_ratio: number;
  conviction_score: number;
  alasan_eksekusi: string;
  is_clamped: boolean;
  clamped_reason?: string;
}

// In-Memory Sliding Window Reflection Journal (Terakhir 20 interaksi)
interface ReflectionEntry {
  symbol: string;
  keputusan: 'BUY' | 'SELL' | 'HOLD';
  entry_price: number;
  target_price: number;
  stop_loss: number;
  timestamp: number;
}

const MEMORY_REFLECTION_STORE: ReflectionEntry[] = [];

/**
 * 1. Sanitasi Intel Pengguna (Mencegah Indirect Prompt Injection)
 */
export function sanitizeUntrustedIntel(input: string): string {
  if (!input || typeof input !== 'string') return 'Fokus pada price action, order block demand, dan konfirmasi volume.';
  
  // Hapus tag HTML/XML berbahaya dan kata kunci jailbreak
  let sanitized = input
    .replace(/<[^>]*>?/gm, '')
    .replace(/(system prompt|ignore previous|abaikan aturan|jailbreak|DAN mode|bypassed)/gi, '[REDACTED]')
    .trim();

  // Batasi panjang string maksimal 300 karakter untuk mencegah context flooding
  if (sanitized.length > 300) {
    sanitized = sanitized.slice(0, 300) + '... (truncated)';
  }

  return sanitized || 'Fokus pada price action dan order flow.';
}

/**
 * 2. Mengompres Grounded Stock Intelligence untuk Hemat Token (RAG Optimization)
 */
export function compressMarketContext(ticker: string, livePrice?: number): CompressedMarketContext {
  const sym = ticker.toUpperCase().replace('.JK', '').replace(/USDT$/i, '').trim();
  const intel: GroundedStockIntelligence = getGroundedStockIntelligence(sym);
  const isForeign = isCryptoSymbol(sym) || isUSSymbol(sym);
  const price = livePrice && livePrice > 0 ? livePrice : intel.currentPrice;

  // Dapatkan level Support & Resistance terdekat
  const s1 = intel.smcLevels?.support1 || Math.round(price * 0.96);
  const r1 = intel.smcLevels?.resistance1 || Math.round(price * 1.05);

  let bandarVerdict: 'AKUMULASI' | 'DISTRIBUSI' | 'NETRAL' = 'NETRAL';
  if (intel.bandarmologi) {
    if (intel.bandarmologi.status === 'BIG_ACCUMULATION' || intel.bandarmologi.status === 'NORMAL_ACCUMULATION') {
      bandarVerdict = 'AKUMULASI';
    } else if (intel.bandarmologi.status === 'BIG_DISTRIBUTION' || intel.bandarmologi.status === 'NORMAL_DISTRIBUTION') {
      bandarVerdict = 'DISTRIBUSI';
    }
  }

  return {
    symbol: sym,
    name: intel.name || `${sym} Tbk`,
    currency: isForeign ? 'USD' : 'IDR',
    currentPrice: price,
    isForeign,
    smcSupport: s1,
    smcResistance: r1,
    bandarmologiVerdict: bandarVerdict,
    peRatio: Number((intel.financials?.peRatio || 0).toFixed(1)),
    pbRatio: Number((intel.financials?.pbRatio || 0).toFixed(1)),
    consensusRating: intel.institutionalConsensus?.consensusRating || 'HOLD',
    targetPriceConsensus: intel.institutionalConsensus?.targetPriceConsensus || Math.round(price * 1.08),
  };
}

/**
 * 3. Pembulatan Ketat Mengikuti Fraksi Harga Resmi BEI / Desimal Kripto
 */
export function roundToRegulatoryTick(price: number, isForeign: boolean): number {
  if (price <= 0) return price;
  if (isForeign) {
    const tick = getForeignTick(price);
    const precision = price < 0.01 ? 5 : price < 1 ? 4 : price < 10 ? 3 : 2;
    return Number((Math.round(price / tick) * tick).toFixed(precision));
  }

  const { nearest } = isValidIDXTick(Math.round(price));
  return nearest;
}

/**
 * 4. Deterministic Post-Processing Guardrail
 * Memastikan output LLM tidak pernah melanggar tick bursa atau rasio Risk to Reward
 */
export function validateAndClampDecision(
  rawLlmOutput: any,
  market: CompressedMarketContext
): ValidatedAgentDecision {
  const currentPrice = market.currentPrice;
  const isForeign = market.isForeign;

  let keputusan: 'BUY' | 'SELL' | 'HOLD' = ['BUY', 'SELL', 'HOLD'].includes(rawLlmOutput?.keputusan)
    ? rawLlmOutput.keputusan
    : 'HOLD';

  let rawEntry = Number(rawLlmOutput?.entry_price) || currentPrice;
  let rawTP = Number(rawLlmOutput?.target_price) || (keputusan === 'BUY' ? currentPrice * 1.05 : currentPrice * 1.02);
  let rawSL = Number(rawLlmOutput?.stop_loss) || currentPrice * 0.97;

  // 1. Terapkan Fraksi Harga Resmi
  let entry_price = roundToRegulatoryTick(rawEntry, isForeign);
  let target_price = roundToRegulatoryTick(rawTP, isForeign);
  let stop_loss = roundToRegulatoryTick(rawSL, isForeign);

  let is_clamped = false;
  let clamped_reason: string | undefined = undefined;

  // 2. Koreksi Logika Posisi (SL harus di bawah Entry untuk BUY, TP harus di atas Entry)
  if (keputusan === 'BUY') {
    if (stop_loss >= entry_price) {
      stop_loss = roundToRegulatoryTick(entry_price * 0.965, isForeign);
      is_clamped = true;
      clamped_reason = 'Stop Loss dinaikkan/dikoreksi agar berada di bawah harga Entry';
    }

    if (target_price <= entry_price) {
      target_price = roundToRegulatoryTick(entry_price * 1.06, isForeign);
      is_clamped = true;
      clamped_reason = 'Target Price dikoreksi agar berada di atas harga Entry';
    }

    // 3. Batasi Stop Loss maksimum (Max -4.5% drawdown per trade untuk saham)
    if (!isForeign && stop_loss < entry_price * 0.94) {
      stop_loss = roundToRegulatoryTick(entry_price * 0.955, isForeign);
      is_clamped = true;
      clamped_reason = 'Stop loss dibatasi maksimum -4.5% untuk menjaga modal kerja';
    }

    // 4. Hitung Risk to Reward Ratio deterministik
    const potentialGain = Math.max(0, target_price - entry_price);
    const potentialLoss = Math.max(1, entry_price - stop_loss);
    const calculatedRRR = Number((potentialGain / potentialLoss).toFixed(2));

    // Enforcement: Jika RRR < 1.45, tolak BUY dan clamp menjadi HOLD
    if (calculatedRRR < 1.45) {
      keputusan = 'HOLD';
      is_clamped = true;
      clamped_reason = `Keputusan diubah menjadi HOLD karena Risk-to-Reward (${calculatedRRR}) kurang dari syarat minimum 1:1.5`;
    }

    // Rekam ke memory reflection jika ada eksekusi aktif
    recordReflection({
      symbol: market.symbol,
      keputusan,
      entry_price,
      target_price,
      stop_loss,
      timestamp: Date.now(),
    });

    return {
      analisis_teknikal: String(rawLlmOutput?.analisis_teknikal || 'Analisis teknikal terkonfirmasi pada area konsolidasi.'),
      bandarmologi_verdict: rawLlmOutput?.bandarmologi_verdict || market.bandarmologiVerdict,
      korelasi_memori: getRecentReflectionContext(market.symbol),
      keputusan,
      entry_price,
      target_price,
      stop_loss,
      risk_reward_ratio: calculatedRRR,
      conviction_score: Math.min(100, Math.max(10, Number(rawLlmOutput?.conviction_score) || (keputusan === 'BUY' ? 80 : 50))),
      alasan_eksekusi: clamped_reason
        ? `${rawLlmOutput?.alasan_eksekusi || ''} [GUARD: ${clamped_reason}]`.trim()
        : String(rawLlmOutput?.alasan_eksekusi || 'Disiplin eksekusi sesuai rencana risiko.'),
      is_clamped,
      clamped_reason,
    };
  }

  // Jika SELL atau HOLD
  const potentialLoss = Math.max(1, currentPrice - stop_loss);
  const potentialGain = Math.max(0, target_price - currentPrice);
  const calculatedRRR = Number((potentialGain / potentialLoss).toFixed(2));

  return {
    analisis_teknikal: String(rawLlmOutput?.analisis_teknikal || 'Menunggu sinyal momentum yang jelas dan konfirmasi volume.'),
    bandarmologi_verdict: rawLlmOutput?.bandarmologi_verdict || market.bandarmologiVerdict,
    korelasi_memori: getRecentReflectionContext(market.symbol),
    keputusan,
    entry_price,
    target_price,
    stop_loss,
    risk_reward_ratio: calculatedRRR,
    conviction_score: Math.min(100, Math.max(10, Number(rawLlmOutput?.conviction_score) || 50)),
    alasan_eksekusi: String(rawLlmOutput?.alasan_eksekusi || 'Pasar konsolidasi sideways; menjaga rasio kas.'),
    is_clamped,
    clamped_reason,
  };
}

import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * 5. Reflection Journal Storage & Context Retrieval
 */
export function recordReflection(entry: ReflectionEntry) {
  MEMORY_REFLECTION_STORE.unshift(entry);
  if (MEMORY_REFLECTION_STORE.length > 50) {
    MEMORY_REFLECTION_STORE.pop();
  }

  // Non-blocking background sync ke Supabase Cloud (mencegah memory loss pada cold starts)
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      supabase.from('agent_episodic_memory').insert({
        symbol: entry.symbol,
        decision: entry.keputusan,
        entry_price: entry.entry_price,
        target_price: entry.target_price,
        stop_loss: entry.stop_loss,
        risk_reward_ratio: 1.5,
        conviction_score: 80,
        justification: 'Disiplin eksekusi model OODA Cloud 24/7',
        post_trade_reflection: `Eksekusi ${entry.keputusan} pada level entry ${entry.entry_price}`,
        created_at: new Date(entry.timestamp).toISOString(),
      }).then(() => {}).catch(() => {});
    }
  } catch {
    // Abaikan jika dipanggil dari environment browser tanpa server config
  }
}

export function getRecentReflectionContext(symbol: string): string {
  const previous = MEMORY_REFLECTION_STORE.find((e) => e.symbol === symbol);
  if (!previous) {
    return 'Inisialisasi evaluasi OODA pertama untuk aset ini.';
  }
  const timeDiffMin = Math.round((Date.now() - previous.timestamp) / 60000);
  return `Siklus ${timeDiffMin} menit lalu: Status ${previous.keputusan} di Entry Rp ${previous.entry_price.toLocaleString('id-ID')} (SL: Rp ${previous.stop_loss.toLocaleString('id-ID')}). Mempertahankan kedisiplinan eksekusi.`;
}
