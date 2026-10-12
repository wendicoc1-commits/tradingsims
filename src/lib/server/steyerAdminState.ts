import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getPendingDeposits, getMembersWithPortfolios, DepositRecord, MemberPortfolioItem } from '@/app/admin/actions';

export interface EnrichedDepositRecord extends DepositRecord {
  realRevenueIdr: number; // Uang asli yang dibayar member (Pendapatan Website)
  virtualCashIdr: number; // Saldo virtual RDN yang masuk ke wallet member
  packageName: string;
}

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
  realRevenueIdr?: number;
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

export interface RevenueChannelRow {
  method: string;
  ticketsCount: number;
  approvedCount: number;
  pendingCount: number;
  approvedRevenueIdr: number;
  pendingRevenueIdr: number;
  virtualDisbursedIdr: number;
  dailyRevenue: Record<string, { revenueIdr: number; count: number }>;
}

export interface TradingAdminState {
  today: string;
  deposits: EnrichedDepositRecord[];
  members: MemberPortfolioItem[];
  holdingsFlat: MemberHoldingRow[];
  orders: TradingOrderRecord[];
  assetMatrix: AssetMatrixRow[];
  revenueMatrix: RevenueChannelRow[];
  summary: {
    totalApprovedRevenueIdr: number;
    totalPendingRevenueIdr: number;
    todayApprovedRevenueIdr: number;
    totalVirtualDisbursedIdr: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
  };
}

