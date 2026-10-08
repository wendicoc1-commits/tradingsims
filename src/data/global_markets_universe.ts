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
  category: 'L1' | 'L2' | 'DEFI' | 'AI' | 'MEME' | 'RWA';
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

/* ─── 1. COMPLETE GLOBAL FOREIGN STOCKS (100+ EMITEN DUNIA) ─── */
export const MASTER_GLOBAL_STOCKS: GlobalStock[] = [
  // ── UNITED STATES (Wall Street / S&P 500 / NASDAQ) ──
  { ticker: 'NVDA', name: 'NVIDIA Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 141.54, changePct: 3.12, marketCap: '$3.47 T', per: 62.4, sector: 'Semiconductors & AI', exchange: 'NASDAQ' },
  { ticker: 'AAPL', name: 'Apple Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 232.15, changePct: 0.85, marketCap: '$3.52 T', per: 34.2, sector: 'Consumer Electronics', exchange: 'NASDAQ' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 428.50, changePct: 1.15, marketCap: '$3.18 T', per: 35.8, sector: 'Cloud Software & AI', exchange: 'NASDAQ' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 187.80, changePct: 1.62, marketCap: '$1.98 T', per: 42.1, sector: 'E-Commerce & AWS Cloud', exchange: 'NASDAQ' },
  { ticker: 'GOOGL', name: 'Alphabet Inc. (Google)', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 168.20, changePct: -0.45, marketCap: '$2.09 T', per: 24.5, sector: 'Search & Cloud Services', exchange: 'NASDAQ' },
  { ticker: 'META', name: 'Meta Platforms (Facebook)', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 589.40, changePct: 2.40, marketCap: '$1.49 T', per: 28.2, sector: 'Social Media & Metaverse', exchange: 'NASDAQ' },
  { ticker: 'TSLA', name: 'Tesla Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 218.80, changePct: 3.85, marketCap: '$698 B', per: 68.5, sector: 'Electric Vehicles & Robotics', exchange: 'NASDAQ' },
  { ticker: 'AVGO', name: 'Broadcom Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 182.40, changePct: 2.15, marketCap: '$845 B', per: 45.2, sector: 'Custom AI Chips & Networking', exchange: 'NASDAQ' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 452.30, changePct: 0.35, marketCap: '$990 B', per: 21.0, sector: 'Conglomerate & Insurance', exchange: 'NYSE' },
  { ticker: 'LLY', name: 'Eli Lilly and Company', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 924.50, changePct: 1.80, marketCap: '$878 B', per: 88.5, sector: 'Healthcare & GLP-1', exchange: 'NYSE' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 224.50, changePct: 1.10, marketCap: '$638 B', per: 12.4, sector: 'Global Investment Banking', exchange: 'NYSE' },
  { ticker: 'V', name: 'Visa Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 284.20, changePct: 0.65, marketCap: '$578 B', per: 30.5, sector: 'Digital Payments', exchange: 'NYSE' },
  { ticker: 'WMT', name: 'Walmart Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 82.50, changePct: 0.90, marketCap: '$660 B', per: 33.2, sector: 'Consumer Retail Hypermarket', exchange: 'NYSE' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 156.40, changePct: 2.80, marketCap: '$252 B', per: 54.2, sector: 'CPUs & GPUs', exchange: 'NASDAQ' },
  { ticker: 'NFLX', name: 'Netflix Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 725.80, changePct: 1.95, marketCap: '$312 B', per: 44.8, sector: 'Streaming Entertainment', exchange: 'NASDAQ' },
  { ticker: 'ORCL', name: 'Oracle Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 178.50, changePct: 3.40, marketCap: '$492 B', per: 42.0, sector: 'Cloud Infrastructure & Database', exchange: 'NYSE' },
    { ticker: 'COST', name: 'Costco Wholesale Corp', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 912.40, changePct: 0.45, marketCap: '$405 B', per: 54.0, sector: 'Warehouse Club Retail', exchange: 'NASDAQ' },
  { ticker: 'XOM', name: 'Exxon Mobil Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 121.20, changePct: -0.75, marketCap: '$480 B', per: 14.5, sector: 'Oil & Natural Gas', exchange: 'NYSE' },
  { ticker: 'PLTR', name: 'Palantir Technologies', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 44.20, changePct: 6.85, marketCap: '$98 B', per: 95.0, sector: 'Enterprise AI & Big Data', exchange: 'NYSE' },
  { ticker: 'COIN', name: 'Coinbase Global Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 215.40, changePct: 7.20, marketCap: '$52 B', per: 42.5, sector: 'Crypto Exchange & Web3', exchange: 'NASDAQ' },
  { ticker: 'QCOM', name: 'Qualcomm Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 172.50, changePct: 1.85, marketCap: '$192 B', per: 18.4, sector: 'Snapdragon 5G & Mobile AI', exchange: 'NASDAQ' },
  { ticker: 'CRM', name: 'Salesforce Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 290.40, changePct: 1.40, marketCap: '$280 B', per: 48.0, sector: 'Enterprise CRM Cloud', exchange: 'NYSE' },
  { ticker: 'ADBE', name: 'Adobe Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 505.20, changePct: 0.95, marketCap: '$225 B', per: 41.2, sector: 'Creative Cloud & Firefly AI', exchange: 'NASDAQ' },
  { ticker: 'INTC', name: 'Intel Corporation', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 23.40, changePct: -1.25, marketCap: '$100 B', per: 32.0, sector: 'x86 Processors & IFS Foundry', exchange: 'NASDAQ' },
  { ticker: 'MA', name: 'Mastercard Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 512.60, changePct: 0.80, marketCap: '$475 B', per: 36.8, sector: 'Global Payment Rails', exchange: 'NYSE' },
  { ticker: 'PG', name: 'Procter & Gamble Co.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 168.80, changePct: 0.35, marketCap: '$398 B', per: 26.5, sector: 'Consumer Staples & Personal Care', exchange: 'NYSE' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 162.20, changePct: 0.20, marketCap: '$390 B', per: 16.8, sector: 'Pharmaceuticals & MedTech', exchange: 'NYSE' },
  { ticker: 'HD', name: 'The Home Depot Inc.', country: 'United States', countryCode: 'US', flag: '🇺🇸', currency: 'USD', price: 395.40, changePct: 1.15, marketCap: '$392 B', per: 26.2, sector: 'Home Improvement Retail', exchange: 'NYSE' },

  // ── TAIWAN & SEMICONDUCTORS ──
  { ticker: 'TSM', name: 'Taiwan Semiconductor (TSMC)', country: 'Taiwan', countryCode: 'TW', flag: '🇹🇼', currency: 'USD', price: 198.50, changePct: 4.25, marketCap: '$1.03 T', per: 28.5, sector: 'Pure-Play Foundry Fab', exchange: 'NYSE / TWSE' },
  { ticker: '2454.TW', name: 'MediaTek Inc.', country: 'Taiwan', countryCode: 'TW', flag: '🇹🇼', currency: 'TWD', price: 1320.0, changePct: 2.10, marketCap: '$66 B', per: 21.0, sector: 'Mobile AP & 5G Chipsets', exchange: 'TWSE' },
  { ticker: '2317.TW', name: 'Hon Hai (Foxconn)', country: 'Taiwan', countryCode: 'TW', flag: '🇹🇼', currency: 'TWD', price: 212.0, changePct: 3.40, marketCap: '$94 B', per: 15.2, sector: 'Electronics & AI Server Mfg', exchange: 'TWSE' },
  { ticker: '2308.TW', name: 'Delta Electronics', country: 'Taiwan', countryCode: 'TW', flag: '🇹🇼', currency: 'TWD', price: 398.0, changePct: 1.80, marketCap: '$32 B', per: 28.4, sector: 'Power Supplies & AI Server Thermal', exchange: 'TWSE' },
  { ticker: '2382.TW', name: 'Quanta Computer', country: 'Taiwan', countryCode: 'TW', flag: '🇹🇼', currency: 'TWD', price: 315.0, changePct: 4.10, marketCap: '$38 B', per: 20.5, sector: 'AI Cloud Server ODM', exchange: 'TWSE' },

  // ── CHINA & HONG KONG ──
  { ticker: '0700.HK', name: 'Tencent Holdings Ltd', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 428.60, changePct: 2.85, marketCap: '$520 B', per: 22.4, sector: 'Gaming, WeChat & FinTech', exchange: 'HKEX' },
  { ticker: '9988.HK', name: 'Alibaba Group Holding', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 98.45, changePct: 3.20, marketCap: '$235 B', per: 13.8, sector: 'Taobao, Cloud & Logistics', exchange: 'HKEX' },
  { ticker: '1211.HK', name: 'BYD Company Ltd', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 288.40, changePct: 4.10, marketCap: '$108 B', per: 21.2, sector: 'New Energy Vehicles & Batteries', exchange: 'HKEX' },
  { ticker: '1810.HK', name: 'Xiaomi Corporation', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 28.60, changePct: 5.40, marketCap: '$92 B', per: 26.5, sector: 'Smartphones, IoT & SU7 EV', exchange: 'HKEX' },
  { ticker: '3690.HK', name: 'Meituan', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 182.50, changePct: 1.95, marketCap: '$142 B', per: 24.1, sector: 'On-Demand Delivery Platform', exchange: 'HKEX' },
  { ticker: 'PDD', name: 'PDD Holdings (Temu / Pinduoduo)', country: 'China', countryCode: 'CN', flag: '🇨🇳', currency: 'USD', price: 124.80, changePct: -1.20, marketCap: '$172 B', per: 11.5, sector: 'Cross-Border E-Commerce', exchange: 'NASDAQ' },
  { ticker: '9866.HK', name: 'NIO Inc.', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 42.15, changePct: 6.25, marketCap: '$11 B', per: -8.5, sector: 'Premium Smart Electric Vehicles', exchange: 'HKEX' },
  { ticker: '2015.HK', name: 'Li Auto Inc.', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 108.40, changePct: 3.80, marketCap: '$28 B', per: 22.0, sector: 'Extended-Range EV SUVs', exchange: 'HKEX' },
  { ticker: '9868.HK', name: 'XPeng Inc.', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 48.20, changePct: 7.10, marketCap: '$12 B', per: -12.4, sector: 'Smart EV & Mona AI', exchange: 'HKEX' },
  { ticker: 'BIDU', name: 'Baidu Inc. (Ernie AI)', country: 'China', countryCode: 'CN', flag: '🇨🇳', currency: 'USD', price: 92.40, changePct: 1.15, marketCap: '$32 B', per: 11.8, sector: 'Search Engine & Autonomous Drive', exchange: 'NASDAQ' },
  { ticker: '0981.HK', name: 'SMIC (Semiconductor Mfg)', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 28.50, changePct: 8.40, marketCap: '$29 B', per: 38.5, sector: 'Domestic Semiconductor Foundry', exchange: 'HKEX' },
  { ticker: '600519.SS', name: 'Kweichow Moutai', country: 'China', countryCode: 'CN', flag: '🇨🇳', currency: 'CNY', price: 1540.0, changePct: 1.10, marketCap: '$268 B', per: 25.2, sector: 'Premium Baijiu Spirits', exchange: 'SSE' },
  { ticker: '2318.HK', name: 'Ping An Insurance', country: 'China / HK', countryCode: 'CN', flag: '🇨🇳', currency: 'HKD', price: 48.90, changePct: 2.30, marketCap: '$115 B', per: 7.8, sector: 'Integrated Financial Services', exchange: 'HKEX' },

  // ── JAPAN (Tokyo Stock Exchange) ──
  { ticker: '7203.T', name: 'Toyota Motor Corp', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 2680.0, changePct: 1.45, marketCap: '$285 B', per: 8.2, sector: 'Global Automotive Leader', exchange: 'TSE' },
  { ticker: '6758.T', name: 'Sony Group Corporation', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 2895.0, changePct: 2.10, marketCap: '$120 B', per: 16.5, sector: 'PlayStation, Music & Sensors', exchange: 'TSE' },
  { ticker: '8035.T', name: 'Tokyo Electron Ltd', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 24850.0, changePct: 3.40, marketCap: '$78 B', per: 24.8, sector: 'Semiconductor Fabrication Tools', exchange: 'TSE' },
  { ticker: '9984.T', name: 'SoftBank Group Corp', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 9240.0, changePct: -0.85, marketCap: '$94 B', per: 18.2, sector: 'AI Vision Fund & Arm Holdings', exchange: 'TSE' },
  { ticker: '7974.T', name: 'Nintendo Co. Ltd', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 8120.0, changePct: 1.15, marketCap: '$65 B', per: 19.4, sector: 'Switch Gaming & Global IPs', exchange: 'TSE' },
  { ticker: '9983.T', name: 'Fast Retailing (Uniqlo)', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 49200.0, changePct: 0.95, marketCap: '$102 B', per: 38.5, sector: 'Apparel & LifeWear Retail', exchange: 'TSE' },
  { ticker: '6861.T', name: 'Keyence Corporation', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 68500.0, changePct: 0.80, marketCap: '$110 B', per: 42.0, sector: 'Industrial Automation Sensors', exchange: 'TSE' },
  { ticker: '7267.T', name: 'Honda Motor Co. Ltd', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 1485.0, changePct: 0.50, marketCap: '$48 B', per: 6.8, sector: 'Automobiles & Motorcycles', exchange: 'TSE' },
  { ticker: '8058.T', name: 'Mitsubishi Corporation', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 2980.0, changePct: 1.35, marketCap: '$82 B', per: 11.2, sector: 'Global Trading Sogo Shosha', exchange: 'TSE' },
  { ticker: '6501.T', name: 'Hitachi Ltd', country: 'Japan', countryCode: 'JP', flag: '🇯🇵', currency: 'JPY', price: 3950.0, changePct: 2.80, marketCap: '$90 B', per: 23.5, sector: 'Social Infrastructure & Lumada AI', exchange: 'TSE' },

  // ── EUROPE & UNITED KINGDOM ──
  { ticker: 'ASML.AS', name: 'ASML Holding NV', country: 'Netherlands', countryCode: 'EU', flag: '🇳🇱', currency: 'EUR', price: 685.20, changePct: 2.80, marketCap: '$275 B', per: 38.2, sector: 'Monopoly EUV Lithography', exchange: 'Euronext' },
  { ticker: 'MC.PA', name: 'LVMH Moët Hennessy', country: 'France', countryCode: 'EU', flag: '🇫🇷', currency: 'EUR', price: 615.40, changePct: -0.80, marketCap: '$310 B', per: 21.5, sector: 'Luxury Fashion & Champagne', exchange: 'Euronext' },
  { ticker: 'RMS.PA', name: 'Hermès International', country: 'France', countryCode: 'EU', flag: '🇫🇷', currency: 'EUR', price: 2090.0, changePct: 0.40, marketCap: '$220 B', per: 48.5, sector: 'Ultra-High Luxury Leather Goods', exchange: 'Euronext' },
  { ticker: 'OR.PA', name: 'L\'Oréal SA', country: 'France', countryCode: 'EU', flag: '🇫🇷', currency: 'EUR', price: 362.50, changePct: 0.70, marketCap: '$195 B', per: 28.0, sector: 'Beauty, Cosmetics & Skin Care', exchange: 'Euronext' },
  { ticker: 'NOVO-B.CO', name: 'Novo Nordisk A/S', country: 'Denmark', countryCode: 'EU', flag: '🇩🇰', currency: 'DKK', price: 785.00, changePct: 1.40, marketCap: '$515 B', per: 34.8, sector: 'Wegovy & Ozempic Diabetes', exchange: 'Nasdaq CPH' },
  { ticker: 'SAP.DE', name: 'SAP SE', country: 'Germany', countryCode: 'EU', flag: '🇩🇪', currency: 'EUR', price: 215.80, changePct: 1.95, marketCap: '$260 B', per: 42.1, sector: 'Enterprise ERP Cloud Software', exchange: 'Xetra' },
  { ticker: 'SHEL.L', name: 'Shell plc', country: 'United Kingdom', countryCode: 'EU', flag: '🇬🇧', currency: 'GBP', price: 2650.0, changePct: 0.65, marketCap: '$218 B', per: 11.2, sector: 'Global Integrated Energy & LNG', exchange: 'LSE' },
  { ticker: 'AZN.L', name: 'AstraZeneca plc', country: 'United Kingdom', countryCode: 'EU', flag: '🇬🇧', currency: 'GBP', price: 11840.0, changePct: 1.20, marketCap: '$232 B', per: 32.4, sector: 'Oncology & Biopharmaceuticals', exchange: 'LSE' },
  { ticker: 'RACE.MI', name: 'Ferrari NV', country: 'Italy', countryCode: 'EU', flag: '🇮🇹', currency: 'EUR', price: 425.0, changePct: 1.85, marketCap: '$78 B', per: 52.0, sector: 'Ultra-Luxury Sports Supercars', exchange: 'Borsa Italiana' },
  { ticker: 'NESN.SW', name: 'Nestlé SA', country: 'Switzerland', countryCode: 'EU', flag: '🇨🇭', currency: 'CHF', price: 84.50, changePct: 0.20, marketCap: '$255 B', per: 22.0, sector: 'Packaged Food & Beverages', exchange: 'SIX Swiss' },
  { ticker: 'SIE.DE', name: 'Siemens AG', country: 'Germany', countryCode: 'EU', flag: '🇩🇪', currency: 'EUR', price: 182.20, changePct: 1.10, marketCap: '$148 B', per: 16.5, sector: 'Industrial Automation & Energy', exchange: 'Xetra' },
  { ticker: 'AIR.PA', name: 'Airbus SE', country: 'France / Germany', countryCode: 'EU', flag: '🇫🇷', currency: 'EUR', price: 142.60, changePct: 1.30, marketCap: '$112 B', per: 24.8, sector: 'Commercial Jet Aircraft Mfg', exchange: 'Euronext' },
  { ticker: 'TTE.PA', name: 'TotalEnergies SE', country: 'France', countryCode: 'EU', flag: '🇫🇷', currency: 'EUR', price: 61.20, changePct: -0.40, marketCap: '$144 B', per: 7.8, sector: 'Multi-Energy & Renewable Power', exchange: 'Euronext' },

  // ── INDIA (BSE / NSE) ──
  { ticker: 'RELIANCE.NS', name: 'Reliance Industries', country: 'India', countryCode: 'IN', flag: '🇮🇳', currency: 'INR', price: 2740.0, changePct: 1.80, marketCap: '$225 B', per: 24.5, sector: 'Refining, Jio Telecom & Retail', exchange: 'NSE' },
  { ticker: 'TCS.NS', name: 'Tata Consultancy Services', country: 'India', countryCode: 'IN', flag: '🇮🇳', currency: 'INR', price: 4120.0, changePct: 0.90, marketCap: '$178 B', per: 29.8, sector: 'Global IT Outsourcing', exchange: 'NSE' },
  { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', country: 'India', countryCode: 'IN', flag: '🇮🇳', currency: 'INR', price: 1750.0, changePct: 1.15, marketCap: '$158 B', per: 18.2, sector: 'Private Banking & Retail Lending', exchange: 'NSE' },
  { ticker: 'INFY.NS', name: 'Infosys Limited', country: 'India', countryCode: 'IN', flag: '🇮🇳', currency: 'INR', price: 1920.0, changePct: 2.10, marketCap: '$95 B', per: 26.4, sector: 'IT Services & Generative AI', exchange: 'NSE' },
  { ticker: 'TATAMOTORS.NS', name: 'Tata Motors Limited', country: 'India', countryCode: 'IN', flag: '🇮🇳', currency: 'INR', price: 920.0, changePct: 3.25, marketCap: '$41 B', per: 10.5, sector: 'Commercial Vehicles & Jaguar LR', exchange: 'NSE' },
  { ticker: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', country: 'India', countryCode: 'IN', flag: '🇮🇳', currency: 'INR', price: 1680.0, changePct: 1.40, marketCap: '$118 B', per: 48.0, sector: 'Telecommunication & 5G', exchange: 'NSE' },
  { ticker: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', country: 'India', countryCode: 'IN', flag: '🇮🇳', currency: 'INR', price: 1265.0, changePct: 1.25, marketCap: '$106 B', per: 17.5, sector: 'Corporate & Retail Banking', exchange: 'NSE' },

  // ── SOUTH KOREA & SOUTHEAST ASIA ──
  { ticker: '005930.KS', name: 'Samsung Electronics', country: 'South Korea', countryCode: 'KR_SEA', flag: '🇰🇷', currency: 'KRW', price: 58900.0, changePct: 2.45, marketCap: '$270 B', per: 14.8, sector: 'DRAM, NAND, Galaxy & Foundry', exchange: 'KRX' },
  { ticker: '000660.KS', name: 'SK Hynix Inc.', country: 'South Korea', countryCode: 'KR_SEA', flag: '🇰🇷', currency: 'KRW', price: 188500.0, changePct: 4.80, marketCap: '$98 B', per: 16.2, sector: 'HBM3E Memory for NVIDIA', exchange: 'KRX' },
  { ticker: '005380.KS', name: 'Hyundai Motor Co.', country: 'South Korea', countryCode: 'KR_SEA', flag: '🇰🇷', currency: 'KRW', price: 245000.0, changePct: 1.65, marketCap: '$38 B', per: 5.4, sector: 'EV, Hybrid & Genesis Luxury', exchange: 'KRX' },
  { ticker: '373220.KS', name: 'LG Energy Solution', country: 'South Korea', countryCode: 'KR_SEA', flag: '🇰🇷', currency: 'KRW', price: 388000.0, changePct: 3.10, marketCap: '$66 B', per: 68.0, sector: 'Lithium-ion EV Batteries', exchange: 'KRX' },
  { ticker: '035420.KS', name: 'NAVER Corporation', country: 'South Korea', countryCode: 'KR_SEA', flag: '🇰🇷', currency: 'KRW', price: 178000.0, changePct: 1.70, marketCap: '$21 B', per: 19.5, sector: 'Search, Webtoon & Clova AI', exchange: 'KRX' },
  { ticker: 'SE', name: 'Sea Limited (Shopee/Garena)', country: 'Singapore', countryCode: 'KR_SEA', flag: '🇸🇬', currency: 'USD', price: 98.40, changePct: 5.60, marketCap: '$56 B', per: 38.0, sector: 'Southeast Asia E-Commerce', exchange: 'NYSE' },
  { ticker: 'GRAB', name: 'Grab Holdings Ltd', country: 'Singapore', countryCode: 'KR_SEA', flag: '🇸🇬', currency: 'USD', price: 4.45, changePct: 2.30, marketCap: '$17 B', per: 32.5, sector: 'Ride-Hailing & Digital Bank', exchange: 'NASDAQ' },
  { ticker: 'D05.SI', name: 'DBS Group Holdings', country: 'Singapore', countryCode: 'KR_SEA', flag: '🇸🇬', currency: 'SGD', price: 39.20, changePct: 0.85, marketCap: '$82 B', per: 10.8, sector: 'Leading SEA Bank & Wealth', exchange: 'SGX' },

  // ── LATIN AMERICA & MIDDLE EAST ──
  { ticker: 'MELI', name: 'MercadoLibre Inc.', country: 'Brazil / Argentina', countryCode: 'LATAM', flag: '🇧🇷', currency: 'USD', price: 2015.0, changePct: 2.80, marketCap: '$102 B', per: 62.0, sector: 'LatAm E-Commerce & Mercado Pago', exchange: 'NASDAQ' },
  { ticker: 'NU', name: 'Nu Holdings Ltd (Nubank)', country: 'Brazil', countryCode: 'LATAM', flag: '🇧🇷', currency: 'USD', price: 15.20, changePct: 3.40, marketCap: '$72 B', per: 32.5, sector: 'Digital Neobank & FinTech', exchange: 'NYSE' },
  { ticker: 'VALE', name: 'Vale S.A.', country: 'Brazil', countryCode: 'LATAM', flag: '🇧🇷', currency: 'USD', price: 10.85, changePct: -1.10, marketCap: '$46 B', per: 5.8, sector: 'Iron Ore & Nickel Mining', exchange: 'NYSE' },
  { ticker: 'PBR', name: 'Petrobras', country: 'Brazil', countryCode: 'LATAM', flag: '🇧🇷', currency: 'USD', price: 14.20, changePct: 0.90, marketCap: '$92 B', per: 4.5, sector: 'Deepwater Oil & Gas', exchange: 'NYSE' },
  { ticker: '2222.SR', name: 'Saudi Aramco', country: 'Saudi Arabia', countryCode: 'ME', flag: '🇸🇦', currency: 'SAR', price: 27.50, changePct: 0.20, marketCap: '$1.78 T', per: 14.8, sector: 'National Petroleum Enterprise', exchange: 'Tadawul' },

  // ── INDONESIA (IDX BLUE CHIPS) ──
  { ticker: 'BBCA', name: 'Bank Central Asia Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 10525, changePct: 1.20, marketCap: 'Rp 1.297 T', per: 22.4, sector: 'Commercial Banking (CASA 82%)', exchange: 'IDX' },
  { ticker: 'BMRI', name: 'Bank Mandiri (Persero) Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 7050, changePct: 1.44, marketCap: 'Rp 658 T', per: 11.8, sector: 'Corporate Banking & Livin', exchange: 'IDX' },
  { ticker: 'BBRI', name: 'Bank Rakyat Indonesia Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 4980, changePct: 1.43, marketCap: 'Rp 754 T', per: 12.6, sector: 'Microfinance & High Dividend', exchange: 'IDX' },
  { ticker: 'ADRO', name: 'Adaro Energy Indonesia Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 3840, changePct: 2.40, marketCap: 'Rp 122 T', per: 4.8, sector: 'Thermal Coal & Green Smelter', exchange: 'IDX' },
  { ticker: 'ASII', name: 'Astra International Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 5150, changePct: 0.98, marketCap: 'Rp 208 T', per: 6.5, sector: 'Automotive & Heavy Machinery', exchange: 'IDX' },
  { ticker: 'TLKM', name: 'Telkom Indonesia Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 3080, changePct: -0.65, marketCap: 'Rp 305 T', per: 13.8, sector: 'Telco & Hyperscale Data Center', exchange: 'IDX' },
  { ticker: 'AMMN', name: 'Amman Mineral Internasional', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 9450, changePct: 3.85, marketCap: 'Rp 685 T', per: 38.2, sector: 'Batu Hijau Copper & Gold Mine', exchange: 'IDX' },
  { ticker: 'BBNI', name: 'Bank Negara Indonesia Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 5475, changePct: 0.92, marketCap: 'Rp 204 T', per: 9.4, sector: 'State-Owned Global Bank', exchange: 'IDX' },
  { ticker: 'ICBP', name: 'Indofood CBP Sukses Makmur', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 12150, changePct: 1.25, marketCap: 'Rp 141 T', per: 15.2, sector: 'Indomie FMCG & Pinehill', exchange: 'IDX' },
  { ticker: 'UNTR', name: 'United Tractors Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 27200, changePct: 1.50, marketCap: 'Rp 101 T', per: 5.2, sector: 'Komatsu Heavy Equipment & Gold', exchange: 'IDX' },
  { ticker: 'GOTO', name: 'GoTo Gojek Tokopedia Tbk', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', currency: 'IDR', price: 72, changePct: 2.85, marketCap: 'Rp 86 T', per: -14.2, sector: 'On-Demand Services & GoPay', exchange: 'IDX' },
];

/* ─── 2. COMPLETE GLOBAL CRYPTOCURRENCY UNIVERSE (50+ COINS LINTAS 6 KATEGORI) ─── */
export const MASTER_GLOBAL_CRYPTO: GlobalCrypto[] = [
  // ── LAYER 1 / MAJORS ──
  { rank: 1, symbol: 'BTCUSDT', name: 'Bitcoin', category: 'L1', price: 67420.50, change24h: 2.84, high24h: 68150.00, low24h: 65200.00, volume24h: '$28.4B', marketCap: '$1.33T' },
  { rank: 2, symbol: 'ETHUSDT', name: 'Ethereum', category: 'L1', price: 2485.20, change24h: 2.83, high24h: 2520.00, low24h: 2410.00, volume24h: '$15.8B', marketCap: '$298B' },
  { rank: 3, symbol: 'SOLUSDT', name: 'Solana', category: 'L1', price: 158.40, change24h: 5.18, high24h: 162.00, low24h: 148.50, volume24h: '$4.12B', marketCap: '$74B' },
  { rank: 4, symbol: 'BNBUSDT', name: 'BNB (Binance)', category: 'L1', price: 582.10, change24h: 2.18, high24h: 589.00, low24h: 568.00, volume24h: '$1.08B', marketCap: '$84B' },
  { rank: 5, symbol: 'XRPUSDT', name: 'Ripple XRP', category: 'L1', price: 0.5340, change24h: -1.48, high24h: 0.5520, low24h: 0.5310, volume24h: '$1.45B', marketCap: '$30B' },
  { rank: 6, symbol: 'SUIUSDT', name: 'Sui Network', category: 'L1', price: 1.14, change24h: 3.42, high24h: 1.19, low24h: 1.11, volume24h: '$820M', marketCap: '$5.6B' },
  { rank: 7, symbol: 'AVAXUSDT', name: 'Avalanche', category: 'L1', price: 28.15, change24h: 5.43, high24h: 29.20, low24h: 26.50, volume24h: '$410M', marketCap: '$11.4B' },
  { rank: 8, symbol: 'TONUSDT', name: 'Toncoin (Telegram)', category: 'L1', price: 5.24, change24h: 1.85, high24h: 5.38, low24h: 5.12, volume24h: '$295M', marketCap: '$13.2B' },
  { rank: 9, symbol: 'NEARUSDT', name: 'NEAR Protocol', category: 'L1', price: 4.88, change24h: 4.25, high24h: 5.02, low24h: 4.65, volume24h: '$480M', marketCap: '$5.9B' },
  { rank: 10, symbol: 'ADAUSDT', name: 'Cardano', category: 'L1', price: 0.3620, change24h: 2.55, high24h: 0.3700, low24h: 0.3490, volume24h: '$385M', marketCap: '$12.9B' },
  { rank: 11, symbol: 'APTUSDT', name: 'Aptos', category: 'L1', price: 9.85, change24h: 6.40, high24h: 10.20, low24h: 9.15, volume24h: '$340M', marketCap: '$4.9B' },
  { rank: 12, symbol: 'DOTUSDT', name: 'Polkadot', category: 'L1', price: 4.25, change24h: 1.80, high24h: 4.38, low24h: 4.12, volume24h: '$165M', marketCap: '$6.1B' },
  { rank: 13, symbol: 'TRXUSDT', name: 'Tron', category: 'L1', price: 0.162, change24h: 0.85, high24h: 0.165, low24h: 0.159, volume24h: '$420M', marketCap: '$14.1B' },
  { rank: 14, symbol: 'KASUSDT', name: 'Kaspa (PoW)', category: 'L1', price: 0.138, change24h: 3.90, high24h: 0.144, low24h: 0.131, volume24h: '$88M', marketCap: '$3.4B' },
  { rank: 15, symbol: 'SEIUSDT', name: 'Sei Network', category: 'L1', price: 0.428, change24h: 6.10, high24h: 0.450, low24h: 0.395, volume24h: '$190M', marketCap: '$1.5B' },

  // ── LAYER 2 & MODULAR ROLLUPS ──
  { rank: 16, symbol: 'ARBUSDT', name: 'Arbitrum One', category: 'L2', price: 0.542, change24h: 3.10, high24h: 0.565, low24h: 0.520, volume24h: '$174M', marketCap: '$1.9B' },
  { rank: 17, symbol: 'OPUSDT', name: 'Optimism', category: 'L2', price: 1.625, change24h: 4.60, high24h: 1.71, low24h: 1.54, volume24h: '$188M', marketCap: '$2.0B' },
  { rank: 18, symbol: 'POLUSDT', name: 'Polygon (POL)', category: 'L2', price: 0.368, change24h: 1.80, high24h: 0.380, low24h: 0.355, volume24h: '$162M', marketCap: '$2.9B' },
  { rank: 19, symbol: 'IMXUSDT', name: 'Immutable X', category: 'L2', price: 1.485, change24h: 5.20, high24h: 1.55, low24h: 1.39, volume24h: '$75M', marketCap: '$2.4B' },
  { rank: 20, symbol: 'STRKUSDT', name: 'Starknet', category: 'L2', price: 0.395, change24h: 2.45, high24h: 0.415, low24h: 0.380, volume24h: '$65M', marketCap: '$820M' },
  { rank: 21, symbol: 'TIAUSDT', name: 'Celestia (Modular DA)', category: 'L2', price: 5.85, change24h: 7.20, high24h: 6.20, low24h: 5.35, volume24h: '$210M', marketCap: '$1.3B' },
  { rank: 22, symbol: 'MANTAUSDT', name: 'Manta Network', category: 'L2', price: 0.725, change24h: 3.80, high24h: 0.760, low24h: 0.690, volume24h: '$45M', marketCap: '$275M' },

  // ── DEFI & REAL WORLD ASSETS (RWA) ──
  { rank: 23, symbol: 'UNIUSDT', name: 'Uniswap Protocol', category: 'DEFI', price: 7.85, change24h: 3.40, high24h: 8.10, low24h: 7.50, volume24h: '$220M', marketCap: '$4.7B' },
  { rank: 24, symbol: 'LINKUSDT', name: 'Chainlink Oracle (CCIP)', category: 'DEFI', price: 11.45, change24h: 2.95, high24h: 11.80, low24h: 11.10, volume24h: '$350M', marketCap: '$7.1B' },
  { rank: 25, symbol: 'AAVEUSDT', name: 'Aave Lending', category: 'DEFI', price: 154.20, change24h: 6.80, high24h: 159.00, low24h: 142.50, volume24h: '$198M', marketCap: '$2.3B' },
  { rank: 26, symbol: 'MKRUSDT', name: 'MakerDAO (Sky)', category: 'DEFI', price: 1220.00, change24h: 1.90, high24h: 1260.00, low24h: 1190.00, volume24h: '$65M', marketCap: '$1.1B' },
  { rank: 27, symbol: 'ONDOUSDT', name: 'Ondo Finance (US Treasuries)', category: 'RWA', price: 0.765, change24h: 5.15, high24h: 0.81, low24h: 0.72, volume24h: '$212M', marketCap: '$1.1B' },
  { rank: 28, symbol: 'PENDLEUSDT', name: 'Pendle Yield Trading', category: 'DEFI', price: 4.35, change24h: 8.60, high24h: 4.60, low24h: 3.95, volume24h: '$135M', marketCap: '$710M' },
  { rank: 29, symbol: 'INJUSDT', name: 'Injective Protocol', category: 'DEFI', price: 21.40, change24h: 4.80, high24h: 22.50, low24h: 20.10, volume24h: '$145M', marketCap: '$2.1B' },
  { rank: 30, symbol: 'JUPUSDT', name: 'Jupiter Exchange (Solana)', category: 'DEFI', price: 1.05, change24h: 6.40, high24h: 1.10, low24h: 0.98, volume24h: '$180M', marketCap: '$1.4B' },
  { rank: 31, symbol: 'ENAUSDT', name: 'Ethena USDe', category: 'DEFI', price: 0.385, change24h: 5.20, high24h: 0.410, low24h: 0.360, volume24h: '$115M', marketCap: '$1.0B' },

  // ── AI & DEPIN (DECENTRALIZED PHYSICAL INFRASTRUCTURE) ──
  { rank: 32, symbol: 'TAOUSDT', name: 'Bittensor (Decentralized AI)', category: 'AI', price: 585.00, change24h: 7.85, high24h: 610.00, low24h: 540.00, volume24h: '$365M', marketCap: '$4.3B' },
  { rank: 33, symbol: 'RENDERUSDT', name: 'Render Network (GPU Compute)', category: 'AI', price: 5.42, change24h: 4.90, high24h: 5.65, low24h: 5.15, volume24h: '$292M', marketCap: '$2.8B' },
  { rank: 34, symbol: 'FETUSDT', name: 'Artificial Superintelligence (ASI)', category: 'AI', price: 1.385, change24h: 5.20, high24h: 1.45, low24h: 1.30, volume24h: '$240M', marketCap: '$3.5B' },
  { rank: 35, symbol: 'ICPUSDT', name: 'Internet Computer', category: 'AI', price: 8.45, change24h: 2.10, high24h: 8.75, low24h: 8.15, volume24h: '$110M', marketCap: '$3.9B' },
  { rank: 36, symbol: 'AKTUSDT', name: 'Akash Network (Cloud GPU)', category: 'AI', price: 2.95, change24h: 6.30, high24h: 3.15, low24h: 2.72, volume24h: '$48M', marketCap: '$720M' },
  { rank: 37, symbol: 'ARUSDT', name: 'Arweave Permanent Storage', category: 'AI', price: 18.20, change24h: 3.40, high24h: 19.10, low24h: 17.50, volume24h: '$78M', marketCap: '$1.2B' },

  // ── MEMECOINS & CULTURE ──
  { rank: 38, symbol: 'DOGEUSDT', name: 'Dogecoin', category: 'MEME', price: 0.1142, change24h: 4.77, high24h: 0.1180, low24h: 0.1080, volume24h: '$1.28B', marketCap: '$16.7B' },
  { rank: 39, symbol: 'SHIBUSDT', name: 'Shiba Inu', category: 'MEME', price: 0.0000185, change24h: 3.20, high24h: 0.0000192, low24h: 0.0000178, volume24h: '$490M', marketCap: '$10.9B' },
  { rank: 40, symbol: 'PEPEUSDT', name: 'Pepe', category: 'MEME', price: 0.0000098, change24h: 6.40, high24h: 0.0000104, low24h: 0.0000091, volume24h: '$940M', marketCap: '$4.1B' },
  { rank: 41, symbol: 'WIFUSDT', name: 'dogwifhat (Solana)', category: 'MEME', price: 2.65, change24h: 8.90, high24h: 2.82, low24h: 2.38, volume24h: '$555M', marketCap: '$2.6B' },
  { rank: 42, symbol: 'BONKUSDT', name: 'Bonk (Solana)', category: 'MEME', price: 0.0000215, change24h: 4.10, high24h: 0.0000228, low24h: 0.0000201, volume24h: '$210M', marketCap: '$1.5B' },
  { rank: 43, symbol: 'FLOKIUSDT', name: 'Floki', category: 'MEME', price: 0.000148, change24h: 3.80, high24h: 0.000155, low24h: 0.000141, volume24h: '$180M', marketCap: '$1.4B' },
  { rank: 44, symbol: 'POPCATUSDT', name: 'Popcat (Solana)', category: 'MEME', price: 1.42, change24h: 9.40, high24h: 1.55, low24h: 1.28, volume24h: '$195M', marketCap: '$1.4B' },
  { rank: 45, symbol: 'MEWUSDT', name: 'cat in a dogs world', category: 'MEME', price: 0.0094, change24h: 11.20, high24h: 0.0102, low24h: 0.0082, volume24h: '$140M', marketCap: '$830M' },
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
