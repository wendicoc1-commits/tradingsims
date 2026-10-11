-- ====================================================================
-- AXIE LUNACIA BREEDING ENGINE - RELATIONAL DATABASE SCHEMA (PostgreSQL)
-- Supports 256-bit BigInt gene storage, Recursive Ancestry Checks, 
-- Lifecycle State Machine, and Immutable Breeding Transaction Logs.
-- ====================================================================

-- 1. ENUMS
CREATE TYPE creature_class AS ENUM (
  'Beast', 'Plant', 'Aquatic', 'Bird', 'Reptile', 'Bug', 'Mech', 'Dusk', 'Dawn'
);

CREATE TYPE lifecycle_stage AS ENUM (
  'EGG', 'LARVA', 'PETITE', 'ADULT'
);

-- 2. CREATURES TABLE
CREATE TABLE IF NOT EXISTS creatures (
  id VARCHAR(64) PRIMARY KEY,
  owner_address VARCHAR(42) NOT NULL,
  name VARCHAR(120) NOT NULL,
  class creature_class NOT NULL,
  
  -- Genetic Storage (Both raw 256-bit hex and structured JSON for query indexing)
  genes_256 VARCHAR(66) NOT NULL, -- e.g. 0x000000000000000000000000...
  genes_json JSONB NOT NULL,       -- Parsed D, R1, R2 for eyes, ears, mouth, horn, back, tail
  
  -- Stats (Derived dynamically from genes + class)
  hp INT NOT NULL CHECK (hp >= 27 AND hp <= 85),
  speed INT NOT NULL CHECK (speed >= 27 AND speed <= 85),
  skill INT NOT NULL CHECK (skill >= 27 AND skill <= 85),
  morale INT NOT NULL CHECK (morale >= 27 AND morale <= 85),
  
  -- Lineage / Pedigree (Foreign keys for Sire and Matron)
  sire_id VARCHAR(64) REFERENCES creatures(id) ON DELETE SET NULL,
  matron_id VARCHAR(64) REFERENCES creatures(id) ON DELETE SET NULL,
  
  -- Breeding Counters & Caps
  breed_count INT NOT NULL DEFAULT 0 CHECK (breed_count >= 0 AND breed_count <= 7),
  max_breed_count INT NOT NULL DEFAULT 7,
  
  -- Lifecycle & Timers
  stage lifecycle_stage NOT NULL DEFAULT 'EGG',
  birth_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  hatch_date TIMESTAMPTZ NOT NULL,
  
  -- Visual Assets
  image_url VARCHAR(255),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Basic constraints
  CONSTRAINT no_self_parentage CHECK (sire_id != id AND matron_id != id),
  CONSTRAINT distinct_parents CHECK (sire_id IS NULL OR matron_id IS NULL OR sire_id != matron_id)
);

-- Indexes for performance
CREATE INDEX idx_creatures_owner ON creatures(owner_address);
CREATE INDEX idx_creatures_class ON creatures(class);
CREATE INDEX idx_creatures_stage ON creatures(stage);
CREATE INDEX idx_creatures_sire ON creatures(sire_id);
CREATE INDEX idx_creatures_matron ON creatures(matron_id);
CREATE INDEX idx_creatures_genes_gin ON creatures USING GIN (genes_json);

-- 3. USER WALLETS TABLE (Off-chain / Mirrored On-chain balances)
CREATE TABLE IF NOT EXISTS user_wallets (
  wallet_address VARCHAR(42) PRIMARY KEY,
  slp_balance BIGINT NOT NULL DEFAULT 0 CHECK (slp_balance >= 0),
  axs_balance NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (axs_balance >= 0),
  ron_balance NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (ron_balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BREEDING TRANSACTION AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS breeding_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash VARCHAR(66) UNIQUE NOT NULL,
  owner_address VARCHAR(42) NOT NULL,
  sire_id VARCHAR(64) NOT NULL REFERENCES creatures(id),
  matron_id VARCHAR(64) NOT NULL REFERENCES creatures(id),
  offspring_id VARCHAR(64) NOT NULL REFERENCES creatures(id),
  
  -- Cost Breakdown
  cost_slp INT NOT NULL,
  cost_axs NUMERIC(18, 4) NOT NULL,
  cost_usd NUMERIC(10, 2) NOT NULL,
  
  -- Gene Snapshot & Heredity Audit
  heredity_audit JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_breeding_logs_owner ON breeding_logs(owner_address);
CREATE INDEX idx_breeding_logs_parents ON breeding_logs(sire_id, matron_id);

-- 5. ADVANCED DATABASE TRIGGER: PEDIGREE INCEST ENFORCEMENT
-- Enforces sibling and parent-offspring restrictions at the database level!
CREATE OR REPLACE FUNCTION check_incest_prevention()
RETURNS TRIGGER AS $$
DECLARE
  v_sire_sire VARCHAR(64);
  v_sire_matron VARCHAR(64);
  v_matron_sire VARCHAR(64);
  v_matron_matron VARCHAR(64);
BEGIN
  IF NEW.sire_id IS NOT NULL AND NEW.matron_id IS NOT NULL THEN
    -- Check 1: Direct parent-child
    IF NEW.sire_id = NEW.matron_id THEN
      RAISE EXCEPTION 'Lineage Violation: Sire and Matron cannot be the same creature.';
    END IF;

    -- Fetch Sire's parents
    SELECT sire_id, matron_id INTO v_sire_sire, v_sire_matron FROM creatures WHERE id = NEW.sire_id;
    -- Fetch Matron's parents
    SELECT sire_id, matron_id INTO v_matron_sire, v_matron_matron FROM creatures WHERE id = NEW.matron_id;

    -- Check 2: Parent breeding with their child
    IF NEW.sire_id = v_matron_sire OR NEW.sire_id = v_matron_matron THEN
      RAISE EXCEPTION 'Lineage Violation: Sire is a parent of Matron.';
    END IF;
    IF NEW.matron_id = v_sire_sire OR NEW.matron_id = v_sire_matron THEN
      RAISE EXCEPTION 'Lineage Violation: Matron is a parent of Sire.';
    END IF;

    -- Check 3: Full or Half Siblings
    IF (v_sire_sire IS NOT NULL AND v_sire_sire = v_matron_sire) OR
       (v_sire_matron IS NOT NULL AND v_sire_matron = v_matron_matron) OR
       (v_sire_sire IS NOT NULL AND v_sire_sire = v_matron_matron) OR
       (v_sire_matron IS NOT NULL AND v_sire_matron = v_matron_sire) THEN
      RAISE EXCEPTION 'Lineage Violation: Sire and Matron are siblings sharing parentage.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_incest
BEFORE INSERT ON creatures
FOR EACH ROW
EXECUTE FUNCTION check_incest_prevention();
