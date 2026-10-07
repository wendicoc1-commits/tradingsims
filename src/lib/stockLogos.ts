/**
 * Global Stock Logo Registry & Multi-Tier Transparent Logo Resolver
 * Provides transparent, high-definition company logos for US, European, Asian, and IDX stocks.
 * Zero background / completely transparent PNG & SVG vector assets optimized for dark terminal UI.
 */

export interface StockBrandMeta {
  ticker: string;
  name: string;
  domain: string;
  simpleIconSlug?: string;
  color?: string; // Optional custom color for simpleicons (e.g. ffffff for dark mode)
}

export const GLOBAL_STOCK_BRANDS: Record<string, StockBrandMeta> = {
  // ── Big Tech & Semiconductors ─────────────────────────────────────────────
  NVDA: { ticker: 'NVDA', name: 'NVIDIA Corporation', domain: 'nvidia.com', simpleIconSlug: 'nvidia' },
  AAPL: { ticker: 'AAPL', name: 'Apple Inc.', domain: 'apple.com', simpleIconSlug: 'apple', color: 'ffffff' },
  MSFT: { ticker: 'MSFT', name: 'Microsoft Corporation', domain: 'microsoft.com', simpleIconSlug: 'microsoft' },
  TSLA: { ticker: 'TSLA', name: 'Tesla Inc.', domain: 'tesla.com', simpleIconSlug: 'tesla', color: 'e82127' },
  GOOGL: { ticker: 'GOOGL', name: 'Alphabet Inc.', domain: 'google.com', simpleIconSlug: 'google' },
  GOOG: { ticker: 'GOOG', name: 'Alphabet Inc.', domain: 'google.com', simpleIconSlug: 'google' },
  AMZN: { ticker: 'AMZN', name: 'Amazon.com Inc.', domain: 'amazon.com', simpleIconSlug: 'amazon', color: 'ff9900' },
  META: { ticker: 'META', name: 'Meta Platforms Inc.', domain: 'meta.com', simpleIconSlug: 'meta' },
  AVGO: { ticker: 'AVGO', name: 'Broadcom Inc.', domain: 'broadcom.com', simpleIconSlug: 'broadcom' },
  CSCO: { ticker: 'CSCO', name: 'Cisco Systems Inc.', domain: 'cisco.com', simpleIconSlug: 'cisco' },
  QCOM: { ticker: 'QCOM', name: 'Qualcomm Inc.', domain: 'qualcomm.com', simpleIconSlug: 'qualcomm' },
  TXN: { ticker: 'TXN', name: 'Texas Instruments', domain: 'ti.com', simpleIconSlug: 'texasinstruments' },
  INTC: { ticker: 'INTC', name: 'Intel Corporation', domain: 'intel.com', simpleIconSlug: 'intel' },
  IBM: { ticker: 'IBM', name: 'IBM Corporation', domain: 'ibm.com', simpleIconSlug: 'ibm' },
  AMD: { ticker: 'AMD', name: 'Advanced Micro Devices', domain: 'amd.com', simpleIconSlug: 'amd' },
  TSM: { ticker: 'TSM', name: 'Taiwan Semiconductor', domain: 'tsmc.com', simpleIconSlug: 'tsmc' },
  ASML: { ticker: 'ASML', name: 'ASML Holding', domain: 'asml.com', simpleIconSlug: 'asml' },
  SAP: { ticker: 'SAP', name: 'SAP SE', domain: 'sap.com', simpleIconSlug: 'sap' },
  ORCL: { ticker: 'ORCL', name: 'Oracle Corporation', domain: 'oracle.com', simpleIconSlug: 'oracle' },
  CRM: { ticker: 'CRM', name: 'Salesforce Inc.', domain: 'salesforce.com', simpleIconSlug: 'salesforce' },
  ADBE: { ticker: 'ADBE', name: 'Adobe Inc.', domain: 'adobe.com', simpleIconSlug: 'adobe' },
  PLTR: { ticker: 'PLTR', name: 'Palantir Technologies', domain: 'palantir.com', simpleIconSlug: 'palantir', color: 'ffffff' },
  COIN: { ticker: 'COIN', name: 'Coinbase Global', domain: 'coinbase.com', simpleIconSlug: 'coinbase' },

  // ── US Dividend Kings & Aristocrats ──────────────────────────────────────
  KO: { ticker: 'KO', name: 'The Coca-Cola Company', domain: 'coca-colacompany.com', simpleIconSlug: 'cocacola' },
  PG: { ticker: 'PG', name: 'Procter & Gamble', domain: 'pg.com', simpleIconSlug: 'proctergamble' },
  JNJ: { ticker: 'JNJ', name: 'Johnson & Johnson', domain: 'jnj.com', simpleIconSlug: 'johnsonandjohnson' },
  MMM: { ticker: 'MMM', name: '3M Company', domain: '3m.com', simpleIconSlug: '3m', color: 'ff0000' },
  LOW: { ticker: 'LOW', name: "Lowe's Companies", domain: 'lowes.com', simpleIconSlug: 'lowes' },
  GPC: { ticker: 'GPC', name: 'Genuine Parts Company', domain: 'genpt.com' },
  CL: { ticker: 'CL', name: 'Colgate-Palmolive', domain: 'colgatepalmolive.com', simpleIconSlug: 'colgate' },
  EMR: { ticker: 'EMR', name: 'Emerson Electric', domain: 'emerson.com', simpleIconSlug: 'emerson' },
  ABT: { ticker: 'ABT', name: 'Abbott Laboratories', domain: 'abbott.com', simpleIconSlug: 'abbott' },
  ABBV: { ticker: 'ABBV', name: 'AbbVie Inc.', domain: 'abbvie.com', simpleIconSlug: 'abbvie' },
  PEP: { ticker: 'PEP', name: 'PepsiCo Inc.', domain: 'pepsico.com', simpleIconSlug: 'pepsi' },
  WMT: { ticker: 'WMT', name: 'Walmart Inc.', domain: 'walmart.com', simpleIconSlug: 'walmart' },
  COST: { ticker: 'COST', name: 'Costco Wholesale', domain: 'costco.com', simpleIconSlug: 'costco' },
  MCD: { ticker: 'MCD', name: "McDonald's Corp", domain: 'mcdonalds.com', simpleIconSlug: 'mcdonalds' },
  SBUX: { ticker: 'SBUX', name: 'Starbucks Corp', domain: 'starbucks.com', simpleIconSlug: 'starbucks' },
  CAT: { ticker: 'CAT', name: 'Caterpillar Inc.', domain: 'caterpillar.com', simpleIconSlug: 'caterpillar' },
  DE: { ticker: 'DE', name: 'Deere & Company', domain: 'deere.com', simpleIconSlug: 'johndeere' },
  CVX: { ticker: 'CVX', name: 'Chevron Corporation', domain: 'chevron.com', simpleIconSlug: 'chevron' },
  XOM: { ticker: 'XOM', name: 'Exxon Mobil', domain: 'exxonmobil.com', simpleIconSlug: 'exxonmobil' },
  TGT: { ticker: 'TGT', name: 'Target Corporation', domain: 'target.com', simpleIconSlug: 'target', color: 'cc0000' },
  ADP: { ticker: 'ADP', name: 'Automatic Data Processing', domain: 'adp.com', simpleIconSlug: 'adp' },
  ITW: { ticker: 'ITW', name: 'Illinois Tool Works', domain: 'itw.com' },
  SYY: { ticker: 'SYY', name: 'Sysco Corporation', domain: 'sysco.com' },

  // ── Monthly Dividend Payers & High Yield REITs ────────────────────────────
  O: { ticker: 'O', name: 'Realty Income Corp', domain: 'realtyincome.com' },
  MAIN: { ticker: 'MAIN', name: 'Main Street Capital', domain: 'mainstcapital.com' },
  STAG: { ticker: 'STAG', name: 'STAG Industrial', domain: 'stagindustrial.com' },
  VICI: { ticker: 'VICI', name: 'VICI Properties', domain: 'viciproperties.com' },
  AGNC: { ticker: 'AGNC', name: 'AGNC Investment Corp', domain: 'agnc.com' },
  ARCC: { ticker: 'ARCC', name: 'Ares Capital Corp', domain: 'arescapitalcorp.com' },
  SPG: { ticker: 'SPG', name: 'Simon Property Group', domain: 'simon.com' },
  PSA: { ticker: 'PSA', name: 'Public Storage', domain: 'publicstorage.com' },
  EQIX: { ticker: 'EQIX', name: 'Equinix Inc.', domain: 'equinix.com', simpleIconSlug: 'equinix', color: 'ed1c24' },
  DLR: { ticker: 'DLR', name: 'Digital Realty Trust', domain: 'digitalrealty.com' },
  AMT: { ticker: 'AMT', name: 'American Tower Corp', domain: 'americantower.com' },
  PLD: { ticker: 'PLD', name: 'Prologis Inc.', domain: 'prologis.com' },

  // ── US High Yield Telecom, Energy & Tobacco ───────────────────────────────
  T: { ticker: 'T', name: 'AT&T Inc.', domain: 'att.com', simpleIconSlug: 'att' },
  VZ: { ticker: 'VZ', name: 'Verizon Communications', domain: 'verizon.com', simpleIconSlug: 'verizon' },
  MO: { ticker: 'MO', name: 'Altria Group', domain: 'altria.com', simpleIconSlug: 'altria' },
  PM: { ticker: 'PM', name: 'Philip Morris International', domain: 'pmi.com' },
  BTI: { ticker: 'BTI', name: 'British American Tobacco', domain: 'bat.com' },
  UNH: { ticker: 'UNH', name: 'UnitedHealth Group', domain: 'unitedhealthgroup.com' },
  HD: { ticker: 'HD', name: 'The Home Depot', domain: 'homedepot.com', simpleIconSlug: 'homedepot', color: 'f96302' },
  BMY: { ticker: 'BMY', name: 'Bristol Myers Squibb', domain: 'bms.com', simpleIconSlug: 'bristolmyerssquibb' },
  PFE: { ticker: 'PFE', name: 'Pfizer Inc.', domain: 'pfizer.com', simpleIconSlug: 'pfizer' },
  LMT: { ticker: 'LMT', name: 'Lockheed Martin', domain: 'lockheedmartin.com', simpleIconSlug: 'lockheedmartin' },
  RTX: { ticker: 'RTX', name: 'RTX Corporation', domain: 'rtx.com', simpleIconSlug: 'raytheon' },
  NEE: { ticker: 'NEE', name: 'NextEra Energy', domain: 'nexteraenergy.com' },
  DUK: { ticker: 'DUK', name: 'Duke Energy', domain: 'duke-energy.com' },
  SO: { ticker: 'SO', name: 'The Southern Company', domain: 'southerncompany.com' },

  // ── Financials & Banks ───────────────────────────────────────────────────
  JPM: { ticker: 'JPM', name: 'JPMorgan Chase & Co.', domain: 'jpmorganchase.com', simpleIconSlug: 'jpmorgan' },
  BAC: { ticker: 'BAC', name: 'Bank of America', domain: 'bankofamerica.com', simpleIconSlug: 'bankofamerica' },
  V: { ticker: 'V', name: 'Visa Inc.', domain: 'visa.com', simpleIconSlug: 'visa' },
  MA: { ticker: 'MA', name: 'Mastercard Inc.', domain: 'mastercard.com', simpleIconSlug: 'mastercard' },
  BLK: { ticker: 'BLK', name: 'BlackRock Inc.', domain: 'blackrock.com' },

  // ── Europe & United Kingdom ──────────────────────────────────────────────
  'SHEL.L': { ticker: 'SHEL.L', name: 'Shell plc', domain: 'shell.com', simpleIconSlug: 'shell' },
  SHEL: { ticker: 'SHEL', name: 'Shell plc', domain: 'shell.com', simpleIconSlug: 'shell' },
  'BP.L': { ticker: 'BP.L', name: 'BP plc', domain: 'bp.com', simpleIconSlug: 'bp' },
  BP: { ticker: 'BP', name: 'BP plc', domain: 'bp.com', simpleIconSlug: 'bp' },
  'RIO.L': { ticker: 'RIO.L', name: 'Rio Tinto', domain: 'riotinto.com', simpleIconSlug: 'riotinto' },
  RIO: { ticker: 'RIO', name: 'Rio Tinto', domain: 'riotinto.com', simpleIconSlug: 'riotinto' },
  'HSBA.L': { ticker: 'HSBA.L', name: 'HSBC Holdings', domain: 'hsbc.com', simpleIconSlug: 'hsbc' },
  HSBC: { ticker: 'HSBC', name: 'HSBC Holdings', domain: 'hsbc.com', simpleIconSlug: 'hsbc' },
  'BATS.L': { ticker: 'BATS.L', name: 'British American Tobacco', domain: 'bat.com' },
  'GSK.L': { ticker: 'GSK.L', name: 'GSK plc', domain: 'gsk.com', simpleIconSlug: 'gsk' },
  GSK: { ticker: 'GSK', name: 'GSK plc', domain: 'gsk.com', simpleIconSlug: 'gsk' },
  UL: { ticker: 'UL', name: 'Unilever PLC', domain: 'unilever.com', simpleIconSlug: 'unilever' },
  AZN: { ticker: 'AZN', name: 'AstraZeneca plc', domain: 'astrazeneca.com', simpleIconSlug: 'astrazeneca' },
  'NESN.SW': { ticker: 'NESN.SW', name: 'Nestlé SA', domain: 'nestle.com', simpleIconSlug: 'nestle' },
  NESN: { ticker: 'NESN', name: 'Nestlé SA', domain: 'nestle.com', simpleIconSlug: 'nestle' },
  'NOVN.SW': { ticker: 'NOVN.SW', name: 'Novartis AG', domain: 'novartis.com', simpleIconSlug: 'novartis' },
  NOVN: { ticker: 'NOVN', name: 'Novartis AG', domain: 'novartis.com', simpleIconSlug: 'novartis' },
  'ROG.SW': { ticker: 'ROG.SW', name: 'Roche Holding AG', domain: 'roche.com', simpleIconSlug: 'roche' },
  ROG: { ticker: 'ROG', name: 'Roche Holding AG', domain: 'roche.com', simpleIconSlug: 'roche' },
  'UBSG.SW': { ticker: 'UBSG.SW', name: 'UBS Group AG', domain: 'ubs.com', simpleIconSlug: 'ubs' },
  'MC.PA': { ticker: 'MC.PA', name: 'LVMH Moët Hennessy', domain: 'lvmh.com', simpleIconSlug: 'lvmh', color: 'ffffff' },
  MC: { ticker: 'MC', name: 'LVMH Moët Hennessy', domain: 'lvmh.com', simpleIconSlug: 'lvmh', color: 'ffffff' },
  'OR.PA': { ticker: 'OR.PA', name: "L'Oréal SA", domain: 'loreal.com', simpleIconSlug: 'loreal', color: 'ffffff' },
  'SAN.PA': { ticker: 'SAN.PA', name: 'Sanofi SA', domain: 'sanofi.com', simpleIconSlug: 'sanofi' },
  'AIR.PA': { ticker: 'AIR.PA', name: 'Airbus SE', domain: 'airbus.com', simpleIconSlug: 'airbus' },
  AIR: { ticker: 'AIR', name: 'Airbus SE', domain: 'airbus.com', simpleIconSlug: 'airbus' },
  'TTE.PA': { ticker: 'TTE.PA', name: 'TotalEnergies SE', domain: 'totalenergies.com', simpleIconSlug: 'totalenergies' },
  TTE: { ticker: 'TTE', name: 'TotalEnergies SE', domain: 'totalenergies.com', simpleIconSlug: 'totalenergies' },
  'SIE.DE': { ticker: 'SIE.DE', name: 'Siemens AG', domain: 'siemens.com', simpleIconSlug: 'siemens' },
  SIE: { ticker: 'SIE', name: 'Siemens AG', domain: 'siemens.com', simpleIconSlug: 'siemens' },
  'ALV.DE': { ticker: 'ALV.DE', name: 'Allianz SE', domain: 'allianz.com', simpleIconSlug: 'allianz' },
  ALV: { ticker: 'ALV', name: 'Allianz SE', domain: 'allianz.com', simpleIconSlug: 'allianz' },
  'BMW.DE': { ticker: 'BMW.DE', name: 'Bayerische Motoren Werke', domain: 'bmwgroup.com', simpleIconSlug: 'bmw' },
  BMW: { ticker: 'BMW', name: 'Bayerische Motoren Werke', domain: 'bmwgroup.com', simpleIconSlug: 'bmw' },
  'MBG.DE': { ticker: 'MBG.DE', name: 'Mercedes-Benz Group', domain: 'mercedes-benz.com', simpleIconSlug: 'mercedes', color: 'ffffff' },
  'BAS.DE': { ticker: 'BAS.DE', name: 'BASF SE', domain: 'basf.com', simpleIconSlug: 'basf' },
  'BAYN.DE': { ticker: 'BAYN.DE', name: 'Bayer AG', domain: 'bayer.com', simpleIconSlug: 'bayer' },

  // ── Japan & South Korea ──────────────────────────────────────────────────
  '7203.T': { ticker: '7203.T', name: 'Toyota Motor Corp', domain: 'toyota-global.com', simpleIconSlug: 'toyota', color: 'eb0a1e' },
  '7203': { ticker: '7203', name: 'Toyota Motor Corp', domain: 'toyota-global.com', simpleIconSlug: 'toyota', color: 'eb0a1e' },
  '6758.T': { ticker: '6758.T', name: 'Sony Group Corp', domain: 'sony.com', simpleIconSlug: 'sony', color: 'ffffff' },
  '6758': { ticker: '6758', name: 'Sony Group Corp', domain: 'sony.com', simpleIconSlug: 'sony', color: 'ffffff' },
  '9984.T': { ticker: '9984.T', name: 'SoftBank Group', domain: 'group.softbank', simpleIconSlug: 'softbank' },
  '9432.T': { ticker: '9432.T', name: 'Nippon Telegraph and Telephone', domain: 'group.ntt' },
  '8306.T': { ticker: '8306.T', name: 'Mitsubishi UFJ Financial', domain: 'mufg.jp', simpleIconSlug: 'mitsubishielectric' },
  '005930.KS': { ticker: '005930.KS', name: 'Samsung Electronics', domain: 'samsung.com', simpleIconSlug: 'samsung' },
  '005930': { ticker: '005930', name: 'Samsung Electronics', domain: 'samsung.com', simpleIconSlug: 'samsung' },
  '000660.KS': { ticker: '000660.KS', name: 'SK Hynix Inc.', domain: 'skhynix.com' },

  // ── Singapore, Australia & Canada ─────────────────────────────────────────
  'U11.SI': { ticker: 'U11.SI', name: 'United Overseas Bank (UOB)', domain: 'uob.com.sg' },
  U11: { ticker: 'U11', name: 'United Overseas Bank (UOB)', domain: 'uob.com.sg' },
  'D05.SI': { ticker: 'D05.SI', name: 'DBS Group Holdings', domain: 'dbs.com' },
  D05: { ticker: 'D05', name: 'DBS Group Holdings', domain: 'dbs.com' },
  'O39.SI': { ticker: 'O39.SI', name: 'Oversea-Chinese Banking Corp (OCBC)', domain: 'ocbc.com' },
  'Z74.SI': { ticker: 'Z74.SI', name: 'Singtel', domain: 'singtel.com' },
  'C38U.SI': { ticker: 'C38U.SI', name: 'CapitaLand Integrated Commercial Trust', domain: 'capitaland.com' },
  'BHP.AX': { ticker: 'BHP.AX', name: 'BHP Group Limited', domain: 'bhp.com', simpleIconSlug: 'bhp' },
  BHP: { ticker: 'BHP', name: 'BHP Group Limited', domain: 'bhp.com', simpleIconSlug: 'bhp' },
  'CBA.AX': { ticker: 'CBA.AX', name: 'Commonwealth Bank of Australia', domain: 'commbank.com.au' },
  'CSL.AX': { ticker: 'CSL.AX', name: 'CSL Limited', domain: 'csl.com' },
  'WES.AX': { ticker: 'WES.AX', name: 'Wesfarmers Limited', domain: 'wesfarmers.com.au' },
  'FMG.AX': { ticker: 'FMG.AX', name: 'Fortescue Ltd', domain: 'fortescue.com' },
  TD: { ticker: 'TD', name: 'Toronto-Dominion Bank', domain: 'td.com', simpleIconSlug: 'tdbank' },
  RY: { ticker: 'RY', name: 'Royal Bank of Canada', domain: 'rbc.com', simpleIconSlug: 'rbc' },
  BNS: { ticker: 'BNS', name: 'The Bank of Nova Scotia', domain: 'scotiabank.com', simpleIconSlug: 'scotiabank' },
  BMO: { ticker: 'BMO', name: 'Bank of Montreal', domain: 'bmo.com', simpleIconSlug: 'bmo' },
  ENB: { ticker: 'ENB', name: 'Enbridge Inc.', domain: 'enbridge.com', simpleIconSlug: 'enbridge' },
  TRP: { ticker: 'TRP', name: 'TC Energy Corporation', domain: 'tcenergy.com' },
};

/**
 * TradeSim Pro Clean Legal Stock Logo Registry
 * Prioritizes self-hosted assets under /logos/[ticker].svg and dynamic typography badges.
 * 100% Free from proprietary third-party CDNs and hotlinks.
 */
export function getCompanyLogoCandidates(rawSymbol: string): string[] {
  if (!rawSymbol) return [];

  const sym = rawSymbol.trim().toUpperCase();
  const cleanSym = sym.replace('.JK', '').replace(/USDT$/i, '').toLowerCase();

  const candidates: string[] = [
    `/logos/${cleanSym}.svg`,
    `/logos/${cleanSym}.png`,
  ];

  return candidates;
}
