
import { trackSuccessfulConnection } from "./connectionStats";
import { handleResponseError } from "./apiClient";
import { processSuccessfulResult } from "./responseProcessor";
import { ParsedTransaction } from "../types";
import { handlePDFError } from "./pdfHandler";

/**
 * Make a request to the edge function
 */
export const makeEdgeFunctionRequest = async (
  endpoint: string,
  token: string,
  formData: FormData,
  controller: AbortController,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  isPdf: boolean
): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log("Making fetch request to edge function...");
    trackSuccessfulConnection(endpoint);
    
    const response = await fetch(
      endpoint,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal
      }
    );
    
    console.log(`Edge function response status: ${response.status}`);
    
    // Handle non-successful responses
    if (!response.ok) {
      const errorData = await handleResponseError(response);
      throw errorData;
    }
    
    // Process successful response
    const result = await response.json();
    console.log("Edge function response data:", result);
    
    // Reset PDF attempt counter on success
    if (isPdf) {
      localStorage.removeItem('pdf_attempt_count');
    }
    
    if (processSuccessfulResult(result, onSuccess)) {
      return { success: true };
    }
    
    return { 
      success: false,
      error: { message: "Failed to process successful result" }
    };
  } catch (error: any) {
    return { success: false, error };
  }
};

/**
 * Send a request to the edge function with retry logic
 */
export const sendRequestWithRetry = async (
  endpoint: string,
  token: string, 
  formData: FormData,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  isPdf: boolean,
  retryCount: number,
  maxRetries: number
): Promise<boolean> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log("Request timeout reached, aborting...");
    controller.abort();
  }, 60000);
  
  try {
    console.log(`Attempt ${retryCount + 1}: Fetching from edge function...`);
    
    const { success, error } = await makeEdgeFunctionRequest(
      endpoint,
      token,
      formData,
      controller,
      onSuccess,
      isPdf
    );
    
    clearTimeout(timeoutId);
    
    if (success) {
      return true;
    }
    
    if (error) {
      console.error(`Error in attempt ${retryCount + 1}:`, error);
      
      if (isPdf) {
        const { shouldRetry, message } = handlePDFError(error, retryCount, error.isPdfError || false);
        
        if (shouldRetry && retryCount < maxRetries) {
          return false; // Signal for retry
        } else {
          return onError(message);
        }
      }
      
      // Check specifically for network-related errors
      const isNetworkError = error.name === 'AbortError' || 
                            (error.message && (
                              error.message.includes('Failed to fetch') || 
                              error.message.includes('Network error') ||
                              error.message.includes('network timeout') ||
                              error.message.includes('abort')
                            ));
      
      if (isNetworkError && retryCount < maxRetries) {
        return false; // Signal for retry
      }
    }
    
    return onError(error?.message || "Unknown error occurred");
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`Error in attempt ${retryCount + 1}:`, error);
    return onError(error?.message || "Unexpected error during request");
  }
};
