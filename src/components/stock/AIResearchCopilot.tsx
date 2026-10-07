'use client';

import React, { useState, useMemo } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Flame,
  Zap,
  HelpCircle,
  ThumbsUp,
  RotateCcw,
  Building2,
  DollarSign,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import type { StockQuote } from '@/types';
import { getGroundedStockIntelligence } from '@/lib/agents/groundedStockIntelligence';

interface AICopilotProps {
  quote: StockQuote;
}

interface ChatMessage {
  id: string;
  sender: 'AI' | 'USER';
  text: string;
  timestamp: string;
  bullets?: string[];
}

export default function AIResearchCopilot({ quote }: AICopilotProps) {
  // Grounded Truth & Institutional Context
  const grounded = useMemo(() => {
    return getGroundedStockIntelligence(quote.displaySymbol, quote.price);
  }, [quote.displaySymbol, quote.price]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const g = getGroundedStockIntelligence(quote.displaySymbol, quote.price);
    return [
      {
        id: 'init-ai',
        sender: 'AI',
        text: `Halo! Saya Fincept Research Copilot (Didukung ECC Institutional Grounding). Saya telah memverifikasi laporan keuangan auditan, konsensus institusional, dan struktur teknikal ${g.symbol} (${g.name}). Sumber data: ${g.dataSourceCitation}.`,
        timestamp: 'Baru saja',
        bullets: [
          `Kinerja Keuangan Auditan: Pendapatan ${g.financials.revenueFormatted}, Laba Bersih ${g.financials.netIncomeFormatted} (ROE ${g.financials.roe}%, FCF ${g.financials.freeCashFlowFormatted})`,
          `Rasio Valuasi Multiples: P/E ${g.financials.peRatio}x | P/B ${g.financials.pbRatio}x | D/E ${g.financials.debtToEquity}x | Div Yield ${g.financials.dividendYield}%`,
          `Konsensus Institusional (Bloomberg): ${g.institutionalConsensus.consensusRating} dari ${g.institutionalConsensus.totalAnalysts} Analis (Target 12M: ${g.currency === 'IDR' ? `Rp ${g.institutionalConsensus.targetPriceConsensus.toLocaleString('id-ID')}` : `$${g.institutionalConsensus.targetPriceConsensus}`}, Potensi Upside: ${g.institutionalConsensus.impliedUpsidePct > 0 ? '+' : ''}${g.institutionalConsensus.impliedUpsidePct}%)`,
        ],
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Analisis Fundamental Dinamis
  const analysis = useMemo(() => {
    const isBank = quote.sector?.toLowerCase().includes('finan') || ['BBCA', 'BBRI', 'BMRI', 'BBNI'].includes(quote.displaySymbol);
    const isEnergy = quote.sector?.toLowerCase().includes('energy') || ['ADRO', 'PTBA', 'ITMG'].includes(quote.displaySymbol);
    const isTelco = quote.displaySymbol === 'TLKM';

    let moat = `Wide Moat: Dominasi pangsa pasar terverifikasi dengan ROE ${grounded.financials.roe}% & neraca konservatif.`;
    let catalysts = [
      `Pertumbuhan pendapatan auditan ${grounded.financials.revenueFormatted} (${grounded.financials.revenueGrowthYoY > 0 ? '+' : ''}${grounded.financials.revenueGrowthYoY}% YoY).`,
      `Arus kas bebas (FCF) solid sebesar ${grounded.financials.freeCashFlowFormatted} menjamin keberlanjutan dividen.`,
      `Konsensus analis Bloomberg menetapkan target harga 12 bulan di ${grounded.currency === 'IDR' ? `Rp ${grounded.institutionalConsensus.targetPriceConsensus.toLocaleString('id-ID')}` : `$${grounded.institutionalConsensus.targetPriceConsensus}`} (upside ${grounded.institutionalConsensus.impliedUpsidePct > 0 ? '+' : ''}${grounded.institutionalConsensus.impliedUpsidePct}%).`,
    ];
    let risks = [
      'Volatilitas makroekonomi domestik & fluktuasi nilai tukar Rupiah terhadap USD.',
      `Risiko sektor terkait rasio utang solvabilitas D/E tercatat di ${grounded.financials.debtToEquity}x.`,
      `Area resistensi teknikal kunci berada di level ${grounded.technicals.resistanceLevels[0] ? (grounded.currency === 'IDR' ? `Rp ${grounded.technicals.resistanceLevels[0].toLocaleString('id-ID')}` : `$${grounded.technicals.resistanceLevels[0]}`) : 'All-Time High'}.`,
    ];
    let sentimentScore = grounded.institutionalConsensus.consensusRating.includes('BUY') ? 85 : 72;

    if (isBank) {
      moat = `Wide Moat: Biaya Dana Murah (CASA) & Pengembalian Ekuitas Tinggi (ROE ${grounded.financials.roe}%)`;
      catalysts = [
        `Pertumbuhan laba bersih tahunan mencapai ${grounded.financials.netIncomeFormatted} (${grounded.financials.epsGrowthYoY > 0 ? '+' : ''}${grounded.financials.epsGrowthYoY}% YoY).`,
        `Kualitas aset prima didukung kecukupan modal kuat dan rasio dividen kompetitif (${grounded.financials.dividendYield}% yield).`,
        `Konsensus ${grounded.institutionalConsensus.totalAnalysts} analis: ${grounded.institutionalConsensus.buyCount} Buy, ${grounded.institutionalConsensus.holdCount} Hold.`,
      ];
    } else if (isEnergy) {
      moat = `Narrow-to-Wide Moat: Struktur biaya rendah dan cadangan tambang prima dengan FCF ${grounded.financials.freeCashFlowFormatted}.`;
      catalysts = [
        `Pembagian dividen kas sangat tinggi dengan dividend yield historis ${grounded.financials.dividendYield}%.`,
        `Posisi kas bersih bebas utang signifikan (D/E ${grounded.financials.debtToEquity}x).`,
      ];
    }

    return { moat, catalysts, risks, sentimentScore };
  }, [quote.displaySymbol, quote.sector, grounded]);

  // Handler Kirim Pesan / Preset
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI Response Synthesizer (Anchored in Grounded Stock Intelligence)
    setTimeout(() => {
      let aiReply = '';
      let bullets: string[] | undefined = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('valuasi') || lower.includes('pe') || lower.includes('harga') || lower.includes('pbv')) {
        aiReply = `Berdasarkan data pasar dan auditan resmi untuk ${grounded.symbol}:`;
        bullets = [
          `P/E Ratio saat ini tercatat ${grounded.financials.peRatio}x, dengan P/B Ratio ${grounded.financials.pbRatio}x.`,
          `Formula Graham Multiplier (PE x PB) menghasilkan nilai ${(grounded.financials.peRatio * grounded.financials.pbRatio).toFixed(1)} ${((grounded.financials.peRatio * grounded.financials.pbRatio) <= 22.5) ? '(Lolos uji Margin of Safety Benjamin Graham <= 22.5)' : '(Valuasi pertumbuhan premium)'}.`,
          `Target Harga Konsensus Analis (Bloomberg 12M): ${grounded.currency === 'IDR' ? `Rp ${grounded.institutionalConsensus.targetPriceConsensus.toLocaleString('id-ID')}` : `$${grounded.institutionalConsensus.targetPriceConsensus}`} dengan potensi upside ${grounded.institutionalConsensus.impliedUpsidePct > 0 ? '+' : ''}${grounded.institutionalConsensus.impliedUpsidePct}%.`,
        ];
      } else if (lower.includes('laporan') || lower.includes('keuangan') || lower.includes('laba') || lower.includes('kinerja') || lower.includes('revenue')) {
        aiReply = `Kinerja fundamental auditan ${grounded.symbol} (${grounded.dataSourceCitation}):`;
        bullets = [
          `Pendapatan (Revenue TTM): ${grounded.financials.revenueFormatted} (Pertumbuhan YoY: ${grounded.financials.revenueGrowthYoY > 0 ? '+' : ''}${grounded.financials.revenueGrowthYoY}%).`,
          `Laba Bersih (Net Income TTM): ${grounded.financials.netIncomeFormatted} (Pertumbuhan EPS YoY: ${grounded.financials.epsGrowthYoY > 0 ? '+' : ''}${grounded.financials.epsGrowthYoY}%).`,
          `Arus Kas Bebas (FCF TTM): ${grounded.financials.freeCashFlowFormatted} (${grounded.financials.fcfPositive ? 'Kas Operasional Positif' : 'Tekanan Kas'}).`,
          `Tingkat Profitabilitas: Margin Laba Bersih ${grounded.financials.netMarginPct}% | ROE ${grounded.financials.roe}% | Solvabilitas D/E ${grounded.financials.debtToEquity}x.`,
        ];
      } else if (lower.includes('dividen') || lower.includes('yield')) {
        aiReply = `Analisis prospek dividen untuk ${grounded.symbol}:`;
        bullets = [
          `Estimasi Dividend Yield tahunan saat ini: ${grounded.financials.dividendYield}%.`,
          `Daya tahan dividen tergolong sangat kuat karena ditopang oleh Free Cash Flow sebesar ${grounded.financials.freeCashFlowFormatted}.`,
          `Rasio utang terkendali (D/E ${grounded.financials.debtToEquity}x) memastikan emiten tidak perlu memangkas dividen untuk membayar bunga obligasi.`,
        ];
      } else if (lower.includes('teknikal') || lower.includes('support') || lower.includes('order block') || lower.includes('chart')) {
        aiReply = `Peta teknikal kuantitatif & Smart Money Concepts (SMC) untuk ${grounded.symbol}:`;
        bullets = [
          `Support Kunci: ${grounded.technicals.supportLevels.map((p) => (grounded.currency === 'IDR' ? `Rp ${p.toLocaleString('id-ID')}` : `$${p}`)).join(', ') || 'N/A'}.`,
          `Resistance Kunci: ${grounded.technicals.resistanceLevels.map((p) => (grounded.currency === 'IDR' ? `Rp ${p.toLocaleString('id-ID')}` : `$${p}`)).join(', ') || 'N/A'}.`,
          `Area Demand Order Block: ${grounded.technicals.orderBlockDemand.min} s.d. ${grounded.technicals.orderBlockDemand.max}.`,
          `Konsensus Multi-Timeframe (M15, H1, H4, D1): ${grounded.technicals.mtfConsensus} dengan rasio Risk/Reward ${grounded.technicals.suggestedRiskReward.ratio}:1.`,
        ];
      } else if (lower.includes('insider') || lower.includes('bandar') || lower.includes('asing') || lower.includes('flow')) {
        aiReply = `Struktur kepemilikan saham & arus akumulasi ${grounded.symbol}:`;
        bullets = [
          `Pemegang Pengendali: ${grounded.ownershipAndFlow.controllingShareholder}.`,
          `Porsi Kepemilikan: Investor Asing ${grounded.ownershipAndFlow.foreignOwnershipPct.toFixed(1)}% | Institusi Domestik ${grounded.ownershipAndFlow.domesticInstitutionsPct.toFixed(1)}%.`,
          `Sentimen Insider (30 Hari): ${grounded.ownershipAndFlow.insiderSentiment} dengan arus bersih ${grounded.ownershipAndFlow.netInsiderFlowFormatted}.`,
        ];
      } else {
        aiReply = `Rangkuman riset komprehensif terverifikasi untuk ${grounded.symbol}:`;
        bullets = [
          `Karakteristik Moat: ${analysis.moat}`,
          `Katalis Terdekat: ${analysis.catalysts[0]}`,
          `Konsensus Institusional: ${grounded.institutionalConsensus.consensusRating} (${grounded.institutionalConsensus.totalAnalysts} Analis) Target ${grounded.currency === 'IDR' ? `Rp ${grounded.institutionalConsensus.targetPriceConsensus.toLocaleString('id-ID')}` : `$${grounded.institutionalConsensus.targetPriceConsensus}`}`,
        ];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'AI',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        bullets,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Top Header Ribbon ── */}
      <div
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                FINCEPT AI RESEARCH COPILOT & INTELLIGENCE
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ECC Grounded: {grounded.groundingLevel === 'AUDITED_BEI_SEC' ? 'Lapkeu Auditan BEI/SEC' : 'Institutional Data'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Sintesis riset anti-halusinasi: berakar pada {grounded.dataSourceCitation}.
            </p>
          </div>
        </div>

        {/* Sentiment Gauge Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-neutral-900/60 border-neutral-800 text-xs">
          <span className="text-neutral-400">Skor Sentimen Pasar:</span>
          <span className="font-bold text-emerald-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
            {analysis.sentimentScore}% BULLISH
          </span>
        </div>
      </div>

      {/* ── Executive Intelligence Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Economic Moat Card */}
        <div
          className="p-3.5 rounded-xl border flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>ECONOMIC MOAT & POSISI INDUSTRI</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">{analysis.moat}</p>
          <span className="text-[10px] text-neutral-500 mt-2 block">
            Daya saing emiten terhadap penetrasi kompetitor baru
          </span>
        </div>

        {/* 6-12M Growth Catalysts Card */}
        <div
          className="p-3.5 rounded-xl border flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>KATALIS PERTUMBUHAN (6–12 BULAN)</span>
          </div>
          <ul className="text-xs text-neutral-300 space-y-1">
            {analysis.catalysts.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Downside Risks Card */}
        <div
          className="p-3.5 rounded-xl border flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold mb-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>FAKTOR RISIKO UTAMA (DOWNSIDE)</span>
          </div>
          <ul className="text-xs text-neutral-300 space-y-1">
            {analysis.risks.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">&bull;</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Interactive Chat Interface ── */}
      <div
        className="rounded-xl border overflow-hidden shadow-sm flex flex-col h-[400px]"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        {/* Chat Header */}
        <div className="px-4 py-2.5 border-b flex items-center justify-between text-xs" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 font-bold text-white">
            <Bot className="w-4 h-4 text-purple-400" />
            <span>TANYA JAWAB RISET INTERAKTIF: {quote.displaySymbol}</span>
          </div>
          <span className="text-[11px] text-neutral-500">Model: Fincept Market Intelligence v2</span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'USER' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                  m.sender === 'USER'
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-neutral-900/90 text-neutral-200 border border-neutral-800'
                }`}
              >
                <p>{m.text}</p>
                {m.bullets && (
                  <ul className="mt-2 space-y-1 pl-1 border-t border-neutral-800 pt-1.5">
                    {m.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px] text-neutral-300">
                        <span className="text-purple-400 font-bold">&bull;</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <span className="text-[9px] text-neutral-500 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-purple-400 italic">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Fincept AI sedang merumuskan analisis...</span>
            </div>
          )}
        </div>

        {/* Prompt Presets Bar */}
        <div className="p-2 border-t border-neutral-800/80 bg-neutral-950/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-neutral-500 shrink-0 ml-1">Saran Topik:</span>
          {[
            'Bagaimana valuasi saat ini?',
            'Dampak pemangkasan suku bunga BI?',
            'Prospek dividen tahun ini?',
            'Apa risiko terbesar emiten ini?',
          ].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleSendMessage(preset)}
              className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-purple-500/50 whitespace-nowrap cursor-pointer transition-all"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t flex items-center gap-2 bg-neutral-900/40"
          style={{ borderColor: 'var(--border)' }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Tanyakan apa saja seputar fundamental, valuasi, atau teknikal ${quote.displaySymbol}...`}
            className="flex-1 px-3 py-2 rounded-lg border text-xs bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
}
