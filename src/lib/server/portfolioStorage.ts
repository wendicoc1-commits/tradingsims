import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { PortfolioHolding, Order, ConditionalOrder, DividendRecord } from '@/types';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  createdAt: string;
}

export interface UserPortfolioData {
  cash: number;
  realizedPL: number;
  holdings: PortfolioHolding[];
  orders: Order[];
  conditionalOrders?: ConditionalOrder[];
  dividends?: DividendRecord[];
  lastUpdated: number;
}

import SEED_DATABASE from '@/data/server_user_portfolios.json';

interface ServerDatabase {
  users: Record<string, StoredUser>; // keyed by email (lowercase)
  portfolios: Record<string, UserPortfolioData>; // keyed by user id AND by email
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DB_FILE = path.join(DATA_DIR, 'server_user_portfolios.json');
const SALT = 'tradingsims_cloud_sync_salt_v1';

export function hashPassword(password: string): string {
  if (!password) return '';
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex');
}

export function verifyPasswordHash(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  const computed = hashPassword(password);
  if (computed === storedHash) return true;
  return password === storedHash;
}

// CLOUD-FIRST ARCHITECTURE:
// Seluruh data pengguna & portofolio ditulis dan dibaca langsung dari Supabase Cloud.
// TIDAK ADA penulisan ke disk file lokal (server_user_portfolios.json) untuk mencegah
// diskonvergensi, desinkronisasi, dan data duplikat antara lokal & cloud.

let inMemoryDb: ServerDatabase | null = null;

/**
 * Deduplikasi posisi saham/koin secara tegas:
 * Menggabungkan entri dengan simbol sama menjadi satu posisi terpadu berbobot rata-rata.
 */
export function deduplicateHoldings(holdings: PortfolioHolding[]): PortfolioHolding[] {
  if (!Array.isArray(holdings)) return [];
  const map = new Map<string, PortfolioHolding>();

  for (const h of holdings) {
    if (!h || !h.symbol) continue;
    const rawClean = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
    const cleanSym = rawClean === 'GOOGLE' ? 'GOOGL' : rawClean;
    const isCrypto = h.assetClass === 'CRYPTO' || h.currency === 'USDT' || h.symbol.endsWith('USDT');
    const isUS = !isCrypto && (h.currency === 'USD' || h.assetClass === 'US');
    const uniqueKey = isCrypto ? `CRYPTO:${cleanSym}` : isUS ? `US:${cleanSym}` : `IDX:${cleanSym}`;

    const existing = map.get(uniqueKey);
    if (!existing) {
      map.set(uniqueKey, { ...h, displaySymbol: cleanSym });
    } else {
      const exLots = existing.lots || 0;
      const newLots = h.lots || 0;
      const totalLots = exLots + newLots;
      const exUnits = (existing.cryptoUnits && existing.cryptoUnits > 0) ? existing.cryptoUnits : exLots;
      const newUnits = (h.cryptoUnits && h.cryptoUnits > 0) ? h.cryptoUnits : newLots;
      const totalUnits = exUnits + newUnits;

      let combinedAvg = existing.avgPrice;
      if (totalLots > 0) {
        combinedAvg = ((existing.avgPrice * exLots) + (h.avgPrice * newLots)) / totalLots;
      }

      const totalShares = (existing.shares || 0) + (h.shares || 0);
      const curPrice = h.currentPrice || existing.currentPrice;
      const rate = existing.exchangeRate || h.exchangeRate || 16000;
      const isForeign = isCrypto || isUS;

      const unrealizedPL = isForeign
        ? Math.round((curPrice - combinedAvg) * totalUnits * rate)
        : Math.round((curPrice - combinedAvg) * totalShares);
      const unrealizedPLPercent = combinedAvg > 0
        ? Number((((curPrice - combinedAvg) / combinedAvg) * 100).toFixed(2))
        : 0;

      map.set(uniqueKey, {
        ...existing,
        avgPrice: combinedAvg,
        lots: totalLots,
        shares: totalShares,
        cryptoUnits: isCrypto ? totalUnits : undefined,
        currentPrice: curPrice,
        unrealizedPL,
        unrealizedPLPercent,
        takeProfitPrice: h.takeProfitPrice || existing.takeProfitPrice,
        stopLossPrice: h.stopLossPrice || existing.stopLossPrice,
      });
    }
  }

  return Array.from(map.values()).filter((h) => {
    const units = (h.cryptoUnits !== undefined) ? h.cryptoUnits : h.lots;
    return units > 0.000001;
  });
}

/**
 * Deduplikasi order transaksi berdasarkan order id unik
 */
export function deduplicateOrders(orders: Order[]): Order[] {
  if (!Array.isArray(orders)) return [];
  const map = new Map<string, Order>();
  for (const o of orders) {
    if (!o || !o.id) continue;
    if (!map.has(o.id)) {
      map.set(o.id, o);
    }
  }
  return Array.from(map.values());
}

function loadDatabase(): ServerDatabase {
  if (inMemoryDb) {
    return inMemoryDb;
  }
  inMemoryDb = {
    users: {},
    portfolios: {},
  };
  return inMemoryDb;
}

function saveDatabase(db: ServerDatabase): void {
  // Hanya simpan di memory RAM runtime, TIDAK ke file disk lokal
  inMemoryDb = db;
}

/**
 * Sync user ke Supabase Cloud (Background Non-Blocking)
 */
async function syncUserToSupabase(user: StoredUser): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  try {
    await supabase.from('app_users').upsert({
      id: user.id,
      email: user.email,
      password_hash: user.passwordHash,
      full_name: user.fullName,
      created_at: user.createdAt,
    }, { onConflict: 'email' });
  } catch (err) {
    console.warn('[SUPABASE SYNC USER WARN]', err);
  }
}

