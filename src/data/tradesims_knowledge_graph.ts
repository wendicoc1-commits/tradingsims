export interface KnowledgeGraphNode {
  id: string;
  label: string;
  category: 'UI' | 'STORE' | 'API' | 'AI' | 'DATABASE' | 'PUBLIC_API';
  filePath: string;
  description: string;
  cluster: string;
  x?: number;
  y?: number;
  radius?: number;
  color?: string;
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  relation: 'calls' | 'imports' | 'reads_state' | 'modifies_cash' | 'streams_data' | 'verifies';
  confidence: 'EXTRACTED' | 'INFERRED';
  label?: string;
}

export interface KnowledgeGraphCluster {
  id: string;
  name: string;
  color: string;
  description: string;
}

export const KNOWLEDGE_GRAPH_CLUSTERS: KnowledgeGraphCluster[] = [
  { id: 'UI', name: 'Presentation & Terminal Layer', color: '#38bdf8', description: 'Komponen antarmuka pengguna, grafik TradingView, modal transaksi' },
  { id: 'STORE', name: 'State Management & Audio Core', color: '#fbbf24', description: 'Store reaktif Zustand untuk sinkronisasi kas, order, portofolio, dan audio' },
  { id: 'AI', name: 'Autonomous Intelligence Desks', color: '#a855f7', description: 'Agen otonom Jesse Livermore, Renaissance Quant Desk, dan Risk Officer' },
  { id: 'API', name: 'Server Actions & Route Handlers', color: '#10b981', description: 'Endpoint backend Next.js untuk autentikasi, deposit QRIS, dan bot Telegram' },
  { id: 'DATABASE', name: 'Cloud Persistence & ACID Core', color: '#f43f5e', description: 'Supabase PostgreSQL, RPC Stored Procedures, dan RLS security' },
  { id: 'PUBLIC_API', name: 'Global Data Feed Registry', color: '#06b6d4', description: 'Koneksi eksternal 1.400+ feed: ECB Forex, CoinGecko, World Bank, FRED' },
];

