
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
  options: any = {}
): Promise<boolean> => {
  try {
    console.log(`Parsing file via edge function: ${file.name}, size: ${file.size} bytes, type: ${file.type}`, options);
    
    // Get auth token
    const { token, error: authError } = await getAuthToken();
    if (authError || !token) {
      console.error("Authentication error:", authError);
      trackFailedConnection('auth_token_error', { message: authError });
      return onError(authError || "Authentication error occurred");
    }
    
    // Create FormData with file and options
    const formData = new FormData();
    formData.append("file", file);
    
    // For PDF files, add special flags to help with processing
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    
    if (isPdf) {
      formData.append("fileType", "pdf");
      console.log("PDF file detected. Adding special handling flags.");
      
      // Add special flags to ensure we're getting real data
      formData.append("extractRealData", "true");
      formData.append("useVision", options?.useVision ? "true" : "false");
      formData.append("forceRealData", options?.forceRealData ? "true" : "false");
      
      if (options?.context) {
        formData.append("context", options.context);
      }
      
      // Add new option to disable recursive processing for large PDFs
      formData.append("safeProcessing", "true");
    }
    
    if (options?.preferredProvider) {
      formData.append("preferredProvider", options.preferredProvider);
      console.log(`Using preferred AI provider: ${options.preferredProvider}`);
    }
    
    // Make sure we're using the correct URL format
    const supabaseUrl = "https://naxmgtoskeijvdofqyik.supabase.co";
    const edgeFunctionEndpoint = `${supabaseUrl}/functions/v1/parse-bank-statement-ai`;
    
    console.log(`Full endpoint URL: ${edgeFunctionEndpoint}`);
    
    // Implement retry logic with a count of already attempted PDFs to avoid endless loops
    let retryCount = 0;
    let lastError = null;
    let pdfAttemptCount = localStorage.getItem('pdf_attempt_count') ? 
                           parseInt(localStorage.getItem('pdf_attempt_count') || '0') : 0;

    // If this is a PDF and we've already tried multiple times, use a different approach
    if (isPdf) {
      pdfAttemptCount++;
      localStorage.setItem('pdf_attempt_count', pdfAttemptCount.toString());
      console.log(`PDF attempt count: ${pdfAttemptCount}`);
      
      // After multiple attempts with the same PDF, try a different approach
      if (pdfAttemptCount > 3) {
        console.log("Multiple PDF attempts detected, using enhanced PDF handling");
        formData.append("enhancedPdfMode", "true");
      }
    } else {
      // Reset PDF attempt counter for non-PDF files
      localStorage.removeItem('pdf_attempt_count');
    }

    while (retryCount <= MAX_RETRIES) {
      try {
        console.log(`Attempt ${retryCount + 1}: Fetching from edge function...`);
        trackSuccessfulConnection(edgeFunctionEndpoint);
        
        // Add a stronger timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log("Request timeout reached, aborting...");
          controller.abort();
        }, 60000); // 60-second timeout for PDFs
        
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
          return true; // Successfully processed
        }
      } catch (error: any) {
        lastError = error;
        console.error(`Error in attempt ${retryCount + 1}:`, error);
        
        // Special handling for PDF errors
        if (isPdf && (error.isPdfError || 
            (error.message && (
              error.message.includes("operation is not supported") ||
              error.message.includes("Maximum call stack size exceeded") ||
              error.message.includes("sandbox environment internal error")
            )))) {
          console.log('PDF processing error detected.');
          
          if (retryCount === MAX_RETRIES) {
            // For PDF files that consistently fail, provide a clear error message
            return onError("We're experiencing technical limitations with PDF processing. Please try uploading the PDF again or use a CSV or Excel format if available.");
          }
          
          // Try again with a different approach
          retryCount++;
          
          // Add a pause before retrying to give the service time to recover
          console.log('Retrying PDF processing with different approach after short delay...');
          await sleep(2000); // Wait 2 seconds before retry
          continue;
        }
        
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
