
import { parseCSVFile, CSVParseResult } from "../csvParser";
import { ParsedTransaction } from "../types";
import { trackFailedConnection } from "./connectionStats";

/**
 * Handle CSV parsing fallback
 */
export const handleCSVFallback = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  error: any
): Promise<boolean> => {
  try {
    console.log("Attempting CSV parsing fallback");
    
    parseCSVFile(
      file,
      (result: CSVParseResult) => {
        console.log("CSV fallback parsing successful");
        onSuccess(result.data as ParsedTransaction[]);
      },
      (fallbackErrorMessage: string) => {
        console.error("CSV fallback parsing failed:", fallbackErrorMessage);
        return onError(fallbackErrorMessage);
      }
    );
    
    return true;
  } catch (fallbackError: any) {
    console.error("CSV fallback error:", fallbackError);
    trackFailedConnection('csv_fallback_error', fallbackError);
    return onError(fallbackError.message || "CSV fallback failed");
  }
};