export const TRADESIMS_KNOWLEDGE_NODES: KnowledgeGraphNode[] = [
  // ── UI Layer ──
  {
    id: 'header',
    label: 'TradeSimHeader.tsx',
    category: 'UI',
    filePath: 'src/components/layout/TradeSimHeader.tsx',
    description: 'Header navigasi global, saldo kas RDN live, tombol Top Up, CLI search prompt, dan audio switch.',
    cluster: 'UI',
    x: 0,
    y: -220,
    color: '#38bdf8',
  },
  {
    id: 'portfolio_desk',
    label: 'InstitutionalPortfolioDesk.tsx',
    category: 'UI',
    filePath: 'src/components/portfolio/InstitutionalPortfolioDesk.tsx',
    description: 'Workstation portofolio institusi, analisis Sharpe ratio, korelasi multi-aset, dan order risk TP/SL.',
    cluster: 'UI',
    x: -240,
    y: -120,
    color: '#38bdf8',
  },
  {
    id: 'right_dock',
    label: 'FinceptRightDock.tsx',
    category: 'UI',
    filePath: 'src/components/layout/FinceptRightDock.tsx',
    description: 'Dock eksekusi order instan (Buy/Sell limit), kalkulator broker fee & PPh bursa, dan watchlist.',
    cluster: 'UI',
    x: 240,
    y: -120,
    color: '#38bdf8',
  },
  {
    id: 'topup_modal',
    label: 'TopUpModal.tsx',
    category: 'UI',
    filePath: 'src/components/portfolio/TopUpModal.tsx',
    description: 'Modal pembayaran QRIS metode mutasi bank (10k=1M saldo), upload bukti struk, idempotency ticket.',
    cluster: 'UI',
    x: -120,
    y: -300,
    color: '#38bdf8',
  },
  {
    id: 'jesse_desk',
    label: 'JesseCryptoDeskView.tsx',
    category: 'UI',
    filePath: 'src/components/ai/JesseCryptoDeskView.tsx',
    description: 'Terminal trading kripto 24/7 berbasis filosofi Jesse Livermore dengan volume breakout detector.',
    cluster: 'UI',
    x: 320,
    y: 0,
    color: '#38bdf8',
  },
  {
    id: 'network_view',
    label: 'AdvancedMarketGraph.tsx',
    category: 'UI',
    filePath: 'src/components/network/AdvancedMarketGraph.tsx',
    description: 'Simulasi graf interaktif 2D/3D hubungan konglomerasi BEI dan kepemilikan saham lintas entitas.',
    cluster: 'UI',
    x: -320,
    y: 0,
    color: '#38bdf8',
  },
  {
    id: 'api_hub_view',
    label: 'PublicApiHubPage.tsx',
    category: 'UI',
    filePath: 'src/app/api-hub/page.tsx',
    description: 'Direktori interaktif 1.400+ public APIs dengan live probe sandbox dan code snippet generator.',
    cluster: 'UI',
    x: 180,
    y: -260,
    color: '#38bdf8',
  },

  // ── Store & State Layer ──
  {
    id: 'portfolio_store',
    label: 'usePortfolioStore.ts',
    category: 'STORE',
    filePath: 'src/store/index.ts',
    description: 'Central state kas virtual (default 100M), antrean order terisi, daftar kepemilikan holding, dan eksekusi beli/jual.',
    cluster: 'STORE',
    x: -80,
    y: -20,
    color: '#fbbf24',
  },
  {
    id: 'auth_store',
    label: 'useAuthStore.ts',
    category: 'STORE',
    filePath: 'src/store/useAuthStore.ts',
    description: 'Manajemen sesi JWT pengguna Supabase, sinkronisasi portofolio antar-perangkat, dan anti-overwrite protection.',
    cluster: 'STORE',
    x: 80,
    y: -20,
    color: '#fbbf24',
  },
  {
    id: 'ai_agent_store',
    label: 'aiAgentStore.ts',
    category: 'STORE',
    filePath: 'src/store/aiAgentStore.ts',
    description: 'Background AI autonomous trading worker, evaluasi sinyal kuantitatif, dan dispatching eksekusi autopilot.',
    cluster: 'STORE',
    x: 160,
    y: 100,
    color: '#fbbf24',
  },
  {
    id: 'audio_engine',
    label: 'tradeSimAudio.ts',
    category: 'STORE',
    filePath: 'src/lib/tradeSimAudio.ts',
    description: 'Web Audio API synthesizers sintetis untuk efek klik bursa, notifikasi order filled, dan ambient terminal soundscape.',
    cluster: 'STORE',
    x: -160,
    y: 100,
    color: '#fbbf24',
  },

  // ── AI Engine Layer ──
  {
    id: 'public_api_registry',
    label: 'publicApiRegistry.ts',
    category: 'AI',
    filePath: 'src/lib/agents/publicApiRegistry.ts',
    description: 'Konektor Tool-Calling untuk agen AI memanggil live ECB Forex, CoinGecko, dan World Bank data.',
    cluster: 'AI',
    x: 280,
    y: 180,
    color: '#a855f7',
  },
  {
    id: 'ai_hedge_fund',
    label: 'ai-hedge-fund (Python)',
    category: 'AI',
    filePath: 'scratch/ai-hedge-fund',
    description: 'Multi-agent LLM consensus architecture (Bill Ackman, Warren Buffett, Cathie Wood personas).',
    cluster: 'AI',
    x: 80,
    y: 220,
    color: '#a855f7',
  },
  {
    id: 'quant_bridge',
    label: 'quant_engine (FastAPI)',
    category: 'AI',
    filePath: 'scratch/quant_engine',
    description: 'Python High-Frequency microservice untuk backtesting vektor, kalkulasi VaR, dan Black-Scholes pricing.',
    cluster: 'AI',
    x: -80,
    y: 220,
    color: '#a855f7',
  },

  // ── Server Actions & Handlers ──
  {
    id: 'admin_actions',
    label: 'admin/actions.ts',
    category: 'API',
    filePath: 'src/app/admin/actions.ts',
    description: 'Server Actions dengan idempotent lock untuk persetujuan deposit saldo dan audit perubahan portofolio.',
    cluster: 'API',
    x: -180,
    y: -180,
    color: '#10b981',
  },
  {
    id: 'deposit_api',
    label: '/api/deposits',
    category: 'API',
    filePath: 'src/app/api/deposits/route.ts',
    description: 'HTTP endpoint penanganan tiket top up QRIS dari browser dan pemicu Webhook notifikasi admin.',
    cluster: 'API',
    x: -40,
    y: -160,
    color: '#10b981',
  },
  {
    id: 'telegram_bot',
    label: 'botNotifier.ts',
    category: 'API',
    filePath: 'src/lib/telegram/botNotifier.ts',
    description: 'Pengirim notifikasi kilat real-time ke Telegram grup admin saat tiket baru masuk atau disetujui.',
    cluster: 'API',
    x: 60,
    y: -160,
    color: '#10b981',
  },

  // ── Cloud Persistence & ACID Database ──
  {
    id: 'supabase_db',
    label: 'Supabase PostgreSQL (ACID)',
    category: 'DATABASE',
    filePath: 'Cloud Infrastructure (wrbzwjriruttagqufalr)',
    description: 'Tabel user_portfolios, deposits, transactions dengan Row Level Security dan atomic write transactions.',
    cluster: 'DATABASE',
    x: 0,
    y: 60,
    color: '#f43f5e',
  },

  // ── External Public APIs ──
  {
    id: 'frankfurter_api',
    label: 'Frankfurter ECB (Valas)',
    category: 'PUBLIC_API',
    filePath: 'https://api.frankfurter.app',
    description: 'Data kurs valas resmi European Central Bank tanpa auth untuk konversi USD/IDR dan devisa global.',
    cluster: 'PUBLIC_API',
    x: 340,
    y: 280,
    color: '#06b6d4',
  },
  {
    id: 'coingecko_api',
    label: 'CoinGecko Data Feed',
    category: 'PUBLIC_API',
    filePath: 'https://api.coingecko.com',
    description: 'Harga spot 10.000+ kripto dan metrik BTC Dominance untuk sinyal Jesse Livermore Desk.',
    cluster: 'PUBLIC_API',
    x: 420,
    y: 160,
    color: '#06b6d4',
  },
  {
    id: 'world_bank_api',
    label: 'World Bank Open Data',
    category: 'PUBLIC_API',
    filePath: 'https://api.worldbank.org',
    description: 'Data pertumbuhan GDP Indonesia dan inflasi untuk regime detection di AI Macro Desk.',
    cluster: 'PUBLIC_API',
    x: 200,
    y: 300,
    color: '#06b6d4',
  },
];

