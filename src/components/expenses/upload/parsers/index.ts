
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
  
  try {
    if (file.name.endsWith('.csv')) {
      parseCSVFile(
        file, 
        (result: CSVParseResult) => {
          // Pass the full result object
          onSuccess(result);
        }, 
        onError
      );
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      parseExcelFile(file, (transactions: ParsedTransaction[]) => {
        onSuccess(transactions);
      }, onError);
    } else if (file.name.endsWith('.pdf')) {
      parsePDFFile(file, (transactions: ParsedTransaction[]) => {
        onSuccess(transactions);
      }, onError);
    } else {
      onError('Unsupported file format');
    }
  } catch (error) {
    console.error("Error in parseStatementFile:", error);
    onError(`Unexpected error while parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
