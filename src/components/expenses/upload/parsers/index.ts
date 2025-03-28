
import { toast } from "sonner";
import { ParsedTransaction } from "./types";
import { parseCSVFile, CSVParseResult } from "./csvParser";
import { parseExcelFile } from "./excelParser";
import { parsePDFFile } from "./pdfParser";
import { parseViaEdgeFunction } from "./edgeFunctionParser";

export type { ParsedTransaction } from "./types";
export { parseViaEdgeFunction } from "./edgeFunctionParser";

// Main function to parse a statement file
export const parseStatementFile = (
  file: File,
  onSuccess: (result: CSVParseResult | ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
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
    
    if (fileExt === 'csv') {
      parseCSVFile(
        file, 
        (result: CSVParseResult) => {
          // Pass the full result object
          onSuccess(result);
        }, 
        onError
      );
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      parseExcelFile(file, (transactions: ParsedTransaction[]) => {
        onSuccess(transactions);
      }, onError);
    } else if (fileExt === 'pdf') {
      parsePDFFile(file, (transactions: ParsedTransaction[]) => {
        onSuccess(transactions);
      }, onError);
    } else {
      onError(`Unsupported file format: ${fileExt || 'unknown'}. Please upload CSV, Excel, or PDF files.`);
    }
  } catch (error) {
    console.error("Error in parseStatementFile:", error);
    onError(`Unexpected error while parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
