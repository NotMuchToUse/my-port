import { createClient, getSupabaseEnv } from './client';
import type { Session, User } from '@supabase/supabase-js';

export interface AdminAuthState {
  session: Session | null;
  user: User | null;
  supabaseActive: boolean;
}

/**
 * Checks whether an active Supabase Auth session exists.
 * Input: none; Output: Promise<AdminAuthState>.
 */
export async function getAdminAuthState(): Promise<AdminAuthState> {
  const { isConfigured } = getSupabaseEnv();
  const client = createClient();

  if (!isConfigured || !client) {
    return {
      session: null,
      user: null,
      supabaseActive: false,
    };
  }

  try {
    const { data, error } = await client.auth.getSession();
    if (error) {
      return { session: null, user: null, supabaseActive: true };
    }
    return {
      session: data.session ?? null,
      user: data.session?.user ?? null,
      supabaseActive: true,
    };
  } catch {
    return { session: null, user: null, supabaseActive: true };
  }
}

/**
 * Authenticates an admin user via Supabase email/password sign-in.
 * Input: email and password strings; Output: user session or error message.
 */
export async function signInAdmin(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string; mode: 'supabase' | 'fallback' }> {
  const { isConfigured } = getSupabaseEnv();
  const client = createClient();

  if (!isConfigured || !client) {
    return {
      ok: true,
      mode: 'fallback',
    };
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.session) {
    return {
      ok: false,
      error: error?.message ?? 'Invalid email or password.',
      mode: 'supabase',
    };
  }

  return {
    ok: true,
    mode: 'supabase',
  };
}

/**
 * Signs out the active Supabase admin session.
 * Input: none; Output: Promise<void>.
 */
export async function signOutAdmin(): Promise<void> {
  const client = createClient();
  if (!client) return;
  try {
    await client.auth.signOut();
  } catch {
    // Ignore sign-out cleanup errors
  }
}
