
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useStatementAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [preferredAIProvider, setPreferredAIProvider] = useState<string>("anthropic");

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      if (!data.session) {
        console.log("User is not authenticated");
      } else {
        console.log("User is authenticated");
      }
    };
    
    checkAuthStatus();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
      console.log("Auth state changed, authenticated:", authenticated);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add verifyAuth method
  const verifyAuth = useCallback(async (): Promise<string | null> => {
    // Check current authentication state
    const { data } = await supabase.auth.getSession();
    const authenticated = !!data.session;
    
    if (!authenticated) {
      return "Authentication required to process bank statements";
    }
    
    return null; // No error means authentication is valid
  }, []);

  return {
    isAuthenticated,
    preferredAIProvider,
    setPreferredAIProvider,
    verifyAuth
  };
};
