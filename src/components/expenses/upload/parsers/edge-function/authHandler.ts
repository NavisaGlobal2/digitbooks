
import { supabase } from "@/integrations/supabase/client";

/**
 * Get the authentication token for Supabase
 */
export const getAuthToken = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      console.error("Auth error:", error);
      return { token: null, error: error?.message || "Not authenticated" };
    }
    
    return { token: data.session.access_token, error: null };
  } catch (e: any) {
    console.error("Auth exception:", e);
    return { token: null, error: e.message || "Authentication error occurred" };
  }
};
