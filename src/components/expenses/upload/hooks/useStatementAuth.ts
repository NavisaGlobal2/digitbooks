
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useStatementAuth = () => {
  // Boolean type is correct here - we want to know if authenticated or not
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuthStatus();
  }, []);

  const verifyAuth = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      setIsAuthenticated(false);
      return "You need to be signed in to use this feature";
    }
    
    setIsAuthenticated(true);
    return null;
  };

  return {
    isAuthenticated,
    verifyAuth
  };
};
