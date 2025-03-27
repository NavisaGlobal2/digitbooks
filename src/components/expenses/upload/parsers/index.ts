
import { toast } from "sonner";
import { ParsedTransaction } from "./types";
import { parseCSVFile } from "./csvParser";
import { parseExcelFile } from "./excelParser";
import { parsePDFFile } from "./pdfParser";
import { parseViaEdgeFunction } from "./edgeFunctionParser";

export type { ParsedTransaction } from "./types";
export { parseViaEdgeFunction } from "./edgeFunctionParser";

// Main function to parse a statement file
export const parseStatementFile = (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  if (!file) {
    toast.error("Please select a bank statement file");
    return;
  }
  
  if (file.name.endsWith('.csv')) {
    parseCSVFile(file, onSuccess, onError);
  } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
    parseExcelFile(file, onSuccess, onError);
  } else if (file.name.endsWith('.pdf')) {
    parsePDFFile(file, onSuccess, onError);
  } else {
    onError('Unsupported file format');
  }
};
