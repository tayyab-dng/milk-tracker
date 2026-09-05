import { createClient } from '@supabase/supabase-js';
import { Storage } from './native/storage';

export const SUPABASE_URL = 'https://bnshviyzaefphtfeosoo.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_tILiR8I2VTTmdH9BkfZJjA_HbKJeayW';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: Storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

export default supabase;
