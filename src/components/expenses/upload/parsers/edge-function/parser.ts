
import { ParsedTransaction } from "../types";
import { getAuthToken, MAX_RETRIES, sleep } from "./index";
import { trackSuccessfulConnection, trackFailedConnection } from "./connectionStats";
import { prepareFormData, createRequestConfig } from "./formDataPreparation";
import { sendRequestWithRetry } from "./requestHandler";
import { handleNetworkError, handleOtherErrors } from "./errorHandlers";
import { handlePDFRetry } from "./pdfHandler";

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
    
    // For PDFs, ensure Vision API is used by default unless explicitly disabled
    if (file.name.toLowerCase().endsWith('.pdf') && options.useVision !== false) {
      options.useVision = true;
      console.log("Vision API enabled for PDF processing");
    }
    
    // Prepare form data
    const { formData, isPdf, pdfAttemptCount } = prepareFormData(file, options);
    
    // Make sure we're using the correct URL format
    const supabaseUrl = "https://naxmgtoskeijvdofqyik.supabase.co";
    const edgeFunctionEndpoint = `${supabaseUrl}/functions/v1/parse-bank-statement-ai`;
    
    console.log(`Full endpoint URL: ${edgeFunctionEndpoint}`);
    
    // Implement retry logic
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= MAX_RETRIES) {
      try {
        // Handle PDF-specific retry logic
        if (isPdf) {
          await handlePDFRetry(formData, retryCount);
        }
        
        // Attempt to send the request
        const requestSucceeded = await sendRequestWithRetry(
          edgeFunctionEndpoint,
          token,
          formData,
          onSuccess,
          onError,
          isPdf,
          retryCount,
          MAX_RETRIES
        );
        
        if (requestSucceeded) {
          return true;
        }
      } catch (error: any) {
        lastError = error;
        console.error(`Error in attempt ${retryCount + 1}:`, error);
        
        // Handle network errors
        const isNetworkError = error.name === 'AbortError' || 
                              (error.message && (
                                error.message.includes('Failed to fetch') || 
                                error.message.includes('Network error') ||
                                error.message.includes('network timeout') ||
                                error.message.includes('abort')
                              ));
        
        if (isNetworkError) {
          const handled = await handleNetworkError(error, file, onSuccess, onError, edgeFunctionEndpoint);
          if (handled) return true;
        } else {
          // Handle other errors
          const handled = await handleOtherErrors(error, file, onSuccess, onError, edgeFunctionEndpoint);
          if (handled) return true;
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
