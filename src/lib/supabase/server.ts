import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './client';

export interface ServerCookieAdapter {
  getAll: () => Array<{ name: string; value: string }>;
  setAll?: (
    cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>
  ) => void;
}

/**
 * Creates a server-side Supabase client compatible with Next.js App Router cookies or SSR adapters.
 * Input: optional cookie adapter; Output: SupabaseClient instance or null if unconfigured.
 */
export function createServerSupabaseClient(
  cookieAdapter?: ServerCookieAdapter
): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseEnv();
  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieAdapter ? cookieAdapter.getAll() : [];
      },
      setAll(cookiesToSet) {
        if (cookieAdapter?.setAll) {
          cookieAdapter.setAll(cookiesToSet);
        }
      },
    },
  });
}
