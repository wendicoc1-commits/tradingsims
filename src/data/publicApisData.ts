export interface PublicApiItem {
  id: string;
  name: string;
  description: string;
  category: 'Finance' | 'Crypto' | 'Forex' | 'Macro' | 'News' | 'AI' | 'Commodities';
  auth: 'No Auth' | 'API Key' | 'OAuth';
  https: boolean;
  cors: 'Yes' | 'No' | 'Unknown';
  url: string;
  testEndpoint?: string;
  sampleSnippet: {
    curl: string;
    python: string;
    javascript: string;
  };
  agentUseCases: string[];
  badge?: string;
}

export const PUBLIC_APIS_CATALOG: PublicApiItem[] = [
  // ── 1. FINANCE & EQUITY MARKETS ──
  {
    id: 'alpha-vantage',
    name: 'Alpha Vantage',
    description: 'Data harga saham real-time & historis global, teknikal indikator (RSI, MACD, EMA), serta sentimen berita pasar finansial.',
    category: 'Finance',
    auth: 'API Key',
    https: true,
    cors: 'Yes',
    url: 'https://www.alphavantage.co/documentation/',
    testEndpoint: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo',
    sampleSnippet: {
      curl: 'curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo"',
      python: 'import requests\nres = requests.get("https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo")\nprint(res.json())',
      javascript: 'const res = await fetch("https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo");\nconst data = await res.json();\nconsole.log(data);',
    },
    agentUseCases: [
      'Perhitungan otomatis indikator teknikal (SMA, Bollinger Bands, Stochastic)',
      'Analisis sentimen berita keuangan untuk sinyal momentum harian',
    ],
    badge: '⭐ POPULER',
  },
  {
    id: 'financial-modeling-prep',
    name: 'Financial Modeling Prep (FMP)',
    description: 'Laporan keuangan emiten (Income Statement, Balance Sheet, Cash Flow), rasio valuasi fundamental (PER, PBV, ROE), dan kalender dividen.',
    category: 'Finance',
    auth: 'API Key',
    https: true,
    cors: 'Yes',
    url: 'https://site.financialmodelingprep.com/developer/docs',
    testEndpoint: 'https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=demo',
    sampleSnippet: {
      curl: 'curl "https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=demo"',
      python: 'import requests\nres = requests.get("https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=demo")\nprint(res.json())',
      javascript: 'const res = await fetch("https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=demo");\nconst data = await res.json();\nconsole.log(data);',
    },
    agentUseCases: [
      'Valuasi intrinsik DCF (Discounted Cash Flow) oleh Benjamin Graham Value Desk',
      'Penyaringan saham berdividen tinggi dan kesehatan neraca utang emiten',
    ],
  },
  {
    id: 'finnhub',
    name: 'Finnhub Stock API',
    description: 'Data pasar saham global real-time, rekomendasi konsensus analis Wall Street, data earnings release, dan insider trading sentiment.',
    category: 'Finance',
    auth: 'API Key',
    https: true,
    cors: 'Yes',
    url: 'https://finnhub.io/docs/api',
    sampleSnippet: {
      curl: 'curl "https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY"',
      python: 'import requests\nres = requests.get("https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY")\nprint(res.json())',
      javascript: 'const res = await fetch("https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY");\nconst data = await res.json();\nconsole.log(data);',
    },
    agentUseCases: [
      'Pelacakan target harga analis konsensus untuk mengukur potensi upside/downside',
      'Deteksi anomali earnings surprise sebelum pengumuman kinerja kuartalan',
    ],
  },
  {
    id: 'sec-edgar',
    name: 'SEC EDGAR Public API',
    description: 'Dokumen keterbukaan publik perusahaan publik AS (10-K, 10-Q, 8-K, Form 4 Insider Ownership) langsung dari regulator SEC.',
    category: 'Finance',
    auth: 'No Auth',
    https: true,
    cors: 'Yes',
    url: 'https://www.sec.gov/edgar/sec-api-documentation',
    testEndpoint: 'https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json',
    sampleSnippet: {
      curl: 'curl -H "User-Agent: SampleApp admin@sample.com" "https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json"',
      python: 'import requests\nheaders = {"User-Agent": "TradeSims/1.0 (admin@tradingsims.my.id)"}\nres = requests.get("https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json", headers=headers)\nprint(res.status_code)',
      javascript: 'const res = await fetch("https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json", { headers: { "User-Agent": "TradeSims/1.0" } });\nconsole.log(await res.json());',
    },
    agentUseCases: [
      'Ekstraksi otomatis laporan kepemilikan saham oleh institusi besar (Whale 13F)',
      'Audit risiko hukum & disclosure risiko bisnis emiten secara otonom',
    ],
    badge: '🏛️ REGULATOR',
  },
  {
    id: 'stooq-markets',
    name: 'Stooq Market Data',
    description: 'Data historis gratis harga penutupan indeks bursa global, saham, obligasi, dan komoditas tanpa memerlukan registrasi API key.',
    category: 'Finance',
    auth: 'No Auth',
    https: true,
    cors: 'Yes',
    url: 'https://stooq.com/',
    sampleSnippet: {
      curl: 'curl "https://stooq.com/q/d/l/?s=^spx&i=d"',
      python: 'import pandas as pd\ndf = pd.read_csv("https://stooq.com/q/d/l/?s=^spx&i=d")\nprint(df.tail())',
      javascript: 'const res = await fetch("https://stooq.com/q/d/l/?s=^spx&i=d");\nconst csv = await res.text();\nconsole.log(csv);',
    },
    agentUseCases: [
      'Failover cadangan saat feed harga utama sedang mengalami gangguan',
      'Backtesting kuantitatif multi-tahun untuk strategi moving average crossover',
    ],
  },
  {
    id: 'twelve-data',
    name: 'Twelve Data',
    description: 'Satu API terintegrasi untuk Saham, Forex, dan Kripto dengan websocket streaming serta puluhan indikator teknis canggih.',
    category: 'Finance',
    auth: 'API Key',
    https: true,
    cors: 'Yes',
    url: 'https://twelvedata.com/docs',
    sampleSnippet: {
      curl: 'curl "https://api.twelvedata.com/time_series?symbol=AAPL&interval=1min&apikey=YOUR_KEY"',
      python: 'import requests\nres = requests.get("https://api.twelvedata.com/time_series?symbol=AAPL&interval=1min&apikey=demo")\nprint(res.json())',
      javascript: 'const res = await fetch("https://api.twelvedata.com/time_series?symbol=AAPL&interval=1min&apikey=demo");\nconsole.log(await res.json());',
    },
    agentUseCases: [
      'Multi-timeframe candlestick analysis (1m, 5m, 1h, 1D) untuk scalping bot',
      'Sinkronisasi harga antar aset secara real-time',
    ],
  },

  // ── 2. CRYPTOCURRENCY & WEB3 ──
  {
    id: 'coingecko-api',
    name: 'CoinGecko Public API',
    description: 'Basis data kripto independen terlengkap: harga spot 10.000+ koin, volume perdagangan, likuiditas DEX/CEX, dan metrik dominasi pasar Bitcoin.',
    category: 'Crypto',
    auth: 'No Auth',
    https: true,
    cors: 'Yes',
    url: 'https://docs.coingecko.com/v3.0.1/reference/endpoint-overview',
    testEndpoint: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=idr,usd&include_24hr_change=true',
    sampleSnippet: {
      curl: 'curl "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=idr,usd"',
      python: 'import requests\nres = requests.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=idr,usd")\nprint(res.json())',
      javascript: 'const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=idr,usd");\nconst data = await res.json();\nconsole.log(data);',
    },
    agentUseCases: [
      'Evaluasi Altcoin Season Index berdasarkan Bitcoin Dominance (%)',
      'Jesse Livermore Crypto Desk: Mendeteksi koin trending dengan volume breakout',
    ],
    badge: '🔥 PALING POPULER',
  },
  {
    id: 'binance-public-api',
    name: 'Binance Public Market API',
    description: 'API publik bursa kripto terbesar di dunia: order book depth level-2, data ticker 24 jam, klaster volume transaksi, dan k-lines.',
    category: 'Crypto',
    auth: 'No Auth',
    https: true,
    cors: 'Yes',
    url: 'https://binance-docs.github.io/apidocs/spot/en/',
    testEndpoint: 'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT',
    sampleSnippet: {
      curl: 'curl "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"',
      python: 'import requests\nres = requests.get("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT")\nprint(res.json())',
      javascript: 'const res = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");\nconsole.log(await res.json());',
    },
    agentUseCases: [
      'Order book bid/ask imbalance: Mengidentifikasi dinding beli/jual besar (Support/Resistance)',
      'Eksekusi instan simulator trading kripto real-time',
    ],
    badge: '⚡ ULTRA CEPAT',
  },
  {
    id: 'defillama-api',
    name: 'DeFiLlama API',
    description: 'Data terbuka tanpa batas untuk ekosistem DeFi: Total Value Locked (TVL), volume DEX, yield farm rates, likuidasi, dan treasury protokol.',
    category: 'Crypto',
    auth: 'No Auth',
    https: true,
    cors: 'Yes',
    url: 'https://defillama.com/docs/api',
    testEndpoint: 'https://api.llama.fi/protocols',
    sampleSnippet: {
      curl: 'curl "https://api.llama.fi/protocols"',
      python: 'import requests\nres = requests.get("https://api.llama.fi/protocols")\nprint(len(res.json()))',
      javascript: 'const res = await fetch("https://api.llama.fi/protocols");\nconst protocols = await res.json();\nconsole.log(protocols.slice(0, 5));',
    },
    agentUseCases: [
      'Menilai valuasi fundamental koin layer-1 & protokol DeFi (Mcap to TVL ratio)',
      'Deteksi aliran modal institusi masuk/keluar ke ekosistem tertentu (Solana, Arbitrum, Base)',
    ],
    badge: '💎 100% FREE NO AUTH',
  },
  {
    id: 'coincap-api',
    name: 'CoinCap v2 API',
    description: 'Feed harga kripto real-time dengan latency rendah, mendukung konversi multi-currency dan snapshot pasar global.',
    category: 'Crypto',
    auth: 'No Auth',
    https: true,
    cors: 'Yes',
    url: 'https://docs.coincap.io/',
    testEndpoint: 'https://api.coincap.io/v2/assets?limit=5',
    sampleSnippet: {
      curl: 'curl "https://api.coincap.io/v2/assets?limit=5"',
      python: 'import requests\nres = requests.get("https://api.coincap.io/v2/assets?limit=5")\nprint(res.json()["data"])',
      javascript: 'const res = await fetch("https://api.coincap.io/v2/assets?limit=5");\nconsole.log(await res.json());',
    },
    agentUseCases: [
      'Feed alternatif untuk memperbarui chart dan widget tanpa perlu API Key',
      'Penyusunan portofolio otomatis berbobot kapitalisasi pasar (Market Cap Weighting)',
    ],
  },
  {
    id: 'blockchain-info',
    name: 'Blockchain.com Data API',
    description: 'Data on-chain resmi Bitcoin: unconfirmed transactions mempool, hash rate jaringan, difficulty target, dan saldo address publik.',
    category: 'Crypto',
    auth: 'No Auth',
    https: true,
    cors: 'Yes',
    url: 'https://www.blockchain.com/explorer/api',
    testEndpoint: 'https://blockchain.info/q/getblockcount',
    sampleSnippet: {
      curl: 'curl "https://blockchain.info/q/getblockcount"',
      python: 'import requests\nprint("Current BTC Block:", requests.get("https://blockchain.info/q/getblockcount").text)',
      javascript: 'const block = await (await fetch("https://blockchain.info/q/getblockcount")).text();\nconsole.log("BTC Block:", block);',
    },
    agentUseCases: [
      'Memantau kemacetan mempool Bitcoin untuk memprediksi volatilitas jangka pendek',
      'Kalkulasi Bitcoin Halving Cycle progress untuk horizon trading jangka panjang',
    ],
  },

  // ── 3. FOREX & CURRENCY EXCHANGE ──
  {
    id: 'frankfurter-api',
    name: 'Frankfurter (European Central Bank Rates)',
    description: 'API kurs valas sumber terbuka yang melacak data resmi European Central Bank (ECB). 100% gratis, tanpa API Key, dan mendukung CORS.',
    category: 'Forex',
    auth: 'No Auth',
    https: true,
    cors: 'Yes',
    url: 'https://www.frankfurter.app/docs/',
    testEndpoint: 'https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,IDR',
    sampleSnippet: {
      curl: 'curl "https://api.frankfurter.app/latest?from=USD&to=IDR,EUR,GBP"',
      python: 'import requests\nres = requests.get("https://api.frankfurter.app/latest?from=USD&to=IDR,EUR,GBP")\nprint(res.json())',
      javascript: 'const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=IDR,EUR,GBP");\nconst data = await res.json();\nconsole.log(data.rates);',
    },
    agentUseCases: [
      'Konversi nilai aset multi-currency portofolio (USD / EUR / IDR) secara otomatis',
      'Deteksi tren apresiasi/depresiasi kurs Dolar terhadap mata uang mitra dagang',
    ],
    badge: '🏆 OPEN SOURCE ECB',
  },
  {
    id: 'exchangerate-api',
    name: 'ExchangeRate-API',
    description: 'Data konversi mata uang global untuk 160+ mata uang dunia dengan latensi andal dan dukungan integrasi perbankan.',
    category: 'Forex',
    auth: 'API Key',
    https: true,
    cors: 'Yes',
    url: 'https://www.exchangerate-api.com/docs/overview',
    testEndpoint: 'https://open.er-api.com/v6/latest/USD',
    sampleSnippet: {
      curl: 'curl "https://open.er-api.com/v6/latest/USD"',
      python: 'import requests\nres = requests.get("https://open.er-api.com/v6/latest/USD")\nprint(res.json()["rates"]["IDR"])',
      javascript: 'const res = await fetch("https://open.er-api.com/v6/latest/USD");\nconst data = await res.json();\nconsole.log("USD/IDR:", data.rates.IDR);',
    },
    agentUseCases: [
      'Sinkronisasi nilai wajar saham AS ke Rupiah pada halaman portofolio',
      'Pelacakan volatilitas kurs valuta asing lintas kawasan',
    ],
  },
  {
    id: 'open-er-api',
    name: 'Open Exchange Rates (Free Tier)',
    description: 'Standar industri untuk nilai tukar mata uang, digunakan oleh ribuan startup fintech global dengan update harian berkala.',
    category: 'Forex',
    auth: 'API Key',
    https: true,
    cors: 'Yes',
    url: 'https://docs.openexchangerates.org/',
    sampleSnippet: {
      curl: 'curl "https://openexchangerates.org/api/latest.json?app_id=YOUR_APP_ID"',
      python: 'import requests\nres = requests.get("https://openexchangerates.org/api/latest.json?app_id=YOUR_APP_ID")\nprint(res.json())',
      javascript: 'const res = await fetch("https://openexchangerates.org/api/latest.json?app_id=YOUR_APP_ID");\nconsole.log(await res.json());',
    },
    agentUseCases: [
      'Kalkulasi risiko devisa (FX Exposure) pada portofolio institusi campuran',
    ],
  },

  // ── 4. MACROECONOMICS & CENTRAL BANKS ──
  {
    id: 'fred-economic-data',
    name: 'FRED (Federal Reserve Economic Data)',
    description: 'Basis data makroekonomi terlengkap dari Federal Reserve Bank of St. Louis: Suku bunga The Fed, inflasi CPI, GDP, data pengangguran, dan M2 Money Supply.',
    category: 'Macro',
    auth: 'API Key',
    https: true,
    cors: 'Yes',
    url: 'https://fred.stlouisfed.org/docs/api/fred/',
    sampleSnippet: {
      curl: 'curl "https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=YOUR_KEY&file_type=json"',
      python: 'import requests\nres = requests.get("https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=YOUR_KEY&file_type=json")\nprint(res.json())',
      javascript: 'const res = await fetch("https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=YOUR_KEY&file_type=json");\nconsole.log(await res.json());',
    },
    agentUseCases: [
      'Macro Regime Detection: Mendeteksi apakah ekonomi berada dalam fase Expansive, Tightening, atau Recession',
      'Prediksi arah kebijakan moneter suku bunga acuan dunia',
    ],
    badge: '🏦 FEDERAL RESERVE',
  },
  {
    id: 'world-bank-api',
    name: 'World Bank Open Data API',
    description: 'Akses bebas ke indikator pembangunan dunia: GDP Indonesia, data populasi, perdagangan internasional, inflasi, dan utang negara.',
    category: 'Macro',
    auth: 'No Auth',
    https: true,
    cors: 'Yes',
    url: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation',
    testEndpoint: 'https://api.worldbank.org/v2/country/IDN/indicator/NY.GDP.MKTP.CD?format=json',
    sampleSnippet: {
      curl: 'curl "https://api.worldbank.org/v2/country/IDN/indicator/NY.GDP.MKTP.CD?format=json"',
      python: 'import requests\nres = requests.get("https://api.worldbank.org/v2/country/IDN/indicator/NY.GDP.MKTP.CD?format=json")\nprint(res.json()[1][:3])',
      javascript: 'const res = await fetch("https://api.worldbank.org/v2/country/IDN/indicator/NY.GDP.MKTP.CD?format=json");\nconst data = await res.json();\nconsole.log("Indonesia GDP:", data[1][0]);',
    },
    agentUseCases: [
      'Analisis makro struktural jangka panjang untuk strategi investasi nilai emiten lokal',
      'Perbandingan pertumbuhan GDP Indonesia vs negara berkembang Asia (Emerging Markets)',
    ],
    badge: '🌍 WORLD BANK',
  },
  {
    id: 'imf-data-api',
    name: 'IMF (International Monetary Fund) Data',
    description: 'Data statistik moneter dan neraca pembayaran global, cadangan devisa internasional, serta proyeksi pertumbuhan ekonomi IMF World Economic Outlook.',
    category: 'Macro',
    auth: 'No Auth',
    https: true,
    cors: 'Yes',
    url: 'https://datahelp.imf.org/knowledgebase/articles/667681-using-the-api',
    sampleSnippet: {
      curl: 'curl "http://dataservices.imf.org/REST/SDMX_JSON.svc/Dataflow"',
      python: 'import requests\nres = requests.get("http://dataservices.imf.org/REST/SDMX_JSON.svc/Dataflow")\nprint(res.status_code)',
      javascript: 'const res = await fetch("http://dataservices.imf.org/REST/SDMX_JSON.svc/Dataflow");\nconsole.log(await res.json());',
    },
    agentUseCases: [
      'Stress testing portofolio terhadap skenario krisis likuiditas global',
    ],
  },

  // ── 5. FINANCIAL NEWS & SENTIMENT ──
  {
    id: 'hackernews-api',
    name: 'Hacker News Official API (Firebase)',
    description: 'API gratis real-time untuk topik teknologi, startup AI, dan diskusi pasar finansial yang paling hangat diperbincangkan para tech leader.',
    category: 'News',
    auth: 'No Auth',
    https: true,
    cors: 'Yes',
    url: 'https://github.com/HackerNews/API',
    testEndpoint: 'https://hacker-news.firebaseio.com/v0/topstories.json?limitToFirst=10&orderBy="$key"',
    sampleSnippet: {
      curl: 'curl "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty"',
      python: 'import requests\ntop_ids = requests.get("https://hacker-news.firebaseio.com/v0/topstories.json").json()[:5]\nprint("Top HN stories:", top_ids)',
      javascript: 'const ids = await (await fetch("https://hacker-news.firebaseio.com/v0/topstories.json")).json();\nconsole.log(ids.slice(0, 5));',
    },
    agentUseCases: [
      'Early Narrative Spotting: Menangkap tren teknologi baru (AI Agent, Quantum Computing, Chips) sebelum ramai di pasar saham',
      'Filter sentimen developer terhadap adopsi teknologi baru',
    ],
  },
  {
    id: 'newsapi-org',
    name: 'NewsAPI.org',
    description: 'Pencarian artikel berita dari 80.000+ portal berita dunia secara real-time, difilter per kata kunci (IHSG, Bank Indonesia, Bitcoin, Saham).',
    category: 'News',
    auth: 'API Key',
    https: true,
    cors: 'Yes',
    url: 'https://newsapi.org/docs',
    sampleSnippet: {
      curl: 'curl "https://newsapi.org/v2/everything?q=indonesia+stocks&apiKey=YOUR_KEY"',
      python: 'import requests\nres = requests.get("https://newsapi.org/v2/everything?q=indonesia+stocks&apiKey=YOUR_KEY")\nprint(res.json()["totalResults"])',
      javascript: 'const res = await fetch("https://newsapi.org/v2/everything?q=indonesia+stocks&apiKey=YOUR_KEY");\nconsole.log(await res.json());',
    },
    agentUseCases: [
      'Breaking News Alert: Mengirim notifikasi kilat ke Telegram bot jika ada berita penting seputar emiten portofolio',
      'Skor NLP Sentiment Score (Bullish / Bearish / Neutral)',
    ],
  },
  {
    id: 'gnews-api',
    name: 'GNews API',
    description: 'Penyedia berita global cepat dan ringan dengan filter bahasa Indonesia dan kategori bisnis/teknologi.',
    category: 'News',
    auth: 'API Key',
    https: true,
    cors: 'Yes',
    url: 'https://gnews.io/docs/v4',
    sampleSnippet: {
      curl: 'curl "https://gnews.io/api/v4/search?q=saham&lang=id&apikey=YOUR_KEY"',
      python: 'import requests\nres = requests.get("https://gnews.io/api/v4/search?q=saham&lang=id&apikey=YOUR_KEY")\nprint(res.json())',
      javascript: 'const res = await fetch("https://gnews.io/api/v4/search?q=saham&lang=id&apikey=YOUR_KEY");\nconsole.log(await res.json());',
    },
    agentUseCases: [
      'Penyedia berita lokal bahasa Indonesia untuk melengkapi tab /stream Live News Wire',
    ],
  },

  // ── 6. COMMODITIES & ENERGY ──
  {
    id: 'eia-energy-data',
    name: 'U.S. Energy Information Administration (EIA)',
    description: 'Data cadangan minyak bumi mentah, gas alam, batu bara, dan produksi energi terbarukan global.',
    category: 'Commodities',
    auth: 'API Key',
    https: true,
    cors: 'Yes',
    url: 'https://www.eia.gov/opendata/',
    sampleSnippet: {
      curl: 'curl "https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=YOUR_KEY"',
      python: 'import requests\nres = requests.get("https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=YOUR_KEY")\nprint(res.json())',
      javascript: 'const res = await fetch("https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=YOUR_KEY");\nconsole.log(await res.json());',
    },
    agentUseCases: [
      'Kalkulasi korelasi harga minyak WTI & Brent terhadap laba emiten migas Indonesia (MEDC, ENRG, PGAS)',
      'Pelacakan inventori minyak mingguan EIA Crude Oil Inventories',
    ],
    badge: '🛢️ ENERGI & KOMODITAS',
  },
  {
    id: 'metals-api',
    name: 'Metals-API & Gold API',
    description: 'Harga real-time untuk logam mulia: Emas (XAU), Perak (XAG), Platinum (XPT), Nikel (XNI), dan Tembaga (XCU).',
    category: 'Commodities',
    auth: 'API Key',
    https: true,
    cors: 'Yes',
    url: 'https://metals-api.com/',
    sampleSnippet: {
      curl: 'curl "https://metals-api.com/api/latest?access_key=YOUR_KEY&base=USD&symbols=XAU,XAG"',
      python: 'import requests\nres = requests.get("https://metals-api.com/api/latest?access_key=YOUR_KEY&base=USD&symbols=XAU,XAG")\nprint(res.json())',
      javascript: 'const res = await fetch("https://metals-api.com/api/latest?access_key=YOUR_KEY&base=USD&symbols=XAU,XAG");\nconsole.log(await res.json());',
    },
    agentUseCases: [
      'Indikator momentum untuk emiten emas & nikel BEI (ANTM, MDKA, INCO, MBMA, NCKL)',
      'Safe-Haven Allocation: Memindahkan bobot aset ke instrumen defensif saat volatilitas tinggi',
    ],
  },

  // ── 7. ARTIFICIAL INTELLIGENCE & QUANT ──
  {
    id: 'huggingface-inference',
    name: 'Hugging Face Serverless Inference API',
    description: 'Akses instan ke ratusan model AI open-source (FinBERT untuk analisa sentimen finansial, Llama 3, Mistral, embeddings kuantitatif).',
    category: 'AI',
    auth: 'API Key',
    https: true,
    cors: 'Yes',
    url: 'https://huggingface.co/docs/api-inference/index',
    sampleSnippet: {
      curl: 'curl "https://api-inference.huggingface.co/models/ProsusAI/finbert" -H "Authorization: Bearer YOUR_TOKEN" -d "{\\"inputs\\": \\"Bank Central Asia reports record quarterly profit\\"}"',
      python: 'import requests\nAPI_URL = "https://api-inference.huggingface.co/models/ProsusAI/finbert"\nheaders = {"Authorization": "Bearer YOUR_TOKEN"}\nres = requests.post(API_URL, headers=headers, json={"inputs": "BCA profit up 15%"})\nprint(res.json())',
      javascript: 'const res = await fetch("https://api-inference.huggingface.co/models/ProsusAI/finbert", {\n  method: "POST",\n  headers: { "Authorization": "Bearer YOUR_TOKEN" },\n  body: JSON.stringify({ inputs: "BCA profit up 15%" })\n});\nconsole.log(await res.json());',
    },
    agentUseCases: [
      'ProsusAI/FinBERT: Klasifikasi sentimen finansial profesional secara otomatis',
      'Text summarization untuk ringkasan riset pasar harian',
    ],
    badge: '🤖 AI MODEL HUB',
  },
  {
    id: 'openbb-platform-api',
    name: 'OpenBB Platform Public Workspace',
    description: 'Infrastruktur riset data finansial open-source yang menyatukan ratusan sumber data (FRED, SEC, Yahoo, CBOE) dalam satu skema terstandarisasi.',
    category: 'AI',
    auth: 'No Auth',
    https: true,
    cors: 'Yes',
    url: 'https://docs.openbb.co/',
    sampleSnippet: {
      curl: 'curl "http://localhost:8001/api/openbb/snapshot"',
      python: 'import requests\nres = requests.get("http://localhost:8001/api/openbb/snapshot")\nprint(res.json())',
      javascript: 'const res = await fetch("/api/openbb/snapshot");\nconsole.log(await res.json());',
    },
    agentUseCases: [
      'Bridge langsung ke modul openbb kita di webkita',
      'Eksekusi model quant & valuasi komparatif multi-emiten',
    ],
    badge: '📊 QUANT RESEARCH',
  },
];