/**
 * Sync portfolio ke Supabase Cloud (Background Non-Blocking)
 */
async function syncPortfolioToSupabase(
  userId: string,
  email: string,
  data: UserPortfolioData
): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  try {
    await supabase.from('user_portfolios').upsert({
      user_id: userId,
      email: email,
      cash: data.cash,
      realized_pl: data.realizedPL,
      holdings: data.holdings,
      orders: data.orders,
      conditional_orders: data.conditionalOrders || [],
      dividends: data.dividends || [],
      last_updated: data.lastUpdated,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  } catch (err) {
    console.warn('[SUPABASE SYNC PORTFOLIO WARN]', err);
  }
}

export function getUserByEmail(email: string): StoredUser | null {
  if (!email) return null;
  const normEmail = email.trim().toLowerCase();
  const db = loadDatabase();
  return db.users[normEmail] || null;
}

export async function getUserByEmailAsync(email: string): Promise<StoredUser | null> {
  if (!email) return null;
  const normEmail = email.trim().toLowerCase();
  const localUser = getUserByEmail(normEmail);
  if (localUser) return localUser;

  // Coba fetch dari Supabase jika belum ada di file lokal (misal setelah deployment baru)
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', normEmail)
        .maybeSingle();

      if (data) {
        const cloudUser: StoredUser = {
          id: data.id,
          email: data.email,
          passwordHash: data.password_hash,
          fullName: data.full_name,
          createdAt: data.created_at,
        };
        // Cache ke memori lokal
        const db = loadDatabase();
        db.users[normEmail] = cloudUser;
        saveDatabase(db);
        return cloudUser;
      }
    } catch (err) {
      console.warn('[SUPABASE FETCH USER ERROR]', err);
    }
  }
  return null;
}

export function getUserById(id: string): StoredUser | null {
  if (!id) return null;
  const db = loadDatabase();
  for (const u of Object.values(db.users)) {
    if (u.id === id) return u;
  }
  return null;
}

