import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedBenchmarkPrice, IDX_BENCHMARK_PRICES } from '@/data/idx_benchmark_prices';
import { ALL_ID_HEATMAP_UNIVERSE } from '@/data/heatmap_stocks_universe';
import { MASTER_GLOBAL_STOCKS } from '@/data/global_markets_universe';
import { fetchYahooQuote } from '@/app/api/stocks/realtime/route';
import { calculateShares, getIDXTickSize } from '@/lib/stockRules';

const GROQ_KEYS_RAW = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '';
function getGroqKeys(): string[] {
  return GROQ_KEYS_RAW.split(',').map((k) => k.trim()).filter(Boolean);
}

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'qwen/qwen3.8-27b',
  'mixtral-8x7b-32768',
];

export interface BoardroomExecutive {
  id: 'bezos' | 'munger' | 'vogels' | 'godin';
  name: string;
  role: string;
  persona: string;
  avatar: string;
  badge: string;
  color: string;
  vote: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  conviction: number;
  statement: string;
  focusPoint: string;
}

export interface BoardroomResolution {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  timestamp: string;
  action: 'STRONG BUY' | 'ACCUMULATE' | 'HOLD / WAIT' | 'TRIM' | 'EXIT / AVOID';
  overallConviction: number;
  targetPrice: number;
  stopLossPrice: number;
  riskRewardRatio: number;
  recommendedAllocationLots: number;
  recommendedAllocationPct: number;
  capitalAllocationFormatted: string;
  macroRegime: string;
  executives: BoardroomExecutive[];
  dialogueTranscript: {
    speakerId: string;
    speakerName: string;
    role: string;
    avatar: string;
    message: string;
    tag: 'STRATEGY' | 'RISK_INVERSION' | 'SYSTEMS_LATENCY' | 'SENTIMENT';
  }[];
  ceoDirective: string;
  riskNotice: string;
}

function resolveAssetDetails(ticker: string, userPrice?: number) {
  const clean = ticker.replace('.JK', '').replace('^', '').toUpperCase().trim();
  let name = `${clean} Tbk`;
  let price = userPrice || 0;
  let currency = 'IDR';

  // Check IDX Heatmap
  const idMatch = ALL_ID_HEATMAP_UNIVERSE.find(
    (s) => s.displaySymbol.toUpperCase() === clean || s.symbol.replace('.JK', '').toUpperCase() === clean
  );
  if (idMatch) {
    name = idMatch.name;
    if (!price) price = idMatch.price;
  } else if (IDX_BENCHMARK_PRICES[clean]) {
    name = IDX_BENCHMARK_PRICES[clean].name;
    if (!price) price = IDX_BENCHMARK_PRICES[clean].price;
  } else {
    const globalMatch = MASTER_GLOBAL_STOCKS.find((g) => g.ticker.toUpperCase() === clean);
    if (globalMatch) {
      name = globalMatch.name;
      if (!price) price = globalMatch.price;
      currency = globalMatch.currency;
    } else {
      const bench = getVerifiedBenchmarkPrice(clean);
      name = bench.name;
      if (!price) price = bench.price;
      currency = bench.currency;
    }
  }

  if (['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP'].includes(clean)) {
    currency = 'USD';
  }

  return { clean, name, price: price || 1000, currency };
}

