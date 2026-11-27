import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseEnvConfig {
  url: string | null;
  anonKey: string | null;
  isConfigured: boolean;
}

/**
 * Reads Supabase URL and anon key from Vite or Next.js public env vars.
 * Input: none; Output: resolved config and availability flag.
 */
export function getSupabaseEnv(): SupabaseEnvConfig {
  const metaEnv =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env as Record<string, string | undefined>)
      : {};
  const nodeEnv =
    typeof process !== 'undefined' && process.env ? process.env : {};

  const url =
    metaEnv.VITE_SUPABASE_URL ||
    metaEnv.NEXT_PUBLIC_SUPABASE_URL ||
    nodeEnv.VITE_SUPABASE_URL ||
    nodeEnv.NEXT_PUBLIC_SUPABASE_URL ||
    null;

  const anonKey =
    metaEnv.VITE_SUPABASE_ANON_KEY ||
    metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    nodeEnv.VITE_SUPABASE_ANON_KEY ||
    nodeEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    null;

  const validUrl =
    Boolean(url) &&
    !url!.includes('your-project.supabase.co') &&
    url!.startsWith('http');
  const validKey = Boolean(anonKey) && anonKey !== 'your-anon-key';

  return {
    url: validUrl ? url : null,
    anonKey: validKey ? anonKey : null,
    isConfigured: validUrl && validKey,
  };
}

let browserClient: SupabaseClient | null = null;

/**
 * Returns a singleton browser Supabase client when environment variables are configured.
 * Input: none; Output: SupabaseClient instance or null in fallback mode.
 */
export function createClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseEnv();
  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, anonKey);
  }

  return browserClient;
}
