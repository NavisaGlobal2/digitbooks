
import { toast } from "sonner";
import { ParsedTransaction } from "../types";
import { trackFailedConnection } from "./connectionStats";

/**
 * Handle fallback to client-side parsing for CSV files when server-side parsing fails
 */
export const handleCSVFallback = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  error: any
): Promise<boolean> => {
  try {
    console.log("Network error with edge function, attempting client-side CSV fallback");
    
    // Track the network error
    trackFailedConnection('network_error');
    
    // Only try CSV fallback for CSV files
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return onError(
        "Could not connect to the server. Please check your internet connection and try again later."
      );
    }
    
    // Try client-side CSV parsing as fallback
    const { parseCSVFile } = await import("../csvParser");
    
    parseCSVFile(file, (result) => {
      console.log("Fallback CSV parsing successful:", result);
      toast.success("Using local CSV parser as fallback due to server connectivity issues");
      
      // Convert parsed data to the expected format
      const transactions: ParsedTransaction[] = result.transactions.map((row: any) => ({
        id: `fallback-${Math.random().toString(36).substr(2, 9)}`,
        date: row.date || new Date().toISOString(),
        description: row.description || row.payee || row.memo || "Unknown transaction",
        amount: parseFloat(row.amount || row.debit || row.credit || "0"),
        type: (row.amount && parseFloat(row.amount) < 0) || row.debit ? "debit" : "credit",
        selected: (row.amount && parseFloat(row.amount) < 0) || row.debit,
        category: "",
        source: "CSV Fallback Parser"
      }));
      
      onSuccess(transactions);
    }, (fallbackError) => {
      console.error("Fallback CSV parsing also failed:", fallbackError);
      
      // If fallback also fails, show the original network error
      return onError(
        "Could not connect to the server and local parsing also failed. Please check your internet connection and try again later."
      );
    });
    
    // Return true since we're handling it with the fallback
    return true;
    
  } catch (fallbackError) {
    console.error("Error loading CSV parser for fallback:", fallbackError);
    // Return false to let the caller handle the error
    return false;
  }
};