export function registerOrUpdateUser(email: string, password?: string, fullName?: string): StoredUser {
  const normEmail = email.trim().toLowerCase();
  const db = loadDatabase();
  const existing = db.users[normEmail];

  const now = new Date().toISOString();
  const user: StoredUser = {
    id: existing?.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    email: normEmail,
    passwordHash: password ? hashPassword(password) : (existing?.passwordHash || hashPassword('default_guest_pwd')),
    fullName: fullName?.trim() || existing?.fullName || normEmail.split('@')[0],
    createdAt: existing?.createdAt || now,
  };

  db.users[normEmail] = user;

  // Jika portofolio belum ada untuk akun ini, beri modal awal standar Rp 0
  if (!db.portfolios[normEmail] && !db.portfolios[user.id]) {
    const initialPortfolio: UserPortfolioData = {
      cash: 0,
      realizedPL: 0,
      holdings: [],
      orders: [],
      conditionalOrders: [],
      dividends: [],
      lastUpdated: Date.now(),
    };
    db.portfolios[normEmail] = initialPortfolio;
    db.portfolios[user.id] = initialPortfolio;
  } else if (db.portfolios[normEmail] && !db.portfolios[user.id]) {
    db.portfolios[user.id] = db.portfolios[normEmail];
  } else if (db.portfolios[user.id] && !db.portfolios[normEmail]) {
    db.portfolios[normEmail] = db.portfolios[user.id];
  }

  saveDatabase(db);

  // Sync ke Supabase Cloud
  syncUserToSupabase(user);
  if (db.portfolios[user.id]) {
    syncPortfolioToSupabase(user.id, user.email, db.portfolios[user.id]);
  }

  return user;
}

export function verifyUserPassword(email: string, password: string): { valid: boolean; user: StoredUser | null } {
  const normEmail = email.trim().toLowerCase();
  const db = loadDatabase();
  const user = db.users[normEmail];
  if (!user) {
    return { valid: false, user: null };
  }
  const valid = verifyPasswordHash(password, user.passwordHash);
  return { valid, user: valid ? user : null };
}

export async function verifyUserPasswordAsync(email: string, password: string): Promise<{ valid: boolean; user: StoredUser | null }> {
  const normEmail = email.trim().toLowerCase();
  const user = await getUserByEmailAsync(normEmail);
  if (!user) {
    return { valid: false, user: null };
  }
  const valid = verifyPasswordHash(password, user.passwordHash);
  return { valid, user: valid ? user : null };
}

export function changeUserPassword(email: string, newPassword: string): boolean {
  const normEmail = email.trim().toLowerCase();
  const db = loadDatabase();
  const user = db.users[normEmail];
  if (!user) {
    return false;
  }
  user.passwordHash = hashPassword(newPassword);
  db.users[normEmail] = user;
  saveDatabase(db);
  syncUserToSupabase(user);
  return true;
}

export async function changeUserPasswordAsync(email: string, newPassword: string): Promise<{ success: boolean; user?: StoredUser }> {
  const normEmail = email.trim().toLowerCase();
  const db = loadDatabase();
  let user = db.users[normEmail];
  if (!user) {
    user = (await getUserByEmailAsync(normEmail)) || undefined;
  }
  if (!user) {
    // Jika belum ada di users tapi ada portfolio, buatkan akun baru
    user = registerOrUpdateUser(normEmail, newPassword, normEmail.split('@')[0]);
    return { success: true, user };
  }
  user.passwordHash = hashPassword(newPassword);
  db.users[normEmail] = user;
  saveDatabase(db);
  await syncUserToSupabase(user);
  return { success: true, user };
}

