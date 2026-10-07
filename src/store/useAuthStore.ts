'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { usePortfolioStore } from '@/store';

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

        if (!isSupabaseConfigured) {
          // Demo fallback jika Supabase belum diisi credentialnya
          const mockUser: AppUser = {
            id: `usr-${Date.now()}`,
            email: email.trim(),
            fullName: email.split('@')[0],
            provider: 'email',
            role: 'member',
            createdAt: new Date().toISOString(),
          };
          set({ user: mockUser, isLoading: false });
          return { success: true };
        }

        try {
          const supabase = getSupabaseBrowserClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: pass,
          });

          if (error) {
            set({ authError: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            const appUser: AppUser = {
              id: data.user.id,
              email: data.user.email || email,
              fullName:
                data.user.user_metadata?.full_name ||
                data.user.user_metadata?.name ||
                email.split('@')[0],
              avatarUrl: data.user.user_metadata?.avatar_url || null,
              provider: 'email',
              role: (data.user.user_metadata?.role as any) || 'member',
              createdAt: data.user.created_at || new Date().toISOString(),
            };
            set({ user: appUser, isLoading: false });

            // Ambil data portofolio dari Supabase
            await get().loadPortfolioFromDatabase();
            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: 'User tidak ditemukan.' };
        } catch (err: any) {
          set({ authError: err.message, isLoading: false });
          return { success: false, error: err.message };
        }
      },

      registerWithEmail: async (email: string, pass: string, fullName: string) => {
        set({ isLoading: true, authError: null });

        if (!isSupabaseConfigured) {
          const mockUser: AppUser = {
            id: `usr-${Date.now()}`,
            email: email.trim(),
            fullName: fullName.trim() || email.split('@')[0],
            provider: 'email',
            role: 'member',
            createdAt: new Date().toISOString(),
          };
          set({ user: mockUser, isLoading: false });
          return { success: true };
        }

        try {
          const supabase = getSupabaseBrowserClient();
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: pass,
            options: {
              data: {
                full_name: fullName.trim(),
              },
            },
          });

          if (error) {
            set({ authError: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            const appUser: AppUser = {
              id: data.user.id,
              email: data.user.email || email,
              fullName: fullName.trim() || email.split('@')[0],
              provider: 'email',
              role: 'member',
              createdAt: data.user.created_at || new Date().toISOString(),
            };
            set({ user: appUser, isLoading: false });
            return { success: true };
          }

          set({ isLoading: false });
          return { success: true };
        } catch (err: any) {
          set({ authError: err.message, isLoading: false });
          return { success: false, error: err.message };
        }
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

      // Sinkronisasi data portofolio dari frontend ke Supabase Database
      syncPortfolioToDatabase: async () => {
        const user = get().user;
        if (!user || user.provider === 'guest' || !isSupabaseConfigured) return;

        try {
          const supabase = getSupabaseBrowserClient();
          const portStore = usePortfolioStore.getState();

          // 1. Simpan Saldo Kas RDN ke tabel portfolios & users
          try {
            await supabase.from('portfolios').upsert({
              user_id: user.id,
              cash: portStore.cash,
              realized_pl: portStore.realizedPL,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
          } catch {
            // Ignore error jika tabel portfolios berbeda struktur
          }

          try {
            await supabase.from('users').update({
              cash_balance: portStore.cash,
              updated_at: new Date().toISOString(),
            }).eq('id', user.id);
          } catch {
            // Ignore jika tabel users belum memiliki kolom cash_balance
          }

          // 2. Simpan Kepemilikan Posisi ke tabel holdings & bersihkan posisi yang sudah terjual
          if (portStore.holdings.length > 0) {
            const holdingRows = portStore.holdings.map((h) => ({
              user_id: user.id,
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
              updated_at: new Date().toISOString(),
            }));

            try {
              // Hapus dari Supabase setiap posisi lama yang sudah tidak ada lagi di portStore.holdings
              const activeSymbols = portStore.holdings.map((h) => h.symbol);
              const { data: currentDbHoldings } = await supabase
                .from('holdings')
                .select('symbol')
                .eq('user_id', user.id);

              if (currentDbHoldings && currentDbHoldings.length > 0) {
                const obsoleteSymbols = currentDbHoldings
                  .map((row: any) => row.symbol)
                  .filter((sym: string) => !activeSymbols.includes(sym));

                if (obsoleteSymbols.length > 0) {
                  await supabase
                    .from('holdings')
                    .delete()
                    .eq('user_id', user.id)
                    .in('symbol', obsoleteSymbols);
                }
              }

              await supabase.from('holdings').upsert(holdingRows, { onConflict: 'user_id, symbol' });
            } catch {
              // Ignore table error
            }
          } else {
            // Jika user tidak memiliki holding sama sekali, bersihkan seluruh baris holdings di database
            try {
              await supabase.from('holdings').delete().eq('user_id', user.id);
            } catch {
              // Ignore
            }
          }
        } catch (err) {
          console.error('[SUPABASE PORTFOLIO SYNC ERROR]', err);
        }
      },

      // Hapus satu posisi holding secara instan dari Supabase saat posisi ditutup habis
      deleteHoldingFromDatabase: async (symbol: string) => {
        const user = get().user;
        if (!user || user.provider === 'guest' || !isSupabaseConfigured) return;

        try {
          const supabase = getSupabaseBrowserClient();
          const clean = symbol.replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
          // Hapus semua kemungkinan format simbol di database
          await supabase
            .from('holdings')
            .delete()
            .eq('user_id', user.id)
            .or(`symbol.eq.${symbol},symbol.eq.${clean},symbol.eq.${clean}.JK,symbol.eq.${clean}USDT,display_symbol.eq.${clean}`);
        } catch (err) {
          console.error('[SUPABASE DELETE HOLDING ERROR]', err);
        }
      },

      // Reset total portofolio di database Supabase ke modal awal bersih Rp 0
      resetPortfolioInDatabase: async (targetCash: number = 0) => {
        const user = get().user;
        if (!user || user.provider === 'guest' || !isSupabaseConfigured) return;

        try {
          const supabase = getSupabaseBrowserClient();
          try {
            await supabase.from('portfolios').upsert({
              user_id: user.id,
              cash: targetCash,
              realized_pl: 0,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
          } catch {
            // Ignore
          }

          try {
            await supabase.from('users').update({
              cash_balance: targetCash,
              updated_at: new Date().toISOString(),
            }).eq('id', user.id);
          } catch {
            // Ignore
          }

          await supabase.from('holdings').delete().eq('user_id', user.id);
          await supabase.from('orders').delete().eq('user_id', user.id);
        } catch (err) {
          console.error('[SUPABASE RESET PORTFOLIO ERROR]', err);
        }
      },

      // Simpan riwayat transaksi order individual ke tabel orders Supabase
      recordOrderToDatabase: async (order: any) => {
        const user = get().user;
        if (!user || user.provider === 'guest' || !isSupabaseConfigured) return;

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
      },

      // Ambil data portofolio dari Supabase Database saat member login
      // Ambil data portofolio dari Supabase Database saat member login
      loadPortfolioFromDatabase: async () => {
        const user = get().user;
        if (!user || user.provider === 'guest' || !isSupabaseConfigured) return;

        try {
          const supabase = getSupabaseBrowserClient();
          const localStore = usePortfolioStore.getState();

          // 1. Ambil holdings dari Supabase
          const { data: holdingsData, error: holdingsErr } = await supabase
            .from('holdings')
            .select('*')
            .eq('user_id', user.id);

          // 2. Ambil kas portfolio dari Supabase
          let dbCash: number | null = null;
          let dbRealizedPL = 0;

          const { data: portData, error: portErr } = await supabase
            .from('portfolios')
            .select('cash, realized_pl')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!portErr && portData && typeof portData.cash === 'number') {
            dbCash = Number(portData.cash);
            dbRealizedPL = Number(portData.realized_pl || 0);
          } else {
            // Fallback cek tabel users jika tabel portfolios memakai struktur alternatif
            const { data: userData } = await supabase
              .from('users')
              .select('cash_balance')
              .eq('id', user.id)
              .maybeSingle();
            if (userData && typeof userData.cash_balance === 'number') {
              dbCash = Number(userData.cash_balance);
            }
          }

          const hasLocalHoldings = localStore.holdings && localStore.holdings.length > 0;
          const hasDbHoldings = !holdingsErr && holdingsData && holdingsData.length > 0;

          // ATURAN INTEGRITAS:
          // Jika di browser lokal sudah ada kepemilikan saham aktif (hasil transaksi terbaru di sesi ini),
          // JANGAN TIMPA lokal dengan database yang belum tersinkronisasi! Justru sinkronkan lokal naik ke DB.
          if (hasLocalHoldings) {
            await get().syncPortfolioToDatabase();
            return;
          }

          // Jika tidak ada holding baik di lokal maupun di DB (bersih/reset), sinkronkan saldo kas dari DB
          if (!hasLocalHoldings && !hasDbHoldings) {
            usePortfolioStore.setState({
              holdings: [],
              cash: dbCash !== null ? dbCash : 0,
              realizedPL: dbRealizedPL || 0,
            });
            return;
          }

          // Jika lokal kosong tapi DB memiliki data (misal user baru login di device/browser baru):
          if (hasDbHoldings) {
            const mappedHoldings = holdingsData.map((row: any) => ({
              symbol: row.symbol,
              displaySymbol: row.display_symbol || row.symbol.replace('.JK', '').replace(/USDT$/i, ''),
              name: row.name || row.symbol,
              avgPrice: Number(row.avg_price || row.average_price || 0),
              lots: row.asset_class === 'CRYPTO' && row.crypto_units ? Number(row.crypto_units) : Number(row.lots || row.total_lots || 1),
              shares: Number(row.shares || (row.asset_class === 'CRYPTO' ? row.lots : (row.lots || 1) * 100)),
              currentPrice: Number(row.avg_price || row.average_price || 0),
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
            }));

            usePortfolioStore.setState({
              holdings: mappedHoldings,
              cash: dbCash !== null ? dbCash : 0,
              realizedPL: dbRealizedPL || 0,
            });
          }
        } catch (err) {
          console.error('[SUPABASE PORTFOLIO LOAD ERROR]', err);
        }
      },
    }),
    {
      name: 'tradingsims-auth-user-storage',
    }
  )
);
