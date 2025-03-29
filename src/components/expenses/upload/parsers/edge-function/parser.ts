
import { ParsedTransaction } from "../types";
import { 
  getAuthToken,
  MAX_RETRIES,
  handleRetry,
  handleEdgeFunctionError,
  handleCSVFallback,
  trackSuccessfulConnection,
  trackFailedConnection
} from "./index";

/**
 * Parse a bank statement file via the Supabase edge function
 */
export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  preferredProvider: string = "anthropic"
) => {
  try {
    console.log(`Parsing file via edge function: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    // Get auth token
    const { token, error: authError } = await getAuthToken();
    if (authError || !token) {
      console.error("Authentication error:", authError);
      trackFailedConnection('auth_token_error', { message: authError });
      return onError(authError || "Authentication error occurred");
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
    const edgeFunctionEndpoint = `${supabaseUrl}/functions/v1/parse-bank-statement-ai`;
    
    console.log(`Full endpoint URL: ${edgeFunctionEndpoint}`);
    
    // Implement retry logic
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= MAX_RETRIES) {
      try {
        // Add a clear log message before making the fetch request
        console.log(`Attempt ${retryCount + 1}: Fetching from ${edgeFunctionEndpoint}...`);
        
        // Track that we're attempting to connect
        trackSuccessfulConnection(edgeFunctionEndpoint);
        
        // Custom fetch to edge function with explicit timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        console.log("Request headers:", {
          Authorization: `Bearer ${token.substring(0, 10)}...` // Only log part of the token for security
        });
        
        const response = await fetch(
          edgeFunctionEndpoint,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        
        console.log(`Edge function response status: ${response.status}`);
        
        if (!response.ok) {
          const errorData = await handleResponseError(response);
          throw errorData;
        }
        
        const result = await response.json();
        console.log("Edge function response data:", result);
        return processSuccessfulResult(result, onSuccess);
      } catch (error: any) {
        lastError = error;
        
        // Check specifically for network-related errors
        const isNetworkError = error.name === 'AbortError' || 
                              (error.message && (
                                error.message.includes('Failed to fetch') || 
                                error.message.includes('Network error') ||
                                error.message.includes('network timeout') ||
                                error.message.includes('abort')
                              ));
        
        console.error(`Attempt ${retryCount + 1} failed:`, error.message || error);
        console.error("Error details:", error);
        
        if (isNetworkError) {
          console.log('Network-related error detected, will attempt retry if retries remaining');
          trackFailedConnection('network_error', error, edgeFunctionEndpoint);
          
          // For CSV files, try fallback immediately for network errors
          if (file.name.toLowerCase().endsWith('.csv')) {
            console.log('CSV file detected, attempting local fallback');
            const fallbackHandled = await handleCSVFallback(file, onSuccess, onError, error);
            if (fallbackHandled) {
              return true;
            }
          }
        } else {
          // For non-network errors, process through the error handler
          const { message, shouldRetry, errorType, details } = handleEdgeFunctionError(error, error.status);
          trackFailedConnection(errorType, details || error, edgeFunctionEndpoint);
          
          if (!shouldRetry) {
            return onError(message);
          }
        }
        
        // If we've exhausted all retries, return the last error
        if (retryCount >= MAX_RETRIES) {
          trackFailedConnection('max_retries_exceeded', lastError, edgeFunctionEndpoint);
          return onError(
            lastError?.message || "Failed to process file after multiple attempts. Please try again later."
          );
        }
        
        // Increment retry counter and wait before next attempt
        retryCount++;
        console.log(`Waiting before retry attempt ${retryCount + 1}...`);
        await new Promise(r => setTimeout(r, 1000 * retryCount));
      }
    }
    
  } catch (error: any) {
    console.error("Error in parseViaEdgeFunction:", error);
    
    trackFailedConnection('unexpected_error', error);
    
    return onError(error.message || "Failed to process file with server");
  }
};

/**
 * Process a successful response from the edge function
 */
const processSuccessfulResult = (
  result: any, 
  onSuccess: (transactions: ParsedTransaction[]) => void
): boolean => {
  console.log("Edge function result:", result);
  
  if (!result.success) {
    trackFailedConnection('processing_error', { result });
    throw new Error(result.error || "Unknown error processing file");
  }
  
  if (!result.transactions || !Array.isArray(result.transactions) || result.transactions.length === 0) {
    trackFailedConnection('no_transactions', { result });
    throw new Error("No transactions were found in the uploaded file");
  }
  
  console.log(`Successfully parsed ${result.transactions.length} transactions`);
  
  // Process the transactions
  const transactions: ParsedTransaction[] = result.transactions.map((tx: any) => ({
    id: `tx-${Math.random().toString(36).substr(2, 9)}`,
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
};

/**
 * Handle error response from the edge function
 */
const handleResponseError = async (response: Response): Promise<any> => {
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
  
  return { 
    message: errorMessage, 
    status: response.status 
  };
};
