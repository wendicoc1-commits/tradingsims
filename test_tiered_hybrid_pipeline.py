# test_tiered_hybrid_pipeline.py
"""
Test Suite & Quantitative Benchmark for Tiered Execution Hybrid Architecture
Verifies:
1. Tier 1 Fast Linear Gate for small orders in stable market
2. Tier 2 Deep Cognitive Consensus for large orders / high volatility
3. Pre-Action Negative Episodic Memory Retrieval (Blocking repeating mistakes)
4. The Critic (Dialectical Red-Teaming) Falsification & Remedial Clamp
5. Tier 3 Post-Mortem Reflection & Dynamic Heuristic Commit
"""

import unittest
from datetime import datetime
from typing import List, Dict, Any, Optional

class MockEpisodicMemoryStore:
    def __init__(self):
        self.heuristics: List[Dict[str, Any]] = [
            {
                "id": "SEED-001",
                "symbol": "BBRI",
                "regime": "BEAR_DRAWDOWN",
                "root_cause": "ASSUMPTION_ERROR",
                "rule": "JANGAN beli breakout di BBRI saat IHSG/Regime BEAR_DRAWDOWN tanpa akumulasi asing Net Buy > Rp 50 Miliar.",
                "pnl_pct": -3.8
            }
        ]

    def retrieve_similar_mistakes(self, symbol: str, regime: str) -> List[Dict[str, Any]]:
        return [
            h for h in self.heuristics
            if h["symbol"].upper() == symbol.upper() and h["regime"] == regime
        ]

    def commit_lesson(self, symbol: str, regime: str, root_cause: str, rule: str, pnl_pct: float):
        entry = {
            "id": f"EP-{len(self.heuristics)+1:03d}",
            "symbol": symbol,
            "regime": regime,
            "root_cause": root_cause,
            "rule": rule,
            "pnl_pct": pnl_pct
        }
        self.heuristics.insert(0, entry)
        return entry

class MockTieredPipeline:
    def __init__(self, memory_store: MockEpisodicMemoryStore):
        self.memory = memory_store
        self.tier_1_limit = 20_000_000 # Rp 20 Juta

    def evaluate(self, symbol: str, total_value: float, regime: str, is_breakout: bool, alpha_score: float, is_crypto: bool):
        target_engine = "freqtrade" if is_crypto else "lumibot"
        past_mistakes = self.memory.retrieve_similar_mistakes(symbol, regime)

        # Tier 1 vs Tier 2 router
        requires_tier_2 = (
            total_value >= self.tier_1_limit or
            regime in ["BEAR_DRAWDOWN", "HIGH_VOLATILITY"] or
            len(past_mistakes) > 0
        )

        if not requires_tier_2:
            approved = alpha_score >= 75
            return {
                "tier": "TIER_1_FAST",
                "approved": approved,
                "target_engine": target_engine,
                "reason": "Fast Gate (< 100ms)",
                "adjusted_lots_pct": 100
            }

        # TIER 2: DEEP COGNITIVE CONSENSUS
        # 1. Anti-Pattern check
        for m in past_mistakes:
            if is_breakout and m["root_cause"] == "ASSUMPTION_ERROR":
                return {
                    "tier": "TIER_2_COGNITIVE",
                    "approved": False,
                    "target_engine": target_engine,
                    "reason": f"VETO BY RISK: Melanggar aturan memori: {m['rule']}",
                    "adjusted_lots_pct": 0
                }

        # 2. Tree-of-Thoughts & The Critic
        clamp_pct = 100
        if regime == "HIGH_VOLATILITY":
            clamp_pct = 50 # Pangkas lot 50%
        elif regime == "BEAR_DRAWDOWN" and is_breakout:
            clamp_pct = 40

        # 3. Quorum check
        lead_vote = True
        alpha_vote = alpha_score >= 75
        risk_vote = True # no veto if anti-pattern clean

        approved = (lead_vote + alpha_vote + risk_vote) >= 2

        return {
            "tier": "TIER_2_COGNITIVE",
            "approved": approved,
            "target_engine": target_engine,
            "reason": "Quorum 2/3 Passed",
            "adjusted_lots_pct": clamp_pct
        }

    def post_mortem(self, symbol: str, regime: str, pnl_pct: float, engine: str):
        if pnl_pct >= -1.5:
            return None
        root_cause = "REGIME_SHIFT" if regime == "BEAR_DRAWDOWN" else "EXECUTION_SLIPPAGE"
        rule = f"Pelajaran {symbol}: Kurangi risiko saat {regime} pada engine {engine.upper()}."
        return self.memory.commit_lesson(symbol, regime, root_cause, rule, pnl_pct)

