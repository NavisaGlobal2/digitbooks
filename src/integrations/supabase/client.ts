
// This file configures the Supabase client for database connection.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use actual Supabase credentials for database connection
const SUPABASE_URL = "https://naxmgtoskeijvdofqyik.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5heG1ndG9za2VpanZkb2ZxeWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxNDI0NDMsImV4cCI6MjA1MjcxODQ0M30.HhErJymz_YynLmN9lAMcxr7JoXBR8XyH9ex1gqWVv5c";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Create the actual Supabase client that connects to your database
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
