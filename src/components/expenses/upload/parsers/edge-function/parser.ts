
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
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    if (isPdf && options.useVision !== false) {
      options.useVision = true;
      
      // Update dummyData prevention flags
      options.disableFakeDataGeneration = true;
      options.strictExtractMode = true;
      options.forceRealData = true;
      options.debugMode = true; // Add debug flag
      
      console.log("Vision API and anti-dummy data protections enabled for PDF processing");
      
      // Add explicit console log for Google Vision API usage
      console.log("🔍 Attempting to use Google Vision API for PDF text extraction");
    }
    
    // Prepare form data
    const { formData, isPdf: isFilePdf, pdfAttemptCount } = prepareFormData(file, options);
    
    // Make sure we're using the correct URL format
    const supabaseUrl = "https://naxmgtoskeijvdofqyik.supabase.co";
    const edgeFunctionEndpoint = `${supabaseUrl}/functions/v1/parse-bank-statement-ai`;
    
    console.log(`Full endpoint URL: ${edgeFunctionEndpoint}`);
    console.log("Request options:", options);
    
    // Implement retry logic
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= MAX_RETRIES) {
      try {
        // Handle PDF-specific retry logic
        if (isFilePdf) {
          await handlePDFRetry(formData, retryCount);
        }
        
        // Attempt to send the request
        const requestSucceeded = await sendRequestWithRetry(
          edgeFunctionEndpoint,
          token,
          formData,
          (transactions) => {
            console.log(`Received ${transactions.length} transactions from edge function`);
            
            // First check for any log markers that indicate real data was extracted
            const realDataExtracted = transactions.some(tx => 
              tx.description?.includes('VISION_API_EXTRACTION_SUCCESS_MARKER') ||
              tx.amount?.toString().includes('VISION_API_EXTRACTION_SUCCESS_MARKER')
            );
            
            if (realDataExtracted) {
              console.log("✅ Confirmed that real data was extracted via Google Vision");
            } else if (isFilePdf && options.useVision) {
              console.warn("⚠️ No Vision API success markers found. Google Vision API might not have been used.");
            }
            
            // Filter out any marker transactions
            const filteredTransactions = transactions.filter(tx => 
              !tx.description?.includes('VISION_API_EXTRACTION_SUCCESS_MARKER') &&
              !tx.amount?.toString().includes('VISION_API_EXTRACTION_SUCCESS_MARKER')
            );
            
            // Check for empty or invalid transactions
            if (!filteredTransactions || filteredTransactions.length === 0) {
              return onError("No transactions were found in the document. Please try a different file format.");
            }
            
            // Pass the filtered transactions to success handler
            onSuccess(filteredTransactions);
            return true;
          },
          onError,
          isFilePdf,
          retryCount,
          MAX_RETRIES
        );
        
        if (requestSucceeded) {
          return true;
        }
      } catch (error: any) {
        lastError = error;
        console.error(`Error in attempt ${retryCount + 1}:`, error);
        
        // Check specifically for Vision API related errors
        const isVisionApiError = error.message && (
          error.message.includes("Google Vision API") ||
          error.message.includes("Vision API") ||
          error.message.includes("vision")
        );
        
        if (isVisionApiError) {
          console.error("Google Vision API error detected:", error);
          return onError("Google Vision API error: " + error.message);
        }
        
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
