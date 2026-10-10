import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Pastikan Service Role Key TIDAK PERNAH memakai prefix NEXT_PUBLIC_ agar tidak terbawa ke client bundle.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isServiceRoleConfigured = Boolean(
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY.length > 20
);

let adminClient: SupabaseClient | null = null;

/**
 * Mendapatkan Supabase Client dengan hak akses Admin (Service Role Key).
 * HANYA boleh dipanggil di Server-Side (Server Actions, Route Handlers, Server Components).
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (!supabaseUrl) {
    throw new Error('[Supabase Admin] NEXT_PUBLIC_SUPABASE_URL belum dikonfigurasi di environment variables.');
  }

  if (adminClient) return adminClient;

  adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}
