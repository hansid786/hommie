import { createClient } from '@supabase/supabase-js';

const env = import.meta.env || {};
const SUPABASE_URL = String(
  env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || ''
).trim();
const SUPABASE_ANON_KEY = String(
  env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
).trim();

let hasValidSupabaseUrl = false;
try {
  const parsedUrl = new URL(SUPABASE_URL);
  hasValidSupabaseUrl = parsedUrl.protocol === 'https:' && Boolean(parsedUrl.hostname);
} catch {
  hasValidSupabaseUrl = false;
}

export const isSupabaseConfigured = Boolean(
  hasValidSupabaseUrl &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: { eventsPerSecond: 10 }
      }
    })
  : null;

export const getSupabase = () => supabase;
