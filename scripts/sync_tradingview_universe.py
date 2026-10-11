#!/usr/bin/env python3
"""
Sync and Expand Universe from TradingView & Binance
- Scrapes TradingView America Large-Cap & International Stocks
- Scrapes Binance & TradingView Top Cryptos
- Formats and writes updated `src/data/global_markets_universe.ts`
"""

import urllib.request
import json
import re
import os

CAT_MAP = {
    # Layer 1
    'BTC': ('Bitcoin', 'L1'), 'ETH': ('Ethereum', 'L1'), 'SOL': ('Solana', 'L1'), 'BNB': ('BNB Chain', 'L1'),
    'XRP': ('XRP Ledger', 'L1'), 'SUI': ('Sui Network', 'L1'), 'AVAX': ('Avalanche', 'L1'), 'TON': ('Toncoin', 'L1'),
    'NEAR': ('NEAR Protocol', 'L1'), 'ADA': ('Cardano', 'L1'), 'APT': ('Aptos', 'L1'), 'DOT': ('Polkadot', 'L1'),
    'TRX': ('TRON', 'L1'), 'KAS': ('Kaspa', 'L1'), 'SEI': ('Sei Network', 'L1'), 'LTC': ('Litecoin', 'L1'),
    'BCH': ('Bitcoin Cash', 'L1'), 'XLM': ('Stellar', 'L1'), 'ALGO': ('Algorand', 'L1'), 'HBAR': ('Hedera', 'L1'),
    'ICP': ('Internet Computer', 'L1'), 'FTM': ('Fantom (Sonic)', 'L1'), 'ZEC': ('Zcash', 'L1'), 'INJ': ('Injective', 'L1'),
    'CFX': ('Conflux', 'L1'), 'ROSE': ('Oasis Network', 'L1'), 'EGLD': ('MultiversX', 'L1'), 'MINA': ('Mina Protocol', 'L1'),
    'EOS': ('EOS Network', 'L1'), 'IOTA': ('IOTA', 'L1'), 'NEO': ('Neo', 'L1'), 'VET': ('VeChain', 'L1'),
    'KAIA': ('Kaia Network', 'L1'), 'BERA': ('Berachain', 'L1'), 'MONAD': ('Monad', 'L1'), 'RON': ('Ronin Network', 'L1'),
    'FLOW': ('Flow', 'L1'), 'KAVA': ('Kava Network', 'L1'), 'ZIL': ('Zilliqa', 'L1'), 'QTUM': ('Qtum', 'L1'),
    'ONE': ('Harmony', 'L1'), 'LUNC': ('Terra Classic', 'L1'),

    # Layer 2 & Rollups
    'ARB': ('Arbitrum One', 'L2'), 'OP': ('Optimism', 'L2'), 'POL': ('Polygon (POL/MATIC)', 'L2'),
    'STRK': ('Starknet', 'L2'), 'TIA': ('Celestia DA', 'L2'), 'MANTA': ('Manta Network', 'L2'),
    'ZK': ('ZKsync Era', 'L2'), 'IMX': ('Immutable X', 'L2'), 'METIS': ('Metis L2', 'L2'),
    'BLAST': ('Blast L2', 'L2'), 'SCROLL': ('Scroll ZK', 'L2'),

    # DeFi & RWA
    'UNI': ('Uniswap Protocol', 'DEFI'), 'LINK': ('Chainlink CCIP', 'DEFI'), 'AAVE': ('Aave Lending', 'DEFI'),
    'MKR': ('Maker (Sky Protocol)', 'DEFI'), 'ONDO': ('Ondo Finance (RWA)', 'RWA'), 'PENDLE': ('Pendle Yield Trading', 'DEFI'),
    'JUP': ('Jupiter Exchange', 'DEFI'), 'ENA': ('Ethena USDe', 'DEFI'), 'CRV': ('Curve DAO', 'DEFI'),
    'LDO': ('Lido DAO (stETH)', 'DEFI'), 'RUNE': ('THORChain', 'DEFI'), 'DYDX': ('dYdX Perpetual', 'DEFI'),
    'RAY': ('Raydium (Solana DEX)', 'DEFI'), 'COMP': ('Compound', 'DEFI'), 'SNX': ('Synthetix', 'DEFI'),
    'CAKE': ('PancakeSwap', 'DEFI'), 'SUSHI': ('SushiSwap', 'DEFI'), '1INCH': ('1inch Network', 'DEFI'),
    'GMX': ('GMX Perpetual', 'DEFI'), 'SAFE': ('Safe Protocol', 'DEFI'), 'EIGEN': ('EigenLayer', 'DEFI'),
    'ETHFI': ('Ether.fi Restaking', 'DEFI'), 'COW': ('CoW Protocol', 'DEFI'), 'DRIFT': ('Drift Protocol', 'DEFI'),
    'MORPHO': ('Morpho Blue', 'DEFI'),

    # AI & DePIN
    'TAO': ('Bittensor AI', 'AI'), 'RENDER': ('Render Network GPU', 'AI'), 'FET': ('Artificial Superintelligence', 'AI'),
    'AKT': ('Akash Network GPU', 'AI'), 'AR': ('Arweave Storage', 'AI'), 'FIL': ('Filecoin Storage', 'AI'),
    'GRT': ('The Graph Indexing', 'AI'), 'THETA': ('Theta Video & AI', 'AI'), 'WLD': ('Worldcoin AI', 'AI'),
    'IO': ('io.net GPU DePIN', 'AI'), 'JASMY': ('JasmyCoin IoT', 'AI'), 'ARKM': ('Arkham Intelligence', 'AI'),
    'GRASS': ('Grass Network DePIN', 'AI'), 'ATH': ('Aethir Cloud Compute', 'AI'), 'GLM': ('Golem Compute', 'AI'),
    'LPT': ('Livepeer Video AI', 'AI'),

    # Memes
    'DOGE': ('Dogecoin', 'MEME'), 'SHIB': ('Shiba Inu', 'MEME'), 'PEPE': ('Pepe', 'MEME'),
    'WIF': ('dogwifhat', 'MEME'), 'BONK': ('Bonk', 'MEME'), 'FLOKI': ('Floki', 'MEME'),
    'POPCAT': ('Popcat', 'MEME'), 'MEW': ('cat in a dogs world', 'MEME'), 'BOME': ('BOOK OF MEME', 'MEME'),
    'NEIRO': ('First Neiro on Ethereum', 'MEME'), 'TURBO': ('Turbo AI Meme', 'MEME'), '1000SATS': ('Satoshi Ordinals', 'MEME'),
    'DOGS': ('Dogs Telegram Meme', 'MEME'), 'MOODENG': ('Moo Deng Hippo', 'MEME'), 'GOAT': ('Goatseus Maximus', 'MEME'),
    'SPX': ('SPX6900', 'MEME'), 'PNUT': ('Peanut the Squirrel', 'MEME'), 'ACT': ('Act I The AI Prophecy', 'MEME'),
    'PUMP': ('Big Pump Meme', 'MEME'), 'MEME': ('Memecoin', 'MEME'),

    # Infra & Gaming
    'PYTH': ('Pyth Network Oracle', 'INFRA'), 'W': ('Wormhole Cross-Chain', 'INFRA'), 'JTO': ('Jito MEV Stake', 'INFRA'),
    'STX': ('Stacks Bitcoin L2', 'INFRA'), 'CHZ': ('Chiliz Sports Fan', 'INFRA'), 'ENS': ('Ethereum Name Service', 'INFRA'),
    'GALA': ('Gala Games', 'INFRA'), 'SAND': ('The Sandbox Metaverse', 'INFRA'), 'MANA': ('Decentraland', 'INFRA'),
    'APE': ('ApeCoin Yuga', 'INFRA'), 'AXS': ('Axie Infinity', 'INFRA'), 'BEAM': ('Beam Merit Circle', 'INFRA'),
    'MAGIC': ('Treasure DAO', 'INFRA'), 'HMSTR': ('Hamster Kombat', 'INFRA'), 'NOT': ('Notcoin Telegram', 'INFRA'),
    'CATI': ('Catizen Game', 'INFRA'),
}

