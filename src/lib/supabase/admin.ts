import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Pastikan Service Role Key TIDAK PERNAH memakai prefix NEXT_PUBLIC_ agar tidak terbawa ke client bundle.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleEnv = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

export const isServiceRoleConfigured = Boolean(
  serviceRoleEnv &&
  serviceRoleEnv.length > 20
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

  // Di mode production, WAJIB menggunakan SUPABASE_SERVICE_ROLE_KEY asli.
  // Jangan pernah melakukan silent fallback ke public Anon Key!
  if (!isServiceRoleConfigured) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[Supabase Admin Security Error] SUPABASE_SERVICE_ROLE_KEY tidak dikonfigurasi di server production. ' +
        'Operasi administratif Supabase ditolak demi mencegah eskalasi hak akses menggunakan Anon Key publik.'
      );
    }
    console.warn(
      '[Supabase Admin Warning] SUPABASE_SERVICE_ROLE_KEY belum disetel. ' +
      'Menggunakan public Anon Key khusus sesi development lokal.'
    );
  }

  const effectiveKey = serviceRoleEnv || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (adminClient) return adminClient;

  adminClient = createClient(supabaseUrl, effectiveKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}
