
import { supabase } from "@/integrations/supabase/client";
import { trackFailedConnection } from "./connectionStats";

/**
 * Get authentication token for edge function calls
 */
export const getAuthToken = async (): Promise<{ token: string | null; error: string | null }> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError || !authData.session) {
      console.error("Authentication error:", authError?.message || "No active session");
      trackFailedConnection('auth_error');
      return { 
        token: null, 
        error: authError?.message || "You need to be signed in to use this feature"
      };
    }
    
    const token = authData.session.access_token;
    if (!token) {
      console.error("No access token found in session");
      trackFailedConnection('no_token');
      return { 
        token: null, 
        error: "Authentication token is missing. Please sign in again."
      };
    }
    
    return { token, error: null };
  } catch (error: any) {
    console.error("Error getting auth token:", error);
    trackFailedConnection('auth_error');
    return { 
      token: null, 
      error: error.message || "Authentication error occurred"
    };
  }
};
