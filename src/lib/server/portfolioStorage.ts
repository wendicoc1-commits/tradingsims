import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { PortfolioHolding, Order, ConditionalOrder, DividendRecord } from '@/types';

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

interface ServerDatabase {
  users: Record<string, StoredUser>; // keyed by email (lowercase)
  portfolios: Record<string, UserPortfolioData>; // keyed by user id AND by email
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DB_FILE = path.join(DATA_DIR, 'server_user_portfolios.json');

const SALT = 'tradingsims_cloud_sync_salt_v1';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + SALT).digest('hex');
}

function ensureDataDirectory(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[PORTFOLIO STORAGE MKDIR WARN]', err);
  }
}

function loadDatabase(): ServerDatabase {
  try {
    ensureDataDirectory();
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        users: parsed.users || {},
        portfolios: parsed.portfolios || {},
      };
    } else {
      // Inisialisasi awal file JSON database jika belum ada
      const initialDb: ServerDatabase = { users: {}, portfolios: {} };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
  } catch (err) {
    console.error('[PORTFOLIO STORAGE LOAD ERROR]', err);
  }
  return { users: {}, portfolios: {} };
}

function saveDatabase(db: ServerDatabase): void {
  try {
    ensureDataDirectory();
    // Tulis langsung ke DB_FILE secara sinkron dan aman
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[PORTFOLIO STORAGE SAVE ERROR]', err);
  }
}

// Inisialisasi awal saat modul dimuat di Node runtime
try {
  loadDatabase();
} catch {}

export function getUserByEmail(email: string): StoredUser | null {
  if (!email) return null;
  const normEmail = email.trim().toLowerCase();
  const db = loadDatabase();
  return db.users[normEmail] || null;
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
  return user;
}

export function verifyUserPassword(email: string, password: string): { valid: boolean; user: StoredUser | null } {
  const normEmail = email.trim().toLowerCase();
  const db = loadDatabase();
  const user = db.users[normEmail];
  if (!user) {
    return { valid: false, user: null };
  }
  const inputHash = hashPassword(password);
  const valid = inputHash === user.passwordHash;
  return { valid, user: valid ? user : null };
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

    return null;
  } catch (err) {
    console.error('[GET USER PORTFOLIO ERROR]', err);
    return null;
  }
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
