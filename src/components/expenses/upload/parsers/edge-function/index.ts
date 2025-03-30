
// Import necessary types and functions
import { ParsedTransaction } from "../types";
import { trackSuccessfulConnection, trackFailedConnection, getConnectionStats, getTechnicalErrorDetails } from "./connectionStats";
import { processPdfWithOcrSpace } from "./ocrSpaceProcessor";
import { handleCSVFallback } from "./fallbackHandler";
import { handleEdgeFunctionRequest } from "./requestHandler";
import { supabase } from "@/integrations/supabase/client";
import { sleep, MAX_RETRIES } from "./retryHandler";
import { parseViaEdgeFunction } from "./parser";
import { getAuthToken } from "./authHandler";

// Export necessary utilities
export { sleep, MAX_RETRIES } from "./retryHandler";
export { parseViaEdgeFunction } from "./parser";
export { getAuthToken } from "./authHandler";

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

// Re-export stats functions
export { getConnectionStats, getTechnicalErrorDetails } from './connectionStats';
