// ============================================================================
//  Supabase client — the app's connection to the database + auth.
//  Reads its keys from Vercel environment variables (never hard-coded here).
// ============================================================================
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// If the keys are missing (e.g. running locally without env vars), we don't
// crash the whole site — we just disable the database features gracefully.
export const supabaseReady = Boolean(url && anonKey);

export const supabase = supabaseReady
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (null as any);
