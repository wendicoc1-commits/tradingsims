'use client';

/**
 * TradeSim Pro — Cross-Tab Synchronization & Leader Election System
 * 
 * Memastikan pengalaman multi-tab yang mulus:
 * 1. Real-time State Sync: Saat tab A melakukan transaksi atau mengubah saldo,
 *    seluruh tab B, C, D langsung tersinkronisasi otomatis tanpa perlu refresh.
 * 2. Single Leader Election: Mencegah eksekusi ganda jika pengguna membuka banyak tab
 *    sekaligus. Hanya 1 tab yang bertindak sebagai "Leader" pengeksekusi bot background,
 *    sementara tab lain dalam mode Standby.
 * 3. Failover Otomatis: Jika tab Leader ditutup, tab standby langsung mengambil alih kepemimpinan.
 */

import { usePortfolioStore } from '@/store';
import { useAIAgentStore } from '@/store/aiAgentStore';
import { useWatchlistStore } from '@/store';

// Unik ID untuk setiap tab browser
export const CURRENT_TAB_ID = typeof window !== 'undefined'
  ? `tab_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`
  : 'server_tab';

const CHANNEL_NAME = 'tradesim_multitab_bus';
const LEADER_STORAGE_KEY = 'tradesim_leader_lease';
const LEASE_DURATION_MS = 6000; // 6 detik batas kedaluwarsa kepemimpinan
const HEARTBEAT_INTERVAL_MS = 2500; // 2.5 detik perpanjangan sewa

let broadcastChannel: BroadcastChannel | null = null;
let isCurrentlyLeader = false;
let leaderCheckTimer: NodeJS.Timeout | null = null;
let listenersInitialized = false;

type MultitabEvent =
  | { type: 'PORTFOLIO_CHANGED'; sourceTabId: string }
  | { type: 'AI_AGENT_CHANGED'; sourceTabId: string }
  | { type: 'WATCHLIST_CHANGED'; sourceTabId: string }
  | { type: 'TRADE_EXECUTED_ALERT'; sourceTabId: string; message: string }
  | { type: 'LEADER_HEARTBEAT'; leaderTabId: string; timestamp: number }
  | { type: 'LEADER_RESIGN'; leaderTabId: string };

/**
 * Inisialisasi kanal komunikasi broadcast antar tab
 */
function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!broadcastChannel && typeof BroadcastChannel !== 'undefined') {
    try {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      // Fallback untuk browser yang membatasi BroadcastChannel
      broadcastChannel = null;
    }
  }
  return broadcastChannel;
}

/**
 * Kirim sinyal broadcast ke seluruh tab lain
 */
export function broadcastEvent(event: Omit<MultitabEvent, 'sourceTabId'>) {
  if (typeof window === 'undefined') return;
  const channel = getChannel();
  const payload = { ...event, sourceTabId: CURRENT_TAB_ID } as MultitabEvent;
  
  if (channel) {
    try {
      channel.postMessage(payload);
    } catch {
      // Channel send error handled
    }
  }
}

/**
 * Periksa apakah tab saat ini adalah Leader aktif
 */
export function isTabLeader(): boolean {
  return isCurrentlyLeader;
}

/**
 * Logika pemilihan pemimpin (Leader Election) antar tab
 */
function checkAndRenewLeadership() {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(LEADER_STORAGE_KEY);
    const now = Date.now();
    let currentLeader: { tabId: string; expiresAt: number } | null = null;

    if (raw) {
      try {
        currentLeader = JSON.parse(raw);
      } catch {
        currentLeader = null;
      }
    }

    const isLeaseExpired = !currentLeader || now > currentLeader.expiresAt;
    const isCurrentLeaderMe = currentLeader?.tabId === CURRENT_TAB_ID;

    if (isCurrentLeaderMe) {
      // Perpanjang sewa kepemimpinan tab ini
      isCurrentlyLeader = true;
      localStorage.setItem(
        LEADER_STORAGE_KEY,
        JSON.stringify({ tabId: CURRENT_TAB_ID, expiresAt: now + LEASE_DURATION_MS })
      );
    } else if (isLeaseExpired) {
      // Pemimpin sebelumnya sudah tutup / kadaluwarsa, ambil alih kepemimpinan
      isCurrentlyLeader = true;
      localStorage.setItem(
        LEADER_STORAGE_KEY,
        JSON.stringify({ tabId: CURRENT_TAB_ID, expiresAt: now + LEASE_DURATION_MS })
      );
      // Sinyal ke tab lain bahwa ada leader baru
      broadcastEvent({ type: 'LEADER_HEARTBEAT', leaderTabId: CURRENT_TAB_ID, timestamp: now });
    } else {
      // Tab lain sedang aktif menjadi Leader
      isCurrentlyLeader = false;
    }
  } catch {
    // LocalStorage fallback
  }
}

