-- ==============================================================================
-- TradeSim Pro - Security, Row Level Security (RLS) & Double-Entry Ledger Schema
-- Migration: 20261009_portfolio_security_and_rls.sql
-- ==============================================================================

-- 1. Pastikan ekstensi UUID aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Aktifkan Row Level Security (RLS) pada tabel Inti
ALTER TABLE IF EXISTS user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_users ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Keamanan RLS untuk user_portfolios
-- Pengguna hanya dapat membaca dan memodifikasi portofolio miliknya sendiri
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_portfolios' AND policyname = 'User can only view own portfolio'
  ) THEN
    CREATE POLICY "User can only view own portfolio"
      ON user_portfolios FOR SELECT
      USING (auth.uid() = user_id OR auth.email() = email);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_portfolios' AND policyname = 'User can only update own portfolio'
  ) THEN
    CREATE POLICY "User can only update own portfolio"
      ON user_portfolios FOR UPDATE
      USING (auth.uid() = user_id OR auth.email() = email);
  END IF;
END $$;

-- 4. Tabel Buku Besar Transaksional (Double-Entry Ledger)
-- Mencegah manipulasi saldo arbitrer dan mencatat audit trail setiap trade
CREATE TABLE IF NOT EXISTS portfolio_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'BUY', 'SELL', 'DIVIDEND', 'DEPOSIT', 'RESET'
  ticker VARCHAR(30) NOT NULL,
  lots INT NOT NULL DEFAULT 0,
  shares_or_amount NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL,
  total_cash_impact NUMERIC NOT NULL, -- Negatif untuk BUY, Positif untuk SELL
  balance_before NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  order_id VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trans_user_id ON portfolio_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_trans_email ON portfolio_transactions(email);
CREATE INDEX IF NOT EXISTS idx_trans_created_at ON portfolio_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trans_created_at_brin ON portfolio_transactions USING BRIN (created_at);

-- 5. Tabel Persistent Episodic Memory untuk AI Trading Agent
-- Mencegah Context Amnesia pada Cold Starts Serverless
CREATE TABLE IF NOT EXISTS agent_episodic_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(30) NOT NULL,
  decision VARCHAR(20) NOT NULL, -- 'BUY', 'SELL', 'HOLD'
  entry_price NUMERIC NOT NULL,
  target_price NUMERIC NOT NULL,
  stop_loss NUMERIC NOT NULL,
  risk_reward_ratio NUMERIC NOT NULL,
  conviction_score INT NOT NULL,
  bandarmologi_verdict VARCHAR(30),
  justification TEXT,
  post_trade_reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_memory_symbol ON agent_episodic_memory(symbol, created_at DESC);

-- 6. Fungsi Transaksional Atomik: Eksekusi Pembelian Saham dengan Proteksi Saldo
CREATE OR REPLACE FUNCTION execute_atomic_stock_buy(
  p_user_id VARCHAR,
  p_email VARCHAR,
  p_ticker VARCHAR,
  p_lots INT,
  p_price NUMERIC,
  p_total_cost NUMERIC,
  p_order_id VARCHAR
) RETURNS JSONB AS $$
DECLARE
  v_current_cash NUMERIC;
  v_new_cash NUMERIC;
BEGIN
  -- Kunci baris portofolio pengguna untuk mencegah race condition (FOR UPDATE)
  SELECT cash INTO v_current_cash 
  FROM user_portfolios 
  WHERE user_id = p_user_id OR email = p_email 
  FOR UPDATE;

  IF v_current_cash IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Portofolio pengguna tidak ditemukan');
  END IF;

  IF v_current_cash < p_total_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Saldo kas tidak mencukupi untuk mengeksekusi order');
  END IF;

  v_new_cash := v_current_cash - p_total_cost;

  -- Update saldo portofolio
  UPDATE user_portfolios 
  SET cash = v_new_cash, last_updated = EXTRACT(EPOCH FROM NOW()) * 1000
  WHERE user_id = p_user_id OR email = p_email;

  -- Catat ke buku besar transaksi
  INSERT INTO portfolio_transactions (
    user_id, email, transaction_type, ticker, lots, shares_or_amount,
    price, total_cash_impact, balance_before, balance_after, order_id, notes
  ) VALUES (
    p_user_id, p_email, 'BUY', p_ticker, p_lots, p_lots * 100,
    p_price, -p_total_cost, v_current_cash, v_new_cash, p_order_id, 'Eksekusi order via atomic ledger function'
  );

  RETURN jsonb_build_object(
    'success', true,
    'balance_before', v_current_cash,
    'balance_after', v_new_cash
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
