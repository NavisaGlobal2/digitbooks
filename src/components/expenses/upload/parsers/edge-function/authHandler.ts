
import { supabase } from "@/integrations/supabase/client";

/**
 * Get the authentication token for Supabase
 */
export const getAuthToken = async (): Promise<{ token: string | null; error: string | null }> => {
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

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { token } = await getAuthToken();
  return !!token;
};
