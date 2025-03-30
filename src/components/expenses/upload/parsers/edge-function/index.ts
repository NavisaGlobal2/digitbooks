
// Import necessary types and functions
import { ParsedTransaction } from "../types";
import { trackSuccessfulConnection, trackFailedConnection } from "./connectionStats";
import { processPdfWithOcrSpace } from "./ocrSpaceProcessor";
import { handleCSVFallback } from "./fallbackHandler";
import { handleEdgeFunctionRequest } from "./requestHandler";
import { supabase } from "@/integrations/supabase/client";
import { sleep, MAX_RETRIES } from "./retryHandler";

// Export necessary utilities
export { sleep, MAX_RETRIES } from "./retryHandler";

// Function to get auth token
export const getAuthToken = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      console.error("Auth error:", error);
      return { token: null, error: error?.message || "Not authenticated" };
    }
    
    return { token: data.session.access_token, error: null };
  } catch (e: any) {
    console.error("Auth exception:", e);
    return { token: null, error: e.message || "Authentication error occurred" };
  }
};

// Function to handle PDF processing with OCR.space
export const handleOcrSpaceProcessing = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean
): Promise<boolean> => {
  try {
    // Get auth token for Supabase
    const { token, error } = await getAuthToken();
    if (error || !token) {
      return onError(error || "Failed to authenticate with Supabase");
    }

    // Get Supabase URL from window location or environment variables
    const supabaseUrl = 
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 
      (typeof window !== 'undefined' && window.location.origin) || 
      '';
    
    // Get Supabase key from environment variables or a fallback value
    const supabaseKey = 
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 
      '';

    // Process PDF with OCR.space
    const result = await processPdfWithOcrSpace(file, supabaseUrl, supabaseKey);
    
    // Extract structured data from OCR text
    const { extractStructuredDataFromText } = await import('./ocrSpaceProcessor');
    const structuredData = extractStructuredDataFromText(result.text);
    
    if (!structuredData?.transactions || structuredData.transactions.length === 0) {
      return onError("No transactions could be extracted from the PDF");
    }
    
    // Return transactions to the caller
    onSuccess(structuredData.transactions);
    return true;
    
  } catch (error: any) {
    console.error("OCR.space processing error:", error);
    return onError(error.message || "Failed to process PDF with OCR.space");
  }
};

// Main function to parse via Edge Function
export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  options: any = {}
): Promise<boolean> => {
  try {
    console.log(`🔄 Starting bank statement processing via edge function`);
    console.log(`Parsing file via edge function: ${file.name}, size: ${file.size} bytes, type: ${file.type}`, options);
    
    // If OCR.space is requested for PDF files, use special handling
    if (options.useOcrSpace && file.type === 'application/pdf') {
      await handleOcrSpaceProcessing(file, onSuccess, onError);
      return true;
    }
    
    // Extract the file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    // Determine the parsing mode based on file type and options
    const isCSV = fileExt === 'csv';
    const useAI = options.preferredProvider !== 'none';
    
    // Get authentication token
    const { token, error: authError } = await getAuthToken();
    if (authError || !token) {
      console.error("Authentication error:", authError);
      onError(authError || "You need to be signed in to use this feature");
      return false;
    }
    
    // Prepare the request body
    const formData = new FormData();
    formData.append('file', file);
    formData.append('useAI', String(useAI));
    formData.append('preferredProvider', options.preferredProvider || 'anthropic');
    formData.append('useVision', String(options.useVision || false));
    formData.append('forceRealData', String(options.forceRealData || false));
    formData.append('context', options.context || 'expense');
    formData.append('extractRealData', String(options.extractRealData || false));
    formData.append('noDummyData', String(options.noDummyData || false));
    formData.append('safeProcessing', String(options.safeProcessing || false));
    formData.append('disableFakeDataGeneration', String(options.disableFakeDataGeneration || false));
    formData.append('strictExtractMode', String(options.strictExtractMode || false));
    formData.append('returnEmptyOnFailure', String(options.returnEmptyOnFailure || false));
    formData.append('neverGenerateDummyData', String(options.neverGenerateDummyData || false));
    formData.append('debugMode', String(options.debugMode || false));
    formData.append('storePdfInSupabase', String(options.storePdfInSupabase || false));
    formData.append('extractPdfText', String(options.extractPdfText || false));
    
    // Define the edge function URL - use a fallback API endpoint
    const edgeFunctionURL = 
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EDGE_FUNCTION_URL) || 
      '/api/parse-bank-statement';
    
    console.log(`Using edge function URL: ${edgeFunctionURL}`);
    
    // Make the request to the edge function
    try {
      const response = await fetch(edgeFunctionURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Edge function error (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        console.error("Edge function result error:", result.error);
        trackFailedConnection('edge_function_result_error', new Error(result.error));
        
        // Handle CSV fallback if AI fails
        if (isCSV && options.preferredProvider !== 'none' && result.error.includes('AI')) {
          console.log("Attempting CSV parsing fallback due to AI error");
          await handleCSVFallback(file, onSuccess, onError, result.error);
          return true;
        }
        
        onError(result.error);
        return false;
      }
      
      // Process successful response
      const transactions = result.data as ParsedTransaction[];
      trackSuccessfulConnection(edgeFunctionURL);
      onSuccess(transactions);
      return true;
      
    } catch (error: any) {
      console.error("Edge function request error:", error);
      trackFailedConnection('edge_function_request', error);
      onError(error.message || "Failed to connect to parsing service");
      return false;
    }
    
  } catch (error: any) {
    console.error("Error in parseViaEdgeFunction:", error);
    trackFailedConnection('parse_via_edge_function', error);
    onError(error.message || "Unknown error occurred during parsing");
    return false;
  }
};

// Re-export stats functions
export { getConnectionStats } from './connectionStats';
