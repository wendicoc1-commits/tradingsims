/**
 * Fincept Capital — struktur organisasi hedge fund penuh (1 lantai, 10 departemen, 50 agen).
 * File ini murni data + geometri denah. Tidak ada logika rendering / jaringan.
 */

export type DeptId =
  | 'EXEC'
  | 'PM'
  | 'RISK'
  | 'OPS'
  | 'RESEARCH'
  | 'TRADING'
  | 'QUANT'
  | 'MACRO'
  | 'NEWS'
  | 'TECH'
  | 'LOUNGE'
  | 'WARROOM';

export interface Department {
  id: DeptId;
  name: string;
  emoji: string;
  color: string; // hex
  /** Zona di dunia (koordinat world px) */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Indeks tile lantai (floor_N.png) */
  floorTile: number;
  mission: string;
}

export interface FirmAgent {
  id: string;
  name: string;
  title: string;
  dept: DeptId;
  emoji: string;
  /** Tugas nyata di hedge fund */
  duties: string[];
  /** Agen yang sering didatangi untuk konsultasi */
  collaborators: string[];
  /** Duduk di kursi Investment Committee saat sidang */
  committee?: boolean;
}

export const WORLD_W = 2400;
export const WORLD_H = 1500;
export const WALL_H = 128;

export const DEPARTMENTS: Department[] = [
  // ── Baris A ──
  { id: 'EXEC', name: 'EXECUTIVE SUITE', emoji: '🏛️', color: '#f59e0b', x: 40, y: 140, w: 480, h: 360, floorTile: 1,
    mission: 'Strategi firma, alokasi modal antar-strategi, tata kelola Investment Committee.' },
  { id: 'PM', name: 'PORTFOLIO MANAGEMENT', emoji: '💼', color: '#10b981', x: 560, y: 140, w: 620, h: 360, floorTile: 0,
    mission: 'Pengelola dana: membangun posisi, sizing, dan menjaga eksposur portofolio.' },
  { id: 'RISK', name: 'RISK MANAGEMENT', emoji: '🛡️', color: '#f43f5e', x: 1220, y: 140, w: 500, h: 360, floorTile: 2,
    mission: 'Gerbang risiko independen: VaR, stress test, limit drawdown, likuiditas.' },
  { id: 'OPS', name: 'COMPLIANCE & OPERATIONS', emoji: '⚖️', color: '#a78bfa', x: 1760, y: 140, w: 600, h: 360, floorTile: 1,
    mission: 'Kepatuhan OJK/BEI, NAV fund admin, rekonsiliasi trade, hukum.' },
  // ── Baris B ──
  { id: 'RESEARCH', name: 'FUNDAMENTAL RESEARCH', emoji: '🔬', color: '#38bdf8', x: 40, y: 540, w: 660, h: 420, floorTile: 0,
    mission: 'Analis sektor & forensik laporan keuangan: ROE, arus kas, kualitas laba.' },
  { id: 'LOUNGE', name: 'PANTRY & LOUNGE', emoji: '☕', color: '#a16207', x: 740, y: 540, w: 220, h: 420, floorTile: 2,
    mission: 'Area istirahat. Ide terbaik sering lahir di sini.' },
  { id: 'WARROOM', name: 'INVESTMENT COMMITTEE WAR ROOM', emoji: '🗣️', color: '#fbbf24', x: 1000, y: 540, w: 700, h: 420, floorTile: 1,
    mission: 'Sidang keputusan investasi: debat, voting, persetujuan risiko.' },
  { id: 'TRADING', name: 'TRADING DESK', emoji: '📈', color: '#22d3ee', x: 1740, y: 540, w: 620, h: 420, floorTile: 2,
    mission: 'Eksekusi order, microstructure, minimisasi biaya transaksi.' },
  // ── Baris C ──
  { id: 'QUANT', name: 'QUANT LAB', emoji: '📐', color: '#06b6d4', x: 40, y: 1000, w: 580, h: 460, floorTile: 1,
    mission: 'Riset faktor, stat-arb, machine learning, backtest strategi.' },
  { id: 'MACRO', name: 'MACRO & ECONOMICS', emoji: '🌍', color: '#fb923c', x: 660, y: 1000, w: 520, h: 460, floorTile: 0,
    mission: 'Suku bunga, kurs, komoditas, kalender ekonomi global.' },
  { id: 'NEWS', name: 'NEWSROOM & INTELLIGENCE', emoji: '📰', color: '#e879f9', x: 1220, y: 1000, w: 580, h: 460, floorTile: 2,
    mission: 'Memantau berita, keterbukaan informasi BEI, sentimen media & ritel.' },
  { id: 'TECH', name: 'DATA, TECH & INVESTOR RELATIONS', emoji: '🖥️', color: '#94a3b8', x: 1840, y: 1000, w: 520, h: 460, floorTile: 0,
    mission: 'Pipeline data, infrastruktur, atribusi kinerja, pelaporan investor.' },
];

