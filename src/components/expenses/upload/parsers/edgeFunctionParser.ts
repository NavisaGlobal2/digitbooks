
import { ParsedTransaction } from "./types";

/**
 * Parse a bank statement file using the Supabase Edge Function
 * Server-side processing only, no client-side parsing
 */
export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  preferredProvider?: string
): Promise<void> => {
  try {
    // Create form data with the file and preferences
    const formData = new FormData();
    formData.append('file', file);
    
    if (preferredProvider) {
      formData.append('preferredProvider', preferredProvider);
    }
    
    formData.append('fileName', file.name);
    formData.append('context', 'general');
    
    console.log(`Processing ${file.name} (${file.type}, ${file.size} bytes) via edge function`);
    
    // Get the current session token
    const { supabase } = await import("@/integrations/supabase/client");
    
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please sign in to continue.");
    }
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('parse-bank-statement-ai', {
      body: formData,
    });
    
    if (error) {
      console.error("Edge function error:", error);
      onError(error.message || "Error processing file");
      return;
    }
    
    if (!data || !data.transactions || !Array.isArray(data.transactions) || data.transactions.length === 0) {
      onError("No transactions found in file");
      return;
    }
    
    console.log("Received response from edge function:", data);
    
    // Map the transactions to the expected format, preserving original data
    const transactions = data.transactions.map((tx: any) => {
      // Initialize a parsed transaction with defaults
      const parsedTransaction: ParsedTransaction = {
        id: tx.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
        date: tx.date || new Date().toISOString(),
        description: tx.description || "",
        amount: 0,
        type: tx.type || "credit", // Default to "credit" if no type specified (will be updated below)
        selected: false,
        category: "",
        source: tx.source || "",
        // Preserve the original date format if available
        originalDate: tx.originalDate || tx.date
      };
      
      // Handle amount based on what's available
      if (tx.originalAmount !== undefined) {
        // If we have an original amount string, preserve it for display
        parsedTransaction.originalAmount = tx.originalAmount;
        
        // Also try to parse a numeric amount for calculations
        if (tx.amount !== undefined && typeof tx.amount === 'number') {
          parsedTransaction.amount = tx.amount;
        } else {
          // Try to convert original amount to number if needed
          let numAmount = 0;
          if (typeof tx.originalAmount === 'number') {
            numAmount = tx.originalAmount;
          } else if (typeof tx.originalAmount === 'string') {
            numAmount = parseFloat(tx.originalAmount.replace(/[^\d.-]/g, '') || '0');
          }
          parsedTransaction.amount = numAmount;
        }
      } else if (tx.amount !== undefined) {
        // If we only have the processed amount
        parsedTransaction.amount = typeof tx.amount === 'number' ? 
          tx.amount : parseFloat(String(tx.amount).replace(/[^\d.-]/g, '') || '0');
      }
      
      // Set transaction type based on what's available
      if (tx.type) {
        parsedTransaction.type = tx.type === "debit" || tx.type === "credit" ? 
          tx.type : (parsedTransaction.amount < 0 ? "debit" : "credit");
      } else {
        // Infer from amount if no explicit type
        parsedTransaction.type = parsedTransaction.amount < 0 ? "debit" : "credit";
      }
      
      // Pre-select debits by default
      parsedTransaction.selected = parsedTransaction.type === "debit" || 
                                   parsedTransaction.amount < 0;
      
      // For Excel files processed directly, preserve all original fields
      if (data.preservedOriginalFormat) {
        // Copy all original_* fields to keep the raw data
        for (const key in tx) {
          if (key.startsWith('original_') || key === 'preservedColumns') {
            parsedTransaction[key] = tx[key];
          }
        }
        
        // If we have preserved columns, keep those as well
        if (tx.preservedColumns) {
          parsedTransaction.preservedColumns = tx.preservedColumns;
        }
      }
      
      return parsedTransaction;
    });
    
    console.log(`Successfully parsed ${transactions.length} transactions, preserving original format: ${!!data.preservedOriginalFormat}`);
    onSuccess(transactions);
    
  } catch (error: any) {
    console.error("Error in parseViaEdgeFunction:", error);
    onError(error.message || "Unexpected error processing file");
  }
};
