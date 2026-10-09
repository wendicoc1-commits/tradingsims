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

let inMemoryDb: ServerDatabase | null = null;

function hashPassword(password: string): string {
  // Gunakan PBKDF2 (10.000 iterasi HMAC-SHA256) untuk mitigasi GPU rainbow-table & brute-force
  return 'pbkdf2$' + crypto.pbkdf2Sync(password, SALT, 10000, 32, 'sha256').toString('hex');
}

function safeCompareBuffers(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return a === b;
  }
}

function verifyPasswordHash(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || typeof storedHash !== 'string') return false;
    if (storedHash.startsWith('pbkdf2$')) {
      const computed = hashPassword(password);
      return safeCompareBuffers(computed, storedHash);
    }
    // Kompatibilitas mundur untuk hash SHA-256 legacy
    const legacyHash = crypto.createHash('sha256').update(password + SALT).digest('hex');
    if (safeCompareBuffers(legacyHash, storedHash)) return true;

    // Plain sha256 tanpa salt
    const plainSha256 = crypto.createHash('sha256').update(password).digest('hex');
    if (safeCompareBuffers(plainSha256, storedHash)) return true;

    // Plain sha1 & salted sha1 (kompatibilitas hash 40 karakter)
    const plainSha1 = crypto.createHash('sha1').update(password).digest('hex');
    if (safeCompareBuffers(plainSha1, storedHash)) return true;
    const saltSha1 = crypto.createHash('sha1').update(password + SALT).digest('hex');
    if (safeCompareBuffers(saltSha1, storedHash)) return true;

    // Fallback kecocokan plaintext langsung
    if (password === storedHash) return true;

    return false;
  } catch {
    return false;
  }
}

function ensureDataDirectory(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // Di serverless read-only disk fs.mkdirSync bisa gagal, itu wajar
  }
}

function loadDatabase(): ServerDatabase {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  const baseUsers = ((SEED_DATABASE as any)?.users || {}) as Record<string, StoredUser>;
  const basePortfolios = ((SEED_DATABASE as any)?.portfolios || {}) as Record<string, UserPortfolioData>;

  try {
    ensureDataDirectory();
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      inMemoryDb = {
        users: { ...baseUsers, ...(parsed.users || {}) },
        portfolios: { ...basePortfolios, ...(parsed.portfolios || {}) },
      };
      return inMemoryDb;
    }
  } catch (err) {
    console.warn('[PORTFOLIO STORAGE LOAD WARN, FALLING BACK TO SEED BUNDLE]', err);
  }

  inMemoryDb = {
    users: { ...baseUsers },
    portfolios: { ...basePortfolios },
  };
  return inMemoryDb;
}

function saveDatabase(db: ServerDatabase): void {
  inMemoryDb = db;
  try {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    // Handle read-only filesystem on serverless gracefully
  }
}

// Inisialisasi awal di memory
try {
  loadDatabase();
} catch {}

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

  // Jika portofolio belum ada untuk akun ini, beri modal awal standar Rp 100 Juta
  if (!db.portfolios[normEmail] && !db.portfolios[user.id]) {
    const initialPortfolio: UserPortfolioData = {
      cash: 100_000_000,
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

    const payload: UserPortfolioData = {
      cash: typeof data.cash === 'number' ? data.cash : 100_000_000,
      realizedPL: typeof data.realizedPL === 'number' ? data.realizedPL : 0,
      holdings: Array.isArray(data.holdings) ? data.holdings : [],
      orders: Array.isArray(data.orders) ? data.orders : [],
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

    // Sync ke Supabase Cloud
    if (userIdKey && resolvedEmailKey) {
      syncPortfolioToSupabase(userIdKey, resolvedEmailKey, payload);
    }

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

    // 1. Coba cari langsung dengan email
    if (emailKey && db.portfolios[emailKey]) {
      return db.portfolios[emailKey];
    }
    // 2. Coba cari dengan userId
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

    // 4. Fallback ke static seed data
    if (emailKey && (SEED_DATABASE as any)?.portfolios?.[emailKey]) {
      return (SEED_DATABASE as any).portfolios[emailKey];
    }
    if (userIdKey && (SEED_DATABASE as any)?.portfolios?.[userIdKey]) {
      return (SEED_DATABASE as any).portfolios[userIdKey];
    }

    return null;
  } catch (err) {
    console.error('[GET USER PORTFOLIO ERROR]', err);
    return null;
  }
}

export async function getUserPortfolioAsync(identifier: { userId?: string; email?: string }): Promise<UserPortfolioData | null> {
  // Coba baca dari memori lokal dulu
  const localPortfolio = getUserPortfolio(identifier);
  if (localPortfolio) return localPortfolio;

  // Jika belum ada di disk lokal (misal instance baru di hosting), ambil dari Supabase
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  try {
    const emailKey = identifier.email ? identifier.email.trim().toLowerCase() : null;
    const userIdKey = identifier.userId || null;

    let query = supabase.from('user_portfolios').select('*');
    if (userIdKey) {
      query = query.eq('user_id', userIdKey);
    } else if (emailKey) {
      query = query.eq('email', emailKey);
    } else {
      return null;
    }

    const { data } = await query.maybeSingle();
    if (data) {
      const cloudPortfolio: UserPortfolioData = {
        cash: Number(data.cash) || 100_000_000,
        realizedPL: Number(data.realized_pl) || 0,
        holdings: Array.isArray(data.holdings) ? data.holdings : [],
        orders: Array.isArray(data.orders) ? data.orders : [],
        conditionalOrders: Array.isArray(data.conditional_orders) ? data.conditional_orders : [],
        dividends: Array.isArray(data.dividends) ? data.dividends : [],
        lastUpdated: data.last_updated || Date.now(),
      };

      // Simpan ke cache lokal
      saveUserPortfolio({ userId: data.user_id, email: data.email }, cloudPortfolio);
      return cloudPortfolio;
    }
  } catch (err) {
    console.warn('[SUPABASE FETCH PORTFOLIO WARN]', err);
  }

  return null;
}

export function resetUserPortfolio(identifier: { userId?: string; email?: string }, targetCash: number = 100_000_000): boolean {
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
