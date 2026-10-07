-- ==============================================================================
-- FINCEPT / TRADESIM PRO — ADVANCED FINTECH MODULES MIGRATION
-- ==============================================================================
-- Meliputi:
-- 1. Trigger Auto-Provisioning User Baru (Rp 100 Juta saat Sign Up)
-- 2. Immutability Ledger Transaksi (Append-Only Anti-Tamper)
-- 3. Pending Limit Order Book & Matching Engine (match_pending_orders)
-- 4. Notifikasi Price Alerts (Target Harga)
-- 5. Mesin Dividen Kas Massal Otomatis (distribute_cash_dividend)
-- 6. Notulen Sidang Komite AI (ai_agent_deliberations)
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TRIGGER AUTO-PROVISIONING USER BARU
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, cash_balance)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    100000000.00 -- Modal awal Rp 100.000.000 murni
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. IMMUTABILITY TRIGGER: LEDGER TRANSAKSI APPEND-ONLY
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.prevent_transaction_tampering()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Ledger Finansial Bersifat Permanen: Transaksi yang sudah tereksekusi tidak boleh diubah atau dihapus.'
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_immutable_transactions ON public.transactions;
CREATE TRIGGER trg_immutable_transactions
  BEFORE UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_transaction_tampering();


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PENDING LIMIT ORDER BOOK & MATCHING ENGINE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pending_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ticker VARCHAR(20) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  limit_price NUMERIC(18, 2) NOT NULL CHECK (limit_price > 0),
  lots NUMERIC(14, 4) NOT NULL CHECK (lots > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FILLED', 'CANCELLED', 'EXPIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  filled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pending_orders_matching 
  ON public.pending_orders(ticker, status, limit_price);

ALTER TABLE public.pending_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own pending orders" ON public.pending_orders;
CREATE POLICY "Users manage own pending orders" ON public.pending_orders
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.match_pending_orders(
  p_ticker VARCHAR,
  p_current_price NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order RECORD;
  v_filled_count INT := 0;
BEGIN
  FOR v_order IN
    SELECT * FROM public.pending_orders
    WHERE ticker = UPPER(TRIM(p_ticker))
      AND status = 'PENDING'
      AND (
        (type = 'BUY' AND limit_price >= p_current_price) OR
        (type = 'SELL' AND limit_price <= p_current_price)
      )
    FOR UPDATE SKIP LOCKED
  LOOP
    BEGIN
      PERFORM public.execute_trade(
        v_order.user_id,
        v_order.ticker,
        v_order.type,
        p_current_price,
        v_order.lots
      );

      UPDATE public.pending_orders
      SET status = 'FILLED',
          filled_at = NOW()
      WHERE id = v_order.id;

      v_filled_count := v_filled_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        UPDATE public.pending_orders
        SET status = 'CANCELLED'
        WHERE id = v_order.id;
    END;
  END LOOP;

  RETURN jsonb_build_object('ticker', p_ticker, 'matched_count', v_filled_count);
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. PRICE ALERTS SYSTEM
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ticker VARCHAR(20) NOT NULL,
  target_price NUMERIC(18, 2) NOT NULL,
  condition VARCHAR(10) NOT NULL CHECK (condition IN ('ABOVE', 'BELOW')),
  is_triggered BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  triggered_at TIMESTAMPTZ
);

ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own alerts" ON public.price_alerts;
CREATE POLICY "Users manage own alerts" ON public.price_alerts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. DIVIDEN KAS MASSAL OTOMATIS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.distribute_cash_dividend(
  p_ticker VARCHAR,
  p_dps NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_holding RECORD;
  v_payout_amount NUMERIC;
  v_total_paid NUMERIC := 0;
  v_shareholder_count INT := 0;
BEGIN
  IF p_dps <= 0 THEN
    RAISE EXCEPTION 'DPS harus bernilai positif.' USING ERRCODE = '22003';
  END IF;

  FOR v_holding IN
    SELECT p.user_id, p.total_lots
    FROM public.portfolios p
    WHERE p.ticker = UPPER(TRIM(p_ticker)) AND p.total_lots > 0
    FOR UPDATE
  LOOP
    v_payout_amount := ROUND(v_holding.total_lots * 100 * p_dps, 2);

    UPDATE public.users
    SET cash_balance = cash_balance + v_payout_amount,
        updated_at = NOW()
    WHERE id = v_holding.user_id;

    v_total_paid := v_total_paid + v_payout_amount;
    v_shareholder_count := v_shareholder_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'ticker', UPPER(p_ticker),
    'dps', p_dps,
    'total_dividend_paid', v_total_paid,
    'shareholders_rewarded', v_shareholder_count
  );
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. NOTULEN SIDANG KOMITE AI AGENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_agent_deliberations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker VARCHAR(20) NOT NULL,
  consensus VARCHAR(10) NOT NULL CHECK (consensus IN ('STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'CUT_LOSS')),
  alpha_score INT NOT NULL CHECK (alpha_score BETWEEN 0 AND 100),
  bull_argument TEXT NOT NULL,
  bear_argument TEXT NOT NULL,
  risk_verdict TEXT NOT NULL,
  key_levels JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_agent_deliberations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read for ai deliberations" ON public.ai_agent_deliberations;
CREATE POLICY "Public read for ai deliberations" ON public.ai_agent_deliberations
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Service role write ai deliberations" ON public.ai_agent_deliberations;
CREATE POLICY "Service role write ai deliberations" ON public.ai_agent_deliberations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT EXECUTE ON FUNCTION public.match_pending_orders(VARCHAR, NUMERIC) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.distribute_cash_dividend(VARCHAR, NUMERIC) TO service_role;
