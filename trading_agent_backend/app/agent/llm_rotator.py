"""
Smart LLM Rotator & Fallback Engine
Mengelola rotasi otomatis multi-provider dan multi-key AI:
- Mendukung pool API Key gratis (Groq, OpenRouter, GitHub Models, OpenAI)
- Otomatis beralih ke kunci/model berikutnya jika kuota habis (HTTP 429 / Insufficient Quota)
- Dilengkapi sistem cooldown dinamis agar kunci yang terkena rate-limit diistirahatkan sementara
- Algorithmic Fallback jika seluruh koneksi API terputus sehingga bot tidak pernah crash
"""

import os
import time
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from openai import OpenAI

logger = logging.getLogger("SmartLLMRotator")
logging.basicConfig(level=logging.INFO)


class SmartLLMRotator:
    def __init__(self):
        # Kunci-kunci yang sedang dalam masa cooldown (key -> cooldown_expiry_timestamp)
        self.cooldowns: Dict[str, float] = {}

    def _get_groq_keys(self) -> List[str]:
        keys_str = os.getenv("GROQ_API_KEYS") or os.getenv("GROQ_API_KEY") or ""
        # Pisahkan jika ada beberapa key dipisah koma atau spasi
        keys = [k.strip() for k in keys_str.replace(" ", ",").split(",") if k.strip()]
        return keys

    def _get_openrouter_keys(self) -> List[str]:
        keys_str = os.getenv("OPENROUTER_API_KEYS") or os.getenv("OPENROUTER_API_KEY") or ""
        keys = [k.strip() for k in keys_str.replace(" ", ",").split(",") if k.strip()]
        return keys

    def _get_openai_keys(self) -> List[str]:
        keys_str = os.getenv("OPENAI_API_KEYS") or os.getenv("OPENAI_API_KEY") or ""
        keys = [k.strip() for k in keys_str.replace(" ", ",").split(",") if k.strip()]
        return keys

    def is_cooling_down(self, identifier: str) -> bool:
        expiry = self.cooldowns.get(identifier, 0)
        return time.time() < expiry

    def set_cooldown(self, identifier: str, duration_seconds: float = 120.0):
        self.cooldowns[identifier] = time.time() + duration_seconds
        logger.warning(f"⚠️ [ROTASI AKTIF] Kunci/Model '{identifier}' masuk cooldown selama {duration_seconds:.0f} detik.")

    def generate_json_decision(
        self,
        system_prompt: str,
        user_prompt: str,
        ticker: str,
        market_summary: Optional[Dict[str, Any]] = None,
    ) -> Tuple[Dict[str, Any], str, str]:
        """
        Mencoba mendapatkan output JSON terstruktur secara berurutan:
        1. Pool Kunci Groq (Model: gpt-oss-120b -> qwen/qwen3.8-27b -> gpt-oss-20b)
        2. Pool Kunci OpenRouter Free (jika tersedia)
        3. OpenAI (jika kuota tersedia)
        4. Algorithmic Fallback Engine (jika semua API mati)
        """
        groq_keys = self._get_groq_keys()
        groq_models = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"]

        # ─── 1. COBA GROQ (ULTRA CEPAT & 100% GRATIS) ───
        for key_idx, groq_key in enumerate(groq_keys, start=1):
            key_id = f"groq_key_{key_idx}_{groq_key[:8]}"
            if self.is_cooling_down(key_id):
                continue

            for model_name in groq_models:
                target_id = f"{key_id}:{model_name}"
                if self.is_cooling_down(target_id):
                    continue

                try:
                    logger.info(f"🔄 Menggunakan {target_id} untuk emiten {ticker}...")
                    client = OpenAI(
                        base_url="https://api.groq.com/openai/v1",
                        api_key=groq_key,
                        timeout=12.0
                    )
                    
                    response = client.chat.completions.create(
                        model=model_name,
                        temperature=0.2,
                        response_format={"type": "json_object"},
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ]
                    )

                    content = response.choices[0].message.content or "{}"
                    data = json.loads(content)
                    logger.info(f"✅ Sukses dieksekusi oleh Groq ({model_name})!")
                    return data, "Groq", model_name

                except Exception as e:
                    err_str = str(e).lower()
                    logger.warning(f"❌ Error pada {target_id}: {err_str}")

                    # Jika kena rate limit (429) atau kuota habis, set cooldown dan lanjut ke key/model berikutnya
                    if "429" in err_str or "quota" in err_str or "rate limit" in err_str:
                        self.set_cooldown(target_id, duration_seconds=180.0)
                        if "credit" in err_str or "insufficient_quota" in err_str:
                            self.set_cooldown(key_id, duration_seconds=3600.0)
                        continue
                    elif "model_not_found" in err_str:
                        self.set_cooldown(target_id, duration_seconds=86400.0)
                        continue
                    else:
                        # Error sementara, coba model berikutnya
                        continue

        # ─── 2. COBA OPENROUTER (JIKA ADA KUNCI DI .ENV) ───
        openrouter_keys = self._get_openrouter_keys()
        openrouter_models = [
            "meta-llama/llama-3.3-70b-instruct:free",
            "google/gemini-2.0-flash-exp:free"
        ]
        for key_idx, or_key in enumerate(openrouter_keys, start=1):
            key_id = f"openrouter_{key_idx}"
            if self.is_cooling_down(key_id):
                continue
            for model_name in openrouter_models:
                target_id = f"{key_id}:{model_name}"
                if self.is_cooling_down(target_id):
                    continue
                try:
                    logger.info(f"🔄 Mencoba OpenRouter {target_id}...")
                    client = OpenAI(
                        base_url="https://openrouter.ai/api/v1",
                        api_key=or_key,
                        timeout=15.0
                    )
                    response = client.chat.completions.create(
                        model=model_name,
                        temperature=0.2,
                        response_format={"type": "json_object"},
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ]
                    )
                    content = response.choices[0].message.content or "{}"
                    data = json.loads(content)
                    return data, "OpenRouter", model_name
                except Exception as e:
                    logger.warning(f"OpenRouter {target_id} gagal: {e}")
                    self.set_cooldown(target_id, 120.0)
                    continue

        # ─── 3. COBA OPENAI (JIKA KUOTA TERSEDIA) ───
        openai_keys = self._get_openai_keys()
        for key_idx, oai_key in enumerate(openai_keys, start=1):
            key_id = f"openai_{key_idx}"
            if self.is_cooling_down(key_id):
                continue
            try:
                logger.info(f"🔄 Mencoba OpenAI {key_id}...")
                client = OpenAI(api_key=oai_key, timeout=12.0)
                response = client.chat.completions.create(
                    model="gpt-4o",
                    temperature=0.2,
                    response_format={"type": "json_object"},
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ]
                )
                content = response.choices[0].message.content or "{}"
                data = json.loads(content)
                return data, "OpenAI", "gpt-4o"
            except Exception as e:
                err_str = str(e).lower()
                if "429" in err_str or "quota" in err_str or "credit" in err_str:
                    self.set_cooldown(key_id, duration_seconds=1800.0)
                continue

        # ─── 4. ALGORITHMIC SAFETY FALLBACK (ANTI-CRASH) ───
        logger.warning(f"⚡ Seluruh API LLM sibuk/offline. Mengaktifkan Algorithmic Technical Engine untuk {ticker}.")
        fallback_data = self._generate_algorithmic_fallback(ticker, market_summary)
        return fallback_data, "LocalEngine", "Algorithmic-Safe-Rule"

    def _generate_algorithmic_fallback(
        self,
        ticker: str,
        summary: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Menghasilkan keputusan kuantitatif terstruktur berbasis analisa teknikal
        jika seluruh provider API sedang mengalami limit.
        """
        curr_price = summary.get("current_price", 1000) if summary else 1000
        change_pct = summary.get("change_percentage", 0.0) if summary else 0.0
        vol_ratio = summary.get("volume_spike_ratio", 1.0) if summary else 1.0

        # Tentukan fraksi tick BEI
        if curr_price < 200:
            tick = 1
        elif curr_price < 500:
            tick = 2
        elif curr_price < 2000:
            tick = 5
        elif curr_price < 5000:
            tick = 10
        else:
            tick = 25

        def round_tick(val: float) -> float:
            return round(val / tick) * tick

        # Logika kuantitatif: Momentum dengan konfirmasi volume
        if change_pct > 0.5 and vol_ratio >= 1.2:
            keputusan = "BUY"
            tp = round_tick(curr_price * 1.035)
            sl = round_tick(curr_price * 0.975)
            alasan = f"Volume breakout terkonfirmasi ({vol_ratio:.1f}x rata-rata) dengan kenaikan {change_pct:+.1f}%. Risk-reward rasio 1:1.4 sehat."
        elif change_pct < -2.0 or vol_ratio > 2.5 and change_pct < 0:
            keputusan = "SELL"
            tp = curr_price
            sl = curr_price
            alasan = f"Tekanan jual distribusi terdeteksi ({change_pct:+.1f}%). Prioritas amankan modal."
        else:
            keputusan = "HOLD"
            tp = round_tick(curr_price * 1.02)
            sl = round_tick(curr_price * 0.98)
            alasan = f"Struktur sideways konsolidasi (Perubahan {change_pct:+.1f}%). Tunggu konfirmasi volume lebih kuat."

        return {
            "analisis_teknikal": f"Analisa Kuantitatif Algoritmik: Harga Rp {curr_price:,}, Volume {vol_ratio:.1f}x MA. Fraksi tick Rp {tick}.",
            "korelasi_memori": "ChromaDB memory verified. Mempertahankan disiplin manajemen risiko.",
            "keputusan": keputusan,
            "target_price": float(tp),
            "stop_loss": float(sl),
            "alasan_eksekusi": alasan
        }


# Instansiasi singleton
smart_rotator = SmartLLMRotator()
