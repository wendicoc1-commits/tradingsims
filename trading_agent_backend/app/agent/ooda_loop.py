"""
Orkestrasi Siklus OODA Loop (Observe -> Recall -> Orient & Decide) untuk Trading Agent.
Menggabungkan data pasar aktual dari yfinance dengan ingatan jangka panjang ChromaDB,
lalu memprosesnya menggunakan OpenAI gpt-4o dalam mode JSON terstruktur.
"""

import os
import json
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from openai import OpenAI

from app.market_data.idx_fetcher import fetch_idx_ohlcv, format_ohlcv_for_llm
from app.memory.vector_store import AgentMemory
from app.agent.prompts import SYSTEM_PROMPT_TRADEMIND, build_ooda_user_prompt


class TradeDecision(BaseModel):
    """Skema validasi Pydantic untuk output keputusan trading dari model LLM."""
    analisis_teknikal: str = Field(description="Ulasan teknikal candlestick, support-resistance, dan volume")
    korelasi_memori: str = Field(description="Hubungan antara kondisi saat ini dengan refleksi masa lalu")
    keputusan: str = Field(description="Sinyal aksi: BUY, SELL, atau HOLD")
    target_price: float = Field(description="Target harga take profit yang mematuhi fraksi BEI")
    stop_loss: float = Field(description="Batas harga cut loss yang mematuhi fraksi BEI")
    alasan_eksekusi: str = Field(description="Rasionalisasi rasio risk-to-reward dan konfirmasi sinyal")


# Inisialisasi memori persisten global
agent_memory = AgentMemory()


def execute_ooda_loop(
    ticker: str,
    additional_market_intel: str = "",
    memory_store: Optional[AgentMemory] = None,
    openai_client: Optional[OpenAI] = None,
) -> Dict[str, Any]:
    """
    Menjalankan 1 siklus penuh OODA Loop untuk satu emiten saham IHSG:
    
    1. OBSERVE: Tarik data historis 5 hari perdagangan terakhir via yfinance.
    2. RECALL: Query ChromaDB untuk menemukan pola atau kesalahan masa lalu pada situasi serupa (RAG).
    3. ORIENT & DECIDE: Kirim data dan memori ke GPT-4o dengan system prompt TradeMind-Alpha.
    4. ACT: Mengembalikan payload keputusan JSON siap eksekusi.
    """
    memory = memory_store or agent_memory
    client = openai_client or OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    clean_ticker = ticker.replace(".JK", "").strip().upper()

    # ─────────────────────────────────────────────────────────────────────────
    # TAHAP 1: OBSERVE (Observasi Pasar)
    # ─────────────────────────────────────────────────────────────────────────
    try:
        df_ohlcv, summary = fetch_idx_ohlcv(clean_ticker, period="5d")
        ohlcv_text = format_ohlcv_for_llm(df_ohlcv, summary)
    except Exception as e:
        raise RuntimeError(f"[OBSERVE ERROR] Gagal menarik data pasar untuk {clean_ticker}: {str(e)}")

    # ─────────────────────────────────────────────────────────────────────────
    # TAHAP 2: RECALL (Pencarian Memori & Pelajaran Masa Lalu via RAG)
    # ─────────────────────────────────────────────────────────────────────────
    # Susun deskripsi konteks pasar saat ini untuk query semantic similarity
    market_query_context = (
        f"Evaluasi saham {clean_ticker}. Pergerakan harga {summary['change_percentage']:+.2f}%, "
        f"Rasio Volume {summary['volume_spike_ratio']}x. "
        f"Harga saat ini Rp {summary['current_price']:,} di dekat rentang "
        f"Rp {summary['5d_low']:,} - Rp {summary['5d_high']:,}."
    )

    # Ambil hingga 3 memori yang paling relevan
    recalled_memories = memory.retrieve_memory(
        query_context=market_query_context,
        n_results=3,
        ticker=clean_ticker
    )
    memory_text = memory.format_memories_for_llm(recalled_memories)

    # ─────────────────────────────────────────────────────────────────────────
    # TAHAP 3: ORIENT & DECIDE (Sintesis & Pengambilan Keputusan via GPT-4o)
    # ─────────────────────────────────────────────────────────────────────────
    user_prompt = build_ooda_user_prompt(
        ticker=clean_ticker,
        ohlcv_text=ohlcv_text,
        memory_text=memory_text,
        additional_market_intel=additional_market_intel
    )

    response = client.chat.completions.create(
        model="gpt-4o",
        temperature=0.2, # Rendah untuk konsistensi kuantitatif & minim halusinasi
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT_TRADEMIND},
            {"role": "user", "content": user_prompt}
        ]
    )

    raw_json_str = response.choices[0].message.content or "{}"
    
    try:
        parsed_data = json.loads(raw_json_str)
        # Validasi struktur melalui Pydantic
        decision = TradeDecision(**parsed_data)
    except Exception as parse_err:
        raise ValueError(
            f"[DECIDE ERROR] Model tidak mengembalikan JSON yang valid: {parse_err}. "
            f"Raw Content: {raw_json_str}"
        )

    # ─────────────────────────────────────────────────────────────────────────
    # TAHAP 4: ACT / RETURN ENRICHED PAYLOAD
    # ─────────────────────────────────────────────────────────────────────────
    return {
        "status": "success",
        "ticker": clean_ticker,
        "market_snapshot": summary,
        "memories_recalled_count": len(recalled_memories),
        "decision": decision.model_dump(),
        "model_used": "gpt-4o",
    }
