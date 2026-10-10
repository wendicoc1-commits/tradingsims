'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  Zap,
  Code2,
  ExternalLink,
  ShieldCheck,
  Check,
  Copy,
  Terminal,
  Activity,
  Bot,
  Layers,
  ArrowRight,
  Filter,
  Sparkles,
  RefreshCw,
  Clock,
  Database,
  Cpu,
  TrendingUp,
} from 'lucide-react';
import { PUBLIC_APIS_CATALOG, PublicApiItem } from '@/data/publicApisData';
import { PublicApiRegistry, AgentApiExecutionResult } from '@/lib/agents/publicApiRegistry';

type CategoryFilter = 'ALL' | 'Finance' | 'Crypto' | 'Forex' | 'Macro' | 'News' | 'Commodities' | 'AI';

export default function PublicApiHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [corsOnly, setCorsOnly] = useState(false);
  const [noAuthOnly, setNoAuthOnly] = useState(false);

  // Active Snippet Tab State per API Card
  const [activeSnippetLang, setActiveSnippetLang] = useState<Record<string, 'curl' | 'python' | 'javascript'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Testing Console State
  const [testingApiId, setTestingApiId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<AgentApiExecutionResult | null>(null);
  const [isProbing, setIsProbing] = useState(false);

  // Filtered Items
  const filteredApis = useMemo(() => {
    return PUBLIC_APIS_CATALOG.filter((item) => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchCors = !corsOnly || item.cors === 'Yes';
      const matchNoAuth = !noAuthOnly || item.auth === 'No Auth';

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.agentUseCases.some((uc) => uc.toLowerCase().includes(q));

      return matchCat && matchCors && matchNoAuth && matchSearch;
    });
  }, [selectedCategory, corsOnly, noAuthOnly, searchQuery]);

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestProbe = async (api: PublicApiItem) => {
    setTestingApiId(api.id);
    setIsProbing(true);
    setTestResult(null);

    const result = await PublicApiRegistry.executeLiveProbe(api.id);
    setTestResult(result);
    setIsProbing(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-8">
      {/* ── Breadcrumb & Header Title ── */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
              <Link href="/" className="hover:text-amber-400 transition">
                Terminal
              </Link>
              <span>/</span>
              <span className="text-amber-400 font-semibold">Public API Hub</span>
              <span>/</span>
              <span className="text-zinc-500">Based on GitHub Most Stars (public-apis)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
              <Globe className="w-8 h-8 text-amber-400" />
              <span>FinTech &amp; Developer Public API Hub</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                1.400+ Curated Data Feeds
              </span>
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-3xl">
              Direktori terintegrasi sumber data finansial, kripto, makroekonomi, kurs valas, dan AI gratis berskala global. 
              Dapat dieksplorasi langsung oleh pengembang, trader kuantitatif, serta digunakan secara otonom oleh <b>AI Trading Pilot</b> kita.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/architecture"
              className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>Arsitektur Sistem</span>
            </Link>
            <Link
              href="/ai"
              className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition"
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Trading Floor</span>
            </Link>
          </div>
        </div>

        {/* ── Key Statistics Banners ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Total API FinTech &amp; Quant</span>
            </div>
            <div className="text-xl font-black text-white">{PUBLIC_APIS_CATALOG.length} Layanan</div>
            <div className="text-[10px] text-zinc-500">Terkurasi dari 300k+ Star GitHub</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Free / Open Tier</span>
            </div>
            <div className="text-xl font-black text-emerald-400">Rp 0 (Bebas Biaya)</div>
            <div className="text-[10px] text-zinc-500">Tanpa langganan terminal mahal</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Agent Tool Calling</span>
            </div>
            <div className="text-xl font-black text-cyan-300">Siap Otonom</div>
            <div className="text-[10px] text-zinc-500">Terhubung ke ReAct Registry</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>Live Probe Sandbox</span>
            </div>
            <div className="text-xl font-black text-purple-300">In-Browser Test</div>
            <div className="text-[10px] text-zinc-500">Uji coba ping &amp; respons live</div>
          </div>
        </div>

        {/* ── Interactive Live Playground Banner (If Test Result Active) ── */}
        {testResult && (
          <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/40 shadow-xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    testResult.success ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  Live Probe Hasil Test: <strong className="text-amber-400">{testResult.apiName}</strong>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-700 text-zinc-300">
                  ⚡ {testResult.latencyMs} ms
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    testResult.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {testResult.success ? '200 OK (SUCCESS)' : 'ERROR / BLOCKED'}
                </span>
              </div>
              <button
                onClick={() => setTestResult(null)}
                className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                ✕ Tutup Sandbox
              </button>
            </div>

            {testResult.error ? (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                {testResult.error}
              </div>
            ) : (
              <div className="relative">
                <pre className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-emerald-400 max-h-56 overflow-y-auto overflow-x-auto whitespace-pre-wrap">
                  {typeof testResult.data === 'object'
                    ? JSON.stringify(testResult.data, null, 2)
                    : String(testResult.data)}
                </pre>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyCode('test-json', JSON.stringify(testResult.data, null, 2))
                  }
                  className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[10px] text-zinc-200 flex items-center gap-1 cursor-pointer transition"
                >
                  {copiedId === 'test-json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === 'test-json' ? 'Tersalin' : 'Salin JSON'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Search Bar & Filter Controls (Tanpa Tab Terpisah, Fungsi Kategori 100% Terjaga) ── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari API (misal: 'Bitcoin', 'Kurs Valas', 'The Fed', 'Sentimen', 'Alpha Vantage')..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-zinc-500 outline-none transition"
            />
          </div>

          {/* Category Dropdown & Quick Filters */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CategoryFilter)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-800 text-amber-300 focus:border-amber-500 outline-none cursor-pointer pr-7"
                title="Filter Kategori API"
              >
                <option value="ALL">🌐 Semua Kategori ({PUBLIC_APIS_CATALOG.length})</option>
                <option value="Finance">📈 Pasar Saham</option>
                <option value="Crypto">🪙 Kripto & Web3</option>
                <option value="Forex">💱 Forex & Valas</option>
                <option value="Macro">🏦 Makro & Bank Sentral</option>
                <option value="News">📰 Berita & Sentimen</option>
                <option value="Commodities">🛢️ Komoditas & Energi</option>
                <option value="AI">🤖 AI & Kuantitatif</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setCorsOnly(!corsOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                corsOnly
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>CORS Ready</span>
            </button>

            <button
              type="button"
              onClick={() => setNoAuthOnly(!noAuthOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                noAuthOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>No Auth</span>
            </button>
          </div>
        </div>

        {/* ── API Grid List ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApis.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-sm">Tidak ada API yang cocok dengan filter pencarian.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setCorsOnly(false);
                  setNoAuthOnly(false);
                }}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            filteredApis.map((api) => {
              const lang = activeSnippetLang[api.id] || 'curl';
              const codeSnippet = api.sampleSnippet[lang];

              return (
                <div
                  key={api.id}
                  className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700 transition flex flex-col justify-between space-y-4 shadow-lg group"
                >
                  <div>
                    {/* Top Meta Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 border border-zinc-700 text-zinc-300 uppercase">
                          {api.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            api.auth === 'No Auth'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {api.auth}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            api.cors === 'Yes'
                              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                              : 'bg-zinc-850 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          CORS: {api.cors}
                        </span>
                      </div>

                      {api.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {api.badge}
                        </span>
                      )}
                    </div>

                    {/* Name & Description */}
                    <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition flex items-center justify-between">
                      <span>{api.name}</span>
                      <a
                        href={api.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-500 hover:text-white transition p-1"
                        title="Buka Dokumentasi Resmi"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                      {api.description}
                    </p>

                    {/* AI Agent Use Cases */}
                    <div className="mt-3.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        <span>Koneksi AI Trading Agent:</span>
                      </div>
                      <ul className="text-[11px] text-zinc-300 space-y-1 list-disc list-inside">
                        {api.agentUseCases.map((uc, idx) => (
                          <li key={idx} className="leading-snug">
                            {uc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Code Snippet Box */}
                  <div className="space-y-2 pt-2 border-t border-zinc-900">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1">
                        {(['curl', 'python', 'javascript'] as const).map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() =>
                              setActiveSnippetLang((prev) => ({ ...prev, [api.id]: l }))
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition ${
                              lang === l
                                ? 'bg-zinc-800 text-amber-300 font-bold'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {l === 'curl' ? 'cURL' : l === 'python' ? 'Python' : 'JS / TS'}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {api.testEndpoint && (
                          <button
                            type="button"
                            onClick={() => handleTestProbe(api)}
                            disabled={isProbing && testingApiId === api.id}
                            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                            title="Lakukan tes pemanggilan langsung dari web browser"
                          >
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span>
                              {isProbing && testingApiId === api.id ? 'Memanggil...' : 'Test Ping Live'}
                            </span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopyCode(api.id, codeSnippet)}
                          className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          title="Salin Code Snippet"
                        >
                          {copiedId === api.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <pre className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-850 font-mono text-[10px] text-zinc-300 overflow-x-auto whitespace-pre no-scrollbar">
                      {codeSnippet}
                    </pre>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Strategic Agentic Infrastructure Banner ── */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              ARSITEKTUR MULTI-AGEN OTONOM
            </span>
            <h3 className="text-xl font-bold text-white">
              Bagaimana AI Trading Agent Menggunakan Public APIs Ini?
            </h3>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Seluruh katalog API ini terdaftar di modul <code>src/lib/agents/publicApiRegistry.ts</code>. 
              Saat AI Pilot aktif di latar belakang (Background Worker), ia menggunakan teknik <b>Tool Calling</b> untuk mengumpulkan data multi-dimensi—mengaitkan pergerakan harga saham IDX dengan fluktuasi kurs Rupiah (ECB API), suku bunga The Fed (FRED), dan sentimen berita dunia (News API).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/ai"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <span>Uji Coba AI Pilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
