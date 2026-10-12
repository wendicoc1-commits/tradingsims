import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getPendingDeposits, getMembersWithPortfolios, DepositRecord, MemberPortfolioItem } from '@/app/admin/actions';

export interface TradingOrderRecord {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  symbol: string;
  displaySymbol: string;
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'RESET';
  orderType: string;
  price: number;
  lots: number;
  shares: number;
  total: number;
  status: string;
  createdAt: string;
  notes?: string;
}

export interface MemberHoldingRow {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  symbol: string;
  displaySymbol: string;
  name: string;
  category: 'IDX' | 'CRYPTO' | 'US';
  currency: 'IDR' | 'USD';
  lots: number;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  marketValueIdr: number;
  unrealizedPLIdr: number;
  unrealizedPLPercent: number;
  updated_at: string;
}

export interface AssetMatrixRow {
  symbol: string;
  displaySymbol: string;
  name: string;
  category: 'IDX' | 'CRYPTO' | 'US';
  currency: 'IDR' | 'USD';
  currentPrice: number;
  holdersCount: number;
  totalLots: number;
  totalShares: number;
  totalMarketValueIdr: number;
  totalUnrealizedPLIdr: number;
  dailyActivity: Record<string, { orders: number; activeHolders: number; netLots: number }>;
}

export interface TradingAdminState {
  today: string;
  deposits: DepositRecord[];
  members: MemberPortfolioItem[];
  holdingsFlat: MemberHoldingRow[];
  orders: TradingOrderRecord[];
  assetMatrix: AssetMatrixRow[];
}