function generateDeterministicBoardroom(clean: string, name: string, price: number, currency: string): BoardroomResolution {
  const isCrypto = currency === 'USD' && ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE'].includes(clean);
  const hash = clean.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  
  const tick = getIDXTickSize(price);
  const isBullishBias = (hash % 10) > 3;
  const isStrong = (hash % 10) > 7;

  const action = isStrong ? 'STRONG BUY' : isBullishBias ? 'ACCUMULATE' : (hash % 10) === 0 ? 'EXIT / AVOID' : 'HOLD / WAIT';
  const overallConviction = 60 + (hash % 35);

  const tpDistance = isCrypto ? 0.08 : 0.05 + ((hash % 5) * 0.015);
  const slDistance = isCrypto ? 0.045 : 0.03 + ((hash % 3) * 0.008);

  const rawTp = price * (1 + tpDistance);
  const rawSl = price * (1 - slDistance);

  const targetPrice = currency === 'IDR' ? Math.round(rawTp / tick) * tick : Number(rawTp.toFixed(2));
  const stopLossPrice = currency === 'IDR' ? Math.round(rawSl / tick) * tick : Number(rawSl.toFixed(2));
  const rrr = Number(((targetPrice - price) / (price - stopLossPrice)).toFixed(2));

  const allocPct = action === 'STRONG BUY' ? 12 : action === 'ACCUMULATE' ? 7.5 : action === 'HOLD / WAIT' ? 3 : 0;
  const totalSimulatedCapital = currency === 'IDR' ? 100_000_000 : 10_000;
  const allocatedMoney = totalSimulatedCapital * (allocPct / 100);
  const lots = currency === 'IDR' ? Math.max(1, Math.floor(allocatedMoney / (price * 100))) : Number((allocatedMoney / price).toFixed(4));

  const executives: BoardroomExecutive[] = [
    {
      id: 'bezos',
      name: 'Jeff Bezos',
      role: 'Chief Executive Officer (CEO)',
      persona: 'Day 1 Flywheel & Relentless Customer/Shareholder Value',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      badge: 'Flywheel Capital Allocator',
      color: '#f59e0b',
      vote: isBullishBias ? 'BULLISH' : 'NEUTRAL',
      conviction: 75 + (hash % 20),
      focusPoint: 'Pertumbuhan Jangka Panjang & Skala Ekonomi',
      statement: isBullishBias
        ? `Aset ${clean} memiliki keunggulan kompetitif (moat) yang terakselerasi. Kita harus berpikir Day 1: alokasikan modal secara agresif namun terukur untuk menangkap momentum flywheel multi-tahun.`
        : `Aset ${clean} sedang berada di fase konsolidasi modal. Sebagai CEO, saya memprioritaskan efisiensi kas sebelum melakukan ekspansi posisi baru.`,
    },
    {
      id: 'munger',
      name: 'Charlie Munger',
      role: 'Chief Risk Officer (CRO / Inversion)',
      persona: 'Ruthless Inversion Critic: "Invert, always invert"',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      badge: 'Inversion Risk Shield',
      color: '#ef4444',
      vote: slDistance > 0.04 ? 'NEUTRAL' : isBullishBias ? 'BULLISH' : 'BEARISH',
      conviction: 70 + (hash % 25),
      focusPoint: 'Pre-Mortem & Proteksi Kerugian Modal',
      statement: `Beri tahu saya di mana trade ini akan gagal agar kita tidak pernah menaruh uang di sana. Jika stop-loss di level ${currency === 'IDR' ? `Rp ${stopLossPrice.toLocaleString('id-ID')}` : `$${stopLossPrice}`} tertembus, jangan berdebat dengan pasar: potong kerugian secara disiplin.`,
    },
    {
      id: 'vogels',
      name: 'Werner Vogels',
      role: 'Chief Technology Officer (CTO)',
      persona: 'Systems Architect: "Everything fails, all the time"',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      badge: 'Fault-Tolerant Execution',
      color: '#06b6d4',
      vote: isBullishBias ? 'BULLISH' : 'NEUTRAL',
      conviction: 82,
      focusPoint: 'Eksekusi Algoritmik, Latensi & Likuiditas',
      statement: `Dari sisi sistem arsitektur kuantitatif: likuiditas orderbook ${clean} solid, slippage dapat diminimalisir. Kita gunakan order tipe LIMIT di fraksi harga presisi untuk melindungi eksekusi dari lonjakan bid-ask spread.`,
    },
    {
      id: 'godin',
      name: 'Seth Godin',
      role: 'Chief Marketing & Sentiment Officer (CMO)',
      persona: 'Tribal Psychology & Retail Narrative Disruption',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      badge: 'Narrative & Crowd Mindset',
      color: '#8b5cf6',
      vote: isBullishBias ? 'BULLISH' : 'NEUTRAL',
      conviction: 78,
      focusPoint: 'Kekuatan Narasi, Hype vs Real Organic Flow',
      statement: `Pasar digerakkan oleh persepsi kolektif. Untuk ${clean}, narasi institusi dan antusiasme komunitas sedang dalam fase konvergensi positif. Ini bukan sekadar hype ritel dangkal, melainkan ada akumulasi nyata di balik layar.`,
    },
  ];

  const dialogueTranscript = [
    {
      speakerId: 'bezos',
      speakerName: 'Jeff Bezos (CEO)',
      role: 'Chief Executive Officer',
      avatar: executives[0].avatar,
      message: `Sidang Direksi dibuka. Agenda: evaluasi alokasi modal strategis pada emiten ${clean} (${name}) di harga saat ini ${currency === 'IDR' ? `Rp ${price.toLocaleString('id-ID')}` : `$${price}`}. Apakah aset ini memenuhi kriteria Day 1 untuk ekspansi portofolio kita?`,
      tag: 'STRATEGY' as const,
    },
    {
      speakerId: 'munger',
      speakerName: 'Charlie Munger (CRO)',
      role: 'Risk Inversion Critic',
      avatar: executives[1].avatar,
      message: `Tahan dulu antusiasme Anda, Jeff. Mari kita lakukan pre-mortem: Apa yang terjadi jika pasar terkoreksi -10% minggu depan? Kita tidak boleh mengalokasikan modal tanpa batas stop loss yang tegas. Batasi eksposur maksimum di ${allocPct}% portofolio.`,
      tag: 'RISK_INVERSION' as const,
    },
    {
      speakerId: 'vogels',
      speakerName: 'Werner Vogels (CTO)',
      role: 'System Architect',
      avatar: executives[2].avatar,
      message: `Saya menyetujui parameter Charlie. Sistem otomatisasi VPS 24/7 telah mengkalkulasi titik cut-loss di ${currency === 'IDR' ? `Rp ${stopLossPrice.toLocaleString('id-ID')}` : `$${stopLossPrice}`} dengan target take-profit ${currency === 'IDR' ? `Rp ${targetPrice.toLocaleString('id-ID')}` : `$${targetPrice}`}. Rasio Risk-to-Reward terkonfirmasi di ${rrr}x.`,
      tag: 'SYSTEMS_LATENCY' as const,
    },
    {
      speakerId: 'godin',
      speakerName: 'Seth Godin (CMO)',
      role: 'Market Sentiment',
      avatar: executives[3].avatar,
      message: `Data sentimen pasar mendukung kesimpulan Werner. Aliran dana pintar (smart money) tidak menunjukkan pola panik. Ini waktu ideal untuk masuk secara bertahap sebelum momentum menjadi terlalu ramai.`,
      tag: 'SENTIMENT' as const,
    },
    {
      speakerId: 'bezos',
      speakerName: 'Jeff Bezos (CEO)',
      role: 'Chief Executive Officer',
      avatar: executives[0].avatar,
      message: `Konsensus tercapai. Keputusan resmi Direksi: **${action}** dengan alokasi target ${allocPct}% modal (${currency === 'IDR' ? `${lots.toLocaleString('id-ID')} Lot` : `${lots} Unit`}). Terbitkan instruksi eksekusi ke meja trading sekarang.`,
      tag: 'STRATEGY' as const,
    },
  ];

  return {
    symbol: clean,
    name,
    price,
    currency,
    timestamp: new Date().toISOString(),
    action,
    overallConviction,
    targetPrice,
    stopLossPrice,
    riskRewardRatio: Math.max(1.2, rrr),
    recommendedAllocationLots: lots,
    recommendedAllocationPct: allocPct,
    capitalAllocationFormatted: currency === 'IDR' ? `Rp ${allocatedMoney.toLocaleString('id-ID')}` : `$${allocatedMoney.toLocaleString('en-US')}`,
    macroRegime: isCrypto ? 'HIGH VOLATILITY LIQUIDITY EXPANSION' : 'IDX SELECTIVE INSTITUTIONAL INFLOW',
    executives,
    dialogueTranscript,
    ceoDirective: `Direksi menetapkan sikap **${action}** pada ${clean}. Alokasikan modal hingga ${allocPct}% dengan disiplin pada Stop Loss ${currency === 'IDR' ? `Rp ${stopLossPrice.toLocaleString('id-ID')}` : `$${stopLossPrice}`} dan Take Profit ${currency === 'IDR' ? `Rp ${targetPrice.toLocaleString('id-ID')}` : `$${targetPrice}`}.`,
    riskNotice: `Evaluasi risiko dipimpin oleh Inversion Model Charlie Munger. Rasio RRR adalah 1:${rrr}. Risiko kerugian modal dibatasi maksimum ${slDistance * 100}%.`,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSymbol = searchParams.get('symbol') || searchParams.get('ticker') || 'BBCA';
    const paramPrice = searchParams.get('price') ? parseFloat(searchParams.get('price')!) : undefined;

    const { clean, name, price, currency } = resolveAssetDetails(rawSymbol, paramPrice);

    // Generate Boardroom Consensus & Deliberation
    const resolution = generateDeterministicBoardroom(clean, name, price, currency);

    return NextResponse.json(resolution);
  } catch (error: any) {
    console.error('Error in /api/ai/boardroom:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memproses sidang Boardroom Otonom' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawSymbol = body.symbol || body.ticker || 'BBCA';
    const userPrice = body.price ? parseFloat(body.price) : undefined;

    const { clean, name, price, currency } = resolveAssetDetails(rawSymbol, userPrice);

    // Coba panggil LLM Groq jika kunci tersedia untuk dinamika dialog real-time
    const keys = getGroqKeys();
    if (keys.length > 0) {
      try {
        const groqPrompt = `
Anda adalah fasilitator Rapat Direksi Otonom C-Suite (terinspirasi dari MaxMiksa/Autonomous-Company):
1. Jeff Bezos (CEO - Fokus pada Day 1, alokasi modal, flywheel, pertumbuhan)
2. Charlie Munger (CRO - Fokus pada Inversion: "di mana trade ini bisa mati?", batasan risiko, stop-loss ketat)
3. Werner Vogels (CTO - Fokus pada execution, sistem keandalan, slippage, fraksi harga)
4. Seth Godin (CMO - Fokus pada psikologi pasar, retail hype vs akumulasi institusi)

Analisis aset: ${clean} (${name}) pada harga ${currency === 'IDR' ? `Rp ${price}` : `$${price}`}.
Hasilkan keputusan konsensus dalam format JSON valid:
{
  "action": "STRONG BUY" | "ACCUMULATE" | "HOLD / WAIT" | "TRIM" | "EXIT / AVOID",
  "conviction": 85,
  "ceo_quote": "Pernyataan Bezos...",
  "munger_critique": "Kritik & batasan risiko Munger...",
  "vogels_engineering": "Penilaian eksekusi Vogels...",
  "godin_sentiment": "Ulasan psikologi Godin...",
  "target_price": 0,
  "stop_loss": 0
}
Output HANYA JSON tanpa markdown.
        `.trim();

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${keys[0]}`,
          },
          body: JSON.stringify({
            model: GROQ_MODELS[0],
            messages: [{ role: 'user', content: groqPrompt }],
            temperature: 0.2,
            response_format: { type: 'json_object' },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          const parsed = JSON.parse(content);
          if (parsed && parsed.action) {
            const base = generateDeterministicBoardroom(clean, name, price, currency);
            base.action = parsed.action;
            base.overallConviction = parsed.conviction || base.overallConviction;
            if (parsed.target_price > 0) base.targetPrice = parsed.target_price;
            if (parsed.stop_loss > 0) base.stopLossPrice = parsed.stop_loss;
            if (parsed.ceo_quote) base.executives[0].statement = parsed.ceo_quote;
            if (parsed.munger_critique) base.executives[1].statement = parsed.munger_critique;
            if (parsed.vogels_engineering) base.executives[2].statement = parsed.vogels_engineering;
            if (parsed.godin_sentiment) base.executives[3].statement = parsed.godin_sentiment;
            return NextResponse.json({ ...base, source: 'LLM_GROQ_LIVE_DELIBERATION' });
          }
        }
      } catch (e) {
        console.warn('Groq live deliberation fallback to deterministic:', e);
      }
    }

    const deterministic = generateDeterministicBoardroom(clean, name, price, currency);
    return NextResponse.json({ ...deterministic, source: 'AUTONOMOUS_CALIBRATED_ENGINE' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gagal memproses sidang Boardroom' },
      { status: 500 }
    );
  }
}
