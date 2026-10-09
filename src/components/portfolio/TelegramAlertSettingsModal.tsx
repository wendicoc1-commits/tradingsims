'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';

interface TelegramAlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TelegramAlertSettingsModal({ isOpen, onClose }: TelegramAlertSettingsModalProps) {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('TRADEMIND_TELEGRAM_BOT_TOKEN') || '';
      const savedChatId = localStorage.getItem('TRADEMIND_TELEGRAM_CHAT_ID') || '';
      const savedEnabled = localStorage.getItem('TRADEMIND_TELEGRAM_ENABLED') !== 'false';
      setBotToken(savedToken);
      setChatId(savedChatId);
      setEnabled(savedEnabled);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('TRADEMIND_TELEGRAM_BOT_TOKEN', botToken.trim());
      localStorage.setItem('TRADEMIND_TELEGRAM_CHAT_ID', chatId.trim());
      localStorage.setItem('TRADEMIND_TELEGRAM_ENABLED', String(enabled));
    }
    setTestStatus({ success: true, message: '✅ Pengaturan notifikasi Telegram berhasil disimpan!' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleTestAlert = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setTestStatus({
        success: false,
        message: '⚠️ Harap isi Bot Token dan Chat ID Telegram Anda terlebih dahulu!',
      });
      return;
    }

    setIsTesting(true);
    setTestStatus(null);

    const testMessage = `🚀 *TradeSim Quant 24/7 Alert Test*\n\n✅ Koneksi Telegram Terverifikasi Berhasil!\n\n🤖 *Daemon Status:* Online di VPS KVM (Port 8002)\n📊 *Monitoring Pasangan:* BTC, ETH, SOL, IDX Bluechips\n🛡️ *Guardrail:* Take Profit, Trailing Stop, & Flash Crash Kill-Switch Aktif.\n\n_Anda akan menerima notifikasi instan setiap kali AI mengeksekusi order!_`;

    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: testMessage,
          parse_mode: 'Markdown',
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setTestStatus({
          success: true,
          message: '🎉 Notifikasi tes berhasil terkirim ke Telegram HP Anda!',
        });
      } else {
        setTestStatus({
          success: false,
          message: `Gagal: ${data.description || 'Token atau Chat ID tidak valid'}`,
        });
      }
    } catch {
      setTestStatus({
        success: false,
        message: 'Gagal terhubung ke Telegram API. Periksa koneksi internet Anda.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Notifikasi Instan Telegram 24/7
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                Live Webhook
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Terima alert langsung di smartphone saat AI mengeksekusi BUY, SELL, TP, atau SL di VPS.
            </p>
          </div>
        </div>

        {/* Body Fields */}
        <div className="space-y-4 my-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Telegram Bot Token
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Contoh: 7182948192:AAH9f..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Didapatkan dari chat dengan{' '}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noreferrer"
                className="text-sky-500 underline inline-flex items-center gap-0.5"
              >
                @BotFather <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Telegram Chat ID Anda
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Contoh: 123456789"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Didapatkan dari chat dengan{' '}
              <a
                href="https://t.me/userinfobot"
                target="_blank"
                rel="noreferrer"
                className="text-sky-500 underline inline-flex items-center gap-0.5"
              >
                @userinfobot <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          {/* Toggle Alert Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <Smartphone className="h-4 w-4 text-zinc-500" />
              <div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                  Aktifkan Push Alert ke Smartphone
                </span>
                <span className="text-[10px] text-zinc-400">
                  Kirim notifikasi setiap kali order dibuka atau ditutup
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
          </div>

          {/* Status Message */}
          {testStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testStatus.success
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {testStatus.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
              <span>{testStatus.message}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleTestAlert}
            disabled={isTesting}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {isTesting ? 'Mengirim...' : 'Tes Notifikasi'}
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="h-4 w-4" />
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  );
}
