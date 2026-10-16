import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { STOCK_DUELS } from '@/data/seo_programmatic_universe';
import { ArrowLeft, Swords, TrendingUp, CheckCircle, Percent, DollarSign, Award, Share2 } from 'lucide-react';

interface Props {
  params: Promise<{ pair: string }>;
}

export async function generateStaticParams() {
  return STOCK_DUELS.map((item) => ({ pair: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const duel = STOCK_DUELS.find((d) => d.slug.toLowerCase() === pair.toLowerCase());
  if (!duel) return { title: 'Duel Saham Tidak Ditemukan' };

  const title = `${duel.stockA.ticker} vs ${duel.stockB.ticker}: Komparasi Dividen, Valuasi & Prospek 2026`;
  const description = `Perbandingan lengkap saham ${duel.stockA.name} (${duel.stockA.ticker}) vs ${duel.stockB.name} (${duel.stockB.ticker}). Analisis PER, PBV, Dividend Yield, ROE, dan mana yang lebih bagus untuk investasi Anda.`;

  return {
    title,
    description,
    keywords: [
      `${duel.stockA.ticker} vs ${duel.stockB.ticker}`,
      `perbandingan saham ${duel.stockA.ticker} dan ${duel.stockB.ticker}`,
      `dividen ${duel.stockA.ticker} vs ${duel.stockB.ticker}`,
      `bagusan ${duel.stockA.ticker} atau ${duel.stockB.ticker}`,
      'analisis komparasi saham bei',
      'duel saham indonesia',
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.tradingsims.my.id/vs/${duel.slug}`,
    },
    alternates: {
      canonical: `https://www.tradingsims.my.id/vs/${duel.slug}`,
    },
  };
}

export default async function StockDuelPage({ params }: Props) {
  const { pair } = await params;
  const duel = STOCK_DUELS.find((d) => d.slug.toLowerCase() === pair.toLowerCase());

  if (!duel) {
    notFound();
  }

  const { stockA, stockB } = duel;

  // JSON-LD Schema ProductComparison & FAQPage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.tradingsims.my.id' },
          { '@type': 'ListItem', position: 2, name: 'Duel Saham', item: 'https://www.tradingsims.my.id/vs' },
          { '@type': 'ListItem', position: 3, name: `${stockA.ticker} vs ${stockB.ticker}`, item: `https://www.tradingsims.my.id/vs/${duel.slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Mana yang lebih bagus antara saham ${stockA.ticker} atau ${stockB.ticker}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: duel.winnerReason,
            },
          },
          {
            '@type': 'Question',
            name: `Berapa dividen yield ${stockA.ticker} vs ${stockB.ticker}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Dividend yield ${stockA.ticker} adalah ${stockA.divYield}%, sedangkan dividend yield ${stockB.ticker} adalah ${stockB.divYield}%.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-sm text-slate-400">
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Screener Komparasi
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            Programmatic Stock Duel
          </span>
        </div>

        {/* Hero Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 mb-2">
            <Swords className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            {stockA.ticker} <span className="text-rose-500">VS</span> {stockB.ticker}
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
            {duel.summary}
          </p>
        </div>

        {/* Side by Side Head-to-Head Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Stock A */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur hover:border-slate-700 transition">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">Pilihan A</span>
                <h2 className="text-3xl font-black text-white mt-1">{stockA.ticker}</h2>
                <p className="text-sm text-slate-400">{stockA.name}</p>
              </div>
              <Link
                href={`/stock/${stockA.ticker}`}
                className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition"
              >
                Lihat Chart Live →
              </Link>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Sektor</span>
                <span className="font-medium text-slate-200">{stockA.sector}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Market Cap</span>
                <span className="font-bold text-white">{stockA.marketCap}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">P/E Ratio (PER)</span>
                <span className="font-bold text-cyan-400">{stockA.per}x</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Price to Book (PBV)</span>
                <span className="font-bold text-slate-200">{stockA.pbv}x</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Dividend Yield</span>
                <span className="font-bold text-emerald-400">{stockA.divYield}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">ROE (Profitabilitas)</span>
                <span className="font-medium text-slate-200">{stockA.roe}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Debt to Equity (DER)</span>
                <span className="font-medium text-slate-200">{stockA.debtToEquity}x</span>
              </div>
            </div>
          </div>

          {/* Card Stock B */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur hover:border-slate-700 transition">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-rose-400 font-bold">Pilihan B</span>
                <h2 className="text-3xl font-black text-white mt-1">{stockB.ticker}</h2>
                <p className="text-sm text-slate-400">{stockB.name}</p>
              </div>
              <Link
                href={`/stock/${stockB.ticker}`}
                className="text-xs px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition"
              >
                Lihat Chart Live →
              </Link>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Sektor</span>
                <span className="font-medium text-slate-200">{stockB.sector}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Market Cap</span>
                <span className="font-bold text-white">{stockB.marketCap}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">P/E Ratio (PER)</span>
                <span className="font-bold text-amber-400">{stockB.per}x</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Price to Book (PBV)</span>
                <span className="font-bold text-slate-200">{stockB.pbv}x</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Dividend Yield</span>
                <span className="font-bold text-emerald-400">{stockB.divYield}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">ROE (Profitabilitas)</span>
                <span className="font-medium text-slate-200">{stockB.roe}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Debt to Equity (DER)</span>
                <span className="font-medium text-slate-200">{stockB.debtToEquity}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verdict & Analysis Box */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-400" />
            <h3 className="text-xl font-bold text-white">Kesimpulan & Rekomendasi Alokasi</h3>
          </div>
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            {duel.winnerReason}
          </p>
          <div className="pt-4 flex flex-wrap gap-3">
            <Link
              href={`/analisis/${stockA.ticker}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              Skor Piotroski {stockA.ticker} →
            </Link>
            <Link
              href={`/analisis/${stockB.ticker}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              Skor Piotroski {stockB.ticker} →
            </Link>
            <Link
              href={`/stock/${stockA.ticker}/dividen`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/30 transition"
            >
              Histori Dividen {stockA.ticker} →
            </Link>
            <Link
              href={`/stock/${stockB.ticker}/dividen`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/30 transition"
            >
              Histori Dividen {stockB.ticker} →
            </Link>
          </div>
        </div>

        {/* Other Popular Duels */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Duel Saham Populer Lainnya
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {STOCK_DUELS.filter((d) => d.slug !== duel.slug).map((d) => (
              <Link
                key={d.slug}
                href={`/vs/${d.slug}`}
                className="p-3.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition flex items-center justify-between group"
              >
                <span className="font-bold text-sm text-slate-300 group-hover:text-indigo-400 transition">
                  {d.stockA.ticker} <span className="text-rose-400">vs</span> {d.stockB.ticker}
                </span>
                <span className="text-xs text-slate-500 group-hover:text-slate-400">Bandingkan →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
