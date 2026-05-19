import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cwymyrcgpannbvxsyvza.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_aRfmN_3UXOEgB3VntEW8RA_AMH9Wqen';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