export function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, offset: number): string {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

export async function getTradingAdminState(): Promise<TradingAdminState> {
  const today = getTodayIso();
  const [deposits, members] = await Promise.all([
    getPendingDeposits().catch(() => [] as DepositRecord[]),
    getMembersWithPortfolios('').catch(() => [] as MemberPortfolioItem[]),
  ]);

  const holdingsFlat: MemberHoldingRow[] = [];
  const orders: TradingOrderRecord[] = [];

  // Pull raw orders from user_portfolios and portfolio_transactions in Supabase
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data: portfolios } = await supabaseAdmin
      .from('user_portfolios')
      .select('user_id, email, orders, updated_at');

    const memberLookup = new Map<string, MemberPortfolioItem>();
    for (const m of members) {
      memberLookup.set(m.user_id, m);
      if (m.email) memberLookup.set(m.email.toLowerCase(), m);
    }

    if (Array.isArray(portfolios)) {
      for (const p of portfolios) {
        const m = memberLookup.get(p.user_id) || (p.email ? memberLookup.get(p.email.toLowerCase()) : undefined);
        const userName = m?.full_name || (p.email ? p.email.split('@')[0] : 'Member Trader');
        const userEmail = m?.email || p.email || `${p.user_id}@tradesim.id`;
        const rawOrders = Array.isArray(p.orders) ? p.orders : [];

        for (const o of rawOrders) {
          if (!o) continue;
          const isDeposit = o.type === 'DEPOSIT' || o.symbol === 'DEPOSIT';
          orders.push({
            id: String(o.id || `${p.user_id}-${o.createdAt || Date.now()}`),
            user_id: p.user_id,
            user_name: userName,
            user_email: userEmail,
            symbol: String(o.symbol || 'CASH'),
            displaySymbol: String(o.displaySymbol || o.symbol || 'CASH'),
            type: isDeposit ? 'DEPOSIT' : o.type === 'SELL' ? 'SELL' : 'BUY',
            orderType: String(o.orderType || (isDeposit ? 'TOPUP' : 'MARKET')),
            price: Number(o.price) || 1,
            lots: Number(o.lots) || 0,
            shares: Number(o.shares || o.virtualCashAmount || 0),
            total: Number(o.total || o.virtualCashAmount || 0),
            status: String(o.status || 'FILLED').toUpperCase(),
            createdAt: o.createdAt || p.updated_at || new Date().toISOString(),
            notes: o.notes || undefined,
          });
        }
      }
    }
  } catch (err) {
    console.warn('[getTradingAdminState orders fetch warning]', err);
  }

  // Also include deposit tickets in orders list if not already present by ID
  const existingOrderIds = new Set(orders.map((o) => o.id));
  for (const d of deposits) {
    if (!existingOrderIds.has(d.id)) {
      orders.push({
        id: d.id,
        user_id: d.user_id,
        user_name: d.user?.full_name || 'Member Trader',
        user_email: d.user?.email || d.user_id,
        symbol: 'DEPOSIT',
        displaySymbol: 'TOP UP RDN',
        type: 'DEPOSIT',
        orderType: d.payment_method || 'QRIS',
        price: 1,
        lots: 1,
        shares: Number(d.amount) || 0,
        total: Number(d.amount) || 0,
        status: d.status,
        createdAt: d.created_at,
        notes: d.notes || undefined,
      });
    }
  }

  orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  // Flatten all member holdings
  const assetMap = new Map<string, AssetMatrixRow>();

  for (const m of members) {
    for (let idx = 0; idx < (m.holdings || []).length; idx++) {
      const h: any = m.holdings[idx];
      const rawSymbol = String(h.symbol || h.displaySymbol || 'UNKNOWN').toUpperCase();
      const displaySymbol = String(h.displaySymbol || rawSymbol.replace('.JK', '')).toUpperCase();
      const isCrypto =
        h.assetClass === 'CRYPTO' ||
        h.currency === 'USDT' ||
        ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'LINK', 'PEPE', 'SHIB'].includes(displaySymbol);
      const isUs =
        !isCrypto &&
        (h.assetClass === 'US' ||
          h.currency === 'USD' ||
          ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'GOOGL', 'AMZN', 'META', 'AMD', 'NFLX'].includes(displaySymbol));

      const category: 'IDX' | 'CRYPTO' | 'US' = isCrypto ? 'CRYPTO' : isUs ? 'US' : 'IDX';
      const currency: 'IDR' | 'USD' = isCrypto || isUs ? 'USD' : 'IDR';
      const isForeign = currency === 'USD';
      const rate = isForeign ? Number(h.exchangeRate) || 16000 : 1;
      const lots = Number(h.lots) || 0;
      const shares = Number(h.shares) > 0 ? Number(h.shares) : lots * (isForeign ? 1 : 100);
      const avgPrice = Number(h.avgPrice) || 0;
      const currentPrice = Number(h.currentPrice) || avgPrice;
      const marketValueIdr = Math.round(shares * currentPrice * rate);
      const unrealizedPLIdr = Math.round((currentPrice - avgPrice) * shares * rate);
      const unrealizedPLPercent =
        avgPrice > 0
          ? Number((((currentPrice - avgPrice) / avgPrice) * 100).toFixed(2))
          : Number(h.unrealizedPLPercent) || 0;

      holdingsFlat.push({
        id: `${m.user_id}-${displaySymbol}-${idx}`,
        user_id: m.user_id,
        user_name: m.full_name,
        user_email: m.email,
        symbol: rawSymbol,
        displaySymbol,
        name: h.name || displaySymbol,
        category,
        currency,
        lots,
        shares,
        avgPrice,
        currentPrice,
        marketValueIdr,
        unrealizedPLIdr,
        unrealizedPLPercent,
        updated_at: m.updated_at,
      });

      const existing = assetMap.get(displaySymbol);
      if (existing) {
        existing.holdersCount += 1;
        existing.totalLots += lots;
        existing.totalShares += shares;
        existing.totalMarketValueIdr += marketValueIdr;
        existing.totalUnrealizedPLIdr += unrealizedPLIdr;
        if (currentPrice > 0) existing.currentPrice = currentPrice;
      } else {
        assetMap.set(displaySymbol, {
          symbol: rawSymbol,
          displaySymbol,
          name: h.name || displaySymbol,
          category,
          currency,
          currentPrice,
          holdersCount: 1,
          totalLots: lots,
          totalShares: shares,
          totalMarketValueIdr: marketValueIdr,
          totalUnrealizedPLIdr: unrealizedPLIdr,
          dailyActivity: {},
        });
      }
    }
  }

  // Populate daily activity over the last 10 days for each asset in assetMap
  const last10Days = Array.from({ length: 10 }, (_, i) => addDaysIso(today, -(9 - i)));
  for (const row of assetMap.values()) {
    for (const day of last10Days) {
      const dayOrders = orders.filter(
        (o) =>
          (o.displaySymbol.toUpperCase() === row.displaySymbol || o.symbol.toUpperCase() === row.symbol) &&
          String(o.createdAt || '').slice(0, 10) === day
      );
      const netLots = dayOrders.reduce(
        (acc, o) => acc + (o.type === 'SELL' ? -(Number(o.lots) || 1) : Number(o.lots) || 1),
        0
      );
      row.dailyActivity[day] = {
        orders: dayOrders.length,
        activeHolders: row.holdersCount,
        netLots,
      };
    }
  }

  const assetMatrix = Array.from(assetMap.values()).sort(
    (a, b) => b.totalMarketValueIdr - a.totalMarketValueIdr
  );

  return {
    today,
    deposits,
    members,
    holdingsFlat,
    orders,
    assetMatrix,
  };
}
