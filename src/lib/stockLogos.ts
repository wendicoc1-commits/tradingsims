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
  NFLX: { ticker: 'NFLX', name: 'Netflix Inc.', domain: 'netflix.com', simpleIconSlug: 'netflix' },
  BABA: { ticker: 'BABA', name: 'Alibaba Group', domain: 'alibabagroup.com', simpleIconSlug: 'alibaba' },
  UBER: { ticker: 'UBER', name: 'Uber Technologies', domain: 'uber.com', simpleIconSlug: 'uber' },
  ABNB: { ticker: 'ABNB', name: 'Airbnb Inc.', domain: 'airbnb.com', simpleIconSlug: 'airbnb' },
  SPOT: { ticker: 'SPOT', name: 'Spotify Technology', domain: 'spotify.com', simpleIconSlug: 'spotify' },
  PYPL: { ticker: 'PYPL', name: 'PayPal Holdings', domain: 'paypal.com', simpleIconSlug: 'paypal' },
  DIS: { ticker: 'DIS', name: 'The Walt Disney Company', domain: 'thewaltdisneycompany.com', simpleIconSlug: 'disney' },
  NKE: { ticker: 'NKE', name: 'NIKE Inc.', domain: 'nike.com', simpleIconSlug: 'nike' },
};

/**
 * Top Indonesian Listed Companies (IDX) Official Domains for Favicon / Brand Logos
 */
export const IDX_BRAND_DOMAINS: Record<string, string> = {
  BBCA: 'bca.co.id',
  BBRI: 'bri.co.id',
  BMRI: 'bankmandiri.co.id',
  BBNI: 'bni.co.id',
  TLKM: 'telkom.co.id',
  ASII: 'astra.co.id',
  GOTO: 'gotocompany.com',
  ADRO: 'adaro.com',
  ANTM: 'antam.com',
  AMMN: 'amman.co.id',
  BREN: 'baritoenergy.com',
  BRPT: 'barito-pacific.com',
  UNVR: 'unilever.co.id',
  ICBP: 'indofoodcbp.com',
  INDF: 'indofood.com',
  KLBF: 'kalbe.co.id',
  BRIS: 'bankbsi.co.id',
  PTBA: 'bukitasam.co.id',
  ITMG: 'itmg.co.id',
  PGAS: 'pgn.co.id',
  MEDC: 'medcoenergi.com',
  CPIN: 'cpin.co.id',
  MDKA: 'merdekacoppergold.com',
  SMGR: 'sig.id',
  INKP: 'app.co.id',
  TKIM: 'app.co.id',
  TBIG: 'tower-bersama.com',
  TOWR: 'sarana-menara.com',
  EXCL: 'xl.co.id',
  ISAT: 'ioh.co.id',
  ARTO: 'jago.com',
  ACES: 'aspirasidagang.co.id',
  ERAA: 'erajaya.com',
  MAPI: 'map.co.id',
  MAPA: 'mapactive.id',
  MIKA: 'mitrakeluarga.com',
  HEAL: 'herminahospitals.com',
  SILO: 'siloamhospitals.com',
  AKRA: 'akr.co.id',
  UNTR: 'unitedtractors.com',
  ESSA: 'essaindonesia.com',
  PGEO: 'pertaminageothermal.com',
  MBMA: 'merdekabattery.com',
  NCKL: 'triminikeltbk.com',
  INCO: 'vale.com',
  HRUM: 'harumenergy.com',
  TPIA: 'chandra-asri.com',
  BFIN: 'bfi.co.id',
  BDMN: 'danamon.co.id',
  BNGA: 'cimbniaga.co.id',
  BBTN: 'btn.co.id',
  MEGA: 'bankmega.com',
  BJTM: 'bankjatim.co.id',
  BJBR: 'bankbjb.co.id',
  MYOR: 'mayora.com',
  CMRY: 'cisarua.com',
  SIDO: 'sidomuncul.co.id',
  TUGU: 'tugu.com',
  AMRT: 'alfamart.co.id',
  MIDI: 'midimart.co.id',
  CTRA: 'ciputra.com',
  BSDE: 'sinarmasland.com',
  SMRA: 'summarecon.com',
  PWON: 'pakuwonjati.com',
  ASRI: 'alam-sutera.com',
  JSMR: 'jasamarga.com',
  GIAA: 'garuda-indonesia.com',
  BIRD: 'bluebirdgroup.com',
  ASSA: 'assa.id',
  AGII: 'samatorgas.com',
  MNCN: 'mncgroup.com',
  SCMA: 'scm.co.id',
  EMTK: 'emtek.co.id',
};

/**
 * Top Cryptocurrencies Metadata and Vector Icon Slugs
 */
