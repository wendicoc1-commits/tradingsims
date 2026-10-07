-- ==============================================================================
-- FINCEPT / TRADESIM PRO — SUPABASE DATABASE HARDENING & AI VECTOR PREPARATION
-- ==============================================================================
-- Script ini siap dieksekusi langsung di Supabase SQL Editor.
-- Meliputi:
-- 1. Skema Tabel Inti (users, portfolios, transactions) jika belum dibuat
-- 2. Stored Procedure RPC Atomic & Anti-Race-Condition (execute_trade)
-- 3. Row Level Security (RLS) Sangat Ketat
-- 4. Inisialisasi pgvector (OpenAI 1536 dim) + ai_trading_journals + HNSW Index & RAG Query
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- BAGIAN 0: PERSIAPAN EKSTENSI & SKEMA TABEL INTI
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Ekstensi UUID & PGVECTOR
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabel users (Akun Member & Saldo Kas)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  cash_balance NUMERIC(18, 2) NOT NULL DEFAULT 100000000.00 CHECK (cash_balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel portfolios (Kepemilikan Saham & Moving Average Price)
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ticker VARCHAR(20) NOT NULL,
  total_lots NUMERIC(14, 4) NOT NULL DEFAULT 0 CHECK (total_lots >= 0),
  average_price NUMERIC(18, 4) NOT NULL DEFAULT 0 CHECK (average_price >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_ticker UNIQUE (user_id, ticker)
);

-- Index performa pencarian posisi portofolio
CREATE INDEX IF NOT EXISTS idx_portfolios_user_ticker ON public.portfolios(user_id, ticker);

-- 4. Tabel transactions (Ledger Riwayat Transaksi Audit)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ticker VARCHAR(20) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  price NUMERIC(18, 2) NOT NULL CHECK (price > 0),
  lots NUMERIC(14, 4) NOT NULL CHECK (lots > 0),
  total_amount NUMERIC(18, 2) NOT NULL CHECK (total_amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index performa query riwayat transaksi
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON public.transactions(user_id, created_at DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- BAGIAN 1: TRANSAKSI AMAN BERBASIS RPC (ANTI-RACE-CONDITION)
-- ─────────────────────────────────────────────────────────────────────────────

/**
 * execute_trade
 * Menjalankan order BUY atau SELL secara atomik dalam 1 transaksi PostgreSQL:
 * - Menggunakan Pessimistic Row-Locking (FOR UPDATE) pada users & portfolios
 *   untuk mencegah Race Condition (Double Spending / Saldo Negatif).
 * - Menghitung ulang Moving Average Price secara matematis saat BUY.
 * - Mengurangi lot dan otomatis DELETE baris portfolio jika lot habis saat SELL.
 * - SECURITY DEFINER: Berjalan dengan hak istimewa schema owner, sehingga
 *   client frontend tidak membutuhkan akses update langsung ke cash_balance.
 */
CREATE OR REPLACE FUNCTION public.execute_trade(
  p_user_id UUID,
  p_ticker VARCHAR,
  p_type VARCHAR,
  p_price NUMERIC,
  p_lots NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_clean_ticker VARCHAR;
  v_trade_type VARCHAR;
  v_total_shares NUMERIC;
  v_total_amount NUMERIC;
  v_current_cash NUMERIC;
  v_new_cash NUMERIC;
  v_current_lots NUMERIC;
  v_current_avg_price NUMERIC;
  v_new_lots NUMERIC;
  v_new_avg_price NUMERIC;
  v_transaction_id UUID;
  v_caller_uid UUID;
BEGIN
  -- 1. Validasi Keamanan Akses (Cegah Eksekusi ID Pengguna Lain)
  v_caller_uid := auth.uid();
  IF v_caller_uid IS NOT NULL AND v_caller_uid <> p_user_id THEN
    RAISE EXCEPTION 'Akses Ditolak: Anda tidak dapat mengeksekusi order atas nama akun lain.'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Sanitasi Parameter Input
  v_clean_ticker := UPPER(TRIM(p_ticker));
  v_trade_type := UPPER(TRIM(p_type));

  IF v_clean_ticker IS NULL OR LENGTH(v_clean_ticker) = 0 THEN
    RAISE EXCEPTION 'Ticker saham tidak boleh kosong.' USING ERRCODE = '22023';
  END IF;

  IF v_trade_type NOT IN ('BUY', 'SELL') THEN
    RAISE EXCEPTION 'Tipe transaksi harus bernilai BUY atau SELL (diterima: %)', p_type
      USING ERRCODE = '22023';
  END IF;

  IF p_price <= 0 THEN
    RAISE EXCEPTION 'Harga per lembar saham harus lebih besar dari 0.' USING ERRCODE = '22003';
  END IF;

  IF p_lots <= 0 THEN
    RAISE EXCEPTION 'Jumlah lot harus lebih besar dari 0.' USING ERRCODE = '22003';
  END IF;

  -- 1 Lot = 100 Lembar Saham (Konvensi Bursa)
  v_total_shares := p_lots * 100;
  v_total_amount := ROUND(p_price * v_total_shares, 2);

  -- ───────────────────────────────────────────────────────────────────────────
  -- LOGIKA EKSEKUSI PEMBELIAN (BUY)
  -- ───────────────────────────────────────────────────────────────────────────
  IF v_trade_type = 'BUY' THEN
    -- A. Kunci baris user (FOR UPDATE) untuk mencegah Race Condition Saldo
    SELECT cash_balance
    INTO v_current_cash
    FROM public.users
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'User dengan ID % tidak ditemukan di sistem.', p_user_id
        USING ERRCODE = 'P0002';
    END IF;

    -- B. Validasi Kecukupan Saldo Kas
    IF v_current_cash < v_total_amount THEN
      RAISE EXCEPTION 'Saldo kas tidak mencukupi. Saldo saat ini: Rp %, Total biaya beli: Rp %',
        TO_CHAR(v_current_cash, 'FM999,999,999,999.00'),
        TO_CHAR(v_total_amount, 'FM999,999,999,999.00')
        USING ERRCODE = 'P0001';
    END IF;

    -- C. Potong Saldo Kas
    UPDATE public.users
    SET cash_balance = cash_balance - v_total_amount,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING cash_balance INTO v_new_cash;

    -- D. Catat ke Tabel Transactions
    INSERT INTO public.transactions (user_id, ticker, type, price, lots, total_amount, created_at)
    VALUES (p_user_id, v_clean_ticker, 'BUY', p_price, p_lots, v_total_amount, NOW())
    RETURNING id INTO v_transaction_id;

    -- E. Kunci & Periksa Portofolio Eksisting (FOR UPDATE)
    SELECT total_lots, average_price
    INTO v_current_lots, v_current_avg_price
    FROM public.portfolios
    WHERE user_id = p_user_id AND ticker = v_clean_ticker
    FOR UPDATE;

    IF FOUND THEN
      -- Hitung Moving Average Price:
      -- ((Existing_Price * Existing_Lots) + (New_Price * New_Lots)) / (Existing_Lots + New_Lots)
      v_new_lots := v_current_lots + p_lots;
      v_new_avg_price := ROUND(
        ((v_current_avg_price * v_current_lots) + (p_price * p_lots)) / v_new_lots,
        4
      );

      UPDATE public.portfolios
      SET total_lots = v_new_lots,
          average_price = v_new_avg_price,
          updated_at = NOW()
      WHERE user_id = p_user_id AND ticker = v_clean_ticker;
    ELSE
      -- Posisi Baru (Insert)
      v_new_lots := p_lots;
      v_new_avg_price := p_price;

      INSERT INTO public.portfolios (user_id, ticker, total_lots, average_price, updated_at)
      VALUES (p_user_id, v_clean_ticker, v_new_lots, v_new_avg_price, NOW());
    END IF;

  -- ───────────────────────────────────────────────────────────────────────────
  -- LOGIKA EKSEKUSI PENJUALAN (SELL)
  -- ───────────────────────────────────────────────────────────────────────────
  ELSIF v_trade_type = 'SELL' THEN
    -- A. Kunci baris portofolio saham (FOR UPDATE)
    SELECT total_lots, average_price
    INTO v_current_lots, v_current_avg_price
    FROM public.portfolios
    WHERE user_id = p_user_id AND ticker = v_clean_ticker
    FOR UPDATE;

    IF NOT FOUND OR v_current_lots <= 0 THEN
      RAISE EXCEPTION 'Aset % tidak ditemukan di portofolio Anda.', v_clean_ticker
        USING ERRCODE = 'P0001';
    END IF;

    -- B. Validasi Kecukupan Lot Portofolio
    IF v_current_lots < p_lots THEN
      RAISE EXCEPTION 'Jumlah lot tidak mencukupi untuk dijual. Dimiliki: % lot, Ingin dijual: % lot.',
        v_current_lots, p_lots
        USING ERRCODE = 'P0001';
    END IF;

    -- C. Kunci baris user dan Tambahkan Saldo Kas Hasil Penjualan
    SELECT cash_balance
    INTO v_current_cash
    FROM public.users
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'User dengan ID % tidak ditemukan di sistem.', p_user_id
        USING ERRCODE = 'P0002';
    END IF;

    UPDATE public.users
    SET cash_balance = cash_balance + v_total_amount,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING cash_balance INTO v_new_cash;

    -- D. Catat ke Tabel Transactions
    INSERT INTO public.transactions (user_id, ticker, type, price, lots, total_amount, created_at)
    VALUES (p_user_id, v_clean_ticker, 'SELL', p_price, p_lots, v_total_amount, NOW())
    RETURNING id INTO v_transaction_id;

    -- E. Kurangi Lot Portofolio atau HAPUS Baris Jika Lot Menjadi 0
    v_new_lots := v_current_lots - p_lots;

    IF v_new_lots <= 0.000001 THEN
      DELETE FROM public.portfolios
      WHERE user_id = p_user_id AND ticker = v_clean_ticker;
      v_new_lots := 0;
    ELSE
      UPDATE public.portfolios
      SET total_lots = v_new_lots,
          updated_at = NOW()
      WHERE user_id = p_user_id AND ticker = v_clean_ticker;
    END IF;
  END IF;

  -- Return respon terstruktur JSON
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'ticker', v_clean_ticker,
    'type', v_trade_type,
    'price', p_price,
    'lots', p_lots,
    'total_amount', v_total_amount,
    'remaining_lots', v_new_lots,
    'average_price', COALESCE(v_new_avg_price, v_current_avg_price),
    'new_cash_balance', v_new_cash,
    'timestamp', NOW()
  );
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- BAGIAN 2: PENGATURAN ROW LEVEL SECURITY (RLS) SANGAT KETAT
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Aktifkan RLS pada seluruh tabel transaksi dan portofolio
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 2. Bersihkan Kebijakan Lama (Idempotent Migration)
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile non-financial" ON public.users;
DROP POLICY IF EXISTS "Users can read own portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Users can read own transactions" ON public.transactions;

-- 3. Kebijakan Tabel USERS
-- Member hanya boleh SELECT data profil miliknya sendiri
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Member boleh UPDATE profil umum (misal: nama), TETAPI dilarang keras mengubah cash_balance langsung!
-- Pengubahan saldo kas HANYA bisa lewat execute_trade (SECURITY DEFINER)
CREATE POLICY "Users can update own profile non-financial"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Validasi ketat: cash_balance tidak boleh diubah lewat query direct client
    cash_balance = (SELECT u.cash_balance FROM public.users u WHERE u.id = auth.uid())
  );

-- 4. Kebijakan Tabel PORTFOLIOS
-- Member hanya boleh SELECT portofolio miliknya sendiri
CREATE POLICY "Users can read own portfolios"
  ON public.portfolios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- CATATAN KEAMANAN PENTING:
-- TIDAK ADA kebijakan INSERT / UPDATE / DELETE untuk role authenticated di tabel portfolios.
-- Dengan begitu, seluruh manipulasi posisi HANYA bisa dilakukan melalui RPC execute_trade.

-- 5. Kebijakan Tabel TRANSACTIONS
-- Member hanya boleh SELECT riwayat transaksi miliknya sendiri
CREATE POLICY "Users can read own transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- TIDAK ADA kebijakan INSERT / UPDATE / DELETE untuk role authenticated di tabel transactions.
-- Ledger transaksi bersifat Append-Only melalui RPC execute_trade.


-- ─────────────────────────────────────────────────────────────────────────────
-- BAGIAN 3: PERSIAPAN OTAK AI (PGVECTOR MEMORY)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Buat Tabel Jurnal Trading AI
CREATE TABLE IF NOT EXISTS public.ai_trading_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker VARCHAR(20) NOT NULL,
  trade_result VARCHAR(10) NOT NULL CHECK (trade_result IN ('WIN', 'LOSS')),
  pnl_percentage NUMERIC(8, 2) NOT NULL,
  reflection_text TEXT NOT NULL,
  embedding vector(1536), -- Dimensi standar model OpenAI (text-embedding-ada-002 / text-embedding-3-small)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index HNSW (Hierarchical Navigable Small World) untuk Pencarian Vektor Super Cepat
CREATE INDEX IF NOT EXISTS idx_ai_trading_journals_embedding_hnsw
  ON public.ai_trading_journals
  USING hnsw (embedding vector_cosine_ops);

-- Index metadata untuk filtering hybrid
CREATE INDEX IF NOT EXISTS idx_ai_trading_journals_ticker ON public.ai_trading_journals(ticker);
CREATE INDEX IF NOT EXISTS idx_ai_trading_journals_result ON public.ai_trading_journals(trade_result);

-- 3. Row Level Security untuk AI Memory
ALTER TABLE public.ai_trading_journals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on ai_trading_journals" ON public.ai_trading_journals;
DROP POLICY IF EXISTS "Authenticated users cannot access raw ai memory" ON public.ai_trading_journals;

-- Hanya Backend AI / Service Role yang diizinkan menulis dan membaca memori AI secara bebas
CREATE POLICY "Service role full access on ai_trading_journals"
  ON public.ai_trading_journals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Fungsi RAG Helper (Retrieval-Augmented Generation) untuk Otak AI
-- Digunakan oleh AI agent untuk mencari pelajaran trading masa lalu yang mirip dengan situasi pasar saat ini
CREATE OR REPLACE FUNCTION public.match_trading_journals(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.65,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  ticker VARCHAR,
  trade_result VARCHAR,
  pnl_percentage NUMERIC,
  reflection_text TEXT,
  similarity FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.ticker,
    j.trade_result,
    j.pnl_percentage,
    j.reflection_text,
    ROUND((1 - (j.embedding <=> query_embedding))::NUMERIC, 4)::FLOAT AS similarity,
    j.created_at
  FROM public.ai_trading_journals j
  WHERE j.embedding IS NOT NULL
    AND (1 - (j.embedding <=> query_embedding)) > match_threshold
  ORDER BY j.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;

-- Berikan izin akses RPC ke authenticated user untuk berkonsultasi dengan ingatan AI
GRANT EXECUTE ON FUNCTION public.execute_trade(UUID, VARCHAR, VARCHAR, NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_trading_journals(vector, FLOAT, INT) TO authenticated, service_role;
