import { createBrowserClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  if (isSupabaseConfigured) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    return browserClient;
  }

  // Fallback Dummy Client jika environment belum diset
  browserClient = createClient(
    'https://placeholder-project.supabase.co',
    'placeholder-anon-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
  return browserClient;
}