export const CRYPTO_BRAND_META: Record<string, { name: string; slug: string }> = {
  BTC: { name: 'Bitcoin', slug: 'bitcoin' },
  ETH: { name: 'Ethereum', slug: 'ethereum' },
  SOL: { name: 'Solana', slug: 'solana' },
  BNB: { name: 'BNB', slug: 'binance' },
  XRP: { name: 'XRP', slug: 'xrp' },
  ADA: { name: 'Cardano', slug: 'cardano' },
  DOGE: { name: 'Dogecoin', slug: 'dogecoin' },
  AVAX: { name: 'Avalanche', slug: 'avalanche' },
  DOT: { name: 'Polkadot', slug: 'polkadot' },
  LINK: { name: 'Chainlink', slug: 'chainlink' },
  MATIC: { name: 'Polygon', slug: 'polygon' },
  POL: { name: 'Polygon', slug: 'polygon' },
  NEAR: { name: 'NEAR Protocol', slug: 'near' },
  TRX: { name: 'TRON', slug: 'tron' },
  SUI: { name: 'Sui', slug: 'sui' },
  PEPE: { name: 'Pepe', slug: 'pepe' },
  SHIB: { name: 'Shiba Inu', slug: 'shiba-inu' },
  UNI: { name: 'Uniswap', slug: 'uniswap' },
  LTC: { name: 'Litecoin', slug: 'litecoin' },
  BCH: { name: 'Bitcoin Cash', slug: 'bitcoincash' },
  TIA: { name: 'Celestia', slug: 'celestia' },
  ATOM: { name: 'Cosmos', slug: 'cosmos' },
  XLM: { name: 'Stellar', slug: 'stellar' },
  XMR: { name: 'Monero', slug: 'monero' },
  FIL: { name: 'Filecoin', slug: 'filecoin' },
  AAVE: { name: 'Aave', slug: 'aave' },
  MKR: { name: 'Maker', slug: 'maker' },
  CRV: { name: 'Curve DAO', slug: 'curve' },
  ALGO: { name: 'Algorand', slug: 'algorand' },
  FTM: { name: 'Fantom', slug: 'fantom' },
  SAND: { name: 'The Sandbox', slug: 'thesandbox' },
  MANA: { name: 'Decentraland', slug: 'decentraland' },
  AXS: { name: 'Axie Infinity', slug: 'axieinfinity' },
  APT: { name: 'Aptos', slug: 'aptos' },
  ARB: { name: 'Arbitrum', slug: 'arbitrum' },
  OP: { name: 'Optimism', slug: 'optimism' },
  RENDER: { name: 'Render', slug: 'render' },
  INJ: { name: 'Injective', slug: 'injective' },
  FET: { name: 'Artificial Superintelligence Alliance', slug: 'fetchai' },
  KAS: { name: 'Kaspa', slug: 'kaspa' },
  ICP: { name: 'Internet Computer', slug: 'internetcomputer' },
};

/**
 * Multi-Tier 100% Transparent Vector & PNG Logo Candidates Resolver
 * Priority hierarchy:
 * 1. Local transparent vector SVG (/logos/[ticker].svg)
 * 2. Dedicated transparent vector CDN (SimpleIcons / jsDelivr cryptocurrency-icons)
 * 3. Transparent stock / asset CDN (Parqet / CoinCap)
 * 4. Transparent domain favicon (Google Favicon V2 & DuckDuckGo)
 */
export function getCompanyLogoCandidates(rawSymbol: string): string[] {
  if (!rawSymbol) return [];

  const sym = rawSymbol.trim().toUpperCase();
  const isCrypto = sym.endsWith('USDT') || CRYPTO_BRAND_META[sym] !== undefined;
  const cleanSym = sym.replace('.JK', '').replace(/USDT$/i, '').trim().toUpperCase();
  const lowerSym = cleanSym.toLowerCase();

  const candidates: string[] = [];

  // Tier 1: Local High-Performance Transparent Vector SVGs & PNGs
  candidates.push(`/logos/${lowerSym}.svg`);
  candidates.push(`/logos/${lowerSym}.png`);

  if (isCrypto) {
    const meta = CRYPTO_BRAND_META[cleanSym];
    // Cryptocurrency Icons (jsDelivr transparent SVG)
    candidates.push(`https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/${lowerSym}.svg`);
    // CoinCap 2x Transparent PNG
    candidates.push(`https://assets.coincap.io/assets/icons/${lowerSym}@2x.png`);
    // SimpleIcons vector
    if (meta?.slug) {
      candidates.push(`https://cdn.simpleicons.org/${meta.slug}`);
    }
  } else {
    // Check if symbol is in Global Stocks
    const globalBrand = GLOBAL_STOCK_BRANDS[cleanSym] || GLOBAL_STOCK_BRANDS[sym];
    if (globalBrand) {
      if (globalBrand.simpleIconSlug) {
        const colorParam = globalBrand.color ? `/${globalBrand.color}` : '';
        candidates.push(`https://cdn.simpleicons.org/${globalBrand.simpleIconSlug}${colorParam}`);
      }
      // Parqet Global Stock Transparent Logo
      candidates.push(`https://assets.parqet.com/logos/symbol/${cleanSym}`);
      // Google Favicon V2 (128px high-res)
      candidates.push(`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${globalBrand.domain}&size=128`);
      candidates.push(`https://icons.duckduckgo.com/ip3/${globalBrand.domain}.ico`);
    }

    // Check if symbol is Indonesian Stock (IDX)
    const idxDomain = IDX_BRAND_DOMAINS[cleanSym];
    if (idxDomain) {
      candidates.push(`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${idxDomain}&size=128`);
      candidates.push(`https://icons.duckduckgo.com/ip3/${idxDomain}.ico`);
    }

    // Parqet IDX ticker candidate (transparent PNG)
    candidates.push(`https://assets.parqet.com/logos/symbol/${cleanSym}.JK`);
  }

  return candidates;
}