export const WAR_ROOM = {
  cx: 1350,
  cy: 760,
  tableRx: 170,
  tableRy: 80,
  seatRx: 235,
  seatRy: 130,
};

export const PANTRY_SPOTS: { x: number; y: number }[] = [
  { x: 800, y: 680 }, { x: 850, y: 680 }, { x: 900, y: 680 },
  { x: 790, y: 770 }, { x: 910, y: 770 },
  { x: 800, y: 840 }, { x: 900, y: 840 },
];

export const FIRM_AGENTS: FirmAgent[] = [
  // ───────── EXECUTIVE ─────────
  { id: 'ceo', name: 'Adrian Wijaya', title: 'Managing Partner & CEO', dept: 'EXEC', emoji: '👔', committee: true,
    duties: ['Menetapkan strategi & selera risiko firma', 'Menandatangani keputusan alokasi besar', 'Hubungan dengan LP/investor utama'],
    collaborators: ['cio', 'coo'] },
  { id: 'cio', name: 'Dr. Evelyn Chandra', title: 'Chief Investment Officer', dept: 'EXEC', emoji: '🧭', committee: true,
    duties: ['Memimpin Investment Committee', 'Keputusan akhir BUY/HOLD/AVOID', 'Mengalokasikan risk budget antar PM'],
    collaborators: ['head_research', 'cro', 'head_quant'] },
  { id: 'coo', name: 'Rafael Santoso', title: 'Chief Operating Officer', dept: 'EXEC', emoji: '⚙️',
    duties: ['Operasional harian firma', 'Vendor, infrastruktur & kontrol internal', 'Kesinambungan bisnis (BCP)'],
    collaborators: ['cco', 'nav', 'sre'] },
  { id: 'cos', name: 'Nadia Pranoto', title: 'Chief of Staff · IC Secretary', dept: 'EXEC', emoji: '📋',
    duties: ['Menyusun agenda & notulen Investment Committee', 'Melacak tindak lanjut keputusan', 'Koordinasi lintas departemen'],
    collaborators: ['cio', 'ceo'] },

  // ───────── PORTFOLIO MANAGEMENT ─────────
  { id: 'pm_idx', name: 'Bagas Kurniawan', title: 'PM · IDX Long/Short Equity', dept: 'PM', emoji: '🇮🇩', committee: true,
    duties: ['Mengelola buku saham BEI', 'Menyusun thesis & target harga', 'Mengusulkan posisi ke Investment Committee'],
    collaborators: ['head_research', 'cro', 'head_trader'] },
  { id: 'pm_global', name: 'Olivia Tan', title: 'PM · Global Equities (US/Asia)', dept: 'PM', emoji: '🌐',
    duties: ['Mengelola buku saham global', 'Hedging FX bersama FX desk', 'Korelasi IHSG vs Wall Street'],
    collaborators: ['head_trader', 'chief_econ'] },
  { id: 'pm_income', name: 'Hendra Gunawan', title: 'PM · Dividend & Income', dept: 'PM', emoji: '💰', committee: true,
    duties: ['Strategi dividen & yield', 'Menilai keberlanjutan payout', 'Kalender cum/ex-date'],
    collaborators: ['r_bank', 'pm_idx'] },
  { id: 'pm_macro', name: 'Sarah Lim', title: 'PM · Global Macro Overlay', dept: 'PM', emoji: '🧮',
    duties: ['Overlay makro: duration, FX, komoditas', 'Menyesuaikan beta portofolio terhadap rezim makro'],
    collaborators: ['chief_econ', 'fx_rates'] },
  { id: 'allocator', name: 'Dimas Prakoso', title: 'Capital Allocator & Treasury', dept: 'PM', emoji: '🏦',
    duties: ['Position sizing berbasis risiko (1% NAV)', 'Mengelola kas & margin', 'Menyetujui ukuran lot sebelum eksekusi'],
    collaborators: ['cro', 'nav'] },
  { id: 'portcon', name: 'Tessa Anindya', title: 'Portfolio Construction', dept: 'PM', emoji: '🧩',
    duties: ['Mengukur konsentrasi sektor & korelasi', 'Optimasi bobot portofolio', 'Rebalancing'],
    collaborators: ['var', 'pm_idx'] },

  // ───────── RISK ─────────
  { id: 'cro', name: 'Victor Halim', title: 'Chief Risk Officer', dept: 'RISK', emoji: '🚨', committee: true,
    duties: ['Veto independen atas setiap posisi', 'Menetapkan stop-loss & limit', 'Memicu sirine human-in-the-loop'],
    collaborators: ['cio', 'pm_idx'] },
  { id: 'var', name: 'Maya Salim', title: 'Market Risk · VaR/ES', dept: 'RISK', emoji: '📉',
    duties: ['Value-at-Risk & Expected Shortfall harian', 'Backtest model risiko', 'Eksposur beta & sektor'],
    collaborators: ['stress', 'portcon'] },
  { id: 'stress', name: 'Arjun Mehta', title: 'Stress Test & Scenario', dept: 'RISK', emoji: '🌪️',
    duties: ['Skenario krisis (rupiah, suku bunga, komoditas)', 'Reverse stress test', 'Dampak gap-down'],
    collaborators: ['chief_econ', 'var'] },
  { id: 'limits', name: 'Rina Kusuma', title: 'Limit & Drawdown Monitor', dept: 'RISK', emoji: '📏',
    duties: ['Memantau limit posisi & drawdown', 'Alert pelanggaran limit', 'Eskalasi ke CRO'],
    collaborators: ['head_trader', 'cro'] },
  { id: 'liq', name: 'Kevin Oei', title: 'Liquidity & Counterparty Risk', dept: 'RISK', emoji: '💧',
    duties: ['Hari likuidasi per posisi', 'Risiko broker/counterparty', 'Batas % volume harian'],
    collaborators: ['head_trader', 'flow'] },

  // ───────── COMPLIANCE & OPS ─────────
  { id: 'cco', name: 'Laras Wibisono', title: 'Chief Compliance Officer', dept: 'OPS', emoji: '🔏', committee: true,
    duties: ['Kepatuhan OJK/BEI/KSEI', 'Larangan insider trading & restricted list', 'Audit trail setiap keputusan'],
    collaborators: ['legal', 'cro'] },
  { id: 'nav', name: 'Yoga Pratama', title: 'Fund Admin · NAV', dept: 'OPS', emoji: '🧾',
    duties: ['Perhitungan NAV harian', 'Valuasi posisi (mark-to-market)', 'Biaya & fee'],
    collaborators: ['recon', 'allocator'] },
  { id: 'recon', name: 'Cindy Hartono', title: 'Trade Reconciliation', dept: 'OPS', emoji: '🔁',
    duties: ['Rekonsiliasi order vs konfirmasi broker', 'Menangani trade break', 'Settlement T+2'],
    collaborators: ['trader_idx', 'nav'] },
  { id: 'legal', name: 'Bima Aditya', title: 'Legal & Regulatory', dept: 'OPS', emoji: '📜',
    duties: ['Kontrak & mandat investasi', 'Regulasi OJK/BEI (ARA/ARB, free float)', 'Review keterbukaan informasi'],
    collaborators: ['cco'] },

  // ───────── FUNDAMENTAL RESEARCH ─────────
  { id: 'head_research', name: 'Dr. Samuel Gunadi', title: 'Head of Fundamental Research', dept: 'RESEARCH', emoji: '🎓', committee: true,
    duties: ['Mengawasi kualitas riset', 'Menyajikan valuasi di Investment Committee', 'Menugaskan analis sektor'],
    collaborators: ['cio', 'pm_idx'] },
  { id: 'r_bank', name: 'Ayu Permata', title: 'Analis · Perbankan & Keuangan', dept: 'RESEARCH', emoji: '🏦',
    duties: ['NIM, CASA, NPL, CoC', 'ROE & kecukupan modal', 'Cakupan BBCA/BBRI/BMRI/BBNI'],
    collaborators: ['head_research', 'pm_income', 'r_forensic'] },
  { id: 'r_energy', name: 'Fajar Nugroho', title: 'Analis · Energi & Tambang', dept: 'RESEARCH', emoji: '⛏️',
    duties: ['Harga batubara/nikel/CPO', 'Biaya produksi & cadangan', 'Cakupan ADRO/PTBA/AMMN'],
    collaborators: ['commod', 'head_research'] },
  { id: 'r_consumer', name: 'Michelle Tanoto', title: 'Analis · Konsumer & Kesehatan', dept: 'RESEARCH', emoji: '🛒',
    duties: ['Volume penjualan & daya beli', 'Margin kotor & komoditas bahan baku', 'Cakupan ICBP/UNVR/KLBF'],
    collaborators: ['head_research', 'r_forensic'] },
  { id: 'r_tech', name: 'Kenji Saito', title: 'Analis · Teknologi & Digital', dept: 'RESEARCH', emoji: '💻',
    duties: ['Unit economics & jalur profitabilitas', 'Pertumbuhan pengguna/GMV', 'Cakupan GOTO/BUKA/EMTK + NVDA'],
    collaborators: ['head_research', 'mlds'] },
  { id: 'r_infra', name: 'Budi Hartanto', title: 'Analis · Infrastruktur & Properti', dept: 'RESEARCH', emoji: '🏗️',
    duties: ['Capex & leverage', 'Backlog & pre-sales', 'Cakupan TLKM/PGAS/properti'],
    collaborators: ['head_research', 'r_forensic'] },
  { id: 'r_forensic', name: 'Clara Wen', title: 'Forensic Accounting', dept: 'RESEARCH', emoji: '🔎',
    duties: ['Kualitas laba (accrual vs arus kas)', 'Red flag laporan audit', 'Transaksi pihak berelasi'],
    collaborators: ['head_research', 'cco'] },

  // ───────── TRADING ─────────
  { id: 'head_trader', name: 'Gilang Ramadhan', title: 'Head Trader', dept: 'TRADING', emoji: '🎯', committee: true,
    duties: ['Rencana eksekusi (limit/TWAP)', 'Menilai likuiditas & dampak pasar', 'Mengawasi desk trading'],
    collaborators: ['pm_idx', 'trader_idx'] },
  { id: 'trader_idx', name: 'Putri Maharani', title: 'Execution Trader · IDX', dept: 'TRADING', emoji: '⌨️',
    duties: ['Eksekusi order saham BEI', 'Fraksi harga & lot 100', 'Slicing order di buku antrian'],
    collaborators: ['flow', 'tca', 'recon'] },
  { id: 'trader_global', name: 'Daniel Cho', title: 'Execution Trader · Global', dept: 'TRADING', emoji: '🌏',
    duties: ['Eksekusi US/Asia', 'Zona waktu & FX settlement'],
    collaborators: ['pm_global', 'flow'] },
  { id: 'flow', name: 'Rizky Fauzan', title: 'Order Flow & Microstructure', dept: 'TRADING', emoji: '🌊',
    duties: ['Foreign/domestic net flow', 'Bid-offer & tekanan beli-jual', 'Deteksi akumulasi/distribusi'],
    collaborators: ['head_quant', 'trader_idx'] },
  { id: 'tca', name: 'Sophie Lauw', title: 'Transaction Cost Analysis', dept: 'TRADING', emoji: '🧮',
    duties: ['Slippage vs benchmark', 'Biaya broker & pajak', 'Umpan balik ke strategi eksekusi'],
    collaborators: ['head_trader', 'perf'] },
  { id: 'trader_crypto', name: 'Kevin Zhang', title: 'Crypto Quant PM · Jesse Desk', dept: 'TRADING', emoji: '⚡', committee: true,
    duties: ['Eksekusi spot & derif crypto 24/7', 'Menerapkan strategi Jesse AI', 'Arbitrase & likuiditas multi-koin'],
    collaborators: ['quant_crypto', 'head_trader', 'cro'] },

  // ───────── QUANT ─────────
  { id: 'head_quant', name: 'Dr. Li Wei', title: 'Head of Quant Research', dept: 'QUANT', emoji: '🧪', committee: true,
    duties: ['Sinyal multi-timeframe & faktor', 'Smart-money zones', 'Validasi statistik semua sinyal'],
    collaborators: ['cio', 'factor'] },
  { id: 'quant_crypto', name: 'Jesse Vance', title: 'Jesse Algorithmic Strategy Lead', dept: 'QUANT', emoji: '🪙',
    duties: ['Optimasi parameter strategi Jesse AI', 'Backtest walk-forward kripto & Sharpe ratio', 'Multi-timeframe crypto momentum'],
    collaborators: ['trader_crypto', 'head_quant'] },
  { id: 'factor', name: 'Anisa Rahma', title: 'Factor Researcher', dept: 'QUANT', emoji: '📊',
    duties: ['Faktor value/quality/momentum', 'Skor multi-faktor per emiten'],
    collaborators: ['r_bank', 'backtest'] },
  { id: 'statarb', name: 'Theo Kristanto', title: 'Stat-Arb & Pairs', dept: 'QUANT', emoji: '⚖️',
    duties: ['Pairs trading antar emiten sektor sama', 'Mean-reversion & kointegrasi'],
    collaborators: ['backtest', 'flow'] },
  { id: 'mlds', name: 'Priya Nair', title: 'ML & Alt-Data Scientist', dept: 'QUANT', emoji: '🤖',
    duties: ['Model prediksi & fitur alternatif', 'NLP berita sebagai fitur', 'Monitoring drift model'],
    collaborators: ['nlp', 'data_eng'] },
  { id: 'backtest', name: 'Eko Susilo', title: 'Backtest & Strategy Engineer', dept: 'QUANT', emoji: '🔧',
    duties: ['Backtest walk-forward', 'Menghindari look-ahead & overfitting', 'Pine Script / strategi'],
    collaborators: ['head_quant', 'data_eng'] },

  // ───────── MACRO ─────────
  { id: 'chief_econ', name: 'Dr. Wulan Sari', title: 'Chief Economist', dept: 'MACRO', emoji: '🌐', committee: true,
    duties: ['Outlook makro & rezim pasar', 'Fed, BI rate, inflasi, PDB', 'Dampak makro ke sektor'],
    collaborators: ['cio', 'pm_macro'] },
  { id: 'fx_rates', name: 'Andre Lukito', title: 'FX & Rates Strategist', dept: 'MACRO', emoji: '💱',
    duties: ['USD/IDR & yield curve', 'Spread 2Y-10Y & sinyal inversi'],
    collaborators: ['commod', 'pm_global'] },
  { id: 'commod', name: 'Hana Yoshida', title: 'Commodities Strategist', dept: 'MACRO', emoji: '🛢️',
    duties: ['Batubara, nikel, CPO, minyak, emas', 'Rantai pasok & ketergantungan'],
    collaborators: ['r_energy', 'chief_econ'] },
  { id: 'calendar', name: 'Ilham Fadli', title: 'Economic Calendar Analyst', dept: 'MACRO', emoji: '🗓️',
    duties: ['Jadwal rilis data berdampak tinggi', 'Konsensus vs aktual', 'Peringatan event risk'],
    collaborators: ['news_editor', 'chief_econ'] },

  // ───────── NEWS & INTELLIGENCE ─────────
  { id: 'news_editor', name: 'Tara Mahendra', title: 'Editor-in-Chief · News Desk', dept: 'NEWS', emoji: '🗞️', committee: true,
    duties: ['Prioritas berita untuk PM & IC', 'Verifikasi sumber', 'Briefing pagi'],
    collaborators: ['cio', 'head_research'] },
  { id: 'news_idx', name: 'Reza Firmansyah', title: 'IDX News Scout', dept: 'NEWS', emoji: '🔍',
    duties: ['Memindai portal berita Indonesia', 'Mengaitkan berita ke ticker'],
    collaborators: ['pm_idx', 'nlp', 'news_editor'] },
  { id: 'news_global', name: 'Emily Carter', title: 'Global News Scout', dept: 'NEWS', emoji: '📡',
    duties: ['Wall Street, Asia & Eropa', 'Berita yang menggerakkan IHSG'],
    collaborators: ['pm_global', 'chief_econ'] },
  { id: 'nlp', name: 'Vikram Rao', title: 'Sentiment NLP Analyst', dept: 'NEWS', emoji: '🧠',
    duties: ['Klasifikasi sentimen bullish/bearish', 'Skor sentimen per ticker'],
    collaborators: ['news_editor', 'head_quant'] },
  { id: 'filings', name: 'Dewi Lestari', title: 'Corporate Filings & Actions', dept: 'NEWS', emoji: '📑',
    duties: ['Keterbukaan informasi BEI', 'Aksi korporasi, RUPS, dividen', 'Transaksi insider'],
    collaborators: ['r_forensic', 'cco'] },
  { id: 'social', name: 'Jonas Wirawan', title: 'Social & Retail Sentiment', dept: 'NEWS', emoji: '💬',
    duties: ['Sentimen ritel & komunitas', 'Deteksi hype / pump'],
    collaborators: ['nlp'] },

  // ───────── DATA, TECH & IR ─────────
  { id: 'data_eng', name: 'Hafiz Alamsyah', title: 'Data Engineer · Pipelines', dept: 'TECH', emoji: '🛠️',
    duties: ['Pipeline crawler berita & harga', 'Kualitas & kesegaran data', 'Skema data riset'],
    collaborators: ['mlds', 'sre', 'news_idx'] },
  { id: 'sre', name: 'Mei Ling', title: 'Infrastructure & SRE', dept: 'TECH', emoji: '🖧',
    duties: ['Uptime & latensi API', 'Observability', 'Keamanan akses'],
    collaborators: ['data_eng'] },
  { id: 'perf', name: 'Gita Savitri', title: 'Performance Attribution', dept: 'TECH', emoji: '📈',
    duties: ['Atribusi P&L per posisi/sektor', 'Benchmark vs IHSG'],
    collaborators: ['nav', 'pm_idx'] },
  { id: 'ir', name: 'Nathan Pangestu', title: 'Investor Relations & Reporting', dept: 'TECH', emoji: '📬',
    duties: ['Laporan bulanan investor', 'Komunikasi kinerja'],
    collaborators: ['ceo', 'perf'] },
];

