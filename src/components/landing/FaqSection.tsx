'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface FaqItem {
  q: string;
  a: string;
  tag: string;
}

const FAQS: FaqItem[] = [
  {
    tag: 'PLATFORM & BIAYA',
    q: 'Apa itu TradeSim Pro dan apakah benar-benar 100% gratis?',
    a: 'TradeSim Pro adalah platform institusional paper trading dan simulator pasar modal terdepan di Indonesia untuk saham BEI (IDX) dan crypto spot 24/7. Seluruh fitur simulator, grafik candlestick, orderbook Level 2, dan kalkulator investasi dapat digunakan 100% gratis dengan saldo modal virtual Rp 50.000.000 tanpa perlu deposit atau kartu kredit.',
  },
  {
    tag: 'DATA PASAR REAL-TIME',
    q: 'Apakah pergerakan harga saham dan crypto di simulator berjalan secara real-time?',
    a: 'Ya. TradeSim Pro menggunakan data feed pasar langsung dari Bursa Efek Indonesia dan bursa likuiditas kripto global. Pergerakan grafik harga, antrean orderbook (Bid/Offer), volume transaksi, dan pergerakan persentase naik turun berjalan secara real-time sesuai fluktuasi pasar sesungguhnya.',
  },
  {
    tag: 'ALAT & KALKULATOR',
    q: 'Apa saja alat kalkulator trading gratis yang disediakan?',
    a: 'TradeSim Pro menyediakan 3 kalkulator esensial untuk trader Indonesia: (1) Kalkulator Fee Saham BEI untuk menghitung komisi broker dan titik impas breakeven, (2) Kalkulator Lot & Money Management untuk menghitung position sizing yang aman, serta (3) Kalkulator Average Down Saham untuk memproyeksikan harga rata-rata baru saat saham sedang terkoreksi.',
  },
  {
    tag: 'CARA MEMULAI',
    q: 'Bagaimana cara memulai simulasi trading saham di TradeSim Pro?',
    a: 'Cukup klik tombol "Buka Workstation Terminal" di bagian atas halaman. Pilih kode saham yang ingin Anda pantau (seperti BBCA, BBRI, BMRI, atau GOTO), analisis grafik teknikalnya, masukkan jumlah lot yang ingin Anda beli, lalu klik "Beli". Anda dapat memantau pergerakan untung rugi secara langsung di tab Portofolio.',
  },
  {
    tag: 'PEMULA & EDUKASI',
    q: 'Apakah TradeSim Pro cocok untuk pemula yang baru belajar saham?',
    a: 'Sangat direkomendasikan. Paper trading di TradeSim Pro memberikan lingkungan belajar yang aman untuk melatih psikologi trading, menguji indikator analisis teknikal, serta memahami fraksi harga dan aturan bursa efek tanpa risiko kehilangan uang tabungan Anda.',
  },
];

interface FaqSectionProps {
  onEnterTerminal: () => void;
}

export default function FaqSection({ onEnterTerminal }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-white/10">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-semibold mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          FREQUENTLY ASKED QUESTIONS
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight uppercase">
          Pertanyaan Seputar <span className="text-emerald-400">TradeSim Pro</span>
        </h2>
        <p className="mt-3 text-sm text-zinc-400 max-w-xl mx-auto font-sans leading-relaxed">
          Temukan jawaban atas pertanyaan umum seputar fitur simulator trading saham, data pasar real-time, dan kalkulator investasi.
        </p>
      </div>

      <div className="space-y-3.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-[#0E121A] border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase block mb-1.5">
                    {faq.tag}
                  </span>
                  <span className="font-mono text-sm sm:text-base font-semibold text-white leading-snug">
                    {faq.q}
                  </span>
                </div>
                <div
                  className={`w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'text-zinc-400'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed border-t border-white/5 pt-3 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mini Bar Below FAQ */}
      <div className="mt-10 p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <div className="text-xs font-mono font-bold text-white">Ingin langsung mencoba simulasi?</div>
          <div className="text-[11px] text-zinc-400 font-sans mt-0.5">Dapatkan saldo virtual Rp 50 Juta gratis dan mulai trading saham BEI hari ini.</div>
        </div>
        <button
          onClick={onEnterTerminal}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-black" />
          <span>Buka Workstation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}
