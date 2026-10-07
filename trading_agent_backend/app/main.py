"""
Entrypoint Aplikasi Backend FastAPI untuk Autonomous Trading Agent (IHSG).
Menyediakan REST API untuk memicu OODA Loop Analysis dan Menyimpan Jurnal Refleksi.
"""

import os
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Muat variabel environment (.env)
load_dotenv()

from app.agent.ooda_loop import execute_ooda_loop, agent_memory


# ─────────────────────────────────────────────────────────────────────────────
# PYDANTIC REQUEST & RESPONSE MODELS
# ─────────────────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    """Payload untuk meminta analisis OODA Loop pada satu ticker saham."""
    ticker: str = Field(
        ...,
        examples=["BBCA", "BBRI", "TLKM", "ASII"],
        description="Kode ticker saham Bursa Efek Indonesia (tanpa atau dengan akhiran .JK)"
    )
    additional_intel: Optional[str] = Field(
        default="",
        description="Informasi berita, rumor pasar, atau bandarmologi tambahan (opsional)"
    )


class ReflectRequest(BaseModel):
    """Payload untuk menyimpan evaluasi pasca-trade (Self-Reflection) ke ChromaDB."""
    ticker: str = Field(
        ...,
        examples=["BBCA"],
        description="Kode emiten saham yang dievaluasi"
    )
    trade_result: str = Field(
        ...,
        examples=["WIN", "LOSS"],
        description="Hasil transaksi: 'WIN' jika profit, 'LOSS' jika rugi/cut loss"
    )
    pnl_percentage: float = Field(
        ...,
        examples=[4.5, -2.1],
        description="Persentase keuntungan atau kerugian bersih yang terealisasi"
    )
    reflection_text: str = Field(
        ...,
        examples=["Entry breakout valid namun take profit terlalu lambat saat resisten kuat."],
        description="Catatan evaluasi kualitatif dan pelajaran untuk masa depan"
    )
    market_condition: Optional[str] = Field(
        default="IHSG Sideways",
        description="Deskripsi kondisi pasar secara umum saat transaksi terjadi"
    )


# ─────────────────────────────────────────────────────────────────────────────
# LIFESPAN & FASTAPI INITIALIZATION
# ─────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verifikasi API Key saat aplikasi dinyalakan
    if not os.getenv("OPENAI_API_KEY"):
        print("[WARNING] OPENAI_API_KEY belum disetel! Harap isi di file .env")
    else:
        print("[INFO] Autonomous Trading Agent Backend siap beroperasi.")
    yield


app = FastAPI(
    title="IHSG Autonomous Trading Agent Backend",
    description=(
        "Backend kuantitatif AI mandiri berbasis OODA Loop dan RAG Memory (ChromaDB) "
        "yang dioptimalkan khusus untuk Bursa Efek Indonesia (IDX)."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# Konfigurasi CORS agar frontend Next.js dapat memanggil API ini secara leluasa
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Dapat diperketat ke domain Next.js di produksi
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINTS REST API
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health Check"])
async def root():
    return {
        "status": "online",
        "service": "TradeMind-Alpha Autonomous Agent",
        "market": "Indonesia Stock Exchange (IDX / BEI)",
        "memory_records_count": agent_memory.collection.count()
    }


@app.post("/api/analyze", tags=["Trading Agent"])
async def analyze_stock(payload: AnalyzeRequest) -> Dict[str, Any]:
    """
    Memicu 1 siklus penuh OODA Loop:
    1. OBSERVE: Tarik data historis 5 hari saham BEI via yfinance.
    2. RECALL: Ambil refleksi relevan dari memori jangka panjang ChromaDB (RAG).
    3. ORIENT & DECIDE: Analisis mendalam via OpenAI GPT-4o dalam format JSON ketat.
    """
    if not payload.ticker or len(payload.ticker.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parameter 'ticker' tidak boleh kosong."
        )

    try:
        result = execute_ooda_loop(
            ticker=payload.ticker,
            additional_market_intel=payload.additional_intel or ""
        )
        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terjadi kegagalan pada siklus OODA agen: {str(e)}"
        )


@app.post("/api/reflect", tags=["Agent Memory"])
async def store_trade_reflection(payload: ReflectRequest) -> Dict[str, Any]:
    """
    Menyimpan pelajaran transaksi (WIN/LOSS) ke ChromaDB:
    Agen akan mengingat refleksi ini dan menggunakannya kembali di masa mendatang
    saat mendeteksi pola pasar yang mirip.
    """
    if payload.trade_result.upper() not in ["WIN", "LOSS"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nilai 'trade_result' harus berupa 'WIN' atau 'LOSS'."
        )

    try:
        saved = agent_memory.save_reflection(
            ticker=payload.ticker,
            trade_result=payload.trade_result,
            pnl_percentage=payload.pnl_percentage,
            reflection_text=payload.reflection_text,
            market_condition=payload.market_condition
        )
        return saved
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menyimpan refleksi ke memori: {str(e)}"
        )


@app.get("/api/memory/stats", tags=["Agent Memory"])
async def get_memory_stats():
    """Melihat jumlah ingatan refleksi yang tersimpan di dalam otak agen."""
    return {
        "collection_name": agent_memory.collection_name,
        "total_reflections_stored": agent_memory.collection.count(),
        "storage_path": agent_memory.persist_directory
    }


if __name__ == "__main__":
    import uvicorn
    # Menjalankan server lokal pada port 8000
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