// ───────────────────────── GEOMETRI DESK ─────────────────────────

export const DESK_W = 96;
export const DESK_H = 64;
export const DESK_COL_STEP = 140;
export const DESK_ROW_STEP = 140;

export interface DeskSlot {
  agentId: string;
  /** Pusat meja */
  dx: number;
  dy: number;
  /** Titik kaki agen saat duduk (di balik meja) */
  seatX: number;
  seatY: number;
}

/** Hitung penempatan meja otomatis per departemen. */
export function layoutDesks(): Record<string, DeskSlot> {
  const slots: Record<string, DeskSlot> = {};
  DEPARTMENTS.forEach((dept) => {
    const members = FIRM_AGENTS.filter((a) => a.dept === dept.id);
    if (members.length === 0) return; // pantry & war room tidak punya meja

    const cols = Math.max(1, Math.floor((dept.w - 40) / DESK_COL_STEP));
    const usedCols = Math.min(cols, members.length);
    const startX = dept.x + (dept.w - usedCols * DESK_COL_STEP) / 2 + DESK_COL_STEP / 2;
    members.forEach((agent, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const dx = startX + col * DESK_COL_STEP;
      const dy = dept.y + 132 + row * DESK_ROW_STEP;
      slots[agent.id] = { agentId: agent.id, dx, dy, seatX: dx - 14, seatY: dy - 20 };
    });
  });
  return slots;
}