export function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, offset: number): string {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

/**
 * Ekstrak nominal uang asli yang ditransfer member (Pendapatan Website)
 * dari catatan tiket ("Bayar: Rp 50.000") atau dari rasio paket TopUp 1:100.
 */
export function extractRealRevenueIdr(d: DepositRecord): {
  realRevenueIdr: number;
  virtualCashIdr: number;
  packageName: string;
} {
  const virtualCashIdr = Number(d.amount) || 0;
  let realRevenueIdr = 0;

  if (d.notes) {
    const match = d.notes.match(/Bayar:\s*Rp\s*([\d.,]+)/i);
    if (match && match[1]) {
      const cleaned = Number(match[1].replace(/[.,]/g, ''));
      if (!isNaN(cleaned) && cleaned > 0) {
        realRevenueIdr = cleaned;
      }
    }
  }

  if (!realRevenueIdr) {
    if (virtualCashIdr >= 1_000_000) {
      realRevenueIdr = Math.round(virtualCashIdr / 100);
    } else {
      realRevenueIdr = virtualCashIdr;
    }
  }

  let packageName = 'Custom Top-Up';
  if (realRevenueIdr <= 10_000) packageName = 'Paket Pemula (1 Jt RDN)';
  else if (realRevenueIdr <= 20_000) packageName = 'Paket Favorit (2 Jt RDN)';
  else if (realRevenueIdr <= 50_000) packageName = 'Paket Populer (5 Jt RDN)';
  else if (realRevenueIdr <= 100_000) packageName = 'Best Value (10 Jt RDN)';
  else if (realRevenueIdr <= 200_000) packageName = 'Paket Whale (20 Jt RDN)';
  else if (realRevenueIdr >= 500_000) packageName = 'Paket Institusi (50 Jt+ RDN)';

  return { realRevenueIdr, virtualCashIdr, packageName };
}

export async function getTradingAdminState(): Promise<TradingAdminState> {
  const today = getTodayIso();
  const [rawDeposits, members] = await Promise.all([
    getPendingDeposits().catch(() => [] as DepositRecord[]),
    getMembersWithPortfolios('').catch(() => [] as MemberPortfolioItem[]),
  ]);

  const deposits: EnrichedDepositRecord[] = rawDeposits.map((d) => {
    const { realRevenueIdr, virtualCashIdr, packageName } = extractRealRevenueIdr(d);
    return {
      ...d,
      realRevenueIdr,
      virtualCashIdr,
      packageName,
    };
  });

  // Calculate Deposit Revenue Summary
  let totalApprovedRevenueIdr = 0;
  let totalPendingRevenueIdr = 0;
  let todayApprovedRevenueIdr = 0;
  let totalVirtualDisbursedIdr = 0;
  let approvedCount = 0;
  let pendingCount = 0;
  let rejectedCount = 0;

  for (const d of deposits) {
    const createdDay = String(d.created_at || '').slice(0, 10);
    if (d.status === 'APPROVED') {
      approvedCount++;
      totalApprovedRevenueIdr += d.realRevenueIdr;
      totalVirtualDisbursedIdr += d.virtualCashIdr;
      if (createdDay === today || String(d.approved_at || '').slice(0, 10) === today) {
        todayApprovedRevenueIdr += d.realRevenueIdr;
      }
    } else if (d.status === 'PENDING') {
      pendingCount++;
      totalPendingRevenueIdr += d.realRevenueIdr;
    } else if (d.status === 'REJECTED') {
      rejectedCount++;
    }
  }

  // Build 10-day Revenue Channel Matrix by Payment Method
  const last10Days = Array.from({ length: 10 }, (_, i) => addDaysIso(today, -(9 - i)));
  const channelMap = new Map<string, RevenueChannelRow>();

  for (const d of deposits) {
    const method = (d.payment_method || 'QRIS').toUpperCase();
    let row = channelMap.get(method);
    if (!row) {
      row = {
        method,
        ticketsCount: 0,
        approvedCount: 0,
        pendingCount: 0,
        approvedRevenueIdr: 0,
        pendingRevenueIdr: 0,
        virtualDisbursedIdr: 0,
        dailyRevenue: {},
      };
      for (const day of last10Days) {
        row.dailyRevenue[day] = { revenueIdr: 0, count: 0 };
      }
      channelMap.set(method, row);
    }

    row.ticketsCount++;
    const day = String(d.created_at || '').slice(0, 10);
    if (d.status === 'APPROVED') {
      row.approvedCount++;
      row.approvedRevenueIdr += d.realRevenueIdr;
      row.virtualDisbursedIdr += d.virtualCashIdr;
      if (row.dailyRevenue[day]) {
        row.dailyRevenue[day].revenueIdr += d.realRevenueIdr;
        row.dailyRevenue[day].count += 1;
      }
    } else if (d.status === 'PENDING') {
      row.pendingCount++;
      row.pendingRevenueIdr += d.realRevenueIdr;
      if (row.dailyRevenue[day]) {
        row.dailyRevenue[day].count += 1;
      }
    }
  }

  const revenueMatrix = Array.from(channelMap.values()).sort(
    (a, b) => b.approvedRevenueIdr - a.approvedRevenueIdr || b.ticketsCount - a.ticketsCount
  );

  const holdingsFlat: MemberHoldingRow[] = [];
  const orders: TradingOrderRecord[] = [];

  // Pull raw orders from user_portfolios in Supabase
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
          const virtualAmt = Number(o.virtualCashAmount || o.shares || o.total || 0);
          const realPay = isDeposit
            ? Number(o.lots) > 0 && Number(o.lots) < virtualAmt
              ? Number(o.lots)
              : Math.round(virtualAmt / 100)
            : undefined;
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
            shares: virtualAmt,
            total: isDeposit ? virtualAmt : Number(o.total || 0),
            realRevenueIdr: realPay,
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
        lots: d.realRevenueIdr,
        shares: d.virtualCashIdr,
        total: d.virtualCashIdr,
        realRevenueIdr: d.realRevenueIdr,
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
    revenueMatrix,
    summary: {
      totalApprovedRevenueIdr,
      totalPendingRevenueIdr,
      todayApprovedRevenueIdr,
      totalVirtualDisbursedIdr,
      approvedCount,
      pendingCount,
      rejectedCount,
    },
  };
}
