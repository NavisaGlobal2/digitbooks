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
      // Get transaction amount and type, handling different formats
      let amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount).replace(/[^\d.-]/g, '') || '0');
      let type = tx.type || (amount < 0 ? "debit" : "credit");
      
      // Construct a parsed transaction with original data preserved
      const parsedTransaction: ParsedTransaction = {
        id: tx.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
        date: tx.date || new Date().toISOString(),
        description: tx.description || "",
        amount: amount,
        type: type,
        selected: type === "debit" || amount < 0, // Pre-select debits by default
        category: tx.category || "",
        source: tx.source || "",
        // Preserve the original date format if available
        originalDate: tx.originalDate || tx.date
      };
      
      // For Excel files processed directly, preserve all original fields
      if (data.preservedOriginalFormat) {
        // Copy all original_* fields to keep the raw data
        for (const key in tx) {
          if (key.startsWith('original_')) {
            parsedTransaction[key] = tx[key];
          }
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