export const TRADESIMS_KNOWLEDGE_EDGES: KnowledgeGraphEdge[] = [
  // Header Connections
  { source: 'header', target: 'portfolio_store', relation: 'reads_state', confidence: 'EXTRACTED', label: 'Tampilkan Saldo' },
  { source: 'header', target: 'topup_modal', relation: 'calls', confidence: 'EXTRACTED', label: 'Buka Top Up' },
  { source: 'header', target: 'auth_store', relation: 'reads_state', confidence: 'EXTRACTED', label: 'Status Sesi' },
  { source: 'header', target: 'audio_engine', relation: 'calls', confidence: 'EXTRACTED', label: 'Audio Toggle' },
  { source: 'header', target: 'api_hub_view', relation: 'calls', confidence: 'EXTRACTED', label: 'Navigasi API Hub' },

  // Portfolio Desk & Execution
  { source: 'portfolio_desk', target: 'portfolio_store', relation: 'reads_state', confidence: 'EXTRACTED', label: 'Holding & Cash' },
  { source: 'portfolio_desk', target: 'topup_modal', relation: 'calls', confidence: 'EXTRACTED', label: 'Top Up Trigger' },
  { source: 'portfolio_desk', target: 'auth_store', relation: 'calls', confidence: 'EXTRACTED', label: 'Sync Portofolio' },
  { source: 'right_dock', target: 'portfolio_store', relation: 'modifies_cash', confidence: 'EXTRACTED', label: 'Beli / Jual Saham' },
  { source: 'right_dock', target: 'topup_modal', relation: 'calls', confidence: 'EXTRACTED', label: 'Quick Top Up' },

  // Deposit & Top Up Pipeline
  { source: 'topup_modal', target: 'deposit_api', relation: 'calls', confidence: 'EXTRACTED', label: 'POST Bukti Transfer' },
  { source: 'deposit_api', target: 'supabase_db', relation: 'modifies_cash', confidence: 'EXTRACTED', label: 'Insert Tiket' },
  { source: 'deposit_api', target: 'telegram_bot', relation: 'calls', confidence: 'EXTRACTED', label: 'Kirim Notifikasi Bot' },
  { source: 'admin_actions', target: 'supabase_db', relation: 'modifies_cash', confidence: 'EXTRACTED', label: 'Approve & Cairkan' },
  { source: 'admin_actions', target: 'telegram_bot', relation: 'calls', confidence: 'EXTRACTED', label: 'Alert Approval' },

  // Persistence Sync
  { source: 'auth_store', target: 'supabase_db', relation: 'calls', confidence: 'EXTRACTED', label: 'Dual-Direction Sync' },
  { source: 'portfolio_store', target: 'auth_store', relation: 'imports', confidence: 'EXTRACTED', label: 'Auto Backup' },

  // AI Autopilot & Tool Calling
  { source: 'ai_agent_store', target: 'public_api_registry', relation: 'calls', confidence: 'EXTRACTED', label: 'Tool Discovery' },
  { source: 'ai_agent_store', target: 'portfolio_store', relation: 'modifies_cash', confidence: 'EXTRACTED', label: 'Order Execution' },
  { source: 'jesse_desk', target: 'ai_agent_store', relation: 'reads_state', confidence: 'EXTRACTED', label: 'Crypto Pilot' },
  { source: 'public_api_registry', target: 'frankfurter_api', relation: 'streams_data', confidence: 'EXTRACTED', label: 'Kurs Valas ECB' },
  { source: 'public_api_registry', target: 'coingecko_api', relation: 'streams_data', confidence: 'EXTRACTED', label: 'BTC Dominance' },
  { source: 'public_api_registry', target: 'world_bank_api', relation: 'streams_data', confidence: 'EXTRACTED', label: 'GDP Macro Data' },

  // Quant & Python Bridge
  { source: 'portfolio_desk', target: 'quant_bridge', relation: 'calls', confidence: 'INFERRED', label: 'VaR & Alpha Metric' },
  { source: 'ai_agent_store', target: 'ai_hedge_fund', relation: 'calls', confidence: 'INFERRED', label: 'Multi-Agent Consensus' },
];
