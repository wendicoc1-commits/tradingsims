'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { usePortfolioStore, waitForPortfolioHydration, sanitizeHoldings } from '@/store';

let isSyncingPortfolio = false;
let needsPortfolioReSync = false;
let activeLoadPortfolioPromise: Promise<void> | null = null;

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
          // 1. Coba login melalui backend API server (yang menyimpan portofolio lintas browser)
          const apiRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password: pass }),
          });
          const apiData = await apiRes.json();

          if (apiData.success && apiData.user) {
            const appUser: AppUser = {
              id: apiData.user.id,
              email: apiData.user.email,
              fullName: apiData.user.fullName,
              provider: 'email',
              role: 'member',
              createdAt: apiData.user.createdAt,
            };
            set({ user: appUser, isLoading: false });

            // Jika server sudah memiliki snapshot portofolio dari device lain, pulihkan ke usePortfolioStore
            if (apiData.portfolio && typeof apiData.portfolio.cash === 'number') {
              const sPort = apiData.portfolio;
              const localStore = usePortfolioStore.getState();
              const hasServerHoldings = Array.isArray(sPort.holdings) && sPort.holdings.length > 0;
              const hasLocalHoldings = Array.isArray(localStore.holdings) && localStore.holdings.length > 0;
              const hasLocalOrders = Array.isArray(localStore.orders) && localStore.orders.length > 0;

              // Pulihkan jika:
              // 1. Server memiliki kepemilikan saham, ATAU
              // 2. Browser lokal ini belum memiliki kepemilikan saham (misal baru buka di device/browser lain), ATAU
              // 3. Waktu snapshot server lebih baru atau sama dengan waktu lokal
              if (hasServerHoldings || !hasLocalHoldings || (!hasLocalOrders && localStore.cash <= 0)) {
                usePortfolioStore.setState({
                  cash: typeof sPort.cash === 'number' ? sPort.cash : 100_000_000,
                  realizedPL: sPort.realizedPL || 0,
                  holdings: sanitizeHoldings(Array.isArray(sPort.holdings) ? sPort.holdings : []),
                  orders: Array.isArray(sPort.orders) ? sPort.orders : [],
                  conditionalOrders: Array.isArray(sPort.conditionalOrders) ? sPort.conditionalOrders : [],
                  dividends: Array.isArray(sPort.dividends) ? sPort.dividends : [],
                  lastUpdated: sPort.lastUpdated || Date.now(),
                });
              } else if (hasLocalHoldings && !hasServerHoldings) {
                // Browser lokal ini memiliki saham aktif tetapi server kosong: segera amankan ke server!
                await get().syncPortfolioToDatabase();
              }
            } else {
              // Jika server portofolio masih kosong, sinkronkan portofolio lokal saat ini ke server
              const localStore = usePortfolioStore.getState();
              if (localStore.cash === 0 && localStore.holdings.length === 0) {
                // Beri modal awal 100jt jika lokal masih nol
                usePortfolioStore.setState({ cash: 100_000_000, lastUpdated: Date.now() });
              }
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
          } else if (apiRes.status === 401) {
            set({ authError: apiData.error || 'Email atau password salah.', isLoading: false });
            return { success: false, error: apiData.error || 'Email atau password salah.' };
          }
        } catch (serverErr) {
          console.warn('[SERVER AUTH FALLBACK]', serverErr);
        }

        // Fallback jika API route offline
        const mockUser: AppUser = {
          id: `usr-${Date.now()}`,
          email: email.trim(),
          fullName: email.split('@')[0],
          provider: 'email',
          role: 'member',
          createdAt: new Date().toISOString(),
        };
        set({ user: mockUser, isLoading: false });
        await get().loadPortfolioFromDatabase();
        return { success: true };
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
            const appUser: AppUser = {
              id: apiData.user.id,
              email: apiData.user.email,
              fullName: apiData.user.fullName,
              provider: 'email',
              role: 'member',
              createdAt: apiData.user.createdAt,
            };
            set({ user: appUser, isLoading: false });

            // Pastikan jika modal kas lokal masih 0, set ke Rp 100 Juta untuk member baru
            const localStore = usePortfolioStore.getState();
            if (localStore.cash <= 0 && localStore.holdings.length === 0) {
              usePortfolioStore.setState({ cash: 100_000_000, lastUpdated: Date.now() });
            }

            // Simpan portofolio yang ada ke server untuk akun baru ini
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
          }
        } catch (serverErr) {
          console.warn('[SERVER REGISTER FALLBACK]', serverErr);
        }

        const mockUser: AppUser = {
          id: `usr-${Date.now()}`,
          email: email.trim(),
          fullName: fullName.trim() || email.split('@')[0],
          provider: 'email',
          role: 'member',
          createdAt: new Date().toISOString(),
        };
        set({ user: mockUser, isLoading: false });
        const localStore = usePortfolioStore.getState();
        if (localStore.cash <= 0 && localStore.holdings.length === 0) {
          usePortfolioStore.setState({ cash: 100_000_000, lastUpdated: Date.now() });
        }
        await get().syncPortfolioToDatabase();
        return { success: true };
      },

      loginWithOAuth: async (provider: 'apple' | 'facebook' | 'google') => {
        set({ isLoading: true, authError: null });

        if (!isSupabaseConfigured) {
          // Demo fallback
          const providerName = provider === 'apple' ? 'Apple Member' : provider === 'facebook' ? 'Facebook Member' : 'Google Member';
          const mockUser: AppUser = {
            id: `usr-${provider}-${Date.now()}`,
            email: `member-${provider}@tradingsims.my.id`,
            fullName: providerName,
            provider,
            role: 'member',
            createdAt: new Date().toISOString(),
          };
          set({ user: mockUser, isLoading: false });
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
        if (isSupabaseConfigured) {
          try {
            const supabase = getSupabaseBrowserClient();
            await supabase.auth.signOut();
          } catch {
            // Ignore
          }
        }
        set({ user: null });
      },

      checkSession: async () => {
        const currentUser = get().user;
        if (currentUser && currentUser.email) {
          // Selalu sinkronkan portofolio terbaru dari server cloud
          await get().loadPortfolioFromDatabase();
          return;
        }

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

            // 2. Simpan juga ke Supabase Database jika terkonfigurasi (best-effort)
            if (isSupabaseConfigured) {
              try {
                const supabase = getSupabaseBrowserClient();
                const updatedAtIso = new Date(portStore.lastUpdated || Date.now()).toISOString();

                await supabase.from('portfolios').upsert({
                  user_id: currentUser.id,
                  cash: portStore.cash,
                  realized_pl: portStore.realizedPL,
                  updated_at: updatedAtIso,
                }, { onConflict: 'user_id' }).catch(() => {});

                if (portStore.holdings.length > 0) {
                  const holdingRows = portStore.holdings.map((h) => ({
                    user_id: currentUser.id,
                    symbol: h.symbol,
                    display_symbol: h.displaySymbol,
                    name: h.name,
                    avg_price: h.avgPrice,
                    lots: h.assetClass === 'CRYPTO' ? (h.cryptoUnits ?? h.lots) : Math.max(1, Math.round(h.lots || 1)),
                    shares: h.shares || (h.assetClass === 'CRYPTO' ? h.lots : h.lots * 100),
                    crypto_units: h.cryptoUnits ?? (h.assetClass === 'CRYPTO' ? h.lots : null),
                    asset_class: h.assetClass || 'EQUITY',
                    currency: h.currency || (h.assetClass === 'CRYPTO' ? 'USDT' : 'IDR'),
                    exchange_rate: h.exchangeRate || 16000,
                    take_profit_price: h.takeProfitPrice || null,
                    stop_loss_price: h.stopLossPrice || null,
                    validity_type: h.validityType || 'GTC',
                    total_dividend_earned: h.totalDividendEarned || 0,
                    updated_at: updatedAtIso,
                  }));

                  const activeSymbols = portStore.holdings.map((h) => h.symbol);
                  const { data: currentDbHoldings } = await supabase
                    .from('holdings')
                    .select('symbol')
                    .eq('user_id', currentUser.id);

                  if (currentDbHoldings && currentDbHoldings.length > 0) {
                    const obsoleteSymbols = currentDbHoldings
                      .map((row: any) => row.symbol)
                      .filter((sym: string) => !activeSymbols.includes(sym));

                    if (obsoleteSymbols.length > 0) {
                      await supabase
                        .from('holdings')
                        .delete()
                        .eq('user_id', currentUser.id)
                        .in('symbol', obsoleteSymbols);
                    }
                  }

                  await supabase.from('holdings').upsert(holdingRows, { onConflict: 'user_id, symbol' });
                } else {
                  await supabase.from('holdings').delete().eq('user_id', currentUser.id);
                }
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

      // Simpan riwayat transaksi order individual ke tabel orders Supabase
      recordOrderToDatabase: async (order: any) => {
        const user = get().user;
        if (!user || user.provider === 'guest') return;

        // Sinkronkan ke cloud
        await get().syncPortfolioToDatabase();

        if (isSupabaseConfigured) {
          try {
            const supabase = getSupabaseBrowserClient();
            await supabase.from('orders').insert({
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
            });
          } catch (err) {
            console.error('[SUPABASE ORDER LOG ERROR]', err);
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
                    usePortfolioStore.setState({
                      cash: typeof sPort.cash === 'number' ? sPort.cash : 100_000_000,
                      realizedPL: sPort.realizedPL || 0,
                      holdings: sanitizeHoldings(Array.isArray(sPort.holdings) ? sPort.holdings : []),
                      orders: Array.isArray(sPort.orders) ? sPort.orders : [],
                      conditionalOrders: Array.isArray(sPort.conditionalOrders) ? sPort.conditionalOrders : [],
                      dividends: Array.isArray(sPort.dividends) ? sPort.dividends : [],
                      lastUpdated: Math.max(serverTime, Date.now()),
                    });
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

            // 2. Fallback Supabase jika terkonfigurasi (HANYA JIKA TIDAK MENGHAPUS HOLDING LOKAL)
            if (isSupabaseConfigured) {
              try {
                const supabase = getSupabaseBrowserClient();
                const { data: holdingsData, error: holdingsErr } = await supabase
                  .from('holdings')
                  .select('*')
                  .eq('user_id', user.id);

                const { data: portData, error: portErr } = await supabase
                  .from('portfolios')
                  .select('cash, realized_pl, updated_at')
                  .eq('user_id', user.id)
                  .maybeSingle();

                if (!portErr && portData && typeof portData.cash === 'number') {
                  const dbCash = Number(portData.cash);
                  const dbRealizedPL = Number(portData.realized_pl || 0);
                  const mappedHoldings = (!holdingsErr && holdingsData && holdingsData.length > 0)
                    ? holdingsData.map((row: any) => ({
                        symbol: row.symbol,
                        displaySymbol: row.display_symbol || row.symbol.replace('.JK', '').replace(/USDT$/i, ''),
                        name: row.name || row.symbol,
                        avgPrice: Number(row.avg_price || 0),
                        lots: Number(row.lots || 1),
                        shares: Number(row.shares || (row.lots || 1) * 100),
                        currentPrice: Number(row.avg_price || 0),
                        unrealizedPL: 0,
                        unrealizedPLPercent: 0,
                        cryptoUnits: row.crypto_units ? Number(row.crypto_units) : undefined,
                        assetClass: row.asset_class || 'EQUITY',
                        currency: row.currency || (row.symbol.endsWith('USDT') ? 'USDT' : 'IDR'),
                        exchangeRate: row.exchange_rate ? Number(row.exchange_rate) : 16000,
                        takeProfitPrice: row.take_profit_price ? Number(row.take_profit_price) : undefined,
                        stopLossPrice: row.stop_loss_price ? Number(row.stop_loss_price) : undefined,
                        validityType: row.validity_type || 'GTC',
                        totalDividendEarned: Number(row.total_dividend_earned || 0),
                        realizedPL: 0,
                      }))
                    : [];

                  const currentHoldings = usePortfolioStore.getState().holdings;
                  // JANGAN PERNAH menimpa saham lokal aktif jika Supabase kosong!
                  if (mappedHoldings.length > 0 && currentHoldings.length === 0) {
                    usePortfolioStore.setState({
                      holdings: sanitizeHoldings(mappedHoldings),
                      cash: dbCash,
                      realizedPL: dbRealizedPL,
                      lastUpdated: Date.now(),
                    });
                    return;
                  } else if (currentHoldings.length > 0 && mappedHoldings.length === 0) {
                    await get().syncPortfolioToDatabase();
                    return;
                  }
                }
              } catch {}
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
