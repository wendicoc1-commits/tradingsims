'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ShareWebsiteButtonProps {
  variant?: 'navbar' | 'hero' | 'floating' | 'tool';
  customUrl?: string;
  customTitle?: string;
  className?: string;
}

export default function ShareWebsiteButton({
  variant = 'navbar',
  customUrl,
  customTitle,
  className = '',
}: ShareWebsiteButtonProps) {
  const [copied, setCopied] = useState(false);

  const getShareData = () => {
    const url =
      customUrl ||
      (typeof window !== 'undefined'
        ? window.location.href
        : 'https://www.tradingsims.my.id');
    const title =
      customTitle ||
      'TradeSim Pro — #1 Institutional Trading Simulator Indonesia (Saldo Virtual Rp 50 Juta)';
    const text =
      'Latihan trading saham Indonesia (BEI / IDX) dan crypto spot 24/7 dengan data pasar real-time dan orderbook Level 2 gratis di TradeSim Pro:';

    return { url, title, text };
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { url, title, text } = getShareData();

    // 1. Coba Web Share API bawaan perangkat (Mobile WhatsApp, Telegram, dll)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${text}\n${url}`,
          url,
        });
        toast.success('Berhasil membuka menu bagikan!');
        return;
      } catch (err: any) {
        // Jika user membatalkan share, abaikan. Jika error izin, fallback ke clipboard
        if (err.name === 'AbortError') return;
      }
    }

    // 2. Fallback: Salin URL ke Clipboard
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link website berhasil disalin ke clipboard!', {
          description: url,
        });
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      // Fallback klasik jika clipboard API diblokir
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      toast.success('Link website berhasil disalin!', { description: url });
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (variant === 'hero') {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={`px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-emerald-500/40 text-zinc-200 hover:text-white font-mono text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-md active:scale-95 ${className}`}
        title="Bagikan link TradeSim Pro ke teman atau grup trader"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400">LINK DISALIN!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>BAGIKAN LINK WEBSITE</span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'floating') {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={`fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-[#0d111a]/90 hover:bg-[#121824] border border-emerald-500/40 text-white shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2 font-mono text-xs font-bold backdrop-blur-xl group cursor-pointer active:scale-95 ${className}`}
        title="Bagikan website ke teman / WhatsApp"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 pr-1">Tersalin!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-zinc-200 group-hover:text-white pr-1">
              Bagikan
            </span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'tool') {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={`px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer ${className}`}
        title="Salin dan bagikan link alat ini"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">Link Tersalin</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-zinc-400" />
            <span>Salin Link</span>
          </>
        )}
      </button>
    );
  }

  // Default: navbar
  return (
    <button
      type="button"
      onClick={handleShare}
      className={`px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 text-zinc-300 hover:text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${className}`}
      title="Salin link website untuk dibagikan"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400">Link Tersalin!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bagikan</span>
        </>
      )}
    </button>
  );
}
