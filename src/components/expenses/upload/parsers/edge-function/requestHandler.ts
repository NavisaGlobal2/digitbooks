
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
    console.log("🔄 STEP 3.1: Making fetch request to edge function...");
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
    
    console.log(`✅ STEP 3.2: Edge function response status: ${response.status}`);
    
    // Handle non-successful responses
    if (!response.ok) {
      console.error(`❌ STEP 3.3: Edge function returned non-OK status: ${response.status}`);
      const errorData = await handleResponseError(response);
      throw errorData;
    }
    
    // Process successful response
    console.log("🔄 STEP 3.4: Processing edge function response data");
    const result = await response.json();
    console.log("Edge function response data:", result);
    
    // Reset PDF attempt counter on success
    if (isPdf) {
      console.log("✅ STEP 3.5: Resetting PDF attempt counter after successful response");
      localStorage.removeItem('pdf_attempt_count');
    }
    
    if (processSuccessfulResult(result, onSuccess)) {
      console.log("✅ STEP 3.6: Successfully processed result");
      return { success: true };
    }
    
    console.error("❌ STEP 3.7: Failed to process successful result");
    return { 
      success: false,
      error: { message: "Failed to process successful result" }
    };
  } catch (error: any) {
    console.error("❌ STEP 3.8: Error in makeEdgeFunctionRequest:", error);
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
  console.log(`🔄 STEP 3: Sending request to edge function (attempt ${retryCount + 1})`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log("⏱️ STEP 3.0: Request timeout reached, aborting...");
    controller.abort();
  }, 60000);
  
  try {
    console.log(`🔄 STEP 3.0: Attempt ${retryCount + 1}: Fetching from edge function...`);
    
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
      console.log(`✅ STEP 3.7: Request successful on attempt ${retryCount + 1}`);
      return true;
    }
    
    if (error) {
      console.error(`❌ STEP 3.8: Error in attempt ${retryCount + 1}:`, error);
      
      if (isPdf) {
        console.log(`🔄 STEP 3.9: Handling PDF-specific error for attempt ${retryCount + 1}`);
        const { shouldRetry, message } = handlePDFError(error, retryCount, error.isPdfError || false);
        
        if (shouldRetry && retryCount < maxRetries) {
          console.log(`🔄 STEP 3.10: Will retry PDF processing (attempt ${retryCount + 2})`);
          return false; // Signal for retry
        } else {
          console.error(`❌ STEP 3.11: PDF error, not retrying:`, message);
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
        console.log(`🔄 STEP 3.12: Network error detected, will retry (attempt ${retryCount + 2})`);
        return false; // Signal for retry
      }
    }
    
    console.error(`❌ STEP 3.13: Non-recoverable error in attempt ${retryCount + 1}`);
    return onError(error?.message || "Unknown error occurred");
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`❌ STEP 3.14: Exception in attempt ${retryCount + 1}:`, error);
    return onError(error?.message || "Unexpected error during request");
  }
};
