'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { usePortfolioStore, waitForPortfolioHydration, sanitizeHoldings } from '@/store';

let isSyncingPortfolio = false;
let needsPortfolioReSync = false;
let activeLoadPortfolioPromise: Promise<void> | null = null;

const BACKUP_STORAGE_PREFIX = 'tradingsims_user_backup_';

function saveLocalUserBackup(email: string, userId: string, data: any) {
  if (typeof window === 'undefined' || !email) return;
  try {
    const key = BACKUP_STORAGE_PREFIX + email.trim().toLowerCase();
    localStorage.setItem(key, JSON.stringify({
      email: email.trim().toLowerCase(),
      userId,
      portfolio: data,
      timestamp: Date.now(),
    }));
  } catch {}
}

import SEED_DATABASE from '@/data/server_user_portfolios.json';

function loadLocalUserBackup(email: string): any | null {
  if (!email) return null;
  const normEmail = email.trim().toLowerCase();
  if (typeof window !== 'undefined') {
    try {
      const key = BACKUP_STORAGE_PREFIX + normEmail;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.portfolio && typeof parsed.portfolio.cash === 'number') {
          return parsed.portfolio;
        }
      }
    } catch {}
  }
  // Fallback cadangan dari static seed bundle jika user membuka di device / browser baru!
  const seedPort = (SEED_DATABASE as any)?.portfolios?.[normEmail];
  if (seedPort && typeof seedPort.cash === 'number') {
    return seedPort;
  }
  return null;
}


export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  provider: 'email' | 'apple' | 'facebook' | 'google' | 'guest';
  role: 'member' | 'admin';
  createdAt: string;
}

interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  isConfigured: boolean;
  authError: string | null;

  // Actions
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (email: string, pass: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (email: string, newPassword: string, confirmPassword?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  loginWithOAuth: (provider: 'apple' | 'facebook' | 'google') => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: (guestName?: string) => void;
  enterGuestMode: (guestName?: string) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  syncPortfolioToDatabase: () => Promise<void>;
  deleteHoldingFromDatabase: (symbol: string) => Promise<void>;
  resetPortfolioInDatabase: () => Promise<void>;
  loadPortfolioFromDatabase: () => Promise<void>;
  recordOrderToDatabase: (order: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isConfigured: isSupabaseConfigured,
      authError: null,

      loginWithEmail: async (email: string, pass: string) => {
        set({ isLoading: true, authError: null });

        try {
          const apiRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password: pass }),
          });
          const apiData = await apiRes.json();

          if (apiData.success && apiData.user) {
            // 1. ISOLASI TOTAL: Bersihkan portofolio lokal lama agar sisa data akun sebelumnya tidak bocor!
            usePortfolioStore.setState({
              cash: 0,
              realizedPL: 0,
              holdings: [],
              orders: [],
              conditionalOrders: [],
              dividends: [],
              lastUpdated: Date.now(),
            });

            const appUser: AppUser = {
              id: apiData.user.id,
              email: apiData.user.email,
              fullName: apiData.user.fullName,
              provider: 'email',
              role: 'member',
              createdAt: apiData.user.createdAt,
            };
            set({ user: appUser, isLoading: false });

            // 2. Pulihkan data portofolio cloud KHUSUS milik akun ini yang dikembalikan oleh server
            let resolvedPortfolio = (apiData.portfolio && typeof apiData.portfolio.cash === 'number')
              ? apiData.portfolio
              : null;

            // Jika server cloud belum membalas, ATAU mengembalikan 100 Juta kosong padahal akun punya aset di backup/seed:
            const localBackup = loadLocalUserBackup(apiData.user.email);
            if (
              !resolvedPortfolio ||
              (resolvedPortfolio.cash === 100_000_000 &&
                (!resolvedPortfolio.holdings || resolvedPortfolio.holdings.length === 0) &&
                localBackup &&
                (localBackup.holdings?.length > 0 || localBackup.cash !== 100_000_000))
            ) {
              if (localBackup && typeof localBackup.cash === 'number') {
                resolvedPortfolio = localBackup;
              }
            }

            if (resolvedPortfolio && typeof resolvedPortfolio.cash === 'number') {
              const sPort = resolvedPortfolio;
              usePortfolioStore.setState({
                cash: typeof sPort.cash === 'number' ? sPort.cash : 100_000_000,
                realizedPL: sPort.realizedPL || 0,
                holdings: sanitizeHoldings(Array.isArray(sPort.holdings) ? sPort.holdings : []),
                orders: Array.isArray(sPort.orders) ? sPort.orders : [],
                conditionalOrders: Array.isArray(sPort.conditionalOrders) ? sPort.conditionalOrders : [],
                dividends: Array.isArray(sPort.dividends) ? sPort.dividends : [],
                lastUpdated: sPort.lastUpdated || Date.now(),
              });
              // Simpan ulang ke backup lokal dan unggah ke cloud
              saveLocalUserBackup(apiData.user.email, apiData.user.id, sPort);
              await get().syncPortfolioToDatabase();
            } else {
              // Jika ini akun baru pertama kali, beri modal awal bersih Rp 100 Juta
              const initialNewPort = {
                cash: 100_000_000,
                realizedPL: 0,
                holdings: [],
                orders: [],
                conditionalOrders: [],
                dividends: [],
                lastUpdated: Date.now(),
              };
              usePortfolioStore.setState(initialNewPort);
              saveLocalUserBackup(apiData.user.email, apiData.user.id, initialNewPort);
              await get().syncPortfolioToDatabase();
            }

            // Sync ke Supabase di background jika memungkinkan
            if (isSupabaseConfigured) {
              try {
                const supabase = getSupabaseBrowserClient();
                await supabase.auth.signInWithPassword({ email: email.trim(), password: pass }).catch(() => {});
              } catch {}
            }

            return { success: true };
          } else {
            // LOGIN DITOLAK (password salah atau akun tidak ditemukan)
            const errorMsg = apiData.error || 'Email atau password salah.';
            set({ authError: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
          }
        } catch (serverErr: any) {
          console.error('[LOGIN NETWORK ERROR]', serverErr);
          const errorMsg = 'Gagal terhubung ke server login. Silakan periksa koneksi Anda.';
          set({ authError: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      registerWithEmail: async (email: string, pass: string, fullName: string) => {
        set({ isLoading: true, authError: null });

        try {
          const apiRes = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password: pass, fullName: fullName.trim() }),
          });
          const apiData = await apiRes.json();

          if (apiData.success && apiData.user) {
            // Bersihkan portofolio lokal lama dan berikan modal awal murni Rp 100 Juta untuk member baru
            usePortfolioStore.setState({
              cash: 100_000_000,
              realizedPL: 0,
              holdings: [],
              orders: [],
              conditionalOrders: [],
              dividends: [],
              lastUpdated: Date.now(),
            });

            const appUser: AppUser = {
              id: apiData.user.id,
              email: apiData.user.email,
              fullName: apiData.user.fullName,
              provider: 'email',
              role: 'member',
              createdAt: apiData.user.createdAt,
            };
            set({ user: appUser, isLoading: false });

            // Simpan portofolio modal awal ke server cloud untuk akun baru ini
            await get().syncPortfolioToDatabase();

            // Background Supabase signup jika terkonfigurasi
            if (isSupabaseConfigured) {
              try {
                const supabase = getSupabaseBrowserClient();
                await supabase.auth.signUp({
                  email: email.trim(),
                  password: pass,
                  options: { data: { full_name: fullName.trim() } },
                }).catch(() => {});
              } catch {}
            }

            return { success: true };
          } else {
            // REGISTRASI DITOLAK (misal email sudah terdaftar)
            const errorMsg = apiData.error || 'Pendaftaran gagal.';
            set({ authError: errorMsg, isLoading: false });
            return { success: false, error: errorMsg };
          }
        } catch (serverErr: any) {
          console.error('[REGISTER NETWORK ERROR]', serverErr);
          const errorMsg = 'Gagal terhubung ke server pendaftaran. Silakan periksa koneksi Anda.';
          set({ authError: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      changePassword: async (email: string, newPassword: string, confirmPassword?: string) => {
        set({ isLoading: true, authError: null });

        try {
          const apiRes = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), newPassword, confirmPassword }),
          });
          const apiData = await apiRes.json();

          if (apiData.success) {
            set({ isLoading: false });
            return { success: true, message: apiData.message };
          }

          set({ authError: apiData.error || 'Gagal mengubah password', isLoading: false });
          return { success: false, error: apiData.error || 'Gagal mengubah password' };
        } catch (serverErr: any) {
          console.error('[CHANGE PASSWORD NETWORK ERROR]', serverErr);
          const errorMsg = 'Gagal terhubung ke server saat mengubah password.';
          set({ authError: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      loginWithOAuth: async (provider: 'apple' | 'facebook' | 'google') => {
        set({ isLoading: true, authError: null });

        if (!isSupabaseConfigured) {
          // Demo fallback dengan ID & email stabil per provider
          const providerName = provider === 'apple' ? 'Apple Member' : provider === 'facebook' ? 'Facebook Member' : 'Google Member';
          const oauthEmail = `oauth-${provider}@tradingsims.my.id`;
          const mockUser: AppUser = {
            id: `usr-oauth-${provider}`,
            email: oauthEmail,
            fullName: providerName,
            provider,
            role: 'member',
            createdAt: '2026-01-01T00:00:00.000Z',
          };
          // Bersihkan portofolio lama sebelum beralih
          usePortfolioStore.setState({
            cash: 0,
            realizedPL: 0,
            holdings: [],
            orders: [],
            conditionalOrders: [],
            dividends: [],
            lastUpdated: Date.now(),
          });
          set({ user: mockUser, isLoading: false });
          await get().loadPortfolioFromDatabase();
          return { success: true };
        }

        try {
          const supabase = getSupabaseBrowserClient();
          const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;

          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: redirectUrl,
            },
          });

          if (error) {
            set({ authError: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          set({ isLoading: false });
          return { success: true };
        } catch (err: any) {
          set({ authError: err.message, isLoading: false });
          return { success: false, error: err.message };
        }
      },

      loginAsGuest: (guestName = 'Tamu Demo') => {
        const currentPort = usePortfolioStore.getState();
        const hasExistingAssets = currentPort.holdings.length > 0 || (currentPort.cash > 0 && currentPort.cash !== 100_000_000) || currentPort.orders.length > 0;

        // Hanya beri modal awal 100 Juta jika browser benar-benar belum memiliki portofolio/transaksi sama sekali
        if (!hasExistingAssets && (currentPort.cash <= 0 || currentPort.holdings.length === 0)) {
          usePortfolioStore.setState({
            cash: 100_000_000,
            realizedPL: 0,
            holdings: [],
            orders: [],
            conditionalOrders: [],
            dividends: [],
            lastUpdated: Date.now(),
          });
        }
        const guestUser: AppUser = {
          id: `guest-${Date.now()}`,
          email: 'demo@tradingsims.my.id',
          fullName: guestName,
          provider: 'guest',
          role: 'member',
          createdAt: new Date().toISOString(),
        };
        set({ user: guestUser });
      },

      enterGuestMode: (guestName = 'Tamu Demo') => {
        get().loginAsGuest(guestName);
      },

      logout: async () => {
        const currentUser = get().user;
        if (currentUser && currentUser.email && currentUser.provider !== 'guest') {
          const currentPort = usePortfolioStore.getState();
          if (currentPort && (currentPort.cash > 0 || currentPort.holdings.length > 0)) {
            saveLocalUserBackup(currentUser.email, currentUser.id, {
              cash: currentPort.cash,
              realizedPL: currentPort.realizedPL,
              holdings: currentPort.holdings,
              orders: currentPort.orders,
              conditionalOrders: currentPort.conditionalOrders,
              dividends: currentPort.dividends,
              lastUpdated: currentPort.lastUpdated || Date.now(),
            });
          }
        }

        if (isSupabaseConfigured) {
          try {
            const supabase = getSupabaseBrowserClient();
            await supabase.auth.signOut();
          } catch {
            // Ignore
          }
        }
        // RESET BERSIH PORTOFOLIO DI MEMORI AGAR TIDAK BOCOR KE AKUN BERIKUTNYA
        usePortfolioStore.setState({
          cash: 0,
          realizedPL: 0,
          holdings: [],
          orders: [],
          conditionalOrders: [],
          dividends: [],
          lastUpdated: Date.now(),
        });
        set({ user: null });
      },

      checkSession: async () => {
        const currentUser = get().user;
        if (currentUser && currentUser.email) {
          // Selalu sinkronkan portofolio terbaru dari server cloud
          await get().loadPortfolioFromDatabase();
          return;
        }

        // Jika user di device belum login tapi ada data lokal, jangan lakukan apa-apa
        if (!isSupabaseConfigured) return;

        try {
          const supabase = getSupabaseBrowserClient();
          const { data } = await supabase.auth.getSession();

          if (data.session?.user) {
            const u = data.session.user;
            const appUser: AppUser = {
              id: u.id,
              email: u.email || '',
              fullName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Member',
              avatarUrl: u.user_metadata?.avatar_url || null,
              provider: (u.app_metadata?.provider as any) || 'email',
              role: (u.user_metadata?.role as any) || 'member',
              createdAt: u.created_at || new Date().toISOString(),
            };
            set({ user: appUser });
            await get().loadPortfolioFromDatabase();
          }
        } catch {
          // Session error
        }
      },

      // Sinkronisasi data portofolio dari frontend ke Server Cloud Sync & Supabase
      syncPortfolioToDatabase: async () => {
        const user = get().user;
        if (!user || user.provider === 'guest') return;

        if (isSyncingPortfolio) {
          needsPortfolioReSync = true;
          return;
        }

        isSyncingPortfolio = true;
        try {
          do {
            needsPortfolioReSync = false;
            await waitForPortfolioHydration();
            const currentUser = get().user;
            if (!currentUser || currentUser.provider === 'guest') break;

            const portStore = usePortfolioStore.getState();
            saveLocalUserBackup(currentUser.email, currentUser.id, {
              cash: portStore.cash,
              realizedPL: portStore.realizedPL,
              holdings: portStore.holdings,
              orders: portStore.orders,
              conditionalOrders: portStore.conditionalOrders,
              dividends: portStore.dividends,
              lastUpdated: portStore.lastUpdated || Date.now(),
            });

            // 1. Simpan ke Server Cloud Sync (menjamin data tersinkron antar browser apa pun!)
            try {
              await fetch('/api/portfolio/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: currentUser.email,
                  userId: currentUser.id,
                  cash: portStore.cash,
                  realizedPL: portStore.realizedPL,
                  holdings: portStore.holdings,
                  orders: portStore.orders,
                  conditionalOrders: portStore.conditionalOrders,
                  dividends: portStore.dividends,
                  lastUpdated: portStore.lastUpdated || Date.now(),
                }),
              });
            } catch (err) {
              console.warn('[SERVER PORTFOLIO SYNC WARN]', err);
            }

            // 2. Simpan juga ke Supabase Database jika terkonfigurasi (Langsung ke tabel user_portfolios)
            if (isSupabaseConfigured) {
              try {
                const supabase = getSupabaseBrowserClient();
                const updatedAtIso = new Date(portStore.lastUpdated || Date.now()).toISOString();

                await supabase.from('user_portfolios').upsert({
                  user_id: currentUser.id,
                  email: currentUser.email.toLowerCase(),
                  cash: portStore.cash,
                  realized_pl: portStore.realizedPL,
                  holdings: portStore.holdings,
                  orders: portStore.orders,
                  conditional_orders: portStore.conditionalOrders || [],
                  dividends: portStore.dividends || [],
                  last_updated: portStore.lastUpdated || Date.now(),
                  updated_at: updatedAtIso,
                }, { onConflict: 'user_id' }).catch(() => {});
              } catch {}
            }
          } while (needsPortfolioReSync);
        } catch (err) {
          console.error('[PORTFOLIO SYNC ERROR]', err);
        } finally {
          isSyncingPortfolio = false;
        }
      },

      // Hapus satu posisi holding secara instan saat posisi ditutup habis
      deleteHoldingFromDatabase: async (symbol: string) => {
        const user = get().user;
        if (!user || user.provider === 'guest') return;

        // Segera simpan status portofolio terbaru ke cloud
        await get().syncPortfolioToDatabase();

        if (isSupabaseConfigured) {
          try {
            const supabase = getSupabaseBrowserClient();
            const clean = symbol.replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
            await supabase
              .from('holdings')
              .delete()
              .eq('user_id', user.id)
              .or(`symbol.eq.${symbol},symbol.eq.${clean},symbol.eq.${clean}.JK,symbol.eq.${clean}USDT,display_symbol.eq.${clean}`);
          } catch (err) {
            console.error('[SUPABASE DELETE HOLDING ERROR]', err);
          }
        }
      },

      // Reset total portofolio di database ke modal awal bersih
      resetPortfolioInDatabase: async (targetCash: number = 0) => {
        const user = get().user;
        if (!user || user.provider === 'guest') return;

        try {
          await fetch(`/api/portfolio/sync?email=${encodeURIComponent(user.email)}&userId=${encodeURIComponent(user.id)}&nominal=${targetCash}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.warn('[SERVER RESET PORTFOLIO WARN]', err);
        }

        if (isSupabaseConfigured) {
          try {
            const supabase = getSupabaseBrowserClient();
            await supabase.from('portfolios').upsert({
              user_id: user.id,
              cash: targetCash,
              realized_pl: 0,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' }).catch(() => {});
            await supabase.from('holdings').delete().eq('user_id', user.id).catch(() => {});
            await supabase.from('orders').delete().eq('user_id', user.id).catch(() => {});
          } catch (err) {
            console.error('[SUPABASE RESET PORTFOLIO ERROR]', err);
          }
        }
      },

      // Simpan riwayat transaksi order individual ke tabel orders Supabase dengan antrean offline otomatis
      recordOrderToDatabase: async (order: any) => {
        const user = get().user;
        if (!user || user.provider === 'guest') return;

        // Sinkronkan ke cloud
        await get().syncPortfolioToDatabase();

        const orderPayload = {
          id: order.id,
          user_id: user.id,
          symbol: order.symbol,
          display_symbol: order.displaySymbol,
          type: order.type,
          order_type: order.orderType,
          price: order.price,
          lots: order.assetClass === 'CRYPTO' ? (order.cryptoUnits ?? order.lots) : Math.max(1, Math.round(order.lots || 1)),
          shares: order.shares || (order.assetClass === 'CRYPTO' ? order.lots : order.lots * 100),
          total: order.total,
          fee: order.fee || 0,
          broker_fee: order.brokerFee || 0,
          tax_fee: order.taxFee || 0,
          status: order.status || 'FILLED',
          realized_pl: order.realizedPL ?? null,
          created_at: order.createdAt || new Date().toISOString(),
          filled_at: order.filledAt || new Date().toISOString(),
        };

        if (isSupabaseConfigured) {
          try {
            const supabase = getSupabaseBrowserClient();
            const { error: insertErr } = await supabase.from('orders').insert(orderPayload);
            if (insertErr) throw insertErr;

            // Jika ada antrean order tertunda sebelumnya, coba kirim ulang sekarang
            if (typeof window !== 'undefined') {
              try {
                const pending = JSON.parse(localStorage.getItem('tradesim_failed_orders') || '[]');
                if (Array.isArray(pending) && pending.length > 0) {
                  const remaining: any[] = [];
                  for (const p of pending) {
                    const { error } = await supabase.from('orders').insert(p);
                    if (error) remaining.push(p);
                  }
                  localStorage.setItem('tradesim_failed_orders', JSON.stringify(remaining));
                }
              } catch {}
            }
          } catch (err) {
            console.warn('[SUPABASE ORDER LOG OFFLINE QUEUED]', err);
            // Simpan ke offline queue di browser agar tidak hilang saat jaringan offline
            if (typeof window !== 'undefined') {
              try {
                const pending = JSON.parse(localStorage.getItem('tradesim_failed_orders') || '[]');
                pending.push(orderPayload);
                localStorage.setItem('tradesim_failed_orders', JSON.stringify(pending.slice(-100)));
              } catch {}
            }
          }
        }
      },

      // Ambil data portofolio dari Server Cloud Sync & Supabase saat login di browser apa pun
      loadPortfolioFromDatabase: async () => {
        const user = get().user;
        if (!user || user.provider === 'guest') return;

        if (activeLoadPortfolioPromise) {
          return activeLoadPortfolioPromise;
        }

        activeLoadPortfolioPromise = (async () => {
          try {
            await waitForPortfolioHydration();
            const localStore = usePortfolioStore.getState();
            const hasLocalHoldings = Array.isArray(localStore.holdings) && localStore.holdings.length > 0;
            const hasLocalOrders = Array.isArray(localStore.orders) && localStore.orders.length > 0;
            const localTime = localStore.lastUpdated || 0;

            // 1. Ambil dari Server Cloud Sync API (LINTAS BROWSER)
            try {
              const res = await fetch(`/api/portfolio/sync?email=${encodeURIComponent(user.email)}&userId=${encodeURIComponent(user.id)}`, {
                cache: 'no-store',
              });
              const data = await res.json();

              if (data.success) {
                if (data.portfolio && typeof data.portfolio.cash === 'number') {
                  const sPort = data.portfolio;
                  const hasServerHoldings = Array.isArray(sPort.holdings) && sPort.holdings.length > 0;
                  const hasServerOrders = Array.isArray(sPort.orders) && sPort.orders.length > 0;
                  const serverTime = sPort.lastUpdated || 0;

                  // Cek apakah browser saat ini adalah "fresh device" (misal baru buka/login di HP atau browser lain)
                  const isLocalFresh = !hasLocalHoldings && (!hasLocalOrders || localStore.cash <= 0 || (localStore.cash === 100_000_000 && !hasLocalOrders));

                  // KASUS 1: Browser saat ini adalah perangkat baru / belum punya transaksi riil
                  // Atau server memiliki kepemilikan saham aktif sedangkan lokal belum punya
                  if (isLocalFresh || (hasServerHoldings && !hasLocalHoldings)) {
                    // Jika server kosong 100M tapi kita punya data riil di backup lokal / seed, prioritaskan backup lokal
                    const fallbackBackup = loadLocalUserBackup(user.email);
                    const effectivePort = (!hasServerHoldings && sPort.cash === 100_000_000 && fallbackBackup && (fallbackBackup.holdings?.length > 0 || fallbackBackup.cash !== 100_000_000))
                      ? fallbackBackup
                      : sPort;

                    usePortfolioStore.setState({
                      cash: typeof effectivePort.cash === 'number' ? effectivePort.cash : 100_000_000,
                      realizedPL: effectivePort.realizedPL || 0,
                      holdings: sanitizeHoldings(Array.isArray(effectivePort.holdings) ? effectivePort.holdings : []),
                      orders: Array.isArray(effectivePort.orders) ? effectivePort.orders : [],
                      conditionalOrders: Array.isArray(effectivePort.conditionalOrders) ? effectivePort.conditionalOrders : [],
                      dividends: Array.isArray(effectivePort.dividends) ? effectivePort.dividends : [],
                      lastUpdated: Math.max(effectivePort.lastUpdated || serverTime, Date.now()),
                    });
                    if (effectivePort === fallbackBackup) {
                      await get().syncPortfolioToDatabase();
                    }
                    return;
                  }

                  // KASUS 2: Browser lokal memiliki saham aktif, tetapi server kosong atau belum diperbarui
                  // JANGAN PERNAH MENIMPA SAHAM LOKAL DENGAN DATA KOSONG!
                  if (hasLocalHoldings && !hasServerHoldings) {
                    // Segera amankan dan sinkronkan portofolio lokal ke cloud server
                    await get().syncPortfolioToDatabase();
                    return;
                  }

                  // KASUS 3: Keduanya memiliki riwayat / saham
                  if (hasServerHoldings && hasLocalHoldings) {
                    if (serverTime >= localTime) {
                      // Data di server lebih baru (transaksi di device/tab lain)
                      usePortfolioStore.setState({
                        cash: sPort.cash,
                        realizedPL: sPort.realizedPL || 0,
                        holdings: sanitizeHoldings(sPort.holdings),
                        orders: Array.isArray(sPort.orders) ? sPort.orders : [],
                        conditionalOrders: Array.isArray(sPort.conditionalOrders) ? sPort.conditionalOrders : [],
                        dividends: Array.isArray(sPort.dividends) ? sPort.dividends : [],
                        lastUpdated: serverTime,
                      });
                      return;
                    } else {
                      // Data lokal sama atau lebih baru: unggah ke server
                      await get().syncPortfolioToDatabase();
                      return;
                    }
                  }

                  // KASUS 4: Keduanya tidak memiliki saham aktif (misal seluruh saham sudah dijual atau hanya kas)
                  if (!hasServerHoldings && !hasLocalHoldings) {
                    if (serverTime >= localTime || isLocalFresh || localStore.cash <= 0) {
                      usePortfolioStore.setState({
                        cash: typeof sPort.cash === 'number' ? sPort.cash : 100_000_000,
                        realizedPL: sPort.realizedPL || 0,
                        orders: Array.isArray(sPort.orders) ? sPort.orders : localStore.orders,
                        conditionalOrders: Array.isArray(sPort.conditionalOrders) ? sPort.conditionalOrders : localStore.conditionalOrders,
                        dividends: Array.isArray(sPort.dividends) ? sPort.dividends : localStore.dividends,
                        lastUpdated: Math.max(serverTime, Date.now()),
                      });
                      return;
                    } else {
                      await get().syncPortfolioToDatabase();
                      return;
                    }
                  }
                } else {
                  // Server belum memiliki portofolio sama sekali (portfolio === null)
                  // Jika browser lokal sudah memiliki transaksi / saham / kas, simpan langsung ke server!
                  if (hasLocalHoldings || localStore.cash > 0 || hasLocalOrders) {
                    await get().syncPortfolioToDatabase();
                    return;
                  }
                }
              }
            } catch (serverErr) {
              console.warn('[SERVER PORTFOLIO LOAD WARN]', serverErr);
            }

            // 2. Fallback Supabase jika terkonfigurasi (Langsung dari tabel user_portfolios)
            if (isSupabaseConfigured) {
              try {
                const supabase = getSupabaseBrowserClient();
                const { data: cloudPort, error: portErr } = await supabase
                  .from('user_portfolios')
                  .select('*')
                  .or(`user_id.eq.${user.id},email.eq.${user.email.toLowerCase()}`)
                  .maybeSingle();

                if (!portErr && cloudPort && typeof cloudPort.cash === 'number') {
                  const dbCash = Number(cloudPort.cash);
                  const dbRealizedPL = Number(cloudPort.realized_pl || 0);
                  const rawHoldings = Array.isArray(cloudPort.holdings) ? cloudPort.holdings : [];
                  const rawOrders = Array.isArray(cloudPort.orders) ? cloudPort.orders : [];
                  const cloudTime = Number(cloudPort.last_updated || 0);

                  const currentHoldings = usePortfolioStore.getState().holdings;
                  // Pulihkan jika lokal masih kosong atau data cloud lebih mutakhir
                  if ((rawHoldings.length > 0 || dbCash !== 100_000_000 || rawOrders.length > 0) && currentHoldings.length === 0) {
                    usePortfolioStore.setState({
                      cash: dbCash,
                      realizedPL: dbRealizedPL,
                      holdings: sanitizeHoldings(rawHoldings),
                      orders: rawOrders,
                      conditionalOrders: Array.isArray(cloudPort.conditional_orders) ? cloudPort.conditional_orders : [],
                      dividends: Array.isArray(cloudPort.dividends) ? cloudPort.dividends : [],
                      lastUpdated: cloudTime || Date.now(),
                    });
                  }
                }
              } catch (cloudErr) {
                console.warn('[SUPABASE DIRECT FETCH WARN]', cloudErr);
              }
            }

            // 3. Fallback Cadangan: Periksa Local User Backup jika server cloud dan Supabase sedang offline/unreachable
            const localUserBackup = loadLocalUserBackup(user.email);
            if (localUserBackup && typeof localUserBackup.cash === 'number') {
              const currentHoldings = usePortfolioStore.getState().holdings;
              const currentCash = usePortfolioStore.getState().cash;
              if (currentHoldings.length === 0 && (currentCash <= 0 || currentCash === 100_000_000)) {
                usePortfolioStore.setState({
                  cash: localUserBackup.cash,
                  realizedPL: localUserBackup.realizedPL || 0,
                  holdings: sanitizeHoldings(Array.isArray(localUserBackup.holdings) ? localUserBackup.holdings : []),
                  orders: Array.isArray(localUserBackup.orders) ? localUserBackup.orders : [],
                  conditionalOrders: Array.isArray(localUserBackup.conditionalOrders) ? localUserBackup.conditionalOrders : [],
                  dividends: Array.isArray(localUserBackup.dividends) ? localUserBackup.dividends : [],
                  lastUpdated: localUserBackup.lastUpdated || Date.now(),
                });
                return;
              }
            }
          } catch (err) {
            console.error('[LOAD PORTFOLIO ERROR]', err);
          } finally {
            activeLoadPortfolioPromise = null;
          }
        })();

        return activeLoadPortfolioPromise;
      },
    }),
    {
      name: 'tradingsims-auth-user-storage',
    }
  )
);
