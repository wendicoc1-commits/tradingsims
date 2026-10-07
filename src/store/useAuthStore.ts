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
  loadPortfolioFromDatabase: () => Promise<void>;
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

          // 1. Simpan Saldo Kas RDN ke tabel portfolios
          await supabase.from('portfolios').upsert({
            user_id: user.id,
            cash: portStore.cash,
            realized_pl: portStore.realizedPL,
            updated_at: new Date().toISOString(),
          });

          // 2. Simpan Kepemilikan Posisi ke tabel holdings
          if (portStore.holdings.length > 0) {
            const holdingRows = portStore.holdings.map((h) => ({
              user_id: user.id,
              symbol: h.symbol,
              display_symbol: h.displaySymbol,
              name: h.name,
              avg_price: h.avgPrice,
              lots: h.lots,
              shares: h.shares || h.lots * 100,
              crypto_units: h.cryptoUnits || null,
              asset_class: h.assetClass || 'EQUITY',
              currency: h.currency || 'IDR',
              exchange_rate: h.exchangeRate || 16000,
              take_profit_price: h.takeProfitPrice || null,
              stop_loss_price: h.stopLossPrice || null,
              validity_type: h.validityType || 'GTC',
              total_dividend_earned: h.totalDividendEarned || 0,
              updated_at: new Date().toISOString(),
            }));

            await supabase.from('holdings').upsert(holdingRows, { onConflict: 'user_id, symbol' });
          }
        } catch (err) {
          console.error('[SUPABASE PORTFOLIO SYNC ERROR]', err);
        }
      },

      // Ambil data portofolio dari Supabase Database saat member login
      loadPortfolioFromDatabase: async () => {
        const user = get().user;
        if (!user || user.provider === 'guest' || !isSupabaseConfigured) return;

        try {
          const supabase = getSupabaseBrowserClient();

          // 1. Ambil kas portfolio
          const { data: portData } = await supabase
            .from('portfolios')
            .select('cash, realized_pl')
            .eq('user_id', user.id)
            .single();

          if (portData && portData.cash) {
            usePortfolioStore.setState({
              cash: Number(portData.cash),
              realizedPL: Number(portData.realized_pl || 0),
            });
          }

          // 2. Ambil holdings
          const { data: holdingsData } = await supabase
            .from('holdings')
            .select('*')
            .eq('user_id', user.id);

          if (holdingsData && holdingsData.length > 0) {
            const mappedHoldings = holdingsData.map((row: any) => ({
              symbol: row.symbol,
              displaySymbol: row.display_symbol,
              name: row.name,
              avgPrice: Number(row.avg_price),
              lots: Number(row.lots),
              shares: Number(row.shares),
              currentPrice: Number(row.avg_price),
              unrealizedPL: 0,
              unrealizedPLPercent: 0,
              cryptoUnits: row.crypto_units ? Number(row.crypto_units) : undefined,
              assetClass: row.asset_class,
              currency: row.currency,
              exchangeRate: row.exchange_rate ? Number(row.exchange_rate) : undefined,
              takeProfitPrice: row.take_profit_price ? Number(row.take_profit_price) : undefined,
              stopLossPrice: row.stop_loss_price ? Number(row.stop_loss_price) : undefined,
              validityType: row.validity_type,
              totalDividendEarned: Number(row.total_dividend_earned || 0),
              realizedPL: 0,
            }));

            usePortfolioStore.setState({ holdings: mappedHoldings });
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
