import { supabase } from '@/integrations/supabase/client';
import { ParsedTransaction } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { prepareFormData, createRequestConfig } from './formDataPreparation';
import { processPdfWithOcrSpace } from './ocrSpaceProcessor';
import { connectionStats, trackSuccessfulConnection, trackFailedConnection, getConnectionStats } from './connectionStats';

// Constants
export const MAX_RETRIES = 2;
let pdfAttemptCount = 0;

// Export functions for connection stats
export { getConnectionStats, trackSuccessfulConnection, trackFailedConnection };

// Export the OCR.space processor
export { processPdfWithOcrSpace };

// Sleep utility function
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get auth token from Supabase
export const getAuthToken = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data?.session) {
      return { token: null, error: error?.message || 'Authentication session not found. Please sign in.' };
    }
    
    return { token: data.session.access_token, error: null };
  } catch (error: any) {
    return { token: null, error: error?.message || 'Authentication error' };
  }
};

// PDF attempt tracking
export const trackPDFAttempt = () => {
  pdfAttemptCount++;
  return pdfAttemptCount;
};

export const resetPDFAttemptCounter = () => {
  pdfAttemptCount = 0;
  return pdfAttemptCount;
};

// Parse via Edge Function
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
      trackFailedConnection('auth_token_error', { message: authError });
      return onError(authError || "Authentication error occurred");
    }
    console.log(`✅ STEP 0.3: Authentication token retrieved successfully`);
    
    // Check if we should use OCR.space for PDF processing
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    if (isPdf && options.useOcrSpace) {
      console.log("🔄 STEP 0.4: Using OCR.space for PDF processing");
      try {
        return await processPdfWithOcrSpace(
          file,
          (result) => {
            if (result.transactions && result.transactions.length > 0) {
              onSuccess(result.transactions);
              return true;
            } else {
              // If OCR.space couldn't extract transactions, try using the standard flow with the extracted text
              console.log("🔄 STEP 0.5: OCR.space did not find specific transactions, proceeding with standard processing of the extracted text");
              // Continue with standard processing...
              return false;
            }
          },
          onError
        );
      } catch (ocrError: any) {
        console.error("❌ OCR.space processing error:", ocrError);
        return onError(`OCR.space processing failed: ${ocrError.message}`);
      }
    }
    
    // For PDFs, ensure Vision API is used by default unless explicitly disabled
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
        
        // Create request config with authentication
        const config = createRequestConfig(token);
        
        // Send the request
        console.log(`🔄 STEP 3.0: Attempt ${retryCount + 1}: Fetching from edge function...`);
        console.log(`🔄 STEP 3.1: Making fetch request to edge function...`);
        
        const response = await fetch(edgeFunctionEndpoint, {
          ...config,
          method: 'POST',
          body: formData
        });
        
        console.log(`✅ STEP 3.2: Edge function response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ STEP 3.3: Edge function error response: ${errorText}`);
          throw new Error(`Edge function error: ${errorText}`);
        }
        
        console.log(`🔄 STEP 3.4: Processing edge function response data`);
        const result = await response.json();
        console.log("Edge function response data:", result);
        
        if (isPdf) {
          console.log(`✅ STEP 3.5: Resetting PDF attempt counter after successful response`);
          resetPDFAttemptCounter();
        }
        
        console.log(`🔄 STEP 6: Processing edge function result`);
        console.log("Edge function result:", result);
        
        if (!result || !result.transactions || !Array.isArray(result.transactions)) {
          console.error(`❌ STEP 6.1: Invalid response format or no transactions`);
          throw new Error("Invalid response from server or no transactions found");
        }
        
        if (result.transactions.length === 0) {
          console.error(`❌ STEP 6.2: Empty transactions array`);
          throw new Error("No transactions found in the document");
        }
        
        // Process the transactions
        console.log(`✅ STEP 6.12: Successfully parsed ${result.transactions.length} transactions`);
        
        // Map to our transaction format with IDs
        const transactions: ParsedTransaction[] = result.transactions.map((tx: any) => ({
          id: `tx-${Math.random().toString(36).substr(2, 9)}`,
          date: tx.date,
          description: tx.description || "",
          amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount,
          type: tx.type || (parseFloat(String(tx.amount)) < 0 ? 'debit' : 'credit'),
          selected: tx.type === 'debit', // Auto-select debit transactions for expenses
          category: "",
          source: ""
        }));
        
        // Validate all transactions have required fields
        const validTransactions = transactions.filter(tx => 
          tx.date && 
          tx.description && 
          !isNaN(parseFloat(String(tx.amount)))
        );
        
        console.log(`✅ STEP 6.14: After validation: ${validTransactions.length} of ${transactions.length} transactions are valid`);
        console.log(`📊 STEP 6.15: Sample transactions:`, validTransactions.slice(0, 3));
        
        trackSuccessfulConnection();
        console.log(`✅ STEP 3.6: Successfully processed result`);
        console.log(`✅ STEP 3.7: Request successful on attempt ${retryCount + 1}`);
        
        onSuccess(validTransactions);
        return true;
      } catch (error: any) {
        lastError = error;
        console.error(`❌ Error on attempt ${retryCount + 1}:`, error);
        
        // If we've exhausted all retries, return the last error
        if (retryCount >= MAX_RETRIES) {
          console.error(`❌ Max retries (${MAX_RETRIES}) exceeded`);
          trackFailedConnection('max_retries_exceeded', error);
          return onError(error.message || "Failed to process file after multiple attempts");
        }
        
        // Increment retry counter and wait before next attempt
        retryCount++;
        console.log(`🔄 Waiting before retry attempt ${retryCount}...`);
        await sleep(1000 * retryCount);
      }
    }
    
    return false;
  } catch (error: any) {
    console.error("❌ Unexpected error in parseViaEdgeFunction:", error);
    trackFailedConnection('unexpected_error', error);
    return onError(error.message || "Failed to process file");
  }
};
