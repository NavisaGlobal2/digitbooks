
import { ParsedTransaction } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  preferredProvider: string = 'fallback',
  context: string = 'expense'
): Promise<void> => {
  try {
    // Check authentication first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please sign in to continue.");
    }

    // Create form data with the file and preferences
    const formData = new FormData();
    formData.append('file', file);
    formData.append('preferredProvider', preferredProvider);
    formData.append('fileName', file.name);
    formData.append('authToken', sessionData.session.access_token);
    formData.append('context', context);
    formData.append('useEnhancedFallback', 'true'); // Always use enhanced fallback processing

    console.log(`Processing ${file.name} (${file.type}, ${file.size} bytes) via edge function`);

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('parse-bank-statement-ai', {
      body: formData,
    });

    if (error) {
      console.error("Edge function error:", error);
      const handled = onError(error.message || "Error processing file");
      return;
    }

    if (!data || !data.transactions || !Array.isArray(data.transactions) || data.transactions.length === 0) {
      const handled = onError("No transactions found in file");
      return;
    }

    // Log the response from the server for debugging
    console.log("Edge function response:", data);
    console.log("Retrieved transactions count:", data.transactions.length);
    console.log("Processing service used:", data.serviceUsed || "unknown");
    
    // Log account information if available
    if (data.account) {
      console.log("Account information:", data.account);
    }

    // Transform the response to match our expected ParsedTransaction format
    const parsedTransactions: ParsedTransaction[] = data.transactions.map((tx: any) => ({
      id: uuidv4(),
      date: tx.date,
      description: tx.description,
      amount: Math.abs(tx.amount), // Ensure positive amount
      type: tx.type,
      selected: context === 'expense' ? tx.type === 'debit' : tx.type === 'credit', // Pre-select based on context
      batchId: data.batchId || null,
      balance: tx.balance || null,
      source: context === 'revenue' ? tx.source || null : null
    }));

    // Send the transactions to the caller
    onSuccess(parsedTransactions);
    
    // Show success toast with the transaction count and batch ID
    console.log(`Successfully processed ${parsedTransactions.length} transactions with batch ID: ${data.batchId}`);
  } catch (error: any) {
    console.error("Error in parseViaEdgeFunction:", error);
    onError(error.message || "Unexpected error processing file");
  }
};
