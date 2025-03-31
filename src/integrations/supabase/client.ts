
import { createClient } from '@supabase/supabase-js';

// Use dummy values for now - replace with actual values when implemented
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy-supabase-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'dummy-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