/** Posisi kursi & galeri War Room untuk rapat seluruh departemen (hingga 50+ agen). */
export function warRoomSeats(count: number): { x: number; y: number }[] {
  const seats: { x: number; y: number }[] = [];
  if (count <= 14) {
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / count;
      seats.push({
        x: Math.round(WAR_ROOM.cx + WAR_ROOM.seatRx * Math.cos(a)),
        y: Math.round(WAR_ROOM.cy + WAR_ROOM.seatRy * Math.sin(a)),
      });
    }
    return seats;
  }

  // Multi-ring untuk seluruh departemen hedge fund (50 agen berkumpul di War Room):
  // Ring 1: Meja Utama Pimpinan & Komite (16 kursi)
  const ring1 = Math.min(16, count);
  for (let i = 0; i < ring1; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / ring1;
    seats.push({
      x: Math.round(WAR_ROOM.cx + WAR_ROOM.seatRx * Math.cos(a)),
      y: Math.round(WAR_ROOM.cy + WAR_ROOM.seatRy * Math.sin(a)),
    });
  }

  // Ring 2: Galeri Departemen Lapisan 2 (18 posisi)
  const remainingAfterRing1 = count - ring1;
  const ring2 = Math.min(18, remainingAfterRing1);
  const rx2 = 285;
  const ry2 = 160;
  for (let i = 0; i < ring2; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / ring2 + (Math.PI / ring2);
    seats.push({
      x: Math.round(WAR_ROOM.cx + rx2 * Math.cos(a)),
      y: Math.round(WAR_ROOM.cy + ry2 * Math.sin(a)),
    });
  }

  // Ring 3: Galeri Departemen Luar (sisa agen)
  const remainingAfterRing2 = remainingAfterRing1 - ring2;
  if (remainingAfterRing2 > 0) {
    const rx3 = 325;
    const ry3 = 188;
    for (let i = 0; i < remainingAfterRing2; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / remainingAfterRing2;
      seats.push({
        x: Math.round(WAR_ROOM.cx + rx3 * Math.cos(a)),
        y: Math.round(WAR_ROOM.cy + ry3 * Math.sin(a)),
      });
    }
  }

  return seats;
}

export const AGENT_BY_ID: Record<string, FirmAgent> = Object.fromEntries(
  FIRM_AGENTS.map((a) => [a.id, a])
);
export const DEPT_BY_ID: Record<DeptId, Department> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.id, d])
) as Record<DeptId, Department>;