export function saveUserPortfolio(
  identifier: { userId?: string; email?: string },
  data: UserPortfolioData
): boolean {
  try {
    const db = loadDatabase();
    const emailKey = identifier.email ? identifier.email.trim().toLowerCase() : null;
    let userIdKey = identifier.userId || null;

    if (!emailKey && !userIdKey) return false;

    // Cross-link userId dan email jika salah satu ditemukan di tabel users
    if (emailKey && !userIdKey && db.users[emailKey]) {
      userIdKey = db.users[emailKey].id;
    }
    if (userIdKey && !emailKey) {
      const foundUser = Object.values(db.users).find((u) => u.id === userIdKey);
      if (foundUser) {
        identifier.email = foundUser.email;
      }
    }

    const resolvedEmailKey = identifier.email ? identifier.email.trim().toLowerCase() : null;

    // CLOUD-FIRST: Deduplikasi holdings & orders secara ketat sebelum simpan
    const cleanHoldings = deduplicateHoldings(data.holdings || []);
    const cleanOrders = deduplicateOrders(data.orders || []);

    const payload: UserPortfolioData = {
      cash: typeof data.cash === 'number' ? data.cash : 0,
      realizedPL: typeof data.realizedPL === 'number' ? data.realizedPL : 0,
      holdings: cleanHoldings,
      orders: cleanOrders,
      conditionalOrders: Array.isArray(data.conditionalOrders) ? data.conditionalOrders : [],
      dividends: Array.isArray(data.dividends) ? data.dividends : [],
      lastUpdated: data.lastUpdated || Date.now(),
    };

    if (resolvedEmailKey) {
      db.portfolios[resolvedEmailKey] = payload;
    }
    if (userIdKey) {
      db.portfolios[userIdKey] = payload;
    }

    saveDatabase(db);

    // Sync langsung ke Supabase Cloud (Single Source of Truth)
    const targetUserId = userIdKey || resolvedEmailKey!;
    const targetEmail = resolvedEmailKey || userIdKey!;
    syncPortfolioToSupabase(targetUserId, targetEmail, payload);

    return true;
  } catch (err) {
    console.error('[SAVE USER PORTFOLIO ERROR]', err);
    return false;
  }
}

export function getUserPortfolio(identifier: { userId?: string; email?: string }): UserPortfolioData | null {
  try {
    const db = loadDatabase();
    const emailKey = identifier.email ? identifier.email.trim().toLowerCase() : null;
    const userIdKey = identifier.userId || null;

    // 1. Coba cari langsung dengan email di RAM
    if (emailKey && db.portfolios[emailKey]) {
      return db.portfolios[emailKey];
    }
    // 2. Coba cari dengan userId di RAM
    if (userIdKey && db.portfolios[userIdKey]) {
      return db.portfolios[userIdKey];
    }

    // 3. Coba resolusi silang: cari user id dari email atau sebaliknya
    if (emailKey && db.users[emailKey]) {
      const uId = db.users[emailKey].id;
      if (db.portfolios[uId]) return db.portfolios[uId];
    }
    if (userIdKey) {
      const foundUser = Object.values(db.users).find((u) => u.id === userIdKey);
      if (foundUser && db.portfolios[foundUser.email]) {
        return db.portfolios[foundUser.email];
      }
    }

    return null;
  } catch (err) {
    console.error('[GET USER PORTFOLIO ERROR]', err);
    return null;
  }
}

export async function getUserPortfolioAsync(identifier: { userId?: string; email?: string }): Promise<UserPortfolioData | null> {
  const emailKey = identifier.email ? identifier.email.trim().toLowerCase() : null;
  const userIdKey = identifier.userId || null;

  if (!emailKey && !userIdKey) return null;

  // 1. CLOUD-FIRST: Selalu ambil dari Supabase Cloud sebagai otoritas data tunggal
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      let query = supabase.from('user_portfolios').select('*');
      if (userIdKey && emailKey) {
        query = query.or(`user_id.eq.${userIdKey},email.eq.${emailKey}`);
      } else if (userIdKey) {
        query = query.eq('user_id', userIdKey);
      } else if (emailKey) {
        query = query.eq('email', emailKey);
      }

      const { data } = await query.maybeSingle();
      if (data) {
        const cloudPortfolio: UserPortfolioData = {
          cash: typeof data.cash === 'number' ? data.cash : (Number(data.cash) || 0),
          realizedPL: Number(data.realized_pl) || 0,
          holdings: deduplicateHoldings(Array.isArray(data.holdings) ? data.holdings : []),
          orders: deduplicateOrders(Array.isArray(data.orders) ? data.orders : []),
          conditionalOrders: Array.isArray(data.conditional_orders) ? data.conditional_orders : [],
          dividends: Array.isArray(data.dividends) ? data.dividends : [],
          lastUpdated: data.last_updated || Date.now(),
        };

        // Cache di RAM proses
        const db = loadDatabase();
        if (data.email) db.portfolios[data.email.toLowerCase()] = cloudPortfolio;
        if (data.user_id) db.portfolios[data.user_id] = cloudPortfolio;

        return cloudPortfolio;
      }
    } catch (err) {
      console.warn('[SUPABASE FETCH PORTFOLIO WARN]', err);
    }
  }

  // 2. Fallback memory RAM jika cloud tidak terjangkau
  const localPortfolio = getUserPortfolio(identifier);
  if (localPortfolio) return localPortfolio;

  return null;
}

