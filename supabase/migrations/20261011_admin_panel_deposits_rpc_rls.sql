-- ==============================================================================
-- Migration: Admin Panel - Deposits Verification, ACID RPC, & Hardened RLS
-- File: supabase/migrations/20261011_admin_panel_deposits_rpc_rls.sql
-- ==============================================================================

-- 1. Pastikan tabel deposits tersedia jika belum dibuat
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  payment_method TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
  proof_url TEXT,
  notes TEXT,
  rejection_reason TEXT,
  approved_by TEXT REFERENCES public.app_users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON public.deposits(created_at DESC);

-- 2. Pastikan tabel portfolio_transactions tersedia untuk audit ledger
CREATE TABLE IF NOT EXISTS public.portfolio_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'BUY', 'SELL', 'DIVIDEND', 'DEPOSIT', 'RESET'
  ticker VARCHAR(30) NOT NULL,
  lots INT NOT NULL DEFAULT 0,
  shares_or_amount NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL,
  total_cash_impact NUMERIC NOT NULL,
  balance_before NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  order_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_user_id ON public.portfolio_transactions(user_id);

-- 3. Helper Function: Cek Apakah Caller Memiliki Role 'admin'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Cek via auth.uid() di app_users
  RETURN EXISTS (
    SELECT 1 FROM public.app_users
    WHERE id = auth.uid()::text AND role = 'admin'
  );
END;
$$;

-- 4. PostgreSQL Function (RPC): approve_deposit (ACID / Atomic Transaction)
CREATE OR REPLACE FUNCTION public.approve_deposit(
  deposit_id UUID,
  admin_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deposit RECORD;
  v_user_email TEXT;
  v_current_cash NUMERIC(18, 2);
  v_new_cash NUMERIC(18, 2);
  v_admin_role TEXT;
BEGIN
  -- A. Validasi Otoritas Admin Pemanggil
  IF admin_id IS NOT NULL AND admin_id <> '' THEN
    SELECT role INTO v_admin_role FROM public.app_users WHERE id = admin_id;
    IF v_admin_role IS NULL OR v_admin_role <> 'admin' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Akses ditolak: Hanya administrator yang diizinkan memverifikasi deposit'
      );
    END IF;
  END IF;

  -- B. Kunci baris transaksi deposit dengan FOR UPDATE untuk mencegah Race Condition / Double-Spend
  SELECT * INTO v_deposit
  FROM public.deposits
  WHERE id = deposit_id
  FOR UPDATE;

  -- Validasi apakah tiket deposit ditemukan
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Data deposit tidak ditemukan'
    );
  END IF;

  -- C. Verifikasi Status Transaksi: Wajib 'PENDING'
  IF v_deposit.status <> 'PENDING' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Deposit tidak dapat disetujui karena status saat ini adalah %s', v_deposit.status)
    );
  END IF;

  -- D. Kunci baris portofolio member dengan FOR UPDATE
  SELECT cash, email INTO v_current_cash, v_user_email
  FROM public.user_portfolios
  WHERE user_id = v_deposit.user_id
  FOR UPDATE;

  -- Jika portofolio belum ada, ambil email dari app_users dan inisialisasi baris baru
  IF NOT FOUND THEN
    SELECT email INTO v_user_email FROM public.app_users WHERE id = v_deposit.user_id;
    IF v_user_email IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Akun member pemilik deposit tidak ditemukan di sistem'
      );
    END IF;

    v_current_cash := 0.00;
    INSERT INTO public.user_portfolios (
      user_id, email, cash, realized_pl, holdings, orders, updated_at
    ) VALUES (
      v_deposit.user_id, v_user_email, v_deposit.amount, 0.00, '[]'::jsonb, '[]'::jsonb, timezone('utc'::text, now())
    );
    v_new_cash := v_deposit.amount;
  ELSE
    -- Tambahkan nominal deposit secara langsung ke kolom cash saldo wallet member
    v_new_cash := v_current_cash + v_deposit.amount;
    UPDATE public.user_portfolios
    SET cash = v_new_cash,
        updated_at = timezone('utc'::text, now())
    WHERE user_id = v_deposit.user_id;
  END IF;

  -- E. Update Status Deposit menjadi 'APPROVED' beserta metadata approval
  UPDATE public.deposits
  SET status = 'APPROVED',
      approved_by = admin_id,
      approved_at = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  WHERE id = deposit_id;

  -- F. Catat ke Audit Ledger (portfolio_transactions)
  INSERT INTO public.portfolio_transactions (
    user_id,
    email,
    transaction_type,
    ticker,
    lots,
    shares_or_amount,
    price,
    total_cash_impact,
    balance_before,
    balance_after,
    order_id,
    notes,
    created_at
  ) VALUES (
    v_deposit.user_id,
    COALESCE(v_user_email, 'unknown'),
    'DEPOSIT',
    'IDR_CASH',
    0,
    v_deposit.amount,
    1,
    v_deposit.amount,
    v_current_cash,
    v_new_cash,
    v_deposit.id::text,
    format('Deposit disetujui oleh admin ID: %s via %s', COALESCE(admin_id, 'SYSTEM'), v_deposit.payment_method),
    timezone('utc'::text, now())
  );

  -- G. Return Respon Sukses Atomik
  RETURN jsonb_build_object(
    'success', true,
    'deposit_id', deposit_id,
    'user_id', v_deposit.user_id,
    'amount', v_deposit.amount,
    'previous_cash', v_current_cash,
    'new_cash', v_new_cash,
    'approved_at', timezone('utc'::text, now())
  );
