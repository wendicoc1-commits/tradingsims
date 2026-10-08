-- ==============================================================================
-- TradeSim Pro Workstation - Production Database Schema (Supabase PostgreSQL)
-- Jalankan skrip ini di Supabase SQL Editor jika tabel belum dibuat.
-- ==============================================================================

-- 1. Tabel Akun Pengguna Terdaftar
CREATE TABLE IF NOT EXISTS public.app_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'Member Trader',
  role TEXT NOT NULL DEFAULT 'member',
  provider TEXT NOT NULL DEFAULT 'email',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indeks pencarian cepat email
CREATE INDEX IF NOT EXISTS idx_app_users_email ON public.app_users (LOWER(email));

-- 2. Tabel Portofolio Pengguna (Single Source of Truth Multi-Device Sync)
CREATE TABLE IF NOT EXISTS public.user_portfolios (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  cash NUMERIC(18, 2) NOT NULL DEFAULT 100000000.00,
  realized_pl NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
  holdings JSONB NOT NULL DEFAULT '[]'::jsonb,
  orders JSONB NOT NULL DEFAULT '[]'::jsonb,
  conditional_orders JSONB NOT NULL DEFAULT '[]'::jsonb,
  dividends JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_updated BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indeks pencarian portofolio berdasarkan email
CREATE INDEX IF NOT EXISTS idx_user_portfolios_email ON public.user_portfolios (LOWER(email));

-- 3. Tabel Riwayat Order Individual (Audit Trail)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  display_symbol TEXT NOT NULL,
  type TEXT NOT NULL,
  order_type TEXT NOT NULL DEFAULT 'MARKET',
  price NUMERIC(18, 6) NOT NULL,
  lots NUMERIC(18, 6) NOT NULL,
  shares NUMERIC(18, 6) NOT NULL,
  total NUMERIC(18, 2) NOT NULL,
  fee NUMERIC(18, 2) NOT NULL DEFAULT 0,
  broker_fee NUMERIC(18, 2) NOT NULL DEFAULT 0,
  tax_fee NUMERIC(18, 2) NOT NULL DEFAULT 0,
  take_profit_price NUMERIC(18, 6),
  stop_loss_price NUMERIC(18, 6),
  validity_type TEXT NOT NULL DEFAULT 'GTC',
  asset_class TEXT NOT NULL DEFAULT 'EQUITY',
  currency TEXT NOT NULL DEFAULT 'IDR',
  exchange_rate NUMERIC(18, 2) NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'FILLED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  filled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_symbol ON public.orders (symbol);

-- 4. Enable Row Level Security (RLS) dengan Public Service Bypass
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses anon key untuk TradeSim server API
CREATE POLICY "Allow public anon access for app_users"
  ON public.app_users FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public anon access for user_portfolios"
  ON public.user_portfolios FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public anon access for orders"
  ON public.orders FOR ALL USING (true) WITH CHECK (true);
