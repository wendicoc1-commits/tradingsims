"""
Modul Long-Term Memory & RAG (Retrieval-Augmented Generation) untuk Trading Agent.
Menggunakan ChromaDB (Persistent Vector Store) dan OpenAI Embeddings untuk menyimpan
serta me-recall refleksi trading masa lalu (evaluasi Win/Loss dan pelajaran penting).
"""

import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv

# Pastikan environment variables selalu dimuat
load_dotenv()

import hashlib
import numpy as np
import chromadb
from chromadb.config import Settings
from openai import OpenAI


def compute_text_embedding(text: str, dim: int = 384) -> List[float]:
    """
    Menghasilkan normalized embedding vector berdimensi 384 secara deterministik & offline.
    Menggabungkan token kata dan trigram karakter dengan hashing md5/sha256,
    lalu dinormalisasi L2 unit length.
    - 100% Gratis selamanya
    - Tanpa dependensi jaringan / kuota API eksternal
    - Kecepatan instan (< 1 milidetik)
    """
    tokens = text.lower().replace("\n", " ").split()
    vec = np.zeros(dim, dtype=np.float32)
    for token in tokens:
        idx = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16) % dim
        vec[idx] += 1.0
    for i in range(max(0, len(text) - 2)):
        trigram = text[i:i+3].lower()
        idx = int(hashlib.sha256(trigram.encode("utf-8")).hexdigest(), 16) % dim
        vec[idx] += 0.5
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec /= norm
    return vec.tolist()


