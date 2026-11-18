import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://sgksyojwxeormcazljhv.supabase.co';
const FALLBACK_KEY = 'sb_publishable_BAs_DTqoWYcEqNiOysnBhg_xDeu683k';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || FALLBACK_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || FALLBACK_KEY;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing — using fallback values. Check .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