END;
$$;

-- 5. PostgreSQL Function (RPC): reject_deposit
CREATE OR REPLACE FUNCTION public.reject_deposit(
  deposit_id UUID,
  admin_id TEXT,
  rejection_notes TEXT DEFAULT 'Ditolak oleh admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deposit RECORD;
  v_admin_role TEXT;
BEGIN
  -- Validasi Otoritas Admin
  IF admin_id IS NOT NULL AND admin_id <> '' THEN
    SELECT role INTO v_admin_role FROM public.app_users WHERE id = admin_id;
    IF v_admin_role IS NULL OR v_admin_role <> 'admin' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Akses ditolak: Hanya administrator yang diizinkan menolak deposit'
      );
    END IF;
  END IF;

  -- Lock row deposit dengan FOR UPDATE
  SELECT * INTO v_deposit
  FROM public.deposits
  WHERE id = deposit_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Data deposit tidak ditemukan');
  END IF;

  IF v_deposit.status <> 'PENDING' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Deposit tidak dapat ditolak karena status saat ini adalah %s', v_deposit.status)
    );
  END IF;

  UPDATE public.deposits
  SET status = 'REJECTED',
      rejection_reason = rejection_notes,
      approved_by = admin_id,
      updated_at = timezone('utc'::text, now())
  WHERE id = deposit_id;

  RETURN jsonb_build_object(
    'success', true,
    'deposit_id', deposit_id,
    'status', 'REJECTED',
    'rejection_reason', rejection_notes
  );
END;
$$;

-- ==============================================================================
-- 6. Row Level Security (RLS) Policies
-- ==============================================================================

-- Aktifkan RLS
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_transactions ENABLE ROW LEVEL SECURITY;

-- Drop policy lama agar bersih
DROP POLICY IF EXISTS "Member can view own deposits or admin all" ON public.deposits;
DROP POLICY IF EXISTS "Member can create own deposits" ON public.deposits;
DROP POLICY IF EXISTS "Admin can update deposits" ON public.deposits;
DROP POLICY IF EXISTS "Member view own portfolio or admin all" ON public.user_portfolios;
DROP POLICY IF EXISTS "Admin can manage all portfolios" ON public.user_portfolios;
DROP POLICY IF EXISTS "Member view own user or admin all" ON public.app_users;

-- Policy A: deposits
-- Member hanya dapat melihat deposit miliknya, Admin dapat melihat seluruh deposit
CREATE POLICY "Member can view own deposits or admin all"
  ON public.deposits FOR SELECT
  USING (
    auth.uid()::text = user_id
    OR public.is_admin()
  );

-- Member dapat mengajukan permohonan deposit baru
CREATE POLICY "Member can create own deposits"
  ON public.deposits FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id
  );

-- Hanya admin yang dapat mengubah status deposit
CREATE POLICY "Admin can update deposits"
  ON public.deposits FOR UPDATE
  USING (
    public.is_admin()
  );