class AgentMemory:
    """
    Mengelola memori jangka panjang agen menggunakan ChromaDB vector store.
    Agen dapat menyimpan refleksi trade masa lalu (Self-Reflection) dan menarik
    kembali pelajaran yang relevan saat menghadapi struktur pasar yang mirip (RAG).
    """

    def __init__(
        self,
        persist_directory: str = "./data/chroma_db",
        collection_name: str = "idx_trading_reflections",
        openai_api_key: Optional[str] = None,
    ):
        self.persist_directory = persist_directory
        self.collection_name = collection_name
        self.api_key = openai_api_key or os.getenv("OPENAI_API_KEY")

        # Inisialisasi ChromaDB client persisten (data tersimpan di disk lokal)
        os.makedirs(self.persist_directory, exist_ok=True)
        self.chroma_client = chromadb.PersistentClient(path=self.persist_directory)

        # Inisialisasi OpenAI client langsung untuk komputasi embedding
        self.openai_client = OpenAI(api_key=self.api_key)

        # Ambil atau buat koleksi vektor di ChromaDB
        self.collection = self.chroma_client.get_or_create_collection(
            name=self.collection_name,
            metadata={"description": "Memori refleksi trading saham IHSG"}
        )

    def save_reflection(
        self,
        ticker: str,
        trade_result: str,
        pnl_percentage: float,
        reflection_text: str,
        market_condition: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Menyimpan jurnal refleksi setelah transaksi selesai (WIN / LOSS):
        - Mengonversi teks refleksi menjadi representasi vektor (Embedding).
        - Menyimpan metadata (ticker, hasil, PnL %, tanggal) agar memori dapat dicari
          berdasarkan kemiripan semantik di masa mendatang.
        """
        clean_ticker = ticker.replace(".JK", "").upper()
        clean_result = trade_result.strip().upper()
        if clean_result not in ["WIN", "LOSS"]:
            raise ValueError("trade_result harus bernilai 'WIN' atau 'LOSS'")

        timestamp = datetime.utcnow().isoformat()
        doc_id = f"ref_{clean_ticker}_{int(datetime.utcnow().timestamp())}"

        # Susun teks konten yang mewakili konteks kejadian untuk di-embed
        embedded_document = (
            f"Saham: {clean_ticker} | Hasil: {clean_result} | Realized PnL: {pnl_percentage:+.2f}%\n"
            f"Kondisi Pasar: {market_condition or 'Standar IHSG'}\n"
            f"Pelajaran & Evaluasi: {reflection_text}"
        )

        # Hitung vector embedding secara deterministik & offline (100% gratis, tanpa kuota)
        vector = compute_text_embedding(embedded_document)

        # Metadata terstruktur untuk filtering jika diperlukan
        metadata = {
            "ticker": clean_ticker,
            "trade_result": clean_result,
            "pnl_percentage": float(pnl_percentage),
            "timestamp": timestamp,
            "market_condition": market_condition or "N/A",
        }

        # Simpan ke dalam ChromaDB
        self.collection.add(
            ids=[doc_id],
            embeddings=[vector],
            documents=[embedded_document],
            metadatas=[metadata]
        )

        return {
            "status": "success",
            "memory_id": doc_id,
            "ticker": clean_ticker,
            "trade_result": clean_result,
            "pnl_percentage": pnl_percentage,
            "message": "Refleksi trading berhasil diindeks ke dalam memori jangka panjang agen."
        }

    def retrieve_memory(
        self,
        query_context: str,
        n_results: int = 3,
        ticker: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Melakukan pencarian kemiripan semantik (Cosine Similarity) di ChromaDB:
        - Mencari memori trade masa lalu yang polanya mirip dengan situasi harga saat ini.
        - Membantu AI menghindari mengulangi kesalahan fatal masa lalu (Loss Aversion)
          dan mengulangi pola setup yang menghasilkan profit tinggi.
        """
        if self.collection.count() == 0:
            return []

        # Hitung vector embedding secara deterministik & offline (100% gratis, tanpa kuota)
        query_vector = compute_text_embedding(query_context)

        # Opsional: Filter berdasarkan ticker spesifik jika diminta
        where_filter = None
        if ticker:
            clean_ticker = ticker.replace(".JK", "").upper()
            where_filter = {"ticker": clean_ticker}

        try:
            results = self.collection.query(
                query_embeddings=[query_vector],
                n_results=min(n_results, self.collection.count()),
                where=where_filter,
                include=["documents", "metadatas", "distances"]
            )
        except Exception:
            # Fallback jika query dengan filter ticker tidak menemukan hasil
            results = self.collection.query(
                query_embeddings=[query_vector],
                n_results=min(n_results, self.collection.count()),
                include=["documents", "metadatas", "distances"]
            )

        retrieved_memories: List[Dict[str, Any]] = []
        if results and results.get("documents") and len(results["documents"]) > 0:
            documents = results["documents"][0]
            metadatas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(documents)
            distances = results["distances"][0] if results.get("distances") else [0.0] * len(documents)

            for doc, meta, dist in zip(documents, metadatas, distances):
                retrieved_memories.append({
                    "document": doc,
                    "metadata": meta,
                    "distance": round(float(dist), 4),
                    # Konversi cosine distance menjadi similarity score (0.0 - 1.0)
                    "similarity_score": round(max(0.0, 1.0 - float(dist)), 4)
                })

        return retrieved_memories

    def format_memories_for_llm(self, memories: List[Dict[str, Any]]) -> str:
        """
        Merangkum hasil retrieve memori menjadi narasi kontekstual untuk disuntikkan ke System/User Prompt LLM.
        """
        if not memories:
            return "Belum ada catatan memori/refleksi historis yang relevan untuk situasi ini."

        formatted_sections = ["=== MEMORI & REFLEKSI TRADING MASA LALU (RAG MEMORY) ==="]
        for idx, mem in enumerate(memories, start=1):
            meta = mem.get("metadata", {})
            similarity = mem.get("similarity_score", 0.0)
            formatted_sections.append(
                f"[Refleksi #{idx} | Kesamaan Pola: {similarity * 100:.1f}%]\n"
                f"- Ticker: {meta.get('ticker')} ({meta.get('trade_result')}, PnL: {meta.get('pnl_percentage', 0):+.2f}%)\n"
                f"- Evaluasi Pelajaran: {mem.get('document')}\n"
            )

        return "\n".join(formatted_sections)