class TestTieredHybridExecution(unittest.TestCase):
    def setUp(self):
        self.memory = MockEpisodicMemoryStore()
        self.pipeline = MockTieredPipeline(self.memory)

    def test_tier_1_fast_path(self):
        """Order kecil pada kondisi pasar tenang wajib lewat Tier 1 instan"""
        res = self.pipeline.evaluate(
            symbol="TLKM",
            total_value=8_000_000, # Rp 8 Juta (< 20 Juta)
            regime="BULL_MOMENTUM",
            is_breakout=False,
            alpha_score=85,
            is_crypto=False
        )
        self.assertEqual(res["tier"], "TIER_1_FAST")
        self.assertTrue(res["approved"])
        self.assertEqual(res["target_engine"], "lumibot")

    def test_tier_2_escalation_large_order(self):
        """Order bernilai besar (>= Rp 20 Juta) wajib dieskalasi ke Tier 2"""
        res = self.pipeline.evaluate(
            symbol="BTCUSDT",
            total_value=50_000_000, # Rp 50 Juta
            regime="BULL_MOMENTUM",
            is_breakout=False,
            alpha_score=88,
            is_crypto=True
        )
        self.assertEqual(res["tier"], "TIER_2_COGNITIVE")
        self.assertTrue(res["approved"])
        self.assertEqual(res["target_engine"], "freqtrade")

    def test_pre_action_memory_veto(self):
        """BBRI breakout di regime BEAR_DRAWDOWN wajib ditolak oleh memori masa lalu"""
        res = self.pipeline.evaluate(
            symbol="BBRI",
            total_value=15_000_000,
            regime="BEAR_DRAWDOWN",
            is_breakout=True,
            alpha_score=90,
            is_crypto=False
        )
        self.assertEqual(res["tier"], "TIER_2_COGNITIVE")
        self.assertFalse(res["approved"])
        self.assertIn("Melanggar aturan memori", res["reason"])

    def test_the_critic_remedial_clamp(self):
        """Saat volatilitas tinggi, The Critic memangkas lot sebesar 50%"""
        res = self.pipeline.evaluate(
            symbol="ETHUSDT",
            total_value=25_000_000,
            regime="HIGH_VOLATILITY",
            is_breakout=False,
            alpha_score=82,
            is_crypto=True
        )
        self.assertEqual(res["tier"], "TIER_2_COGNITIVE")
        self.assertTrue(res["approved"])
        self.assertEqual(res["adjusted_lots_pct"], 50)

    def test_post_mortem_loop_creates_new_heuristic(self):
        """Hasil trade rugi menghasilkan heuristik baru yang disimpan ke memori"""
        initial_count = len(self.memory.heuristics)
        new_lesson = self.pipeline.post_mortem(
            symbol="SOLUSDT",
            regime="HIGH_VOLATILITY",
            pnl_pct=-4.5,
            engine="freqtrade"
        )
        self.assertIsNotNone(new_lesson)
        self.assertEqual(len(self.memory.heuristics), initial_count + 1)
        self.assertEqual(self.memory.heuristics[0]["symbol"], "SOLUSDT")

if __name__ == "__main__":
    unittest.main()
