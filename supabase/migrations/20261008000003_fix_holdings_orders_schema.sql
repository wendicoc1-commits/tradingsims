-- ==============================================================================
-- FINCEPT / TRADESIM PRO — SCHEMA REPAIR & MULTI-ASSET RESILIENCE
-- Mencegah Error 42703: column "shares" does not exist & Menjamin Sinkronisasi Kas
-- ==============================================================================

-- 1. TABEL PROFILES (Pastikan ada & kompatibel)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  auth_provider TEXT DEFAULT 'email',
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL PORTFOLIOS (Menyimpan Saldo Kas RDN Simulasi)
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  cash NUMERIC NOT NULL DEFAULT 100000000,
  realized_pl NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom cash & realized_pl selalu tersedia
ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS cash NUMERIC NOT NULL DEFAULT 100000000;
ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS realized_pl NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Jika sebelumnya ada kolom ticker di portfolios yang NOT NULL, buat menjadi NULLABLE agar tidak memblokir simpan kas
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'portfolios' AND column_name = 'ticker'
  ) THEN
    ALTER TABLE public.portfolios ALTER COLUMN ticker DROP NOT NULL;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 3. TABEL USERS (Kompatibilitas fallback saldo)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  cash_balance NUMERIC(18, 2) NOT NULL DEFAULT 100000000.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cash_balance NUMERIC(18, 2) NOT NULL DEFAULT 100000000.00;

-- 4. TABEL HOLDINGS (Posisi Portofolio Saham & Crypto)
CREATE TABLE IF NOT EXISTS public.holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  display_symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  avg_price NUMERIC NOT NULL,
  lots NUMERIC DEFAULT 0,
  shares NUMERIC DEFAULT 0,
  crypto_units NUMERIC,
  asset_class TEXT DEFAULT 'EQUITY',
  currency TEXT DEFAULT 'IDR',
  exchange_rate NUMERIC DEFAULT 16000,
  take_profit_price NUMERIC,
  stop_loss_price NUMERIC,
  validity_type TEXT DEFAULT 'GTC',
  total_dividend_earned NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, symbol)
);

-- Tambahkan kolom shares dan kolom crypto secara aman jika belum ada
ALTER TABLE public.holdings ADD COLUMN IF NOT EXISTS shares NUMERIC DEFAULT 0;
ALTER TABLE public.holdings ADD COLUMN IF NOT EXISTS lots NUMERIC DEFAULT 0;
ALTER TABLE public.holdings ADD COLUMN IF NOT EXISTS crypto_units NUMERIC;
ALTER TABLE public.holdings ADD COLUMN IF NOT EXISTS asset_class TEXT DEFAULT 'EQUITY';
ALTER TABLE public.holdings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'IDR';
ALTER TABLE public.holdings ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC DEFAULT 16000;
ALTER TABLE public.holdings ADD COLUMN IF NOT EXISTS take_profit_price NUMERIC;
ALTER TABLE public.holdings ADD COLUMN IF NOT EXISTS stop_loss_price NUMERIC;
ALTER TABLE public.holdings ADD COLUMN IF NOT EXISTS validity_type TEXT DEFAULT 'GTC';
ALTER TABLE public.holdings ADD COLUMN IF NOT EXISTS total_dividend_earned NUMERIC DEFAULT 0;

-- Pastikan tipe lots adalah NUMERIC agar mendukung pecahan koin crypto (misal 0.05 BTC)
DO $$
BEGIN
  ALTER TABLE public.holdings ALTER COLUMN lots TYPE NUMERIC USING lots::NUMERIC;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 5. TABEL ORDERS (Riwayat Transaksi)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  display_symbol TEXT NOT NULL,
  type TEXT NOT NULL,
  order_type TEXT DEFAULT 'LIMIT',
  price NUMERIC NOT NULL,
  lots NUMERIC NOT NULL,
  shares NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  fee NUMERIC DEFAULT 0,
  broker_fee NUMERIC DEFAULT 0,
  tax_fee NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'FILLED',
  realized_pl NUMERIC,
  asset_class TEXT DEFAULT 'EQUITY',
  currency TEXT DEFAULT 'IDR',
  crypto_units NUMERIC,
  exchange_rate NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  filled_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambahkan kolom shares dan kolom lainnya di orders jika belum ada
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shares NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS lots NUMERIC DEFAULT 1;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fee NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS broker_fee NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax_fee NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS asset_class TEXT DEFAULT 'EQUITY';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'IDR';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS crypto_units NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC;

DO $$
BEGIN
  ALTER TABLE public.orders ALTER COLUMN lots TYPE NUMERIC USING lots::NUMERIC;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 6. PERBAIKI POLICIES RLS (ROW LEVEL SECURITY)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Portfolios Policies
  DROP POLICY IF EXISTS "Users can manage their own portfolio" ON public.portfolios;
  CREATE POLICY "Users can manage their own portfolio" ON public.portfolios
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  -- Holdings Policies
  DROP POLICY IF EXISTS "Users can manage their own holdings" ON public.holdings;
  CREATE POLICY "Users can manage their own holdings" ON public.holdings
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  -- Orders Policies
  DROP POLICY IF EXISTS "Users can manage their own orders" ON public.orders;
  CREATE POLICY "Users can manage their own orders" ON public.orders
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