export function resetUserPortfolio(identifier: { userId?: string; email?: string }, targetCash: number = 0): boolean {
  return saveUserPortfolio(identifier, {
    cash: targetCash,
    realizedPL: 0,
    holdings: [],
    orders: [],
    conditionalOrders: [],
    dividends: [],
    lastUpdated: Date.now(),
  });
}

/**
 * Hard Reset / Wipe seluruh akun dan data portofolio dari server & database.
 */
export async function wipeAllAccountsAndPortfolios(): Promise<{ usersWiped: number; portfoliosWiped: number }> {
  const currentDb = loadDatabase();
  const usersCount = Object.keys(currentDb.users || {}).length;
  const portfoliosCount = Object.keys(currentDb.portfolios || {}).length;

  inMemoryDb = {
    users: {},
    portfolios: {},
  };

  saveDatabase(inMemoryDb);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('holdings').delete().neq('symbol', '__NEVER_MATCH__');
      await supabase.from('orders').delete().neq('symbol', '__NEVER_MATCH__');
      await supabase.from('user_portfolios').delete().neq('email', '__NEVER_MATCH__');
      await supabase.from('app_users').delete().neq('email', '__NEVER_MATCH__');
    } catch (err) {
      console.warn('[SUPABASE GLOBAL WIPE WARN]', err);
    }
  }

  return { usersWiped: usersCount, portfoliosWiped: portfoliosCount };
}

/**
 * Hapus data akun dan portofolio member dari cache runtime memori lokal
 */
export function deleteUserAccountLocal(userId: string): void {
  const db = loadDatabase();
  let foundEmail: string | null = null;
  for (const [em, u] of Object.entries(db.users)) {
    if (u.id === userId) {
      foundEmail = em;
      break;
    }
  }
  if (foundEmail) {
    delete db.users[foundEmail];
    delete db.portfolios[foundEmail];
  }
  delete db.portfolios[userId];
  saveDatabase(db);
}

export interface ServerDepositRecord {
  id: string;
  user_id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  payment_method: string;
  proof_url?: string | null;
  notes?: string | null;
  rejection_reason?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

let serverDepositsList: ServerDepositRecord[] = [];

export function saveServerDeposit(record: ServerDepositRecord): void {
  const existingIdx = serverDepositsList.findIndex((d) => d.id === record.id);
  if (existingIdx >= 0) {
    serverDepositsList[existingIdx] = record;
  } else {
    serverDepositsList.unshift(record);
  }
}

export function getServerDeposits(): ServerDepositRecord[] {
  return [...serverDepositsList];
}

export function updateServerDepositStatus(
  depositId: string,
  status: 'APPROVED' | 'REJECTED',
  adminId: string = 'admin-system',
  reason?: string
): boolean {
  const target = serverDepositsList.find((d) => d.id === depositId);
  if (target) {
    target.status = status;
    target.updated_at = new Date().toISOString();
    if (status === 'APPROVED') {
      target.approved_by = adminId;
      target.approved_at = new Date().toISOString();
    } else {
      target.rejection_reason = reason;
      target.approved_by = adminId;
    }
    return true;
  }
  return false;
}

