
import { toast } from "sonner";
import { CSVParseResult, ParsedTransaction } from "./types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Parse file via edge function with additional error handling
 */
export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (result: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  resetProgress?: () => void,
  completeProgress?: () => void,
  useAIFormatting: boolean = true,
  context: string = 'revenue',
  preferredProvider?: string,
  setIsWaitingForServer?: (isWaiting: boolean) => void,
) => {
  if (setIsWaitingForServer) {
    setIsWaitingForServer(true);
  }
  
  const maxRetries = 2;
  
  // Store the file size for reporting
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  
  try {
    console.log(`Processing ${file.name} (${file.type}, ${fileSizeMB}MB) via edge function with AI formatting ${useAIFormatting ? 'enabled' : 'disabled'}`);
    
    // Function to attempt the API call with retries
    const withRetry = async (attempt = 1): Promise<any> => {
      try {
        // Set up the form data with processing preferences
        const formData = new FormData();
        formData.append("file", file);
        formData.append("context", context);
        formData.append("useAIFormatting", useAIFormatting.toString());
        
        if (preferredProvider) {
          formData.append("preferredProvider", preferredProvider);
        }
        
        // Since we're dealing with potentially large files, increase the timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        // Call the edge function
        const { data, error } = await supabase.functions.invoke("parse-bank-statement-ai", {
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error(`Edge function error:`, error);
          
          // If we have retries left, try again
          if (attempt < maxRetries) {
            console.log(`Retrying (attempt ${attempt + 1}/${maxRetries})...`);
            return withRetry(attempt + 1);
          }
          
          throw new Error(error.message || "Failed to process file");
        }
        
        if (!data || (Array.isArray(data.transactions) && data.transactions.length === 0)) {
          throw new Error("No transactions found in the file");
        }
        
        console.log(`Successfully parsed ${data.transactions.length} transactions via edge function`);
        
        if (completeProgress) {
          completeProgress();
        }
        
        return data.transactions;
      } catch (err: any) {
        console.error(`Attempt ${attempt} failed:`, err);
        
        // If we have retries left and it's not an abort error, try again
        if (attempt < maxRetries && err.name !== 'AbortError') {
          console.log(`Retrying (attempt ${attempt + 1}/${maxRetries})...`);
          return withRetry(attempt + 1);
        }
        
        // Special handling for timeout errors
        if (err.name === 'AbortError') {
          throw new Error(`Processing timed out. The file may be too large (${fileSizeMB}MB) or complex. Please try a smaller file.`);
        }
        
        throw err;
      }
    };
    
    // Attempt the API call with retries
    const transactions = await withRetry();
    
    // Report success
    if (transactions && Array.isArray(transactions)) {
      onSuccess(transactions);
    } else {
      onError("Invalid response format from server");
    }
  } catch (error: any) {
    console.error("Edge function parsing error:", error);
    
    // Report error with useful message
    let errorMessage = "Failed to process file";
    
    if (error.message) {
      errorMessage = error.message;
    } else if (file.size > 10 * 1024 * 1024) {
      errorMessage = `File may be too large (${fileSizeMB}MB). Consider splitting into smaller files.`;
    }
    
    onError(errorMessage);
    
    if (resetProgress) {
      resetProgress();
    }
  } finally {
    if (setIsWaitingForServer) {
      setIsWaitingForServer(false);
    }
  }
};
