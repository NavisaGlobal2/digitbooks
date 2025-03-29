
import { ParsedTransaction } from "../types";
import { 
  getAuthToken,
  MAX_RETRIES,
  trackSuccessfulConnection,
  trackFailedConnection
} from "./index";
import { callEdgeFunction } from "./apiClient";
import { processSuccessfulResult } from "./responseProcessor";
import { handleEdgeFunctionError } from "./errorHandler";
import { handleCSVFallback } from "./fallbackHandler";

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
        
        const success = await callEdgeFunction(
          edgeFunctionEndpoint,
          token,
          formData,
          (result) => processSuccessfulResult(result, onSuccess),
          (error) => {
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
                return handleCSVFallback(file, onSuccess, onError, error);
              }
              
              return false; // Return false to continue with retry logic
            } else {
              // For non-network errors, process through the error handler
              const { message, shouldRetry, errorType, details } = handleEdgeFunctionError(error, error.status);
              trackFailedConnection(errorType, details || error, edgeFunctionEndpoint);
              
              if (!shouldRetry) {
                onError(message);
                return true; // Return true to break out of retry loop
              }
              
              return false; // Return false to continue with retry logic
            }
          }
        );
        
        if (success) {
          return true; // Successfully processed, exit function
        }
        
      } catch (error: any) {
        lastError = error;
        console.error(`Unexpected error in attempt ${retryCount + 1}:`, error);
        trackFailedConnection('unexpected_error', error, edgeFunctionEndpoint);
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
    
  } catch (error: any) {
    console.error("Error in parseViaEdgeFunction:", error);
    
    trackFailedConnection('unexpected_error', error);
    
    return onError(error.message || "Failed to process file with server");
  }
};
