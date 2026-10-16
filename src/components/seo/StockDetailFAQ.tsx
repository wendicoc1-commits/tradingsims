'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, ArrowRight } from 'lucide-react';
import type { StockQuote } from '@/types';

interface Props {
  quote: StockQuote;
}

export default function StockDetailFAQ({ quote }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const isCrypto = quote.market === 'CRYPTO' || quote.symbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL'].includes(quote.symbol);
  const minCapital = isCrypto
    ? `$1.00 (~Rp 16.000)`
    : `Rp ${(quote.price * 100).toLocaleString('id-ID')} (1 lot = 100 lembar x Rp ${quote.price.toLocaleString('id-ID')})`;

  const faqs = [
    {
      q: `Bagaimana cara simulasi trading ${quote.symbol} gratis tanpa modal uang asli?`,
      a: `Di TradeSim Pro, Anda dapat langsung melakukan paper trading untuk ${quote.symbol} (${quote.name}) menggunakan modal virtual gratis Rp 50.000.000. Cukup tentukan jumlah ${isCrypto ? 'koin' : 'lot'}, pilih tipe order (Market atau Limit), dan eksekusi transaksi tanpa risiko finansial nyata.`,
    },
    {
      q: `Apakah data chart candlestick dan orderbook ${quote.symbol} diperbarui real-time?`,
      a: `Ya. Feed harga, chart teknikal candlestick TradingView, bid/offer orderbook level 2, dan volume transaksi ${quote.symbol} terhubung secara langsung dengan feed bursa ${quote.market === 'CRYPTO' ? 'Binance Spot' : 'Bursa Efek Indonesia (IDX)'} tanpa penundaan.`,
    },
    {
      q: `Berapa modal minimal untuk membeli 1 lot saham ${quote.symbol}?`,
      a: `Berdasarkan regulasi BEI, 1 lot saham setara dengan 100 lembar saham. Dengan harga pasar saat ini Rp ${quote.price.toLocaleString('id-ID')}, maka estimasi modal minimal untuk membeli 1 lot ${quote.symbol} adalah ${minCapital}. Di TradeSim Pro, Anda bisa menguji pembelian ini menggunakan saldo virtual gratis.`,
    },
    {
      q: `Apakah emiten ${quote.symbol} rutin membagikan dividen tunai?`,
      a: `Informasi pembagian dividen resmi diputuskan melalui RUPS Tahunan emiten. Anda dapat memeriksa jadwal Cum Date, Ex Date, Dividen per Lembar (DPS), dan riwayat yield 5 tahun terakhir pada halaman Kalender Dividen ${quote.symbol}.`,
      linkText: `Lihat Histori Dividen ${quote.symbol}`,
      linkHref: `/stock/${quote.symbol}/dividen`,
    },
    {
      q: `Di mana saya bisa melihat analisis fundamental dan valuasi nilai wajar ${quote.symbol}?`,
      a: `TradeSim Pro menyediakan scorecard kesehatan keuangan komprehensif untuk ${quote.symbol}, mencakup skor Piotroski F-Score (0-9), rasio valuasi PER/PBV, efisiensi modal ROE, serta estimasi nilai wajar (Fair Value).`,
      linkText: `Lihat Skor Fundamental ${quote.symbol}`,
      linkHref: `/analisis/${quote.symbol}`,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0c101a] p-6">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            Pertanyaan Sering Diajukan (People Also Ask) - {quote.symbol}
          </h2>
          <p className="text-xs text-slate-400">
            Panduan resmi seputar simulasi trading, mekanisme bursa, dividen, dan analisis emiten {quote.name}.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-lg border border-slate-800/80 bg-slate-900/40 transition hover:border-slate-700"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <span className="text-sm font-semibold text-slate-200">
                  {faq.q}
                </span>
                <span className="ml-4 shrink-0 text-slate-400">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-slate-800/60 p-4 pt-3 text-xs leading-relaxed text-slate-300">
                  <p>{faq.a}</p>
                  {faq.linkHref && (
                    <div className="mt-3">
                      <Link
                        href={faq.linkHref}
                        className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 hover:text-emerald-300 transition"
                      >
                        {faq.linkText}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
