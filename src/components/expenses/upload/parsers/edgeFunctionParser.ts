
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";
import { toast } from "sonner";

// Track connection statistics
const connectionStats = {
  attempts: 0,
  failures: 0,
  lastFailure: null as Date | null,
  failureReasons: {} as Record<string, number>
};

export const getConnectionStats = () => {
  return {
    ...connectionStats,
    failureRate: connectionStats.attempts > 0 
      ? Math.round((connectionStats.failures / connectionStats.attempts) * 100) 
      : 0
  };
};

// Maximum number of retry attempts
const MAX_RETRIES = 2;

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
      connectionStats.failureReasons['auth_error'] = (connectionStats.failureReasons['auth_error'] || 0) + 1;
      return onError(authError?.message || "You need to be signed in to use this feature");
    }
    
    const token = authData.session.access_token;
    if (!token) {
      console.error("No access token found in session");
      connectionStats.failureReasons['no_token'] = (connectionStats.failureReasons['no_token'] || 0) + 1;
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
    
    // Implement retry logic
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= MAX_RETRIES) {
      try {
        // Track connection attempts
        connectionStats.attempts++;
        
        if (retryCount > 0) {
          console.log(`Retry attempt ${retryCount} of ${MAX_RETRIES}...`);
          // Add a small delay before retrying to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }

        console.log(`Starting fetch request to edge function (attempt ${retryCount + 1})...`);
        
        // Custom fetch to edge function instead of using supabase.functions.invoke
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
        
        console.log(`Edge function response status: ${response.status}`);
        
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
            connectionStats.failureReasons['unauthorized'] = (connectionStats.failureReasons['unauthorized'] || 0) + 1;
            return onError("Authentication error. Please sign in again and try one more time.");
          }
          
          // For server errors, we'll retry
          if (response.status >= 500 && retryCount < MAX_RETRIES) {
            lastError = errorMessage;
            retryCount++;
            continue;
          }
          
          connectionStats.failures++;
          connectionStats.lastFailure = new Date();
          connectionStats.failureReasons[`http_${response.status}`] = 
            (connectionStats.failureReasons[`http_${response.status}`] || 0) + 1;
          
          return onError(errorMessage);
        }
        
        const result = await response.json();
        console.log("Edge function result:", result);
        
        if (!result.success) {
          console.error("Edge function returned error:", result.error);
          
          connectionStats.failures++;
          connectionStats.lastFailure = new Date();
          connectionStats.failureReasons['processing_error'] = 
            (connectionStats.failureReasons['processing_error'] || 0) + 1;
          
          return onError(result.error || "Unknown error processing file");
        }
        
        if (!result.transactions || !Array.isArray(result.transactions) || result.transactions.length === 0) {
          connectionStats.failureReasons['no_transactions'] = 
            (connectionStats.failureReasons['no_transactions'] || 0) + 1;
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
        console.error("Fetch error details:", fetchError);
        lastError = fetchError;
        
        // Check if it's a network error
        if (fetchError.message && fetchError.message.includes("Failed to fetch")) {
          console.error("Network error detected. This may be due to CORS, network connectivity, or the edge function being unavailable.");
          
          // Try to get more details about the error
          console.error("Error name:", fetchError.name);
          console.error("Error message:", fetchError.message);
          console.error("Error stack:", fetchError.stack);
          
          // For network errors, we'll retry if we haven't reached the max retries
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            continue;
          }
          
          connectionStats.failures++;
          connectionStats.lastFailure = new Date();
          connectionStats.failureReasons['network_error'] = 
            (connectionStats.failureReasons['network_error'] || 0) + 1;
          
          // Fall back to client-side parsing for CSV files if network fails
          if (file.name.toLowerCase().endsWith('.csv')) {
            console.log("Network error with edge function, attempting client-side CSV fallback");
            
            // Try client-side CSV parsing as fallback
            try {
              const { parseCSVFile } = await import("./csvParser");
              
              parseCSVFile(file, (result) => {
                console.log("Fallback CSV parsing successful:", result);
                toast.success("Using local CSV parser as fallback due to server connectivity issues");
                
                // Convert parsed data to the expected format
                const transactions: ParsedTransaction[] = result.transactions.map((row: any) => ({
                  date: row.date || new Date().toISOString(),
                  description: row.description || row.payee || row.memo || "Unknown transaction",
                  amount: parseFloat(row.amount || row.debit || row.credit || "0"),
                  type: (row.amount && parseFloat(row.amount) < 0) || row.debit ? "debit" : "credit",
                  selected: (row.amount && parseFloat(row.amount) < 0) || row.debit,
                  category: "",
                  source: "CSV Fallback Parser"
                }));
                
                onSuccess(transactions);
              }, (fallbackError) => {
                console.error("Fallback CSV parsing also failed:", fallbackError);
                
                // If fallback also fails, show the original network error
                return onError(
                  "Could not connect to the server and local parsing also failed. Please check your internet connection and try again later."
                );
              });
              
              // Return true since we're handling it with the fallback
              return true;
              
            } catch (fallbackError) {
              console.error("Error loading CSV parser for fallback:", fallbackError);
              // Continue to return the network error
            }
          }
          
          // More specific error message for network issues
          return onError(
            "Could not connect to the server. Please check your internet connection and try again. If the problem persists, the service might be temporarily unavailable."
          );
        }
        
        // For other errors, we'll retry if we haven't reached the max retries
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          continue;
        }
        
        connectionStats.failures++;
        connectionStats.lastFailure = new Date();
        connectionStats.failureReasons['other_error'] = 
          (connectionStats.failureReasons['other_error'] || 0) + 1;
        
        // Generic error message for other types of errors
        return onError(
          fetchError.message || "Failed to process file with server"
        );
      }
    }
    
    // If we've exhausted all retries, return the last error
    connectionStats.failures++;
    connectionStats.lastFailure = new Date();
    
    return onError(
      lastError?.message || "Failed to process file after multiple attempts. Please try again later."
    );
    
  } catch (error: any) {
    console.error("Error in parseViaEdgeFunction:", error);
    
    connectionStats.failures++;
    connectionStats.lastFailure = new Date();
    connectionStats.failureReasons['unexpected_error'] = 
      (connectionStats.failureReasons['unexpected_error'] || 0) + 1;
    
    return onError(error.message || "Failed to process file with server");
  }
};
