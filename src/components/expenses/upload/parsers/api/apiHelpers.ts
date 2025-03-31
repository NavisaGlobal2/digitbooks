
import { supabase } from "@/integrations/supabase/client";

// Define the API base URL
export const API_BASE = "https://workspace.john644.repl.co";

// Check authentication and get token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Authentication error:', error);
      return null;
    }
    
    if (!data?.session) {
      console.error('No authentication session found');
      return null;
    }
    
    return data.session.access_token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Determine the API endpoint based on file type
export const getApiEndpoint = (file: File): string => {
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  
  if (fileExt === 'pdf') {
    return 'api/upload'; // Use the new API endpoint for PDFs
  } else {
    return fileExt === 'pdf' ? 'parse-bank-statement-ai' : 'parse-bank-statement';
  }
};
