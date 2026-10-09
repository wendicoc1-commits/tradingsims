// Comprehensive Global Markets & Economy Master Dataset

export interface GlobalStock {
  ticker: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  currency: string;
  price: number;
  changePct: number;
  marketCap: string;
  per: number;
  sector: string;
  exchange: string;
}

export interface GlobalCrypto {
  symbol: string;
  name: string;
  category: 'L1' | 'L2' | 'DEFI' | 'AI' | 'MEME' | 'RWA' | 'INFRA';
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  marketCap: string;
  rank: number;
}

export interface CountryEconomy {
  country: string;
  countryCode: string;
  flag: string;
  region: 'AMERICAS' | 'EUROPE' | 'ASIA-PACIFIC' | 'MIDDLE EAST & AFRICA';
  centralBank: string;
  interestRate: number;
  rateChange: string;
  gdpNominal: string;
  gdpGrowth: number;
  inflationCpi: number;
  unemployment: number;
  debtToGdp: number;
  status: 'EXPANSION' | 'STABLE' | 'RESTRICTIVE';
}

/* ─── 1. COMPLETE GLOBAL FOREIGN STOCKS (160+ EMITEN DUNIA & WALL STREET) ─── */
export const MASTER_GLOBAL_STOCKS: GlobalStock[] = [
  // ── UNITED STATES: MEGA-CAP & MAGNIFICENT 7 ──
  { ticker: 'NVDA', name: 'NVIDIA Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 141.54, changePct: 3.12, marketCap: '$3.47 T', per: 62.4, sector: 'Semiconductors & AI Accelerators', exchange: 'NASDAQ' },
  { ticker: 'AAPL', name: 'Apple Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 232.15, changePct: 0.85, marketCap: '$3.52 T', per: 34.2, sector: 'Consumer Electronics & Services', exchange: 'NASDAQ' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 428.50, changePct: 1.15, marketCap: '$3.18 T', per: 35.8, sector: 'Cloud Software & Azure AI', exchange: 'NASDAQ' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 187.80, changePct: 1.62, marketCap: '$1.98 T', per: 42.1, sector: 'E-Commerce & AWS Cloud', exchange: 'NASDAQ' },
  { ticker: 'GOOGL', name: 'Alphabet Inc. (Google Class A)', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 168.20, changePct: -0.45, marketCap: '$2.09 T', per: 24.5, sector: 'Search & Cloud Services', exchange: 'NASDAQ' },
  { ticker: 'GOOG', name: 'Alphabet Inc. (Google Class C)', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 169.50, changePct: -0.42, marketCap: '$2.09 T', per: 24.6, sector: 'Search & Cloud Services', exchange: 'NASDAQ' },
  { ticker: 'META', name: 'Meta Platforms (Facebook/Instagram)', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 589.40, changePct: 2.40, marketCap: '$1.49 T', per: 28.2, sector: 'Social Media & Metaverse', exchange: 'NASDAQ' },
  { ticker: 'TSLA', name: 'Tesla Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 218.80, changePct: 3.85, marketCap: '$698 B', per: 68.5, sector: 'Electric Vehicles & Autonomous AI', exchange: 'NASDAQ' },

  // ── UNITED STATES: SEMICONDUCTORS & HARDWARE AI ──
  { ticker: 'AVGO', name: 'Broadcom Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 182.40, changePct: 2.15, marketCap: '$845 B', per: 45.2, sector: 'Custom AI ASICs & Networking', exchange: 'NASDAQ' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 156.40, changePct: 2.80, marketCap: '$252 B', per: 54.2, sector: 'CPUs & Instinct AI GPUs', exchange: 'NASDAQ' },
  { ticker: 'QCOM', name: 'Qualcomm Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 172.50, changePct: 1.85, marketCap: '$192 B', per: 18.4, sector: 'Snapdragon 5G & Edge AI', exchange: 'NASDAQ' },
  { ticker: 'INTC', name: 'Intel Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 23.40, changePct: -1.25, marketCap: '$100 B', per: 32.0, sector: 'x86 Processors & Foundry', exchange: 'NASDAQ' },
  { ticker: 'ARM', name: 'Arm Holdings plc', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 142.80, changePct: 4.60, marketCap: '$148 B', per: 92.5, sector: 'Semiconductor IP & Architecture', exchange: 'NASDAQ' },
  { ticker: 'MU', name: 'Micron Technology Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 110.20, changePct: 3.10, marketCap: '$122 B', per: 24.8, sector: 'DRAM & HBM Memory', exchange: 'NASDAQ' },
  { ticker: 'TXN', name: 'Texas Instruments Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 204.50, changePct: 0.95, marketCap: '$186 B', per: 34.0, sector: 'Analog & Embedded Chips', exchange: 'NASDAQ' },
  { ticker: 'AMAT', name: 'Applied Materials Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 198.60, changePct: 2.25, marketCap: '$164 B', per: 23.5, sector: 'Wafer Fabrication Equipment', exchange: 'NASDAQ' },
  { ticker: 'LRCX', name: 'Lam Research Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 78.40, changePct: 2.40, marketCap: '$102 B', per: 25.1, sector: 'Etch & Deposition Semiconductor', exchange: 'NASDAQ' },
  { ticker: 'KLAC', name: 'KLA Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 720.50, changePct: 2.80, marketCap: '$96 B', per: 33.2, sector: 'Process Control & Metrology', exchange: 'NASDAQ' },
  { ticker: 'SMCI', name: 'Super Micro Computer Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 48.50, changePct: 6.20, marketCap: '$28 B', per: 21.0, sector: 'High-Density AI Servers', exchange: 'NASDAQ' },

  // ── UNITED STATES: ENTERPRISE SOFTWARE, CLOUD & CYBERSECURITY ──
  { ticker: 'ORCL', name: 'Oracle Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 178.50, changePct: 3.40, marketCap: '$492 B', per: 42.0, sector: 'Cloud Infrastructure & Database', exchange: 'NYSE' },
  { ticker: 'CRM', name: 'Salesforce Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 290.40, changePct: 1.40, marketCap: '$280 B', per: 48.0, sector: 'Enterprise CRM & Agentforce', exchange: 'NYSE' },
  { ticker: 'ADBE', name: 'Adobe Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 505.20, changePct: 0.95, marketCap: '$225 B', per: 41.2, sector: 'Creative Cloud & Firefly AI', exchange: 'NASDAQ' },
  { ticker: 'PLTR', name: 'Palantir Technologies', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 44.20, changePct: 6.85, marketCap: '$98 B', per: 95.0, sector: 'Enterprise AI & Defense Analytics', exchange: 'NYSE' },
  { ticker: 'NOW', name: 'ServiceNow Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 915.20, changePct: 1.85, marketCap: '$188 B', per: 72.0, sector: 'Digital Workflow Automation', exchange: 'NYSE' },
  { ticker: 'SNOW', name: 'Snowflake Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 122.50, changePct: 3.10, marketCap: '$41 B', per: -45.0, sector: 'Data Cloud & Warehousing', exchange: 'NYSE' },
  { ticker: 'PANW', name: 'Palo Alto Networks', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 368.40, changePct: 2.20, marketCap: '$120 B', per: 48.5, sector: 'Next-Gen Cybersecurity', exchange: 'NASDAQ' },
  { ticker: 'CRWD', name: 'CrowdStrike Holdings', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 312.80, changePct: 3.40, marketCap: '$76 B', per: 68.0, sector: 'Falcon Endpoint Security', exchange: 'NASDAQ' },
  { ticker: 'DDOG', name: 'Datadog Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 128.50, changePct: 2.80, marketCap: '$43 B', per: 65.0, sector: 'Cloud Monitoring & Observability', exchange: 'NASDAQ' },
  { ticker: 'NET', name: 'Cloudflare Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 92.40, changePct: 4.10, marketCap: '$31 B', per: -80.0, sector: 'Edge Cloud & CDN Security', exchange: 'NYSE' },
  { ticker: 'IBM', name: 'International Business Machines', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 232.40, changePct: 1.25, marketCap: '$214 B', per: 24.2, sector: 'Enterprise Hybrid Cloud & AI', exchange: 'NYSE' },
  { ticker: 'CSCO', name: 'Cisco Systems Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 56.80, changePct: 0.65, marketCap: '$228 B', per: 22.1, sector: 'Networking Hardware & Splunk', exchange: 'NASDAQ' },
  { ticker: 'DELL', name: 'Dell Technologies Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 128.40, changePct: 3.80, marketCap: '$91 B', per: 23.4, sector: 'AI Enterprise Servers & PCs', exchange: 'NYSE' },

  // ── UNITED STATES: CONSUMER, RETAIL, MEDIA & STREAMING ──
  { ticker: 'NFLX', name: 'Netflix Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 725.80, changePct: 1.95, marketCap: '$312 B', per: 44.8, sector: 'Streaming Entertainment Media', exchange: 'NASDAQ' },
  { ticker: 'DIS', name: 'The Walt Disney Company', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 96.50, changePct: 1.10, marketCap: '$176 B', per: 21.0, sector: 'Theme Parks & Entertainment', exchange: 'NYSE' },
  { ticker: 'WMT', name: 'Walmart Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 82.50, changePct: 0.90, marketCap: '$660 B', per: 33.2, sector: 'Consumer Retail Hypermarket', exchange: 'NYSE' },
  { ticker: 'COST', name: 'Costco Wholesale Corp', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 912.40, changePct: 0.45, marketCap: '$405 B', per: 54.0, sector: 'Warehouse Club Membership', exchange: 'NASDAQ' },
  { ticker: 'HD', name: 'The Home Depot Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 395.40, changePct: 1.15, marketCap: '$392 B', per: 26.2, sector: 'Home Improvement Retail', exchange: 'NYSE' },
  { ticker: 'MCD', name: 'McDonald\'s Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 304.20, changePct: 0.80, marketCap: '$218 B', per: 26.5, sector: 'Global Fast Food Franchise', exchange: 'NYSE' },
  { ticker: 'SBUX', name: 'Starbucks Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 97.40, changePct: 1.40, marketCap: '$110 B', per: 28.5, sector: 'Specialty Coffee Retail', exchange: 'NASDAQ' },
  { ticker: 'NKE', name: 'Nike Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 82.10, changePct: 0.60, marketCap: '$123 B', per: 24.8, sector: 'Athletic Footwear & Apparel', exchange: 'NYSE' },
  { ticker: 'KO', name: 'The Coca-Cola Company', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 68.45, changePct: 0.40, marketCap: '$294 B', per: 27.2, sector: 'Non-Alcoholic Beverages', exchange: 'NYSE' },
  { ticker: 'PEP', name: 'PepsiCo Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 172.80, changePct: 0.55, marketCap: '$237 B', per: 25.8, sector: 'Snacks & Beverages', exchange: 'NASDAQ' },
  { ticker: 'PG', name: 'Procter & Gamble Co.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 168.80, changePct: 0.35, marketCap: '$398 B', per: 26.5, sector: 'Consumer Staples & Personal Care', exchange: 'NYSE' },
  { ticker: 'UBER', name: 'Uber Technologies Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 78.40, changePct: 2.80, marketCap: '$163 B', per: 36.5, sector: 'Mobility & Delivery Platform', exchange: 'NYSE' },
  { ticker: 'ABNB', name: 'Airbnb Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 134.20, changePct: 1.60, marketCap: '$85 B', per: 32.0, sector: 'Travel Accommodation Platform', exchange: 'NASDAQ' },
  { ticker: 'SPOT', name: 'Spotify Technology SA', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 382.50, changePct: 4.20, marketCap: '$76 B', per: 62.0, sector: 'Audio Streaming & Podcasts', exchange: 'NYSE' },

  // ── UNITED STATES: FINANCIALS, WALL STREET & PAYMENTS ──
  { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 452.30, changePct: 0.35, marketCap: '$990 B', per: 21.0, sector: 'Conglomerate & Insurance', exchange: 'NYSE' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 224.50, changePct: 1.10, marketCap: '$638 B', per: 12.4, sector: 'Global Investment Banking', exchange: 'NYSE' },
  { ticker: 'V', name: 'Visa Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 284.20, changePct: 0.65, marketCap: '$578 B', per: 30.5, sector: 'Digital Payment Rails', exchange: 'NYSE' },
  { ticker: 'MA', name: 'Mastercard Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 512.60, changePct: 0.80, marketCap: '$475 B', per: 36.8, sector: 'Payment Processing Network', exchange: 'NYSE' },
  { ticker: 'BAC', name: 'Bank of America Corp', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 42.80, changePct: 0.95, marketCap: '$334 B', per: 13.8, sector: 'Commercial & Retail Banking', exchange: 'NYSE' },
  { ticker: 'WFC', name: 'Wells Fargo & Company', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 64.20, changePct: 1.25, marketCap: '$224 B', per: 12.8, sector: 'Mortgage & Consumer Lending', exchange: 'NYSE' },
  { ticker: 'GS', name: 'The Goldman Sachs Group', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 518.40, changePct: 1.80, marketCap: '$168 B', per: 15.2, sector: 'Investment Banking & Trading', exchange: 'NYSE' },
  { ticker: 'MS', name: 'Morgan Stanley', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 118.50, changePct: 1.45, marketCap: '$192 B', per: 17.5, sector: 'Wealth Management & Trading', exchange: 'NYSE' },
  { ticker: 'BLK', name: 'BlackRock Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 988.50, changePct: 1.30, marketCap: '$147 B', per: 24.5, sector: 'Asset Management & iShares', exchange: 'NYSE' },
  { ticker: 'AXP', name: 'American Express Company', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 275.20, changePct: 1.15, marketCap: '$198 B', per: 20.8, sector: 'Premium Credit & Travel Cards', exchange: 'NYSE' },
  { ticker: 'COIN', name: 'Coinbase Global Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 215.40, changePct: 7.20, marketCap: '$52 B', per: 42.5, sector: 'Crypto Exchange & Web3 Rail', exchange: 'NASDAQ' },
  { ticker: 'PYPL', name: 'PayPal Holdings Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 78.50, changePct: 2.10, marketCap: '$81 B', per: 18.5, sector: 'Digital Wallet & Venmo', exchange: 'NASDAQ' },

  // ── UNITED STATES: HEALTHCARE & BIOPHARMA ──
  { ticker: 'LLY', name: 'Eli Lilly and Company', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 924.50, changePct: 1.80, marketCap: '$878 B', per: 88.5, sector: 'Mounjaro/Zepbound GLP-1 & Biotech', exchange: 'NYSE' },
  { ticker: 'UNH', name: 'UnitedHealth Group Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 585.40, changePct: 0.75, marketCap: '$538 B', per: 28.5, sector: 'Managed Healthcare & Optum', exchange: 'NYSE' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 162.20, changePct: 0.20, marketCap: '$390 B', per: 16.8, sector: 'Pharmaceuticals & MedTech', exchange: 'NYSE' },
  { ticker: 'ABBV', name: 'AbbVie Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 188.40, changePct: 1.15, marketCap: '$332 B', per: 42.0, sector: 'Immunology & Oncology (Skyrizi)', exchange: 'NYSE' },
  { ticker: 'MRK', name: 'Merck & Co. Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 112.50, changePct: 0.65, marketCap: '$285 B', per: 16.2, sector: 'Keytruda Oncology & Vaccines', exchange: 'NYSE' },
  { ticker: 'PFE', name: 'Pfizer Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 29.40, changePct: 0.85, marketCap: '$166 B', per: 15.5, sector: 'Vaccines & Biopharmaceuticals', exchange: 'NYSE' },
  { ticker: 'TMO', name: 'Thermo Fisher Scientific', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 588.20, changePct: 1.05, marketCap: '$225 B', per: 35.2, sector: 'Life Sciences Instruments', exchange: 'NYSE' },
  { ticker: 'ISRG', name: 'Intuitive Surgical Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 495.60, changePct: 2.80, marketCap: '$176 B', per: 78.0, sector: 'da Vinci Robotic Surgery', exchange: 'NASDAQ' },

  // ── UNITED STATES: ENERGY, INDUSTRIALS & DEFENSE ──
  { ticker: 'XOM', name: 'Exxon Mobil Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 121.20, changePct: -0.75, marketCap: '$480 B', per: 14.5, sector: 'Integrated Oil & Natural Gas', exchange: 'NYSE' },
  { ticker: 'CVX', name: 'Chevron Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 152.80, changePct: -0.45, marketCap: '$280 B', per: 14.8, sector: 'Oil Exploration & Refining', exchange: 'NYSE' },
  { ticker: 'CAT', name: 'Caterpillar Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 395.20, changePct: 1.85, marketCap: '$192 B', per: 18.2, sector: 'Heavy Construction Machinery', exchange: 'NYSE' },
  { ticker: 'GE', name: 'GE Aerospace', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 188.50, changePct: 2.10, marketCap: '$204 B', per: 38.5, sector: 'Commercial & Military Jet Engines', exchange: 'NYSE' },
  { ticker: 'BA', name: 'The Boeing Company', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 154.20, changePct: -1.80, marketCap: '$94 B', per: -18.0, sector: 'Commercial Airplanes & Defense', exchange: 'NYSE' },
  { ticker: 'LMT', name: 'Lockheed Martin Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 588.40, changePct: 1.35, marketCap: '$140 B', per: 21.0, sector: 'F-35 Fighter Jets & Defense', exchange: 'NYSE' },
  { ticker: 'RTX', name: 'RTX Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 124.60, changePct: 1.40, marketCap: '$165 B', per: 32.5, sector: 'Aerospace & Patriot Defense', exchange: 'NYSE' },
  { ticker: 'DE', name: 'Deere & Company', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 410.50, changePct: 1.20, marketCap: '$114 B', per: 14.5, sector: 'Autonomous Agricultural Tech', exchange: 'NYSE' },

  // ── UNITED STATES: TOP INDEX ETFS & BENCHMARKS ──
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 578.40, changePct: 0.65, marketCap: '$580 B', per: 24.5, sector: 'Broad US Market S&P 500 ETF', exchange: 'NYSE Arca' },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust (NASDAQ-100)', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 494.20, changePct: 1.15, marketCap: '$290 B', per: 31.2, sector: 'Top 100 Tech Giants ETF', exchange: 'NASDAQ' },
  { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 531.10, changePct: 0.65, marketCap: '$490 B', per: 24.5, sector: 'Low-Cost S&P 500 ETF', exchange: 'NYSE Arca' },
  { ticker: 'SOXX', name: 'iShares Semiconductor ETF', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 232.50, changePct: 2.85, marketCap: '$15 B', per: 36.0, sector: 'Global Chipmakers ETF', exchange: 'NASDAQ' },
  { ticker: 'SMH', name: 'VanEck Semiconductor ETF', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 254.20, changePct: 3.10, marketCap: '$24 B', per: 38.2, sector: 'Concentrated AI Semiconductor ETF', exchange: 'NASDAQ' },

  // ── TAIWAN & SEMICONDUCTORS ──
  { ticker: 'TSM', name: 'Taiwan Semiconductor (TSMC)', country: 'Taiwan', countryCode: 'TW', flag: '🇹🇼', currency: 'USD', price: 198.50, changePct: 4.25, marketCap: '$1.03 T', per: 28.5, sector: 'Pure-Play Foundry Fab Leader', exchange: 'NYSE' },
  { ticker: '2454.TW', name: 'MediaTek Inc.', country: 'Taiwan', countryCode: 'TW', flag: '🇹🇼', currency: 'TWD', price: 1320.0, changePct: 2.10, marketCap: '$66 B', per: 21.0, sector: 'Mobile AP & 5G Chipsets', exchange: 'TWSE' },
  { ticker: '2317.TW', name: 'Hon Hai Precision (Foxconn)', country: 'Taiwan', countryCode: 'TW', flag: '🇹🇼', currency: 'TWD', price: 212.0, changePct: 3.40, marketCap: '$94 B', per: 15.2, sector: 'iPhone & AI Server Manufacturing', exchange: 'TWSE' },
  { ticker: '2308.TW', name: 'Delta Electronics', country: 'Taiwan', countryCode: 'TW', flag: '🇹🇼', currency: 'TWD', price: 398.0, changePct: 1.80, marketCap: '$32 B', per: 28.4, sector: 'AI Server Power & Thermal Solutions', exchange: 'TWSE' },
  { ticker: '2382.TW', name: 'Quanta Computer', country: 'Taiwan', countryCode: 'TW', flag: '🇹🇼', currency: 'TWD', price: 315.0, changePct: 4.10, marketCap: '$38 B', per: 20.5, sector: 'AI Cloud Server ODM', exchange: 'TWSE' },

  // ── CHINA & HONG KONG ──
  { ticker: '0700.HK', name: 'Tencent Holdings Ltd', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 428.60, changePct: 2.85, marketCap: '$520 B', per: 22.4, sector: 'Gaming, WeChat & FinTech', exchange: 'HKEX' },
  { ticker: '9988.HK', name: 'Alibaba Group Holding', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 98.45, changePct: 3.20, marketCap: '$235 B', per: 13.8, sector: 'Taobao, Cloud & Logistics', exchange: 'HKEX' },
  { ticker: 'BABA', name: 'Alibaba Group (US ADR)', country: 'China', countryCode: 'CN', flag: '🇨🇳', currency: 'USD', price: 101.20, changePct: 3.25, marketCap: '$238 B', per: 14.0, sector: 'E-Commerce & AliCloud', exchange: 'NYSE' },
  { ticker: '1211.HK', name: 'BYD Company Ltd', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 288.40, changePct: 4.10, marketCap: '$108 B', per: 21.2, sector: 'New Energy Vehicles & Batteries', exchange: 'HKEX' },
  { ticker: '1810.HK', name: 'Xiaomi Corporation', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 28.60, changePct: 5.40, marketCap: '$92 B', per: 26.5, sector: 'Smartphones, IoT & SU7 EV', exchange: 'HKEX' },
  { ticker: '3690.HK', name: 'Meituan', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 182.50, changePct: 1.95, marketCap: '$142 B', per: 24.1, sector: 'On-Demand Delivery Platform', exchange: 'HKEX' },
  { ticker: 'PDD', name: 'PDD Holdings (Temu / Pinduoduo)', country: 'China', countryCode: 'CN', flag: '🇨🇳', currency: 'USD', price: 124.80, changePct: -1.20, marketCap: '$172 B', per: 11.5, sector: 'Cross-Border E-Commerce', exchange: 'NASDAQ' },
  { ticker: '9866.HK', name: 'NIO Inc.', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 42.15, changePct: 6.25, marketCap: '$11 B', per: -8.5, sector: 'Premium Smart Electric Vehicles', exchange: 'HKEX' },
  { ticker: '2015.HK', name: 'Li Auto Inc.', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 108.40, changePct: 3.80, marketCap: '$28 B', per: 22.0, sector: 'Extended-Range EV SUVs', exchange: 'HKEX' },
  { ticker: '9868.HK', name: 'XPeng Inc.', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 48.20, changePct: 7.10, marketCap: '$12 B', per: -12.4, sector: 'Smart EV & Mona AI', exchange: 'HKEX' },
  { ticker: 'BIDU', name: 'Baidu Inc. (Ernie AI)', country: 'China', countryCode: 'CN', flag: '🇨🇳', currency: 'USD', price: 92.40, changePct: 1.15, marketCap: '$32 B', per: 11.8, sector: 'Search Engine & Autonomous Drive', exchange: 'NASDAQ' },
  { ticker: 'JD', name: 'JD.com Inc.', country: 'China', countryCode: 'CN', flag: '🇨🇳', currency: 'USD', price: 38.50, changePct: 2.80, marketCap: '$58 B', per: 12.2, sector: 'E-Commerce Retail & Supply Chain', exchange: 'NASDAQ' },
  { ticker: '0981.HK', name: 'SMIC (Semiconductor Mfg)', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 28.50, changePct: 8.40, marketCap: '$29 B', per: 38.5, sector: 'Domestic Semiconductor Foundry', exchange: 'HKEX' },
  { ticker: '600519.SS', name: 'Kweichow Moutai', country: 'China', countryCode: 'CN', flag: '🇨🇳', currency: 'CNY', price: 1540.0, changePct: 1.10, marketCap: '$268 B', per: 25.2, sector: 'Premium Baijiu Spirits', exchange: 'SSE' },
  { ticker: '2318.HK', name: 'Ping An Insurance', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 48.90, changePct: 2.30, marketCap: '$115 B', per: 7.8, sector: 'Integrated Financial Services', exchange: 'HKEX' },

  // ── JAPAN (Tokyo Stock Exchange) ──
  { ticker: '7203.T', name: 'Toyota Motor Corp', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 2680.0, changePct: 1.45, marketCap: '$285 B', per: 8.2, sector: 'Global Automotive Leader', exchange: 'TSE' },
  { ticker: '6758.T', name: 'Sony Group Corporation', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 2895.0, changePct: 2.10, marketCap: '$120 B', per: 16.5, sector: 'PlayStation, Music & Image Sensors', exchange: 'TSE' },
  { ticker: 'SONY', name: 'Sony Group (US ADR)', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'USD', price: 19.50, changePct: 2.15, marketCap: '$120 B', per: 16.5, sector: 'Entertainment & Electronics', exchange: 'NYSE' },
  { ticker: '8035.T', name: 'Tokyo Electron Ltd', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 24850.0, changePct: 3.40, marketCap: '$78 B', per: 24.8, sector: 'Semiconductor Fabrication Tools', exchange: 'TSE' },
  { ticker: '9984.T', name: 'SoftBank Group Corp', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 9240.0, changePct: -0.85, marketCap: '$94 B', per: 18.2, sector: 'AI Vision Fund & Arm Holdings', exchange: 'TSE' },
  { ticker: '7974.T', name: 'Nintendo Co. Ltd', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 8120.0, changePct: 1.15, marketCap: '$65 B', per: 19.4, sector: 'Switch Gaming & Global Entertainment IPs', exchange: 'TSE' },
  { ticker: '9983.T', name: 'Fast Retailing (Uniqlo)', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 49200.0, changePct: 0.95, marketCap: '$102 B', per: 38.5, sector: 'Apparel & LifeWear Retail', exchange: 'TSE' },
  { ticker: '6861.T', name: 'Keyence Corporation', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 68500.0, changePct: 0.80, marketCap: '$110 B', per: 42.0, sector: 'Industrial Automation Sensors', exchange: 'TSE' },
  { ticker: '7267.T', name: 'Honda Motor Co. Ltd', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 1485.0, changePct: 0.50, marketCap: '$48 B', per: 6.8, sector: 'Automobiles & Motorcycles', exchange: 'TSE' },
  { ticker: '8058.T', name: 'Mitsubishi Corporation', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 2980.0, changePct: 1.35, marketCap: '$82 B', per: 11.2, sector: 'Global Trading Sogo Shosha', exchange: 'TSE' },
  { ticker: '6501.T', name: 'Hitachi Ltd', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 3950.0, changePct: 2.80, marketCap: '$90 B', per: 23.5, sector: 'Social Infrastructure & Lumada AI', exchange: 'TSE' },

  // ── EUROPE & UNITED KINGDOM ──
  { ticker: 'ASML', name: 'ASML Holding NV (US ADR)', country: 'Netherlands', countryCode: 'EU', flag: '🇳🇱', currency: 'USD', price: 712.40, changePct: 2.85, marketCap: '$282 B', per: 38.5, sector: 'Monopoly EUV Lithography Equipment', exchange: 'NASDAQ' },
  { ticker: 'ASML.AS', name: 'ASML Holding NV', country: 'Netherlands', countryCode: 'EU', flag: '🇳🇱', currency: 'EUR', price: 685.20, changePct: 2.80, marketCap: '$275 B', per: 38.2, sector: 'Monopoly EUV Lithography', exchange: 'Euronext' },
  { ticker: 'MC.PA', name: 'LVMH Moët Hennessy', country: 'France', countryCode: 'EU', flag: '🇫🇷', currency: 'EUR', price: 615.40, changePct: -0.80, marketCap: '$310 B', per: 21.5, sector: 'Luxury Fashion & Champagne', exchange: 'Euronext' },
  { ticker: 'RMS.PA', name: 'Hermès International', country: 'France', countryCode: 'EU', flag: '🇫🇷', currency: 'EUR', price: 2090.0, changePct: 0.40, marketCap: '$220 B', per: 48.5, sector: 'Ultra-High Luxury Leather Goods', exchange: 'Euronext' },
  { ticker: 'OR.PA', name: 'L\'Oréal SA', country: 'France', countryCode: 'EU', flag: '🇫🇷', currency: 'EUR', price: 362.50, changePct: 0.70, marketCap: '$195 B', per: 28.0, sector: 'Beauty, Cosmetics & Skin Care', exchange: 'Euronext' },
  { ticker: 'NOVO-B.CO', name: 'Novo Nordisk A/S', country: 'Denmark', countryCode: 'EU', flag: '🇩🇰', currency: 'DKK', price: 785.00, changePct: 1.40, marketCap: '$515 B', per: 34.8, sector: 'Wegovy & Ozempic Diabetes Care', exchange: 'Nasdaq CPH' },
  { ticker: 'NVO', name: 'Novo Nordisk (US ADR)', country: 'Denmark', countryCode: 'EU', flag: '🇩🇰', currency: 'USD', price: 114.20, changePct: 1.45, marketCap: '$515 B', per: 34.8, sector: 'Wegovy & Ozempic GLP-1', exchange: 'NYSE' },
  { ticker: 'SAP', name: 'SAP SE (US ADR)', country: 'Germany', countryCode: 'EU', flag: '🇩🇪', currency: 'USD', price: 234.80, changePct: 1.90, marketCap: '$264 B', per: 42.0, sector: 'Enterprise ERP Cloud Software', exchange: 'NYSE' },
  { ticker: 'SAP.DE', name: 'SAP SE', country: 'Germany', countryCode: 'EU', flag: '🇩🇪', currency: 'EUR', price: 215.80, changePct: 1.95, marketCap: '$260 B', per: 42.1, sector: 'Enterprise ERP Cloud Software', exchange: 'Xetra' },
  { ticker: 'SHEL', name: 'Shell plc (US ADR)', country: 'United Kingdom', countryCode: 'EU', flag: '🇬🇧', currency: 'USD', price: 68.20, changePct: 0.70, marketCap: '$218 B', per: 11.2, sector: 'Global Integrated Energy & LNG', exchange: 'NYSE' },
  { ticker: 'AZN', name: 'AstraZeneca plc (US ADR)', country: 'United Kingdom', countryCode: 'EU', flag: '🇬🇧', currency: 'USD', price: 76.80, changePct: 1.25, marketCap: '$235 B', per: 32.5, sector: 'Oncology & Biopharmaceuticals', exchange: 'NASDAQ' },
  { ticker: 'RACE', name: 'Ferrari NV', country: 'Italy', countryCode: 'EU', flag: '🇮🇹', currency: 'USD', price: 462.50, changePct: 1.85, marketCap: '$84 B', per: 52.0, sector: 'Ultra-Luxury Sports Supercars', exchange: 'NYSE' },
  { ticker: 'NESN.SW', name: 'Nestlé SA', country: 'Switzerland', countryCode: 'EU', flag: '🇨🇭', currency: 'CHF', price: 84.50, changePct: 0.20, marketCap: '$255 B', per: 22.0, sector: 'Packaged Food & Nutrition', exchange: 'SIX Swiss' },
  { ticker: 'AIR.PA', name: 'Airbus SE', country: 'France / Germany', countryCode: 'EU', flag: '🇫🇷', currency: 'EUR', price: 142.60, changePct: 1.30, marketCap: '$112 B', per: 24.8, sector: 'Commercial Jet Aircraft Mfg', exchange: 'Euronext' },
  { ticker: 'TTE', name: 'TotalEnergies SE (US ADR)', country: 'France', countryCode: 'EU', flag: '🇫🇷', currency: 'USD', price: 65.40, changePct: -0.35, marketCap: '$144 B', per: 7.8, sector: 'Multi-Energy & Renewable Power', exchange: 'NYSE' },

  // ── SOUTH KOREA & SOUTHEAST ASIA ──
  { ticker: '005930.KS', name: 'Samsung Electronics', country: 'South Korea', countryCode: 'KR_SEA', flag: '🇰🇷', currency: 'KRW', price: 58900.0, changePct: 2.45, marketCap: '$270 B', per: 14.8, sector: 'DRAM, NAND, Galaxy & Foundry', exchange: 'KRX' },
  { ticker: '000660.KS', name: 'SK Hynix Inc.', country: 'South Korea', countryCode: 'KR_SEA', flag: '🇰🇷', currency: 'KRW', price: 188500.0, changePct: 4.80, marketCap: '$98 B', per: 16.2, sector: 'HBM3E High-Bandwidth Memory for AI', exchange: 'KRX' },
  { ticker: '005380.KS', name: 'Hyundai Motor Co.', country: 'South Korea', countryCode: 'KR_SEA', flag: '🇰🇷', currency: 'KRW', price: 245000.0, changePct: 1.65, marketCap: '$38 B', per: 5.4, sector: 'EV, Hybrid & Genesis Luxury', exchange: 'KRX' },
  { ticker: 'SE', name: 'Sea Limited (Shopee/Garena)', country: 'Singapore', countryCode: 'KR_SEA', flag: '🇸🇬', currency: 'USD', price: 98.40, changePct: 5.60, marketCap: '$56 B', per: 38.0, sector: 'Southeast Asia E-Commerce & Gaming', exchange: 'NYSE' },
  { ticker: 'GRAB', name: 'Grab Holdings Ltd', country: 'Singapore', countryCode: 'KR_SEA', flag: '🇸🇬', currency: 'USD', price: 4.45, changePct: 2.30, marketCap: '$17 B', per: 32.5, sector: 'Ride-Hailing & Digital Banking', exchange: 'NASDAQ' },
  { ticker: 'CPNG', name: 'Coupang Inc.', country: 'South Korea', countryCode: 'KR_SEA', flag: '🇰🇷', currency: 'USD', price: 24.80, changePct: 2.15, marketCap: '$44 B', per: 34.0, sector: 'Rocket Delivery E-Commerce', exchange: 'NYSE' },

  // ── LATIN AMERICA & MIDDLE EAST ──
  { ticker: 'MELI', name: 'MercadoLibre Inc.', country: 'Brazil / Argentina', countryCode: 'LATAM', flag: '🇧🇷', currency: 'USD', price: 2015.0, changePct: 2.80, marketCap: '$102 B', per: 62.0, sector: 'LatAm E-Commerce & Mercado Pago', exchange: 'NASDAQ' },
  { ticker: 'NU', name: 'Nu Holdings Ltd (Nubank)', country: 'Brazil', countryCode: 'LATAM', flag: '🇧🇷', currency: 'USD', price: 15.20, changePct: 3.40, marketCap: '$72 B', per: 32.5, sector: 'Digital Neobank & FinTech', exchange: 'NYSE' },
  { ticker: 'VALE', name: 'Vale S.A.', country: 'Brazil', countryCode: 'LATAM', flag: '🇧🇷', currency: 'USD', price: 10.85, changePct: -1.10, marketCap: '$46 B', per: 5.8, sector: 'Iron Ore & Nickel Mining', exchange: 'NYSE' },
  { ticker: 'PBR', name: 'Petrobras', country: 'Brazil', countryCode: 'LATAM', flag: '🇧🇷', currency: 'USD', price: 14.20, changePct: 0.90, marketCap: '$92 B', per: 4.5, sector: 'Deepwater Oil & Gas', exchange: 'NYSE' },
  { ticker: '2222.SR', name: 'Saudi Aramco', country: 'Saudi Arabia', countryCode: 'ME', flag: '🇸🇦', currency: 'SAR', price: 27.50, changePct: 0.20, marketCap: '$1.78 T', per: 14.8, sector: 'National Petroleum Enterprise', exchange: 'Tadawul' },

  // ── INDONESIA (IDX BLUE CHIPS) ──
  { ticker: 'BBCA', name: 'Bank Central Asia Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 6050, changePct: 0.83, marketCap: 'Rp 745 T', per: 22.4, sector: 'Commercial Banking (CASA 82%)', exchange: 'IDX' },
  { ticker: 'BMRI', name: 'Bank Mandiri (Persero) Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 4040, changePct: 1.00, marketCap: 'Rp 377 T', per: 11.8, sector: 'Corporate Banking & Livin', exchange: 'IDX' },
  { ticker: 'BBRI', name: 'Bank Rakyat Indonesia Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 5550, changePct: 0.45, marketCap: 'Rp 840 T', per: 12.6, sector: 'Microfinance & High Dividend', exchange: 'IDX' },
  { ticker: 'BBNI', name: 'Bank Negara Indonesia Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 3410, changePct: 0.00, marketCap: 'Rp 127 T', per: 9.4, sector: 'State-Owned Global Bank', exchange: 'IDX' },
  { ticker: 'ASII', name: 'Astra International Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 5250, changePct: 0.96, marketCap: 'Rp 212 T', per: 6.5, sector: 'Automotive & Heavy Machinery', exchange: 'IDX' },
  { ticker: 'TLKM', name: 'Telkom Indonesia Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 3730, changePct: 2.19, marketCap: 'Rp 369 T', per: 13.8, sector: 'Telco & Hyperscale Data Center', exchange: 'IDX' },
  { ticker: 'ADRO', name: 'Adaro Energy Indonesia Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 3840, changePct: 2.40, marketCap: 'Rp 122 T', per: 4.8, sector: 'Thermal Coal & Green Smelter', exchange: 'IDX' },
  { ticker: 'AMMN', name: 'Amman Mineral Internasional', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 9450, changePct: 4.01, marketCap: 'Rp 685 T', per: 38.2, sector: 'Batu Hijau Copper & Gold Mine', exchange: 'IDX' },
  { ticker: 'ICBP', name: 'Indofood CBP Sukses Makmur', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 11850, changePct: 0.85, marketCap: 'Rp 138 T', per: 15.2, sector: 'Indomie FMCG & Pinehill', exchange: 'IDX' },
  { ticker: 'UNTR', name: 'United Tractors Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 27150, changePct: 1.31, marketCap: 'Rp 101 T', per: 5.2, sector: 'Komatsu Heavy Equipment & Gold', exchange: 'IDX' },
  { ticker: 'GOTO', name: 'GoTo Gojek Tokopedia Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 96, changePct: 5.49, marketCap: 'Rp 115 T', per: -14.2, sector: 'On-Demand Services & GoPay', exchange: 'IDX' },
];

/* ─── 2. COMPLETE GLOBAL CRYPTOCURRENCY UNIVERSE (80+ TOP LIQUID COINS) ─── */
export const MASTER_GLOBAL_CRYPTO: GlobalCrypto[] = [
  // ── LAYER 1 / MAJOR CONSENSUS ──
  { rank: 1, symbol: 'BTCUSDT', name: 'Bitcoin', category: 'L1', price: 81118.00, change24h: 0.15, high24h: 82500.00, low24h: 80800.00, volume24h: '$42.4B', marketCap: '$1.60T' },
  { rank: 2, symbol: 'ETHUSDT', name: 'Ethereum', category: 'L1', price: 2450.00, change24h: 1.15, high24h: 2490.00, low24h: 2380.00, volume24h: '$18.2B', marketCap: '$294B' },
  { rank: 3, symbol: 'SOLUSDT', name: 'Solana', category: 'L1', price: 152.50, change24h: 1.25, high24h: 156.00, low24h: 148.50, volume24h: '$5.12B', marketCap: '$72B' },
  { rank: 4, symbol: 'BNBUSDT', name: 'BNB Chain', category: 'L1', price: 585.00, change24h: 0.95, high24h: 592.00, low24h: 578.00, volume24h: '$1.25B', marketCap: '$85B' },
  { rank: 5, symbol: 'XRPUSDT', name: 'Ripple XRP', category: 'L1', price: 1.42, change24h: 1.20, high24h: 1.48, low24h: 1.38, volume24h: '$4.10B', marketCap: '$80B' },
  { rank: 6, symbol: 'SUIUSDT', name: 'Sui Network', category: 'L1', price: 1.06, change24h: 1.20, high24h: 1.12, low24h: 1.02, volume24h: '$890M', marketCap: '$3.4B' },
  { rank: 7, symbol: 'AVAXUSDT', name: 'Avalanche', category: 'L1', price: 26.50, change24h: 1.80, high24h: 27.40, low24h: 25.60, volume24h: '$450M', marketCap: '$10.8B' },
  { rank: 8, symbol: 'TONUSDT', name: 'Toncoin (Telegram)', category: 'L1', price: 2.85, change24h: 1.85, high24h: 2.98, low24h: 2.75, volume24h: '$320M', marketCap: '$7.2B' },
  { rank: 9, symbol: 'NEARUSDT', name: 'NEAR Protocol', category: 'L1', price: 4.85, change24h: 1.40, high24h: 5.05, low24h: 4.65, volume24h: '$410M', marketCap: '$5.8B' },
  { rank: 10, symbol: 'ADAUSDT', name: 'Cardano', category: 'L1', price: 0.35, change24h: 0.50, high24h: 0.365, low24h: 0.342, volume24h: '$350M', marketCap: '$12.5B' },
  { rank: 11, symbol: 'APTUSDT', name: 'Aptos', category: 'L1', price: 0.7161, change24h: 1.20, high24h: 0.745, low24h: 0.701, volume24h: '$180M', marketCap: '$1.2B' },
  { rank: 12, symbol: 'DOTUSDT', name: 'Polkadot', category: 'L1', price: 1.21, change24h: 0.85, high24h: 1.26, low24h: 1.18, volume24h: '$175M', marketCap: '$1.8B' },
  { rank: 13, symbol: 'TRXUSDT', name: 'Tron', category: 'L1', price: 0.165, change24h: 0.80, high24h: 0.168, low24h: 0.162, volume24h: '$430M', marketCap: '$14.3B' },
  { rank: 14, symbol: 'KASUSDT', name: 'Kaspa (GHOSTDAG)', category: 'L1', price: 0.138, change24h: 3.90, high24h: 0.145, low24h: 0.132, volume24h: '$95M', marketCap: '$3.4B' },
  { rank: 15, symbol: 'SEIUSDT', name: 'Sei Network', category: 'L1', price: 0.428, change24h: 6.10, high24h: 0.450, low24h: 0.395, volume24h: '$190M', marketCap: '$1.5B' },
  { rank: 16, symbol: 'LTCUSDT', name: 'Litecoin', category: 'L1', price: 72.40, change24h: 1.10, high24h: 74.20, low24h: 70.80, volume24h: '$340M', marketCap: '$5.4B' },
  { rank: 17, symbol: 'BCHUSDT', name: 'Bitcoin Cash', category: 'L1', price: 345.50, change24h: 2.40, high24h: 355.00, low24h: 338.00, volume24h: '$260M', marketCap: '$6.8B' },
  { rank: 18, symbol: 'XLMUSDT', name: 'Stellar Lumens', category: 'L1', price: 0.098, change24h: 1.50, high24h: 0.102, low24h: 0.095, volume24h: '$120M', marketCap: '$2.9B' },
  { rank: 19, symbol: 'ALGOUSDT', name: 'Algorand', category: 'L1', price: 0.1133, change24h: 1.10, high24h: 0.1200, low24h: 0.1080, volume24h: '$85M', marketCap: '$980M' },
  { rank: 20, symbol: 'HBARUSDT', name: 'Hedera Hashgraph', category: 'L1', price: 0.058, change24h: 3.20, high24h: 0.061, low24h: 0.055, volume24h: '$98M', marketCap: '$2.2B' },
  { rank: 21, symbol: 'ICPUSDT', name: 'Internet Computer', category: 'L1', price: 3.00, change24h: 2.10, high24h: 3.24, low24h: 2.90, volume24h: '$110M', marketCap: '$1.4B' },
  { rank: 22, symbol: 'FTMUSDT', name: 'Fantom (Sonic)', category: 'L1', price: 0.725, change24h: 4.80, high24h: 0.760, low24h: 0.690, volume24h: '$180M', marketCap: '$2.0B' },

  // ── LAYER 2 & MODULAR ROLLUPS ──
  { rank: 23, symbol: 'ARBUSDT', name: 'Arbitrum One', category: 'L2', price: 0.1789, change24h: 0.80, high24h: 0.185, low24h: 0.172, volume24h: '$210M', marketCap: '$1.9B' },
  { rank: 24, symbol: 'OPUSDT', name: 'Optimism (OP Mainnet)', category: 'L2', price: 0.125, change24h: 1.60, high24h: 0.132, low24h: 0.118, volume24h: '$188M', marketCap: '$180M' },
  { rank: 25, symbol: 'POLUSDT', name: 'Polygon (POL/MATIC)', category: 'L2', price: 0.368, change24h: 1.80, high24h: 0.380, low24h: 0.355, volume24h: '$162M', marketCap: '$2.9B' },
  { rank: 26, symbol: 'IMXUSDT', name: 'Immutable X', category: 'L2', price: 0.193, change24h: 5.20, high24h: 0.205, low24h: 0.185, volume24h: '$75M', marketCap: '$310M' },
  { rank: 27, symbol: 'STRKUSDT', name: 'Starknet (ZK-Rollup)', category: 'L2', price: 0.070, change24h: 2.45, high24h: 0.076, low24h: 0.065, volume24h: '$65M', marketCap: '$150M' },
  { rank: 28, symbol: 'TIAUSDT', name: 'Celestia (Modular DA)', category: 'L2', price: 0.475, change24h: 2.20, high24h: 0.510, low24h: 0.450, volume24h: '$210M', marketCap: '$535M' },
  { rank: 29, symbol: 'MANTAUSDT', name: 'Manta Network', category: 'L2', price: 0.063, change24h: 2.80, high24h: 0.068, low24h: 0.058, volume24h: '$45M', marketCap: '$85M' },
  { rank: 30, symbol: 'ZKUSDT', name: 'ZKsync Era', category: 'L2', price: 0.0135, change24h: 3.10, high24h: 0.0145, low24h: 0.0125, volume24h: '$88M', marketCap: '$55M' },

  // ── DEFI & REAL WORLD ASSETS (RWA) ──
  { rank: 31, symbol: 'UNIUSDT', name: 'Uniswap Protocol', category: 'DEFI', price: 7.30, change24h: 3.40, high24h: 7.55, low24h: 7.10, volume24h: '$220M', marketCap: '$4.4B' },
  { rank: 32, symbol: 'LINKUSDT', name: 'Chainlink Oracle (CCIP)', category: 'DEFI', price: 11.50, change24h: 1.45, high24h: 11.85, low24h: 11.15, volume24h: '$290M', marketCap: '$7.1B' },
  { rank: 33, symbol: 'AAVEUSDT', name: 'Aave Lending', category: 'DEFI', price: 167.36, change24h: 2.80, high24h: 172.00, low24h: 162.50, volume24h: '$198M', marketCap: '$2.5B' },
  { rank: 34, symbol: 'MKRUSDT', name: 'MakerDAO (Sky Protocol)', category: 'DEFI', price: 1789.00, change24h: 1.90, high24h: 1840.00, low24h: 1720.00, volume24h: '$65M', marketCap: '$1.6B' },
  { rank: 35, symbol: 'ONDOUSDT', name: 'Ondo Finance (US Treasuries)', category: 'RWA', price: 0.765, change24h: 5.15, high24h: 0.810, low24h: 0.720, volume24h: '$212M', marketCap: '$1.1B' },
  { rank: 36, symbol: 'PENDLEUSDT', name: 'Pendle Yield Trading', category: 'DEFI', price: 4.35, change24h: 8.60, high24h: 4.60, low24h: 3.95, volume24h: '$135M', marketCap: '$710M' },
  { rank: 37, symbol: 'INJUSDT', name: 'Injective Protocol', category: 'DEFI', price: 7.00, change24h: 4.80, high24h: 7.35, low24h: 6.80, volume24h: '$145M', marketCap: '$690M' },
  { rank: 38, symbol: 'JUPUSDT', name: 'Jupiter Exchange (Solana)', category: 'DEFI', price: 1.05, change24h: 6.40, high24h: 1.10, low24h: 0.98, volume24h: '$180M', marketCap: '$1.4B' },
  { rank: 39, symbol: 'ENAUSDT', name: 'Ethena USDe', category: 'DEFI', price: 0.215, change24h: 2.20, high24h: 0.228, low24h: 0.202, volume24h: '$115M', marketCap: '$650M' },
  { rank: 40, symbol: 'CRVUSDT', name: 'Curve DAO Token', category: 'DEFI', price: 0.36, change24h: 3.10, high24h: 0.38, low24h: 0.34, volume24h: '$52M', marketCap: '$420M' },
  { rank: 41, symbol: 'LDOUSDT', name: 'Lido DAO (stETH)', category: 'DEFI', price: 0.44, change24h: 2.80, high24h: 0.47, low24h: 0.41, volume24h: '$95M', marketCap: '$390M' },
  { rank: 42, symbol: 'RUNEUSDT', name: 'THORChain Cross-Chain', category: 'DEFI', price: 0.71, change24h: 4.20, high24h: 0.76, low24h: 0.67, volume24h: '$140M', marketCap: '$240M' },
  { rank: 43, symbol: 'DYDXUSDT', name: 'dYdX Perpetual DEX', category: 'DEFI', price: 0.140, change24h: 1.80, high24h: 0.152, low24h: 0.130, volume24h: '$68M', marketCap: '$115M' },
  { rank: 44, symbol: 'RAYUSDT', name: 'Raydium (Solana DEX)', category: 'DEFI', price: 2.42, change24h: 9.80, high24h: 2.55, low24h: 2.30, volume24h: '$210M', marketCap: '$650M' },

  // ── AI & DEPIN (DECENTRALIZED PHYSICAL INFRASTRUCTURE) ──
  { rank: 45, symbol: 'TAOUSDT', name: 'Bittensor (Decentralized AI)', category: 'AI', price: 273.00, change24h: 1.80, high24h: 285.00, low24h: 265.00, volume24h: '$190M', marketCap: '$3.1B' },
  { rank: 46, symbol: 'RENDERUSDT', name: 'Render Network (GPU Compute)', category: 'AI', price: 1.862, change24h: 1.50, high24h: 1.92, low24h: 1.78, volume24h: '$240M', marketCap: '$2.4B' },
  { rank: 47, symbol: 'FETUSDT', name: 'Artificial Superintelligence (ASI)', category: 'AI', price: 0.2134, change24h: 1.20, high24h: 0.225, low24h: 0.198, volume24h: '$150M', marketCap: '$650M' },
  { rank: 48, symbol: 'AKTUSDT', name: 'Akash Network (Cloud GPU)', category: 'AI', price: 0.719, change24h: 2.30, high24h: 0.780, low24h: 0.680, volume24h: '$48M', marketCap: '$215M' },
  { rank: 49, symbol: 'ARUSDT', name: 'Arweave Permanent Storage', category: 'AI', price: 4.074, change24h: 1.40, high24h: 4.250, low24h: 3.900, volume24h: '$78M', marketCap: '$270M' },
  { rank: 50, symbol: 'FILUSDT', name: 'Filecoin (Decentralized Storage)', category: 'AI', price: 1.080, change24h: 1.20, high24h: 1.150, low24h: 1.020, volume24h: '$110M', marketCap: '$680M' },
  { rank: 51, symbol: 'GRTUSDT', name: 'The Graph (Indexing)', category: 'AI', price: 0.0270, change24h: 1.80, high24h: 0.0290, low24h: 0.0250, volume24h: '$82M', marketCap: '$260M' },
  { rank: 52, symbol: 'THETAUSDT', name: 'Theta Network (Video & AI)', category: 'AI', price: 0.220, change24h: 1.10, high24h: 0.240, low24h: 0.200, volume24h: '$45M', marketCap: '$220M' },

  // ── MEMECOINS & CULTURE ──
  { rank: 53, symbol: 'DOGEUSDT', name: 'Dogecoin', category: 'MEME', price: 0.154, change24h: 1.20, high24h: 0.165, low24h: 0.145, volume24h: '$1.5B', marketCap: '$22.5B' },
  { rank: 54, symbol: 'SHIBUSDT', name: 'Shiba Inu', category: 'MEME', price: 0.000018, change24h: 1.20, high24h: 0.0000188, low24h: 0.0000174, volume24h: '$310M', marketCap: '$10.6B' },
  { rank: 55, symbol: 'PEPEUSDT', name: 'Pepe', category: 'MEME', price: 0.00000395, change24h: 1.80, high24h: 0.00000410, low24h: 0.00000380, volume24h: '$780M', marketCap: '$3.8B' },
  { rank: 56, symbol: 'WIFUSDT', name: 'dogwifhat (Solana)', category: 'MEME', price: 0.2133, change24h: 2.10, high24h: 0.2350, low24h: 0.1950, volume24h: '$555M', marketCap: '$210M' },
  { rank: 57, symbol: 'BONKUSDT', name: 'Bonk (Solana)', category: 'MEME', price: 0.00000332, change24h: 2.10, high24h: 0.00000355, low24h: 0.00000315, volume24h: '$210M', marketCap: '$240M' },
  { rank: 58, symbol: 'FLOKIUSDT', name: 'Floki', category: 'MEME', price: 0.0000270, change24h: 2.20, high24h: 0.0000290, low24h: 0.0000250, volume24h: '$180M', marketCap: '$260M' },
  { rank: 59, symbol: 'POPCATUSDT', name: 'Popcat (Solana)', category: 'MEME', price: 0.0554, change24h: 3.40, high24h: 0.0600, low24h: 0.0500, volume24h: '$195M', marketCap: '$55M' },
  { rank: 60, symbol: 'MEWUSDT', name: 'cat in a dogs world', category: 'MEME', price: 0.00047, change24h: 3.20, high24h: 0.00052, low24h: 0.00043, volume24h: '$140M', marketCap: '$45M' },
  { rank: 61, symbol: 'BOMEUSDT', name: 'BOOK OF MEME', category: 'MEME', price: 0.001033, change24h: 2.20, high24h: 0.001150, low24h: 0.000950, volume24h: '$120M', marketCap: '$72M' },
  { rank: 62, symbol: 'NEIROUSDT', name: 'First Neiro on Ethereum', category: 'MEME', price: 0.000082, change24h: 4.50, high24h: 0.000090, low24h: 0.000075, volume24h: '$380M', marketCap: '$35M' },

  // ── INFRASTRUCTURE, ORACLE & GAMING ──
  { rank: 63, symbol: 'PYTHUSDT', name: 'Pyth Network (High-Freq Oracle)', category: 'INFRA', price: 0.0860, change24h: 4.20, high24h: 0.0950, low24h: 0.0780, volume24h: '$120M', marketCap: '$310M' },
  { rank: 64, symbol: 'WUSDT', name: 'Wormhole Cross-Chain', category: 'INFRA', price: 0.0175, change24h: 1.20, high24h: 0.0185, low24h: 0.0165, volume24h: '$85M', marketCap: '$750M' },
  { rank: 65, symbol: 'JTOUSDT', name: 'Jito (Solana MEV Liquid Stake)', category: 'INFRA', price: 0.5616, change24h: 2.80, high24h: 0.6200, low24h: 0.5100, volume24h: '$95M', marketCap: '$75M' },
  { rank: 66, symbol: 'STXUSDT', name: 'Stacks (Bitcoin L2/Smart Contracts)', category: 'INFRA', price: 0.378, change24h: 2.10, high24h: 0.410, low24h: 0.350, volume24h: '$110M', marketCap: '$580M' },
  { rank: 67, symbol: 'CHZUSDT', name: 'Chiliz (Sports Fan Tokens)', category: 'INFRA', price: 0.0151, change24h: 1.10, high24h: 0.0165, low24h: 0.0140, volume24h: '$65M', marketCap: '$135M' },
  { rank: 68, symbol: 'ENSUSDT', name: 'Ethereum Name Service', category: 'INFRA', price: 6.21, change24h: 5.40, high24h: 6.63, low24h: 5.41, volume24h: '$88M', marketCap: '$200M' },
  { rank: 69, symbol: 'GALAUSDT', name: 'GALA Games', category: 'INFRA', price: 0.0022, change24h: 6.20, high24h: 0.0025, low24h: 0.0021, volume24h: '$140M', marketCap: '$80M' },

  // ── AI & DEPIN (DECENTRALIZED PHYSICAL INFRASTRUCTURE) ──
  { rank: 45, symbol: 'TAOUSDT', name: 'Bittensor (Decentralized AI)', category: 'AI', price: 273.00, change24h: 1.80, high24h: 285.00, low24h: 265.00, volume24h: '$190M', marketCap: '$3.1B' },
  { rank: 46, symbol: 'RENDERUSDT', name: 'Render Network (GPU Compute)', category: 'AI', price: 1.862, change24h: 1.50, high24h: 1.92, low24h: 1.78, volume24h: '$240M', marketCap: '$2.4B' },
  { rank: 47, symbol: 'FETUSDT', name: 'Artificial Superintelligence (ASI)', category: 'AI', price: 0.2134, change24h: 1.20, high24h: 0.225, low24h: 0.198, volume24h: '$150M', marketCap: '$650M' },
  { rank: 48, symbol: 'AKTUSDT', name: 'Akash Network (Cloud GPU)', category: 'AI', price: 0.719, change24h: 2.30, high24h: 0.780, low24h: 0.680, volume24h: '$48M', marketCap: '$215M' },
  { rank: 49, symbol: 'ARUSDT', name: 'Arweave Permanent Storage', category: 'AI', price: 4.074, change24h: 1.40, high24h: 4.250, low24h: 3.900, volume24h: '$78M', marketCap: '$270M' },
  { rank: 50, symbol: 'FILUSDT', name: 'Filecoin (Decentralized Storage)', category: 'AI', price: 1.080, change24h: 1.20, high24h: 1.150, low24h: 1.020, volume24h: '$110M', marketCap: '$680M' },
  { rank: 51, symbol: 'GRTUSDT', name: 'The Graph (Indexing)', category: 'AI', price: 0.0270, change24h: 1.80, high24h: 0.0290, low24h: 0.0250, volume24h: '$82M', marketCap: '$260M' },
  { rank: 52, symbol: 'THETAUSDT', name: 'Theta Network (Video & AI)', category: 'AI', price: 0.220, change24h: 1.10, high24h: 0.240, low24h: 0.200, volume24h: '$45M', marketCap: '$220M' },

  // ── MEMECOINS & CULTURE ──
  { rank: 53, symbol: 'DOGEUSDT', name: 'Dogecoin', category: 'MEME', price: 0.154, change24h: 1.20, high24h: 0.165, low24h: 0.145, volume24h: '$1.5B', marketCap: '$22.5B' },
  { rank: 54, symbol: 'SHIBUSDT', name: 'Shiba Inu', category: 'MEME', price: 0.000018, change24h: 1.20, high24h: 0.0000188, low24h: 0.0000174, volume24h: '$310M', marketCap: '$10.6B' },
  { rank: 55, symbol: 'PEPEUSDT', name: 'Pepe', category: 'MEME', price: 0.00000395, change24h: 1.80, high24h: 0.00000410, low24h: 0.00000380, volume24h: '$780M', marketCap: '$3.8B' },
  { rank: 56, symbol: 'WIFUSDT', name: 'dogwifhat (Solana)', category: 'MEME', price: 0.2133, change24h: 2.10, high24h: 0.2350, low24h: 0.1950, volume24h: '$555M', marketCap: '$210M' },
  { rank: 57, symbol: 'BONKUSDT', name: 'Bonk (Solana)', category: 'MEME', price: 0.00000332, change24h: 2.10, high24h: 0.00000355, low24h: 0.00000315, volume24h: '$210M', marketCap: '$240M' },
  { rank: 58, symbol: 'FLOKIUSDT', name: 'Floki', category: 'MEME', price: 0.0000270, change24h: 2.20, high24h: 0.0000290, low24h: 0.0000250, volume24h: '$180M', marketCap: '$260M' },
  { rank: 59, symbol: 'POPCATUSDT', name: 'Popcat (Solana)', category: 'MEME', price: 0.0554, change24h: 3.40, high24h: 0.0600, low24h: 0.0500, volume24h: '$195M', marketCap: '$55M' },
  { rank: 60, symbol: 'MEWUSDT', name: 'cat in a dogs world', category: 'MEME', price: 0.00047, change24h: 3.20, high24h: 0.00052, low24h: 0.00043, volume24h: '$140M', marketCap: '$45M' },
  { rank: 61, symbol: 'BOMEUSDT', name: 'BOOK OF MEME', category: 'MEME', price: 0.001033, change24h: 2.20, high24h: 0.001150, low24h: 0.000950, volume24h: '$120M', marketCap: '$72M' },
  { rank: 62, symbol: 'NEIROUSDT', name: 'First Neiro on Ethereum', category: 'MEME', price: 0.000082, change24h: 4.50, high24h: 0.000090, low24h: 0.000075, volume24h: '$380M', marketCap: '$35M' },

  // ── INFRASTRUCTURE, ORACLE & GAMING ──
  { rank: 63, symbol: 'PYTHUSDT', name: 'Pyth Network (High-Freq Oracle)', category: 'INFRA', price: 0.0860, change24h: 4.20, high24h: 0.0950, low24h: 0.0780, volume24h: '$120M', marketCap: '$310M' },
  { rank: 64, symbol: 'WUSDT', name: 'Wormhole Cross-Chain', category: 'INFRA', price: 0.0175, change24h: 1.20, high24h: 0.0185, low24h: 0.0165, volume24h: '$85M', marketCap: '$750M' },
  { rank: 65, symbol: 'JTOUSDT', name: 'Jito (Solana MEV Liquid Stake)', category: 'INFRA', price: 0.5616, change24h: 2.80, high24h: 0.6200, low24h: 0.5100, volume24h: '$95M', marketCap: '$75M' },
  { rank: 66, symbol: 'STXUSDT', name: 'Stacks (Bitcoin L2/Smart Contracts)', category: 'INFRA', price: 0.378, change24h: 2.10, high24h: 0.410, low24h: 0.350, volume24h: '$110M', marketCap: '$580M' },
  { rank: 67, symbol: 'CHZUSDT', name: 'Chiliz (Sports Fan Tokens)', category: 'INFRA', price: 0.0151, change24h: 1.10, high24h: 0.0165, low24h: 0.0140, volume24h: '$65M', marketCap: '$135M' },
  { rank: 68, symbol: 'ENSUSDT', name: 'Ethereum Name Service', category: 'INFRA', price: 17.50, change24h: 5.40, high24h: 18.40, low24h: 16.20, volume24h: '$88M', marketCap: '$560M' },
  { rank: 69, symbol: 'GALAUSDT', name: 'GALA Games', category: 'INFRA', price: 0.0225, change24h: 6.20, high24h: 0.0240, low24h: 0.0210, volume24h: '$140M', marketCap: '$810M' },
  { rank: 70, symbol: 'SANDUSDT', name: 'The Sandbox (Metaverse)', category: 'INFRA', price: 0.0670, change24h: 1.80, high24h: 0.0720, low24h: 0.0620, volume24h: '$75M', marketCap: '$160M' },
  { rank: 71, symbol: 'MANAUSDT', name: 'Decentraland', category: 'INFRA', price: 0.0952, change24h: 1.90, high24h: 0.1020, low24h: 0.0880, volume24h: '$68M', marketCap: '$185M' },
  { rank: 72, symbol: 'APEUSDT', name: 'ApeCoin (Yuga Labs)', category: 'INFRA', price: 0.1450, change24h: 2.50, high24h: 0.1600, low24h: 0.1350, volume24h: '$130M', marketCap: '$110M' },
];

/* ─── 3. COMPLETE WORLD ECONOMY DATASET (22 NEGARA LINTAS 4 REGION) ─── */
export const MASTER_COUNTRY_ECONOMY: CountryEconomy[] = [
  { country: 'United States', countryCode: 'US', flag: '🇺🇸', region: 'AMERICAS', centralBank: 'Federal Reserve (Fed)', interestRate: 4.75, rateChange: '-50 bps', gdpNominal: '$28.78 T', gdpGrowth: 2.8, inflationCpi: 2.4, unemployment: 4.1, debtToGdp: 122.3, status: 'EXPANSION' },
  { country: 'China', countryCode: 'CN', flag: '🇨🇳', region: 'ASIA-PACIFIC', centralBank: 'Peoples Bank of China (PBOC)', interestRate: 3.10, rateChange: '-25 bps', gdpNominal: '$18.53 T', gdpGrowth: 4.8, inflationCpi: 0.4, unemployment: 5.1, debtToGdp: 83.6, status: 'EXPANSION' },
  { country: 'Germany', countryCode: 'DE', flag: '🇩🇪', region: 'EUROPE', centralBank: 'European Central Bank (ECB)', interestRate: 3.25, rateChange: '-25 bps', gdpNominal: '$4.59 T', gdpGrowth: 0.2, inflationCpi: 1.8, unemployment: 6.0, debtToGdp: 63.6, status: 'STABLE' },
  { country: 'Japan', countryCode: 'JP', flag: '🇯🇵', region: 'ASIA-PACIFIC', centralBank: 'Bank of Japan (BOJ)', interestRate: 0.25, rateChange: '+15 bps', gdpNominal: '$4.11 T', gdpGrowth: 0.9, inflationCpi: 2.5, unemployment: 2.5, debtToGdp: 261.3, status: 'RESTRICTIVE' },
  { country: 'India', countryCode: 'IN', flag: '🇮🇳', region: 'ASIA-PACIFIC', centralBank: 'Reserve Bank of India (RBI)', interestRate: 6.50, rateChange: '0 bps', gdpNominal: '$3.94 T', gdpGrowth: 7.0, inflationCpi: 5.49, unemployment: 7.8, debtToGdp: 82.5, status: 'EXPANSION' },
  { country: 'United Kingdom', countryCode: 'UK', flag: '🇬🇧', region: 'EUROPE', centralBank: 'Bank of England (BOE)', interestRate: 4.75, rateChange: '-25 bps', gdpNominal: '$3.50 T', gdpGrowth: 1.0, inflationCpi: 2.3, unemployment: 4.3, debtToGdp: 98.4, status: 'STABLE' },
  { country: 'France', countryCode: 'FR', flag: '🇫🇷', region: 'EUROPE', centralBank: 'European Central Bank (ECB)', interestRate: 3.25, rateChange: '-25 bps', gdpNominal: '$3.13 T', gdpGrowth: 1.1, inflationCpi: 1.5, unemployment: 7.4, debtToGdp: 110.8, status: 'STABLE' },
  { country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', region: 'ASIA-PACIFIC', centralBank: 'Bank Indonesia (BI)', interestRate: 6.00, rateChange: '-25 bps', gdpNominal: '$1.42 T', gdpGrowth: 5.05, inflationCpi: 1.71, unemployment: 4.82, debtToGdp: 39.4, status: 'EXPANSION' },
  { country: 'Canada', countryCode: 'CA', flag: '🇨🇦', region: 'AMERICAS', centralBank: 'Bank of Canada (BOC)', interestRate: 3.75, rateChange: '-50 bps', gdpNominal: '$2.24 T', gdpGrowth: 1.3, inflationCpi: 2.0, unemployment: 6.5, debtToGdp: 104.7, status: 'EXPANSION' },
  { country: 'South Korea', countryCode: 'KR', flag: '🇰🇷', region: 'ASIA-PACIFIC', centralBank: 'Bank of Korea (BOK)', interestRate: 3.25, rateChange: '-25 bps', gdpNominal: '$1.76 T', gdpGrowth: 2.4, inflationCpi: 1.3, unemployment: 2.7, debtToGdp: 53.8, status: 'STABLE' },
  { country: 'Brazil', countryCode: 'BR', flag: '🇧🇷', region: 'AMERICAS', centralBank: 'Banco Central do Brasil', interestRate: 11.25, rateChange: '+50 bps', gdpNominal: '$2.33 T', gdpGrowth: 3.0, inflationCpi: 4.42, unemployment: 6.6, debtToGdp: 78.6, status: 'RESTRICTIVE' },
  { country: 'Australia', countryCode: 'AU', flag: '🇦🇺', region: 'ASIA-PACIFIC', centralBank: 'Reserve Bank of Australia (RBA)', interestRate: 4.35, rateChange: '0 bps', gdpNominal: '$1.79 T', gdpGrowth: 1.0, inflationCpi: 2.8, unemployment: 4.1, debtToGdp: 49.3, status: 'RESTRICTIVE' },
  { country: 'Saudi Arabia', countryCode: 'SA', flag: '🇸🇦', region: 'MIDDLE EAST & AFRICA', centralBank: 'Saudi Central Bank (SAMA)', interestRate: 5.00, rateChange: '-50 bps', gdpNominal: '$1.11 T', gdpGrowth: 2.8, inflationCpi: 1.7, unemployment: 7.1, debtToGdp: 26.2, status: 'EXPANSION' },
  { country: 'Singapore', countryCode: 'SG', flag: '🇸🇬', region: 'ASIA-PACIFIC', centralBank: 'Monetary Authority of Singapore (MAS)', interestRate: 3.45, rateChange: 'Neutral S$NEER', gdpNominal: '$525 B', gdpGrowth: 4.1, inflationCpi: 2.0, unemployment: 1.8, debtToGdp: 167.8, status: 'EXPANSION' },
  { country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭', region: 'EUROPE', centralBank: 'Swiss National Bank (SNB)', interestRate: 1.00, rateChange: '-25 bps', gdpNominal: '$938 B', gdpGrowth: 1.2, inflationCpi: 0.6, unemployment: 2.6, debtToGdp: 38.2, status: 'STABLE' },
  { country: 'Taiwan', countryCode: 'TW', flag: '🇹🇼', region: 'ASIA-PACIFIC', centralBank: 'Central Bank of the ROC', interestRate: 2.00, rateChange: '0 bps', gdpNominal: '$802 B', gdpGrowth: 3.9, inflationCpi: 1.8, unemployment: 3.4, debtToGdp: 27.2, status: 'EXPANSION' },
  { country: 'Netherlands', countryCode: 'NL', flag: '🇳🇱', region: 'EUROPE', centralBank: 'European Central Bank (ECB)', interestRate: 3.25, rateChange: '-25 bps', gdpNominal: '$1.12 T', gdpGrowth: 1.0, inflationCpi: 3.5, unemployment: 3.7, debtToGdp: 46.5, status: 'STABLE' },
  { country: 'Italy', countryCode: 'IT', flag: '🇮🇹', region: 'EUROPE', centralBank: 'European Central Bank (ECB)', interestRate: 3.25, rateChange: '-25 bps', gdpNominal: '$2.33 T', gdpGrowth: 0.8, inflationCpi: 0.7, unemployment: 6.2, debtToGdp: 137.3, status: 'STABLE' },
  { country: 'Mexico', countryCode: 'MX', flag: '🇲🇽', region: 'AMERICAS', centralBank: 'Banco de México (Banxico)', interestRate: 10.25, rateChange: '-25 bps', gdpNominal: '$1.81 T', gdpGrowth: 1.5, inflationCpi: 4.58, unemployment: 2.7, debtToGdp: 49.8, status: 'RESTRICTIVE' },
  { country: 'United Arab Emirates', countryCode: 'AE', flag: '🇦🇪', region: 'MIDDLE EAST & AFRICA', centralBank: 'Central Bank of the UAE', interestRate: 4.65, rateChange: '-50 bps', gdpNominal: '$507 B', gdpGrowth: 3.9, inflationCpi: 1.9, unemployment: 2.8, debtToGdp: 30.0, status: 'EXPANSION' },
  { country: 'South Africa', countryCode: 'ZA', flag: '🇿🇦', region: 'MIDDLE EAST & AFRICA', centralBank: 'South African Reserve Bank (SARB)', interestRate: 8.00, rateChange: '-25 bps', gdpNominal: '$400 B', gdpGrowth: 1.1, inflationCpi: 3.8, unemployment: 33.5, debtToGdp: 74.0, status: 'RESTRICTIVE' },
  { country: 'Malaysia', countryCode: 'MY', flag: '🇲🇾', region: 'ASIA-PACIFIC', centralBank: 'Bank Negara Malaysia (BNM)', interestRate: 3.00, rateChange: '0 bps', gdpNominal: '$445 B', gdpGrowth: 5.3, inflationCpi: 1.9, unemployment: 3.2, debtToGdp: 64.3, status: 'EXPANSION' },
];
