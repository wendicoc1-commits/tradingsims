"""
Modul Penarik Data Pasar Bursa Efek Indonesia (IDX / BEI).
Menggunakan yfinance untuk mengambil data historis OHLCV dengan penyesuaian ticker '.JK'.
"""

from typing import Dict, Any, Tuple
import pandas as pd
import yfinance as yf


def normalize_idx_ticker(ticker: str) -> str:
    """
    Menstandarkan kode saham menjadi format ticker Bursa Efek Indonesia di Yahoo Finance.
    Contoh: 'BBCA' -> 'BBCA.JK', 'TLKM.JK' -> 'TLKM.JK'.
    """
    clean = ticker.strip().upper()
    if not clean.endswith(".JK"):
        clean = f"{clean}.JK"
    return clean


def fetch_idx_ohlcv(ticker: str, period: str = "5d") -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Mengambil data candlestick OHLCV 5 hari terakhir dari yfinance dan menghitung ringkasan statistik.
    
    Returns:
        Tuple: (DataFrame OHLCV, Dictionary ringkasan metrik pasar)
    """
    normalized_symbol = normalize_idx_ticker(ticker)
    yf_ticker = yf.Ticker(normalized_symbol)
    
    # Ambil data historis harian
    df = yf_ticker.history(period=period, interval="1d")
    
    if df.empty or len(df) < 1:
        raise ValueError(
            f"Tidak dapat menarik data pasar untuk '{normalized_symbol}'. "
            f"Pastikan ticker valid dan terdaftar di Bursa Efek Indonesia."
        )

    # Format timestamp index menjadi string tanggal ISO
    df.index = df.index.strftime("%Y-%m-%d")
    
    latest_row = df.iloc[-1]
    prev_close = df.iloc[-2]["Close"] if len(df) > 1 else latest_row["Open"]
    
    current_price = float(latest_row["Close"])
    change_point = current_price - float(prev_close)
    change_pct = (change_point / float(prev_close)) * 100 if prev_close > 0 else 0.0
    
    avg_volume = float(df["Volume"].mean())
    latest_volume = float(latest_row["Volume"])
    volume_ratio = (latest_volume / avg_volume) if avg_volume > 0 else 1.0

    summary = {
        "ticker": ticker.replace(".JK", "").upper(),
        "normalized_ticker": normalized_symbol,
        "current_price": round(current_price, 2),
        "open": round(float(latest_row["Open"]), 2),
        "high": round(float(latest_row["High"]), 2),
        "low": round(float(latest_row["Low"]), 2),
        "close": round(current_price, 2),
        "previous_close": round(float(prev_close), 2),
        "change_point": round(change_point, 2),
        "change_percentage": round(change_pct, 2),
        "latest_volume": int(latest_volume),
        "avg_5d_volume": int(avg_volume),
        "volume_spike_ratio": round(volume_ratio, 2),
        "5d_high": round(float(df["High"].max()), 2),
        "5d_low": round(float(df["Low"].min()), 2),
    }

    return df, summary


def format_ohlcv_for_llm(df: pd.DataFrame, summary: Dict[str, Any]) -> str:
    """
    Memformat data OHLCV menjadi teks terstruktur yang mudah dipahami oleh LLM.
    """
    lines = [
        f"=== RINGKASAN DATA PASAR BEI: {summary['ticker']} ({summary['normalized_ticker']}) ===",
        f"Harga Terakhir: Rp {summary['current_price']:,.0f} ({summary['change_percentage']:+.2f}%)",
        f"Rentang 5 Hari: Rp {summary['5d_low']:,.0f} - Rp {summary['5d_high']:,.0f}",
        f"Volume Terkini: {summary['latest_volume']:,} lembar (Rasio Volume vs Rata-rata 5H: {summary['volume_spike_ratio']}x)",
        "",
        "Histori Candlestick 5 Hari Terakhir (Open, High, Low, Close, Volume):",
    ]
    
    for date_str, row in df.iterrows():
        lines.append(
            f"- [{date_str}] O: {row['Open']:,.0f} | H: {row['High']:,.0f} | "
            f"L: {row['Low']:,.0f} | C: {row['Close']:,.0f} | Vol: {int(row['Volume']):,}"
        )
        
    return "\n".join(lines)
