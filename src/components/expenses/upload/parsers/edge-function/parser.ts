
import { ParsedTransaction } from "../types";
import { getAuthToken, MAX_RETRIES, sleep } from "./retryHandler";
import { trackSuccessfulConnection, trackFailedConnection } from "./connectionStats";
import { prepareFormData } from "./formDataPreparation";
import { sendRequestWithRetry } from "./requestHandler";
import { handleNetworkError, handleOtherErrors } from "./errorHandlers";

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
    console.log(`🔄 STEP 0: Starting bank statement processing via edge function`);
    console.log(`Parsing file via edge function: ${file.name}, size: ${file.size} bytes, type: ${file.type}`, options);
    
    // Get auth token
    console.log(`🔄 STEP 0.1: Getting authentication token`);
    const { token, error: authError } = await getAuthToken();
    if (authError || !token) {
      console.error("❌ STEP 0.2: Authentication error:", authError);
      trackFailedConnection('auth_token_error', new Error(authError || "Authentication failed"));
      return onError(authError || "Authentication error occurred");
    }
    console.log(`✅ STEP 0.3: Authentication token retrieved successfully`);
    
    // For PDFs, ensure Vision API is used by default unless explicitly disabled
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    if (isPdf && options.useVision !== false) {
      options.useVision = true;
      
      // Update dummyData prevention flags
      options.disableFakeDataGeneration = true;
      options.strictExtractMode = true;
      options.forceRealData = true;
      options.debugMode = true; // Add debug flag
      
      console.log("🔄 STEP 0.4: Vision API and anti-dummy data protections enabled for PDF processing");
      
      // Add explicit console log for Google Vision API usage
      console.log("🔍 STEP 0.5: Attempting to use Google Vision API for PDF text extraction");
    }
    
    // Prepare form data
    const { formData, isPdf: isFilePdf, pdfAttemptCount } = prepareFormData(file, options);
    console.log(`✅ STEP 0.6: Form data prepared, PDF attempt count: ${pdfAttemptCount}`);
    
    // Make sure we're using the correct URL format
    const supabaseUrl = "https://naxmgtoskeijvdofqyik.supabase.co";
    const edgeFunctionEndpoint = `${supabaseUrl}/functions/v1/parse-bank-statement-ai`;
    
    console.log(`🔄 STEP 3: Full endpoint URL: ${edgeFunctionEndpoint}`);
    console.log("Request options:", options);
    
    // Implement retry logic
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= MAX_RETRIES) {
      try {
        console.log(`🔄 STEP 4: Processing attempt ${retryCount + 1} of ${MAX_RETRIES + 1}`);
        
        // Attempt to send the request
        console.log(`🔄 STEP 4.2: Sending request to edge function endpoint`);
        const requestSucceeded = await sendRequestWithRetry(
          edgeFunctionEndpoint,
          token,
          formData,
          (transactions) => {
            console.log(`✅ STEP 5: Received ${transactions.length} transactions from edge function`);
            
            // First check for any log markers that indicate real data was extracted
            const realDataExtracted = transactions.some(tx => 
              tx.description?.includes('VISION_API_EXTRACTION_SUCCESS_MARKER') ||
              tx.amount?.toString().includes('VISION_API_EXTRACTION_SUCCESS_MARKER')
            );
            
            if (realDataExtracted) {
              console.log("✅ STEP 5.1: Confirmed that real data was extracted via Google Vision");
            } else if (isFilePdf && options.useVision) {
              console.warn("⚠️ STEP 5.2: No Vision API success markers found. Google Vision API might not have been used.");
            }
            
            // Filter out any marker transactions
            const filteredTransactions = transactions.filter(tx => 
              !tx.description?.includes('VISION_API_EXTRACTION_SUCCESS_MARKER') &&
              !tx.amount?.toString().includes('VISION_API_EXTRACTION_SUCCESS_MARKER')
            );
            
            // Check for empty or invalid transactions
            if (!filteredTransactions || filteredTransactions.length === 0) {
              console.error("❌ STEP 5.3: No valid transactions found in the document");
              return onError("No transactions were found in the document. Please try a different file format.");
            }
            
            console.log(`✅ STEP 5.4: Processing ${filteredTransactions.length} transactions from server`);
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
          console.log(`✅ STEP 7: Request completed successfully`);
          return true;
        }
      } catch (error: any) {
        lastError = error;
        console.error(`❌ STEP 8: Error in attempt ${retryCount + 1}:`, error);
        
        // Check specifically for Vision API related errors
        const isVisionApiError = error.message && (
          error.message.includes("Google Vision API") ||
          error.message.includes("Vision API") ||
          error.message.includes("vision")
        );
        
        if (isVisionApiError) {
          console.error("❌ STEP 8.1: Google Vision API error detected:", error);
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
          console.log(`🔄 STEP 8.2: Handling network error for attempt ${retryCount + 1}`);
          const handled = await handleNetworkError(error, file, onSuccess, onError, edgeFunctionEndpoint);
          if (handled) return true;
        } else {
          // Handle other errors
          console.log(`🔄 STEP 8.3: Handling other error for attempt ${retryCount + 1}`);
          const handled = await handleOtherErrors(error, file, onSuccess, onError, edgeFunctionEndpoint);
          if (handled) return true;
        }
      }
      
      // If we've exhausted all retries, return the last error
      if (retryCount >= MAX_RETRIES) {
        console.log(`❌ STEP 9: Max retries (${MAX_RETRIES}) exceeded. Giving up.`);
        trackFailedConnection('max_retries_exceeded', lastError || new Error("Max retries exceeded"));
        return onError(
          lastError?.message || "Failed to process file after multiple attempts. Please try again later."
        );
      }
      
      // Increment retry counter and wait before next attempt
      retryCount++;
      console.log(`🔄 STEP 10: Waiting before retry attempt ${retryCount + 1}...`);
      await sleep(1000 * retryCount);
    }
    
    return false;
  } catch (error: any) {
    console.error("❌ STEP 11: Unexpected error in parseViaEdgeFunction:", error);
    trackFailedConnection('unexpected_error', error);
    return onError(error.message || "Failed to process file with server");
  }
};
