// Fixing return type issues in the index.ts file
// Import necessary types and functions
import { ParsedTransaction } from "../types";
import { getAuthToken } from "./authHandler";
import { trackSuccessfulConnection, trackFailedConnection } from "./connectionStats";
import { processPdfWithOcrSpace } from "./ocrSpaceProcessor";
import { handleCSVFallback } from "./fallbackHandler";
import { handleEdgeFunctionRequest } from "./requestHandler";
import { supabase } from "@/integrations/supabase/client";

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

    // Get Supabase URL and key for client
    const supabaseUrl = supabase.supabaseUrl;
    const supabaseKey = supabase.supabaseKey;

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
): Promise<void> => {
  try {
    // If OCR.space is requested for PDF files, use special handling
    if (options.useOcrSpace && file.type === 'application/pdf') {
      await handleOcrSpaceProcessing(file, onSuccess, onError);
      return;
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
      return onError(authError || "You need to be signed in to use this feature");
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
    
    // Define the edge function URL
    const edgeFunctionURL = process.env.NEXT_PUBLIC_EDGE_FUNCTION_URL || '/api/parse-bank-statement';
    
    // Make the request to the edge function
    const result = await handleEdgeFunctionRequest(edgeFunctionURL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (result.error) {
      console.error("Edge function error:", result.error);
      trackFailedConnection('edge_function_error', new Error(result.error));
      
      // Handle CSV fallback if AI fails
      if (isCSV && options.preferredProvider !== 'none' && result.error.includes('AI')) {
        console.log("Attempting CSV parsing fallback due to AI error");
        await handleCSVFallback(file, onSuccess, onError, result.error);
        return;
      }
      
      return onError(result.error);
    }
    
    // Process successful response
    const transactions = result.data as ParsedTransaction[];
    trackSuccessfulConnection(edgeFunctionURL);
    onSuccess(transactions);
    
  } catch (error: any) {
    trackFailedConnection('parse_via_edge_function', error);
    onError(error.message || "Unknown error occurred during parsing");
  }
};

// Re-export stats functions
export { getConnectionStats } from './connectionStats';
