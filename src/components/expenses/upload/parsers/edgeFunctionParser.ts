
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";
import { toast } from "sonner";

export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  preferredProvider: string = "anthropic"
) => {
  try {
    console.log(`Parsing file via edge function: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    // Get auth token
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError || !authData.session) {
      console.error("Authentication error:", authError?.message || "No active session");
      return onError(authError?.message || "You need to be signed in to use this feature");
    }
    
    const token = authData.session.access_token;
    if (!token) {
      console.error("No access token found in session");
      return onError("Authentication token is missing. Please sign in again.");
    }
    
    // Create FormData with file and provider preference
    const formData = new FormData();
    formData.append("file", file);
    
    if (preferredProvider) {
      formData.append("preferredProvider", preferredProvider);
      console.log(`Using preferred AI provider: ${preferredProvider}`);
    }
    
    console.log(`Calling parse-bank-statement-ai edge function with ${file.name}`);
    
    // Use a hardcoded URL format since we know the project ID
    const supabaseUrl = "https://naxmgtoskeijvdofqyik.supabase.co";
    
    try {
      // Custom fetch to edge function instead of using supabase.functions.invoke
      // This gives us more control over the request and response
      const response = await fetch(
        `${supabaseUrl}/functions/v1/parse-bank-statement-ai`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      
      if (!response.ok) {
        console.error(`Server responded with status: ${response.status}`);
        let errorMessage = "Error processing file on server";
        
        try {
          // Try to parse error response as JSON
          const errorText = await response.text();
          console.error("Error text:", errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If parsing fails, use the raw error text
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          console.error("Failed to read error response:", e);
        }
        
        console.error(`Server error (${response.status}):`, errorMessage);
        
        if (response.status === 401) {
          return onError("Authentication error. Please sign in again and try one more time.");
        }
        
        return onError(errorMessage);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        console.error("Edge function returned error:", result.error);
        return onError(result.error || "Unknown error processing file");
      }
      
      if (!result.transactions || !Array.isArray(result.transactions) || result.transactions.length === 0) {
        return onError("No transactions were found in the uploaded file");
      }
      
      console.log(`Successfully parsed ${result.transactions.length} transactions`);
      
      // Process the transactions
      const transactions: ParsedTransaction[] = result.transactions.map((tx: any) => ({
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        type: tx.type || (tx.amount < 0 ? "debit" : "credit"),
        selected: tx.type === "debit", // Pre-select debits by default
        category: tx.category || "",
        source: tx.source || ""
      }));
      
      onSuccess(transactions);
      return true;
    } catch (fetchError: any) {
      console.error("Fetch error:", fetchError);
      // More specific error message for network issues
      return onError(
        "Could not connect to the server. Please check your internet connection and try again. If the problem persists, the service might be temporarily unavailable."
      );
    }
  } catch (error: any) {
    console.error("Error in parseViaEdgeFunction:", error);
    return onError(error.message || "Failed to process file with server");
  }
};
