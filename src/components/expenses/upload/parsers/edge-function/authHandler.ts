
import { supabase } from "@/integrations/supabase/client";

/**
 * Get the authentication token for Supabase
 */
export const getAuthToken = async () => {
  try {
    // First check if there's a session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      return { token: null, error: sessionError?.message || "Session error" };
    }
    
    if (!sessionData.session) {
      console.warn("No active session found");
      
      // Try to refresh the token
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error("Auth refresh error:", refreshError);
        return { token: null, error: "Authentication required. Please sign in." };
      }
      
      console.log("Session refreshed successfully");
      return { token: refreshData.session.access_token, error: null };
    }
    
    console.log("Using existing session token");
    return { token: sessionData.session.access_token, error: null };
  } catch (e: any) {
    console.error("Auth exception:", e);
    return { token: null, error: e.message || "Authentication error occurred" };
  }
};