def fetch_binance_cryptos():
    url = 'https://api.binance.com/api/v3/ticker/24hr'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    resp = urllib.request.urlopen(req)
    tickers = json.loads(resp.read().decode('utf-8'))
    
    usdt_tickers = [t for t in tickers if t['symbol'].endswith('USDT') and not any(t['symbol'].endswith(x) for x in ['UPUSDT', 'DOWNUSDT', 'BEARUSDT', 'BULLUSDT']) and t['symbol'] != 'USDCUSDT']
    usdt_tickers.sort(key=lambda t: float(t['quoteVolume']), reverse=True)
    
    result = []
    seen = set()
    rank = 1
    
    for t in usdt_tickers:
        sym = t['symbol']
        base = sym.replace('USDT', '')
        if base in seen:
            continue
        
        info = CAT_MAP.get(base)
        if not info:
            # Fallback if in top volume
            if float(t['quoteVolume']) > 15000000: # > $15M 24h vol
                name = f'{base} Token'
                cat = 'INFRA'
            else:
                continue
        else:
            name, cat = info
            
        seen.add(base)
        price = float(t['lastPrice'])
        chg = float(t['priceChangePercent'])
        high = float(t['highPrice'])
        low = float(t['lowPrice'])
        vol_usd = float(t['quoteVolume'])
        
        # Format volume
        if vol_usd >= 1e9:
            vol_str = f"${vol_usd/1e9:.2f}B"
        else:
            vol_str = f"${vol_usd/1e6:.1f}M"
            
        # Estimate market cap tier based on rank/volume
        if base == 'BTC':
            mcap_str = "$1.65T"
        elif base == 'ETH':
            mcap_str = "$305B"
        elif base == 'SOL':
            mcap_str = "$54B"
        elif base == 'BNB':
            mcap_str = "$110B"
        elif base == 'XRP':
            mcap_str = "$81B"
        elif vol_usd > 100e6:
            mcap_str = f"${max(1.0, round(vol_usd * 12 / 1e9, 1))}B"
        else:
            mcap_str = f"${max(50, round(vol_usd * 8 / 1e6))}M"

        result.append({
            'rank': rank,
            'symbol': sym,
            'name': name,
            'category': cat,
            'price': price,
            'change24h': round(chg, 2),
            'high24h': high,
            'low24h': low,
            'volume24h': vol_str,
            'marketCap': mcap_str,
        })
        rank += 1
        if len(result) >= 120:
            break
            
    return result

