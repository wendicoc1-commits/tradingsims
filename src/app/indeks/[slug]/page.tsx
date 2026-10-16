import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IDX_INDICES } from '@/data/seo_programmatic_universe';
import { ArrowLeft, Layers, CheckCircle2, Calendar, PieChart, ShieldAlert } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return IDX_INDICES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const indexItem = IDX_INDICES.find((i) => i.slug.toLowerCase() === slug.toLowerCase());
  if (!indexItem) return { title: 'Indeks Saham Tidak Ditemukan' };

  const title = `Daftar Saham ${indexItem.code} (${indexItem.name}) Terbaru 2026`;
  const description = `${indexItem.description}. Cek daftar lengkap ${indexItem.totalConstituents} saham konstituen ${indexItem.code}, jadwal rebalancing, dan metodologi indeks BEI.`;

  return {
    title,
    description,
    keywords: [
      `saham ${indexItem.code}`,
      `daftar saham ${indexItem.code} terbaru 2026`,
      `konstituen ${indexItem.code} bei`,
      `indeks ${indexItem.name}`,
      'rebalancing indeks saham indonesia',
      'bluechip bei',
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.tradingsims.my.id/indeks/${indexItem.slug}`,
    },
    alternates: {
      canonical: `https://www.tradingsims.my.id/indeks/${indexItem.slug}`,
    },
  };
}

export default async function IndexDetailPage({ params }: Props) {
  const { slug } = await params;
  const indexItem = IDX_INDICES.find((i) => i.slug.toLowerCase() === slug.toLowerCase());

  if (!indexItem) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: indexItem.name,
    identifier: indexItem.code,
    description: indexItem.description,
    provider: {
      '@type': 'Organization',
      name: 'Bursa Efek Indonesia (IDX)',
      url: 'https://www.idx.co.id',
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-sm text-slate-400">
          <Link
            href="/markets"
            className="inline-flex items-center gap-2 hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Pasar Saham
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
            BEI Official Index
          </span>
        </div>

        {/* Hero Header */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold uppercase">
            <Layers className="w-4 h-4" /> Indeks Saham BEI
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {indexItem.name} ({indexItem.code})
          </h1>
          <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
            {indexItem.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Total Konstituen</span>
              <span className="text-xl font-bold text-white">{indexItem.totalConstituents} Emiten</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Cakupan Pasar</span>
              <span className="text-sm font-semibold text-emerald-400">{indexItem.marketCapCoverage}</span>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-slate-400 block">Jadwal Evaluasi / Rebalancing</span>
              <span className="text-xs font-medium text-slate-300">{indexItem.rebalanceSchedule}</span>
            </div>
          </div>
        </div>

        {/* Top Constituents Chips */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" /> Saham Penggerak Utama ({indexItem.code})
          </h3>
          <p className="text-sm text-slate-400">
            Berikut adalah emiten dengan bobot kapitalisasi pasar dan likuiditas transaksi terbesar di indeks ini:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {indexItem.topConstituents.map((ticker) => (
              <Link
                key={ticker}
                href={`/stock/${ticker}`}
                className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-emerald-500/50 rounded-xl transition flex items-center justify-between group"
              >
                <div>
                  <span className="font-extrabold text-base text-white group-hover:text-emerald-400 transition block">
                    {ticker}
                  </span>
                  <span className="text-[11px] text-slate-400">Lihat Chart Live</span>
                </div>
                <span className="text-xs text-slate-500 group-hover:text-emerald-400">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Metodologi Penentuan Indeks */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Metodologi Perhitungan Indeks
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            Metode pembobotan: <strong className="text-white">{indexItem.methodology}</strong>. Indeks ini dievaluasi secara berkala oleh Komite Indeks Bursa Efek Indonesia untuk menjamin hanya emiten dengan kelangsungan bisnis sehat, tata kelola baik (GCG), dan likuiditas tinggi yang masuk ke dalam daftar.
          </p>
        </div>

        {/* Indeks Lainnya */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h4 className="text-base font-bold text-slate-300">Jelajahi Indeks BEI Lainnya:</h4>
          <div className="flex flex-wrap gap-2">
            {IDX_INDICES.filter((i) => i.slug !== indexItem.slug).map((i) => (
              <Link
                key={i.slug}
                href={`/indeks/${i.slug}`}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 rounded-xl text-xs font-semibold text-slate-300 transition"
              >
                {i.code} ({i.name.split(' ')[0]})
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