/**
 * Rehydrate seluruh store di memori tab saat ada update dari tab lain
 */
export function rehydrateAllStores() {
  try {
    if (usePortfolioStore.persist?.rehydrate) {
      usePortfolioStore.persist.rehydrate();
    }
  } catch {}

  try {
    if (useAIAgentStore.persist?.rehydrate) {
      useAIAgentStore.persist.rehydrate();
    }
  } catch {}

  try {
    if (useWatchlistStore.persist?.rehydrate) {
      useWatchlistStore.persist.rehydrate();
    }
  } catch {}
}

/**
 * Pasang pendengar sinkronisasi multi-tab
 */
export function initCrossTabSync(onTradeAlert?: (message: string) => void): () => void {
  if (typeof window === 'undefined' || listenersInitialized) {
    return () => {};
  }
  listenersInitialized = true;

  // 1. Inisialisasi Leader Lease
  checkAndRenewLeadership();
  leaderCheckTimer = setInterval(checkAndRenewLeadership, HEARTBEAT_INTERVAL_MS);

  // 2. BroadcastChannel Listener (Sub-millisecond inter-tab sync)
  const channel = getChannel();
  const handleBroadcastMessage = (event: MessageEvent<MultitabEvent>) => {
    const data = event.data;
    if (!data || data.sourceTabId === CURRENT_TAB_ID) return;

    switch (data.type) {
      case 'PORTFOLIO_CHANGED':
        try {
          usePortfolioStore.persist?.rehydrate?.();
        } catch {}
        break;

      case 'AI_AGENT_CHANGED':
        try {
          useAIAgentStore.persist?.rehydrate?.();
        } catch {}
        break;

      case 'WATCHLIST_CHANGED':
        try {
          useWatchlistStore.persist?.rehydrate?.();
        } catch {}
        break;

      case 'TRADE_EXECUTED_ALERT':
        // Rehydrate portofolio seketika
        try {
          usePortfolioStore.persist?.rehydrate?.();
          useAIAgentStore.persist?.rehydrate?.();
        } catch {}
        if (onTradeAlert && data.message) {
          onTradeAlert(data.message);
        }
        break;

      case 'LEADER_RESIGN':
        // Leader tab ditutup, langsung coba klaim
        checkAndRenewLeadership();
        break;
    }
  };

  if (channel) {
    channel.addEventListener('message', handleBroadcastMessage);
  }

  // 3. Fallback: window storage event (Didukung 100% oleh semua browser)
  const handleStorageEvent = (e: StorageEvent) => {
    if (!e.key) return;

    if (e.key === 'stockbit_portfolio_storage_v2') {
      try {
        usePortfolioStore.persist?.rehydrate?.();
      } catch {}
    } else if (e.key === 'fincept-ai-agent-storage') {
      try {
        useAIAgentStore.persist?.rehydrate?.();
      } catch {}
    } else if (e.key === 'stockbit_watchlists_v2') {
      try {
        useWatchlistStore.persist?.rehydrate?.();
      } catch {}
    } else if (e.key === LEADER_STORAGE_KEY) {
      checkAndRenewLeadership();
    }
  };

  window.addEventListener('storage', handleStorageEvent);

  // 4. Bersihkan saat tab ditutup (unload)
  const handleBeforeUnload = () => {
    if (isCurrentlyLeader) {
      try {
        localStorage.removeItem(LEADER_STORAGE_KEY);
      } catch {}
      broadcastEvent({ type: 'LEADER_RESIGN', leaderTabId: CURRENT_TAB_ID });
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    if (leaderCheckTimer) clearInterval(leaderCheckTimer);
    if (channel) {
      channel.removeEventListener('message', handleBroadcastMessage);
    }
    window.removeEventListener('storage', handleStorageEvent);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    listenersInitialized = false;
  };
}
