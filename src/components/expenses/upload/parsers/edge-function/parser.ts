
import { ParsedTransaction } from "../types";
import { 
  getAuthToken,
  MAX_RETRIES,
  sleep,
  trackSuccessfulConnection,
  trackFailedConnection,
  showFallbackMessage
} from "./index";
import { handleCSVFallback } from "./fallbackHandler";
import { callEdgeFunction, handleResponseError } from "./apiClient";
import { processSuccessfulResult } from "./responseProcessor";

/**
 * Parse a bank statement file via the Supabase edge function
 */
export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  preferredProvider: string = "anthropic"
): Promise<boolean> => {
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
    
    // Make sure we're using the correct URL format for production
    const supabaseUrl = "https://naxmgtoskeijvdofqyik.supabase.co";
    const edgeFunctionEndpoint = `${supabaseUrl}/functions/v1/parse-bank-statement-ai`;
    
    console.log(`Full endpoint URL: ${edgeFunctionEndpoint}`);
    
    // Implement retry logic
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= MAX_RETRIES) {
      try {
        console.log(`Attempt ${retryCount + 1}: Fetching from edge function...`);
        trackSuccessfulConnection(edgeFunctionEndpoint);
        
        // Add a stronger timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log("Request timeout reached, aborting...");
          controller.abort();
        }, 30000); // 30-second timeout
        
        // Make the request to the edge function
        console.log("Making fetch request to edge function...");
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
        
        // Handle non-successful responses
        if (!response.ok) {
          const errorMessage = await handleResponseError(response);
          throw errorMessage;
        }
        
        // Process successful response
        const result = await response.json();
        console.log("Edge function response data:", result);
        
        if (processSuccessfulResult(result, onSuccess)) {
          return true; // Successfully processed
        }
      } catch (error: any) {
        lastError = error;
        console.error(`Error in attempt ${retryCount + 1}:`, error);
        
        // Check specifically for network-related errors
        const isNetworkError = error.name === 'AbortError' || 
                              (error.message && (
                                error.message.includes('Failed to fetch') || 
                                error.message.includes('Network error') ||
                                error.message.includes('network timeout') ||
                                error.message.includes('abort')
                              ));
        
        if (isNetworkError) {
          console.log('Network-related error detected, will attempt retry if retries remaining');
          trackFailedConnection('network_error', error, edgeFunctionEndpoint);
          
          // For CSV files, try fallback immediately for network errors
          if (file.name.toLowerCase().endsWith('.csv')) {
            console.log('CSV file detected, attempting local fallback');
            return await handleCSVFallback(file, onSuccess, onError, error);
          }
        } else {
          // Handle other errors
          return await handleOtherErrors(error, file, onSuccess, onError, edgeFunctionEndpoint);
        }
      }
      
      // If we've exhausted all retries, return the last error
      if (retryCount >= MAX_RETRIES) {
        console.log(`Max retries (${MAX_RETRIES}) exceeded. Giving up.`);
        trackFailedConnection('max_retries_exceeded', lastError, edgeFunctionEndpoint);
        return onError(
          lastError?.message || "Failed to process file after multiple attempts. Please try again later."
        );
      }
      
      // Increment retry counter and wait before next attempt
      retryCount++;
      console.log(`Waiting before retry attempt ${retryCount + 1}...`);
      await sleep(1000 * retryCount);
    }
    
    return false;
  } catch (error: any) {
    console.error("Unexpected error in parseViaEdgeFunction:", error);
    trackFailedConnection('unexpected_error', error);
    return onError(error.message || "Failed to process file with server");
  }
};

/**
 * Handle non-network errors
 */
const handleOtherErrors = async (
  error: any, 
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  endpoint: string
): Promise<boolean> => {
  // Handle authentication errors
  if (error.status === 401 || 
      (error.message && error.message.toLowerCase().includes('auth'))) {
    console.error("Authentication error:", error);
    trackFailedConnection('auth_error', error, endpoint);
    return onError("Authentication error. Please sign in again and try once more.");
  }
  
  // Handle server errors
  if (error.status && error.status >= 500) {
    console.error("Server error:", error);
    trackFailedConnection('server_error', error, endpoint);
    
    // For CSV files with server errors, try fallback
    if (file.name.toLowerCase().endsWith('.csv')) {
      console.log('Server error with CSV file, attempting local fallback');
      return await handleCSVFallback(file, onSuccess, onError, error);
    }
    
    return onError(`Server error (${error.status}). Please try again later.`);
  }
  
  // Handle all other errors
  console.error("Other error:", error);
  trackFailedConnection('other_error', error, endpoint);
  return onError(error.message || "Error processing file");
};
