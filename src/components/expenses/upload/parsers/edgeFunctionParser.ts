
import { ParsedTransaction } from "./types";
import { parseWithEdgeFunction } from './api/parseWithEdgeFunction';

/**
 * Parse a bank statement file using the Supabase Edge Function
 * Currently limited to CSV files only
 */
export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  preferredProvider?: string
): Promise<void> => {
  // Check if file is CSV
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  
  if (fileExt !== 'csv') {
    onError('Only CSV files are currently supported. Please upload a CSV file.');
    return;
  }
  
  // Proceed with edge function parsing for CSV files
  return parseWithEdgeFunction(file, onSuccess, onError, preferredProvider);
};