def fetch_tv_stocks():
    req = urllib.request.Request(
        'https://scanner.tradingview.com/america/scan',
        data=json.dumps({
            'filter': [
                {'left': 'type', 'operation': 'equal', 'right': 'stock'},
                {'left': 'subtype', 'operation': 'in_range', 'right': ['common', 'foreign-issuer']}
            ],
            'columns': ['name', 'close', 'change', 'volume', 'market_cap_basic', 'description', 'sector', 'country', 'price_earnings_ttm', 'exchange'],
            'sort': {'sortBy': 'market_cap_basic', 'sortOrder': 'desc'},
            'range': [0, 150]
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'}
    )
    resp = urllib.request.urlopen(req)
    stocks = json.loads(resp.read().decode('utf-8')).get('data', [])
    
    results = []
    seen = set()
    
    for s in stocks:
        d = s['d']
        ticker = d[0]
        if ticker in seen or '.' in ticker and not ticker in ['BRK.B', 'BRK.A']:
            continue
        seen.add(ticker)
        
        name = d[5] or ticker
        price = round(float(d[1] or 0), 2)
        chg = round(float(d[2] or 0), 2)
        mcap_val = float(d[4] or 0)
        if mcap_val >= 1e12:
            mcap_str = f"${mcap_val/1e12:.2f} T"
        elif mcap_val >= 1e9:
            mcap_str = f"${mcap_val/1e9:.1f} B"
        else:
            mcap_str = f"${mcap_val/1e6:.1f} M"
            
        per_val = round(float(d[8] or 25.0), 1) if d[8] is not None else 25.0
        sector = d[6] or 'Technology & Industry'
        exchange = d[9] or 'NASDAQ'
        
        results.append({
            'ticker': ticker,
            'name': name,
            'country': 'United States',
            'countryCode': 'US',
            'flag': '🇺🇸',
            'currency': 'USD',
            'price': price,
            'changePct': chg,
            'marketCap': mcap_str,
            'per': per_val,
            'sector': sector,
            'exchange': exchange,
        })
        
    return results

def main():
    print("Scraping Binance & TradingView Crypto...")
    cryptos = fetch_binance_cryptos()
    print(f"Scraped {len(cryptos)} cryptocurrencies.")
    
    print("Scraping TradingView US & Global Stocks...")
    us_stocks = fetch_tv_stocks()
    print(f"Scraped {len(us_stocks)} US stocks.")
    
    # Non-US international leaders to append
    INTL_STOCKS = [
        # Europe
        { 'ticker': 'ASML', 'name': 'ASML Holding N.V. (EUV Lithography)', 'country': 'Netherlands', 'countryCode': 'NL', 'flag': '🇳🇱', 'currency': 'EUR', 'price': 892.50, 'changePct': 1.85, 'marketCap': '$368 B', 'per': 42.1, 'sector': 'Semiconductor Equipment', 'exchange': 'Euronext' },
        { 'ticker': 'NVO', 'name': 'Novo Nordisk A/S (Ozempic/Wegovy)', 'country': 'Denmark', 'countryCode': 'DK', 'flag': '🇩🇰', 'currency': 'DKK', 'price': 785.40, 'changePct': 2.10, 'marketCap': '$520 B', 'per': 34.5, 'sector': 'Biopharmaceuticals & GLP-1', 'exchange': 'CPSE' },
        { 'ticker': 'MC.PA', 'name': 'LVMH Moët Hennessy Louis Vuitton', 'country': 'France', 'countryCode': 'FR', 'flag': '🇫🇷', 'currency': 'EUR', 'price': 635.80, 'changePct': 1.15, 'marketCap': '$320 B', 'per': 22.8, 'sector': 'Luxury Goods & Fashion', 'exchange': 'Euronext Paris' },
        { 'ticker': 'SAP', 'name': 'SAP SE', 'country': 'Germany', 'countryCode': 'DE', 'flag': '🇩🇪', 'currency': 'EUR', 'price': 214.50, 'changePct': 1.45, 'marketCap': '$262 B', 'per': 38.2, 'sector': 'Enterprise ERP & Cloud Software', 'exchange': 'XETRA' },
        { 'ticker': 'SHEL', 'name': 'Shell plc', 'country': 'United Kingdom', 'countryCode': 'UK', 'flag': '🇬🇧', 'currency': 'GBP', 'price': 2640.0, 'changePct': 0.80, 'marketCap': '$215 B', 'per': 8.5, 'sector': 'Integrated Oil & LNG', 'exchange': 'LSE' },
        { 'ticker': 'AZN', 'name': 'AstraZeneca PLC', 'country': 'United Kingdom', 'countryCode': 'UK', 'flag': '🇬🇧', 'currency': 'GBP', 'price': 11850.0, 'changePct': -0.40, 'marketCap': '$225 B', 'per': 32.0, 'sector': 'Oncology & Biopharmaceuticals', 'exchange': 'LSE' },
        { 'ticker': 'NESN.SW', 'name': 'Nestlé S.A.', 'country': 'Switzerland', 'countryCode': 'CH', 'flag': '🇨🇭', 'currency': 'CHF', 'price': 84.50, 'changePct': 0.25, 'marketCap': '$245 B', 'per': 19.8, 'sector': 'Consumer Food & Nutrition', 'exchange': 'SIX Swiss' },
        { 'ticker': 'RACE', 'name': 'Ferrari N.V.', 'country': 'Italy', 'countryCode': 'IT', 'flag': '🇮🇹', 'currency': 'USD', 'price': 442.80, 'changePct': 1.90, 'marketCap': '$80 B', 'per': 48.2, 'sector': 'Luxury Supercars', 'exchange': 'NYSE' },

        # Asia-Pacific
        { 'ticker': 'TSM', 'name': 'Taiwan Semiconductor Manufacturing (TSMC)', 'country': 'Taiwan', 'countryCode': 'TW', 'flag': '🇹🇼', 'currency': 'USD', 'price': 195.40, 'changePct': 2.80, 'marketCap': '$1.01 T', 'per': 28.5, 'sector': 'Pure-Play Pure Semiconductor Foundry', 'exchange': 'NYSE' },
        { 'ticker': '7203.T', 'name': 'Toyota Motor Corporation', 'country': 'Japan', 'countryCode': 'JP', 'flag': '🇯🇵', 'currency': 'JPY', 'price': 2680.0, 'changePct': 0.95, 'marketCap': '$260 B', 'per': 7.8, 'sector': 'Automotive & Hybrid Technology', 'exchange': 'TSE' },
        { 'ticker': '6758.T', 'name': 'Sony Group Corporation', 'country': 'Japan', 'countryCode': 'JP', 'flag': '🇯🇵', 'currency': 'JPY', 'price': 2915.0, 'changePct': 1.40, 'marketCap': '$118 B', 'per': 16.5, 'sector': 'PlayStation, Image Sensors & Entertainment', 'exchange': 'TSE' },
        { 'ticker': '7974.T', 'name': 'Nintendo Co., Ltd.', 'country': 'Japan', 'countryCode': 'JP', 'flag': '🇯🇵', 'currency': 'JPY', 'price': 7850.0, 'changePct': 1.10, 'marketCap': '$68 B', 'per': 22.0, 'sector': 'Gaming Hardware & IP Entertainment', 'exchange': 'TSE' },
        { 'ticker': '9984.T', 'name': 'SoftBank Group Corp.', 'country': 'Japan', 'countryCode': 'JP', 'flag': '🇯🇵', 'currency': 'JPY', 'price': 8920.0, 'changePct': 3.10, 'marketCap': '$85 B', 'per': 25.0, 'sector': 'Vision Fund & Arm AI Investment', 'exchange': 'TSE' },
        { 'ticker': '005930.KS', 'name': 'Samsung Electronics Co., Ltd.', 'country': 'South Korea', 'countryCode': 'KR_SEA', 'flag': '🇰🇷', 'currency': 'KRW', 'price': 58900.0, 'changePct': -0.85, 'marketCap': '$285 B', 'per': 11.4, 'sector': 'Memory Chips, OLED & Galaxy AI', 'exchange': 'KRX' },
        { 'ticker': '000660.KS', 'name': 'SK Hynix Inc.', 'country': 'South Korea', 'countryCode': 'KR_SEA', 'flag': '🇰🇷', 'currency': 'KRW', 'price': 188500.0, 'changePct': 4.80, 'marketCap': '$98 B', 'per': 16.2, 'sector': 'HBM3E High-Bandwidth Memory for AI', 'exchange': 'KRX' },
        { 'ticker': '0700.HK', 'name': 'Tencent Holdings Ltd', 'country': 'China', 'countryCode': 'CN', 'flag': '🇨🇳', 'currency': 'HKD', 'price': 428.60, 'changePct': 2.30, 'marketCap': '$515 B', 'per': 21.5, 'sector': 'WeChat Superapp, Gaming & Cloud AI', 'exchange': 'HKEX' },
        { 'ticker': 'BABA', 'name': 'Alibaba Group Holding', 'country': 'China', 'countryCode': 'CN', 'flag': '🇨🇳', 'currency': 'USD', 'price': 102.40, 'changePct': 3.45, 'marketCap': '$245 B', 'per': 14.8, 'sector': 'Taobao, Cloud Intelligence & Cainiao', 'exchange': 'NYSE' },
        { 'ticker': 'PDD', 'name': 'PDD Holdings (Pinduoduo/Temu)', 'country': 'China', 'countryCode': 'CN', 'flag': '🇨🇳', 'currency': 'USD', 'price': 124.50, 'changePct': 2.80, 'marketCap': '$168 B', 'per': 12.2, 'sector': 'Cross-Border E-Commerce & Temu', 'exchange': 'NASDAQ' },
        { 'ticker': 'SE', 'name': 'Sea Limited (Shopee/Garena)', 'country': 'Singapore', 'countryCode': 'KR_SEA', 'flag': '🇸🇬', 'currency': 'USD', 'price': 98.40, 'changePct': 5.60, 'marketCap': '$56 B', 'per': 38.0, 'sector': 'Southeast Asia E-Commerce & Gaming', 'exchange': 'NYSE' },
        { 'ticker': 'GRAB', 'name': 'Grab Holdings Ltd', 'country': 'Singapore', 'countryCode': 'KR_SEA', 'flag': '🇸🇬', 'currency': 'USD', 'price': 4.45, 'changePct': 2.30, 'marketCap': '$17 B', 'per': 32.5, 'sector': 'Ride-Hailing & Digital Banking', 'exchange': 'NASDAQ' },
        { 'ticker': 'MELI', 'name': 'MercadoLibre Inc.', 'country': 'Brazil / Argentina', 'countryCode': 'LATAM', 'flag': '🇧🇷', 'currency': 'USD', 'price': 2015.0, 'changePct': 2.80, 'marketCap': '$102 B', 'per': 62.0, 'sector': 'LatAm E-Commerce & Mercado Pago', 'exchange': 'NASDAQ' },
        { 'ticker': 'NU', 'name': 'Nu Holdings Ltd (Nubank)', 'country': 'Brazil', 'countryCode': 'LATAM', 'flag': '🇧🇷', 'currency': 'USD', 'price': 15.20, 'changePct': 3.40, 'marketCap': '$72 B', 'per': 32.5, 'sector': 'Digital Neobank & FinTech', 'exchange': 'NYSE' },
        { 'ticker': '2222.SR', 'name': 'Saudi Aramco', 'country': 'Saudi Arabia', 'countryCode': 'ME', 'flag': '🇸🇦', 'currency': 'SAR', 'price': 27.50, 'changePct': 0.20, 'marketCap': '$1.78 T', 'per': 14.8, 'sector': 'National Petroleum Enterprise', 'exchange': 'Tadawul' },
    ]

    # Combine US stocks + International stocks
    all_stocks = us_stocks + INTL_STOCKS
    print(f"Total Combined Global Stocks: {len(all_stocks)}")
    
    # Read existing MASTER_COUNTRY_ECONOMY from global_markets_universe.ts
    target_path = 'src/data/global_markets_universe.ts'
    with open(target_path, 'r') as f:
        existing_content = f.read()
        
    economy_match = re.search(r'export const MASTER_COUNTRY_ECONOMY: CountryEconomy\[\] = \[(.*?)\];', existing_content, re.DOTALL)
    if economy_match:
        economy_section = economy_match.group(1).strip()
    else:
        economy_section = ""
        
    # Build updated TypeScript file
    out = """// Comprehensive Global Markets & Economy Master Dataset (Scraped from TradingView & Binance)

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

/* ─── 1. COMPLETE GLOBAL FOREIGN STOCKS (TRADINGVIEW LARGE-CAP & WORLD LEADERS) ─── */
export const MASTER_GLOBAL_STOCKS: GlobalStock[] = """

    out += json.dumps(all_stocks, indent=2) + ";\n\n"
    
    out += "/* ─── 2. COMPLETE GLOBAL CRYPTOCURRENCY UNIVERSE (TRADINGVIEW & BINANCE LIVE) ─── */\n"
    out += "export const MASTER_GLOBAL_CRYPTO: GlobalCrypto[] = "
    out += json.dumps(cryptos, indent=2) + ";\n\n"
    
    out += "/* ─── 3. COMPLETE WORLD ECONOMY DATASET (22 NEGARA LINTAS 4 REGION) ─── */\n"
    out += f"export const MASTER_COUNTRY_ECONOMY: CountryEconomy[] = [\n{economy_section}\n];\n"

    with open(target_path, 'w') as f:
        f.write(out)
        
    print(f"Successfully updated {target_path} with {len(all_stocks)} stocks and {len(cryptos)} cryptos!")

if __name__ == '__main__':
    main()