-- Policy B: user_portfolios
-- Member hanya membaca portofolionya sendiri, Admin dapat membaca seluruh portofolio member
CREATE POLICY "Member view own portfolio or admin all"
  ON public.user_portfolios FOR SELECT
  USING (
    auth.uid()::text = user_id 
    OR auth.jwt() ->> 'email' = email
    OR public.is_admin()
  );

-- Member update portofolio miliknya sendiri, Admin dapat update semua
CREATE POLICY "Admin can manage all portfolios"
  ON public.user_portfolios FOR ALL
  USING (
    auth.uid()::text = user_id 
    OR auth.jwt() ->> 'email' = email
    OR public.is_admin()
  );

-- Policy C: app_users
-- Member hanya membaca profilnya sendiri, Admin dapat membaca seluruh user
CREATE POLICY "Member view own user or admin all"
  ON public.app_users FOR SELECT
  USING (
    auth.uid()::text = id 
    OR auth.jwt() ->> 'email' = email
    OR public.is_admin()
  );

-- ==============================================================================
-- 7. POSTGRESQL FUNCTION (RPC): admin_reset_member_to_zero
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_reset_member_to_zero(
  p_user_id TEXT,
  p_admin_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_role TEXT;
  v_user RECORD;
  v_current_cash NUMERIC(18, 2);
BEGIN
  IF p_admin_id IS NOT NULL AND p_admin_id <> '' THEN
    SELECT role INTO v_admin_role FROM public.app_users WHERE id = p_admin_id;
    IF v_admin_role IS NULL OR v_admin_role <> 'admin' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Akses ditolak: Hanya admin yang diizinkan');
    END IF;
  END IF;

  SELECT * INTO v_user FROM public.app_users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Member tidak ditemukan');
  END IF;

  SELECT cash INTO v_current_cash FROM public.user_portfolios WHERE user_id = p_user_id FOR UPDATE;

  UPDATE public.user_portfolios
  SET cash = 0.00,
      realized_pl = 0.00,
      holdings = '[]'::jsonb,
      orders = '[]'::jsonb,
      conditional_orders = '[]'::jsonb,
      dividends = '[]'::jsonb,
      last_updated = (extract(epoch from now()) * 1000)::bigint,
      updated_at = timezone('utc'::text, now())
  WHERE user_id = p_user_id;

  DELETE FROM public.orders WHERE user_id = p_user_id;

  INSERT INTO public.portfolio_transactions (
    user_id, email, transaction_type, ticker, lots, shares_or_amount,
    price, total_cash_impact, balance_before, balance_after, notes, created_at
  ) VALUES (
    p_user_id, v_user.email, 'RESET', 'CASH', 0, COALESCE(v_current_cash, 0),
    1, -COALESCE(v_current_cash, 0), COALESCE(v_current_cash, 0), 0.00,
    format('Reset ke Rp 0 oleh admin ID %s', COALESCE(p_admin_id, 'SYSTEM')),
    timezone('utc'::text, now())
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'previous_cash', COALESCE(v_current_cash, 0),
    'new_cash', 0.00
  );
END;
$$;

-- ==============================================================================
-- 8. POSTGRESQL FUNCTION (RPC): admin_delete_member_account
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_delete_member_account(
  p_user_id TEXT,
  p_admin_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_role TEXT;
  v_user RECORD;
BEGIN
  IF p_admin_id IS NOT NULL AND p_admin_id <> '' THEN
    SELECT role INTO v_admin_role FROM public.app_users WHERE id = p_admin_id;
    IF v_admin_role IS NULL OR v_admin_role <> 'admin' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Akses ditolak: Hanya admin yang diizinkan');
    END IF;
  END IF;

  SELECT * INTO v_user FROM public.app_users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Member tidak ditemukan');
  END IF;

  IF v_user.role = 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Akun admin tidak dapat dihapus');
  END IF;

  DELETE FROM public.deposits WHERE user_id = p_user_id;
  DELETE FROM public.orders WHERE user_id = p_user_id;
  DELETE FROM public.portfolio_transactions WHERE user_id = p_user_id;
  DELETE FROM public.user_portfolios WHERE user_id = p_user_id;
  DELETE FROM public.app_users WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'email', v_user.email,
    'message', 'Akun member dan seluruh data terkait telah berhasil dihapus'
  );
END;
$$;
