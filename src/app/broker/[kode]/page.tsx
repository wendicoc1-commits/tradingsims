import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BROKER_DIRECTORY } from '@/data/seo_programmatic_universe';
import { ArrowLeft, Building2, CheckCircle2, ShieldCheck, Percent, PhoneCall, ExternalLink } from 'lucide-react';

interface Props {
  params: Promise<{ kode: string }>;
}

export async function generateStaticParams() {
  return BROKER_DIRECTORY.map((item) => ({ kode: item.code.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kode } = await params;
  const broker = BROKER_DIRECTORY.find((b) => b.code.toLowerCase() === kode.toLowerCase());
  if (!broker) return { title: 'Kode Broker Tidak Ditemukan' };

  const title = `Kode Broker ${broker.code}: ${broker.name} - Fee Transaksi & Profil BEI`;
  const description = `Arti dan profil kode broker ${broker.code} (${broker.name}) di Bursa Efek Indonesia. Fee beli ${broker.feeBeli}, fee jual ${broker.feeJual}, kategori ${broker.type}, dan fitur aplikasi trading.`;

  return {
    title,
    description,
    keywords: [
      `kode broker ${broker.code}`,
      `broker ${broker.code} saham`,
      `sekuritas ${broker.code} ${broker.name}`,
      `fee transaksi ${broker.name}`,
      'broker summary bei',
      'bandarmologi kode broker',
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.tradingsims.my.id/broker/${broker.code.toLowerCase()}`,
    },
    alternates: {
      canonical: `https://www.tradingsims.my.id/broker/${broker.code.toLowerCase()}`,
    },
  };
}

export default async function BrokerDetailPage({ params }: Props) {
  const { kode } = await params;
  const broker = BROKER_DIRECTORY.find((b) => b.code.toLowerCase() === kode.toLowerCase());

  if (!broker) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: broker.name,
    identifier: broker.code,
    description: broker.description,
    feesAndCommissionsSpecification: `Fee Beli: ${broker.feeBeli}, Fee Jual: ${broker.feeJual}`,
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
            href="/bandar"
            className="inline-flex items-center gap-2 hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Bandarmologi Hub
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
            Broker BEI Directory
          </span>
        </div>

        {/* Hero Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-amber-400 border border-slate-700 rounded-lg text-xs font-bold uppercase mb-2">
                <Building2 className="w-3.5 h-3.5" /> Kategori: {broker.type}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                Kode Broker {broker.code}
              </h1>
              <p className="text-lg text-slate-300 font-medium mt-1">
                {broker.name}
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-center sm:text-right">
              <span className="text-xs text-slate-400 block">Kode Partisipan BEI</span>
              <span className="text-3xl font-black text-amber-400 tracking-wider font-mono">{broker.code}</span>
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed text-sm sm:text-base border-t border-slate-800/80 pt-4">
            {broker.description}
          </p>

          {/* Fee Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Fee Transaksi Beli</span>
                <span className="text-lg font-bold text-emerald-400">{broker.feeBeli}</span>
              </div>
              <Percent className="w-5 h-5 text-emerald-400/50" />
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Fee Transaksi Jual</span>
                <span className="text-lg font-bold text-rose-400">{broker.feeJual}</span>
              </div>
              <Percent className="w-5 h-5 text-rose-400/50" />
            </div>
          </div>
        </div>

        {/* Fitur Unggulan */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Fitur Unggulan Sekuritas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {broker.fiturUnggulan.map((fitur, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-sm text-slate-200 p-2.5 bg-slate-800/50 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{fitur}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Direktori Kode Broker Lainnya */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h4 className="text-base font-bold text-slate-300">Cek Kode Broker BEI Populer Lainnya:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BROKER_DIRECTORY.filter((b) => b.code !== broker.code).map((b) => (
              <Link
                key={b.code}
                href={`/broker/${b.code.toLowerCase()}`}
                className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-lg text-amber-400">{b.code}</span>
                  <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-800 rounded">{b.type.split(' ')[0]}</span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-1 group-hover:text-slate-200 transition">
                  {b.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
