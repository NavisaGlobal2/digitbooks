
import { toast } from "sonner";
import { ParsedTransaction, TransactionParsingOptions } from "./types";
import { parseViaEdgeFunction } from "./edgeFunctionParser";

export type { ParsedTransaction } from "./types";
export { parseViaEdgeFunction } from "./edgeFunctionParser";

// Main function to parse a statement file - now just a wrapper around parseViaEdgeFunction
export const parseStatementFile = (
  file: File,
  onSuccess: (result: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void,
  options: TransactionParsingOptions = {}
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
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExt === 'csv' || fileExt === 'xlsx' || fileExt === 'xls') {
      // Use server-side processing for all supported formats
      parseViaEdgeFunction(
        file,
        (transactions: ParsedTransaction[]) => {
          onSuccess(transactions);
        },
        (error: string) => {
          onError(error);
          return true;
        }
      );
    } else {
      onError(`Unsupported file format: ${fileExt || 'unknown'}. Currently only CSV and Excel files are supported.`);
    }
  } catch (error) {
    console.error("Error in parseStatementFile:", error);
    onError(`Unexpected error while parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
