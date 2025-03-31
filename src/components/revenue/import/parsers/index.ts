
import { toast } from "sonner";
import { ParsedTransaction, CSVParseResult } from "./types";
import { parseViaEdgeFunction } from "./edgeFunctionParser";

// Main function to parse a statement file
export const parseStatementFile = (
  file: File,
  onSuccess: (result: CSVParseResult | ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean
) => {
  if (!file) {
    toast.error("Please select a bank statement file");
    return;
  }
  
  // Check file size first
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    onError(`File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 10MB.`);
    return;
  }
  
  try {
    // For all file types, use the edge function parser which handles PDF, CSV, and Excel
    parseViaEdgeFunction(
      file,
      (transactions) => {
        onSuccess(transactions);
      }, 
      onError,
      undefined, // reset progress callback
      undefined, // complete progress callback
      true // Use AI formatting by default
    );
  } catch (error) {
    console.error("Error in parseStatementFile:", error);
    return onError(`Unexpected error while parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export * from "./types";
