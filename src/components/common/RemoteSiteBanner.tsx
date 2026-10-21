'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AnnouncementData {
  enabled: boolean;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  updatedAt?: string;
}

export default function RemoteSiteBanner() {
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchBanner() {
      try {
        const res = await fetch('/api/site/settings', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.ok && data.settings?.announcement) {
          const ann = data.settings.announcement;
          // Check if this specific message was dismissed in this session
          const dismissedMsg = sessionStorage.getItem('tradesims_dismissed_banner');
          if (dismissedMsg === ann.message) {
            setDismissed(true);
          } else {
            setDismissed(false);
          }
          setAnnouncement(ann);
        }
      } catch {
        // Silent fail on network issue
      }
    }

    fetchBanner();
    const interval = setInterval(fetchBanner, 30_000); // Polling setiap 30 detik untuk update instan
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!announcement || !announcement.enabled || !announcement.message || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (announcement?.message) {
      sessionStorage.setItem('tradesims_dismissed_banner', announcement.message);
    }
  };

  const getStyle = () => {
    switch (announcement.type) {
      case 'warning':
        return 'bg-amber-950/80 border-amber-500/40 text-amber-200';
      case 'alert':
        return 'bg-red-950/80 border-red-500/40 text-red-200';
      case 'success':
        return 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200';
      case 'info':
      default:
        return 'bg-cyan-950/80 border-cyan-500/40 text-cyan-200';
    }
  };

  const getIcon = () => {
    switch (announcement.type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'info':
      default:
        return <Megaphone className="w-4 h-4 text-cyan-400 shrink-0 animate-bounce" />;
    }
  };

  return (
    <div
      role="alert"
      className={`relative z-50 w-full px-4 py-2 border-b backdrop-blur-md flex items-center justify-between text-xs sm:text-sm font-medium transition-all duration-300 ${getStyle()}`}
    >
      <div className="flex items-center space-x-2.5 mx-auto max-w-7xl overflow-hidden pr-6">
        {getIcon()}
        <span className="truncate">
          <strong className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded mr-1.5 bg-white/10">
            Telegram Broadcast
          </strong>
          {announcement.message}
        </span>
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 rounded-md hover:bg-white/10 transition-colors opacity-75 hover:opacity-100 focus:outline-none"
        title="Tutup Pengumuman"
        aria-label="Tutup Pengumuman"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
